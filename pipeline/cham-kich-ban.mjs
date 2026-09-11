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
import {existsSync, readdirSync, readFileSync} from 'node:fs';
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

/**
 * CHỐNG CHÉP LẠI KỊCH BẢN ĐÃ CÓ.
 *
 * Repo chứa sẵn các kịch bản đã dựng thành phim (`scripts/*.json`) để làm ví dụ.
 * Chuyện đã xảy ra thật: người dùng bảo agent "làm video về X", agent thấy
 * `scripts/X.json` đã nằm sẵn đó nên render lại nguyên bản của người khác và
 * báo là đã làm xong — không sáng tạo gì cả, và người dùng chỉ phát hiện khi
 * xem thấy y hệt video cũ.
 *
 * Cổng này đo trùng lặp bằng Jaccard trên 3-gram từ, so chương-với-chương giữa
 * kịch bản đang chấm và MỌI kịch bản khác trong scripts/. Chép nguyên = 1.0.
 *   > 0.45  → CHẶN (chép lại, dù có đổi vài từ)
 *   > 0.25  → cảnh báo (ý trùng, nên kể góc khác)
 * Ngưỡng đo trên 10 kịch bản có sẵn: hai kịch bản khác chủ đề của cùng một
 * người viết trùng cao nhất 0.06 — nên 0.45 là rất rộng tay, chỉ bắt chép thật.
 */
const ngram = (t) => {
  const w = String(t).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean);
  const g = new Set();
  for (let i = 0; i + 2 < w.length; i++) g.add(`${w[i]} ${w[i + 1]} ${w[i + 2]}`);
  return g;
};
const jaccard = (a, b) => {
  if (!a.size || !b.size) return 0;
  let chung = 0;
  for (const x of a) if (b.has(x)) chung++;
  return chung / (a.size + b.size - chung);
};
const trungLap = () => {
  const ta = (kb.chapters ?? []).map((c) => ngram(c.vo ?? ''));
  const ket = [];
  for (const f of readdirSync(path.join(ROOT, 'scripts'))) {
    if (!f.endsWith('.json') || f === `${TEN}.json`) continue;
    let khac;
    try {
      khac = JSON.parse(readFileSync(path.join(ROOT, 'scripts', f), 'utf8'));
    } catch {
      continue;
    }
    const tb = (khac.chapters ?? []).map((c) => ngram(c.vo ?? ''));
    let max = 0;
    let tong = 0;
    for (const a of ta) {
      let m = 0;
      for (const b of tb) m = Math.max(m, jaccard(a, b));
      max = Math.max(max, m);
      tong += m;
    }
    if (ta.length && max > 0.15) ket.push({file: f.replace(/\.json$/, ''), max, tb: tong / ta.length});
  }
  return ket.sort((x, y) => y.max - x.max);
};
/**
 * Hai định dạng, một cổng.
 *   storytime (mặc định) — kể một chuyện đời, cần thoại trực tiếp + callback cuối bài.
 *   ban-tin  — bảng tin hằng ngày (kiểu BeatVN): mỗi chương là MỘT tin, không có
 *              thoại nhân vật và không có callback truyện, nhưng BẮT BUỘC có
 *              `nguon` (link kiểm chứng được) + `kicker` + `heading`, và chương
 *              cuối phải chốt việc-cần-làm. Bịa tin nguy hiểm hơn kịch bản nhạt,
 *              nên thiếu nguồn là CHẶN, không phải cảnh báo.
 * Khai bằng "dinh_dang": "ban-tin" trong scripts/<ten>.json.
 */
const BT = kb.dinh_dang === 'ban-tin';

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

