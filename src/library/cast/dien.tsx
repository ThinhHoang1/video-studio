import React from 'react';
import {interpolate, random, useCurrentFrame} from 'remotion';
import {P} from '../scenes/places';
import {Dang, Khop, TU_THE, tron} from './tu-the';

const L = {stroke: P.line, strokeWidth: 6, strokeLinecap: 'round', strokeLinejoin: 'round'} as const;
const L4 = {...L, strokeWidth: 4} as const;

export type VoiceTrack = {am: number[]; nhan: number[]; nghi: boolean[]};
export type Sac = 'thuong' | 'vui' | 'nghi' | 'soc' | 'tuc' | 'buon' | 'met';
export type {Dang};

const DA = '#f0c49a';
const DA_TOI = '#d9a878';

/** Bám mượt: giá trị đuổi theo đích, chạy lại từ 0 nên render bao nhiêu lần cũng như nhau. */
const bam = (chuoi: number[], toFrame: number, len: number, heSo = 0.3) => {
  let v = 0;
  for (let i = Math.max(0, toFrame - len); i <= toFrame; i++) v += ((chuoi[i] ?? 0) - v) * heSo;
  return v;
};

/**
 * Tay hai đoạn: vai → khuỷu → bàn tay.
 *
 * Bản trước vẽ tay bằng MỘT đường cong cố định, nên đổi tư thế cũng chỉ xoay
 * được cả cánh tay như que củi. Tách làm hai đoạn có khớp thì mới ra được
 * khoanh tay, ôm đầu, cầm điện thoại — những dáng cần cẳng tay gập lại.
 */
const Tay: React.FC<{
  ben: -1 | 1;
  vai: number;
  khuyu: number;
  ao: string;
  children?: React.ReactNode;
}> = ({ben, vai, khuyu, ao, children}) => {
  const goc = 88;   // cánh tay trên
  const cang = 76;  // cẳng tay
  // vai đặt NGOÀI mép thân (thân rộng ±88) để tay không chui vào trong người
  const x0 = ben * 92;
  const y0 = -226;

  // 0° = thõng xuống, 90° = ngang chìa ra, 180° = giơ thẳng lên.
  // `ben` chỉ lật trục ngang, nên hai bên dùng chung giá trị góc dương.
  const a1 = (vai * Math.PI) / 180;
  const x1 = x0 + Math.sin(a1) * goc * ben;
  const y1 = y0 + Math.cos(a1) * goc;

  // khuỷu gập vào trong: trừ đi để cẳng tay hướng về phía thân
  const a2 = ((vai - khuyu) * Math.PI) / 180;
  const x2 = x1 + Math.sin(a2) * cang * ben;
  const y2 = y1 + Math.cos(a2) * cang;

  return (
    <g>
      <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={P.line} strokeWidth={30} strokeLinecap="round" />
      <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={ao} strokeWidth={19} strokeLinecap="round" />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={P.line} strokeWidth={28} strokeLinecap="round" />
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={ao} strokeWidth={17} strokeLinecap="round" />
      <circle cx={x2} cy={y2} r={25} fill={DA} {...L4} />
      {children ? <g transform={`translate(${x2} ${y2})`}>{children}</g> : null}
    </g>
  );
};

/**
 * Nhân vật.
 *
 * Ba nguồn chuyển động, cộng dồn:
 *  1. TƯ THẾ — đổi theo shot, trượt sang tư thế mới bằng lò xo. Đây là phần
 *     người xem thật sự nhìn thấy; hai nguồn dưới chỉ là gia vị.
 *  2. giọng nói — gật đầu, nhướn mày theo trọng âm
 *  3. đồng hồ — thở, đổi chân trụ, chớp mắt, liếc mắt
 */
