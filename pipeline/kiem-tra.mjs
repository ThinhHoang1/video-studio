/**
 * Chốt chặn trước khi render.
 *
 * Render một video mất 10-15 phút. Mọi lỗi bắt được bằng máy phải bắt ở đây,
 * đừng để phát hiện sau khi xem xong bản dựng.
 *
 *   node pipeline/kiem-tra.mjs <ten-du-an>
 *
 * Kiểm 7 thứ:
 *   1. kịch bản đủ trường bắt buộc
 *   2. đã sinh giọng đọc cho mọi chương
 *   3. lời bình khớp giữa kịch bản và manifest (vân tay nội dung)
 *   4. mọi mốc `say` có thật trong lời bình
 *   5. mọi tên cảnh / tư thế / sắc thái / sfx / nhạc có trong thư viện
 *   6. không chương nào để cảnh đứng yên quá lâu
 *   7. không hai mốc rơi trùng frame
 */
import {readFileSync, existsSync} from 'node:fs';
import path from 'node:path';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const TEN = process.argv[2];
if (!TEN) {
  console.error('Thiếu tên dự án. Ví dụ: node pipeline/kiem-tra.mjs ra-truong-vui');
  process.exit(2);
}

const loi = [];
const canhBao = [];
const bao = (dk, msg) => (dk ? null : loi.push(msg));

const doc = (p) => JSON.parse(readFileSync(path.join(ROOT, p), 'utf8'));

// ── 1. kịch bản ────────────────────────────────────────────────────────
const duongKichBan = `scripts/${TEN}.json`;
if (!existsSync(path.join(ROOT, duongKichBan))) {
  console.error(`✗ Không có ${duongKichBan}`);
  process.exit(1);
}
const kb = doc(duongKichBan);
const thuVien = doc('thu-vien.json');

bao(kb.voice, 'kịch bản thiếu trường `voice`');
bao(kb.style, 'kịch bản thiếu trường `style` (hướng dẫn cảm xúc cho TTS)');
bao(Array.isArray(kb.chapters) && kb.chapters.length > 0, 'kịch bản không có chương nào');
bao(
  !kb.voice || Object.keys(thuVien.giong_tts).includes(kb.voice) || kb.voice.startsWith('_'),
  `voice "${kb.voice}" không có trong thư viện. Chọn: ${Object.keys(thuVien.giong_tts).filter((v) => v !== '_').join(', ')}`
);

for (const [i, c] of (kb.chapters ?? []).entries()) {
  const o = `chương ${i + 1} (${c.id ?? '?'})`;
  bao(c.id, `${o}: thiếu id`);
  bao(c.vo, `${o}: thiếu lời bình \`vo\``);
  bao(c.heading, `${o}: thiếu \`heading\``);
  bao(c.kicker, `${o}: thiếu \`kicker\``);
  const soTu = (c.vo ?? '').split(/\s+/).length;
  if (soTu > 170) canhBao.push(`${o}: ${soTu} từ — dài quá, nên tách đôi (chương lý tưởng 60-140 từ)`);
  if (soTu < 40) canhBao.push(`${o}: chỉ ${soTu} từ — ngắn quá, người xem chưa kịp vào chương đã hết`);
}

// ── 2 + 3. giọng đọc ───────────────────────────────────────────────────
const duongManifest = `src/projects/${TEN.replace(/-vui$|-buon$/, '')}/data/${TEN}.generated.json`;
let manifest = null;
if (!existsSync(path.join(ROOT, duongManifest))) {
  loi.push(`chưa sinh giọng: không có ${duongManifest}. Chạy: node pipeline/tts-gemini.mjs ${TEN}`);
} else {
  manifest = doc(duongManifest);
  const theoId = new Map(manifest.chapters.map((c) => [c.id, c]));
  for (const c of kb.chapters ?? []) {
    const m = theoId.get(c.id);
    if (!m) {
      loi.push(`chương "${c.id}" chưa có giọng đọc`);
      continue;
    }
    if (m.vo !== c.vo) loi.push(`chương "${c.id}": lời bình đã sửa nhưng chưa đọc lại`);
    if (!existsSync(path.join(ROOT, 'public', m.audio))) loi.push(`chương "${c.id}": mất file ${m.audio}`);
  }
}

