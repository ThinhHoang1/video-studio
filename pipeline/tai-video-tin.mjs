/**
 * TẢI VIDEO MINH HOẠ TIN từ chính bài báo — B-roll thật thay cho ảnh tĩnh.
 *
 *   node pipeline/tai-video-tin.mjs <ten-ban-tin>
 *
 * Vì sao cần: ảnh tĩnh giữ khung được vài giây rồi người xem thấy đứng hình.
 * Bản tin thật (24h, Beat VN) chạy B-roll — hình động sau người dẫn. Bài nào có
 * video thì lấy video, bài nào không có thì vẫn dùng ảnh: `tai-anh-tin.mjs` lo
 * phần đó, hai bộ bổ sung cho nhau chứ không thay nhau.
 *
 * ─ Lấy ở đâu ─
 * Báo Việt nhúng video qua HLS (.m3u8) hoặc mp4 trực tiếp. Không trang nào khai
 * og:video, nên phải dò trong chính HTML. Đo 2026-09: tuoitre.vn dùng HLS ở
 * cdn2.tuoitre.vn; bài chữ thường KHÔNG có video — đó là bình thường, không phải lỗi.
 *
 * ─ BẢN QUYỀN ─
 * Cùng luật với ảnh: đây là trích dẫn tin, nên TÊN NGUỒN phải hiện trên màn
 * (renderer tự in khi có `anh_nguon`), cắt ngắn để phụ hoạ chứ không đăng lại
 * cả phóng sự, và nguồn nào cấm dùng lại thì bỏ.
 */
import {execFileSync, spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {timLibDir} from './moi-truong.mjs';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const TEN = process.argv[2];
if (!TEN) {
  console.error('Thiếu tên. Ví dụ: node pipeline/tai-video-tin.mjs ban-tin-2026-09-15');
  process.exit(1);
}
const LIB = timLibDir(ROOT) ?? path.join(ROOT, 'node_modules/@remotion/compositor-darwin-arm64');
const FFMPEG = path.join(LIB, 'ffmpeg');
const ENV = {...process.env, DYLD_LIBRARY_PATH: LIB, LD_LIBRARY_PATH: LIB};

const duongKb = path.join(ROOT, `scripts/${TEN}.json`);
const kb = JSON.parse(readFileSync(duongKb, 'utf8'));
const DU_AN = kb.project ?? TEN;
const THU_MUC = path.join(ROOT, 'public/tin', DU_AN);

/** mỗi đoạn B-roll cắt tối đa 8 giây — đủ phụ hoạ một tin, không thành đăng lại bài */
const DAI_TOI_DA = Number(process.env.BROLL_GIAY ?? 8);

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';

/** Dò link video trong HTML. HLS ưu tiên hơn mp4 vì báo Việt hay dùng HLS. */
const timVideo = (html) => {
  const mau = [
    /(https?:\/\/[^\s"'\\]+\.m3u8[^\s"'\\]*)/i,
    /(https?:\/\/[^\s"'\\]+\.mp4[^\s"'\\]*)/i,
    /<meta[^>]+property=["']og:video(?::url|:secure_url)?["'][^>]+content=["']([^"']+)["']/i,
  ];
  for (const re of mau) {
    const m = re.exec(html);
    if (m) return m[1].replace(/\\u002F/gi, '/').replace(/&amp;/g, '&');
  }
  return null;
};

mkdirSync(THU_MUC, {recursive: true});
let xong = 0;
let bo = 0;

for (const ch of kb.chapters ?? []) {
  const nguon = (ch.nguon ?? []).find((u) => /^https?:\/\//.test(String(u)));
  if (!nguon) continue;
  const dich = path.join(THU_MUC, `${ch.id}.mp4`);
  const tuongDoi = path.posix.join('tin', DU_AN, `${ch.id}.mp4`);

  if (existsSync(dich)) {
    ch.video = tuongDoi;
    console.log(`  ✓ ${ch.id} — đã có, bỏ qua`);
    xong++;
    continue;
  }

  try {
    const r = await fetch(nguon, {headers: {'user-agent': UA}, redirect: 'follow'});
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const link = timVideo(await r.text());
    if (!link) throw new Error('bài không nhúng video');

    // ffmpeg đọc được cả HLS lẫn mp4; cắt DAI_TOI_DA giây đầu, ép về khung hình
    // của phim để renderer không phải co giãn lúc chạy.
    const rr = spawnSync(
      FFMPEG,
      ['-y', '-user_agent', UA, '-i', link, '-t', String(DAI_TOI_DA),
       '-vf', 'scale=1280:-2', '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '24',
       '-movflags', '+faststart', dich],
      {stdio: 'ignore', env: ENV}
    );
    if (rr.status !== 0 || !existsSync(dich)) throw new Error('ffmpeg không tải được luồng');
    const co = statSync(dich).size;
    if (co < 20000) throw new Error('đoạn tải về quá ngắn');

    ch.video = tuongDoi;
    ch.anh_nguon = ch.anh_nguon ?? new URL(nguon).hostname.replace(/^www\./, '');
    console.log(`  ✓ ${ch.id} — ${(co / 1024).toFixed(0)} KB (${DAI_TOI_DA}s) từ ${ch.anh_nguon}`);
    xong++;
  } catch (e) {
    // KHÔNG chặn: phần lớn bài chữ không có video, và ảnh tĩnh vẫn dựng được.
    console.log(`  · ${ch.id} — ${e.message} → dùng ảnh tĩnh`);
    bo++;
  }
}

writeFileSync(duongKb, `${JSON.stringify(kb, null, 2)}\n`);
console.log(`\n→ ${xong} đoạn video trong public/tin/${DU_AN}/ · ${bo} tin dùng ảnh tĩnh`);
