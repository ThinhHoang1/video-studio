export type ShotKind =
  | 'wide' // toàn cảnh tranh, đẩy chậm
  | 'detail' // crop sát vào một vùng của chính tranh đó -> cảm giác đổi máy
  | 'statement' // card chữ to toàn màn hình
  | 'number' // một con số khổng lồ
  | 'meme' // meme full-bleed
  | 'split'; // tranh một bên, chữ một bên

export type Shot = {
  kind: ShotKind;
  from: number; // frame bắt đầu, tính trong chương
  duration: number;
  /** vùng zoom cho kind='detail': [x, y, scale] theo hệ 0..1 của khung tranh */
  focus?: [number, number, number];
  text?: string;
  value?: number;
  prefix?: string;
  suffix?: string;
  meme?: string;
  memeCap?: string;
  /** hướng cú chuyển vào shot */
  enter: 'cut' | 'whipL' | 'whipR' | 'pushUp' | 'pushDown' | 'zoomBlur' | 'slideL' | 'slideR';
};
