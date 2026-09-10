import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {PLACES, P, W, H, SAN} from '../../library/scenes/places';
import {PLACES2} from '../../library/scenes/places-extra';
import {HOC_DUONG} from '../../library/scenes/hoc-duong';
import {AN_DU} from '../../library/scenes/an-du';
import {ToiRia} from '../../library/scenes/chieu-sau';
import {NhanVat, VoiceTrack, Sac, Dang} from '../../library/cast/nhan-vat';
import {BOARD, Moc, Dien} from './board';
import {Sub, Cue} from '../../engine/sub';
import {neoNhieu} from '../../engine/neo';
import {splitCues, cueTimings} from '../../engine/cues';
import data from './data/tinh-dau.generated.json';
import voices from './data/tinh-dau.voice.json';
import {FPS} from '../../engine/theme';
import {FONT} from '../../engine/font';

const f = (sec: number) => Math.round(sec * FPS);
const CANH: Record<string, React.FC> = {...PLACES, ...PLACES2, ...HOC_DUONG, ...AN_DU} as never;

type Ch = {id: string; kicker: string; heading: string; vo: string; audio: string; duration: number};
const CH = data.chapters as Ch[];
const GIONG = voices as Record<string, VoiceTrack>;

/** Nhạc bám cung bậc từng chương — không để một bài chạy suốt chín phút. */
const NHAC: Record<string, string> = {
  'cho-ngoi': 'audio/15-distant-sun.mp3',
  'cay-but': 'audio/16-restoration.mp3',
  'long-treu': 'audio/20-daily-beetle.mp3',
  'ghe-da': 'audio/17-where-stars-fall.mp3',
  'duong-ve': 'audio/15-distant-sun.mp3',
  'con-mua': 'audio/11-candlepower.mp3',
  'la-thu': 'audio/12-divider.mp3',
  'mai-noi': 'audio/10-heliograph.mp3',
  'on-thi': 'audio/12-divider.mp3',
  'tra-sua': 'audio/16-restoration.mp3',
  'chia-tay': 'audio/14-heavy-heart.mp3',
  'me-hoi': 'audio/17-where-stars-fall.mp3',
  'gap-lai': 'audio/11-candlepower.mp3',
  ket: 'audio/13-eternal-hope.mp3',
};

/** Cỡ cảnh: [zoom, tâm x, tâm y]. Cận thì bám vào giữa hai nhân vật. */
const CO: Record<string, [number, number, number]> = {
  rong: [1, W / 2, 520],
  trung: [1.32, W / 2, 590],
  can: [1.95, W / 2, 470],
  sat: [2.7, W / 2, 430],
};

type Shot = Moc & {from: number; len: number};

const dung = (ch: Ch) => {
  const total = f(ch.duration);
  const texts = splitCues(ch.vo);
  const times = cueTimings(texts, total);
  const cues: Cue[] = texts.map((text, i) => ({text, start: times[i].start, end: times[i].end}));

  const mocTho = neoNhieu(ch.vo, cues, BOARD[ch.id] ?? [], 'board');
  mocTho.sort((a, b) => a.at - b.at);

  // gộp mốc quá sát: shot dưới 2,4 giây làm khung hình giật
  const NGAN_NHAT = f(2.4);
  const moc: typeof mocTho = [];
  for (const m of mocTho) {
    if (moc.length === 0 || m.at - moc[moc.length - 1].at >= NGAN_NHAT) moc.push(m);
  }

  const shots: Shot[] = moc.map((m, i) => ({
    ...m,
    from: i === 0 ? 0 : m.at,
    len: Math.max(f(0.5), (i + 1 < moc.length ? moc[i + 1].at : total) - (i === 0 ? 0 : m.at)),
  }));

  return {cues, shots};
};

const CHUONG = CH.map(dung);

const PAD = f(0.7);
const INTRO = f(5);
const lens = CH.map((c) => f(c.duration) + PAD);
const starts: number[] = [];
lens.reduce((acc, l, i) => {
  starts[i] = acc;
  return acc + l;
}, INTRO);
export const PHIM_DURATION = INTRO + lens.reduce((a, b) => a + b, 0);

/**
 * Khung nhìn.
 *
 * Khi shot có nhiều người, tâm khung lấy trung bình vị trí của họ — nếu vẫn
 * lấy giữa màn hình thì cảnh hai người đứng lệch sẽ có một nửa khung trống.
 */
const Khung: React.FC<{shot: Shot; children: React.ReactNode}> = ({shot, children}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const [z, cxMac, cy] = CO[shot.co ?? 'trung'] ?? CO.trung;

  const ds = shot.dien ?? [];
  const cx = ds.length ? ds.reduce((s, d) => s + d.x, 0) / ds.length : cxMac;

  const t = interpolate(frame, [0, durationInFrames], [0, 1], {extrapolateRight: 'clamp'});
  const zoom = z * (1 + 0.035 * t);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
      <g transform={`translate(${W / 2 - cx * zoom} ${H / 2 - cy * zoom}) scale(${zoom})`}>{children}</g>
    </svg>
  );
};

