# Nghiên cứu storytime animation — số liệu đo từ tham chiếu, kiểm chứng trên máy

Tổng hợp sáu hướng nghiên cứu (timing · nét vẽ · lip-sync · ngữ pháp shot ·
công nghệ · audit repo) thành một tài liệu. Mọi con số dưới đây **đo được**
bằng script trên khung hình tách từ video, hoặc chạy thật trên máy này; không
có số ước đoán. Chỗ nào hai hướng đo ra hai số khác nhau thì ghi cả hai và
giải thích ở §10.

Tài liệu thiết kế rút ra từ đây: `docs/thiet-ke-v2.md`.

**Ký hiệu đường dẫn.** `$S` = thư mục scratchpad chứa toàn bộ tư liệu và
script đo:

```
S=/private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad
```

Chỉ mục đầy đủ các tệp minh chứng ở §11. Scratchpad là thư mục tạm theo phiên;
tệp nào cần giữ lâu phải chép ra ngoài trước khi phiên kết thúc (xem
`docs/thiet-ke-v2.md` §h, rủi ro 9).

---

## 0. Mười hai kết luận

| # | Kết luận | Số đo chốt | Nguồn đo |
|---|---|---|---|
| 1 | Storytime **không** là "on twos". Cấu trúc thật là **hold dài + đổi hình tức thời + lớp miệng đổi gần mỗi frame** | 79 % đổi tư thế dài đúng 1 frame; hold trung vị 20 frame; 71,5 % khung đứng yên | §3.1, §3.2 |
| 2 | Cắt dày, cắt cứng | 231 shot / 403 s; trung vị 1,42 s; 31 % shot < 1 s; 100 % cắt cứng, 0 mờ chồng | §2 |
| 3 | Nền trắng là mặc định, prop là ngoại lệ có mục đích | 84 % shot nền trắng + nét; 11,7 % trắng hoàn toàn; 4,3 % không trắng | §7.2 |
| 4 | Nhân vật đầu to, nét dày đều, hai mảng tô | đầu = 41 % chiều cao; đầu/vai 1,6–1,9; nét = max(3 px, 0,015 × sọ) @1280; 84 % pixel là trắng | §4 |
| 5 | Mắt = oval đen, không mày, không chớp trong lúc nói | 0 chớp / 519 frame cận cảnh; mày chỉ khi biểu cảm | §3.3, §4.5 |
| 6 | Miệng đổi **hình**, không scale theo biên độ | 16 đổi/s; giữ trung vị 1 frame; 8 cụm hình chiếm 91 % frame; rộng 0,40 sọ | §5.1 |
| 7 | Rhubarb `-r phonetic` **đủ** cho lip-sync tiếng Việt kiểu Hanna-Barbera, **không đủ** cho đặc tả dài | nhịp câu khớp 100 % (X∩nghi = 1,00); cấp âm vị ≈ 60 %; 11× realtime | §5.2 |
| 8 | Dự phòng RMS/ZCR không thay được rhubarb | khớp 4 lớp khi nói 30–37 % = đoán mò; đổi hình gấp 2× | §5.4 |
| 9 | Chữ trên màn là một phần ngữ pháp, không phải phụ đề | ≥ 32 lần / 403 s; 23 % shot có chữ; vào tức thì 1 khung, không fade | §7.1 |
| 10 | Trực diện chỉ ≈ 16 % thời gian, còn lại là minh hoạ / tiểu cảnh / phản ứng / trắng | TD 16,0 %; rời TD trung vị 10,5 s | §6 |
| 11 | Sàn render máy này là chụp khung, không phải độ phức tạp SVG | ≈ 15,5 khung/s từ 10 đến 3000 path; 1080p +4 %; `--gl=swangle` chậm 7× | §8.3 |
| 12 | Repo hiện tại **cấu trúc đúng, thẩm mỹ sai**: neo/cues/TTS/render giữ được; rig, nhịp, nền, miệng phải làm lại | shot trung vị 7,37 s (5× tham chiếu); `am` tính rồi bỏ; 19 màu + cel-shade; 8/8 nhân vật đọc thành đeo kính | §9 |

---

## 1. Tư liệu và phương pháp

### 1.1 Video tham chiếu

JaidenAnimations — *My School Stories* (`oV_m2y3Qw18`), **24 fps, 1280×720, 472 s**,
1560 từ (3,31 từ/s). Thân phim khảo sát 0:00–6:43,3 (403,3 s); bỏ outro fan-art.

Tệp gốc: `$S/ref-oV/ref.f398.mp4` (hình), `ref.f251.webm` (tiếng), `ref.info.json`,
`transcript.txt` (phụ đề tự động có mốc thời gian).

### 1.2 Khung hình đã tách

| Bộ khung | Ở đâu | Dùng để đo |
|---|---|---|
| 238 khung, 1 khung / 2 s, 320 px | `$S/ref-oV/frames2s/`, contact sheet `sheets/sheet00..07.jpg` | nền, màu, prop, chữ |
| 5666 khung, 12 fps, 640 px | `$S/ref-oV/frames12/`, `motion12.npy` | hold, sự kiện rời rạc, cắt |
| 17 đoạn 24 fps, 640×360 | `$S/ref-oV/b24/s005 … s440`, sheet `sheets24/*.jpg`, strip phóng to `strips/*.jpg` | snap, in-between, chu kỳ |
| 4 burst 24 fps (talk, pirate, nose, mid) | `$S/ref-oV/burst/sheet_*.jpg` | miệng, vào/ra khung |
| 72 khung 0:36–0:39 @1280 | `$S/ref-oV/talk1280/` | miệng cận, boil |
| 70 khung biểu cảm @1280 | `$S/ref-oV/faces1280/`, tổng hợp `style/faces.jpg` | mắt / mày / miệng |
| 24 mốc toàn thân @1280 | `$S/ref-oV/full/`, `style/_full_index.jpg` | tỉ lệ cơ thể |
| lineup ba độ tuổi 4:27 | `$S/ref-oV/lineup3/x_025.png` | tỉ lệ theo tuổi |
| 5 đoạn 24 fps có chữ | `$S/ref-oV/b24_rm b24_yw b24_cap b24_jump b24_s101`, `$S/shotgram/s24_*.jpg` | kinetic text |

### 1.3 Cách đo

- **Cắt cảnh**: hai bộ dò hợp nhất — pixel-diff > 18 (`$S/ref-oV/analyze.py` → `cuts_px.json`, 232 mốc) và XOR mặt nạ nét ở 160×90 (`$S/shotgram/detect2.py` → `cuts2.json`). Pixel-diff **bỏ sót 67 mốc** ở shot nội dung nhỏ (nhãn chữ, tiểu cảnh); bộ hợp nhất `master_starts.json` có 230 mốc → 231 shot.
- **Sự kiện chuyển động**: số pixel |Δ| > 48 và bbox mỗi frame (`px24.py`, `events24.py`); `.` = 0, `m` < 900 px = miệng/chi tiết, `P` ≥ 900 = đổi tư thế, `C` = cắt theo histogram. Chu kỳ lặp đo bằng autocorrelation k = 1..12 (`period.py`).
- **Nét vẽ**: lấy pixel đen thuần (max RGB < 75, bão hoà < 22), tính min(run ngang, run dọc), lấy trung vị (`style/so-lieu-do.json`).
- **Màu**: lượng tử hoá 1,39 triệu mẫu từ 59 khung.
- **Lip-sync**: Rhubarb Lip Sync 1.14.0 chạy thật trên 14 chương `tinh-dau` (612,9 s tiếng Việt, Gemini TTS Charon); đối chiếu với `am/nghi` của `pipeline/analyze-voice.mjs` và với ước lượng vị trí âm tiết (`$S/ref-oV/tools/phan_tich.py`, `bang10s.py`, `quantize.py`, `fallback.py`).
- **Render**: bench Remotion riêng trong `$S/bench/` (720p, 24 fps, 240 frame), đo `/usr/bin/time`.
- **Repo hiện tại**: `$S/audit/shots.mjs`, `board-tinh-dau.mjs`, `board-ra-truong.mjs` chạy thật `neoNhieu`/`splitCues`/`cueTimings` của repo để đếm shot.

Giới hạn: ~70 s ở 24 fps + toàn phim ở 12 fps; không có mẫu walk cycle nhìn
ngang đúng nghĩa (chỉ hop cycle 5:17); nhận diện "nói trực diện" tự động theo
khối tóc nên là cận dưới; mốc thời gian trên `sheets/*.jpg` lệch ~1 s so với
`-ss` thật (mọi mốc trong tài liệu này là giây thật của `ref.f398.mp4`).

---

## 2. Nhịp dựng: cắt, shot, beat trắng

Nguồn: `$S/shotgram/master_starts.json`, `shot_metrics.json`, `labels.json`, `td_runs.json`.

### 2.1 Độ dài shot (231 shot / 403,3 s)

| Thống kê | Giá trị |
|---|---|
| trung vị | **1,42 s** (1,25 s nếu tính theo `cuts_px.json` trên 472 s; 1,50 s nếu bỏ cụm nháy 26,5–29 s) |
| trung bình | 1,75 s |
| p25 / p75 | 0,83 / 2,21 s |
| < 0,5 s | 19 shot |
| 0,5–1 s | 53 shot → **< 1 s = 72 = 31 %** |
| 1–2 s | 85 |
| 2–4 s | 58 |
| 4–8 s | 14 |
| > 8 s | 2 (lớp học 1:45,75 = 8,4 s; 3:16 = 8,3 s) |
| ngắn nhất | 0,25 s (6 khung) |
| mật độ | **1,69 cắt / câu** (136 câu, 2,97 s/câu); 43 sự kiện rời rạc / phút |

### 2.2 Cắt so với lời

