#!/usr/bin/env python3
"""ZyniVerse x AI - anime-styled technical presentation generator (python-pptx)."""

from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn

# ----------------------------------------------------------------------------
# Palette (neon-anime on deep navy)
# ----------------------------------------------------------------------------
NAVY   = RGBColor(0x0F, 0x0E, 0x17)  # bg
NAVY2  = RGBColor(0x13, 0x12, 0x22)  # slightly lighter bg
PANEL  = RGBColor(0x1C, 0x1A, 0x33)  # card
PANEL2 = RGBColor(0x24, 0x21, 0x41)  # card alt
GRAD   = RGBColor(0x2A, 0x27, 0x56)  # chips / faint
VIOLET = RGBColor(0x7F, 0x5A, 0xF0)
PINK   = RGBColor(0xE5, 0x31, 0x70)
TEAL   = RGBColor(0x00, 0xC2, 0xFF)
GOLD   = RGBColor(0xFF, 0xC2, 0x57)
GREEN  = RGBColor(0x2C, 0xB6, 0x7D)
WHITE  = RGBColor(0xFF, 0xFF, 0xFE)
MUTED  = RGBColor(0xA7, 0xA9, 0xBE)
DIM    = RGBColor(0x5A, 0x5B, 0x7A)
LINE   = RGBColor(0x2C, 0x2A, 0x48)

F_TITLE = "Segoe UI Black"
F_BODY  = "Segoe UI"
F_MONO  = "Consolas"

EMU_W = 12192000  # 13.333in
EMU_H = 6858000   # 7.5in

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
BLANK = prs.slide_layouts[6]


def set_fill(shape, color, alpha=100):
    shape.fill.solid()
    shape.fill.fore_color.rgb = color
    if alpha < 100:
        sf = shape.fill.fore_color._xFill
        srgb = sf.find(qn("a:srgbClr"))
        a = sf.makeelement(qn("a:alpha"), {"val": str(int(alpha * 1000))})
        srgb.append(a)


def no_line(shape):
    shape.line.fill.background()


def shadowless(shape):
    try:
        shape.shadow.inherit = False
    except Exception:
        pass


def rect(slide, x, y, w, h, fill=PANEL, line=None, round_=False, radius=0.12, alpha=100):
    kind = MSO_SHAPE.ROUNDED_RECTANGLE if round_ else MSO_SHAPE.RECTANGLE
    sh = slide.shapes.add_shape(kind, Inches(x), Inches(y), Inches(w), Inches(h))
    if round_:
        try:
            sh.adjustments[0] = radius
        except Exception:
            pass
    set_fill(sh, fill, alpha)
    if line is not None:
        sh.line.color.rgb = line
        sh.line.width = Pt(1)
    else:
        no_line(sh)
    shadowless(sh)
    return sh


def oval(slide, x, y, w, h, fill, alpha=100, line=None, lw=1.5):
    sh = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(x), Inches(y), Inches(w), Inches(h))
    if fill is None:
        sh.fill.background()
    else:
        set_fill(sh, fill, alpha)
    if line is not None:
        sh.line.color.rgb = line
        sh.line.width = Pt(lw)
    else:
        no_line(sh)
    shadowless(sh)
    return sh


def star(slide, x, y, d, color, alpha=100):
    sh = slide.shapes.add_shape(MSO_SHAPE.STAR_5_POINT, Inches(x), Inches(y), Inches(d), Inches(d))
    set_fill(sh, color, alpha)
    no_line(sh)
    shadowless(sh)
    return sh


def _tracks(run, pts):
    try:
        run.font._rPr.set("spc", str(int(pts * 100)))
    except Exception:
        pass


def text(slide, x, y, w, h, paras, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, wrap=True):
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = wrap
    tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    first = True
    for para in paras:
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        p.alignment = para.get("align", align)
        p.space_before = Pt(para.get("sb", 0))
        p.space_after = Pt(para.get("sa", 0))
        p.line_spacing = para.get("ls", 1.0)
        for r in para["runs"]:
            run = p.add_run()
            run.text = r[0]
            f = run.font
            f.size = Pt(r[1])
            f.color.rgb = r[2]
            f.bold = r[3] if len(r) > 3 else False
            f.name = r[4] if len(r) > 4 else F_BODY
            if len(r) > 5 and r[5]:
                f.italic = True
            if len(r) > 6 and r[6]:
                _tracks(run, r[6])
    return tb


def shape_text(sh, paras, anchor=MSO_ANCHOR.MIDDLE, ml=0.22, mr=0.22):
    tf = sh.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = Inches(ml)
    tf.margin_right = Inches(mr)
    tf.margin_top = Inches(0.02)
    tf.margin_bottom = Inches(0.02)
    first = True
    for para in paras:
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        p.alignment = para.get("align", PP_ALIGN.LEFT)
        p.space_before = Pt(para.get("sb", 0))
        p.space_after = Pt(para.get("sa", 0))
        p.line_spacing = para.get("ls", 1.0)
        for r in para["runs"]:
            run = p.add_run()
            run.text = r[0]
            f = run.font
            f.size = Pt(r[1])
            f.color.rgb = r[2]
            f.bold = r[3] if len(r) > 3 else False
            f.name = r[4] if len(r) > 4 else F_BODY
            if len(r) > 5 and r[5]:
                f.italic = True
            if len(r) > 6 and r[6]:
                _tracks(run, r[6])
    return sh


