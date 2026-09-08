// Dựng manifest từ những file giọng ĐÃ có, bỏ qua chương chưa sinh.
// Nhờ vậy dựng/render được ngay cả khi TTS còn dở.
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import path from 'node:path';
import {durationOf} from './gemini-tts.mjs';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const NAME = process.argv[2] ?? 'lam-phat';
const script = JSON.parse(readFileSync(path.join(ROOT, `script/${NAME}.json`), 'utf8'));

const chapters = [];
const missing = [];
for (const ch of script.chapters) {
  const rel = `vo-${NAME}/${ch.id}.mp3`;
  const abs = path.join(ROOT, 'public', rel);
  if (!existsSync(abs)) {
    missing.push(ch.id);
    continue;
  }
  chapters.push({...ch, audio: rel, duration: durationOf(abs)});
}

const total = chapters.reduce((a, c) => a + c.duration, 0);
writeFileSync(
  path.join(ROOT, `src/${NAME}.generated.json`),
  JSON.stringify({voice: script.voice, style: script.style, total, chapters}, null, 2)
);
console.log(`${chapters.length}/${script.chapters.length} chương · ${Math.floor(total / 60)}p${Math.round(total % 60)}s`);
if (missing.length) console.log(`chưa có giọng: ${missing.join(', ')}`);
