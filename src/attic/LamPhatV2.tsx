import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {BOARD} from './story/board';
import {ShotView} from './story/render';
import {Sub, Cue} from './story/Sub';
import {splitCues, cueTimings} from './components/Caption2';
import data from './lam-phat.generated.json';
import {FPS} from './theme';
import {FONT} from './font';
import {C} from './cast/Cast';

const f = (sec: number) => Math.round(sec * FPS);

type Ch = {id: string; vo: string; audio: string; duration: number};
const CH = data.chapters as Ch[];

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[.,!?;:"'…]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Neo mỗi shot vào đúng câu nó minh hoạ.
 * Tìm cụm phụ đề đầu tiên chứa `say`; shot bắt đầu từ đó và kéo dài tới shot
 * kế tiếp. Nếu không tìm thấy thì báo lỗi ngay lúc build thay vì để lệch âm
 * thầm — đây là chỗ dễ sai nhất nên phải ồn ào.
 */
const buildChapter = (ch: Ch) => {
  const board = BOARD.find((b) => b.id === ch.id);
  const total = f(ch.duration);
  const texts = splitCues(ch.vo);
  const times = cueTimings(texts, total);
  const cues: Cue[] = texts.map((text, i) => ({text, start: times[i].start, end: times[i].end}));

  if (!board) return {cues, shots: [] as {shot: (typeof BOARD)[0]['shots'][0]; from: number; len: number}[]};

  const anchors = board.shots.map((shot) => {
    const key = norm(shot.say);
    let idx = texts.findIndex((t) => norm(t).includes(key));
    if (idx === -1) {
      // câu bị cắt qua hai cụm -> khớp theo vài từ đầu
      const head = key.split(' ').slice(0, 4).join(' ');
      idx = texts.findIndex((t) => norm(t).includes(head));
    }
    if (idx === -1) {
      console.warn(`[board] ${ch.id}: không tìm thấy câu "${shot.say}"`);
      idx = 0;
    }
    return {shot, from: Math.round(times[idx].start)};
  });

  anchors.sort((a, b) => a.from - b.from);

  const shots = anchors.map((a, i) => ({
    shot: a.shot,
    from: a.from,
    len: Math.max(f(0.5), (i + 1 < anchors.length ? anchors[i + 1].from : total) - a.from),
  }));

  return {cues, shots};
};

const CHAPTERS = CH.map(buildChapter);

const PAD = f(0.2);
const INTRO = f(3.6);
const lens = CH.map((c) => f(c.duration) + PAD);
const starts: number[] = [];
lens.reduce((acc, l, i) => {
  starts[i] = acc;
  return acc + l;
}, INTRO);
export const V2_DURATION = INTRO + lens.reduce((a, b) => a + b, 0);

const Intro: React.FC = () => (
  <AbsoluteFill style={{background: '#14121c'}}>
    <ShotView
      shot={{
        say: '',
        place: 'quan',
        cut: 'trung',
        actors: [
          {who: 'teo', mood: 'vui', x: 560, vi: 1},
          {who: 'phong', size: 0.32, x: 1440, y: 620, mood: 'nham'},
        ],
        enter: 'zoom',
        sfx: 'riser',
      }}
    />
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingBottom: 120}}>
      <div style={{textAlign: 'center'}}>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 190,
            fontWeight: 900,
            color: C.paper,
            letterSpacing: -6,
            WebkitTextStroke: '20px #14121c',
            paintOrder: 'stroke fill',
          }}
        >
          LẠM PHÁT
        </div>
        <div
          style={{
            marginTop: 8,
            fontFamily: FONT,
            fontSize: 58,
            fontWeight: 900,
            color: C.gold,
            WebkitTextStroke: '14px #14121c',
            paintOrder: 'stroke fill',
          }}
        >
          vì sao lương tăng mà mày vẫn nghèo đi
        </div>
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);

export const LamPhatV2: React.FC = () => (
  <AbsoluteFill style={{background: '#14121c'}}>
    <Sequence durationInFrames={INTRO}>
      <Intro />
    </Sequence>

    {CH.map((c, i) => (
      <Sequence key={c.id} from={starts[i]} durationInFrames={lens[i]}>
        <AbsoluteFill>
          {CHAPTERS[i].shots.map((s, k) => (
            <Sequence key={k} from={s.from} durationInFrames={s.len}>
              <ShotView shot={s.shot} />
            </Sequence>
          ))}
          <Sub cues={CHAPTERS[i].cues} />
          <Audio src={staticFile(c.audio)} />
        </AbsoluteFill>
      </Sequence>
    ))}

    <Audio src={staticFile('audio/04-the-farmer.mp3')} volume={0.07} loop />
  </AbsoluteFill>
);
