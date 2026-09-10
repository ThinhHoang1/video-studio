import React from 'react';
import {Bau, Gach, Goc, Hop, Net, PropProps, Tron, daGiac} from './co-ban';

/**
 * Prop nhóm ĐỒ VẬT (cầm tay, để bàn). Cỡ thiết kế (co = 1, nhân vật DAU = 330):
 *   sach 300x220 · la-thu 260x170 · but 140x250 · dien-thoai 130x260 · laptop 400x300
 *   dong-ho 250x250 · ly-tra-sua 160x330 · ban-cafe 380x360 · ao-mua 500x470 · may-bay-giay 440x100
 *   man-hinh-chat 520x900
 */

/** sách mở: hai trang cong, gáy giữa, dòng chữ nghiêng theo trang */
const Sach: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    {/* bìa dưới */}
    <Net d="M -150 -50 L -150 -30 L 0 0 L 150 -30 L 150 -50 L 0 -20 Z" />
    {/* trang trái, trang phải */}
    <Net d="M 0 -20 L -150 -50 L -150 -180 Q -80 -200 0 -150 Z" />
    <Net d="M 0 -20 L 150 -50 L 150 -180 Q 80 -200 0 -150 Z" />
    {[0, 1, 2].map((i) => (
      <React.Fragment key={i}>
        <Gach x1={-125} y1={-140 + i * 30} x2={-30} y2={-118 + i * 30} />
        <Gach x1={30} y1={-118 + i * 30} x2={125} y2={-140 + i * 30} />
      </React.Fragment>
    ))}
  </Goc>
);

/** phong bì có nắp chữ V */
const LaThu: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <Hop x={-130} y={-170} w={260} h={170} />
    <Net to="none" d="M -130 -170 L 0 -70 L 130 -170" />
    <Net to="none" d="M -130 0 L -40 -95 M 130 0 L 40 -95" />
  </Goc>
);

/** bút bi nghiêng 30 độ, đầu bút chạm đáy */
const But: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <g transform="rotate(30)">
      <Net d="M -12 -240 L 12 -240 L 12 -52 L 0 0 L -12 -52 Z" />
      <Gach x1={-12} y1={-64} x2={12} y2={-64} />
      <Gach x1={-12} y1={-200} x2={12} y2={-200} />
      <Hop x={12} y={-232} w={10} h={90} rx={5} />
      <Hop x={-8} y={-256} w={16} h={16} rx={4} />
    </g>
  </Goc>
);

/** điện thoại: màn hình, loa, nút home */
const DienThoai: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <Hop x={-65} y={-260} w={130} h={260} rx={18} />
    <Hop x={-54} y={-228} w={108} h={186} rx={4} />
    <Gach x1={-16} y1={-244} x2={16} y2={-244} />
    <Tron cx={0} cy={-21} r={9} />
  </Goc>
);

/** laptop mở: đế phối cảnh + màn hình hơi ngả */
const Laptop: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    {/* màn hình */}
    <Net d={daGiac([-180, -56], [180, -56], [170, -300], [-170, -300])} />
    <Net d={daGiac([-164, -72], [164, -72], [156, -286], [-156, -286])} />
    <Tron cx={0} cy={-294} r={3} />
    {/* đế: mặt trên hình thang + cạnh trước */}
    <Net d={daGiac([-200, -16], [200, -16], [180, -56], [-180, -56])} />
    <Hop x={-200} y={-16} w={400} h={16} />
    {/* phím: 3 hàng gạch; bàn di */}
    {[0, 1, 2].map((r) => {
      const y = -48 + r * 9;
      const k = 1 - r * 0.02;
      return <Gach key={r} x1={-150 * k - r * 3} y1={y} x2={150 * k + r * 3} y2={y} />;
    })}
    <Hop x={-40} y={-30} w={80} h={10} rx={2} />
  </Goc>
);

