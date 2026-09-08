import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {KenBurns} from './KenBurns';
import {Vignette} from './Vignette';
import {Grain} from './Grain';
import {colors, font} from '../theme';

export const TitleCard: React.FC<{src: string; title: string; sub: string; tag: string}> = ({
  src,
  title,
  sub,
  tag,
}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();

  const letters = title.split('');
  const subS = spring({frame: frame - 26, fps, config: {damping: 200}});
  const tagS = spring({frame: frame - 8, fps, config: {damping: 200}});
  const lineW = interpolate(spring({frame: frame - 20, fps, config: {damping: 200}}), [0, 1], [0, 460]);
  const out = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{opacity: out}}>
      <KenBurns src={src} pan="in" strength={0.2} />
      <AbsoluteFill style={{background: 'rgba(4,10,18,0.55)'}} />
      <Vignette strength={0.7} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
        <div
          style={{
            fontFamily: font.body,
            fontSize: 28,
            letterSpacing: 12,
            textTransform: 'uppercase',
            color: colors.amber,
            fontWeight: 800,
            opacity: tagS,
            transform: `translateY(${interpolate(tagS, [0, 1], [20, 0])}px)`,
          }}
        >
          {tag}
        </div>
        <div style={{display: 'flex', marginTop: 26}}>
          {letters.map((ch, i) => {
            const s = spring({frame: frame - 10 - i * 2.2, fps, config: {damping: 16, mass: 0.5}});
            return (
              <span
                key={i}
                style={{
                  fontFamily: font.display,
                  fontSize: 168,
                  fontWeight: 900,
                  color: colors.cream,
                  letterSpacing: -2,
                  opacity: s,
                  transform: `translateY(${interpolate(s, [0, 1], [80, 0])}px)`,
                  textShadow: '0 18px 60px rgba(0,0,0,0.7)',
                  whiteSpace: 'pre',
                }}
              >
                {ch}
              </span>
            );
          })}
        </div>
        <div style={{height: 4, width: lineW, background: colors.jade, marginTop: 18, borderRadius: 2}} />
        <div
          style={{
            marginTop: 26,
            fontFamily: font.body,
            fontSize: 38,
            color: 'rgba(246,239,226,0.9)',
            opacity: subS,
            transform: `translateY(${interpolate(subS, [0, 1], [24, 0])}px)`,
            letterSpacing: 2,
          }}
        >
          {sub}
        </div>
      </AbsoluteFill>
      <Grain opacity={0.08} />
    </AbsoluteFill>
  );
};
