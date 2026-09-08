import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {FONT} from '../font';

export type Cue = {text: string; start: number; end: number};

const CHUI = /^(đéo|đm|vãi|cmn|vcl|đm\.)$/i;
const SO = /[\d%₫]|nghìn|tỷ|triệu|gram|trăm|mươi|phần/i;

/**
 * Phụ đề karaoke: cả cụm hiện sẵn, từ đang được nói thì sáng lên.
 * Khác với kiểu cũ (đổi cả cụm một lúc) — người xem đọc trước được một nhịp
 * nên không bị hụt, mà vẫn biết đang nghe tới đâu.
 */
export const Sub: React.FC<{cues: Cue[]}> = ({cues}) => {
  const frame = useCurrentFrame();
  const cue = cues.find((c) => frame >= c.start && frame < c.end) ?? null;
  if (!cue) return null;

  const words = cue.text.split(/\s+/);
  const len = Math.max(1, cue.end - cue.start);
  const per = len / words.length;
  const active = Math.floor((frame - cue.start) / per);

  const inP = interpolate(frame - cue.start, [0, 4], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', padding: '0 130px 66px'}}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0 16px',
          maxWidth: 1560,
          opacity: inP,
          transform: `translateY(${interpolate(inP, [0, 1], [14, 0])}px)`,
        }}
      >
        {words.map((w, i) => {
          const bare = w.replace(/[.,!?;:"']/g, '');
          const on = i <= active;
          const chui = CHUI.test(bare);
          const so = !chui && SO.test(bare);
          return (
            <span
              key={i}
              style={{
                fontFamily: FONT,
                fontSize: 58,
                fontWeight: 900,
                lineHeight: 1.24,
                color: chui ? '#ff5a5a' : so ? '#ffd23f' : on ? '#ffffff' : 'rgba(255,255,255,0.45)',
                WebkitTextStroke: '13px #14121c',
                paintOrder: 'stroke fill',
                transform: i === active ? 'translateY(-3px)' : 'none',
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
