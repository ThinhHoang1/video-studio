import React from 'react';
import {AbsoluteFill} from 'remotion';
import {AN_DU} from '../library/scenes/an-du';

/** Bảng thử 8 cảnh ẩn dụ — xem một lượt trước khi đem vào phim. */
const ten = Object.keys(AN_DU);

export const AnDuTest: React.FC = () => (
  <AbsoluteFill style={{background: '#14121c', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)'}}>
    {ten.map((k) => {
      const C = AN_DU[k];
      return (
        <div key={k} style={{position: 'relative', overflow: 'hidden', borderRight: '2px solid #000', borderBottom: '2px solid #000'}}>
          <svg viewBox="0 0 1920 1080" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
            <C />
          </svg>
          <div
            style={{
              position: 'absolute',
              left: 12,
              bottom: 10,
              fontFamily: 'system-ui',
              fontSize: 26,
              fontWeight: 800,
              color: '#fff',
              background: 'rgba(0,0,0,0.65)',
              padding: '4px 12px',
              borderRadius: 6,
            }}
          >
            {k}
          </div>
        </div>
      );
    })}
  </AbsoluteFill>
);
