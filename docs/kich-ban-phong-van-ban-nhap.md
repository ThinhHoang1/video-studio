# Kịch bản "Lần đầu đi phỏng vấn xin việc" — ba bản nháp và bảng điểm

Ngày 2026-09-10. Cùng một đề, ba góc hài khác nhau, chấm bằng rubric 10 điểm
trong `.claude/skills/tao-video/references/kich-ban-storytime.md` mục 5. Bản C
điểm cao nhất, sửa thêm một vòng, ghi ra `scripts/phong-van.json`. Hai bản A, B
giữ ở đây để người sau so sánh: cùng nhân vật, cùng độ dài, khác kỹ thuật thì
điểm rơi ở đâu.

Người kể: Nam, nam sinh viên mới ra trường. Người phỏng vấn: `trang` (gọi là
"chị Trang"). Voice Fenrir, style chép nguyên văn `scripts/demo-v2.json`.

## Bảng điểm

| # | Tiêu chí | A: tự trào + leo thang | B: deadpan + chi tiết kỳ quặc | C: nhân vật phụ + callback (nháp) | C sau sửa |
|---|---|---|---|---|---|
| 1 | Hook 5 s đầu | 1 ("Ok nghe này. Hai mươi hai tuổi... CV một trang.") | 1 ("Tôi có một cái áo sơ mi. Một.") | 1 ("Long chưa đi làm ngày nào nhưng xem bốn trăm video") | 1 |
| 2 | Mật độ joke ≥ 3/chương | 1 | 1 | 1 | 1 |
| 3 | Tỉ lệ câu có chi tiết cụ thể | 0.5 (chương 3, 5 nhiều câu thoại trơn) | 1 (áo 4 cm, 3 ghế 4 người, cây trầu bà ướt, quạt) | 1 (400 video, 7 điều, rung ×3, viết hoa) | 1 |
| 4 | Leo thang ×3 ở ≥ 2 chương | 1 (chương 3 ngồi→đứng; chương 4 lương 15→5→cơm) | 0.5 (chỉ chương 2 vest→khô→không phải người) | 1 (chương 1 điều 1-2-3; chương 3 rung 1-2-3) | 1 |
| 5 | Twist chương cuối | 1 (trúng nhưng chuyển sang chăm sóc khách hàng vì "rất thật") | 1 (anh vest là nhân viên cũ, đi phỏng vấn vì điều hoà) | 0.5 (không trúng, chị gửi mail riêng: dễ đoán) | 1 (trúng vì "rất tập trung": lỗi không chớp thành lý do đậu) |
| 6 | Callback ở câu chốt | 1 ("Đó là điểm mạnh của tôi. Tìm ra rồi.") | 1 ("Được." lặp lại từ chương 1, 3) | 1 (điều bảy, chịu khó) | 1 (điều hai + điều bảy + chịu khó: ba tầng) |
| 7 | Nhân vật phụ một nét cực đoan, ≥ 2 chương | 0.5 (Long, Mẹ mỗi người một câu) | 0.5 (anh vest có nét nhưng không nói) | 1 (Long coach 400 video; Mẹ "chịu khó" nhắn viết hoa) | 1 |
| 8 | Câu chốt ≤ 6 từ mọi chương | 1 | 1 | 1 | 1 |
| 9 | Giọng riêng ≥ 2 nhân vật | 0.5 (chị Trang chưa có giọng) | 0.5 (deadpan làm mọi người cùng giọng) | 1 (Long mệnh lệnh, Mẹ lặp một câu, chị Trang hỏi lại một chữ) | 1 |
| 10 | Không phạm CẤM | 1 | 1 | 1 | 1 |
| | **Tổng** | **7.5** | **8.5** | **8.5** | **9** |

Vòng sửa bản C: viết lại chương 5. Nháp cũ cho Nam trượt và chị Trang gửi mail
khuyên "chớp mắt bình thường" — cảm động nhưng đoán được và hơi đạo lý. Bản sửa
cho Nam **đậu** vì đúng cái lỗi không chớp ("ứng viên rất tập trung"), rồi ghép
thêm callback "điều hai" của Long và cho Mẹ chuyển tiếp mail cho cả họ (đẩy nét
cực đoan của Mẹ tới cùng). Tiêu chí 5 lên 1.

## Bản A — tự trào + leo thang phi lý (7.5/10)

Điểm mạnh: hai vòng leo thang rất rõ (ngồi→đứng, 15 triệu→5→cơm), twist "rất
thật" gọi lại "điểm mạnh". Điểm yếu: chị Trang không có giọng, Long và Mẹ chỉ là
người dặn một câu, chương 3 và 5 nhiều câu thoại trơn không có chi tiết vẽ được.

