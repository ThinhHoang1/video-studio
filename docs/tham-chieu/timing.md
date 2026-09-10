## Đo TIMING chuyển động tham chiếu — JaidenAnimations «My School Stories» (24fps, 1280x720)

Thư mục dữ liệu: `/private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/`

### 1. Tư liệu và cách đo
- 4 burst có sẵn (`burst/sheet_*.jpg`, khung 320x180) + 13 đoạn mới tách 24fps ở 640x360: `b24/s005 s016 s046 s050 s086 s121 s170 s175 s209 s220 s240 s270 s282 s314 s345 s380 s440` (96 khung/đoạn, s050 72 khung). Chọn theo 7 mốc gợi ý + cửa sổ nhiều khung đổi nhất trong `motion12.npy` (bỏ credits >400s).
- Contact sheet 8 cột nhãn `fNNN m:ss.ss`: `sheets24/*.jpg` (17). Strip phóng to soi in-between: `strips/*.jpg` (9).
- Đo pixel: `px24.py` (số px đổi |Δ|>48 + bbox mỗi frame; `.`=0, `m`<900 px = miệng/chi tiết, `P`≥900 = đổi tư thế, `C` = cắt theo histogram), `events24.py` (sự kiện + hold), `period.py` (autocorrelation k=1..12), tracking centroid/bbox cho vào cảnh/nhảy/zoom/pop. Kết quả thô: `px24.json`, `diff24.json`, `events24.json`, `timing_rules.json`.
- Lưu ý: `burst/pirate_*` chỉ 320x180 → đã đo lại trên `b24/s314` (cùng mốc 5:14) ở 640x360. Mọi px dưới đây ở 640x360, ×2 = 720p.

### 2. Kết quả

**2.1 Pose snap.** 97 sự kiện đổi tư thế (không tính cắt): 77 (79%) dài đúng 1 frame, frame trước/sau = 0 px đổi → không anticipation, không settle, không smear, không motion line, không blur. 8 sự kiện 2 frame = snap + frame sau chỉnh miệng (s175 f33/34, 39/40, 44/45…). 3 sự kiện 3 frame (pirate vào cảnh 5:14 f9–11; nose 0:50; s005 f60–61), 1 sự kiện 5 frame (s046 f67–71 thầy quay đầu: 3 hình rời f68 nghiêng, f69 nghiêng-profile, f70 profile + 2 frame chỉnh nhỏ 5252/5246 px). In-between khi có = hình vẽ rời rạc 1 frame/hình, độ đổi giảm dần 2 frame cuối (nose: 2592→3579→2541→859 px).
**Đầu không đổi khi snap ở cận cảnh**: centroid lớp tóc đo 16 snap (s270 f3/30/44/59, s005 f14, s345 f18/24, talk f12, s175 ×8): dx = dy = 0.0 px, số px tóc giữ nguyên 100% → chỉ tay + mắt + miệng đổi, lớp đầu/tóc khoá. Ở toàn cảnh (s016 f21/33/48/59/68/76/95) cả body đổi.

**2.2 Hold.** Toàn video 0–400s (12fps, n=338 hold giữa sự kiện rời rạc, đổi ra frame 24fps): p10=6, p25=10, p50=20, p75=36, p90=50, max=114. Phân bố: <12 fr 26%, 12–23 fr 28%, 24–47 fr 33%, ≥48 fr 13%. Cận cảnh đang nói: đổi tay/biểu cảm mỗi 8–27 frame (s270: 27,14,15,24; s016 toàn cảnh: 12,15,11,9,8,19). Chuỗi hoảng loạn s175: 7,5,11,8,10,7,11 frame. Trong hold chỉ miệng động (khi nói); mắt, lông mày, tóc, đầu đứng yên (std centroid ≤0.1 px). Boil (vẽ lại nét) chỉ ở 4/20 shot. 69.7% khung 12fps không đổi gì.

**2.3 Chớp mắt: 0 lần** trong 519 frame ≈ 21.6 s cận cảnh nói (talk, s270, s086, s005, s345, s209, s380, s175, mid, s016, s240). Kiểm tra: mọi sự kiện nhỏ đều nằm trong cụm bbox miệng (lệch y <25 px); ứng viên duy nhất s005 f51–56 soi `strips/s005_eyes.jpg` là nét miệng + vạch stress, không phải mắt. Mắt nhắm chỉ xuất hiện như trạng thái biểu cảm giữ 1–2 s (s209 f0–30 mắt nhắm cười), đổi cùng lúc với pose snap.

