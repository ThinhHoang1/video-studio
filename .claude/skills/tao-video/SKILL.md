---
name: tao-video
description: Tạo video storytime animation (kiểu JaidenAnimations, nền trắng, nét đen, cắt dày) từ một chủ đề bằng pipeline V2 — viết kịch bản hài, sinh giọng Gemini TTS, lip-sync, viết bảng phân cảnh board.json, kiểm máy, render MP4. Dùng khi người dùng nói "làm video về X", "kể chuyện hoạt hình", "storytime", "dựng clip hài kể chuyện đời".
---

# Đạo diễn một video storytime (V2)

Bạn **đạo diễn**, không **vẽ**. Rig 9 nhân vật × 4 góc nhìn, 43 tư thế, 10 đồ cầm tay,
103 prop, 28 bối cảnh dựng sẵn, 21 mẫu hành động, 4 kiểu chữ, 29 tiếng động, 16 bản nhạc
đã có sẵn trong `src/v2/` và `public/` (số đếm in ra khi chạy `node pipeline/thu-vien-v2.mjs`). Việc của bạn: viết kịch bản hài,
rồi quyết định **câu nào → shot gì, cỡ nào, ai làm gì lúc nào**. Mọi quyết định
ghi trong một file JSON (`board.json`), máy lo phần còn lại.

Đọc trước khi bắt tay:

| Đọc | Để làm gì |
|---|---|
| `references/kich-ban-storytime.md` | viết kịch bản có punchline |
| `references/dao-dien.md` | ngữ pháp shot có số liệu, 3 ví dụ đầy đủ |
| `references/loi-hay-gap.md` | lỗi validator hay bắt và cách sửa |
| `thu-vien-v2.json` | **danh mục tên hợp lệ** (nhân vật, tư thế, mắt, miệng, prop, sfx, nhạc) |
| `src/v2/board/kieu-board.ts` + `README.md` | schema board đầy đủ, chú thích từng trường (giới hạn chữ `the`, trường `ten` ghi chú diễn viên) |
| `src/projects/demo-v2/board.json` | ví dụ thật 77 shot đã render ra `media/outbound/demo-v2.mp4` |

## Ba luật không phá

1. **Video thành phẩm nằm ở `media/outbound/<ten>.mp4` kèm `<ten>.md`.** `out/` là nháp.
2. **`node pipeline/kiem-tra-v2.mjs <ten>` phải exit 0 trước khi render.**
3. **Chỉ dùng tên có trong `thu-vien-v2.json`** (tư thế / mắt / miệng / sfx / nhạc / prop)
   hoặc prop bạn **tự vẽ** trong `board.prop_tu_ve`. Không sửa mã TS trong `src/v2/`.

## Một lệnh chạy hết

```bash
node pipeline/tao-video.mjs <ten> --soat
```

11 bước, bước nào đã có kết quả thì bỏ qua, dừng đúng chỗ cần bạn:

```
 1 kich-ban   kiểm scripts/<ten>.json + cổng chấm cham-kich-ban.mjs (✗ → dừng; --bo-cham để bỏ qua)
 2 giong      tts-gemini          (cần GEMINI_API_KEYS trong .env)
 3 nhip       analyze-voice
 4 mieng      lipsync (Rhubarb)
 5 board      DỪNG (exit 3) nếu chưa có src/projects/<du-an>/board.json → bạn viết board rồi chạy lại --tu kiem
 6 kiem       kiem-tra-v2         (✗ → dừng, sửa board, chạy lại --tu kiem)
 7 thong-ke   thong-ke-board      (⚠ không chặn)
 8 dang-ky    dang-ky.mjs sinh composition V2-<ten> — KHÔNG sửa Root.tsx / render-segments.sh
 9 soat       ≤ 8 shot đáng soát nhất → out/<ten>/shot-<chuong>-<i>.png (khi --soat) → XEM bằng Read
10 render     render-segments.sh V2-<ten> media/outbound/<ten>.mp4
11 cham       cham-diem.mjs so với tham chiếu + ghi media/outbound/<ten>.md; exit 0 chỉ khi ≥ 90%
```

