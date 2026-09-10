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
# Composition V2-<ten>: tổng frame = intro 2 s + Σ(audio + đệm 0.4 s) — khớp src/v2/phim/du-lieu.ts
if [[ "$COMP" == V2-* ]]; then
  TEN_V2="${COMP#V2-}"
  TOTAL=$(node -e "
    const kb = require('./scripts/$TEN_V2.json');
    const d = require('./src/projects/' + kb.project + '/data/$TEN_V2.generated.json');
    const FPS = 30, f = s => Math.round(s * FPS);
    console.log(f(2.0) + d.chapters.reduce((a, c) => a + f(c.duration) + f(0.4), 0));
  ")
else
TOTAL=$(node -e "
  const map = {
    LamPhatV2:    ['./src/attic/lam-phat.generated.json', 3.6, 0.2],
    LamPhatAnime: ['./src/attic/lam-phat.generated.json', 3.6, 0.2],
    RaTruongBuon: ['./src/projects/ra-truong/data/ra-truong.generated.json', 5.5, 0.9],
    TinhDau:      ['./src/projects/tinh-dau/data/tinh-dau.generated.json', 5.0, 0.7],
    RaTruongVui:  ['./src/projects/ra-truong/data/ra-truong-vui.generated.json', 4.0, 0.25],
    // V2: intro 2 s (tiêu đề) + mỗi chương đệm 0.4 s — khớp DEM_CHUONG trong src/v2/phim/du-lieu.ts
    DemoV2:       ['./src/projects/demo-v2/data/demo-v2.generated.json', 2.0, 0.4],
  };
  const [file, intro, pad] = map['$COMP'] ?? map.LamPhatV2;
  const d = require(file);
  const FPS = 30, f = s => Math.round(s * FPS);
  console.log(f(intro) + d.chapters.reduce((a, c) => a + f(c.duration) + f(pad), 0));
")
fi

# Khoá cache theo tên composition + vân tay của src/ và scripts/.
# Trước đây chỉ khoá theo tên: đổi code rồi render lại thì script tưởng đã
# xong và ghi ra file cũ, không có thay đổi nào — mất một lượt mới phát hiện.
FINGERPRINT=$(find src scripts -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.json' \) \
  -not -path 'src/attic/*' -exec shasum {} + | shasum | cut -c1-10)
SEGDIR="out/.seg-$COMP-$FINGERPRINT"
mkdir -p "$SEGDIR"

# dọn cache của các lần build cũ cùng composition
for cu in out/.seg-"$COMP"-*; do
  [ "$cu" = "$SEGDIR" ] || rm -rf "$cu" 2>/dev/null
done

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
