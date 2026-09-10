import React from 'react';
import {BanHo, Bau, DIEM_TU, Gach, Goc, Hop, HopKhoi, Net, PropProps, Tron, daGiac, lui} from './co-ban';

/**
 * Prop nhóm TRƯỜNG HỌC. Cỡ thiết kế (co = 1, nhân vật DAU = 330):
 *   ban-hoc 430x380 · ban-giao-vien 480x330 · bang-den 624x400 · day-ban-lop 560x400
 *   day-ban-sau 600x470 · cua 320x880 · cua-so 420x400 · cong-truong 760x900
 *   ban-phong-van 720x420 · bang-tin 600x580
 */

/** bàn học sinh có ghế liền: bàn hở + ghế tựa bên phải nối bằng thanh ngang */
const BanHoc: React.FC<PropProps> = (p) => {
  const vp = DIEM_TU;
  // ghế: mặt ngồi lùi về điểm tụ, tựa lưng dựng ở mép sau
  const seat0 = 150;
  const seat1 = 230;
  const ySeat = -210;
  const sa = lui([seat0, ySeat], 0.15, vp);
  const sb = lui([seat1, ySeat], 0.15, vp);
  return (
    <Goc {...p}>
      {/* tựa lưng */}
      <Net d={daGiac([sa[0] + 2, sa[1]], [sb[0] + 4, sb[1]], [sb[0] + 10, sb[1] - 110], [sa[0] + 8, sa[1] - 110])} />
      {/* chân ghế */}
      <Hop x={seat0 + 4} y={ySeat} w={14} h={-ySeat} />
      <Hop x={seat1 - 18} y={ySeat} w={14} h={-ySeat} />
      {/* mặt ngồi */}
      <Net d={daGiac([seat0, ySeat], [seat1, ySeat], sb, sa)} />
      <Hop x={seat0} y={ySeat} w={seat1 - seat0} h={16} />
      {/* thanh nối bàn - ghế */}
      <Gach x1={112} y1={-120} x2={seat0 + 8} y2={-120} />
      {/* bàn */}
      <BanHo x0={-200} x1={120} yMat={-290} day={50} />
    </Goc>
  );
};

/** bàn giáo viên: hộp kín tới sàn, hai hộc kéo, cốc bút */
const BanGiaoVien: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <HopKhoi x0={-240} x1={240} yTren={-300} yDuoi={0} sau={0.15} />
    {/* hộc kéo */}
    <Hop x={-210} y={-270} w={170} h={80} />
    <Gach x1={-150} y1={-230} x2={-100} y2={-230} />
    <Hop x={40} y={-270} w={170} h={80} />
    <Gach x1={100} y1={-230} x2={150} y2={-230} />
    {/* khoảng hở để chân dưới hộc */}
    <Hop x={-210} y={-170} w={420} h={140} />
    {/* cốc bút trên bàn */}
    <Gach x1={182} y1={-354} x2={166} y2={-410} />
    <Gach x1={196} y1={-354} x2={206} y2={-414} />
    <Hop x={170} y={-360} w={40} h={58} />
  </Goc>
);

/**
 * bảng đen treo trên 2 đoạn tường ngắn (thò xuống 80 px dưới bảng, tâm đáy = chân đoạn tường):
 * khung gỗ viền đôi, máng phấn mỏng, chữ phấn = 3 gạch ngắn dài khác nhau, một viên phấn
 */
const BangDen: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    {/* hai đoạn tường ngắn đỡ bảng */}
    <Hop x={-250} y={-80} w={22} h={80} />
    <Hop x={228} y={-80} w={22} h={80} />
    {/* khung gỗ viền đôi */}
    <Hop x={-300} y={-400} w={600} h={320} />
    <Hop x={-278} y={-378} w={556} h={276} />
    {/* chữ phấn: 3 gạch ngắn */}
    <Gach x1={-236} y1={-330} x2={-70} y2={-330} />
    <Gach x1={-236} y1={-272} x2={-150} y2={-272} />
    <Gach x1={-236} y1={-214} x2={-20} y2={-214} />
    {/* máng phấn mỏng + viên phấn */}
    <Hop x={-312} y={-92} w={624} h={12} />
    <Hop x={120} y={-100} w={40} h={8} rx={3} />
  </Goc>
);

