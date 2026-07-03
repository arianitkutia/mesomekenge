#!/usr/bin/env python3
"""
Compose polished App Store screenshots from raw simulator captures.

Usage:
  python compose.py            # frame every raw/*.png listed in captions.json
  python compose.py --demo     # generate a style preview (out/_demo.png)

Drop raw simulator screenshots into  store/screenshots/raw/  named to match
captions.json (01-cover.png, 02-home.png, ...). Output lands in  store/screenshots/out/
at the same resolution as the input, so iPhone shots stay iPhone-sized and iPad
shots stay iPad-sized — both App Store-ready.
"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, "raw")
OUT = os.path.join(HERE, "out")

FONT_CANDIDATES = [
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/Library/Fonts/Arial Bold.ttf",
    "/System/Library/Fonts/Supplemental/Helvetica.ttc",
    "/System/Library/Fonts/Helvetica.ttc",
]


def load_font(size):
    for p in FONT_CANDIDATES:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()


def hex_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def vgradient(w, h, c1, c2):
    top, bot = hex_rgb(c1), hex_rgb(c2)
    base = Image.new("RGB", (1, h))
    for y in range(h):
        t = y / max(1, h - 1)
        base.putpixel((0, y), tuple(int(top[i] + (bot[i] - top[i]) * t) for i in range(3)))
    return base.resize((w, h))


def rounded(img, rad):
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, img.size[0], img.size[1]], radius=rad, fill=255)
    out = img.convert("RGBA")
    out.putalpha(mask)
    return out


def wrap(draw, text, font, max_w):
    words, lines, cur = text.split(), [], ""
    for wd in words:
        trial = (cur + " " + wd).strip()
        if draw.textlength(trial, font=font) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = wd
    if cur:
        lines.append(cur)
    return lines


def compose(shot, caption, bg):
    W, H = shot.size
    canvas = vgradient(W, H, bg[0], bg[1]).convert("RGBA")
    draw = ImageDraw.Draw(canvas)

    # Caption
    font = load_font(int(W * 0.072))
    lines = wrap(draw, caption, font, int(W * 0.86))
    line_h = int(W * 0.072 * 1.2)
    y = int(H * 0.06)
    for ln in lines:
        tw = draw.textlength(ln, font=font)
        draw.text(((W - tw) / 2, y), ln, font=font, fill="#FFFFFF")
        y += line_h
    caption_bottom = y + int(H * 0.02)

    # Device screenshot: fit within remaining space
    target_w = int(W * 0.82)
    scale = target_w / shot.width
    dev_w, dev_h = target_w, int(shot.height * scale)
    max_h = H - caption_bottom - int(H * 0.05)
    if dev_h > max_h:
        scale = max_h / shot.height
        dev_w, dev_h = int(shot.width * scale), max_h
    device = rounded(shot.convert("RGB").resize((dev_w, dev_h)), int(dev_w * 0.055))

    dx = (W - dev_w) // 2
    dy = caption_bottom + (max_h - dev_h) // 2

    # Soft shadow
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    pad = int(W * 0.02)
    sd.rounded_rectangle([dx - pad, dy - pad, dx + dev_w + pad, dy + dev_h + pad],
                         radius=int(dev_w * 0.06), fill=(0, 0, 0, 90))
    shadow = shadow.filter(ImageFilter.GaussianBlur(int(W * 0.02)))
    canvas = Image.alpha_composite(canvas, shadow)

    canvas.paste(device, (dx, dy), device)
    return canvas.convert("RGB")


def make_demo():
    # Fake a phone screenshot (light card layout) so the frame style is visible.
    W, H = 1320, 2868
    shot = Image.new("RGB", (W, H), "#FBF6ED")
    d = ImageDraw.Draw(shot)
    d.rounded_rectangle([80, 300, W - 80, 760], radius=48, fill="#FF8E5E")
    f = load_font(70)
    d.text((130, 480), "Kenget", font=f, fill="#FFFFFF")
    for r in range(3):
        for c in range(2):
            x = 80 + c * (W // 2 - 40)
            yy = 860 + r * 560
            d.rounded_rectangle([x, yy, x + (W // 2 - 200), yy + 480], radius=40, fill="#FFFFFF")
            d.rounded_rectangle([x, yy, x + (W // 2 - 200), yy + 300], radius=40, fill="#3B86C9")
    os.makedirs(OUT, exist_ok=True)
    compose(shot, "36 këngë me ngjyra", ["#FF8E5E", "#EC6A8C"]).save(os.path.join(OUT, "_demo.png"))
    print("wrote out/_demo.png")


def main():
    if "--demo" in sys.argv:
        make_demo()
        return
    os.makedirs(OUT, exist_ok=True)
    specs = json.load(open(os.path.join(HERE, "captions.json")))
    made = 0
    for s in specs:
        src = os.path.join(RAW, s["file"])
        if not os.path.exists(src):
            print(f"  skip (no raw): {s['file']}")
            continue
        shot = Image.open(src)
        compose(shot, s["caption"], s["bg"]).save(os.path.join(OUT, s["file"]))
        print(f"  framed: {s['file']}")
        made += 1
    print(f"done — {made} screenshot(s) in out/")


if __name__ == "__main__":
    main()
