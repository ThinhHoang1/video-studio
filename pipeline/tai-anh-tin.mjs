/**
 * TẢI ẢNH MINH HOẠ TIN từ chính link `nguon` của kịch bản bảng tin.
 *
 *   node pipeline/tai-anh-tin.mjs <ten-ban-tin>
 *
 * Lấy thẻ og:image của trang báo — đó là ảnh toà soạn CHỌN để đại diện bài, nên
 * nó luôn đúng tin và luôn đủ to. Ảnh về nằm ở `public/tin/<du-an>/<id>.jpg`, và
 * tên miền nguồn được ghi thẳng vào kịch bản (`anh_nguon`) để renderer in lên màn.
 *
 * ─ BẢN QUYỀN, đọc trước khi dùng ─
 * Ảnh báo KHÔNG phải của mình. Dùng được ở đây vì đây là trích dẫn tin có dẫn
 * nguồn — và chỉ đúng khi giữ đủ ba điều:
 *   1. Luôn hiện TÊN NGUỒN trên màn (renderer tự làm nếu có `anh_nguon`).
 *   2. Ảnh phụ hoạ cho tin đang nói, không cắt ghép thành ảnh khác.
 *   3. Nguồn nào ghi cấm dùng lại thì bỏ, đừng cãi.
 * Bản tin thương mại hoá thì phải xin phép hoặc mua ảnh — script này không lo hộ
 * chuyện đó, nó chỉ tải và ghi công.
 */
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync, mkdirSync, existsSync} from 'node:fs';
import path from 'node:path';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const TEN = process.argv[2];
if (!TEN) {
  console.error('Thiếu tên. Ví dụ: node pipeline/tai-anh-tin.mjs ban-tin-2026-09-14');
  process.exit(1);
}
const duongKb = path.join(ROOT, `scripts/${TEN}.json`);
const kb = JSON.parse(readFileSync(duongKb, 'utf8'));
const DU_AN = kb.project ?? TEN;
const THU_MUC = path.join(ROOT, 'public/tin', DU_AN);
const CAP = 8 * 1024 * 1024;
/** Ảnh phụ tối đa mỗi tin. 8 hình × ~2 giây = 16 giây, đủ cho một tin. */
const THEM_TOI_DA = Number(process.env.ANH_THEM ?? 8);

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';

/** og:image → twitter:image → link rel=image_src. Trang Việt hay thiếu cái đầu. */
const timAnh = (html, goc) => {
  const mau = [
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i,
  ];
  for (const re of mau) {
    const m = re.exec(html);
    if (m) {
      try {
        return new URL(m[1], goc).toString();
      } catch {
        /* link rác, thử mẫu sau */
      }
    }
  }
  return null;
};

/**
 * MỌI ảnh trong thân bài, không chỉ og:image.
 *
 * Vì sao cần: một bản tin một tin dài 30 giây mà chỉ có MỘT tấm ảnh thì cả
 * video là một tấm ảnh phóng chậm. Đo bản render đầu: board khai 21 shot, máy
 * dò được đúng 4 cú cắt nhìn thấy — 17 cú cắt kia cắt từ ảnh A sang chính ảnh A.
 * Short thể thao triệu view cắt 1.7–3.1 giây một lần, và mỗi lần là một HÌNH
 * KHÁC: nhiều ảnh của cùng một câu chuyện, không phải một ảnh giữ suốt.
 *
 * Lấy trong thân bài chứ không lấy cả trang: ảnh ở sidebar là tin khác.
 */
