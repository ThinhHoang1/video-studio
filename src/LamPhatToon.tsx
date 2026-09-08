import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {Stage, Framing} from './toon/Stage';
import {SCENES, SceneName} from './toon/scenes';
import {Expr} from './toon/Char';
import {Enter} from './shots/Enter';
import {splitCues, cueTimings} from './components/Caption2';
import data from './lam-phat.generated.json';
import {FPS} from './theme';
import {FONT} from './font';

const f = (sec: number) => Math.round(sec * FPS);

type Ch = {id: string; vo: string; audio: string; duration: number};
const CH = data.chapters as Ch[];

/** Nhịp cắt đo được từ kênh tham chiếu: khoảng 2,2 giây một cắt. */
const TARGET_CUT = 2.2;
const MIN_CUT = 1.1;

type ChapterPlan = {
  scene: SceneName;
  /** vòng lặp cỡ cảnh — đây là thứ tạo ra cắt cảnh mà không cần vẽ tranh mới */
  framings: Framing[];
  /** vòng lặp biểu cảm nhân vật */
  exprs: Expr[];
  /** dịch tâm khung cho từng shot, khớp theo chỉ số framing */
  offsets?: Record<string, [number, number]>;
  /** nhãn chữ bật lên ở shot thứ mấy */
  labelAt?: Record<number, string>;
};

const PLAN: Record<string, ChapterPlan> = {
  hook: {
    scene: 'stall',
    framings: ['wide', 'close', 'mid', 'xclose', 'wide', 'prop', 'close'],
    exprs: ['happy', 'sus', 'shock', 'angry', 'angry', 'dead', 'shock'],
    offsets: {close: [-380, -70], xclose: [340, -80], prop: [0, -180]},
  },
  'dinh-nghia': {
    scene: 'shrinkMoney',
    framings: ['mid', 'prop', 'close', 'wide', 'xclose', 'prop', 'mid', 'close'],
    exprs: ['sus', 'shock', 'shock', 'cry', 'cry', 'dead', 'dead', 'cry'],
    offsets: {prop: [280, -110], close: [-240, -60], xclose: [-240, -70]},
  },
  'in-tien': {
    scene: 'printer',
    framings: ['wide', 'close', 'mid', 'prop', 'wide', 'xclose', 'prop', 'close'],
    exprs: ['smug', 'greedy', 'greedy', 'happy', 'smug', 'greedy', 'happy', 'smug'],
    offsets: {close: [-280, -60], xclose: [-280, -70], prop: [440, 150]},
  },
  zimbabwe: {
    scene: 'flood',
    framings: ['wide', 'close', 'mid', 'xclose', 'wide', 'close', 'mid'],
    exprs: ['shock', 'shock', 'dizzy', 'dizzy', 'dead', 'dead', 'shock'],
    labelAt: {2: '79.000.000.000%', 5: '3 QUẢ TRỨNG'},
  },
  shrinkflation: {
    scene: 'chips',
    framings: ['wide', 'prop', 'close', 'mid', 'prop', 'xclose', 'wide', 'close'],
    exprs: ['happy', 'sus', 'sus', 'angry', 'angry', 'shock', 'angry', 'dead'],
    offsets: {prop: [280, -20], close: [-360, -60], xclose: [-360, -70]},
  },
  skimpflation: {
    scene: 'chips',
    framings: ['mid', 'close', 'prop', 'wide', 'xclose', 'prop', 'mid', 'close'],
    exprs: ['sus', 'angry', 'angry', 'dead', 'dead', 'shock', 'angry', 'dizzy'],
    offsets: {prop: [280, -20], close: [-360, -60], xclose: [-360, -70]},
  },
  luong: {
    scene: 'salary',
    framings: ['wide', 'close', 'mid', 'xclose', 'wide', 'close', 'prop', 'mid', 'xclose'],
    exprs: ['happy', 'happy', 'happy', 'shock', 'shock', 'dead', 'cry', 'cry', 'dead'],
    offsets: {close: [340, -60], xclose: [340, -70], prop: [-330, -60]},
  },
  'lai-suat': {
    scene: 'brake',
    framings: ['wide', 'prop', 'close', 'mid', 'prop', 'wide'],
    exprs: ['sus', 'shock', 'shock', 'dizzy', 'dead', 'cry'],
    offsets: {prop: [290, -60], close: [-300, -60]},
  },
  'ai-loi': {
    scene: 'debt',
    framings: ['wide', 'close', 'mid', 'prop', 'xclose', 'wide'],
    exprs: ['cry', 'cry', 'dead', 'greedy', 'smug', 'smug'],
    offsets: {close: [-240, -60], xclose: [380, -70], prop: [380, -40]},
  },
  'lam-gi': {
    scene: 'win',
    framings: ['wide', 'close', 'mid', 'close', 'wide'],
    exprs: ['sus', 'happy', 'happy', 'smug', 'happy'],
    offsets: {close: [-180, -60]},
  },
  ket: {
    scene: 'win',
    framings: ['mid', 'close', 'wide', 'xclose'],
    exprs: ['happy', 'smug', 'happy', 'happy'],
    offsets: {close: [-180, -60], xclose: [300, -70]},
  },
};

