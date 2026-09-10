import type {TrangThaiMat, TrangThaiMay} from '../rig/mat';
import type {HinhMieng} from '../rig/mieng';

/**
 * BẢNG PHÂN CẢNH V2 — dữ liệu agent viết, không phải code.
 *
 * Một chương = danh sách shot neo vào lời (`say`) như V1, nhưng shot có LOẠI,
 * CỠ, DIỄN VIÊN + HÀNH ĐỘNG THEO THỜI GIAN (snap, không tween), CHỮ, PROP,
 * INSERT; cho phép shot trống (nhịp trắng) và shot rất ngắn (≥ 0.25 s).
 *
 * Số liệu tham chiếu để agent canh nhịp: shot trung vị 1.4 s, 31% shot < 1 s,
 * nói trực diện chỉ ~16% thời gian, chữ trên màn ~14% shot, nhịp trắng 0.5–1.2 s.
 */

export type LoaiShot =
  | 'truc-dien' // người kể nói với khán giả, lệch một bên khung (x≈0.72), cắt ở ngực
  | 'minh-hoa' // diễn lại điều đang kể — nhân vật + prop trên nền trắng
  | 'phan-ung' // cận mặt nhân vật phản ứng (không nói) — shot ngắn 0.4–1 s
  | 'dac-ta' // đặc tả một vật / một mặt rất to
  | 'chu' // chữ chiếm khung (tiêu đề, punchline), có thể kèm nhân vật nhỏ
  | 'insert' // ảnh thật / meme chèn — tự kèm nhịp trắng 0.3 s trước/sau
  | 'tieu-canh' // nhân vật rất nhỏ giữa khung trắng mênh mông (hài, cô đơn)
  | 'dong-nguoi' // đám đông đầu trắng
  | 'trong'; // nhịp trắng — không có gì, dài `dai` giây

/** cỡ cảnh → bề rộng sọ (px) trên 1920×1080 và vị trí chân mặc định */
export type CoCanh = 'rong' | 'trung' | 'can' | 'sat' | 'nho';
export const CO_CANH: Record<CoCanh, {dau: number; chanY: number; moTa: string}> = {
  rong: {dau: 200, chanY: 0.84, moTa: 'toàn thân, thấy cả prop'},
  trung: {dau: 330, chanY: 1.04, moTa: 'cắt ở gối — mặc định minh hoạ'},
  can: {dau: 560, chanY: 1.5, moTa: 'cắt ở ngực — mặc định trực diện, phản ứng'},
  sat: {dau: 900, chanY: 2.2, moTa: 'chỉ mặt — đặc tả'},
  nho: {dau: 110, chanY: 0.66, moTa: 'nhân vật bé giữa khung trắng'},
};

/** một mốc hành động trong shot — SNAP tại giây `tai` tính từ đầu shot, giữ nguyên tới mốc sau */
export type GocNhin = 'truoc' | 'ba-phan-tu' | 'nghieng' | 'sau';

export type HanhDong = {
  tai: number;
  dang?: string;
  /** góc nhìn nhân vật */
  goc?: GocNhin;
  /** prop cầm trên tay phải (tên trong PROP_TEN, nhóm cầm được) — bỏ trống = buông */
  cam?: string;
  mat?: TrangThaiMat;
  may?: TrangThaiMay;
  /** miệng cảm xúc khi KHÔNG nói; khi đang nói, lip-sync đè lên */
  mieng?: HinhMieng;
  nhin?: number;
  /** dịch vị trí (tỉ lệ bề rộng khung) — nhân vật nhảy sang chỗ khác */
  x?: number;
  flip?: boolean;
  ma?: boolean;
  moHoi?: boolean;
};

