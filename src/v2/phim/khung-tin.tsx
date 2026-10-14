import React from 'react';
import {Img, OffthreadVideo, staticFile} from 'remotion';
import {FONT} from '../../engine/font';

/**
 * KHUNG BẢN TIN — lớp đồ hoạ vẽ ĐÈ lên hình tin.
 *
 * ─ VIẾT LẠI THEO SỐ ĐO 80 SHORT THỂ THAO VIỆT (2026-09) ─
 * Bản trước dựng theo trí nhớ về bản tin truyền hình: ô ảnh có viền nằm giữa
 * khung, huy hiệu "TIN 2/5" góc trên, thanh tiêu đề hai tầng đứng suốt bài,
 * thanh chạy chân màn. Đo lại 80 Short thì đúng những thứ đó là thứ phân biệt
 * video chết với video sống:
 *   · Nhóm view cao nhất: **0% diện tích khung tĩnh, 0% thời lượng đứng hình**.
 *   · Video tệ nhất (675 view): **67% khung là đồ hoạ tĩnh**.
 *   · 8/9 video mở bằng thẻ tiêu đề tĩnh đều dưới 100k view.
 * Nên ba thay đổi, mỗi cái đều là bỏ đi chứ không phải thêm vào:
 *   1. Hình tin chiếm TRỌN khung và LUÔN ĐỘNG (Ken Burns nếu là ảnh tĩnh) —
 *      "motion_share ≥ 90% thời lượng".
 *   2. BỎ HẲN huy hiệu "TIN n/5". Nó không giữ chân ai; nó chỉ báo còn phải
 *      ngồi thêm bao lâu.
 *   3. Chip + tiêu đề chỉ hiện từ giây thứ 3, mờ dần vào, và ẩn sau 5 giây —
 *      ba giây đầu là chỗ quyết định người xem lướt hay ở lại, không nhường
 *      cho chữ. Chrome tĩnh còn ≤ 18% diện tích, và chỉ trong 5 giây.
 * Tên nguồn vẫn ở lại — nhưng là watermark một dòng góc, vì mượn ảnh của báo
 * thì ghi công là bắt buộc, không phải lựa chọn phong cách.
 */

export type KhungTin = {
  /** nhãn mục: "TIN CHÍNH", "CẢNH BÁO", "CỘNG ĐỒNG" */
  kicker?: string;
  /** tiêu đề tin ≤ 5 từ */
  heading?: string;
  /** GIỮ CHO TƯƠNG THÍCH — không còn vẽ. Xem ghi chú đầu file. */
  so?: string;
  /** tên nguồn, watermark góc: "vnexpress.net" */
  nguon?: string;
  /** ảnh minh hoạ trong public/ — chiếm trọn khung, tự Ken Burns */
  anh?: string;
  /** B-roll thật lấy từ chính bài báo (pipeline/tai-video-tin.mjs) */
  video?: string;
  /** chữ chạy dưới chân màn — mặc định KHÔNG dùng, xem ghi chú */
  chay?: string;
  /** màu nhấn của bản tin (mặc định đỏ tin tức) */
  mau?: string;
};

const DO = '#d92b2b';
const TOI = '#141821';

/** Chip + tiêu đề: hiện giây 3, ẩn giây 8. Đo: chrome sống được ≤ 5 giây. */
const CHU_VAO = 3;
const CHU_RA = 8;
const MO_DAN = 0.4; // giây fade

