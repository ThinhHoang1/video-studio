# Spec cổng máy chấm hài — `pipeline/cham-kich-ban.mjs`

Đây là đặc tả cho phần **hài** của cổng. Chỉ liệt kê luật đã **sống sót phản
biện**: mỗi con số dưới đây đã được đếm lại trên nguồn thật, và mọi đề xuất CHẶN
bị corpus 11 kịch bản đã duyệt bác bỏ đều đã hạ xuống CẢNH BÁO.

Nguồn hiệu chuẩn:
- `docs/tham-chieu/tuna-tuoi-tho.txt` — 2871 từ thân bài (ASR, nhiều lỗi nghe)
- `docs/tham-chieu/mixi-ke-chuyen.txt` — 541 từ sau khi bỏ timestamp (ASR)
- `scripts/*.json` trừ `_thu-lsg.json` — **11 kịch bản, 110 chương, 9005 từ**

Quy ước cột **chặn/cảnh báo**:
- **CHẶN** = không cho chạy TTS. Chỉ dùng khi luật đã chạy thử trên cả 11 kịch
  bản đã duyệt và **không chặn kịch bản nào** trong đó.
- **CẢNH BÁO** = in ra, người viết tự quyết.

> Luật vàng rút từ đợt phản biện: **mọi đề xuất CHẶN mới trong 4 bản nghiên cứu
> đều chặn 3–5 trên 11 kịch bản đã duyệt, kể cả `first-date.json` là bản đã được
> nghiệm thu đạt chuẩn.** Không thêm CHẶN nếu chưa dry-run.

---

## A. Luật đã có trong cổng — giữ, có sửa

| # | Tên luật | Đếm cái gì | Ngưỡng | Mức | Bắt nhầm ở đâu |
|---|---|---|---|---|---|
| A1 | cụ thể hoá | chữ số + tên app/thương hiệu + tên riêng viết hoa **giữa** câu, mỗi chương | **≥5** (đang là ≥3) | CẢNH BÁO | ≥3 quá dễ: chỉ 3/110 chương trượt. Ở ≥5 bắt 18/110 (16%) — đúng liều. **Không** thêm luật "0 chữ số → CHẶN": có 6 chương 0 số trong corpus đã duyệt (`ban-tin/mat-phien`, `ban-tin/weworm`, `lam-phat/ket`, `narration/hang-en`, `narration/am-thuc`, `narration/lang-que`) |
| A2 | gọi thẳng người nghe | regex rộng `em ạ\|các bạn\|mấy bạn\|anh em\|mọi người\|…`, mỗi chương | ≥1 | CẢNH BÁO | **Bỏ nhánh `\w+\s+ạ`** nếu ai đó định thêm: `rồi ạ`, `hết ạ`, `cháo ạ` là tiểu từ lễ phép, không phải hô ngữ (6/33 lần trong Tuna). Không đổi sang "đếm số chương" — đo rồi: 16 hit nằm trên đúng 16 chương khác nhau, lỗi "3 lần liền một chương" không tồn tại |
| A3 | tự chửi mình / tự hạ mình | regex `(tôi\|anh\|mình) (ngu\|dở\|tệ…)\|toang\|chết dở\|nhục` | ≥1/chương | CẢNH BÁO | Corpus: 29 hit/110 chương = 1 lần mỗi 3,9 chương, và **5/11 kịch bản có đúng 0 lần**. Giữ cảnh báo theo chương, **cấm nâng lên CHẶN** |
| A4 | tiếng đệm | `nhá\|đấy\|ấy\|xong\|thế là\|ờ\|luôn\|kiểu\|nhỉ\|…` / tổng từ | 3–6% | CẢNH BÁO | `đấy` là false positive nặng nhất: 10/10 lần trong Mixi là chỉ định từ (`lúc đấy`, `ở đấy`), không hướng người nghe. Giữ trong ngưỡng tổng, **đừng** dùng `đấy` làm bằng chứng "có gọi người nghe" |
| A5 | câu ngắn | câu ≤6 từ / tổng câu | ≥20% | CẢNH BÁO | — |
| A6 | câu quá dài | câu >32 từ | 0 | CHẶN | Đã chạy sạch trên corpus |
| A7 | thoại trực tiếp | câu có `:` hoặc `bảo\|nói\|hỏi\|kêu\|nhắn` | ≥2/chương | CẢNH BÁO | Đếm được câu **có dẫn**; thoại **không dẫn** (mục 12 cẩm nang) luật này không thấy → xem C4 |
| A8 | sáo ngữ đạo lý | từ điển `SAO_NGU` | 0 | CHẶN | — |
| A9 | tiếng Anh trần | `ANH_XAU` | 0 | CẢNH BÁO | Đo được: TTS đọc "mail" → "mèo" |
| A10 | mở bài / kết bài | cấu trúc `mo-bai` 28–45 từ, tự giới thiệu, lời hứa; chương cuối có câu gọi khán giả | theo cổng | CHẶN | — |
| A11 | callback | từ khoá ≥4 chữ ở chương cuối từng xuất hiện trước | ≥2 | CẢNH BÁO | **Đang câm**: min=6, max=25 trên 11/11 kịch bản → chưa từng nổ. Giữ nguyên, **đừng** mở rộng cửa sổ (nó đã quét toàn bộ chương trước rồi). Muốn cứu ý tưởng callback thì phải thiết kế lại: khớp **cụm ≥2 từ**, stop-list mở rộng, rồi hiệu chuẩn lại từ đầu |
| A12 | mạch chuyện / từ neo | từ mang nội dung dùng chung giữa 2 chương liền nhau | theo cổng | CẢNH BÁO | — |

