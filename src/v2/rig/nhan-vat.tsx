import React, {useId} from 'react';
import {CHINH, PHU, Khung, MUC, NEN, net as tinhNet, rad, GocNhin, Diem, bam, bienDoTayVe, ellipseTayVe, ongTayVe, nhieuDuong, duongKin, khungTiLe} from './hinh';
import {Mat, PhuKienMat, TrangThaiMat, TrangThaiMay, viTriMat} from './mat';
import {Mieng, HinhMieng} from './mieng';
import {BanTay} from './tay';
import {TocSau, TocTruoc} from './toc';
import {TU_THE, TuThe, Tay, Chan} from './tu-the';
import {KIEU, Kieu, layPhongCach, PhongCach} from './kieu';
import {DoCam} from './do-cam';

/**
 * Nhân vật V2 — rig storytime.
 *
 * Mọi toạ độ tính thẳng ra px (không transform scale) để độ dày nét đúng px ở
 * mọi cỡ. Chi = hai đoạn ống: vẽ nét đen dày trước, đè nét trắng mỏng hơn lên
 * → viền liền, không thấy khớp.
 *
 * Không có chuyển động tự sinh (thở, lắc, chớp ngẫu nhiên): tham chiếu giữ
 * tuyệt đối trong hold; mọi thay đổi đến từ prop (dang/mat/mieng) do bảng phân
 * cảnh + lip-sync lái.
 *
 * Góc nhìn `goc`: truoc (mặc định) | ba-phan-tu | nghieng | sau. Trong hệ cục bộ
 * mặt LUÔN quay về +x; `flip` lật cả nhóm. `sau` = vẽ như trước nhưng lật + không
 * mặt + gáy tóc (tay phải hiện bên trái màn đúng như quay lưng).
 *
 * Nét vẽ tay `tayVe` (mặc định true): sọ, thân, ống chi là path có nhiễu nhỏ
 * (0.006 DAU) với seed từ id + tên bộ phận — KHÔNG đổi theo frame, không boil.
 */
export type NhanVatProps = {
  kieu: string | Kieu;
  /** bề rộng sọ trên màn (px) */
  dau: number;
  /** giữa hai bàn chân (px) */
  x: number;
  y: number;
  dang?: string | TuThe;
  mat?: TrangThaiMat;
  may?: TrangThaiMay;
  mieng?: HinhMieng;
  /** biến thể hình miệng 0/1 — lip-sync đổi mỗi frame */
  bien?: number;
  /** rung miệng từng frame 0/1 (lip-sync) */
  rung?: number;
  /** hướng nhìn -1..1 */
  nhin?: number;
  flip?: boolean;
  ma?: boolean;
  moHoi?: boolean;
  net?: number;
  id?: string;
  /** góc nhìn (mặc định truoc); tư thế quayLung tương đương 'sau' */
  goc?: GocNhin;
  /** đồ cầm trên tay (tên trong DO_CAM) — đè lên `cam` mặc định của tư thế */
  cam?: string;
  /** nét vẽ tay (mặc định true) */
  tayVe?: boolean;
};

const layKieu = (k: string | Kieu): Kieu => (typeof k === 'string' ? KIEU[k] ?? KIEU.trang : k);

/**
 * Đầu co giãn theo cảm xúc (trạng thái tĩnh, không tween):
 *   soc / soc-lon → cao thêm 6% (kéo lên từ cằm); cung + cười → bè 4%; chan → hạ 0.03 DAU.
 * Trả {sx, sy, ha}: hệ số ngang, hệ số dọc, độ hạ (hệ số DAU).
 */
export const coGianDau = (mat?: TrangThaiMat, mieng?: HinhMieng): {sx: number; sy: number; ha: number} => {
  if (mat === 'soc' || mat === 'soc-lon') return {sx: 1, sy: 1.06, ha: 0};
  if (mat === 'cung' && (mieng === 'cuoi' || mieng === 'cuoi-toe' || mieng === 'cuoi-nhe')) return {sx: 1.04, sy: 1, ha: 0};
  if (mat === 'chan') return {sx: 1, sy: 1, ha: 0.03};
  return {sx: 1, sy: 1, ha: 0};
};

