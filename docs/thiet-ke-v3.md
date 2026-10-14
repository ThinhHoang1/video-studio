"# BẢN THIẾT KẾ THI CÔNG — RIG V3 "XƯƠNG & NHỊP"

Bản tổng hợp cuối. Viết cho người ngồi code. Mọi path là tuyệt đối từ `/Users/leanhvu/video-studio`.

---

## 0. PHÁN QUYẾT CHỐT (đọc trước, đừng bỏ qua)

Bốn phương án chấm ra 6.875 / 6.875 / 6.75 / 5.75. Hai phương án đầu **hoà điểm và chúng nói ngược nhau** — một bảo lỗi ở HÌNH, một bảo lỗi ở ĐỘNG. Nhưng đọc kỹ 16 bản chấm thì cả 16 giám khảo, không trừ một ai, đều kết luận cùng một câu:

> Mỗi phương án đều đúng về nửa của mình, và **mỗi phương án đều xếp phần rẻ-nhất-thấy-rõ-nhất xuống sau phần đắt nhất của chính nó.**

Nên bản này lấy **mô hình dữ liệu của DA & XƯƠNG** (tập đỉnh có trọng số xương — vì đó là thứ duy nhất chữa được thân chết + chân không gối + hở khớp) làm xương sống cho tầng HÌNH, lấy **trình biên dịch nhịp cấp chương của NHỊP** làm xương sống cho tầng ĐỘNG, mượn **kỷ luật topology offline + cổng máy** của KEYFORM, mượn **silhouette đặc / nét 3 bậc / chi thon / bóng tiếp đất / LOD theo cỡ cảnh** của VẼ DÀY — và **đảo ngược thứ tự thi công của cả bốn.**

Ba con số quyết định mọi thứ khác:

| Đo được | Ý nghĩa |
|---|---|
| ~17–70 ms/frame tuỳ comp; 19000 frame ≈ 8–25 phút | **Hiệu năng không phải ràng buộc.** Đừng tối ưu. Đừng cắt chi tiết vì sợ chậm. |
| LBS 1200 đỉnh = 0,012 ms/frame; vẽ gấp 4 lần cả nhân vật = +1,8 % | Toán biến dạng là nhiễu làm tròn. Cổ chai là screenshot + IPC của Chromium. |
| `--scale=0.25` (1/16 pixel) chỉ nhanh 9 % | ~72 % chi phí frame là overhead cố định. Path nhiều hơn gần như miễn phí. |

**Hệ quả kỷ luật:** không có một lý do hiệu năng nào để hoãn bất cứ thứ gì trong tài liệu này. Nếu ai đó viện cớ "sợ chậm" để cắt, bác bỏ.

---

## 1. PHẦN 0 — BA QUYẾT ĐỊNH PHẢI KÝ TRƯỚC KHI GÕ DÒNG CODE ĐẦU TIÊN

Đây không phải rủi ro. Đây là ba mốc công việc, tổng **1 ngày**, ghi vào `docs/thiet-ke-v3.md`, có chữ ký người duyệt. Không ký thì mọi ngày công sau là đặt cược mù.

### 0.1 Chốt head-count

Đo thật trong `src/v2/rig/hinh.ts`: `CHINH.cao = 2.6` DAU (vùng chibi) nhưng `canhTay 0.5 + cangTay 0.45 = 0,95` DAU trong khi cả chân chỉ `0,7` DAU. **Tay dài hơn chân.** Mắt người đọc ra "sai giải phẫu", không đọc ra phong cách nào.

Hai lựa chọn, chọn một, không được trộn:

- **(A) Chibi 2,6–3 đầu** — giữ `CHINH.cao`, chibi hoá chi: tay ngắn lại còn ≤0,62 DAU, chân dài ra ≥0,85 DAU, bàn tay to 0,19 DAU. Rẻ (0,5 ngày), không đụng 14 board đang có.
- **(B) Anime 6,5–7 đầu** — dựng lại toàn bộ `CHINH`/`PHU`, mọi `co`, `y`, `chanY`, offset prop, khung camera của **14 dự án** trong `src/projects/`. Đắt (4–6 ngày + hồi quy).

**Khuyến nghị: (A).** Người dùng nói "như một bộ anime" là nói về CHUYỂN ĐỘNG và độ trau chuốt, không phải head-count. (B) đốt 1/5 ngân sách để đổi một thứ chưa ai chứng minh là nguyên nhân bị chê.

### 0.2 Chốt chuẩn chuyển động

`src/v2/rig/tu-the.ts:11-12` ghi thẳng trong code: *"Tham chiếu KHÔNG nội suy giữa tư thế (79 % snap 1 frame)"* — đó là chuẩn Jaiden, và `first-date.mp4` **đã được người dùng duyệt** theo chuẩn đó. Tầng nhịp mới đi theo ngữ pháp anime (đón đà, quá đà, trễ pha) là chuẩn NGƯỢC LẠI.

**Chốt: chuẩn lai có luật, không phải trộn bừa.**
- Giữ SNAP cho **đổi cỡ cảnh / đổi shot / punchline**. Cắt là cắt, không đón đà qua cú cắt (và về mặt cơ học cũng không làm được — xem §5.4).
- Dùng ĐÓN ĐÀ + TRỄ PHA cho **mọi chuyển tư thế TRONG một shot**. Đây là chỗ hiện đang "lì" nhất.
- Biên độ bắt đầu ở **đáy dải** (đón −12 %, quá +4 %), chỉ nới sau khi A/B thắng. Rig tối giản mà mở hết biên độ ngay sẽ ra "lắc lư kiểu Flash".

### 0.3 Chốt bản sắc nét & tô

`docs/nghien-cuu-storytime.md §9.2` có biên bản: bản cũ **đã từng** có 19 màu + tông tối cel + mắt nhiều lớp + highlight, và bị kết luận là *"vector clipart 3D"*, *"8/8 nhân vật đọc thành đeo kính"*, rồi đập đi. §4.2 đo: trắng 84,1 % pixel.

**Chốt: line-art có khối, KHÔNG phải cel-shading.**

| LÀM | KHÔNG LÀM (đã rơi hố một lần) |
|---|---|
| Silhouette đặc 3 bậc sắc độ (nền L97 > da L78–84 > áo L62–72 > tóc/quần L18–48), mọi cặp kề ΔL ≥ 12 | Mảng tối theo hướng đèn (`anh_sang`) — **CẮT** |
| Nét 3 bậc: ngoài 1.0N, trong 0.55N, tiếp đất 1.4N | Highlight tóc / má / tròng phản chiếu — **CẮT** |
| Nét thon (path kín hai mép) thay `stroke` dày đều | Mắt 5 lớp — **CẮT**, giữ hạt đậu đen đặc + 1 chấm sáng lệch tâm |
| Bóng tiếp đất (ellipse, **không blur**) | Bất kỳ SVG filter nào — **CẤM TUYỆT ĐỐI, có cổng grep** |
| Lông mày 2 tham số liên tục, luôn vẽ | |
| Nếp áo sinh từ góc khớp (≤3 nét, chỉ khi `dau ≥ 330`) | |

---

## 2. KIẾN TRÚC ĐÍCH

Bảy tầng, dữ liệu chảy một chiều, **mọi tầng là hàm thuần của (frame, board)**.

```
board JSON  ──►  T0 BỘ SINH BOARD        pipeline/dung-board.mjs
   (máy sinh)        chọn tư thế theo NGỮ NGHĨA câu + sổ chống lặp
                     (thay boc(DANG_NOI, i*13+j*5) — xem §5.1)
                         │
                         ▼
                 T1 BIÊN DỊCH NHỊP       src/v3/dao-dien/*
                     chạy MỘT LẦN / chương, ở module scope
                     (đặt trong dungPhim() của phim-v2.tsx — xem §5.3)
                     verb+cường độ → bảng nhịp 2 mặt phẳng:
                       số   : Float32Array[frame × truong]
                       enum : Int16Array   + từ điển chuỗi   ← xem §5.2
                     + track camera + track fx (smear/hit-stop)
                         │
                         ▼
                 T2 BỘ XƯƠNG              src/v3/xuong/*
                     hông → cột sống(2) → ngực → cổ → đầu
                     đùi → cẳng → BÀN CHÂN   (CÓ GỐI, CÓ CỔ CHÂN)
                     cánh → cẳng tay → bàn tay
                     giaiXuong(tuThe) → Record<ten, Mat2x3>
                     ik2Xuong(goc, dich, d1, d2)  ← công thức đóng
                         │
                         ▼
                 T3 DA (skinning)         src/v3/da/*
                     vỏ ~90–140 đỉnh, mỗi đỉnh ≤2 xương, weight
                     sinh tự động theo khoảng cách tới đoạn xương
                     p = Σ wᵢ·Mᵢ·p_bind   + corrective shape
                     ── KHÔNG CÓ FFD 5×5. Đã cắt. Xem §5.7 ──
                         │
                         ▼
                 T4 BÚT                   src/v3/but/*
                     polyline + profile dày → path KÍN hai mép
                     mỗi ĐOẠN chi là 1 path kín riêng + 1 đĩa tròn
                     ở khớp, cùng màu, vẽ chồng   ← xem §5.5
                         │
                         ▼
                 T5 SƠN + CHI TIẾT        src/v3/son.ts, chi-tiet.ts
                     3 bậc sắc độ, nếp áo, xương đòn, hõm cổ, bóng tiếp đất
                         │
                         ▼
                 T6 LOD                   src/v3/lod.ts
                     theo CO_CANH CỦA SHOT, không theo px  ← xem §5.6
                         │
                         ▼
                 T7 PAINTER               src/v3/nhan-vat-v3.tsx
                     xếp lớp, không chứa hình học
                     cụm mắt/miệng = KINEMATIC OUTPUT (§4, luật 1)
```

**Vì sao skinning chứ không phải ngân hàng keyform rời:** phương án KEYFORM (6.75) chết ở hai chỗ mà skinning miễn nhiễm. (a) Mỗi bộ phận một khung neo độc lập + mỗi kênh một `u` trễ pha ⇒ khi thân ở `u=0.55` còn tay ở `u=0.35`, neo vai không còn trùng ⇒ **hở vai, tay rời khỏi thân**. Với một bộ xương duy nhất và vỏ bám xương thì lỗi này không tồn tại về mặt cấu trúc. (b) `TuThe` có 9 hệ số toàn thân tự do (`cui`, `hongHa`, `hongLech`, `xoayCa`, `bay`, `chanNgan`, `vaiNang`, `coRut`, `doi`) chồng lên **bất kỳ** tư thế nào — trong mô hình keyform chúng nổ tổ hợp; trong skinning chúng chỉ là ma trận xương, miễn phí.

---

## 3. THỨ TỰ THI CÔNG

Nguyên tắc: **mỗi mốc phải nghiệm thu được bằng mắt trong một lần render ngắn.** Không mốc nào dài quá 5 ngày. Mốc nào trượt thì dừng, không đi tiếp.

### M0 — CLIP 2 PHÚT (2,5 ngày) ◄ BẮT BUỘC LÀM ĐẦU TIÊN

Mục tiêu: **trong 2,5 ngày, người dùng bật một video 2 phút lên và thấy khác ngay.** Không đụng rig, không đụng kiến trúc, tất cả sau cờ `nhipV2` bật/tắt được.

Năm việc, theo đúng thứ tự đòn bẩy:

| # | Việc | File | Ngày |
|---|---|---|---|
| 1 | **Trễ pha theo khớp + timing chart rời rạc + anticipation/overshoot.** Bỏ `u` chung. `góc(f) = chart(f − trễ[khớp])`, `trễ = {hông:0, thân:1, vai:1, đầu:2, cánh:1, cẳng:2, bàn:3, tóc:4}`. Chart là MẢNG rời rạc: slow-in `[0,.55,.8,.93,1]`, slow-out `[0,.07,.2,.45,1]`. Đón đà 3 frame biên −12 %, quá đà 2 frame +4 %, settle 2 chặng giảm nửa. `CHUYEN_FRAME` từ hằng 5 → hàm của cường độ (nhẹ 10 / vừa 16 / mạnh 15). | `src/v2/act/ap-dung.ts:123,269-271`<br>`src/v2/rig/tu-the.ts:202` | 1,0 |
| 2 | **Chọn tư thế theo ngữ nghĩa + sổ chống lặp.** Thay `boc(DANG_NOI, i*13+j*5)` ở `dung-board.mjs:349,364,365,374,377,378`. Phân loại câu (nhấn mạnh / liệt kê / phủ định / hỏi / kể) → nhóm tư thế; sổ toàn chương cấm lặp trong cửa sổ 5 shot; hết nhóm thì đổi `flip`/tay dẫn. **Đây là nguồn THẬT của lời chê "lặp đi lặp lại"** — đo được: `cuc-tay-37` có 368 shot / 640 diễn viên nhưng chỉ **25 tư thế**, `dung` 166 lần, `nhunVai` 161. | `pipeline/dung-board.mjs:90,91,349…` | 0,5 |
| 3 | **Bật lông mày.** `src/v2/rig/mat.tsx:233` đang `may = 'khong'` — kênh biểu cảm mạnh nhất đang TẮT. Đổi `TrangThaiMay` từ enum 4 giá trị sang 2 số liên tục `(mayCao, mayGocTrong) ∈ [−1,1]`, mí bám mày `miMo = clamp(0.5 + 0.35·mayCao, 0, 1)`. | `src/v2/rig/mat.tsx` | 0,5 |
| 4 | **Bóng tiếp đất + bịt lỗ silhouette.** `rx = 0.30·DAU·(1−0.5·bay)`, `ry = 0.055·DAU`, `opacity = 0.18−0.10·bay`, **không blur**. Và tô đặc 5 chỗ còn dùng `NEN` (`hinh.ts:14` `#fdfdfd`): sọ, bàn chân, cổ (`<rect fill=NEN>`), tai, lòng bàn tay. **Lưu ý:** `kieu.ts` đã có `mauAo`/`mauQuan` cho hầu hết nhân vật rồi — đừng tin lời "silhouette rỗng hoàn toàn", chỉ 5 chỗ trên là thật. | `src/v2/rig/hinh.ts`, `nhan-vat.tsx:113,388`, `thu.tsx`, `tay.tsx` | 0,5 |
| 5 | **Camera tối thiểu.** Đo: **4/14 dự án có ĐÚNG 0 shot khai zoom**, `cuc-tay-37` chỉ 103/368. Luật: shot ≥60 frame → một sự kiện máy, luân phiên `{T.U. 1.00→1.06, PAN 2.5 % / 12 frame, đứng yên}` theo sổ chống lặp cửa sổ 3. **Không** áp luật cho shot <60 frame — shot trung vị chỉ 34–40 frame, áp tràn là đẻ ra 78 cú đẩy máy giống hệt nhau, tức dựng lại chính sự lặp vừa xoá. | `src/v2/phim/san-khau.tsx` (khối zoom), `src/v2/act/camera.ts` | (gộp) |

**NGHIỆM THU M0:** render 2 phút của `hen-ho-dau` (board máy sinh dày: 120 shot, 422 mốc act — **không dùng `first-date`**, nó là board dễ đã được duyệt, không đại diện cho cái pipeline nhả ra hằng ngày), bật `nhipV2` on/off, chiếu cạnh nhau. Render ~3600 frame ≈ 3–5 phút wall.

**LUẬT DỪNG:** nếu người dùng xem A/B mà vẫn nói "lặp đi lặp lại" hoặc "lì" → nguyên nhân KHÔNG nằm ở tầng nhịp, dừng, đi thẳng M2. Nếu nói "khá hơn nhưng nhân vật vẫn xấu" → đúng dự kiến, đi tiếp. Nếu nói "khá hẳn" → M1.

---

### M1 — TẦNG ĐẠO DIỄN ĐẦY ĐỦ (5 ngày)

Nâng M0 thành trình biên dịch thật. Lý do phải làm: đón đà/trễ pha cần biết LÂN CẬN frame; smear/hit-stop cần biết VẬN TỐC; sổ chống lặp cần bối cảnh LIÊN SHOT. `trangThaiTai()` hiện chỉ nhìn một frame nên cả ba đều bất khả.

- `src/v3/dao-dien/doc-vi.ts` — phân loại shot `mo|dung|day|chot|lang`; **peak-picking trên `voice.nhan[]`**. Cảnh báo: `nhan` là mảng 0..1 TỪNG FRAME (`analyze-voice.mjs:104`), không phải danh sách mốc — đo `mo-bai/first-date` thấy 126/357 frame có `nhan > 0.5`, tức 35 % số frame. Phải tự viết peak-picking + refractory 0,4 s, nếu không thì "mọi frame đều là điểm nhấn" = không có điểm nhấn nào.
- `src/v3/dao-dien/cu-dieu.ts` — **KHÔNG viết mới 24 verb.** `src/v2/act/mau.ts` là 407 dòng / 21 mẫu đã bung sẵn ra `MocAct` theo frame và **đang được dùng 163 lần ở `cuc-tay-37`, 66 lần ở `hen-ho-dau`**. `cu-dieu.ts` chỉ là lớp bọc VỎ NHỊP quanh MAU (chart + cường độ + trễ pha), không thay MAU. Cả bốn phương án gốc đều quên file này; đừng lặp lại.
- `src/v3/dao-dien/bien-dich.ts` + `bang-nhip.ts` — hai mặt phẳng, xem §5.2.
- `src/v3/dao-dien/so-dien.ts` — sổ chống lặp cấp chương, có quyền **đổi thẳng tư thế** tra từ 43 preset `TU_THE`, không chỉ đổi flip/lực.
- `src/v3/dao-dien/hieu-ung.ts` — smear multiples khi `|Δgóc|/frame > 45°` (vẽ lại cả `NhanVat` 2–3 lần với opacity .3/.5/1.0, đúng 1 frame; đo được +1,8 % nên cứ vẽ cả người, **đừng** hứa "chỉ vẽ lại chi" vì `veTay` là closure trong `nhan-vat.tsx`, bóc ra là mổ rig). Hit-stop = đóng băng chỉ số bảng 3–5 frame. **Impact frame đảo màu: ≤3 lần/chương, có cổng đếm.**

**NGHIỆM THU M1:** render 2 phút `cuc-tay-37` (board nặng nhất), đo bằng `pipeline/cham-nhip.mjs` (viết ở M0 việc 1): % frame giữ hình theo **BẢNG TƯ THẾ** (không theo pixel — xem §5.8), số verb lặp trong 5 shot, % shot >4 s không có sự kiện máy.

---

### M2 — HÌNH: NÉT & KHỐI (4 ngày)

Vẫn chưa đụng xương. Chỉ đổi ĐƠN VỊ VẼ.

- `src/v3/but/net.ts` — nét thon: mỗi ĐOẠN chi = một path kín hình thang bo tròn + một đĩa tròn bán kính = nửa bề dày tại khớp, cùng màu, vẽ chồng. **Không cần thư viện boolean** (repo chỉ có remotion + react, đừng thêm paper.js/clipper). Xem §5.5 — đây là cách né bowtie mà cả VẼ DÀY lẫn giám khảo đều chưa chốt.
- Chi hình nón: tay `vai 0.115 → khuỷu 0.098 → cổ tay 0.062`, phồng bắp +0,012 tại t=0.35; chân `hông 0.150 → gối 0.118 → cổ chân 0.072`, phồng +0,016 tại t=0.62. Xoá hack `Ong` = "stroke đen dày + stroke trắng mỏng đè lên" (`nhan-vat.tsx:113`).
- Nét 3 bậc từ `net()` hiện có → `NET = {ngoai: 1.0N, trong: 0.55N, tiepDat: 1.4N}`, `N = max(4.5, 0.015·dau)`.
- Nếp áo: `soNep = clamp(round(|góc gập|/28°), 0, 3)` tại nách/khuỷu/bẹn/gối, dài 0,09 DAU, nét "trong", chỉ khi `dau ≥ 330`.
- Bàn tay 5 ngón × 2 đốt, 10 preset (hiện là ellipse + 3–4 `<line>` thẳng).
- LOD theo **CO_CANH của shot** (§5.6).
- **Kèm theo, không được quên:** `src/v2/rig/thu.tsx` (355 dòng, 6–7 nhân vật thú dùng chung rig, có `mauLong`/mõm/đuôi) và `src/v2/rig/do-cam.tsx` (265 dòng, prop neo vào cổ tay — viết lại bàn tay là prop lệch). Cả bốn phương án gốc đều bỏ sót hai file này. **Tính 1 ngày riêng.**

**NGHIỆM THU M2:** comp `ModelSheet` (15 nhân vật × 4 góc × 5 cỡ `dau`) + render lại 2 phút `hen-ho-dau`. Bắt buộc soi cả hai — model sheet tĩnh **luôn** đẹp hơn phim.

---

### M3 — XƯƠNG + GỐI + DA (7 ngày) ◄ mốc đắt nhất, chỉ mở sau khi M0–M2 được gật

- `src/v3/xuong/bo-xuong.ts`, `giai.ts`, `ik.ts` — cây khớp, nhân ma trận, IK 2 xương công thức đóng. **Gối + cổ chân là payoff rõ nhất của cả mốc**: hiện `chanGoc` (`nhan-vat.tsx:366-373`) trả đúng 2 điểm, chân là MỘT đoạn thẳng, bàn chân ellipse luôn nằm ngang, "ngồi" làm bằng `chanNgan` rút ngắn chân. Mắt người bắt ngay.
- `src/v3/da/vo.ts` + `trong-so.ts` — vỏ ~120 đỉnh thân, ~40/chi. Weight theo khoảng cách tới đoạn xương, hàm rơi mượt, **giữ tối đa 2 xương/đỉnh**, chuẩn hoá.
- `src/v3/da/skin.ts` — LBS + corrective shape (`p = p_skin + Σ kⱼ(góc)·Δⱼ`, Δ sinh bằng công thức: phồng bắp theo sin góc gập, bẹt nách, nếp eo khi vặn).
- Thay `thanDiem` (`nhan-vat.tsx:388` — đúng 10 điểm HẰNG, silhouette không bao giờ đổi).
- **Viết lại tầng nhiễu vẽ tay TRƯỚC khi nâng đỉnh.** Xem §5.9 — đây là cái bẫy "demo đầu tiên xấu hơn bản cũ".
- `src/v3/dev/xuong-test.tsx` — inspector đỉnh/trọng số. **Bắt buộc, 1 ngày.** Chỉnh weight mù bằng cách render rồi nhìn là cách chắc chắn nhất để trượt tiến độ.

**NGHIỆM THU M3:** ba shot dựng tay — ngồi ghế, đi 2 bước, vặn mình chỉ tay — render 10 s mỗi cái, đặt cạnh bản cũ. Cộng cổng silhouette (§6).

---

### M4 — MẶT (3 ngày)

- Micro-yaw liên tục **±10° quanh mỗi nấc** của `goc` hiện có, bằng phép chiếu cầu: `x_mặt = R·sin(yaw)`, nén ngang `cos(yaw)`. Giữ nguyên 4 nấc rời rạc `truoc/ba-phan-tu/nghieng/sau` làm khung.
- Biểu cảm có LỊCH: mắt/mày đổi mỗi 15–56 frame, luôn trùng frame đổi tư thế hoặc mốc `nhan`; chèn 1 frame `khe` khi đổi giữa hai trạng thái xa nhau (trạng thái `'khe'` **đã tồn tại** ở `mat.tsx:21`, chỉ thiếu lịch gọi). Chớp = 3 frame `khe→nham→khe`, một cú chớp đặt 1 frame TRƯỚC mỗi lần đổi tư thế lớn.
- `khoeMieng ∈ [−1,1]` nhân vào path miệng, **giữ nguyên chuỗi viseme rhubarb**.

**KHÔNG LÀM:** yaw liên tục toàn dải. Xem §5.10.

---

### M5 — BAKE THỨ CẤP (2 ngày, hoãn được)

