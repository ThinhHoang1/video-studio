import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export type Pan = 'in' | 'out' | 'left' | 'right' | 'up';

export const KenBurns: React.FC<{src: string; pan?: Pan; strength?: number}> = ({
  src,
  pan = 'in',
  strength = 0.14,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], {extrapolateRight: 'clamp'});

  const zoomIn = 1 + strength * p;
  const zoomOut = 1 + strength - strength * p;

  let scale = zoomIn;
  let x = 0;
  let y = 0;

  if (pan === 'out') scale = zoomOut;
  if (pan === 'left') {
    scale = 1 + strength;
    x = interpolate(p, [0, 1], [strength * 300, -strength * 300]);
  }
  if (pan === 'right') {
    scale = 1 + strength;
    x = interpolate(p, [0, 1], [-strength * 300, strength * 300]);
  }
  if (pan === 'up') {
    scale = 1 + strength;
    y = interpolate(p, [0, 1], [strength * 260, -strength * 260]);
  }

  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: '#000'}}>
      <Img
        src={staticFile(src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${scale}) translate(${x}px, ${y}px)`,
        }}
      />
    </AbsoluteFill>
  );
};
