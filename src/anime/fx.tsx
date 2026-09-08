import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {step, holdFrames} from './timing';
import {FONT} from '../font';

/** Bảng màu anime: bão hoà cao, bóng đổ là một MẢNG màu cứng chứ không gradient. */
export const A = {
  ink: '#1a1526',
  line: '#241d33',
  paper: '#fffdf7',
  skin: '#ffe0c4',
  skinShade: '#e8b193', // mảng bóng cel, không phải gradient
  hair: '#3b2f4d',
  hairShade: '#2a2138',
  hairHi: '#6b5a85',
  eye: '#3ba3e0',
  eyeDeep: '#1c5f96',
  red: '#ff3b52',
  redShade: '#c9273c',
  gold: '#ffd54a',
  cyan: '#5fe0d8',
  purple: '#8b6bd9',
  sky: '#a8dcf5',
  sunset: '#ff9a56',
  night: '#221a3a',
};

/**
 * Screen tone — lưới chấm halftone của manga, dùng thay cho đổ bóng mềm.
 * Vẽ bằng SVG pattern nên không tốn ảnh và không bị vỡ khi phóng to.
 */
export const ScreenTone: React.FC<{
  id: string;
  size?: number;
  r?: number;
  color?: string;
  opacity?: number;
}> = ({id, size = 12, r = 3, color = '#000', opacity = 0.22}) => (
  <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
    <circle cx={size / 2} cy={size / 2} r={r} fill={color} opacity={opacity} />
  </pattern>
);

/**
 * Speed lines — các vạch hội tụ về một điểm. Anime dùng khi muốn nói
 * "nhanh" hoặc "sốc" mà không cần vẽ chuyển động thật.
 * Chạy theo nhịp giữ hình để không mượt quá.
 */
export const SpeedLines: React.FC<{
  cx?: number;
  cy?: number;
  n?: number;
  color?: string;
  inner?: number;
  outer?: number;
  hold?: number;
}> = ({cx = 960, cy = 540, n = 48, color = '#1a1526', inner = 340, outer = 1900, hold = 2}) => {
  const frame = useCurrentFrame();
  const seed = holdFrames(frame, hold);
  return (
    <g>
      {new Array(n).fill(0).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + random(`a${seed}${i}`) * 0.06;
        const r0 = inner * (0.75 + random(`r${seed}${i}`) * 0.6);
        const w = 4 + random(`w${seed}${i}`) * 20;
        return (
          <path
            key={i}
            d={`M${cx + Math.cos(a) * r0},${cy + Math.sin(a) * r0} L${cx + Math.cos(a) * outer},${
              cy + Math.sin(a) * outer
            }`}
            stroke={color}
            strokeWidth={w}
            strokeLinecap="round"
            opacity={0.9}
          />
        );
      })}
    </g>
  );
};

/** Nền tia phóng xạ kiểu tấn công — dùng cho câu chốt. */
export const Burst: React.FC<{cx?: number; cy?: number; n?: number; color?: string; hold?: number}> = ({
  cx = 960,
  cy = 540,
  n = 20,
  color = A.gold,
  hold = 3,
}) => {
  const frame = useCurrentFrame();
  const spin = holdFrames(frame, hold) * 4;
  return (
    <g transform={`rotate(${spin} ${cx} ${cy})`}>
      {new Array(n).fill(0).map((_, i) => {
        const a0 = (i / n) * Math.PI * 2;
        const a1 = a0 + Math.PI / n;
        const R = 2400;
        return (
          <path
            key={i}
            d={`M${cx},${cy} L${cx + Math.cos(a0) * R},${cy + Math.sin(a0) * R} L${cx + Math.cos(a1) * R},${
              cy + Math.sin(a1) * R
            } Z`}
            fill={color}
          />
        );
      })}
    </g>
  );
};

/**
 * Impact frame: 1–2 frame đảo màu toàn khung ngay lúc va chạm.
 * Anime dùng cái này thay cho việc vẽ hàng chục in-between của cú đánh.
 */
export const ImpactFlash: React.FC<{at: number; len?: number; mode?: 'trang' | 'den' | 'dao'}> = ({
  at,
  len = 2,
  mode = 'trang',
}) => {
  const frame = useCurrentFrame();
  if (frame < at || frame >= at + len) return null;
  if (mode === 'dao')
    return <AbsoluteFill style={{background: '#fff', mixBlendMode: 'difference'}} />;
  return <AbsoluteFill style={{background: mode === 'trang' ? '#fff' : '#000'}} />;
};

