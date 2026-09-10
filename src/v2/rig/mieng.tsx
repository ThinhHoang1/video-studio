import React from 'react';
import {GocNhin, MAT, MUC, NEN} from './hinh';

/**
 * Bảng hình miệng (mouth chart).
 *
 * Nhóm lip-sync = 9 ký hiệu của Rhubarb (X A B C D E F G H) — pipeline/lipsync.mjs
 * sinh chuỗi ký hiệu theo frame, rig chỉ tra bảng. Mỗi ký hiệu có 2 biến thể
 * (`bien` 0/1) để hai frame cùng ký hiệu liền nhau không y hệt — tham chiếu xen
 * kẽ hé/rộng/dẹt liên tục dù cùng âm lượng.
 *
 * Nhóm cảm xúc thay thế lip-sync khi nhân vật không nói.
 *
 * Bên trong miệng LUÔN trắng; răng = một dải trắng viền đen ở hàm trên; lưỡi =
 * một cung; không có môi. Mọi số là hệ số DAU, tâm miệng ở 85% chiều cao sọ.
 */
export type HinhMieng =
  | 'X' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H'
  | 'thang' | 'cuoi-nhe' | 'cuoi' | 'cuoi-toe' | 'meu' | 'hoang' | 'o' | 'smirk' | 'ba' | 'nghien' | 'gat' | 'mim';