/** Mờ chồng chậm — phim kể chuyện không whip pan. */
const MoChong: React.FC<{children: React.ReactNode; len?: number}> = ({children, len = 13}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [0, len], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });
  return <AbsoluteFill style={{opacity: o}}>{children}</AbsoluteFill>;
};

const NhanChuong: React.FC<{kicker: string; heading: string}> = ({kicker, heading}) => {
  const frame = useCurrentFrame();
  const vao = interpolate(frame, [8, 24], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const ra = interpolate(frame, [f(4), f(5)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{justifyContent: 'center', padding: '0 0 200px 120px', pointerEvents: 'none'}}>
      <div style={{opacity: vao * ra, transform: `translateY(${interpolate(vao, [0, 1], [16, 0])}px)`}}>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: 8,
            textTransform: 'uppercase',
            color: '#f0c98a',
            marginBottom: 14,
            textShadow: '0 3px 12px rgba(0,0,0,0.75)',
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 74,
            fontWeight: 900,
            lineHeight: 1.12,
            color: '#fffaf0',
            maxWidth: 1150,
            textShadow: '0 6px 28px rgba(0,0,0,0.85)',
          }}
        >
          {heading}
        </div>
        <div style={{width: 130, height: 4, background: '#f0c98a', marginTop: 20, borderRadius: 2}} />
      </div>
    </AbsoluteFill>
  );
};

const Chuong: React.FC<{ch: Ch; d: ReturnType<typeof dung>}> = ({ch, d}) => {
  const giong = GIONG[ch.id];
  return (
    <AbsoluteFill style={{background: P.ink}}>
      {d.shots.map((s, i) => {
        const Noi = CANH[s.canh] ?? CANH['lop-hoc'];
        const truoc = d.shots[i - 1];
        return (
          <Sequence key={i} from={s.from} durationInFrames={s.len}>
            <MoChong len={i === 0 ? 20 : 13}>
              <Khung shot={s}>
                <Noi />
                {(s.dien ?? []).map((dn: Dien, k) => {
                  // giữ tư thế của chính nhân vật đó ở shot trước, không lấy
                  // của người khác — nếu không, đổi shot là dáng nhảy loạn
                  const cu = truoc?.dien?.find((x) => x.kieu === dn.kieu);
                  return (
                    <NhanVat
                      key={`${dn.kieu}${k}`}
                      giong={giong}
                      goc={s.from}
                      kieu={dn.kieu}
                      dang={(dn.dang ?? 'dung') as Dang}
                      dangTruoc={(cu?.dang ?? dn.dang ?? 'dung') as Dang}
                      sac={(dn.sac ?? 'thuong') as Sac}
                      x={dn.x}
                      y={SAN}
                      s={dn.s ?? 1.0}
                      flip={dn.flip}
                      vi={0.8}
                    />
                  );
                })}
                <ToiRia manh={0.46} />
              </Khung>
            </MoChong>
          </Sequence>
        );
      })}
      <NhanChuong kicker={ch.kicker} heading={ch.heading} />
      <Sub cues={d.cues} />
      <Audio src={staticFile(ch.audio)} />
      <Audio src={staticFile(NHAC[ch.id] ?? 'audio/15-distant-sun.mp3')} volume={0.12} loop />
    </AbsoluteFill>
  );
};

const MoDau: React.FC = () => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [14, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const b = interpolate(frame, [46, 70], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const ra = interpolate(frame, [f(4.2), f(5)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const Noi = CANH['ghe-da'];
  return (
    <AbsoluteFill style={{background: P.ink, opacity: ra}}>
      <Khung shot={{say: '', canh: 'ghe-da', co: 'rong', from: 0, len: 1}}>
        <Noi />
        <ToiRia manh={0.5} />
      </Khung>
      <AbsoluteFill style={{background: 'rgba(20,15,30,0.42)'}} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center', fontFamily: FONT}}>
          <div
            style={{
              fontSize: 128,
              fontWeight: 900,
              color: '#fffaf0',
              letterSpacing: 4,
              opacity: a,
              transform: `translateY(${interpolate(a, [0, 1], [20, 0])}px)`,
              textShadow: '0 8px 34px rgba(0,0,0,0.85)',
            }}
          >
            TÌNH ĐẦU
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 42,
              fontWeight: 700,
              color: '#f0c98a',
              opacity: b,
              transform: `translateY(${interpolate(b, [0, 1], [14, 0])}px)`,
            }}
          >
            người mình không kịp nói
          </div>
        </div>
      </AbsoluteFill>
      <Audio src={staticFile('audio/15-distant-sun.mp3')} volume={0.2} />
    </AbsoluteFill>
  );
};

export const TinhDau: React.FC = () => (
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
