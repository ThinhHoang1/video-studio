# Kiến trúc V2

## Vấn đề cốt lõi vẫn là: hình phải khớp lời

V1 giải bằng cách neo cảnh vào câu (`say` → frame). V2 giữ nguyên nguyên tắc đó
và sửa ba thứ V1 làm sai so với storytime thật (đo trong
`docs/nghien-cuu-storytime.md`): **nhịp** (V1 trung vị 7.4 s/shot, tham chiếu
1.42 s), **chuyển động** (V1 tween liên tục theo giọng, tham chiếu snap 1 khung
+ hold), **thẩm mỹ** (V1 19 màu + cảnh đầy, tham chiếu trắng + nét + 1 màu tóc).

```
kịch bản ──TTS──▶ mp3 ──analyze-voice──▶ voice.json (am/nhan/nghi mỗi frame)
                     └──lipsync (Rhubarb)──▶ mouth.json (hình miệng mỗi frame)
board.json ──du-lieu.ts──▶ shot có from/len ──san-khau.tsx──▶ SVG mỗi frame ──Remotion──▶ mp4
```

## Đường đi của một shot

```
{"say": "Thằng Long ngồi cạnh", "loai": "minh-hoa", ...}
        │  src/v2/phim/du-lieu.ts::taoNeoTu
        │  thường hoá lời bình + say → vị trí ký tự p = 0.72 của chương
        │  rải p lên danh sách frame ĐANG NÓI (voice.nghi = false) → frame 472
        ▼
        │  sắp mọi shot theo frame; shot kế bắt đầu → shot này kết thúc
        │  shot có `dai` ngắn hơn khoảng hở → chèn shot `trong` vào phần hở
        │  hai mốc cách nhau < 8 frame → gộp (validator đã báo trước)
        ▼
        │  src/v2/phim/san-khau.tsx tại frame f của shot:
        │    trạng thái diễn viên = prop gốc ⊕ mọi act có tai ≤ f/30   (snap, không nội suy)
        │    miệng người `noi` = mouth.frames[frameChương]              (lip-sync đè mieng cảm xúc)
        │    prop vẽ nếu tai ≤ t; prop `truoc` vẽ sau nhân vật
        │    chữ vẽ nếu tai ≤ t; tung-tu theo cụm lời; phong scale tuyến tính 10 frame
        ▼
      <AbsoluteFill> nền #fdfdfd + <svg> + chữ HTML
```

**Vì sao neo ở cấp từ, không cấp cụm phụ đề.** Tham chiếu có 89% mốc cắt cách
đầu một từ ≤ 0.15 s và 2/3 số cắt rơi giữa câu. Neo V1 (`neo.ts`) làm tròn về
đầu cụm 7 từ nên nhiều `say` liền nhau rơi cùng frame và bị gộp: đo trên
demo-v2 mất 26/77 shot. `taoNeoTu` rải theo ký tự lên **frame đang nói** (bỏ
`nghi`) vì giọng ngắt hơi 6–30% thời lượng; chia đều theo thời gian lệch tới
0.5 s. `pipeline/kiem-tra-v2.mjs` và `thong-ke-board.mjs` dùng **cùng công thức**
để validator và renderer ra cùng mốc.

**Neo hỏng phải ồn ào.** `dungChuong()` in `[board <id>] không neo được` lúc
build; validator chặn trước đó với tên shot cụ thể.

## Lip-sync: đổi hình, không scale

`pipeline/lipsync.mjs`: mp3 → WAV 16 kHz mono (ffmpeg của Remotion) → Rhubarb
`-r phonetic --extendedShapes GHX` → cue → quantize về lưới 30 fps (mỗi ô lấy
hình chiếm nhiều thời gian nhất, không lấy mẫu điểm) → `frames: "XXBBCAAX…"`.
Rig `mieng.tsx` chỉ tra bảng theo ký hiệu; `bien` 0/1 đảo theo lượt lặp để hai
frame liền không y hệt.

Đo trên tiếng Việt (`docs/tham-chieu/lipsync.md`): ~6.7 cue/giây nói, khớp nhịp
câu 100% (X trùng `nghi`), đúng ~60% cấp âm vị, chạy 11× thời gian thực, kết
quả **không xác định** giữa các lần chạy (cache theo vân tay mp3, không so
bit-exact). Không có Rhubarb thì `miengTaiFrame` rơi về 3 hình theo biên độ
`am` — xấu hơn hẳn, chỉ là dự phòng.

Đầu **không** gật theo `nhan`, mắt **không** chớp: tham chiếu đo 0 chớp / 519
frame cận cảnh, std vị trí đầu ≤ 0.09 px. V1 có ba tầng chuyển động theo giọng;
V2 bỏ hết, chỉ giữ cử chỉ tự động **đổi theo nhịp câu** (hash theo cụm) cho
người kể khi không có `act`.

## Rig: đơn vị DAU, không transform scale

`src/v2/rig/hinh.ts`: mọi kích thước là hệ số nhân **DAU = bề rộng sọ**; rig
nhân với DAU px lúc vẽ nên toạ độ ra px thật và **độ dày nét luôn đúng px**
(`net = max(4.5, 0.015 × DAU)`). Nhân vật chính cao 2.6 DAU, nhân vật phụ
(`khung: 'phu'`) 3.6 DAU. Cỡ cảnh (`CO_CANH`) chỉ là DAU + vị trí chân:
`nho` 110 / `rong` 200 / `trung` 330 / `can` 560 / `sat` 900.