`<ten>` là tên kịch bản (vd `di-hoc-muon`), `<du-an>` là trường `project` trong
kịch bản (thường đặt bằng `<ten>`). Các bước dưới đây giải thích từng file bạn phải
viết và cách đọc kết quả; lệnh lẻ chỉ dùng khi muốn chạy tách.

### Bước 1 — Kịch bản `scripts/<ten>.json`

Đọc `references/kich-ban-storytime.md` trước. Khung file:

```json
{
  "title": "Lần đầu bị gọi lên bảng",
  "project": "demo-v2",
  "voice": "Fenrir",
  "style": "Bạn là YouTuber kể chuyện đời mình bằng hoạt hình (kiểu storytime animation). Giọng nam trẻ, NĂNG LƯỢNG CAO, nói nhanh, hào hứng, như đang kể cho hội bạn thân nghe một chuyện vừa xảy ra sáng nay. Tốc độ nhanh hơn bình thường 20%. Lên giọng bất ngờ ở chỗ ngạc nhiên, hạ giọng thì thào ở chỗ bí mật, cười khẽ trong lúc nói khi tự thấy mình ngớ ngẩn. Câu ngắn đọc DỨT, dứt khoát như đấm punchline. Tuyệt đối không đọc đều đều, không trầm buồn, không kiểu kể chuyện ma. Tiếng Việt giọng Bắc, đời thường.",
  "chapters": [
    {"id": "goi-ten", "kicker": "Lớp 8", "heading": "Tiết toán cuối buổi",
     "vo": "Ok nghe này. Lớp tám, giờ toán, tiết cuối, buồn ngủ kinh khủng. ..."}
  ]
}
```

**Giọng mặc định: `Fenrir`** (hào hứng, bốc) hoặc `Puck` (tưng tửng). Trường
`style` **chép nguyên văn** đoạn trên (đó là style của `scripts/demo-v2.json`,
đã kiểm ra nhịp 2.9 âm tiết/s, khớp nhịp cắt 1 s/shot). **Cấm giọng trầm chậm**
(`Charon`, "kể chuyện", "trầm ấm") trừ khi người dùng yêu cầu rõ: giọng chậm
kéo shot dài ra, nhịp storytime sụp.

Mỗi chương **45–70 từ** (≈ 18–25 s đọc), 4–8 chương cho video 1.5–3 phút.
`id` chương là kebab-case không dấu, dùng làm tên file mp3 và khoá trong board.

**Viết xong PHẢI qua cổng chấm trước khi tốn hạn mức TTS:**

1. Tự chấm **rubric 10 tiêu chí** theo mục 5 của `references/kich-ban-storytime.md`,
   mỗi tiêu chí 0 / 0.5 / 1, ghi vào khoá `rubric` của kịch bản, đúng tên khoá:
   ```json
   "rubric": {"hook": 1, "mat_do": 1, "chi_tiet": 0.5, "leo_thang": 1, "twist_callback": 0.5,
              "nhan_vat_phu": 1, "cau_chot": 1, "giong_rieng": 0.5, "viet_hoa": 1, "cam": 1}
   ```
   Thiếu khoá, thiếu tiêu chí, hoặc tổng **< 7** → chặn.
2. `node pipeline/cham-kich-ban.mjs <ten>` tới khi in `✓ được TTS`. Máy **chặn** (✗):
   chương ngoài 45–70 từ, câu > 22 từ, sáo ngữ đạo lý ("hành trình", "bài học quý",
   "vô cùng", "nhận ra rằng"…), rubric thiếu/dưới 7. Máy **cảnh báo** (⚠, sửa gần hết):
   < 30% câu ≤ 6 từ, < 2 câu thoại trực tiếp/chương, < 3 chi tiết cụ thể (số, tên riêng,
   tên app), từ tiếng Anh trần Gemini đọc sai ("mail" → "mèo": viết "email"/từ Việt),
   hook đầu > 12 từ, chương cuối không nhặt lại từ khoá đã gieo (callback yếu).
