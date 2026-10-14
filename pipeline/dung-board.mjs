/**
 * DỰNG BOARD BÁM LỜI — chọn bối cảnh / prop / ô chèn theo CHÍNH CÂU ĐANG NÓI.
 *
 *   node pipeline/dung-board.mjs <ten>
 *
 * Vì sao có file này: bản board đầu tiên tôi sinh bằng cách rải shot theo CHỈ SỐ
 * — chương này bối cảnh A, shot chẵn thì zoom, shot thứ ba thì chèn. Kết quả bị
 * chê đúng chỗ đau nhất: "cảnh chẳng liên quan gì tới câu chuyện đang nói".
 * Đúng vậy: máy không hề đọc câu. Ở đây mỗi shot tra TỪ KHOÁ trong `say` để
 * quyết bối cảnh, prop, đồ cầm, và ô chèn — nếu câu nói về điện thoại thì trong
 * khung phải có điện thoại, không phải vì shot đó là shot thứ ba.
 *
 * Đây là bản nháp có nghĩa, không phải bản cuối: người viết vẫn nên sửa tay
 * những shot mình muốn diễn kỹ.
 */
import {readFileSync, writeFileSync, mkdirSync, existsSync} from 'node:fs';
import path from 'node:path';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const TEN = process.argv[2];
if (!TEN) { console.error('Thiếu tên. Ví dụ: node pipeline/dung-board.mjs hen-ho-dau'); process.exit(1); }
const kb = JSON.parse(readFileSync(path.join(ROOT, `scripts/${TEN}.json`), 'utf8'));
const DU_AN = kb.project ?? TEN;

/** từ khoá → bối cảnh. Câu nào khớp thì shot đó đổi cảnh. */
const CANH_THEO_LOI = [
  [/quán|bia hơi|nhậu|bàn|gọi món|thực đơn|hoá đơn|tính tiền|món/i, 'quan-nhau'],
  [/xe|đường|phố|tắc|chở|ngõ|đèn/i, 'duong-pho'],
  [/nhắn|chát|điện thoại|tin|mã|quét/i, 'man-hinh-dien-thoai'],
  [/nhà|phòng|trọ|giường|nằm/i, 'phong-ngu'],
  [/cà phê|trà sữa|hẹn/i, 'quan-cafe'],
  [/chợ|mua/i, 'cho'],
];
/** từ khoá → prop đặt trong khung (tối đa 2 mỗi shot) */
const PROP_THEO_LOI = [
  [/điện thoại|nhắn|gọi|mã|quét/i, 'dien-thoai'],
  [/thẻ|quẹt/i, 'the-nhan-vien'],
  [/tiền|nghìn|tài khoản|bo|trả/i, 'tien-giay'],
  [/hoá đơn|tính tiền|thực đơn|giấy/i, 'to-giay'],
  [/xe|wave|xăng|chở/i, 'xe-may'],
  [/mèo/i, 'ghe-nha-hang'],
  [/bia|nhậu|bàn|món|ăn/i, 'ban-nhau'],
  [/đèn|phố|ngõ/i, 'den-duong'],
  [/mẹ/i, 'bat-pho'],
  [/đồng hồ|phút|giờ/i, 'dong-ho'],
];
/** từ khoá → đồ cầm trên tay */
const CAM_THEO_LOI = [
  [/điện thoại|nhắn|gọi|quét|mã/i, 'dien-thoai'],
  [/thực đơn|giấy|hoá đơn/i, 'sach'],
  [/trà sữa|uống|ly/i, 'ly-tra-sua'],
];
/** câu có tín hiệu CƯỜI → đây là chỗ đặt ô chèn / thẻ chữ, không phải shot thứ ba */
const LA_PUNCHLINE = /toang|ngu thật|dở thật|nhục|chả |không hề|hoá ra|ai ngờ|thế mà|độn thổ|chết trong lòng|phép màu|đúng như|cái gì thì/i;

/** nền mặc định của bản tin — tối, không trắng */
const NEN_TIN = {tren: '#101726', duoi: '#1b2740'};

const CO_THEO_LOAI = {'truc-dien': 'can', 'phan-ung': 'sat', 'minh-hoa': 'trung', 'dac-ta': 'sat'};
/** từ khoá → mẫu hành động. Nhân vật làm ĐÚNG việc câu đang kể, không phải cử chỉ rải đều. */
const MAU_THEO_LOI = [
  [/tít|kêu|giật|bất ngờ|ngẩng/i, 'giat-minh'],
  [/chả |không |chưa |chối/i, 'lac-dau'],
  [/gật|ừ|đồng ý|vâng/i, 'gat-gu'],
  [/chạy|vội|lao/i, 'chay-den'],
  [/đi |chở|về |ra /i, 'di-bo'],
  [/nhìn|quay|ngó|tìm/i, 'nhin-quanh'],
  [/cười|vui|reo/i, 'cuoi-lan'],
  [/run|sợ|lo|nhục/i, 'run'],
  [/gọi|nhắn|bấm/i, 'go-ban'],
];
/** câu nào nên nhìn nghiêng: có đối thoại hai chiều hoặc hành động hướng về người kia */
const NGHIENG = /bảo|nói|hỏi|nhắn|trả lời|quay|nhìn/i;
/**
 * Càng nhiều tư thế càng đỡ cảm giác "hai hình nộm đứng đọc". Bảng chấm đòi ≥ 15
 * tư thế khác nhau trong cả phim; hai danh sách dưới đây phải cộng lại vượt mốc
 * đó, nếu không thì kịch bản nào cũng trượt đúng một dòng vì thư viện tư thế
 * dùng chưa hết (thu-vien-v2.json có 44 tư thế, bản trước dùng 14).
 */