/**
 * Path sọ theo góc nhìn. truoc / ba-phan-tu / sau: ellipse vẽ tay. nghieng: một đường
 * có trán, mũi nhô và cằm (điểm trên ellipse đơn vị rồi nhân rx, ry; f = hướng mặt).
 */
export const duongSo = (goc: GocNhin, cx: number, cy: number, rx: number, ry: number, f: 1 | -1, bienDo: number, seed: number) => {
  if (goc !== 'nghieng') return ellipseTayVe(cx, cy, rx, ry, bienDo, seed, 12);
  const U: Diem[] = [
    [0, -1],
    [0.5, -0.87],
    [0.86, -0.5],
    [1.0, -0.12],
    [0.98, 0.22], // gốc mũi
    [1.2, 0.4], // chóp mũi
    [0.97, 0.5],
    [0.9, 0.66],
    [0.76, 0.84], // cằm
    [0.45, 0.98],
    [0.1, 1.0],
    [-0.35, 0.94],
    [-0.75, 0.66],
    [-0.98, 0.2],
    [-0.9, -0.42],
    [-0.55, -0.84],
  ];
  const P: Diem[] = U.map(([u, v]) => [cx + u * f * rx, cy + v * ry]);
  return duongKin(nhieuDuong(P, bienDo, seed, true, 1));
};

/** một chi hai đoạn: (x0,y0) → khuỷu → cổ tay; trả toạ độ để đặt bàn tay */
const chi = (x0: number, y0: number, d: number, t: Tay, side: 1 | -1, K: Khung) => {
  const e: Diem = [x0 + Math.sin(rad(t.canh)) * side * K.canhTay * d, y0 + Math.cos(rad(t.canh)) * K.canhTay * d];
  const dai = K.cangTay * d * (t.co ?? 1);
  const w: Diem = [e[0] + Math.sin(rad(t.cang)) * side * dai, e[1] + Math.cos(rad(t.cang)) * dai];
  return {e, w, khop: [[x0, y0] as Diem, e, w]};
};

