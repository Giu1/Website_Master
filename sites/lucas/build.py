"""Generator for this folder's *.html and js/lang.js. Run: python build.py

Every string lives once in S as (English, Portugal Portuguese). Pages are written
with the English text in place plus data-i18n keys, and js/i18n.js swaps in the
other language at runtime. Output is plain static files.
"""
import html
import json
from pathlib import Path

OUT = Path(__file__).resolve().parent

# ───────── strings ─────────
# Text keys are HTML (entities, <br>). Keys ending in ".attr" are plain text for attributes.

S = {
    # titles + meta (plain text: document.title / meta content)
    "title.home": ("Lucas Bastos • Freelance Designer & Developer", "Lucas Bastos • Designer & Programador freelancer"),
    "title.work": ("Work • Lucas Bastos", "Trabalho • Lucas Bastos"),
    "title.about": ("About • Lucas Bastos", "Sobre • Lucas Bastos"),
    "title.contact": ("Contact • Lucas Bastos", "Contacto • Lucas Bastos"),
    "desc.home": ("Lucas Bastos, freelance designer and developer in Lisbon.", "Lucas Bastos, designer e programador freelancer em Lisboa."),
    "desc.work": ("Selected projects by Lucas Bastos.", "Projetos selecionados de Lucas Bastos."),
    "desc.about": ("About Lucas Bastos, freelance designer and developer.", "Sobre Lucas Bastos, designer e programador freelancer."),
    "desc.contact": ("Start a project with Lucas Bastos.", "Comece um projeto com Lucas Bastos."),

    # chrome
    "skip": ("Skip to content", "Saltar para o conteúdo"),
    "nav.home": ("Home", "Início"),
    "nav.work": ("Work", "Trabalho"),
    "nav.about": ("About", "Sobre"),
    "nav.contact": ("Contact", "Contacto"),
    "navigation": ("Navigation", "Navegação"),
    "socials": ("Socials", "Redes sociais"),
    "language": ("Language", "Idioma"),
    "language.attr": ("Language", "Idioma"),
    "menu": ("Menu", "Menu"),
    "menu.open.attr": ("Open menu", "Abrir menu"),
    "menu.close.attr": ("Close menu", "Fechar menu"),
    "menu.main.attr": ("Main", "Principal"),
    "credit": ("Code by Lucas", "Código por Lucas"),
    "view": ("View", "Ver"),

    # home
    "photo": ("Photo", "Foto"),
    "photo.group.attr": ("Choose the hero photo", "Escolher a foto principal"),
    "hanger": ("Located<br />in<br />Portugal", "Baseado<br />em<br />Portugal"),
    "caption": ("Freelance<br />Designer &amp; Developer", "Freelancer<br />Designer &amp; Programador"),
    "h1.home": ("Lucas Bastos — freelance designer &amp; developer in Lisbon", "Lucas Bastos — designer e programador freelancer em Lisboa"),
    "intro": (
        "Websites for small, stubborn brands. Fast to load, calm to use and simple to keep up to date. Drawn in Lisbon, shipped anywhere.",
        "Sites para marcas pequenas e teimosas. Rápidos a carregar, calmos de usar e simples de manter atualizados. Desenhados em Lisboa, entregues em qualquer lado.",
    ),
    "intro.side": (
        "Design, code and motion under one roof, so nothing gets lost between the mockup and the browser.",
        "Design, código e movimento sob o mesmo teto, para que nada se perca entre a maqueta e o browser.",
    ),
    "about.me": ("About me", "Sobre mim"),
    "recent": ("Recent work", "Trabalho recente"),
    "more": ("More work", "Mais trabalho"),
    "rows.attr": ("More projects", "Mais projetos"),

    # footer
    "footer.title": ("Let’s make<br />something", "Vamos criar<br />algo juntos"),
    "touch": ("Get in touch", "Entrar em contacto"),
    "version": ("Version", "Versão"),
    "edition": ("2026 © Edition", "Edição 2026 ©"),
    "localtime": ("Local time", "Hora local"),

    # work
    "h1.work": ("Work that had to earn its place", "Trabalho que teve de merecer o seu lugar"),
    "th.client": ("Client", "Cliente"),
    "th.location": ("Location", "Local"),
    "th.services": ("Services", "Serviços"),
    "th.year": ("Year", "Ano"),
    "svc.dd": ("Design &amp; Development", "Design e desenvolvimento"),
    "svc.id": ("Interaction &amp; Development", "Interação e desenvolvimento"),
    "svc.td": ("Type &amp; Development", "Tipografia e desenvolvimento"),
    "svc.d": ("Development", "Desenvolvimento"),
    "svc.ds": ("Design", "Design"),
    "loc.lisbon": ("Lisbon", "Lisboa"),

    # about
    "h1.about": ("Helping small brands sound like themselves online", "Ajudo marcas pequenas a soarem como elas próprias online"),
    "readmore.attr": ("Read more", "Ler mais"),
    "about.lead": (
        "I work with founders, studios and small teams who care how things feel, not only how they look. Most projects start with a conversation and a blank page, and end with a site the team can run on its own.",
        "Trabalho com fundadores, estúdios e equipas pequenas que se importam com a forma como as coisas se sentem, não só com o aspeto. A maioria dos projetos começa com uma conversa e uma página em branco, e acaba com um site que a equipa consegue gerir sozinha.",
    ),
    "about.small": ("Always exploring", "Sempre a explorar"),
    "about.img.attr": ("A quiet studio window looking out over a misty city", "Uma janela de estúdio tranquila sobre uma cidade com nevoeiro"),
    "services.title": ("I can help you with …", "Posso ajudar-te com …"),
    "s1.title": ("Design", "Design"),
    "s1.copy": (
        "A clear visual direction, built for the screen first. Layout, type and motion decided together, so the site feels like one thing.",
        "Uma direção visual clara, pensada primeiro para o ecrã. Layout, tipografia e movimento decididos em conjunto, para que o site pareça uma só coisa.",
    ),
    "s2.title": ("Development", "Desenvolvimento"),
    "s2.copy": (
        "Hand-written, fast front ends with a CMS your team can actually use. Accessible by default, and easy to hand over.",
        "Front-ends rápidos, escritos à mão, com um CMS que a tua equipa consegue mesmo usar. Acessíveis de raiz e fáceis de entregar.",
    ),
    "s3.title": ("The full package", "O pacote completo"),
    "s3.copy": (
        "From the first sketch to launch day. One person on the whole project, so the details survive the trip from idea to browser.",
        "Do primeiro esboço ao dia do lançamento. Uma só pessoa em todo o projeto, para que os detalhes sobrevivam à viagem da ideia ao browser.",
    ),

    # contact
    "h1.contact": ("Let’s start a project together", "Vamos começar um projeto juntos"),
    "f.name": ("What’s your name?", "Como te chamas?"),
    "f.email": ("What’s your email?", "Qual é o teu email?"),
    "f.org": ("What’s the name of your organisation?", "Qual é o nome da tua organização?"),
    "f.services": ("What services are you looking for?", "Que serviços procuras?"),
    "f.msg": ("Your message", "A tua mensagem"),
    "ph.name.attr": ("Ana Costa *", "Ana Costa *"),
    "ph.email.attr": ("ana@costa.pt *", "ana@costa.pt *"),
    "ph.org.attr": ("Costa & Filhos", "Costa & Filhos"),
    "ph.services.attr": ("Web design, development …", "Web design, desenvolvimento …"),
    "ph.msg.attr": ("Hello Lucas, can you help me with … *", "Olá Lucas, podes ajudar-me com … *"),
    "send": ("Send it!", "Enviar!"),
    "contact.details": ("Contact details", "Contactos"),
    "business.details": ("Business details", "Dados profissionais"),
    "business": ("Lucas Bastos, design &amp; code<br />Location: Lisbon, PT", "Lucas Bastos, design e código<br />Local: Lisboa, PT"),
    "form.missing": ("Please fill in the fields marked with *.", "Preenche os campos marcados com *."),
    "form.bademail": ("That email address doesn’t look right.", "Esse endereço de email não parece correto."),
    "form.ok": (
        "Thanks! This is a demo form, so nothing was sent. Connect a form service to receive messages.",
        "Obrigado! Isto é um formulário de demonstração, por isso nada foi enviado. Liga um serviço de formulários para receber mensagens.",
    ),
}

