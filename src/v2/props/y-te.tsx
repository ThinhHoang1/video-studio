import React from 'react';
import {Bau, Gach, Goc, Hop, Net, PropProps, Tron, daGiac} from './co-ban';

/**
 * Prop nhóm Y TẾ. Cỡ thiết kế (co = 1, DAU = 330):
 *   giuong-benh 760x900 · ong-nghe 240x400 · hop-thuoc 320x280 · xe-cuu-thuong 820x460
 */

/** giường bệnh nhìn ngang: đầu giường nâng, gối, chăn, khung có 4 bánh, cọc truyền dịch bên trái */
const GiuongBenh: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    {/* cọc truyền + bịch */}
    <Gach x1={-340} y1={-40} x2={-340} y2={-880} />
    <Gach x1={-380} y1={-880} x2={-300} y2={-880} />
    <Net d="M -400 -860 L -360 -860 L -360 -760 Q -380 -740 -400 -760 Z" />
    <Gach x1={-380} y1={-760} x2={-380} y2={-600} />
    <Net to="none" d="M -380 -600 Q -380 -560 -330 -560 L -260 -560" />
    <Gach x1={-380} y1={-40} x2={-300} y2={-40} />
    <Tron cx={-380} cy={-20} r={16} />
    <Tron cx={-300} cy={-20} r={16} />
    {/* khung giường */}
    <Hop x={-240} y={-330} w={22} h={330} />
    <Hop x={-240} y={-460} w={22} h={130} />
    <Hop x={340} y={-360} w={22} h={360} />
    <Hop x={-250} y={-500} w={40} h={40} rx={8} />
    <Hop x={330} y={-400} w={40} h={40} rx={8} />
    {/* bánh */}
    <Tron cx={-200} cy={-20} r={20} />
    <Tron cx={320} cy={-20} r={20} />
    <Gach x1={-200} y1={-60} x2={-200} y2={-40} />
    <Gach x1={320} y1={-60} x2={320} y2={-40} />
    <Hop x={-220} y={-80} w={540} h={20} />
    {/* nệm + đầu nâng */}
    <Net d={daGiac([-220, -300], [-120, -460], [10, -460], [10, -300])} />
    <Hop x={-220} y={-300} w={560} h={50} />
    <Hop x={-220} y={-250} w={560} h={20} />
    <Hop x={-200} y={-230} w={16} h={100} />
    <Hop x={304} y={-230} w={16} h={100} />
    {/* gối + chăn */}
    <Net d={daGiac([-120, -440], [-20, -440], [0, -360], [-140, -360])} />
    <Net d="M 20 -360 L 340 -360 L 340 -300 L 20 -300 Z" />
    <Gach x1={60} y1={-330} x2={300} y2={-330} />
  </Goc>
);

/** ống nghe: hai càng tai chữ Y, ống mềm, mặt nghe tròn ở đáy */
const OngNghe: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <Net to="none" d="M -90 -400 Q -110 -330 -60 -260 Q -20 -220 0 -160" />
    <Net to="none" d="M 90 -400 Q 110 -330 60 -260 Q 20 -220 0 -160" />
    <Tron cx={-90} cy={-400} r={12} />
    <Tron cx={90} cy={-400} r={12} />
    <Net to="none" d="M 0 -160 Q 60 -140 60 -90 Q 60 -50 20 -50" />
    <Tron cx={0} cy={-50} r={50} />
    <Tron cx={0} cy={-50} r={30} />
  </Goc>
);

/** hộp thuốc cứu thương: hộp bo có tay cầm, dấu cộng viền, chốt */
const HopThuoc: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <Net to="none" d="M -50 -240 L -50 -270 Q -50 -290 -30 -290 L 30 -290 Q 50 -290 50 -270 L 50 -240" />
    <Hop x={-160} y={-240} w={320} h={240} rx={20} />
    <Gach x1={-160} y1={-190} x2={160} y2={-190} />
    <Hop x={-16} y={-200} w={32} h={20} rx={4} />
    <Net d="M -20 -160 L 20 -160 L 20 -120 L 60 -120 L 60 -80 L 20 -80 L 20 -40 L -20 -40 L -20 -80 L -60 -80 L -60 -120 L -20 -120 Z" />
  </Goc>
);

/** xe cứu thương nhìn ngang, đầu bên phải: thùng cao, ca-bin, đèn xoay, dấu cộng, bánh */
const XeCuuThuong: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    {/* đèn xoay + tia */}
    <Hop x={-60} y={-440} w={120} h={30} rx={8} />
    <Gach x1={-110} y1={-460} x2={-140} y2={-480} />
    <Gach x1={110} y1={-460} x2={140} y2={-480} />
    <Gach x1={0} y1={-480} x2={0} y2={-510} />
    {/* thùng + ca-bin */}
    <Net d="M -400 -80 L -400 -400 Q -400 -410 -390 -410 L 160 -410 L 240 -260 L 400 -240 Q 410 -230 410 -200 L 410 -80 Z" />
    <Net d={daGiac([180, -390], [240, -275], [370, -255], [340, -390])} />
    <Gach x1={240} y1={-260} x2={240} y2={-90} />
    <Hop x={260} y={-240} w={44} h={12} rx={6} />
    {/* cửa sau + dấu cộng */}
    <Hop x={-380} y={-380} w={140} h={110} />
    <Net d="M -110 -350 L -50 -350 L -50 -290 L 10 -290 L 10 -230 L -50 -230 L -50 -170 L -110 -170 L -110 -230 L -170 -230 L -170 -290 L -110 -290 Z" />
    {/* đèn trước */}
    <Hop x={380} y={-190} w={30} h={30} rx={6} />
    {/* bánh */}
    <Tron cx={-250} cy={-80} r={80} />
    <Tron cx={-250} cy={-80} r={30} />
    <Tron cx={270} cy={-80} r={80} />
    <Tron cx={270} cy={-80} r={30} />
  </Goc>
);

export const Y_TE: Record<'giuong-benh' | 'ong-nghe' | 'hop-thuoc' | 'xe-cuu-thuong', React.FC<PropProps>> = {
  'giuong-benh': GiuongBenh,
  'ong-nghe': OngNghe,
  'hop-thuoc': HopThuoc,
  'xe-cuu-thuong': XeCuuThuong,
};
