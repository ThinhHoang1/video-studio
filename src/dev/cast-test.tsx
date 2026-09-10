import React from 'react';
import {AbsoluteFill} from 'remotion';
import {NhanVat} from '../library/cast/nhan-vat';
import {KIEU} from '../library/cast/kieu';

/** Bảng thử dàn nhân vật — xem cả dàn một lượt trước khi đem vào phim. */
const im = {
  am: new Array(600).fill(0.3),
  nhan: new Array(600).fill(0.2),
  nghi: new Array(600).fill(false),
};

const ds = Object.keys(KIEU);

export const CastTest: React.FC = () => (
  <AbsoluteFill style={{background: '#efe6d6'}}>
    <svg viewBox="0 0 2400 900" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
      <rect x={0} y={720} width={2400} height={180} fill="#ddd0ba" />
      {ds.map((k, i) => (
        <g key={k}>
          <g transform={`translate(${170 + i * 280} 720) scale(0.72)`}>
            <NhanVat giong={im} goc={0} kieu={k} dang="dung" sac="thuong" vi={0.8} />
          </g>
          <text
            x={170 + i * 280}
            y={800}
            textAnchor="middle"
            fontSize={32}
            fontWeight={800}
            fill="#3a2f45"
            fontFamily="system-ui"
          >
            {KIEU[k].ten}
          </text>
          <text
            x={170 + i * 280}
            y={840}
            textAnchor="middle"
            fontSize={22}
            fontWeight={600}
            fill="#8a7f95"
            fontFamily="ui-monospace, monospace"
          >
            {k}
          </text>
        </g>
      ))}
    </svg>
  </AbsoluteFill>
);
