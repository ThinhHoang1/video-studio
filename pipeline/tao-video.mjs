/**
 * MỘT LỆNH cho agent: chạy toàn bộ pipeline V2 từ kịch bản tới video trong media/outbound/.
 *
 *   node pipeline/tao-video.mjs <ten> [--tu <buoc>] [--den <buoc>] [--soat] [--bo-cham]
 *
 * Các bước (idempotent — bước nào đã có kết quả thì bỏ qua):
 *   1 kich-ban   kiểm scripts/<ten>.json (trường bắt buộc, project) rồi chạy cổng chấm
 *                pipeline/cham-kich-ban.mjs (số từ, câu dài, sáo ngữ, tiếng Anh trần, rubric tự chấm ≥ 7)
 *                — exit ≠ 0 → dừng; --bo-cham bỏ qua cổng khi người dùng cố ý
 *   2 giong      node pipeline/tts-gemini.mjs      (cần GEMINI_API_KEYS trong .env)
 *   3 nhip       node pipeline/analyze-voice.mjs
 *   4 mieng      node pipeline/lipsync.mjs
 *   5 board      đòi src/projects/<du-an>/board.json — chưa có thì DỪNG và in hướng dẫn
 *   6 kiem       node pipeline/kiem-tra-v2.mjs      (lỗi → dừng)
 *   7 thong-ke   node pipeline/thong-ke-board.mjs   (cảnh báo, không chặn)
 *   8 dang-ky    node pipeline/dang-ky.mjs          (sinh composition V2-<ten>)
 *   9 soat       chọn tối đa 8 shot đáng soát nhất trong board (prop tự vẽ, bối cảnh, ≥ 2 diễn viên,
 *                chữ `the`, cỡ sat) rồi gọi pipeline/xem-shot.mjs --chon → out/<ten>/shot-<chuong>-<i>.png (chỉ khi --soat)
 *  10 render     ./render-segments.sh V2-<ten> media/outbound/<ten>.mp4
 *  11 cham       node pipeline/cham-diem.mjs + ghi media/outbound/<ten>.md
 *
 * Thoát 0 khi có video và điểm ≥ 90; 1 khi có video nhưng điểm thấp; 3 khi dừng chờ board.
 */
import {execFileSync, spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {coTrinhDuyet} from './moi-truong.mjs';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2);
const TEN = args.find((a) => !a.startsWith('--'));
const opt = (k) => {
  const i = args.indexOf(`--${k}`);
  return i >= 0 ? args[i + 1] : undefined;
};
if (!TEN) {
  console.error('Thiếu tên. Ví dụ: node pipeline/tao-video.mjs demo-v2 --soat');
  process.exit(2);
}
const BUOC = ['kich-ban', 'giong', 'nhip', 'mieng', 'board', 'kiem', 'thong-ke', 'dang-ky', 'soat', 'render', 'cham'];
const tu = BUOC.indexOf(opt('tu') ?? 'kich-ban');
const den = BUOC.indexOf(opt('den') ?? 'cham');
const SOAT = args.includes('--soat');
const BO_CHAM = args.includes('--bo-cham');
const chay = (b) => {
  const i = BUOC.indexOf(b);
  return i >= tu && i <= den;
};

// nạp .env cho tts (không in giá trị)
const envFile = path.join(ROOT, '.env');
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, '');
  }
}

const tieuDe = (s) => console.log(`\n━━ ${s} ━━`);
const node = (script, ...a) => {
  const r = spawnSync(process.execPath, [path.join(ROOT, script), ...a], {cwd: ROOT, stdio: 'inherit', env: process.env});
  return r.status ?? 1;
};
const dung = (msg, code = 1) => {
  console.error(`\n✗ ${msg}`);
  process.exit(code);
};

const kb = JSON.parse(readFileSync(path.join(ROOT, `scripts/${TEN}.json`), 'utf8'));
const DU_AN = kb.project;

