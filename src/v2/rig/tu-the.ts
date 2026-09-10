import type {KieuTay} from './tay';

/**
 * Tư thế V2 — góc khớp tuyệt đối, đơn vị độ.
 *
 * Quy ước một bên tay: 0 = chỉ xuống, 90 = chỉ ra ngoài (xa thân), 180 = chỉ lên,
 * âm = chỉ vào trong thân. `canh` là cánh tay (vai→khuỷu), `cang` là cẳng tay
 * (khuỷu→cổ tay). Bên `trai`/`phai` tính theo THÂN nhân vật khi nhìn thẳng
 * (phải của nhân vật = bên phải màn hình khi chưa flip).
 *
 * Tham chiếu KHÔNG nội suy giữa tư thế (79% snap 1 frame) — tư thế chỉ là
 * trạng thái, không phải điểm đầu/cuối của một chuyển động.
 */
export type Tay = {
  canh: number;
  cang: number;
  ban: KieuTay;
  /** góc bàn tay tương đối với cẳng tay */
  xoay?: number;
  /** hệ số dài cẳng tay (1 mặc định) — kéo dài khi tay phải chạm mặt (hoạt hình cho phép) */
  co?: number;
};
export type Chan = {trai: number; phai: number};

export type TuThe = {
  trai: Tay;
  phai: Tay;
  /** nghiêng thân (độ, dương = ngả ra trước/sang phải màn) */
  than?: number;
  /** nghiêng đầu (độ) */
  dau?: number;
  /** đầu dịch xuống (co cổ) hệ số DAU */
  coRut?: number;
  /** vai nâng — hệ số DAU */
  vaiNang?: number;
  /** góc chân — 0 thẳng, dương = xa thân */
  chan?: Chan;
  /** nhấc khỏi mặt đất — hệ số DAU (nhảy) */
  bay?: number;
  /** rút ngắn chân (ngồi: chỉ thấy ống chân buông) — hệ số 0..1 */
  chanNgan?: number;
  /** tay nào vẽ trước thân (mặc định cả hai trước) */
  sauThan?: ('trai' | 'phai')[];
  /** quay lưng lại — không vẽ mặt (tương đương goc 'sau') */
  quayLung?: boolean;
  /**
   * cúi người ra TRƯỚC (độ). Khác `than` (nghiêng trong mặt phẳng màn): ở góc nghiêng
   * (profile) là xoay thân quanh hông về phía mặt; ở góc trước/sau/3-4 là rút ngắn thân
   * theo cos(cui) để đọc là "cúi về phía máy quay".
   */
  cui?: number;
  /** hạ hông xuống gần đất — hệ số DAU (ngồi bệt, quỳ) */
  hongHa?: number;
  /** lệch hông ngang — hệ số DAU (đứng dồn trọng tâm) */
  hongLech?: number;
  /** xoay cả người quanh điểm giữa hai chân (độ) — nằm */
  xoayCa?: number;
  /** dời cả người sau khi xoay — hệ số DAU [dx, dy] */
  doi?: [number, number];
  /** đồ cầm mặc định của tư thế (prop `cam` của NhanVat đè lên) */
  cam?: string;
  /** ghi đè khi vẽ ở góc nghiêng (profile): tay/chân so le theo trục trước-sau */
  nghieng?: Partial<Pick<TuThe, 'trai' | 'phai' | 'chan' | 'than' | 'bay' | 'chanNgan'>>;
};

const T = (canh: number, cang: number, ban: KieuTay = 'ep', xoay = 0, co = 1): Tay => ({canh, cang, ban, xoay, co});
const buong = T(10, 6, 'ep');

