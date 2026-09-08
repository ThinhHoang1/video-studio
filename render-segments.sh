#!/usr/bin/env bash
# Render theo từng đoạn rồi ghép lại.
#
# Vì sao: render một mạch 5787 frame bị chết giữa chừng hai lần ở hai frame
# khác nhau (4043, rồi 607). Render riêng đúng những frame đó thì mất 2 giây
# và không lỗi -> nguyên nhân là Chrome nghẽn khi chạy song song dài, không
# phải do cảnh nào nặng. Cắt thành đoạn ngắn, mỗi đoạn một tiến trình Chrome
# mới, và đoạn nào xong rồi thì bỏ qua khi chạy lại.
set -e
cd "$(dirname "$0")"

COMP="${1:-LamPhatV2}"
OUT="${2:-out/${COMP}.mp4}"
SEG_LEN="${SEG_LEN:-700}"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
LIB="$PWD/node_modules/@remotion/compositor-darwin-arm64"
export DYLD_LIBRARY_PATH="$LIB"

# Tính số frame ngay từ manifest thay vì hỏi Remotion — gọi `remotion
# compositions` phải bung cả Chrome, mất hàng phút cho một con số.
TOTAL=$(node -e "
  const map = {
    LamPhatV2:    ['./src/lam-phat.generated.json', 3.6, 0.2],
    LamPhatAnime: ['./src/lam-phat.generated.json', 3.6, 0.2],
    RaTruong:     ['./src/ra-truong.generated.json', 5.5, 0.9],
    RaTruongVui:  ['./src/ra-truong-vui.generated.json', 4.0, 0.25],
  };
  const [file, intro, pad] = map['$COMP'] ?? map.LamPhatV2;
  const d = require(file);
  const FPS = 30, f = s => Math.round(s * FPS);
  console.log(f(intro) + d.chapters.reduce((a, c) => a + f(c.duration) + f(pad), 0));
")

SEGDIR="out/.seg-$COMP"
mkdir -p "$SEGDIR"

i=0
start=0
list="$SEGDIR/list.txt"
: > "$list"

while [ "$start" -lt "$TOTAL" ]; do
  end=$((start + SEG_LEN - 1))
  [ "$end" -ge "$TOTAL" ] && end=$((TOTAL - 1))
  seg=$(printf "%s/%03d.mp4" "$SEGDIR" "$i")

  if [ -s "$seg" ]; then
    echo "đoạn $i ($start-$end) đã có, bỏ qua"
  else
    echo "đoạn $i ($start-$end)…"
    npx remotion render "$COMP" "$seg" \
      --browser-executable="$CHROME" \
      --frames="$start-$end" \
      --crf=20 --timeout=120000 --concurrency=2 --log=error
  fi

  echo "file '$PWD/$seg'" >> "$list"
  i=$((i + 1))
  start=$((end + 1))
done

"$LIB/ffmpeg" -y -f concat -safe 0 -i "$list" -c copy "$OUT"
echo "-> $OUT"
