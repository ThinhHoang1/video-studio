import React from 'react';
import {FONT} from '../font';
import {interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {ArtFrame, C, Face, STROKE, Sunburst} from './kit';
import {bounceIn, wobble} from '../motion/easing';

/** 5. Shrinkflation: gói bim bim phồng khí, số gram tụt. */
export const ArtChips: React.FC = () => {
  const frame = useCurrentFrame();
  const puff = interpolate(frame, [20, 70], [1, 1.28], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const gram = Math.round(interpolate(frame, [30, 95], [80, 60], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const chips = 9 - Math.round(interpolate(frame, [30, 95], [0, 6], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));

  return (
    <ArtFrame>
      <Sunburst cx={600} cy={400} r={620} spin={-frame * 0.22} color={C.amber} opacity={0.1} />
      <g transform={`translate(600 400) scale(${puff} ${1 / Math.sqrt(puff)})`}>
        <path
          d="M-230,-290 h460 l-26,60 v460 l26,60 h-460 l26,-60 v-460 z"
          fill={C.red}
          {...STROKE}
        />
        <text x={0} y={-160} textAnchor="middle" fontSize={64} fontWeight={900} fill={C.paper} fontFamily={FONT}>
          BIM BIM
        </text>
        <rect x={-130} y={-120} width={260} height={72} rx={12} fill={C.gold} {...STROKE} strokeWidth={5} />
        <text x={0} y={-68} textAnchor="middle" fontSize={46} fontWeight={900} fill={C.ink} fontFamily={FONT}>
          10.000₫
        </text>
        {/* miếng bim bim còn lại */}
        {new Array(9).fill(0).map((_, i) =>
          i < chips ? (
            <path
              key={i}
              d={`M${-140 + (i % 3) * 130},${40 + Math.floor(i / 3) * 100} q40,-46 84,0 q-40,50 -84,0 z`}
              fill={C.amber}
              {...STROKE}
              strokeWidth={5}
            />
          ) : null
        )}
        <text x={0} y={310} textAnchor="middle" fontSize={54} fontWeight={900} fill={C.paper} fontFamily={FONT}>
          {gram}g
        </text>
      </g>
      {/* mũi tên chỉ khí */}
      <g opacity={interpolate(frame, [70, 90], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}>
        <path d="M980,250 Q820,300 740,360" fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
        <text x={990} y={238} fontSize={44} fontWeight={900} fill={C.ink} fontFamily={FONT}>
          70% là khí
        </text>
      </g>
    </ArtFrame>
  );
};

/** 6. Skimpflation: thanh sô cô la, % ca cao rơi tự do. */
export const ArtQualityDown: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cocoa = Math.round(interpolate(frame, [20, 90], [70, 22], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const botPop = bounceIn(frame, fps, 100);

  return (
    <ArtFrame>
      <Sunburst cx={420} cy={380} r={560} spin={frame * 0.18} color={C.brown} opacity={0.1} />
      <g transform="translate(400 380)">
        <rect x={-200} y={-250} width={400} height={500} rx={18} fill={C.brown} {...STROKE} />
        {[0, 1, 2, 3].map((r) =>
          [0, 1].map((c) => (
            <rect
              key={`${r}${c}`}
              x={-176 + c * 178}
              y={-226 + r * 118}
              width={158}
              height={98}
              rx={8}
              fill="#8a5a30"
              stroke={C.ink}
              strokeWidth={5}
            />
          ))
        )}
        <rect x={-200} y={-60} width={400} height={110} rx={10} fill={C.paper} {...STROKE} strokeWidth={6} />
        <text x={0} y={20} textAnchor="middle" fontSize={68} fontWeight={900} fill={cocoa < 40 ? C.red : C.ink} fontFamily={FONT}>
          {cocoa}% CACAO
        </text>
      </g>
      <text x={760} y={210} fontSize={44} fontWeight={900} fill={C.ink} fontFamily={FONT}>
        thêm: dầu thực vật
      </text>
      <text x={760} y={280} fontSize={44} fontWeight={900} fill={C.ink} fontFamily={FONT}>
        bỏ: dọn phòng
      </text>
      <text x={760} y={350} fontSize={44} fontWeight={900} fill={C.ink} fontFamily={FONT}>
        thay: tổng đài
      </text>
      {/* con chatbot ngu */}
      <g transform={`translate(900 570) scale(${botPop})`} opacity={botPop}>
        <rect x={-120} y={-110} width={240} height={210} rx={26} fill={C.grey} {...STROKE} />
        <Face x={0} y={-24} s={1.15} mood="dead" />
        <line x1={0} y1={-110} x2={0} y2={-160} {...STROKE} strokeWidth={7} />
        <circle cx={0} cy={-172} r={16} fill={C.red} {...STROKE} strokeWidth={5} />
        <text x={0} y={150} textAnchor="middle" fontSize={38} fontWeight={900} fill={C.ink} fontFamily={FONT}>
          "Xin lỗi, tôi chưa hiểu"
        </text>
      </g>
    </ArtFrame>
  );
};

/** 7. Bảng lương: +7% danh nghĩa, -3% thực tế. */
export const ArtSalary: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = bounceIn(frame, fps, 16);
  const b = bounceIn(frame, fps, 46);
  const c = bounceIn(frame, fps, 82);

  const Bar: React.FC<{x: number; h: number; color: string; label: string; val: string; s: number}> = ({
    x,
    h,
    color,
    label,
    val,
    s,
  }) => (
    <g transform={`translate(${x} 600)`}>
      <rect x={-90} y={-h * s} width={180} height={h * s} rx={12} fill={color} {...STROKE} />
      <text x={0} y={-h * s - 24} textAnchor="middle" fontSize={54} fontWeight={900} fill={color} opacity={s} fontFamily={FONT}>
        {val}
      </text>
      <text x={0} y={64} textAnchor="middle" fontSize={36} fontWeight={800} fill={C.ink} opacity={s} fontFamily={FONT}>
        {label}
      </text>
    </g>
  );

  return (
    <ArtFrame>
      <line x1={140} y1={600} x2={1060} y2={600} {...STROKE} strokeWidth={8} />
      <Bar x={330} h={230} color={C.green} label="lương tăng" val="+7%" s={a} />
      <Bar x={600} h={330} color={C.red} label="giá tăng" val="+10%" s={b} />
      <g transform="translate(880 600)" opacity={c}>
        <rect x={-90} y={0} width={180} height={100 * c} rx={12} fill={C.ink} {...STROKE} />
        <text x={0} y={160} textAnchor="middle" fontSize={54} fontWeight={900} fill={C.ink} fontFamily={FONT}>
          −3%
        </text>
        <text x={0} y={215} textAnchor="middle" fontSize={34} fontWeight={800} fill={C.ink} fontFamily={FONT}>
          mày thực nhận
        </text>
      </g>
      <g transform={`translate(600 190) rotate(${wobble(frame, 82, 0.4, 0.2) * 3})`} opacity={c}>
        <rect x={-360} y={-62} width={720} height={124} rx={16} fill={C.gold} {...STROKE} />
        <text x={0} y={22} textAnchor="middle" fontSize={58} fontWeight={900} fill={C.ink} fontFamily={FONT}>
          MÀY VỪA BỊ GIẢM LƯƠNG
        </text>
      </g>
    </ArtFrame>
  );
};

/** 8. Cần phanh đỏ khổng lồ, cả nền kinh tế trượt bánh. */
export const ArtBrake: React.FC = () => {
  const frame = useCurrentFrame();
  const pull = interpolate(frame, [30, 60], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const skid = interpolate(frame, [55, 110], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <ArtFrame>
      <Sunburst cx={300} cy={400} r={560} spin={-frame * 0.3} color={C.red} opacity={0.1 * pull} />
      {/* cần phanh */}
      <g transform={`translate(280 470)`}>
        <rect x={-40} y={-30} width={80} height={220} rx={16} fill={C.grey} {...STROKE} />
        <g transform={`rotate(${-50 + pull * 70}) `}>
          <rect x={-22} y={-250} width={44} height={260} rx={18} fill={C.ink} {...STROKE} />
          <circle cx={0} cy={-266} r={52} fill={C.red} {...STROKE} />
        </g>
      </g>
      {/* xe kinh tế trượt */}
      <g transform={`translate(${820 - skid * 60} 520) rotate(${skid * -7})`}>
        <rect x={-190} y={-110} width={380} height={140} rx={26} fill={C.blue} {...STROKE} />
        <rect x={-110} y={-186} width={210} height={86} rx={18} fill="#7fc0ff" {...STROKE} />
        <circle cx={-110} cy={40} r={52} fill={C.ink} />
        <circle cx={110} cy={40} r={52} fill={C.ink} />
        <text x={0} y={-130} textAnchor="middle" fontSize={34} fontWeight={900} fill={C.paper} fontFamily={FONT}>
          NỀN KINH TẾ
        </text>
      </g>
      {/* vệt khói phanh */}
      {[0, 1].map((i) => (
        <line
          key={i}
          x1={1010}
          y1={572 + i * 96}
          x2={1010 - skid * 260}
          y2={572 + i * 96}
          stroke={C.ink}
          strokeWidth={14}
          strokeLinecap="round"
          opacity={0.55 * skid}
        />
      ))}
      <text
        x={600}
        y={730}
        textAnchor="middle"
        fontSize={46}
        fontWeight={900}
        fill={C.ink}
        opacity={skid}
        fontFamily={FONT}
      >
        chỉ có MỘT cái phanh cho tất cả
      </text>
    </ArtFrame>
  );
};
