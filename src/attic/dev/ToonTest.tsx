import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Stage} from '../toon/Stage';
import {ScStall, ScRing, ScDebt, ScPrinter} from '../toon/scenes';

export const ToonTest: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <div style={{position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr'}}>
      <div style={{position: 'relative', overflow: 'hidden'}}>
        <Stage framing="wide"><ScStall p={0.8} expr="angry" /></Stage>
      </div>
      <div style={{position: 'relative', overflow: 'hidden'}}>
        <Stage framing="close"><ScStall p={0.8} expr="shock" /></Stage>
      </div>
      <div style={{position: 'relative', overflow: 'hidden'}}>
        <Stage framing="wide"><ScRing /></Stage>
      </div>
      <div style={{position: 'relative', overflow: 'hidden'}}>
        <Stage framing="wide"><ScDebt /></Stage>
      </div>
    </div>
  </AbsoluteFill>
);
