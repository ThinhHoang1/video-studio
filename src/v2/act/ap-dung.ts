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

/**
 * Trạng thái diễn viên tại giây `t` trong shot: khai báo gốc của `goc` (DienVien)
 * ghi đè lần lượt bởi mọi mốc có frame(tai) <= frame(t). Snap: không nội suy.
 * Mặc định `hien: true`, `scale: 1`, `xoay: 0`.
 */
export const trangThaiTai = (act: HanhDong[], goc: DienVien, t: number): TrangThaiAct => {
  let s: TrangThaiAct = {hien: true, scale: 1, xoay: 0};
  for (const k of KHOA_GOC) {
    const v = goc[k];
    if (v !== undefined) s = {...s, [k]: v};
  }
  const ft = frameCua(t);
  for (const a of act) {
    if (frameCua(a.tai) <= ft) s = gop(s, a as HanhDongAct);
  }
  return s;
};

/** tiện: sinh act rồi tra luôn — dùng cho bảng thử, không dùng trong vòng render mỗi frame */
export const trangThaiDienVien = (dv: DienVien, dai: number, t: number): TrangThaiAct => trangThaiTai(sinhAct(dv, dai), dv, t);

/** mẫu có tồn tại không — cho validator (kiem-tra-v2) */
export const coMau = (ten: string): boolean => Boolean(MAU[ten]);