/** bảng tin: khung viền đôi trên 2 chân ngắn, 4 tờ giấy ghim (một tờ hơi nghiêng), dòng chữ = gạch */
const BangTin: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <Hop x={-270} y={-140} w={16} h={140} />
    <Hop x={254} y={-140} w={16} h={140} />
    <Hop x={-300} y={-580} w={600} h={440} />
    <Hop x={-282} y={-562} w={564} h={404} />
    {/* tờ 1 */}
    <Hop x={-250} y={-530} w={140} h={170} />
    <Tron cx={-180} cy={-520} r={7} />
    <Gach x1={-232} y1={-490} x2={-128} y2={-490} />
    <Gach x1={-232} y1={-460} x2={-150} y2={-460} />
    <Gach x1={-232} y1={-430} x2={-140} y2={-430} />
    {/* tờ 2 nghiêng */}
    <g transform="rotate(-6 -10 -440)">
      <Hop x={-90} y={-540} w={160} h={190} />
      <Tron cx={-10} cy={-530} r={7} />
      <Gach x1={-70} y1={-500} x2={50} y2={-500} />
      <Gach x1={-70} y1={-470} x2={20} y2={-470} />
      <Gach x1={-70} y1={-440} x2={40} y2={-440} />
      <Gach x1={-70} y1={-410} x2={0} y2={-410} />
    </g>
    {/* tờ 3 ngang nhỏ */}
    <Hop x={100} y={-520} w={160} h={100} />
    <Tron cx={180} cy={-510} r={7} />
    <Gach x1={118} y1={-480} x2={240} y2={-480} />
    <Gach x1={118} y1={-452} x2={200} y2={-452} />
    {/* tờ 4 */}
    <Hop x={110} y={-390} w={140} h={180} />
    <Tron cx={180} cy={-380} r={7} />
    <Gach x1={128} y1={-350} x2={230} y2={-350} />
    <Gach x1={128} y1={-320} x2={200} y2={-320} />
    <Gach x1={128} y1={-290} x2={220} y2={-290} />
  </Goc>
);

/**
 * dãy bàn nhìn từ bảng xuống (góc thầy): 2 cột x 2 hàng, mỗi chỗ là lưng ghế quay về người xem
 * đứng TRƯỚC bàn (gần hơn, thấp hơn), bàn lùi về điểm tụ giữa
 */
const DayBanSau: React.FC<PropProps> = (p) => {
  const vp: [number, number] = [0, -600];
  const hang = [0.62, 1];
  return (
    <Goc {...p}>
      {hang.map((s) => {
        const san = vp[1] * (1 - s);
        return [-190, 190].map((cx) => {
          const x = cx * s;
          const w = 220 * s;
          return (
            <g key={`${s}-${cx}`} transform={`translate(0 ${san})`}>
              <g transform={`translate(0 ${-70 * s})`}>
                <BanHo x0={x - w / 2} x1={x + w / 2} yMat={-230 * s} day={40 * s} chan={14 * s} sau={0.12} vp={[0, vp[1] - san + 70 * s]} />
              </g>
              {/* lưng ghế + hai chân */}
              <Hop x={x - 60 * s} y={-170 * s} w={12 * s} h={170 * s} />
              <Hop x={x + 48 * s} y={-170 * s} w={12 * s} h={170 * s} />
              <Hop x={x - 70 * s} y={-330 * s} w={140 * s} h={170 * s} rx={14 * s} />
            </g>
          );
        });
      })}
    </Goc>
  );
};

/** 6 bàn học xếp 2 cột x 3 hàng, lùi về một điểm tụ trên giữa */
const DayBanLop: React.FC<PropProps> = (p) => {
  const vp: [number, number] = [40, -600];
  const hang = [0.52, 0.72, 1]; // vẽ hàng xa trước
  return (
    <Goc {...p}>
      {hang.map((s) => {
        const san = vp[1] * (1 - s);
        return [-190, 190].map((cx) => {
          const x = vp[0] + (cx - vp[0]) * s;
          const w = 200 * s;
          return <g key={`${s}-${cx}`} transform={`translate(0 ${san})`}>{<BanHo x0={x - w / 2} x1={x + w / 2} yMat={-220 * s} day={44 * s} chan={14 * s} sau={0.12} vp={[vp[0], vp[1] - san]} />}</g>;
        });
      })}
    </Goc>
  );
};

/** cửa ra vào có khung, hai ô lõm, tay nắm */
const Cua: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <Hop x={-160} y={-880} w={320} h={880} />
    <Hop x={-130} y={-850} w={260} h={850} />
    <Hop x={-98} y={-800} w={196} h={280} />
    <Hop x={-98} y={-450} w={196} h={360} />
    <Tron cx={100} cy={-430} r={13} />
  </Goc>
);