/**
 * KHO TƯ THẾ CHỈ CHỨA DÁNG ĐỨNG TRUNG TÍNH.
 *
 * Kho là chỗ BỐC NGẪU NHIÊN khi câu không nói gì về dáng, nên mọi thứ trong kho
 * phải đúng với bất kỳ câu nào. `ngoiGuc` (gục xuống), `omDau`, `cuiNguoi` không
 * như thế: chúng là dáng kịch tính, đúng ở một câu và sai ở chín câu còn lại.
 * Đo thật — cú cao trào render ra Hà GẬP NGƯỜI như sắp ngất trong khi lời thoại
 * là nó đang đứng cười hỏi lại. Dáng kịch tính chỉ được vào khung khi CÂU gọi
 * tên nó, tức là qua bảng DANG_THEO_LOI bên dưới.
 */
const DANG_NOI = ['dung', 'chi', 'gioTay', 'nhunVai', 'tayHong', 'haiTayXoe', 'chongCam', 'motTayHong', 'chiLen', 'vayTay', 'dungNghieng'];
const DANG_PU = ['soCam', 'cheMieng', 'gaiDau', 'khoanhTay', 'goMay', 'bitMieng', 'chapTay', 'nhunVai', 'dung'];

/**
 * ── TƯ THẾ THEO NGHĨA CỦA CÂU ───────────────────────────────────────────
 *
 * Trước đây tư thế chọn bằng `DANG_NOI[(i + j) % 12]` — quay vòng theo chỉ số.
 * Hai hệ quả, người xem chỉ ra cả hai:
 *   · "animation toàn lặp đi lặp lại": mười hai tư thế chạy đúng một thứ tự,
 *     lặp lại ba mươi lần trong một phim mười phút. Mắt bắt được chu kỳ.
 *   · "animation không đúng kịch bản": chỉ số shot chẳng liên quan gì tới câu
 *     đang nói, nên nhân vật chống cằm lúc đang bỏ chạy.
 *
 * Giờ: tra nghĩa trước. Không khớp thì mới lấy trong kho, và lấy theo cách
 * KHÔNG lặp trong cửa sổ gần đây.
 */
/**
 * LÔNG MÀY THEO NGHĨA CÂU.
 *
 * Đo thật: 0/112 diễn viên và 0/224 mốc act của board máy sinh khai `may` —
 * cả phim không một sợi lông mày. Rig giờ mặc định vẽ mày nghỉ (`thuong`);
 * bảng này chồng cảm xúc lên trên đúng chỗ câu nói tới.
 */
const MAY_THEO_LOI = [
  [/(?<![\p{L}])(chửi|cáu|tức|gắt|rít|quát|ác)(?![\p{L}])/iu, 'tuc'],
  [/(?<![\p{L}])(khóc|sưng|nghẹn|lo|sợ|run|hoảng|buồn)(?![\p{L}])/iu, 'lo'],
  [/(?<![\p{L}])(nghĩ|đếm|khó|không hiểu|chả hiểu|nhíu|tắc)(?![\p{L}])/iu, 'nhiu'],
  [/(?<![\p{L}])(ơ|ủa|hoá ra|hóa ra|ai ngờ|thế mà|hỏi|thật à|lạ)(?![\p{L}])/iu, 'nhuong'],
];

