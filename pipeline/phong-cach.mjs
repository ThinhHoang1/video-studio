/**
 * PHONG CÁCH ĐỌC — giọng + tông cho từng định dạng, chọn một lần trên dashboard.
 *
 *   node pipeline/phong-cach.mjs                      → xem đang để gì
 *   node pipeline/phong-cach.mjs ban-tin nghiem-tuc   → đổi
 *
 * Vì sao phải là THIẾT LẬP chứ không phải câu dặn trong chat: trường `style` nằm
 * trong từng file kịch bản, nên mỗi lần agent viết kịch bản mới nó lại chép lại
 * đoạn style cũ — và đoạn style cũ là giọng kể chuyện tưng tửng. Người dùng đổi
 * "cho tôi giọng nghiêm túc" thì được đúng một video, video sau lại như cũ. Đã
 * xảy ra đúng như vậy: đổi giọng bản tin sang Charon rồi mà lần dựng sau vẫn ra
 * giọng cũ vì kịch bản mới chép style cũ.
 *
 * Nên file này là NGUỒN SỰ THẬT: `tts-gemini.mjs` đọc nó và ĐÈ lên `voice`/`style`
 * của kịch bản, trừ khi kịch bản khai `giu_giong: true` (cố ý muốn khác).
 */
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const DUONG = path.join(ROOT, 'phong-cach.json');

/** Giọng Gemini TTS — xem thu-vien.json:giong_tts */
export const GIONG = {
  Puck: 'nam, tưng tửng, năng lượng cao',
  Fenrir: 'nam, hào hứng, bốc',
  Charon: 'nam, trầm, chắc',
  Kore: 'nữ, rõ ràng',
  Aoede: 'nữ, nhẹ nhàng',
};

const NHIP_CHUNG =
  'Câu ngắn đọc DỨT. Ngắt rõ giữa các ý. Nhấn vào TÊN RIÊNG và CON SỐ. ' +
  'Tiếng Việt giọng Bắc, tự nhiên, không đọc như máy.';

/**
 * Ba tông. Mỗi tông là một đoạn dặn ĐẦY ĐỦ cho TTS — không ghép mảnh, vì ghép
 * mảnh thì câu dặn mâu thuẫn nhau và model chọn bừa.
 */
export const TONG = {
  'nghiem-tuc': {
    ten: 'Nghiêm túc',
    moTa: 'người dẫn tin — rõ, chắc, không đùa',
    giongHop: 'Charon',
    style:
      'Bạn là người dẫn bảng tin của một kênh tin công nghệ Việt. Giọng trưởng thành, RÕ RÀNG, CHẮC. ' +
      'Tốc độ vừa phải, nhanh hơn phát thanh viên truyền hình một chút nhưng KHÔNG hấp tấp. ' +
      'Không cợt nhả, không cười, không tưng tửng. Mỗi ý mở bằng nhịp hơi cao rồi đi xuống, hạ giọng cuối câu cho dứt khoát. ' +
      'Chỗ cảnh báo thì trầm và chậm lại một nhịp. Chỗ việc-cần-làm thì rõ và chắc như một lời dặn. ' +
      NHIP_CHUNG,
  },
  'soi-noi': {
    ten: 'Sôi nổi',
    moTa: 'bản tin nhanh — dồn dập, nhấn mạnh, vẫn là tin',
    giongHop: 'Fenrir',
    style:
      'Bạn là người dẫn bản tin nhanh của một kênh tin công nghệ trẻ. Giọng nam, NĂNG LƯỢNG CAO, nói nhanh và dứt khoát, ' +
      'như đang đọc tin nóng vừa về. Tốc độ nhanh hơn phát thanh viên truyền hình khoảng 25%. ' +
      'Nhấn MẠNH vào con số và tên riêng, đẩy cao ở đầu mỗi tin rồi hạ gọn ở cuối câu. ' +
      'Chỗ cảnh báo thì gằn giọng lại. Chỗ việc-cần-làm thì đọc chắc như ra lệnh. ' +
      'Có năng lượng nhưng KHÔNG cợt nhả, không cười, không kể lể — vẫn là tin, không phải vlog. ' +
      NHIP_CHUNG,
  },
  'hai-huoc': {
    ten: 'Hài hước',
    moTa: 'kể cho hội bạn nghe — tưng tửng, có punchline',
    giongHop: 'Fenrir',
    style:
      'Bạn là YouTuber kể chuyện bằng hoạt hình, đang kể cho hội bạn thân nghe một chuyện vừa xảy ra sáng nay. ' +
      'Giọng nam trẻ, NĂNG LƯỢNG CAO, nói nhanh, hào hứng. Tốc độ nhanh hơn bình thường 20%. ' +
      'Lên giọng bất ngờ ở chỗ ngạc nhiên, hạ giọng thì thào ở chỗ bí mật, cười khẽ khi tự thấy mình ngớ ngẩn. ' +
      'Câu chốt đọc dứt khoát như đấm punchline. Tuyệt đối không đọc đều đều, không trầm buồn. ' +
      NHIP_CHUNG,
  },
  'nhe-nhang': {
    ten: 'Nhẹ nhàng',
    moTa: 'tâm sự — chậm, ấm, không kịch',
    giongHop: 'Aoede',
    style:
      'Bạn đang kể một chuyện riêng cho một người bạn ngồi cạnh. Giọng ấm, chậm vừa, thân mật. ' +
      'Không cao giọng, không diễn, không kịch tính hoá. Chỗ buồn thì để im một nhịp rồi kể tiếp. ' +
      'Chỗ vui thì cười nhẹ trong giọng, không cười to. ' +
      NHIP_CHUNG,
  },
};

