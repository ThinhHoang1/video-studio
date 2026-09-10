/* SINH TỰ ĐỘNG bởi pipeline/dang-ky.mjs — không sửa tay. Chạy lại: node pipeline/dang-ky.mjs */
import {taoPhim} from '../v2/phim/phim-v2';
import type {Board} from '../v2/board/kieu-board';
import type {Manifest, MouthTrack, VoiceTrack} from '../v2/phim/du-lieu';
import board_demo_v2 from './demo-v2/board.json';
import manifest_demo_v2 from './demo-v2/data/demo-v2.generated.json';
import voice_demo_v2 from './demo-v2/data/demo-v2.voice.json';
import mouth_demo_v2 from './demo-v2/data/demo-v2.mouth.json';

export const DU_AN_V2 = [
  {id: 'V2-demo-v2', ten: 'demo-v2', duAn: 'demo-v2', ...taoPhim({board: board_demo_v2 as unknown as Board, manifest: manifest_demo_v2 as Manifest, voices: voice_demo_v2 as unknown as Record<string, VoiceTrack>, mouths: mouth_demo_v2 as unknown as Record<string, MouthTrack>, tieuDe: "Lần đầu bị gọi lên bảng"})},
];
