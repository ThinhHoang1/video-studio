import React from 'react';
import {loadFont as loadPatrickHand} from '@remotion/google-fonts/PatrickHand';
import {FONT} from '../engine/font';
import {FPS} from '../engine/theme';
import type {Chu} from './board/kieu-board';
import {MUC} from './rig/hinh';

/**
 * Chữ trên màn V2 — bốn kiểu đo từ tham chiếu (reports/shot.md mục 4):
 *   kem  : chữ đậm ~52px cạnh nhân vật (5% cao khung), có ngoặc kép nếu là lời
 *   the  : tiêu đề to 96–140px giữa khung, 1–2 dòng, đậm đen
 *   nhan : nhãn 34px đậm + mũi tên nét cong chỉ vào (neoX, neoY)
 *   tay  : chữ viết tay 36px (Patrick Hand, có subset tiếng Việt), hơi nghiêng
 *
 * Cách vào (reports/timing.md): tuc-thi = hiện 1 frame; tung-tu = mỗi từ hiện
 * theo cues (frame tính từ đầu shot) hoặc chia đều theo shotLen — từ chưa hiện
 * KHÔNG chiếm chỗ (display none) nên dòng đang đọc dở vẫn canh giữa; dòng chưa
 * bắt đầu giữ chiều cao bằng một ký tự rỗng để khối không nhảy dọc;
 * phong = scale tuyến tính 0.3 → 1.6 trong 10 frame rồi giữ, KHÔNG ease.
 * Tuyệt đối không fade opacity, không trượt. Chữ chỉ biến mất khi cắt shot.
 *
 * Mọi cỡ px tính trên khung cao 1080; khung khác nhân theo H/1080.
 */
const patrick = loadPatrickHand('normal', {weights: ['400'], subsets: ['vietnamese', 'latin', 'latin-ext']});
export const FONT_TAY = `"${patrick.fontFamily}", ${FONT}`;

export type Cue = {start: number; end: number};

export type ChuTrenManProps = {
  chu: Chu;
  /** frame hiện tại tính từ đầu shot */
  frame: number;
  /** độ dài shot (frame) */
  shotLen: number;
  W: number;
  H: number;
  /** điểm neo (px) cho mũi tên của nhãn và vị trí canh-dau */
  neoX?: number;
  neoY?: number;
  /** độ dày nét mũi tên (px), mặc định 5 */
  net?: number;
  /** mốc từng từ (frame từ đầu shot) — cues[i] cho từ thứ i */
  cues?: Cue[];
};

type KieuChu = NonNullable<Chu['kieu']>;
type ViTri = NonNullable<Chu['vi_tri']>;

const VI_TRI_MAC_DINH: Record<KieuChu, ViTri> = {kem: 'trai', the: 'giua', nhan: 'tren', tay: 'canh-dau'};

/**
 * Tâm khối chữ theo vi_tri (tỉ lệ khung). Khối luôn canh giữa quanh tâm để
 * transform-origin của `phong` trùng tâm chữ; trai/phai = tâm nửa khung trống
 * (nhân vật trực diện chiếm x 0.52–0.96 nên nửa trái 0.06–0.48 là chỗ đặt chữ).
 * canh-dau bám điểm neo nếu có: lệch 0.2 W về phía trống, cao hơn neo 0.12 H.
 */
const toaDo = (vt: ViTri, W: number, H: number, neoX?: number, neoY?: number): {x: number; y: number} => {
  switch (vt) {
    case 'giua':
      return {x: W * 0.5, y: H * 0.5};
    case 'trai':
      return {x: W * 0.27, y: H * 0.42};
    case 'phai':
      return {x: W * 0.73, y: H * 0.42};
    case 'tren':
      return {x: W * 0.5, y: H * 0.13};
    case 'duoi':
      return {x: W * 0.5, y: H * 0.86};
    case 'canh-dau': {
      if (neoX === undefined || neoY === undefined) return {x: W * 0.32, y: H * 0.3};
      const trai = neoX > W / 2;
      return {x: neoX + (trai ? -0.2 : 0.2) * W, y: neoY - 0.12 * H};
    }
  }
};

