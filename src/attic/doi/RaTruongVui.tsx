import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {PLACES, P, W, H, SAN} from './Places';
import {Teo} from '../cast/Cast';
import {Sub, Cue} from '../story/Sub';
import {splitCues, cueTimings} from '../components/Caption2';
import {MEME, SFX, NHAC} from './vui-cues';
import data from '../ra-truong-vui.generated.json';
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

/** Nhịp hài: cắt nhanh gấp đôi bản kể chuyện. */
const NHIP_CAT = 2.6;
const CAT_TOI_THIEU = 1.3;

type Coco = 'rong' | 'trung' | 'can' | 'sat';
const CO_CANH: Record<Coco, [number, number, number]> = {
  // [zoom, tâm x, tâm y]
  rong: [1, W / 2, 540],
  trung: [1.4, 720, 600],
  can: [2.1, 660, 470],
  sat: [3.0, 655, 420],
};

const TAM_TRANG: Record<string, {mood: 'ok' | 'vui' | 'nghi' | 'soc' | 'tuc' | 'khoc' | 'chet'; vi: number}> = {
  'tam-bang': {mood: 'vui', vi: 1},
  'rai-cv': {mood: 'nghi', vi: 0.85},
  'phong-van': {mood: 'soc', vi: 0.7},
  'ngay-dau': {mood: 'ok', vi: 0.6},
  'cai-email': {mood: 'soc', vi: 0.55},
  hop: {mood: 'chet', vi: 0.5},
  'vo-hinh': {mood: 'khoc', vi: 0.4},
  'luong-dau': {mood: 'vui', vi: 0.5},
  'goi-ve-nha': {mood: 'khoc', vi: 0.35},
  'hoi-sinh': {mood: 'ok', vi: 0.4},
  'so-sanh': {mood: 'chet', vi: 0.3},
  'quen-dan': {mood: 'vui', vi: 0.5},
  'cho-cha-me': {mood: 'nghi', vi: 0.55},
  ket: {mood: 'vui', vi: 0.7},
};

