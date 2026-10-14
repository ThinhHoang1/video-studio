  // Sinh lời bình bằng Gemini TTS cho một kịch bản trong script/.
import {readFileSync, writeFileSync, existsSync, mkdirSync} from 'node:fs';
import {apDung} from './phong-cach.mjs';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {speak, pcmToMp3, durationOf, ensureDir} from './gemini-tts.mjs';

// pipeline/ nằm dưới gốc repo một cấp
const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const NAME = process.argv[2] ?? 'lam-phat';
const script = JSON.parse(readFileSync(path.join(ROOT, `scripts/${NAME}.json`), 'utf8'));
// Mặc định giữ file đã sinh để chạy tiếp khi bị quota cắt giữa chừng.
const OUT = ensureDir(path.join(ROOT, `public/vo-${NAME}`), {clean: process.env.FRESH === '1'});
/**
 * Giọng + đoạn dặn lấy từ phong-cach.json (người dùng chọn trên dashboard), ĐÈ
 * lên trường `voice`/`style` của kịch bản. Vì sao đè: `style` nằm trong từng file
 * kịch bản nên agent viết bản mới là chép lại style cũ — đổi giọng chỉ ăn được
 * một video rồi đâu lại vào đấy. Kịch bản khai `giu_giong: true` thì giữ nguyên.
 */
const PC = apDung(script);
const VOICE = process.env.VOICE ?? PC.voice ?? script.voice;
const STYLE = PC.style ?? script.style;
if (!PC.tuKichBan) console.log(`  giọng ${VOICE} · tông ${PC.tong} (phong-cach.json)`);

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
  // Đọc chậm bất thường = model ê a hoặc chèn khoảng lặng dài → đọc lại.
  // Mốc 2.7 từ/giây cũ quá rộng: đo thật ba kịch bản đã duyệt thì giọng kể chạy
  // 3.57–3.81 từ/giây, nên trần cũ cho phép chậm tới 1.7 từ/giây mà vẫn lọt.
  // Đã lọt thật: một chương 69 từ ra 36 giây (1.9 từ/giây), kéo cả chương thành
  // 4 giây một shot và làm hỏng nhịp. Mốc 3.2 với biên 1.5 lần chặn đúng nó mà
  // không đụng chương đọc bình thường.
  const maxSec = (words / 3.2) * 1.5;
  let duration = 0;
  for (let tryIdx = 1; tryIdx <= 4; tryIdx++) {
    const pcm = await speak({text: ch.vo, voice: VOICE, style: STYLE});
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
  // Một chương hỏng KHÔNG được giết cả mẻ: gom lỗi lại, các chương khác vẫn ghi ra
  // đĩa và có .sig nên lần chạy sau chỉ phải đọc lại đúng phần còn thiếu.
  const hong = [];
  const congNhan = Array.from({length: Math.min(SONG_SONG, hangDoi.length)}, async () => {
    while (hangDoi.length) {
      const [ch, i] = hangDoi.shift();
      try {
        manifest[i] = await docChuong(ch, i);
      } catch (e) {
        hong.push({id: ch.id, loi: String(e.message).slice(0, 100)});
      }
    }
  });
  await Promise.all(congNhan);
  if (hong.length) {
    console.log(`\n✗ ${hong.length}/${script.chapters.length} chương chưa đọc được:`);
    for (const h of hong) console.log(`    ${h.id}: ${h.loi}`);
    console.log('  Chạy lại lệnh này — chương đã xong được bỏ qua, chỉ đọc lại phần thiếu.');
    process.exit(1);
  }
}

const total = manifest.reduce((a, c) => a + c.duration, 0);
// Dự án mới chưa có thư mục data/ — tạo TRƯỚC khi ghi. Thiếu dòng này thì
// tts chạy hết quota rồi mới chết ở bước ghi file, phải đọc lại từ đầu.
const duongManifest = path.join(ROOT, `src/projects/${script.project ?? NAME.replace(/-vui$|-buon$/, '')}/data/${NAME}.generated.json`);
mkdirSync(path.dirname(duongManifest), {recursive: true});
writeFileSync(
  duongManifest,
  JSON.stringify({voice: VOICE, style: STYLE, total, chapters: manifest}, null, 2)
);
console.log(`\nTỔNG ${Math.floor(total / 60)}p${Math.round(total % 60)}s → src/projects/${script.project ?? NAME}/data/${NAME}.generated.json`);
