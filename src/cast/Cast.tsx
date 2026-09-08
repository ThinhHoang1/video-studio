import React from 'react';
import {useCurrentFrame} from 'remotion';

/** Bảng màu riêng — không mượn của ai. */
export const C = {
  line: '#14121c',
  paper: '#fffaf0',
  skin: '#f0c49a',
  skinDark: '#d9a878',
  hoodie: '#3d6fd4',
  hair: '#2a2028',
  // Phồng — hiện thân lạm phát
  red: '#e8443c',
  redDark: '#b32e28',
  redLight: '#ff6b62',
  // Cá mập
  shark: '#7f93a8',
  sharkDark: '#5d7186',
  suit: '#2c3446',
  money: '#7fc98a',
  moneyDark: '#4e9a5c',
  gold: '#ffc93c',
  bg1: '#ffe8c4',
  bg2: '#c8e8f5',
};

export const L = {stroke: C.line, strokeWidth: 7, strokeLinecap: 'round', strokeLinejoin: 'round'} as const;
export const L4 = {...L, strokeWidth: 4.5} as const;

export type Mood = 'ok' | 'vui' | 'nghi' | 'soc' | 'tuc' | 'khoc' | 'chet' | 'ngo';

/**
 * TÈO — người xem. Người thật, không phải con vật: cả video nói về ví của bạn.
 * Cái ví lòi khỏi túi mỏng dần theo `viDay` (1 = căng, 0 = rỗng) — đồng hồ
 * đếm ngược trực quan, không cần một chữ nào.
 * Gốc toạ độ ở chân. Cao ~440.
 */
