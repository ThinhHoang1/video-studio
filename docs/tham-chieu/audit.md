# AUDIT kiến trúc `video-studio` — giữ gì, đập gì khi nâng lên chuẩn storytime animation

Trạng thái đo lúc audit (2026-09-09): `npx tsc --noEmit -p .` → exit 0, không lỗi. `npx remotion compositions src/index.ts` (3,0 s, không phải "hàng phút" như comment trong `render-segments.sh`) liệt kê 7 composition: `TinhDau` 18.846 frame (628,2 s), `RaTruongVui` 11.433, `RaTruongBuon` 23.446, và 4 bảng thử `CanhTest/CastTest/AnDuTest/PoseTest`. `node pipeline/kiem-tra.mjs tinh-dau` và `ra-truong-vui` đều "qua hết". Git: 10 file sửa chưa commit (riêng `nhan-vat.tsx` +410/−301) và 7 file/thư mục untracked (toàn bộ `src/projects/tinh-dau/`, `kieu.ts`, `toc.tsx`, `hoc-duong.tsx`, `scripts/tinh-dau.json`) — repo đang ở trạng thái "làm dở, chưa chốt".

Ảnh đối chiếu đã tách: `scratchpad/audit/sheet_current.jpg` (6 khung `tinh-dau.mp4` + 3 khung `ra-truong-vui.mp4`) so với `ref-oV/burst/sheet_talk.jpg` (72 khung liên tiếp 24 fps của video tham chiếu). Khác biệt nhìn thấy ngay: (a) tham chiếu nền trắng trơn, nhân vật chiếm ~60% chiều cao khung, miệng đổi hình gần như mỗi 1–2 frame, chữ "random memories" hiện cạnh nhân vật; (b) bản hiện tại nền màu đầy chi tiết, nhân vật đứng thẳng chiếm ~40% khung, tay thõng, miệng là một nét tĩnh, chữ chỉ có phụ đề đáy khung.

---

## 1. Luồng dữ liệu hiện tại và ràng buộc ngầm

```
scripts/<ten>.json            {title, voice, style, project, chapters[{id, kicker, heading, vo}]}
   │  node pipeline/tts-gemini.mjs <ten>
   │     gemini-tts.mjs: speak() → PCM s16le 24 kHz → ffmpeg loudnorm I=-16 → mp3 48 kHz/160k
   │     .sig = sha1(voice + "\n" + style + "\n" + vo)[:16]  (KHÔNG gồm model/temperature)
   │     chặn bản đọc dài > 2× (từ/2,7)s, thử tối đa 4 lần; xoay 2 key × 3 model, MIN_GAP 21 s
   ▼
public/vo-<ten>/<id>.mp3 + <id>.sig
src/projects/<project>/data/<ten>.generated.json   {voice, style, total, chapters[+audio, +duration(ffprobe)]}
   │  node pipeline/analyze-voice.mjs <ten>
   │     ffmpeg → WAV 16 kHz mono (tạm) → RMS mỗi 533 mẫu (=1 frame @30 fps)
   │     am   = min(1, sqrt(rms/p95)) rồi EMA lên 0,55 / xuống 0,22
   │     nhan = clamp((am − TB trượt ±30 frame)/0,35)
   │     nghi = am < 0,12 liên tục > 6 frame
   ▼
src/projects/<project>/data/<ten>.voice.json      {<id>: {am[], nhan[], nghi[]}}   (tinh-dau: 14 chương, 18.407 frame, 265 KB)
   │
src/projects/<project>/board.ts   BOARD[id] = Moc[]  {say, canh, co?, dien?: [{kieu, x, dang?, sac?, flip?, s?}]}
   │  (viết tay; kiem-tra.mjs đọc bằng regex, xem §4)
   ▼
src/projects/tinh-dau/phim.tsx   dung(ch):
   splitCues(vo)                 → cụm ≤7 từ, tách tại dấu câu
   cueTimings(cụm, f(duration))  → start/end theo trọng số âm tiết (+2,2 nếu kết câu, +1,2 nếu phẩy)
   neoNhieu(vo, cues, BOARD[id]) → at = round(start của CỤM chứa ký tự đầu của `say`)
   sort(at) → bỏ mốc cách mốc trước < NGAN_NHAT = f(2.4) → shots {from, len ≥ f(0.5)}
   <Sequence from len> <MoChong 13f (20f shot đầu)> <Khung co, tâm = TB x của dien, zoom ×(1+0,035·t)>
        <Noi/> (1 trong 34 cảnh) + <NhanVat …/> × dien + <ToiRia 0.46/>
   + <NhanChuong kicker/heading> 5 s đầu chương + <Sub cues/> + <Audio vo/> + <Audio nhạc 0,12 loop/>
   thời lượng = INTRO f(5) + Σ (f(duration) + PAD f(0.7)) = PHIM_DURATION
   ▼
src/Root.tsx  <Composition id="TinhDau" durationInFrames={PHIM_DURATION} fps={FPS=30} 1920×1080/>
   │  ./render-segments.sh TinhDau media/outbound/tinh-dau.mp4
   │     TOTAL tự tính từ manifest + bảng map hardcode {TinhDau: [file, 5.0, 0.7]}  ← bản sao của INTRO/PAD
   │     cache out/.seg-<Comp>-<sha10(src+scripts)>; mỗi đoạn SEG_LEN=900 (mặc định 700) một tiến trình
   │     `npx remotion render --frames a-b --concurrency=2 --crf=20 --browser-executable=<Chrome hệ thống>`
   │     ffmpeg concat -c copy
   ▼
media/outbound/tinh-dau.mp4   h264 1920×1080 30 fps, 629,4 s, 208 MB
```

**Ràng buộc ngầm đo được trong code** (không ghi trong tài liệu, hoặc ghi sai):

