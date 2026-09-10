/**
 * Render đúng khung của MỘT shot để soát — agent không phải tự tính frame.
 *
 *   node pipeline/xem-shot.mjs <ten> <chuong-id> <say | #index> [--lech 0.3]
 *   node pipeline/xem-shot.mjs <ten> --tat-ca          → 1 khung mỗi shot có nhân vật/prop tự vẽ/bối cảnh (nhiều ảnh, chậm)
 *   node pipeline/xem-shot.mjs <ten> --chon <chuong>:<index>[,<chuong>:<index>...]   → đúng các shot liệt kê (tao-video --soat dùng)
 *   → out/<ten>/shot-<chuong>-<index>.png     (<index> = vị trí shot trong mảng `shots` của chương, đếm từ 0)
 *
 * Mốc shot ước lượng cùng cách với validator (rải ký tự lên frame đang nói của voice.json);
 * --lech là giây cộng thêm từ đầu shot (mặc định 0.3 để qua frame đầu vào khung).
 */
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {coTrinhDuyet} from './moi-truong.mjs';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2);
const CO_GIA_TRI = new Set(['--lech', '--chon']);
const viTri = [];
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    if (CO_GIA_TRI.has(args[i])) i++;
    continue;
  }
  viTri.push(args[i]);
}
const [TEN, CHUONG, MOC] = viTri;
const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? Number(args[i + 1]) : d; };
const LECH = opt('lech', 0.3);
const TAT_CA = args.includes('--tat-ca');
const iChon = args.indexOf('--chon');
/** {chuong: Set<index>} khi --chon */
const CHON = iChon >= 0 ? (args[iChon + 1] ?? '').split(',').filter(Boolean).reduce((o, m) => {
  const [c, i] = m.split(':');
  (o[c] ??= new Set()).add(Number(i));
  return o;
}, {}) : null;
if (!TEN || (!TAT_CA && !CHON && (!CHUONG || !MOC))) {
  console.error('Dùng: node pipeline/xem-shot.mjs <ten> <chuong-id> <say|#index> [--lech 0.3]   |   node pipeline/xem-shot.mjs <ten> --tat-ca   |   node pipeline/xem-shot.mjs <ten> --chon <chuong>:<i>,...');
  process.exit(2);
}
const FPS = 30, INTRO = 1.6, DEM = 0.4;
const doc = (p) => JSON.parse(readFileSync(path.join(ROOT, p), 'utf8'));
const kb = doc(`scripts/${TEN}.json`);
const DU_AN = kb.project ?? TEN;
const mf = doc(`src/projects/${DU_AN}/data/${TEN}.generated.json`);
const voice = existsSync(path.join(ROOT, `src/projects/${DU_AN}/data/${TEN}.voice.json`)) ? doc(`src/projects/${DU_AN}/data/${TEN}.voice.json`) : {};
const board = doc(`src/projects/${DU_AN}/board.json`);
const chuan = (s) => String(s ?? '').toLowerCase().replace(/[.,!?;:"'…—–-]/g, '').replace(/[“”‘’]/g, '').replace(/\s+/g, ' ').trim();

/** giây bắt đầu (trong phim) của từng chương */
// thẻ tiêu đề (INTRO) đứng SAU chương mo-bai nếu có, không thì đứng đầu — cùng luật src/v2/phim/phim-v2.tsx
const batDau = {};
let acc = 0;
const viTriIntro = mf.chapters[0]?.id === 'mo-bai' ? 1 : 0;
mf.chapters.forEach((ch, i) => { if (i === viTriIntro) acc += INTRO; batDau[ch.id] = acc; acc += ch.duration + DEM; });

/** ước lượng giây của mốc `say` trong chương — cùng thuật toán validator/renderer */
const mocGiay = (ch, say, viTriTruoc) => {
  const voChuan = chuan(ch.vo);
  const kim = chuan(say);
  let vt = voChuan.indexOf(kim, viTriTruoc.v);
  if (vt === -1) vt = voChuan.indexOf(kim);
  if (vt === -1) return null;
  viTriTruoc.v = vt + 1;
  const p = vt / Math.max(1, voChuan.length);
  const nghi = voice[ch.id]?.nghi;
  if (!nghi?.length) return p * ch.duration;
  const dangNoi = nghi.map((n, i) => (n ? -1 : i)).filter((i) => i >= 0);
  const fps = nghi.length / ch.duration;
  return dangNoi[Math.min(dangNoi.length - 1, Math.floor(p * dangNoi.length))] / fps;
};

const CO_TD = coTrinhDuyet(); // dò trình duyệt theo máy (macOS / Linux / Windows)
const outDir = path.join(ROOT, `out/${TEN}`);
mkdirSync(outDir, {recursive: true});
const render = (frame, out) => {
  execFileSync('npx', ['remotion', 'still', 'src/index.ts', `V2-${TEN}`, out, '--frame', String(frame), ...CO_TD, '--log=error'], {cwd: ROOT, stdio: 'inherit'});
  console.log(`→ ${path.relative(ROOT, out)}  (frame ${frame})`);
};

const viec = [];
for (const bc of board.chuong) {
  const ch = mf.chapters.find((c) => c.id === bc.id);
  if (!ch) continue;
  if (CHON ? !CHON[bc.id] : !TAT_CA && bc.id !== CHUONG) continue;
  const viTri = {v: 0};
  bc.shots.forEach((s, i) => {
    const giay = typeof s.tai === 'number' ? s.tai : s.say ? mocGiay(ch, s.say, viTri) : null;
    if (giay === null) return;
    const khop = CHON
      ? CHON[bc.id].has(i)
      : TAT_CA
        ? (s.dien?.length || s.boi_canh || (s.prop ?? []).some((p) => board.prop_tu_ve?.[p.ten]))
        : MOC.startsWith('#') ? i === Number(MOC.slice(1)) : chuan(s.say ?? '') === chuan(MOC) || (s.say ?? '').includes(MOC);
    if (khop) viec.push({frame: Math.round((batDau[bc.id] + giay + LECH) * FPS), out: path.join(outDir, `shot-${bc.id}-${i}.png`), say: s.say ?? `tai=${s.tai}`});
  });
}
if (!viec.length) { console.error('✗ không tìm thấy shot khớp'); process.exit(1); }
for (const v of viec) { console.log(`shot "${v.say}"`); render(v.frame, v.out); }
