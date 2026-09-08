/**
 * Neo một mẩu lời vào frame.
 *
 * Cách cũ dò `say` trong TỪNG cụm phụ đề, nên mẩu nào nằm vắt qua ranh giới
 * hai cụm là trượt — đã phải vá tay ba lần. Cách này dò trong TOÀN BỘ lời
 * bình để lấy vị trí ký tự, rồi mới quy ra cụm chứa vị trí đó. Mẩu dài bao
 * nhiêu, cắt ở đâu, đều không còn ảnh hưởng.
 */
export type Cum = {text: string; start: number; end: number};

const chuanHoa = (s: string) =>
  s
    .toLowerCase()
    .replace(/[.,!?;:"'…—–-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export const neo = (vo: string, cums: Cum[], say: string): number | null => {
  const kimVo = chuanHoa(vo);
  const kim = chuanHoa(say);
  const viTri = kimVo.indexOf(kim);
  if (viTri === -1) return null;

  // đi dọc các cụm, cộng dồn độ dài đã chuẩn hoá, tìm cụm chứa `viTri`
  let da = 0;
  for (const c of cums) {
    const dai = chuanHoa(c.text).length;
    // +1 cho khoảng trắng nối giữa hai cụm
    if (viTri <= da + dai) return Math.round(c.start);
    da += dai + 1;
  }
  return Math.round(cums[cums.length - 1].start);
};

/** Trả về danh sách mốc không neo được — để báo lỗi lúc build. */
export const neoNhieu = <T extends {say: string}>(
  vo: string,
  cums: Cum[],
  items: T[],
  nhan: string
): (T & {at: number})[] => {
  const ok: (T & {at: number})[] = [];
  for (const it of items) {
    const at = neo(vo, cums, it.say);
    if (at === null) {
      console.warn(`[${nhan}] không có trong lời bình: "${it.say}"`);
      continue;
    }
    ok.push({...it, at});
  }
  return ok;
};
