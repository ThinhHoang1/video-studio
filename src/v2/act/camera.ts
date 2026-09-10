import {H, HOLD, NHIP_TRANG, frameCua, MucHold, MucNhipTrang, giayCua} from './nhip';

/**
 * Tiện ích chuyển động cấp khung: pop-scale, zoom-gag, nhịp trắng, hold.
 * Tất cả là hàm thuần của frame; không interpolate, không ease.
 */

/** pop 4 frame đo trên bong bóng 3:40 (timing.md 2.7): 8% → 95% → 104.5% → 100% rồi giữ */
export const POP_SCALE = [0.08, 0.95, 1.045, 1] as const;

/**
 * Hệ số phóng của vật vừa hiện. `frameTuLucHien` = frame hiện tại trừ frame xuất hiện.
 * Âm (chưa hiện) → 0. Từ frame 3 trở đi → 1.
 */
export const popScale = (frameTuLucHien: number): number => {
  if (frameTuLucHien < 0) return 0;
  return POP_SCALE[Math.min(3, Math.floor(frameTuLucHien))];
};

/** zoom-gag: tuyến tính +0.45 cỡ đầu mỗi frame, 8..10 frame (mặc định 9) rồi CẮT — không ease-out */
export const ZOOM_GAG = {heSoMoiFrame: 0.45, soFrame: 9} as const;

/**
 * Hệ số zoom tại frame thứ `k` kể từ lúc bắt đầu gag. Mỗi frame cộng thêm
 * 0.45 × (cỡ đầu / chiều cao khung); sau `soFrame` frame giữ nguyên (shot nên kết ngay).
 * Trước lúc bắt đầu (k < 0) → 1.
 */
export const zoomGagFrame = (k: number, dauPx: number, soFrame: number = ZOOM_GAG.soFrame): number => {
  const b = Math.max(0, Math.min(soFrame, Math.floor(k)));
  return 1 + b * ZOOM_GAG.heSoMoiFrame * (dauPx / H);
};

/** zoom-gag theo giây trong shot: `t` hiện tại, `batDau` mốc bắt đầu gag, `dauPx` cỡ đầu đang vẽ */
export const zoomGag = (t: number, batDau: number, dauPx: number, soFrame: number = ZOOM_GAG.soFrame): number =>
  zoomGagFrame(frameCua(t) - frameCua(batDau), dauPx, soFrame);

/** độ dài nhịp trắng (giây) theo mức: ngan 0.5 | vua 0.75 | dai 1.2 */
export const nhipTrang = (muc: MucNhipTrang = 'vua'): number => NHIP_TRANG[muc];

/** hold (frame) theo mức đo được: ngan 12 | vua 25 | dai 45 */
export const holdFrame = (muc: MucHold = 'vua'): number => HOLD[muc];
/** hold (giây) theo mức */
export const holdGiay = (muc: MucHold = 'vua'): number => giayCua(HOLD[muc]);

/** chuỗi hold luân phiên để rải beat tự động không đều tăm tắp (frame): 25 12 45 25 12 36 */
const HOLD_CHUOI = [HOLD.vua, HOLD.ngan, HOLD.dai, HOLD.vua, HOLD.ngan, 36] as const;
/** hold thứ `i` trong chuỗi (frame) — dùng khi cần tự chia nhịp cho một dãy trạng thái */
export const nhipHold = (i: number): number => HOLD_CHUOI[((i % HOLD_CHUOI.length) + HOLD_CHUOI.length) % HOLD_CHUOI.length];

/**
 * Chia một khoảng `dai` giây thành các mốc beat (giây, tính từ 0) theo chuỗi hold.
 * Mốc đầu luôn là 0; mốc cuối < dai. Dùng cho agent/renderer cần "đổi gì đó mỗi 0.4–1.5 s".
 */
export const chiaBeat = (dai: number): number[] => {
  const tong = frameCua(dai);
  const ra: number[] = [];
  let f = 0;
  let i = 0;
  while (f < tong) {
    ra.push(giayCua(f));
    f += nhipHold(i++);
  }
  return ra;
};
