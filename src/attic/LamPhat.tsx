import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import {Caption2} from './components/Caption2';
import {Grain} from './components/Grain';
import {ShotView} from './shots/Shots';
import {Enter} from './shots/Enter';
import {planShots} from './shots/plan';
import type {ShotKind, Shot} from './shots/types';
import {FONT} from './font';
import data from './lam-phat.generated.json';
import {FPS} from './theme';

const f = (sec: number) => Math.round(sec * FPS);

type Ch = {
  id: string;
  art: string;
  kicker: string;
  heading: string;
  vo: string;
  audio: string;
  duration: number;
};

const CH = data.chapters as Ch[];

/** Nhịp cắt và nội dung shot chữ/số cho từng chương. */
const PLAN: Record<string, {pattern: ShotKind[]; beats: Partial<Shot>[]; focus: [number, number, number][]}> = {
  hook: {
    pattern: ['wide', 'detail', 'statement', 'wide', 'meme'],
    beats: [
      {text: 'cùng bát phở\n*ít thịt hơn*'},
      {meme: 'meme/khaby-lame.jpg', memeCap: 'ông bán phở cũng đang chửi'},
    ],
    focus: [[0.28, 0.28, 2.1]],
  },
  'dinh-nghia': {
    pattern: ['statement', 'wide', 'split', 'detail', 'statement', 'wide'],
    beats: [
      {text: 'Lạm phát *không phải*\ngiá tăng'},
      {text: 'Tờ tiền vẫn ghi\n*500.000*'},
      {text: 'Nó mất giá\nnhư *tóc mày rụng*'},
    ],
    focus: [[0.5, 0.45, 2.0]],
  },
  'in-tien': {
    pattern: ['wide', 'split', 'number', 'detail', 'statement', 'meme'],
    beats: [
      {text: '10 ổ bánh mì\n*100.000₫*'},
      {value: 10, prefix: '×', text: 'in thêm 10 lần tiền'},
      {text: 'Bánh mì vẫn\n*đúng 10 ổ*'},
      {meme: 'meme/stonks.png', memeCap: 'in thêm tiền = giàu thêm?'},
    ],
    focus: [[0.75, 0.78, 1.9]],
  },
  zimbabwe: {
    pattern: ['statement', 'wide', 'number', 'detail', 'meme', 'wide'],
    beats: [
      {text: 'Zimbabwe\n*2008*'},
      {value: 79000000000, suffix: '%', text: 'lạm phát trong MỘT tháng'},
      {meme: 'meme/panik-kalm-panik.png', memeCap: 'giá gấp đôi sau mỗi 24 tiếng'},
    ],
    focus: [[0.5, 0.4, 1.7]],
  },
  shrinkflation: {
    pattern: ['statement', 'wide', 'detail', 'number', 'split', 'meme'],
    beats: [
      {text: '*SHRINKFLATION*\nlạm phát mặc áo tàng hình'},
      {value: 60, prefix: '', suffix: 'g', text: 'từ 80g xuống còn'},
      {text: 'Giá vẫn *10.000₫*\nruột thì bớt 25%'},
      {meme: 'meme/cheems.jpg', memeCap: '70% trong gói là khí'},
    ],
    focus: [[0.5, 0.62, 1.8]],
  },
  skimpflation: {
    pattern: ['statement', 'wide', 'detail', 'split', 'meme', 'wide'],
    beats: [
      {text: '*SKIMPFLATION*\ngiá y nguyên, chất lượng đi xuống'},
      {text: 'Sô cô la\n*70% → 22%* cacao'},
      {meme: 'meme/woman-cat.jpg', memeCap: '"xin lỗi, tôi chưa hiểu câu hỏi"'},
    ],
    focus: [[0.33, 0.45, 1.9]],
  },
  luong: {
    pattern: ['statement', 'wide', 'number', 'detail', 'statement', 'meme'],
    beats: [
      {text: 'Sếp tăng lương\n*+7%*'},
      {value: -3, suffix: '%', text: 'sức mua thực tế của mày'},
      {text: 'Mày vừa bị *giảm lương*\nvà mày nói cảm ơn'},
      {meme: 'meme/pooh.png', memeCap: 'lương danh nghĩa vs lương thực tế'},
    ],
    focus: [[0.5, 0.55, 1.7]],
  },
  'lai-suat': {
    pattern: ['wide', 'statement', 'detail', 'split', 'wide'],
    beats: [
      {text: 'Thuốc chữa:\n*tăng lãi suất*'},
      {text: 'Chỉ có *MỘT* cái phanh\ncho cả nền kinh tế'},
    ],
    focus: [[0.25, 0.5, 1.9]],
  },
  'ai-loi': {
    pattern: ['statement', 'wide', 'split', 'detail', 'statement'],
    beats: [
      {text: 'Lạm phát\n*không phải ai cũng thiệt*'},
      {text: 'Vay 2 tỷ, 10 năm sau\nchỉ còn đáng *1 tỷ*'},
      {text: '"Thứ thuế duy nhất\náp mà *không cần luật*"'},
    ],
    focus: [[0.72, 0.45, 1.8]],
  },
  'lam-gi': {
    pattern: ['statement', 'wide', 'detail', 'detail', 'statement'],
    beats: [
      {text: 'Ba việc\n*làm được ngay*'},
      {text: 'Thu nhập phải chạy\n*nhanh hơn lạm phát*'},
    ],
    focus: [
      [0.22, 0.45, 2.0],
      [0.78, 0.45, 2.0],
    ],
  },
  ket: {
    pattern: ['wide', 'detail', 'statement', 'wide'],
    beats: [{text: 'Đứng yên trong lạm phát\n*không phải là an toàn*'}],
    focus: [[0.5, 0.35, 1.8]],
  },
};

