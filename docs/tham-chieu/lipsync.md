# Kiểm chứng lip-sync tự động cho tiếng Việt trên máy này (Rhubarb Lip Sync)

Máy: Apple M4, 10 nhân, arm64, macOS 24.6.0. Repo đích: `/Users/leanhvu/video-studio` (Remotion, `FPS = 30` trong `src/engine/theme.ts`; `pipeline/analyze-voice.mjs` cũng 30fps). Không sửa file nào trong repo; mọi thứ nằm ở `…/scratchpad/ref-oV/tools/`.

## 1. Cài đặt

| Bước | Kết quả đo |
|---|---|
| `brew search rhubarb` / `brew info rhubarb-lip-sync` | không có formula ("No available formula with the name") |
| Tải release GitHub | v1.14.0 (2025-04-03), `Rhubarb-Lip-Sync-1.14.0-macOS.zip` 86.870.942 byte |
| Giải nén | `tools/Rhubarb-Lip-Sync-1.14.0-macOS/` — binary `rhubarb` 8,0 MB **Mach-O x86_64** (không có bản arm64), `res/` 82 MB (mô hình PocketSphinx), `extras/` (AE, Spine, Vegas) |
| Quarantine | `xattr -rd com.apple.quarantine .` xong chạy ngay |
| `rhubarb --version` | `Rhubarb Lip Sync version 1.14.0`, exit 0 — chạy qua **Rosetta 2** (`pgrep oahd` có, `arch -x86_64 true` OK). Máy mới cần `softwareupdate --install-rosetta` |
| Chỉ binary, bỏ `res/` | **Lỗi** `could not find resource file …/res/sphinx/cmudict-en-us.dict` — recognizer `phonetic` vẫn cần `res/sphinx/` (≈82 MB), không đóng gói 8 MB được |
| Đọc mp3 trực tiếp | **Không**: `Could not open sound file` — chỉ WAV/OGG |

## 2. Chuyển WAV

`cho-ngoi.mp3` (Gemini TTS Charon, mp3 48 kHz mono 160 kbps, 33,384 s) → ffmpeg Remotion `-ac 1 -ar 16000 -c:a pcm_s16le` → `cho-ngoi.16k.wav` 33,36 s, 1.067.598 byte. Tương tự `cay-but` (53,84 s) và cả 14 chương (`tools/all14/*.wav`). WAV 48 kHz không resample cũng chạy (3,07 s) nhưng kết quả khác 8,6 % frame so với 16 kHz → chốt 16 kHz mono làm chuẩn.

## 3. Chạy `rhubarb -r phonetic -f json --extendedShapes GHX`

### Thời gian
| Input | real | user | ghi chú |
|---|---|---|---|
| cho-ngoi 33,36 s | **2,95 s** | 4,71 s | ≈11× nhanh hơn thời gian thực |
| cay-but 53,84 s | 4,36 s | 6,63 s | |
| cho-ngoi `--threads 1` | 2,67 s | | đa luồng không lợi trên Rosetta |
| cho-ngoi `-r pocketSphinx` (đối chứng) | 16,53 s | 60,82 s | chậm 5,6×, khác 34,4 % frame vs phonetic |
| **14 chương** (612,9 s audio), ffmpeg + rhubarb tuần tự | **56,9 s** | | riêng rhubarb 54,5 s trong prototype |

### Số cue (cho-ngoi)
- 162 cue, 149 cue nói (≠X), thời gian nói 22,10 s (66,2 %), X 11,26 s.
- **6,74 cue/giây nói**, 4,86 cue/giây tổng.
- Độ dài cue nói: min 0,04 s · median 0,11 s · mean 0,148 s · max 0,77 s.
- Phân bố (số cue / % thời lượng): A 26 / 8,0 % · B 50 / 27,8 % · C 17 / 5,7 % · D 1 / 0,4 % · E 17 / 7,2 % · F 34 / 16,0 % · G 3 / 0,8 % · H 1 / 0,4 % · X 13 / 33,8 %.
- Chuyển tiếp hay gặp: F→B 19, B→A 16, B→F 15, C→B 10, X→B 9, B→X 9, E→F 9.

