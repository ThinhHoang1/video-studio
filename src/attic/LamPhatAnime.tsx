import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {BOARD} from './story/board';
import {AnimeShot, AnimeIntro} from './anime/render';
import {Sub, Cue} from './story/Sub';
import {splitCues, cueTimings} from './components/Caption2';
import {FxDefs} from './anime/fx';
import data from './lam-phat.generated.json';
import {FPS} from './theme';

const f = (sec: number) => Math.round(sec * FPS);
type Ch = {id: string; vo: string; audio: string; duration: number};
const CH = data.chapters as Ch[];

const norm = (s: string) =>
  s.toLowerCase().replace(/[.,!?;:"'…]/g, '').replace(/\s+/g, ' ').trim();

const build = (ch: Ch) => {
  const board = BOARD.find((b) => b.id === ch.id);
  const total = f(ch.duration);
  const texts = splitCues(ch.vo);
  const times = cueTimings(texts, total);
  const cues: Cue[] = texts.map((text, i) => ({text, start: times[i].start, end: times[i].end}));
  if (!board) return {cues, shots: []};

  const anchors = board.shots.map((shot) => {
    const key = norm(shot.say);
    let idx = texts.findIndex((t) => norm(t).includes(key));
    if (idx === -1) {
      const head = key.split(' ').slice(0, 4).join(' ');
      idx = texts.findIndex((t) => norm(t).includes(head));
    }
    if (idx === -1) {
      console.warn(`[anime] ${ch.id}: không khớp "${shot.say}"`);
      idx = 0;
    }
    return {shot, from: Math.round(times[idx].start)};
  });
  anchors.sort((a, b) => a.from - b.from);

  return {
    cues,
    shots: anchors.map((a, i) => ({
      shot: a.shot,
      from: a.from,
      len: Math.max(f(0.5), (i + 1 < anchors.length ? anchors[i + 1].from : total) - a.from),
    })),
  };
};

const CHAPTERS = CH.map(build);
const PAD = f(0.2);
const INTRO = f(3.6);
const lens = CH.map((c) => f(c.duration) + PAD);
const starts: number[] = [];
lens.reduce((acc, l, i) => {
  starts[i] = acc;
  return acc + l;
}, INTRO);
export const ANIME_DURATION = INTRO + lens.reduce((a, b) => a + b, 0);

export const LamPhatAnime: React.FC = () => (
  <AbsoluteFill style={{background: '#1a1526'}}>
    <FxDefs />
    <Sequence durationInFrames={INTRO}>
      <AnimeIntro />
    </Sequence>
    {CH.map((c, i) => (
      <Sequence key={c.id} from={starts[i]} durationInFrames={lens[i]}>
        <AbsoluteFill>
          {CHAPTERS[i].shots.map((s, k) => (
            <Sequence key={k} from={s.from} durationInFrames={s.len}>
              <AnimeShot shot={s.shot} />
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