## B. Luật mới — thêm được, tất cả ở mức CẢNH BÁO trừ B1 và B8

| # | Tên luật | Đếm cái gì | Ngưỡng | Mức | Bắt nhầm ở đâu |
|---|---|---|---|---|---|
| B1 | mốc văn hoá Việt | từ điển **danh từ Việt hữu hình** (món ăn, đồ vật, nơi chốn, tên riêng Việt) — KHÔNG đếm token viết hoa | **≥4/1000 từ**; **=0 toàn kịch bản → CHẶN** | CHẶN (mức kịch bản) / CẢNH BÁO (mức chương) | Nhánh "đếm token viết hoa giữa câu" phải **xoá**: nguồn ASR viết hoa ngẫu nhiên (`Nối Khố`, `Trong Sợ Hãi`), nhánh này chỉ sinh rác. **Phải dry-run trên 11 kịch bản trước khi bật CHẶN** |
| B2 | bẻ ngoặt — phân bố | mọi cửa sổ trượt **250 từ** phải chứa ≥1 trong `nhưng\|hoá ra\|ai ngờ\|đáng nhẽ\|thế mà\|ngờ đâu` | không có cửa sổ nào = 0 | CẢNH BÁO | Đây là phần **đáng giá duy nhất** của mục bẻ ngoặt — nó đo NHỊP. **Không** đặt ngưỡng mật độ: `nhưng` là liên từ phổ biến nhất tiếng Việt, một bài luận nghiêm túc cũng đạt 1/120 |
| B3 | dựng rồi đạp | `đáng nhẽ\|nhưng không\|ai ngờ\|tưởng là` | ≥2/1000 từ (Tuna: 3/2871) | CẢNH BÁO | Trùng một phần với B2 — đừng cộng điểm hai lần |
| B4 | misdirection câu ngắn | câu >12 từ, ngay sau là câu ≤5 từ mở bằng `Không\|Hoá ra\|Đúng\|Chả\|Có` | ≥1/1000 từ | CẢNH BÁO | Precision cao (7/8 đúng trên corpus) nhưng **5/11 kịch bản có 0 cặp**, gồm `first-date.json` đã nghiệm thu → **cấm CHẶN** |
| B5 | quy tắc số ba | ≥3 câu liên tiếp trong một chương mở bằng cùng một từ | 1–2 vòng/1000 từ | CẢNH BÁO | Corpus: 11 vòng/110 chương. Bắt cả liệt kê không hài — chấp nhận, vì nó còn là mốc cắt shot cho board. **5/11 kịch bản có 0 vòng → cấm CHẶN** |
| B6 | nhịp "xong" (mặt dương) | `xong` không tính `xong xuôi` | ≥6/1000 từ (Mixi: 11/1000) | CẢNH BÁO | **Đừng đếm `lại`** — bắt nhầm `trở lại`, `quay lại`, `lại thấy` |
| B7 | nối kiểu văn viết (mặt âm) | `sau đó\|tiếp theo\|kế tiếp\|và rồi` | **=0** | CẢNH BÁO | Mixi: 0/541. Đây là chỉ dấu giọng-nói-vs-giọng-viết duy nhất có **cả mặt dương lẫn mặt âm** được xác nhận bằng dữ liệu |
| B8 | chữ số dạng số trong `vo` | `[0-9]` | 0 | CHẶN | An toàn tuyệt đối: đã đo 124/124 câu thoại của 12 kịch bản duyệt, **0 câu chứa chữ số** → bật CHẶN không chặn ai. Là bảo hiểm TTS, không phải phép đo hài |
| B9 | thán từ vấp giọng mở câu | `Ơ\|ơ\|ờ\|uây\|ủa\|ê ê` ở đầu câu | ≥4/1000 từ | CẢNH BÁO | **Bỏ `à`, `ê`, `ú`, `ối`, `ok/Ok`**: `à mà`, `à ừ` là hư từ thường; `ok` bắt trúng mọi câu chat. Ngưỡng đặt theo Tuna (1/780 → nới thành 1/250), **không** theo Mixi (1/135 — chỉ một người đạt) |
| B10 | tự cãi trong đầu | `(nghĩ\|tự hỏi\|suy nghĩ)\s+(là\s+)?(ờ\|ơ\|mình\|liệu)` | ≥3/1000 từ (Mixi: 2/541 = 1/270) | CẢNH BÁO | Cụm không có động từ nghĩ (`cứ là cái câu chuyện là Ok mình quyết định rồi`) thì regex không bắt — chấp nhận, đó là giới hạn thật |
| B11 | đổi ngôi tự chấm điểm | tìm đại từ **mode** của kịch bản; đếm lần đại từ thiểu số xuất hiện trong cùng câu với từ đánh giá (`ác\|tệ\|ngu\|hèn\|dở`) | ≥1/kịch bản | CẢNH BÁO | Mục **sạch nhất** cả bộ: không cần từ điển ngôi, không bắt nhầm. Mixi: `anh` 41, `tôi` 2 — cả 2 lần `tôi` đều cạnh từ đánh giá |
| B12 | leo thang số đối xứng | hai số **cùng đơn vị**, cùng động từ, đảo chủ thể | ≥1 cặp/kịch bản | CẢNH BÁO | **Không** đặt "≥3 mốc số" — chính Mixi không đạt (mốc thứ ba `ngủ 3 ngày liền` khác đơn vị và nằm trong câu ASR nát). Máy khó ghép cặp → có thể phải hạ xuống mục C |
| B13 | từ tục | từ điển tục + biến thể + ký hiệu bíp `[ __ ]` | **0** | CHẶN | Repo cấm tuyệt đối. **Không** cài luật "bíp phải đứng cuối mệnh đề" — sai với chính nguồn: 0/4 bíp trong Tuna nằm cuối mệnh đề, cả 4 là `đéo` phủ định **giữa** câu |
| B14 | meme bão hoà + thương hiệu người thật | `flex\|gét gô\|chằm zn\|gato\|u là trời\|mãi mận\|xu cà na` + danh sách tên thương hiệu gắn người thật | 0 | CẢNH BÁO | `\bZn\b`, `\bflex\b` ở văn xuôi tiếng Việt gần như chỉ bắn nhầm khi kịch bản nói về hoá học hay code — tỉ lệ bắt đúng thấp, để cảnh báo, đừng chặn |