export const LopKhungTin: React.FC<{tin: KhungTin; W: number; H: number; frame: number; frameChuong: number; fps: number}> = ({
  tin,
  W,
  H,
  frame,
  frameChuong,
  fps,
}) => {
  const mau = tin.mau ?? DO;
  /**
   * Mọi mốc thời gian ở đây bám `frameChuong` (mốc của cả tin), KHÔNG bám frame
   * của shot. Bảng tin cắt ~2 giây một shot; bám frame shot thì hiệu ứng chạy
   * lại từ đầu mỗi lần cắt và nhìn như giật kinh phong — đã hỏng đúng vậy một lần.
   */
  const t = frameChuong / fps;

  /**
   * KEN BURNS. Ảnh báo là ảnh TĨNH; để yên vài giây là người xem thấy đứng hình
   * và lướt. Phóng chậm + trôi ngang biến ảnh tĩnh thành thời lượng "có chuyển
   * động" — đúng chỉ tiêu motion_share ≥ 90%. Chậm thôi: 0.6%/giây, mắt đọc là
   * "máy đang đi tới", nhanh hơn thì thành zoom giật.
   */
  // Tốc độ 1.4%/giây, KHÔNG phải 0.6%. Đo bản render đầu ở 0.6%/giây: cham-diem
  // báo "khung đứng yên 89%" — chậm tới mức máy không nhận ra là có chuyển động,
  // và mắt người xem cũng vậy. 1.4%/giây thì 10 giây phóng từ 1.04 lên 1.18, đọc
  // rõ là "máy đang đi tới" mà vẫn không thành cú zoom giật.
  // Ken Burns bám frame của SHOT, không phải của chương: mỗi shot là một tấm
  // ảnh khác (xem dung-board.mjs — kho hình xoay vòng), nên mỗi tấm phải được
  // đẩy từ đầu. Bám mốc chương thì tấm thứ năm xuất hiện lúc đã phóng 1.18 sẵn.
  const ts = frame / fps;
  const phong = Math.min(1.3, 1.04 + 0.014 * ts);
  const troi = Math.max(-4, -0.45 * ts); // % bề rộng, trôi sang trái

  const hienChu = tin.heading && t >= CHU_VAO && t < CHU_RA;
  const mo = hienChu
    ? Math.min(1, (t - CHU_VAO) / MO_DAN, Math.max(0, (CHU_RA - t) / MO_DAN))
    : 0;

  return (
    /* PHẢI khai fontFamily. Không khai thì khung tin kế thừa font mặc định của
       trình duyệt headless — font đó thiếu glyph tiếng Việt IN HOA có dấu, nên
       "ĐỘI TUYỂN NỮ" ra "ĐỘI TUYỂN N?". */
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', fontFamily: FONT}}>
      {/* HÌNH TIN CHIẾM TRỌN KHUNG — không ô, không viền, không nền thừa.
          Viền + ô giữa khung của bản cũ chính là phần "chrome tĩnh" mà nhóm
          view cao nhất không hề có. */}
      {tin.video ? (
        <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#000'}}>
          {/* B-roll tự nó đã động — không Ken Burns chồng lên, thành rung. */}
          <OffthreadVideo src={staticFile(tin.video)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        </div>
      ) : tin.anh ? (
        <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#000'}}>
          <Img
            src={staticFile(tin.anh)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(${phong}) translateX(${troi}%)`,
              transformOrigin: 'center center',
            }}
          />
        </div>
      ) : null}

      {/* Chip mục + tiêu đề — chỉ sống từ giây 3 đến giây 8, mờ vào mờ ra.
          Đặt ở 0.68 H: dưới là chỗ của phụ đề (1/3 giữa-dưới), trên là hình. */}
      {tin.heading ? (
        /* Lề 0.14 W, không phải 0.05 W: bản DỌC cắt 0.13 W mỗi bên của khung
           ngang (xem PHONG_DOC trong phim-doc.tsx), nên chữ đặt sát mép trái là
           mất hẳn ở bản Short. 0.14 W cũng đúng lề an toàn của phát sóng. */
        <div style={{position: 'absolute', left: 0, right: 0, top: H * 0.68, opacity: mo}}>
          {tin.kicker ? (
            <div
              style={{
                display: 'inline-block',
                marginLeft: W * 0.14,
                background: mau,
                color: '#fff',
                fontWeight: 900,
                fontSize: Math.round(H * 0.03),
                letterSpacing: 2,
                padding: `${H * 0.007}px ${W * 0.014}px`,
              }}
            >
              {tin.kicker.toUpperCase()}
            </div>
          ) : null}
          <div
            style={{
              marginLeft: W * 0.14,
              marginRight: W * 0.16,
              background: TOI,
              color: '#fff',
              fontWeight: 800,
              fontSize: Math.round(H * 0.046),
              lineHeight: 1.15,
              padding: `${H * 0.013}px ${W * 0.018}px`,
              borderLeft: `${Math.round(W * 0.005)}px solid ${mau}`,
            }}
          >
            {tin.heading}
          </div>
        </div>
      ) : null}

      {/* Tên nguồn — watermark MỘT DÒNG góc dưới phải, không hộp, không nền đặc.
          Mượn ảnh của báo thì phải ghi công; nhưng ghi công không cần một tấm
          biển. Chữ nhỏ có bóng đọc được trên mọi ảnh. */}
      {tin.nguon ? (
        <div
          style={{
            position: 'absolute',
            right: W * 0.15,
            bottom: H * 0.022,
            color: 'rgba(255,255,255,0.86)',
            fontSize: Math.round(H * 0.022),
            fontWeight: 700,
            letterSpacing: 0.4,
            textShadow: '0 2px 6px rgba(0,0,0,0.85)',
          }}
        >
          {tin.nguon}
        </div>
      ) : null}

      {/* Thanh chạy chân màn: GIỮ nhưng mặc định không dùng. Nó là 6% chiều cao
          khung đứng yên suốt bài — đúng loại chrome tĩnh mà nhóm view cao bỏ hẳn.
          Chỉ bật khi thật sự có tin chạy đáng đọc. */}
      {tin.chay ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: H * 0.062,
            background: TOI,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: W * 0.1,
              background: mau,
              color: '#fff',
              fontWeight: 900,
              fontSize: Math.round(H * 0.03),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}
          >
            MỚI
          </div>
          <div
            style={{
              whiteSpace: 'nowrap',
              color: '#fff',
              fontSize: Math.round(H * 0.03),
              fontWeight: 600,
              transform: `translateX(${W - ((frameChuong / fps) * 110) % (W * 2)}px)`,
            }}
          >
            {tin.chay}
          </div>
        </div>
      ) : null}
    </div>
  );
};
