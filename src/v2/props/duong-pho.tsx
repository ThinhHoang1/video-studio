import React from 'react';
import {Diem, Gach, Goc, Hop, HopKhoi, Net, PropProps, Tron, daGiac, r1} from './co-ban';

/**
 * Prop nhóm ĐƯỜNG PHỐ. Cỡ thiết kế (co = 1, nhân vật DAU = 330):
 *   xe-buyt 880x600 · tram-xe-buyt 680x900 · den-duong 320x1000 · hang-rao 600x262
 *   cay-nho 280x420 · thung-rac 232x330 · cot-co 250x1020
 */

/** xe buýt nhìn ngang, đầu xe bên phải, cửa giữa mở (cánh gập ra ngoài), bảng tuyến trên kính lái */
const XeBuyt: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    {/* thân */}
    <Hop x={-440} y={-560} w={880} h={440} rx={40} />
    {/* bảng tuyến */}
    <Hop x={230} y={-600} w={200} h={40} rx={6} />
    <Gach x1={250} y1={-580} x2={330} y2={-580} />
    <Gach x1={350} y1={-580} x2={400} y2={-580} />
    {/* dải cửa sổ */}
    {[-400, -270, -140, -10].map((x) => (
      <Hop key={x} x={x} y={-520} w={110} h={150} rx={8} />
    ))}
    {/* kính lái */}
    <Net d="M 330 -520 L 400 -520 Q 430 -520 430 -490 L 430 -360 L 330 -360 Z" />
    {/* ô cửa mở + cánh gập ra ngoài */}
    <Hop x={150} y={-520} w={110} h={380} />
    <Net d={daGiac([260, -520], [300, -540], [300, -130], [260, -140])} />
    <Gach x1={280} y1={-500} x2={280} y2={-160} />
    {/* bánh */}
    {[-290, 330].map((x) => (
      <React.Fragment key={x}>
        <Tron cx={x} cy={-90} r={90} />
        <Tron cx={x} cy={-90} r={34} />
      </React.Fragment>
    ))}
    {/* đèn pha, gương */}
    <Tron cx={414} cy={-190} r={16} />
    <Hop x={436} y={-470} w={20} h={40} rx={6} />
  </Goc>
);

/** trạm xe buýt: mái che hai cột, tấm kính sau, ghế chờ, biển trạm trên cột riêng bên trái */
const TramXeBuyt: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    {/* biển trạm */}
    <Hop x={-336} y={-800} w={12} h={800} />
    <Hop x={-390} y={-900} w={120} h={90} rx={8} />
    <Gach x1={-370} y1={-872} x2={-300} y2={-872} />
    <Gach x1={-370} y1={-852} x2={-320} y2={-852} />
    <Gach x1={-370} y1={-832} x2={-290} y2={-832} />
    {/* tấm kính sau + vệt sáng */}
    <Hop x={-220} y={-660} w={440} h={360} />
    <Gach x1={-190} y1={-500} x2={-120} y2={-620} />
    <Gach x1={-170} y1={-460} x2={-90} y2={-600} />
    {/* ghế chờ */}
    <Hop x={-160} y={-240} w={12} h={240} />
    <Hop x={148} y={-240} w={12} h={240} />
    <Hop x={-180} y={-266} w={360} h={26} />
    {/* hai cột + mái */}
    <Hop x={-250} y={-700} w={16} h={700} />
    <Hop x={234} y={-700} w={16} h={700} />
    <HopKhoi x0={-290} x1={290} yTren={-740} yDuoi={-700} sau={0.1} vp={[0, -1100]} />
  </Goc>
);

/** đèn đường: cột thuôn trên bệ, cần cong sang phải, chụp đèn hình thang có bóng */
const DenDuong: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <HopKhoi x0={-50} x1={50} yTren={-70} yDuoi={0} sau={0.1} vp={[220, -420]} />
    <Net d={daGiac([-26, -70], [26, -70], [14, -900], [-14, -900])} />
    <Net d="M -14 -900 Q -14 -994 90 -994 L 210 -994 L 210 -966 L 90 -966 Q 14 -966 14 -900 Z" />
    <Net d={daGiac([170, -994], [270, -994], [292, -940], [148, -940])} />
    <Net d="M 160 -940 L 280 -940 Q 280 -906 220 -904 Q 160 -906 160 -940 Z" />
  </Goc>
);

/** hàng rào gỗ: hai thanh ngang, 7 thanh đứng đầu nhọn */
const HangRao: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <Hop x={-300} y={-200} w={600} h={22} />
    <Hop x={-300} y={-100} w={600} h={22} />
    {Array.from({length: 7}, (_, i) => {
      const x = -270 + i * 90 - 20;
      return <Net key={i} d={`M ${x} 0 L ${x} -230 L ${x + 20} -262 L ${x + 40} -230 L ${x + 40} 0 Z`} />;
    })}
  </Goc>
);

/** tán vỏ sò: chuỗi cung tròn quanh một ellipse (dùng chung cây nhỏ) */
export const tanLa = (cx: number, cy: number, rx: number, ry: number, n: number) => {
  const pts = Array.from({length: n}, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry] as Diem;
  });
  let d = `M ${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    const day = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const r = day * 0.58;
    d += ` A ${r1(r)} ${r1(r)} 0 0 1 ${r1(b[0])} ${r1(b[1])}`;
  }
  return d + ' Z';
};

/** cây nhỏ: thân mảnh, tán tròn 7 múi (bằng nửa goc-cay) */
const CayNho: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <Net d="M -18 0 Q -12 -80 -14 -180 L 14 -180 Q 12 -80 18 0 Z" />
    <Net d={tanLa(0, -300, 130, 112, 7)} />
    <Net to="none" d="M -60 -270 q 30 -40 80 -46" />
  </Goc>
);

/** thùng rác: thân thuôn có hai gờ, nắp rời, tay cầm */
const ThungRac: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <Net d={daGiac([-90, 0], [90, 0], [104, -280], [-104, -280])} />
    <Gach x1={-40} y1={-40} x2={-46} y2={-240} />
    <Gach x1={40} y1={-40} x2={46} y2={-240} />
    <Hop x={-116} y={-306} w={232} h={26} rx={8} />
    <Hop x={-26} y={-330} w={52} h={24} rx={8} />
  </Goc>
);

/** cột cờ: hai bậc bệ, cột mảnh, cờ bay sang phải không tô, quả cầu trên đỉnh */
const CotCo: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <HopKhoi x0={-70} x1={70} yTren={-40} yDuoi={0} sau={0.12} vp={[300, -420]} />
    <HopKhoi x0={-40} x1={40} yTren={-80} yDuoi={-40} sau={0.12} vp={[300, -420]} />
    <Hop x={-7} y={-1000} w={14} h={920} />
    <Tron cx={0} cy={-1008} r={10} />
    <Net d="M 7 -992 Q 110 -1016 240 -984 Q 250 -900 240 -816 Q 110 -848 7 -822 Z" />
  </Goc>
);

export const DUONG_PHO: Record<'xe-buyt' | 'tram-xe-buyt' | 'den-duong' | 'hang-rao' | 'cay-nho' | 'thung-rac' | 'cot-co', React.FC<PropProps>> = {
  'xe-buyt': XeBuyt,
  'tram-xe-buyt': TramXeBuyt,
  'den-duong': DenDuong,
  'hang-rao': HangRao,
  'cay-nho': CayNho,
  'thung-rac': ThungRac,
  'cot-co': CotCo,
};