### Gộp 14 chương tinh-dau (`tools/all14/_tong.json`)
- 2726 cue; nói 372,1 s (61 %); **6,63 cue/giây nói**.
- Độ dài cue nói: min 0,02 · p10 0,07 · **median 0,12** · p90 0,28 · max 1,75 s.
- Cue ngắn hơn 1 frame: **@30fps 0,3 %** · **@24fps 2,6 %** · **@12fps 44,6 %**.
- % thời gian nói: **B 38,2 · C 19,9 · F 16,2 · E 10,7 · A 10,5 · D 2,2 · G 1,1 · H 1,1**; X = 39,3 % tổng thời lượng.
- Nhận xét: D (mở to) chỉ 2,2 % và H/G ≈1 % → giọng kể chậm, ít mở to; B chiếm gần 40 % — miệng "hé răng khít" là hình mặc định khi nói.

### Tính lặp lại và tham số
- **Không xác định** (non-deterministic): chạy 5 lần cùng WAV → 162/164/163/163/163 cue; chênh giữa các lần 0–3,2 % frame @24fps (run3 == run4). Hệ quả: phải cache kết quả theo vân tay, không so bit-exact.
- `-d dialog.txt` (lời `vo`) với phonetic: khác 1,6 % — bằng nhiễu lặp lại → **vô nghĩa với phonetic** (đúng README: dialog chỉ giúp pocketSphinx).
- `--extendedShapes ""` (chỉ A–F): thời gian X bị đổ hết vào A (A = 43 %) → mất phân biệt nghỉ/ngậm môi; **phải giữ X**.

Kết quả JSON: `tools/cho-ngoi.phonetic.json`, `tools/cay-but.phonetic.json`, `tools/cho-ngoi.sphinx.json`, `tools/cho-ngoi.phonetic.{AF,dialog,run2..5}.json`, `tools/cho-ngoi.48k.json`, `tools/all14/<id>.json`.

## 4. Đối chiếu shape ↔ lời thoại (cho-ngoi, 0–10 s)

Không có forced-alignment tiếng Việt, nên vị trí âm tiết là **ước lượng**: 87 âm tiết chia đều lên 22,10 s thời gian nói theo 12 đoạn nói của rhubarb (sai số ≈ ±0,15 s). Kịch bản 10 cụm dấu câu ↔ rhubarb 12 đoạn nói (TTS ngắt thêm 2 chỗ). Ảnh: `tools/cho-ngoi.timeline10s.png` (envelope `am` của analyze-voice · dải shape · âm tiết).

