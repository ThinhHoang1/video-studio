import React from 'react';
import {GocNhin, MUC} from './hinh';

/**
 * Tóc — MỘT khối đặc một màu, viền đen cùng độ dày nét, 2–3 gạch đen bên
 * trong theo hướng chải. Không mảng sáng/tối, không highlight.
 *
 * Kiểu tóc = tổ hợp {mái, chỏm, lọn bên, tóc sau}. Toạ độ trong hệ đầu
 * (tâm sọ = 0,0; sọ rx 0.50 ry 0.46), hệ số DAU. Tóc rộng ~1.25 sọ.
 *
 * Hai lớp: TocSau vẽ TRƯỚC thân (sau đầu), TocTruoc vẽ SAU mặt.
 *
 * Góc nhìn (`goc`): cùng một bộ điểm, chỉ ánh xạ trục x trước khi nhân DAU:
 *   - ba-phan-tu: mái dồn về phía mặt (x·0.94 + 0.08), tóc sau lộ thêm phía xa (x − 0.05)
 *   - nghieng:    mái hẹp và đẩy ra trán tới mũi (x·0.8 + 0.18), tóc sau đầy ra gáy (x·0.95 − 0.12)
 *   - sau:        không có mái/mặt — TocTruoc vẽ chỏm gáy phủ sọ; TocSau vẽ ĐÈ lên sọ (Dau đổi thứ tự)
 * Hướng mặt = +x khi chưa flip; `flip` lật cả tóc.
 */
export type KieuToc = {
  mau: string;
  mai: 'lech-phai' | 'lech-trai' | 'ngang' | 're-giua' | 'hat' | 'dung';
  chom?: boolean;
  lon: 0 | 2 | 4;
  sau: 'khong' | 'bob' | 'dai' | 'duoi-ngua' | 'bui' | 'ngan';
};

type P = {dau: number; cx: number; cy: number; net: number; toc: KieuToc; flip?: boolean; goc?: GocNhin};

/** ánh xạ x (hệ số DAU) theo góc nhìn cho lớp trước / lớp sau */
const anhXaX = (goc: GocNhin, lop: 'truoc' | 'sau') => (x: number) => {
  if (goc === 'ba-phan-tu') return lop === 'truoc' ? x * 0.94 + 0.08 : x - 0.05;
  if (goc === 'nghieng') return lop === 'truoc' ? x * 0.8 + 0.18 : x * 0.95 - 0.12;
  return x;
};

