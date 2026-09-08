import type {Sac} from '../../library/cast/dien';

/**
 * Bảng phân cảnh cấp shot. Mỗi mốc khai báo: nghe tới câu này thì đổi sang
 * cảnh nào, cỡ nào, nhân vật đang thế nào.
 *
 * Cảnh giữ nguyên cho tới mốc kế tiếp, nên chỉ cần khai báo chỗ ĐỔI.
 * `nguoi: false` cho những cảnh đặc tả màn hình / vật thể — không nhét
 * nhân vật vào cho có.
 */
export type Moc = {
  say: string;
  canh: string;
  co?: 'rong' | 'trung' | 'can' | 'sat';
  sac?: Sac;
  nguoi?: boolean;
  /** vị trí nhân vật trong hệ 1920 */
  x?: number;
};

export const BOARD: Record<string, Moc[]> = {
  'tam-bang': [
    {say: 'Hôm nhận bằng', canh: 'le-tot-nghiep', co: 'rong', sac: 'vui'},
    {say: 'Bố mẹ chụp bốn trăm tấm ảnh', canh: 'le-tot-nghiep', co: 'can', sac: 'vui'},
    {say: 'tấm nào mày cũng nhắm mắt', canh: 'le-tot-nghiep', co: 'sat', sac: 'soc'},
    {say: 'Cả nhà đăng Facebook', canh: 'le-tot-nghiep', co: 'trung', sac: 'vui'},
    {say: 'tim đập thình thịch', canh: 'le-tot-nghiep', co: 'can', sac: 'vui'},
    {say: 'Từ mai đời mày khác thật', canh: 'the-nhan-vien', co: 'rong', nguoi: false},
    {say: 'không hề tưởng tượng', canh: 'le-tot-nghiep', co: 'trung', sac: 'nghi'},
  ],
  'rai-cv': [
    {say: 'Mày sửa CV đến lần thứ mười một', canh: 'man-hinh-cv', co: 'rong', nguoi: false},
    {say: 'Đổi phông chữ', canh: 'man-hinh-cv', co: 'can', nguoi: false},
    {say: 'nghe hơi giả', canh: 'phong-tro', co: 'can', sac: 'nghi'},
    {say: 'ngồi im để đứa khác làm slide', canh: 'phong-tro', co: 'trung', sac: 'met'},
    {say: 'Rồi mày gửi đi hai trăm cái', canh: 'man-hinh-cv', co: 'trung', nguoi: false},
    {say: 'Nhận về hai email', canh: 'hop-thu', co: 'rong', nguoi: false},
    {say: 'quảng cáo khoá học tiếng Anh', canh: 'hop-thu', co: 'can', nguoi: false},
  ],
  'phong-van': [
    {say: 'Rồi cũng có một nơi gọi', canh: 'phong-tro', co: 'can', sac: 'soc'},
    {say: 'ngồi quán cà phê đối diện', canh: 'quan-cafe', co: 'trung', sac: 'nghi'},
    {say: 'thuộc như bảng cửu chương', canh: 'quan-cafe', co: 'can', sac: 'nghi'},
    {say: 'Vào phòng', canh: 'phong-van', co: 'rong', sac: 'soc'},
    {say: 'Em có kinh nghiệm chưa', canh: 'phong-van', co: 'sat', sac: 'soc'},
    {say: 'Muốn có kinh nghiệm thì phải được đi làm', canh: 'phong-van', co: 'trung', sac: 'met'},
    {say: 'Nó là cái bẫy tuyển dụng', canh: 'phong-van', co: 'can', sac: 'tuc'},
    {say: 'cả một thế hệ đang xếp hàng', canh: 'sanh', co: 'rong', sac: 'buon'},
  ],
  'ngay-dau': [
    {say: 'Ngày đi làm đầu tiên', canh: 'sanh', co: 'rong', sac: 'thuong'},
    {say: 'còn nguyên nếp gấp ba đường', canh: 'sanh', co: 'sat', sac: 'nghi'},
    {say: 'đứng dưới sảnh', canh: 'sanh', co: 'trung', sac: 'soc'},
    {say: 'sợ mình là người đầu tiên', canh: 'sanh', co: 'can', sac: 'soc'},
    {say: 'mày lẻn theo sau', canh: 'sanh', co: 'rong', sac: 'nghi'},
    {say: 'Người ta dẫn mày tới một cái bàn', canh: 'van-phong', co: 'rong', sac: 'thuong'},
    {say: 'một mã nhân viên', canh: 'the-nhan-vien', co: 'trung', nguoi: false},
    {say: 'máy chấm công', canh: 'the-nhan-vien', co: 'can', nguoi: false},
  ],
  'cai-email': [
    {say: 'Việc đầu tiên', canh: 'van-phong', co: 'can', sac: 'thuong'},
    {say: 'Nội dung đúng một câu', canh: 'man-hinh-email', co: 'rong', nguoi: false},
    {say: 'Mày viết trong bốn mươi phút', canh: 'man-hinh-email', co: 'can', nguoi: false},
    {say: 'hay Dear anh', canh: 'man-hinh-email', co: 'sat', nguoi: false},
    {say: 'thêm thì sợ non', canh: 'van-phong', co: 'sat', sac: 'soc'},
    {say: 'Bấm gửi', canh: 'man-hinh-email', co: 'trung', nguoi: false},
    {say: 'quên đính kèm file', canh: 'man-hinh-email', co: 'sat', nguoi: false},
    {say: 'một cái email đính chính', canh: 'van-phong', co: 'can', sac: 'met'},
  ],
  hop: [
    {say: 'Rồi mày được mời vào cuộc họp đầu tiên', canh: 'phong-hop', co: 'rong', nguoi: false},
    {say: 'Một tiếng rưỡi', canh: 'dong-ho-hop', co: 'rong', nguoi: false},
    {say: 'Mười hai người', canh: 'phong-hop', co: 'trung', nguoi: false},
    {say: 'để tuần sau họp tiếp', canh: 'dong-ho-hop', co: 'can', nguoi: false},
    {say: 'thực ra đang vẽ', canh: 'phong-hop', co: 'can', sac: 'met'},
    {say: 'em thấy hợp lý ạ', canh: 'phong-hop', co: 'sat', sac: 'nghi'},
    {say: 'có trách nhiệm', canh: 'van-phong', co: 'can', sac: 'vui'},
  ],
  'vo-hinh': [
    {say: 'mày thấy mình trong suốt', canh: 'van-phong-tu-xa', co: 'rong', nguoi: false},
    {say: 'câu ngu', canh: 'phong-hop', co: 'can', sac: 'buon'},
    {say: 'người ta chỉ lặng lẽ làm lại', canh: 'van-phong', co: 'trung', sac: 'buon'},
    {say: 'Bị chê nghĩa là còn có người kỳ vọng', canh: 'van-phong', co: 'can', sac: 'nghi'},
    {say: 'thôi không nói gì nữa', canh: 'van-phong-tu-xa', co: 'trung', nguoi: false},
    {say: 'thôi không tính mày vào', canh: 'van-phong-tu-xa', co: 'can', nguoi: false},
  ],
  'luong-dau': [
    {say: 'tháng lương đầu tiên về', canh: 'dien-thoai-luong', co: 'rong', nguoi: false},
    {say: 'thấy con số', canh: 'dien-thoai-luong', co: 'can', nguoi: false},
    {say: 'mày cảm thấy mình giàu', canh: 'phong-tro', co: 'can', sac: 'vui'},
    {say: 'Ba mươi giây', canh: 'phong-tro', co: 'sat', sac: 'soc'},
    {say: 'trừ tiền nhà', canh: 'phong-tro', co: 'trung', sac: 'met'},
    {say: 'sống đến ngày mười tám', canh: 'phong-tro', co: 'can', sac: 'met'},
    {say: 'không phải bố mẹ cho', canh: 'dien-thoai-luong', co: 'trung', nguoi: false},
    {say: 'Nhưng nó là của mày', canh: 'phong-tro', co: 'can', sac: 'vui'},
  ],
  'goi-ve-nha': [
    {say: 'Mẹ gọi', canh: 'phong-tro-dem', co: 'rong', sac: 'thuong'},
    {say: 'ăn uống ra sao', canh: 'phong-tro-dem', co: 'can', sac: 'thuong'},
    {say: 'ăn mì gói', canh: 'phong-tro-dem', co: 'sat', sac: 'met'},
    {say: 'ở đây vui lắm mẹ', canh: 'phong-tro-dem', co: 'can', sac: 'vui'},
    {say: 'là mẹ nghe ra ngay', canh: 'phong-tro-dem', co: 'sat', sac: 'buon'},
    {say: 'ở nhà mọi thứ vẫn tốt', canh: 'phong-tro-anh', co: 'trung', nguoi: false},
    {say: 'cùng nói dối nhau một chuyện y hệt', canh: 'phong-tro-dem', co: 'trung', sac: 'buon'},
    {say: 'cả hai đều không nói ra', canh: 'phong-tro-dem', co: 'can', sac: 'buon'},
  ],
  'hoi-sinh': [
    {say: 'mày ở lại muộn', canh: 'van-phong-dem', co: 'rong', sac: 'met'},
    {say: 'deadline sáng mai', canh: 'van-phong-dem', co: 'can', sac: 'met'},
    {say: 'đặt xuống bàn mày một hộp sữa', canh: 'van-phong-dem', co: 'sat', nguoi: false},
    {say: 'việc này mai làm cũng được', canh: 'van-phong-dem', co: 'trung', sac: 'soc'},
    {say: 'Còn mày thì nhớ ba năm', canh: 'van-phong-dem', co: 'can', sac: 'vui'},
    {say: 'lẻn vào đúng lúc người ta yếu nhất', canh: 'van-phong-dem', co: 'trung', sac: 'thuong'},
  ],
  'so-sanh': [
    {say: 'mày mở mạng xã hội lên', canh: 'giuong-dem', co: 'rong', sac: 'met'},
    {say: 'Đứa bạn cùng lớp vừa lên chức', canh: 'giuong-dem', co: 'can', sac: 'soc'},
    {say: 'Đứa khác đang ở Nhật', canh: 'giuong-dem', co: 'trung', sac: 'buon'},
    {say: 'một tay bốc snack', canh: 'giuong-dem', co: 'sat', sac: 'met'},
    {say: 'làm gì với cuộc đời', canh: 'giuong-dem', co: 'can', sac: 'buon'},
    {say: 'Không ai đăng ba trăm sáu mươi tư ngày còn lại', canh: 'phong-tro', co: 'trung', sac: 'nghi'},
    {say: 'Mày chỉ chưa bao giờ thật sự tham gia', canh: 'phong-tro', co: 'can', sac: 'vui'},
  ],
  'quen-dan': [
    {say: 'trả lời được câu hỏi', canh: 'van-phong', co: 'can', sac: 'vui'},
    {say: 'máy pha cà phê tầng nào ngon hơn', canh: 'van-phong', co: 'trung', sac: 'vui'},
    {say: 'Biết im lúc nào', canh: 'phong-hop', co: 'can', sac: 'nghi'},
    {say: 'không quên file', canh: 'man-hinh-email', co: 'trung', nguoi: false},
    {say: 'Không ai vỗ tay', canh: 'van-phong', co: 'rong', sac: 'thuong'},
    {say: 'Mày chỉ biết khi đã ướt', canh: 'van-phong', co: 'can', sac: 'thuong'},
  ],
  'cho-cha-me': [
    {say: 'hiếm ai nghĩ tới', canh: 'phong-tro-anh', co: 'rong', nguoi: false},
    {say: 'Bố mẹ mày cũng từng có một năm đầu đi làm', canh: 'phong-tro-anh', co: 'can', nguoi: false},
    {say: 'không biết trả lời', canh: 'phong-van', co: 'trung', sac: 'soc'},
    {say: 'cầm tháng lương đầu tiên và thấy nó bé', canh: 'dien-thoai-luong', co: 'trung', nguoi: false},
    {say: 'quay video kể lại', canh: 'phong-tro-anh', co: 'sat', nguoi: false},
    {say: 'đã từng nói dối y hệt như vậy', canh: 'phong-tro-dem', co: 'can', sac: 'buon'},
    {say: 'thế hệ đầu tiên nói ra', canh: 'phong-tro-anh', co: 'trung', nguoi: false},
  ],
  ket: [
    {say: 'không phải năm để mày giỏi', canh: 'van-phong', co: 'trung', sac: 'thuong'},
    {say: 'dốt ở chỗ nào', canh: 'van-phong', co: 'can', sac: 'nghi'},
    {say: 'Quên tên cái dự án đầu tiên', canh: 'van-phong-tu-xa', co: 'rong', nguoi: false},
    {say: 'đứng dưới sảnh', canh: 'sanh', co: 'rong', sac: 'buon'},
    {say: 'áo sơ mi còn nếp gấp', canh: 'sanh', co: 'sat', sac: 'buon'},
    {say: 'đứa em vừa ra trường', canh: 'quan-cafe', co: 'trung', sac: 'thuong'},
    {say: 'người từng sợ vãi ra', canh: 'le-tot-nghiep', co: 'can', sac: 'vui'},
    {say: 'Cứ đi đi', canh: 'le-tot-nghiep', co: 'rong', sac: 'vui'},
  ],
};
