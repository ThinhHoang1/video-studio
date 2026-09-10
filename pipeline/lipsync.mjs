/**
 * Lip-sync tự động: mp3 giọng đọc → chuỗi hình miệng theo frame.
 *
 *   node pipeline/lipsync.mjs <ten-kich-ban> [--fps 30] [--hold 1] [--out <thu-muc>] [--lam-lai]
 *
 * Với mỗi chương trong src/projects/<du-an>/data/<ten>.generated.json:
 *   mp3 → WAV 16 kHz mono (ffmpeg của Remotion, rhubarb không đọc mp3)
 *       → tools/rhubarb/rhubarb -r phonetic -f json --extendedShapes GHX
 *       → quantize về lưới frame (FPS của repo; HOLD=2 nếu muốn "on twos")
 *       → ghi src/projects/<du-an>/data/<ten>.mouth.json
 *
 * Dạng file ra: { [idChuong]: {sig, fps, hold, duration, cues, frames, rle} }
 *   frames : chuỗi ký hiệu mỗi frame một chữ, vd "XXBBCAAX…" (9 ký hiệu X A B C D E F G H)
 *   rle    : [[frameBatDau, kyHieu], …] cùng dữ liệu nhưng nén theo đoạn
 *   cues   : số cue rhubarb trả về (trước khi quantize)
 *   sig    : sha1(mp3) + version rhubarb + tham số → chương chưa đổi thì lấy lại từ file cũ
 *
 * Rig (src/v2/rig/mieng.tsx) chỉ tra bảng theo ký hiệu, không cần biết gì thêm.
 * Cách tải rhubarb: tools/README.md. Đặt env RHUBARB để dùng binary chỗ khác.
 */
import {execFileSync} from 'node:child_process';
import {readFileSync, writeFileSync, existsSync, mkdirSync, rmSync} from 'node:fs';
import {createHash} from 'node:crypto';
import os from 'node:os';
import path from 'node:path';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const LIB = path.join(ROOT, 'node_modules/@remotion/compositor-darwin-arm64');
const FFMPEG = path.join(LIB, 'ffmpeg');
// ffmpeg của Remotion cần DYLD_LIBRARY_PATH trỏ vào chính thư mục của nó (ARCHITECTURE.md)
const ENV = {...process.env, DYLD_LIBRARY_PATH: LIB};
const RHUBARB = process.env.RHUBARB ?? path.join(ROOT, 'tools/rhubarb/rhubarb');

// ── tham số dòng lệnh ──────────────────────────────────────────────────
const args = process.argv.slice(2);
const TEN = args.find((a) => !a.startsWith('--'));
const opt = (k, macDinh) => {
  const i = args.indexOf(`--${k}`);
  return i >= 0 ? args[i + 1] : macDinh;
};
const FPS = Number(opt('fps', 30));
const HOLD = Number(opt('hold', 1));
const OUT_DIR = opt('out', null);
const LAM_LAI = args.includes('--lam-lai');

if (!TEN) {
  console.error('Thiếu tên kịch bản. Ví dụ: node pipeline/lipsync.mjs tinh-dau');
  process.exit(2);
}
if (!Number.isInteger(FPS) || FPS <= 0 || !Number.isInteger(HOLD) || HOLD <= 0) {
  console.error(`--fps và --hold phải là số nguyên dương (nhận fps=${FPS}, hold=${HOLD})`);
  process.exit(2);
}
if (!existsSync(RHUBARB)) {
  console.error(`Không thấy rhubarb ở ${RHUBARB}. Cách tải: tools/README.md (hoặc đặt env RHUBARB).`);
  process.exit(2);
}
if (!existsSync(FFMPEG)) {
  console.error(`Không thấy ffmpeg của Remotion ở ${FFMPEG}. Chạy npm install trước.`);
  process.exit(2);
}

// ── đầu vào ────────────────────────────────────────────────────────────
const duongKichBan = path.join(ROOT, `scripts/${TEN}.json`);
if (!existsSync(duongKichBan)) {
  console.error(`Không có scripts/${TEN}.json`);
  process.exit(1);
}
const kichBan = JSON.parse(readFileSync(duongKichBan, 'utf8'));
const DU_AN = kichBan.project ?? TEN.replace(/-vui$|-buon$/, '');
const duongManifest = path.join(ROOT, `src/projects/${DU_AN}/data/${TEN}.generated.json`);
if (!existsSync(duongManifest)) {
  console.error(`Chưa sinh giọng: không có src/projects/${DU_AN}/data/${TEN}.generated.json. Chạy: node pipeline/tts-gemini.mjs ${TEN}`);
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(duongManifest, 'utf8'));

const fileRa = OUT_DIR
  ? path.join(OUT_DIR, `${TEN}.mouth.json`)
  : path.join(ROOT, `src/projects/${DU_AN}/data/${TEN}.mouth.json`);
mkdirSync(path.dirname(fileRa), {recursive: true});

