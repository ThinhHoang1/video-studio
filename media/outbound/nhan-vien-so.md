# nhan-vien-so.mp4 — Công ty tôi có một nhân viên. Là tôi.

- Giọng: Fenrir · 7 chương · project `nhan-vien-so` · 2:10 · 109 shot
- Tạo bằng: `node pipeline/tao-video.mjs nhan-vien-so`
- Cổng kịch bản (`cham-kich-ban.mjs`): rubric tự chấm **9.5/10**, 0 lỗi chặn
- Điểm bảng chấm (`cham-diem.mjs`): **100%** (15/15, ngưỡng 90)

## Nội dung

Châm biếm mô hình **"doanh nghiệp một người"** trong Nghị quyết 86/NQ-CP: vừa
quảng cáo (thuế tối giản, thủ tục gọn, trợ lý ảo pháp lý tới cấp xã), vừa nói
mặt trái (lạm dụng AI tới mức AI hai bên tự nói chuyện với nhau bốn ngày; tự
động hoá hết việc của chính mình; ốm một hôm là công ty đóng cửa).

| Chương | Việc |
|---|---|
| `mo-bai` | cold open: 7h sáng họp giao ban với chính mình → tự giới thiệu → lời hứa |
| `chinh-sach` | Nghị quyết 86, mục tiêu 1 triệu doanh nghiệp một người tới 2030 |
| `lap-phong-ban` | lắp 3 con AI làm kế toán / chăm sóc khách / nội dung, đặt tên từng đứa |
| `lam-dung` | AI hai bên nói chuyện với nhau 4 ngày → ký nhầm giá, nhầm tên công ty |
| `tu-sa-thai` | 65% việc hành chính AI làm được → tự sa thải chính mình, mà mình là sếp |
| `mat-trai` | sốt 39° → công ty đóng cửa, không ai họp thay, không ai đổ lỗi được cho ai |
| `ket` | vẫn khuyên đăng ký, nhưng giữ đúng một việc chỉ mình làm được + gọi khán giả |

## Nguồn

Kịch bản là **châm biếm**, nhưng mọi con số và chính sách nêu trong lời bình đều
lấy từ nguồn dưới đây. Nhân vật, tình huống và hội thoại là hư cấu.

| Số liệu trong video | Nguồn |
|---|---|
| Nghị quyết 86/NQ-CP (5/4/2026); mô hình "doanh nghiệp một người"; mục tiêu 1 triệu tới 2030; thuế/kế toán tối giản; trợ lý ảo pháp lý tới cấp xã; thí điểm Hà Nội – TPHCM – Đà Nẵng | [baochinhphu.vn — "Doanh nghiệp một người: cú hích chính sách cho làn sóng khởi nghiệp số"](https://baochinhphu.vn/doanh-nghiep-mot-nguoi-cu-hich-chinh-sach-cho-lan-song-khoi-nghiep-so-102260504125734115.htm) |
| "65% việc hành chính AI làm được" — báo cáo ILO 4/2026, nhóm hành chính/văn phòng rủi ro cao nhất 64.9% | [leos.vn — Nỗi lo AI thay thế việc làm 2026](https://leos.vn/noi-lo-ai-thay-the-viec-lam-2026/) · [afamily.vn — 3 nhóm nhân sự văn phòng đối mặt làn sóng đào thải](https://afamily.vn/dau-nhung-that-day-la-3-nhom-nhan-su-van-phong-se-phai-doi-mat-voi-lan-song-dao-thai-236260616155433304.chn) |

Con số làm tròn trong lời đọc (64.9% → "sáu mươi lăm phần trăm") vì TTS đọc số lẻ
rất tệ; sai số này được ghi ở đây thay vì giấu đi.

## Số liệu dựng

```
  chương       shot    dài  s/shot  trung vị   <1s    TD  trắng  chữ
  mo-bai         12  14.3s   1.19s     1.33s   33%   27%     8%    4
  chinh-sach     13  15.0s   1.15s     1.13s   46%   17%     4%    4
  lap-phong-ban   14  16.5s   1.18s     1.40s   50%    9%     4%    3
  lam-dung       17  16.9s   0.99s     0.90s   59%   16%     4%    3
  tu-sa-thai     17  21.1s   1.24s     1.27s   35%   17%     6%    2
  mat-trai       17  18.4s   1.08s     0.97s   53%   20%    13%    1
  ket            19  23.5s   1.24s     1.17s   42%   22%     8%    5

  18 prop · 4 góc nhìn · 10 mẫu hành động · 3 bối cảnh · 4 nhân vật
  8/9 loại shot · 2.7 act/shot · 53 sfx (15 loại khác nhau)
```

```
nhan-vien-so — media/outbound/nhan-vien-so.mp4 — 130.4 s, 61 shot dò được

  ✓  Thời lượng khớp audio (lệch s)        0.35s   mốc ≤ 1.5
  ✓  Shot trung vị (s)                     1.42s   mốc 1.25–1.6
  ✓  Shot dưới 1 s                           38%   mốc ≥ 30%
  ✓  Khung đứng yên (hold, 12fps)            84%   mốc 60–80%
  ✓  Khung trắng (nhịp trắng)                 9%   mốc 4–12%
  ✓  Nói trực diện (theo shot)               15%   mốc ≤ 20%
  ✓  Chữ trên màn / 15 s                    2.53   mốc ≥ 1
  ✓  Số tư thế khác nhau                      23   mốc ≥ 15
  ✓  Số góc nhìn khác nhau                     4   mốc ≥ 3
  ✓  Mẫu hành động dùng                       10   mốc ≥ 5
  ✓  Bối cảnh dựng sẵn dùng                    3   mốc ≥ 3
  ✓  Prop khác nhau                           23   mốc ≥ 12
  ✓  Cầm đồ (số vật)                           3   mốc ≥ 2
  ✓  Mốc act / phút                        67.63   mốc ≥ 40
  ✓  Miệng đổi hình khi nói (frame)            1   mốc ≥ 60%

  Điểm: 15/15 = 100%  (ngưỡng nghiệm thu 90%)
```

## Mô tả để đăng

> Nhà nước muốn có 1 triệu "doanh nghiệp một người" tới năm 2030. Mình đăng ký
> thật, lắp AI làm đủ ba phòng ban, đặt tên cho từng con, và tưởng mình là tập
> đoàn. Cho tới hôm mình sốt 39 độ.
>
> Nguồn: Nghị quyết 86/NQ-CP (baochinhphu.vn) · Báo cáo ILO 4/2026 về nhóm
> nghề rủi ro cao. Nhân vật và tình huống là hư cấu.

Nhạc nền CC BY — ghi công theo `public/audio/CREDITS.md` khi đăng.
