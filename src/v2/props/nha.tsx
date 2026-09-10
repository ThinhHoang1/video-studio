import React from 'react';
import {Bau, Diem, Gach, Goc, Hop, HopKhoi, Net, PropProps, Tron, daGiac, lui} from './co-ban';

/**
 * Prop nhóm TRONG NHÀ. Cỡ thiết kế (co = 1, nhân vật DAU = 330):
 *   giuong 640x420 · tu-lanh 330x680 · ban-an 760x440 · tivi 520x430 · ghe-sofa 660x330
 *   cua-nha 600x960 · den-ngu 160x400 · cau-thang 460x540
 * Toàn bộ nhìn ngang / hơi chếch một điểm tụ; không sàn, không tường.
 */

/** giường nhìn ngang: đầu giường cao bên trái, gối, chăn phủ nửa phải có mép gấp */
const Giuong: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    {/* chân */}
    <Hop x={-316} y={-60} w={20} h={60} />
    <Hop x={296} y={-60} w={20} h={60} />
    {/* đầu giường (cao) và chân giường (thấp), đỉnh bo */}
    <Net d="M -320 -60 L -320 -400 Q -320 -420 -300 -420 L -276 -420 Q -256 -420 -256 -400 L -256 -60 Z" />
    <Net d="M 256 -60 L 256 -280 Q 256 -300 276 -300 L 300 -300 Q 320 -300 320 -280 L 320 -60 Z" />
    {/* khung + nệm */}
    <Hop x={-300} y={-140} w={600} h={80} />
    <Hop x={-300} y={-200} w={600} h={60} />
    {/* gối */}
    <Hop x={-276} y={-252} w={160} h={52} rx={20} />
    <Net to="none" d="M -240 -226 q 20 -8 40 0" />
    {/* chăn: mép gấp cong bên trái, nếp chăn */}
    <Net d="M -100 -200 L -100 -240 Q -70 -264 -40 -240 L 300 -240 L 300 -200 Z" />
    <Net to="none" d="M -50 -222 L 300 -222" />
  </Goc>
);

/** tủ lạnh hai ngăn: khối phối cảnh, vạch chia ngăn đá, hai tay nắm, giấy nhớ dán cửa */
const TuLanh: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <HopKhoi x0={-150} x1={150} yTren={-640} yDuoi={0} sau={0.1} vp={[320, -780]} />
    <Gach x1={-150} y1={-440} x2={150} y2={-440} />
    <Hop x={104} y={-610} w={18} h={110} rx={8} />
    <Hop x={104} y={-400} w={18} h={200} rx={8} />
    {/* giấy nhớ */}
    <Hop x={-110} y={-380} w={80} h={70} />
    <Gach x1={-96} y1={-356} x2={-46} y2={-356} />
    <Gach x1={-96} y1={-336} x2={-60} y2={-336} />
  </Goc>
);

/** bàn ăn bốn chân + hai ghế tựa hai đầu + đĩa, bát đũa */
const BanAn: React.FC<PropProps> = (p) => {
  const vp: Diem = [0, -700];
  const yMat = -290;
  const sau = 0.2;
  const tl = lui([-230, yMat], sau, vp);
  const tr = lui([230, yMat], sau, vp);
  const chanSau = (x: number) => {
    const a = lui([x, yMat + 24], sau, vp);
    const b = lui([x, 0], sau, vp);
    return <Hop x={a[0] - 6} y={a[1]} w={12} h={b[1] - a[1]} />;
  };
  const Ghe: React.FC<{s: 1 | -1}> = ({s}) => (
    <>
      <Hop x={s === -1 ? -366 : 354} y={-210} w={12} h={210} />
      <Hop x={s === -1 ? -282 : 270} y={-210} w={12} h={210} />
      <Hop x={s === -1 ? -382 : 350} y={-440} w={32} h={214} rx={10} />
      <Hop x={s === -1 ? -370 : 270} y={-226} w={100} h={16} />
    </>
  );
  return (
    <Goc {...p}>
      <Ghe s={-1} />
      <Ghe s={1} />
      {/* chân sau nhìn qua khe */}
      {chanSau(-214)}
      {chanSau(214)}
      {/* mặt bàn + cạnh trước */}
      <Net d={daGiac([-230, yMat], [230, yMat], tr, tl)} />
      <Hop x={-230} y={yMat} w={460} h={24} />
      {/* chân trước */}
      <Hop x={-222} y={yMat + 24} w={14} h={-(yMat + 24)} />
      <Hop x={208} y={yMat + 24} w={14} h={-(yMat + 24)} />
      {/* đĩa */}
      <Bau cx={-90} cy={yMat - 4} rx={52} ry={12} />
      <Bau cx={-90} cy={yMat - 4} rx={30} ry={6} />
      {/* bát + đũa */}
      <Net d="M 50 -330 Q 50 -294 90 -294 Q 130 -294 130 -330 Z" />
      <Bau cx={90} cy={-330} rx={40} ry={9} />
      <Gach x1={100} y1={-338} x2={152} y2={-402} />
      <Gach x1={112} y1={-338} x2={160} y2={-396} />
    </Goc>
  );
};

/** tivi màn phẳng trên chân đế: viền dày, đèn chờ, hai vệt sáng chéo */
const Tivi: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <Hop x={-140} y={-24} w={280} h={24} rx={8} />
    <Hop x={-22} y={-110} w={44} h={90} />
    <Hop x={-260} y={-430} w={520} h={330} rx={14} />
    <Hop x={-238} y={-410} w={476} h={272} />
    <Gach x1={-200} y1={-360} x2={-160} y2={-396} />
    <Gach x1={-186} y1={-330} x2={-126} y2={-390} />
    <Tron cx={210} cy={-118} r={5} />
  </Goc>
);

