import React from 'react';
import {useCurrentFrame} from 'remotion';
import {LINE, LINE_THIN, T} from './palette';

export type Species = 'bo' | 'gau';

export type Expr =
  | 'happy' // cười toe
  | 'smug' // nhếch mép, đắc ý
  | 'angry' // cau mày
  | 'shock' // trợn mắt, há mồm
  | 'cry' // mếu, nước mắt
  | 'dizzy' // mắt xoáy
  | 'greedy' // mắt hình tờ tiền
  | 'dead' // mắt gạch chéo
  | 'sus'; // liếc nghi ngờ

export type Pose = 'idle' | 'point' | 'hold' | 'raise' | 'facepalm' | 'carry';

/**
 * Một nhân vật hoạt hình dựng từ các bộ phận rời, để cùng một nhân vật xuất
 * hiện xuyên suốt video với biểu cảm khác nhau — đúng cách kênh explainer
 * Việt làm: không vẽ lại tranh mới cho mỗi ý, chỉ đổi mặt và tư thế.
 * Hệ toạ độ nội bộ: gốc ở chân, nhân vật cao ~420, rộng ~300.
 */
export const Char: React.FC<{
  species: Species;
  expr?: Expr;
  pose?: Pose;
  x?: number;
  y?: number;
  scale?: number;
  flip?: boolean;
  /** biên độ nhún thở, 0 = đứng im */
  bob?: number;
  /** vật cầm trên tay khi pose='hold' */
  children?: React.ReactNode;
}> = ({species, expr = 'happy', pose = 'idle', x = 0, y = 0, scale = 1, flip = false, bob = 1, children}) => {
  const frame = useCurrentFrame();
  const isCow = species === 'bo';
  const fur = isCow ? T.cow : T.bear;
  const furDark = isCow ? T.cowDark : T.bearDark;
  const shirt = isCow ? T.purple : T.red;

  // nhún nhẹ, chu kỳ ~2.4s — đủ để nhân vật "sống" mà không rung
  const nod = Math.sin(frame / 22) * 4 * bob;
  const squash = 1 + Math.sin(frame / 22) * 0.008 * bob;

  // chớp mắt mỗi ~3.3s, kéo dài 4 frame
  const blink = frame % 100 < 4 && expr !== 'shock' && expr !== 'dizzy' && expr !== 'dead' && expr !== 'greedy';

  const Eye: React.FC<{cx: number}> = ({cx}) => {
    if (expr === 'dead')
      return (
        <g>
          <line x1={cx - 15} y1={-16} x2={cx + 15} y2={14} {...LINE} />
          <line x1={cx + 15} y1={-16} x2={cx - 15} y2={14} {...LINE} />
        </g>
      );
    if (expr === 'dizzy')
      return (
        <g>
          <circle cx={cx} cy={0} r={24} fill={T.paper} {...LINE_THIN} />
          <path
            d={`M${cx},0 m0,-16 a16,16 0 1,1 -11,27 a10,10 0 1,1 14,-17`}
            fill="none"
            stroke={T.line}
            strokeWidth={5}
            transform={`rotate(${frame * 6} ${cx} 0)`}
          />
        </g>
      );
    if (expr === 'greedy')
      return (
        <g>
          <circle cx={cx} cy={0} r={25} fill={T.paper} {...LINE_THIN} />
          <rect x={cx - 17} y={-11} width={34} height={22} rx={3} fill={T.money} {...LINE_THIN} />
          <text x={cx} y={7} textAnchor="middle" fontSize={17} fontWeight={900} fill={T.line}>
            $
          </text>
        </g>
      );

    const r = expr === 'shock' ? 30 : 25;
    const pupil = expr === 'shock' ? 9 : 12;
    const py = expr === 'sus' ? 5 : expr === 'angry' ? -4 : 0;
    const px = expr === 'sus' ? 7 : 0;

    if (blink)
      return <path d={`M${cx - 22},0 q22,12 44,0`} fill="none" {...LINE} />;

    return (
      <g>
        <circle cx={cx} cy={0} r={r} fill={T.paper} {...LINE_THIN} />
        <circle cx={cx + px} cy={py} r={pupil} fill={T.line} />
        {expr === 'cry' ? (
          <path d={`M${cx},${r - 4} q6,26 -2,44`} fill="none" stroke="#5bb8f0" strokeWidth={7} strokeLinecap="round" />
        ) : null}
      </g>
    );
  };

  const Brow: React.FC<{cx: number; dir: number}> = ({cx, dir}) => {
    if (expr === 'angry')
      return <line x1={cx - 22 * dir} y1={-44} x2={cx + 20 * dir} y2={-30} {...LINE} />;
    if (expr === 'cry' || expr === 'shock')
      return <line x1={cx - 22 * dir} y1={-34} x2={cx + 20 * dir} y2={-46} {...LINE} />;
    if (expr === 'smug' || expr === 'sus')
      return <line x1={cx - 20 * dir} y1={-42} x2={cx + 20 * dir} y2={-42} {...LINE} />;
    return null;
  };

  const Mouth = () => {
    if (expr === 'shock')
      return <ellipse cx={0} cy={78} rx={30} ry={40} fill="#8c2b2b" {...LINE_THIN} />;
    if (expr === 'cry')
      return <path d="M-38,92 q38,-40 76,0" fill="#8c2b2b" {...LINE_THIN} />;
    if (expr === 'angry')
      return <path d="M-34,84 q34,-22 68,0" fill="none" {...LINE} />;
    if (expr === 'smug' || expr === 'sus')
      return <path d="M-16,70 q30,20 52,-6" fill="none" {...LINE} />;
    if (expr === 'dead' || expr === 'dizzy')
      return <path d="M-30,74 q15,18 30,0 q15,-18 30,0" fill="none" {...LINE} />;
    return <path d="M-42,62 q42,46 84,0 z" fill="#8c2b2b" {...LINE_THIN} />;
  };

  const Arm: React.FC<{side: -1 | 1}> = ({side}) => {
    const right = side === 1;
    let d = `M${side * 92},-232 q${side * 58},34 ${side * 46},96`;
    let hx = side * 138;
    let hy = -136;

    if (pose === 'point' && right) {
      d = 'M92,-232 q96,-20 156,-72';
      hx = 248;
      hy = -304;
    } else if (pose === 'raise' && right) {
      d = 'M92,-232 q78,-70 62,-166';
      hx = 154;
      hy = -398;
    } else if (pose === 'hold' && right) {
      d = 'M92,-232 q90,6 118,-30';
      hx = 210;
      hy = -262;
    } else if (pose === 'facepalm' && right) {
      d = 'M92,-232 q104,-60 42,-124';
      hx = 134;
      hy = -356;
    } else if (pose === 'carry') {
      d = `M${side * 92},-232 q${side * 60},-96 ${side * 34},-196`;
      hx = side * 126;
      hy = -428;
    }

    return (
      <g>
        <path d={d} fill="none" stroke={T.line} strokeWidth={34} strokeLinecap="round" />
        <path d={d} fill="none" stroke={shirt} strokeWidth={22} strokeLinecap="round" />
        <circle cx={hx} cy={hy} r={32} fill={T.paper} {...LINE_THIN} />
      </g>
    );
  };

  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -scale : scale)} ${scale})`}>
      {/* bóng đổ */}
      <ellipse cx={0} cy={6} rx={126} ry={20} fill={T.shadow} />

      <g transform={`translate(0 ${nod}) scale(1 ${squash})`}>
        {/* chân */}
        <rect x={-64} y={-96} width={52} height={96} rx={20} fill={T.denim} {...LINE} />
        <rect x={12} y={-96} width={52} height={96} rx={20} fill={T.denim} {...LINE} />

        {/* thân + áo */}
        <path d="M-96,-100 q0,-160 96,-160 q96,0 96,160 z" fill={shirt} {...LINE} />
        <path d="M-30,-256 q30,44 60,0" fill={T.cream} {...LINE_THIN} />

        <Arm side={-1} />
        <Arm side={1} />

        {/* đầu */}
        <g transform="translate(0 -352)">
          {isCow ? (
            <>
              {/* sừng */}
              <path d="M-118,-42 q-46,-30 -30,-70 q34,10 44,58" fill="#7f8fa6" {...LINE_THIN} />
              <path d="M118,-42 q46,-30 30,-70 q-34,10 -44,58" fill="#7f8fa6" {...LINE_THIN} />
            </>
          ) : (
            <>
              {/* tai gấu */}
              <circle cx={-108} cy={-92} r={40} fill={furDark} {...LINE} />
              <circle cx={108} cy={-92} r={40} fill={furDark} {...LINE} />
            </>
          )}

          <ellipse cx={0} cy={0} rx={128} ry={118} fill={fur} {...LINE} />

          {/* mõm */}
          <ellipse
            cx={0}
            cy={70}
            rx={isCow ? 92 : 62}
            ry={isCow ? 56 : 44}
            fill={isCow ? T.muzzle : T.cream}
            {...LINE}
          />
          <ellipse cx={-26} cy={56} rx={9} ry={12} fill={T.line} opacity={0.75} />
          <ellipse cx={26} cy={56} rx={9} ry={12} fill={T.line} opacity={0.75} />
          <Mouth />

          <Brow cx={-52} dir={1} />
          <Brow cx={52} dir={-1} />
          <Eye cx={-52} />
          <Eye cx={52} />
        </g>

        {pose === 'hold' ? <g transform="translate(286 -276)">{children}</g> : null}
        {pose === 'carry' ? <g transform="translate(0 -500)">{children}</g> : null}
      </g>
    </g>
  );
};
