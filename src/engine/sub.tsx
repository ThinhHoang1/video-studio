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
export const Sub: React.FC<{cues: Cue[]; /** giữ cho tương thích, không còn tác dụng — phụ đề luôn vàng viền đen */ toi?: boolean}> = ({cues}) => {
  const frame = useCurrentFrame();
  const cue = cues.find((c) => frame >= c.start && frame < c.end) ?? null;
  if (!cue) return null;

  const hienRa = interpolate(frame - cue.start, [0, 3], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

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
          // viền đen thật (paint-order) chứ không phải bóng đổ: giữ được nét chữ
          // sắc ở mọi nền, kể cả nền vàng/cam cùng tông
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
