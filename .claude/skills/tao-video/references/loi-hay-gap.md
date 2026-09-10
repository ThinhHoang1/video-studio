# Lỗi hay gặp khi viết board.json và cách validator bắt

Chạy `node pipeline/kiem-tra-v2.mjs <ten>` sau mỗi lần sửa. `✗` chặn render,
`⚠` không chặn nhưng gần như luôn là lỗi thật. Bảng dưới xếp theo tần suất
agent mắc.

## Lỗi neo và tên (validator chặn)

| Triệu chứng | Validator in | Nguyên nhân | Sửa |
|---|---|---|---|
| Shot không xuất hiện, hoặc rơi nhầm chỗ | `chương "x": mốc "..." không có trong lời bình` | `say` không **nguyên văn** trong `vo` (thừa/thiếu một từ, dấu, viết hoa khác vẫn qua vì đã thường hoá; nhưng đổi từ thì không) | copy-paste đúng cụm từ trong `vo`, 2–6 từ đặc trưng. Sửa `vo` thì phải sửa `say` |
| Hai shot cùng khung | `hai shot cùng mốc (12.3s)` | hai `say` là cùng một cụm, hoặc `say` quá phổ biến ("tôi") khớp cùng chỗ | chọn cụm khác, dài hơn một từ, hoặc gộp hai shot |
| Shot nhảy lùi thời gian | `⚠ chỉ thấy ở TRƯỚC shot trước — shot lùi thời gian` | `say` lặp trong chương (validator dò tiến; mốc thứ hai không tìm thấy nên quay lại mốc đầu) | thêm từ liền trước/sau để cụm duy nhất, hoặc đảo thứ tự shot theo lời |
| Thứ tự lệch | `⚠ thứ tự shot trong file (1,2,4,3) khác thứ tự thời gian` | viết shot không theo dòng lời | sắp lại theo thứ tự `vo`; renderer sắp theo mốc nên vẫn chạy, nhưng khó đọc |
| Tên lạ | `tư thế "ngoiXuong" không có trong thư viện` / `prop 2 "ban-an" không có` / `sfx "bonk"` / `nhạc "funk"` | tự nghĩ tên | tra `thu-vien-v2.json`: tư thế camelCase (`haiTayXoe`, `motTayHong`, `chongCam`), prop và mắt/miệng kebab-case (`day-ban-lop`, `soc-lon`, `cuoi-toe`), nhạc là tên file không đuôi (`25-silly-fun`) |
| Nhân vật sai | `nhân vật "hoa" không có trong thư viện. Chọn: nam, ha, long, mai, me, thay, nam-lon, ha-lon, trang` | đặt tên theo kịch bản | người có rig: 8 tên đó; ai khác dùng `trang` (+ `toc` nếu muốn nhận diện) |
| Board nhầm dự án | `board.du_an = "x" nhưng kịch bản thuộc dự án "y"` | `du_an` không bằng `project` trong kịch bản | sửa cho khớp |
| Chương thừa/thiếu | `⚠ kịch bản có chương "ket" nhưng bảng phân cảnh không có` | quên chương, hoặc sai `id` | mỗi chương trong `chapters` cần một mục trong `chuong` cùng `id` |

## Lỗi cấu trúc shot (validator chặn)

