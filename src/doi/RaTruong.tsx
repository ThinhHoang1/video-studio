import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {PLACES, P, W, H, SAN} from './Places';
import {Teo} from '../cast/Cast';
import {Sub, Cue} from '../story/Sub';
import {splitCues, cueTimings} from '../components/Caption2';
import data from '../ra-truong.generated.json';
import {FPS} from '../theme';
import {FONT} from '../font';

const f = (sec: number) => Math.round(sec * FPS);

type Ch = {
  id: string;
  canh: string;
  kicker: string;
  heading: string;
  vo: string;
  audio: string;
  duration: number;
};

const CH = data.chapters as Ch[];

/**
 * Nhịp kể chuyện, không phải nhịp explainer: cắt mỗi ~5 giây.
 * Video kể chuyện cần thời gian để câu chốt rơi vào khoảng lặng — cắt nhanh
 * như video giải thích sẽ giết mất chỗ đó.
 */
const NHIP_CAT = 5.0;
const CAT_TOI_THIEU = 2.6;

type Coco = 'rong' | 'trung' | 'can';
const CO_CANH: Record<Coco, [number, number]> = {
  rong: [1, 540],
  trung: [1.35, 600],
  can: [1.95, 520],
};

/** Tâm trạng của Tèo theo từng chương — bám sát nội dung lời kể. */
const TAM_TRANG: Record<string, {mood: 'ok' | 'vui' | 'nghi' | 'soc' | 'tuc' | 'khoc' | 'chet'; vi: number}> = {
  'tam-bang': {mood: 'vui', vi: 1},
  'rai-cv': {mood: 'nghi', vi: 0.85},
  'phong-van': {mood: 'soc', vi: 0.7},
  'ngay-dau': {mood: 'ok', vi: 0.6},
  'thuyen-ngoai-xa': {mood: 'nghi', vi: 0.55},
  'vo-mong': {mood: 'nghi', vi: 0.5},
  'vo-hinh': {mood: 'khoc', vi: 0.4},
  'com-ao': {mood: 'chet', vi: 0.25},
  'luong-dau': {mood: 'ok', vi: 0.45},
  'goi-ve-nha': {mood: 'khoc', vi: 0.35},
  'chao-hanh': {mood: 'ok', vi: 0.4},
  'so-sanh': {mood: 'chet', vi: 0.3},
  'quen-dan': {mood: 'ok', vi: 0.5},
  'cho-cha-me': {mood: 'nghi', vi: 0.55},
  ket: {mood: 'vui', vi: 0.7},
};

/** Nhạc bám cung bậc của chương, không để một bài chạy suốt 12 phút. */
const NHAC: Record<string, string> = {
  'tam-bang': 'audio/15-distant-sun.mp3',
  'rai-cv': 'audio/12-divider.mp3',
  'phong-van': 'audio/10-heliograph.mp3',
  'ngay-dau': 'audio/17-where-stars-fall.mp3',
  'thuyen-ngoai-xa': 'audio/11-candlepower.mp3',
  'vo-mong': 'audio/12-divider.mp3',
  'vo-hinh': 'audio/11-candlepower.mp3',
  'com-ao': 'audio/14-heavy-heart.mp3',
  'luong-dau': 'audio/16-restoration.mp3',
  'goi-ve-nha': 'audio/14-heavy-heart.mp3',
  'chao-hanh': 'audio/17-where-stars-fall.mp3',
  'so-sanh': 'audio/12-divider.mp3',
  'quen-dan': 'audio/15-distant-sun.mp3',
  'cho-cha-me': 'audio/14-heavy-heart.mp3',
  ket: 'audio/13-eternal-hope.mp3',
};

type Shot = {from: number; len: number; co: Coco; nhin: [number, number]};

const chiaShot = (ch: Ch): Shot[] => {
  const total = f(ch.duration);
  const times = cueTimings(splitCues(ch.vo), total);

  const nhom: {start: number; end: number}[] = [];
  let start = 0;
  for (let i = 0; i < times.length; i++) {
    const end = times[i].end;
    if (end - start >= f(NHIP_CAT) || i === times.length - 1) {
      if (end - start < f(CAT_TOI_THIEU) && nhom.length) nhom[nhom.length - 1].end = end;
      else nhom.push({start, end});
      start = end;
    }
  }

  // Luân phiên cỡ cảnh, và luôn mở chương bằng toàn cảnh để người xem
  // định vị được mình đang ở đâu trước khi bị kéo lại gần.
  const vong: Coco[] = ['rong', 'trung', 'can', 'trung', 'rong', 'can'];
  const nhinTheo: Record<Coco, [number, number]> = {
    rong: [W / 2, 540],
    trung: [760, 600],
    can: [660, 470],
  };

  return nhom.map((g, i) => {
    const co = i === 0 ? 'rong' : vong[i % vong.length];
    return {
      from: Math.round(g.start),
      len: Math.max(1, Math.round(g.end - g.start)),
      co,
      nhin: nhinTheo[co],
    };
  });
};

const SHOTS = CH.map(chiaShot);

const PAD = f(0.9); // khoảng lặng giữa hai chương — chỗ để câu chốt rơi xuống
const INTRO = f(5.5);
const lens = CH.map((c) => f(c.duration) + PAD);
const starts: number[] = [];
lens.reduce((acc, l, i) => {
  starts[i] = acc;
  return acc + l;
}, INTRO);
export const RATRUONG_DURATION = INTRO + lens.reduce((a, b) => a + b, 0);

