import React from 'react';
import {MUC, NEN, GocNhin} from './hinh';

/**
 * BỘ PHẬN THÚ — tai, mõm, sừng, đuôi lắp lên ĐÚNG bộ xương người đang có.
 *
 * Vì sao làm kiểu lắp ghép chứ không vẽ rig riêng cho từng con: kênh tham chiếu
 * (Monsieur Tuna) không vẽ động vật giải phẫu đúng — cá sấu của anh ta vẫn đứng
 * hai chân, vẫn mặc quần áo, vẫn có bàn tay người. Cái làm người xem nhận ra
 * "con cá sấu" chỉ là BA thứ: cái mõm dài, hàng răng, và màu thân. Vẽ lại cả bộ
 * xương cho mỗi loài là tốn công vào chỗ khán giả không nhìn.
 *
 * Hệ toạ độ: hệ ĐẦU, gốc là tâm sọ (cx, cy), đơn vị là `d` = bề rộng sọ px.
 * `f` = 1 khi mặt quay phải, -1 khi lật. Mọi bộ phận đều tô NỀN trắng + viền
 * đen như phần còn lại của rig — chỉ `mau` mới tô màu, và chỉ khi board khai.
 */

export type TaiThu = 'tron' | 'nhon' | 'dai' | 'cup';
export type MomThu = 'ngan' | 'dai' | 'mo';
export type SungThu = 'sung' | 'mao' | 'gac';

export type Thu = {
  /** tai thú vẽ đè lên mép sọ — thứ đọc ra loài nhanh nhất ở cỡ nhỏ */
  tai?: TaiThu;
  /** mõm nhô ra phía trước mặt (mo = mỏ chim) */
  mom?: MomThu;
  /** răng nhọn viền dưới mõm dài — cá sấu, cá mập */
  rang?: boolean;
  sung?: SungThu;
  /** đuôi vẽ sau thân, ở hệ THÂN chứ không phải hệ đầu */
  duoi?: 'ngan' | 'dai' | 'xu' | 'cong';
  /** màu lông: tô sọ + tai + mõm. Bỏ trống = trắng như người */
  mauLong?: string;
  /** đốm/sọc trên sọ — mèo, hổ, bò sữa */
  van?: 'khong' | 'soc' | 'dom';
};

/** Tai thú — vẽ TRƯỚC sọ để sọ đè mất phần chân tai (không thấy khớp). */
export const TaiThuVe: React.FC<{
  dau: number;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  net: number;
  kieu: TaiThu;
  mau?: string;
  goc: GocNhin;
  f: 1 | -1;
}> = ({dau: d, cx, cy, rx, ry, net: n, kieu, mau, goc, f}) => {
  if (goc === 'sau') return null;
  const to = mau ?? NEN;
  // hai tai đặt trên đỉnh sọ, lệch ±0.62 rx; ở góc nghiêng chỉ thấy tai gần
  const cho: number[] = goc === 'nghieng' ? [-0.45 * f] : [-0.62, 0.62];
  const dinh = cy - ry * 0.82;

  return (
    <g fill={to} stroke={MUC} strokeWidth={n} strokeLinejoin="round">
      {cho.map((s, i) => {
        const x = cx + s * rx;
        switch (kieu) {
          case 'tron':
            return <circle key={i} cx={x} cy={dinh} r={0.23 * d} />;
          case 'nhon': {
            // tam giác hơi ngả ra ngoài; đỉnh cao 0.46 d
            const w = 0.2 * d;
            const h = 0.46 * d;
            const nga = Math.sign(s || 1) * 0.06 * d;
            return (
              <path
                key={i}
                d={`M ${x - w} ${dinh + 0.1 * d} L ${x + nga} ${dinh - h} L ${x + w} ${dinh + 0.1 * d} Z`}
              />
            );
          }
          case 'dai':
            // tai thỏ: ellipse cao, hơi xoè
            return (
              <ellipse
                key={i}
                cx={x}
                cy={dinh - 0.34 * d}
                rx={0.12 * d}
                ry={0.42 * d}
                transform={`rotate(${Math.sign(s || 1) * 12} ${x} ${dinh})`}
              />
            );
          case 'cup': {
            // tai chó cụp: bắt đầu ở đỉnh, đổ xuống dọc má
            const huong = Math.sign(s || 1);
            return (
              <path
                key={i}
                d={`M ${x} ${dinh} q ${huong * 0.26 * d} ${0.05 * d} ${huong * 0.22 * d} ${0.42 * d} q ${-huong * 0.16 * d} ${0.1 * d} ${-huong * 0.22 * d} ${-0.12 * d} Z`}
              />
            );
          }
          default:
            return null;
        }
      })}
    </g>
  );
};

