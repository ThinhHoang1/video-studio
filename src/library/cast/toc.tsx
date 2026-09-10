import React from 'react';
import {DAU} from './than-hinh';
import {KieuToc} from './kieu';

/**
 * Kiểu tóc.
 *
 * Tóc là thứ phân biệt nhân vật nhanh nhất — nhìn bóng đầu là biết ai, kể cả
 * ở toàn cảnh khi mặt chỉ còn vài chục pixel. Nên đây là chỗ đáng đầu tư
 * nhất khi muốn "nhiều nhân vật" mà không phải vẽ lại toàn bộ.
 *
 * Mỗi kiểu vẽ ba lớp: khối ngoài → mảng tối → dải sáng cứng. Vẽ trong hệ toạ
 * độ của đầu, tâm sọ ở gốc.
 */

const R = DAU * 0.5;   // nửa bề ngang sọ
const C = DAU * 0.56;  // nửa chiều cao sọ

type Props = {mau: [string, string, string]; net: string; netDay: number; sau?: boolean};

/** Phần tóc vẽ SAU đầu (tóc dài rủ xuống lưng). */
export const TocSau: React.FC<Props & {kieu: KieuToc}> = ({kieu, mau, net, netDay}) => {
  const [chinh, toi] = mau;
  if (kieu === 'xoa-dai')
    return (
      <path
        d={`M${-R * 1.04},${-C * 0.4}
            C${-R * 1.5},${DAU * 0.7} ${-R * 1.2},${DAU * 1.5} ${-R * 0.9},${DAU * 1.9}
            L${R * 0.9},${DAU * 1.9}
            C${R * 1.2},${DAU * 1.5} ${R * 1.5},${DAU * 0.7} ${R * 1.04},${-C * 0.4} Z`}
        fill={toi}
        stroke={net}
        strokeWidth={netDay}
        strokeLinejoin="round"
      />
    );
  if (kieu === 'duoi-ngua')
    return (
      <path
        d={`M${R * 0.7},${-C * 0.8}
            C${R * 1.9},${-C * 0.7} ${R * 2.1},${DAU * 0.5} ${R * 1.5},${DAU * 1.5}
            C${R * 1.35},${DAU * 1.75} ${R * 1.05},${DAU * 1.7} ${R * 1.0},${DAU * 1.4}
            C${R * 1.35},${DAU * 0.6} ${R * 1.2},${-C * 0.1} ${R * 0.55},${-C * 0.3} Z`}
        fill={chinh}
        stroke={net}
        strokeWidth={netDay}
        strokeLinejoin="round"
      />
    );
  if (kieu === 'bui')
    return (
      <circle cx={R * 1.02} cy={-C * 0.55} r={DAU * 0.23} fill={toi} stroke={net} strokeWidth={netDay} />
    );
  if (kieu === 'bob')
    return (
      <path
        d={`M${-R * 1.06},${-C * 0.3} C${-R * 1.24},${DAU * 0.36} ${-R * 1.1},${DAU * 0.66} ${-R * 0.96},${DAU * 0.76}
            L${R * 0.96},${DAU * 0.76} C${R * 1.1},${DAU * 0.66} ${R * 1.24},${DAU * 0.36} ${R * 1.06},${-C * 0.3} Z`}
        fill={toi}
        stroke={net}
        strokeWidth={netDay}
        strokeLinejoin="round"
      />
    );
  return null;
};