/** đường cong khép qua danh sách điểm (Catmull-Rom → bezier gần đúng, đủ mềm cho mái tóc) */
const mem = (p: string[]) => {
  if (p.length < 3) return `M ${p.join(' L ')} z`;
  const P = p.map((s) => s.split(' ').map(Number));
  const n = P.length;
  let d = `M ${P[0][0]} ${P[0][1]}`;
  for (let i = 0; i < n; i++) {
    const p0 = P[(i - 1 + n) % n];
    const p1 = P[i];
    const p2 = P[(i + 1) % n];
    const p3 = P[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]}`;
  }
  return d + ' z';
};

/** đa giác thẳng (cho chỏm nhọn, lọn nhọn) */
const goc = (p: string[]) => `M ${p.join(' L ')} z`;

export const TocSau: React.FC<P> = ({dau: d, cx, cy, net, toc, flip, goc: gocNhin = 'truoc'}) => {
  const f = flip ? -1 : 1;
  const ax = anhXaX(gocNhin, 'sau');
  const S = {fill: toc.mau, stroke: MUC, strokeWidth: net, strokeLinejoin: 'round' as const};
  const X = (x: number) => cx + ax(x) * f * d;
  const Y = (y: number) => cy + y * d;
  const P = (a: [number, number][]) => a.map(([x, y]) => `${X(x)} ${Y(y)}`);
  switch (toc.sau) {
    case 'khong':
    case 'ngan':
      return null;
    case 'bob':
      return (
        <path
          d={mem(P([[-0.6, -0.2], [-0.62, 0.25], [-0.5, 0.58], [-0.25, 0.5], [0, 0.6], [0.25, 0.5], [0.5, 0.58], [0.62, 0.25], [0.6, -0.2], [0.3, -0.5], [-0.3, -0.5]]))}
          {...S}
        />
      );
    case 'dai':
      return (
        <path
          d={goc(P([[-0.6, -0.25], [-0.68, 0.3], [-0.6, 0.75], [-0.66, 1.1], [-0.42, 1.0], [-0.3, 1.2], [-0.1, 1.05], [0.1, 1.2], [0.3, 1.02], [0.45, 1.18], [0.62, 0.95], [0.66, 0.4], [0.6, -0.25], [0.3, -0.5], [-0.3, -0.5]]))}
          {...S}
        />
      );
    case 'duoi-ngua': {
      // đuôi ngựa nằm phía sau đầu: ở góc nghiêng/3-4 đẩy về gáy (-x), nhìn thẳng để bên phải
      const m = gocNhin === 'truoc' || gocNhin === 'sau' ? 1 : -1;
      const Q = (a: [number, number][]) => a.map(([x, y]) => `${cx + (gocNhin === 'nghieng' ? x * m - 0.25 : x * m) * f * d} ${Y(y)}`);
      return (
        <g>
          <path d={mem(P([[-0.55, -0.3], [-0.58, 0.1], [-0.45, 0.35], [0, 0.4], [0.45, 0.35], [0.58, 0.1], [0.55, -0.3], [0, -0.5]]))} {...S} />
          <path d={goc(Q([[0.4, -0.3], [0.75, -0.42], [1.0, -0.1], [0.98, 0.35], [0.78, 0.62], [0.62, 0.3], [0.5, 0.1]]))} {...S} />
          <line x1={cx + (gocNhin === 'nghieng' ? 0.62 * m - 0.25 : 0.62 * m) * f * d} y1={cy - 0.1 * d} x2={cx + (gocNhin === 'nghieng' ? 0.85 * m - 0.25 : 0.85 * m) * f * d} y2={cy + 0.25 * d} stroke={MUC} strokeWidth={net} strokeLinecap="round" />
        </g>
      );
    }
    case 'bui':
      return (
        <g>
          <path d={mem(P([[-0.55, -0.3], [-0.58, 0.1], [-0.45, 0.35], [0, 0.4], [0.45, 0.35], [0.58, 0.1], [0.55, -0.3], [0, -0.5]]))} {...S} />
          <circle cx={X(gocNhin === 'truoc' || gocNhin === 'sau' ? 0.32 : -0.4)} cy={cy - 0.5 * d} r={0.17 * d} {...S} />
        </g>
      );
  }
};

export const TocTruoc: React.FC<P> = ({dau: d, cx, cy, net, toc, flip, goc: gocNhin = 'truoc'}) => {
  const f = flip ? -1 : 1;
  const ax = anhXaX(gocNhin, 'truoc');
  const S = {fill: toc.mau, stroke: MUC, strokeWidth: net, strokeLinejoin: 'round' as const};
  const L = {fill: 'none', stroke: MUC, strokeWidth: net, strokeLinecap: 'round' as const};
  const X = (x: number) => cx + ax(x) * f * d;
  const Y = (y: number) => cy + y * d;
  const P = (a: [number, number][]) => a.map(([x, y]) => `${X(x)} ${Y(y)}`);
  /** gạch cong: 3 điểm (đầu, điều khiển, cuối) trong hệ đầu, đã qua ánh xạ x */
  const Q3 = (a: [number, number], b: [number, number], c: [number, number], m = 1) =>
    `M ${X(a[0] * m)} ${Y(a[1])} Q ${X(b[0] * m)} ${Y(b[1])} ${X(c[0] * m)} ${Y(c[1])}`;

  // ── nhìn từ sau: chỏm gáy phủ sọ + lọn bên, không mái ─────────────────
  if (gocNhin === 'sau') {
    const cap = mem(P([[-0.62, 0.02], [-0.65, -0.3], [-0.42, -0.58], [0, -0.65], [0.42, -0.58], [0.65, -0.3], [0.62, 0.02], [0.5, 0.22], [0.25, 0.32], [0, 0.34], [-0.25, 0.32], [-0.5, 0.22]]));
    const lon: React.ReactNode[] = [];
    if (toc.lon >= 2) {
      lon.push(
        <path key="l1" d={goc(P([[-0.5, -0.12], [-0.72, 0.02], [-0.6, 0.2], [-0.48, 0.06]]))} {...S} />,
        <path key="l2" d={goc(P([[0.5, -0.12], [0.72, 0.02], [0.6, 0.2], [0.48, 0.06]]))} {...S} />
      );
    }
    return (
      <g>
        {toc.sau === 'khong' || toc.sau === 'ngan' ? <path d={cap} {...S} /> : null}
        {lon}
        <path d={Q3([0.12, -0.55], [0.2, -0.3], [0.22, -0.05])} {...L} />
        <path d={Q3([-0.15, -0.5], [-0.2, -0.25], [-0.18, 0.02])} {...L} />
      </g>
    );
  }

  let mai: React.ReactNode = null;
  let gach: React.ReactNode = null;
  switch (toc.mai) {
    case 'lech-phai':
    case 'lech-trai': {
      const m = toc.mai === 'lech-phai' ? 1 : -1;
      const Q = (a: [number, number][]) => a.map(([x, y]) => `${X(x * m)} ${Y(y)}`);
      mai = (
        <path
          d={mem(Q([[-0.6, 0.02], [-0.64, -0.3], [-0.42, -0.56], [0, -0.63], [0.4, -0.57], [0.63, -0.32], [0.6, 0.0], [0.52, -0.04], [0.46, -0.16], [0.3, -0.26], [0.1, -0.3], [-0.12, -0.24], [-0.3, -0.1], [-0.44, 0.02]]))}
          {...S}
        />
      );
      gach = (
        <g>
          <path d={Q3([0.1, -0.55], [0.25, -0.43], [0.4, -0.23], m)} {...L} />
          <path d={Q3([-0.05, -0.52], [0.07, -0.37], [0.17, -0.22], m)} {...L} />
        </g>
      );
      break;
    }
    case 'ngang':
      mai = (
        <path
          d={mem(P([[-0.6, 0.0], [-0.63, -0.3], [-0.4, -0.56], [0, -0.62], [0.4, -0.56], [0.63, -0.3], [0.6, 0.0], [0.45, -0.1], [0.3, -0.13], [0.15, -0.1], [0, -0.14], [-0.15, -0.1], [-0.3, -0.13], [-0.45, -0.1]]))}
          {...S}
        />
      );
      gach = <path d={Q3([-0.15, -0.58], [-0.2, -0.38], [-0.17, -0.16])} {...L} />;
      break;
    case 're-giua':
      mai = (
        <path
          d={mem(P([[-0.6, 0.02], [-0.63, -0.3], [-0.4, -0.56], [0, -0.62], [0.4, -0.56], [0.63, -0.3], [0.6, 0.02], [0.48, -0.15], [0.3, -0.26], [0.08, -0.5], [0, -0.44], [-0.08, -0.5], [-0.3, -0.26], [-0.48, -0.15]]))}
          {...S}
        />
      );
      gach = (
        <g>
          <path d={Q3([0.12, -0.5], [0.27, -0.45], [0.42, -0.22])} {...L} />
          <path d={Q3([-0.12, -0.5], [-0.27, -0.45], [-0.42, -0.22])} {...L} />
        </g>
      );
      break;
    case 'hat': // tóc nam cắt cao: trán hở, mép mái ở -0.28, đỉnh hơi dựng
      mai = (
        <path
          d={goc(P([[-0.56, -0.12], [-0.62, -0.42], [-0.45, -0.6], [-0.2, -0.68], [0.05, -0.62], [0.3, -0.7], [0.5, -0.56], [0.62, -0.38], [0.58, -0.2], [0.44, -0.3], [0.32, -0.22], [0.1, -0.34], [-0.1, -0.28], [-0.3, -0.36], [-0.46, -0.24]]))}
          {...S}
        />
      );
      gach = <path d={Q3([0.05, -0.62], [0.2, -0.52], [0.35, -0.34])} {...L} />;
      break;
    case 'dung': // tóc dựng ngắn (kiểu Long)
      mai = (
        <path
          d={goc(P([[-0.58, -0.2], [-0.6, -0.5], [-0.42, -0.62], [-0.3, -0.8], [-0.12, -0.66], [0.05, -0.84], [0.2, -0.66], [0.38, -0.78], [0.48, -0.58], [0.62, -0.42], [0.58, -0.2], [0.42, -0.3], [0.2, -0.24], [0.0, -0.3], [-0.2, -0.24], [-0.42, -0.3]]))}
          {...S}
        />
      );
      break;
  }

  // lọn hai bên: ở góc nghiêng chỉ giữ lọn phía gáy (x âm) để không có lọn treo trước mũi
  const nghieng = gocNhin === 'nghieng';
  const lon: React.ReactNode[] = [];
  if (toc.sau === 'bob' || toc.sau === 'dai' || toc.sau === 'duoi-ngua') {
    const den = toc.sau === 'bob' ? 0.5 : 0.62;
    lon.push(<path key="om1" d={mem(P([[-0.5, -0.3], [-0.64, -0.2], [-0.66, 0.15], [-0.58, den], [-0.44, den - 0.12], [-0.5, 0.1]]))} {...S} />);
    if (!nghieng) lon.push(<path key="om2" d={mem(P([[0.5, -0.3], [0.64, -0.2], [0.66, 0.15], [0.58, den], [0.44, den - 0.12], [0.5, 0.1]]))} {...S} />);
  }
  if (toc.lon >= 2) {
    lon.push(<path key="l1" d={goc(P([[-0.5, -0.12], [-0.72, 0.02], [-0.6, 0.2], [-0.48, 0.06]]))} {...S} />);
    if (!nghieng) lon.push(<path key="l2" d={goc(P([[0.5, -0.12], [0.72, 0.02], [0.6, 0.2], [0.48, 0.06]]))} {...S} />);
  }
  if (toc.lon >= 4) {
    lon.push(<path key="l3" d={goc(P([[-0.5, 0.15], [-0.68, 0.32], [-0.52, 0.42], [-0.45, 0.28]]))} {...S} />);
    if (!nghieng) lon.push(<path key="l4" d={goc(P([[0.5, 0.15], [0.68, 0.32], [0.52, 0.42], [0.45, 0.28]]))} {...S} />);
  }

  const chom = toc.chom ? <path d={goc(P([[0.25, -0.55], [0.5, -0.82], [0.55, -0.5]]))} {...S} /> : null;

  return (
    <g>
      {mai}
      {lon}
      {chom}
      {gach}
    </g>
  );
};
