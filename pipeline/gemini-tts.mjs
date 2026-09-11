// TTS bằng Gemini. Trả về mp3 đã chuẩn hoá -16 LUFS + độ dài thật.
import {execFileSync} from 'node:child_process';
import {readFileSync, writeFileSync, mkdirSync, rmSync, existsSync} from 'node:fs';
import path from 'node:path';
import {timLibDir} from './moi-truong.mjs';

// pipeline/ nằm dưới gốc repo một cấp
const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
// Gói compositor mang cả hậu tố libc trên Linux (linux-arm64-gnu) — timLibDir dò đúng
// gói cho máy này thay vì cắm cứng darwin-arm64 (cắm cứng = mọi bước ffmpeg hỏng trên Linux).
const LIBDIR = timLibDir(ROOT) ?? path.join(ROOT, 'node_modules/@remotion/compositor-darwin-arm64');
const FFMPEG = path.join(LIBDIR, 'ffmpeg');
const FFPROBE = path.join(LIBDIR, 'ffprobe');
const ENV = {...process.env, DYLD_LIBRARY_PATH: LIBDIR, LD_LIBRARY_PATH: LIBDIR};

export const MODEL = process.env.GEMINI_TTS_MODEL ?? 'gemini-3.1-flash-tts-preview';

/**
 * Free tier tính hạn mức theo TỪNG key và TỪNG model (10 request/ngày).
 * Nên thay vì chờ hết hạn, ta xoay vòng qua mọi cặp (key, model) — mỗi cặp
 * là một hạn mức riêng. Hai key nhân ba model = sáu hạn mức.
 */
const tachDanh = (s) => String(s ?? '').split(',').map((k) => k.trim()).filter(Boolean);

/** đọc một biến từ process.env, không có thì dò trong .env ở gốc repo */
const bienMoiTruong = (ten) => {
  if (process.env[ten]) return process.env[ten];
  try {
    const env = readFileSync(path.join(ROOT, '.env'), 'utf8');
    const m = env.match(new RegExp(`^${ten}=(.+)$`, 'm'));
    return m ? m[1].trim() : '';
  } catch {
    return '';
  }
};

/**
 * Khoá LiteLLM bắt đầu bằng "sk-" và đi qua proxy nội bộ, không phải Google.
 * Cùng một hàm speak() xoay vòng cả hai loại — chỉ khác chỗ speakOnce gọi đi đâu.
 */
export const laLiteLLM = (k) => k.startsWith('sk-');

export const litellmBase = () =>
  (bienMoiTruong('LITELLM_BASE_URL') || 'https://tryopenclaw-litellm.staging.firegroup.vn').replace(/\/$/, '');

export const litellmKeys = () => tachDanh(bienMoiTruong('LITELLM_KEYS') || bienMoiTruong('LITELLM_KEY'));

/**
 * LiteLLM bắt buộc tiền tố "toc/" trong tên model, thiếu là 401 chứ không phải 404.
 */
export const LITELLM_MODELS = tachDanh(bienMoiTruong('LITELLM_TTS_MODELS') || 'toc/gemini-3.1-flash-tts-preview');

export const geminiKeys = () => {
  const fromEnv = process.env.GEMINI_API_KEYS ?? process.env.GEMINI_API_KEY;
  if (fromEnv) return tachDanh(fromEnv);
  return tachDanh(bienMoiTruong('GEMINI_API_KEYS') || bienMoiTruong('GEMINI_API_KEY'));
};

export const apiKeys = () => {
  const ks = [...geminiKeys(), ...litellmKeys()];
  if (!ks.length) throw new Error('Thiếu GEMINI_API_KEYS hoặc LITELLM_KEYS trong .env');
  return ks;
};

export const apiKey = () => apiKeys()[0];

export const MODELS = (process.env.GEMINI_TTS_MODELS ?? 'gemini-2.5-flash-preview-tts,gemini-3.1-flash-tts-preview,gemini-2.5-pro-preview-tts')
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);

