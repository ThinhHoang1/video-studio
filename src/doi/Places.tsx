import React from 'react';
import {random, useCurrentFrame} from 'remotion';

export const W = 1920;
export const H = 1080;
export const SAN = 880;

/** Bảng màu kể chuyện: ngả vàng, trầm, hoài niệm — không bão hoà. */
export const P = {
  line: '#2b2438',
  ink: '#1c1728',
  paper: '#fdf6e8',
  warm: '#f0d9b0',
  wood: '#b08856',
  woodDark: '#8a6841',
  wall: '#e6d3b3',
  wallCool: '#cfd8de',
  sky: '#bcd9ea',
  dusk: '#e7a86a',
  night: '#2e2a4a',
  cloth: '#4d6fa8',
  green: '#6d9a72',
  red: '#c25a4e',
  gold: '#e0a63c',
  shade: 'rgba(40,30,60,0.16)',
};

const L = {stroke: P.line, strokeWidth: 5, strokeLinecap: 'round', strokeLinejoin: 'round'} as const;

/** Bụi lơ lửng trong nắng — thứ khiến khung hình tĩnh vẫn có sự sống. */
const Bui: React.FC<{n?: number}> = ({n = 22}) => {
  const frame = useCurrentFrame();
  return (
    <g opacity={0.35}>
      {new Array(n).fill(0).map((_, i) => {
        const y = ((frame * (0.18 + random(`s${i}`) * 0.22) + random(`o${i}`) * H) % (H + 80)) - 40;
        return (
          <circle
            key={i}
            cx={random(`x${i}`) * W}
            cy={y}
            r={2 + random(`r${i}`) * 4}
            fill="#fff"
            opacity={0.4 + random(`a${i}`) * 0.5}
          />
        );
      })}
    </g>
  );
};

/** Lễ tốt nghiệp: sân trường, hàng ghế, phông bạt. */
export const LeTotNghiep: React.FC = () => (
  <g>
    <defs>
      <linearGradient id="g-tn" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#cfe6f2" />
        <stop offset="70%" stopColor="#f2dcb8" />
        <stop offset="100%" stopColor="#e0c093" />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={W} height={H} fill="url(#g-tn)" />
    {/* toà nhà trường */}
    <rect x={140} y={200} width={1640} height={520} fill="#e8d2ae" {...L} />
    <rect x={140} y={200} width={1640} height={70} fill="#c9a97f" />
    {new Array(9).fill(0).map((_, i) => (
      <rect key={i} x={220 + i * 176} y={320} width={104} height={150} rx={6} fill="#9fc0d4" {...L} />
    ))}
    {/* phông bạt lễ */}
    <rect x={560} y={380} width={800} height={190} rx={10} fill={P.red} {...L} />
    <rect x={600} y={420} width={720} height={110} rx={6} fill="none" stroke={P.gold} strokeWidth={5} />
    {/* hàng cây */}
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        <rect x={90 + i * 560} y={640} width={26} height={240} fill={P.woodDark} />
        <circle cx={103 + i * 560} cy={620} r={92} fill={P.green} {...L} />
      </g>
    ))}
    <rect x={0} y={SAN} width={W} height={H - SAN} fill="#d9c49c" {...L} />
    <Bui n={26} />
  </g>
);

/** Phòng trọ: tường bong, cửa sổ, bàn học, đống đồ. */
export const PhongTro: React.FC = () => (
  <g>
    <rect x={0} y={0} width={W} height={H} fill={P.wall} />
    {/* mảng tường bong tróc */}
    {[[220, 180, 140, 90], [1480, 300, 180, 120], [820, 140, 110, 70]].map(([x, y, w, h], i) => (
      <rect key={i} x={x} y={y} width={w} height={h} rx={16} fill="#d8c19c" opacity={0.7} />
    ))}
    {/* cửa sổ có nắng hắt */}
    <rect x={1280} y={160} width={420} height={340} rx={8} fill={P.sky} {...L} />
    <line x1={1490} y1={160} x2={1490} y2={500} {...L} />
    <line x1={1280} y1={330} x2={1700} y2={330} {...L} />
    <path d="M1280,500 L1700,500 L1420,880 L900,880 z" fill="#fff3d0" opacity={0.35} />
    {/* bàn + laptop */}
    <rect x={300} y={620} width={620} height={26} rx={6} fill={P.wood} {...L} />
    <rect x={330} y={646} width={22} height={234} fill={P.woodDark} />
    <rect x={868} y={646} width={22} height={234} fill={P.woodDark} />
    <path d="M520,620 l-40,-150 h240 l-40,150 z" fill="#8d96a8" {...L} />
    <rect x={470} y={452} width={280} height={22} rx={6} fill="#6d7688" {...L} />
    {/* chồng sách */}
    {[0, 1, 2].map((i) => (
      <rect
        key={i}
        x={960 + (i % 2) * 10}
        y={840 - i * 26}
        width={150}
        height={24}
        rx={4}
        fill={[P.red, P.cloth, P.green][i]}
        {...L}
      />
    ))}
    <rect x={0} y={SAN} width={W} height={H - SAN} fill={P.wood} {...L} />
    <Bui n={30} />
  </g>
);

