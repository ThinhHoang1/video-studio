import React from 'react';
import {interpolate, random, useCurrentFrame} from 'remotion';
import {DAU, T, M} from './than-hinh';
import {Dang, Khop, TU_THE, tron} from './tu-the';

export type VoiceTrack = {am: number[]; nhan: number[]; nghi: boolean[]};
export type Sac = 'thuong' | 'vui' | 'nghi' | 'soc' | 'tuc' | 'buon' | 'met';
export type {Dang};

const N = {stroke: M.net, strokeLinecap: 'round', strokeLinejoin: 'round'} as const;
const NET = 5.5;
const NET_MANH = 3.6;

const bam = (chuoi: number[], den: number, dai: number, heSo = 0.3) => {
  let v = 0;
  for (let i = Math.max(0, den - dai); i <= den; i++) v += ((chuoi[i] ?? 0) - v) * heSo;
  return v;
};

/**
 * Chi (tay hoặc chân) gồm hai đoạn có khớp, vẽ bằng hình thon — gốc dày,
 * ngọn thon. Vẽ bằng đường thẳng độ dày đều là thứ khiến bản cũ trông như
 * que củi ghép lại.
 */
const Chi: React.FC<{
  x0: number;
  y0: number;
  gocTren: number;
  gocDuoi: number;
  daiTren: number;
  daiDuoi: number;
  day: number;
  ben: -1 | 1;
  mau: string;
  mauToi: string;
  /** vẽ bàn tay / bàn chân ở đầu mút */
  mut?: 'tay' | 'giay' | 'khong';
  children?: React.ReactNode;
}> = ({x0, y0, gocTren, gocDuoi, daiTren, daiDuoi, day, ben, mau, mauToi, mut = 'tay', children}) => {
  const a1 = (gocTren * Math.PI) / 180;
  const x1 = x0 + Math.sin(a1) * daiTren * ben;
  const y1 = y0 + Math.cos(a1) * daiTren;

  const a2 = (gocDuoi * Math.PI) / 180;
  const x2 = x1 + Math.sin(a2) * daiDuoi * ben;
  const y2 = y1 + Math.cos(a2) * daiDuoi;

  // pháp tuyến của từng đoạn, để dựng hình thon thay vì đường thẳng
  const px1 = Math.cos(a1) * ben;
  const py1 = -Math.sin(a1);
  const px2 = Math.cos(a2) * ben;
  const py2 = -Math.sin(a2);

  const d0 = day;
  const d1 = day * 0.82;
  const d2 = day * 0.66;

  const tren = `M${x0 + px1 * d0},${y0 + py1 * d0} L${x1 + px1 * d1},${y1 + py1 * d1} L${x1 - px1 * d1},${
    y1 - py1 * d1
  } L${x0 - px1 * d0},${y0 - py1 * d0} Z`;
  const duoi = `M${x1 + px2 * d1},${y1 + py2 * d1} L${x2 + px2 * d2},${y2 + py2 * d2} L${x2 - px2 * d2},${
    y2 - py2 * d2
  } L${x1 - px2 * d1},${y1 - py2 * d1} Z`;

  return (
    <g>
      <path d={tren} fill={mau} {...N} strokeWidth={NET} />
      <path d={duoi} fill={mau} {...N} strokeWidth={NET} />
      {/* mảng bóng chạy dọc mép trong của chi */}
      <path
        d={`M${x0 - px1 * d0},${y0 - py1 * d0} L${x1 - px1 * d1},${y1 - py1 * d1} L${x1 - px1 * d1 * 0.3},${
          y1 - py1 * d1 * 0.3
        } L${x0 - px1 * d0 * 0.3},${y0 - py1 * d0 * 0.3} Z`}
        fill={mauToi}
      />
      <circle cx={x1} cy={y1} r={d1 * 0.98} fill={mau} {...N} strokeWidth={NET_MANH} />

      {mut === 'tay' ? (
        <g transform={`translate(${x2} ${y2}) rotate(${gocDuoi * -ben})`}>
          {/* bàn tay dạng bao tay: bầu ở lòng, có một ngón cái */}
          <path
            d={`M${-T.banTay * ben},-${T.banTay * 0.2} q${-T.banTay * 0.5 * ben},${T.banTay * 1.1} ${
              T.banTay * 0.5 * ben
            },${T.banTay * 1.5} q${T.banTay * 1.1 * ben},${T.banTay * 0.4} ${T.banTay * 1.3 * ben},${
              -T.banTay * 0.5
            } q${T.banTay * 0.3 * ben},${-T.banTay} ${-T.banTay * 0.8 * ben},${-T.banTay * 0.9} Z`}
            fill={M.da}
            {...N}
            strokeWidth={NET_MANH}
          />
        </g>
      ) : mut === 'giay' ? (
        <path
          d={`M${x2 - T.giay * 0.5 * ben},${y2 - T.giay * 0.35} q${-T.giay * 0.2 * ben},${T.giay * 0.7} ${
            T.giay * 0.3 * ben
          },${T.giay * 0.75} L${x2 + T.giay * 1.5 * ben},${y2 + T.giay * 0.4} q${T.giay * 0.35 * ben},${
            -T.giay * 0.35
          } ${-T.giay * 0.15 * ben},${-T.giay * 0.75} Z`}
          fill={M.giay}
          {...N}
          strokeWidth={NET_MANH}
        />
      ) : null}
      {children ? <g transform={`translate(${x2} ${y2})`}>{children}</g> : null}
    </g>
  );
};