/** đồng hồ tường: vành, 12 vạch, hai kim */
const DongHo: React.FC<PropProps> = (p) => {
  const cx = 0;
  const cy = -125;
  const R = 125;
  return (
    <Goc {...p}>
      <Tron cx={cx} cy={cy} r={R} />
      <Tron cx={cx} cy={cy} r={R - 16} />
      {Array.from({length: 12}, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const r0 = i % 3 === 0 ? 82 : 92;
        return <Gach key={i} x1={cx + Math.sin(a) * r0} y1={cy - Math.cos(a) * r0} x2={cx + Math.sin(a) * 102} y2={cy - Math.cos(a) * 102} />;
      })}
      {/* kim giờ 10h, kim phút 2h */}
      <Net d="M -6 -125 L 0 -119 L 6 -125 L -34 -185 Z" />
      <Net d="M -6 -125 L 0 -131 L 6 -125 L 44 -50 Z" />
      <Tron cx={cx} cy={cy} r={7} />
    </Goc>
  );
};

/** ly trà sữa: cốc thuôn, nắp vòm, ống hút, trân châu */
const LyTraSua: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    {/* ống hút */}
    <Net d={daGiac([6, -250], [22, -250], [54, -335], [38, -338])} />
    {/* cốc */}
    <Net d="M -55 -220 L 55 -220 L 44 -14 Q 44 0 30 0 L -30 0 Q -44 0 -44 -14 Z" />
    {/* mực trà */}
    <Net to="none" d="M -50 -130 q 25 -10 50 0 t 50 0" />
    {/* trân châu */}
    {[
      [-24, -24],
      [0, -20],
      [24, -24],
      [-12, -46],
      [12, -46],
      [-30, -50],
      [30, -50],
    ].map(([x, y], i) => (
      <Tron key={i} cx={x} cy={y} r={9} />
    ))}
    {/* nắp */}
    <Hop x={-62} y={-232} w={124} h={14} rx={4} />
    <Net d="M -58 -232 Q 0 -290 58 -232 Z" />
    <Net to="none" d="M 6 -262 L 20 -262" />
  </Goc>
);

/** bàn tròn cà phê một chân + hai tách có khói */
const BanCafe: React.FC<PropProps> = (p) => {
  const Tach: React.FC<{x: number}> = ({x}) => (
    <>
      <Bau cx={x} cy={-262} rx={46} ry={9} />
      <Net d={`M ${x - 30} -300 L ${x + 30} -300 L ${x + 24} -262 L ${x - 24} -262 Z`} />
      <Net to="none" d={`M ${x + 30} -294 q 20 0 18 16 q -2 12 -22 12`} />
      <Net to="none" d={`M ${x - 8} -316 q -10 -14 0 -28 q 10 -14 0 -28`} />
      <Net to="none" d={`M ${x + 10} -316 q -10 -14 0 -28 q 10 -14 0 -28`} />
    </>
  );
  return (
    <Goc {...p}>
      {/* đế và chân */}
      <Bau cx={0} cy={-12} rx={95} ry={14} />
      <Hop x={-14} y={-244} w={28} h={232} />
      {/* mặt bàn: vành dày */}
      <Net d="M -190 -262 A 190 40 0 0 0 190 -262 L 190 -244 A 190 40 0 0 1 -190 -244 Z" />
      <Bau cx={0} cy={-262} rx={190} ry={40} />
      <Tach x={-80} />
      <Tach x={80} />
    </Goc>
  );
};

/** áo mưa mỏng có mũ, thân xoè, HAI ỐNG TAY xoè ra hai bên (khỏi giống lều), vạt lượn sóng, giọt nước rơi */
const AoMua: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    {/* thân */}
    <Net d="M -60 -380 L -170 -60 Q -160 -44 -140 -60 Q -120 -44 -100 -60 Q -80 -44 -60 -60 Q -40 -44 -20 -60 Q 0 -44 20 -60 Q 40 -44 60 -60 Q 80 -44 100 -60 Q 120 -44 140 -60 Q 160 -44 170 -60 L 60 -380 Z" />
    {/* hai ống tay, cổ tay bo tròn */}
    <Net d="M -72 -350 L -232 -246 Q -248 -232 -234 -212 L -206 -194 L -86 -286 Z" />
    <Net d="M 72 -350 L 232 -246 Q 248 -232 234 -212 L 206 -194 L 86 -286 Z" />
    <Net to="none" d="M -222 -232 L -196 -214 M 222 -232 L 196 -214" />
    {/* mũ */}
    <Net d="M -60 -380 Q -68 -470 0 -470 Q 68 -470 60 -380 Z" />
    <Net d="M -34 -384 Q -38 -436 0 -436 Q 38 -436 34 -384 Z" />
    {/* khoá kéo */}
    <Gach x1={0} y1={-380} x2={0} y2={-62} />
    {/* giọt nước */}
    <Net d="M -120 -30 q -10 12 0 20 q 10 -8 0 -20 z" />
    <Net d="M 40 -20 q -10 12 0 20 q 10 -8 0 -20 z" />
    <Net d="M 130 -34 q -10 12 0 20 q 10 -8 0 -20 z" />
  </Goc>
);

