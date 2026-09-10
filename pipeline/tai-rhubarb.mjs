/**
 * Tải Rhubarb Lip Sync cho máy này → tools/rhubarb/
 *
 *   node pipeline/tai-rhubarb.mjs
 *
 * Vì sao cần: tools/ nằm trong .gitignore (binary 30 MB) nên clone mới không có, và
 * thiếu Rhubarb thì renderer rơi về miệng-theo-biên-độ — xấu hơn hẳn lip-sync thật.
 *
 * Dự án chỉ phát hành 3 bản: macOS (universal), Linux x86_64, Windows. KHÔNG có bản
 * Linux arm64 — trên máy đó script báo rõ và thoát 0 (không chặn pipeline), renderer
 * dùng miệng theo biên độ.
 */
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync} from 'node:fs';
import path from 'node:path';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const DICH = path.join(ROOT, 'tools/rhubarb');
const VER = process.env.RHUBARB_VERSION || '1.14.0';

if (existsSync(path.join(DICH, 'rhubarb'))) {
  console.log(`✓ đã có ${path.join(DICH, 'rhubarb')}`);
  process.exit(0);
}

const os = process.platform;
const arch = process.arch;
let goi = null;
if (os === 'darwin') goi = `Rhubarb-Lip-Sync-${VER}-macOS.zip`;
else if (os === 'linux' && arch === 'x64') goi = `Rhubarb-Lip-Sync-${VER}-Linux.zip`;
else if (os === 'win32') goi = `Rhubarb-Lip-Sync-${VER}-Windows.zip`;

if (!goi) {
  console.log(`⚠ Rhubarb không có bản cho ${os}/${arch} (dự án chỉ phát hành macOS, Linux x86_64, Windows).`);
  console.log('  Pipeline vẫn chạy: renderer dùng miệng theo biên độ thay cho lip-sync thật (xấu hơn).');
  console.log('  Muốn lip-sync thật trên máy này: dựng Rhubarb từ nguồn, đặt binary ở tools/rhubarb/rhubarb.');
  process.exit(0);
}

const url = `https://github.com/DanielSWolf/rhubarb-lip-sync/releases/download/v${VER}/${goi}`;
const tmpZip = path.join(ROOT, `.tmp-rhubarb.zip`);
const tmpDir = path.join(ROOT, `.tmp-rhubarb`);

try {
  console.log(`tải ${goi}…`);
  execFileSync('curl', ['-sSL', '--fail', '-m', '300', '-o', tmpZip, url], {stdio: 'pipe'});
  if (!existsSync(tmpZip) || statSync(tmpZip).size < 100000) throw new Error('file tải về rỗng');
  rmSync(tmpDir, {recursive: true, force: true});
  mkdirSync(tmpDir, {recursive: true});
  execFileSync('unzip', ['-q', tmpZip, '-d', tmpDir], {stdio: 'pipe'});
  // zip bung ra một thư mục Rhubarb-Lip-Sync-<ver>-<os>/
  const trong = readdirSync(tmpDir);
  const goc = trong.length === 1 ? path.join(tmpDir, trong[0]) : tmpDir;
  mkdirSync(path.dirname(DICH), {recursive: true});
  rmSync(DICH, {recursive: true, force: true});
  renameSync(goc, DICH);
  execFileSync('chmod', ['+x', path.join(DICH, 'rhubarb')], {stdio: 'pipe'});
  console.log(`✓ ${path.join(DICH, 'rhubarb')}`);
} catch (e) {
  console.log(`✗ tải Rhubarb lỗi: ${String(e.message).slice(0, 120)}`);
  console.log('  Không chặn pipeline — renderer dùng miệng theo biên độ.');
} finally {
  rmSync(tmpZip, {force: true});
  rmSync(tmpDir, {recursive: true, force: true});
}