/** Mắt: tròng có hai tông, chấm sáng, mí trên là nét dày nhất khuôn mặt. */
const Mat: React.FC<{cx: number; nham: boolean; to: number; liecX: number; liecY: number}> = ({
  cx,
  nham,
  to,
  liecX,
  liecY,
}) => {
  const w = DAU * 0.15;
  const h = DAU * 0.19 * to;
  if (nham)
    return <path d={`M${cx - w},0 q${w},${h * 0.55} ${w * 2},0`} fill="none" {...N} strokeWidth={NET} />;
  return (
    <g>
      <ellipse cx={cx} cy={0} rx={w} ry={h} fill="#fffaf2" />
      <clipPath id={`m${Math.round(cx)}`}>
        <ellipse cx={cx} cy={0} rx={w} ry={h} />
      </clipPath>
      <g clipPath={`url(#m${Math.round(cx)})`}>
        <circle cx={cx + liecX} cy={liecY + h * 0.06} r={w * 0.78} fill="#5a4632" />
        <circle cx={cx + liecX} cy={liecY + h * 0.06} r={w * 0.44} fill={M.net} />
        <circle cx={cx + liecX - w * 0.28} cy={liecY - h * 0.34} r={w * 0.26} fill="#fff" />
      </g>
      <ellipse cx={cx} cy={0} rx={w} ry={h} fill="none" {...N} strokeWidth={NET_MANH} />
      {/* mí trên */}
      <path
        d={`M${cx - w - 2},${-h * 0.5} q${w},${-h * 0.7} ${w * 2 + 4},${-h * 0.1}`}
        fill="none"
        stroke={M.net}
        strokeWidth={NET * 1.5}
        strokeLinecap="round"
      />
    </g>
  );
};

/**
 * Nhân vật.
 *
 * Dựng theo đầu-làm-đơn-vị, cao 6 đầu. Thân có vai rộng, eo hẹp, hông nở —
 * ba mốc đó là thứ tạo ra bóng dáng người. Mỗi mảng màu đi kèm một mảng
 * tối cạnh nó, cắt cứng chứ không chuyển mượt, đúng kiểu tô cel.
 */
