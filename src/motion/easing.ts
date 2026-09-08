import {Easing, interpolate, spring} from 'remotion';

/** Bung ra rồi giật ngược lại — kiểu pop của editor TikTok/MrBeast. */
export const overshoot = (frame: number, fps: number, delay = 0, bounce = 0.55) =>
  spring({frame: frame - delay, fps, config: {damping: 9, mass: 0.55, stiffness: 190}, durationInFrames: undefined}) *
  (1 + 0) + 0 * bounce;

/** Spring nảy mạnh, dùng cho chữ và icon nhảy vào. */
export const bounceIn = (frame: number, fps: number, delay = 0) =>
  spring({frame: frame - delay, fps, config: {damping: 8.5, mass: 0.5, stiffness: 200}});

/** Spring chắc tay, không nảy — dùng cho khối lớn. */
export const glideIn = (frame: number, fps: number, delay = 0) =>
  spring({frame: frame - delay, fps, config: {damping: 22, mass: 0.8, stiffness: 120}});

/** Snap cực nhanh: 3 frame là xong. Dùng cho cut-in đúng nhịp. */
export const snap = (frame: number, delay = 0, len = 3) =>
  interpolate(frame - delay, [0, len], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

/** Nhịp thở lặp vô hạn, biên độ nhỏ — giữ khung hình luôn "sống". */
export const breathe = (frame: number, period = 90, amp = 0.012) =>
  1 + Math.sin((frame / period) * Math.PI * 2) * amp;

/** Dao động tắt dần — dùng làm rung sau cú đập. */
export const wobble = (frame: number, delay = 0, freq = 0.38, decay = 0.12) => {
  const t = Math.max(0, frame - delay);
  return Math.sin(t * freq * Math.PI) * Math.exp(-t * decay);
};

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
