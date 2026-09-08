import React from 'react';
import {random, useCurrentFrame} from 'remotion';
import {P, W, H, SAN} from './places';
import {DamDong} from './chieu-sau';

const L = {stroke: P.line, strokeWidth: 5, strokeLinecap: 'round', strokeLinejoin: 'round'} as const;
const L3 = {...L, strokeWidth: 3.5} as const;

/** Sảnh toà nhà văn phòng — nơi đứng ngoài không dám lên. */
export const Sanh: React.FC = () => (
  <g>
    <rect x={0} y={0} width={W} height={H} fill="#cfd9e2" />
    {/* mặt kính cao tầng */}
    <rect x={120} y={40} width={1680} height={640} fill="#9dc0d8" {...L} />
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <rect key={i} x={160 + i * 278} y={80} width={230} height={560} fill="#b6d4e6" {...L3} />
    ))}
    {/* cửa xoay */}
    <rect x={760} y={420} width={400} height={460} fill="#7f96a8" {...L} />
    <line x1={960} y1={420} x2={960} y2={880} {...L} />
    <path d="M960,650 L790,560" {...L3} />
    <path d="M960,650 L1130,560" {...L3} />
    {/* bậc thềm */}
    <rect x={0} y={SAN} width={W} height={H - SAN} fill="#9aa5ae" {...L} />
    <rect x={640} y={SAN - 26} width={640} height={26} fill="#adb8c1" {...L3} />
    {/* người ra vào — bóng, không nét mặt */}
    <DamDong n={7} y={SAN - 96} tuX={140} denX={1780} s={0.52} mau="#8fa0b2" />
  </g>
);

/** Cận màn hình đang soạn email. */
export const ManHinhEmail: React.FC<{noiDung?: string}> = ({noiDung = 'Kính gửi anh,'}) => {
  const frame = useCurrentFrame();
  const nhayCon = frame % 30 < 15;
  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill="#2b3340" />
      {/* khung cửa sổ mail */}
      <rect x={230} y={150} width={1460} height={800} rx={14} fill="#fdfaf4" {...L} />
      <rect x={230} y={150} width={1460} height={70} rx={14} fill="#dfe6ee" {...L} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={280 + i * 40} cy={185} r={12} fill={['#e8635a', '#e8b25a', '#68b96a'][i]} />
      ))}
      {/* các dòng meta */}
      {['Tới:', 'Chủ đề:'].map((t, i) => (
        <g key={t}>
          <text x={280} y={296 + i * 62} fontSize={30} fontWeight={700} fill="#8b93a0" fontFamily="system-ui">
            {t}
          </text>
          <line x1={400} y1={286 + i * 62} x2={1600} y2={286 + i * 62} stroke="#dfe4ea" strokeWidth={3} />
        </g>
      ))}
      {/* thân thư + con trỏ nhấp nháy */}
      <text x={280} y={470} fontSize={44} fontWeight={600} fill={P.line} fontFamily="system-ui">
        {noiDung}
      </text>
      {nhayCon ? <rect x={282 + noiDung.length * 22} y={436} width={4} height={46} fill={P.line} /> : null}
      {/* chỗ đính kèm — trống trơn, đó chính là cái gag */}
      <rect x={280} y={800} width={420} height={80} rx={10} fill="none" stroke="#c9d0d8" strokeWidth={4} strokeDasharray="12 10" />
      <text x={490} y={850} textAnchor="middle" fontSize={28} fontWeight={700} fill="#aab2bc" fontFamily="system-ui">
        (chưa đính kèm)
      </text>
      <rect x={1400} y={800} width={220} height={80} rx={10} fill="#4a72d6" {...L3} />
      <text x={1510} y={852} textAnchor="middle" fontSize={34} fontWeight={800} fill="#fff" fontFamily="system-ui">
        Gửi
      </text>
    </g>
  );
};

