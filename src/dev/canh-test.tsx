import React from 'react';
import {AbsoluteFill} from 'remotion';
import {HOC_DUONG} from '../library/scenes/hoc-duong';

/** Bảng thử 8 bối cảnh học đường. */
const ten = Object.keys(HOC_DUONG);

export const CanhTest: React.FC = () => (
  <AbsoluteFill style={{background: '#14121c', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)'}}>
    {ten.map((k) => {
      const C = HOC_DUONG[k];
      return (
        <div key={k} style={{position: 'relative', overflow: 'hidden', border: '2px solid #000'}}>
          <svg viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
            <C />
          </svg>
          <div style={{position: 'absolute', left: 12, bottom: 10, fontFamily: 'system-ui', fontSize: 26,
            fontWeight: 800, color: '#fff', background: 'rgba(0,0,0,0.7)', padding: '4px 12px', borderRadius: 6}}>
            {k}
          </div>
        </div>
      );
    })}
  </AbsoluteFill>
);