def notes(slide, txt):
    slide.notes_slide.notes_text_frame.text = txt


# ----------------------------------------------------------------------------
# Decorations + shell
# ----------------------------------------------------------------------------

def decorate(slide):
    # soft glows
    oval(slide, -1.6, -1.9, 5.2, 5.2, VIOLET, alpha=6)
    oval(slide, 10.6, 4.9, 4.6, 4.6, PINK, alpha=5)
    oval(slide, 11.3, -2.4, 3.4, 3.4, TEAL, alpha=5)
    # sparks
    text(slide, 11.95, 0.42, 1.0, 0.5, [{"runs": [("✦", 18, PINK, True, F_BODY)]}])
    text(slide, 11.6, 0.95, 0.8, 0.4, [{"runs": [("✧", 11, GOLD, True, F_BODY)]}])
    oval(slide, 12.62, 1.14, 0.09, 0.09, TEAL)
    oval(slide, 0.55, 6.92, 0.06, 0.06, VIOLET)


def base_slide(idx, total=12):
    s = prs.slides.add_slide(BLANK)
    rect(s, 0, 0, 13.333, 7.5, NAVY)
    decorate(s)
    return s


def header(s, idx, title, subtitle=None, accent=PINK):
    chip = rect(s, 0.56, 0.52, 0.52, 0.52, VIOLET, round_=True, radius=0.22)
    shape_text(chip, [{"runs": [(str(idx), 20, WHITE, True, F_TITLE)], "align": PP_ALIGN.CENTER}], ml=0, mr=0)
    text(s, 1.28, 0.42, 11.2, 0.75, [{"runs": [(title, 27, WHITE, True, F_TITLE)]}])
    if subtitle:
        text(s, 1.30, 1.18, 11.2, 0.4, [{"runs": [(subtitle, 12.5, MUTED, False, F_BODY)]}])
    rect(s, 1.30, 1.66, 1.6, 0.05, VIOLET)
    rect(s, 2.95, 1.66, 0.7, 0.05, PINK)


def brand(s, idx):
    rect(s, 0.56, 6.88, 12.21, 0.016, LINE)
    text(s, 0.56, 7.0, 6.0, 0.35, [{"runs": [("ZYNIVERSE × AI", 9.5, DIM, True, F_BODY, False, 3.2)]}])
    text(s, 7.5, 7.0, 5.27, 0.35, [{"runs": [("PARTH GUPTA · 2026 · " + str(idx) + " / 12", 9.5, DIM, False, F_BODY, False, 1.6)],
                                    "align": PP_ALIGN.RIGHT}])


def code_strip(s, fname, lines, x=0.56, y=6.16, w=12.21, title_color=TEAL):
    rect(s, x, y, w, 0.62, PANEL, round_=True, radius=0.14)
    rect(s, x, y, 0.05, 0.62, VIOLET)
    text(s, x + 0.22, y + 0.075, 6.0, 0.25, [{"runs": [("CODE — " + fname, 10, title_color, True, F_MONO)]}])
    row = "   ·   ".join(lines) if lines else "…"
    n = len(row)
    size = 9.0 if n > 165 else (9.5 if n > 140 else (10.0 if n > 115 else 10.5))
    text(s, x + 0.22, y + 0.315, w - 0.5, 0.28, [{"runs": [(row, size, MUTED, False, F_MONO)]}])


def chip_row(s, items, y=1.62, size=10.5):
    x = 0.56
    for it in items:
        w = 0.22 + 0.09 * len(it["t"]) + 0.62
        text(s, x, y, w + 0.4, 0.3, [{"runs": [(it["icon"] + "  " + it["t"], size, it["c"], True, F_BODY)]}])
        x += w + 0.55


# ----------------------------------------------------------------------------
# SLIDE 1 — TITLE
# ----------------------------------------------------------------------------
s = base_slide(1)
rect(s, 0, 0, 13.333, 7.5, NAVY2)

# deco rings + stars
oval(s, 10.6, -1.7, 4.2, 4.2, None, line=GRAD, lw=2)
oval(s, 11.5, -0.9, 2.6, 2.6, None, line=PINK, lw=1.5)
oval(s, -1.9, 4.8, 4.0, 4.0, None, line=GRAD, lw=2)
star(s, -0.35, 5.35, 0.34, GOLD, alpha=90)
star(s, 12.6, 4.1, 0.3, VIOLET, alpha=80)
star(s, 11.2, 6.1, 0.24, TEAL, alpha=70)
text(s, 1.15, 6.35, 1.0, 0.5, [{"runs": [("✦", 16, PINK, True, F_BODY)]}])
text(s, 12.0, 6.6, 1.0, 0.5, [{"runs": [("✧", 14, GOLD, True, F_BODY)]}])

# logo
try:
    s.shapes.add_picture(r"C:\Users\Parth Gupta\Desktop\ZyniVerse\logo.png",
                         Inches(5.42), Inches(0.52), width=Inches(2.5))
except Exception:
    pass

text(s, 0.5, 3.14, 12.33, 0.4, [{"runs": [("TECHNICAL PRESENTATION · 2026", 13, MUTED, True, F_BODY, False, 5.0)],
                                 "align": PP_ALIGN.CENTER}])

# title
p = [{"runs": [("ZyniVerse", 58, WHITE, True, F_TITLE),
               ("  ×  ", 58, DIM, True, F_TITLE),
               ("AI", 58, PINK, True, F_TITLE)],
      "align": PP_ALIGN.CENTER, "ls": 1.0}]