```
start   end  dài shape  am   âm tiết ước lượng [kỳ vọng phụ âm đầu/nguyên âm]
 0.00  0.30 0.30  X   0.03
 0.30  0.35 0.05  B   0.06  Năm[B/D]
 0.35  0.54 0.19  C   0.81  Năm            ← mở vừa đúng nguyên âm "ă"
 0.54  0.73 0.19  A   0.85  Năm lớp        ← ngậm môi đúng phụ âm cuối "m"
 0.73  1.10 0.37  B   0.84  lớp mười cô    ← "mười" (m) không ra A
 1.10  1.24 0.14  H   0.95  cô             ← lưỡi lên: nhiều khả năng thuộc "lớp" (l) lệch 0,1 s
 1.24  1.45 0.21  B   0.67  cô chủ
 1.45  2.15 0.70  X   0.09                 ← ngắt sau "Năm lớp mười," đúng dấu phẩy
 2.15  2.32 0.17  E   0.37  chủ nhiệm      ← tròn (u) đúng
 2.32  2.46 0.14  B   0.84  nhiệm
 2.46  2.53 0.07  F   0.64  nhiệm đổi
 2.53  2.74 0.21  B   0.78  đổi
 2.74  2.82 0.08  A   0.90  đổi chỗ
 2.82  3.03 0.21  E   0.73  chỗ            ← tròn (ô) đúng
 3.03  3.24 0.21  F   0.66  chỗ ngồi       ← tròn (ô) đúng
 3.24  3.45 0.21  E   0.86  ngồi cả
 3.45  3.73 0.28  B   0.76  cả lớp
 3.73  4.01 0.28  F   0.62  lớp Cô         ← tròn (ơ/ô) đúng
 4.01  4.08 0.07  B   0.87  Cô đọc
 4.08  5.27 1.19  X   0.10                 ← ngắt câu, khớp dấu chấm
 5.27  5.35 0.08  B F  0.03-0.20  đọc      ← 2 cue 0,04 s trước khi giọng lên
 5.35  5.56 0.21  B   0.85  đọc tên
 5.56  5.64 0.08  A   0.62  tên            ← A ở "tên" (không có m/b/p) — sai
 5.64  5.74 0.10  C   0.47  tên
 5.74  5.81 0.07  B   0.89  tên theo
 5.81  5.89 0.08  A   0.89  theo           ← sai
 5.89  6.06 0.17  E F 0.75  theo danh      ← "eo" tròn dần: đúng
 6.06  6.34 0.28  B   0.75  danh sách
 6.34  6.48 0.14  C B 0.69-0.85 sách
 6.48  7.09 0.61  X   0.17                 ← ngắt sau dấu phẩy
 7.09  7.27 0.18  F   0.21  không          ← chu (ô) đúng
 7.27  7.35 0.08  A   0.81  không
 7.35  7.60 0.25  F   0.70  không theo
 7.60  7.67 0.07  E   0.74  theo ý
 7.67  7.98 0.31  C   0.78  ý ai           ← mở "ai" đúng
 7.98  8.12 0.14  B   0.71  ai
 8.12  9.24 1.12  X   0.07                 ← ngắt câu
 9.24  9.39 0.15  B A 0.02-0.05 Và         ← "V" nên là G, ra B/A
 9.39  9.56 0.17  C   0.56  Và tên
 9.56  9.77 0.21  B   0.69  tên tôi
 9.77  9.85 0.08  A   0.87  tôi            ← sai (t)
 9.85 10.05 0.20  E   0.76  tôi được       ← tròn (ô) đúng
```

### Số đo khớp
- **Mở/đóng theo câu (cấp nhịp): khớp chắc.** X của rhubarb so với `nghi` của `analyze-voice.mjs`: X∩nghi/X = **1,00** (cho-ngoi), 0,99 (cay-but); `nghi` được X phủ 87 %/93 %. `am` trung bình khi X = 0,092/0,066; khi có shape nói = 0,57–0,71; khi H = 0,95/0,87. Frame D/E có `am`>0,5: 88 %/79 %. 12 đoạn nói của rhubarb đều rơi đúng ranh giới dấu câu + 2 ngắt hơi thật của TTS.
- **Cấp âm vị: đúng chiều nhưng yếu.** Âm tiết m/b/p có cue A trong cửa sổ: **64 %** (9/14) so với 40 % (29/73) ở âm tiết khác (+24 điểm). Nguyên âm tròn u/ư/o/ô/ơ có E/F: **80 %** (20/25) so với 65 % (40/62) (+15 điểm). Shape trội trùng lớp kỳ vọng (đóng/hé/mở): 59 % (51/87) — baseline đoán toàn 'hé' đạt 56 %. Nguyên nhân: recognizer phonetic dùng bộ âm vị tiếng Anh + alignment âm tiết chỉ là ước lượng.
- Kết luận nghiệm thu: **đủ cho hoạt hình 2D kiểu Hanna-Barbera/JaidenAnimations** (khán giả không đọc môi từng âm, chỉ cần ngắt đúng nhịp, môi ngậm ở m/b/p và tròn ở u/ô đúng phần lớn); **không đủ cho cận cảnh đặc tả kéo dài**, ở đó phải sửa tay hoặc chờ forced-alignment tiếng Việt.

