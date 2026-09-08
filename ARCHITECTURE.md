# Kiến trúc

## Vấn đề cốt lõi: làm sao hình luôn khớp lời

Đây là thứ mọi lần dựng hỏng đều vấp phải, và cũng là lý do repo này tồn tại.

Cách sai — sinh shot tự động theo đồng hồ:

```ts
// cắt mỗi 3 giây, xoay vòng cỡ cảnh
const shots = chia(total, 3 * FPS).map((g, i) => ({co: VONG[i % 6]}));
```

Chạy thì chạy, nhưng hình chẳng liên quan gì tới câu đang nói. Máy không biết
câu "quên đính kèm file" thì nên hiện cái gì — chỉ người viết mới biết.

Cách đúng — **neo hình vào câu**:

```ts
// src/projects/ra-truong/board.ts
{say: 'quên đính kèm file', canh: 'man-hinh-email', co: 'sat', nguoi: false}
```

Khai báo: nghe tới câu này thì đổi sang cảnh này. Thời điểm không do người
đặt mà **suy ra từ chính file giọng đọc**, nên sửa kịch bản hay đổi giọng thì
hình tự trôi theo.

## Đường đi của một mốc neo

```
"quên đính kèm file"
        │
        │  src/engine/neo.ts
        │  dò trong TOÀN BỘ lời bình → vị trí ký tự 412
        ▼
        │  quy ra cụm phụ đề chứa ký tự 412 → cụm số 9
        ▼
        │  src/engine/cues.tsx
        │  cụm 9 bắt đầu ở 62.4% thời lượng chương
        ▼
        │  độ dài chương đo từ mp3 thật: 26.2s
        ▼
      frame 490
```

**Vì sao dò trên toàn bộ lời bình chứ không trong từng cụm.** Bản đầu dò
`say` trong từng cụm phụ đề. Mẩu nào nằm vắt qua ranh giới hai cụm là trượt —
đã phải vá tay ba lần trước khi nhận ra đó là lỗi thiết kế. Dò theo vị trí ký
tự thì mẩu dài bao nhiêu, cắt ở đâu, đều không còn ảnh hưởng.

**Vì sao chia thời gian theo âm tiết.** Chia đều cho mỗi cụm thì cụm "Ê." được
cấp đúng bằng thời gian của cụm bảy từ, phụ đề vọt lên trước tiếng. Tiếng Việt
đơn âm nên số từ ≈ thời gian nói; cộng thêm trọng số cho chỗ ngắt hơi ở dấu
câu là khớp khá sát.

**Neo hỏng thì phải ồn ào.** `neoNhieu()` in cảnh báo ngay lúc build cho mốc
không tìm thấy. Lệch âm thầm còn tệ hơn crash, vì phải xem hết video mới phát
hiện.

## Ba loại mốc, cùng một cơ chế

| Loại | File | Số mốc |
|---|---|---|
| Đổi cảnh | `board.ts` | 99 |
| Meme | `cues.ts` → `MEME` | 19 |
| Tiếng động | `cues.ts` → `SFX` | 27 |

Tất cả đi qua `neoNhieu()`. Hiện tại **145/145 khớp**.

## Nhân vật cử động theo giọng

`pipeline/analyze-voice.mjs` bóc mỗi frame một giá trị từ file mp3:

- `am` — độ to (RMS, chuẩn hoá theo phân vị 95 để một tiếng bật hơi không kéo tụt cả bài)
- `nhan` — điểm nhấn (biên độ vọt lên so với trung bình trượt 30 frame)
- `nghi` — đang ngắt hơi (im dưới ngưỡng quá 6 frame)

`src/library/cast/dien.tsx` dùng ba giá trị đó cho **ba tầng chuyển động khác
tốc độ** — đây là thứ tạo cảm giác mượt thay vì máy móc:

| Tầng | Nhịp | Lấy từ |
|---|---|---|
| thân | đổi chân trụ mỗi 4 giây | đồng hồ |
| đầu | trễ hơn thân, gật theo trọng âm | `nhan` làm mượt |
| tay | nảy bằng lò xo tắt dần | `nhan` vượt ngưỡng |
| lông mày, má | nhướn/ửng theo cường độ | `nhan` |
| thở | sâu hơn khi đang nghỉ | `nghi` |

**Miệng thì không.** Đã thử cho miệng mở theo `am`; tiếng Việt nhiều thanh
điệu nên biên độ nhảy liên tục, ra cảm giác lắp bắp chứ không phải đang nói.
Miệng đứng yên theo cảm xúc trông tự nhiên hơn hẳn.

## Render chia đoạn

Render một mạch 23.000 frame chết giữa chừng hai lần, ở hai frame khác nhau.
Render riêng đúng frame đó thì mất 2 giây và không lỗi → không phải cảnh nào
nặng, mà là Chrome nghẽn khi chạy song song dài.

`render-segments.sh` cắt thành đoạn 900 frame, mỗi đoạn một tiến trình Chrome
mới, đoạn nào xong rồi thì lần chạy sau bỏ qua. Hỏng giữa đường không phải làm
lại từ đầu — đã cứu một lần khi phiên bị kết thúc lúc đang ở đoạn 14/27.

## Vân tay nội dung

Mỗi file giọng kèm một file `.sig` băm từ `voice + style + lời bình`. Sửa kịch
bản là file cũ tự bị coi là hỏng và đọc lại. Không có nó thì dựng nhầm giọng cũ
lên kịch bản mới mà không ai biết.

## Những ràng buộc của môi trường

Ghi lại để lần sau không mất thời gian dò:

- ffmpeg đi kèm Remotion là **bản rút gọn**: không có filter `fps`, `tile`,
  `highpass`, và không có muxer `s16le` để ghi ra stdout. Đọc PCM phải đi vòng
  qua file WAV tạm.
- Muốn chạy ffmpeg/ffprobe đó thì phải đặt `DYLD_LIBRARY_PATH` trỏ vào chính
  thư mục của nó.
- Remotion không tải được Chrome headless ở máy này → `render.sh` trỏ thẳng
  vào Chrome hệ thống.
- `zsh` đánh chỉ số mảng **từ 1**, không phải 0.
- `urllib` của Python thiếu bộ chứng chỉ CA → tải file bằng `curl`.
