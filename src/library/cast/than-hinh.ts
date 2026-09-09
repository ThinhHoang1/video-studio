/**
 * Tỉ lệ và hình khối của nhân vật.
 *
 * Bản cũ sai từ gốc chứ không phải thiếu hiệu ứng:
 *   - đầu bán kính 96 trên thân cao 440 → đầu chiếm 44% chiều cao. Đó là tỉ lệ
 *     đồ chơi nhựa, nhìn là thấy "hình vẽ bằng code".
 *   - thân là một khối bầu, không vai không eo → không có bóng dáng người.
 *   - tay là đoạn thẳng gắn hình tròn ở đầu.
 *   - mặt là hình elip, không cằm.
 *   - không có mảng đổ bóng nào.
 *
 * Bản này dựng theo đầu-làm-đơn-vị như cách vẽ nhân vật thật.
 * Nhân vật cao 6 đầu — đủ ra dáng người trưởng thành mà vẫn giữ nét hoạt hình.
 * Gốc toạ độ đặt ở giữa hai bàn chân, trục y hướng lên là âm.
 */

/** Một đầu = 78px. Mọi kích thước khác suy ra từ đây. */
export const DAU = 78;

export const T = {
  /** tổng chiều cao: 6 đầu */
  cao: DAU * 6,

  // ── đầu ──────────────────────────────────────────────────────────
  dauR: DAU * 0.5,          // nửa bề ngang sọ
  dauCao: DAU * 0.56,       // nửa chiều cao sọ
  dauY: -DAU * 5.5,         // tâm sọ
  camY: -DAU * 4.86,        // đỉnh cằm

  // ── cổ ───────────────────────────────────────────────────────────
  coRong: DAU * 0.2,
  coY: -DAU * 4.84,

  // ── thân ─────────────────────────────────────────────────────────
  vaiY: -DAU * 4.6,
  vaiRong: DAU * 0.82,      // nửa bề ngang vai
  eoY: -DAU * 3.35,
  eoRong: DAU * 0.62,       // eo hẹp hơn vai — đây là thứ tạo dáng người
  hongY: -DAU * 2.9,
  hongRong: DAU * 0.72,

  // ── tay ──────────────────────────────────────────────────────────
  canhTay: DAU * 1.06,
  cangTay: DAU * 0.94,
  tayDay: DAU * 0.19,
  banTay: DAU * 0.17,

  // ── chân ─────────────────────────────────────────────────────────
  dui: DAU * 1.42,
  cangChan: DAU * 1.34,
  chanDay: DAU * 0.24,
  giay: DAU * 0.3,
};

/** Bảng màu nhân vật: mỗi màu đi kèm một tông tối để đổ bóng cel. */
export const M = {
  net: '#241c2e',
  da: '#f5c9a0',
  daToi: '#dda57e',
  daSang: '#ffdcbb',
  toc: '#2f2438',
  tocToi: '#221a29',
  tocSang: '#4a3a58',
  ao: '#4a72c8',
  aoToi: '#36549b',
  aoSang: '#6a92e0',
  quan: '#39405c',
  quanToi: '#2a3046',
  giay: '#22222e',
  tui: '#5b8f6a',
  tuiToi: '#437253',
  moi: '#a8524f',
  mieng: '#6e2b34',
  ma: '#e88a8a',
};
