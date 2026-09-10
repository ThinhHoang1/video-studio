# Đạo diễn: ngữ pháp shot V2 có số liệu

Mọi con số ở đây đo từ 231 shot / 403 s của tham chiếu JaidenAnimations
(`docs/tham-chieu/shot.md`, `docs/nghien-cuu-storytime.md` §2, §3, §6, §7).
Không phải gu; là mức người xem storytime đã quen. Lệch xa thì video "sai kiểu"
dù từng hình đẹp.

## 0. Bốn con số phải nhớ

| | Tham chiếu | Mục tiêu board | Công cụ đo |
|---|---|---|---|
| Độ dài shot | trung vị **1.42 s**, 31% < 1 s, dài nhất 8.4 s, ngắn nhất 0.25 s | **1.0–1.6 s/shot**, ≥ 30% < 1 s | `thong-ke-board` |
| Nói trực diện | **16%** thời gian, mỗi đoạn trung vị 1.8 s, p75 2.9 s, dài nhất 6.8 s (chỉ ở mở đầu) | **≤ 20%**, mỗi đoạn ≤ 3 s, ≤ 2 shot TD liền | `kiem-tra-v2` (> 7 s ⚠), `thong-ke-board` |
| Chữ trên màn | 1 lần / 12.6 s, 23% shot có chữ | **≥ 1 / 15 s** | `thong-ke-board` |
| Nhịp trắng | **7.2%** thời gian, trung vị 0.92 s, p25/p75 0.5/1.25 s, dài nhất 3.6 s (sau câu chốt) | **5–10%**, mỗi nhịp 0.3–1.5 s | `thong-ke-board` |

Cắt là **cắt cứng 100%**: không mờ chồng, không zoom trượt. Đổi tư thế trong
shot là **snap 1 khung**, không tween (79% sự kiện đổi tư thế dài đúng 1 khung).
Đầu **không gật** khi nói, mắt **không chớp**; chỉ miệng đổi hình. Schema và
renderer đã khoá đúng như vậy: bạn không cần (và không thể) chỉnh.

## 1. Chín loại shot: khi nào dùng, dài bao lâu

Tỉ lệ tham chiếu (theo % thời gian) và cách dùng:

| `loai` | % TG tham chiếu | Dùng khi | Độ dài | Cỡ mặc định |
|---|---|---|---|---|
| `minh-hoa` | **27.6** | lời kể một **sự kiện / hành động / ví dụ**: diễn lại bằng nhân vật + đúng prop câu nhắc | 1–3 s, có `act` mỗi 0.4–1.5 s | `trung` |
| `truc-dien` | 15.1 | lời là **bình luận** của người kể ("Ok nghe này", "Thật sự luôn", "Các bạn ơi"); tiếng đệm; câu cảm thán ngắn | **0.5–3 s**; TD chêm 0.5–0.85 s | `can`, x 0.72 |
| `chu` | 11.0 | **punchline**, tiêu đề chương, câu thoại ngắn của người khác, liệt kê | thẻ punchline 0.5–1.2 s; nhãn liệt kê 0.4–0.8 s/mục; câu thoại `tung-tu` 1–2 s | `trung` |
| `tieu-canh` | 11.7 | nhân vật **bé tí giữa khung trắng**: cô đơn, đi xa, hài về sự nhỏ bé; đi từ A tới B | 0.75–3 s | `nho` |
| `dong-nguoi` | 9.1 | cả lớp / cả phòng phản ứng cùng lúc | 1–2.5 s | `rong` |
| `phan-ung` | 6.8 | **cận mặt không nói** của người kể hoặc người khác ngay sau một cú | **0.4–1 s** (tham chiếu ngắn nhất 0.25 s) | `can`, x 0.5 |
| `dac-ta` | 3.1 | một **vật** hoặc **một mặt rất to**; bước leo cỡ cho câu chốt | 0.75–2 s | `sat` |
| `insert` | 2.3 | ảnh thật / meme, **hiếm**: ≤ 5% shot, mỗi cái ≤ 2.6 s; renderer tự nháy trắng 0.3 s hai đầu | 1.3–2.6 s | |
| `trong` | 13.2 (gồm nháy) | **nhịp trắng**: trước ý mới 0.3–0.6 s; sau câu chốt 0.9–1.5 s; im hình 2.5–3.6 s chỉ một lần/video | 0.3–3.6 s | |

Quy tắc chuyển:

