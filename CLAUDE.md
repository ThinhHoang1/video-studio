# video-studio

Dựng video kể chuyện hoạt hình bằng code: kịch bản → giọng đọc tiếng Việt →
hình khớp lời → MP4.

## Cần làm video? Dùng skill

Người dùng nói "làm video về X" thì gọi skill **`tao-video`**
(`.claude/skills/tao-video/SKILL.md`). Đừng tự mò — skill có đủ quy trình,
danh mục thư viện và các chốt chặn.

## Ba luật không phá

1. **Video thành phẩm nằm ở `media/outbound/`.** `out/` chỉ là nháp, không
   lấy file từ đó.
2. **Chạy `node pipeline/kiem-tra.mjs <ten>` trước khi render.** Render mất
   10–15 phút; mọi lỗi bắt được bằng máy phải bắt trước.
3. **Chỉ dùng tên có trong `thu-vien.json`** — cảnh, tư thế, sắc thái, tiếng
   động, nhạc. Không tự nghĩ tên mới, không tự viết cảnh SVG mới.

## Bản đồ

| Thư mục | Là gì | Dùng lại cho video khác? |
|---|---|---|
| `pipeline/` | TTS, phân tích giọng, tổng hợp SFX, kiểm tra | có |
| `src/engine/` | neo lời→frame, phụ đề, chia cụm | có |
| `src/library/` | nhân vật + 26 bối cảnh | có |
| `src/projects/` | kịch bản + bảng phân cảnh từng video | không |
| `src/attic/` | thí nghiệm cũ, không build | tham khảo |
| `media/outbound/` | **video thành phẩm** | |

Kiến trúc và các ràng buộc môi trường: `ARCHITECTURE.md`.
Đánh giá khả thi khi gói thành use-case: `USECASE.md`.

## Bản quyền

Nhạc trong `public/audio/` là CC BY (Kevin MacLeod, Scott Buckley, Chris
Zabriskie) — **bắt buộc ghi công khi đăng**, câu ghi công ở
`public/audio/CREDITS.md`. Tiếng động trong `public/sfx/` do
`pipeline/sfx.py` tự tổng hợp, không dính bản quyền của ai.

Ảnh meme và template trong `assets/`, `public/meme/` là của bên thứ ba, đã bỏ
theo dõi git, không phát hành lại.