**2.4 Đầu khi nói: không nhún, không gật.** Std centroid tóc trong 6 đoạn nói: x 0.01–0.09 px, y 0.02–0.09 px; range ≤0.3 px. Bbox mọi thay đổi khi nói ≈ 80×45 px (160×90 px ở 720p) = đúng vùng miệng. Lipsync **on ones**: 73–96% frame có đổi miệng (trung bình 82%); hình miệng giữ 1 frame 87%, 2 frame 10%, ≥3 frame 3%; mean 1.18 frame/hình.

**2.5 Đi/chạy.** Pirate nhảy-chạy 5:17 (`b24/s314` f75–95): diff sau căn theo x0: k=1 luân phiên ~700/~7000 px, k=2 ~7300, k=4 ~1200 → **2 hình, mỗi hình giữ 2 frame (AABB, on twos), chu kỳ 4 frame**, còn vị trí trượt **on ones** 12 px/frame (24 px/frame 720p, ≈580 px/s). Bob dọc: top luân phiên 86/89 → 6 px ở 720p trên chiều cao nhân vật 394 px = 1.5%, coi như không bob; cảm giác nhảy đến từ hình tay chân.

**2.6 Vào/ra khung.** (a) Pirate 5:14 f9–12: f9 «lean-in key» (đầu to, nửa người ngoài khung, thân kéo chéo), f10 tới vị trí với overshoot +2.7 px (~1.5% bề rộng nhân vật), f11 +1.3 px, f12 final → 1 key + 1 overshoot + 2 settle = 4 frame. (b) Ra cảnh nose 0:50 f6–8: f6 «lean-out key» (xoay người nghiêng), f7 chỉ còn vai/tay ở mép, f8 biến mất = 2 frame. (c) Đa số còn lại là **pop-in 1 frame / cắt thẳng**: s086 f29 Jaiden hiện sau 15 frame trắng, s121 f15 và f94 Jaiden nhỏ, s046 f4 máu mũi (0→608 px đỏ, 1 frame), s240 f33. Không thấy trượt vào có ease dài.

**2.7 Squash/stretch/anticipation/overshoot.** Stretch: pirate f9, nose f6 (key nghiêng/kéo dài 1 frame). Anticipation trước snap: không (frame trước = 0 px). Overshoot: bong bóng 3:40 f9–12: f9 ≈5–10% cỡ, f10 ≈95%, f11 ≈105% (x0 54 vs 70, h 155 vs 148 → +4.5%), f12 100% rồi hold; pirate arrive +2.7 px 1 frame. Squash: không thấy. Zoom-gag tuyến tính rồi cắt: s345 f84–95 figure w 127→631 px trong 10 frame (~+55 px/frame, không ease), s121 chữ «oooo!!» f78–86 w 150→532 (+49 px/frame, 8 frame) rồi cut cứng f87.

**2.8 Chu kỳ lặp/boil.** s240 4:01 «blah» talk: 2 hình AABB on twos, chu kỳ 4 (k=4 → 0 px). s170 2:50 f9–19: 2 hình ABAB on ones, chu kỳ 2, centroid không dịch (boil nét, 1400 px). ABAC 3 hình on ones chu kỳ 4 (k=2 min 0, k=4 = 0): s175 lưng Jaiden 2:55 f3–22 (~400 px, centroid lệch 0.1 px), s220 bong bóng f13–33 (~965 px), s220 tay viết f81–95 (~420–555 px). s345 5:47 f51–83: 9 hình chu kỳ 10 (1 hình giữ 2), boil «run vì tức». FX/camera on ones: đèn disco s282 (mọi frame đổi 4–8k px), pan credits s440 (~18k px/frame). Bong bóng/chữ/nhân vật nhỏ: pop 1 frame.

**2.9 On ones hay on twos.** Đếm parity frame lẻ/chẵn có đổi: talk 2/1, pirate 28/27, s345 19/17, s270 3/3, s175 5/7 → cân → không «on twos» toàn cục. Chỉ 2 chỗ on twos: s240 (0/32) và s209 f58–86 trượt comment (1/18). Kết luận: lipsync on ones, snap 1 frame, FX on ones; **on twos chỉ dùng cho hình trong chu kỳ lặp** (chạy, blah-talk) trong khi vị trí vẫn on ones.

