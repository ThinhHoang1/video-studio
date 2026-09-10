import React from 'react';
import {Bau, Gach, Goc, Hop, Net, PropProps, Tron, daGiac, lui} from './co-ban';

/**
 * Prop nhóm THỂ THAO. Cỡ thiết kế (co = 1, DAU = 330):
 *   bong-da 240x240 · khung-thanh 760x420 · ta-tap 420x160 · vot-cau-long 300x560 · cup-vo-dich 340x460
 */

/** bóng đá: hình tròn, ngũ giác giữa + 5 nét toả ra viền */
const BongDa: React.FC<PropProps> = (p) => {
  const r = 120;
  const cy = -120;
  const ngu: [number, number][] = [];
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    ngu.push([Math.cos(a) * 42, cy + Math.sin(a) * 42]);
  }
  return (
    <Goc {...p}>
      <Tron cx={0} cy={cy} r={r} />
      <Net d={daGiac(...ngu)} />
      {ngu.map((q, i) => (
        <Gach key={i} x1={q[0]} y1={q[1]} x2={q[0] * 2.6} y2={cy + (q[1] - cy) * 2.6} />
      ))}
    </Goc>
  );
};

/** khung thành nhìn thẳng: 2 cột + xà, lưới ô vuông phía sau lùi nhẹ về điểm tụ, lưới hai bên + mái */
const KhungThanh: React.FC<PropProps> = (p) => {
  const vp: [number, number] = [0, -700];
  const x0 = -360;
  const x1 = 360;
  const yT = -400;
  const k = 0.22;
  const tl = lui([x0, yT], k, vp);
  const tr = lui([x1, yT], k, vp);
  const bl = lui([x0, 0], k, vp);
  const br = lui([x1, 0], k, vp);
  const cot = 8;
  const hang = 4;
  return (
    <Goc {...p}>
      {/* lưới sau: ô vuông */}
      <Net d={daGiac(tl, tr, br, bl)} />
      {Array.from({length: cot - 1}, (_, i) => (i + 1) / cot).map((t) => (
        <Gach key={`v${t}`} x1={tl[0] + (tr[0] - tl[0]) * t} y1={tl[1]} x2={bl[0] + (br[0] - bl[0]) * t} y2={bl[1]} />
      ))}
      {Array.from({length: hang - 1}, (_, i) => (i + 1) / hang).map((t) => (
        <Gach key={`h${t}`} x1={tl[0]} y1={tl[1] + (bl[1] - tl[1]) * t} x2={tr[0]} y2={tr[1] + (br[1] - tr[1]) * t} />
      ))}
      {/* lưới bên: ô chéo */}
      {[0.33, 0.66].map((t) => (
        <React.Fragment key={t}>
          <Gach x1={x0 + (tl[0] - x0) * t} y1={yT + (tl[1] - yT) * t} x2={x0 + (bl[0] - x0) * t} y2={bl[1] * t} />
          <Gach x1={x1 + (tr[0] - x1) * t} y1={yT + (tr[1] - yT) * t} x2={x1 + (br[0] - x1) * t} y2={br[1] * t} />
          <Gach x1={x0} y1={yT * (1 - t)} x2={bl[0]} y2={bl[1] + (tl[1] - bl[1]) * (1 - t)} />
          <Gach x1={x1} y1={yT * (1 - t)} x2={br[0]} y2={br[1] + (tr[1] - br[1]) * (1 - t)} />
        </React.Fragment>
      ))}
      {/* lưới mái: chỉ nét ô, không tô để thấy lưới sau */}
      <Net to="none" d={daGiac([x0, yT], [x1, yT], tr, tl)} />
      {[0.25, 0.5, 0.75].map((t) => (
        <Gach key={`m${t}`} x1={x0 + (x1 - x0) * t} y1={yT} x2={tl[0] + (tr[0] - tl[0]) * t} y2={tl[1]} />
      ))}
      {/* cột + xà */}
      <Hop x={x0 - 12} y={yT} w={24} h={-yT} />
      <Hop x={x1 - 12} y={yT} w={24} h={-yT} />
      <Hop x={x0 - 12} y={yT - 24} w={x1 - x0 + 24} h={24} />
      <Gach x1={tl[0]} y1={tl[1]} x2={bl[0]} y2={bl[1]} />
      <Gach x1={tr[0]} y1={tr[1]} x2={br[0]} y2={br[1]} />
    </Goc>
  );
};

