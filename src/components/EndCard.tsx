import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {KenBurns} from './KenBurns';
import {Vignette} from './Vignette';
import {Grain} from './Grain';
import {colors, font} from '../theme';

const ITEMS = ['Hang Sơn Đoòng', 'Động Phong Nha', 'Động Thiên Đường', 'Biển Nhật Lệ', 'Sông Chày – Hang Tối'];

export const EndCard: React.FC<{src: string; handle: string}> = ({src, handle}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const head = spring({frame, fps, config: {damping: 200}});

  return (
    <AbsoluteFill>
      <KenBurns src={src} pan="out" strength={0.18} />
      <AbsoluteFill style={{background: 'rgba(4,10,18,0.78)'}} />
      <Vignette strength={0.7} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
        <div
          style={{
            fontFamily: font.display,
            fontSize: 104,
            fontWeight: 900,
            color: colors.cream,
            opacity: head,
            transform: `translateY(${interpolate(head, [0, 1], [40, 0])}px)`,
          }}
        >
          Đi Quảng Bình thôi!
        </div>
        <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginTop: 44, maxWidth: 1300}}>
          {ITEMS.map((it, i) => {
            const s = spring({frame: frame - 14 - i * 6, fps, config: {damping: 18, mass: 0.6}});
            return (
              <div
                key={it}
                style={{
                  opacity: s,
                  transform: `scale(${interpolate(s, [0, 1], [0.8, 1])})`,
                  border: `2px solid ${colors.jade}`,
                  color: colors.cream,
                  fontFamily: font.body,
                  fontSize: 30,
                  fontWeight: 700,
                  padding: '14px 26px',
                  borderRadius: 999,
                  background: 'rgba(31,156,138,0.14)',
                }}
              >
                {it}
              </div>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 60,
            fontFamily: font.body,
            fontSize: 34,
            letterSpacing: 6,
            color: colors.amber,
            fontWeight: 800,
            opacity: spring({frame: frame - 52, fps, config: {damping: 200}}),
          }}
        >
          {handle}
        </div>
      </AbsoluteFill>
      <Grain opacity={0.08} />
    </AbsoluteFill>
  );
};
