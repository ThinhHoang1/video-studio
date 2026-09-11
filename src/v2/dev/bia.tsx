import React from 'react';
import {AbsoluteFill} from 'remotion';
import {NhanVat} from '../rig/nhan-vat';
import {KIEU} from '../rig/kieu';
import {MUC, NEN} from '../rig/hinh';
import {FONT} from '../../engine/font';
import {PROPS} from '../props';
import {LopNen} from '../phim/nen';

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
  /** màu nền (mã màu) */
  nen?: string;
  /** hoạ tiết nền: toa | cheo | cham | song — cùng bộ với Shot.nen trong board */
  hoaTiet?: 'toa' | 'cheo' | 'cham' | 'song';
  /** màu khối chữ (mặc định vàng như tham chiếu) */
  mauChu?: string;
  /** nhân vật thứ hai bên trái (tên trong KIEU) — để thumbnail có đối thoại */
  kieu2?: string;
  mat2?: string;
  mieng2?: string;
  dang2?: string;
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
  nen = '#e4572e',
  hoaTiet,
  mauChu = '#ffd400',
  kieu2,
  mat2 = 'khe',
  mieng2 = 'smirk',
  dang2 = 'khoanhTay',
}) => {
  const k = KIEU[kieu] ?? KIEU.nam;
  const W = BIA_W;
  const H = BIA_H;
  const dong = chu.split('|').slice(0, 2);
  // DAU 330 trên khung 720 → cắt ngang eo, mặt chiếm ~1/3 chiều cao: đọc được ở 320 px.
  // Nhân vật khung "phu" (mẹ, thầy, trắng) cao 3.6 đầu thay vì 2.6 nên phải thu lại,
  // nếu không đỉnh đầu bị cắt mất — lỗi đã gặp ở bản nháp.
  const phu = (k1?: string) => ((KIEU[k1 ?? ''] ?? {}).khung === 'phu' ? 0.76 : 1);
  const dau = 330;
  // hai nhân vật → chữ xuống nửa dưới, một nhân vật → chữ nửa trái
  const haiNguoi = Boolean(kieu2);
  const net = Math.max(4.5, 0.015 * dau);
  // chân đặt DƯỚI đáy khung 30%: tâm sọ rơi vào 0.37 H, đỉnh tóc còn cách mép trên
  // ~10% — cắt cụt đỉnh đầu là lỗi thumbnail hay gặp nhất và nhìn rất nghiệp dư.
  const chanY = H * 1.30;
  // Cỡ chữ TỰ CO theo dòng dài nhất, chặn trong nửa trái khung (58% bề rộng) để chữ
  // không bao giờ đè lên mặt nhân vật — lỗi này làm thumbnail mất cả chữ lẫn mặt.
  const daiNhat = Math.max(...dong.map((d) => d.length), 1);
  const beRong = haiNguoi ? 0.92 : 0.58;
  const coChu = Math.min(dong.length > 1 ? (haiNguoi ? 0.15 : 0.16) * H : 0.2 * H, (W * beRong) / (daiNhat * 0.56));
  const Prop = prop ? (PROPS as Record<string, React.FC<{x: number; y: number; co: number; net: number}>>)[prop] : undefined;
  return (
    <AbsoluteFill style={{background: nen}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <LopNen nen={hoaTiet ? {mau: nen, hoa_tiet: hoaTiet} : nen} W={W} H={H} id="bia" />
        {Prop && <Prop x={W * 0.5} y={H * 1.0} co={(dau / 330) * 0.75} net={net} />}
        {kieu2 && (
          <NhanVat
            kieu={KIEU[kieu2] ?? KIEU.trang}
            dau={dau * 0.86 * phu(kieu2)}
            x={W * 0.22}
            y={chanY}
            dang={dang2}
            mat={mat2 as never}
            mieng={mieng2 as never}
            nhin={0.4}
            net={net}
            id="bia2"
          />
        )}
        <NhanVat
          kieu={k}
          dau={dau * phu(kieu)}
          x={W * (haiNguoi ? 0.76 : 0.74)}
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
            x={haiNguoi ? W * 0.5 : W * 0.045}
            textAnchor={haiNguoi ? 'middle' : 'start'}
            y={H * (haiNguoi ? 0.74 + i * 0.17 : dong.length > 1 ? 0.4 + i * 0.2 : 0.55)}
            fontFamily={FONT}
            fontSize={coChu}
            fontWeight={900}
            fill={mauChu}
            stroke={MUC}
            strokeWidth={coChu * 0.2}
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
