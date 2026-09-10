# Gói thành Use-Case cho OpenClaw: khả thi tới đâu (V2)

Câu hỏi: cho một agent dùng repo này tự tạo video storytime từ một chủ đề, không
người can thiệp giữa chừng, được không?

**Được cho video kể chuyện đời theo kiểu storytime, 1.5–3 phút, dùng dàn nhân
vật và prop có sẵn.** Đã chạy thật một lần đầu cuối: `media/outbound/demo-v2.mp4`
(4 chương, 77 shot, 1:27) dựng từ `scripts/demo-v2.json` + `board.json` do agent
viết, qua validator, render một lần.

## Cái tự động được

| Khâu | Trạng thái | Bằng chứng |
|---|---|---|
| Kịch bản → TTS → thời lượng thật | chạy ổn, xoay key × model khi hết quota | 4 chương demo-v2, 83 s; V1 14 chương |
| Bóc nhịp giọng (`am/nhan/nghi`) | chạy ổn | 30 fps, dùng để neo mốc cấp từ |
| Lip-sync tự động | chạy ổn, 11× thời gian thực | 563 cue / 83 s, 6.9 cue/s nói, đúng ~60% âm vị |
| Neo shot vào từ trong lời | chạy ổn | 77/77 shot neo được; V1 cấp cụm mất 26/77 |
| Snap tư thế / mắt / miệng theo `act` | chạy ổn | 2.6 act/shot có diễn viên trong demo-v2 |
| Chữ 4 kiểu, prop 28, đám đông, insert, nhịp trắng | chạy ổn | 9/9 loại shot dùng trong demo-v2 |
| Kiểm máy trước render | chạy ổn | `kiem-tra-v2` chặn 9 loại lỗi; `thong-ke-board` 9 chỉ số ✓/⚠ |
| Render chia đoạn, hỏng chạy tiếp | chạy ổn | ~17 khung/s |

Toàn bộ là code xác định; agent gọi được, kết quả lặp lại được (trừ Rhubarb
không xác định ±3% frame, đã cache).

## Cái KHÔNG tự động được

1. **Vẽ prop / nhân vật mới.** 28 prop + 9 nhân vật đủ cho chuyện trường học,
   công viên, quán cà phê, đường phố, mưa. Chủ đề khác (bếp, phòng ngủ, văn phòng,
   bệnh viện) thiếu prop; agent phải dùng prop gần nhất + chữ nhãn và ghi
   `ghi_chu`. Vẽ SVG mới vẫn là việc của người: chất lượng agent vẽ dao động, và
   không có vòng phản hồi ngoài "render rồi nhìn".
2. **Biết hình có xấu không.** Validator bắt lỗi cấu trúc và nhịp; không bắt
   được chữ đè mặt, prop lơ lửng, người ngồi lòi chân. Skill bắt agent render
   ≥ 6 still và nhìn bằng mắt (tool Read), tối đa 4 vòng; vẫn nên có người xem
   một lượt trước khi đăng.
3. **Bốn trường schema chưa nối** (`goc`, `cam`, `mau`, `boi_canh`): agent viết
   được nhưng chưa thấy trên hình; phải giả bằng `flip`/`nhin`/`act`/prop tay.
4. **Thời gian render.** 3 phút video ≈ 6 phút render. Không dùng cho luồng
   tương tác; chạy nền, báo lại.
5. **Hạn mức TTS.** 10 request/ngày mỗi cặp key × model. 2 key × 3 model = 60
   chương/ngày ≈ 8–10 video ngắn. Là bức tường thật, xoay tua chỉ nới.
6. **Lip-sync ở đặc tả dài.** ~60% âm vị đúng: cỡ trung/cận trông khớp, cận sát
   > 2 s lộ. Skill khuyên đặc tả mặt ≤ 2 s.

## Hình dạng use-case

> Agent **đạo diễn**, không **vẽ**. Đầu vào: chủ đề (+ tuỳ chọn giọng, độ dài).
> Đầu ra: `media/outbound/<ten>.mp4` + `<ten>.md`.

### Agent làm (theo `.claude/skills/tao-video/SKILL.md`)

1. Viết `scripts/<ten>.json`: 4–8 chương × 45–70 từ, câu ngắn, 3–4 punchline/chương, giọng Fenrir/Puck + style năng động.
2. `tts-gemini` → `analyze-voice` → `lipsync`.
3. Viết `src/projects/<du-an>/board.json`: 14–20 shot/chương, 9 loại shot theo ngữ pháp có số liệu (`references/dao-dien.md`), chỉ tên trong `thu-vien-v2.json`.
4. `kiem-tra-v2` exit 0; `thong-ke-board` mọi dòng ✓.
5. Tạo `phim.tsx` từ mẫu, thêm một dòng `Root.tsx` + một dòng `render-segments.sh`; `tsc` xanh; render ≥ 6 still, nhìn, sửa board.
6. `render-segments.sh` → `media/outbound/`; viết metadata + ghi công nhạc.

### Chốt chặn tự động đã có

| Lỗi | Ai bắt |
|---|---|
| `say` không có trong lời, tên ngoài thư viện, shot < 0.25 s, hai shot cùng frame, chương thưa, TD nhiều người không `noi`, insert mất ảnh, lời sửa chưa đọc lại, mouth.json cũ | `kiem-tra-v2.mjs` (✗ chặn) |
| TD liên tục > 7 s, `trong` không `dai`, thứ tự shot lệch | `kiem-tra-v2.mjs` (⚠) |
| s/shot, % < 1 s, % TD, chữ/15 s, % trắng, trung vị, shot dài nhất, TD liền, nhịp trắng dài nhất | `thong-ke-board.mjs` (✓/⚠) |
| Bản đọc dài gấp đôi (TTS ê a) | `tts-gemini.mjs` tự đọc lại |
| Thiếu prop trong `PROPS` | `tsc` |

### Chỗ vẫn cần người

Duyệt chất lượng hình trước khi đăng. Vẽ prop mới khi chủ đề ra ngoài trường
học / ngoài trời. Nối 4 trường schema còn thiếu vào renderer.

## Việc cần làm để gói chặt hơn

| Việc | Ước lượng | Lợi |
|---|---|---|
| Nối `goc`, `cam`, `mau`, `boi_canh` vào `san-khau.tsx` | vừa | agent viết board ngắn hơn ~40%, bớt act tay |
| `pipeline/xem-thu.mjs`: render sheet still mỗi shot một ảnh | nhỏ | agent soát toàn bộ shot thay vì 6 khung |
| Thêm prop nhà ở / văn phòng (giường, sofa, bàn ăn, bàn làm việc, cửa thang máy) | vừa, làm dần | mở chủ đề ngoài trường học |
| Lệnh `du-an-moi <ten>` dựng `phim.tsx` + đăng ký Root + map | nhỏ | bỏ 3 chỗ sửa tay ở bước 8 |
| Đo video sau render (số cắt, % tĩnh, đổi miệng/s) | nhỏ | kiểm thật thay ước lượng |
| Bỏ phụ thuộc Chrome hệ thống / Rosetta | vừa | chạy được trên máy khác |

## Kết luận

Khả thi cho **storytime hài 1.5–3 phút về chuyện trường học, bạn bè, đi lại,
ngoài trời**, dùng dàn nhân vật và prop cố định; một agent làm trọn một lượt
với hai lần chạy máy kiểm và một vòng soát still. Không khả thi cho **chủ đề bất
kỳ**: nút thắt là vẽ, không phải dựng. Luôn giữ một bước người xem trước khi đăng.
