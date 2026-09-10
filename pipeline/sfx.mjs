/**
 * Tự tổng hợp bộ 29 hiệu ứng âm thanh cho video → public/sfx/*.wav
 *
 *   node pipeline/sfx.mjs
 *
 * Không tải SFX từ đâu cả — mỗi tiếng dựng từ dao động cơ bản nên không dính bản
 * quyền, và chỉnh được chính xác theo nhịp cắt của video.
 *
 * VÌ SAO VIẾT LẠI BẰNG NODE (bản cũ là pipeline/sfx.py + numpy): image Linux của
 * instance không có numpy, cũng không có pip để cài, nên mọi bản cài trên OpenClaw
 * đều mất sạch tiếng động và không có cách nào sửa từ trong bundle. Node thì luôn có
 * sẵn — engine chạy bằng nó. sfx.py giữ lại làm bản tham chiếu, không còn được gọi.
 */
import {mkdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';

const ROOT = path.join(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'public/sfx');
const SR = 48000;

/** PRNG tất định — cùng seed cho ra cùng bộ tiếng, không phụ thuộc máy */
const rng = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
let R = rng(3);
const zeros = (n) => new Float64Array(n);
const add = (a, b, w = 1) => {
  for (let i = 0; i < a.length; i++) a[i] += b[i] * w;
  return a;
};
const mul = (a, b) => {
  for (let i = 0; i < a.length; i++) a[i] *= typeof b === 'number' ? b : b[i];
  return a;
};
const lin = (n, a, b) => {
  const x = zeros(n);
  for (let i = 0; i < n; i++) x[i] = n === 1 ? a : a + ((b - a) * i) / (n - 1);
  return x;
};
const geom = (n, a, b) => {
  const x = zeros(n);
  const la = Math.log(Math.max(a, 1e-6));
  const lb = Math.log(Math.max(b, 1e-6));
  for (let i = 0; i < n; i++) x[i] = Math.exp(n === 1 ? la : la + ((lb - la) * i) / (n - 1));
  return x;
};

/** bao biên độ: lên nhanh, tắt theo hàm mũ */
const env = (n, attack = 0.005, decay = 0.25, curve = 3.0) => {
  const y = zeros(n);
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : i / (n - 1);
    const a = Math.min(1, Math.max(0, t / Math.max(attack, 1e-6)));
    const d = Math.exp(-curve * Math.max(0, (t - attack) / Math.max(decay, 1e-6)));
    y[i] = a * d;
  }
  return y;
};

const noise = (n) => {
  const x = zeros(n);
  for (let i = 0; i < n; i++) x[i] = R() * 2 - 1;
  return x;
};

/** lọc thông thấp một cực — đủ để bẻ tiếng ồn trắng thành tiếng gió */
const lowpass = (x, cutoff) => {
  const a = Math.exp((-2 * Math.PI * cutoff) / SR);
  const y = zeros(x.length);
  let acc = 0;
  for (let i = 0; i < x.length; i++) {
    acc = a * acc + (1 - a) * x[i];
    y[i] = acc;
  }
  return y;
};

/** lọc thông thấp có tần số cắt quét từ f0 tới f1 — lõi của tiếng whoosh */
const sweepLowpass = (x, f0, f1) => {
  const n = x.length;
  const c = geom(n, Math.max(f0, 20), Math.max(f1, 20));
  const y = zeros(n);
  let acc = 0;
  for (let i = 0; i < n; i++) {
    const a = Math.exp((-2 * Math.PI * c[i]) / SR);
    acc = a * acc + (1 - a) * x[i];
    y[i] = acc;
  }
  return y;
};

const sine = (n, f0, f1 = null) => {
  const freq = geom(n, f0, f1 === null ? f0 : f1);
  const y = zeros(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    ph += (2 * Math.PI * freq[i]) / SR;
    y[i] = Math.sin(ph);
  }
  return y;
};

