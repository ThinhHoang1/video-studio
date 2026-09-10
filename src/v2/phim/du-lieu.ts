import {FPS} from '../../engine/theme';
import {splitCues, cueTimings} from '../../engine/cues';
import type {Cum} from '../../engine/neo';
import type {Board, BoardChuong, Shot, CoCanh, LoaiShot} from '../board/kieu-board';
import type {HinhMieng} from '../rig/mieng';

/** dữ liệu sinh bởi pipeline */
export type ChuongAudio = {id: string; kicker: string; heading: string; vo: string; audio: string; duration: number};
export type Manifest = {chapters: ChuongAudio[]};
export type VoiceTrack = {am: number[]; nhan: number[]; nghi: boolean[]};
export type MouthTrack = {fps: number; hold: number; duration: number; frames: string; rle: [number, string][]};

export const f = (sec: number) => Math.round(sec * FPS);

/** shot đã tính mốc: from/len theo frame trong chương */
export type ShotDung = Shot & {from: number; len: number; loai: LoaiShot; co: CoCanh; idx: number};

export type ChuongDung = {
  id: string;
  cues: Cum[];
  shots: ShotDung[];
  /** frame audio (không tính đệm) */
  audioFrames: number;
  /** tổng frame chương (audio + đệm) */
  total: number;
};

/** cỡ mặc định theo loại shot */
const CO_MAC_DINH: Record<LoaiShot, CoCanh> = {
  'truc-dien': 'can',
  'minh-hoa': 'trung',
  'phan-ung': 'can',
  'dac-ta': 'sat',
  chu: 'trung',
  insert: 'trung',
  'tieu-canh': 'nho',
  'dong-nguoi': 'rong',
  trong: 'trung',
};

export const NGAN_NHAT = f(0.25);
export const DEM_CHUONG = f(0.4);

/**
 * Dựng danh sách shot của một chương từ board + lời bình.
 * Mốc: `say` neo qua neo.ts; `tai` là giây tuyệt đối. Shot ngắn hơn 0.25 s bị
 * gộp vào shot trước (validator đã cảnh báo trước đó).
 */
