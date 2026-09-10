import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {NEN, MUC} from '../rig/hinh';
import type {Board} from '../board/kieu-board';
import {Sub} from '../../engine/sub';
import {FONT} from '../../engine/font';
import {ChuongDung, Manifest, MouthTrack, VoiceTrack, dungChuong, f} from './du-lieu';
import {SanKhau, W, H} from './san-khau';

/**
 * PHIM V2 — ghép board + giọng + lip-sync thành composition.
 *
 * Khác V1: nền trắng, cắt cứng, không zoom trượt, không mờ chồng mặc định,
 * shot ngắn tới 0.25 s, nhân vật đổi tư thế trong shot theo `act`, miệng theo
 * lip-sync. Mỗi chương là một Sequence; trong chương mỗi shot một Sequence.
 */
export type DuLieuPhim = {
  board: Board;
  manifest: Manifest;
  voices: Record<string, VoiceTrack>;
  mouths?: Record<string, MouthTrack>;
  /** hiện phụ đề nhỏ dưới đáy (mặc định có) */
  phuDe?: boolean;
  /** tiêu đề mở đầu (2 s) — bỏ nếu không muốn */
  tieuDe?: string;
};

/** board ghi tên trong thư viện ('25-silly-fun') hoặc đường dẫn ('audio/25-silly-fun.mp3') */
const duongNhac = (t?: string) => (!t ? undefined : t.includes('/') ? t : `audio/${t}.mp3`);

/**
 * Nhạc nền và tiếng động nằm ngoài git (public/audio 93 MB, public/sfx) — bản clone mới KHÔNG có.
 * Trước đây thiếu file là Remotion ném "Could not play audio" và hỏng cả bản render.
 * Nay thiếu thì bỏ qua, video vẫn ra, chỉ mất nhạc; chạy `node pipeline/tai-nhac.mjs` để có nhạc.
 */
const CoTiengNeuCo: React.FC<{src: string; volume?: number; loop?: boolean}> = ({src, volume, loop}) => {
  const [hong, datHong] = React.useState(false);
  if (hong) return null;
  return <Audio src={staticFile(src)} volume={volume} loop={loop} onError={() => datHong(true)} />;
};

const NHAC_VUI = ['audio/25-silly-fun.mp3', 'audio/22-flutey-funk.mp3', 'audio/23-got-funk.mp3', 'audio/26-style-funk.mp3', 'audio/20-daily-beetle.mp3', 'audio/27-the-builder.mp3'];

export const dungPhim = (d: DuLieuPhim) => {
  const theoId = new Map(d.board.chuong.map((c) => [c.id, c]));
  const chuong: ChuongDung[] = d.manifest.chapters.map((ch) => dungChuong(ch, theoId.get(ch.id), d.board.mac_dinh, d.voices[ch.id]));
  const INTRO = d.tieuDe ? f(1.6) : 0;
  // có chương mo-bai → cold open chạy trước, thẻ tiêu đề chèn SAU nó như logo kênh; không có → thẻ đứng đầu
  const viTriIntro = chuong[0]?.id === 'mo-bai' ? 1 : 0;
  const starts: number[] = [];
  let acc = 0;
  let introTai = 0;
  chuong.forEach((c, i) => {
    if (i === viTriIntro) { introTai = acc; acc += INTRO; }
    starts.push(acc);
    acc += c.total;
  });
  if (viTriIntro >= chuong.length) { introTai = acc; acc += INTRO; }
  return {chuong, starts, INTRO, introTai, total: acc};
};

const Chuong: React.FC<{d: DuLieuPhim; c: ChuongDung; audio: string; nhac: string; phuDe: boolean}> = ({d, c, audio, nhac, phuDe}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: NEN}}>
      {c.shots.map((s) => (
        <Sequence key={s.idx} from={s.from} durationInFrames={s.len} layout="none">
          <SanKhau shot={s} frame={Math.max(0, frame - s.from)} frameChuong={frame} cues={c.cues} mouth={d.mouths?.[c.id]} voice={d.voices[c.id]} nguoiKe={d.board.nguoi_ke} id={`${c.id}-${s.idx}`} propTuVe={d.board.prop_tu_ve} />
          {s.sfx && <CoTiengNeuCo src={`sfx/${s.sfx}.wav`} volume={0.55} />}
        </Sequence>
      ))}
      {phuDe && <Sub cues={c.cues} toi />}
      <Audio src={staticFile(audio)} />
      <CoTiengNeuCo src={nhac} volume={0.09} loop />
    </AbsoluteFill>
  );
};

const TieuDe: React.FC<{t: string}> = ({t}) => {
  const frame = useCurrentFrame();
  // pop 4 frame: 0.08 → 0.95 → 1.045 → 1 (đo từ tham chiếu), rồi giữ
  const k = [0.08, 0.95, 1.045, 1][Math.min(3, frame)];
  return (
    <AbsoluteFill style={{background: NEN, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 120, color: MUC, textAlign: 'center', maxWidth: 1500, lineHeight: 1.1, transform: `scale(${k})`}}>{t}</div>
    </AbsoluteFill>
  );
};

/** Sub cần cues theo frame CHƯƠNG — Sub dùng useCurrentFrame nên đặt trong Sequence chương là đúng. */
export const taoPhim = (d: DuLieuPhim) => {
  const {chuong, starts, INTRO, introTai, total} = dungPhim(d);
  const Phim: React.FC = () => (
    <AbsoluteFill style={{background: NEN}}>
      {INTRO > 0 && (
        <Sequence from={introTai} durationInFrames={INTRO}>
          <TieuDe t={d.tieuDe!} />
          <CoTiengNeuCo src="sfx/whoosh-up.wav" volume={0.6} />
        </Sequence>
      )}
      {chuong.map((c, i) => (
        <Sequence key={c.id} from={starts[i]} durationInFrames={c.total}>
          <Chuong d={d} c={c} audio={d.manifest.chapters[i].audio} nhac={duongNhac(d.board.chuong.find((b) => b.id === c.id)?.nhac) ?? NHAC_VUI[i % NHAC_VUI.length]} phuDe={d.phuDe ?? true} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
  return {Phim, total, W, H};
};
