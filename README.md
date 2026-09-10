# video-studio

Dựng video **storytime animation** bằng code: kịch bản → giọng đọc Gemini TTS →
lip-sync → bảng phân cảnh JSON → MP4 1920×1080 30 fps. Không phần mềm dựng
phim, không kéo timeline; toàn bộ nằm trong Git và một agent viết được.

Chuẩn tham chiếu: JaidenAnimations (nền trắng `#fdfdfd`, mực đen, da/áo không
tô, tóc một màu, nét dày đều, cắt cứng ~1.4 s/shot, đổi tư thế snap 1 khung,
miệng đổi hình theo âm). Mọi con số thẩm mỹ đo từ tham chiếu, ghi ở
`docs/nghien-cuu-storytime.md`; quyết định thiết kế ở `docs/thiet-ke-v2.md`.

## Cần làm video? Dùng skill

Người dùng nói "làm video về X" → gọi skill **`tao-video`**
(`.claude/skills/tao-video/SKILL.md`): quy trình 9 bước có lệnh thật, ngữ pháp
shot có số liệu, danh mục lỗi validator bắt.

## Luồng dữ liệu V2

```
scripts/<ten>.json                 kịch bản: title, voice, style, chapters[{id, vo}]
   │
   ├─ node pipeline/tts-gemini.mjs <ten>
   │      → public/vo-<ten>/<id>.mp3 (+ .sig vân tay)
   │      → src/projects/<du-an>/data/<ten>.generated.json   (duration thật từng chương)
   ├─ node pipeline/analyze-voice.mjs <ten>
   │      → data/<ten>.voice.json      am / nhan / nghi mỗi frame (30 fps)
   └─ node pipeline/lipsync.mjs <ten>   (Rhubarb, tools/rhubarb/)
          → data/<ten>.mouth.json      hình miệng X A B C D E F G H mỗi frame

src/projects/<du-an>/board.json    bảng phân cảnh: chuong[].shots[] {say, loai, co, dien, prop, chu, act...}
   │
   ├─ node pipeline/kiem-tra-v2.mjs <ten>      ✗/⚠ — tên trong thu-vien-v2.json, say có thật, nhịp, cấu trúc
   └─ node pipeline/thong-ke-board.mjs <ten>   s/shot, % <1 s, % trực diện, chữ/15 s, % trắng so tham chiếu

src/projects/<du-an>/phim.tsx      taoPhim({board, manifest, voices, mouths}) → Composition
   │   src/v2/phim/du-lieu.ts       neo `say` → frame (rải ký tự lên frame đang nói của voice.json)
   │   src/v2/phim/san-khau.tsx     vẽ một shot: rig + prop + chữ + insert, snap theo act
   │   src/v2/rig/*                 nhân vật: hình khối, tư thế, mắt, miệng, tóc, tay
   │   src/v2/props/*               28 prop nét đen
   └─ ./render-segments.sh <Comp> media/outbound/<ten>.mp4     (Chrome hệ thống, đoạn 900 frame, ghép ffmpeg)
```

## Chạy

```bash
npm install
cp .env.example .env            # GEMINI_API_KEYS=key1,key2
# rhubarb cho lip-sync: tools/README.md (tải 1 lần, ~90 MB, chạy qua Rosetta)

# ví dụ dựng lại demo-v2 (giọng đã có trong public/vo-demo-v2/)
node pipeline/analyze-voice.mjs demo-v2
node pipeline/lipsync.mjs demo-v2
node pipeline/kiem-tra-v2.mjs demo-v2            # ✓ demo-v2: qua hết
node pipeline/thong-ke-board.mjs demo-v2         # bảng ✓/⚠
SEG_LEN=900 ./render-segments.sh DemoV2 media/outbound/demo-v2.mp4

# xem một khung
npx remotion still src/index.ts DemoV2 out/v2/thu.png --frame=300 \
  --browser-executable "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --log=error

# studio tương tác
npm run dev

# sinh lại danh mục tên hợp lệ khi sửa rig/prop
node pipeline/thu-vien-v2.mjs
```

## Cấu trúc

