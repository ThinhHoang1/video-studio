# Cẩm nang hài — storytime tiếng Việt, đọc bằng TTS

File này KHÔNG dạy lý thuyết hài. Nó là danh sách **cơ chế đã qua phản biện trên
dữ liệu thật**: transcript Tuna (`docs/tham-chieu/tuna-tuoi-tho.txt`, 2871 từ thân
bài), transcript Mixi (`docs/tham-chieu/mixi-ke-chuyen.txt`, 541 từ), và corpus 11
kịch bản đã duyệt trong `scripts/*.json` (110 chương, 9005 từ). Mọi cơ chế đếm
được đã đếm lại; mọi ngưỡng bịa đã bị hạ hoặc xoá.

**Đọc trước khi viết một chữ nào.**

## Cách đọc liều lượng

Một kịch bản storytime 14 chương ≈ **850–1000 từ**. Nên cột "liều lượng" ghi theo
**mỗi 1000 từ ≈ mỗi kịch bản**. Con số gốc lấy từ nguồn nào thì ghi rõ nguồn đó.

Ba cảnh báo phải nhớ, nếu quên thì mọi con số dưới đây thành mê tín:

1. **n rất nhỏ.** Ngưỡng rút từ 1–2 creator. Chúng là *sàn để không nhạt*, không
   phải *chuẩn tiếng Việt*. Vượt sàn không có nghĩa là buồn cười.
2. **Hai transcript là ASR lỗi.** `vã cứt`, `sangc nhà bạn`, `Mẹ nhặc Con Từ bãi
   giác`, viết hoa loạn giữa câu. Đừng học chính tả hay cách viết hoa từ chúng —
   chỉ học **lựa chọn kể**.
3. **Đếm được ≠ buồn cười.** Bốn cơ chế mạnh nhất (mục 7, 8, 9, 10) máy không
   chấm nổi. Máy chỉ chặn được cái *nhạt thấy rõ*.

---

## 1. Mốc văn hoá Việt — chống giọng dịch

**(a) Cơ chế.** Đặt tên thật của đồ vật/nơi chốn/thói quen Việt vào câu, thay cho
danh từ chung. Người xem cười vì *nhận ra*, không vì câu đó có joke. Đây là thứ
phân biệt "kịch bản Việt" với "kịch bản Mỹ dịch ra" — và kịch bản len-sai-gon
hiện tại đang hỏng chính ở đây.

**(b) Nguyên văn.**
- Tuna: *"các bạn đã đọc Doraemon bao …"* (dòng 52)
- Tuna: *"người duy nhất vì ta mà nhảy vào nước sôi lửa bỏng thì chỉ có thể là mì tôm"* (dòng 63)

**(c) Tự viết (bỏ quê lên Sài Gòn).** "Mẹ nhét vào ba lô hai gói mì Hảo Hảo với
một hộp muối vừng. Như thể Sài Gòn là chỗ không có mì."

**(d) Liều lượng.** **≥4 mốc / 1000 từ** (Tuna: 13/2871 = 4,5). Rải đều, không dồn.

**(e) Hỏng khi quá tay.** Thành liệt kê hoài niệm: "dép tổ ong, Nokia 1280, quán
net, bi ve…". Liệt kê không phải joke — mỗi mốc phải **làm một việc trong câu**
(là chủ ngữ, là vật cản, là punchline), không phải trang trí.

---

## 2. Cụ thể hoá — số và tên riêng thay tính từ

**(a) Cơ chế.** Bỏ tính từ ("rất đông", "lâu lắm"), thay bằng một con số lẻ hoặc
một cái tên. Chi tiết càng thừa càng buồn cười vì nó chứng tỏ người kể *vẫn còn
nhớ*, tức là vẫn còn cay.

**(b) Nguyên văn.**
- Tuna: *"4380 ngày và hơn 8760 …"* (dòng 59)
- `len-sai-gon.json`: *"mình rải hai mươi bảy chỗ"*

**(c) Tự viết.** "Xe giường nằm giường số 27, tầng trên, sát toilet. Mười tiếng.
Tôi lên Sài Gòn bằng cái mùi đó."

