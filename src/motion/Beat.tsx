import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

/** Nhịp: trả về 0..1 trong mỗi nhịp, và số thứ tự nhịp. */
export const useBeat = (bpm = 96, fps = 30) => {
  const frame = useCurrentFrame();
  const framesPerBeat = (60 / bpm) * fps;
  const index = Math.floor(frame / framesPerBeat);
  const phase = (frame % framesPerBeat) / framesPerBeat;
  return {index, phase, framesPerBeat};
};

/** Cả khối giật nhẹ đúng nhịp — thứ khiến video "có groove". */
export const BeatPulse: React.FC<{
  children: React.ReactNode;
  bpm?: number;
  amount?: number;
  /** chỉ giật vào nhịp thứ n (1 = mọi nhịp, 2 = nhịp chẵn) */
  every?: number;
}> = ({children, bpm = 96, amount = 0.02, every = 2}) => {
  const {index, phase} = useBeat(bpm);
  const on = index % every === 0;
  const kick = on ? interpolate(phase, [0, 0.12, 0.4], [1, 0, 0], {extrapolateRight: 'clamp'}) : 0;
  return (
    <AbsoluteFill style={{transform: `scale(${1 + kick * amount})`, transformOrigin: '50% 50%'}}>
      {children}
    </AbsoluteFill>
  );
};

/** Cú đập màn hình: dùng ở punchline, chỗ chửi thề, chỗ số to. */
export const Impact: React.FC<{
  children: React.ReactNode;
  at: number;
  power?: number;
  flash?: boolean;
}> = ({children, at, power = 1, flash = true}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  const decay = Math.exp(-Math.max(0, t) * 0.28);
  const active = t >= 0 && t < 26;
  const shake = active ? Math.sin(t * 1.9) * 16 * power * decay : 0;
  const zoom = active ? 1 + 0.075 * power * decay : 1;
  const flashOp = active && flash ? Math.max(0, 0.5 - t * 0.14) * power : 0;

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{transform: `translate(${shake}px, ${shake * 0.45}px) scale(${zoom})`}}
      >
        {children}
      </AbsoluteFill>
      {flashOp > 0 ? (
        <AbsoluteFill style={{background: '#fff', opacity: flashOp, mixBlendMode: 'overlay'}} />
      ) : null}
    </AbsoluteFill>
  );
};
