import React from 'react';
import {Bau, Gach, Goc, Hop, HopKhoi, Net, PropProps, Tron, daGiac} from './co-ban';

/**
 * Prop nhóm TIỀN / KINH TẾ. Cỡ thiết kế (co = 1, DAU = 330):
 *   tien-giay 360x170 · dong-xu 300x300 · vi-tien 340x250 · bieu-do-tang 460x420
 *   bieu-do-giam 460x420 · heo-dat 380x300 · may-atm 400x760
 */

/** ký hiệu $ vẽ bằng nét (không dùng font) tại (cx, cy), cao h */
const KyHieuDo: React.FC<{cx: number; cy: number; h: number}> = ({cx, cy, h}) => {
  const r = h * 0.2;
  const s = h * 0.36;
  return (
    <>
      <Net to="none" d={`M ${cx + r} ${cy - s * 0.55} A ${r} ${r * 0.9} 0 1 0 ${cx} ${cy - s * 0.1} A ${r} ${r * 0.9} 0 0 1 ${cx - r} ${cy + s * 0.55}`} />
      <Gach x1={cx} y1={cy - h / 2} x2={cx} y2={cy + h / 2} />
    </>
  );
};

/** cọc tiền: 3 tờ xếp chồng có dây buộc, tờ trên có ô bầu dục + ký hiệu $ */
const TienGiay: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    {/* các tờ chồng (mặt trước) */}
    <Hop x={-170} y={-40} w={340} h={40} />
    <Hop x={-176} y={-80} w={340} h={40} />
    <Hop x={-170} y={-120} w={340} h={40} />
    {/* mặt trên phối cảnh */}
    <Net d={daGiac([-170, -120], [170, -120], [130, -170], [-130, -170])} />
    <Bau cx={0} cy={-145} rx={60} ry={16} />
    <KyHieuDo cx={0} cy={-145} h={26} />
    {/* dây buộc */}
    <Hop x={-40} y={-120} w={80} h={120} />
    <Net d={daGiac([-40, -120], [40, -120], [30, -170], [-30, -170])} />
  </Goc>
);

/** đồng xu dựng: vòng ngoài, vòng răng cưa trong, ký hiệu $ */
const DongXu: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <Tron cx={0} cy={-150} r={150} />
    <Tron cx={0} cy={-150} r={118} />
    <KyHieuDo cx={0} cy={-150} h={140} />
  </Goc>
);

/** ví da gập: thân bo, nắp gập có nút bấm, thẻ + tiền nhô ra */
const ViTien: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    {/* tiền + thẻ nhô */}
    <Net d={daGiac([-120, -210], [90, -210], [100, -250], [-110, -250])} />
    <Hop x={20} y={-236} w={120} h={60} rx={6} />
    {/* thân ví */}
    <Hop x={-170} y={-210} w={340} h={210} rx={20} />
    <Gach x1={-170} y1={-160} x2={170} y2={-160} />
    {/* nắp gập */}
    <Net d="M -170 -210 L 170 -210 L 170 -130 Q 170 -110 150 -110 L 90 -110 L 90 -80 L -170 -80 Z" />
    <Tron cx={120} cy={-115} r={12} />
    {/* đường may */}
    <Gach x1={-150} y1={-20} x2={150} y2={-20} />
  </Goc>
);

/** biểu đồ cột: 4 cột + mũi tên xu hướng. len = true tăng, false giảm */
const BieuDo: React.FC<PropProps & {len: boolean}> = ({len, ...p}) => {
  const cao = len ? [90, 160, 240, 330] : [330, 240, 160, 90];
  const xs = [-180, -60, 60, 180];
  return (
    <Goc {...p}>
      {/* trục */}
      <Gach x1={-230} y1={0} x2={230} y2={0} />
      <Gach x1={-230} y1={0} x2={-230} y2={-400} />
      {xs.map((x, i) => (
        <Hop key={i} x={x - 40} y={-cao[i]} w={80} h={cao[i]} />
      ))}
      {/* mũi tên */}
      {len ? (
        <>
          <Net to="none" d="M -190 -160 L 150 -400" />
          <Net d="M 150 -400 L 100 -395 L 140 -350 Z" />
        </>
      ) : (
        <>
          <Net to="none" d="M -190 -400 L 150 -160" />
          <Net d="M 150 -160 L 140 -210 L 100 -165 Z" />
        </>
      )}
    </Goc>
  );
};
const BieuDoTang: React.FC<PropProps> = (p) => <BieuDo {...p} len />;
const BieuDoGiam: React.FC<PropProps> = (p) => <BieuDo {...p} len={false} />;

/** heo đất: thân bầu, mõm tròn bên phải, tai, 4 chân, khe bỏ tiền có đồng xu, đuôi xoắn */
const HeoDat: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    {/* đồng xu trên khe */}
    <Tron cx={-20} cy={-300} r={40} />
    {/* chân */}
    <Hop x={-140} y={-60} w={50} h={60} rx={10} />
    <Hop x={-50} y={-60} w={50} h={60} rx={10} />
    <Hop x={40} y={-60} w={50} h={60} rx={10} />
    <Hop x={120} y={-60} w={50} h={60} rx={10} />
    {/* đuôi */}
    <Net to="none" d="M -170 -180 Q -220 -200 -200 -230 Q -180 -250 -200 -260" />
    {/* thân */}
    <Bau cx={0} cy={-170} rx={180} ry={120} />
    {/* tai */}
    <Net d="M 60 -270 L 90 -330 L 120 -260 Z" />
    {/* mõm */}
    <Bau cx={170} cy={-170} rx={40} ry={32} />
    <Tron cx={158} cy={-176} r={6} />
    <Tron cx={182} cy={-176} r={6} />
    {/* mắt */}
    <Tron cx={100} cy={-210} r={8} />
    {/* khe bỏ tiền */}
    <Hop x={-50} y={-292} w={60} h={10} rx={5} />
  </Goc>
);

/** máy ATM: thân đứng, màn hình, bàn phím 3x3, khe thẻ, khe tiền */
const MayAtm: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <HopKhoi x0={-200} x1={200} yTren={-760} yDuoi={0} sau={0.12} />
    {/* màn hình */}
    <Hop x={-150} y={-700} w={300} h={200} rx={8} />
    <Hop x={-130} y={-680} w={260} h={160} />
    <Gach x1={-100} y1={-640} x2={60} y2={-640} />
    <Gach x1={-100} y1={-600} x2={0} y2={-600} />
    {/* bàn phím */}
    {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <Hop key={`${r}${c}`} x={-140 + c * 60} y={-460 + r * 50} w={44} h={34} rx={6} />))}
    {/* khe thẻ + đèn */}
    <Hop x={60} y={-460} w={100} h={20} rx={4} />
    <Tron cx={110} cy={-400} r={10} />
    {/* khe tiền */}
    <Hop x={-140} y={-260} w={280} h={40} rx={6} />
    <Hop x={-100} y={-250} w={200} h={20} />
  </Goc>
);

export const KINH_TE: Record<'tien-giay' | 'dong-xu' | 'vi-tien' | 'bieu-do-tang' | 'bieu-do-giam' | 'heo-dat' | 'may-atm', React.FC<PropProps>> = {
  'tien-giay': TienGiay,
  'dong-xu': DongXu,
  'vi-tien': ViTien,
  'bieu-do-tang': BieuDoTang,
  'bieu-do-giam': BieuDoGiam,
  'heo-dat': HeoDat,
  'may-atm': MayAtm,
};