- 32,2 % cắt cách ranh giới câu ≤ 0,25 s (ngẫu nhiên 16,6 %); 48,7 % ≤ 0,5 s (ngẫu nhiên 31,7 %) → **≈ 2/3 số cắt rơi giữa câu**.
- 89 % cắt cách đầu một **từ** ≤ 0,15 s (độ phân giải từ 0,26 s) → mốc neo phải ở cấp từ, không phải cấp cụm phụ đề.
- **100 % cắt cứng**: đổi hoàn toàn trong 1 khung ở mọi mẫu 24 fps; không mờ chồng, không zoom trượt.

### 2.3 Beat trắng (khung trắng trơn)

27 shot = 28,9 s = **7,2 % thời gian**; trung vị 0,92 s; p25/p75 0,5/1,25 s;
max 3,58 s (5:27–5:30,6 sau "yup."). Ở 12 fps: 31 run / 400 s, trung vị 18
frame @24, range 2–86.

Sau beat trắng (2 đoạn khảo sát) là: minh-hoạ 7, tiểu-cảnh 5, chữ 2, trực-diện
2, ảnh-thật 1, phản-ứng 1. Hơn 1/3 lần rời trực diện đi qua một beat trắng
0,3–1,4 s trước khi hiện cảnh mới.

### 2.4 Nhịp thật của repo hiện tại (đối chiếu)

| | tinh-dau (hiện tại) | ra-truong-vui | tham chiếu |
|---|---|---|---|
| shot | 80 | 78 | 231 |
| trung vị | **7,37 s** | 4,57 s | 1,42 s |
| ≥ 7 s | 43/80 | — | 6/231 |
| dài nhất | 23,07 s | — | 8,4 s |
| mốc bị `NGAN_NHAT` gộp âm thầm | 3 | **23** (2,8 s) | — |

Chênh 5–6 lần về nhịp. Script: `$S/audit/shots.mjs`.

---

## 3. Timing chuyển động

Nguồn: `$S/ref-oV/timing_rules.json`, `px24.json`, `diff24.json`, `events24.json`; ảnh `sheets24/*.jpg`, `strips/*.jpg`.

### 3.1 Pose snap

97 sự kiện đổi tư thế (không tính cắt):

| Độ dài | Số sự kiện | Ghi chú |
|---|---|---|
| **1 frame** | **77 (79 %)** | frame trước/sau = 0 px đổi → không anticipation, không settle, không smear, không motion line, không blur |
| 2 frame | 8 | snap + frame sau chỉnh miệng (`s175` f33/34, 39/40, 44/45) |
| 3 frame | 3 | pirate vào cảnh 5:14 f9–11; nose 0:50; `s005` f60–61 |
| 5 frame | 1 | `s046` f67–71 thầy quay đầu: 3 hình rời (nghiêng → nghiêng-profile → profile) + 2 frame chỉnh nhỏ |

In-between khi có = **hình vẽ rời rạc 1 frame/hình**, biên độ giảm dần 2 frame
cuối (nose: 2592 → 3579 → 2541 → 859 px). Ảnh: `$S/ref-oV/strips/nose_turn.jpg`,
`strips/s046_turn.jpg`, `strips/pirate_entry.jpg`.

**Đầu khoá cứng khi snap ở cận cảnh**: centroid lớp tóc trên 16 snap (s270 f3/30/44/59,
s005 f14, s345 f18/24, talk f12, s175 ×8): dx = dy = **0,0 px**, số pixel tóc giữ 100 %
→ chỉ tay + mắt + miệng đổi. Ở toàn cảnh (`s016`) cả body đổi.

### 3.2 Hold

n = 338 hold giữa hai sự kiện rời rạc (0–400 s, quy về frame 24 fps):

| p10 | p25 | p50 | p75 | p90 | max |
|---|---|---|---|---|---|
| 6 | 10 | **20** | 36 | 50 | 114 |

Phân bố: < 12 fr 26 % · 12–23 fr 28 % · 24–47 fr 33 % · ≥ 48 fr 13 %.
Cận cảnh đang nói đổi tay/biểu cảm mỗi **8–27 frame** (`s270`: 27, 14, 15, 24;
`s016`: 12, 15, 11, 9, 8, 19); chuỗi hoảng loạn `s175`: 5–11 frame.

Trong hold **chỉ miệng động** (khi nói); mắt, mày, tóc, đầu đứng yên (std
centroid ≤ 0,1 px). 69,7 % khung 12 fps không đổi gì. Shot tĩnh 2:08 (144 frame)
chỉ có **6 hình vẽ** = 24 frame/hình.

### 3.3 Chớp mắt, đầu, mày khi nói

- **Chớp mắt: 0 lần / 519 frame ≈ 21,6 s** cận cảnh nói (11 đoạn). Ứng viên duy nhất `s005` f51–56 soi `strips/s005_eyes.jpg` là nét miệng + vạch stress. Mắt nhắm chỉ xuất hiện như **trạng thái biểu cảm** giữ 1–2 s, đổi cùng lúc với pose snap (`s209` f0–30).
- **Đầu khi nói: 0 bob, 0 gật.** Std centroid tóc trong 6 đoạn nói: x 0,01–0,09 px, y 0,02–0,09 px; range ≤ 0,3 px. Bbox mọi thay đổi khi nói ≈ 80×45 px @640 = 160×90 @720p = đúng vùng miệng.
- Lông mày không đổi trong hold.

### 3.4 Lip-sync nhìn từ pixel (chi tiết miệng ở §5.1)

**On ones**: 73–96 % frame có đổi miệng (trung bình 82 %); hình miệng giữ 1 frame
87 %, 2 frame 10 %, ≥ 3 frame 3 %; trung bình 1,18 frame/hình (đo 519 frame) —
đo độc lập trên 91 frame 0:36,8–0:40,6 ra 81 hình mới = 1,12 frame/hình,
run-length {1: 74, 2: 5, 3: 1, 4: 1}.

### 3.5 Vào / ra khung

| Kiểu | Mẫu | Diễn biến theo frame | Tổng |
|---|---|---|---|
| **lean-in** | pirate 5:14 (`b24/s314` f9–12) | f9 key nghiêng (đầu to ~1,3×, 40 % người ngoài khung, thân kéo chéo) → f10 tới vị trí **overshoot +2,7 px @640 ≈ 1,5 % bề rộng nhân vật** → f11 +1,3 px → f12 final | 4 frame |
| **lean-out** | nose 0:50 f6–8 | f6 key xoay nghiêng → f7 chỉ còn vai/tay ở mép → f8 biến mất | 2 frame |
| **pop-in 1 frame** | `s086` f29, `s121` f15 & f94, máu `s046` f4 (0 → 608 px đỏ), `s240` f33 | hiện tức thì | 1 frame |

Không thấy trượt vào có ease dài. Đa số vào/ra là pop-in hoặc cắt thẳng.

### 3.6 Squash / stretch / anticipation / overshoot

- Stretch: chỉ ở lean key (pirate f9, nose f6) — hình kéo dãn 1 frame.
- Anticipation trước snap: **không** (frame trước = 0 px).
- Overshoot: bong bóng 3:40 f9–12: ≈ 8 % → 95 % → **105 % (+4,5 %)** → 100 % rồi hold (`strips/s220_bubble.jpg`); pirate arrive +2,7 px 1 frame.
- Squash: không thấy.
- Zoom-gag **tuyến tính rồi cắt cứng**: `s345` f84–95 figure w 127 → 631 px trong 10 frame (+55 px/frame); `s121` chữ "oooo!!" f78–86 w 150 → 532 (+49 px/frame, 8 frame) → cut f87. Không ease-out.

### 3.7 Chu kỳ lặp và boil

| Mẫu | Hình | Pattern | Chu kỳ | Ghi chú |
|---|---|---|---|---|
| hop/run pirate 5:17 (`s314` f75–95) | 2 | **AABB (on twos)** | 4 frame | vị trí trượt **on ones** 12 px/frame @640 = 24 px/frame @720p ≈ 580 px/s; bob dọc 6 px / 394 px cao = 1,5 % |
| "blah" talk 4:01 (`s240`) | 2 | AABB | 4 | |
| boil `s170` 2:50 | 2 | ABAB on ones | 2 | dịch chuyển 0 px |
| boil ABAC | 3 | ABAC on ones | 4 | `s175` lưng 2:55, `s220` bong bóng, `s220` tay viết; dịch < 0,5 px |
| run vì tức `s345` 5:47 | 9 | 9 hình, 1 hình giữ 2 | 10 | |
| FX/camera | — | on ones | — | đèn disco `s282` 4–8k px/frame; pan credits `s440` ~18k px/frame |

Boil chỉ ở **4/20 shot**; trong 72 khung nói 0:36–0:39, diff vùng tóc/mắt/thân/nền
= **0,00** — kiểu này không vẽ lại từng frame. Ảnh: `strips/s170_shiver.jpg`,
`strips/s175_shiver.jpg`, `strips/s345_cycle.jpg`.

### 3.8 On ones hay on twos

Parity frame lẻ/chẵn có đổi: talk 2/1, pirate 28/27, s345 19/17, s270 3/3,
s175 5/7 → cân → **không on twos toàn cục**. Chỉ 2 chỗ on twos: `s240` (0/32) và
`s209` f58–86 trượt comment (1/18). Kết luận: lipsync on ones, snap 1 frame, FX
on ones; **on twos chỉ cho hình trong chu kỳ lặp**, vị trí vẫn on ones.

### 3.9 Quy tắc timing dạng code (24 fps)

