# demo-v2.mp4 — "Lần đầu bị gọi lên bảng"

- Thời lượng: 1:27 · 1920×1080 · 30 fps · 7.9 MB
- Giọng: Gemini TTS **Fenrir**, style "YouTuber storytime, năng lượng cao, nhanh hơn 20%"
- Pipeline V2: `scripts/demo-v2.json` → `tts-gemini` → `analyze-voice` → `lipsync` (Rhubarb, phonetic) → `src/projects/demo-v2/board.json` → `kiem-tra-v2` → `render-segments.sh DemoV2`
- Số liệu dựng: 77 shot / 83 s lời = **1.08 s/shot**; 49% shot dưới 1 s; nói trực diện 12%; 38 shot có chữ trên màn; 15 prop khác nhau; 3 shot đông người; 1 insert meme
- Miệng: 563 cue Rhubarb, ~6.9 cue/s khi nói, đổi hình mỗi 1–3 frame

Nhạc nền CC BY (xem `public/audio/CREDITS.md`): Silly Fun, Flutey Funk, Got Funk, Style Funk — Kevin MacLeod (incompetech.com).

Biết trước khi đăng: lip-sync phonetic đúng ~60% cấp âm vị (đủ cho cỡ trung, soát lại cận đặc tả); prop `bang-den` ở cỡ nhỏ dễ đọc thành laptop.