PHOTOS = [  # file, backdrop colour sampled from the photo's edges
    ("img/hero/lucas-1.jpg", "#3b4b49"),
    ("img/hero/lucas-2.jpg", "#364747"),
    ("img/hero/lucas-3.jpg", "#41514f"),
    ("img/hero/lucas-4.jpg", "#3c4d4d"),
    ("img/hero/lucas-5.jpg", "#334343"),
    ("img/hero/lucas-6.jpg", "#374847"),
    ("img/hero/lucas-7.jpg", "#324041"),
]
DEFAULT_PHOTO = 3  # lucas-4: front, smiling
for i in range(len(PHOTOS)):
    S[f"photo{i + 1}.attr"] = (f"Photo {i + 1}", f"Foto {i + 1}")

WORK = [
    # slug, title, location key or literal, service key, year, img, bg
    ("mare", "Maré", "Ericeira", "svc.dd", "2025", "img/mare.jpg", "#203038"),
    ("estacao", "Estação", "loc.lisbon", "svc.id", "2024", "img/estacao.jpg", "#1f2a33"),
    ("calma", "Manual da Calma", "Porto", "svc.dd", "2024", "img/calma.jpg", "#d9e0d2"),
    ("largo", "Tipo Largo", "loc.lisbon", "svc.td", "2025", "img/largo.jpg", "#cfc6b8"),
    ("arquivo", "O Arquivo", "Coimbra", "svc.d", "2026", "img/arquivo.jpg", "#d6d2cb"),
    ("costa", "Costa Clara", "Algarve", "svc.dd", "2025", "img/costa.jpg", "#c9d4cf"),
    ("nuno", "Nuno Vale", "loc.lisbon", "svc.ds", "2023", "img/nuno.jpg", "#e8dcd4"),
    ("bruma", "Bruma", "Braga", "svc.id", "2023", "img/bruma.jpg", "#dfe3e6"),
]

