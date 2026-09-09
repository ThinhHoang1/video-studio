import React from 'react';
import {interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {P, W, H, SAN} from './places';

const L = {stroke: P.line, strokeWidth: 5, strokeLinecap: 'round', strokeLinejoin: 'round'} as const;
const L3 = {...L, strokeWidth: 3.5} as const;

/**
 * Cảnh ẩn dụ.
 *
 * Khác với thư mục `places`: ở đó mỗi cảnh là một NƠI CHỐN, dùng để minh hoạ
 * nguyên văn — nói văn phòng thì hiện văn phòng. Cách đó an toàn nhưng là
 * phụ đề bằng hình, xem xong không đọng lại gì.
 *
 * Ở đây mỗi cảnh là một Ý. Người xem phải bắc một nhịp cầu nhỏ trong đầu mới
 * hiểu, và chính cái nhịp cầu đó làm họ nhớ.
 */

/** 200 lá đơn bay đi như máy bay giấy, đúng hai cái quay về. */
export const HaiTramLaDon: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = interpolate(frame, [0, durationInFrames], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill="#dfe8ef" />
      <rect x={0} y={0} width={W} height={SAN} fill="#e7eef4" />
      {/* đàn máy bay giấy bay ra xa rồi mất hút */}
      {new Array(64).fill(0).map((_, i) => {
        const tre = (i / 64) * 0.55;
        const p = Math.max(0, Math.min(1, (t - tre) / 0.45));
        const cao = 620 - random(`h${i}`) * 460;
        const x = 240 + p * (1900 + random(`x${i}`) * 300);
        const y = cao - p * p * 340 + Math.sin(p * 7 + i) * 26;
        const co = 1 - p * 0.72;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${-14 + p * 22}) scale(${co})`} opacity={1 - p * 0.85}>
            <path d="M0,0 L54,16 L0,32 L12,16 Z" fill="#fdfaf4" {...L3} />
          </g>
        );
      })}
      {/* hai lá quay ngược lại — trả lời duy nhất nhận được */}
      {[0, 1].map((i) => {
        const p = Math.max(0, Math.min(1, (t - 0.5 - i * 0.12) / 0.4));
        return (
          <g
            key={`ve${i}`}
            transform={`translate(${1780 - p * 1500} ${300 + i * 150 + Math.sin(p * 6) * 20}) rotate(${170}) scale(0.9)`}
            opacity={p > 0 ? 1 : 0}
          >
            <path d="M0,0 L54,16 L0,32 L12,16 Z" fill={i === 0 ? '#f2a0a0' : '#f0cd8a'} {...L3} />
          </g>
        );
      })}
      <rect x={0} y={SAN} width={W} height={H - SAN} fill="#c6d2dc" {...L} />
    </g>
  );
};

/** Hai cánh cửa khoá lẫn nhau: mỗi cửa cần chìa nằm sau cửa kia. */
export const VongLuanQuan: React.FC = () => {
  const frame = useCurrentFrame();
  const quay = frame * 0.5;
  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill="#2c2740" />
      {/* mũi tên tròn nối hai cửa */}
      <g transform={`rotate(${quay} 960 520)`} opacity={0.22}>
        <circle cx={960} cy={520} r={330} fill="none" stroke="#8f86b8" strokeWidth={26} strokeDasharray="60 40" />
      </g>
      {[
        {x: 600, nhan: 'KINH NGHIỆM', mau: '#5b7fd4'},
        {x: 1320, nhan: 'ĐI LÀM', mau: '#d47b5b'},
      ].map((c) => (
        <g key={c.nhan} transform={`translate(${c.x} 520)`}>
          <rect x={-150} y={-230} width={300} height={460} rx={12} fill={c.mau} {...L} />
          <rect x={-124} y={-204} width={248} height={330} rx={8} fill="none" stroke="#1d1930" strokeWidth={4} />
          <circle cx={104} cy={20} r={17} fill="#f0d089" {...L3} />
          {/* ổ khoá */}
          <rect x={-34} y={130} width={68} height={56} rx={8} fill="#e8dfc4" {...L3} />
          <path d="M-16,130 v-22 a16,16 0 0 1 32,0 v22" fill="none" stroke="#1d1930" strokeWidth={7} />
          <text
            x={0}
            y={-262}
            textAnchor="middle"
            fontSize={38}
            fontWeight={900}
            fill="#f0ecff"
            fontFamily="system-ui"
          >
            {c.nhan}
          </text>
        </g>
      ))}
      {/* chìa của cửa này nằm sau cửa kia */}
      <text x={960} y={880} textAnchor="middle" fontSize={34} fontWeight={700} fill="#a99fd0" fontFamily="system-ui">
        chìa của cửa này nằm sau cửa kia
      </text>
    </g>
  );
};

/** Con người bị thay bằng một dãy số: bóng người rỗng, bên trong là mã. */
export const ThanhMotDaySo: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = interpolate(frame, [0, durationInFrames * 0.7], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill="#eef1f5" />
      {/* bóng người, tô dần thành mã vạch */}
      <clipPath id="nguoi">
        <path d="M960,180 a92,96 0 1,1 -0.1,0 M868,300 q92,-44 184,0 l40,300 h-264 z M896,600 h56 l10,300 h-66 z M968,600 h56 l10,300 h-66 z" />
      </clipPath>
      <g clipPath="url(#nguoi)">
        <rect x={780} y={140} width={360} height={800} fill="#c3ccd6" />
        {new Array(34).fill(0).map((_, i) => (
          <rect
            key={i}
            x={790 + i * 10.4}
            y={140}
            width={4 + random(`b${i}`) * 5}
            height={800}
            fill="#2a3140"
            opacity={i / 34 < t ? 1 : 0}
          />
        ))}
      </g>
      <text
        x={960}
        y={990}
        textAnchor="middle"
        fontSize={62}
        fontWeight={900}
        fill="#2a3140"
        fontFamily="ui-monospace, monospace"
        letterSpacing={10}
        opacity={t}
      >
        NV-2847
      </text>
    </g>
  );
};

/** Tàng hình: bốn người đặc, một người chỉ còn đường viền. */
export const TangHinh: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const mo = interpolate(frame, [0, durationInFrames * 0.65], [1, 0.06], {extrapolateRight: 'clamp'});
  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill="#e4e9ee" />
      <rect x={0} y={620} width={W} height={26} fill="#b9c3cd" />
      {[0, 1, 2, 3, 4].map((i) => {
        const x = 320 + i * 330;
        const mat = i === 2;
        return (
          <g key={i} transform={`translate(${x} 620)`}>
            <circle cx={0} cy={-236} r={62} fill={mat ? 'none' : '#8d99a8'} {...L3} opacity={mat ? 1 : 1} fillOpacity={mat ? mo : 1} />
            <path
              d="M-84,-160 q84,-46 168,0 l22,180 h-212 z"
              fill={mat ? '#8d99a8' : '#7c8898'}
              fillOpacity={mat ? mo : 1}
              {...L3}
            />
          </g>
        );
      })}
      <rect x={0} y={SAN} width={W} height={H - SAN} fill="#ccd5dd" {...L} />
    </g>
  );
};

/** Lương là cục đá lạnh, tan hết trong hai ngày. */
export const LuongTanChay: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = interpolate(frame, [0, durationInFrames], [0, 1], {extrapolateRight: 'clamp'});
  const co = 1 - t * 0.86;
  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill="#dceaf2" />
      <rect x={0} y={SAN} width={W} height={H - SAN} fill="#b6c9d4" {...L} />
      {/* vũng nước loang ra bên dưới */}
      <ellipse cx={960} cy={SAN - 6} rx={120 + t * 420} ry={16 + t * 32} fill="#9dc4dc" opacity={0.85} />
      {/* cục đá hình tờ tiền, co lại */}
      <g transform={`translate(960 ${SAN - 40 - co * 190}) scale(${co})`}>
        <rect x={-230} y={-130} width={460} height={260} rx={16} fill="#a8dcf0" {...L} opacity={0.92} />
        <rect x={-196} y={-98} width={392} height={196} rx={10} fill="none" stroke="#5f93ad" strokeWidth={5} />
        <text x={0} y={26} textAnchor="middle" fontSize={78} fontWeight={900} fill="#40708a" fontFamily="system-ui">
          LƯƠNG
        </text>
      </g>
      {/* giọt rơi */}
      {new Array(7).fill(0).map((_, i) => {
        const p = ((frame * 0.035 + i * 0.18) % 1);
        return (
          <ellipse
            key={i}
            cx={860 + i * 34}
            cy={SAN - 190 * co + p * 180 * co}
            rx={7}
            ry={12}
            fill="#7fb4d0"
            opacity={(1 - p) * co}
          />
        );
      })}
    </g>
  );
};

/** Chia đôi màn hình: một tấm ảnh đẹp bên trái, 364 ô xám bên phải. */
export const MotNgayVaBaTramSauMuoiTu: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = interpolate(frame, [0, durationInFrames * 0.8], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill="#1d1b2c" />
      {/* bên trái: một ngày được đăng */}
      <g transform="translate(470 480)">
        <rect x={-260} y={-300} width={520} height={600} rx={16} fill="#f6f2e8" {...L} />
        <rect x={-224} y={-264} width={448} height={370} rx={8} fill="#7fc4e8" />
        <circle cx={-110} cy={-160} r={44} fill="#ffe08a" />
        <path d="M-224,106 L-70,-40 L40,70 L130,-10 L224,106 Z" fill="#6aa87a" />
        <rect x={-224} y={140} width={300} height={22} rx={6} fill="#ccc6b8" />
        <rect x={-224} y={186} width={210} height={18} rx={5} fill="#ddd8cc" />
        <text x={0} y={272} textAnchor="middle" fontSize={30} fontWeight={800} fill="#8a8478" fontFamily="system-ui">
          1 ngày được đăng
        </text>
      </g>
      {/* bên phải: 364 ngày không ai thấy */}
      <g transform="translate(1330 470)">
        {new Array(364).fill(0).map((_, i) => {
          const c = i % 26;
          const r = Math.floor(i / 26);
          return (
            <rect
              key={i}
              x={-330 + c * 25.6}
              y={-280 + r * 38}
              width={19}
              height={28}
              rx={3}
              fill="#3b3752"
              opacity={i / 364 < t ? 0.95 : 0}
            />
          );
        })}
        <text x={0} y={300} textAnchor="middle" fontSize={30} fontWeight={800} fill="#7a7496" fontFamily="system-ui">
          364 ngày không ai thấy
        </text>
      </g>
    </g>
  );
};

/** Nước thấm qua áo: mảng sẫm lan dần, không có mốc nào đánh dấu. */
export const NuocThamQuaAo: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = interpolate(frame, [0, durationInFrames], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill="#e9e3d4" />
      {/* mảnh vải căng giữa khung */}
      <g transform="translate(960 500)">
        <path d="M-380,-300 q380,-60 760,0 l-40,600 q-340,60 -680,0 Z" fill="#dfe6ee" {...L} />
        <clipPath id="vai">
          <path d="M-380,-300 q380,-60 760,0 l-40,600 q-340,60 -680,0 Z" />
        </clipPath>
        <g clipPath="url(#vai)">
          {/* nhiều vòng loang chồng nhau -> mép không đều, giống thấm thật */}
          {new Array(9).fill(0).map((_, i) => {
            const a = (i / 9) * Math.PI * 2;
            return (
              <circle
                key={i}
                cx={Math.cos(a) * 90}
                cy={200 + Math.sin(a) * 60}
                r={t * (340 + random(`r${i}`) * 130)}
                fill="#9fb4c9"
                opacity={0.55}
              />
            );
          })}
        </g>
      </g>
      <text
        x={960}
        y={950}
        textAnchor="middle"
        fontSize={34}
        fontWeight={700}
        fill="#8b8474"
        fontFamily="system-ui"
        opacity={interpolate(t, [0.55, 0.85], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
      >
        không có tiếng chuông nào báo
      </text>
    </g>
  );
};

/** Cái ví mỏng dần đặt cạnh nhau theo từng tháng — đồng hồ đếm ngược. */
export const ViQuaTungThang: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = interpolate(frame, [0, durationInFrames * 0.85], [0, 1], {extrapolateRight: 'clamp'});
  const thang = ['T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill="#f0e6d2" />
      <rect x={0} y={700} width={W} height={12} fill="#c9b894" />
      {thang.map((m, i) => {
        const day = 1 - i * 0.17;
        const hien = i / thang.length < t ? 1 : 0;
        return (
          <g key={m} transform={`translate(${300 + i * 260} 700)`} opacity={hien}>
            <rect
              x={-90}
              y={-40 - day * 130}
              width={180}
              height={40 + day * 130}
              rx={10}
              fill={day > 0.4 ? '#6fae7d' : '#a9a396'}
              {...L}
            />
            <rect x={-90} y={-40 - day * 130} width={60} height={40 + day * 130} rx={10} fill={day > 0.4 ? '#4f8a5c' : '#8b8578'} />
            <text x={0} y={64} textAnchor="middle" fontSize={34} fontWeight={800} fill="#6b6152" fontFamily="system-ui">
              {m}
            </text>
          </g>
        );
      })}
    </g>
  );
};

export const AN_DU: Record<string, React.FC> = {
  'hai-tram-la-don': HaiTramLaDon,
  'vong-luan-quan': VongLuanQuan,
  'thanh-mot-day-so': ThanhMotDaySo,
  'tang-hinh': TangHinh,
  'luong-tan-chay': LuongTanChay,
  'mot-ngay-364': MotNgayVaBaTramSauMuoiTu,
  'nuoc-tham-qua-ao': NuocThamQuaAo,
  'vi-qua-tung-thang': ViQuaTungThang,
};
