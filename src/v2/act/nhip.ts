import {FPS} from '../../engine/theme';

/**
 * Hằng số nhịp cho thư viện mẫu hành động (src/v2/act).
 *
 * Mọi số đo gốc ở docs/tham-chieu/timing.md là 24 fps trên 1280x720; ở đây đã
 * quy về FPS của repo (30) và khung 1920x1080. Không có ease, không interpolate:
 * chuyển động = chuỗi trạng thái rời đổi tức thời tại mốc frame.
 */
export {FPS};

/** khung chuẩn của phim (px) */
export const W = 1920;
export const H = 1080;

/** giây (trong shot) → frame, làm tròn về frame gần nhất; dùng để so mốc, tránh sai số float */
export const frameCua = (giay: number) => Math.round(giay * FPS);
/** frame → giây */
export const giayCua = (frame: number) => frame / FPS;

/**
 * Hold giữa hai trạng thái (frame @30fps). Đo được @24fps: p25 = 10, p50 = 20,
 * p75 = 36 → quy đổi 12 / 25 / 45. Tối thiểu đo được: 6 frame @24 = 8 frame @30.
 */
export const HOLD = {toiThieu: 8, ngan: 12, vua: 25, dai: 45} as const;
export type MucHold = Exclude<keyof typeof HOLD, 'toiThieu'>;

/** nhịp trắng giữa hai ý (giây): đo 12..30 frame @24, trung vị 18 → 0.5 / 0.75 / 1.2 s */
export const NHIP_TRANG = {ngan: 0.5, vua: 0.75, dai: 1.2} as const;
export type MucNhipTrang = keyof typeof NHIP_TRANG;

/** trượt vị trí khi chạy: 24 px/frame @720p → 36 px/frame @1080p (on ones) */
export const PX_CHAY = 36;
/** trượt vị trí khi đi bộ (không có mẫu đo, lấy ~40% tốc độ chạy) */
export const PX_DI = 14;
/** chạy: mỗi hình giữ 2 frame (on twos); đi: mỗi hình 4 frame */
export const GIU_CHAY = 2;
export const GIU_DI = 4;

/** vượt đích (overshoot) 1 frame khi tới chỗ — tỉ lệ bề rộng khung, cùng hằng với renderer `vao: 'lao'` */
export const VUOT = 0.015;
/** vị trí chân khi đứng hẳn ngoài mép khung (tỉ lệ bề rộng khung, âm = ngoài mép trái) */
export const NGOAI_KHUNG = 0.06;
/** frame key "lao vào": khoảng lùi tối thiểu so với chỗ đứng khi chỗ đứng đã sát mép (tỉ lệ bề rộng khung); bình thường key đặt chân đúng mép 0 hoặc 1 */
export const LUI_LAO = 0.12;
