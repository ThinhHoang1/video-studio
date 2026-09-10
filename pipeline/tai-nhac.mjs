/**
 * Tải nhạc nền và sinh tiếng động cho một bản clone mới.
 *
 *   node pipeline/tai-nhac.mjs          tải nhạc còn thiếu vào public/audio/
 *   node pipeline/tai-nhac.mjs --sfx    sinh luôn public/sfx/ (cần python3 + numpy)
 *
 * Vì sao cần: public/audio (93 MB) và public/sfx nằm trong .gitignore nên `git clone`
 * không có chúng. Nguồn là nhạc Kevin MacLeod / CC BY — BẮT BUỘC ghi công theo
 * public/audio/CREDITS.md.
 *
 * VÌ SAO KHÔNG CẮM CỨNG MỘT URL: bản trước cắm 16 URL Wikimedia Commons, và CẢ 16 đều
 * 404 (Commons không host bộ này) — máy nào đã có sẵn file thì bỏ qua nên không ai
 * thấy, còn clone mới thì im lặng không có nhạc nào. Giờ mỗi bản nhạc có nhiều ỨNG VIÊN
 * URL (incompetech đặt tên lúc có dấu cách lúc không), thử lần lượt, lấy cái đầu tiên
 * trả 200. Bản nào vẫn không tải được thì lấp bằng một bản đã tải (có nhạc gần đúng vẫn
 * hơn im lặng) và IN RA rõ đã thay bằng gì.
 */
import {execFileSync} from 'node:child_process';
import {copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync, statSync} from 'node:fs';
import path from 'node:path';
import {timFfmpeg} from './moi-truong.mjs';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'public/audio');
const SFX = process.argv.includes('--sfx');

/** tên file trong thư viện → tên bản nhạc gốc trên incompetech (Kevin MacLeod, CC BY) */
const NHAC = {
  '10-heliograph.mp3': 'Heliograph',
  '11-candlepower.mp3': 'Candlepower',
  '12-divider.mp3': 'Divider',
  '13-eternal-hope.mp3': 'Eternal Hope',
  '14-heavy-heart.mp3': 'Heavy Heart',
  '15-distant-sun.mp3': 'Distant Sun',
  '16-restoration.mp3': 'Restoration',
  '17-where-stars-fall.mp3': 'Where the Stars Fall',
  '20-daily-beetle.mp3': 'The Daily Beetle',
  '21-electro-cabello.mp3': 'Electro Cabello',
  '22-flutey-funk.mp3': 'Fluttey Funk',
  '23-got-funk.mp3': 'I Got a Stick Arr Bryan Teoh',
  '24-grand-chase.mp3': 'The Grand Chase',
  '25-silly-fun.mp3': 'Silly Fun',
  '26-style-funk.mp3': 'Style Funk',
  '27-the-builder.mp3': 'The Builder',
};

/** các cách incompetech đặt tên file — thử lần lượt tới khi có cái 200 */
const ungVien = (ten) => {
  const b = 'https://incompetech.com/music/royalty-free/mp3-royaltyfree';
  return [
    `${b}/${encodeURIComponent(ten)}.mp3`,
    `${b}/${ten.replace(/\s+/g, '')}.mp3`,
    `${b}/${ten.replace(/\s+/g, '%20')}.mp3`,
    `${b}/${encodeURIComponent(ten.replace(/^The\s+/i, ''))}.mp3`,
  ];
};

const ffmpeg = () => timFfmpeg(ROOT);

mkdirSync(OUT, {recursive: true});
const {bin, env} = ffmpeg();
let tai = 0;
let bo = 0;
const hong = [];
const daCo = [];

for (const [file, ten] of Object.entries(NHAC)) {
  const dich = path.join(OUT, file);
  if (existsSync(dich) && statSync(dich).size > 10000) {
    bo++;
    daCo.push(dich);
    continue;
  }
  const tmp = path.join(OUT, `.tmp-${file}`);
  let xong = false;
  for (const url of ungVien(ten)) {
    try {
      execFileSync('curl', ['-sSL', '--fail', '-m', '90', '-A', 'video-studio/1.0', '-o', tmp, url], {stdio: 'pipe'});
      if (!existsSync(tmp) || statSync(tmp).size < 10000) throw new Error('file rỗng');
      // chuẩn hoá về -24 LUFS để nằm dưới giọng đọc (-16 LUFS), cùng mức với bộ nhạc gốc
      execFileSync(bin, ['-y', '-v', 'error', '-i', tmp, '-af', 'loudnorm=I=-24:TP=-2', '-c:a', 'libmp3lame', '-b:a', '128k', dich], {env, stdio: 'pipe'});
      execFileSync('rm', ['-f', tmp]);
      tai++;
      daCo.push(dich);
      xong = true;
      console.log(`  ✓ ${file}`);
      break;
    } catch {
      execFileSync('rm', ['-f', tmp], {stdio: 'pipe'});
    }
  }
  if (!xong) {
    hong.push(file);
    console.log(`  ✗ ${file} — không tải được "${ten}" ở ứng viên nào`);
  }
}

// Lấp chỗ trống: board tham chiếu tới tên nhạc cố định, thiếu file là chương đó IM LẶNG.
// Có nhạc gần đúng vẫn hơn im lặng, nhưng phải in ra để người dựng biết mà thay.
const thay = [];
if (hong.length && daCo.length) {
  for (const [i, file] of hong.entries()) {
    const nguon = daCo[i % daCo.length];
    copyFileSync(nguon, path.join(OUT, file));
    thay.push(`${file} ← ${path.basename(nguon)}`);
  }
}

console.log(`\nnhạc: ${tai} tải mới, ${bo} đã có, ${hong.length} không tải được`);
if (thay.length) {
  console.log('  lấp tạm (nên thay bằng bản đúng khi có):');
  for (const t of thay) console.log(`    · ${t}`);
}
if (hong.length && !daCo.length) console.log('  KHÔNG tải được bản nào — video vẫn render nhưng hoàn toàn không có nhạc nền.');

if (SFX) {
  console.log('\nsinh tiếng động (public/sfx):');
  // Bản Node, không cần python/numpy — image Linux của instance không có cả hai.
  try {
    execFileSync(process.execPath, [path.join(ROOT, 'pipeline/sfx.mjs')], {cwd: ROOT, stdio: 'inherit'});
  } catch (e) {
    console.log(`  ✗ sinh tiếng động lỗi: ${String(e.message).slice(0, 120)}`);
    console.log('    thiếu tiếng động thì video vẫn render được, chỉ mất sfx.');
  }
}

const credits = path.join(OUT, 'CREDITS.md');
if (!existsSync(credits)) {
  writeFileSync(credits, '# Nhạc nền — BẮT BUỘC ghi công (CC BY)\n\nKevin MacLeod (incompetech.com), chuẩn hoá -24 LUFS.\nGhi công trong phần mô tả video khi đăng.\n');
}
console.log('\nNhạc CC BY: ghi công theo public/audio/CREDITS.md khi đăng video.');
