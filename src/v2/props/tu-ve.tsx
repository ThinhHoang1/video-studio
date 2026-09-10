import React from 'react';
import {MUC, NEN} from '../rig/hinh';
import type {HinhVe, PropTuVe} from '../board/kieu-board';
import {FONT} from '../../engine/font';
import type {PropProps} from './co-ban';

/**
 * Vẽ PROP TỰ VẼ từ dữ liệu (board.prop_tu_ve) — cho agent thêm prop mới mà không sửa mã.
 *
 * Cùng luật với prop thư viện: nét đen dày `net` không đổi theo scale, khối tô trắng
 * nền, chữ đen. Toạ độ cục bộ px ở co = 1, gốc = tâm đáy, y âm hướng lên.
 * Bảng màu cho 'to' bị khoá: chỉ nhận màu trong MAU_CHO_PHEP để giữ đúng phong cách.
 */
export const MAU_CHO_PHEP = new Set([
  '#f81000', '#c0392b', '#656565', '#a06860', '#b8d8f8', '#b03858',
  '#bfe8dc', '#f6c9d4', '#f7e7a9', '#bfe0f5', '#d9c8f0', '#e1e1e1', '#f8d3b0', '#cfe8b8',
  '#2e1310', '#906830', '#e9e8c6', '#5a3b1e', '#1c1a22',
]);

const MotHinh: React.FC<{h: HinhVe; net: number; co: number}> = ({h, net, co}) => {
  const S = {stroke: MUC, strokeWidth: net, vectorEffect: 'non-scaling-stroke' as const, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
  switch (h.loai) {
    case 'net':
      return <path d={h.d} fill="none" {...S} />;
    case 'khoi':
      return <path d={h.d} fill={NEN} {...S} />;
    case 'hop':
      return <rect x={h.x} y={h.y} width={h.w} height={h.h} rx={h.bo ?? 0} fill={NEN} {...S} />;
    case 'tron':
      return <circle cx={h.cx} cy={h.cy} r={h.r} fill={NEN} {...S} />;
    case 'bau':
      return <ellipse cx={h.cx} cy={h.cy} rx={h.rx} ry={h.ry} fill={NEN} {...S} />;
    case 'gach':
      return <line x1={h.x1} y1={h.y1} x2={h.x2} y2={h.y2} {...S} />;
    case 'chu':
      return (
        <text x={h.x} y={h.y} textAnchor="middle" fontFamily={FONT} fontSize={h.co ?? 40} fontWeight={h.dam === false ? 600 : 800} fill={MUC} style={{userSelect: 'none'}}>
          {h.text}
        </text>
      );
    case 'to':
      return <path d={h.d} fill={MAU_CHO_PHEP.has(h.mau.toLowerCase()) ? h.mau : NEN} {...S} />;
    default:
      return null;
  }
};

export const PropTuVeVe: React.FC<PropProps & {mau: PropTuVe; chu?: string}> = ({x, y, co, net, flip, mau, chu}) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -co : co} ${co})`}>
    {mau.hinh.map((h, i) => {
      // 'chu' có "{chu}" thì điền chữ từ board.prop[].chu; shot không truyền chu → ẨN dòng chữ đó (không in "{chu}")
      if (h.loai === 'chu' && h.text.includes('{chu}')) {
        if (!chu) return null;
        return <MotHinh key={i} h={{...h, text: h.text.replace('{chu}', chu)}} net={net} co={co} />;
      }
      return <MotHinh key={i} h={h} net={net} co={co} />;
    })}
  </g>
);

/** kiểm dữ liệu một prop tự vẽ — trả danh sách lỗi (rỗng = ổn). Dùng chung cho validator (qua bản .mjs sao chép luật). */
export const LOAI_HINH = ['net', 'khoi', 'hop', 'tron', 'bau', 'gach', 'chu', 'to'] as const;
