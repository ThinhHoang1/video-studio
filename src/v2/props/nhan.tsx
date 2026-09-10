import React from 'react';
import {FONT} from '../../engine/font';
import {MUC} from '../rig/hinh';
import {Gach, Goc, Hop, HopKhoi, Net, PropProps, Tron, daGiac} from './co-ban';

/**
 * Prop CÓ NHÃN CHỮ — kiểu Jaiden vẽ cái hộp rồi ghi chữ lên: một prop phủ được mọi
 * chủ đề nhờ trường `chu` (board.prop[].chu). Cỡ thiết kế (co = 1, DAU = 330):
 *   bang-hieu 600x640 · hop-nhan 400x300 · bieu-tuong 400x470 · to-giay 320x420 · man-hinh 600x560
 *
 * Chữ là <text> SVG (không foreignObject), fill đen, KHÔNG viền (Goc kế thừa stroke
 * đen xuống nên phải đặt stroke="none"), font Be Vietnam Pro 800.
 * Cỡ chữ tự thu theo độ dài: ≤6 ký tự 64px · ≤12 → 48px · còn lại 36px;
 * quá 14 ký tự thì cắt thành 2 dòng tại khoảng trắng gần giữa nhất.
 */

export const coChu = (s: string): number => (s.length <= 6 ? 64 : s.length <= 12 ? 48 : 36);

/** cắt chuỗi > 14 ký tự thành 2 dòng tại khoảng trắng gần giữa nhất (không có khoảng trắng → cắt đôi) */
export const tachDong = (s: string): string[] => {
  if (s.length <= 14) return [s];
  const tu = s.trim().split(/\s+/);
  if (tu.length < 2) {
    const n = Math.ceil(s.length / 2);
    return [s.slice(0, n), s.slice(n)];
  }
  let tot = 1;
  let lech = Infinity;
  for (let i = 1; i < tu.length; i++) {
    const d = Math.abs(tu.slice(0, i).join(' ').length - s.length / 2);
    if (d < lech) {
      lech = d;
      tot = i;
    }
  }
  return [tu.slice(0, tot).join(' '), tu.slice(tot).join(' ')];
};

/**
 * Chữ nhãn giữa (x, y): tự chọn cỡ theo độ dài, thu tiếp nếu dòng dài nhất vượt `rong`
 * (ước bề rộng ≈ 0.62 × cỡ × số ký tự). `nhan` nhân thêm cỡ (biểu tượng 1 ký tự cần chữ to).
 */
export const ChuNhan: React.FC<{chu: string; x: number; y: number; rong: number; nhan?: number; toiDa?: number}> = ({chu, x, y, rong, nhan = 1, toiDa}) => {
  const dong = tachDong(chu);
  let co = coChu(chu) * nhan;
  const daiNhat = Math.max(...dong.map((d) => d.length));
  const uocRong = 0.62 * co * daiNhat;
  if (uocRong > rong) co = (rong / (0.62 * daiNhat)) * 1;
  if (toiDa && co > toiDa) co = toiDa;
  const lh = co * 1.1;
  const y0 = y - ((dong.length - 1) * lh) / 2;
  return (
    <text x={x} y={y0} textAnchor="middle" dominantBaseline="central" fontFamily={FONT} fontSize={co} fontWeight={800} fill={MUC} stroke="none" style={{userSelect: 'none'}}>
      {dong.map((d, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : lh}>
          {d}
        </tspan>
      ))}
    </text>
  );
};

/** bảng hiệu đứng trên 2 chân: khung viền đôi, chữ giữa. Mặc định "???" */
const BangHieu: React.FC<PropProps> = ({chu = '???', ...p}) => (
  <Goc {...p}>
    {/* hai chân + thanh giằng */}
    <Hop x={-210} y={-320} w={22} h={320} />
    <Hop x={188} y={-320} w={22} h={320} />
    <Gach x1={-199} y1={-120} x2={199} y2={-120} />
    {/* bảng viền đôi */}
    <Hop x={-300} y={-640} w={600} h={320} rx={10} />
    <Hop x={-278} y={-618} w={556} h={276} rx={6} />
    <ChuNhan chu={chu} x={0} y={-480} rong={500} />
  </Goc>
);

