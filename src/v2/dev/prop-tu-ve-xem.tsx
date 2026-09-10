import React from 'react';
import {AbsoluteFill} from 'remotion';
import {PropTuVeVe} from '../props/tu-ve';
import {CO_CANH, CoCanh, PropTuVe} from '../board/kieu-board';
import {NEN, MUC, net as tinhNet} from '../rig/hinh';
import {FONT} from '../../engine/font';
import {NhanVat} from '../rig/nhan-vat';

/**
 * Xem một prop tự vẽ — composition nhận input props {ten, mau, chu, co, coCanh, thu}.
 *
 *   node pipeline/xem-prop.mjs <du-an> <ten> [--chu "NHÃN"] [--co-canh sat|can|trung|rong|nho] [--thu 0.25]
 *
 * Mặc định: vẽ ở co = 1 cạnh nhân vật cỡ trung (DAU 330), lưới 100 px, khung đỏ = rong × cao khai báo.
 * `co`     : hệ số nhân thêm cho prop (xem-prop truyền co_board × DAU_cỡ/330 khi có --co-canh).
 * `coCanh` : giả lập đúng khung 1920×1080 của cỡ cảnh đó (thu vừa canvas): nhân vật ở DAU của cỡ,
 *            chân ở chanY của cỡ, prop cùng cỡ như renderer sẽ vẽ → thấy prop chiếm bao nhiêu khung.
 * `thu`    : < 1 → ẩn lưới và chú thích để ảnh thu nhỏ (xem-prop render thêm bản --scale) chỉ còn hình.
 */
export const XEM_W = 1400;
export const XEM_H = 1000;

const KHUNG_W = 1920;
const KHUNG_H = 1080;

export const PropTuVeXem: React.FC<{ten?: string; mau?: PropTuVe; chu?: string; co?: number; coCanh?: CoCanh; thu?: number}> = ({ten = '?', mau, chu, co = 1, coCanh, thu = 1}) => {
  const dayY = 900;
  const luoi = thu >= 1;

  // ── giả lập khung cỡ cảnh ─────────────────────────────────────────
  if (coCanh && CO_CANH[coCanh]) {
    const cc = CO_CANH[coCanh];
    const s = Math.min(XEM_W / KHUNG_W, (XEM_H - (luoi ? 120 : 0)) / KHUNG_H);
    const ox = (XEM_W - KHUNG_W * s) / 2;
    const oy = luoi ? 100 : (XEM_H - KHUNG_H * s) / 2;
    // prop đặt tâm đáy ở y 0.9 khi chân nhân vật rơi ngoài khung (can/sat), còn lại đứng cùng mặt đất với nhân vật
    const yProp = Math.min(cc.chanY, 0.9) * KHUNG_H;
    const net = tinhNet(cc.dau);
    return (
      <AbsoluteFill style={{background: NEN}}>
        <svg width={XEM_W} height={XEM_H}>
          {luoi && (
            <>
              <text x={20} y={40} fontFamily={FONT} fontSize={24} fontWeight={700} fill={MUC}>
                {`"${ten}" trong khung cỡ ${coCanh} (DAU ${cc.dau}, chân y ${cc.chanY}) — co trên màn ${co.toFixed(2)} = co board × ${cc.dau}/330`}
              </text>
              <text x={20} y={72} fontFamily={FONT} fontSize={20} fill="#555">
                {mau ? `khai ${mau.rong}×${mau.cao} px → trên màn ${Math.round(mau.rong * co)}×${Math.round(mau.cao * co)} px = cao ${Math.round(((mau.cao * co) / KHUNG_H) * 100)}% khung (đặc tả nên 60–70%) · ${mau.moTa}` : 'không có dữ liệu'}
              </text>
            </>
          )}
          <g transform={`translate(${ox} ${oy}) scale(${s})`}>
            <rect x={0} y={0} width={KHUNG_W} height={KHUNG_H} fill="#fff" stroke="#bbb" strokeWidth={3 / s} />
            <clipPath id="khung-xem">
              <rect x={0} y={0} width={KHUNG_W} height={KHUNG_H} />
            </clipPath>
            <g clipPath="url(#khung-xem)">
              {luoi && (
                <>
                  <line x1={KHUNG_W * 0.3} y1={0} x2={KHUNG_W * 0.3} y2={KHUNG_H} stroke="#e6e6e6" strokeWidth={2 / s} strokeDasharray="10 10" />
                  <line x1={KHUNG_W * 0.7} y1={0} x2={KHUNG_W * 0.7} y2={KHUNG_H} stroke="#e6e6e6" strokeWidth={2 / s} strokeDasharray="10 10" />
                  <line x1={0} y1={KHUNG_H * 0.9} x2={KHUNG_W} y2={KHUNG_H * 0.9} stroke="#f3c3bd" strokeWidth={2 / s} strokeDasharray="10 10" />
                </>
              )}
              <NhanVat kieu="nam" dau={cc.dau} x={KHUNG_W * 0.28} y={cc.chanY * KHUNG_H} dang="dung" mieng="cuoi-nhe" id="xem" />
              {mau ? <PropTuVeVe x={KHUNG_W * 0.66} y={yProp} co={co} net={net} mau={mau} chu={chu} /> : null}
              {mau && luoi && <rect x={KHUNG_W * 0.66 - (mau.rong * co) / 2} y={yProp - mau.cao * co} width={mau.rong * co} height={mau.cao * co} fill="none" stroke="#f81000" strokeWidth={2 / s} strokeDasharray="8 8" />}
            </g>
          </g>
        </svg>
      </AbsoluteFill>
    );
  }

  // ── mặc định: co = 1 cạnh nhân vật cỡ trung, lưới 100 px ───────────
  return (
    <AbsoluteFill style={{background: NEN}}>
      <svg width={XEM_W} height={XEM_H}>
        {luoi &&
          Array.from({length: 15}, (_, i) => (
            <line key={`v${i}`} x1={i * 100} y1={0} x2={i * 100} y2={XEM_H} stroke="#e6e6e6" strokeWidth={1} />
          ))}
        {luoi &&
          Array.from({length: 10}, (_, i) => (
            <line key={`h${i}`} x1={0} y1={i * 100} x2={XEM_W} y2={i * 100} stroke="#e6e6e6" strokeWidth={1} />
          ))}
        {luoi && <line x1={0} y1={dayY} x2={XEM_W} y2={dayY} stroke="#bbb" strokeWidth={2} strokeDasharray="8 8" />}
        <NhanVat kieu="nam" dau={330} x={300} y={dayY} dang="dung" mieng="cuoi-nhe" id="xem" />
        {mau ? <PropTuVeVe x={900} y={dayY} co={co} net={4.95} mau={mau} chu={chu} /> : null}
        {mau && luoi && <rect x={900 - (mau.rong * co) / 2} y={dayY - mau.cao * co} width={mau.rong * co} height={mau.cao * co} fill="none" stroke="#f81000" strokeWidth={1.5} strokeDasharray="6 6" />}
        {luoi && (
          <>
            <text x={20} y={40} fontFamily={FONT} fontSize={26} fontWeight={700} fill={MUC}>
              {`prop tự vẽ "${ten}" — co = ${co}, lưới 100 px, khung đỏ = rong × cao khai báo; nhân vật DAU 330 (cỡ trung) để so tỉ lệ`}
            </text>
            <text x={20} y={72} fontFamily={FONT} fontSize={20} fill="#555">
              {mau?.moTa ?? 'không có dữ liệu — truyền --props {"ten","mau"}'}
            </text>
          </>
        )}
      </svg>
    </AbsoluteFill>
  );
};
