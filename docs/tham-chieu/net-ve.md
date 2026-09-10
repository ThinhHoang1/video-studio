# Phân tích NÉT VẼ & THIẾT KẾ NHÂN VẬT tham chiếu → spec rig SVG mới

Tư liệu: JaidenAnimations "My School Stories" 1280×720 @24fps. Mọi số đo là pixel trên khung 1280×720 (đo bằng numpy/PIL trên khung tách bằng ffmpeg của Remotion; đọc toạ độ trên ảnh lưới 20px). Khung tách thêm nằm ở `ref-oV/full/` (24 mốc), `ref-oV/talk1280/` (0:36–0:39, 72 khung 24fps), `ref-oV/faces1280/` (35 mốc × 2), `ref-oV/lineup/`, `ref-oV/lineup3/` (4:27, ba phiên bản nhân vật). Ảnh tổng hợp: `ref-oV/style/mouth-chart.jpg`, `ref-oV/style/faces.jpg`. Số liệu máy đọc: `ref-oV/style/so-lieu-do.json`.

Lưu ý phương pháp: mốc thời gian trên sheet `sheets/*.jpg` lệch ~1 s so với `-ss` thật, nên mọi mốc dưới đây là giây thật của `ref.f398.mp4`.

---

## 1. Nét viền

