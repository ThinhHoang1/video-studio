import React from 'react';
import {Composition} from 'remotion';
import {FPS} from './engine/theme';
import {RigV2Test, RIG_TEST_W, RIG_TEST_H} from './v2/dev/rig-test';
import {DU_AN_V2} from './projects/du-an.generated';
import {PropTuVeXem, XEM_W, XEM_H} from './v2/dev/prop-tu-ve-xem';
import {PropsV2Test, PROPS_TEST_W, PROPS_TEST_H} from './v2/dev/props-test';
import {ActV2Test, ACT_TEST_W, ACT_TEST_H, ACT_TEST_DAI} from './v2/dev/act-test';
import {BanSacTest, BAN_SAC_W, BAN_SAC_H} from './v2/dev/ban-sac-test';
import {Avatar, AVATAR_W, AVATAR_H} from './v2/dev/avatar';
import {Bia, BIA_W, BIA_H} from './v2/dev/bia';
import {BiaKenh, KENH_W, KENH_H} from './v2/dev/bia-kenh';
import {DanNhanVat, DAN_W, DAN_H} from './v2/dev/dan-nhan-vat';

/**
 * Chỉ đăng ký những composition đang dùng.
 * Các thí nghiệm cũ nằm ở src/attic/ — giữ để tham khảo, không build.
 *
 * ⚠️ KHÔNG import gì từ `src/dev/` hay `src/projects/<dự-án-V1>/`. Bundle giao cho
 * OpenClaw chỉ mang `src/v2/**` + dự án V2 sinh tự động; mọi import khác làm
 * Remotion CHẾT NGAY LÚC BUNDLE — không phải lúc render một composition cụ thể —
 * nên một import thừa giết mọi video. Đã xảy ra thật: `./projects/ra-truong/vui`
 * còn sót trong file này chặn render của một dự án chẳng liên quan.
 */
export const RemotionRoot: React.FC = () => (
  <>
    {/* dự án V2 — sinh tự động bởi pipeline/dang-ky.mjs, id "V2-<ten>" */}
    {DU_AN_V2.map((p) => (
      <Composition key={p.id} id={p.id} component={p.Phim} durationInFrames={p.total} fps={FPS} width={1920} height={1080} />
    ))}
    <Composition id="PropTuVeXem" component={PropTuVeXem} durationInFrames={1} fps={FPS} width={XEM_W} height={XEM_H} defaultProps={{}} />
    <Composition id="RigV2Test" component={RigV2Test} durationInFrames={30} fps={FPS} width={RIG_TEST_W} height={RIG_TEST_H} />
    <Composition id="PropsV2Test" component={PropsV2Test} durationInFrames={60} fps={FPS} width={PROPS_TEST_W} height={PROPS_TEST_H} />
    <Composition id="ActV2Test" component={ActV2Test} durationInFrames={ACT_TEST_DAI} fps={FPS} width={ACT_TEST_W} height={ACT_TEST_H} />
    <Composition id="Avatar" component={Avatar} durationInFrames={1} fps={FPS} width={AVATAR_W} height={AVATAR_H} defaultProps={{}} />
    <Composition id="Bia" component={Bia} durationInFrames={1} fps={FPS} width={BIA_W} height={BIA_H} defaultProps={{}} />
    <Composition id="BiaKenh" component={BiaKenh} durationInFrames={1} fps={FPS} width={KENH_W} height={KENH_H} defaultProps={{khung: 'youtube' as const}} />
    {/* Facebook cover có tỉ lệ khác hẳn YouTube nên phải là composition riêng — không đổi
        được kích thước bằng --props. */}
    <Composition id="BiaKenhFb" component={BiaKenh} durationInFrames={1} fps={FPS} width={1640} height={856} defaultProps={{khung: 'facebook' as const}} />
    <Composition id="DanNhanVat" component={DanNhanVat} durationInFrames={1} fps={FPS} width={DAN_W} height={DAN_H} defaultProps={{}} />
    <Composition id="BanSacTest" component={BanSacTest} durationInFrames={30} fps={FPS} width={BAN_SAC_W} height={BAN_SAC_H} />
  </>
);
