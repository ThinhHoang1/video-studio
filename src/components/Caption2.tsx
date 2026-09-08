import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from '../font';

/** Cắt lời bình thành cụm ngắn theo dấu câu, gộp lại ~7 từ mỗi cụm. */
export const splitCues = (text: string, maxWords = 7): string[] => {
  const parts = text
    .split(/(?<=[.!?,;:])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const cues: string[] = [];
  let buf = '';
  const wc = (s: string) => (s ? s.split(/\s+/).length : 0);
  for (const part of parts) {
    if (wc(part) > maxWords + 3) {
      if (buf) {
        cues.push(buf);
        buf = '';
      }
      const w = part.split(/\s+/);
      const n = Math.ceil(w.length / maxWords);
      const per = Math.ceil(w.length / n);
      for (let i = 0; i < w.length; i += per) cues.push(w.slice(i, i + per).join(' '));
      continue;
    }
    if (wc(buf) + wc(part) <= maxWords) buf = buf ? `${buf} ${part}` : part;
    else {
      if (buf) cues.push(buf);
      buf = part;
    }
  }
  if (buf) cues.push(buf);
  return cues;
};

/**
 * Chia thời lượng cho từng cụm THEO SỐ ÂM TIẾT, không chia đều.
 * Tiếng Việt đơn âm nên số từ ≈ số âm tiết ≈ thời gian nói.
 * Chia đều chính là lý do phụ đề chạy trước tiếng: cụm "Ê." được cấp đúng
 * bằng thời gian của một cụm bảy từ.
 */
export const cueTimings = (cues: string[], totalFrames: number) => {
  const weight = (c: string) => {
    const syllables = c.split(/\s+/).length;
    // dấu câu = chỗ người ta ngắt hơi, phải cộng thêm thời gian
    const pause = /[.!?]$/.test(c) ? 2.2 : /[,;:]$/.test(c) ? 1.2 : 0;
    return syllables + pause;
  };
  const w = cues.map(weight);
  const sum = w.reduce((a, b) => a + b, 0);
  let acc = 0;
  return w.map((x) => {
    const start = (acc / sum) * totalFrames;
    acc += x;
    return {start, end: (acc / sum) * totalFrames};
  });
};

const HOT = /^(đéo|đm|vãi|cmn|vcl)$/i;
const NUM = /[\d%₫]|nghìn|tỷ|triệu|gram|trăm|mươi|một|hai|ba|bốn|năm|sáu|bảy|tám|chín|mười/i;

export const Caption2: React.FC<{
  text: string;
  /** số frame của riêng phần audio, KHÔNG tính khoảng lặng đệm cuối chương */
  audioFrames?: number;
  bottom?: number;
}> = ({text, audioFrames, bottom = 96}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const total = audioFrames ?? durationInFrames;

  const cues = splitCues(text);
  const times = cueTimings(cues, total);
  let idx = times.findIndex((t) => frame < t.end);
  if (idx === -1) idx = cues.length - 1;

  const {start, end} = times[idx];
  const len = end - start;
  const local = frame - start;
  // vào nhanh, đứng yên, ra nhẹ — không nảy, không giật
  const opacity = interpolate(local, [0, 3, len - 3, len], [0, 1, 1, 0.9], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const rise = interpolate(local, [0, 6], [10, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', padding: `0 130px ${bottom}px`}}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0 16px',
          maxWidth: 1440,
          opacity,
          transform: `translateY(${rise}px)`,
        }}
      >
        {cues[idx].split(/\s+/).map((w, i) => {
          const bare = w.replace(/[.,!?;:"']/g, '');
          const hot = HOT.test(bare);
          const num = !hot && NUM.test(bare);
          return (
            <span
              key={i}
              style={{
                fontFamily: FONT,
                fontSize: 58,
                fontWeight: 900,
                lineHeight: 1.22,
                color: hot ? '#ff5a5a' : num ? '#ffd23f' : '#fff',
                WebkitTextStroke: '12px #000',
                paintOrder: 'stroke fill',
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
