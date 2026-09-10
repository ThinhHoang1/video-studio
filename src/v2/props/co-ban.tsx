import React from 'react';
import {MUC, NEN} from '../rig/hinh';

/**
 * Nền tảng vẽ prop V2.
 *
 * Quy ước (đo từ tham chiếu, reports/net-ve.md mục 3 + shot.md mục 5):
 *   - prop là NÉT ĐEN KHÔNG TÔ; mảng kín tô bằng màu nền #fdfdfd để che nhân
 *     vật phía sau khi cần (bàn che chân, cửa che người...)
 *   - phối cảnh một điểm tụ đơn giản, không sàn, không tường, không chân trời
 *   - nét dày bằng nét nhân vật cùng shot → strokeWidth = net (px thật) và mọi
 *     nét dùng vector-effect="non-scaling-stroke" để scale(co) không đổi độ dày
 *
 * Toạ độ thiết kế: gốc (0,0) = TÂM ĐÁY prop, y âm hướng lên, đơn vị px ở co = 1
 * (cỡ chuẩn đi với nhân vật cỡ trung DAU = 330px, cao ~858px).
 */
export type PropProps = {
  /** tâm đáy prop trên khung 1920x1080 (px) */
  x: number;
  y: number;
  /** hệ số cỡ, 1 = cỡ chuẩn */
  co: number;
  /** độ dày nét (px thật, không bị scale) */
  net: number;
  /** lật ngang quanh trục dọc qua tâm đáy */
  flip?: boolean;
  /** chữ điền vào prop có nhãn (bang-hieu, hop-nhan, bieu-tuong, to-giay, man-hinh, bien-bao) */
  chu?: string;
};

export type Diem = [number, number];

/** điểm tụ mặc định: hơi lệch phải, ngang tầm mắt nhân vật cỡ trung */
export const DIEM_TU: Diem = [260, -640];

/** thuộc tính nét chung cho mọi phần tử SVG trong prop */
export const NET = {vectorEffect: 'non-scaling-stroke'} as const;

export const r1 = (n: number) => Math.round(n * 10) / 10;

/** điểm p lùi về điểm tụ theo tỉ lệ k (0 = tại chỗ, 1 = tại điểm tụ) */
export const lui = (p: Diem, k: number, vp: Diem = DIEM_TU): Diem => [p[0] + (vp[0] - p[0]) * k, p[1] + (vp[1] - p[1]) * k];

/** đa giác kín từ danh sách điểm */
export const daGiac = (...ps: Diem[]) => 'M ' + ps.map((p) => `${r1(p[0])} ${r1(p[1])}`).join(' L ') + ' Z';

/** đường gấp khúc hở */
export const gapKhuc = (...ps: Diem[]) => 'M ' + ps.map((p) => `${r1(p[0])} ${r1(p[1])}`).join(' L ');

/**
 * Nhóm gốc của một prop: dịch tới (x, y), scale co (lật nếu flip).
 * fill/stroke/strokeWidth/linecap/linejoin kế thừa xuống mọi phần tử con.
 */
export const Goc: React.FC<PropProps & {children?: React.ReactNode}> = ({x, y, co, net, flip, children}) => (
  <g
    transform={`translate(${r1(x)} ${r1(y)}) scale(${flip ? -co : co} ${co})`}
    fill={NEN}
    stroke={MUC}
    strokeWidth={net}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </g>
);

/** path — mặc định tô nền (mảng kín); to="none" cho nét hở */
export const Net: React.FC<{d: string; to?: string; day?: number}> = ({d, to, day}) => <path d={d} fill={to} strokeWidth={day} {...NET} />;

/** đoạn thẳng */
export const Gach: React.FC<{x1: number; y1: number; x2: number; y2: number; day?: number}> = ({x1, y1, x2, y2, day}) => (
  <line x1={r1(x1)} y1={r1(y1)} x2={r1(x2)} y2={r1(y2)} strokeWidth={day} {...NET} />
);

/** chữ nhật (x, y = góc trên trái) */
export const Hop: React.FC<{x: number; y: number; w: number; h: number; rx?: number; to?: string}> = ({x, y, w, h, rx, to}) => (
  <rect x={r1(x)} y={r1(y)} width={r1(w)} height={r1(h)} rx={rx} fill={to} {...NET} />
);

export const Tron: React.FC<{cx: number; cy: number; r: number; to?: string}> = ({cx, cy, r, to}) => <circle cx={r1(cx)} cy={r1(cy)} r={r1(r)} fill={to} {...NET} />;

export const Bau: React.FC<{cx: number; cy: number; rx: number; ry: number; to?: string}> = ({cx, cy, rx, ry, to}) => (
  <ellipse cx={r1(cx)} cy={r1(cy)} rx={r1(rx)} ry={r1(ry)} fill={to} {...NET} />
);

/**
 * Hộp phối cảnh một điểm tụ: mặt trước (x0..x1, yTren..yDuoi), lùi `sau` về
 * điểm tụ. Vẽ mặt bên (nếu thấy) → mặt trên → mặt trước, mặt sau che mặt trước.
 */
export const HopKhoi: React.FC<{x0: number; x1: number; yTren: number; yDuoi: number; sau: number; vp?: Diem}> = ({x0, x1, yTren, yDuoi, sau, vp = DIEM_TU}) => {
  const tl = lui([x0, yTren], sau, vp);
  const tr = lui([x1, yTren], sau, vp);
  const br = lui([x1, yDuoi], sau, vp);
  const bl = lui([x0, yDuoi], sau, vp);
  return (
    <>
      {vp[0] > x1 && <Net d={daGiac([x1, yTren], tr, br, [x1, yDuoi])} />}
      {vp[0] < x0 && <Net d={daGiac([x0, yTren], tl, bl, [x0, yDuoi])} />}
      <Net d={daGiac([x0, yTren], [x1, yTren], tr, tl)} />
      <Hop x={x0} y={yTren} w={x1 - x0} h={yDuoi - yTren} />
    </>
  );
};

/**
 * Mặt bàn phối cảnh + tấm chắn trước + hai chân trước (bàn hở bên dưới).
 * yMat = độ cao mặt bàn (âm), chan = chiều rộng chân.
 */
export const BanHo: React.FC<{x0: number; x1: number; yMat: number; day?: number; sau?: number; chan?: number; vp?: Diem}> = ({x0, x1, yMat, day = 50, sau = 0.15, chan = 16, vp = DIEM_TU}) => {
  const tl = lui([x0, yMat], sau, vp);
  const tr = lui([x1, yMat], sau, vp);
  const br = lui([x1, yMat + day], sau, vp);
  const chanSauX = tr[0] - chan;
  const chanSauDay = lui([x1, 0], sau, vp)[1];
  return (
    <>
      {/* chân sau bên phải, thấy qua khoảng hở */}
      {vp[0] > x1 && <Hop x={chanSauX} y={br[1]} w={chan} h={chanSauDay - br[1]} />}
      {/* mặt bên tấm chắn */}
      {vp[0] > x1 && <Net d={daGiac([x1, yMat], tr, br, [x1, yMat + day])} />}
      {/* mặt trên */}
      <Net d={daGiac([x0, yMat], [x1, yMat], tr, tl)} />
      {/* tấm chắn trước */}
      <Hop x={x0} y={yMat} w={x1 - x0} h={day} />
      {/* hai chân trước */}
      <Hop x={x0 + 4} y={yMat + day} w={chan} h={-(yMat + day)} />
      <Hop x={x1 - 4 - chan} y={yMat + day} w={chan} h={-(yMat + day)} />
    </>
  );
};
