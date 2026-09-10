# Ngữ pháp shot — JaidenAnimations "My School Stories" (oV_m2y3Qw18)

## 0. Phạm vi, cách đo, giới hạn

- Thân phim khảo sát: **0:00–6:43,3 (403,3 s)**; bỏ outro fan-art 6:43–7:52 (toàn ảnh màu, không phải ngữ pháp kể chuyện).
- Mốc cắt: `cuts_px.json` (pixel-diff >18) cho 232 mốc → 165 cụm trong thân phim, nhưng **bỏ sót 67 mốc** ở các shot nội dung nhỏ (tiểu cảnh tí hon, nhãn chữ, cửa mở). Tôi viết bộ dò thứ hai (`detect2.py`: XOR mặt nạ nét vẽ / hợp mặt nạ > 0,55 ở 160×90) rồi **hợp nhất** hai bộ (`master_starts.json`): **230 mốc → 231 shot**. Cụm cắt ≥3 mốc cách nhau <0,25 s = một shot có chuyển động mạnh/rung máy (6 cụm), không phải nhiều shot.
- Hai đoạn xem ảnh thật từng mốc (khung −1/+1/+6/+18 ở 12fps, thêm 24fps ở 5 chỗ có chữ): **0:00–2:00 (63 mốc) và 5:00–6:00 (44 mốc) = 107 mốc, trong đó 12 là "snap" đổi tư thế trong cùng cảnh → 95 shot thật, 167,4 s**.
- "Nói trực diện" (TD) toàn phim dò tự động theo khối tóc (`dark_feat.npy`, ngưỡng frac 0,10–0,155, cx 0,64–0,82): 24/24 mẫu TD đúng, bỏ sót ~2 ca → **số % TD là cận dưới**.
- Viền 1 px quanh khung (498 px không-trắng ở 320×180, bbox phủ toàn khung) là lỗi mã hoá, đã loại khi đo "trống".

## 1. Bảng cắt ↔ lời ↔ cảnh (xem ảnh thật, 107 mốc)

Loại: trực-diện | minh-hoạ | phản-ứng | đặc-tả | chữ | ảnh-thật | tiểu-cảnh | đông-người | TRỐNG. Cỡ: nho | rong | trung | can | sat | chu | trong. "(snap)" = đổi tư thế tức thời trong cùng cảnh, không phải shot mới.

