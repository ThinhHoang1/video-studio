# HTH Animation — mô tả kênh và mẫu mô tả video

Kênh mới, chưa có người xem cũ để dựa vào. Nên mọi chỗ viết chữ đều phải làm đúng
**một** việc: nói cho người lạ biết **xem cái này được gì** trong 2 giây đầu.

Ba chỗ dùng chữ khác nhau, đừng dùng chung một đoạn:

| Chỗ | Ai đọc | Dài |
|---|---|---|
| Giới thiệu kênh (YouTube → About) | người đã tò mò, bấm vào xem kênh là ai | 3–5 đoạn |
| Dòng đầu banner / bio TikTok | người lướt qua | 1 dòng ≤ 80 ký tự |
| Mô tả từng video | thuật toán + người muốn nguồn | 3 khối |

---

## 1. Giới thiệu kênh (YouTube → Tuỳ chỉnh kênh → Thông tin)

> **HTH Animation** — chuyện đời đi làm, kể bằng hoạt hình.
>
> Mỗi tập là một chuyện có thật đã xảy ra với người Việt đi làm: cái ngày toang ở
> công ty, buổi hẹn đầu tiên, lần đầu làm sếp chính mình. Vẽ tay, nét đen nền
> trắng, không AI đọc đều đều — kể như đang ngồi kể cho hội bạn nghe.
>
> Không phải kênh dạy làm giàu. Không có "5 bí quyết thành công". Chỉ có chuyện
> thật, cười được, và cái gì đó đọng lại sau khi tắt màn hình.
>
> Bạn có chuyện muốn kể? Bình luận hoặc gửi về: <email>

**KHÔNG HỨA LỊCH ĐĂNG.** Không viết "tập mới thứ Ba & thứ Sáu" ở bất cứ đâu — banner,
giới thiệu kênh, bio, cuối mô tả video. Một lời hứa nhịp đăng với người lạ chỉ có
đường lỗ: ra đều thì chẳng ai khen, lỡ một tuần là tự tố mình. Khi nào ra đều được
sáu tháng rồi hãy in lên.

**Hai chỗ phải sửa trước khi dán:** email, và câu thứ hai nếu định hướng kênh khác.

**Dòng đầu quan trọng nhất.** YouTube chỉ hiện ~100 ký tự đầu ở chỗ tìm kiếm và
gợi ý, phần sau bị cắt. Câu `HTH Animation — chuyện đời đi làm, kể bằng hoạt hình.`
đứng một mình vẫn nói đủ.

## 2. Bio ngắn

- **TikTok** (80 ký tự): `Chuyện đời đi làm, kể bằng hoạt hình 🎬`
- **Banner YouTube**: `CHUYỆN ĐỜI ĐI LÀM · KỂ BẰNG HOẠT HÌNH`
- **Facebook page**: `HTH Animation — hoạt hình kể chuyện đi làm của người Việt.`

## 3. Mẫu mô tả video (YouTube)

Bốn khối, đúng thứ tự này. Lý do thứ tự: **hai dòng đầu** là thứ duy nhất hiện ra
trước khi người xem bấm "xem thêm", nên đó phải là móc câu, không phải lời chào.

```
<2 dòng móc câu — nhắc lại nghịch lý của video, KHÔNG tóm tắt>

<3–5 dòng kể video có gì, viết như đang nói, không gạch đầu dòng>

⏱️ Mốc thời gian
0:00 <tên chương>
0:14 <tên chương>
...

📌 Nguồn
<link + một dòng nói rõ cái gì là thật, cái gì hư cấu>

🎵 Nhạc: Kevin MacLeod (incompetech.com) — CC BY 4.0

—
HTH Animation — chuyện đời đi làm, kể bằng hoạt hình.
Đăng ký để không lỡ tập nào.
#hashtag #hashtag #hashtag
```

**Bốn luật:**

1. **Không mở bằng "Xin chào các bạn, hôm nay mình sẽ..."** — hai dòng đầu là chỗ
   đắt nhất của mô tả, đừng đốt vào lời chào.
2. **Mốc thời gian là bắt buộc** với video > 1 phút: YouTube dùng nó làm chương,
   người xem tua được, và giữ chân tốt hơn hẳn.
3. **Nguồn đặt trong mô tả, không chỉ ở bình luận ghim** — bình luận có thể trôi.
4. **Ghi công nhạc CC BY là nghĩa vụ giấy phép**, không phải phép lịch sự. Thiếu
   là vi phạm, dù kênh nhỏ.

## 4. Ảnh bìa và avatar — dựng bằng rig, không phải Canva

Ba composition trong repo, đổi chữ/màu qua `--props`, không sửa mã:

| Composition | Cỡ | Dùng ở đâu |
|---|---|---|
| `Avatar` | 1080×1080 | avatar YouTube / Facebook / TikTok |
| `Bia` | 1280×720 | ảnh bìa TỪNG VIDEO (thumbnail) |
| `BiaKenh` | 2560×1440 | banner kênh YouTube |
| `BiaKenhFb` | 1640×856 | ảnh bìa trang Facebook |

```bash
CH="$(node -e 'import("./pipeline/moi-truong.mjs").then(m=>console.log(m.timTrinhDuyet()))')"
npx remotion still src/index.ts BiaKenh   out/banner-yt.png --browser-executable "$CH"
npx remotion still src/index.ts BiaKenhFb out/banner-fb.png --browser-executable "$CH"
npx remotion still src/index.ts Avatar    out/avatar.png    --browser-executable "$CH"
npx remotion still src/index.ts Bia       out/bia.png       --browser-executable "$CH" \
  --props='{"chu":"MẸ DÚI|2 TRIỆU","nhan":"TẬP 1","mat":"soc-lon","mieng":"o"}'
```

**VÙNG AN TOÀN là thứ quyết định banner sống hay chết.** YouTube cắt banner khác
nhau trên mỗi thiết bị: ảnh tải lên 2560×1440 nhưng **điện thoại chỉ thấy dải giữa
1546×423**. Mọi chữ và bốn nhân vật trong cùng đều nằm trọn trong dải đó; hai người
ngoài rìa là phần thưởng cho ai xem trên TV, mất cũng không sao. Facebook tương tự:
1640×856 nhưng mobile cắt hai bên, vùng chắc ăn ~1090×540 ở giữa.

Xem vùng an toàn khi căn chỉnh: thêm `"vienAnToan":true` vào `--props` (KHÔNG bật
ở bản đăng thật).

Hai lỗi đã gặp khi dựng, đừng lặp lại:
- **Đầu bị cắt cụt** vì đặt chân nhân vật quá cao — `Bia` đặt chân dưới đáy khung 30%.
- **Chữ đè lên mặt** — `Bia` tự co cỡ chữ theo dòng dài nhất và chặn trong 58% bề
  rộng trái; `BiaKenh` đẩy hai người trong cùng ra ngoài bề rộng khối chữ.

## 5. Mô tả TikTok

Khác hẳn YouTube: TikTok cắt sau ~1 dòng, không ai bấm xem thêm. Viết đúng **một
câu móc câu + 3–4 hashtag**, bỏ hết mốc thời gian và nguồn (đưa vào bình luận ghim).