## 5. Mốc tham chiếu từ video Jaiden (0:36,5–38,5, 48 khung 24fps, `mouth_talk/_mouths_marked.jpg`)
- Pixel-diff vùng miệng: **32 lần đổi hình trong 2 s = 16 đổi/giây**, độ giữ median **1 frame** (23 lần 1 frame, 6 lần 2 frame, 4 lần ≥3 frame). Đầu cũng lắc nhẹ nên diff hơi cao, nhưng soát mắt trên sheet: hình miệng thật sự khác nhau gần như mỗi khung.
- Chỉ dùng ≈5 dạng miệng: (1) vạch ngang hơi lượn (đóng/nghỉ), (2) "quả chuối" dẹt rộng có vạch răng giữa (hé rộng, dùng nhiều nhất), (3) nửa bầu dục to có vạch lưỡi chéo (mở to), (4) bầu dục nhỏ nghiêng (chu/tròn), (5) vạch răng khít có răng cưa (nghiến "ss"). Miệng đặt **lệch một bên má, nghiêng**, thay hình chứ không morph. Rhubarb cho 6,6 cue/s nên "on ones" của rhubarb thưa hơn Jaiden 2,4×; không cần ép thêm — Jaiden là giọng nhanh, tiếng Anh, hài.
- Burst pirate (5:16) crop trúng đoạn nhân vật đi vào khung nên diff đo chuyển động thân, không dùng được để đo miệng.

## 6. Đề xuất ánh xạ shape → miệng SVG (đã vẽ `tools/mieng9.svg`, render `tools/mieng9.png`)
Hệ toạ độ theo `src/library/cast/dien.tsx` (đầu ở gốc, miệng quanh `(0,52)`, rộng 40–52, nét `L4`, màu khoang `#7a2b3a`):

| Shape | % thời gian nói | Hình học |
|---|---|---|
| X nghỉ | (39 % tổng) | đường cong mỉm thả lỏng `M-20,52 q20,10 40,0`, fill none — chính là miệng `sac` hiện có |
| A ngậm m/b/p | 10,5 | vạch thẳng hơi cong xuống, nét dày 6 (môi mím), hai nếp nhỏ `l4,4` ở mép |
| B hé, răng khít | 38,2 | hình thoi dẹt `q24,-9 48,0 q-24,11 -48,0`, fill trắng, vạch răng ngang ở giữa |
| C mở vừa e/ê/â/ai | 19,9 | bầu dục ngang cao 26, khoang tối, dải răng trên trắng cao 6 |
| D mở to a/ă | 2,2 | bầu dục dọc cao 40, răng trên + lưỡi dưới `#d9646f` |
| E tròn vừa o/ô/ơ | 10,7 | ellipse rx15 ry17, không răng |
| F chu u/ư/oa- | 16,2 | ellipse rx12 ry11 + hai đường viền môi dồn ra trước |
| G răng-môi ph/v | 1,1 | hé thấp, răng trên đè lên môi dưới, đường môi dưới cong |
| H lưỡi lên l | 1,1 | mở như C, lưỡi cong lên chạm răng trên |

Ràng buộc trơn theo tài liệu rhubarb: A→C→D và C→E→F phải liền mắt (C, E là hình trung gian). Vì D/G/H chỉ ≈1–2 %, phiên bản tối thiểu 6 hình: gộp D→C, G→B, H→C (mất 4,4 % thời gian nói). Với phong cách Jaiden có thể gộp mạnh hơn thành 5 hình như mục 5. Nên vẽ miệng lệch/nghiêng theo góc đầu (`k.lat`), không đặt chính giữa.

