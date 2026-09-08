import React from 'react';
import {AbsoluteFill} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {wipe} from '@remotion/transitions/wipe';
import {slide} from '@remotion/transitions/slide';
import {Scene, SceneProps} from './components/Scene';
import {TitleCard} from './components/TitleCard';
import {EndCard} from './components/EndCard';
import {FPS} from './theme';

const s = (sec: number) => Math.round(sec * FPS);

type Beat = SceneProps & {seconds: number};

export const BEATS: Beat[] = [
  {
    seconds: 5,
    src: 'qb/04-phongnha.jpg',
    pan: 'in',
    kicker: 'Bắc Trung Bộ',
    title: 'Nơi núi đá\nnuốt trọn dòng sông',
    sub: 'Quảng Bình — dải đất hẹp nhất Việt Nam, nhưng cất giấu hệ thống hang động lớn bậc nhất hành tinh.',
    stat: {value: '8.000 km²', label: 'diện tích'},
  },
  {
    seconds: 5.5,
    src: 'qb/01-sondoong.jpg',
    pan: 'up',
    kicker: 'Kỳ quan',
    title: 'Sơn Đoòng',
    sub: 'Hang động tự nhiên lớn nhất thế giới. Bên trong có rừng nguyên sinh, có mây, và có cả thời tiết riêng.',
    stat: {value: '9 km', label: 'chiều dài hang'},
  },
  {
    seconds: 4.5,
    src: 'qb/02-sondoong2.jpg',
    pan: 'right',
    title: 'Một toà nhà 40 tầng\nlọt thỏm trong lòng hang',
    sub: 'Vòm hang cao tới 200m, rộng 150m — đủ chỗ cho cả một khu phố.',
  },
  {
    seconds: 5,
    src: 'qb/05-phongnha2.jpg',
    pan: 'left',
    kicker: 'Di sản UNESCO',
    title: 'Phong Nha – Kẻ Bàng',
    sub: 'Vườn quốc gia với hơn 400 triệu năm kiến tạo karst, được UNESCO ghi danh hai lần.',
    stat: {value: '2003', label: 'ghi danh'},
  },
  {
    seconds: 4.5,
    src: 'qb/08-thienduong.jpg',
    pan: 'in',
    kicker: 'Động Thiên Đường',
    title: 'Hoàng cung\ndưới lòng đất',
    sub: 'Thạch nhũ rủ xuống như rèm lụa, trải dài 31km trong bóng tối mát lạnh.',
  },
  {
    seconds: 4.5,
    src: 'qb/07-kebang.jpg',
    pan: 'out',
    title: 'Hơn 400 hang động\nvẫn đang được đếm',
    sub: 'Mỗi mùa khảo sát, các đoàn thám hiểm lại tìm thấy thêm những cửa hang chưa ai đặt chân.',
    stat: {value: '400+', label: 'hang động'},
  },
  {
    seconds: 4.5,
    src: 'qb/10-nhatle.jpg',
    pan: 'right',
    kicker: 'Bờ biển',
    title: 'Nhật Lệ',
    sub: 'Rời hang là ra biển. Cát trắng, nước trong, và hải sản vừa lên thuyền buổi sớm.',
    stat: {value: '116 km', label: 'bờ biển'},
  },
  {
    seconds: 4.5,
    src: 'qb/11-quangthanh.jpg',
    pan: 'left',
    kicker: 'Làng quê',
    title: 'Nhịp sống\nchậm rãi bên sông',
    sub: 'Đồng lúa, luỹ tre, những ngôi làng vẫn giữ nếp cũ sau bao mùa bão lũ.',
  },
  {
    seconds: 4.5,
    src: 'qb/12-chodonghoi.jpg',
    pan: 'in',
    kicker: 'Đồng Hới',
    title: 'Ăn gì ở Quảng Bình?',
    sub: 'Cháo canh, bánh lọc, bánh xèo gạo lứt, khoai deo — no bụng mà nhẹ ví.',
  },
];

const TRANSITION = 14;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pick = (i: number): any =>
  i % 3 === 0 ? fade() : i % 3 === 1 ? wipe({direction: 'from-right'}) : slide({direction: 'from-bottom'});

export const QuangBinh: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: '#040a12'}}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={s(4.5)}>
          <TitleCard
            src="qb/03-sondoong3.jpg"
            tag="Việt Nam · Miền Trung"
            title="QUẢNG BÌNH"
            sub="Vương quốc hang động"
          />
        </TransitionSeries.Sequence>

        {BEATS.map((b, i) => (
          <React.Fragment key={i}>
            <TransitionSeries.Transition
              presentation={pick(i)}
              timing={linearTiming({durationInFrames: TRANSITION})}
            />
            <TransitionSeries.Sequence durationInFrames={s(b.seconds)}>
              <Scene {...b} />
            </TransitionSeries.Sequence>
          </React.Fragment>
        ))}

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({durationInFrames: TRANSITION})}
        />
        <TransitionSeries.Sequence durationInFrames={s(6)}>
          <EndCard src="qb/09-thienduong2.jpg" handle="#QuangBinh  ·  #PhongNhaKeBang  ·  #SonDoong" />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};

export const QUANG_BINH_DURATION =
  s(4.5) + BEATS.reduce((a, b) => a + s(b.seconds), 0) + s(6) - (BEATS.length + 1) * TRANSITION;
