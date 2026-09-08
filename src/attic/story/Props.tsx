import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, L, L4} from '../cast/Cast';
import {FONT} from '../font';
import type {Prop} from './types';

const Pho: React.FC<{thit?: number}> = ({thit = 3}) => {
  const frame = useCurrentFrame();
  return (
    <g>
      {[0, 1, 2].map((i) => {
        const t = ((frame * 1.4 + i * 34) % 120) / 120;
        return (
          <path
            key={i}
            d={`M${-40 + i * 40},${-60 - t * 90} q20,-28 0,-56`}
            fill="none"
            stroke="#c9c3b4"
            strokeWidth={7}
            strokeLinecap="round"
            opacity={(1 - t) * 0.8}
          />
        );
      })}
      <ellipse cx={0} cy={-46} rx={150} ry={34} fill="#d9b878" {...L} />
      {[0, 1, 2, 3].map((i) => (
        <path
          key={`n${i}`}
          d={`M${-96 + i * 46},${-52} q22,${i % 2 ? -12 : 12} 44,0`}
          fill="none"
          stroke="#fff2d4"
          strokeWidth={7}
          strokeLinecap="round"
        />
      ))}
      {new Array(3).fill(0).map((_, i) =>
        i < thit ? <ellipse key={`t${i}`} cx={-56 + i * 56} cy={-54} rx={30} ry={17} fill="#b5714a" {...L4} /> : null
      )}
      <ellipse cx={70} cy={-56} rx={18} ry={9} fill="#5aa83c" {...L4} />
      <path d="M-152,-46 h304 a24,24 0 0 1 -26,124 h-252 a24,24 0 0 1 -26,-124 z" fill={C.paper} {...L} />
    </g>
  );
};

const BangGia: React.FC<{text: string; mau?: 'do' | 'xanh'}> = ({text, mau = 'do'}) => {
  const w = text.length * 40 + 60;
  return (
    <g>
      <rect x={-w / 2} y={-52} width={w} height={104} rx={14} fill={C.gold} {...L} />
      <text
        x={0}
        y={18}
        textAnchor="middle"
        fontSize={64}
        fontWeight={900}
        fill={mau === 'do' ? '#d92b2b' : C.moneyDark}
        fontFamily={FONT}
      >
        {text}
      </text>
    </g>
  );
};

const BanhMi: React.FC<{n?: number}> = ({n = 1}) => (
  <g>
    {new Array(n).fill(0).map((_, i) => (
      <g key={i} transform={`translate(${(i % 5) * 94 - (Math.min(n, 5) - 1) * 47} ${Math.floor(i / 5) * 76})`}>
        <ellipse cx={0} cy={0} rx={44} ry={22} fill="#dfa055" {...L4} />
        <path d="M-34,-4 q34,-14 68,0" fill="none" stroke="#6fbf4f" strokeWidth={7} strokeLinecap="round" />
      </g>
    ))}
  </g>
);

const Tien: React.FC<{n?: number}> = ({n = 5}) => (
  <g>
    {new Array(n).fill(0).map((_, i) => (
      <g key={i} transform={`translate(${(i % 2) * 10 - 5} ${-i * 24})`}>
        <rect x={-78} y={-21} width={156} height={42} rx={6} fill={C.money} {...L4} />
        <circle cx={0} cy={0} r={13} fill={C.paper} strokeWidth={3} stroke={C.line} />
      </g>
    ))}
  </g>
);

const BimBim: React.FC<{phong?: number; gram?: number}> = ({phong = 1, gram = 80}) => (
  <g transform={`scale(${phong} ${1 / Math.sqrt(phong)})`}>
    <path d="M-112,-150 h224 l-16,32 v238 l16,32 h-224 l16,-32 v-238 z" fill="#d93a3a" {...L} />
    <text x={0} y={-60} textAnchor="middle" fontSize={40} fontWeight={900} fill={C.paper} fontFamily={FONT}>
      BIM BIM
    </text>
    <text x={0} y={130} textAnchor="middle" fontSize={52} fontWeight={900} fill={C.gold} fontFamily={FONT}>
      {gram}g
    </text>
  </g>
);