## C. KHÔNG đo được bằng máy — rubric người / LLM-judge

Những cơ chế này **mạnh nhất về chất** nhưng regex của chúng hoặc overfit vào một
transcript, hoặc precision dưới 40%. Cắm vào cổng là sinh nhiễu và dạy người viết
game hoá. Chấm ở bước rubric, sau khi cổng chạy xanh.

| # | Cơ chế | Vì sao máy không chấm được | Cách chấm |
|---|---|---|---|
| C1 | Hán-Việt trịnh trọng cắm vào chuyện tầm thường | Từ điển là **danh sách chép ra từ Tuna**: 38/41 từ khớp đúng **1 lần**. Kịch bản mới dùng từ trang trọng KHÁC sẽ chấm 0. Thêm nữa `chứng minh` (3/41) rơi vào đoạn học hình học — bắt trúng văn nghị luận thật | Cảnh báo mềm khi **=0**; còn lại người đọc chấm |
| C2 | Ngụy-suy luận (logic giả giọng khoa học) | Regex `với logic là\|khoa học đã chứng minh\|theo định luật` chỉ là **bộ lọc thô**; cái quyết định là suy luận có sai một cách tự tin hay không | LLM-judge, ≥2,5 lần/1000 từ |
| C3 | So sánh lệch trường nghĩa | Precision đo được **~36%**: 8 sống / 14 xác trong Tuna. Danh sách loại trừ không bắt `như + tên riêng/đại từ` (`như Linh thì`, `như tôi chắc chắn`) — lỗ hổng lớn nhất | LLM chấm: vế B phải là **danh từ cụ thể khác trường nghĩa** |
| C4 | Thoại nhảy vào vai, không câu dẫn | Cần ranh giới block + dấu câu mà ASR không có. Quy tắc "đại từ ngôi 2 khác ngôi 1" bắt nhầm `em ạ` và mọi lời kể có `cô/chú/bác/cháu` | Người đọc; hoặc LLM với điều kiện cụm ≥8 từ, zero đại từ chủ đạo |
| C5 | Cú "BÙM" của quy tắc số ba | Máy đếm được mẫu lặp, không đếm được lần ba **có phá mẫu** không | Rubric người |
| C6 | Callback thật | Bộ đo hiện tại câm (xem A11); thiết kế đúng cần khớp cụm ≥2 từ + stop-list mở rộng + hiệu chuẩn lại | Rubric người cho tới khi thiết kế lại |