const DEFAULT_PLAN = {pattern: ['wide', 'detail', 'statement', 'wide'] as ShotKind[], beats: [], focus: []};

const PAD = f(0.3);
const INTRO = f(3.4);

const chapterShots = CH.map((c) => {
  const p = PLAN[c.id] ?? DEFAULT_PLAN;
  const shots = planShots({vo: c.vo, audioFrames: f(c.duration), fps: FPS, pattern: p.pattern, beats: p.beats});
  // gán vùng crop cho các shot 'detail' theo thứ tự
  let di = 0;
  for (const s of shots) {
    if (s.kind === 'detail') s.focus = p.focus[di++ % Math.max(1, p.focus.length)] ?? [0.5, 0.45, 1.9];
  }
  return shots;
});

const lens = CH.map((c) => f(c.duration) + PAD);
const starts: number[] = [];
lens.reduce((acc, l, i) => {
  starts[i] = acc;
  return acc + l;
}, INTRO);
export const LAMPHAT_DURATION = INTRO + lens.reduce((a, b) => a + b, 0);

const HUES = ['#171128', '#0e1c2b', '#2a1a10', '#0f1d17', '#241029', '#101119'];

/** Nền tĩnh: lưới trôi rất chậm. Không nhấp nháy, không đập theo nhịp. */
const Backdrop: React.FC<{hue: string}> = ({hue}) => {
  const frame = useCurrentFrame();
  const off = (frame * 0.35) % 96;
  return (
    <AbsoluteFill style={{background: hue}}>
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.04) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.04) 2px, transparent 2px)',
          backgroundSize: '96px 96px',
          backgroundPosition: `${off}px ${off}px`,
        }}
      />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 44%, transparent 34%, rgba(0,0,0,0.66) 100%)'}} />
    </AbsoluteFill>
  );
};

/** Tiền rơi 2D, chậm và mờ — chỉ để nền không chết, không để gây chú ý. */
const MoneyRain: React.FC<{n?: number}> = ({n = 9}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: 0.28}}>
      {new Array(n).fill(0).map((_, i) => {
        const t = ((frame * 1.1 + random(`o${i}`) * 1500) % 1500) / 1500;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${random(`x${i}`) * 100}%`,
              top: `${t * 120 - 12}%`,
              width: 66,
              height: 34,
              borderRadius: 5,
              background: '#2ec27e',
              border: '4px solid #0b0c12',
              transform: `rotate(${random(`r${i}`) * 360 + frame * 0.5}deg)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Nhãn chương ở góc — đứng yên, biến mất sau 3.5s. */
const Kicker: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  const inP = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const outP = interpolate(frame, [f(3.2), f(3.8)], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        position: 'absolute',
        top: 74,
        left: 84,
        opacity: inP * outP,
        transform: `translateY(${interpolate(inP, [0, 1], [-14, 0])}px)`,
        background: '#ffd23f',
        color: '#0b0c12',
        fontFamily: FONT,
        fontSize: 26,
        fontWeight: 900,
        letterSpacing: 5,
        textTransform: 'uppercase',
        padding: '11px 22px',
        borderRadius: 6,
      }}
    >
      {text}
    </div>
  );
};

const Chapter: React.FC<{c: Ch; i: number; shots: Shot[]}> = ({c, i, shots}) => (
  <AbsoluteFill>
    <Backdrop hue={HUES[i % HUES.length]} />
    <MoneyRain />
    {shots.map((s, k) => (
      <Sequence key={k} from={s.from} durationInFrames={s.duration}>
        <Enter kind={s.enter}>
          <ShotView shot={s} art={c.art} index={k} />
        </Enter>
      </Sequence>
    ))}
    <Kicker text={c.kicker} />
    <Caption2 text={c.vo} audioFrames={f(c.duration)} />
    <Grain opacity={0.04} />
    <Audio src={staticFile(c.audio)} />
  </AbsoluteFill>
);

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [4, 16], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const sub = interpolate(frame, [20, 32], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return (
    <AbsoluteFill>
      <Backdrop hue="#2a0e0e" />
      <MoneyRain n={18} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{textAlign: 'center', fontFamily: FONT}}>
          <div
            style={{
              fontSize: 230,
              fontWeight: 900,
              color: '#fff8ea',
              letterSpacing: -8,
              lineHeight: 1,
              opacity: p,
              transform: `scale(${interpolate(p, [0, 1], [1.14, 1])})`,
            }}
          >
            LẠM PHÁT
          </div>
          <div
            style={{
              marginTop: 26,
              fontSize: 56,
              fontWeight: 800,
              color: '#ffd23f',
              opacity: sub,
              transform: `translateY(${interpolate(sub, [0, 1], [22, 0])}px)`,
            }}
          >
            vì sao lương tăng mà mày vẫn nghèo đi
          </div>
        </div>
      </AbsoluteFill>
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};

export const LamPhat: React.FC = () => (
  <AbsoluteFill style={{background: '#0a0a0f', fontFamily: FONT}}>
    <Sequence durationInFrames={INTRO}>
      <Intro />
    </Sequence>
    {CH.map((c, i) => (
      <Sequence key={c.id} from={starts[i]} durationInFrames={lens[i]}>
        <Chapter c={c} i={i} shots={chapterShots[i]} />
      </Sequence>
    ))}
    <Audio src={staticFile('audio/04-the-farmer.mp3')} volume={0.085} loop />
  </AbsoluteFill>
);