text(s, 0.5, 3.5, 12.33, 1.25, p)

text(s, 0.5, 4.75, 12.33, 0.4, [{"runs": [("✦   ✧   ✦", 13, GOLD, True, F_BODY)], "align": PP_ALIGN.CENTER}])

text(s, 0.5, 5.12, 12.33, 0.5, [{"runs": [("A next-gen anime community platform where AI is the engine — built for India", 19, TEAL, False, F_BODY)],
                                 "align": PP_ALIGN.CENTER}])

pill = rect(s, 3.97, 5.72, 5.4, 0.52, PANEL, round_=True, radius=0.5)
shape_text(pill, [{"runs": [("Discover  ·  Track  ·  Discuss  ·  Watch Together", 13, WHITE, True, F_BODY)],
                   "align": PP_ALIGN.CENTER}])

text(s, 0.5, 6.62, 12.33, 0.4, [{"runs": [("9+ AI FEATURES     ·     224+ PAGES     ·     409 API ROUTES     ·     ~190 DB MODELS", 11.5, MUTED, True, F_BODY, False, 1.5)],
                                 "align": PP_ALIGN.CENTER}])
text(s, 0.5, 7.05, 12.33, 0.4, [{"runs": [("Presented by Parth Gupta", 12, WHITE, True, F_BODY)], "align": PP_ALIGN.CENTER}])
notes(s, "Introduce yourself. ZyniVerse is a full anime & manga community platform for India. The unique angle for this talk: AI is not a bolted-on tab — it is the engine that powers discovery, search, chat, and social features. 9+ real AI features, built on top of Google's Gemini 2.5 flash, with a custom hybrid recommender running server-side.")

# ----------------------------------------------------------------------------
# SLIDE 2 — PROBLEM
# ----------------------------------------------------------------------------
s = base_slide(2)
header(s, 2, "Anime Fans Are Scattered", "The discovery + community problem every Indian anime fan lives with", PINK)
chip_row(s, [{"t": "4 platforms · 0 synergy", "c": PINK, "icon": "✖"}])

cards = [
    ("Fragmented Data", "Watchlists live on MAL, AniList, Reddit and Discord — four places, one broken picture.", PINK, "◆"),
    ("Zero India Intelligence", "Hindi / Tamil / Telugu dub schedules, filler lists, where-to-watch — everything is manual Google hunting.", VIOLET, "✦"),
    ("Manual Discovery", "Finding 'what to watch next' means endless catalog clicking — no personalization, no vibes.", TEAL, "●"),
    ("Solo Watching", "Everyone watches alone. No shared watch parties, no co-watching, no social layer around anime.", GOLD, "◈"),
]
for i, (t, d, c, ic) in enumerate(cards):
    r, cl = divmod(i, 2)
    x = 0.56 + cl * 6.28
    y = 2.15 + r * 2.12
    card = rect(s, x, y, 5.95, 1.92, PANEL, round_=True, radius=0.07)
    rect(s, x + 0.24, y + 0.24, 0.07, 0.62, c, round_=True, radius=0.5)
    text(s, x + 0.5, y + 0.26, 5.1, 0.5, [{"runs": [(ic + "  ", 17, c, True, F_BODY), (t, 16, WHITE, True, F_TITLE)]}])
    text(s, x + 0.5, y + 0.82, 5.15, 0.95, [{"runs": [(d, 12, MUTED, False, F_BODY)], "ls": 1.12}])
notes(s, "Set up the problem: fans are spread across 3-4 apps; India has almost zero tooling for finding Hindi/Tamil/Telugu dubs or filler episodes; discovery is manual; and watching is a lonely activity. ZyniVerse was built to collapse all of these into one platform — and AI is what makes that possible at scale.")

# ----------------------------------------------------------------------------
# SLIDE 3 — WHAT IS ZYNIVERSE
# ----------------------------------------------------------------------------
s = base_slide(3)
header(s, 3, "Introducing ZyniVerse", "An all-in-one anime & manga community platform for India", VIOLET)

# left column
text(s, 0.56, 2.05, 6.3, 0.45, [{"runs": [("One platform, four pillars", 15, TEAL, True, F_TITLE)]}])
pillars = [
    ("Discover", "226+ pages of curated data — Trending, A–Z, Genre, Seasonal, Top, Dub schedules."),
    ("Track", "Watchlists, fillers, watch-orders, manga chapters, 30-day activity timeline."),
    ("Discuss", "Posts, forums, clubs, reels, memes, fan-art, character battles & tournaments."),
    ("Watch Together", "Socket.io watch-parties with sync, voice chat & screen-share — HLS playback."),
]
yy = 2.55
for t, d in pillars:
    rect(s, 0.56, yy, 6.35, 0.85, PANEL, round_=True, radius=0.18)
    rect(s, 0.62, yy + 0.13, 0.05, 0.59, VIOLET)
    text(s, 0.92, yy + 0.12, 5.7, 0.3, [{"runs": [(t, 12.5, WHITE, True, F_TITLE)]}])
    text(s, 0.92, yy + 0.42, 5.7, 0.38, [{"runs": [(d, 10.5, MUTED, False, F_BODY)], "ls": 1.0}])
    yy += 0.98

