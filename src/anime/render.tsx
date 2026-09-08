import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, random, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {AnimeTeo, AnimePhong, AMood} from './Char';
import {A, Burst, ImpactFlash, ImpactText, ScreenTone, SpeedLines} from './fx';
import {step} from './timing';
import {PropView} from '../story/Props';
import {OverlayView} from '../story/Overlay';
import type {Shot, Enter} from '../story/types';
import type {Mood} from '../cast/Cast';

const W = 1920;
const H = 1080;
const SAN = 900;

/** Ánh xạ cảm xúc bản cũ sang bảng cảm xúc anime. */
const MOOD: Record<Mood, AMood> = {
  ok: 'thuong',
  vui: 'vui',
  nghi: 'nghi',
  soc: 'soc',
  tuc: 'tuc',
  khoc: 'khoc',
  chet: 'chet',
  ngo: 'soc',
};

/** Bối cảnh vẽ lại theo bảng màu anime: trời có màu kể chuyện, không nền phẳng. */
const SKY: Record<string, [string, string, string]> = {
  quan: ['#ffc785', '#ff8f6b', '#a05a9c'],
  sieuthi: ['#dff0ff', '#a9d6f5', '#7fb0d9'],
  phong: ['#ffd9a8', '#f0a878', '#8a5f8c'],
  pho: ['#ffb877', '#ff7a6b', '#6b4f96'],
  kho: ['#c9d6e8', '#8fa5c4', '#5d6f94'],
  trong: ['#2a2145', '#1b1638', '#120e26'],
  do: ['#ff6b52', '#c9273c', '#4a0f22'],
};

const Place: React.FC<{name: string}> = ({name}) => {
  const frame = useCurrentFrame();
  const s = SKY[name] ?? SKY.trong;
  const rong = name === 'trong' || name === 'do';

  return (
    <g>
      <defs>
        <linearGradient id={`sky${name}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={s[0]} />
          <stop offset="55%" stopColor={s[1]} />
          <stop offset="100%" stopColor={s[2]} />
        </linearGradient>
        <ScreenTone id={`tone${name}`} size={14} r={3.4} opacity={0.18} />
      </defs>
      <rect x={0} y={0} width={W} height={H} fill={`url(#sky${name})`} />

      {/* mây dải ngang kiểu anime — hình cứng, không mềm */}
      {!rong
        ? [0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M${-200 + ((frame * (0.25 + i * 0.12)) % (W + 400))},${140 + i * 90} h${380 + i * 120} q40,26 -40,26 h${
                -(380 + i * 120)
              } q-40,-26 40,-26 z`}
              fill="#fff"
              opacity={0.42 - i * 0.08}
            />
          ))
        : null}

      {name === 'do' ? <g opacity={0.35}><Burst cx={960} cy={480} color="#ffb0a0" /></g> : null}

      {/* dãy nhà / kệ hàng ở hậu cảnh, đổ bóng cel */}
      {name === 'pho' || name === 'quan'
        ? [0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <rect x={60 + i * 390} y={330 + (i % 2) * 70} width={300} height={570} fill="#5b4a7a" />
              <rect x={60 + i * 390} y={330 + (i % 2) * 70} width={90} height={570} fill="#453860" />
            </g>
          ))
        : null}

      {name === 'sieuthi'
        ? [0, 1, 2].map((r) => (
            <g key={r}>
              <rect x={60} y={200 + r * 200} width={1800} height={22} fill="#6d7f96" />
              {new Array(12).fill(0).map((_, i) => (
                <rect
                  key={i}
                  x={100 + i * 148}
                  y={104 + r * 200}
                  width={112}
                  height={96}
                  fill={['#e46a6a', '#5fa8e0', '#8ccf6a', '#f0b23f', '#a98ae0'][(i + r) % 5]}
                />
              ))}
            </g>
          ))
        : null}

      {!rong ? (
        <>
          <rect x={0} y={SAN} width={W} height={H - SAN} fill="#4a3a68" />
          <rect x={0} y={SAN} width={W} height={26} fill="#372a52" />
          <rect x={0} y={SAN} width={W} height={H - SAN} fill={`url(#tone${name})`} />
        </>
      ) : null}
    </g>
  );
};

/** Cỡ cảnh. Anime cắt mạnh giữa toàn cảnh và đặc tả, ít dùng cỡ trung lửng lơ. */
const CUTS = {rong: [1, 540], trung: [1.4, 620], can: [2.2, 520], sat: [3.4, 470]} as const;

const View: React.FC<{shot: Shot; children: React.ReactNode}> = ({shot, children}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const [z, defY] = CUTS[shot.cut ?? 'rong'];
  const cx = shot.nhin?.[0] ?? W / 2;
  const cy = shot.nhin?.[1] ?? defY;

  // Máy quay chạy MƯỢT trong khi nhân vật giật nhịp — đúng cấu trúc anime:
  // nền và camera vẽ liên tục, nhân vật vẽ thưa.
  const t = interpolate(frame, [0, durationInFrames], [0, 1], {extrapolateRight: 'clamp'});
  const zoom = z * (1 + 0.04 * t);
  // góc nghiêng nhẹ ở cỡ cận — dutch angle của anime lúc căng thẳng
  const tilt = shot.cut === 'sat' ? -2.5 : shot.cut === 'can' ? -1.2 : 0;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
      <g transform={`rotate(${tilt} ${W / 2} ${H / 2}) translate(${W / 2 - cx * zoom} ${H / 2 - cy * zoom}) scale(${zoom})`}>
        {children}
      </g>
    </svg>
  );
};

const EnterFx: React.FC<{kind: Enter; children: React.ReactNode}> = ({kind, children}) => {
  const frame = useCurrentFrame();
  if (kind === 'cut') return <>{children}</>;
  const len = kind === 'no' ? 5 : 7;
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
      filter = `blur(${interpolate(p, [0, 0.5, 1], [34, 12, 0])}px)`;
      break;
    case 'whipR':
      transform = `translateX(${interpolate(p, [0, 1], [W, 0])}px)`;
      filter = `blur(${interpolate(p, [0, 0.5, 1], [34, 12, 0])}px)`;
      break;
    case 'day':
      transform = `translateY(${interpolate(p, [0, 1], [H, 0])}px)`;
      break;
    case 'truot':
      transform = `translateX(${interpolate(p, [0, 1], [440, 0])}px)`;
      break;
    case 'zoom':
      transform = `scale(${interpolate(p, [0, 1], [1.3, 1])})`;
      filter = `blur(${interpolate(p, [0, 1], [16, 0])}px)`;
      break;
    case 'no':
      transform = `scale(${interpolate(p, [0, 1], [0.8, 1])})`;
      break;
  }
  return <AbsoluteFill style={{transform, filter}}>{children}</AbsoluteFill>;
};

/**
 * Cú đập kiểu anime: KHÔNG rung mượt mà giữ-nhả-giữ (hit stop), kèm
 * impact frame đảo màu 2 frame và speed lines toả ra.
 */
const Dap: React.FC<{on: boolean; children: React.ReactNode}> = ({on, children}) => {
  const frame = useCurrentFrame();
  if (!on) return <>{children}</>;
  const s = step(frame, 2);
  const off = s < 2 ? 26 : s < 4 ? -14 : s < 6 ? 7 : 0;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `translate(${off}px, ${off * 0.5}px)`}}>{children}</AbsoluteFill>
      {frame < 8 ? (
        <svg viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
          <g opacity={interpolate(frame, [0, 8], [0.55, 0])}>
            <SpeedLines n={40} inner={420} color={A.ink} />
          </g>
        </svg>
      ) : null}
      <ImpactFlash at={0} len={2} mode="trang" />
    </AbsoluteFill>
  );
};

