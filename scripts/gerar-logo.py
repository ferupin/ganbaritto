"""
Gera os arquivos da marca (SVG com texto convertido em curvas) a partir das
fontes reais instaladas pelo npm:
  - Plus Jakarta Sans 800 (nome)    @fontsource/plus-jakarta-sans
  - Noto Sans JP 700 (頑張って)       @fontsource/noto-sans-jp

Uso (na raiz do projeto, depois de `npm i --no-save @fontsource/noto-sans-jp`):
  pip install fonttools brotli uharfbuzz
  python scripts/gerar-logo.py

Escreve public/brand/*.svg e src/brand/logo-paths.ts. Os arquivos gerados são
versionados; este script só precisa rodar quando o desenho mudar.
"""
import json, os, re, sys
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NM = os.path.join(ROOT, "node_modules", "@fontsource")
LATIN = os.path.join(NM, "plus-jakarta-sans", "files", "plus-jakarta-sans-latin-800-normal.woff2")
JP = {  # fatia do Noto Sans JP que contém cada caractere (conferido no 700.css)
    "頑": "noto-sans-jp-98-700-normal.woff2",
    "張": "noto-sans-jp-109-700-normal.woff2",
    "っ": "noto-sans-jp-119-700-normal.woff2",
    "て": "noto-sans-jp-119-700-normal.woff2",
}

NORI, CORAL, ARROZ, NORI_DARK = "#263B50", "#E8754F", "#F4EBDD", "#172330"


def fmt(n):
    return f"{n:.1f}".rstrip("0").rstrip(".")


def glyph_path(font, gname, scale, x, y):
    """Caminho SVG de um glifo, com origem (x, y) na linha de base. y cresce para baixo."""
    gs = font.getGlyphSet()
    pen = SVGPathPen(gs, ntos=fmt)
    gs[gname].draw(TransformPen(pen, (scale, 0, 0, -scale, x, y)))
    return pen.getCommands()


# ---- nome em caixa alta, com kerning do HarfBuzz
# HarfBuzz não lê woff2: converte para ttf em memória só para modelar o texto.
import io
tt = TTFont(LATIN)
_buf = io.BytesIO()
_conv = TTFont(LATIN)
_conv.flavor = None
_conv.save(_buf)
face = hb.Face(hb.Blob(_buf.getvalue()))
hbfont = hb.Font(face)
upem = face.upem
cap = tt["OS/2"].sCapHeight
TEXT = "GANBARITTO"
buf = hb.Buffer()
buf.add_str(TEXT)
buf.guess_segment_properties()
hb.shape(hbfont, buf, {"kern": True})
order = tt.getGlyphOrder()

CAP_H = 100.0  # altura das maiúsculas na arte, em unidades do SVG
s = CAP_H / cap
TRACK = 0.012 * upem  # respiro leve entre letras
x = 0.0
word_paths, o_box = [], None
for i, (info, pos) in enumerate(zip(buf.glyph_infos, buf.glyph_positions)):
    gname = order[info.codepoint]
    ch = TEXT[i]
    x_px = x * s
    d = glyph_path(tt, gname, s, x_px, 0)
    if i == len(TEXT) - 1:  # o último O vira a bolha marcada
        gs = tt.getGlyphSet()
        from fontTools.pens.boundsPen import BoundsPen
        bp = BoundsPen(gs)
        gs[gname].draw(bp)
        xmin, ymin, xmax, ymax = bp.bounds
        o_box = (x_px + xmin * s, -ymax * s, x_px + xmax * s, -ymin * s)
    word_paths.append(d)
    x += pos.x_advance + (TRACK if i < len(TEXT) - 1 else 0)
word_w = x * s - 0
o_cx, o_cy = (o_box[0] + o_box[2]) / 2, (o_box[1] + o_box[3]) / 2
o_r = (o_box[2] - o_box[0]) / 2
# raio do furo do O ~ 0,56 do raio externo (traço ExtraBold); a bolha ocupa quase todo o furo
dot_r = o_r * 0.50

# ---- kanji, alinhado à esquerda sob o nome
KSIZE = 50.0
fonts, kx, kanji_paths = {}, 0.0, []
for ch in "頑張って":
    f = fonts.setdefault(JP[ch], TTFont(os.path.join(NM, "noto-sans-jp", "files", JP[ch])))
    cmap = f.getBestCmap()
    g = cmap[ord(ch)]
    ks = KSIZE / f["head"].unitsPerEm
    kanji_paths.append(glyph_path(f, g, ks, kx, 0))
    kx += f["hmtx"][g][0] * ks
