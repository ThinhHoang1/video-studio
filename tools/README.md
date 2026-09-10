# tools/ — công cụ nhị phân ngoài npm

Thư mục này KHÔNG được đẩy lên git (xem `.gitignore`). Máy mới phải tải lại
theo hướng dẫn dưới đây.

## rhubarb/ — Rhubarb Lip Sync 1.14.0 (lip-sync tự động)

`pipeline/lipsync.mjs` gọi `tools/rhubarb/rhubarb` để biến mp3 giọng đọc thành
chuỗi hình miệng (X A B C D E F G H) theo frame. Cần đủ hai thứ:

| Thứ | Cỡ | Ghi chú |
|---|---|---|
| `rhubarb` | 8 MB | binary Mach-O **x86_64** — không có bản arm64 |
| `res/sphinx/` | 82 MB | mô hình PocketSphinx; thiếu là lỗi `could not find resource file .../res/sphinx/cmudict-en-us.dict` |

Bỏ qua `extras/` (plugin After Effects, Spine, Vegas) và `tests/`.

### Tải lại

```bash
# 1. tải release v1.14.0 cho macOS (~87 MB). Dùng curl, không dùng urllib của Python (thiếu CA).
curl -L -o /tmp/rhubarb-macos.zip \
  https://github.com/DanielSWolf/rhubarb-lip-sync/releases/download/v1.14.0/Rhubarb-Lip-Sync-1.14.0-macOS.zip

# 2. giải nén, chỉ giữ binary + res/ (+ giấy phép)
cd /tmp && unzip -q rhubarb-macos.zip
mkdir -p <repo>/tools/rhubarb
cp -R Rhubarb-Lip-Sync-1.14.0-macOS/{rhubarb,res,LICENSE.md,README.adoc,CHANGELOG.md} <repo>/tools/rhubarb/

# 3. gỡ cờ quarantine của Gatekeeper, nếu không macOS sẽ chặn chạy
xattr -rd com.apple.quarantine <repo>/tools/rhubarb

# 4. kiểm
<repo>/tools/rhubarb/rhubarb --version   # -> Rhubarb Lip Sync version 1.14.0
```

### Máy Apple Silicon cần Rosetta 2

Binary là x86_64 nên chạy qua Rosetta 2. Kiểm: `arch -x86_64 true` (exit 0 là
có). Chưa có thì cài:

```bash
softwareupdate --install-rosetta --agree-to-license
```

Đa luồng không lợi trên Rosetta (`--threads 1` nhanh ngang), tốc độ đo được
~11x thời gian thực (33 s tiếng -> ~3 s).

### Đặt đường dẫn khác

`pipeline/lipsync.mjs` mặc định dùng `tools/rhubarb/rhubarb`; muốn dùng bản
cài chỗ khác thì đặt biến môi trường `RHUBARB=/duong/dan/rhubarb`.

### Giới hạn đã biết

- Rhubarb chỉ đọc WAV/OGG, không đọc mp3 — pipeline tự chuyển sang WAV 16 kHz
  mono bằng ffmpeg của Remotion rồi xoá.
- Recognizer `phonetic` (không cần tiếng Anh) đủ cho lip-sync tiếng Việt kiểu
  Hanna-Barbera; xem `docs/nghien-cuu-storytime.md` mục 5.2.
