/* SINH TỰ ĐỘNG bởi pipeline/dang-ky.mjs — không sửa tay. Chạy lại: node pipeline/dang-ky.mjs */
import {taoPhim} from '../v2/phim/phim-v2';
import type {Board} from '../v2/board/kieu-board';
import type {Manifest, MouthTrack, VoiceTrack} from '../v2/phim/du-lieu';
import board_ban_tin_2026_09_10 from './ban-tin-2026-09-10/board.json';
import manifest_ban_tin_2026_09_10 from './ban-tin-2026-09-10/data/ban-tin-2026-09-10.generated.json';
import voice_ban_tin_2026_09_10 from './ban-tin-2026-09-10/data/ban-tin-2026-09-10.voice.json';
import board_ban_tin_2026_09_14 from './ban-tin-2026-09-14/board.json';
import manifest_ban_tin_2026_09_14 from './ban-tin-2026-09-14/data/ban-tin-2026-09-14.generated.json';
import voice_ban_tin_2026_09_14 from './ban-tin-2026-09-14/data/ban-tin-2026-09-14.voice.json';
import board_ban_tin_2026_09_15 from './ban-tin-2026-09-15/board.json';
import manifest_ban_tin_2026_09_15 from './ban-tin-2026-09-15/data/ban-tin-2026-09-15.generated.json';
import voice_ban_tin_2026_09_15 from './ban-tin-2026-09-15/data/ban-tin-2026-09-15.voice.json';
import board_ban_tin_2g from './ban-tin-2g/board.json';
import manifest_ban_tin_2g from './ban-tin-2g/data/ban-tin-2g.generated.json';
import voice_ban_tin_2g from './ban-tin-2g/data/ban-tin-2g.voice.json';
import board_bong_da_40_ngay from './bong-da-40-ngay/board.json';
import manifest_bong_da_40_ngay from './bong-da-40-ngay/data/bong-da-40-ngay.generated.json';
import voice_bong_da_40_ngay from './bong-da-40-ngay/data/bong-da-40-ngay.voice.json';
import mouth_bong_da_40_ngay from './bong-da-40-ngay/data/bong-da-40-ngay.mouth.json';
import board_chep_phat from './chep-phat/board.json';
import manifest_chep_phat from './chep-phat/data/chep-phat.generated.json';
import voice_chep_phat from './chep-phat/data/chep-phat.voice.json';
import mouth_chep_phat from './chep-phat/data/chep-phat.mouth.json';
import board_cuc_tay_37 from './cuc-tay-37/board.json';
import manifest_cuc_tay_37 from './cuc-tay-37/data/cuc-tay-37.generated.json';
import voice_cuc_tay_37 from './cuc-tay-37/data/cuc-tay-37.voice.json';
import mouth_cuc_tay_37 from './cuc-tay-37/data/cuc-tay-37.mouth.json';
import board_demo_v2 from './demo-v2/board.json';
import manifest_demo_v2 from './demo-v2/data/demo-v2.generated.json';
import voice_demo_v2 from './demo-v2/data/demo-v2.voice.json';
import mouth_demo_v2 from './demo-v2/data/demo-v2.mouth.json';
import board_first_date from './first-date/board.json';
import manifest_first_date from './first-date/data/first-date.generated.json';
import voice_first_date from './first-date/data/first-date.voice.json';
import mouth_first_date from './first-date/data/first-date.mouth.json';
import board_hen_ho_dau from './hen-ho-dau/board.json';
import manifest_hen_ho_dau from './hen-ho-dau/data/hen-ho-dau.generated.json';
import voice_hen_ho_dau from './hen-ho-dau/data/hen-ho-dau.voice.json';
import mouth_hen_ho_dau from './hen-ho-dau/data/hen-ho-dau.mouth.json';
import board_len_sai_gon from './len-sai-gon/board.json';
import manifest_len_sai_gon from './len-sai-gon/data/len-sai-gon.generated.json';
import voice_len_sai_gon from './len-sai-gon/data/len-sai-gon.voice.json';
import mouth_len_sai_gon from './len-sai-gon/data/len-sai-gon.mouth.json';
import board_nhan_vien_so from './nhan-vien-so/board.json';
import manifest_nhan_vien_so from './nhan-vien-so/data/nhan-vien-so.generated.json';
import voice_nhan_vien_so from './nhan-vien-so/data/nhan-vien-so.voice.json';
import mouth_nhan_vien_so from './nhan-vien-so/data/nhan-vien-so.mouth.json';
import board_phong_van from './phong-van/board.json';
import manifest_phong_van from './phong-van/data/phong-van.generated.json';
import voice_phong_van from './phong-van/data/phong-van.voice.json';
import mouth_phong_van from './phong-van/data/phong-van.mouth.json';

