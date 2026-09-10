import React from 'react';
import {BanHo, Bau, Gach, Goc, Hop, HopKhoi, Net, PropProps, Tron, daGiac} from './co-ban';

/**
 * Prop nhóm CÔNG SỞ. Cỡ thiết kế (co = 1, DAU = 330):
 *   ban-lam-viec 560x560 · ghe-xoay 260x560 · tu-ho-so 320x600 · may-in 420x330
 *   bang-trang 660x760 · the-nhan-vien 240x540 · thang-may 520x860
 */

/** ghế xoay: đế 5 chân có bánh, trụ, mặt ngồi, lưng bo cao, hai tay vịn */
const GheXoay: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    {/* chân đế: 3 chân thấy được + bánh */}
    <Gach x1={0} y1={-60} x2={-110} y2={-14} />
    <Gach x1={0} y1={-60} x2={110} y2={-14} />
    <Gach x1={0} y1={-60} x2={0} y2={-10} />
    <Tron cx={-110} cy={-12} r={12} />
    <Tron cx={110} cy={-12} r={12} />
    <Tron cx={0} cy={-10} r={12} />
    {/* trụ */}
    <Hop x={-14} y={-240} w={28} h={180} />
    {/* lưng */}
    <Hop x={-80} y={-560} w={160} h={300} rx={30} />
    {/* tay vịn */}
    <Net to="none" d="M -120 -280 L -120 -330 L -80 -330" />
    <Net to="none" d="M 120 -280 L 120 -330 L 80 -330" />
    {/* mặt ngồi */}
    <Hop x={-120} y={-280} w={240} h={40} rx={14} />
  </Goc>
);

/** bàn làm việc: ghế xoay nhô sau bàn, màn hình + bàn phím trên bàn */
const BanLamViec: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    {/* lưng ghế xoay phía sau bàn (bị bàn che phần dưới) */}
    <Hop x={-110} y={-560} w={160} h={300} rx={30} />
    <Hop x={-44} y={-300} w={28} h={40} />
    <BanHo x0={-280} x1={280} yMat={-300} day={40} />
    {/* màn hình */}
    <Hop x={-90} y={-330} w={180} h={16} rx={6} />
    <Hop x={-16} y={-360} w={32} h={30} />
    <Hop x={-140} y={-540} w={280} h={180} rx={10} />
    <Hop x={-124} y={-524} w={248} h={148} />
    {/* bàn phím + chuột */}
    <Hop x={-250} y={-322} w={130} h={22} rx={4} />
    <Bau cx={200} cy={-312} rx={20} ry={12} />
  </Goc>
);

/** tủ hồ sơ 3 ngăn kéo, mỗi ngăn có tay nắm + nhãn */
const TuHoSo: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <HopKhoi x0={-160} x1={160} yTren={-600} yDuoi={0} sau={0.12} />
    {[0, 1, 2].map((i) => {
      const y = -570 + i * 190;
      return (
        <React.Fragment key={i}>
          <Hop x={-140} y={y} w={280} h={170} />
          <Hop x={-40} y={y + 30} w={80} h={30} rx={4} />
          <Hop x={-30} y={y + 90} w={60} h={16} rx={8} />
        </React.Fragment>
      );
    })}
  </Goc>
);

/** máy in: thân hộp, tờ giấy dựng phía sau, tờ in ra phía trước, nút bấm */
const MayIn: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    {/* giấy nạp sau */}
    <Net d={daGiac([-120, -200], [120, -200], [130, -330], [-110, -330])} />
    <Gach x1={-80} y1={-280} x2={90} y2={-280} />
    <Gach x1={-80} y1={-250} x2={60} y2={-250} />
    {/* thân */}
    <HopKhoi x0={-210} x1={210} yTren={-200} yDuoi={-60} sau={0.15} />
    <Hop x={-180} y={-60} w={360} h={60} />
    {/* khe ra giấy + tờ giấy in */}
    <Hop x={-150} y={-100} w={300} h={12} />
    <Net d="M -140 -88 L 140 -88 L 150 -10 L -150 -10 Z" />
    <Gach x1={-100} y1={-60} x2={100} y2={-60} />
    <Gach x1={-100} y1={-36} x2={40} y2={-36} />
    {/* nút */}
    <Tron cx={160} cy={-150} r={12} />
    <Hop x={-170} y={-160} w={80} h={20} rx={4} />
  </Goc>
);

