import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {NEN, net as tinhNet} from '../rig/hinh';
import {NhanVat} from '../rig/nhan-vat';
import {KIEU, type Kieu} from '../rig/kieu';
import {TU_THE} from '../rig/tu-the';
import {CO_CANH, DienVien, PropTuVe, type BoiCanhTuVe, type DoCamTuVe} from '../board/kieu-board';

/**
 * Phần chiều cao khung dành cho HÌNH. 14.5% còn lại ở đáy là của phụ đề
 * (engine/sub.tsx: chữ 34px, lineHeight 1.34, cách đáy 54px → dải y 0.866–0.95 H).
 * Đổi số này thì phải đổi cả padding của Sub, nếu không hình lại đè lên chữ.
 */
export const KHUNG_AN_TOAN = 0.855;
import {PropTuVeVe} from '../props/tu-ve';
import {bungBoiCanh} from '../boi-canh';
import {LopNen} from './nen';
import {sinhAct, trangThaiTai} from '../act';
import {PROPS} from '../props';
import {ChuTrenMan} from '../chu';
import {AnhChen} from '../insert';
import {OChenVe} from './chen';
import {LopKhungTin} from './khung-tin';
import type {Cum} from '../../engine/neo';
import {ShotDung, MouthTrack, VoiceTrack, miengTaiFrame, cumTaiFrame, f} from './du-lieu';
import {FPS} from '../../engine/theme';

export const W = 1920;
export const H = 1080;

/** cử chỉ tự động khi đang nói — đổi theo nhịp câu, chọn theo hash để không lặp đều */
const CU_CHI_NOI = ['dung', 'chi', 'haiTayXoe', 'nhunVai', 'motTayHong', 'chiLen', 'epNguc', 'dung', 'vayTay', 'tayHong'];
const hash = (a: number, b: number) => {
  let h = (a * 73856093) ^ (b * 19349663);
  h = (h ^ (h >>> 13)) * 1274126177;
  return Math.abs(h >>> 0);
};


type P = {
  shot: ShotDung;
  /** frame tính từ đầu shot */
  frame: number;
  /** frame tính từ đầu chương (để tra lip-sync) */
  frameChuong: number;
  cues: Cum[];
  mouth?: MouthTrack;
  voice?: VoiceTrack;
  nguoiKe: string;
  id: string;
  /** prop tự vẽ của dự án (board.prop_tu_ve) */
  propTuVe?: Record<string, PropTuVe>;
  boiCanhTuVe?: Record<string, BoiCanhTuVe>;
  doCamTuVe?: Record<string, DoCamTuVe>;
  /** nhân vật riêng của dự án (board.nhan_vat_tu_ve) — đè lên KIEU khi trùng tên */
  nhanVatTuVe?: Record<string, Kieu>;
};