# right stat panel
rp = rect(s, 7.3, 2.05, 5.47, 4.1, PANEL2, round_=True, radius=0.07)
rect(s, 7.3, 2.05, 5.47, 0.06, PINK)
text(s, 7.62, 2.28, 4.9, 0.4, [{"runs": [("THE PLATFORM AT A GLANCE", 12.5, PINK, True, F_TITLE, False, 2.0)]}])
stats = [
    ("224+", "App router pages"),
    ("409", "API route handlers"),
    ("268", "React components"),
    ("~190", "Prisma / Postgres models"),
    ("4", "Surfaces: Web · Chrome Ext · Mobile · Discord bot"),
]
yy = 2.78
for num, lab in stats:
    text(s, 7.62, yy, 1.5, 0.5, [{"runs": [(num, 20, TEAL, True, F_TITLE)]}])
    text(s, 9.0, yy + 0.05, 3.7, 0.45, [{"runs": [(lab, 11.5, WHITE, False, F_BODY)], "ls": 1.0}])
    yy += 0.67
notes(s, "Position the product: it's a companion & social ecosystem over anime catalogs — content intelligence is pulled live from AniList/MyAnimeList/MangaDex/TMDB. Scale: 224+ pages, 409 API routes, 268 components, ~190 database models, shipped on 4 surfaces (web, Chrome extension, mobile app, Discord bot). Every surface feeds the same AI stack.")

# ----------------------------------------------------------------------------
# SLIDE 4 — TECH STACK
# ----------------------------------------------------------------------------
s = base_slide(4)
header(s, 4, "The Engineering Foundation", "One monorepo — Next.js 16 core, 4 client surfaces", TEAL)

stack = [
    ("Next.js 16", "App Router · React 19 · TS 5", VIOLET, "▲"),
    ("Prisma + PostgreSQL", "~190 models, relation-mode Prisma", PINK, "▣"),
    ("Stripe", "Pro subs, UPI, merch, portal + webhooks", TEAL, "▼"),
    ("Socket.io + WebRTC", "Watch-parties, DMs, voice & screen-share", GOLD, "▶"),
    ("Redis", "Rate-limiting (INCR/PEXPIRE) + in-mem fallback", VIOLET, "◉"),
    ("HLS + R2 / Supabase", "hls.js streams, S3-presigned uploads", PINK, "▶"),
    ("NextAuth v5", "Credentials + Google / GitHub / Discord", TEAL, "◆"),
    ("Ops + QA", "Vercel + Node server, Vitest, k6 load tests", GOLD, "✚"),
]
cw = 2.94
gap = 0.15
for i, (t, d, c, ic) in enumerate(stack):
    r, cl = divmod(i, 4)
    x = 0.56 + cl * (cw + gap)
    y = 1.95 + r * 1.72
    card = rect(s, x, y, cw, 1.58, PANEL, round_=True, radius=0.08)
    rect(s, x + 0.18, y + 0.18, 0.055, 0.5, c, round_=True, radius=0.5)
    text(s, x + 0.36, y + 0.2, cw - 0.55, 0.55, [{"runs": [(t, 13.5, WHITE, True, F_TITLE)]}])
    text(s, x + 0.36, y + 0.78, cw - 0.62, 0.7, [{"runs": [(d, 10, MUTED, False, F_BODY)], "ls": 1.1}])
    text(s, x + cw - 0.55, y + 0.16, 0.45, 0.4, [{"runs": [(ic, 13, c, True, F_BODY)]}])
code_strip(s, "package.json", ["next ^16.3.2", "react 19.2.4", "prisma ^5.22.0", "socket.io ^4.8.3", "tailwindcss ^4", "typescript 5.9"])
notes(s, "Walk through the stack quickly: Next.js 16 App Router + React 19 + TypeScript; Prisma on Postgres with ~190 models; Stripe for Pro + UPI payments; Socket.io for realtime watch-parties with WebRTC voice; Redis rate limiting; HLS streaming; R2 + Supabase storage; NextAuth v5 OAuth. QA via Vitest and k6 load scripts.")

# ----------------------------------------------------------------------------
# SLIDE 5 — AI ARCHITECTURE / STRATEGY
# ----------------------------------------------------------------------------
s = base_slide(5)
header(s, 5, "One Wrapper, Nine Features", "A single battle-tested Gemini pipeline powers every AI surface", VIOLET)

# pipeline left
text(s, 0.56, 1.95, 6.0, 0.4, [{"runs": [("THE PIPELINE  ➜  src/lib/gemini.ts", 13, TEAL, True, F_TITLE)]}])
steps = [("SYSTEM PROMPT", "Role + constraints per feature", VIOLET),
         ("QUOTA CHECK", "AiUsageDaily — 20/user · 1200/day global", PINK),
         ("CACHE LOOKUP", "SHA-256 key → AiCache hit? return instantly", TEAL),
         ("geminiGenerate()", "Gemini 2.5 flash · JSON mode · retries", GOLD),
         ("JSON PARSE", "parseGeminiJson with regex fallback", GREEN)]
yy = 2.42
for t, d, c in steps:
    rect(s, 0.56, yy, 6.0, 0.62, PANEL, round_=True, radius=0.16)
    rect(s, 0.62, yy + 0.09, 0.05, 0.44, c, round_=True, radius=0.5)
    text(s, 0.92, yy + 0.08, 1.95, 0.45, [{"runs": [(t, 11, c, True, F_MONO)], "ls": 1.0}], anchor=MSO_ANCHOR.MIDDLE)
    text(s, 2.9, yy + 0.08, 3.55, 0.45, [{"runs": [(d, 10, MUTED, False, F_BODY)], "ls": 1.0}], anchor=MSO_ANCHOR.MIDDLE)
    yy += 0.72

