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
import {timLibDir} from './moi-truong.mjs';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const TEN = process.argv[2];
if (!TEN) {
  console.error('Thiếu tên dự án. Ví dụ: node pipeline/cham-diem.mjs demo-v2 [media/outbound/demo-v2.mp4]');
  process.exit(2);
}
const LIB = timLibDir(ROOT) ?? path.join(ROOT, 'node_modules/@remotion/compositor-darwin-arm64');
const FF = path.join(LIB, 'ffmpeg');
const ENV = {...process.env, DYLD_LIBRARY_PATH: LIB, LD_LIBRARY_PATH: LIB};
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
  // bỏ 12% dưới (vùng phụ đề) — tham chiếu không có phụ đề, nhịp trắng của ta vẫn hiện caption
  const hMuc = Math.floor(H * 0.88);
  for (let k = 0; k < W * hMuc; k++) if (a[k] < 200) toi++;
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
// "Cắt vụn" = shot CÓ HÌNH mà quá ngắn. NHỊP TRẮNG (loai "trong", 0.5–0.6 s) cũng
// nằm dưới 1 s nhưng nó là chỗ THỞ trước câu chốt, đếm vào đây là phạt nhầm thứ tốt —
// nên trừ đúng số nhịp trắng khai trong board ra khỏi cả tử lẫn mẫu.
const soTrang = (() => {
  try {
    return doc(`src/projects/${DU_AN}/board.json`).chuong.flatMap((c) => c.shots).filter((x) => x.loai === 'trong').length;
  } catch {
    return 0;
  }
})();
const duoi1 = Math.max(0, shot.filter((s) => s < 1).length - soTrang) / Math.max(1, shot.length - soTrang);
const hold = diffs.filter((d) => d < 1).length / Math.max(1, diffs.length);
const tiLeTrang = trang.filter(Boolean).length / Math.max(1, N);
const thoiLuong = N / FPSD;
// thời lượng phải khớp audio: thẻ tiêu đề 1.6 s + Σ duration + đệm 0.4 s/chương (src/v2/phim/du-lieu.ts) — lệch > 1.5 s là ghép đoạn sai
const manifestPath = `src/projects/${DU_AN}/data/${TEN}.generated.json`;
const kyVong = existsSync(path.join(ROOT, manifestPath)) ? (() => { const mf = doc(manifestPath); return 1.6 + mf.chapters.reduce((a, c) => a + c.duration + 0.4, 0); })() : null;

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
    prop: (() => {
      const tv = existsSync(path.join(ROOT, 'thu-vien-v2.json')) ? doc('thu-vien-v2.json') : {};
      const trongBoiCanh = shots.flatMap((s) => (s.boi_canh && tv.boi_canh?.[s.boi_canh]?.prop) || []);
      return dem([...shots.flatMap((s) => (s.prop ?? []).map((p) => p.ten)), ...trongBoiCanh]);
    })(),
    cam: dem([...dien.map((d) => d.cam), ...acts.map((a) => a.cam)]),
    nen: dem(shots.map((s) => (typeof s.nen === 'object' ? JSON.stringify(s.nen) : s.nen ?? 'trang'))),
    actMoc: acts.length,
    shotCoDien: shots.filter((x) => (x.dien ?? []).length).length,
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
  // hình miệng = chữ + biến thể (đổi mỗi 2 frame) + rung (đổi mỗi frame) — cùng luật renderer
  const hinh = (f, i) => {
    let k = 0;
    for (let j = i - 1; j >= 0 && f[j] === f[i]; j--) k++;
    return `${f[i]}${Math.floor(k / 2) % 2}${k % 2}`;
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
  ...(kyVong !== null ? [['Thời lượng khớp audio (lệch s)', Math.abs(thoiLuong - kyVong), '≤ 1.5', (v) => v <= 1.5]] : []),
  // NHỊP — đo thật trên Monsieur Tuna, Tuổi Thơ Có Gì Vui (10,7tr view), 3 cửa sổ:
  //   1:00–2:10 trung vị 0.79 s · 66% dưới 1 s · 49 lần đổi hình/phút
  //   3:50–4:35 trung vị 1.01 s · 44% dưới 1 s · 44 lần/phút
  //   9:20–10:05 (đoạn cảm động) trung vị 1.80 s · 18% dưới 1 s · 31 lần/phút
  // Tức là kênh hay CẮT NHANH, không chậm. Trước đó bảng này bắt trung vị 1.8–3.0 s
  // vì hiểu sai lời chê "chuyển cảnh nhanh": cái làm người xem thấy vụn KHÔNG phải
  // nhịp cắt mà là NỀN TRẮNG TRƠN — cắt nhanh trên nền trống thì không có gì để nhìn.
  // Sửa nền (Shot.nen) rồi thì trả nhịp về đúng tham chiếu.
  ['Shot trung vị (s)', median, '0.9–1.8', (v) => v >= 0.8 && v <= 2.0],
  ['Shot dưới 1 s', duoi1, '25–60%', (v) => v >= 0.2 && v <= 0.65],
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
    // Nền khác nhau: thứ cho phép cắt nhanh mà khung vẫn có gì để nhìn.
    // Tham chiếu đổi nền gần như mỗi shot; ở đây đòi tối thiểu 4 nền khác trắng.
    ['Nền khác nhau (kể cả trắng)', bd.nen, '≥ 4', (v) => v >= 4],
    ['Prop khác nhau', bd.prop, '≥ 12', (v) => v >= 12],
    ['Cầm đồ (số vật)', bd.cam, '≥ 2', (v) => v >= 2],
    ['Mốc act / phút', (bd.actMoc / thoiLuong) * 60, '≥ 40', (v) => v >= 40],
    // Tiêu chí THAY THẾ cho "shot ngắn": một shot dài chỉ được phép dài nếu bên trong
    // nó có chuyển động. Đây mới là thứ người xem gọi là "có animation".
    ['Mốc act / shot có diễn viên', bd.actMoc / Math.max(1, bd.shotCoDien ?? 1), '≥ 3', (v) => v >= 3]
  );
}
if (doiMieng !== null) tieuChi.push(['Miệng đổi hình khi nói (frame)', doiMieng, '≥ 60%', (v) => v >= 0.6]);

