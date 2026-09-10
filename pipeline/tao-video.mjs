/**
 * MỘT LỆNH cho agent: chạy toàn bộ pipeline V2 từ kịch bản tới video trong media/outbound/.
 *
 *   node pipeline/tao-video.mjs <ten> [--tu <buoc>] [--den <buoc>] [--soat]
 *
 * Các bước (idempotent — bước nào đã có kết quả thì bỏ qua):
 *   1 kich-ban   kiểm scripts/<ten>.json (trường bắt buộc, số từ, project)
 *   2 giong      node pipeline/tts-gemini.mjs      (cần GEMINI_API_KEYS trong .env)
 *   3 nhip       node pipeline/analyze-voice.mjs
 *   4 mieng      node pipeline/lipsync.mjs
 *   5 board      đòi src/projects/<du-an>/board.json — chưa có thì DỪNG và in hướng dẫn
 *   6 kiem       node pipeline/kiem-tra-v2.mjs      (lỗi → dừng)
 *   7 thong-ke   node pipeline/thong-ke-board.mjs   (cảnh báo, không chặn)
 *   8 dang-ky    node pipeline/dang-ky.mjs          (sinh composition V2-<ten>)
 *   9 soat       render 6 khung thử ra out/<ten>/soat.jpg (chỉ khi --soat)
 *  10 render     ./render-segments.sh V2-<ten> media/outbound/<ten>.mp4
 *  11 cham       node pipeline/cham-diem.mjs + ghi media/outbound/<ten>.md
 *
 * Thoát 0 khi có video và điểm ≥ 90; 1 khi có video nhưng điểm thấp; 3 khi dừng chờ board.
 */
import {execFileSync, spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';

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
  for (const c of kb.chapters ?? []) {
    const n = (c.vo ?? '').split(/\s+/).length;
    if (n < 30 || n > 110) console.log(`  ⚠ chương ${c.id}: ${n} từ (khuyên 45–70 cho storytime)`);
  }
  console.log(`  ✓ ${kb.chapters.length} chương, giọng ${kb.voice}`);
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
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (chay('soat') && SOAT) {
  tieuDe('9/11 khung thử');
  const outDir = path.join(ROOT, `out/${TEN}`);
  mkdirSync(outDir, {recursive: true});
  const total = Math.round(kb.chapters.length * 0.4 * 30 + 60 + kb.chapters.reduce((s, c) => s + (c.vo.split(/\s+/).length / 3.3) * 30, 0));
  const frames = [0.08, 0.22, 0.38, 0.55, 0.72, 0.9].map((k) => Math.floor(total * k));
  for (const f of frames) {
    spawnSync('npx', ['remotion', 'still', 'src/index.ts', `V2-${TEN}`, `out/${TEN}/soat-${f}.png`, '--frame', String(f), '--browser-executable', CHROME, '--log=error'], {cwd: ROOT, stdio: 'inherit'});
  }
  console.log(`  → out/${TEN}/soat-*.png — XEM trước khi render dài`);
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
