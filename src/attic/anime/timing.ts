import {useCurrentFrame, useVideoConfig} from 'remotion';

/**
 * Điểm nhận dạng lớn nhất của anime không nằm ở nét vẽ mà ở NHỊP HÌNH.
 *
 * Anime TV vẽ 8–12 hình/giây chứ không phải 24: một hình được giữ nguyên
 * trong 2 frame ("on twos") hoặc 3 frame ("on threes"). Chuyển động 30fps
 * mượt như motion graphic là thứ khiến video trông "không phải anime".
 *
 * `step` lượng tử hoá frame về nhịp đó. Mọi chuyển động của nhân vật phải
 * đi qua hàm này; chỉ hiệu ứng máy (zoom, pan) mới được chạy mượt — đúng
 * như anime thật, nơi nền và camera chạy mượt còn nhân vật thì giật nhịp.
 */
export const step = (frame: number, n: 1 | 2 | 3 | 4 = 2) => Math.floor(frame / n) * n;

/** Nhịp hình theo frame hiện tại. */
export const useStep = (n: 1 | 2 | 3 | 4 = 2) => step(useCurrentFrame(), n);

/**
 * Framerate modulation: chậm lúc bình thường, bung lên full lúc cao trào.
 * Đây là cách anime dồn ngân sách — 90% thời lượng vẽ thưa để dành sức cho
 * vài giây "sakuga" vẽ dày.
 *
 * `bursts` là các khoảng [từ, đến] tính bằng frame sẽ chạy full 1s.
 */
export const useModulated = (base: 1 | 2 | 3 | 4 = 3, bursts: [number, number][] = []) => {
  const frame = useCurrentFrame();
  const hot = bursts.some(([a, b]) => frame >= a && frame < b);
  return step(frame, hot ? 1 : base);
};

/** Giữ nguyên giá trị trong `hold` frame rồi mới nhảy — dùng cho hình tĩnh có nhịp. */
export const holdFrames = (frame: number, hold: number) => Math.floor(frame / hold);

/**
 * Impact frame: 1–2 frame đảo màu ngay lúc va chạm.
 * Trả về 0..1 — cường độ đảo màu tại frame hiện tại.
 */
export const impactAt = (frame: number, at: number, len = 2) =>
  frame >= at && frame < at + len ? 1 : 0;

/** Ba nhịp giật khi vật rơi/đập — anime hay giữ 1 frame, nhả, giữ lại. */
export const hitStop = (frame: number, at: number) => {
  const t = frame - at;
  if (t < 0) return 0;
  if (t < 2) return 1;
  if (t < 4) return 0.4;
  if (t < 6) return 0.15;
  return 0;
};

export const useFps = () => useVideoConfig().fps;
