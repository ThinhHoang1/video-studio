import React from 'react';
import {Composition} from 'remotion';
import {FPS} from './engine/theme';
import {RaTruongVui2, VUI2_DURATION} from './projects/ra-truong/vui';
import {RaTruong, RATRUONG_DURATION} from './projects/ra-truong/buon';

/**
 * Chỉ đăng ký những composition đang dùng.
 * Các thí nghiệm cũ nằm ở src/attic/ — giữ để tham khảo, không build.
 */
export const RemotionRoot: React.FC = () => (
  <>
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
