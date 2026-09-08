# video-studio

Khung dựng video giải thích (explainer) hoạt hoạ bằng **Remotion + React SVG**,
lời bình sinh bằng **Gemini TTS**, hiệu ứng âm thanh tự tổng hợp bằng Python.
Không dùng stock footage, không dùng asset bản quyền — mọi hình vẽ là SVG viết tay.

## Chạy nhanh

```bash
npm install
cp .env.example .env          # điền GEMINI_API_KEYS
node tts-gemini.mjs lam-phat  # sinh giọng -> public/vo-lam-phat/*.mp3
node build-manifest.mjs lam-phat   # -> src/lam-phat.generated.json (độ dài thật)
npm run dev                   # Remotion Studio để xem/tinh chỉnh
./render.sh LamPhatV2 out/lam-phat.mp4       # render một mạch
./render-segments.sh LamPhatV2               # render theo đoạn rồi ghép (ổn định hơn)
python3 sfx.py                # tổng hợp lại bộ SFX vào public/sfx/
node audition.mjs             # thử nhiều giọng Gemini trên cùng một câu
```

## Đường ống (pipeline)

```
script/<name>.json          kịch bản: title, voice, style, chapters[{id, art, kicker, heading, vo}]
   │  node tts-gemini.mjs <name>
   ▼
public/vo-<name>/<id>.mp3   giọng đọc, chuẩn hoá -16 LUFS, kèm .sig (vân tay nội dung)
   │  node build-manifest.mjs <name>
   ▼
src/<name>.generated.json   manifest có `duration` đo từ mp3 thật
   │  src/story/board.ts (bảng phân cảnh) + src/art, src/cast, src/toon (hình vẽ)
   ▼
src/<Comp>.tsx              composition Remotion, khai báo trong src/Root.tsx
   │  ./render.sh | ./render-segments.sh
   ▼
out/<Comp>.mp4
```

Nguyên tắc xuyên suốt: **hình neo vào lời, không chia đều thời lượng.**
Mỗi shot trong `src/story/board.ts` khai báo `say` — mẩu lời bình nó minh hoạ;
timing lấy từ đúng câu đó nên hình luôn khớp tiếng. Không tìm thấy câu thì báo
lỗi ngay lúc build thay vì để lệch âm thầm.

## Bản đồ thư mục

| Đường dẫn | Vai trò |
|---|---|
| `script/*.json` | kịch bản nguồn: lời bình, giọng, style prompt cho TTS |
| `gemini-tts.mjs` | lõi TTS: xoay vòng (key × model) để né quota, PCM→mp3, loudnorm, đo độ dài |
| `tts-gemini.mjs` | sinh giọng cho một kịch bản, bỏ qua chương đã có (so `.sig`) |
| `build-manifest.mjs` | dựng manifest từ những mp3 ĐÃ có — dựng được cả khi TTS còn dở |
| `audition.mjs` | thử giọng |
| `sfx.py` | tổng hợp SFX từ dao động cơ bản (không bản quyền, khớp nhịp cắt) |
| `src/Root.tsx` | đăng ký mọi composition (ngang 1920×1080 và dọc 1080×1920) |
| `src/theme.ts`, `src/font.ts` | FPS, bảng màu, font |
| `src/story/` | `board.ts` bảng phân cảnh · `types.ts` schema shot · `render.tsx` dựng shot · `Places/Props/Overlay/Sub` |
| `src/cast/` | nhân vật vẽ SVG (`Cast.tsx`, bảng màu riêng, `design.md`) |
| `src/art/` | các cảnh minh hoạ tĩnh/động theo `art` key của chương |
| `src/toon/`, `src/anime/` | hai style hoạt hoạ khác (`LamPhatToon`, `LamPhatAnime`) |
| `src/motion/` | primitive chuyển động: `Beat`, `Camera3D`, `CountUp`, `KineticText`, `Transitions`, `easing` |
| `src/shots/`, `src/components/` | khối dựng cảnh & UI: Caption, Subtitle, TitleCard, ChapterTitle, KenBurns, MemeCut, Grain, Vignette, StatBadge, EndCard |
| `src/dev/` | composition test nhanh cho từng hệ (ToonTest, CastTest, AnimeTest) |
| `public/` | `sfx/` tự sinh · `meme/`, `qb/` hình · `vo-*/` giọng (gitignored) · `audio/` nhạc nền (gitignored, xem CREDITS.md) |
| `assets/meme-templates` | ảnh meme nguồn |

## Không có trong repo

- `public/vo-*/` — sinh lại bằng `node tts-gemini.mjs <name>`
- `public/audio/` — nhạc nền tải ngoài, xem `public/audio/CREDITS.md`
- `.env` — chỉ có `.env.example`

## Lưu ý môi trường

- Remotion cần Chrome. `render.sh` trỏ vào Chrome hệ thống thay vì tải headless shell.
- `ffmpeg`/`ffprobe` dùng bản trong `node_modules/@remotion/compositor-darwin-arm64`
  (cần `DYLD_LIBRARY_PATH` trỏ vào đó — các script đã tự set).
- Render một mạch dài dễ chết giữa chừng do Chrome nghẽn; `render-segments.sh`
  cắt thành đoạn ~700 frame, mỗi đoạn một tiến trình Chrome mới, đoạn nào xong
  thì lần chạy sau bỏ qua.