/** dao động vuông theo pha tích luỹ của một đường tần số bất kỳ */
const sq = (n, freqAt) => {
  const y = zeros(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    ph += (2 * Math.PI * freqAt(i)) / SR;
    y[i] = Math.sin(ph) >= 0 ? 1 : -1;
  }
  return y;
};

const sec = (s) => Math.round(s * SR);

const save = (name, x, peak = 0.85) => {
  let m = 0;
  for (const v of x) m = Math.max(m, Math.abs(v));
  if (m > 0) for (let i = 0; i < x.length; i++) x[i] = (x[i] / m) * peak;
  // fade 3ms hai đầu để không bị "cụp"
  const f = sec(0.003);
  if (x.length > 2 * f) {
    for (let i = 0; i < f; i++) {
      x[i] *= i / f;
      x[x.length - 1 - i] *= i / f;
    }
  }
  const data = Buffer.alloc(x.length * 2);
  for (let i = 0; i < x.length; i++) data.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(x[i] * 32767))), i * 2);
  const head = Buffer.alloc(44);
  head.write('RIFF', 0);
  head.writeUInt32LE(36 + data.length, 4);
  head.write('WAVEfmt ', 8);
  head.writeUInt32LE(16, 16);
  head.writeUInt16LE(1, 20);
  head.writeUInt16LE(1, 22);
  head.writeUInt32LE(SR, 24);
  head.writeUInt32LE(SR * 2, 28);
  head.writeUInt16LE(2, 32);
  head.writeUInt16LE(16, 34);
  head.write('data', 36);
  head.writeUInt32LE(data.length, 40);
  writeFileSync(path.join(OUT, `${name}.wav`), Buffer.concat([head, data]));
  console.log(`${name.padEnd(14)} ${(x.length / SR).toFixed(2)}s`);
};

// ── các tiếng cơ bản ─────────────────────────────────────────────────────────
const whoosh = (dur = 0.34, up = true) => {
  const n = sec(dur);
  const x = up ? sweepLowpass(noise(n), 300, 6000) : sweepLowpass(noise(n), 6000, 300);
  return mul(x, env(n, 0.02, 0.5, 2.4));
};

const pop = (dur = 0.16, f0 = 900, f1 = 140) => {
  const n = sec(dur);
  const x = mul(sine(n, f0, f1), env(n, 0.001, 0.16, 6));
  const click = noise(sec(0.006));
  for (let i = 0; i < click.length; i++) x[i] += click[i] * 0.7;
  return x;
};

const thud = (dur = 0.5) => {
  const n = sec(dur);
  const x = mul(sine(n, 160, 42), env(n, 0.002, 0.3, 4));
  return add(x, mul(lowpass(noise(n), 220), env(n, 0.001, 0.12, 8)), 0.6);
};

const ding = (dur = 1.1, f = 1180) => {
  const n = sec(dur);
  const x = mul(sine(n, f), env(n, 0.001, 0.8, 2.2));
  add(x, mul(sine(n, f * 2.02), env(n, 0.001, 0.5, 3)), 0.4);
  return add(x, mul(sine(n, f * 3.01), env(n, 0.001, 0.3, 4)), 0.18);
};

/** tiếng máy đếm tiền / xu rơi: nhiều tiếng lách cách lệch pha */
const cash = (dur = 0.7) => {
  const n = sec(dur);
  const x = zeros(n);
  const r = rng(7);
  for (let k = 0; k < 9; k++) {
    const start = sec(r() * 0.55);
    const ln = sec(0.09);
    if (start + ln > n) continue;
    const f = 1400 + r() * 1800;
    const seg = mul(mul(sine(ln, f, f * 0.7), env(ln, 0.001, 0.09, 7)), 0.4 + r() * 0.6);
    for (let i = 0; i < ln; i++) x[start + i] += seg[i];
  }
  return x;
};

