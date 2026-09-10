import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Dau, NhanVat} from '../rig/nhan-vat';
import {MIENG_CAM_XUC, MIENG_LIPSYNC, HinhMieng} from '../rig/mieng';
import {TrangThaiMat, TrangThaiMay} from '../rig/mat';
import {BanTay, KieuTay} from '../rig/tay';
import {TU_THE} from '../rig/tu-the';
import {KIEU} from '../rig/kieu';
import {NEN, MUC, GocNhin} from '../rig/hinh';
import {TEN_DO_CAM} from '../rig/do-cam';
import {FONT} from '../../engine/font';

/**
 * Bảng thử rig V2 — nhìn một lần thấy hết: miệng, mắt, bàn tay, dàn nhân vật, nhân vật
 * phụ, đầu co giãn, cận đặc tả 4 góc, góc nhìn × tư thế, cầm đồ, toàn bộ tư thế.
 * Render: npx remotion still src/index.ts RigV2Test out/v2/rig-v2.png
 */
export const RIG_TEST_W = 2560;
export const RIG_TEST_H = 6160;

const Nhan: React.FC<{x: number; y: number; t: string; s?: number}> = ({x, y, t, s = 22}) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONT} fontSize={s} fill="#555">
    {t}
  </text>
);
const Tieu: React.FC<{y: number; t: string; x?: number}> = ({y, t, x = 40}) => (
  <text x={x} y={y} fontFamily={FONT} fontSize={26} fontWeight={700} fill={MUC}>
    {t}
  </text>
);

const MAT: TrangThaiMat[] = ['oval', 'nho', 'cham', 'soc', 'soc-lon', 'khe', 'cung', 'gach', 'xoan', 'chan', 'nham'];
const MAY: TrangThaiMay[] = ['tuc', 'lo', 'nhiu'];
const TAY: KieuTay[] = ['xoe', 'chi', 'nam', 'cam', 'ep', 'up'];
const GOC: GocNhin[] = ['truoc', 'ba-phan-tu', 'nghieng', 'sau'];
const TU_THE_GOC = ['dung', 'chi', 'khoanhTay', 'ngoi', 'gioTay', 'di1'];
/** tư thế đi với từng đồ cầm trong hàng cầm đồ */
const TU_THE_CAM: Record<string, string> = {
  but: 'ngoiGoBan',
  phan: 'vietBang',
  'dien-thoai': 'camDT',
  'ly-tra-sua': 'cam',
  sach: 'cam',
  thuoc: 'chi',
  kiem: 'gioTay',
  o: 'gioTay',
  'la-thu': 'cam',
  micro: 'camDT',
};