/** ghế sofa ba mảng: lưng bo, hai đệm ngồi, hai tay vịn tròn */
const GheSofa: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <Hop x={-280} y={-40} w={20} h={40} />
    <Hop x={260} y={-40} w={20} h={40} />
    <Hop x={-280} y={-330} w={560} h={190} rx={30} />
    <Gach x1={0} y1={-330} x2={0} y2={-170} />
    <Hop x={-270} y={-170} w={260} h={70} rx={12} />
    <Hop x={10} y={-170} w={260} h={70} rx={12} />
    <Hop x={-290} y={-100} w={580} h={60} />
    <Hop x={-330} y={-250} w={70} h={210} rx={24} />
    <Hop x={260} y={-250} w={70} h={210} rx={24} />
  </Goc>
);

/** cửa nhà có mái hiên: mái dốc + giá đỡ, khung cửa hai ô, tay nắm, ngưỡng cửa */
const CuaNha: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    {/* mái hiên */}
    <Net d={daGiac([-300, -820], [-210, -940], [210, -940], [300, -820])} />
    <Hop x={-300} y={-820} w={600} h={24} />
    <Gach x1={-190} y1={-796} x2={-190} y2={-736} />
    <Gach x1={190} y1={-796} x2={190} y2={-736} />
    <Gach x1={-190} y1={-736} x2={-130} y2={-796} />
    <Gach x1={190} y1={-736} x2={130} y2={-796} />
    {/* khung + cánh */}
    <Hop x={-170} y={-780} w={340} h={780} />
    <Hop x={-140} y={-750} w={280} h={750} />
    <Hop x={-106} y={-700} w={212} h={250} />
    <Hop x={-106} y={-400} w={212} h={330} />
    <Tron cx={100} cy={-380} r={13} />
    {/* ngưỡng cửa */}
    <Hop x={-180} y={-16} w={360} h={16} rx={4} />
  </Goc>
);

/** đèn ngủ trên tủ đầu giường: tủ nhỏ có hộc, đèn chụp hình thang */
const DenNgu: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <HopKhoi x0={-70} x1={70} yTren={-200} yDuoi={0} sau={0.12} vp={[260, -520]} />
    <Hop x={-52} y={-176} w={104} h={56} />
    <Gach x1={-16} y1={-148} x2={16} y2={-148} />
    {/* đèn */}
    <Bau cx={0} cy={-206} rx={34} ry={8} />
    <Hop x={-5} y={-320} w={10} h={114} />
    <Net d={daGiac([-64, -320], [64, -320], [40, -400], [-40, -400])} />
  </Goc>
);

/** cầu thang 5 bậc lên bên phải, mặt bậc lùi về điểm tụ, tay vịn có trụ */
const CauThang: React.FC<PropProps> = (p) => {
  const vp: Diem = [-240, -760];
  const x0 = -250;
  const buoc = 90;
  const cao = 70;
  const n = 5;
  const sau = 0.09;
  const mat: Diem[] = [];
  for (let i = 0; i < n; i++) {
    mat.push([x0 + i * buoc, -i * cao], [x0 + i * buoc, -(i + 1) * cao]);
  }
  const xCuoi = x0 + n * buoc;
  const than: Diem[] = [[x0, 0], ...mat, [xCuoi, -n * cao], [xCuoi, 0]];
  return (
    <Goc {...p}>
      {/* mặt bậc (vẽ trước, thân đè lên) */}
      {Array.from({length: n}, (_, i) => {
        const a: Diem = [x0 + i * buoc, -(i + 1) * cao];
        const b: Diem = [x0 + (i + 1) * buoc, -(i + 1) * cao];
        return <Net key={i} d={daGiac(a, b, lui(b, sau, vp), lui(a, sau, vp))} />;
      })}
      {/* mặt trên chiếu nghỉ */}
      <Net d={daGiac([xCuoi - buoc, -n * cao], [xCuoi, -n * cao], lui([xCuoi, -n * cao], sau, vp), lui([xCuoi - buoc, -n * cao], sau, vp))} />
      {/* thân bậc */}
      <Net d={daGiac(...than)} />
      {/* tay vịn */}
      <Hop x={x0 + 14} y={-cao - 200} w={14} h={200} />
      <Hop x={xCuoi - 30} y={-n * cao - 200} w={14} h={200} />
      <Net to="none" d={`M ${x0 + 21} ${-cao - 200} L ${xCuoi - 23} ${-n * cao - 200}`} day={p.net * 1.4} />
      {[1, 2, 3].map((i) => {
        const x = x0 + i * buoc + 30;
        const yBac = -(i + 1) * cao;
        const yTay = -cao - 200 + ((-n * cao - 200 + cao + 200) * (x - x0 - 21)) / (xCuoi - 23 - x0 - 21);
        return <Gach key={i} x1={x} y1={yBac} x2={x} y2={yTay} />;
      })}
    </Goc>
  );
};

export const NHA: Record<'giuong' | 'tu-lanh' | 'ban-an' | 'tivi' | 'ghe-sofa' | 'cua-nha' | 'den-ngu' | 'cau-thang', React.FC<PropProps>> = {
  giuong: Giuong,
  'tu-lanh': TuLanh,
  'ban-an': BanAn,
  tivi: Tivi,
  'ghe-sofa': GheSofa,
  'cua-nha': CuaNha,
  'den-ngu': DenNgu,
  'cau-thang': CauThang,
};
