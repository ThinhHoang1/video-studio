# Thiết kế repo V2 — storytime animation bằng code

> **Trạng thái thực thi (2026-09-10).** Thiết kế này do workflow nghiên cứu sinh ra song song với việc code.
> Phần ĐÃ DỰNG và render được (`media/outbound/demo-v2.mp4`): rig `src/v2/rig/`, schema board `src/v2/board/kieu-board.ts`
> (board là `src/projects/<du-an>/board.json`), renderer `src/v2/phim/`, prop/chữ/insert `src/v2/props`, `src/v2/chu.tsx`,
> `src/v2/insert.tsx`, pipeline `pipeline/lipsync.mjs` + `kiem-tra-v2.mjs` + `thu-vien-v2.json`.
> Khác với tài liệu: **giữ FPS = 30** (không đổi sang 24, để V1 và lip-sync 30 fps dùng chung), neo mốc `say` ở mức từ theo
> voice.json (không dùng cú pháp `@từ`), tên trạng thái mắt/miệng là tên tiếng Việt trong `mat.tsx`/`mieng.tsx`.
> Khi hai bên lệch nhau, MÃ NGUỒN là chuẩn; tài liệu này là lý do và số liệu đằng sau các quyết định.
> Ảnh minh chứng đã chép từ scratchpad sang `docs/tham-chieu/`.


Tài liệu thiết kế để **bốn dev code song song không hỏi lại**. Mọi con số ở đây
đều truy được về `docs/nghien-cuu-storytime.md` (viết tắt **NC §x**) hoặc về một
script đo ghi rõ đường dẫn. Chỗ nào V2 **cố ý khác** tham chiếu thì ghi rõ lý do.
Bản này là bản **sau phản biện 2026-09-10** (ba góc: khả thi · trung thành với tham
chiếu · agent lái được); mọi vấn đề mức "chặn" và "lớn" đã được sửa vào thân bài
hoặc bác bỏ có lý do ở mục **"Phản biện đã xét"** cuối tài liệu.

Giữ nguyên những gì đã tốt: `pipeline/gemini-tts.mjs` + `tts-gemini.mjs` (xoay key ×
model, `.sig`), `analyze-voice.mjs` (`am/nhan/nghi` — X∩nghi = 1,00), `render-segments.sh`
(đoạn + cache + concat), nhạc CC BY + `sfx.py`, hệ đơn vị `DAU` gốc ở chân, tách
`kieu / hinh / tu-the / vẽ`, `src/engine/neo.ts` (dò `say` theo ký tự trên **toàn** lời
bình — cơ chế đúng, chỉ độ phân giải sai: xem b.4).

**Không giữ nguyên nữa** (khác bản trước): `cueTimings` theo cụm 7 từ làm mốc thời
gian — đo thật lệch trung vị 0,55–0,78 s so với tiếng (b.4), V2 dùng mốc **cấp từ**
được **căn lại theo X-run của rhubarb**.

Nhân vật là **thiết kế gốc** của repo (§c.0): học nguyên tắc (đầu to, nét đều, hai
mảng tô, mắt oval, hold), không sao chép hình dáng của Jaiden.

---

## Mục lục

- 0. **Đối soát với mã đã có trong `src/v2/`** — đọc trước; §0.2 là **diff schema duy nhất**
- a. Nguyên tắc thẩm mỹ
- b. Schema bảng phân cảnh (một phương ngữ = `kieu-board.ts`; ví dụ đầy đủ một chương)
- c. Rig nhân vật V2
- d. Hệ chuyển động trong shot (`act.ts`, vào/ra, đi, cầm, chữ)
- e. Pipeline
- f. Thư viện `thu-vien.json` v2 và cách agent chọn
- g. Kế hoạch thực thi, chia 4 dev, tiêu chí nghiệm thu đo được
- h. Rủi ro và cách hạ
- Phụ lục — quyết định then chốt
- **Phản biện đã xét** — 36 mục, xử lý thế nào

> **Quy ước tên file trong a–h:** mọi đường dẫn viết trong tiêu đề mục là **vị trí
> thật** trên đĩa theo bố cục `src/v2/` (bản đồ g.8). Không còn `src/engine/core/*`,
> không còn `src/library/cast/*` cho V2.

---

## 0. Đối soát với mã đã có trong `src/v2/` (đọc lại 2026-09-10, lần 2)

Đối soát lần 1 (cùng ngày, sáng) đã lạc hậu trong vài giờ — vì vậy bước 0 thêm
`pipeline/doi-soat.mjs` in bảng này tự động (đếm prop, `tsc`, file tồn tại, số dòng,
`git status`), và Lead **chạy lại ngay trước khi spawn dev**.

Trạng thái đĩa lúc viết (đo bằng lệnh, không nhớ):

| Kiểm | Kết quả |
|---|---|
| `npx tsc --noEmit` | **exit 0** (không còn lỗi 3 module) |
| `src/v2/` | 23 file, **2.593 dòng**: `rig/` 8, `board/kieu-board.ts` 185 dòng, `phim/` 3, `props/` 6 (`co-ban, truong-hoc, do-vat, ngoai-troi, gag, index`), `chu.tsx` 197, `insert.tsx` 37, `dev/` 2 |
| Prop | `PROPS` = `TRUONG_HOC` 8 + `DO_VAT` 10 + `NGOAI_TROI` 5 + `GAG` 5 = **28/28 tên trong `PROP_TEN`** (`Record<TenProp,…>` nên thiếu là `tsc` đỏ — đã xanh). `cua, mua, sach, but, laptop` **đã có** |
| Chữ | `src/v2/chu.tsx` **đã có** `ChuTrenMan` 4 kiểu (`kem/the/nhan/tay`), `vao: tuc-thi/tung-tu/phong`, font `FONT` (Be Vietnam Pro) + Patrick Hand; `tung-tu` chia theo `cues` **cấp cụm** → phải đổi sang `neoTu` (d.6) |
| Insert | `src/v2/insert.tsx` **đã có** `AnhChen` nhưng theo thẩm mỹ cũ (viền 12 px, `boxShadow`, `xoay`, `co` 0,5, POP 3 frame) → viết lại theo d.7 |
| Lip-sync | `data/tinh-dau.mouth.json` **đã có** 14 chương, `fps 30, hold 1`, chưa `lead`; `demo-v2.mouth.json` có. Phải sinh lại **24 fps, lead 2, hold A/X ≥ 2** (e.3) |
| `du-lieu.ts` nạp bằng Node | **Chưa**: `node -e "import('./src/v2/phim/du-lieu.ts')"` → `Cannot find module '…/engine/theme'` (import không đuôi); sửa đuôi vẫn đứng vì kéo `cues.tsx` (React) → e.0 |
| FPS | `src/engine/theme.ts` `FPS = 30` dùng chung V1 (`Root.tsx` truyền `fps={FPS}` cho **mọi** composition) + `render-segments.sh` dòng 33 `const FPS = 30` hardcode; `du-lieu.ts`, `san-khau.tsx`, `chu.tsx` import `FPS` từ theme |
| `git status` | 11 M + 16 ?? = **27 mục** (không phải 17) |
| `CO_CANH` (`kieu-board.ts`) | `rong 200 / trung 330 / can 560 / sat 900 / nho 110`, cơ chế `chanY`; khác bảng cỡ của thiết kế cũ ở 4/5 cỡ → chốt một bảng ở §0.1 hàng "Cỡ cảnh" |
| `net()` (`rig/hinh.ts`) | `max(4.5, 0.015·DAU)` — khác A2 |
| `TU_THE` (`rig/tu-the.ts`) | 22 tư thế, khoá **camelCase** (`haiTayXoe`), trộn tên máy dùng (`nhay1, nhay2, laoVao`) |
| Validator | `pipeline/kiem-tra-v2.mjs` 392 dòng, mốc ước lượng theo tỉ lệ ký tự; board cài 23 lỗi (`$S/phan-bien/board-xau.json`) → **16 lọt, 4 chặn, 3 cảnh báo** |
| Đo neo | `$S/neo-test.mjs`: 15 `say` của ví dụ cũ → **12** `from` khác nhau (3 trùng = lỗi b.4-4); `$S/neo-tu-test.mjs` (neo cấp từ) → **15/15**; `$S/can-cue-test.mjs` (căn theo X-run rhubarb thật `$S/rh_test.json`): 9 ranh giới dấu câu lệch trung vị **0,55 s** trước căn, 1/9 trong 0,15 s; ghép được 7/9 |

Nhánh `src/v2/` **trùng ≈ 70 %** với thiết kế này. **Quyết định giữ: lấy `src/v2/` làm nhà,
không viết lại `src/library/cast/*`.** `kieu-board.ts` là **schema gốc và duy nhất**;
`board.schema.json` **sinh** từ nó (§0.2). Bảng dịch §0.3 của bản cũ **đã xoá** — không
còn phương ngữ thứ hai để dịch.

### 0.1 Bảng ánh xạ thành phần

| Thành phần | Đã có | Việc phải làm (dev) |
|---|---|---|
| Đơn vị, khung xương (c.1) | `rig/hinh.ts`: `CHINH` 2,6 DAU, `PHU` 3,6 DAU, khớp c.1 | `net()` → `clamp(3 + 0.012·DAU, 4.5, 16)` (Lead, bước 0, **cùng commit** với `CO_CANH`) |
| **Cỡ cảnh** | `CO_CANH` = 200/330/560/900/110, `chanY` | **Chốt một bảng** (b.5): `rong 230 · trung 380 · can 560 · sat 1000 · nho 150`, giữ cơ chế `chanY` (đơn giản hơn 4 neo), `chanY` tính lại theo b.5. Lead sửa `kieu-board.ts` bước 0. Mọi ngưỡng nét trong g viết dạng `netDay(CO_CANH[co].dau) ± 1` |
| Rig (c.6) | `rig/nhan-vat.tsx` vẽ thẳng px, `id` prefix | Tách trạng thái sang `src/v2/phim/act.ts` (thuần). Thêm **hướng đầu** `huong: truoc \| ba-phan-tu \| nghieng` (c.3) — bước 1, dev A |
| Mắt / mày (c.3) | `rig/mat.tsx` tên tiếng Việt `oval nho cham soc soc-lon khe cung gach xoan chan nham`; `may: khong tuc lo nhiu` | Dùng tên v2. **Oval chỉ cho `nguoi_ke`** (c.0). Toạ độ theo 3 hướng đầu |
| Miệng (c.3) | `rig/mieng.tsx`: `MIENG_LIPSYNC` 9 ký hiệu **X A B C D E F G H**, `MIENG_CAM_XUC` 12, `bien` 0/1 | `Shape = typeof MIENG_LIPSYNC[number]` (một nguồn). Biến thể nâng lên **3** (`bien` 0/1/2), đảo **mỗi frame** trong run. **Xoá** luật "rung 0,97–1,0 khi giữ ≥ 8 frame" |
| Sắc thái | không có `sac`; bộ ba `mat + may + mieng` | **Thêm lại `sac`** làm trường dữ liệu; bảng `SAC` ở `src/v2/rig/sac.ts`; `mat/may/mieng` chỉ để ghi đè (§0.2) |
| Bàn tay (c.5) | `rig/tay.tsx` 6 kiểu; cử chỉ = tư thế | Giữ. Không có trường `tay` trong board |
| Tư thế (c.6, d.3) | `rig/tu-the.ts` 22 | Khoá → **kebab-case** (`hai-tay-xoe`), tách `TU_THE_MAY` (`nhay-1 nhay-2 lao-vao di-a di-b chay-a chay-b`), `@dung_khi` JSDoc, `ALIAS` camelCase cũ trong `du-lieu.ts` (A + B) |
| Tóc (c.4) | `rig/toc.tsx` `{mau, mai, lon, sau}` | Giữ; thêm biến thể theo hướng đầu |
| Kiểu nhân vật (c.0, c.2) | `rig/kieu.ts` 9 kieu gắn `tinh-dau` | `KIEU` chỉ còn `trang` + dàn mẫu để test; nhân vật do board khai (`nhan_vat`, §0.2). Mặc định `mat: cham` cho mọi kieu ≠ `nguoi_ke` |
| Schema board | `board/kieu-board.ts` | **Nguồn duy nhất.** Diff §0.2 (B sửa type, C sinh schema + validator, D viết board). Chia file theo chương (b.1) |
| Resolver (b.4) | `phim/du-lieu.ts` `dungChuong()`: `say`→`neo()` cấp cụm, `tai` giây, `NGAN_NHAT` **bỏ** shot sát | Đổi sang `neoTu` + `canhCum` (cấp từ, căn X-run); **bỏ `Shot.tai`** khỏi schema agent; shot sát → dời + cảnh báo; beat tự động; `bo_cuc`; đường tắt `phan_ung`/`nhan` (B) |
| Miệng theo frame (b.7) | `miengTaiFrame()` đổi mẫu theo `mt.fps` | Giữ đổi mẫu; `bien` = `k % 3` (đảo mỗi frame) |
| Cử chỉ tự động khi nói | `san-khau.tsx` `CU_CHI_NOI` hash theo **cụm** | Mốc = đỉnh `nhan` (phân vị 70) của `voice24.json`, hold 8–27 f, tối đa 1 đổi/8 f; chọn theo bảng từ→cử chỉ rồi mới hash; áp cho **mọi** `noi: true` (d.8) |
| Vào/ra (d.2) | `vao: pop \| lao` | Thêm `act[].kieu: snap\|keys\|vao\|ra\|di`, `den_x`, `tu`. Pop-in mặc định **1 frame** |
| Chớp mắt | không có | **Giữ không có** (`BLINK.bat = false`). Bản cũ định thêm chớp 3–5 s — bác bỏ (TT-7) |
| Chữ (d.6) | `chu.tsx` đã có | Đổi `tung-tu` sang `neoTu`; bỏ `Chu.mau`; `tay` 0°; font chốt Be Vietnam Pro 800/900 + Patrick Hand (B) |
| Insert (d.7) | `insert.tsx` đã có (kiểu "ảnh dán") | Viết lại: full-frame căn giữa, không viền/bóng/xoay, hiện 1 frame (B). **Không** `an-du`, **không** `clip` |
| Props (f.1) | 28/28 | D thêm `vat-la` (khối nét + nhãn tay) và `cao_dau` cho từng prop; `co` đổi đơn vị (b.3) |
| Nền | `nen?: 'trang'` | **Bỏ trường** (chỉ có trắng). A1 sửa |
| Zoom bước (d.5) | `zoom_buoc: [[giây, z]]` scale SVG quanh tâm khung | Đổi thành **bước cỡ** `[[T, CoCanh]]`: đổi `dau` + `chanY` + `x` mặc định của cỡ mới, vẽ lại 1 frame. Bỏ hệ số z (TT-5) |
| Lip-sync pipeline (e.3) | `pipeline/lipsync.mjs` bước 1–5 | Thêm `dichSom(2)`, `holdToiThieu` chỉ A/X, `chenTrungGian`, **`canCue`** ghi `cues.json`, thống kê; `--fps` đọc `src/v2/fps.ts` (C) |
| Validator (e.4) | `kiem-tra-v2.mjs` mốc ước lượng | Import `cues.core.ts` (frame thật, cùng hàm phim); K4–K29; `ajv` + schema sinh; ≥ 25 board lỗi mẫu (C) |
| Thư viện (f.1) | `thu-vien-v2.mjs` sinh từ mã | Đổi tên đích → **`thu-vien.json`** (V1 đọc `thu-vien-v1.json`), mỗi entry `{mo_ta, dung_khi}`, mục `_may_dung` (C, bước 0) |
| **FPS 24** | `theme.ts FPS = 30` dùng chung | **Tách theo thế hệ**: `src/v2/fps.ts` `export const FPS = 24`; `theme.ts` giữ 30 cho V1 tới bước 5; `Root.tsx` truyền `fps` riêng từng composition; `render-segments.sh` đọc `fps + total` từ `meta.json` **cùng commit** (Lead, bước 0) |
| Meta / render theo chương (e.6, e.7) | `phim-v2.tsx` tính `total`; `render-segments.sh` bảng map | `pipeline/meta.mjs` dùng `du-lieu.ts` (đã thuần sau e.0) |
| `xem-thu.mjs`, `do-video.py`, `do-net.py`, `du-an-moi.mjs`, `doi-soat.mjs` | chưa có | (C) |
| Test sheet | `dev/rig-test.tsx`, `dev/props-test.tsx` | Thêm `dev/mieng-test.tsx`, `dev/act-test.tsx` |

### 0.2 Diff schema — danh sách DUY NHẤT, áp vào `src/v2/board/kieu-board.ts` (B sửa type; C sinh `board.schema.json` + validator)

Quy ước tên (AL-11): **khoá `snake_case`, giá trị `kebab-case`**. `du-lieu.ts` có `ALIAS`
đổi khoá/giá trị camelCase cũ (`tuDong→tu_dong`, `moHoi→mo_hoi`, `haiTayXoe→hai-tay-xoe`, …)
để `demo-v2/board.json` hiện có không hỏng; validator **cảnh báo** khi gặp alias.