export const Teo: React.FC<{
  mood?: Mood;
  x?: number;
  y?: number;
  s?: number;
  flip?: boolean;
  /** 1 = ví căng, 0 = ví lép */
  viDay?: number;
  /** tay phải giơ lên cầm đồ */
  cam?: boolean;
  children?: React.ReactNode;
}> = ({mood = 'ok', x = 0, y = 0, s = 1, flip = false, viDay = 1, cam = false, children}) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame / 24) * 3.5;
  const blink = frame % 112 < 4 && mood !== 'soc' && mood !== 'chet';

  const eye = (cx: number) => {
    if (mood === 'chet')
      return (
        <g key={cx}>
          <line x1={cx - 13} y1={-13} x2={cx + 13} y2={13} {...L4} />
          <line x1={cx + 13} y1={-13} x2={cx - 13} y2={13} {...L4} />
        </g>
      );
    if (blink) return <path key={cx} d={`M${cx - 16},0 q16,10 32,0`} fill="none" {...L4} />;
    const r = mood === 'soc' ? 22 : 16;
    const p = mood === 'soc' ? 7 : 9;
    const off = mood === 'nghi' ? 6 : 0;
    return (
      <g key={cx}>
        <ellipse cx={cx} cy={0} rx={r} ry={r * 1.12} fill={C.paper} {...L4} />
        <circle cx={cx + off} cy={mood === 'tuc' ? -3 : 0} r={p} fill={C.line} />
        {mood === 'khoc' ? (
          <path d={`M${cx},${r} q5,22 -2,38`} fill="none" stroke="#5cc0f0" strokeWidth={6} strokeLinecap="round" />
        ) : null}
      </g>
    );
  };

  const brow = (cx: number, d: number) => {
    if (mood === 'tuc') return <line x1={cx - 18 * d} y1={-38} x2={cx + 16 * d} y2={-26} {...L4} />;
    if (mood === 'khoc' || mood === 'soc') return <line x1={cx - 18 * d} y1={-28} x2={cx + 16 * d} y2={-40} {...L4} />;
    if (mood === 'nghi') return <line x1={cx - 16 * d} y1={-36} x2={cx + 16 * d} y2={-34} {...L4} />;
    return null;
  };

  const mouth = () => {
    if (mood === 'soc') return <ellipse cx={0} cy={54} rx={20} ry={27} fill="#7a2b2b" {...L4} />;
    if (mood === 'khoc') return <path d="M-26,66 q26,-28 52,0" fill="#7a2b2b" {...L4} />;
    if (mood === 'tuc') return <path d="M-24,60 q24,-16 48,0" fill="none" {...L4} />;
    if (mood === 'vui') return <path d="M-30,42 q30,36 60,0 z" fill="#7a2b2b" {...L4} />;
    if (mood === 'chet') return <path d="M-22,56 q11,13 22,0 q11,-13 22,0" fill="none" {...L4} />;
    if (mood === 'ngo') return <ellipse cx={0} cy={56} rx={13} ry={13} fill="#7a2b2b" {...L4} />;
    return <path d="M-26,48 q26,20 52,0" fill="none" {...L4} />;
  };

  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={0} cy={4} rx={104} ry={16} fill="rgba(0,0,0,0.16)" />
      <g transform={`translate(0 ${bob})`}>
        {/* chân */}
        <rect x={-52} y={-104} width={44} height={104} rx={16} fill="#3a4457" {...L} />
        <rect x={8} y={-104} width={44} height={104} rx={16} fill="#3a4457" {...L} />
        {/* thân hoodie */}
        <path d="M-88,-108 q0,-150 88,-150 q88,0 88,150 z" fill={C.hoodie} {...L} />
        {/* ví thò khỏi túi hông — vẽ SAU thân để không bị áo che.
            Độ dày ví là đồng hồ đếm ngược trực quan của cả video. */}
        <g transform="translate(74 -128)">
          <rect
            x={-22}
            y={-30 * viDay}
            width={44}
            height={18 + 34 * viDay}
            rx={6}
            fill={viDay > 0.35 ? C.money : '#bdb7a8'}
            {...L4}
          />
          <line x1={-22} y1={-30 * viDay + 14} x2={22} y2={-30 * viDay + 14} {...L4} strokeWidth={3.5} />
        </g>
        <path d="M-40,-250 q40,50 80,0" fill="#5b8ae8" {...L4} />
        {/* dây túi đeo chéo */}
        <path d="M-70,-232 L62,-124" fill="none" stroke={C.line} strokeWidth={12} />
        {/* tay trái */}
        <path d="M-84,-222 q-52,44 -40,104" fill="none" stroke={C.line} strokeWidth={30} strokeLinecap="round" />
        <path d="M-84,-222 q-52,44 -40,104" fill="none" stroke={C.hoodie} strokeWidth={19} strokeLinecap="round" />
        <circle cx={-124} cy={-118} r={27} fill={C.skin} {...L4} />
        {/* tay phải */}
        {cam ? (
          <>
            <path d="M84,-222 q76,-14 106,-72" fill="none" stroke={C.line} strokeWidth={30} strokeLinecap="round" />
            <path d="M84,-222 q76,-14 106,-72" fill="none" stroke={C.hoodie} strokeWidth={19} strokeLinecap="round" />
            <circle cx={190} cy={-294} r={27} fill={C.skin} {...L4} />
            <g transform="translate(238 -318)">{children}</g>
          </>
        ) : (
          <>
            <path d="M84,-222 q52,44 40,104" fill="none" stroke={C.line} strokeWidth={30} strokeLinecap="round" />
            <path d="M84,-222 q52,44 40,104" fill="none" stroke={C.hoodie} strokeWidth={19} strokeLinecap="round" />
            <circle cx={124} cy={-118} r={27} fill={C.skin} {...L4} />
          </>
        )}
        {/* đầu */}
        <g transform="translate(0 -320)">
          <ellipse cx={0} cy={0} rx={96} ry={102} fill={C.skin} {...L} />
          {/* tóc + một cọng dựng */}
          <path d="M-96,-24 q10,-92 96,-92 q86,0 96,92 q-40,-46 -96,-46 q-56,0 -96,46 z" fill={C.hair} {...L} />
          <path d="M8,-112 q22,-46 46,-40 q-24,14 -22,44" fill={C.hair} {...L4} />
          {/* tai */}
          <ellipse cx={-96} cy={12} rx={17} ry={23} fill={C.skinDark} {...L4} />
          <ellipse cx={96} cy={12} rx={17} ry={23} fill={C.skinDark} {...L4} />
          {brow(-38, 1)}
          {brow(38, -1)}
          {eye(-38)}
          {eye(38)}
          {mouth()}
        </g>
      </g>
    </g>
  );
};

