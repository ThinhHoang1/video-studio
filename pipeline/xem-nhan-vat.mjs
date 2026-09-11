/**
 * Xem dàn nhân vật: thư viện + nhân vật tự khai của một dự án.
 *
 *   node pipeline/xem-nhan-vat.mjs            → chỉ thư viện
 *   node pipeline/xem-nhan-vat.mjs <du-an>    → thư viện + board.nhan_vat_tu_ve
 *
 * Vì sao có: nhân vật khai bằng JSON thì không ai hình dung nổi nó ra sao. Dựng
 * cả video rồi mới thấy con chó giống con lợn là mất 40 phút render.
 */
import {spawnSync} from 'node:child_process';
import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {coTrinhDuyet} from './moi-truong.mjs';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const DU_AN = process.argv[2] ?? '';
const PORT = process.env.REMOTION_PORT ?? '39174';

let them = {};
if (DU_AN) {
  const p = path.join(ROOT, `src/projects/${DU_AN}/board.json`);
  if (!existsSync(p)) {
    console.error(`Không thấy ${p}`);
    process.exit(1);
  }
  them = JSON.parse(readFileSync(p, 'utf8')).nhan_vat_tu_ve ?? {};
  const n = Object.keys(them).length;
  console.log(n ? `${DU_AN}: ${n} nhân vật riêng — ${Object.keys(them).join(', ')}` : `${DU_AN}: chưa khai nhân vật riêng nào`);
}

const ra = path.join(ROOT, DU_AN ? `out/${DU_AN}/dan-nhan-vat.png` : 'out/dan-nhan-vat.png');
const args = ['remotion', 'still', 'src/index.ts', 'DanNhanVat', ra, `--port=${PORT}`, '--log=error'];
if (Object.keys(them).length) args.push(`--props=${JSON.stringify({them})}`);
if (!coTrinhDuyet()) console.log('⚠ chưa có trình duyệt cho Remotion — chạy: npx remotion browser ensure');

const r = spawnSync('npx', args, {cwd: ROOT, stdio: 'inherit'});
if (r.status !== 0) process.exit(r.status ?? 1);
console.log(`→ ${path.relative(ROOT, ra)} — MỞ RA XEM trước khi dựng board`);