const DANG_THEO_LOI = [
  // Tiếng Việt không có ranh giới từ kiểu \b, nên phải tự dựng bằng lookaround.
  // Bỏ bước này thì "gốc bàng" khớp luật /bàn/ và nhân vật đang đứng ngoài sân
  // bị cho ngồi vào bàn học — đã xảy ra đúng ở cú cao trào.
  [/(?<![\p{L}])(chỉ tay|kia kìa|đây này|nhìn kìa)(?![\p{L}])/iu, 'chi'],
  [/(?<![\p{L}])(ôm đầu|toang|chết dở|tiêu rồi|hỏng rồi)(?![\p{L}])/iu, 'omDau'],
  [/(?<![\p{L}])(khoanh tay|lạnh|không thèm|mặc kệ)(?![\p{L}])/iu, 'khoanhTay'],
  [/(?<![\p{L}])(nhún|kệ|ai biết|chả biết|biết đâu)(?![\p{L}])/iu, 'nhunVai'],
  [/(?<![\p{L}])(giơ tay|thưa|xin phép)(?![\p{L}])/iu, 'gioTay'],
  [/(?<![\p{L}])(thì thào|khẽ|nói nhỏ)(?![\p{L}])/iu, 'cheMieng'],
  [/(?<![\p{L}])(ngượng|ngại|lúng túng|gãi đầu)(?![\p{L}])/iu, 'gaiDau'],
  [/(?<![\p{L}])(cúi xuống|nhặt|xin lỗi)(?![\p{L}])/iu, 'cuiNguoi'],
  [/(?<![\p{L}])(chạy|lao|vội)(?![\p{L}])/iu, 'chay1'],
  [/(?<![\p{L}])(ngồi|chép|viết bài|bàn học)(?![\p{L}])/iu, 'ngoiGoBan'],
  [/(?<![\p{L}])(bảng|phấn|chữa câu)(?![\p{L}])/iu, 'vietBang'],
  [/(?<![\p{L}])(khóc|bật khóc|nghẹn|gục)(?![\p{L}])/iu, 'ngoiGuc'],
  [/(?<![\p{L}])(đứng im|tắc|đứng hình)(?![\p{L}])/iu, 'dung'],
  [/(?<![\p{L}])(vẫy|tạm biệt)(?![\p{L}])/iu, 'vayTay'],
  [/(?<![\p{L}])(nghĩ|đếm|tự hỏi)(?![\p{L}])/iu, 'chongCam'],
  [/(?<![\p{L}])(sợ|run|hoảng)(?![\p{L}])/iu, 'soCam'],
  [/(?<![\p{L}])(vỗ vai|khoác vai)(?![\p{L}])/iu, 'khoacVai'],
];

/**
 * Bốc một tư thế trong kho sao cho KHÔNG trùng bốn lần gần nhất. Dùng bước nhảy
 * nguyên tố cùng nhau với độ dài kho nên nó quét hết kho trước khi quay lại,
 * mà thứ tự không phải 0,1,2,3 — thứ tự tuần tự chính là thứ mắt bắt được.
 */
const boc = (kho, hat, vuaDung) => {
  for (let k = 0; k < kho.length; k++) {
    const t = kho[(hat * 7 + k * 5) % kho.length];
    if (!vuaDung.includes(t)) return t;
  }
  return kho[hat % kho.length];
};

/**
 * BẢNG TỪ KHOÁ RIÊNG CỦA DỰ ÁN — `src/projects/<du-an>/tu-khoa.json`.
 *
 * Bảng dùng chung ở trên học từ một chuyện đi nhậu, nên `/bàn/` cho ra bối cảnh
 * `quan-nhau`. Đem nguyên bảng đó sang một chuyện lớp học thì "bàn bốn" hoá
 * thành bàn nhậu — đúng lại lỗi "cảnh chẳng liên quan gì tới câu chuyện đang
 * nói", chỉ khác là lần này sai một cách có hệ thống.
 *
 * Nên mỗi dự án khai được bảng của riêng nó, và bảng đó ĐỨNG TRƯỚC bảng chung:
 * từ vựng của chính câu chuyện thắng từ vựng mặc định. Dạng file:
 *   {"canh": [["bảng|phấn|tiết", "lop-hoc"]], "prop": [...], "cam": [...], "mau": [...]}
 */
const rieng = (() => {
  const duong = path.join(ROOT, `src/projects/${DU_AN}/tu-khoa.json`);
  if (!existsSync(duong)) return {canh: [], prop: [], cam: [], mau: []};
  const j = JSON.parse(readFileSync(duong, 'utf8'));
  const doc1 = (m) => (m ?? []).map(([re, v]) => [new RegExp(re, 'i'), v]);
  return {canh: doc1(j.canh), prop: doc1(j.prop), cam: doc1(j.cam), mau: doc1(j.mau), mac_dinh: j.mac_dinh};
})();
CANH_THEO_LOI.unshift(...rieng.canh);
PROP_THEO_LOI.unshift(...rieng.prop);
CAM_THEO_LOI.unshift(...rieng.cam);
MAU_THEO_LOI.unshift(...rieng.mau);

const tra = (bang, s, mac) => (bang.find(([re]) => re.test(s)) ?? [null, mac])[1];

