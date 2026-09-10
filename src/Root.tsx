import React from 'react';
import {Composition} from 'remotion';
import {FPS} from './engine/theme';
import {RaTruongVui2, VUI2_DURATION} from './projects/ra-truong/vui';
import {RaTruong, RATRUONG_DURATION} from './projects/ra-truong/buon';
import {TinhDau, PHIM_DURATION} from './projects/tinh-dau/phim';
import {PoseTest} from './dev/pose-test';
import {CastTest} from './dev/cast-test';
import {CanhTest} from './dev/canh-test';
import {AnDuTest} from './dev/an-du-test';
import {RigV2Test, RIG_TEST_W, RIG_TEST_H} from './v2/dev/rig-test';
import {DU_AN_V2} from './projects/du-an.generated';
import {PropsV2Test, PROPS_TEST_W, PROPS_TEST_H} from './v2/dev/props-test';
import {ActV2Test, ACT_TEST_W, ACT_TEST_H, ACT_TEST_DAI} from './v2/dev/act-test';
import {BanSacTest, BAN_SAC_W, BAN_SAC_H} from './v2/dev/ban-sac-test';

/**
 * Chỉ đăng ký những composition đang dùng.
 * Các thí nghiệm cũ nằm ở src/attic/ — giữ để tham khảo, không build.
 */
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="TinhDau" component={TinhDau} durationInFrames={PHIM_DURATION} fps={FPS} width={1920} height={1080} />
    {/* dự án V2 — sinh tự động bởi pipeline/dang-ky.mjs, id "V2-<ten>" */}
    {DU_AN_V2.map((p) => (
      <Composition key={p.id} id={p.id} component={p.Phim} durationInFrames={p.total} fps={FPS} width={1920} height={1080} />
    ))}
    <Composition id="RigV2Test" component={RigV2Test} durationInFrames={30} fps={FPS} width={RIG_TEST_W} height={RIG_TEST_H} />
    <Composition id="PropsV2Test" component={PropsV2Test} durationInFrames={60} fps={FPS} width={PROPS_TEST_W} height={PROPS_TEST_H} />
    <Composition id="ActV2Test" component={ActV2Test} durationInFrames={ACT_TEST_DAI} fps={FPS} width={ACT_TEST_W} height={ACT_TEST_H} />
    <Composition id="BanSacTest" component={BanSacTest} durationInFrames={30} fps={FPS} width={BAN_SAC_W} height={BAN_SAC_H} />
    <Composition id="CanhTest" component={CanhTest} durationInFrames={90} fps={FPS} width={2560} height={1080} />
    <Composition id="CastTest" component={CastTest} durationInFrames={60} fps={FPS} width={2400} height={900} />
    <Composition id="AnDuTest" component={AnDuTest} durationInFrames={90} fps={FPS} width={2560} height={1080} />
    <Composition id="PoseTest" component={PoseTest} durationInFrames={60} fps={FPS} width={2400} height={1400} />
    <Composition
      id="RaTruongVui"
      component={RaTruongVui2}
      durationInFrames={VUI2_DURATION}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="RaTruongBuon"
      component={RaTruong}
      durationInFrames={RATRUONG_DURATION}
      fps={FPS}
      width={1920}
      height={1080}
    />
  </>
);
