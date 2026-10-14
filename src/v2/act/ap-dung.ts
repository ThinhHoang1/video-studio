import type {DienVien, HanhDong} from '../board/kieu-board';
import {phaTuThe, type TuThe} from '../rig/tu-the';
import {layTuThe} from './tu-the-may';
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
/**
 * Mốc act khai trong board LUÔN dùng TÊN tư thế (chuỗi) — board là JSON người
 * viết tay, không ai khai góc khớp ở đó. Chỉ TRẠNG THÁI TÍNH RA mới có thể là
 * một tư thế cụ thể (kết quả nội suy). Nên chặn lại kiểu `dang` về chuỗi ở đây.
 */
export type HanhDongAct = HanhDong & TrangThaiAct;

/**
 * TRẠNG THÁI VẼ — cái renderer thật sự nhận mỗi khung.
 *
 * Khác `TrangThaiAct` đúng một trường: `dang` ở đây có thể là một TƯ THẾ CỤ THỂ
 * (góc khớp) chứ không chỉ là tên trong thư viện. Mốc act khai trong board luôn
 * là tên — board là JSON viết tay, không ai khai góc khớp ở đó; còn tư thế cụ
 * thể là thứ TÍNH RA: nội suy giữa hai tư thế, cộng lớp sống. Tách hai kiểu để
 * không ai lỡ tay khai góc khớp vào board.
 */
export type TrangThaiVe = Omit<TrangThaiAct, 'dang'> & {
  dang?: string | TuThe;
  /** nén–giãn: hệ số bề ngang / bề dọc, neo ở chân. 1 là không biến dạng. */
  coNgang?: number;
  coDoc?: number;
};

const KHOA_GOC = ['dang', 'mat', 'may', 'mieng', 'nhin', 'x', 'y', 'flip', 'goc', 'cam', 'ma', 'moHoi'] as const;

/** gộp b vào a, bỏ qua trường undefined của b (JSON không có undefined, nhưng mẫu/thủ công viết tay có thể) */
/**
 * Gộp hai MỐC act (cả hai đều do board khai, `dang` là tên tư thế).
 * Tách khỏi `gop` bên dưới vì `gop` trả về trạng thái VẼ — ở đó `dang` có thể đã
 * thành góc khớp cụ thể, không nhét ngược vào danh sách mốc được.
 */
const gopMoc = (a: HanhDongAct, b: Partial<HanhDongAct>): HanhDongAct => {
  const ra: Record<string, unknown> = {...a};
  for (const [k, v] of Object.entries(b)) {
    if (k === 'tai' || v === undefined) continue;
    ra[k] = v;
  }
  return ra as HanhDongAct;
};

