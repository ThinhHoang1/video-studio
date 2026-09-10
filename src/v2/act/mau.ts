import type {TrangThaiMat, TrangThaiMay} from '../rig/mat';
import type {HinhMieng} from '../rig/mieng';
import type {GocNhin} from '../board/kieu-board';
import {W, frameCua, giayCua, PX_CHAY, PX_DI, GIU_CHAY, GIU_DI, VUOT, NGOAI_KHUNG, LUI_LAO} from './nhip';
import {POP_SCALE} from './camera';

/**
 * THƯ VIỆN MẪU HÀNH ĐỘNG — agent ghi `mau: "vao-chay"` trong DienVien, máy
 * bung thành chuỗi mốc `HanhDong` (snap từng frame). Không tween ở đâu cả:
 * mỗi mốc là một trạng thái rời, giữ nguyên tới mốc kế.
 *
 * Số liệu (docs/tham-chieu/timing.md, quy về 30 fps / 1080p):
 *   vào khung  = 1 frame key nghiêng ngoài khung + 1 frame vượt 1.5% + giữ
 *   ra khung   = 1 frame key nghiêng + 1 frame nửa người + biến
 *   chạy       = hình đổi mỗi 2 frame, vị trí trượt 36 px/frame (on ones)
 *   pop        = scale [0.08, 0.95, 1.045, 1] mỗi frame một
 *   run/boil   = ABAB chu kỳ 2 frame, dịch ~1 px
 *   hold       = 12 / 25 / 45 frame (p25 / p50 / p75)
 */

/** trạng thái rời của một diễn viên — mọi trường tuỳ chọn, chỉ ghi cái đổi */
export type TrangThaiAct = {
  dang?: string;
  mat?: TrangThaiMat;
  may?: TrangThaiMay;
  mieng?: HinhMieng;
  /** hướng nhìn -1..1 */
  nhin?: number;
  /** vị trí chân, tỉ lệ bề rộng khung (có thể < 0 hoặc > 1 = ngoài khung) */
  x?: number;
  /** vị trí chân, tỉ lệ chiều cao khung */
  y?: number;
  flip?: boolean;
  goc?: GocNhin;
  /** prop cầm tay phải; chuỗi rỗng = buông */
  cam?: string;
  /** hệ số phóng quanh chân (pop-in); 1 = bình thường */
  scale?: number;
  /** xoay cả người quanh chân (độ) */
  xoay?: number;
  ma?: boolean;
  moHoi?: boolean;
  /** false = không vẽ (chưa vào / đã ra khung) */
  hien?: boolean;
};

/** một mốc: giây tính từ đầu shot + trạng thái đổi tại đó */
export type MocAct = {tai: number} & TrangThaiAct;

export type ThamSoMau = Record<string, number | string>;
export type DauVaoMau = {
  /** giây bắt đầu mẫu trong shot */
  batDau: number;
  /** độ dài shot (giây) — mẫu lặp tới hết shot dùng số này */
  dai: number;
  /** vị trí chân khai trong board (tỉ lệ bề rộng khung) — đích của vao-*, gốc của ra-* */
  x: number;
  thamSo: ThamSoMau;
};
export type Mau = (p: DauVaoMau) => MocAct[];

type Huong = 'trai' | 'phai';
const CHAY = ['chay1', 'chay2', 'chay3'];
const DI = ['di1', 'di2'];
const GOC_THU_TU: GocNhin[] = ['truoc', 'ba-phan-tu', 'nghieng', 'sau'];

// ── đọc tham số ─────────────────────────────────────────────────────────
const so = (ts: ThamSoMau, k: string, macDinh: number): number => {
  const v = ts[k];
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v);
  return macDinh;
};
const chuoi = (ts: ThamSoMau, k: string, macDinh: string): string => {
  const v = ts[k];
  if (typeof v === 'string' && v !== '') return v;
  if (typeof v === 'number') return String(v);
  return macDinh;
};
const huongCua = (ts: ThamSoMau, macDinh: Huong): Huong => (chuoi(ts, 'huong', macDinh) === 'phai' ? 'phai' : 'trai');
/** mép gần hơn với chỗ đứng — mặc định cho vào/ra */
const mepGan = (x: number): Huong => (x > 0.5 ? 'phai' : 'trai');
const xMep = (h: Huong) => (h === 'trai' ? -NGOAI_KHUNG : 1 + NGOAI_KHUNG);
const mat = (ts: ThamSoMau, k: string, macDinh: TrangThaiMat) => chuoi(ts, k, macDinh) as TrangThaiMat;
const mieng = (ts: ThamSoMau, k: string, macDinh: HinhMieng) => chuoi(ts, k, macDinh) as HinhMieng;

