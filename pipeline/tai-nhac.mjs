/**
 * Tải nhạc nền và sinh tiếng động cho một bản clone mới.
 *
 *   node pipeline/tai-nhac.mjs          tải nhạc còn thiếu vào public/audio/
 *   node pipeline/tai-nhac.mjs --sfx    sinh luôn public/sfx/ (cần python3 + numpy)
 *
 * Vì sao cần: public/audio (93 MB) và public/sfx nằm trong .gitignore nên `git clone`
 * không có chúng. Thiếu thì video vẫn render được (renderer bỏ qua tiếng thiếu) nhưng
 * mất nhạc nền. Nguồn là nhạc CC BY — BẮT BUỘC ghi công theo public/audio/CREDITS.md.
 */
import {execFileSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, writeFileSync, statSync} from 'node:fs';
import path from 'node:path';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'public/audio');
const SFX = process.argv.includes('--sfx');

/** Tên file trong thư viện → URL tải trực tiếp (Wikimedia Commons, Kevin MacLeod / CC BY). */
const NHAC = {
  '10-heliograph.mp3': 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Heliograph.ogg',
  '11-candlepower.mp3': 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Candlepower.ogg',
  '12-divider.mp3': 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Divider.ogg',
  '13-eternal-hope.mp3': 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Eternal_Hope.ogg',
  '14-heavy-heart.mp3': 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Heavy_Heart.ogg',
  '15-distant-sun.mp3': 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Distant_Sun.ogg',
  '16-restoration.mp3': 'https://upload.wikimedia.org/wikipedia/commons/2/28/Restoration.ogg',
  '17-where-stars-fall.mp3': 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Where_the_Stars_Fall.ogg',
  '20-daily-beetle.mp3': 'https://upload.wikimedia.org/wikipedia/commons/0/06/The_Daily_Beetle.ogg',
  '21-electro-cabello.mp3': 'https://upload.wikimedia.org/wikipedia/commons/9/97/Electro_Cabello.ogg',
  '22-flutey-funk.mp3': 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Fluttey_Funk.ogg',
  '23-got-funk.mp3': 'https://upload.wikimedia.org/wikipedia/commons/4/4c/I_Got_a_Stick_Arr_Bryan_Teoh.ogg',
  '24-grand-chase.mp3': 'https://upload.wikimedia.org/wikipedia/commons/f/f8/The_Grand_Chase.ogg',
  '25-silly-fun.mp3': 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Silly_Fun.ogg',
  '26-style-funk.mp3': 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Style_Funk.ogg',
  '27-the-builder.mp3': 'https://upload.wikimedia.org/wikipedia/commons/8/8b/The_Builder.ogg',
};

const ffmpeg = () => {
  const os = process.platform === 'darwin' ? 'darwin' : process.platform === 'win32' ? 'win32' : 'linux';
  const arch = process.arch === 'arm64' ? 'arm64' : 'x64';
  const dir = path.join(ROOT, `node_modules/@remotion/compositor-${os}-${arch}`);
  const bin = path.join(dir, process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
  if (existsSync(bin)) return {bin, env: {...process.env, DYLD_LIBRARY_PATH: dir, LD_LIBRARY_PATH: dir}};
  return {bin: 'ffmpeg', env: process.env};
};

mkdirSync(OUT, {recursive: true});
const {bin, env} = ffmpeg();
let tai = 0;
let bo = 0;
const hong = [];
for (const [ten, url] of Object.entries(NHAC)) {
  const dich = path.join(OUT, ten);
  if (existsSync(dich) && statSync(dich).size > 10000) {
    bo++;
    continue;
  }
  const tmp = path.join(OUT, `.tmp-${ten}.ogg`);
  try {
    execFileSync('curl', ['-sSL', '--fail', '-A', 'video-studio/1.0', '-o', tmp, url], {stdio: 'pipe'});
    // chuẩn hoá về -24 LUFS để nằm dưới giọng đọc (-16 LUFS), cùng mức với bộ nhạc gốc
    execFileSync(bin, ['-y', '-v', 'error', '-i', tmp, '-af', 'loudnorm=I=-24:TP=-2', '-c:a', 'libmp3lame', '-b:a', '128k', dich], {env, stdio: 'pipe'});
    execFileSync('rm', ['-f', tmp]);
    tai++;
    console.log(`  ✓ ${ten}`);
  } catch (e) {
    hong.push(ten);
    console.log(`  ✗ ${ten} — ${String(e.message).slice(0, 80)}`);
  }
}
console.log(`\nnhạc: ${tai} tải mới, ${bo} đã có, ${hong.length} lỗi`);
if (hong.length) console.log(`  thiếu: ${hong.join(', ')} — video vẫn render được, chỉ mất nhạc ở chương dùng chúng`);

if (SFX) {
  console.log('\nsinh tiếng động (public/sfx):');
  try {
    execFileSync('python3', [path.join(ROOT, 'pipeline/sfx.py')], {cwd: ROOT, stdio: 'inherit'});
  } catch (e) {
    console.log(`  ✗ cần python3 + numpy: ${String(e.message).slice(0, 80)}`);
  }
}

const credits = path.join(OUT, 'CREDITS.md');
if (!existsSync(credits)) {
  writeFileSync(credits, '# Nhạc nền — BẮT BUỘC ghi công (CC BY)\n\nKevin MacLeod (incompetech.com), tải từ Wikimedia Commons, chuẩn hoá -24 LUFS.\nGhi công trong phần mô tả video khi đăng.\n');
}
console.log('\nNhạc CC BY: ghi công theo public/audio/CREDITS.md khi đăng video.');