**(d) Liều lượng.** Cổng đã đo: **trung vị 7 chi tiết/chương** (số + tên app + tên
riêng). Sàn mới: **≥5/chương**. Số lẻ thì mạnh hơn số tròn (27 > 30).

**(e) Hỏng khi quá tay.** Nhồi số cho qua cổng → câu thành hoá đơn. Và nhớ: **viết
số bằng chữ** trong `vo`, TTS đọc chữ số sai nhịp.

---

## 3. Bẻ ngoặt — dựng rồi đạp

**(a) Cơ chế.** Dựng một kỳ vọng đủ dài để người nghe tin, rồi đạp trong 2–4 từ.
Từ khoá đạp: `đáng nhẽ / nhưng không / ai ngờ / thế mà`. Quan trọng hơn mật độ là
**phân bố**: không được có đoạn 250 từ nào phẳng lì.

**(b) Nguyên văn.**
- Tuna: *"rượu đã đi một bước mà không ai ngờ tới"* (dòng 42)
- Tuna: *"Tuy ban đầu chưa thành công nhưng đã chứng tỏ được là mình có lối đi riêng"* (dòng 18)

**(c) Tự viết.** "Tôi tính ở tạm nhà ông anh họ một tuần rồi thuê trọ. Một tuần
đó kéo tới tháng thứ năm. Ông anh cưới vợ tôi mới ra."

**(d) Liều lượng.** Công thức "dựng rồi đạp" đầy đủ: **≥2 lần/1000 từ** (Tuna: 3).
Bẻ ngoặt nhẹ (`nhưng`, `hoá ra`): **mỗi cửa sổ 250 từ ≥1**.

**(e) Hỏng khi quá tay.** `nhưng` là liên từ phổ biến nhất tiếng Việt — đếm dày
đặc `nhưng` không chứng minh gì cả; một bài luận nghiêm túc cũng đạt. Đạp mà
không dựng đủ dài thì người nghe không kịp tin, không có cú rơi.

---

## 4. Misdirection câu ngắn — câu dài rồi một câu ≤5 từ lật nghĩa

**(a) Cơ chế.** Một câu dài, đủ chi tiết, giọng nghiêm túc → xuống dòng → một câu
cực ngắn mở bằng từ mốc (`Không / Hoá ra / Đúng / Chả`) lật ngược toàn bộ. Đây là
cơ chế **precision cao nhất** đo được trên corpus: 7/8 lần bắt đúng.

**(b) Nguyên văn.**
- `lam-phat.json`: *"Không hề."*
- `tinh-dau.json`: *"Hoá ra không."* / `len-sai-gon.json`: *"Không giàu."*

**(c) Tự viết.** "Tôi mang theo cái bằng giỏi, hai bộ vest mẹ mua, và niềm tin
rằng Sài Gòn đang thiếu người như tôi. Sài Gòn không thiếu."

**(d) Liều lượng.** **≥1/1000 từ** (corpus: 8/9005). Đây là sàn thấp — vượt nhiều
thì tốt, nhưng đừng để chương nào có 3 cú liền, nghe thành tật.

**(e) Hỏng khi quá tay.** Câu ngắn liên tục không lật nghĩa gì thì chỉ là xuống
dòng. Cú lật phải **mâu thuẫn với câu trước**, không phải nhấn lại câu trước.

---

## 5. Quy tắc số ba

**(a) Cơ chế.** Hai lần dựng mẫu giống nhau, lần ba phá mẫu. Nhịp 1-2-BÙM. Lợi
kép: nó cũng là **mốc cắt shot** cho board.

**(b) Nguyên văn.**
- `phong-van.json`: *"Rung lần một, chị nhìn tôi. Rung lần hai, chị nhìn bàn. Rung lần ba, tôi…"*
- Tuna: *"nhìn hình ta thấy chứng minh đường thẳng a song song … nhìn hình ta thấy chứng minh hai đoạn thẳng bằng nhau … nhìn hình ta thấy tứ giác a b CD là hình gì"* (dòng 17–18)

**(c) Tự viết.** "Ngày một, tôi gọi mẹ khoe phòng trọ. Ngày hai, tôi gọi mẹ khoe
đi làm. Ngày ba mươi, tôi gọi mẹ hỏi vay."