// ── khối dựng chuỗi ─────────────────────────────────────────────────────
/** ẩn từ frame 0 tới lúc mẫu bắt đầu (vào khung) */
const anTruoc = (f0: number): MocAct[] => (f0 > 0 ? [{tai: 0, hien: false}] : []);

/** tới chỗ: 1 frame vượt VUOT theo chiều đi rồi 1 frame đúng chỗ, giữ */
const denCho = (f: number, x: number, chieu: 1 | -1, dang: string): MocAct[] => [
  {tai: giayCua(f), x: x + chieu * VUOT, dang},
  {tai: giayCua(f + 1), x, dang},
];

type Truot = {
  f0: number;
  tu: number;
  den: number;
  hinh: string[];
  /** frame giữ mỗi hình */
  giu: number;
  /** bước trượt mỗi frame (tỉ lệ khung) */
  buoc: number;
  /** 0 = frame đầu đứng tại `tu`; 1 = frame đầu đã bước một bước */
  batDauTu?: 0 | 1;
};
/**
 * Dãy frame trượt on-ones từ `tu` tới `den`: mọi frame đều CHƯA tới đích
 * (frame tới đích do `denCho`/`hien:false` đặt ngay sau), hình lặp mỗi `giu`
 * frame, mặt quay theo chiều đi. Trả n = số frame đã dùng.
 */
const truot = (d: Truot): {moc: MocAct[]; n: number; chieu: 1 | -1} => {
  const chieu: 1 | -1 = d.den >= d.tu ? 1 : -1;
  const k0 = d.batDauTu ?? 0;
  // trừ epsilon để 0.3 / 0.01875 = 16.000000000000004 không thành 17 frame
  const n = Math.max(1, Math.ceil(Math.abs(d.den - d.tu) / d.buoc - 1e-9) - k0);
  const flip = chieu < 0;
  const moc: MocAct[] = [];
  for (let j = 0; j < n; j++) {
    let xj = d.tu + chieu * (j + k0) * d.buoc;
    if (chieu > 0 ? xj > d.den : xj < d.den) xj = d.den;
    moc.push({tai: giayCua(d.f0 + j), hien: true, x: xj, dang: d.hinh[Math.floor(j / d.giu) % d.hinh.length], flip});
  }
  return {moc, n, chieu};
};

/** luân phiên các trạng thái mỗi `giu` frame từ f0 tới trước fCuoi; `ket` là trạng thái đặt tại fCuoi */
const luanPhien = (f0: number, fCuoi: number, hinh: TrangThaiAct[], giu: number, ket?: TrangThaiAct): MocAct[] => {
  const moc: MocAct[] = [];
  let i = 0;
  for (let f = f0; f < fCuoi; f += giu) moc.push({tai: giayCua(f), ...hinh[i++ % hinh.length]});
  if (ket) moc.push({tai: giayCua(Math.max(fCuoi, f0 + 1)), ...ket});
  return moc;
};

/** frame kết cho mẫu lặp: `lap` chu kỳ (mỗi chu kỳ = hinh.length × giu) hoặc tới hết shot */
const frameKet = (ts: ThamSoMau, f0: number, dai: number, chuKy: number): number => {
  const lap = so(ts, 'lap', 0);
  const het = Math.max(f0 + chuKy, frameCua(dai));
  return lap > 0 ? Math.min(het, f0 + Math.round(lap) * chuKy) : het;
};

