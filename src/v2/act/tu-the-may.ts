import {TU_THE, type Tay, type TuThe} from '../rig/tu-the';
import type {KieuTay} from '../rig/tay';

/**
 * Tư thế MÁY DÙNG cho thư viện mẫu hành động — chưa có trong rig/tu-the.ts.
 *
 * Chỉ mẫu (src/v2/act/mau.ts) gọi tới các tên này; agent viết board không dùng
 * trực tiếp. Khi rig thêm tư thế cùng tên vào TU_THE thì TU_THE thắng
 * (xem `layTuThe`), file này chỉ là dự phòng để mẫu chạy được ngay.
 *
 * Quy ước góc chân trong rig (đọc từ nhan-vat.tsx::chanGoc): với CẢ HAI chân,
 * góc ÂM = bàn chân ra ngoài thân; chân trái dương / chân phải âm = cả hai đá
 * sang PHẢI màn; chân trái âm / chân phải dương = cả hai đá sang TRÁI màn.
 * `than` dương = ngả sang phải màn (hướng chạy khi chưa flip).
 */
const T = (canh: number, cang: number, ban: KieuTay = 'ep', xoay = 0): Tay => ({canh, cang, ban, xoay});
const buong = T(10, 6, 'ep');

/** biến thể tay của một tư thế đã có: giữ nguyên mọi thứ, chỉ dịch góc tay phải (để luân phiên A/B cùng kiểu) */
const doiTayPhai = (goc: TuThe, dCanh: number, dCang: number): TuThe => ({...goc, phai: {...goc.phai, canh: goc.phai.canh + dCanh, cang: goc.phai.cang + dCang}});

/** viết bảng gốc: ưu tiên tư thế rig, dự phòng của act */
const vietBangGoc: TuThe = TU_THE.vietBang ?? {trai: buong, phai: T(165, 178, 'cam'), quayLung: true};

export const TU_THE_MAY: Record<string, TuThe> = {
  /** chạy hình 1: bay, chân đá về sau (trái màn), tay trái vung lên */
  chay1: {trai: T(150, 178, 'nam'), phai: T(45, 115, 'nam'), than: 12, bay: 0.16, chan: {trai: -35, phai: 40}},
  /** chạy hình 2: chạm đất, chân xoạc dưới thân */
  chay2: {trai: T(95, 140, 'nam'), phai: T(95, 40, 'nam'), than: 12, bay: 0.02, chan: {trai: -25, phai: -25}},
  /** chạy hình 3: bay, chân đá ra trước (phải màn), tay đổi bên */
  chay3: {trai: T(45, 115, 'nam'), phai: T(150, 178, 'nam'), than: 12, bay: 0.12, chan: {trai: 40, phai: -30}},
  /** đi bộ hình 1: hai chân lệch sang trái, tay so le */
  di1: {trai: T(22, 30, 'ep'), phai: T(-18, -8, 'ep'), than: 3, chan: {trai: -14, phai: 14}},
  /** đi bộ hình 2: đối xứng di1 */
  di2: {trai: T(-18, -8, 'ep'), phai: T(22, 30, 'ep'), than: 3, chan: {trai: 14, phai: -14}},
  /** ngã ngồi bệt: hông chạm đất, chân xoè hếch lên, tay chống hai bên, người ngả sau */
  nga: {trai: T(115, 95, 'xoe'), phai: T(115, 95, 'xoe'), than: -16, dau: -12, bay: -0.6, chanNgan: 0.6, chan: {trai: -70, phai: -70}},
  /** ngồi bàn, tay phải nhấc lên gõ */
  ngoiGoBan: {...TU_THE.ngoi, phai: T(45, -25, 'nam')},
  /** ngồi gục đầu xuống bàn */
  ngoiGuc: {...TU_THE.ngoi, trai: T(14, 8, 'ep'), phai: T(14, 8, 'ep'), than: 20, dau: 32, coRut: 0.05},
  /** ôm bụng cười */
  omBung: {trai: T(35, -85, 'nam'), phai: T(35, -85, 'nam'), than: 14, dau: 8},
  /** viết bảng: tay phải giơ cao cầm phấn (rig có thì lấy của rig) */
  vietBang: vietBangGoc,
  /** viết bảng: cùng tư thế, tay hạ thấp hơn 15 độ (luân phiên với vietBang) */
  vietBang2: doiTayPhai(vietBangGoc, -15, -13),
};

/** tên tư thế → TuThe: ưu tiên TU_THE của rig, rồi TU_THE_MAY, cuối cùng đứng thường */
export const layTuThe = (ten?: string): TuThe => {
  if (!ten) return TU_THE.dung;
  return TU_THE[ten] ?? TU_THE_MAY[ten] ?? TU_THE.dung;
};

/** tư thế có tồn tại không (rig hoặc máy dùng) — cho validator */
export const coTuThe = (ten: string): boolean => Boolean(TU_THE[ten] ?? TU_THE_MAY[ten]);
