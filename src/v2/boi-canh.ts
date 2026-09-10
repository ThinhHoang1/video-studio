import type {CoCanh, Prop, TenProp} from './board/kieu-board';

/**
 * BỐI CẢNH DỰNG SẴN — một tên trong Shot.boi_canh bung thành danh sách Prop
 * (cùng kiểu với Shot.prop, x/y tỉ lệ khung, co nhân với dau/330 ở renderer).
 *
 * Quy tắc rút từ tham chiếu (docs/nghien-cuu-storytime.md 4.4, 7.3):
 *   - THƯA: 3–5 prop, nhiều trắng, không sàn / tường / chân trời
 *   - prop ở mặt đất đặt tâm đáy đúng chân nhân vật của cỡ (CO_CANH[co].chanY):
 *     rong y = 0.84, trung y = 1.04 (chân dưới mép khung, prop bị cắt như tham chiếu)
 *   - prop ở xa: y nhỏ hơn một chút + co nhỏ hơn (phối cảnh một điểm tụ, không vẽ đường)
 *   - chỗ trống cho nhân vật ở x 0.3–0.7: prop mặt đất nằm ngoài dải này; chỉ prop treo
 *     cao (mây, đồng hồ) mới được ở giữa và phải nằm trên đỉnh đầu nhân vật
 *   - ngoại lệ có chủ ý: man-hinh-dien-thoai chiếm giữa khung (shot không có / có nhân vật nhỏ)
 *
 * Cách bung (lead nối vào renderer):
 *   const ds = bungBoiCanh(shot.boi_canh, shot.co ?? 'trung');   // Prop[] hoặc [] nếu tên lạ
 *   vẽ ds TRƯỚC shot.prop (prop khai tay vẽ chồng lên), giữ thứ tự mảng = thứ tự vẽ.
 *   Cỡ can / sat / nho: dùng bảng trung (can, sat) hoặc rong (nho); cỡ can/sat hiếm khi cần bối cảnh.
 */
export type BoiCanh = {
  ten: string;
  moTa: string;
  /** prop cho cỡ rong (DAU 200, chân ở y 0.84) */
  rong: Prop[];
  /** prop cho cỡ trung (DAU 330, chân ở y 1.04, cắt ở gối) */
  trung: Prop[];
};

/** rút gọn khai prop: tên có kiểm kiểu, x y tỉ lệ khung, co mặc định 1 */
const p = (ten: TenProp, x: number, y: number, co = 1, them: Pick<Prop, 'flip' | 'truoc' | 'chu'> = {}): Prop => ({ten, x, y, co, ...them});

/** chân nhân vật theo cỡ (trùng CO_CANH[co].chanY) — prop mặt đất dùng số này */
const CHAN = {rong: 0.84, trung: 1.04} as const;

/**
 * `mua` phủ 1920x1080 khi co × dau/330 = 1; ở rong dau = 200 nên cần co = 330/200
 * để vạch mưa vẫn phủ hết khung.
 */
const MUA_RONG = 330 / 200;

