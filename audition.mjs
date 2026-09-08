// Thử nhiều giọng Gemini trên cùng một câu để chọn. Mỗi giọng đọc kèm tên của nó.
import path from 'node:path';
import {speak, pcmToMp3, concatMp3, durationOf, ensureDir} from './gemini-tts.mjs';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const OUT = ensureDir(path.join(ROOT, 'out/audition'), {clean: true});

const STYLE = `Bạn là người dẫn một kênh giải thích kinh tế trên YouTube, phong cách hài châm biếm.
Đọc bằng giọng nam trẻ, tỉnh bơ, hơi cà khịa, như đang kể chuyện cho bạn thân nghe ở quán bia.
Nhấn mạnh các con số. Ngắt nhịp trước câu chốt để tạo punchline. Không đọc đều đều như đọc bản tin.
Đọc tự nhiên bằng tiếng Việt giọng Bắc.`;

const LINE = `Ê, tao hỏi mày. Bát phở năm ngoái ba mươi nghìn, năm nay bốn mươi lăm nghìn, mà thịt thì ít hơn. Mày nghĩ ai vừa móc túi mày đấy?`;

const VOICES = [
  ['Charon', 'giọng trầm, kiểu dẫn chuyện'],
  ['Puck', 'tưng tửng, tếu'],
  ['Fenrir', 'hào hứng, bốc'],
  ['Algenib', 'khàn, bụi'],
  ['Zubenelgenubi', 'suồng sã, đời'],
  ['Iapetus', 'trong, rõ chữ'],
  ['Orus', 'chắc, dứt khoát'],
  ['Sadaltager', 'kiểu hiểu biết, giảng giải'],
];

const files = [];
for (const [voice, note] of VOICES) {
  const f = path.join(OUT, `${voice}.mp3`);
  const pcm = await speak({text: `Giọng ${voice}. ${LINE}`, voice, style: STYLE});
  pcmToMp3(pcm, f);
  console.log(`${voice.padEnd(16)} ${durationOf(f).toFixed(1)}s  ${note}`);
  files.push(f);
}

const all = path.join(OUT, '00-tat-ca.mp3');
concatMp3(files, all);
console.log(`\nNghe hết một lượt: ${all}`);