/** tiếng xì hơi — dùng cho cảnh tiền mất giá */
const deflate = (dur = 1.0) => {
  const n = sec(dur);
  const x = mul(sweepLowpass(noise(n), 4200, 700), env(n, 0.03, 0.75, 1.7));
  for (let i = 0; i < n; i++) x[i] *= 1 + 0.35 * Math.sin((42 * i) / (n - 1));
  return x;
};

const inflate = (dur = 0.85) => mul(sweepLowpass(noise(sec(dur)), 500, 3400), env(sec(dur), 0.08, 0.9, 1.1));

const boom = (dur = 1.4) => {
  const n = sec(dur);
  const x = mul(sine(n, 110, 28), env(n, 0.001, 0.45, 2.6));
  return add(x, mul(lowpass(noise(n), 500), env(n, 0.001, 0.28, 3.4)), 0.8);
};

/** tiếng dâng trước cú chốt */
const riser = (dur = 1.6) => {
  const n = sec(dur);
  const x = sweepLowpass(noise(n), 400, 9000);
  add(x, sine(n, 220, 1400), 0.35);
  for (let i = 0; i < n; i++) x[i] *= (i / (n - 1)) ** 2.2;
  return x;
};

const typewriter = (dur = 0.07) => mul(noise(sec(dur)), env(sec(dur), 0.001, 0.05, 10));

// ── bộ tiếng meme kinh điển ──────────────────────────────────────────────────
// Tổng hợp từ dao động cơ bản thay vì tải về: Pixabay chặn tải bằng script (403
// Cloudflare) và API của họ không có audio. Tự dựng thì không dính bản quyền của ai.

const vineBoom = (dur = 1.8) => {
  const n = sec(dur);
  const x = mul(sine(n, 92, 24), env(n, 0.001, 0.5, 2.0));
  add(x, mul(sine(n, 46, 18), env(n, 0.001, 0.7, 1.4)), 0.9);
  return add(x, mul(lowpass(noise(n), 260), env(n, 0.001, 0.2, 5)), 0.5);
};

/** còi hơi: ba tầng hài âm lệch nhau một chút cho dày tiếng */
const airhorn = (dur = 1.5) => {
  const n = sec(dur);
  const x = zeros(n);
  const wob = (i) => 1 + 0.012 * Math.sin(2 * Math.PI * 5.5 * (i / (n - 1)));
  for (const [h, w] of [[1, 1.0], [2, 0.55], [3, 0.35], [4, 0.2], [5, 0.12]]) {
    add(x, sq(n, (i) => 415 * h * wob(i)), w);
  }
  const y = lowpass(x, 3400);
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    y[i] *= Math.min(1, t / 0.05) * Math.min(1, (1 - t) / 0.25);
  }
  return y;
};

/** kèn hụt: bốn nốt trượt xuống, nốt cuối rơi hẳn */
const sadTrombone = (dur = 2.4) => {
  const n = sec(dur);
  const x = zeros(n);
  for (const [f0, f1, start, ln] of [[233, 220, 0.0, 0.42], [207, 196, 0.42, 0.38], [185, 175, 0.8, 0.38], [165, 110, 1.2, 1.1]]) {
    const a = sec(start);
    const m = Math.min(sec(ln), n - a);
    const seg = zeros(m);
    for (const [h, w] of [[1, 1.0], [2, 0.5], [3, 0.3], [4, 0.16], [5, 0.08]]) add(seg, sine(m, f0 * h, f1 * h), w);
    // rung nhẹ như môi người thổi
    for (let i = 0; i < m; i++) seg[i] *= 1 + 0.06 * Math.sin((34 * i) / (m - 1));
    mul(seg, env(m, 0.02, 0.5, 1.6));
    for (let i = 0; i < m; i++) x[a + i] += seg[i];
  }
  return lowpass(x, 2600);
};