/** thùng carton có băng keo, nhãn dán ghi chữ trên mặt trước. Mặc định "???" */
const HopNhan: React.FC<PropProps> = ({chu = '???', ...p}) => (
  <Goc {...p}>
    <HopKhoi x0={-200} x1={200} yTren={-300} yDuoi={0} sau={0.15} />
    {/* băng keo dọc mặt trước + mặt trên */}
    <Gach x1={-24} y1={-300} x2={-24} y2={0} />
    <Gach x1={24} y1={-300} x2={24} y2={0} />
    {/* nhãn dán */}
    <Hop x={-150} y={-236} w={300} h={150} rx={6} />
    <ChuNhan chu={chu} x={0} y={-161} rong={270} toiDa={56} />
  </Goc>
);

/** vòng tròn to có chữ ở giữa (biểu tượng: $, %, ?, !, VND) + 3 tia nhấn nhẹ. Mặc định "!" */
const BieuTuong: React.FC<PropProps> = ({chu = '!', ...p}) => (
  <Goc {...p}>
    {/* 3 tia */}
    <Gach x1={-190} y1={-380} x2={-230} y2={-430} />
    <Gach x1={0} y1={-440} x2={0} y2={-500} />
    <Gach x1={190} y1={-380} x2={230} y2={-430} />
    <Tron cx={0} cy={-200} r={200} />
    <ChuNhan chu={chu} x={0} y={-200} rong={320} nhan={chu.length <= 3 ? 3.2 : 1.4} />
  </Goc>
);

/** tờ giấy có góc gấp, tiêu đề chữ + 3 gạch dòng (hoá đơn, đơn xin việc, đề thi). Mặc định "???" */
const ToGiay: React.FC<PropProps> = ({chu = '???', ...p}) => (
  <Goc {...p}>
    <Net d="M -160 0 L -160 -420 L 110 -420 L 160 -370 L 160 0 Z" />
    <Net d="M 110 -420 L 110 -370 L 160 -370" to="none" />
    <ChuNhan chu={chu} x={-10} y={-330} rong={250} toiDa={40} />
    <Gach x1={-120} y1={-240} x2={120} y2={-240} />
    <Gach x1={-120} y1={-180} x2={60} y2={-180} />
    <Gach x1={-120} y1={-120} x2={100} y2={-120} />
  </Goc>
);

/** màn hình máy tính to trên chân đế, thanh tiêu đề 3 nút, chữ giữa (thông báo, tin nhắn). Mặc định "???" */
const ManHinh: React.FC<PropProps> = ({chu = '???', ...p}) => (
  <Goc {...p}>
    {/* chân đế */}
    <Hop x={-150} y={-24} w={300} h={24} rx={8} />
    <Net d={daGiac([-40, -24], [40, -24], [30, -150], [-30, -150])} />
    {/* thân màn hình + thanh tiêu đề */}
    <Hop x={-300} y={-560} w={600} h={410} rx={14} />
    <Hop x={-276} y={-536} w={552} h={362} />
    <Gach x1={-276} y1={-486} x2={276} y2={-486} />
    <Tron cx={-250} cy={-511} r={8} />
    <Tron cx={-222} cy={-511} r={8} />
    <Tron cx={-194} cy={-511} r={8} />
    <ChuNhan chu={chu} x={0} y={-330} rong={500} />
  </Goc>
);

export const NHAN: Record<'bang-hieu' | 'hop-nhan' | 'bieu-tuong' | 'to-giay' | 'man-hinh', React.FC<PropProps>> = {
  'bang-hieu': BangHieu,
  'hop-nhan': HopNhan,
  'bieu-tuong': BieuTuong,
  'to-giay': ToGiay,
  'man-hinh': ManHinh,
};