```ts
// ── kiểu chung ──────────────────────────────────────────────────────────
+ export type T = number | `@${string}`;          // giây từ đầu shot, HOẶC "@từ" — neoTu lấy lần xuất hiện đầu ≥ shot.from (b.6)
+ export type Sac = 'thuong'|'vui'|'nghi'|'soc'|'tuc'|'buon'|'met'|'hoang'|'ngai'|'chan';   // bảng SAC ở rig/sac.ts
+ export type HuongDau = 'truoc' | 'ba-phan-tu' | 'nghieng';
+ export type BoCuc = 'mot' | 'hai-doi-dien' | 'ban' | 'lop' | 'hang-ngang';

// ── CO_CANH: một bảng (b.5) ─────────────────────────────────────────────
- rong: {dau: 200, chanY: 0.84}  trung: {dau: 330, chanY: 1.04}  can: {dau: 560, chanY: 1.5}  sat: {dau: 900, chanY: 2.2}  nho: {dau: 110, chanY: 0.66}
+ rong: {dau: 230, chanY: 0.92}  trung: {dau: 380, chanY: 1.21}  can: {dau: 560, chanY: 1.45}  sat: {dau: 1000, chanY: 2.38}  nho: {dau: 150, chanY: 0.66}
+ export const X_MAC_DINH: Record<CoCanh, number> = {rong: 0.5, trung: 0.55, can: 0.72, sat: 0.5, nho: 0.5};

// ── HanhDong ───────────────────────────────────────────────────────────
- tai: number;
+ tai: T;
+ kieu?: 'snap' | 'keys' | 'vao' | 'ra' | 'di';   // mặc định snap. KHÔNG có 'pop' (pop-in = 1 frame, không phải act)
+ den_x?: number;                                 // 'di' (đích) / 'vao' (chỗ đứng)
+ tu?: 'trai' | 'phai' | 'duoi' | 'tren';         // mép vào/ra
+ sac?: Sac;                                      // giải ra (mat, may, mieng) qua SAC; mat/may/mieng khai riêng = ghi đè
+ huong?: HuongDau;
+ cam?: string | null;                            // prop cầm; null = buông
- moHoi?: boolean;            + mo_hoi?: boolean;
  // KHÔNG thêm: vach (0/97 sự kiện tham chiếu có motion line), pop

// ── DienVien ───────────────────────────────────────────────────────────
- x: number;                  + x?: number;      // bắt buộc chỉ khi shot không có bo_cuc và > 1 diễn viên (K20)
+ sac?: Sac;
+ huong?: HuongDau;           // mặc định: truc-dien → 'truoc'; bo_cuc hai-doi-dien → 'ba-phan-tu'
+ cam?: string;
+ so_luong?: number;          // chỉ kieu 'trang'
- tuDong?: boolean;           + tu_dong?: boolean;   // mặc định TRUE cho mọi noi: true (d.8), không chỉ truc-dien
- moHoi?: boolean;            + mo_hoi?: boolean;
- vao?: 'pop' | 'lao';        // → act {tai: 0, kieu: 'vao'} ; alias giữ trong ALIAS
- toc?: {…}                   // → khai trong Board.nhan_vat

// ── Prop ───────────────────────────────────────────────────────────────
- x: number; y: number;       + x?: number; y?: number;   // bo_cuc đặt; khai tay = ghi đè
- co?: number  // 1 = cỡ chuẩn ở trung, nhân dau/330
+ co?: number;                // hệ số nhân lên cao_dau của prop; cao thật = co × cao_dau × CO_CANH[co].dau (b.3)
- tai?: number;               + tai?: T;
+ nhan?: string;              // chữ viết tay cạnh prop (kiểu 4 NC §7.1), bắt buộc với vat-la
+ hinh?: 'hop' | 'tru' | 'tron' | 'tam';   // chỉ vat-la
+ // PROP_TEN thêm 'vat-la'

// ── Chu ────────────────────────────────────────────────────────────────
- tai?: number;               + tai?: T;
- mau?: string;               // bỏ — A7 nhấn bằng cỡ, không bằng màu
+ nhan_manh?: string[];       // từ in to ×1,6
+ mui_ten?: `dien:${number}` | `prop:${number}`;

// ── Insert ─────────────────────────────────────────────────────────────
- co?: number; xoay?: number;  // bỏ — tham chiếu: ảnh thật che khung/căn giữa, không viền, không bóng
+ chu?: string;                // chú thích tay góc dưới (tuỳ chọn)
  // KHÔNG thêm kieu 'clip' / 'an-du' (Phản biện KT-8, TT-11)

// ── Shot ───────────────────────────────────────────────────────────────
- tai?: number;               // BỎ khỏi schema agent (giữ nội bộ ShotDung.from). Mọi mốc neo vào lời
  say?: string;               // bắt buộc trừ loai 'trong' không có say (→ đặt tại X-run kế) và shot sinh tự động
+ bo_cuc?: BoCuc;
+ beat?: boolean;             // false = không chèn beat tự động TRƯỚC shot này
+ phan_ung?: {kieu: string; sac: Sac; tai?: T; dai?: number};   // đường tắt: sinh shot phan-ung chèn SAU shot này
+ nhan?: string[];            // đường tắt: chuỗi shot chu.kieu 'nhan' 0,4–0,8 s / mục, tự neo @từ nếu có
- nen?: 'trang';              // bỏ trường — chỉ có nền trắng
- sfx?: string;               + sfx?: string | {tai: T; ten: string}[];
- zoom_buoc?: [number, number][];   + zoom_buoc?: [T, CoCanh][];   // bước CỠ, vẽ lại 1 frame (d.5)
- chuyen?: 'cut' | 'trang' | 'mo-chong';   // bỏ — 100 % cắt cứng; nháy trắng = shot trong

// ── Board ──────────────────────────────────────────────────────────────
+ export type KieuAgent = {ten: string; toc: KieuToc; phu_kien?: PhuKien; mau_nhan?: string; khung?: 'chinh' | 'phu'; co?: number; mat?: TrangThaiMat};
+ nhan_vat?: Record<string, KieuAgent>;    // agent khai nhân vật mới bằng enum có sẵn; KIEU trong mã chỉ còn 'trang' + mẫu
  mac_dinh?: {loai?: LoaiShot; co?: CoCanh; beat_tu_dong?: boolean /* mặc định true */};
  // tệp: board/_chung.json {du_an, nguoi_ke, mac_dinh, nhan_vat} + board/<id>.json {id, nhac, shots} (b.1)
```

`board.schema.json` (draft-07) **sinh tự động** bằng `ts-json-schema-generator` (dev-dep)
trong `pipeline/thu-vien-v2.mjs --schema`, `additionalProperties: false` ở mọi cấp; validator
dùng `ajv` (dev-dep). Không ai viết schema tay.

### 0.3 (đã xoá)

Bảng đổi tên b.3/b.8 → `kieu-board.ts` của bản cũ **không còn**: b.3 và b.8 giờ viết
thẳng bằng phương ngữ `kieu-board.ts` + §0.2.

### 0.4 Việc còn nợ để nhánh v2 chạy được (thứ tự — chi tiết ở g.1)

1. e.0 chuỗi thuần (đuôi `.ts`, `cues.core.ts`, `allowImportingTsExtensions`) → `node -e "import('./src/v2/phim/du-lieu.ts')"` exit 0.
2. `src/v2/fps.ts` = 24; `CO_CANH` + `net()` mới; `meta.mjs` + `render-segments.sh` đọc meta — **một commit**.
3. `analyze-voice.mjs --fps 24` → `data/<ten>.voice24.json`; `lipsync.mjs` 24 fps + `cues.json` cho `tinh-dau`, `demo-v2`.
4. Đăng ký `DemoV2`/`TinhDau2` trong `Root.tsx` với `fps={FPS_V2}`; V1 giữ `fps={FPS}` (30).
5. Tiếp tục g.2 → g.7.

---

## a. Nguyên tắc thẩm mỹ (12 luật, mỗi luật có số đo gốc và cách máy kiểm)

| # | Luật | Số đo gốc | Máy kiểm ở đâu |
|---|---|---|---|
| A1 | **Nền trắng `#fdfdfd` là nền duy nhất.** Prop chỉ vẽ đúng vật câu đang nhắc; không sàn, không tường, không chân trời. Không có nền màu, không cảnh ẩn dụ vẽ đầy (`an-du`, `canh_cu` **bỏ khỏi schema**) | 84 % shot trắng + nét; 11,7 % trắng hoàn toàn; 4,3 % không trắng **toàn là ảnh thật/phòng tối** (NC §4.4, §7.2) | schema không có `nen`; lint `grep -cE '#[0-9a-f]{6}' src/v2/props/*` ≤ 3 màu (mực, nền, đỏ) |
| A2 | **Nét dày đều, một độ dày cho mọi nét.** `netDay(DAU_px) = clamp(3 + 0,012 × DAU_px, 4,5, 16)` px @1080p. Mày tức 1,5×, gạch mí 0,7×. `stroke-linecap/linejoin: round`, `paint-order: stroke` | sọ 100→3, 175→4, 400→6, 700→12 px @1280 (NC §4.1) | `do-net.py` trên still; ngưỡng viết dạng `netDay(CO_CANH[co].dau) ± 1` |
| A3 | **Hai mảng tô**: tóc + tối đa 1 màu nhấn/nhân vật. Da, áo, quần **không tô**. Không gradient, không cel-shade, không bóng đổ, không `filter/opacity` | trắng 84,1 % pixel (NC §4.2) | lint `grep -E 'boxShadow\|filter\|opacity\|Gradient' src/v2` rỗng |
| A4 | **Hold có chủ ý.** Giữa hai sự kiện, nhân vật đứng **tuyệt đối yên**, kể cả miệng khi **không** nói. Chỉ miệng **đang nói** đổi hình. Không thở sin, không lắc đầu, không rung miệng lúc im | 71,5 % khung đứng yên; trong hold chỉ miệng động khi nói, miệng nghỉ diff = 0 (NC §3.2, §3.3) | `act.ts` không có `Math.sin(frame)`; `rig/mieng.tsx` không có `scale(` theo frame; `do-video.py` đo "khi nghi = 0 đổi" |
| A5 | **Snap pose**: đổi tư thế trong **1 frame**, không ease. Chuyển động lớn (kể cả **quay đầu**) = 3–5 hình rời. Cắt 100 % cắt cứng | 79 % snap 1 frame; s046 quay đầu 3 hình rời; 0 mờ chồng (NC §3.1, §2.2) | K9; schema không có `chuyen` |
| A6 | **Lip-sync theo hình, on ones**: 8 hình nói + X theo cue rhubarb; **A và X giữ ≥ 2 frame, mọi hình khác 1 frame**; trong run cùng ký hiệu đảo 3 biến thể **mỗi frame**; miệng đi trước tiếng 2 frame; **không** scale miệng | 16–19 đổi/s; 87 % hình giữ 1 frame; cùng biên độ vẫn xen kẽ hé/rộng/dẹt (NC §3.4, §5.1); Williams (NC §5.5) | `lipsync.mjs` in thống kê; `do-video.py --vung-mieng` ≥ 12 đổi/s khi nói, hiệu chuẩn trên `ref.f398.mp4` 36–39 s (phải ra 16–19/s) |
| A7 | **Chữ trên màn là ngữ pháp**: ≥ 1 lần / 15 s; vào **tức thì 1 khung** hoặc từng từ **đúng frame từ đó** (`neoTu`); không fade; nhấn bằng cỡ **không bằng màu**; biến mất khi cắt | ≥ 32 lần / 403 s; kinetic 12 từ trong 3,25 s (NC §7.1) | K13; schema không có `Chu.mau` |
| A8 | **Insert ảnh thật hiếm, ngắn, che khung**: ≤ 2,6 s, nháy trắng 0,3 s hai đầu, căn giữa, không viền/bóng/xoay, ≤ 5 % shot | 4 lần / 403 s (NC §7.2) | K14 |
| A9 | **Phân cấp mặt**: chỉ **người kể** (`nguoi_ke`) có mắt oval đen. Mọi nhân vật khác — có tên hay không — mắt chấm/gạch (`cham`/`gach`), phân biệt bằng tóc + 1 phụ kiện; extras = `trang` không mặt | NC §4.9 "không bao giờ dùng oval đen của nhân vật chính" | K5 cảnh báo `mat: oval` trên dien ≠ `nguoi_ke`; `KIEU` mặc định `mat: cham` |
| A10 | **Nhịp**: shot trung vị **≤ 1,8 s** (mục tiêu 1,2–1,6); **≥ 30 %** shot < 1 s; shot ≥ 0,25 s; ≥ 18 cắt / 30 s; trực diện 12–25 %, mỗi đoạn ≤ 7 s, rời TD ≤ 35 s; beat trắng 5–10 %, mỗi beat ≤ 3,6 s; **mọi im lặng ≥ 0,6 s là một chỗ cắt** | trung vị 1,42 s, 31 % < 1 s, ≈ 21 cắt/30 s (NC §2) — ngưỡng = ≥ 80 % tham chiếu, không nới theo giọng | K10, K11, K12, K25; **giọng TTS phải đạt K26** (e.1) |
| A11 | **Mắt oval đen, không mày mặc định, không lòng trắng. Không chớp mắt tự động.** `mat: nham` là **trạng thái biểu cảm** đổi cùng snap | 0 chớp / 519 frame; mắt nhắm chỉ là trạng thái 1–2 s (NC §3.3, §3.9 `blink.ratePerSec: 0`) | `BLINK.bat = false`; hold dài giải bằng cắt/snap/chữ (K29) |
| A12 | **Khung trực diện lệch một bên**: nhân vật x ≈ **0,72** W, rộng 38–44 % khung, cắt ở ngực; nửa còn lại dành cho chữ / insert | bbox 0,52–0,96 W (NC §6.2) | `X_MAC_DINH.can = 0.72`; K23 bbox |

**FPS = 24** (`src/v2/fps.ts`), khung **1920×1080** (NC §8.2).

---

## b. Schema bảng phân cảnh

### b.1 Vị trí và tệp (chia theo chương — AL-9)

```
src/projects/<du-an>/board/_chung.json      ← {du_an, nguoi_ke, mac_dinh, nhan_vat}
src/projects/<du-an>/board/<id-chuong>.json ← {id, nhac, shots}  — MỘT chương một tệp (~4–8 KB)
src/v2/board/kieu-board.ts                  ← type TS = schema gốc DUY NHẤT
src/v2/board/board.schema.json              ← SINH từ kieu-board.ts (ts-json-schema-generator), không sửa tay
src/v2/phim/du-lieu.ts                      ← napBoard(dir) gộp các tệp + ALIAS; giaiBoard() (b.4)
```

Đo trên `demo-v2/board.json` (80 shot / 83 s): 295 byte/s compact → video 6 phút ≈ 104 KB
compact / 285 KB pretty một tệp — vượt một lượt sinh ổn định của LLM. Chia theo chương:
mỗi tệp 15–30 shot; `du-an-moi.mjs` sinh sẵn 14 tệp rỗng có `"id"` và `ghi_chu` = lời
bình của chương để agent nhìn `vo` ngay cạnh shot.

Validator (`pipeline/kiem-tra-v2.mjs`) và phim (`src/v2/phim/*`) **cùng import**
`src/engine/cues.core.ts`, `src/engine/neo.ts`, `src/v2/phim/du-lieu.ts` — Node 26 nạp `.ts`
trực tiếp. Ràng buộc "chuỗi thuần" (e.0): các file này chỉ dùng TS xoá được, `import type`
cho kiểu, import giá trị **có đuôi `.ts`**, không import React/remotion/`.tsx`.

### b.2 Cấu trúc tổng

```jsonc
// board/_chung.json
{
  "du_an": "tinh-dau",
  "nguoi_ke": "nam",                    // khoá trong nhan_vat; người duy nhất có mắt oval
  "mac_dinh": {"loai": "truc-dien", "co": "can", "beat_tu_dong": true},
  "nhan_vat": {
    "nam":  {"ten": "Nam",  "toc": {"mau": "#1c1a22", "mai": "hat", "lon": 0, "sau": "ngan"}, "phu_kien": "ca-vat", "mau_nhan": "#c0392b"},
    "ha":   {"ten": "Hà",   "toc": {"mau": "#2b1a12", "mai": "lech-trai", "lon": 2, "sau": "duoi-ngua"}, "phu_kien": "no", "mau_nhan": "#e07a9a"},
    "thay": {"ten": "Thầy", "toc": {"mau": "#8a8a8a", "mai": "re-giua", "lon": 0, "sau": "ngan"}, "phu_kien": "kinh", "khung": "phu"}
  }
}
// board/cho-ngoi.json
{"id": "cho-ngoi", "nhac": null, "shots": [ /* Shot[], thứ tự = thứ tự thời gian */ ]}
```

### b.3 `kieu-board.ts` — bản đích đầy đủ (một phương ngữ; §0.2 là diff so với đĩa)

