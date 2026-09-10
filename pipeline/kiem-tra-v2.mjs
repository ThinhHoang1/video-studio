/**
 * Chốt chặn trước khi render bảng phân cảnh V2 (board.json).
 *
 *   node pipeline/kiem-tra-v2.mjs <ten-kich-ban> [--board <file.json>] [--moc]
 *
 *   --moc  in mốc ước lượng (giây) của từng shot — dùng để đặt `tai` cho nhịp trắng
 *
 * Đọc: scripts/<ten>.json, src/projects/<du-an>/data/<ten>.{generated,voice,mouth}.json,
 *      src/projects/<du-an>/board.json (hoặc --board), thu-vien-v2.json.
 *
 * Kiểm theo mục "Quy tắc máy kiểm" trong src/v2/board/README.md:
 *   ✗ mọi `say` có nguyên văn trong lời bình chương (so sau khi bỏ dấu câu, thường hoá)
 *   ✗ mọi kieu / dang / mat / may / mieng / prop.ten / sfx / loai / co / nhac có trong thu-vien-v2.json
 *   ✗ shot ≥ 0.25 s; không hai shot cùng mốc (cùng frame)
 *   ✗ chương có ≥ 1 shot mỗi 2.5 s trung bình
 *   ⚠ đoạn truc-dien liên tục ≤ 7 s
 *   ✗ shot truc-dien có đúng một diễn viên `noi` (đúng 1 diễn viên thì coi là noi)
 *   ✗ shot insert có `anh` tồn tại trong public/
 *   ⚠ chương trong board phải có trong kịch bản và ngược lại
 *
 * Mốc thời gian của shot `say` được ƯỚC LƯỢNG: vị trí ký tự trong lời bình →
 * tỉ lệ → rải lên các frame ĐANG NÓI của voice.json (bỏ frame `nghi`, vì giọng
 * đọc ngắt hơi 6-30% thời lượng nên chia đều theo thời gian lệch tới 0.5 s).
 * Không có voice.json thì dùng frame khác X của mouth.json; không có nữa thì
 * chia đều. Đủ để bắt lỗi nhịp và đặt `tai` cho nhịp trắng, KHÔNG phải mốc
 * render — src/v2/phim/du-lieu.ts hiện neo theo cụm 7 từ (neo.ts V1).
 *
 * In ✗ lỗi / ⚠ cảnh báo; exit 1 khi có lỗi.
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
if (!TEN) {
  console.error('Thiếu tên kịch bản. Ví dụ: node pipeline/kiem-tra-v2.mjs tinh-dau [--board /duong/dan/board.json]');
  process.exit(2);
}

// ── ngưỡng ─────────────────────────────────────────────────────────────
const FPS_MAC_DINH = 30;
const SHOT_NGAN_NHAT = 0.25; // giây
const NHIP_SHOT = 2.5; // giây / shot trung bình tối đa
const TRUC_DIEN_TOI_DA = 7; // giây liên tục
const LECH_THOI_LUONG = 0.15; // giây, mouth.json so với mp3
const DEM_CHUONG = 0.4; // giây, đệm trắng cuối chương của renderer (DEM_CHUONG trong src/v2/phim/du-lieu.ts) — shot cuối kéo tới hết đệm

// ── các giá trị literal khai trong kieu-board.ts nhưng không có trong thư viện ──
const CHU_KIEU = ['kem', 'the', 'nhan', 'tay'];
const CHU_VI_TRI = ['giua', 'trai', 'phai', 'tren', 'duoi', 'canh-dau'];
const CHU_VAO = ['tuc-thi', 'tung-tu', 'phong'];
const DIEN_VAO = ['pop', 'lao'];
const CHUYEN = ['cut', 'trang', 'mo-chong'];
const NEN = ['trang'];

const loi = [];
const canhBao = [];
const bao = (dk, msg) => (dk ? null : loi.push(msg));
const nhac = (dk, msg) => (dk ? null : canhBao.push(msg));
const doc = (p) => JSON.parse(readFileSync(p, 'utf8'));
const trongRepo = (p) => path.join(ROOT, p);

/** thường hoá để so khớp `say` với lời bình — cùng cách với pipeline/kiem-tra.mjs */
const chuan = (s) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/[.,!?;:"'…—–-]/g, '')
    .replace(/[“”‘’]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/** tên hợp lệ của một mục thư viện: bỏ khoá meta `_`, `lipsync`, `cam_xuc` */
const tapTen = (muc) => new Set(Object.keys(muc ?? {}).filter((k) => !k.startsWith('_') && k !== 'lipsync' && k !== 'cam_xuc'));
/** sfx / nhạc trong thư viện xếp theo nhóm mảng → gộp phẳng */
const tapPhang = (muc) => new Set(Object.values(muc ?? {}).filter(Array.isArray).flat());

// ── 1. kịch bản + thư viện ─────────────────────────────────────────────
const duongKichBan = `scripts/${TEN}.json`;
if (!existsSync(trongRepo(duongKichBan))) {
  console.error(`✗ Không có ${duongKichBan}`);
  process.exit(1);
}
if (!existsSync(trongRepo('thu-vien-v2.json'))) {
  console.error('✗ Không có thu-vien-v2.json. Chạy: node pipeline/thu-vien-v2.mjs');
  process.exit(1);
}
const kb = doc(trongRepo(duongKichBan));
const tv = doc(trongRepo('thu-vien-v2.json'));
const TV = {
  kieu: tapTen(tv.nhan_vat),
  dang: tapTen(tv.tu_the),
  mat: tapTen(tv.mat),
  may: tapTen(tv.may),
  mieng: tapTen(tv.mieng),
  prop: tapTen(tv.prop),
  loai: tapTen(tv.loai_shot),
  co: tapTen(tv.co_canh),
  sfx: tapPhang(tv.sfx),
  nhac: tapPhang(tv.nhac),
  goc: tapTen(tv.goc_nhin),
  boiCanh: tapTen(tv.boi_canh),
  mau: tapTen(tv.mau_hanh_dong),
  doCam: tapTen(tv.do_cam),
};
/** mục thư viện rỗng = phần mã chưa có → chỉ cảnh báo, không chặn */
const kiemNeuCo = (tap, gt, msg) => (tap.size ? bao(tap.has(gt), msg) : canhBao.push(msg.replace('không có trong thư viện', 'chưa kiểm được: thư viện trống, chạy lại pipeline/thu-vien-v2.mjs')));
const goiY = (tap) => [...tap].join(', ');

const DU_AN = kb.project ?? TEN.replace(/-vui$|-buon$/, '');
const chuongKichBan = new Map((kb.chapters ?? []).map((c) => [c.id, c]));
bao(chuongKichBan.size > 0, 'kịch bản không có chương nào');

// ── 2. dữ liệu sinh: manifest, voice, mouth ────────────────────────────
const thuMucData = `src/projects/${DU_AN}/data`;
const duongManifest = `${thuMucData}/${TEN}.generated.json`;
const duongVoice = `${thuMucData}/${TEN}.voice.json`;
const duongMouth = `${thuMucData}/${TEN}.mouth.json`;

let manifest = null;
const thoiLuong = new Map(); // id → giây
if (!existsSync(trongRepo(duongManifest))) {
  loi.push(`chưa sinh giọng: không có ${duongManifest}. Chạy: node pipeline/tts-gemini.mjs ${TEN}`);
} else {
  manifest = doc(trongRepo(duongManifest));
  for (const m of manifest.chapters ?? []) {
    thoiLuong.set(m.id, m.duration);
    const c = chuongKichBan.get(m.id);
    if (c && m.vo !== c.vo) loi.push(`chương "${m.id}": lời bình đã sửa nhưng chưa đọc lại (manifest lệch kịch bản)`);
    if (!existsSync(trongRepo(`public/${m.audio}`))) loi.push(`chương "${m.id}": mất file public/${m.audio}`);
  }
  for (const id of chuongKichBan.keys()) if (!thoiLuong.has(id)) loi.push(`chương "${id}" chưa có giọng đọc trong manifest`);
}

nhac(existsSync(trongRepo(duongVoice)), `không có ${duongVoice} — chưa chạy: node pipeline/analyze-voice.mjs ${TEN}`);
const voice = existsSync(trongRepo(duongVoice)) ? doc(trongRepo(duongVoice)) : null;

let mouth = null;
let FPS = FPS_MAC_DINH;
if (!existsSync(trongRepo(duongMouth))) {
  loi.push(`chưa có lip-sync: không có ${duongMouth}. Chạy: node pipeline/lipsync.mjs ${TEN}`);
} else {
  mouth = doc(trongRepo(duongMouth));
  for (const id of chuongKichBan.keys()) {
    const m = mouth[id];
    if (!m) {
      loi.push(`chương "${id}": không có trong ${duongMouth}. Chạy lại: node pipeline/lipsync.mjs ${TEN}`);
      continue;
    }
    if (m.fps) FPS = m.fps;
    const dm = thoiLuong.get(id);
    if (dm != null && Math.abs(dm - m.duration) > LECH_THOI_LUONG)
      canhBao.push(`chương "${id}": mouth.json ${m.duration.toFixed(2)}s lệch mp3 ${dm.toFixed(2)}s — có thể cũ, chạy lại lipsync`);
    if (typeof m.frames !== 'string' || Math.abs(m.frames.length - Math.round(m.duration * m.fps)) > 1)
      loi.push(`chương "${id}": mouth.json hỏng (frames ${m.frames?.length ?? '?'} ≠ duration × fps)`);
  }
}

/**
 * Bảng đổi tỉ lệ ký tự (0..1) trong lời bình chương → giây.
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
    // voice.json không ghi fps (analyze-voice cố định 30) → suy từ số frame / thời lượng
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
const IN_MOC = args.includes('--moc');

// ── 3. bảng phân cảnh ──────────────────────────────────────────────────
const duongBoard = opt('board') ?? trongRepo(`src/projects/${DU_AN}/board.json`);
if (!existsSync(duongBoard)) {
  loi.push(`không có bảng phân cảnh ${path.relative(ROOT, duongBoard)} (kiểu Board trong src/v2/board/kieu-board.ts)`);
}
const board = existsSync(duongBoard) ? doc(duongBoard) : null;
const thongKe = [];

if (board) {
  bao(board.du_an === DU_AN, `board.du_an = "${board.du_an}" nhưng kịch bản thuộc dự án "${DU_AN}"`);
  bao(board.nguoi_ke && TV.kieu.has(board.nguoi_ke), `board.nguoi_ke "${board.nguoi_ke}" không có trong thư viện. Chọn: ${goiY(TV.kieu)}`);
  bao(Array.isArray(board.chuong) && board.chuong.length > 0, 'board không có chương nào (`chuong: []`)');
  const md = board.mac_dinh ?? {};
  if (md.loai) bao(TV.loai.has(md.loai), `mac_dinh.loai "${md.loai}" không có trong thư viện`);
  if (md.co) bao(TV.co.has(md.co), `mac_dinh.co "${md.co}" không có trong thư viện`);

  const chuongBoard = new Set();
  for (const ch of board.chuong ?? []) {
    const id = ch.id ?? '?';
    const o = `chương "${id}"`;
    if (chuongBoard.has(id)) loi.push(`${o}: khai hai lần trong board`);
    chuongBoard.add(id);

    const kbCh = chuongKichBan.get(id);
    if (!kbCh) {
      canhBao.push(`bảng phân cảnh có ${o} nhưng kịch bản không có`);
      continue;
    }
    if (ch.nhac) bao(TV.nhac.has(ch.nhac), `${o}: nhạc "${ch.nhac}" không có trong thư viện`);
    if (!Array.isArray(ch.shots) || ch.shots.length === 0) {
      loi.push(`${o}: không có shot nào`);
      continue;
    }

    // thời lượng chương: từ mp3; không có thì ước lượng 0.42 s / từ (giọng kể chậm) và cảnh báo
    let dai = thoiLuong.get(id) ?? mouth?.[id]?.duration;
    if (dai == null) {
      dai = kbCh.vo.split(/\s+/).length * 0.42;
      canhBao.push(`${o}: chưa có thời lượng thật, ước lượng ${dai.toFixed(1)}s theo số từ để kiểm nhịp`);
    }
    const voChuan = chuan(kbCh.vo);
    const uocLuong = taoUocLuong(id, dai);

    // ── từng shot: tên + cấu trúc + mốc ──
    const mocs = [];
    let viTriTruoc = 0; // vị trí ký tự của shot trước — dò tiến để `say` lặp lại không trùng
    for (const [i, s] of ch.shots.entries()) {
      const ten = s.say ? `"${s.say}"` : s.tai != null ? `tai=${s.tai}` : `#${i + 1}`;
      const oS = `${o} shot ${i + 1} ${ten}`;
      const loai = s.loai ?? md.loai ?? 'minh-hoa';
      const co = s.co ?? md.co;

      if (s.loai) bao(TV.loai.has(s.loai), `${oS}: loại "${s.loai}" không có trong thư viện. Chọn: ${goiY(TV.loai)}`);
      if (co) bao(TV.co.has(co), `${oS}: cỡ cảnh "${co}" không có trong thư viện. Chọn: ${goiY(TV.co)}`);
      if (s.nen) bao(NEN.includes(s.nen), `${oS}: nền "${s.nen}" — chỉ có: ${NEN.join(', ')}`);
      if (s.sfx) bao(TV.sfx.has(s.sfx), `${oS}: sfx "${s.sfx}" không có trong thư viện`);
      if (s.chuyen) bao(CHUYEN.includes(s.chuyen), `${oS}: chuyen "${s.chuyen}" — chỉ có: ${CHUYEN.join(', ')}`);
      if (s.boi_canh) kiemNeuCo(TV.boiCanh, s.boi_canh, `${oS}: bối cảnh "${s.boi_canh}" không có trong thư viện`);

      for (const [j, p] of (s.prop ?? []).entries()) {
        bao(p && TV.prop.has(p.ten), `${oS}: prop ${j + 1} "${p?.ten}" không có trong thư viện`);
        bao(p && typeof p.x === 'number' && typeof p.y === 'number', `${oS}: prop ${j + 1} "${p?.ten}" thiếu x/y`);
      }
      for (const [j, c] of (s.chu ?? []).entries()) {
        bao(c && typeof c.noi_dung === 'string' && c.noi_dung.length > 0, `${oS}: chữ ${j + 1} thiếu noi_dung`);
        if (c?.kieu) bao(CHU_KIEU.includes(c.kieu), `${oS}: chữ ${j + 1} kieu "${c.kieu}" — chỉ có: ${CHU_KIEU.join(', ')}`);
        if (c?.vi_tri) bao(CHU_VI_TRI.includes(c.vi_tri), `${oS}: chữ ${j + 1} vi_tri "${c.vi_tri}" — chỉ có: ${CHU_VI_TRI.join(', ')}`);
        if (c?.vao) bao(CHU_VAO.includes(c.vao), `${oS}: chữ ${j + 1} vao "${c.vao}" — chỉ có: ${CHU_VAO.join(', ')}`);
      }

      // diễn viên + hành động
      const kiemGuongMat = (d, oD) => {
        if (d.dang) bao(TV.dang.has(d.dang), `${oD}: tư thế "${d.dang}" không có trong thư viện`);
        if (d.mat) bao(TV.mat.has(d.mat), `${oD}: mắt "${d.mat}" không có trong thư viện. Chọn: ${goiY(TV.mat)}`);
        if (d.may) bao(TV.may.has(d.may), `${oD}: mày "${d.may}" không có trong thư viện. Chọn: ${goiY(TV.may)}`);
        if (d.mieng) bao(TV.mieng.has(d.mieng), `${oD}: miệng "${d.mieng}" không có trong thư viện`);
        if (d.goc) kiemNeuCo(TV.goc, d.goc, `${oD}: góc nhìn "${d.goc}" không có trong thư viện`);
        if (d.cam) kiemNeuCo(TV.doCam, d.cam, `${oD}: đồ cầm "${d.cam}" không có trong thư viện`);
      };
      let soNoi = 0;
      for (const [j, d] of (s.dien ?? []).entries()) {
        const oD = `${oS} diễn viên ${j + 1} (${d?.kieu ?? '?'})`;
        bao(d && TV.kieu.has(d.kieu), `${oD}: nhân vật "${d?.kieu}" không có trong thư viện. Chọn: ${goiY(TV.kieu)}`);
        if (!d) continue;
        bao(typeof d.x === 'number', `${oD}: thiếu x`);
        if (d.vao) bao(DIEN_VAO.includes(d.vao), `${oD}: vao "${d.vao}" — chỉ có: ${DIEN_VAO.join(', ')}`);
        kiemGuongMat(d, oD);
        if (d.mau) kiemNeuCo(TV.mau, d.mau, `${oD}: mẫu hành động "${d.mau}" không có trong thư viện`);
        if (d.noi) soNoi++;
        let taiTruoc = -1;
        for (const [k, a] of (d.act ?? []).entries()) {
          const oA = `${oD} act ${k + 1}`;
          bao(typeof a.tai === 'number' && a.tai >= 0, `${oA}: thiếu \`tai\` (giây từ đầu shot)`);
          nhac(a.tai > taiTruoc, `${oA}: tai=${a.tai} không tăng so với mốc trước`);
          taiTruoc = a.tai;
          kiemGuongMat(a, oA);
        }
      }

      // loại shot → ràng buộc riêng
      if (loai === 'truc-dien') {
        const soDien = (s.dien ?? []).length;
        // không có `dien` → người kể mặc định (board.nguoi_ke) đứng nói
        if (soDien === 0) bao(Boolean(board.nguoi_ke), `${oS}: truc-dien không có diễn viên và board thiếu nguoi_ke`);
        else if (soNoi === 0 && soDien > 1) loi.push(`${oS}: truc-dien có ${soDien} diễn viên nhưng không ai đánh dấu \`noi: true\``);
        else if (soNoi > 1) loi.push(`${oS}: truc-dien có ${soNoi} diễn viên \`noi\` — chỉ một người nói`);
      } else if (soNoi > 1) {
        canhBao.push(`${oS}: ${soNoi} diễn viên cùng \`noi\` — hai miệng cùng nhép một giọng`);
      }
      if (loai === 'insert') {
        if (!s.insert?.anh) loi.push(`${oS}: loại insert nhưng thiếu \`insert.anh\``);
        else bao(existsSync(trongRepo(`public/${s.insert.anh}`)), `${oS}: không có public/${s.insert.anh}`);
      } else if (s.insert?.anh) {
        bao(existsSync(trongRepo(`public/${s.insert.anh}`)), `${oS}: không có public/${s.insert.anh}`);
      }
      if (loai === 'trong' && s.dai == null) canhBao.push(`${oS}: nhịp trắng không có \`dai\` — sẽ kéo tới mốc sau`);
      if (loai === 'chu' && !(s.chu?.length)) loi.push(`${oS}: loại chu nhưng không có \`chu\``);

      // ── mốc ──
      let moc = null;
      if (s.say == null && s.tai == null) {
        loi.push(`${oS}: thiếu \`say\` hoặc \`tai\` — không biết neo vào đâu`);
      } else if (s.tai != null) {
        bao(typeof s.tai === 'number' && s.tai >= 0, `${oS}: tai phải là số giây ≥ 0`);
        if (typeof s.tai === 'number') {
          if (s.tai > dai) loi.push(`${oS}: tai=${s.tai}s vượt thời lượng chương ${dai.toFixed(1)}s`);
          else moc = s.tai;
        }
      } else {
        const sayChuan = chuan(s.say);
        if (!sayChuan) {
          loi.push(`${oS}: say rỗng`);
        } else {
          let vt = voChuan.indexOf(sayChuan, viTriTruoc);
          if (vt === -1) {
            vt = voChuan.indexOf(sayChuan);
            if (vt !== -1) canhBao.push(`${oS}: chỉ thấy ở TRƯỚC shot trước — shot lùi thời gian, kiểm lại thứ tự`);
          }
          if (vt === -1) {
            loi.push(`${o}: mốc "${s.say}" không có trong lời bình`);
          } else {
            viTriTruoc = vt;
            moc = uocLuong.moc(vt / voChuan.length);
          }
        }
      }
      if (moc != null) mocs.push({i: i + 1, ten, moc, dai: s.dai, loai});
    }

    // ── nhịp: sắp theo mốc, đo độ dài từng shot ──
    const theoMoc = [...mocs].sort((a, b) => a.moc - b.moc);
    if (IN_MOC) {
      console.log(`\n  ${o} — mốc ước lượng theo ${uocLuong.nguon}, thời lượng ${dai.toFixed(2)}s`);
      for (const m of theoMoc) console.log(`    ${String(m.i).padStart(3)}  ${m.moc.toFixed(2).padStart(6)}s  ${m.loai.padEnd(10)} ${m.ten}${m.dai != null ? `  dai=${m.dai}` : ''}`);
    }
    for (let k = 1; k < theoMoc.length; k++) {
      const a = theoMoc[k - 1];
      const b = theoMoc[k];
      if (Math.round(a.moc * FPS) === Math.round(b.moc * FPS))
        loi.push(`${o}: hai shot cùng mốc (${a.moc.toFixed(2)}s) — shot ${a.i} ${a.ten} và shot ${b.i} ${b.ten}`);
    }
    const thuTuGoc = mocs.map((m) => m.i).join(',');
    const thuTuMoc = theoMoc.map((m) => m.i).join(',');
    nhac(thuTuGoc === thuTuMoc, `${o}: thứ tự shot trong file (${thuTuGoc}) khác thứ tự thời gian (${thuTuMoc})`);

    let trucDienLienTuc = 0;
    let trucDienTong = 0;
    let daBaoTrucDien = false;
    for (let k = 0; k < theoMoc.length; k++) {
      const m = theoMoc[k];
      const ketThucTuNhien = k + 1 < theoMoc.length ? theoMoc[k + 1].moc : dai + DEM_CHUONG;
      const khoang = ketThucTuNhien - m.moc;
      const doDai = m.dai != null ? Math.min(m.dai, khoang) : khoang;
      m.doDai = doDai;
      if (m.dai != null && m.dai > khoang + 1 / FPS)
        canhBao.push(`${o} shot ${m.i} ${m.ten}: dai=${m.dai}s nhưng shot sau tới sau ${khoang.toFixed(2)}s — bị cắt`);
      // khoang = 0 đã báo "cùng mốc" ở trên, không báo lần hai
      if (khoang > 0 && doDai < SHOT_NGAN_NHAT && !(m.dai != null && m.dai >= SHOT_NGAN_NHAT))
        loi.push(`${o} shot ${m.i} ${m.ten}: chỉ ${doDai.toFixed(2)}s (< ${SHOT_NGAN_NHAT}s)`);

      if (m.loai === 'truc-dien') {
        trucDienLienTuc += doDai;
        trucDienTong += doDai;
        if (trucDienLienTuc > TRUC_DIEN_TOI_DA && !daBaoTrucDien) {
          canhBao.push(`${o}: nói trực diện liên tục ${trucDienLienTuc.toFixed(1)}s (> ${TRUC_DIEN_TOI_DA}s) tới shot ${m.i} ${m.ten} — rời sang minh hoạ`);
          daBaoTrucDien = true;
        }
      } else {
        trucDienLienTuc = 0;
        daBaoTrucDien = false;
      }
    }

    const soShot = mocs.length;
    const nhipTB = soShot ? dai / soShot : Infinity;
    bao(nhipTB <= NHIP_SHOT, `${o}: ${soShot} shot / ${dai.toFixed(1)}s = ${nhipTB.toFixed(1)}s mỗi shot — cần ≥ 1 shot mỗi ${NHIP_SHOT}s (tối thiểu ${Math.ceil(dai / NHIP_SHOT)} shot)`);

    const trungVi = theoMoc.length ? [...theoMoc].sort((a, b) => a.doDai - b.doDai)[Math.floor(theoMoc.length / 2)].doDai : 0;
    thongKe.push({id, soShot, dai, nhipTB, trungVi, trucDien: dai ? trucDienTong / dai : 0, chu: ch.shots.filter((s) => s.chu?.length).length});
  }

  for (const id of chuongKichBan.keys()) nhac(chuongBoard.has(id), `kịch bản có chương "${id}" nhưng bảng phân cảnh không có`);
}

// ── kết quả ────────────────────────────────────────────────────────────
if (thongKe.length) {
  console.log(`  ${'chương'.padEnd(12)} ${'shot'.padStart(4)} ${'dài'.padStart(6)} ${'TB/shot'.padStart(8)} ${'trung vị'.padStart(9)} ${'trực diện'.padStart(10)} ${'chữ'.padStart(4)}`);
  for (const t of thongKe) {
    console.log(
      `  ${t.id.padEnd(12)} ${String(t.soShot).padStart(4)} ${t.dai.toFixed(1).padStart(5)}s ${t.nhipTB.toFixed(2).padStart(7)}s ${t.trungVi.toFixed(2).padStart(8)}s ${(t.trucDien * 100).toFixed(0).padStart(9)}% ${String(t.chu).padStart(4)}`
    );
  }
  console.log('');
}
for (const c of canhBao) console.log(`  ⚠  ${c}`);
if (loi.length === 0) {
  console.log(`\n✓ ${TEN}: qua hết ${canhBao.length ? `(${canhBao.length} cảnh báo, không chặn)` : ''}`);
  process.exit(0);
}
console.log('');
for (const l of loi) console.log(`  ✗  ${l}`);
console.log(`\n${loi.length} lỗi — sửa xong hãy render.`);
process.exit(1);
