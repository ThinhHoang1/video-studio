import React from 'react';
import {AbsoluteFill} from 'remotion';
import {NhanVat} from '../rig/nhan-vat';
import {KIEU} from '../rig/kieu';
import {MUC, NEN} from '../rig/hinh';
import {FONT} from '../../engine/font';
import {PROPS} from '../props';

/**
 * ẢNH BÌA (thumbnail) — 1280×720, dùng cho YouTube và Facebook.
 *
 * Vẽ bằng CHÍNH rig của phim: bìa và video là một thế giới, người xem bấm vào
 * không thấy hụt. Không dùng ảnh sinh từ mô hình ảnh.
 *
 * Ba luật rút từ thumbnail đọc được ở cỡ nhỏ (YouTube hiện ~320 px, Facebook ~500 px):
 *   1. CHỮ TO HƠN BẠN NGHĨ — 2 dòng, mỗi dòng ≤ 12 ký tự, cao ~16% chiều cao ảnh.
 *      Ba chữ đọc được hơn tám chữ đẹp.
 *   2. MỘT biểu cảm mạnh, chiếm nửa khung phải. Mặt nhỏ = không ai dừng lại.
 *   3. Nền màu phẳng + viền đen dày: tách khỏi nền trắng của feed.
 *
 * Render:
 *   npx remotion still src/index.ts Bia out/bia.png --props='{"chu":"MẸ DÚI|2 TRIỆU","mat":"soc-lon","mieng":"o"}'
 *
 * `chu` ngăn hai dòng bằng dấu `|`. `prop` là tên prop thư viện vẽ cạnh nhân vật.
 */
export const BIA_W = 1280;
export const BIA_H = 720;

export type BiaProps = {
  /** hai dòng chữ, ngăn bằng "|" — mỗi dòng ≤ 12 ký tự mới đọc được ở cỡ nhỏ */
  chu?: string;
  /** nhãn nhỏ góc trên (số tập, chủ đề) — bỏ trống thì không vẽ */
  nhan?: string;
  kieu?: string;
  mat?: string;
  mieng?: string;
  dang?: string;
  /** đồ cầm tay (tên trong DO_CAM) */
  cam?: string;
  /** prop thư viện vẽ cạnh nhân vật */
  prop?: string;
  /** màu nền */
  nen?: string;
  /** màu khối chữ */
  mauChu?: string;
};

export const Bia: React.FC<BiaProps> = ({
  chu = 'DÒNG MỘT|DÒNG HAI',
  nhan,
  kieu = 'nam',
  mat = 'soc-lon',
  mieng = 'o',
  dang = 'haiTayXoe',
  cam,
  prop,
  nen = '#f7e7a9',
  mauChu = MUC,
}) => {
  const k = KIEU[kieu] ?? KIEU.nam;
  const W = BIA_W;
  const H = BIA_H;
  const dong = chu.split('|').slice(0, 2);
  // DAU 330 trên khung 720 → cắt ngang eo, mặt chiếm ~1/3 chiều cao: đọc được ở 320 px
  const dau = 330;
  const net = Math.max(4.5, 0.015 * dau);
  // chân đặt DƯỚI đáy khung 30%: tâm sọ rơi vào 0.37 H, đỉnh tóc còn cách mép trên
  // ~10% — cắt cụt đỉnh đầu là lỗi thumbnail hay gặp nhất và nhìn rất nghiệp dư.
  const chanY = H * 1.30;
  // Cỡ chữ TỰ CO theo dòng dài nhất, chặn trong nửa trái khung (58% bề rộng) để chữ
  // không bao giờ đè lên mặt nhân vật — lỗi này làm thumbnail mất cả chữ lẫn mặt.
  const daiNhat = Math.max(...dong.map((d) => d.length), 1);
  const coChu = Math.min(dong.length > 1 ? 0.16 * H : 0.2 * H, (W * 0.58) / (daiNhat * 0.56));
  const Prop = prop ? (PROPS as Record<string, React.FC<{x: number; y: number; co: number; net: number}>>)[prop] : undefined;
  return (
    <AbsoluteFill style={{background: nen}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {Prop && <Prop x={W * 0.5} y={H * 1.0} co={(dau / 330) * 0.75} net={net} />}
        <NhanVat
          kieu={k}
          dau={dau}
          x={W * 0.74}
          y={chanY}
          dang={dang}
          mat={mat as never}
          mieng={mieng as never}
          nhin={-0.35}
          net={net}
          id="bia"
          cam={cam || undefined}
        />
        {/* khối chữ nửa trái — nền trắng sau chữ để chữ không dính vào màu nền */}
        {dong.map((d, i) => (
          <text
            key={i}
            x={W * 0.045}
            y={H * (dong.length > 1 ? 0.42 + i * 0.19 : 0.56)}
            fontFamily={FONT}
            fontSize={coChu}
            fontWeight={900}
            fill={mauChu}
            stroke={NEN}
            strokeWidth={coChu * 0.14}
            paintOrder="stroke"
            style={{userSelect: 'none'}}
          >
            {d}
          </text>
        ))}
        {nhan && (
          <>
            <rect x={W * 0.04} y={H * 0.07} width={nhan.length * 0.036 * H + H * 0.05} height={H * 0.095} fill={MUC} rx={H * 0.012} />
            <text x={W * 0.04 + H * 0.025} y={H * 0.142} fontFamily={FONT} fontSize={H * 0.055} fontWeight={800} fill={NEN} style={{userSelect: 'none'}}>
              {nhan}
            </text>
          </>
        )}
        <rect x={net} y={net} width={W - 2 * net} height={H - 2 * net} fill="none" stroke={MUC} strokeWidth={net * 2.5} />
      </svg>
    </AbsoluteFill>
  );
};
