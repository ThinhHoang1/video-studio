import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {PLACES, P, W, H, SAN} from '../../library/scenes/places';
import {PLACES2} from '../../library/scenes/places-extra';
import {AN_DU} from '../../library/scenes/an-du';
import {TienCanh, ToiRia} from '../../library/scenes/chieu-sau';
import {NhanVat, VoiceTrack, Sac} from '../../library/cast/nhan-vat';
import {BOARD, Moc} from './board';
import {Sub, Cue} from '../../engine/sub';
import {neoNhieu} from '../../engine/neo';
import {splitCues, cueTimings} from '../../engine/cues';
import {MEME, SFX, NHAC} from './cues';
import data from './data/ra-truong-vui.generated.json';
import voices from './data/ra-truong-vui.voice.json';
import {FPS} from '../../engine/theme';
import {FONT} from '../../engine/font';

const f = (sec: number) => Math.round(sec * FPS);
const CANH: Record<string, React.FC<Record<string, unknown>>> = {...PLACES, ...PLACES2, ...AN_DU} as never;

type Ch = {id: string; canh: string; kicker: string; heading: string; vo: string; audio: string; duration: number};
const CH = data.chapters as Ch[];
const GIONG = voices as Record<string, VoiceTrack>;

const CO: Record<string, [number, number, number]> = {
  rong: [1, W / 2, 540],
  trung: [1.4, 760, 600],
  can: [2.1, 700, 470],
  sat: [3.0, 690, 420],
};

type Shot = Moc & {from: number; len: number};
type Hit = {from: number; len: number; src: string; cap?: string; ben: 'trai' | 'phai'};

const dung = (ch: Ch) => {
  const total = f(ch.duration);
  const texts = splitCues(ch.vo);
  const times = cueTimings(texts, total);
  const cues: Cue[] = texts.map((text, i) => ({text, start: times[i].start, end: times[i].end}));

  // Shot = khoảng giữa hai mốc trong bảng phân cảnh. Cảnh giữ nguyên tới
  // mốc kế tiếp, nên không cần khai báo từng shot một.
  const mocTho = neoNhieu(ch.vo, cues, BOARD[ch.id] ?? [], 'board');
  mocTho.sort((a, b) => a.at - b.at);

  // Gộp mốc nào nằm sát mốc trước dưới NGAN_NHAT.
  // Trung bình 3.7s/cắt đã gần kênh tham chiếu (4.6s), nhưng vài shot chỉ
  // 1-2 giây làm cả đoạn giật. Bỏ mốc quá sát thì trung vị lên, phần còn
  // lại giữ nguyên vị trí — không đụng tới chỗ đã khớp lời.
  const NGAN_NHAT = f(2.8);
  const moc: typeof mocTho = [];
  for (const m of mocTho) {
    if (moc.length === 0 || m.at - moc[moc.length - 1].at >= NGAN_NHAT) moc.push(m);
  }

  const shots: Shot[] = moc.map((m, i) => ({
    ...m,
    from: i === 0 ? 0 : m.at,
    len: Math.max(f(0.5), (i + 1 < moc.length ? moc[i + 1].at : total) - (i === 0 ? 0 : m.at)),
  }));

  const memes: Hit[] = neoNhieu(ch.vo, cues, MEME[ch.id] ?? [], 'meme').map((m, i) => ({
    from: m.at,
    len: f(m.giay ?? 2.6),
    src: m.src,
    cap: m.cap,
    ben: i % 2 === 0 ? 'phai' : 'trai',
  }));

  const sfx = neoNhieu(ch.vo, cues, SFX[ch.id] ?? [], 'sfx').map((s) => ({from: s.at, sfx: s.sfx}));

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
export const VUI2_DURATION = INTRO + lens.reduce((a, b) => a + b, 0);

/**
 * Khung nhìn. Máy đẩy vào rất chậm và LIÊN TỤC trong suốt shot — mắt người
 * chỉ chấp nhận là "mượt" khi tốc độ không đổi giữa chừng.
 */
const Khung: React.FC<{co: string; children: React.ReactNode}> = ({co, children}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const [z, cx, cy] = CO[co] ?? CO.rong;
  const t = interpolate(frame, [0, durationInFrames], [0, 1], {extrapolateRight: 'clamp'});
  const zoom = z * (1 + 0.045 * t);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
      <g transform={`translate(${W / 2 - cx * zoom} ${H / 2 - cy * zoom}) scale(${zoom})`}>{children}</g>
    </svg>
  );
};