/** Phòng họp: bàn dài, một dãy người ngồi im. */
export const PhongHop: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill="#dfe5ea" />
      {/* màn chiếu */}
      <rect x={620} y={90} width={680} height={380} fill="#f4f7fa" {...L} />
      <rect x={660} y={140} width={480} height={26} fill="#c6d0da" />
      <rect x={660} y={200} width={600} height={18} fill="#dbe2e9" />
      <rect x={660} y={240} width={380} height={18} fill="#dbe2e9" />
      {/* dãy người ngồi — chỉ là bóng, không ai làm gì */}
      {new Array(6).fill(0).map((_, i) => {
        const nhun = Math.sin(frame / 40 + i) * 2;
        return (
          <g key={i} transform={`translate(${190 + i * 300} ${640 + nhun})`}>
            <ellipse cx={0} cy={-96} rx={44} ry={48} fill="#8c98a6" {...L3} />
            <path d="M-62,-48 q62,-34 124,0 l14,110 h-152 z" fill="#7a8794" {...L3} />
          </g>
        );
      })}
      {/* bàn dài */}
      <DamDong n={5} y={606} tuX={220} denX={1700} s={0.44} mau="#b3bdc8" dong={false} />
      <rect x={60} y={700} width={1800} height={38} rx={10} fill="#a8845c" {...L} />
      <rect x={0} y={SAN} width={W} height={H - SAN} fill="#b9c4cc" {...L} />
    </g>
  );
};

/** Cận điện thoại: tin nhắn ngân hàng. */
export const DienThoaiLuong: React.FC<{soTien?: string}> = ({soTien = '+7.850.000đ'}) => (
  <g>
    <rect x={0} y={0} width={W} height={H} fill="#241f34" />
    <rect x={660} y={90} width={600} height={900} rx={54} fill="#141220" {...L} />
    <rect x={690} y={150} width={540} height={780} rx={20} fill="#f2f5f8" />
    <rect x={880} y={112} width={160} height={22} rx={11} fill="#3a3550" />
    {/* thẻ thông báo */}
    <rect x={720} y={280} width={480} height={230} rx={18} fill="#fff" {...L3} />
    <circle cx={772} cy={332} r={24} fill="#3f9c66" />
    <text x={812} y={342} fontSize={26} fontWeight={800} fill="#8b93a0" fontFamily="system-ui">
      Ngân hàng
    </text>
    <text x={744} y={424} fontSize={58} fontWeight={900} fill="#2e8b57" fontFamily="system-ui">
      {soTien}
    </text>
    <text x={744} y={472} fontSize={26} fontWeight={600} fill="#8b93a0" fontFamily="system-ui">
      LUONG THANG 07
    </text>
  </g>
);

/** Phòng trọ ban đêm — dùng cho cảnh gọi điện về nhà. */
export const PhongTroDem: React.FC = () => {
  const frame = useCurrentFrame();
  const nhapNhay = 0.85 + Math.sin(frame / 22) * 0.06;
  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill="#26243c" />
      <rect x={0} y={0} width={W} height={SAN} fill="#2c2a45" />
      {/* cửa sổ đêm có đèn thành phố */}
      <rect x={1280} y={160} width={420} height={340} rx={8} fill="#161a2e" {...L} />
      {new Array(26).fill(0).map((_, i) => (
        <rect
          key={i}
          x={1300 + (i % 7) * 56}
          y={190 + Math.floor(i / 7) * 76}
          width={26}
          height={38}
          fill="#e8c96a"
          opacity={0.25 + random(`d${i}`) * 0.6}
        />
      ))}
      <line x1={1490} y1={160} x2={1490} y2={500} {...L} />
      {/* đèn bàn — nguồn sáng duy nhất */}
      <g opacity={nhapNhay}>
        <path d="M300,620 L560,620 L470,300 L390,300 z" fill="#f0d89a" opacity={0.22} />
        <rect x={380} y={250} width={100} height={26} rx={10} fill="#c9a24a" {...L3} />
        <rect x={422} y={276} width={16} height={344} fill="#8a7440" />
      </g>
      <rect x={300} y={620} width={620} height={24} rx={6} fill="#4a4160" {...L3} />
      <rect x={0} y={SAN} width={W} height={H - SAN} fill="#3a3352" {...L} />
    </g>
  );
};