const ENTERS = ['cut', 'whipL', 'cut', 'pushUp', 'zoomBlur', 'cut', 'whipR', 'slideL', 'cut', 'pushDown'] as const;

type PlannedShot = {
  from: number;
  duration: number;
  framing: Framing;
  expr: Expr;
  p: number;
  offset: [number, number];
  enter: (typeof ENTERS)[number];
  label?: string;
};

/** Cắt theo ranh giới câu nói, gom cho tới khi đủ ~2,2 giây thì cắt. */
const planChapter = (ch: Ch): PlannedShot[] => {
  const plan = PLAN[ch.id];
  const total = f(ch.duration);
  const times = cueTimings(splitCues(ch.vo), total);

  const groups: {start: number; end: number}[] = [];
  let start = 0;
  for (let i = 0; i < times.length; i++) {
    const end = times[i].end;
    if (end - start >= f(TARGET_CUT) || i === times.length - 1) {
      if (end - start < f(MIN_CUT) && groups.length) groups[groups.length - 1].end = end;
      else groups.push({start, end});
      start = end;
    }
  }

  return groups.map((g, i) => {
    const framing = plan.framings[i % plan.framings.length];
    return {
      from: Math.round(g.start),
      duration: Math.max(1, Math.round(g.end - g.start)),
      framing,
      expr: plan.exprs[i % plan.exprs.length],
      // tiến trình câu chuyện trong chương: 0 ở đầu, 1 ở cuối
      p: groups.length > 1 ? i / (groups.length - 1) : 1,
      offset: plan.offsets?.[framing] ?? [0, 0],
      enter: i === 0 ? 'cut' : ENTERS[i % ENTERS.length],
      label: plan.labelAt?.[i],
    };
  });
};

const shotsByChapter = CH.map(planChapter);

const PAD = f(0.25);
const INTRO = f(3);
const lens = CH.map((c) => f(c.duration) + PAD);
const starts: number[] = [];
lens.reduce((acc, l, i) => {
  starts[i] = acc;
  return acc + l;
}, INTRO);
export const TOON_DURATION = INTRO + lens.reduce((a, b) => a + b, 0);

const Chapter: React.FC<{c: Ch; shots: PlannedShot[]}> = ({c, shots}) => {
  const Scene = SCENES[PLAN[c.id].scene];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {shots.map((s, i) => (
        <Sequence key={i} from={s.from} durationInFrames={s.duration}>
          <Enter kind={s.enter}>
            <Stage framing={s.framing} offset={s.offset} push={0.05}>
              <Scene expr={s.expr} p={s.p} label={s.label} />
            </Stage>
          </Enter>
        </Sequence>
      ))}
      <Audio src={staticFile(c.audio)} />
    </AbsoluteFill>
  );
};

const Intro: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Stage framing="wide" push={0.08}>
      <SCENES.ring left="LẠM PHÁT" right="VÍ CỦA MÀY" />
    </Stage>
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 90}}>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 84,
          fontWeight: 900,
          color: '#fff6e5',
          WebkitTextStroke: '16px #1a1410',
          paintOrder: 'stroke fill',
          textAlign: 'center',
        }}
      >
        vì sao lương tăng mà mày vẫn nghèo đi
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);

export const LamPhatToon: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Sequence durationInFrames={INTRO}>
      <Intro />
    </Sequence>
    {CH.map((c, i) => (
      <Sequence key={c.id} from={starts[i]} durationInFrames={lens[i]}>
        <Chapter c={c} shots={shotsByChapter[i]} />
      </Sequence>
    ))}
    <Audio src={staticFile('audio/04-the-farmer.mp3')} volume={0.075} loop />
  </AbsoluteFill>
);
