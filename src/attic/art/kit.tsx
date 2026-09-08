import React from 'react';
import {FONT} from '../font';
import {random} from 'remotion';

/** Bảng màu doodle: đậm, phẳng, viền dày — đọc được ở mọi kích cỡ. */
export const C = {
  ink: '#12131a',
  paper: '#fdf6e3',
  red: '#ff4d4d',
  amber: '#ffb020',
  gold: '#ffd23f',
  green: '#2ec27e',
  blue: '#4d9dff',
  purple: '#a374ff',
  pink: '#ff7ac6',
  brown: '#a9703f',
  grey: '#8b8f9e',
};

export const STROKE = {stroke: C.ink, strokeWidth: 7, strokeLinecap: 'round', strokeLinejoin: 'round'} as const;

/** Đường vẽ tay: thêm nhiễu nhỏ vào path để nét không "sạch" như máy. */
export const jitterPath = (points: [number, number][], seed: string, amp = 2.5) =>
  points
    .map(([x, y], i) => {
      const dx = (random(`${seed}x${i}`) - 0.5) * amp;
      const dy = (random(`${seed}y${i}`) - 0.5) * amp;
      return `${i === 0 ? 'M' : 'L'}${(x + dx).toFixed(1)},${(y + dy).toFixed(1)}`;
    })
    .join(' ');

/** Khung SVG chuẩn cho mọi cảnh art: 1200x800, canh giữa. */
export const ArtFrame: React.FC<{children: React.ReactNode; w?: number; h?: number}> = ({
  children,
  w = 1200,
  h = 800,
}) => (
  <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" style={{overflow: 'visible'}}>
    {children}
  </svg>
);

/** Tia sáng toả ra sau vật thể — trò cũ nhưng luôn hiệu quả. */
export const Sunburst: React.FC<{cx: number; cy: number; r?: number; n?: number; spin?: number; color?: string; opacity?: number}> = ({
  cx,
  cy,
  r = 700,
  n = 12,
  spin = 0,
  color = C.gold,
  opacity = 0.045,
}) => (
  <g transform={`rotate(${spin} ${cx} ${cy})`} opacity={opacity}>
    {new Array(n).fill(0).map((_, i) => {
      const a0 = (i / n) * Math.PI * 2;
      const a1 = a0 + Math.PI / n / 1.6;
      return (
        <path
          key={i}
          d={`M${cx},${cy} L${cx + Math.cos(a0) * r},${cy + Math.sin(a0) * r} L${cx + Math.cos(a1) * r},${
            cy + Math.sin(a1) * r
          } Z`}
          fill={color}
        />
      );
    })}
  </g>
);

/** Vệt tốc độ hai bên — cho cảm giác vật đang lao. */
export const SpeedLines: React.FC<{x: number; y: number; n?: number; len?: number; t?: number; color?: string}> = ({
  x,
  y,
  n = 7,
  len = 180,
  t = 0,
  color = C.ink,
}) => (
  <g opacity={0.55}>
    {new Array(n).fill(0).map((_, i) => {
      const off = (random(`sl${i}`) - 0.5) * 220;
      const l = len * (0.5 + random(`sll${i}`)) * (0.6 + 0.4 * Math.sin(t * 0.3 + i));
      return (
        <line
          key={i}
          x1={x}
          y1={y + off}
          x2={x - l}
          y2={y + off}
          stroke={color}
          strokeWidth={5}
          strokeLinecap="round"
        />
      );
    })}
  </g>
);

/** Mặt cười/mếu tối giản, tái dùng cho mọi nhân vật. */
export const Face: React.FC<{x: number; y: number; s?: number; mood?: 'happy' | 'sad' | 'shock' | 'smug' | 'dead'}> = ({
  x,
  y,
  s = 1,
  mood = 'happy',
}) => {
  const eye = (dx: number) =>
    mood === 'dead' ? (
      <g>
        <line x1={x + dx - 9 * s} y1={y - 9 * s} x2={x + dx + 9 * s} y2={y + 9 * s} {...STROKE} strokeWidth={6 * s} />
        <line x1={x + dx + 9 * s} y1={y - 9 * s} x2={x + dx - 9 * s} y2={y + 9 * s} {...STROKE} strokeWidth={6 * s} />
      </g>
    ) : mood === 'smug' ? (
      <path
        d={`M${x + dx - 11 * s},${y} Q${x + dx},${y - 11 * s} ${x + dx + 11 * s},${y}`}
        fill="none"
        {...STROKE}
        strokeWidth={6 * s}
      />
    ) : (
      <circle cx={x + dx} cy={y} r={(mood === 'shock' ? 13 : 8) * s} fill={C.ink} />
    );

  const mouth =
    mood === 'sad'
      ? `M${x - 26 * s},${y + 54 * s} Q${x},${y + 22 * s} ${x + 26 * s},${y + 54 * s}`
      : mood === 'shock'
        ? ''
        : `M${x - 30 * s},${y + 30 * s} Q${x},${y + 66 * s} ${x + 30 * s},${y + 30 * s}`;

  return (
    <g>
      {eye(-34 * s)}
      {eye(34 * s)}
      {mood === 'shock' ? (
        <ellipse cx={x} cy={y + 46 * s} rx={20 * s} ry={28 * s} fill={C.ink} />
      ) : (
        <path d={mouth} fill="none" {...STROKE} strokeWidth={7 * s} />
      )}
    </g>
  );
};

/** Tờ tiền doodle, tái dùng khắp nơi. */
export const Bill: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  rot?: number;
  label?: string;
  color?: string;
  opacity?: number;
}> = ({x, y, w = 150, h = 78, rot = 0, label = '₫', color = C.green, opacity = 1}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={opacity}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} fill={color} {...STROKE} />
    <circle cx={0} cy={0} r={h * 0.26} fill={C.paper} {...STROKE} strokeWidth={5} />
    <text
      x={0}
      y={h * 0.09}
      textAnchor="middle"
      fontSize={h * 0.34}
      fontWeight={900}
      fill={C.ink}
      fontFamily={FONT}
    >
      {label}
    </text>
  </g>
);
