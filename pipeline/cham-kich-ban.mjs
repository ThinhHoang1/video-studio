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
/**
 * Từ tục — CẢNH BÁO (không chặn). Cố tình KHÔNG có `mẹ`, `bố`: đo Mixi thì 6/541 lần `mẹ` là người
 * mẹ thật, đưa vào từ điển là bảo đảm bắt nhầm mọi kịch bản có nhân vật gia đình.
 * Cũng KHÔNG cài luật "bíp phải đứng cuối mệnh đề" — sai với chính nguồn tham
 * chiếu: 0/4 bíp trong Tuna nằm cuối mệnh đề.
 */
const TUC = new Set(['đm', 'dm', 'đmm', 'vcl', 'vl', 'cc', 'clgt', 'đéo', 'đếch', 'cặc', 'lồn', 'buồi', 'địt', 'đụ', 'cứt', 'shit', 'fuck', 'wtf']);

/**
 * MỐC VĂN HOÁ VIỆT — danh từ hữu hình của đời sống Việt (món ăn, đồ vật, nơi chốn).
 *
 * Đây là thứ phân biệt "kịch bản Việt" với "kịch bản Mỹ dịch ra": người xem cười
 * vì NHẬN RA, không vì câu đó có joke. Tuna: 13 mốc / 2871 từ = 4,5/1000.
 *
 * Cố tình KHÔNG đếm token viết hoa giữa câu (nhánh đó từng được đề xuất): hai
 * transcript tham chiếu là ASR viết hoa ngẫu nhiên ("Nối Khố", "Trong Sợ Hãi"),
 * nhánh ấy chỉ sinh rác. Danh sách này còn ngắn — bổ sung khi gặp mốc mới, đừng
 * đổi sang heuristic.
 */
const MOC_VIET = /(?<![\p{L}])(mì tôm|mì hảo hảo|hảo hảo|muối vừng|cơm tấm|bánh mì|phở|bún|xôi|chè|trà đá|cà phê sữa đá|bia hơi|nước mắm|rau muống|dưa cà|bánh chưng|bánh tét|lì xì|tết|giỗ|đám cưới|đám giỗ|chùa|đình làng|dép tổ ong|dép lê|nón lá|áo dài|xe máy|xe ôm|grab|xe khách|xe giường nằm|tàu chợ|quán net|quán cóc|vỉa hè|hẻm|ngõ|xóm trọ|phòng trọ|nhà trọ|chung cư mini|chợ|siêu thị|tạp hoá|tạp hóa|karaoke|loa kẹo kéo|ruộng|đồng|trâu|bờ đê|ao làng|giếng|sân trường|bảng đen|phấn|sổ liên lạc|khăn quàng|ghế đá|căng tin|ký túc xá|bến xe|miền tây|miền trung|sài gòn|hà nội|đà nẵng|quê|tỉnh lẻ)(?![\p{L}])/giu;

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
  // Ngưỡng ≥3 gần như không nổ: dry-run 11 kịch bản đã duyệt chỉ 3/110 chương trượt.
  // Ở ≥5 bắt 18/110 (16%) — đúng liều cho một luật cảnh báo. Xem docs/spec-cong-hai.md A1.
  if (cuThe < 5) canhBao.push(`${o}: ít chi tiết cụ thể (${cuThe}: số, tên riêng, tên app) — mục tiêu ≥ 5, thay tính từ bằng một con số lẻ hoặc một cái tên`);
  // CHẶN chữ số dạng số: đo 124/124 câu thoại của 12 kịch bản duyệt đều không có,
  // nên bật chặn không chặn ai. Là bảo hiểm TTS (đọc "5" thành "năm" sai ngữ cảnh),
  // không phải phép đo hài. Viết "hai mươi bảy", không viết "27".
  const chuSo = vo.match(/\d+/g) ?? [];
  for (const d of new Set(chuSo)) loi.push(`${o}: chữ số "${d}" trong lời đọc — TTS đọc chữ số hay sai, viết bằng chữ ("hai mươi bảy")`);
  // Từ tục là CẢNH BÁO, không chặn: tông của kênh do người viết quyết định ở câu
  // prompt, cổng chỉ báo để không ai buột ra mà không biết. Ký hiệu bíp thì khác —
  // TTS đọc "[ __ ]" thành rác nên phải bỏ, không phải vì nó tục.
  for (const t of new Set(ts.map((x) => x.toLowerCase().replace(/[^\p{L}]/gu, '')).filter((x) => TUC.has(x)))) {
    canhBao.push(`${o}: từ tục "${t}" — cố ý thì giữ, lỡ tay thì đổi`);
  }
  if (/\[\s*_+\s*\]/.test(vo)) loi.push(`${o}: ký hiệu bíp "[ __ ]" trong lời đọc — TTS đọc thành rác, viết thẳng từ hoặc đổi cách nói`);
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