const norm = (s: string) =>
  s.toLowerCase().replace(/[.,!?;:"'…—]/g, '').replace(/\s+/g, ' ').trim();

/** Tìm frame bắt đầu của mẩu lời `say` trong chương. */
const timDiem = (texts: string[], times: {start: number}[], say: string) => {
  const key = norm(say);
  let i = texts.findIndex((t) => norm(t).includes(key));
  if (i === -1) {
    const dau = key.split(' ').slice(0, 4).join(' ');
    i = texts.findIndex((t) => norm(t).includes(dau));
  }
  if (i === -1) {
    console.warn(`[vui] không khớp: "${say}"`);
    return null;
  }
  return Math.round(times[i].start);
};

type Shot = {from: number; len: number; co: Coco};
type Hit = {from: number; len: number; src: string; cap?: string; ben: 'trai' | 'phai'};

const dung = (ch: Ch) => {
  const total = f(ch.duration);
  const texts = splitCues(ch.vo);
  const times = cueTimings(texts, total);
  const cues: Cue[] = texts.map((text, i) => ({text, start: times[i].start, end: times[i].end}));

  // shot: gom cụm phụ đề tới khi đủ ~2.6s
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
  const vong: Coco[] = ['rong', 'can', 'trung', 'sat', 'trung', 'can'];
  const shots: Shot[] = nhom.map((g, i) => ({
    from: Math.round(g.start),
    len: Math.max(1, Math.round(g.end - g.start)),
    co: i === 0 ? 'rong' : vong[i % vong.length],
  }));

  const memes: Hit[] = (MEME[ch.id] ?? [])
    .map((m, i) => {
      const at = timDiem(texts, times, m.say);
      if (at === null) return null;
      return {from: at, len: f(m.giay ?? 2.6), src: m.src, cap: m.cap, ben: i % 2 === 0 ? 'phai' : 'trai'};
    })
    .filter(Boolean) as Hit[];

  const sfx = (SFX[ch.id] ?? [])
    .map((s) => {
      const at = timDiem(texts, times, s.say);
      return at === null ? null : {from: at, sfx: s.sfx};
    })
    .filter(Boolean) as {from: number; sfx: string}[];

  // đập màn hình đúng lúc SFX nặng nổ
  const dap = sfx.filter((s) => s.sfx === 'boom' || s.sfx === 'thud').map((s) => s.from);

  return {cues, shots, memes, sfx, dap};
};

const CHUONG = CH.map(dung);

const PAD = f(0.25);
const INTRO = f(4);
const lens = CH.map((c) => f(c.duration) + PAD);
const starts: number[] = [];
lens.reduce((acc, l, i) => {
  starts[i] = acc;
  return acc + l;
}, INTRO);
export const VUI_DURATION = INTRO + lens.reduce((a, b) => a + b, 0);

const Khung: React.FC<{co: Coco; children: React.ReactNode}> = ({co, children}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const [z, cx, cy] = CO_CANH[co];
  const t = interpolate(frame, [0, durationInFrames], [0, 1], {extrapolateRight: 'clamp'});
  const zoom = z * (1 + 0.05 * t);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
      <g transform={`translate(${W / 2 - cx * zoom} ${H / 2 - cy * zoom}) scale(${zoom})`}>{children}</g>
    </svg>
  );
};

/** Vào shot: cắt thẳng hoặc trượt nhanh. Hài thì cắt, không mờ chồng. */
const Vao: React.FC<{i: number; children: React.ReactNode}> = ({i, children}) => {
  const frame = useCurrentFrame();
  const kieu = i % 4;
  if (kieu === 0) return <>{children}</>;
  const p = interpolate(frame, [0, 5], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const tf =
    kieu === 1
      ? `translateX(${interpolate(p, [0, 1], [W * 0.5, 0])}px)`
      : kieu === 2
        ? `scale(${interpolate(p, [0, 1], [1.18, 1])})`
        : `translateY(${interpolate(p, [0, 1], [-H * 0.4, 0])}px)`;
  return <AbsoluteFill style={{transform: tf}}>{children}</AbsoluteFill>;
};

/** Meme dán vào như sticker, nảy một cái rồi đứng. */
const Meme: React.FC<{src: string; cap?: string; ben: 'trai' | 'phai'}> = ({src, cap, ben}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const vao = interpolate(frame, [0, 4], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(2)),
  });
  const ra = interpolate(frame, [durationInFrames - 4, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const huong = ben === 'phai' ? 1 : -1;
  return (
    <AbsoluteFill
      style={{
        alignItems: ben === 'phai' ? 'flex-end' : 'flex-start',
        justifyContent: 'center',
        padding: '0 70px 200px',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: 430,
          opacity: ra,
          transform: `scale(${vao}) rotate(${huong * 5}deg)`,
          filter: 'drop-shadow(0 20px 34px rgba(0,0,0,0.65))',
        }}
      >
        <Img src={staticFile(src)} style={{width: '100%', display: 'block', borderRadius: 12, border: '7px solid #fff'}} />
        {cap ? (
          <div
            style={{
              marginTop: 8,
              textAlign: 'center',
              fontFamily: FONT,
              fontSize: 34,
              fontWeight: 900,
              color: '#fff',
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

/** Đập màn hình tại các mốc punchline. */
const Dap: React.FC<{moc: number[]; children: React.ReactNode}> = ({moc, children}) => {
  const frame = useCurrentFrame();
  const gan = moc.find((m) => frame >= m && frame < m + 12);
  if (gan === undefined) return <>{children}</>;
  const t = frame - gan;
  const decay = Math.exp(-t * 0.32);
  const rung = Math.sin(t * 2.2) * 15 * decay;
  const zoom = 1 + 0.05 * decay;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `translate(${rung}px, ${rung * 0.4}px) scale(${zoom})`}}>{children}</AbsoluteFill>
      {t < 3 ? <AbsoluteFill style={{background: '#fff', opacity: 0.3 - t * 0.1}} /> : null}
    </AbsoluteFill>
  );
};

const NhanChuong: React.FC<{kicker: string; heading: string}> = ({kicker, heading}) => {
  const frame = useCurrentFrame();
  const vao = interpolate(frame, [3, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(1.6)),
  });
  const ra = interpolate(frame, [f(2.8), f(3.5)], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{justifyContent: 'flex-start', padding: '70px 0 0 80px', pointerEvents: 'none'}}>
      <div style={{opacity: ra, transform: `scale(${vao})`, transformOrigin: 'left top'}}>
        <div
          style={{
            display: 'inline-block',
            fontFamily: FONT,
            fontSize: 26,
            fontWeight: 900,
            letterSpacing: 5,
            textTransform: 'uppercase',
            color: '#14121c',
            background: P.gold,
            padding: '9px 18px',
            borderRadius: 6,
            transform: 'rotate(-2deg)',
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            marginTop: 12,
            fontFamily: FONT,
            fontSize: 66,
            fontWeight: 900,
            lineHeight: 1.1,
            color: '#fff',
            maxWidth: 1180,
            WebkitTextStroke: '13px #14121c',
            paintOrder: 'stroke fill',
          }}
        >
          {heading}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Chuong: React.FC<{ch: Ch; d: ReturnType<typeof dung>}> = ({ch, d}) => {
  const Noi = PLACES[ch.canh] ?? PLACES['phong-tro'];
  const tt = TAM_TRANG[ch.id] ?? {mood: 'ok' as const, vi: 0.6};
  return (
    <AbsoluteFill style={{background: P.ink}}>
      <Dap moc={d.dap}>
        {d.shots.map((s, i) => (
          <Sequence key={i} from={s.from} durationInFrames={s.len}>
            <Vao i={i}>
              <Khung co={s.co}>
                <Noi />
                <Teo mood={tt.mood} x={700} y={SAN} s={1.06} viDay={tt.vi} />
              </Khung>
            </Vao>
          </Sequence>
        ))}
      </Dap>

      {d.memes.map((m, i) => (
        <Sequence key={`m${i}`} from={m.from} durationInFrames={m.len}>
          <Meme src={m.src} cap={m.cap} ben={m.ben} />
        </Sequence>
      ))}

      {d.sfx.map((s, i) => (
        <Sequence key={`s${i}`} from={s.from} durationInFrames={f(2)}>
          <Audio src={staticFile(`sfx/${s.sfx}.wav`)} volume={0.4} />
        </Sequence>
      ))}

      <NhanChuong kicker={ch.kicker} heading={ch.heading} />
      <Sub cues={d.cues} />
      <Audio src={staticFile(ch.audio)} />
      <Audio src={staticFile(NHAC[ch.id] ?? 'audio/25-silly-fun.mp3')} volume={0.11} loop />
    </AbsoluteFill>
  );
};

const MoDau: React.FC = () => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [6, 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(1.8)),
  });
  const b = interpolate(frame, [22, 34], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const Noi = PLACES['le-tot-nghiep'];
  return (
    <AbsoluteFill style={{background: P.ink}}>
      <Khung co="trung">
        <Noi />
        <Teo mood="vui" x={700} y={SAN} s={1.06} viDay={1} />
      </Khung>
      <AbsoluteFill style={{background: 'rgba(20,15,30,0.42)'}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center', fontFamily: FONT}}>
          <div
            style={{
              fontSize: 110,
              fontWeight: 900,
              color: '#fff',
              lineHeight: 1.1,
              transform: `scale(${a}) rotate(-2deg)`,
              WebkitTextStroke: '18px #14121c',
              paintOrder: 'stroke fill',
            }}
          >
            NĂM ĐẦU ĐI LÀM
          </div>
          <div
            style={{
              marginTop: 20,
              fontSize: 50,
              fontWeight: 900,
              color: P.gold,
              opacity: b,
              transform: `translateY(${interpolate(b, [0, 1], [16, 0])}px)`,
              WebkitTextStroke: '12px #14121c',
              paintOrder: 'stroke fill',
            }}
          >
            sổ tay sống sót cho tân binh
          </div>
        </div>
      </AbsoluteFill>
      <Audio src={staticFile('audio/25-silly-fun.mp3')} volume={0.24} />
      <Sequence from={4} durationInFrames={f(2)}>
        <Audio src={staticFile('sfx/pop.wav')} volume={0.45} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const RaTruongVui: React.FC = () => (
  <AbsoluteFill style={{background: P.ink}}>
    <Sequence durationInFrames={INTRO}>
      <MoDau />
    </Sequence>
    {CH.map((ch, i) => (
      <Sequence key={ch.id} from={starts[i]} durationInFrames={lens[i]}>
        <Chuong ch={ch} d={CHUONG[i]} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
