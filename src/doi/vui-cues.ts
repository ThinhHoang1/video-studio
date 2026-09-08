/**
 * Meme và SFX được neo vào MỘT MẨU LỜI cụ thể, không rải theo đồng hồ.
 * Punchline mà meme nhảy vào trễ nửa giây là hỏng cả câu đùa, nên chỗ này
 * phải khai báo tay chứ không sinh tự động.
 */
export type MemeCue = {say: string; src: string; cap?: string; giay?: number};
export type SfxCue = {say: string; sfx: string};

export const MEME: Record<string, MemeCue[]> = {
  'tam-bang': [
    {say: 'tấm nào mày cũng nhắm mắt', src: 'meme/spongebob.jpg', cap: 'ảnh kỷ yếu của tôi'},
    {say: 'Chỉ là khác theo hướng mày không hề tưởng tượng ra', src: 'meme/panik-kalm-panik.png', cap: 'đời mình sắp khác'},
  ],
  'rai-cv': [
    {say: 'ngồi im để đứa khác làm slide', src: 'meme/harold.jpg', cap: '"kỹ năng làm việc nhóm"'},
    {say: 'quảng cáo khoá học tiếng Anh', src: 'meme/khaby-lame.jpg', cap: '2/200 email'},
  ],
  'phong-van': [
    {say: 'Muốn có kinh nghiệm thì phải được đi làm', src: 'meme/drake.png', cap: 'cái vòng bất tử'},
    {say: 'cả một thế hệ đang xếp hàng để bước vào', src: 'meme/pooh.png', cap: 'vòng luẩn quẩn vs cái bẫy'},
  ],
  'ngay-dau': [
    {say: 'nhìn như vừa bóc ra khỏi túi', src: 'meme/cheems.jpg', cap: 'áo còn 3 nếp gấp'},
    {say: 'mày lẻn theo sau như đang nhập nhóm', src: 'meme/gru.jpg', cap: 'chiến thuật nhập nhóm'},
  ],
  'cai-email': [
    {say: 'thêm thì sợ non, không thêm thì sợ vô lễ', src: 'meme/panik-kalm-panik.png', cap: 'thêm "ạ" hay không'},
    {say: 'quên đính kèm file', src: 'meme/fine.gif', cap: 'gửi rồi mới nhớ'},
  ],
  hop: [
    {say: 'thực ra đang vẽ', src: 'meme/rollsafe.gif', cap: 'ghi chép rất chăm'},
    {say: 'có trách nhiệm', src: 'meme/stonks.png', cap: '"em thấy hợp lý ạ"'},
  ],
  'vo-hinh': [
    {say: 'người ta chỉ lặng lẽ làm lại', src: 'meme/woman-cat.jpg', cap: 'chế độ tàng hình'},
  ],
  'luong-dau': [
    {say: 'mày cảm thấy mình giàu', src: 'meme/stonks.png', cap: 'trong đúng 30 giây'},
    {say: 'Còn lại đủ để sống đến ngày mười tám', src: 'meme/cheems.jpg', cap: 'ngày 18 → mì gói'},
  ],
  'so-sanh': [
    {say: 'một tay bốc snack', src: 'meme/pooh.png', cap: 'story của nó vs đời mình'},
    {say: 'Mày chỉ chưa bao giờ thật sự tham gia', src: 'meme/rollsafe.gif', cap: 'không thua nếu không chơi'},
  ],
  'quen-dan': [
    {say: 'không quên file', src: 'meme/stonks.png', cap: 'level up'},
  ],
  ket: [
    {say: 'người từng sợ vãi ra, và vẫn đi tiếp', src: 'meme/harold.jpg', cap: 'tân binh năm ấy'},
  ],
};

export const SFX: Record<string, SfxCue[]> = {
  'tam-bang': [
    {say: 'Bố mẹ chụp bốn trăm tấm ảnh', sfx: 'pop'},
    {say: 'Từ mai đời mày khác thật', sfx: 'boom'},
  ],
  'rai-cv': [
    {say: 'Rồi mày gửi đi hai trăm cái', sfx: 'whoosh-up'},
    {say: 'Nhận về hai email', sfx: 'thud'},
    {say: 'quảng cáo khoá học tiếng Anh', sfx: 'pop-high'},
  ],
  'phong-van': [
    {say: 'Em có kinh nghiệm chưa', sfx: 'riser'},
    {say: 'Nó là cái bẫy tuyển dụng', sfx: 'boom'},
  ],
  'ngay-dau': [
    {say: 'không dám lên', sfx: 'whoosh-down'},
    {say: 'một mã nhân viên', sfx: 'ding'},
    {say: 'máy chấm công', sfx: 'thud'},
  ],
  'cai-email': [
    {say: 'Mày viết trong bốn mươi phút', sfx: 'tick'},
    {say: 'Bấm gửi', sfx: 'ding'},
    {say: 'quên đính kèm file', sfx: 'boom'},
  ],
  hop: [
    {say: 'Một tiếng rưỡi', sfx: 'thud'},
    {say: 'để tuần sau họp tiếp', sfx: 'deflate'},
    {say: 'có trách nhiệm', sfx: 'ding'},
  ],
  'vo-hinh': [{say: 'Đáng sợ là lúc người ta thôi không nói gì nữa', sfx: 'deflate'}],
  'luong-dau': [
    {say: 'thấy con số', sfx: 'cash'},
    {say: 'Ba mươi giây', sfx: 'deflate'},
    {say: 'Nhưng nó là của mày', sfx: 'ding'},
  ],
  'goi-ve-nha': [{say: 'Và cả hai đều không nói ra', sfx: 'deflate'}],
  'hoi-sinh': [{say: 'đặt xuống bàn mày một hộp sữa', sfx: 'ding'}],
  'so-sanh': [
    {say: 'Đứa bạn cùng lớp vừa lên chức', sfx: 'whoosh-up'},
    {say: 'một tay bốc snack', sfx: 'pop'},
    {say: 'Mày chỉ chưa bao giờ thật sự tham gia', sfx: 'boom'},
  ],
  'quen-dan': [
    {say: 'không quên file', sfx: 'ding'},
    {say: 'Mày chỉ biết khi đã ướt', sfx: 'pop-high'},
  ],
  'cho-cha-me': [{say: 'Chúng ta chỉ là thế hệ đầu tiên nói ra', sfx: 'ding'}],
  ket: [
    {say: 'thành người từng sợ vãi ra', sfx: 'riser'},
    {say: 'Đéo ai bắt đầu mà đã giỏi cả', sfx: 'boom'},
  ],
};

/** Nhạc funk theo chương — không để một bài chạy suốt. */
export const NHAC: Record<string, string> = {
  'tam-bang': 'audio/25-silly-fun.mp3',
  'rai-cv': 'audio/22-flutey-funk.mp3',
  'phong-van': 'audio/24-grand-chase.mp3',
  'ngay-dau': 'audio/20-daily-beetle.mp3',
  'cai-email': 'audio/21-electro-cabello.mp3',
  hop: 'audio/26-style-funk.mp3',
  'vo-hinh': 'audio/22-flutey-funk.mp3',
  'luong-dau': 'audio/23-got-funk.mp3',
  'goi-ve-nha': 'audio/17-where-stars-fall.mp3',
  'hoi-sinh': 'audio/16-restoration.mp3',
  'so-sanh': 'audio/26-style-funk.mp3',
  'quen-dan': 'audio/27-the-builder.mp3',
  'cho-cha-me': 'audio/15-distant-sun.mp3',
  ket: 'audio/13-eternal-hope.mp3',
};
