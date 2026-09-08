// TTS bằng Gemini. Trả về mp3 đã chuẩn hoá -16 LUFS + độ dài thật.
import {execFileSync} from 'node:child_process';
import {readFileSync, writeFileSync, mkdirSync, rmSync, existsSync} from 'node:fs';
import path from 'node:path';

// pipeline/ nằm dưới gốc repo một cấp
const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const LIBDIR = path.join(ROOT, 'node_modules/@remotion/compositor-darwin-arm64');
const FFMPEG = path.join(LIBDIR, 'ffmpeg');
const FFPROBE = path.join(LIBDIR, 'ffprobe');
const ENV = {...process.env, DYLD_LIBRARY_PATH: LIBDIR};

export const MODEL = process.env.GEMINI_TTS_MODEL ?? 'gemini-3.1-flash-tts-preview';

/**
 * Free tier tính hạn mức theo TỪNG key và TỪNG model (10 request/ngày).
 * Nên thay vì chờ hết hạn, ta xoay vòng qua mọi cặp (key, model) — mỗi cặp
 * là một hạn mức riêng. Hai key nhân ba model = sáu hạn mức.
 */
export const apiKeys = () => {
  const fromEnv = process.env.GEMINI_API_KEYS ?? process.env.GEMINI_API_KEY;
  if (fromEnv) return fromEnv.split(',').map((k) => k.trim()).filter(Boolean);
  const env = readFileSync(path.join(ROOT, '.env'), 'utf8');
  const m = env.match(/^GEMINI_API_KEYS?=(.+)$/m);
  if (!m) throw new Error('Thiếu GEMINI_API_KEYS trong .env');
  return m[1].split(',').map((k) => k.trim()).filter(Boolean);
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
const MIN_GAP_MS = Number(process.env.GEMINI_MIN_GAP_MS ?? 21000);

/** Mọi cặp (key, model) — mỗi cặp một hạn mức riêng. */
const slots = () => {
  const ks = apiKeys();
  const out = [];
  for (const model of MODELS) for (const key of ks) out.push({key, model});
  return out;
};

let slotIdx = 0;

export const speak = async (opts) => {
  const all = slots();
  let exhausted = 0;

  for (let attempt = 1; attempt <= all.length * 3; attempt++) {
    const slot = all[slotIdx % all.length];
    const wait = lastCall + MIN_GAP_MS - Date.now();
    if (wait > 0) await sleep(wait);
    lastCall = Date.now();

    try {
      return await speakOnce({...opts, key: slot.key, model: opts.model ?? slot.model});
    } catch (err) {
      const quota = /quota|rate limit|resource_exhausted/i.test(err.message);
      // "không có audio" (finishReason OTHER) và "quá dài" đều là lỗi chập chờn
      // của model, thử lại ở cặp khác là qua.
      const transient =
        /unavailable|internal error|deadline|overloaded|không có audio|quá dài/i.test(err.message);
      if (!quota && !transient) throw err;

      // Hết hạn mức ở cặp này -> nhảy sang cặp khác NGAY, không nằm chờ.
      slotIdx += 1;
      if (quota) exhausted += 1;

      if (exhausted >= all.length) {
        // đã thử hết mọi cặp -> lúc này mới đành chờ
        const m = /retry in ([\d.]+)s/i.exec(err.message);
        const backoff = m ? Math.ceil(Number(m[1]) * 1000) + 2000 : 60000;
        console.log(`  … hết hạn mức cả ${all.length} cặp key×model, chờ ${(backoff / 1000).toFixed(0)}s`);
        await sleep(backoff);
        exhausted = 0;
      } else {
        const short = slot.model.replace('gemini-', '').replace('-preview', '');
        console.log(`  … ${short}/key${(all.indexOf(slot) % apiKeys().length) + 1} hết lượt, đổi cặp khác`);
      }
    }
  }
  throw new Error('Không cặp key×model nào còn hạn mức');
};

const speakOnce = async ({text, voice, style, model = MODEL, key, temperature = 1.0}) => {
  const prompt = style ? `${style}\n\n${text}` : text;
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
