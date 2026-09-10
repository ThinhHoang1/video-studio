import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {PROPS, VeProp} from '../props';
import {CO_CANH, type TenProp} from '../board/kieu-board';
import {BOI_CANH, TEN_BOI_CANH} from '../boi-canh';
import {ChuTrenMan, FONT_TAY} from '../chu';
import {AnhChen} from '../insert';
import {NhanVat} from '../rig/nhan-vat';
import {MUC, NEN, net} from '../rig/hinh';
import {FONT} from '../../engine/font';

/**
 * Bảng thử prop + bối cảnh + chữ + insert V2.
 * Render: npx remotion still src/index.ts PropsV2Test out/v2/props-v2.png --frame 20
 *
 * 1. Lưới 28 prop cũ ở co = 0.6, nét 5px (= nét nhân vật DAU 330)
 * 2. Lưới 25 prop mới + 4 prop sửa theo QC (bang-den, may-bay-giay, ao-mua, vach-buc)
 * 3. 16 bối cảnh cỡ trung (khung 1920x1080 thu 0.21) với nhân vật giả 0.6 x 2.6 DAU = 330 tại x 0.5
 * 4. 16 bối cảnh cỡ rong (thu 0.15) với nhân vật giả DAU = 200
 * 5. Chữ + insert · 6. Font cỡ thật
 */
export const PROPS_TEST_W = 2560;
export const PROPS_TEST_H = 5300;

const CO = 0.6;
const NET_PX = 5;

type O = {ten: TenProp; w: number; sua?: boolean};
/** hàng prop cũ: tên + bề rộng ô (px). Hàng 1 là các prop cao. */
const HANG_CU: {san: number; o: O[]}[] = [
  {
    san: 600,
    o: [
      {ten: 'cua', w: 230},
      {ten: 'cong-truong', w: 480},
      {ten: 'cot-dien', w: 380},
      {ten: 'goc-cay', w: 380},
      {ten: 'mua', w: 320},
      {ten: 'ao-mua', w: 320, sua: true},
      {ten: 'ly-tra-sua', w: 160},
      {ten: 'but', w: 150},
      {ten: 'dien-thoai', w: 150},
    ],
  },
  {
    san: 950,
    o: [
      {ten: 'ban-hoc', w: 300},
      {ten: 'ban-giao-vien', w: 330},
      {ten: 'bang-den', w: 400, sua: true},
      {ten: 'day-ban-lop', w: 380},
      {ten: 'cua-so', w: 300},
      {ten: 'ban-phong-van', w: 470},
      {ten: 'ghe-da', w: 330},
    ],
  },
  {
    san: 1220,
    o: [
      {ten: 'xe-dap', w: 310},
      {ten: 'laptop', w: 260},
      {ten: 'ban-cafe', w: 250},
      {ten: 'sach', w: 200},
      {ten: 'la-thu', w: 180},
      {ten: 'dong-ho', w: 170},
      {ten: 'may-bay-giay', w: 300, sua: true},
      {ten: 'bong-chu', w: 250},
      {ten: 'trai-tim', w: 190},
      {ten: 'mui-ten', w: 200},
      {ten: 'giot-mo-hoi', w: 120},
      {ten: 'vach-buc', w: 150, sua: true},
    ],
  },
];

/** hàng prop mới */
const HANG_MOI: {san: number; o: O[]}[] = [
  {
    san: 1950,
    o: [
      {ten: 'cot-co', w: 190},
      {ten: 'den-duong', w: 220},
      {ten: 'cua-nha', w: 380},
      {ten: 'man-hinh-chat', w: 340},
      {ten: 'tu-lanh', w: 230},
      {ten: 'tram-xe-buyt', w: 440},
      {ten: 'xe-buyt', w: 560},
    ],
  },
  {
    san: 2480,
    o: [
      {ten: 'cau-thang', w: 320},
      {ten: 'giuong', w: 410},
      {ten: 'ghe-sofa', w: 430},
      {ten: 'ban-an', w: 480},
      {ten: 'tivi', w: 340},
      {ten: 'quay-cang-tin', w: 490},
    ],
  },
  {
    san: 2920,
    o: [
      {ten: 'bang-tin', w: 390},
      {ten: 'day-ban-sau', w: 400},
      {ten: 'hang-rao', w: 400},
      {ten: 'cay-nho', w: 200},
      {ten: 'den-ngu', w: 150},
      {ten: 'ghe-nha-hang', w: 160},
      {ten: 'thung-rac', w: 180},
      {ten: 'khay-com', w: 250},
      {ten: 'mat-troi', w: 230},
      {ten: 'mat-trang', w: 240},
    ],
  },
  {
    san: 3260,
    o: [
      {ten: 'may', w: 220},
      {ten: 'may-2', w: 280},
    ],
  },
];

