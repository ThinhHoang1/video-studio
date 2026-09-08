import {splitCues, cueTimings} from '../components/Caption2';
import type {Shot, ShotKind} from './types';

/**
 * Chia một chương thành các shot, CẮT THEO CÂU NÓI chứ không cắt theo đồng hồ.
 * Mỗi shot dài khoảng 3-4.5 giây — nhịp cắt của một video explainer bình thường.
 * Ranh giới shot luôn rơi vào ranh giới cụm phụ đề, nên không bao giờ cắt
 * giữa một câu đang nói dở.
 */
export const planShots = ({
  vo,
  audioFrames,
  fps,
  pattern,
  beats,
}: {
  vo: string;
  audioFrames: number;
  fps: number;
  /** thứ tự loại shot cho chương này, lặp lại nếu hết */
  pattern: ShotKind[];
  /** nội dung cho các shot chữ/số, dùng lần lượt */
  beats?: Partial<Shot>[];
}): Shot[] => {
  const cues = splitCues(vo);
  const times = cueTimings(cues, audioFrames);

  const target = 3.6 * fps;
  const min = 2.2 * fps;

  // gom các cụm phụ đề liền nhau lại cho tới khi đủ dài thì cắt
  const groups: {start: number; end: number}[] = [];
  let start = 0;
  for (let i = 0; i < times.length; i++) {
    const end = times[i].end;
    if (end - start >= target || i === times.length - 1) {
      if (end - start < min && groups.length) groups[groups.length - 1].end = end;
      else groups.push({start, end});
      start = end;
    }
  }

  const enters: Shot['enter'][] = ['cut', 'whipL', 'pushUp', 'zoomBlur', 'cut', 'whipR', 'slideL', 'pushDown'];
  let beatIdx = 0;

  return groups.map((g, i) => {
    const kind = pattern[i % pattern.length];
    const needsContent = kind === 'statement' || kind === 'number' || kind === 'split' || kind === 'meme';
    const extra = needsContent ? (beats?.[beatIdx++] ?? {}) : {};
    return {
      kind,
      from: Math.round(g.start),
      duration: Math.max(1, Math.round(g.end - g.start)),
      // shot đầu của chương luôn cắt thẳng — chuyển cảnh đã nằm ở ranh giới chương
      enter: i === 0 ? 'cut' : enters[i % enters.length],
      ...extra,
    } as Shot;
  });
};