```ts
import type {TrangThaiMat, TrangThaiMay} from '../rig/mat.ts';
import type {HinhMiengCamXuc} from '../rig/mieng.ts';     // 12 miệng cảm xúc — KHÔNG gồm A–H/X (máy dùng)
import type {KieuToc} from '../rig/toc.ts';
import type {PhuKien} from '../rig/kieu.ts';
import type {Sac} from '../rig/sac.ts';

export type T = number | `@${string}`;
export type LoaiShot = 'truc-dien' | 'minh-hoa' | 'phan-ung' | 'dac-ta' | 'chu' | 'insert' | 'tieu-canh' | 'dong-nguoi' | 'trong';
export type CoCanh = 'rong' | 'trung' | 'can' | 'sat' | 'nho';
export type HuongDau = 'truoc' | 'ba-phan-tu' | 'nghieng';
export type BoCuc = 'mot' | 'hai-doi-dien' | 'ban' | 'lop' | 'hang-ngang';

export const CO_CANH: Record<CoCanh, {dau: number; chanY: number; mo_ta: string}> = {
  nho:   {dau: 150,  chanY: 0.66, mo_ta: 'tí hon giữa trắng — cao ≈ 36 % H'},
  rong:  {dau: 230,  chanY: 0.92, mo_ta: 'toàn thân — cao 598 px = 55 % H'},
  trung: {dau: 380,  chanY: 1.21, mo_ta: 'nửa người, cắt ở hông — đỉnh tóc ≈ 0,29 H'},
  can:   {dau: 560,  chanY: 1.45, mo_ta: 'cắt ở ngực — đỉnh tóc ≈ 0,10 H; trực diện, phản ứng'},
  sat:   {dau: 1000, chanY: 2.38, mo_ta: 'chỉ mặt — tâm mặt ở 0,50 H, rộng ≈ 65 % W kèm tóc'},
};
export const X_MAC_DINH: Record<CoCanh, number> = {nho: 0.5, rong: 0.5, trung: 0.55, can: 0.72, sat: 0.5};

export type HanhDong = {
  tai: T;
  kieu?: 'snap' | 'keys' | 'vao' | 'ra' | 'di';     // mặc định snap
  dang?: string;                                    // tên trong TU_THE (kebab-case); tên TU_THE_MAY bị K22 chặn
  sac?: Sac;
  mat?: TrangThaiMat; may?: TrangThaiMay; mieng?: HinhMiengCamXuc;   // ghi đè bộ ba của sac
  huong?: HuongDau;
  nhin?: number;                                    // −1..1, liếc trong cùng hướng đầu
  x?: number; den_x?: number; tu?: 'trai' | 'phai' | 'duoi' | 'tren';
  flip?: boolean; ma?: boolean; mo_hoi?: boolean;
  cam?: string | null;
};

export type DienVien = {
  kieu: string;                                     // khoá trong Board.nhan_vat hoặc 'trang'
  so_luong?: number;                                // chỉ 'trang'
  x?: number; y?: number; co?: number;              // x bắt buộc khi không có bo_cuc và shot có > 1 diễn viên
  dang?: string; sac?: Sac; mat?: TrangThaiMat; may?: TrangThaiMay; mieng?: HinhMiengCamXuc;
  huong?: HuongDau; nhin?: number; flip?: boolean; ma?: boolean; mo_hoi?: boolean;
  noi?: boolean;                                    // miệng theo mouth cue của chương (b.7)
  tu_dong?: boolean;                                // mặc định true khi noi (d.8)
  cam?: string;
  act?: HanhDong[];
};

export type Prop = {
  ten: TenProp;
  x?: number; y?: number;                           // tâm đáy; bo_cuc đặt nếu bỏ trống
  co?: number;                                      // hệ số nhân lên cao_dau; mặc định 1
  flip?: boolean; tai?: T;
  nhan?: string;                                    // chữ tay cạnh prop, có mũi tên
  hinh?: 'hop' | 'tru' | 'tron' | 'tam';            // chỉ 'vat-la'
};
export const PROP_TEN = [/* 28 tên hiện có */ 'ban-hoc', /* … */ 'cong-truong', 'vat-la'] as const;
export type TenProp = (typeof PROP_TEN)[number];
/** cao mặc định (đơn vị DAU của cỡ shot) và điểm cầm — D khai cho từng prop */
export type PropMeta = {cao_dau: number; cam?: {co: number}; mo_ta: string; dung_khi: string};

export type Chu = {
  noi_dung: string;
  kieu?: 'kem' | 'the' | 'nhan' | 'tay';
  vi_tri?: 'giua' | 'trai' | 'phai' | 'tren' | 'duoi' | 'canh-dau';
  vao?: 'tuc-thi' | 'tung-tu' | 'phong';
  tai?: T;
  nhan_manh?: string[];
  mui_ten?: `dien:${number}` | `prop:${number}`;
};

export type Insert = {anh: string; chu?: string};

export type Shot = {
  say?: string;                                     // mỏ neo — có THẬT trong vo; from = frame đầu TỪ đầu của say (b.4)
  dai?: number;                                     // giây; bắt buộc với trong/insert không có shot kế nối ngay
  loai?: LoaiShot; co?: CoCanh; bo_cuc?: BoCuc;
  prop?: Prop[]; dien?: DienVien[]; chu?: Chu[]; insert?: Insert;
  sfx?: string | {tai: T; ten: string}[];
  zoom_buoc?: [T, CoCanh][];
  beat?: boolean;                                   // false: không chèn beat tự động trước shot này
  phan_ung?: {kieu: string; sac: Sac; tai?: T; dai?: number};
  nhan?: string[];
  ghi_chu?: string;
};

export type KieuAgent = {ten: string; toc: KieuToc; phu_kien?: PhuKien; mau_nhan?: string; khung?: 'chinh' | 'phu'; co?: number; mat?: TrangThaiMat};
export type BoardChuong = {id: string; nhac?: string | null; shots: Shot[]};
export type Board = {
  du_an: string; nguoi_ke: string;
  mac_dinh?: {loai?: LoaiShot; co?: CoCanh; beat_tu_dong?: boolean};
  nhan_vat?: Record<string, KieuAgent>;
  chuong: BoardChuong[];
};
```

Không có trong schema (cố ý): `Shot.tai` (giây tuyệt đối), `nen`, `chuyen`, `tay`,
`Chu.mau`, `Insert.co/xoay/kieu`, `Act.kieu: pop`, `vach`, `Khung.rung/zoom_gag`
(zoom-gag chữ = `Chu.vao: 'phong'`), `sac` cho `trang`.

### b.4 Mốc thời gian — `src/engine/cues.core.ts` (thuần) và quy tắc giải `giaiBoard()` trong `src/v2/phim/du-lieu.ts`

**Vấn đề đo được.** `neo()` cũ trả `round(c.start)` của **cụm** 7 từ chứa ký tự
→ độ phân giải 1,3–3,2 s. Trên chính ví dụ chương `cho-ngoi` (`$S/neo-test.mjs`):
15 `say` → **12** `from` khác nhau (3 shot trùng mốc = lỗi), 7/9 `@từ` rơi đúng đầu
shot. Và bản thân `cueTimings` là ước lượng theo âm tiết: so với X-run của rhubarb tại
9 ranh giới dấu câu của `cho-ngoi` lệch trung vị **0,55 s**, p90 1,33 s, chỉ 1/9 trong
0,15 s (`$S/can-cue-test.mjs`); trên 14 chương `tinh-dau` (phản biện đo) trung vị
0,65–0,78 s, p90 1,6–1,7 s. Tham chiếu: 89 % cắt cách đầu từ ≤ 0,15 s (NC §2.2).

**Ba hàm, một nguồn** (`cues.core.ts`, không React; `cues.tsx` re-export cho `Sub`):

```ts
export type MocTu = {tu: string; start: number; end: number; nguon: 'rhubarb' | 'uoc-luong'};   // frame trong chương

/** 1. Chia thời lượng theo TỪ — cùng trọng số với cueTimings (1 âm tiết/từ; dấu .!? +2,2; ,;: +1,2).
 *  Độ phân giải ≈ 0,3 s (đo cho-ngoi: 87 từ, trung vị 0,315 s). */
export function tuTimings(vo: string, tuFrame: number, denFrame: number): MocTu[];

/** 2. Căn lại theo tiếng thật. Mốc nghỉ = X-run ≥ 6 frame của mouth.frames (fallback: run `nghi` ≥ 6 f của voice24.json).
 *  Ghép tham lam: ranh giới câu (.!?) trước, rồi (,;:) → X-run gần nhất chưa dùng trong cửa sổ ±1,5 s;
 *  điểm neo = END của X-run (tiếng bắt đầu lại) cho từ kế, START của X-run cho end từ có dấu.
 *  Giữa hai mốc đã ghép chia lại theo trọng số. Biên chương = onset tiếng đầu / kết tiếng cuối (không phải 0/duration). */
export function canhCum(tus: MocTu[], nghi: {start: number; end: number}[]): MocTu[];

/** 3. Neo một mẩu lời: vị trí ký tự trong vo chuẩn hoá → từ chứa ký tự đầu → start của từ.
 *  Nếu mẩu xuất hiện nhiều lần lấy lần đầu có start ≥ tuFrame (mặc định 0; act/chu/sfx truyền shot.from). */
export function neoTu(vo: string, tus: MocTu[], say: string, tuFrame = 0): number | null;
```

Đo trên `cho-ngoi` với rhubarb thật (`$S/rh_test.json`, `$S/can-cue-test.mjs`,
kết quả từ `$S/cho-ngoi.tu-can.json`): 13 X-run ≥ 6 f; 9 ranh giới dấu câu → **ghép 7/9**
(2 ranh giới phẩy không có nghỉ thật; 6 X-run là hơi ngắt không dấu câu — để yên);
neo cấp từ cho **15/15** `from` khác nhau (`$S/neo-tu-test.mjs`).

`lipsync.mjs` ghi `data/<ten>.cues.json` `{[id]: {sig, fps, tu: MocTu[]}}` **chỉ để
xem/`--thong-ke`**; phim và validator **tính lại** bằng cùng ba hàm từ `mouth.json`
(xác định, không cần tệp trung gian). Không có `mouth.json` → fallback `nghi`, validator
cảnh báo `nguon: uoc-luong`. Giai đoạn 2: whisperX align `vi` (NC §5.6) thay
`tuTimings` bằng mốc từng từ thật — giao diện `MocTu` không đổi.

**Quy tắc giải `giaiBoard()`:**

1. `from` = `neoTu(vo, tus, say)`; shot đầu `from > 0` → chèn `trong` ngầm từ 0 (không kéo về 0; `cho-ngoi` = 7 frame).
2. `trong` không có `say` → `from` = start của X-run ≥ 12 f đầu tiên sau `prev.from`; có `dai` thì `len = f(dai)` (kẹp 0,25–3,6 s).
3. **Beat tự động** (`mac_dinh.beat_tu_dong`, mặc định true): tại mỗi X-run ≥ 12 f nằm ngay sau ranh giới câu `.!?` mà shot kế có `from ≥ X.end − 1`, chèn `trong` từ `X.start` tới `next.from`, kẹp 0,3–3,6 s. Shot kế `beat: false` thì không chèn. Đo trên `cho-ngoi` với giọng hiện tại: 4 beat = 14,5 % (quá — giọng nghỉ dài), tắt 2 → 7,6 %. Giọng đạt K26 sẽ ít nghỉ dài hơn.
4. Shot sát (`from < prev.from + 6`) → **dời** `from` lên `prev.from + 6` và **cảnh báo** (không bỏ như `NGAN_NHAT` cũ). Hai shot cùng `from` sau khi dời → lỗi.
5. `len = next.from − from`; shot cuối kéo đến `f(duration) + DEM_CHUONG`. Có `dai` → `len = f(dai)`, khoảng trống tới shot kế thành `trong` ngầm nếu ≥ 6 f.
6. `act[].tai`, `chu[].tai`, `prop[].tai`, `sfx[].tai` dạng `@từ` → `neoTu(vo, tus, tu, shot.from) − shot.from`; phải rơi trong `[0, len)` → ngoài là **lỗi** K20.
7. Đường tắt: `phan_ung` → sinh shot `{loai: 'phan-ung', co: 'can', dien: [{kieu, sac, x: 0.5}]}` chèn sau shot, `from` = `tai` (mặc định = end của shot hiện tại), `dai` mặc định 0,6; `nhan: [...]` → chuỗi shot `chu.kieu: 'nhan'`, mỗi mục neo `@từ` nếu từ có trong `vo` từ `shot.from`, không thì chia đều 0,4–0,8 s.
8. `bo_cuc` → điền `x/y/flip/huong/nhin` cho `dien` và `x/y` cho `prop` theo bảng b.5b; khai tay = ghi đè.
9. Trường bỏ trống lấy từ `mac_dinh` rồi `CO_CANH`/`X_MAC_DINH`; `truc-dien` không `dien` → `{kieu: nguoi_ke, x: 0.72, noi: true}`.
10. Kết quả `ShotDung = Shot & {from, len, idx, dien: DienDung[], prop: PropDung[], sinhBoi?: 'beat' | 'phan_ung' | 'nhan' | 'ngam'}` dùng chung cho phim, validator, `xem-thu`, `meta`.

### b.5 Cỡ cảnh → DAU_px, `chanY`, x mặc định (1920×1080) — **cùng bảng với `CO_CANH`**

| `co` | DAU_px | Nét A2 (`netDay`) | `chanY` | `x` mặc định | Kiểm |
|---|---|---|---|---|---|
| `sat` | 1000 | 15,0 | 2,38 | 0,50 | tâm mặt ở 0,50 H; mặt + tóc ≈ 65 % W (NC §6.2: 68 %) |
| `can` | 560 | 9,7 | 1,45 | 0,72 | đỉnh tóc ≈ 0,10 H, cắt ở ngực/eo; rộng ≈ 40 % khung |
| `trung` | 380 | 7,6 | 1,21 | 0,55 | nửa người, cắt ở hông; đỉnh tóc ≈ 0,29 H |
| `rong` | 230 | 5,8 | 0,92 | 0,50 | toàn thân 598 px = **55 % H** (NC §4.3: 56 %) |
| `nho` | 150 | 4,8 | 0,66 | 0,50 | cao 390 px = **36 % H**, rộng 13–19 % (NC §6.2: 33–39 %) |

`RigV2Test` render 5 cỡ; `do-net.py --ti-le` đo cao nhân vật/H = 55 % (`rong`), 36 % (`nho`).
`Trang` (extras) khung `phu` 3,6 DAU; `so_luong` kèm `tre: true` → 2,5 DAU.

**b.5b Preset bố cục (`bo_cuc`)** — giải trong `giaiBoard()`, agent chỉ ghi đè khi cần:

| `bo_cuc` | `dien` | `prop` |
|---|---|---|
| `mot` (mặc định 1 người) | `x = X_MAC_DINH[co]`, `huong: truoc` | prop đầu `x = 0.5 − (dien.x − 0.5)` (phía trống), `y = chanY` |
| `hai-doi-dien` | `dien[0]` x 0,33 `flip: false` `huong: ba-phan-tu` `nhin: 0.5`; `dien[1]` x 0,67 `flip: true` `huong: ba-phan-tu` `nhin: -0.5` | prop giữa x 0,5 |
| `ban` | `dien[0]` `dang: ngoi`, x 0,55 | `ban-hoc` x = dien.x, y = chanY; prop kế đặt lên mặt bàn (`PropMeta.mat_ban`) |
| `lop` | `trang so_luong` x 0,5 `dang: ngoi`; `dien` có tên x 0,84 | `day-ban-lop` x 0,5 y chanY; `bang-den` x 0,3 |
| `hang-ngang` | N người cách đều trong [0,2; 0,8], `huong: truoc` | — |

### b.6 Thời gian `T`

- `tai: 0.8` → frame `round(0.8 × 24)` từ đầu shot.
- `tai: "@ngay sau"` → `neoTu(vo, tus, "ngay sau", shot.from) − shot.from` (độ phân giải **từ**, đã căn X-run). Ví dụ đo trên `cho-ngoi` (mốc đã căn): `@tên` = +10 f trong shot "Cô đọc tên" (20 f), `@không` = +14 f trong "Hoá ra không" (36 f); một `@từ` là từ đầu của shot kế thì = `len` → K20 báo lỗi thay vì nổ ở frame 0 như `neo()` cụm.
- Khuyến nghị: `@từ` cho mọi hành động gắn nghĩa với lời; số chỉ cho beat kỹ thuật (0, 0.3).

### b.7 Nhân vật "đang nói" nhận mouth cue thế nào

- `<ten>.mouth.json[id].frames` = một ký tự / frame ở FPS 24, đã `dichSom(2)`, A/X ≥ 2 f.
- `noi: true` → `shape = frames[shot.from + f]`; `shape ∈ A–H` → hình lipsync, biến thể `bien = k % 3` (k = số frame liên tiếp cùng ký hiệu), `sac` chỉ lái khoé; `shape === 'X'` → **miệng cảm xúc** theo `sac`, **đứng yên**.
- `noi: false` → miệng cảm xúc theo `sac`, đứng yên.
- Tối đa **một** `noi: true` mỗi shot (K6). `phan-ung`, `dong-nguoi`, `tieu-canh`, `trang` không `noi` (K21).
- Không `mouth.json` → fallback 3 mức (e.3.4); validator cảnh báo.

### b.8 Ví dụ đầy đủ một chương — `board/cho-ngoi.json` (golden file, commit tại `docs/vi-du/cho-ngoi.json`)

Lời bình (`scripts/tinh-dau.json`, 33,38 s giọng hiện tại): *"Năm lớp mười, cô chủ nhiệm
đổi chỗ ngồi cả lớp. Cô đọc tên theo danh sách, không theo ý ai. Và tên tôi được đọc ngay
sau tên một bạn nữ mà trước đó tôi chưa từng nói chuyện lấy một câu. Bạn ấy tên Hà. Tôi vẫn
nghĩ những chuyện lớn trong đời phải bắt đầu bằng một khoảnh khắc lớn. Hoá ra không. Nó bắt
đầu bằng một cuốn sổ điểm danh, và một cô giáo đọc tên theo thứ tự bảng chữ cái."*

`_chung.json` như b.2. Chương (phương ngữ `kieu-board.ts`, khoá snake_case, giá trị kebab-case):

