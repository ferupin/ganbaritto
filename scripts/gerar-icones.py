"""
Gera favicon.ico (16, 32 e 48 px), apple-icon.png (180) e icone-192/512.png a partir de
src/app/icon.svg. Rode depois de scripts/gerar-logo.py, quando o ícone mudar.

  pip install pillow playwright   (o Chromium do Playwright precisa estar instalado)
  python scripts/gerar-icones.py
"""
import os, struct, tempfile
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
svg = open(os.path.join(ROOT, "src", "app", "icon.svg"), encoding="utf-8").read()
tmp = tempfile.mkdtemp()


def render(page, size):
    page.set_viewport_size({"width": size, "height": size})
    page.set_content(f'<body style="margin:0;background:transparent">{svg.replace("<svg ", f"<svg width=\"{size}\" height=\"{size}\" ", 1)}</body>')
    path = os.path.join(tmp, f"{size}.png")
    page.screenshot(path=path, omit_background=True)
    return open(path, "rb").read()


with sync_playwright() as p:
    b = p.chromium.launch()
    page = b.new_page()
    png = {s: render(page, s) for s in (16, 32, 48, 180, 192, 512)}
    b.close()

sizes = [16, 32, 48]
head = struct.pack("<HHH", 0, 1, len(sizes))
off, entries = 6 + 16 * len(sizes), b""
for s in sizes:
    entries += struct.pack("<BBBBHHII", s, s, 0, 0, 1, 32, len(png[s]), off)
    off += len(png[s])
open(os.path.join(ROOT, "src", "app", "favicon.ico"), "wb").write(head + entries + b"".join(png[s] for s in sizes))
open(os.path.join(ROOT, "src", "app", "apple-icon.png"), "wb").write(png[180])
os.makedirs(os.path.join(ROOT, "public", "brand"), exist_ok=True)
for s in (192, 512):
    open(os.path.join(ROOT, "public", "brand", f"icone-{s}.png"), "wb").write(png[s])
print("ok")
