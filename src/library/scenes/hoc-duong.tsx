import React from 'react';
import {interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {P, W, H, SAN} from './places';

const L = {stroke: P.line, strokeWidth: 5, strokeLinecap: 'round', strokeLinejoin: 'round'} as const;
const L3 = {...L, strokeWidth: 3.5} as const;

/**
 * Bối cảnh học đường.
 *
 * Nguyên tắc lấy từ kênh tham chiếu: mỗi cảnh phải có 20-30 vật thể. Nền
 * thưa là thứ khiến khung hình trông như slide chứ không như một nơi chốn.
 */

/** Lớp học: bảng đen, dãy bàn, quạt trần, cửa sổ có nắng. */
export const LopHoc: React.FC = () => {
  const frame = useCurrentFrame();
  const quat = frame * 9;
  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill="#dfe6d8" />
      <rect x={0} y={0} width={W} height={SAN} fill="#e6ecdd" />
      {/* tường dưới sơn xanh */}
      <rect x={0} y={560} width={W} height={SAN - 560} fill="#a8bfa0" />
      <rect x={0} y={556} width={W} height={8} fill="#8fa887" />
      {/* bảng đen */}
      <rect x={520} y={130} width={900} height={380} rx={8} fill="#2f4136" {...L} />
      <rect x={520} y={130} width={900} height={380} rx={8} fill="none" stroke="#8a6a3a" strokeWidth={14} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={580 + i * 30} y={200 + i * 70} width={300 - i * 60} height={7} rx={3} fill="#7d9a86" opacity={0.7} />
      ))}
      {/* khay phấn */}
      <rect x={560} y={512} width={820} height={16} rx={4} fill="#8a6a3a" {...L3} />
      {/* cửa sổ hai bên, nắng hắt */}
      {[120, 1560].map((x) => (
        <g key={x}>
          <rect x={x} y={170} width={240} height={300} rx={6} fill="#bfe0f2" {...L} />
          <line x1={x + 120} y1={170} x2={x + 120} y2={470} {...L3} />
          <line x1={x} y1={320} x2={x + 240} y2={320} {...L3} />
        </g>
      ))}
      <path d="M120,470 L360,470 L520,880 L60,880 Z" fill="#fff8d8" opacity={0.32} />
      {/* quạt trần */}
      <g transform={`translate(960 90)`}>
        <rect x={-5} y={-90} width={10} height={70} fill="#7d8a92" />
        {[0, 120, 240].map((a) => (
          <ellipse key={a} cx={0} cy={0} rx={130} ry={16} fill="#9aa8b0" opacity={0.75} transform={`rotate(${a + quat})`} />
        ))}
        <circle cx={0} cy={0} r={20} fill="#7d8a92" {...L3} />
      </g>
      {/* dãy bàn học */}
      {[0, 1, 2].map((r) =>
        [0, 1, 2, 3].map((c) => (
          <g key={`${r}${c}`} transform={`translate(${300 + c * 440} ${640 + r * 96}) scale(${1 - r * 0.1})`}>
            <rect x={-140} y={-18} width={280} height={20} rx={5} fill="#c9a06a" {...L3} />
            <rect x={-120} y={2} width={14} height={78} fill="#8a6a3a" />
            <rect x={106} y={2} width={14} height={78} fill="#8a6a3a" />
          </g>
        ))
      )}
      <rect x={0} y={SAN} width={W} height={H - SAN} fill="#c2b294" {...L} />
    </g>
  );
};