```json
{
  "title": "Điểm mạnh của em là gì",
  "voice": "Fenrir",
  "project": "phong-van-a",
  "chapters": [
    {
      "id": "cv-mot-trang",
      "kicker": "CV một trang",
      "heading": "Xin việc bằng font chữ",
      "vo": "Ok nghe này. Hai mươi hai tuổi, ra trường ba tháng, CV một trang. Một trang, mà phải giãn dòng hai chấm không mới đủ. Mục kỹ năng tôi ghi: Word, Excel, làm việc nhóm. Làm việc nhóm là bốn năm ngồi nhìn Long làm hết. Mẹ đọc xong bảo: con ghi thêm chịu khó. Tôi ghi. Mẹ bảo to lên. Tôi ghi in đậm. Xin việc bằng font chữ."
    },
    {
      "id": "den-som",
      "kicker": "Bảy rưỡi",
      "heading": "Hai đứa cùng chờ",
      "vo": "Phỏng vấn chín giờ. Tôi đến bảy rưỡi. Kiểu là đến sớm cho chuyên nghiệp. Bảo vệ còn chưa đến. Tôi đứng ngoài cổng với một con chó hoang. Hai đứa cùng chờ. Từ bảy rưỡi tới chín giờ tôi soạn lại câu chào ba mươi bảy lần. Bản cuối cùng là: chào anh chị, em là Nam, em tới. Em tới. Như đi khám bệnh."
    },
    {
      "id": "diem-manh",
      "kicker": "Não trắng",
      "heading": "Em học nhanh cách ngồi",
      "vo": "Câu đầu tiên. Điểm mạnh của em là gì. Tôi bảo: em học nhanh. Chị hỏi ví dụ. Não tôi trắng. Trắng như tờ CV. Tôi nói: em học nhanh cách... ngồi. Chị gật. Chị ghi. Chị ghi cái gì tôi không biết nhưng chị ghi dài lắm. Tôi nghĩ: sửa. Sửa đi Nam. Tôi mở miệng: và em còn đứng được nữa."
    },
    {
      "id": "muc-luong",
      "kicker": "Câu tử thần",
      "heading": "Hoặc trả bằng cơm",
      "vo": "Rồi tới câu tử thần. Em mong muốn mức lương bao nhiêu. Long dặn: nói cao rồi hạ. Mẹ dặn: nói thấp cho người ta thương. Tôi làm cả hai. Tôi nói: mười lăm triệu. Hoặc là năm. Hoặc bao nhiêu cũng được. Hoặc trả bằng cơm. Chị bỏ bút xuống. Các bạn ơi, bỏ bút là hết phim rồi. Tôi ngồi đó, cười, bằng mặt."
    },
    {
      "id": "ket",
      "kicker": "Hai tuần sau",
      "heading": "Ứng viên rất thật",
      "vo": "Chị hỏi: em có câu hỏi gì cho chúng tôi không. Tôi hỏi: công ty mình có nhận em không. Im lặng. Ba giây. Chị cười. Cười thật. Hai tuần sau tôi nhận mail. Trúng. Nhưng phòng khác. Hoá ra chị chuyển CV tôi sang bộ phận chăm sóc khách hàng. Lý do: ứng viên rất thật. Thật. Đó là điểm mạnh của tôi. Tìm ra rồi."
    }
  ]
}
```

## Bản B — deadpan + chi tiết kỳ quặc (8.5/10)

Điểm mạnh: chi tiết vẽ được dày nhất trong ba bản (áo ngắn 4 cm, 3 ghế 4 người,
cây trầu bà giả nhưng ướt, quạt quay về phía họ), callback "Được." rất sạch,
twist anh vest là nhân viên cũ. Điểm yếu: giọng deadpan làm mọi nhân vật nói
cùng một kiểu, và chỉ có một vòng leo thang. Hợp voice `Puck` hơn `Fenrir`; nếu
dựng bản này thì đổi voice và nói rõ hệ quả nhịp.

