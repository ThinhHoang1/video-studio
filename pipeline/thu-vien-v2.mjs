/**
 * Sinh thu-vien-v2.json — danh mục tên hợp lệ cho bảng phân cảnh V2.
 *
 *   node pipeline/thu-vien-v2.mjs
 *
 * Khác thu-vien.json (viết tay), file này ĐỌC THẲNG TỪ MÃ NGUỒN nên không bao
 * giờ lệch với rig: thêm một tư thế vào tu-the.ts là chạy lại lệnh này xong.
 * Mô tả mỗi mục lấy từ comment cạnh định nghĩa (JSDoc phía trên hoặc `//` cùng dòng).
 *
 *   nhan_vat   keys KIEU          src/v2/rig/kieu.ts
 *   tu_the     keys TU_THE        src/v2/rig/tu-the.ts
 *   mat        type TrangThaiMat  src/v2/rig/mat.tsx
 *   may        type TrangThaiMay  src/v2/rig/mat.tsx
 *   mieng      type HinhMieng     src/v2/rig/mieng.tsx
 *   prop       PROP_TEN           src/v2/board/kieu-board.ts
 *   loai_shot  type LoaiShot      src/v2/board/kieu-board.ts
 *   co_canh    keys CO_CANH       src/v2/board/kieu-board.ts
 *   sfx, nhac, giong_tts          chép từ thu-vien.json
 *
 * pipeline/kiem-tra-v2.mjs đối chiếu board.json với file này.
 */
import {readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const doc = (p) => readFileSync(path.join(ROOT, p), 'utf8');

const NGUON = {
  kieu: 'src/v2/rig/kieu.ts',
  tuThe: 'src/v2/rig/tu-the.ts',
  mat: 'src/v2/rig/mat.tsx',
  mieng: 'src/v2/rig/mieng.tsx',
  board: 'src/v2/board/kieu-board.ts',
  thuVien: 'thu-vien.json',
};

/** cắt khối mã từ `dau` tới dòng đóng `};` (hoặc `] as const;`) đầu tiên */
const khoi = (nguon, dau) => {
  const i = nguon.indexOf(dau);
  if (i < 0) throw new Error(`không thấy "${dau}"`);
  const m = nguon.slice(i).match(/^\};|^\] as const;/m);
  if (!m) throw new Error(`khối "${dau}" không đóng`);
  return nguon.slice(i, i + m.index);
};

/** cắt khối union type từ `export type X =` tới dấu `;` kết thúc (giữ comment `//` sau dấu `;`) */
const khoiType = (nguon, ten) => {
  const m = nguon.match(new RegExp(`export type ${ten} =([\\s\\S]*?;[^\\n]*)`));
  if (!m) throw new Error(`không thấy type ${ten}`);
  return m[1];
};

/** làm sạch comment: bỏ dấu /** *\/ //, gộp khoảng trắng */
const sach = (s) =>
  (s ?? '')
    .replace(/^\s*\/\*\*?|\*\/\s*$/g, '')
    .replace(/^\s*\*\s?/gm, '')
    .replace(/^\s*\/\/\s?/gm, '')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * keys của một object literal `export const X: Record<...> = { ... }`.
 * Mỗi key một dòng: `  key: {…},` hoặc `  'key-co-gach': {…},`; JSDoc đứng ngay trên là mô tả.
 */