/** Sân trường: cột cờ, hàng phượng, dãy lớp phía sau. */
export const SanTruong: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <g>
      <defs>
        <linearGradient id="g-san" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a8d8f0" />
          <stop offset="70%" stopColor="#d9ecf5" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill="url(#g-san)" />
      {/* mây trôi rất chậm */}
      {[0, 1, 2].map((i) => (
        <ellipse
          key={i}
          cx={((frame * (0.2 + i * 0.1) + i * 700) % (W + 400)) - 200}
          cy={120 + i * 70}
          rx={160 + i * 40}
          ry={40}
          fill="#fff"
          opacity={0.72}
        />
      ))}
      {/* dãy lớp học hai tầng */}
      <rect x={60} y={330} width={1800} height={330} fill="#f0e2c4" {...L} />
      <rect x={60} y={330} width={1800} height={40} fill="#c9a86a" />
      <rect x={60} y={490} width={1800} height={12} fill="#d4c09a" />
      {new Array(9).fill(0).map((_, i) => (
        <g key={i}>
          <rect x={130 + i * 195} y={392} width={110} height={86} rx={4} fill="#8fb8cc" {...L3} />
          <rect x={130 + i * 195} y={528} width={110} height={110} rx={4} fill="#8fb8cc" {...L3} />
        </g>
      ))}
      {/* hàng phượng */}
      {[280, 900, 1620].map((x, i) => (
        <g key={x}>
          <rect x={x - 16} y={620} width={32} height={260} fill="#6b4f34" {...L3} />
          <circle cx={x} cy={600} r={130 - i * 12} fill="#4f8a4a" {...L3} />
          <circle cx={x - 70} cy={640} r={80} fill="#5c9a55" {...L3} />
          <circle cx={x + 74} cy={646} r={72} fill="#447a42" {...L3} />
          {/* hoa phượng đỏ rải rác */}
          {new Array(9).fill(0).map((_, k) => (
            <circle key={k} cx={x - 100 + random(`f${i}${k}`) * 200} cy={540 + random(`g${i}${k}`) * 150} r={9} fill="#d94f4f" />
          ))}
        </g>
      ))}
      {/* cột cờ */}
      <rect x={1180} y={280} width={12} height={600} fill="#c0c6cc" {...L3} />
      <path d="M1192,296 L1330,326 L1192,356 Z" fill="#d43a3a" {...L3} />
      {/* sân bê tông có vạch */}
      <rect x={0} y={SAN} width={W} height={H - SAN} fill="#cfcdc4" {...L} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line key={i} x1={i * 330} y1={SAN} x2={i * 330 - 60} y2={H} stroke="#b8b6ad" strokeWidth={4} />
      ))}
    </g>
  );
};

/** Ghế đá dưới gốc cây — chỗ ngồi nói chuyện. */
export const GheDa: React.FC = () => (
  <g>
    <defs>
      <linearGradient id="g-ghe" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#bde0f0" />
        <stop offset="100%" stopColor="#e6f0dc" />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={W} height={H} fill="url(#g-ghe)" />
    {/* tán cây phủ trên đầu */}
    <circle cx={520} cy={120} r={300} fill="#4f8a4a" />
    <circle cx={300} cy={220} r={190} fill="#5c9a55" />
    <circle cx={760} cy={190} r={210} fill="#447a42" />
    <rect x={480} y={330} width={54} height={550} fill="#6b4f34" {...L} />
    {/* bụi cỏ */}
    {new Array(16).fill(0).map((_, i) => (
      <path
        key={i}
        d={`M${100 + i * 120},${SAN + 10} q10,-40 22,-4`}
        stroke="#5c9a55"
        strokeWidth={7}
        fill="none"
        strokeLinecap="round"
      />
    ))}
    {/* ghế đá */}
    <g transform="translate(1180 760)">
      <rect x={-300} y={-30} width={600} height={34} rx={8} fill="#d4d0c6" {...L} />
      <rect x={-300} y={-30} width={600} height={12} fill="#e6e2d8" />
      <rect x={-250} y={4} width={40} height={110} fill="#c2beb4" {...L3} />
      <rect x={210} y={4} width={40} height={110} fill="#c2beb4" {...L3} />
      <rect x={-300} y={-104} width={600} height={26} rx={6} fill="#d4d0c6" {...L3} />
    </g>
    <rect x={0} y={SAN} width={W} height={H - SAN} fill="#a8bf8c" {...L} />
  </g>
);

/** Đường về nhà, hoàng hôn — cảnh đi cạnh nhau. */
export const DuongVe: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <g>
      <defs>
        <linearGradient id="g-hh" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5b968" />
          <stop offset="45%" stopColor="#f0876a" />
          <stop offset="100%" stopColor="#9a6a8a" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={W} height={H} fill="url(#g-hh)" />
      <circle cx={1420} cy={520} r={140} fill="#ffe0a0" opacity={0.9} />
      {/* dãy nhà thấp phía xa */}
      {new Array(11).fill(0).map((_, i) => (
        <rect
          key={i}
          x={i * 190 - 40}
          y={470 + random(`n${i}`) * 90}
          width={170}
          height={330}
          fill="#7a5a78"
          opacity={0.85}
        />
      ))}
      {/* cột điện + dây */}
      {[240, 960, 1680].map((x) => (
        <g key={x}>
          <rect x={x - 8} y={330} width={16} height={520} fill="#5a4560" />
          <rect x={x - 60} y={360} width={120} height={10} fill="#5a4560" />
        </g>
      ))}
      <path d="M240,372 Q600,430 960,372 Q1320,430 1680,372" fill="none" stroke="#4a3850" strokeWidth={5} />
      <path d="M240,392 Q600,456 960,392 Q1320,456 1680,392" fill="none" stroke="#4a3850" strokeWidth={4} />
      {/* chim bay */}
      {[0, 1, 2, 3].map((i) => {
        const x = ((frame * 0.9 + i * 180) % (W + 200)) - 100;
        return (
          <path
            key={i}
            d={`M${x},${220 + i * 26} q12,-10 24,0 q12,-10 24,0`}
            fill="none"
            stroke="#5a4560"
            strokeWidth={4}
            strokeLinecap="round"
          />
        );
      })}
      {/* đường nhựa */}
      <rect x={0} y={SAN} width={W} height={H - SAN} fill="#6a5468" {...L} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={i * 420 + 60} y={SAN + 90} width={200} height={12} rx={6} fill="#c9b8a8" opacity={0.8} />
      ))}
    </g>
  );
};

