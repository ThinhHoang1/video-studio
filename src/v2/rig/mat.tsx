import React, {useId} from 'react';
import {GocNhin, MAT, MUC, NEN} from './hinh';
import type {PhongCach} from './kieu';

export type KieuMat = NonNullable<PhongCach['mat']>;

/**
 * Mắt và lông mày — 9 trạng thái mắt đo được từ tham chiếu (faces.jpg).
 *
 * Nguyên tắc: mặc định là MỘT oval đen đặc. Không lòng trắng, không con ngươi,
 * không highlight, không viền — thêm bất kỳ lớp nào là mặt đọc thành đeo kính.
 * Lông mày mặc định KHÔNG vẽ; mép mái tóc làm đường mày. Mày chỉ hiện khi sắc
 * thái cần (tức, lo, nhíu).
 */
export type TrangThaiMat =
  | 'oval' // E1 — nói, mặc định
  | 'nho' // E2 — bình thản, toàn thân
  | 'cham' // E3 — bé, ngại, nhân vật phụ
  | 'soc' // E4 — lòng trắng + ngươi chấm
  | 'soc-lon' // E4 ×1.3 — "what."
  | 'khe' // E5 — bực, gắt: khe ngang + gạch mí
  | 'cung' // E6 — nhắm vui ^ ^
  | 'gach' // E7 — gạch dọc (phụ)
  | 'xoan' // E8 — nguệch ngoạc (xấu hổ tột độ)
  | 'chan' // E9 — oval bị mí cắt 40%
  | 'nham'; // nhắm — gạch ngang (chớp / ngủ)

export type TrangThaiMay = 'khong' | 'tuc' | 'lo' | 'nhiu';

type P = {
  dau: number;
  cx: number;
  cy: number;
  net: number;
  mat: TrangThaiMat;
  may?: TrangThaiMay;
  /** hướng nhìn -1..1 — dịch cả hai mắt theo x */
  nhin?: number;
  /** góc nhìn đầu: 3/4 dịch mặt về phía trước, mắt xa nhỏ 15%; nghiêng chỉ một mắt */
  goc?: GocNhin;
  /** mặt quay về -x (Dau đứng riêng có flip); trong NhanVat luôn false vì cả nhóm đã lật */
  lat?: boolean;
  /** id ổn định cho clipPath (mỗi nhân vật một) */
  id?: string;
  /** kiểu mắt mở (PhongCach.mat) — đổi hình của oval / nho / chan; các trạng thái cảm xúc khác giữ nguyên */
  kieu?: KieuMat;
};

/**
 * Vị trí mắt theo góc nhìn — hệ đầu (tâm sọ = 0), hệ số DAU, f = hướng mặt (+1 = phải màn).
 * `co` là hệ số cỡ mắt (mắt xa ở 3/4 nhỏ 0.85), `ben` là bên của mắt để mày/ngươi lệch đúng.
 */
export const viTriMat = (goc: GocNhin, f: 1 | -1): {x: number; co: number; ben: 1 | -1}[] => {
  switch (goc) {
    case 'truoc':
      return [
        {x: -MAT.x, co: 1, ben: -1},
        {x: MAT.x, co: 1, ben: 1},
      ];
    case 'ba-phan-tu':
      return [
        {x: -0.1 * f, co: 0.85, ben: (-1 * f) as 1 | -1},
        {x: 0.3 * f, co: 1, ben: f},
      ];
    case 'nghieng':
      return [{x: 0.2 * f, co: 1, ben: f}];
    case 'sau':
      return [];
  }
};

/**
 * Mắt mở cơ bản theo kiểu (PhongCach.mat), hệ số `co` thu nhỏ (E2 'nho' dùng 0.55).
 *   oval       : oval đen đặc 0.07×0.12 (gốc)
 *   hat-dau    : ellipse đặc nghiêng 12° (đầu ngoài cao hơn), một khe sáng nhỏ ở góc trên trong
 *   tron-nguoi : vòng tròn viền r 0.11 + ngươi đặc 60%
 *   lech       : oval tròn hơn; mắt bên -1 nhỏ 0.8 (ngược lại lệch tự nhiên khi 3/4)
 */
