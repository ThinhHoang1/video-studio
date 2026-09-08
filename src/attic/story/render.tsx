import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Teo, Phong, Sep} from '../cast/Cast';
import {PLACES, W, H, SAN} from './Places';
import {PropView} from './Props';
import {OverlayView} from './Overlay';
import type {Shot, Enter} from './types';

/** Cỡ cảnh: [zoom, tâm y mặc định]. Tâm x mặc định là giữa khung. */
const CUTS = {
  rong: [1, 540],
  trung: [1.35, 620],
  can: [2.0, 560],
  sat: [2.9, 560],
} as const;

/** Khung nhìn: cắt và phóng cảnh vẽ ở hệ 1920x1080. */
const View: React.FC<{shot: Shot; children: React.ReactNode}> = ({shot, children}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const [z, defY] = CUTS[shot.cut ?? 'rong'];
  const cx = shot.nhin?.[0] ?? W / 2;
  const cy = shot.nhin?.[1] ?? defY;

  // đẩy máy rất chậm — chỉ đủ để khung hình không chết
  const t = interpolate(frame, [0, durationInFrames], [0, 1], {extrapolateRight: 'clamp'});
  const zoom = z * (1 + 0.035 * t);
  const tx = W / 2 - cx * zoom;
  const ty = H / 2 - cy * zoom;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{display: 'block'}}>
      <g transform={`translate(${tx} ${ty}) scale(${zoom})`}>{children}</g>
    </svg>
  );
};

/** Cú vào shot. Ngắn — 5 tới 9 frame. Dài hơn là thành lề mề. */
const Enter: React.FC<{kind: Enter; children: React.ReactNode}> = ({kind, children}) => {
  const frame = useCurrentFrame();
  if (kind === 'cut') return <>{children}</>;

  const len = kind === 'no' ? 6 : kind === 'zoom' ? 8 : 7;
  const p = interpolate(frame, [0, len], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  let transform = '';
  let filter: string | undefined;

  switch (kind) {
    case 'whipL':
      transform = `translateX(${interpolate(p, [0, 1], [-W, 0])}px)`;
      filter = `blur(${interpolate(p, [0, 0.5, 1], [30, 10, 0])}px)`;
      break;
    case 'whipR':
      transform = `translateX(${interpolate(p, [0, 1], [W, 0])}px)`;
      filter = `blur(${interpolate(p, [0, 0.5, 1], [30, 10, 0])}px)`;
      break;
    case 'day':
      transform = `translateY(${interpolate(p, [0, 1], [H, 0])}px)`;
      break;
    case 'truot':
      transform = `translateX(${interpolate(p, [0, 1], [420, 0])}px)`;
      break;
    case 'zoom':
      transform = `scale(${interpolate(p, [0, 1], [1.28, 1])})`;
      filter = `blur(${interpolate(p, [0, 1], [14, 0])}px)`;
      break;
    case 'no':
      // bung ra từ nhỏ — dùng cho câu chốt
      transform = `scale(${interpolate(p, [0, 1], [0.82, 1])})`;
      break;
  }

  return <AbsoluteFill style={{transform, filter}}>{children}</AbsoluteFill>;
};

/** Đập màn hình: rung tắt dần + loé trắng. Chỉ dùng ở câu chốt. */
const Dap: React.FC<{children: React.ReactNode; on: boolean}> = ({children, on}) => {
  const frame = useCurrentFrame();
  if (!on) return <>{children}</>;
  const decay = Math.exp(-frame * 0.34);
  const shake = frame < 16 ? Math.sin(frame * 2.1) * 13 * decay : 0;
  const flash = Math.max(0, 0.34 - frame * 0.11);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `translate(${shake}px, ${shake * 0.4}px)`}}>{children}</AbsoluteFill>
      {flash > 0 ? <AbsoluteFill style={{background: '#fff', opacity: flash}} /> : null}
    </AbsoluteFill>
  );
};

export const ShotView: React.FC<{shot: Shot}> = ({shot}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / Math.max(1, durationInFrames);
  const Place = PLACES[shot.place ?? 'trong'];

  return (
    <Dap on={Boolean(shot.dap)}>
      <Enter kind={shot.enter ?? 'cut'}>
        <AbsoluteFill style={{background: '#14121c'}}>
          <View shot={shot}>
            <Place />
            {(shot.props ?? []).map((pr, i) => (
              <PropView key={i} prop={pr} p={p} />
            ))}
            {(shot.actors ?? []).map((a, i) => {
              if (a.who === 'teo')
                return (
                  <Teo
                    key={i}
                    mood={a.mood}
                    x={a.x ?? W / 2}
                    y={SAN}
                    s={a.s ?? 1.12}
                    flip={a.flip}
                    viDay={a.vi ?? 1}
                  />
                );
              if (a.who === 'phong')
                return <Phong key={i} size={a.size ?? 0.3} x={a.x ?? 1400} y={a.y ?? 600} mood={a.mood} s={a.s ?? 1} />;
              return <Sep key={i} x={a.x ?? 1300} y={SAN} s={a.s ?? 1} flip={a.flip} />;
            })}
          </View>
          {shot.overlay ? <OverlayView ov={shot.overlay} /> : null}
        </AbsoluteFill>
      </Enter>
      {shot.sfx ? (
        <Sequence from={0}>
          <Audio src={staticFile(`sfx/${shot.sfx}.wav`)} volume={0.42} />
        </Sequence>
      ) : null}
    </Dap>
  );
};