const timAnhThan = (html, goc) => {
  const ra = [];
  const re = /<img[^>]+(?:data-src|data-original|src)=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html))) {
    let u = m[1].trim();
    if (/^data:/i.test(u)) continue;
    // Ảnh BÀI có đường dẫn ngày tháng hoặc /Uploaded/ — đó là cách mọi CMS báo
    // Việt đặt file. Mọi thứ khác (logo, icon mạng xã hội, ảnh tác giả, banner
    // quảng cáo) nằm ở /image/ hoặc static host, và không có ngày.
    if (!/\/\d{4}\/\d{1,2}\/\d{1,2}\/|\/Uploaded\//i.test(u)) continue;
    if (/(authors?|avatar|logo|icon|banner|ads?|sprite|placeholder)/i.test(u)) continue;
    // /zoom/205_128/ là bản thu nhỏ cho ô tin liên quan — bỏ luôn, khỏi tải về
    // rồi mới đo. /thumb_w/640/ thì nâng lên bản to: cùng file, chỉ khác bề rộng.
    const z = /\/zoom\/(\d+)_(\d+)\//.exec(u);
    if (z && Number(z[1]) < 600) continue;
    u = u.replace(/\/thumb_w\/\d+\//, '/thumb_w/1200/');
    try {
      ra.push(new URL(u, goc).toString());
    } catch {
      /* link rác */
    }
  }
  return [...new Set(ra)];
};

const tenMien = (u) => {
  try {
    return new URL(u).hostname.replace(/^www\./, '');
  } catch {
    return u;
  }
};


/** Đọc kích thước ảnh từ chính bytes — không cần thư viện. JPEG + PNG là đủ. */
const coAnh = (buf) => {
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return {w: buf.readUInt32BE(16), h: buf.readUInt32BE(20)}; // PNG IHDR
  }
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) { i++; continue; }
      const m = buf[i + 1];
      // SOF0..SOF15 trừ DHT/JPG/DAC — khung chứa kích thước thật
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
        return {h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7)};
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  return null;
};

/**
 * Link TRANG CHỦ không phải link tin. og:image của trang chủ là logo hoặc ảnh
 * quảng bá — dán nó lên bản tin là sai hẳn nội dung. Đo thật: bản tin 24h dựng
 * đầu tiên có mo-bai và ket cùng trỏ 24h.com.vn, ra hai ảnh y hệt nhau 20 KB.
 */
const laTrangChu = (u) => {
  let duong = '';
  try {
    duong = new URL(u).pathname.replace(/\/+$/, '');
  } catch {
    return true;
  }
  const cuoi = duong.split('/').filter(Boolean).pop() ?? '';
  if (!cuoi) return true;
  const soGach = (cuoi.match(/-/g) ?? []).length;
  // Cùng luật với cham-kich-ban.mjs: báo Việt dùng đường dẫn phẳng nên không
  // đếm số đoạn được, phải nhìn vào chính cái slug.
  return !((cuoi.length >= 20 && soGach >= 3) || /\d{5,}/.test(cuoi) || (/\.(html?|htm)$/i.test(cuoi) && soGach >= 2));
};

const tai = async (url) => {
  const r = await fetch(url, {headers: {'user-agent': UA, accept: '*/*'}, redirect: 'follow'});
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r;
};

mkdirSync(THU_MUC, {recursive: true});
let xong = 0;
let bo = 0;
/** vân tay ảnh đã dùng → id tin, để chặn hai tin cùng một ảnh */
const daDung = new Map();

