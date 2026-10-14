import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {FONT} from '../../engine/font';
import {W, H} from './san-khau';

/**
 * KHUNG DỌC 9:16 cho bảng tin — bọc ngoài phim ngang đang có.
 *
 * ─ VIẾT LẠI THEO SỐ ĐO 80 SHORT THỂ THAO VIỆT (2026-09) ─
 * Bản trước dựng theo một Short Beat VN: thẻ mở tĩnh nền đỏ giữ 2.5 giây, dải
 * caption đỏ đặc chiếm 34% chiều cao đứng yên suốt bài. Đo rộng ra 80 video thì
 * đúng hai thứ đó là thứ giết video:
 *   · **8/9 video mở bằng khung tĩnh đều dưới 100k view.** Giây 0.0 phải là
 *     khung ĐANG ĐỘNG, không phải một tấm bìa.
 *   · Nhóm view cao nhất có **0% diện tích khung tĩnh**; video 675 view có 67%.
 *     Dải đỏ đặc 660 px là chính xác loại diện tích đó.
 * Nên bản này bỏ cả hai. Khung dọc giờ chỉ còn: ảnh tin phóng chậm lấp toàn
 * khung (luôn động), phim ngang đặt giữa, tên kênh và tên nguồn mỗi thứ một dòng.
 *
 * Phần lấp trên/dưới là chính ảnh tin làm mờ — cách mọi kênh Short lấp khung dọc
 * khi nguồn là hình ngang. Không ai để hai vạch đen, và cũng không ai để hai
 * mảng màu phẳng.
 */

export const DOC_W = 1080;
export const DOC_H = 1920;

/**
 * PHÓNG 1.35 LẦN RỒI CẮT HAI BÊN.
 *
 * Vừa-bề-rộng (CO = 1080/1920) cho dải phim cao 607 px — 32% khung dọc, còn 68%
 * là nền mờ. Xem lại bản render: hai phần ba màn hình là ảnh out nét, chữ phụ đề
 * bên trong thu còn 43 px trên khung 1080. Không Short nào làm vậy.
 *
 * Phóng 1.35 thì dải phim cao 820 px (43% khung) và cắt mất 249 px mỗi bên của
 * phim gốc. Nên MỌI chữ của khung ngang phải nằm trong dải x 0.13–0.87 W —
 * `khung-tin.tsx` đã dời lề vào 0.14 W đúng vì lý do này. Phóng mạnh hơn nữa thì
 * cắt vào chính ảnh tin.
 */
const PHONG_DOC = 1.35;
const CO = (DOC_W / W) * PHONG_DOC;
const CAO_PHIM = Math.round(H * CO);          // 820 px
const RONG_PHIM = Math.round(W * CO);         // 1458 px — thừa ra hai bên, cắt
const LE_PHIM = Math.round((RONG_PHIM - DOC_W) / 2);
const TOP_PHIM = Math.round((DOC_H - CAO_PHIM) / 2); // đặt giữa khung dọc

export type TinDoc = {
  /** tên kênh in ở đỉnh */
  kenh?: string;
  /** GIỮ CHO TƯƠNG THÍCH — không còn vẽ dải caption. Xem ghi chú đầu file. */
  caption?: string[];
  /** ảnh lấp khung (lấy ảnh tin đầu tiên) */
  anh?: string;
  /** GIỮ CHO TƯƠNG THÍCH — không còn thẻ mở. */
  mo?: number;
  /** tên nguồn, watermark một dòng dưới đáy */
  nguon?: string;
};

const DO = '#e01b24';

export const PhimDoc: React.FC<{tin: TinDoc; children: React.ReactNode}> = ({tin, children}) => {
  const frame = useCurrentFrame();
  /**
   * Ken Burns trên nền: nền mờ đứng yên vẫn là khung tĩnh, chỉ là tĩnh và mờ.
   * 1.2%/giây — cùng lý do như khung ngang: chậm hơn thế thì cham-diem đo ra
   * "khung đứng yên 89%", tức là không ai thấy nó động.
   */
  const t = frame / 30;
  const phong = Math.min(1.7, 1.35 + 0.012 * t);

  return (
    <AbsoluteFill style={{background: '#0d0f14', fontFamily: FONT}}>
      {tin.anh ? (
        <AbsoluteFill>
          <Img
            src={staticFile(tin.anh)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'blur(46px) brightness(0.86) saturate(1.2)',
              transform: `scale(${phong})`,
            }}
          />
        </AbsoluteFill>
      ) : null}

      {/* Phim ngang đặt GIỮA khung dọc. Không cắt hai bên — đã thử và hỏng đúng
          chỗ thanh tiêu đề với tên nguồn. */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: TOP_PHIM,
          width: DOC_W,
          height: CAO_PHIM,
          overflow: 'hidden',
          background: '#000',
        }}
      >
        <div style={{width: W, height: H, transform: `scale(${CO}) translateX(${-LE_PHIM / CO}px)`, transformOrigin: 'top left'}}>
          {children}
        </div>
      </div>

      {/* Hai vạch mảnh ôm dải phim — đủ để mắt biết đâu là hình chính, và tốn
          12 px chứ không phải 660 px. */}
      <div style={{position: 'absolute', left: 0, right: 0, top: TOP_PHIM - 6, height: 6, background: DO}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: TOP_PHIM + CAO_PHIM, height: 6, background: DO}} />

      {/* Tên kênh — chỗ người xem Short nhìn đầu tiên. Một dòng, không hộp. */}
      <div
        style={{
          position: 'absolute',
          left: 44,
          top: 56,
          color: '#fff',
          fontWeight: 900,
          fontSize: 52,
          letterSpacing: 1,
          textShadow: '0 3px 18px rgba(0,0,0,0.75)',
        }}
      >
        {tin.kenh ?? 'CLAW EXPERT'}
      </div>

      {tin.nguon ? (
        <div
          style={{
            position: 'absolute',
            left: 44,
            bottom: 44,
            color: 'rgba(255,255,255,0.8)',
            fontWeight: 700,
            fontSize: 30,
            textShadow: '0 2px 10px rgba(0,0,0,0.85)',
          }}
        >
          Nguồn: {tin.nguon}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