- **Rời `truc-dien` ngay khi lời chuyển từ bình luận sang sự kiện.** "Lớp tám,
  giờ toán" là sự kiện → `chu`/`minh-hoa`, không kể tiếp trực diện. Sau mở đầu,
  không đoạn TD nào quá 3 s, không quá 2 shot TD liền nhau.
- **Về `truc-dien` sau một shot nhỏ/lạnh** (`tieu-canh`, `phan-ung`, `trong`),
  không về thẳng từ thẻ chữ lớn. Khoảng cách giữa hai đoạn TD: trung vị 10.5 s.
- **Hơn 1/3 lần rời TD đi qua một `trong` 0.3–1.4 s** trước khi hiện cảnh mới.
- **Shot < 1 s dùng để**: nhãn liệt kê (8/30), nháy trắng (7/30), TD chêm (4/30),
  bước hành động như cửa mở / lao vào (4/30), bước zoom đặc tả (2/30), thiết lập
  rộng 0.6 s rồi vào gần (2/30), phản ứng (1/30).
- **Cỡ cảnh giữa hai shot liền: cùng cỡ 34%, gần hơn 35%, xa hơn 31%.** Không
  cần leo dần rộng → cận. Nhiều nhất là `trung → trung` (đổi nội dung, giữ cỡ).

## 2. Cỡ cảnh

`co` quyết định bề rộng sọ (DAU) và vị trí chân mặc định (`CO_CANH` trong `kieu-board.ts`):

| `co` | DAU px | chân ở y | Thấy gì | Dùng cho |
|---|---|---|---|---|
| `nho` | 110 | 0.66 | nhân vật bé giữa trắng | `tieu-canh` |
| `rong` | 200 | 0.84 | toàn thân + prop lớn (dãy bàn, cổng trường) | `dong-nguoi`, thiết lập |
| `trung` | 330 | 1.04 | cắt ở gối | `minh-hoa` mặc định, `chu` có nhân vật |
| `can` | 560 | 1.50 | cắt ở ngực | `truc-dien`, `phan-ung`, đối thoại 2 người |
| `sat` | 900 | 2.20 | chỉ mặt | `dac-ta` mặt |

Prop có `co` riêng, **nhân theo DAU/330**: cùng `co: 1` ở `rong` vẽ 0.6×, ở
`can` 1.7×, ở `sat` 2.7× so với `trung`. Toạ độ `x`, `y` của prop là **tâm đáy**
theo tỉ lệ khung. Bộ toạ độ đã kiểm trên still (`demo-v2`):

| Prop | `trung` | `rong` | `can` | `sat` (đặc tả) |
|---|---|---|---|---|
| `ban-hoc` (người ngồi) | x 0.5 y **1.02** `truoc: true` | | y **1.4** `truoc: true` | |
| `day-ban-lop` | | x 0.5 y **0.86** `truoc: true` | | |
| `bang-den` | x 0.62 y **0.36** co 1.1 (người viết x 0.33) | x 0.5 y **0.30** | | x 0.5 y **0.92** co 2.2 + chữ `tay` `giua` |
| `ban-giao-vien` | x 0.3 y 1.0 | | | |
| `dong-ho` | x 0.9 y 0.18–0.2 co 0.7–0.8 | x 0.9 y 0.2 co 0.8 | | |
| `cua-so` | | x 0.1 y 0.5 co 0.9 | | |
| `sach` + `but` trên bàn | y 0.74 co 0.6 / y 0.72 co 0.6 | | | `sach` x 0.42 y 0.9 co 2.4 |
| `but` (phấn) | | y 0.86 co 0.6 (rơi đất) | x 0.5 y 0.58 co 0.8 (đưa tay) | x 0.5 y 0.7 co 2 |
| `giot-mo-hoi` (gag) | | | x 0.63 y 0.42 co 1 (cạnh đầu x 0.5) | x 0.36 y 0.5 co 1.2 |
| `cong-truong` | | x 0.5 y 0.86 | | |
| `mui-ten` | x 0.5 y 0.22 co 0.7 (chỉ xuống đầu) | x 0.52 y 0.62 co 0.8 | | x 0.66 y 0.5 `flip: true` |
| `trai-tim`, `vach-buc`, `may-bay-giay` | cạnh đầu, y 0.16–0.4, co 0.6–1, thường có `tai` để pop giữa shot | | | |

`truoc: true` = vẽ **trước** nhân vật (bàn che chân người ngồi). Người đứng
cạnh bàn thì không dùng.

Prop **chỉ vẽ đúng vật câu đang nhắc** (tham chiếu: 84% shot nền trắng + 1–2
prop; không sàn, không tường). Lớp học = `day-ban-lop` + `bang-den`; không thêm
cửa, đèn, tủ cho "đủ phòng".