1. **Độ phân giải thời gian của mọi mốc = một cụm phụ đề**, không phải frame của từ. `neo()` trả `round(c.start)` của cụm chứa ký tự; cụm ≈7 từ ≈ 2–3 s. Thời điểm cụm lại là ước lượng theo âm tiết (`cueTimings`), không phải từ TTS — Gemini TTS chỉ trả PCM, không có timestamp. Vậy "hình khớp lời" hiện là khớp ở mức ±1 cụm.
2. **Shot chỉ đổi tại mốc `say`**; giữa hai mốc mọi thứ tĩnh trừ: thở (sin chu kỳ 26/15 frame), đổi chân trụ (chu kỳ 120 frame = 4 s), lắc đầu sin/52, gật theo `nhan`, chớp mắt (mỗi 92–138 frame, nhắm 4 frame), liếc (đổi mỗi 74 frame), zoom trôi +3,5 %.
3. **Nhân vật chỉ đổi tư thế lúc cắt**: `tron(TU_THE[dangTruoc], TU_THE[dang], e)` với `e` từ `interpolate(frameShot, [0, 10])` (cubic-out + overshoot `sin·0,12`), sau frame 10 đứng nguyên đến hết shot. `dangTruoc` lấy từ nhân vật cùng `kieu` ở shot trước (phim.tsx dòng 183).
4. **NGAN_NHAT bỏ hẳn mốc, không dời**: `tinh-dau` 83 mốc thô → 3 bị bỏ, `ra-truong-vui` 101 → **23 bị bỏ** (2,8 s) mà validator không báo. Shot đầu chương luôn `from = 0` dù mốc đầu neo ở 1,8–2,4 s (3/14 chương tinh-dau: `tra-sua`, `chia-tay`, `me-hoi`) → mốc đầu bị kéo sớm âm thầm.
5. **Nhịp thật của bản dựng**: tinh-dau 80 shot, trung vị **7,37 s**, trung bình 7,67 s, dài nhất 23,07 s, 43/80 shot ≥7 s, 16 shot ≥10 s. ra-truong-vui 78 shot, trung vị 4,57 s. Tham chiếu: 232 cắt, trung vị **1,25 s** (1,50 s nếu bỏ cụm nháy 26,5–29 s), 98 shot <1 s, chỉ 6 shot ≥7 s, dài nhất 12,58 s. Chênh 5–6 lần về nhịp.
6. **Mọi cắt là mờ chồng** 13 frame (`MoChong`), không có hard cut; `vui.tsx` xoay 4 kiểu vào shot theo `i % 4` (cut/whip/scale/rơi) — kiểu chuyển cảnh không do nội dung quyết định. Tham chiếu: 71,5 % khung đứng yên, cắt cứng.
7. **Cận = zoom khung SVG**: `CO = {rong 1, trung 1.32, can 1.95, sat 2.7}`; `sat` phóng 2,7× lên hình vẽ cho toàn cảnh → nét dày 5,5 px thành ~15 px, chi tiết mặt không tăng. Tham chiếu vẽ nhân vật to trên nền trắng, không zoom.
8. **Sân khấu cố định** `W=1920, H=1080, SAN=880`; nhân vật đặt `y=SAN`, cao 6×78 = 468 px (≈43 % khung ở `rong`).
9. **FPS=30 hardcode ở 3 nơi** (`engine/theme.ts`, `pipeline/analyze-voice.mjs`, `render-segments.sh`); `voice.json` lấy mẫu theo 30 fps nên đổi fps là lệch. Tham chiếu 24 fps.
10. `render-segments.sh` giữ bản sao `[intro, pad]` cho từng composition — đổi `INTRO/PAD` trong phim mà quên map là video bị cắt cụt (chính `du-an-moi.md` phải cảnh báo điều này).
11. `.sig` không gồm model → đổi `GEMINI_TTS_MODEL` không đọc lại giọng.
12. `kicker`/`heading` là trường **bắt buộc** (kiem-tra) và luôn hiện 5 s đầu chương → ép format "chương có tiêu đề" lên mọi video; storytime kể một mạch không có.
13. Hai project dùng **hai schema `Moc` khác nhau** (`ra-truong/board.ts`: `{say, canh, co, sac, dang, nguoi, x}` phẳng, import type từ `dien.tsx` cũ; `tinh-dau/board.ts`: `{say, canh, co, dien[]}`), ba composition copy-paste `dung()`/`Khung`/`NHAC` (phim.tsx 277 dòng, vui.tsx 359, buon.tsx 314).
14. `Caption2` trong `engine/cues.tsx` không ai import (chết); `pipeline/tts.mjs` (macOS `say`) trỏ `script/narration.json` với ROOT tính sai → chết; `cast/dien.tsx` chỉ còn sống nhờ `import type` của `ra-truong/board.ts`; `cast/cast.tsx` (Tèo/Phồng/Sếp) không ai import ngoài attic.

## 2. Rig nhân vật

**`nhan-vat.tsx` (425 dòng) làm gì với `VoiceTrack {am, nhan, nghi}`:**
- `i = clamp(frameShot + goc, 0, am.length−1)` — frame tuyệt đối trong chương.
- `nhan = bam(giong.nhan, i, 20, 0.12)` (EMA 20 frame, tính lại từ 0 mỗi frame → thuần hàm của frame, an toàn cho render song song) → `gat = nhan·7` dịch đầu theo y (`translate(0, gat·0.4)`), lông mày nhướn `−nhan·DAU·0,05`, má ửng khi `nhan > 0,35`.
- `nghi = giong.nghi[i]` → thở sâu hơn (biên 0,05 DAU, chu kỳ 26) khi nghỉ, nông hơn (0,022, chu kỳ 15) khi nói.
- **`am` không được dùng ở đâu cả** ngoài `am.length` để clamp chỉ số. `analyze-voice.mjs` tính `am` làm "độ mở miệng" nhưng rig bỏ. `ARCHITECTURE.md` ghi đã thử miệng theo `am` và bỏ vì "lắp bắp" — nguyên nhân kỹ thuật là dùng biên độ liên tục làm độ mở, không lượng tử hoá thành mouth chart và không giữ tối thiểu 2 frame. Đo trên `tinh-dau.voice.json`: `am > 0,3` ở 55 % frame, trạng thái mở/đóng (ngưỡng 0,3) đổi 0,9 lần/giây, run trung vị 28 frame, chỉ 6 % run < 3 frame → dữ liệu này đủ ổn định để lượng tử hoá; vấn đề nằm ở cách dùng, không ở dữ liệu.
- Miệng: `mieng()` = 7 hình tĩnh theo `sac` (`thuong/vui/nghi/soc/tuc/buon/met`). Mắt: `Mat` có lòng trắng, mống màu tóc, highlight, mí trên nét dày; chỉ 2 trạng thái mở/nhắm (`nham` khi `(i+lech) % nhipChop < 4`), `to = 1,2` khi `soc`. Có chớp mắt và liếc (đã có, khác với giả định "không blink").