Follow-through tóc/tà áo. **Thứ tự ưu tiên:**
1. Trước hết thử nghiệm giải tích: `A·e^(−ζωt)·sin(ωt+φ)` tính lại từ mốc đổi tư thế gần nhất. Thuần, không state, không file. **Đủ cho 90 % trường hợp.**
2. Chỉ khi (1) không đủ mới bake — và bake **VÔ HƯỚNG**, không bake điểm. Xem §5.11.

---

### HOÃN VÔ THỜI HẠN (ghi rõ để không ai lén làm)

| Hạng mục | Lý do cắt |
|---|---|
| Đầu yaw/pitch liên tục toàn dải qua keyform blend | Thuật toán "tự sinh 4 keyform góc từ front + profile" **không tồn tại**. Nó là hand-wave đội lốt chắc chắn. Ước lượng 4 ngày thực tế 8–12 ngày. Và không ai chê video vì đầu nhảy 4 nấc. |
| Lưới FFD 5×5 trên sọ/ngực/bụng | LBS + corrective đã đủ cho thở, squash&stretch cục bộ, uốn chi. FFD chỉ nhân ba bề mặt gỡ lỗi mà không có công cụ authoring. |
| Ngân hàng keyform rời + path morphing giữa tư thế | Hở vai khi các kênh khác `u`; N² cặp morph chưa ai duyệt; `≥4` nguyên mẫu (`khungTiLe` lun/chuan/cao × chính/phụ) → ~500 keyform cần mắt người duyệt. |
| Mảng tối / cel-shading / mắt 5 lớp / highlight | Đã rơi hố một lần, có biên bản `docs/nghien-cuu-storytime.md §9.2`. |
| Ngón tay rig tự do từng đốt | Tổ hợp nổ, board máy sinh không tả nổi. Giữ thư viện 10 preset. |
| WebGL / Canvas mesh warp / flubber runtime | Đòi texture hoặc hoạ sĩ, vi phạm ràng buộc 2; flubber runtime phá determinism. |

---

## 4. TÁM LUẬT KIẾN TRÚC BẤT DI BẤT DỊCH

Viết vào `docs/thiet-ke-v3.md`, review PR nào vi phạm thì bác.

1. **KINEMATIC OUTPUT cho cụm mặt.** Cụm mắt/miệng chỉ nhận MA TRẬN của xương đầu, **tuyệt đối không đi qua hàm biến dạng của sọ**. Đây là điều kiện sống còn để lip-sync không bị méo (ràng buộc 3). May mắn: miệng hiện chỉ là prop render tại `(cx, soY)` trong `<Dau>` (`nhan-vat.tsx:294`) nên chỉ vài dòng. Phải có test ảnh trước/sau khi merge.
2. **Xoay LUÔN là ma trận, KHÔNG BAO GIỜ lerp toạ độ đỉnh.** Lerp đỉnh khi xoay làm mọi đỉnh đi tắt qua dây cung ⇒ hình co lại giữa chừng. Mọi biến đổi tách thành `(xoay/tỉ lệ = ma trận) × (biến dạng = offset đỉnh)`.
3. **Mọi thứ phụ thuộc bind-pose nằm ở MODULE SCOPE**, và là `Map` keyed theo `(khung, tiLe, kieuId)` — **không phải một hằng đơn**. Không tồn tại MỘT bind pose: `khungTiLe(K, 'lun'|'chuan'|'cao')` (`hinh.ts:190`) đổi mốc dọc, `kieu.khung === 'phu'` nhân 0,82, `dv.co` nhân tiếp. `useMemo([])` **vô dụng** — Remotion không giữ cây React giữa frame.
4. **CẤM MỌI SVG FILTER.** `feGaussianBlur`, `feDropShadow`, `backdrop-filter`, `filter:` trong CSS. Một blur phủ nhân vật ở 1080p là 10–20×. Repo hiện sạch; có cổng grep chặn (§6).
5. **`warpPath` CHỈ cho path `d` cứng của prop/tóc thư viện, không cho nhân vật.** Đo thật: 0,27–1,14 ms/call và chuỗi `d` phình **13,8×** (2.766 → 38.163 ký tự). Có test đếm số lần gọi mỗi frame. Và phải khai `@remotion/paths@4.0.395` tường minh trong `package.json` — hiện nó chỉ là dep bắc cầu của `@remotion/cli`.
6. **Determinism:** cấm `Math.random`, `Date.now`, `performance.now`, state tích luỹ qua `useRef`/`useState` giữa frame, `useFrame` của R3F, CSS animation theo đồng hồ. Dùng `useCurrentFrame`, `interpolate`, `Easing`, và `ngauNhien(seed)` xorshift + `bam()` FNV-1a **đã có sẵn** trong `hinh.ts`. Repo hiện sạch (`grep Math.random|Date.now` trên `src/v2` rỗng) — giữ nguyên.
7. **Serialize path tiết kiệm:** toạ độ **1 chữ số thập phân**, không `toFixed(2)` (đo được 0,63 ms/frame cho 1200 đỉnh — khoản đắt nhất trong ba khoản mesh thêm vào). Số đỉnh theo **chu vi TRÊN MÀN HÌNH** (~1 đỉnh / 4–6 px), không theo giải phẫu.
8. **Enum thì SNAP, không lerp.** Mọi trường chuỗi (`ban: KieuTay`, `mat`, `may`, `mieng`, `goc`, `cam`, `sauThan`, `quayLung`) đi ở mặt phẳng riêng và đổi bằng snap. Xem §5.2.

---

## 5. BÃI MÌN ĐÃ BIẾT — 11 CHỖ MỌI PHƯƠNG ÁN ĐỀU BƯỚC HỤT

Đây là phần giá trị nhất của tài liệu. Đọc kỹ.

### 5.1 "Lặp đi lặp lại" nằm ở bộ sinh board, không ở renderer
Ba phương án đi giết `CU_CHI_NOI[hash % 10]` (`san-khau.tsx:32,133`). Nhánh đó **gần như không chạy**: điều kiện là `!dang && tuDong && !(dv.act?.length)`, mà board máy sinh khai `dang` ở mọi diễn viên và mọi mốc. Nguồn thật là `pipeline/dung-board.mjs:349,364,365,374,377,378` — `boc(DANG_NOI, i*13+j*5)`, bốc trong 11 tên (`DANG_NOI`) và 9 tên (`DANG_PU`) bằng hash chỉ số. Sửa ở đây thì mọi board đều đổi; sửa ở `san-khau.tsx` thì 0 board đổi. **Đã đưa vào M0 việc 2.**

### 5.2 Bảng nhịp phải có HAI mặt phẳng
`Float32Array` không chứa được `ban: KieuTay`, `mat`, `may`, `mieng`, `goc`, `cam`, `sauThan: ('trai'|'phai')[]`, `quayLung: boolean`, `nghieng: Partial<TuThe>`. Quá nửa `TrangThaiVe` là enum chuỗi. Cấu trúc đúng:
```ts
type BangNhip = {
  so:   Float32Array;   // [frame * SO_TRUONG_SO   + i]  — lerp được
  enum: Int16Array;     // [frame * SO_TRUONG_ENUM + i]  — index vào từ điển, SNAP
  tuDien: string[][];   // từ điển chuỗi theo cột
  fx:   Uint8Array;     // cờ smear / impact / hit-stop
};
```
Không phương án nào cấp ngày công cho việc này. **Tính 0,5 ngày trong M1.**

### 5.3 `trangThaiTai(act, goc, t, mach)` KHÔNG giữ nguyên chữ ký được
Bốn tham số đó không mang `chuongId`, không mang `shotIdx`, và `t` là **giây tương đối trong shot** (`san-khau.tsx`: `const t = frame / FPS`; `frameChuong` là prop riêng), còn `mach` là `k*3` chứ không phải danh tính diễn viên. Tra một bảng **cấp chương** bằng bộ tham số đó là bất khả. Ai làm đúng theo văn bản gốc sẽ bị ép cache theo shot ⇒ mất sổ chống lặp liên shot ⇒ mất chính lý do tồn tại của tầng biên dịch.

**Giải:** đổi chữ ký, và tính công sửa `src/v2/phim/san-khau.tsx` + `src/v2/phim/phim-v2.tsx` + `src/v2/phim/du-lieu.ts` (**+1 ngày**, không phương án nào có).

**Tin tốt:** chỗ đặt biên dịch đã sẵn — `taoPhim()`/`dungPhim()` được gọi ở **module scope** trong `src/projects/du-an.generated.ts`, chạy một lần lúc nạp bundle, ngoài vòng render. Biên dịch ở đó rồi truyền prop xuống ⇒ **không cần hash + LRU + Map module-scope, và ba rủi ro determinism mà NHỊP tự lo đều biến mất.**

### 5.4 Anticipation qua cú cắt là BẤT KHẢ
`phim-v2.tsx` bọc mỗi shot trong `<Sequence from={s.from} durationInFrames={s.len}>`; `SanKhau` **không tồn tại** trước frame đầu shot. Cử điệu bắt đầu ngay đầu shot (trường hợp phổ biến nhất) không có chỗ đặt 3–4 frame đón đà. Biên dịch cấp chương không cứu được — cái chặn là ranh giới mount của React.

**Giải:** cú vào đầu shot dùng **"lean-in key"** — 1 frame duy nhất ở tư thế nghiêng về phía trước ~1,3×, đúng ngữ pháp đã đo ở tham chiếu, thay cho đón đà. Đón đà chỉ dùng cho chuyển tư thế **trong** shot.

### 5.5 Nét thon tự cắt thành nơ (bowtie)
Offset một polyline gập ở khớp: biên NGOÀI không tự cắt nếu chèn cung tròn ở khớp, nhưng biên TRONG **chắc chắn** tự cắt khi góc gắt. Dữ liệu thật đầy góc như vậy: `khoanhTay T(30,-95)`, `omDau T(150,200)`, `chongCam T(40,-150)`, `epNguc T(25,-120)`, `cheMieng T(35,-140)` — góc trong ~35–50°, bề dày 0,098–0,115 DAU. Repo không có thư viện boolean và **đừng thêm**.

**Giải (không cần boolean):** vẽ **mỗi đoạn chi là một path kín độc lập** (hình thang bo tròn, dày gốc → mảnh ngọn) + **một đĩa tròn bán kính = nửa bề dày tại mỗi khớp**, cùng màu fill, vẽ chồng lên nhau. Hợp của các hình lồi trông y hệt một chi liền mạch, không bao giờ có nơ, không cần union. Viền ngoài vẽ bằng một lớp path cùng hình học nở ra `N` px ở dưới. Chi phí: ~3 path/chi thay vì 1, tức ~12 path/nhân vật — không đáng kể (§0).

### 5.6 LOD theo px VỠ vì `co`
`dau` thật = `CO_CANH.dau × dien.co × KIEU.co`. Đo: **180/1424 diễn viên** khai `co` 0,8–0,95, `kieu.ts` nhân tiếp 0,85–1,1. `can 560 × 0,85 = 476` → tụt xuống bậc 330: mất lông mày, mất 5 ngón, trong khi người đứng cạnh ở 560 có đủ. **Hai mức vẽ trong cùng một khung.**

**Giải:** LOD chốt theo **`CO_CANH` của shot** (`nho 110 / rong 200 / trung 330 / can 560 / sat 900` — đã khai trong `src/v2/board/kieu-board.ts`), không theo px từng người. `co` chỉ ảnh hưởng kích thước vẽ, không ảnh hưởng bậc chi tiết.

### 5.7 Mảng tối lật ngược vì `flip`
Đếm thật: **435 lần `flip: true`** trong 14 board. `flip` cài bằng `translate(x) scale(-1 1)` bọc CẢ nhóm (`nhan-vat.tsx:471`, `san-khau.tsx:161`). Mảng tối vẽ bên trong nhóm bị lật theo ⇒ hai người quay mặt vào nhau trong cùng shot được chiếu sáng từ hai phía đối nghịch. Cộng thêm `than`, `dau`, `xoayCa` là 3 lớp `rotate` nữa.

**Giải: CẮT mảng tối hẳn** (đã quyết ở §0.3 vì lý do bản sắc). Rủi ro này biến mất cùng lúc. Nếu về sau ai muốn làm lại, điều kiện là truyền `denCucBo` đã khử flip + 3 lớp rotate xuống từng bộ phận — và phải thread qua `Dau`/`Mat`/`Toc`/`Thu`, tính công riêng.