/** Phần tóc vẽ TRƯỚC mặt: khối trên đỉnh + mái. */
export const TocTruoc: React.FC<Props & {kieu: KieuToc}> = ({kieu, mau, net, netDay}) => {
  const [chinh, toi, sang] = mau;
  const S = {stroke: net, strokeWidth: netDay, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};

  /** khối tóc ngoài, lớn hơn hộp sọ — dùng chung cho mọi kiểu */
  const khoi = (phong = 1.06) => (
    <>
      <path
        d={`M${-R * phong},${DAU * 0.06}
            C${-R * phong * 1.06},${-C * 1.3} ${R * phong * 1.06},${-C * 1.3} ${R * phong},${DAU * 0.06}
            C${R * 0.9},${-DAU * 0.2} ${R * 0.4},${-DAU * 0.34} ${R * 0.06},${-DAU * 0.28}
            C${-R * 0.4},${-DAU * 0.2} ${-R * 0.86},${-DAU * 0.12} ${-R * phong},${DAU * 0.06} Z`}
        fill={chinh}
        {...S}
      />
      <path
        d={`M${-R * phong},${DAU * 0.06}
            C${-R * phong * 1.06},${-C * 1.3} ${-R * 0.2},${-C * 1.34} ${-R * 0.24},${-DAU * 0.3}
            C${-R * 0.5},${-DAU * 0.2} ${-R * 0.86},${-DAU * 0.12} ${-R * phong},${DAU * 0.06} Z`}
        fill={toi}
      />
      <path
        d={`M${-R * 0.62},${-C * 0.78} q${R * 0.66},${-DAU * 0.16} ${R * 1.3},${DAU * 0.02}
            q${-R * 0.6},${-DAU * 0.03} ${-R * 1.24},${DAU * 0.14} Z`}
        fill={sang}
      />
    </>
  );

  if (kieu === 'ngan-mai')
    return (
      <g>
        {khoi()}
        {/* mái lệch: các múi nhọn rời, khe hở lộ trán */}
        {[
          [-0.74, -0.26, -0.42],
          [-0.3, -0.4, -0.02],
          [0.2, -0.38, 0.5],
          [0.62, -0.24, 0.88],
        ].map(([a, b, c], n) => (
          <path
            key={n}
            d={`M${R * a},${-C * 0.92} Q${R * ((a + c) / 2)},${DAU * b} ${R * c},${-C * 0.5} Z`}
            fill={n % 2 ? toi : chinh}
            {...S}
          />
        ))}
        <path
          d={`M${R * 0.2},${-C} q${DAU * 0.13},${-DAU * 0.22} ${DAU * 0.27},${-DAU * 0.13}
              q${-DAU * 0.15},${DAU * 0.06} ${-DAU * 0.17},${DAU * 0.22} Z`}
          fill={chinh}
          {...S}
        />
      </g>
    );

  if (kieu === 'xoan')
    return (
      <g>
        {/* khối tóc bồng: nhiều cụm tròn chồng nhau */}
        {[
          [-0.72, -0.62, 0.34],
          [-0.3, -0.86, 0.4],
          [0.16, -0.9, 0.38],
          [0.62, -0.66, 0.33],
          [-0.94, -0.2, 0.27],
          [0.94, -0.24, 0.27],
        ].map(([a, b, r], n) => (
          <circle key={n} cx={R * a} cy={C * b} r={DAU * r} fill={n % 3 === 0 ? toi : chinh} {...S} />
        ))}
        <circle cx={-R * 0.34} cy={-C * 0.74} r={DAU * 0.14} fill={sang} />
      </g>
    );

  if (kieu === 'duoi-ngua')
    return (
      <g>
        {khoi(1.02)}
        {/* mái ngôi giữa, hai bên rẽ ra */}
        <path d={`M0,${-C * 1.02} C${-R * 0.5},${-C * 0.9} ${-R * 0.96},${-C * 0.3} ${-R * 1.0},${DAU * 0.1}
                  C${-R * 0.7},${-C * 0.34} ${-R * 0.2},${-C * 0.62} 0,${-C * 0.6} Z`} fill={toi} {...S} />
        <path d={`M0,${-C * 1.02} C${R * 0.5},${-C * 0.9} ${R * 0.96},${-C * 0.3} ${R * 1.0},${DAU * 0.1}
                  C${R * 0.7},${-C * 0.34} ${R * 0.2},${-C * 0.62} 0,${-C * 0.6} Z`} fill={chinh} {...S} />
        {/* dây buộc */}
        <rect x={R * 0.62} y={-C * 0.92} width={DAU * 0.12} height={DAU * 0.1} rx={3} fill="#d46a8a" {...S} />
      </g>
    );

  if (kieu === 'xoa-dai')
    return (
      <g>
        {khoi(1.04)}
        <path d={`M0,${-C * 1.04} C${-R * 0.6},${-C * 0.86} ${-R * 1.0},${-C * 0.1} ${-R * 1.04},${DAU * 0.5}
                  C${-R * 0.72},${-C * 0.22} ${-R * 0.24},${-C * 0.56} 0,${-C * 0.54} Z`} fill={toi} {...S} />
        <path d={`M0,${-C * 1.04} C${R * 0.6},${-C * 0.86} ${R * 1.0},${-C * 0.1} ${R * 1.04},${DAU * 0.5}
                  C${R * 0.72},${-C * 0.22} ${R * 0.24},${-C * 0.56} 0,${-C * 0.54} Z`} fill={chinh} {...S} />
      </g>
    );

  if (kieu === 'bob')
    return (
      <g>
        {khoi(1.06)}
        {/* mái ngang, cắt thẳng */}
        <path
          d={`M${-R * 1.02},${-C * 0.16} L${-R * 0.98},${-C * 0.02} L${R * 0.98},${-C * 0.02} L${R * 1.02},${-C * 0.16}
              C${R * 0.6},${-C * 0.5} ${-R * 0.6},${-C * 0.5} ${-R * 1.02},${-C * 0.16} Z`}
          fill={toi}
          {...S}
        />
      </g>
    );

  if (kieu === 'bui')
    return (
      <g>
        {khoi(1.0)}
        {/* tóc chải mượt về sau, có đường rẽ */}
        <path d={`M${-R * 0.98},${-C * 0.2} C${-R * 0.5},${-C * 0.86} ${R * 0.5},${-C * 0.86} ${R * 0.98},${-C * 0.2}
                  C${R * 0.4},${-C * 0.56} ${-R * 0.4},${-C * 0.56} ${-R * 0.98},${-C * 0.2} Z`} fill={toi} {...S} />
      </g>
    );

  if (kieu === 'hoi-bac')
    return (
      <g>
        {khoi(0.98)}
        {/* hai bên thái dương bạc */}
        <path d={`M${-R * 0.98},${-C * 0.1} q${-DAU * 0.04},${DAU * 0.24} ${DAU * 0.04},${DAU * 0.3}
                  q${DAU * 0.1},${-DAU * 0.16} ${DAU * 0.06},${-DAU * 0.4} Z`} fill={sang} {...S} />
        <path d={`M${R * 0.98},${-C * 0.1} q${DAU * 0.04},${DAU * 0.24} ${-DAU * 0.04},${DAU * 0.3}
                  q${-DAU * 0.1},${-DAU * 0.16} ${-DAU * 0.06},${-DAU * 0.4} Z`} fill={sang} {...S} />
        {/* ngôi rẽ lệch */}
        <path d={`M${-R * 0.3},${-C * 1.0} L${-R * 0.24},${-C * 0.2}`} stroke={net} strokeWidth={netDay * 0.8} />
      </g>
    );

  return <g>{khoi()}</g>;
};