# right bullets
rx = 6.95
text(s, rx, 1.95, 5.8, 0.4, [{"runs": [("WHY IT WORKS", 13, PINK, True, F_TITLE)]}])
bullets = [
    ("Cost control", "SHA-256 caching in AiCache + per-user & global daily quotas — Gemini stays affordable at scale."),
    ("Resilience", "Auto-retry on HTTP 429 / 5xx with exponential backoff; empty-response guard."),
    ("Fast + cheap model", "gemini-2.5-flash for latency; thinkingBudget: 0 so tokens aren't burned on reasoning."),
    ("Structured output", "responseMimeType: application/json + parser that regex-recovers JSON from noisy text."),
]
yy = 2.42
for t, d in bullets:
    rect(s, rx, yy, 5.82, 1.02, PANEL, round_=True, radius=0.12)
    rect(s, rx + 0.2, yy + 0.12, 0.06, 0.78, PINK, round_=True, radius=0.5)
    text(s, rx + 0.44, yy + 0.12, 1.4, 0.3, [{"runs": [(t, 12.5, WHITE, True, F_TITLE)]}])
    text(s, rx + 0.44, yy + 0.44, 5.15, 0.5, [{"runs": [(d, 10.5, MUTED, False, F_BODY)], "ls": 1.08}])
    yy += 1.12

code_strip(s, "gemini.ts", ["const PER_USER_DAILY_LIMIT = 20", "GLOBAL_DAILY_LIMIT = 1200", "thinkingBudget: 0", "retry 429 / 5xx · AiCache hit"])
notes(s, "The whole AI surface is one wrapper: src/lib/gemini.ts. Every feature — chat, identify, vibe, night planner, theories — runs through the same pipeline: quota check (AiUsageDaily: 20/day per user, 1200/day global), SHA-256 cache lookup in AiCache, then geminiGenerate with JSON output mode, retries on 429/5xx, and a regex-tolerant JSON parser. This is how nine AI features run on one tiny Gemini budget.")

# ----------------------------------------------------------------------------
# SLIDE 6 — CHAT & ROLEPLAY
# ----------------------------------------------------------------------------
s = base_slide(6)
header(s, 6, "Chat & Character Roleplay", "Conversational AI that thinks inside the anime universe", PINK)

feats = [
    ("Zyni AI — Domain Expert", VIOLET, "✧",
     [("Chat with an anime/manga expert that answers with sources & context.", False),
      ("Each reply can embed up to 4 recommendations, resolved to real AniList titles + images.", False),
      ("Multi-turn conversation with full history in prompts.", False)]),
    ("Character Chat — Roleplay", PINK, "◉",
     [("Talk to your favourite characters — in-character, with their personality & speech style.", False),
      ("Replies are generated in Hinglish — the perfect tone for Indian anime fans.", False),
      ("Structured JSON reply → typed card UI with dialogue + reaction.", False)]),
]
for i, (t, c, ic, items) in enumerate(feats):
    x = 0.56 + i * 6.28
    card = rect(s, x, 1.98, 5.95, 3.5, PANEL, round_=True, radius=0.06)
    rect(s, x, 1.98, 5.95, 0.62, PANEL2, round_=True, radius=0.06)
    rect(s, x, 1.98, 5.95, 0.05, c)
    text(s, x + 0.3, 2.1, 5.3, 0.4, [{"runs": [(ic + "  ", 15, c, True, F_BODY), (t, 14.5, WHITE, True, F_TITLE)]}])
    yy = 2.85
    for d, _ in items:
        rect(s, x + 0.32, yy, 0.06, 0.06, c)
        text(s, x + 0.5, yy - 0.06, 5.2, 0.78, [{"runs": [(d, 11.5, MUTED, False, F_BODY)], "ls": 1.12}])
        yy += 0.78
pill2 = rect(s, 0.56, 5.72, 12.21, 0.42, PANEL2, round_=True, radius=0.5)
shape_text(pill2, [{"runs": [("EXAMPLE →  User: \"kyun main sabke saath binge worthy hoon?\"   ·   Zyni AI: \"Based on your profile — spend the weekend on this 3 anime lineup: …\"", 11.5, WHITE, True, F_BODY)]}])
code_strip(s, "api/ai/chat/route.ts", ["system: 'you are a world-class anime & manga expert'", "reply JSON + up to 4 recommendations", "resolve IDs → AniList titles"])
notes(s, "Two personalities: Zyni AI is a domain expert whose chat replies include real, clickable recommendations resolved against AniList — so the chat doesn't just talk, it leads somewhere. Character Chat does in-character roleplay and, uniquely for an Indian audience, replies in Hinglish. Both share the same quota + cache pipeline.")

# ----------------------------------------------------------------------------
# SLIDE 7 — VISUAL & SEMANTIC SEARCH
# ----------------------------------------------------------------------------
s = base_slide(7)
header(s, 7, "Visual & Semantic Search", "AI that recognises screenshots and understands vibes", TEAL)

