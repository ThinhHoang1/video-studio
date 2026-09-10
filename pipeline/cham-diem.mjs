/**
 * Chấm điểm một video đã render so với tham chiếu storytime (JaidenAnimations).
 *
 *   node pipeline/cham-diem.mjs <ten> [duong/dan/video.mp4]
 *
 * Đo TRÊN CHÍNH VIDEO (không tin board): tách khung 12 fps thu nhỏ 64×36 xám →
 * dò cắt bằng chênh lệch pixel, độ dài shot, % khung đứng yên (hold), % khung
 * trắng (nhịp trắng). Cộng số liệu từ board.json (loại shot, góc nhìn, mẫu hành
 * động, bối cảnh, chữ) và mouth.json (nhịp đổi miệng khi nói).
 *
 * Mốc tham chiếu lấy từ docs/nghien-cuu-storytime.md (đo trên oV_m2y3Qw18).
 * Điểm = trung bình các tiêu chí đạt; user đặt ngưỡng nghiệm thu 90%.
 */
import {execFileSync} from 'node:child_process';
import {existsSync, readFileSync, rmSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const TEN = process.argv[2];
if (!TEN) {
  console.error('Thiếu tên dự án. Ví dụ: node pipeline/cham-diem.mjs demo-v2 [media/outbound/demo-v2.mp4]');
  process.exit(2);
}
const LIB = path.join(ROOT, 'node_modules/@remotion/compositor-darwin-arm64');
const FF = path.join(LIB, 'ffmpeg');
const ENV = {...process.env, DYLD_LIBRARY_PATH: LIB};
const doc = (p) => JSON.parse(readFileSync(path.join(ROOT, p), 'utf8'));

const kb = doc(`scripts/${TEN}.json`);
const DU_AN = kb.project ?? TEN;
const video = process.argv[3] ?? `media/outbound/${TEN}.mp4`;
if (!existsSync(path.join(ROOT, video))) {
  console.error(`✗ không có ${video}`);
  process.exit(1);
}

// ── 1. tách khung xám 64×36 @12fps ─────────────────────────────────────
const W = 64;
const H = 36;
const FPSD = 12;
// ffmpeg của Remotion bị cắt muxer rawvideo → ghi AVI chứa khung rawvideo xám rồi tự bóc chunk '00dc'.
const tmpAvi = path.join(os.tmpdir(), `cham-diem-${process.pid}.avi`);
execFileSync(FF, ['-y', '-v', 'error', '-i', path.join(ROOT, video), '-r', String(FPSD), '-vf', `scale=${W}:${H}`, '-pix_fmt', 'gray', '-c:v', 'rawvideo', '-f', 'avi', tmpAvi], {env: ENV});
const avi = readFileSync(tmpAvi);
rmSync(tmpAvi);
const frames = [];
{
  let pos = avi.indexOf('movi') + 4;
  while (pos + 8 <= avi.length) {
    const id = avi.toString('latin1', pos, pos + 4);
    const size = avi.readUInt32LE(pos + 4);
    if (id === 'LIST') { pos += 12; continue; }
    if (id === '00dc' && size === W * H) frames.push(avi.subarray(pos + 8, pos + 8 + size));
    if (id === 'idx1') break;
    pos += 8 + size + (size & 1);
  }
}
const N = frames.length;
const khung = (i) => frames[i];

const diffs = [];
const trang = [];
for (let i = 0; i < N; i++) {
  const a = khung(i);
  let sum = 0;
  let toi = 0;
  // khung trắng = gần như không có pixel mực; nhân vật bé giữa khung vẫn để lại ≥ 8 px tối ở 64×36
  for (let k = 0; k < W * H; k++) if (a[k] < 200) toi++;
  trang.push(toi < 4);
  if (i === 0) continue;
  const b = khung(i - 1);
  for (let k = 0; k < W * H; k++) sum += Math.abs(a[k] - b[k]);
  diffs.push(sum / (W * H));
}
const NGUONG_CAT = 18;
const cuts = [];
diffs.forEach((d, i) => d > NGUONG_CAT && cuts.push((i + 1) / FPSD));
const shot = [];
let truoc = 0;
for (const c of cuts) {
  shot.push(c - truoc);
  truoc = c;
}
shot.push(N / FPSD - truoc);
const sorted = [...shot].sort((a, b) => a - b);
const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
const duoi1 = shot.filter((s) => s < 1).length / Math.max(1, shot.length);
const hold = diffs.filter((d) => d < 1).length / Math.max(1, diffs.length);
const tiLeTrang = trang.filter(Boolean).length / Math.max(1, N);
const thoiLuong = N / FPSD;

// ── 2. từ board ────────────────────────────────────────────────────────
const duongBoard = `src/projects/${DU_AN}/board.json`;
const board = existsSync(path.join(ROOT, duongBoard)) ? doc(duongBoard) : null;
let bd = null;
if (board) {
  const shots = board.chuong.flatMap((c) => c.shots);
  const dien = shots.flatMap((s) => s.dien ?? []);
  const acts = dien.flatMap((d) => d.act ?? []);
  const dem = (arr) => new Set(arr.filter(Boolean)).size;
  bd = {
    soShot: shots.length,
    trucDien: shots.filter((s) => s.loai === 'truc-dien').length / shots.length,
    chu: shots.filter((s) => s.chu?.length).length,
    dang: dem([...dien.map((d) => d.dang), ...acts.map((a) => a.dang)]),
    goc: dem([...dien.map((d) => d.goc), ...acts.map((a) => a.goc)].map((g) => g ?? 'truoc')),
    mau: dem(dien.map((d) => d.mau)),
    boiCanh: dem(shots.map((s) => s.boi_canh)),
    prop: dem(shots.flatMap((s) => (s.prop ?? []).map((p) => p.ten))),
    cam: dem([...dien.map((d) => d.cam), ...acts.map((a) => a.cam)]),
    actMoc: acts.length,
  };
}

// ── 3. từ mouth.json ───────────────────────────────────────────────────
const duongMouth = `src/projects/${DU_AN}/data/${TEN}.mouth.json`;
let doiMieng = null;
if (existsSync(path.join(ROOT, duongMouth))) {
  const m = doc(duongMouth);
  let noi = 0;
  let doi = 0;
  // cùng luật với renderer (src/v2/phim/du-lieu.ts::miengTaiFrame): hình = chữ + biến thể đổi mỗi 2 frame lặp
  const hinh = (f, i) => {
    let k = 0;
    for (let j = i - 1; j >= 0 && f[j] === f[i]; j--) k++;
    return `${f[i]}${Math.floor(k / 2) % 2}`;
  };
  for (const ch of Object.values(m)) {
    const f = ch.frames ?? '';
    for (let i = 1; i < f.length; i++) {
      if (f[i] === 'X') continue;
      noi++;
      if (hinh(f, i) !== hinh(f, i - 1)) doi++;
    }
  }
  doiMieng = noi ? doi / noi : 0;
}

// ── 4. bảng chấm ───────────────────────────────────────────────────────
// [tên, giá trị đo, mốc tham chiếu (chuỗi), hàm đạt]
const tieuChi = [
  ['Shot trung vị (s)', median, '1.25–1.6', (v) => v >= 0.9 && v <= 1.8],
  ['Shot dưới 1 s', duoi1, '≥ 30%', (v) => v >= 0.3],
  ['Khung đứng yên (hold, 12fps)', hold, '60–80%', (v) => v >= 0.55 && v <= 0.85],
  ['Khung trắng (nhịp trắng)', tiLeTrang, '4–12%', (v) => v >= 0.03 && v <= 0.15],
];
if (bd) {
  tieuChi.push(
    ['Nói trực diện (theo shot)', bd.trucDien, '≤ 20%', (v) => v <= 0.2],
    ['Chữ trên màn / 15 s', (bd.chu / thoiLuong) * 15, '≥ 1', (v) => v >= 1],
    ['Số tư thế khác nhau', bd.dang, '≥ 15', (v) => v >= 15],
    ['Số góc nhìn khác nhau', bd.goc, '≥ 3', (v) => v >= 3],
    ['Mẫu hành động dùng', bd.mau, '≥ 5', (v) => v >= 5],
    ['Bối cảnh dựng sẵn dùng', bd.boiCanh, '≥ 3', (v) => v >= 3],
    ['Prop khác nhau', bd.prop, '≥ 12', (v) => v >= 12],
    ['Cầm đồ (số vật)', bd.cam, '≥ 2', (v) => v >= 2],
    ['Mốc act / phút', (bd.actMoc / thoiLuong) * 60, '≥ 40', (v) => v >= 40]
  );
}
if (doiMieng !== null) tieuChi.push(['Miệng đổi hình khi nói (frame)', doiMieng, '≥ 60%', (v) => v >= 0.6]);

const fmt = (v) => (typeof v === 'number' ? (v <= 1 && !Number.isInteger(v) ? `${(v * 100).toFixed(0)}%` : v.toFixed(2).replace(/\.00$/, '')) : String(v));
let dat = 0;
console.log(`\n${TEN} — ${video} — ${thoiLuong.toFixed(1)} s, ${shot.length} shot dò được\n`);
for (const [ten, v, moc, ok] of tieuChi) {
  const d = ok(v);
  dat += d ? 1 : 0;
  console.log(`  ${d ? '✓' : '✗'}  ${ten.padEnd(34)} ${fmt(v).padStart(8)}   mốc ${moc}`);
}
const diem = Math.round((dat / tieuChi.length) * 100);
console.log(`\n  Điểm: ${dat}/${tieuChi.length} = ${diem}%  (ngưỡng nghiệm thu 90%)\n`);
process.exit(diem >= 90 ? 0 : 1);