## D. Luật đã bị LOẠI — đừng cài lại

| Luật | Vì sao loại |
|---|---|
| Điệp khúc / n-gram lặp | Chạy đúng thuật toán đề xuất trên Tuna: **48 ổ 3-gram, 20 ổ 4-gram, 9 ổ 5-gram** — over-fire ~10×. Ngưỡng "≥1 ổ lặp/750 từ" được thoả bởi **mọi** văn bản tiếng Việt. Siết lên (n≥4 và ≥3 lần) thì cả bản ghi còn **1** ổ |
| Cắt ngang tự sự bằng thoại (nhánh thán từ) | Nhánh thán từ khớp **44 lần** (`ừ` 17, `đấy` 10, `ơ` 8), phần lớn là tiểu từ cuối câu và rác ASR — over-fire 5,5×. Nhánh "đổi đại từ trong block" **không chạy được** |
| Chơi âm / láy phụ âm | `so_lan: 1` trên 2871 từ. Không có ngưỡng khả thi |
| Đối lập đăng đối | 28 hit, **0 hit** là bẻ nghĩa — toàn bộ là anaphora (`Hà. Hà`, `Mẹ gọi. Mẹ`). Và trùng dữ liệu với quy tắc số ba → thổi phồng điểm |
| Leo thang bằng số (bản corpus) | 38/110 chương có chuỗi số tăng → dương thì nhiễu; ngưỡng chiều ngược "<2 chương" **không bao giờ nổ** → âm thì câm. Và game hoá được bằng cách nhét số bừa |
| Hậu quả không cân xứng | Không tái lập được: đặc tả cho **6 hit**, báo cáo ghi **23** |
| Tự chửi mình leo thang (gate độ dài) | Quy tắc "cụm sau dài hơn cụm trước" bị chính Mixi fail ở nấc cuối (`tệ vãi cả đá` ngắn hơn `ác vãi cả cứt luôn`) |
| Đâm chửi vào giữa câu triết lý | `mẹ` xuất hiện 6/541 từ trong Mixi, phần lớn là **người mẹ thật**. Đưa `mẹ\|bố` vào từ điển tục là bảo đảm bắt nhầm mọi kịch bản có nhân vật gia đình |
| Anti-climax bằng sự vắng mặt | n=1, và cái "vắng mặt" đó là **ASR nuốt chữ "không"** |
| Đếm **từ-số** (`một/hai/năm`) | 56/65 lần khớp là mạo từ hoặc `năm` = year. Đo tiếng Việt, không đo hài |
| Đếm **token viết hoa giữa câu** | Nguồn ASR viết hoa ngẫu nhiên |
| Quy ước TTS "viết Top năm thay Top 5" | Không phải phát hiện: đã đo **124/124** câu thoại không chứa chữ số. Giữ ở B8 làm bảo hiểm, đừng khai là luật hài |

---

## E. Thứ tự triển khai đề nghị

1. Sửa A1 `<3` → `<5` — thay đổi một dòng, đã có bằng chứng.
2. Thêm B8, B13 (CHẶN, dry-run trước; cả hai đều chạy sạch trên corpus).
3. Thêm B2, B4, B6, B7, B9, B11 (CẢNH BÁO, rẻ, precision đã đo).
4. B1 — dựng từ điển mốc văn hoá Việt, dry-run 11 kịch bản, **rồi mới** bật CHẶN.
5. B3, B5, B10, B12, B14 — thêm sau, giá trị thấp hơn.
6. C1–C6 vào rubric người, không vào cổng.