const Ong: React.FC<{d: string; day: number; net: number; mau?: string}> = ({d, day, net, mau = NEN}) => (
  <g>
    <path d={d} fill="none" stroke={MUC} strokeWidth={day + 2 * net} strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke={mau} strokeWidth={day} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

/**
 * Mũi (PhongCach.mui) — hệ đầu, tâm mặt (cx, cyM). Góc nghiêng KHÔNG vẽ: đường sọ profile đã có mũi nhô.
 *   cham: chấm đặc nhỏ · gach: gạch cong ngắn (như dấu ᴗ) · moc: móc câu — nét xiên xuống rồi hất ngang
 */
const Mui: React.FC<{dau: number; cx: number; cy: number; net: number; mui: NonNullable<PhongCach['mui']>; goc: GocNhin; f: 1 | -1}> = ({dau: d, cx, cy, net, mui, goc, f}) => {
  if (mui === 'khong' || goc === 'nghieng' || goc === 'sau') return null;
  const x = cx + (goc === 'ba-phan-tu' ? 0.14 : 0) * f * d;
  const y = cy + 0.2 * d;
  const L = {fill: 'none', stroke: MUC, strokeWidth: net * 0.85, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  switch (mui) {
    case 'cham':
      return <circle cx={x} cy={y} r={0.022 * d} fill={MUC} />;
    case 'gach':
      return <path d={`M ${x - 0.045 * d} ${y - 0.03 * d} Q ${x} ${y + 0.05 * d} ${x + 0.045 * d} ${y - 0.03 * d}`} {...L} />;
    case 'moc':
      return <path d={`M ${x - 0.005 * f * d} ${y - 0.1 * d} L ${x + 0.045 * f * d} ${y + 0.02 * d} L ${x - 0.025 * f * d} ${y + 0.03 * d}`} {...L} />;
  }
};

/**
 * Tai (PhongCach.tai) — nửa vòng tròn bám mép sọ, vẽ TRƯỚC sọ (sọ đè nửa trong) và trước TocTruoc (tóc che được).
 * truoc/sau: hai tai ±rx · ba-phan-tu: chỉ tai phía xa mặt (−x) · nghieng: một tai lùi về gáy.
 */
const Tai: React.FC<{dau: number; cx: number; cy: number; rx: number; net: number; goc: GocNhin; f: 1 | -1}> = ({dau: d, cx, cy, rx, net, goc, f}) => {
  const ben: number[] = goc === 'truoc' || goc === 'sau' ? [-1, 1] : goc === 'ba-phan-tu' ? [-0.92 * f] : [-0.55 * f];
  const r = 0.1 * d;
  const y = cy + 0.14 * d;
  return (
    <g>
      {ben.map((b) => {
        const x = cx + b * rx;
        const h = Math.sign(b) || 1;
        return (
          <g key={b}>
            <path d={`M ${x} ${y - r} a ${r} ${r} 0 0 ${h > 0 ? 1 : 0} 0 ${2 * r} z`} fill={NEN} stroke={MUC} strokeWidth={net} strokeLinejoin="round" />
            {d >= 200 && <path d={`M ${x + h * r * 0.55} ${y - r * 0.35} q ${h * r * 0.15} ${r * 0.4} ${-h * r * 0.2} ${r * 0.55}`} fill="none" stroke={MUC} strokeWidth={net * 0.7} strokeLinecap="round" />}
          </g>
        );
      })}
    </g>
  );
};

/**
 * Cổ áo (PhongCach.coAo) tại đỉnh thân (x = trục thân đã lệch theo góc, y = vai).
 *   v     : hai nét chữ V (gốc). Có màu áo → lót trắng bên trong V (hở da)
 *   tron  : cung tròn nông, có màu áo → lót trắng
 *   so-mi : hai cánh cổ trắng viền đen + nẹp áo ngắn ở giữa
 */
const CoAo: React.FC<{x: number; y: number; d: number; hep: number; net: number; kieu: NonNullable<PhongCach['coAo']>; mauAo?: string}> = ({x, y, d, hep, net, kieu, mauAo}) => {
  const L = {fill: 'none', stroke: MUC, strokeWidth: net, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  const w = 0.09 * d * hep;
  switch (kieu) {
    case 'v': {
      const v = `M ${x - w} ${y - 0.02 * d} L ${x} ${y + 0.1 * d} L ${x + w} ${y - 0.02 * d}`;
      return (
        <g>
          {mauAo && <path d={`${v} z`} fill={NEN} />}
          <path d={v} {...L} />
        </g>
      );
    }
    case 'tron': {
      const c = `M ${x - w * 1.2} ${y - 0.03 * d} Q ${x} ${y + 0.14 * d} ${x + w * 1.2} ${y - 0.03 * d}`;
      return (
        <g>
          {mauAo && <path d={`${c} z`} fill={NEN} />}
          <path d={c} {...L} />
        </g>
      );
    }
    case 'so-mi': {
      const canh = (m: 1 | -1) => `M ${x + m * 0.01 * d} ${y - 0.04 * d} L ${x + m * 0.17 * d * hep} ${y + 0.02 * d} L ${x + m * 0.015 * d} ${y + 0.12 * d} z`;
      return (
        <g>
          <path d={canh(-1)} {...L} fill={NEN} />
          <path d={canh(1)} {...L} fill={NEN} />
          <line x1={x} y1={y + 0.12 * d} x2={x} y2={y + 0.42 * d} stroke={MUC} strokeWidth={net * 0.8} strokeLinecap="round" />
        </g>
      );
    }
  }
};

export type DauProps = {
  kieu: string | Kieu;
  dau: number;
  cx: number;
  cy: number;
  net?: number;
  mat?: TrangThaiMat;
  may?: TrangThaiMay;
  mieng?: HinhMieng;
  bien?: number;
  /** rung miệng từng frame 0/1 (lip-sync) */
  rung?: number;
  nhin?: number;
  /** mặt quay về -x (Dau đứng riêng); trong NhanVat cả nhóm lật nên luôn false */
  flip?: boolean;
  ma?: boolean;
  moHoi?: boolean;
  /** tương đương goc 'sau' */
  quayLung?: boolean;
  goc?: GocNhin;
  tayVe?: boolean;
  id?: string;
};

/** Đầu + mặt + tóc, tâm sọ tại (cx, cy). Dùng riêng cho bảng thử và cận đặc tả. */
export const Dau: React.FC<DauProps> = ({kieu, dau: d, cx, cy, net, mat, may, mieng, bien, rung, nhin = 0, flip, ma, moHoi, quayLung, goc: gocProp, tayVe = true, id}) => {
  const auto = useId();
  const k = layKieu(kieu);
  const n = net ?? tinhNet(d);
  const K = k.khung === 'phu' ? PHU : CHINH;
  const goc: GocNhin = quayLung ? 'sau' : gocProp ?? 'truoc';
  const f: 1 | -1 = flip ? -1 : 1;
  const pc = layPhongCach(k);
  const trang = k.ten === 'người';
  const coMat = goc !== 'sau' && (trang ? Boolean(mat || mieng) : true);
  const coToc = k.toc.mau !== NEN;
  const seed = bam(`${id ?? k.ten}:dau`);
  const bd = tayVe ? bienDoTayVe(d) : 0;

  // co giãn theo cảm xúc: cằm cố định, sọ kéo lên / bè ra / cả đầu hạ
  const cg = coGianDau(coMat ? mat : undefined, coMat ? mieng : undefined);
  const cyM = cy + cg.ha * d; // tâm mặt (mắt/miệng bám theo)
  const rx = K.soRx * d * cg.sx;
  const ry = K.soRy * d * cg.sy;
  const cyS = cyM + K.soRy * d - ry; // tâm sọ sau khi kéo cao
  const so = duongSo(goc, cx, cyS, rx, ry, f, bd, seed);
  const clip = `so-${(id ?? auto).replace(/[^a-zA-Z0-9]/g, '')}`;

  const matVe = mat ?? (trang ? 'cham' : 'oval');
  const viTri = viTriMat(goc, f);
  const kinh = k.phuKien === 'kinh' && coMat;
  const lechNhin = nhin * 0.05 * d;

  return (
    <g>
      {coToc && goc !== 'sau' && <TocSau dau={d} cx={cx} cy={cyS} net={n} toc={k.toc} flip={flip} goc={goc} />}
      <defs>
        <clipPath id={clip}>
          <path d={so} />
        </clipPath>
      </defs>
      {pc.tai && <Tai dau={d} cx={cx} cy={cyS} rx={rx} net={n} goc={goc} f={f} />}
      <path d={so} fill={NEN} stroke={MUC} strokeWidth={n} strokeLinejoin="round" />
      {coMat && (
        <g>
          <Mat dau={d} cx={cx} cy={cyM} net={n} mat={matVe} may={may} nhin={nhin} goc={goc} lat={flip} id={id} kieu={pc.mat} />
          <Mui dau={d} cx={cx} cy={cyM} net={n} mui={pc.mui} goc={goc} f={f} />
          {goc === 'nghieng' ? (
            <g clipPath={`url(#${clip})`}>
              <Mieng dau={d} cx={cx} cy={cyM} net={n} hinh={mieng ?? 'X'} nhin={nhin} bien={bien} rung={rung} goc={goc} lat={flip} />
            </g>
          ) : (
            <Mieng dau={d} cx={cx} cy={cyM} net={n} hinh={mieng ?? 'X'} nhin={nhin} bien={bien} rung={rung} goc={goc} lat={flip} />
          )}
          <PhuKienMat dau={d} cx={cx} cy={cyM} net={n} ma={ma} moHoi={moHoi} goc={goc} lat={flip} />
        </g>
      )}
      {kinh && (
        <g fill="none" stroke={MUC} strokeWidth={n * 0.8}>
          {viTri.map((m, i) => (
            <ellipse key={i} cx={cx + m.x * d + lechNhin} cy={cyM + 0.06 * d} rx={0.15 * d * m.co} ry={0.13 * d * m.co} />
          ))}
          {viTri.length === 2 && (
            <line x1={cx + (viTri[0].x + 0.15 * viTri[0].co * f) * d + lechNhin} y1={cyM + 0.04 * d} x2={cx + (viTri[1].x - 0.15 * f) * d + lechNhin} y2={cyM + 0.04 * d} />
          )}
          {viTri.length === 1 && <line x1={cx + (viTri[0].x - 0.15 * f) * d + lechNhin} y1={cyM + 0.04 * d} x2={cx - 0.42 * f * d} y2={cyM + 0.02 * d} />}
        </g>
      )}
      {/* nhìn từ sau: tóc sau nằm TRƯỚC sọ, rồi chỏm gáy */}
      {coToc && goc === 'sau' && <TocSau dau={d} cx={cx} cy={cyS} net={n} toc={k.toc} flip={flip} goc={goc} />}
      {coToc && <TocTruoc dau={d} cx={cx} cy={cyS} net={n} toc={k.toc} flip={flip} goc={goc} />}
      {k.phuKien === 'no' && (
        <g
          transform={`translate(${cx + (goc === 'nghieng' ? -0.22 : 0.42) * f * d} ${cyS - (goc === 'nghieng' ? 0.5 : 0.42) * d})`}
          fill={k.mauNhan ?? '#c0392b'}
          stroke={MUC}
          strokeWidth={n * 0.8}
          strokeLinejoin="round"
        >
          <path d={`M 0 0 l ${-0.14 * d} ${-0.08 * d} l 0 ${0.16 * d} z`} />
          <path d={`M 0 0 l ${0.14 * d} ${-0.08 * d} l 0 ${0.16 * d} z`} />
          <circle r={0.035 * d} />
        </g>
      )}
    </g>
  );
};

export const NhanVat: React.FC<NhanVatProps> = ({kieu, dau, x, y, dang = 'dung', mat, may, mieng, bien, rung, nhin = 0, flip, ma, moHoi, net, id, goc: gocProp, cam: camProp, tayVe = true}) => {
  const k = layKieu(kieu);
  const pc = layPhongCach(k);
  const d = dau * (k.co ?? 1);
  const n = net ?? tinhNet(d);
  const K = k.khung === 'phu' ? PHU : khungTiLe(CHINH, pc.tiLe);
  const tt0: TuThe = typeof dang === 'string' ? TU_THE[dang] ?? TU_THE.dung : dang;
  const goc: GocNhin = tt0.quayLung ? 'sau' : gocProp ?? 'truoc';
  const nghieng = goc === 'nghieng';
  // profile: dùng phần ghi đè `nghieng` của tư thế (tay/chân so le trước-sau)
  const tt: TuThe = nghieng && tt0.nghieng ? {...tt0, ...tt0.nghieng} : tt0;
  const cam = camProp ?? tt.cam;
  const seedGoc = bam(`${id ?? k.ten}:${typeof dang === 'string' ? dang : 'tt'}`);
  const bd = tayVe ? bienDoTayVe(d) : 0;

  // 'sau' = vẽ như trước rồi lật: tay phải của nhân vật hiện bên trái màn
  const lat = Boolean(flip) !== (goc === 'sau');

  const bay = (tt.bay ?? 0) * d;
  const yG = y - bay; // gót
  const hongY = yG + K.hong * d + (tt.hongHa ?? 0) * d;
  const xT = x + (tt.hongLech ?? 0) * d; // trục thân
  const hong: [number, number] = [xT, hongY];

  // cúi: profile xoay thân; góc khác rút ngắn thân theo cos
  const cui = tt.cui ?? 0;
  const coCui = nghieng ? 1 : Math.cos(rad(cui));
  /** y của một mốc thân (hệ số DAU trong khung) sau khi rút ngắn quanh hông */
  const tY = (k: number) => hongY + (k - K.hong) * d * coCui;

  // ── chân ─────────────────────────────────────────────────────────
  const chanDai = -K.hong * d * (tt.chanNgan ?? 1);
  const chanGocDo: Chan = tt.chan ?? {trai: 0, phai: 0};
  const chanGoc = (side: 1 | -1) => {
    const a = side === 1 ? chanGocDo.phai : chanGocDo.trai;
    const hx = xT + side * (nghieng ? 0.03 : 0.13) * d;
    const hy = hong[1];
    const fx = hx + Math.sin(rad(a)) * side * chanDai;
    const fy = hy + Math.cos(rad(a)) * chanDai;
    return {khop: [[hx, hy] as Diem, [fx, fy] as Diem], fx, fy, a};
  };
  const cT = chanGoc(-1);
  const cP = chanGoc(1);

  // ── thân ─────────────────────────────────────────────────────────
  const vaiY = tY(K.vai - (tt.vaiNang ?? 0));
  const camY = tY(K.cam);
  const soY = tY(K.soY) + (tt.coRut ?? 0) * d;
  const eoY = tY(K.eo);
  const hep = nghieng ? 0.62 : 1; // profile: thân hẹp
  const vaiR = K.vaiR * d * hep;
  const eoR = K.eoR * d * hep;
  const hongR = K.hongR * d * hep;
  const coR = K.coR * d;
  const lechThan = nghieng ? 0.02 * d : 0; // profile: ngực hơi nhô ra trước
  const thanDiem: Diem[] = [
    [xT - vaiR + lechThan, vaiY + 0.05 * d],
    [xT - vaiR * 0.85 + lechThan, vaiY - 0.01 * d],
    [xT - coR * 1.6 + lechThan, vaiY - 0.03 * d],
    [xT + coR * 1.6 + lechThan, vaiY - 0.03 * d],
    [xT + vaiR * 0.85 + lechThan, vaiY - 0.01 * d],
    [xT + vaiR + lechThan, vaiY + 0.05 * d],
    [xT + eoR + lechThan, eoY],
    [xT + hongR + lechThan, hong[1] + 0.06 * d],
    [xT - hongR + lechThan, hong[1] + 0.06 * d],
    [xT - eoR + lechThan, eoY],
  ];
  const than = duongKin(nhieuDuong(thanDiem, bd, seedGoc ^ bam('than'), true, 2));
  // quần: phần hông của thân (eo → hông) tô màu riêng, mép eo thành đường lưng quần
  const quan = pc.mauQuan
    ? duongKin(
        nhieuDuong(
          [
            [xT - eoR + lechThan, eoY],
            [xT + eoR + lechThan, eoY],
            [xT + hongR + lechThan, hong[1] + 0.06 * d],
            [xT - hongR + lechThan, hong[1] + 0.06 * d],
          ],
          bd,
          seedGoc ^ bam('quan'),
          true,
          2
        )
      )
    : null;

  // ── tay ──────────────────────────────────────────────────────────
  // profile: tay gần (phải) ở trục thân +0.02, tay xa (trái) lùi 0.06 DAU và vẽ sau thân
  const vaiX = (side: 1 | -1) => (nghieng ? xT + (side === 1 ? 0.02 : -0.06) * d : xT + side * vaiR * 0.92);
  const tayGoc = (side: 1 | -1) => chi(vaiX(side), vaiY + 0.06 * d, d, side === 1 ? tt.phai : tt.trai, side, K);
  const tT = tayGoc(-1);
  const tP = tayGoc(1);
  const sau = new Set<'trai' | 'phai'>(tt.sauThan ?? []);
  if (nghieng || goc === 'ba-phan-tu') sau.add('trai');

  // tay cầm đồ: tay có ban 'cam', ưu tiên phải
  const tayCam: 'trai' | 'phai' | null = cam ? (tt.phai.ban === 'cam' ? 'phai' : tt.trai.ban === 'cam' ? 'trai' : 'phai') : null;

  const veTay = (side: 1 | -1) => {
    const t = side === 1 ? tt.phai : tt.trai;
    const g = side === 1 ? tP : tT;
    const huong = (t.cang + (t.xoay ?? 0)) * side;
    const ten = side === 1 ? 'phai' : 'trai';
    // tay áo ngắn: tô màu áo lên nửa trên cánh tay (chỉ khi có mauAo)
    const tayAo = pc.mauAo
      ? ongTayVe([g.khop[0], [(g.khop[0][0] + g.khop[1][0]) / 2, (g.khop[0][1] + g.khop[1][1]) / 2]], bd, seedGoc ^ bam(`tay-${ten}`))
      : null;
    return (
      <g key={side}>
        <Ong d={ongTayVe(g.khop, bd, seedGoc ^ bam(`tay-${ten}`))} day={K.tayDay * d} net={n} />
        {tayAo && <path d={tayAo} fill="none" stroke={pc.mauAo} strokeWidth={K.tayDay * d} strokeLinecap="round" />}
        {cam && tayCam === ten && <DoCam ten={cam} dau={d} x={g.w[0]} y={g.w[1]} huong={huong} net={n} />}
        <BanTay dau={d} x={g.w[0]} y={g.w[1]} huong={huong} kieu={t.ban} net={n} lat={side === -1} />
      </g>
    );
  };

  const veChan = (c: ReturnType<typeof chanGoc>, side: 1 | -1) => (
    <g key={side}>
      <Ong d={ongTayVe(c.khop, bd, seedGoc ^ bam(`chan-${side}`))} day={K.chanDay * d} net={n} mau={pc.mauQuan} />
      <ellipse
        cx={c.fx + (nghieng ? 0.08 * d : side * 0.05 * d + (goc === 'ba-phan-tu' ? 0.03 * d : 0))}
        cy={c.fy}
        rx={nghieng ? 0.13 * d : goc === 'ba-phan-tu' ? 0.12 * d : K.banChan * 0.55 * d}
        ry={0.045 * d}
        fill={NEN}
        stroke={MUC}
        strokeWidth={n}
      />
    </g>
  );

  const flipT = lat ? `translate(${x} 0) scale(-1 1) translate(${-x} 0)` : undefined;
  const xoayCaT = tt.xoayCa || tt.doi ? `translate(${(tt.doi?.[0] ?? 0) * d} ${(tt.doi?.[1] ?? 0) * d}) rotate(${tt.xoayCa ?? 0} ${x} ${y})` : undefined;
  const thanXoay = (tt.than ?? 0) + (nghieng ? cui : 0);
  const thanT = thanXoay ? `rotate(${thanXoay} ${hong[0]} ${hong[1]})` : undefined;
  const dauT = tt.dau ? `rotate(${tt.dau} ${xT} ${camY})` : undefined;
  const coAo = goc !== 'sau';
  const lechCoAo = goc === 'ba-phan-tu' ? 0.06 * d : nghieng ? 0.1 * d : 0;

  return (
    <g transform={flipT}>
      <g transform={xoayCaT}>
        {/* chân: profile vẽ chân xa trước để chân gần đè lên */}
        {veChan(cT, -1)}
        {veChan(cP, 1)}

        <g transform={thanT}>
          {/* tay sau thân */}
          {sau.has('trai') && veTay(-1)}
          {sau.has('phai') && veTay(1)}
          {/* cổ: khối trắng + hai gạch */}
          <rect x={xT - coR + lechThan} y={camY - 0.02 * d} width={2 * coR} height={vaiY - camY + 0.06 * d} fill={NEN} />
          <line x1={xT - coR + lechThan} y1={camY} x2={xT - coR + lechThan} y2={vaiY} stroke={MUC} strokeWidth={n} strokeLinecap="round" />
          <line x1={xT + coR + lechThan} y1={camY} x2={xT + coR + lechThan} y2={vaiY} stroke={MUC} strokeWidth={n} strokeLinecap="round" />
          {/* thân */}
          <path d={than} fill={pc.mauAo ?? NEN} stroke={MUC} strokeWidth={n} strokeLinejoin="round" />
          {quan && <path d={quan} fill={pc.mauQuan} stroke={MUC} strokeWidth={n} strokeLinejoin="round" />}
          {/* cổ áo (không có khi quay lưng): v (gốc) | tron | so-mi */}
          {coAo && <CoAo x={xT + lechCoAo} y={vaiY} d={d} hep={hep} net={n} kieu={pc.coAo} mauAo={pc.mauAo} />}
          {coAo && k.phuKien === 'ca-vat' && (
            <path
              d={`M ${xT - 0.035 * d + lechCoAo} ${vaiY + 0.1 * d} l ${0.07 * d} 0 l ${0.02 * d} ${0.3 * d * coCui} l ${-0.055 * d} ${0.06 * d} l ${-0.055 * d} ${-0.06 * d} z`}
              fill={k.mauNhan ?? '#c0392b'}
              stroke={MUC}
              strokeWidth={n * 0.8}
              strokeLinejoin="round"
            />
          )}
          {coAo && k.phuKien === 'huy-hieu' && <circle cx={xT + 0.18 * d * hep + lechCoAo} cy={vaiY + 0.22 * d} r={0.05 * d} fill={k.mauNhan ?? '#b8d8f8'} stroke={MUC} strokeWidth={n * 0.8} />}
          {/* đầu */}
          <g transform={dauT}>
            <Dau kieu={k} dau={d} cx={xT + lechThan} cy={soY} net={n} mat={mat} may={may} mieng={mieng} bien={bien} rung={rung} nhin={nhin} ma={ma} moHoi={moHoi} goc={goc} tayVe={tayVe} id={id} />
          </g>
          {/* tay trước thân */}
          {!sau.has('trai') && veTay(-1)}
          {!sau.has('phai') && veTay(1)}
        </g>
      </g>
    </g>
  );
};