const Nhan: React.FC<{x: number; y: number; t: string; s?: number}> = ({x, y, t, s = 22}) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontSize={s} fill="#555">
    {t}
  </text>
);

const TieuDe: React.FC<{y: number; t: string}> = ({y, t}) => (
  <text x={35} y={y} fontFamily={FONT} fontSize={26} fontWeight={700} fill={MUC}>
    {t}
  </text>
);

/** một hàng prop: xếp từ trái, mỗi ô rộng o.w, tâm đáy tại (giữa ô, san) */
const HangProp: React.FC<{hang: {san: number; o: O[]}}> = ({hang}) => {
  let x = 35;
  return (
    <>
      {hang.o.map((o) => {
        const cx = x + o.w / 2;
        x += o.w;
        const P = PROPS[o.ten];
        const clip = o.ten === 'mua';
        return (
          <g key={o.ten}>
            {clip ? (
              <>
                <clipPath id={`clip-${o.ten}`}>
                  <rect x={cx - 150} y={hang.san - 520} width={300} height={520} />
                </clipPath>
                <rect x={cx - 150} y={hang.san - 520} width={300} height={520} fill="none" stroke="#ccc" strokeDasharray="6 6" />
                <g clipPath={`url(#clip-${o.ten})`}>
                  <P x={cx} y={hang.san} co={CO} net={NET_PX} />
                </g>
              </>
            ) : (
              <P x={cx} y={hang.san} co={CO} net={NET_PX} />
            )}
            <Nhan x={cx} y={hang.san + 30} t={o.sua ? `${o.ten} (sửa)` : o.ten} />
          </g>
        );
      })}
    </>
  );
};

/** khung 1920x1080 thu nhỏ để xem chữ/insert/bối cảnh đúng tỉ lệ */
const KhungNho: React.FC<{x: number; y: number; ti: number; nhan: string; children: React.ReactNode}> = ({x, y, ti, nhan, children}) => (
  <>
    <div style={{position: 'absolute', left: x, top: y, width: 1920 * ti, height: 1080 * ti, outline: '2px solid #bbb', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 1080, transform: `scale(${ti})`, transformOrigin: '0 0', background: NEN}}>{children}</div>
    </div>
    <div style={{position: 'absolute', left: x, top: y + 1080 * ti + 6, width: 1920 * ti, textAlign: 'center', fontFamily: FONT, fontSize: 20, color: '#555'}}>{nhan}</div>
  </>
);

const W = 1920;
const H = 1080;

/**
 * Một bối cảnh trong khung 1920x1080: prop (bung theo cỡ) + nhân vật giả (hình chữ nhật
 * 0.6 x 2.6 DAU, chân ở chanY của cỡ, x = 0.5) + hai vạch mờ đánh dấu dải x 0.3–0.7.
 * Prop vẽ theo cùng công thức renderer: co × dau/330, nét = net(dau).
 */
const OBoiCanh: React.FC<{ten: string; co: 'rong' | 'trung'}> = ({ten, co}) => {
  const bc = BOI_CANH[ten];
  const {dau, chanY} = CO_CANH[co];
  const netPx = net(dau);
  const ve = (truoc: boolean) =>
    bc[co]
      .filter((p) => !!p.truoc === truoc)
      .map((p, i) => <VeProp key={`${p.ten}-${i}`} ten={p.ten as TenProp} x={p.x * W} y={p.y * H} co={(p.co ?? 1) * (dau / 330)} net={netPx} flip={p.flip} />);
  const w = 0.6 * dau;
  const h = 2.6 * dau;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
      <line x1={W * 0.3} y1={0} x2={W * 0.3} y2={H} stroke="#ccc" strokeDasharray="10 14" strokeWidth={2} />
      <line x1={W * 0.7} y1={0} x2={W * 0.7} y2={H} stroke="#ccc" strokeDasharray="10 14" strokeWidth={2} />
      {ve(false)}
      <rect x={W * 0.5 - w / 2} y={chanY * H - h} width={w} height={h} fill="#dcdcdc" stroke="#888" strokeWidth={3} strokeDasharray="12 8" />
      <circle cx={W * 0.5} cy={chanY * H - h + 0.5 * dau} r={0.5 * dau} fill="#dcdcdc" stroke="#888" strokeWidth={3} strokeDasharray="12 8" />
      {ve(true)}
    </svg>
  );
};