**`tu-the.ts`:** `Khop = {vaiT, vaiP, khuyuT, khuyuP, than, dau, hup, lat: 1|−1, truoc?: 'phai'|'ca-hai'}`. Quy ước: vai 0° thõng, 90° ngang, 180° giơ lên; khuỷu 0° thẳng, 90° gập vào trong; hai bên cùng giá trị dương, `ben` lật. 11 preset (`dung, chi, khoanhTay, omDau, camDT, gioTay, nhunVai, cuiNguoi, tayHong, goMay, quayLung`). `tron()` nội suy tuyến tính 7 số, `lat`/`truoc` nhảy tại t = 0,5. Không có khớp cổ tay, ngón, hông, gối; chân vẽ với `gocTren = ben·(2 + doiChan·0,12)`, `gocDuoi = −ben` → gần thẳng đứng vĩnh viễn; `hup` chỉ tụt cả người xuống (cúi/ngồi giả).

**`than-hinh.ts`:** `DAU = 78 px`, cao 6 đầu = 468; gốc ở giữa hai bàn chân, y âm hướng lên; vai 0,82 / eo 0,62 / hông 0,72 DAU (nửa bề ngang); tay 1,06 + 0,94; chân 1,42 + 1,34; bảng màu `M` với tông tối cho cel-shade. `kieu.ts`: 8 nhân vật `{toc, mauToc[3], mauDa[2], mauAo[3], mauQuan[2], vay?, than: gay|thuong|day, cao, kinh?, caVat?, tui?}`, `BE_NGANG` 3 dáng. `toc.tsx` (207 dòng): 7 kiểu tóc, **0 lần dùng frame** → hoàn toàn tĩnh, không follow-through.

**`Chi`** (tay/chân): hai đoạn hình thon + khớp tròn + mút là bàn tay dạng "mitten" (path 4 điểm, xoay theo `gocDuoi`) hoặc giày. Có bàn tay nhưng không có pose bàn tay (chỉ/nắm/xoè) và không cầm được prop ngoài `rect` điện thoại hardcode khi `dang === 'camDT'`.

**Điểm mạnh giữ lại**
- Hệ đơn vị `DAU` + gốc ở chân + tỉ lệ 6 đầu: đúng cách vẽ nhân vật, scale/flip sạch.
- Tách ngoại hình (`kieu`) / khung xương (`than-hinh`) / tư thế (`tu-the`) / vẽ (`nhan-vat`): thêm nhân vật = 1 mục bảng, đã chứng minh với 8 nhân vật.
- Quy ước góc khớp một chiều, dễ viết preset; `tron()` là mầm của keyframe interpolation.
- `bam()` và `random(seed)` đều deterministic theo frame — điều Remotion bắt buộc.
- Cel-shade một mảng tối cắt cứng, nét `NET 5,5/3,6`: dễ chuyển sang phong cách nét đen nền trắng của storytime bằng cách bỏ fill màu, không phải vẽ lại.
- Lệch pha giữa nhân vật (`lech = kieu.length·17`), chớp mắt ngẫu nhiên có seed, thở theo `nghi`: các gia vị nhỏ nhưng đúng.

**Điểm yếu cấu trúc**
1. **Pose là trạng thái của cả shot** — không có timeline trong shot; muốn "giơ tay rồi hạ" phải tạo mốc `say` mới, mà mốc mới lại bị `NGAN_NHAT` 2,4 s chặn. Hai cơ chế mâu thuẫn nhau.
2. **Không mouth chart**; `am` được tính rồi bỏ.
3. **Không có "act"**: không đi/chạy/ngồi/nằm/quay 3/4; chỉ chính diện (`lat = 1`) hoặc quay lưng (`lat = −1`).
4. `sac` gộp mắt + mày + miệng thành 7 preset; không tách 3 kênh nên không diễn được "miệng cười, mắt buồn".
5. Chuyển tư thế: tất cả khớp nội suy cùng một `e` trong đúng 10 frame; không có offset theo khớp, không squash-stretch, tóc/túi/váy không trễ.
6. Cận không có mặt vẽ riêng: `Dau` không tách được khỏi `NhanVat` để render to.
7. Ba rig song song (`cast.tsx`, `dien.tsx`, `nhan-vat.tsx`) với ba định nghĩa `VoiceTrack`/`Sac` trùng tên.
8. `clipPath id` sinh từ `m${cx}${h}` — hai nhân vật cùng khung dùng chung id (hiện vô hại vì hình giống nhau, sẽ lộ khi kích cỡ mắt khác nhau).

## 3. Cảnh: 34 cảnh SVG viết tay

Phân bố: `places.tsx` 4 (`le-tot-nghiep, phong-tro, phong-van, van-phong`), `places-extra.tsx` 14, `hoc-duong.tsx` 8, `an-du.tsx` 8; tổng 1.394 dòng. Tất cả là `React.FC` không props (trừ `ManHinhEmail{noiDung}`, `DienThoaiLuong{soTien}`), vẽ nguyên tấm 1920×1080 gồm nền màu/gradient + sàn `SAN` + vật thể; một số dùng `useCurrentFrame` cho chi tiết động (quạt trần `frame·9`, mây, chim, mưa 90 vạch, kim đồng hồ, bụi 18–30 hạt, đèn nhấp nháy). Chúng là **background plate liền khối**, không phải prop; nhân vật đứng "trước" tấm nền.

Chuẩn storytime đo từ tham chiếu: nền trắng, 1–3 vật đủ nghĩa đặt cạnh nhân vật, vật xuất hiện đúng lúc được nhắc.

