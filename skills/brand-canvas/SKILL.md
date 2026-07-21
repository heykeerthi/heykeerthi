---
name: brand-canvas
description: >
  Capture any brand's visual identity as a reusable design-token file, then
  generate consistently on-brand creative against it — social graphics, banners,
  event assets, deck slides, OG images — as production-ready HTML/SVG. Use when
  the user wants creative assets "in our brand", asks to "set up brand tokens",
  gives brand guidelines to apply, or asks for repeatable on-brand design
  output for any company.
---

# Brand Canvas

A creative canvas for any brand, in two phases: **capture** the brand once as
a token file, then **generate** unlimited on-brand assets from it. The point is
consistency at speed — every asset generated months apart should look like the
same designer made it on the same day.

Built by a marketer: the deliverable is always a shippable asset, not a
mood board.

## Phase 1 — Capture the brand (once per brand)

Sources, in order of authority:
1. Official brand guidelines (PDF/page) if provided
2. The brand's website — extract computed styles, not screenshots-by-eye
3. Recent social creative — for the brand's *practiced* style, which often
   drifts from the written guidelines; note the drift and ask which to follow

Produce `brand/<name>.tokens.json`:

```json
{
  "brand": "Acme",
  "color": {
    "ground": "#0B0E14",
    "surface": "#151A24",
    "ink": "#F4F6FA",
    "ink_soft": "#9AA3B2",
    "accent": "#4C8DFF",
    "accent_2": "#F0973E",
    "semantic": { "positive": "#2FBF71", "negative": "#E5484D" }
  },
  "type": {
    "display": { "family": "…", "weight": 700, "tracking": "-0.02em", "case": "sentence" },
    "body":    { "family": "…", "weight": 400 },
    "data":    { "family": "…", "mono": true }
  },
  "shape": { "radius": "12px", "border": "1px solid rgba(255,255,255,0.08)" },
  "texture": "e.g. subtle grain, gradient mesh, flat — one phrase",
  "logo": { "clearspace": "1x logo height", "min_size": "24px", "dont": ["never on accent", "never rotated"] },
  "voice_on_asset": { "register": "e.g. confident, spare", "max_words_headline": 7 },
  "motifs": ["recurring visual devices: grid lines, orbital rings, coin motif…"],
  "never": ["hard rules: no emoji, no drop shadows, no purple…"]
}
```

Rules:
- Every color is a hex actually sampled from source material — no inventions.
- `never` is as important as the rest; ask the user "what should this brand
  never look like?" if guidelines don't say.
- If tokens for the brand already exist in the project, load and use them —
  never re-derive from scratch (drift kills consistency).

## Phase 2 — Generate assets

Every asset request resolves to: **template × tokens × content**.

### Built-in templates

| Template | Size | Use |
|---|---|---|
| `announcement` | 1600×900 | Product/partnership news, X posts |
| `stat-card` | 1080×1080 | One big number + caption |
| `quote-card` | 1080×1080 | Founder/press quote |
| `thread-header` | 1500×500 | X banner / article header |
| `event-card` | 1600×900 | Date, venue, speakers, CTA |
| `og-image` | 1200×630 | Link previews |
| `story` | 1080×1920 | Stories/Reels static |
| `deck-slide` | 1920×1080 | Title or section slide |

### Generation rules

- Output is a single self-contained HTML file per asset (inline CSS, fonts
  referenced or embedded, no external requests) sized exactly to spec — ready
  for headless-browser screenshot to PNG. Offer the screenshot command.
- All colors, type, radii, spacing come from the token file. If a value isn't
  in tokens, derive it from one that is (e.g. `surface` = `ground` lightened
  8%) and record the derivation back into the token file.
- Typography: headline within `max_words_headline`; data/numbers set in the
  `data` face with tabular numerals.
- Respect every entry in `never` without being asked twice.
- One asset, one message. If the content has two messages, produce two assets
  and say why.

### Consistency check (before delivering)

- [ ] Zero colors outside the token palette (check gradients too)
- [ ] Logo clearspace and `dont` rules respected
- [ ] Headline word count within limit; no orphaned single word on a line
- [ ] Contrast: text ≥ 4.5:1 against its ground
- [ ] Would this sit next to the brand's last 10 posts without looking adopted?

## Multi-brand discipline

Tokens are namespaced per brand. Never blend token files. When the user
switches brands mid-session, state which token file is now active. This is
what makes the canvas work as an agency-style system — any brand in, on-brand
assets out.