// ── vào / ra khung ──────────────────────────────────────────────────────
const vaoTruot = (hinh: string[], giu: number, px: number): Mau => ({batDau, x, thamSo}) => {
  const huong = huongCua(thamSo, mepGan(x));
  const tu = so(thamSo, 'tu', xMep(huong));
  const buoc = (px * so(thamSo, 'tocDo', 1)) / W;
  const dang = chuoi(thamSo, 'dang', 'dung');
  const f0 = frameCua(batDau);
  const {moc, n, chieu} = truot({f0, tu, den: x, hinh, giu, buoc});
  return [...anTruoc(f0), ...moc, ...denCho(f0 + n, x, chieu, dang)];
};

const raTruot = (hinh: string[], giu: number, px: number): Mau => ({batDau, x, thamSo}) => {
  const huong = huongCua(thamSo, mepGan(x));
  const den = so(thamSo, 'den', xMep(huong));
  const buoc = (px * so(thamSo, 'tocDo', 1)) / W;
  const f0 = frameCua(batDau);
  const {moc, n} = truot({f0, tu: x, den, hinh, giu, buoc, batDauTu: 1});
  return [...moc, {tai: giayCua(f0 + n), hien: false}];
};

/**
 * lao vào: f0 key nghiêng (laoVao) với chân ĐÚNG MÉP khung (nửa người ngoài, đầu
 * ngả vào — pirate 5:14 f9) → f1 vượt 1.5% → f2 đúng chỗ. Nếu chỗ đứng sát mép
 * hơn LUI_LAO thì key lùi thêm ra ngoài để luôn có bước nhảy vào.
 */
const vaoLao: Mau = ({batDau, x, thamSo}) => {
  const huong = huongCua(thamSo, mepGan(x));
  const chieu: 1 | -1 = huong === 'trai' ? 1 : -1;
  const dang = chuoi(thamSo, 'dang', 'dung');
  const xKey = huong === 'trai' ? Math.min(0, x - LUI_LAO) : Math.max(1, x + LUI_LAO);
  const f0 = frameCua(batDau);
  return [
    ...anTruoc(f0),
    {tai: giayCua(f0), hien: true, dang: 'laoVao', x: so(thamSo, 'tu', xKey), flip: chieu < 0},
    ...denCho(f0 + 1, x, chieu, dang),
  ];
};

/** lao ra: f0 key nghiêng về mép → f1 nửa người ở mép → f2 biến */
const raLao: Mau = ({batDau, x, thamSo}) => {
  const huong = huongCua(thamSo, mepGan(x));
  const chieu: 1 | -1 = huong === 'trai' ? -1 : 1;
  const f0 = frameCua(batDau);
  return [
    {tai: giayCua(f0), dang: 'laoVao', x: x + chieu * 0.04, flip: chieu < 0},
    {tai: giayCua(f0 + 1), x: huong === 'trai' ? 0 : 1},
    {tai: giayCua(f0 + 2), hien: false},
  ];
};

/** pop: hiện với scale 0.08 → 0.95 → 1.045 → 1, mỗi frame một */
const pop: Mau = ({batDau, thamSo}) => {
  const f0 = frameCua(batDau);
  const dang = thamSo.dang !== undefined ? chuoi(thamSo, 'dang', 'dung') : undefined;
  return [
    ...anTruoc(f0),
    ...POP_SCALE.map((s, k): MocAct => ({tai: giayCua(f0 + k), hien: true, scale: s, ...(dang && k === 0 ? {dang} : {})})),
  ];
};

// ── phản ứng ────────────────────────────────────────────────────────────
/** giật mình: f0 mắt soc + bật lùi 0.02 (nhay1) → f1..2 soc-lon → f3 về chỗ, giữ soc */
const giatMinh: Mau = ({batDau, x, thamSo}) => {
  const huong = huongCua(thamSo, 'trai');
  const chieu = huong === 'trai' ? -1 : 1;
  const lui = so(thamSo, 'lui', 0.02);
  const dang = chuoi(thamSo, 'dang', 'haiTayXoe');
  const f0 = frameCua(batDau);
  return [
    {tai: giayCua(f0), mat: 'soc', mieng: 'o', dang: 'nhay1', x: x + chieu * lui},
    {tai: giayCua(f0 + 1), mat: 'soc-lon', mieng: 'hoang', dang},
    {tai: giayCua(f0 + 3), mat: 'soc', mieng: 'hoang', x},
  ];
};

