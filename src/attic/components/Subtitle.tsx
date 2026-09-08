import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, font} from '../theme';

// Chia lời bình thành cụm hiển thị: cắt ở dấu câu trước, rồi gộp lại cho
// mỗi cụm khoảng 8-12 từ. Không cắt giữa cụm từ như "rừng Kẻ | Bàng".
export const splitCues = (text: string, maxWords = 12): string[] => {
  const parts = text
    .split(/(?<=[.!?,;:])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const cues: string[] = [];
  let buf = '';

  const wc = (s: string) => (s ? s.split(/\s+/).length : 0);

  for (const part of parts) {
    if (wc(part) > maxWords + 4) {
      // mệnh đề quá dài mà không có dấu câu -> buộc phải cắt, cắt ở giữa
      if (buf) {
        cues.push(buf);
        buf = '';
      }
      const words = part.split(/\s+/);
      const chunks = Math.ceil(words.length / maxWords);
      const per = Math.ceil(words.length / chunks);
      for (let i = 0; i < words.length; i += per) {
        cues.push(words.slice(i, i + per).join(' '));
      }
      continue;
    }
    if (wc(buf) + wc(part) <= maxWords) {
      buf = buf ? `${buf} ${part}` : part;
    } else {
      if (buf) cues.push(buf);
      buf = part;
    }
  }
  if (buf) cues.push(buf);
  return cues;
};

export const Subtitle: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const cues = splitCues(text);
  const per = durationInFrames / cues.length;
  const idx = Math.min(cues.length - 1, Math.floor(frame / per));
  const local = frame - idx * per;
  const opacity = interpolate(local, [0, 4, per - 3, per], [0, 1, 1, 0.85], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', padding: '0 160px 72px'}}>
      <div
        style={{
          opacity,
          fontFamily: font.body,
          fontSize: 44,
          lineHeight: 1.32,
          fontWeight: 700,
          color: colors.cream,
          textAlign: 'center',
          maxWidth: 1500,
          textShadow: '0 4px 18px rgba(0,0,0,0.95), 0 0 60px rgba(0,0,0,0.8)',
        }}
      >
        {cues[idx]}
      </div>
    </AbsoluteFill>
  );
};