// 1
if (chay('kich-ban')) {
  tieuDe('1/11 kịch bản');
  if (!DU_AN) dung('kịch bản thiếu trường "project" — V2 bắt buộc (vd "project": "' + TEN + '")');
  if (!kb.voice || !kb.style) dung('kịch bản thiếu voice/style');
  // Kịch bản này ĐÃ thành phim rồi → gần như chắc chắn agent đang định render lại
  // sản phẩm của người khác thay vì viết mới. Chuyện đã xảy ra thật: người dùng bảo
  // "làm video về X", agent thấy scripts/X.json nằm sẵn trong repo nên chạy thẳng
  // pipeline và báo đã xong — ra đúng video cũ, không sáng tạo gì.
  if (existsSync(path.join(ROOT, `media/outbound/${TEN}.mp4`)) && !process.argv.includes('--lam-lai')) {
    dung(
      `"${TEN}" ĐÃ có phim ở media/outbound/${TEN}.mp4 — kịch bản trong scripts/ là VÍ DỤ, không phải bản mẫu để chạy lại.\n` +
        `  Muốn làm video MỚI cùng chủ đề: đặt tên khác (vd ${TEN}-2) và VIẾT LẠI kịch bản — nhân vật khác, tình huống khác, punchline khác.\n` +
        `  Chỉ dựng lại đúng bản cũ (sửa board, đọc lại giọng): thêm cờ --lam-lai`
    );
  }
  console.log(`  ✓ ${kb.chapters.length} chương, giọng ${kb.voice}`);
  if (BO_CHAM) console.log('  ⚠ --bo-cham: bỏ qua cổng chấm kịch bản (pipeline/cham-kich-ban.mjs)');
  else if (node('pipeline/cham-kich-ban.mjs', TEN) !== 0) dung('kịch bản chưa qua cổng chấm — sửa theo dòng ✗ rồi chạy lại (cố ý bỏ qua: --bo-cham)');
}
// 2–4
if (chay('giong')) {
  tieuDe('2/11 giọng đọc');
  if (!process.env.GEMINI_API_KEYS && !process.env.GEMINI_API_KEY) dung('thiếu GEMINI_API_KEYS trong .env');
  mkdirSync(path.join(ROOT, `src/projects/${DU_AN}/data`), {recursive: true});
  if (node('pipeline/tts-gemini.mjs', TEN) !== 0) dung('tts-gemini lỗi (hết hạn mức? xem log)');
}
if (chay('nhip')) {
  tieuDe('3/11 nhịp giọng');
  if (node('pipeline/analyze-voice.mjs', TEN) !== 0) dung('analyze-voice lỗi');
}
if (chay('mieng')) {
  tieuDe('4/11 lip-sync');
  if (node('pipeline/lipsync.mjs', TEN) !== 0) dung('lipsync lỗi (tools/rhubarb có chưa? xem tools/README.md)');
}
// 5
const board = `src/projects/${DU_AN}/board.json`;
if (chay('board')) {
  tieuDe('5/11 bảng phân cảnh');
  if (!existsSync(path.join(ROOT, board))) {
    console.log(`  Chưa có ${board}.`);
    console.log('  Viết theo .claude/skills/tao-video/references/dao-dien.md + src/v2/board/README.md,');
    console.log('  chỉ dùng tên trong thu-vien-v2.json (node pipeline/thu-vien-v2.mjs để cập nhật).');
    console.log(`  Viết xong chạy tiếp: node pipeline/tao-video.mjs ${TEN} --tu kiem`);
    process.exit(3);
  }
  console.log(`  ✓ ${board}`);
}
// 6–7
if (chay('kiem')) {
  tieuDe('6/11 kiểm board');
  node('pipeline/thu-vien-v2.mjs');
  if (node('pipeline/kiem-tra-v2.mjs', TEN) !== 0) dung('board chưa qua kiểm — sửa lỗi ở trên rồi chạy lại --tu kiem');
}
if (chay('thong-ke') && existsSync(path.join(ROOT, 'pipeline/thong-ke-board.mjs'))) {
  tieuDe('7/11 thống kê nhịp');
  node('pipeline/thong-ke-board.mjs', TEN);
}
// 8
if (chay('dang-ky')) {
  tieuDe('8/11 đăng ký composition');
  if (node('pipeline/dang-ky.mjs') !== 0) dung('dang-ky lỗi');
  const r = spawnSync('npx', ['tsc', '--noEmit', '-p', '.'], {cwd: ROOT, stdio: 'inherit'});
  if (r.status !== 0) dung('tsc lỗi — board.json có trường sai kiểu? xem lỗi ở trên');
}
// 9
const CO_TD = coTrinhDuyet(); // dò trình duyệt theo máy (macOS / Linux / Windows)
/**
 * Chọn shot đáng soát: chấm điểm từng shot theo thứ dễ hỏng trên still (prop tự vẽ, bối cảnh,
 * nhiều diễn viên, chữ `the`, cỡ sat), lấy tối đa `toiDa` shot, rải đều các chương
 * (mỗi chương không quá ceil(toiDa / số chương) + 1). Trả về "chuong:index,..." cho xem-shot --chon.
 */
