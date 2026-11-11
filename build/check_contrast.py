#!/usr/bin/env python3
"""
모든 팔레트의 문법 색이 WCAG AA(4.5:1)를 넘는지 검사. 하나라도 미달이면 exit 1.
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


failed = False
for p, _ in PALETTES:
    worst = min((ratio(p[k], p[b]), k, b) for k in KEYS for b in BGS)
    btn = ratio(p["accent_fg"], p["accent"])
    ok = worst[0] >= 4.5 and btn >= 4.5
    failed |= not ok
    print(f"{'OK  ' if ok else 'FAIL'} {p['name']:<26} worst {worst[0]:.2f} ({worst[1]} on {worst[2]})  button {btn:.2f}")
sys.exit(1 if failed else 0)
