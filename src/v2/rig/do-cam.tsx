import React from 'react';
import {MUC, NEN} from './hinh';

/**
 * Đồ cầm tay — prop nhỏ gắn vào bàn tay, vẽ NGAY TRONG RIG (không import
 * src/v2/props để tránh phụ thuộc vòng). Nét đen không tô, cỡ theo DAU.
 *
 * Hệ toạ độ vẽ = hệ cổ tay của BanTay: gốc (0,0) là điểm cầm (giữa nắm tay),
 * +y là hướng cẳng tay chạy tiếp ra đầu ngón, +x vuông góc. Người gọi đã xoay
 * theo cẳng tay (`huong`), nên mỗi prop chỉ khai cách nằm:
 *   - 'doc'  : dọc theo cẳng tay, phần chính ở +y (kiếm, ô, micro, điện thoại)
 *   - 'ngang': vắt ngang nắm tay, đầu làm việc ở -x (bút, phấn, thước)
 *   - 'dung' : luôn thẳng đứng theo thế giới, không xoay theo tay (ly, sách, thư)
 * Mọi số là hệ số DAU; `dai` là chiều dài tổng để validator/agent ước cỡ.
 */
export type CachNam = 'doc' | 'ngang' | 'dung';

export type DoCamVeProps = {
  /** DAU px */
  d: number;
  net: number;
};

export type MetaDoCam = {
  /** chiều dài tổng (hệ số DAU) */
  dai: number;
  nam: CachNam;
  moTa: string;
  Ve: React.FC<DoCamVeProps>;
};

const S = (net: number) => ({fill: NEN, stroke: MUC, strokeWidth: net, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const});
const L = (net: number) => ({fill: 'none', stroke: MUC, strokeWidth: net, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const});

/** bút bi: thân dài, đầu nhọn ở -x, nắp ở +x */
const But: React.FC<DoCamVeProps> = ({d, net}) => {
  const w = 0.045 * d;
  return (
    <g>
      <path d={`M ${-0.2 * d} ${-w / 2} H ${0.1 * d} a ${w / 2} ${w / 2} 0 0 1 0 ${w} H ${-0.2 * d} z`} {...S(net)} />
      <path d={`M ${-0.2 * d} ${-w / 2} L ${-0.25 * d} 0 L ${-0.2 * d} ${w / 2}`} {...S(net)} />
      <line x1={0.06 * d} y1={-w / 2} x2={0.06 * d} y2={w / 2} stroke={MUC} strokeWidth={net * 0.8} />
    </g>
  );
};

/** phấn: que ngắn, đầu viết ở -x */
const Phan: React.FC<DoCamVeProps> = ({d, net}) => {
  const w = 0.035 * d;
  return <path d={`M ${-0.08 * d} ${-w / 2} H ${0.04 * d} a ${w / 2} ${w / 2} 0 0 1 0 ${w} H ${-0.08 * d} a ${w / 2} ${w / 2} 0 0 1 0 ${-w} z`} {...S(net)} />;
};

/** điện thoại: khối dọc bo góc, có gạch loa */
const DienThoai: React.FC<DoCamVeProps> = ({d, net}) => {
  const w = 0.13 * d;
  const h = 0.28 * d;
  const r = 0.02 * d;
  return (
    <g>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={r} {...S(net)} />
      <line x1={-0.025 * d} y1={h / 2 - 0.03 * d} x2={0.025 * d} y2={h / 2 - 0.03 * d} stroke={MUC} strokeWidth={net * 0.8} strokeLinecap="round" />
    </g>
  );
};

/** ly trà sữa: cốc hơi thon, nắp, ống hút, vài chấm trân châu */
const LyTraSua: React.FC<DoCamVeProps> = ({d, net}) => {
  const h = 0.24 * d;
  const wT = 0.16 * d;
  const wD = 0.12 * d;
  const y0 = 0.1 * d; // đáy dưới điểm cầm một chút
  return (
    <g>
      <path d={`M ${-wT / 2} ${y0 - h} L ${-wD / 2} ${y0} L ${wD / 2} ${y0} L ${wT / 2} ${y0 - h} z`} {...S(net)} />
      <line x1={-wT / 2 - 0.01 * d} y1={y0 - h} x2={wT / 2 + 0.01 * d} y2={y0 - h} stroke={MUC} strokeWidth={net} strokeLinecap="round" />
      <line x1={0.02 * d} y1={y0 - h} x2={0.05 * d} y2={y0 - h - 0.09 * d} stroke={MUC} strokeWidth={net} strokeLinecap="round" />
      {[[-0.03, -0.04], [0.02, -0.03], [-0.005, -0.075]].map(([px, py], i) => (
        <circle key={i} cx={px * d} cy={y0 + py * d} r={0.012 * d} fill={MUC} />
      ))}
    </g>
  );
};

