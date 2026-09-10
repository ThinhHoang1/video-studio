# Vì sao video ra "đứng hình", chuyển động và lip-sync không mượt

Đọc file này khi video render xong mà nhân vật **đứng yên như ảnh tĩnh**, cắt
cảnh giống **slide thuyết trình**, hoặc **miệng mở đóng vô hồn** không khớp lời.

Cả ba đều **không phải lỗi renderer**. Renderer chỉ vẽ đúng những gì board và
các file dữ liệu nói. Đứng hình nghĩa là board không khai chuyển động, hoặc file
lip-sync không tồn tại.

`node pipeline/cham-diem.mjs <ten>` đo đúng ba thứ này trên chính file mp4. Điểm
dưới 90% thì **chưa được giao**, và bảng chấm chỉ thẳng chỉ số nào rớt.

---

## 1. Nhân vật đứng yên → thiếu `act`

Một diễn viên chỉ khai `dang` mà không có `act` thì **giữ nguyên một tư thế
suốt shot**. Shot 2 giây = 60 frame y hệt nhau.

```jsonc
// ✗ đứng hình cả shot
{"kieu": "nam", "x": 0.5, "dang": "ngoiGoBan", "mat": "chan"}

// ✓ đổi 3 lần trong shot — mắt, tư thế, miệng snap theo mốc
{"kieu": "nam", "x": 0.5, "dang": "ngoiGoBan", "mat": "chan",
 "act": [{"tai": 0,   "dang": "ngoiGoBan", "mat": "chan"},
         {"tai": 0.5, "mat": "soc", "mieng": "o"},
         {"tai": 0.9, "dang": "chi",  "mat": "cung"}]}
```

`tai` là **giây tính từ đầu shot**, và mọi thay đổi là **snap** (đổi ngay 1
frame, không tween) — đó là đúng ngữ pháp của phong cách này, không phải thiếu sót.

**Chỉ số:** *Mốc act / phút* ≥ 40.
Video đạt 100% có **67.6**; board thiếu act thường rơi xuống **~20** và nhìn là
thấy đứng ngay.

**Luật thực dụng:** mỗi diễn viên **ít nhất 3 mốc act** trong mỗi shot có mặt.

## 2. Không có động tác lớn → thiếu `mau`

`act` đổi tư thế, nhưng chạy vào khung, giật mình, lắc đầu, gật gù, run, cười
lăn… là **mẫu hành động dựng sẵn** — khai một dòng, máy sinh ra hàng chục frame:

```jsonc
{"kieu": "nam", "x": 0.5, "mau": "giat-minh", "mau_tham_so": {"tai": 0, "huong": "trai"}}
```

21 mẫu có sẵn, xem đủ bằng `node pipeline/thu-vien-v2.mjs` (khoá `mau_hanh_dong`).

**Chỉ số:** *Mẫu hành động dùng* ≥ 5 mẫu **khác nhau** trong một video.

## 3. Cắt như slide → shot dài đều, không nhịp trắng

Nhịp là thứ tạo cảm giác "mượt", không phải tween. Ba chỉ số cùng lúc:

| Chỉ số | Mốc | Cách sửa |
|---|---|---|
| Shot trung vị | 1.25–1.6 s | dài hơn → cắt thêm shot: neo một mẩu lời **giữa câu** (đừng neo tiền tố của câu đã neo, sẽ trùng mốc) |
| Shot dưới 1 s | ≥ 30% | thêm `phan-ung` / `dac-ta` / `chu` ngắn giữa các shot dài |
| Khung trắng | 4–12% | chèn shot `{"tai": <giây>, "loai": "trong", "dai": 0.55}` **ngay trước câu chốt** |

`node pipeline/kiem-tra-v2.mjs <ten> --moc` in mốc giây từng shot — nhìn vào đó
tìm khoảng trống ≥ 1.8 s, đó chính là chỗ đặt nhịp trắng.

