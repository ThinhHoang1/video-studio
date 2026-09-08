import React from 'react';
import {AbsoluteFill, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, font} from '../theme';

// Chèn meme kiểu "cắt ngang" — bay vào, rung nhẹ, có caption impact-font.
export const MemeCut: React.FC<{
  src: string;
  caption?: string;
  side?: 'left' | 'right';
  size?: number;
  shake?: boolean;
}> = ({src, caption, side = 'right', size = 520, shake = true}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  const enter = spring({frame, fps, config: {damping: 12, mass: 0.5}});
  const exit = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const dir = side === 'right' ? 1 : -1;
  const x = interpolate(enter, [0, 1], [dir * 700, 0]);
  const rot = interpolate(enter, [0, 1], [dir * 18, dir * 2.5]);
  const jitter = shake && frame < 14 ? (random(`j${frame}`) - 0.5) * 10 : 0;

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          bottom: 210,
          [side]: 90,
          width: size,
          opacity: enter * exit,
          transform: `translateX(${x + jitter}px) rotate(${rot}deg)`,
          filter: 'drop-shadow(0 26px 50px rgba(0,0,0,0.75))',
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            width: '100%',
            display: 'block',
            borderRadius: 14,
            border: `5px solid ${colors.cream}`,
          }}
        />
        {caption ? (
          <div
            style={{
              marginTop: 12,
              textAlign: 'center',
              fontFamily: font.display,
              fontSize: 38,
              fontWeight: 900,
              color: colors.cream,
              textTransform: 'uppercase',
              letterSpacing: 1,
              WebkitTextStroke: '3px #000',
              paintOrder: 'stroke fill',
            }}
          >
            {caption}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
