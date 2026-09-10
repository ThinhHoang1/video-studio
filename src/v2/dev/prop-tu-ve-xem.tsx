import React from 'react';
import {AbsoluteFill} from 'remotion';
import {PropTuVeVe} from '../props/tu-ve';
import type {PropTuVe} from '../board/kieu-board';
import {NEN, MUC} from '../rig/hinh';
import {FONT} from '../../engine/font';
import {NhanVat} from '../rig/nhan-vat';

/**
 * Xem một prop tự vẽ — composition nhận input props {ten, mau, chu}.
 * Vẽ ở co = 1 cạnh nhân vật cỡ trung (DAU 330) để agent so tỉ lệ, kèm lưới 100 px.
 *   node pipeline/xem-prop.mjs <du-an> <ten>
 */
export const XEM_W = 1400;
export const XEM_H = 1000;

export const PropTuVeXem: React.FC<{ten?: string; mau?: PropTuVe; chu?: string}> = ({ten = '?', mau, chu}) => {
  const dayY = 900;
  return (
    <AbsoluteFill style={{background: NEN}}>
      <svg width={XEM_W} height={XEM_H}>
        {Array.from({length: 15}, (_, i) => (
          <line key={`v${i}`} x1={i * 100} y1={0} x2={i * 100} y2={XEM_H} stroke="#e6e6e6" strokeWidth={1} />
        ))}
        {Array.from({length: 10}, (_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 100} x2={XEM_W} y2={i * 100} stroke="#e6e6e6" strokeWidth={1} />
        ))}
        <line x1={0} y1={dayY} x2={XEM_W} y2={dayY} stroke="#bbb" strokeWidth={2} strokeDasharray="8 8" />
        <NhanVat kieu="nam" dau={330} x={300} y={dayY} dang="dung" mieng="cuoi-nhe" id="xem" />
        {mau ? <PropTuVeVe x={900} y={dayY} co={1} net={4.95} mau={mau} chu={chu} /> : null}
        {mau && <rect x={900 - mau.rong / 2} y={dayY - mau.cao} width={mau.rong} height={mau.cao} fill="none" stroke="#f81000" strokeWidth={1.5} strokeDasharray="6 6" />}
        <text x={20} y={40} fontFamily={FONT} fontSize={26} fontWeight={700} fill={MUC}>
          {`prop tự vẽ "${ten}" — co = 1, lưới 100 px, khung đỏ = rong × cao khai báo; nhân vật DAU 330 để so tỉ lệ`}
        </text>
        <text x={20} y={72} fontFamily={FONT} fontSize={20} fill="#555">
          {mau?.moTa ?? 'không có dữ liệu — truyền --props {"ten","mau"}'}
        </text>
      </svg>
    </AbsoluteFill>
  );
};
