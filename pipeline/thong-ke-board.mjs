/**
 * Thống kê bảng phân cảnh V2 so với mục tiêu tham chiếu (JaidenAnimations, đo trong
 * docs/nghien-cuu-storytime.md và docs/tham-chieu/shot.md).
 *
 *   node pipeline/thong-ke-board.mjs <ten-kich-ban> [--board <file.json>] [--json]
 *
 * Đọc: scripts/<ten>.json, src/projects/<du-an>/data/<ten>.{generated,voice,mouth}.json,
 *      src/projects/<du-an>/board.json (hoặc --board).
 *
 * KHÔNG chặn, không kiểm tên (việc của pipeline/kiem-tra-v2.mjs, chạy nó trước).
 * Chỉ trả lời câu hỏi "board này có nhịp giống storytime chưa": in bảng từng
 * chương rồi bảng tổng, mỗi dòng ✓ (đạt) / ⚠ (lệch) / · (chỉ để biết).
 *
 * Mốc thời gian của shot được ƯỚC LƯỢNG bằng CÙNG cách với kiem-tra-v2.mjs
 * (hàm `chuan` và `taoUocLuong` chép nguyên, xem ghi chú ở đó): tỉ lệ ký tự
 * trong lời bình rải lên các frame đang nói của voice.json. Sửa một bên phải
 * sửa bên kia.
 *
 * Mục tiêu (cột "mục tiêu" trong bảng) lấy từ đo tham chiếu:
 *   giây/shot 1.0-1.6 (trung vị tham chiếu 1.42 s) · shot < 1 s >= 30% (đo 31%)
 *   trực diện <= 20% thời gian (đo 16%) · chữ >= 1 / 15 s (đo 1 / 12.6 s)
 *   nhịp trắng 5-10% (đo 7.2%) · trung vị shot <= 1.8 s · shot dài nhất <= 8 s
 *   trực diện liên tục <= 7 s · một nhịp trắng <= 3.6 s
 */
