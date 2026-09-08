import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Teo, Phong, Sep, C} from '../cast/Cast';

export const CastTest: React.FC = () => (
  <AbsoluteFill style={{background: C.bg1}}>
    <svg viewBox="0 0 1920 1080" width="100%" height="100%">
      <rect x={0} y={0} width={1920} height={1080} fill={C.bg1} />
      <rect x={0} y={860} width={1920} height={220} fill="#e0b98c" />
      <g transform="translate(230 860)"><Teo mood="vui" viDay={1} s={1} /></g>
      <g transform="translate(560 860)"><Teo mood="soc" viDay={0.5} s={1} /></g>
      <g transform="translate(880 860)"><Teo mood="khoc" viDay={0} s={1} /></g>
      <g transform="translate(1300 640)"><Phong size={0.25} mood="cuoi" /></g>
      <g transform="translate(1660 560)"><Phong size={0.75} mood="doi" /></g>
      <g transform="translate(1120 860)"><Sep s={0.8} /></g>
    </svg>
  </AbsoluteFill>
);