const Vao: React.FC<{i: number; children: React.ReactNode}> = ({i, children}) => {
  const frame = useCurrentFrame();
  const kieu = i % 4;
  if (kieu === 0) return <>{children}</>;
  const p = interpolate(frame, [0, 6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const tf =
    kieu === 1
      ? `translateX(${interpolate(p, [0, 1], [W * 0.35, 0])}px)`
      : kieu === 2
        ? `scale(${interpolate(p, [0, 1], [1.14, 1])})`
        : `translateY(${interpolate(p, [0, 1], [-H * 0.3, 0])}px)`;
  return <AbsoluteFill style={{transform: tf, opacity: interpolate(p, [0, 0.4], [0, 1], {extrapolateRight: 'clamp'})}}>{children}</AbsoluteFill>;
};

const Meme: React.FC<{src: string; cap?: string; ben: 'trai' | 'phai'}> = ({src, cap, ben}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const vao = interpolate(frame, [0, 5], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.back(2)),
  });
  const ra = interpolate(frame, [durationInFrames - 5, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const huong = ben === 'phai' ? 1 : -1;
  return (
    <AbsoluteFill
      style={{
        alignItems: ben === 'phai' ? 'flex-end' : 'flex-start',
        justifyContent: 'center',
        padding: '0 70px 210px',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: 400,
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
              fontSize: 32,
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

const Dap: React.FC<{moc: number[]; children: React.ReactNode}> = ({moc, children}) => {
  const frame = useCurrentFrame();
  const gan = moc.find((m) => frame >= m && frame < m + 12);
  if (gan === undefined) return <>{children}</>;
  const t = frame - gan;
  const decay = Math.exp(-t * 0.32);
  const rung = Math.sin(t * 2.2) * 13 * decay;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `translate(${rung}px, ${rung * 0.4}px) scale(${1 + 0.04 * decay})`}}>
        {children}
      </AbsoluteFill>
      {t < 3 ? <AbsoluteFill style={{background: '#fff', opacity: 0.26 - t * 0.09}} /> : null}
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
  const ra = interpolate(frame, [f(2.8), f(3.5)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
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
            fontSize: 64,
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

const Chuong: React.FC<{ch: Ch; d: ReturnType<typeof dung>; goc: number}> = ({ch, d, goc}) => {
  const giong = GIONG[ch.id];
  return (
    <AbsoluteFill style={{background: P.ink}}>
      <Dap moc={d.dap}>
        {d.shots.map((s, i) => {
          const Noi = CANH[s.canh] ?? CANH['phong-tro'];
          return (
            <Sequence key={i} from={s.from} durationInFrames={s.len}>
              <Vao i={i}>
                <Khung co={s.co ?? 'trung'}>
                  <Noi />
                  {/* vật tiền cảnh che một phần khung: máy quay đứng TRONG
                      phòng chứ không dán hình phẳng. Chỉ dùng ở cỡ rộng và
                      trung — cận mặt mà có vật che thì rối. */}
                  {(s.co === 'rong' || s.co === 'trung') && i % 3 === 1 ? (
                    <TienCanh kieu={i % 2 === 0 ? 'ban' : 'ghe'} ben={i % 4 < 2 ? 'trai' : 'phai'} />
                  ) : null}
                  {s.nguoi === false ? null : (
                    <NhanVat
                      dang={s.dang ?? 'dung'}
                      dangTruoc={d.shots[i - 1]?.dang ?? 'dung'}
                      giong={giong}
                      goc={s.from}
                      sac={(s.sac ?? 'thuong') as Sac}
                      x={s.x ?? 700}
                      y={SAN}
                      s={1.04}
                      vi={interpolate(CH.indexOf(ch), [0, CH.length - 1], [1, 0.35])}
                    />
                  )}
                  <ToiRia manh={0.5} />
                </Khung>
              </Vao>
            </Sequence>
          );
        })}
      </Dap>

      {d.memes.map((m, i) => (
        <Sequence key={`m${i}`} from={m.from} durationInFrames={m.len}>
          <Meme src={m.src} cap={m.cap} ben={m.ben} />
        </Sequence>
      ))}
      {d.sfx.map((s, i) => (
        <Sequence key={`s${i}`} from={s.from} durationInFrames={f(2)}>
          <Audio src={staticFile(`sfx/${s.sfx}.wav`)} volume={0.38} />
        </Sequence>
      ))}

      <NhanChuong kicker={ch.kicker} heading={ch.heading} />
      <Sub cues={d.cues} />
      <Audio src={staticFile(ch.audio)} />
      <Audio src={staticFile(NHAC[ch.id] ?? 'audio/25-silly-fun.mp3')} volume={0.1} loop />
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
  const b = interpolate(frame, [22, 34], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const Noi = CANH['le-tot-nghiep'];
  return (
    <AbsoluteFill style={{background: P.ink}}>
      <Khung co="trung">
        <Noi />
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
              WebkitTextStroke: '12px #14121c',
              paintOrder: 'stroke fill',
            }}
          >
            sổ tay sống sót cho tân binh
          </div>
        </div>
      </AbsoluteFill>
      <Audio src={staticFile('audio/25-silly-fun.mp3')} volume={0.24} />
    </AbsoluteFill>
  );
};

export const RaTruongVui2: React.FC = () => (
  <AbsoluteFill style={{background: P.ink}}>
    <Sequence durationInFrames={INTRO}>
      <MoDau />
    </Sequence>
    {CH.map((ch, i) => (
      <Sequence key={ch.id} from={starts[i]} durationInFrames={lens[i]}>
        <Chuong ch={ch} d={CHUONG[i]} goc={starts[i]} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