export const RigV2Test: React.FC = () => {
  const lip: {h: HinhMieng; b: number}[] = [];
  for (const h of MIENG_LIPSYNC) {
    lip.push({h, b: 0});
    if (h === 'B' || h === 'C') lip.push({h, b: 1});
  }
  const poses = Object.keys(TU_THE).filter((p) => p !== 'nam');
  const cast = Object.keys(KIEU);

  return (
    <AbsoluteFill style={{background: NEN}}>
      <svg width={RIG_TEST_W} height={RIG_TEST_H} viewBox={`0 0 ${RIG_TEST_W} ${RIG_TEST_H}`}>
        {/* ── 1. miệng lip-sync ─────────────────────────────────────── */}
        <Tieu y={44} t="1. Bảng miệng lip-sync (Rhubarb X A B C D E F G H — B, C có 2 biến thể)" />
        {lip.map(({h, b}, i) => {
          const d = 190;
          const cx = 140 + i * 225;
          const cy = 190;
          return (
            <g key={`${h}${b}`}>
              <Dau kieu="ha" dau={d} cx={cx} cy={cy} mieng={h} bien={b} id={`l${i}`} />
              <Nhan x={cx} y={cy + 165} t={`${h}${b ? ' (b1)' : ''}`} />
            </g>
          );
        })}

        {/* ── 2. miệng cảm xúc ──────────────────────────────────────── */}
        <Tieu y={400} t="2. Miệng cảm xúc" />
        {MIENG_CAM_XUC.map((h, i) => {
          const d = 165;
          const cx = 130 + i * 205;
          const cy = 530;
          return (
            <g key={h}>
              <Dau kieu="nam" dau={d} cx={cx} cy={cy} mieng={h} mat="oval" id={`e${i}`} />
              <Nhan x={cx} y={cy + 150} t={h} />
            </g>
          );
        })}

        {/* ── 3. mắt + mày ──────────────────────────────────────────── */}
        <Tieu y={730} t="3. Mắt (11 trạng thái) + mày (3)" />
        {MAT.map((m, i) => {
          const d = 150;
          const cx = 120 + i * 180;
          const cy = 850;
          return (
            <g key={m}>
              <Dau kieu="ha" dau={d} cx={cx} cy={cy} mat={m} mieng="thang" id={`m${i}`} />
              <Nhan x={cx} y={cy + 150} t={m} />
            </g>
          );
        })}
        {MAY.map((m, i) => {
          const d = 150;
          const cx = 120 + (MAT.length + i) * 180;
          const cy = 850;
          return (
            <g key={m}>
              <Dau kieu="long" dau={d} cx={cx} cy={cy} mat="oval" may={m} mieng={m === 'tuc' ? 'gat' : m === 'lo' ? 'meu' : 'mim'} id={`b${i}`} />
              <Nhan x={cx} y={cy + 150} t={`mày: ${m}`} />
            </g>
          );
        })}

        {/* ── 4. bàn tay ────────────────────────────────────────────── */}
        <Tieu y={1040} t="4. Bàn tay (hướng 0° và 90°)" />
        {TAY.map((t, i) => (
          <g key={t}>
            <BanTay dau={260} x={130 + i * 200} y={1090} huong={0} kieu={t} net={5} />
            <BanTay dau={260} x={130 + i * 200 + 90} y={1130} huong={90} kieu={t} net={5} />
            <Nhan x={130 + i * 200 + 40} y={1200} t={t} />
          </g>
        ))}

        {/* ── 5. dàn nhân vật gốc ───────────────────────────────────── */}
        <Tieu y={1250} t="5. Dàn nhân vật gốc (KIEU) — nét vẽ tay mặc định" />
        {cast.map((c, i) => {
          const d = 96;
          const x = 160 + i * 240;
          const y = 1660;
          return (
            <g key={c}>
              <NhanVat kieu={c} dau={d} x={x} y={y} dang={i % 2 ? 'motTayHong' : 'dung'} mieng={c === 'trang' ? undefined : 'cuoi-nhe'} id={`c${i}`} />
              <Nhan x={x} y={y + 32} t={c} s={20} />
              <Nhan x={x} y={y + 56} t={KIEU[c].ten} s={18} />
            </g>
          );
        })}

        {/* ── 6. nhân vật phụ đầu trắng ─────────────────────────────── */}
        <Tieu y={1780} t="6. Nhân vật phụ đầu trắng — không mặt; có mặt (chấm/gạch) khi được giao vai" />
        <g>
          <NhanVat kieu="trang" dau={100} x={160} y={2200} dang="dung" id="tr1" />
          <NhanVat kieu="trang" dau={100} x={340} y={2200} dang="dung" mat="cham" mieng="cuoi" id="tr2" />
          <NhanVat kieu="trang" dau={100} x={520} y={2200} dang="nhunVai" mat="gach" mieng="hoang" id="tr3" />
          <NhanVat kieu={{...KIEU.trang, toc: {mau: '#656565', mai: 'lech-phai', lon: 0, sau: 'ngan'}}} dau={100} x={700} y={2200} dang="tayHong" mat="gach" mieng="thang" id="tr4" />
          <NhanVat kieu={{...KIEU.trang, toc: {mau: '#e9e8c6', mai: 'ngang', lon: 2, sau: 'bob'}}} dau={100} x={880} y={2200} dang="chi" mat="cham" mieng="C" id="tr5" />
          <NhanVat kieu={{...KIEU.trang, co: 0.62}} dau={100} x={1040} y={2200} dang="dung" mat="cham" mieng="ba" id="tr6" />
          <NhanVat kieu="trang" dau={100} x={1180} y={2200} dang="dung" goc="sau" id="tr7" />
        </g>
        <Nhan x={1180} y={2232} t="goc: sau" s={20} />

        {/* ── 7. đầu co giãn ────────────────────────────────────────── */}
        <Tieu y={1780} x={1400} t="7. Đầu co giãn theo cảm xúc (tĩnh, không tween)" />
        {(
          [
            ['thường', 'oval', 'mim'],
            ['soc: cao +6%', 'soc', 'o'],
            ['soc-lon: cao +6%', 'soc-lon', 'hoang'],
            ['cung + cuoi: bè +4%', 'cung', 'cuoi'],
            ['chan: hạ 0.03 DAU', 'chan', 'thang'],
          ] as [string, TrangThaiMat, HinhMieng][]
        ).map(([nhan, m, mi], i) => {
          const d = 170;
          const cx = 1520 + i * 230;
          const cy = 1990;
          return (
            <g key={nhan}>
              {/* đường chuẩn: mép trên sọ và cằm lúc thường */}
              <line x1={cx - 100} y1={cy - 0.46 * d} x2={cx + 100} y2={cy - 0.46 * d} stroke="#c8c8c8" strokeWidth={1.5} strokeDasharray="6 5" />
              <line x1={cx - 100} y1={cy + 0.46 * d} x2={cx + 100} y2={cy + 0.46 * d} stroke="#c8c8c8" strokeWidth={1.5} strokeDasharray="6 5" />
              <Dau kieu="nam" dau={d} cx={cx} cy={cy} mat={m} mieng={mi} id={`cg${i}`} />
              <Nhan x={cx} y={cy + 150} t={nhan} s={20} />
            </g>
          );
        })}

        {/* ── 8. cận đặc tả 4 góc ───────────────────────────────────── */}
        <Tieu y={2270} t="8. Cận đặc tả DAU=340 (nét 5.1px) — 4 góc nhìn (ha, nhìn 0.3) + nam cung/cuoi + thầy nghiêng" />
        {GOC.map((g, i) => {
          const d = 340;
          const cx = 280 + i * 460;
          const cy = 2510;
          return (
            <g key={g}>
              <Dau kieu="ha" dau={d} cx={cx} cy={cy} mieng="D" mat="oval" nhin={0.3} goc={g} id={`big${i}`} />
              <Nhan x={cx} y={cy + 260} t={`goc: ${g}`} />
            </g>
          );
        })}
        <Dau kieu="nam" dau={300} cx={2120} cy={2510} mieng="cuoi-toe" mat="cung" id="big5" />
        <Nhan x={2120} y={2770} t="nam — cung + cuoi-toe (bè 4%)" />
        <Dau kieu="thay" dau={220} cx={2400} cy={2530} mieng="B" mat="gach" goc="nghieng" id="big6" />
        <Nhan x={2400} y={2770} t="thay: nghieng + kính" />

        {/* ── 9. góc nhìn × tư thế ──────────────────────────────────── */}
        <Tieu y={2830} t="9. Góc nhìn × tư thế — mỗi hàng một góc; nam (không flip) · ha (flip) xen kẽ" />
        {GOC.map((g, r) =>
          TU_THE_GOC.map((p, c) => {
            const d = 108;
            const y = 3210 + r * 330;
            return ['nam', 'ha'].map((kieu, j) => {
              const x = 150 + (c * 2 + j) * 200;
              const flip = kieu === 'ha';
              return (
                <g key={`${g}${p}${kieu}`}>
                  <NhanVat kieu={kieu} dau={d} x={x} y={y} dang={p} goc={g} flip={flip} mieng={kieu === 'nam' ? 'C' : 'cuoi-nhe'} nhin={0.2} id={`g${r}${c}${j}`} />
                  <Nhan x={x} y={y + 30} t={j === 0 ? `${g} · ${p}` : `${p} (flip)`} s={18} />
                </g>
              );
            });
          })
        )}

        {/* ── 10. cầm đồ ────────────────────────────────────────────── */}
        <Tieu y={4290} t="10. Cầm đồ (DO_CAM) — vẽ trước bàn tay, xoay theo cẳng tay; 2 cột cuối: 3/4 và nghiêng" />
        {TEN_DO_CAM.map((ten, i) => {
          const d = 120;
          const x = 140 + i * 200;
          const y = 4690;
          const dang = TU_THE_CAM[ten] ?? 'cam';
          return (
            <g key={ten}>
              <NhanVat kieu={i % 2 ? 'ha' : 'nam'} dau={d} x={x} y={y} dang={dang} cam={ten} mieng="cuoi-nhe" id={`dc${i}`} />
              <Nhan x={x} y={y + 30} t={ten} s={20} />
              <Nhan x={x} y={y + 52} t={dang} s={16} />
            </g>
          );
        })}
        <NhanVat kieu="nam" dau={120} x={2180} y={4690} dang="cam" cam="sach" goc="ba-phan-tu" mieng="B" id="dc10" />
        <Nhan x={2180} y={4720} t="sach · ba-phan-tu" s={20} />
        <NhanVat kieu="thay" dau={100} x={2400} y={4690} dang="vietBang" goc="nghieng" mieng="C" mat="gach" id="dc11" />
        <Nhan x={2400} y={4720} t="vietBang · nghieng" s={20} />

        {/* ── 11. toàn bộ tư thế ────────────────────────────────────── */}
        <Tieu y={4800} t={`11. Tư thế (${poses.length + 1}, snap, không nội suy) — hàng 1-2 tên cũ, còn lại mới; 'nam' vẽ riêng cuối`} />
        {poses.map((p, i) => {
          const d = 108;
          const col = i % 12;
          const row = Math.floor(i / 12);
          const x = 150 + col * 205;
          const y = 5180 + row * 300;
          const moi = i >= 23;
          return (
            <g key={p}>
              <NhanVat kieu={row % 2 === 0 ? 'nam' : 'ha'} dau={d} x={x} y={y} dang={p} mieng={row % 2 === 0 ? 'X' : 'cuoi-nhe'} id={`p${i}`} />
              <Nhan x={x} y={y + 30} t={p} s={18} />
              {moi && <Nhan x={x} y={y + 50} t="mới" s={14} />}
            </g>
          );
        })}
        <NhanVat kieu="nam" dau={108} x={1700} y={6080} dang="nam" mieng="X" id="pnam" />
        <Nhan x={1560} y={6110} t="nam (nằm ngửa, mới)" s={18} />
        <NhanVat kieu="ha" dau={108} x={2100} y={6080} dang="nga" goc="nghieng" mieng="hoang" mat="soc" id="pnga2" />
        <Nhan x={2100} y={6110} t="nga · nghieng" s={18} />
        <NhanVat kieu="nam" dau={108} x={2350} y={6080} dang="chay1" goc="nghieng" mieng="C" id="pchay2" />
        <Nhan x={2350} y={6110} t="chay1 · nghieng" s={18} />
      </svg>
    </AbsoluteFill>
  );
};