| giây | dài | loại | cỡ | câu đang nói | cảnh mới |
|---|---|---|---|---|---|
| 0:00.00 | 4.17 | trực-diện | trung |  | Jaiden nói trực diện, lệch phải khung |
| 0:04.17 | 2.66 | trực-diện (snap) | trung | majority of my school days are over. I | đổi tư thế tay→chống cằm |
| 0:06.83 | 6.09 | minh-hoạ | trung | to think to myself, uh, school's never | Jaiden nhỏ ngồi bàn học (prop bàn hộp phối cảnh), chán |
| 0:12.92 | 3.83 | trực-diện | trung | so long to spend just in school. And now | về trực diện |
| 0:16.75 | 2.25 | minh-hoạ | trung | And it's like, what? What happened? | người trọc ghi ADULTHOOD trên áo + Jaiden nhỏ sốc |
| 0:19.00 | 0.33 | minh-hoạ (snap) | trung | Wait, I'm not ready to be an adult yet. | snap: ADULTHOOD nắm Jaiden |
| 0:19.33 | 0.75 | minh-hoạ (snap) | trung | Wait, I'm not ready to be an adult yet. | snap: nhấc bổng |
| 0:20.08 | 0.50 | minh-hoạ (snap) | trung | Wait, I'm not ready to be an adult yet. | snap: vùng vẫy |
| 0:20.58 | 1.17 | trực-diện | trung | Wait, I'm not ready to be an adult yet. | về trực diện 1,2s |
| 0:21.75 | 4.75 | minh-hoạ | trung | And you know what else is scary? I don't | Jaiden ngồi bàn thẫn thờ, cuối shot hiện chữ nhỏ "well crap." |
| 0:26.50 | 2.58 | ảnh-thật | can | from grade 6 up. It's just a jumble of | giấy + ảnh thật (tranh Napoleon, chân dung cổ) bay quanh Jaiden cận, chuyển động liên tục |
| 0:29.08 | 2.67 | tiểu-cảnh | nho | didn't care about. kind of makes you | đầu trọc nhô lên từ mép dưới, khung trắng |
| 0:31.75 | 0.50 | trực-diện | trung | think about it. So, I don't remember a | về trực diện |
| 0:32.25 | 2.75 | trực-diện (snap) | trung | think about it. So, I don't remember a | snap tay |
| 0:35.00 | 1.25 | TRỐNG | trong | school, but I do have a lot of dumb | beat trắng 1,25s |
| 0:36.25 | 0.42 | minh-hoạ | trung | school, but I do have a lot of dumb | Jaiden lệch trái, tay chống cằm nghĩ |
| 0:36.67 | 4.08 | chữ | trung | school, but I do have a lot of dumb | chữ "random memories" hiện 1 khung bên phải + jazz hands |
| 0:40.75 | 1.17 | TRỐNG | trong | haven't forgotten about over the years. | beat trắng 1,2s |
| 0:41.92 | 0.75 | tiểu-cảnh | nho | For example, in first grade, I lost my | "first grade jaiden" + mũi tên, nhân vật tí hon |
| 0:42.67 | 5.41 | minh-hoạ | trung | For example, in first grade, I lost my | Jaiden nhỏ ở bàn, tay lên miệng; máu xuất hiện trong shot |
| 0:48.08 | 0.84 | minh-hoạ | rong | and started bleeding all over the place, | Jaiden tí hon ở bàn xa + thầy trọc tiền cảnh lớn |
| 0:48.92 | 0.75 | minh-hoạ (snap) | rong | and the teacher had to stop in the | snap thầy quay |
| 0:49.67 | 0.75 | minh-hoạ (snap) | rong | middle of class to get me a tissue and | snap thầy giơ tay |
| 0:50.42 | 1.83 | minh-hoạ (snap) | rong | middle of class to get me a tissue and | snap thầy |
| 0:52.25 | 2.83 | minh-hoạ | trung | one of those little teeth envelopes to | Jaiden máu + thầy cầm phong bì răng, 2-shot |
| 0:55.08 | 1.84 | trực-diện | trung | hold the tooth I just spat out. I don't | về trực diện |
| 0:56.92 | 1.66 | tiểu-cảnh | nho | they were the funniest concept to me. | Jaiden nhỏ cầm phong bì + chú thích "holding my gross tooth to keep forever" |
| 0:58.58 | 0.34 | TRỐNG | trong | Like you come home. Oh, mom, you got | beat trắng 0,3s |
| 0:58.92 | 1.75 | minh-hoạ | trung | Like you come home. Oh, mom, you got | prop cửa đóng → mở, mẹ bước ra (hành động trong shot) |
| 1:00.67 | 1.08 | minh-hoạ | trung | mail. Oh, what is it? Oh, it's not much. | bé Jaiden búi tóc hỏi |
| 1:01.75 | 1.83 | minh-hoạ | trung | mail. Oh, what is it? Oh, it's not much. | cắt lại cửa + mẹ (đối thoại qua lại) |
| 1:03.58 | 0.92 | minh-hoạ | trung | It's just my freaking gross salifa | mẹ + con 2-shot |
| 1:04.50 | 0.75 | đặc-tả | can | covered baby tooth I ripped out of my | zoom cận mẹ + con (cùng bố cục) |
| 1:05.25 | 1.92 | đặc-tả | sat | covered baby tooth I ripped out of my | zoom sát hơn nữa |
| 1:07.17 | 2.91 | TRỐNG | trong | head in the middle of school. Does | beat trắng 2,9s hoàn toàn trống |
| 1:10.08 | 4.42 | chữ | chu | hope so. Oh, Dad. That's a funny memory. | "i hope so" chữ nhỏ giữa khung 0,4s → đầu bố trọc nhô mép dưới 4s |
| 1:14.50 | 0.83 | chữ | nho | everything. Nope, you're wrong. We were | "YOU'RE WRONG" chữ đậm + mũi tên vào bố + Jaiden nhỏ |
| 1:15.33 | 0.34 | TRỐNG | trong | everything. Nope, you're wrong. We were | beat trắng 0,3s |
| 1:15.67 | 1.33 | ảnh-thật | rong | everything. Nope, you're wrong. We were | video thật chim cánh cụt 1,3s |
| 1:17.00 | 2.92 | tiểu-cảnh | nho | learning about Ember Penguins. Thanks | bộ não hồng tí hon giữa khung |
| 1:19.92 | 0.83 | TRỐNG | trong | details, brain. Appreciate you. I also | beat trắng 0,8s |
| 1:20.75 | 2.67 | minh-hoạ | trung | remember everyone in school kind of fit | người trọc đứng giữa |
| 1:23.42 | 0.66 | chữ | trung | into a category. Athletes, popular kids, | nhãn "Category" trên đầu người trọc |
| 1:24.08 | 0.67 | chữ | trung | into a category. Athletes, popular kids, | "Athletes" (mũ bóng bầu dục xanh) |
| 1:24.75 | 1.17 | chữ | trung | into a category. Athletes, popular kids, | "Popular Kids" → "Nerds" → "Anime Nerds" mỗi ~0,4s |
| 1:25.92 | 0.83 | chữ | trung | nerds, anime nerds, emos, you name them. | "Emos" |
| 1:26.75 | 0.58 | TRỐNG | trong | nerds, anime nerds, emos, you name them. | beat trắng 0,5s |
| 1:27.33 | 1.67 | trực-diện | trung | nerds, anime nerds, emos, you name them. | về trực diện, cười |
| 1:29.00 | 1.42 | TRỐNG | trong | What kind of kid was I in school? You | beat trắng 1,4s |
| 1:30.42 | 1.83 | tiểu-cảnh | nho | guessed it, the quiet one who never | Jaiden tí hon giữa khung ("the quiet one") |
| 1:32.25 | 0.33 | tiểu-cảnh (snap) | nho | talked at all. Growing up, I was a shy, | snap: tí hon vụt bay lên |
| 1:32.58 | 1.09 | TRỐNG | trong | talked at all. Growing up, I was a shy, | beat trắng 1,1s |
| 1:33.67 | 1.66 | minh-hoạ | trung | talked at all. Growing up, I was a shy, | Jaiden nhút nhát, tay chắp, nhìn xuống (không phải tư thế trực diện) |
| 1:35.33 | 2.59 | minh-hoạ (snap) | trung | quiet person. And I always only had one | snap khoanh tay |
| 1:37.92 | 0.33 | TRỐNG | trong | or two friends in a class, if any. I | beat trắng 0,3s |
| 1:38.25 | 3.08 | minh-hoạ | trung | mean, I'm still pretty reserved, but I | phỏng vấn: Jaiden cầm mic + người trọc, prop bàn |
| 1:41.33 | 1.42 | TRỐNG | trong | mean, that's another point. I was so shy | beat trắng 1,4s |
| 1:42.75 | 3.00 | minh-hoạ | trung | that one time, my nose started bleeding | Jaiden ở bàn; máu mũi xuất hiện trong shot |
| 1:45.75 | 8.42 | đông-người | rong | randomly in the middle of a class. And I | lớp học đông, Jaiden góc phải; giơ tay trong shot; 8,4s |
| 1:54.17 | 1.16 | TRỐNG | trong | leave. And you know what happened? The | beat trắng 1,2s |
| 1:55.33 | 2.17 | phản-ứng | can | leave. And you know what happened? The | thầy trọc tiền cảnh qua vai, lớp phía sau |
| 1:57.50 | 0.50 | trực-diện | trung | teacher took five minutes to call on me. | trực diện giận 0,5s |
| 1:58.00 | 0.58 | đông-người | rong | I spent five minutes panicking, trying | lớp học rộng 0,6s |
| 1:58.58 | 2.67 | đông-người | trung | I spent five minutes panicking, trying | lớp học gần hơn, Jaiden lo |
| 5:00.08 | 2.25 | tiểu-cảnh | nho | fire sprinkler. A bit of a safety hazard | Jaiden tí hon góc phải dưới |
| 5:02.33 | 1.00 | đông-người | trung | if you asked me, but again, no one | 4 học sinh trọc hàng ngang + chú thích nhỏ phía trên |
| 5:03.33 | 0.84 | trực-diện | trung | questioned him. And one time on a random | về trực diện |
| 5:04.17 | 1.41 | trực-diện (snap) | trung | questioned him. And one time on a random | snap tay |
| 5:05.58 | 1.09 | minh-hoạ | rong | day of | lớp có cửa, 2 học sinh; cửa mở trong shot |
| 5:06.67 | 0.50 | minh-hoạ | can | class, draw | thầy cướp biển lao vào máy quay |
| 5:07.17 | 2.33 | phản-ứng | rong | class, draw | mặt cướp biển đặc tả 3 khung → học sinh ngồi bàn ngơ ngác |
| 5:09.50 | 1.50 | trực-diện | can | [Applause] | Jaiden sợ, cận hơn trực diện thường (phản ứng người kể) |
| 5:11.00 | 0.25 | TRỐNG | trong | me, he burst through the door, dressed | beat trắng 0,2s |
| 5:11.25 | 1.67 | minh-hoạ | rong | me, he burst through the door, dressed | lớp + cửa, cướp biển ở cửa |
| 5:12.92 | 1.41 | minh-hoạ | trung | up completely like a pirate, screaming | cướp biển chạy hét, kiếm |
| 5:14.33 | 2.34 | phản-ứng | trung | up completely like a pirate, screaming | học sinh trọc + cướp biển hét vào mặt, 2-shot |
| 5:16.67 | 0.58 | đặc-tả | sat | in people's faces and running around | mặt cướp biển chiếm cả khung |
| 5:17.25 | 1.67 | tiểu-cảnh | nho | in people's faces and running around | cướp biển tí hon chạy |
| 5:18.92 | 1.33 | trực-diện | trung | like a crackpot. I didn't take his class | về trực diện |
| 5:20.25 | 1.58 | chữ | chu | anymore. But that was not the end of Mr. | "But that was not the end of Mr." từng từ theo lời |
| 5:21.83 | 0.75 | chữ | chu | anymore. But that was not the end of Mr. | "Mr. Captain" → "JACK" to dần |
| 5:22.58 | 0.42 | chữ | chu | Captain Jack Sparrow. Nope. You know | "JACK SPARROW!!" |
| 5:23.00 | 0.50 | chữ | chu | Captain Jack Sparrow. Nope. You know | "NOPE!" phóng to vọt khung 0,4s |
| 5:23.50 | 0.75 | trực-diện | trung | Captain Jack Sparrow. Nope. You know | về trực diện đắc ý |
| 5:24.25 | 1.08 | TRỐNG | trong | why? Cuz he was one of the tennis | beat trắng 1,0s |
| 5:25.33 | 1.42 | tiểu-cảnh | nho | why? Cuz he was one of the tennis | cướp biển cầm vợt + "All pirates play tennis!" |
| 5:26.75 | 0.25 | phản-ứng | can | coaches. Yep. And you all know who was | mặt trọc lạnh, chữ "yup." nhỏ, 0,25s |
| 5:27.00 | 3.58 | TRỐNG | trong | coaches. Yep. And you all know who was | beat trắng 3,6s sau "yup." |
| 5:30.58 | 0.59 | tiểu-cảnh | nho | on the tennis team. | Jaiden tí hon |
| 5:31.17 | 1.83 | trực-diện | trung | It wasn't that bad because he coached | về trực diện |
| 5:33.00 | 0.75 | đông-người | trung | the boys team. His ex-wife coached the | hàng học sinh nam trọc + thầy tóc bạc |
| 5:33.75 | 1.83 | đông-người | trung | the boys team. His ex-wife coached the | cùng bố cục: hàng nữ + vợ cũ tóc nâu |
| 5:35.58 | 2.50 | TRỐNG | trong | girls. She got fired later on for | beat trắng 2,4s (câu tế nhị, im hình) |
| 5:38.08 | 1.75 | chữ | chu | sleeping with the track teacher. But | "But this story isn't about her :)" từng từ, chữ lớn giữa |
| 5:39.83 | 3.00 | minh-hoạ | rong | this story isn't about her. So, he'd be | sân tennis phối cảnh 2 sân, nhãn viết tay "ex-wife"/"him" + chú thích |
| 5:42.83 | 1.50 | TRỐNG | trong | with her own drills. And one practice, I | beat trắng 1,4s |
| 5:44.33 | 1.59 | trực-diện | trung | with her own drills. And one practice, I | về trực diện |
| 5:45.92 | 1.33 | trực-diện (snap) | trung | don't know what happened, but all of a | snap tay |
| 5:47.25 | 2.08 | tiểu-cảnh | nho | sudden, he got super hyped out of | thầy tí hon → phóng to dần trong shot |
| 5:49.33 | 1.92 | đặc-tả | sat | nowhere and started yelling and making a | thầy hét cận, rung máy |
| 5:51.25 | 3.00 | phản-ứng | trung | commotion. And we all kind of just | 2 cô gái (Jaiden + bạn tóc vàng) nhìn, mặt lạnh |
| 5:54.25 | 1.25 | phản-ứng | can | "Okay, what's he doing?" And then he | Jaiden trong cảnh, cận, mặt lạnh |
| 5:55.50 | 1.00 | trực-diện | trung | "Okay, what's he doing?" And then he | về trực diện |
| 5:56.50 | 0.42 | TRỐNG | trong | started yelling, "I'm going to jump over | beat trắng 0,3s |
| 5:56.92 | 1.75 | tiểu-cảnh | nho | started yelling, "I'm going to jump over | thầy tí hon + "I'M GONNA JUMP OVER THE NET!!!!" viết tay từng từ |
| 5:58.67 | 0.83 | chữ | chu | the net." And the rule of tennis for | "xD" chữ nhỏ góc dưới phải trên nền trống |
| 5:59.50 | 2.67 | trực-diện | trung | the net." And the rule of tennis for | về trực diện cười |

