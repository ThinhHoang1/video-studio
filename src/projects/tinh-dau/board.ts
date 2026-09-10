import type {Sac, Dang} from '../../library/cast/nhan-vat';

/**
 * Bảng phân cảnh cho `tinh-dau`.
 *
 * Khác các dự án trước ở một điểm quan trọng: mỗi shot khai báo một DANH SÁCH
 * nhân vật, không phải một người. Câu chuyện có Nam, Hà, Long, Mai, mẹ và
 * thầy — để một người đứng kể lại hết là bỏ mất chính cái làm nó thành phim.
 */
export type Dien = {
  /** khoá trong bảng KIEU */
  kieu: string;
  /** vị trí ngang trong hệ 1920 */
  x: number;
  dang?: Dang;
  sac?: Sac;
  flip?: boolean;
  /** cỡ riêng, dùng khi muốn ai đó đứng gần/xa máy hơn */
  s?: number;
};

export type Moc = {
  say: string;
  canh: string;
  co?: 'rong' | 'trung' | 'can' | 'sat';
  dien?: Dien[];
};

/** Hai người đứng cạnh nhau, quay mặt vào nhau. */
const doi = (a: string, b: string, da: Partial<Dien> = {}, db: Partial<Dien> = {}): Dien[] => [
  {kieu: a, x: 820, dang: 'dung', sac: 'thuong', ...da},
  {kieu: b, x: 1130, dang: 'dung', sac: 'thuong', flip: true, ...db},
];

