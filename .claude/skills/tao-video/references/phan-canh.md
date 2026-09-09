# Viết bảng phân cảnh

File: `src/projects/<du-an>/board.ts`

Đây là chỗ hình khớp với lời. Nguyên tắc gốc: **neo hình vào câu, không rải
theo đồng hồ.**

## Cách sai và cách đúng

Sai — sinh shot theo đồng hồ:

```ts
const shots = chia(total, 3 * FPS).map((g, i) => ({co: VONG[i % 6]}));
```

Chạy được, nhưng hình chẳng liên quan gì tới câu đang nói. Máy không biết câu
"quên đính kèm file" thì nên hiện cái gì.

Đúng — neo vào câu:

```ts
{say: 'quên đính kèm file', canh: 'man-hinh-email', co: 'sat', nguoi: false}
```

Thời điểm không do bạn đặt mà **suy ra từ file giọng đọc**. Sửa kịch bản hay
đổi giọng thì hình tự trôi theo.

## Các trường

| Trường | Bắt buộc | Ý nghĩa |
|---|---|---|
| `say` | có | mẩu lời bình — phải có THẬT trong `vo` của chương |
| `canh` | có | tên cảnh, lấy từ `thu-vien.json` |
| `co` | nên | `rong` `trung` `can` `sat` |
| `sac` | nên | sắc thái mặt |
| `dang` | nên | tư thế |
| `nguoi` | | `false` cho cảnh đặc tả màn hình/vật thể |

## Chọn `say` thế nào

Lấy **3–6 từ đặc trưng**, không lấy cả câu dài. Mẩu càng ngắn và càng riêng
thì càng chắc.

```ts
{say: 'quên đính kèm file', ...}       // tốt
{say: 'Bấm gửi', ...}                   // tốt
{say: 'Mày viết cái email đó trong bốn mươi phút liền', ...}  // dài, dễ hỏng
```

Cùng một mẩu xuất hiện hai lần trong chương thì mốc rơi vào lần đầu. Chọn mẩu
duy nhất.

## Nhịp

**5–8 mốc mỗi chương.** Trung bình một cảnh sống 3–5 giây.

- Ít hơn 3 mốc → cảnh đứng yên, người xem chán. Bộ kiểm tra cảnh báo.
- Hai mốc quá sát → shot 1 giây, giật. Pipeline tự gộp mốc cách nhau dưới 2,8 giây.

## Bố cục một chương

```ts
'ma-chuong': [
  // 1. mở bằng toàn cảnh — cho người xem định vị
  {say: 'câu mở', canh: 'van-phong', co: 'rong', sac: 'thuong', dang: 'dung'},

  // 2-3. vào gần dần khi câu chuyện cụ thể hơn
  {say: 'chi tiết', canh: 'van-phong', co: 'trung', sac: 'nghi', dang: 'goMay'},
  {say: 'chi tiết hơn', canh: 'man-hinh-email', co: 'can', nguoi: false},

  // 4. cận mặt ở câu có cảm xúc
  {say: 'câu nặng', canh: 'van-phong', co: 'sat', sac: 'soc', dang: 'omDau'},

  // 5. CÂU CHỐT → cảnh ẩn dụ
  {say: 'câu chốt', canh: 'tang-hinh', co: 'rong', nguoi: false},
],
```

## Cảnh ẩn dụ — để dành cho câu chốt

Thư viện chia hai nhóm. Nhóm **nơi chốn** minh hoạ nguyên văn: nói văn phòng
thì hiện văn phòng. An toàn, nhưng đó là phụ đề bằng hình, xem xong không
đọng lại.

Nhóm **ẩn dụ** mang một Ý. Người xem phải bắc một nhịp cầu nhỏ trong đầu mới
hiểu, và chính nhịp cầu đó làm họ nhớ.

| Cảnh | Ý | Dùng khi lời bình nói về |
|---|---|---|
| `hai-tram-la-don` | gửi nhiều, nhận gần như không | nộp đơn, gửi tin, chờ hồi âm |
| `vong-luan-quan` | điều kiện tự tham chiếu | yêu cầu không thể đáp ứng |
| `thanh-mot-day-so` | người bị quy về con số | vô danh, bị đánh số |
| `tang-hinh` | không ai tính vào | bị bỏ quên, im lặng |
| `luong-tan-chay` | tiền bốc hơi | chi tiêu ăn hết thu nhập |
| `mot-ngay-364` | so với bản highlight | mạng xã hội, ganh tị |
| `nuoc-tham-qua-ao` | thay đổi chậm, không mốc | trưởng thành, quen dần |
| `vi-qua-tung-thang` | hao mòn tích luỹ | nghèo dần, cạn kiệt |

**Mỗi chương nên có nhiều nhất một cảnh ẩn dụ**, đặt ở câu chốt. Dùng dày quá
thì mất trọng lượng.

Cảnh ẩn dụ luôn `nguoi: false` — chúng tự kể, nhét nhân vật vào là rối.

## Chọn tư thế

Tư thế là thứ người xem thật sự thấy đổi giữa các shot. Bám nội dung câu:

| Lời bình nói về | `dang` |
|---|---|
| gọi điện | `camDT` |
| khẳng định, vạch ra điều gì | `chi` |
| chờ đợi, phòng thủ, bất lực | `khoanhTay` |
| sốc, hối hận, quá tải | `omDau` |
| mệt, buồn, thất vọng | `cuiNguoi` |
| đã quen việc, tự tin | `tayHong` |
| đang làm việc | `goMay` |
| không biết, chịu thua | `nhunVai` |
| vui, ăn mừng | `gioTay` |
| bỏ đi, né tránh | `quayLung` |

Đừng để một tư thế chạy quá hai mốc liên tiếp.

## Meme và tiếng động

File: `src/projects/<du-an>/cues.ts`

```ts
export const MEME = {
  'ma-chuong': [{say: 'câu punchline', src: 'meme/cheems.jpg', cap: 'chú thích'}],
};
export const SFX = {
  'ma-chuong': [{say: 'câu chốt', sfx: 'vine-boom'}],
};
export const NHAC = {'ma-chuong': 'audio/25-silly-fun.mp3'};
```

Cùng cơ chế neo. **Meme trễ nửa giây là hỏng cả câu đùa** — chọn mẩu `say`
thật chắc.

`boom` và `thud` tự kích hoạt rung màn hình + loé trắng, đừng dùng quá 2 lần
một chương.

Nhạc đổi theo cung bậc chương, đừng để một bài chạy suốt video.

## Sai lầm hay gặp

| Sai | Sửa |
|---|---|
| `say` không có trong lời bình | copy nguyên văn từ kịch bản |
| `say` quá dài, vắt qua nhiều cụm | rút còn 3–6 từ đặc trưng |
| Tên cảnh tự nghĩ ra | chỉ dùng tên trong `thu-vien.json` |
| 2 mốc cả chương | thêm cho đủ 5–8 |
| Cảnh ẩn dụ ở mọi mốc | mỗi chương nhiều nhất một |
| Nhân vật đứng trong cảnh đặc tả màn hình | đặt `nguoi: false` |

Chạy `node pipeline/kiem-tra.mjs <ten>` bắt được gần hết những cái này.
