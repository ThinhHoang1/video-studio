# Hướng dẫn cho agent làm video trên repo này

Đọc `README.md` trước để biết đường ống. File này nói **cách làm một video mới**.

## Quy trình tạo video mới (`<name>`)

1. **Viết kịch bản** `script/<name>.json`:
   ```json
   {
     "title": "…",
     "voice": "Charon",
     "style": "<prompt điều khiển cách đọc: nhân vật host, giọng, nhịp, chỗ nhấn>",
     "chapters": [
       {"id": "hook", "art": "pho", "kicker": "Câu hỏi", "heading": "…", "vo": "lời bình đọc thành tiếng"}
     ]
   }
   ```
   - `id` là khoá dùng khắp nơi (tên file mp3, khớp với `BOARD`), kebab-case, không trùng.
   - `vo` viết như nói: số viết thành chữ để TTS đọc đúng ("năm mươi nghìn", không "50k").
   - `style` là đòn bẩy lớn nhất về chất giọng — chỉnh nó trước khi đổi `voice`.
   - Giọng có sẵn: xem danh sách trong `audition.mjs`; chạy `node audition.mjs` để nghe thử.

2. **Sinh giọng**: `node tts-gemini.mjs <name>`
   - Chạy lại thì bỏ qua chương đã có (so `.sig` = sha1 của voice+style+vo). Sửa `vo` → tự đọc lại.
   - Quota free tier tính theo từng (key, model): thêm nhiều key vào `GEMINI_API_KEYS`, script tự xoay vòng.
   - `FRESH=1` để xoá sạch và đọc lại toàn bộ.

3. **Dựng manifest**: `node build-manifest.mjs <name>` → `src/<name>.generated.json`
   Độ dài đo từ mp3 thật, nên timeline luôn khớp âm. Chương chưa có giọng bị bỏ qua → dựng được khi TTS còn dở.

4. **Viết bảng phân cảnh** (`src/story/board.ts` hoặc file board riêng cho video mới):
   mỗi chương một `{id, shots[]}`; mỗi shot là một `Shot` (schema ở `src/story/types.ts`):
   `say` (bắt buộc — mẩu lời bình shot này minh hoạ), `place`, `cut` (rong/trung/can/sat),
   `nhin` (tâm khung), `actors`, `props`, `overlay`, `enter`, `sfx`.
   - `say` phải là chuỗi con của `vo` (sau khi bỏ dấu câu), nếu không sẽ warn lúc build và shot bị neo về 0.
   - Muốn hình mới: thêm vào `src/story/Props.tsx` / `Places.tsx` và mở rộng union `Prop`/`Place` trong `types.ts`.

5. **Tạo composition** `src/<Comp>.tsx` — theo mẫu `src/LamPhatV2.tsx`:
   import manifest generated + BOARD, `buildChapter` neo shot vào cue phụ đề,
   ghép `<Sequence>` theo `duration` từng chương, `PAD` giữa các chương, `INTRO` mở đầu.
   Export `<Comp>` và `<COMP>_DURATION`, rồi khai báo trong `src/Root.tsx`
   (thêm bản dọc 1080×1920 nếu cần).

6. **Xem**: `npm run dev` (Remotion Studio). Test một hệ hình riêng thì dùng `src/dev/*`.

7. **Render**:
   - `./render.sh <Comp> out/<name>.mp4`
   - dài (> ~2000 frame) thì `./render-segments.sh <Comp>`; nhớ thêm `<Comp>` vào bảng `map`
     trong `render-segments.sh` để nó tính đúng tổng frame (file manifest, INTRO, PAD).

## Nguyên tắc phong cách của repo

- **Hình neo vào lời.** Không chia đều thời lượng, không sinh shot tự động — máy không
  biết "câu này nên hiện cái gì". Mỗi shot khai báo câu nó minh hoạ.
- **Vẽ, không mượn.** Toàn bộ hình là SVG viết tay trong `src/art|cast|toon|story`;
  SFX tổng hợp bằng `sfx.py`. Không stock, không asset bản quyền.
- **Lỗi phải ồn ào.** Chỗ dễ lệch âm thầm (khớp `say`, thiếu file giọng) thì warn/throw
  ngay lúc build.
- **Chạy lại phải rẻ.** TTS và render-segments đều idempotent: đã có thì bỏ qua.
- **Nhân vật không trôi trên nền trống.** Mọi shot có `place`.
- **Tiếng Việt trong comment và tên biến domain.** Giữ nguyên lối viết đó khi thêm code.
