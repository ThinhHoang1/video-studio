#!/usr/bin/env bash
# Remotion cần Chrome; máy này dùng Chrome hệ thống thay vì tải headless shell.
set -e
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
COMP="${1:-QuangBinh}"
OUT="${2:-out/${COMP}.mp4}"
npx remotion render "$COMP" "$OUT" "${BROWSER_ARG[@]}" --crf=20 --timeout=180000 --concurrency=3 "${@:3}"