PAGES = [("index.html", "nav.home"), ("work.html", "nav.work"), ("about.html", "nav.about"), ("contact.html", "nav.contact")]

ARROW_DOWN_RIGHT = '<svg class="arrow" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2 L12 12 M12 4.5 V12 H4.5" fill="none" stroke="currentColor" stroke-width="1.2" /></svg>'
ARROW_DOWN_LEFT = '<svg class="arrow" viewBox="0 0 14 14" aria-hidden="true"><path d="M12 2 L2 12 M2 4.5 V12 H9.5" fill="none" stroke="currentColor" stroke-width="1.2" /></svg>'
SOCIALS = ["Instagram", "Dribbble", "Behance", "LinkedIn"]


# ───────── helpers ─────────

def en(key):
    return S[key][0]


def T(key, tag="span", attrs=""):
    """Element whose innerHTML is the translated string."""
    a = f" {attrs}" if attrs else ""
    return f'<{tag}{a} data-i18n="{key}">{en(key)}</{tag}>'


def aria(key):
    return f'aria-label="{html.escape(en(key))}" data-i18n-aria="{key}"'


def ph(key):
    return f'placeholder="{html.escape(en(key))}" data-i18n-placeholder="{key}"'


def alt(key):
    return f'alt="{html.escape(en(key))}" data-i18n-alt="{key}"'


def label_of(key):
    return key  # loc / svc fields may be keys or literal place names


def cell(value, tag="span"):
    return T(value, tag) if value in S else f"<{tag}>{value}</{tag}>"


