/**
 * Dựng khung kịch bản BẢNG TIN cho một ngày — để agent chỉ phải điền nội dung tin.
 *
 *   node pipeline/ban-tin-moi.mjs 2026-09-11            5 tin (mặc định)
 *   node pipeline/ban-tin-moi.mjs 2026-09-11 --tin 4    4 tin
 *   node pipeline/ban-tin-moi.mjs 2026-09-11 --so 12    số tập in trên tiêu đề
 *
 * Sinh scripts/ban-tin-<ngay>.json với khung cố định (mo-bai → n tin → ket), giọng
 * và style đã chốt, rubric để trống cho agent tự chấm. Không ghi đè file đã có.
 *
 * VÌ SAO có script này: bảng tin ra MỖI NGÀY, khung thì không đổi — chỉ nội dung đổi.
 * Bắt agent gõ lại cả khung mỗi sáng là chỗ dễ sai nhất (quên `nguon`, quên `mo-bai`,
 * đặt sai `project` → TTS đọc nhầm thư mục).
 */
import {existsSync, writeFileSync} from 'node:fs';
import path from 'node:path';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const av = process.argv.slice(2);
const ngay = av.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a));
if (!ngay) {
  console.error('Dùng: node pipeline/ban-tin-moi.mjs <YYYY-MM-DD> [--tin 5] [--so 12]');
  process.exit(2);
}
const soTin = Number(av[av.indexOf('--tin') + 1]) || 5;
const soTap = av.includes('--so') ? av[av.indexOf('--so') + 1] : '';

const STYLE =
  'Bạn là YouTuber kể chuyện đời mình bằng hoạt hình (kiểu storytime animation), hôm nay ngồi đọc bảng tin công nghệ cho hội bạn nghe. ' +
  'Giọng nam trẻ, NĂNG LƯỢNG CAO, nói nhanh, hào hứng, như đang kể một chuyện vừa xảy ra sáng nay. Tốc độ nhanh hơn bình thường 20%. ' +
  'Lên giọng bất ngờ ở chỗ ngạc nhiên, hạ giọng thì thào ở chỗ bí mật, cười khẽ trong lúc nói khi tự thấy mình ngớ ngẩn. ' +
  'Câu ngắn đọc DỨT, dứt khoát như đấm punchline. Tuyệt đối không đọc đều đều, không trầm buồn, không giọng phát thanh viên thời sự. ' +
  'Tiếng Việt giọng Bắc, đời thường.';

const ten = `ban-tin-${ngay}`;
const dich = path.join(ROOT, `scripts/${ten}.json`);
if (existsSync(dich)) {
  console.error(`✗ đã có scripts/${ten}.json — sửa file đó, đừng sinh đè.`);
  process.exit(1);
}

const tin = Array.from({length: soTin}, (_, i) => ({
  id: `tin-${i + 1}`,
  kicker: i === 0 ? 'Tin chính' : 'Tin chính',
  heading: '<tiêu đề tin, ≤ 5 từ, in trên thẻ>',
  nguon: ['https://<link kiểm chứng được>'],
  vo: '<35–75 từ: chuyện gì xảy ra → con số/tên cụ thể → nó đụng vào ai → việc cần làm. Nói chuyện, không đọc thông cáo.>',
}));

const kb = {
  title: `Bảng tin Claw Expert${soTap ? ` #${soTap}` : ''} — <tiêu đề gợi tò mò, không phải liệt kê>`,
  project: ten,
  dinh_dang: 'ban-tin',
  ngay,
  voice: 'Fenrir',
  style: STYLE,
  chapters: [
    {
      id: 'mo-bai',
      kicker: 'Sáng nay',
      heading: '<3 từ>',
      vo: '<28–45 từ: mở bằng khoảnh khắc đang xảy ra (cấm mở bằng câu chào công thức) → tự giới thiệu "Mình là …" kèm một nét tự trào → hứa hôm nay có gì và mất bao lâu.>',
    },
    ...tin,
    {
      id: 'ket',
      kicker: 'Chốt',
      heading: 'Việc hôm nay',
      vo: '<35–75 từ: "Chốt lại nhá" → nhắc lại 2–3 việc cần làm → hẹn mai theo tiếp cái gì → một câu gọi khán giả ≤ 10 từ (bình luận/điểm danh).>',
    },
  ],
  rubric: {hook: 0, mat_do: 0, chi_tiet: 0, leo_thang: 0, twist_callback: 0, nhan_vat_phu: 0, cau_chot: 0, giong_rieng: 0, viet_hoa: 0, cam: 0},
};

writeFileSync(dich, `${JSON.stringify(kb, null, 2)}\n`);
console.log(`✓ scripts/${ten}.json — ${soTin} tin + mở bài + chốt.`);
console.log(`  1. điền nội dung + nguon từng tin (thiếu link là cổng chặn)`);
console.log(`  2. tự chấm rubric rồi: node pipeline/cham-kich-ban.mjs ${ten}`);
console.log(`  3. node pipeline/tao-video.mjs ${ten} --soat`);
