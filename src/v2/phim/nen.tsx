import React from 'react';
import type {NenPhuc} from '../board/kieu-board';
import {NEN} from '../rig/hinh';

/**
 * LỚP NỀN của shot — mảng màu phía sau nhân vật và prop.
 *
 * Vì sao có (docs/nghien-cuu-tuna.md): kênh tham chiếu đổi khung hình mỗi ~0.8 giây
 * mà không ai thấy vụn, vì mỗi khung là một NỀN khác hẳn — ảnh thật, meme, nền màu,
 * thẻ chữ. Repo này nền trắng trơn nên cắt nhanh thì trống rỗng, cắt chậm thì đứng
 * hình. Nền màu là cách rẻ nhất để có cùng hiệu quả mà không cần kho ảnh có bản quyền.
 *
 * Luật giữ đúng chất: nền KHÔNG có nét đen, không có chi tiết vẽ. Nét đen chỉ thuộc
 * về nhân vật, prop và chữ — nếu nền cũng có nét thì khung trở thành tranh minh hoạ
 * đặc kín và mất hẳn phong cách.
 */
export const LopNen: React.FC<{nen?: 'trang' | string | NenPhuc; W: number; H: number; id: string}> = ({nen, W, H, id}) => {
  if (!nen || nen === 'trang') return <rect x={0} y={0} width={W} height={H} fill={NEN} />;

  if (typeof nen === 'string') return <rect x={0} y={0} width={W} height={H} fill={nen} />;

  if ('tren' in nen) {
    return (
      <>
        <defs>
          <linearGradient id={`g-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={nen.tren} />
            <stop offset="100%" stopColor={nen.duoi} />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={W} height={H} fill={`url(#g-${id})`} />
      </>
    );
  }

  const {mau, hoa_tiet} = nen;
  const sang = 'rgba(255,255,255,0.16)';
  return (
    <>
      <rect x={0} y={0} width={W} height={H} fill={mau} />
      {hoa_tiet === 'toa' && (
        // tia toả từ tâm — dùng cho khoảnh khắc "aha", khoe khoang, cú sốc vui
        <g>
          {Array.from({length: 24}, (_, i) => {
            const a = (i * Math.PI * 2) / 24;
            const r = W;
            return <path key={i} d={`M ${W / 2} ${H / 2} L ${W / 2 + Math.cos(a - 0.06) * r} ${H / 2 + Math.sin(a - 0.06) * r} L ${W / 2 + Math.cos(a + 0.06) * r} ${H / 2 + Math.sin(a + 0.06) * r} Z`} fill={i % 2 ? sang : 'none'} />;
          })}
        </g>
      )}
      {hoa_tiet === 'cheo' && (
        <g>
          {Array.from({length: 40}, (_, i) => (
            <rect key={i} x={-H + i * 96} y={-H} width={40} height={H * 3} fill={sang} transform={`rotate(20 ${W / 2} ${H / 2})`} />
          ))}
        </g>
      )}
      {hoa_tiet === 'cham' && (
        <g>
          {Array.from({length: 11 * 7}, (_, i) => (
            <circle key={i} cx={((i % 11) + 0.5) * (W / 11)} cy={(Math.floor(i / 11) + 0.5) * (H / 7)} r={W * 0.014} fill={sang} />
          ))}
        </g>
      )}
      {hoa_tiet === 'song' && (
        <g>
          {Array.from({length: 9}, (_, i) => {
            const y = ((i + 0.5) * H) / 9;
            let d = `M 0 ${y}`;
            for (let x = 0; x < W; x += W / 12) d += ` q ${W / 24} -22 ${W / 12} 0`;
            return <path key={i} d={d} fill="none" stroke={sang} strokeWidth={10} />;
          })}
        </g>
      )}
    </>
  );
};
