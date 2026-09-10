import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Dau, NhanVat} from '../rig/nhan-vat';
import {KIEU, Kieu, PhongCach, PHONG_CACH_MAC_DINH} from '../rig/kieu';
import {NEN, MUC} from '../rig/hinh';
import {FONT} from '../../engine/font';

/**
 * Bảng thử BẢN SẮC — 3 phương án phong cách (PhongCach) áp lên cả dàn KIEU để chọn hướng
 * thoát khỏi hình bóng storytime gốc. Hàng 0 = mặc định hiện tại để so.
 * Mỗi hàng: 9 nhân vật DAU 120 · 2 đầu cận DAU 300 (nói / sốc) · 1 đầu DAU 60 (kiểm đọc được).
 * Render: npx remotion still src/index.ts BanSacTest out/v2/ban-sac.png
 */
export const BAN_SAC_W = 2560;
export const BAN_SAC_H = 2140;

type PhuongAn = {
  ma: string;
  ten: string;
  moTa: string;
  /** phong cách cho từng nhân vật (theo thứ tự KIEU) */
  cua: (i: number, ten: string) => PhongCach;
};

const PASTEL_A = ['#bfe8dc', '#f6c9d4', '#f7e7a9', '#bfe0f5', '#d9c8f0', '#e1e1e1', '#f8d3b0', '#cfe8b8', '#ececec'];
const QUAN_B = ['#5a6478', '#3d4a6b', '#5a6478', '#3d4a6b', '#5a6478', '#3d4a6b', '#5a6478', '#3d4a6b', '#6b7280'];
const AO_C = ['#f4a261', '#e07a8c', '#2a9d8f', '#e9c46a', '#8ecae6', '#9b8bd9', '#90be6d', '#f28482', '#b5bcc6'];

const PHUONG_AN: PhuongAn[] = [
  {ma: '0', ten: 'Hiện tại (mặc định)', moTa: 'oval đen đặc · không mũi · không tai · áo trắng cổ V · 2.6 DAU', cua: () => PHONG_CACH_MAC_DINH},
  {
    ma: 'A',
    ten: 'Đậu',
    moTa: 'mắt hạt đậu nghiêng 12° có khe sáng · mũi gạch · tai · áo pastel mỗi người một màu · 2.6 DAU',
    cua: (i) => ({mat: 'hat-dau', mui: 'gach', tai: true, mauAo: PASTEL_A[i % PASTEL_A.length], coAo: 'v', tiLe: 'chuan'}),
  },
  {
    ma: 'B',
    ten: 'Tròn',
    moTa: 'mắt vòng viền + ngươi 60% · mũi chấm · không tai · áo trắng cổ sơ-mi · quần xám/xanh đậm · 3.0 DAU chân dài',
    cua: (i) => ({mat: 'tron-nguoi', mui: 'cham', tai: false, coAo: 'so-mi', mauQuan: QUAN_B[i % QUAN_B.length], tiLe: 'cao'}),
  },
  {
    ma: 'C',
    ten: 'Lệch',
    moTa: 'mắt lệch cỡ (1 : 0.8) · mũi móc · tai · áo màu đậm, quần trắng · 2.3 DAU đầu to',
    cua: (i) => ({mat: 'lech', mui: 'moc', tai: true, mauAo: AO_C[i % AO_C.length], coAo: 'tron', tiLe: 'lun'}),
  },
];

const Nhan: React.FC<{x: number; y: number; t: string; s?: number; anchor?: 'middle' | 'start'}> = ({x, y, t, s = 20, anchor = 'middle'}) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={FONT} fontSize={s} fill="#555">
    {t}
  </text>
);

const CAST = Object.keys(KIEU);
const DANG = ['dung', 'motTayHong', 'dung', 'chi', 'dung', 'tayHong', 'motTayHong', 'dung', 'dung'];
const HANG_CAO = 500;
const Y0 = 110;

export const BanSacTest: React.FC = () => (
  <AbsoluteFill style={{background: NEN}}>
    <svg width={BAN_SAC_W} height={BAN_SAC_H} viewBox={`0 0 ${BAN_SAC_W} ${BAN_SAC_H}`}>
      <text x={40} y={48} fontFamily={FONT} fontSize={30} fontWeight={700} fill={MUC}>
        Bản sắc nhân vật — 3 phương án PhongCach áp lên dàn KIEU (hàng 0 = hiện tại). Mỗi hàng: 9 người DAU 120 · cận DAU 300 nói / sốc · đầu DAU 60
      </text>
      <text x={40} y={80} fontFamily={FONT} fontSize={20} fill="#777">
        Nguyên tắc giữ nguyên: flat 2D, nét max(4.5px, 0.015·DAU), nền trắng, snap không tween, mouth chart lip-sync cũ. Chỉ đổi: hình mắt / mũi / tai / màu áo-quần / cổ áo / tỉ lệ.
      </text>
      {PHUONG_AN.map((pa, r) => {
        const yTop = Y0 + r * HANG_CAO;
        const yChan = yTop + 430;
        const ap = (i: number): Kieu => {
          const ten = CAST[i];
          return {...KIEU[ten], phongCach: pa.cua(i, ten)};
        };
        return (
          <g key={pa.ma}>
            <line x1={30} y1={yTop - 6} x2={BAN_SAC_W - 30} y2={yTop - 6} stroke="#d5d5d5" strokeWidth={1.5} />
            <text x={40} y={yTop + 26} fontFamily={FONT} fontSize={26} fontWeight={700} fill={MUC}>
              {pa.ma === '0' ? pa.ten : `Phương án ${pa.ma} — “${pa.ten}”`}
            </text>
            <text x={40} y={yTop + 54} fontFamily={FONT} fontSize={18} fill="#666">
              {pa.moTa}
            </text>
            {/* 9 nhân vật DAU 120 */}
            {CAST.map((ten, i) => {
              const x = 130 + i * 178;
              return (
                <g key={ten}>
                  <NhanVat kieu={ap(i)} dau={120} x={x} y={yChan} dang={DANG[i]} mieng={ten === 'trang' ? undefined : i % 3 === 0 ? 'cuoi-nhe' : i % 3 === 1 ? 'C' : 'mim'} id={`${pa.ma}c${i}`} />
                  <Nhan x={x} y={yChan + 28} t={ten} s={18} />
                </g>
              );
            })}
            {/* cận DAU 300: nam nói, hà sốc */}
            <Dau kieu={ap(0)} dau={300} cx={1880} cy={yTop + 250} mieng="C" mat="oval" nhin={0.2} id={`${pa.ma}big0`} />
            <Nhan x={1880} y={yChan + 28} t="nam · nói (C) DAU 300" s={18} />
            <Dau kieu={ap(1)} dau={300} cx={2250} cy={yTop + 250} mieng="hoang" mat="soc" id={`${pa.ma}big1`} />
            <Nhan x={2250} y={yChan + 28} t="hà · sốc DAU 300" s={18} />
            {/* đầu nhỏ DAU 60 */}
            <Dau kieu={ap(3)} dau={60} cx={2500} cy={yTop + 300} mieng="B" mat="oval" id={`${pa.ma}small`} />
            <Nhan x={2500} y={yChan + 28} t="mai · 60" s={16} />
          </g>
        );
      })}
    </svg>
  </AbsoluteFill>
);
