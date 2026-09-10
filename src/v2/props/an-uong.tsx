import React from 'react';
import {BanHo, Bau, Gach, Goc, Hop, HopKhoi, Net, PropProps, Tron, daGiac} from './co-ban';

/**
 * Prop nhóm ĂN UỐNG. Cỡ thiết kế (co = 1, DAU = 330):
 *   bat-pho 280x340 · ly-cafe 220x260 · dia-com 340x160 · xe-day-hang-rong 520x700
 *   ban-nhau 520x420 · tu-kinh-banh 500x560
 */

/** 3 sợi khói lượn từ (cx, y) lên cao h */
const Khoi: React.FC<{cx: number; y: number; h: number; cach?: number}> = ({cx, y, h, cach = 40}) => (
  <>
    {[-1, 0, 1].map((i) => {
      const x = cx + i * cach;
      const yy = y - (i === 0 ? 16 : 0);
      return <Net key={i} to="none" d={`M ${x} ${yy} Q ${x - 18} ${yy - h * 0.3} ${x} ${yy - h * 0.5} Q ${x + 18} ${yy - h * 0.75} ${x} ${yy - h}`} />;
    })}
  </>
);

/** bát phở: bát loe miệng rộng, đũa cắm chéo, khói */
const BatPho: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <Khoi cx={-10} y={-210} h={120} cach={46} />
    {/* đũa */}
    <Gach x1={40} y1={-170} x2={130} y2={-330} />
    <Gach x1={62} y1={-170} x2={146} y2={-320} />
    {/* thân bát + đế */}
    <Hop x={-50} y={-20} w={100} h={20} />
    <Net d="M -140 -170 Q -120 -20 -60 -20 L 60 -20 Q 120 -20 140 -170 Z" />
    <Bau cx={0} cy={-170} rx={140} ry={30} />
    {/* hoa văn */}
    <Gach x1={-110} y1={-110} x2={110} y2={-110} />
  </Goc>
);

/** ly cà phê: đĩa lót, tách có tay cầm bên phải, khói */
const LyCafe: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <Khoi cx={-10} y={-190} h={80} cach={34} />
    <Bau cx={0} cy={-14} rx={110} ry={14} />
    <Net to="none" d="M 74 -140 Q 130 -150 130 -100 Q 130 -50 74 -60" />
    <Net d="M -80 -170 Q -70 -20 -30 -20 L 30 -20 Q 70 -20 80 -170 Z" />
    <Bau cx={0} cy={-170} rx={80} ry={20} />
  </Goc>
);

/** đĩa cơm: đĩa bầu dục, mô cơm, trứng ốp la, thìa bên phải */
const DiaCom: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <Bau cx={0} cy={-30} rx={170} ry={30} />
    <Bau cx={0} cy={-30} rx={140} ry={20} />
    {/* mô cơm */}
    <Net d="M -110 -34 Q -110 -110 -40 -110 Q 20 -110 20 -34 Z" />
    <Tron cx={-70} cy={-70} r={4} />
    <Tron cx={-40} cy={-90} r={4} />
    <Tron cx={-20} cy={-60} r={4} />
    {/* trứng ốp la */}
    <Bau cx={80} cy={-40} rx={56} ry={26} />
    <Tron cx={80} cy={-44} r={16} />
    {/* thìa */}
    <Gach x1={190} y1={-60} x2={250} y2={-160} />
    <Bau cx={180} cy={-44} rx={24} ry={16} />
  </Goc>
);