**2.10 Nhịp trắng & cắt.** 31 run khung trắng trơn trong 0–400s, median 18 frame, range 2–86 (vd 1:26.6 15 fr, 2:01.1 12 fr, 4:00.7 15 fr). Shot median 1.25 s, 98/232 shot <1 s (`cuts_px.json`).

### 3. Quy tắc timing dạng code (24fps)
```
FPS = 24
snap        = {frames:1, ease:none, inbetween:0, anticipation:0, smear:false, lockHeadLayerInCloseup:true}
moveKeys    = {keys:3..5, framesPerKey:1, settle: 2 frame cuối biên độ ~50%}   // chỉ 15% sự kiện
hold        = {min:6, p25:10, p50:20, p75:36, p90:50}; closeupTalking: đổi tay/biểu cảm mỗi 8..27 fr
lipsync     = {on:1, pChangePerFrame:0.82, hold1:0.87, hold2:0.10, hold3plus:0.03, headBobPx:0, eyebrow:0}
blink       = {ratePerSec:0}  // thay bằng eye-state đổi cùng pose snap
enter       = leanKey(1 fr, scale head ~1.3, 40% ngoài khung) → arrive overshoot +1.5% (1 fr) → settle 2 fr;  hoặc popIn(1 fr)
exit        = leanKey(1 fr) → partialOut(1 fr) → gone
popScale    = [0.08, 0.95, 1.045, 1.0]  // 4 frame, rồi hold (+ boil ABAC tuỳ chọn)
zoomGag     = {scalePerFrame:+0.45× cỡ đầu, frames:8..10, ease:linear, end:hardCut}
runCycle    = {drawings:2, holdEach:2 fr, translatePx720PerFrame:24, bobPctHeight:1.5}
boil        = {shotShare:≤0.2, pattern:'ABAC'|'ABAB', framesPerDrawing:1, displacementPx:<0.5}
whiteBeat   = {frames:12..30, giữa 2 shot}
shot        = {medianSec:1.25, share<1s:0.42}
```

### 4. Giới hạn
- Chưa đo toàn bộ 7m52; 17 đoạn ≈ 70 s ở 24fps + thống kê 12fps 0–400 s. Không có mẫu walk cycle nhìn ngang đúng nghĩa (chỉ hop cycle 5:17).
- Bbox «đầu» dựa trên px tóc <50 gray nên chỉ đúng cho Jaiden (tóc sẫm); nhân vật trắng dùng bbox nét.

## SỐ LIỆU
- Pose snap: 77/97 sự kiện (79%) dài 1 frame; 8 sự kiện 2 fr; 3 sự kiện 3 fr; 1 sự kiện 5 fr; còn lại chu kỳ/zoom
- In-between: không smear/motion line/blur; khi có là 3–5 hình rời 1 fr/hình, biên độ giảm dần 2 frame cuối
- Đầu/tóc khi snap cận cảnh: dx=dy=0.0 px trên 16 snap, số px tóc không đổi
- Hold (n=338, 24fps): p10=6 p25=10 p50=20 p75=36 p90=50 max=114 frame; <12 fr 26%, 12–23 28%, 24–47 33%, ≥48 13%
- Cận cảnh nói: đổi tay/biểu cảm mỗi 8–27 frame; chuỗi hoảng loạn 5–11 frame
- Chớp mắt: 0 lần / 519 frame (21.6 s) cận cảnh
- Đầu khi nói: std centroid ≤0.09 px, range ≤0.3 px → 0 bob, 0 gật
- Lipsync on ones: 82% frame đổi miệng khi nói; hình miệng giữ 1 fr 87%, 2 fr 10%, ≥3 fr 3%; vùng miệng ≈160×90 px @720p
- Hop/run cycle 5:17: 2 hình AABB on twos, chu kỳ 4 fr; trượt 24 px/frame @720p on ones; bob 6 px/394 px = 1.5%
- Vào cảnh pirate 5:14: lean-in key 1 fr → arrive overshoot +2.7 px(640) ≈1.5% → settle 2 fr (1.3 px) → 4 frame tổng
- Ra cảnh 0:50: lean-out key 1 fr → 1 fr còn vai → biến mất
- Pop-in 1 frame: s086 f29, s121 f15/f94, máu s046 f4 (0→608 px đỏ), s240 f33
- Bubble pop 3:40: ~8% → ~95% → ~105% (+4.5%) → 100%, 4 frame
- Zoom-gag tuyến tính: s345 w 127→631 px/10 fr (+55 px/fr); s121 chữ 150→532 px/8 fr (+49 px/fr); kết bằng cut cứng
- Boil: 4/20 shot; ABAB chu kỳ 2 (s170), ABAC chu kỳ 4 (s175, s220 ×2), 9 hình chu kỳ 10 (s345); dịch chuyển <0.5 px
- Parity lẻ/chẵn: talk 2/1, pirate 28/27, s345 19/17 → on ones; chỉ s240 (0/32) và s209 trượt (1/18) on twos
- FX/camera on ones: đèn disco 4–8k px/frame, pan credits ~18k px/frame
- Nhịp trắng: 31 run/400 s, median 18 fr, range 2–86
- Shot median 1.25 s; 98/232 shot <1 s; 69.7% khung 12fps đứng yên
- Sự kiện rời rạc (snap+cut): 285 trong 400 s ≈ 43/phút

