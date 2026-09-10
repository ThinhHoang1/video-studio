# Viết kịch bản storytime hài

Storytime là **kể lại một chuyện đã xảy ra với mình**, bằng giọng của người vừa
bước ra khỏi chuyện đó. Không giảng, không rút ra bài học ở mỗi đoạn. Người xem
cười vì nhận ra mình, không phải vì được giải thích.

Kịch bản quyết định 70% video. Bảng phân cảnh chỉ diễn lại; lời nhạt thì shot
dày tới đâu cũng thành slide.

## Cấu trúc bốn nhịp

Một video 1.5–3 phút = 4–8 chương, mỗi chương một nhịp:

| Nhịp | Việc của chương | Ví dụ (demo-v2) |
|---|---|---|
| **Tình huống** | thời gian + chỗ + đang làm gì rất cụ thể, một câu mở ném thẳng vào chuyện | "Lớp tám, giờ toán, tiết cuối, buồn ngủ kinh khủng. Tôi đang ngồi vẽ con khủng long lên bìa vở." |
| **Leo thang** | mỗi câu tăng áp lực một nấc; nhân vật cố xử lý và làm tệ hơn | "Mười hai bước từ chỗ ngồi lên bảng. Kiểu là đi ra pháp trường ấy." → "Là Hà. Hà đang nhìn tôi. Ok, áp lực gấp đôi." |
| **Vỡ trận** | hành động sai lầm + hậu quả vật lý (rơi, gãy, ầm) + phản ứng người lớn | "Tôi cuống, ấn mạnh quá, phấn gãy đôi, bay xuống chân thầy. Thầy chậm rãi tháo kính." |
| **Twist** | thông tin đảo lại toàn bộ chuyện trong một câu ngắn, rồi hậu quả kéo dài | "Thầy gọi Nam Anh. Không phải em." → "Từ hôm đó thằng Long gọi tôi là Nam Bảng. Suốt ba năm." |

Video dài hơn (5–6 chương) thì thêm chương **leo thang 2** hoặc **vỡ trận 2**,
không thêm mở bài. Không có chương "bài học"; câu chốt cuối là một câu ngắn
tự trào ("Thật sự luôn.").

## Câu ngắn, tiếng đệm, nhịp

Giọng TTS đọc **2.8–3.2 âm tiết/s** khi câu ngắn; câu dài 25 từ kéo thành một
hơi đều, không có chỗ cắt shot. Luật:

- **Câu 2–8 từ là chủ đạo.** Một câu dài (12–15 từ) chỉ để dựng bối cảnh, sau đó
  phải là 2–3 câu ngắn. "Nam. Lên bảng. Cả lớp quay lại nhìn tôi. Bốn mươi cái
  đầu. Cùng một lúc."
- **Tiếng đệm mở chuyện và chuyển nhịp**: "Ok nghe này.", "Kiểu là...", "Thật
  sự luôn.", "Các bạn ơi,", "Rồi.", "Ok,". Chúng cho TTS chỗ ngắt và cho bảng
  phân cảnh một mốc `truc-dien` ngắn 0.5–1 s.
- **Câu chốt đứng riêng, có dấu chấm**: "Cứu." "Xoá." "xong." — mỗi câu này là
  một shot `chu` riêng trong board, nên viết tách hẳn, không nối bằng dấu phẩy.
- **Liệt kê bằng chuỗi ba**: "Nhìn cái đề. Nhìn lại lần hai. Toàn chữ với số."
  Ba là đủ thành nhịp; bốn thì dài.
- **Lời nhân vật khác viết thẳng, không dẫn**: "Thằng Long ngồi cạnh nghiêng
  sang thì thào: mày chết rồi." Câu thoại đó sẽ thành chữ `the` kiểu `tung-tu`.
- Tránh từ nối văn viết ("tuy nhiên", "bởi vậy", "sau đó"); dùng "Rồi", "Thế là",
  "Hoá ra".

## Punchline: 3–4 mỗi chương

Một chương 45–70 từ cần **3–4 chỗ cười**, cách nhau 4–7 giây. Bốn kiểu dễ viết:

| Kiểu | Cách | Ví dụ |
|---|---|---|
| **Đảo kỳ vọng** | dẫn tới kết luận hiển nhiên rồi lật trong 2–4 từ | "Thầy gọi Nam Anh. Không phải em." |
| **Hậu quả không cân xứng** | việc nhỏ → hậu quả đời | "Từ hôm đó thằng Long gọi tôi là Nam Bảng. Suốt ba năm." |
| **Chi tiết ngớ ngẩn nói bằng giọng nghiêm túc** | mô tả kỹ một việc vô nghĩa | "Thật sự luôn, vẽ rất tâm huyết, có cả răng." / "Viết lại chữ x. To hơn. Cho nó tự tin." |
| **Cảm ơn mỉa** | phản ứng lịch sự với điều tệ | "Cảm ơn Long. Rất hữu ích." |

