#!/usr/bin/env python3
"""Tự tổng hợp bộ hiệu ứng âm thanh cho video.

Không tải SFX từ đâu cả — mỗi tiếng dựng từ dao động cơ bản nên không dính
bản quyền, và chỉnh được chính xác theo nhịp cắt của video.
"""
import numpy as np
import wave
import os

SR = 48000
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "sfx")


def env(n, attack=0.005, decay=0.25, curve=3.0):
    """Bao biên độ: lên nhanh, tắt theo hàm mũ."""
    t = np.linspace(0, 1, n)
    a = np.clip(t / max(attack, 1e-6), 0, 1)
    d = np.exp(-curve * np.clip((t - attack) / max(decay, 1e-6), 0, None))
    return a * d


def noise(n):
    return np.random.uniform(-1, 1, n)


def lowpass(x, cutoff_hz, sr=SR):
    """Lọc thông thấp một cực — đủ để bẻ tiếng ồn trắng thành tiếng gió."""
    a = np.exp(-2 * np.pi * cutoff_hz / sr)
    y = np.zeros_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc = a * acc + (1 - a) * v
        y[i] = acc
    return y


def sweep_lowpass(x, f0, f1, sr=SR):
    """Lọc thông thấp có tần số cắt quét từ f0 tới f1 — lõi của tiếng whoosh."""
    n = len(x)
    cutoffs = np.geomspace(max(f0, 20), max(f1, 20), n)
    y = np.zeros_like(x)
    acc = 0.0
    for i in range(n):
        a = np.exp(-2 * np.pi * cutoffs[i] / sr)
        acc = a * acc + (1 - a) * x[i]
        y[i] = acc
    return y


def sine(n, f0, f1=None, sr=SR):
    f1 = f0 if f1 is None else f1
    t = np.arange(n) / sr
    freq = np.geomspace(f0, f1, n)
    phase = np.cumsum(2 * np.pi * freq / sr)
    return np.sin(phase)