**(d) Liều lượng.** **1–2 vòng / 1000 từ** (corpus: 11 vòng/110 chương). Một vòng
mỗi 4–5 chương là đủ; nhiều hơn thì cả kịch bản nghe như bài vè.

**(e) Hỏng khi quá tay.** Máy chỉ đếm được **mẫu lặp**, không đếm được **cú BÙM**.
Lặp ba lần mà lần ba không phá mẫu = liệt kê. Đây là lỗi phổ biến nhất khi viết
cho qua cổng.

---

## 6. Leo thang số đối xứng

**(a) Cơ chế.** Hai con số **cùng đơn vị, cùng hành động, đảo vai**. Nhân 2–3 lần.
Cú cười nằm ở chỗ người nghe tự làm phép chia.

**(b) Nguyên văn (cùng một mạch Mixi).**
- *"anh đã từng ngồi trước cửa nhà người yêu cũ của anh Hai hay ba tiếng"* (dòng 26–28)
- *"anh đã từng để cho người yêu cũ của anh đợi dưới cửa nhà anh 6 tiếng đồng hồ"* (dòng 33–35)

**(c) Tự viết.** "Tháng đầu tôi đi bộ hai cây số để tiết kiệm sáu nghìn tiền xe.
Tháng thứ tám tôi bo sáu mươi nghìn cho anh shipper leo bốn tầng."

**(d) Liều lượng.** **≥1 cặp đối xứng / kịch bản**. Không đặt ngưỡng "≥3 mốc số" —
chính Mixi không đạt.

**(e) Hỏng khi quá tay.** Số khác đơn vị thì không thành thang, chỉ thành hai con
số đứng cạnh nhau. Và ba nấc trở lên thì phải có nấc vỡ trần, nếu không nó là
biểu đồ.

---

## 7. Hán-Việt trịnh trọng cắm vào chuyện tầm thường *(LLM chấm, máy không chấm)*

**(a) Cơ chế.** Dùng từ trang trọng — `quả nhiên`, `vĩ đại`, `duy nhất`, `kiên
nhẫn`, `biểu quyết` — để mô tả một việc bẩn thỉu hoặc vụn vặt. Khoảng cách giữa
**đẳng cấp từ ngữ** và **đẳng cấp sự việc** chính là cú cười.

**(b) Nguyên văn.**
- Tuna: *"một cục cức vĩ đại mà nhìn vào không ai dám nghĩ nó đến từ một con…"* (dòng 38)
- Tuna: *"thế là theo biểu quyết số đông rượu vào vai công chúa"* (dòng 54)

**(c) Tự viết.** "Tôi long trọng khai trương gian bếp bốn mét vuông bằng một gói
mì. Nghi thức gồm: đun nước, và khóc."

**(d) Liều lượng.** **≈10 lần/1000 từ** (Tuna: 41/2871 ≈ 1/70). Nhưng đây là **cảnh
báo mềm**: nếu =0 thì chắc chắn giọng đang phẳng; nếu >0 thì máy không kết luận
được gì.

**(e) Hỏng khi quá tay.** Thành văn nghị luận thật. Trong chính Tuna, 3 lần
`chứng minh` rơi vào đoạn học hình học — tức là từ trang trọng dùng **đúng chỗ
trang trọng** thì không hài. Từ trịnh trọng phải đứng cạnh **vật tầm thường**,
nếu không nó chỉ là văn nói khó nghe.

---

## 8. Ngụy-suy luận — logic giả, giọng khoa học *(LLM chấm)*

**(a) Cơ chế.** Tuyên bố một định luật không tồn tại, hoặc suy luận nhân quả sai
hoàn toàn, bằng giọng người biết mình đúng. Đây là cơ chế **mạnh nhất về chất**
trong cả hai transcript.

**(b) Nguyên văn.**
- Tuna: *"tôi nhanh trí đạp Linh xuống sông với logic là sẽ không có ai…"* (dòng 14)
- Tuna: *"khoa học đã chứng minh là bệnh ngu Nó lây qua đường tình bạn"* (dòng 16)
- Tuna: *"nhưng hơi đen là đúng theo định luật mpy khi một chuyện xấu xảy ra thì nó sẽ diễn biến theo trường hợp tồi…"* (dòng 45)