```json
{"id": "cho-ngoi", "nhac": null, "shots": [
  {"say": "Năm lớp mười", "loai": "truc-dien",
   "dien": [{"kieu": "nam", "noi": true, "dang": "hai-tay-xoe",
             "act": [{"tai": "@mười", "dang": "chi"}]}],
   "chu": [{"noi_dung": "LỚP 10", "kieu": "nhan", "vi_tri": "tren"}]},
  {"say": "cô chủ nhiệm", "loai": "minh-hoa", "co": "trung",
   "prop": [{"ten": "bang-den", "x": 0.30, "co": 1.2}],
   "dien": [{"kieu": "thay", "x": 0.62, "dang": "tay-hong", "sac": "thuong"}],
   "chu": [{"noi_dung": "cô chủ nhiệm", "kieu": "tay", "vi_tri": "canh-dau", "mui_ten": "dien:0"}]},
  {"say": "đổi chỗ ngồi", "loai": "minh-hoa", "co": "trung",
   "dien": [{"kieu": "thay", "x": 0.62, "dang": "chi", "nhin": -0.5, "huong": "ba-phan-tu"}]},
  {"say": "cả lớp", "loai": "dong-nguoi", "co": "rong", "bo_cuc": "lop",
   "dien": [{"kieu": "trang", "so_luong": 10}, {"kieu": "nam", "sac": "thuong"}]},
  {"say": "Cô đọc tên", "loai": "minh-hoa", "co": "trung", "beat": false,
   "dien": [{"kieu": "thay", "x": 0.55, "noi": true, "dang": "cam", "cam": "sach", "nhin": 0.6,
             "act": [{"tai": "@tên", "dang": "chi", "nhin": 0}]}]},
  {"say": "danh sách", "loai": "dac-ta", "co": "can",
   "prop": [{"ten": "sach", "x": 0.5, "y": 0.62, "co": 1.4, "nhan": "danh sách"}]},
  {"say": "không theo ý ai", "loai": "phan-ung",
   "dien": [{"kieu": "nam", "sac": "met", "nhin": 0.4}],
   "chu": [{"noi_dung": "...", "kieu": "tay", "vi_tri": "canh-dau", "tai": 0.1}]},
  {"say": "Và tên tôi", "loai": "truc-dien", "beat": false,
   "dien": [{"kieu": "nam", "noi": true, "dang": "hai-tay-xoe",
             "act": [{"tai": "@được đọc", "sac": "soc", "dang": "gio-tay"}]}]},
  {"say": "ngay sau", "loai": "chu",
   "chu": [{"noi_dung": "NGAY SAU", "kieu": "the", "vao": "tung-tu"}]},
  {"say": "một bạn nữ", "loai": "tieu-canh",
   "dien": [{"kieu": "ha", "sac": "thuong"}],
   "chu": [{"noi_dung": "?", "kieu": "tay", "vi_tri": "canh-dau", "mui_ten": "dien:0", "tai": 0.2}]},
  {"say": "chưa từng", "loai": "minh-hoa", "co": "trung", "bo_cuc": "hai-doi-dien",
   "prop": [{"ten": "ban-hoc", "x": 0.33}, {"ten": "ban-hoc", "x": 0.67}],
   "dien": [{"kieu": "nam", "dang": "ngoi", "sac": "ngai", "nhin": -0.6, "huong": "truoc"},
            {"kieu": "ha", "dang": "ngoi", "sac": "thuong", "huong": "truoc"}]},
  {"say": "lấy một câu", "loai": "chu",
   "chu": [{"noi_dung": "0 CÂU", "kieu": "the", "nhan_manh": ["0"]}]},
  {"say": "Bạn ấy", "loai": "truc-dien",
   "dien": [{"kieu": "nam", "noi": true, "dang": "chi-len", "sac": "vui"}]},
  {"say": "Hà", "loai": "chu",
   "chu": [{"noi_dung": "HÀ.", "kieu": "the", "nhan_manh": ["HÀ."]}],
   "sfx": [{"tai": 0, "ten": "ding"}]},
  {"say": "Tôi vẫn nghĩ", "loai": "truc-dien",
   "dien": [{"kieu": "nam", "noi": true, "dang": "chong-cam", "sac": "nghi"}]},
  {"say": "những chuyện lớn", "loai": "chu",
   "chu": [{"noi_dung": "CHUYỆN LỚN", "kieu": "the", "vao": "tung-tu"}]},
  {"say": "phải bắt đầu", "loai": "minh-hoa", "co": "rong",
   "dien": [{"kieu": "nam", "dang": "dung", "sac": "thuong",
             "act": [{"tai": "@bắt đầu", "kieu": "keys", "dang": "hai-tay-xoe", "huong": "ba-phan-tu"}]}]},
  {"say": "khoảnh khắc lớn", "loai": "chu",
   "chu": [{"noi_dung": "KHOẢNH KHẮC LỚN", "kieu": "the", "vao": "phong"}],
   "sfx": [{"tai": "@khoảnh", "ten": "riser"}]},
  {"say": "Hoá ra không", "loai": "phan-ung",
   "dien": [{"kieu": "nam", "noi": true, "dang": "khoanh-tay", "sac": "chan"}],
   "chu": [{"noi_dung": "không.", "kieu": "tay", "vi_tri": "duoi", "tai": "@không"}]},
  {"say": "Nó bắt đầu bằng", "loai": "truc-dien",
   "dien": [{"kieu": "nam", "noi": true, "dang": "chi"}]},
  {"say": "một cuốn sổ điểm danh", "loai": "dac-ta", "co": "can",
   "prop": [{"ten": "vat-la", "hinh": "hop", "nhan": "sổ điểm danh", "x": 0.5, "y": 0.6, "co": 1.2}],
   "zoom_buoc": [["@điểm danh", "sat"]],
   "sfx": [{"tai": 0, "ten": "pop"}]},
  {"say": "và một cô giáo", "loai": "tieu-canh",
   "dien": [{"kieu": "thay", "noi": true, "dang": "cam", "cam": "sach"}],
   "nhan": ["thứ tự", "bảng chữ cái"]}
]}
```

Chương này **chạy qua** `giaiBoard()` với mốc căn theo rhubarb thật ra (đo bằng
`$S/can-cue-test2.mjs`, cùng thuật toán b.4): 22 shot khai + 2 shot `nhan` (đường tắt) +
2 beat tự động (sau "một câu." và "khoảnh khắc lớn.") = **26 shot đếm nhịp** (+ 1 `trong`
ngầm 7 f ở đầu, không đếm); **trung vị 1,21 s**, **9/26 = 35 % < 1 s**, ngắn nhất 10 f, **23 cắt trong
30 s đầu**, trắng **7,6 %**, 0 `from` trùng; trực diện 5 shot = **19 %** thời gian; chữ 12/26; `noi` ở
8 shot; 9 mốc `@từ` (act/chu/sfx/zoom/nhan) đều rơi trong shot, +7…+47 f sau đầu shot
(kiểm bằng script cùng thư mục: `@mười` +19 f, `@tên` +10 f, `@được đọc` +21 f, `@không`
+14 f, `@điểm danh` +21 f — ba mốc thử đầu `@đổi chỗ/@danh sách/@ngay sau` rơi đúng đầu
shot kế nên bị K20 chặn và đã đổi). `--thong-ke` phải in đúng các số này
(± 1 shot) và `kiem-tra-v2 tinh-dau --chuong cho-ngoi` phải ra **0 lỗi** — đó là test
golden của validator (g.3).

---

## c. Rig nhân vật V2 — `src/v2/rig/`

### c.0 Thiết kế gốc và **phân cấp mặt** (không sao chép Jaiden)

Cái **học**: đầu to, nét đều, hai mảng tô, mắt oval đen, không mày mặc định, hold.
Cái **của riêng repo**: mũi gạch "L"; một màu nhấn trên phụ kiện; trang phục Việt đọc
được ở silhouette; tóc `{mai, lon, sau}` tự định nghĩa.

**Phân cấp thị giác (A9, NC §4.9):** một mặt "thật" duy nhất là **người kể** (`nguoi_ke`,
mắt `oval`). Mọi người khác — kể cả có tên, có vai — mắt **chấm** (`cham`, E3; vai thứ
hai như `ha` dùng chấm to hơn r 0,04) hoặc gạch (`gach`), phân biệt bằng tóc + 1 phụ kiện.
Khán giả luôn biết ai đang kể; khung đông người không thành "sáu người kể cạnh nhau".

Dàn `tinh-dau` **không còn gắn cứng trong mã**: agent khai trong `board/_chung.json`
`nhan_vat` bằng enum có sẵn (`KieuToc`, `PhuKien`, `khung`, `co`, `mat`). `KIEU` trong
`rig/kieu.ts` chỉ còn `trang` + một dàn mẫu (`mau_nam`, `mau_nu`, `mau_lon`) cho test sheet.
Bảng dưới là **giá trị agent sẽ khai** cho `tinh-dau` (không phải mã):

| khoá | `toc {mai, lon, sau}` | `mau` | `phu_kien` / `mau_nhan` | `khung` | `mat` mặc định |
|---|---|---|---|---|---|
| `nam` (người kể) | `hat, 0, ngan` | `#1c1a22` | `ca-vat` `#c0392b` | `chinh` | **`oval`** |
| `ha` | `lech-trai, 2, duoi-ngua` | `#2b1a12` | `no` `#e07a9a` | `chinh` | `cham` (r 0,04) |
| `long` | `dung, 0, ngan` | `#3a2a1c` | `mu-luoi-trai` `#2f6fb3` | `chinh`, co 1,05 | `cham` |
| `mai` | `ngang, 2, bob` | `#5a3b1e` | `kinh` | `chinh` | `cham` |
| `me` | `re-giua, 0, bui` | `#2a2126` | `khan` `#8a6f9e` | `phu` | `cham` |
| `thay` | `re-giua, 0, ngan` | `#8a8a8a` | `kinh` | `phu` | `gach` |
| `nam-lon` (người kể lúc 30) | `lech-phai, 0, ngan` | `#1c1a22` | — | `chinh`, co 1,05 | `oval` |
| `ha-lon` | `lech-trai, 2, dai` | `#2b1a12` | — | `chinh`, co 1,05 | `cham` |
| `trang` | không / tuỳ chọn | — | tuỳ chọn 1 | `phu` (3,6) / `tre` (2,5) | không mặt |

`ha/long/mai` giữ khung `chinh` 2,6 DAU vì là bạn cùng tuổi người kể (NC §4.3: trẻ phụ
2,5 đầu ≈ 2,6); người lớn (`me`, `thay`) khung `phu` 3,6 DAU. K5 cảnh báo `mat: oval` trên
dien không phải `nguoi_ke`.

### c.1 Đơn vị, khung xương — `src/v2/rig/hinh.ts` (đã có; sửa `net()`)

DAU = bề rộng sọ (không kèm tóc). Gốc giữa hai bàn chân, y âm hướng lên. `CHINH` (2,6),
`PHU` (3,6) đã khớp; thêm `TRE` (2,5). Sửa:

```ts
export const net = (dauPx: number) => Math.min(16, Math.max(4.5, 3 + 0.012 * dauPx));   // A2; 230→5,8 · 380→7,6 · 560→9,7 · 1000→15
export const NET_MI = 0.7; export const NET_MAY = 1.5;
```

### c.2 Kiểu nhân vật — `src/v2/rig/kieu.ts`

```ts
export type PhuKien = 'khong' | 'kinh' | 'no' | 'mu-luoi-trai' | 'huy-hieu' | 'ca-vat' | 'khan';   // đã có
export type Kieu = {ten: string; toc: KieuToc; phuKien?: PhuKien; mauNhan?: string; khung?: 'chinh' | 'phu' | 'tre'; co?: number; mat?: TrangThaiMat /* mặc định cham */};
export const KIEU: Record<string, Kieu> = {trang: …, mau_nam: …, mau_nu: …, mau_lon: …};   // chỉ mẫu + trang
export const kieuTuBoard = (k: KieuAgent): Kieu => ({...});   // du-lieu.ts gộp Board.nhan_vat vào KIEU lúc nạp
```

### c.3 Đầu — `src/v2/rig/nhan-vat.tsx` (`Dau`), `mat.tsx`, `mieng.tsx`, `sac.ts`

**Hướng đầu (TT-4).** `Dau` nhận `huong: 'truoc' | 'ba-phan-tu' | 'nghieng'` với **3 path
sọ** và **3 bảng toạ độ** mắt/miệng/mũi (`MAT_TOA_DO[huong]`), tóc trước/sau theo hướng:

| `huong` | Sọ | Mắt | Miệng | Tóc |
|---|---|---|---|---|
| `truoc` | ellipse rx 0,50 ry 0,46, đáy dẹt | x ±0,225, y +0,06 | tâm (0, +0,33), lệch ±0,05 theo `nhin` | mái + sau như c.4 |
| `ba-phan-tu` | ellipse dịch tâm +0,06 x, má gần dẹt hơn | x −0,10 / +0,30 (mắt xa nhỏ 0,85×) | tâm (+0,12, +0,33) | mái xoay về phía mặt, sau lộ 1/3 |
| `nghieng` (profile) | path sọ có mũi gờ ở +0,50 x | **1 mắt** tại (+0,20, +0,06) | tại mép (+0,40, +0,33), hình miệng cắt nửa | mái che trán tới mũi, sau đầy |

Tham chiếu dùng đầu nghiêng/3-4/profile như **hình vẽ rời** (NC §3.1 s046: 3 hình
truoc → nghieng-3/4 → profile trong 5 frame; sheet01 1:42 phỏng vấn nhìn 3/4; 1:06 hai
người nhìn nhau). `keys` cho quay đầu = chuỗi hướng 1 frame/hình (d.2). `nhin` chỉ để
**liếc** trong cùng hướng (±0,05 DAU). `RigV2Test` render 8 kieu × 3 hướng × 5 cỡ.

**Mắt** (`mat.tsx`, tên v2; ánh xạ E1–E9 nằm trong JSDoc để `thu-vien-v2.mjs` sinh):
`oval` (E1, chỉ người kể) · `nho` (E2) · `cham` (E3, mặc định nhân vật khác) · `soc`/`soc-lon`
(E4) · `khe` (E5) · `cung` (E6) · `gach` (E7) · `xoan` (E8) · `chan` (E9) · `nham` (trạng
thái biểu cảm, **không** phải chớp). Không lòng trắng, ngươi, highlight, viền.
**Mày**: `khong` (mặc định) · `tuc` · `lo` · `nhiu`. **Mũi**: gạch "L" dài 0,05 khi `kieu.mui`.

**Sắc thái — `src/v2/rig/sac.ts` (AL-6):** `sac` là **trường dữ liệu**; bảng xác định
`SAC: Record<Sac, {mat, may, mieng, dung_khi}>`, `mat/may/mieng` trong board chỉ để ghi đè;
`TO_HOP_HOP_LE` (~25 cặp mắt–miệng) để K27 cảnh báo tổ hợp vô lý (`soc` + `cuoi-nhe`).
Với nhân vật không phải người kể, `mat` của SAC được hạ cấp: `oval → cham`.

| `sac` | miệng (khi X / không nói) | mắt / mày | `dung_khi` |
|---|---|---|---|
| `thuong` | `mim` | `oval` / `khong` | kể bình thường |
| `vui` | `cuoi` (mạnh: mắt `cung`) | `oval` / `khong` | vui, tự hào |
| `nghi` | `smirk` | `oval` / `khong` | suy nghĩ, mỉa |
| `soc` | `o` | `soc` / `lo` | bất ngờ |
| `tuc` | `thang` | `oval` / `tuc` | bực, tức |
| `buon` | `meu` | `oval` / `khong` | buồn |
| `met` | `ba` | `chan` / `nhiu` | mệt, chán nản |
| `hoang` | `hoang` | `soc` / `lo` | hoảng |
| `ngai` | `ba` + gạch má | `cham` / `khong` | ngại, xấu hổ |
| `chan` | `mim` lệch | `chan` / `khong` | chán |

**Miệng** (`mieng.tsx`): tâm y +0,33, đặt lệch má theo `nhin`. Bên trong luôn trắng; răng =
dải trắng viền nét; lưỡi = một cung.

```ts
export const MIENG_LIPSYNC = ['X','A','B','C','D','E','F','G','H'] as const;   // MỘT nguồn cho Shape
export type Shape = (typeof MIENG_LIPSYNC)[number];
export const MIENG_CAM_XUC = ['thang','cuoi-nhe','cuoi','cuoi-toe','meu','hoang','o','smirk','ba','nghien','gat','mim'] as const;
export type HinhMiengCamXuc = (typeof MIENG_CAM_XUC)[number];
export type HinhMieng = Shape | HinhMiengCamXuc;
```

| Shape | % nói (NC §5.2) | Hình học (3 biến thể `bien` 0/1/2 = hé / rộng / dẹt) |
|---|---|---|
| **X** | 39 % tổng | thay bằng miệng cảm xúc theo `sac`, **đứng yên** |
| **A** | 10,5 | vạch dài 0,16 hơi cong; biến thể đổi độ cong |
| **B** | 38,2 | thoi dẹt W 0,36 × 0,08 có vạch răng; biến thể W 0,30/0,36/0,40 |
| **C** | 19,9 | bầu dục ngang W 0,30 × 0,18 + dải răng trên |
| **D** | 2,2 | bầu dục dọc W 0,34 × 0,30 + răng + lưỡi |
| **E** | 10,7 | ellipse rx 0,11 ry 0,13 |
| **F** | 16,2 | ellipse rx 0,08 + 2 nét môi dồn |
| **G** | 1,1 | hé thấp W 0,30 × 0,06, răng trên đè môi dưới |
| **H** | 1,1 | như C, lưỡi cong lên chạm răng |

Khi **đang nói**, `sac` chỉ chồng khoé (`vui` +0,03; `buon/tuc/chan` −0,03). **Không có**
rung/scale miệng theo frame ở bất kỳ trạng thái nào (A4; lint `grep 'scale(' src/v2/rig/mieng.tsx` rỗng).
`src/v2/dev/mieng-test.tsx` vẽ 9 × 3 biến thể + 12 cảm xúc ở 3 hướng đầu.

### c.4 Tóc — `src/v2/rig/toc.tsx` (đã có)

Mỗi kiểu = 1 path khối đặc fill `mau`, viền `net`, + 2–3 gạch. Thêm biến thể theo `huong`
(3 path mái / 3 path sau mỗi kiểu, có thể sinh từ path `truoc` bằng dịch + cắt). Follow-through
**0** (NC §4.7). Không sine.

### c.5 Bàn tay — `src/v2/rig/tay.tsx` (đã có, 6 kiểu)

`xoe chi nam cam ep up`; cử chỉ phức (chống cằm, khoanh, chống hông, ép ngực) là **tư thế**.
`cam` có điểm neo `camTai` để prop cầm vẽ theo cẳng tay (d.4).

### c.6 Thân, tay, chân — `src/v2/rig/nhan-vat.tsx` (đã có)

```tsx
export const NhanVat: React.FC<{kieu: Kieu; trangThai: TrangThaiRig; dau: number; x: number; y: number; net: number; id: string}>;
```

Tay hai đoạn, không vòng khớp, ống 2 nét; chân 2 ống, bàn chân chỏm bo; thân 1 path viền,
cổ áo theo `phu_kien`; **lớp đầu không nhận transform theo frame** ngoài `nhin`/`flip`/`huong`.
`Trang`: đầu tròn trắng trơn, `mat?: cham | gach`, `mieng?: X | cuoi | hoang`; `DamDong` xếp N.