/** Phòng phỏng vấn: bàn dài, hai cái ghế đối diện, đồng hồ treo tường. */
export const PhongVan: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill={P.wallCool} />
      <rect x={0} y={0} width={W} height={SAN} fill="#dde5ea" />
      {/* đồng hồ — kim nhích thật, thứ duy nhất chuyển động trong phòng */}
      <g transform="translate(1560 250)">
        <circle cx={0} cy={0} r={78} fill={P.paper} {...L} />
        <line x1={0} y1={0} x2={0} y2={-48} {...L} transform={`rotate(${(frame / 30) * 6})`} />
        <line x1={0} y1={0} x2={34} y2={0} {...L} strokeWidth={7} transform={`rotate(${(frame / 30) * 0.5})`} />
        <circle cx={0} cy={0} r={7} fill={P.line} />
      </g>
      {/* bàn dài */}
      <rect x={260} y={640} width={1400} height={30} rx={8} fill="#a8845c" {...L} />
      <rect x={320} y={670} width={26} height={210} fill={P.woodDark} />
      <rect x={1574} y={670} width={26} height={210} fill={P.woodDark} />
      {/* tập hồ sơ đặt giữa bàn */}
      <rect x={880} y={600} width={170} height={44} rx={5} fill={P.paper} {...L} />
      <line x1={905} y1={618} x2={1025} y2={618} stroke="#b9b0a0" strokeWidth={4} />
      <rect x={0} y={SAN} width={W} height={H - SAN} fill="#b9c4cc" {...L} />
    </g>
  );
};

/** Văn phòng: dãy bàn, màn hình, đèn tuýp. */
export const VanPhong: React.FC = () => (
  <g>
    <rect x={0} y={0} width={W} height={H} fill="#e4e8ec" />
    {/* đèn tuýp trần */}
    {[0, 1, 2].map((i) => (
      <rect key={i} x={220 + i * 560} y={70} width={340} height={26} rx={12} fill="#f7f4e4" {...L} />
    ))}
    {/* vách ngăn cubicle */}
    {[0, 1, 2, 3].map((i) => (
      <g key={i}>
        <rect x={60 + i * 480} y={380} width={400} height={300} rx={8} fill="#c3cbd2" {...L} />
        <rect x={60 + i * 480} y={380} width={400} height={40} fill="#adb7bf" />
      </g>
    ))}
    {/* dãy màn hình */}
    {[0, 1, 2, 3].map((i) => (
      <g key={`m${i}`}>
        <rect x={150 + i * 480} y={470} width={220} height={140} rx={8} fill="#3a4450" {...L} />
        <rect x={168 + i * 480} y={486} width={184} height={108} fill="#5c8fb5" opacity={0.85} />
        <rect x={238 + i * 480} y={610} width={44} height={34} fill="#8d96a8" />
      </g>
    ))}
    <rect x={0} y={700} width={W} height={30} rx={6} fill="#a8b2bb" {...L} />
    <rect x={0} y={SAN} width={W} height={H - SAN} fill="#9aa5ae" {...L} />
    <Bui n={18} />
  </g>
);

export const PLACES: Record<string, React.FC> = {
  'le-tot-nghiep': LeTotNghiep,
  'phong-tro': PhongTro,
  'phong-van': PhongVan,
  'van-phong': VanPhong,
};