**(c) Tự viết.** "Tôi chọn trọ theo nguyên tắc bất di bất dịch: gần chỗ làm thì
xa chợ, gần chợ thì xa chỗ làm. Tôi chọn xa cả hai, vì rẻ. Về mặt hình học, tôi
đã tối ưu."

**(d) Liều lượng.** **≥2,5 lần/1000 từ** (Tuna: 9/2871 ≈ 1/319).

**(e) Hỏng khi quá tay.** Người kể thành thằng ngốc *bịa*, không còn là thằng ngốc
*tin thật*. Cú cười chết ngay khi người nghe cảm thấy tác giả đang nháy mắt.
Regex chỉ lọc thô được cụm `với logic là / khoa học đã chứng minh / theo định
luật`; phần còn lại là việc của người đọc.

---

## 9. So sánh lệch trường nghĩa *(LLM chấm)*

**(a) Cơ chế.** Vế B phải là **danh từ cụ thể thuộc trường nghĩa khác hẳn** vế A.
Không phải "như tôi", "như thế", "như bao người" — đó là so sánh chết.

**(b) Nguyên văn.**
- Tuna: *"mái tóc bồng bề lãng tử … là dài như lông chó"* (dòng 6)
- Tuna: *"Linh cười như ve sầu"* (dòng 73)

**(c) Tự viết.** "Phòng trọ rộng đúng bằng cái chiếu. Nằm xong là hết đất, như
con tem dán vừa khít cái phong bì."

**(d) Liều lượng.** **≥2,5 so sánh SỐNG / 1000 từ** (Tuna thật: 8/2871 = 1/359).
Đừng tính các cụm `như + đại từ/tên riêng` — trong Tuna, 14/22 lần `như` là xác.

**(e) Hỏng khi quá tay.** Mỗi câu một ví von thì thành thơ, và người nghe mất
mạch chuyện. Một chương một so sánh sống là đẹp.

---

## 10. Tự hạ mình — người kể là kẻ ngốc

**(a) Cơ chế.** Người kể thua trước, thua rõ, không tự cứu. Khán giả chỉ cho phép
cười một nhân vật: nhân vật tự nhận mình đáng cười.

**(b) Nguyên văn.**
- Mixi: *"tôi ác vãi cả cứt luôn các bạn tôi tệ vãi cả đá rồi"* (dòng 53–54) —
  *học cơ chế, KHÔNG chép từ tục; xem mục CẤM.*
- Tuna: *"bốn năm cấp hai tôi chưa đòi được của nhà nó một đồng quỹ lớp nào"* (dòng 24)

**(c) Tự viết.** "Tôi lên Sài Gòn với một cái bằng giỏi và niềm tin rằng mình
khác. Khác thật. Đứa cùng phòng ba tháng lên lương, tôi ba tháng lên cân."

**(d) Liều lượng.** **≥2 lần/1000 từ** (corpus: 29/9005 ≈ 3,2). Sàn mức chương:
cảnh báo, không chặn — 5/11 kịch bản đã duyệt có 0 lần theo mẫu hẹp.

**(e) Hỏng khi quá tay.** Than thân. Ranh giới: tự hạ mình là **kể việc mình làm
ngu**, than thân là **kể cảm giác mình khổ**. Việc thì cười được, cảm giác thì
không. Cũng đừng ép "lần sau phải chửi nặng hơn lần trước" — chính Mixi tụt nấc
ở lần cuối mà vẫn hay.

---

## 11. Gọi thẳng người nghe + từ đệm níu tai

**(a) Cơ chế.** Dừng chuyện, quay ra nói với khán giả một câu ngắn. Cộng với các
tiểu từ hướng người nghe (`em ạ`, `các bạn`, `nhá`, `nha`, `nhỉ`) rải trong câu
kể. Đây là **detector rẻ và chắc nhất** trong cả bộ, và là thứ biến TTS từ giọng
đọc thành giọng nói.

**(b) Nguyên văn.**
- Tuna: *"các bạn tưởng là đã hết video rồi đúng không"* (dòng 84)
- Mixi: *"lần quyết định thực sự luôn em ạ"* (dòng 25–26)