/**
 * Smear: nhân bản mờ dần theo hướng chuyển động — một hình thay cho cả loạt
 * in-between. Cách rẻ nhất để có cảm giác tốc độ.
 */
export const Smear: React.FC<{
  children: React.ReactNode;
  dx?: number;
  dy?: number;
  n?: number;
  on?: boolean;
}> = ({children, dx = 60, dy = 0, n = 3, on = true}) => {
  if (!on) return <>{children}</>;
  return (
    <g>
      {new Array(n).fill(0).map((_, i) => (
        <g key={i} transform={`translate(${-dx * (i + 1)} ${-dy * (i + 1)})`} opacity={0.28 / (i + 1)}>
          {children}
        </g>
      ))}
      {children}
    </g>
  );
};

/** Sai lệch màu viền — trò của anime hiện đại lúc cao trào. */
export const ChromaShift: React.FC<{children: React.ReactNode; amount?: number}> = ({
  children,
  amount = 0,
}) => {
  if (amount <= 0) return <>{children}</>;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `translateX(${-amount}px)`, filter: 'url(#chR)', opacity: 0.55}}>
        {children}
      </AbsoluteFill>
      <AbsoluteFill style={{transform: `translateX(${amount}px)`, filter: 'url(#chB)', opacity: 0.55}}>
        {children}
      </AbsoluteFill>
      <AbsoluteFill>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Bộ lọc SVG dùng chung — nhúng một lần ở gốc composition. */
export const FxDefs: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <defs>
      <filter id="chR">
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
      </filter>
      <filter id="chB">
        <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" />
      </filter>
      <filter id="bloom" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="18" result="b" />
        <feComposite in="SourceGraphic" in2="b" operator="over" />
      </filter>
    </defs>
  </svg>
);

/**
 * Chữ đập kiểu anime: chữ Việt to + một dòng katakana nhỏ bên cạnh,
 * viền dày, nghiêng, giữ hình theo nhịp.
 */
export const ImpactText: React.FC<{
  text: string;
  kana?: string;
  color?: string;
  size?: number;
  rot?: number;
}> = ({text, kana, color = A.red, size = 150, rot = -7}) => {
  const frame = useCurrentFrame();
  const s = step(frame, 2);
  // bung ra trong 4 frame rồi đứng yên — không nảy đàn hồi, anime không làm thế
  const scale = interpolate(s, [0, 4], [1.35, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const op = interpolate(s, [0, 2], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{transform: `rotate(${rot}deg) scale(${scale})`, opacity: op, textAlign: 'center'}}>
        {kana ? (
          <div
            style={{
              fontFamily: FONT,
              fontSize: size * 0.22,
              fontWeight: 900,
              letterSpacing: 10,
              color: A.paper,
              WebkitTextStroke: `${size * 0.05}px ${A.ink}`,
              paintOrder: 'stroke fill',
              marginBottom: -size * 0.06,
            }}
          >
            {kana}
          </div>
        ) : null}
        <div
          style={{
            fontFamily: FONT,
            fontSize: size,
            fontWeight: 900,
            color,
            letterSpacing: -2,
            lineHeight: 1.25,
            WebkitTextStroke: `${size * 0.085}px ${A.ink}`,
            paintOrder: 'stroke fill',
            textShadow: `${size * 0.05}px ${size * 0.05}px 0 ${A.ink}`,
          }}
        >
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Nền gradient hoàng hôn / đêm — anime luôn có màu nền kể chuyện. */
export const SkyBg: React.FC<{tone?: 'chieu' | 'dem' | 'ngay' | 'do'}> = ({tone = 'chieu'}) => {
  const stops =
    tone === 'chieu'
      ? ['#ffb877', '#ff7a6b', '#8b5fa8']
      : tone === 'dem'
        ? ['#1b1638', '#312a5c', '#4a3b73']
        : tone === 'do'
          ? ['#ff5a4a', '#c9273c', '#5c1226']
          : ['#bfe9ff', '#8fd4f5', '#dff2ff'];
  return (
    <AbsoluteFill
      style={{background: `linear-gradient(180deg, ${stops[0]} 0%, ${stops[1]} 55%, ${stops[2]} 100%)`}}
    />
  );
};
