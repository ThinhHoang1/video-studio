import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';

export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.06}) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2);
  const dots = new Array(90).fill(0).map((_, i) => ({
    x: random(`x${seed}${i}`) * 100,
    y: random(`y${seed}${i}`) * 100,
    s: 1 + random(`s${seed}${i}`) * 2,
  }));

  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity, mixBlendMode: 'overlay'}}>
      {dots.map((d, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.s,
            height: d.s,
            borderRadius: '50%',
            background: '#fff',
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