Đo bằng cách lấy mọi pixel đen thuần (max RGB < 75, độ bão hoà < 22 để loại tóc nâu #2e1310), tính min(run ngang, run dọc) rồi lấy trung vị.

| Cỡ cảnh | Khung | Bề rộng sọ (px) | Nét trung vị (p25–p75) |
|---|---|---|---|
| Cận, nhân vật chính nói | t0, t36, t348 | ~400 | **6 px** (5–8) |
| Cận nhăn mặt | t156 | ~420 | 8 px (7–9) |
| Đặc tả đầu trắng | t166 | ~530 | 6 px (5–7) |
| Đặc tả tóc vàng (đầu đầy khung) | t266 | ~700 | **12 px** (11–14) |
| Trung, 2–3 người | t316, t384 | 250–350 | 5–6 px |
| Toàn thân (người trắng cao 673px) | t20 | 175 | **4 px** (3–5) |
| Toàn thân nhỏ (cao 200–400px) | t192, t322, t368 | 100–185 | **3–4 px** (2–6) |

Kết luận đo được:
- Nét **không cố định theo zoom** nhưng cũng không tỉ lệ tuyến tính: đầu 100px → 3px (3%), 175 → 4 (2.3%), 400 → 6 (1.5%), 700 → 12 (1.7%). Quy tắc khớp dữ liệu: `nét = max(3px, 0.015 × bề_rộng_sọ)` trên khung 1280 (nhân 1.5 cho 1920).
- Nét đồng đều, đầu bút tròn, không thick/thin đáng kể; nét bên trong (tóc, răng, nếp áo) **cùng độ dày** với viền ngoài. Duy nhất nét mảnh hơn là các gạch mí/mày (~0.7×).
- **Không có "boil"**: trong 72 khung liên tiếp 0:36–0:39, vùng tóc/mắt/thân/nền có diff = 0.00 (chỉ 2/71 frame đổi vì đổi pose); chỉ vùng miệng đổi (trung vị diff 10.5). Tức là kiểu này *không* vẽ lại từng frame, mà là hold tuyệt đối + đổi hình miệng.

## 2. Bảng màu thực dùng (lấy mẫu pixel)

Lượng tử hoá 1.39 triệu mẫu từ 9 khung 1280 + 50 khung frames2s: trắng 84.1 %, nâu tóc 5.1 %, đen 3.8 %, vàng tóc 1.7 %, còn lại < 0.6 % mỗi màu.

| Vai trò | Hex đo | Ghi chú |
|---|---|---|
| Nền, **da, áo, quần** | `#fdfdfd` | không tô — da và áo cùng màu nền, chỉ có nét |
| Nét, mắt, ngươi | `#000000` | |
| Tóc nhân vật chính | `#2e1310` | một mảng đặc, viền đen 6px, 2–3 gạch đen bên trong |
| Tóc bạn (bob) | `#906830` | |
| Tóc bạn tóc vàng | `#e9e8c6` | |
| Tóc "this guy" | `#656565` | |
| Mũ pirate / viền mũ | `#313131` / `#a06860` | |
| Máu, cột "Blood Pressure", mũi tên | `#f81000` | đỏ thuần duy nhất |
| Huy hiệu | `#b8d8f8` | |
| Tim/má hồng | `#b03858` | |

→ Toàn video chỉ có **2 mảng tô** trên nhân vật chính (tóc + không gì khác), không đổ bóng cel, không gradient, không tông tối/sáng.

## 3. Nền và prop (đếm trên 200 khung frames2s < 6:40, bỏ phần credit)

- Khung có ≥ 90 % diện tích trắng: **43 %**; ≥ 80 %: **90 %**. Mực trung vị 11.6 % diện tích.
- Khung trống hoàn toàn (chỉ chữ hoặc trắng): 9.
- Khung có mảng màu bão hoà > 2 % (ảnh chèn: tranh, penguin, poster Pirates, tóc bạn màu): **12/200 = 6 %**.
- Khung có prop/nền vẽ nét (bàn, cửa, lưới tennis, dãy bàn lớp): đếm tay trên sheet ≈ **69/200 = 34 %**. Prop luôn là nét đen không tô, phối cảnh một điểm tụ, không có sàn/tường/chân trời.
- Phần còn lại (~60 %): nhân vật đứng trên nền trắng tuyệt đối.

## 4. Tỉ lệ cơ thể

### Nhân vật chính (đứng toàn thân, 3:12 = `full/t192_01.png`)
- Tổng cao 402 px; đầu kèm tóc 165 px → **đầu = 41 % chiều cao = 2.4 đầu**.
- Bề rộng sọ 185, kèm tóc 233; bề rộng vai 98 → **đầu/vai = 1.9** (đầu rộng gần gấp đôi vai).
- Cổ: có, 20 px rộng × 12 px cao (0.11 × 0.06 sọ) — hai gạch song song rất ngắn.
- Thân (cằm→hông) 105 px = 0.57 sọ; chân (hông→gót) 122 px = 0.66 sọ; tay khoanh dài ≈ 0.9 sọ (chạm hông).

### Cùng nhân vật, ba độ tuổi (4:27 = `lineup3/x_025.png`)
| | sọ rộng | sọ cao | vai | đầu/vai | mắt |
|---|---|---|---|---|---|
| tiểu học | 210 | 205 | 125 | 1.7 | chấm 10px |
| cấp 2 | 255 | 250 | 135 | 1.9 | oval 12×25 |
| cấp 3 | 320 | 295 | 200 | 1.6 | oval 20×45 |
→ Sọ **rộng hơn cao** (h/w ≈ 0.92), cùng khuôn mặt, chỉ đổi tóc, cỡ mắt và cỡ tổng.

### Nhân vật phụ đầu trắng (người lớn, 0:20 = `full/t20_01.png`)
- Cao 673; đầu 173 → **3.9 đầu**; vai 140 → đầu/vai 1.24; cổ 25 × 30; thân 220 (1.27 đầu); chân 250 (1.45 đầu); tay ≈ 210 (1.2 đầu, tới hông). Không có ngón chân/giày, chân là hai ống thuôn.
- Trẻ con phụ (2:37): cùng khuôn, cao ≈ 2.5 đầu.

### Đầu cận (0:00 = `full/t0_01.png`, sọ 400 px)
- Đầu kèm tóc 360 cao (đỉnh tóc y95 → cằm y455). Cằm hơi dẹt, không gò má.
- Cổ 25 px (0.06 sọ), cao 40. Vai áo 290 = 0.72 sọ. Cổ áo chữ V.

## 5. Mắt, mày

- **Mặc định**: hai oval đen đặc, **không lòng trắng, không con ngươi, không highlight, không viền**. Cận nói: 55 × 95 px (0.14 × 0.24 sọ), tâm cách nhau 180 (0.45 sọ), tâm mắt ở 57 % chiều cao đầu tính từ đỉnh tóc (hơi dưới tâm sọ). Bình thản/toàn thân: oval nhỏ hơn hẳn 20 × 45 (0.06 × 0.14 sọ).
- **Lông mày: không có ở mặc định**. Mép mái tóc đóng vai trò đường mày. Mày chỉ xuất hiện khi cần: 1 gạch đen dày (≈1.5× nét) chéo cắt vào đỉnh oval (tức), 1 gạch cong lên (lo/nhướn), gạch sóng nhíu (khó chịu).
- 9 trạng thái mắt thấy được (xem `faces.jpg`): E1 oval đen; E2 oval nhỏ; E3 chấm (bé, ngại); E4 lòng trắng oval + ngươi chấm 8px (sốc; lòng trắng 120–140 px = 0.3 sọ khi "what."); E5 khe ngang: lòng trắng dẹt + gạch mí (bực/gắt); E6 vòng cung úp ^ ^ (nhắm vui); E7 gạch dọc (mặt phụ, this guy); E8 nguệch ngoạc đen (xấu hổ); E9 oval bị gạch mí cắt ngang (chán). Chớp mắt không thấy trong 72 frame nói (giữ nguyên).

## 6. Miệng — `style/mouth-chart.jpg`

- Vị trí: tâm miệng ở **85 %** chiều cao đầu (gần đáy sọ), lệch tâm theo hướng nhìn.
- Cỡ: đóng = gạch 50 px (0.12 sọ); nói rộng 160–170 px (**0.40 sọ**); cười toe 166 × 76 (0.38 sọ). Miệng luôn **trắng bên trong** (không tô đỏ/tối), răng = 1 dải trắng viền đen ở hàm trên, lưỡi = 1 đường cong, không có môi.
- Trong 3 s nói (72 frame): miệng đổi hình ở **53/71** chuyển frame (diff > 6), hold 1–3 frame; số hình khác nhau: 20 (ngưỡng 5) / 17 (ngưỡng 7) / 11 (ngưỡng 9). Gom lại thành 9 lớp hình: đóng-cong, hé-nhỏ tam giác, hé tam giác lệch, mở-vừa chữ nhật bo, rộng+răng trên, rộng+lưỡi, mở-to răng+lưỡi, dẹt-răng (ee), nghiến răng gạch. Ngoài shot nói còn: đóng-thẳng, cười-mở dải răng, gắt (mở, mép cong xuống), mếu sóng, hoảng răng cưa, ngoằn (phụ), hét (nửa mặt).
- Đây là lipsync theo **hình**, không theo biên độ: cùng biên độ vẫn xen kẽ hé/rộng/dẹt liên tục để tạo nhịp.

## 7. Biểu cảm — `style/faces.jpg` (30 sắc thái)

Mỗi sắc thái = tổ hợp (trạng thái mắt) × (có/không mày, kiểu mày) × (hình miệng) × (0–2 phụ kiện: giọt mồ hôi, gạch má, mũi tên). Ví dụ đo được: NÓI = E1 + không mày + M5; BÌNH THẢN = E2 + không mày + gạch 50px; CHÁN = E9 + mím lệch; SỐC = E4 + mày cong + mếu sóng; BỰC = E5 + gạch mí + dẹt răng; TỨC = E1 + gạch chéo cắt oval + mím/mở răng; VUI NHẮM = E6 + cười mở; NGẠI = E3 + miệng "3" + vai co; XẤU HỔ = E8 + mồ hôi. Tổng cộng thấy 9 mắt × 4 mày × 16 miệng, xuất hiện thực tế ≈ 30 tổ hợp.

## 8. Tóc

- **Một khối đặc** `#2e1310`, viền đen cùng độ dày nét, **không** có mảng sáng/tối, **không** highlight.
- Nét đen bên trong: 2–3 gạch trên mái theo hướng chải + 1 gạch trên chỏm.
- Số mảng silhouette (nhân vật chính): mái 1 khối lớn quét từ phải sang trái che gần hết trán tới mí mắt phải; 1 chỏm nhọn đỉnh phải; mỗi bên 2 lọn nhọn hướng ra; khối tóc sau rủ tới giữa thân (≈1.4 chiều cao đầu). Tổng ≈ 7 mảng, rộng 1.25 sọ.
- Phiên bản bé: thêm đuôi ngựa 1 khối; cấp 2: bob ngắn, 1 chỏm.
- **Tóc không động**: trong shot, diff vùng tóc = 0; không có follow-through, không overshoot. Chuyển động chỉ đến từ đổi pose/cắt cảnh (232 cắt/7m52, shot trung vị 1.25 s, 71.5 % khung đứng yên).

## 9. Bàn tay (`style/_hands_index.jpg`)

- **4 ngón** (3 ngón + ngón cái), ngón = chỏm ngắn bo tròn, không khớp, không móng; bàn tay 0.16–0.18 sọ.
- Kiểu thấy được (≥ 8): xoè-ngửa (nhún vai, 0:36), xoè-úp/chỉ 1 ngón (0:49, 6:44), nắm (4:38, 5:16), chống cằm ngón thẳng (0:44), hai tay ép ngực (3:39, 5:26), khoanh tay (3:12), chống hông (4:28, 5:36), cầm vật (kiếm, vợt, phong bì, mic). Nhân vật phụ cũng đủ 4 ngón.

## 10. Nhân vật phụ

- Mặc định: **đầu tròn trắng trơn, không mắt-mũi-miệng**, cổ 2 gạch, thân ống, vai xuôi, 3.9 đầu (người lớn) / 2.5 đầu (trẻ). Đám đông lớp học 1:48–2:10, 3:06: 6–10 đầu trắng, không mặt.
- Có mặt khi **được giao vai nói/phản ứng** trong shot (giáo viên 0:49, 1:00; đối thoại 2:14–2:30; this guy 4:00–4:40; đội tennis 6:06–6:24). Khi có mặt: mắt = chấm hoặc gạch dọc (E3/E7), miệng gạch/nửa vòng tròn/răng cưa; **không bao giờ dùng oval đen của nhân vật chính**.
- Phân biệt: tóc màu (xám this guy, nâu bob, vàng mái ngang) + 1 phụ kiện (mũ pirate, huy hiệu, mũ bảo hiểm, áo đen emo). Không có màu da, màu áo khác nhau.

## 11. So với rig hiện tại (`than-hinh.ts`, `tu-the.ts`, `toc.tsx`, `kieu.ts`, `nhan-vat.tsx`; ảnh render `style/rig-hien-tai-pose.png`, `rig-hien-tai-cast.png`)

| Tiêu chí đo | Tham chiếu | Rig hiện tại | Hệ quả nhìn thấy |
|---|---|---|---|
| Đầu / chiều cao | 41 % (chính), 26 % (phụ) | `DAU*6` → **16.7 %** | mặt bé, ở CastTest scale 0.72 đầu ≈ 56 px trên khung 2400 (≈30 px @1280) → không đọc được biểu cảm |
| Đầu / vai | 1.6–1.9 (chính), 1.24 (phụ) | 78 / 128 = **0.61** | dáng "người thật", mất chất cartoon |
| Cổ | 0.06–0.1 sọ, 2 gạch | `coRong*2` = 0.4 sọ, có mảng tối | cổ to như cột |
| Mắt | 1 oval đen; không lòng trắng/ngươi/viền | lòng trắng + mống + ngươi + highlight + viền nửa dưới + mày dày 1.5× | **8/8 nhân vật đọc thành đeo kính** (thấy rõ ở CastTest) |
| Lông mày | không có ở mặc định | luôn vẽ, dày `NET*1.5` | mặt nặng, "nghiêm" |
| Miệng | 0.40 sọ khi nói, đổi hình mỗi 1–3 frame, 16 hình | 0.20 sọ, 7 hình tĩnh theo `sac`, không đổi khi nói | đúng lời phàn nàn "mồm cứ O O" đã ghi trong USECASE.md |
| Bàn tay | 4 ngón, ≥ 8 kiểu | 1 blob 0.17 sọ, 1 kiểu | không diễn được chỉ/nắm/xoè |
| Nét | 3–6 px @1280, đồng đều, 0.015 sọ | `NET` 5.5 / `NET_MANH` 3.6 cố định theo DAU=78 (7 % sọ), thu nhỏ theo `s` → 2–4 px và mảnh không đều | nét lúc mảnh lúc đứt, không có sàn 3px |
| Tô màu | 2 mảng (tóc + không) | 19 màu, mỗi mảng có tông tối cel (`daT`, `aoT`, `tocToi`, `tocSang`) | nhìn "vector clipart 3D", trái với yêu cầu 2D flat |
| Tóc | 1 khối phẳng + 2–3 gạch đen | 3 lớp: khối + mảng tối + dải sáng | bóng nhựa |
| Chuyển động | hold tuyệt đối, đổi pose/cắt | sine thở/lắc đầu/đổi chân liên tục | "giật giật trông khó chịu" (đã ghi trong USECASE.md) |
| Nhân vật phụ | đầu trắng không mặt | không có khái niệm này | đám đông phải dựng bằng 8 nhân vật đủ chi tiết |

Ghi chú: bản cũ `Teo` trong `cast.tsx` (đầu r=96 trên cao 440 → 44 %) thực ra **gần tham chiếu hơn** bản mới; comment trong `than-hinh.ts` gọi đó là "tỉ lệ đồ chơi" và sửa về 6 đầu — đi ngược hướng phong cách storytime.

## 12. SPEC RIG MỚI (nhân vật gốc, không sao chép Jaiden)

Đơn vị **DAU = bề rộng sọ** (không kèm tóc). Gốc toạ độ giữa hai bàn chân, y âm hướng lên (giữ quy ước `than-hinh.ts`). Mọi số là hệ số nhân DAU. Trên khung 1920×1080, DAU gợi ý: cận 560 px, trung 330 px, toàn thân 190 px.

### 12.1 Neo khung xương — nhân vật chính (2.6 DAU)
| Neo | y | nửa bề ngang | ghi chú |
|---|---|---|---|
| gót (sole) | 0 | bàn chân dài 0.20, không giày | |
| gối | -0.35 | ống chân dày 0.12 | |
| hông | -0.70 | 0.26 | quần = 2 ống nét, không tô |
| eo | -0.95 | 0.24 | |
| vai | -1.45 | **0.30** (tổng 0.60 → đầu/vai 1.67) | vai xuôi, áo cổ V |
| cổ đáy / cằm | -1.45 / -1.57 | 0.05 (rộng 0.10) | 2 gạch song song |
| tâm sọ | -2.03 | rx 0.50, ry 0.46 | ellipse, đáy dẹt 8 % |
| đỉnh sọ | -2.49 | | |
| đỉnh tóc | -2.60 | tóc rộng 1.25 DAU | |
| tay: vai→khuỷu 0.50, khuỷu→cổ tay 0.45, dày 0.10; bàn tay 0.17 (tới hông khi buông) | | | |
Nhân vật phụ người lớn: 3.6 DAU (hông -1.30, vai -2.55, cằm -2.70, tâm sọ -3.16, đỉnh sọ -3.62), vai 0.40, tay 0.60 + 0.55. Trẻ con phụ: 2.2 DAU.

### 12.2 Mặt (toạ độ trong hệ đầu, tâm sọ = 0,0)
- Mắt: tâm y = **+0.06** (56 % từ đỉnh sọ), x = **±0.225**. Bỏ lòng trắng/mống/highlight/viền.
  - E1 oval đen rx 0.07 ry 0.12 (nói/mặc định)
  - E2 oval nhỏ rx 0.03 ry 0.07 (bình thản, toàn thân)
  - E3 chấm r 0.025 (trẻ/ngại/phụ)
  - E4 lòng trắng ellipse rx 0.15 ry 0.12 viền nét + ngươi r 0.02 (sốc; scale 1.3 cho "what.")
  - E5 khe: lòng trắng rx 0.11 ry 0.04 + gạch mí trên (bực)
  - E6 vòng cung úp, dây 0.14, cao 0.05 (nhắm vui)
  - E7 gạch dọc dài 0.10 (phụ)
  - E8 nguệch ngoạc trong hộp 0.08 (xấu hổ)
  - E9 = E1 bị gạch mí cắt ở 40 % chiều cao (chán)
  - Chớp: E1 → gạch ngang 2 frame, mỗi 3–5 s; **không** liếc ngẫu nhiên.
- Mày (mặc định **không vẽ**): B0 không; B1 gạch chéo dài 0.16 dày 1.5× nét, đầu trong thấp hơn 0.05, cắt vào đỉnh oval (tức); B2 cong lên cao hơn mắt 0.08 (lo/nhướn); B3 sóng 2 gợn (khó chịu). Mép mái tóc đặt ở y = -0.10 để đóng vai trò đường mày.
- Miệng: tâm y = **+0.33** (85 % chiều cao sọ), x lệch ±0.05 theo hướng nhìn. Bên trong luôn trắng; răng = dải trắng viền nét cao 0.06 ở hàm trên; lưỡi = 1 cung. **Mouth chart 8 hình lipsync**:
  - M1 đóng: cung dài 0.12, cao 0.02 (nghỉ, `nghi`)
  - M2 hé: tam giác bo 0.07 × 0.06
  - M3 mở vừa: chữ nhật bo 0.18 × 0.10
  - M4 rộng + răng trên: 0.40 × 0.14, dải răng 0.06
  - M5 rộng + lưỡi: 0.40 × 0.16, cung lưỡi đáy
  - M6 mở to + răng + lưỡi: 0.38 × 0.22
  - M7 dẹt răng: 0.36 × 0.07, chỉ dải răng (ee/f/v/mím)
  - M8 nghiến: 0.30 × 0.06 + 3 gạch dọc
  - Cảm xúc thay M1–M8: M9 cười mở (nửa ellipse 0.40 × 0.20, dải răng), M10 mếu sóng 0.25, M11 răng cưa hoảng 0.15 × 0.18, M12 "o" nhỏ r 0.04, M13 smirk 1 bên, M14 "3".
  - Nhịp: khi `am > ngưỡng`: đổi hình mỗi **2 frame @24fps** (ref: 1–3), chọn theo bin biên độ {thấp: M2/M7/M8, vừa: M3/M4, cao: M5/M6} và không lặp cùng hình 2 lần liền; khi `nghi`: về M1 trong 2 frame. Tuyệt đối không scale miệng theo `am` liên tục.
- Má đỏ/mồ hôi: 2 gạch chéo dài 0.06 dưới mắt (ngại); giọt 0.05 cạnh thái dương (lo).

### 12.3 Tóc
- 1 path khối đặc `mauToc`, viền = nét, **bỏ** `toi`/`sang`. Bên trong 2–3 gạch đen dài 0.3–0.5 DAU theo hướng chải, dày = nét.
- Silhouette tối thiểu: mái 1 khối che trán tới y -0.10; 1 chỏm nhọn; mỗi bên 1–2 lọn nhọn; tóc sau tới y hông -0.9 (nếu dài). Kiểu tóc = tổ hợp {mái: ngang/lệch/rẽ}, {chỏm: 0/1}, {lọn bên: 0/2/4}, {sau: không/bob/dài/đuôi ngựa/búi}.
- Follow-through: tham chiếu = **0**. Cho phép tuỳ chọn: khi đổi pose, tóc sau/đuôi ngựa lệch 0.04 DAU trong 3 frame rồi về (chỉ khi `dangTruoc` khác `dang`). Không sine liên tục.

### 12.4 Bàn tay (8 trạng thái, 4 ngón, bàn 0.17 DAU, ngón dài 0.06 dày 0.045)
H1 xoè-ngửa; H2 xoè-úp/chỉ (1 ngón dài 0.09, 3 ngón gập); H3 nắm (hình hạt đậu + 3 khấc); H4 chống cằm (ngón cái duỗi); H5 ép ngực (2 tay chụm); H6 khoanh (2 bàn gác cẳng); H7 chống hông (H3 xoay 90°); H8 cầm (H3 có lỗ 0.05 cho prop). Vẽ trong hệ cổ tay, trục theo cẳng tay, lật theo `ben`.

### 12.5 Nét, màu, nền
- `netDay = max(4.5px, 0.015 × DAU_px)` trên 1080p; một độ dày cho mọi nét trừ gạch mí/mày (0.7× và 1.5×).
- Tô: nền `#fdfdfd`; da/áo/quần **không tô** (= nền); tóc 1 màu; mỗi nhân vật tối đa 1 màu nhấn (phụ kiện). Bỏ toàn bộ `daToi/aoToi/tocToi/tocSang/quanToi/M.ma/M.moi/M.mieng`.
- Nhân vật phụ `Trang`: đầu tròn trơn không mặt, nhận `mat?: E3|E7`, `mieng?: M1|M9|M11`, `toc?`, `phuKien?`; đám đông = N × `Trang` không mặt.
- Chuyển động: mặc định **hold** (bỏ thở/lắc/đổi chân sine); đổi pose bằng cut hoặc 4–6 frame ease; gật theo `nhan` chỉ khi vượt ngưỡng, tối đa 1 lần / 0.5 s.

## SỐ LIỆU
- Nét viền @1280: cận (sọ ~400px) 6px; đặc tả sọ 700px 12px; toàn thân sọ 175px 4px; toàn thân nhỏ sọ 100px 3px → quy tắc max(3px, 0.015×sọ)
- Boil = 0: trong 72 frame nói 0:36–0:39, diff tóc/mắt/thân/nền = 0.00; chỉ miệng đổi (trung vị 10.5), 53/71 chuyển frame đổi miệng, hold 1–3 frame
- Số hình miệng khác nhau trong 3s nói: 20 (ngưỡng 5) / 17 (ngưỡng 7) / 11 (ngưỡng 9) → 9 lớp hình + 7 hình cảm xúc = 16 trong mouth-chart.jpg
- Nhân vật chính toàn thân (3:12): cao 402px, đầu kèm tóc 165px = 41% = 2.4 đầu; sọ 185, vai 98 → đầu/vai 1.9; cổ 20×12px
- Người trắng phụ (0:20): cao 673, đầu 173 = 3.9 đầu; vai 140 → đầu/vai 1.24; thân 220, chân 250, tay ≈210, cổ 25×30
- Ba độ tuổi (4:27): sọ 210/255/320, vai 125/135/200, đầu/vai 1.7/1.9/1.6; sọ rộng hơn cao (h/w 0.92)
- Mắt cận (0:00): oval đen 55×95px (0.14×0.24 sọ), tâm cách 180 (0.45 sọ), tâm ở 57% chiều cao đầu; không lòng trắng, không ngươi, không mày
- Mắt sốc (2:55): lòng trắng 120–140×95 (0.3 sọ), ngươi 8px, cách 240
- Miệng: đóng gạch 50px (0.12 sọ); nói rộng 160–170 (0.40 sọ); cười toe 166×76 (0.38 sọ); tâm ở 85% chiều cao đầu
- Nền: trắng ≥90% diện tích ở 43% khung, ≥80% ở 90%; 9 khung trống; ảnh màu chèn 12/200 (6%); prop vẽ nét ≈69/200 (34%)
- Màu: trắng 84.1% mẫu, nâu tóc #2e1310 5.1%, đen 3.8%; da/áo = nền #fdfdfd (không tô); tóc phụ #906830 / #e9e8c6 / #656565; đỏ duy nhất #f81000
- Tóc: 1 khối đặc + 2–3 gạch đen, ~7 mảng silhouette, rộng 1.25 sọ, dài 1.4 đầu; không động trong shot
- Bàn tay: 4 ngón (3+cái), ≥8 kiểu thấy được; bàn tay ≈0.17 sọ
- Biểu cảm: 9 trạng thái mắt × 4 mày × 16 miệng, ≈30 tổ hợp xuất hiện (faces.jpg)
- Cắt cảnh: 232 cắt / 7m52, shot trung vị 1.25s, 98 shot <1s, 71.5% khung đứng yên (từ cuts_px.json)
- Rig hiện tại: DAU=78, cao 6 DAU → đầu 16.7% chiều cao (ref 41%); đầu/vai 0.61 (ref 1.6–1.9); cổ 0.4 sọ (ref 0.1); miệng 0.2 sọ tĩnh (ref 0.4 đổi mỗi 1–3 frame); 19 màu + cel-shade (ref 2 mảng tô); mắt 5 lớp → đọc thành kính ở 8/8 nhân vật CastTest

## ĐỀ XUẤT
- than-hinh.ts: đổi đơn vị DAU = bề rộng sọ; nhân vật chính cao 2.6 DAU (hông -0.70, vai -1.45 nửa rộng 0.30, cằm -1.57, tâm sọ -2.03 rx 0.50 ry 0.46, đỉnh tóc -2.60); thêm bộ neo phụ người lớn 3.6 DAU; xoá toàn bộ tông tối/sáng trong M (daToi, daSang, tocToi, tocSang, aoToi, aoSang, quanToi, moi, mieng, ma)
- than-hinh.ts / nhan-vat.tsx: nét = max(4.5px@1080, 0.015 × DAU_px) tính theo scale thật của shot thay cho NET=5.5/NET_MANH=3.6 cố định; một độ dày cho mọi nét, mày 1.5×, gạch mí 0.7×
- nhan-vat.tsx `Mat`: bỏ lòng trắng/mống/highlight/viền nửa dưới; cài 9 eye state E1–E9 (oval đen mặc định rx 0.07 ry 0.12 tại y +0.06, x ±0.225; chấm; lòng trắng+ngươi; khe; vòng cung; gạch dọc; nguệch ngoạc; mí cắt); chớp = gạch 2 frame, bỏ liếc ngẫu nhiên
- nhan-vat.tsx `may`: mặc định KHÔNG vẽ mày; thêm brow state B1 chéo cắt oval / B2 cong lên / B3 sóng, chỉ bật theo `sac`
- nhan-vat.tsx `mieng` → tách file mới `mieng.tsx` với mouth chart M1–M8 lipsync (đóng, hé, mở vừa, rộng+răng, rộng+lưỡi, mở to, dẹt răng, nghiến) + M9–M14 cảm xúc; tâm y +0.33 sọ, rộng 0.40 sọ khi nói; bên trong luôn trắng, răng = dải viền
- dien.tsx / nhan-vat.tsx: driver lipsync đổi hình miệng mỗi 2 frame theo bin biên độ `am` {thấp: M2/M7/M8, vừa: M3/M4, cao: M5/M6}, không lặp hình liền kề, về M1 khi `nghi`; bỏ hẳn scale miệng theo `am`
- dien.tsx: bỏ sine thở/lắc đầu/đổi chân liên tục; mặc định hold; gật theo `nhan` chỉ khi vượt ngưỡng, tối đa 1 lần/0.5s; đổi pose ease 4–6 frame
- nhan-vat.tsx `Chi`: thay blob bàn tay bằng component `BanTay` 8 state (xoè-ngửa, chỉ, nắm, chống cằm, ép ngực, khoanh, chống hông, cầm) 4 ngón, bàn 0.17 DAU, vẽ trong hệ cổ tay; bỏ vòng tròn khớp khuỷu và mảng tối cánh tay
- toc.tsx: mỗi kiểu chỉ còn 1 path khối đặc + 2–3 gạch đen; xoá lớp `toi`/`sang`; mô tả kiểu tóc bằng tổ hợp {mái, chỏm, lọn bên, sau}; follow-through tuỳ chọn 0.04 DAU × 3 frame chỉ khi đổi pose
- kieu.ts: rút `Kieu` về {toc, mauToc, mauNhan?, phuKien?, cao}; bỏ mauDa/mauAo/mauQuan (da, áo, quần = nền #fdfdfd không tô); thêm cờ `trang: true` cho nhân vật phụ đầu trắng
- Thêm component `Trang` (nhân vật phụ đầu tròn không mặt, cao 3.6 DAU, tuỳ chọn mắt E3/E7 + miệng M1/M9/M11 + tóc màu + 1 phụ kiện) và `DamDong` (N × Trang) để dựng lớp học/đội nhóm
- Bối cảnh (`src/library/scenes`): prop kiểu nét đen không tô, phối cảnh 1 điểm tụ, không sàn/tường; nền mặc định #fdfdfd; giữ tỉ lệ ~35% shot có prop, ~60% nhân vật trên nền trắng
- src/dev/pose-test.tsx & cast-test.tsx: thêm hàng mouth chart M1–M14 và hàng eye state E1–E9 ở cỡ cận (DAU ≥ 500px) để duyệt bằng mắt trước khi render phim; so với `ref-oV/style/mouth-chart.jpg` và `faces.jpg`
- Chốt chặn `pipeline/kiem-tra.mjs`: cảnh báo khi DAU_px của shot < 150px trên 1080p (mặt không đọc được) và khi một shot nói dài > 2s mà miệng không đổi hình

## TỆP
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/style/mouth-chart.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/style/faces.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/style/so-lieu-do.json
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/style/frames2s_stats.json
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/style/rig-hien-tai-pose.png
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/style/rig-hien-tai-cast.png
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/style/_hands_index.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/style/_talk_faces.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/style/_mouth_uniq.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/style/_faces_index.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/style/_full_index.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/style/_lineup_index.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/style/_lineup3_index.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/style/_m_t0.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/style/_m_t20.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/style/_m_t192.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/style/_m_b005.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/style/_m_e175.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/style/_m_expr4.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/full/ (24 mốc × 2–6 khung PNG 1280x720)
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/talk1280/ (72 khung 0:36–0:39 @24fps 1280x720)
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/faces1280/ (70 khung biểu cảm 1280x720)
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/lineup/ (30 khung 4:26–4:28, 5:35–5:38, 6:07–6:09)
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/lineup3/x_025.png (ba phiên bản nhân vật 4:27)