/** sách: khối chữ nhật đứng, gáy bên -x, vài gạch trang */
const Sach: React.FC<DoCamVeProps> = ({d, net}) => {
  const w = 0.28 * d;
  const h = 0.36 * d;
  const y0 = 0.08 * d;
  return (
    <g>
      <rect x={-w / 2} y={y0 - h} width={w} height={h} {...S(net)} />
      <line x1={-w / 2 + 0.04 * d} y1={y0 - h} x2={-w / 2 + 0.04 * d} y2={y0} stroke={MUC} strokeWidth={net * 0.8} />
      <line x1={-0.04 * d} y1={y0 - h * 0.7} x2={0.09 * d} y2={y0 - h * 0.7} stroke={MUC} strokeWidth={net * 0.7} strokeLinecap="round" />
      <line x1={-0.04 * d} y1={y0 - h * 0.55} x2={0.09 * d} y2={y0 - h * 0.55} stroke={MUC} strokeWidth={net * 0.7} strokeLinecap="round" />
    </g>
  );
};

/** thước kẻ: thanh dài có khấc */
const Thuoc: React.FC<DoCamVeProps> = ({d, net}) => {
  const w = 0.06 * d;
  const x0 = -0.3 * d;
  const x1 = 0.15 * d;
  return (
    <g>
      <rect x={x0} y={-w / 2} width={x1 - x0} height={w} {...S(net)} />
      {[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((t) => {
        const xx = x0 + (x1 - x0) * t;
        const dai = t === 0.5 ? w * 0.6 : w * 0.35;
        return <line key={t} x1={xx} y1={-w / 2} x2={xx} y2={-w / 2 + dai} stroke={MUC} strokeWidth={net * 0.7} />;
      })}
    </g>
  );
};

/** kiếm giấy: lưỡi dọc ở +y ... không, lưỡi chạy ra +y từ cán; chuôi ngang ở gốc */
const Kiem: React.FC<DoCamVeProps> = ({d, net}) => {
  const w = 0.07 * d;
  const dai = 0.5 * d;
  return (
    <g>
      <path d={`M ${-w / 2} ${0.04 * d} L ${-w / 2} ${0.04 * d + dai - 0.08 * d} L 0 ${0.04 * d + dai} L ${w / 2} ${0.04 * d + dai - 0.08 * d} L ${w / 2} ${0.04 * d} z`} {...S(net)} />
      <line x1={0} y1={0.06 * d} x2={0} y2={0.04 * d + dai - 0.1 * d} stroke={MUC} strokeWidth={net * 0.7} />
      <rect x={-0.11 * d} y={0.02 * d} width={0.22 * d} height={0.04 * d} rx={0.01 * d} {...S(net)} />
      <rect x={-0.025 * d} y={-0.08 * d} width={0.05 * d} height={0.1 * d} rx={0.01 * d} {...S(net)} />
    </g>
  );
};

/** ô: cán ở gốc, mái ô ở +y (giơ lên trời) */
const O: React.FC<DoCamVeProps> = ({d, net}) => {
  const R = 0.3 * d;
  const yM = 0.55 * d;
  return (
    <g>
      <line x1={0} y1={-0.1 * d} x2={0} y2={yM} stroke={MUC} strokeWidth={net} strokeLinecap="round" />
      <path d={`M ${-0.1 * d} ${-0.1 * d} a ${0.05 * d} ${0.05 * d} 0 0 0 ${0.1 * d} 0`} {...L(net)} />
      <path
        d={`M ${-R} ${yM} q ${R * 0.25} ${0.05 * d} ${R * 0.5} 0 q ${R * 0.25} ${0.05 * d} ${R * 0.5} 0 q ${R * 0.25} ${0.05 * d} ${R * 0.5} 0 q ${R * 0.25} ${0.05 * d} ${R * 0.5} 0 Q ${R * 0.7} ${yM + 0.02 * d} 0 ${yM + 0.16 * d} Q ${-R * 0.7} ${yM + 0.02 * d} ${-R} ${yM} z`}
        {...S(net)}
      />
      <line x1={0} y1={yM + 0.16 * d} x2={0} y2={yM + 0.2 * d} stroke={MUC} strokeWidth={net} strokeLinecap="round" />
    </g>
  );
};

/** lá thư: phong bì nằm, nắp chữ V */
const LaThu: React.FC<DoCamVeProps> = ({d, net}) => {
  const w = 0.24 * d;
  const h = 0.16 * d;
  return (
    <g>
      <rect x={-w / 2} y={-h * 0.8} width={w} height={h} {...S(net)} />
      <path d={`M ${-w / 2} ${-h * 0.8} L 0 ${-h * 0.2} L ${w / 2} ${-h * 0.8}`} {...L(net * 0.9)} />
    </g>
  );
};

/** micro: cán dọc, đầu tròn ở +y có vài gạch lưới */
const Micro: React.FC<DoCamVeProps> = ({d, net}) => {
  const r = 0.07 * d;
  const yD = 0.2 * d;
  return (
    <g>
      <path d={`M ${-0.03 * d} ${-0.06 * d} L ${-0.04 * d} ${yD - r * 0.6} L ${0.04 * d} ${yD - r * 0.6} L ${0.03 * d} ${-0.06 * d} z`} {...S(net)} />
      <circle cx={0} cy={yD} r={r} {...S(net)} />
      <line x1={-r * 0.7} y1={yD - r * 0.3} x2={r * 0.7} y2={yD - r * 0.3} stroke={MUC} strokeWidth={net * 0.6} />
      <line x1={-r * 0.85} y1={yD + r * 0.15} x2={r * 0.85} y2={yD + r * 0.15} stroke={MUC} strokeWidth={net * 0.6} />
    </g>
  );
};

/**
 * Danh mục đồ cầm — khoá là tên agent ghi vào `cam`. Mỗi mục một dòng để
 * pipeline/thu-vien-v2.mjs đọc được JSDoc làm mô tả.
 */
export const DO_CAM: Record<string, MetaDoCam> = {
  /** bút bi dài 0.35 DAU, vắt ngang nắm tay, đầu bút chỉ xuống khi tay đưa ra trước */
  but: {dai: 0.35, nam: 'ngang', moTa: 'bút bi', Ve: But},
  /** viên phấn 0.12 DAU, vắt ngang nắm tay — đi với tư thế vietBang */
  phan: {dai: 0.12, nam: 'ngang', moTa: 'viên phấn', Ve: Phan},
  /** điện thoại 0.28 DAU, dọc theo cẳng tay — camDT áp lên tai, tay giơ trước mặt là đang xem */
  'dien-thoai': {dai: 0.28, nam: 'doc', moTa: 'điện thoại', Ve: DienThoai},
  /** ly trà sữa 0.3 DAU, luôn đứng thẳng, ống hút lệch phải */
  'ly-tra-sua': {dai: 0.3, nam: 'dung', moTa: 'ly trà sữa', Ve: LyTraSua},
  /** cuốn sách 0.4 DAU, cầm mép dưới, luôn đứng thẳng */
  sach: {dai: 0.4, nam: 'dung', moTa: 'cuốn sách', Ve: Sach},
  /** thước kẻ 0.45 DAU, vắt ngang nắm tay */
  thuoc: {dai: 0.45, nam: 'ngang', moTa: 'thước kẻ', Ve: Thuoc},
  /** kiếm giấy 0.6 DAU, lưỡi chạy tiếp hướng cẳng tay — gioTay là giơ kiếm, chi là chĩa kiếm */
  kiem: {dai: 0.6, nam: 'doc', moTa: 'kiếm giấy', Ve: Kiem},
  /** ô 0.7 DAU, mái ô ở đầu cẳng tay — tay giơ lên là che mưa */
  o: {dai: 0.7, nam: 'doc', moTa: 'cái ô', Ve: O},
  /** lá thư 0.24 DAU, phong bì nằm, luôn đứng thẳng */
  'la-thu': {dai: 0.24, nam: 'dung', moTa: 'lá thư', Ve: LaThu},
  /** micro 0.3 DAU, đầu micro ở đầu cẳng tay — camDT đưa lên miệng */
  micro: {dai: 0.3, nam: 'doc', moTa: 'micro', Ve: Micro},
};

export const TEN_DO_CAM = Object.keys(DO_CAM);

/**
 * Vẽ đồ cầm tại cổ tay (x, y) với hướng bàn tay `huong` (độ, cùng quy ước BanTay:
 * 0 = xuống, 90 = sang phải màn). Trả null nếu tên không có trong DO_CAM.
 * Gọi TRƯỚC BanTay để nắm tay đè lên giữa prop → đọc là "đang cầm".
 */
export const DoCam: React.FC<{ten: string; dau: number; x: number; y: number; huong: number; net: number}> = ({ten, dau: d, x, y, huong, net}) => {
  const m = DO_CAM[ten];
  if (!m) return null;
  // điểm cầm nằm giữa nắm tay (BanTay 'cam': lỗ ở y = 0.085 * 0.2 DAU)
  const tam = 0.017 * d;
  const xoay = m.nam === 'dung' ? 0 : -huong;
  return (
    <g transform={`translate(${x} ${y}) rotate(${xoay}) translate(0 ${m.nam === 'dung' ? 0 : tam})`}>
      <m.Ve d={d} net={net} />
    </g>
  );
};
