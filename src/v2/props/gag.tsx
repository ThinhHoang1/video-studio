import React from 'react';
import {Goc, Net, PropProps} from './co-ban';

/**
 * Prop nhóm GAG (ký hiệu hoạt hình đặt cạnh nhân vật). Cỡ thiết kế (co = 1):
 *   trai-tim 260x200 · mui-ten 260x300 (đầu mũi tên tại tâm đáy) · giot-mo-hoi 140x210
 *   vach-buc 204x170 · bong-chu 380x300 (đuôi bóng chạm tâm đáy)
 */

/** trái tim nét, đỉnh nhọn ở tâm đáy */
const TraiTim: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <Net d="M 0 0 C -130 -90 -135 -180 -68 -196 C -32 -204 -6 -178 0 -152 C 6 -178 32 -204 68 -196 C 135 -180 130 -90 0 0 Z" />
  </Goc>
);

/** mũi tên đậm chỉ vào tâm đáy, đến từ phía trên bên phải (flip → bên trái) */
const MuiTen: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <g transform="rotate(35)">
      <Net d="M 0 0 L -62 -92 L -24 -92 L -24 -270 L 24 -270 L 24 -92 L 62 -92 Z" />
    </g>
  </Goc>
);

/** giọt mồ hôi to (gag), có vệt sáng */
const GiotMoHoi: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <Net d="M 0 -210 C 40 -140 70 -105 70 -70 A 70 70 0 0 1 -70 -70 C -70 -105 -40 -140 0 -210 Z" />
    <Net to="none" d="M -38 -72 Q -34 -104 -16 -122" />
  </Goc>
);

/** vạch "bực": BỐN nét cong đậm (1.6x nét) xếp chữ thập, hở giữa */
const VachBuc: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <g fill="none">
      <Net to="none" d="M 0 -170 q -16 -34 0 -68" day={p.net * 1.6} />
      <Net to="none" d="M 0 -68 q 16 34 0 68" day={p.net * 1.6} />
      <Net to="none" d="M -34 -86 q -34 -16 -68 0" day={p.net * 1.6} />
      <Net to="none" d="M 34 -86 q 34 16 68 0" day={p.net * 1.6} />
    </g>
  </Goc>
);

/** bóng thoại trống, đuôi chỉ về tâm đáy (miệng người nói) */
const BongChu: React.FC<PropProps> = (p) => (
  <Goc {...p}>
    <Net d="M -150 -300 L 150 -300 Q 190 -300 190 -260 L 190 -120 Q 190 -80 150 -80 L -6 -80 L 0 0 L -70 -80 L -150 -80 Q -190 -80 -190 -120 L -190 -260 Q -190 -300 -150 -300 Z" />
  </Goc>
);

export const GAG: Record<'trai-tim' | 'mui-ten' | 'giot-mo-hoi' | 'vach-buc' | 'bong-chu', React.FC<PropProps>> = {
  'trai-tim': TraiTim,
  'mui-ten': MuiTen,
  'giot-mo-hoi': GiotMoHoi,
  'vach-buc': VachBuc,
  'bong-chu': BongChu,
};