const MatMo: React.FC<{x: number; y: number; d: number; net: number; kieu: KieuMat; ben: 1 | -1; co?: number; clip?: string}> = ({x, y, d, net, kieu, ben, co = 1, clip}) => {
  const cp = clip ? `url(#${clip})` : undefined;
  switch (kieu) {
    case 'oval':
      return <ellipse cx={x} cy={y} rx={0.07 * d * co} ry={0.12 * d * co} fill={MUC} clipPath={cp} />;
    case 'hat-dau': {
      const rx = 0.075 * d * co;
      const ry = 0.115 * d * co;
      return (
        <g clipPath={cp}>
          <g transform={`rotate(${12 * ben} ${x} ${y})`}>
            <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={MUC} />
            <ellipse cx={x - 0.025 * d * co * ben} cy={y - 0.05 * d * co} rx={0.014 * d * co} ry={0.03 * d * co} fill={NEN} />
          </g>
        </g>
      );
    }
    case 'tron-nguoi': {
      const r = 0.11 * d * co;
      return (
        <g clipPath={cp}>
          <circle cx={x} cy={y} r={r} fill={NEN} stroke={MUC} strokeWidth={net} />
          <circle cx={x + 0.008 * d * ben} cy={y + 0.01 * d * co} r={r * 0.6} fill={MUC} />
        </g>
      );
    }
    case 'lech': {
      const s = (ben === -1 ? 0.8 : 1) * co;
      return <ellipse cx={x} cy={y - (ben === -1 ? 0.015 : 0) * d} rx={0.085 * d * s} ry={0.115 * d * s} fill={MUC} clipPath={cp} />;
    }
  }
};

const MotMat: React.FC<{x: number; y: number; d: number; net: number; mat: TrangThaiMat; ben: 1 | -1; clip: string; kieu: KieuMat}> = ({
  x,
  y,
  d,
  net,
  mat,
  ben,
  clip,
  kieu,
}) => {
  const rx = 0.07 * d;
  const ry = 0.12 * d;
  switch (mat) {
    case 'oval':
      return <MatMo x={x} y={y} d={d} net={net} kieu={kieu} ben={ben} />;
    case 'nho':
      return <MatMo x={x} y={y} d={d} net={net} kieu={kieu} ben={ben} co={0.55} />;
    case 'cham':
      return <circle cx={x} cy={y} r={0.025 * d} fill={MUC} />;
    case 'soc':
    case 'soc-lon': {
      // tron-nguoi: lòng trắng thường ngày đã là vòng tròn → sốc phải to hơn 15% mới đọc ra khác
      const k = (mat === 'soc-lon' ? 1.3 : 1) * (kieu === 'tron-nguoi' ? 1.15 : 1);
      return (
        <g>
          <ellipse cx={x} cy={y} rx={0.15 * d * k} ry={0.12 * d * k} fill={NEN} stroke={MUC} strokeWidth={net} />
          <circle cx={x + 0.02 * d * ben} cy={y + 0.01 * d} r={0.02 * d} fill={MUC} />
        </g>
      );
    }
    case 'khe':
      return (
        <g>
          <ellipse cx={x} cy={y + 0.02 * d} rx={0.11 * d} ry={0.04 * d} fill={NEN} stroke={MUC} strokeWidth={net} />
          <line x1={x - 0.12 * d} y1={y - 0.03 * d} x2={x + 0.12 * d} y2={y - 0.03 * d} stroke={MUC} strokeWidth={net * 0.7} strokeLinecap="round" />
          <circle cx={x} cy={y + 0.02 * d} r={0.018 * d} fill={MUC} />
        </g>
      );
    case 'cung': {
      const w = 0.14 * d;
      const h = 0.06 * d;
      return (
        <path
          d={`M ${x - w / 2} ${y + h / 2} Q ${x} ${y - h} ${x + w / 2} ${y + h / 2}`}
          fill="none"
          stroke={MUC}
          strokeWidth={net}
          strokeLinecap="round"
        />
      );
    }
    case 'gach':
      return <line x1={x} y1={y - 0.05 * d} x2={x} y2={y + 0.05 * d} stroke={MUC} strokeWidth={net} strokeLinecap="round" />;
    case 'xoan': {
      const s = 0.04 * d;
      return (
        <path
          d={`M ${x - s} ${y} c ${s * 0.6} ${-s * 1.4} ${s * 1.6} ${-s * 0.4} ${s * 0.4} ${s * 0.5} c ${-s} ${s * 0.8} ${-s * 1.8} ${-s * 0.2} ${-s * 0.6} ${-s * 0.9} c ${s * 0.8} ${-s * 0.5} ${s * 1.4} ${s * 0.6} ${s * 0.3} ${s * 1.1}`}
          fill="none"
          stroke={MUC}
          strokeWidth={net * 0.8}
          strokeLinecap="round"
        />
      );
    }
    case 'chan':
      return (
        <g>
          <MatMo x={x} y={y} d={d} net={net} kieu={kieu} ben={ben} clip={clip} />
          <line x1={x - rx * 1.5} y1={y - ry * 0.2} x2={x + rx * 1.5} y2={y - ry * 0.2} stroke={MUC} strokeWidth={net * 0.9} strokeLinecap="round" />
        </g>
      );
    case 'nham':
      return <line x1={x - 0.07 * d} y1={y + 0.02 * d} x2={x + 0.07 * d} y2={y + 0.02 * d} stroke={MUC} strokeWidth={net} strokeLinecap="round" />;
  }
};

