/**
 * Bóc đường bao biên độ của từng file giọng, mỗi frame một giá trị.
 *
 * Đây là thứ làm nhân vật khớp mồm với tiếng: thay vì đoán, ta đọc thẳng
 * độ to của sóng âm tại đúng frame đang render. Kèm theo:
 *  - `am`   0..1  độ mở miệng
 *  - `nhan` 0..1  điểm nhấn (biên độ vọt lên so với trung bình trượt)
 *  - `nghi` bool  đang ngắt hơi (im trong >6 frame)
 */
import {execFileSync} from 'node:child_process';
import {readFileSync, writeFileSync, existsSync, rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// pipeline/ nằm dưới gốc repo một cấp
const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const LIB = path.join(ROOT, 'node_modules/@remotion/compositor-darwin-arm64');
const ENV = {...process.env, DYLD_LIBRARY_PATH: LIB};
const FPS = 30;
const SR = 16000;

const NAME = process.argv[2] ?? 'ra-truong-vui';
const manifest = JSON.parse(readFileSync(path.join(ROOT, `src/projects/ra-truong/data/${NAME}.generated.json`), 'utf8'));

/**
 * Đọc PCM 16-bit mono về mảng Float32 trong khoảng -1..1.
 * ffmpeg đi kèm Remotion là bản rút gọn, không có muxer `s16le` để ghi ra
 * stdout, nên phải đi vòng qua một file WAV tạm rồi tự bóc header.
 */
const docPcm = (file) => {
  const tmp = path.join(os.tmpdir(), `vo-${process.pid}-${Math.random().toString(36).slice(2)}.wav`);
  execFileSync(
    path.join(LIB, 'ffmpeg'),
    ['-y', '-v', 'error', '-i', file, '-ac', '1', '-ar', String(SR), '-c:a', 'pcm_s16le', tmp],
    {env: ENV}
  );
  const buf = readFileSync(tmp);
  rmSync(tmp);

  // tìm chunk `data` thay vì giả định header dài 44 byte
  let off = 12;
  while (off + 8 <= buf.length) {
    const id = buf.toString('ascii', off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    if (id === 'data') {
      const n = Math.floor(Math.min(size, buf.length - off - 8) / 2);
      const out = new Float32Array(n);
      for (let i = 0; i < n; i++) out[i] = buf.readInt16LE(off + 8 + i * 2) / 32768;
      return out;
    }
    off += 8 + size + (size % 2);
  }
  throw new Error(`Không tìm thấy chunk data trong WAV của ${file}`);
};

const ketQua = {};

for (const ch of manifest.chapters) {
  const file = path.join(ROOT, 'public', ch.audio);
  if (!existsSync(file)) {
    console.warn(`bỏ qua ${ch.id}: không có file`);
    continue;
  }

  const pcm = docPcm(file);
  const mauMoiFrame = Math.round(SR / FPS);
  const soFrame = Math.ceil(pcm.length / mauMoiFrame);

  // RMS từng frame
  const rms = new Float32Array(soFrame);
  for (let i = 0; i < soFrame; i++) {
    let s = 0;
    const a = i * mauMoiFrame;
    const b = Math.min(pcm.length, a + mauMoiFrame);
    for (let k = a; k < b; k++) s += pcm[k] * pcm[k];
    rms[i] = Math.sqrt(s / Math.max(1, b - a));
  }

  // chuẩn hoá theo phân vị 95 để một tiếng bật hơi không kéo tụt cả bài
  const sorted = Array.from(rms).sort((a, b) => a - b);
  const p95 = sorted[Math.floor(sorted.length * 0.95)] || 1e-6;

  const am = new Array(soFrame);
  for (let i = 0; i < soFrame; i++) {
    // căn bậc hai để miệng mở sớm hơn — tai người nghe theo log, mắt nhìn theo hình
    am[i] = Math.min(1, Math.sqrt(Math.max(0, rms[i]) / p95));
  }

  // làm mượt: miệng không nhảy từng frame mà bám theo, lên nhanh xuống chậm
  const muot = new Array(soFrame);
  let v = 0;
  for (let i = 0; i < soFrame; i++) {
    const heSo = am[i] > v ? 0.55 : 0.22;
    v += (am[i] - v) * heSo;
    muot[i] = Math.round(v * 1000) / 1000;
  }

  // trung bình trượt 30 frame -> phát hiện chỗ nhấn giọng
  const nhan = new Array(soFrame);
  const W = 30;
  for (let i = 0; i < soFrame; i++) {
    let s = 0;
    let c = 0;
    for (let k = Math.max(0, i - W); k < Math.min(soFrame, i + W); k++) {
      s += am[k];
      c++;
    }
    const tb = s / Math.max(1, c);
    nhan[i] = Math.round(Math.min(1, Math.max(0, (am[i] - tb) / 0.35)) * 1000) / 1000;
  }

  // khoảng lặng: im dưới ngưỡng liên tục >6 frame (0.2s)
  const nghi = new Array(soFrame).fill(false);
  let dem = 0;
  for (let i = 0; i < soFrame; i++) {
    if (am[i] < 0.12) dem++;
    else dem = 0;
    if (dem > 6) for (let k = i - dem + 1; k <= i; k++) nghi[k] = true;
  }

  ketQua[ch.id] = {am: muot, nhan, nghi};
  const tyLeNghi = (nghi.filter(Boolean).length / soFrame) * 100;
  console.log(`${ch.id.padEnd(14)} ${soFrame} frame · nghỉ ${tyLeNghi.toFixed(0)}%`);
}

const out = path.join(ROOT, `src/projects/ra-truong/data/${NAME}.voice.json`);
writeFileSync(out, JSON.stringify(ketQua));
console.log(`\n-> ${out}`);
