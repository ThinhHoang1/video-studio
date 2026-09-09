# media/outbound

**Video hoàn chỉnh nằm ở đây.** Mọi bản render cuối cùng phải xuất vào thư mục
này — đây là chỗ duy nhất người dùng và các hệ thống khác đi lấy file.

```bash
./render-segments.sh <Composition> media/outbound/<ten>.mp4
```

Đặt tên theo `<chu-de>-<chat>.mp4`, ví dụ `ra-truong-vui.mp4`.

Kèm mỗi video một file `<ten>.md` cùng tên chứa: tiêu đề, mô tả để đăng, và
**câu ghi công nhạc** (bắt buộc — nhạc trong repo là CC BY).

`out/` là thư mục nháp: chứa các đoạn render dở và bản thử. Không lấy file
từ đó.