const cau = (vo, day = false) => {
  const tho = vo.split(/(?<=[.!?…])\s+/).map((c) => c.trim()).filter(Boolean);
  const ra = [];
  for (const c of tho) {
    // Bản tin cắt DÀY hơn kể chuyện: mỗi mệnh đề một khung, vì người xem tin
    // nhìn hình để xác nhận điều vừa nghe. Đo 24h/BeatVN: gần như mỗi vế câu
    // một hình. `day` bật cho định dạng ban-tin.
    if (day && c.split(/\s+/).length > 4) {
      // Cắt ở dấu phẩy VÀ ở các từ nối — bản tin cần mỗi ý một hình, câu dài mà
      // không có phẩy vẫn phải tách, nếu không chương ra 2.7 giây một shot.
      let p = c
        .split(/(?<=[,:])\s+|\s+(?=(?:và|nhưng|xong|rồi|thì|mà|nên|để|vì|là)\s)/i)
        .map((x) => x.trim())
        .filter(Boolean);
      // Câu dài mà không có chỗ nào để cắt (không phẩy, không từ nối) thì bẻ đôi
      // ở giữa. Bản tin đọc giọng dẫn chậm hơn giọng kể; để nguyên thì ra 3 giây
      // một khung, người xem Short bỏ đi trước khi hết tin.
      // Ngưỡng 8 từ, không phải 10: giọng bản tin "sôi nổi" đọc ~3.5 từ/giây,
      // nên 9 từ đã là 2.6 giây — vượt trần 2.5 giây/shot đo được ở nhóm triệu
      // view (nhóm đáy: 13–178 giây một khung). Cắt đều thành các mẩu ≤ 7 từ.
      p = p.flatMap((x) => {
        const tu = x.split(/\s+/);
        if (tu.length <= 8) return [x];
        const phan = Math.ceil(tu.length / 7);
        const buoc = Math.ceil(tu.length / phan);
        const ra = [];
        for (let k = 0; k < tu.length; k += buoc) ra.push(tu.slice(k, k + buoc).join(' '));
        return ra;
      });
      // Mẩu dưới 3 từ thì gộp vào mẩu trước: "Ơ," đứng riêng thành shot 0.1 s,
      // ngắn hơn cả shot ngắn nhất renderer cho phép.
      // Mẩu dưới 4 từ phải dính vào mẩu bên cạnh: "Ơ," đứng riêng thành shot
      // 0.1 giây, ngắn hơn cả shot ngắn nhất renderer cho phép (0.25 s). Mẩu ĐẦU
      // thì gộp xuôi vào mẩu sau, các mẩu khác gộp ngược lên mẩu trước.
      const gop = [];
      let treo = '';
      for (const x of p) {
        const cx = treo ? `${treo} ${x}` : x;
        if (!gop.length && cx.split(/\s+/).length < 3) { treo = cx; continue; }
        treo = '';
        if (gop.length && cx.split(/\s+/).length < 3) gop[gop.length - 1] += ' ' + cx;
        else gop.push(cx);
      }
      if (treo) gop.push(treo);
      ra.push(...(gop.length > 1 ? gop : [c]));
      continue;
    }
    // Ngưỡng 9 từ, không phải 11: giọng kể chạy ~3.4 từ/giây nên câu 11 từ đã là
    // 3.2 giây một khung — quá mốc "≥ 1 shot mỗi 2.5 giây" của cổng nhịp, và đo
    // thật thì bốn chương trượt đúng vì thế. 9 từ ≈ 2.6 giây, cắt xong còn ~1.3.
    if (c.split(/\s+/).length > 9) {
      let p = c.split(/(?<=,)\s+/).map((x) => x.trim()).filter(Boolean);
      // Câu dài mà KHÔNG có dấu phẩy thì cắt theo phẩy chẳng ra gì, và nó ở
      // nguyên một khối. Đo thật: "Sáng hôm sau tôi mở hộp bút cũ tìm thêm thì
      // thấy một mẩu giấy gấp tư." — mười bảy từ, không một dấu phẩy, thành một
      // shot năm giây. Nhánh cắt dày của bản tin đã có bước bổ đôi này từ lâu;
      // nhánh kể chuyện thì quên, nên cổng nhịp trượt mà không ai biết vì sao.
      p = p.flatMap((x) => {
        const t = x.split(/\s+/);
        if (t.length <= 10) return [x];
        const phan = Math.ceil(t.length / 8);
        const buoc = Math.ceil(t.length / phan);
        const ra = [];
        for (let k = 0; k < t.length; k += buoc) ra.push(t.slice(k, k + buoc).join(' '));
        return ra;
      });
      // GỘP MẨU CỤT — cùng luật với nhánh cắt dày ở trên, trước đây quên ở đây.
      // Câu mở bằng thán từ ("Ờ, tôi ngu thật, mà lúc đó…") cắt theo dấu phẩy ra
      // mẩu "Ờ," một từ, thành một shot 0.13 giây. Renderer chặn shot dưới 0.25
      // giây, nên cả board trượt cổng vì một dấu phẩy.
      const gop = [];
      for (const x of p) {
        if (gop.length && x.split(/\s+/).length < 3) gop[gop.length - 1] += ' ' + x;
        else if (!gop.length && x.split(/\s+/).length < 3) gop.push(x);
        else gop.push(x);
      }
      // mẩu ĐẦU cụt thì gộp xuôi vào mẩu sau
      if (gop.length > 1 && gop[0].split(/\s+/).length < 3) {
        gop[1] = gop[0] + ' ' + gop[1];
        gop.shift();
      }
      ra.push(...(gop.length > 1 ? gop : [c]));
    } else ra.push(c);
  }
  return ra;
};

