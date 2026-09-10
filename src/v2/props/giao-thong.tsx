import React from 'react';
import {Bau, Gach, Goc, Hop, Net, PropProps, Tron, daGiac} from './co-ban';
import {ChuNhan} from './nhan';

/**
 * Prop nhóm GIAO THÔNG. Cỡ thiết kế (co = 1, DAU = 330):
 *   xe-may 560x490 · o-to 780x340 · may-bay 820x400 · tau-hoa 700x520
 *   den-giao-thong 200x620 · bien-bao 320x760
 */

/** xe máy tay ga (scooter) nhìn ngang, đầu bên phải: đuôi tròn, yên, sàn để chân thấp, yếm trước cao, tay lái + gương, đèn */
const XeMay: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    {/* tay lái + gương */}
    <Gach x1={190} y1={-370} x2={190} y2={-420} />
    <Gach x1={140} y1={-420} x2={250} y2={-420} />
    <Gach x1={240} y1={-420} x2={262} y2={-462} />
    <Bau cx={268} cy={-474} rx={18} ry={12} />
    {/* đuôi xe + cốp */}
    <Net d="M -260 -160 L -260 -250 Q -260 -300 -210 -300 L -40 -300 L 30 -160 Z" />
    {/* yên */}
    <Net d="M -250 -300 Q -250 -345 -205 -345 L -40 -345 Q -20 -345 -20 -325 L -20 -300 Z" />
    {/* sàn để chân */}
    <Hop x={-40} y={-160} w={180} h={24} />
    {/* yếm trước (rộng, ngả về sau) */}
    <Net d="M 110 -136 L 110 -300 Q 120 -370 190 -370 L 240 -370 L 262 -230 Q 262 -170 230 -136 Z" />
    {/* đèn pha */}
    <Bau cx={246} cy={-320} rx={20} ry={30} />
    {/* chắn bùn trước */}
    <Net to="none" d="M 100 -150 Q 180 -215 260 -150" />
    {/* bánh */}
    <Tron cx={-170} cy={-80} r={80} />
    <Tron cx={-170} cy={-80} r={30} />
    <Tron cx={180} cy={-80} r={80} />
    <Tron cx={180} cy={-80} r={30} />
  </Goc>
);

/** ô tô nhìn ngang, đầu bên phải: thân dưới, ca-bin trên, 2 cửa sổ, cửa, bánh, đèn */
const OTo: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <Net d="M -390 -80 L -390 -180 L -280 -200 L -200 -320 L 120 -320 L 260 -200 L 380 -180 Q 390 -170 390 -140 L 390 -80 Z" />
    {/* cửa sổ */}
    <Net d={daGiac([-180, -300], [-40, -300], [-40, -200], [-250, -200])} />
    <Net d={daGiac([-10, -300], [110, -300], [230, -200], [-10, -200])} />
    {/* cửa + tay nắm */}
    <Gach x1={-40} y1={-200} x2={-40} y2={-90} />
    <Hop x={-20} y={-180} w={44} h={12} rx={6} />
    {/* đèn */}
    <Hop x={350} y={-170} w={40} h={30} rx={6} />
    <Hop x={-390} y={-170} w={30} h={30} rx={6} />
    {/* bánh */}
    <Tron cx={-230} cy={-80} r={80} />
    <Tron cx={-230} cy={-80} r={32} />
    <Tron cx={230} cy={-80} r={80} />
    <Tron cx={230} cy={-80} r={32} />
  </Goc>
);

/** máy bay chở khách nhìn ngang, mũi bên phải: thân dài, đuôi đứng trái, cánh về phía người xem, hàng cửa sổ, động cơ */
const MayBay: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    {/* đuôi đứng + đuôi ngang */}
    <Net d="M -300 -240 L -220 -400 L -140 -400 L -220 -240 Z" />
    <Net d="M -330 -220 L -270 -270 L -180 -270 L -230 -220 Z" />
    {/* thân */}
    <Net d="M -340 -220 L -300 -300 L 200 -300 Q 340 -300 410 -240 Q 380 -170 260 -170 L -300 -170 Q -340 -180 -340 -220 Z" />
    {/* kính lái */}
    <Net d="M 260 -290 L 330 -290 Q 360 -280 370 -250 L 260 -250 Z" />
    {/* cửa sổ */}
    {[-200, -140, -80, -20, 40, 100, 160].map((x) => (
      <Tron key={x} cx={x} cy={-260} r={11} />
    ))}
    {/* cánh về phía người xem + động cơ */}
    <Net d={daGiac([40, -200], [-80, -200], [-260, -40], [-120, -40])} />
    <Hop x={-150} y={-110} w={110} h={50} rx={22} />
    <Bau cx={-150} cy={-85} rx={12} ry={25} />
    {/* càng */}
    <Gach x1={-40} y1={-40} x2={-40} y2={-10} />
    <Tron cx={-40} cy={-6} r={12} />
    <Gach x1={300} y1={-170} x2={300} y2={-10} />
    <Tron cx={300} cy={-6} r={12} />
  </Goc>
);