/** ngã: f0 hình trung gian laoVao (1 frame) → f1 nga, giữ */
const nga: Mau = ({batDau, thamSo}) => {
  const huong = huongCua(thamSo, 'phai');
  const f0 = frameCua(batDau);
  return [
    {tai: giayCua(f0), dang: 'laoVao', flip: huong === 'trai'},
    {tai: giayCua(f0 + 1), dang: 'nga', mat: mat(thamSo, 'mat', 'nham'), mieng: mieng(thamSo, 'mieng', 'meu')},
  ];
};

/** lắc đầu: nhìn -0.6 / +0.6 luân phiên mỗi 5 frame, `lap` lần (3), rồi về 0 */
const lacDau: Mau = ({batDau, thamSo}) => {
  const bienDo = so(thamSo, 'bienDo', 0.6);
  const giu = Math.max(1, Math.round(so(thamSo, 'giu', 5)));
  const lap = Math.max(1, Math.round(so(thamSo, 'lap', 3)));
  const f0 = frameCua(batDau);
  return luanPhien(f0, f0 + 2 * lap * giu, [{nhin: -bienDo}, {nhin: bienDo}], giu, {nhin: 0});
};

/** gật gù: cuiNguoi / dung luân phiên mỗi 6 frame, `lap` lần (2), kết ở dung */
const gatGu: Mau = ({batDau, thamSo}) => {
  const giu = Math.max(1, Math.round(so(thamSo, 'giu', 6)));
  const lap = Math.max(1, Math.round(so(thamSo, 'lap', 2)));
  const cui = chuoi(thamSo, 'dangCui', 'cuiNguoi');
  const dung = chuoi(thamSo, 'dang', 'dung');
  const f0 = frameCua(batDau);
  return luanPhien(f0, f0 + 2 * lap * giu, [{dang: cui}, {dang: dung}], giu);
};

/** run: ABAB x ±1 px mỗi frame tới hết shot (hoặc `lap` chu kỳ), mắt khe; kết về chỗ */
const run: Mau = ({batDau, dai, x, thamSo}) => {
  const px = so(thamSo, 'px', 1);
  const m = mat(thamSo, 'mat', 'khe');
  const dang = thamSo.dang !== undefined ? chuoi(thamSo, 'dang', 'dung') : undefined;
  const f0 = frameCua(batDau);
  const fCuoi = frameKet(thamSo, f0, dai, 2);
  const A: TrangThaiAct = {x: x + px / W, mat: m, ...(dang ? {dang} : {})};
  const B: TrangThaiAct = {x: x - px / W};
  return luanPhien(f0, fCuoi, [A, B], 1, {x});
};

/** gõ bàn: ngoiGoBan / ngoi luân phiên mỗi 3 frame tới hết shot (hoặc `lap`), kết ở ngoi */
const goBan: Mau = ({batDau, dai, thamSo}) => {
  const giu = Math.max(1, Math.round(so(thamSo, 'giu', 3)));
  const f0 = frameCua(batDau);
  const fCuoi = frameKet(thamSo, f0, dai, 2 * giu);
  return luanPhien(f0, fCuoi, [{dang: 'ngoiGoBan'}, {dang: 'ngoi'}], giu, {dang: 'ngoi'});
};

/** nhìn quanh: nhìn -0.8 → 0 → 0.8 mỗi 8 frame, `lap` lần (1), rồi về 0 */
const nhinQuanh: Mau = ({batDau, thamSo}) => {
  const bienDo = so(thamSo, 'bienDo', 0.8);
  const giu = Math.max(1, Math.round(so(thamSo, 'giu', 8)));
  const lap = Math.max(1, Math.round(so(thamSo, 'lap', 1)));
  const f0 = frameCua(batDau);
  return luanPhien(f0, f0 + 3 * lap * giu, [{nhin: -bienDo}, {nhin: 0}, {nhin: bienDo}], giu, {nhin: 0});
};