const May: React.FC<{x: number; y: number; d: number; net: number; may: TrangThaiMay; ben: 1 | -1}> = ({x, y, d, net, may, ben}) => {
  const w = 0.16 * d;
  switch (may) {
    case 'khong':
      return null;
    case 'tuc':
      // gạch chéo dày, đầu trong thấp hơn — cắt vào đỉnh oval
      return (
        <line
          x1={x - (w / 2) * ben}
          y1={y - 0.06 * d}
          x2={x + (w / 2) * ben}
          y2={y - 0.13 * d}
          stroke={MUC}
          strokeWidth={net * 1.5}
          strokeLinecap="round"
        />
      );
    case 'lo':
      return (
        <path
          d={`M ${x - w / 2} ${y - 0.17 * d} Q ${x} ${y - 0.25 * d} ${x + w / 2} ${y - 0.18 * d}`}
          fill="none"
          stroke={MUC}
          strokeWidth={net * 1.2}
          strokeLinecap="round"
        />
      );
    case 'nhiu': {
      const y0 = y - 0.18 * d;
      const s = w / 4;
      return (
        <path
          d={`M ${x - w / 2} ${y0} q ${s / 2} ${-s * 0.6} ${s} 0 t ${s} 0 t ${s} 0 t ${s} 0`}
          fill="none"
          stroke={MUC}
          strokeWidth={net * 1.2}
          strokeLinecap="round"
        />
      );
    }
  }
};

export const Mat: React.FC<P> = ({dau: d, cx, cy, net, mat, may = 'khong', nhin = 0, goc = 'truoc', lat, id, kieu = 'oval'}) => {
  const auto = useId();
  const clip = `mi-${(id ?? auto).replace(/[^a-zA-Z0-9]/g, '')}`;
  const y = cy + MAT.y * d;
  const lech = nhin * MAT.lechNhin * d;
  const f: 1 | -1 = lat ? -1 : 1;
  const xs = viTriMat(goc, f);
  if (!xs.length) return null;
  return (
    <g>
      <defs>
        <clipPath id={clip}>
          <rect x={cx - d} y={y - 0.12 * d * 0.2} width={2 * d} height={d} />
        </clipPath>
      </defs>
      {xs.map(({x, co, ben}, i) => (
        <g key={i}>
          <MotMat x={cx + x * d + lech} y={y} d={d * co} net={net} mat={mat} ben={ben} clip={clip} kieu={kieu} />
          <May x={cx + x * d + lech} y={y} d={d * co} net={net} may={may} ben={ben} />
        </g>
      ))}
    </g>
  );
};

/** má đỏ (2 gạch chéo) / giọt mồ hôi — phụ kiện biểu cảm */
export const PhuKienMat: React.FC<{dau: number; cx: number; cy: number; net: number; ma?: boolean; moHoi?: boolean; goc?: GocNhin; lat?: boolean}> = ({
  dau: d,
  cx,
  cy,
  net,
  ma,
  moHoi,
  goc = 'truoc',
  lat,
}) => {
  const f = lat ? -1 : 1;
  // má: 3/4 dịch theo mặt, nghiêng chỉ má trước; mồ hôi: nghiêng đặt sau gáy để không đè mũi
  const lechMa = goc === 'ba-phan-tu' ? 0.12 * f : 0;
  const ben = goc === 'nghieng' ? [f * 0.55] : goc === 'sau' ? [] : [-1, 1];
  const xMoHoi = goc === 'nghieng' ? cx - 0.45 * f * d : cx + 0.52 * d;
  return (
    <g>
      {ma &&
        ben.map((b) => (
          <g key={b}>
            <line x1={cx + (lechMa + b * 0.3) * d} y1={cy + 0.2 * d} x2={cx + (lechMa + b * 0.34) * d} y2={cy + 0.26 * d} stroke={MUC} strokeWidth={net * 0.7} strokeLinecap="round" />
            <line x1={cx + (lechMa + b * 0.36) * d} y1={cy + 0.19 * d} x2={cx + (lechMa + b * 0.4) * d} y2={cy + 0.25 * d} stroke={MUC} strokeWidth={net * 0.7} strokeLinecap="round" />
          </g>
        ))}
      {moHoi && (
        <path
          d={`M ${xMoHoi} ${cy - 0.18 * d} q ${0.05 * d} ${0.08 * d} 0 ${0.11 * d} q ${-0.05 * d} ${-0.03 * d} 0 ${-0.11 * d} z`}
          fill={NEN}
          stroke={MUC}
          strokeWidth={net * 0.8}
          strokeLinejoin="round"
        />
      )}
    </g>
  );
};
