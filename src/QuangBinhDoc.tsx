import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {KenBurns, Pan} from './components/KenBurns';
import {Subtitle} from './components/Subtitle';
import {Vignette} from './components/Vignette';
import {Grain} from './components/Grain';
import {MemeCut} from './components/MemeCut';
import {ChapterTitle} from './components/ChapterTitle';
import {TitleCard} from './components/TitleCard';
import {EndCard} from './components/EndCard';
import narration from './narration.generated.json';
import {FPS} from './theme';

type Meme = {src: string; caption?: string; side?: 'left' | 'right'; atSec: number; durSec: number; size?: number};

type Chapter = {
  id: string;
  image: string;
  pan?: Pan;
  kicker?: string;
  heading: string;
  vo: string;
  audio: string;
  music: string;
  duration: number;
  memes?: Meme[];
};

const CH = narration.chapters as Chapter[];
const f = (sec: number) => Math.round(sec * FPS);

const INTRO = f(5);
const OUTRO = f(7);
const PAD = f(0.55); // khoảng lặng giữa hai chương

const chapterFrames = CH.map((c) => f(c.duration) + PAD);

const starts: number[] = [];
chapterFrames.reduce((acc, len, i) => {
  starts[i] = acc;
  return acc + len;
}, INTRO);

export const DOC_DURATION = INTRO + chapterFrames.reduce((a, b) => a + b, 0) + OUTRO;

const Chapter: React.FC<{c: Chapter}> = ({c}) => (
  <AbsoluteFill>
    <KenBurns src={c.image} pan={c.pan} strength={0.16} />
    <AbsoluteFill
      style={{
        background:
          'linear-gradient(to top, rgba(4,10,18,0.92) 0%, rgba(4,10,18,0.42) 38%, rgba(4,10,18,0.2) 100%)',
      }}
    />
    <Vignette />
    <ChapterTitle kicker={c.kicker} heading={c.heading} />
    <Subtitle text={c.vo} />
    {(c.memes ?? []).map((m, i) => (
      <Sequence key={i} from={f(m.atSec)} durationInFrames={f(m.durSec)}>
        <MemeCut src={m.src} caption={m.caption} side={m.side} size={m.size} />
      </Sequence>
    ))}
    <Grain />
    <Audio src={staticFile(c.audio)} />
    <Audio src={staticFile(c.music)} volume={0.16} loop />
  </AbsoluteFill>
);

export const QuangBinhDoc: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#040a12'}}>
    <Sequence durationInFrames={INTRO}>
      <TitleCard
        src="qb/03-sondoong3.jpg"
        tag="Việt Nam · Miền Trung"
        title="QUẢNG BÌNH"
        sub="Vương quốc hang động — và những chuyện chưa kể"
      />
      <Audio src={staticFile('audio/03-ancient-rite.mp3')} volume={0.3} />
    </Sequence>

    {CH.map((c, i) => (
      <Sequence key={c.id} from={starts[i]} durationInFrames={chapterFrames[i]}>
        <Chapter c={c} />
      </Sequence>
    ))}

    <Sequence from={DOC_DURATION - OUTRO} durationInFrames={OUTRO}>
      <EndCard src="qb/09-thienduong2.jpg" handle="#QuangBinh · #PhongNhaKeBang · #SonDoong" />
      <Audio src={staticFile('audio/01-earth-prelude.mp3')} volume={0.28} />
    </Sequence>
  </AbsoluteFill>
);
