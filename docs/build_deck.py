from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.util import Inches, Pt

# ── Brand colours ──────────────────────────────────────────────────────────────
DARK    = RGBColor(0x02, 0x06, 0x17)   # #020617 slate-950
ORANGE  = RGBColor(0xF9, 0x73, 0x16)   # #F97316 trace-accent
WHITE   = RGBColor(0xFF, 0xFF, 0xFF)
OFFWHITE= RGBColor(0xF9, 0xF6, 0xF0)   # #F9F6F0 trace-surface
MUTED   = RGBColor(0x94, 0xA3, 0xB8)   # slate-400

W = Inches(13.33)   # widescreen 16:9
H = Inches(7.5)

prs = Presentation()
prs.slide_width  = W
prs.slide_height = H

blank = prs.slide_layouts[6]  # completely blank

# ── Helper: add solid-fill rectangle ─────────────────────────────────────────
def rect(slide, x, y, w, h, color):
    shape = slide.shapes.add_shape(1, x, y, w, h)  # MSO_SHAPE_TYPE.RECTANGLE=1
    shape.fill.solid()
    shape.fill.fore_color.rgb = color
    shape.line.fill.background()
    return shape

# ── Helper: add textbox ───────────────────────────────────────────────────────
def tb(slide, text, x, y, w, h,
       size=24, bold=False, color=WHITE, align=PP_ALIGN.LEFT,
       italic=False, wrap=True):
    txb = slide.shapes.add_textbox(x, y, w, h)
    txb.word_wrap = wrap
    tf = txb.text_frame
    tf.word_wrap = wrap
    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = color
    run.font.name = 'Calibri'
    return txb

# ── Helper: multi-paragraph textbox ──────────────────────────────────────────
def tb_lines(slide, lines, x, y, w, h, align=PP_ALIGN.LEFT):
    """lines = list of (text, size, bold, color)"""
    txb = slide.shapes.add_textbox(x, y, w, h)
    txb.word_wrap = True
    tf = txb.text_frame
    tf.word_wrap = True
    for i, (text, size, bold, color) in enumerate(lines):
        p = tf.paragraphs[i] if i == 0 else tf.add_paragraph()
        p.alignment = align
        run = p.add_run()
        run.text = text
        run.font.size = Pt(size)
        run.font.bold = bold
        run.font.color.rgb = color
        run.font.name = 'Calibri'
    return txb

# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 1 — TITLE
# ══════════════════════════════════════════════════════════════════════════════
s1 = prs.slides.add_slide(blank)

# Full dark background
rect(s1, 0, 0, W, H, DARK)

# Left orange accent bar (thin vertical stripe)
rect(s1, Inches(0.6), Inches(1.6), Inches(0.06), Inches(4.3), ORANGE)

# Wordmark "TRACE"
tb(s1, 'TRACE', Inches(0.85), Inches(1.5), Inches(8), Inches(2.2),
   size=96, bold=True, color=WHITE)

# Tagline
tb(s1, 'Economic Identity for the Invisible',
   Inches(0.88), Inches(3.55), Inches(9), Inches(0.8),
   size=26, bold=False, color=ORANGE)

# Description line
tb(s1, 'Connecting informal traders & gig workers to the economy they power.',
   Inches(0.88), Inches(4.25), Inches(9), Inches(0.7),
   size=16, bold=False, color=MUTED)

# Bottom divider line
rect(s1, Inches(0.6), Inches(6.4), Inches(12.1), Inches(0.03), ORANGE)

# Bottom: hackathon label (left) + challenge label (right)
tb(s1, 'Squad Hackathon 3.0',
   Inches(0.6), Inches(6.55), Inches(5), Inches(0.5),
   size=13, bold=False, color=MUTED)

tb(s1, 'Challenge 02  ·  Smart Systems: The Intelligent Economy',
   Inches(0.6), Inches(6.55), Inches(12.1), Inches(0.5),
   size=13, bold=False, color=MUTED, align=PP_ALIGN.RIGHT)

# Right side: large decorative "O" ring (circle outline suggestion via overlapping rects)
# Use a large circle shape
ring_outer = s1.shapes.add_shape(9, Inches(9.8), Inches(0.6), Inches(3.5), Inches(3.5))  # 9=OVAL
ring_outer.fill.background()
ring_outer.line.color.rgb = ORANGE
ring_outer.line.width = Pt(1.5)

ring_inner = s1.shapes.add_shape(9, Inches(10.3), Inches(1.1), Inches(2.5), Inches(2.5))
ring_inner.fill.background()
ring_inner.line.color.rgb = RGBColor(0x10, 0x18, 0x30)
ring_inner.line.width = Pt(18)