def lang_toggle(extra=""):
    return (f'<div class="lang{(" " + extra) if extra else ""}" role="group" {aria("language.attr")}>'
            '<button type="button" data-lang="en" aria-pressed="true">EN</button>'
            '<button type="button" data-lang="pt" aria-pressed="false">PT</button></div>')


def socials_list(cls=""):
    c = f' class="{cls}"' if cls else ""
    items = "\n".join(f'              <li><a href="#" data-social>{s}</a></li>' for s in SOCIALS)
    return f"<ul{c}>\n{items}\n            </ul>"


# ───────── shared chrome ─────────

def head(page_key):
    return f"""<!DOCTYPE html>
<html lang="en" data-i18n-page="{page_key}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{html.escape(en("title." + page_key))}</title>
  <meta name="description" content="{html.escape(en("desc." + page_key))}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/style.css" />
</head>"""


def chrome(current, skip_to):
    links = "\n".join(
        f'          <li><a href="{f}"{" aria-current=\"page\"" if key == current else ""} data-i18n="{key}">{en(key)}</a></li>'
        for f, key in PAGES
    )
    return f"""  <a class="skip" href="#{skip_to}" data-i18n="skip">{en("skip")}</a>

  <!-- first visit: greetings, then the panel lifts away -->
  <div class="loader" aria-hidden="true">
    <p class="loader-word"><span class="dot"></span><span id="hello">Hello</span></p>
    <div class="loader-curve"></div>
  </div>

  <!-- page change: a panel rises, names the next page, then lifts off it -->
  <div class="transition" id="transition" aria-hidden="true">
    <div class="t-curve t-top"></div>
    <p class="t-label"><span class="dot"></span><span id="t-label"></span></p>
    <div class="t-curve t-bottom"></div>
  </div>

  <button class="fab magnetic" id="fab" type="button" {aria("menu.open.attr")} aria-expanded="false" aria-controls="menu">
    <span class="fill" aria-hidden="true"></span>
    <span class="burger magnetic-inner" aria-hidden="true"><i></i><i></i></span>
  </button>

  <div class="menu-dim" id="menu-dim"></div>

  <nav class="menu" id="menu" {aria("menu.main.attr")} aria-hidden="true">
    <div class="menu-body">
      <div>
        {T("navigation", "p", 'class="eyebrow"')}
        <ul class="menu-links">
{links}
        </ul>
      </div>
      <div class="menu-foot">
        <div class="menu-socials">
          {T("socials", "p", 'class="eyebrow"')}
          {socials_list()}
        </div>
        <div class="menu-lang">
          {T("language", "p", 'class="eyebrow"')}
          {lang_toggle("dark")}
        </div>
      </div>
    </div>
  </nav>

  <div class="preview" id="preview" aria-hidden="true"><div class="preview-track" id="preview-track"></div></div>
  <div class="preview-cursor" id="preview-cursor" aria-hidden="true" data-i18n="view">{en("view")}</div>"""


def bar(current, theme=""):
    items = "\n".join(
        f'            <li><a class="magnetic{" is-current" if key == current else ""}" href="{f}"><span class="magnetic-inner" data-i18n="{key}">{en(key)}</span></a></li>'
        for f, key in PAGES[1:]
    )
    cls = f"bar {theme}".strip()
    return f"""        <div class="{cls}">
          <a class="credit magnetic" href="index.html">
            <span class="magnetic-inner">
              <span class="copy">©</span>
              <span class="swap">{T("credit")}<span>Lucas Bastos</span></span>
            </span>
          </a>
          <div class="bar-right">
            <ul class="bar-links">
{items}
            </ul>
            {lang_toggle()}
            <button class="bar-menu" type="button" data-open-menu data-i18n="menu">{en("menu")}</button>
          </div>
        </div>"""


