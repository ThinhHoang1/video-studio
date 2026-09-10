/**
 * Dò môi trường: trình duyệt để render và ffmpeg — chạy được trên máy khác (Linux, CI, agent).
 *
 * Trước đây mọi script cắm cứng đường dẫn Chrome của macOS nên agent chạy trên Linux
 * (có /usr/bin/chromium) không render được. Đây là chỗ duy nhất biết đường dẫn đó.
 *
 * Thứ tự tìm trình duyệt:
 *   1. biến môi trường REMOTION_BROWSER (hoặc CHROME)
 *   2. các đường dẫn quen thuộc theo hệ điều hành
 *   3. `which` các tên lệnh phổ biến
 *   4. không thấy → trả null, Remotion tự tải bản headless của nó
 */
import {execFileSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import path from 'node:path';

const UNG_VIEN = [
  // macOS
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  // Linux
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/snap/bin/chromium',
  // Windows (khi chạy qua WSL/git-bash)
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
];
const LENH = ['chromium', 'chromium-browser', 'google-chrome', 'google-chrome-stable', 'chrome'];

/** đường dẫn trình duyệt, hoặc null nếu để Remotion tự lo */
export const timTrinhDuyet = () => {
  const env = process.env.REMOTION_BROWSER || process.env.CHROME;
  if (env && existsSync(env)) return env;
  for (const p of UNG_VIEN) if (existsSync(p)) return p;
  for (const c of LENH) {
    try {
      const p = execFileSync('which', [c], {encoding: 'utf8'}).trim();
      if (p && existsSync(p)) return p;
    } catch {
      /* không có lệnh đó */
    }
  }
  return null;
};

/** cờ --browser-executable cho remotion, rỗng khi không tìm thấy (Remotion tự tải) */
export const coTrinhDuyet = () => {
  const p = timTrinhDuyet();
  return p ? ['--browser-executable', p] : [];
};

/**
 * ffmpeg: ưu tiên bản Remotion tải kèm theo kiến trúc máy, sau đó ffmpeg hệ thống.
 *
 * Tên gói compositor KHÔNG chỉ là `<os>-<arch>`: trên Linux nó còn mang hậu tố libc
 * (`linux-arm64-gnu`, `linux-x64-musl`). Bản trước chỉ ghép `<os>-<arch>` nên trên
 * container Linux không thấy ffmpeg nào, rơi xuống `ffmpeg` hệ thống — mà image không
 * cài — và mọi bước cần ffmpeg (tải nhạc, chấm điểm, ghép segment) hỏng im lặng.
 */
export const timFfmpeg = (root) => {
  const os = process.platform === 'darwin' ? 'darwin' : process.platform === 'win32' ? 'win32' : 'linux';
  const arch = process.arch === 'arm64' ? 'arm64' : 'x64';
  const ten = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
  for (const hau of ['', '-gnu', '-musl', '-eabi']) {
    const dir = path.join(root, `node_modules/@remotion/compositor-${os}-${arch}${hau}`);
    const bin = path.join(dir, ten);
    if (existsSync(bin)) return {bin, env: {...process.env, DYLD_LIBRARY_PATH: dir, LD_LIBRARY_PATH: dir}};
  }
  try {
    const p = execFileSync('which', ['ffmpeg'], {encoding: 'utf8'}).trim();
    if (p && existsSync(p)) return {bin: p, env: process.env};
  } catch {
    /* không có ffmpeg hệ thống */
  }
  return null;
};

/**
 * Thư mục compositor của Remotion cho máy này (chứa ffmpeg + ffprobe + thư viện .so/.dylib).
 * Trả null khi không có gói nào khớp.
 */
export const timLibDir = (root) => {
  const os = process.platform === 'darwin' ? 'darwin' : process.platform === 'win32' ? 'win32' : 'linux';
  const arch = process.arch === 'arm64' ? 'arm64' : 'x64';
  const ten = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
  for (const hau of ['', '-gnu', '-musl', '-eabi']) {
    const dir = path.join(root, `node_modules/@remotion/compositor-${os}-${arch}${hau}`);
    if (existsSync(path.join(dir, ten))) return dir;
  }
  return null;
};

/** ffprobe: cùng luật với timFfmpeg. Trả null khi không có. */
export const timFfprobe = (root) => {
  const dir = timLibDir(root);
  const ten = process.platform === 'win32' ? 'ffprobe.exe' : 'ffprobe';
  if (dir && existsSync(path.join(dir, ten))) return {bin: path.join(dir, ten), env: {...process.env, DYLD_LIBRARY_PATH: dir, LD_LIBRARY_PATH: dir}};
  try {
    const p = execFileSync('which', ['ffprobe'], {encoding: 'utf8'}).trim();
    if (p && existsSync(p)) return {bin: p, env: process.env};
  } catch {
    /* không có ffprobe hệ thống */
  }
  return null;
};

/** như timFfmpeg nhưng ném lỗi thay vì trả null — dùng ở chỗ bắt buộc phải có ffmpeg */
export const canFfmpeg = (root) => {
  const f = timFfmpeg(root);
  if (!f) throw new Error('Không tìm thấy ffmpeg: cài @remotion/compositor cho máy này (npm install) hoặc cài ffmpeg hệ thống');
  return f;
};