## 3. Diễn viên và `act`: snap và hold

```json
{"kieu": "nam", "x": 0.5, "dang": "ngoi", "mat": "nho", "mieng": "mim",
 "act": [
   {"tai": 0,   "dang": "ngoi",  "mat": "nho",  "mieng": "mim"},
   {"tai": 1.0, "dang": "ngoi",  "mat": "cung", "mieng": "cuoi"},
   {"tai": 2.0, "dang": "goMay", "mat": "nho",  "mieng": "mim", "nhin": -0.3}
 ]}
```

- Mỗi mốc `act` là **một trạng thái mới, hiện tức thời tại giây `tai`** (tính từ
  đầu shot) và **giữ nguyên** tới mốc sau. Trường nào không ghi thì giữ giá trị
  cũ. Không có nội suy; không viết "từ từ", "dần dần".
- **Hold 0.4–1.5 s giữa hai mốc** (tham chiếu p25/p50/p75 = 0.4/0.8/1.5 s; khi
  đang nói cận cảnh đổi tay/mặt mỗi 0.3–0.9 s; chuỗi hoảng loạn 0.2–0.45 s).
  Shot > 1.5 s có nhân vật mà không có `act` = đứng hình, thêm ít nhất 1 mốc.
- Nhân vật đang `noi` không cần `mieng` (lip-sync đè); nhân vật **không nói** phải
  có `mieng` cảm xúc (`thang`, `mim`, `cuoi-nhe`, `cuoi-toe`, `meu`, `o`, `smirk`,
  `hoang`, `nghien`, `gat`, `ba`) — không ghi thì miệng mặc định.
- **Mắt**: người kể `oval` (mặc định); mọi nhân vật khác `nho` hoặc `cham`; sốc
  `soc` → `soc-lon`; bực `khe` (+ `may: tuc`); vui `cung`; xấu hổ `xoan`; chán
  `chan`; nhắm `nham`. Mắt đổi **cùng lúc** với snap tư thế, không tự chớp.
- `nhin` -1..1 liếc trái/phải (lắc đầu = `nhin` -0.6 rồi 0.6 mỗi 0.45 s);
  `moHoi: true` thêm giọt mồ hôi; `ma: true` má hồng.
- `x` trong `act` **dịch chỗ** (tỉ lệ khung): đi/chạy = đổi `x` mỗi 0.35–0.45 s
  kèm `dang` luân phiên `nhay1`/`nhay2` (2 hình, on twos).
- `vao: "lao"`: khung đầu nghiêng lao vào + overshoot 1 khung; mặc định `pop`
  (hiện 1 khung).
- Đám đông: `kieu: "trang"` (đầu trắng không mặt) `co: 0.8` `dang: ngoi`; cho
  2–3 người một `toc` khác nhau để không thành hàng nhân bản; **mỗi người một
  `tai` hơi lệch** (0.3 / 0.35 / 0.4) để phản ứng dây chuyền.
- **Cử chỉ tự động**: người `noi` trong `truc-dien` không có `act` sẽ tự đổi tay
  theo nhịp câu. Muốn kiểm soát thì viết `act`.

### Tư thế theo ý (tên trong `thu-vien-v2.json`)

| Lời nói về | `dang` |
|---|---|
| kể, mở chuyện, hào hứng | `haiTayXoe`, `chi`, `chiLen` |
| ngồi học / ngồi bàn | `ngoi` (+ `ban-hoc` `truoc`), `goMay` (viết), `chongCam` (chán) |
| sợ, hồi hộp | `epNguc`, `omDau` |
| chán, mệt, đầu hàng | `cuiNguoi`, `nhunVai`, `gaiDau` |
| bực, ra lệnh (thầy) | `chi` + `mat: khe` + `may: tuc`, `khoanhTay`, `tayHong` |
| thì thào, che miệng | `cheMieng` |
| vui, ăn mừng, chào | `gioTay`, `vayTay` |
| tự tin, cà khịa | `motTayHong` + `mieng: smirk` |
| gọi điện | `camDT` |
| đi / chạy / nhảy | `nhay1` ↔ `nhay2` mỗi 0.35–0.45 s + đổi `x` |
| bỏ đi | `quayLung` |

## 4. Mẫu hành động `mau` (đã nối renderer)