## 2. Phân loại & tỉ lệ

**Hai đoạn khảo sát (95 shot thật, 167,4 s):**

| loại | số shot | % shot | thời gian | % thời gian |
|---|---|---|---|---|
| minh-hoạ-hành-động | 20 | 21,1 | 46,2 s | 27,6 |
| khung-trắng-trống (beat) | 18 | 18,9 | 22,2 s | 13,2 |
| nói-trực-diện | 15 | 15,8 | 25,2 s | 15,1 |
| chữ-trên-màn (là shot riêng) | 13 | 13,7 | 18,5 s | 11,0 |
| tiểu-cảnh-nhỏ giữa khung trắng | 11 | 11,6 | 19,6 s | 11,7 |
| cảnh-đông-người | 6 | 6,3 | 15,2 s | 9,1 |
| phản-ứng-nhân-vật-khác | 6 | 6,3 | 11,3 s | 6,8 |
| đặc-tả | 4 | 4,2 | 5,2 s | 3,1 |
| ảnh-thật/meme | 2 | 2,1 | 3,9 s | 2,3 |

Thêm 12 "snap" đổi tư thế trong cùng cảnh (không phải shot mới) — cách tham chiếu tạo cảm giác chuyển động: đổi tư thế trong 1 khung rồi giữ 0,3–1,8 s.