/** Văn phòng đêm: đèn tắt gần hết, một bàn còn sáng. */
export const VanPhongDem: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill="#1d2130" />
      {/* dãy đèn trần đã tắt, chỉ một cái còn sáng */}
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={220 + i * 560}
          y={70}
          width={340}
          height={22}
          rx={10}
          fill={i === 1 ? '#f7f2d8' : '#333a4c'}
          opacity={i === 1 ? 0.9 + Math.sin(frame / 30) * 0.06 : 1}
        />
      ))}
      {/* vệt sáng đổ xuống bàn */}
      <path d="M560,92 L900,92 L1080,880 L380,880 z" fill="#f7f2d8" opacity={0.09} />
      {/* cubicle tối */}
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={60 + i * 480} y={400} width={400} height={280} rx={8} fill="#2a3040" {...L3} />
      ))}
      {/* một màn hình còn sáng */}
      <rect x={620} y={470} width={230} height={148} rx={8} fill="#0f1420" {...L3} />
      <rect x={638} y={488} width={194} height={112} fill="#4a7fae" opacity={0.75} />
      {/* hộp sữa để trên bàn */}
      <g transform="translate(1010 700)">
        <rect x={-26} y={-70} width={52} height={70} rx={5} fill="#f4f0e4" {...L3} />
        <path d="M-26,-70 l26,-22 l26,22 z" fill="#e6e0cd" {...L3} />
        <rect x={-18} y={-52} width={36} height={22} rx={3} fill="#7fb0d9" />
      </g>
      <rect x={0} y={700} width={W} height={26} rx={6} fill="#39415a" />
      <rect x={0} y={SAN} width={W} height={H - SAN} fill="#2a3040" {...L} />
    </g>
  );
};

/** Nằm giường lúc nửa đêm, mặt được điện thoại soi sáng. */
export const GiuongDem: React.FC = () => {
  const frame = useCurrentFrame();
  const sang = 0.9 + Math.sin(frame / 14) * 0.1;
  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill="#191830" />
      {/* tường tối */}
      <rect x={0} y={0} width={W} height={SAN} fill="#1e1c38" />
      {/* giường */}
      <rect x={-40} y={640} width={2000} height={260} rx={26} fill="#3a3358" {...L} />
      <rect x={80} y={560} width={420} height={130} rx={22} fill="#4a4270" {...L3} />
      {/* vầng sáng điện thoại — nguồn sáng duy nhất trong khung */}
      <g opacity={sang}>
        <ellipse cx={1060} cy={560} rx={300} ry={220} fill="#6fa8dc" opacity={0.16} />
        <rect x={1010} y={500} width={100} height={180} rx={12} fill="#0d1220" {...L3} />
        <rect x={1020} y={514} width={80} height={152} fill="#8fc4ec" opacity={0.9} />
      </g>
      <rect x={0} y={SAN + 20} width={W} height={H - SAN - 20} fill="#2a2648" />
    </g>
  );
};

/** Phòng trọ có khung ảnh gia đình trên bàn. */
export const PhongTroAnh: React.FC = () => (
  <g>
    <rect x={0} y={0} width={W} height={H} fill={P.wall} />
    <rect x={1280} y={160} width={420} height={340} rx={8} fill={P.sky} {...L} />
    <line x1={1490} y1={160} x2={1490} y2={500} {...L} />
    <path d="M1280,500 L1700,500 L1420,880 L900,880 z" fill="#fff3d0" opacity={0.3} />
    <rect x={280} y={620} width={660} height={26} rx={6} fill={P.wood} {...L} />
    <rect x={310} y={646} width={22} height={234} fill={P.woodDark} />
    <rect x={888} y={646} width={22} height={234} fill={P.woodDark} />
    {/* khung ảnh gia đình — ba người đứng cạnh nhau */}
    <g transform="translate(600 500)">
      <rect x={-130} y={-100} width={260} height={200} rx={8} fill="#c9a24a" {...L} />
      <rect x={-112} y={-82} width={224} height={164} fill="#fdf6e8" {...L3} />
      {[-62, 0, 62].map((dx, i) => (
        <g key={dx} transform={`translate(${dx} 20)`}>
          <circle cx={0} cy={-30} r={22} fill={['#d9a878', '#f0c49a', '#e8b193'][i]} {...L3} />
          <path d="M-28,-4 q28,-16 56,0 l8,52 h-72 z" fill={['#8a6f9e', '#6d8fa8', '#a8806d'][i]} {...L3} />
        </g>
      ))}
      <path d="M-130,-100 l26,-26 h208 l26,26 z" fill="#b08a3a" {...L3} />
    </g>
    <rect x={0} y={SAN} width={W} height={H - SAN} fill={P.wood} {...L} />
  </g>
);

