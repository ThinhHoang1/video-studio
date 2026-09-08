import React from 'react';
import {interpolate, random, useCurrentFrame} from 'remotion';
import {P} from '../scenes/places';

const L = {stroke: P.line, strokeWidth: 6, strokeLinecap: 'round', strokeLinejoin: 'round'} as const;
const L4 = {...L, strokeWidth: 4} as const;

export type VoiceTrack = {am: number[]; nhan: number[]; nghi: boolean[]};
export type Sac = 'thuong' | 'vui' | 'nghi' | 'soc' | 'tuc' | 'buon' | 'met';

/**
 * Bộ lọc bám mượt: giá trị mới đuổi theo giá trị đích, không nhảy giật.
 * Chạy lại từ frame 0 mỗi lần render nên kết quả xác định, render lại
 * bao nhiêu lần cũng ra đúng một hình.
 */
const bam = (chuoi: number[], toFrame: number, len: number, heSo = 0.3) => {
  let v = 0;
  const tu = Math.max(0, toFrame - len);
  for (let i = tu; i <= toFrame; i++) v += ((chuoi[i] ?? 0) - v) * heSo;
  return v;
};

/** Lò xo tắt dần — dùng cho cử chỉ nảy lên rồi ổn định. */
const loXo = (t: number, tanSo = 0.42, tat = 0.14) =>
  t < 0 ? 0 : 1 - Math.exp(-t * tat) * Math.cos(t * tanSo);

/**
 * Nhân vật diễn theo giọng nói.
 *
 * Ba tầng chuyển động, mỗi tầng một tốc độ khác nhau — đây là thứ tạo cảm
 * giác "mượt" thay vì "máy móc":
 *  1. miệng   bám sát biên độ âm, phản ứng trong 1-2 frame
 *  2. đầu     trễ hơn thân một nhịp (follow-through)
 *  3. thân    nhún rất chậm, đổi chân trụ vài giây một lần
 */
