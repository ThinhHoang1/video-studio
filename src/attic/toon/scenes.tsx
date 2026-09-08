import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {BgStall, BgMart, BgRing, BgRoom, BgBank, BgMoneyFlood, GROUND} from './Bg';
import {Char, Expr} from './Char';
import {BanhMi, Burst, ChipBag, Glove, Label, Lever, MoneyStack, Sack} from './Props';
import {LINE, LINE_THIN, T} from './palette';

export type SceneProps = {
  /** biểu cảm chính, do từng shot quyết định */
  expr?: Expr;
  /** tiến trình 0..1 dùng cho cảnh có biến đổi (giá tăng, gói teo…) */
  p?: number;
  label?: string;
  left?: string;
  right?: string;
};

/** 1. Quầy bánh mì: giá đổi, ổ bánh teo. */
export const ScStall: React.FC<SceneProps> = ({expr = 'happy', p = 0}) => (
  <g>
    <BgStall />
    <g transform={`translate(1120 ${GROUND})`}>
      <Char species="gau" expr={expr} pose="hold" scale={1.2} flip>
        <BanhMi s={0.72} bites={p > 0.5 ? 1 : 0} />
      </Char>
    </g>
    <g transform={`translate(420 ${GROUND})`}>
      <Char species="bo" expr={p > 0.5 ? 'smug' : 'happy'} pose="point" scale={1.14} />
    </g>
    <Label
      text={p > 0.5 ? '50.000₫' : '30.000₫'}
      x={800}
      y={300}
      size={64}
      color={p > 0.5 ? T.alert : T.moneyDark}
      shape="tag"
    />
  </g>
);

/** 2. Trong nhà: tờ tiền to dần teo lại trên tay. */
export const ScShrinkMoney: React.FC<SceneProps> = ({expr = 'cry', p = 0}) => {
  const s = interpolate(p, [0, 1], [1.5, 0.42]);
  return (
    <g>
      <BgRoom />
      <g transform={`translate(560 ${GROUND})`}>
        <Char species="bo" expr={expr} pose="raise" scale={1.24} />
      </g>
      <g transform={`translate(1080 350) scale(${s})`}>
        <rect x={-190} y={-100} width={380} height={200} rx={14} fill={T.money} {...LINE} />
        <circle cx={0} cy={0} r={56} fill={T.cream} {...LINE_THIN} />
        <text x={0} y={18} textAnchor="middle" fontSize={54} fontWeight={900} fill={T.line}>
          500K
        </text>
      </g>
      {p > 0.55 ? <Label text="TEO" x={1080} y={560} size={56} color={T.alert} /> : null}
    </g>
  );
};

/** 3. Ngân hàng in tiền: tiền phun ra, bánh mì vẫn 10 ổ. */
export const ScPrinter: React.FC<SceneProps> = ({expr = 'smug', p = 0}) => {
  const frame = useCurrentFrame();
  return (
    <g>
      <BgBank />
      <Burst cx={520} cy={430} r={460} color={T.gold} />
      <g transform={`translate(520 ${GROUND})`}>
        <Char species="gau" expr={expr === 'smug' ? 'greedy' : expr} pose="raise" scale={1.26} />
      </g>
      {new Array(12).fill(0).map((_, i) => {
        const t = ((frame * 2.6 + i * 24) % 150) / 150;
        return (
          <g key={i} transform={`translate(${640 + t * 620} ${330 - Math.sin(t * Math.PI) * 190}) rotate(${t * 300})`}>
            <rect x={-46} y={-24} width={92} height={48} rx={6} fill={T.money} {...LINE_THIN} />
          </g>
        );
      })}
      <g transform="translate(1240 700)">
        {new Array(10).fill(0).map((_, i) => (
          <g key={i} transform={`translate(${(i % 5) * 68 - 136} ${Math.floor(i / 5) * 58 - 30})`}>
            <BanhMi s={0.26} />
          </g>
        ))}
        <Label text="VẪN 10 Ổ" x={0} y={110} size={40} color={T.line} />
      </g>
      {p > 0.6 ? <Label text="IN THÊM" x={520} y={170} size={58} color={T.alert} /> : null}
    </g>
  );
};

/** 4. Ngập tiền đỏ — siêu lạm phát Zimbabwe. */
export const ScFlood: React.FC<SceneProps> = ({expr = 'shock', label}) => (
  <g>
    <BgMoneyFlood tone="red" />
    <g transform={`translate(800 ${GROUND + 60})`}>
      <Char species="bo" expr={expr} pose="raise" scale={1.3} bob={1.6} />
    </g>
    {label ? <Label text={label} x={800} y={200} size={72} color={T.alert} /> : null}
  </g>
);

/** 5. Siêu thị: gói bim bim phồng khí, ruột teo. */
export const ScChips: React.FC<SceneProps> = ({expr = 'angry', p = 0}) => (
  <g>
    <BgMart />
    <g transform={`translate(440 ${GROUND})`}>
      <Char species="gau" expr={expr} pose="point" scale={1.2} />
    </g>
    <g transform="translate(1080 440)">
      <ChipBag s={1.15} puff={interpolate(p, [0, 1], [1, 1.32])} gram={Math.round(interpolate(p, [0, 1], [80, 60]))} />
    </g>
    {p > 0.5 ? <Label text="70% LÀ KHÍ" x={1080} y={130} size={48} color={T.alert} rot={-6} /> : null}
  </g>
);