**Toàn thân phim (231 shot / 403 s, tự động):**
- Độ dài shot: median **1,42 s**, mean 1,75 s, p25/p75 0,83/2,21 s. Phân bố: <0,5 s: 19; 0,5–1 s: 53 (→ **<1 s = 72 = 31 %**); 1–2 s: 85; 2–4 s: 58; 4–8 s: 14; >8 s: 2 (lớp học 1:45,75 dài 8,4 s; 3:16 dài 8,3 s).
- Nói trực diện: **16,0 % thời gian** (cận dưới); 29 đoạn TD, độ dài median 1,83 s, p25/p75 1,17/2,92 s, **dài nhất 6,83 s** (mở đầu 0:00–0:06,8). Khoảng rời TD giữa hai đoạn TD: median **10,5 s**, p25/p75 4,5/17,7 s, **max 34,5 s**; phân bố: <2 s: 1, 2–5 s: 7, 5–10 s: 5, >10 s: 15.
- Beat trắng hoàn toàn: **27 shot, 28,9 s = 7,2 % thời gian**; median 0,92 s, p25/p75 0,5/1,25 s, **max 3,58 s** (5:27–5:30,6). 
- 1,69 mốc cắt mỗi câu (136 câu / 230 cắt); một câu trung bình 2,97 s.

## 3. Quy tắc dựng rút ra (có số)

**3.1 Khi nào rời trực diện → minh hoạ.** Rời ngay khi lời chuyển từ *bình luận* sang *sự kiện/ví dụ/liệt kê/lời nhân vật khác*: "I used to think to myself, uh, school's never…" (6,83 → bàn học), "For example, in first grade" (40,75 → trắng → first grade jaiden), "Athletes, popular kids…" (mỗi mục một shot 0,4–0,8 s có nhãn), "Like you come home. Oh, mom" (58,58 → cửa mở). Đoạn TD dài nhất 6,8 s ở mở đầu; sau đó TD **không giữ quá ~3 s** (p75 2,9 s) rồi rời. Rời TD đi đâu (2 đoạn): trắng 5, minh hoạ 4, tiểu cảnh 2, đông người 2, chữ 1 — nghĩa là **hơn 1/3 lần rời TD đi qua một beat trắng 0,3–1,4 s trước khi hiện cảnh mới**.

**3.2 Câu chốt/punchline xử lý bằng 3 kiểu, đều đo được:**
- (a) **Chữ lớn tức thì**: "YOU'RE WRONG" hiện trong 1 khung ở 74,667 s, giữ 12 khung (0,5 s), trắng 8 khung (0,33 s), rồi video thật; "NOPE!" 322,90 s hiện rồi phóng to từ cao 45 % → 67 % khung trong 0,4 s (tràn khung) → cắt cứng về TD 323,40 s. "But this story isn't about her :)" 338,08 s, hiện từng từ trong 1,75 s.
- (b) **Đặc tả leo cỡ theo bước cứng**: 1:03,58 trung (0,92 s) → 1:04,50 cận (0,75 s) → 1:05,25 sát (1,92 s) → trắng 2,9 s. Cướp biển: 5:05,58 rộng cửa mở (1,1 s) → 5:06,67 lao vào máy (0,5 s) → 5:07,17 phản ứng học sinh (2,3 s) → 5:09,50 TD sợ (1,5 s).
- (c) **Im hình**: sau câu chốt để **trắng 2,5–3,6 s** ("Does school still do this? I don't know" → trắng 2,9 s → "i hope so" chữ tí hon; "sleeping with the track teacher" → trắng 2,5 s; "yup." 0,25 s → trắng 3,58 s).