```
FPS = 24
snap        = {frames: 1, ease: none, inbetween: 0, anticipation: 0, smear: false, lockHeadLayerInCloseup: true}
moveKeys    = {keys: 3..5, framesPerKey: 1, settle: 2 frame cuối biên độ ~50 %}   // 15 % sự kiện
hold        = {min: 6, p25: 10, p50: 20, p75: 36, p90: 50}; closeupTalking: đổi tay/biểu cảm mỗi 8..27 fr
lipsync     = {on: 1, pChangePerFrame: 0.82, hold1: 0.87, hold2: 0.10, hold3plus: 0.03, headBobPx: 0, eyebrow: 0}
blink       = {ratePerSec: 0}  // eye-state chỉ đổi cùng pose snap
enter       = leanKey(1 fr, scale head ~1.3, 40 % ngoài khung) → arrive overshoot +1.5 % (1 fr) → settle 2 fr;  hoặc popIn(1 fr)
exit        = leanKey(1 fr) → partialOut(1 fr) → gone
popScale    = [0.08, 0.95, 1.045, 1.0]   // 4 frame rồi hold (+ boil ABAC tuỳ chọn)
zoomGag     = {scalePerFrame: +0.45× cỡ đầu, frames: 8..10, ease: linear, end: hardCut}
runCycle    = {drawings: 2, holdEach: 2 fr, translatePx720PerFrame: 24, bobPctHeight: 1.5}
boil        = {shotShare: ≤0.2, pattern: 'ABAC'|'ABAB', framesPerDrawing: 1, displacementPx: <0.5}
whiteBeat   = {frames: 12..30, giữa 2 shot}
shot        = {medianSec: 1.25–1.42, share<1s: 0.31–0.42}
```

---

## 4. Nét vẽ và thiết kế nhân vật

Nguồn: `$S/ref-oV/style/so-lieu-do.json`, `frames2s_stats.json`; ảnh `style/*.jpg`.
Mọi pixel dưới đây đo trên khung 1280×720.

### 4.1 Nét viền

| Cỡ cảnh | Khung | Bề rộng sọ (px) | Nét trung vị (p25–p75) |
|---|---|---|---|
| Cận, nhân vật chính nói | t0, t36, t348 | ~400 | **6 px** (5–8) |
| Cận nhăn mặt | t156 | ~420 | 8 px |
| Đặc tả đầu trắng | t166 | ~530 | 6 px |
| Đặc tả tóc vàng (đầu đầy khung) | t266 | ~700 | **12 px** (11–14) |
| Trung, 2–3 người | t316, t384 | 250–350 | 5–6 px |
| Toàn thân (người trắng cao 673 px) | t20 | 175 | **4 px** |
| Toàn thân nhỏ (cao 200–400 px) | t192, t322, t368 | 100–185 | **3–4 px** |

- Không cố định theo zoom, không tỉ lệ tuyến tính: sọ 100 → 3 px (3 %), 175 → 4 (2,3 %), 400 → 6 (1,5 %), 700 → 12 (1,7 %). Quy tắc khớp dữ liệu: **`nét = max(3 px, 0,015 × bề_rộng_sọ)` trên 1280** (×1,5 cho 1920 → `max(4,5 px, 0,015 × DAU_px)`).
- Nét đồng đều, đầu bút tròn, không thick/thin; nét bên trong (tóc, răng, nếp áo) **cùng độ dày** viền ngoài; chỉ gạch mí/mày mảnh hơn (~0,7×), mày tức dày hơn (~1,5×).
- Prop và nhân vật cùng một độ nét (mode 2 px @640 ≈ 4 px @1280); sân tennis mảnh hơn (1 px @640).

### 4.2 Bảng màu thực dùng

Lượng tử hoá 1,39 triệu mẫu: **trắng 84,1 %**, nâu tóc 5,1 %, đen 3,8 %, vàng tóc
1,7 %, còn lại < 0,6 % mỗi màu.

| Vai trò | Hex | Ghi chú |
|---|---|---|
| Nền, **da, áo, quần** | `#fdfdfd` | không tô — da và áo cùng màu nền, chỉ có nét |
| Nét, mắt, ngươi | `#000000` | |
| Tóc nhân vật chính | `#2e1310` | một mảng đặc, viền đen, 2–3 gạch đen bên trong |
| Tóc phụ | `#906830` / `#e9e8c6` / `#656565` | bob nâu / vàng / xám |
| Mũ pirate | `#313131` / `#a06860` | |
| Máu, cột "Blood Pressure", mũi tên | `#f81000` | đỏ thuần duy nhất |
| Huy hiệu | `#b8d8f8` | |
| Tim / má hồng | `#b03858` | |

→ Nhân vật chính chỉ có **1 mảng tô** (tóc); không đổ bóng cel, không gradient, không tông tối/sáng.

### 4.3 Tỉ lệ cơ thể

**Nhân vật chính toàn thân** (3:12, `$S/ref-oV/full/t192_01.png`): cao 402 px; đầu kèm
tóc 165 px → **đầu = 41 % = 2,4 đầu**; sọ 185, kèm tóc 233; vai 98 → **đầu/vai 1,9**;
cổ 20×12 px (2 gạch song song); thân (cằm→hông) 105 = 0,57 sọ; chân 122 = 0,66 sọ;
tay khoanh ≈ 0,9 sọ (chạm hông).

**Ba độ tuổi cùng nhân vật** (4:27, `lineup3/x_025.png`):

| | sọ rộng | sọ cao | vai | đầu/vai | mắt |
|---|---|---|---|---|---|
| tiểu học | 210 | 205 | 125 | 1,7 | chấm 10 px |
| cấp 2 | 255 | 250 | 135 | 1,9 | oval 12×25 |
| cấp 3 | 320 | 295 | 200 | 1,6 | oval 20×45 |

Sọ **rộng hơn cao** (h/w ≈ 0,92); cùng khuôn mặt, chỉ đổi tóc, cỡ mắt, cỡ tổng.

**Nhân vật phụ đầu trắng** (0:20, `full/t20_01.png`): cao 673; đầu 173 → **3,9 đầu**;
vai 140 → đầu/vai 1,24; cổ 25×30; thân 220 (1,27 đầu); chân 250; tay ≈ 210 (tới hông).
Không giày, không ngón chân. Trẻ con phụ ≈ 2,5 đầu.

**Đầu cận** (0:00, `full/t0_01.png`, sọ 400): đầu kèm tóc 360 cao; cằm hơi dẹt, không
gò má; cổ 25 px (0,06 sọ), cao 40; vai áo 290 = 0,72 sọ; cổ áo chữ V.

### 4.4 Nền và prop (200 khung frames2s < 6:40)

- ≥ 90 % diện tích trắng: **43 %** khung; ≥ 80 %: **90 %**. Mực trung vị 11,6 % diện tích. 9 khung trống hoàn toàn.
- Mảng màu bão hoà > 2 % (ảnh chèn, tóc màu): **12/200 = 6 %**.
- Prop/nền vẽ nét (bàn, cửa, lưới, dãy bàn): ≈ **69/200 = 34 %** — luôn nét đen không tô, phối cảnh một điểm tụ, **không sàn / tường / chân trời**.
- Còn lại ~60 %: nhân vật trên nền trắng tuyệt đối.

### 4.5 Mắt, mày

- **Mặc định**: hai oval đen đặc, **không lòng trắng, không ngươi, không highlight, không viền**. Cận nói: 55×95 px (0,14×0,24 sọ), tâm cách 180 (0,45 sọ), tâm ở 57 % chiều cao đầu từ đỉnh tóc. Bình thản/toàn thân: 20×45 (0,06×0,14 sọ).
- **Mày: không có ở mặc định**; mép mái tóc đóng vai đường mày. Mày chỉ khi cần: gạch chéo dày cắt vào đỉnh oval (tức), cong lên (lo), sóng (khó chịu).
- 9 trạng thái mắt (`style/faces.jpg`): E1 oval đen · E2 oval nhỏ · E3 chấm · E4 lòng trắng oval + ngươi chấm 8 px (sốc; lòng trắng 120–140 px = 0,3 sọ) · E5 khe ngang + gạch mí (bực) · E6 vòng cung úp (nhắm vui) · E7 gạch dọc (phụ) · E8 nguệch ngoạc (xấu hổ) · E9 oval bị gạch mí cắt ngang (chán).

### 4.6 Biểu cảm

Mỗi sắc thái = (mắt) × (mày) × (miệng) × (0–2 phụ kiện: mồ hôi, gạch má, mũi
tên). Thấy 9 mắt × 4 mày × 16 miệng, xuất hiện ≈ 30 tổ hợp. Ví dụ đo được:
NÓI = E1 + không mày + M5 · BÌNH THẢN = E2 + gạch 50 px · CHÁN = E9 + mím lệch ·
SỐC = E4 + mày cong + mếu sóng · BỰC = E5 + dẹt răng · TỨC = E1 + gạch chéo + mím ·
VUI NHẮM = E6 + cười mở · NGẠI = E3 + miệng "3" + vai co · XẤU HỔ = E8 + mồ hôi.

### 4.7 Tóc

Một khối đặc `#2e1310`, viền đen cùng độ dày nét, **không** mảng sáng/tối. Nét đen
bên trong: 2–3 gạch trên mái theo hướng chải + 1 gạch chỏm. Silhouette ≈ 7 mảng,
rộng 1,25 sọ, dài 1,4 đầu. **Tóc không động trong shot** (diff = 0): không
follow-through, không overshoot.

### 4.8 Bàn tay

**4 ngón** (3 + ngón cái), chỏm bo tròn, không khớp, không móng; bàn tay 0,16–0,18 sọ.
≥ 8 kiểu thấy được (`style/_hands_index.jpg`): xoè-ngửa, xoè-úp/chỉ 1 ngón, nắm,
chống cằm, hai tay ép ngực, khoanh, chống hông, cầm vật (kiếm, vợt, phong bì, mic).

### 4.9 Nhân vật phụ

Mặc định **đầu tròn trắng trơn, không mắt-mũi-miệng**, cổ 2 gạch, thân ống, 3,9 đầu
(lớn) / 2,5 đầu (trẻ). Đám đông 1:48–2:10, 3:06: 6–10 đầu trắng không mặt. Có
mặt khi được giao vai nói/phản ứng: mắt chấm hoặc gạch dọc (E3/E7), miệng gạch/nửa
vòng/răng cưa; **không bao giờ dùng oval đen của nhân vật chính**. Phân biệt bằng
tóc màu + 1 phụ kiện; không có màu da, màu áo.

---

## 5. Miệng và lip-sync

### 5.1 Mouth chart tham chiếu (`$S/ref-oV/style/mouth-chart.jpg`, `mouth_talk/_mouths_marked.jpg`, `mouth/mouth_clusters.png`)