left = [
    ("Screenshot Identify", VIOLET, "❋",
     [("Upload any screenshot → identify the anime instantly.", False),
      ("Returns title + confidence, guessed episode, and the characters on screen.", False),
      ("Base64 image passed inline to Gemini as a vision input.", False)]),
    ("Vibe Search", PINK, "☁",
     [("Natural language moods become playlists: \"something chill for 3 a.m.\"", False),
      ("LLM maps the vibe → real anime titles via AniList.", False),
      ("Turns 'I don't know what to watch' into one search box.", False)]),
]
for i, (t, c, ic, items) in enumerate(left):
    x = 0.56 + i * 6.28
    card = rect(s, x, 1.98, 5.95, 3.45, PANEL, round_=True, radius=0.06)
    rect(s, x, 1.98, 5.95, 0.6, PANEL2, round_=True, radius=0.06)
    rect(s, x, 1.98, 5.95, 0.05, c)
    text(s, x + 0.3, 2.1, 5.3, 0.4, [{"runs": [(ic + "  ", 15, c, True, F_BODY), (t, 14.5, WHITE, True, F_TITLE)]}])
    yy = 2.82
    for d, _ in items:
        rect(s, x + 0.32, yy, 0.06, 0.06, c)
        text(s, x + 0.5, yy - 0.06, 5.2, 0.78, [{"runs": [(d, 11.5, MUTED, False, F_BODY)], "ls": 1.12}])
        yy += 0.84

pill2 = rect(s, 0.56, 5.68, 12.21, 0.46, PANEL2, round_=True, radius=0.5)
shape_text(pill2, [{"runs": [("IDENTIFY →  {\"title\": \"One Piece\", \"confidence\": 0.93, \"episode\": \"1164+, Film: Red\", \"characters\": [\"Luffy\", \"Zoro\"]}", 11, TEAL, True, F_MONO)]}], ml=0.4, mr=0.4)
code_strip(s, "gemini.ts → parseGeminiJson", ["inline_data: { mime_type, base64 }", "responseMimeType: application/json", "JSON.parse fallback → regex extract"])
notes(s, "Two hero AI features. Screenshot Identify sends the image as base64 inline_data and returns structured JSON: title, confidence, guessed episode, characters — this is how users settle 'which anime is this frame?' debates. Vibe Search turns natural-language moods into real catalogue titles. Both are single requests through the same pipeline.")

# ----------------------------------------------------------------------------
# SLIDE 8 — SOCIAL AI
# ----------------------------------------------------------------------------
s = base_slide(8)
header(s, 8, "Social AI", "AI that plans nights and ignites fan debates", GOLD)

left = [
    ("Anime Night Planner", VIOLET, "☾",
     [("Blends every friend's taste into a themed lineup — anime, snacks and trivia.", False),
      ("One tap creates a real watch-party room over Socket.io, synced + voice-ready.", False),
      ("Social planning → instant co-watching. Zero manual coordination.", False)]),
    ("AI Lab — Fan Theories", PINK, "⚡",
     [("Freeform fan theory generation for any anime, shaped by its plot data.", False),
      ("Community votes agree/disagree — theories become content (TheoryVote).", False),
      ("Same prompt pipeline, entirely new category of UGC.", False)]),
]
for i, (t, c, ic, items) in enumerate(left):
    x = 0.56 + i * 6.28
    card = rect(s, x, 1.98, 5.95, 3.55, PANEL, round_=True, radius=0.06)
    rect(s, x, 1.98, 5.95, 0.6, PANEL2, round_=True, radius=0.06)
    rect(s, x, 1.98, 5.95, 0.05, c)
    text(s, x + 0.3, 2.1, 5.3, 0.4, [{"runs": [(ic + "  ", 15, c, True, F_BODY), (t, 14.5, WHITE, True, F_TITLE)]}])
    yy = 2.82
    for d, _ in items:
        rect(s, x + 0.32, yy, 0.06, 0.06, c)
        text(s, x + 0.5, yy - 0.06, 5.2, 0.82, [{"runs": [(d, 11.5, MUTED, False, F_BODY)], "ls": 1.12}])
        yy += 0.86

code_strip(s, "api/ai/night-gen/route.ts + socket", ["blend friends' taste profiles", "themed lineup + snacks + trivia", "auto-create watch-party room", "Socket.io sync: play/pause/seek"])
notes(s, "The most unique social AI: the Anime Night Planner fuses the taste profiles of a friend group into a themed watch lineup with snacks and trivia, then with one tap spins up a real Socket.io watch-party room — synced playback, voice, screen-share. AI Lab generates fan theories that the community then votes on, turning AI output into organic user content.")

# ----------------------------------------------------------------------------
# SLIDE 9 — PRACTICAL AI
# ----------------------------------------------------------------------------
s = base_slide(9)
header(s, 9, "Practical AI", "Filler that skips itself, searches that answer", GREEN)

pts = [
    ("Skip Filler", TEAL, "▸", "AI summarises the filler episode so you can skip it guilt-free — Indian-binge friendly."),
    ("AI-Augmented Search", PINK, "⌕", "Natural questions + semantic intents layered over the hardcoded AniList search index."),
    ("AI Mixer", VIOLET, "✎", "Cross-pollinates concepts — 'My Hero Academia but space horror' — into new recommendation mixes."),
    ("AI Search Covers", GOLD, "☰", "LLM judges + structured JSON fall back to classic search — graceful degradation when AI is off."),
]
for i, (t, c, ic, d) in enumerate(pts):
    r, cl = divmod(i, 2)
    x = 0.56 + cl * 6.28
    y = 1.98 + r * 1.72
    card = rect(s, x, y, 5.95, 1.58, PANEL, round_=True, radius=0.08)
    rect(s, x + 0.22, y + 0.2, 0.06, 0.5, c, round_=True, radius=0.5)
    text(s, x + 0.44, y + 0.18, 3.2, 0.4, [{"runs": [(ic + "  ", 13, c, True, F_BODY), (t, 13, WHITE, True, F_TITLE)]}])
    text(s, x + 0.44, y + 0.62, 5.2, 0.8, [{"runs": [(d, 11, MUTED, False, F_BODY)], "ls": 1.1}])