## ĐỀ XUẤT
- Thêm module timing mới (vd `src/engine/timing.ts`): hằng FPS=24, `snap()` đổi hình 1 frame không ease, không interpolate; bỏ mọi `interpolate`/spring cho đổi tư thế trong `src/library/cast/dien.tsx`
- Tách nhân vật thành lớp: head/hair (khoá cứng trong cận cảnh), face-state (mắt+miệng), arms-state; snap chỉ đổi face/arms, đầu không dịch px nào
- Lipsync: đổi hình miệng mỗi 1 frame (87%) hoặc 2 frame (10%) theo `am`/phoneme, không bob đầu; bỏ hoàn toàn tầng «đầu gật theo nhấn» và «tay nảy lò xo» của dien.tsx
- Hold scheduler: lấy hold từ phân bố p25=10/p50=20/p75=36 frame, tối thiểu 6; trong cận cảnh nói đổi tay/biểu cảm mỗi 8–27 frame, không đổi trong lúc đang hold
- Không chớp mắt tự động; eye-state chỉ đổi cùng pose snap
- Enter/exit preset: leanKey 1 fr (scale head ~1.3, 40% ngoài khung) → arrive overshoot 1.5% 1 fr → settle 2 fr; exit = leanKey 1 fr → partial 1 fr → gone; mặc định pop-in 1 frame
- Pop-scale cho bong bóng/chữ/prop: keyframe [0.08, 0.95, 1.045, 1.0] mỗi frame 1 giá trị, rồi hold; boil ABAC tuỳ chọn 1 fr/hình
- Zoom-gag: scale tuyến tính +0.45× cỡ đầu mỗi frame trong 8–10 frame rồi hard cut, không ease-out
- Cycle: hop/run 2 hình giữ 2 fr (on twos) + translate 24 px/frame @720p on ones, bob ≤1.5% chiều cao; blah-talk 2 hình AABB
- Boil chỉ bật cho ≤20% shot khi cần cảm giác run/sôi: pattern ABAB (chu kỳ 2) hoặc ABAC (chu kỳ 4), dịch chuyển <0.5 px
- White-beat: cho phép chèn 12–30 frame trắng trơn giữa 2 shot; shot median ~1.25 s
- Thêm `pipeline/kiem-tra.mjs` rule: cảnh nào có interpolate >1 frame cho pose → cảnh báo; hold <6 frame → cảnh báo
- Thư viện hình: mỗi nhân vật cần ≥3 hình tay, ≥4 face-state, 2 hình hop, 1 lean-in/out key thay cho SVG tham số hoá biến hình

## TỆP
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/timing_rules.json
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/px24.json
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/diff24.json
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/events24.json
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/motion12.npy
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/sheet8.py
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/diff24.py
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/px24.py
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/events24.py
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/period.py
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/b24/ (17 thư mục s005 s016 s046 s050 s086 s121 s170 s175 s209 s220 s240 s270 s282 s314 s345 s380 s440, khung 24fps 640x360)
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/sheets24/s005.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/sheets24/s016.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/sheets24/s046.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/sheets24/s050.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/sheets24/s086.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/sheets24/s121.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/sheets24/s170.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/sheets24/s175.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/sheets24/s209.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/sheets24/s220.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/sheets24/s240.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/sheets24/s270.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/sheets24/s282.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/sheets24/s314.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/sheets24/s345.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/sheets24/s380.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/sheets24/s440.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/strips/pirate_entry.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/strips/pirate_jump.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/strips/nose_turn.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/strips/s046_turn.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/strips/s220_bubble.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/strips/s345_cycle.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/strips/s175_shiver.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/strips/s170_shiver.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/strips/s005_eyes.jpg