export const DU_AN_V2 = [
  {id: 'V2-ban-tin-2026-09-10', ten: 'ban-tin-2026-09-10', duAn: 'ban-tin-2026-09-10', ...taoPhim({board: board_ban_tin_2026_09_10 as unknown as Board, manifest: manifest_ban_tin_2026_09_10 as Manifest, voices: voice_ban_tin_2026_09_10 as unknown as Record<string, VoiceTrack>, tieuDe: "Bảng tin Claw Expert #1 — OpenClaw ra hai bản, và một con sâu zero-click"})},
  {id: 'V2-ban-tin-2026-09-14', ten: 'ban-tin-2026-09-14', duAn: 'ban-tin-2026-09-14', ...taoPhim({board: board_ban_tin_2026_09_14 as unknown as Board, manifest: manifest_ban_tin_2026_09_14 as Manifest, voices: voice_ban_tin_2026_09_14 as unknown as Record<string, VoiceTrack>, tieuDe: "Bảng tin Claw Expert — Skill tự viết, chợ skill và bảy bước không dính mã bẩn"})},
  {id: 'V2-ban-tin-2026-09-15', ten: 'ban-tin-2026-09-15', duAn: 'ban-tin-2026-09-15', ...taoPhim({board: board_ban_tin_2026_09_15 as unknown as Board, manifest: manifest_ban_tin_2026_09_15 as Manifest, voices: voice_ban_tin_2026_09_15 as unknown as Record<string, VoiceTrack>, tieuDe: "Bản tin công nghệ 15 tháng 9: Tắt sóng 2G, iOS 27 và kính quay lén"})},
  {id: 'V2-ban-tin-2g', ten: 'ban-tin-2g', duAn: 'ban-tin-2g', ...taoPhim({board: board_ban_tin_2g as unknown as Board, manifest: manifest_ban_tin_2g as Manifest, voices: voice_ban_tin_2g as unknown as Record<string, VoiceTrack>, tieuDe: "Bản tin: Việt Nam tắt sóng 2G"})},
  {id: 'V2-bong-da-40-ngay', ten: 'bong-da-40-ngay', duAn: 'bong-da-40-ngay', ...taoPhim({board: board_bong_da_40_ngay as unknown as Board, manifest: manifest_bong_da_40_ngay as Manifest, voices: voice_bong_da_40_ngay as unknown as Record<string, VoiceTrack>, mouths: mouth_bong_da_40_ngay as unknown as Record<string, MouthTrack>, tieuDe: "Bốn mươi ngày từ vô địch xuống hạng tư"})},
  {id: 'V2-chep-phat', ten: 'chep-phat', duAn: 'chep-phat', ...taoPhim({board: board_chep_phat as unknown as Board, manifest: manifest_chep_phat as Manifest, voices: voice_chep_phat as unknown as Record<string, VoiceTrack>, mouths: mouth_chep_phat as unknown as Record<string, MouthTrack>, tieuDe: "Chép phạt năm trăm lần"})},
  {id: 'V2-cuc-tay-37', ten: 'cuc-tay-37', duAn: 'cuc-tay-37', ...taoPhim({board: board_cuc_tay_37 as unknown as Board, manifest: manifest_cuc_tay_37 as Manifest, voices: voice_cuc_tay_37 as unknown as Record<string, VoiceTrack>, mouths: mouth_cuc_tay_37 as unknown as Record<string, MouthTrack>, tieuDe: "Cục tẩy ba mươi bảy lần"})},
  {id: 'V2-demo-v2', ten: 'demo-v2', duAn: 'demo-v2', ...taoPhim({board: board_demo_v2 as unknown as Board, manifest: manifest_demo_v2 as Manifest, voices: voice_demo_v2 as unknown as Record<string, VoiceTrack>, mouths: mouth_demo_v2 as unknown as Record<string, MouthTrack>, tieuDe: "Lần đầu bị gọi lên bảng"})},
  {id: 'V2-first-date', ten: 'first-date', duAn: 'first-date', ...taoPhim({board: board_first_date as unknown as Board, manifest: manifest_first_date as Manifest, voices: voice_first_date as unknown as Record<string, VoiceTrack>, mouths: mouth_first_date as unknown as Record<string, MouthTrack>, tieuDe: "Buổi hẹn đầu: mười hai chủ đề và một con mèo"})},
  {id: 'V2-hen-ho-dau', ten: 'hen-ho-dau', duAn: 'hen-ho-dau', ...taoPhim({board: board_hen_ho_dau as unknown as Board, manifest: manifest_hen_ho_dau as Manifest, voices: voice_hen_ho_dau as unknown as Record<string, VoiceTrack>, mouths: mouth_hen_ho_dau as unknown as Record<string, MouthTrack>, tieuDe: "Lần đầu hẹn hò: tôi mời, và cái máy quẹt thẻ"})},
  {id: 'V2-len-sai-gon', ten: 'len-sai-gon', duAn: 'len-sai-gon', ...taoPhim({board: board_len_sai_gon as unknown as Board, manifest: manifest_len_sai_gon as Manifest, voices: voice_len_sai_gon as unknown as Record<string, VoiceTrack>, mouths: mouth_len_sai_gon as unknown as Record<string, MouthTrack>, tieuDe: "Bỏ quê lên Sài Gòn: mẹ dúi hai triệu, mình cầm mà tay run"})},
  {id: 'V2-nhan-vien-so', ten: 'nhan-vien-so', duAn: 'nhan-vien-so', ...taoPhim({board: board_nhan_vien_so as unknown as Board, manifest: manifest_nhan_vien_so as Manifest, voices: voice_nhan_vien_so as unknown as Record<string, VoiceTrack>, mouths: mouth_nhan_vien_so as unknown as Record<string, MouthTrack>, tieuDe: "Công ty tôi có một nhân viên. Là tôi."})},
  {id: 'V2-phong-van', ten: 'phong-van', duAn: 'phong-van', ...taoPhim({board: board_phong_van as unknown as Board, manifest: manifest_phong_van as Manifest, voices: voice_phong_van as unknown as Record<string, VoiceTrack>, mouths: mouth_phong_van as unknown as Record<string, MouthTrack>, tieuDe: "Lần đầu phỏng vấn: Long dặn bảy điều, tôi nhớ hai"})},
];