- Vị trí: tâm miệng ở **85 %** chiều cao đầu, lệch theo hướng nhìn, **đặt lệch một bên má, nghiêng**.
- Cỡ: đóng = gạch 50 px (0,12 sọ); nói rộng 160–170 px (**0,40 sọ**); cười toe 166×76. Miệng **trắng bên trong**, răng = 1 dải trắng viền đen hàm trên, lưỡi = 1 cung, không có môi.
- Nhịp: 0:36,5–38,5 (48 khung): **32 lần đổi vùng miệng trong 2 s = 16 đổi/s**, giữ trung vị **1 frame** (23×1f, 6×2f, 4×≥3f). Trong 72 khung: 53/71 chuyển frame đổi miệng.
- Số hình khác nhau trong 3 s: 20 / 17 / 11 tuỳ ngưỡng; gom cụm crop 52×26: 11–15 cụm, **8 cụm lớn nhất chiếm 84/92 frame (91 %)**. Soát mắt: ≈ 5 dạng chính — (1) vạch ngang lượn (đóng), (2) "quả chuối" dẹt rộng có vạch răng (hé rộng, dùng nhiều nhất), (3) nửa bầu dục to có vạch lưỡi chéo (mở to), (4) bầu dục nhỏ nghiêng (chu), (5) vạch răng khít răng cưa (nghiến).
- Đây là lip-sync **theo hình**, không theo biên độ: cùng biên độ vẫn xen kẽ hé/rộng/dẹt để tạo nhịp.

### 5.2 Rhubarb Lip Sync trên tiếng Việt — kiểm chứng trên máy

Máy Apple M4, macOS 24.6.0. Binary: `$S/ref-oV/tools/Rhubarb-Lip-Sync-1.14.0-macOS/rhubarb`.

**Cài đặt**

| Bước | Kết quả |
|---|---|
| `brew` | không có formula |
| GitHub release v1.14.0 (2025-04-03) | zip 86.870.942 byte; binary **Mach-O x86_64** 8,0 MB, chạy qua **Rosetta 2** (`oahd` đang chạy); `res/` 82 MB **bắt buộc** kể cả `-r phonetic` (thiếu → `could not find resource file …/res/sphinx/cmudict-en-us.dict`) |
| Quarantine | `xattr -rd com.apple.quarantine .` xong chạy; `rhubarb --version` → `Rhubarb Lip Sync version 1.14.0`, exit 0 |
| Input | **không đọc mp3** (`Could not open sound file`); chỉ WAV/OGG → ffmpeg Remotion `-ac 1 -ar 16000 -c:a pcm_s16le`. WAV 48 kHz không resample cũng chạy nhưng khác 8,6 % frame → chốt 16 kHz mono |

**Tốc độ** (`-r phonetic -f json --extendedShapes GHX`)

| Input | real | ghi chú |
|---|---|---|
| cho-ngoi 33,36 s | **2,95 s** (≈ 11× realtime) | `--threads 1`: 2,67 s — đa luồng không lợi trên Rosetta |
| cay-but 53,84 s | 4,36 s | |
| me-hoi 45,8 s | 4,33 s (10,6×) | đo độc lập ở hướng công nghệ |
| pocketSphinx (đối chứng) | 16,53 s | chậm 5,6×, khác 34,4 % frame; me-hoi 18,75 s, 179 cue kém nhịp |
| **14 chương** 612,9 s | **56,9 s** (rhubarb 54,5 s) | cache lần 2: **0,09 s** |

**Thống kê cue** (`$S/ref-oV/tools/all14/_tong.json`, 14 chương): 2726 cue; nói 372,1 s
(61 %); **6,63 cue/giây nói**; độ dài cue nói p10 0,07 · **median 0,12** · p90 0,28 ·
max 1,75 s. Cue ngắn hơn 1 frame: **@30 fps 0,3 % · @24 fps 2,6 % · @12 fps 44,6 %**.
% thời gian nói: **B 38,2 · C 19,9 · F 16,2 · E 10,7 · A 10,5 · D 2,2 · G 1,1 · H 1,1**;
X = 39,3 % tổng. Giọng kể chậm nên D (mở to) hiếm, B (hé răng khít) là hình mặc
định khi nói. me-hoi: 236 cue = 5,16 cue/s, 2,48 cue/âm tiết (khớp cấu trúc CVC
của âm tiết Việt: đầu → nhân → cuối).

**Độ đúng** (cho-ngoi 0–10 s, `$S/ref-oV/tools/cho-ngoi.timeline10s.png`, `cho-ngoi.align.json`)

- **Cấp nhịp câu: khớp chắc.** X của rhubarb ∩ `nghi` của `analyze-voice.mjs` / X = **1,00** (cho-ngoi), 0,99 (cay-but); `nghi` được X phủ 87 % / 93 %. `am` trung bình khi X = 0,09; khi shape nói 0,57–0,71; khi H = 0,95. 12 đoạn nói của rhubarb rơi đúng 10 ranh giới dấu câu + 2 ngắt hơi thật của TTS; mọi X > 0,6 s trùng dấu câu.
- **Cấp âm vị: đúng chiều nhưng yếu.** Âm tiết m/b/p có cue A trong cửa sổ: **64 %** (9/14) so với 40 % ở âm tiết khác; nguyên âm tròn u/ư/o/ô/ơ có E/F: **80 %** (20/25) so với 65 %; shape trội trùng lớp kỳ vọng (đóng/hé/mở): 59 % (baseline đoán toàn 'hé' 56 %). Nguyên nhân: recognizer phonetic dùng bộ âm vị tiếng Anh, không có thanh điệu, âm cuối tắc -p/-t/-c, "ng"; alignment âm tiết chỉ là ước lượng.
- **Không xác định giữa các lần chạy**: 5 lần cùng WAV → 162/164/163/163/163 cue, chênh 0–3,2 % frame @24 → phải cache theo vân tay, không so bit-exact.
- `-d dialog.txt` với phonetic: chênh 1,6 % = nhiễu → **vô ích** (đúng README: dialog chỉ giúp pocketSphinx).
- `--extendedShapes ""` (chỉ A–F): X bị đổ vào A (A = 43 %) → mất phân biệt nghỉ/ngậm → **phải giữ X**.

**Kết luận nghiệm thu**: đủ cho hoạt hình 2D kiểu Hanna-Barbera/storytime
(khán giả không đọc môi từng âm; cần ngắt đúng nhịp, ngậm ở m/b/p và tròn ở u/ô
đúng phần lớn); **không đủ** cho cận cảnh đặc tả kéo dài — ở đó sửa tay hoặc chờ
forced-alignment tiếng Việt.

### 5.3 Quantize về frame (`$S/ref-oV/tools/quantize.py`, `cho-ngoi.mouth.*.json`)

- Cue median 0,12 s = 3,6 frame @30 · 2,9 @24 · 1,4 @12.
- **Lấy shape trội trong ô** (theo thời lượng giao) thay lấy mẫu điểm: hold = 2 @24 mất 1/26 cue A (lấy điểm mất 2/26); on ones @24 và @30 mất 0/26.
- 24 on ones: 161 đổi/33 s, **23 run 1-frame**; 24 on twos: 143–147 đổi, 0 run 1-frame; 30 on ones: 6 run 1-frame.
- Định dạng đề xuất `<ten>.mouth.json`: `{[id]: {sig, fps, hold, duration, cues, frames: "XXXBBCCAA…", rle: [[frame, shape], …]}}` — 14 chương = **47 KB** (so `tinh-dau.voice.json` 265 KB). Mẫu: `$S/ref-oV/tools/proto/out/tinh-dau.mouth.json`; prototype pipeline: `$S/ref-oV/tools/proto/lipsync.mjs`.

### 5.4 Dự phòng không rhubarb (`$S/ref-oV/tools/fallback.py`)

RMS + zero-crossing + spectral centroid @24 fps: khớp im/nói với rhubarb **86 % / 89 %**
(dùng được, tương đương `nghi`); khớp 4 lớp (đóng/hé/mở/tròn) **chỉ khi nói 30 % / 37 %**,
baseline đoán toàn 'hé' 43 % / 35 % → **không hơn đoán mò**; đổi shape **9,4/s** vs
rhubarb 4,8/s (lắp bắp gấp đôi — chính hiện tượng "mồm O O giật giật" trong
`USECASE.md`); **0 frame A** (rhubarb có 66). ZCR theo shape: X 0,25 (nhiễu hiss TTS)
· G 0,17 · F 0,13 · B 0,10 · A 0,06 · D 0,04 → tách được xát âm khỏi nguyên âm,
**không** tách được tròn/mở/ngậm. Chốt: dự phòng chỉ **3 mức** X / hé / mở với
hysteresis + hold ≥ 3 frame.

### 5.5 Quy tắc lip-sync cổ điển (Richard Williams, *Animator's Survival Kit* tr. 304–314)

Miệng đi trước tiếng **≥ 2 frame** (6–8 khi nhấn); giữ phụ âm đóng (B, D, F, T, TH, V)
≥ 2 frame, mượn frame từ trước; nguyên âm "pop" không ease-in; cử động thân đi trước
lời 3–4 frame. Nguồn: https://escapestudiosanimation.blogspot.com/2022/04/lipsync-two-frames-ahead-of-audio.html ,
https://theartofstopmotion.wordpress.com/2013/02/18/readings-on-lip-syncing/ .

### 5.6 Bảng viseme tiếng Việt (dùng khi có alignment theo chữ — giai đoạn 2)

| Chính tả | Hình | Ghi chú |
|---|---|---|
| b, m, p (đầu); -m, -p (cuối) | A | môi khép |
| ph, v | G (hoặc B) | răng-môi |
| t, th, đ, n, l, s, x, ch, tr, d, gi, r, c/k/q, kh, g/gh, ng/ngh, nh, h; coda -n -t -c -ch -ng -nh | B | răng hé |
| i, y, ê, ư | B/C | không tròn |
| e, ă, â | C | mở vừa |
| a | D | mở to |
| o, ơ | E | tròn nhẹ |
| ô, u, oa/oe | F | chu môi |
| nghỉ, dấu câu | X | |