/** cửa sổ 4 ô, bệ dưới */
const CuaSo: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <Hop x={-190} y={-400} w={380} h={360} />
    <Hop x={-160} y={-370} w={320} h={300} />
    <Gach x1={0} y1={-370} x2={0} y2={-70} />
    <Gach x1={-160} y1={-220} x2={160} y2={-220} />
    {/* ánh kính */}
    <Gach x1={-130} y1={-300} x2={-90} y2={-340} />
    <Gach x1={-120} y1={-270} x2={-60} y2={-330} />
    <HopKhoi x0={-210} x1={210} yTren={-40} yDuoi={0} sau={0.08} />
  </Goc>
);

/** cổng trường: hai trụ, thanh ngang, băng rôn có dòng chữ nguệch, hai cánh cổng song sắt */
const CongTruong: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    {/* cánh cổng: song sắt + hai rail */}
    {[-1, 1].map((s) =>
      [40, 90, 140, 190, 240, 290].map((x) => <Gach key={`${s}${x}`} x1={s * x} y1={-660} x2={s * x} y2={0} />),
    )}
    <Gach x1={-300} y1={-620} x2={300} y2={-620} />
    <Gach x1={-300} y1={-70} x2={300} y2={-70} />
    <Gach x1={-300} y1={-660} x2={-40} y2={-660} />
    <Gach x1={40} y1={-660} x2={300} y2={-660} />
    {/* trụ */}
    <HopKhoi x0={-380} x1={-310} yTren={-820} yDuoi={0} sau={0.06} vp={[40, -640]} />
    <HopKhoi x0={310} x1={380} yTren={-820} yDuoi={0} sau={0.06} vp={[40, -640]} />
    <Hop x={-395} y={-850} w={100} h={32} />
    <Hop x={295} y={-850} w={100} h={32} />
    {/* thanh ngang + băng rôn */}
    <Hop x={-395} y={-900} w={790} h={50} />
    <Gach x1={-300} y1={-850} x2={-300} y2={-820} />
    <Gach x1={300} y1={-850} x2={300} y2={-820} />
    <Net d="M -300 -820 L 300 -820 L 300 -700 L -300 -700 Z" />
    {/* dòng chữ trên băng rôn = cụm gạch đậm */}
    {[-230, -120, 10, 90, 170].map((x, i) => (
      <Hop key={`a${i}`} x={x} y={-796} w={[80, 110, 60, 60, 70][i]} h={22} rx={4} />
    ))}
    {[-160, -20, 70].map((x, i) => (
      <Hop key={`b${i}`} x={x} y={-750} w={[120, 70, 100][i]} h={22} rx={4} />
    ))}
  </Goc>
);

/** bàn dài phỏng vấn + 3 ghế phía sau + mic */
const BanPhongVan: React.FC<PropProps> = (p) => {
  const vp: [number, number] = [0, -640];
  const yMat = -270;
  const tl = lui([-360, yMat], 0.12, vp);
  const tr = lui([360, yMat], 0.12, vp);
  return (
    <Goc {...p}>
      {/* ba ghế tựa nhô trên mặt bàn */}
      {[-220, 0, 220].map((x) => (
        <Net key={x} d={`M ${x - 60} ${tl[1]} L ${x - 60} -400 Q ${x - 60} -420 ${x - 40} -420 L ${x + 40} -420 Q ${x + 60} -420 ${x + 60} -400 L ${x + 60} ${tl[1]} Z`} />
      ))}
      {/* mặt bàn + tấm che trước + hai chân đầu bàn */}
      <Net d={daGiac([-360, yMat], [360, yMat], tr, tl)} />
      <Hop x={-360} y={yMat} w={720} h={210} />
      <Hop x={-352} y={-60} w={16} h={60} />
      <Hop x={336} y={-60} w={16} h={60} />
      {/* mic để bàn */}
      <Bau cx={-40} cy={yMat} rx={30} ry={8} />
      <Gach x1={-40} y1={yMat} x2={-40} y2={-330} />
      <Net d={`M -52 -330 L -28 -330 L -30 -350 A 12 12 0 0 0 -50 -350 Z`} />
      <Net d="M -52 -350 a 12 14 0 0 1 24 0 z" />
    </Goc>
  );
};

export const TRUONG_HOC: Record<
  'ban-hoc' | 'ban-giao-vien' | 'bang-den' | 'day-ban-lop' | 'day-ban-sau' | 'cua' | 'cua-so' | 'cong-truong' | 'ban-phong-van' | 'bang-tin',
  React.FC<PropProps>
> = {
  'ban-hoc': BanHoc,
  'ban-giao-vien': BanGiaoVien,
  'bang-den': BangDen,
  'day-ban-lop': DayBanLop,
  'day-ban-sau': DayBanSau,
  cua: Cua,
  'cua-so': CuaSo,
  'cong-truong': CongTruong,
  'ban-phong-van': BanPhongVan,
  'bang-tin': BangTin,
};