**3.3 Sau punchline về trực diện sau bao lâu.** Hai mẫu: (i) về **ngay** trong ≤0,85 s để "ăn" phản ứng người kể: NOPE! → TD 0 s (323,5); "xD" → TD 0,83 s; "I didn't take his class" → TD ngay; (ii) **không về**, nối chuỗi insert: "you're wrong" → trắng → video 1,3 s → não 2,9 s → người trọc → 6 nhãn → trắng → TD ở 87,33 s (**12,8 s sau**). Toàn phim khoảng rời TD median 10,5 s. Loại shot đứng ngay trước khi về TD (2 đoạn): tiểu cảnh 3, phản ứng 3, minh hoạ 3, trắng 2, chữ 2, đông người 1 — về TD thường **sau một shot nhỏ/lạnh**, không về thẳng từ thẻ chữ lớn (trừ NOPE!).

**3.4 Shot dưới 1 giây dùng để làm gì** (30/95 trong 2 đoạn = 32 %; toàn phim 31 %): chữ/nhãn liệt kê 8 (0,4–0,8 s mỗi mục), **nháy trắng 7** (0,25–0,6 s giữa hai cảnh khác nhau), TD chêm 4 (0,5–0,85 s: nét mặt người kể rồi đi tiếp), bước hành động 4 (cửa mở, lao vào), bước zoom đặc tả 2, thiết lập rộng 2 (0,6 s rộng rồi vào gần), tiểu cảnh 2, phản ứng 1 (0,25 s "yup."). Ngắn nhất 0,25 s (6 khung 24fps).

**3.5 Cỡ cảnh giữa hai shot liên tiếp** (68 chuyển, bỏ trống/chữ): **cùng cỡ 23 (34 %), gần hơn 24 (35 %), xa hơn 21 (31 %)** — không có xu hướng rộng→cận cố định; nhiều nhất là trung→trung 23 (đổi nội dung, giữ cỡ), nho→trung 9, trung→nho 6, trung→rong 5, rong→trung 4. Chỉ 2 chuỗi leo cỡ liên tiếp (can→sat). Hai shot cùng bố cục thay nội dung (5:33,00 nam / 5:33,75 nữ) là mẫu "so sánh".

**3.6 Cắt so với câu.** 32,2 % cắt cách ranh giới câu ≤0,25 s (ngẫu nhiên 16,6 %), 48,7 % ≤0,5 s (ngẫu nhiên 31,7 %) → **~2/3 số cắt rơi giữa câu**, neo vào **từ** (89 % cắt cách đầu một từ ≤0,15 s ở độ phân giải từ 0,26 s). Cắt là cắt cứng 100 % (đổi hoàn toàn trong 1 khung ở mọi mẫu 24fps), không có mờ chồng.

**3.7 Khung nhân vật (đo bbox nét):** TD chuẩn x 0,52–0,96, y 0,10–1,00 → nhân vật **rộng 38–44 % khung, lệch phải, cắt ở ngực, nửa trái để trống**; TD cận (sợ) rộng 53 %; nhân vật+prop bàn rộng 51 % cao 83 %; tí hon rộng 13–19 % cao 33–39 % (giữa khung hoặc góc); đặc tả mặt rộng 68 % cao 100 %; lớp học đông 90 %/94 %; sân tennis 100 %/85 %.

## 4. Chữ trên màn hình

- Đếm tay: **≥32 lần / 403 s (≈1 lần mỗi 12,6 s)** — chính xác ở 3 phút khảo sát, cận dưới ở 2:00–5:00 (lấy mẫu 2 s). Trong 2 đoạn: **22/95 shot có chữ (23 %)**: viết tay chú thích/lời nhân vật 8, thẻ chữ thay cảnh 7, nhãn in trên đầu nhân vật 4, chữ in kèm nhân vật 3.
- Bốn kiểu: (1) **kèm** nhân vật, sans đậm, cao 5 % khung ("random memories" x 0,55–0,93, ngang mặt, có ngoặc kép); chữ lớn kèm tiểu cảnh + mũi tên ("YOU'RE WRONG" 2 dòng cao 23 %, góc trên phải; "School 101", "THIS GUY."). (2) **Thẻ thay cảnh** trên nền trắng, căn giữa, kinetic: dòng dẫn cao 6 %, "Mr. Captain" 12 %, "JACK SPARROW!!" 18 % rộng 99 %, "NOPE!" 45→67 %; "But this story isn't about her :)" khối 66 %×62 %; chữ tí hon thay cảnh ("i hope so", "xD" góc dưới phải). (3) **Nhãn** in đậm trên đầu nhân vật, cao 9 %, y 0,06–0,16 ("Category/Athletes/Popular Kids/Nerds/Anime Nerds/Emos" 0,4–0,8 s mỗi nhãn; "elementary/middle/high school jaiden"). (4) **Viết tay** in hoa nét bút cạnh tiểu cảnh, thường có mũi tên ("first grade jaiden" 19 %×19 %, "holding my gross tooth…", "All pirates play tennis!", "ex-wife/him", "lol irony", "blah blah", "yup.") và lời nhân vật ("I'M GONNA JUMP OVER THE NET!!!!" 40 %×24 % góc trên trái, nhân vật tí hon bên phải). Chữ trên prop: "ADULTHOOD" trên áo, "SPOOPY" trên cờ, "Blood Pressure" cạnh nhiệt kế.
- Hiệu ứng vào (đo 24fps): **tức thì 1 khung, không fade, không trượt**. Kinetic từng từ đúng lúc nói: But 320,15 / that 320,23 / was 320,40 / not 320,65 / the 320,90 / end 320,98 / of 321,15 / Mr. 321,32 (to hơn) / Captain 321,73 / JACK 322,07 / SPARROW!! 322,40 / NOPE! 322,90 (phóng to 0,4 s) → TD 323,40. Viết tay cũng từng từ: I'M 356,80 / GONNA 357,05 / JUMP 357,30 / OVER 357,55 / THE 357,88 / NET!!!! 358,05 → trắng+xD 358,55 → TD 359,38. Chữ chỉ biến mất khi cắt shot. Font in: sans geometric đậm (kiểu Montserrat/Proxima Bold), đen 100 %; nhấn bằng cỡ, không bằng màu.