Nhịp trắng làm hai việc cùng lúc: cho punchline chỗ thở, **và** kéo trung vị
shot xuống. Video 100% dùng **14 nhịp trắng × 0.55 s**.

## 4. Một góc nhìn duy nhất

Không khai `goc` thì mọi nhân vật nhìn thẳng suốt phim. Có 4 góc:
`truoc` (mặc định), `ba-phan-tu`, `nghieng`, `sau` — khai ở diễn viên hoặc ở
từng mốc `act`.

**Chỉ số:** *Số góc nhìn khác nhau* ≥ 3.

## 5. Lip-sync vô hồn → THIẾU FILE `mouth.json`

Đây là nguyên nhân hay bị bỏ sót nhất, và nó **không báo lỗi**.

Renderer đọc miệng theo thứ tự (`src/v2/phim/du-lieu.ts` → `miengTaiFrame`):

1. Có `data/<ten>.mouth.json` → dùng **9 hình miệng Rhubarb** (X A B C D E F G H),
   đổi theo từng frame, kèm biến thể chống lặp. Đây là lip-sync thật.
2. **Không có** → rơi về **biên độ âm thanh**: chỉ **3 hình** B / C / D chọn theo
   độ to, im thì đóng. Miệng mở đóng theo âm lượng, không theo âm vị → nhìn như
   con rối, và đó chính là cảm giác "không mượt".
3. Không có cả voice.json → miệng đứng im.

Kiểm ngay:

```bash
ls src/projects/<du-an>/data/<ten>.mouth.json    # thiếu là đang chạy chế độ 2
node pipeline/lipsync.mjs <ten>                  # sinh lại
```

`lipsync.mjs` cần binary Rhubarb ở `tools/rhubarb/`. **Clone mới không có nó**
(`tools/` trong `.gitignore`):

```bash
node pipeline/tai-rhubarb.mjs
```

Trên **Linux arm64** (container OpenClaw) Rhubarb không có bản riêng — phải chạy
bản x86_64 qua qemu, cài một lần:

```bash
dpkg --add-architecture amd64 && apt-get update
apt-get install -y qemu-user-static libc6:amd64 libstdc++6:amd64
node pipeline/tai-rhubarb.mjs      # tự nhận qemu và tải bản Linux
```

`lipsync.mjs` tự gọi qua `qemu-x86_64-static` khi thấy máy arm64. Thiếu qemu thì
script **nói thẳng** là đang rơi về miệng-theo-biên-độ chứ không im lặng.

**Sửa lời `vo` của một chương thì phải chạy lại CẢ BA:** `tts-gemini` →
`analyze-voice` → `lipsync`. Bỏ bước cuối là mouth.json lệch với tiếng mới.

---

## Bảng tra nhanh

| Triệu chứng | Chỉ số rớt | Sửa |
|---|---|---|
| Nhân vật như tượng | Mốc act / phút < 40 | ≥ 3 mốc `act` mỗi diễn viên mỗi shot |
| Không ai chạy/giật mình | Mẫu hành động < 5 | khai `mau` + `mau_tham_so` |
| Giống slide | Trung vị > 1.6 s · <1 s dưới 30% | cắt thêm shot, thêm `phan-ung`/`chu` ngắn |
| Chốt câu bị trôi | Khung trắng < 4% | chèn `loai: "trong"` 0.55 s trước punchline |
| Nhìn thẳng suốt phim | Góc nhìn < 3 | thêm `goc` |
| Miệng vô hồn | — (bảng chấm KHÔNG bắt được) | kiểm `data/<ten>.mouth.json`, chạy `lipsync.mjs` |
| Không có nhạc | — | `node pipeline/tai-nhac.mjs --sfx` |

⚠️ Lip-sync là lỗ hổng duy nhất bảng chấm **không** đo được (tiêu chí "Miệng đổi
hình khi nói" vẫn ✓ ở chế độ biên độ, vì miệng *có* đổi). Phải tự kiểm bằng
`ls .../data/<ten>.mouth.json`.
