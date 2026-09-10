import type {KieuToc} from './toc';

/**
 * Dàn nhân vật V2 — thiết kế gốc, học nguyên tắc chứ không sao chép.
 *
 * Mỗi người: một kiểu tóc một màu, tối đa MỘT phụ kiện, áo pastel MỘT màu phẳng.
 * Bản sắc riêng (phương án A "Đậu", chọn 2026-09-10): mắt hạt đậu nghiêng có khe sáng,
 * mũi gạch, tai, áo pastel — khác storytime gốc ở 4 điểm nhận diện, giữ tỉ lệ 2.6 đầu.
 * Nhân vật phụ `trang` giữ áo trắng không mặt để làm nền đám đông.
 */
export type PhuKien = 'khong' | 'kinh' | 'no' | 'mu-luoi-trai' | 'huy-hieu' | 'ca-vat' | 'khan';

/**
 * Phong cách hình — tuỳ chọn để dàn nhân vật có bản sắc riêng (khác storytime gốc).
 * Mọi trường đều tuỳ chọn; thiếu = PHONG_CACH_MAC_DINH = đúng hình cũ.
 *
 *   mat   : oval (oval đen đặc) | hat-dau (hạt đậu nghiêng 12°, khe sáng) | tron-nguoi (vòng viền + ngươi to) | lech (một to một nhỏ 0.8)
 *   mui   : khong | cham | gach (gạch cong ngắn) | moc (móc câu nghiêng)
 *   tai   : nửa vòng tròn hai bên sọ (ẩn khi tóc che / bên xa ở góc nghiêng)
 *   mauAo : tô phẳng thân + tay áo ngắn; mauQuan: tô phẳng hông + ống chân
 *   coAo  : v (mặc định) | tron | so-mi
 *   tiLe  : lun (2.3 DAU, đầu to) | chuan (2.6) | cao (3.0, chân dài) — chỉ khung CHINH
 */
export type PhongCach = {
  mat?: 'oval' | 'hat-dau' | 'tron-nguoi' | 'lech';
  mui?: 'khong' | 'cham' | 'gach' | 'moc';
  tai?: boolean;
  mauAo?: string;
  mauQuan?: string;
  coAo?: 'v' | 'tron' | 'so-mi';
  tiLe?: 'lun' | 'chuan' | 'cao';
};

export const PHONG_CACH_MAC_DINH: Required<Omit<PhongCach, 'mauAo' | 'mauQuan'>> & Pick<PhongCach, 'mauAo' | 'mauQuan'> = {
  mat: 'oval',
  mui: 'khong',
  tai: false,
  mauAo: undefined,
  mauQuan: undefined,
  coAo: 'v',
  tiLe: 'chuan',
};

/** gộp phong cách của một Kieu với mặc định — mọi trường đều có giá trị */
export const layPhongCach = (k: Kieu) => ({...PHONG_CACH_MAC_DINH, ...(k.phongCach ?? {})});

export type Kieu = {
  ten: string;
  toc: KieuToc;
  phuKien?: PhuKien;
  /** màu nhấn cho phụ kiện */
  mauNhan?: string;
  /** khung xương: chính (2.6 đầu) hay phụ (3.6 đầu, cao, người lớn) */
  khung?: 'chinh' | 'phu';
  /** hệ số cỡ so với nhân vật chính (trẻ con 0.8, người lớn 1.1) */
  co?: number;
  /** phong cách hình (mắt/mũi/tai/màu áo/cổ áo/tỉ lệ) — bỏ trống = hình gốc */
  phongCach?: PhongCach;
};

export const KIEU: Record<string, Kieu> = {
  nam: {ten: 'Nam', toc: {mau: '#1c1a22', mai: 'hat', lon: 0, sau: 'ngan'}, phuKien: 'ca-vat', mauNhan: '#c0392b', phongCach: {mat: 'hat-dau', mui: 'gach', tai: true, mauAo: '#bfe8dc'}},
  ha: {ten: 'Hà', toc: {mau: '#2b1a12', mai: 'lech-trai', lon: 2, sau: 'duoi-ngua'}, phuKien: 'no', mauNhan: '#c0392b', phongCach: {mat: 'hat-dau', mui: 'gach', tai: true, mauAo: '#f6c9d4'}},
  long: {ten: 'Long', toc: {mau: '#3a2a1c', mai: 'dung', lon: 0, sau: 'ngan'}, phuKien: 'khong', co: 1.05, phongCach: {mat: 'hat-dau', mui: 'gach', tai: true, mauAo: '#f7e7a9'}},
  mai: {ten: 'Mai', toc: {mau: '#5a3b1e', mai: 'ngang', lon: 2, sau: 'bob'}, phuKien: 'kinh', phongCach: {mat: 'hat-dau', mui: 'gach', tai: true, mauAo: '#bfe0f5'}},
  me: {ten: 'Mẹ', toc: {mau: '#2a2126', mai: 're-giua', lon: 0, sau: 'bui'}, phuKien: 'khong', khung: 'phu', co: 0.95, phongCach: {mat: 'hat-dau', mui: 'gach', tai: true, mauAo: '#d9c8f0'}},
  thay: {ten: 'Thầy', toc: {mau: '#8a8a8a', mai: 're-giua', lon: 0, sau: 'ngan'}, phuKien: 'kinh', khung: 'phu', phongCach: {mat: 'hat-dau', mui: 'gach', tai: true, mauAo: '#e1e1e1'}},
  'nam-lon': {ten: 'Nam 30', toc: {mau: '#1c1a22', mai: 'lech-phai', lon: 0, sau: 'ngan'}, phuKien: 'khong', co: 1.05, phongCach: {mat: 'hat-dau', mui: 'gach', tai: true, mauAo: '#f8d3b0'}},
  'ha-lon': {ten: 'Hà 30', toc: {mau: '#2b1a12', mai: 'lech-trai', lon: 2, sau: 'dai'}, phuKien: 'khong', phongCach: {mat: 'hat-dau', mui: 'gach', tai: true, mauAo: '#cfe8b8'}},
  /** nhân vật phụ vô danh — đầu trắng không mặt; tóc tuỳ chọn */
  trang: {ten: 'người', toc: {mau: '#fdfdfd', mai: 'ngang', lon: 0, sau: 'khong'}, khung: 'phu'},
};

export const TEN_KIEU = Object.keys(KIEU);