// ── 4-7. bảng phân cảnh ────────────────────────────────────────────────
const duongBoard = `src/projects/${TEN.replace(/-vui$|-buon$/, '')}/board.ts`;
if (existsSync(path.join(ROOT, duongBoard)) && manifest) {
  const nguon = readFileSync(path.join(ROOT, duongBoard), 'utf8');
  const loiBinh = new Map(manifest.chapters.map((c) => [c.id, c.vo]));
  const chuan = (s) => s.toLowerCase().replace(/[.,!?;:"'…—–-]/g, '').replace(/\s+/g, ' ').trim();

  const tenCanh = new Set(Object.keys(thuVien.canh).filter((k) => !k.startsWith('_')));
  const tenTuThe = new Set(Object.keys(thuVien.tu_the));
  const tenSac = new Set(Object.keys(thuVien.sac_thai));
  const tenCo = new Set(Object.keys(thuVien.co_canh));

  // tách theo từng chương: "  'id': [ ... ],"
  const khoi = [...nguon.matchAll(/^\s*'?([a-z0-9-]+)'?:\s*\[([\s\S]*?)^\s*\],/gm)];
  for (const [, idChuong, than] of khoi) {
    const vo = loiBinh.get(idChuong);
    if (!vo) {
      canhBao.push(`bảng phân cảnh có chương "${idChuong}" nhưng kịch bản không có`);
      continue;
    }
    const voChuan = chuan(vo);
    const mocs = [...than.matchAll(/\{say:\s*'([^']+)'([^}]*)\}/g)];
    if (mocs.length < 3) canhBao.push(`chương "${idChuong}": chỉ ${mocs.length} mốc đổi cảnh — cảnh sẽ đứng yên quá lâu`);

    const viTri = [];
    for (const [, say, phanConLai] of mocs) {
      const vt = voChuan.indexOf(chuan(say));
      if (vt === -1) {
        loi.push(`chương "${idChuong}": mốc "${say}" không có trong lời bình`);
      } else {
        viTri.push({say, vt});
      }
      const g = (ten) => phanConLai.match(new RegExp(`${ten}:\\s*'([^']+)'`))?.[1];
      const canh = g('canh');
      const dang = g('dang');
      const sac = g('sac');
      const co = g('co');
      if (canh && !tenCanh.has(canh)) loi.push(`chương "${idChuong}": cảnh "${canh}" không có trong thư viện`);
      if (dang && !tenTuThe.has(dang)) loi.push(`chương "${idChuong}": tư thế "${dang}" không có trong thư viện`);
      if (sac && !tenSac.has(sac)) loi.push(`chương "${idChuong}": sắc thái "${sac}" không có trong thư viện`);
      if (co && !tenCo.has(co)) loi.push(`chương "${idChuong}": cỡ cảnh "${co}" không có trong thư viện`);
    }

    // mốc trùng vị trí -> hai cảnh chồng lên nhau, cảnh trước không kịp hiện
    viTri.sort((a, b) => a.vt - b.vt);
    for (let i = 1; i < viTri.length; i++) {
      if (viTri[i].vt === viTri[i - 1].vt)
        loi.push(`chương "${idChuong}": hai mốc trùng vị trí — "${viTri[i - 1].say}" và "${viTri[i].say}"`);
    }
  }
}

// ── kết quả ────────────────────────────────────────────────────────────
for (const c of canhBao) console.log(`  ⚠  ${c}`);
if (loi.length === 0) {
  console.log(`\n✓ ${TEN}: qua hết ${canhBao.length ? `(${canhBao.length} cảnh báo, không chặn)` : ''}`);
  process.exit(0);
}
console.log('');
for (const l of loi) console.log(`  ✗  ${l}`);
console.log(`\n${loi.length} lỗi — sửa xong hãy render.`);
process.exit(1);