def footer_meta():
    return f"""        <div class="container footer-bottom">
          <div class="meta">
            <div>{T("version", "p", 'class="eyebrow"')}{T("edition", "p")}</div>
            <div>{T("localtime", "p", 'class="eyebrow"')}<p data-clock>—</p></div>
          </div>
          <div class="meta socials">
            {T("socials", "p", 'class="eyebrow"')}
            {socials_list()}
          </div>
        </div>"""


def footer():
    return f"""      <footer class="footer" id="contact">
        <div class="container footer-inner" id="footer-inner">
          <div class="footer-top">
            <h2><img class="avatar" src="img/hero/lucas-4-thumb.jpg" alt="" />{T("footer.title")}</h2>
            {ARROW_DOWN_LEFT}
          </div>
          <div class="footer-line">
            <a class="btn-cta magnetic" href="contact.html">
              <span class="fill" aria-hidden="true"></span>
              <span class="magnetic-inner" data-i18n="touch">{en("touch")}</span>
            </a>
          </div>
          <div class="pills">
            <a class="btn-pill dark magnetic" href="mailto:ola@lucasbastos.pt"><span class="fill" aria-hidden="true"></span><span class="magnetic-inner">ola@lucasbastos.pt</span></a>
            <a class="btn-pill dark magnetic" href="tel:+351210000333"><span class="fill" aria-hidden="true"></span><span class="magnetic-inner">+351 21 000 0333</span></a>
          </div>
        </div>
{footer_meta()}
      </footer>"""


def page(fname, page_key, current, body_class, skip_to, main):
    out = f"""{head(page_key)}
<body class="{body_class}" data-page="{page_key}">
{chrome(current, skip_to)}

  <div id="smooth">
    <main>
{main}
    </main>
  </div>

  <script src="js/i18n.js"></script>
  <script src="js/lang.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
"""
    (OUT / fname).write_text(out, encoding="utf-8", newline="\n")


# ───────── home ─────────

switch_buttons = "\n".join(
    f'          <button type="button" data-photo="{src}" data-bg="{bg}" {aria(f"photo{i + 1}.attr")} aria-pressed="{str(i == DEFAULT_PHOTO).lower()}">'
    f'<img src="{src.replace(".jpg", "-thumb.jpg")}" alt="" /></button>'
    for i, (src, bg) in enumerate(PHOTOS)
)

home_list = "\n".join(
    f'            <li><a href="../folio/#p/{s}" data-preview="{img}" data-bg="{bg}"><h3>{t}</h3>{cell(svc, "p")}</a></li>'
    for s, t, loc, svc, yr, img, bg in WORK[:4]
)

