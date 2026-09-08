import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {bounceIn, wobble} from './easing';
import {FONT} from '../font';

export type TextStyle = 'pop' | 'flip3d' | 'drop' | 'typewriter';

/**
 * Chữ nhảy từng từ. Từ bọc trong *dấu sao* sẽ được tô nổi bật + nảy mạnh hơn.
 * Đây là cách các kênh explainer giữ mắt người xem: chữ không bao giờ đứng yên
 * xuất hiện cùng lúc, nó vào theo nhịp lời nói.
 */
export const KineticText: React.FC<{
  text: string;
  size?: number;
  color?: string;
  highlight?: string;
  variant?: TextStyle;
  /** frame giữa hai từ */
  stagger?: number;
  delay?: number;
  align?: 'left' | 'center';
  maxWidth?: number;
  weight?: number;
  lineHeight?: number;
}> = ({
  text,
  size = 92,
  color = '#fff',
  highlight = '#ffd23f',
  variant = 'pop',
  stagger = 2.6,
  delay = 0,
  align = 'left',
  maxWidth = 1400,
  weight = 900,
  lineHeight = 1.08,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const tokens = text.split(/(\s+)/).filter((t) => t !== '');
  let wordIndex = -1;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        maxWidth,
        transformStyle: 'preserve-3d',
      }}
    >
      {tokens.map((tok, i) => {
        if (/^\s+$/.test(tok)) return <span key={i} style={{width: size * 0.26}} />;
        wordIndex += 1;
        const hot = tok.startsWith('*') && tok.endsWith('*');
        const word = hot ? tok.slice(1, -1) : tok;
        const d = delay + wordIndex * stagger;
        const s = bounceIn(frame, fps, d);

        let transform = '';
        if (variant === 'pop') {
          const sc = interpolate(s, [0, 1], [0.35, 1]);
          transform = `scale(${sc}) translateY(${interpolate(s, [0, 1], [34, 0])}px)`;
        } else if (variant === 'flip3d') {
          transform = `rotateX(${interpolate(s, [0, 1], [-95, 0])}deg) translateZ(${interpolate(
            s,
            [0, 1],
            [-180, 0]
          )}px)`;
        } else if (variant === 'drop') {
          transform = `translateY(${interpolate(s, [0, 1], [-140, 0])}px) rotate(${interpolate(
            s,
            [0, 1],
            [-14, 0]
          )}deg)`;
        } else {
          transform = 'none';
        }

        if (hot) {
          const w = wobble(frame, d + 4, 0.5, 0.22) * 3.5;
          transform += ` rotate(${w}deg) scale(${1 + Math.max(0, wobble(frame, d + 4, 0.5, 0.3)) * 0.06})`;
        }

        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              transformStyle: 'preserve-3d',
              transformOrigin: 'center bottom',
              opacity: variant === 'typewriter' ? (frame >= d ? 1 : 0) : s,
              transform,
              fontFamily: FONT,
              fontSize: size,
              lineHeight,
              fontWeight: weight,
              color: hot ? highlight : color,
              letterSpacing: -1,
              paddingRight: 2,
              textShadow: hot
                ? `0 0 42px ${highlight}88, 0 8px 26px rgba(0,0,0,0.75)`
                : '0 8px 26px rgba(0,0,0,0.75)',
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