### 5.8 Cổng "held cel" đo trên pixel là VÔ NGHĨA
`pipeline/cham-diem.mjs` có **hai cổng mâu thuẫn nhau**: dòng 221 bắt `hold ≤ 40%`, dòng 247 bắt `hold 60–85%`. Cả hai đo chênh lệch pixel ở 64×36 — độ phân giải mù với chuyển động chậm. Và ba thứ trong thiết kế mới làm **mọi** frame đổi pixel: moving hold nhiễu từng frame, lip-sync đổi miệng mỗi 2–3 frame, camera trôi liên tục.

**Giải:** (a) cổng nhịp mới đo trên **BẢNG TƯ THẾ**, không trên ảnh — "held" = giá trị khớp không đổi quá ngưỡng; (b) **hoà hai cổng pixel hiện có trước khi viết code** — hai rubric ngược nhau trong cùng một file là lỗi cần dọn, không phải ràng buộc cần tuân.

### 5.9 Nhiễu vẽ tay NÁT khi đỉnh từ 10 lên 140
`nhieuDuong(P, bienDo, seed, kin, chia=2)` chia MỖI cạnh thành 2–3 đoạn rồi lệch `±bienDoTayVe ≈ 0.006 DAU`. Với 10 điểm, cạnh dài, nhiễu ra "nét tay". Với 140 đỉnh, cạnh ngắn hơn biên độ nhiễu ⇒ outline thành **răng cưa rung**. Và nó **đổi số điểm** (`chia`), nên không morph được.

**Giải, làm TRƯỚC khi nâng số đỉnh (0,5 ngày, nằm trong M3):** viết lại `nhieuDuong` thành hàm của **độ dài cung** — lấy mẫu nhiễu theo `s` (khoảng cách dọc đường) với bước cố định ~0,04 DAU bất kể số đỉnh, biên độ tuyệt đối ≤0,4 % DAU, **giữ nguyên số điểm**, chỉ áp cho **đường bao ngoài**. Không làm bước này thì demo M3 sẽ **xấu hơn bản hiện tại** và cả dự án mất niềm tin đúng tuần đầu.

### 5.10 Tại sao không làm yaw liên tục
`goc: GocNhin` có 4 giá trị, mỗi giá trị là một nhánh `switch` vẽ tay riêng rải khắp `mat.tsx` / `mieng.tsx` / `toc.tsx` / `mui` / `tai` / `thu.tsx` — thêm góc thứ 5 là sửa O(số file). `mieng.tsx` còn có `lechMieng` và `if (goc==='sau') return null`, tức yaw liên tục buộc phải **sinh hình miệng liên tục theo góc** = viết lại lip-sync path = đụng thẳng ràng buộc 3. Payoff/ngày thấp nhất trong toàn bộ danh sách. **Micro-yaw ±10° quanh mỗi nấc (M4) lấy 80 % cảm giác với 10 % công.**

### 5.11 Bake pose-per-frame ở mức ĐIỂM sẽ giết pipeline
19000 frame × 10 bộ phận × 48 điểm × 2 nhân vật ≈ 18,2 triệu số ≈ **100–300 MB JSON**. Remotion mở 3–4 tab Chrome, MỖI tab parse lại file đó ⇒ vài giây khởi động mỗi tab, RAM vài GB, OOM. Và `render-segments.sh` ghi rõ trong comment rằng render một mạch 5787 frame **đã chết giữa chừng hai lần**.

**Luật cứng cho M5:** chỉ bake **VÔ HƯỚNG** (vài giá trị lò xo tóc/tà áo mỗi frame ≈ `19000 × 6 float = 0,7 MB`), bake **theo từng shot**, nạp bằng `staticFile()` **không import vào bundle**. Giữ `SEG_LEN ≤ 700` trong `render-segments.sh`.

---

## 6. CỔNG TỰ ĐỘNG (nối vào `pipeline/kiem-tra-v2.mjs`)

| Cổng | Đo gì | Chặn khi | Mốc |
|---|---|---|---|
| **Determinism** | Render frame N hai lần ở `--concurrency=1` và `=8`, so hash ảnh | Khác byte | M0 |
| **Cấm filter** | `grep -rE 'feGaussianBlur\\|feDropShadow\\|backdrop-filter\\|filter:' src/` | Có hit | M0 |
| **`warpPath`** | Đếm số lần gọi mỗi frame | Gọi từ trong `src/v3/da/` hoặc `src/v3/nhan-vat-v3.tsx` | M2 |
| **Chống lặp** | Verb/tư thế lặp trong cửa sổ 5 shot | Có lặp | M0 |
| **Nhịp** | % frame giữ hình **trên bảng tư thế**; số lần impact frame/chương | Ngoài dải; impact >3 | M1 |
| **Shot chết** | Shot >4 s không có sự kiện máy VÀ không đổi tư thế | Có | M1 |
| **Sắc độ** | ΔL mọi cặp kề, **đọc cả `shot.nen`** (máy tự chọn màu nền bão hoà + hoạ tiết như `{mau:'#ffd400', hoa_tiet:'toa'}`) | ΔL < 12 | M2 |
| **Silhouette** | Render `ModelSheet`, ép mọi fill/stroke → đen: tỉ lệ diện tích đặc, số vùng rời, khoảng cách bao-tay ↔ bao-thân | Tay dính thân / đầu dính vai | M2 |
| **Tổ hợp kênh** | Bảng cấm (chân `chay` + thân `ngoi`, v.v.) + kiểm `sauThan` khai tường minh | Tổ hợp vô nghĩa / z-order thiếu | M3 |

Hai ghi chú thi công:
- Đọc pixel trong Node: dùng **`pngjs`** (thuần JS), **không dùng `sharp`** (native binding, sẽ đau trên máy khác kiến trúc — repo chỉ có 7 dependency, đừng rước native).
- Ép bôi đen cho cổng silhouette: thread một prop `boiDen` xuyên `NhanVat → Dau → Mat → Mieng → Toc → Thu → DoCam → Tai → CoAo`, hoặc ép mọi fill qua `son.ts`. **Không có đường tắt bằng CSS filter** (vi phạm luật 4). Tính 0,5 ngày.

---

## 7. NGÂN SÁCH THẬT

| Mốc | Khai | Thực tế (×1,7 vì hồi quy + tooling + vòng lặp mỹ thuật) |
|---|---|---|
| P0 Ba quyết định | 1 | 1 |
| **M0 Clip 2 phút** | **2,5** | **3** |
| M1 Tầng đạo diễn (+1 ngày sửa chữ ký §5.3, +0,5 hai mặt phẳng §5.2) | 5 | 8 |
| M2 Hình (+1 ngày `thu.tsx`/`do-cam.tsx`) | 4 | 7 |
| M3 Xương + da (+1 ngày inspector, +0,5 viết lại nhiễu §5.9) | 7 | 12 |
| M4 Mặt | 3 | 5 |
| Hồi quy 14 dự án + 43 preset + `mau.ts` 407 dòng | 0 (mọi phương án đều quên) | 3 |
| M5 Bake (hoãn được) | 2 | 3 |
| **Tổng** | **24,5** | **≈ 42 ngày** |

Đừng tin con số 24,5 của bất kỳ phương án gốc nào. Cả bốn đều lạc quan 1,7–2,5×, và lạc quan có địa chỉ: không ai tính tooling, không ai tính hồi quy, không ai tính `thu.tsx` + `do-cam.tsx`.

**Việc rẻ nhất trong cả dự án, làm ngay hôm nay, 5 phút:** `remotion.config.ts:5` đang `Config.setConcurrency(4)` trên máy 10 core, và `render.sh:21` còn ép cứng `--concurrency=3`. Đo được `concurrency=8` nhanh hơn 17 %. (Lưu ý: ở một comp khác đo được concurrency 6 **chậm hơn** 3 — CPU chỉ đạt 0,81/10 core, có một nút thắt nối tiếp trong đường screenshot/ffmpeg. **Đo trước khi đổi**, và nếu ai có 2 ngày rảnh thì gỡ nút đó đáng giá 2–3× — nhiều hơn tất cả những gì tầng mesh lấy đi.)

---

## 8. NÓI THẲNG: CÁI KHÔNG ĐẠT TỚI ĐƯỢC

Không hứa lảo. Sau 42 ngày, những thứ sau **vẫn không có**:

1. **Không đạt "như một bộ anime" theo nghĩa vẽ tay.** Đây là hệ tham số: đẹp đúng trong vùng tham số đã kiểm, xấu ngoài vùng đó. Kiến trúc này đóng phần lớn khoảng cách về **CHUYỂN ĐỘNG**; nó **không đóng được khoảng cách về NÉT VẼ**. Nếu tiêu chí nghiệm thu là "≥90 % một tác phẩm vẽ tay" thì phải nói ngay bây giờ rằng tiêu chí đó không đạt được bằng con đường này, và cũng không đạt được bằng ba con đường còn lại.

2. **Trần chất lượng nằm ở công thức nặn, không ở máy biến dạng.** Weight và corrective shape sinh bằng thuật toán là "hợp lý theo phong cách", không phải giải phẫu đúng. Ở tư thế cực đoan (nách gập sâu, hông ngồi bệt xoay) LBS sẽ xẹp. Không có hoạ sĩ tô weight thì đây là trần cố hữu, không phải lỗi thi công.

3. **Xoay đầu vẫn 4 nấc + micro-yaw ±10°.** Quay đầu liên tục qua ±45°, hay quay ra sau rồi quay lại trong một cú, vẫn phải **cắt cảnh**.

4. **Không có shading thật.** Không có pháp tuyến bề mặt. Đã cắt cả mảng bóng phẳng vì lý do bản sắc. Đây là trần của vector phẳng.

5. **Không có physics runtime.** Va chạm tóc-vai, vải phủ, dây rơi phải đi đường bake ngoài — và bake phá vòng lặp sửa nhanh (đổi board là phải bake lại).

6. **Không có tương tác hai nhân vật chính xác.** Không IK liên nhân vật, không va chạm. Chạm tay, đưa đồ chỉ căn được thời điểm, không căn được vị trí.

7. **Thứ tự chồng lớp (tay trước/sau thân) vẫn phải KHAI** theo tư thế (`sauThan` đã có) hoặc suy bằng luật. Tư thế nào luật đoán sai thì tay đâm xuyên thân, và cổng silhouette đếm vùng rời **không bắt được** lỗi này (bóng đen vẫn liền một khối) — phải là cổng khai tường minh.

8. **Ngân sách đỉnh có trần ~4–5k đỉnh/frame.** Đủ cho 2–3 nhân vật biến dạng đầy đủ. Đám đông 10 người phải hạ cấp về rig đơn giản.

9. **Kịch bản dở thì video vẫn dở.** Tầng này diễn cái board khai. Board nhạt thì ra video nhạt — chỉ là nhạt một cách chuyên nghiệp hơn.

---

## 9. TÓM TẮT CHO NGƯỜI SẼ GÕ PHÍM

```
Tuần 0  : ký 3 quyết định (head-count = chibi, chuẩn lai có luật, line-art có khối)
Tuần 1  : M0 → render 2 phút hen-ho-dau, A/B, ĐƯA NGƯỜI DÙNG XEM
          ── nếu vẫn "lặp/lì": dừng, nhảy M2. Nếu "khá hẳn": tiếp ──
Tuần 2-3: M1 tầng đạo diễn → render 2 phút cuc-tay-37, đo bằng cham-nhip.mjs
Tuần 4-5: M2 hình (nét thon, chi nón, silhouette, LOD, thu.tsx, do-cam.tsx)
          → ModelSheet + render 2 phút
Tuần 6-8: M3 xương + gối + da → ba shot dựng tay (ngồi / đi / vặn mình)
Tuần 9  : M4 mặt
Tuần 10 : hồi quy 14 dự án, M5 nếu cần
```

Ba câu để dán lên tường:

- **Hiệu năng không phải vấn đề. Đừng tối ưu. Đừng cắt vì sợ chậm.**
- **Mỗi mốc phải xem được bằng mắt trong một lần render ngắn. Mốc nào không xem được thì mốc đó xếp sai.**
- **Thứ user chê to nhất ("lặp đi lặp lại") nằm ở `pipeline/dung-board.mjs:349`, không nằm ở rig. Sửa nó trong tuần đầu.**"
  },
  "workflowProgress": [
    {
      "type": "workflow_phase",
      "index": 1,
      "title": "Khao sat"
    },
    {
      "type": "workflow_phase",
      "index": 2,
      "title": "Thiet ke"
    },
    {
      "type": "workflow_phase",
      "index": 3,
      "title": "Cham"
    },
    {
      "type": "workflow_phase",
      "index": 4,
      "title": "Chot"
    },
    {
      "type": "workflow_agent",
      "index": 1,
      "label": "khao-sat:rig-chuyen-nghiep",
      "phaseIndex": 1,
      "phaseTitle": "Khao sat",
      "agentId": "aaced4b93786c4b44",
      "model": "claude-opus-5[1m]",
      "state": "done",
      "startedAt": 1789639085145,
      "queuedAt": 1789639083289,
      "attempt": 1,
      "lastToolName": "StructuredOutput",
      "lastToolSummary": "Điểm chung của cả năm hệ (Live2D, Spine, Rive, Harmony, Moh…",
      "promptPreview": "BOI CANH DU AN (doc ky truoc khi lam):
- Repo: /Users/leanhvu/video-studio. Remotion 4 + React 19 + SVG, render deterministic tung frame, 30fps, 1920x1080.
- Hien tai nhan vat la "cut-out vector": dau = ellipse ve tay, tay/chan = ong noi theo GOC KHOP (do),
  tu the la mot object so do goc trong src/v2/rig/tu-the.ts. Khong co mesh, khong co warp, khong co ve tay.
- Dau vao la mot file JSON "board"…",
      "promptFramed": false,
      "lastProgressAt": 1789639305817,
      "tokens": 53000,
      "toolCalls": 14,
      "durationMs": 220671,
      "resultPreview": "{"ket_luan":"Điểm chung của cả năm hệ (Live2D, Spine, Rive, Harmony, Moho): hình nhân vật KHÔNG phải là hình cứng nối khớp — nó là một tập ĐỈNH (vertex/control point) mà mọi thứ khác chỉ là hàm biến đổi tập đỉnh đó. Rig hiện tại của video-studio đang dừng ở tầng thấp nhất (transform cứng theo góc khớp), nên thiếu đúng hai tầng làm nên cảm giác \\"sống\\": (1) biến dạng lưới/đường (mesh-FFD, skinning…"
    },
    {
      "type": "workflow_agent",
      "index": 2,
      "label": "khao-sat:ky-thuat-anime",
      "phaseIndex": 1,
      "phaseTitle": "Khao sat",
      "agentId": "a34190ac98ac04a42",
      "model": "claude-opus-5[1m]",
      "state": "done",
      "startedAt": 1789639085238,
      "queuedAt": 1789639083289,
      "attempt": 1,
      "lastToolName": "StructuredOutput",
      "lastToolSummary": "Anime "sống" không nhờ vẽ nhiều hình hơn mà nhờ MODULATION:…",
      "promptPreview": "BOI CANH DU AN (doc ky truoc khi lam):
- Repo: /Users/leanhvu/video-studio. Remotion 4 + React 19 + SVG, render deterministic tung frame, 30fps, 1920x1080.
- Hien tai nhan vat la "cut-out vector": dau = ellipse ve tay, tay/chan = ong noi theo GOC KHOP (do),
  tu the la mot object so do goc trong src/v2/rig/tu-the.ts. Khong co mesh, khong co warp, khong co ve tay.
- Dau vao la mot file JSON "board"…",
      "promptFramed": false,
      "lastProgressAt": 1789639529370,
      "tokens": 78934,
      "toolCalls": 23,
      "durationMs": 442955,
      "resultPreview": "{"ket_luan":"Anime \\"sống\\" không nhờ vẽ nhiều hình hơn mà nhờ MODULATION: trong cùng một cut, nhịp hình đổi 2-3 lần (ones/twos/threes/fours); mọi nguồn đều nhấn \\"framerate là quyết định của animator cho TỪNG chuyển động, không phải hằng số của phim\\". Đây là thứ repo thiếu nhất — hiện chỉ có snap 1 frame + hold dài (đo từ Jaiden, phong cách Mỹ cực tĩnh), nên \\"lì\\" đúng như user chê. Anime cùng …"
    },
    {
      "type": "workflow_agent",
      "index": 3,
      "label": "khao-sat:thiet-ke-nhan-vat",
      "phaseIndex": 1,
      "phaseTitle": "Khao sat",
      "agentId": "a8684afd62628b5f0",
      "model": "claude-opus-5[1m]",
      "state": "done",
      "startedAt": 1789639085237,
      "queuedAt": 1789639083289,
      "attempt": 1,
      "lastToolName": "StructuredOutput",
      "lastToolSummary": "Nhân vật "có hồn" không đến từ số khớp nhiều hơn, mà từ bốn…",
      "promptPreview": "BOI CANH DU AN (doc ky truoc khi lam):
- Repo: /Users/leanhvu/video-studio. Remotion 4 + React 19 + SVG, render deterministic tung frame, 30fps, 1920x1080.
- Hien tai nhan vat la "cut-out vector": dau = ellipse ve tay, tay/chan = ong noi theo GOC KHOP (do),
  tu the la mot object so do goc trong src/v2/rig/tu-the.ts. Khong co mesh, khong co warp, khong co ve tay.
- Dau vao la mot file JSON "board"…",
      "promptFramed": false,
      "lastProgressAt": 1789639330666,
      "tokens": 51223,
      "toolCalls": 13,
      "durationMs": 244250,
      "resultPreview": "{"ket_luan":"Nhân vật \\"có hồn\\" không đến từ số khớp nhiều hơn, mà từ bốn tầng: (1) ngôn ngữ hình khối (tròn/vuông/tam giác) quyết định tính cách và phải đọc được ở dạng bóng đen; (2) tương phản SẮC ĐỘ giữa da/tóc/áo/nền — đây là thứ quyết định \\"đọc được\\" ở mọi cỡ, và là chỗ rig hiện tại sai nặng nhất; (3) mắt + LÔNG MÀY, trong đó lông mày là bộ phận biểu cảm mạnh nhất (nghiên cứu nhận diện cảm…"
    },
    {
      "type": "workflow_agent",
      "index": 4,
      "label": "khao-sat:gioi-han-remotion",
      "phaseIndex": 1,
      "phaseTitle": "Khao sat",
      "agentId": "a27f72e83b6d474c6",
      "model": "claude-opus-5[1m]",
      "state": "done",
      "startedAt": 1789639085161,
      "queuedAt": 1789639083289,
      "attempt": 1,
      "lastToolName": "StructuredOutput",
      "lastToolSummary": "Trần kỹ thuật thật sự KHÔNG nằm ở SVG. Phát hiện quan trọng…",
      "promptPreview": "BOI CANH DU AN (doc ky truoc khi lam):
- Repo: /Users/leanhvu/video-studio. Remotion 4 + React 19 + SVG, render deterministic tung frame, 30fps, 1920x1080.
- Hien tai nhan vat la "cut-out vector": dau = ellipse ve tay, tay/chan = ong noi theo GOC KHOP (do),
  tu the la mot object so do goc trong src/v2/rig/tu-the.ts. Khong co mesh, khong co warp, khong co ve tay.
- Dau vao la mot file JSON "board"…",
      "promptFramed": false,
      "lastProgressAt": 1789639470468,
      "tokens": 66974,
      "toolCalls": 21,
      "durationMs": 384054,
      "resultPreview": "{"ket_luan":"Trần kỹ thuật thật sự KHÔNG nằm ở SVG. Phát hiện quan trọng nhất: warpPath() trong @remotion/paths (Remotion đã có sẵn) chia nhỏ mọi lệnh path rồi remap từng toạ độ qua một hàm JS bất kỳ — đó chính là free-form/lattice deformation trên hình vector, tức \\"mesh warp\\" ở mức hình học, thuần hàm, deterministic tuyệt đối theo frame. Vì nhân vật hiện tại đã là path do code sinh (không phải …"
    },
    {
      "type": "workflow_agent",
      "index": 5,
      "label": "khao-sat:audit-rig-cu",
      "phaseIndex": 1,
      "phaseTitle": "Khao sat",
      "agentId": "a320dbb02cac60572",
      "model": "claude-opus-5[1m]",
      "state": "done",
      "startedAt": 1789639085193,
      "queuedAt": 1789639083289,
      "attempt": 1,
      "lastToolName": "StructuredOutput",
      "lastToolSummary": "AUDIT KẾT LUẬN: rig hiện tại KHÔNG ĐÁNG GIỮ ở tầng biểu diễ…",
      "promptPreview": "BOI CANH DU AN (doc ky truoc khi lam):
- Repo: /Users/leanhvu/video-studio. Remotion 4 + React 19 + SVG, render deterministic tung frame, 30fps, 1920x1080.
- Hien tai nhan vat la "cut-out vector": dau = ellipse ve tay, tay/chan = ong noi theo GOC KHOP (do),
  tu the la mot object so do goc trong src/v2/rig/tu-the.ts. Khong co mesh, khong co warp, khong co ve tay.
- Dau vao la mot file JSON "board"…",
      "promptFramed": false,
      "lastProgressAt": 1789639354180,
      "tokens": 105837,
      "toolCalls": 13,
      "durationMs": 267766,
      "resultPreview": "{"ket_luan":"AUDIT KẾT LUẬN: rig hiện tại KHÔNG ĐÁNG GIỮ ở tầng biểu diễn nhân vật — nên vứt và làm lại, nhưng CHỈ tầng đó. (1) Primitive: nhân vật = 1 path kín thân (Catmull-Rom qua ĐÚNG 10 điểm cố định, không đổi theo tư thế), 1 ellipse sọ vẽ tay, 2 \\"ống\\" tay mỗi bên (path stroke đen dày + stroke trắng mỏng đè lên giả viền), 1 ống chân MỘT ĐOẠN mỗi bên (không có gối), ellipse bàn chân luôn nằm…"
    },
    {
      "type": "workflow_agent",
      "index": 6,
      "label": "thiet-ke:mesh",
      "phaseIndex": 2,
      "phaseTitle": "Thiet ke",
      "agentId": "aeb784929172d8c79",
      "model": "claude-opus-5[1m]",
      "state": "done",
      "startedAt": 1789639540176,
      "queuedAt": 1789639531808,
      "attempt": 1,
      "lastToolName": "StructuredOutput",
      "lastToolSummary": "DA & XƯƠNG (Skin & Bone) — lưới biến dạng chạy trên đỉnh, t…",
      "promptPreview": "BOI CANH DU AN (doc ky truoc khi lam):
- Repo: /Users/leanhvu/video-studio. Remotion 4 + React 19 + SVG, render deterministic tung frame, 30fps, 1920x1080.
- Hien tai nhan vat la "cut-out vector": dau = ellipse ve tay, tay/chan = ong noi theo GOC KHOP (do),
  tu the la mot object so do goc trong src/v2/rig/tu-the.ts. Khong co mesh, khong co warp, khong co ve tay.
- Dau vao la mot file JSON "board"…",
      "promptFramed": false,
      "lastProgressAt": 1789639808643,
      "tokens": 93319,
      "toolCalls": 12,
      "durationMs": 268466,
      "resultPreview": "{"ten":"DA & XƯƠNG (Skin & Bone) — lưới biến dạng chạy trên đỉnh, trước khi thành path SVG","triet_ly":"Đặt cược rằng vì nhân vật ĐÃ là path do code sinh, ta không cần mesh+texture kiểu Live2D — ta chèn một tầng \\"tập đỉnh + trọng số xương + lưới FFD\\" vào GIỮA bước sinh điểm và bước ghép chuỗi `d`, và như vậy có toàn bộ sức mạnh mesh deformation mà vẫn là SVG vector thuần, deterministic, không GP…"
    },
    {
      "type": "workflow_agent",
      "index": 7,
      "label": "thiet-ke:morph",
      "phaseIndex": 2,
      "phaseTitle": "Thiet ke",
      "agentId": "a3edfd5079960a092",
      "model": "claude-opus-5[1m]",
      "state": "done",
      "startedAt": 1789639534303,
      "queuedAt": 1789639531809,
      "attempt": 1,
      "lastToolName": "StructuredOutput",
      "lastToolSummary": "Ngan hang Keyform — nhan vat la tap diem, chuyen dong la mo…",
      "promptPreview": "BOI CANH DU AN (doc ky truoc khi lam):
- Repo: /Users/leanhvu/video-studio. Remotion 4 + React 19 + SVG, render deterministic tung frame, 30fps, 1920x1080.
- Hien tai nhan vat la "cut-out vector": dau = ellipse ve tay, tay/chan = ong noi theo GOC KHOP (do),
  tu the la mot object so do goc trong src/v2/rig/tu-the.ts. Khong co mesh, khong co warp, khong co ve tay.
- Dau vao la mot file JSON "board"…",
      "promptFramed": false,
      "lastProgressAt": 1789640176950,
      "tokens": 107492,
      "toolCalls": 12,
      "durationMs": 642645,
      "resultPreview": "{"ten":"Ngan hang Keyform — nhan vat la tap diem, chuyen dong la morph theo kenh","triet_ly":"Dat cuoc rang don vi du lieu cua nhan vat phai la TAP DIEM co thu tu bat bien (keyform) do mot bo bien dich offline duc ra; runtime chi con la may noi suy diem trong khung neo cuc bo theo timing chart anime — runtime khong con biet \\"khop\\" la gi.","kien_truc":"Ba tang tach han, noi nhau bang MOT file du …"
    },
    {
      "type": "workflow_agent",
      "index": 8,
      "label": "thiet-ke:lop-lang",
      "phaseIndex": 2,
      "phaseTitle": "Thiet ke",
      "agentId": "a6b5e28e46539f0a8",
      "model": "claude-opus-5[1m]",
      "state": "done",
      "startedAt": 1789639537088,
      "queuedAt": 1789639531809,
      "attempt": 1,
      "lastToolName": "StructuredOutput",
      "lastToolSummary": "VẼ DÀY — nhân vật 7 lớp sơn + LOD theo cỡ cảnh",
      "promptPreview": "BOI CANH DU AN (doc ky truoc khi lam):
- Repo: /Users/leanhvu/video-studio. Remotion 4 + React 19 + SVG, render deterministic tung frame, 30fps, 1920x1080.
- Hien tai nhan vat la "cut-out vector": dau = ellipse ve tay, tay/chan = ong noi theo GOC KHOP (do),
  tu the la mot object so do goc trong src/v2/rig/tu-the.ts. Khong co mesh, khong co warp, khong co ve tay.
- Dau vao la mot file JSON "board"…",
      "promptFramed": false,
      "lastProgressAt": 1789640029068,
      "tokens": 118852,
      "toolCalls": 14,
      "durationMs": 491979,
      "resultPreview": "{"ten":"VẼ DÀY — nhân vật 7 lớp sơn + LOD theo cỡ cảnh","triet_ly":"Cá cược rằng \\"như shit\\" là lỗi BẢN VẼ chứ không phải lỗi cơ chế: giữ nguyên rig góc khớp, nhưng mỗi bộ phận không còn là một stroke mà là chồng 7 lớp sơn, số lớp bật/tắt theo bề rộng sọ trên màn.","kien_truc":"Bảy tầng một chiều, không tầng nào giữ state:\
(1) TƯ THẾ — src/v2/rig/tu-the.ts giữ nguyên, vẫn trả góc khớp.\
(2) XƯƠN…"
    },
    {
      "type": "workflow_agent",
      "index": 9,
      "label": "thiet-ke:anime-timing",
      "phaseIndex": 2,
      "phaseTitle": "Thiet ke",
      "agentId": "a4405f10ab0043fae",
      "model": "claude-opus-5[1m]",
      "state": "done",
      "startedAt": 1789639535080,
      "queuedAt": 1789639531810,
      "attempt": 1,
      "lastToolName": "StructuredOutput",
      "lastToolSummary": "NHỊP — lớp đạo diễn tự động (bản nhạc diễn xuất biên dịch t…",
      "promptPreview": "BOI CANH DU AN (doc ky truoc khi lam):
- Repo: /Users/leanhvu/video-studio. Remotion 4 + React 19 + SVG, render deterministic tung frame, 30fps, 1920x1080.
- Hien tai nhan vat la "cut-out vector": dau = ellipse ve tay, tay/chan = ong noi theo GOC KHOP (do),
  tu the la mot object so do goc trong src/v2/rig/tu-the.ts. Khong co mesh, khong co warp, khong co ve tay.
- Dau vao la mot file JSON "board"…",
      "promptFramed": false,
      "lastProgressAt": 1789639859752,
      "tokens": 115082,
      "toolCalls": 11,
      "durationMs": 323769,
      "resultPreview": "{"ten":"NHỊP — lớp đạo diễn tự động (bản nhạc diễn xuất biên dịch trước)","triet_ly":"Cá cược rằng nhân vật không \\"như shit\\" vì được vẽ sai, mà vì không ai ĐẠO DIỄN nó: thay state-machine \\"mốc cuối ≤ t\\" bằng một TRÌNH BIÊN DỊCH sinh ra bảng nhịp từng frame cho cả chương — có đón đà, có trễ pha theo khớp, có đổi nhịp giữ hình, có máy quay, có smear/impact theo vận tốc đo được.","kien_truc":"Hiệ…"
    },
    {
      "type": "workflow_agent",
      "index": 10,
      "label": "cham:mesh:thi-cong",
      "phaseIndex": 3,
      "phaseTitle": "Cham",
      "agentId": "a761eb65717713175",
      "model": "claude-opus-5[1m]",
      "state": "done",
      "startedAt": 1789640188980,
      "queuedAt": 1789640178726,
      "attempt": 1,
      "lastToolName": "StructuredOutput",
      "lastToolSummary": "rui-ro",
      "promptPreview": "BOI CANH DU AN (doc ky truoc khi lam):
- Repo: /Users/leanhvu/video-studio. Remotion 4 + React 19 + SVG, render deterministic tung frame, 30fps, 1920x1080.
- Hien tai nhan vat la "cut-out vector": dau = ellipse ve tay, tay/chan = ong noi theo GOC KHOP (do),
  tu the la mot object so do goc trong src/v2/rig/tu-the.ts. Khong co mesh, khong co warp, khong co ve tay.
- Dau vao la mot file JSON "board"…",
      "promptFramed": false,
      "lastProgressAt": 1789640436505,
      "tokens": 79509,
      "toolCalls": 17,
      "durationMs": 247523,
      "resultPreview": "{"co_thi_cong_duoc_khong":"rui-ro","diem":7,"diem_manh":["Mọi khẳng định về code hiện tại đều ĐÚNG — tôi kiểm từng cái: `thanDiem` đúng 10 điểm hằng tại src/v2/rig/nhan-vat.tsx:388; `chanGoc` (nhan-vat.tsx:366) trả đúng 2 điểm = chân là MỘT đoạn thẳng, ngồi làm bằng `chanNgan` (tu-the.ts:113); `CU_CHI_NOI[hash % 10]` đúng nguyên văn tại src/v2/phim/san-khau.tsx:32,133; `NEN='#fdfdfd'` + comment 'd…"
    },
    {
      "type": "workflow_agent",
      "index": 11,
      "label": "cham:mesh:hieu-nang",
      "phaseIndex": 3,
      "phaseTitle": "Cham",
      "agentId": "a76d5d272e580181e",
      "model": "claude-opus-5[1m]",
      "state": "done",
      "startedAt": 1789640193045,
      "queuedAt": 1789640178726,
      "attempt": 1,
      "lastToolName": "StructuredOutput",
      "lastToolSummary": "duoc",
      "promptPreview": "BOI CANH DU AN (doc ky truoc khi lam):
- Repo: /Users/leanhvu/video-studio. Remotion 4 + React 19 + SVG, render deterministic tung frame, 30fps, 1920x1080.
- Hien tai nhan vat la "cut-out vector": dau = ellipse ve tay, tay/chan = ong noi theo GOC KHOP (do),
  tu the la mot object so do goc trong src/v2/rig/tu-the.ts. Khong co mesh, khong co warp, khong co ve tay.
- Dau vao la mot file JSON "board"…",
      "promptFramed": false,
      "lastProgressAt": 1789640984028,
      "tokens": 74500,
      "toolCalls": 17,
      "durationMs": 790983,
      "resultPreview": "{"co_thi_cong_duoc_khong":"duoc","diem":7.5,"diem_manh":["Chẩn đoán cổ chai ĐÚNG và tôi xác nhận bằng đo: 500 frame ở --scale=0.25 mất 5,7 s (~2 ms/frame) so với 38,6 s ở scale 1.0 (~65 ms/frame) — chi phí tỉ lệ với diện tích pixel, toán hình học gần như bằng 0. Câu 'cổ chai là raster hoá SVG trong Chromium, không phải số học' là sự thật đo được, không phải lời hứa.","Ngân sách toán biến dạng thật…"
    },
    {
      "type": "workflow_agent",
      "index": 12,
      "label": "cham:mesh:ket-qua-hinh",
      "phaseIndex": 3,
      "phaseTitle": "Cham",
      "agentId": "a8d401bffb07a73bc",
      "model": "claude-opus-5[1m]",
      "state": "done",
      "startedAt": 1789640194756,
      "queuedAt": 1789640178727,
      "attempt": 1,
      "lastToolName": "StructuredOutput",
      "lastToolSummary": "rui-ro",
      "promptPreview": "BOI CANH DU AN (doc ky truoc khi lam):
- Repo: /Users/leanhvu/video-studio. Remotion 4 + React 19 + SVG, render deterministic tung frame, 30fps, 1920x1080.
- Hien tai nhan vat la "cut-out vector": dau = ellipse ve tay, tay/chan = ong noi theo GOC KHOP (do),
  tu the la mot object so do goc trong src/v2/rig/tu-the.ts. Khong co mesh, khong co warp, khong co ve tay.
- Dau vao la mot file JSON "board"…",
      "promptFramed": false,
      "lastProgressAt": 1789640396376,
      "tokens": 71089,
      "toolCalls": 13,
      "durationMs": 201620,
      "resultPreview": "{"diem":6.5,"diem_manh":["Chẩn đoán code CHÍNH XÁC và kiểm chứng được từng dòng — tôi verify thật: thanDiem đúng 10 điểm hằng (nhan-vat.tsx:388-399), chanGoc trả đúng 2 điểm không gối (nhan-vat.tsx:366-373), CU_CHI_NOI đúng 10 phần tử chọn bằng hash%10 (san-khau.tsx:32,133), lông mày mặc định không vẽ (mat.tsx:12), GocNhin 4 giá trị enum (hinh.ts:112). Đây là phương án duy nhất chỉ đúng vào đường …"
    },
    {
      "type": "workflow_agent",
      "index": 13,
      "label": "cham:mesh:tu-dong",
      "phaseIndex": 3,
      "phaseTitle": "Cham",
      "agentId": "a51fcdd98b2115935",
      "model": "claude-opus-5[1m]",
      "state": "done",
      "startedAt": 1789640191108,
      "queuedAt": 1789640178727,
      "attempt": 1,
      "lastToolName": "StructuredOutput",
      "lastToolSummary": "rui-ro",
      "promptPreview": "BOI CANH DU AN (doc ky truoc khi lam):
- Repo: /Users/leanhvu/video-studio. Remotion 4 + React 19 + SVG, render deterministic tung frame, 30fps, 1920x1080.
- Hien tai nhan vat la "cut-out vector": dau = ellipse ve tay, tay/chan = ong noi theo GOC KHOP (do),
  tu the la mot object so do goc trong src/v2/rig/tu-the.ts. Khong co mesh, khong co warp, khong co ve tay.
- Dau vao la mot file JSON "board"…",
      "promptFramed": false,
      "lastProgressAt": 1789640368166,
      "tokens": 67024,
      "toolCalls": 9,
      "durationMs": 177058,
      "resultPreview": "{"diem":6.5,"diem_manh":["Chẩn đoán ĐÚNG và kiểm chứng được trên repo thật: tôi đã mở file và xác nhận từng cáo buộc — `thanDiem` trong src/v2/rig/nhan-vat.tsx đúng là 10 điểm hằng (silhouette không bao giờ đổi theo tư thế), `chanGoc` trả đúng 2 điểm (chân là một đoạn thẳng, không gối), `NEN='#fdfdfd'` được dùng làm `fill` khắp mieng/tay/do-cam (nên nhân vật rỗng ruột, bóng đen không đọc được), `p…"
    },
    {
      "type": "workflow_agent",
      "index": 14,
      "label": "cham:morph:thi-cong",
      "phaseIndex": 3,
      "phaseTitle": "Cham",
      "agentId": "a940160caca739d2d",
      "model": "claude-opus-5[1m]",
      "state": "done",
      "startedAt": 1789640182250,
      "queuedAt": 1789640178769,
      "attempt": 1,
      "lastToolName": "StructuredOutput",
      "lastToolSummary": "rui-ro",
      "promptPreview": "BOI CANH DU AN (doc ky truoc khi lam):
- Repo: /Users/leanhvu/video-studio. Remotion 4 + React 19 + SVG, render deterministic tung frame, 30fps, 1920x1080.
- Hien tai nhan vat la "cut-out vector": dau = ellipse ve tay, tay/chan = ong noi theo GOC KHOP (do),
  tu the la mot object so do goc trong src/v2/rig/tu-the.ts. Khong co mesh, khong co warp, khong co ve tay.
- Dau vao la mot file JSON "board"…",
      "promptFramed": false,
      "lastProgressAt": 1789640388139,
      "tokens": 64964,
      "toolCalls": 9,
      "durationMs": 205887,
      "resultPreview": "{"co_thi_cong_duoc_khong":"rui-ro","diem":6.5,"diem_manh":["Tuong thich Remotion 100%: ban ke keyform la JSON tinh import o module scope, morph la ham thuan cua frame index, khong state tich luy. Deterministic tu nhien, khong can lach. Day la diem manh that, khong phai marketing.","Ngan sach hieu nang khong phai van de: ~1000 diem/frame + noi chuoi d re hon nhieu so voi cay React hien tai (nhan-va…"
    },
    {
      "type": "workflow_agent",
      "index": 15,
      "label": "cham:morph:hieu-nang",
      "phaseIndex": 3,
      "phaseTitle": "Cham",
      "agentId": "a51cd382a83dc92cd",
      "model": "claude-opus-5[1m]",
      "state": "done",
      "startedAt": 1789640187291,
      "queuedAt": 1789640178769,
      "attempt": 1,
      "lastToolName": "StructuredOutput",
      "lastToolSummary": "duoc",
      "promptPreview": "BOI CANH DU AN (doc ky truoc khi lam):
- Repo: /Users/leanhvu/video-studio. Remotion 4 + React 19 + SVG, render deterministic tung frame, 30fps, 1920x1080.
- Hien tai nhan vat la "cut-out vector": dau = ellipse ve tay, tay/chan = ong noi theo GOC KHOP (do),
  tu the la mot object so do goc trong src/v2/rig/tu-the.ts. Khong co mesh, khong co warp, khong co ve tay.
- Dau vao la mot file JSON "board"…",
      "promptFramed": false,
      "lastProgressAt": 1789640566832,
      "tokens": 72317,
      "toolCalls": 20,
      "durationMs": 379540,
      "resultPreview": "{"co_thi_cong_duoc_khong":"duoc","diem":7.5,"diem_manh":["Do that: bien 61.6 ms/frame wall @concurrency=3 (120 frame 11.37s vs 720 frame 48.35s) -> 19000 frame ~20 phut. Bench may morph 10 bo phan x 48 diem x 2 nhan vat chi 0.223 ms/frame, co smear 3 ban sao 0.541 ms. Tuc phan tinh toan cua phuong an chiem <1% ngan sach frame. Khong co chuyen 40 phut thanh 8 tieng.","Do doi chung --scale=0.25 (1/1…"
    },
    {
      "type": "workflow_agent",
      "index": 16,
      "label": "cham:morph:ket-qua-hinh",
      "phaseIndex": 3,
      "phaseTitle": "Cham",
      "agentId": "a62dbf9b943165b80",
      "model": "claude-opus-5[1m]",
      "state": "done",
      "startedAt": 1789640186003,
      "queuedAt": 1789640178769,
      "attempt": 1,
      "lastToolName": "StructuredOutput",
      "lastToolSummary": "rui-ro",
      "promptPreview": "BOI CANH DU AN (doc ky truoc khi lam):
- Repo: /Users/leanhvu/video-studio. Remotion 4 + React 19 + SVG, render deterministic tung frame, 30fps, 1920x1080.
- Hien tai nhan vat la "cut-out vector": dau = ellipse ve tay, tay/chan = ong noi theo GOC KHOP (do),
  tu the la mot object so do goc trong src/v2/rig/tu-the.ts. Khong co mesh, khong co warp, khong co ve tay.
- Dau vao la mot file JSON "board"…",
      "promptFramed": false,
      "lastProgressAt": 1789640336111,
      "tokens": 59245,
      "toolCalls": 9,
      "durationMs": 150106,
      "resultPreview": "{"co_thi_cong_duoc_khong":"rui-ro","diem":6.5,"diem_manh":["Chẩn đoán ĐÚNG và kiểm chứng được từng dòng code. Tôi đã đọc: /Users/leanhvu/video-studio/src/v2/rig/nhan-vat.tsx:388 thanDiem đúng là 10 điểm hằng số (bóng đen không bao giờ đổi); chanGoc dòng 366-373 trả khop chỉ 2 điểm — chân đúng là MỘT đoạn thẳng, không gối; src/v2/act/ap-dung.ts:123 CHUYEN_FRAME = 5 với MỘT u chung cho mọi khớp qua …"
    },
    {
      "type": "workflow_agent",
      "index": 17,
      "label": "cham:morph:tu-dong",
      "phaseIndex": 3,
      "phaseTitle": "Cham",
      "agentId": "ad8ac327acbac83b9",
      "model": "claude-opus-5[1m]",
      "state": "done",
      "startedAt": 1789640183867,
      "queuedAt": 1789640178769,
      "attempt": 1,
      "lastToolName": "StructuredOutput",
      "lastToolSummary": "rui-ro",
      "promptPreview": "BOI CANH DU AN (doc ky truoc khi lam):
- Repo: /Users/leanhvu/video-studio. Remotion 4 + React 19 + SVG, render deterministic tung frame, 30fps, 1920x1080.
- Hien tai nhan vat la "cut-out vector": dau = ellipse ve tay, tay/chan = ong noi theo GOC KHOP (do),
  tu the la mot object so do goc trong src/v2/rig/tu-the.ts. Khong co mesh, khong co warp, khong co ve tay.
- Dau vao la mot file JSON "board"…",
      "promptFramed": false,
      "lastProgressAt": 1789640349263,
      "tokens": 57773,
      "toolCalls": 8,
      "durationMs": 165394,
      "resultPreview": "{"co_thi_cong_duoc_khong":"rui-ro","diem":6.5,"diem_manh":["Chuyển chất lượng chuyển động vào MẶC ĐỊNH CỦA ENGINE chứ không vào board: timing chart rời rạc, trễ pha theo kênh, anticipation/overshoot/settle tự bọc, smear, on-twos. Đây là phần sống tốt nhất dưới lăng kính tự động — board dốt cỡ nào thì mỗi lần đổi tư thế vẫn có trước-đà/vượt-đà, tức là trị trực tiếp lời chê 'không hề mượt', 'làm lì'…"
    },
    {
      "type": "workflow_agent",
      "index": 18,
      "label": "cham:lop-lang:thi-cong",
      "phaseIndex": 3,
      "phaseTitle": "Cham",
      "agentId": "ac28d13437b8560e2",
      "model": "claude-opus-5[1m]",
      "state": "done",
      "startedAt": 1789640340622,
      "queuedAt": 1789640178789,
      "attempt": 1,
      "lastToolName": "StructuredOutput",
      "lastToolSummary": "rui-ro",
      "promptPreview": "BOI CANH DU AN (doc ky truoc khi lam):
- Repo: /Users/leanhvu/video-studio. Remotion 4 + React 19 + SVG, render deterministic tung frame, 30fps, 1920x1080.
- Hien tai nhan vat la "cut-out vector": dau = ellipse ve tay, tay/chan = ong noi theo GOC KHOP (do),
  tu the la mot object so do goc trong src/v2/rig/tu-the.ts. Khong co mesh, khong co warp, khong co ve tay.
- Dau vao la mot file JSON "board"…",
      "promptFramed": false,
      "lastProgressAt": 1789640522292,
      "tokens": 85429,
      "toolCalls": 14,
      "durationMs": 181670,
      "resultPreview": "{"co_thi_cong_duoc_khong":"rui-ro","diem":5.5,"diem_manh":["Đúng ràng buộc Remotion: mọi thứ thêm vào (nếp áo, mảng tối, mày/mí, bóng tiếp đất, LOD) đều là hàm thuần của góc khớp + `dau` prop, không state tích luỹ, không Math.random — dùng lại đúng `bam` FNV-1a + `ngauNhien` xorshift đã có trong src/v2/rig/hinh.ts. Frame N luôn ra cùng hình. Cái này không phải lời hứa suông, nó khớp với cách repo …"
    },
    {
      "type": "workflow_agent",
      "index": 19,
      "label": "cham:lop-lang:hieu-nang",
      "phaseIndex": 3,
      "phaseTitle": "Cham",
      "agentId": "a6287d000c13bf6a1",
      "model": "claude-opus-5[1m]",
      "state": "done",
      "startedAt": 1789640352695,
      "queuedAt": 1789640178790,
      "attempt": 1,
      "lastToolName": "StructuredOutput",
      "lastToolSummary": "duoc",
      "promptPreview": "BOI CANH DU AN (doc ky truoc khi lam):
- Repo: /Users/leanhvu/video-studio. Remotion 4 + React 19 + SVG, render deterministic tung frame, 30fps, 1920x1080.
- Hien tai nhan vat la "cut-out vector": dau = ellipse ve tay, tay/chan = ong noi theo GOC KHOP (do),
  tu the la mot object so do goc trong src/v2/rig/tu-the.ts. Khong co mesh, khong co warp, khong co ve tay.
- Dau vao la mot file JSON "board"…",
      "promptFramed": false,
      "lastProgressAt": 1789640746357,
      "tokens": 75790,
      "toolCalls": 21,
      "durationMs": 393661,
      "resultPreview": "{"co_thi_cong_duoc_khong":"duoc","diem":6.5,"diem_manh":["ĐO THẬT: phương án này KHÔNG có vấn đề hiệu năng. Baseline hiện tại là ~19.5 ms/frame wall (900 frame trong 21.58s, trừ ~4s khởi động). Phim 10 phút = 19000 frame render hết ~7.6 PHÚT, không phải 40 phút. Sau khi thêm lớp, worst case đo được là ~25 ms/frame → ~9.4 phút. Câu hỏi '40 phút thành 8 tiếng' không xảy ra, sai 2 bậc độ lớn.","Thay …"
    },
    {
      "type": "workflow_agent",
      "index": 20,
      "label": "cham:lop-lang:ket-qua-hinh",
      "phaseIndex": 3,
      "phaseTitle": "Cham",
      "agentId": "aead8fbf221473d55",
      "model": "claude-opus-5[1m]",
      "state": "done",
      "startedAt": 1789640371982,
      "queuedAt": 1789640178790,
      "attempt": 1,
      "lastToolName": "StructuredOutput",
      "lastToolSummary": "rui-ro",
      "promptPreview": "BOI CANH DU AN (doc ky truoc khi lam):
- Repo: /Users/leanhvu/video-studio. Remotion 4 + React 19 + SVG, render deterministic tung frame, 30fps, 1920x1080.
- Hien tai nhan vat la "cut-out vector": dau = ellipse ve tay, tay/chan = ong noi theo GOC KHOP (do),
  tu the la mot object so do goc trong src/v2/rig/tu-the.ts. Khong co mesh, khong co warp, khong co ve tay.
- Dau vao la mot file JSON "board"…",
      "promptFramed": false,
      "lastProgressAt": 1789640528613,
      "tokens": 90914,
      "toolCalls": 13,
      "durationMs": 156631,
      "resultPreview": "{"co_thi_cong_duoc_khong":"rui-ro","diem":5.5,"diem_manh":["Đọc code đúng, không phịa: bảng LOD 110/200/330/560/900 khớp CHÍNH XÁC `CO_CANH` trong src/v2/board/kieu-board.ts; phần 'vẫn không làm được' cũng đúng sự thật (thanDiem đúng là 10 điểm hằng ở nhan-vat.tsx:388, không có góc gối trong TuThe). Đây là hiếm — phần lớn phương án dạng này bịa ra mốc không tồn tại.","Không phá ràng buộc kỹ thuật …"
    },
    {
      "type": "workflow_agent",
      "index": 21,
      "label": "cham:lop-lang:tu-dong",
      "phaseIndex": 3,
      "phaseTitle": "Cham",
      "agentId": "a7ae25392f5b9a7fa",
      "model": "claude-opus-5[1m]",
      "state": "done",
      "startedAt": 1789640392943,
      "queuedAt": 1789640178790,
      "attempt": 1,
      "lastToolName": "StructuredOutput",
      "lastToolSummary": "rui-ro",
      "promptPreview": "BOI CANH DU AN (doc ky truoc khi lam):
- Repo: /Users/leanhvu/video-studio. Remotion 4 + React 19 + SVG, render deterministic tung frame, 30fps, 1920x1080.
- Hien tai nhan vat la "cut-out vector": dau = ellipse ve tay, tay/chan = ong noi theo GOC KHOP (do),
  tu the la mot object so do goc trong src/v2/rig/tu-the.ts. Khong co mesh, khong co warp, khong co ve tay.
- Dau vao la mot file JSON "board"…",
      "promptFramed": false,
      "lastProgressAt": 1789640596471,
      "tokens": 83778,
      "toolCalls": 17,
      "durationMs": 203528,
      "resultPreview": "{"co_thi_cong_duoc_khong":"rui-ro","diem":5.5,"diem_manh":["Tự động hoá tốt ở tầng dữ liệu: gần như mọi thứ mới (nếp áo, mảng tối, bóng tiếp đất, mày/mí, LOD) đều là hàm thuần của góc khớp + dau đã có trong board. Hai trường mới (anh_sang, may) đều TUỲ CHỌN nên 12 board máy đã sinh trong src/projects/* chạy được ngay, không cần viết lại board nào — đây là điểm mạnh thật, hiếm phương án nào giữ đượ…"
    },
    {
      "type": "workflow_agent",
      "index": 22,
      "label": "cham:anime-timing:thi-cong",
      "phaseIndex": 3,
      "phaseTitle": "Cham",
      "agentId": "a561aa400f08a5871",
      "model": "claude-opus-5[1m]",
      "state": "done",
      "startedAt": 1789640400064,
      "queuedAt": 1789640178790,
      "attempt": 1,
      "lastToolName": "StructuredOutput",
      "lastToolSummary": "duoc",
      "promptPreview": "BOI CANH DU AN (doc ky truoc khi lam):
- Repo: /Users/leanhvu/video-studio. Remotion 4 + React 19 + SVG, render deterministic tung frame, 30fps, 1920x1080.
- Hien tai nhan vat la "cut-out vector": dau = ellipse ve tay, tay/chan = ong noi theo GOC KHOP (do),
  tu the la mot object so do goc trong src/v2/rig/tu-the.ts. Khong co mesh, khong co warp, khong co ve tay.
- Dau vao la mot file JSON "board"…",
      "promptFramed": false,
      "lastProgressAt": 1789640789999,
      "tokens": 115292,
      "toolCalls": 21,
      "durationMs": 389935,
      "resultPreview": "{"co_thi_cong_duoc_khong":"duoc","diem":7,"diem_manh":["Chẩn đoán ĐÚNG và tôi xác minh được từng dòng: `src/v2/act/ap-dung.ts:vuotDa()` dùng CÙNG một `u` cho mọi khớp qua `phaTuThe` (đúng là dấu vân tay 'máy làm'); `CHUYEN_FRAME = 5` cứng; `song()` đúng là 4 sin cố định; `dangNhay()` đúng là modulo; và `src/v2/phim/san-khau.tsx:31` đúng là `CU_CHI_NOI` 10 tư thế xoay vòng bằng hash — lời chê 'lặp …"
    },
    {
      "type": "workflow_agent",
      "index": 23,
      "label": "cham:anime-timing:hieu-nang",
      "phaseIndex": 3,
      "phaseTitle": "Cham",
      "agentId": "a5e7f54397294540e",
      "model": "claude-opus-5[1m]",
      "state": "done",
      "startedAt": 1789640440250,
      "queuedAt": 1789640178790,
      "attempt": 1,
      "lastToolName": "StructuredOutput",
      "lastToolSummary": "duoc",
      "promptPreview": "BOI CANH DU AN (doc ky truoc khi lam):
- Repo: /Users/leanhvu/video-studio. Remotion 4 + React 19 + SVG, render deterministic tung frame, 30fps, 1920x1080.
- Hien tai nhan vat la "cut-out vector": dau = ellipse ve tay, tay/chan = ong noi theo GOC KHOP (do),
  tu the la mot object so do goc trong src/v2/rig/tu-the.ts. Khong co mesh, khong co warp, khong co ve tay.
- Dau vao la mot file JSON "board"…",
      "promptFramed": false,
      "lastProgressAt": 1789641022231,
      "tokens": 92637,
      "toolCalls": 26,
      "durationMs": 581979,
      "resultPreview": "{"co_thi_cong_duoc_khong":"duoc","diem":7.5,"diem_manh":["Do that: ve GAP BON LAN toan bo nhan vat moi frame + zoom may doi moi frame chi lam 800 frame cham tu 51,4 s len 52,3 s (+1,8 %). Smear multiples, speed line, parallax, may quay tu dong deu gan nhu MIEN PHI tren pipeline nay.","Trinh bien dich la chi phi khong dang ke: mo phong bang nhip 3000 frame x 3 dien vien x 40 truong + quet van toc =…"
    },
    {
      "type": "workflow_agent",
      "index": 24,
      "label": "cham:anime-timing:ket-qua-hinh",
      "phaseIndex": 3,
      "phaseTitle": "Cham",
      "agentId": "af8dbd804317df394",
      "model": "claude-opus-5[1m]",
      "state": "done",
      "startedAt": 1789640526220,
      "queuedAt": 1789640178790,
      "attempt": 1,
      "lastToolName": "StructuredOutput",
      "lastToolSummary": "rui-ro",
      "promptPreview": "BOI CANH DU AN (doc ky truoc khi lam):
- Repo: /Users/leanhvu/video-studio. Remotion 4 + React 19 + SVG, render deterministic tung frame, 30fps, 1920x1080.
- Hien tai nhan vat la "cut-out vector": dau = ellipse ve tay, tay/chan = ong noi theo GOC KHOP (do),
  tu the la mot object so do goc trong src/v2/rig/tu-the.ts. Khong co mesh, khong co warp, khong co ve tay.
- Dau vao la mot file JSON "board"…",
      "promptFramed": false,
      "lastProgressAt": 1789640771693,
      "tokens": 97774,
      "toolCalls": 18,
      "durationMs": 245472,
      "resultPreview": "{"diem":6.5,"diem_manh":["Chẩn đoán kiến trúc ĐÚNG và kiểm chứng được trên code: `trangThaiTai()` trong /Users/leanhvu/video-studio/src/v2/act/ap-dung.ts thật sự chỉ nhìn một frame (quét mốc, lấy mốc cuối ≤ t), nên anticipation / trễ pha khớp / smear theo vận tốc / ngân sách giữ hình đều BẤT KHẢ với ruột hiện tại. Tầng biên dịch cấp chương là cách duy nhất mở khoá cả bốn.","Máy quay tự động là đòn…"
    },
    {
      "type": "workflow_agent",
      "index": 25,
      "label": "cham:anime-timing:tu-dong",
      "phaseIndex": 3,
      "phaseTitle": "Cham",
      "agentId": "a1049b6b830f3f4e3",
      "model": "claude-opus-5[1m]",
      "state": "done",
      "startedAt": 1789640533801,
      "queuedAt": 1789640178790,
      "attempt": 1,
      "lastToolName": "StructuredOutput",
      "lastToolSummary": "rui-ro",
      "promptPreview": "BOI CANH DU AN (doc ky truoc khi lam):
- Repo: /Users/leanhvu/video-studio. Remotion 4 + React 19 + SVG, render deterministic tung frame, 30fps, 1920x1080.
- Hien tai nhan vat la "cut-out vector": dau = ellipse ve tay, tay/chan = ong noi theo GOC KHOP (do),
  tu the la mot object so do goc trong src/v2/rig/tu-the.ts. Khong co mesh, khong co warp, khong co ve tay.
- Dau vao la mot file JSON "board"…",
      "promptFramed": false,
      "lastProgressAt": 1789640747951,
      "tokens": 89889,
      "toolCalls": 15,
      "durationMs": 214150,
      "resultPreview": "{"co_thi_cong_duoc_khong":"rui-ro","diem":6.5,"diem_manh":["Chẩn đoán kiến trúc ĐÚNG và tôi kiểm được từng dòng: `/Users/leanhvu/video-studio/src/v2/act/ap-dung.ts` thật sự chỉ nhìn một frame — `CHUYEN_FRAME = 5` với MỘT `u` chung cho mọi khớp (`phaTuThe(dangTruoc, dangMoi, u)`), `song()` cộng 4 sin cố định, `dangNhay()` là modulo chu kỳ, `locMocQuaDay()` ngưỡng 0.42 s. Đón đà / trễ pha / smear th…"
    },
    {
      "type": "workflow_agent",
      "index": 26,
      "label": "chot:tong-hop",
      "phaseIndex": 4,
      "phaseTitle": "Chot",
      "agentId": "a008e36ecc06cabb2",
      "model": "claude-opus-5[1m]",
      "state": "done",
      "startedAt": 1789641028290,
      "queuedAt": 1789641023877,
      "attempt": 1,
      "lastToolName": "Bash",
      "lastToolSummary": "cd /Users/leanhvu/video-studio && echo "=== flip count ==="…",
      "promptPreview": "BOI CANH DU AN (doc ky truoc khi lam):
- Repo: /Users/leanhvu/video-studio. Remotion 4 + React 19 + SVG, render deterministic tung frame, 30fps, 1920x1080.
- Hien tai nhan vat la "cut-out vector": dau = ellipse ve tay, tay/chan = ong noi theo GOC KHOP (do),
  tu the la mot object so do goc trong src/v2/rig/tu-the.ts. Khong co mesh, khong co warp, khong co ve tay.
- Dau vao la mot file JSON "board"…",
      "promptFramed": false,
      "lastProgressAt": 1789641507425,
      "tokens": 179997,
      "toolCalls": 4,
      "durationMs": 479133,
      "resultPreview": "# BẢN THIẾT KẾ THI CÔNG — RIG V3 "XƯƠNG & NHỊP"

Bản tổng hợp cuối. Viết cho người ngồi code. Mọi path là tuyệt đối từ `/Users/leanhvu/video-studio`.

---

## 0. PHÁN QUYẾT CHỐT (đọc trước, đừng bỏ qua)

Bốn phương án chấm ra 6.875 / 6.875 / 6.75 / 5.75. Hai phương án đầu **hoà điểm và chúng nói ngược nhau** — một bảo lỗi ở HÌNH, một bảo lỗi ở ĐỘNG. Nhưng đọc kỹ 16 bản chấm thì cả 16 giám khảo, kh…"
    }
  ],
  "totalTokens": 2248634,
  "totalToolCalls": 384
}