export const Dien: React.FC<{
  giong: VoiceTrack;
  /** offset của shot trong chương — cộng vào frame để tra đúng đường bao giọng */
  goc: number;
  dang?: Dang;
  /** tư thế của shot trước — để trượt sang, không nhảy cóc */
  dangTruoc?: Dang;
  sac?: Sac;
  x?: number;
  y?: number;
  s?: number;
  flip?: boolean;
  vi?: number;
}> = ({giong, goc, dang = 'dung', dangTruoc, sac = 'thuong', x = 0, y = 0, s = 1, flip = false, vi = 1}) => {
  const frameShot = useCurrentFrame();
  const i = Math.max(0, Math.min(giong.am.length - 1, frameShot + goc));

  const nhan = bam(giong.nhan, i, 20, 0.12);
  const dangNghi = giong.nghi[i] ?? true;

  // ── 1. tư thế: trượt từ dáng cũ sang dáng mới trong 10 frame ──────────
  const CHUYEN = 10;
  const tChuyen = interpolate(frameShot, [0, CHUYEN], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // easing lò xo nhẹ: vọt qua đích một chút rồi về, giống cơ thể thật
  const eChuyen = 1 - Math.pow(1 - tChuyen, 3) + Math.sin(tChuyen * Math.PI) * 0.12;
  const k: Khop = dangTruoc ? tron(TU_THE[dangTruoc], TU_THE[dang], Math.min(1, eChuyen)) : TU_THE[dang];

  // ── 2. gia vị theo giọng ─────────────────────────────────────────────
  const gat = nhan * 8;
  const nhuonMay = nhan * 9;

  // ── 3. gia vị theo đồng hồ ───────────────────────────────────────────
  const doiChan = Math.sin((i / 120) * Math.PI * 2) * 5;
  const tho = Math.sin(i / (dangNghi ? 26 : 15)) * (dangNghi ? 4.5 : 2);
  const lacDau = Math.sin(i / 52) * 2.5;

  const nhipChop = 92 + Math.floor(random(`c${Math.floor(i / 92)}`) * 46);
  const nhamMat = i % nhipChop < 4;
  const oLiec = Math.floor(i / 74);
  const liecX = (random(`l${oLiec}`) - 0.5) * 9;
  const liecY = (random(`v${oLiec}`) - 0.5) * 5;

  const quayLung = k.lat < 0;
  const ao = P.cloth;

  const mieng = () => {
    if (sac === 'soc') return <ellipse cx={0} cy={56} rx={17} ry={21} fill="#7a2b3a" {...L4} />;
    if (sac === 'vui') return <path d="M-28,46 q28,30 56,0 z" fill="#7a2b3a" {...L4} />;
    if (sac === 'buon') return <path d="M-24,64 q24,-26 48,0" fill="none" {...L4} />;
    if (sac === 'tuc') return <path d="M-24,58 q24,-14 48,0" fill="none" {...L4} />;
    if (sac === 'met') return <path d="M-20,58 q10,11 20,0 q10,-11 20,0" fill="none" {...L4} />;
    if (sac === 'nghi') return <path d="M-14,54 q22,12 38,-4" fill="none" {...L4} />;
    return <path d="M-20,52 q20,15 40,0" fill="none" {...L4} />;
  };

  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={0} cy={4} rx={106} ry={16} fill="rgba(40,30,60,0.2)" />

      <g transform={`translate(${doiChan * 0.3} ${tho + k.hup})`}>
        {/* chân — hạ thấp khi cúi/ngồi */}
        <rect x={-52} y={-104 + k.hup * 0.4} width={44} height={104 - k.hup * 0.4} rx={16} fill="#3a4457" {...L} />
        <rect x={8} y={-104 + k.hup * 0.4} width={44} height={104 - k.hup * 0.4} rx={16} fill="#3a4457" {...L} />

        <g transform={`rotate(${k.than + doiChan * 0.25})`}>
          {/* Tay nào vẽ trước thân thì nằm sau lưng. Khoanh tay, ôm đầu,
              chống hông đều cần cẳng tay ĐÈ LÊN ngực mới đọc ra dáng, nên
              tư thế tự khai báo tay nào phải vẽ sau. */}
          {k.truoc !== 'ca-hai' ? <Tay ben={-1} vai={k.vaiT} khuyu={k.khuyuT} ao={ao} /> : null}

          {/* thân */}
          <path d="M-88,-108 q0,-150 88,-150 q88,0 88,150 z" fill={ao} {...L} />
          {quayLung ? (
            <path d="M-30,-244 L30,-244 L18,-116 L-18,-116 z" fill="#3a5fb0" {...L4} />
          ) : (
            <>
              <path d="M-40,-250 q40,50 80,0" fill="#5b8ae8" {...L4} />
              <path d="M-70,-232 L62,-124" fill="none" stroke={P.line} strokeWidth={12} />
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
            </>
          )}

          {k.truoc === 'ca-hai' ? <Tay ben={-1} vai={k.vaiT} khuyu={k.khuyuT} ao={ao} /> : null}
          <Tay ben={1} vai={k.vaiP} khuyu={k.khuyuP} ao={ao}>
            {dang === 'camDT' ? <rect x={-13} y={-30} width={26} height={56} rx={5} fill="#22222e" {...L4} /> : null}
          </Tay>

          {/* đầu */}
          <g transform={`translate(0 -320) rotate(${k.dau + lacDau} 0 100) translate(0 ${gat * 0.5})`}>
            <ellipse cx={0} cy={0} rx={96} ry={102} fill={DA} {...L} />
            <path d="M-96,-24 q10,-92 96,-92 q86,0 96,92 q-40,-46 -96,-46 q-56,0 -96,46 z" fill="#2a2028" {...L} />
            <path d="M8,-112 q22,-46 46,-40 q-24,14 -22,44" fill="#2a2028" {...L4} />
            <ellipse cx={-96} cy={12} rx={17} ry={23} fill={DA_TOI} {...L4} />
            <ellipse cx={96} cy={12} rx={17} ry={23} fill={DA_TOI} {...L4} />

            {quayLung ? (
              // gáy: chỉ tóc, không mặt
              <path d="M-92,-30 q10,80 92,84 q82,-4 92,-84 q-40,54 -92,54 q-52,0 -92,-54 z" fill="#2a2028" />
            ) : (
              <>
                {(() => {
                  const n = nhuonMay;
                  const cau = sac === 'tuc' ? 8 : sac === 'buon' ? -6 : 0;
                  return (
                    <>
                      <path d={`M-58,${-40 - n} q22,${-10 + cau} 42,${-2 + cau}`} fill="none" {...L4} />
                      <path d={`M58,${-40 - n} q-22,${-10 + cau} -42,${-2 + cau}`} fill="none" {...L4} />
                    </>
                  );
                })()}

                {[-38, 38].map((cx) =>
                  nhamMat ? (
                    <path key={cx} d={`M${cx - 16},0 q16,10 32,0`} fill="none" {...L4} />
                  ) : (
                    <g key={cx}>
                      <ellipse cx={cx} cy={0} rx={16} ry={sac === 'soc' ? 21 : 18} fill="#fffaf0" {...L4} />
                      <circle cx={cx + liecX} cy={liecY} r={9} fill={P.line} />
                    </g>
                  )
                )}

                {mieng()}

                {nhan > 0.4 ? (
                  <g opacity={Math.min(0.55, nhan)}>
                    <ellipse cx={-64} cy={34} rx={17} ry={10} fill="#e88a8a" />
                    <ellipse cx={64} cy={34} rx={17} ry={10} fill="#e88a8a" />
                  </g>
                ) : null}

                {sac === 'buon' ? (
                  <path d="M-38,20 q6,32 -2,50" fill="none" stroke="#5cc0f0" strokeWidth={6} strokeLinecap="round" />
                ) : null}
              </>
            )}
          </g>
        </g>
      </g>
    </g>
  );
};