home = f"""      <header class="hero" id="top" style="--hero:{PHOTOS[DEFAULT_PHOTO][1]}">
{bar("nav.home")}

        <div class="portrait" id="portrait" data-speed="-0.12">
          <img src="{PHOTOS[DEFAULT_PHOTO][0]}" alt="Lucas Bastos" fetchpriority="high" />
        </div>

        <div class="photo-switch" role="group" {aria("photo.group.attr")}>
          {T("photo", "span", 'class="ps-label"')}
{switch_buttons}
        </div>

        <div class="hanger" data-speed="0.18">
          {T("hanger", "p")}
          <span class="globe" aria-hidden="true">
            <svg viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="12" cy="12" r="9" /><ellipse class="spin" cx="12" cy="12" rx="4.2" ry="9" /><path d="M3 12 H21 M4.6 7.5 H19.4 M4.6 16.5 H19.4" /></g></svg>
          </span>
        </div>

        <div class="caption" data-speed="0.1">
          {ARROW_DOWN_RIGHT}
          {T("caption", "p")}
        </div>

        {T("h1.home", "h1", 'class="sr-only"')}
        <div class="big-name" aria-hidden="true">
          <div class="track" id="name-track">
            <span>Lucas Bastos <em>—</em></span><span>Lucas Bastos <em>—</em></span>
          </div>
        </div>
      </header>

      <section class="intro" id="intro">
        <div class="container intro-grid">
          {T("intro", "h2", 'class="split" data-reveal')}
          <div class="intro-side">
            {T("intro.side", "p", "data-reveal")}
            <a class="btn-round magnetic" href="about.html">
              <span class="fill" aria-hidden="true"></span>
              <span class="magnetic-inner" data-i18n="about.me">{en("about.me")}</span>
            </a>
          </div>
        </div>
      </section>

      <section class="work" id="work">
        <div class="container">
          {T("recent", "p", 'class="eyebrow"')}
          <ul class="work-list" data-preview-list>
{home_list}
          </ul>
          <div class="more">
            <a class="btn-pill magnetic" href="work.html">
              <span class="fill" aria-hidden="true"></span>
              <span class="magnetic-inner">{T("more")} <sup>{len(WORK)}</sup></span>
            </a>
          </div>
        </div>
      </section>

      <section class="rows" {aria("rows.attr")}>
        <div class="row" data-row="1">
          <div class="tile" style="--bg:#d6d2cb"><img src="img/arquivo.jpg" alt="" loading="lazy" /></div>
          <div class="tile" style="--bg:#1f2a33"><img src="img/estacao.jpg" alt="" loading="lazy" /></div>
          <div class="tile" style="--bg:#c9d4cf"><img src="img/costa.jpg" alt="" loading="lazy" /></div>
          <div class="tile" style="--bg:#e8dcd4"><img src="img/nuno.jpg" alt="" loading="lazy" /></div>
        </div>
        <div class="row" data-row="2">
          <div class="tile" style="--bg:#2b2b2b"><img src="img/largo.jpg" alt="" loading="lazy" /></div>
          <div class="tile" style="--bg:#dfe3e6"><img src="img/bruma.jpg" alt="" loading="lazy" /></div>
          <div class="tile" style="--bg:#d9e0d2"><img src="img/calma.jpg" alt="" loading="lazy" /></div>
          <div class="tile" style="--bg:#203038"><img src="img/mare.jpg" alt="" loading="lazy" /></div>
        </div>
        <div class="round-wrap"><div class="round"></div></div>
      </section>

{footer()}"""

page("index.html", "home", "nav.home", "is-loading", "intro", home)

# ───────── work ─────────

rows = "\n".join(
    f"""            <li><a href="../folio/#p/{s}" data-preview="{img}" data-bg="{bg}">
              <h3>{t}</h3>{cell(loc)}{cell(svc)}<span>{yr}</span>
            </a></li>"""
    for s, t, loc, svc, yr, img, bg in WORK
)

work = f"""      <header class="page-head">
{bar("nav.work", "on-light")}
        <div class="container head-copy">
          {T("h1.work", "h1", 'class="split" data-reveal')}
        </div>
      </header>

      <section class="work work-page" id="main-work">
        <div class="container">
          <div class="table-head" aria-hidden="true">
            {T("th.client", "span", 'class="eyebrow"')}{T("th.location", "span", 'class="eyebrow"')}{T("th.services", "span", 'class="eyebrow"')}{T("th.year", "span", 'class="eyebrow"')}
          </div>
          <ul class="work-table" data-preview-list>
{rows}
          </ul>
        </div>
        <div class="round-wrap"><div class="round"></div></div>
      </section>

{footer()}"""

page("work.html", "work", "nav.work", "", "main-work", work)

# ───────── about ─────────

