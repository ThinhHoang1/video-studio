import React from 'react';
import {random} from 'remotion';
import {C, L, L4} from '../cast/Cast';
import type {Place} from './types';

export const W = 1920;
export const H = 1080;
export const SAN = 900; // cao độ mặt sàn

/** Quán ăn vỉa hè. */
const Quan: React.FC = () => (
  <g>
    <rect x={0} y={0} width={W} height={H} fill="#f2d9a8" />
    {new Array(10).fill(0).map((_, i) => (
      <rect key={i} x={i * 192} y={0} width={96} height={SAN} fill="#ecd09a" />
    ))}
    <rect x={-20} y={120} width={W + 40} height={56} fill={C.paper} {...L} />
    {new Array(16).fill(0).map((_, i) => (
      <rect key={`a${i}`} x={-20 + i * 124} y={120} width={62} height={56} fill="#c94f3d" />
    ))}
    <rect x={120} y={176} width={22} height={724} fill="#a06a34" {...L4} />
    <rect x={1778} y={176} width={22} height={724} fill="#a06a34" {...L4} />
    <rect x={0} y={SAN} width={W} height={H - SAN} fill="#c98f52" {...L} />
  </g>
);

/** Siêu thị. */
const SieuThi: React.FC = () => (
  <g>
    <rect x={0} y={0} width={W} height={H} fill="#eef1f4" />
    {[0, 1, 2].map((r) => (
      <g key={r}>
        <rect x={60} y={150 + r * 210} width={1800} height={24} fill="#9aa4b0" {...L4} />
        {new Array(13).fill(0).map((_, i) => (
          <rect
            key={i}
            x={90 + i * 138}
            y={46 + r * 210}
            width={110}
            height={104}
            rx={10}
            fill={['#e46a6a', '#5fa8e0', '#8ccf6a', '#f0b23f', '#a98ae0'][(i + r) % 5]}
            {...L4}
          />
        ))}
      </g>
    ))}
    <rect x={0} y={SAN} width={W} height={H - SAN} fill="#cfd6dd" {...L} />
  </g>
);

/** Phòng trong nhà. */
const Phong: React.FC = () => (
  <g>
    <rect x={0} y={0} width={W} height={H} fill="#e8dcc4" />
    <rect x={0} y={0} width={W} height={SAN} fill="#e3d3b4" />
    <rect x={1360} y={150} width={380} height={290} rx={12} fill="#a9dcf0" {...L} />
    <line x1={1550} y1={150} x2={1550} y2={440} {...L4} />
    <line x1={1360} y1={295} x2={1740} y2={295} {...L4} />
    <rect x={0} y={SAN} width={W} height={H - SAN} fill="#b58a5c" {...L} />
  </g>
);

/** Đường phố. */
const Pho: React.FC = () => (
  <g>
    <rect x={0} y={0} width={W} height={H} fill="#b8e2f5" />
    {[0, 1, 2, 3, 4].map((i) => (
      <rect
        key={i}
        x={80 + i * 380}
        y={180 + (i % 2) * 60}
        width={260}
        height={720}
        fill={['#e0b08a', '#c9d4e0', '#dbc48f', '#c4b5d6', '#d8a8a8'][i]}
        {...L4}
      />
    ))}
    <rect x={0} y={SAN} width={W} height={H - SAN} fill="#9aa4b0" {...L} />
  </g>
);

/** Kho / nhà máy — dùng cho cảnh in tiền. */
const Kho: React.FC = () => (
  <g>
    <rect x={0} y={0} width={W} height={H} fill="#cfd8e0" />
    {new Array(7).fill(0).map((_, i) => (
      <rect key={i} x={110 + i * 260} y={90} width={160} height={200} rx={10} fill="#aebac6" {...L4} />
    ))}
    <rect x={0} y={SAN} width={W} height={H - SAN} fill="#8d99a6" {...L} />
  </g>
);

/** Nền trống có màu — dùng cho card chữ, không dùng cho cảnh có nhân vật. */
const Trong: React.FC = () => <rect x={0} y={0} width={W} height={H} fill="#1b1726" />;

/** Ngập tiền đỏ — đỉnh điểm siêu lạm phát. */
const Do: React.FC = () => (
  <g>
    <rect x={0} y={0} width={W} height={H} fill="#8f2320" />
    {new Array(60).fill(0).map((_, i) => (
      <g
        key={i}
        transform={`translate(${random(`x${i}`) * W} ${random(`y${i}`) * H}) rotate(${random(`r${i}`) * 360})`}
      >
        <rect x={-58} y={-28} width={116} height={56} rx={6} fill="#e05a5a" {...L4} />
      </g>
    ))}
  </g>
);

export const PLACES: Record<Place, React.FC> = {
  quan: Quan,
  sieuthi: SieuThi,
  phong: Phong,
  pho: Pho,
  kho: Kho,
  trong: Trong,
  do: Do,
};