# Dot accent
dot = s1.shapes.add_shape(9, Inches(11.1), Inches(4.5), Inches(0.25), Inches(0.25))
dot.fill.solid()
dot.fill.fore_color.rgb = ORANGE
dot.line.fill.background()


# ══════════════════════════════════════════════════════════════════════════════
# SLIDE 2 — PROBLEM
# ══════════════════════════════════════════════════════════════════════════════
s2 = prs.slides.add_slide(blank)

# Background
rect(s2, 0, 0, W, H, DARK)

# Top-left section label
tb(s2, '01  —  PROBLEM', Inches(0.6), Inches(0.45), Inches(6), Inches(0.4),
   size=11, bold=True, color=ORANGE)

# Headline
tb_lines(s2, [
    ('70% Work.', 54, True, WHITE),
    ('None of it Counts.', 54, True, ORANGE),
], Inches(0.6), Inches(0.9), Inches(9), Inches(2.1))

# Subheadline
tb(s2,
   'Across sub-Saharan Africa, millions sustain families through informal trade — '
   'yet they are invisible to banks, lenders, and the systems that could empower them.',
   Inches(0.6), Inches(2.85), Inches(8.2), Inches(1.0),
   size=15, bold=False, color=MUTED)

# ── Three stat cards ──────────────────────────────────────────────────────────
CARD_Y   = Inches(4.05)
CARD_H   = Inches(2.7)
CARD_W   = Inches(3.7)
GAP      = Inches(0.28)
CARD_X1  = Inches(0.6)
CARD_X2  = CARD_X1 + CARD_W + GAP
CARD_X3  = CARD_X2 + CARD_W + GAP

CARD_BG  = RGBColor(0x0c, 0x15, 0x2a)   # slightly lighter dark

for cx in [CARD_X1, CARD_X2, CARD_X3]:
    rect(s2, cx, CARD_Y, CARD_W, CARD_H, CARD_BG)
    # orange top accent
    rect(s2, cx, CARD_Y, CARD_W, Inches(0.04), ORANGE)

# Card 1 — Employment stat
tb(s2, '70%',  CARD_X1 + Inches(0.25), CARD_Y + Inches(0.35), Inches(3.2), Inches(0.9),
   size=52, bold=True, color=ORANGE)
tb(s2, 'of employment in sub-Saharan Africa\ncomes from the informal economy',
   CARD_X1 + Inches(0.25), CARD_Y + Inches(1.2), Inches(3.2), Inches(1.2),
   size=13, bold=False, color=MUTED)

# Card 2 — Financial exclusion
tb(s2, '0',    CARD_X2 + Inches(0.25), CARD_Y + Inches(0.35), Inches(3.2), Inches(0.9),
   size=52, bold=True, color=ORANGE)
tb(s2, 'credit score  ·  0 loan history\n0 financial identity to show banks',
   CARD_X2 + Inches(0.25), CARD_Y + Inches(1.2), Inches(3.2), Inches(1.2),
   size=13, bold=False, color=MUTED)

# Card 3 — Scale
tb(s2, '$17.6B', CARD_X3 + Inches(0.25), CARD_Y + Inches(0.35), Inches(3.2), Inches(0.9),
   size=40, bold=True, color=ORANGE)
tb(s2, 'in informal cross-border trade in\nSADC alone — uncounted, unserved',
   CARD_X3 + Inches(0.25), CARD_Y + Inches(1.2), Inches(3.2), Inches(1.2),
   size=13, bold=False, color=MUTED)

# Right: pain-point list (vertical)
PB_X = Inches(0.6)
PB_Y = Inches(3.5)
bullets = [
    '✦  No verifiable identity  →  no access to credit or formal financial services',
    '✦  No job-matching infrastructure  →  skills go undiscovered, opportunities go unfilled',
    '✦  Cash-only transactions  →  no transaction history, no trust signals, no safety',
]
# Already covered by stat cards; add a thin right-side decorative element instead

# Right-side decorative ring
ring2 = s2.shapes.add_shape(9, Inches(10.5), Inches(0.3), Inches(2.6), Inches(2.6))
ring2.fill.background()
ring2.line.color.rgb = RGBColor(0x1e, 0x2d, 0x4a)
ring2.line.width = Pt(22)

# Source footnote
tb(s2, 'Source: Global Initiative · SADC Informal Trade Report',
   Inches(0.6), Inches(7.1), Inches(8), Inches(0.35),
   size=9, bold=False, color=RGBColor(0x44, 0x55, 0x70))

# ── Save ──────────────────────────────────────────────────────────────────────
out = r'c:\Users\USER\Desktop\squad-hackathon\docs\Trace_Pitch_Deck.pptx'
prs.save(out)
print(f'Saved: {out}')
