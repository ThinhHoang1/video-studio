/* SINH TỰ ĐỘNG bởi pipeline/dang-ky.mjs — không sửa tay. Chạy lại: node pipeline/dang-ky.mjs */
import {taoPhim} from '../v2/phim/phim-v2';
import type {Board} from '../v2/board/kieu-board';
import type {Manifest, MouthTrack, VoiceTrack} from '../v2/phim/du-lieu';
import board_ban_tin_2026_09_10 from './ban-tin-2026-09-10/board.json';
import manifest_ban_tin_2026_09_10 from './ban-tin-2026-09-10/data/ban-tin-2026-09-10.generated.json';
import voice_ban_tin_2026_09_10 from './ban-tin-2026-09-10/data/ban-tin-2026-09-10.voice.json';
import mouth_ban_tin_2026_09_10 from './ban-tin-2026-09-10/data/ban-tin-2026-09-10.mouth.json';
import board_demo_v2 from './demo-v2/board.json';
import manifest_demo_v2 from './demo-v2/data/demo-v2.generated.json';
import voice_demo_v2 from './demo-v2/data/demo-v2.voice.json';
import mouth_demo_v2 from './demo-v2/data/demo-v2.mouth.json';
import board_first_date from './first-date/board.json';
import manifest_first_date from './first-date/data/first-date.generated.json';
import voice_first_date from './first-date/data/first-date.voice.json';
import mouth_first_date from './first-date/data/first-date.mouth.json';
import board_nhan_vien_so from './nhan-vien-so/board.json';
import manifest_nhan_vien_so from './nhan-vien-so/data/nhan-vien-so.generated.json';
import voice_nhan_vien_so from './nhan-vien-so/data/nhan-vien-so.voice.json';
import mouth_nhan_vien_so from './nhan-vien-so/data/nhan-vien-so.mouth.json';
import board_phong_van from './phong-van/board.json';
import manifest_phong_van from './phong-van/data/phong-van.generated.json';
import voice_phong_van from './phong-van/data/phong-van.voice.json';
import mouth_phong_van from './phong-van/data/phong-van.mouth.json';

export const DU_AN_V2 = [
  {id: 'V2-ban-tin-2026-09-10', ten: 'ban-tin-2026-09-10', duAn: 'ban-tin-2026-09-10', ...taoPhim({board: board_ban_tin_2026_09_10 as unknown as Board, manifest: manifest_ban_tin_2026_09_10 as Manifest, voices: voice_ban_tin_2026_09_10 as unknown as Record<string, VoiceTrack>, mouths: mouth_ban_tin_2026_09_10 as unknown as Record<string, MouthTrack>, tieuDe: "Bảng tin Claw Expert #1 — OpenClaw ra hai bản, và một con sâu zero-click"})},
  {id: 'V2-demo-v2', ten: 'demo-v2', duAn: 'demo-v2', ...taoPhim({board: board_demo_v2 as unknown as Board, manifest: manifest_demo_v2 as Manifest, voices: voice_demo_v2 as unknown as Record<string, VoiceTrack>, mouths: mouth_demo_v2 as unknown as Record<string, MouthTrack>, tieuDe: "Lần đầu bị gọi lên bảng"})},
  {id: 'V2-first-date', ten: 'first-date', duAn: 'first-date', ...taoPhim({board: board_first_date as unknown as Board, manifest: manifest_first_date as Manifest, voices: voice_first_date as unknown as Record<string, VoiceTrack>, mouths: mouth_first_date as unknown as Record<string, MouthTrack>, tieuDe: "Buổi hẹn đầu: mười hai chủ đề và một con mèo"})},
  {id: 'V2-nhan-vien-so', ten: 'nhan-vien-so', duAn: 'nhan-vien-so', ...taoPhim({board: board_nhan_vien_so as unknown as Board, manifest: manifest_nhan_vien_so as Manifest, voices: voice_nhan_vien_so as unknown as Record<string, VoiceTrack>, mouths: mouth_nhan_vien_so as unknown as Record<string, MouthTrack>, tieuDe: "Công ty tôi có một nhân viên. Là tôi."})},
  {id: 'V2-phong-van', ten: 'phong-van', duAn: 'phong-van', ...taoPhim({board: board_phong_van as unknown as Board, manifest: manifest_phong_van as Manifest, voices: voice_phong_van as unknown as Record<string, VoiceTrack>, mouths: mouth_phong_van as unknown as Record<string, MouthTrack>, tieuDe: "Lần đầu phỏng vấn: Long dặn bảy điều, tôi nhớ hai"})},
];