export const MAC_DINH = {
  'ban-tin': {giong: 'Fenrir', tong: 'soi-noi'},
  'ke-chuyen': {giong: 'Fenrir', tong: 'hai-huoc'},
};

export const doc = () => {
  if (!existsSync(DUONG)) return {...MAC_DINH};
  try {
    return {...MAC_DINH, ...JSON.parse(readFileSync(DUONG, 'utf8'))};
  } catch {
    return {...MAC_DINH};
  }
};

export const ghi = (dinhDang, {giong, tong}) => {
  const hien = doc();
  if (!MAC_DINH[dinhDang]) throw new Error(`định dạng lạ: ${dinhDang} (chỉ có ban-tin, ke-chuyen)`);
  if (giong && !GIONG[giong]) throw new Error(`giọng lạ: ${giong} (có: ${Object.keys(GIONG).join(', ')})`);
  if (tong && !TONG[tong]) throw new Error(`tông lạ: ${tong} (có: ${Object.keys(TONG).join(', ')})`);
  hien[dinhDang] = {giong: giong ?? hien[dinhDang].giong, tong: tong ?? hien[dinhDang].tong};
  writeFileSync(DUONG, `${JSON.stringify(hien, null, 2)}\n`);
  return hien[dinhDang];
};

/** Giọng + đoạn dặn cho một kịch bản. Kịch bản khai `giu_giong: true` thì giữ nguyên của nó. */
export const apDung = (kb) => {
  if (kb.giu_giong) return {voice: kb.voice, style: kb.style, tuKichBan: true};
  const dinhDang = kb.dinh_dang === 'ban-tin' ? 'ban-tin' : 'ke-chuyen';
  const {giong, tong} = doc()[dinhDang];
  return {voice: giong, style: TONG[tong].style, tuKichBan: false, tong, dinhDang};
};

if (process.argv[1]?.endsWith('phong-cach.mjs')) {
  const [dinhDang, tong, giong] = process.argv.slice(2);
  if (!dinhDang) {
    const h = doc();
    for (const [k, v] of Object.entries(h)) {
      console.log(`${k.padEnd(11)} giọng ${v.giong.padEnd(8)} · tông ${TONG[v.tong]?.ten ?? v.tong} — ${TONG[v.tong]?.moTa ?? ''}`);
    }
    console.log('\nĐổi: node pipeline/phong-cach.mjs <ban-tin|ke-chuyen> <nghiem-tuc|hai-huoc|nhe-nhang> [giọng]');
    console.log(`Giọng: ${Object.entries(GIONG).map(([k, v]) => `${k} (${v})`).join(' · ')}`);
  } else {
    const moi = ghi(dinhDang, {tong, giong: giong ?? (tong ? TONG[tong].giongHop : undefined)});
    console.log(`✓ ${dinhDang}: giọng ${moi.giong}, tông ${TONG[moi.tong].ten}`);
  }
}