/** nội dung là lời nói? → thêm ngoặc kép cho kiểu kem */
const laLoi = (nd: string, vt: ViTri) => {
  if (/["“”]/.test(nd)) return false;
  return /[.!?…]$/.test(nd.trim()) || vt === 'canh-dau';
};

/** cỡ chữ tiêu đề theo độ dài — giữ tối đa 2 dòng ở bề rộng 0.9 W */
const coThe = (nd: string) => {
  const n = nd.replace(/\n/g, ' ').trim().length;
  if (n <= 16) return 140;
  if (n <= 32) return 118;
  return 96;
};

export const ChuTrenMan: React.FC<ChuTrenManProps> = ({chu, frame, shotLen, W, H, neoX, neoY, net = 5, cues}) => {
  const kieu: KieuChu = chu.kieu ?? 'kem';
  const vao = chu.vao ?? 'tuc-thi';
  const batDau = Math.round((chu.tai ?? 0) * FPS);
  const t = frame - batDau;
  if (t < 0) return null;

  const k = H / 1080;
  const mau = chu.mau ?? MUC;
  const viTri = chu.vi_tri ?? VI_TRI_MAC_DINH[kieu];
  const {x, y} = toaDo(viTri, W, H, neoX, neoY);
  const scale = vao === 'phong' ? 0.3 + 1.3 * Math.min(1, t / 10) : 1;

  // nội dung → dòng → từ; kem là lời thì bọc ngoặc kép
  let noiDung = chu.noi_dung;
  if (kieu === 'kem' && laLoi(noiDung, viTri)) noiDung = `“${noiDung}”`;
  const dong = noiDung.split('\n').map((d) => d.split(/\s+/).filter(Boolean));
  const tongTu = dong.reduce((s, d) => s + d.length, 0);

  // từ thứ i đã hiện chưa (tung-tu)
  // cues là các CỤM lời của chương (đã dời về frame đầu shot), thô hơn số từ của chữ (cụm ~7 từ,
  // chữ 2–5 từ) → cắt cụm về đoạn [batDau, shotLen], nối các đoạn lại thành "thời gian đang đọc"
  // trong shot, rồi rải từ đều theo vị trí i/tongTu trên đoạn nối đó. Từ đầu hiện đúng lúc chữ vào.
  const cuesShot = (cues ?? [])
    .map((c) => ({start: Math.max(batDau, c.start), end: Math.min(shotLen, c.end)}))
    .filter((c) => c.end > c.start);
  const tongDoc = cuesShot.reduce((a, c) => a + (c.end - c.start), 0);
  const hien = (i: number) => {
    if (vao !== 'tung-tu') return true;
    if (tongDoc > 0) {
      let conLai = (i / tongTu) * tongDoc;
      for (const c of cuesShot) {
        const dai = c.end - c.start;
        if (conLai <= dai) return frame >= c.start + conLai;
        conLai -= dai;
      }
      return true;
    }
    const khoang = Math.max(1, (shotLen - batDau) / (tongTu + 1));
    return t >= i * khoang;
  };

  const font: React.CSSProperties =
    kieu === 'the'
      ? {fontFamily: FONT, fontSize: coThe(noiDung) * k, fontWeight: 900, lineHeight: 1.05, width: W * 0.9}
      : kieu === 'kem'
        ? {fontFamily: FONT, fontSize: 52 * k, fontWeight: 800, lineHeight: 1.15, width: W * 0.42}
        : kieu === 'nhan'
          ? {fontFamily: FONT, fontSize: 34 * k, fontWeight: 800, lineHeight: 1.1, width: W * 0.3}
          : {fontFamily: FONT_TAY, fontSize: 36 * k, fontWeight: 400, lineHeight: 1.15, width: W * 0.3};

  const xoay = kieu === 'tay' ? -4 : 0;

  // mũi tên nhãn: từ mép dưới khối chữ cong về điểm neo, bụng cong lệch lên
  let muiTen: React.ReactNode = null;
  if (kieu === 'nhan' && neoX !== undefined && neoY !== undefined) {
    // xuất phát từ mép khối chữ gần neo nhất: cạnh bên nếu neo lệch ngang, đáy nếu neo ở dưới
    const nuaRong = Math.min(0.3 * 34 * k * noiDung.length, 0.15 * W);
    const ngang = Math.abs(neoX - x) > nuaRong + 40 * k;
    const x0 = ngang ? x + Math.sign(neoX - x) * (nuaRong + 10 * k) : x;
    const y0 = ngang ? y : y + 26 * k;
    const dx = neoX - x0;
    const dy = neoY - y0;
    const dai = Math.hypot(dx, dy) || 1;
    // pháp tuyến đơn vị, chọn chiều có y âm (bụng cong hướng lên)
    let px = -dy / dai;
    let py = dx / dai;
    if (py > 0) {
      px = -px;
      py = -py;
    }
    const cx = (x0 + neoX) / 2 + px * 0.28 * dai;
    const cy = (y0 + neoY) / 2 + py * 0.28 * dai;
    const goc = Math.atan2(neoY - cy, neoX - cx);
    const dau = 28 * k;
    const a1 = goc + Math.PI * 0.78;
    const a2 = goc - Math.PI * 0.78;
    muiTen = (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
        <g fill="none" stroke={mau} strokeWidth={net} strokeLinecap="round" strokeLinejoin="round">
          <path d={`M ${x0} ${y0} Q ${cx} ${cy} ${neoX} ${neoY}`} />
          <path d={`M ${neoX + Math.cos(a1) * dau} ${neoY + Math.sin(a1) * dau} L ${neoX} ${neoY} L ${neoX + Math.cos(a2) * dau} ${neoY + Math.sin(a2) * dau}`} />
        </g>
      </svg>
    );
  }

  let idx = 0;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, overflow: 'hidden', pointerEvents: 'none'}}>
      {muiTen}
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          transform: `translate(-50%, -50%) rotate(${xoay}deg) scale(${scale})`,
          transformOrigin: '50% 50%',
          color: mau,
          textAlign: 'center',
          whiteSpace: 'normal',
          ...font,
        }}
      >
        {dong.map((tu, di) => {
          const dau = idx;
          const spans = tu.map((w, wi) => {
            const i = idx++;
            // từ chưa hiện: không chiếm chỗ → phần đã hiện của dòng vẫn canh giữa
            if (!hien(i)) return null;
            return (
              <span key={wi}>
                {w}
                {wi < tu.length - 1 ? ' ' : ''}
              </span>
            );
          });
          const coTu = spans.some(Boolean);
          return (
            <div key={di}>
              {/* dòng chưa có từ nào: giữ chiều cao dòng bằng ký tự rỗng, để khối chữ không nhảy dọc khi dòng sau hiện */}
              {coTu ? spans : <span key={`rong-${dau}`}>{'\u200b'}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};
