import React from 'react';
import {Gach, Goc, Net, PropProps, Tron} from './co-ban';

/**
 * Prop nhóm THIÊN NHIÊN. Cỡ thiết kế (co = 1, DAU = 330):
 *   nui 900x480 · bien-song 800x200 · cay-dua 520x820 · hoa 300x500 · mua-sao 560x420
 */

/** dãy núi 3 đỉnh, đỉnh giữa cao có chỏm tuyết răng cưa */
const Nui: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <Net d="M -450 0 L -260 -300 L -160 -200 L -100 -260 L 40 -40 L 90 0 Z" />
    <Net d="M 100 0 L 260 -330 L 450 0 Z" />
    <Net d="M -200 0 L 0 -480 L 240 0 Z" />
    {/* chỏm tuyết */}
    <Net to="none" d="M -70 -310 L -40 -340 L -10 -310 L 20 -350 L 50 -300 L 70 -320" />
    <Net d="M -70 -310 L 0 -480 L 70 -320 L 50 -300 L 20 -350 L -10 -310 L -40 -340 Z" />
    <Net to="none" d="M 190 -200 L 220 -230 L 250 -200 L 280 -240 L 310 -200" />
  </Goc>
);

/** sóng biển: 2 hàng sóng cuộn (bụng tròn tô trắng + móc cuộn ở đỉnh), hàng trước lệch nửa bước */
const BienSong: React.FC<PropProps> = (p) => {
  const song = (x: number, y: number, r: number, k: string) => (
    <React.Fragment key={k}>
      <Net d={`M ${x - r} ${y} C ${x - r} ${y - r * 1.35} ${x + r} ${y - r * 1.35} ${x + r} ${y} Z`} />
      <Net to="none" d={`M ${x + r * 0.55} ${y - r * 0.55} Q ${x + r * 0.05} ${y - r * 0.95} ${x - r * 0.3} ${y - r * 0.45} Q ${x - r * 0.35} ${y - r * 0.1} ${x} ${y - r * 0.2}`} />
    </React.Fragment>
  );
  return (
    <Goc {...p}>
      {[-300, -100, 100, 300].map((x) => song(x, -70, 90, `s${x}`))}
      {[-200, 0, 200].map((x) => song(x, 0, 100, `t${x}`))}
    </Goc>
  );
};

/** cây dừa: thân cong có đốt, 5 tàu lá cong rủ, 3 quả */
const CayDua: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    {/* thân */}
    <Net d="M -40 0 Q -20 -400 60 -700 L 100 -690 Q 40 -400 40 0 Z" />
    {[-120, -260, -400, -540].map((y) => (
      <Gach key={y} x1={-32 + (-y / 700) * 70} y1={y} x2={42 + (-y / 700) * 60} y2={y - 8} />
    ))}
    {/* tàu lá */}
    <Net d="M 80 -700 Q -80 -720 -180 -600 Q -60 -640 60 -680 Z" />
    <Net d="M 80 -700 Q -40 -800 -140 -790 Q -40 -760 70 -690 Z" />
    <Net d="M 80 -700 Q 120 -830 240 -820 Q 140 -780 90 -690 Z" />
    <Net d="M 80 -700 Q 220 -760 320 -680 Q 220 -700 90 -680 Z" />
    <Net d="M 80 -700 Q 200 -640 260 -540 Q 180 -600 80 -680 Z" />
    {/* quả */}
    <Tron cx={60} cy={-680} r={22} />
    <Tron cx={100} cy={-670} r={22} />
    <Tron cx={80} cy={-650} r={22} />
  </Goc>
);

/** bó hoa: 3 bông to (nhị + 6 cánh tròn), 2 lá, thân gom vào giấy bọc hình nón có nơ */
const Hoa: React.FC<PropProps> = (p) => {
  const bong = (cx: number, cy: number, r: number) => (
    <g key={`${cx}${cy}`}>
      {[0, 60, 120, 180, 240, 300].map((a) => {
        const rad = (a * Math.PI) / 180;
        return <Tron key={a} cx={cx + Math.cos(rad) * r} cy={cy + Math.sin(rad) * r} r={r * 0.62} />;
      })}
      <Tron cx={cx} cy={cy} r={r * 0.55} />
    </g>
  );
  return (
    <Goc {...p}>
      {/* thân */}
      {[-70, 0, 70].map((x) => (
        <Gach key={x} x1={x * 0.25} y1={-200} x2={x} y2={-380} />
      ))}
      {/* lá */}
      <Net d="M -20 -260 Q -120 -260 -150 -350 Q -60 -340 -20 -260 Z" />
      <Net d="M 20 -250 Q 120 -250 150 -340 Q 60 -330 20 -250 Z" />
      {/* giấy bọc */}
      <Net d="M -150 -320 L 0 0 L 150 -320 Q 75 -260 0 -300 Q -75 -260 -150 -320 Z" />
      <Net d="M -34 -160 Q -66 -140 -44 -118 L 0 -134 L 44 -118 Q 66 -140 34 -160 Q 0 -172 -34 -160 Z" />
      {/* hoa */}
      {bong(-90, -400, 40)}
      {bong(90, -400, 40)}
      {bong(0, -450, 46)}
    </Goc>
  );
};

/** sao rơi: 3 ngôi sao 5 cánh có vệt đuôi chéo, sao lớn dưới cùng */
const MuaSao: React.FC<PropProps> = (p) => {
  const sao = (cx: number, cy: number, r: number) => {
    const pts: string[] = [];
    for (let i = 0; i < 10; i++) {
      const rr = i % 2 === 0 ? r : r * 0.45;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`);
    }
    return 'M ' + pts.join(' L ') + ' Z';
  };
  return (
    <Goc {...p}>
      <Gach x1={-40} y1={-60} x2={200} y2={-320} />
      <Gach x1={-10} y1={-30} x2={160} y2={-220} />
      <Net d={sao(-60, -60, 60)} />
      <Gach x1={140} y1={-260} x2={260} y2={-400} />
      <Net d={sao(120, -250, 36)} />
      <Gach x1={-180} y1={-300} x2={-100} y2={-410} />
      <Net d={sao(-190, -290, 30)} />
    </Goc>
  );
};

export const THIEN_NHIEN: Record<'nui' | 'bien-song' | 'cay-dua' | 'hoa' | 'mua-sao', React.FC<PropProps>> = {
  nui: Nui,
  'bien-song': BienSong,
  'cay-dua': CayDua,
  hoa: Hoa,
  'mua-sao': MuaSao,
};
