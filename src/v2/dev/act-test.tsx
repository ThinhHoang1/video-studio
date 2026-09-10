import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {NhanVat} from '../rig/nhan-vat';
import {MUC, NEN} from '../rig/hinh';
import type {DienVien} from '../board/kieu-board';
import {FONT} from '../../engine/font';
import {sinhAct, trangThaiTai} from '../act/ap-dung';
import {layTuThe} from '../act/tu-the-may';
import {FPS, W, frameCua} from '../act/nhip';

/**
 * Bảng thử mẫu hành động V2 — 5 dải ngang, mỗi dải một mẫu chạy bằng NhanVat thật
 * (DAU 160) trên bề rộng khung phim 1920 để x tính bằng px/frame đúng như phim.
 * Chiều cao 5 × 570 để nhân vật 2.6 DAU (416 px) không chồng dải và không che nhãn.
 *
 * Render still: npx remotion still src/index.ts ActV2Test out/v2/act-f15.png --frame 15
 *
 * Dưới mỗi dải: thước frame 0..149 (12 px/frame), gạch đen = mốc act, gạch đỏ = frame hiện tại.
 */
export const ACT_TEST_W = W;
export const ACT_TEST_H = 2850;
export const ACT_TEST_DAI = 150;

const DAU = 160;
/** mỗi dải: băng nhãn 0..70, nhân vật (2.6 DAU + tóc + bay) tới 540, thước frame ở đáy */
const DAI_LANE = 570;
const CHAN = 540;
const THUOC_X0 = 60;
const THUOC_BUOC = 12;

const DAI: {ten: string; dv: DienVien}[] = [
  {ten: 'vao-chay {huong: trai} → x 0.5 · 36 px/frame, hình đổi mỗi 2 frame, tới nơi f30 vượt, f31 đứng', dv: {kieu: 'nam', x: 0.5, mau: 'vao-chay', mau_tham_so: {huong: 'trai'}}},
  {ten: 'giat-minh {tai: 14/30} · f14 soc + lùi 0.02 · f15..16 soc-lon · f17 về', dv: {kieu: 'ha', x: 0.5, mieng: 'cuoi-nhe', mau: 'giat-minh', mau_tham_so: {tai: 14 / 30}}},
  {ten: 'nga {tai: 1.0} · f30 laoVao · f31 nga giữ', dv: {kieu: 'long', x: 0.5, mieng: 'thang', mau: 'nga', mau_tham_so: {tai: 1}}},
  {ten: 'lac-dau {tai: 0.3} · nhin -0.6/+0.6 mỗi 5 frame × 3 · f39 về 0', dv: {kieu: 'mai', x: 0.5, dang: 'khoanhTay', mieng: 'mim', mau: 'lac-dau', mau_tham_so: {tai: 0.3}}},
  {ten: 'vao-lao {tai: 0.5, huong: trai} · f15 key laoVao chân ở mép x=0 · f16 vượt +0.015 · f17 đứng', dv: {kieu: 'nam-lon', x: 0.5, mieng: 'cuoi', mau: 'vao-lao', mau_tham_so: {tai: 0.5, huong: 'trai'}}},
];

const fmt = (v: number | undefined, n = 3) => (v === undefined ? '-' : v.toFixed(n));

export const ActV2Test: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const daiGiay = ACT_TEST_DAI / FPS;

  return (
    <AbsoluteFill style={{background: NEN}}>
      <svg width={ACT_TEST_W} height={ACT_TEST_H} viewBox={`0 0 ${ACT_TEST_W} ${ACT_TEST_H}`}>
        {DAI.map((d, i) => {
          const y0 = i * DAI_LANE;
          const act = sinhAct(d.dv, daiGiay);
          const s = trangThaiTai(act, d.dv, t);
          const x = (s.x ?? d.dv.x) * W;
          const y = y0 + CHAN;
          const sc = s.scale ?? 1;
          const xoay = s.xoay ?? 0;
          const bien = [sc !== 1 ? `translate(${x} ${y}) scale(${sc}) translate(${-x} ${-y})` : '', xoay ? `rotate(${xoay} ${x} ${y})` : ''].filter(Boolean).join(' ');
          const trangThai = `f${frame} · dang=${s.dang ?? 'dung'} x=${fmt(s.x)} nhin=${fmt(s.nhin, 1)} mat=${s.mat ?? '-'} mieng=${s.mieng ?? '-'} flip=${s.flip ? 1 : 0} hien=${s.hien === false ? 0 : 1}`;
          return (
            <g key={i}>
              {i > 0 && <line x1={0} y1={y0} x2={W} y2={y0} stroke="#d8d8d8" strokeWidth={2} />}
              {/* băng nhãn tách khỏi vùng vẽ */}
              <line x1={0} y1={y0 + 72} x2={W} y2={y0 + 72} stroke="#eeeeee" strokeWidth={1} />
              {/* mốc x đích của board */}
              <line x1={d.dv.x * W} y1={y0 + 80} x2={d.dv.x * W} y2={y + 14} stroke="#c8c8c8" strokeWidth={2} strokeDasharray="8 8" />
              {/* mép khung phim 1080p: 0 và W đã là mép; vẽ vạch đất */}
              <line x1={0} y1={y + 1} x2={W} y2={y + 1} stroke="#e4e4e4" strokeWidth={2} />
              <text x={24} y={y0 + 34} fontFamily={FONT} fontSize={24} fontWeight={700} fill={MUC}>
                {`${i + 1}. ${d.ten}`}
              </text>
              <text x={24} y={y0 + 62} fontFamily={FONT} fontSize={20} fill="#555">
                {trangThai}
              </text>
              {/* thước frame */}
              <line x1={THUOC_X0} y1={y0 + DAI_LANE - 16} x2={THUOC_X0 + ACT_TEST_DAI * THUOC_BUOC} y2={y0 + DAI_LANE - 16} stroke="#bbb" strokeWidth={1} />
              {Array.from({length: ACT_TEST_DAI / 10 + 1}, (_, k) => (
                <text key={k} x={THUOC_X0 + k * 10 * THUOC_BUOC} y={y0 + DAI_LANE - 4} fontFamily={FONT} fontSize={12} fill="#888" textAnchor="middle">
                  {k * 10}
                </text>
              ))}
              {act.map((a, k) => (
                <rect key={k} x={THUOC_X0 + frameCua(a.tai) * THUOC_BUOC - 1.5} y={y0 + DAI_LANE - 26} width={3} height={10} fill={MUC} />
              ))}
              <rect x={THUOC_X0 + frame * THUOC_BUOC - 2} y={y0 + DAI_LANE - 32} width={4} height={18} fill="#f81000" />
              {s.hien !== false && (
                <g transform={bien || undefined}>
                  <NhanVat
                    kieu={d.dv.kieu}
                    dau={DAU}
                    x={x}
                    y={y}
                    dang={layTuThe(s.dang)}
                    mat={s.mat}
                    may={s.may}
                    mieng={s.mieng}
                    nhin={s.nhin ?? 0}
                    flip={s.flip}
                    ma={s.ma}
                    moHoi={s.moHoi}
                    id={`act${i}`}
                  />
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