**A. Bóc ra thành PROP trên nền trắng (giữ khối, bỏ nền), ~25 khối:**
- Học đường: bảng đen + khay phấn, bàn học (đơn vị lặp), quạt trần (động), cột cờ + cờ, cây phượng (3 tán + hoa seed), ghế đá, cột điện + dây, chim bay (động), bàn tròn + 2 ly trà sữa, đèn thả, trụ cổng + băng rôn + hàng rào, đèn bàn + bàn học + chồng sách + ảnh dán tường + cửa sổ trăng.
- Đời sống/công sở: bàn + laptop, cửa sổ nắng, đồng hồ tường kim chạy (`PhongVan`, `DongHoHop`), màn hình + cubicle, cửa xoay, hộp sữa, giường + gối, khung ảnh gia đình, tách cà phê, phông bạt lễ đỏ (từ `LeTotNghiep`).
- `chieu-sau.tsx`: `DamDong` (bóng đám đông một màu, nhấp nhô) — rất đúng ngữ pháp storytime, giữ nguyên; `ToiRia` giữ (tuỳ chọn); `TienCanh` bỏ.
- Mưa (90 vạch chéo) → tách thành **overlay hiệu ứng** đặt lên bất kỳ cảnh.

**B. Giữ làm INSERT toàn khung (không phải prop), cần đổi nền trắng + tham số hoá chữ:** 8 cảnh `an-du.tsx` (`hai-tram-la-don, vong-luan-quan, thanh-mot-day-so, tang-hinh, luong-tan-chay, mot-ngay-364, nuoc-tham-qua-ao, vi-qua-tung-thang`) — đã có animation theo `durationInFrames`, đúng vai "cắt sang hình minh hoạ rồi quay lại". Cùng nhóm: `man-hinh-email`, `dien-thoai-luong`, `hop-thu`, `man-hinh-cv`, `the-nhan-vien`, `van-phong-tu-xa`.

**C. Bỏ hẳn:** mọi `rect` nền/gradient trời, sàn `SAN`, tường bong, vệt nắng, vạch sân, tường sơn hai màu — ước ~30–40 % dòng mỗi cảnh; `PhongHop` (bóng người ngồi → gộp vào `DamDong`); `TienCanh`.

**D. Phải sửa dù giữ:** 10 cảnh hardcode chữ (`"LUONG THANG 07"`, `"NV-2847"`, `"Hộp thư đến"`, `"chìa của cửa này nằm sau cửa kia"`, `"1 ngày được đăng"`, `"LƯƠNG"`, `"KINH NGHIỆM/ĐI LÀM"`…) với `fontFamily="system-ui"` → render trên máy khác ra font khác, và không tái dùng cho kịch bản khác; chuyển thành props + `FONT` (Be Vietnam Pro). `defs id` toàn cục (`g-tn, g-san, g-ghe, g-hh, g-cong, nguoi, vai, ria`) sẽ đụng nhau khi nhiều prop chung một SVG.

## 4. Validator `kiem-tra.mjs`

Hiện tại 143 dòng, 7 kiểm; 1–3 (kịch bản đủ trường, đã có giọng, `vo` khớp manifest, mp3 tồn tại) đọc JSON thật và **đáng giữ**. 4–7 đọc `board.ts` bằng hai regex:
- khối chương `/^\s*'?([a-z0-9-]+)'?:\s*\[([\s\S]*?)^\s*\],/gm`
- mốc `/\{say:\s*'([^']+)'([^}]*)\}/g` rồi `g(ten) = phanConLai.match(/ten:\s*'([^']+)'/)`.

Lỗ hổng đo được với `tinh-dau/board.ts`:
- `([^}]*)` dừng ở `}` đầu tiên → với `dien: doi('nam','ha',{sac:'soc'},{sac:'thuong'})` chỉ thấy `sac` của người thứ nhất; người thứ hai trong 44 mốc dùng `doi()` không được soi; `dang` bị lấy nhầm từ `dien` (mốc không có `dang` cấp shot).
- **Không soi `kieu`** với `thu-vien.nhan_vat` (grep: không có `kieu`/`nhan_vat` trong file); không soi `x`, `s`, `flip`, `nhac`, `sfx` (cues.ts không được đọc).
- Không biết 23 mốc của `ra-truong-vui` bị `NGAN_NHAT` bỏ; không biết mốc đầu bị kéo về frame 0; không phát hiện `say` xuất hiện 2 lần (neo lấy lần đầu).
- Kiểm "đứng yên quá lâu" thực chất chỉ là `mocs.length < 3`; kiểm "trùng frame" thực chất là trùng vị trí ký tự — vì validator không tính frame (không có `neo`, không đọc `duration`).
- Phụ thuộc dấu nháy đơn và literal; không parse được biến, spread `...da`, template string.

**Khi board sang JSON có timeline act, validator phải đổi:**
1. Bỏ regex → `JSON.parse` + kiểm theo `src/engine/board.schema.json` (một nguồn sự thật cho cả validator lẫn TS type; sinh type bằng `json-schema-to-typescript` hoặc `satisfies`).
2. Tách `neo`/`splitCues`/`cueTimings` thành module thuần không import React (`src/engine/neo.core.ts` hoặc `.mjs` + `.d.ts`) để validator **tính frame thật** như phim: từ đó kiểm shot < ngưỡng, act chồng nhau, act vượt biên shot, insert dài hơn shot, text quá dài cho thời gian hiển thị (ký tự/giây), mốc bị gộp → báo rõ thay vì im.
3. Mốc `say` đa cấp: cấp shot (đổi cảnh), cấp act (đổi tư thế trong shot), cấp text/insert/sfx; mọi `say` phải ∈ `vo` chương, và `say` của act phải nằm sau `say` của shot chứa nó và trước shot kế.
4. Bảng tên mở rộng từ `thu-vien.json`: `canh/props/acts/dang/sac/mouth_set/kieu/sfx/nhac/text_kieu/insert/chuyen_canh`.
5. Kiểm liên tục: nhân vật có ở shot n và n+1 mà `x` đổi > ngưỡng không kèm act `di` → cảnh báo teleport; đổi `kieu` giữa chương.
6. Kiểm lipsync: `<ten>.mouth.json` tồn tại, mới hơn mp3 (dùng `.sig`), đủ frame mỗi chương.
7. Chỉ số nhịp: khoảng cách giữa hai thay đổi hình bất kỳ (cut/act/text/insert) trên cửa sổ 6 s; cảnh báo khi trung vị > 3 s (tham chiếu 1,25–1,5 s).
8. Xuất JSON máy đọc + exit code; 7 kiểm cũ là tập con.

## 5. Skill `.claude/skills/tao-video`

