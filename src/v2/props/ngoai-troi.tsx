import React from 'react';
import {Bau, Gach, Goc, Hop, HopKhoi, Net, PropProps, Tron, daGiac, r1} from './co-ban';

/**
 * Prop nhóm NGOÀI TRỜI. Cỡ thiết kế (co = 1, nhân vật DAU = 330):
 *   ghe-da 480x300 · goc-cay 600x800 · cot-dien 600x920 · xe-dap 500x290
 *   mua 1920x1080 (phủ đúng một khung khi đặt tâm đáy ở (0.5, 1.0), co = 1)
 */

/** ghế đá công viên: tấm ngồi dày, tấm tựa, hai khối chân */
const GheDa: React.FC<PropProps> = (p) => {
  const vp: [number, number] = [0, -640];
  return (
    <Goc {...p}>
      {/* tấm tựa (phía sau) */}
      <HopKhoi x0={-200} x1={200} yTren={-300} yDuoi={-190} sau={0.04} vp={vp} />
      {/* hai khối chân */}
      <HopKhoi x0={-200} x1={-140} yTren={-100} yDuoi={0} sau={0.1} vp={[260, -640]} />
      <HopKhoi x0={140} x1={200} yTren={-100} yDuoi={0} sau={0.1} vp={[260, -640]} />
      {/* tấm ngồi */}
      <HopKhoi x0={-240} x1={240} yTren={-130} yDuoi={-100} sau={0.12} vp={vp} />
    </Goc>
  );
};

/** gốc cây: thân loe rễ, tán lá vỏ sò */
const GocCay: React.FC<PropProps> = (p) => {
  // tán: chuỗi cung tròn quanh một ellipse
  const cx = 0;
  const cy = -580;
  const rx = 300;
  const ry = 210;
  const n = 11;
  const pts = Array.from({length: n}, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry] as [number, number];
  });
  let d = `M ${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    const day = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const r = day * 0.58;
    d += ` A ${r1(r)} ${r1(r)} 0 0 1 ${r1(b[0])} ${r1(b[1])}`;
  }
  d += ' Z';
  return (
    <Goc {...p}>
      {/* thân */}
      <Net d="M -140 0 Q -80 -12 -70 -120 L -60 -420 L 60 -420 L 70 -120 Q 80 -12 140 0 Z" />
      <Net to="none" d="M -30 -80 L -34 -240 M 20 -130 L 24 -300" />
      {/* tán */}
      <Net d={d} />
      <Net to="none" d="M -120 -520 q 40 -60 110 -70 M 60 -640 q 60 10 100 60" />
    </Goc>
  );
};

/** cột điện: cột thuôn, hai xà ngang, sứ cách điện, dây võng hai bên */
const CotDien: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    {/* dây điện */}
    <Net to="none" d="M -110 -874 Q -200 -830 -300 -846 M 110 -874 Q 200 -830 300 -846" />
    <Net to="none" d="M -80 -774 Q -190 -736 -300 -756 M 80 -774 Q 190 -736 300 -756" />
    {/* cột */}
    <Net d={daGiac([-22, 0], [22, 0], [15, -920], [-15, -920])} />
    {/* xà */}
    <Hop x={-140} y={-850} w={280} h={20} />
    <Hop x={-110} y={-770} w={220} h={18} />
    {/* chống xà */}
    <Gach x1={-70} y1={-830} x2={-14} y2={-780} />
    <Gach x1={70} y1={-830} x2={14} y2={-780} />
    {/* sứ */}
    {[-110, 0, 110].map((x) => (
      <Hop key={x} x={x - 9} y={-874} w={18} h={24} rx={5} />
    ))}
    {[-80, 80].map((x) => (
      <Hop key={x} x={x - 9} y={-792} w={18} h={22} rx={5} />
    ))}
  </Goc>
);

/** xe đạp nhìn ngang: hai bánh, khung kim cương, yên, ghi đông, bàn đạp */
const XeDap: React.FC<PropProps> = (p) => {
  const R: [number, number] = [-150, -100];
  const F: [number, number] = [150, -100];
  const C: [number, number] = [0, -110];
  const S: [number, number] = [-60, -235];
  const H: [number, number] = [90, -235];
  const banh = (c: [number, number]) => (
    <>
      <Tron cx={c[0]} cy={c[1]} r={100} />
      {[0, 45, 90, 135].map((a) => {
        const t = (a * Math.PI) / 180;
        return <Gach key={a} x1={c[0] - Math.cos(t) * 88} y1={c[1] - Math.sin(t) * 88} x2={c[0] + Math.cos(t) * 88} y2={c[1] + Math.sin(t) * 88} />;
      })}
      <Tron cx={c[0]} cy={c[1]} r={12} />
    </>
  );
  return (
    <Goc {...p}>
      {banh(R)}
      {banh(F)}
      {/* khung */}
      <Net to="none" d={`M ${R[0]} ${R[1]} L ${S[0]} ${S[1]} L ${H[0]} ${H[1]} L ${F[0]} ${F[1]} M ${R[0]} ${R[1]} L ${C[0]} ${C[1]} L ${S[0]} ${S[1]} M ${C[0]} ${C[1]} L ${H[0]} ${H[1]}`} day={p.net * 1.6} />
      {/* yên + cọc yên */}
      <Gach x1={S[0]} y1={S[1]} x2={S[0] - 8} y2={-262} />
      <Bau cx={S[0] - 16} cy={-266} rx={34} ry={9} />
      {/* ghi đông */}
      <Net to="none" d={`M ${H[0]} ${H[1]} L 94 -272 Q 112 -284 136 -270`} />
      {/* đùi đĩa + bàn đạp */}
      <Tron cx={C[0]} cy={C[1]} r={24} />
      <Gach x1={C[0]} y1={C[1]} x2={C[0] + 30} y2={C[1] + 38} />
      <Hop x={C[0] + 22} y={C[1] + 34} w={24} h={8} />
    </Goc>
  );
};

/** mưa: vạch chéo phủ 1920x1080 phía trên tâm đáy, vị trí lệch ngẫu nhiên cố định */
const Mua: React.FC<PropProps> = (p) => {
  const cot = 22;
  const hang = 12;
  const dai = 64;
  const lech = 14;
  const lines: React.ReactNode[] = [];
  for (let i = 0; i < hang; i++) {
    for (let j = 0; j < cot; j++) {
      const jx = ((i * 7 + j * 13) % 5) * 9 - 18;
      const jy = ((i * 11 + j * 3) % 4) * 12 - 18;
      const x = -960 + 40 + j * 88 + jx + (i % 2) * 44;
      const y = -1080 + 30 + i * 92 + jy;
      lines.push(<Gach key={`${i}-${j}`} x1={x} y1={y} x2={x - lech} y2={y + dai} />);
    }
  }
  return (
    <Goc {...p}>
      <g fill="none">{lines}</g>
    </Goc>
  );
};

export const NGOAI_TROI: Record<'ghe-da' | 'goc-cay' | 'cot-dien' | 'xe-dap' | 'mua', React.FC<PropProps>> = {
  'ghe-da': GheDa,
  'goc-cay': GocCay,
  'cot-dien': CotDien,
  'xe-dap': XeDap,
  mua: Mua,
};
