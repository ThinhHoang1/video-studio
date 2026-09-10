/**
 * Chấm kịch bản TRƯỚC khi tốn hạn mức TTS — cổng chất lượng cho agent viết kịch bản.
 *
 *   node pipeline/cham-kich-ban.mjs <ten>
 *
 * Hai phần:
 *   1. Máy đo được (chặn khi vi phạm): số từ/chương, câu quá dài, sáo ngữ cấm, từ tiếng Anh trần
 *      (Gemini TTS đọc sai: "mail" → "mèo"), thiếu câu ngắn (punchline), thiếu thoại trực tiếp,
 *      thiếu chi tiết cụ thể, thiếu callback, hook mở đầu dài.
 *   2. Agent tự chấm theo rubric trong .claude/skills/tao-video/references/kich-ban-storytime.md và
 *      GHI vào kịch bản: "rubric": {"hook":1,"mat_do":1,"chi_tiet":0.5,...} (10 tiêu chí mục 5 cẩm nang, mỗi 0/0.5/1). Tổng < 7 → chặn.
 *
 * Thoát 0 = được TTS; 1 = viết lại.
 */
import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const TEN = process.argv[2];
if (!TEN) {
  console.error('Dùng: node pipeline/cham-kich-ban.mjs <ten>');
  process.exit(2);
}
const p = path.join(ROOT, `scripts/${TEN}.json`);
if (!existsSync(p)) {
  console.error(`✗ không có scripts/${TEN}.json`);
  process.exit(1);
}
const kb = JSON.parse(readFileSync(p, 'utf8'));
const loi = [];
const canhBao = [];

/** 10 tiêu chí đúng thứ tự bảng ở references/kich-ban-storytime.md mục 5 */
const TIEU_CHI = ['hook', 'mat_do', 'chi_tiet', 'leo_thang', 'twist_callback', 'nhan_vat_phu', 'cau_chot', 'giong_rieng', 'viet_hoa', 'cam'];
/** sáo ngữ / giọng đạo lý — storytime không dùng */
const SAO_NGU = ['hành trình', 'trải nghiệm đáng nhớ', 'bài học quý', 'bài học đắt giá', 'cảm xúc lẫn lộn', 'không thể tin được', 'thật sự rất', 'vô cùng', 'tuyệt vời', 'ý nghĩa sâu sắc', 'trưởng thành hơn', 'nhận ra rằng', 'quả thật', 'biết bao'];
/**
 * Từ tiếng Anh Gemini TTS hay đọc sai khi đứng trần trong câu Việt (đo: "mail" → "mèo").
 * Chỉ bắt từ trong danh sách này — không bắt mọi từ không dấu (Long, xe, qua là tiếng Việt).
 */
const ANH_XAU = new Set(['mail', 'meeting', 'feedback', 'offer', 'check', 'trend', 'content', 'remote', 'update', 'sale', 'job', 'app', 'link', 'comment', 'share', 'follow', 'post', 'upload', 'download', 'stream', 'level', 'boss', 'drama', 'plan', 'report', 'review', 'call', 'chill', 'fail', 'pass', 'test', 'quiz', 'slide', 'file', 'form', 'note', 'block', 'unfriend', 'seen', 'ship', 'order', 'voucher', 'sale', 'flash', 'combo', 'size', 'shop', 'chat', 'nick', 'acc', 'pro', 'noob', 'gg', 'lol', 'ok', 'okay', 'oke']);
const APP = /\b(tiktok|zalo|google|facebook|youtube|shopee|grab|messenger|instagram|threads|chatgpt|excel|word|powerpoint|gmail|netflix|spotify|iphone|samsung|xiaomi|vinfast|honda|yamaha|highlands|phúc long|circle k|vinmart|bách hoá xanh)\b/gi;
const soChu = /\b(một|hai|ba|bốn|năm|sáu|bảy|tám|chín|mười|trăm|nghìn|ngàn|triệu|lăm|mươi|\d+)\b/gi;

const cau = (vo) => vo.split(/(?<=[.!?…:])\s+/).map((c) => c.trim()).filter(Boolean);
const tu = (s) => s.split(/\s+/).filter(Boolean);