export type DienVien = {
  /** tên trong KIEU (src/v2/rig/kieu.ts): nam, ha, long, mai, me, thay, nam-lon, ha-lon, trang */
  kieu: string;
  /** vị trí chân theo tỉ lệ bề rộng khung 0..1 */
  x: number;
  /** vị trí chân theo tỉ lệ chiều cao (mặc định theo cỡ cảnh) */
  y?: number;
  /** hệ số cỡ riêng (trẻ con 0.7, đứng xa 0.8) */
  co?: number;
  dang?: string;
  mat?: TrangThaiMat;
  may?: TrangThaiMay;
  mieng?: HinhMieng;
  nhin?: number;
  flip?: boolean;
  ma?: boolean;
  moHoi?: boolean;
  /** người này đang nói → miệng theo lip-sync. Mặc định: diễn viên đầu tiên của shot truc-dien */
  noi?: boolean;
  /** tự đổi cử chỉ tay/mắt theo nhịp câu khi nói (mặc định true cho truc-dien) */
  tuDong?: boolean;
  /** hành động theo thời gian trong shot */
  act?: HanhDong[];
  /** mẫu hành động đặt tên (src/v2/act): 'vao-chay', 'ra-chay', 'giat-minh', 'nga', 'lac-dau', 'gat-gu', 'run', 'go-ban', 'nhin-quanh', 'di-bo'... — sinh act tự động, act thủ công đè lên */
  mau?: string;
  /** tham số cho mẫu (vd. hướng, tốc độ) */
  mau_tham_so?: Record<string, number | string>;
  goc?: GocNhin;
  cam?: string;
  /** cách vào khung: pop (1 frame, mặc định) | lao (key nghiêng 1 frame + overshoot) */
  vao?: 'pop' | 'lao';
  /** tóc/kiểu tuỳ biến cho nhân vật phụ `trang` */
  toc?: {mau: string; mai: 'lech-phai' | 'lech-trai' | 'ngang' | 're-giua' | 'hat' | 'dung'; lon: 0 | 2 | 4; sau: 'khong' | 'bob' | 'dai' | 'duoi-ngua' | 'bui' | 'ngan'};
};

/** prop vẽ nét đen không tô trên nền trắng — tên phải có trong PROP_TEN */
export type Prop = {
  ten: string;
  /** tâm đáy prop theo tỉ lệ khung */
  x: number;
  y: number;
  /** hệ số cỡ, 1 = cỡ chuẩn thiết kế cho cỡ cảnh trung */
  co?: number;
  flip?: boolean;
  /** hiện tại giây thứ mấy của shot (pop) — mặc định 0 */
  tai?: number;
  /** vẽ TRƯỚC nhân vật (bàn che chân người ngồi) */
  truoc?: boolean;
};

export const PROP_TEN = [
  'ban-hoc', // bàn học sinh có ghế liền
  'ban-giao-vien', // bàn giáo viên
  'bang-den', // bảng đen treo
  'day-ban-lop', // 6 bàn học xếp hàng, phối cảnh 1 điểm tụ
  'cua', // cửa ra vào có khung
  'cua-so', // cửa sổ
  'ghe-da', // ghế đá công viên
  'goc-cay', // gốc cây + tán lá nét
  'cot-dien', // cột điện có dây
  'xe-dap', // xe đạp nhìn ngang
  'ban-cafe', // bàn tròn cà phê + 2 tách
  'ly-tra-sua', // ly trà sữa có ống hút
  'ao-mua', // áo mưa mỏng
  'mua', // vạch mưa chéo phủ khung
  'sach', // cuốn sách
  'la-thu', // lá thư gấp
  'but', // cây bút bi
  'dien-thoai', // điện thoại
  'laptop', // laptop mở
  'ban-phong-van', // bàn dài phỏng vấn + 3 ghế
  'dong-ho', // đồng hồ tường
  'may-bay-giay', // máy bay giấy
  'trai-tim', // trái tim nét
  'mui-ten', // mũi tên chỉ (dùng với chữ nhãn)
  'giot-mo-hoi', // giọt mồ hôi to (gag)
  'vach-buc', // vạch "bực" trên đầu
  'bong-chu', // bóng thoại trống để đặt chữ
  'cong-truong', // cổng trường + băng rôn
  'giuong', // giường nhìn ngang có gối, chăn
  'tu-lanh', // tủ lạnh hai ngăn, giấy nhớ dán cửa
  'ban-an', // bàn ăn bốn chân + 2 ghế tựa + đĩa, bát đũa
  'tivi', // tivi màn phẳng trên chân đế
  'ghe-sofa', // ghế sofa ba mảng, hai tay vịn
  'cua-nha', // cửa nhà có mái hiên, ngưỡng cửa
  'den-ngu', // đèn ngủ trên tủ đầu giường
  'cau-thang', // cầu thang 5 bậc lên bên phải, có tay vịn
  'xe-buyt', // xe buýt nhìn ngang, đầu bên phải, cửa giữa mở
  'tram-xe-buyt', // trạm xe buýt: mái che, kính sau, ghế chờ, biển trạm
  'den-duong', // đèn đường cần cong sang phải
  'hang-rao', // hàng rào gỗ 7 thanh đầu nhọn
  'cay-nho', // cây nhỏ thân mảnh tán tròn (bằng nửa goc-cay)
  'thung-rac', // thùng rác có nắp
  'cot-co', // cột cờ trên bệ hai bậc, cờ bay phải không tô
  'may', // mây bụng phẳng 4 múi (đặt cao, tâm đáy = mép dưới)
  'may-2', // mây dài thấp 5 múi
  'mat-troi', // mặt trời + 8 tia
  'mat-trang', // trăng lưỡi liềm + 2 sao
  'ghe-nha-hang', // ghế đơn nhìn thẳng (quán, căng tin)
  'quay-cang-tin', // quầy căng tin: tủ kính, máy tính tiền, bảng thực đơn treo
  'khay-com', // khay cơm: bát cơm đũa, đĩa, ly
  'bang-tin', // bảng thông báo có 4 tờ giấy ghim
  'day-ban-sau', // dãy bàn nhìn từ bảng xuống: lưng ghế quay về người xem (góc thầy)
  'man-hinh-chat', // khung điện thoại to, 3 bóng chat trống (bối cảnh man-hinh-dien-thoai)
] as const;
export type TenProp = (typeof PROP_TEN)[number];