## 5. Nền và prop

- **194/231 shot (84 %) nền trắng trơn có nét vẽ; 27 (11,7 %) trắng hoàn toàn; 10 (4,3 %) không trắng**: video thật chim cánh cụt 1:15,67 (1,3 s), ảnh thật che khung 0:26,5, ảnh chụp bình luận YouTube ~3:34, poster Pirates of the Caribbean ~4:36, phòng tối đèn laser 4:42–4:45 (3,25 s + 2,1 s), "NOPE!" che khung. Ảnh/clip thật: **4 lần / 403 s**, mỗi lần ≤2,6 s, trước/sau có nháy trắng 0,3 s.
- Prop được vẽ: bàn học (hộp phối cảnh 2 điểm tụ, thấy mặt trên + 2 mặt bên), cửa (khung chữ nhật; cánh mở vẽ thành hình bình hành thu ngắn), lớp học (hàng bàn lùi xa tụ về một điểm, học sinh đầu trọc không mặt), bàn phỏng vấn + mic, phong bì răng, khăn giấy, nhiệt kế, cờ cướp biển, kiếm, vợt, **sân tennis 2 sân phối cảnh 1 điểm tụ + lưới**, lưới cận, giá vẽ, máy tính + loa, gậy golf. Chỉ vẽ đúng prop câu đang nhắc, không vẽ phòng.
- Kiểu nét (đo run-length @640 px): **prop và nhân vật cùng một độ nét, mode 2 px @640 ≈ 4 px @1280**; sân tennis mảnh hơn (1 px @640). Không tô màu ngoài tóc Jaiden (nâu đen phẳng) và điểm nhấn (máu đỏ, não hồng, mũ xanh, Pikachu vàng, tóc nhân vật phụ vàng/nâu/bạc). Nhân vật phụ = đầu trọc trắng không mặt (chỉ mắt chấm/miệng nét).

## 6. So với pipeline hiện tại (tinh-dau) và đề xuất board mới

| Điểm | `tinh-dau` hiện tại | Tham chiếu đo được |
|---|---|---|
| Độ dài shot tối thiểu | `NGAN_NHAT = f(2.4)` gộp mọi mốc <2,4 s | median 1,42 s; 31 % shot <1 s; min 0,25 s → luật 2,4 s xoá ~65 % mốc |
| Chuyển shot | `MoChong` mờ chồng 13 khung | cắt cứng 100 %, đổi trong 1 khung |
| Cỡ cảnh | `CO` 4 mức + zoom trượt `z*(1+0.035*t)` | 7 mức (thêm nho/chu/trong); đổi cỡ theo **bước cứng** 0,75 s, không zoom trượt; 34 % giữ cỡ |
| Nền | mọi shot bắt buộc `canh` đầy (`CANH[s.canh]`) | 84 % nền trắng + 1 prop; 11,7 % shot trắng hoàn toàn |
| Chữ | không có (chỉ `NhanChuong` đầu chương) | 23 % shot có chữ, 4 kiểu, vào tức thì/từng từ |
| Insert | không | 4 ảnh/clip thật / 403 s, mỗi cái ≤2,6 s, kèm nháy trắng |
| Phản ứng | không | 6 % shot phản ứng nhân vật khác + TD biến thể cận (sợ) |
| Chuyển động nhân vật | 3 tầng liên tục theo giọng (`dien.tsx`) | snap tư thế giữ nguyên (12 snap/3 phút), 71,5 % khung đứng yên |
| Mật độ mốc | ~6 mốc/chương | 1,69 cắt/câu, 2/3 cắt giữa câu |
| Bố cục TD | tâm khung (`cx = W/2`) | lệch phải x 0,52–0,96, nửa trái trống cho chữ/insert |

**Schema board đề xuất** (file đầy đủ kèm ví dụ: `board-schema-de-xuat.json`):

```json
{"say": "câu neo (giữ cơ chế neoNhieu)",
 "loai": "truc-dien|minh-hoa|phan-ung|dac-ta|chu|insert|tieu-canh|dong-nguoi|trong",
 "co": "nho|rong|trung|can|sat|chu|trong",
 "dai": 1.2,                       // chỉ cho 'trong' (beat trắng) hoặc ép độ dài
 "nen": "trang|toi|canh:<ten>",     // mặc định trang
 "prop": [{"ten":"ban-hoc","x":0.55,"y":0.75,"co":0.5,"phoi_canh":"hai-diem-tu"}],
 "dien": [{"kieu":"nam","x":0.74,"y":0.55,"co":1.0,"dang":"dung","sac":"thuong","noi":true,
           "hanh_dong":[{"tai":0.0,"dang":"dung"},{"tai":0.8,"dang":"chi","snap":true}]}],
 "chu": {"kieu":"kem|the|nhan|tay","noi_dung":"...","vi_tri":"phai-ngang-mat|tren|giua|goc-duoi-phai|canh-nhan-vat",
         "vao":"tuc-thi|tung-tu","nhan_manh":["TỪ"],"phong_to_cuoi":false,"mui_ten":true},
 "insert": {"kieu":"anh-that|clip","src":"meme/x.jpg","khung":"full|goc","dai":1.3},
 "zoom_buoc": [{"tai":0.0,"co":"trung"},{"tai":0.75,"co":"can"},{"tai":1.5,"co":"sat"}]}
```

