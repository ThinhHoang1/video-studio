---
name: tao-video
description: Tạo video kể chuyện hoạt hình từ một chủ đề — viết kịch bản, sinh giọng đọc tiếng Việt, dựng bảng phân cảnh, render ra MP4. Dùng khi người dùng nói "làm video về X", "tạo video kể chuyện", "dựng video hoạt hình", "làm clip giải thích".
---

# Tạo video từ một chủ đề

Bạn **đạo diễn**, không **vẽ**. Thư viện đã có sẵn 26 bối cảnh, 11 tư thế,
29 tiếng động, 16 bản nhạc. Việc của bạn là viết kịch bản và **chọn** cảnh nào
cho câu nào. Đừng viết SVG mới — code vẽ là việc của người, không phải một
lượt làm việc của agent.

## Quy trình

```
1. Viết kịch bản        scripts/<ten>.json
2. Sinh giọng đọc       node pipeline/tts-gemini.mjs <ten>
3. Bóc nhịp giọng       node pipeline/analyze-voice.mjs <ten>
4. Viết bảng phân cảnh  src/projects/<du-an>/board.ts
5. KIỂM TRA             node pipeline/kiem-tra.mjs <ten>     ← không bỏ qua
6. Xem thử một khung    npx remotion still ...
7. Render               ./render-segments.sh <Comp> media/outbound/<ten>.mp4
8. Viết metadata        media/outbound/<ten>.md
```

**Video thành phẩm PHẢI nằm ở `media/outbound/`.** `out/` chỉ là nháp.

## Trước khi bắt đầu

Đọc `thu-vien.json` — đó là danh mục tên hợp lệ. Viết tên lạ thì bước 5 chặn.

Hỏi người dùng ba điều nếu chưa rõ:
- **chủ đề** cụ thể (không phải "làm video về tiền" mà "vì sao lương tăng vẫn nghèo")
- **chất giọng**: hài tự trào hay kể chuyện trầm
- **độ dài**: 6 phút (≈14 chương) hay 12 phút (≈15 chương dài hơn)

## Bước 1 — Kịch bản

Đọc `references/kich-ban.md` trước khi viết. Đó là chỗ quyết định video hay
hay dở; mọi khâu sau chỉ là thực thi.

```json
{
  "title": "…",
  "voice": "Puck",
  "style": "Hướng dẫn cảm xúc cho TTS. Càng cụ thể càng bớt ngang.",
  "chapters": [
    {"id": "ma-khong-dau", "canh": "phong-tro", "kicker": "Level 1",
     "heading": "Tiêu đề chương", "vo": "Lời bình…"}
  ]
}
```

Mỗi chương **60–140 từ**. Dài hơn thì tách; ngắn hơn thì người xem chưa kịp
vào chương đã hết.

## Bước 2–3 — Giọng đọc

```bash
node pipeline/tts-gemini.mjs <ten>      # ~1 phút/chương do hạn mức free tier
node pipeline/analyze-voice.mjs <ten>   # bóc nhịp để nhân vật cử động theo giọng
```

Cần `GEMINI_API_KEYS` trong `.env` (nhiều key phân tách bằng dấu phẩy — mỗi
cặp key×model là một hạn mức riêng, hết cặp này pipeline tự nhảy sang cặp khác).

Chạy lại an toàn: chương nào đã đọc và lời bình chưa đổi thì bỏ qua. Sửa lời
bình là file cũ tự bị coi là hỏng và đọc lại.

## Bước 4 — Bảng phân cảnh

Đọc `references/phan-canh.md`. Đây là chỗ hình khớp với lời.

```ts
'ma-chuong': [
  {say: 'mẩu lời bình có thật', canh: 'phong-tro', co: 'trung', sac: 'nghi', dang: 'goMay'},
  {say: 'mẩu tiếp theo',        canh: 'hop-thu',   co: 'rong',  nguoi: false},
],
```

`say` là mỏ neo: pipeline dò mẩu đó trong lời bình để suy ra frame. Cảnh giữ
nguyên cho tới mốc kế tiếp, nên **chỉ khai báo chỗ ĐỔI**.

**5–8 mốc mỗi chương.** Ít hơn thì cảnh đứng yên, người xem chán.

## Bước 5 — Kiểm tra (bắt buộc)

```bash
node pipeline/kiem-tra.mjs <ten>
```

Render mất 10–15 phút. Mọi lỗi bắt được bằng máy phải bắt ở đây. Bộ kiểm tra
soi 7 thứ: kịch bản đủ trường, đã sinh giọng, lời bình khớp manifest, mọi mốc
`say` có thật, mọi tên nằm trong thư viện, đủ mốc mỗi chương, không mốc trùng.

## Bước 6 — Xem thử trước khi render cả video

```bash
npx remotion still <Comp> /tmp/thu.png --frame=900 \
  --browser-executable="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

Xem 2–3 khung ở các chương khác nhau. Rẻ hơn render 6 phút rồi mới phát hiện
hỏng rất nhiều.

## Bước 7 — Render

```bash
SEG_LEN=900 ./render-segments.sh <Comp> media/outbound/<ten>.mp4
```

Chia đoạn 900 frame, mỗi đoạn một tiến trình Chrome mới. Hỏng giữa chừng thì
chạy lại, đoạn nào xong rồi tự bỏ qua. Cache khoá theo vân tay `src/` +
`scripts/` nên sửa code là cache tự vô hiệu.

Chạy nền và báo lại khi xong — đừng ngồi chờ.

## Bước 8 — Metadata

Kèm `media/outbound/<ten>.md`:

```markdown
# <Tiêu đề>
**Thời lượng:** 6p25 · **Độ phân giải:** 1920×1080 · 30fps

## Mô tả để đăng
…

## Ghi công (BẮT BUỘC)
Music: "<tên bài>" by Kevin MacLeod / Scott Buckley / Chris Zabriskie
Licensed under Creative Commons: By Attribution.
```

Nhạc trong repo là CC BY — không ghi công là vi phạm giấy phép. Câu ghi công
đầy đủ ở `public/audio/CREDITS.md`.

## Không làm

- **Đừng viết cảnh SVG mới** trong một lượt. Nếu chủ đề cần cảnh chưa có, báo
  người dùng và dùng cảnh gần nhất, hoặc đề xuất cảnh cần vẽ thêm.
- **Đừng bỏ bước kiểm tra.**
- **Đừng lấy file từ `out/`** — đó là nháp.
- **Đừng tự force-push hay viết lại lịch sử git.**

## Giới hạn thật

Bốn thứ pipeline không làm được, nói thẳng với người dùng khi gặp:

| | |
|---|---|
| Vẽ cảnh mới | phải viết SVG tay, không tự sinh |
| Tự đánh giá đẹp/xấu | phải có người xem duyệt |
| Render nhanh | 6 phút video ≈ 12 phút render |
| Hạn mức TTS | free tier 10 request/ngày mỗi cặp key×model |