**Agent hiện được dạy** (SKILL.md 154 dòng + 3 tham chiếu): "đạo diễn, không vẽ"; 8 bước: viết `scripts/<ten>.json` (14–15 chương × 60–140 từ, `kicker/heading` bắt buộc, `style` mô tả 5 điểm), `tts-gemini`, `analyze-voice`, viết `board.ts` (5–8 mốc/chương, `say` 3–6 từ, bố cục rong→trung→can→sat, ẩn dụ ở câu chốt, bảng tư thế theo nội dung, không một tư thế quá 2 mốc), `cues.ts` meme/sfx/nhạc, `kiem-tra`, `remotion still` 2–3 khung, `render-segments.sh` → `media/outbound/`, viết `.md` ghi công CC BY. Cấm viết SVG mới, cấm lấy file từ `out/`. `du-an-moi.md`: copy `vui.tsx` + `cues.ts`, sửa `Root.tsx`, thêm dòng map vào `render-segments.sh`.

**Sai lệch skill ↔ code đo được:** `phan-canh.md` mô tả `Moc` phẳng có `nguoi: false` — `tinh-dau` dùng `dien[]`, không có `nguoi`; nói gộp mốc "dưới 2,8 giây" — `phim.tsx` dùng 2,4; SKILL.md nói "26 bối cảnh" — thư viện có 34; `du-an-moi.md` bảo copy `vui.tsx` (có meme) — dự án mới nhất dùng `phim.tsx` không có `cues.ts`; bước xem thử `--frame=900` không nói cách tính frame ứng với chương/mốc nên agent chọn mò.

**Phải viết lại khi board có act / lipsync / chữ / insert:**
1. `phan-canh.md` tách 3: `bo-cuc-shot.md` (cắt theo câu, nhịp mục tiêu trung vị 1,5–2,5 s, hard cut mặc định, dissolve chỉ khi đổi thời gian/không gian), `dien-xuat.md` (act neo vào 2–4 từ, một hành động cho một động từ thấy được, danh mục act, luật khớp nghĩa), `chu-va-insert.md` (chữ khi có danh từ riêng/con số/câu lặp; insert khi vật được nhắc; giới hạn ký tự/giây).
2. Trỏ sang `board.json` + schema; bỏ hướng dẫn `board.ts`/`cues.ts` (sfx/text gộp vào shot).
3. Thêm bước `node pipeline/lipsync.mjs <ten>`; nói rõ miệng do máy, agent không chỉnh tay.
4. Bước xem thử → `node pipeline/xem-thu.mjs <ten> --chuong <id>` render 6 khung theo mốc và ghép contact sheet để agent `Read`; kèm checklist nhìn (chữ đè mặt, prop lệch sàn, miệng mở khi `nghi`).
5. `thu-vien.json` thêm `props/acts/text_kieu/insert/mouth_set/chuyen_canh`; skill chỉ được chọn từ đó.
6. `du-an-moi.md` → lệnh `node pipeline/du-an-moi.mjs <ten>` scaffold + tự đăng ký `Root.tsx` + tự sinh meta cho render (bỏ sửa tay 3 file).
7. `kich-ban.md`: yêu cầu đánh dấu beat (câu hành động / câu số liệu / câu chốt) để bước phân cảnh có nguyên liệu; `heading/kicker` thành tuỳ chọn vì storytime kể một mạch.
8. Bỏ bảng "co = zoom"; thay bằng "khung = nhân vật to bao nhiêu (đầu-vai / nửa người / toàn thân) trên nền trắng".

## 6. Kế hoạch đập/giữ theo file

**GIỮ**
- `pipeline/gemini-tts.mjs` — speak/pcmToMp3/durationOf/xoay key×model; phụ thuộc `.env`, ffmpeg Remotion + `DYLD_LIBRARY_PATH`. Không đụng.
- `pipeline/tts-gemini.mjs` — giữ; sửa 1 dòng: đưa model vào `.sig`.
- `pipeline/analyze-voice.mjs` — giữ am/nhan/nghi; tách `docPcm()` ra `pipeline/lib/pcm.mjs` để `lipsync.mjs` dùng chung.
- `pipeline/build-manifest.mjs`, `pipeline/audition.mjs`, `pipeline/sfx.py` — giữ.
- `src/engine/neo.ts` — giữ thuật toán; tách phần thuần sang `neo.core` cho validator; nâng độ phân giải: cộng offset theo tỉ lệ ký tự trong cụm.
- `src/engine/cues.tsx` — giữ `splitCues/cueTimings`; xoá `Caption2` (chết).
- `src/engine/sub.tsx`, `src/engine/font.ts` — giữ.
- `src/engine/theme.ts` — giữ, trở thành nguồn duy nhất của `FPS` (analyze-voice và render đọc từ meta xuất ra).
- `render-segments.sh` — giữ cơ chế đoạn + cache + concat; bỏ bảng map hardcode, đọc `TOTAL` từ file meta do phim xuất (hoặc `remotion compositions`, đo 3 s).
- `thu-vien.json` — giữ vai danh mục, mở rộng mục.
- `src/library/cast/than-hinh.ts`, `kieu.ts`, `toc.tsx` — giữ (thêm 1 tham số lệch cho tóc trước để làm follow-through sau).
- `src/library/cast/tu-the.ts` — giữ bảng góc làm preset; mở rộng `Khop` (xem VIẾT LẠI).
- `src/library/scenes/chieu-sau.tsx` — giữ `DamDong`, `ToiRia`; bỏ `TienCanh`.
- `src/library/scenes/an-du.tsx` — giữ làm insert; đổi nền trắng, tham số hoá chữ, dùng `FONT`.
- `src/dev/*` — giữ, thêm `mouth-test`, `act-test`, `props-test`.
- `pipeline/kiem-tra.mjs` — giữ kiểm 1–3.

