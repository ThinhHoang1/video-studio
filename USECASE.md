# Gói thành Use-Case cho OpenClaw: khả thi tới đâu

Câu hỏi: cho một agent dùng repo này để tự tạo video như trong phiên làm việc
vừa rồi — làm được không?

**Được, nhưng chỉ khi bó hẹp phạm vi.** Dưới đây là ranh giới thật.

## Cái tự động được

| Khâu | Trạng thái | Bằng chứng |
|---|---|---|
| Kịch bản → TTS → đo độ dài thật | chạy ổn | 14 chương, 6p13 |
| Neo hình vào câu nói | chạy ổn | 145/145 mốc khớp |
| Cắt cảnh theo ranh giới câu | chạy ổn | không cắt giữa câu lần nào |
| Meme/SFX đúng punchline | chạy ổn | 46 mốc |
| Nhân vật cử động theo giọng | chạy ổn | 3 tầng chuyển động |
| Render chia đoạn, hỏng chạy tiếp | chạy ổn | cứu được 1 lần mất phiên |
| Xoay tua key khi hết quota | chạy ổn | 2 key × 3 model |

Toàn bộ khâu này là code xác định. Agent gọi được, và kết quả lặp lại được.

## Cái KHÔNG tự động được

**1. Vẽ cảnh mới.** Cả 18 bối cảnh và nhân vật đều là SVG viết tay cho riêng
câu chuyện này. Chủ đề mới cần cảnh mới. Agent viết được SVG, nhưng chất lượng
dao động rất mạnh và không có vòng phản hồi nào ngoài "render ra rồi nhìn".

**2. Biết cái mình vừa làm có xấu không.** Trong phiên dựng repo này, người
dùng phải chê tám lần mới ra được bản coi được:

> "giật giật trông khó chịu" · "cứ 3d hết mọi thứ trông nó nhảm" ·
> "chữ chạy nhanh hơn nói" · "copy cực ngu" · "cảnh cứ quay đi quay lại" ·
> "mồm nhân vật cứ O O giật giật"

Mỗi lời chê là một lỗi thật, và không lỗi nào lộ ra ở khâu kiểm tra tự động.
Agent chạy một mình sẽ giao bản đầu tiên.

**3. Thời gian render.** 6 phút video ≈ 12 phút render trên máy này. 13 phút
video ≈ 30 phút. Không dùng cho luồng tương tác được.

**4. Hạn mức TTS.** Free tier là bức tường thật — 10 request/ngày cho mỗi cặp
(key, model). Xoay tua chỉ nới ra, không xoá được.

## Hình dạng khả thi

Chốt lại một câu:

> Agent **đạo diễn**, không **vẽ**.

Cho nó thư viện cảnh + nhân vật dựng sẵn. Việc của nó là viết kịch bản và chọn
cảnh nào cho câu nào. Đó là khác biệt giữa thứ chạy được và thứ nghe hay.

Thư viện 18 cảnh hiện có (phòng trọ, văn phòng ngày/đêm, phòng họp, phỏng vấn,
sảnh, quán cà phê, giường đêm, các màn hình) đã đủ kể: đi làm, đi học, khởi
nghiệp, vay nợ, chuyển việc, yêu đương công sở. Đổi kịch bản và bảng phân cảnh
là ra video mới, **không cần vẽ thêm gì**.

### Agent nhận vào

```
chủ đề + chất giọng (hài / kể chuyện) + độ dài mong muốn
```

### Agent làm

1. Viết `scripts/<tên>.json` — chương, lời bình, kicker, heading
2. Chạy `pipeline/tts-gemini.mjs`
3. Viết `src/projects/<tên>/board.ts` — **chỉ được chọn từ danh sách cảnh có sẵn**
4. Viết `cues.ts` — meme/SFX từ thư viện có sẵn
5. Chạy `render-segments.sh`

### Chốt chặn tự động

Những lỗi này bắt được bằng máy, phải bắt trước khi render:

- Mốc neo không tìm thấy trong lời bình → `neoNhieu()` đã cảnh báo
- Tên cảnh không có trong thư viện → cần thêm kiểm tra
- Chương quá 90 giây mà không đổi cảnh → cần thêm kiểm tra
- Bản đọc dài bất thường (model ê a) → `tts-gemini.mjs` đã chặn
- Hai mốc trùng frame → cần thêm kiểm tra

### Chỗ vẫn cần người

Duyệt chất lượng. Không có cách nào lách. Ít nhất là xem một lượt trước khi
đăng.

## Việc cần làm để gói được

| Việc | Ước lượng |
|---|---|
| Tách danh mục cảnh ra JSON để agent đọc được tên + mô tả | nhỏ |
| Thêm các chốt chặn ở trên | nhỏ |
| Lệnh `new-project <tên>` dựng khung sẵn | nhỏ |
| Ảnh mẫu từng cảnh để agent chọn có căn cứ | vừa |
| Vẽ thêm cảnh cho các chủ đề ngoài "đi làm" | lớn, làm dần |
| Bỏ phụ thuộc Chrome hệ thống | vừa |

## Kết luận

Khả thi cho **video kể chuyện đời theo mẫu**, dùng thư viện cảnh cố định.
Không khả thi cho **video bất kỳ về chủ đề bất kỳ** — nút thắt là vẽ, không
phải dựng.

Đường đi hợp lý: giữ nguyên pipeline, mở rộng dần thư viện cảnh, và luôn giữ
một bước người duyệt trước khi đăng.
