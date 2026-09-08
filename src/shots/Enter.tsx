import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import type {Shot} from './types';

/**
 * Cú chuyển vào một shot. Nguyên tắc: NGẮN (4-10 frame) và chỉ có MỘT chuyển
 * động. Chuyển dài hoặc chồng nhiều chuyển động là thứ làm video trông "giật".
 */
export const Enter: React.FC<{kind: Shot['enter']; children: React.ReactNode}> = ({kind, children}) => {
  const frame = useCurrentFrame();

  if (kind === 'cut') return <>{children}</>;

  const ease = Easing.out(Easing.cubic);
  const len = kind === 'zoomBlur' ? 9 : kind.startsWith('slide') ? 11 : 7;
  const p = interpolate(frame, [0, len], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

  let transform = '';
  let filter = '';

  switch (kind) {
    case 'whipL':
    case 'whipR': {
      const sign = kind === 'whipR' ? 1 : -1;
      transform = `translateX(${interpolate(p, [0, 1], [sign * 1920, 0])}px)`;
      filter = `blur(${interpolate(p, [0, 0.55, 1], [34, 12, 0])}px)`;
      break;
    }
    case 'pushUp':
      transform = `translateY(${interpolate(p, [0, 1], [1080, 0])}px)`;
      break;
    case 'pushDown':
      transform = `translateY(${interpolate(p, [0, 1], [-1080, 0])}px)`;
      break;
    case 'zoomBlur':
      transform = `scale(${interpolate(p, [0, 1], [1.35, 1])})`;
      filter = `blur(${interpolate(p, [0, 1], [22, 0])}px)`;
      break;
    case 'slideL':
      transform = `translateX(${interpolate(p, [0, 1], [-560, 0])}px)`;
      break;
    case 'slideR':
      transform = `translateX(${interpolate(p, [0, 1], [560, 0])}px)`;
      break;
  }

  return (
    <AbsoluteFill
      style={{
        transform,
        filter: filter || undefined,
        transformOrigin: 'center center',
        opacity: kind.startsWith('slide') ? interpolate(p, [0, 0.35], [0, 1], {extrapolateRight: 'clamp'}) : 1,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