console.log(`\n${TEN} — "${kb.title ?? ''}" — ${kb.chapters?.length ?? 0} chương${BT ? ' · định dạng BẢNG TIN' : ''}\n`);
const tatCaTu = [];
for (const [i, ch] of (kb.chapters ?? []).entries()) {
  const o = `chương ${i + 1} (${ch.id})`;
  const vo = ch.vo ?? '';
  const ts = tu(vo);
  const cs = cau(vo);
  tatCaTu.push(new Set(ts.map((t) => t.toLowerCase().replace(/[^\p{L}\p{N}]/gu, ''))));
  const n = ts.length;
  const [min, max] = BT ? [35, 75] : [45, 72];
  if (ch.id !== 'mo-bai' && (n < min || n > max)) loi.push(`${o}: ${n} từ — cần ${min}–${max === 72 ? 70 : max}`);
  if (BT && i > 0 && i < (kb.chapters.length - 1)) {
    // mỗi tin phải kiểm chứng được: thiếu link là chặn, không cho TTS đọc tin bịa
    const ng = Array.isArray(ch.nguon) ? ch.nguon.filter((u) => /^https?:\/\//.test(String(u))) : [];
    if (!ng.length) loi.push(`${o}: thiếu "nguon": ["https://…"] — mỗi tin phải có link kiểm chứng được`);
    if (!ch.kicker || !ch.heading) loi.push(`${o}: thiếu "kicker"/"heading" — bảng tin phải có nhãn mục và tiêu đề tin`);
    if (!/(nên|hãy|đi|cứ|nhớ|đừng|khỏi|cập nhật|thử|bật|tắt|lên bản|chờ)/iu.test(vo)) canhBao.push(`${o}: tin không có việc-cần-làm cho người xem ("lên bản này đi", "chờ đã", "đừng đụng")`);
  }
  const dai = cs.filter((c) => tu(c).length > 32);
  for (const c of dai) loi.push(`${o}: câu ${tu(c).length} từ quá dài (>32) — giọng nói chuyện cho câu trôi dài nhưng phải bẻ vào câu ngắn: "${c.slice(0, 60)}…"`);
  const ngan = cs.filter((c) => tu(c).length <= 6).length;
  if (cs.length && ngan / cs.length < 0.2) canhBao.push(`${o}: chỉ ${ngan}/${cs.length} câu ≤ 6 từ — câu dài trôi phải bẻ vào câu ngắn (chỗ cười), mục tiêu ≥ 20%`);
  // giọng nói chuyện (cẩm nang 1c): tiếng đệm 3–6%, gọi người nghe ≥ 1, tự chửi mình ≥ 1
  // \b của JS coi chữ có dấu là ranh giới ("nhá", "đấy" không khớp) → tự dựng ranh giới bằng \p{L}
  const dem = (vo.match(/(?<![\p{L}])(nhá|đấy|ấy|xong|thế là|ờ|luôn|kiểu|nhỉ|thật ra|nói chung|mà|thì|cơ|hả|chứ|đâu)(?![\p{L}])/giu) ?? []).length;
  if (dem / Math.max(1, n) < 0.03) canhBao.push(`${o}: tiếng đệm ${dem}/${n} từ (<3%) — đọc lên như văn viết; thêm "xong nhá / đấy / ờ / kiểu" đúng chỗ`);
  if (!/(?<![\p{L}])(em ạ|các bạn|mấy bạn|anh em|bạn nào|ông nào|bà nào|mọi người|các ông|mấy ông)(?![\p{L}])/giu.test(vo)) canhBao.push(`${o}: không gọi thẳng người nghe lần nào ("em ạ", "các bạn", "anh em") — phải là nói chuyện, không phải kể suông`);
  if (!/(tôi|anh|mình|tui) (ngu|dở|tệ|ác|hèn|ngáo|điên|ngớ ngẩn|kém|nhát)|ngu (thật|vãi|chưa|người)|toang|chết dở|xong đời|tiêu rồi|nhục/iu.test(vo)) canhBao.push(`${o}: thiếu câu tự chửi mình thẳng ("anh ngu thật", "toang", "chết dở")`);
  const thoai = cs.filter((c) => /:|\b(bảo|hỏi|nói|kêu|thì thào|rep|nhắn)\b/i.test(c)).length;
  if (!BT && thoai < 2) canhBao.push(`${o}: chỉ ${thoai} câu thoại trực tiếp — cần ≥ 2 (nhân vật phải có giọng)`);
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
  if (BT && cuoi && !/(chốt lại|việc hôm nay|tóm lại|nhắc lại|gọn thôi)/i.test(cuoi.vo ?? '')) canhBao.push(`chương cuối (${cuoi.id}): bảng tin phải CHỐT việc hôm nay ("chốt lại nhá", "việc hôm nay") trước câu gọi khán giả`);
  if (cuoi && !/(bình luận|comment|điểm danh|kể cho|bạn thì sao|còn bạn|còn các bạn)/i.test(cuoi.vo ?? '')) loi.push(`chương cuối (${cuoi.id}): thiếu câu gọi khán giả ≤ 10 từ bám đúng chuyện (bình luận / điểm danh / còn bạn) — xem cẩm nang mục 2b`);
}

// callback: một từ khoá (≥4 chữ, không phải từ phổ thông) xuất hiện ở ≥2 chương trong đó có chương cuối
if (!BT && tatCaTu.length >= 3) {
  const cuoi = tatCaTu[tatCaTu.length - 1];
  const pho = new Set(['không', 'nhưng', 'người', 'được', 'chuyện', 'lúc', 'cái', 'thằng', 'này', 'đấy', 'rồi', 'thì', 'cũng', 'đang', 'phải', 'nhìn', 'bảo', 'hỏi']);
  const cb = [...cuoi].filter((t) => t.length >= 4 && !pho.has(t) && tatCaTu.slice(0, -1).filter((s) => s.has(t)).length >= 1);
  if (cb.length < 2) canhBao.push(`callback: chương cuối không nhặt lại từ khoá gieo trước — twist/callback yếu (thấy: ${cb.join(', ') || 'không có'})`);
}

/**
 * MẠCH CHUYỆN — ba phép đo bắt lỗi "chương rời nhau, không có sự kết nối".
 *
 * Vì sao cần: cổng cũ chấm TỪNG CHƯƠNG rất kỹ (số từ, câu ngắn, chi tiết, tiếng
 * đệm) nhưng KHÔNG đo quan hệ GIỮA các chương. Một kịch bản 14 chương đều đạt
 * mọi tiêu chí lẻ vẫn có thể là 14 mẩu rời — đúng lời người dùng chê: "chưa có
 * sự kết nối". Đo trên len-sai-gon bản đầu: chương "ben-xe" không chia sẻ MỘT
 * từ neo nào với chương trước nó.
 *
 * "Từ neo" = từ mang nội dung: tên riêng, đồ vật, nơi chốn, con số. KHÔNG tính
 * động từ nói năng (bảo, nói, hỏi) và từ chức năng — hai chương bất kỳ đều dùng
 * chung chúng, nên nếu tính thì phép đo luôn báo "đã nối" dù thật ra rời nhau.
 */
const TU_CHUC_NANG = new Set(
  ('mình tôi tao mày anh chị em con cái các bạn là của có không được một hai ba bốn năm sáu bảy tám chín mười và với thì mà cũng ở đi về cho nhưng rồi lại như thế này đó ấy nữa rất chỉ đã sẽ vẫn nào ra vào lên xuống nó người nhá đấy ạ ừ ờ luôn kiểu nhỉ chứ đâu ai gì sao vì tại nên hay hoặc khi lúc còn hết mới xong thật quá lắm nhiều ít bị được phải cần muốn thấy nghĩ biết nhớ quên bảo nói hỏi kêu nhắn rep trả lời cười khóc làm ăn uống ngủ ngồi đứng nằm chạy đi đứng nhìn nghe đưa cầm đặt để lấy cho tặng mất còn thêm bớt').split(' ')
);
/** tách từ mang nội dung của một chương */
const tuNeo = (vo) =>
  new Set(
    String(vo)
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !TU_CHUC_NANG.has(w))
  );