### c.7 Trạng thái rig tại một frame — `src/v2/phim/act.ts` (hợp đồng, đóng băng bước 0)

```ts
import {MIENG_LIPSYNC, type Shape, type HinhMiengCamXuc} from '../rig/mieng.ts';
export type MouthTrack = {sig: string; fps: number; hold: number; lead: number; duration: number; cues: number; frames: string; rle: [number, Shape][]; nguon?: 'rhubarb' | 'fallback'};
export type VoiceTrack = {fps: number; am: number[]; nhan: number[]; nghi: boolean[]};
// K7 ép mt.fps === FPS_V2 và mọi ký tự frames ∈ MIENG_LIPSYNC; kiểu không literal để mouth.json 30 fps cũ vẫn nạp được và bị chặn ĐÚNG mã lỗi.

export type TrangThaiRig = {
  hienThi: boolean;
  dang: string; khop: Khop;
  sac: Sac; mat: TrangThaiMat; may: TrangThaiMay;
  mieng: Shape | HinhMiengCamXuc; bien: 0 | 1 | 2;
  huong: HuongDau; nhin: number; lat: 1 | -1;
  cam?: string;
  x: number; y: number; co: number;
  bienDang?: {sx: number; sy: number; skew: number};     // lean key
  hinhChuKy?: 0 | 1;
};
```

### c.8 Hằng số timing — `src/v2/phim/timing.ts` (chỉ hằng) và `act.ts` (hàm)

```ts
export {FPS} from '../fps.ts';                                    // 24 — nguồn duy nhất cho V2
export const SNAP = {frames: 1};
export const KEYS = {n: [3, 5], framesPerKey: 1, bienDo: [1, 0.5, 0.25]};
export const HOLD = {min: 6, p50: 20, p90: 50, toiDaKhongSuKien: 72};   // 72: cắt / snap / chữ mới phải xảy ra (K29)
export const ENTER = {leanKey: 1, dauTo: 1.3, ngoaiKhung: 0.4, overshoot: 0.015, settle: 2};
export const EXIT = {leanKey: 1, partial: 1};
export const POP_IN = {frames: 1};                                // prop/chữ/nhân vật hiện tức thì (NC §3.5)
export const POP_BONG = [0.08, 0.95, 1.045, 1.0];                 // CHỈ bong-chu (NC §3.6 đo trên 1 bong bóng)
export const ZOOM_GAG = {dauMoiFrame: 0.45, frames: [8, 10], ease: 'linear', ket: 'cut'};   // Chu.vao 'phong'
export const CYCLE = {hinh: 2, holdMoiHinh: 2, chuKy: 4, diPxMoiFrame: 18, chayPxMoiFrame: 36, bobPct: 0.015};
export const BOIL = {pattern: 'ABAC', framesPerDrawing: 1, maxShotShare: 0.2, lechPx: 0.5};
export const BLINK = {bat: false};                                // NC §3.9 ratePerSec 0; 'nham' là trạng thái đổi cùng snap
export const MOUTH = {holdA: 2, holdX: 2, holdKhac: 1, lead: 2, bienThe: 3};
export const CU_CHI = {nhanPhanVi: 0.70, holdMin: 8, holdMax: 27, toiThieuGiuaHaiDoi: 8};   // d.8
export const IDLE = {tho: false};
export const WHITE_BEAT = {min: 0.25, median: 0.9, max: 3.6, xRunMin: 12};
export const SHOT = {min: 0.25, medianToiDa: 1.8, duoi1sToiThieu: 0.30, catMoi30s: 18};
```

- **Không có `chopTai`.** Hold dài không có sự kiện là lỗi **dựng** (thiếu cắt/snap/chữ), K29 cảnh báo; không che bằng chớp mắt.
- `quantize2(f)` chỉ cho `hinhChuKy` và boil.
- `IDLE.tho = false`; bật ở project → chỉ `rong/nho`, biên độ 0,01 DAU, không lên lớp đầu; K18 cảnh báo ở `can/sat`.

---

## d. Hệ chuyển động trong shot — `src/v2/phim/act.ts` (thuần, `node --test`)

### d.1 Hàm chính

```ts
export function giaiDien(
  shot: ShotDung, dien: DienDung,
  ctx: {tus: MocTu[]; mouth?: MouthTrack; voice?: VoiceTrack; sac: typeof SAC; seed: string}
): (frameShot: number) => TrangThaiRig;
```

Trạng thái tại `f` = khai báo ban đầu của `dien` (đã giải `sac` → bộ ba, đã điền `bo_cuc`)
**ghi đè lần lượt** bởi mọi act có `frame ≤ f` (snap: đổi đúng frame, không nội suy). `kieu`
khác `snap` sinh **dãy hình theo frame** (d.2) rồi hold. Miệng: `mouth.frames[shot.from + f]`
nếu `noi` (b.7). Cử chỉ tự động (d.8) chỉ khi không có act nào trong cửa sổ. Hàm thuần của `f`.

### d.2 Các kiểu act

| `kieu` | Dãy frame | Nguồn số |
|---|---|---|
| `snap` (mặc định) | f0: trạng thái mới. Không anticipation, không settle | NC §3.1 (79 %) |
| `keys` | n = 3..5 hình rời 1 frame/hình; với **quay đầu**: chuỗi `huong` `truoc → ba-phan-tu → nghieng` (hoặc ngược), 2 hình cuối biên độ 0,5/0,25 cho tay/thân | NC §3.1 (nose, s046) |
| `vao` | f0 `hienThi` + lean key (`bienDang {sx 1.15, sy 0.9, skew ±15°}`, đầu ×1,3, 40 % ngoài khung mép `tu`) → f1 `den_x` + 1,5 % overshoot → f2 +0,75 % → f3 đúng chỗ. Không có `tu` → **pop-in 1 frame** | NC §3.5 |
| `ra` | f0 lean key → f1 còn 30 % trong khung → f2 `hienThi=false` | NC §3.5 |
| `di` | 2 hình `di-a/di-b` (mỗi hình 2 frame, chu kỳ 4) + vị trí trượt on ones 18 px/frame (`chay-a/b` 36) tới `den_x` rồi snap về `dang`; bob ≤ 1,5 %. **Không** motion line (0/97 sự kiện) | NC §3.7 |

Không có `pop` act: prop/chữ/nhân vật hiện **1 frame** (NC §3.5 s086, s121, s240); chuỗi
`POP_BONG` 4 frame chỉ cho prop `bong-chu` (đo trên đúng 1 bong bóng, s220).

### d.3 Hai hình walk cycle — `src/v2/rig/tu-the.ts`

`TU_THE_MAY = {'nhay-1', 'nhay-2', 'lao-vao', 'di-a', 'di-b', 'chay-a', 'chay-b'}` tách khỏi
`TU_THE` (agent dùng); `thu-vien.json` xuất riêng `_may_dung`; K22 chặn nếu xuất hiện ở
trường agent. Chân có `hong`, `goi` trong `Khop`; đúng 2 hình, `quantize2`.

### d.4 Cầm / đưa vật

`dien.cam = "<ten>"` → `tay.phai.ban = 'cam'`, prop vẽ tại `camTai` với `co = PropMeta.cam.co`
(mặc định 0,35 DAU). Đưa vật = hai act snap cùng `tai`: A `cam: null`, B `cam: "<ten>"` (K16).

### d.5 Khung — `zoom_buoc` là **bước cỡ**, không phải scale