const Ghe: React.FC = () => (
  <g>
    <rect x={-70} y={-30} width={140} height={26} rx={8} fill="#d94f8a" {...L4} />
    <path d="M-58,-4 l-14,74" fill="none" stroke={C.line} strokeWidth={12} strokeLinecap="round" />
    <path d="M58,-4 l6,40 l-22,30" fill="none" stroke={C.line} strokeWidth={12} strokeLinecap="round" />
    <path d="M-60,-30 q-6,-64 6,-70" fill="none" stroke="#d94f8a" strokeWidth={18} strokeLinecap="round" />
  </g>
);

const BangLuong: React.FC<{tang?: string; gia?: string}> = ({tang = '+7%', gia = '+10%'}) => (
  <g>
    <rect x={-120} y={-150} width={240} height={300} rx={12} fill={C.paper} {...L} />
    <text x={0} y={-84} textAnchor="middle" fontSize={30} fontWeight={800} fill={C.line} fontFamily={FONT}>
      BẢNG LƯƠNG
    </text>
    <text x={0} y={-6} textAnchor="middle" fontSize={62} fontWeight={900} fill={C.moneyDark} fontFamily={FONT}>
      {tang}
    </text>
    <line x1={-90} y1={26} x2={90} y2={26} {...L4} />
    <text x={0} y={100} textAnchor="middle" fontSize={62} fontWeight={900} fill="#d92b2b" fontFamily={FONT}>
      {gia}
    </text>
  </g>
);

const SoCoLa: React.FC<{cacao?: number}> = ({cacao = 70}) => (
  <g>
    <rect x={-130} y={-170} width={260} height={340} rx={14} fill="#7a4a28" {...L} />
    {[0, 1, 2].map((r) =>
      [0, 1].map((c) => (
        <rect
          key={`${r}${c}`}
          x={-112 + c * 116}
          y={-150 + r * 106}
          width={104}
          height={90}
          rx={7}
          fill="#95603a"
          stroke={C.line}
          strokeWidth={4}
        />
      ))
    )}
    <rect x={-130} y={-40} width={260} height={80} rx={8} fill={C.paper} {...L4} />
    <text
      x={0}
      y={20}
      textAnchor="middle"
      fontSize={54}
      fontWeight={900}
      fill={cacao < 40 ? '#d92b2b' : C.line}
      fontFamily={FONT}
    >
      {cacao}%
    </text>
  </g>
);

const MayIn: React.FC = () => {
  const frame = useCurrentFrame();
  const shake = Math.sin(frame * 0.85) * 3;
  return (
    <g transform={`translate(${shake} 0)`}>
      <rect x={-150} y={-90} width={300} height={190} rx={20} fill="#4d7fd6" {...L} />
      <rect x={-110} y={-120} width={220} height={40} rx={10} fill="#8b8f9e" {...L4} />
      <circle cx={-100} cy={50} r={15} fill="#d93a3a" {...L4} />
      <circle cx={-56} cy={50} r={15} fill={C.gold} {...L4} />
      <text x={40} y={26} textAnchor="middle" fontSize={44} fontWeight={900} fill={C.paper} fontFamily={FONT}>
        BRRR
      </text>
    </g>
  );
};

export const PropView: React.FC<{prop: Prop; p: number}> = ({prop, p}) => {
  const {x = 0, y = 0} = prop as {x?: number; y?: number};
  const s = (prop as {s?: number}).s ?? 1;
  let body: React.ReactNode = null;

  switch (prop.p) {
    case 'pho':
      body = <Pho thit={prop.thit ?? 3} />;
      break;
    case 'gia':
      body = <BangGia text={prop.text} mau={prop.mau} />;
      break;
    case 'banhmi':
      body = <BanhMi n={prop.n ?? 1} />;
      break;
    case 'tien':
      body = <Tien n={prop.n ?? 5} />;
      break;
    case 'bimbim':
      body = <BimBim phong={prop.phong ?? 1} gram={prop.gram ?? 80} />;
      break;
    case 'ghe':
      body = <Ghe />;
      break;
    case 'bangluong':
      body = <BangLuong tang={prop.tang} gia={prop.gia} />;
      break;
    case 'socola':
      body = <SoCoLa cacao={prop.cacao ?? 70} />;
      break;
    case 'mayin':
      body = <MayIn />;
      break;
  }

  // đạo cụ nảy vào một nhịp rất ngắn rồi đứng yên
  const pop = interpolate(p, [0, 0.06], [0.86, 1], {extrapolateRight: 'clamp'});
  return <g transform={`translate(${x} ${y}) scale(${s * pop})`}>{body}</g>;
};
