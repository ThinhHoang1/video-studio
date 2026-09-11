import React from 'react';
import {AbsoluteFill} from 'remotion';
import {NhanVat} from '../rig/nhan-vat';
import {KIEU} from '../rig/kieu';
import {MUC, NEN} from '../rig/hinh';
import {FONT} from '../../engine/font';

/**
 * ẢNH BÌA KÊNH (banner) — YouTube và Facebook.
 *
 * KHÁC ẢNH BÌA VIDEO: bìa video bán MỘT câu chuyện, bìa kênh bán CẢ KÊNH —
 * tên kênh, kênh này kể cái gì, và ra tập vào lúc nào. Không nhồi nội dung một
 * tập vào đây.
 *
 * ⚠️ VÙNG AN TOÀN LÀ THỨ QUAN TRỌNG NHẤT. YouTube cắt banner khác nhau trên mỗi
 * thiết bị: ảnh tải lên 2560×1440, nhưng trên điện thoại chỉ thấy dải giữa
 * 1546×423 px. Mọi chữ phải nằm TRỌN trong dải đó, nếu không người xem điện
 * thoại (phần lớn khán giả) chỉ thấy nửa cái tên kênh.
 *   youtube  2560×1440, vùng an toàn 1546×423 ở giữa
 *   facebook 1640×856,  vùng an toàn ~1090×540 ở giữa (mobile cắt hai bên)
 *
 * Render:
 *   npx remotion still src/index.ts BiaKenh out/banner-yt.png --props='{"khung":"youtube"}'
 *   npx remotion still src/index.ts BiaKenh out/banner-fb.png --props='{"khung":"facebook"}'
 *   thêm "--props={...,\"vienAnToan\":true}" để XEM vùng an toàn khi căn chỉnh (không dùng bản thật)
 */
export const KENH_W = 2560;
export const KENH_H = 1440;

export type BiaKenhProps = {
  khung?: 'youtube' | 'facebook';
  ten?: string;
  /** một dòng nói kênh này kể cái gì */
  tagline?: string;
  /**
   * Lịch ra tập — MẶC ĐỊNH TRỐNG, cố ý.
   * Banner in "tập mới thứ Ba & thứ Sáu" là một lời hứa với người lạ; lỡ một tuần
   * là banner tự tố mình. Kênh mới đừng hứa nhịp đăng: ra đều rồi hãy in lên.
   */
  lich?: string;
  nen?: string;
  /** vẽ khung vùng an toàn để căn chỉnh; KHÔNG bật ở bản đăng thật */
  vienAnToan?: boolean;
};

/** dàn nhân vật đứng hai bên chữ — mỗi người một tư thế, đọc ra là "kênh kể chuyện người" */
const DAN = [
  {kieu: 'ha', dang: 'vayTay', mat: 'cung', mieng: 'cuoi-toe'},
  {kieu: 'long', dang: 'khoanhTay', mat: 'khe', mieng: 'smirk'},
  {kieu: 'mai', dang: 'chongCam', mat: 'nho', mieng: 'cuoi-nhe'},
  {kieu: 'nam-lon', dang: 'motTayHong', mat: 'oval', mieng: 'thang'},
  {kieu: 'me', dang: 'tayHong', mat: 'cung', mieng: 'cuoi-nhe'},
  {kieu: 'thay', dang: 'gaiDau', mat: 'chan', mieng: 'meu'},
];

export const BiaKenh: React.FC<BiaKenhProps> = ({
  khung = 'youtube',
  ten = 'HTH ANIMATION',
  tagline = 'CHUYỆN ĐỜI ĐI LÀM, KỂ BẰNG HOẠT HÌNH',
  lich = '',
  nen = '#f7e7a9',
  vienAnToan = false,
}) => {
  const yt = khung === 'youtube';
  const W = yt ? 2560 : 1640;
  const H = yt ? 1440 : 856;
  // vùng an toàn: phần duy nhất chắc chắn hiện trên MỌI thiết bị
  const atW = yt ? 1546 : 1090;
  const atH = yt ? 423 : 540;
  const atX = (W - atW) / 2;
  const atY = (H - atH) / 2;

  // Nhân vật phải cao vừa DẢI AN TOÀN, không phải vừa cả ảnh: người xem điện thoại
  // và máy tính chỉ thấy dải đó. Đặt dàn diễn ở ngoài dải là coi như không có ai.
  // Cao nhất trong dàn là khung "phụ" 3.6 đầu (mẹ, thầy) → dau ≤ atH/3.9.
  const dau = Math.floor(atH / 3.9);
  const net = Math.max(4.5, 0.015 * dau);
  // bốn người TRONG dải an toàn kèm hai bên chữ; hai người ngoài dải là phần thưởng
  // cho ai xem trên TV (thấy trọn 2560×1440), mất cũng không ảnh hưởng gì.
  // Hai người trong cùng phải đứng NGOÀI bề rộng khối chữ (~0.33–0.67), nếu không
  // đầu họ đè lên tên kênh — lỗi thấy ngay ở bản nháp đầu.
  const meO = yt ? [0.055, 0.16, 0.25, 0.75, 0.84, 0.945] : [0.04, 0.115, 0.225, 0.775, 0.885, 0.96];
  const chanY = atY + atH * 0.99;

  const coTen = atH * 0.26;
  const coTag = atH * 0.1;
  const coLich = atH * 0.1;

  return (
    <AbsoluteFill style={{background: nen}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {DAN.map((d, i) => (
          <NhanVat
            key={i}
            kieu={KIEU[d.kieu] ?? KIEU.trang}
            dau={dau}
            x={W * meO[i]}
            y={chanY}
            dang={d.dang}
            mat={d.mat as never}
            mieng={d.mieng as never}
            nhin={meO[i] < 0.5 ? 0.45 : -0.45}
            flip={meO[i] > 0.5}
            net={net}
            id={`kenh-${i}`}
          />
        ))}

        {/* khối chữ nằm TRỌN trong vùng an toàn */}
        <text
          x={W / 2}
          y={atY + atH * (lich ? 0.38 : 0.46)}
          textAnchor="middle"
          fontFamily={FONT}
          fontSize={coTen}
          fontWeight={900}
          fill={MUC}
          stroke={NEN}
          strokeWidth={coTen * 0.12}
          paintOrder="stroke"
          style={{userSelect: 'none'}}
        >
          {ten}
        </text>
        <text
          x={W / 2}
          y={atY + atH * (lich ? 0.56 : 0.65)}
          textAnchor="middle"
          fontFamily={FONT}
          fontSize={coTag}
          fontWeight={800}
          fill={MUC}
          stroke={NEN}
          strokeWidth={coTag * 0.16}
          paintOrder="stroke"
          style={{userSelect: 'none'}}
        >
          {tagline}
        </text>
        {lich && (
          <>
            <rect
              x={W / 2 - (lich.length * coLich * 0.29 + coLich)}
              y={atY + atH * 0.66}
              width={(lich.length * coLich * 0.29 + coLich) * 2}
              height={coLich * 1.9}
              rx={coLich * 0.35}
              fill={MUC}
            />
            <text
              x={W / 2}
              y={atY + atH * 0.66 + coLich * 1.33}
              textAnchor="middle"
              fontFamily={FONT}
              fontSize={coLich}
              fontWeight={800}
              fill={NEN}
              style={{userSelect: 'none'}}
            >
              {lich}
            </text>
          </>
        )}

        {vienAnToan && <rect x={atX} y={atY} width={atW} height={atH} fill="none" stroke="#f81000" strokeWidth={6} strokeDasharray="24 16" />}
      </svg>
    </AbsoluteFill>
  );
};