/**
 * PHỒNG — hiện thân của lạm phát. Nuốt tiền là to ra.
 * Chọn hình này vì *inflation* gốc từ *inflate*: nhân vật không minh hoạ
 * khái niệm, nó CHÍNH LÀ khái niệm. Càng to càng đè bẹp mọi thứ, và nổ
 * chính là siêu lạm phát.
 * `size` 0..1 điều khiển độ phồng, dùng chung suốt video như một thanh tiến trình.
 */
export const Phong: React.FC<{
  size?: number;
  x?: number;
  y?: number;
  mood?: 'cuoi' | 'doi' | 'no' | 'nham';
  s?: number;
}> = ({size = 0.3, x = 0, y = 0, mood = 'cuoi', s = 1}) => {
  const frame = useCurrentFrame();
  // thở phập phồng — càng to thở càng nặng
  const breath = 1 + Math.sin(frame / (18 - size * 8)) * (0.018 + size * 0.03);
  const r = (110 + size * 300) * breath;
  const wob = Math.sin(frame / 15) * (2 + size * 5);

  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={r * 0.98} rx={r * 0.9} ry={r * 0.15} fill="rgba(0,0,0,0.16)" />
      <g transform={`rotate(${wob})`}>
        {/* thân phồng, hơi méo cho có cảm giác căng khí */}
        <ellipse cx={0} cy={0} rx={r} ry={r * 0.94} fill={C.red} {...L} />
        <ellipse cx={-r * 0.3} cy={-r * 0.36} rx={r * 0.24} ry={r * 0.17} fill={C.redLight} opacity={0.85} />
        {/* nút thắt bóng bay dưới đáy */}
        <path
          d={`M${-r * 0.14},${r * 0.92} l${r * 0.14},${r * 0.2} l${r * 0.14},${-r * 0.2} z`}
          fill={C.redDark}
          {...L4}
        />
        {/* mắt */}
        {mood === 'no' ? (
          <>
            <path d={`M${-r * 0.42},${-r * 0.3} l${r * 0.26},${r * 0.26}`} {...L} />
            <path d={`M${-r * 0.16},${-r * 0.3} l${-r * 0.26},${r * 0.26}`} {...L} />
            <path d={`M${r * 0.16},${-r * 0.3} l${r * 0.26},${r * 0.26}`} {...L} />
            <path d={`M${r * 0.42},${-r * 0.3} l${-r * 0.26},${r * 0.26}`} {...L} />
          </>
        ) : (
          <>
            <ellipse cx={-r * 0.29} cy={-r * 0.2} rx={r * 0.16} ry={r * 0.19} fill={C.paper} {...L4} />
            <ellipse cx={r * 0.29} cy={-r * 0.2} rx={r * 0.16} ry={r * 0.19} fill={C.paper} {...L4} />
            <circle cx={-r * 0.25} cy={-r * 0.17} r={r * 0.085} fill={C.line} />
            <circle cx={r * 0.33} cy={-r * 0.17} r={r * 0.085} fill={C.line} />
            {/* lông mày xếch — luôn trông đểu */}
            <line x1={-r * 0.46} y1={-r * 0.46} x2={-r * 0.13} y2={-r * 0.36} {...L4} />
            <line x1={r * 0.46} y1={-r * 0.46} x2={r * 0.13} y2={-r * 0.36} {...L4} />
          </>
        )}
        {/* miệng */}
        {mood === 'doi' ? (
          <ellipse cx={0} cy={r * 0.34} rx={r * 0.3} ry={r * 0.26} fill="#5c1414" {...L4} />
        ) : mood === 'nham' ? (
          <path d={`M${-r * 0.36},${r * 0.3} q${r * 0.36},${r * 0.1} ${r * 0.72},${-r * 0.06}`} fill="none" {...L} />
        ) : (
          <path
            d={`M${-r * 0.4},${r * 0.22} q${r * 0.4},${r * 0.44} ${r * 0.8},0 z`}
            fill="#5c1414"
            {...L4}
          />
        )}
        {/* răng nanh */}
        {mood !== 'no' ? (
          <>
            <path d={`M${-r * 0.22},${r * 0.24} l${r * 0.07},${r * 0.15} l${r * 0.07},${-r * 0.15} z`} fill={C.paper} />
            <path d={`M${r * 0.08},${r * 0.24} l${r * 0.07},${r * 0.15} l${r * 0.07},${-r * 0.15} z`} fill={C.paper} />
          </>
        ) : null}
      </g>
    </g>
  );
};

