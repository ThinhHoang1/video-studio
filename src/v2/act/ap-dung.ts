import type {DienVien, HanhDong} from '../board/kieu-board';
import {MAU, type MocAct, type TrangThaiAct, type ThamSoMau} from './mau';
import {frameCua} from './nhip';

/**
 * Áp mẫu hành động vào diễn viên và tra trạng thái tại một thời điểm.
 *
 * Renderer (src/v2/phim/san-khau.tsx) chỉ cần:
 *   const act = sinhAct(dv, shot.len / FPS);      // một lần cho mỗi diễn viên
 *   const s = trangThaiTai(act, dv, frame / FPS); // mỗi frame
 * rồi vẽ NhanVat theo `s` (dang/mat/may/mieng/nhin/x/flip/hien/scale/goc/cam).
 * Không interpolate: trạng thái là mốc cuối cùng có tai <= t.
 */

/** HanhDong của board mở rộng thêm các trường máy sinh (hien, scale, xoay, y) */
export type HanhDongAct = HanhDong & TrangThaiAct;

const KHOA_GOC = ['dang', 'mat', 'may', 'mieng', 'nhin', 'x', 'y', 'flip', 'goc', 'cam', 'ma', 'moHoi'] as const;

/** gộp b vào a, bỏ qua trường undefined của b (JSON không có undefined, nhưng mẫu/thủ công viết tay có thể) */
const gop = (a: TrangThaiAct, b: Partial<HanhDongAct>): TrangThaiAct => {
  const ra: Record<string, unknown> = {...a};
  for (const [k, v] of Object.entries(b)) {
    if (k === 'tai' || v === undefined) continue;
    ra[k] = v;
  }
  return ra as TrangThaiAct;
};

const sapTheoTai = (a: {tai: number}, b: {tai: number}) => frameCua(a.tai) - frameCua(b.tai);