export const TU_THE: Record<string, TuThe> = {
  /** đứng thường, tay buông */
  dung: {trai: buong, phai: buong},
  /** chỉ tay ra trước — khẳng định */
  chi: {trai: buong, phai: T(70, 105, 'chi', 0)},
  /** chỉ lên trời — ý tưởng, "một điều nữa" */
  chiLen: {trai: buong, phai: T(150, 178, 'chi')},
  /** khoanh tay */
  khoanhTay: {trai: T(30, -95, 'nam'), phai: T(30, -95, 'nam')},
  /** hai tay ôm đầu */
  omDau: {trai: T(150, 200, 'nam'), phai: T(150, 200, 'nam'), coRut: 0.04},
  /** áp điện thoại lên tai */
  camDT: {trai: buong, phai: T(100, 230, 'cam')},
  /** giơ một tay — chào, ăn mừng */
  gioTay: {trai: buong, phai: T(160, 172, 'xoe')},
  /** vẫy tay */
  vayTay: {trai: buong, phai: T(120, 168, 'xoe')},
  /** nhún vai, hai tay xoè ngửa */
  nhunVai: {trai: T(35, 110, 'xoe'), phai: T(35, 110, 'xoe'), vaiNang: 0.05, coRut: 0.04},
  /** hai tay xoè bung ra — hào hứng */
  haiTayXoe: {trai: T(60, 140, 'xoe'), phai: T(60, 140, 'xoe')},
  /** cúi người — mệt, thất vọng */
  cuiNguoi: {trai: T(4, -2, 'ep'), phai: T(4, -2, 'ep'), than: 10, dau: 18},
  /** chống tay hông */
  tayHong: {trai: T(40, -60, 'nam'), phai: T(40, -60, 'nam')},
  /** một tay chống hông, một tay buông — tự tin nhẹ */
  motTayHong: {trai: buong, phai: T(40, -60, 'nam')},
  /** gõ máy — hai cẳng tay đưa trước */
  goMay: {trai: T(25, -40, 'ep'), phai: T(25, -40, 'ep')},
  /** chống cằm */
  chongCam: {trai: buong, phai: T(40, -150, 'nam')},
  /** hai tay ép ngực — hồi hộp, cảm động */
  epNguc: {trai: T(25, -120, 'nam'), phai: T(25, -120, 'nam')},
  /** che miệng — ngại, cười khúc khích */
  cheMieng: {trai: buong, phai: T(35, -140, 'ep')},
  /** gãi đầu — bối rối */
  gaiDau: {trai: buong, phai: T(140, 215, 'ep'), dau: -6},
  /** quay lưng */
  quayLung: {trai: buong, phai: buong, quayLung: true},
  /** nhảy/chạy — hình 1 */
  nhay1: {trai: T(140, 175, 'xoe'), phai: T(60, 140, 'xoe'), chan: {trai: 35, phai: -20}, bay: 0.18, than: 6},
  /** nhảy/chạy — hình 2 */
  nhay2: {trai: T(60, 140, 'xoe'), phai: T(140, 175, 'xoe'), chan: {trai: -20, phai: 35}, bay: 0.1, than: 6},
  /** ngồi (bàn học) — chân gập, tay đặt trước */
  ngoi: {trai: T(30, -50, 'ep'), phai: T(30, -50, 'ep'), chan: {trai: 10, phai: 10}, chanNgan: 0.45},
  /** lao vào khung — key nghiêng, kéo dài */
  laoVao: {trai: T(50, 20, 'xoe'), phai: T(120, 60, 'xoe'), than: 22, dau: 10, chan: {trai: 30, phai: -25}},
  /** cầm đồ đưa ra trước — đi với `cam` (sách, ly, điện thoại) */
  cam: {trai: buong, phai: T(60, 100, 'cam')},

  // ── đi / chạy: hình rời, không nội suy ─────────────────────────────────
  /** đi bộ hình 1 — chân phải trước, tay trái trước */
  di1: {trai: T(-14, -8, 'ep'), phai: T(14, 8, 'ep'), chan: {trai: 12, phai: 12}, nghieng: {trai: T(-22, -30, 'ep'), phai: T(-22, -30, 'ep'), chan: {trai: 22, phai: 22}}},
  /** đi bộ hình 2 — chân trái trước, tay phải trước */
  di2: {trai: T(14, 8, 'ep'), phai: T(-14, -8, 'ep'), chan: {trai: 12, phai: 12}, nghieng: {trai: T(22, 30, 'ep'), phai: T(22, 30, 'ep'), chan: {trai: -22, phai: -22}}},
  /** chạy hình 1 — sải dài, chân phải trước, bay */
  chay1: {trai: T(40, -70, 'nam'), phai: T(40, -70, 'nam'), chan: {trai: 30, phai: -12}, bay: 0.14, cui: 15, nghieng: {trai: T(-45, -110, 'nam'), phai: T(-45, -110, 'nam'), chan: {trai: 40, phai: 42}}},
  /** chạy hình 2 — hai chân lướt qua nhau, thấp */
  chay2: {trai: T(40, -70, 'nam'), phai: T(40, -70, 'nam'), chan: {trai: 8, phai: 8}, bay: 0.04, cui: 15, nghieng: {trai: T(10, -100, 'nam'), phai: T(-10, -100, 'nam'), chan: {trai: -10, phai: 12}}},
  /** chạy hình 3 — sải dài, chân trái trước, bay */
  chay3: {trai: T(40, -70, 'nam'), phai: T(40, -70, 'nam'), chan: {trai: -12, phai: 30}, bay: 0.14, cui: 15, nghieng: {trai: T(45, 110, 'nam'), phai: T(45, 110, 'nam'), chan: {trai: -42, phai: -40}}},

  // ── ngã / quỳ / nằm ───────────────────────────────────────────────────
  /** ngã ngồi bệt — chân duỗi, hai tay chống sau */
  nga: {trai: T(78, 25, 'up'), phai: T(78, 25, 'up'), than: -10, dau: -6, hongHa: 0.5, chan: {trai: 76, phai: 76}, nghieng: {trai: T(55, 25, 'up'), phai: T(-55, -25, 'up'), chan: {trai: -72, phai: 78}, than: -18}},
  /** quỳ — hông hạ, ống chân gập dưới, hai tay đặt đùi */
  quy: {trai: T(18, -30, 'up'), phai: T(18, -30, 'up'), hongHa: 0.35, chanNgan: 0.5, chan: {trai: 6, phai: 6}, nghieng: {chan: {trai: -8, phai: 8}}},
  /** nằm ngửa — cả người xoay 90 độ, đầu bên trái */
  nam: {trai: T(12, 6, 'ep'), phai: T(12, 6, 'ep'), chan: {trai: 6, phai: 6}, xoayCa: -90, doi: [0, -0.3]},

  // ── cử chỉ thân ───────────────────────────────────────────────────────
  /** ôm bụng cười — cúi 20 độ, hai tay ôm bụng */
  omBung: {trai: T(22, -75, 'nam'), phai: T(22, -75, 'nam'), cui: 20, dau: 12, coRut: 0.03},
  /** chỉ ra sau lưng — ngón cái qua vai */
  chiSau: {trai: buong, phai: T(40, 205, 'chi', 15)},
  /** khoác vai người bên — một tay giơ ngang */
  khoacVai: {trai: buong, phai: T(96, 78, 'up')},
  /** viết bảng — tay đưa cao cầm phấn (dùng ở góc nghiêng, mặt hướng bảng) */
  vietBang: {trai: buong, phai: T(140, 168, 'cam'), cam: 'phan'},
  /** ngồi gục đầu xuống bàn — thân cúi 45 độ, đầu hạ 0.5 DAU */
  ngoiGuc: {trai: T(85, 70, 'ep'), phai: T(85, 70, 'ep'), cui: 45, coRut: 0.5, dau: 20, chan: {trai: 10, phai: 10}, chanNgan: 0.45},
  /** ngồi gõ bàn — hai tay úp gõ */
  ngoiGoBan: {trai: T(32, -50, 'up'), phai: T(32, -50, 'up'), chan: {trai: 10, phai: 10}, chanNgan: 0.45},
  /** đứng dồn trọng tâm một chân — hông lệch, một tay chống hông */
  dungNghieng: {trai: buong, phai: T(42, -62, 'nam'), hongLech: 0.06, than: -4, chan: {trai: 20, phai: 0}},
  /** sờ cằm nghĩ — tay đưa lên cằm, đầu hơi ngửa */
  soCam: {trai: T(8, -20, 'ep'), phai: T(28, -150, 'ep', 30, 1.4), dau: -6},
  /** hai tay bịt miệng — sốc, nín cười */
  bitMieng: {trai: T(35, -142, 'ep', 20, 1.5), phai: T(35, -142, 'ep', 20, 1.5), coRut: 0.02},
  /** chắp tay xin — hai nắm tay chạm nhau trước ngực, đầu hơi nghiêng */
  chapTay: {trai: T(30, -115, 'nam', 0, 1.1), phai: T(30, -115, 'nam', 0, 1.1), dau: 6},
  /** giơ hai tay ăn mừng */
  gioHaiTay: {trai: T(150, 176, 'xoe'), phai: T(150, 176, 'xoe')},
};


export type TenTuThe = keyof typeof TU_THE;