export const PropsV2Test: React.FC = () => {
  const frame = useCurrentFrame();
  const shotLen = 60;

  // 3. bối cảnh trung: 6 ô một hàng, thu 0.21
  const tiTrung = 0.21;
  const yTrung = 3520;
  const buocTrungX = 1920 * tiTrung + 12;
  const buocTrungY = 1080 * tiTrung + 42;
  // 4. bối cảnh rong: 8 ô một hàng, thu 0.15
  const tiRong = 0.15;
  const yRong = yTrung + 3 * buocTrungY + 50;
  const buocRongX = 1920 * tiRong + 12;
  const buocRongY = 1080 * tiRong + 40;

  // 5. chữ + insert
  const ti = 0.215;
  const bandY = yRong + 2 * buocRongY + 50;
  const buoc = 1920 * ti + 9;
  const fontY = bandY + 1080 * ti + 70;

  // nhân vật trực diện cỡ cận: đầu tại (1382, 483)
  const TrucDien = (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
      <NhanVat kieu="nam" dau={560} x={W * 0.72} y={H * 1.5} dang="dung" mat="oval" mieng="C" id="td" />
    </svg>
  );
  // tiểu cảnh: nhân vật bé giữa khung trắng, đầu tại (1190, 490)
  const TieuCanh = (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
      <NhanVat kieu="ha" dau={110} x={W * 0.62} y={H * 0.66} dang="omDau" mat="xoan" mieng="meu" id="tc" />
    </svg>
  );

  const soMoi = HANG_MOI.reduce((s, h) => s + h.o.length, 0);

  return (
    <AbsoluteFill style={{background: NEN}}>
      <svg width={PROPS_TEST_W} height={PROPS_TEST_H} viewBox={`0 0 ${PROPS_TEST_W} ${PROPS_TEST_H}`} style={{position: 'absolute', left: 0, top: 0}}>
        <TieuDe y={40} t={`1. Thư viện prop V2 — 28 prop cũ, co = ${CO}, nét ${NET_PX}px, nét đen không tô, phối cảnh một điểm tụ; (sửa) = đã chỉnh theo QC`} />
        {HANG_CU.map((h) => (
          <HangProp key={h.san} hang={h} />
        ))}
        <TieuDe y={1300} t={`2. Prop mới — ${soMoi} prop (22 theo yêu cầu + may-2, den-ngu, day-ban-sau), cùng cỡ co = ${CO}, nét ${NET_PX}px`} />
        {HANG_MOI.map((h) => (
          <HangProp key={h.san} hang={h} />
        ))}
        <TieuDe y={yTrung - 16} t={`3. Bối cảnh dựng sẵn (src/v2/boi-canh.ts) — ${TEN_BOI_CANH.length} bối cảnh, cỡ TRUNG (DAU 330, chân y 1.04), nhân vật giả 0.6 x 2.6 DAU tại x 0.5, vạch mờ = dải x 0.3–0.7 phải trống`} />
        <TieuDe y={yRong - 16} t={`4. Cùng ${TEN_BOI_CANH.length} bối cảnh, cỡ RONG (DAU 200, chân y 0.84) — prop tự thu theo dau/330 như renderer`} />
        <TieuDe y={bandY - 12} t={`5. Chữ trên màn (4 kiểu, vào tuc-thi / phong / tung-tu) + ảnh chèn — khung 1920x1080 thu ${ti}, frame ${frame}/${shotLen}`} />
        <TieuDe y={fontY - 30} t="6. Font cỡ thật (1:1 trên khung 1080)" />
      </svg>

      {/* 3. bối cảnh trung */}
      {TEN_BOI_CANH.map((ten, i) => (
        <KhungNho key={`t-${ten}`} x={35 + buocTrungX * (i % 6)} y={yTrung + buocTrungY * Math.floor(i / 6)} ti={tiTrung} nhan={`${ten} · trung · ${BOI_CANH[ten].trung.length} prop`}>
          <OBoiCanh ten={ten} co="trung" />
        </KhungNho>
      ))}

      {/* 4. bối cảnh rong */}
      {TEN_BOI_CANH.map((ten, i) => (
        <KhungNho key={`r-${ten}`} x={35 + buocRongX * (i % 8)} y={yRong + buocRongY * Math.floor(i / 8)} ti={tiRong} nhan={`${ten} · rong`}>
          <OBoiCanh ten={ten} co="rong" />
        </KhungNho>
      ))}

      {/* 5. chữ + insert trong khung 1920x1080 thu nhỏ */}
      <KhungNho x={35 + buoc * 0} y={bandY} ti={ti} nhan="kem · tuc-thi · trai (lời → tự thêm ngoặc kép)">
        {TrucDien}
        <ChuTrenMan chu={{noi_dung: 'Chỉ là bạn thôi.', kieu: 'kem', vi_tri: 'trai'}} frame={frame} shotLen={shotLen} W={W} H={H} />
      </KhungNho>
      <KhungNho x={35 + buoc * 1} y={bandY} ti={ti} nhan="the · tuc-thi · 2 dòng (118px)">
        <ChuTrenMan chu={{noi_dung: 'HÀ.\nKHÔNG PHẢI AI KHÁC.', kieu: 'the'}} frame={frame} shotLen={shotLen} W={W} H={H} />
      </KhungNho>
      <KhungNho x={35 + buoc * 2} y={bandY} ti={ti} nhan="the · phong (0.3 → 1.6 trong 10 frame, giữ)">
        <ChuTrenMan chu={{noi_dung: 'KHÔNG!', kieu: 'the', vao: 'phong'}} frame={frame} shotLen={shotLen} W={W} H={H} />
      </KhungNho>
      <KhungNho x={35 + buoc * 3} y={bandY} ti={ti} nhan="nhan · tren + mũi tên cong vào neo (đỉnh đầu)">
        {TrucDien}
        <ChuTrenMan chu={{noi_dung: 'Thằng bạn thân', kieu: 'nhan', vi_tri: 'tren'}} frame={frame} shotLen={shotLen} W={W} H={H} neoX={W * 0.72} neoY={H * 1.5 - 2.03 * 560 - 0.46 * 560} net={6} />
      </KhungNho>
      <KhungNho x={35 + buoc * 4} y={bandY} ti={ti} nhan="tay · tung-tu · canh-dau (Patrick Hand, 6 từ đều theo shotLen)">
        {TieuCanh}
        <ChuTrenMan chu={{noi_dung: 'lúc đó tớ chỉ muốn độn thổ', kieu: 'tay', vao: 'tung-tu', vi_tri: 'canh-dau'}} frame={frame} shotLen={shotLen} W={W} H={H} neoX={W * 0.62} neoY={H * 0.66 - 2.03 * 110} />
      </KhungNho>
      <KhungNho x={35 + buoc * 5} y={bandY} ti={ti} nhan="insert · meme/drake.png · co 0.5 · xoay -4° · pop 3 frame">
        <AnhChen insert={{anh: 'meme/drake.png', co: 0.5, xoay: -4}} W={W} H={H} frame={frame} />
      </KhungNho>

      {/* 6. font ở cỡ thật 1:1 để soi dấu tiếng Việt */}
      <div style={{position: 'absolute', left: 35, top: fontY, display: 'flex', alignItems: 'baseline', gap: 48, whiteSpace: 'nowrap', color: MUC}}>
        <span style={{fontFamily: FONT, fontSize: 100, fontWeight: 900, lineHeight: 1.1}}>HÀ. ĐỘN THỔ</span>
        <span style={{fontFamily: FONT, fontSize: 52, fontWeight: 800}}>“Chỉ là bạn thôi.”</span>
        <span style={{fontFamily: FONT, fontSize: 34, fontWeight: 800}}>Thằng bạn thân</span>
        <span style={{fontFamily: FONT_TAY, fontSize: 36}}>lúc đó tớ chỉ muốn độn thổ (Patrick Hand: ắ ằ ẳ ẵ ặ ề ể ễ ệ ở ỡ ợ ừ ử ữ ự)</span>
      </div>
    </AbsoluteFill>
  );
};