export const AnimeShot: React.FC<{shot: Shot}> = ({shot}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = frame / Math.max(1, durationInFrames);
  const place = shot.place ?? 'trong';

  return (
    <Dap on={Boolean(shot.dap)}>
      <EnterFx kind={shot.enter ?? 'cut'}>
        <AbsoluteFill style={{background: A.ink}}>
          <View shot={shot}>
            <Place name={place} />
            {(shot.props ?? []).map((pr, i) => (
              <PropView key={i} prop={pr} p={p} />
            ))}
            {(shot.actors ?? []).map((a, i) => {
              if (a.who === 'teo')
                return (
                  <AnimeTeo
                    key={i}
                    mood={MOOD[a.mood ?? 'ok']}
                    x={a.x ?? W / 2}
                    y={SAN}
                    s={(a.s ?? 1) * 1.08}
                    flip={a.flip}
                    vi={a.vi ?? 1}
                    nhip={shot.dap ? 2 : 3}
                  />
                );
              if (a.who === 'phong')
                return (
                  <AnimePhong
                    key={i}
                    size={a.size ?? 0.3}
                    x={a.x ?? 1400}
                    y={a.y ?? 600}
                    s={a.s ?? 1}
                    mood={a.mood === 'doi' ? 'doi' : a.mood === 'no' ? 'no' : a.mood === 'nham' ? 'gian' : 'cuoi'}
                    nhip={2}
                  />
                );
              // sếp cá mập chưa có bản anime -> dùng Tèo mặt quyết đoán thay tạm
              return <AnimeTeo key={i} mood="quyet" x={a.x ?? 1300} y={SAN} s={(a.s ?? 1) * 1.08} flip={a.flip} vi={1} />;
            })}
          </View>
          {shot.overlay ? <OverlayView ov={shot.overlay} /> : null}
        </AbsoluteFill>
      </EnterFx>
      {shot.sfx ? <Audio src={staticFile(`sfx/${shot.sfx}.wav`)} volume={0.42} /> : null}
    </Dap>
  );
};

/** Mở đầu kiểu anime: nhân vật đứng trước hoàng hôn, tia phóng, chữ đập. */
export const AnimeIntro: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: A.ink}}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
        <Place name="pho" />
        <g opacity={0.4}>
          <Burst cx={1420} cy={420} color={A.gold} />
        </g>
        <g transform={`translate(520 ${SAN})`}>
          <AnimeTeo mood="quyet" s={1.25} vi={1} nhip={3} />
        </g>
        <g transform="translate(1440 520)">
          <AnimePhong size={0.42} mood="gian" nhip={2} />
        </g>
      </svg>
      {frame > 14 ? (
        <AbsoluteFill style={{justifyContent: 'flex-end', paddingBottom: 40}}>
          <ImpactText text="LẠM PHÁT" kana="インフレ" size={150} rot={-4} />
        </AbsoluteFill>
      ) : null}
      <ImpactFlash at={14} len={2} mode="trang" />
    </AbsoluteFill>
  );
};
