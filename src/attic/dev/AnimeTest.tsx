import React from 'react';
import {AbsoluteFill} from 'remotion';
import {AnimeTeo, AnimePhong} from '../anime/Char';
import {A, SkyBg, SpeedLines, Burst, ScreenTone, ImpactText} from '../anime/fx';

export const AnimeTest: React.FC = () => (
  <AbsoluteFill>
    <SkyBg tone="chieu" />
    <svg viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
      <defs><ScreenTone id="tone" /></defs>
      <g opacity={0.28}><Burst cx={1450} cy={480} color={A.gold} /></g>
      <rect x={0} y={900} width={1920} height={180} fill="#6b4f8a" />
      <g transform="translate(250 900)"><AnimeTeo mood="vui" vi={1} s={1.05} /></g>
      <g transform="translate(560 900)"><AnimeTeo mood="soc" vi={0.5} s={1.05} /></g>
      <g transform="translate(870 900)"><AnimeTeo mood="tuc" vi={0.2} s={1.05} /></g>
      <g transform="translate(1180 900)"><AnimeTeo mood="khoc" vi={0} s={1.05} /></g>
      <g transform="translate(1560 560)"><AnimePhong size={0.75} mood="doi" /></g>
    </svg>
  </AbsoluteFill>
);
