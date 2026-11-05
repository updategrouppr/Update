#!/usr/bin/env python3
"""Genera el website publicado en _site/ a partir de las páginas bilingües.

Las páginas fuente (index.html, services.html) tienen los dos idiomas a la vez:
cada texto va en <span class="en"> y <span class="es"> (o <i ...>). Este script
crea dos versiones por página, cada una con un solo idioma en el HTML:

  _site/index.html, _site/services.html        -> inglés
  _site/es/index.html, _site/es/services.html  -> español

Así Google indexa cada idioma en su propia URL. Lo corre GitHub Actions en
cada push a main (.github/workflows/deploy.yml). Solo usa la librería estándar.
"""
import re, shutil, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "_site"
SITE = "https://www.updategrouppr.com/"
PAGES = ["index.html", "services.html"]
SKIP = {".git", ".github", "_site", "tools", "README.md", ".gitignore", ".DS_Store"}

# Textos de SEO en español (los de inglés están en las páginas fuente).
ES_META = {
    "index.html": {
        "title": "Update Group | Agencia de Mercadeo Digital y AI en Puerto Rico",
        "desc": "Agencia de mercadeo digital en Puerto Rico: redes sociales, anuncios en Meta y Google, branding, websites y automatizaciones con inteligencia artificial.",
    },
    "services.html": {
        "title": "Servicios de Mercadeo Digital en Puerto Rico | Update Group",
        "desc": "Automatizaciones AI, manejo de redes sociales, anuncios en Meta y Google, diseño y branding y desarrollo web en Puerto Rico.",
    },
}
ES_IMG_ALT = "Avión de Update Group: Tu marca, en su próximo nivel"


def url_for(page, lang):
    path = "" if page == "index.html" else page
    return SITE + ("es/" if lang == "es" else "") + path


def strip_lang(html, lang):
    """Quita cada <span|i class="{lang}">…</span|i>, respetando etiquetas anidadas."""
    opener = re.compile(r'<(span|i) class="%s">' % lang)
    out, pos = [], 0
    while True:
        m = opener.search(html, pos)
        if not m:
            out.append(html[pos:])
            return "".join(out)
        tag = m.group(1)
        tok = re.compile(r"<%s\b[^>]*>|</%s>" % (tag, tag))
        depth, i = 1, m.end()
        while depth:
            t = tok.search(html, i)
            if not t:
                sys.exit(f'Etiqueta <{tag} class="{lang}"> sin cerrar cerca de: {html[m.start():m.start()+80]!r}')
            depth += -1 if t.group(0).startswith("</") else 1
            i = t.end()
        out.append(html[pos:m.start()])
        pos = i


def set_html_attrs(html, lang, alt, base=""):
    attrs = f'lang="{lang}" data-lang="{lang}" data-alt="{alt}"' + (f' data-base="{base}"' if base else "")
    html, n = re.subn(r"<html[^>]*>", f"<html {attrs}>", html, count=1)
    assert n == 1, "falta <html>"
    return html


def add_hreflang(html, page):
    links = (f'\n<link rel="alternate" hreflang="en" href="{url_for(page, "en")}">'
             f'\n<link rel="alternate" hreflang="es" href="{url_for(page, "es")}">'
             f'\n<link rel="alternate" hreflang="x-default" href="{url_for(page, "en")}">')
    html, n = re.subn(r'(<link rel="canonical" href="[^"]*">)', r"\1" + links, html, count=1)
    assert n == 1, "falta canonical"
    return html


def sub_attr(html, pattern, value):
    html, n = re.subn(pattern, lambda m: m.group(1) + value + m.group(2), html, count=1)
    assert n == 1, pattern
    return html


def to_spanish_meta(html, page):
    meta, url = ES_META[page], url_for(page, "es")
    html = sub_attr(html, r"(<title>)[^<]*(</title>)", meta["title"])
    html = sub_attr(html, r'(<meta name="description" content=")[^"]*(">)', meta["desc"])
    html = sub_attr(html, r'(<link rel="canonical" href=")[^"]*(">)', url)
    html = sub_attr(html, r'(<meta property="og:title" content=")[^"]*(">)', meta["title"])
    html = sub_attr(html, r'(<meta property="og:description" content=")[^"]*(">)', meta["desc"])
    html = sub_attr(html, r'(<meta property="og:url" content=")[^"]*(">)', url)
    html = sub_attr(html, r'(<meta property="og:image:alt" content=")[^"]*(">)', ES_IMG_ALT)
    html = sub_attr(html, r'(<meta property="og:locale" content=")[^"]*(">)', "es_PR")
    html = sub_attr(html, r'(<meta property="og:locale:alternate" content=")[^"]*(">)', "en_US")
    html = sub_attr(html, r'(<meta name="twitter:title" content=")[^"]*(">)', meta["title"])
    html = sub_attr(html, r'(<meta name="twitter:description" content=")[^"]*(">)', meta["desc"])
    # textos alternativos de imágenes que tienen versión en español
    html = re.sub(r'(<img\b[^>]*?)\balt="[^"]*"([^>]*\bdata-alt-es="([^"]*)")',
                  lambda m: f'{m.group(1)}alt="{m.group(3)}"{m.group(2)}', html)
    return html


def prefix_assets(html):
    """Las páginas en /es/ cargan imágenes, css y js desde la carpeta de arriba."""
    def fix(m):
        attr, val = m.group(1), m.group(2)
        if re.match(r"(https?:|mailto:|tel:|data:|#|/|\.\./)", val):
            return m.group(0)
        # Las páginas bilingües tienen copia en /es/; las demás (portal, propuesta, portafolio) solo arriba
        page = re.match(r"([^#?]*\.html)([#?].*)?$", val)
        if page and page.group(1) in PAGES:
            return m.group(0)
        return f'{attr}="../{val}"'
    return re.sub(r'\b(src|href)="([^"]+)"', fix, html)


def build():
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir()
    for item in ROOT.iterdir():
        if item.name in SKIP or item.name in PAGES:
            continue
        (shutil.copytree if item.is_dir() else shutil.copy2)(item, OUT / item.name)
    (OUT / "es").mkdir()
    for page in PAGES:
        src = (ROOT / page).read_text(encoding="utf-8")
        en_alt = "es/" if page == "index.html" else "es/" + page
        es_alt = "../" if page == "index.html" else "../" + page
        en = add_hreflang(set_html_attrs(strip_lang(src, "es"), "en", en_alt), page)
        es = strip_lang(src, "en")
        es = prefix_assets(add_hreflang(to_spanish_meta(set_html_attrs(es, "es", es_alt, "../"), page), page))
        for html, lang in ((en, "es"), (es, "en")):
            left = re.findall(r'class="%s"' % lang, html)
            assert not left, f"quedó texto en {lang} en {page}"
        (OUT / page).write_text(en, encoding="utf-8")
        (OUT / "es" / page).write_text(es, encoding="utf-8")
    rows = []
    for page in PAGES:
        alts = "".join(f'\n    <xhtml:link rel="alternate" hreflang="{h}" href="{url_for(page, l)}"/>'
                       for h, l in (("en", "en"), ("es", "es"), ("x-default", "en")))
        for lang in ("en", "es"):
            rows.append(f"  <url>\n    <loc>{url_for(page, lang)}</loc>{alts}\n  </url>")
    (OUT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
        + "\n".join(rows) + "\n</urlset>\n", encoding="utf-8")
    print("Sitio generado en", OUT)


if __name__ == "__main__":
    build()