export const dungBoard = (kb, canhChuong) => {
  const chuong = [];
  const laBanTin = kb.dinh_dang === 'ban-tin';
  /**
   * HÌNH DỰ PHÒNG cho chương dẫn và chương chốt.
   *
   * Hai chương đó không có link nguồn riêng (chúng không phải là tin), nên
   * `tai-anh-tin.mjs` không tải gì cho chúng — và khung tin ra ĐEN TRƠN. Bản tin
   * một tin thì cả video nói về đúng một câu chuyện, nên mượn chính hình của tin
   * đó là đúng nội dung, không phải lấp chỗ trống. Nguồn vẫn ghi đúng tên báo.
   */
  const hinhDuPhong = laBanTin
    ? (kb.chapters ?? []).find((c) => c.anh || c.video)
    : null;
  // Đếm tin chỉ để biết chương nào là tin (mở bài và chốt thì không). KHÔNG còn
  // in "TIN n/5" lên màn — xem ghi chú ở khối `khung` bên dưới.
  const soTin = kb.chapters.filter((c) => c.id !== 'mo-bai' && c.id !== 'ket').length;
  let dem = 0;
  for (const [i, ch] of kb.chapters.entries()) {
    const laTin = laBanTin && ch.id !== 'mo-bai' && ch.id !== 'ket';
    if (laTin) dem++;
    const {cast, nen} = canhChuong[ch.id] ?? {cast: [kb.nguoi_ke ?? 'nam', 'trang'], nen: 'trang'};
    const [a, b] = cast;
    const cs = cau(ch.vo, laBanTin);
    const shots = [];
    let canhTruoc = null;
    /** bốn tư thế vừa dùng — để không bốc lại ngay, xem `boc` */
    const vuaDung = [];
    /** lời thoại đang thuộc về ai, và nó đã hết câu chưa (xem khối AI ĐANG NÓI) */
    let thoaiTruoc = 0;
    let conThoai = false;
    /** khung trước có phải cú cười không — để kéo nhịp trắng thêm một khung */
    let punchTruoc = false;
    for (const [j, s] of cs.entries()) {
      /**
       * BỐI CẢNH MẶC ĐỊNH — thứ dùng khi câu không khớp từ khoá nào.
       *
       * Trước đây mặc định là `quan-nhau`, vì bảng từ khoá học từ một chuyện đi
       * nhậu. Hậu quả nhìn thấy được: chương mở bài của một chuyện tình cấp ba
       * render ra CỐC BIA trên bàn và tấm biển "NHẬU" sau lưng nhân vật. Không
       * có bối cảnh nào đúng cho mọi câu chuyện, nên mặc định phải do dự án khai
       * (`mac_dinh` trong tu-khoa.json); không khai thì để `ngoai-troi` trung
       * tính, chứ không im lặng dựng một cái quán bia.
       */
      /**
       * Thứ tự quyết bối cảnh: từ khoá trong CHÍNH CÂU → cảnh mặc định CỦA CHƯƠNG
       * (khai trong canh.json) → mặc định của dự án. Thiếu tầng giữa thì câu nào
       * không có từ khoá sẽ rơi về mặc định chung — đo thật: cú chốt "Tôi gật."
       * xảy ra ở gốc bàng ngoài sân mà render ra lớp học, vì "gật" không khớp từ
       * khoá nào. Mỗi chương diễn ra ở MỘT NƠI; nơi đó là thuộc tính của chương.
       */
      const canh = tra(CANH_THEO_LOI, s, (canhChuong[ch.id]?.canh) ?? rieng.mac_dinh ?? 'ngoai-troi');
      const punch = LA_PUNCHLINE.test(s);
      /**
       * ── AI ĐANG NÓI CÂU NÀY ─────────────────────────────────────────
       *
       * Cả phim chỉ có MỘT giọng đọc (người kể đọc luôn cả lời thoại), nhưng
       * trong KHUNG HÌNH miệng phải mấp máy ở đúng người đang nói. Bản cũ gán
       * `noi: true` cứng cho diễn viên thứ nhất — đo ra 368 lượt nhép miệng cho
       * nhân vật một, 0 cho nhân vật hai, trong khi 54 shot mang đúng lời thoại
       * của người kia. Hà nói mà mồm Kiên động.
       *
       * Dấu hiệu: cụm "<chủ ngữ> <động từ nói>:" nằm ngay trong mẩu. Chủ ngữ là
       * tôi/tao/mình thì người kể nói; còn lại là người thứ hai. Mẩu KHÔNG có
       * dấu hiệu mà mẩu trước kết thúc bằng dấu hai chấm thì nó là phần còn lại
       * của chính lời thoại đó — thừa hưởng người nói của mẩu trước.
       */
      const VE_NOI = /(bảo|nói|hỏi|kêu|rít|thì thào|nhắc|phán|chửi|hô|dặn)\s*:/iu;
      const TU_XUNG = /(?<![\p{L}])(tôi|tao|mình)(?![\p{L}])[^:]{0,24}(bảo|nói|hỏi|kêu|nhắc|dặn)\s*:/iu;
      let nguoiNoi = 0;
      if (VE_NOI.test(s)) {
        nguoiNoi = TU_XUNG.test(s) ? 0 : 1;
        thoaiTruoc = nguoiNoi;
        conThoai = !/[.!?…]\s*$/.test(s);
      } else if (conThoai) {
        nguoiNoi = thoaiTruoc;
        conThoai = !/[.!?…]\s*$/.test(s);
      } else {
        thoaiTruoc = 0;
      }
      /**
       * CÚ CẬN MỘT MẶT phải được giữ lại: `phan-ung` chỉ xuất hiện ở câu punchline
       * nên hiếm; bám vào nó thì cả phim không có cỡ cảnh thứ ba. Cứ năm shot lấy
       * một làm cú cận MỘT mặt.
       *
       * KHUNG MỘT MÌNH LÀ KHUNG CHẾT ở cú chốt — nên ba phần tư số shot có hai
       * người, shot cuối mỗi chương luôn có, và shot nào NGƯỜI THỨ HAI đang thoại
       * thì bắt buộc phải có mặt nó.
       */
      const canCu = j % 5 === 2 && !punch && j !== cs.length - 1 && j !== 0;
      const hai = nguoiNoi === 1 ? true : canCu ? false : j % 4 !== 3 || punch || j === cs.length - 1;
      const loai = j === 0 ? 'truc-dien' : punch ? 'phan-ung' : 'minh-hoa';
      /** Hai người trong một cú cận đặc thì hai hình phóng to chồng lên nhau. */
      const co = canCu ? 'sat' : hai && CO_THEO_LOAI[loai] === 'sat' ? 'can' : CO_THEO_LOAI[loai];
      const mayCau = tra(MAY_THEO_LOI, s, 'thuong');
      const dangA = tra(DANG_THEO_LOI, s, null) ?? boc(DANG_NOI, i * 13 + j * 5, vuaDung);
      vuaDung.push(dangA);
      if (vuaDung.length > 4) vuaDung.shift();
      const lech = ((i * 7 + j * 3) % 5) * 0.06;
      const nhipA = [0.62 + lech, 1.34 + lech * 1.6];
      const nhipB = [0.84 + lech * 1.3, 1.62 + lech];
      const gocA = loai === 'truc-dien' ? 'truoc' : NGHIENG.test(s) ? 'nghieng' : 'ba-phan-tu';
      const dien = [{
        kieu: a, x: loai === 'truc-dien' ? 0.72 : 0.36, noi: nguoiNoi === 0, goc: gocA,
        dang: dangA,
        may: mayCau,
        // Mẫu hành động lấy TỪ NGHĨA CÂU, không rải cho đủ chỉ tiêu.
        ...(tra(MAU_THEO_LOI, s, null) ? {mau: tra(MAU_THEO_LOI, s, null)} : {}),
        // Hai mốc act: đổi tư thế giữa câu rồi chốt ở cuối. Cách nhau ≥ 0.55 s
        // (renderer lọc mốc dày hơn thế — xem src/v2/act/ap-dung.ts).
        act: [
          {tai: nhipA[0], dang: boc(DANG_NOI, i * 13 + j * 5 + 1, vuaDung), mat: punch ? 'soc-lon' : 'cung'},
          {tai: nhipA[1], dang: boc(DANG_NOI, i * 13 + j * 5 + 2, vuaDung)},
        ],
      }];
      const cam = tra(CAM_THEO_LOI, s, null);
      if (cam) dien[0].cam = cam;
      if (hai) dien.push({
        noi: nguoiNoi === 1,
        may: mayCau,
        kieu: b, x: loai === 'truc-dien' ? 0.24 : 0.68, flip: loai !== 'truc-dien',
        co: loai === 'truc-dien' ? 0.9 : 1, goc: 'ba-phan-tu',
        dang: tra(DANG_THEO_LOI, s, null) && DANG_PU.includes(tra(DANG_THEO_LOI, s, null)) ? tra(DANG_THEO_LOI, s, null) : boc(DANG_PU, i * 11 + j * 3, vuaDung),
        mat: punch ? 'soc-lon' : 'cung',
        act: [
          {tai: nhipB[0], dang: boc(DANG_PU, i * 11 + j * 3 + 1, vuaDung)},
          {tai: nhipB[1], dang: boc(DANG_PU, i * 11 + j * 3 + 2, vuaDung), mat: 'nho'},
        ],
      });

      /**
       * NHỊP TRẮNG — khung nền trắng ngay tại cú cười.
       *
       * Đây là cách hoạt hình kể chuyện cho một câu chốt "thở": bỏ hết bối cảnh,
       * còn nhân vật trên nền trắng, mắt không có gì để nhìn ngoài cái mặt vừa
       * nói câu đó. Bảng chấm đòi 4–12% thời lượng; hai phim dựng trước có 0–2%
       * vì bộ dựng chưa bao giờ đặt nhịp trắng, chứ không phải vì cố ý bỏ.
       */
      // Nhịp trắng ôm CẢ cú cười lẫn khung ngay sau nó: câu chốt bật ra, rồi một
      // khung để nó rơi xuống. Chỉ lấy đúng khung punchline thì nhịp trắng chiếm
      // chưa tới 5% thời lượng, dưới mốc 4–12% — mà cái đáng thở lại là khung sau.
      const trang = punch || punchTruoc;
      punchTruoc = punch;
      const sh = {say: s, loai, co, nen: trang ? 'trang' : nen, dien};
      /**
       * BỐI CẢNH PHẢI KHAI Ở MỌI SHOT.
       *
       * Renderer vẽ cảnh từ CHÍNH `shot.boi_canh` (xem bungBoiCanh trong
       * san-khau.tsx) — nó không nhớ shot trước. Luật cũ chỉ khai khi cảnh ĐỔI,
       * nên đo trên bản render đầu: 82/367 shot có cảnh, 78% còn lại là nền trơn
       * với hai nhân vật lơ lửng. Đây chính là chỗ "đồ hoạ như shit": không phải
       * vẽ xấu, mà là phần lớn thời lượng không vẽ gì cả.
       */
      sh.boi_canh = canh;
      canhTruoc = canh;
      const prop = tra(PROP_THEO_LOI, s, null);
      if (prop) sh.prop = [{ten: prop, x: 0.86, y: 1.02, co: 0.85}];
      // đẩy máy chỉ ở shot dài và ở punchline — không rải đều cho đủ chỉ tiêu
      if (punch) sh.zoom = {tu: 1.0, den: 1.14};
      else if (j % 4 === 1) sh.zoom = {tu: 1.0, den: 1.06};
      if (punch) sh.sfx = 'vine-boom';
      /**
       * Ô CHÈN ĐẶT Ở CHỖ CƯỜI, không phải ở shot thứ ba.
       * Người xem chê "meme không chèn vào lúc vui" — đúng, bản trước đặt ô chèn
       * theo chỉ số shot. Giờ nó bám đúng câu punchline, và nội dung ô lấy từ
       * chính thứ câu đó đang nói tới.
       */
      // Bản tin: mọi con số viết bằng chữ đều đáng bật lên thành ô chèn — đó là
      // thứ người xem cần thấy để tin, và cũng là chỗ nhịp cần một cú nảy.
      if (laBanTin && !punch) {
        const soTinh = s.match(/(một|hai|ba|bốn|năm|sáu|bảy|tám|chín|mười)\s+(bước|cách|skill|cộng đồng|phút|tin|nhóm)/i);
        if (soTinh) {
          sh.chen = [{chu: soTinh[0].toUpperCase(), nen: '#d92b2b', mau_chu: '#ffffff', x: 0.2, y: 0.6, co: 0.26, ti_le: 0.38, tai: 0.2, dai: 1.2, xoay: -2}];
        }
      }
      /**
       * Ô CHÈN THEO CON SỐ.
       *
       * Ô chèn (`chen`) là thứ đổi hình mà KHÔNG cắt mạch kể — đúng lối dựng của
       * Monsieur Tuna. Bản trước chỉ đặt ô chèn ở câu punchline, ra 0.7 ô mỗi 30
       * giây, dưới mốc 1. Mà chuyện kể miệng thì con số chính là chỗ đáng bật
       * lên: "ba mươi bảy lần", "bốn mươi phút", "bảy lần, xé sáu". Người xem
       * nghe con số và nhìn thấy con số cùng lúc thì nó mới đọng lại.
       */
      // Số đếm viết bằng chữ, KHÔNG bắt buộc kèm danh từ đơn vị. Bản trước đòi
      // phải có "lần/phút/ngày…" đi sau nên "hai trăm", "tám mươi" đứng một mình
      // — đúng những con số câu chuyện xoay quanh — không bao giờ được bật lên.
      const SO_DEM = /(?<![\p{L}])((?:một|hai|ba|bốn|năm|sáu|bảy|tám|chín|mười)(?:\s+(?:mươi|trăm|nghìn|lăm|mốt|tư))*(?:\s+(?:một|hai|ba|bốn|năm|sáu|bảy|tám|chín))?)(?![\p{L}])/iu;
      if (!punch) {
        const sd = SO_DEM.exec(s);
        if (sd) {
          sh.chen = [{chu: sd[0].toUpperCase(), nen: '#ffd400', mau_chu: '#1a1a1a', x: 0.2, y: 0.17, co: 0.26, ti_le: 0.4, tai: 0.15, dai: 1.1, xoay: -3}];
        }
      }
      if (punch) {
        const so = s.match(/(hai trăm mười nghìn|bốn trăm tám mươi lăm nghìn|mười hai phút|hai mươi phút|ba năm|ba món|một phút)/i);
        sh.chen = [
          so
            ? {chu: so[0].toUpperCase(), nen: '#ffd400', x: 0.21, y: 0.26, co: 0.3, ti_le: 0.42, tai: 0.25, dai: 1.2, xoay: -2}
            : {prop: prop ?? 'giot-mo-hoi', x: 0.2, y: 0.26, co: 0.28, tai: 0.25, dai: 1.1, xoay: -3},
        ];
        // Thẻ chữ punchline: lấy CHÍNH cụm gây cười trong câu, không bịa chữ mới.
        const cum = s.replace(/[.!?…]+$/, '').split(/,\s*/).pop().trim();
        if (cum.length >= 3 && cum.length <= 22) {
          sh.chu = [{noi_dung: cum.toUpperCase(), kieu: 'the', vao: 'phong', vi_tri: 'tren', tai: 0.3}];
        }
        // Nhịp trắng sau cú cười: giữ shot ngắn lại, renderer tự chèn trắng vào phần hở.
        sh.dai = 1.1;
      }
      shots.push(sh);
    }
    if (laBanTin) {
      /**
       * Khung bản tin giữ NGUYÊN suốt cả tin: thanh tiêu đề phải đứng yên đủ lâu
       * để đọc hết. Nháy theo từng shot là mất luôn công dụng của nó.
       */
      const hinh = ch.anh || ch.video ? ch : hinhDuPhong ?? {};
      /**
       * KHO HÌNH của tin, xoay vòng theo shot.
       *
       * Đo bản render đầu: board khai 21 shot nhưng máy chỉ dò được 4 cú cắt —
       * vì cả 21 shot dán CÙNG một tấm ảnh, tức là cắt từ ảnh A sang chính ảnh A.
       * Short triệu view cắt 1.7–3.1 giây một lần và mỗi lần là một HÌNH KHÁC.
       * `tai-anh-tin.mjs` giờ lấy cả ảnh trong thân bài (`anh_them`), ở đây rải
       * chúng ra: shot k dùng hình thứ k mod số hình.
       */
      const khoHinh = [hinh.anh, ...(hinh.anh_them ?? [])].filter(Boolean);
      const khung = {
        kicker: ch.kicker,
        heading: ch.heading,
        // KHÔNG khai `so`. Huy hiệu "TIN 2/5" đã bỏ khỏi khung tin (xem
        // src/v2/phim/khung-tin.tsx): đo 80 Short thể thao Việt, nó không giữ
        // chân ai — nó chỉ báo còn phải ngồi thêm bao lâu.
        // Có B-roll thì dùng B-roll, không thì ảnh tĩnh — xem tai-video-tin.mjs.
        ...(hinh.video ? {video: hinh.video} : {}),
        ...(hinh.anh || hinh.video ? {nguon: hinh.anh_nguon} : {}),
      };
      for (const [k, sh] of shots.entries()) {
        // B-roll thì giữ nguyên đoạn video suốt tin (tự nó đã động); ảnh tĩnh
        // thì mỗi shot một tấm khác.
        sh.tin = hinh.video ? khung : {...khung, ...(khoHinh.length ? {anh: khoHinh[k % khoHinh.length]} : {})};
      }
      // KHÔNG dựng thanh chạy chân màn. Nó chiếm 6% chiều cao khung và đứng yên
      // suốt bài — đúng loại "chrome tĩnh" mà nhóm view cao nhất có 0%, còn video
      // 675 view có 67%. Muốn bật thì khai tay `tin.chay` trong board.
      // Âm: sting mở màn, whoosh mỗi lần sang tin mới.
      if (shots.length) shots[0].sfx = ch.id === 'mo-bai' ? 'tin-sting' : 'tin-whoosh';
    }
    chuong.push({id: ch.id, shots});
  }
  return chuong;
};

