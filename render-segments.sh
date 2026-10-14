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
  # Bản dọc là CÙNG kịch bản, chỉ khác cái khung — bỏ hậu tố để tìm đúng file.
  TEN_V2="${TEN_V2%-doc}"
  TOTAL=$(node -e "
    const kb = require('./scripts/$TEN_V2.json');
    const d = require('./src/projects/' + kb.project + '/data/$TEN_V2.generated.json');
    const FPS = 30, f = s => Math.round(s * FPS);
    // Bảng tin KHÔNG có thẻ tiêu đề 1.6 s — xem INTRO trong src/v2/phim/phim-v2.tsx.
    // Cộng thêm ở đây thì render đòi frame 888–899 mà composition chỉ có 888, và
    // Remotion chết ngay ở bước lấy composition.
    const intro = kb.dinh_dang === 'ban-tin' ? 0 : 1.6;
    console.log(f(intro) + d.chapters.reduce((a, c) => a + f(c.duration) + f(0.4), 0));
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

# Số luồng Chrome chạy song song. Mặc định 2; phim dài thì hạ xuống 1 —
# đo thật: render 19.000 khung ở mức 2 bị hệ thống giết giữa chừng vì hết bộ nhớ
# (còn 64 MB trống ở đoạn thứ mười bảy). Một luồng chậm hơn nhưng chạy tới cùng.
CONC="${RENDER_CONCURRENCY:-2}"

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
      --crf=20 --timeout=120000 --concurrency="$CONC" --log=error
  fi

  echo "file '$PWD/$seg'" >> "$list"
  i=$((i + 1))
  start=$((end + 1))
done

# Thư mục đích có thể chưa tồn tại: git không giữ thư mục rỗng nên bản cài mới
# không có media/outbound/, và ffmpeg báo lỗi ở ĐÚNG bước cuối — sau khi đã render
# xong mọi đoạn, tức là mất cả lượt render.
mkdir -p "$(dirname "$OUT")"

# ── GHÉP ĐOẠN ───────────────────────────────────────────────────────────────
# `-c copy` chép nguyên luồng nên NHANH, nhưng timestamp của từng đoạn không
# nối liền nhau: đo bản tin 105 giây thì ra 3152 frame thay vì 3159, và nhịp
# hình thành 29.95 fps thay vì 30. Trình phát thấy nhịp lệch thì tự chỉnh —
# nhìn ra đúng như "giật giật liên tục và bị ngắt".
#
# Nên ghép xong phải SINH LẠI TIMESTAMP và ép thang thời gian về bội của 30.
# Vẫn là chép luồng (không mã hoá lại, không mất chất, vẫn nhanh), chỉ sửa phần
# thời gian. Ghép xong đếm frame: thiếu thì nói ra chứ không im lặng giao hàng.
tam="${OUT%.mp4}.ghep.mp4"

# `-c copy` KHÔNG sửa được nhịp: đo bản tin 86 giây thì thấy đúng 3 chỗ lệch —
# 23.37 s, 46.75 s, 70.13 s — mỗi chỗ một khung kéo dài 0.081 s thay vì 0.033 s.
# Đó chính là ba ranh giới đoạn (mỗi đoạn 700 khung). Mắt đọc ra là "giật" đều
# đặn ba lần. Chép luồng thì khung vẫn nguyên si, chỉ dấu thời gian lệch, mà
# dấu thời gian lại là thứ quyết định nhịp phát.
#
# Nên khi ghép phải MÃ HOÁ LẠI hình với nhịp cố định 30 hình/giây. Tốn thêm
# khoảng nửa phút cho video hai phút; đổi lại nhịp đều tuyệt đối. Tiếng vẫn chép
# nguyên, không đụng vào.
# ─ VÌ SAO GHÉP HÌNH VÀ TIẾNG RIÊNG ─
#
# Mỗi đoạn Remotion xuất ra có TIẾNG DÀI HƠN HÌNH: hình 700 khung = 23.3333 s,
# nhưng luồng AAC là 23.3813 s (đo thật). Độ dài của FILE lấy theo luồng dài
# nhất, mà bộ ghép lại dùng độ dài file làm mốc đặt đoạn kế tiếp — nên mỗi ranh
# giới hình bị đẩy lùi ~0.05 s. Đó là cái "giật đều đặn" ở đúng bội số 23 giây.
#
# Hai cách chữa trước đây đều chỉ chữa được một nửa:
#   · `-c copy`            → giữ đủ khung, nhưng để nguyên khoảng hở (giật).
#   · `-fps_mode cfr -r 30`→ hết hở, nhưng NHÂN BẢN khung để lấp: đo trên phim
#                            10 phút, 28 đoạn, vào 19.254 khung ra 19.293.
#                            Khung trùng không hiện trên phép đo dấu thời gian,
#                            nên bản đo báo "đều tuyệt đối" mà mắt vẫn thấy khựng.
#
# Cách đúng là bỏ hẳn nguyên nhân: TÁCH TIẾNG RA KHỎI ĐOẠN trước khi nối. Đoạn
# chỉ còn hình thì độ dài file đúng bằng 23.3333 s, nối bằng chép luồng ra đủ
# 19.254 khung và không một khoảng hở nào — lại không phải mã hoá lại lần nào.
# Tiếng thì dựng MỘT LẦN cho cả phim bằng `remotion render --codec=aac`: không
# cắt đoạn thì không có chỗ nào để lệch (mất ~1.5 phút cho phim 10 phút).
tam="${OUT%.mp4}.ghep.mp4"
listv="$SEGDIR/list-hinh.txt"
: > "$listv"
while IFS= read -r dong; do
  seg="${dong#file \'}"; seg="${seg%\'}"
  chi="${seg%.mp4}.hinh.mp4"
  [ -s "$chi" ] || "$FFMPEG" -y -v error -i "$seg" -an -c:v copy "$chi"
  echo "file '$chi'" >> "$listv"
done < "$list"

tieng="$SEGDIR/tieng.aac"
if [ ! -s "$tieng" ]; then
  echo "dựng tiếng một lần cho cả phim…"
  npx remotion render "$COMP" "$tieng" --codec=aac --port="$REMOTION_PORT" --log=error
fi

"$FFMPEG" -y -v error -f concat -safe 0 -i "$listv" -fps_mode passthrough -c:v copy "$SEGDIR/hinh.mp4"
"$FFMPEG" -y -v error -i "$SEGDIR/hinh.mp4" -i "$tieng" \
  -map 0:v -map 1:a -c copy -shortest -movflags +faststart "$tam"
mv -f "$tam" "$OUT"

FFPROBE="$LIB/ffprobe"
if [[ -x "$FFPROBE" ]]; then
  co=$("$FFPROBE" -v error -count_frames -select_streams v -show_entries stream=nb_read_frames         -of default=nw=1:nk=1 "$OUT" 2>/dev/null || echo 0)
  can=$((TOTAL))
  # Đếm HAI CHIỀU. Bản trước chỉ báo khi THIẾU khung, nên 39 khung THỪA do ghép
  # nhân bản đi lọt hoàn toàn — và thừa cũng là hỏng: phim dài hơn tiếng, cổng
  # chấm điểm đánh trượt vì lệch thời lượng.
  if [[ "$co" -gt 0 && "$can" -gt 0 && "$co" -ne "$can" ]]; then
    echo "⚠ ghép xong ra $co/$can frame (lệch $((co - can))). Xem lại ranh giới đoạn." >&2
  fi
fi
echo "-> $OUT"