/**
 * Mõm — vẽ SAU sọ, đè lên nửa dưới mặt. Ở góc trước mõm nhô thẳng xuống dưới;
 * ở nghiêng/ba-phần-tư nó chìa về hướng mặt (đó là lúc con vật đọc ra rõ nhất,
 * nên board nên ưu tiên góc nghiêng cho thú).
 */
export const MomVe: React.FC<{
  dau: number;
  cx: number;
  cy: number;
  net: number;
  kieu: MomThu;
  rang?: boolean;
  mau?: string;
  goc: GocNhin;
  f: 1 | -1;
}> = ({dau: d, cx, cy, net: n, kieu, rang, mau, goc, f}) => {
  if (goc === 'sau') return null;
  const to = mau ?? NEN;
  const truoc = goc === 'truoc';
  // Mõm phải nằm DƯỚI MẮT, ôm lấy miệng — không phải giữa mặt.
  // Bản đầu đặt tâm mõm ở cy+0.2d với ry 0.3d nên nó trùm lên cả hai mắt: con vật
  // trông như đeo mặt nạ, và mắt thành hai vòng tròn nổi trên mõm. Hạ xuống
  // 0.3d và thu ry còn 0.2d thì mõm ôm đúng vùng miệng, mắt ở trên sạch sẽ.
  const mx = cx + (truoc ? 0 : 0.2 * f * d);
  const my = cy + 0.3 * d;

  if (kieu === 'mo') {
    // mỏ chim: hai tam giác khép
    const w = 0.3 * d;
    return (
      <g fill={mau ?? '#f2a93b'} stroke={MUC} strokeWidth={n} strokeLinejoin="round">
        <path d={`M ${mx - 0.06 * d * f} ${my - 0.08 * d} L ${mx + w * f} ${my + 0.04 * d} L ${mx - 0.06 * d * f} ${my + 0.12 * d} Z`} />
      </g>
    );
  }

  const dai = kieu === 'dai' ? 0.62 : 0.3;
  const cao = kieu === 'dai' ? 0.2 : 0.22;

  return (
    <g>
      {truoc ? (
        // Nhìn thẳng: mõm dài thu thành một khối BỀ NGANG (thấy chiều rộng, không
        // thấy chiều dài) — đó là lý do board nên quay thú ở góc nghiêng.
        <ellipse cx={mx} cy={my + 0.06 * d} rx={(kieu === 'dai' ? 0.38 : 0.28) * d} ry={(cao + 0.06) * d} fill={to} stroke={MUC} strokeWidth={n} />
      ) : (
        // mõm chìa ngang: hộp bo tròn đầu mút
        <path
          d={`M ${mx - 0.55 * d * f} ${my - cao * 0.62 * d}
              L ${mx + (dai - 0.1) * d * f} ${my - cao * 0.42 * d}
              q ${0.14 * d * f} ${cao * 0.42 * d} 0 ${cao * 0.84 * d}
              L ${mx - 0.55 * d * f} ${my + cao * 0.62 * d} Z`}
          fill={to}
          stroke={MUC}
          strokeWidth={n}
          strokeLinejoin="round"
        />
      )}
      {/* chóp mũi đen — thứ duy nhất tô đặc, đọc ra "thú" ngay cả ở cỡ nhỏ */}
      <ellipse
        cx={truoc ? mx : mx + (dai - 0.06) * d * f}
        cy={truoc ? my - cao * 0.62 * d : my - cao * 0.24 * d}
        rx={0.09 * d}
        ry={0.07 * d}
        fill={MUC}
      />
      {rang && !truoc && (
        <g fill={NEN} stroke={MUC} strokeWidth={n * 0.7} strokeLinejoin="round">
          {[0.1, 0.28, 0.46].map((t, i) => {
            const x = mx + t * d * f;
            const y = my + cao * 0.5 * d;
            return <path key={i} d={`M ${x - 0.05 * d} ${y} L ${x} ${y + 0.13 * d} L ${x + 0.05 * d} ${y} Z`} />;
          })}
        </g>
      )}
    </g>
  );
};

