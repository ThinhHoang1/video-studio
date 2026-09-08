import React from 'react';
import {useCurrentFrame} from 'remotion';
import {A} from './fx';
import {step, holdFrames} from './timing';

const LN = {stroke: A.line, strokeWidth: 6, strokeLinecap: 'round', strokeLinejoin: 'round'} as const;
const LN3 = {...LN, strokeWidth: 3.5} as const;

export type AMood = 'thuong' | 'vui' | 'soc' | 'tuc' | 'khoc' | 'chet' | 'quyet' | 'nghi';

/**
 * Mắt anime — bộ phận tốn công nhất và cũng là thứ nhận ra ngay.
 * Cấu tạo: tròng to chiếm gần hết hốc mắt, chuyển hai tông (đậm trên,
 * sáng dưới) chứ không gradient mịn, một chấm sáng lớn lệch trên và một
 * chấm nhỏ dưới, mí trên là nét dày nhất trên mặt.
 */
const Eye: React.FC<{cx: number; mood: AMood; blink: boolean; flip?: boolean}> = ({
  cx,
  mood,
  blink,
  flip = false,
}) => {
  if (blink) return <path d={`M${cx - 26},2 q26,14 52,0`} fill="none" {...LN} />;

  if (mood === 'chet')
    return (
      <g>
        <path d={`M${cx - 24},-16 L${cx + 24},14`} {...LN} />
        <path d={`M${cx + 24},-16 L${cx - 24},14`} {...LN} />
      </g>
    );

  const tall = mood === 'soc' ? 46 : mood === 'tuc' ? 32 : 38;
  const wide = 27;
  const dir = flip ? -1 : 1;

  return (
    <g>
      {/* lòng trắng */}
      <ellipse cx={cx} cy={0} rx={wide} ry={tall} fill={A.paper} />
      {/* tròng: nửa trên đậm, nửa dưới sáng — hai mảng cứng, kiểu cel */}
      <clipPath id={`ir${cx}${tall}`}>
        <ellipse cx={cx} cy={2} rx={wide * 0.82} ry={tall * 0.86} />
      </clipPath>
      <g clipPath={`url(#ir${cx}${tall})`}>
        <rect x={cx - 40} y={-60} width={80} height={120} fill={A.eye} />
        <rect x={cx - 40} y={-60} width={80} height={54} fill={A.eyeDeep} />
        <ellipse cx={cx} cy={tall * 0.42} rx={wide * 0.7} ry={tall * 0.3} fill="#8fd8ff" />
      </g>
      {/* con ngươi */}
      <ellipse cx={cx} cy={2} rx={wide * 0.34} ry={tall * 0.36} fill={A.ink} />
      {/* chấm sáng lớn + chấm nhỏ */}
      <ellipse cx={cx - dir * wide * 0.34} cy={-tall * 0.38} rx={wide * 0.3} ry={tall * 0.22} fill="#fff" />
      <circle cx={cx + dir * wide * 0.36} cy={tall * 0.32} r={wide * 0.14} fill="#fff" opacity={0.9} />
      {/* mí trên — nét dày nhất khuôn mặt */}
      <path
        d={`M${cx - wide - 6},${-tall * 0.55} q${wide},${-tall * 0.55} ${wide * 2 + 12},${-tall * 0.1}`}
        fill="none"
        stroke={A.line}
        strokeWidth={11}
        strokeLinecap="round"
      />
      {/* lông mi ngoài */}
      <path
        d={`M${cx + dir * (wide + 4)},${-tall * 0.5} l${dir * 16},${-12}`}
        stroke={A.line}
        strokeWidth={8}
        strokeLinecap="round"
      />
    </g>
  );
};

/**
 * TÈO bản anime. Giữ nguyên vai trò cũ (người xem, có cái ví mỏng dần),
 * nhưng vẽ theo quy tắc cel: mỗi mảng màu đi kèm MỘT mảng bóng cứng.
 * Mọi chuyển động đi qua `step()` nên nhân vật giật nhịp 10–15 hình/giây
 * trong khi máy quay vẫn chạy mượt — đúng cấu trúc của anime truyền hình.
 */