Đặt punchline ở **cuối câu, cuối cụm**: từ cuối là từ gây cười. Trong board,
mỗi punchline sẽ là một trong ba cách: chữ lớn tức thì (`chu` + `vao: phong`),
đặc tả leo cỡ, hoặc im hình (`trong` 0.9–1.5 s). Viết xong hãy đánh dấu (trong
đầu) 3–4 punchline mỗi chương; thiếu thì chưa sang bước sau.

## Chi tiết cụ thể đến mức khó chịu

Không "bị gọi lên bảng" mà "mười hai bước từ chỗ ngồi lên bảng". Không "cả lớp
nhìn" mà "bốn mươi cái đầu, cùng một lúc". Không "thầy giận" mà "thầy chậm rãi
tháo kính". Danh từ + con số là thứ bảng phân cảnh vẽ được (prop `bang-den`,
`dong-nguoi` 8 đầu, act `mat: nham`), tính từ thì không.

Mỗi chương nên có **ít nhất một con số** và **một vật thể có trong thư viện prop**
(bàn học, bảng đen, phấn/bút, sách, điện thoại, laptop, xe đạp, ly trà sữa, lá
thư, đồng hồ, cửa, cửa sổ, ghế đá, gốc cây, cột điện, cổng trường, máy bay giấy).
Kể chuyện quanh những vật đó thì hình có cái để vẽ.

## Độ dài

| | Số |
|---|---|
| Từ mỗi chương | **45–70** (≈ 18–25 s đọc với style năng động). Trên 80 từ: tách chương |
| Chương | 4 (90 s) tới 8 (3 phút) |
| Câu mỗi chương | 12–20 câu ngắn |
| Punchline mỗi chương | 3–4 |
| Con số mỗi chương | ≥ 1 |

Chương ngắn hơn 40 từ thì TTS chưa vào giọng đã hết; dài hơn 80 từ thì một
bài nhạc nền chạy quá lâu và người xem quên đang ở đâu.

## Trường `style`: giữ nguyên bản năng động

Chép nguyên văn style của `scripts/demo-v2.json` (xem `SKILL.md` bước 1). Đó là
bản đã đo được 2.9 âm tiết/s và khớp nhịp cắt 1 s/shot. Chỉ đổi khi người dùng
yêu cầu chất giọng khác, và khi đó phải nói rõ hệ quả: giọng chậm → shot dài →
phải viết câu ngắn hơn nữa để bù.

Giọng: `Fenrir` (bốc, hào hứng) mặc định; `Puck` (tưng tửng) nếu chuyện nghiêng
về cà khịa. Không `Charon`/`Kore`/`Aoede` cho storytime hài.

## Chửi thề, tên riêng

- Chửi nhẹ và thưa (mỗi 2 chương một lần), không trong 7 giây đầu, không nhắm nhóm người.
- Tên nhân vật dùng đúng tên trong `thu-vien-v2.json` để khớp rig: người kể **Nam**,
  bạn **Long**, **Hà**, **Mai**, **Mẹ**, **Thầy**. Nhân vật chỉ xuất hiện một lần
  (Nam Anh, bạn cùng lớp) là `trang` đầu trắng, gọi tên trong lời vẫn được.

## Ví dụ đủ một kịch bản: `scripts/demo-v2.json`

Bốn chương, 4 nhịp đúng thứ tự, 13 punchline. Đọc nguyên file để thấy độ dài
câu và chỗ đặt tiếng đệm. Tóm tắt cấu trúc:

| Chương | Nhịp | Từ | Punchline |
|---|---|---|---|
| goi-ten | tình huống | 66 | "có cả răng" · "Bốn mươi cái đầu. Cùng một lúc." · "mày chết rồi" · "Cảm ơn Long. Rất hữu ích." |
| len-bang | leo thang | 62 | "đi ra pháp trường" · "Ok, áp lực gấp đôi" · "Viết lại chữ x. To hơn. Cho nó tự tin." |
| vo-tran | vỡ trận | 66 | "chia hai / chịu thôi" · "thầy tháo kính là hết phim rồi" · "Cứu." |
| ket | twist | 68 | "Thầy gọi Nam Anh. Không phải em." · "làm bài đúng một phút, xong" · "Nam Bảng. Suốt ba năm." |

## Tự kiểm trước khi sang bước 2

- [ ] Câu mở chương 1 ném thẳng vào thời gian + chỗ + đang làm gì?
- [ ] Mỗi chương 45–70 từ, 12–20 câu, đa số câu ≤ 8 từ?
- [ ] Mỗi chương 3–4 punchline, mỗi punchline là một câu riêng có dấu chấm?
- [ ] Mỗi chương ≥ 1 con số và ≥ 1 vật có trong danh mục prop?
- [ ] Có twist một câu ở chương cuối, và câu chốt cuối cùng ≤ 4 từ?
- [ ] `voice` là Fenrir/Puck, `style` là bản năng động nguyên văn?
- [ ] Tên nhân vật khớp `thu-vien-v2.json`?