Ràng buộc kiểm máy (đưa vào `pipeline/kiem-tra.mjs`): shot ≥0,25 s; median độ dài 1–2 s; TD 12–25 % thời gian, đoạn TD ≤7 s, rời TD ≤35 s; beat trắng ≤3,6 s, tổng 5–10 %; ≥1 chữ / 15 s; nền không trắng ≤5 % shot; insert ≤2,6 s có nháy trắng 0,3 s hai đầu; chữ không fade.

## 7. File tạo (scratchpad `…/shotgram/`)
Script: `align_cuts.py` (cắt↔lời + contact sheet), `metrics.py` (white/bbox/colorful từng khung), `detect2.py` (dò cắt XOR + đặc trưng tóc), `labels.py` (nhãn tay 107 mốc + thống kê). Dữ liệu: `master_starts.json` (230 mốc hợp nhất), `labels.json`, `td_runs.json`, `cuts2.json`, `shot_metrics.json`, `frame_metrics.npz`, `inner_metrics.npz`, `dark_feat.npy`, `td_mask.npy`, `board-schema-de-xuat.json`. Ảnh: `seg_0000_0120_sheet00–04.jpg`, `seg_0300_0360_sheet00–03.jpg`, `new_0000_0120.jpg`, `new_0300_0360.jpg`, `strip_*.jpg`, `s24_*.jpg` (24fps chữ), `td_check.jpg`, `check_mask.jpg`; khung 24fps trong `ref-oV/b24_{rm,yw,cap,jump,s101}/`.

## SỐ LIỆU
- Thân phim 403,3 s (bỏ outro fan-art 6:43–7:52); 230 mốc cắt hợp nhất → 231 shot; cuts_px.json bỏ sót 67 mốc nội dung nhỏ, bộ dò XOR bổ sung
- Độ dài shot: median 1,42 s, mean 1,75 s, p25/p75 0,83/2,21 s; 31 % shot <1 s (72/231); ngắn nhất 0,25 s; dài nhất 8,4 s
- 2 đoạn khảo sát (167,4 s): 107 mốc = 12 snap tư thế + 95 shot thật
- Tỉ lệ shot (2 đoạn): minh-hoạ 21 %, trắng-trống 19 %, trực-diện 16 %, chữ 14 %, tiểu-cảnh 12 %, đông-người 6 %, phản-ứng 6 %, đặc-tả 4 %, ảnh-thật 2 %
- Tỉ lệ thời gian (2 đoạn): minh-hoạ 27,6 %, trực-diện 15,1 %, trắng 13,2 %, tiểu-cảnh 11,7 %, chữ 11,0 %, đông-người 9,1 %, phản-ứng 6,8 %, đặc-tả 3,1 %, ảnh-thật 2,3 %
- Nói trực diện toàn phim: 16,0 % thời gian (cận dưới); 29 đoạn, median 1,83 s, max 6,83 s (mở đầu)
- Khoảng rời trực diện: median 10,5 s, p25/p75 4,5/17,7 s, max 34,5 s; 15/28 khoảng >10 s
- Beat trắng hoàn toàn: 27 shot = 28,9 s = 7,2 % thời gian; median 0,92 s, max 3,58 s
- Sau beat trắng (2 đoạn) là: minh-hoạ 7, tiểu-cảnh 5, chữ 2, trực-diện 2, ảnh-thật 1, phản-ứng 1
- Shot <1 s (2 đoạn) 30/95: chữ/nhãn 8, nháy trắng 7, TD chêm 4, bước hành động 4, tiểu-cảnh 2, bước zoom 2, thiết lập rộng 2, phản ứng 1
- Chuyển cỡ giữa 2 shot liên tiếp: cùng cỡ 34 %, gần hơn 35 %, xa hơn 31 % (68 chuyển); trung→trung nhiều nhất 23
- Cắt vs câu: 136 câu/403 s (2,97 s/câu); 1,69 cắt/câu; chỉ 32 % cắt cách ranh giới câu ≤0,25 s (ngẫu nhiên 17 %) → 2/3 cắt giữa câu; 89 % cắt trùng đầu từ (≤0,15 s)
- Cắt cứng 100 %, đổi trong 1 khung 24fps; không mờ chồng, không zoom trượt
- Đặc tả leo cỡ theo bước 0,75 s: 1:03,58 trung → 1:04,50 cận → 1:05,25 sát → trắng 2,9 s
- Chữ: ≥32 lần/403 s (1 lần/12,6 s); 22/95 shot có chữ (23 %): viết tay 8, thẻ thay cảnh 7, nhãn 4, kèm 3
- Chữ hiện tức thì 1 khung: 'random memories' 36,508 s; 'YOU'RE WRONG' 74,667 s giữ 0,5 s → trắng 0,33 s → video thật
- Kinetic từng từ đúng lời: But 320,15 / that 320,23 / was 320,40 / not 320,65 / the 320,90 / end 320,98 / of 321,15 / Mr. 321,32 / Captain 321,73 / JACK 322,07 / SPARROW!! 322,40 / NOPE! 322,90 (phóng 45→67 % cao trong 0,4 s) → TD 323,40
- Cỡ chữ (% cao khung): caption kèm 5 %, nhãn 9 %, dòng dẫn thẻ 6 %, 'Mr. Captain' 12 %, 'JACK SPARROW!!' 18 %, 'NOPE!' 45→67 %, thẻ 'But this story…' khối 66×62 %, 'YOU'RE WRONG' 23 %
- Nền: 84 % shot trắng có nét, 11,7 % trắng hoàn toàn, 4,3 % không trắng (10 shot); ảnh/clip thật 4 lần, mỗi lần ≤2,6 s
- Nét vẽ: prop và nhân vật cùng mode 2 px @640 (≈4 px @1280); sân tennis 1 px @640; không tô màu ngoài tóc + điểm nhấn
- Khung TD: nhân vật x 0,52–0,96, y 0,10–1,00 (rộng 38–44 %, lệch phải, cắt ở ngực); tí hon rộng 13–19 % cao 33–39 %; đặc tả rộng 68 % cao 100 %
- Punchline về TD: NOPE! → TD 0 s; 'xD' → TD 0,83 s; 'you're wrong' → TD sau 12,8 s (chuỗi insert)
- Pipeline tinh-dau: NGAN_NHAT 2,4 s sẽ gộp ~65 % mốc của tham chiếu; MoChong 13 khung vs 0; zoom trượt 3,5 % vs bước cứng; 100 % shot có cảnh nền đầy vs 84 % trắng

