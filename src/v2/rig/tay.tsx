import React from 'react';
import {MUC, NEN} from './hinh';

/**
 * Bàn tay — 4 ngón (3 + ngón cái), chỏm ngắn bo tròn, không khớp, không móng.
 * Vẽ trong hệ cổ tay: gốc (0,0) là cổ tay, trục +y là hướng cẳng tay chạy tiếp
 * ra đầu ngón. Người gọi xoay bằng `huong` (độ) — 0 = xuống, 90 = sang phải màn.
 * Bàn tay ≈ 0.17 DAU.
 */
export type KieuTay = 'xoe' | 'chi' | 'nam' | 'cam' | 'ep' | 'up';

type P = {dau: number; x: number; y: number; huong: number; kieu: KieuTay; net: number; /** lật ngón cái sang bên kia */ lat?: boolean};

export const BanTay: React.FC<P> = ({dau: d, x, y, huong, kieu, net, lat}) => {
  const S = {fill: NEN, stroke: MUC, strokeWidth: net, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
  const r = 0.085 * d; // bán kính lòng bàn tay
  const ng = 0.065 * d; // dài ngón
  const nd = 0.048 * d; // dày ngón
  const m = lat ? -1 : 1;

  // một ngón: capsule từ mép lòng bàn tay ra ngoài theo góc a (độ, 0 = +y)
  const ngon = (a: number, dai = ng, day = nd, tu = r * 0.75) => {
    const ra = (a * Math.PI) / 180;
    const ux = Math.sin(ra);
    const uy = Math.cos(ra);
    const x0 = ux * tu;
    const y0 = uy * tu;
    return <line key={a} x1={x0} y1={y0} x2={x0 + ux * dai} y2={y0 + uy * dai} stroke={MUC} strokeWidth={day + 2 * net} strokeLinecap="round" />;
  };
  const ngonTrang = (a: number, dai = ng, day = nd, tu = r * 0.75) => {
    const ra = (a * Math.PI) / 180;
    const ux = Math.sin(ra);
    const uy = Math.cos(ra);
    const x0 = ux * tu;
    const y0 = uy * tu;
    return <line key={`t${a}`} x1={x0} y1={y0} x2={x0 + ux * dai} y2={y0 + uy * dai} stroke={NEN} strokeWidth={day} strokeLinecap="round" />;
  };

  let goc: number[] = [];
  let dai: number[] = [];
  let long: React.ReactNode = <circle cx={0} cy={0} r={r} {...S} />;

  switch (kieu) {
    case 'xoe': // xoè: 3 ngón toả + ngón cái ngang
      goc = [-28 * m, 0, 28 * m, 95 * m];
      dai = [ng, ng * 1.1, ng, ng * 0.8];
      break;
    case 'chi': // chỉ: 1 ngón dài, 3 ngón gập (ẩn trong lòng), ngón cái ngang
      goc = [0, 100 * m];
      dai = [0.09 * d, ng * 0.6];
      long = <ellipse cx={0} cy={0} rx={r * 0.95} ry={r * 1.05} {...S} />;
      break;
    case 'nam': // nắm: hạt đậu + 3 khấc
      long = (
        <g>
          <ellipse cx={0} cy={r * 0.15} rx={r * 1.15} ry={r * 0.95} {...S} />
          {[-0.45, 0, 0.45].map((k) => (
            <line key={k} x1={k * r} y1={r * 0.35} x2={k * r + r * 0.15} y2={r * 0.9} stroke={MUC} strokeWidth={net * 0.8} strokeLinecap="round" />
          ))}
        </g>
      );
      break;
    case 'cam': // cầm vật: hạt đậu có lỗ ở giữa (prop xuyên qua)
      long = (
        <g>
          <ellipse cx={0} cy={r * 0.15} rx={r * 1.15} ry={r * 0.95} {...S} />
          <ellipse cx={0} cy={r * 0.2} rx={r * 0.32} ry={r * 0.28} fill={NEN} stroke={MUC} strokeWidth={net * 0.8} />
        </g>
      );
      break;
    case 'ep': // duỗi khép: 3 ngón sát nhau, ngón cái ép
      goc = [-10 * m, 4 * m, 18 * m, 70 * m];
      dai = [ng, ng * 1.05, ng * 0.9, ng * 0.6];
      break;
    case 'up': // úp: lòng bàn tay quay xuống — chỉ thấy 3 ngón cùng hướng
      goc = [-12, 0, 12];
      dai = [ng * 0.9, ng, ng * 0.9];
      long = <ellipse cx={0} cy={0} rx={r * 1.1} ry={r * 0.75} {...S} />;
      break;
  }

  return (
    <g transform={`translate(${x} ${y}) rotate(${-huong})`}>
      {/* viền đen của ngón trước, rồi lòng tay trắng, rồi lõi trắng ngón — ra một khối liền */}
      {goc.map((a, i) => ngon(a, dai[i]))}
      {long}
      {goc.map((a, i) => ngonTrang(a, dai[i]))}
    </g>
  );
};