**VIẾT LẠI**
- `src/library/cast/nhan-vat.tsx` → `rig.tsx`: nhận `pose: Khop` đã nội suy (không tự tính từ `dang/dangTruoc`), `mouth`, `mat`, `may` tách kênh; tách `Dau.tsx` để render đầu to cho cận. Phụ thuộc `than-hinh, kieu, toc, mouth.tsx, act.ts`.
- `src/library/cast/tu-the.ts` — thêm `banTay: 'mo'|'nam'|'chi'`, `hong`, `goi`, `nghieng` (3/4), `ngua` (đầu), tất cả optional có default để preset cũ còn chạy.
- Board schema: `src/projects/<du-an>/board.ts` → `board.json` + `src/engine/board.schema.json` + `src/engine/board.ts` (type + loader + resolver: neo mọi `say` → frame, bung act keyframe). Phụ thuộc `neo.core`.
- `src/projects/tinh-dau/phim.tsx` → `src/engine/phim.tsx` **generic** nhận `{data, voices, mouth, board}`; project chỉ còn data + `board.json` + ~10 dòng đăng ký. Phụ thuộc `rig, act, khung, props, nen, text-card, insert, sub`.
- `pipeline/kiem-tra.mjs` kiểm 4–7 → theo §4. Phụ thuộc `board.schema.json`, `neo.core`.
- `.claude/skills/tao-video/**` → theo §5.
- `src/library/scenes/places.tsx`, `places-extra.tsx`, `hoc-duong.tsx` → bóc thành `props.tsx`; bản cũ chuyển `src/attic/scenes-2026-09/` để composition cũ còn render tới khi chuyển xong.
- `src/library/cast/dien.tsx`, `cast.tsx` → attic (chết); `pipeline/tts.mjs` → xoá.

**THÊM MỚI**
- `pipeline/lipsync.mjs` → đọc mp3 qua `lib/pcm.mjs`, tính năng lượng + tỉ lệ band thấp/cao (FFT nhỏ hoặc zero-crossing), lượng tử hoá 6 hình miệng (`nghi, he, mo, tron, rong, rang`), hysteresis + giữ ≥2 frame, ghi `<ten>.mouth.json`. Không cần whisper/torch (máy không có; ffmpeg chỉ có 50 filter, có `silencedetect`, không có `fps/select`). Phụ thuộc `analyze-voice` (FPS, manifest).
- `src/library/cast/mouth.tsx` → 6 hình × biến thể theo `sac` (khoé miệng), vẽ trong hệ đầu. Phụ thuộc `than-hinh`.
- `src/engine/act.ts` → keyframe trong shot `{tu, den, khop: Partial<Khop>, ease, tre?}`, `poseAt(frame)`, preset (`vay, gat, lac, chi-roi-ha, ngoi, di(x0→x1)`). Phụ thuộc `tu-the`.
- `src/library/props.tsx` → ~25 prop `React.FC<{x, y, s, flip?}>`, gốc ở chân vật như nhân vật, 2 màu (nét + 1 nhấn), `PROPS` record; đăng ký trong `thu-vien.json`.
- `src/library/nen.tsx` → nền trắng + bóng đổ chân + vignette tuỳ chọn; thay 34 nền màu.
- `src/library/text-card.tsx` → `nhan` (từ khoá to cạnh nhân vật kiểu "random memories"), `so`, `the`, `trich`; vào/ra 3–4 frame, không nảy; dùng `FONT`.
- `src/library/insert.tsx` → cắt sang hình toàn khung trong `dai` frame rồi trả lại; bọc `an-du` + prop cận.
- `src/engine/khung.ts` → pan/zoom keyframe trong shot, shake theo sfx, cut-in theo anchor rig (đầu/tay) thay zoom cố định.
- `pipeline/xem-thu.mjs` → `remotion still` 6 khung/chương theo mốc → contact sheet PNG.
- `pipeline/du-an-moi.mjs` → scaffold.

**Thứ tự để lúc nào cũng render được**
- Bước 0 (nửa ngày): commit trạng thái hiện tại (17 file đang treo). Đưa `FPS/INTRO/PAD` về một nguồn (phim xuất `*.meta.json`, `render-segments.sh` đọc). Xoá `tts.mjs`; `dien.tsx`/`cast.tsx` → attic (đổi `ra-truong/board.ts` import type sang `nhan-vat`). Smoke: `tsc` + `kiem-tra` + `remotion compositions` (3 s) + 1 `still`.
- Bước 1: `lipsync.mjs` + `mouth.tsx` + composition `MouthTest` (dùng voice thật của `tinh-dau`). `NhanVat` thêm prop `mouth?` optional; không truyền → vẽ như cũ. `TinhDau` render không đổi một pixel.
- Bước 2: `act.ts` + mở rộng `Khop` (optional) + `rig.tsx` (copy `nhan-vat.tsx` rồi sửa) + `PoseTest` chuyển sang rig mới. `phim.tsx` cũ vẫn dùng `nhan-vat.tsx`.
- Bước 3: `board.schema.json` + `engine/board.ts` + `engine/phim.tsx` generic; viết `board.json` cho **một chương** (`cho-ngoi`) và đăng ký `TinhDau2` song song `TinhDau`; validator mới chạy trên `board.json`, cũ vẫn chạy trên `board.ts`.
- Bước 4: `props.tsx` + `nen.tsx` + `text-card.tsx` + `insert.tsx` + `khung.ts`; chuyển từng chương tinh-dau sang `board.json`, mỗi chương một commit, render đoạn tương ứng để so với `TinhDau` cũ.
- Bước 5: khi 14/14 chương qua validator mới và render đủ → xoá `phim.tsx` cũ, `board.ts`, chuyển scenes cũ vào attic, đổi `TinhDau2 → TinhDau`. `ra-truong` giữ nguyên trên code cũ (attic) hoặc chuyển sau.
- Bước 6: viết lại skill + `xem-thu.mjs` + `du-an-moi.mjs`; cập nhật `thu-vien.json`, `ARCHITECTURE.md`, `USECASE.md`.

## 7. Năm rủi ro kỹ thuật lớn nhất và cách hạ