`DienVien.mau` + `mau_tham_so` sinh `act` tự động (danh sách và tham số: `src/v2/act/README.md`)
(`src/v2/act/`, chưa có). Tên **dự kiến**: `vao-chay`, `ra-chay`, `vao-di`,
`giat-minh`, `nga`, `lac-dau`, `gat-gu`, `run`, `go-ban`, `nhin-quanh`,
`cuoi-lan`, `ngu-gat`, `viet-bang`, `quay-lai`. Được ghi vào board ngay từ giờ
(validator không kiểm trường này), nhưng **hiện chưa thấy trên hình**, nên
**luôn viết `act` tay kèm theo** (act tay sẽ đè lên mẫu khi mẫu chạy). Cách
giả từng mẫu bằng `act` hôm nay:

| Mẫu | `act` tay tương đương |
|---|---|
| `vao-chay` | `vao: "lao"` hoặc `x` từ 0.05 → vị trí trong 3 mốc 0.35 s, `nhay1`/`nhay2` |
| `ra-chay` | 3 mốc `x` tăng dần ra mép + `nhay1`/`nhay2`; shot kế cắt |
| `vao-di` | như `vao-chay` nhưng mốc cách 0.5 s, `dang: dung` |
| `giat-minh` | 1 mốc: `mat: soc-lon`, `mieng: o`, `dang: epNguc`, `moHoi: true` |
| `nga` | `dang: cuiNguoi` rồi 0.3 s sau `mat: xoan`, `mieng: meu`, `y` không đổi được → dùng `tieu-canh` |
| `lac-dau` | `nhin: -0.6` / `0.6` / `-0.6` cách 0.45 s |
| `gat-gu` | `mat: nham` / `nho` xen kẽ 0.5 s + `dang: chongCam` |
| `run` | `x` ±0.005 luân phiên mỗi 0.1 s, `mieng: hoang`, `moHoi: true` |
| `go-ban` | `dang: goMay` / `chi` xen kẽ 0.4 s |
| `nhin-quanh` | `nhin: -1` → `1` → `0` cách 0.5 s, `mat: soc` |
| `cuoi-lan` | `mat: cung` `mieng: cuoi-toe`, `dang: cuiNguoi` → `omDau` cách 0.6 s |
| `ngu-gat` | `dang: chongCam`, `mat: nham`, `mieng: thang` + chữ `tay` "zzz" `canh-dau` |
| `viet-bang` | `dang: chi` hướng bảng + chữ `tay` `vi_tri: phai` có `tai` 0.3–0.5 |
| `quay-lai` | `flip` đảo tại một mốc, `mat: soc` |

## 5. Góc nhìn `goc` và cầm đồ `cam` (đã nối renderer)

- `goc`: `truoc` | `ba-phan-tu` | `nghieng` | `sau` — renderer vẽ đúng góc; mỗi shot đối thoại nên có ít nhất một người `ba-phan-tu`/`nghieng`. Trước đây renderer vẽ mọi nhân
  vật `truoc`; hướng chỉ giả bằng `flip` (quay trái/phải), `nhin` (liếc) và
  `dang: quayLung` (`sau`); nay dùng `goc` trực tiếp.
- `cam`: tên prop cầm tay phải (`but`, `dien-thoai`, `sach`, `la-thu`, `ly-tra-sua`,
  `may-bay-giay`). Hiện giả bằng: đặt prop nhỏ **cạnh bàn tay** (cỡ `can`: `but`
  x 0.5 y 0.58 co 0.8 giữa hai người) hoặc dùng `dang: camDT` cho điện thoại.
  Đưa vật cho nhau = prop có `tai` xuất hiện đúng lúc + snap `dang: chi` của
  người đưa.

## 6. Bối cảnh dựng sẵn `boi_canh` (đã nối renderer)

Tên dự kiến: `lop-hoc`, `san-truong`, `hanh-lang`, `cang-tin`, `phong-ngu`,
`phong-khach`, `bep`, `duong-pho`, `tram-xe`, `quan-cafe`, `cong-vien`,
`ngoai-troi-mua`, `dem`, `man-hinh-dien-thoai`. `boi_canh` bung thành
bộ prop chuẩn, prop khai thêm vẽ chồng. **Hiện phải ghép tay** bằng prop có sẵn:

| `boi_canh` | Prop hiện có để ghép (cỡ `rong`/`trung`) |
|---|---|
| `lop-hoc` | `day-ban-lop` 0.5/0.86 `truoc` + `bang-den` 0.5/0.3 (+ `dong-ho` 0.9/0.2, `cua-so` 0.1/0.5) |
| `san-truong` | `cong-truong` 0.5/0.86 + `goc-cay` |
| `cong-vien` | `ghe-da` + `goc-cay` |
| `quan-cafe` | `ban-cafe` + `ly-tra-sua` |
| `duong-pho` | `cot-dien` + `xe-dap` |
| `ngoai-troi-mua` | `mua` (phủ khung, `tai` 0.3–0.6 để đổ mưa) + `ao-mua` + `cot-dien` |
| `hanh-lang`, `phong-ngu`, `phong-khach`, `bep`, `cang-tin`, `tram-xe`, `dem` | chưa có prop riêng: dùng `cua` + `cua-so` + đồ cầm (`sach`, `dien-thoai`, `laptop`) và **chữ `nhan`** nói rõ nơi ("bếp nhà tôi"); ghi `ghi_chu` để người vẽ thêm |
| `man-hinh-dien-thoai` | `dac-ta` `dien-thoai` co 2 + chữ `tay` `giua` làm nội dung tin nhắn |

## 7. Chữ trên màn: bốn kiểu

| `kieu` | Cỡ | Mặc định `vi_tri` | Dùng cho | `vao` hợp |
|---|---|---|---|---|
| `the` | 96–140 px, giữa khung | `giua` | **punchline**, tiêu đề chương, câu thoại người khác | `phong` (punchline mạnh), `tung-tu` (câu thoại theo nhịp đọc), `tuc-thi` |
| `kem` | 52 px đậm | `trai` (cạnh nhân vật TD x 0.72) | số liệu, nhấn ngắn ("× 40", "×2", "3 NĂM"), lời thoại ngắn (tự thêm ngoặc kép nếu kết bằng . ! ?) | `tuc-thi` |
| `nhan` | 34 px + **mũi tên** tới diễn viên đầu tiên | `tren` | gọi tên vật/người ("12 bước", "Nam Anh (thật)", "nửa viên phấn"), liệt kê 0.4–0.8 s/mục | `tuc-thi` |
| `tay` | 36 px viết tay nghiêng | `canh-dau` | tiếng lòng, âm thanh ("zzz", "RẮC", "...", "?!"), chữ trên bảng, chú thích tiểu cảnh | `tuc-thi` |

- `vao: tuc-thi` hiện 1 khung (mặc định). `tung-tu`: từng từ hiện theo cụm lời
  đang đọc. `phong`: phóng 0.3 → 1.6 trong 10 khung rồi giữ, cho thẻ punchline.
  Không có fade; chữ biến mất khi cắt shot.
- `tai`: giây xuất hiện trong shot (chữ đến sau nhân vật 0.3–1 s cho có nhịp).
- `mau`: mặc định đen; `#c0392b` chỉ cho thẻ punchline đỏ, tối đa 1–2 lần/chương.
- **Vị trí tránh đè nhân vật**: TD x 0.72 → chữ `trai`/`canh-dau`; nhân vật nhỏ
  bên trái (x 0.2, `co` 0.8) → `the` `vi_tri: "phai"`; đặc tả vật ở giữa → chữ
  `tren` hoặc `duoi`; `canh-dau` bám đầu diễn viên đầu tiên.
- Thẻ punchline chuẩn (tham chiếu "YOU'RE WRONG"/"NOPE!"): `chu` `the` `phong`
  giữ 0.5–1.2 s → `trong` 0.3–0.5 s → shot kế. Kèm `sfx` `vine-boom`/`boom`/`ding`.

## 8. Nhịp trắng

```json
{"tai": 15.23, "loai": "trong", "dai": 0.5, "ghi_chu": "trước 'Thằng Long ngồi cạnh' (mốc 15.74)"}
```

- `tai` = **mốc shot kế − `dai`**, lấy mốc từ `node pipeline/kiem-tra-v2.mjs <ten> --moc`.
  Sửa lời hay đọc lại giọng thì mốc trôi → đặt lại.
- Hoặc neo bằng lời khi lời nói đúng chỗ trống: `{"say": "Im lặng", "loai": "trong"}`
  (kéo tới mốc sau, validator ⚠ vì không có `dai`, chấp nhận được khi cố ý).
- Trước ý mới / sau khi rời TD: 0.3–0.6 s. Sau câu chốt: 0.9–1.5 s. Im hình dài
  2.5–3.6 s: tối đa một lần mỗi video, sau câu chốt nặng nhất.
- Shot có `dai` ngắn hơn khoảng tới shot kế: renderer **tự chèn trắng** vào phần
  hở; `thong-ke-board` tính vào % trắng.