/** xe đẩy hàng rong: thùng xe có 2 bánh, tay đẩy trái, mái che răng cưa trên 2 cột, nồi bốc khói */
const XeDayHangRong: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    {/* cột + mái */}
    <Hop x={-200} y={-640} w={14} h={300} />
    <Hop x={186} y={-640} w={14} h={300} />
    <HopKhoi x0={-260} x1={260} yTren={-700} yDuoi={-650} sau={0.1} vp={[0, -1100]} />
    <Net to="none" d={'M -260 -650 ' + [-220, -180, -140, -100, -60, -20, 20, 60, 100, 140, 180, 220, 260].map((x) => `Q ${x - 20} -610 ${x} -650`).join(' ')} />
    {/* nồi + khói */}
    <Khoi cx={60} y={-470} h={100} cach={36} />
    <Bau cx={60} cy={-460} rx={80} ry={20} />
    <Net d="M -20 -460 L -10 -370 L 130 -370 L 140 -460 Z" />
    {/* thùng xe */}
    <HopKhoi x0={-220} x1={220} yTren={-370} yDuoi={-110} sau={0.12} />
    <Hop x={-190} y={-330} w={140} h={80} />
    <Gach x1={-170} y1={-290} x2={-110} y2={-290} />
    {/* tay đẩy */}
    <Net to="none" d="M -220 -300 L -320 -340 L -320 -420" />
    {/* bánh */}
    <Tron cx={-140} cy={-60} r={60} />
    <Tron cx={-140} cy={-60} r={18} />
    <Tron cx={140} cy={-60} r={60} />
    <Tron cx={140} cy={-60} r={18} />
  </Goc>
);

/** cốc bia có quai + bọt */
const CocBia: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`}>
    <Net to="none" d="M 36 -80 Q 70 -85 70 -55 Q 70 -25 36 -30" />
    <Hop x={-36} y={-100} w={72} h={100} rx={6} />
    <Net d="M -40 -100 Q -40 -130 -15 -125 Q 0 -150 20 -128 Q 44 -135 40 -100 Z" />
    <Gach x1={-20} y1={-80} x2={-20} y2={-20} />
  </g>
);

/** bàn nhậu: bàn thấp, 3 cốc bia bọt trào, đĩa mồi */
const BanNhau: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <BanHo x0={-260} x1={260} yMat={-280} day={40} />
    <CocBia x={-170} y={-286} />
    <CocBia x={-40} y={-286} />
    <CocBia x={170} y={-286} />
    <Bau cx={70} cy={-296} rx={70} ry={16} />
    <Tron cx={50} cy={-306} r={12} />
    <Tron cx={90} cy={-304} r={12} />
  </Goc>
);

/** tủ kính bánh: tủ đứng, phần kính trên có 2 tầng bánh, phần đế kín */
const TuKinhBanh: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <HopKhoi x0={-240} x1={240} yTren={-560} yDuoi={0} sau={0.12} />
    {/* đế kín */}
    <Hop x={-240} y={-160} w={480} h={160} />
    {/* kính + vệt sáng */}
    <Hop x={-216} y={-536} w={432} h={352} />
    <Gach x1={140} y1={-500} x2={200} y2={-440} />
    <Gach x1={170} y1={-520} x2={206} y2={-484} />
    {/* 2 tầng */}
    <Gach x1={-216} y1={-360} x2={216} y2={-360} />
    {/* bánh tầng trên: bánh kem tròn, bánh vuông */}
    <Net d="M -190 -400 Q -190 -450 -140 -450 Q -90 -450 -90 -400 Z" />
    <Hop x={-50} y={-430} w={90} h={40} rx={6} />
    <Net d="M 90 -400 L 100 -450 L 160 -450 L 170 -400 Z" />
    {/* bánh tầng dưới */}
    <Hop x={-190} y={-230} w={100} h={46} rx={20} />
    <Bau cx={20} cy={-208} rx={50} ry={24} />
    <Net d="M 100 -184 Q 100 -240 150 -240 Q 200 -240 200 -184 Z" />
  </Goc>
);

export const AN_UONG: Record<'bat-pho' | 'ly-cafe' | 'dia-com' | 'xe-day-hang-rong' | 'ban-nhau' | 'tu-kinh-banh', React.FC<PropProps>> = {
  'bat-pho': BatPho,
  'ly-cafe': LyCafe,
  'dia-com': DiaCom,
  'xe-day-hang-rong': XeDayHangRong,
  'ban-nhau': BanNhau,
  'tu-kinh-banh': TuKinhBanh,
};