**(c) Tự viết.** "Các bạn đoán thử tháng đầu tôi tiêu hết bao nhiêu. Sai rồi.
Gấp đôi."

**(d) Liều lượng.** Hô ngữ/aside: **≥7 lần/1000 từ** (Tuna sau khi lọc: 27/2871 ≈
1/106). Từ đệm tổng: **3–6% số từ** (cổng đang đo).

**(e) Hỏng khi quá tay.** Hai bẫy: (1) `ạ` cuối câu lễ phép (`rồi ạ`, `hết ạ`)
**không phải** hô ngữ, nó là register, đừng ghi công; (2) `đấy` hầu hết là chỉ
định từ (`lúc đấy`, `ở đấy`) chứ không hướng về người nghe — nhồi `đấy` để qua
cổng là tự lừa mình. Và gọi khán giả 3 lần trong một chương thì thành MC bán hàng.

---

## 12. Nhảy thẳng vào vai — thoại không có câu dẫn

**(a) Cơ chế.** Đang kể, đổi giọng sang nói **nguyên lời nhân vật**, không "tôi
bảo rằng", không dấu hai chấm. Người nghe tự hiểu ai đang nói nhờ đại từ đổi.

**(b) Nguyên văn.**
- Mixi (cụm 27 từ, không có chữ "anh" nào): *"bạn ấy vẫn đang ở cửa nhà cháu này
  cô qua đón đi hay là cô bảo bạn ấy về đi Tại cháu phải đi làm bây giờ"* (dòng 24–28)
- Tuna: *"anh chị có biết bây giờ là mấy giờ rồi không"* → *"Ơ kìa đồng hồ cuối
  Lớp sao cô lại hỏi em"* (dòng 20–21)

**(c) Tự viết.** "Chị chủ trọ mở cửa. Ba triệu, cọc một tháng, không nấu ăn,
không khách qua đêm, không thú cưng, em ok thì dọn vào chiều nay. Tôi ok. Tôi
không có gì để mặc cả ngoài sự ngoan."

**(d) Liều lượng.** **≥1 cụm/1000 từ**; và cổng đã yêu cầu **≥2 câu thoại/chương**.
Đối thoại hai lượt (nói — đáp trả) là hàng hiếm: trong cả Tuna chỉ có **1** lần.
Có được 1 lần trong kịch bản là tốt, đừng ép 4.

**(e) Hỏng khi quá tay.** Không có đại từ neo thì người nghe lạc, TTS đọc đều đều
càng lạc. Cụm thoại không dẫn phải **≥8 từ** và chứa đại từ xưng hô khác hẳn
giọng kể chính, nếu không nó chỉ là câu kể bị hụt chủ ngữ.

---

## 13. Đổi ngôi giữa chừng để tự chấm điểm mình

**(a) Cơ chế.** Cả bài xưng một ngôi; đúng lúc tự đánh giá bản thân thì **đổi sang
ngôi khác**. Việc đổi ngôi báo hiệu "đây là lời thú tội", không cần nói ra.

**(b) Nguyên văn (Mixi xưng `anh` 41 lần, `tôi` đúng 2 lần — cả 2 đều cạnh từ đánh giá).**
- *"Lúc ấy tôi ác vãi cả cứt luôn các bạn tôi tệ vãi cả đá rồi"* (dòng 52–54)
- Ngay sau đó quay lại: *"anh học ra một điều em ạ"* (dòng 54)

**(c) Tự viết.** "Mình gửi về cho mẹ hai triệu, tháng nào cũng vậy. Tôi kể cái đó
ra để nghe cho đỡ tệ. Mình vay của mẹ bốn triệu hồi tháng ba thì mình không kể."

**(d) Liều lượng.** **1–2 lần/kịch bản**, đúng chỗ tự đánh giá. Đây là mục **sạch
nhất** cả bộ: đo được bằng máy, không cần từ điển, gần như không bắt nhầm.

**(e) Hỏng khi quá tay.** Đổi ngôi lung tung ở câu kể thường thì người nghe tưởng
lỗi biên tập. Ngôi chính phải chiếm >80% để lần đổi mới có nghĩa.

---

## 14. Nhịp nói "xong… xong lại…" + thán từ vấp giọng + tự cãi trong đầu

