import React from 'react';
import {AbsoluteFill} from 'remotion';
import {NhanVat} from '../rig/nhan-vat';
import {KIEU} from '../rig/kieu';
import {MUC, NEN} from '../rig/hinh';

/**
 * AVATAR KÊNH — ảnh vuông 1080×1080 dùng cho avatar YouTube / Facebook / TikTok.
 *
 * Vẽ bằng CHÍNH rig của phim nên avatar và nhân vật trong video là một người —
 * đó là thứ làm người xem nhận ra kênh khi lướt. Không dùng ảnh sinh từ mô hình
 * ảnh: nét sẽ khác rig và avatar trông như của kênh khác.
 *
 * Bố cục học từ avatar kênh storytime: mặt CHIẾM GẦN HẾT khung (avatar hiển thị ở
 * 48–88 px trên điện thoại, để cả người là không đọc ra mặt), lệch nhẹ khỏi tâm,
 * một vòng màu nhấn phía sau để nổi trên nền trắng của giao diện.
 *
 * Render:
 *   npx remotion still src/index.ts Avatar out/avatar.png
 *   npx remotion still src/index.ts Avatar out/avatar.png --props='{"kieu":"ha","mat":"cung","vong":"#f6c9d4"}'
 *
 * Ba biến thể đã dựng (đổi `mat` + `mieng` + `vong`):
 *   cười tít   {"mat":"cung",    "mieng":"cuoi-toe", "vong":"#f7e7a9"}  ← thân thiện, hợp avatar chính
 *   "what."    {"mat":"soc-lon", "mieng":"o",        "vong":"#bfe0f5"}  ← hợp thumbnail, kênh phản ứng
 *   nhếch mép  {"mat":"khe",     "mieng":"smirk",    "vong":"#f6c9d4"}  ← hợp kênh châm biếm
 *
 * Máy render KHÔNG có Chrome thì thêm cờ trình duyệt như các script khác:
 *   npx remotion still src/index.ts Avatar out/avatar.png --browser-executable "$(node -e 'import("./pipeline/moi-truong.mjs").then(m=>console.log(m.timTrinhDuyet()))')"
 */
export const AVATAR_W = 1080;
export const AVATAR_H = 1080;

export type AvatarProps = {
  /** nhân vật trong KIEU — mặc định người kể `nam` */
  kieu?: string;
  /** trạng thái mắt: cung = cười tít, soc-lon = "what.", oval = nói */
  mat?: string;
  /** miệng cảm xúc */
  mieng?: string;
  /** màu vòng tròn sau đầu */
  vong?: string;
  /** viền ngoài khung (0 = không viền) */
  vien?: number;
};

export const Avatar: React.FC<AvatarProps> = ({kieu = 'nam', mat = 'cung', mieng = 'cuoi-toe', vong = '#f7e7a9', vien = 0}) => {
  const k = KIEU[kieu] ?? KIEU.nam;
  const W = AVATAR_W;
  const H = AVATAR_H;
  // DAU 560 trên khung 1080 → sọ chiếm 52% bề rộng: đọc được ở 48 px, còn chỗ cho tóc và tai.
  const dau = 560;
  const net = Math.max(4.5, 0.015 * dau);
  // tâm sọ đặt ở 0.44 H (hơi trên tâm khung — mắt người đọc mặt ở đó);
  // NhanVat nhận `y` là CHÂN, tâm sọ nằm cao hơn chân 2.03 DAU.
  const tamDau = H * 0.44;
  const chanY = tamDau + 2.03 * dau;
  return (
    <AbsoluteFill style={{background: NEN}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* nền TRÀN KHUNG, không phải vòng tròn: ở cỡ 48 px một vòng tròn nhỏ trên nền
            trắng đọc thành đốm màu, còn nền tràn thì avatar luôn tách khỏi giao diện */}
        <rect x={0} y={0} width={W} height={H} fill={vong} />
        <NhanVat
          kieu={k}
          dau={dau}
          x={W * 0.5}
          y={chanY}
          dang="dung"
          mat={mat as never}
          mieng={mieng as never}
          nhin={0}
          net={net}
          id="avatar"
          tayVe={false}
        />
        {vien > 0 && <rect x={vien / 2} y={vien / 2} width={W - vien} height={H - vien} fill="none" stroke={MUC} strokeWidth={vien} />}
      </svg>
    </AbsoluteFill>
  );
};