def save(name, x, peak=0.85):
    x = np.asarray(x, dtype=np.float64)
    m = np.max(np.abs(x))
    if m > 0:
        x = x / m * peak
    # fade 3ms hai đầu để không bị "cụp"
    f = int(0.003 * SR)
    if len(x) > 2 * f:
        x[:f] *= np.linspace(0, 1, f)
        x[-f:] *= np.linspace(1, 0, f)
    data = (x * 32767).astype(np.int16)
    path = os.path.join(OUT, name + ".wav")
    with wave.open(path, "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())
    print(f"{name:14s} {len(x)/SR:.2f}s")


def whoosh(dur=0.34, up=True):
    n = int(dur * SR)
    x = noise(n)
    x = sweep_lowpass(x, 300, 6000) if up else sweep_lowpass(x, 6000, 300)
    return x * env(n, 0.02, 0.5, 2.4)


def pop(dur=0.16, f0=900, f1=140):
    n = int(dur * SR)
    body = sine(n, f0, f1)
    click = noise(int(0.006 * SR)) * 0.7
    x = body * env(n, 0.001, 0.16, 6)
    x[: len(click)] += click
    return x


def thud(dur=0.5):
    n = int(dur * SR)
    x = sine(n, 160, 42) * env(n, 0.002, 0.3, 4)
    x += lowpass(noise(n), 220) * env(n, 0.001, 0.12, 8) * 0.6
    return x


def ding(dur=1.1, f=1180):
    n = int(dur * SR)
    x = sine(n, f) * env(n, 0.001, 0.8, 2.2)
    x += sine(n, f * 2.02) * env(n, 0.001, 0.5, 3) * 0.4
    x += sine(n, f * 3.01) * env(n, 0.001, 0.3, 4) * 0.18
    return x


def cash(dur=0.7):
    """Tiếng máy đếm tiền / xu rơi: nhiều tiếng lách cách lệch pha."""
    n = int(dur * SR)
    x = np.zeros(n)
    rng = np.random.default_rng(7)
    for _ in range(9):
        start = int(rng.uniform(0, 0.55) * SR)
        ln = int(0.09 * SR)
        if start + ln > n:
            continue
        f = rng.uniform(1400, 3200)
        x[start : start + ln] += sine(ln, f, f * 0.7) * env(ln, 0.001, 0.09, 7) * rng.uniform(0.4, 1)
    return x


def deflate(dur=1.0):
    """Tiếng xì hơi — dùng cho cảnh tiền mất giá."""
    n = int(dur * SR)
    x = sweep_lowpass(noise(n), 4200, 700)
    wobble = 1 + 0.35 * np.sin(np.linspace(0, 42, n))
    return x * env(n, 0.03, 0.75, 1.7) * wobble


def inflate(dur=0.85):
    n = int(dur * SR)
    x = sweep_lowpass(noise(n), 500, 3400)
    return x * env(n, 0.08, 0.9, 1.1)


def boom(dur=1.4):
    n = int(dur * SR)
    x = sine(n, 110, 28) * env(n, 0.001, 0.45, 2.6)
    x += lowpass(noise(n), 500) * env(n, 0.001, 0.28, 3.4) * 0.8
    return x


def riser(dur=1.6):
    """Tiếng dâng trước cú chốt."""
    n = int(dur * SR)
    x = sweep_lowpass(noise(n), 400, 9000)
    x += sine(n, 220, 1400) * 0.35
    t = np.linspace(0, 1, n)
    return x * (t ** 2.2)


def typewriter(dur=0.07):
    n = int(dur * SR)
    return noise(n) * env(n, 0.001, 0.05, 10)



# ─────────────────────────────────────────────────────────────────────────
# Bộ tiếng meme kinh điển.
# Tổng hợp từ dao động cơ bản thay vì tải về: Pixabay chặn tải bằng script
# (403 Cloudflare) và API của họ không có audio. Tự dựng thì không dính bản
# quyền của ai, và chỉnh được đúng theo nhịp video.
# ─────────────────────────────────────────────────────────────────────────


def vine_boom(dur=1.8):
    """Tiếng 'BOOM' quen thuộc: cú đập trầm + đuôi ngân dài."""
    n = int(dur * SR)
    x = sine(n, 92, 24) * env(n, 0.001, 0.5, 2.0)
    x += sine(n, 46, 18) * env(n, 0.001, 0.7, 1.4) * 0.9
    x += lowpass(noise(n), 260) * env(n, 0.001, 0.2, 5) * 0.5
    return x


def airhorn(dur=1.5):
    """Còi hơi: ba tầng hài âm lệch nhau một chút cho dày tiếng."""
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    wobble = 1 + 0.012 * np.sin(2 * np.pi * 5.5 * t)
    x = np.zeros(n)
    for h, w in [(1, 1.0), (2, 0.55), (3, 0.35), (4, 0.2), (5, 0.12)]:
        f = 415 * h
        phase = np.cumsum(2 * np.pi * f * wobble / SR)
        x += np.sign(np.sin(phase)) * w
    lentay = np.clip(t / 0.05, 0, 1) * np.clip((1 - t) / 0.25, 0, 1)
    return lowpass(x, 3400) * lentay


def sad_trombone(dur=2.4):
    """Kèn hụt: bốn nốt trượt xuống, nốt cuối rơi hẳn."""
    n = int(dur * SR)
    x = np.zeros(n)
    notes = [(233, 220, 0.00, 0.42), (207, 196, 0.42, 0.38),
             (185, 175, 0.80, 0.38), (165, 110, 1.20, 1.10)]
    for f0, f1, start, ln in notes:
        a = int(start * SR)
        m = int(ln * SR)
        if a + m > n:
            m = n - a
        seg = np.zeros(m)
        for h, w in [(1, 1.0), (2, 0.5), (3, 0.3), (4, 0.16), (5, 0.08)]:
            seg += sine(m, f0 * h, f1 * h) * w
        # rung nhẹ như môi người thổi
        seg *= 1 + 0.06 * np.sin(np.linspace(0, 34, m))
        x[a:a + m] += seg * env(m, 0.02, 0.5, 1.6)
    return lowpass(x, 2600)


def record_scratch(dur=0.75):
    """Kim đĩa cào: tiếng rít quét nhanh, tắt đột ngột."""
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    freq = 900 * np.exp(-2.6 * t) + 140
    phase = np.cumsum(2 * np.pi * freq / SR)
    x = np.sin(phase) + 0.55 * np.sin(2 * phase)
    x += sweep_lowpass(noise(n), 2600, 500) * 0.8
    x *= 1 + 0.4 * np.sin(2 * np.pi * 13 * t)
    return x * env(n, 0.004, 0.35, 3.0)


def rimshot(dur=1.3):
    """Trống chốt câu đùa: hai nhịp trống rồi một cú chũm choẹ."""
    n = int(dur * SR)
    x = np.zeros(n)
    for start in (0.0, 0.17):
        a = int(start * SR)
        m = int(0.14 * SR)
        seg = sine(m, 320, 150) * env(m, 0.001, 0.1, 8)
        seg += noise(m) * env(m, 0.001, 0.05, 12) * 0.5
        x[a:a + m] += seg
    a = int(0.34 * SR)
    m = n - a
    x[a:a + m] += lowpass(noise(m), 9000) * env(m, 0.001, 0.8, 1.6) * 0.75
    return x


def drumroll(dur=1.6):
    """Trống dồn trước khi công bố."""
    n = int(dur * SR)
    x = np.zeros(n)
    t = 0.0
    rng = np.random.default_rng(11)
    while t < dur - 0.05:
        a = int(t * SR)
        m = int(0.035 * SR)
        if a + m > n:
            break
        x[a:a + m] += (sine(m, 210, 130) * 0.6 + noise(m) * 0.4) * env(m, 0.001, 0.03, 12)
        t += 0.055 - 0.028 * (t / dur) + rng.uniform(-0.004, 0.004)
    manh = np.linspace(0.35, 1.0, n) ** 1.5
    return x * manh


def error_buzz(dur=0.7):
    """Tiếng báo sai kiểu game show."""
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    x = np.sign(np.sin(2 * np.pi * 118 * t)) + 0.6 * np.sign(np.sin(2 * np.pi * 92 * t))
    return lowpass(x, 1700) * env(n, 0.004, 0.55, 1.4)


def correct_ding(dur=1.4):
    """Tiếng báo đúng: hai nốt đi lên."""
    n = int(dur * SR)
    x = np.zeros(n)
    for f, start in ((880, 0.0), (1320, 0.14)):
        a = int(start * SR)
        m = n - a
        seg = sine(m, f) * env(m, 0.002, 0.55, 2.4)
        seg += sine(m, f * 2) * env(m, 0.002, 0.3, 3.4) * 0.3
        x[a:a + m] += seg
    return x


def boing(dur=0.9):
    """Nảy lò xo."""
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    freq = 380 * np.exp(-3.4 * t) + 95
    freq *= 1 + 0.55 * np.sin(2 * np.pi * 7.5 * t) * np.exp(-2.6 * t)
    phase = np.cumsum(2 * np.pi * freq / SR)
    return np.sin(phase) * env(n, 0.002, 0.4, 2.6)


def slide_whistle_up(dur=0.85):
    n = int(dur * SR)
    x = sine(n, 620, 2100)
    x += lowpass(noise(n), 5200) * 0.16
    return x * env(n, 0.03, 0.7, 1.5)


def slide_whistle_down(dur=0.85):
    n = int(dur * SR)
    x = sine(n, 2100, 560)
    x += lowpass(noise(n), 5200) * 0.16
    return x * env(n, 0.03, 0.7, 1.5)


def suspense(dur=2.6):
    """Dây đàn căng dần trước cú chốt."""
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    x = np.zeros(n)
    for f in (55, 82.5, 110, 164.8):
        phase = np.cumsum(2 * np.pi * f * (1 + 0.02 * t) / SR)
        x += np.sin(phase) * (0.6 + 0.4 * t)
    x += sweep_lowpass(noise(n), 300, 5200) * 0.35
    return x * (t ** 1.6)


def pipe_clang(dur=1.5):
    """Ống kim loại rơi: các hài âm không hoà, ngân dài."""
    n = int(dur * SR)
    x = np.zeros(n)
    for f, w, d in [(196, 1.0, 1.6), (417, 0.7, 2.1), (713, 0.5, 2.8),
                    (1042, 0.32, 3.6), (1587, 0.2, 4.6)]:
        x += sine(n, f, f * 0.985) * env(n, 0.0005, 0.9, d) * w
    # cú gõ đầu chỉ dài 20ms nên phải cộng vào lát đầu, không cộng cả mảng
    m = int(0.02 * SR)
    x[:m] += lowpass(noise(m), 6000) * 0.5
    return x


def quack(dur=0.34):
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    freq = 300 * (1 + 0.45 * np.sin(2 * np.pi * 3 * t))
    phase = np.cumsum(2 * np.pi * freq / SR)
    x = np.sign(np.sin(phase)) * 0.7 + np.sin(2 * phase) * 0.3
    return lowpass(x, 2400) * env(n, 0.008, 0.25, 3.5)


def cash_register(dur=1.2):
    """Ngăn kéo tiền bật ra: chuông cộng tiếng lạch cạch."""
    n = int(dur * SR)
    x = sine(n, 1760) * env(n, 0.001, 0.5, 3.0)
    x += sine(n, 2640) * env(n, 0.001, 0.35, 4.0) * 0.45
    a = int(0.22 * SR)
    m = int(0.3 * SR)
    x[a:a + m] += lowpass(noise(m), 1900) * env(m, 0.002, 0.22, 5) * 0.7
    return x


def whoosh_long(dur=0.9):
    n = int(dur * SR)
    x = sweep_lowpass(noise(n), 220, 8000)
    return x * env(n, 0.12, 0.85, 1.3)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    np.random.seed(3)
    save("whoosh-up", whoosh(0.34, True))
    save("whoosh-down", whoosh(0.34, False))
    save("whoosh-short", whoosh(0.2, True))
    save("pop", pop())
    save("pop-high", pop(0.13, 1500, 320))
    save("thud", thud())
    save("ding", ding())
    save("cash", cash())
    save("deflate", deflate())
    save("inflate", inflate())
    save("boom", boom())
    save("riser", riser())
    save("tick", typewriter())

    # bộ meme
    save("vine-boom", vine_boom())
    save("airhorn", airhorn())
    save("sad-trombone", sad_trombone())
    save("record-scratch", record_scratch())
    save("rimshot", rimshot())
    save("drumroll", drumroll())
    save("error-buzz", error_buzz())
    save("correct-ding", correct_ding())
    save("boing", boing())
    save("whistle-up", slide_whistle_up())
    save("whistle-down", slide_whistle_down())
    save("suspense", suspense())
    save("pipe-clang", pipe_clang())
    save("quack", quack())
    save("cash-register", cash_register())
    save("whoosh-long", whoosh_long())

    print(f"\n-> {OUT}")