/** máy bay giấy bay sang phải: cánh xa mỏng, THÂN DÀY chạm đáy, 2 nếp gấp, 3 vạch gió */
const MayBayGiay: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    {/* cánh xa */}
    <Net d={daGiac([170, -100], [-170, -28], [-56, -70])} />
    {/* thân gần, dày */}
    <Net d={daGiac([170, -100], [-56, -70], [-104, 0])} />
    {/* nếp gấp: sống thân + nếp cánh */}
    <Gach x1={170} y1={-100} x2={-40} y2={-30} />
    <Gach x1={100} y1={-86} x2={-120} y2={-44} />
    {/* vạch gió */}
    <Gach x1={-190} y1={-72} x2={-244} y2={-76} />
    <Gach x1={-182} y1={-22} x2={-232} y2={-18} />
    <Gach x1={-206} y1={-48} x2={-266} y2={-48} />
  </Goc>
);

/** màn hình chat: khung điện thoại to, 3 bóng chat trống (trái, phải, trái), ô nhập + nút gửi */
const ManHinhChat: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <Hop x={-260} y={-900} w={520} h={900} rx={60} />
    <Hop x={-232} y={-840} w={464} h={780} rx={10} />
    <Gach x1={-40} y1={-870} x2={40} y2={-870} />
    {/* bóng trái */}
    <Net d="M -180 -770 L -20 -770 Q 0 -770 0 -750 L 0 -680 Q 0 -660 -20 -660 L -166 -660 L -206 -634 L -194 -660 Q -200 -664 -200 -680 L -200 -750 Q -200 -770 -180 -770 Z" />
    {/* bóng phải */}
    <Net d="M 30 -620 L 180 -620 Q 200 -620 200 -600 L 200 -530 Q 200 -510 194 -510 L 206 -484 L 166 -510 L 30 -510 Q 10 -510 10 -530 L 10 -600 Q 10 -620 30 -620 Z" />
    {/* bóng trái ngắn */}
    <Net d="M -180 -470 L -60 -470 Q -40 -470 -40 -450 L -40 -400 Q -40 -380 -60 -380 L -166 -380 L -206 -354 L -194 -380 Q -200 -384 -200 -400 L -200 -450 Q -200 -470 -180 -470 Z" />
    {/* ô nhập + nút gửi */}
    <Hop x={-210} y={-160} w={330} h={70} rx={35} />
    <Tron cx={170} cy={-125} r={35} />
    <Net to="none" d="M 154 -125 L 186 -125 M 172 -139 L 186 -125 L 172 -111" />
  </Goc>
);

export const DO_VAT: Record<'sach' | 'la-thu' | 'but' | 'dien-thoai' | 'laptop' | 'dong-ho' | 'ly-tra-sua' | 'ban-cafe' | 'ao-mua' | 'may-bay-giay' | 'man-hinh-chat', React.FC<PropProps>> = {
  sach: Sach,
  'la-thu': LaThu,
  but: But,
  'dien-thoai': DienThoai,
  laptop: Laptop,
  'dong-ho': DongHo,
  'ly-tra-sua': LyTraSua,
  'ban-cafe': BanCafe,
  'ao-mua': AoMua,
  'may-bay-giay': MayBayGiay,
  'man-hinh-chat': ManHinhChat,
};