## ĐỀ XUẤT
- src/projects/*/phim.tsx hàm dung(): hạ NGAN_NHAT từ f(2.4) xuống f(0.25) và cho phép shot loại 'trong' (beat trắng) có độ dài khai báo 'dai'
- src/projects/*/phim.tsx component Khung: bỏ zoom trượt `z * (1 + 0.035 * t)`; thêm 'zoom_buoc' đổi cỡ theo bước cứng (0,75 s) như tham chiếu
- src/projects/*/phim.tsx component MoChong: mặc định len = 0 (cắt cứng); chỉ mờ chồng khi shot khai báo 'chuyen: mo-chong'
- src/projects/*/board.ts type Moc: mở rộng thành schema mới (loai, co thêm 'nho'|'chu'|'trong', nen, prop[], chu{}, insert{}, dai, zoom_buoc[], dien[].hanh_dong[]) theo board-schema-de-xuat.json
- src/engine/: thêm renderer Chu với 4 kiểu (kem/the/nhan/tay), vào tức thì hoặc từng từ theo cueTimings, tuỳ chọn phóng to từ cuối; không fade
- src/library/scenes/: thêm nền 'trang' và thư viện prop rời (ban-hoc, cua, lop-hoc-day-ban, ban-phong-van, san-tennis, luoi) vẽ nét 4 px @1280 không tô, tách khỏi bối cảnh đầy
- src/library/cast/dien.tsx: thêm chế độ 'snap' (đổi tư thế tức thời theo hanh_dong[].tai rồi giữ nguyên) song song 3 tầng hiện có; thêm kiểu nhân vật 'vo-danh' đầu trọc không mặt cho cảnh đông người
- Khung nói trực diện: đặt nhân vật lệch một bên (x ≈ 0,74 khung), chiếm 38–44 % rộng, cắt ở ngực; nửa còn lại dành cho chữ kèm/insert
- pipeline/kiem-tra.mjs: thêm chốt chặn — shot ≥0,25 s; TD 12–25 % thời gian, đoạn TD ≤7 s, rời TD ≤35 s; beat trắng ≤3,6 s và tổng 5–10 %; ≥1 chữ mỗi 15 s; nền không trắng ≤5 % shot; insert ≤2,6 s kèm nháy trắng 0,3 s
- thu-vien.json: thêm khoá loai_shot, kieu_chu, prop, insert; co_canh thêm 'nho','chu','trong'
- Insert ảnh thật: dùng public/meme/ với shot loai 'insert', luôn kèm beat trắng 0,3 s trước và sau như tham chiếu
- Khi đo tham chiếu khác, thay pixel-diff (analyze.py) bằng XOR mặt nạ nét (detect2.py) — pixel-diff bỏ sót 67/230 mốc ở shot nội dung nhỏ

## TỆP
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/align_cuts.py
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/metrics.py
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/detect2.py
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/labels.py
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/labels.json
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/master_starts.json
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/cuts2.json
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/all_groups.json
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/seg_0000_0120.json
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/seg_0300_0360.json
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/shot_metrics.json
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/td_runs.json
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/frame_metrics.npz
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/inner_metrics.npz
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/dark_feat.npy
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/td_mask.npy
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/board-schema-de-xuat.json
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/seg_0000_0120_sheet00.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/seg_0000_0120_sheet01.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/seg_0000_0120_sheet02.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/seg_0000_0120_sheet03.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/seg_0000_0120_sheet04.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/seg_0300_0360_sheet00.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/seg_0300_0360_sheet01.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/seg_0300_0360_sheet02.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/seg_0300_0360_sheet03.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/new_0000_0120.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/new_0300_0360.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/strip_67_76.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/strip_26_29.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/strip_181.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/strip_88_94.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/s24_rm.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/s24_yw.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/s24_cap.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/s24_jump.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/s24_s101.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/td_check.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/check_mask.jpg
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/shotgram/mask_td_4p5.png
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/b24_rm/
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/b24_yw/
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/b24_cap/
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/b24_jump/
- /private/tmp/claude-501/-Users-leanhvu-toc-use-case/8840d734-5d45-4338-b2ea-1fdf6cfbba02/scratchpad/ref-oV/b24_s101/