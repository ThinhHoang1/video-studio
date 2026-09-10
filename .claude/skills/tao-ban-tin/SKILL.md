---
name: tao-ban-tin
description: Làm video BẢNG TIN hoạt hình hằng ngày (kiểu BeatVN) cho một dự án/cộng đồng — thu tin có nguồn, viết kịch bản bảng tin giọng nói chuyện, TTS, lip-sync, board, render MP4. Dùng khi người dùng nói "bảng tin hôm nay", "bản tin ngày", "daily news", "tổng hợp tin cho kênh".
---

# Bảng tin hằng ngày

Cùng một cỗ máy với `tao-video` (rig, TTS, lip-sync, board, render). Khác ở **nội dung
và ràng buộc**: bảng tin ra mỗi ngày, người xem xem để **biết việc cần làm hôm nay**,
và một tin sai nguy hiểm hơn một kịch bản nhạt.

Đọc `tao-video/SKILL.md` cho pipeline; file này chỉ ghi phần khác.

## Ba luật riêng của bảng tin

1. **Mỗi tin phải có `nguon`** — mảng link http kiểm chứng được. Cổng
   `cham-kich-ban.mjs` **chặn** nếu thiếu. Không có link thì **không lên tin**,
   không "nghe nói", không suy đoán.
2. **Không bịa số.** Số hiệu bản, ngày, tên tổ chức đọc thẳng từ nguồn. Không nhớ
   chính xác thì bỏ con số ra khỏi lời đọc.
3. **Mỗi tin kết bằng việc-cần-làm** cho người xem ("lên bản này trong tuần đi",
   "nghịch ở máy phụ thôi", "cập nhật điện thoại đi"). Tin không có việc thì tin đó
   không đáng lên bảng.

## Quy trình một buổi sáng

```bash
node pipeline/ban-tin-moi.mjs 2026-09-11 --tin 5 --so 12   # sinh khung scripts/ban-tin-2026-09-11.json
```

1. **Thu tin (30 phút).** 5–7 nguồn cố định của dự án: trang release notes, commit
   log, kênh cộng đồng, forum, và 1–2 tin ngành liên quan tới người xem. Ghi lại
   link ngay lúc đọc — đi tìm lại sau là chỗ hay bịa nhất.
2. **Chọn 4–6 tin.** Tiêu chí xếp: *tin đụng vào việc người xem đang làm* > *tin
   cảnh báo* > *tin vui của cộng đồng*. Bỏ tin không đổi hành vi ai cả.
3. **Điền `vo` từng chương** theo khung dưới, rồi tự chấm `rubric`.
4. `node pipeline/cham-kich-ban.mjs ban-tin-2026-09-11` → tới khi `✓ được TTS`.
5. `node pipeline/tao-video.mjs ban-tin-2026-09-11 --soat` → dừng ở bước 5, viết
   `board.json` (2 vòng, xem `tao-video/references/dao-dien.md`), chạy lại `--tu kiem`.
6. Video ra `media/outbound/ban-tin-2026-09-11.mp4` + `.md` (bảng chấm).

## Cấu trúc chuẩn — 7 chương, 1:45–2:15

| Chương | Dài | Việc |
|---|---|---|
| `mo-bai` | 28–45 từ | cold open bằng khoảnh khắc sáng nay → "Mình là …" + một nét tự trào → hứa: hôm nay có gì, mất mấy phút |
| `tin-1..n` | 35–75 từ | mỗi tin: **chuyện gì** → **con số/tên cụ thể** → **đụng vào ai** → **việc cần làm** |
| `ket` | 35–75 từ | "Chốt lại nhá" → nhắc 2–3 việc → hẹn mai theo tiếp gì → gọi khán giả ≤ 10 từ |

`kicker` là nhãn mục in trên thẻ (`Tin chính`, `Cảnh báo`, `Cộng đồng`, `Chốt`);
`heading` là tiêu đề tin ≤ 5 từ. Cả hai bắt buộc, cổng chặn nếu thiếu.

## Giọng: bảng tin nhưng KHÔNG phải phát thanh viên

Vẫn là giọng Mixi kể chuyện (xem `tao-video/references/kich-ban-storytime.md` mục 1c),
chỉ đổi chất liệu từ chuyện đời sang tin:

- Gọi thẳng người nghe mỗi chương: "anh em", "các bạn", "bạn nào đang chạy production".
- Tự chửi mình khi kể mình đã dính: "mình nhảy sang nhánh tháng Chín một hôm, toang".
- Đọc số bằng **chữ**: `2026.6.35` → "hai không hai sáu chấm sáu chấm ba lăm". TTS
  đọc số thô rất tệ.
- Từ tiếng Anh viết dạng Việt hoá hoặc phiên âm ("email", "changelog" thì giữ nhưng
  đọc được). Cổng sẽ cảnh báo từ nào TTS hay đọc sai.
- **Cấm** giọng thời sự: "Theo thông tin từ…", "Đáng chú ý là…", "Trong một diễn biến khác".

## Dựng hình: nhịp bảng tin

Khác storytime ở chỗ mỗi tin cần một **thẻ tin** để người xem bắt kịp:

- Mở mỗi chương tin bằng một shot `loai: "chu"` với `kieu: "the"`, nội dung là
  `heading` viết hoa 2 dòng, `vao: "tung-tu"`, kèm `sfx: "ding"`. Đó là "thẻ tin".
- Thân tin xen `truc-dien` (người dẫn nói thẳng ống kính) và `minh-hoa` (dựng lại
  chuyện bằng prop). Tỉ lệ trực diện 15–25% mỗi chương — nhiều hơn storytime vì
  bảng tin là người dẫn nói với bạn.
- Số/tên riêng thì cho ra chữ `kieu: "kem"` bên cạnh mặt, đừng để trôi trong lời đọc.
- Nhạc: `20-daily-beetle` cho chương tin, đổi sang `24-grand-chase` ở tin cảnh báo,
  `25-silly-fun` cho chương cộng đồng.
- Trung vị shot 1.2–1.5 s. Dài hơn thì thành slide, ngắn hơn thì không kịp đọc thẻ.

## Ra hằng ngày mà không loãng

- `project` = tên kịch bản = `ban-tin-<YYYY-MM-DD>`. Mỗi ngày một thư mục dự án
  riêng, không sửa đè lên bản hôm qua.
- Giữ **một** người dẫn cố định (`nguoi_ke`) cho mọi số — người xem nhận ra kênh.
- Số thứ tự tập in trong `title` để đếm được.
- Bảng chấm `media/outbound/<ten>.md` phải ≥ 90%; dưới thì sửa board rồi render lại,
  đừng đăng.