/** cười lăn: mắt cung + omBung giữ `giu` frame (12) → 1 frame laoVao → nga, vẫn cười */
const cuoiLan: Mau = ({batDau, thamSo}) => {
  const giu = Math.max(2, Math.round(so(thamSo, 'giu', 12)));
  const f0 = frameCua(batDau);
  return [
    {tai: giayCua(f0), mat: 'cung', mieng: 'cuoi-toe', dang: 'omBung'},
    {tai: giayCua(f0 + giu), dang: 'laoVao'},
    {tai: giayCua(f0 + giu + 1), dang: 'nga', mat: 'cung', mieng: 'cuoi-toe'},
  ];
};

/** ngủ gật: ngoi mắt chan → sau `sau` frame (12) ngoiGuc mắt nham; `lap` > 1 thì gật gà luân phiên. Chữ zzz do board */
const nguGat: Mau = ({batDau, thamSo}) => {
  const sau = Math.max(1, Math.round(so(thamSo, 'sau', 12)));
  const lap = Math.max(1, Math.round(so(thamSo, 'lap', 1)));
  const f0 = frameCua(batDau);
  const thuc: TrangThaiAct = {dang: 'ngoi', mat: 'chan', mieng: 'thang'};
  const guc: TrangThaiAct = {dang: 'ngoiGuc', mat: 'nham', mieng: 'X'};
  return luanPhien(f0, f0 + (2 * lap - 1) * sau, [thuc, guc], sau, guc);
};

/** viết bảng: vietBang / vietBang2 luân phiên mỗi 4 frame tới hết shot (hoặc `lap`), góc nhìn sau */
const vietBang: Mau = ({batDau, dai, thamSo}) => {
  const giu = Math.max(1, Math.round(so(thamSo, 'giu', 4)));
  const f0 = frameCua(batDau);
  const fCuoi = frameKet(thamSo, f0, dai, 2 * giu);
  return luanPhien(f0, fCuoi, [{dang: 'vietBang', goc: 'sau'}, {dang: 'vietBang2', goc: 'sau'}], giu);
};

/** quay lại: đổi góc nhìn từng nấc truoc → ba-phan-tu → nghieng → sau, 1 frame mỗi hình, giữ ở `den` */
const quayLai: Mau = ({batDau, thamSo}) => {
  const idx = (k: string, macDinh: number) => {
    const i = GOC_THU_TU.indexOf(chuoi(thamSo, k, GOC_THU_TU[macDinh]) as GocNhin);
    return i === -1 ? macDinh : i;
  };
  const i0 = idx('tu', 0);
  const i1 = idx('den', 2);
  const f0 = frameCua(batDau);
  if (i0 === i1) return [{tai: giayCua(f0), goc: GOC_THU_TU[i1]}];
  const buoc = i1 > i0 ? 1 : -1;
  const moc: MocAct[] = [];
  for (let i = i0 + buoc, k = 0; buoc > 0 ? i <= i1 : i >= i1; i += buoc, k++) moc.push({tai: giayCua(f0 + k), goc: GOC_THU_TU[i]});
  return moc;
};

// ── di chuyển trong khung ───────────────────────────────────────────────
/** đi bộ từ x tới `den` (tỉ lệ khung): di1/di2 mỗi 4 frame, 14 px/frame, tới nơi đứng thẳng */
const diBo: Mau = ({batDau, x, thamSo}) => {
  const den = so(thamSo, 'den', Math.min(0.9, x + 0.25));
  const buoc = (PX_DI * so(thamSo, 'tocDo', 1)) / W;
  const dang = chuoi(thamSo, 'dang', 'dung');
  const f0 = frameCua(batDau);
  const {moc, n} = truot({f0, tu: x, den, hinh: DI, giu: GIU_DI, buoc, batDauTu: 1});
  return [...moc, {tai: giayCua(f0 + n), x: den, dang}];
};

/** chạy từ x tới `den`: chay1/2/3 mỗi 2 frame, 36 px/frame, tới nơi vượt 1.5% rồi đứng */
const chayDen: Mau = ({batDau, x, thamSo}) => {
  const den = so(thamSo, 'den', Math.min(0.9, x + 0.3));
  const buoc = (PX_CHAY * so(thamSo, 'tocDo', 1)) / W;
  const dang = chuoi(thamSo, 'dang', 'dung');
  const f0 = frameCua(batDau);
  const {moc, n, chieu} = truot({f0, tu: x, den, hinh: CHAY, giu: GIU_CHAY, buoc, batDauTu: 1});
  return [...moc, ...denCho(f0 + n, den, chieu, dang)];
};