/**
 * ── CỔNG HÀI (docs/spec-cong-hai.md) ─────────────────────────────────────────
 *
 * Đo trên TOÀN kịch bản, không theo chương: các cơ chế dưới đây là chuyện của
 * nhịp cả bài. Tất cả là CẢNH BÁO — mọi đề xuất CHẶN trong nghiên cứu đều chặn
 * 3–5 trên 11 kịch bản đã duyệt khi dry-run, kể cả bản đã nghiệm thu đạt chuẩn.
 * Ai muốn nâng lên CHẶN thì dry-run lại toàn corpus trước, đừng nâng bằng niềm tin.
 */
if (!BT) {
  const voTatCa = (kb.chapters ?? []).map((c) => c.vo ?? '').join(' ');
  const tsAll = tu(voTatCa);
  const nAll = tsAll.length;
  const tren1000 = (x) => (x * 1000) / Math.max(1, nAll);
  const dem = (re) => (voTatCa.match(re) ?? []).length;

  // B1 — mốc văn hoá Việt. Chống giọng dịch: người xem cười vì NHẬN RA.
  const moc = voTatCa.match(MOC_VIET) ?? [];
  if (tren1000(moc.length) < 4) {
    canhBao.push(
      `mốc văn hoá Việt ${moc.length}/${nAll} từ (${tren1000(moc.length).toFixed(1)}/1000, cần ≥4) — ` +
        `kịch bản đang đọc như bản dịch. Thay danh từ chung bằng tên thật: "mì Hảo Hảo", "xe giường nằm", "quán cóc"` +
        (moc.length ? ` (đang có: ${[...new Set(moc.map((m) => m.toLowerCase()))].slice(0, 6).join(', ')})` : '')
    );
  }

  // B2 — bẻ ngoặt phải RẢI ĐỀU. Đây là phần đáng giá duy nhất của mục bẻ ngoặt:
  // nó đo NHỊP. Không đặt ngưỡng mật độ vì `nhưng` là liên từ phổ biến nhất
  // tiếng Việt — một bài luận nghiêm túc cũng đạt 1/120.
  const BE_NGOAT = /(?<![\p{L}])(nhưng|hoá ra|hóa ra|ai ngờ|đáng nhẽ|đáng lẽ|thế mà|ngờ đâu)(?![\p{L}])/giu;
  const viTri = [];
  for (let k = 0; k < tsAll.length; k++) if (BE_NGOAT.test(tsAll[k] + ' ' + (tsAll[k + 1] ?? ''))) viTri.push(k);
  BE_NGOAT.lastIndex = 0;
  const phang = [];
  for (let d = 0; d + 250 <= nAll; d += 125) {
    if (!viTri.some((v) => v >= d && v < d + 250)) phang.push(d);
  }
  if (phang.length) {
    canhBao.push(
      `${phang.length} quãng 250 từ không có một cú bẻ ngoặt nào (bắt đầu ở từ ${phang.slice(0, 3).join(', ')}) — ` +
        `đoạn đó người xem trôi thẳng, không bị hẫng lần nào`
    );
  }

  // B7 — nối kiểu văn viết. Mixi 0/541: người kể thật không bao giờ nói "sau đó".
  const noiViet = voTatCa.match(/(?<![\p{L}])(sau đó|tiếp theo|kế tiếp|và rồi)(?![\p{L}])/giu) ?? [];
  for (const w of new Set(noiViet.map((x) => x.toLowerCase()))) {
    canhBao.push(`nối kiểu văn viết "${w}" — giọng nói dùng "xong", "thế là", "rồi"`);
  }

  // B6 — mặt dương của cùng chỉ dấu đó. Cố tình KHÔNG đếm `lại` (bắt nhầm
  // "trở lại", "quay lại", "lại thấy").
  const xong = dem(/(?<![\p{L}])xong(?![\p{L}])(?!\s+xuôi)/giu);
  if (tren1000(xong) < 6) {
    canhBao.push(`"xong" ${xong} lần (${tren1000(xong).toFixed(1)}/1000, cần ≥6) — đây là khớp nối của giọng kể miệng`);
  }

  // B9 — thán từ vấp giọng. Bỏ `à`, `ê`, `ối`, `ok`: `à mà`, `à ừ` là hư từ
  // thường, `ok` bắt trúng mọi câu chat.
  const vap = (voTatCa.match(/(^|[.!?…]\s+)(Ơ|ơ|Ờ|ờ|Ủa|ủa|uây|Uây|ê ê)(?![\p{L}])/gu) ?? []).length;
  if (tren1000(vap) < 4) {
    canhBao.push(`thán từ vấp giọng ${vap} lần (${tren1000(vap).toFixed(1)}/1000, cần ≥4) — mở câu bằng "Ơ", "Ủa" để nghe như người đang nhớ ra`);
  }

  // B4 — misdirection: câu dài dựng kỳ vọng, câu ngắn ngay sau lật nghĩa.
  const csAll = cau(voTatCa);
  let lat = 0;
  for (let k = 0; k + 1 < csAll.length; k++) {
    if (tu(csAll[k]).length > 12 && tu(csAll[k + 1]).length <= 5 && /^(Không|Hoá ra|Hóa ra|Đúng|Chả|Có|Sai)/.test(csAll[k + 1])) lat++;
  }
  if (tren1000(lat) < 1) {
    canhBao.push(`${lat} cú lật câu ngắn (cần ≥1/1000 từ) — dựng một câu dài rồi đạp bằng câu ≤5 từ: "Không." / "Hoá ra không."`);
  }

  // B11 — đổi ngôi để tự chấm điểm mình. Mục sạch nhất cả bộ: không cần từ điển
  // ngôi, tự tìm đại từ chủ đạo rồi bắt lần người kể đổi sang ngôi khác để phán
  // xét chính mình.
  const NGOI = ['tôi', 'mình', 'tao', 'tui', 'anh', 'em'];
  const demNgoi = NGOI.map((x) => [x, dem(new RegExp(`(?<![\\p{L}])${x}(?![\\p{L}])`, 'giu'))]).sort((a, b) => b[1] - a[1]);
  const chinh = demNgoi[0]?.[1] ? demNgoi[0][0] : null;
  if (chinh) {
    const thieuSo = NGOI.filter((x) => x !== chinh);
    const doi = csAll.filter(
      (c) =>
        thieuSo.some((x) => new RegExp(`(?<![\\p{L}])${x}(?![\\p{L}])`, 'iu').test(c)) &&
        /(ác|tệ|ngu|hèn|dở|khốn|thảm|nhục)/iu.test(c)
    ).length;
    if (!doi) {
      canhBao.push(`không có câu nào đổi ngôi để tự phán xét (đang xưng "${chinh}") — một lần gọi mình bằng ngôi khác kèm từ đánh giá ("thằng đó ác thật") là một điểm cười rẻ mà chắc`);
    }
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