`khungTai(shot, f) → {co, dau, chanY, x}`: `zoom_buoc: [["@sổ", "sat"]]` đổi `co` **tức thời**
tại mốc → `dau`, `chanY`, `X_MAC_DINH` của cỡ mới, **vẽ lại** 1 frame (đúng "3 hình bố cục
lại" NC §6.3). Lý do bỏ hệ số z (TT-5): scale SVG quanh tâm khung với `can` x 0,72 z 1,6 đẩy
tâm mặt ra 0,85 W, mất ~20 % mặt ngoài mép — chính lỗi NC §9.1-6. `dien.x` khai tay giữ
nguyên qua bước (agent muốn giữ vị trí) nhưng K23 kiểm bbox sau bước nằm trong khung.
Không `rung`, không `zoom × (1 + 0,035 t)`.

### d.6 Chữ — `src/v2/chu.tsx` (đã có; sửa)

- Hiện tại `tai` **trong 1 frame**; `tung-tu` → mỗi từ hiện tại **`neoTu()` của từ đó** (mốc đã căn, không còn theo `cues` cụm); từ không có trong `vo` cách đều 0,2 s.
- `phong` = `ZOOM_GAG` tuyến tính trên khối chữ rồi shot kết (cắt cứng).
- Cỡ theo `kieu`: `tay` 5 % H · `kem` 5 % · `nhan` 9 % · `the` 12–18 % (dòng chốt tới 45 %); `nhan_manh` ×1,6.
- Font: `kem/nhan/the` = **Be Vietnam Pro 800/900** (`FONT` đã có trong `src/engine/font.ts`, sans geometric đậm như tham chiếu "random memories"); `tay` = **Patrick Hand** 400 in hoa, **0°** (không nghiêng −4°). Baloo 2 (display bo tròn) **bỏ**. Màu đen 100 %, không `mau`.
- Biến mất khi shot kết.

### d.7 Insert — `src/v2/insert.tsx` (viết lại)

Ảnh thật **che khung, căn giữa** (`object-fit: contain` trên nền trắng), không viền, không
bóng, không xoay, hiện **1 frame**; nháy trắng 0,3 s hai đầu do resolver (`loai: insert`);
`chu` tuỳ chọn viết tay góc dưới. Không `clip`, không `an-du` (Phản biện KT-8, TT-11).

### d.8 Cử chỉ tự động khi nói (`tu_dong`, mặc định true cho mọi `noi: true`)

Tham chiếu cận nói đổi tay/biểu cảm mỗi **8–27 frame** gắn với từ đang nhấn (NC §3.2);
cụm phụ đề 2,95 s + hash (mã hiện có) thưa 5–6× và vô nghĩa với lời.

1. **Mốc đổi** = đỉnh `nhan` của `voice24.json` ≥ phân vị 70 của chương, cách mốc trước ≥ 8 f; hold 8–27 f (nếu đỉnh kế cách > 27 f, giữ nguyên tới đỉnh kế — không chèn thêm).
2. **Chọn tư thế** theo từ đang nói tại mốc (tra `tus`): bảng `TU_CU_CHI` trong `dien-xuat.md` và `act.ts` — con số/"một" → `chi`; phủ định "không/chẳng" → `hai-tay-xoe`; "tôi/mình" → `ep-nguc`; "nghĩ/chắc" → `chong-cam`; "lớn/to" → `gio-tay`; câu hỏi → `nhun-vai`; không khớp → hash trong `CU_CHI_NOI` lọc theo `sac` (buồn không `vay-tay`).
3. Act `@từ` do agent viết **ưu tiên**: trong cửa sổ ±8 f quanh act, tự động tắt.
4. Mắt/mày không tự đổi (NC §3.3: mày không đổi trong hold).
5. K28 cảnh báo shot `truc-dien` > 1,2 s không có act và không có đỉnh `nhan` nào được dùng.

---

## e. Pipeline

```
scripts/<ten>.json
  │ node pipeline/tts-gemini.mjs <ten>            (giữ; .sig thêm MODEL; kiểm tốc độ giọng K26)
  ▼ public/vo-<ten>/<id>.mp3 + .sig ; src/projects/<du-an>/data/<ten>.generated.json
  │ node pipeline/analyze-voice.mjs <ten> --fps 24 (FPS từ src/v2/fps.ts) → data/<ten>.voice24.json
  │ node pipeline/lipsync.mjs <ten>               (rhubarb → mouth.json 24 fps; canCue → cues.json)
  ▼ data/<ten>.mouth.json, data/<ten>.cues.json
  │ agent viết src/projects/<du-an>/board/_chung.json + board/<id>.json   (TỪNG CHƯƠNG)
  │ node pipeline/kiem-tra-v2.mjs <ten> --chuong <id> [--json] [--thong-ke]
  │ node pipeline/xem-thu.mjs <ten> --chuong <id> [--moi-shot] [--act] [--nhap]
  │ node pipeline/meta.mjs <ten>                  → data/<ten>.meta.json {fps, total, chuong[]}
  ▼
  ./render-segments.sh <Comp> media/outbound/<ten>.mp4 [--chuong <id>]   (đọc fps + total từ meta.json)
  python3 pipeline/do-video.py media/outbound/<ten>.mp4                   (nghiệm thu)
```

V1 (`TinhDau`, `RaTruong*`) tiếp tục đọc `data/<ten>.voice.json` 30 fps và `thu-vien-v1.json`
cho tới bước 5; V2 không ghi đè hai tệp đó.

### e.0 Chuỗi thuần nạp được bằng Node (KT-5) — làm ở bước 0

Danh sách cố định, mọi import giá trị **có đuôi `.ts`**, không React/remotion/`.tsx`:
`src/v2/fps.ts`, `src/engine/{neo,cues.core}.ts`, `src/v2/phim/{du-lieu,act,timing}.ts`,
`src/v2/rig/{hinh,kieu,tu-the,sac}.ts`, `src/v2/board/kieu-board.ts`. `cues.tsx` chỉ còn
`Sub`/`Caption2` và re-export từ `cues.core.ts`. `tsconfig.json` thêm
`"allowImportingTsExtensions": true` **cùng commit**. Gate: `node -e "import('./src/v2/phim/du-lieu.ts')"`
exit 0; `node --test src/v2/phim/*.test.ts` chạy với 1 test rỗng.

### e.1 `pipeline/tts-gemini.mjs` — sửa
- `sig = sha1(VOICE\nMODEL\nstyle\nvo\ntempo)`.
- **Tốc độ giọng là tiêu chí (TT-3):** style prompt mặc định thêm *"kể nhanh, dứt khoát, ngắt ngắn"*; tuỳ chọn `--tempo 1.15..1.25` qua ffmpeg `atempo` (kiểm `$FF -filters | grep atempo` ở bước 0; ffmpeg Remotion là bản rút gọn — nếu thiếu, chỉ dùng prompt). Nghiệm thu K26 (đo từ `mouth.json`): **≥ 2,8 âm tiết/s**, **X ≤ 28 %**. Hiện tại Charon: 2,06 âm tiết/s, X 39,3 % toàn bài (33,7 % ở `cho-ngoi`).
- Đổi giọng = sinh lại 14 chương (14 request; quota 10/ngày/cặp key×model × 6 cặp — đủ trong một ngày, h.5). Làm **ở bước 0**, trước khi có board nào.

### e.2 `pipeline/analyze-voice.mjs` — sửa
`--fps` mặc định đọc `FPS` từ `src/v2/fps.ts`; ranh giới frame `Math.round(i × SR / FPS)`;
tách `docPcm()` sang `pipeline/lib/pcm.mjs`; ghi `data/<ten>.voice24.json` `{fps: 24, am, nhan, nghi}`
(V1 `voice.json` giữ nguyên). `--fallback-mouth`: 3 mức X/B/C (e.3.4).

### e.3 `pipeline/lipsync.mjs <ten> [--fps 24] [--lead 2]` — sửa (bước 1–5 đã có)

1–5 như hiện có (WAV 16 k mono, `rhubarb -r phonetic --extendedShapes GHX`, quantize **trội theo thời lượng giao**, cache theo `sig`).
6. **Bỏ `gopNgan` toàn chuỗi** (TT-2). Chỉ `holdToiThieu(A, X, 2)`: run A hoặc X 1 frame mượn frame của láng giềng (Williams: phụ âm đóng ≥ 2 f); mọi ký hiệu khác được 1 frame. Cạnh `X→shape` đầu câu không dời.
7. `chenTrungGian`: A↔D chèn 1 frame C; B↔F chèn 1 frame E nếu chưa có.
8. `dichSom(lead = 2)`.
9. **`canCue`** (b.4): `tuTimings` → `canhCum` với X-run ≥ 6 f → ghi `data/<ten>.cues.json` `{[id]: {sig, fps, tu: MocTu[], thongKe: {ranhGioi, ghep, lechTruoc}}}` để xem/`--thong-ke`.
10. Ghi `mouth.json` `{[id]: MouthTrack}` (`fps 24, hold {A:2, X:2, khac:1}, lead 2`). In thống kê: `đổi/s nói`, `run 1-frame %`, `% A..X`, `âm tiết/s`, `X %` (K26), `% ranh giới ghép X-run` (K24).

Kỳ vọng: rhubarb 6,6 cue/s → cùng biến thể đảo mỗi frame ở rig, vùng miệng đổi ≥ 12/s khi nói.
Hiệu chuẩn thước đo **trước** khi áp cổng: `do-video.py --vung-mieng` trên `$S/ref-oV/ref.f398.mp4`
36–39 s phải ra ≈ 16–19 đổi/s (NC §5.1 đo 16/s).

#### e.3.4 Dự phòng không rhubarb
`am < 0,15 → X`, `< 0,45 → B`, còn lại `C`; hysteresis ±0,05; hold ≥ 3 f; `nguon: 'fallback'`;
`canhCum` dùng run `nghi` ≥ 6 f. Validator cảnh báo.

### e.4 `pipeline/kiem-tra-v2.mjs <ten> [--chuong <id>] [--json] [--thong-ke]` — viết lại kiểm 4+

Giữ kiểm 1–3. `ajv` với `board.schema.json` **sinh** từ `kieu-board.ts` → `giaiBoard()` từ
`du-lieu.ts` (frame thật, cùng hàm phim) → các kiểm dưới. Board cài lỗi
`$S/phan-bien/board-xau.json` (23 lỗi, hiện lọt 16) là một trong các tệp test.

| Mã | Kiểm | Mức |
|---|---|---|
| K4 | `say` và mọi `@từ` có thật trong `vo`; `@từ` rơi trong shot. `--thong-ke` in cho mỗi shot khoảng cách `from` → mốc nghỉ gần nhất (frame) và cờ `⚠ cắt giữa tiếng` khi `say` mở câu mà cách mốc nghỉ > 8 f | lỗi / cảnh báo |
| K5 | mọi tên ∈ `thu-vien.json` (kể cả `nhan_vat` khai trong board qua enum); `mat: oval` trên dien ≠ `nguoi_ke` | lỗi / cảnh báo |
| K6 | ≤ 1 `noi` mỗi shot; `trong`/`chu` không `dien`; `trong` có `dai` hoặc neo được | lỗi |
| K7 | `mouth.json` đủ chương, `sig` khớp mp3, `fps === FPS_V2`, mọi ký tự `frames` ∈ `MIENG_LIPSYNC`; thiếu → in lệnh `lipsync.mjs` | lỗi (cảnh báo nếu fallback) |
| K8 | `voice24.json.fps === 24` | lỗi |
| K9 | shot ≥ 6 f sau khi dời; hai shot trùng `from`; mốc bị dời (ghi số frame) | lỗi / cảnh báo |
| K10 | mỗi chương: trung vị shot **≤ 1,8 s**; **≥ 30 %** shot < 1 s; không shot > 8 s | cảnh báo |
| K11 | TD 12–25 % toàn phim; đoạn TD ≤ 7 s; rời TD ≤ 35 s | cảnh báo |
| K12 | `trong` tổng 5–10 %, mỗi beat ≤ 3,6 s (in số beat tự chèn) | cảnh báo |
| K13 | ≥ 1 `chu` / 15 s; `noi_dung` ≤ 12 ký tự/giây hiển thị | cảnh báo |
| K14 | `insert` ≤ 2,6 s; tệp ảnh tồn tại trong `public/` | lỗi |
| K15 | teleport: cùng `kieu` shot n→n+1 cùng `co`, `x` đổi > 0,15 không có `di`/`vao` | cảnh báo |
| K16 | một prop `cam` bởi hai người cùng frame | cảnh báo |
| K17 | `NaN` **chặn tại nguồn**: `co-ban.tsx` (`Net`, `daGiac`, helper path) và `rig/*` `if (!Number.isFinite(v) \|\| /NaN/.test(d)) throw new Error('NaN path: ' + ten)`; K17 = `xem-thu` 1 khung/chương exit 0 | lỗi |
| K18 | `IDLE.tho` bật ở `can/sat` | cảnh báo |
| K19 | **schema chặt**: `additionalProperties: false` mọi cấp; khoá/giá trị enum lạ → lỗi kèm gợi ý Levenshtein ≤ 2 ("bạn định viết `tai`?"); alias camelCase → cảnh báo | lỗi |
| K20 | **miền**: `x ∈ [0,1]`, `y ∈ [−0.1, 1.2]`, `co ∈ [0.3, 3]`, `dai ∈ [0.25, 8]`, mọi `tai`/`@từ` `< len` | lỗi |
| K21 | **ngữ nghĩa loai**: `phan-ung`/`dong-nguoi`/`tieu-canh`/`trang` không `noi`; `trang` không `mat` oval; `dac-ta` có ≥ 1 prop hoặc dien; người `noi` không `mat: nham` cả shot; > 1 dien không `bo_cuc` phải có `x` | lỗi / cảnh báo |
| K22 | tên **máy dùng** ở trường agent: `TU_THE_MAY`, `MIENG_LIPSYNC` (A–H, X) trong `dang`/`mieng` → lỗi kèm tên thay | lỗi |
| K23 | **bbox** từ `CO_CANH[co].dau × cao khung` sau `bo_cuc`/`zoom_buoc`: đè nhau (> 30 % giao) hoặc ra ngoài khung (> 25 % bbox) | cảnh báo |
| K24 | độ đúng neo (pipeline): % ranh giới câu ghép được X-run ≥ 80 %; trên `tinh-dau` trung vị lệch ≤ 0,15 s (≈ 4 f), p90 ≤ 0,4 s (`pipeline/test/do-neo.mjs`) | cảnh báo |
| K25 | mọi X-run ≥ 0,6 s phải trùng ranh giới shot hoặc nằm trong shot `trong`/`phan-ung`/`chu` (im lặng = chỗ cắt) | cảnh báo |
| K26 | giọng: ≥ 2,8 âm tiết/s, X ≤ 28 % (từ `mouth.json`) | cảnh báo |
| K27 | ghi đè `mat/may/mieng` tạo tổ hợp ngoài `TO_HOP_HOP_LE` | cảnh báo |
| K28 | `vat-la` > 15 % prop; shot `truc-dien` > 1,2 s không act và không đỉnh `nhan` được dùng | cảnh báo |
| K29 | hold > 72 f **không có cắt, snap hoặc chữ mới** trong shot có nhân vật | cảnh báo |

`--json` xuất `{loi, canhBao, thongKe}`; exit 1 khi có lỗi. `--thong-ke --chuong <id>` in
bảng **per-shot**: `from` (f), `len`, khoảng cách tới mốc nghỉ gần nhất, số act, hold dài
nhất, `sinhBoi`, cờ K4; và tổng: trung vị, % < 1 s, cắt/30 s, % TD, % trắng (tự chèn/khai),
chữ/15 s, act/shot, số shot đường tắt. Nghiệm thu C: **≥ 25 board lỗi mẫu** trong
`pipeline/test/board-loi-K*.json` — một tệp mỗi mã K, mỗi tệp ra **đúng** mã đó và không
ra mã khác; `board-xau.json` phải ra đủ 23 lỗi.

### e.5 `pipeline/xem-thu.mjs <ten> --chuong <id> [--moi-shot] [--act] [--nhap] [--frames a,b,c]` — MỚI

- Mặc định 6 still (đầu mỗi shot, ưu tiên có `dien`) qua `renderStill` API, scale 0,33, ghép sheet 2×3 nhãn `shot i · say · loai/co` → `out/xem-thu/<ten>-<id>.png`. ≈ 2,7 s/still (đo) → ~16 s/chương.
- `--moi-shot`: 1 still/shot ở scale 0,2 (≈ 20 ảnh 384×216 ghép 1 sheet) — agent Read toàn bộ shot, không chỉ 40 %.
- `--act`: thêm frame `tai + 1` sau mỗi act để thấy snap.
- `--nhap`: render chương (`render-segments.sh --chuong`) rồi chạy `do-video.py` và in JSON (cắt, trung vị, run tĩnh dài nhất, đổi vùng miệng/s) — agent đọc **trước** render toàn bài. Lưu ý đo thật: `--scale 0.33` chỉ nhanh hơn 5 % nên `--nhap` là render chương thật ≈ 45 s cho 33 s audio.
- Không còn `--kiem-nan` (K17 chặn tại nguồn).

### e.6 `pipeline/meta.mjs <ten>` — MỚI
Import `du-lieu.ts` (thuần) → `data/<ten>.meta.json` `{fps: 24, total, chuong: [{id, from, len}]}`
bằng đúng hàm phim dùng.

### e.7 `render-segments.sh <Comp> <out> [--chuong <id>]` — sửa **ở bước 0**
- `FPS`/`TOTAL`/ranh giới đoạn đọc từ `meta.json` (đoạn = chương, > 1500 f chia đôi); bỏ bảng map và `const FPS = 30` hardcode. V1 composition không có meta → giữ nhánh cũ (`fps 30`) tới bước 5.
- Cache **theo chương**: khoá `sha(board chương + voice24/mouth/cues chương + hashBundle)`; `hashBundle` = sha của `src/v2/**` + `src/engine/**` tính **một lần mỗi lần chạy**. Ghi thẳng: **đổi bất kỳ file trong `src/` = render lại toàn bài ≈ 12–16 phút** (14,7 k frame @ ≈ 20 khung/s đo được).
- Vòng nháp **không** dựa vào `--scale` (đo: 8,49 s vs 8,06 s cho 120 frame). Vòng nháp = `xem-thu` (16 s) + render đúng `--chuong` đang sửa (~45 s). Render toàn bài chỉ ở cuối g.5 và g.7.
- Retry 1 lần đoạn lỗi; `--concurrency=2..4`, `--crf=20`; fail-fast nếu < 12 khung/s.

### e.8 `pipeline/do-video.py <mp4> [--vung-mieng x,y,w,h --tu s --den s] [--json]` — MỚI
ffmpeg Remotion tách 24 fps 320 px → numpy: cắt (pixel-diff > 18 **hoặc** XOR mặt nạ nét
> 0,55), trung vị shot, % < 1 s, cắt/30 s; % khung tĩnh và **run tĩnh dài nhất**; đổi vùng
miệng/s tách "khi nói" / "khi nghỉ" (dùng `mouth.json` để biết); độ đột ngột cắt.
**Hiệu chuẩn bắt buộc trước khi dùng làm cổng**: chạy trên `ref.f398.mp4` 0–60 s phải ra số
cắt ≈ `master_starts.json` cùng đoạn (±10 %) và vùng miệng 36–39 s ≈ 16–19/s. Trên V1
`tinh-dau.mp4` **không** kỳ vọng 7,4 s (đó là đếm mốc board): đo thật 5–65 s ra trung vị
4,5 s vì `MoChong` 13 f và insert — chỉ dùng V1 làm smoke "chạy được".

### e.9 `pipeline/du-an-moi.mjs <ten> --du-an <du-an> [--chuong n]` — MỚI
Scaffold `scripts/<ten>.json`, `board/_chung.json`, `board/<id>.json` × n rỗng có `id` + `ghi_chu`
= lời bình, đăng ký composition vào `Root.tsx` giữa `// @du-an:begin/end` với `fps={FPS_V2}`,
`media/outbound/<ten>.md` khung ghi công.

### e.10 `pipeline/doi-soat.mjs` — MỚI (bước 0)
In bảng §0: `tsc`, số dòng `src/v2/**`, `Object.keys(PROPS).length` vs `PROP_TEN.length`,
tệp tồn tại (`chu.tsx`, `insert.tsx`, `mouth.json` + fps), `git status --short | wc -l`,
`node -e "import('./src/v2/phim/du-lieu.ts')"`. Lead chạy trước khi giao việc.

### e.11 `src/v2/phim/phim-v2.tsx` — generic
`taoPhim(du_an)` đọc `generated.json`, `voice24.json`, `mouth.json`, `board/`; `tinhDuration`;
project chỉ còn đăng ký. `kicker/heading` tuỳ chọn (hiện bằng `chu.kieu: nhan` nếu muốn);
`nhac` mặc định **`null`** (h.16).

---

## f. Thư viện `thu-vien.json` v2 và cách agent chọn

### f.1 Cấu trúc — **sinh** bởi `pipeline/thu-vien-v2.mjs` từ mã (adopt), đích là `thu-vien.json`

Đổi tên đích ngay **bước 0**: `thu-vien-v2.json` → `thu-vien.json`; bản V1 chép thành
`thu-vien-v1.json` cho `pipeline/kiem-tra.mjs` cũ; CLAUDE.md luật 3 và SKILL sửa cùng commit
(AL-10). Mỗi entry **bắt buộc** `{mo_ta, dung_khi}`; `dung_khi` lấy từ JSDoc tag `@dung_khi`
viết theo **lời bình** ("chờ đợi, phòng thủ"), không phải hình học; generator **fail** nếu thiếu.

```jsonc
{
  "phien_ban": 2, "nguon": "sinh từ src/v2 — không sửa tay",
  "loai_shot": {"truc-dien": {"mo_ta": "…", "dung_khi": "bình luận, 'tôi nghĩ'"}, "minh-hoa": {…}, "phan-ung": {…}, "dac-ta": {…}, "chu": {…}, "insert": {…}, "tieu-canh": {…}, "dong-nguoi": {…}, "trong": {…}},
  "co_canh": {"sat": {"dau_px": 1000, "chanY": 2.38, "dung_khi": "đặc tả mặt/vật"}, "can": {…560…}, "trung": {…380…}, "rong": {…230…}, "nho": {…150…}},
  "bo_cuc": {"mot": {…}, "hai-doi-dien": {…}, "ban": {…}, "lop": {…}, "hang-ngang": {…}},
  "nhan_vat": {"_": "khai trong board/_chung.json bằng các enum dưới", "toc_mai": ["lech-phai","lech-trai","ngang","re-giua","hat","dung"], "toc_lon": [0,2,4], "toc_sau": ["khong","bob","dai","duoi-ngua","bui","ngan"], "phu_kien": ["khong","kinh","no","mu-luoi-trai","huy-hieu","ca-vat","khan"], "khung": ["chinh","phu","tre"], "mat_cho_phep": ["cham","gach","nho"], "trang": {"mo_ta": "extras không mặt", "dung_khi": "đám đông, người qua đường; dùng so_luong"}},
  "prop": {"_": "vẽ nét, không tô; gốc ở đáy; co nhân lên cao_dau",
           "ban-hoc": {"mo_ta": "bàn học có ghế", "dung_khi": "lớp, học, ngồi", "cao_dau": 1.3, "cam": false}, "…": {},
           "vat-la": {"mo_ta": "khối nét đơn (hop|tru|tron|tam) + nhãn tay có mũi tên", "dung_khi": "BẤT KỲ vật chưa có trong thư viện — không dừng hỏi người", "cao_dau": 1.0}},
  "tu_the": {"dung": {"mo_ta": "…", "dung_khi": "kể bình thường"}, "chi": {"dung_khi": "khẳng định, vạch ra, con số"}, "hai-tay-xoe": {…}, "…": {}},
  "_may_dung": {"tu_the": ["nhay-1","nhay-2","lao-vao","di-a","di-b","chay-a","chay-b"], "hinh_lipsync": ["X","A","B","C","D","E","F","G","H"], "_": "agent KHÔNG đặt — K22 chặn"},
  "sac_thai": {"thuong": {"mat": "oval", "may": "khong", "mieng": "mim", "dung_khi": "…"}, "…": {}},
  "mat": {"oval": {"dung_khi": "CHỈ người kể"}, "cham": {…}, "gach": {…}, "…": {}}, "may": {…},
  "mieng_cam_xuc": {"mim": {…}, "cuoi": {…}, "…": {}},
  "huong_dau": ["truoc", "ba-phan-tu", "nghieng"],
  "act_kieu": {"snap": {…}, "keys": {"dung_khi": "chuyển động lớn, quay đầu"}, "vao": {…}, "ra": {…}, "di": {…}},
  "chu_kieu": {…}, "chu_vi_tri": [...], "chu_vao": ["tuc-thi","tung-tu","phong"],
  "sfx": {…}, "nhac": {…}, "giong_tts": {…}
}
```

Không có: `nen`, `canh_cu`, `insert.an-du`, `insert.clip`, `tay`, `mieng` trộn lipsync với cảm xúc.

### f.2 Cách agent OpenClaw chọn — `.claude/skills/tao-video/` **viết ở bước 1** (D), đóng băng cùng schema

**Vòng lặp chuẩn (mỗi chương một vòng):** viết `board/<id>.json` → `kiem-tra-v2 --chuong <id>
--thong-ke` → `xem-thu --chuong <id> --moi-shot --act` → sửa → chương kế. `--nhap` trước khi
render toàn bài. Không bao giờ sinh cả 14 chương trong một lượt.

**`bo-cuc-shot.md`** — luật cắt: cắt theo **từ** (1,7 cắt/câu); bảng lời → `loai`; **mọi im
lặng ≥ 0,6 s là chỗ cắt** (beat tự động đã lo phần sau dấu chấm — agent chỉ tắt bằng `beat:
false` khi cần nối); dùng `bo_cuc` thay số; cỡ giữ khi đổi nội dung, leo bước bằng `zoom_buoc`
cho câu chốt; trực diện ≤ 7 s, rời TD ≤ 35 s.

**`dien-xuat.md`** — một động từ thấy được = một act `@từ`; `sac` đổi cùng act, `mat/may/mieng`
chỉ khi ghi đè; đối thoại hai người = `bo_cuc: hai-doi-dien` (đầu 3/4 nhìn nhau); quay
đầu = `keys` chuỗi `huong`; cầm = `cam`; đường tắt `phan_ung`, `nhan`; bảng `TU_CU_CHI`
(lời → cử chỉ) — cùng bảng `act.ts` dùng cho tự động.

**`chu-va-insert.md`** — chữ khi có danh từ riêng/con số/câu lặp/lời người khác; `the`
`tung-tu` cho câu chốt; ≤ 12 ký tự/s; insert chỉ ảnh thật được nhắc, ≤ 2,6 s.

**Luật vàng:** miệng do máy; mọi tên lấy từ `thu-vien.json`; thiếu prop → `vat-la` + `nhan`,
**không dừng hỏi người**; thiếu nhân vật → khai trong `nhan_vat`, không nhờ dev.

Golden board: `docs/vi-du/cho-ngoi.json` (b.8) kèm trong references làm mẫu đọc.

---

## g. Kế hoạch thực thi

### g.0 Nguyên tắc
- Mỗi bước kết thúc bằng **một composition render được** và **một test sheet** trong `src/v2/dev/`.
- **Không ai sửa file của người khác.** Giao diện chung: `src/v2/board/kieu-board.ts` (schema), `src/v2/phim/{act,timing}.ts` (hợp đồng + hằng), `src/engine/cues.core.ts`, `src/v2/fps.ts` — Lead viết ở bước 0 và **đóng băng**; đổi phải qua Lead.
- `TinhDau` V1 giữ chạy được (30 fps, `voice.json`, `thu-vien-v1.json`) tới khi `TinhDau2` đạt parity 14/14.
- Ngưỡng nghiệm thu = **≥ 80 % giá trị đo từ tham chiếu**, hiệu chuẩn `do-video.py`/`do-net.py` trên `ref.f398.mp4` trước; không hạ ngưỡng theo hạn chế pipeline.
- Đo bằng script: `tsc`, `kiem-tra-v2 --json`, `do-video.py`, `do-net.py`, `node --test`.

### g.1 Bước 0 — Lead (1,5 ngày). Hợp đồng, chuỗi thuần, FPS, giọng

Việc (thứ tự trong ngày):
1. `pipeline/doi-soat.mjs`; commit 27 mục đang treo.
2. **e.0 chuỗi thuần**: đuôi `.ts` cho mọi import giá trị trong danh sách e.0; tách `src/engine/cues.core.ts` (`splitCues`, `cueTimings`, **`tuTimings`, `canhCum`, `neoTu`**, `MocTu`); `cues.tsx` re-export; `tsconfig.json` `allowImportingTsExtensions`.
3. **FPS tách thế hệ**: `src/v2/fps.ts` = 24; `du-lieu.ts`, `san-khau.tsx`, `chu.tsx`, `phim-v2.tsx`, `lipsync.mjs`, `analyze-voice.mjs` import từ đó; `theme.ts` giữ 30; `Root.tsx` truyền `fps` riêng từng composition; `pipeline/meta.mjs` + `render-segments.sh` đọc meta — **một commit**.
4. `CO_CANH` mới + `X_MAC_DINH` + `net()` (b.5) — **một commit**; `RigV2Test` 5 cỡ.
5. Schema: áp diff §0.2 vào `kieu-board.ts` (B làm dưới giám sát Lead vì đóng băng ngay); dev-dep `ts-json-schema-generator`, `ajv`; `thu-vien-v2.mjs --schema` sinh `board.schema.json`; đích `thu-vien.json` (+ `thu-vien-v1.json`, sửa CLAUDE.md luật 3).
6. `src/v2/phim/timing.ts` (c.8), `act.ts` hợp đồng (`TrangThaiRig`, `MouthTrack`, `VoiceTrack`), `src/v2/rig/sac.ts` (bảng c.3), `TU_THE` kebab + `TU_THE_MAY` + `ALIAS`.
7. Giọng: style prompt + `--tempo`; sinh lại 14 chương `tinh-dau` + `demo-v2` đạt K26; `analyze-voice --fps 24` → `voice24.json`; `lipsync.mjs` 24 fps (bước 6–10 của e.3 do C viết ở bước 1, Lead chạy bản hiện có trước để có `mouth.json` 24 fps tạm).
8. Stub `src/v2/dev/{mieng-test,act-test}.tsx`; `pipeline/test/do-neo.mjs` (đo K24), `pipeline/lib/pcm.mjs`; `tools/rhubarb/README.md`; chép tư liệu `$S` → `docs/tham-chieu/` (h.9).
9. `src/library/cast/dien.tsx`, `cast.tsx`, `pipeline/tts.mjs` → `src/attic/`.

Nghiệm thu: `npx tsc --noEmit` exit 0 · `node -e "import('./src/v2/phim/du-lieu.ts')"` exit 0 ·
`node --test src/v2/phim/*.test.ts` chạy (test rỗng) · `node pipeline/test/do-neo.mjs tinh-dau`
in % ghép ≥ 80 %, trung vị lệch ≤ 0,15 s · `npx remotion compositions` liệt kê ≤ 5 s ·
still `TinhDau` (V1, 30 fps) frame 900 **giống bit** trước bước 0 (`cmp`) · `render-segments.sh`
đọc `meta.json` cho `DemoV2` (`total` = tổng frame thật, không hơn) · `lipsync.mjs tinh-dau` in
K26 đạt · `doi-soat.mjs` xanh.

### g.2 Bước 1 — 4 dev song song (2 ngày). Nguyên liệu

| Dev | Sở hữu file | Sản phẩm | Nghiệm thu (đo được) |
|---|---|---|---|
| **A — Rig** | `src/v2/rig/{hinh,kieu,toc,tu-the,mat,mieng,tay,nhan-vat}.ts(x)`, `src/v2/dev/{rig-test,mieng-test}.tsx` | `Dau` 3 hướng (c.3) + toạ độ mắt/miệng/tóc theo hướng; 9 miệng × 3 biến thể + 12 cảm xúc; `mat` mặc định `cham`; `TU_THE` kebab, `di-a/di-b/chay-a/chay-b` | `MiengTest`, `RigV2Test` (8 kieu × 3 hướng × 5 cỡ) render; `do-net.py` nét trung vị = `netDay(CO_CANH[co].dau) ± 1` ở 5 cỡ; `--ti-le` cao/H 55 % (`rong`), 36 % (`nho`), đầu/vai 1,6–1,9; màu khác trắng/đen ≤ 2; `grep -c 'scale(' src/v2/rig/mieng.tsx` = 0; 0 `Gradient`/`filter` |
| **B — Engine** | `src/v2/phim/{du-lieu,act,san-khau,phim-v2}.ts(x)`, `src/v2/{chu,insert}.tsx`, `src/v2/phim/*.test.ts`, `src/v2/dev/act-test.tsx` | `giaiBoard` (b.4: neoTu, canhCum, beat tự động, `bo_cuc`, đường tắt, dời + cảnh báo), `giaiDien`, `khungTai` bước cỡ, cử chỉ theo `nhan`, `ALIAS`, `chu.tsx` theo d.6, `insert.tsx` theo d.7 | `node --test` xanh: **15 `say` của b.8 → 15 `from` khác nhau**; `@từ` = từ đầu shot kế → lỗi K20; beat tự động trên `cho-ngoi` = 4 (2 khi `beat: false`), % trắng 7,6 ± 0,5; snap đúng frame; `vao` 4 frame; `keys` quay đầu 3 hình; shot 200 f không act → K29 phát hiện; `ActTest` 10 s: `do-video.py` đếm đúng số sự kiện khai trong test (±0), 0 frame nội suy |
| **C — Pipeline** | `pipeline/{lipsync,analyze-voice,tts-gemini,thu-vien-v2,doi-soat}.mjs`, `pipeline/do-video.py`, `pipeline/do-net.py`, `pipeline/lib/*`, `tools/rhubarb/` | `mouth.json` 24 fps A/X ≥ 2 f + `cues.json`; `voice24.json`; thống kê; `thu-vien.json` với `dung_khi`, `_may_dung`; `do-video`/`do-net` hiệu chuẩn | `lipsync.mjs tinh-dau`: 14/14, lần 2 < 0,5 s, **run 1 frame ≥ 50 %** (ký hiệu ≠ A/X), A run ≥ 2 f 100 %, in K24/K26; `do-video.py` trên `ref.f398.mp4` 0–60 s: số cắt = `master_starts.json` ±10 %, vùng miệng 36–39 s = 16–19/s; trên `ActTest` = số sự kiện khai ±0; `thu-vien-v2.mjs` fail khi thiếu `@dung_khi` |
| **D — Thư viện + Skill** | `src/v2/props/*`, `src/v2/dev/props-test.tsx`, `src/engine/font.ts`, `.claude/skills/tao-video/**`, `docs/vi-du/cho-ngoi.json`, `src/projects/tinh-dau/board/` | `vat-la` + `PropMeta {cao_dau, cam, mo_ta, dung_khi}` cho 29 prop; **SKILL v2 + 3 references + golden board** (f.2); board `_chung.json` + 4 chương | `PropsV2Test`: `do-net.py` nét `netDay(380) ± 1`, 0 fill ngoài nhấn, `grep -cE '#[0-9a-f]{6}' src/v2/props/*` ≤ 3; `kiem-tra-v2 tinh-dau --chuong cho-ngoi` = 0 lỗi (golden); font "ắ ộ ữ" không tofu |

### g.3 Bước 2 — 4 dev song song (3 ngày). Lắp và validator

| Dev | Sở hữu file | Sản phẩm | Nghiệm thu |
|---|---|---|---|
| **A** | như g.2 + `src/v2/rig/sac.ts` (hoàn thiện `TO_HOP_HOP_LE`) | `NhanVat` nhận `TrangThaiRig`; `Trang` + `DamDong` (`tre`); tóc theo hướng; JSDoc `@dung_khi` đủ | `RigV2Test` 2400×1400: đầu/cao 38–42 %; `grep -c 'id={\`' = grep -c '${id}'`; `thu-vien-v2.mjs` xanh |
| **B** | như g.2 + `src/Root.tsx` | `taoPhim()` generic; `TinhDau2` đăng ký `fps={FPS_V2}`; `DemoV2` | `render-segments.sh TinhDau2 --chuong cho-ngoi` ≤ 60 s; `do-video.py`: **≥ 20 cắt / 33 s**, 100 % cắt cứng, run tĩnh dài nhất ≤ 72 f |
| **C** | `pipeline/{kiem-tra-v2,meta,xem-thu,du-an-moi}.mjs`, `render-segments.sh`, `pipeline/test/*` | K4–K29, `--json`, `--thong-ke` per-shot; `xem-thu` 3 chế độ; render theo chương + cache chương | **≥ 25 board lỗi mẫu** mỗi tệp ra đúng 1 mã; `board-xau.json` ra đủ 23; golden b.8 = 0 lỗi; `render-segments.sh TinhDau` (V1) vẫn ra 18.846 frame |
| **D** | `src/projects/tinh-dau/board/*.json` (4 chương: `cho-ngoi cay-but long-treu ghe-da`), `demo-v2/board/*`, skill | 4 chương board v2 viết theo skill (D đóng vai agent, ghi log số vòng) | `kiem-tra-v2 tinh-dau --json` 0 lỗi 4 chương; `--thong-ke`: trung vị ≤ 1,8 s, ≥ 30 % < 1 s, ≥ 18 cắt/30 s, trắng 5–10 %, ≥ 1 chữ/15 s; `demo-v2/board.json` viết lại không `tai` → 0 cảnh báo thứ tự |

### g.4 Bước 3 — Tích hợp một chương (1 ngày, B + A; C + D hỗ trợ)

`TinhDau2` chương `cho-ngoi` với rig thật, mouth thật, chữ, prop, sfx. Cổng (đo trên
`out/tinhdau2-cho-ngoi.mp4` bằng `do-video.py --vung-mieng`, bbox từ `xem-thu`):
1. **≥ 18 cắt trong 30 s đầu**; trung vị shot ≤ 1,8 s; ≥ 30 % < 1 s; 100 % cắt cứng.
2. Shot `noi: true`: vùng miệng đổi **≥ 12 lần/s** khi `am > 0,15`, run 1 frame ≥ 50 %; **0 lần** khi `nghi`.
3. Không hold > **72 frame** mà **không có cắt, snap hoặc chữ mới** (K29 = 0 cảnh báo).
4. Ngoài vùng miệng, trong hold: diff = 0.
5. `do-net.py` trên 3 still: nét = `netDay(dau) ± 1`.
6. Render ≥ 15 khung/s.
7. Mắt: sheet `xem-thu --moi-shot` so `$S/ref-oV/burst/sheet_talk.jpg`: lệch phải 38–44 %, nửa trái trống, chữ không đè mặt, hai người đối diện nhìn nhau bằng đầu 3/4.

### g.5 Bước 4 — 14 chương (3 ngày, D viết theo skill, A/B sửa lỗi, C theo dõi số)

Mỗi chương một commit; vòng lặp f.2 (`kiem-tra --thong-ke` → `xem-thu --moi-shot` → `--nhap`);
**không render toàn bài** cho tới chương 14. `di`/`vao`/`ra` ≥ 3 chương; `keys` quay đầu ≥ 3;
`hai-doi-dien` ≥ 3; `dong-nguoi` ≥ 2; `vat-la` ≤ 15 %.

Nghiệm thu: `kiem-tra-v2 tinh-dau --json` 0 lỗi, ≤ 5 cảnh báo; toàn phim: TD 12–25 %,
trắng 5–10 %, trung vị ≤ 1,8 s, ≥ 30 % < 1 s; render toàn bài ≥ 15 khung/s (một lần, ≈ 12–16 phút);
`do-video.py` K29 = 0.

### g.6 Bước 5 — Dọn (0,5 ngày, Lead)
`TinhDau` V1, `RaTruong*` → attic (`theme.ts FPS` chỉ còn V1 attic dùng → xoá khỏi V2);
`voice24.json` → `voice.json`; `thu-vien-v1.json` xoá; `TinhDau2 → TinhDau`; cập nhật
`ARCHITECTURE.md`, `USECASE.md`, `README.md`. `git grep -l "dien.tsx\|MoChong\|NGAN_NHAT\|engine/theme" src/v2 pipeline` rỗng.

### g.7 Bước 6 — Agent chạy thật + demo 30 s (1 ngày, D + C)

`demo-30s` (1 chương, kịch bản mới, chủ đề **ngoài trường học** để ép `nhan_vat` + `vat-la`, TTS 1 request).
Nghiệm thu **đo chất lượng lần đầu, không chỉ hoàn thành**: phiên agent **mới** (không có ngữ
cảnh dev) chạy skill trên `demo-30s` và 1 chương `tinh-dau` → `kiem-tra --json` lần đầu ≤ 2
lỗi + ≤ 5 cảnh báo, về 0 lỗi trong ≤ 2 vòng, `--thong-ke` đạt A10 không ai sửa tay; log vòng
lặp lưu `docs/tham-chieu/log-agent-*.md`. Video: ≥ 18 cắt/30 s; miệng ≥ 12 đổi/s khi nói;
K29 = 0; `kiem-tra` 0 lỗi.

### g.8 Bản đồ sở hữu file (tổng)

```
A  src/v2/rig/{hinh.ts, kieu.ts, sac.ts, toc.tsx, tu-the.ts, mat.tsx, mieng.tsx, tay.tsx, nhan-vat.tsx}
   src/v2/dev/{rig-test.tsx, mieng-test.tsx}
B  src/v2/phim/{du-lieu.ts, act.ts, san-khau.tsx, phim-v2.tsx, *.test.ts}  src/v2/{chu.tsx, insert.tsx}
   src/v2/dev/act-test.tsx  src/Root.tsx
   src/v2/board/kieu-board.ts — chỉ sửa theo §0.2 dưới giám sát Lead (đóng băng sau bước 0)
C  pipeline/{lipsync, kiem-tra-v2, thu-vien-v2, analyze-voice, tts-gemini, meta, xem-thu, du-an-moi, doi-soat}.mjs
   pipeline/{do-video.py, do-net.py}  pipeline/lib/*  pipeline/test/*  render-segments.sh  tools/README.md
D  src/v2/props/{co-ban.tsx, index.tsx, truong-hoc.tsx, do-vat.tsx, ngoai-troi.tsx, gag.tsx, vat-la.tsx}  src/v2/dev/props-test.tsx
   src/engine/font.ts  src/projects/tinh-dau/board/*  src/projects/demo-v2/board/*  scripts/demo-v2.json
   .claude/skills/tao-video/**  docs/vi-du/cho-ngoi.json
Lead (bước 0, sau đó đóng băng): src/v2/fps.ts  src/v2/phim/timing.ts  src/engine/cues.core.ts  src/engine/neo.ts
   tsconfig.json  package.json  .gitignore  CLAUDE.md  thu-vien.json (đích sinh)  docs/
```

Cũ không đụng (V1 chạy tới bước 5): `src/library/**`, `src/projects/*/board.ts`,
`src/projects/tinh-dau/phim.tsx`, `src/engine/theme.ts`, `pipeline/kiem-tra.mjs`,
`thu-vien-v1.json`, `data/<ten>.voice.json` (30 fps).

---

## h. Rủi ro và cách hạ

| # | Rủi ro | Bằng chứng | Cách hạ |
|---|---|---|---|
| 1 | **Rhubarb x86_64 qua Rosetta**; CI arm64/Linux | NC §5.2 | `tools/rhubarb/README.md`; env `RHUBARB`; `--fallback-mouth`; validator cảnh báo fallback |
| 2 | **Rhubarb không xác định** (1,6–3,2 % frame) | NC §5.2 | cache theo `sig`; `mouth.json` commit (47 KB) |
| 3 | **Cấp âm vị ≈ 60 %** — đặc tả miệng dài lộ | NC §5.2 | skill: `dac-ta` mặt đang nói ≤ 2 s; giai đoạn 2 whisperX `vi` |
| 4 | **Sàn render ≈ 20 khung/s** máy này; `--scale` không giúp (−5 %) | đo `$S/bench2/` | cấm filter/blur; render theo chương + cache chương; vòng nháp = still + chương; fail-fast < 12 khung/s |
| 5 | **TTS quota 10 req/ngày/cặp**; đổi tốc độ giọng phải sinh lại 14 chương | audit | làm ở bước 0 **trước** mọi board; 6 cặp key×model = 60/ngày; backup `public/vo-*`; test dùng voice giả |
| 6 | **Hai FPS song song** (V1 30, V2 24) tới bước 5 | §0 | tách tệp: `voice.json` (V1) / `voice24.json` (V2); K7/K8 chặn sai fps; `Root.tsx` fps riêng; gate "still V1 giống bit" |
| 7 | **Nợ song song** rig/schema/`dung()` | audit | thứ tự bước 0–5; xoá cũ khi parity 14/14 |
| 8 | **Chrome hệ thống** tự cập nhật | audit | render theo chương, retry 1, `--timeout 120000` |
| 9 | **Scratchpad tạm** — mất tư liệu đo/binary | môi trường | bước 0 chép `$S/ref-oV/tools/Rhubarb-*` → `tools/rhubarb/`; `$S/{neo-test,neo-tu-test,can-cue-test}.mjs`, `rh_test.json`, `cho-ngoi.tu-can.json`, `phan-bien/board-xau.json`, `ref-oV/{style,strips,burst,timing_rules.json,cuts_px.json}`, `shotgram/{labels,master_starts}.json`, `audit/` → `docs/tham-chieu/` (≤ 20 MB) |
| 10 | **Agent viết board kém lần đầu** | USECASE 8 lời chê; demo-v2 434 số tự đặt, 4/4 chương cảnh báo thứ tự | `bo_cuc` + đường tắt giảm số phải viết; K19–K23 chặn lớp lỗi đo được; `--thong-ke` per-shot + `xem-thu --moi-shot/--act/--nhap` làm vòng phản hồi có **thời gian**; g.7 đo chất lượng lần đầu của phiên agent mới |
| 11 | **`defs id` trùng** | audit | `useId()` prefix; lint g.3 |
| 12 | **`warpPath` NaN im lặng** | NC §8.2 | throw tại nguồn (K17); không `warpPath` mỗi frame |
| 13 | **Font hệ thống khác máy** | audit | mọi chữ qua `src/engine/font.ts` (Be Vietnam Pro, Patrick Hand, subset `vietnamese`) |
| 14 | **Bitrate ×20 nếu boil** | NC §8.3 | boil opt-in ≤ 20 % shot |
| 15 | **Walk cycle nhìn ngang** thiếu mẫu | NC §1.3 | `ActTest` dải 48 frame; `di` hiếm |
| 16 | **Nhạc CC BY** phải ghi công | audit | `nhac: null` mặc định; `<ten>.md` sinh sẵn ghi công |
| 17 | **Hai bản đồ file** — đã xử lý: a–h chỉ dùng đường dẫn `src/v2/`; `doi-soat.mjs` chạy trước khi giao việc | `git status` | không ai tạo file ngoài g.8 |
| 18 | **`canhCum` ghép sai** khi TTS ngắt hơi không ở dấu câu (6/13 X-run của `cho-ngoi` không có dấu câu) hoặc dấu câu không có nghỉ (2/9) | `$S/can-cue-test.mjs` | cửa sổ ±1,5 s, mỗi X-run dùng một lần, chỉ ghép ranh giới có dấu; K24 in % ghép; `--thong-ke` in `nguon` từng mốc; giai đoạn 2 whisperX |
| 19 | **Hướng đầu ×3** nhân khối lượng vẽ của A (3 sọ × 8 kieu × tóc) | c.3 | tóc sinh từ path `truoc` bằng dịch/cắt; profile dùng chung 1 sọ + 1 mắt; nghiệm thu bước 1 chỉ cần 3 hướng cho `nguoi_ke` + `trang`, các kieu khác bước 2 |
| 20 | **Cổng miệng ≥ 12 đổi/s** phụ thuộc bộ dò `do-video.py` | e.8 | hiệu chuẩn trên `ref.f398.mp4` 36–39 s trước; ngưỡng ghi kèm phương pháp đo |

---

### Phụ lục — quyết định kỹ thuật then chốt (một dòng mỗi cái)

1. FPS 24 (`src/v2/fps.ts`), 1920×1080; V1 giữ 30 trong `theme.ts` tới bước 5.
2. Board là JSON chia theo chương; schema gốc duy nhất `kieu-board.ts`, `board.schema.json` sinh tự động; validator và phim dùng chung chuỗi thuần `.ts`.
3. Mốc thời gian cấp **từ** (`tuTimings`) căn theo **X-run rhubarb** (`canhCum`); `neoTu` cho `say`/`@từ`/`tung-tu`; cụm 7 từ chỉ còn cho phụ đề.
4. Snap 1 frame; `keys` 3–5 hình rời (kể cả quay đầu 3 hướng); pop-in 1 frame; không spring/ease/motion line.
5. Lip-sync: rhubarb `GHX` → 8 hình + X; on ones, A/X ≥ 2 f; 3 biến thể đảo mỗi frame; dịch sớm 2; miệng cảm xúc thay X, **đứng yên**.
6. **Không chớp mắt tự động**; `nham` là trạng thái; hold > 72 f không sự kiện = lỗi dựng (K29).
7. Nền trắng duy nhất; prop rời không tô; `vat-la` cho vật chưa có; không `an-du`/`canh_cu`/`clip`.
8. Cỡ cảnh một bảng 150/230/380/560/1000 + `chanY`; `zoom_buoc` = bước cỡ vẽ lại, không scale.
9. Phân cấp mặt: oval chỉ người kể; nhân vật khác chấm/gạch; extras `trang`.
10. `sac` là dữ liệu (bảng `SAC`); `bo_cuc` preset; đường tắt `phan_ung`/`nhan`; beat tự động từ X-run; `tu_dong` theo đỉnh `nhan`.
11. Nhịp: giọng TTS phải đạt ≥ 2,8 âm tiết/s, X ≤ 28 % (bước 0); cổng trung vị ≤ 1,8 s, ≥ 30 % < 1 s, ≥ 18 cắt/30 s, miệng ≥ 12 đổi/s — ≥ 80 % tham chiếu.
12. Validator chặt (K19–K23) với ≥ 25 board lỗi mẫu; thu-vien có `dung_khi`, `_may_dung`; SKILL v2 viết ở bước 1, đo chất lượng lần đầu của agent ở g.7.

---

## Phản biện đã xét (2026-09-10)

Ba góc phản biện, 36 mục. **Sửa** = đã đổi thiết kế ở mục ghi; **Bác bỏ** = giữ, có lý do;
**Một phần** = nhận ý chính, đổi cách làm. Bằng chứng đo của phản biện nằm ở
`$S/{neo-test.mjs, bench2/, v1cut/, rh_test.json, phan-bien/board-xau.json}`; đo bổ sung khi
sửa: `$S/{neo-tu-test.mjs, can-cue-test.mjs, can-cue-test2.mjs, cho-ngoi.tu-can.json}`.

| Mã | Mức | Vấn đề | Xử lý |
|---|---|---|---|
| KT-1 | chặn | `neo()` độ phân giải cụm 7 từ; 3/15 `say` của b.8 trùng `from`, 7/9 `@từ` rơi đầu shot | **Sửa** b.4/b.6: `tuTimings` cấp từ (trọng số cũ), `neoTu` trả start của từ ≥ `tuFrame`; cụm chỉ cho phụ đề; test "15 say → 15 from" trong g.2 B. Đo: 15/15 (`neo-tu-test.mjs`) |
| KT-2 | chặn | g.1–g.3 trỏ `src/engine/core/*`, `src/library/cast/*`; hai nguồn schema | **Sửa** g.1–g.3, g.8 bằng đường dẫn `src/v2/`; `board.schema.json` sinh từ `kieu-board.ts`; quy ước đầu tài liệu |
| KT-3 | chặn | `theme.ts FPS` dùng chung V1/V2; `timing.ts` FPS thứ hai; `render-segments.sh` hardcode 30 | **Sửa** §0.1, c.8, e.2, e.7, g.1-3: `src/v2/fps.ts`, `theme.ts` giữ 30, `Root.tsx` fps riêng, meta cùng commit, `voice24.json` tách tệp; gate V1 giống bit giữ |
| KT-4 | chặn | `Shape` 8 ký hiệu thiếu H; `MouthTrack.fps: 24` literal | **Sửa** c.3/c.7: `Shape = typeof MIENG_LIPSYNC[number]`; `fps/hold/lead: number`, K7 ép giá trị; test mọi ký tự ∈ `MIENG_LIPSYNC` |
| KT-5 | lớn | `du-lieu.ts` Node không nạp (import không đuôi, kéo `cues.tsx`) | **Sửa** e.0: danh sách chuỗi thuần, đuôi `.ts`, `cues.core.ts`, `allowImportingTsExtensions`, gate g.1 |
| KT-6 | lớn | "scale 0,33 nhanh 9×" sai (đo −5 %); cache theo `src` | **Sửa** e.7/e.5: xoá 9×; nháp = still + render chương; cache theo chương + hashBundle; ghi "đổi src = 12–16 phút" |
| KT-7 | lớn | b.5 lệch `CO_CANH` thật 4/5 cỡ, DAU 230/380 không tồn tại | **Sửa** §0.1 hàng Cỡ cảnh, b.5, §0.2: một bảng 150/230/380/560/1000 + `chanY` tính lại; ngưỡng nét dạng `netDay(CO_CANH[co].dau) ± 1` |
| KT-8 | lớn | b.3 vs §0.2 lệch 4 chỗ (`pop`, `clip`, `zoom_gag/rung`, `nen toi/canh`) | **Sửa** §0.2 thành diff TS duy nhất; quyết: không `pop`, không `clip` (chưa có clip nào, tham chiếu 1 lần; thêm khi có nhu cầu đo được), không `rung`, `zoom_gag` = `Chu.vao: phong`, bỏ `nen`; `Shot.tai` bỏ |
| KT-9 | lớn | `BLINK [72,120]` mâu thuẫn gate 72 f | **Sửa** theo TT-8: tắt chớp; cổng đổi thành "không hold > 72 f không có cắt/snap/chữ" (K29) — mâu thuẫn biến mất |
| KT-10 | lớn | §0 lạc hậu (tsc xanh, chu/insert/28 prop/mouth.json đã có) | **Sửa** §0 đối soát lại 2026-09-10 lần 2; thêm `pipeline/doi-soat.mjs` (e.10) |
| KT-11 | nhỏ | Tiêu chí Dev C "7,4 s trên V1" đo không ra (4,5 s) | **Sửa** g.2 C / e.8: ground truth = `ActTest` (±0) + `ref.f398.mp4` 60 s (±10 %); V1 chỉ smoke |
| KT-12 | nhỏ | K17 qua `onBrowserLog` không code được; rung miệng 0,97–1,0 mâu thuẫn A4/A6 | **Sửa** e.4 K17 throw tại nguồn; **xoá** rung miệng (c.3, A4) |
| TT-1 | chặn | Toàn bộ thời gian dựa `cueTimings` ước lượng, lệch trung vị 0,65 s | **Sửa** b.4: `canhCum` ghép ranh giới dấu câu vào X-run (đo `cho-ngoi`: 7/9 ghép, lệch trước căn 0,55 s); K24 ≥ 80 % ghép, trung vị ≤ 0,15 s; `cues.json`; giai đoạn 2 whisperX |
| TT-2 | chặn | Hold ≥ 2 toàn chuỗi + cổng 3 đổi/s = 1/6 tham chiếu | **Sửa** A6, e.3, c.3, g.4: bỏ `gopNgan`, chỉ A/X ≥ 2 f, 3 biến thể đảo mỗi frame; cổng ≥ 12 đổi/s, run 1 f ≥ 50 %; hiệu chuẩn trên ref 36–39 s |
| TT-3 | chặn | Nhận giọng chậm làm tiền đề rồi nới nhịp | **Sửa** e.1 K26 (≥ 2,8 âm tiết/s, X ≤ 28 %) ở bước 0; K10 ≤ 1,8 s / ≥ 30 % < 1 s; K25 im lặng = chỗ cắt; cổng ≥ 18 cắt/30 s; b.8 viết lại tự đạt (26 shot, 1,21 s, 35 %, 23 cắt/30 s, trắng 7,6 %) |
| TT-4 | chặn | Rig chỉ mặt trước; không dựng được quay đầu/đối thoại | **Sửa** c.3 `huong: truoc/ba-phan-tu/nghieng`, 3 sọ + 3 bảng toạ độ, tóc theo hướng; `keys` quay đầu; `bo_cuc: hai-doi-dien`; g.2 A bước 1; rủi ro h.19 |
| TT-5 | lớn | `zoom_buoc` scale quanh tâm khung = lỗi NC §9.1-6 | **Sửa** d.5/§0.2: bước **cỡ** `[T, CoCanh]` vẽ lại; K23 bbox sau bước |
| TT-6 | lớn | `CO_CANH` khác b.5, `net()` khác A2 | **Sửa** như KT-7; `net()` clamp; sửa mã bước 0 cùng commit; `do-net.py --ti-le` 55 %/36 % |
| TT-7 | lớn | Rung miệng khi im 12 lần/s | **Sửa** xoá khỏi c.3; lint `scale(` trong `mieng.tsx` |
| TT-8 | lớn | Chớp mắt + cổng 72 f đánh trượt cả tham chiếu | **Sửa** A11, c.8 `BLINK.bat = false`; cổng g.4-3/g.5/g.7 → "không hold > 72 f không có cắt/snap/chữ mới" |
| TT-9 | lớn | Cử chỉ hash theo cụm 3 s, bỏ `nhan` | **Sửa** d.8: đỉnh `nhan` phân vị 70, hold 8–27 f, bảng từ→cử chỉ, act agent ưu tiên, K28 |
| TT-10 | lớn | 5 nhân vật phụ mang oval + khung `chinh` | **Một phần**: oval chỉ `nguoi_ke`, mọi kieu khác `cham`/`gach`, K5 cảnh báo (nhận); **giữ khung `chinh`** cho bạn cùng tuổi `ha/long/mai` vì NC §4.3 trẻ phụ 2,5 đầu ≈ 2,6, chỉ người lớn `phu` — phân cấp làm bằng mắt, không bằng chiều cao |
| TT-11 | lớn | `an-du` 51 màu, `canh_cu`, `nen toi/canh` lọt qua `insert` | **Sửa** A1, §0.2, f.1: bỏ hết khỏi schema và thu-vien; ẩn dụ = prop nét + chữ hoặc ảnh thật; lint ≤ 3 màu trong `props/` |
| TT-12 | nhỏ | Mảnh kiểu cũ: insert dán, `pop` 4 f, `vach`, `rung`, `mo-chong`, Baloo 2, `Chu.mau`, `tay` −4°, nhạc loop | **Sửa** d.7, d.2, §0.2, d.6, e.11: insert full-frame không viền/bóng/xoay; pop-in 1 f, `POP_BONG` chỉ bong-chu; xoá `vach/rung/chuyen/mau`; Be Vietnam Pro 800/900 + Patrick Hand 0°; `nhac: null` |
| AL-1 | chặn | Hai phương ngữ schema (b.3/b.8 vs `kieu-board.ts`, ≥ 14 điểm) | **Sửa** b.3 = bản đích `kieu-board.ts`, b.8 viết lại cùng phương ngữ, §0.3 xoá; schema sinh tự động; golden `docs/vi-du/cho-ngoi.json` 0 lỗi; bảng E→tên, sac→bộ ba vào JSDoc/`sac.ts` |
| AL-2 | chặn | Mốc agent lệch 0,78 s; `canhCum` không đặc tả | **Sửa** b.4 đặc tả `canhCum` (X-run ≥ 6 f, ghép tham lam ±1,5 s, nội suy giữa mốc, fallback `nghi`); K4 in khoảng cách tới mốc nghỉ; K24 nghiệm thu |
| AL-3 | chặn | Validator lọt 16/23 lỗi; thiếu khoá lạ, miền, ngữ nghĩa, tên máy, bbox | **Sửa** e.4 K19–K23 + K27–K29; nghiệm thu C ≥ 25 board lỗi mẫu, `board-xau.json` ra đủ 23 |
| AL-4 | chặn | `Shot.tai` tuyệt đối + `trong` hai cách; không tự chèn beat | **Sửa** §0.2/b.4: bỏ `Shot.tai`; `trong` neo lời hoặc tự đặt tại X-run; beat tự động `beat_tu_dong`, `beat: false`; `--thong-ke` in số beat; demo-v2 viết lại không `tai` |
| AL-5 | chặn | Dàn nhân vật gắn cứng; không prop dự phòng | **Sửa** §0.2/c.0/f.1: `Board.nhan_vat` bằng enum; `KIEU` chỉ `trang` + mẫu; `vat-la` + `nhan` + `hinh`, K28 ≤ 15 %; SKILL "không dừng hỏi người" |
| AL-6 | lớn | Xoá `sac` đẩy ánh xạ vào trí nhớ LLM | **Sửa** thêm lại `sac` (§0.2, c.3 `sac.ts`, `TO_HOP_HOP_LE`, K27); tách `mieng_cam_xuc`/`_may_dung.hinh_lipsync`; K22 |
| AL-7 | lớn | 5,4 số/shot tự đặt; không preset; `co` prop hai nghĩa | **Sửa** b.3/b.5b: `bo_cuc` 5 preset; `x/y` tuỳ chọn; prop `co` × `cao_dau` × DAU cỡ shot; K23 bbox; `xem-thu --moi-shot` |
| AL-8 | lớn | `tu_dong` nửa vời; không mặc định phản ứng/nhãn | **Sửa** §0.2/d.8: `tu_dong` trong schema, mặc định true cho mọi `noi`; đường tắt `phan_ung`, `nhan`; `--thong-ke` đếm shot đường tắt |
| AL-9 | lớn | Board một tệp 104 KB vượt một lượt LLM | **Sửa** b.1: `board/_chung.json` + `board/<id>.json`; `--chuong` cho validator/xem-thu; `du-an-moi` sinh sẵn tệp có `vo` |
| AL-10 | lớn | SKILL viết cuối; hai danh mục `thu-vien` | **Sửa** f.1/f.2/g.1/g.2: `thu-vien.json` đích ở bước 0 (V1 → `thu-vien-v1.json`, CLAUDE.md sửa cùng); SKILL v2 + references + golden ở bước 1 (D); g.7 đo phiên agent mới ≤ 2 lỗi lần đầu, 0 lỗi ≤ 2 vòng |
| AL-11 | lớn | Ba quy ước tên; tên máy trộn enum; mô tả hình học | **Sửa** §0.2/f.1/d.3: khoá snake_case, giá trị kebab-case, `ALIAS`; `TU_THE_MAY`, `_may_dung`, K22; `dung_khi` bắt buộc từ `@dung_khi`, generator fail nếu thiếu |
| AL-12 | lớn | Vòng phản hồi chỉ 6 still, không có tín hiệu thời gian | **Sửa** e.4 `--thong-ke` per-shot (khoảng cách mốc nghỉ, hold dài nhất, cờ cắt giữa tiếng); e.5 `--moi-shot`, `--act`, `--nhap` (render chương + do-video JSON); f.2 đưa vào vòng lặp bắt buộc |

Không mục nào bị bác bỏ toàn phần. Một mục bác bỏ một phần (TT-10, chiều cao khung của bạn
cùng tuổi). Hai mục chọn giữa hai phương án phản biện đưa ra: KT-9/TT-8 chọn tắt chớp
(không chọn `khoang [48,72]`); KT-8/TT-5 chọn bước cỡ (không chọn giữ hệ số z kèm `tam`).