for (const ch of kb.chapters ?? []) {
  const nguon = (ch.nguon ?? []).find((u) => /^https?:\/\//.test(String(u)));
  if (!nguon) continue;
  const dich = path.join(THU_MUC, `${ch.id}.jpg`);
  const tuongDoi = path.posix.join('tin', DU_AN, `${ch.id}.jpg`);

  if (existsSync(dich)) {
    daDung.set(createHash('sha1').update(readFileSync(dich)).digest('hex'), ch.id);
    ch.anh = tuongDoi;
    ch.anh_nguon = ch.anh_nguon ?? tenMien(nguon);
    console.log(`  ✓ ${ch.id} — đã có, bỏ qua`);
    xong++;
    continue;
  }

  try {
    if (laTrangChu(nguon)) {
      throw new Error('link trang chủ, không phải link bài — ảnh sẽ là logo, không phải ảnh tin');
    }
    const trang = await tai(nguon);
    const html = await trang.text();
    const anh = timAnh(html, nguon);
    if (!anh) throw new Error('trang không khai og:image');

    const r = await tai(anh);
    const loai = r.headers.get('content-type') ?? '';
    if (!/^image\//.test(loai)) throw new Error(`không phải ảnh (${loai})`);
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length > CAP) throw new Error(`ảnh ${(buf.length / 1048576).toFixed(1)} MB, quá ${CAP / 1048576} MB`);
    if (buf.length < 4096) throw new Error('ảnh quá nhỏ, nhiều khả năng là logo hoặc pixel đếm');

    // Ảnh nhỏ là logo hoặc icon chia sẻ, không phải ảnh bài. Khung tin chiếm
    // 0.88 W của khung 1920 nên dưới 600 px là vỡ hạt khi phóng.
    const kt = coAnh(buf);
    if (kt && (kt.w < 600 || kt.h < 340)) {
      throw new Error(`ảnh chỉ ${kt.w}×${kt.h} — quá nhỏ cho khung tin, nhiều khả năng là logo`);
    }

    // HAI TIN KHÔNG ĐƯỢC DÙNG CHUNG MỘT ẢNH. Đo thật: tin-1 và tin-5 trỏ cùng
    // một bài nên ra hai khung y hệt nhau, người xem tưởng video bị lặp.
    const van = createHash('sha1').update(buf).digest('hex');
    if (daDung.has(van)) {
      throw new Error(`ảnh trùng với tin "${daDung.get(van)}" — hai tin cùng nguồn thì chọn bài khác`);
    }
    daDung.set(van, ch.id);

    writeFileSync(dich, buf);
    ch.anh = tuongDoi;
    ch.anh_nguon = tenMien(nguon);
    console.log(`  ✓ ${ch.id} — ${(buf.length / 1024).toFixed(0)} KB từ ${ch.anh_nguon}`);
    xong++;

    // ── ảnh phụ trong thân bài ──
    // Mỗi shot một hình khác thì cú cắt mới nhìn thấy được. Tối đa THEM_TOI_DA
    // để không biến bản tin thành album, và vẫn qua luật bản quyền: cùng một bài,
    // cùng một nguồn, trích dẫn có ghi công.
    const them = [];
    for (const link of timAnhThan(html, nguon)) {
      if (them.length >= THEM_TOI_DA) break;
      try {
        const rr = await tai(link);
        if (!/^image\//.test(rr.headers.get('content-type') ?? '')) continue;
        const b = Buffer.from(await rr.arrayBuffer());
        if (b.length < 8192 || b.length > CAP) continue;
        const k = coAnh(b);
        if (!k || k.w < 600 || k.h < 340) continue;
        const v = createHash('sha1').update(b).digest('hex');
        if (daDung.has(v)) continue;
        daDung.set(v, ch.id);
        const ten = `${ch.id}-${them.length + 2}.jpg`;
        writeFileSync(path.join(THU_MUC, ten), b);
        them.push(path.posix.join('tin', DU_AN, ten));
      } catch {
        /* ảnh nào hỏng thì bỏ, không chặn */
      }
    }
    if (them.length) {
      ch.anh_them = them;
      console.log(`    + ${them.length} ảnh phụ trong thân bài — mỗi shot một hình khác`);
    }
  } catch (e) {
    // Thiếu ảnh KHÔNG chặn: bản tin vẫn dựng được bằng hình vẽ. Nhưng phải nói ra,
    // vì tin có ảnh thật luôn đáng tin hơn tin chỉ có hình hoạt hình.
    console.log(`  ⚠ ${ch.id} — ${e.message} → tin này dựng bằng hình vẽ`);
    bo++;
  }
}

writeFileSync(duongKb, `${JSON.stringify(kb, null, 2)}\n`);
console.log(`\n→ ${xong} ảnh trong public/tin/${DU_AN}/ · ${bo} tin không có ảnh`);
if (xong) console.log('  Tên nguồn đã ghi vào kịch bản (anh_nguon) — renderer in lên màn, đừng xoá.');
