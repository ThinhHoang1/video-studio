# media/outbound

**Video hoàn chỉnh nằm ở đây.** Mọi bản render cuối cùng phải xuất vào thư mục
này; đây là chỗ duy nhất người dùng và hệ thống khác đi lấy file. `out/` là
nháp (đoạn render dở, still, bản thử), không lấy file từ đó.

```bash
SEG_LEN=900 ./render-segments.sh <Composition> media/outbound/<ten>.mp4
```

Đặt tên theo tên kịch bản (`scripts/<ten>.json`), ví dụ `demo-v2.mp4`.

Kèm mỗi video một file `<ten>.md` cùng tên: tiêu đề, thời lượng, giọng, pipeline,
số liệu dựng (từ `node pipeline/thong-ke-board.mjs <ten>`), mô tả để đăng, và
**câu ghi công nhạc** (bắt buộc, nhạc trong repo là CC BY, xem
`public/audio/CREDITS.md`). Mẫu: `demo-v2.md`.

File `.mp4` không đẩy lên git (`.gitignore`); metadata `.md` thì có.

## Video hiện có

| File | Dài | Giọng | Pipeline | Nội dung |
|---|---|---|---|---|
| `demo-v2.mp4` (+ `demo-v2.md`) | 1:27 · 7.9 MB | Fenrir | **V2** (`DemoV2`): board.json 77 shot, lip-sync Rhubarb, nền trắng nét đen | "Lần đầu bị gọi lên bảng", 4 chương, storytime hài |
| `ra-truong-vui.mp4` (+ `ra-truong-vui.md`) | 6:22 · 99 MB | Puck | V1 (`RaTruongVui`): board.ts + cues.ts, 26 cảnh SVG, meme, SFX | "Năm đầu đi làm: sổ tay sống sót cho tân binh", 14 chương |
| `tinh-dau.mp4` | 10:29 · 208 MB | Charon | V1 (`TinhDau`): kể chuyện trầm, piano, cảnh ẩn dụ | "Tình đầu", 14 chương (chưa có `.md` kèm) |

Video mới dựng bằng **V2** theo skill `.claude/skills/tao-video/SKILL.md`.
V1 chỉ dùng để render lại hai video cũ.
