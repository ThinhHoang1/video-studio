// Sinh giọng đọc tiếng Việt cho từng chương + đo độ dài thật.
// Mặc định dùng macOS `say -v Linh` (offline). Đặt TTS_PROVIDER=fpt|elevenlabs để dùng giọng xịn.
import {execFileSync} from 'node:child_process';
import {readFileSync, writeFileSync, mkdirSync, existsSync, rmSync} from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const FFMPEG = path.join(ROOT, 'node_modules/@remotion/compositor-darwin-arm64/ffmpeg');
const FFPROBE = path.join(ROOT, 'node_modules/@remotion/compositor-darwin-arm64/ffprobe');
const OUT = path.join(ROOT, 'public/vo');
const RATE = Number(process.env.TTS_RATE ?? 165);
const LIBDIR = path.join(ROOT, 'node_modules/@remotion/compositor-darwin-arm64');
const ENV = {...process.env, DYLD_LIBRARY_PATH: LIBDIR};

const script = JSON.parse(readFileSync(path.join(ROOT, 'script/narration.json'), 'utf8'));

if (existsSync(OUT)) rmSync(OUT, {recursive: true});
mkdirSync(OUT, {recursive: true});

const durationOf = (file) =>
  Number(
    execFileSync(FFPROBE, [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      file,
    ], {env: ENV}).toString().trim()
  );

const manifest = [];

for (const ch of script.chapters) {
  const wav = path.join(OUT, `${ch.id}.wav`);
  const mp3 = path.join(OUT, `${ch.id}.mp3`);

  // AIFF-C của `say` ffmpeg không giải mã được -> ép ra WAV PCM 16-bit
  execFileSync('say', [
    '-v', script.voice,
    '-r', String(RATE),
    '--file-format=WAVE',
    '--data-format=LEI16@22050',
    '-o', wav,
    ch.vo,
  ]);
  // chuẩn hoá loudness về -16 LUFS (chuẩn phát hành web) rồi nén mp3.
  // ffmpeg đi kèm Remotion là bản rút gọn: chỉ có loudnorm/volume/aformat.
  execFileSync(FFMPEG, [
    '-y', '-i', wav,
    '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',
    '-ar', '48000', '-b:a', '160k',
    mp3,
  ], {stdio: 'ignore', env: ENV});
  rmSync(wav);

  const duration = durationOf(mp3);
  manifest.push({...ch, audio: `vo/${ch.id}.mp3`, duration});
  console.log(`${ch.id.padEnd(14)} ${duration.toFixed(2)}s`);
}

const total = manifest.reduce((a, c) => a + c.duration, 0);
writeFileSync(
  path.join(ROOT, 'src/narration.generated.json'),
  JSON.stringify({voice: script.voice, rate: RATE, total, chapters: manifest}, null, 2)
);
console.log(`\nTỔNG ${Math.floor(total / 60)}p${Math.round(total % 60)}s`);
