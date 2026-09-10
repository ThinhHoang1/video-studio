/**
 * Hình khối V2 — đơn vị DAU = BỀ RỘNG SỌ (không kèm tóc).
 *
 * Số liệu lấy từ đo tham chiếu storytime (docs/nghien-cuu-storytime.md):
 *   - nhân vật chính cao 2.6 DAU, đầu/vai 1.67, cổ 2 gạch rất ngắn
 *   - da/áo/quần KHÔNG tô (cùng màu nền), chỉ tóc có màu
 *   - nét đồng đều: net = max(4.5px, 0.015 × DAU_px) trên 1080p
 *
 * Gốc toạ độ ở giữa hai bàn chân, y âm hướng lên. Mọi hằng là hệ số nhân DAU;
 * rig nhân với DAU_px ở lúc vẽ nên toàn bộ toạ độ ra px thật — không dùng
 * transform scale, để độ dày nét luôn đúng px.
 */

export const NEN = '#fdfdfd';
export const MUC = '#000000';
export const DO = '#f81000';

/** độ dày nét theo cỡ đầu trên màn (px). */
export const net = (dauPx: number) => Math.max(4.5, 0.015 * dauPx);

/** khung xương nhân vật chính (2.6 DAU). */
export const CHINH = {
  cao: 2.6,
  got: 0,
  goi: -0.35,
  hong: -0.7,
  hongR: 0.26,
  eo: -0.95,
  eoR: 0.24,
  vai: -1.45,
  vaiR: 0.3,
  cam: -1.57,
  coR: 0.05,
  soY: -2.03,
  soRx: 0.5,
  soRy: 0.46,
  canhTay: 0.5,
  cangTay: 0.45,
  tayDay: 0.1,
  banTay: 0.17,
  chanDay: 0.12,
  banChan: 0.2,
};

/** nhân vật phụ người lớn (3.6 DAU) — đầu tròn trắng. */
export const PHU = {
  cao: 3.6,
  got: 0,
  goi: -0.65,
  hong: -1.3,
  hongR: 0.3,
  eo: -1.6,
  eoR: 0.28,
  vai: -2.55,
  vaiR: 0.4,
  cam: -2.7,
  coR: 0.06,
  soY: -3.16,
  soRx: 0.5,
  soRy: 0.46,
  canhTay: 0.6,
  cangTay: 0.55,
  tayDay: 0.11,
  banTay: 0.17,
  chanDay: 0.13,
  banChan: 0.22,
};

export type Khung = typeof CHINH;

/**
 * Khung CHINH theo tỉ lệ (PhongCach.tiLe): nhân các mốc dọc của THÂN + chi bằng hệ số,
 * đầu giữ nguyên cỡ (DAU) nên 'lun' đầu to tương đối, 'cao' chân dài.
 *   lun  → tổng ≈ 2.3 DAU (thân ×0.81, vai/hông giữ bè)
 *   cao  → tổng ≈ 3.0 DAU (thân ×1.255, vai/hông thon 0.92)
 * Chỉ áp cho CHINH; PHU trả nguyên.
 */
export const khungTiLe = (K: Khung, tiLe: 'lun' | 'chuan' | 'cao' = 'chuan'): Khung => {
  if (K !== CHINH || tiLe === 'chuan') return K;
  const k = tiLe === 'lun' ? 0.81 : 1.255;
  const be = tiLe === 'lun' ? 1 : 0.92;
  const dauCam = K.soY - K.cam; // khoảng cằm → tâm sọ giữ nguyên
  return {
    ...K,
    cao: K.cao + K.cam * (1 - k),
    goi: K.goi * k,
    hong: K.hong * k,
    eo: K.eo * k,
    vai: K.vai * k,
    cam: K.cam * k,
    soY: K.cam * k + dauCam,
    hongR: K.hongR * be,
    eoR: K.eoR * be,
    vaiR: K.vaiR * be,
    canhTay: K.canhTay * k,
    cangTay: K.cangTay * k,
  };
};

/** toạ độ mặt trong hệ đầu (tâm sọ = 0,0), hệ số DAU. */
export const MAT = {
  y: 0.06,
  x: 0.225,
  miengY: 0.33,
  lechNhin: 0.05,
};

export const rad = (deg: number) => (deg * Math.PI) / 180;
export const r2 = (n: number) => Math.round(n * 100) / 100;

/** góc nhìn nhân vật — dùng chung cho NhanVat, Dau, Toc, Mat, Mieng (board khai cùng 4 giá trị này). */
export type GocNhin = 'truoc' | 'ba-phan-tu' | 'nghieng' | 'sau';

/** một điểm px */
export type Diem = [number, number];

/** băm chuỗi → số nguyên 32 bit (FNV-1a) — seed nhiễu vẽ tay theo id + tên bộ phận. */
export const bam = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

