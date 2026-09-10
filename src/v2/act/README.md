# Mẫu hành động V2 — `src/v2/act/`

Agent viết board chỉ cần ghi hai trường trên `DienVien`:

```json
{"kieu": "nam", "x": 0.5, "mau": "vao-chay", "mau_tham_so": {"tai": 0.4, "huong": "trai"}}
```

Máy bung `mau` thành chuỗi mốc `act` (snap từng frame, KHÔNG tween), rồi trộn với
`act` thủ công của cùng diễn viên: **trùng mốc thì act thủ công thắng** (gộp trường).
Mọi mẫu nhận `tai` (giây bắt đầu trong shot, mặc định 0). Số liệu gốc ở
`docs/tham-chieu/timing.md`, đã quy về 30 fps / 1920x1080.

## Bảng mẫu

| Mẫu | Chuỗi frame | Tham số (mặc định) | Dùng khi |
|---|---|---|---|
| `vao-chay` | ẩn tới `tai` → chạy từ mép vào `x`: hình `chay1/2/3` đổi mỗi **2 frame**, trượt **36 px/frame** → 1 frame vượt +1.5% → đứng `dang` | `huong` trai\|phai (mép gần), `tu` (x xuất phát, mặc định -0.06 / 1.06), `tocDo` (1), `dang` (dung) | đến muộn, đuổi theo, xuất hiện vội |
| `ra-chay` | từ `x` chạy ra mép (hình 2 frame, 36 px/frame) → biến | `huong`, `den` (x kết), `tocDo` | bỏ chạy, trốn |
| `vao-di` | như `vao-chay` nhưng `di1/di2` mỗi **4 frame**, **14 px/frame** | `huong`, `tu`, `tocDo`, `dang` | vào lớp, đi tới bàn |
| `ra-di` | đi bộ ra mép → biến | `huong`, `den`, `tocDo` | rời đi bình thường |
| `vao-lao` | f0 key `laoVao` chân **đúng mép** (nửa người ngoài khung) → f1 vượt +1.5% → f2 đứng | `huong`, `tu` (x của key), `dang` | xông vào, xuất hiện có lực |
| `ra-lao` | f0 key `laoVao` ngả về mép → f1 nửa người ở mép → f2 biến | `huong` | lao ra, bỏ đi tức tối |
| `pop` | ẩn → scale **0.08 · 0.95 · 1.045 · 1** (4 frame) rồi giữ | `dang` | bật ra như bong bóng; renderer mặc định hiện 1 frame nên chỉ dùng khi cần nảy |
| `giat-minh` | f0 mắt `soc` + bật lùi 0.02 khung (`nhay1`) → f1..2 `soc-lon` + `hoang`, `haiTayXoe` → f3 về chỗ, giữ `soc` | `huong` (chiều lùi, trai), `lui` (0.02), `dang` (haiTayXoe) | bị gọi bất ngờ, phát hiện điều sốc |
| `nga` | f0 `laoVao` (1 frame trung gian) → f1 `nga`, giữ | `huong` (phai), `mat` (nham), `mieng` (meu) | vấp, bị đẩy, sụp đổ |
| `lac-dau` | `nhin` -0.6 / +0.6 luân phiên mỗi **5 frame** × 3 → về 0 | `bienDo` (0.6), `giu` (5), `lap` (3) | "không không", thất vọng nhẹ |
| `gat-gu` | `cuiNguoi` / `dung` mỗi **6 frame** × 2 | `giu` (6), `lap` (2), `dangCui`, `dang` | "ừ ừ", nghe giảng |
| `run` | ABAB x ±1 px **mỗi frame** tới hết shot, mắt `khe`; kết về chỗ | `px` (1), `mat` (khe), `dang`, `lap` (số chu kỳ) | sợ, lạnh, tức run; bật ≤ 20% shot |
| `go-ban` | `ngoiGoBan` / `ngoi` mỗi **3 frame** tới hết shot | `giu` (3), `lap` | sốt ruột, bực trong lớp |
| `nhin-quanh` | `nhin` -0.8 → 0 → 0.8 mỗi **8 frame** → về 0 | `bienDo` (0.8), `giu` (8), `lap` (1) | tìm ai, kiểm tra có ai thấy |
| `cuoi-lan` | mắt `cung` + `omBung` **12 frame** → 1 frame `laoVao` → `nga` vẫn cười toe | `giu` (12) | cười lăn, punchline |
| `ngu-gat` | `ngoi` mắt `chan` → sau **12 frame** `ngoiGuc` mắt `nham`; `lap` > 1 thì gật gà | `sau` (12), `lap` (1) | buồn ngủ, chán (chữ zzz do board) |
| `viet-bang` | `vietBang` / `vietBang2` mỗi **4 frame** tới hết shot, `goc: sau` | `giu` (4), `lap` | thầy cô giảng, ghi bảng |
| `quay-lai` | `goc` từng nấc `truoc → ba-phan-tu → nghieng (→ sau)`, **1 frame mỗi hình**, giữ | `tu` (truoc), `den` (nghieng) | nghe gọi quay lại; cần renderer hỗ trợ `goc` |
| `di-bo` | đi từ `x` tới `den` trong khung (14 px/frame) → đứng | `den` (x + 0.25), `tocDo`, `dang` | đổi chỗ trong cảnh |
| `chay-den` | chạy từ `x` tới `den` trong khung (36 px/frame) → vượt → đứng | `den` (x + 0.3), `tocDo`, `dang` | lao tới ai đó |
| `nhay-mung` | `nhay1` / `nhay2` mỗi **3 frame** × 3, mắt `cung` → `gioTay` | `giu` (3), `lap` (3), `dang` (gioTay) | ăn mừng, vui sướng |