| Triệu chứng | Validator in | Sửa |
|---|---|---|
| Trực diện nhiều người, không ai nói | `truc-dien có 2 diễn viên nhưng không ai đánh dấu noi: true` | thêm `"noi": true` cho đúng **một** người. Một diễn viên thì tự coi là nói |
| Hai miệng nhép | `truc-dien có 2 diễn viên noi` / `⚠ 2 diễn viên cùng noi — hai miệng cùng nhép một giọng` | bỏ `noi` ở người kia. Cho họ `mieng` cảm xúc (`thang`, `cuoi-nhe`) |
| Shot quá ngắn | `shot 7 "Xoá": chỉ 0.18s (< 0.25s)` | hai `say` quá sát trong lời (dưới 8 khung). Gộp vào shot trước, hoặc bỏ shot |
| Chương thưa | `18 shot / 60.0s = 3.3s mỗi shot — cần ≥ 1 shot mỗi 2.5s` | thêm `phan-ung`, `chu`, `trong` giữa các ý; chương 20 s cần 14–20 shot |
| Thiếu neo | `thiếu say hoặc tai — không biết neo vào đâu` | shot `trong`/`insert` phải có `tai` (giây từ đầu chương) hoặc `say` |
| `tai` vượt chương | `tai=25s vượt thời lượng chương 21.4s` | đọc lại thời lượng chương trong `--moc` |
| Chữ rỗng | `loại chu nhưng không có chu` / `chữ 1 thiếu noi_dung` | thêm mảng `chu` |
| Insert mất ảnh | `không có public/meme/xxx.jpg` | tên ảnh phải có trong `public/meme/` (ls để xem). Không tự thêm ảnh |
| Lời sửa chưa đọc lại | `lời bình đã sửa nhưng chưa đọc lại (manifest lệch kịch bản)` | chạy lại `tts-gemini`, `analyze-voice`, `lipsync` |
| mouth.json cũ | `⚠ mouth.json 19.3s lệch mp3 21.4s` / `chưa có lip-sync` | `node pipeline/lipsync.mjs <ten>` |

## Lỗi nhịp (validator cảnh báo, thong-ke-board bắt)

| Triệu chứng | Công cụ in | Sửa |
|---|---|---|
| Nói trực diện quá lâu | `⚠ nói trực diện liên tục 8.2s (> 7s) — rời sang minh hoạ` | cắt đoạn TD thành: TD 1–2 s → `minh-hoa` → `phan-ung` → TD. Mỗi đoạn TD ≤ 3 s |
| Nhịp trắng không có `dai` | `⚠ nhịp trắng không có dai — sẽ kéo tới mốc sau` | thêm `"dai": 0.5`; chỉ cố ý bỏ khi shot kế nối ngay (như "Im lặng" neo bằng `say`) |
| Nhịp trắng đặt lệch | `⚠ dai=0.5s nhưng shot sau tới sau 0.12s — bị cắt` hoặc trắng rơi giữa câu đang nói | `tai` của `trong` phải = mốc shot kế **trừ** `dai`. Đọc mốc bằng `kiem-tra-v2 --moc`, ví dụ shot kế 15.74 s → `{"tai": 15.23, "dai": 0.5}`. Sửa `vo` xong mốc trôi: đặt lại |
| s/shot > 1.6 | `⚠ giây / shot 2.10 · quá thưa` | thêm shot ngắn: `phan-ung` 0.5 s trước punchline, `chu` cho câu chốt, `trong` 0.4 s trước câu mới |
| < 30% shot dưới 1 s | `⚠ shot dưới 1 s 18%` | dùng `chu` kiểu `nhan` 0.4–0.8 s cho liệt kê, `phan-ung` 0.5 s, nháy `trong` 0.3 s |
| Trắng < 5% | `⚠ nhịp trắng 2.1%` | thêm `trong` 0.4–0.6 s trước mỗi ý mới, 0.9–1.5 s sau câu chốt |
| Chữ ít | `⚠ chữ mỗi 15 s 0.6` | mỗi punchline một `chu` `the`; mỗi vật/người mới một `nhan`; câu ngắn của nhân vật khác thành `kem`/`tay` |

## Lỗi bố cục (validator không bắt, chỉ lộ ở still)