### Quantize (đo trên cho-ngoi, `tools/quantize.py`)
- Cue median 0,12 s = 3,6 frame @30 · 2,9 @24 · 1,4 @12.
- **Lấy shape trội trong ô** (theo thời lượng giao) thay lấy mẫu điểm: khi hold=2 @24 mất 1/26 cue A (điểm mất 2/26); @24 on ones và @30 on ones: mất 0/26.
- 24 on ones: 161 lần đổi/33 s, **23 run 1-frame** (giật); 24 on twos: 143–147 đổi, **0 run 1-frame**; 12fps thuần: 73 run 1-frame (chính là on twos quy về 24). 30fps (repo hiện tại) on ones: 6 run 1-frame; on twos: 0.
- Khuyến nghị: giữ `FPS = 30` của repo (hoặc 24 nếu đổi toàn repo), **miệng hold = 2 frame** (on twos), nhưng cạnh X→shape (đầu câu) không hold để miệng mở đúng frame tiếng lên; shape giữ ≥ 8 frame thì thêm rung nhẹ scale 0,95–1,0 để không "đứng hình"; giữa hai shape xa (A↔D, B↔F) chèn 1 ô trung gian C/E nếu rhubarb chưa chèn.
- Định dạng đề xuất `<ten>.mouth.json`: `{ [id]: {sig, fps, hold, duration, cues, frames: "XXXBBCCAA…", rle: [[frame, shape], …]} }` — 14 chương = **47 KB** (so `tinh-dau.voice.json` 265 KB). File mẫu: `tools/cho-ngoi.mouth.{24fps.hold1,24fps.hold2,30fps.hold1}.json`, `tools/proto/out/tinh-dau.mouth.json`.

### Nhúng vào pipeline (prototype đã chạy: `tools/proto/lipsync.mjs`)
- Script mới `pipeline/lipsync.mjs <ten> [--fps 30] [--hold 2]`: đọc `scripts/<ten>.json` → `project` → `src/projects/<du-an>/data/<ten>.generated.json`; mỗi chương: mp3 → WAV 16k tạm (ffmpeg Remotion, `DYLD_LIBRARY_PATH`) → `rhubarb -r phonetic -f json --extendedShapes GHX -q` (đọc stdout) → quantize trội → ghi `<ten>.mouth.json` cạnh `.voice.json`. Cache `sig = sha1(mp3) + version rhubarb + tham số`: lần 1 55,2 s / 14 chương, **lần 2 0,09 s** (14/14 cache). Rhubarb đường dẫn qua env `RHUBARB` hoặc `tools/rhubarb/` (git-ignore, cần cả `res/`, ≈90 MB).
- Engine: thêm type `MouthTrack` (hoặc trường `mieng` vào `VoiceTrack` ở `dien.tsx:9`); `mieng()` trong `dien.tsx:123` và `nhan-vat.tsx:202` nhận `shape = mouth.frames[i]`: khi `X` giữ miệng theo `sac` như hiện tại (đây chính là lý do miệng cảm xúc đang trông tự nhiên), khi ≠X vẽ theo bảng trên; `sac` chỉ còn điều khiển khoé miệng (lên/xuống) chồng lên shape.
- `pipeline/kiem-tra.mjs`: thêm kiểm 8 — `mouth.json` có đủ chương và `sig` khớp mp3; thiếu thì báo lệnh `node pipeline/lipsync.mjs <ten>`.
- Skill `tao-video`: chèn bước `lipsync.mjs` ngay sau `analyze-voice.mjs`. Có thể gộp hai script (cùng đọc PCM) nhưng tách file giúp bật/tắt lip-sync theo dự án.

## 7. Phương án dự phòng không có rhubarb (`tools/fallback.py`, đo trên cùng lưới 24fps)
Thuật toán: RMS/frame (chuẩn hoá p95, căn bậc hai như `analyze-voice.mjs`) + zero-crossing rate + spectral centroid (numpy 2.5.2 có sẵn): `am<0,15 → X`; `ZCR>0,25 → B`; `am<0,45 → B`; `centroid<600 Hz → F`; `am<0,75 → C`; còn lại `D`.
- Khớp im/nói với rhubarb: **86 %** (cho-ngoi) / 89 % (cay-but) — phần này dùng được, tương đương `nghi` hiện có.
- Khớp 4 lớp (đóng/hé/mở/tròn) **chỉ khi nói: 30 % / 37 %**, baseline đoán toàn 'hé' đạt 43 % / 35 % → **không hơn đoán mò**.
- Đổi shape/giây: fallback **9,4** vs rhubarb 4,8 (cho-ngoi) — lắp bắp gấp đôi, đúng hiện tượng "mồm O O giật giật" đã bị chê trong `USECASE.md`.
- Không tạo được A (rhubarb có 66 frame A đóng môi giữa câu trong cho-ngoi; biên độ không phân biệt được "m" với "n").
- ZCR trung bình theo shape rhubarb (cho-ngoi): A 0,06 · B 0,10 · C 0,09 · D 0,04 · E 0,06 · F 0,13 · G 0,17 · H 0,04 · **X 0,25** (X cao vì nhiễu nền hiss của TTS → phải gate theo RMS trước ZCR). Centroid: A 885 · B 1364 · F 1575 · G 1747 · H 797 · X 3014 Hz. → ZCR/centroid tách được xát âm (s/x/ch/ph) khỏi nguyên âm mở, **không** tách được tròn/mở/ngậm.
- Hạn chế chốt: dự phòng chỉ nên làm **3 mức** X / hé (B) / mở (C) với hysteresis và hold tối thiểu 3 frame; không có A, E, F, D, G, H; không thay được rhubarb cho cận cảnh.