- `insert` tự có nháy trắng 0.3 s hai đầu, không cần thêm `trong`.
- `sfx` nổ ở đầu shot: `whoosh-short` khi cắt vào TD, `tick` cho nhịp chờ,
  `vine-boom`/`boom` cho thẻ đỏ, `ding`/`pop` cho vật hiện, `rimshot`/`sad-trombone`
  cho câu tự trào, `airhorn` cho đám đông nổ, `suspense` cho thầy tháo kính,
  `record-scratch` cho vỡ trận. Không quá 2 sfx nặng (`boom`, `vine-boom`) một chương.

## 9. Ba ví dụ shot đầy đủ

Ba tình huống hay gặp nhất, viết đủ để chép rồi đổi `say`. Tên nhân vật/prop/
tư thế đều có trong `thu-vien-v2.json` (đã kiểm máy). Toạ độ lấy từ bảng §2:
ô nào có trong `demo-v2` thì đã soát trên still; ô khác (vd `ban-giao-vien` ở
cỡ `can`) là suy từ cùng quy tắc, phải soát still ở bước 8.

### 9a. Kể trực diện → minh hoạ → phản ứng (mở chương)

Lời: *"Ok nghe này. Sáng đó tôi dậy muộn. Đồng hồ chỉ bảy giờ mười lăm. Bảy giờ mười lăm. Xe buýt bảy giờ."*

```json
[
  {"say": "Ok nghe này", "loai": "truc-dien", "co": "can", "sfx": "whoosh-short",
   "dien": [{"kieu": "nam", "x": 0.72, "noi": true, "dang": "haiTayXoe", "mat": "oval",
             "act": [{"tai": 0, "dang": "haiTayXoe"}, {"tai": 0.6, "dang": "chi", "mat": "cung"}]}]},

  {"say": "Sáng đó tôi dậy muộn", "loai": "minh-hoa", "co": "trung",
   "prop": [{"ten": "cua-so", "x": 0.15, "y": 0.45, "co": 0.9}, {"ten": "dong-ho", "x": 0.85, "y": 0.2, "co": 0.8}],
   "dien": [{"kieu": "nam", "x": 0.5, "dang": "cuiNguoi", "mat": "nham", "mieng": "thang",
             "act": [{"tai": 0, "dang": "cuiNguoi", "mat": "nham"},
                     {"tai": 0.8, "dang": "gaiDau", "mat": "chan", "mieng": "thang"},
                     {"tai": 1.5, "dang": "dung", "mat": "nho", "nhin": 0.8}]}]},

  {"say": "Đồng hồ chỉ bảy giờ mười lăm", "loai": "dac-ta", "co": "sat", "sfx": "tick",
   "prop": [{"ten": "dong-ho", "x": 0.5, "y": 0.85, "co": 2.2}],
   "chu": [{"noi_dung": "7:15", "kieu": "kem", "vi_tri": "duoi", "tai": 0.3}]},

  {"say": "Bảy giờ mười lăm.", "loai": "phan-ung", "co": "can",
   "prop": [{"ten": "giot-mo-hoi", "x": 0.63, "y": 0.42, "co": 1, "tai": 0.2}],
   "dien": [{"kieu": "nam", "x": 0.5, "mat": "soc", "mieng": "o",
             "act": [{"tai": 0, "mat": "soc", "mieng": "o"}, {"tai": 0.4, "mat": "soc-lon", "mieng": "hoang", "moHoi": true}]}]},

  {"say": "Xe buýt bảy giờ", "loai": "chu", "sfx": "vine-boom",
   "chu": [{"noi_dung": "XE BUÝT: 7:00.", "kieu": "the", "vao": "phong", "mau": "#c0392b"}]},

  {"tai": 9.4, "loai": "trong", "dai": 0.5, "ghi_chu": "trước ý mới, mốc lấy từ --moc rồi trừ 0.5"}
]
```

Nhịp: TD 0.8 s → minh hoạ 2 s có 2 snap → đặc tả 1 s → phản ứng 0.6 s → thẻ đỏ → trắng.
Rời TD ngay câu thứ hai vì lời chuyển sang sự kiện.

### 9b. Đối thoại hai người (thầy và học sinh, cỡ `can`)

Lời: *"Thầy hỏi: bài đâu. Tôi bảo: ở nhà. Thầy hỏi: nhà đâu. Tôi im."*

