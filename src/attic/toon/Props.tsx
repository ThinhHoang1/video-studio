import React from 'react';
import {useCurrentFrame} from 'remotion';
import {LINE, LINE_THIN, T} from './palette';
import {FONT} from '../font';

/** Nhãn chữ trong tranh — kiểu bong bóng trắng viền đen của hoạt hình Việt.
 *  Đây là chỗ DUY NHẤT chữ được phép xuất hiện, thay cho phụ đề chạy dưới. */
export const Label: React.FC<{
  text: string;
  x: number;
  y: number;
  size?: number;
  color?: string;
  rot?: number;
  shape?: 'bubble' | 'tag' | 'plain';
}> = ({text, x, y, size = 54, color = T.alert, rot = 0, shape = 'bubble'}) => {
  const w = text.length * size * 0.6 + 46;
  const h = size * 1.6;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {shape === 'bubble' ? (
        <ellipse cx={0} cy={0} rx={w / 2} ry={h / 2} fill={T.paper} {...LINE} />
      ) : shape === 'tag' ? (
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill={T.gold} {...LINE} />
      ) : null}
      <text
        x={0}
        y={size * 0.36}
        textAnchor="middle"
        fontSize={size}
        fontWeight={900}
        fill={color}
        fontFamily={FONT}
        stroke={shape === 'plain' ? T.line : 'none'}
        strokeWidth={shape === 'plain' ? 9 : 0}
        paintOrder="stroke"
      >
        {text}
      </text>
    </g>
  );
};

export const BanhMi: React.FC<{s?: number; bites?: number}> = ({s = 1, bites = 0}) => (
  <g transform={`scale(${s})`}>
    <path
      d={bites === 0 ? 'M-110,0 q0,-52 110,-52 q110,0 110,52 q0,52 -110,52 q-110,0 -110,-52 z' : 'M-110,0 q0,-52 110,-52 q60,0 84,20 q-40,14 -30,42 q-30,20 -54,20 q-110,0 -110,-52 z'}
      fill="#e0a558"
      {...LINE}
    />
    <path d="M-92,-8 q92,-30 184,0" fill="none" stroke="#7fbf5f" strokeWidth={13} strokeLinecap="round" />
    <path d="M-70,6 q70,26 140,0" fill="none" stroke="#d9584f" strokeWidth={11} strokeLinecap="round" />
  </g>
);

export const MoneyStack: React.FC<{s?: number; n?: number}> = ({s = 1, n = 4}) => (
  <g transform={`scale(${s})`}>
    {new Array(n).fill(0).map((_, i) => (
      <g key={i} transform={`translate(${(i % 2) * 8 - 4} ${-i * 26})`}>
        <rect x={-84} y={-22} width={168} height={44} rx={6} fill={T.money} {...LINE} />
        <circle cx={0} cy={0} r={13} fill={T.cream} {...LINE_THIN} />
      </g>
    ))}
  </g>
);

/** Bao tải, dán nhãn — dùng cho NỢ NẦN, TIỀN, TIẾT KIỆM. */
export const Sack: React.FC<{s?: number; label?: string; color?: string}> = ({
  s = 1,
  label,
  color = '#e8dbb8',
}) => (
  <g transform={`scale(${s}) translate(0 104)`}>
    <path d="M-96,0 q-16,-130 30,-168 q-30,-26 6,-38 q60,14 120,0 q36,12 6,38 q46,38 30,168 z" fill={color} {...LINE} />
    {label ? <Label text={label} x={0} y={-58} size={44} color={T.moneyDark} shape="plain" /> : null}
  </g>
);

/** Găng boxing có nhãn — ẩn dụ hai lực đối đầu. */
export const Glove: React.FC<{s?: number; color?: string; flip?: boolean; label?: string}> = ({
  s = 1,
  color = T.alert,
  flip = false,
  label,
}) => (
  <g transform={`scale(${flip ? -s : s} ${s})`}>
    {/* cánh tay chạy ra ngoài khung, để nắm đấm không lơ lửng giữa không trung */}
    <path d="M60,14 q150,26 300,20" fill="none" stroke={T.line} strokeWidth={70} strokeLinecap="round" />
    <path d="M60,14 q150,26 300,20" fill="none" stroke={color} strokeWidth={56} strokeLinecap="round" />
    <path d="M0,0 q-90,0 -90,-70 q0,-76 78,-76 q86,0 86,72 q0,74 -74,74 z" fill={color} {...LINE} />
    <rect x={-30} y={-8} width={110} height={44} rx={12} fill={T.cream} {...LINE} />
    {label ? (
      <g transform={`scale(${flip ? -1 : 1} 1)`}>
        <Label text={label} x={flip ? 30 : -30} y={-230} size={44} color={color} />
      </g>
    ) : null}
  </g>
);

/** Gói bim bim phồng khí. */
export const ChipBag: React.FC<{s?: number; puff?: number; gram?: number}> = ({s = 1, puff = 1, gram = 80}) => (
  <g transform={`scale(${s * puff} ${s / Math.sqrt(puff)})`}>
    <path d="M-120,-160 h240 l-16,34 v252 l16,34 h-240 l16,-34 v-252 z" fill={T.alert} {...LINE} />
    <Label text="BIM BIM" x={0} y={-86} size={40} color={T.alert} />
    <Label text={`${gram}g`} x={0} y={128} size={44} color={T.gold} shape="plain" />
  </g>
);

/** Cần gạt hai đầu TĂNG / GIẢM. */
export const Lever: React.FC<{s?: number; pull?: number}> = ({s = 1, pull = 0}) => (
  <g transform={`scale(${s})`}>
    <rect x={-40} y={-30} width={80} height={200} rx={16} fill="#8b8f9e" {...LINE} />
    <g transform={`rotate(${-46 + pull * 92})`}>
      <rect x={-18} y={-250} width={36} height={250} rx={14} fill={T.line} />
      <circle cx={0} cy={-262} r={44} fill={T.alert} {...LINE} />
    </g>
    <Label text="TĂNG" x={-150} y={-190} size={38} color={T.alert} />
    <Label text="GIẢM" x={150} y={-190} size={38} color={T.moneyDark} />
  </g>
);

/** Tia bùng nổ phía sau vật — báo hiệu cú chốt. */
export const Burst: React.FC<{cx: number; cy: number; r?: number; color?: string}> = ({
  cx,
  cy,
  r = 520,
  color = T.gold,
}) => {
  const frame = useCurrentFrame();
  const n = 14;
  return (
    <g transform={`rotate(${frame * 0.6} ${cx} ${cy})`} opacity={0.55}>
      {new Array(n).fill(0).map((_, i) => {
        const a0 = (i / n) * Math.PI * 2;
        const a1 = a0 + Math.PI / n / 1.5;
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
};