const keysObject = (nguon, dau) => {
  const than = khoi(nguon, dau);
  const ra = {};
  const re = /(?:\/\*\*([^*]*(?:\*(?!\/)[^*]*)*)\*\/\s*)?^\s*'?([A-Za-z0-9-]+)'?:\s*\{([^\n]*)/gm;
  for (const m of than.matchAll(re)) {
    const [, jsdoc, key, dongDau] = m;
    ra[key] = {moTa: sach(jsdoc), dongDau};
  }
  return ra;
};

/** literal của một union type, kèm comment `//` sau literal (nếu có) */
const literalUnion = (than) => {
  const ra = {};
  // mỗi literal có thể đứng riêng dòng (`| 'x' // mô tả`) hoặc chung dòng (`'X' | 'A' | …`)
  for (const m of than.matchAll(/'([^']+)'\s*;?(?:\s*\/\/\s*([^\n|]*))?/g)) ra[m[1]] = sach(m[2]);
  return ra;
};

/** comment `//` đứng sau `case 'x':` trong switch — mô tả cho literal không có comment ở type */
const moTaTheoCase = (nguon, lit) => {
  const m = nguon.match(new RegExp(`case '${lit}':(?:\\s*\\{)?[^\\n]*?//\\s*([^\\n]*)`));
  return m ? sach(m[1]) : '';
};

// ── nhân vật ───────────────────────────────────────────────────────────
const nguonKieu = doc(NGUON.kieu);
const nhanVat = {};
for (const [key, {moTa, dongDau}] of Object.entries(keysObject(nguonKieu, 'export const KIEU'))) {
  const ten = dongDau.match(/ten:\s*'([^']+)'/)?.[1] ?? key;
  const mai = dongDau.match(/mai:\s*'([^']+)'/)?.[1];
  const sau = dongDau.match(/sau:\s*'([^']+)'/)?.[1];
  const phuKien = dongDau.match(/phuKien:\s*'([^']+)'/)?.[1];
  const khung = dongDau.match(/khung:\s*'([^']+)'/)?.[1];
  const chiTiet = [];
  if (mai || sau) chiTiet.push(`tóc mái ${mai ?? '?'}, sau ${sau ?? '?'}`);
  if (phuKien && phuKien !== 'khong') chiTiet.push(`phụ kiện ${phuKien}`);
  if (khung === 'phu') chiTiet.push('khung người lớn (3.6 đầu)');
  nhanVat[key] = moTa || [ten, chiTiet.join('; ')].filter(Boolean).join(' — ');
}

// ── tư thế ─────────────────────────────────────────────────────────────
const tuThe = {};
for (const [key, {moTa}] of Object.entries(keysObject(doc(NGUON.tuThe), 'export const TU_THE'))) tuThe[key] = moTa;

// ── mắt, mày ───────────────────────────────────────────────────────────
const nguonMat = doc(NGUON.mat);
const mat = literalUnion(khoiType(nguonMat, 'TrangThaiMat'));
const may = literalUnion(khoiType(nguonMat, 'TrangThaiMay'));
/** mô tả dự phòng cho mày (type không có comment) */
const MO_TA_MAY = {
  khong: 'không vẽ mày (mặc định) — mép mái tóc làm đường mày',
  tuc: 'gạch chéo dày, đầu trong thấp — tức, gắt',
  lo: 'cung cong lên cao — lo, buồn',
  nhiu: 'gấp khúc — nhíu, nghi ngờ',
};
for (const k of Object.keys(mat)) if (!mat[k]) mat[k] = moTaTheoCase(nguonMat, k);
for (const k of Object.keys(may)) if (!may[k]) may[k] = moTaTheoCase(nguonMat, k) || MO_TA_MAY[k] || '';

// ── miệng ──────────────────────────────────────────────────────────────
const nguonMieng = doc(NGUON.mieng);
const mieng = literalUnion(khoiType(nguonMieng, 'HinhMieng'));
/** mô tả dự phòng cho hình miệng không có comment trong mã */
const MO_TA_MIENG = {
  thang: 'gạch ngang — bình thản, không nói',
  mim: 'mím môi — nhịn, chịu đựng',
  'cuoi-nhe': 'cung cong nhẹ lên — hài lòng',
  'cuoi-toe': 'cười toe — nửa ellipse to có răng',
  meu: 'mếu — cung cong xuống, sắp khóc',
  hoang: 'hoảng — miệng răng cưa run',
  o: 'chữ o nhỏ tròn — ngạc nhiên nhẹ',
  smirk: 'nhếch một bên mép — láu cá',
  nghien: 'nghiến răng — dải răng kín, bực',
};
for (const k of Object.keys(mieng)) if (!mieng[k]) mieng[k] = moTaTheoCase(nguonMieng, k) || MO_TA_MIENG[k] || '';
const mangConst = (ten) =>
  [...(nguonMieng.match(new RegExp(`export const ${ten}[^=]*=\\s*\\[([^\\]]*)\\]`))?.[1] ?? '').matchAll(/'([^']+)'/g)].map((m) => m[1]);
