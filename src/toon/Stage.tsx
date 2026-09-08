import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

export const W = 1600;
export const H = 900;

/** Cỡ cảnh — đúng thứ tạo ra nhịp cắt mà không phải vẽ tranh mới. */
export type Framing =
  | 'wide' // toàn cảnh
  | 'mid' // trung cảnh, thắt ngang người
  | 'close' // cận mặt
  | 'xclose' // đặc tả, chỉ mắt/miệng
  | 'prop'; // cận vật thể

/** Tâm và độ phóng cho từng cỡ cảnh. [cx, cy, zoom] theo hệ 1600x900. */
export type Frame = [number, number, number];

// Đầu nhân vật đứng ở nền (y=760) với scale 1.2 nằm quanh y≈340.
// Cỡ cảnh cận phải lấy đúng mốc đó, nếu không sẽ cắt vào khoảng trống.
export const FRAMES: Record<Framing, Frame> = {
  wide: [800, 480, 1],
  mid: [800, 520, 1.45],
  close: [800, 380, 2.2],
  xclose: [800, 360, 3.2],
  prop: [800, 460, 2.0],
};

/**
 * Sân khấu: nhận một cảnh vẽ ở hệ 1600x900 rồi cắt/phóng theo cỡ cảnh.
 * Cùng một cảnh, đổi `framing` là ra một shot khác hẳn — đây chính là cách
 * kênh explainer dựng 4 shot từ một bối cảnh duy nhất.
 */
export const Stage: React.FC<{
  children: React.ReactNode;
  framing?: Framing;
  /** dịch tâm khung so với mặc định của cỡ cảnh */
  offset?: [number, number];
  /** đẩy máy chậm trong suốt shot, 0 = đứng yên */
  push?: number;
  /** lia ngang, px trong hệ 1600 */
  pan?: number;
}> = ({children, framing = 'wide', offset = [0, 0], push = 0.04, pan = 0}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  const [cx, cy, z] = FRAMES[framing];
  const t = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.quad),
  });

  const zoom = z * (1 + push * t);
  const px = cx + offset[0] + pan * t;
  const py = cy + offset[1];

  // dịch sao cho (px,py) nằm giữa khung sau khi phóng
  const tx = W / 2 - px * zoom;
  const ty = H / 2 - py * zoom;

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{display: 'block'}}>
        <g transform={`translate(${tx} ${ty}) scale(${zoom})`}>{children}</g>
      </svg>
    </AbsoluteFill>
  );
};