kanji_w = kx
GAP = 40.0  # distância entre a base do nome e o topo do kanji
kanji_y = CAP_H + GAP + KSIZE * 0.86  # linha de base do kanji

W = word_w
H_word = CAP_H
H_full = kanji_y + KSIZE * 0.14


def svg(w, h, body, vb=None):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb or f"0 0 {fmt(w)} {fmt(h)}"}" width="{fmt(w)}" height="{fmt(h)}" role="img" aria-label="Ganbaritto">{body}</svg>\n'


def word_group(fill, dot, with_dot=True):
    # o último caminho (O) é desenhado como anel; a bolha marcada entra por cima
    g = f'<g fill="{fill}">' + "".join(f'<path d="{d}"/>' for d in word_paths) + "</g>"
    if with_dot:
        g += f'<circle cx="{fmt(o_cx)}" cy="{fmt(o_cy)}" r="{fmt(dot_r)}" fill="{dot}"/>'
    return g


def kanji_group(fill):
    return f'<g fill="{fill}" transform="translate(0 {fmt(kanji_y)})">' + "".join(f'<path d="{d}"/>' for d in kanji_paths) + "</g>"


PAD = 8
def padded(inner, w, h):
    return svg(w + 2 * PAD, h + 2 * PAD, f'<g transform="translate({PAD} {PAD})">{inner}</g>')

def shift_y(inner_h):
    return inner_h

out_dir = os.path.join(ROOT, "public", "brand")
os.makedirs(out_dir, exist_ok=True)
# o desenho do nome tem a linha de base em y=0 e sobe; deslocamos para y=CAP_H
def based(inner):
    return f'<g transform="translate(0 {fmt(CAP_H)})">{inner}</g>'

def wm(fill, dot):
    return padded(based(word_group(fill, dot)), W, H_word)

def full(fill, dot):
    # kanji_y já está em coordenadas do topo; o nome desce CAP_H
    return padded(based(word_group(fill, dot)) + kanji_group(fill).replace(f'translate(0 {fmt(kanji_y)})', f'translate(0 {fmt(kanji_y)})'), W, H_full)

files = {
    "ganbaritto-nome.svg": wm(NORI, CORAL),
    "ganbaritto-nome-escuro.svg": wm(ARROZ, CORAL),
    "ganbaritto-assinatura.svg": full(NORI, CORAL),
    "ganbaritto-assinatura-escuro.svg": full(ARROZ, CORAL),
}
for name, content in files.items():
    open(os.path.join(out_dir, name), "w", encoding="utf-8").write(content)

# ícone: a bolha marcada (O do nome) sobre Nori
icon = (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
    f'<rect width="64" height="64" rx="14" fill="{NORI}"/>'
    f'<circle cx="32" cy="32" r="17" fill="none" stroke="{ARROZ}" stroke-width="6"/>'
    f'<circle cx="32" cy="32" r="8.5" fill="{CORAL}"/></svg>\n'
)
open(os.path.join(ROOT, "src", "app", "icon.svg"), "w", encoding="utf-8").write(icon)

# caminhos para o componente React (cores via currentColor e variável)
ts = "// GERADO por scripts/gerar-logo.py. Não edite à mão.\n"
ts += f"export const logo = {{\n  nomeLargura: {fmt(W)},\n  nomeAltura: {fmt(H_word)},\n  assinaturaAltura: {fmt(H_full)},\n"
ts += f"  bolha: {{ cx: {fmt(o_cx)}, cy: {fmt(o_cy)}, r: {fmt(dot_r)} }},\n"
ts += "  letras: " + json.dumps(word_paths, ensure_ascii=False) + ",\n"
ts += f"  kanjiY: {fmt(kanji_y)},\n  kanji: " + json.dumps(kanji_paths, ensure_ascii=False) + ",\n} as const;\n"
os.makedirs(os.path.join(ROOT, "src", "brand"), exist_ok=True)
open(os.path.join(ROOT, "src", "brand", "logo-paths.ts"), "w", encoding="utf-8").write(ts)
print("ok", fmt(W), fmt(H_word), fmt(H_full), "O:", fmt(o_cx), fmt(o_cy), fmt(o_r))