export const MIENG_LIPSYNC: HinhMieng[] = ['X', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
export const MIENG_CAM_XUC: HinhMieng[] = ['thang', 'cuoi-nhe', 'cuoi', 'cuoi-toe', 'meu', 'hoang', 'o', 'smirk', 'ba', 'nghien', 'gat', 'mim'];

type P = {
  dau: number;
  cx: number;
  cy: number;
  net: number;
  hinh: HinhMieng;
  nhin?: number;
  bien?: number;
  /** góc nhìn: 3/4 miệng dịch 0.12 DAU về phía mặt; nghiêng đặt ở mép trước (0.36), Dau cắt theo sọ */
  goc?: GocNhin;
  /** mặt quay về -x (chỉ Dau đứng riêng có flip) */
  lat?: boolean;
};

/** lệch tâm miệng theo góc nhìn (hệ số DAU, chưa nhân hướng mặt) */
export const lechMieng = (goc: GocNhin) => (goc === 'ba-phan-tu' ? 0.12 : goc === 'nghieng' ? 0.36 : 0);

/** khoang miệng bo tròn: rộng w, cao h (px), tâm (x,y). */
const khoang = (x: number, y: number, w: number, h: number, r = 0.35) => {
  const rx = Math.min(w / 2, h * r);
  return `M ${x - w / 2 + rx} ${y - h / 2} h ${w - 2 * rx} a ${rx} ${rx} 0 0 1 ${rx} ${rx} v ${h - 2 * rx} a ${rx} ${rx} 0 0 1 ${-rx} ${rx} h ${-(w - 2 * rx)} a ${rx} ${rx} 0 0 1 ${-rx} ${-rx} v ${-(h - 2 * rx)} a ${rx} ${rx} 0 0 1 ${rx} ${-rx} z`;
};

/** dải răng trên: nằm sát mép trên khoang miệng */
const Rang: React.FC<{x: number; y: number; w: number; h: number; net: number}> = ({x, y, w, h, net}) => (
  <path d={khoang(x, y, w, h, 0.5)} fill={NEN} stroke={MUC} strokeWidth={net} strokeLinejoin="round" />
);

/** lưỡi: một cung ở đáy khoang */
const Luoi: React.FC<{x: number; y: number; w: number; h: number; net: number}> = ({x, y, w, h, net}) => (
  <path d={`M ${x - w / 2} ${y} q ${w / 2} ${-h} ${w} 0`} fill="none" stroke={MUC} strokeWidth={net} strokeLinecap="round" />
);

export const Mieng: React.FC<P> = ({dau: d, cx, cy, net, hinh, nhin = 0, bien = 0, goc = 'truoc', lat}) => {
  if (goc === 'sau') return null;
  const x = cx + nhin * MAT.lechNhin * d + lechMieng(goc) * (lat ? -1 : 1) * d;
  const y = cy + MAT.miengY * d;
  const S = {fill: NEN, stroke: MUC, strokeWidth: net, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
  const L = {fill: 'none', stroke: MUC, strokeWidth: net, strokeLinecap: 'round' as const};

  switch (hinh) {
    // ── lip-sync ──────────────────────────────────────────────────────
    case 'X': // nghỉ — cong nhẹ
      return <path d={`M ${x - 0.06 * d} ${y} q ${0.06 * d} ${0.03 * d} ${0.12 * d} ${-0.01 * d}`} {...L} />;
    case 'A': // ngậm môi m/b/p — gạch thẳng
      return <line x1={x - 0.06 * d} y1={y} x2={x + 0.07 * d} y2={y - 0.005 * d} {...L} />;
    case 'B': // hé — tam giác nhỏ | dẹt răng
      return bien === 0 ? (
        <path d={`M ${x - 0.05 * d} ${y - 0.035 * d} L ${x + 0.05 * d} ${y - 0.02 * d} L ${x - 0.005 * d} ${y + 0.04 * d} z`} {...S} />
      ) : (
        <g>
          <path d={khoang(x, y, 0.3 * d, 0.07 * d, 0.5)} {...S} />
          <line x1={x - 0.12 * d} y1={y - 0.005 * d} x2={x + 0.12 * d} y2={y - 0.005 * d} stroke={MUC} strokeWidth={net * 0.8} />
        </g>
      );
    case 'C': // mở vừa | rộng + răng trên
      return bien === 0 ? (
        <path d={khoang(x, y, 0.18 * d, 0.1 * d)} {...S} />
      ) : (
        <g>
          <path d={khoang(x, y, 0.36 * d, 0.13 * d)} {...S} />
          <Rang x={x} y={y - 0.04 * d} w={0.3 * d} h={0.05 * d} net={net} />
        </g>
      );
    case 'D': // mở to + răng + lưỡi
      return (
        <g>
          <path d={khoang(x, y + 0.01 * d, 0.38 * d, 0.22 * d, 0.45)} {...S} />
          <Rang x={x} y={y - 0.075 * d} w={0.3 * d} h={0.05 * d} net={net} />
          <Luoi x={x} y={y + 0.12 * d} w={0.22 * d} h={0.07 * d} net={net} />
        </g>
      );
    case 'E': // tròn vừa o/ô/ơ
      return <ellipse cx={x} cy={y} rx={0.065 * d} ry={0.08 * d} {...S} />;
    case 'F': // chu u/ư
      return <ellipse cx={x} cy={y} rx={0.04 * d} ry={0.045 * d} {...S} />;
    case 'G': // răng-môi ph/v — chỉ dải răng
      return (
        <g>
          <path d={khoang(x, y, 0.28 * d, 0.06 * d, 0.5)} {...S} />
          <line x1={x - 0.11 * d} y1={y + 0.03 * d} x2={x + 0.11 * d} y2={y + 0.03 * d} stroke={MUC} strokeWidth={net} strokeLinecap="round" />
        </g>
      );
    case 'H': // lưỡi lên l — rộng + lưỡi
      return (
        <g>
          <path d={khoang(x, y, 0.34 * d, 0.14 * d)} {...S} />
          <Luoi x={x} y={y + 0.07 * d} w={0.2 * d} h={0.09 * d} net={net} />
        </g>
      );

    // ── cảm xúc ───────────────────────────────────────────────────────
    case 'thang':
      return <line x1={x - 0.07 * d} y1={y} x2={x + 0.07 * d} y2={y} {...L} />;
    case 'mim':
      return <path d={`M ${x - 0.05 * d} ${y - 0.01 * d} q ${0.05 * d} ${0.03 * d} ${0.1 * d} 0`} {...L} strokeWidth={net * 1.1} />;
    case 'cuoi-nhe':
      return <path d={`M ${x - 0.1 * d} ${y - 0.02 * d} q ${0.1 * d} ${0.09 * d} ${0.2 * d} 0`} {...L} />;
    case 'cuoi': // nửa ellipse úp xuống + dải răng
      return (
        <g>
          <path d={`M ${x - 0.2 * d} ${y - 0.03 * d} q ${0.2 * d} ${0.24 * d} ${0.4 * d} 0 z`} {...S} />
          <path d={`M ${x - 0.16 * d} ${y - 0.03 * d} h ${0.32 * d} v ${0.045 * d} q ${-0.16 * d} ${0.02 * d} ${-0.32 * d} 0 z`} {...S} strokeWidth={net * 0.9} />
        </g>
      );
    case 'cuoi-toe':
      return (
        <g>
          <path d={`M ${x - 0.19 * d} ${y - 0.05 * d} q ${0.19 * d} ${0.26 * d} ${0.38 * d} 0 q ${-0.19 * d} ${-0.06 * d} ${-0.38 * d} 0 z`} {...S} />
          <path d={`M ${x - 0.15 * d} ${y - 0.04 * d} h ${0.3 * d} v ${0.05 * d} q ${-0.15 * d} ${0.02 * d} ${-0.3 * d} 0 z`} {...S} strokeWidth={net * 0.9} />
          <Luoi x={x} y={y + 0.13 * d} w={0.16 * d} h={0.05 * d} net={net} />
        </g>
      );
    case 'meu': {
      const s = 0.25 * d;
      return <path d={`M ${x - s / 2} ${y} q ${s / 8} ${-s * 0.18} ${s / 4} 0 t ${s / 4} 0 t ${s / 4} 0 t ${s / 4} 0`} {...L} />;
    }
    case 'hoang': {
      // răng cưa: khoang mở dọc, mép trên/dưới răng cưa
      const w = 0.16 * d;
      const h = 0.18 * d;
      const z = w / 4;
      return (
        <path
          d={`M ${x - w / 2} ${y - h / 2} l ${z} ${z * 0.5} l ${z} ${-z * 0.5} l ${z} ${z * 0.5} l ${z} ${-z * 0.5} L ${x + w / 2} ${y + h / 2} l ${-z} ${-z * 0.5} l ${-z} ${z * 0.5} l ${-z} ${-z * 0.5} l ${-z} ${z * 0.5} z`}
          {...S}
        />
      );
    }
    case 'o':
      return <circle cx={x} cy={y} r={0.045 * d} {...S} />;
    case 'smirk':
      return <path d={`M ${x - 0.02 * d} ${y + 0.01 * d} q ${0.07 * d} ${0.04 * d} ${0.13 * d} ${-0.03 * d}`} {...L} />;
    case 'ba': // miệng "3" — hai cung nhỏ
      return <path d={`M ${x - 0.05 * d} ${y - 0.03 * d} q ${0.06 * d} ${-0.01 * d} ${0.05 * d} ${0.03 * d} q ${0.01 * d} ${0.04 * d} ${-0.05 * d} ${0.03 * d}`} {...L} />;
    case 'nghien':
      return (
        <g>
          <path d={khoang(x, y, 0.3 * d, 0.06 * d, 0.5)} {...S} />
          {[-0.07, 0, 0.07].map((k) => (
            <line key={k} x1={x + k * d} y1={y - 0.03 * d} x2={x + k * d} y2={y + 0.03 * d} stroke={MUC} strokeWidth={net * 0.8} />
          ))}
        </g>
      );
    case 'gat': // mở, mép cong xuống, răng
      return (
        <g>
          <path d={`M ${x - 0.15 * d} ${y + 0.04 * d} q ${0.15 * d} ${-0.16 * d} ${0.3 * d} 0 q ${-0.15 * d} ${0.1 * d} ${-0.3 * d} 0 z`} {...S} />
          <path d={`M ${x - 0.11 * d} ${y - 0.01 * d} q ${0.11 * d} ${-0.07 * d} ${0.22 * d} 0 v ${0.03 * d} q ${-0.11 * d} ${-0.05 * d} ${-0.22 * d} 0 z`} {...S} strokeWidth={net * 0.9} />
        </g>
      );
  }
};
