import React from 'react';
import {Gach, Goc, Net, PropProps, Tron} from './co-ban';

/**
 * Prop nhóm TRỜI (đặt cao trong khung, tâm đáy = mép dưới hình). Cỡ thiết kế (co = 1):
 *   may 300x130 (bụng phẳng, 4 múi) · may-2 400x110 (dài, thấp, 5 múi)
 *   mat-troi 340x350 · mat-trang 340x360 (trăng lưỡi liềm + 2 sao)
 */

/** mây bụng phẳng 4 múi */
const May: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <Net d="M -150 0 L 150 0 A 48 48 0 0 0 116 -86 A 64 64 0 0 0 10 -126 A 66 66 0 0 0 -96 -96 A 58 58 0 0 0 -150 0 Z" />
  </Goc>
);

/** mây dài thấp 5 múi */
const May2: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <Net d="M -200 0 L 200 0 A 40 40 0 0 0 176 -66 A 56 56 0 0 0 80 -96 A 60 60 0 0 0 -30 -104 A 58 58 0 0 0 -130 -84 A 58 58 0 0 0 -200 0 Z" />
  </Goc>
);

/** mặt trời: đĩa tròn + 8 tia ngắn */
const MatTroi: React.FC<PropProps> = (p) => {
  const cy = -175;
  return (
    <Goc {...p}>
      <Tron cx={0} cy={cy} r={100} />
      {Array.from({length: 8}, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return <Gach key={i} x1={Math.cos(a) * 128} y1={cy + Math.sin(a) * 128} x2={Math.cos(a) * 170} y2={cy + Math.sin(a) * 170} />;
      })}
    </Goc>
  );
};

/** sao bốn cánh lõm */
const Sao: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => (
  <Net d={`M ${x} ${y - r} Q ${x} ${y} ${x + r} ${y} Q ${x} ${y} ${x} ${y + r} Q ${x} ${y} ${x - r} ${y} Q ${x} ${y} ${x} ${y - r} Z`} />
);

/** trăng lưỡi liềm hướng trái + 2 sao bên phải */
const MatTrang: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <Net d="M 0 -320 A 120 120 0 0 0 0 -80 A 150 150 0 0 1 0 -320 Z" />
    <Sao x={150} y={-330} r={26} />
    <Sao x={196} y={-170} r={18} />
  </Goc>
);

export const TROI: Record<'may' | 'may-2' | 'mat-troi' | 'mat-trang', React.FC<PropProps>> = {
  may: May,
  'may-2': May2,
  'mat-troi': MatTroi,
  'mat-trang': MatTrang,
};