/** bộ sinh số giả ngẫu nhiên xác định (xorshift32) trả 0..1 — cùng seed luôn cùng chuỗi, KHÔNG phụ thuộc frame. */
export const ngauNhien = (seed: number) => {
  let t = (seed >>> 0) || 0x9e3779b9;
  return () => {
    t ^= t << 13;
    t >>>= 0;
    t ^= t >>> 17;
    t ^= t << 5;
    t >>>= 0;
    return t / 4294967296;
  };
};

/** biên độ nhiễu vẽ tay theo cỡ đầu (px): 0.006 DAU, tối thiểu 0.6px để cỡ nhỏ vẫn còn cảm giác tay. */
export const bienDoTayVe = (dauPx: number) => Math.max(0.6, 0.006 * dauPx);

/** đường cong kín qua danh sách điểm (Catmull-Rom → bezier) — mềm, không thấy đỉnh. */
export const duongKin = (P: Diem[]) => {
  const n = P.length;
  if (n < 3) return `M ${P.map((p) => p.join(' ')).join(' L ')} z`;
  let d = `M ${P[0][0]} ${P[0][1]}`;
  for (let i = 0; i < n; i++) {
    const p0 = P[(i - 1 + n) % n];
    const p1 = P[i];
    const p2 = P[(i + 1) % n];
    const p3 = P[(i + 2) % n];
    d += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]} ${p2[1]}`;
  }
  return d + ' z';
};

/** đường cong mở qua danh sách điểm (Catmull-Rom, hai đầu kẹp). */
export const duongMo = (P: Diem[]) => {
  const n = P.length;
  if (n < 2) return '';
  if (n === 2) return `M ${P[0][0]} ${P[0][1]} L ${P[1][0]} ${P[1][1]}`;
  let d = `M ${P[0][0]} ${P[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = P[Math.max(i - 1, 0)];
    const p1 = P[i];
    const p2 = P[i + 1];
    const p3 = P[Math.min(i + 2, n - 1)];
    d += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]} ${p2[1]}`;
  }
  return d;
};

/**
 * Ellipse vẽ tay: n điểm quanh ellipse, mỗi điểm lệch bán kính ngẫu nhiên ±bienDo (px),
 * nối bằng đường cong kín. bienDo = 0 → ellipse trơn. `xoay` (rad) xoay pha lấy mẫu để
 * hai ellipse cùng seed không trùng nhiễu.
 */
export const ellipseTayVe = (cx: number, cy: number, rx: number, ry: number, bienDo: number, seed: number, n = 12) => {
  const rnd = ngauNhien(seed);
  const P: Diem[] = [];
  for (let i = 0; i < n; i++) {
    const a = (2 * Math.PI * i) / n;
    const dx = (rnd() * 2 - 1) * bienDo;
    const dy = (rnd() * 2 - 1) * bienDo;
    P.push([cx + Math.cos(a) * (rx + dx), cy + Math.sin(a) * (ry + dy)]);
  }
  return duongKin(P);
};

/** thêm nhiễu vuông góc cho đa giác/đường gấp khúc: mỗi cạnh chia `chia` đoạn, điểm trong lệch ±bienDo. */
export const nhieuDuong = (P: Diem[], bienDo: number, seed: number, kin: boolean, chia = 3): Diem[] => {
  const rnd = ngauNhien(seed);
  const ra: Diem[] = [];
  const n = P.length;
  const soCanh = kin ? n : n - 1;
  for (let i = 0; i < soCanh; i++) {
    const a = P[i];
    const b = P[(i + 1) % n];
    const vx = b[0] - a[0];
    const vy = b[1] - a[1];
    const L = Math.hypot(vx, vy) || 1;
    const nx = -vy / L;
    const ny = vx / L;
    ra.push([a[0] + (rnd() * 2 - 1) * bienDo, a[1] + (rnd() * 2 - 1) * bienDo]);
    for (let k = 1; k < chia; k++) {
      const t = k / chia;
      const e = (rnd() * 2 - 1) * bienDo;
      ra.push([a[0] + vx * t + nx * e, a[1] + vy * t + ny * e]);
    }
  }
  if (!kin) ra.push([P[n - 1][0] + (rnd() * 2 - 1) * bienDo, P[n - 1][1] + (rnd() * 2 - 1) * bienDo]);
  return ra;
};

/**
 * Ống chi vẽ tay: danh sách khớp (vai → khuỷu → cổ tay), mỗi đoạn thẳng thành đường
 * cong hơi lượn; khớp giữ góc gập (mỗi đoạn một subpath, nét bo tròn nên liền).
 */
export const ongTayVe = (khop: Diem[], bienDo: number, seed: number) => {
  let d = '';
  for (let i = 0; i < khop.length - 1; i++) {
    const P = nhieuDuong([khop[i], khop[i + 1]], bienDo, seed + i * 7919, false, 3);
    // giữ đúng hai đầu để khớp và bàn tay không lệch
    P[0] = khop[i];
    P[P.length - 1] = khop[i + 1];
    d += (d ? ' ' : '') + duongMo(P);
  }
  return d;
};
