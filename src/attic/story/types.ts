import type {Mood} from '../cast/Cast';

/** Nơi chốn — nhân vật không bao giờ trôi trên nền trống. */
export type Place = 'quan' | 'sieuthi' | 'phong' | 'pho' | 'kho' | 'trong' | 'do';

export type Actor =
  | {who: 'teo'; mood?: Mood; x?: number; s?: number; flip?: boolean; vi?: number; cam?: 'tien' | 'pho'}
  | {who: 'phong'; size?: number; mood?: 'cuoi' | 'doi' | 'no' | 'nham'; x?: number; y?: number; s?: number}
  | {who: 'sep'; x?: number; s?: number; flip?: boolean};

export type Prop =
  | {p: 'pho'; x?: number; y?: number; s?: number; thit?: number}
  | {p: 'gia'; x?: number; y?: number; text: string; mau?: 'do' | 'xanh'}
  | {p: 'banhmi'; x?: number; y?: number; s?: number; n?: number}
  | {p: 'tien'; x?: number; y?: number; s?: number; n?: number}
  | {p: 'bimbim'; x?: number; y?: number; s?: number; phong?: number; gram?: number}
  | {p: 'ghe'; x?: number; y?: number; s?: number}
  | {p: 'bangluong'; x?: number; y?: number; s?: number; tang?: string; gia?: string}
  | {p: 'socola'; x?: number; y?: number; s?: number; cacao?: number}
  | {p: 'mayin'; x?: number; y?: number; s?: number};

/** Lớp chữ đè lên hình. Chỉ dùng khi lời bình thật sự cần một con số/thuật ngữ. */
export type Overlay =
  | {o: 'khung'; text: string; sub?: string} // chữ to toàn màn hình
  | {o: 'thuatngu'; term: string; nghia: string} // thẻ giải nghĩa thuật ngữ
  | {o: 'so'; value: number; prefix?: string; suffix?: string; label?: string}
  | {o: 'meme'; src: string; cap?: string};

export type Enter = 'cut' | 'whipL' | 'whipR' | 'day' | 'zoom' | 'no' | 'truot';

export type Sfx = 'whoosh-up' | 'whoosh-down' | 'whoosh-short' | 'pop' | 'pop-high' | 'thud' | 'ding' | 'cash' | 'deflate' | 'inflate' | 'boom' | 'riser' | 'tick';

export type Shot = {
  /** Mẩu lời bình mà shot này minh hoạ. Timing lấy từ đúng câu này,
   *  nên hình luôn khớp tiếng — không đoán, không chia đều. */
  say: string;
  place?: Place;
  /** cỡ cảnh */
  cut?: 'rong' | 'trung' | 'can' | 'sat';
  /** dịch tâm khung [x, y] trong hệ 1920x1080 */
  nhin?: [number, number];
  actors?: Actor[];
  props?: Prop[];
  overlay?: Overlay;
  enter?: Enter;
  sfx?: Sfx;
  /** rung/đập màn hình ngay khi vào shot */
  dap?: boolean;
};

export type ChapterBoard = {
  id: string;
  shots: Shot[];
};