```json
[
  {"say": "Thầy hỏi", "loai": "minh-hoa", "co": "can", "sfx": "pop",
   "prop": [{"ten": "ban-giao-vien", "x": 0.28, "y": 1.45, "co": 0.7}],
   "dien": [{"kieu": "thay", "x": 0.28, "dang": "khoanhTay", "mat": "khe", "may": "tuc", "mieng": "thang",
             "act": [{"tai": 0, "dang": "khoanhTay"}, {"tai": 0.5, "dang": "chi", "mieng": "gat"}]},
            {"kieu": "nam", "x": 0.72, "dang": "dung", "mat": "soc", "mieng": "mim", "flip": true}]},

  {"say": "bài đâu", "loai": "chu", "sfx": "ding",
   "dien": [{"kieu": "thay", "x": 0.2, "co": 0.85, "dang": "chi", "mat": "khe", "may": "tuc", "noi": true}],
   "chu": [{"noi_dung": "Bài đâu.", "kieu": "the", "vao": "tung-tu", "vi_tri": "phai"}]},

  {"say": "Tôi bảo", "loai": "phan-ung", "co": "can",
   "dien": [{"kieu": "nam", "x": 0.5, "mat": "soc", "mieng": "mim", "nhin": -0.6,
             "act": [{"tai": 0, "nhin": -0.6}, {"tai": 0.45, "nhin": 0.6, "moHoi": true}]}]},

  {"say": "ở nhà", "loai": "chu",
   "dien": [{"kieu": "nam", "x": 0.8, "co": 0.85, "dang": "gaiDau", "mat": "cham", "mieng": "meu", "flip": true}],
   "chu": [{"noi_dung": "ở nhà.", "kieu": "the", "vao": "tuc-thi", "vi_tri": "trai"}]},

  {"say": "nhà đâu", "loai": "minh-hoa", "co": "can", "sfx": "suspense",
   "dien": [{"kieu": "thay", "x": 0.28, "dang": "chi", "mat": "khe", "may": "tuc", "mieng": "gat",
             "act": [{"tai": 0, "dang": "chi"}, {"tai": 0.6, "dang": "tayHong", "mat": "nham", "mieng": "mim"}]},
            {"kieu": "nam", "x": 0.72, "dang": "epNguc", "mat": "soc-lon", "mieng": "o", "flip": true, "moHoi": true}],
   "chu": [{"noi_dung": "nhà đâu?", "kieu": "kem", "vi_tri": "tren", "tai": 0.2}]},

  {"say": "Tôi im", "loai": "tieu-canh", "co": "nho", "sfx": "deflate",
   "dien": [{"kieu": "nam", "x": 0.5, "dang": "cuiNguoi", "mat": "cham", "mieng": "thang", "moHoi": true}],
   "chu": [{"noi_dung": "...", "kieu": "tay", "vi_tri": "canh-dau", "tai": 0.5}]},

  {"tai": 8.2, "loai": "trong", "dai": 1.0, "ghi_chu": "im hình sau câu chốt"}
]
```

Cách dựng đối thoại: **hai người cùng khung một lần** (thiết lập), rồi mỗi câu
thoại là một shot `chu` hoặc `phan-ung` riêng, đảo bên: thầy bên trái (x 0.2–0.28),
Nam bên phải (x 0.72–0.8, `flip: true` để quay mặt vào). Chữ đặt về **phía trống**
đối diện người nói. Không ai `noi` khi người kể đang đọc lời dẫn; chỉ đánh
`noi: true` cho nhân vật khi câu đó là thoại của họ và bạn muốn miệng nhép.

### 9c. Đám đông + punchline

Lời: *"Cả lớp quay lại nhìn tôi. Bốn mươi cái đầu. Cùng một lúc. Và thằng Long."*