```json
{
  "title": "Được là từ tệ nhất trong tiếng Việt",
  "voice": "Fenrir",
  "project": "phong-van-b",
  "chapters": [
    {
      "id": "ao-so-mi",
      "kicker": "Một cái áo",
      "heading": "Ngắn phẳng",
      "vo": "Tôi có một cái áo sơ mi. Một. Mua năm lớp mười hai để chụp kỷ yếu. Tay áo giờ ngắn hơn cổ tay bốn xăng ti mét. Tôi giải quyết bằng cách gấp tay áo lên, cho nó thành cố ý. Mẹ nhìn, không nói gì, đi lấy bàn là. Là xong, áo vẫn ngắn, nhưng ngắn phẳng. Mẹ bảo: được. Được là từ tệ nhất trong tiếng Việt."
    },
    {
      "id": "phong-cho",
      "kicker": "Ba ghế, bốn người",
      "heading": "Anh ấy không phải người",
      "vo": "Phòng chờ có ba cái ghế và bốn ứng viên. Toán ở đây rất rõ. Tôi đứng. Đứng cạnh cây trầu bà giả, giả nhưng có người tưới, đất ướt. Ứng viên đối diện mặc vest. Vest. Tháng bảy. Hà Nội. Anh ấy không đổ một giọt mồ hôi. Tôi bắt đầu nghi anh ấy không phải người. Lễ tân gọi: Nam. Tôi đi. Cây trầu bà ở lại."
    },
    {
      "id": "gioi-thieu",
      "kicker": "Một cái quạt",
      "heading": "Kể cả số điện thoại",
      "vo": "Phòng phỏng vấn có hai người và một cái quạt. Quạt hướng về phía họ. Câu đầu: em giới thiệu bản thân. Tôi giới thiệu đúng thứ tự trên CV, từ trên xuống, kể cả số điện thoại. Người bên trái ghi. Người bên phải nhìn quạt. Tôi nói xong. Người bên phải hỏi: em vừa đọc số điện thoại đúng không. Đúng. Anh bảo: được. Lại từ đó."
    },
    {
      "id": "tinh-huong",
      "kicker": "Ba chữ",
      "heading": "Khen hay chẩn đoán",
      "vo": "Câu tình huống. Nếu khách hàng nổi giận, em làm gì. Tôi trả lời rất thật: em xin lỗi trước, rồi tìm hiểu sau. Anh hỏi: xin lỗi cái gì. Tôi nói: chưa biết, nhưng xin trước cho chắc. Anh viết ba chữ. Tôi đọc ngược được. Ba chữ là: rất tự nhiên. Tôi không biết đó là lời khen hay là chẩn đoán. Quạt vẫn quay về phía họ."
    },
    {
      "id": "ket",
      "kicker": "Ba giờ sáng",
      "heading": "Phòng đấy có điều hoà",
      "vo": "Kết thúc, anh bảo: có kết quả sẽ báo. Không nói bao lâu. Tôi ra cửa, anh vest vẫn ngồi, vẫn khô. Cây trầu bà vẫn ướt. Một tuần sau, mail đến lúc ba giờ sáng. Trúng. Ngày đầu đi làm, anh vest ngồi bàn cạnh tôi. Anh là nhân viên cũ. Anh đi phỏng vấn cho vui. Hỏi tại sao, anh bảo: phòng đấy có điều hoà. Được."
    }
  ]
}
```

## Bản C nháp — chương 5 trước khi sửa

Chỉ chương 5 khác bản chọn; bốn chương đầu giống `scripts/phong-van.json`.

> Hai tuần sau có kết quả. Không trúng. Nhưng chị Trang gửi mail riêng: lần sau
> chớp mắt bình thường, và bảo mẹ đừng nhắn, chị tin rồi. Tôi về kể Long. Long im
> ba giây. Rồi bảo: mày quên điều bảy. Điều bảy là gì. Long bảo: tắt điện thoại.
> Cảm ơn Long. Rất kịp thời. Hôm đó mẹ nấu cơm ngon hơn mọi ngày. Mẹ không nói gì.
> Mẹ chịu khó.

Vì sao bỏ: kết "trượt nhưng được khuyên" là kết dễ đoán, câu của chị Trang mang
giọng đạo lý nhẹ (phạm CẤM số 5), và "mẹ nấu cơm ngon hơn" là sến. Bản sửa lật
ngược: chính lỗi không chớp lại là lý do đậu.

## Bài học rút ra cho người sau

1. **Nhân vật phụ cực đoan là cỗ máy joke rẻ nhất.** Bản C thắng vì Long và Mẹ
   mỗi người có một nét, mỗi lần xuất hiện là một joke sẵn, không cần nghĩ mới.
2. **Callback phải gieo ở chương 1.** "Điều bảy tôi quên" gieo ở câu 6 chương 1,
   nhặt lại ở câu chốt chương 5. Không gieo thì không có gì để nhặt.
3. **Deadpan cần voice khác.** Bản B viết tốt nhưng lệch với style năng động;
   nếu dựng phải đổi `Puck` và chấp nhận shot dài hơn.
4. **Twist tốt nhất là lỗi thành công.** Cả A và C sửa đều đậu nhờ cái mình
   tưởng là lỗi ("rất thật", "rất tập trung"). Kết kiểu này vừa lật vừa tự trào.