const miengLipsync = mangConst('MIENG_LIPSYNC');
const miengCamXuc = mangConst('MIENG_CAM_XUC');

// ── board: prop, loại shot, cỡ cảnh ────────────────────────────────────
const nguonBoard = doc(NGUON.board);
const prop = {};
for (const m of khoi(nguonBoard, 'export const PROP_TEN').matchAll(/'([a-z0-9-]+)',?\s*(?:\/\/\s*([^\n]*))?/g)) prop[m[1]] = sach(m[2]);
const loaiShot = literalUnion(khoiType(nguonBoard, 'LoaiShot'));
const coCanh = {};
for (const [key, {dongDau}] of Object.entries(keysObject(nguonBoard, 'export const CO_CANH'))) {
  const dau = dongDau.match(/dau:\s*([\d.]+)/)?.[1];
  const moTa = dongDau.match(/moTa:\s*'([^']+)'/)?.[1] ?? '';
  coCanh[key] = dau ? `${moTa} (sọ ${dau}px)` : moTa;
}

// ── V2 giai đoạn 2: góc nhìn, bối cảnh, mẫu hành động, đồ cầm ────────────
// Các file này có thể chưa tồn tại khi rig/bối cảnh/act đang được viết → bỏ qua, không lỗi.
const gocNhin = (() => { try { return literalUnion(khoiType(nguonBoard, 'GocNhin')); } catch { return {}; } })();
const keysNeuCo = (file, dau) => {
  try { const o = {}; for (const [k, {moTa}] of Object.entries(keysObject(doc(file), dau))) o[k] = moTa; return o; } catch { return {}; }
};
const boiCanh = (() => {
  try {
    const than = khoi(doc('src/v2/boi-canh.ts'), 'export const BOI_CANH');
    // mỗi bối cảnh là một khối `'ten': {` ... `},` ở đầu dòng 2 khoảng trắng
    const o = {};
    const re = /^  '?([a-z0-9-]+)'?:\s*\{([\s\S]*?)^  \},/gm;
    for (const m of than.matchAll(re)) {
      const [, ten, body] = m;
      const moTa = body.match(/moTa:\s*'([^']*)'/)?.[1] ?? '';
      const props = [...new Set([...body.matchAll(/p\('([a-z0-9-]+)'/g)].map((x) => x[1]))];
      o[ten] = {moTa, prop: props};
    }
    return o;
  } catch { return {}; }
})();
const mauHanhDong = (() => {
  try {
    const than = khoi(doc('src/v2/act/mau.ts'), 'export const MAU_MO_TA');
    const o = {};
    for (const m of than.matchAll(/^\s*'?([a-z0-9-]+)'?:\s*\{moTa:\s*'([^']*)'(?:,\s*thamSo:\s*'([^']*)')?(?:,\s*dungKhi:\s*'([^']*)')?/gm))
      o[m[1]] = [m[2], m[3] ? `tham số: ${m[3]}` : '', m[4] ? `dùng khi: ${m[4]}` : ''].filter(Boolean).join(' — ');
    return o;
  } catch { return {}; }
})();
const doCam = keysNeuCo('src/v2/rig/do-cam.tsx', 'export const DO_CAM');

// ── chép từ thư viện V1 ────────────────────────────────────────────────
const v1 = JSON.parse(doc(NGUON.thuVien));

// ── kiểm sơ: không được rỗng ───────────────────────────────────────────
const kiem = (ten, o) => {
  if (!Object.keys(o).length) throw new Error(`${ten} rỗng — regex không bắt được, xem lại ${JSON.stringify(NGUON)}`);
};
kiem('nhan_vat', nhanVat);
kiem('tu_the', tuThe);
kiem('mat', mat);
kiem('may', may);
kiem('mieng', mieng);
kiem('prop', prop);
kiem('loai_shot', loaiShot);
kiem('co_canh', coCanh);
for (const h of [...miengLipsync, ...miengCamXuc]) if (!(h in mieng)) throw new Error(`miệng "${h}" có trong mảng const nhưng không có trong type HinhMieng`);

const ra = {
  _: 'SINH TỰ ĐỘNG bởi pipeline/thu-vien-v2.mjs từ src/v2 — không sửa tay, sửa mã nguồn rồi chạy lại. Agent viết board.json CHỈ được dùng tên trong đây; pipeline/kiem-tra-v2.mjs đối chiếu.',
  nguon: NGUON,
  nhan_vat: {_: 'trường `kieu` của mỗi diễn viên trong `dien`. Nhân vật phụ vô danh dùng `trang`.', ...nhanVat},
  tu_the: {_: 'trường `dang` của diễn viên và của mỗi mốc `act`.', ...tuThe},
  mat: {_: 'trường `mat`. Mặc định oval đen đặc.', ...mat},
  may: {_: 'trường `may`. Mặc định khong (không vẽ).', ...may},
  mieng: {
    _: 'trường `mieng` — miệng cảm xúc khi KHÔNG nói; khi nói lip-sync (nhóm X..H) đè lên.',
    lipsync: miengLipsync,
    cam_xuc: miengCamXuc,
    ...mieng,
  },
  prop: {_: 'trường `prop[].ten` — vật vẽ nét đen không tô trên nền trắng.', ...prop},
  loai_shot: {_: 'trường `loai` của shot.', ...loaiShot},
  co_canh: {_: 'trường `co` của shot — cỡ cảnh quyết định bề rộng sọ.', ...coCanh},
  goc_nhin: {_: 'trường `goc` của diễn viên / mốc act. Mặc định truoc.', ...gocNhin},
  boi_canh: {_: 'trường `boi_canh` của shot — bung thành prop dựng sẵn (src/v2/boi-canh.ts).', ...boiCanh},
  mau_hanh_dong: {_: 'trường `mau` của diễn viên — sinh act tự động (src/v2/act/mau.ts).', ...mauHanhDong},
  do_cam: {_: 'trường `cam` của diễn viên / mốc act — vật cầm trên tay (src/v2/rig/do-cam.tsx).', ...doCam},
  sfx: v1.sfx,
  nhac: v1.nhac,
  giong_tts: v1.giong_tts,
};

const fileRa = path.join(ROOT, 'thu-vien-v2.json');
writeFileSync(fileRa, JSON.stringify(ra, null, 2) + '\n');
const dem = (o) => Object.keys(o).filter((k) => !k.startsWith('_') && k !== 'lipsync' && k !== 'cam_xuc').length;
const demSfx = Object.values(v1.sfx).filter(Array.isArray).reduce((s, a) => s + a.length, 0);
const demNhac = Object.values(v1.nhac).filter(Array.isArray).reduce((s, a) => s + a.length, 0);
console.log(
  `✓ thu-vien-v2.json: ${dem(nhanVat)} nhân vật, ${dem(tuThe)} tư thế, ${dem(mat)} mắt, ${dem(may)} mày, ` +
    `${dem(mieng)} miệng (${miengLipsync.length} lip-sync + ${miengCamXuc.length} cảm xúc), ${dem(prop)} prop, ` +
    `${dem(loaiShot)} loại shot, ${dem(coCanh)} cỡ cảnh, ${demSfx} sfx, ${demNhac} nhạc, ${dem(v1.giong_tts)} giọng`
);