/** 6. Sàn boxing: LẠM PHÁT vs GIẢM PHÁT (hoặc hai lực bất kỳ). */
export const ScRing: React.FC<SceneProps> = ({
  left = 'LẠM PHÁT',
  right = 'GIẢM PHÁT',
}) => {
  const frame = useCurrentFrame();
  const jab = Math.sin(frame / 9) * 40;
  return (
    <g>
      <BgRing />
      <g transform={`translate(${430 + jab} 500)`}>
        <Glove s={1.9} color={T.blue} flip label={left} />
      </g>
      <g transform={`translate(${1170 - jab} 500)`}>
        <Glove s={1.9} color={T.alert} label={right} />
      </g>
    </g>
  );
};

/** 7. Phòng khách: bảng lương, sếp và nhân viên. */
export const ScSalary: React.FC<SceneProps> = ({expr = 'happy', p = 0}) => (
  <g>
    <BgRoom />
    <g transform={`translate(470 ${GROUND})`}>
      <Char species="gau" expr="smug" pose="point" scale={1.18} />
    </g>
    <g transform={`translate(1140 ${GROUND})`}>
      <Char species="bo" expr={p > 0.55 ? 'dead' : expr} pose="hold" scale={1.18} flip>
        <g transform="scale(0.8)">
          <rect x={-90} y={-116} width={180} height={232} rx={10} fill={T.paper} {...LINE} />
          <text x={0} y={-30} textAnchor="middle" fontSize={46} fontWeight={900} fill={T.moneyDark}>
            +7%
          </text>
          <text x={0} y={54} textAnchor="middle" fontSize={40} fontWeight={900} fill={T.alert}>
            −10%
          </text>
        </g>
      </Char>
    </g>
    {p > 0.55 ? <Label text="GIẢM LƯƠNG" x={800} y={210} size={62} color={T.alert} rot={-4} /> : null}
  </g>
);

/** 8. Cần phanh khổng lồ — chính sách lãi suất. */
export const ScBrake: React.FC<SceneProps> = ({expr = 'shock', p = 0}) => (
  <g>
    <BgRoom />
    <g transform={`translate(500 ${GROUND})`}>
      <Char species="gau" expr={expr} pose="raise" scale={1.2} />
    </g>
    <g transform="translate(1090 640)">
      <Lever s={1.5} pull={p} />
    </g>
  </g>
);

/** 9. Bao tải NỢ NẦN đè gãy lưng / kho tiền tiết kiệm. */
export const ScDebt: React.FC<SceneProps> = ({expr = 'cry', label = 'NỢ NẦN'}) => (
  <g>
    <BgRoom />
    <g transform={`translate(560 ${GROUND})`}>
      <Char species="bo" expr={expr} pose="carry" scale={1.2}>
        <Sack s={0.7} label={label} />
      </Char>
    </g>
    <g transform={`translate(1180 ${GROUND - 20})`}>
      <Char species="gau" expr="greedy" pose="hold" scale={1.14} flip>
        <MoneyStack s={0.55} n={4} />
      </Char>
    </g>
  </g>
);

/** 10. Ngập tiền xanh — kết, kêu gọi hành động. */
export const ScWin: React.FC<SceneProps> = ({expr = 'happy', label}) => (
  <g>
    <BgMoneyFlood tone="green" />
    <g transform={`translate(620 ${GROUND + 60})`}>
      <Char species="bo" expr={expr} pose="raise" scale={1.2} />
    </g>
    <g transform={`translate(1080 ${GROUND + 60})`}>
      <Char species="gau" expr={expr} pose="raise" scale={1.2} flip />
    </g>
    {label ? <Label text={label} x={850} y={190} size={64} color={T.moneyDark} /> : null}
  </g>
);

/** 11. Cửa hàng dán băng ĐÓNG CỬA — hệ quả phanh gấp. */
export const ScClosed: React.FC<SceneProps> = ({expr = 'cry'}) => (
  <g>
    <BgStall />
    {[0, 1, 2].map((i) => (
      <g key={i} transform={`rotate(${i % 2 ? 16 : -16} 800 500) translate(0 ${i * 150 - 120})`}>
        <rect x={-100} y={430} width={1800} height={74} fill={T.alert} {...LINE_THIN} />
        {new Array(7).fill(0).map((_, k) => (
          <text key={k} x={40 + k * 250} y={484} fontSize={44} fontWeight={900} fill={T.cream}>
            ĐÓNG CỬA
          </text>
        ))}
      </g>
    ))}
    <g transform={`translate(420 ${GROUND})`}>
      <Char species="gau" expr={expr} pose="facepalm" scale={1.18} />
    </g>
  </g>
);

export const SCENES = {
  stall: ScStall,
  shrinkMoney: ScShrinkMoney,
  printer: ScPrinter,
  flood: ScFlood,
  chips: ScChips,
  ring: ScRing,
  salary: ScSalary,
  brake: ScBrake,
  debt: ScDebt,
  win: ScWin,
  closed: ScClosed,
};

export type SceneName = keyof typeof SCENES;