Tư thế (`tu-the.ts`) là **góc khớp tuyệt đối** cho hai tay, thân, đầu, chân;
không có "chuyển động", chỉ có trạng thái. `act[].tai` đổi trạng thái tức thời.

Da, áo, quần không tô (cùng màu nền); mỗi nhân vật một màu tóc + tối đa một
phụ kiện. Nhân vật phụ vô danh `trang`: đầu trắng không mặt, tóc tuỳ chọn.

## Schema board là nguồn duy nhất

`src/v2/board/kieu-board.ts` định nghĩa `Board → BoardChuong → Shot → DienVien /
Prop / Chu / Insert / HanhDong`. `pipeline/thu-vien-v2.mjs` **đọc mã nguồn**
(regex trên `KIEU`, `TU_THE`, union type mắt/miệng, `PROP_TEN`, `LoaiShot`,
`CO_CANH`) sinh `thu-vien-v2.json`, nên thêm một tư thế là danh mục tự cập
nhật; `PROPS: Record<TenProp, …>` khiến thiếu prop là `tsc` đỏ.

Bốn trường **đã có trong schema nhưng renderer chưa đọc**: `HanhDong.goc` /
`DienVien.goc` (góc nhìn), `cam` (prop cầm tay), `DienVien.mau` + `mau_tham_so`
(mẫu hành động sinh act), `Shot.boi_canh` (bối cảnh bung thành prop). Board
ghi được ngay; hiệu lực khi lead nối `san-khau.tsx`.

## Validator và thống kê

`pipeline/kiem-tra-v2.mjs` chặn: tên ngoài thư viện, `say` không nguyên văn,
shot < 0.25 s, hai shot cùng frame, chương thưa hơn 1 shot / 2.5 s, `truc-dien`
không đúng một người `noi`, insert mất ảnh, lời sửa chưa đọc lại, mouth.json
cũ. Cảnh báo: TD liên tục > 7 s, thứ tự shot lệch thời gian, `trong` không `dai`.

`pipeline/thong-ke-board.mjs` không chặn, so với tham chiếu: s/shot 1.0–1.6,
≥ 30% shot < 1 s, TD ≤ 20%, ≥ 1 chữ / 15 s, trắng 5–10%, trung vị ≤ 1.8 s,
shot dài nhất ≤ 8 s, TD liền ≤ 7 s, một nhịp trắng ≤ 3.6 s; đếm prop, góc
nhìn, mẫu hành động, loại shot, nhân vật, act/shot, sfx, insert.

## Render chia đoạn

Render một mạch dài chết giữa chừng ở frame ngẫu nhiên (Chrome nghẽn khi chạy
song song lâu, không phải cảnh nặng). `render-segments.sh` cắt 700–900 frame
một đoạn, mỗi đoạn một tiến trình Chrome, đoạn xong bỏ qua khi chạy lại, ghép
bằng ffmpeg concat. Tổng frame tính từ manifest theo bảng `map` (V2: intro 2 s
+ đệm 0.4 s/chương, khớp `DEM_CHUONG` trong `du-lieu.ts`), không hỏi Remotion
vì `compositions` phải bung Chrome. Cache khoá theo vân tay `src/` + `scripts/`.

Đo: ~17 khung/s ở 1080p; sàn là chụp khung của Chrome, không phải độ phức tạp
SVG (10 tới 3000 path cùng tốc độ).

## Vân tay nội dung

Mỗi mp3 kèm `.sig` = sha1(voice + style + vo). Sửa lời là chương đó đọc lại.
`mouth.json` kèm `sig` = sha1(mp3) + version rhubarb + tham số. Validator so
`duration` mouth với mp3 để bắt file cũ.

## V1 còn lại

`src/engine/` (neo cụm, phụ đề, cues), `src/library/` (rig cũ, 34 cảnh SVG),
`src/projects/tinh-dau`, `src/projects/ra-truong`, `pipeline/kiem-tra.mjs`,
`thu-vien.json`. Giữ để render lại `TinhDau`, `RaTruongVui`, `RaTruongBuon`.
V2 dùng lại từ V1: `FPS = 30` (`engine/theme.ts`), `splitCues`/`cueTimings`
(chia cụm cho phụ đề và chữ `tung-tu`), `Sub` (phụ đề nhỏ dưới đáy), `FONT`
(Be Vietnam Pro), thư viện sfx/nhạc. Không dựng video mới bằng V1.

## Ràng buộc môi trường

- ffmpeg đi kèm Remotion là bản rút gọn: không filter `fps`, `tile`, `highpass`,
  không muxer `s16le` ra stdout → PCM đi vòng qua WAV tạm. Chạy phải đặt
  `DYLD_LIBRARY_PATH` trỏ vào chính thư mục của nó.
- Remotion không tải được Chrome headless ở máy này → mọi lệnh render/still
  trỏ `--browser-executable` vào Chrome hệ thống.
- Rhubarb chỉ có binary x86_64 → Rosetta 2; chỉ đọc WAV/OGG; cần `res/sphinx/` 82 MB.
- `zsh` đánh chỉ số mảng từ 1. `urllib` của Python thiếu CA → tải bằng `curl`.