const gop = (a: TrangThaiVe, b: Partial<HanhDongAct>): TrangThaiVe => {
  const ra: Record<string, unknown> = {...a};
  for (const [k, v] of Object.entries(b)) {
    if (k === 'tai' || v === undefined) continue;
    ra[k] = v;
  }
  return ra as TrangThaiVe;
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
    theoFrame.set(f, cu ? {...gopMoc(cu, a), tai: cu.tai} : {...a});
  }
  for (const a of thuCong) {
    const f = frameCua(a.tai);
    const cu = theoFrame.get(f);
    theoFrame.set(f, cu ? {...gopMoc(cu, a), tai: cu.tai} : {...a});
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
const THO_BIEN = 0.009;
const tho = (t: number, mach: number) =>
  1 + THO_BIEN * Math.sin(2 * Math.PI * 0.27 * (Math.floor(t * 10) / 10) + mach);

/**
 * ── BẢNG THỜI GIAN RỜI RẠC + TRỄ PHA THEO KHỚP ──────────────────────────
 *
 * Hai thứ, và cả hai đều là cách hoạt hình vẽ tay làm việc.
 *
 * 1. BẢNG THỜI GIAN RỜI RẠC. Hoạ sĩ không vẽ mọi khung: họ vẽ hai khung chính
 *    rồi chèn BỐN khung giữa theo một bảng đã định. Nội suy liên tục mỗi khung
 *    một chút cho ra cảm giác trượt của phần mềm, không phải của tay người —
 *    và nó cũng xoá luôn chuyện giữ hình (đo được: giữ hình rơi từ 75% xuống
 *    39%, dưới hẳn mốc tham chiếu 60–80%). Bảng năm nấc dưới đây vừa trả lại
 *    khung giữ, vừa giữ được chuyển động.
 *
 *    Nấc thứ tư là 1.05 — VƯỢT QUÁ đích rồi mới lùi về. Đó là quán tính; bỏ nó
 *    thì cử động nào cũng dừng như cánh cửa tự đóng.
 *
 * 2. TRỄ PHA. Thân người không đổi tư thế cùng một lúc: hông dẫn, thân theo,
 *    đầu tới sau, cẳng tay sau nữa, bàn tay cuối cùng. Cho mọi khớp cùng một
 *    tỉ lệ pha thì cả người xoay như một miếng bìa. Đây là "follow-through và
 *    overlapping action" — nguyên lý hoạt hình, không phải mẹo.
 */
const CHART = [0, 0.5, 0.82, 1.05, 1];
/** Trễ bao nhiêu KHUNG so với thân, theo từng khớp. */
const TRE = {than: 0, chan: 0, canh: 1, dau: 2, cang: 2, ban: 3} as const;
/** Mỗi nấc giữ 3 khung → cú chuyển dài 15 khung, và trong đó có 12 khung giữ hình. */
const NAC_GIU = 3;

/** Tỉ lệ pha của một khớp tại `dt` khung sau cú đổi tư thế. */
const phaCua = (dt: number, khop: keyof typeof TRE): number => {
  const i = Math.floor((dt - TRE[khop]) / NAC_GIU);
  if (i < 0) return 0;
  if (i >= CHART.length) return 1;
  return CHART[i];
};

/** Cú chuyển coi như xong khi khớp trễ nhất đã chạy hết bảng. */
const CHUYEN_FRAME = TRE.ban + CHART.length * NAC_GIU;

/**
 * ── LỚP SỐNG ────────────────────────────────────────────────────────────
 *
 * Người thật KHÔNG BAO GIỜ đứng yên tuyệt đối: luôn có thở, đảo trọng tâm, đầu
 * trôi nhẹ, tay đưa đẩy. Bộ máy cũ chỉ có nhún thở ±0.35% chiều cao — nhỏ tới
 * mức mắt không đọc được là chuyển động, nên 40.5% số khung của phim đọc ra là
 * ảnh tĩnh.
 *
 * Bốn tần số dưới đây CỐ Ý không chia hết cho nhau (0.19 · 0.23 · 0.31 · 0.41).
 * Tổng của chúng không lặp lại trong bất kỳ shot nào — đó là chỗ khác nhau giữa
 * "có hiệu ứng idle" và "trông như người": hiệu ứng lặp thì mắt bắt được chu kỳ
 * và lại thấy máy móc.
 *
 * `pha` lệch theo diễn viên VÀ theo shot, để hai người trong khung không thở
 * cùng nhịp và một người không lặp y hệt nhịp cũ ở cảnh sau.
 */
const SONG = {than: 1.5, dau: 1.3, tay: 1.7, vai: 0.012};

const song = (tt: TuThe, t: number, pha: number): TuThe => {
  /**
   * LẤY MẪU TRÊN BA KHUNG. Lớp sống chạy liên tục từng khung cho ra chuyển động
   * mượt như phần mềm — và xoá sạch khung giữ, thứ làm nên chất vẽ tay (đo được:
   * giữ hình tụt còn 39%, dưới mốc tham chiếu 60–80%). Giữ mỗi hình ba khung là
   * "chạy trên ba", đúng nhịp hoạt hình truyền hình: vẫn sống, vẫn có khung giữ.
   */
  const tq = Math.floor(t * 30 / 3) * 3 / 30;
  const w = (f: number, lech: number) => Math.sin(2 * Math.PI * f * tq + pha + lech);
  return {
    ...tt,
    than: (tt.than ?? 0) + SONG.than * w(0.23, 0),
    dau: (tt.dau ?? 0) + SONG.dau * w(0.31, 1.1),
    vaiNang: (tt.vaiNang ?? 0) + SONG.vai * w(0.27, 0),
    trai: {...tt.trai, canh: tt.trai.canh + SONG.tay * w(0.19, 2.2), cang: tt.trai.cang + SONG.tay * 0.7 * w(0.41, 0.6)},
    phai: {...tt.phai, canh: tt.phai.canh + SONG.tay * w(0.19, 4.1), cang: tt.phai.cang + SONG.tay * 0.7 * w(0.41, 3.3)},
  };
};

/**
 * CHỚP MẮT. Người chớp 15–20 lần một phút; nhân vật không chớp lần nào thì đọc
 * ra là búp bê, dù mọi thứ khác có mượt tới đâu. Chu kỳ lệch theo `pha` nên hai
 * người trong khung không chớp cùng lúc — chớp đồng loạt còn quái hơn không chớp.
 */
const NHAY_DAI = 3 / 30;
const MAT_GIU_NGUYEN = new Set(['nham', 'xoan', 'chan', 'khe']);
const dangNhay = (t: number, pha: number): boolean => {
  const chuKy = 3.3 + (Math.abs(Math.sin(pha * 12.9898)) % 1) * 2.6;
  return ((t + pha * 1.7) % chuKy) < NHAY_DAI;
};

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
/**
 * GIỮ TỐI THIỂU cho một tư thế: 0.55 s.
 *
 * Vì sao: người xem chê "nhân vật giật giật ngáo ngáo". Đo lại bản bị chê thì
 * board có 103 mốc act mỗi phút — tức trung bình một tư thế mới mỗi 0.58 s, và
 * các tư thế đó lại không liên quan gì tới nhau (chỉ tay → khoanh tay → gãi đầu
 * trong hai giây). Hoạt hình vẽ tay giữ pose rồi mới đổi; đổi liên tục thì không
 * phải "nhiều animation", mà là co giật.
 *
 * Luật: mốc nào cách mốc TRƯỚC ĐÓ dưới ngưỡng thì bị BỎ QUA (giữ nguyên tư thế
 * cũ). Board vẫn khai dày được, renderer tự lọc — sửa ở đây rẻ hơn bắt mọi board
 * viết lại.
 *
 * HẠ 0.55 → 0.42 s từ khi có nội suy khớp: cái làm người xem thấy "giật giật
 * ngáo ngáo" hồi đó KHÔNG phải mật độ mốc, mà là mỗi mốc nhảy nguyên khối trong
 * một khung. Nhảy đã thành chuyển, nên giữ lâu nữa chỉ còn là đơ.
 */
const GIU_TOI_THIEU = 0.62;

const locMocQuaDay = (act: HanhDong[]): HanhDong[] => {
  const ra: HanhDong[] = [];
  let mocTruoc = -Infinity;
  for (const m of act) {
    const doiTuThe = m.dang !== undefined || m.goc !== undefined || m.cam !== undefined;
    // mốc chỉ dịch chuyển / mắt / miệng thì không tính là đổi tư thế, cho qua
    if (!doiTuThe) { ra.push(m); continue; }
    if (m.tai - mocTruoc < GIU_TOI_THIEU) continue;
    mocTruoc = m.tai;
    ra.push(m);
  }
  return ra;
};

/** Tư thế thật của một giá trị `dang` — tên thì tra bảng (cả bảng rig lẫn bảng
 *  mẫu máy), còn nếu nó đã là tư thế thì dùng luôn. */
const laTuThe = (d: string | TuThe | undefined): TuThe | null => (d === undefined ? null : layTuThe(d));

export const trangThaiTai = (actGoc: HanhDong[], goc: DienVien, t: number, mach = 0): TrangThaiVe => {
  const act = locMocQuaDay(actGoc);
  let s: TrangThaiVe = {hien: true, scale: 1, xoay: 0};
  for (const k of KHOA_GOC) {
    const v = goc[k];
    if (v !== undefined) s = {...s, [k]: v};
  }
  const ft = frameCua(t);
  let doiCuoi = 0; // frame của mốc gần nhất đã áp — để biết đã đứng yên bao lâu
  /** tư thế NGAY TRƯỚC cú đổi gần nhất, và frame xảy ra cú đổi đó — để nội suy */
  let dangTruoc: TuThe | null = laTuThe(s.dang);
  let frameDoiDang = -999;
  for (let i = 0; i < act.length; i++) {
    const a = act[i] as HanhDongAct;
    const fa = frameCua(a.tai);
    if (fa <= ft) {
      if (a.dang !== undefined && a.dang !== s.dang) {
        dangTruoc = laTuThe(s.dang);
        frameDoiDang = fa;
      }
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
  /**
   * NỘI SUY KHỚP khi vừa đổi tư thế. Đây là thay đổi lớn nhất của bộ máy: trước
   * dòng này, mọi cú đổi tư thế xảy ra trọn vẹn trong một khung hình.
   */
  const dangMoi = laTuThe(s.dang);
  if (dangMoi && dangTruoc && ft - frameDoiDang < CHUYEN_FRAME && ft >= frameDoiDang) {
    const dt = ft - frameDoiDang;
    s = {...s, dang: phaTuThe(dangTruoc, dangMoi, (khop) => phaCua(dt, khop))};
  }

  /**
   * ── NÉN – GIÃN CÓ DƯ CHẤN ───────────────────────────────────────────
   *
   * Nguyên lý số một của hoạt hình, và bộ máy này không hề có. Thân người có
   * khối lượng: đổi tư thế thì nó vươn lên rồi lún xuống rồi mới đứng yên, chứ
   * không đứng phắt vào dáng mới. Thiếu nó thì dù đã nội suy khớp, cử động vẫn
   * đọc ra là hình vẽ đang trượt chứ không phải người đang dồn sức.
   *
   * `exp(-4u)·cos(2π·1.6u)` là dao động TẮT DẦN: nảy mạnh ở cú đổi, còn một cái
   * nảy ngược nhỏ, rồi tắt trong 12 khung. Đây là cái đuôi mà mắt đọc ra là
   * "có trọng lượng". Neo ở CHÂN nên nhân vật không trôi khỏi mặt đất.
   */
  const dt = ft - frameDoiDang;
  if (dt >= 0 && dt < 12) {
    const e = Math.exp(-4 * (dt / 12)) * Math.cos(2 * Math.PI * 1.6 * (dt / 12));
    s = {...s, coDoc: 1 + 0.05 * e, coNgang: 1 - 0.04 * e};
  }

  // Lớp sống: chạy MỌI khung, kể cả đang trong cú chuyển — người thật vẫn thở
  // trong lúc giơ tay. Pha lệch theo diễn viên và theo mốc đổi gần nhất.
  if (goc.tho !== false) {
    const nen = laTuThe(s.dang);
    if (nen) s = {...s, dang: song(nen, t, mach * 1.9 + doiCuoi * 0.11)};
    s = {...s, scale: (s.scale ?? 1) * tho(t, mach)};
  }

  if (goc.tho !== false && !MAT_GIU_NGUYEN.has(String(s.mat ?? '')) && dangNhay(t, mach + 0.7)) {
    s = {...s, mat: 'nham'};
  }
  return s;
};

/** tiện: sinh act rồi tra luôn — dùng cho bảng thử, không dùng trong vòng render mỗi frame */
export const trangThaiDienVien = (dv: DienVien, dai: number, t: number): TrangThaiVe => trangThaiTai(sinhAct(dv, dai), dv, t);

/** mẫu có tồn tại không — cho validator (kiem-tra-v2) */
export const coMau = (ten: string): boolean => Boolean(MAU[ten]);