export const SanKhau: React.FC<P> = ({shot, frame, frameChuong, cues, mouth, voice, nguoiKe, id, propTuVe, boiCanhTuVe, doCamTuVe, nhanVatTuVe}) => {
  const co = CO_CANH[shot.co];
  const dau = co.dau;
  const net = tinhNet(dau);
  const t = frame / FPS;

  // ── nhịp trắng / insert / chuyển ─────────────────────────────────
  // Nhịp trắng vẫn phải giữ KHUNG BẢN TIN: bảng tin không có nhân vật nên mọi
  // shot đều là 'trong', return sớm ở đây làm cả bản tin thành màn trắng trơn.
  if (shot.loai === 'trong') {
    return (
      <AbsoluteFill style={{background: typeof shot.nen === 'string' && shot.nen !== 'trang' ? shot.nen : NEN}}>
        {shot.nen && typeof shot.nen !== 'string' ? (
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
            <LopNen nen={shot.nen} W={W} H={H} id={id} />
          </svg>
        ) : null}
        {shot.tin && <LopKhungTin tin={shot.tin} W={W} H={H} frame={frame} frameChuong={frameChuong} fps={FPS} />}
      </AbsoluteFill>
    );
  }
  if (shot.chuyen === 'trang' && frame < 2) return <AbsoluteFill style={{background: NEN}} />;

  const bien = f(0.3);
  if (shot.loai === 'insert') {
    const trong = frame < bien || (shot.len > 3 * bien && frame >= shot.len - bien);
    return (
      <AbsoluteFill style={{background: NEN}}>
        {!trong && shot.insert && <AnhChen insert={shot.insert} W={W} H={H} frame={frame - bien} />}
      </AbsoluteFill>
    );
  }

  // ── zoom: bước cứng, và đẩy máy mượt ─────────────────────────────
  let zoom = 1;
  for (const [tai, z] of shot.zoom_buoc ?? []) if (t >= tai) zoom = z;
  // Đẩy máy mượt đè lên: nội suy ease-in-out từ `tu` tới `den`. Chỉ MÁY mượt —
  // tư thế/mắt/miệng vẫn snap, nên không mất chất vẽ tay.
  if (shot.zoom) {
    const a = shot.zoom.tu_giay ?? 0;
    const b = shot.zoom.den_giay ?? shot.len / FPS;
    const u = b > a ? Math.min(1, Math.max(0, (t - a) / (b - a))) : 1;
    const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
    zoom = shot.zoom.tu + (shot.zoom.den - shot.zoom.tu) * e;
  }

  // ── diễn viên ────────────────────────────────────────────────────
  const dien = shot.dien ?? (shot.loai === 'truc-dien' ? [{kieu: nguoiKe, x: 0.72, noi: true}] : []);
  const coNoi = dien.some((d) => d.noi);
  const cum = cumTaiFrame(cues, frameChuong);
  const {hinh: miengNoi, bien: bienNoi, rung: rungNoi} = miengTaiFrame(mouth, voice, frameChuong);
  const dangNoi = miengNoi !== null;

  let neoX = W * 0.5;
  let neoY = H * 0.4;

  const daiShot = shot.len / FPS;
  const nv = dien.map((dv, k) => {
    // mẫu hành động (dv.mau) bung thành act rồi trộn với act thủ công; trạng thái = mốc cuối ≤ t (snap)
    const s = trangThaiTai(sinhAct(dv, daiShot), dv, t, k * 3);
    if (s.hien === false) return null;
    // Nhân vật của board THẮNG nhân vật thư viện khi trùng tên — cho phép dự án
    // đổi màu áo / đổi loài cho một nhân vật có sẵn mà không sửa thư viện chung.
    const kieu = nhanVatTuVe?.[dv.kieu] ?? KIEU[dv.kieu] ?? KIEU.trang;
    const noi = dv.noi ?? (!coNoi && k === 0 && shot.loai === 'truc-dien');
    const phu = kieu.khung === 'phu' ? 0.82 : 1;
    const coRieng = (dv.co ?? 1) * phu;
    const x = (s.x ?? dv.x) * W;
    const y = (dv.y ?? co.chanY) * H;

    // tư thế: act > tự động theo nhịp câu (chỉ khi đang nói và không có act) > mặc định
    let dang = s.dang;
    const tuDong = dv.tuDong ?? (shot.loai === 'truc-dien' && noi);
    if (!dang && tuDong && !(dv.act && dv.act.length)) {
      dang = CU_CHI_NOI[hash(shot.idx + 1, cum + 1) % CU_CHI_NOI.length];
      if (!TU_THE[dang]) dang = 'dung';
    }
    // vào khung kiểu lao: frame 0 key nghiêng, frame 1 vượt 1.5%, rồi về
    let xVe = x;
    if (dv.vao === 'lao') {
      if (frame === 0) {
        dang = 'laoVao';
        xVe = x - 0.12 * W;
      } else if (frame === 1) xVe = x + 0.015 * W;
    }

    // miệng: đang nói → lip-sync; không → miệng cảm xúc của act/prop
    const mieng = noi && dangNoi ? miengNoi! : s.mieng ?? (noi ? 'X' : undefined);
    const bienM = noi && dangNoi ? bienNoi : 0;
    if (k === 0) {
      neoX = xVe;
      neoY = y - 2.03 * dau * coRieng;
    }
    // ẢNH CẮT RỜI: chủ nhân tải hình nhân vật của họ lên. Không nhép miệng,
    // không đổi tư thế — chỉ dịch/phóng/xoay theo act. Vẽ ở đây và bỏ qua rig.
    if (dv.anh) {
      const caoAnh = 2.6 * dau * coRieng;
      const rongAnh = caoAnh / (dv.anh_ti_le ?? 1);
      const lat = s.flip ?? dv.flip ?? false;
      const bd = [
        s.scale && s.scale !== 1 ? `translate(${xVe} ${y}) scale(${s.scale}) translate(${-xVe} ${-y})` : '',
        s.xoay ? `rotate(${s.xoay} ${xVe} ${y})` : '',
        lat ? `translate(${xVe} 0) scale(-1 1) translate(${-xVe} 0)` : '',
      ].filter(Boolean).join(' ');
      if (k === 0) {
        neoX = xVe;
        neoY = y - caoAnh;
      }
      return (
        <g key={`anh-${k}`} transform={bd || undefined}>
          <image
            href={staticFile(dv.anh)}
            x={xVe - rongAnh / 2}
            y={y - caoAnh}
            width={rongAnh}
            height={caoAnh}
            preserveAspectRatio="xMidYMax meet"
          />
        </g>
      );
    }

    const kieuVe = dv.toc ? {...kieu, toc: dv.toc} : kieu;
    // Nén–giãn neo ở CHÂN (x, y là điểm chạm đất) — neo ở tâm thì nhân vật lún
    // xuống dưới sàn mỗi lần nén. Xem khối NÉN–GIÃN trong act/ap-dung.ts.
    const nenNgang = s.coNgang ?? 1;
    const nenDoc = s.coDoc ?? 1;
    const coNen = nenNgang !== 1 || nenDoc !== 1;
    const bienDoi = [
      s.scale && s.scale !== 1 ? `translate(${xVe} ${y}) scale(${s.scale}) translate(${-xVe} ${-y})` : '',
      coNen ? `translate(${xVe} ${y}) scale(${nenNgang} ${nenDoc}) translate(${-xVe} ${-y})` : '',
      s.xoay ? `rotate(${s.xoay} ${xVe} ${y})` : '',
    ].filter(Boolean).join(' ');
    /**
     * BÓNG TIẾP ĐẤT — thứ rẻ nhất để nhân vật thôi lơ lửng.
     *
     * Không có bóng thì mắt không có mốc nào để biết chân chạm sàn ở đâu, và cả
     * khung đọc ra là hình dán trên nền. Ellipse đặc, KHÔNG blur (blur phá nét
     * vẽ tay và tốn filter). Nhảy lên thì bóng co lại và nhạt đi — đó là tín
     * hiệu độ cao duy nhất mà hình phẳng có.
     */
    const dauNV = dau * coRieng;
    const bay = 0;
    const bongRx = 0.3 * dauNV * (1 - 0.5 * bay);
    const bongRy = 0.055 * dauNV;
    return (
      <g key={`${dv.kieu}-${k}`} transform={bienDoi || undefined}>
      <ellipse cx={xVe} cy={y + bongRy * 0.35} rx={bongRx} ry={bongRy} fill="#1a1a1a" opacity={0.18 - 0.1 * bay} />
      <NhanVat
        kieu={kieuVe}
        dau={dau * coRieng}
        x={xVe}
        y={y}
        dang={dang ?? 'dung'}
        mat={s.mat}
        may={s.may}
        mieng={mieng}
        bien={bienM}
        rung={noi && dangNoi ? rungNoi : 0}
        nhin={s.nhin ?? (shot.loai === 'truc-dien' ? 0 : dv.x > 0.5 ? -0.5 : 0.5)}
        flip={s.flip ?? dv.flip ?? (shot.loai !== 'truc-dien' && dv.x > 0.5)}
        ma={s.ma}
        moHoi={s.moHoi}
        net={net}
        id={`${id}-${k}`}
        goc={s.goc}
        cam={s.cam || undefined}
        camTuVe={doCamTuVe}
      />
      </g>
    );
  });

  // ── prop ─────────────────────────────────────────────────────────
  const propTatCa = [...bungBoiCanh(shot.boi_canh, shot.co, boiCanhTuVe), ...(shot.prop ?? [])];
  const veProp = (truoc: boolean) =>
    propTatCa
      .filter((p) => t >= (p.tai ?? 0) && Boolean(p.truoc) === truoc)
      .map((p, i) => {
        const Ve = PROPS[p.ten as keyof typeof PROPS] as (React.FC<{x: number; y: number; co: number; net: number; flip?: boolean; chu?: string}> | undefined);
        const chung = {x: p.x * W, y: p.y * H, co: (p.co ?? 1) * (dau / 330), net, flip: p.flip};
        // prop tô màu: bọc trong <g> đặt biến CSS, prop vẽ fill="var(--to, NEN)"
        const boc = (el: React.ReactNode) => (p.mau ? <g key={`${p.ten}-${i}`} style={{['--to' as never]: p.mau}}>{el}</g> : el);
        if (Ve) return boc(<Ve key={`${p.ten}-${i}`} {...chung} chu={p.chu} />);
        const tuVe = propTuVe?.[p.ten];
        if (tuVe) return boc(<PropTuVeVe key={`${p.ten}-${i}`} {...chung} mau={tuVe} chu={p.chu} />);
        return null;
      });
  const props = veProp(false);
  const propsTruoc = veProp(true);

  // KHUNG AN TOÀN: phụ đề chiếm dải đáy (engine/sub.tsx vẽ ở y ≈ 0.87–0.95 H).
  // Trước đây hình được vẽ full khung nên chân nhân vật và prop chạy thẳng vào dải
  // đó — nét đen dưới chữ đen làm phụ đề khó đọc, và người dựng phim chỉ ra ngay ở
  // lần xem đầu. Giờ CẢ SÂN KHẤU (hình + chữ trên màn) thu về 85.5% chiều cao, neo
  // mép trên: hình không bao giờ chạm dải phụ đề nữa. Thu đều hai chiều nên không
  // méo, và lề trái/phải sinh ra cũng là lề thở, không phải mất hình.
  const goc = `translate(${W / 2} 0) scale(${KHUNG_AN_TOAN}) translate(${-W / 2} 0)`;
  const bienDoiZoom = zoom !== 1 ? `translate(${W / 2} ${H / 2}) scale(${zoom}) translate(${-W / 2} ${-H / 2})` : '';
  return (
    <AbsoluteFill style={{background: typeof shot.nen === 'string' && shot.nen !== 'trang' ? shot.nen : NEN}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
        {/* nền vẽ TRƯỚC và KHÔNG bị thu theo khung an toàn: nền phải phủ kín khung,
            kể cả dải đáy dành cho phụ đề, nếu không sẽ hở một vệt trắng dưới chân. */}
        <LopNen nen={shot.nen ?? 'trang'} W={W} H={H} id={id} />
        <g transform={goc}>
          <g transform={bienDoiZoom || undefined}>
            {props}
            {nv}
            {propsTruoc}
            {/* ô chèn vẽ SAU CÙNG trong sân khấu: nó phải nằm trên nhân vật và
                prop, vì cả điểm của nó là "bằng chứng đập vào mặt" giữa lúc kể. */}
            {(shot.chen ?? [])
              .filter((c) => t >= (c.tai ?? 0) && (c.dai == null || t < (c.tai ?? 0) + c.dai))
              .map((c, i) => (
                <OChenVe key={`chen-${i}`} chen={c} W={W} H={H} net={net} frame={frame - f(c.tai ?? 0)} propTuVe={propTuVe} />
              ))}
          </g>
        </g>
      </svg>
      {/* Khung bản tin vẽ NGOÀI khung an toàn: thanh chạy phải chạm mép dưới màn
          như bản tin thật, còn thanh tiêu đề đã tự đặt ở y 0.70 H nên không đụng
          phụ đề (0.90–0.97 H). */}
      {shot.tin && <LopKhungTin tin={shot.tin} W={W} H={H} frame={frame} frameChuong={frameChuong} fps={FPS} />}
      <div style={{position: 'absolute', inset: 0, transform: `scale(${KHUNG_AN_TOAN})`, transformOrigin: 'top center'}}>
        {(shot.chu ?? [])
          .filter((c) => t >= (c.tai ?? 0))
          .map((c, i) => (
            <ChuTrenMan key={i} chu={c} frame={frame - f(c.tai ?? 0)} shotLen={shot.len} W={W} H={H} neoX={neoX} neoY={neoY} net={net} cues={cues.map((q) => ({start: q.start - shot.from, end: q.end - shot.from}))} />
          ))}
      </div>
    </AbsoluteFill>
  );
};

/** ảnh nền tĩnh (hiếm dùng — chỉ khi board khai báo rõ) */
export const NenAnh: React.FC<{src: string}> = ({src}) => <Img src={staticFile(src)} style={{width: W, height: H, objectFit: 'cover'}} />;
