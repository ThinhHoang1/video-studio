/**
 * Xem dàn nhân vật: thư viện + nhân vật tự khai của một dự án.
 *
 *   node pipeline/xem-nhan-vat.mjs            → chỉ thư viện
 *   node pipeline/xem-nhan-vat.mjs <du-an>    → thư viện + board.nhan_vat_tu_ve
 *
 * Vì sao có: nhân vật khai bằng JSON thì không ai hình dung nổi nó ra sao. Dựng
 * cả video rồi mới thấy con chó giống con lợn là mất 40 phút render.
 */
import {execFileSync, spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync} from 'node:fs';
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

const thuMuc = path.join(ROOT, DU_AN ? `out/${DU_AN}` : 'out');
mkdirSync(thuMuc, {recursive: true});
if (!coTrinhDuyet()) console.log('⚠ chưa có trình duyệt cho Remotion — chạy: npx remotion browser ensure');

const ve = (comp, ra, props) => {
  const args = ['remotion', 'still', 'src/index.ts', comp, ra, `--port=${PORT}`, '--log=error'];
  if (props) args.push(`--props=${JSON.stringify(props)}`);
  return spawnSync('npx', args, {cwd: ROOT, stdio: 'inherit'}).status === 0;
};

// Bảng gộp: xem một phát cả dàn để so tương quan cỡ và màu.
const bang = path.join(thuMuc, 'dan-nhan-vat.png');
if (!ve('DanNhanVat', bang, Object.keys(them).length ? {them} : null)) process.exit(1);

/**
 * Ảnh RIÊNG từng nhân vật. Bảng gộp thu nhỏ trên dashboard thì mỗi con chỉ còn
 * vài chục pixel — nhìn không ra con gì, đó đúng là lời chê đã nhận. Mỗi nhân vật
 * một file thì dashboard xếp được thành lưới thẻ, bấm vào xem to.
 */
const {KIEU_TEN} = JSON.parse(
  execFileSync(process.execPath, ['-e', `
    const {readFileSync}=require('node:fs');
    const src=readFileSync(${JSON.stringify(path.join(ROOT, 'src/v2/rig/kieu.ts'))},'utf8');
    const i=src.indexOf('export const KIEU');
    const ten=[...src.slice(i).matchAll(/^  '?([a-z0-9-]+)'?: \\{/gm)].map(m=>m[1]);
    console.log(JSON.stringify({KIEU_TEN: ten}));
  `], {encoding: 'utf8'})
);

const moi = [...KIEU_TEN, ...Object.keys(them)];
const rieng = [];
for (const ten of moi) {
  const ra = path.join(thuMuc, `nv-${ten}.png`);
  if (ve('MotNhanVat', ra, {ma: ten, them})) rieng.push(ten);
  else console.log(`  ⚠ không vẽ được ${ten}`);
}

console.log(`→ ${path.relative(ROOT, bang)} + ${rieng.length} ảnh riêng (nv-*.png) — MỞ RA XEM trước khi dựng board`);