// Gemini trả PCM s16le 24kHz mono, phải tự đóng gói.
export const pcmToMp3 = (pcm, mp3, {lufs = -16} = {}) => {
  const raw = `${mp3}.raw`;
  writeFileSync(raw, pcm);
  execFileSync(
    FFMPEG,
    [
      '-y',
      '-f', 's16le', '-ar', '24000', '-ac', '1', '-i', raw,
      '-af', `loudnorm=I=${lufs}:TP=-1.5:LRA=11`,
      '-ar', '48000', '-b:a', '160k',
      mp3,
    ],
    {stdio: 'ignore', env: ENV}
  );
  rmSync(raw);
};

export const durationOf = (file) =>
  Number(
    execFileSync(
      FFPROBE,
      ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file],
      {env: ENV}
    )
      .toString()
      .trim()
  );

export const concatMp3 = (files, out) => {
  const list = `${out}.txt`;
  writeFileSync(list, files.map((f) => `file '${f}'`).join('\n'));
  execFileSync(FFMPEG, ['-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', out], {
    stdio: 'ignore',
    env: ENV,
  });
  rmSync(list);
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Free tier gemini-*-tts chỉ cho 3 request/phút -> tự giãn nhịp + backoff theo
// đúng số giây API bảo chờ.
let lastCall = 0;

/** Mọi cặp (key, model) — mỗi cặp một hạn mức riêng. */
const slots = () => {
  const out = [];
  for (const model of MODELS) for (const key of geminiKeys()) out.push({key, model});
  for (const model of LITELLM_MODELS) for (const key of litellmKeys()) out.push({key, model});
  if (!out.length) throw new Error('Thiếu GEMINI_API_KEYS hoặc LITELLM_KEYS trong .env');
  return out;
};

let slotIdx = 0;
/** lần gọi cuối theo TỪNG cặp key×model — hạn mức 3 req/phút là của mỗi cặp, không phải toàn cục */
const lanCuoi = new Map();
/** cặp bị 429: né tới thời điểm này */
const neTới = new Map();
const idSlot = (s) => `${s.key.slice(-6)}|${s.model}`;

/**
 * Xoay tua liên tục qua mọi cặp key×model: mỗi lần gọi lấy cặp kế tiếp, chỉ chờ
 * khi CHÍNH cặp đó vừa được gọi dưới MIN_GAP_MS. 3 key × 3 model = 9 cặp → ~9 lượt / 21 s
 * khi gọi song song, thay vì 1 lượt / 21 s như bản cũ (gap toàn cục).
 */
export const speak = async (opts) => {
  const all = slots();
  const gap = Number(process.env.GEMINI_MIN_GAP_MS ?? 21000);

  for (let attempt = 1; attempt <= all.length * 3; attempt++) {
    // chọn cặp: xoay vòng, bỏ qua cặp đang bị né; nếu tất cả bị né thì chờ cặp hết né sớm nhất
    let slot = null;
    for (let k = 0; k < all.length; k++) {
      const s = all[(slotIdx + k) % all.length];
      if ((neTới.get(idSlot(s)) ?? 0) <= Date.now()) { slot = s; slotIdx = (slotIdx + k + 1) % all.length; break; }
    }
    if (!slot) {
      const somNhat = Math.min(...all.map((s) => neTới.get(idSlot(s)) ?? 0));
      const cho = Math.max(1000, somNhat - Date.now());
      console.log(`  … hết hạn mức cả ${all.length} cặp key×model, chờ ${(cho / 1000).toFixed(0)}s`);
      await sleep(cho);
      continue;
    }
    const id = idSlot(slot);
    const wait = (lanCuoi.get(id) ?? 0) + gap - Date.now();
    if (wait > 0) await sleep(wait);
    lanCuoi.set(id, Date.now());

    try {
      return await speakOnce({...opts, key: slot.key, model: opts.model ?? slot.model});
    } catch (err) {
      const quota = /quota|rate limit|resource_exhausted/i.test(err.message);
      // "high demand" là 503 tạm thời của Gemini — trước đây KHÔNG nằm trong danh sách
      // nên nó ném thẳng ra ngoài và giết cả mẻ đọc, mất sạch các chương đang chạy
      // song song. Đo 2026-09-11: một mẻ 14 chương chỉ đọc xong 1 chương vì lỗi này.
      const transient = /unavailable|internal error|deadline|overloaded|high demand|503|temporar|không có audio|quá dài/i.test(err.message);
      if (!quota && !transient) throw err;
      const short = slot.model.replace('gemini-', '').replace('-preview', '');
      const soKey = apiKeys().indexOf(slot.key) + 1;
      if (quota) {
        // "retry in Ns" → né đúng bấy nhiêu; không có thì né 65 s (hạn mức phút) — hết hạn mức NGÀY thì lần sau vẫn 429 và tiếp tục né
        const m = /retry in ([\d.]+)s/i.exec(err.message);
        const ne = m ? Math.ceil(Number(m[1]) * 1000) + 1500 : 65000;
        neTới.set(id, Date.now() + ne);
        console.log(`  … ${short}/key${soKey} hết lượt (né ${(ne / 1000).toFixed(0)}s), đổi cặp khác`);
      } else {
        // lỗi tạm: né cặp này 20 s rồi cho quay lại, thay vì thử liên tục vào đúng
        // cặp đang quá tải
        neTới.set(id, Date.now() + 20000);
        console.log(`  … ${short}/key${soKey} lỗi tạm (${err.message.slice(0, 60)}), né 20s`);
      }
    }
  }
  throw new Error('Không cặp key×model nào còn hạn mức');
};

/**
 * Đường LiteLLM: KHÔNG dùng /v1/audio/speech (proxy trả 500) và cũng không dùng
 * đường :generateContent (404). Đường chạy được là chat/completions với
 * modalities:["audio"] — trả base64 PCM s16le 24 kHz mono, đúng định dạng
 * pcmToMp3 đang chờ. Đo thật 2026-09-11 với model toc/gemini-3.1-flash-tts-preview.
 */
const speakLiteLLM = async ({prompt, voice, model, key, temperature}) => {
  const res = await fetch(`${litellmBase()}/v1/chat/completions`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', authorization: `Bearer ${key}`},
    body: JSON.stringify({
      model,
      modalities: ['audio'],
      audio: {voice, format: 'pcm16'},
      temperature,
      messages: [{role: 'user', content: prompt}],
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    throw new Error(`${voice}: litellm ${res.status} ${json?.error?.message ?? JSON.stringify(json).slice(0, 300)}`);
  }
  const b64 = json.choices?.[0]?.message?.audio?.data;
  if (!b64) throw new Error(`${voice}: không có audio — ${JSON.stringify(json).slice(0, 400)}`);
  return Buffer.from(b64, 'base64');
};

const speakOnce = async ({text, voice, style, model = MODEL, key, temperature = 1.0}) => {
  const prompt = style ? `${style}\n\n${text}` : text;
  if (key && laLiteLLM(key)) return speakLiteLLM({prompt, voice, model, key, temperature});
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key ?? apiKey()}`,
    {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        contents: [{parts: [{text: prompt}]}],
        generationConfig: {
          temperature,
          responseModalities: ['AUDIO'],
          speechConfig: {voiceConfig: {prebuiltVoiceConfig: {voiceName: voice}}},
        },
      }),
    }
  );
  const json = await res.json();
  if (json.error) throw new Error(`${voice}: ${json.error.message}`);
  const b64 = json.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!b64) throw new Error(`${voice}: không có audio — ${JSON.stringify(json).slice(0, 400)}`);
  return Buffer.from(b64, 'base64');
};

export const ensureDir = (dir, {clean = false} = {}) => {
  if (clean && existsSync(dir)) rmSync(dir, {recursive: true});
  mkdirSync(dir, {recursive: true});
  return dir;
};

export {ENV, FFMPEG, FFPROBE};