import {readFileSync, existsSync} from 'node:fs';
import path from 'node:path';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const args = process.argv.slice(2);
const TEN = args.find((a) => !a.startsWith('--'));
const opt = (k) => {
  const i = args.indexOf(`--${k}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const JSON_RA = args.includes('--json');
if (!TEN) {
  console.error('Thiếu tên kịch bản. Ví dụ: node pipeline/thong-ke-board.mjs demo-v2 [--board /duong/dan/board.json] [--json]');
  process.exit(2);
}

// ── hằng dùng chung với renderer / validator ───────────────────────────
const FPS_MAC_DINH = 30;
const DEM_CHUONG = 0.4; // giây đệm trắng cuối chương (DEM_CHUONG trong src/v2/phim/du-lieu.ts)
const NHAY_INSERT = 0.3; // giây trắng hai đầu shot insert (san-khau.tsx)

// ── mục tiêu tham chiếu ────────────────────────────────────────────────
const MUC_TIEU = {
  giayMoiShot: [1.0, 1.6],
  phanTramDuoi1s: 30,
  phanTramTrucDien: 20,
  chuMoi15s: 1,
  phanTramTrang: [5, 10],
  trungViShot: 1.8,
  shotDaiNhat: 8,
  trucDienLienTuc: 7,
  trangDaiNhat: 3.6,
};

const doc = (p) => JSON.parse(readFileSync(p, 'utf8'));
const trongRepo = (p) => path.join(ROOT, p);

/** thường hoá để so khớp `say` với lời bình: chép nguyên từ kiem-tra-v2.mjs */
const chuan = (s) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/[.,!?;:"'\u2026\u2014\u2013-]/g, '')
    .replace(/[“”‘’]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

// ── đầu vào ────────────────────────────────────────────────────────────
const duongKichBan = `scripts/${TEN}.json`;
if (!existsSync(trongRepo(duongKichBan))) {
  console.error(`✗ Không có ${duongKichBan}`);
  process.exit(1);
}
const kb = doc(trongRepo(duongKichBan));
const DU_AN = kb.project ?? TEN.replace(/-vui$|-buon$/, '');
const chuongKichBan = new Map((kb.chapters ?? []).map((c) => [c.id, c]));

const thuMucData = `src/projects/${DU_AN}/data`;
const duongManifest = `${thuMucData}/${TEN}.generated.json`;
const duongVoice = `${thuMucData}/${TEN}.voice.json`;
const duongMouth = `${thuMucData}/${TEN}.mouth.json`;
const manifest = existsSync(trongRepo(duongManifest)) ? doc(trongRepo(duongManifest)) : null;
const voice = existsSync(trongRepo(duongVoice)) ? doc(trongRepo(duongVoice)) : null;
const mouth = existsSync(trongRepo(duongMouth)) ? doc(trongRepo(duongMouth)) : null;
if (!manifest) console.error(`⚠  chưa có ${duongManifest}: thời lượng chương sẽ ước lượng theo số từ (0.42 s/từ)`);
if (!voice && !mouth) console.error(`⚠  không có voice.json lẫn mouth.json: mốc chia đều theo thời gian, lệch tới 0.5 s`);
const thoiLuong = new Map((manifest?.chapters ?? []).map((m) => [m.id, m.duration]));
let FPS = FPS_MAC_DINH;
for (const m of Object.values(mouth ?? {})) if (m?.fps) FPS = m.fps;

const duongBoard = opt('board') ?? trongRepo(`src/projects/${DU_AN}/board.json`);
if (!existsSync(duongBoard)) {
  console.error(`✗ không có bảng phân cảnh ${path.relative(ROOT, duongBoard)}`);
  process.exit(1);
}
const board = doc(duongBoard);
const md = board.mac_dinh ?? {};

/**
 * Bảng đổi tỉ lệ ký tự (0..1) trong lời bình chương → giây: chép nguyên từ kiem-tra-v2.mjs.
 * Có voice.json: chỉ rải lên các frame đang nói (bỏ `nghi`); có mouth.json: bỏ
 * frame X; không có gì: chia đều theo thời lượng.
 */
const taoUocLuong = (id, dai) => {
  const nghi = voice?.[id]?.nghi;
  const m = mouth?.[id];
  let dangNoi = null;
  let fpsNguon = FPS;
  let nguon = 'chia đều';
  if (Array.isArray(nghi) && nghi.length) {
    dangNoi = nghi.map((n, i) => (n ? -1 : i)).filter((i) => i >= 0);
    fpsNguon = nghi.length / dai;
    nguon = 'voice.json';
  } else if (typeof m?.frames === 'string' && m.frames.length) {
    dangNoi = [...m.frames].map((c, i) => (c === 'X' ? -1 : i)).filter((i) => i >= 0);
    fpsNguon = m.fps ?? FPS;
    nguon = 'mouth.json';
  }
  if (!dangNoi || dangNoi.length < fpsNguon) return {nguon: 'chia đều', moc: (p) => p * dai};
  const n = dangNoi.length;
  return {nguon, moc: (p) => dangNoi[Math.min(n - 1, Math.floor(p * n))] / fpsNguon};
};

// ── gom số liệu ────────────────────────────────────────────────────────
const trungVi = (xs) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};
const pt = (x) => `${(x * 100).toFixed(0)}%`;
const giay = (x) => `${x.toFixed(2)}s`;

const tapProp = new Set();
const tapGoc = new Set();
const tapMau = new Set();
const tapLoai = new Set();
const tapNhanVat = new Set();
const tapBoiCanh = new Set();
const tapSfx = new Set();
const demSfx = {n: 0};
const demInsert = {n: 0};
const demAct = {act: 0, shotCoDien: 0};
const bangChuong = [];
const tatCaShot = []; // {doDai, loai, trang, chu}
let tongLoi = 0;
let tongShotDai = 0;
let tongTrucDien = 0;
let tongTrang = 0;
let tongTrangTuChen = 0;
let tongTrangInsert = 0;
let tongChu = 0;
let trucDienLienTucMax = 0;
let trangDaiNhat = 0;
let soShotKhongNeo = 0;

for (const ch of board.chuong ?? []) {
  const id = ch.id ?? '?';
  const kbCh = chuongKichBan.get(id);
  if (!kbCh) continue;
  let dai = thoiLuong.get(id) ?? mouth?.[id]?.duration;
  if (dai == null) dai = kbCh.vo.split(/\s+/).length * 0.42;
  const voChuan = chuan(kbCh.vo);
  const uocLuong = taoUocLuong(id, dai);

  // mốc từng shot: cùng cách dò tiến như validator
  const mocs = [];
  let viTriTruoc = 0;
  for (const [i, s] of (ch.shots ?? []).entries()) {
    const loai = s.loai ?? md.loai ?? 'minh-hoa';
    let moc = null;
    if (typeof s.tai === 'number' && s.tai >= 0) moc = Math.min(s.tai, dai);
    else if (s.say) {
      const kim = chuan(s.say);
      let vt = kim ? voChuan.indexOf(kim, viTriTruoc) : -1;
      if (vt === -1 && kim) vt = voChuan.indexOf(kim);
      if (vt !== -1) {
        viTriTruoc = vt;
        moc = uocLuong.moc(vt / voChuan.length);
      }
    }
    if (moc == null) {
      soShotKhongNeo++;
      continue;
    }
    mocs.push({i: i + 1, s, loai, moc});

    // kho tên dùng trong video
    tapLoai.add(loai);
    for (const p of s.prop ?? []) if (p?.ten) tapProp.add(p.ten);
    if (s.boi_canh) tapBoiCanh.add(s.boi_canh);
    if (s.sfx) {
      tapSfx.add(s.sfx);
      demSfx.n++;
    }
    if (loai === 'insert' || s.insert?.anh) demInsert.n++;
    if (s.dien?.length) demAct.shotCoDien++;
    for (const d of s.dien ?? []) {
      if (d?.kieu) tapNhanVat.add(d.kieu);
      if (d?.goc) tapGoc.add(d.goc);
      if (d?.mau) tapMau.add(d.mau);
      for (const a of d?.act ?? []) {
        demAct.act++;
        if (a?.goc) tapGoc.add(a.goc);
      }
    }
    if (loai === 'truc-dien' && !(s.dien?.length)) tapNhanVat.add(board.nguoi_ke);
  }

  // độ dài từng shot theo thứ tự thời gian: giống dungChuong() trong du-lieu.ts
  const theoMoc = [...mocs].sort((a, b) => a.moc - b.moc);
  const shots = [];
  for (let k = 0; k < theoMoc.length; k++) {
    const m = theoMoc[k];
    const batDau = k === 0 ? 0 : m.moc; // shot đầu chương kéo về 0 như renderer
    const ketThuc = k + 1 < theoMoc.length ? theoMoc[k + 1].moc : dai + DEM_CHUONG;
    const khoang = Math.max(0, ketThuc - batDau);
    const doDai = typeof m.s.dai === 'number' ? Math.min(khoang, Math.max(0.25, m.s.dai)) : khoang;
    const hoTuChen = khoang - doDai; // khoảng hở sau shot có `dai` -> renderer chèn nhịp trắng
    let trang = 0;
    let trangInsert = 0;
    if (m.loai === 'trong') trang = doDai;
    if (m.loai === 'insert') trangInsert = Math.min(doDai, NHAY_INSERT + (doDai > 3 * NHAY_INSERT ? NHAY_INSERT : 0));
    shots.push({...m, doDai, hoTuChen, trang, trangInsert, chu: (m.s.chu ?? []).length > 0});
  }

  // đoạn trực diện liên tục, tính cả nhịp trắng tự chèn ở giữa là ngắt
  let lienTuc = 0;
  let lienTucMax = 0;
  let tdChuong = 0;
  let trangChuong = 0;
  for (const s of shots) {
    if (s.loai === 'truc-dien') {
      lienTuc += s.doDai;
      tdChuong += s.doDai;
    } else lienTuc = 0;
    if (s.hoTuChen > 0) lienTuc = 0;
    lienTucMax = Math.max(lienTucMax, lienTuc);
    const trangShot = s.trang + s.hoTuChen + s.trangInsert;
    trangChuong += trangShot;
    trangDaiNhat = Math.max(trangDaiNhat, s.trang, s.hoTuChen);
    tongTrangTuChen += s.hoTuChen;
    tongTrangInsert += s.trangInsert;
  }
  trucDienLienTucMax = Math.max(trucDienLienTucMax, lienTucMax);

  const tongShotChuong = shots.reduce((a, s) => a + s.doDai + s.hoTuChen, 0);
  const soChu = shots.filter((s) => s.chu).length;
  tongLoi += dai;
  tongShotDai += tongShotChuong;
  tongTrucDien += tdChuong;
  tongTrang += trangChuong;
  tongChu += soChu;
  tatCaShot.push(...shots);

  bangChuong.push({
    id,
    soShot: shots.length,
    dai,
    giayMoiShot: shots.length ? dai / shots.length : Infinity,
    trungVi: trungVi(shots.map((s) => s.doDai)),
    duoi1s: shots.length ? shots.filter((s) => s.doDai < 1).length / shots.length : 0,
    trucDien: tongShotChuong ? tdChuong / tongShotChuong : 0,
    trang: tongShotChuong ? trangChuong / tongShotChuong : 0,
    chu: soChu,
    lienTucMax,
    nguon: uocLuong.nguon,
  });
}

const soShot = tatCaShot.length;
const tong = {
  soShot,
  tongLoi,
  giayMoiShot: soShot ? tongLoi / soShot : Infinity,
  trungViShot: trungVi(tatCaShot.map((s) => s.doDai)),
  shotDaiNhat: Math.max(0, ...tatCaShot.map((s) => s.doDai)),
  phanTramDuoi1s: soShot ? (tatCaShot.filter((s) => s.doDai < 1).length / soShot) * 100 : 0,
  phanTramTrucDien: tongShotDai ? (tongTrucDien / tongShotDai) * 100 : 0,
  trucDienLienTucMax,
  chuMoi15s: tongLoi ? tongChu / (tongLoi / 15) : 0,
  soShotCoChu: tongChu,
  phanTramTrang: tongShotDai ? (tongTrang / tongShotDai) * 100 : 0,
  trangKhai: tongTrang - tongTrangTuChen - tongTrangInsert,
  trangTuChen: tongTrangTuChen,
  trangInsert: tongTrangInsert,
  trangDaiNhat,
  prop: [...tapProp].sort(),
  goc: [...tapGoc].sort(),
  mau: [...tapMau].sort(),
  loai: [...tapLoai].sort(),
  nhanVat: [...tapNhanVat].sort(),
  boiCanh: [...tapBoiCanh].sort(),
  sfx: {luot: demSfx.n, khacNhau: tapSfx.size},
  insert: demInsert.n,
  actMoiShotCoDien: demAct.shotCoDien ? demAct.act / demAct.shotCoDien : 0,
  soShotKhongNeo,
};

if (JSON_RA) {
  console.log(JSON.stringify({ten: TEN, du_an: DU_AN, chuong: bangChuong, tong, muc_tieu: MUC_TIEU}, null, 2));
  process.exit(0);
}

// ── in bảng chương ─────────────────────────────────────────────────────
const cot = (s, n, phai = true) => (phai ? String(s).padStart(n) : String(s).padEnd(n));
console.log(`\n  ${TEN}: ${bangChuong.length} chương, ${soShot} shot, ${tongLoi.toFixed(1)}s lời (mốc ước lượng theo ${[...new Set(bangChuong.map((c) => c.nguon))].join('/')})\n`);
console.log(`  ${cot('chương', 12, false)} ${cot('shot', 4)} ${cot('dài', 6)} ${cot('s/shot', 7)} ${cot('trung vị', 9)} ${cot('<1s', 5)} ${cot('TD', 5)} ${cot('TD liền', 8)} ${cot('trắng', 6)} ${cot('chữ', 4)}`);
for (const c of bangChuong) {
  console.log(
    `  ${cot(c.id, 12, false)} ${cot(c.soShot, 4)} ${cot(c.dai.toFixed(1) + 's', 6)} ${cot(c.giayMoiShot.toFixed(2) + 's', 7)} ${cot(c.trungVi.toFixed(2) + 's', 9)} ${cot(pt(c.duoi1s), 5)} ${cot(pt(c.trucDien), 5)} ${cot(c.lienTucMax.toFixed(1) + 's', 8)} ${cot(pt(c.trang), 6)} ${cot(c.chu, 4)}`
  );
}

// ── in bảng tổng so mục tiêu ───────────────────────────────────────────
const trongKhoang = (x, [a, b]) => x >= a && x <= b;
const dong = (dat, ten, giaTri, mucTieu, ghiChu = '') => {
  const dau = dat === null ? '·' : dat ? '✓' : '⚠';
  console.log(`  ${dau} ${cot(ten, 30, false)} ${cot(giaTri, 12)}   ${cot(mucTieu, 12, false)} ${ghiChu}`);
};
console.log(`\n  ${cot('chỉ số', 32, false)} ${cot('giá trị', 12)}   ${cot('mục tiêu', 12, false)} ghi chú (tham chiếu đo được)`);
dong(
  trongKhoang(tong.giayMoiShot, MUC_TIEU.giayMoiShot),
  'giây / shot',
  giay(tong.giayMoiShot),
  `${MUC_TIEU.giayMoiShot[0]}-${MUC_TIEU.giayMoiShot[1]}`,
  tong.giayMoiShot > MUC_TIEU.giayMoiShot[1] ? 'quá thưa: thêm phan-ung / chu / trong giữa các ý' : tong.giayMoiShot < MUC_TIEU.giayMoiShot[0] ? 'dày hơn tham chiếu, xem có shot nào < 0.4 s vô nghĩa' : 'tham chiếu 1.42 s trung vị'
);
dong(tong.phanTramDuoi1s >= MUC_TIEU.phanTramDuoi1s, 'shot dưới 1 s', `${tong.phanTramDuoi1s.toFixed(0)}%`, `>= ${MUC_TIEU.phanTramDuoi1s}%`, 'tham chiếu 31%: nhãn, phản ứng, nháy trắng, TD chêm');
dong(tong.phanTramTrucDien <= MUC_TIEU.phanTramTrucDien, 'thời gian trực diện', `${tong.phanTramTrucDien.toFixed(0)}%`, `<= ${MUC_TIEU.phanTramTrucDien}%`, 'tham chiếu 16%; rời TD ngay khi lời chuyển sang sự kiện');
dong(tong.chuMoi15s >= MUC_TIEU.chuMoi15s, 'chữ mỗi 15 s', tong.chuMoi15s.toFixed(1), `>= ${MUC_TIEU.chuMoi15s}`, `${tong.soShotCoChu} shot có chữ; tham chiếu 1 / 12.6 s`);
dong(
  trongKhoang(tong.phanTramTrang, MUC_TIEU.phanTramTrang),
  'nhịp trắng',
  `${tong.phanTramTrang.toFixed(1)}%`,
  `${MUC_TIEU.phanTramTrang[0]}-${MUC_TIEU.phanTramTrang[1]}%`,
  `khai ${tong.trangKhai.toFixed(1)}s + tự chèn ${tong.trangTuChen.toFixed(1)}s + nháy insert ${tong.trangInsert.toFixed(1)}s; tham chiếu 7.2%`
);
dong(tong.trungViShot <= MUC_TIEU.trungViShot, 'trung vị shot', giay(tong.trungViShot), `<= ${MUC_TIEU.trungViShot}s`, 'tham chiếu 1.42 s');
dong(tong.shotDaiNhat <= MUC_TIEU.shotDaiNhat, 'shot dài nhất', giay(tong.shotDaiNhat), `<= ${MUC_TIEU.shotDaiNhat}s`, 'tham chiếu tối đa 8.4 s, chỉ 2/231 shot');
dong(tong.trucDienLienTucMax <= MUC_TIEU.trucDienLienTuc, 'trực diện liền dài nhất', giay(tong.trucDienLienTucMax), `<= ${MUC_TIEU.trucDienLienTuc}s`, 'tham chiếu 6.8 s (mở đầu), sau đó <= 3 s');
dong(tong.trangDaiNhat <= MUC_TIEU.trangDaiNhat, 'một nhịp trắng dài nhất', giay(tong.trangDaiNhat), `<= ${MUC_TIEU.trangDaiNhat}s`, 'tham chiếu 0.5-1.25 s thường, 3.6 s sau câu chốt');
console.log('');
dong(null, 'prop khác nhau', tong.prop.length, '', tong.prop.join(', ') || '(không có)');
dong(null, 'góc nhìn', tong.goc.length ? tong.goc.join(', ') : 'truoc', '', tong.goc.length ? 'schema có, đã nối renderer' : 'chưa khai goc; schema có truoc/ba-phan-tu/nghieng/sau (đã nối renderer)');
dong(null, 'mẫu hành động', tong.mau.length, '', tong.mau.length ? tong.mau.join(', ') + ' (đã nối renderer)' : 'chưa dùng `mau`; act thủ công thay thế');
dong(null, 'bối cảnh dựng sẵn', tong.boiCanh.length, '', tong.boiCanh.length ? tong.boiCanh.join(', ') + ' (đã nối renderer)' : 'chưa dùng `boi_canh`');
dong(null, 'loại shot dùng', `${tong.loai.length}/9`, '', tong.loai.join(', '));
dong(null, 'nhân vật', tong.nhanVat.length, '', tong.nhanVat.join(', '));
dong(null, 'act / shot có diễn viên', tong.actMoiShotCoDien.toFixed(1), '', 'tham chiếu: đổi tư thế mỗi 0.3-1.8 s trong shot');
dong(null, 'sfx / insert', `${tong.sfx.luot} / ${tong.insert}`, '', `${tong.sfx.khacNhau} sfx khác nhau; tham chiếu insert 4 / 403 s`);
if (tong.soShotKhongNeo) console.log(`\n  ⚠  ${tong.soShotKhongNeo} shot không neo được (say không có trong lời bình) - chạy kiem-tra-v2 để xem là shot nào`);
console.log('');
