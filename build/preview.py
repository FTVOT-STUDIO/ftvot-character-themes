#!/usr/bin/env python3
"""
테마 미리보기 PNG 생성. VS Code 없이 팔레트 감을 보는 용도.
실제 토크나이저가 아니라 손으로 토큰을 지정한 샘플이다.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from generate import PALETTES

ROOT = Path(__file__).resolve().parent.parent
FONT = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 15)
FONT_I = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Oblique.ttf", 15)
LH, CW = 22, 9

# (텍스트, 팔레트 키, 이탤릭 여부)
SAMPLE = [
    [("using", "keyword"), (" UnityEngine", "namespace"), (";", "punct")],
    [],
    [("// Click the whale, earn coins", "comment", True)],
    [("[", "punct"), ("RequireComponent", "decorator"), ("(", "punct"), ("typeof", "keyword"), ("(", "punct"), ("Collider2D", "class"), ("))]", "punct")],
    [("public", "storage"), (" ", "fg"), ("class", "storage"), (" ", "fg"), ("WhaleClicker", "class"), (" : ", "operator"), ("MonoBehaviour", "class")],
    [("{", "punct")],
    [("    ", "fg"), ("private", "storage"), (" ", "fg"), ("const", "storage"), (" ", "fg"), ("float", "type"), (" ", "fg"), ("Cooldown", "constant"), (" = ", "operator"), ("0.15f", "number"), (";", "punct")],
    [("    ", "fg"), ("[", "punct"), ("SerializeField", "decorator"), ("] ", "punct"), ("private", "storage"), (" ", "fg"), ("int", "type"), (" ", "fg"), ("reward", "property"), (" = ", "operator"), ("10", "number"), (";", "punct")],
    [],
    [("    ", "fg"), ("public", "storage"), (" ", "fg"), ("void", "type"), (" ", "fg"), ("OnClick", "function"), ("(", "punct"), ("Vector2", "class"), (" ", "fg"), ("pos", "param", True), (")", "punct")],
    [("    {", "punct")],
    [("        ", "fg"), ("if", "keyword"), (" (", "punct"), ("Time", "class"), (".", "operator"), ("time", "property"), (" < ", "operator"), ("_next", "variable"), (") ", "punct"), ("return", "keyword"), (";", "punct")],
    [("        ", "fg"), ("var", "storage"), (" ", "fg"), ("msg", "variable"), (" = ", "operator"), ('$"', "string"), ("{", "escape"), ("reward", "property"), ("}", "escape"), (" coins", "string"), ("\\n", "escape"), ('"', "string"), (";", "punct")],
    [("        ", "fg"), ("UIManager", "class"), (".", "operator"), ("Instance", "property"), (".", "operator"), ("ShowToast", "function"), ("(", "punct"), ("msg", "variable"), (", ", "punct"), ("true", "constant"), (");", "punct")],
    [("    }", "punct")],
    [("}", "punct")],
]


def render(p: dict, path: Path) -> None:
    w, h = 820, 70 + LH * len(SAMPLE) + 40
    img = Image.new("RGB", (w, h), p["bg2"])
    d = ImageDraw.Draw(img)
    # 액티비티바, 사이드바, 탭바
    d.rectangle([0, 0, 44, h], fill=p["bg0"])
    d.rectangle([44, 0, 46, h], fill=p["line"])
    d.rectangle([46, 0, w, 36], fill=p["bg1"])
    d.rectangle([46, 36, w, 37], fill=p["line"])
    d.rectangle([46, 0, 230, 36], fill=p["bg2"])
    d.rectangle([46, 0, 230, 2], fill=p["accent"])
    d.text((62, 9), "WhaleClicker.cs", font=FONT, fill=p["fg"])
    d.text((250, 9), "UIManager.cs", font=FONT, fill=p["fg3"])
    d.rectangle([12, 14, 32, 34], outline=p["accent"], width=2)
    # 현재 줄 강조
    cur = 12
    y0 = 52
    d.rectangle([46, y0 + LH * cur - 2, w, y0 + LH * (cur + 1) - 2], fill=p["bg3"])
    for i, line in enumerate(SAMPLE):
        y = y0 + LH * i
        d.text((60, y), f"{i + 1:>2}", font=FONT, fill=p["accent"] if i == cur else p["fg3"])
        x = 104
        for tok in line:
            text, key = tok[0], tok[1]
            ital = len(tok) > 2
            d.text((x, y), text, font=FONT_I if ital else FONT, fill=p[key])
            x += CW * len(text)
    # 커서
    d.rectangle([104 + CW * 46, y0 + LH * cur, 105 + CW * 46, y0 + LH * cur + 17], fill=p["accent"])
    # 상태바
    d.rectangle([0, h - 26, w, h], fill=p["bg0"])
    d.rectangle([0, h - 27, w, h - 26], fill=p["line"])
    d.text((14, h - 22), "main  0 errors  1 warning", font=FONT, fill=p["fg2"])
    d.text((w - 200, h - 22), "C#  UTF-8  Ln 13", font=FONT, fill=p["fg2"])
    img.save(path)


if __name__ == "__main__":
    out = ROOT / "preview"
    out.mkdir(exist_ok=True)
    for pal, fname in PALETTES:
        # pore-snow-dark-color-theme.json -> snow-dark.png
        name = fname.replace("pore-", "").replace("-color-theme.json", "") + ".png"  # malkuth-dark.png 등
        render(pal, out / name)
        print(f"wrote preview/{name}")
