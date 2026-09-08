import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, font} from '../theme';

export const ChapterTitle: React.FC<{kicker?: string; heading: string}> = ({kicker, heading}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 200}});
  // tiêu đề chương chỉ đứng 4.5s đầu rồi mờ đi, nhường chỗ cho phụ đề
  const hold = interpolate(frame, [fps * 4, fps * 4.8], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const out = interpolate(frame, [durationInFrames - 10, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = s * hold * out;

  return (
    <AbsoluteFill style={{justifyContent: 'center', padding: '0 110px'}}>
      <div style={{opacity, transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)`}}>
        {kicker ? (
          <div
            style={{
              display: 'inline-block',
              fontFamily: font.body,
              fontSize: 24,
              letterSpacing: 6,
              textTransform: 'uppercase',
              color: colors.ink,
              background: colors.amber,
              padding: '9px 18px',
              borderRadius: 5,
              fontWeight: 800,
              marginBottom: 20,
            }}
          >
            {kicker}
          </div>
        ) : null}
        <div
          style={{
            fontFamily: font.display,
            fontSize: 86,
            lineHeight: 1.06,
            fontWeight: 900,
            color: colors.cream,
            maxWidth: 1250,
            textShadow: '0 12px 44px rgba(0,0,0,0.8)',
          }}
        >
          {heading}
        </div>
      </div>
    </AbsoluteFill>
  );
};
