import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, font} from '../theme';

export const Caption: React.FC<{
  kicker?: string;
  title: string;
  sub?: string;
  align?: 'left' | 'center';
  delay?: number;
}> = ({kicker, title, sub, align = 'left', delay = 0}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  const enter = spring({frame: frame - delay, fps, config: {damping: 200}});
  const out = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = enter * out;
  const y = interpolate(enter, [0, 1], [40, 0]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-end',
        alignItems: align === 'center' ? 'center' : 'flex-start',
        padding: '0 110px 130px',
        textAlign: align,
      }}
    >
      <div style={{opacity, transform: `translateY(${y}px)`, maxWidth: 1250}}>
        {kicker ? (
          <div
            style={{
              display: 'inline-block',
              fontFamily: font.body,
              fontSize: 26,
              letterSpacing: 6,
              textTransform: 'uppercase',
              color: colors.ink,
              background: colors.amber,
              padding: '10px 20px',
              borderRadius: 6,
              fontWeight: 800,
              marginBottom: 22,
            }}
          >
            {kicker}
          </div>
        ) : null}
        <div
          style={{
            fontFamily: font.display,
            fontSize: 92,
            lineHeight: 1.04,
            fontWeight: 900,
            color: colors.cream,
            textShadow: '0 10px 40px rgba(0,0,0,0.65)',
          }}
        >
          {title}
        </div>
        {sub ? (
          <div
            style={{
              marginTop: 20,
              fontFamily: font.body,
              fontSize: 36,
              lineHeight: 1.35,
              color: 'rgba(246,239,226,0.88)',
              textShadow: '0 6px 24px rgba(0,0,0,0.7)',
              maxWidth: 980,
            }}
          >
            {sub}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
