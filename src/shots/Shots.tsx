import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from '../font';
import {ART} from '../art';
import {CountUp} from '../motion/CountUp';
import type {Shot} from './types';

const P = {
  ink: '#0b0c12',
  cream: '#fff8ea',
  gold: '#ffd23f',
  red: '#ff4d4d',
};

/** Chữ trong statement: từ bọc *sao* thì tô vàng. Vào một lượt, không nảy. */
const Statement: React.FC<{text: string; size?: number}> = ({text, size = 108}) => {
  const frame = useCurrentFrame();
  const lines = text.split('\n');
  return (
    <div style={{textAlign: 'center', maxWidth: 1520}}>
      {lines.map((line, li) => {
        const p = interpolate(frame, [li * 4, li * 4 + 10], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.out(Easing.cubic),
        });
        return (
          <div
            key={li}
            style={{
              opacity: p,
              transform: `translateY(${interpolate(p, [0, 1], [26, 0])}px)`,
              fontFamily: FONT,
              fontSize: size,
              fontWeight: 900,
              lineHeight: 1.08,
              color: P.cream,
              letterSpacing: -2,
            }}
          >
            {line.split(/(\*[^*]+\*)/).map((seg, i) =>
              seg.startsWith('*') && seg.endsWith('*') ? (
                <span key={i} style={{color: P.gold}}>
                  {seg.slice(1, -1)}
                </span>
              ) : (
                <span key={i}>{seg}</span>
              )
            )}
          </div>
        );
      })}
    </div>
  );
};

/** Tranh, có thể crop sát vào một vùng để thành một "cỡ cảnh" khác. */
const ArtView: React.FC<{art: string; focus?: [number, number, number]; drift?: number}> = ({
  art,
  focus,
  drift = 1,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const Art = ART[art] ?? (() => null);

  // một chuyển động duy nhất, tuyến tính, chậm — đây là cách cảnh "sống"
  // mà không giật: đẩy vào 4% trong suốt shot.
  const t = interpolate(frame, [0, durationInFrames], [0, 1], {extrapolateRight: 'clamp'});
  const push = 1 + 0.045 * t * drift;

  const [fx, fy, fs] = focus ?? [0.5, 0.5, 1];
  const originX = fx * 100;
  const originY = fy * 100;

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          padding: focus ? 0 : '170px 130px 230px',
          transform: `scale(${fs * push})`,
          transformOrigin: `${originX}% ${originY}%`,
        }}
      >
        <Art />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const ShotView: React.FC<{shot: Shot; art: string; index: number}> = ({shot, art, index}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  switch (shot.kind) {
    case 'wide':
      return <ArtView art={art} drift={1} />;

    case 'detail':
      return <ArtView art={art} focus={shot.focus ?? [0.5, 0.45, 1.9]} drift={0.6} />;

    case 'statement':
      return (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: '0 120px'}}>
          <Statement text={shot.text ?? ''} />
        </AbsoluteFill>
      );

    case 'number': {
      const p = interpolate(frame, [0, 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
      return (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div style={{textAlign: 'center', fontFamily: FONT}}>
            <CountUp
              to={shot.value ?? 0}
              prefix={shot.prefix}
              suffix={shot.suffix}
              size={240}
              durationInFrames={Math.min(38, durationInFrames - 10)}
            />
            {shot.text ? (
              <div
                style={{
                  marginTop: 18,
                  fontSize: 52,
                  fontWeight: 900,
                  color: P.cream,
                  opacity: p,
                  letterSpacing: 1,
                }}
              >
                {shot.text}
              </div>
            ) : null}
          </div>
        </AbsoluteFill>
      );
    }

    case 'meme': {
      const t = interpolate(frame, [0, durationInFrames], [0, 1], {extrapolateRight: 'clamp'});
      return (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: '90px 90px 250px'}}>
          <Img
            src={staticFile(shot.meme ?? '')}
            style={{
              maxWidth: '76%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: 16,
              border: `8px solid ${P.cream}`,
              transform: `scale(${1 + t * 0.04})`,
              filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.8))',
            }}
          />
          {shot.memeCap ? (
            <div
              style={{
                position: 'absolute',
                top: 90,
                fontFamily: FONT,
                fontSize: 54,
                fontWeight: 900,
                color: P.cream,
                WebkitTextStroke: '12px #000',
                paintOrder: 'stroke fill',
                textAlign: 'center',
                maxWidth: 1400,
              }}
            >
              {shot.memeCap}
            </div>
          ) : null}
        </AbsoluteFill>
      );
    }

    case 'split': {
      const p = interpolate(frame, [0, 12], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.out(Easing.cubic),
      });
      const left = index % 2 === 0;
      return (
        <AbsoluteFill style={{flexDirection: left ? 'row' : 'row-reverse'}}>
          <div style={{flex: 1.15, padding: '150px 40px 220px'}}>
            <ArtView art={art} drift={0.5} />
          </div>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              padding: '0 90px 140px',
              opacity: p,
              transform: `translateX(${interpolate(p, [0, 1], [left ? 60 : -60, 0])}px)`,
            }}
          >
            <Statement text={shot.text ?? ''} size={78} />
          </div>
        </AbsoluteFill>
      );
    }

    default:
      return null;
  }
};