/** nhảy mừng: nhay1/nhay2 mỗi 3 frame, `lap` lần (3), mắt cung, kết gioTay */
const nhayMung: Mau = ({batDau, thamSo}) => {
  const giu = Math.max(1, Math.round(so(thamSo, 'giu', 3)));
  const lap = Math.max(1, Math.round(so(thamSo, 'lap', 3)));
  const f0 = frameCua(batDau);
  return luanPhien(
    f0,
    f0 + 2 * lap * giu,
    [{dang: 'nhay1', mat: 'cung', mieng: 'cuoi-toe'}, {dang: 'nhay2', mat: 'cung', mieng: 'cuoi-toe'}],
    giu,
    {dang: chuoi(thamSo, 'dang', 'gioTay')},
  );
};

export const MAU: Record<string, Mau> = {
  'vao-chay': vaoTruot(CHAY, GIU_CHAY, PX_CHAY),
  'ra-chay': raTruot(CHAY, GIU_CHAY, PX_CHAY),
  'vao-di': vaoTruot(DI, GIU_DI, PX_DI),
  'ra-di': raTruot(DI, GIU_DI, PX_DI),
  'vao-lao': vaoLao,
  'ra-lao': raLao,
  pop,
  'giat-minh': giatMinh,
  nga,
  'lac-dau': lacDau,
  'gat-gu': gatGu,
  run,
  'go-ban': goBan,
  'nhin-quanh': nhinQuanh,
  'cuoi-lan': cuoiLan,
  'ngu-gat': nguGat,
  'viet-bang': vietBang,
  'quay-lai': quayLai,
  'di-bo': diBo,
  'chay-den': chayDen,
  'nhay-mung': nhayMung,
};

export const TEN_MAU = Object.keys(MAU);