about = f"""      <header class="page-head">
{bar("nav.about", "on-light")}
        <div class="container head-copy">
          {T("h1.about", "h1", 'class="split" data-reveal')}
        </div>
        <div class="container">
          <div class="head-line">
            <a class="btn-round magnetic" href="#story" {aria("readmore.attr")}>
              <span class="fill" aria-hidden="true"></span>
              <span class="magnetic-inner">{ARROW_DOWN_RIGHT}</span>
            </a>
          </div>
        </div>
      </header>

      <section class="about" id="story">
        <div class="container about-grid">
          <div class="about-copy">
            {T("about.lead", "p", 'class="lead" data-reveal')}
            {T("about.small", "p", 'class="small" data-reveal')}
          </div>
          <figure class="about-img" data-reveal>
            <img src="img/bruma.jpg" {alt("about.img.attr")} loading="lazy" />
          </figure>
        </div>
      </section>

      <section class="services">
        <div class="container">
          {T("services.title", "h2", 'class="services-title"')}
          <div class="services-grid">
""" + "\n".join(
    f"""            <div class="service" data-reveal>
              <p class="eyebrow num">0{n}</p>
              {T(f"s{n}.title", "h3")}
              {T(f"s{n}.copy", "p")}
            </div>""" for n in (1, 2, 3)
) + f"""
          </div>
        </div>
        <div class="round-wrap"><div class="round"></div></div>
      </section>

{footer()}"""

page("about.html", "about", "nav.about", "", "story", about)

# ───────── contact ─────────

fields = [
    ("01", "f.name", "name", "text", "ph.name.attr", "name", True),
    ("02", "f.email", "email", "email", "ph.email.attr", "email", True),
    ("03", "f.org", "org", "text", "ph.org.attr", "organization", False),
    ("04", "f.services", "services", "text", "ph.services.attr", "off", False),
]
field_html = "\n".join(
    f"""              <div class="field">
                <span class="eyebrow num">{n}</span>
                <label for="f-{k}" data-i18n="{lab}">{en(lab)}</label>
                <input id="f-{k}" name="{k}" type="{typ}" {ph(p)} autocomplete="{ac}"{" required" if req else ""} />
              </div>"""
    for n, lab, k, typ, p, ac, req in fields
)

contact = f"""      <section class="contact-page" id="main-contact">
{bar("nav.contact", "on-dark")}
        <div class="container contact-grid">
          <div class="contact-main">
            <h1><img class="avatar" src="img/hero/lucas-4-thumb.jpg" alt="" />{T("h1.contact", "span", 'class="split" data-reveal')}</h1>
            <form class="contact-form" id="contact-form" novalidate>
{field_html}
              <div class="field">
                <span class="eyebrow num">05</span>
                <label for="f-msg" data-i18n="f.msg">{en("f.msg")}</label>
                <textarea id="f-msg" name="message" rows="3" {ph("ph.msg.attr")} required></textarea>
              </div>
              <div class="footer-line send-line">
                <button class="btn-cta magnetic" type="submit">
                  <span class="fill" aria-hidden="true"></span>
                  <span class="magnetic-inner" data-i18n="send">{en("send")}</span>
                </button>
              </div>
              <p class="form-note" id="form-note" role="status"></p>
            </form>
          </div>
          <aside class="contact-side">
            {ARROW_DOWN_LEFT}
            <div>
              {T("contact.details", "p", 'class="eyebrow"')}
              <p><a href="mailto:ola@lucasbastos.pt">ola@lucasbastos.pt</a><br /><a href="tel:+351210000333">+351 21 000 0333</a></p>
            </div>
            <div>
              {T("business.details", "p", 'class="eyebrow"')}
              {T("business", "p")}
            </div>
            <div>
              {T("socials", "p", 'class="eyebrow"')}
              {socials_list("side-socials")}
            </div>
          </aside>
        </div>
{footer_meta()}
      </section>"""

page("contact.html", "contact", "nav.contact", "dark-page", "main-contact", contact)

# ───────── dictionary ─────────

packs = {"en": {k: v[0] for k, v in S.items()}, "pt": {k: v[1] for k, v in S.items()}}
(OUT / "js" / "lang.js").write_text(
    "// Generated from the string table in the build script: EN + PT-PT.\n"
    f"window.SITE_I18N = {json.dumps(packs, ensure_ascii=False, indent=2)};\n\n"
    "I18N.start(window.SITE_I18N);\n",
    encoding="utf-8",
    newline="\n",
)

print("built", [p for p, _ in PAGES], "+ js/lang.js,", len(S), "strings")
