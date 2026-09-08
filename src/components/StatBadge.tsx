import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, font} from '../theme';

export const StatBadge: React.FC<{
  value: string;
  label: string;
  delay?: number;
  top?: number;
  right?: number;
}> = ({value, label, delay = 0, top = 120, right = 110}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - delay, fps, config: {damping: 14, mass: 0.6}});
  const scale = interpolate(s, [0, 1], [0.7, 1]);

  return (
    <div
      style={{
        position: 'absolute',
        top,
        right,
        opacity: s,
        transform: `scale(${scale})`,
        background: 'rgba(11,26,43,0.72)',
        backdropFilter: 'blur(8px)',
        border: `2px solid ${colors.jade}`,
        borderRadius: 18,
        padding: '20px 28px',
        textAlign: 'right',
      }}
    >
      <div style={{fontFamily: font.display, fontSize: 58, fontWeight: 900, color: colors.cream, lineHeight: 1}}>
        {value}
      </div>
      <div
        style={{
          fontFamily: font.body,
          fontSize: 22,
          letterSpacing: 3,
          textTransform: 'uppercase',
          color: colors.jade,
          marginTop: 8,
          fontWeight: 700,
        }}
      >
        {label}
      </div>
    </div>
  );
};
