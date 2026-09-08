#!/usr/bin/env bash
# Remotion cần Chrome; máy này dùng Chrome hệ thống thay vì tải headless shell.
set -e
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
COMP="${1:-QuangBinh}"
OUT="${2:-out/${COMP}.mp4}"
npx remotion render "$COMP" "$OUT" --browser-executable="$CHROME" --crf=20 --timeout=180000 --concurrency=3 "${@:3}"
