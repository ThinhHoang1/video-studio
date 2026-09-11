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
# Trình duyệt render: REMOTION_BROWSER/CHROME > đường dẫn quen thuộc > which.
# Cắm cứng đường dẫn macOS khiến agent chạy trên Linux (chromium) không render được.
CHROME="${REMOTION_BROWSER:-${CHROME:-}}"
if [ -z "$CHROME" ] || [ ! -x "$CHROME" ]; then
  for c in "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
           "/Applications/Chromium.app/Contents/MacOS/Chromium" \
           /usr/bin/chromium /usr/bin/chromium-browser /usr/bin/google-chrome /usr/bin/google-chrome-stable /snap/bin/chromium; do
    [ -x "$c" ] && CHROME="$c" && break
  done
fi
[ -z "$CHROME" ] && CHROME="$(command -v chromium || command -v chromium-browser || command -v google-chrome || true)"
# rỗng = để Remotion tự tải bản headless của nó
BROWSER_ARG=()
[ -n "$CHROME" ] && BROWSER_ARG=(--browser-executable "$CHROME")
# ffmpeg đi kèm Remotion: chọn gói theo hệ điều hành + kiến trúc máy (macOS/Linux, arm64/x64)
case "$(uname -s)" in Darwin) OSN=darwin;; Linux) OSN=linux;; *) OSN=linux;; esac
case "$(uname -m)" in arm64|aarch64) ARCHN=arm64;; *) ARCHN=x64;; esac
# Gói compositor trên Linux còn mang hậu tố libc (linux-arm64-gnu, linux-x64-musl) —
# thiếu hậu tố là không thấy ffmpeg nào và bước ghép segment hỏng im lặng.
LIB=""
for HAU in "" "-gnu" "-musl" "-eabi"; do
  CAND="$PWD/node_modules/@remotion/compositor-$OSN-$ARCHN$HAU"
  [ -x "$CAND/ffmpeg" ] && { LIB="$CAND"; break; }
done
export DYLD_LIBRARY_PATH="$LIB" LD_LIBRARY_PATH="$LIB"
FFMPEG="$LIB/ffmpeg"
[ -x "$FFMPEG" ] || FFMPEG="$(command -v ffmpeg || true)"

# Tính số frame ngay từ manifest thay vì hỏi Remotion — gọi `remotion
# compositions` phải bung cả Chrome, mất hàng phút cho một con số.
# Composition V2-<ten>: tổng frame = thẻ tiêu đề 1.6 s + Σ(audio + đệm 0.4 s) — khớp src/v2/phim/du-lieu.ts
if [[ "$COMP" == V2-* ]]; then
  TEN_V2="${COMP#V2-}"
  TOTAL=$(node -e "
    const kb = require('./scripts/$TEN_V2.json');
    const d = require('./src/projects/' + kb.project + '/data/$TEN_V2.generated.json');
    const FPS = 30, f = s => Math.round(s * FPS);
    console.log(f(1.6) + d.chapters.reduce((a, c) => a + f(c.duration) + f(0.4), 0));
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
# ── CỔNG RIÊNG, KHÔNG BAO GIỜ ĐỤNG 3000 ─────────────────────────────────────
# `remotion render` mở một HTTP server để phục vụ bundle. Mặc định nó bò dần từ
# 3000 lên — mà 3000 là cổng Platform-BE của workspace này.
# ĐÃ XẢY RA THẬT (2026-09-11): một tiến trình render treo giữ cổng 3000 suốt
# 15h52m; stack-up.sh chỉ kiểm "cổng 3000 có ai nghe không", thấy có nên in
# "[skip] be :3000 đã up" và KHÔNG khởi động BE. FE gọi API không ai trả, rơi về
# màn onboarding, người dùng tưởng mất sạch instance và use-case (DB vẫn nguyên).
# Ghim cổng vào dải 39xxx để render không bao giờ đứng chắn cửa của ai.
REMOTION_PORT="${REMOTION_PORT:-39170}"

# Khoá: hai tiến trình render cùng composition từng chạy chồng và cùng ghi list.txt → ghép đôi đoạn (video dài gấp đôi).
LOCK="$SEGDIR/.lock"
if ! mkdir "$LOCK" 2>/dev/null; then
  # Khoá cũ của một tiến trình ĐÃ CHẾT thì không có lý do gì chặn lần chạy mới:
  # trước đây phải xoá tay, và trong lúc đó tiến trình treo vẫn ôm cổng.
  if pgrep -f "remotion render $COMP" >/dev/null 2>&1; then
    echo "✗ $COMP đang được render bởi tiến trình khác (khoá $LOCK). Chờ nó xong." >&2
    exit 3
  fi
  echo "⚠ khoá cũ $LOCK không có tiến trình nào giữ — dọn và chạy tiếp." >&2
  rmdir "$LOCK" 2>/dev/null || true
  mkdir "$LOCK" 2>/dev/null || { echo "✗ không tạo được khoá $LOCK" >&2; exit 3; }
fi
# Dọn tiến trình render CỦA CHÍNH COMPOSITION NÀY còn sót từ lần trước (đã mất
# shell cha nên không ai tắt hộ). Không đụng composition khác đang chạy.
pkill -f "remotion render $COMP" 2>/dev/null || true
trap 'rmdir "$LOCK" 2>/dev/null; pkill -f "remotion render $COMP" 2>/dev/null || true' EXIT

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
      "${BROWSER_ARG[@]}" \
      --port="$REMOTION_PORT" \
      --frames="$start-$end" \
      --crf=20 --timeout=120000 --concurrency=2 --log=error
  fi

  echo "file '$PWD/$seg'" >> "$list"
  i=$((i + 1))
  start=$((end + 1))
done

"$FFMPEG" -y -f concat -safe 0 -i "$list" -c copy "$OUT"
echo "-> $OUT"
