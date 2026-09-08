import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {breathe} from './easing';

export type CameraMove = {
  /** độ, xoay quanh trục ngang (ngẩng/cúi) */
  rotateX?: [number, number];
  /** độ, xoay quanh trục dọc (liếc trái/phải) */
  rotateY?: [number, number];
  rotateZ?: [number, number];
  /** px, tiến/lùi trong không gian 3D */
  z?: [number, number];
  x?: [number, number];
  y?: [number, number];
  scale?: [number, number];
};

/**
 * Bọc cả cảnh trong một "camera" 3D có perspective thật.
 * Mọi thứ bên trong đặt translateZ khác nhau sẽ tự có parallax.
 */
export const Camera3D: React.FC<{
  children: React.ReactNode;
  move?: CameraMove;
  perspective?: number;
  /** rung tay cầm máy, 0 = tắt */
  handheld?: number;
  breathing?: boolean;
}> = ({children, move = {}, perspective = 1400, handheld = 0.6, breathing = true}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 300], [0, 1], {extrapolateRight: 'extend'});

  const range = (r: [number, number] | undefined, dflt = 0) =>
    r ? interpolate(p, [0, 1], r) : dflt;

  // rung tay cầm: nhiễu tần số thấp, không phải rung giật ngẫu nhiên từng frame
  const n = (seed: string, speed: number) => {
    const t = frame * speed;
    const i = Math.floor(t);
    const f = t - i;
    const a = random(`${seed}${i}`) - 0.5;
    const b = random(`${seed}${i + 1}`) - 0.5;
    return a + (b - a) * (f * f * (3 - 2 * f));
  };

  const hx = handheld ? n('hx', 0.035) * 14 * handheld : 0;
  const hy = handheld ? n('hy', 0.028) * 10 * handheld : 0;
  const hr = handheld ? n('hr', 0.022) * 0.5 * handheld : 0;

  const scale = range(move.scale, 1) * (breathing ? breathe(frame) : 1);

  return (
    <AbsoluteFill style={{perspective, perspectiveOrigin: '50% 50%', overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          transformStyle: 'preserve-3d',
          transform: [
            `translate3d(${range(move.x) + hx}px, ${range(move.y) + hy}px, ${range(move.z)}px)`,
            `rotateX(${range(move.rotateX)}deg)`,
            `rotateY(${range(move.rotateY)}deg)`,
            `rotateZ(${range(move.rotateZ) + hr}deg)`,
            `scale(${scale})`,
          ].join(' '),
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Đặt con vào một mặt phẳng độ sâu cụ thể để ăn parallax của Camera3D. */
export const Plane: React.FC<{z?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  z = 0,
  children,
  style,
}) => (
  <AbsoluteFill style={{transformStyle: 'preserve-3d', transform: `translateZ(${z}px)`, ...style}}>
    {children}
  </AbsoluteFill>
);