```json
[
  {"say": "Cả lớp quay lại nhìn tôi", "loai": "dong-nguoi", "co": "rong", "sfx": "whoosh-short",
   "prop": [{"ten": "day-ban-lop", "x": 0.5, "y": 0.86, "truoc": true}],
   "dien": [
     {"kieu": "trang", "x": 0.12, "co": 0.8, "dang": "ngoi", "toc": {"mau": "#5a3b1e", "mai": "ngang", "lon": 2, "sau": "bob"},
      "act": [{"tai": 0, "dang": "ngoi"}, {"tai": 0.3, "flip": true, "mat": "cham", "nhin": 1}]},
     {"kieu": "trang", "x": 0.23, "co": 0.8, "dang": "ngoi", "toc": {"mau": "#1c1a22", "mai": "lech-phai", "lon": 0, "sau": "ngan"},
      "act": [{"tai": 0, "dang": "ngoi"}, {"tai": 0.35, "flip": true, "mat": "cham", "nhin": 1}]},
     {"kieu": "trang", "x": 0.34, "co": 0.8, "dang": "ngoi", "act": [{"tai": 0, "dang": "ngoi"}, {"tai": 0.3, "flip": true, "mat": "cham", "nhin": 1}]},
     {"kieu": "trang", "x": 0.45, "co": 0.8, "dang": "ngoi", "act": [{"tai": 0, "dang": "ngoi"}, {"tai": 0.4, "flip": true, "mat": "cham", "nhin": 1}]},
     {"kieu": "trang", "x": 0.56, "co": 0.8, "dang": "ngoi", "act": [{"tai": 0, "dang": "ngoi"}, {"tai": 0.3, "flip": true, "mat": "cham", "nhin": 1}]},
     {"kieu": "trang", "x": 0.67, "co": 0.8, "dang": "ngoi", "toc": {"mau": "#2b1a12", "mai": "lech-trai", "lon": 2, "sau": "dai"},
      "act": [{"tai": 0, "dang": "ngoi"}, {"tai": 0.35, "flip": true, "mat": "cham", "nhin": 1}]},
     {"kieu": "trang", "x": 0.78, "co": 0.8, "dang": "ngoi", "act": [{"tai": 0, "dang": "ngoi"}, {"tai": 0.3, "flip": true, "mat": "cham", "nhin": 1}]},
     {"kieu": "nam", "x": 0.9, "co": 0.8, "dang": "ngoi", "mat": "soc", "mieng": "meu",
      "act": [{"tai": 0, "dang": "ngoi"}, {"tai": 0.8, "mat": "soc-lon", "mieng": "o", "moHoi": true}]}
   ]},

  {"say": "Bốn mươi cái đầu", "loai": "dac-ta", "co": "sat", "sfx": "pop-high",
   "dien": [{"kieu": "trang", "x": 0.3, "co": 0.9, "mat": "cham", "mieng": "thang"},
            {"kieu": "trang", "x": 0.7, "co": 0.9, "mat": "cham", "mieng": "thang", "toc": {"mau": "#5a3b1e", "mai": "ngang", "lon": 2, "sau": "bob"}}],
   "chu": [{"noi_dung": "× 40", "kieu": "kem", "vi_tri": "tren"}]},

  {"say": "Cùng một lúc", "loai": "phan-ung", "co": "can",
   "prop": [{"ten": "giot-mo-hoi", "x": 0.63, "y": 0.42, "co": 1}],
   "dien": [{"kieu": "nam", "x": 0.5, "mat": "soc-lon", "mieng": "o", "moHoi": true}]},

  {"tai": 15.2, "loai": "trong", "dai": 0.5},

  {"say": "Và thằng Long", "loai": "chu", "sfx": "rimshot",
   "dien": [{"kieu": "long", "x": 0.2, "co": 0.9, "dang": "cheMieng", "mat": "khe", "mieng": "smirk"}],
   "chu": [{"noi_dung": "Và thằng Long.", "kieu": "the", "vao": "tung-tu", "vi_tri": "phai"}]}
]
```

Đám đông: 7 `trang` + người kể ở cuối hàng; `act` lệch 0.3/0.35/0.4 s tạo
sóng quay đầu; đặc tả hai đầu trắng + chữ "× 40" thay cho vẽ 40 người; phản
ứng 0.6 s; trắng; thẻ punchline có nhân vật nhỏ bên trái và chữ bên phải.

## 10. Danh sách soát trước khi chạy `kiem-tra-v2`

- [ ] Mỗi câu ngắn trong `vo` có ít nhất một shot; punchline có `chu` hoặc `dac-ta` hoặc `trong` sau nó
- [ ] Không đoạn `truc-dien` nào > 3 s hoặc > 2 shot liền; TD luôn x 0.72
- [ ] Mọi shot > 1.5 s có nhân vật đều có ≥ 1 mốc `act`
- [ ] Nhân vật không nói có `mieng`; nhân vật khác người kể không dùng `mat: oval`
- [ ] Người ngồi có bàn `truoc: true`; prop treo tường đúng `y` theo bảng §2
- [ ] Chữ nằm phía trống, không đè nhân vật
- [ ] `trong` có `tai` = mốc kế − `dai` (lấy từ `--moc`)
- [ ] Mỗi chương có `nhac` (nhóm `vui_nhon` cho hài), đổi bài giữa các chương
- [ ] Prop chỉ là vật câu đang nhắc; thiếu prop thì ghi `ghi_chu`
