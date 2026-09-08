import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

/** Whip pan có motion blur giả — chuyển cảnh nhanh nhất mà mắt vẫn theo kịp. */
export const WhipIn: React.FC<{children: React.ReactNode; dir?: 'left' | 'right'; len?: number}> = ({
  children,
  dir = 'right',
  len = 9,
}) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [0, len], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const sign = dir === 'right' ? 1 : -1;
  const x = interpolate(s, [0, 1], [sign * 1920, 0]);
  const blur = interpolate(s, [0, 0.45, 1], [42, 16, 0]);
  return (
    <AbsoluteFill style={{transform: `translateX(${x}px)`, filter: `blur(${blur}px)`}}>
      {children}
    </AbsoluteFill>
  );
};

/** Cảnh xoay vào như một tấm bảng trong không gian 3D. */
export const SwingIn3D: React.FC<{children: React.ReactNode; len?: number; from?: number}> = ({
  children,
  len = 16,
  from = -78,
}) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [0, len], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(1.6)),
  });
  return (
    <AbsoluteFill style={{perspective: 1600}}>
      <AbsoluteFill
        style={{
          transformStyle: 'preserve-3d',
          transformOrigin: 'left center',
          transform: `rotateY(${interpolate(s, [0, 1], [from, 0])}deg) translateZ(${interpolate(
            s,
            [0, 1],
            [-500, 0]
          )}px)`,
          opacity: interpolate(s, [0, 0.25], [0, 1], {extrapolateRight: 'clamp'}),
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Zoom giật vào rồi nhả ra — cú "punch in" kinh điển của editor YouTube. */
export const PunchZoom: React.FC<{children: React.ReactNode; at: number; amount?: number; hold?: number}> = ({
  children,
  at,
  amount = 0.22,
  hold = 40,
}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  const zoom =
    t < 0
      ? 1
      : interpolate(t, [0, 3, hold, hold + 8], [1, 1 + amount, 1 + amount, 1], {
          extrapolateRight: 'clamp',
          easing: Easing.out(Easing.quad),
        });
  return <AbsoluteFill style={{transform: `scale(${zoom})`}}>{children}</AbsoluteFill>;
};

/** Nháy đen 2 frame — dùng để "cắt" cứng giữa hai ý. */
export const HardCut: React.FC<{at: number; len?: number}> = ({at, len = 2}) => {
  const frame = useCurrentFrame();
  const on = frame >= at && frame < at + len;
  return on ? <AbsoluteFill style={{background: '#000'}} /> : null;
};

export const useOutro = (fadeFrames = 10) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return interpolate(frame, [durationInFrames - fadeFrames, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};