## 8. Rủi ro / ràng buộc ghi lại
- Binary x86_64 qua Rosetta; máy CI arm64 không Rosetta sẽ không chạy — cần build từ nguồn (CMake, C++) hoặc chấp nhận Rosetta.
- Không xác định giữa các lần chạy (1,6–3,2 % frame) → luôn cache theo `sig`; đừng chạy lại khi mp3 không đổi.
- Cần `res/sphinx/` 82 MB đi cùng binary; không commit vào git (đặt `tools/rhubarb/` vào `.gitignore`, ghi lệnh tải vào ARCHITECTURE.md).
- Phonetic dùng âm vị tiếng Anh: thanh điệu, âm cuối tắc (-p/-t/-c) và "ng" tiếng Việt không có mô hình → độ đúng cấp âm vị ≈ 60 %; nhịp câu ≈ 100 %.

## SỐ LIỆU
- brew: không có formula rhubarb-lip-sync; tải GitHub release v1.14.0 (2025-04-03) macOS zip 86.870.942 byte
- Binary rhubarb: Mach-O x86_64 8,0 MB, chạy qua Rosetta 2 (oahd đang chạy); res/ 82 MB bắt buộc kể cả với -r phonetic
- rhubarb --version → 'Rhubarb Lip Sync version 1.14.0' exit 0 sau xattr -rd com.apple.quarantine
- Rhubarb không đọc mp3 ('Could not open sound file'); chỉ WAV/OGG
- cho-ngoi.mp3 48kHz mono 160kbps 33,384 s → WAV 16k mono 33,36 s 1.067.598 byte
- Thời gian phonetic: cho-ngoi 33,36 s audio → 2,95 s real (4,71 user); cay-but 53,84 s → 4,36 s; --threads 1 → 2,67 s
- pocketSphinx đối chứng: 16,53 s real / 60,82 s user (chậm 5,6×), khác 34,4 % frame vs phonetic
- 14 chương tinh-dau (612,9 s audio): ffmpeg+rhubarb 56,9 s; rhubarb riêng 54,5 s; cache lần 2: 0,09 s
- cho-ngoi: 162 cue, 149 cue nói, nói 22,10 s (66,2 %), 6,74 cue/giây nói, 4,86 cue/giây tổng
- cho-ngoi độ dài cue nói: min 0,04 · median 0,11 · mean 0,148 · max 0,77 s
- cho-ngoi phân bố: A 26 (8,0 %) B 50 (27,8 %) C 17 (5,7 %) D 1 (0,4 %) E 17 (7,2 %) F 34 (16,0 %) G 3 (0,8 %) H 1 (0,4 %) X 13 (33,8 %)
- 14 chương: 2726 cue, nói 372,1 s (61 %), 6,63 cue/giây nói; median cue 0,12 s, p10 0,07, p90 0,28, max 1,75
- 14 chương % thời gian nói: B 38,2 · C 19,9 · F 16,2 · E 10,7 · A 10,5 · D 2,2 · G 1,1 · H 1,1; X = 39,3 % tổng
- Cue ngắn hơn 1 frame: @30fps 0,3 % · @24fps 2,6 % · @12fps 44,6 % (2467 cue nói)
- Không xác định: 5 lần chạy cùng WAV → 162/164/163/163/163 cue, chênh 0–3,2 % frame @24fps
- -d dialog với phonetic: chênh 1,6 % frame = mức nhiễu lặp lại → vô ích
- WAV 48k không resample: chạy được, khác 8,6 % frame so 16k
- --extendedShapes '' (chỉ A–F): A chiếm 43 % vì X bị đổ vào A → phải giữ X
- X rhubarb ∩ nghi analyze-voice / X = 1,00 (cho-ngoi), 0,99 (cay-but); nghi được X phủ 87 % / 93 %
- am trung bình khi X = 0,092 / 0,066; khi shape nói 0,57–0,71; H = 0,95 / 0,87; D/E có am>0,5: 88 % / 79 %
- Âm tiết m/b/p có cue A trong cửa sổ: 64 % (9/14) vs 40 % (29/73) ở âm tiết khác
- Nguyên âm tròn u/ư/o/ô/ơ có cue E/F: 80 % (20/25) vs 65 % (40/62) ở nguyên âm không tròn
- Shape trội trùng lớp kỳ vọng (đóng/hé/mở): 59 % (51/87); baseline đoán toàn 'hé' 56 %
- 12 đoạn nói rhubarb ↔ 10 cụm dấu câu kịch bản (TTS ngắt thêm 2 chỗ); mọi X dài >0,6 s rơi đúng dấu câu
- Jaiden 0:36,5–38,5 (48 khung 24fps): 32 lần đổi vùng miệng = 16 đổi/giây; giữ median 1 frame (23×1f, 6×2f, 4×≥3f); ≈5 dạng miệng
- Quantize cho-ngoi: 24 on ones 161 đổi, 23 run 1-frame; 24 on twos 143–147 đổi, 0 run 1-frame, mất 1/26 cue A (trội) vs 2/26 (điểm); 30 on ones mất 0/26
- mouth.json 14 chương (frames + rle) = 47 KB; tinh-dau.voice.json hiện tại = 265 KB
- Dự phòng RMS+ZCR+centroid @24fps: khớp im/nói 86 % / 89 %; khớp 4 lớp khi nói 30 % / 37 % (baseline 43 % / 35 %); đổi shape 9,4/s vs rhubarb 4,8/s; 0 frame A (rhubarb 66)
- ZCR theo shape rhubarb (cho-ngoi): A 0,06 B 0,10 F 0,13 G 0,17 D 0,04 X 0,25; centroid A 885 Hz, B 1364, F 1575, G 1747, X 3014