export const Dien: React.FC<{
  giong: VoiceTrack;
  /** frame bắt đầu của chương trong timeline tổng */
  goc: number;
  sac?: Sac;
  x?: number;
  y?: number;
  s?: number;
  flip?: boolean;
  vi?: number;
}> = ({giong, goc, sac = 'thuong', x = 0, y = 0, s = 1, flip = false, vi = 1}) => {
  const frameTong = useCurrentFrame();
  const i = Math.max(0, Math.min(giong.am.length - 1, frameTong - goc));

  const am = giong.am[i] ?? 0;
  const nhan = giong.nhan[i] ?? 0;
  const dangNghi = giong.nghi[i] ?? true;

  // ── tầng 2: đầu, trễ hơn thân ───────────────────────────────────
  const nhanMuot = bam(giong.nhan, i, 20, 0.12);
  // gật nhẹ theo trọng âm + lắc rất chậm để không đứng như tượng
  const gat = nhanMuot * 7 + Math.sin(i / 34) * 2.2;
  const lac = Math.sin(i / 52) * 3.5 + nhanMuot * 2;

  // ── tầng 3: thân, đổi chân trụ mỗi ~4 giây ──────────────────────
  const chuKy = 120;
  const pha = (i % chuKy) / chuKy;
  const doiChan = Math.sin(pha * Math.PI * 2) * 5;
  // thở: khi đang nói thì nông, lúc nghỉ thì sâu
  const tho = Math.sin(i / (dangNghi ? 26 : 15)) * (dangNghi ? 4.5 : 2);

  // ── cử chỉ tay: nảy lên ở những chỗ nhấn mạnh ───────────────────
  // tìm mốc nhấn gần nhất phía trước để lò xo tính từ đó
  let mocNhan = -999;
  for (let k = i; k > Math.max(0, i - 60); k--) {
    if ((giong.nhan[k] ?? 0) > 0.55 && (giong.nhan[k - 1] ?? 0) <= 0.55) {
      mocNhan = k;
      break;
    }
  }
  const tayNay = mocNhan > -999 ? loXo(i - mocNhan) * Math.exp(-(i - mocNhan) * 0.05) : 0;
  const gocTay = -26 * tayNay;

  // ── chớp mắt: nhịp tự nhiên, nhặt thêm nhịp lúc nghỉ ────────────
  const nhipChop = 92 + Math.floor(random(`c${Math.floor(i / 92)}`) * 46);
  const nhamMat = i % nhipChop < 4;

  // ── mắt liếc: chuyển hướng nhìn mỗi vài giây ────────────────────
  const oLiec = Math.floor(i / 74);
  const liecX = (random(`l${oLiec}`) - 0.5) * 9;
  const liecY = (random(`v${oLiec}`) - 0.5) * 5;


  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={0} cy={4} rx={106} ry={16} fill="rgba(40,30,60,0.2)" />

      <g transform={`translate(${doiChan * 0.3} ${tho})`}>
        {/* chân */}
        <rect x={-52} y={-104} width={44} height={104} rx={16} fill="#3a4457" {...L} />
        <rect x={8} y={-104} width={44} height={104} rx={16} fill="#3a4457" {...L} />

        {/* thân, nghiêng nhẹ theo chân trụ */}
        <g transform={`rotate(${doiChan * 0.25})`}>
          <path d="M-88,-108 q0,-150 88,-150 q88,0 88,150 z" fill={P.cloth} {...L} />
          <path d="M-40,-250 q40,50 80,0" fill="#5b8ae8" {...L4} />
          <path d="M-70,-232 L62,-124" fill="none" stroke={P.line} strokeWidth={12} />

          {/* ví thò khỏi túi, mỏng dần suốt phim */}
          <g transform="translate(74 -128)">
            <rect
              x={-22}
              y={-30 * vi}
              width={44}
              height={18 + 34 * vi}
              rx={6}
              fill={vi > 0.35 ? '#7fc98a' : '#bdb7a8'}
              {...L4}
            />
          </g>

          {/* tay trái: nảy theo trọng âm */}
          <g transform={`rotate(${-gocTay * 0.7} -84 -222)`}>
            <path d="M-84,-222 q-52,44 -40,104" fill="none" stroke={P.line} strokeWidth={30} strokeLinecap="round" />
            <path d="M-84,-222 q-52,44 -40,104" fill="none" stroke={P.cloth} strokeWidth={19} strokeLinecap="round" />
            <circle cx={-124} cy={-118} r={27} fill="#f0c49a" {...L4} />
          </g>
          {/* tay phải */}
          <g transform={`rotate(${gocTay} 84 -222)`}>
            <path d="M84,-222 q52,44 40,104" fill="none" stroke={P.line} strokeWidth={30} strokeLinecap="round" />
            <path d="M84,-222 q52,44 40,104" fill="none" stroke={P.cloth} strokeWidth={19} strokeLinecap="round" />
            <circle cx={124} cy={-118} r={27} fill="#f0c49a" {...L4} />
          </g>

          {/* đầu — xoay quanh gáy, trễ hơn thân */}
          <g transform={`translate(0 -320) rotate(${lac} 0 100) translate(0 ${gat * 0.5})`}>
            <ellipse cx={0} cy={0} rx={96} ry={102} fill="#f0c49a" {...L} />
            <path
              d="M-96,-24 q10,-92 96,-92 q86,0 96,92 q-40,-46 -96,-46 q-56,0 -96,46 z"
              fill="#2a2028"
              {...L}
            />
            <path d="M8,-112 q22,-46 46,-40 q-24,14 -22,44" fill="#2a2028" {...L4} />
            <ellipse cx={-96} cy={12} rx={17} ry={23} fill="#d9a878" {...L4} />
            <ellipse cx={96} cy={12} rx={17} ry={23} fill="#d9a878" {...L4} />

            {/* lông mày — nhướn lên theo trọng âm, đây là nửa phần biểu cảm */}
            {(() => {
              const nhuon = nhanMuot * 9;
              const cau = sac === 'tuc' ? 8 : sac === 'buon' ? -6 : 0;
              return (
                <>
                  <path d={`M-58,${-40 - nhuon} q22,${-10 + cau} 42,${-2 + cau}`} fill="none" {...L4} />
                  <path d={`M58,${-40 - nhuon} q-22,${-10 + cau} -42,${-2 + cau}`} fill="none" {...L4} />
                </>
              );
            })()}

            {/* mắt */}
            {[-38, 38].map((cx) =>
              nhamMat ? (
                <path key={cx} d={`M${cx - 16},0 q16,10 32,0`} fill="none" {...L4} />
              ) : (
                <g key={cx}>
                  <ellipse
                    cx={cx}
                    cy={0}
                    rx={16}
                    ry={sac === 'soc' ? 21 : 18}
                    fill="#fffaf0"
                    {...L4}
                  />
                  <circle cx={cx + liecX} cy={liecY} r={9} fill={P.line} />
                </g>
              )
            )}

            {/* MIỆNG — hình cố định theo cảm xúc.
                Từng thử cho miệng mở theo biên độ sóng âm, nhưng tiếng Việt
                nhiều thanh điệu nên biên độ nhảy liên tục, ra cảm giác lắp bắp
                chứ không phải đang nói. Miệng đứng yên trông tự nhiên hơn hẳn. */}
            {(() => {
              if (sac === 'soc') return <ellipse cx={0} cy={56} rx={17} ry={21} fill="#7a2b3a" {...L4} />;
              if (sac === 'vui') return <path d="M-28,46 q28,30 56,0 z" fill="#7a2b3a" {...L4} />;
              if (sac === 'buon') return <path d="M-24,64 q24,-26 48,0" fill="none" {...L4} />;
              if (sac === 'tuc') return <path d="M-24,58 q24,-14 48,0" fill="none" {...L4} />;
              if (sac === 'met') return <path d="M-20,58 q10,11 20,0 q10,-11 20,0" fill="none" {...L4} />;
              if (sac === 'nghi') return <path d="M-14,54 q22,12 38,-4" fill="none" {...L4} />;
              return <path d="M-20,52 q20,15 40,0" fill="none" {...L4} />;
            })()}

            {/* má ửng khi nhấn mạnh */}
            {nhanMuot > 0.4 ? (
              <g opacity={Math.min(0.55, nhanMuot)}>
                <ellipse cx={-64} cy={34} rx={17} ry={10} fill="#e88a8a" />
                <ellipse cx={64} cy={34} rx={17} ry={10} fill="#e88a8a" />
              </g>
            ) : null}

            {sac === 'buon' ? (
              <path d="M-38,20 q6,32 -2,50" fill="none" stroke="#5cc0f0" strokeWidth={6} strokeLinecap="round" />
            ) : null}
          </g>
        </g>
      </g>
    </g>
  );
};
