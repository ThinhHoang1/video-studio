/**
 * Kiểu nhân vật.
 *
 * Trước đây cả video chỉ có một người, mọi chương đều là anh ta đứng kể lại —
 * kể cả những đoạn đáng ra phải có hai người nói chuyện với nhau. Đó là lý do
 * xem chán: không có ai để nhìn qua nhìn lại.
 *
 * Một `Kieu` gói toàn bộ ngoại hình: tóc, màu da, quần áo, dáng người. Bộ
 * khung xương và tư thế dùng chung, nên thêm một nhân vật chỉ tốn một mục
 * trong bảng này chứ không phải vẽ lại từ đầu.
 */

export type KieuToc =
  | 'ngan-mai'    // nam, tóc ngắn có mái lệch
  | 'duoi-ngua'   // nữ, buộc cao đuôi ngựa
  | 'xoa-dai'     // nữ, tóc dài xoã hai vai
  | 'bob'         // nữ, tóc ngắn ngang cằm
  | 'xoan'        // nam, tóc xoăn bồng
  | 'bui'         // nữ lớn tuổi, búi sau gáy
  | 'hoi-bac';    // nam lớn tuổi, tóc chải, hai bên bạc

export type Dang_Nguoi = 'gay' | 'thuong' | 'day';

export type Kieu = {
  ten: string;
  toc: KieuToc;
  /** màu tóc: [chính, tối, sáng] */
  mauToc: [string, string, string];
  /** màu da: [chính, tối] */
  mauDa: [string, string];
  /** màu áo: [chính, tối, sáng] */
  mauAo: [string, string, string];
  mauQuan: [string, string];
  /** váy thay cho quần */
  vay?: boolean;
  than: Dang_Nguoi;
  /** cao hơn / thấp hơn mức chuẩn, hệ số nhân */
  cao: number;
  /** phụ kiện */
  kinh?: boolean;
  caVat?: string;
  /** có đeo túi chéo không */
  tui?: boolean;
};

export const KIEU: Record<string, Kieu> = {
  /** NAM — nhân vật chính, nam sinh cấp ba. Hiền, hơi vụng. */
  nam: {
    ten: 'Nam',
    toc: 'ngan-mai',
    mauToc: ['#2b2333', '#1e1826', '#483d56'],
    mauDa: ['#f5c9a0', '#dda57e'],
    mauAo: ['#fdfaf4', '#dcd6c8', '#ffffff'],
    mauQuan: ['#39405c', '#2a3046'],
    than: 'gay',
    cao: 1.0,
    caVat: '#c0392b',
    tui: true,
  },

  /** HÀ — mối tình đầu. Tóc đuôi ngựa, áo dài trắng. */
  ha: {
    ten: 'Hà',
    toc: 'duoi-ngua',
    mauToc: ['#251d2c', '#181220', '#453a52'],
    mauDa: ['#fbd7b4', '#e5b28d'],
    mauAo: ['#ffffff', '#e4ded0', '#ffffff'],
    mauQuan: ['#ffffff', '#e0dace'],
    vay: true,
    than: 'gay',
    cao: 0.95,
    tui: false,
  },

  /** LONG — bạn thân của Nam. To con, ồn ào. */
  long: {
    ten: 'Long',
    toc: 'xoan',
    mauToc: ['#3a2a22', '#291d18', '#5c4436'],
    mauDa: ['#e0ab7c', '#c68d61'],
    mauAo: ['#4a72c8', '#36549b', '#6a92e0'],
    mauQuan: ['#3d4152', '#2c303e'],
    than: 'day',
    cao: 1.04,
    tui: false,
  },

  /** MAI — bạn thân của Hà. Tóc bob, đeo kính. */
  mai: {
    ten: 'Mai',
    toc: 'bob',
    mauToc: ['#4a2e26', '#35201a', '#6d4638'],
    mauDa: ['#f7d0ae', '#dfae87'],
    mauAo: ['#ffffff', '#e4ded0', '#ffffff'],
    mauQuan: ['#2f3d5c', '#232e46'],
    vay: true,
    than: 'thuong',
    cao: 0.94,
    kinh: true,
    tui: true,
  },

  /** MẸ — mẹ của Nam. */
  me: {
    ten: 'Mẹ',
    toc: 'bui',
    mauToc: ['#2e2630', '#201a22', '#4d4350'],
    mauDa: ['#f0c49a', '#d6a077'],
    mauAo: ['#8a6f9e', '#6d5680', '#a68cb8'],
    mauQuan: ['#4a4058', '#372f42'],
    vay: true,
    than: 'thuong',
    cao: 0.97,
    tui: false,
  },

  /** THẦY — giáo viên chủ nhiệm. */
  thay: {
    ten: 'Thầy',
    toc: 'hoi-bac',
    mauToc: ['#4a4a52', '#33333a', '#8e8e98'],
    mauDa: ['#e8bd92', '#cf9c70'],
    mauAo: ['#dfe3e8', '#c2c7cf', '#f0f3f6'],
    mauQuan: ['#2c3446', '#1f2533'],
    than: 'thuong',
    cao: 1.02,
    kinh: true,
    caVat: '#2f5d8a',
    tui: false,
  },

  /** HÀ lớn — Hà sau nhiều năm, dùng cho chương cuối. */
  'ha-lon': {
    ten: 'Hà',
    toc: 'xoa-dai',
    mauToc: ['#2b2130', '#1c1522', '#4c4058'],
    mauDa: ['#fbd7b4', '#e5b28d'],
    mauAo: ['#c98a9a', '#a86a7a', '#e0a8b6'],
    mauQuan: ['#3a3448', '#2a2536'],
    than: 'thuong',
    cao: 0.97,
    tui: false,
  },

  /** NAM lớn — Nam sau nhiều năm. */
  'nam-lon': {
    ten: 'Nam',
    toc: 'ngan-mai',
    mauToc: ['#2b2333', '#1e1826', '#483d56'],
    mauDa: ['#f0c49a', '#d6a077'],
    mauAo: ['#5b7fa8', '#42607f', '#7c9fc4'],
    mauQuan: ['#333a4e', '#252b3a'],
    than: 'thuong',
    cao: 1.02,
    tui: false,
  },
};

/** Hệ số bề ngang thân theo dáng người. */
export const BE_NGANG: Record<Dang_Nguoi, {vai: number; eo: number; hong: number}> = {
  gay:     {vai: 0.92, eo: 0.88, hong: 0.9},
  thuong:  {vai: 1.0,  eo: 1.0,  hong: 1.0},
  day:     {vai: 1.12, eo: 1.2,  hong: 1.14},
};
