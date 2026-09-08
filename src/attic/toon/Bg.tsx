import React from 'react';
import {random, useCurrentFrame} from 'remotion';
import {LINE, LINE_THIN, T} from './palette';

/**
 * Bối cảnh đầy đủ, không phải nền trống. Đây là điểm khác biệt lớn nhất giữa
 * một video explainer trông "có nghề" và một video trông như slide PowerPoint:
 * nhân vật luôn đứng TRONG một nơi chốn cụ thể.
 * Khung chuẩn: 1600x900, mặt đất ở y=760.
 */

export const GROUND = 760;

const Boards: React.FC<{y: number; h: number; n: number; c1: string; c2: string}> = ({y, h, n, c1, c2}) => (
  <g>
    {new Array(n).fill(0).map((_, i) => (
      <rect key={i} x={(1600 / n) * i} y={y} width={1600 / n} height={h} fill={i % 2 ? c1 : c2} />
    ))}
  </g>
);

/** Quầy hàng vỉa hè có mái hiên sọc — nơi mọi câu chuyện giá cả bắt đầu. */
export const BgStall: React.FC = () => (
  <g>
    <rect x={0} y={0} width={1600} height={900} fill={T.wall} />
    <Boards y={0} h={900} n={9} c1="#e8c98f" c2="#dfbc7d" />
    {/* mái hiên sọc */}
    <path d="M-40,150 h1680 v54 h-1680 z" fill={T.cream} {...LINE} />
    {new Array(14).fill(0).map((_, i) => (
      <rect key={i} x={-40 + i * 120} y={150} width={60} height={54} fill={T.awning} />
    ))}
    <path d="M-40,204 q60,54 120,0 q60,54 120,0 q60,54 120,0 q60,54 120,0 q60,54 120,0 q60,54 120,0 q60,54 120,0 q60,54 120,0 q60,54 120,0 q60,54 120,0 q60,54 120,0 q60,54 120,0 q60,54 120,0 q60,54 120,0"
      fill={T.awning} {...LINE_THIN} />
    {/* cột */}
    <rect x={90} y={204} width={26} height={560} fill={T.woodDark} {...LINE_THIN} />
    <rect x={1484} y={204} width={26} height={560} fill={T.woodDark} {...LINE_THIN} />
    {/* quầy */}
    <rect x={0} y={GROUND} width={1600} height={140} fill={T.floor} {...LINE} />
  </g>
);

/** Siêu thị: kệ hàng nhiều màu chạy suốt hậu cảnh. */
export const BgMart: React.FC = () => (
  <g>
    <rect x={0} y={0} width={1600} height={900} fill="#f2e3c6" />
    {[0, 1, 2].map((r) => (
      <g key={r}>
        <rect x={60} y={140 + r * 200} width={1480} height={26} fill={T.woodDark} {...LINE_THIN} />
        {new Array(11).fill(0).map((_, i) => (
          <rect
            key={i}
            x={90 + i * 134}
            y={40 + r * 200}
            width={106}
            height={100}
            rx={10}
            fill={['#e46a6a', '#5fa8e0', '#8ccf6a', '#f0b23f', '#a98ae0'][(i + r) % 5]}
            {...LINE_THIN}
          />
        ))}
      </g>
    ))}
    <rect x={0} y={GROUND} width={1600} height={140} fill="#cfd6dd" {...LINE} />
  </g>
);

/** Sàn đấu boxing — dùng cho ẩn dụ hai lực đối đầu. */
export const BgRing: React.FC = () => (
  <g>
    <rect x={0} y={0} width={1600} height={900} fill="#2a2038" />
    <g opacity={0.35}>
      {new Array(80).fill(0).map((_, i) => (
        <circle key={i} cx={random(`c${i}`) * 1600} cy={random(`d${i}`) * 520} r={5 + random(`e${i}`) * 7} fill={T.gold} />
      ))}
    </g>
    <rect x={0} y={520} width={1600} height={40} fill="#7a2222" {...LINE_THIN} />
    <rect x={0} y={GROUND - 120} width={1600} height={260} fill="#1f6fb0" {...LINE} />
    {[0, 1, 2].map((i) => (
      <line key={i} x1={0} y1={560 + i * 66} x2={1600} y2={560 + i * 66} stroke={T.cream} strokeWidth={12} />
    ))}
    <rect x={110} y={430} width={30} height={340} fill="#b8352f" {...LINE_THIN} />
    <rect x={1460} y={430} width={30} height={340} fill="#b8352f" {...LINE_THIN} />
  </g>
);

/** Trong nhà: tường gỗ, cửa sổ, bàn. Dùng cho cảnh gia đình / lương / tiết kiệm. */
export const BgRoom: React.FC = () => (
  <g>
    <rect x={0} y={0} width={1600} height={900} fill={T.wood} />
    <Boards y={0} h={GROUND} n={12} c1={T.wood} c2={T.woodDark} />
    <rect x={1080} y={130} width={330} height={260} rx={10} fill={T.sky} {...LINE} />
    <line x1={1245} y1={130} x2={1245} y2={390} {...LINE_THIN} />
    <line x1={1080} y1={260} x2={1410} y2={260} {...LINE_THIN} />
    <rect x={0} y={GROUND} width={1600} height={140} fill="#8a5a30" {...LINE} />
  </g>
);

/** Ngân hàng: cột trụ, trán tường tam giác. */
export const BgBank: React.FC = () => (
  <g>
    <rect x={0} y={0} width={1600} height={900} fill="#7fc99a" />
    <path d="M300,300 L800,110 L1300,300 z" fill={T.cream} {...LINE} />
    <rect x={330} y={300} width={940} height={40} fill={T.cream} {...LINE} />
    {[0, 1, 2, 3].map((i) => (
      <rect key={i} x={390 + i * 220} y={340} width={70} height={420} fill={T.cream} {...LINE} />
    ))}
    <text x={800} y={250} textAnchor="middle" fontSize={62} fontWeight={900} fill={T.line}>
      BANK
    </text>
    <rect x={0} y={GROUND} width={1600} height={140} fill="#5aa87a" {...LINE} />
  </g>
);

/** Ngập tiền: cả khung hình là tiền, dùng cho đỉnh điểm in tiền / siêu lạm phát. */
export const BgMoneyFlood: React.FC<{tone?: 'green' | 'red'}> = ({tone = 'green'}) => {
  const frame = useCurrentFrame();
  const base = tone === 'green' ? T.moneyDark : '#a82626';
  const bill = tone === 'green' ? T.money : '#e05a5a';
  return (
    <g>
      <rect x={0} y={0} width={1600} height={900} fill={base} />
      {new Array(70).fill(0).map((_, i) => {
        const drift = ((frame * 0.6 + random(`m${i}`) * 900) % 1000) - 60;
        return (
          <g
            key={i}
            transform={`translate(${random(`x${i}`) * 1620 - 20} ${
              random(`y${i}`) * 640 + (i % 3 === 0 ? drift * 0.25 : 260)
            }) rotate(${random(`r${i}`) * 360})`}
          >
            <rect x={-56} y={-28} width={112} height={56} rx={6} fill={bill} {...LINE_THIN} />
            <circle cx={0} cy={0} r={15} fill={T.cream} strokeWidth={3} stroke={T.line} />
          </g>
        );
      })}
    </g>
  );
};

export const BG = {
  stall: BgStall,
  mart: BgMart,
  ring: BgRing,
  room: BgRoom,
  bank: BgBank,
  flood: BgMoneyFlood,
};

export type BgName = keyof typeof BG;