3. `tao-video.mjs` tự chạy cổng này ở bước 1 và dừng khi ✗; chỉ dùng `--bo-cham` khi
   người dùng cố ý bỏ qua.

### Bước 2–4 — Giọng, nhịp, miệng

```bash
mkdir -p src/projects/<du-an>/data              # tts-gemini không tự tạo thư mục
node pipeline/tts-gemini.mjs <ten>              # → public/vo-<ten>/*.mp3 + data/<ten>.generated.json
node pipeline/analyze-voice.mjs <ten>           # → data/<ten>.voice.json  (am / nhan / nghi từng frame)
node pipeline/lipsync.mjs <ten>                 # → data/<ten>.mouth.json  (hình miệng X A B C D E F G H từng frame)
```

- Cần `GEMINI_API_KEYS=key1,key2` trong `.env`. Free tier: **10 request/ngày cho
  mỗi cặp key × model**; pipeline xoay 3 model mặc định nên 2 key = 6 hạn mức =
  ~60 chương/ngày. Hết hạn mức thì báo người dùng, không chờ.
- Chạy lại an toàn: chương đã đọc và lời chưa đổi thì bỏ qua (vân tay `.sig`).
  Sửa `vo` là chương đó tự đọc lại; sau đó **phải chạy lại cả 3 và 4**.
- `lipsync.mjs` cần `tools/rhubarb/` (x86_64, chạy qua Rosetta). Thiếu thì làm
  theo `tools/README.md`; không có rhubarb thì renderer rơi về miệng theo biên độ
  (xấu hơn hẳn, chỉ dùng khi bí).
- TTS đọc dài gấp đôi số từ dự kiến sẽ bị `tts-gemini` tự đọc lại (tối đa 4 lần).

### Bước 5 — Bảng phân cảnh `src/projects/<du-an>/board.json`: viết 2 VÒNG

Đọc `references/dao-dien.md`. Đây là chỗ quyết định video giống storytime hay
giống slide thuyết trình. Mốc thời gian của shot **suy từ file giọng**, bạn không
biết trước câu nào rơi ở giây nào — nên board viết hai vòng, không viết một lần.

**Vòng 1 — board NHÁP: chỉ `say` + `loai` (+ `co`)**, chưa `trong`, chưa `act`, chưa
`tai`. Mỗi shot neo vào một mẩu lời `say` có **nguyên văn** trong `vo`:

```json
{
  "du_an": "<du-an>",
  "nguoi_ke": "nam",
  "mac_dinh": {"loai": "minh-hoa", "co": "trung", "nen": "trang"},
  "chuong": [
    {"id": "goi-ten", "nhac": "25-silly-fun", "shots": [
      {"say": "Ok nghe này", "loai": "truc-dien"},
      {"say": "Lớp tám, giờ toán", "loai": "chu"},
      {"say": "Thằng Long ngồi cạnh", "loai": "minh-hoa"}
    ]}
  ]
}
```

Rồi lấy mốc thật:

```bash
node pipeline/kiem-tra-v2.mjs <ten> --moc      # in giây bắt đầu từng shot, theo voice.json
```

```
  chương "goi-ten" — mốc ước lượng theo voice.json, thời lượng 21.40s
      1    0.00s  truc-dien  "Ok nghe này"
      2    2.13s  chu        "Lớp tám, giờ toán"
      3    2.31s  minh-hoa   "Thằng Long ngồi cạnh"     ← chỉ 0.18 s sau shot 2
```

**Vòng 2 — hoàn thiện theo mốc thật:**

1. **Gộp hoặc bỏ shot cách mốc kế < 0.25 s** (validator ✗ `chỉ 0.18s (< 0.25s)`).
   Hai `say` quá sát trong lời — ví dụ *"Chặt."* rồi ngay *"Rất chặt."* — không thành
   hai shot được: gộp thành một shot `say: "Chặt"` với chữ `the` hai dòng
   `"CHẶT.\nRẤT CHẶT."` `vao: tung-tu`, hoặc bỏ shot sau.