/** Sừng / mào — vẽ sau tai, trước tóc. */
export const SungVe: React.FC<{
  dau: number;
  cx: number;
  cy: number;
  ry: number;
  net: number;
  kieu: SungThu;
  mau?: string;
  goc: GocNhin;
  f: 1 | -1;
}> = ({dau: d, cx, cy, ry, net: n, kieu, mau, goc, f}) => {
  if (goc === 'sau') return null;
  const dinh = cy - ry * 0.92;
  const to = mau ?? NEN;
  if (kieu === 'sung') {
    // một sừng giữa trán (kỳ lân) — nghiêng theo hướng mặt
    return (
      <path
        d={`M ${cx - 0.1 * d} ${dinh + 0.06 * d} L ${cx + 0.16 * d * f} ${dinh - 0.62 * d} L ${cx + 0.12 * d} ${dinh + 0.04 * d} Z`}
        fill={to}
        stroke={MUC}
        strokeWidth={n}
        strokeLinejoin="round"
      />
    );
  }
  if (kieu === 'mao') {
    // mào gà: ba múi trên đỉnh
    return (
      <path
        d={`M ${cx - 0.3 * d} ${dinh + 0.05 * d}
            q ${0.06 * d} ${-0.26 * d} ${0.2 * d} ${-0.04 * d}
            q ${0.06 * d} ${-0.28 * d} ${0.2 * d} ${-0.02 * d}
            q ${0.08 * d} ${-0.24 * d} ${0.2 * d} ${0.06 * d}
            Z`}
        fill={mau ?? '#e0483c'}
        stroke={MUC}
        strokeWidth={n}
        strokeLinejoin="round"
      />
    );
  }
  // gạc hươu: hai nhánh chĩa
  return (
    <g fill="none" stroke={MUC} strokeWidth={n * 1.1} strokeLinecap="round">
      {[-1, 1].map((s, i) => (
        <g key={i}>
          <path d={`M ${cx + s * 0.3 * d} ${dinh + 0.04 * d} L ${cx + s * 0.44 * d} ${dinh - 0.5 * d}`} />
          <path d={`M ${cx + s * 0.38 * d} ${dinh - 0.24 * d} L ${cx + s * 0.62 * d} ${dinh - 0.36 * d}`} />
        </g>
      ))}
    </g>
  );
};

/** Vằn/đốm trên sọ — chi tiết rẻ tiền nhất để hai con cùng loài không giống hệt nhau. */
export const VanVe: React.FC<{dau: number; cx: number; cy: number; rx: number; ry: number; net: number; kieu: 'soc' | 'dom'; goc: GocNhin}> = ({
  dau: d,
  cx,
  cy,
  rx,
  net: n,
  kieu,
  goc,
}) => {
  if (goc === 'sau') return null;
  if (kieu === 'soc') {
    return (
      <g fill="none" stroke={MUC} strokeWidth={n * 0.8} strokeLinecap="round">
        {[-0.42, 0, 0.42].map((s, i) => (
          <path key={i} d={`M ${cx + s * rx} ${cy - 0.42 * d} l ${0.06 * d} ${0.16 * d}`} />
        ))}
      </g>
    );
  }
  return (
    <g fill={MUC} opacity={0.18}>
      <circle cx={cx - 0.42 * rx} cy={cy - 0.2 * d} r={0.11 * d} />
      <circle cx={cx + 0.5 * rx} cy={cy - 0.34 * d} r={0.08 * d} />
    </g>
  );
};

/**
 * Đuôi — hệ THÂN: gốc (0,0) đặt ở hông, đơn vị `d`. Vẽ TRƯỚC thân để thân đè
 * mất chân đuôi.
 */
export const DuoiVe: React.FC<{dau: number; x: number; y: number; net: number; kieu: 'ngan' | 'dai' | 'xu' | 'cong'; mau?: string; f: 1 | -1}> = ({
  dau: d,
  x,
  y,
  net: n,
  kieu,
  mau,
  f,
}) => {
  const to = mau ?? NEN;
  // đuôi luôn ở phía SAU nhân vật = ngược hướng mặt
  const s = -f;
  if (kieu === 'xu') {
    // đuôi xù (sóc, cáo): ellipse to cong lên
    return (
      <ellipse
        cx={x + s * 0.42 * d}
        cy={y - 0.3 * d}
        rx={0.26 * d}
        ry={0.44 * d}
        transform={`rotate(${s * -24} ${x + s * 0.42 * d} ${y - 0.3 * d})`}
        fill={to}
        stroke={MUC}
        strokeWidth={n}
      />
    );
  }
  const dai = kieu === 'dai' ? 0.95 : kieu === 'cong' ? 0.7 : 0.42;
  const day = kieu === 'ngan' ? 0.14 : 0.1;
  const cong = kieu === 'cong' ? -0.55 : -0.2;
  return (
    <path
      d={`M ${x} ${y}
          q ${s * dai * 0.6 * d} ${cong * d} ${s * dai * d} ${cong * 0.6 * d}`}
      fill="none"
      stroke={MUC}
      strokeWidth={n + day * d}
      strokeLinecap="round"
    />
  );
};