/** Quán trà sữa. */
export const QuanTraSua: React.FC = () => (
  <g>
    <rect x={0} y={0} width={W} height={H} fill="#f7ecdc" />
    <rect x={0} y={0} width={W} height={SAN} fill="#f2e2cc" />
    {/* kệ ly + đèn thả */}
    <rect x={80} y={200} width={640} height={16} fill="#c9a06a" {...L3} />
    {new Array(7).fill(0).map((_, i) => (
      <g key={i} transform={`translate(${130 + i * 92} 200)`}>
        <path d="M-22,-70 L22,-70 L16,0 L-16,0 Z" fill="#e8d4b8" {...L3} />
      </g>
    ))}
    {[420, 700, 980].map((x) => (
      <g key={x}>
        <line x1={x} y1={0} x2={x} y2={130} stroke="#8a7a62" strokeWidth={4} />
        <path d={`M${x - 46},130 L${x + 46},130 L${x + 28},186 L${x - 28},186 Z`} fill="#e8b25a" {...L3} />
      </g>
    ))}
    {/* bàn tròn hai ly trà sữa */}
    <g transform="translate(1240 700)">
      <ellipse cx={0} cy={-30} rx={230} ry={54} fill="#d9b98c" {...L} />
      <rect x={-16} y={24} width={32} height={156} fill="#a8845c" {...L3} />
      <ellipse cx={0} cy={182} rx={100} ry={22} fill="#a8845c" {...L3} />
      {[-70, 70].map((dx) => (
        <g key={dx} transform={`translate(${dx} -70)`}>
          <path d="M-30,-70 L30,-70 L22,20 L-22,20 Z" fill="#e8dcc8" {...L3} />
          <path d="M-24,-14 L24,-14 L20,18 L-20,18 Z" fill="#c9a882" />
          {[0, 1, 2, 3].map((k) => (
            <circle key={k} cx={-12 + k * 8} cy={8 + (k % 2) * 6} r={5} fill="#4a3428" />
          ))}
          <rect x={-5} y={-104} width={10} height={44} fill="#d46a8a" />
        </g>
      ))}
    </g>
    <rect x={0} y={SAN} width={W} height={H - SAN} fill="#c9a882" {...L} />
  </g>
);

/** Mưa ngoài hiên — cảnh chờ, cảnh chia tay. */
export const MuaHien: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill="#8fa0ad" />
      <rect x={0} y={0} width={W} height={SAN} fill="#a3b3bf" />
      {/* mái hiên đổ bóng */}
      <rect x={-40} y={90} width={W + 80} height={40} fill="#6b5a52" {...L} />
      <rect x={120} y={130} width={22} height={750} fill="#7a685e" {...L3} />
      <rect x={1780} y={130} width={22} height={750} fill="#7a685e" {...L3} />
      {/* dãy lớp mờ sau màn mưa */}
      <rect x={200} y={330} width={1520} height={330} fill="#8b98a2" opacity={0.75} />
      {new Array(7).fill(0).map((_, i) => (
        <rect key={i} x={280 + i * 210} y={400} width={120} height={150} fill="#7b8894" />
      ))}
      {/* mưa: các vạch chéo rơi */}
      {new Array(90).fill(0).map((_, i) => {
        const t = ((frame * 26 + random(`r${i}`) * 900) % 900);
        const x = random(`x${i}`) * (W + 200) - 100;
        return <line key={i} x1={x} y1={t} x2={x - 22} y2={t + 60} stroke="#e0eaf0" strokeWidth={3} opacity={0.55} />;
      })}
      {/* nước đọng dưới hiên */}
      <rect x={0} y={SAN} width={W} height={H - SAN} fill="#5f6f7a" {...L} />
      {[0, 1, 2, 3].map((i) => (
        <ellipse key={i} cx={300 + i * 470} cy={SAN + 90} rx={130} ry={18} fill="#8fa8b8" opacity={0.6} />
      ))}
    </g>
  );
};

