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
  trung: {dau: 330, chanY: 1.04, moTa: 'cắt ở cổ chân, thấy cả gối — mặc định minh hoạ'},
  can: {dau: 560, chanY: 1.5, moTa: 'cắt ngang eo — mặc định trực diện, phản ứng; thay/me/trang cần co 0.85–0.9'},
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
  /**
   * ghi chú hiển thị cho người đọc board — KHÔNG ảnh hưởng render, validator không kiểm.
   * Dùng khi rig `kieu` không trùng tên trong chuyện: {"kieu": "trang", "ten": "chị Trang (HR)"}
   * — `trang` là đầu trắng vô danh, còn "chị Trang" là nhân vật có tên trong kịch bản.
   */
  ten?: string;
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
  /** chữ điền vào prop có nhãn (bang-hieu, hop-nhan, bieu-tuong...) */
  chu?: string;
};

/**
 * PROP TỰ VẼ — khi thư viện thiếu, agent VẼ prop mới bằng dữ liệu (không cần code TSX).
 *
 * Toạ độ cục bộ px ở co = 1: gốc (0,0) là TÂM ĐÁY prop, x sang phải, y ÂM hướng lên
 * (cùng quy ước prop thư viện). Máy vẽ với đúng luật nét: viền đen dày `net`, thân
 * tô trắng nền, không đổ bóng; chỉ 'to' được tô màu và phải là màu nhấn phẳng.
 * Xem thử: node pipeline/xem-prop.mjs <du-an> <ten>  → out/<du-an>/prop-<ten>.png
 */
export type HinhVe =
  | {loai: 'net'; d: string} // đường nét hở (path SVG), không tô
  | {loai: 'khoi'; d: string} // khối kín: path SVG tô trắng + viền
  | {loai: 'hop'; x: number; y: number; w: number; h: number; bo?: number} // hộp (x,y góc trên trái), bo = bo góc
  | {loai: 'tron'; cx: number; cy: number; r: number}
  | {loai: 'bau'; cx: number; cy: number; rx: number; ry: number}
  | {loai: 'gach'; x1: number; y1: number; x2: number; y2: number}
  | {loai: 'chu'; x: number; y: number; text: string; co?: number; dam?: boolean} // chữ đen, co = cỡ px
  | {loai: 'to'; d: string; mau: string}; // khối tô màu nhấn phẳng (đỏ #f81000, xám #656565, pastel)