/** từ mở đầu cho biết chương này NỐI TIẾP chương trước chứ không bắt đầu lại từ đầu */
const TU_NOI = /^(xong|rồi|thế là|nhưng|mà|tới|đến|sau|hôm|tháng|tuần|năm|ngày|từ|cho tới|kể từ|được|vừa|mới|chưa|cuối|đầu|giữa|sáng|trưa|chiều|tối|đêm|tết|lúc|khi|hồi|bây giờ|giờ|cái này|chuyện|rốt cuộc|hoá ra|hóa ra|riêng|còn)/i;

if ((kb.chapters ?? []).length >= 3) {
  const neo = kb.chapters.map((c) => tuNeo(c.vo ?? ''));
  const ten = kb.chapters.map((c) => c.id);
  // 1. cầu nối giữa hai chương liền nhau
  for (let i = 1; i < neo.length; i++) {
    const chung = [...neo[i]].filter((w) => neo[i - 1].has(w));
    if (!chung.length) {
      loi.push(
        `ĐỨT MẠCH: chương "${ten[i]}" không nhắc lại một thứ nào của chương "${ten[i - 1]}" — ` +
          `người xem đang nghe một chuyện thì bị quăng sang chuyện khác. Sửa: mở chương "${ten[i]}" ` +
          `bằng một câu nhắc lại đồ vật / con số / tên riêng vừa kể.`
      );
    } else if (chung.length === 1) {
      canhBao.push(`mạch yếu: chương "${ten[i]}" chỉ nối với chương trước bằng đúng một từ ("${chung[0]}") — nên có thêm một mối`);
    }
  }
  // 2. CÂU ĐẦU của chương phải tự nó nối về chương trước.
  //    Đo bằng nội dung, không bằng từ mở đầu: "Hai triệu ấy, ở quê mình…" nối rất
  //    chặt dù không bắt đầu bằng "Xong/Rồi". Bản trước dò từ nối ở đầu câu nên báo
  //    nhầm 6/14 chương — một phép đo kêu nhiều mà sai thì người viết sẽ học cách
  //    phớt lờ cả cổng.
  for (let i = 1; i < kb.chapters.length; i++) {
    const dauCauVan = cau(kb.chapters[i].vo ?? '')[0] ?? '';
    const noiNgay = [...tuNeo(dauCauVan)].some((w) => neo[i - 1].has(w));
    const coTuNoi = TU_NOI.test(dauCauVan.trim());
    if (!noiNgay && !coTuNoi) canhBao.push(`chương "${ten[i]}" mở bằng "${dauCauVan.split(/\s+/).slice(0, 5).join(' ')}…" — câu đầu không nhắc gì tới chương trước và cũng không có từ nối; người xem phải tự bắc cầu`);
  }
  // 3. setup phải có payoff: tên riêng chỉ xuất hiện ở ĐÚNG MỘT chương = nhân vật dùng một lần rồi vứt
  const dem = new Map();
  for (const [i, c] of kb.chapters.entries()) {
    const cs = cau(c.vo ?? '');
    const dauCau = new Set(cs.map((x) => tu(x)[0]?.replace(/[^\p{L}]/gu, '')));
    // gom cụm viết hoa liên tiếp thành MỘT tên ("Miền Đông", "Sài Gòn") — tách rời
    // thì "Miền" và "Gòn" thành hai nhân vật ma, báo nhầm là gieo-không-gặt.
    // Bỏ từ đứng ngay sau "thứ"/"tháng" (thứ Bảy, tháng Tư — là ngày tháng, không phải tên).
    const cum = (c.vo ?? '').match(/(?<!(?:thứ|tháng) )\b[A-ZĐÂĂÊÔƠƯ][a-zà-ỹ]{2,}(?: [A-ZĐÂĂÊÔƠƯ][a-zà-ỹ]{2,})*/g) ?? [];
    for (const t of cum) {
      if (dauCau.has(t.split(' ')[0])) continue;
      if (!dem.has(t)) dem.set(t, new Set());
      dem.get(t).add(i);
    }
  }
  for (const [t, o] of dem) {
    if (o.size === 1 && kb.chapters.length >= 6) canhBao.push(`"${t}" chỉ xuất hiện ở một chương ("${ten[[...o][0]]}") rồi biến mất — gieo mà không gặt; nhắc lại ở chương sau hoặc bỏ hẳn`);
  }
}

// chống chép lại kịch bản đã có trong repo
for (const t of trungLap()) {
  if (t.max > 0.45) {
    loi.push(
      `TRÙNG kịch bản "${t.file}" đã có trong repo (${(t.max * 100).toFixed(0)}% chương giống nhất, ` +
        `${(t.tb * 100).toFixed(0)}% trung bình) — kịch bản trong scripts/ là VÍ DỤ, không phải bản mẫu để render lại. ` +
        `Cùng chủ đề thì phải kể chuyện khác: nhân vật khác, tình huống khác, punchline khác.`
    );
  } else if (t.max > 0.25) {
    canhBao.push(`gần giống kịch bản "${t.file}" (${(t.max * 100).toFixed(0)}%) — kiểm lại xem có đang kể lặp ý của bản đó không`);
  }
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