export const AnimeTeo: React.FC<{
  mood?: AMood;
  x?: number;
  y?: number;
  s?: number;
  flip?: boolean;
  /** 1 = ví căng, 0 = ví lép */
  vi?: number;
  /** nhịp giữ hình: 2 = on twos, 3 = on threes */
  nhip?: 1 | 2 | 3;
  /** kéo nhoè khi di chuyển nhanh */
  smear?: number;
}> = ({mood = 'thuong', x = 0, y = 0, s = 1, flip = false, vi = 1, nhip = 3, smear = 0}) => {
  const raw = useCurrentFrame();
  const frame = step(raw, nhip);
  const bob = Math.sin(frame / 20) * 5;
  const blink = holdFrames(frame, 1) % 40 < 1 && mood !== 'soc' && mood !== 'chet';
  const lean = mood === 'quyet' ? -4 : mood === 'khoc' ? 5 : 0;

  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={0} cy={6} rx={112} ry={16} fill="rgba(0,0,0,0.2)" />
      <g transform={`translate(${smear} ${bob}) rotate(${lean})`}>
        {/* chân + mảng bóng */}
        <path d="M-56,-112 h48 v112 h-48 z" fill="#3c3350" {...LN} />
        <path d="M-56,-112 h16 v112 h-16 z" fill="#2b2440" />
        <path d="M8,-112 h48 v112 h-48 z" fill="#3c3350" {...LN} />
        <path d="M8,-112 h16 v112 h-16 z" fill="#2b2440" />

        {/* thân áo */}
        <path d="M-92,-116 q0,-158 92,-158 q92,0 92,158 z" fill="#4a72d6" {...LN} />
        {/* mảng bóng cel: một hình cứng, không gradient */}
        <path d="M-92,-116 q0,-158 92,-158 q-30,60 -34,158 z" fill="#31509e" />
        <path d="M-38,-262 q38,52 76,0" fill="#6d92e8" {...LN3} />

        {/* ví thò khỏi túi — mỏng dần suốt video */}
        <g transform="translate(78 -132)">
          <path
            d={`M-24,${-32 * vi} h48 v${20 + 36 * vi} h-48 z`}
            fill={vi > 0.35 ? '#5fc98a' : '#a8a293'}
            {...LN3}
          />
          <path d={`M-24,${-32 * vi} h16 v${20 + 36 * vi} h-16 z`} fill={vi > 0.35 ? '#3f9c66' : '#847f72'} />
        </g>

        {/* tay */}
        <path d="M-88,-230 q-56,48 -44,112" fill="none" stroke={A.line} strokeWidth={30} strokeLinecap="round" />
        <path d="M-88,-230 q-56,48 -44,112" fill="none" stroke="#4a72d6" strokeWidth={19} strokeLinecap="round" />
        <circle cx={-132} cy={-118} r={26} fill={A.skin} {...LN3} />
        <path d="M88,-230 q56,48 44,112" fill="none" stroke={A.line} strokeWidth={30} strokeLinecap="round" />
        <path d="M88,-230 q56,48 44,112" fill="none" stroke="#4a72d6" strokeWidth={19} strokeLinecap="round" />
        <circle cx={132} cy={-118} r={26} fill={A.skin} {...LN3} />

        {/* cổ — anime luôn có cổ, đầu không dính thẳng vào vai */}
        <path d="M-26,-268 h52 v46 h-52 z" fill={A.skin} {...LN3} />
        <path d="M-26,-268 h52 v18 h-52 z" fill={A.skinShade} />

        {/* đầu */}
        <g transform="translate(0 -352)">
          {/* mặt: rộng ở gò má, thu nhanh về cằm nhọn — tỉ lệ anime */}
          <path
            d="M-104,-36 q0,-104 104,-104 q104,0 104,104 q0,58 -30,102 q-32,48 -74,66 q-42,-18 -74,-66 q-30,-44 -30,-102 z"
            fill={A.skin}
            {...LN}
          />
          {/* mảng bóng cel bên trái — một hình cứng, không gradient */}
          <path
            d="M-104,-36 q0,-104 104,-104 q-46,44 -50,104 q-4,74 50,168 q-42,-18 -74,-66 q-30,-44 -30,-102 z"
            fill={A.skinShade}
          />

          {/* tai */}
          <path d="M-104,-6 q-26,-6 -24,26 q2,30 26,26" fill={A.skin} {...LN3} />
          <path d="M104,-6 q26,-6 24,26 q-2,30 -26,26" fill={A.skin} {...LN3} />

          {/* TÓC.
              Điểm phân biệt tóc anime với "cái mũ": mái không phải một đường
              cong liền, mà là những múi nhọn RỜI chồng lên nhau, đầu nhọn chĩa
              xuống, giữa các múi có khe hở lộ trán. Vẽ khối ngoài trước, rồi
              đắp từng múi mái lên. */}
          {/* khối tóc ngoài, lớn hơn hộp sọ */}
          <path
            d="M-120,-6 q-10,-132 120,-132 q130,0 120,132 q-30,-70 -60,-88 q-60,26 -120,0 q-30,18 -60,88 z"
            fill={A.hair}
            {...LN}
          />
          <path d="M-120,-6 q-10,-132 120,-132 q-66,34 -76,132 z" fill={A.hairShade} />

          {/* các múi mái, mỗi múi một hình nhọn riêng */}
          {[
            {d: 'M-118,-16 q10,-84 44,-104 q-2,66 -14,116 z', sh: false},
            {d: 'M-76,-40 q26,-80 66,-92 q-14,64 -30,110 z', sh: false},
            {d: 'M-6,-52 q34,-72 74,-80 q-24,58 -44,104 z', sh: true},
            {d: 'M62,-38 q40,-52 58,-32 q-20,44 -36,86 z', sh: true},
          ].map((c, i) => (
            <path key={i} d={c.d} fill={c.sh ? A.hairShade : A.hair} {...LN3} />
          ))}

          {/* dải sáng cứng chạy ngang khối tóc — cel highlight, không blur */}
          <path d="M-78,-112 q78,-38 156,-10 q-76,-10 -138,28 z" fill={A.hairHi} />

          {/* hai lọn rủ hai bên mặt, đầu nhọn */}
          <path d="M-116,-24 q-20,64 -8,124 q-28,-48 -26,-124 z" fill={A.hair} {...LN3} />
          <path d="M116,-24 q20,64 8,124 q28,-48 26,-124 z" fill={A.hair} {...LN3} />

          {/* một cọng dựng ngược — dấu hiệu nhân vật chính */}
          <path d="M22,-134 q28,-56 62,-44 q-36,20 -38,60 z" fill={A.hair} {...LN3} />

          {/* lông mày — nằm CAO hơn mắt, không đè lên mí */}
          {mood === 'tuc' || mood === 'quyet' ? (
            <>
              <path d="M-78,-56 l44,18" {...LN} />
              <path d="M78,-56 l-44,18" {...LN} />
            </>
          ) : mood === 'khoc' || mood === 'soc' ? (
            <>
              <path d="M-78,-34 l44,-22" {...LN} />
              <path d="M78,-34 l-44,-22" {...LN} />
            </>
          ) : (
            <>
              <path d="M-80,-48 q24,-14 48,-4" fill="none" {...LN} />
              <path d="M80,-48 q-24,-14 -48,-4" fill="none" {...LN} />
            </>
          )}

          {/* mắt: cách nhau đúng một bề rộng mắt, đặt ở ~55% chiều cao đầu */}
          <g transform="translate(0 8)">
            <Eye cx={-54} mood={mood} blink={blink} />
            <Eye cx={54} mood={mood} blink={blink} flip />
          </g>

          {/* mũi: một nét cực ngắn */}
          <path d="M6,50 l9,11 l-11,2" fill="none" {...LN3} />

          {/* miệng — nhỏ, nằm gần cằm */}
          {mood === 'soc' ? (
            <ellipse cx={0} cy={94} rx={20} ry={24} fill="#8c2b3a" {...LN3} />
          ) : mood === 'vui' ? (
            <path d="M-26,84 q26,30 52,0 z" fill="#8c2b3a" {...LN3} />
          ) : mood === 'khoc' ? (
            <path d="M-24,102 q24,-28 48,0" fill="#8c2b3a" {...LN3} />
          ) : mood === 'tuc' ? (
            <path d="M-24,96 q24,-16 48,0" fill="none" {...LN} />
          ) : mood === 'chet' ? (
            <path d="M-20,92 q10,13 20,0 q10,-13 20,0" fill="none" {...LN3} />
          ) : (
            <path d="M-18,88 q18,14 36,0" fill="none" {...LN3} />
          )}

          {/* nước mắt */}
          {mood === 'khoc' ? (
            <>
              <path d="M-54,48 q6,36 -2,56" fill="none" stroke="#6fd0ff" strokeWidth={9} strokeLinecap="round" />
              <path d="M54,48 q-6,36 2,56" fill="none" stroke="#6fd0ff" strokeWidth={9} strokeLinecap="round" />
            </>
          ) : null}

          {/* vệt đỏ trên má */}
          {mood === 'tuc' || mood === 'khoc' ? (
            <g opacity={0.8}>
              {[0, 1, 2].map((i) => (
                <path key={i} d={`M${-104 + i * 9},${46 + i * 5} l16,-11`} stroke="#ff6b7a" strokeWidth={5} />
              ))}
            </g>
          ) : null}
        </g>
      </g>
    </g>
  );
};