export type PropTuVe = {
  /** mô tả một dòng — để thu-vien và người sau hiểu */
  moTa: string;
  /** khung bao (px ở co=1): rộng toàn phần và cao từ đáy lên */
  rong: number;
  cao: number;
  hinh: HinhVe[];
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
  // ── prop có nhãn chữ (điền `chu`) ──
  'bang-hieu', // bảng hiệu đứng 2 chân, chữ `chu` giữa (mặc định "???")
  'hop-nhan', // thùng carton có nhãn dán ghi `chu` (TIỀN, BÀI TẬP, TƯƠNG LAI...)
  'bieu-tuong', // vòng tròn to có chữ `chu` giữa + 3 tia ($, %, ?, !, VND)
  'to-giay', // tờ giấy tiêu đề `chu` + 3 gạch dòng (hoá đơn, đơn xin việc, đề thi)
  'man-hinh', // màn hình máy tính to có chữ `chu` giữa (thông báo, tin nhắn)
  // ── công sở ──
  'ban-lam-viec', // bàn làm việc: bàn + màn hình + bàn phím, ghế xoay nhô sau
  'ghe-xoay', // ghế xoay văn phòng 5 chân có bánh
  'tu-ho-so', // tủ hồ sơ 3 ngăn kéo
  'may-in', // máy in có giấy nạp sau, tờ in ra trước
  'bang-trang', // bảng trắng đứng trên giá chữ A
  'the-nhan-vien', // thẻ nhân viên có dây đeo
  'thang-may', // cửa thang máy khép, bảng số tầng
  // ── tiền / kinh tế ──
  'tien-giay', // cọc tiền 3 tờ có dây buộc, ký hiệu $
  'dong-xu', // đồng xu dựng có ký hiệu $
  'vi-tien', // ví da gập, thẻ + tiền nhô ra
  'bieu-do-tang', // biểu đồ cột tăng + mũi tên lên
  'bieu-do-giam', // biểu đồ cột giảm + mũi tên xuống
  'heo-dat', // heo đất có đồng xu trên khe
  'may-atm', // máy ATM đứng: màn hình, bàn phím, khe tiền
  // ── ăn uống ──
  'bat-pho', // bát phở có đũa, khói
  'ly-cafe', // tách cà phê có đĩa lót, khói
  'dia-com', // đĩa cơm: mô cơm, trứng ốp la, thìa
  'xe-day-hang-rong', // xe đẩy hàng rong có mái che răng cưa, nồi bốc khói
  'ban-nhau', // bàn nhậu: 3 cốc bia bọt trào + đĩa mồi
  'tu-kinh-banh', // tủ kính bánh 2 tầng
  // ── giao thông ──
  'xe-may', // xe máy tay ga nhìn ngang, đầu bên phải
  'o-to', // ô tô nhìn ngang, đầu bên phải
  'may-bay', // máy bay chở khách nhìn ngang, mũi bên phải
  'tau-hoa', // đầu tàu hoả hơi nước nhìn ngang, đầu bên phải
  'den-giao-thong', // đèn giao thông 3 bóng (đỏ trên)
  'bien-bao', // biển báo tròn trên cột, chữ tuỳ `chu` (mặc định trống)
  // ── công nghệ ──
  'may-tinh-ban', // máy tính bàn: màn hình + thùng máy + bàn phím + chuột
  'tai-nghe', // tai nghe chụp
  'may-anh', // máy ảnh có ống kính tròn
  'robot-nho', // robot nhỏ đầu hộp có ăng-ten
  'wifi', // biểu tượng wifi: chấm + 3 cung sóng
  // ── thiên nhiên ──
  'nui', // dãy núi 3 đỉnh, đỉnh giữa có tuyết
  'bien-song', // 3 hàng sóng biển cuộn (đặt tâm đáy ở chân nhân vật)
  'cay-dua', // cây dừa thân cong, 5 tàu lá, 3 quả
  'hoa', // bó hoa 5 bông bọc giấy có nơ
  'mua-sao', // 3 sao rơi có vệt đuôi
  // ── y tế ──
  'giuong-benh', // giường bệnh nhìn ngang có cọc truyền dịch bên trái
  'ong-nghe', // ống nghe bác sĩ
  'hop-thuoc', // hộp thuốc cứu thương có dấu cộng
  'xe-cuu-thuong', // xe cứu thương nhìn ngang, đầu bên phải, đèn xoay
  // ── thể thao ──
  'bong-da', // quả bóng đá
  'khung-thanh', // khung thành có lưới (nhìn thẳng, lưới lùi sâu)
  'ta-tap', // tạ tay nằm ngang
  'vot-cau-long', // vợt cầu lông dựng + quả cầu
  'cup-vo-dich', // cúp vô địch có ngôi sao
] as const;
export type TenProp = (typeof PROP_TEN)[number];

export type Chu = {
  /**
   * Xuống dòng bằng "\n" (renderer split('\n'), mỗi dòng canh giữa riêng).
   * Giới hạn `the` (khối rộng 0.9 W, cỡ tự chọn 140/118/96 px theo tổng ký tự):
   *   - `giua` không nhân vật: ≤ 20 ký tự/dòng, ≤ 2 dòng
   *   - kèm nhân vật (`vi_tri` trai/phai, nhân vật ở nửa kia): ≤ 14 ký tự/dòng, ngắt bằng "\n"
   *   - `vao: phong` (phóng 1.6×): ≤ 12 ký tự/dòng
   *   Ví dụ: "Em ổn, chị\nTrang." · "CHẶT.\nRẤT CHẶT."
   */
  noi_dung: string;
  /** kem: chữ kèm cạnh nhân vật | the: tiêu đề to giữa khung | nhan: nhãn nhỏ có mũi tên | tay: chữ viết tay nhỏ */
  kieu?: 'kem' | 'the' | 'nhan' | 'tay';
  /**
   * `duoi` (tâm y 0.86 H) ĐÈ LÊN PHỤ ĐỀ tự động (renderer vẽ lời bình ở đáy, y ≈ 0.90–0.97 H)
   * → chỉ dùng `duoi` ở shot không có lời (trong/nhịp im); có lời thì dùng `tren` hoặc `giua`.
   */
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
  /** prop tự vẽ của dự án — tên ở đây dùng được trong Shot.prop[].ten và DienVien.cam như prop thư viện */
  prop_tu_ve?: Record<string, PropTuVe>;
  chuong: BoardChuong[];
};
