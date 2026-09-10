import React from 'react';
import {Img, staticFile} from 'remotion';
import type {Insert} from './board/kieu-board';

/**
 * Ảnh chèn (meme / ảnh thật) V2 — như ảnh dán lên nền: viền trắng 12px + bóng
 * nhẹ, xoay vài độ, cỡ insert.co × W (mặc định 0.5).
 *
 * Vào: pop 1 frame theo timing.md — scale [0.9, 1.04, 1.0] ở 3 frame đầu rồi giữ.
 * Không fade. Nhịp trắng 0.3 s trước/sau do bảng phân cảnh/phim tự chèn.
 */
const POP = [0.9, 1.04, 1.0];

export const AnhChen: React.FC<{insert: Insert; W: number; H: number; frame: number}> = ({insert, W, H, frame}) => {
  if (frame < 0) return null;
  const co = insert.co ?? 0.5;
  const rong = co * W;
  const s = POP[Math.min(frame, POP.length - 1)];
  const vien = 12 * (H / 1080);
  return (
    <div
      style={{
        position: 'absolute',
        left: W / 2,
        top: H / 2,
        width: rong,
        boxSizing: 'border-box',
        padding: vien,
        background: '#ffffff',
        boxShadow: '0 8px 24px rgba(0,0,0,0.28), 0 1px 3px rgba(0,0,0,0.18)',
        transform: `translate(-50%, -50%) rotate(${insert.xoay ?? 0}deg) scale(${s})`,
      }}
    >
      <Img src={staticFile(insert.anh)} style={{display: 'block', width: '100%', height: 'auto'}} />
    </div>
  );
};