export const NhanVat: React.FC<{
  giong: VoiceTrack;
  /** offset của shot trong chương */
  goc: number;
  dang?: Dang;
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
  const nghi = giong.nghi[i] ?? true;

  const tChuyen = interpolate(frameShot, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const eChuyen = Math.min(1, 1 - Math.pow(1 - tChuyen, 3) + Math.sin(tChuyen * Math.PI) * 0.12);
  const k: Khop = dangTruoc ? tron(TU_THE[dangTruoc], TU_THE[dang], eChuyen) : TU_THE[dang];

  const tho = Math.sin(i / (nghi ? 26 : 15)) * (nghi ? DAU * 0.05 : DAU * 0.022);
  const doiChan = Math.sin((i / 120) * Math.PI * 2) * DAU * 0.055;
  const lacDau = Math.sin(i / 52) * 2.4;
  const gat = nhan * 7;

  const nhipChop = 92 + Math.floor(random(`c${Math.floor(i / 92)}`) * 46);
  const nham = i % nhipChop < 4;
  const oLiec = Math.floor(i / 74);
  const liecX = (random(`l${oLiec}`) - 0.5) * DAU * 0.06;
  const liecY = (random(`v${oLiec}`) - 0.5) * DAU * 0.035;

  const quayLung = k.lat < 0;
  const hup = (k.hup / 34) * DAU * 0.42;

  const mieng = () => {
    const y0 = DAU * 0.26;
    if (sac === 'soc')
      return <ellipse cx={0} cy={y0 + 4} rx={DAU * 0.09} ry={DAU * 0.12} fill={M.mieng} {...N} strokeWidth={NET_MANH} />;
    if (sac === 'vui')
      return (
        <path
          d={`M${-DAU * 0.14},${y0 - 4} q${DAU * 0.14},${DAU * 0.16} ${DAU * 0.28},0 Z`}
          fill={M.mieng}
          {...N}
          strokeWidth={NET_MANH}
        />
      );
    if (sac === 'buon')
      return <path d={`M${-DAU * 0.12},${y0 + 8} q${DAU * 0.12},${-DAU * 0.13} ${DAU * 0.24},0`} fill="none" {...N} strokeWidth={NET_MANH} />;
    if (sac === 'tuc')
      return <path d={`M${-DAU * 0.12},${y0 + 4} q${DAU * 0.12},${-DAU * 0.07} ${DAU * 0.24},0`} fill="none" {...N} strokeWidth={NET} />;
    if (sac === 'met')
      return (
        <path
          d={`M${-DAU * 0.1},${y0 + 2} q${DAU * 0.05},${DAU * 0.06} ${DAU * 0.1},0 q${DAU * 0.05},${-DAU * 0.06} ${DAU * 0.1},0`}
          fill="none"
          {...N}
          strokeWidth={NET_MANH}
        />
      );
    if (sac === 'nghi')
      return <path d={`M${-DAU * 0.07},${y0} q${DAU * 0.11},${DAU * 0.06} ${DAU * 0.19},${-DAU * 0.02}`} fill="none" {...N} strokeWidth={NET_MANH} />;
    return <path d={`M${-DAU * 0.1},${y0 - 2} q${DAU * 0.1},${DAU * 0.075} ${DAU * 0.2},0`} fill="none" {...N} strokeWidth={NET_MANH} />;
  };

  const may = (ben: -1 | 1) => {
    const cx = ben * DAU * 0.22;
    const y0 = -DAU * 0.19 - nhan * DAU * 0.05;
    const cau = sac === 'tuc' ? DAU * 0.05 : sac === 'buon' ? -DAU * 0.04 : 0;
    return (
      <path
        d={`M${cx - ben * DAU * 0.11},${y0 + cau} q${ben * DAU * 0.06},${-DAU * 0.05} ${ben * DAU * 0.16},${-cau * 0.4}`}
        fill="none"
        {...N}
        strokeWidth={NET}
      />
    );
  };

  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx={0} cy={2} rx={DAU * 0.85} ry={DAU * 0.14} fill="rgba(36,28,46,0.22)" />

      <g transform={`translate(${doiChan * 0.4} ${tho + hup})`}>
        {/* ── chân ─────────────────────────────────────────────── */}
        {([-1, 1] as const).map((ben) => (
          <Chi
            key={`chan${ben}`}
            x0={ben * T.hongRong * 0.5}
            y0={T.hongY}
            gocTren={ben * (2 + doiChan * 0.12)}
            gocDuoi={ben * -1}
            daiTren={T.dui}
            daiDuoi={T.cangChan}
            day={T.chanDay}
            ben={1}
            mau={M.quan}
            mauToi={M.quanToi}
            mut="giay"
          />
        ))}

        <g transform={`rotate(${k.than + doiChan * 0.2} 0 ${T.hongY})`}>
          {/* tay sau lưng */}
          {k.truoc !== 'ca-hai' ? (
            <Chi
              x0={-T.vaiRong * 0.92}
              y0={T.vaiY}
              gocTren={k.vaiT}
              gocDuoi={k.vaiT - k.khuyuT}
              daiTren={T.canhTay}
              daiDuoi={T.cangTay}
              day={T.tayDay}
              ben={-1}
              mau={M.ao}
              mauToi={M.aoToi}
            />
          ) : null}

          {/* ── thân: vai rộng → eo hẹp → hông nở ──────────────── */}
          <path
            d={`M${-T.vaiRong},${T.vaiY}
                C${-T.vaiRong * 1.04},${T.vaiY + DAU * 0.5} ${-T.eoRong},${T.eoY - DAU * 0.3} ${-T.eoRong},${T.eoY}
                C${-T.eoRong},${T.eoY + DAU * 0.25} ${-T.hongRong},${T.hongY - DAU * 0.2} ${-T.hongRong},${T.hongY}
                L${T.hongRong},${T.hongY}
                C${T.hongRong},${T.hongY - DAU * 0.2} ${T.eoRong},${T.eoY + DAU * 0.25} ${T.eoRong},${T.eoY}
                C${T.eoRong},${T.eoY - DAU * 0.3} ${T.vaiRong * 1.04},${T.vaiY + DAU * 0.5} ${T.vaiRong},${T.vaiY}
                Q0,${T.vaiY - DAU * 0.26} ${-T.vaiRong},${T.vaiY} Z`}
            fill={M.ao}
            {...N}
            strokeWidth={NET}
          />
          {/* mảng bóng cel bên trái thân */}
          <path
            d={`M${-T.vaiRong},${T.vaiY}
                C${-T.vaiRong * 1.04},${T.vaiY + DAU * 0.5} ${-T.eoRong},${T.eoY - DAU * 0.3} ${-T.eoRong},${T.eoY}
                C${-T.eoRong},${T.eoY + DAU * 0.25} ${-T.hongRong},${T.hongY - DAU * 0.2} ${-T.hongRong},${T.hongY}
                L${-T.hongRong * 0.34},${T.hongY}
                L${-T.eoRong * 0.3},${T.eoY}
                L${-T.vaiRong * 0.42},${T.vaiY} Z`}
            fill={M.aoToi}
          />

          {quayLung ? (
            <path d={`M0,${T.vaiY + DAU * 0.1} L0,${T.hongY}`} stroke={M.aoToi} strokeWidth={NET} />
          ) : (
            <>
              {/* cổ áo */}
              <path
                d={`M${-DAU * 0.24},${T.vaiY - DAU * 0.04} q${DAU * 0.24},${DAU * 0.3} ${DAU * 0.48},0`}
                fill={M.aoSang}
                {...N}
                strokeWidth={NET_MANH}
              />
              {/* dây túi đeo chéo */}
              <path
                d={`M${-T.vaiRong * 0.72},${T.vaiY + DAU * 0.12} L${T.eoRong * 0.72},${T.eoY + DAU * 0.18}`}
                stroke={M.net}
                strokeWidth={DAU * 0.09}
                strokeLinecap="round"
              />
              {/* ví thò khỏi túi — mỏng dần theo chương */}
              <g transform={`translate(${T.hongRong * 0.72} ${T.hongY - DAU * 0.3})`}>
                <path
                  d={`M${-DAU * 0.15},${-DAU * 0.24 * vi} h${DAU * 0.3} v${DAU * (0.14 + 0.26 * vi)} h${-DAU * 0.3} Z`}
                  fill={vi > 0.35 ? M.tui : '#a9a396'}
                  {...N}
                  strokeWidth={NET_MANH}
                />
                <path
                  d={`M${-DAU * 0.15},${-DAU * 0.24 * vi} h${DAU * 0.1} v${DAU * (0.14 + 0.26 * vi)} h${-DAU * 0.1} Z`}
                  fill={vi > 0.35 ? M.tuiToi : '#8d8779'}
                />
              </g>
            </>
          )}

          {k.truoc === 'ca-hai' ? (
            <Chi
              x0={-T.vaiRong * 0.92}
              y0={T.vaiY}
              gocTren={k.vaiT}
              gocDuoi={k.vaiT - k.khuyuT}
              daiTren={T.canhTay}
              daiDuoi={T.cangTay}
              day={T.tayDay}
              ben={-1}
              mau={M.ao}
              mauToi={M.aoToi}
            />
          ) : null}

          <Chi
            x0={T.vaiRong * 0.92}
            y0={T.vaiY}
            gocTren={k.vaiP}
            gocDuoi={k.vaiP - k.khuyuP}
            daiTren={T.canhTay}
            daiDuoi={T.cangTay}
            day={T.tayDay}
            ben={1}
            mau={M.ao}
            mauToi={M.aoToi}
          >
            {dang === 'camDT' ? (
              <rect
                x={-DAU * 0.09}
                y={-DAU * 0.22}
                width={DAU * 0.18}
                height={DAU * 0.42}
                rx={DAU * 0.04}
                fill="#1c1c26"
                {...N}
                strokeWidth={NET_MANH}
              />
            ) : null}
          </Chi>

          {/* ── cổ ────────────────────────────────────────────── */}
          <path
            d={`M${-T.coRong},${T.coY} h${T.coRong * 2} v${DAU * 0.26} h${-T.coRong * 2} Z`}
            fill={M.da}
            {...N}
            strokeWidth={NET_MANH}
          />
          <path d={`M${-T.coRong},${T.coY} h${T.coRong * 2} v${DAU * 0.1} h${-T.coRong * 2} Z`} fill={M.daToi} />

          {/* ── đầu ───────────────────────────────────────────── */}
          <g transform={`translate(0 ${T.dauY}) rotate(${k.dau + lacDau} 0 ${DAU * 0.5}) translate(0 ${gat * 0.4})`}>
            {/* sọ + hàm thon về cằm, không phải hình elip */}
            <path
              d={`M${-T.dauR},${-DAU * 0.06}
                  C${-T.dauR},${-T.dauCao * 1.1} ${T.dauR},${-T.dauCao * 1.1} ${T.dauR},${-DAU * 0.06}
                  C${T.dauR},${DAU * 0.24} ${T.dauR * 0.62},${DAU * 0.5} 0,${DAU * 0.62}
                  C${-T.dauR * 0.62},${DAU * 0.5} ${-T.dauR},${DAU * 0.24} ${-T.dauR},${-DAU * 0.06} Z`}
              fill={M.da}
              {...N}
              strokeWidth={NET}
            />
            {/* mảng bóng nửa mặt bên trái */}
            <path
              d={`M${-T.dauR},${-DAU * 0.06}
                  C${-T.dauR},${-T.dauCao * 1.1} ${-T.dauR * 0.1},${-T.dauCao * 1.16} ${-T.dauR * 0.16},${-DAU * 0.06}
                  C${-T.dauR * 0.2},${DAU * 0.3} ${-T.dauR * 0.22},${DAU * 0.5} 0,${DAU * 0.62}
                  C${-T.dauR * 0.62},${DAU * 0.5} ${-T.dauR},${DAU * 0.24} ${-T.dauR},${-DAU * 0.06} Z`}
              fill={M.daToi}
            />
            {/* tai */}
            <path
              d={`M${-T.dauR},${DAU * 0.02} q${-DAU * 0.11},${-DAU * 0.03} ${-DAU * 0.1},${DAU * 0.1} q0,${DAU * 0.13} ${DAU * 0.11},${DAU * 0.1}`}
              fill={M.da}
              {...N}
              strokeWidth={NET_MANH}
            />
            <path
              d={`M${T.dauR},${DAU * 0.02} q${DAU * 0.11},${-DAU * 0.03} ${DAU * 0.1},${DAU * 0.1} q0,${DAU * 0.13} ${-DAU * 0.11},${DAU * 0.1}`}
              fill={M.da}
              {...N}
              strokeWidth={NET_MANH}
            />

            {quayLung ? (
              // gáy: tóc phủ kín, không để hở mảng da trắng
              <path
                d={`M${-T.dauR * 1.02},${-DAU * 0.02}
                    C${-T.dauR},${DAU * 0.3} ${-T.dauR * 0.6},${DAU * 0.56} 0,${DAU * 0.6}
                    C${T.dauR * 0.6},${DAU * 0.56} ${T.dauR},${DAU * 0.3} ${T.dauR * 1.02},${-DAU * 0.02} Z`}
                fill={M.toc}
                {...N}
                strokeWidth={NET_MANH}
              />
            ) : null}
            {!quayLung ? (
              <>
                {may(-1)}
                {may(1)}
                <Mat cx={-DAU * 0.21} nham={nham} to={sac === 'soc' ? 1.2 : 1} liecX={liecX} liecY={liecY} />
                <Mat cx={DAU * 0.21} nham={nham} to={sac === 'soc' ? 1.2 : 1} liecX={liecX} liecY={liecY} />
                {/* mũi: một nét ngắn */}
                <path
                  d={`M${DAU * 0.015},${DAU * 0.11} l${DAU * 0.045},${DAU * 0.055} l${-DAU * 0.055},${DAU * 0.008}`}
                  fill="none"
                  {...N}
                  strokeWidth={NET_MANH}
                />
                {mieng()}
                {nhan > 0.35 ? (
                  <g opacity={Math.min(0.5, nhan)}>
                    <ellipse cx={-DAU * 0.33} cy={DAU * 0.15} rx={DAU * 0.09} ry={DAU * 0.05} fill={M.ma} />
                    <ellipse cx={DAU * 0.33} cy={DAU * 0.15} rx={DAU * 0.09} ry={DAU * 0.05} fill={M.ma} />
                  </g>
                ) : null}
                {sac === 'buon' ? (
                  <path
                    d={`M${-DAU * 0.21},${DAU * 0.08} q${DAU * 0.03},${DAU * 0.16} ${-DAU * 0.01},${DAU * 0.25}`}
                    fill="none"
                    stroke="#68c4f0"
                    strokeWidth={NET_MANH}
                    strokeLinecap="round"
                  />
                ) : null}
              </>
            ) : null}

            {/* ── tóc: khối chính + các lọn rời + dải sáng ───── */}
            <path
              d={`M${-T.dauR * 1.06},${DAU * 0.06}
                  C${-T.dauR * 1.12},${-T.dauCao * 1.3} ${T.dauR * 1.12},${-T.dauCao * 1.3} ${T.dauR * 1.06},${DAU * 0.06}
                  C${T.dauR * 0.9},${-DAU * 0.2} ${T.dauR * 0.4},${-DAU * 0.34} ${T.dauR * 0.06},${-DAU * 0.28}
                  C${-T.dauR * 0.4},${-DAU * 0.2} ${-T.dauR * 0.86},${-DAU * 0.12} ${-T.dauR * 1.06},${DAU * 0.06} Z`}
              fill={M.toc}
              {...N}
              strokeWidth={NET}
            />
            <path
              d={`M${-T.dauR * 1.06},${DAU * 0.06}
                  C${-T.dauR * 1.12},${-T.dauCao * 1.3} ${-T.dauR * 0.2},${-T.dauCao * 1.34} ${-T.dauR * 0.24},${-DAU * 0.3}
                  C${-T.dauR * 0.5},${-DAU * 0.2} ${-T.dauR * 0.86},${-DAU * 0.12} ${-T.dauR * 1.06},${DAU * 0.06} Z`}
              fill={M.tocToi}
            />
            {/* lọn mái rời, đầu nhọn chĩa xuống */}
            {[
              [-0.74, -0.26, -0.42],
              [-0.3, -0.4, -0.02],
              [0.2, -0.38, 0.5],
              [0.62, -0.24, 0.88],
            ].map(([a, b, c], n) => (
              <path
                key={n}
                d={`M${T.dauR * a},${-T.dauCao * 0.92}
                    Q${T.dauR * ((a + c) / 2)},${DAU * b} ${T.dauR * c},${-T.dauCao * 0.5} Z`}
                fill={n % 2 ? M.tocToi : M.toc}
                {...N}
                strokeWidth={NET_MANH}
              />
            ))}
            {/* dải sáng cứng, không phải chuyển mượt */}
            <path
              d={`M${-T.dauR * 0.62},${-T.dauCao * 0.78} q${T.dauR * 0.66},${-DAU * 0.16} ${T.dauR * 1.3},${DAU * 0.02}
                  q${-T.dauR * 0.6},${-DAU * 0.03} ${-T.dauR * 1.24},${DAU * 0.14} Z`}
              fill={M.tocSang}
            />
            {/* cọng dựng */}
            <path
              d={`M${T.dauR * 0.2},${-T.dauCao * 1.0} q${DAU * 0.13},${-DAU * 0.22} ${DAU * 0.27},${-DAU * 0.13}
                  q${-DAU * 0.15},${DAU * 0.06} ${-DAU * 0.17},${DAU * 0.22} Z`}
              fill={M.toc}
              {...N}
              strokeWidth={NET_MANH}
            />
          </g>
        </g>
      </g>
    </g>
  );
};