# right small strip
strip9 = rect(s, 0.56, 5.35, 12.21, 0.52, PANEL2, round_=True, radius=0.5)
shape_text(strip9, [{"runs": [("PATTERN  ➜  every feature = 1 type-safe endpoint  →  quota  →  cache  →  model  →  validated JSON  →  typed UI", 12.5, TEAL, True, F_MONO)], "align": PP_ALIGN.CENTER}])
code_strip(s, "api/ai/search · summarize-filler · mixer", ["summarize filler safely", "semantic intents over AniList", "JSON fallback when AI off"])
notes(s, "Practical, not just gimmick: Skip Filler summarizes filler arcs so users skip safely; AI search layers natural-language intents over the existing AniList index; the Mixer cross-pollinates genres; and everything degrades gracefully back to classic search when AI quotas are exhausted — enforcing one endpoint pattern end-to-end.")

# ----------------------------------------------------------------------------
# SLIDE 10 — RECOMMENDER ENGINE (AI WITHOUT THE LLM)
# ----------------------------------------------------------------------------
s = base_slide(10)
header(s, 10, "The AI That Doesn't Need the LLM", "Behavioral recommendation engine — src/lib/ai-recommender.ts", VIOLET)

# left: how it works
text(s, 0.56, 1.95, 6.0, 0.4, [{"runs": [("HOW IT SCORES", 13, TEAL, True, F_TITLE)]}])
steps = [
    ("Profile build", "Last 30 days of UserActivity → genres, viewed IDs, searches."),
    ("Cold-start seed", "New users get taste seeded from onboarding favoriteGenres."),
    ("Signal weighting", "Actions carry weight: view=3, add-to-list=5, click-rec=4, search=2…"),
    ("Time decay", "Older events shrink — score ∝ recency (1 − days/30, floor 0.1)."),
    ("Rank + reason", "Candidate scoring from genre / search / similarity → ranked list with reasons."),
]
yy = 2.42
for t, d in steps:
    rect(s, 0.56, yy, 6.3, 0.62, PANEL, round_=True, radius=0.14)
    rect(s, 0.62, yy + 0.09, 0.05, 0.44, TEAL, round_=True, radius=0.5)
    text(s, 0.92, yy + 0.07, 2.1, 0.45, [{"runs": [(t, 11, TEAL, True, F_MONO)], "ls": 1.0}], anchor=MSO_ANCHOR.MIDDLE)
    text(s, 3.0, yy + 0.06, 3.75, 0.5, [{"runs": [(d, 10, MUTED, False, F_BODY)], "ls": 1.05}], anchor=MSO_ANCHOR.MIDDLE)
    yy += 0.72

# right: weight table
rx = 7.15
text(s, rx, 1.95, 5.6, 0.4, [{"runs": [("ACTION WEIGHTS", 13, PINK, True, F_TITLE)]}])
rows = [("view_anime", "3"), ("add_to_list", "5"), ("click_recommendation", "4"),
        ("search", "2"), ("view_filler", "2"), ("view_character", "1.5")]
tbh = 0.5
ty = 2.42
th = rect(s, rx, ty, 5.62, tbh, PANEL2, round_=True, radius=0.2)
text(s, rx + 0.3, ty, 3.5, tbh, [{"runs": [("SIGNAL — USER ACTIVITY", 10.5, WHITE, True, F_MONO, False, 1.5)]}], anchor=MSO_ANCHOR.MIDDLE)
text(s, rx + 4.3, ty, 1.2, tbh, [{"runs": [("WT", 10.5, WHITE, True, F_MONO, False, 1.5)], "align": PP_ALIGN.RIGHT}], anchor=MSO_ANCHOR.MIDDLE)
ty += tbh + 0.04
for k, v in rows:
    rr = rect(s, rx, ty, 5.62, 0.46, PANEL, round_=True, radius=0.2)
    text(s, rx + 0.3, ty, 4.2, 0.46, [{"runs": [(k, 11, MUTED, False, F_MONO)]}], anchor=MSO_ANCHOR.MIDDLE)
    text(s, rx + 4.3, ty, 1.2, 0.46, [{"runs": [(v, 11.5, GOLD, True, F_MONO)], "align": PP_ALIGN.RIGHT}], anchor=MSO_ANCHOR.MIDDLE)
    ty += 0.5

code_strip(s, "ai-recommender.ts", ["Decay = max(0.1, 1 − days/30)", "genre weights seeded at onboarding", "rank = genre · search · similarity", "reason string per rec"])
notes(s, "Not all AI here is a language model. The recommender is a deterministic behavioral engine: it builds a 30-day activity profile, seeds cold-start users from onboarding favorite genres, weights actions (add-to-list is worth 5, a plain view 3), applies linear time-decay so old events fade, and ranks candidates by genre/search/similarity — returning each recommendation with a human-readable reason.")

# ----------------------------------------------------------------------------
# SLIDE 11 — SCALE & TRUST
# ----------------------------------------------------------------------------
s = base_slide(11)
header(s, 11, "Production Hardening", "Run at scale, sleep at night", PINK)

