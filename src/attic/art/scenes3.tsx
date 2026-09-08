import React from 'react';
import {FONT} from '../font';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {ArtFrame, Bill, C, Face, STROKE, Sunburst} from './kit';
import {bounceIn, wobble} from '../motion/easing';

/** 9. Bập bênh: thằng nợ cười, người gửi tiết kiệm khóc. */
export const ArtWinners: React.FC = () => {
  const frame = useCurrentFrame();
  const tilt = interpolate(frame, [20, 80], [0, -13], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const Person: React.FC<{x: number; y: number; color: string; mood: 'smug' | 'sad'; label: string; sub: string}> = ({
    x,
    y,
    color,
    mood,
    label,
    sub,
  }) => (
    <g transform={`translate(${x} ${y})`}>
      <circle cx={0} cy={-70} r={62} fill={color} {...STROKE} />
      <Face x={0} y={-84} s={0.85} mood={mood} />
      <path d="M-56,-10 q56,-26 112,0 l14,130 h-140 z" fill={color} {...STROKE} />
      <text x={0} y={190} textAnchor="middle" fontSize={44} fontWeight={900} fill={C.ink} fontFamily={FONT}>
        {label}
      </text>
      <text x={0} y={238} textAnchor="middle" fontSize={32} fontWeight={700} fill={C.grey} fontFamily={FONT}>
        {sub}
      </text>
    </g>
  );

  return (
    <ArtFrame>
      <Sunburst cx={600} cy={420} r={600} spin={frame * 0.2} opacity={0.08} />
      <g transform={`rotate(${tilt} 600 470)`}>
        <rect x={180} y={450} width={840} height={30} rx={15} fill={C.ink} />
        <g transform="translate(320 450)">
          <Person x={0} y={-10} color={C.green} mood="smug" label="THẰNG ĐI VAY" sub="nợ tự bốc hơi một nửa" />
        </g>
        <g transform="translate(880 450)">
          <Person x={0} y={-10} color={C.blue} mood="sad" label="NGƯỜI GỬI TIẾT KIỆM" sub="sổ vẫn thế, mua được ít hơn" />
        </g>
      </g>
      <path d="M600,470 l-90,190 h180 z" fill={C.amber} {...STROKE} />
      <text
        x={600}
        y={760}
        textAnchor="middle"
        fontSize={40}
        fontWeight={900}
        fill={C.ink}
        fontFamily={FONT}
        opacity={interpolate(frame, [90, 110], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
      >
        con nợ lớn nhất mọi quốc gia: chính phủ
      </text>
    </ArtFrame>
  );
};

/** 10. Ba tấm khiên: tiền mặt bốc hơi / tài sản thật / thu nhập tăng. */
export const ArtShield: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = (i: number) => bounceIn(frame, fps, 16 + i * 26);
  const vapor = (i: number) => ((frame * 2 + i * 33) % 100) / 100;

  const Shield: React.FC<{x: number; s: number; color: string; n: string; title: string; children: React.ReactNode}> = ({
    x,
    s,
    color,
    n,
    title,
    children,
  }) => (
    <g transform={`translate(${x} 380) scale(${s})`} opacity={s}>
      <path d="M0,-200 l165,66 v150 q0,150 -165,224 q-165,-74 -165,-224 v-150 z" fill={color} {...STROKE} />
      <g transform="translate(0 -10)">{children}</g>
      <circle cx={-150} cy={-190} r={44} fill={C.ink} />
      <text x={-150} y={-174} textAnchor="middle" fontSize={48} fontWeight={900} fill={C.paper} fontFamily={FONT}>
        {n}
      </text>
      <text x={0} y={310} textAnchor="middle" fontSize={38} fontWeight={900} fill={C.ink} fontFamily={FONT}>
        {title}
      </text>
    </g>
  );

  return (
    <ArtFrame>
      <Shield x={250} s={pop(0)} color={C.red} n="1" title="đừng ôm tiền mặt">
        <Bill x={0} y={20} w={150} h={80} color={C.paper} />
        {[0, 1, 2].map((i) => {
          const t = vapor(i);
          return (
            <circle key={i} cx={-50 + i * 50} cy={-40 - t * 90} r={10 + t * 16} fill="none" stroke={C.paper} strokeWidth={5} opacity={1 - t} />
          );
        })}
      </Shield>
      <Shield x={600} s={pop(1)} color={C.green} n="2" title="giữ tài sản thật">
        <rect x={-70} y={-50} width={140} height={120} rx={10} fill={C.paper} {...STROKE} strokeWidth={6} />
        <path d="M-92,-50 l92,-76 l92,76" fill={C.gold} {...STROKE} strokeWidth={6} />
      </Shield>
      <Shield x={950} s={pop(2)} color={C.blue} n="3" title="thu nhập chạy nhanh hơn">
        <path d="M-80,70 L-10,-10 L40,44 L96,-56" fill="none" stroke={C.paper} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M60,-56 h40 v40" fill="none" stroke={C.paper} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
      </Shield>
    </ArtFrame>
  );
};

/** 11. Hoá đơn dài in ra rồi bị đóng dấu "KHÔNG AI GỬI MÀY". */
export const ArtOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const roll = interpolate(frame, [10, 90], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const stamp = bounceIn(frame, fps, 100);
  const rows = ['Bát phở', 'Gói bim bim', 'Tiền nhà', 'Xăng', 'Lương thực tế'];
  const vals = ['+66%', '−25% ruột', '+40%', '+31%', '−3%'];

  return (
    <ArtFrame>
      <Sunburst cx={600} cy={400} r={640} spin={frame * 0.25} color={C.red} opacity={0.09} />
      <g transform="translate(600 60)">
        <rect x={-260} y={0} width={520} height={640 * roll} fill={C.paper} {...STROKE} />
        <text x={0} y={80} textAnchor="middle" fontSize={52} fontWeight={900} fill={C.ink} fontFamily={FONT} opacity={roll}>
          HOÁ ĐƠN LẠM PHÁT
        </text>
        {rows.map((r, i) => {
          const on = roll > (i + 1.4) / 7 ? 1 : 0;
          return (
            <g key={r} opacity={on}>
              <text x={-220} y={175 + i * 76} fontSize={38} fontWeight={700} fill={C.ink} fontFamily={FONT}>
                {r}
              </text>
              <text x={220} y={175 + i * 76} textAnchor="end" fontSize={38} fontWeight={900} fill={C.red} fontFamily={FONT}>
                {vals[i]}
              </text>
            </g>
          );
        })}
      </g>
      <g transform={`translate(600 620) rotate(${-11 + wobble(frame, 100, 0.5, 0.25) * 5}) scale(${stamp})`} opacity={stamp}>
        <rect x={-330} y={-72} width={660} height={144} rx={12} fill="none" stroke={C.red} strokeWidth={11} />
        <text x={0} y={22} textAnchor="middle" fontSize={62} fontWeight={900} fill={C.red} fontFamily={FONT}>
          KHÔNG AI GỬI MÀY
        </text>
      </g>
    </ArtFrame>
  );
};