if (process.argv[1].endsWith('dung-board.mjs')) {
  const duong = path.join(ROOT, `src/projects/${DU_AN}`);
  mkdirSync(duong, {recursive: true});
  const canh = existsSync(path.join(duong, 'canh.json'))
    ? JSON.parse(readFileSync(path.join(duong, 'canh.json'), 'utf8'))
    : {};
  const chuong = dungBoard(kb, canh);
  /**
   * GIỮ phần người viết tay của board cũ. Máy chỉ sinh lại `chuong`; khung dọc,
   * nhân vật/prop/bối cảnh tự vẽ là công của người — sinh đè lên là mất trắng,
   * và đã mất một lần (khung_doc biến mất, composition dọc không đăng ký nổi).
   */
  const duongBoard = path.join(duong, 'board.json');
  const cu = existsSync(duongBoard) ? JSON.parse(readFileSync(duongBoard, 'utf8')) : {};
  const giu = {};
  for (const k of ['khung_doc', 'nhan_vat_tu_ve', 'prop_tu_ve', 'boi_canh_tu_ve', 'do_cam_tu_ve']) {
    if (cu[k]) giu[k] = cu[k];
  }
  const board = {du_an: DU_AN, dinh_dang: kb.dinh_dang === 'ban-tin' ? 'ban-tin' : 'ke-chuyen', nguoi_ke: kb.nguoi_ke ?? 'nam',
                 mac_dinh: {loai: 'minh-hoa', co: 'trung', nen: 'trang'}, ...giu, chuong};
  writeFileSync(path.join(duong, 'board.json'), JSON.stringify(board, null, 1));
  const n = chuong.reduce((a, c) => a + c.shots.length, 0);
  console.log(`→ src/projects/${DU_AN}/board.json — ${chuong.length} chương, ${n} shot (bám lời)`);
  console.log('  Đây là NHÁP có nghĩa. Mở ra sửa tay những shot muốn diễn kỹ rồi chạy kiem-tra-v2.');
}