/** bảng trắng đứng trên giá chữ A, có bút và khay, vài nét viết + vòng tròn */
const BangTrang: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    {/* giá chữ A */}
    <Gach x1={-250} y1={-300} x2={-310} y2={0} />
    <Gach x1={250} y1={-300} x2={310} y2={0} />
    <Gach x1={-250} y1={-300} x2={-190} y2={0} />
    <Gach x1={250} y1={-300} x2={190} y2={0} />
    <Gach x1={-270} y1={-150} x2={-220} y2={-150} />
    <Gach x1={270} y1={-150} x2={220} y2={-150} />
    {/* bảng */}
    <Hop x={-330} y={-760} w={660} h={440} rx={10} />
    <Hop x={-306} y={-736} w={612} h={392} />
    {/* nét viết */}
    <Gach x1={-260} y1={-680} x2={-60} y2={-680} />
    <Gach x1={-260} y1={-620} x2={-140} y2={-620} />
    <Gach x1={-260} y1={-560} x2={-100} y2={-560} />
    <Tron cx={150} cy={-560} r={90} />
    <Net to="none" d="M 90 -520 L 130 -560 L 220 -640" />
    {/* khay + bút */}
    <Hop x={-200} y={-320} w={400} h={14} />
    <Hop x={-120} y={-336} w={100} h={12} rx={6} />
  </Goc>
);

/** thẻ nhân viên: dây đeo chữ V, kẹp, thẻ có ảnh (đầu + vai) và 2 dòng chữ */
const TheNhanVien: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    {/* dây */}
    <Gach x1={-40} y1={-540} x2={-8} y2={-360} />
    <Gach x1={40} y1={-540} x2={8} y2={-360} />
    <Gach x1={-40} y1={-540} x2={-70} y2={-540} />
    <Gach x1={40} y1={-540} x2={70} y2={-540} />
    {/* móc + kẹp */}
    <Tron cx={0} cy={-352} r={12} />
    <Hop x={-22} y={-340} w={44} h={40} rx={8} />
    {/* thẻ */}
    <Hop x={-120} y={-300} w={240} h={300} rx={16} />
    <Hop x={-30} y={-290} w={60} h={14} rx={7} />
    {/* ảnh */}
    <Hop x={-90} y={-250} w={100} h={110} />
    <Tron cx={-40} cy={-205} r={22} />
    <Net d="M -80 -140 Q -40 -190 0 -140 Z" />
    {/* chữ */}
    <Gach x1={30} y1={-230} x2={95} y2={-230} />
    <Gach x1={30} y1={-195} x2={80} y2={-195} />
    <Gach x1={-90} y1={-90} x2={90} y2={-90} />
    <Gach x1={-90} y1={-55} x2={40} y2={-55} />
  </Goc>
);

/** cửa thang máy: khung, hai cánh khép, bảng số tầng mũi tên lên, nút gọi bên phải */
const ThangMay: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    {/* bảng tầng */}
    <Hop x={-70} y={-860} w={140} h={60} rx={8} />
    <Net to="none" d="M -30 -820 L -10 -845 L 10 -820" />
    <Gach x1={20} y1={-846} x2={40} y2={-814} />
    <Gach x1={40} y1={-846} x2={20} y2={-814} />
    <Gach x1={20} y1={-830} x2={40} y2={-830} />
    {/* khung */}
    <Hop x={-240} y={-780} w={480} h={780} />
    <Hop x={-210} y={-750} w={420} h={750} />
    {/* hai cánh */}
    <Hop x={-200} y={-740} w={200} h={740} />
    <Hop x={0} y={-740} w={200} h={740} />
    <Gach x1={-160} y1={-700} x2={-160} y2={-40} />
    <Gach x1={160} y1={-700} x2={160} y2={-40} />
    {/* bảng nút gọi */}
    <Hop x={244} y={-520} w={40} h={100} rx={6} />
    <Tron cx={264} cy={-495} r={9} />
    <Tron cx={264} cy={-445} r={9} />
  </Goc>
);

export const CONG_SO: Record<'ban-lam-viec' | 'ghe-xoay' | 'tu-ho-so' | 'may-in' | 'bang-trang' | 'the-nhan-vien' | 'thang-may', React.FC<PropProps>> = {
  'ban-lam-viec': BanLamViec,
  'ghe-xoay': GheXoay,
  'tu-ho-so': TuHoSo,
  'may-in': MayIn,
  'bang-trang': BangTrang,
  'the-nhan-vien': TheNhanVien,
  'thang-may': ThangMay,
};
