# video-studio

Dựng video kể chuyện bằng code: kịch bản → giọng đọc → hình khớp lời → MP4.
Không dùng phần mềm dựng phim, không kéo timeline. Toàn bộ nằm trong Git.

```
scripts/ra-truong-vui.json      kịch bản: 14 chương lời bình
        ↓  pipeline/tts-gemini.mjs        (Gemini TTS → mp3 + đo độ dài thật)
src/projects/ra-truong/board.ts bảng phân cảnh: câu nào → cảnh nào
        ↓  npm run render
out/ra-truong-vui.mp4           1920×1080, 30fps
```

## Chạy

```bash
npm install

# 1. sinh giọng đọc (cần GEMINI_API_KEYS trong .env)
node pipeline/tts-gemini.mjs ra-truong-vui

# 2. bóc đường bao biên độ để nhân vật cử động theo giọng
node pipeline/analyze-voice.mjs ra-truong-vui

# 3. render
./render-segments.sh RaTruongVui out/ra-truong-vui.mp4

# xem trực quan, sửa tới đâu thấy tới đó
npm run dev
```

`.env`:

```
GEMINI_API_KEYS=key1,key2
```

Nhiều key phân tách bằng dấu phẩy. Free tier tính hạn mức theo **từng cặp
(key, model)** nên 2 key × 3 model = 6 hạn mức riêng; hết cặp này pipeline tự
nhảy sang cặp khác chứ không nằm chờ.

## Cấu trúc

| Thư mục | Là gì | Dùng lại được cho video khác? |
|---|---|---|
| `pipeline/` | TTS, phân tích giọng, tổng hợp SFX | ✅ |
| `src/engine/` | neo lời→frame, phụ đề, chia cụm | ✅ |
| `src/library/` | nhân vật + 18 bối cảnh | ✅ |
| `src/projects/` | kịch bản + bảng phân cảnh từng video | ❌ riêng từng video |
| `src/attic/` | thí nghiệm cũ (anime, chibi, explainer) | tham khảo, không build |
| `public/` | giọng đọc, nhạc, SFX, meme | |

Xem [ARCHITECTURE.md](ARCHITECTURE.md) để hiểu vì sao hình luôn khớp lời, và
[USECASE.md](USECASE.md) để biết cái gì tự động được, cái gì không.

## Video đã dựng

| File | Dài | Giọng | Chất |
|---|---|---|---|
| `out/ra-truong-vui.mp4` | 6p25 | Puck | hài, meme, SFX, nhạc funk |
| `out/ra-truong.mp4` | 13p02 | Charon | kể chuyện, piano, không meme |

Cùng một câu chuyện — năm đầu tiên đi làm — dựng theo hai chất khác nhau từ
cùng bộ thư viện.

## Bản quyền

Nhạc trong `public/audio/` là CC BY (Kevin MacLeod, Scott Buckley, Chris
Zabriskie). **Bắt buộc ghi công khi đăng** — câu ghi công có sẵn ở
`public/audio/CREDITS.md`.

SFX trong `public/sfx/` do `pipeline/sfx.py` tự tổng hợp từ dao động cơ bản,
không dính bản quyền của ai.
