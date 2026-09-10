import React from 'react';
import {Bau, Gach, Goc, Hop, HopKhoi, Net, PropProps, Tron, daGiac} from './co-ban';

/**
 * Prop nhóm CÔNG NGHỆ. Cỡ thiết kế (co = 1, DAU = 330):
 *   may-tinh-ban 620x460 · tai-nghe 300x300 · may-anh 340x260 · robot-nho 300x480 · wifi 320x260
 */

/** máy tính bàn: màn hình trên đế, thùng máy đứng bên phải, bàn phím, chuột */
const MayTinhBan: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    {/* thùng máy */}
    <HopKhoi x0={180} x1={310} yTren={-460} yDuoi={0} sau={0.1} />
    <Hop x={200} y={-430} w={90} h={20} rx={4} />
    <Hop x={200} y={-390} w={90} h={12} rx={4} />
    <Tron cx={245} cy={-330} r={10} />
    {/* màn hình */}
    <Hop x={-200} y={-20} w={240} h={20} rx={8} />
    <Net d={daGiac([-110, -20], [-50, -20], [-60, -110], [-100, -110])} />
    <Hop x={-310} y={-420} w={460} h={310} rx={12} />
    <Hop x={-290} y={-400} w={420} h={260} />
    <Gach x1={-240} y1={-340} x2={-200} y2={-380} />
    <Gach x1={-226} y1={-310} x2={-166} y2={-370} />
    {/* bàn phím + chuột */}
    <Hop x={-300} y={-40} w={240} h={40} rx={6} />
    <Gach x1={-280} y1={-20} x2={-80} y2={-20} />
    <Bau cx={100} cy={-16} rx={30} ry={16} />
    <Gach x1={100} y1={-32} x2={100} y2={-16} />
  </Goc>
);

/** tai nghe chụp: vòng đầu cong, hai chụp tai bo, đệm */
const TaiNghe: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <Net to="none" d="M -120 -140 Q -120 -300 0 -300 Q 120 -300 120 -140" />
    <Net to="none" d="M -120 -140 Q -120 -270 0 -270 Q 120 -270 120 -140" />
    <Hop x={-150} y={-170} w={70} h={170} rx={26} />
    <Hop x={80} y={-170} w={70} h={170} rx={26} />
    <Hop x={-92} y={-150} w={16} h={130} rx={8} />
    <Hop x={76} y={-150} w={16} h={130} rx={8} />
  </Goc>
);

/** máy ảnh: thân bo, ống kính tròn hai vòng, cục đèn + nút chụp trên, dây đeo */
const MayAnh: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <Hop x={-60} y={-250} w={120} h={40} rx={8} />
    <Hop x={110} y={-236} w={40} h={26} rx={6} />
    <Hop x={-170} y={-210} w={340} h={210} rx={22} />
    <Tron cx={0} cy={-105} r={75} />
    <Tron cx={0} cy={-105} r={48} />
    <Tron cx={-20} cy={-125} r={10} />
    <Hop x={-140} y={-180} w={50} h={30} rx={6} />
    <Tron cx={130} cy={-160} r={12} />
    {/* dây */}
    <Net to="none" d="M -170 -150 Q -230 -150 -220 -60" />
  </Goc>
);

/** robot nhỏ: đầu hộp có ăng-ten, mắt tròn, thân hộp có nút, tay khớp, chân đế */
const RobotNho: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    {/* ăng-ten */}
    <Gach x1={0} y1={-440} x2={0} y2={-480} />
    <Tron cx={0} cy={-490} r={12} />
    {/* chân */}
    <Hop x={-70} y={-80} w={44} h={80} />
    <Hop x={26} y={-80} w={44} h={80} />
    <Hop x={-90} y={-24} w={80} h={24} rx={8} />
    <Hop x={10} y={-24} w={80} h={24} rx={8} />
    {/* tay */}
    <Gach x1={-110} y1={-300} x2={-160} y2={-230} />
    <Gach x1={-160} y1={-230} x2={-140} y2={-150} />
    <Tron cx={-138} cy={-140} r={16} />
    <Gach x1={110} y1={-300} x2={160} y2={-240} />
    <Gach x1={160} y1={-240} x2={190} y2={-290} />
    <Tron cx={196} cy={-300} r={16} />
    {/* thân */}
    <Hop x={-110} y={-320} w={220} h={240} rx={14} />
    <Hop x={-70} y={-280} w={140} h={80} rx={6} />
    <Tron cx={-30} cy={-160} r={12} />
    <Tron cx={30} cy={-160} r={12} />
    {/* cổ + đầu */}
    <Hop x={-20} y={-340} w={40} h={20} />
    <Hop x={-90} y={-440} w={180} h={100} rx={16} />
    <Tron cx={-40} cy={-395} r={20} />
    <Tron cx={40} cy={-395} r={20} />
    <Tron cx={-40} cy={-395} r={7} />
    <Tron cx={40} cy={-395} r={7} />
    <Gach x1={-30} y1={-360} x2={30} y2={-360} />
  </Goc>
);

/** biểu tượng wifi: chấm + 3 cung sóng, tâm đáy = chấm */
const Wifi: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <Tron cx={0} cy={-20} r={20} />
    <Net to="none" d="M -70 -90 Q 0 -150 70 -90" />
    <Net to="none" d="M -115 -150 Q 0 -250 115 -150" />
    <Net to="none" d="M -160 -210 Q 0 -350 160 -210" />
  </Goc>
);

export const CONG_NGHE: Record<'may-tinh-ban' | 'tai-nghe' | 'may-anh' | 'robot-nho' | 'wifi', React.FC<PropProps>> = {
  'may-tinh-ban': MayTinhBan,
  'tai-nghe': TaiNghe,
  'may-anh': MayAnh,
  'robot-nho': RobotNho,
  wifi: Wifi,
};