**(a) Cơ chế.** Ba thứ nhỏ tạo ra **giọng nói** thay vì **giọng viết**:
- nối các việc bằng `xong`, `xong lại`, không bao giờ bằng `sau đó / tiếp theo / và rồi`;
- mở câu bằng thán từ vấp (`Ơ`, `ờ`, `uây`, `ủa`) khi vừa nhận ra điều gì;
- tự cãi nhau trong đầu: `nghĩ là ờ…`, `mình nhắn không nhỉ`.

**(b) Nguyên văn.**
- Mixi: *"anh đi làm xong nhá 6:00 Tối anh quay trở lại ngõ"* (dòng 43) — trong
  541 từ có **6 lần `xong`** và **0 lần** `sau đó / tiếp theo / và rồi`.
- Mixi: *"trong đầu mình vẫn cứ bị suy nghĩ là ờ mẹ mày mình nhắn không nhỉ Mình
  sẽ nhắn cái gì nhỉ"* (dòng 20–22)

**(c) Tự viết.** "Tôi đặt ba lô xuống, xong ngồi thở, xong lại đứng lên đóng cửa
sổ. Ơ mà cửa sổ nhìn ra tường. Đóng làm gì."

**(d) Liều lượng.** `xong` **≥6/1000 từ** (Mixi: 11/1000) và `sau đó|tiếp theo|kế
tiếp|và rồi` = **0**. Thán từ mở câu **≥4/1000** (đặt sàn theo Tuna 1/780, không
theo Mixi 1/135). Tự cãi trong đầu **≥3/1000** (Mixi: 2/541).

**(e) Hỏng khi quá tay.** `xong` mỗi câu thì thành tật máy móc. Đừng đếm `lại`
(bắt nhầm `trở lại`, `quay lại`). Đừng cho `à` vào danh sách thán từ — `à mà`,
`à ừ` là hư từ thường, bắt nhầm cả bài.

---

## Chất liệu trending còn dùng được

Ngày chốt: **11/09/2026**. Chỉ 9 món sống sót kiểm chứng; các món khác bị loại vì
trích dẫn sai nguồn, đã bão hoà, hoặc dính người thật.

### Chất liệu (5)

| Chất liệu | Nguồn + mốc | Hạn dùng | Dùng thế nào |
|---|---|---|---|
| **"Thành phố sợi chỉ"** (Threads city) | kenh14, 21:16 02/09/2026 — có câu "Cư dân 'Threads city' hưởng ứng" | **Dài** — tới ~12/2026 | Gọi tên nơi dân tình tụ tập than thở; hợp chương "lên Sài Gòn rồi lên mạng than" |
| **AI vẽ lại ảnh đời thường** (nét nguệch ngoạc, giữ nguyên người/trang phục/dáng đứng) | kenh14 | **Dài** | Trend HÌNH — phải **mô tả bằng lời** trong `vo`, không dựa vào người xem đã thấy ảnh |
| **Audio "Tôi đã trưởng thành từ trong đau khổ"** | mktsoftware, 08/08/2026 — "đoạn audio kịch tính ghép vào video kể chuyện" | **Trung bình** — tới ~10/2026 | Câu tự trào sau một thất bại vặt; đọc giọng nghiêm rồi hạ |
| **"Nếu em biến thành con gián"** | mktsoftware — "câu hỏi vui quen thuộc của các cặp đôi phát triển thành audio" | **Ngắn** | Chỉ dùng ở chương có hội thoại đôi lứa |
| **"Top năm thứ đáng tiền"** | kenh14, 19:47 22/07/2026 — nguồn ghi rõ **không bắt nguồn từ VN**, gốc là "Top 5 worth-it purchases" | **Sắp hết** (đã 7 tuần) — dùng ngay hoặc bỏ | Khung liệt kê mua sắm tháng đầu ở Sài Gòn |

### Chủ đề có số liệu (4)