const version = execFileSync(RHUBARB, ['--version']).toString().trim();
const cu = !LAM_LAI && existsSync(fileRa) ? JSON.parse(readFileSync(fileRa, 'utf8')) : {};

// ── các bước ───────────────────────────────────────────────────────────

/** Rhubarb chỉ nhận WAV/OGG. 16 kHz mono là chuẩn đã chốt (48 kHz cho kết quả lệch 8,6% frame). */
const sangWav = (mp3) => {
  const tmp = path.join(os.tmpdir(), `lipsync-${process.pid}-${Math.random().toString(36).slice(2)}.wav`);
  execFileSync(FFMPEG, ['-y', '-v', 'error', '-i', mp3, '-ac', '1', '-ar', '16000', '-c:a', 'pcm_s16le', tmp], {env: ENV});
  return tmp;
};

/**
 * Quantize cue → frame. Mỗi ô (HOLD frame) lấy hình chiếm NHIỀU THỜI GIAN NHẤT
 * trong ô, không lấy mẫu tại một điểm: lấy mẫu điểm nuốt cue ngắn (A ngậm môi
 * 40-80 ms) — đo trên cho-ngoi mất 2/26 cue A khi hold=2, lấy trội chỉ mất 1/26.
 * Ô không có cue nào (đuôi file) → X.
 */
const quantize = (cues, duration) => {
  const n = Math.round(duration * FPS);
  const frames = new Array(n);
  for (let f = 0; f < n; f += HOLD) {
    const a = f / FPS;
    const b = a + HOLD / FPS;
    const dem = {};
    for (const c of cues) {
      const chong = Math.min(b, c.end) - Math.max(a, c.start);
      if (chong > 0) dem[c.value] = (dem[c.value] ?? 0) + chong;
    }
    const hinh = Object.keys(dem).length ? Object.entries(dem).sort((x, y) => y[1] - x[1])[0][0] : 'X';
    for (let k = f; k < Math.min(n, f + HOLD); k++) frames[k] = hinh;
  }
  const rle = [];
  frames.forEach((h, f) => {
    if (!rle.length || rle[rle.length - 1][1] !== h) rle.push([f, h]);
  });
  return {frames: frames.join(''), rle};
};

// ── chạy ───────────────────────────────────────────────────────────────
const ketQua = {};
let tongRhubarbMs = 0;
let tongCueNoi = 0;
let tongGiayNoi = 0;
let soChuongMoi = 0;
let soChuongCache = 0;

for (const ch of manifest.chapters) {
  const mp3 = path.join(ROOT, 'public', ch.audio);
  if (!existsSync(mp3)) {
    console.warn(`  ⚠  bỏ qua ${ch.id}: không có public/${ch.audio}`);
    continue;
  }
  const sig = createHash('sha1')
    .update(readFileSync(mp3))
    .update(`|${version}|phonetic|GHX|${FPS}|${HOLD}`)
    .digest('hex')
    .slice(0, 12);

  if (cu[ch.id]?.sig === sig) {
    ketQua[ch.id] = cu[ch.id];
    soChuongCache++;
    console.log(`  ${ch.id.padEnd(12)} cache`);
    continue;
  }

  const wav = sangWav(mp3);
  const t0 = performance.now();
  let json;
  try {
    json = execFileSync(RHUBARB, ['-r', 'phonetic', '-f', 'json', '--extendedShapes', 'GHX', '-q', wav]).toString();
  } finally {
    rmSync(wav, {force: true});
  }
  const ms = performance.now() - t0;
  tongRhubarbMs += ms;
  soChuongMoi++;

  const {mouthCues, metadata} = JSON.parse(json);
  const q = quantize(mouthCues, metadata.duration);
  const noi = mouthCues.filter((c) => c.value !== 'X');
  const giayNoi = noi.reduce((s, c) => s + c.end - c.start, 0);
  tongCueNoi += noi.length;
  tongGiayNoi += giayNoi;

  ketQua[ch.id] = {sig, fps: FPS, hold: HOLD, duration: metadata.duration, cues: mouthCues.length, ...q};
  console.log(
    `  ${ch.id.padEnd(12)} ${metadata.duration.toFixed(1).padStart(5)}s  ${String(mouthCues.length).padStart(3)} cue  ` +
      `${(noi.length / giayNoi).toFixed(1)} cue/s nói  rhubarb ${(ms / 1000).toFixed(2)}s`
  );
}

writeFileSync(fileRa, JSON.stringify(ketQua));
const kb = readFileSync(fileRa).length / 1024;
const tomTat = [`${Object.keys(ketQua).length} chương (${soChuongMoi} mới, ${soChuongCache} cache)`];
if (soChuongMoi) tomTat.push(`rhubarb tổng ${(tongRhubarbMs / 1000).toFixed(1)}s`, `${(tongCueNoi / tongGiayNoi).toFixed(2)} cue/s nói trung bình`);
console.log(`\n✓ ${tomTat.join(' · ')} → ${path.relative(ROOT, fileRa)} (${kb.toFixed(0)} KB)`);