/** tạ tay nằm ngang: thanh, mỗi đầu 2 bánh tạ to nhỏ */
const TaTap: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <Hop x={-140} y={-96} w={280} h={32} rx={16} />
    <Hop x={-170} y={-130} w={40} h={130} rx={8} />
    <Hop x={130} y={-130} w={40} h={130} rx={8} />
    <Hop x={-210} y={-160} w={50} h={160} rx={10} />
    <Hop x={160} y={-160} w={50} h={160} rx={10} />
  </Goc>
);

/** vợt cầu lông dựng trên cán + quả cầu bên cạnh */
const VotCauLong: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    {/* cán + cổ */}
    <Hop x={-16} y={-220} w={32} h={220} rx={6} />
    <Net d="M -14 -220 L -30 -330 L 30 -330 L 14 -220 Z" />
    {/* mặt vợt */}
    <Bau cx={0} cy={-450} rx={120} ry={130} />
    <Bau cx={0} cy={-450} rx={104} ry={114} />
    {[-70, -35, 0, 35, 70].map((x) => (
      <Gach key={`v${x}`} x1={x} y1={-450 - Math.sqrt(1 - (x / 104) ** 2) * 114} x2={x} y2={-450 + Math.sqrt(1 - (x / 104) ** 2) * 114} />
    ))}
    {[-75, -38, 0, 38, 75].map((y) => (
      <Gach key={`h${y}`} x1={-Math.sqrt(1 - (y / 114) ** 2) * 104} y1={-450 + y} x2={Math.sqrt(1 - (y / 114) ** 2) * 104} y2={-450 + y} />
    ))}
    {/* quả cầu */}
    <Net d="M 100 -30 L 120 -150 L 200 -150 L 140 -30 Z" />
    <Gach x1={120} y1={-150} x2={140} y2={-30} />
    <Gach x1={160} y1={-150} x2={150} y2={-30} />
    <Gach x1={180} y1={-150} x2={160} y2={-30} />
    <Tron cx={120} cy={-20} r={22} />
  </Goc>
);

/** cúp vô địch: đế 2 bậc, chân, thân cúp hai tay cầm, ngôi sao */
const CupVoDich: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <Hop x={-120} y={-40} w={240} h={40} rx={8} />
    <Hop x={-90} y={-80} w={180} h={40} rx={6} />
    <Net d="M -40 -80 L 40 -80 L 24 -140 L -24 -140 Z" />
    <Hop x={-60} y={-160} w={120} h={20} rx={6} />
    {/* tay cầm */}
    <Net to="none" d="M -110 -400 Q -200 -400 -190 -320 Q -180 -250 -110 -250" />
    <Net to="none" d="M 110 -400 Q 200 -400 190 -320 Q 180 -250 110 -250" />
    {/* thân cúp */}
    <Net d="M -130 -440 L 130 -440 L 110 -250 Q 60 -160 0 -160 Q -60 -160 -110 -250 Z" />
    <Bau cx={0} cy={-440} rx={130} ry={16} />
    {/* sao */}
    <Net d="M 0 -380 L 14 -340 L 56 -340 L 22 -316 L 34 -274 L 0 -300 L -34 -274 L -22 -316 L -56 -340 L -14 -340 Z" />
  </Goc>
);

export const THE_THAO: Record<'bong-da' | 'khung-thanh' | 'ta-tap' | 'vot-cau-long' | 'cup-vo-dich', React.FC<PropProps>> = {
  'bong-da': BongDa,
  'khung-thanh': KhungThanh,
  'ta-tap': TaTap,
  'vot-cau-long': VotCauLong,
  'cup-vo-dich': CupVoDich,
};