2. **Đặt nhịp trắng**: `trong` có `tai` = **mốc shot kế − `dai`**, và **chèn vào đúng
   vị trí thời gian trong mảng `shots`** (ngay trước shot nó dẫn vào, không append cuối
   chương). Shot kế ở 15.74 s → `{"tai": 15.23, "loai": "trong", "dai": 0.5}` đặt ngay
   trước shot đó.
3. **Thêm `dien` / `act` / `mau` / `prop` / `chu` / `sfx`** cho từng shot; shot > 1.5 s có
   nhân vật cần ≥ 1 mốc `act`; nhân vật không nói cần `mieng`.
4. Chạy lại `--moc` sau mỗi lần sửa lời hay đọc lại giọng — mốc trôi, `tai` phải đặt lại.

Nhịp mục tiêu: **1.0–1.6 s/shot, ≥ 30% shot dưới 1 s, trực diện ≤ 20% thời gian,
≥ 1 chữ / 15 s, nhịp trắng 5–10%**. Với chương 20 s → 14–20 shot.

### Bước 6 — Kiểm máy (bắt buộc)

```bash
node pipeline/kiem-tra-v2.mjs <ten>          # ✗ lỗi chặn / ⚠ cảnh báo; exit 1 khi có ✗
node pipeline/kiem-tra-v2.mjs <ten> --moc    # in mốc ước lượng (giây) của từng shot
```

Sửa cho tới khi `✓ <ten>: qua hết`. Lỗi hay gặp và cách sửa: `references/loi-hay-gap.md`.
`⚠ thứ tự shot trong file khác thứ tự thời gian` gần như luôn là `trong` bị append
cuối chương thay vì chèn đúng chỗ (bước 5, vòng 2).

### Bước 7 — Đo nhịp so tham chiếu

```bash
node pipeline/thong-ke-board.mjs <ten>       # bảng chương + bảng tổng ✓/⚠
node pipeline/thong-ke-board.mjs <ten> --json
```

Mọi dòng có mục tiêu phải ✓. Dòng ⚠ kèm gợi ý sửa (thêm `phan-ung`/`chu`/`trong`,
rời trực diện sớm hơn...). Các dòng `·` (prop, góc nhìn, mẫu hành động) chỉ để
biết mức đa dạng.

### Bước 8–9 — Đăng ký và soát khung (tự động)

`node pipeline/tao-video.mjs <ten> --tu dang-ky --den soat --soat` sinh
`src/projects/du-an.generated.ts` (composition `V2-<ten>`), chạy `tsc`, rồi **chọn
tối đa 8 shot đáng soát nhất** trong board (ưu tiên: có prop tự vẽ, có `boi_canh`,
≥ 2 diễn viên, có chữ `the`, cỡ `sat`; rải đều các chương) và render mỗi shot một
khung ra `out/<ten>/shot-<chuong>-<i>.png` (`<i>` = vị trí trong mảng `shots`, đếm
từ 0; lệnh in danh sách kèm lý do chọn). **Mở từng ảnh bằng tool Read** và nhìn:
chữ có đè mặt hay đè phụ đề không, prop có lơ lửng không, người ngồi có bị bàn che
sai không, nhân vật (nhất là `thay`/`me`/`trang` ở cỡ `can`/`sat`) có mất đỉnh đầu
không, góc nhìn/đồ cầm có đúng ý không. Sửa board rồi chạy lại `--tu kiem --den soat
--soat`. Tối đa 4 vòng; vòng nào cũng phải sửa được gì cụ thể.

Muốn xem **một shot bất kỳ** — không tính frame tay:

```bash
node pipeline/xem-shot.mjs <ten> <chuong-id> "<say>"      # theo mẩu lời (khớp nguyên văn hoặc chứa)
node pipeline/xem-shot.mjs <ten> <chuong-id> "#7"         # theo vị trí trong mảng shots (đếm từ 0)
node pipeline/xem-shot.mjs <ten> <chuong-id> "#7" --lech 0.8   # giây tính từ đầu shot (mặc định 0.3)
node pipeline/xem-shot.mjs <ten> --tat-ca                 # 1 khung mỗi shot có nhân vật / prop tự vẽ / bối cảnh (chậm)
```

