import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from '../font';
import {C} from '../cast/Cast';
import type {Overlay} from './types';

const vn = (n: number) => n.toLocaleString('vi-VN');

/** Chữ to toàn màn hình cho câu chốt. Vào một nhịp, đứng yên, không nảy. */
const Khung: React.FC<{text: string; sub?: string}> = ({text, sub}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 7], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: '0 120px'}}>
      <div style={{textAlign: 'center', opacity: p, transform: `scale(${interpolate(p, [0, 1], [1.12, 1])})`}}>
        <div
          style={{
            fontFamily: FONT,
            fontSize: text.length > 22 ? 96 : 148,
            fontWeight: 900,
            color: C.paper,
            lineHeight: 1.04,
            letterSpacing: -3,
            textShadow: '0 12px 0 rgba(0,0,0,0.35)',
          }}
        >
          {text}
        </div>
        {sub ? (
          <div
            style={{
              marginTop: 26,
              fontFamily: FONT,
              fontSize: 68,
              fontWeight: 900,
              color: C.gold,
              opacity: interpolate(frame, [8, 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            }}
          >
            {sub}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

/** Thẻ giải nghĩa thuật ngữ — ném ra ngay lúc lời bình nói tới nó. */
const ThuatNgu: React.FC<{term: string; nghia: string}> = ({term, nghia}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const out = interpolate(frame, [durationInFrames - 7, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{alignItems: 'flex-start', justifyContent: 'flex-start', padding: '96px 0 0 96px'}}>
      <div
        style={{
          opacity: p * out,
          transform: `translateX(${interpolate(p, [0, 1], [-70, 0])}px)`,
          background: C.paper,
          border: `8px solid ${C.line}`,
          borderRadius: 20,
          padding: '26px 40px',
          maxWidth: 900,
          boxShadow: '0 18px 0 rgba(0,0,0,0.28)',
        }}
      >
        <div style={{fontFamily: FONT, fontSize: 26, fontWeight: 900, letterSpacing: 5, color: '#9a8f7a'}}>
          THUẬT NGỮ
        </div>
        <div style={{fontFamily: FONT, fontSize: 62, fontWeight: 900, color: '#d92b2b', lineHeight: 1.1}}>{term}</div>
        <div style={{fontFamily: FONT, fontSize: 36, fontWeight: 700, color: C.line, marginTop: 6}}>{nghia}</div>
      </div>
    </AbsoluteFill>
  );
};

/** Con số khổng lồ chạy lên. */
const So: React.FC<{value: number; prefix?: string; suffix?: string; label?: string}> = ({
  value,
  prefix = '',
  suffix = '',
  label,
}) => {
  const frame = useCurrentFrame();
  const run = interpolate(frame, [0, 26], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const shown = Math.round(value * run);
  const big = Math.abs(value) >= 1e6;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{textAlign: 'center'}}>
        <div
          style={{
            fontFamily: FONT,
            fontSize: big ? 118 : 230,
            fontWeight: 900,
            color: C.gold,
            letterSpacing: -4,
            fontVariantNumeric: 'tabular-nums',
            textShadow: '0 14px 0 rgba(0,0,0,0.35)',
          }}
        >
          {prefix}
          {vn(shown)}
          {suffix}
        </div>
        {label ? (
          <div style={{marginTop: 14, fontFamily: FONT, fontSize: 56, fontWeight: 900, color: C.paper}}>{label}</div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

/** Meme cắt ngang, dán như sticker. */
const Meme: React.FC<{src: string; cap?: string}> = ({src, cap}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return (
    <AbsoluteFill style={{alignItems: 'flex-end', justifyContent: 'center', padding: '0 90px 180px 0'}}>
      <div
        style={{
          opacity: p,
          transform: `translateX(${interpolate(p, [0, 1], [520, 0])}px) rotate(${interpolate(p, [0, 1], [16, 4])}deg)`,
          width: 460,
          filter: 'drop-shadow(0 22px 40px rgba(0,0,0,0.6))',
        }}
      >
        <Img
          src={staticFile(src)}
          style={{width: '100%', display: 'block', borderRadius: 14, border: `8px solid ${C.paper}`}}
        />
        {cap ? (
          <div
            style={{
              marginTop: 10,
              textAlign: 'center',
              fontFamily: FONT,
              fontSize: 36,
              fontWeight: 900,
              color: C.paper,
              WebkitTextStroke: '9px #14121c',
              paintOrder: 'stroke fill',
            }}
          >
            {cap}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

export const OverlayView: React.FC<{ov: Overlay}> = ({ov}) => {
  switch (ov.o) {
    case 'khung':
      return <Khung text={ov.text} sub={ov.sub} />;
    case 'thuatngu':
      return <ThuatNgu term={ov.term} nghia={ov.nghia} />;
    case 'so':
      return <So value={ov.value} prefix={ov.prefix} suffix={ov.suffix} label={ov.label} />;
    case 'meme':
      return <Meme src={ov.src} cap={ov.cap} />;
  }
};
