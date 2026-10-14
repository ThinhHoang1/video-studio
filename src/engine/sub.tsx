import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {FONT} from './font';

export type Cue = {text: string; start: number; end: number};

/**
 * Phụ đề: CHỮ VÀNG VIỀN ĐEN, in hoa, sát đáy.
 *
 * Đo trên Monsieur Tuna (Tuổi Thơ Có Gì Vui, 10,7tr view — docs/nghien-cuu-tuna.md):
 * phụ đề vàng viền đen dày, nằm sát đáy, KHÔNG hiệu ứng karaoke. Vàng-trên-đen đọc
 * được trên MỌI nền: ảnh thật sáng, nền màu bão hoà, nền trắng, bảng đen.
 *
 * Trước đây repo dùng chữ đen trơn vì mọi cảnh đều nền trắng. Từ khi shot có `nen`
 * màu và ảnh chèn thì chữ đen chìm mất — và trên nền trắng nó đụng nét đen của
 * nhân vật, đúng như người dựng phim chỉ ra. Vàng + viền đen giải quyết cả hai.
 */

/**
 * PHỤ ĐỀ BẢN TIN — chữ trắng viền đen, một phần ba giữa khung, KHÔNG dải nền.
 *
 * Đo 80 Short thể thao Việt (2026-09): nhóm triệu view không có dải phụ đề nào;
 * chữ nằm đè thẳng lên hình, viền đen lo phần đọc được. Dải đen chiếm diện tích
 * suốt bài và là thứ làm video "trông như bản tin đài huyện".
 *
 * Hai dòng × tối đa sáu từ là giới hạn đọc được trong một nhịp cắt 1–1.5 giây —
 * dài hơn thì người xem chưa đọc xong đã sang cảnh khác, tức là không ai đọc.
 * Một từ khoá (con số, hoặc từ dài nhất) đổi màu để mắt bắt ý khi lướt không tiếng.
 */
const NHAN = '#ffd400';

/** Con số là từ khoá đáng nhấn nhất; không có số thì lấy từ dài nhất. */
const chonTuKhoa = (tu: string[]) => {
  const so = tu.findIndex((w) => /\d/.test(w));
  if (so >= 0) return so;
  let i = -1;
  let dai = 5;
  tu.forEach((w, k) => {
    if (w.length > dai) {
      dai = w.length;
      i = k;
    }
  });
  return i;
};

const SubBanTin: React.FC<{text: string; mo: number}> = ({text, mo}) => {
  const tu = text.trim().split(/\s+/).filter(Boolean);
  const khoa = chonTuKhoa(tu);
  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', padding: '0 200px 28%'}}>
      <div
        style={{
          fontFamily: FONT,
          // 76px trên khung 1920 ≈ 4% chiều cao — cỡ chữ phụ đề của Short thật.
          // Bản 62px xem lại trên khung thật thì chữ lọt thỏm; và bản dọc còn thu
          // tiếp xuống 0.56 lần nữa, nên thiếu cỡ ở đây là mất chữ ở kia.
          fontSize: 76,
          fontWeight: 900,
          lineHeight: 1.16,
          letterSpacing: 0.3,
          color: '#fff',
          textAlign: 'center',
          maxWidth: 1320,
          opacity: mo,
          WebkitTextStroke: '11px #000',
          paintOrder: 'stroke fill',
          textShadow: '0 4px 14px rgba(0,0,0,0.75)',
        }}
      >
        {tu.map((w, i) => (
          <span key={i} style={i === khoa ? {color: NHAN} : undefined}>
            {w}
            {i < tu.length - 1 ? ' ' : ''}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const Sub: React.FC<{cues: Cue[]; /** giữ cho tương thích */ toi?: boolean; /** bản tin: chữ trắng viền đen giữa khung thay cho chữ vàng storytime */ banTin?: boolean}> = ({cues, banTin}) => {
  const frame = useCurrentFrame();
  const cue = cues.find((c) => frame >= c.start && frame < c.end) ?? null;
  if (!cue) return null;

  const hienRa = interpolate(frame - cue.start, [0, 3], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  /**
   * Hai kiểu phụ đề, KHÔNG dùng chung.
   *
   *   storytime — chữ vàng viền đen dày, to, nảy: đúng chất kể chuyện.
   *   bản tin   — chữ TRẮNG VIỀN ĐEN, KHÔNG dải nền, đặt ở một phần ba giữa
   *               khung. Dải đen mờ của bản trước là "chrome tĩnh": đo 80 Short
   *               thể thao Việt thì nhóm view cao nhất có 0% diện tích khung
   *               tĩnh, còn video 675 view có 67%. Một từ khoá đổi màu để mắt
   *               bắt được ý chính khi lướt không tiếng.
   */
  if (banTin) {
    return <SubBanTin text={cue.text} mo={hienRa} />;
  }

  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', padding: '0 220px 54px'}}>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 44,
          fontWeight: 800,
          letterSpacing: 0.4,
          lineHeight: 1.28,
          color: '#ffd400',
          textAlign: 'center',
          maxWidth: 1320,
          opacity: hienRa,
          WebkitTextStroke: '7px #000',
          paintOrder: 'stroke fill',
          textShadow: '0 3px 0 rgba(0,0,0,0.55)',
        }}
      >
        {cue.text}
      </div>
    </AbsoluteFill>
  );
};