1. **Render chậm / ngân sách khung.** Đo từ mtime 21 đoạn `out/.seg-TinhDau-a041d85d9b`: 900 frame/đoạn mất 51–57 s (trung bình 53 s) → **16,9 fps render**, 1 phút video ≈ 1,8 phút render với `--concurrency=2` (config đặt 4 nhưng script ép 2). Thêm mouth chart (swap path) gần như không tốn; thêm `filter` SVG/CSS (blur, drop-shadow, turbulence), hàng trăm phần tử (mưa 90 vạch, 364 ô), nhiều `clipPath` sẽ tốn. Hạ: cấm `filter` trong prop; nền trắng giảm paint; đo lại với `--concurrency=4`; cache theo **chương** (fingerprint = board chương + voice chương) thay vì theo 900 frame để sửa một chương không render lại cả phim; vòng duyệt dùng `--scale=0.33` (~9× nhanh); đặt ngân sách ≥15 fps render và fail sớm khi tụt.
2. **TTS quota và không tái lập.** Free tier 10 req/ngày/cặp key×model, 3 req/phút (`MIN_GAP_MS` 21 s); `.sig` không gồm model; Gemini không trả timestamp nên lipsync không thể lấy từ TTS; mp3 nằm trong `.gitignore` (`public/vo-*/`) → mất máy là mất giọng. Hạ: đưa model vào `.sig`; backup `public/vo-*` (git-lfs hoặc thư mục ngoài); `lipsync.mjs` suy từ mp3 nên độc lập TTS; chế độ voice giả (`im` trong pose-test) để render test không cần quota.
3. **Validator regex và hai schema board.** Đã đo: bỏ sót `kieu`, nhân vật thứ hai trong `doi()`, 23 mốc bị gộp âm thầm, không tính frame. Hạ: board JSON + schema + resolver **dùng chung** với phim (cùng `neo.core`); validator tính frame thật; một schema cho mọi project.
4. **Chrome hệ thống và render dài treo.** Remotion không tải được headless shell nên path Chrome hardcode; render một mạch đã chết 2 lần (lý do có `render-segments.sh`); Chrome tự cập nhật đổi hành vi. Hạ: giữ render đoạn (theo chương), tự retry một lần cho đoạn lỗi, `--timeout` 120 s; smoke `remotion compositions` 3 s trước mỗi render; thử lại `npx remotion browser ensure` khi mạng cho phép để bỏ phụ thuộc Chrome hệ thống.
5. **Nợ song song khi thay rig/board.** Hiện đã có 3 rig + 2 schema board + 3 bản `dung()`; thêm rig 4 mà không dọn là mất kiểm soát. Hạ: đúng thứ tự bước 0–5: mỗi bước một composition song song, chỉ xoá cũ khi mới đạt parity trên 14/14 chương; `Root.tsx` chỉ đăng ký cái đang dùng; attic không build (đã có `tsconfig.exclude`).

Rủi ro phụ đáng ghi: `defs id` trùng khi nhiều prop/nhân vật chung một SVG (dùng `useId`/prefix instance); 10 cảnh dùng `fontFamily="system-ui"` render lệch font giữa máy (dùng `FONT`); nhạc CC BY bắt buộc ghi công trong khi storytime thường không nhạc nền liên tục — cân nhắc bỏ nhạc mặc định.

## SỐ LIỆU
- tsc --noEmit: exit 0; remotion compositions: 3,0 s, 7 composition (TinhDau 18.846 frame = 628,2 s; RaTruongVui 11.433; RaTruongBuon 23.446; 4 bảng thử)
- Render thực TinhDau: 21 đoạn × 900 frame, 51–57 s/đoạn (TB 53 s) → 16,9 fps render, 1 phút video ≈ 1,8 phút render, --concurrency=2 (remotion.config đặt 4)
- tinh-dau: 14 chương, 1.265 từ, 613,4 s audio; 83 mốc thô → 80 shot (3 bị NGAN_NHAT 2,4 s gộp); shot trung vị 7,37 s, TB 7,67 s, max 23,07 s; 43/80 shot ≥7 s, 16 shot ≥10 s; 3/14 chương mốc đầu neo ở 1,8–2,4 s nhưng shot 0 kéo từ frame 0
- ra-truong-vui: 14 chương, 373,3 s; 101 mốc → 78 shot (23 bị gộp bởi 2,8 s, validator không báo); trung vị 4,57 s
- Tham chiếu oV_m2y3Qw18: 472 s, 24 fps, 1280×720; 232 cắt, shot trung vị 1,25 s (1,50 s sau khi bỏ cụm nháy 26,5–29 s), 98 shot <1 s, 27 ≥4 s, 6 ≥7 s, max 12,58 s; 71,5 % khung đứng yên
- voice.json tinh-dau: 18.407 frame, 265 KB; am>0,3 ở 55 % frame; trạng thái mở/đóng (ngưỡng 0,3) đổi 0,9 lần/giây, run trung vị 28 frame, 6 % run <3 frame → đủ ổn định để lượng tử hoá mouth chart; rig hiện KHÔNG dùng am
- Rig: DAU=78 px, cao 6 đầu=468 px (~43 % khung ở rong); 11 tư thế, 7 sắc thái (mắt+mày+miệng gộp), 8 nhân vật, 7 kiểu tóc tĩnh (toc.tsx 0 lần dùng frame); chuyển tư thế 10 frame; chớp mắt mỗi 92–138 frame nhắm 4 frame; liếc đổi mỗi 74 frame; đổi chân chu kỳ 120 frame
- Khung: zoom rong 1 / trung 1,32 / can 1,95 / sat 2,7; trôi +3,5 %/shot; tâm x = TB x của dien; mọi cắt là dissolve 13 frame (20 frame shot đầu)
- Cảnh: 34 = places 4 + places-extra 14 + hoc-duong 8 + an-du 8; 1.394 dòng; ~25 khối tách được thành prop, 14 cảnh giữ làm insert, 10 cảnh hardcode chữ với fontFamily=system-ui
- LOC: engine 248, cast 1.455, scenes 1.394, projects 1.468, pipeline 626, attic 6.882 (không build)
- Validator: 143 dòng, 7 kiểm; regex mốc /\{say:\s*'([^']+)'([^}]*)\}/ dừng ở } đầu tiên; soi 4 trường canh/dang/sac/co; không soi kieu, x, s, nhac, sfx; không tính frame
- FPS=30 hardcode ở 3 nơi (theme.ts, analyze-voice.mjs, render-segments.sh); INTRO/PAD lặp ở render-segments.sh map (TinhDau 5,0/0,7)
- ffmpeg Remotion: 50 filter, có silencedetect/loudnorm/aresample, không có fps/select/tile; máy không có whisper/torch/ffmpeg hệ thống/sox; có numpy 2.5.2 + PIL + esbuild
- TTS: free tier 10 req/ngày/cặp key×model, MIN_GAP_MS 21.000; .sig = sha1(voice+style+vo)[:16] không gồm model; Gemini không trả timestamp
- Git: 10 file sửa chưa commit (nhan-vat.tsx +410/−301, thu-vien.json +264), 7 untracked (toàn bộ src/projects/tinh-dau/, kieu.ts, toc.tsx, hoc-duong.tsx, scripts/tinh-dau.json)
- Code chết: engine/cues.tsx Caption2, pipeline/tts.mjs (ROOT sai, trỏ script/narration.json), cast/dien.tsx (sống nhờ import type), cast/cast.tsx (chỉ attic dùng)
- media/outbound: tinh-dau.mp4 629,4 s 208 MB; ra-truong-vui.mp4 381,9 s 99 MB; cả hai h264 1920×1080 30 fps

