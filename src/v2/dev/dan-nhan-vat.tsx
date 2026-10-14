import React from 'react';
import {AbsoluteFill} from 'remotion';
import {NhanVat} from '../rig/nhan-vat';
import {KIEU, Kieu} from '../rig/kieu';
import {NEN, MUC} from '../rig/hinh';
import {FONT} from '../../engine/font';

/**
 * DÀN NHÂN VẬT — mỗi nhân vật trong `KIEU` một ô, xem toàn thân + cận mặt.
 *
 * Dùng để soi hình TRƯỚC khi dựng board, và để kiểm nhân vật tự khai
 * (`board.nhan_vat_tu_ve`) có ra đúng ý không:
 *
 *   node pipeline/xem-nhan-vat.mjs            → cả thư viện
 *   node pipeline/xem-nhan-vat.mjs <du-an>    → thư viện + nhân vật của dự án
 *
 * Vẽ ở hai góc (trước và nghiêng) vì thú chỉ đọc ra loài khi nhìn nghiêng —
 * cái mõm là thứ nói lên loài, mà nhìn thẳng thì mõm bị thu thành một khối tròn.
 */
export const DAN_W = 2400;

const CAO_O = 560;
const CUA_HANG = 4;

export const DanNhanVat: React.FC<{them?: Record<string, Kieu>}> = ({them}) => {
  const tatCa: [string, Kieu][] = [...Object.entries(KIEU), ...Object.entries(them ?? {})];
  const hang = Math.ceil(tatCa.length / CUA_HANG);
  const rongO = DAN_W / CUA_HANG;

  return (
    <AbsoluteFill style={{background: NEN, fontFamily: FONT}}>
      <svg width={DAN_W} height={hang * CAO_O} viewBox={`0 0 ${DAN_W} ${hang * CAO_O}`}>
        {tatCa.map(([ma, k], i) => {
          const cot = i % CUA_HANG;
          const dong = Math.floor(i / CUA_HANG);
          const x0 = cot * rongO;
          const y0 = dong * CAO_O;
          const laThu = Boolean(k.thu);
          return (
            <g key={ma}>
              <rect x={x0 + 6} y={y0 + 6} width={rongO - 12} height={CAO_O - 12} fill="none" stroke="#e2e2e2" strokeWidth={2} />
              {/* toàn thân, nhìn thẳng */}
              <NhanVat kieu={k} dau={86} x={x0 + rongO * 0.3} y={y0 + 430} dang="dung" id={`${ma}-t`} />
              {/* nghiêng: góc đọc ra loài rõ nhất */}
              <NhanVat kieu={k} dau={86} x={x0 + rongO * 0.68} y={y0 + 430} dang="chi" goc="nghieng" mieng="cuoi" id={`${ma}-n`} />
              <text x={x0 + rongO / 2} y={y0 + 490} textAnchor="middle" fontSize={30} fontWeight={800} fill={MUC}>
                {ma}
              </text>
              <text x={x0 + rongO / 2} y={y0 + 524} textAnchor="middle" fontSize={22} fill="#8a8a8a">
                {k.ten}
                {laThu ? ' · thú' : ''}
              </text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** chiều cao phụ thuộc số nhân vật — tính sẵn cho composition thư viện */
export const DAN_H = Math.ceil(Object.keys(KIEU).length / CUA_HANG) * CAO_O;

/**
 * MỘT nhân vật một ảnh — để dashboard xếp thành lưới thẻ bấm xem được.
 *
 * Bảng gộp `DanNhanVat` thu nhỏ trên màn thì mỗi con chỉ còn vài chục pixel,
 * nhìn không ra con gì. Thẻ riêng thì mỗi con chiếm trọn khung 480×560.
 */
export const MOT_W = 480;
export const MOT_H = 560;

export const MotNhanVat: React.FC<{ma?: string; them?: Record<string, Kieu>}> = ({ma = 'nam', them}) => {
  const k = them?.[ma] ?? KIEU[ma] ?? KIEU.trang;
  return (
    <AbsoluteFill style={{background: NEN, fontFamily: FONT}}>
      <svg width={MOT_W} height={MOT_H} viewBox={`0 0 ${MOT_W} ${MOT_H}`}>
        {/* toàn thân trái, nghiêng phải — thú chỉ đọc ra loài ở góc nghiêng */}
        <NhanVat kieu={k} dau={96} x={MOT_W * 0.3} y={430} dang="dung" id={`${ma}-m1`} />
        <NhanVat kieu={k} dau={96} x={MOT_W * 0.72} y={430} dang="chi" goc="nghieng" mieng="cuoi" id={`${ma}-m2`} />
        <text x={MOT_W / 2} y={496} textAnchor="middle" fontSize={34} fontWeight={800} fill={MUC}>
          {ma}
        </text>
        <text x={MOT_W / 2} y={530} textAnchor="middle" fontSize={24} fill="#8a8a8a">
          {k.ten}
          {k.thu ? ' · thú' : ''}
        </text>
      </svg>
    </AbsoluteFill>
  );
};
