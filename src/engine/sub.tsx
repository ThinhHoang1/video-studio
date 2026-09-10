import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {FONT} from './font';

export type Cue = {text: string; start: number; end: number};

/**
 * Phụ đề kiểu kênh kể chuyện: nhỏ, in hoa, trắng trơn, nằm sát đáy.
 *
 * Bản trước dùng chữ 58px, viền 13px, từ có số tô vàng, từ chửi tô đỏ, lại
 * chạy karaoke sáng dần. Đo lại kênh tham chiếu (MSA, 11,9tr view) thì họ
 * làm ngược hẳn: chữ nhỏ, một màu, không hiệu ứng. Lý do rõ ràng — phụ đề
 * to và nhiều màu tranh mất sự chú ý với chính cái hình mà nó đang chú thích.
 */
export const Sub: React.FC<{cues: Cue[]; /** chữ tối cho nền trắng (V2) */ toi?: boolean}> = ({cues, toi}) => {
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
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: 0.6,
          lineHeight: 1.34,
          textTransform: 'uppercase',
          color: toi ? '#1a1a1a' : '#ffffff',
          textAlign: 'center',
          maxWidth: 1180,
          opacity: hienRa,
          // bóng đổ thay cho viền dày: đọc được trên nền sáng lẫn nền tối
          // mà không biến chữ thành một khối đặc
          textShadow: toi ? 'none' : '0 2px 4px rgba(0,0,0,0.9), 0 0 14px rgba(0,0,0,0.75)',
        }}
      >
        {cue.text}
      </div>
    </AbsoluteFill>
  );
};
