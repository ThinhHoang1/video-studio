# Dựng một dự án mới

Chép cấu trúc của `ra-truong` rồi thay nội dung. Đừng dựng từ số không.

## Cây thư mục cần tạo

```
scripts/<ten>.json                        kịch bản
src/projects/<du-an>/
  board.ts                                bảng phân cảnh
  cues.ts                                 meme / sfx / nhạc
  vui.tsx                                 composition
  data/<ten>.generated.json               sinh ra bởi tts-gemini
  data/<ten>.voice.json                   sinh ra bởi analyze-voice
```

`<ten>` là tên kịch bản, `<du-an>` là thư mục dự án. Ví dụ kịch bản
`ra-truong-vui.json` nằm trong dự án `ra-truong`.

## Chép khung

```bash
mkdir -p src/projects/<du-an>/data
cp src/projects/ra-truong/vui.tsx  src/projects/<du-an>/vui.tsx
cp src/projects/ra-truong/cues.ts  src/projects/<du-an>/cues.ts
```

Trong `vui.tsx` sửa đúng ba chỗ:

```ts
import data   from './data/<ten>.generated.json';
import voices from './data/<ten>.voice.json';
export const <TEN>_DURATION = …   // đổi tên hằng số cho khỏi trùng
```

## Đăng ký composition

`src/Root.tsx`:

```tsx
import {VideoMoi, MOI_DURATION} from './projects/<du-an>/vui';

<Composition
  id="VideoMoi"
  component={VideoMoi}
  durationInFrames={MOI_DURATION}
  fps={FPS}
  width={1920}
  height={1080}
/>
```

## Khai báo cho script render

`render-segments.sh` cần biết manifest ở đâu để tính số frame. Thêm một dòng
vào bảng `map`:

```js
VideoMoi: ['./src/projects/<du-an>/data/<ten>.generated.json', 4.0, 0.25],
//          ^ manifest                                          ^ intro giây  ^ đệm giữa chương
```

Thiếu dòng này thì script tính nhầm tổng số frame và cắt cụt video.

## Bản dọc cho TikTok / Reels

Đăng ký thêm một composition cùng component, chỉ đổi kích thước:

```tsx
<Composition id="VideoMoi-Doc" component={VideoMoi}
  durationInFrames={MOI_DURATION} fps={FPS} width={1080} height={1920} />
```

Dùng lại nguyên giọng đọc, meme, tiếng động. Nhưng **phải xem thử vài khung**:
bố cục hiện tại dựng cho khung ngang, ở khung dọc nhân vật có thể lệch và phụ
đề tràn. Chỉnh `CO` trong `vui.tsx` nếu cần.

## Kiểm lại

```bash
npx tsc --noEmit                        # không lỗi kiểu
node pipeline/kiem-tra.mjs <ten>        # qua hết
```

Rồi mới render.
