/**
 * Đăng ký composition V2 tự động — agent không phải sửa src/Root.tsx hay render-segments.sh.
 *
 *   node pipeline/dang-ky.mjs
 *
 * Quét scripts/<ten>.json có `project`, đủ src/projects/<du-an>/board.json +
 * data/<ten>.{generated,voice,mouth}.json → sinh src/projects/du-an.generated.ts
 * (import tĩnh để bundler thấy). Root.tsx đọc mảng DU_AN_V2 và đăng ký
 * composition id "V2-<ten>". Thiếu file nào thì bỏ qua dự án đó và báo lý do.
 */
import {existsSync, readdirSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const ten = (s) => s.replace(/[^a-zA-Z0-9]/g, '_');

const dong = [];
const muc = [];
const boQua = [];
for (const f of readdirSync(path.join(ROOT, 'scripts')).filter((x) => x.endsWith('.json')).sort()) {
  const id = f.replace(/\.json$/, '');
  const kb = JSON.parse(readFileSync(path.join(ROOT, 'scripts', f), 'utf8'));
  const duAn = kb.project;
  if (!duAn) {
    boQua.push(`${id}: kịch bản không có trường project (V1, bỏ qua)`);
    continue;
  }
  const can = {
    board: `src/projects/${duAn}/board.json`,
    manifest: `src/projects/${duAn}/data/${id}.generated.json`,
    voice: `src/projects/${duAn}/data/${id}.voice.json`,
    mouth: `src/projects/${duAn}/data/${id}.mouth.json`,
  };
  const thieu = Object.entries(can).filter(([, p]) => !existsSync(path.join(ROOT, p)));
  if (thieu.length) {
    boQua.push(`${id}: thiếu ${thieu.map(([k, p]) => `${k} (${p})`).join(', ')}`);
    continue;
  }
  const v = ten(id);
  dong.push(
    `import board_${v} from './${duAn}/board.json';`,
    `import manifest_${v} from './${duAn}/data/${id}.generated.json';`,
    `import voice_${v} from './${duAn}/data/${id}.voice.json';`,
    `import mouth_${v} from './${duAn}/data/${id}.mouth.json';`
  );
  const tieuDe = JSON.stringify(kb.title ?? id);
  muc.push(
    `  {id: 'V2-${id}', ten: '${id}', duAn: '${duAn}', ...taoPhim({board: board_${v} as unknown as Board, manifest: manifest_${v} as Manifest, voices: voice_${v} as unknown as Record<string, VoiceTrack>, mouths: mouth_${v} as unknown as Record<string, MouthTrack>, tieuDe: ${tieuDe}})},`
  );
}

const ra = `/* SINH TỰ ĐỘNG bởi pipeline/dang-ky.mjs — không sửa tay. Chạy lại: node pipeline/dang-ky.mjs */
import {taoPhim} from '../v2/phim/phim-v2';
import type {Board} from '../v2/board/kieu-board';
import type {Manifest, MouthTrack, VoiceTrack} from '../v2/phim/du-lieu';
${dong.join('\n')}

export const DU_AN_V2 = [
${muc.join('\n')}
];
`;
const fileRa = path.join(ROOT, 'src/projects/du-an.generated.ts');
const cu = existsSync(fileRa) ? readFileSync(fileRa, 'utf8') : '';
if (cu !== ra) writeFileSync(fileRa, ra);
console.log(`✓ ${muc.length} dự án V2 đăng ký: ${muc.map((m) => m.match(/id: '([^']+)'/)[1]).join(', ') || '(không có)'}${cu === ra ? ' (không đổi)' : ''}`);
for (const b of boQua) console.log(`  · bỏ qua ${b}`);