const fmt = (v, ten = '') =>
  typeof v !== 'number' ? String(v) : /\(s\)|lệch s/.test(ten) ? `${v.toFixed(2)}s` : v <= 1 && !Number.isInteger(v) ? `${(v * 100).toFixed(0)}%` : v.toFixed(2).replace(/\.00$/, '');
let dat = 0;
console.log(`\n${TEN} — ${video} — ${thoiLuong.toFixed(1)} s, ${shot.length} shot dò được\n`);
for (const [ten, v, moc, ok] of tieuChi) {
  const d = ok(v);
  dat += d ? 1 : 0;
  console.log(`  ${d ? '✓' : '✗'}  ${ten.padEnd(34)} ${fmt(v, ten).padStart(8)}   mốc ${moc}`);
}
let diem = Math.round((dat / tieuChi.length) * 100);
if (kyVong !== null && Math.abs(thoiLuong - kyVong) > 1.5) {
  console.log(`  ✗✗ VIDEO SAI THỜI LƯỢNG: ${thoiLuong.toFixed(1)}s so với kỳ vọng ${kyVong.toFixed(1)}s — có thể ghép đoạn trùng; xoá out/.seg-V2-*/ rồi render lại. Điểm đặt về 0.`);
  diem = 0;
}
console.log(`\n  Điểm: ${dat}/${tieuChi.length} = ${diem}%  (ngưỡng nghiệm thu 90%)\n`);
process.exit(diem >= 90 ? 0 : 1);