/** đầu tàu hoả hơi nước nhìn ngang, đầu bên phải: ca-bin, nồi hơi, ống khói khói bay, 3 bánh, cản trước */
const TauHoa: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    {/* khói */}
    <Net to="none" d="M 150 -480 Q 130 -520 160 -540 Q 150 -580 190 -590" />
    <Net to="none" d="M 190 -480 Q 210 -520 190 -550 Q 220 -580 230 -600" />
    {/* ống khói */}
    <Net d="M 140 -420 L 140 -480 L 120 -500 L 220 -500 L 200 -480 L 200 -420 Z" />
    {/* ca-bin */}
    <Hop x={-320} y={-520} w={220} h={380} rx={10} />
    <Hop x={-340} y={-540} w={260} h={30} rx={8} />
    <Hop x={-280} y={-480} w={140} h={120} />
    {/* nồi hơi */}
    <Net d="M -100 -420 L 260 -420 Q 300 -420 300 -380 L 300 -140 L -100 -140 Z" />
    <Gach x1={0} y1={-420} x2={0} y2={-140} />
    <Gach x1={140} y1={-420} x2={140} y2={-140} />
    <Tron cx={300} cy={-330} r={30} />
    {/* sàn + cản trước */}
    <Hop x={-340} y={-140} w={660} h={30} />
    <Net d="M 320 -110 L 320 -30 L 380 0 L 320 0 Z" />
    <Gach x1={340} y1={-90} x2={340} y2={-10} />
    <Gach x1={360} y1={-60} x2={360} y2={-10} />
    {/* bánh + thanh truyền */}
    <Tron cx={-220} cy={-70} r={70} />
    <Tron cx={-220} cy={-70} r={22} />
    <Tron cx={-40} cy={-70} r={70} />
    <Tron cx={-40} cy={-70} r={22} />
    <Tron cx={160} cy={-70} r={70} />
    <Tron cx={160} cy={-70} r={22} />
    <Gach x1={-220} y1={-70} x2={160} y2={-70} />
  </Goc>
);

/** đèn giao thông: trụ, hộp 3 bóng có mái che, đế */
const DenGiaoThong: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <Hop x={-40} y={-30} w={80} h={30} rx={6} />
    <Hop x={-14} y={-300} w={28} h={270} />
    <Hop x={-70} y={-620} w={140} h={320} rx={20} />
    {[-540, -460, -380].map((y, i) => (
      <React.Fragment key={y}>
        <Net d={`M -80 ${y - 46} L 80 ${y - 46} L 60 ${y - 30} L -60 ${y - 30} Z`} />
        <Tron cx={0} cy={y} r={38} to={i === 0 ? '#f81000' : undefined} />
      </React.Fragment>
    ))}
  </Goc>
);

/** biển báo tròn trên cột, chữ tuỳ `chu` (mặc định trống) */
const BienBao: React.FC<PropProps> = ({chu = '', ...p}) => (
  <Goc {...p}>
    <Hop x={-16} y={-460} w={32} h={460} />
    <Tron cx={0} cy={-600} r={160} />
    <Tron cx={0} cy={-600} r={130} />
    {chu && <ChuNhan chu={chu} x={0} y={-600} rong={210} nhan={chu.length <= 3 ? 2.2 : 1} />}
  </Goc>
);

export const GIAO_THONG: Record<'xe-may' | 'o-to' | 'may-bay' | 'tau-hoa' | 'den-giao-thong' | 'bien-bao', React.FC<PropProps>> = {
  'xe-may': XeMay,
  'o-to': OTo,
  'may-bay': MayBay,
  'tau-hoa': TauHoa,
  'den-giao-thong': DenGiaoThong,
  'bien-bao': BienBao,
};
