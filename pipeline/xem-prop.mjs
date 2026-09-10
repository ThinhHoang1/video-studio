/**
 * Xem một prop tự vẽ trong board.prop_tu_ve trước khi dùng.
 *
 *   node pipeline/xem-prop.mjs <du-an> <ten-prop> [--chu "NHÃN"]
 *   → out/<du-an>/prop-<ten-prop>.png   (mở bằng tool Read, sửa board, chạy lại)
 *
 * Không có <ten-prop>: liệt kê prop tự vẽ của dự án.
 */
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const [DU_AN, TEN] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const iChu = process.argv.indexOf('--chu');
const CHU = iChu >= 0 ? process.argv[iChu + 1] : undefined;
if (!DU_AN) {
  console.error('Dùng: node pipeline/xem-prop.mjs <du-an> <ten-prop> [--chu "NHÃN"]');
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
const propsFile = path.join(os.tmpdir(), `xem-prop-${process.pid}.json`);
writeFileSync(propsFile, JSON.stringify({ten: TEN, mau: tuVe[TEN], chu: CHU}));
const out = path.join(outDir, `prop-${TEN}.png`);
execFileSync(
  'npx',
  ['remotion', 'still', 'src/index.ts', 'PropTuVeXem', out, `--props=${propsFile}`, '--browser-executable', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '--log=error'],
  {cwd: ROOT, stdio: 'inherit'}
);
console.log(`→ ${path.relative(ROOT, out)}`);
