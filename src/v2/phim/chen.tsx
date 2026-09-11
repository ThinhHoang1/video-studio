import React from 'react';
import {staticFile} from 'remotion';
import type {OChen} from '../board/kieu-board';
import {PROPS} from '../props';
import {PropTuVeVe} from '../props/tu-ve';
import type {PropTuVe} from '../board/kieu-board';

/**
 * Ô CHÈN — ảnh/chữ/đồ vật nổi lên TRONG CÙNG KHUNG HÌNH, không cắt sang cảnh khác.
 *
 * Vì sao có: đo Monsieur Tuna thì phần lớn "cú chèn" của anh ấy KHÔNG phải là cắt
 * cảnh. Nhân vật vẫn đứng đó, đang nói, rồi một tấm ảnh thật / một tấm thẻ chữ /
 * một món đồ bật lên ở góc khung, giữ 0.6–1.5 s rồi biến mất, nhân vật không hề
 * dừng diễn. Kể chuyện không đứt: khán giả vừa nghe tiếp vừa thấy bằng chứng.
 * Repo này trước đây chỉ có `loai: 'insert'` — tức là CẮT sang một shot ảnh full
 * khung, mạch bị ngắt, và người xem mất luôn nhân vật.
 *
 * Nhịp vào: bật theo kiểu vẽ tay — 3 frame (quá cỡ 1.14 → 0.97 → 1), KHÔNG phải
 * tween dài. Vào quá mượt thì ô chèn trông như bản trình chiếu, không phải hoạt hình.
 * Nhịp ra: biến mất 1 frame, không mờ dần.
 */

const VAO = [1.14, 0.97, 1];

export const OChenVe: React.FC<{
  chen: OChen;
  W: number;
  H: number;
  net: number;
  /** frame tính từ lúc ô chèn xuất hiện */
  frame: number;
  propTuVe?: Record<string, PropTuVe>;
}> = ({chen, W, H, net, frame, propTuVe}) => {
  if (frame < 0) return null;
  const nay = VAO[Math.min(frame, VAO.length - 1)];
  const rong = (chen.co ?? 0.3) * W;
  const cao = rong * (chen.ti_le ?? 0.66);
  const cx = chen.x * W;
  const cy = chen.y * H;
  const xoay = chen.xoay ?? 0;
  const x = cx - rong / 2;
  const y = cy - cao / 2;
  const id = `chen-${Math.round(cx)}-${Math.round(cy)}`;
  const vienDay = net * 1.6;

  // Đồ vật chèn: vẽ prop thư viện/tự vẽ ở giữa ô, KHÔNG khung ảnh — trông như
  // nhân vật vừa lôi món đồ ra khoe, chứ không như ảnh dán.
  if (chen.prop) {
    const Ve = PROPS[chen.prop as keyof typeof PROPS] as
      | React.FC<{x: number; y: number; co: number; net: number; flip?: boolean; chu?: string}>
      | undefined;
    const chung = {x: cx, y: cy + cao / 2, co: (chen.co ?? 0.3) * 3.2, net, flip: chen.flip};
    const tuVe = propTuVe?.[chen.prop];
    return (
      <g transform={`rotate(${xoay} ${cx} ${cy}) translate(${cx} ${cy}) scale(${nay}) translate(${-cx} ${-cy})`}>
        {Ve ? <Ve {...chung} chu={chen.chu} /> : tuVe ? <PropTuVeVe {...chung} mau={tuVe} chu={chen.chu} /> : null}
      </g>
    );
  }

  return (
    <g transform={`rotate(${xoay} ${cx} ${cy}) translate(${cx} ${cy}) scale(${nay}) translate(${-cx} ${-cy})`}>
      <clipPath id={id}>
        <rect x={x} y={y} width={rong} height={cao} rx={net} />
      </clipPath>
      {/* nền ô: trắng cho ảnh (viền ảnh dán), màu khi là thẻ chữ */}
      <rect x={x} y={y} width={rong} height={cao} rx={net} fill={chen.nen ?? '#ffffff'} />
      {chen.anh ? (
        <image
          href={staticFile(chen.anh)}
          x={x}
          y={y}
          width={rong}
          height={cao}
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${id})`}
        />
      ) : null}
      {chen.chu ? (
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="var(--font-chu, sans-serif)"
          fontWeight={900}
          fontSize={Math.min(cao * 0.42, (rong * 1.5) / Math.max(chen.chu.length, 1))}
          fill={chen.mau_chu ?? '#000000'}
        >
          {chen.chu}
        </text>
      ) : null}
      {chen.khung === false ? null : (
        <rect x={x} y={y} width={rong} height={cao} rx={net} fill="none" stroke="#000" strokeWidth={vienDay} />
      )}
    </g>
  );
};
