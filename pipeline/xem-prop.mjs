/**
 * Xem một prop tự vẽ trong board.prop_tu_ve trước khi dùng.
 *
 *   node pipeline/xem-prop.mjs <du-an> <ten-prop> [--chu "NHÃN"] [--co 1] [--co-canh sat|can|trung|rong|nho] [--thu 0.25]
 *   → out/<du-an>/prop-<ten-prop>.png                (mở bằng tool Read, sửa board, chạy lại)
 *   → out/<du-an>/prop-<ten-prop>-<co-canh>.png      (khi --co-canh: giả lập khung 1920×1080 của cỡ đó)
 *   → out/<du-an>/prop-<ten-prop>[-<co-canh>]-thu.png (khi --thu: bản thu nhỏ theo tỉ lệ, kiểm "nhận ra ở 25%")
 *
 * --co       : `co` sẽ ghi trong board.prop[] (mặc định 1)
 * --co-canh  : nhân thêm DAU_cỡ/330 đúng như renderer (rong 200 / trung 330 / can 560 / sat 900 / nho 110)
 *              và vẽ trong khung đúng cỡ cảnh, cạnh nhân vật cùng cỡ — thấy prop chiếm bao nhiêu khung.
 *              Công thức: px trên màn = px khai × co × DAU_cỡ/330.
 * --thu      : render thêm một ảnh nhỏ (remotion --scale), bỏ lưới và chú thích; prop phải còn nhận ra được.
 *
 * Không có <ten-prop>: liệt kê prop tự vẽ của dự án.
 */
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {coTrinhDuyet} from './moi-truong.mjs';

/**
 * Cổng cho HTTP server mà remotion dựng lên để phục vụ bundle. GHIM vào dải 39xxx:
 * mặc định remotion bò từ 3000 lên, mà 3000 là cổng Platform-BE của workspace này.
 * Đã xảy ra thật (2026-09-11): một tiến trình render treo giữ cổng 3000 gần 16 giờ,
 * stack-up.sh thấy "cổng 3000 có người nghe" nên bỏ qua việc khởi động BE — FE rơi
 * về màn onboarding, nhìn như mất sạch instance và use-case.
 */
const CONG = ['--port', process.env.REMOTION_PORT ?? '39172'];


const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2);
const optCo = new Set(['--chu', '--co', '--co-canh', '--thu']);
const viTri = [];
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    if (optCo.has(args[i])) i++;
    continue;
  }
  viTri.push(args[i]);
}
const [DU_AN, TEN] = viTri;
const opt = (k) => {
  const i = args.indexOf(`--${k}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const CHU = opt('chu');
const CO_BOARD = Number(opt('co') ?? 1);
const CO_CANH = opt('co-canh');
const THU = opt('thu') != null ? Number(opt('thu')) : undefined;
/** bề rộng sọ theo cỡ cảnh — chép từ CO_CANH trong src/v2/board/kieu-board.ts */
const DAU = {rong: 200, trung: 330, can: 560, sat: 900, nho: 110};

if (!DU_AN) {
  console.error('Dùng: node pipeline/xem-prop.mjs <du-an> <ten-prop> [--chu "NHÃN"] [--co 1] [--co-canh sat|can|trung|rong|nho] [--thu 0.25]');
  process.exit(2);
}
if (CO_CANH && !DAU[CO_CANH]) {
  console.error(`✗ --co-canh "${CO_CANH}" không hợp lệ. Chọn: ${Object.keys(DAU).join(', ')}`);
  process.exit(2);
}
if (THU != null && !(THU > 0 && THU <= 1)) {
  console.error('✗ --thu phải trong (0, 1], ví dụ 0.25');
  process.exit(2);
}
const boardPath = path.join(ROOT, `src/projects/${DU_AN}/board.json`);
if (!existsSync(boardPath)) {
  console.error(`✗ không có ${boardPath}`);
  process.exit(1);
}
const board = JSON.parse(readFileSync(boardPath, 'utf8'));
const tuVe = board.prop_tu_ve ?? {};
if (!TEN) {
  const ten = Object.keys(tuVe);
  console.log(ten.length ? ten.map((t) => `  ${t} — ${tuVe[t].moTa ?? ''}`).join('\n') : '  (dự án chưa có prop tự vẽ)');
  process.exit(0);
}
if (!tuVe[TEN]) {
  console.error(`✗ board.prop_tu_ve không có "${TEN}". Có: ${Object.keys(tuVe).join(', ') || '(trống)'}`);
  process.exit(1);
}
const outDir = path.join(ROOT, `out/${DU_AN}`);
mkdirSync(outDir, {recursive: true});

const co = CO_CANH ? CO_BOARD * (DAU[CO_CANH] / 330) : CO_BOARD;
const mau = tuVe[TEN];
if (CO_CANH) {
  const caoMan = Math.round(mau.cao * co);
  console.log(`  ${TEN} khai ${mau.rong}×${mau.cao} px · co board ${CO_BOARD} · cỡ ${CO_CANH} (DAU ${DAU[CO_CANH]}) → co trên màn ${co.toFixed(2)} → cao ${caoMan} px = ${Math.round((caoMan / 1080) * 100)}% khung`);
  const goiY = (0.65 * 1080) / (mau.cao * (DAU[CO_CANH] / 330));
  console.log(`  gợi ý: muốn prop cao ~65% khung ở cỡ ${CO_CANH} thì co ≈ ${goiY.toFixed(2)}`);
}

const CO_TD = coTrinhDuyet(); // dò trình duyệt theo máy (macOS / Linux / Windows)
const render = (props, out, scale) => {
  const propsFile = path.join(os.tmpdir(), `xem-prop-${process.pid}-${path.basename(out)}.json`);
  writeFileSync(propsFile, JSON.stringify(props));
  const a = ['remotion', 'still', 'src/index.ts', 'PropTuVeXem', out, `--props=${propsFile}`, ...CO_TD, ...CONG, '--log=error'];
  if (scale && scale !== 1) a.push(`--scale=${scale}`);
  execFileSync('npx', a, {cwd: ROOT, stdio: 'inherit'});
  console.log(`→ ${path.relative(ROOT, out)}`);
};

const duoi = CO_CANH ? `-${CO_CANH}` : '';
const propsChung = {ten: TEN, mau, chu: CHU, co, coCanh: CO_CANH};
render(propsChung, path.join(outDir, `prop-${TEN}${duoi}.png`));
if (THU != null && THU < 1) {
  render({...propsChung, thu: THU}, path.join(outDir, `prop-${TEN}${duoi}-thu.png`), THU);
  console.log(`  bản thu ${Math.round(THU * 100)}%: mở bằng Read — không nhận ra là gì thì nét quá mảnh / chi tiết quá nhỏ, vẽ to hơn.`);
}