/** kim đĩa cào: tiếng rít quét nhanh, tắt đột ngột */
const recordScratch = (dur = 0.75) => {
  const n = sec(dur);
  const x = zeros(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    ph += (2 * Math.PI * (900 * Math.exp(-2.6 * t) + 140)) / SR;
    x[i] = Math.sin(ph) + 0.55 * Math.sin(2 * ph);
  }
  add(x, sweepLowpass(noise(n), 2600, 500), 0.8);
  for (let i = 0; i < n; i++) x[i] *= 1 + 0.4 * Math.sin(2 * Math.PI * 13 * (i / (n - 1)));
  return mul(x, env(n, 0.004, 0.35, 3.0));
};

/** trống chốt câu đùa: hai nhịp trống rồi một cú chũm choẹ */
const rimshot = (dur = 1.3) => {
  const n = sec(dur);
  const x = zeros(n);
  for (const start of [0.0, 0.17]) {
    const a = sec(start);
    const m = sec(0.14);
    const seg = mul(sine(m, 320, 150), env(m, 0.001, 0.1, 8));
    add(seg, mul(noise(m), env(m, 0.001, 0.05, 12)), 0.5);
    for (let i = 0; i < m; i++) x[a + i] += seg[i];
  }
  const a = sec(0.34);
  const m = n - a;
  const cym = mul(lowpass(noise(m), 9000), env(m, 0.001, 0.8, 1.6));
  for (let i = 0; i < m; i++) x[a + i] += cym[i] * 0.75;
  return x;
};

/** trống dồn trước khi công bố */
const drumroll = (dur = 1.6) => {
  const n = sec(dur);
  const x = zeros(n);
  const r = rng(11);
  let t = 0;
  while (t < dur - 0.05) {
    const a = sec(t);
    const m = sec(0.035);
    if (a + m > n) break;
    const seg = mul(sine(m, 210, 130), 0.6);
    add(seg, noise(m), 0.4);
    mul(seg, env(m, 0.001, 0.03, 12));
    for (let i = 0; i < m; i++) x[a + i] += seg[i];
    t += 0.055 - 0.028 * (t / dur) + (r() * 0.008 - 0.004);
  }
  for (let i = 0; i < n; i++) x[i] *= (0.35 + (0.65 * i) / (n - 1)) ** 1.5;
  return x;
};

/** tiếng báo sai kiểu game show */
const errorBuzz = (dur = 0.7) => {
  const n = sec(dur);
  const x = zeros(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    x[i] = Math.sign(Math.sin(2 * Math.PI * 118 * t)) + 0.6 * Math.sign(Math.sin(2 * Math.PI * 92 * t));
  }
  return mul(lowpass(x, 1700), env(n, 0.004, 0.55, 1.4));
};

/** tiếng báo đúng: hai nốt đi lên */
const correctDing = (dur = 1.4) => {
  const n = sec(dur);
  const x = zeros(n);
  for (const [f, start] of [[880, 0.0], [1320, 0.14]]) {
    const a = sec(start);
    const m = n - a;
    const seg = mul(sine(m, f), env(m, 0.002, 0.55, 2.4));
    add(seg, mul(sine(m, f * 2), env(m, 0.002, 0.3, 3.4)), 0.3);
    for (let i = 0; i < m; i++) x[a + i] += seg[i];
  }
  return x;
};

/** nảy lò xo */
const boing = (dur = 0.9) => {
  const n = sec(dur);
  const x = zeros(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const f = (380 * Math.exp(-3.4 * t) + 95) * (1 + 0.55 * Math.sin(2 * Math.PI * 7.5 * t) * Math.exp(-2.6 * t));
    ph += (2 * Math.PI * f) / SR;
    x[i] = Math.sin(ph);
  }
  return mul(x, env(n, 0.002, 0.4, 2.6));
};

const whistle = (dur, f0, f1) => {
  const n = sec(dur);
  const x = sine(n, f0, f1);
  add(x, lowpass(noise(n), 5200), 0.16);
  return mul(x, env(n, 0.03, 0.7, 1.5));
};

