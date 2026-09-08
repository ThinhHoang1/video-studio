import React from 'react';
import {random, useCurrentFrame} from 'remotion';
import {P, W, H, SAN} from './places';

const L3 = {stroke: P.line, strokeWidth: 3.5, strokeLinecap: 'round', strokeLinejoin: 'round'} as const;

/**
 * Đám đông làm nền — vẽ thành bóng xanh xám nhạt, không có nét mặt.
 *
 * Mẹo lấy từ kênh tham chiếu: người phụ ở sân bay, khán phòng, hành lang đều
 * chỉ là bóng một màu. Rẻ hơn vẽ chi tiết rất nhiều, mà lại đúng về mặt thị
 * giác — mắt người xem cần biết "có đông người" chứ không cần biết họ là ai.
 */
export const DamDong: React.FC<{
  n?: number;
  y?: number;
  tuX?: number;
  denX?: number;
  s?: number;
  mau?: string;
  /** nhấp nhô nhẹ cho đỡ chết cứng */
  dong?: boolean;
}> = ({n = 9, y = SAN, tuX = 60, denX = W - 60, s = 1, mau = '#aab8c8', dong = true}) => {
  const frame = useCurrentFrame();
  return (
    <g opacity={0.85}>
      {new Array(n).fill(0).map((_, i) => {
        const x = tuX + ((denX - tuX) / Math.max(1, n - 1)) * i + (random(`dx${i}`) - 0.5) * 40;
        const cao = s * (0.85 + random(`h${i}`) * 0.3);
        const nhun = dong ? Math.sin(frame / 38 + i * 1.7) * 3 : 0;
        const dam = i % 3 === 0 ? '#93a3b5' : mau;
        return (
          <g key={i} transform={`translate(${x} ${y + nhun}) scale(${cao})`}>
            <path d="M-58,-40 q58,-30 116,0 l14,152 h-144 z" fill={dam} />
            <circle cx={0} cy={-92} r={44} fill={dam} />
          </g>
        );
      })}
    </g>
  );
};

/**
 * Vật ở tiền cảnh, che một phần khung và bị làm tối.
 * Đây là thứ tạo cảm giác "máy quay đứng trong phòng" thay vì "hình dán phẳng".
 */
export const TienCanh: React.FC<{kieu?: 'ban' | 'cua' | 'cay' | 'ghe'; ben?: 'trai' | 'phai'}> = ({
  kieu = 'ban',
  ben = 'trai',
}) => {
  const lat = ben === 'phai' ? -1 : 1;
  const goc = ben === 'phai' ? W : 0;
  return (
    <g transform={`translate(${goc} 0) scale(${lat} 1)`} opacity={0.92}>
      {kieu === 'ban' ? (
        <>
          <rect x={-40} y={H - 260} width={520} height={40} rx={10} fill="#4a3a2c" />
          <rect x={90} y={H - 220} width={40} height={220} fill="#3a2d22" />
          <ellipse cx={300} cy={H - 282} rx={56} ry={22} fill="#5c4a38" />
          <rect x={266} y={H - 330} width={68} height={50} rx={8} fill="#6b5644" />
        </>
      ) : kieu === 'cua' ? (
        <rect x={-40} y={-40} width={300} height={H + 80} fill="#2e2620" />
      ) : kieu === 'ghe' ? (
        <>
          <rect x={-60} y={H - 420} width={420} height={300} rx={40} fill="#3f3348" />
          <rect x={-60} y={H - 200} width={420} height={200} rx={20} fill="#332942" />
        </>
      ) : (
        <>
          <rect x={110} y={H - 420} width={44} height={420} fill="#33291f" />
          <circle cx={132} cy={H - 470} r={180} fill="#2f4a32" />
          <circle cx={250} cy={H - 380} r={120} fill="#37543a" />
        </>
      )}
    </g>
  );
};

/** Lớp phủ tối ở rìa khung — kéo mắt vào giữa. */
export const ToiRia: React.FC<{manh?: number}> = ({manh = 0.55}) => (
  <>
    <defs>
      <radialGradient id="ria" cx="48%" cy="52%" r="72%">
        <stop offset="42%" stopColor="rgba(0,0,0,0)" />
        <stop offset="100%" stopColor={`rgba(16,12,26,${manh})`} />
      </radialGradient>
    </defs>
    <rect x={0} y={0} width={W} height={H} fill="url(#ria)" />
  </>
);
