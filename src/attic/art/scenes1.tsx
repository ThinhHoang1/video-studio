import React from 'react';
import {FONT} from '../font';
import {interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {ArtFrame, Bill, C, Face, STROKE, Sunburst} from './kit';
import {bounceIn, wobble} from '../motion/easing';

/** 1. Bát phở: giá lật 30k -> 50k, thịt bay đi từng miếng. */
export const ArtPho: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const steam = (i: number) => ((frame * 1.6 + i * 40) % 140) / 140;
  const flip = bounceIn(frame, fps, 34);
  const meatGone = (i: number) => interpolate(frame, [60 + i * 12, 92 + i * 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <ArtFrame>
      <Sunburst cx={600} cy={430} r={640} spin={frame * 0.25} opacity={0.1} />
      {/* hơi bốc */}
      {[0, 1, 2].map((i) => {
        const t = steam(i);
        return (
          <path
            key={i}
            d={`M${520 + i * 80},${330 - t * 150} q26,-40 0,-80 q-26,-40 0,-80`}
            fill="none"
            stroke={C.grey}
            strokeWidth={8}
            strokeLinecap="round"
            opacity={(1 - t) * 0.7}
          />
        );
      })}
      {/* thịt bay */}
      {[0, 1, 2].map((i) => {
        const g = meatGone(i);
        return (
          <ellipse
            key={i}
            cx={520 + i * 80 + g * (i - 1) * 260}
            cy={400 - g * 300}
            rx={44}
            ry={26}
            fill={C.brown}
            opacity={1 - g}
            transform={`rotate(${g * 220} ${520 + i * 80} ${400})`}
            {...STROKE}
          />
        );
      })}
      {/* bát */}
      <path d="M370,400 h460 a30,30 0 0 1 -30,190 h-400 a30,30 0 0 1 -30,-190 z" fill={C.paper} {...STROKE} />
      <ellipse cx={600} cy={400} rx={230} ry={44} fill="#e8c88a" {...STROKE} />
      {/* bánh phở nổi lên, thứ duy nhất không bị cắt bớt */}
      {[0, 1, 2, 3].map((i) => (
        <path
          key={`n${i}`}
          d={`M${478 + i * 62},${392} q30,${i % 2 ? -18 : 16} 62,0`}
          fill="none"
          stroke="#fff6dd"
          strokeWidth={9}
          strokeLinecap="round"
        />
      ))}
      <ellipse cx={690} cy={406} rx={26} ry={12} fill="#4aa02c" {...STROKE} strokeWidth={4} />
      <path d="M330,600 h540" {...STROKE} strokeWidth={9} />
      {/* đũa */}
      <line x1={760} y1={250} x2={880} y2={470} {...STROKE} strokeWidth={11} stroke={C.brown} />
      <line x1={800} y1={244} x2={912} y2={464} {...STROKE} strokeWidth={11} stroke={C.brown} />
      {/* bảng giá lật */}
      <g transform={`translate(300 210)`} style={{transformBox: 'fill-box', transformOrigin: 'center'}}>
        <g transform={`rotateX(0)`}>
          <rect
            x={-150}
            y={-58}
            width={300}
            height={116}
            rx={16}
            fill={flip > 0.5 ? C.red : C.green}
            {...STROKE}
          />
          <text
            x={0}
            y={20}
            textAnchor="middle"
            fontSize={62}
            fontWeight={900}
            fill={C.paper}
            fontFamily={FONT}
          >
            {flip > 0.5 ? '50.000₫' : '30.000₫'}
          </text>
        </g>
      </g>
      {/* mũi tên tăng */}
      <g opacity={flip} transform={`translate(${560 + wobble(frame, 40) * 6} 190)`}>
        <path d="M0,80 L0,-40 M-34,-6 L0,-40 L34,-6" fill="none" stroke={C.red} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </ArtFrame>
  );
};

/** 2. Tờ tiền xì hơi, teo lại như bóng bay thủng. */
export const ArtMoneyShrink: React.FC = () => {
  const frame = useCurrentFrame();
  const shrink = interpolate(frame, [20, 130], [1, 0.32], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const sag = interpolate(frame, [20, 130], [0, 90], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const puff = (i: number) => ((frame * 2 + i * 30) % 100) / 100;

  return (
    <ArtFrame>
      <Sunburst cx={600} cy={400} r={620} spin={-frame * 0.2} color={C.red} opacity={0.08} />
      {/* khí xì ra */}
      {[0, 1, 2, 3].map((i) => {
        const t = puff(i);
        return (
          <circle
            key={i}
            cx={880 + t * 220}
            cy={380 + Math.sin(t * 6 + i) * 60}
            r={12 + t * 30}
            fill="none"
            stroke={C.grey}
            strokeWidth={6}
            opacity={(1 - t) * 0.8}
          />
        );
      })}
      <g transform={`translate(560 ${400 + sag}) scale(${shrink})`}>
        <rect x={-330} y={-170} width={660} height={340} rx={22} fill={C.green} {...STROKE} strokeWidth={7 / shrink} />
        <circle cx={0} cy={0} r={92} fill={C.paper} {...STROKE} strokeWidth={6 / shrink} />
        <Face x={0} y={-14} s={1.1} mood={shrink < 0.6 ? 'dead' : 'sad'} />
        <text x={-250} y={-100} fontSize={54} fontWeight={900} fill={C.paper} fontFamily={FONT}>
          500.000
        </text>
      </g>
      <text
        x={600}
        y={720}
        textAnchor="middle"
        fontSize={46}
        fontWeight={900}
        fill={C.red}
        fontFamily={FONT}
        opacity={interpolate(frame, [90, 110], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
      >
        cùng một tờ · mua được ít hơn
      </text>
    </ArtFrame>
  );
};

/** 3. Máy in tiền phun ra vô số tờ, ổ bánh mì thì vẫn 10 cái. */
export const ArtPrinter: React.FC = () => {
  const frame = useCurrentFrame();
  const shake = Math.sin(frame * 0.9) * 4;
  const bills = new Array(16).fill(0).map((_, i) => {
    const t = ((frame * 2.4 + i * 22) % 190) / 190;
    return {
      t,
      x: 330 + t * 700,
      y: 300 - Math.sin(t * Math.PI) * 190 + random(`by${i}`) * 90,
      rot: (random(`br${i}`) - 0.5) * 360 * t,
    };
  });

  return (
    <ArtFrame>
      <Sunburst cx={300} cy={420} r={620} spin={frame * 0.4} opacity={0.12} />
      {bills.map((b, i) => (
        <Bill key={i} x={b.x} y={b.y} rot={b.rot} w={110} h={58} opacity={1 - b.t * 0.5} />
      ))}
      {/* máy in */}
      <g transform={`translate(${shake} 0)`}>
        <rect x={130} y={360} width={330} height={210} rx={22} fill={C.blue} {...STROKE} />
        <rect x={170} y={330} width={250} height={44} rx={12} fill={C.grey} {...STROKE} />
        <circle cx={200} cy={520} r={16} fill={C.red} {...STROKE} strokeWidth={5} />
        <circle cx={248} cy={520} r={16} fill={C.gold} {...STROKE} strokeWidth={5} />
        <text x={330} y={470} textAnchor="middle" fontSize={44} fontWeight={900} fill={C.paper} fontFamily={FONT}>
          BRRR
        </text>
      </g>
      {/* bánh mì: vẫn đúng 10 cái */}
      <g>
        {new Array(10).fill(0).map((_, i) => (
          <ellipse
            key={i}
            cx={760 + (i % 5) * 92}
            cy={600 + Math.floor(i / 5) * 80}
            rx={40}
            ry={24}
            fill={C.brown}
            {...STROKE}
            strokeWidth={5}
          />
        ))}
        <text x={950} y={745} textAnchor="middle" fontSize={40} fontWeight={900} fill={C.ink} fontFamily={FONT}>
          vẫn đúng 10 ổ
        </text>
      </g>
    </ArtFrame>
  );
};

/** 4. Tờ 100 nghìn tỷ đô Zimbabwe và 3 quả trứng. */
export const ArtZimbabwe: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const zeros = Math.min(14, Math.floor(interpolate(frame, [10, 80], [1, 14], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})));
  const eggPop = (i: number) => bounceIn(frame, fps, 100 + i * 8);

  return (
    <ArtFrame>
      <Sunburst cx={600} cy={330} r={680} spin={frame * 0.3} color={C.red} opacity={0.1} />
      <g transform={`translate(600 320) rotate(${wobble(frame, 8, 0.12, 0.02) * 1.6})`}>
        <rect x={-520} y={-150} width={1040} height={300} rx={18} fill="#e8d9a8" {...STROKE} />
        <rect x={-495} y={-126} width={990} height={252} rx={10} fill="none" stroke={C.ink} strokeWidth={4} opacity={0.5} />
        <text x={0} y={-52} textAnchor="middle" fontSize={40} fontWeight={800} fill={C.ink} fontFamily={FONT}>
          RESERVE BANK OF ZIMBABWE
        </text>
        <text x={0} y={54} textAnchor="middle" fontSize={92} fontWeight={900} fill={C.red} fontFamily={FONT}>
          {`$1${'0'.repeat(zeros)}`}
        </text>
        <text x={0} y={112} textAnchor="middle" fontSize={34} fontWeight={800} fill={C.ink} fontFamily={FONT}>
          {zeros >= 14 ? 'MỘT TRĂM NGHÌN TỶ ĐÔ LA' : 'đang đếm số 0…'}
        </text>
      </g>
      <text x={600} y={560} textAnchor="middle" fontSize={54} fontWeight={900} fill={C.ink} fontFamily={FONT}>
        mua được:
      </text>
      {[0, 1, 2].map((i) => {
        const p = eggPop(i);
        return (
          <g key={i} transform={`translate(${470 + i * 130} ${680}) scale(${p})`}>
            <ellipse cx={0} cy={0} rx={46} ry={58} fill={C.paper} {...STROKE} />
          </g>
        );
      })}
      <text x={880} y={700} fontSize={48} fontWeight={900} fill={C.red} fontFamily={FONT} opacity={eggPop(2)}>
        3 quả trứng
      </text>
    </ArtFrame>
  );
};
