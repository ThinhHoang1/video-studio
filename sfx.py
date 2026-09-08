#!/usr/bin/env python3
"""Tự tổng hợp bộ hiệu ứng âm thanh cho video.

Không tải SFX từ đâu cả — mỗi tiếng dựng từ dao động cơ bản nên không dính
bản quyền, và chỉnh được chính xác theo nhịp cắt của video.
"""
import numpy as np
import wave
import os

SR = 48000
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "sfx")


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
    print(f"\n-> {OUT}")