console.log(`\n${TEN} — "${kb.title ?? ''}" — ${kb.chapters?.length ?? 0} chương\n`);
const tatCaTu = [];
for (const [i, ch] of (kb.chapters ?? []).entries()) {
  const o = `chương ${i + 1} (${ch.id})`;
  const vo = ch.vo ?? '';
  const ts = tu(vo);
  const cs = cau(vo);
  tatCaTu.push(new Set(ts.map((t) => t.toLowerCase().replace(/[^\p{L}\p{N}]/gu, ''))));
  const n = ts.length;
  if (ch.id !== 'mo-bai' && (n < 45 || n > 72)) loi.push(`${o}: ${n} từ — cần 45–70`);
  const dai = cs.filter((c) => tu(c).length > 32);
  for (const c of dai) loi.push(`${o}: câu ${tu(c).length} từ quá dài (>32) — giọng nói chuyện cho câu trôi dài nhưng phải bẻ vào câu ngắn: "${c.slice(0, 60)}…"`);
  const ngan = cs.filter((c) => tu(c).length <= 6).length;
  if (cs.length && ngan / cs.length < 0.2) canhBao.push(`${o}: chỉ ${ngan}/${cs.length} câu ≤ 6 từ — câu dài trôi phải bẻ vào câu ngắn (chỗ cười), mục tiêu ≥ 20%`);
  // giọng nói chuyện (cẩm nang 1c): tiếng đệm 3–6%, gọi người nghe ≥ 1, tự chửi mình ≥ 1
  const dem = (vo.match(/\b(nhá|đấy|ấy|xong|thế là|ờ|luôn|kiểu|nhỉ|thật ra|nói chung|mà)\b/gi) ?? []).length;
  if (dem / Math.max(1, n) < 0.03) canhBao.push(`${o}: tiếng đệm ${dem}/${n} từ (<3%) — đọc lên như văn viết; thêm "xong nhá / đấy / ờ / kiểu" đúng chỗ`);
  if (!/\b(em ạ|các bạn|mấy bạn|anh em|bạn nào|ông nào|bà nào|mọi người)\b/i.test(vo)) canhBao.push(`${o}: không gọi thẳng người nghe lần nào ("em ạ", "các bạn", "anh em") — phải là nói chuyện, không phải kể suông`);
  if (!/(tôi|anh|mình|tui) (ngu|dở|tệ|ác|hèn|ngáo|điên|ngớ ngẩn|kém|nhát)|ngu (thật|vãi|chưa)|toang|chết dở/i.test(vo)) canhBao.push(`${o}: thiếu câu tự chửi mình thẳng ("anh ngu thật", "toang", "chết dở")`);
  const thoai = cs.filter((c) => /:|\b(bảo|hỏi|nói|kêu|thì thào|rep|nhắn)\b/i.test(c)).length;
  if (thoai < 2) canhBao.push(`${o}: chỉ ${thoai} câu thoại trực tiếp — cần ≥ 2 (nhân vật phải có giọng)`);
  // chi tiết cụ thể = số đếm + tên app/thương hiệu + tên riêng viết hoa giữa câu
  const dauCau = new Set(cs.map((c) => tu(c)[0]?.replace(/[^\p{L}]/gu, '')));
  const tenRieng = (vo.match(/\b[A-ZĐÂĂÊÔƠƯ][a-zà-ỹ]+/g) ?? []).filter((w) => !dauCau.has(w));
  const cuThe = (vo.match(soChu) ?? []).length + (vo.match(APP) ?? []).length + new Set(tenRieng).size;
  if (cuThe < 3) canhBao.push(`${o}: ít chi tiết cụ thể (${cuThe}: số, tên riêng, tên app) — mục tiêu ≥ 3`);
  for (const s of SAO_NGU) if (vo.toLowerCase().includes(s)) loi.push(`${o}: sáo ngữ "${s}" — storytime không giảng đạo lý`);
  const anh = ts.map((t) => t.replace(/[.,!?;:"'…]/g, '').toLowerCase()).filter((t) => ANH_XAU.has(t));
  for (const a of new Set(anh)) canhBao.push(`${o}: từ tiếng Anh trần "${a}" — Gemini TTS có thể đọc sai (đo được: "mail" → "mèo"); viết "email"/từ Việt hoặc phiên âm`);
  if (i === 0) {
    const hook = cs[0] ?? ''; // câu đầu mo-bai = cold open
    if (tu(hook).length > 12) canhBao.push(`hook: câu đầu ${tu(hook).length} từ — 3 giây đầu quyết định người ở lại, mở bằng câu ≤ 12 từ có tình huống`);
  }
  console.log(`  ${o.padEnd(28)} ${String(n).padStart(3)} từ · ${cs.length} câu · ${ngan} ngắn · ${thoai} thoại`);
}

// mở bài bắt buộc: chương đầu id "mo-bai", 28–45 từ, có tự giới thiệu + lời hứa; không "xin chào các bạn"
{
  const dau = kb.chapters?.[0];
  if (!dau || dau.id !== 'mo-bai') loi.push('thiếu chương mở bài: chương đầu phải có id "mo-bai" (cold open → tự giới thiệu → lời hứa, 28–45 từ) — xem cẩm nang mục 2b');
  else {
    const vo = dau.vo ?? '';
    const n = tu(vo).length;
    if (n < 28 || n > 45) loi.push(`mo-bai: ${n} từ — cần 28–45 (≤ 10 giây)`);
    // \b không hiểu chữ có dấu trong JS → dùng lookaround theo khoảng trắng
    if (!/(^|\s)(tôi|mình|tui|tao|em) (là|tên)(?=\s|$|[,.:])/iu.test(vo)) loi.push('mo-bai: thiếu câu tự giới thiệu ("tôi là …" + một nét tự trào)');
    if (!/(hôm nay|chuyện|kể|vì sao|tại sao|làm sao)/i.test(vo)) loi.push('mo-bai: thiếu lời hứa/tease cho người xem (có "hôm nay/chuyện/kể/vì sao")');
    if (/(xin chào các bạn|chào mừng|hôm nay mình sẽ|hello mọi người)/i.test(vo)) loi.push('mo-bai: mở kiểu "xin chào các bạn / chào mừng / hôm nay mình sẽ" — cấm, mở bằng khoảnh khắc đang xảy ra');
  }
  const cuoi = kb.chapters?.[kb.chapters.length - 1];
  if (cuoi && !/(bình luận|comment|điểm danh|kể cho|bạn thì sao|còn bạn|còn các bạn)/i.test(cuoi.vo ?? '')) loi.push(`chương cuối (${cuoi.id}): thiếu câu gọi khán giả ≤ 10 từ bám đúng chuyện (bình luận / điểm danh / còn bạn) — xem cẩm nang mục 2b`);
}

// callback: một từ khoá (≥4 chữ, không phải từ phổ thông) xuất hiện ở ≥2 chương trong đó có chương cuối
if (tatCaTu.length >= 3) {
  const cuoi = tatCaTu[tatCaTu.length - 1];
  const pho = new Set(['không', 'nhưng', 'người', 'được', 'chuyện', 'lúc', 'cái', 'thằng', 'này', 'đấy', 'rồi', 'thì', 'cũng', 'đang', 'phải', 'nhìn', 'bảo', 'hỏi']);
  const cb = [...cuoi].filter((t) => t.length >= 4 && !pho.has(t) && tatCaTu.slice(0, -1).filter((s) => s.has(t)).length >= 1);
  if (cb.length < 2) canhBao.push(`callback: chương cuối không nhặt lại từ khoá gieo trước — twist/callback yếu (thấy: ${cb.join(', ') || 'không có'})`);
}

// rubric tự chấm
const r = kb.rubric;
let tong = null;
if (!r || typeof r !== 'object') {
  loi.push('thiếu "rubric" trong kịch bản — tự chấm 10 tiêu chí (0–1) theo references/kich-ban-storytime.md rồi ghi vào scripts/<ten>.json');
} else {
  const thieu = TIEU_CHI.filter((k) => typeof r[k] !== 'number');
  if (thieu.length) loi.push(`rubric thiếu tiêu chí: ${thieu.join(', ')}`);
  tong = TIEU_CHI.reduce((a, k) => a + Math.min(1, Math.max(0, Number(r[k]) || 0)), 0);
  if (tong < 7) loi.push(`rubric tự chấm ${tong.toFixed(1)}/10 — dưới 7, viết lại trước khi TTS (tiêu chí yếu: ${TIEU_CHI.filter((k) => (r[k] ?? 0) < 0.5).join(', ')})`);
}

console.log('');
for (const c of canhBao) console.log(`  ⚠  ${c}`);
for (const l of loi) console.log(`  ✗  ${l}`);
console.log(`\n  rubric tự chấm: ${tong === null ? 'chưa có' : `${tong.toFixed(1)}/10`} · ${loi.length} lỗi chặn · ${canhBao.length} cảnh báo`);
if (loi.length) {
  console.log('  → chưa được TTS. Sửa kịch bản, chạy lại.');
  process.exit(1);
}
console.log('  ✓ được TTS');
