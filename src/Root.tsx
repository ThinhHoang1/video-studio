import React from 'react';
import {Composition} from 'remotion';
import {FPS} from './engine/theme';
import {RaTruongVui2, VUI2_DURATION} from './projects/ra-truong/vui';
import {RaTruong, RATRUONG_DURATION} from './projects/ra-truong/buon';
import {PoseTest} from './dev/pose-test';
import {AnDuTest} from './dev/an-du-test';

/**
 * Chỉ đăng ký những composition đang dùng.
 * Các thí nghiệm cũ nằm ở src/attic/ — giữ để tham khảo, không build.
 */
export const RemotionRoot: React.FC = () => (
  <>
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
