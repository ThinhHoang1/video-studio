---
name: tao-video
description: Tạo video storytime animation (kiểu JaidenAnimations, nền trắng, nét đen, cắt dày) từ một chủ đề bằng pipeline V2 — viết kịch bản hài, sinh giọng Gemini TTS, lip-sync, viết bảng phân cảnh board.json, kiểm máy, render MP4. Dùng khi người dùng nói "làm video về X", "kể chuyện hoạt hình", "storytime", "dựng clip hài kể chuyện đời".
---

# Đạo diễn một video storytime (V2)

Bạn **đạo diễn**, không **vẽ**. Rig 9 nhân vật × 4 góc nhìn, 43 tư thế, 10 đồ cầm tay,
53 prop, 16 bối cảnh dựng sẵn, 21 mẫu hành động, 4 kiểu chữ, 29 tiếng động, 16 bản nhạc
đã có sẵn trong `src/v2/` và `public/`. Việc của bạn: viết kịch bản hài,
rồi quyết định **câu nào → shot gì, cỡ nào, ai làm gì lúc nào**. Mọi quyết định
ghi trong một file JSON (`board.json`), máy lo phần còn lại.

Đọc trước khi bắt tay:

| Đọc | Để làm gì |
|---|---|
| `references/kich-ban-storytime.md` | viết kịch bản có punchline |
| `references/dao-dien.md` | ngữ pháp shot có số liệu, 3 ví dụ đầy đủ |
| `references/loi-hay-gap.md` | lỗi validator hay bắt và cách sửa |
| `thu-vien-v2.json` | **danh mục tên hợp lệ** (nhân vật, tư thế, mắt, miệng, prop, sfx, nhạc) |
| `src/v2/board/kieu-board.ts` + `README.md` | schema board đầy đủ, chú thích từng trường |
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
 1 kich-ban   kiểm scripts/<ten>.json
 2 giong      tts-gemini          (cần GEMINI_API_KEYS trong .env)
 3 nhip       analyze-voice
 4 mieng      lipsync (Rhubarb)
 5 board      DỪNG (exit 3) nếu chưa có src/projects/<du-an>/board.json → bạn viết board rồi chạy lại --tu kiem
 6 kiem       kiem-tra-v2         (✗ → dừng, sửa board, chạy lại --tu kiem)
 7 thong-ke   thong-ke-board      (⚠ không chặn)
 8 dang-ky    dang-ky.mjs sinh composition V2-<ten> — KHÔNG sửa Root.tsx / render-segments.sh
 9 soat       6 khung thử ra out/<ten>/soat-*.png (khi --soat) → XEM bằng Read
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

### Bước 5 — Bảng phân cảnh `src/projects/<du-an>/board.json`

Đọc `references/dao-dien.md`. Đây là chỗ quyết định video giống storytime hay
giống slide thuyết trình.

```json
{
  "du_an": "<du-an>",
  "nguoi_ke": "nam",
  "mac_dinh": {"loai": "minh-hoa", "co": "trung", "nen": "trang"},
  "chuong": [
    {"id": "goi-ten", "nhac": "25-silly-fun", "shots": [
      {"say": "Ok nghe này", "loai": "truc-dien", "dien": [{"kieu": "nam", "x": 0.72, "noi": true}]},
      {"say": "Lớp tám, giờ toán", "loai": "chu", "sfx": "ding",
       "chu": [{"noi_dung": "LỚP 8. GIỜ TOÁN.", "kieu": "the", "vao": "tung-tu"}]},
      {"tai": 15.23, "loai": "trong", "dai": 0.5}
    ]}
  ]
}
```

Nguyên tắc gốc: **mỗi shot neo vào một mẩu lời `say` có nguyên văn trong `vo`**;
thời điểm suy ra từ file giọng, không tự đặt. Nhịp mục tiêu: **1.0–1.6 s/shot,
≥ 30% shot dưới 1 s, trực diện ≤ 20% thời gian, ≥ 1 chữ / 15 s, nhịp trắng 5–10%**.
Với chương 20 s → 14–20 shot.

### Bước 6 — Kiểm máy (bắt buộc)

```bash
node pipeline/kiem-tra-v2.mjs <ten>          # ✗ lỗi chặn / ⚠ cảnh báo; exit 1 khi có ✗
node pipeline/kiem-tra-v2.mjs <ten> --moc    # in mốc ước lượng (giây) của từng shot
```

`--moc` là công cụ đặt nhịp trắng: đọc mốc shot kế tiếp, đặt `tai` của shot
`trong` lùi trước đó 0.3–0.6 s. Sửa cho tới khi `✓ <ten>: qua hết`. Lỗi hay
gặp và cách sửa: `references/loi-hay-gap.md`.

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
`src/projects/du-an.generated.ts` (composition `V2-<ten>`), chạy `tsc`, rồi render
6 khung rải đều ra `out/<ten>/soat-*.png`. **Mở từng ảnh bằng tool Read** và nhìn:
chữ có đè mặt không, prop có lơ lửng không, người ngồi có bị bàn che sai không,
nhân vật có rơi ra ngoài khung không, góc nhìn/đồ cầm có đúng ý không. Sửa board
rồi chạy lại `--tu kiem --den soat --soat`. Tối đa 4 vòng; vòng nào cũng phải sửa
được gì cụ thể. Muốn xem một frame bất kỳ:

```bash
npx remotion still src/index.ts V2-<ten> out/<ten>/f300.png --frame=300 \
  --browser-executable "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --log=error
```

Tính frame: `frame = 60 + Σ(chương trước: duration×30 + 12) + mốc_shot×30`
(intro 2 s = 60 frame; mỗi chương thêm 12 frame đệm; mốc shot lấy từ `kiem-tra-v2 --moc`).

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
   → `out/<du-an>/prop-may-ban-nuoc.png`, mở bằng Read, chỉnh tới khi nhận ra được
   ở cỡ nhỏ (thu 25% vẫn hiểu là gì). Validator kiểm tên/kiểu/hình, không kiểm đẹp.
3. **Ảnh chèn** (`loai: insert`) cho thứ quá đặc thù hoặc meme.

Prop tự vẽ dùng được ở `prop[].ten` mọi shot của dự án. Nếu vẽ đẹp và dùng lại nhiều,
ghi vào `ghi_chu` để người vẽ đưa vào thư viện chung.

## Không làm

- Không nghĩ tên prop bừa: tên phải có trong `thu-vien-v2.json` hoặc `board.prop_tu_ve`. Thiếu thì tự vẽ (mục trên), không bỏ ý.
- Không tween, không fade, không zoom trượt: schema không có, đừng cố mô tả trong `ghi_chu`.
- Không để nhân vật nói mà đứng yên quá 1.5 s (thêm `act`), không để trực diện quá 3 s liền.
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