## ĐỀ XUẤT
- Thêm `pipeline/lipsync.mjs <ten> [--fps 30] [--hold 2]` theo prototype `tools/proto/lipsync.mjs`: generated.json → WAV 16k mono tạm (ffmpeg Remotion) → `rhubarb -r phonetic -f json --extendedShapes GHX -q` → quantize lấy shape trội mỗi ô → ghi `src/projects/<du-an>/data/<ten>.mouth.json` cạnh `.voice.json`
- Cache trong lipsync.mjs bằng `sig = sha1(mp3) + version rhubarb + fps/hold`; rhubarb không xác định giữa các lần chạy (1,6–3,2 % frame) nên không bao giờ chạy lại khi mp3 không đổi
- Đặt rhubarb ở `tools/rhubarb/` (binary + res/, ≈90 MB), thêm vào `.gitignore`, ghi lệnh tải release v1.14.0 + `xattr -rd com.apple.quarantine` + yêu cầu Rosetta 2 vào ARCHITECTURE.md mục 'ràng buộc môi trường'
- Định dạng `<ten>.mouth.json`: `{[id]: {sig, fps, hold, duration, cues, frames: 'XXBBC…', rle: [[frame, shape]]}}` — 47 KB/14 chương
- Sửa `src/library/cast/dien.tsx` (`VoiceTrack` dòng 9, `mieng()` dòng 123) và `src/library/cast/nhan-vat.tsx` (`mieng()` dòng 202): nhận thêm `mouth` track; khi shape = X giữ miệng theo `sac` như hiện nay, khi ≠X vẽ theo bảng 9 hình; `sac` chỉ còn lái khoé miệng chồng lên shape
- Vẽ 9 miệng SVG theo hình học trong `tools/mieng9.svg` (hệ toạ độ dien.tsx: miệng quanh (0,52), rộng 40–52, khoang #7a2b3a); bản tối thiểu 6 hình gộp D→C, G→B, H→C (mất 4,4 % thời gian nói); đặt miệng lệch/nghiêng theo `k.lat` như Jaiden
- Quantize: giữ FPS=30 của `src/engine/theme.ts`; miệng hold=2 frame (on twos) nhưng không hold ở cạnh X→shape đầu câu; shape giữ ≥8 frame thì rung nhẹ scale 0,95–1,0; chèn C/E trung gian giữa A↔D, B↔F
- Thêm kiểm 8 vào `pipeline/kiem-tra.mjs`: `<ten>.mouth.json` có đủ chương và `sig` khớp mp3; thiếu thì in lệnh `node pipeline/lipsync.mjs <ten>`
- Cập nhật skill `.claude/skills/tao-video/SKILL.md`: chạy `lipsync.mjs` ngay sau `analyze-voice.mjs`; render thử 10 s cận cảnh trước khi render toàn bài vì độ đúng cấp âm vị chỉ ≈60 %
- Không dùng `-d dialogFile` với phonetic (vô ích, đo chênh 1,6 % = nhiễu); không bỏ X khỏi `--extendedShapes`
- Dự phòng khi thiếu rhubarb: mở rộng `pipeline/analyze-voice.mjs` thành 3 mức X/hé/mở từ RMS với hysteresis + hold ≥3 frame; không cố tạo A/E/F từ ZCR/centroid (đo: không hơn đoán mò, đổi shape gấp 2× rhubarb)
- Về lâu dài nếu cần cận cảnh đặc tả: thay phonetic bằng forced-alignment tiếng Việt (vd. wav2vec2/MMS hoặc WhisperX align) → ánh xạ âm vị Việt → shape theo bảng m/b/p→A, ph/v→G, l→H, u/ư→F, o/ô/ơ→E, a/ă→D, e/ê/â→C, còn lại→B

## TỆP
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/tools/rhubarb-macos.zip
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/tools/Rhubarb-Lip-Sync-1.14.0-macOS/rhubarb
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/tools/cho-ngoi.16k.wav
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/tools/cay-but.16k.wav
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/tools/cho-ngoi.48k.wav
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/tools/cho-ngoi.phonetic.json
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/tools/cay-but.phonetic.json
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/tools/cho-ngoi.sphinx.json
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/tools/cho-ngoi.phonetic.AF.json
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/tools/cho-ngoi.phonetic.dialog.json
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/tools/cho-ngoi.phonetic.run2.json
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/tools/cho-ngoi.phonetic.run3.json
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/tools/cho-ngoi.phonetic.run4.json
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/tools/cho-ngoi.phonetic.run5.json
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/tools/cho-ngoi.48k.json
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/tools/cho-ngoi.phonetic.time.txt
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/tools/cay-but.phonetic.time.txt
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/tools/cho-ngoi.sphinx.time.txt
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/tools/cho-ngoi.dialog.txt
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/tools/phan_tich.py
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/tools/bang10s.py
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/tools/quantize.py
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/tools/fallback.py
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/tools/cho-ngoi.align.json
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/tools/cho-ngoi.timeline10s.png
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/tools/cho-ngoi.mouth.24fps.hold1.json
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/tools/cho-ngoi.mouth.24fps.hold2.json
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/tools/cho-ngoi.mouth.30fps.hold1.json
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/tools/all14/ (14 file <id>.wav + 14 file <id>.json + _tong.json)
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/tools/proto/lipsync.mjs
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/tools/proto/out/tinh-dau.mouth.json
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/tools/mieng9.svg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/tools/mieng9.png
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/mouth_talk/ (48 khung x_001..048.png 1280px, _full.png, _mouths.jpg, _mouths_marked.jpg)
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/mouth_pirate/ (48 khung x_001..048.png 1280px, _full.png, _mouths_marked.jpg)