/** Cổng trường ngày chia tay — có băng rôn. */
export const CongTruong: React.FC = () => (
  <g>
    <defs>
      <linearGradient id="g-cong" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#9fd4ee" />
        <stop offset="100%" stopColor="#e2eff6" />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={W} height={H} fill="url(#g-cong)" />
    {/* hai trụ cổng */}
    {[260, 1660].map((x) => (
      <g key={x}>
        <rect x={x - 70} y={240} width={140} height={640} fill="#e0d2b4" {...L} />
        <rect x={x - 86} y={210} width={172} height={44} rx={6} fill="#c9b894" {...L} />
      </g>
    ))}
    {/* thanh ngang + băng rôn */}
    <rect x={190} y={250} width={1540} height={34} fill="#c9b894" {...L} />
    <rect x={420} y={290} width={1080} height={110} rx={6} fill="#c0392b" {...L} />
    <rect x={460} y={324} width={1000} height={42} rx={4} fill="none" stroke="#f0d89a" strokeWidth={5} />
    {/* hàng rào sắt */}
    {new Array(16).fill(0).map((_, i) => (
      <rect key={i} x={340 + i * 82} y={480} width={12} height={400} fill="#5f6f7a" opacity={0.9} />
    ))}
    <rect x={330} y={520} width={1300} height={10} fill="#5f6f7a" />
    {/* cây hai bên */}
    {[120, 1820].map((x, i) => (
      <g key={x}>
        <rect x={x - 14} y={620} width={28} height={260} fill="#6b4f34" {...L3} />
        <circle cx={x} cy={600} r={120} fill={i ? '#4f8a4a' : '#5c9a55'} {...L3} />
      </g>
    ))}
    <rect x={0} y={SAN} width={W} height={H - SAN} fill="#cfcdc4" {...L} />
  </g>
);

/** Phòng ngủ tuổi học trò, ban đêm — bàn học, đèn, cửa sổ trăng. */
export const PhongHocSinh: React.FC = () => {
  const frame = useCurrentFrame();
  const den = 0.88 + Math.sin(frame / 24) * 0.05;
  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill="#2b2a44" />
      <rect x={0} y={0} width={W} height={SAN} fill="#33314e" />
      {/* cửa sổ có trăng */}
      <rect x={1320} y={150} width={420} height={340} rx={8} fill="#1a1c34" {...L} />
      <circle cx={1600} cy={250} r={54} fill="#f0ecd0" />
      <line x1={1530} y1={150} x2={1530} y2={490} {...L3} />
      <line x1={1320} y1={320} x2={1740} y2={320} {...L3} />
      {/* đèn bàn */}
      <g opacity={den}>
        <path d="M300,640 L620,640 L520,300 L400,300 Z" fill="#f0d89a" opacity={0.24} />
        <path d="M390,296 L530,296 L500,250 L420,250 Z" fill="#c9a24a" {...L3} />
        <rect x={452} y={296} width={14} height={344} fill="#8a7440" />
      </g>
      {/* bàn học + sách vở */}
      <rect x={260} y={640} width={700} height={24} rx={6} fill="#a8845c" {...L} />
      <rect x={290} y={664} width={20} height={216} fill="#7d6142" />
      <rect x={910} y={664} width={20} height={216} fill="#7d6142" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={640 + (i % 2) * 12} y={616 - i * 18} width={190} height={18} rx={3} fill={['#c0392b', '#2f6f9a', '#4f8a4a'][i]} {...L3} />
      ))}
      {/* tường dán ảnh */}
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={200 + i * 150}
          y={190 + (i % 2) * 60}
          width={110}
          height={90}
          rx={4}
          fill="#4a4870"
          stroke="#6d6a96"
          strokeWidth={3}
          transform={`rotate(${i % 2 ? 4 : -4} ${255 + i * 150} ${235 + (i % 2) * 60})`}
        />
      ))}
      <rect x={0} y={SAN} width={W} height={H - SAN} fill="#413e60" {...L} />
    </g>
  );
};

export const HOC_DUONG: Record<string, React.FC> = {
  'lop-hoc': LopHoc,
  'san-truong': SanTruong,
  'ghe-da': GheDa,
  'duong-ve': DuongVe,
  'quan-tra-sua': QuanTraSua,
  'mua-hien': MuaHien,
  'cong-truong': CongTruong,
  'phong-hoc-sinh': PhongHocSinh,
};