/** dây đàn căng dần trước cú chốt */
const suspense = (dur = 2.6) => {
  const n = sec(dur);
  const x = zeros(n);
  for (const f of [55, 82.5, 110, 164.8]) {
    let ph = 0;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      ph += (2 * Math.PI * f * (1 + 0.02 * t)) / SR;
      x[i] += Math.sin(ph) * (0.6 + 0.4 * t);
    }
  }
  add(x, sweepLowpass(noise(n), 300, 5200), 0.35);
  for (let i = 0; i < n; i++) x[i] *= (i / (n - 1)) ** 1.6;
  return x;
};

/** ống kim loại rơi: các hài âm không hoà, ngân dài */
const pipeClang = (dur = 1.5) => {
  const n = sec(dur);
  const x = zeros(n);
  for (const [f, w, d] of [[196, 1.0, 1.6], [417, 0.7, 2.1], [713, 0.5, 2.8], [1042, 0.32, 3.6], [1587, 0.2, 4.6]]) {
    add(x, mul(sine(n, f, f * 0.985), env(n, 0.0005, 0.9, d)), w);
  }
  // cú gõ đầu chỉ dài 20ms nên chỉ cộng vào lát đầu
  const m = sec(0.02);
  const hit = lowpass(noise(m), 6000);
  for (let i = 0; i < m; i++) x[i] += hit[i] * 0.5;
  return x;
};

const quack = (dur = 0.34) => {
  const n = sec(dur);
  const x = zeros(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    ph += (2 * Math.PI * (300 * (1 + 0.45 * Math.sin(2 * Math.PI * 3 * t)))) / SR;
    x[i] = (Math.sin(ph) >= 0 ? 1 : -1) * 0.7 + Math.sin(2 * ph) * 0.3;
  }
  return mul(lowpass(x, 2400), env(n, 0.008, 0.25, 3.5));
};

/** ngăn kéo tiền bật ra: chuông cộng tiếng lạch cạch */
const cashRegister = (dur = 1.2) => {
  const n = sec(dur);
  const x = mul(sine(n, 1760), env(n, 0.001, 0.5, 3.0));
  add(x, mul(sine(n, 2640), env(n, 0.001, 0.35, 4.0)), 0.45);
  const a = sec(0.22);
  const m = sec(0.3);
  const rat = mul(lowpass(noise(m), 1900), env(m, 0.002, 0.22, 5));
  for (let i = 0; i < m; i++) x[a + i] += rat[i] * 0.7;
  return x;
};

const whooshLong = (dur = 0.9) => mul(sweepLowpass(noise(sec(dur)), 220, 8000), env(sec(dur), 0.12, 0.85, 1.3));

// ── sinh cả bộ ───────────────────────────────────────────────────────────────
mkdirSync(OUT, {recursive: true});
R = rng(3);
save('whoosh-up', whoosh(0.34, true));
save('whoosh-down', whoosh(0.34, false));
save('whoosh-short', whoosh(0.2, true));
save('pop', pop());
save('pop-high', pop(0.13, 1500, 320));
save('thud', thud());
save('ding', ding());
save('cash', cash());
save('deflate', deflate());
save('inflate', inflate());
save('boom', boom());
save('riser', riser());
save('tick', typewriter());

save('vine-boom', vineBoom());
save('airhorn', airhorn());
save('sad-trombone', sadTrombone());
save('record-scratch', recordScratch());
save('rimshot', rimshot());
save('drumroll', drumroll());
save('error-buzz', errorBuzz());
save('correct-ding', correctDing());
save('boing', boing());
save('whistle-up', whistle(0.85, 620, 2100));
save('whistle-down', whistle(0.85, 2100, 560));
save('suspense', suspense());
save('pipe-clang', pipeClang());
save('quack', quack());
save('cash-register', cashRegister());
save('whoosh-long', whooshLong());

console.log(`\n-> ${OUT}`);
