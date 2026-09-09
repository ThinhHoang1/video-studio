import React from 'react';
import {AbsoluteFill} from 'remotion';
import {NhanVat} from '../library/cast/nhan-vat';
import {TU_THE, Dang} from '../library/cast/tu-the';

/** Bảng thử: xem cả bộ dáng một lượt trước khi đem vào phim. */
const im = {
  am: new Array(600).fill(0.3),
  nhan: new Array(600).fill(0.2),
  nghi: new Array(600).fill(false),
};

const ds = Object.keys(TU_THE) as Dang[];
const SAC = ['thuong', 'vui', 'soc', 'tuc', 'buon', 'met'] as const;

export const PoseTest: React.FC = () => (
  <AbsoluteFill style={{background: '#e9dfcc'}}>
    <svg viewBox="0 0 2400 1400" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
      {/* hàng trên: 11 tư thế */}
      {ds.map((d, i) => (
        <g key={d}>
          <g transform={`translate(${130 + i * 205} 690) scale(0.6)`}>
            <NhanVat giong={im} goc={0} dang={d} sac="thuong" vi={0.7} />
          </g>
          <text
            x={130 + i * 205}
            y={740}
            textAnchor="middle"
            fontSize={26}
            fontWeight={800}
            fill="#3a2f45"
            fontFamily="system-ui"
          >
            {d}
          </text>
        </g>
      ))}

      {/* hàng dưới: 6 sắc thái, cận mặt */}
      {SAC.map((sc, i) => (
        <g key={sc}>
          <g transform={`translate(${230 + i * 380} 1290) scale(0.95)`}>
            <NhanVat giong={im} goc={0} dang="dung" sac={sc} vi={0.7} />
          </g>
          <text
            x={300 + i * 340}
            y={1350}
            textAnchor="middle"
            fontSize={30}
            fontWeight={800}
            fill="#3a2f45"
            fontFamily="system-ui"
          >
            {sc}
          </text>
        </g>
      ))}
    </svg>
  </AbsoluteFill>
);