/** SẾP CÁ MẬP — người trả lương. Không ác, chỉ đang bơi theo dòng. */
export const Sep: React.FC<{x?: number; y?: number; s?: number; flip?: boolean; children?: React.ReactNode}> = ({
  x = 0,
  y = 0,
  s = 1,
  flip = false,
  children,
}) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame / 26) * 4;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={0} cy={4} rx={112} ry={17} fill="rgba(0,0,0,0.16)" />
      <g transform={`translate(0 ${bob})`}>
        <rect x={-54} y={-100} width={46} height={100} rx={16} fill={C.suit} {...L} />
        <rect x={8} y={-100} width={46} height={100} rx={16} fill={C.suit} {...L} />
        <path d="M-94,-104 q0,-156 94,-156 q94,0 94,156 z" fill={C.suit} {...L} />
        {/* áo sơ mi + cà vạt */}
        <path d="M-34,-254 l34,44 l34,-44 l0,120 l-68,0 z" fill={C.paper} {...L4} />
        <path d="M-12,-214 l12,-16 l12,16 l-6,80 l-12,0 z" fill={C.gold} {...L4} />
        <path d="M-92,-224 q-56,50 -44,110" fill="none" stroke={C.line} strokeWidth={30} strokeLinecap="round" />
        <path d="M-92,-224 q-56,50 -44,110" fill="none" stroke={C.suit} strokeWidth={19} strokeLinecap="round" />
        <circle cx={-136} cy={-114} r={26} fill={C.shark} {...L4} />
        <path d="M92,-224 q80,-8 108,-64" fill="none" stroke={C.line} strokeWidth={30} strokeLinecap="round" />
        <path d="M92,-224 q80,-8 108,-64" fill="none" stroke={C.suit} strokeWidth={19} strokeLinecap="round" />
        <circle cx={200} cy={-288} r={26} fill={C.shark} {...L4} />
        <g transform="translate(250 -312)">{children}</g>
        {/* đầu cá mập */}
        <g transform="translate(0 -322)">
          <path d="M-108,10 q4,-104 108,-104 q104,0 108,104 q-20,54 -108,54 q-88,0 -108,-54 z" fill={C.shark} {...L} />
          <path d="M-2,-116 l16,-70 l30,66" fill={C.sharkDark} {...L4} />
          <ellipse cx={-44} cy={-24} rx={17} ry={19} fill={C.paper} {...L4} />
          <ellipse cx={44} cy={-24} rx={17} ry={19} fill={C.paper} {...L4} />
          <circle cx={-44} cy={-24} r={8} fill={C.line} />
          <circle cx={44} cy={-24} r={8} fill={C.line} />
          <path d="M-86,24 q86,54 172,0" fill="#5c1414" {...L4} />
          {/* răng */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path key={i} d={`M${-72 + i * 29},26 l14,26 l14,-26 z`} fill={C.paper} />
          ))}
        </g>
      </g>
    </g>
  );
};