| Thấy trên still | Nguyên nhân | Sửa |
|---|---|---|
| Chữ đè lên mặt nhân vật | `the` mặc định `vi_tri: giua`, `kem` mặc định `trai`; nhân vật lại đứng ở đó | nhân vật bên trái (x ≤ 0.35) → chữ `vi_tri: "phai"`; nhân vật `truc-dien` x 0.72 → chữ `trai` (mặc định của `kem`) hoặc `canh-dau`. Shot `chu` có nhân vật nhỏ: đặt nhân vật x 0.2 `co: 0.8` và chữ `phai` |
| Người ngồi lòi chân qua bàn | bàn vẽ **sau** nhân vật | prop bàn thêm `"truoc": true` (bàn che chân). Người đứng cạnh bàn thì bỏ `truoc` |
| Bảng đen / đồng hồ / cửa sổ lơ lửng hay chìm | `y` là **tâm đáy** prop theo tỉ lệ khung; prop treo tường cần y nhỏ | đã kiểm trên demo-v2 (cỡ `trung`): `bang-den` y 0.30–0.36, `dong-ho` y 0.18–0.20 x 0.9 co 0.7–0.8, `cua-so` y 0.5 x 0.1. Cỡ `rong`: `bang-den` y 0.3, `day-ban-lop` y 0.86. Đặc tả `sat`: `bang-den` y 0.92 co 2.2, `sach` y 0.9 co 2.4, `but` y 0.7 co 2 |
| Bàn cắt lửng giữa khung | y bàn theo cỡ `trung` (chân bàn dưới mép) | `ban-hoc` y 1.02 ở `trung`, 1.4 ở `can`, `day-ban-lop` y 0.86 ở `rong` |
| Prop bé tí hoặc khổng lồ | `co` nhân theo cỡ cảnh (`dau/330`): cùng `co: 1` ở `rong` = 0.6×, ở `can` = 1.7×, ở `sat` = 2.7× so với `trung` | ở `can` giảm `co` 0.6–0.8 (bút 0.8), ở `sat` tăng 2–2.4 khi muốn đầy khung |
| Hai người nhìn ra ngoài | flip tự động: nhân vật x > 0.5 quay mặt sang trái (vào giữa) ở mọi loại trừ `truc-dien` | muốn khác thì đặt `flip` và `nhin` tay; `nhin: -1` liếc trái, `1` liếc phải |
| Nhân vật phụ có mắt oval như người kể | quên `mat` cho `trang`/nhân vật có tên | `trang` mặc định không mặt (đúng); nhân vật có tên khác người kể dùng `mat: "nho"` hoặc `"cham"`; `oval` chỉ cho người kể |
| Người kể đứng giữa khung khi trực diện | `x: 0.5` | `truc-dien` luôn x 0.72 (nửa trái trống cho chữ) |
| Đám đông đứng, không ngồi | thiếu `dang: ngoi` từng người | mỗi `trang` trong `dong-nguoi`: `dang: "ngoi"`, `co: 0.8`, x cách 0.11 (8 người 0.12→0.9), `day-ban-lop` `truoc: true` |
| Mọi thứ đứng yên cả shot dài | shot 2 s không `act` | thêm 1–2 mốc `act` (0.4–1.5 s), snap tư thế/mắt/nhin |

## Lỗi ngoài board

| Triệu chứng | Sửa |
|---|---|
| `npx tsc` đỏ sau khi thêm `phim.tsx` | tên import file data phải đúng `<ten>.generated.json` / `.voice.json` / `.mouth.json`; `board.json` phải là JSON hợp lệ (không comment, không dấu phẩy cuối) |
| Composition không thấy | chưa thêm `<Composition id=...>` vào `src/Root.tsx`, hoặc `id` trùng |
| Video ngắn hơn audio, cụt cuối | quên thêm dòng vào bảng `map` trong `render-segments.sh` (intro 2.0, đệm 0.4) |
| Render ra bản cũ | không xảy ra: cache khoá theo vân tay `src/` + `scripts/`; nếu nghi thì xoá `out/.seg-<Comp>-*` |
| `429` khi TTS | hết hạn mức key × model; thêm key vào `.env` hoặc chờ ngày sau. Chương đã đọc được giữ lại |
| `Không thấy rhubarb` | làm theo `tools/README.md`; cần Rosetta 2 |
| Still đen / rỗng | `--frame` rơi vào intro (< 60) hoặc vượt tổng; tính lại theo công thức trong SKILL.md bước 8 |