/** mô tả cho thư viện / validator / agent — khoá phải khớp MAU */
export const MAU_MO_TA: Record<keyof typeof MAU, {moTa: string; thamSo: string; dungKhi: string}> = {
  'vao-chay': {moTa: 'chạy từ mép vào chỗ đứng x; hình chạy đổi mỗi 2 frame, trượt 36 px/frame; tới nơi vượt 1.5% một frame rồi đứng', thamSo: 'tai, huong (trai|phai, mặc định mép gần), tu (x xuất phát), tocDo (1), dang (dung)', dungKhi: 'nhân vật xuất hiện vội, đến muộn, đuổi theo'},
  'ra-chay': {moTa: 'từ x chạy ra mép rồi biến', thamSo: 'tai, huong, den (x kết), tocDo', dungKhi: 'bỏ chạy, trốn, đi gấp'},
  'vao-di': {moTa: 'đi bộ từ mép vào chỗ x; hình đi đổi mỗi 4 frame, 14 px/frame', thamSo: 'tai, huong, tu, tocDo, dang', dungKhi: 'vào lớp, đi tới bàn, xuất hiện bình thường'},
  'ra-di': {moTa: 'đi bộ từ x ra mép rồi biến', thamSo: 'tai, huong, den, tocDo', dungKhi: 'rời đi bình thường'},
  'vao-lao': {moTa: '1 frame key nghiêng chân đúng mép (nửa người ngoài khung) → 1 frame vượt 1.5% → đứng', thamSo: 'tai, huong, tu (x của key, mặc định mép), dang', dungKhi: 'xông vào, xuất hiện đột ngột có lực'},
  'ra-lao': {moTa: '1 frame key nghiêng → 1 frame nửa người ở mép → biến', thamSo: 'tai, huong', dungKhi: 'lao ra khỏi cảnh, bỏ đi tức tối'},
  pop: {moTa: 'hiện tại chỗ với scale 0.08 → 0.95 → 1.045 → 1 (4 frame) rồi giữ', thamSo: 'tai, dang', dungKhi: 'nhân vật/ý nghĩ bật ra; mặc định của renderer là pop 1 frame nên chỉ dùng khi muốn nảy'},
  'giat-minh': {moTa: 'f0 mắt soc + bật lùi 0.02 khung (nhay1) → 2 frame soc-lon → về chỗ, giữ soc + hoang', thamSo: 'tai, huong (chiều lùi, mặc định trai), lui (0.02), dang (haiTayXoe)', dungKhi: 'bị gọi bất ngờ, phát hiện điều sốc'},
  nga: {moTa: 'dung → 1 frame laoVao → nga (ngồi bệt, chân hếch), giữ', thamSo: 'tai, huong (phai), mat (nham), mieng (meu)', dungKhi: 'vấp, bị đẩy, sụp đổ tinh thần'},
  'lac-dau': {moTa: 'nhìn -0.6 / +0.6 luân phiên mỗi 5 frame × 3 rồi về 0', thamSo: 'tai, bienDo (0.6), giu (5), lap (3)', dungKhi: 'không đồng ý, thất vọng nhẹ, "không không không"'},
  'gat-gu': {moTa: 'cuiNguoi / dung luân phiên mỗi 6 frame × 2', thamSo: 'tai, giu (6), lap (2), dangCui, dang', dungKhi: 'đồng ý, "ừ ừ", nghe giảng'},
  run: {moTa: 'ABAB x ±1 px mỗi frame tới hết shot, mắt khe; kết về chỗ', thamSo: 'tai, px (1), mat (khe), dang, lap', dungKhi: 'sợ, lạnh, tức đến run; bật ≤ 20% shot'},
  'go-ban': {moTa: 'ngoiGoBan / ngoi luân phiên mỗi 3 frame tới hết shot', thamSo: 'tai, giu (3), lap', dungKhi: 'sốt ruột chờ, bực trong lớp'},
  'nhin-quanh': {moTa: 'nhìn -0.8 → 0 → 0.8 mỗi 8 frame rồi về 0', thamSo: 'tai, bienDo (0.8), giu (8), lap (1)', dungKhi: 'tìm ai, kiểm tra có ai thấy không'},
  'cuoi-lan': {moTa: 'mắt cung + omBung 12 frame → 1 frame laoVao → nga, vẫn cười toe', thamSo: 'tai, giu (12)', dungKhi: 'cười lăn lộn, punchline'},
  'ngu-gat': {moTa: 'ngoi mắt chan → sau 12 frame ngoiGuc mắt nham; lap > 1 thì gật gà. Chữ zzz do board', thamSo: 'tai, sau (12), lap (1)', dungKhi: 'buồn ngủ trong lớp, chán'},
  'viet-bang': {moTa: 'vietBang / vietBang2 luân phiên mỗi 4 frame tới hết shot, quay lưng', thamSo: 'tai, giu (4), lap', dungKhi: 'thầy/cô giảng bài, nhân vật ghi bảng'},
  'quay-lai': {moTa: 'đổi góc nhìn từng nấc truoc → ba-phan-tu → nghieng (→ sau), 1 frame mỗi hình, giữ', thamSo: 'tai, tu (truoc), den (nghieng)', dungKhi: 'nghe tiếng gọi quay lại, nhìn sang bên; renderer phải hỗ trợ goc'},
  'di-bo': {moTa: 'đi bộ từ x tới den trong khung, 14 px/frame, tới nơi đứng', thamSo: 'tai, den (x + 0.25), tocDo, dang', dungKhi: 'đổi chỗ trong cảnh, tới gần ai'},
  'chay-den': {moTa: 'chạy từ x tới den trong khung, 36 px/frame, tới nơi vượt 1.5% rồi đứng', thamSo: 'tai, den (x + 0.3), tocDo, dang', dungKhi: 'lao tới ai/vật gì trong cảnh'},
  'nhay-mung': {moTa: 'nhay1 / nhay2 mỗi 3 frame × 3, mắt cung, kết gioTay', thamSo: 'tai, giu (3), lap (3), dang (gioTay)', dungKhi: 'vui sướng, ăn mừng, được điểm cao'},
};
