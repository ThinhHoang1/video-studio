// Sinh lời bình bằng Gemini TTS cho một kịch bản trong script/.
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {speak, pcmToMp3, durationOf, ensureDir} from './gemini-tts.mjs';

// pipeline/ nằm dưới gốc repo một cấp
const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const NAME = process.argv[2] ?? 'lam-phat';
const script = JSON.parse(readFileSync(path.join(ROOT, `scripts/${NAME}.json`), 'utf8'));
// Mặc định giữ file đã sinh để chạy tiếp khi bị quota cắt giữa chừng.
const OUT = ensureDir(path.join(ROOT, `public/vo-${NAME}`), {clean: process.env.FRESH === '1'});
const VOICE = process.env.VOICE ?? script.voice;

/**
 * Đọc song song mọi chương: mỗi chương chiếm một cặp key×model khác nhau (speak() xoay tua),
 * nên 5 chương xong trong ~1 lượt gọi thay vì 5 lượt nối tiếp. Kết quả xếp lại đúng thứ tự.
 */
const docChuong = async (ch, i) => {
  const mp3 = path.join(OUT, `${ch.id}.mp3`);
  const nhan = `[${i + 1}/${script.chapters.length}] ${ch.id}`;
  const sig = createHash('sha1').update(`${VOICE}\n${script.style}\n${ch.vo}`).digest('hex').slice(0, 16);
  const sigFile = mp3.replace(/\.mp3$/, '.sig');
  const fresh = existsSync(mp3) && existsSync(sigFile) && readFileSync(sigFile, 'utf8').trim() === sig;
  if (fresh) {
    const d = durationOf(mp3);
    console.log(`${nhan} … ${d.toFixed(1)}s (đã có, bỏ qua)`);
    return {...ch, audio: `vo-${NAME}/${ch.id}.mp3`, duration: d};
  }
  if (existsSync(mp3)) console.log(`${nhan} … lời đã đổi, đọc lại`);
  // Chặn bản đọc hỏng: tiếng Việt ~2.7 âm tiết/giây; dài gấp đôi là model lặp/ê a → đọc lại.
  const words = ch.vo.split(/\s+/).length;
  const maxSec = (words / 2.7) * 2;
  let duration = 0;
  for (let tryIdx = 1; tryIdx <= 4; tryIdx++) {
    const pcm = await speak({text: ch.vo, voice: VOICE, style: script.style});
    pcmToMp3(pcm, mp3);
    duration = durationOf(mp3);
    if (duration <= maxSec) break;
    console.log(`${nhan} … bản đọc dài bất thường ${duration.toFixed(0)}s (tối đa ${maxSec.toFixed(0)}s), đọc lại`);
    if (tryIdx === 4) throw new Error(`${ch.id}: bản đọc quá dài sau 4 lần thử`);
  }
  writeFileSync(sigFile, sig);
  console.log(`${nhan} … ${duration.toFixed(1)}s`);
  return {...ch, audio: `vo-${NAME}/${ch.id}.mp3`, duration};
};

const SONG_SONG = Number(process.env.TTS_SONG_SONG ?? 9);
const manifest = new Array(script.chapters.length);
{
  const hangDoi = script.chapters.map((ch, i) => [ch, i]);
  const congNhan = Array.from({length: Math.min(SONG_SONG, hangDoi.length)}, async () => {
    while (hangDoi.length) {
      const [ch, i] = hangDoi.shift();
      manifest[i] = await docChuong(ch, i);
    }
  });
  await Promise.all(congNhan);
}

const total = manifest.reduce((a, c) => a + c.duration, 0);
writeFileSync(
  path.join(ROOT, `src/projects/${script.project ?? NAME.replace(/-vui$|-buon$/, '')}/data/${NAME}.generated.json`),
  JSON.stringify({voice: VOICE, style: script.style, total, chapters: manifest}, null, 2)
);
console.log(`\nTỔNG ${Math.floor(total / 60)}p${Math.round(total % 60)}s → src/projects/${script.project ?? NAME}/data/${NAME}.generated.json`);