## ĐỀ XUẤT
- Bước 0: commit 17 file đang treo trong /Users/leanhvu/video-studio trước khi đụng kiến trúc
- Bước 0: phim xuất `<ten>.meta.json` {fps, intro, pad, total}; `render-segments.sh` đọc file đó thay bảng map hardcode (dòng 22–27); `pipeline/analyze-voice.mjs` đọc FPS từ đó thay `const FPS = 30`
- Bước 0: xoá `pipeline/tts.mjs`; chuyển `src/library/cast/dien.tsx` và `cast.tsx` vào `src/attic/`; đổi `src/projects/ra-truong/board.ts` dòng 1 import type sang `../../library/cast/nhan-vat`; xoá `Caption2` trong `src/engine/cues.tsx`
- Bước 0: `pipeline/tts-gemini.mjs` dòng 21 đưa model vào chuỗi băm `.sig`
- Bước 1: tạo `pipeline/lib/pcm.mjs` (tách `docPcm` từ analyze-voice.mjs); tạo `pipeline/lipsync.mjs` sinh `src/projects/<du-an>/data/<ten>.mouth.json` (6 hình miệng, hysteresis, giữ ≥2 frame, dùng am + tỉ lệ band thấp/cao)
- Bước 1: tạo `src/library/cast/mouth.tsx` (6 hình × biến thể theo sac); `nhan-vat.tsx` nhận prop `mouth?` optional, không truyền thì vẽ `mieng()` như cũ; thêm `src/dev/mouth-test.tsx` dùng voice thật tinh-dau
- Bước 2: tạo `src/engine/act.ts` (keyframe trong shot, `poseAt(frame)`, preset vay/gat/lac/chi-roi-ha/ngoi/di); mở rộng `Khop` trong `tu-the.ts` với `banTay`, `hong`, `goi`, `nghieng`, `ngua` (optional, default); tạo `src/library/cast/rig.tsx` nhận pose đã nội suy + tách `Dau.tsx`; `pose-test.tsx` chuyển sang rig mới
- Bước 3: tạo `src/engine/board.schema.json` + `src/engine/board.ts` (loader + resolver neo mọi say → frame, bung act) + `src/engine/neo.core.ts` (thuần, không React) để validator và phim dùng chung
- Bước 3: tạo `src/engine/phim.tsx` generic nhận {data, voices, mouth, board}; viết `src/projects/tinh-dau/board.json` cho chương `cho-ngoi`; đăng ký `TinhDau2` trong `Root.tsx` song song `TinhDau`
- Bước 4: tạo `src/library/props.tsx` (~25 prop bóc từ hoc-duong/places/places-extra, gốc ở chân, 2 màu), `src/library/nen.tsx` (nền trắng), `src/library/text-card.tsx` (nhan/so/the/trich), `src/library/insert.tsx` (bọc an-du + prop cận), `src/engine/khung.ts` (pan/zoom keyframe, shake, cut-in theo anchor rig); sửa 10 cảnh hardcode chữ dùng `FONT` và props
- Bước 4: chuyển 14 chương tinh-dau sang board.json từng chương một commit; render đoạn tương ứng để so với TinhDau cũ
- Bước 5: khi 14/14 qua validator mới → xoá `src/projects/tinh-dau/phim.tsx`, `board.ts`; chuyển `places.tsx/places-extra.tsx/hoc-duong.tsx` vào attic; đổi TinhDau2 → TinhDau
- Viết lại `pipeline/kiem-tra.mjs` kiểm 4–7: JSON.parse + schema, tính frame thật, kiểm say đa cấp (shot/act/text/insert), kiểm kieu/props/acts/text_kieu/mouth_set, cảnh báo mốc bị gộp, teleport, nhịp trung vị >3 s, mouth.json mới hơn mp3; xuất JSON + exit code
- Mở rộng `thu-vien.json` thêm mục `props`, `acts`, `text_kieu`, `insert`, `mouth_set`, `chuyen_canh`; sửa số cảnh trong SKILL.md (34, không phải 26)
- Viết lại `.claude/skills/tao-video/references/phan-canh.md` thành `bo-cuc-shot.md` + `dien-xuat.md` + `chu-va-insert.md`; `du-an-moi.md` → lệnh `pipeline/du-an-moi.mjs`; thêm bước `lipsync.mjs` và `pipeline/xem-thu.mjs` (6 still/chương → contact sheet) vào SKILL.md; làm `heading/kicker` tuỳ chọn trong kiem-tra và phim
- Render: cache theo chương thay 900 frame; vòng duyệt dùng `--scale=0.33`; đo lại `--concurrency=4`; cấm `filter` SVG/CSS trong props; tự retry đoạn lỗi 1 lần trong render-segments.sh
- Bảo toàn giọng: backup `public/vo-*` ra ngoài repo (hoặc git-lfs) vì đang bị .gitignore và quota TTS 10 req/ngày/cặp
- Dùng `useId`/prefix instance cho mọi `<defs id>` trong props/rig (hiện `m${cx}${h}`, `g-tn`, `nguoi`, `vai`, `ria` là id toàn cục)

## TỆP
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/audit/shots.mjs
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/audit/board-tinh-dau.mjs
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/audit/board-ra-truong.mjs
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/audit/sheet_current.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/audit/frames/td_12.png
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/audit/frames/td_60.png
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/audit/frames/td_150.png
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/audit/frames/td_262.png
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/audit/frames/td_400.png
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/audit/frames/td_555.png
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/audit/frames/rtv_30.png
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/audit/frames/rtv_120.png
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/audit/frames/rtv_300.png