export type Chu = {
  noi_dung: string;
  /** kem: chữ kèm cạnh nhân vật | the: tiêu đề to giữa khung | nhan: nhãn nhỏ có mũi tên | tay: chữ viết tay nhỏ */
  kieu?: 'kem' | 'the' | 'nhan' | 'tay';
  vi_tri?: 'giua' | 'trai' | 'phai' | 'tren' | 'duoi' | 'canh-dau';
  /** tuc-thi: hiện 1 frame (mặc định) | tung-tu: hiện từng từ theo nhịp đọc | phong: phóng to tuyến tính rồi cắt */
  vao?: 'tuc-thi' | 'tung-tu' | 'phong';
  /** giây xuất hiện tính từ đầu shot */
  tai?: number;
  /** màu nhấn (mặc định đen) */
  mau?: string;
};

export type Insert = {
  /** đường dẫn trong public/ (vd meme/xxx.jpg) */
  anh: string;
  /** hệ số cỡ theo bề rộng khung, mặc định 0.5 */
  co?: number;
  /** góc xoay nhẹ như ảnh dán */
  xoay?: number;
};

export type Shot = {
  /** đoạn lời bình để neo mốc đầu shot (phải có nguyên văn trong `vo`) */
  say?: string;
  /** hoặc: giây tuyệt đối trong chương (khi shot không neo vào lời — nhịp trắng, insert) */
  tai?: number;
  /** độ dài (giây) — chỉ dùng cho shot không có shot kế tiếp nối ngay (trong, insert). Mặc định: tới mốc sau */
  dai?: number;
  loai?: LoaiShot;
  co?: CoCanh;
  /** nền: 'trang' (mặc định) */
  nen?: 'trang';
  /** bối cảnh dựng sẵn (src/v2/boi-canh.ts): 'lop-hoc', 'san-truong', 'phong-ngu'... — bung thành prop, prop khai thêm vẽ chồng lên */
  boi_canh?: string;
  prop?: Prop[];
  dien?: DienVien[];
  chu?: Chu[];
  insert?: Insert;
  /** tên sfx trong thu-vien.json, nổ ở đầu shot */
  sfx?: string;
  /** bước zoom cứng trong shot: [giây, hệ số] — vd [[0, 1], [0.75, 1.3]] */
  zoom_buoc?: [number, number][];
  /** chuyển vào shot này: cut (mặc định) | trang (2 frame trắng) | mo-chong (chỉ khi cần) */
  chuyen?: 'cut' | 'trang' | 'mo-chong';
  ghi_chu?: string;
};

export type BoardChuong = {
  id: string;
  /** file nhạc trong public/audio — mặc định theo cung bậc chương */
  nhac?: string;
  shots: Shot[];
};

export type Board = {
  du_an: string;
  /** người kể mặc định cho truc-dien */
  nguoi_ke: string;
  mac_dinh?: Pick<Shot, 'loai' | 'co' | 'nen'>;
  chuong: BoardChuong[];
};