/** giây bắt đầu mẫu: `mau_tham_so.tai` (mặc định 0) */
const batDauCua = (ts: ThamSoMau): number => {
  const v = ts.tai;
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : 0;
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

/**
 * Chuỗi hành động đầy đủ của một diễn viên trong shot dài `dai` giây:
 * mẫu `dv.mau` (nếu có trong MAU) bung ra rồi TRỘN với `dv.act` thủ công.
 * Trùng mốc (cùng frame) → gộp trường, thủ công thắng. Kết quả sắp theo `tai`.
 * `dv.mau` không có trong MAU → chỉ trả act thủ công (đã sắp).
 */
export const sinhAct = (dv: DienVien, dai: number): HanhDongAct[] => {
  const thuCong: HanhDongAct[] = [...(dv.act ?? [])];
  const mau = dv.mau ? MAU[dv.mau] : undefined;
  if (!mau) return thuCong.sort(sapTheoTai);

  const thamSo: ThamSoMau = dv.mau_tham_so ?? {};
  const tuDong: MocAct[] = mau({batDau: batDauCua(thamSo), dai, x: dv.x, thamSo});

  const theoFrame = new Map<number, HanhDongAct>();
  for (const a of tuDong) {
    const f = frameCua(a.tai);
    const cu = theoFrame.get(f);
    theoFrame.set(f, cu ? {...gop(cu, a), tai: cu.tai} : {...a});
  }
  for (const a of thuCong) {
    const f = frameCua(a.tai);
    const cu = theoFrame.get(f);
    theoFrame.set(f, cu ? {...gop(cu, a), tai: cu.tai} : {...a});
  }
  return [...theoFrame.values()].sort(sapTheoTai);
};

/** trường LIÊN TỤC — chỉ những trường này mới nội suy được khi mốc khai `chuyen: 'truot'` */
const KHOA_TRUOT = ['x', 'y', 'scale', 'xoay', 'nhin'] as const;

/** ease-in-out bậc 2: chậm ở hai đầu, nhanh ở giữa — giống đà của tay vẽ, không phải tuyến tính máy móc */
const dan = (u: number) => (u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2);

/**
 * NHỊP THỞ khi đứng yên. Trả hệ số scale quanh 1.
 *
 * Vì sao cần: một shot 2 s mà diễn viên chỉ có 1 mốc act thì 60 frame y hệt nhau —
 * mắt người đọc ngay ra là ảnh tĩnh có tiếng. Nhún ±0.35% chiều cao, giữ mỗi hình
 * 5 frame (on-fives) nên vẫn là hoạt hình vẽ tay, không thành tween mượt kiểu 3D.
 * `mach` lệch theo chỉ số diễn viên để hai người trong khung không thở cùng nhịp.
 */
const THO_BIEN = 0.0035;
const THO_GIU = 5;
const tho = (t: number, mach: number) => 1 + THO_BIEN * Math.sin((Math.floor(t * 30 / THO_GIU) + mach) * 0.9);

/**
 * Trạng thái diễn viên tại giây `t` trong shot: khai báo gốc của `goc` (DienVien)
 * ghi đè lần lượt bởi mọi mốc có frame(tai) <= frame(t).
 *
 * MẶC ĐỊNH VẪN SNAP — tư thế, mắt, miệng đổi tức thì 1 frame, đó là ngữ pháp của
 * phong cách này. Hai ngoại lệ có chủ đích, cả hai đều chỉ chạm trường liên tục:
 *   1. mốc khai `chuyen: 'truot'` → nội suy x/y/scale/xoay/nhin từ mốc TRƯỚC tới
 *      mốc đó, ease-in-out. Trước đây đổi `x` là nhảy cóc một frame, nhìn giật;
 *      giờ nhân vật lướt sang thật.
 *   2. `goc.tho !== false` → nhún thở khi đứng yên, biên độ 0.35%.
 * Mặc định `hien: true`, `scale: 1`, `xoay: 0`.
 */
export const trangThaiTai = (act: HanhDong[], goc: DienVien, t: number, mach = 0): TrangThaiAct => {
  let s: TrangThaiAct = {hien: true, scale: 1, xoay: 0};
  for (const k of KHOA_GOC) {
    const v = goc[k];
    if (v !== undefined) s = {...s, [k]: v};
  }
  const ft = frameCua(t);
  let doiCuoi = 0; // frame của mốc gần nhất đã áp — để biết đã đứng yên bao lâu
  for (let i = 0; i < act.length; i++) {
    const a = act[i] as HanhDongAct;
    const fa = frameCua(a.tai);
    if (fa <= ft) {
      s = gop(s, a);
      doiCuoi = fa;
      continue;
    }
    // mốc TƯƠNG LAI gần nhất: nếu nó khai `truot` thì ta đang ở giữa quãng trượt
    if (a.chuyen === 'truot') {
      const tu = doiCuoi;
      const den = fa;
      if (den > tu) {
        const u = dan(Math.min(1, Math.max(0, (ft - tu) / (den - tu))));
        for (const k of KHOA_TRUOT) {
          const dich = a[k];
          if (typeof dich !== 'number') continue;
          const goc0 = typeof s[k] === 'number' ? (s[k] as number) : k === 'scale' ? 1 : 0;
          s = {...s, [k]: goc0 + (dich - goc0) * u};
        }
      }
    }
    break;
  }
  if (goc.tho !== false && ft - doiCuoi >= 12) s = {...s, scale: (s.scale ?? 1) * tho(t, mach)};
  return s;
};

/** tiện: sinh act rồi tra luôn — dùng cho bảng thử, không dùng trong vòng render mỗi frame */
export const trangThaiDienVien = (dv: DienVien, dai: number, t: number): TrangThaiAct => trangThaiTai(sinhAct(dv, dai), dv, t);

/** mẫu có tồn tại không — cho validator (kiem-tra-v2) */
export const coMau = (ten: string): boolean => Boolean(MAU[ten]);
