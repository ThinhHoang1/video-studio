import React from 'react';
import {Composition} from 'remotion';
import {QuangBinh, QUANG_BINH_DURATION} from './QuangBinh';
import {QuangBinhDoc, DOC_DURATION} from './QuangBinhDoc';
import {LamPhat, LAMPHAT_DURATION} from './LamPhat';
import {ToonTest} from './dev/ToonTest';
import {CastTest} from './dev/CastTest';
import {AnimeTest} from './dev/AnimeTest';
import {RaTruong, RATRUONG_DURATION} from './doi/RaTruong';
import {RaTruongVui, VUI_DURATION} from './doi/RaTruongVui';
import {LamPhatAnime, ANIME_DURATION} from './LamPhatAnime';
import {LamPhatV2, V2_DURATION} from './LamPhatV2';
import {LamPhatToon, TOON_DURATION} from './LamPhatToon';
import {FPS} from './theme';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="RaTruongVui" component={RaTruongVui} durationInFrames={VUI_DURATION} fps={FPS} width={1920} height={1080} />
      <Composition id="RaTruong" component={RaTruong} durationInFrames={RATRUONG_DURATION} fps={FPS} width={1920} height={1080} />
      <Composition id="LamPhatAnime" component={LamPhatAnime} durationInFrames={ANIME_DURATION} fps={FPS} width={1920} height={1080} />
      <Composition id="AnimeTest" component={AnimeTest} durationInFrames={60} fps={FPS} width={1920} height={1080} />
      <Composition id="LamPhatV2" component={LamPhatV2} durationInFrames={V2_DURATION} fps={FPS} width={1920} height={1080} />
      <Composition id="CastTest" component={CastTest} durationInFrames={60} fps={FPS} width={1920} height={1080} />
      <Composition id="LamPhatToon" component={LamPhatToon} durationInFrames={TOON_DURATION} fps={FPS} width={1920} height={1080} />
      <Composition id="ToonTest" component={ToonTest} durationInFrames={60} fps={FPS} width={1920} height={1080} />
      <Composition
        id="LamPhat"
        component={LamPhat}
        durationInFrames={LAMPHAT_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="LamPhat-Vertical"
        component={LamPhat}
        durationInFrames={LAMPHAT_DURATION}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="QuangBinh"
        component={QuangBinh}
        durationInFrames={QUANG_BINH_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="QuangBinhDoc"
        component={QuangBinhDoc}
        durationInFrames={DOC_DURATION}
        fps={FPS}
        width={1920}
        height={1080}
      />
      <Composition
        id="QuangBinhDoc-Vertical"
        component={QuangBinhDoc}
        durationInFrames={DOC_DURATION}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="QuangBinh-Vertical"
        component={QuangBinh}
        durationInFrames={QUANG_BINH_DURATION}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