pts = [
    ("37 scrapers blocked", VIOLET, "🛡", "proxy.ts drops GPTBot, ClaudeBot, Perplexity & co — while Google & Bing crawl freely. Pages cached for anonymous traffic."),
    ("Multi-layer caching", TEAL, "▣", "AiCache (LLM), EPG cache, page cache — identical requests never touch upstream."),
    ("Load-tested", GREEN, "▲", "k6 load-test.js + burst variants validate traffic spikes against the custom Node server."),
    ("Monetization engine", GOLD, "¥", "Ads (impressions + clicks), Stripe Pro subs, merch, creator tips, affiliate links — sustainable at scale."),
]
cw = 5.95
gap = 0.33
for i, (t, c, ic, d) in enumerate(pts):
    r, cl = divmod(i, 2)
    x = 0.56 + cl * (cw + gap)
    y = 1.98 + r * 1.86
    card = rect(s, x, y, cw, 1.72, PANEL, round_=True, radius=0.08)
    rect(s, x + 0.2, y + 0.2, 0.06, 0.56, c, round_=True, radius=0.5)
    text(s, x + 0.44, y + 0.18, 4.6, 0.4, [{"runs": [(ic + "  ", 13, c, True, F_BODY), (t, 13.5, WHITE, True, F_TITLE)]}])
    text(s, x + 0.44, y + 0.62, 5.25, 0.95, [{"runs": [(d, 11, MUTED, False, F_BODY)], "ls": 1.12}])
code_strip(s, "src/proxy.ts", ["block: GPTBot · ClaudeBot · CCBot · PerplexityBot", "allow: Googlebot · Bingbot", "cache anonymous tourney pages"])
notes(s, "Show it's production-grade: proxy.ts blocks 37 known AI-training and spam scrapers while letting search engines through; caching happens at three layers; the server is load-tested with k6 (steady + burst); and the business model is real — ads, Stripe Pro, merch, tips, affiliate.")

# ----------------------------------------------------------------------------
# SLIDE 12 — CLOSING / DEMO
# ----------------------------------------------------------------------------
s = base_slide(12)
header(s, 12, "AI Isn't the Feature — It's the Engine", "ZyniVerse proves it: one pipeline, nine superpowers", PINK)

text(s, 0.56, 2.0, 12.2, 0.4, [{"runs": [("LIVE DEMO FLOW", 13, TEAL, True, F_TITLE, False, 2.0)]}])
flow = [("Zyni AI Chat", "ask anything", VIOLET),
        ("Screenshot Identify", "drop a frame", TEAL),
        ("Vibe Search", "type a mood", PINK),
        ("Night Planner", "invite friends", GOLD),
        ("Watch Party", "press play", GREEN)]
fx = 0.56
for i, (t, d, c) in enumerate(flow):
    card = rect(s, fx, 2.5, 2.2, 1.35, PANEL, round_=True, radius=0.12)
    rect(s, fx, 2.5, 2.2, 0.05, c)
    text(s, fx + 0.16, 2.66, 1.9, 0.55, [{"runs": [(t, 12, WHITE, True, F_TITLE)], "ls": 1.0}])
    text(s, fx + 0.16, 3.2, 1.9, 0.4, [{"runs": [(d, 9.5, MUTED, False, F_BODY)]}])
    if i < len(flow) - 1:
        text(s, fx + 2.26, 2.9, 0.28, 0.5, [{"runs": [("▸", 16, GOLD, True, F_BODY)]}])
    fx += 2.48

rect(s, 0.56, 4.3, 12.21, 1.05, PANEL2, round_=True, radius=0.1)
rect(s, 0.56, 4.3, 0.06, 1.05, VIOLET)
text(s, 0.95, 4.46, 11.4, 0.7, [{"runs": [("TAKEAWAY  —  ", 15, PINK, True, F_TITLE),
                                      ("A real community at 224+ pages and ~190 models, where one cost-controlled Gemini pipeline + a behavioral recommender give every user a personal anime universe — chat, identify, vibe, plan, watch.", 14, WHITE, False, F_BODY)], "ls": 1.2}])

text(s, 0.56, 5.72, 12.2, 0.75, [{"runs": [("THANK YOU · Q & A", 30, WHITE, True, F_TITLE)], "align": PP_ALIGN.CENTER}])
text(s, 0.56, 6.42, 12.2, 0.4, [{"runs": [("zyverse.in   ·   github.com <your-username>   ·   Let's argue about best girl after this", 12.5, MUTED, False, F_BODY)], "align": PP_ALIGN.CENTER}])
notes(s, "Close on the thesis: AI is the engine, not a feature — the entire product wraps a single cost-controlled pipeline plus a behavioral recommender. Then walk the demo path live: ask Zyni AI, drop a screenshot to identify, search by vibe, plan an anime night, and press play together. Thank judges and open Q&A. Mention zyverse.in.")

# ----------------------------------------------------------------------------
# brand bars on all existing slides (title slide has its own footer)
# ----------------------------------------------------------------------------
for i, sl in enumerate(prs.slides):
    if i == 0:
        continue
    brand(sl, i + 1)

OUT = r"C:\Users\Parth Gupta\Desktop\ZyniVerse\ZyniVerse_AI_Presentation.pptx"
prs.save(OUT)
print("SAVED:", OUT, "slides:", len(prs.slides._sldIdLst))