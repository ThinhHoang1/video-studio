import React from 'react';
import {AbsoluteFill} from 'remotion';
import {KenBurns, Pan} from './KenBurns';
import {Caption} from './Caption';
import {Vignette} from './Vignette';
import {Grain} from './Grain';
import {StatBadge} from './StatBadge';

export type SceneProps = {
  src: string;
  pan?: Pan;
  kicker?: string;
  title: string;
  sub?: string;
  align?: 'left' | 'center';
  stat?: {value: string; label: string};
};

export const Scene: React.FC<SceneProps> = ({src, pan, kicker, title, sub, align, stat}) => (
  <AbsoluteFill>
    <KenBurns src={src} pan={pan} />
    <AbsoluteFill
      style={{
        background:
          'linear-gradient(to top, rgba(4,10,18,0.88) 0%, rgba(4,10,18,0.35) 42%, rgba(4,10,18,0.15) 100%)',
      }}
    />
    <Vignette />
    <Caption kicker={kicker} title={title} sub={sub} align={align} delay={6} />
    {stat ? <StatBadge value={stat.value} label={stat.label} delay={18} /> : null}
    <Grain />
  </AbsoluteFill>
);
