/**
 * Bộ tư thế của nhân vật.
 *
 * Bản trước chỉ có một dáng đứng, mọi "animation" là rung sine quanh dáng đó
 * — nhân vật trông như tượng biết thở. Sửa sine mượt hơn không cứu được, vì
 * thiếu hẳn một thứ khác: nhân vật phải LÀM gì khác nhau ở mỗi shot.
 *
 * QUY ƯỚC GÓC (quan trọng, sai là tay chui vào thân):
 *   vai   0° = tay thõng thẳng xuống
 *        90° = tay giơ ngang, chìa ra phía ngoài
 *       180° = tay giơ thẳng lên trời
 *   khuỷu 0° = cẳng tay thẳng hàng với cánh tay trên
 *        90° = gập vuông góc, cẳng tay hướng vào trong
 *
 * Hai bên dùng CÙNG giá trị dương; việc lật trái/phải do khâu vẽ lo. Nhờ vậy
 * "khoanh tay" chỉ cần một cặp số, không phải nhớ bên nào âm bên nào dương.
 */
export type Dang =
  | 'dung'       // đứng thường, tay buông hơi chìa
  | 'chi'        // chỉ tay ra trước
  | 'khoanhTay'  // khoanh tay trước ngực
  | 'omDau'      // hai tay ôm đầu
  | 'camDT'      // cầm điện thoại áp tai
  | 'gioTay'     // giơ một tay lên
  | 'nhunVai'    // nhún vai, hai tay xoè
  | 'cuiNguoi'   // cúi người xuống
  | 'tayHong'    // chống tay lên hông
  | 'goMay'      // hai tay đưa ra trước gõ phím
  | 'quayLung';  // quay lưng lại

export type Khop = {
  vaiT: number;
  vaiP: number;
  khuyuT: number;
  khuyuP: number;
  /** thân nghiêng, độ */
  than: number;
  /** đầu nghiêng, độ */
  dau: number;
  /** hạ thấp cả người — ngồi, cúi */
  hup: number;
  /** 1 = quay mặt ra, -1 = quay lưng */
  lat: 1 | -1;
  /** tay nào vẽ đè lên thân: cả hai khi cần đọc rõ dáng trước ngực */
  truoc?: 'phai' | 'ca-hai';
};

export const TU_THE: Record<Dang, Khop> = {
  dung:      {vaiT: 14,  vaiP: 14,  khuyuT: 6,  khuyuP: 6,  than: 0,  dau: 0,  hup: 0,  lat: 1},
  chi:       {vaiT: 14,  vaiP: 78,  khuyuT: 6,  khuyuP: 6,   than: 4,  dau: -3, hup: 0,  lat: 1, truoc: 'phai'},
  khoanhTay: {vaiT: 25,  vaiP: 25,  khuyuT: 115, khuyuP: 115, than: 0,  dau: 4,  hup: 0,  lat: 1, truoc: 'ca-hai'},
  omDau:     {vaiT: 170, vaiP: 170, khuyuT: 275,  khuyuP: 275,  than: -5, dau: 6,  hup: 10, lat: 1, truoc: 'ca-hai'},
  camDT:     {vaiT: 14,  vaiP: 160,  khuyuT: 6,  khuyuP: 250, than: 3,  dau: -8, hup: 0,  lat: 1, truoc: 'phai'},
  gioTay:    {vaiT: 14,  vaiP: 166, khuyuT: 6,  khuyuP: 12,  than: -3, dau: -5, hup: 0,  lat: 1},
  nhunVai:   {vaiT: 55,  vaiP: 55,  khuyuT: 95,  khuyuP: 95,  than: 0,  dau: 6,  hup: 6,  lat: 1, truoc: 'ca-hai'},
  cuiNguoi:  {vaiT: 22,  vaiP: 22,  khuyuT: 24,  khuyuP: 24,  than: 15, dau: 10, hup: 32, lat: 1},
  tayHong:   {vaiT: 35,  vaiP: 35,  khuyuT: 120, khuyuP: 120, than: -2, dau: -4, hup: 0,  lat: 1, truoc: 'ca-hai'},
  goMay:     {vaiT: 40,  vaiP: 40,  khuyuT: 105,  khuyuP: 105,  than: 8,  dau: 10, hup: 8,  lat: 1, truoc: 'ca-hai'},
  quayLung:  {vaiT: 10,  vaiP: 10,  khuyuT: 8,   khuyuP: 8,   than: 0,  dau: 0,  hup: 0,  lat: -1},
};

/** Trộn hai tư thế — dùng khi đang trượt từ shot trước sang shot này. */
export const tron = (a: Khop, b: Khop, t: number): Khop => {
  const k = (x: number, y: number) => x + (y - x) * t;
  return {
    vaiT: k(a.vaiT, b.vaiT),
    vaiP: k(a.vaiP, b.vaiP),
    khuyuT: k(a.khuyuT, b.khuyuT),
    khuyuP: k(a.khuyuP, b.khuyuP),
    than: k(a.than, b.than),
    dau: k(a.dau, b.dau),
    hup: k(a.hup, b.hup),
    lat: t < 0.5 ? a.lat : b.lat,
    truoc: t < 0.5 ? a.truoc : b.truoc,
  };
};
