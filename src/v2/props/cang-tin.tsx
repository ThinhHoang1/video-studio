import React from 'react';
import {Bau, Diem, Gach, Goc, Hop, HopKhoi, Net, PropProps, daGiac, lui} from './co-ban';

/**
 * Prop nhóm CĂNG TIN / QUÁN. Cỡ thiết kế (co = 1, nhân vật DAU = 330):
 *   ghe-nha-hang 180x560 · quay-cang-tin 760x800 · khay-com 360x220
 */

/** ghế đơn nhìn thẳng hơi từ trên: mặt ngồi phối cảnh, lưng bo, bốn chân */
const GheNhaHang: React.FC<PropProps> = (p) => {
  const vp: Diem = [0, -700];
  const sau = 0.18;
  const ySeat = -260;
  const sa = lui([-90, ySeat], sau, vp);
  const sb = lui([90, ySeat], sau, vp);
  const chanSau = (x: number) => {
    const a = lui([x, ySeat], sau, vp);
    const b = lui([x, 0], sau, vp);
    return <Hop x={a[0] - 6} y={a[1]} w={12} h={b[1] - a[1]} />;
  };
  return (
    <Goc {...p}>
      {chanSau(-80)}
      {chanSau(80)}
      {/* lưng ghế trên mép sau */}
      <Hop x={sa[0] + 2} y={-560} w={12} h={sa[1] + 560} />
      <Hop x={sb[0] - 14} y={-560} w={12} h={sa[1] + 560} />
      <Hop x={sa[0]} y={-560} w={sb[0] - sa[0]} h={90} rx={12} />
      {/* mặt ngồi */}
      <Net d={daGiac([-90, ySeat], [90, ySeat], sb, sa)} />
      <Hop x={-90} y={ySeat} w={180} h={20} />
      <Hop x={-88} y={ySeat + 20} w={14} h={-(ySeat + 20)} />
      <Hop x={74} y={ySeat + 20} w={14} h={-(ySeat + 20)} />
    </Goc>
  );
};

/** quầy căng tin: quầy dài, tủ kính bày khay bên trái, máy tính tiền bên phải, bảng thực đơn treo phía trên */
const QuayCangTin: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    {/* bảng thực đơn treo */}
    <Gach x1={-160} y1={-810} x2={-160} y2={-700} />
    <Gach x1={160} y1={-810} x2={160} y2={-700} />
    <Hop x={-220} y={-700} w={440} h={150} />
    <Hop x={-206} y={-686} w={412} h={122} />
    {[-660, -625, -590].map((y, i) => (
      <React.Fragment key={y}>
        <Gach x1={-180} y1={y} x2={-180 + [120, 80, 100][i]} y2={y} />
        <Gach x1={100} y1={y} x2={160} y2={y} />
      </React.Fragment>
    ))}
    {/* quầy */}
    <HopKhoi x0={-380} x1={380} yTren={-280} yDuoi={0} sau={0.12} vp={[0, -900]} />
    {/* tủ kính bày đồ ăn */}
    <Hop x={-360} y={-450} w={300} h={170} />
    <Gach x1={-360} y1={-365} x2={-60} y2={-365} />
    {[-340, -240, -140].map((x) => (
      <React.Fragment key={x}>
        <Hop x={x} y={-400} w={80} h={22} />
        <Hop x={x} y={-314} w={80} h={22} />
      </React.Fragment>
    ))}
    <Gach x1={-340} y1={-430} x2={-310} y2={-446} />
    {/* máy tính tiền */}
    <Hop x={200} y={-340} w={120} h={60} />
    <Net d={daGiac([210, -340], [310, -340], [300, -400], [220, -400])} />
    <Gach x1={230} y1={-320} x2={290} y2={-320} />
    <Gach x1={230} y1={-304} x2={270} y2={-304} />
  </Goc>
);

/** khay cơm: khay phối cảnh, bát cơm vun có đũa, đĩa thức ăn, ly nước */
const KhayCom: React.FC<PropProps> = (p) => {
  const vp: Diem = [0, -500];
  const sau = 0.16;
  const tl = lui([-180, -30], sau, vp);
  const tr = lui([180, -30], sau, vp);
  return (
    <Goc {...p}>
      <Net d={daGiac([-180, -30], [180, -30], tr, tl)} />
      <Hop x={-180} y={-30} w={360} h={30} rx={6} />
      {/* bát cơm: cơm vun, vành, thân */}
      <Net d="M -122 -112 Q -80 -152 -38 -112 Z" />
      <Bau cx={-80} cy={-110} rx={50} ry={12} />
      <Net d="M -130 -110 Q -120 -60 -80 -60 Q -40 -60 -30 -110 Z" />
      <Gach x1={-70} y1={-140} x2={-24} y2={-222} />
      <Gach x1={-58} y1={-136} x2={-8} y2={-214} />
      {/* đĩa thức ăn */}
      <Bau cx={70} cy={-70} rx={70} ry={16} />
      <Net d="M 22 -74 Q 70 -114 118 -74 Z" />
      {/* ly nước */}
      <Hop x={140} y={-140} w={38} h={70} rx={4} />
      <Gach x1={144} y1={-112} x2={174} y2={-112} />
    </Goc>
  );
};

export const CANG_TIN: Record<'ghe-nha-hang' | 'quay-cang-tin' | 'khay-com', React.FC<PropProps>> = {
  'ghe-nha-hang': GheNhaHang,
  'quay-cang-tin': QuayCangTin,
  'khay-com': KhayCom,
};