→ `out/<ten>/shot-<chuong>-<i>.png`. Mốc tính cùng thuật toán với `kiem-tra-v2 --moc`
và renderer (thẻ tiêu đề 1.6 s đứng SAU chương `mo-bai` — không có mo-bai thì đứng đầu — + Σ chương trước (audio + đệm 0.4 s) + mốc shot + `--lech`).
Chỉ khi cần frame thô (`npx remotion still src/index.ts V2-<ten> out/<ten>/f300.png
--frame=300 --browser-executable "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
--log=error`): `frame = 48 (thẻ tiêu đề, cộng sau chương mo-bai) + Σ(chương trước: round(duration × 30) + 12) + round(mốc × 30)`
— `duration` lấy từ `data/<ten>.generated.json`, mốc từ `--moc`.

### Bước 10–11 — Render, chấm, metadata (tự động)

`node pipeline/tao-video.mjs <ten> --tu render` render theo đoạn 900 frame (hỏng
giữa chừng chạy lại là tiếp), rồi `cham-diem.mjs` đo TRÊN VIDEO 14 tiêu chí so với
tham chiếu (nhịp cắt, % shot < 1 s, hold, nhịp trắng, trực diện, chữ, tư thế, góc
nhìn, mẫu hành động, bối cảnh, prop, đồ cầm, mốc act, miệng đổi hình) và ghi
`media/outbound/<ten>.md`. **Ngưỡng nghiệm thu 90%.** Dưới ngưỡng: đọc dòng ✗,
sửa board đúng dòng đó (thêm góc nhìn / mẫu hành động / bối cảnh / đồ cầm / act),
chạy lại từ `--tu kiem`. Render ~17 khung/s: 90 s video ≈ 2.5 phút.

Nhạc là CC BY (`public/audio/CREDITS.md`): **không ghi công khi đăng là vi phạm giấy phép.**

## Thiếu prop? TỰ VẼ, không bỏ ý

Thư viện không có thứ câu chuyện cần (máy bán nước, con mèo, cái cúp) thì bạn **vẽ nó
bằng dữ liệu** ngay trong `board.json`, mục `prop_tu_ve`. Không cần sửa mã TS, không
cần hỏi người. Ba cách, ưu tiên từ trên xuống:

1. **Prop có nhãn chữ** (nhanh nhất, kiểu Jaiden vẽ cái hộp rồi ghi chữ lên):
   `{"ten": "bang-hieu", "x": 0.7, "y": 0.86, "chu": "PHÒNG NHÂN SỰ"}` — cũng có
   `hop-nhan`, `bieu-tuong`, `to-giay`, `man-hinh` (trường `chu`).
2. **Prop tự vẽ** — khai một lần trong `board.prop_tu_ve`, dùng như prop thư viện:

```json
"prop_tu_ve": {
  "may-ban-nuoc": {
    "moTa": "máy bán nước tự động", "rong": 260, "cao": 560,
    "hinh": [
      {"loai": "hop", "x": -130, "y": -560, "w": 260, "h": 560, "bo": 14},
      {"loai": "hop", "x": -105, "y": -530, "w": 150, "h": 300, "bo": 6},
      {"loai": "tron", "cx": -70, "cy": -490, "r": 22},
      {"loai": "gach", "x1": -105, "y1": -430, "x2": 45, "y2": -430},
      {"loai": "chu", "x": 0, "y": -140, "text": "{chu}", "co": 44},
      {"loai": "to", "d": "M -60 -520 h 30 v 20 h -30 z", "mau": "#f81000"},
      {"loai": "net", "d": "M -130 -30 q 130 -25 260 0"}
    ]
  }
}
```

   Toạ độ px ở `co = 1`, gốc **tâm đáy**, y âm hướng lên; nhân vật cỡ trung cao ~858 px
   nên vật để bàn ~150–300 px, đồ đứng ~500–900 px. Hình: `net` (đường hở), `khoi`
   (path kín tô trắng), `hop`, `tron`, `bau`, `gach`, `chu` (có `{chu}` thì lấy từ
   `prop[].chu`), `to` (tô màu nhấn, chỉ màu trong bảng ở `src/v2/props/tu-ve.tsx`).
   Máy tự vẽ viền đen dày đều, thân trắng — bạn chỉ lo hình dáng. **Bắt buộc xem
   trước khi dùng:** `node pipeline/xem-prop.mjs <du-an> may-ban-nuoc --chu COCA`
   → `out/<du-an>/prop-may-ban-nuoc.png` (co 1 cạnh nhân vật cỡ trung), mở bằng Read.
   Sẽ dùng ở cỡ cảnh nào thì xem đúng cỡ đó: `--co 0.45 --co-canh sat --thu 0.25` →
   `prop-may-ban-nuoc-sat.png` (prop trong khung 1920×1080 cỡ `sat` cạnh nhân vật cùng
   cỡ, in "cao N% khung" và `co` gợi ý) + `prop-may-ban-nuoc-sat-thu.png` (bản 25%:
   không nhận ra là gì thì nét quá mảnh, vẽ to hơn). Công thức cỡ và bảng `co` theo
   cỡ cảnh: `dao-dien.md` §2. Validator kiểm tên/kiểu/hình, không kiểm đẹp.
3. **Ảnh chèn** (`loai: insert`) cho thứ quá đặc thù hoặc meme.

Prop tự vẽ dùng được ở `prop[].ten` mọi shot của dự án. Nếu vẽ đẹp và dùng lại nhiều,
ghi vào `ghi_chu` để người vẽ đưa vào thư viện chung.

## Không làm

- Không nghĩ tên prop bừa: tên phải có trong `thu-vien-v2.json` hoặc `board.prop_tu_ve`. Thiếu thì tự vẽ (mục trên), không bỏ ý.
- Không tween, không fade, không zoom trượt: schema không có, đừng cố mô tả trong `ghi_chu`.
- Không để nhân vật nói mà đứng yên quá 1.5 s (thêm `act` hoặc `mau`), không để trực diện quá 3 s liền.
- Không khai lại prop đã nằm trong `boi_canh`; không dùng `boi_canh` ở cỡ `can`/`sat`.
- Không đặt chữ `vi_tri: duoi` ở shot có lời (đè phụ đề); chữ `the` kèm nhân vật ≤ 14 ký tự/dòng, ngắt bằng `\n`.
- Không dùng `truc-dien` cho hơn một người `noi`.
- Không lấy file từ `out/`. Không force-push, không sửa lịch sử git.
- Không dùng pipeline V1 (`board.ts`, `kiem-tra.mjs`, `thu-vien.json`) cho video mới. V1 chỉ còn để render lại `TinhDau` / `RaTruongVui`.
- Không sửa `src/Root.tsx`, `render-segments.sh`, không tạo `phim.tsx` — `dang-ky.mjs` làm việc đó.

## Giới hạn thật, nói thẳng với người dùng

| | |
|---|---|
| Lip-sync | Rhubarb phonetic đúng ~60% cấp âm vị; nhịp câu khớp 100%. Đủ cho cỡ trung/cận, lộ ở đặc tả dài |
| Hạn mức TTS | free tier 10 request/ngày mỗi cặp key × model; 2 key × 3 model = 60 chương/ngày |
| Render | ~17 khung/s → 3 phút video ≈ 6 phút render; không dùng cho luồng tương tác |
| Bảng chấm | `cham-diem.mjs` đo nhịp/hold/miệng trên video thật; điểm ≥ 90% là điều kiện tự nhận xong |
| Đẹp / xấu | máy không tự biết; bước 9 soát still là bắt buộc và người dùng vẫn nên xem một lượt trước khi đăng |
