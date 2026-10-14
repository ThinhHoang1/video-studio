import React from 'react';
import {AbsoluteFill} from 'remotion';
import {NEN} from '../rig/hinh';
import {LopNen} from './nen';
import {LopKhungTin} from './khung-tin';
import {ChuTrenMan} from '../chu';
import type {Cum} from '../../engine/neo';
import {ShotDung, f} from './du-lieu';
import {FPS} from '../../engine/theme';
import {FONT} from '../../engine/font';
import {W, H} from './san-khau';

/**
 * SÂN KHẤU BẢNG TIN — mặt vẽ của định dạng tin, tách hẳn khỏi mặt nhân vật.
 *
 * Vì sao tách: đo board bản tin thì 0/49 shot có diễn viên, 0 prop, 0 bối cảnh.
 * Toàn bộ bộ máy rig (tư thế, thú, tay chân, lip-sync, act) là chết với nó. Để
 * chung một `SanKhau` thì mỗi lần sửa nhân vật phải nghĩ xem có vỡ bản tin không,
 * và ngược lại — đã vỡ thật một lần: shot `loai: 'trong'` return sớm nên cả bản
 * tin ra màn trắng trơn.
 *
 * Hai mặt dùng CHUNG đường ống phía dưới (giọng, nhịp, phụ đề, ghép đoạn) vì đó
 * mới là phần đắt và hay hỏng. Tách use-case riêng là nhân đôi đúng chỗ đó.
 */
export const SanKhauTin: React.FC<{
  shot: ShotDung;
  frame: number;
  frameChuong: number;
  cues: Cum[];
  id: string;
}> = ({shot, frame, frameChuong, cues, id}) => {
  const t = frame / FPS;
  const nenMau = typeof shot.nen === 'string' && shot.nen !== 'trang' ? shot.nen : NEN;

  return (
    <AbsoluteFill style={{background: nenMau, fontFamily: FONT}}>
      {shot.nen && typeof shot.nen !== 'string' ? (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
          <LopNen nen={shot.nen} W={W} H={H} id={id} />
        </svg>
      ) : null}

      {shot.tin && <LopKhungTin tin={shot.tin} W={W} H={H} frame={frame} frameChuong={frameChuong} fps={FPS} />}

      {/* Chữ trên màn vẫn dùng được ở bản tin (số liệu nhấn), nhưng hiếm — khung
          tin đã mang tiêu đề rồi. */}
      <div style={{position: 'absolute', inset: 0}}>
        {(shot.chu ?? [])
          .filter((c) => t >= (c.tai ?? 0))
          .map((c, i) => (
            <ChuTrenMan
              key={i}
              chu={c}
              frame={frame - f(c.tai ?? 0)}
              shotLen={shot.len}
              W={W}
              H={H}
              neoX={W * 0.5}
              neoY={H * 0.4}
              net={6}
              cues={cues.map((q) => ({start: q.start - shot.from, end: q.end - shot.from}))}
            />
          ))}
      </div>
    </AbsoluteFill>
  );
};
