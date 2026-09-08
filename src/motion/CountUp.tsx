import React from 'react';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {wobble} from './easing';

const vnNumber = (n: number, decimals = 0) =>
  n.toLocaleString('vi-VN', {minimumFractionDigits: decimals, maximumFractionDigits: decimals});

/** Số chạy lên rồi giật một cái khi chốt — mắt người bám số đang chuyển động. */
export const CountUp: React.FC<{
  to: number;
  from?: number;
  durationInFrames?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  size?: number;
  color?: string;
}> = ({
  to,
  from = 0,
  durationInFrames = 34,
  delay = 0,
  prefix = '',
  suffix = '',
  decimals = 0,
  size = 150,
  color = '#ffd23f',
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame - delay;

  const value = interpolate(t, [0, durationInFrames], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const settle = wobble(frame, delay + durationInFrames, 0.55, 0.3);
  const scale = 1 + Math.max(0, settle) * 0.12;
  const appear = interpolate(t, [0, 4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: size,
        fontWeight: 900,
        color,
        opacity: appear,
        transform: `scale(${scale})`,
        fontVariantNumeric: 'tabular-nums',
        textShadow: `0 0 60px ${color}55, 0 10px 30px rgba(0,0,0,0.8)`,
        letterSpacing: -3,
      }}
    >
      {prefix}
      {vnNumber(value, decimals)}
      {suffix}
    </span>
  );
};