export const PLACES2: Record<string, React.FC> = {
  sanh: Sanh,
  'man-hinh-email': ManHinhEmail,
  'phong-hop': PhongHop,
  'dien-thoai-luong': DienThoaiLuong,
  'phong-tro-dem': PhongTroDem,
  'van-phong-dem': VanPhongDem,
  'giuong-dem': GiuongDem,
  'phong-tro-anh': PhongTroAnh,
};

/** Quán cà phê đối diện — chỗ ngồi tập nói trước giờ phỏng vấn. */
export const QuanCafe: React.FC = () => (
  <g>
    <rect x={0} y={0} width={W} height={H} fill="#e8dcc8" />
    <rect x={0} y={0} width={W} height={SAN} fill="#e0d2ba" />
    {[0, 1, 2].map((i) => (
      <rect key={i} x={120 + i * 640} y={130} width={400} height={300} rx={10} fill="#a9c9dc" {...L} />
    ))}
    <rect x={260} y={640} width={520} height={26} rx={8} fill="#8a6440" {...L} />
    <rect x={500} y={666} width={26} height={214} fill="#6d4d30" />
    <g transform="translate(430 600)">
      <path d="M-42,0 h84 l-12,44 h-60 z" fill="#fdfaf4" {...L3} />
      <path d="M42,10 q26,4 20,24 q-6,16 -24,10" fill="none" {...L3} />
      <path d="M-14,-14 q10,-22 0,-38" fill="none" stroke="#c9c3b4" strokeWidth={5} strokeLinecap="round" />
    </g>
    <rect x={0} y={SAN} width={W} height={H - SAN} fill="#b58a5c" {...L} />
  </g>
);

/** Cận màn hình CV đang sửa. */
export const ManHinhCV: React.FC = () => (
  <g>
    <rect x={0} y={0} width={W} height={H} fill="#2b3340" />
    <rect x={430} y={90} width={1060} height={900} rx={10} fill="#fdfaf4" {...L} />
    <circle cx={560} cy={230} r={64} fill="#dfe6ee" {...L3} />
    <rect x={660} y={180} width={420} height={38} rx={6} fill="#3a4450" />
    <rect x={660} y={240} width={300} height={24} rx={5} fill="#aeb6c0" />
    {new Array(9).fill(0).map((_, i) => (
      <rect key={i} x={510} y={360 + i * 62} width={i % 3 === 0 ? 900 : 700} height={20} rx={5} fill="#d6dce3" />
    ))}
    <rect x={510} y={880} width={520} height={26} rx={5} fill="#f0c86a" />
  </g>
);

/** Hộp thư trống trơn. */
export const HopThu: React.FC = () => (
  <g>
    <rect x={0} y={0} width={W} height={H} fill="#2b3340" />
    <rect x={330} y={140} width={1260} height={820} rx={12} fill="#fdfaf4" {...L} />
    <rect x={330} y={140} width={1260} height={72} rx={12} fill="#dfe6ee" {...L} />
    <text x={380} y={188} fontSize={32} fontWeight={800} fill="#6d7684" fontFamily="system-ui">
      Hộp thư đến
    </text>
    {[
      ['Không có phản hồi', '#aeb6c0'],
      ['Thư từ chối tự động', '#e8635a'],
      ['Khoá học tiếng Anh giảm 70%', '#e8b25a'],
    ].map(([t, c], i) => (
      <g key={t as string}>
        <rect x={366} y={262 + i * 108} width={1188} height={88} rx={8} fill={i === 0 ? '#f4f6f8' : '#fff'} {...L3} />
        <circle cx={420} cy={306 + i * 108} r={18} fill={c as string} />
        <text x={464} y={318 + i * 108} fontSize={32} fontWeight={700} fill="#3a4450" fontFamily="system-ui">
          {t as string}
        </text>
      </g>
    ))}
    <text x={960} y={720} textAnchor="middle" fontSize={40} fontWeight={700} fill="#c2c9d1" fontFamily="system-ui">
      — hết —
    </text>
  </g>
);