const chuan = (s: string) => s.toLowerCase().replace(/[.,!?;:"'…—–-]/g, '').replace(/\s+/g, ' ').trim();

/**
 * Neo mức TỪ: rải ký tự của lời bình lên các frame ĐANG NÓI (voice.nghi = false).
 * Cùng thuật toán với pipeline/kiem-tra-v2.mjs::taoUocLuong để validator và
 * renderer cho ra cùng mốc. Neo V1 (neo.ts) làm tròn về đầu cụm 7 từ nên nhiều
 * `say` liền nhau rơi cùng frame và bị gộp mất — đo trên demo-v2: mất 26/77 shot.
 */
const taoNeoTu = (vo: string, vt: VoiceTrack | undefined, audioFrames: number) => {
  const voChuan = chuan(vo);
  const dangNoi: number[] = [];
  if (vt?.nghi?.length) vt.nghi.forEach((n, i) => { if (!n) dangNoi.push(i); });
  const tiLe = vt?.nghi?.length ? audioFrames / vt.nghi.length : 1;
  const n = dangNoi.length;
  let viTriTruoc = 0;
  return (say: string): number | null => {
    const kim = chuan(say);
    let vt2 = voChuan.indexOf(kim, viTriTruoc);
    if (vt2 === -1) vt2 = voChuan.indexOf(kim);
    if (vt2 === -1) return null;
    viTriTruoc = vt2 + 1;
    const p = vt2 / Math.max(1, voChuan.length);
    if (n < 30) return Math.round(p * audioFrames);
    return Math.round(dangNoi[Math.min(n - 1, Math.floor(p * n))] * tiLe);
  };
};

export const dungChuong = (ch: ChuongAudio, bc: BoardChuong | undefined, macDinh: Board['mac_dinh'], vt?: VoiceTrack): ChuongDung => {
  const audioFrames = f(ch.duration);
  const total = audioFrames + DEM_CHUONG;
  const texts = splitCues(ch.vo);
  const times = cueTimings(texts, audioFrames);
  const cues: Cum[] = texts.map((t, i) => ({text: t, start: times[i].start, end: times[i].end}));

  const neoTu = taoNeoTu(ch.vo, vt, audioFrames);
  const tho: (Shot & {at: number})[] = [];
  for (const s of bc?.shots ?? []) {
    let at: number | null = null;
    if (typeof s.tai === 'number') at = f(s.tai);
    else if (s.say) at = neoTu(s.say);
    if (at === null) {
      console.warn(`[board ${ch.id}] không neo được: "${s.say ?? s.tai}"`);
      continue;
    }
    tho.push({...s, at});
  }
  tho.sort((a, b) => a.at - b.at);

  const gop: (Shot & {at: number})[] = [];
  for (const s of tho) {
    const truoc = gop[gop.length - 1];
    if (truoc && s.at - truoc.at < NGAN_NHAT) {
      // hai mốc quá sát: giữ shot có lời (`say`), bỏ nhịp trắng/insert chen vào
      if (truoc.loai === 'trong' && s.say) gop[gop.length - 1] = s;
      continue;
    }
    gop.push(s);
  }
  if (gop.length === 0) {
    gop.push({at: 0, loai: 'truc-dien', dien: [{kieu: 'nam', x: 0.72, noi: true}]});
  }

  const shots: ShotDung[] = gop.map((s, i) => {
    const from = i === 0 ? 0 : s.at;
    const sau = i + 1 < gop.length ? gop[i + 1].at : total;
    let len = sau - from;
    if (typeof s.dai === 'number') len = Math.min(len, Math.max(NGAN_NHAT, f(s.dai)));
    const loai = s.loai ?? macDinh?.loai ?? 'minh-hoa';
    return {...s, idx: i, from, len: Math.max(NGAN_NHAT, len), loai, co: s.co ?? macDinh?.co ?? CO_MAC_DINH[loai]};
  });

  // khoảng trống sau shot có `dai` ngắn hơn khoảng tới shot kế → chèn nhịp trắng
  const day: ShotDung[] = [];
  for (let i = 0; i < shots.length; i++) {
    const s = shots[i];
    day.push(s);
    const ket = s.from + s.len;
    const sau = i + 1 < shots.length ? shots[i + 1].from : total;
    if (sau - ket >= NGAN_NHAT) day.push({idx: shots.length + i, from: ket, len: sau - ket, loai: 'trong', co: 'trung'});
  }
  return {id: ch.id, cues, shots: day, audioFrames, total};
};

/** chữ Rhubarb → hình miệng; `bien` đổi theo lượt lặp để hai frame liền không y hệt */
export const miengTaiFrame = (mt: MouthTrack | undefined, vt: VoiceTrack | undefined, frame: number): {hinh: HinhMieng | null; bien: number; rung: number} => {
  if (mt) {
    const i = Math.min(mt.frames.length - 1, Math.max(0, Math.round((frame / FPS) * mt.fps)));
    const c = mt.frames[i] as HinhMieng | undefined;
    if (!c || c === 'X') return {hinh: null, bien: 0, rung: 0};
    // số lần chữ này đã lặp liên tiếp trước đó → chẵn/lẻ
    let k = 0;
    for (let j = i - 1; j >= 0 && mt.frames[j] === c; j--) k++;
    return {hinh: c, bien: Math.floor(k / 2) % 2, rung: k % 2};
  }
  if (vt) {
    const a = vt.am[frame] ?? 0;
    if (a < 0.3) return {hinh: null, bien: 0, rung: 0};
    const hinh: HinhMieng = a > 0.75 ? 'D' : a > 0.5 ? 'C' : 'B';
    return {hinh, bien: Math.floor(frame / 2) % 2, rung: frame % 2};
  }
  return {hinh: null, bien: 0, rung: 0};
};

/** đang ở cụm (câu ngắn) thứ mấy — dùng để đổi cử chỉ tự động theo nhịp câu */
export const cumTaiFrame = (cues: Cum[], frame: number) => {
  const i = cues.findIndex((c) => frame >= c.start && frame < c.end);
  return i === -1 ? cues.length - 1 : i;
};