Quy ước chung: `huong` = mép xuất phát (vào) hoặc mép đích (ra), mặc định mép gần
chỗ đứng; nhân vật quay mặt theo chiều đi (`flip` tự đặt); `tocDo` nhân với px/frame;
`lap` = số chu kỳ, bỏ trống với mẫu "tới hết shot" nghĩa là lặp hết `dai` của shot.
Mẫu lặp không tự dừng khi nhân vật bắt đầu nói — muốn dừng sớm hãy đặt `lap`.

## Trộn với `act` thủ công

```json
{"kieu": "ha", "x": 0.3, "mau": "vao-chay", "mau_tham_so": {"huong": "trai"},
 "act": [{"tai": 0.5, "mat": "soc"}, {"tai": 1.4, "dang": "chi", "mieng": "cuoi"}]}
```

- mốc thủ công `tai: 0.5` rơi cùng frame với một frame chạy → gộp: vẫn chạy, thêm mắt `soc`
- mốc `tai: 1.4` sau khi đã tới chỗ → đổi tư thế `chi` như bình thường
- trạng thái tại giây `t` = khai báo gốc của diễn viên ghi đè lần lượt bởi mọi mốc có
  frame(tai) ≤ frame(t) — snap, không nội suy

## API cho renderer (`src/v2/act/index.ts`)

```ts
import {sinhAct, trangThaiTai, MAU, zoomGag, popScale, layTuThe} from '../act';

sinhAct(dv: DienVien, dai: number): HanhDongAct[]          // một lần / diễn viên / shot; dai = giây của shot
trangThaiTai(act: HanhDong[], goc: DienVien, t: number): TrangThaiAct  // mỗi frame; t = frame / FPS
// TrangThaiAct: {dang, mat, may, mieng, nhin, x, y, flip, goc, cam, scale, xoay, ma, moHoi, hien}
//   hien === false → không vẽ; scale ≠ 1 → phóng quanh chân; x/y là tỉ lệ khung (x có thể < 0 hoặc > 1)

layTuThe(ten?: string): TuThe        // TU_THE của rig → TU_THE_MAY (dự phòng của act) → dung
MAU: Record<string, Mau>             // Mau = (p: {batDau, dai, x, thamSo}) => MocAct[]
MAU_MO_TA                            // {moTa, thamSo, dungKhi} cho thu-vien / validator
coMau(ten), coTuThe(ten)             // cho kiem-tra-v2

popScale(frameTuLucHien: number): number             // [0.08, 0.95, 1.045, 1][min(3, f)], f < 0 → 0
zoomGag(t: number, batDau: number, dauPx: number, soFrame = 9): number
                                                     // 1 + k × 0.45 × dauPx / 1080, k = 0..soFrame rồi giữ; shot nên CẮT ngay sau
zoomGagFrame(k: number, dauPx: number, soFrame = 9): number
nhipTrang(muc: 'ngan' | 'vua' | 'dai' = 'vua'): number   // giây: 0.5 / 0.75 / 1.2
holdFrame(muc), holdGiay(muc)                            // 12 / 25 / 45 frame (p25 / p50 / p75)
nhipHold(i), chiaBeat(dai)                               // rải mốc beat theo chuỗi hold 25 12 45 25 12 36
```

Hằng số (`nhip.ts`): `PX_CHAY 36`, `PX_DI 14`, `GIU_CHAY 2`, `GIU_DI 4`, `VUOT 0.015`,
`NGOAI_KHUNG 0.06`, `LUI_LAO 0.12`, `HOLD {toiThieu 8, ngan 12, vua 25, dai 45}`.

## Tư thế máy dùng (`tu-the-may.ts`)

Mẫu gọi tới `chay1/2/3`, `di1/2`, `nga`, `ngoiGoBan`, `ngoiGuc`, `omBung`, `vietBang`,
`vietBang2`. Rig (`rig/tu-the.ts`) đã có phần lớn — `layTuThe` luôn ưu tiên rig;
`TU_THE_MAY` chỉ là dự phòng để mẫu chạy được khi rig chưa có, và `vietBang2` được
suy từ `vietBang` của rig (chỉ dịch góc tay) để hai hình luân phiên cùng kiểu.

## Bảng thử

`npx remotion still src/index.ts ActV2Test out/v2/act-f15.png --frame 15` — 5 dải
(`vao-chay`, `giat-minh`, `nga`, `lac-dau`, `vao-lao`) tại DAU 160, thước frame dưới
mỗi dải (gạch đen = mốc act, đỏ = frame hiện tại), dòng trạng thái in `dang/x/nhin/mat/mieng/flip/hien`.