const chonShotSoat = (bd, toiDa = 8) => {
  const ung = [];
  for (const c of bd.chuong ?? []) {
    (c.shots ?? []).forEach((s, i) => {
      if (s.loai === 'trong' || s.loai === 'insert') return;
      let diem = 0;
      const lyDo = [];
      if ((s.prop ?? []).some((p) => bd.prop_tu_ve?.[p.ten])) { diem += 5; lyDo.push('prop tự vẽ'); }
      if (s.boi_canh) { diem += 4; lyDo.push(`bối cảnh ${s.boi_canh}`); }
      if ((s.dien ?? []).length >= 2) { diem += 3; lyDo.push(`${s.dien.length} diễn viên`); }
      if ((s.chu ?? []).some((ch) => ch.kieu === 'the')) { diem += 2; lyDo.push('chữ the'); }
      if (s.co === 'sat' || (!s.co && s.loai === 'dac-ta')) { diem += 2; lyDo.push('cỡ sat'); }
      if ((s.prop ?? []).length) { diem += 1; }
      if ((s.dien ?? []).length) { diem += 1; }
      if ((s.dien ?? []).some((d) => d.cam || d.goc || d.mau)) { diem += 1; lyDo.push('cam/goc/mau'); }
      if (diem > 0) ung.push({chuong: c.id, i, diem, lyDo});
    });
  }
  ung.sort((a, b) => b.diem - a.diem || a.chuong.localeCompare(b.chuong) || a.i - b.i);
  const soChuong = Math.max(1, (bd.chuong ?? []).length);
  const tranChuong = Math.ceil(toiDa / soChuong) + 1;
  const demChuong = {};
  const chon = [];
  for (const u of ung) {
    if (chon.length >= toiDa) break;
    if ((demChuong[u.chuong] ?? 0) >= tranChuong) continue;
    demChuong[u.chuong] = (demChuong[u.chuong] ?? 0) + 1;
    chon.push(u);
  }
  // còn chỗ mà vì trần chương bỏ qua → lấp bằng shot điểm cao nhất còn lại
  for (const u of ung) {
    if (chon.length >= toiDa) break;
    if (!chon.includes(u)) chon.push(u);
  }
  return chon;
};

if (chay('soat') && SOAT) {
  tieuDe('9/11 khung thử');
  mkdirSync(path.join(ROOT, `out/${TEN}`), {recursive: true});
  const bd = JSON.parse(readFileSync(path.join(ROOT, board), 'utf8'));
  const chon = chonShotSoat(bd, 8);
  if (!chon.length) {
    console.log('  board không có shot nào có diễn viên/prop/chữ — không có gì để soát');
  } else {
    for (const u of chon) console.log(`  · ${u.chuong} #${u.i}  (${u.lyDo.join(', ') || 'có hình'})`);
    const danhSach = chon.map((u) => `${u.chuong}:${u.i}`).join(',');
    if (node('pipeline/xem-shot.mjs', TEN, '--chon', danhSach) !== 0) console.log('  ⚠ xem-shot lỗi ở một khung — xem log trên');
    console.log(`  → out/${TEN}/shot-<chuong>-<i>.png — XEM từng ảnh bằng Read trước khi render dài; muốn xem shot khác: node pipeline/xem-shot.mjs ${TEN} <chuong> "<say>"`);
  }
}
// 10
const mp4 = `media/outbound/${TEN}.mp4`;
if (chay('render')) {
  tieuDe('10/11 render');
  const r = spawnSync('bash', ['render-segments.sh', `V2-${TEN}`, mp4], {cwd: ROOT, stdio: 'inherit', env: {...process.env, SEG_LEN: process.env.SEG_LEN ?? '900'}});
  if (r.status !== 0 || !existsSync(path.join(ROOT, mp4))) dung('render lỗi');
}
// 11
if (chay('cham')) {
  tieuDe('11/11 chấm điểm');
  const r = spawnSync(process.execPath, [path.join(ROOT, 'pipeline/cham-diem.mjs'), TEN, mp4], {cwd: ROOT, encoding: 'utf8'});
  process.stdout.write(r.stdout ?? '');
  const diem = Number((r.stdout ?? '').match(/Điểm: \d+\/\d+ = (\d+)%/)?.[1] ?? 0);
  const md = `# ${TEN}.mp4 — ${kb.title ?? TEN}

- Giọng: ${kb.voice} · ${kb.chapters.length} chương · project ${DU_AN}
- Tạo bằng: node pipeline/tao-video.mjs ${TEN}
- Điểm bảng chấm (pipeline/cham-diem.mjs): **${diem}%** (ngưỡng 90)

\`\`\`
${(r.stdout ?? '').trim()}
\`\`\`

Nhạc nền CC BY — ghi công theo public/audio/CREDITS.md khi đăng.
`;
  writeFileSync(path.join(ROOT, `media/outbound/${TEN}.md`), md);
  console.log(`→ ${mp4} + media/outbound/${TEN}.md`);
  process.exit(diem >= 90 ? 0 : 1);
}