/** Khung nhìn: đẩy máy rất chậm, một chiều, không rung. */
const Khung: React.FC<{shot: Shot; children: React.ReactNode}> = ({shot, children}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const [z, defY] = CO_CANH[shot.co];
  const t = interpolate(frame, [0, durationInFrames], [0, 1], {extrapolateRight: 'clamp'});
  const zoom = z * (1 + 0.03 * t);
  const cx = shot.nhin[0];
  const cy = shot.nhin[1] || defY;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
      <g transform={`translate(${W / 2 - cx * zoom} ${H / 2 - cy * zoom}) scale(${zoom})`}>{children}</g>
    </svg>
  );
};

/** Chuyển cảnh: mờ chồng chậm. Video kể chuyện không whip pan. */
const MoChong: React.FC<{children: React.ReactNode; len?: number}> = ({children, len = 14}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, len], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

/** Nhãn chương — hiện 4 giây đầu rồi lui. */
const NhanChuong: React.FC<{kicker: string; heading: string}> = ({kicker, heading}) => {
  const frame = useCurrentFrame();
  const vao = interpolate(frame, [6, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const ra = interpolate(frame, [f(4.2), f(5.2)], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{justifyContent: 'center', padding: '0 0 180px 120px', pointerEvents: 'none'}}>
      <div style={{opacity: vao * ra, transform: `translateY(${interpolate(vao, [0, 1], [18, 0])}px)`}}>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 30,
            fontWeight: 800,
            letterSpacing: 8,
            textTransform: 'uppercase',
            color: P.gold,
            marginBottom: 14,
            textShadow: '0 3px 10px rgba(0,0,0,0.55)',
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 82,
            fontWeight: 900,
            lineHeight: 1.1,
            color: P.paper,
            maxWidth: 1180,
            textShadow: '0 6px 26px rgba(0,0,0,0.8)',
          }}
        >
          {heading}
        </div>
        <div style={{width: 150, height: 5, background: P.gold, marginTop: 22, borderRadius: 3}} />
      </div>
    </AbsoluteFill>
  );
};

const Chuong: React.FC<{ch: Ch; shots: Shot[]; cues: Cue[]}> = ({ch, shots, cues}) => {
  const Noi = PLACES[ch.canh] ?? PLACES['phong-tro'];
  const tt = TAM_TRANG[ch.id] ?? {mood: 'ok' as const, vi: 0.6};

  return (
    <AbsoluteFill style={{background: P.ink}}>
      {shots.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.len}>
          <MoChong len={i === 0 ? 18 : 12}>
            <Khung shot={s}>
              <Noi />
              <Teo mood={tt.mood} x={640} y={SAN} s={1.06} viDay={tt.vi} />
            </Khung>
            {/* làm tối rìa khung để mắt bám vào giữa */}
            <AbsoluteFill
              style={{
                background: 'radial-gradient(ellipse at 45% 52%, transparent 42%, rgba(20,15,30,0.62) 100%)',
                pointerEvents: 'none',
              }}
            />
          </MoChong>
        </Sequence>
      ))}
      <NhanChuong kicker={ch.kicker} heading={ch.heading} />
      <Sub cues={cues} />
      <Audio src={staticFile(ch.audio)} />
      <Audio src={staticFile(NHAC[ch.id] ?? 'audio/12-divider.mp3')} volume={0.13} loop />
    </AbsoluteFill>
  );
};

const MoDau: React.FC = () => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [10, 34], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const b = interpolate(frame, [40, 62], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const ra = interpolate(frame, [f(4.6), f(5.4)], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const Noi = PLACES['le-tot-nghiep'];
  return (
    <AbsoluteFill style={{background: P.ink, opacity: ra}}>
      <Khung shot={{from: 0, len: 1, co: 'trung', nhin: [760, 600]}}>
        <Noi />
        <Teo mood="vui" x={640} y={SAN} s={1.06} viDay={1} />
      </Khung>
      <AbsoluteFill style={{background: 'rgba(20,15,30,0.5)'}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center', fontFamily: FONT}}>
          <div
            style={{
              fontSize: 104,
              fontWeight: 900,
              color: P.paper,
              lineHeight: 1.12,
              opacity: a,
              transform: `translateY(${interpolate(a, [0, 1], [24, 0])}px)`,
              textShadow: '0 8px 30px rgba(0,0,0,0.8)',
            }}
          >
            Năm đầu tiên đi làm
          </div>
          <div
            style={{
              marginTop: 26,
              fontSize: 46,
              fontWeight: 700,
              color: P.gold,
              opacity: b,
              transform: `translateY(${interpolate(b, [0, 1], [18, 0])}px)`,
            }}
          >
            thứ không ai dạy trong bốn năm đại học
          </div>
        </div>
      </AbsoluteFill>
      <Audio src={staticFile('audio/15-distant-sun.mp3')} volume={0.2} />
    </AbsoluteFill>
  );
};

export const RaTruong: React.FC = () => (
  <AbsoluteFill style={{background: P.ink}}>
    <Sequence durationInFrames={INTRO}>
      <MoDau />
    </Sequence>
    {CH.map((ch, i) => {
      const texts = splitCues(ch.vo);
      const times = cueTimings(texts, f(ch.duration));
      const cues: Cue[] = texts.map((text, k) => ({text, start: times[k].start, end: times[k].end}));
      return (
        <Sequence key={ch.id} from={starts[i]} durationInFrames={lens[i]}>
          <Chuong ch={ch} shots={SHOTS[i]} cues={cues} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