| Đường dẫn | Là gì | Dùng lại cho video khác? |
|---|---|---|
| `pipeline/` | TTS, phân tích giọng, lip-sync, validator, thống kê, sinh thư viện | có |
| `src/v2/rig/` | rig nhân vật V2: `hinh.ts` (khung xương, `net()`), `kieu.ts` (9 nhân vật), `tu-the.ts` (23 tư thế), `mat.tsx`, `mieng.tsx`, `toc.tsx`, `tay.tsx`, `nhan-vat.tsx` | có |
| `src/v2/props/` | 28 prop: trường học, đồ vật, ngoài trời, gag | có |
| `src/v2/chu.tsx`, `insert.tsx` | 4 kiểu chữ trên màn; ảnh chèn | có |
| `src/v2/board/` | `kieu-board.ts` schema board (nguồn duy nhất) + `README.md` | có |
| `src/v2/phim/` | resolver mốc + sân khấu + composition generic | có |
| `src/v2/dev/` | bảng thử rig / prop (`RigV2Test`, `PropsV2Test`) | dev |
| `src/projects/<du-an>/` | `board.json`, `phim.tsx`, `data/*.json` sinh ra | không, riêng từng video |
| `thu-vien-v2.json` | danh mục tên hợp lệ, **sinh từ mã** bởi `pipeline/thu-vien-v2.mjs` | |
| `scripts/` | kịch bản | riêng từng video |
| `public/` | giọng đọc (`vo-*/`), nhạc CC BY (`audio/`), sfx tự tổng hợp (`sfx/`), meme (`meme/`) | |
| `media/outbound/` | **video thành phẩm** + metadata `.md` | |
| `docs/` | nghiên cứu số liệu, thiết kế V2, ảnh tham chiếu | |
| `src/engine/`, `src/library/`, `src/projects/{tinh-dau,ra-truong}` | **V1** (nền màu, cảnh SVG, mờ chồng) — chỉ còn để render lại `TinhDau`, `RaTruongVui`; không dùng cho video mới | tham khảo |
| `src/attic/` | thí nghiệm cũ, không build | tham khảo |

## Video đã dựng (`media/outbound/`)

| File | Dài | Giọng | Thế hệ | Ghi chú |
|---|---|---|---|---|
| `demo-v2.mp4` | 1:27 | Fenrir | **V2** | 77 shot, 1.08 s/shot, 51% shot < 1 s, trực diện 12%, lip-sync Rhubarb |
| `ra-truong-vui.mp4` | 6:22 | Puck | V1 | 14 chương, meme + SFX, nhạc funk |
| `tinh-dau.mp4` | 10:29 | Charon | V1 | 14 chương, kể chuyện trầm, cảnh ẩn dụ |

## Giới hạn thật

| | |
|---|---|
| Lip-sync | Rhubarb `phonetic` khớp nhịp câu 100%, đúng ~60% cấp âm vị; đủ ở cỡ trung/cận, lộ ở đặc tả dài |
| Hạn mức TTS | Gemini free tier 10 request/ngày mỗi cặp key × model; 2 key × 3 model = 60 chương/ngày |
| Render | ~17 khung/s trên máy này (1080p, Chrome hệ thống): 90 s video ≈ 2.5 phút, 3 phút ≈ 6 phút |
| Trường schema chưa nối | `goc`, `cam`, `mau`, `boi_canh` có trong `kieu-board.ts`, renderer chưa đọc |
| Đánh giá đẹp/xấu | máy không tự biết; agent soát still, người xem một lượt trước khi đăng |

Chi tiết kiến trúc và lý do từng quyết định: [ARCHITECTURE.md](ARCHITECTURE.md).
Cái gì tự động được khi gói thành use-case: [USECASE.md](USECASE.md).

## Bản quyền

Nhạc trong `public/audio/` là CC BY (Kevin MacLeod, Scott Buckley, Chris
Zabriskie). **Bắt buộc ghi công khi đăng** — câu ghi công ở `public/audio/CREDITS.md`.
SFX trong `public/sfx/` do `pipeline/sfx.py` tự tổng hợp, không dính bản quyền.
Meme trong `public/meme/` là ảnh bên thứ ba, không phát hành lại (xem `.gitignore`).