Forced-alignment tiếng Việt khả dụng: whisperX model align `nguyenvulebinh/wav2vec2-base-vi-vlsp2020`
(https://github.com/m-bain/whisperX/blob/main/whisperx/alignment.py) — máy chưa
có torch; Montreal Forced Aligner acoustic + dictionary tiếng Việt v2.0.0
(https://mfa-models.readthedocs.io/en/latest/acoustic/Vietnamese/Vietnamese%20MFA%20acoustic%20model%20v2_0_0.html) — cần conda.
Gemini TTS **không trả timestamp** (https://ai.google.dev/gemini-api/docs/speech-generation).

---

## 6. Ngữ pháp shot

Nguồn: `$S/shotgram/labels.json` (107 mốc xem ảnh thật ở 0:00–2:00 và 5:00–6:00 = 95 shot thật + 12 snap, 167,4 s),
`td_runs.json`, `shot_metrics.json`; ảnh `seg_0000_0120_sheet00–04.jpg`, `seg_0300_0360_sheet00–03.jpg`.

### 6.1 Tỉ lệ loại shot (95 shot, 167,4 s)

| Loại | % shot | % thời gian |
|---|---|---|
| minh-hoạ-hành-động | 21,1 | 27,6 |
| khung-trắng-trống (beat) | 18,9 | 13,2 |
| nói-trực-diện | 15,8 | 15,1 |
| chữ-trên-màn (shot riêng) | 13,7 | 11,0 |
| tiểu-cảnh (nhân vật tí hon giữa khung trắng) | 11,6 | 11,7 |
| cảnh-đông-người | 6,3 | 9,1 |
| phản-ứng-nhân-vật-khác | 6,3 | 6,8 |
| đặc-tả | 4,2 | 3,1 |
| ảnh-thật / meme | 2,1 | 2,3 |

Thêm 12 "snap" đổi tư thế trong cùng cảnh (giữ 0,3–1,8 s) — cách tham chiếu
tạo cảm giác chuyển động mà không cắt.

### 6.2 Nói trực diện (TD)

Toàn phim **16,0 % thời gian** (cận dưới); 29 đoạn, trung vị 1,83 s, p25/p75
1,17/2,92 s, dài nhất 6,83 s (mở đầu). Khoảng rời TD: trung vị **10,5 s**, p25/p75
4,5/17,7, max 34,5 s; 15/28 khoảng > 10 s. Sau mở đầu, TD không giữ quá ~3 s (p75).

Rời TD ngay khi lời chuyển từ *bình luận* sang *sự kiện / ví dụ / liệt kê /
lời nhân vật khác*. Về TD thường **sau một shot nhỏ/lạnh** (tiểu cảnh 3, phản
ứng 3, minh hoạ 3, trắng 2, chữ 2), không về thẳng từ thẻ chữ lớn (trừ "NOPE!").

**Khung TD chuẩn** (bbox nét): nhân vật x 0,52–0,96, y 0,10–1,00 → **rộng 38–44 %
khung, lệch phải, cắt ở ngực, nửa trái trống** cho chữ/insert. TD cận (sợ) rộng
53 %; nhân vật + prop bàn rộng 51 % cao 83 %; tí hon rộng 13–19 % cao 33–39 %;
đặc tả mặt rộng 68 % cao 100 %; lớp học đông 90 %/94 %.

### 6.3 Câu chốt xử lý bằng 3 kiểu

- **Chữ lớn tức thì**: "YOU'RE WRONG" hiện 1 khung ở 74,667 s, giữ 12 khung, trắng 8 khung, rồi video thật; "NOPE!" 322,90 s hiện rồi phóng 45 → 67 % cao khung trong 0,4 s → cắt cứng về TD 323,40.
- **Đặc tả leo cỡ theo bước cứng**: 1:03,58 trung (0,92 s) → 1:04,50 cận (0,75 s) → 1:05,25 sát (1,92 s) → trắng 2,9 s. Cướp biển: 5:05,58 rộng → 5:06,67 lao vào máy (0,5 s) → 5:07,17 phản ứng (2,3 s) → 5:09,50 TD sợ (1,5 s).
- **Im hình**: trắng 2,5–3,6 s sau câu chốt.

### 6.4 Shot dưới 1 giây dùng để làm gì (30/95)

chữ/nhãn liệt kê 8 (0,4–0,8 s mỗi mục) · nháy trắng 7 (0,25–0,6 s) · TD chêm 4
(0,5–0,85 s) · bước hành động 4 (cửa mở, lao vào) · bước zoom đặc tả 2 · thiết lập
rộng 2 · tiểu cảnh 2 · phản ứng 1 (0,25 s "yup.").

### 6.5 Cỡ cảnh giữa hai shot liên tiếp (68 chuyển)

cùng cỡ 34 % · gần hơn 35 % · xa hơn 31 % — không có xu hướng rộng→cận cố định;
trung→trung nhiều nhất (23: đổi nội dung, giữ cỡ). Hai shot cùng bố cục thay nội
dung (5:33,00 nam / 5:33,75 nữ) là mẫu "so sánh".

---

## 7. Chữ trên màn, nền, prop, insert

### 7.1 Chữ

- **≥ 32 lần / 403 s (1 lần / 12,6 s)**; trong 2 đoạn 22/95 shot có chữ (23 %): viết tay 8, thẻ thay cảnh 7, nhãn 4, kèm 3.
- Bốn kiểu: (1) **kèm** nhân vật, sans đậm, cao 5 % khung ("random memories" x 0,55–0,93 ngang mặt); (2) **thẻ thay cảnh** trên nền trắng, căn giữa, kinetic (dòng dẫn 6 %, "Mr. Captain" 12 %, "JACK SPARROW!!" 18 % rộng 99 %, "NOPE!" 45 → 67 %); (3) **nhãn** in đậm trên đầu nhân vật cao 9 %, y 0,06–0,16, 0,4–0,8 s mỗi nhãn; (4) **viết tay** in hoa cạnh tiểu cảnh, thường có mũi tên ("first grade jaiden" 19 %×19 %, "I'M GONNA JUMP OVER THE NET!!!!" 40 %×24 %).
- Hiệu ứng vào: **tức thì 1 khung, không fade, không trượt**. Kinetic từng từ đúng lúc nói: But 320,15 / that 320,23 / was 320,40 / not 320,65 / the 320,90 / end 320,98 / of 321,15 / Mr. 321,32 / Captain 321,73 / JACK 322,07 / SPARROW!! 322,40 / NOPE! 322,90 → TD 323,40. Chữ chỉ biến mất khi cắt shot. Font sans geometric đậm, đen 100 %; nhấn bằng cỡ, không bằng màu. Ảnh: `$S/shotgram/s24_cap.jpg`, `s24_jump.jpg`, `s24_rm.jpg`, `s24_yw.jpg`, `s24_s101.jpg`.

### 7.2 Nền

**194/231 shot (84 %) nền trắng có nét vẽ; 27 (11,7 %) trắng hoàn toàn; 10 (4,3 %)
không trắng** (video chim cánh cụt 1,3 s; ảnh thật che khung; ảnh chụp bình luận;
poster; phòng tối đèn laser 3,25 s + 2,1 s; "NOPE!" che khung). Ảnh/clip thật
**4 lần / 403 s**, mỗi lần ≤ 2,6 s, trước/sau có nháy trắng 0,3 s.

### 7.3 Prop

Bàn học (hộp phối cảnh 2 điểm tụ), cửa (cánh mở vẽ thành hình bình hành), lớp
học (hàng bàn tụ về một điểm + đầu trọc không mặt), bàn phỏng vấn + mic, phong
bì răng, khăn giấy, nhiệt kế, cờ, kiếm, vợt, sân tennis 2 sân + lưới, giá vẽ,
máy tính + loa, gậy golf. **Chỉ vẽ đúng prop câu đang nhắc, không vẽ phòng.**

### 7.4 Font tiếng Việt miễn phí đã kiểm dấu chồng (`$S/fonts/vi-font-sheet.png`, `got.json`)

Google Fonts có 1946 font; **99 Handwriting + 88 Display** có subset `vietnamese`.
Render đủ dấu, không tofu: **Patrick Hand, Itim, Mali, Pangolin, Sriracha, Playpen
Sans, Fuzzy Bubbles, Shantell Sans, Grandstander** (chữ tay); **Bangers** (comic caps,
dấu hơi sát), **Baloo 2, Rowdies** (tiêu đề). Amatic SC quá mảnh. Nạp bằng
`@remotion/google-fonts` `loadFont(style, {weights, subsets: ['vietnamese']})`.

---

## 8. Công nghệ: chọn / không chọn

Nguồn: `$S/nghien-cuu-cong-nghe.json`, bench `$S/bench/`.

### 8.1 Dân storytime làm bằng gì (nguồn wiki/blog, độ tin cậy trung bình)

Jaiden: Adobe Animate + Photoshop + Audacity; TheOdd1sOut: Animate + Premiere;
Domics, Ice Cream Sandwich: Animate (trước là Clip Studio, OpenToonz, Toon Boom).
Chu kỳ 4–12 tuần/video; Animate mặc định 24 fps. Không có nguồn công khai về
mouth chart cụ thể của họ — số đo ở §5.1 thay thế.
Nguồn: https://en.wikipedia.org/wiki/Jaiden_Animations , https://en.wikipedia.org/wiki/TheOdd1sOut ,
https://youtube.fandom.com/wiki/Ice_Cream_Sandwich , https://helpx.adobe.com/uk/animate/using/animation-basics.html .

### 8.2 Bảng quyết định

| Công nghệ | Quyết định | Lý do (số đo) |
|---|---|---|
| **24 fps**, 1920×1080 | **Chọn** | khớp tham chiếu; −20 % frame; 1080p chỉ +4 % thời gian so 720p |
| Pose + hold + lean key (mô hình dữ liệu kiểu Spine: bones / slots / attachments / cue) | **Chọn** | 24 frame/hình khi tĩnh; 79 % snap 1 frame; slot "mouth" đổi attachment theo cue — https://esotericsoftware.com/spine-json-format |
| Rhubarb 1.14.0 `-r phonetic -f json --extendedShapes GHX` | **Chọn** | 11× realtime; 6,6 cue/s hợp nhịp âm tiết Việt; MIT; không cần Python. `GHX` = 8 hình nói A–H + X nghỉ — khớp `src/v2/rig/mieng.tsx` đã có; G, H mỗi hình chỉ 1,1 % nhưng vẽ thêm không tốn gì |
| Hậu xử lý cue: quantize trội theo frame, hold tối thiểu 2 frame, dịch sớm 2 frame | **Chọn** | Williams; đo 23 run 1-frame nếu on ones thuần @24 |
| whisperX align `vi` → viseme theo chính tả | **Giai đoạn 2** | cần torch (chưa cài); mới áp được luật phụ âm ≥ 2 frame theo chữ |
| MFA tiếng Việt | Dự phòng | cần conda |
| Gentle, Papagayo-NG, npm `rhubarb-lip-sync` | **Không** | chỉ tiếng Anh / GUI / gói rỗng 0.0.1-alfa |
| Bộ viseme 8 hình nói (Rhubarb A–F + G + H) + X nghỉ | **Chọn** | 8 cụm chiếm 91 % frame miệng thật; Blair 10 / Oculus 15 / Character Animator 14 dư |
| SVG thuần + `@remotion/paths` + `@remotion/shapes` | **Chọn** | đã có trong `node_modules` 4.0.395, chỉ thiếu trong `package.json`; `interpolatePath`, `normalizePath`, `getPointAtLength`, `evolvePath` |
| `paint-order="stroke"`, `stroke-linejoin/linecap round`, `vector-effect="non-scaling-stroke"` | **Chọn** | nét dày đều, chi phí 0 |
| feTurbulence + feDisplacementMap (line boil) | **Chọn có kiểm soát, mặc định tắt** | 0 s thêm (15,6 vs 15,5 s) nhưng mp4 10 s **0,77 → 15,3 MB**; tham chiếu boil chỉ 4/20 shot |
| `warpPath` jitter mỗi frame | **Không** | +49 % (800 path) đến +224 % (3000 path) thời gian, JS-bound; nếu cần thì memo 2–3 biến thể/path |
| rough.js | Không (có thể cho nền) | phong cách khác nét sạch |
| `@remotion/lottie` | Không cho nhân vật | cần AE; expressions gây flicker |
| `@remotion/rive` | **Không** | cần Rive editor; canvas không GPU chậm |
| `--gl=swangle` | **Không** | 103,5 s vs 15,5 s (7×) |
| Concurrency > 3–4 | Không | c = 1/3/6 đều ≈ 15,5 s |
| Font Patrick Hand / Itim / Playpen Sans + Bangers hoặc Baloo 2 (subset vietnamese) | **Chọn** | đã kiểm dấu chồng bằng mắt |

Bẫy đã vấp: `warpPath(path, fn)` — **fn nhận một object `{x, y}`**; truyền `(x, y)`
sẽ ra `M [object Object]NaN` và khung trắng không báo lỗi → validator phải kiểm
`/NaN/.test(d)`.

### 8.3 Chi phí render (đo `$S/bench/`, 720p 24 fps 240 frame, c = 3)

| Cấu hình | Thời gian | mp4 10 s |
|---|---|---|
| Plain 800 path stroke 6 px | **15,5 s** | 0,77 MB |
| feTurbulence 1 filter | 15,6 s | 15,3 MB |
| 8 filter riêng | 15,6 s | 18,2 MB |
| warpPath mỗi frame | 23,1 s | 22,5 MB |
| n = 10 path | 14,9 s | |
| n = 3000 plain / turb / warp | 15,1 / 16,1 / 49,0 s | |
| c = 1 / c = 6 | 16,3 / 15,2 s | |
| 1080p (scale 1,5) | 16,1 s | |
| PNG | 14,5 s | |
| `--gl=swangle` | **103,5 s** | |

→ Sàn **≈ 15,5 khung/s** bất kể độ phức tạp SVG; nút thắt là chụp khung + mã hoá.
Repo hiện tại đo từ mtime 21 đoạn `out/.seg-TinhDau-*`: 900 frame / 51–57 s =
**16,9 fps render** với `--concurrency=2` → 1 phút video ≈ 1,8 phút render @30 fps;
@24 fps còn ≈ 1,45 phút.

### 8.4 Rig mã nguồn mở đáng học cấu trúc (chỉ lấy ý)

Pose Animator (SVG nhóm `skeleton` + `illustration`, https://github.com/yemount/pose-animator/);
Spine JSON (bones → slots → attachments → animations, attachment timeline cho miệng);
Synfig Skeleton Layer; Character Animator (tag = tên layer `Mouth/Ah/D/Ee…` → quy ước
`<g id="mouth-A">`); Papagayo `.dat` (dòng `frame shape`).

---

## 9. Repo hiện tại: giữ gì, đập gì (audit 2026-09-09)

Trạng thái: `npx tsc --noEmit` exit 0; `npx remotion compositions` 3,0 s, 7 composition
(`TinhDau` 18.846 frame; `RaTruongVui` 11.433; `RaTruongBuon` 23.446; 4 bảng thử);
`kiem-tra.mjs tinh-dau` qua hết. Git: 10 file sửa chưa commit + 7 untracked (toàn
bộ `src/projects/tinh-dau/`, `kieu.ts`, `toc.tsx`, `hoc-duong.tsx`, `scripts/tinh-dau.json`).
Ảnh đối chiếu: `$S/audit/sheet_current.jpg` vs `$S/ref-oV/burst/sheet_talk.jpg`.

### 9.1 Ràng buộc ngầm đo được trong code

1. Độ phân giải mọi mốc = **một cụm phụ đề** (`neo()` trả `round(c.start)` của cụm chứa ký tự; cụm ≈ 7 từ ≈ 2–3 s); thời điểm cụm là ước lượng theo âm tiết — Gemini không trả timestamp.
2. Shot chỉ đổi tại mốc `say`; giữa hai mốc mọi thứ tĩnh trừ: thở sin (chu kỳ 26/15), đổi chân trụ (120 frame), lắc đầu sin/52, gật theo `nhan`, chớp mỗi 92–138 frame nhắm 4 frame, liếc đổi mỗi 74 frame, zoom trôi +3,5 %.
3. Nhân vật chỉ đổi tư thế lúc cắt: `tron(TU_THE[dangTruoc], TU_THE[dang], e)` 10 frame cubic-out + overshoot sin·0,12.
4. `NGAN_NHAT = f(2.4)` **bỏ hẳn mốc** (không dời), validator không báo; shot đầu chương luôn `from = 0` dù mốc đầu neo ở 1,8–2,4 s (3/14 chương).
5. Mọi cắt là mờ chồng 13 frame (`MoChong`); `vui.tsx` xoay 4 kiểu vào shot theo `i % 4`.
6. Cận = zoom khung SVG (`CO = {rong 1, trung 1.32, can 1.95, sat 2.7}`) → nét 5,5 px thành ~15 px, chi tiết mặt không tăng.
7. `FPS = 30` hardcode ở 3 nơi (`engine/theme.ts`, `pipeline/analyze-voice.mjs`, `render-segments.sh`); `voice.json` lấy mẫu theo 30 fps.
8. `render-segments.sh` giữ bản sao `[intro, pad]` cho từng composition.
9. `.sig` = sha1(voice + style + vo) **không gồm model**.
10. `kicker`/`heading` bắt buộc và luôn hiện 5 s đầu chương.
11. Hai schema `Moc` khác nhau (`ra-truong/board.ts` phẳng; `tinh-dau/board.ts` có `dien[]`); ba bản `dung()`/`Khung`/`NHAC` copy-paste (phim.tsx 277 dòng, vui.tsx 359, buon.tsx 314).
12. Code chết: `engine/cues.tsx Caption2`, `pipeline/tts.mjs` (ROOT sai), `cast/dien.tsx` (sống nhờ `import type`), `cast/cast.tsx`.

### 9.2 Rig hiện tại so với tham chiếu

| Tiêu chí | Tham chiếu | Rig hiện tại (`than-hinh.ts`, `nhan-vat.tsx`) | Hệ quả |
|---|---|---|---|
| Đầu / chiều cao | 41 % (chính), 26 % (phụ) | `DAU*6` → **16,7 %** | mặt bé, không đọc được biểu cảm (CastTest scale 0,72: đầu ≈ 30 px @1280) |
| Đầu / vai | 1,6–1,9 | 78/128 = **0,61** | dáng "người thật", mất chất cartoon |
| Cổ | 0,06–0,1 sọ | `coRong*2` = 0,4 sọ + mảng tối | cổ to như cột |
| Mắt | 1 oval đen | lòng trắng + mống + ngươi + highlight + viền nửa dưới + mày dày | **8/8 nhân vật đọc thành đeo kính** (`$S/ref-oV/style/rig-hien-tai-cast.png`) |
| Mày | không có mặc định | luôn vẽ, `NET*1.5` | mặt nặng |
| Miệng | 0,40 sọ, đổi hình mỗi 1–3 frame | 0,20 sọ, 7 hình tĩnh theo `sac`, **không đổi khi nói**; `am` được tính rồi bỏ | "mồm cứ O O" |
| Bàn tay | 4 ngón, ≥ 8 kiểu | 1 blob mitten | không chỉ/nắm/xoè được |
| Nét | 3–6 px @1280 đều | `NET` 5,5 / `NET_MANH` 3,6 cố định theo DAU = 78, thu theo `s` | lúc mảnh lúc đứt |
| Tô | 2 mảng | 19 màu + tông tối cel (`daT, aoT, tocToi, tocSang`) | "vector clipart 3D" |
| Tóc | 1 khối + 2–3 gạch | 3 lớp khối/tối/sáng; `toc.tsx` 0 lần dùng frame | bóng nhựa |
| Chuyển động | hold tuyệt đối | sine thở/lắc/đổi chân liên tục | "giật giật" |
| Nhân vật phụ | đầu trắng không mặt | không có | đám đông = 8 nhân vật đủ chi tiết |

Ghi chú: bản cũ `Teo` trong `cast.tsx` (đầu r = 96 / cao 440 = 44 %) **gần tham
chiếu hơn** bản mới; comment trong `than-hinh.ts` gọi đó là "tỉ lệ đồ chơi" và sửa
về 6 đầu — đi ngược phong cách storytime.

Dữ liệu `voice.json` hiện tại **đủ ổn định để lượng tử hoá**: `am > 0,3` ở 55 % frame,
trạng thái mở/đóng đổi 0,9 lần/s, run trung vị 28 frame, chỉ 6 % run < 3 frame →
vấn đề "lắp bắp" nằm ở cách dùng biên độ liên tục, không ở dữ liệu.

### 9.3 Validator `kiem-tra.mjs`

143 dòng, 7 kiểm; 1–3 đọc JSON thật, **đáng giữ**; 4–7 đọc `board.ts` bằng regex:
`([^}]*)` dừng ở `}` đầu tiên → với `doi('nam','ha',{sac:'soc'},{…})` chỉ soi người
thứ nhất (44 mốc); không soi `kieu`, `x`, `s`, `flip`, `nhac`, `sfx`; không biết 23
mốc bị gộp; không tính frame; kiểm "đứng yên quá lâu" thực chất là `mocs.length < 3`.

### 9.4 Cảnh: 34 cảnh SVG (1.394 dòng)

Đều là background plate liền khối (nền màu + `SAN` + vật thể). ~25 khối bóc được
thành prop (bảng, bàn học, quạt trần, cột cờ, cây phượng, ghế đá, cột điện, bàn tròn
+ 2 ly, đèn thả, cổng + băng rôn, đèn bàn + sách, bàn + laptop, đồng hồ, cubicle,
cửa xoay, hộp sữa, giường, khung ảnh, tách cà phê, phông bạt); 8 cảnh `an-du.tsx`
+ 6 màn hình giữ làm **insert** toàn khung (đổi nền trắng, tham số hoá chữ); 10
cảnh hardcode chữ với `fontFamily="system-ui"`; `defs id` toàn cục (`g-tn, g-san,
nguoi, vai, ria`) sẽ đụng khi nhiều prop chung SVG. `DamDong` trong `chieu-sau.tsx`
đúng ngữ pháp storytime — giữ.

### 9.5 Cái đã tốt, giữ nguyên

`pipeline/gemini-tts.mjs` (xoay 2 key × 3 model, loudnorm, ffprobe) · `tts-gemini.mjs`
(`.sig`, chặn bản đọc dài) · `analyze-voice.mjs` (am/nhan/nghi — X∩nghi = 1,00) ·
`build-manifest.mjs`, `audition.mjs`, `sfx.py` · `src/engine/neo.ts` (dò toàn lời bình
theo ký tự) · `cues.tsx` (`splitCues/cueTimings` theo âm tiết) · `sub.tsx`, `font.ts` ·
`render-segments.sh` (đoạn + cache + concat) · `thu-vien.json` làm danh mục · hệ đơn
vị `DAU` + gốc ở chân + tách kieu/than-hinh/tu-the/vẽ · `bam()`/`random(seed)`
deterministic · nhạc CC BY + sfx tự tổng hợp.

---

## 10. Mâu thuẫn giữa các báo cáo và cách chốt

| Chủ đề | Báo cáo A | Báo cáo B | Cách chốt |
|---|---|---|---|
| Shot trung vị | 1,25 s (`cuts_px.json`, pixel-diff, 472 s có credits) | 1,42 s (`master_starts.json`, hợp nhất 2 bộ dò, 403 s thân phim) | Dùng **1,42 s** làm mục tiêu (bộ dò đầy đủ hơn, bỏ credits); 1,25 là cận dưới |
| Run cycle | timing: 2 hình AABB **on twos**, chu kỳ 4 | công nghệ: 40/40 frame là hình mới (**on ones**) | Cả hai đúng: pixel-diff thô thấy mọi frame khác vì **vị trí trượt on ones 12 px/frame**; sau khi căn x0, autocorrelation k=4 ≈ 0 → **hình on twos, vị trí on ones** |
| Vào cảnh | công nghệ: "smear 3–4 frame" | timing: lean key 1 frame + overshoot 1 frame + settle 2 frame, "không smear/blur" | Cùng một sự kiện 4 frame; bản chất là **1 hình key kéo dãn** (stretch) + settle, không phải blur/multiples. Thiết kế dùng "lean key" |
| Chớp mắt | timing + nét vẽ: **0 chớp** / 21,6 s | nét vẽ đề xuất chớp 2 frame mỗi 3–5 s; nhiệm vụ yêu cầu "không frame nào đứng yên > 3 s không chớp" | **Chốt lại sau phản biện 2026-09-10: không chớp tự động** (`blink.ratePerSec: 0`, đúng §3.9). Lý do: cổng "không hold > 72 frame không chớp" sẽ đánh trượt chính tham chiếu (hold p90 = 50 frame, max 114, shot 2:08 tĩnh 144 frame với 6 hình); "giọng Việt chậm nên hold dài" không được đo, và chớp che triệu chứng cắt thưa. Mắt nhắm chỉ là **trạng thái biểu cảm** đổi cùng snap. Yêu cầu "không đứng yên > 3 s" chuyển thành "không hold > 72 frame **mà không có cắt, snap hoặc chữ mới**" (`docs/thiet-ke-v2.md` K29). Bản chốt cũ (blink 3–5 s) bị huỷ |
| Hold miệng | timing: on ones (87 % giữ 1 frame) | lip-sync: hold = 2 (on twos) để hết run 1-frame | **Chốt lại sau phản biện 2026-09-10: on ones thật, chỉ A và X giữ ≥ 2 frame** (Williams), mọi ký hiệu khác được 1 frame; trong run cùng ký hiệu đảo **3 biến thể mỗi frame** (§5.1 "cùng biên độ vẫn xen kẽ hé/rộng/dẹt"). Lý do huỷ "hold tối thiểu 2 toàn chuỗi": `tinh-dau.mouth.json` hiện có (30 fps, hold 1, chưa gộp) chỉ đạt **5,92 đổi/s khi nói**, run 1 frame 4 %, run ≥ 9 frame 276 lần — ép hold 2 nữa thì trần lý thuyết 12/s, thực tế ≈ 5/s = 1/3 tham chiếu (16–19/s đo lại trên `burst/talk_*` 0:36–0:39: 56/71 chuyển frame đổi hình). Cổng nghiệm thu: ≥ 12 đổi/s khi nói, run 1 frame ≥ 50 % |
| Chuyển tư thế | công nghệ/audit: `spring()` 4–8 frame | timing: snap 1 frame (79 %), không ease | **Snap 1 frame mặc định**; `keys` 3–5 hình rời cho 15 % chuyển động lớn; không spring |
| FPS | lip-sync: giữ 30 (hoặc 24 nếu đổi toàn repo) | timing + công nghệ: 24 | **24** — khớp tham chiếu, −20 % render; `voice.json`/`mouth.json` phải ghi `fps` và sinh lại |
| Số hình miệng | lip-sync: 9 ký hiệu (GHX), tối thiểu 6 | nét vẽ: 8 lipsync + 6 cảm xúc | **8 hình nói A–H + X nghỉ** (`--extendedShapes GHX`, đúng như `src/v2/rig/mieng.tsx` và `pipeline/lipsync.mjs` đã viết) + miệng cảm xúc thay X theo sắc thái |
| Boil | nét vẽ: 0 boil trong 72 khung nói | timing: boil 4/20 shot | Nhất quán: boil là **hiệu ứng cục bộ** (run/sôi), không phải mặc định → opt-in ≤ 20 % shot |
| Thở/idle | audit: rig hiện có thở sin | timing: đầu/thân 0 px khi hold | **Tắt mặc định**; chỉ cho phép ở toàn cảnh, biên độ ≤ 0,01 DAU, không áp lên lớp đầu |

---

## 10b. Số đo bổ sung từ phản biện thiết kế (2026-09-10)

Phản biện `docs/thiet-ke-v2.md` (ba góc: khả thi · trung thành · agent lái được) đo thêm
trên máy này. Ghi lại vì các quyết định ở §10 và trong thiết kế dựa vào chúng.

| Chủ đề | Số đo | Script / tệp |
|---|---|---|
| Độ phân giải `neo()` hiện tại | Cụm 7 từ dài 1,32–3,21 s trên `cho-ngoi`; 15 `say` của ví dụ thiết kế → **12** `from` khác nhau (3 trùng); 7/9 `@từ` rơi đúng đầu shot | `$S/neo-test.mjs` |
| Neo cấp **từ** (cùng trọng số `cueTimings`, mỗi từ một phần tử) | 87 từ, độ dài từ trung vị **0,315 s**; 15/15 `from` khác nhau; `@từ` rơi +7…+47 frame sau đầu shot | `$S/neo-tu-test.mjs` |
| Ước lượng âm tiết so với tiếng thật | 14 chương `tinh-dau`, 160 ranh giới cụm có dấu câu vs mốc X→nói của `mouth.json`: lệch trung vị **0,65 s**, p75 1,13, p90 1,70; 8 % trong 0,15 s; 59 % sớm hơn tiếng. Tại 97 ranh giới câu (X-run ≥ 0,2 s): trung vị **0,78 s**, 40 % > 1 s | phản biện (script trong scratchpad phiên phản biện) |
| Căn cụm theo X-run rhubarb thật (`cho-ngoi`, `rh_test.json`) | 13 X-run ≥ 6 frame @24; 9 ranh giới dấu câu: lệch trước căn trung vị **0,55 s**, p90 1,33, 1/9 trong 0,15 s; ghép tham lam ±1,5 s được **7/9**; 6 X-run là hơi ngắt không dấu câu; X = 33,7 % chương | `$S/can-cue-test.mjs`, `$S/cho-ngoi.tu-can.json` |
| Miệng hiện có | `tinh-dau.mouth.json` (30 fps, hold 1, chưa gộp): **5,92 đổi/s khi nói**, run 1 frame 4 %, run 2 frame 33 %, run ≥ 9 frame 276 lần. Tham chiếu đo lại `burst/talk_*` 0:36–0:39: **56/71 chuyển frame đổi hình = 18,9 đổi/s** | phản biện |
| Tốc độ giọng | Charon **2,06 âm tiết/s**, 5,43 s/câu, X 39,3 % toàn bài; Jaiden 3,31 từ/s, 2,97 s/câu | §5.2, §1.1 |
| Render `--scale` | `TinhDau --frames=900-1019 --concurrency=2`: scale 1 = 8,49 s, `--scale=0.33` = 8,06 s (**−5 %**); `still` một khung 2,71 s (khởi động ≈ 2,5 s) → ≈ 20 khung/s sau khởi động; scale nhỏ không cho 9× | `$S/bench2/` |
| Bộ dò cắt trên V1 | `tinh-dau.mp4` 5–65 s, 12 fps 320 px, pixel-diff > 18: 11 cắt, trung vị **4,50 s** (không phải 7,37 s của §2.4 vốn đếm mốc board); mỗi cắt kéo 2,7–5,2 frame vì `MoChong` 13 frame; 1,1 % khung diff = 0 | `$S/v1cut/` |
| Validator `kiem-tra-v2.mjs` | Board cài 23 lỗi: **16 lọt, 4 chặn, 3 cảnh báo** (khoá lạ im lặng, act ngoài shot, `x` ngoài khung, loai↔noi mâu thuẫn, tên máy dùng, đè nhau) | `$S/phan-bien/board-xau.json` |
| Board agent viết (`demo-v2/board.json`) | 80 shot / 83,2 s; 67.326 byte pretty / 24.494 compact (295 byte/s); 434 số thực `x/y/co/tai` tự đặt = 5,4/shot; 11 shot `tai` tuyệt đối → 4/4 chương cảnh báo thứ tự; 3 shot < 0,25 s | `src/projects/demo-v2/board.json` |
| Rig V2 chỉ mặt trước | Tham chiếu: s046 quay đầu 3 hình rời (nghiêng → 3/4 → profile); sheet01 1:42 phỏng vấn 3/4; 1:06 hai người nhìn nhau; ≈ 15 % chuyển động lớn cần hướng đầu | §3.1, `sheets/sheet01.jpg` |
| Đo lại `CO_CANH` v2 (200/330/560/900/110) so tham chiếu | `nho` 110 → cao 286 px = 26 % H (tham chiếu 33–39 %); `rong` 200 → 48 % H (tham chiếu 56 %) | §4.3, §6.2 |
| Zoom bằng scale SVG quanh tâm khung | `can` x 0,72, z 1,6 → tâm mặt 0,85 W, sọ 896 px = 0,47 W → mất ~20 % mặt ngoài mép — đúng lỗi §9.1-6 | tính từ `san-khau.tsx` |

Hệ quả đã ghi vào `docs/thiet-ke-v2.md` (mục "Phản biện đã xét"): mốc cấp từ căn X-run,
on ones + 3 biến thể, không chớp, giọng TTS phải ≥ 2,8 âm tiết/s, hướng đầu, một bảng cỡ
cảnh, `zoom_buoc` là bước cỡ, validator chặt.

---

## 11. Chỉ mục tệp minh chứng (đường dẫn đầy đủ)

Gốc: `/private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad`

### Tham chiếu và khung hình
- `…/scratchpad/ref-oV/ref.f398.mp4`, `ref.f251.webm`, `ref.info.json`, `transcript.txt`, `ref.en.vtt`
- `…/scratchpad/ref-oV/frames2s/`, `sheets/sheet00..07.jpg`, `frames12/`, `motion12.npy`
- `…/scratchpad/ref-oV/cuts_px.json`, `cuts.json`, `analyze.py`

### Timing
- `…/scratchpad/ref-oV/timing_rules.json`, `px24.json`, `diff24.json`, `events24.json`
- `…/scratchpad/ref-oV/px24.py`, `events24.py`, `period.py`, `diff24.py`, `sheet8.py`
- `…/scratchpad/ref-oV/b24/{s005,s016,s046,s050,s086,s121,s170,s175,s209,s220,s240,s270,s282,s314,s345,s380,s440}/`
- `…/scratchpad/ref-oV/sheets24/{s005…s440}.jpg`
- `…/scratchpad/ref-oV/strips/pirate_entry.jpg`, `pirate_jump.jpg`, `nose_turn.jpg`, `s046_turn.jpg`, `s220_bubble.jpg`, `s345_cycle.jpg`, `s175_shiver.jpg`, `s170_shiver.jpg`, `s005_eyes.jpg`
- `…/scratchpad/ref-oV/burst/sheet_talk.jpg`, `sheet_pirate.jpg`, `sheet_nose.jpg`, `sheet_mid.jpg`
- `…/scratchpad/ref-oV/hold24/`

### Nét vẽ, thiết kế
- `…/scratchpad/ref-oV/style/mouth-chart.jpg`, `faces.jpg`, `so-lieu-do.json`, `frames2s_stats.json`
- `…/scratchpad/ref-oV/style/_hands_index.jpg`, `_talk_faces.jpg`, `_mouth_uniq.jpg`, `_faces_index.jpg`, `_full_index.jpg`, `_lineup_index.jpg`, `_lineup3_index.jpg`, `_m_t0.jpg`, `_m_t20.jpg`, `_m_t192.jpg`, `_m_b005.jpg`, `_m_e175.jpg`, `_m_expr4.jpg`
- `…/scratchpad/ref-oV/style/rig-hien-tai-pose.png`, `rig-hien-tai-cast.png` (render rig hiện tại để đối chiếu)
- `…/scratchpad/ref-oV/full/`, `talk1280/`, `faces1280/`, `lineup/`, `lineup3/x_025.png`

### Lip-sync
- `…/scratchpad/ref-oV/tools/Rhubarb-Lip-Sync-1.14.0-macOS/rhubarb` (+ `res/`), `rhubarb-macos.zip`
- `…/scratchpad/ref-oV/tools/cho-ngoi.16k.wav`, `cay-but.16k.wav`, `cho-ngoi.48k.wav`
- `…/scratchpad/ref-oV/tools/cho-ngoi.phonetic.json`, `cay-but.phonetic.json`, `cho-ngoi.sphinx.json`, `cho-ngoi.phonetic.{AF,dialog,run2,run3,run4,run5}.json`, `cho-ngoi.48k.json`, `*.time.txt`
- `…/scratchpad/ref-oV/tools/all14/` (14 `<id>.wav` + 14 `<id>.json` + `_tong.json`)
- `…/scratchpad/ref-oV/tools/cho-ngoi.align.json`, `cho-ngoi.timeline10s.png`, `cho-ngoi.dialog.txt`
- `…/scratchpad/ref-oV/tools/cho-ngoi.mouth.24fps.hold1.json`, `cho-ngoi.mouth.24fps.hold2.json`, `cho-ngoi.mouth.30fps.hold1.json`
- `…/scratchpad/ref-oV/tools/proto/lipsync.mjs`, `proto/out/tinh-dau.mouth.json`
- `…/scratchpad/ref-oV/tools/mieng9.svg`, `mieng9.png` (9 hình miệng SVG đề xuất)
- `…/scratchpad/ref-oV/tools/phan_tich.py`, `bang10s.py`, `quantize.py`, `fallback.py`
- `…/scratchpad/ref-oV/mouth_talk/` (48 khung 1280 + `_mouths_marked.jpg`), `mouth_pirate/`, `mouth/mouth_clusters.png`
- `…/scratchpad/rhubarb/me-hoi.wav`, `me-hoi.phonetic.json`, `me-hoi.sphinx.json`, `me-hoi.GX.tsv`, `README.adoc`

### Ngữ pháp shot
- `…/scratchpad/shotgram/master_starts.json`, `labels.json`, `td_runs.json`, `cuts2.json`, `all_groups.json`, `shot_metrics.json`, `seg_0000_0120.json`, `seg_0300_0360.json`, `frame_metrics.npz`, `inner_metrics.npz`, `dark_feat.npy`, `td_mask.npy`
- `…/scratchpad/shotgram/board-schema-de-xuat.json`
- `…/scratchpad/shotgram/align_cuts.py`, `metrics.py`, `detect2.py`, `labels.py`
- `…/scratchpad/shotgram/seg_0000_0120_sheet00–04.jpg`, `seg_0300_0360_sheet00–03.jpg`, `new_0000_0120.jpg`, `new_0300_0360.jpg`, `strip_67_76.jpg`, `strip_26_29.jpg`, `strip_181.jpg`, `strip_88_94.jpg`, `s24_rm.jpg`, `s24_yw.jpg`, `s24_cap.jpg`, `s24_jump.jpg`, `s24_s101.jpg`, `td_check.jpg`, `check_mask.jpg`, `mask_td_4p5.png`
- `…/scratchpad/ref-oV/b24_rm/`, `b24_yw/`, `b24_cap/`, `b24_jump/`, `b24_s101/`

### Công nghệ
- `…/scratchpad/nghien-cuu-cong-nghe.json`, `gf-metadata.json`
- `…/scratchpad/bench/src/Root.tsx`, `src/index.ts`, `dbg.mjs`, `dbg2.mjs`, `out/{Plain,Turb,Multi,warp3}.mp4`, `out/still_compare2.png`
- `…/scratchpad/fonts/vi-font-sheet.png`, `got.json`, `*.ttf`

### Audit repo
- `…/scratchpad/audit/shots.mjs`, `board-tinh-dau.mjs`, `board-ra-truong.mjs`
- `…/scratchpad/audit/sheet_current.jpg`, `frames/td_{12,60,150,262,400,555}.png`, `frames/rtv_{30,120,300}.png`