export const BOARD: Record<string, Moc[]> = {
  'cho-ngoi': [
    {say: 'Năm lớp mười', canh: 'lop-hoc', co: 'rong',
     dien: [{kieu: 'thay', x: 960, dang: 'chi', sac: 'thuong'}]},
    {say: 'Cô đọc tên theo danh sách', canh: 'lop-hoc', co: 'trung',
     dien: [{kieu: 'thay', x: 800, dang: 'cuiNguoi', sac: 'thuong'}]},
    {say: 'tên tôi được đọc ngay sau tên một bạn nữ', canh: 'lop-hoc', co: 'trung',
     dien: doi('nam', 'ha', {sac: 'soc'}, {sac: 'thuong'})},
    {say: 'Bạn ấy tên Hà', canh: 'lop-hoc', co: 'can',
     dien: [{kieu: 'ha', x: 960, dang: 'dung', sac: 'vui'}]},
    {say: 'Hoá ra không', canh: 'lop-hoc', co: 'trung',
     dien: doi('nam', 'ha', {sac: 'nghi'}, {sac: 'thuong'})},
    {say: 'một cô giáo đọc tên theo thứ tự bảng chữ cái', canh: 'lop-hoc', co: 'rong',
     dien: [{kieu: 'thay', x: 960, dang: 'goMay', sac: 'thuong'}]},
  ],

  'cay-but': [
    {say: 'Tuần thứ hai, Hà quên bút', canh: 'lop-hoc', co: 'trung',
     dien: doi('nam', 'ha', {sac: 'thuong'}, {sac: 'nghi'})},
    {say: 'Tôi đưa cây bút bi xanh', canh: 'lop-hoc', co: 'can',
     dien: doi('nam', 'ha', {dang: 'chi', sac: 'thuong'}, {sac: 'vui'})},
    {say: 'Hà quên trả', canh: 'lop-hoc', co: 'can',
     dien: [{kieu: 'nam', x: 900, dang: 'dung', sac: 'thuong'}]},
    {say: 'tôi cố tình mang hai cây', canh: 'phong-hoc-sinh', co: 'trung',
     dien: [{kieu: 'nam', x: 760, dang: 'goMay', sac: 'nghi'}]},
    {say: 'Hà chỉ quên đúng hai lần', canh: 'lop-hoc', co: 'trung',
     dien: doi('nam', 'ha', {sac: 'thuong'}, {sac: 'vui'})},
    {say: 'tất cả những ngày còn lại', canh: 'phong-hoc-sinh', co: 'can',
     dien: [{kieu: 'nam', x: 820, dang: 'cuiNguoi', sac: 'thuong'}]},
  ],

  'long-treu': [
    {say: 'Long là bạn thân tôi từ cấp hai', canh: 'san-truong', co: 'rong',
     dien: doi('nam', 'long', {sac: 'thuong'}, {dang: 'tayHong', sac: 'vui'})},
    {say: 'mày thích con Hà à', canh: 'san-truong', co: 'can',
     dien: doi('nam', 'long', {sac: 'soc'}, {dang: 'chi', sac: 'vui'})},
    {say: 'mày điên à', canh: 'san-truong', co: 'can',
     dien: doi('nam', 'long', {dang: 'khoanhTay', sac: 'tuc'}, {sac: 'vui'})},
    {say: 'mỗi lần nó quay sang là mày ngồi thẳng lưng lên', canh: 'lop-hoc', co: 'trung',
     dien: doi('nam', 'ha', {sac: 'soc'}, {sac: 'thuong'})},
    {say: 'chỉ nhún vai bỏ đi', canh: 'san-truong', co: 'trung',
     dien: [{kieu: 'long', x: 1100, dang: 'quayLung', sac: 'thuong'},
            {kieu: 'nam', x: 620, dang: 'dung', sac: 'nghi'}]},
    {say: 'họ không nói lại lần thứ hai', canh: 'san-truong', co: 'can',
     dien: [{kieu: 'nam', x: 900, dang: 'nhunVai', sac: 'nghi'}]},
  ],

  'ghe-da': [
    {say: 'ngồi ghế đá dưới gốc phượng', canh: 'ghe-da', co: 'rong',
     dien: doi('nam', 'ha', {x: 900, sac: 'thuong'}, {x: 1400, sac: 'vui'})},
    {say: 'Hà kể về chị gái', canh: 'ghe-da', co: 'trung',
     dien: doi('nam', 'ha', {x: 900, sac: 'thuong'}, {x: 1400, dang: 'chi', sac: 'vui'})},
    {say: 'Tôi nghe, và nhớ hết', canh: 'ghe-da', co: 'can',
     dien: [{kieu: 'nam', x: 880, dang: 'dung', sac: 'thuong'}]},
    {say: 'Nhớ Hà sợ tiếng sấm', canh: 'ghe-da', co: 'can',
     dien: [{kieu: 'ha', x: 1000, dang: 'dung', sac: 'vui'}]},
    {say: 'đang thuộc lòng một người', canh: 'ghe-da', co: 'trung',
     dien: doi('nam', 'ha', {x: 900, sac: 'nghi'}, {x: 1400, sac: 'thuong'})},
    {say: 'mình vẫn còn nhớ', canh: 'ghe-da', co: 'rong'},
  ],

  'duong-ve': [
    {say: 'chung nhau đúng ba trăm mét đường', canh: 'duong-ve', co: 'rong',
     dien: doi('nam', 'ha', {x: 820, flip: false, sac: 'thuong'}, {x: 1120, flip: false, sac: 'thuong'})},
    {say: 'tôi đi chậm nhất có thể', canh: 'duong-ve', co: 'trung',
     dien: doi('nam', 'ha', {x: 820, flip: false, sac: 'nghi'}, {x: 1120, flip: false, sac: 'vui'})},
    {say: 'viện cớ xe hơi hỏng', canh: 'duong-ve', co: 'can',
     dien: [{kieu: 'nam', x: 900, dang: 'cuiNguoi', sac: 'nghi'}]},
    {say: 'có lẽ Hà cũng đi chậm', canh: 'duong-ve', co: 'trung',
     dien: [{kieu: 'ha', x: 1020, dang: 'dung', sac: 'thuong'}]},
    {say: 'người bên cạnh cũng đang làm y hệt', canh: 'duong-ve', co: 'rong',
     dien: doi('nam', 'ha', {x: 820, flip: false}, {x: 1120, flip: false})},
  ],

  'con-mua': [
    {say: 'Một chiều tháng Tám trời đổ mưa', canh: 'mua-hien', co: 'rong',
     dien: doi('nam', 'ha', {x: 780, sac: 'thuong'}, {x: 1180, sac: 'thuong'})},
    {say: 'chỉ vừa một người', canh: 'mua-hien', co: 'can',
     dien: doi('nam', 'ha', {x: 780, dang: 'chi', sac: 'thuong'}, {x: 1180, sac: 'soc'})},
    {say: 'thế còn cậu', canh: 'mua-hien', co: 'can',
     dien: [{kieu: 'ha', x: 980, dang: 'dung', sac: 'nghi'}]},
    {say: 'tớ chạy nhanh lắm', canh: 'mua-hien', co: 'trung',
     dien: doi('nam', 'ha', {x: 780, dang: 'gioTay', sac: 'vui'}, {x: 1180, sac: 'nghi'})},
    {say: 'sốt mất hai ngày', canh: 'phong-hoc-sinh', co: 'trung',
     dien: [{kieu: 'nam', x: 800, dang: 'cuiNguoi', sac: 'met'}]},
    {say: 'chỉ muốn có cái gì đó để cho đi', canh: 'phong-hoc-sinh', co: 'can',
     dien: [{kieu: 'nam', x: 860, dang: 'dung', sac: 'thuong'}]},
  ],

  'la-thu': [
    {say: 'Tôi viết cho Hà một lá thư', canh: 'phong-hoc-sinh', co: 'trung',
     dien: [{kieu: 'nam', x: 780, dang: 'goMay', sac: 'nghi'}]},
    {say: 'Bản thứ tư còn nửa trang', canh: 'phong-hoc-sinh', co: 'can',
     dien: [{kieu: 'nam', x: 820, dang: 'omDau', sac: 'met'}]},
    {say: 'Bản thứ bảy chỉ còn bốn chữ', canh: 'phong-hoc-sinh', co: 'sat',
     dien: [{kieu: 'nam', x: 860, dang: 'goMay', sac: 'soc'}]},
    {say: 'kẹp vào cuốn sách', canh: 'lop-hoc', co: 'trung',
     dien: doi('nam', 'ha', {sac: 'nghi'}, {sac: 'thuong'})},
    {say: 'lấy lá thư đi', canh: 'phong-hoc-sinh', co: 'can',
     dien: [{kieu: 'nam', x: 840, dang: 'cuiNguoi', sac: 'buon'}]},
    {say: 'sẽ không còn như cũ nữa', canh: 'ghe-da', co: 'rong'},
  ],

  'mai-noi': [
    {say: 'Mai là bạn thân của Hà', canh: 'san-truong', co: 'trung',
     dien: doi('nam', 'mai', {sac: 'thuong'}, {dang: 'khoanhTay', sac: 'nghi'})},
    {say: 'ông định để nó chờ đến bao giờ', canh: 'san-truong', co: 'can',
     dien: doi('nam', 'mai', {sac: 'soc'}, {dang: 'chi', sac: 'tuc'})},
    {say: 'Tôi hỏi chờ gì', canh: 'san-truong', co: 'can',
     dien: [{kieu: 'nam', x: 900, dang: 'nhunVai', sac: 'nghi'}]},
    {say: 'thôi, không có gì', canh: 'san-truong', co: 'trung',
     dien: [{kieu: 'mai', x: 1150, dang: 'quayLung', sac: 'thuong'},
            {kieu: 'nam', x: 680, dang: 'dung', sac: 'soc'}]},
    {say: 'đã hỏi lại một câu ngu ngốc', canh: 'san-truong', co: 'can',
     dien: [{kieu: 'nam', x: 900, dang: 'omDau', sac: 'met'}]},
    {say: 'người ta gọi đúng tên nó', canh: 'phong-hoc-sinh', co: 'sat',
     dien: [{kieu: 'nam-lon', x: 900, dang: 'cuiNguoi', sac: 'buon'}]},
  ],

  'on-thi': [
    {say: 'Lên lớp mười hai thì mọi thứ chậm lại', canh: 'lop-hoc', co: 'rong',
     dien: [{kieu: 'nam', x: 700, dang: 'goMay', sac: 'met'},
            {kieu: 'ha', x: 1180, dang: 'goMay', sac: 'met', flip: true}]},
    {say: 'Giờ ra chơi thành giờ chép bài', canh: 'lop-hoc', co: 'trung',
     dien: [{kieu: 'nam', x: 820, dang: 'goMay', sac: 'met'}]},
    {say: 'chẳng đứa nào ra nữa', canh: 'ghe-da', co: 'rong'},
    {say: 'vẫn đi chung ba trăm mét đường về', canh: 'duong-ve', co: 'rong',
     dien: doi('nam', 'ha', {x: 780, flip: false, sac: 'thuong'}, {x: 1160, flip: false, sac: 'thuong'})},
    {say: 'giống thuỷ triều rút lúc nửa đêm', canh: 'duong-ve', co: 'trung',
     dien: doi('nam', 'ha', {x: 700, flip: false, sac: 'nghi'}, {x: 1260, flip: false, sac: 'thuong'})},
    {say: 'Sáng ra thì bờ đã khác', canh: 'ghe-da', co: 'rong'},
  ],

  'tra-sua': [
    {say: 'đi uống trà sữa với nhau', canh: 'quan-tra-sua', co: 'rong',
     dien: doi('nam', 'ha', {x: 760, sac: 'thuong'}, {x: 1200, sac: 'vui'})},
    {say: 'tôi tập trước ba câu định nói', canh: 'quan-tra-sua', co: 'can',
     dien: [{kieu: 'nam', x: 880, dang: 'dung', sac: 'nghi'}]},
    {say: 'Ngồi xuống rồi thì quên sạch', canh: 'quan-tra-sua', co: 'can',
     dien: [{kieu: 'nam', x: 880, dang: 'omDau', sac: 'soc'}]},
    {say: 'trong bốn mươi phút', canh: 'quan-tra-sua', co: 'trung',
     dien: doi('nam', 'ha', {x: 760, dang: 'goMay', sac: 'thuong'}, {x: 1200, dang: 'chi', sac: 'vui'})},
    {say: 'hôm nào lại đi nữa nhé', canh: 'quan-tra-sua', co: 'can',
     dien: [{kieu: 'ha', x: 1000, dang: 'gioTay', sac: 'vui'}]},
    {say: 'Rồi không có hôm nào nữa', canh: 'quan-tra-sua', co: 'rong'},
  ],

  'chia-tay': [
    {say: 'cả lớp chụp ảnh ở cổng trường', canh: 'cong-truong', co: 'rong',
     dien: [{kieu: 'long', x: 620, dang: 'gioTay', sac: 'vui'},
            {kieu: 'mai', x: 900, dang: 'dung', sac: 'vui'},
            {kieu: 'ha', x: 1180, dang: 'dung', sac: 'vui'},
            {kieu: 'nam', x: 1440, dang: 'dung', sac: 'thuong'}]},
    {say: 'Tôi đứng cách Hà khoảng năm mét', canh: 'cong-truong', co: 'trung',
     dien: doi('nam', 'ha', {x: 720, sac: 'nghi'}, {x: 1260, flip: false, sac: 'thuong'})},
    {say: 'tính bước qua', canh: 'cong-truong', co: 'can',
     dien: [{kieu: 'nam', x: 880, dang: 'dung', sac: 'nghi'}]},
    {say: 'có người gọi Hà', canh: 'cong-truong', co: 'trung',
     dien: [{kieu: 'ha', x: 1200, dang: 'quayLung', sac: 'thuong'},
            {kieu: 'nam', x: 660, dang: 'dung', sac: 'soc'}]},
    {say: 'chỉ còn mình tôi với cái cổng', canh: 'cong-truong', co: 'rong',
     dien: [{kieu: 'nam', x: 960, dang: 'dung', sac: 'buon'}]},
    {say: 'nó đã tự dài ra', canh: 'cong-truong', co: 'rong'},
  ],

  'me-hoi': [
    {say: 'ngồi lì trong phòng', canh: 'phong-hoc-sinh', co: 'trung',
     dien: [{kieu: 'nam', x: 820, dang: 'cuiNguoi', sac: 'buon'}]},
    {say: 'Mẹ gõ cửa mang vào bát chè', canh: 'phong-hoc-sinh', co: 'rong',
     dien: doi('nam', 'me', {x: 700, dang: 'cuiNguoi', sac: 'buon'}, {x: 1240, sac: 'thuong'})},
    {say: 'hôm nay chia tay lớp vui không con', canh: 'phong-hoc-sinh', co: 'can',
     dien: [{kieu: 'me', x: 1000, dang: 'dung', sac: 'thuong'}]},
    {say: 'Tôi nói vui', canh: 'phong-hoc-sinh', co: 'can',
     dien: [{kieu: 'nam', x: 860, dang: 'dung', sac: 'buon'}]},
    {say: 'sau này khắc có lúc nói', canh: 'phong-hoc-sinh', co: 'trung',
     dien: doi('nam', 'me', {x: 700, sac: 'soc'}, {x: 1240, sac: 'thuong'})},
    {say: 'rồi đi', canh: 'phong-hoc-sinh', co: 'rong',
     dien: [{kieu: 'nam', x: 860, dang: 'dung', sac: 'nghi'}]},
  ],

  'gap-lai': [
    {say: 'Mười hai năm sau', canh: 'quan-tra-sua', co: 'rong',
     dien: [{kieu: 'nam-lon', x: 960, dang: 'dung', sac: 'thuong'}]},
    {say: 'Hà đến cùng chồng', canh: 'quan-tra-sua', co: 'trung',
     dien: doi('nam-lon', 'ha-lon', {x: 720, sac: 'soc'}, {x: 1240, sac: 'vui'})},
    {say: 'về đứa nhỏ nhà Hà mới hai tuổi', canh: 'quan-tra-sua', co: 'trung',
     dien: doi('nam-lon', 'ha-lon', {x: 720, sac: 'thuong'}, {x: 1240, dang: 'chi', sac: 'vui'})},
    {say: 'Hà cười y như hồi mười bảy', canh: 'quan-tra-sua', co: 'can',
     dien: [{kieu: 'ha-lon', x: 1000, dang: 'dung', sac: 'vui'}]},
    {say: 'tớ vẫn nhớ', canh: 'quan-tra-sua', co: 'sat',
     dien: [{kieu: 'nam-lon', x: 900, dang: 'dung', sac: 'soc'}]},
    {say: 'có một người vẫn luôn để ý', canh: 'quan-tra-sua', co: 'rong',
     dien: [{kieu: 'nam-lon', x: 960, dang: 'dung', sac: 'buon'}]},
  ],

  ket: [
    {say: 'tình đầu là chuyện dở dang', canh: 'ghe-da', co: 'rong'},
    {say: 'Nó chỉ không cần đi tới đâu cả', canh: 'ghe-da', co: 'trung',
     dien: doi('nam', 'ha', {x: 900, sac: 'thuong'}, {x: 1400, sac: 'vui'})},
    {say: 'khi chưa ai dạy bạn phải quan tâm cho đúng', canh: 'san-truong', co: 'rong',
     dien: doi('nam', 'ha', {x: 820, sac: 'vui'}, {x: 1180, sac: 'vui'})},
    {say: 'đang giữ một điều chưa nói', canh: 'cong-truong', co: 'trung',
     dien: [{kieu: 'nam', x: 900, dang: 'dung', sac: 'nghi'}]},
    {say: 'năm mét thì bước qua được', canh: 'cong-truong', co: 'can',
     dien: doi('nam', 'ha', {x: 760, dang: 'chi', sac: 'thuong'}, {x: 1200, sac: 'thuong'})},
    {say: 'chỉ đủ để kể lại', canh: 'duong-ve', co: 'rong',
     dien: [{kieu: 'nam-lon', x: 960, dang: 'dung', sac: 'thuong'}]},
  ],
};