export const BOI_CANH: Record<string, BoiCanh> = {
  'lop-hoc': {
    ten: 'lop-hoc',
    moTa: 'lớp học nhìn từ cuối lớp: bảng bên trái, cửa sổ + bàn bên phải, đồng hồ trên cao',
    rong: [p('bang-den', 0.2, CHAN.rong), p('cua-so', 0.82, 0.44, 0.9), p('day-ban-lop', 0.78, CHAN.rong, 0.75), p('dong-ho', 0.5, 0.2, 0.7)],
    trung: [p('bang-den', 0.16, CHAN.trung), p('cua-so', 0.84, 0.5), p('ban-hoc', 0.86, CHAN.trung), p('dong-ho', 0.5, 0.24, 0.8)],
  },
  'lop-hoc-nhin-tu-bang': {
    ten: 'lop-hoc-nhin-tu-bang',
    moTa: 'góc thầy nhìn xuống lớp: hai dãy bàn quay lưng hai bên, cửa cuối lớp, đồng hồ tường sau',
    rong: [p('day-ban-sau', 0.17, CHAN.rong, 0.8), p('day-ban-sau', 0.83, CHAN.rong, 0.8, {flip: true}), p('cua', 0.95, 0.72, 0.55)],
    trung: [p('day-ban-sau', 0.16, CHAN.trung), p('day-ban-sau', 0.84, CHAN.trung, 1, {flip: true}), p('dong-ho', 0.5, 0.24, 0.8)],
  },
  'san-truong': {
    ten: 'san-truong',
    moTa: 'sân trường: cột cờ bên trái, cây bên phải, cổng xa nhỏ, mây',
    rong: [p('cong-truong', 0.7, 0.6, 0.3), p('cot-co', 0.14, CHAN.rong, 1.1), p('goc-cay', 0.88, CHAN.rong, 0.9), p('may', 0.42, 0.14)],
    trung: [p('cot-co', 0.1, CHAN.trung), p('goc-cay', 0.94, CHAN.trung, 1.1), p('may', 0.4, 0.14, 1.1), p('may-2', 0.68, 0.22, 0.9)],
  },
  'cong-truong': {
    ten: 'cong-truong',
    moTa: 'trước cổng trường: cổng bên phải, hàng rào + cây nhỏ bên trái, mây',
    rong: [p('cay-nho', 0.06, 0.8), p('hang-rao', 0.14, CHAN.rong), p('cong-truong', 0.76, CHAN.rong, 1.05), p('may', 0.4, 0.16, 0.9)],
    trung: [p('cay-nho', 0.04, 1.0, 1.3), p('hang-rao', 0.1, CHAN.trung), p('cong-truong', 0.8, CHAN.trung)],
  },
  'hanh-lang': {
    ten: 'hanh-lang',
    moTa: 'hành lang: cửa lớp gần bên trái, hai cửa lùi xa bên phải, đồng hồ trên cao',
    rong: [p('cua', 0.93, 0.78, 0.7), p('cua', 0.8, 0.81, 0.85), p('cua', 0.12, CHAN.rong), p('dong-ho', 0.5, 0.2, 0.7)],
    trung: [p('cua', 0.86, 1.0, 0.85), p('cua', 0.1, CHAN.trung), p('dong-ho', 0.5, 0.22, 0.8)],
  },
  'cang-tin': {
    ten: 'cang-tin',
    moTa: 'căng tin: quầy có tủ kính + bảng thực đơn bên phải, bàn ăn bên trái, thùng rác góc',
    rong: [p('quay-cang-tin', 0.78, CHAN.rong), p('ban-an', 0.17, CHAN.rong, 0.9), p('thung-rac', 0.97, CHAN.rong, 0.8)],
    trung: [p('quay-cang-tin', 0.84, CHAN.trung), p('khay-com', 0.72, 0.78, 0.8), p('ban-an', 0.1, CHAN.trung)],
  },
  'phong-ngu': {
    ten: 'phong-ngu',
    moTa: 'phòng ngủ: giường bên trái, cửa sổ + đèn ngủ bên phải',
    rong: [p('giuong', 0.19, CHAN.rong), p('cua-so', 0.8, 0.44, 0.85), p('den-ngu', 0.91, CHAN.rong)],
    trung: [p('giuong', 0.14, CHAN.trung), p('cua-so', 0.82, 0.5), p('den-ngu', 0.95, CHAN.trung)],
  },
  'phong-khach': {
    ten: 'phong-khach',
    moTa: 'phòng khách: sofa bên trái, tivi bên phải, đồng hồ trên cao',
    rong: [p('ghe-sofa', 0.19, CHAN.rong), p('tivi', 0.82, CHAN.rong), p('dong-ho', 0.5, 0.22, 0.7)],
    trung: [p('ghe-sofa', 0.13, CHAN.trung), p('tivi', 0.85, CHAN.trung), p('dong-ho', 0.5, 0.24, 0.8)],
  },
  bep: {
    ten: 'bep',
    moTa: 'bếp: bàn ăn bên trái, tủ lạnh bên phải, cửa sổ nhỏ trên cao lệch phải',
    rong: [p('ban-an', 0.18, CHAN.rong, 0.9), p('cua-so', 0.68, 0.42, 0.7), p('tu-lanh', 0.9, CHAN.rong)],
    trung: [p('ban-an', 0.1, CHAN.trung), p('cua-so', 0.7, 0.46, 0.8), p('tu-lanh', 0.9, CHAN.trung)],
  },
  'duong-pho': {
    ten: 'duong-pho',
    moTa: 'đường phố: đèn đường + thùng rác bên trái, hàng rào có cây nhỏ phía sau bên phải',
    rong: [p('den-duong', 0.13, CHAN.rong, 1.1), p('thung-rac', 0.26, CHAN.rong, 0.8), p('cay-nho', 0.9, 0.8, 1.1), p('hang-rao', 0.84, CHAN.rong)],
    trung: [p('den-duong', 0.1, CHAN.trung), p('cay-nho', 0.94, 1.0, 1.3), p('hang-rao', 0.86, CHAN.trung)],
  },
  'tram-xe': {
    ten: 'tram-xe',
    moTa: 'trạm xe: trạm chờ bên trái, xe buýt cửa mở bên phải, mây',
    rong: [p('tram-xe-buyt', 0.2, CHAN.rong), p('xe-buyt', 0.8, CHAN.rong, 0.9), p('may', 0.5, 0.14, 0.8)],
    trung: [p('tram-xe-buyt', 0.14, CHAN.trung), p('xe-buyt', 0.86, CHAN.trung), p('may', 0.45, 0.12)],
  },
  'quan-cafe': {
    ten: 'quan-cafe',
    moTa: 'quán cà phê: bàn tròn + hai ghế bên trái, cửa sổ bên phải',
    rong: [p('ghe-nha-hang', 0.1, CHAN.rong), p('ban-cafe', 0.2, CHAN.rong), p('ghe-nha-hang', 0.285, CHAN.rong), p('cua-so', 0.8, 0.46, 0.9)],
    trung: [p('ban-cafe', 0.13, CHAN.trung), p('ghe-nha-hang', 0.27, CHAN.trung), p('cua-so', 0.82, 0.52)],
  },
  'cong-vien': {
    ten: 'cong-vien',
    moTa: 'công viên: ghế đá bên trái, cây to bên phải, hai đám mây',
    rong: [p('ghe-da', 0.18, CHAN.rong), p('goc-cay', 0.87, CHAN.rong, 0.9), p('may', 0.36, 0.14), p('may-2', 0.7, 0.2, 0.8)],
    trung: [p('ghe-da', 0.14, CHAN.trung), p('goc-cay', 0.92, CHAN.trung, 1.1), p('may', 0.4, 0.13), p('may-2', 0.68, 0.2, 0.8)],
  },
  'ngoai-troi-mua': {
    ten: 'ngoai-troi-mua',
    moTa: 'ngoài trời mưa: vạch mưa phủ khung, cột điện bên trái, đèn đường bên phải',
    rong: [p('mua', 0.5, 1.0, MUA_RONG), p('cot-dien', 0.13, CHAN.rong), p('den-duong', 0.86, CHAN.rong)],
    trung: [p('mua', 0.5, 1.0), p('cot-dien', 0.1, CHAN.trung), p('den-duong', 0.88, CHAN.trung)],
  },
  dem: {
    ten: 'dem',
    moTa: 'đêm: trăng + sao góc trên trái, đèn đường bên phải, cây nhỏ / hàng rào góc',
    rong: [p('mat-trang', 0.2, 0.34), p('cay-nho', 0.95, CHAN.rong, 0.9), p('den-duong', 0.84, CHAN.rong, 1.1)],
    trung: [p('mat-trang', 0.18, 0.4, 1.1), p('hang-rao', 0.9, CHAN.trung), p('den-duong', 0.88, CHAN.trung)],
  },
  'man-hinh-dien-thoai': {
    ten: 'man-hinh-dien-thoai',
    moTa: 'màn hình điện thoại: khung chat lớn giữa khung (cố ý chiếm chỗ nhân vật; dùng cho shot chữ / insert)',
    rong: [p('man-hinh-chat', 0.5, 0.98, 1.55)],
    trung: [p('man-hinh-chat', 0.5, 1.0, 1.15)],
  },
  // ── 12 bối cảnh đa chủ đề (công sở, ăn uống, đi lại, y tế, thể thao, du lịch, chợ) ──
  'van-phong': {
    ten: 'van-phong',
    moTa: 'văn phòng: bàn làm việc có màn hình bên trái, tủ hồ sơ + máy in bên phải, đồng hồ trên cao',
    rong: [p('ban-lam-viec', 0.17, CHAN.rong), p('tu-ho-so', 0.84, CHAN.rong), p('may-in', 0.95, CHAN.rong, 0.7), p('dong-ho', 0.5, 0.2, 0.7)],
    trung: [p('ban-lam-viec', 0.13, CHAN.trung), p('tu-ho-so', 0.86, CHAN.trung), p('dong-ho', 0.5, 0.24, 0.8)],
  },
  'phong-hop': {
    ten: 'phong-hop',
    moTa: 'phòng họp: bảng trắng bên trái, hai ghế xoay bên phải, đồng hồ trên cao',
    rong: [p('bang-trang', 0.17, CHAN.rong), p('ghe-xoay', 0.82, CHAN.rong), p('ghe-xoay', 0.93, CHAN.rong, 0.9), p('dong-ho', 0.5, 0.2, 0.7)],
    trung: [p('bang-trang', 0.14, CHAN.trung), p('ghe-xoay', 0.86, CHAN.trung), p('dong-ho', 0.5, 0.24, 0.8)],
  },
  'quan-pho': {
    ten: 'quan-pho',
    moTa: 'quán phở: xe đẩy nồi phở bốc khói bên trái, bảng hiệu PHỞ + ghế bên phải',
    rong: [p('xe-day-hang-rong', 0.17, CHAN.rong), p('bang-hieu', 0.83, CHAN.rong, 0.9, {chu: 'PHỞ'}), p('ghe-nha-hang', 0.95, CHAN.rong)],
    trung: [p('xe-day-hang-rong', 0.14, CHAN.trung), p('bang-hieu', 0.86, CHAN.trung, 0.9, {chu: 'PHỞ'})],
  },
  'quan-nhau': {
    ten: 'quan-nhau',
    moTa: 'quán nhậu: bàn nhậu 3 cốc bia + ghế bên trái, bảng hiệu QUÁN NHẬU + ghế bên phải',
    rong: [p('ghe-nha-hang', 0.05, CHAN.rong), p('ban-nhau', 0.17, CHAN.rong), p('bang-hieu', 0.84, CHAN.rong, 0.9, {chu: 'QUÁN NHẬU'}), p('ghe-nha-hang', 0.96, CHAN.rong)],
    trung: [p('ban-nhau', 0.14, CHAN.trung), p('bang-hieu', 0.86, CHAN.trung, 0.9, {chu: 'QUÁN NHẬU'})],
  },
  'san-bay': {
    ten: 'san-bay',
    moTa: 'sân bay: bảng CỔNG 12 bên trái, máy bay nhỏ bay xa trên cao bên phải, ghế chờ dài, đồng hồ',
    rong: [p('bang-hieu', 0.14, CHAN.rong, 0.9, {chu: 'CỔNG 12'}), p('may-bay', 0.78, 0.36, 0.45), p('ghe-da', 0.86, CHAN.rong), p('dong-ho', 0.5, 0.2, 0.7)],
    trung: [p('bang-hieu', 0.12, CHAN.trung, 0.9, {chu: 'CỔNG 12'}), p('may-bay', 0.8, 0.34, 0.5), p('ghe-da', 0.9, CHAN.trung)],
  },
  'ben-xe': {
    ten: 'ben-xe',
    moTa: 'bến xe: bảng hiệu BẾN XE + thùng rác bên trái, xe buýt bên phải, mây',
    rong: [p('bang-hieu', 0.14, CHAN.rong, 0.9, {chu: 'BẾN XE'}), p('thung-rac', 0.26, CHAN.rong, 0.8), p('xe-buyt', 0.82, CHAN.rong, 0.9), p('may', 0.45, 0.14, 0.8)],
    trung: [p('bang-hieu', 0.12, CHAN.trung, 0.9, {chu: 'BẾN XE'}), p('xe-buyt', 0.86, CHAN.trung), p('may', 0.42, 0.12)],
  },
  'benh-vien': {
    ten: 'benh-vien',
    moTa: 'bệnh viện: giường bệnh có cọc truyền bên trái, bảng CẤP CỨU + cửa bên phải',
    rong: [p('giuong-benh', 0.18, CHAN.rong), p('bang-hieu', 0.8, CHAN.rong, 0.8, {chu: 'CẤP CỨU'}), p('cua', 0.95, CHAN.rong, 0.9)],
    trung: [p('giuong-benh', 0.15, CHAN.trung), p('bang-hieu', 0.84, CHAN.trung, 0.8, {chu: 'CẤP CỨU'}), p('hop-thuoc', 0.96, CHAN.trung, 0.8)],
  },
  'phong-gym': {
    ten: 'phong-gym',
    moTa: 'phòng gym: hai tạ tay bên trái, bảng hiệu GYM + tạ bên phải, đồng hồ',
    rong: [p('ta-tap', 0.14, CHAN.rong, 1.2), p('ta-tap', 0.25, CHAN.rong, 0.7), p('bang-hieu', 0.85, CHAN.rong, 0.9, {chu: 'GYM'}), p('dong-ho', 0.5, 0.2, 0.7)],
    trung: [p('ta-tap', 0.12, CHAN.trung, 1.2), p('bang-hieu', 0.86, CHAN.trung, 0.9, {chu: 'GYM'}), p('ta-tap', 0.97, CHAN.trung, 0.8)],
  },
  'san-bong': {
    ten: 'san-bong',
    moTa: 'sân bóng: bóng bên trái, khung thành hơi xa bên phải, hai đám mây',
    rong: [p('bong-da', 0.18, CHAN.rong, 0.8), p('khung-thanh', 0.8, CHAN.rong - 0.02, 0.8), p('may', 0.36, 0.14), p('may-2', 0.7, 0.2, 0.8)],
    trung: [p('bong-da', 0.16, CHAN.trung), p('khung-thanh', 0.84, CHAN.trung - 0.04, 0.9), p('may', 0.4, 0.13), p('may-2', 0.68, 0.2, 0.8)],
  },
  'bai-bien': {
    ten: 'bai-bien',
    moTa: 'bãi biển: cây dừa bên trái, sóng biển thấp bên phải, mặt trời + mây trên cao',
    rong: [p('cay-dua', 0.12, CHAN.rong, 1.1), p('bien-song', 0.82, CHAN.rong, 1.2), p('mat-troi', 0.72, 0.26, 0.8), p('may', 0.4, 0.14, 0.9)],
    trung: [p('cay-dua', 0.1, CHAN.trung, 1.15), p('bien-song', 0.86, CHAN.trung, 1.4), p('mat-troi', 0.72, 0.3, 0.9)],
  },
  cho: {
    ten: 'cho',
    moTa: 'chợ: xe đẩy hàng rong bên trái, bảng hiệu CHỢ bên phải, bó hoa góc phải',
    rong: [p('xe-day-hang-rong', 0.16, CHAN.rong), p('bang-hieu', 0.82, CHAN.rong, 0.9, {chu: 'CHỢ'}), p('hoa', 0.95, CHAN.rong, 0.8)],
    trung: [p('xe-day-hang-rong', 0.13, CHAN.trung), p('bang-hieu', 0.85, CHAN.trung, 0.9, {chu: 'CHỢ'}), p('hoa', 0.97, CHAN.trung, 0.8)],
  },
  'phong-lam-viec-nha': {
    ten: 'phong-lam-viec-nha',
    moTa: 'phòng làm việc ở nhà: cửa sổ + cây nhỏ bên trái, bàn làm việc (lật) bên phải',
    rong: [p('cua-so', 0.18, 0.46, 0.85), p('cay-nho', 0.06, CHAN.rong, 0.9), p('ban-lam-viec', 0.83, CHAN.rong, 1, {flip: true})],
    trung: [p('cua-so', 0.16, 0.52), p('cay-nho', 0.04, CHAN.trung, 1.2), p('ban-lam-viec', 0.86, CHAN.trung, 1, {flip: true})],
  },
};

export type TenBoiCanh = keyof typeof BOI_CANH;
export const TEN_BOI_CANH = Object.keys(BOI_CANH);

export const laBoiCanh = (ten: string): boolean => Object.prototype.hasOwnProperty.call(BOI_CANH, ten);

/**
 * Bung một bối cảnh thành Prop[] theo cỡ cảnh. Tên lạ → [] (validator báo riêng).
 * rong/nho → bảng rong; trung/can/sat → bảng trung.
 */
export function bungBoiCanh(ten: string | undefined, co: CoCanh = 'trung'): Prop[] {
  if (!ten || !laBoiCanh(ten)) return [];
  const bc = BOI_CANH[ten];
  return co === 'rong' || co === 'nho' ? bc.rong : bc.trung;
}
