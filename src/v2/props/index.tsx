import React from 'react';
import type {TenProp} from '../board/kieu-board';
import {PropProps} from './co-ban';
import {TRUONG_HOC} from './truong-hoc';
import {DO_VAT} from './do-vat';
import {NGOAI_TROI} from './ngoai-troi';
import {GAG} from './gag';
import {NHA} from './nha';
import {DUONG_PHO} from './duong-pho';
import {TROI} from './troi';
import {CANG_TIN} from './cang-tin';
import {NHAN} from './nhan';
import {CONG_SO} from './cong-so';
import {KINH_TE} from './kinh-te';
import {AN_UONG} from './an-uong';
import {GIAO_THONG} from './giao-thong';
import {CONG_NGHE} from './cong-nghe';
import {THIEN_NHIEN} from './thien-nhien';
import {Y_TE} from './y-te';
import {THE_THAO} from './the-thao';

export type {PropProps} from './co-ban';
export {Goc, Net, Gach, Hop, Tron, Bau, HopKhoi, BanHo, NET} from './co-ban';

/**
 * Thư viện prop V2 — đủ mọi tên trong PROP_TEN (src/v2/board/kieu-board.ts).
 * Thiếu tên nào thì tsc báo ngay tại đây.
 *
 * Nhóm: truong-hoc 10 · do-vat 11 · ngoai-troi 5 · gag 5 · nha 8 · duong-pho 7 · troi 4 · cang-tin 3 = 53
 *      + nhan 5 (có chữ) · cong-so 7 · kinh-te 7 · an-uong 6 · giao-thong 6 · cong-nghe 5
 *      · thien-nhien 5 · y-te 4 · the-thao 5 = 103.
 * Prop có nhãn (nhan.tsx, bien-bao) nhận thêm `chu` từ board.prop[].chu.
 *
 * Cách dùng trong shot: <VeProp ten="ban-hoc" x={W * 0.5} y={H * 0.86} co={1} net={net(dau)} />
 * (x, y = tâm đáy prop tính bằng px; co = 1 là cỡ đi với nhân vật DAU = 330px).
 */
export const PROPS: Record<TenProp, React.FC<PropProps>> = {
  ...TRUONG_HOC,
  ...DO_VAT,
  ...NGOAI_TROI,
  ...GAG,
  ...NHA,
  ...DUONG_PHO,
  ...TROI,
  ...CANG_TIN,
  ...NHAN,
  ...CONG_SO,
  ...KINH_TE,
  ...AN_UONG,
  ...GIAO_THONG,
  ...CONG_NGHE,
  ...THIEN_NHIEN,
  ...Y_TE,
  ...THE_THAO,
};

export const VeProp: React.FC<{ten: TenProp} & PropProps> = ({ten, ...p}) => {
  const P = PROPS[ten];
  return <P {...p} />;
};
