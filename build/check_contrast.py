#!/usr/bin/env python3
"""
모든 팔레트 검사. 하나라도 실패하면 exit 1.
- 하한: 문법 색이 WCAG AA(4.5:1) 이상인지 (bg1/bg2/bg3 전부)
- 상한: 에디터 배경(bg2) 대비 너무 밝지 않은지. 다크 테마에서 15:1 근처 흰 글씨는
  장시간 보면 번짐(halation)이 생긴다. 본문 11:1, 문법 색 9.5:1을 넘으면 실패.
  라이트 테마는 배경 밝기가 눈부심의 원인이라 배경 휘도 상한(0.82)으로 따로 본다.
색 하나 바꿀 때마다 눈대중으로 판단하지 말고 이걸 돌릴 것.
"""
import sys
from generate import PALETTES

KEYS = ["fg", "fg2", "fg3", "comment", "keyword", "storage", "string", "escape", "number", "constant", "function", "type", "class", "param", "property", "operator", "punct", "namespace", "decorator", "error", "warning", "info", "added", "accent"]
BGS = ["bg1", "bg2", "bg3"]


def lum(h: str) -> float:
    h = h.lstrip("#")[:6]
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    c = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def ratio(a: str, b: str) -> float:
    la, lb = lum(a), lum(b)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)


MAX_TEXT = 11.0     # 본문(fg) 상한, 다크 전용
MAX_SYNTAX = 9.5    # 문법 색 상한, 다크 전용
MAX_LIGHT_BG = 0.82 # 라이트 에디터 배경 휘도 상한 (순백 = 1.0)

failed = False
for p, _ in PALETTES:
    worst = min((ratio(p[k], p[b]), k, b) for k in KEYS for b in BGS)
    btn = ratio(p["accent_fg"], p["accent"])
    problems = []
    if worst[0] < 4.5:
        problems.append(f"too dim: {worst[1]} on {worst[2]} {worst[0]:.2f}")
    if btn < 4.5:
        problems.append(f"button {btn:.2f}")
    if p["mode"] == "dark":
        text = ratio(p["fg"], p["bg2"])
        hot = max((ratio(p[k], p["bg2"]), k) for k in KEYS if k not in ("fg", "variable"))
        if text > MAX_TEXT:
            problems.append(f"fg too bright {text:.2f}")
        if hot[0] > MAX_SYNTAX:
            problems.append(f"{hot[1]} too bright {hot[0]:.2f}")
        extra = f"fg {text:.2f}  brightest {hot[1]} {hot[0]:.2f}"
    else:
        bgl = lum(p["bg2"])
        if bgl > MAX_LIGHT_BG:
            problems.append(f"bg too bright {bgl:.2f}")
        extra = f"bg luminance {bgl:.2f}"
    failed |= bool(problems)
    status = "OK  " if not problems else "FAIL"
    print(f"{status} {p['name']:<18} worst {worst[0]:.2f} ({worst[1]} on {worst[2]})  {extra}  {'; '.join(problems)}")
sys.exit(1 if failed else 0)