| Chủ đề | Số đã kiểm | Nguồn + mốc | Lưu ý bắt buộc |
|---|---|---|---|
| **Học sinh dùng AI** | 94% có dùng, ~70% dùng thường xuyên | PISA 2025 (OECD) công bố 08/09/2026; VTV đăng 10/09/2026 13:23 | **Không** có vụ "giáo viên cho 0 điểm vì nghi bài AI" — đó là bịa, cấm nhắc |
| **Fresher khó xin việc** | tin tuyển entry **−12,96%** so 2024, **−37,34%** so 2023; thất nghiệp thanh niên 8,38% (thành thị 11,24%); vị trí 3+ năm KN **+40%**; Hành chính-Nhân sự **−53,18%**, Kế toán −36,22%, Tài chính-NH −34,52% | Bài **25/12/2025**, dữ liệu cả năm 2025 | Số đã **9 tháng tuổi** — phải nói "năm ngoái". Nguồn **không** nói "tuyển 3 năm KN cho vị trí entry" |
| **Giá nhà chạy nhanh hơn lương** | +~50% trong 5 năm ở TP.HCM; Hà Nội ~100 triệu/m² đã vượt TP.HCM ~91 triệu/m²; vùng ven: Bình Chánh, Nhà Bè, Dĩ An, Thuận An, Nhơn Trạch, Bến Lức | Bài 20/06/2026 | Con số Hà Nội/TP.HCM là **quý 1/2026**, phải ghi rõ khi nói |
| **Lương bình quân 9 triệu** | 9 triệu/tháng; thành thị 10,6; nông thôn 7,9; **+717 nghìn** so cùng kỳ 2025; **−53 nghìn** so quý 1/2026 vì hết thưởng Tết | Bài 06/07/2026 | Chi tiết "giảm 53 nghìn vì hết thưởng Tết" buồn cười hơn con số tăng — ưu tiên dùng cái đó |

---

## CẤM

**Từ tục — cấm tuyệt đối, kể cả bíp.** Hai transcript nguồn đầy `cức`, `đéo`,
`vãi`. Học **cơ chế** của chúng (tự hạ mình, phủ định giữa câu), **không chép từ**.
Video repo này phát công khai và đọc bằng TTS; một từ tục là hỏng cả bản dựng.
- Ghi chú kỹ thuật, để không học sai: trong Tuna, **0/4** lần bíp nằm cuối mệnh
  đề — cả 4 đều là `đéo` bị che **giữa câu**, đóng vai phủ định (`xong […] hiểu
  sao`, `chứ […] phải thứ võ`). Luật "bíp phải đứng cuối câu" là sai. Nhưng ở đây
  luật đúng vẫn là: **không dùng**.

**Chế giễu vùng miền / xuất thân.** Kịch bản là "bỏ quê lên Sài Gòn" — nguy cơ cao
nhất nằm đúng ở đây. Cấm: nhại giọng địa phương, "dân tỉnh lẻ", "nhà quê",
"ở quê thì biết gì". Người kể tự cười **mình**, không cười **quê mình**.

**Chế giễu ngoại hình.** Cân nặng, màu da, chiều cao, răng, mụn — của bất kỳ nhân
vật nào, kể cả nhân vật phụ phản diện.

**Đùa trầm cảm / tự tử / bệnh tâm thần.** Gồm cả meme `chằm Zn` (= "trầm cảm").

**Meme đã bão hoà — cấm vì nhạt, không vì bậy.** `flex`, `gét gô`, `chằm Zn`,
`gato`, `u là trời`, `mãi mận`, `xu cà na`. Chúng đã thành từ toàn dân từ 2025;
dùng là tự khai kịch bản viết bởi người không ở trên mạng.

**Thương hiệu gắn với người thật.** Ví dụ hỏng đã gặp: "Laura cà phê của ca sĩ
Nhật Kim Anh" — nhắc nhịp câu là đã dính một người có thật. Đặt tên hàng hư cấu.

**Sáo ngữ đạo lý** (`bài học rút ra`, `cuộc sống mà`, `trưởng thành là…`). Cổng đã
chặn. Storytime không giảng đạo lý — mục 13 (đổi ngôi tự chấm điểm) là cách nói
cùng ý đó mà không giảng.

**Tiếng Anh trần trong `vo`.** Gemini TTS đọc sai (đo được: "mail" → "mèo"). Viết
"email", "phôn", hoặc từ Việt.

**Chữ số viết dạng số trong `vo`.** Viết "hai mươi bảy", không viết "27".