/** Thẻ nhân viên đặt trên bàn. */
export const TheNhanVien: React.FC = () => (
  <g>
    <rect x={0} y={0} width={W} height={H} fill="#8b95a0" />
    <rect x={0} y={0} width={W} height={SAN} fill="#9aa5b0" />
    <g transform="translate(960 500) rotate(-4)">
      <rect x={-300} y={-190} width={600} height={380} rx={18} fill="#fdfaf4" {...L} />
      <rect x={-300} y={-190} width={600} height={80} rx={18} fill="#4a72d6" />
      <circle cx={-170} cy={20} r={74} fill="#dfe6ee" {...L3} />
      <rect x={-60} y={-40} width={310} height={30} rx={6} fill="#3a4450" />
      <text x={-60} y={70} fontSize={54} fontWeight={900} fill="#8b93a0" fontFamily="system-ui">
        NV-2847
      </text>
      <rect x={-60} y={110} width={200} height={18} rx={5} fill="#ccd3da" />
    </g>
  </g>
);

/** Đồng hồ tường trong cuộc họp dài lê thê. */
export const DongHoHop: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <g>
      <rect x={0} y={0} width={W} height={H} fill="#dde5ea" />
      <g transform="translate(960 500)">
        <circle cx={0} cy={0} r={280} fill="#fdfaf4" {...L} strokeWidth={9} />
        {new Array(12).fill(0).map((_, i) => (
          <line
            key={i}
            x1={0}
            y1={-236}
            x2={0}
            y2={-262}
            {...L}
            transform={`rotate(${i * 30})`}
          />
        ))}
        {/* kim phút quay nhanh — thời gian trôi mà họp không đi tới đâu */}
        <line x1={0} y1={0} x2={0} y2={-190} {...L} strokeWidth={9} transform={`rotate(${frame * 3})`} />
        <line x1={0} y1={0} x2={0} y2={-130} {...L} strokeWidth={13} transform={`rotate(${frame * 0.25})`} />
        <circle cx={0} cy={0} r={18} fill={P.line} />
      </g>
    </g>
  );
};

/** Nhìn từ trên xuống dãy bàn — Tèo là một chấm giữa đám đông. */
export const VanPhongTuXa: React.FC = () => (
  <g>
    <rect x={0} y={0} width={W} height={H} fill="#e0e6ea" />
    {new Array(4).fill(0).map((_, r) =>
      new Array(6).fill(0).map((_, c) => (
        <g key={`${r}${c}`} transform={`translate(${190 + c * 310} ${200 + r * 210})`}>
          <rect x={-110} y={-46} width={220} height={92} rx={8} fill="#c3ccd4" {...L3} />
          <rect x={-52} y={-84} width={104} height={40} rx={5} fill="#5d6a78" {...L3} />
          <circle cx={0} cy={62} r={26} fill={r === 2 && c === 3 ? '#4a72d6' : '#a8b2bb'} {...L3} />
          {(r + c) % 3 === 0 ? <path d="M-30,88 q30,-18 60,0 l8,44 h-76 z" fill="#9aa6b2" /> : null}
        </g>
      ))
    )}
  </g>
);

Object.assign(PLACES2, {
  'quan-cafe': QuanCafe,
  'man-hinh-cv': ManHinhCV,
  'hop-thu': HopThu,
  'the-nhan-vien': TheNhanVien,
  'dong-ho-hop': DongHoHop,
  'van-phong-tu-xa': VanPhongTuXa,
});