/**
 * PHỒNG bản anime — quái vật lạm phát. Vẫn là khối phồng, nhưng vẽ theo
 * quy tắc cel: mảng bóng cứng, viền dày, mắt phát sáng, và có gai/khói
 * bốc lên khi to. Nhịp thở đi qua `step` nên giật chứ không mượt.
 */
export const AnimePhong: React.FC<{
  size?: number;
  x?: number;
  y?: number;
  s?: number;
  mood?: 'cuoi' | 'doi' | 'gian' | 'no';
  nhip?: 1 | 2 | 3;
}> = ({size = 0.3, x = 0, y = 0, s = 1, mood = 'cuoi', nhip = 2}) => {
  const raw = useCurrentFrame();
  const frame = step(raw, nhip);
  const breath = 1 + Math.sin(frame / (16 - size * 7)) * (0.02 + size * 0.035);
  const r = (120 + size * 320) * breath;
  const tilt = Math.sin(frame / 13) * (2 + size * 5);

  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={r} rx={r * 0.86} ry={r * 0.14} fill="rgba(0,0,0,0.22)" />
      <g transform={`rotate(${tilt})`}>
        {/* thân + mảng bóng cel */}
        <ellipse cx={0} cy={0} rx={r} ry={r * 0.93} fill={A.red} {...LN} />
        <path
          d={`M0,${-r * 0.93} a${r},${r * 0.93} 0 0 0 0,${r * 1.86} a${r * 0.55},${r * 0.93} 0 0 1 0,${-r * 1.86}`}
          fill={A.redShade}
        />
        {/* chấm sáng cứng */}
        <ellipse cx={-r * 0.34} cy={-r * 0.4} rx={r * 0.2} ry={r * 0.13} fill="#ff8a7a" />

        {/* gai nhọn quanh thân khi đã to */}
        {size > 0.45
          ? new Array(9).fill(0).map((_, i) => {
              const a = (i / 9) * Math.PI * 2 + frame * 0.01;
              const spike = r * 0.22 * ((size - 0.4) / 0.6);
              const px = Math.cos(a) * r * 0.94;
              const py = Math.sin(a) * r * 0.88;
              return (
                <path
                  key={i}
                  d={`M${px},${py} l${Math.cos(a - 0.16) * spike},${Math.sin(a - 0.16) * spike} l${
                    Math.cos(a + 0.34) * spike * 0.5
                  },${Math.sin(a + 0.34) * spike * 0.5} z`}
                  fill={A.redShade}
                  {...LN3}
                />
              );
            })
          : null}

        {/* nút thắt bóng bay */}
        <path d={`M${-r * 0.13},${r * 0.9} l${r * 0.13},${r * 0.22} l${r * 0.13},${-r * 0.22} z`} fill={A.redShade} {...LN3} />

        {/* mắt phát sáng */}
        {mood === 'no' ? (
          <g>
            <path d={`M${-r * 0.44},${-r * 0.32} l${r * 0.28},${r * 0.28}`} {...LN} />
            <path d={`M${-r * 0.16},${-r * 0.32} l${-r * 0.28},${r * 0.28}`} {...LN} />
            <path d={`M${r * 0.16},${-r * 0.32} l${r * 0.28},${r * 0.28}`} {...LN} />
            <path d={`M${r * 0.44},${-r * 0.32} l${-r * 0.28},${r * 0.28}`} {...LN} />
          </g>
        ) : (
          <g>
            {[-1, 1].map((d) => (
              <g key={d}>
                <ellipse cx={d * r * 0.3} cy={-r * 0.22} rx={r * 0.17} ry={r * 0.2} fill={A.gold} {...LN3} />
                <ellipse cx={d * r * 0.3} cy={-r * 0.19} rx={r * 0.07} ry={r * 0.13} fill={A.ink} />
                <circle cx={d * r * 0.26} cy={-r * 0.28} r={r * 0.045} fill="#fff" />
              </g>
            ))}
            {/* lông mày xếch — luôn trông đểu */}
            <path d={`M${-r * 0.5},${-r * 0.48} l${r * 0.3},${r * 0.1}`} {...LN} />
            <path d={`M${r * 0.5},${-r * 0.48} l${-r * 0.3},${r * 0.1}`} {...LN} />
          </g>
        )}

        {/* miệng */}
        {mood === 'doi' ? (
          <ellipse cx={0} cy={r * 0.36} rx={r * 0.3} ry={r * 0.27} fill="#4a0f18" {...LN3} />
        ) : mood === 'gian' ? (
          <path d={`M${-r * 0.36},${r * 0.44} q${r * 0.36},${-r * 0.24} ${r * 0.72},0`} fill="none" {...LN} />
        ) : (
          <path d={`M${-r * 0.4},${r * 0.24} q${r * 0.4},${r * 0.42} ${r * 0.8},0 z`} fill="#4a0f18" {...LN3} />
        )}
        {mood !== 'no' ? (
          <>
            <path d={`M${-r * 0.24},${r * 0.26} l${r * 0.08},${r * 0.16} l${r * 0.08},${-r * 0.16} z`} fill="#fff" />
            <path d={`M${r * 0.08},${r * 0.26} l${r * 0.08},${r * 0.16} l${r * 0.08},${-r * 0.16} z`} fill="#fff" />
          </>
        ) : null}
      </g>
    </g>
  );
};
