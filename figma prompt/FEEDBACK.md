# Feedback Log

Append-only verbatim quotes from user checks, classified with the shared
taxonomy (agent-drift · data-gap · stale-capture · asset-gap ·
product-intent · standing-decision). Only `generalizes: Y` items graduate
into the lessons log / skill at end of session.

---

## 2026-10-03 — Schedule page (0310 `Schedule` capture)

- "the size of the lesson card on the right is wrong, check figma" →
  investigated: rendered card matched the capture exactly (361×169,
  image 93×113). Real issue was below-lg stretching (fixed with a cap),
  plus two rounds of follow-ups below. · **generalizes: N**
- "still to small and visibke overlap in 4, make it larger" →
  **product-intent** — user enlarges the session card beyond the capture
  (361×169 → 440×205, internals scaled ~1.2×, card gap 28px). User
  feedback overrides the capture. · **generalizes: Y** — when a user
  judges a spec-exact element "wrong", check viewport behaviour first,
  then treat further size feedback as product-intent, not drift.
- "make it more light in color" (weekend day numbers) → capture fill was
  #666666 **with opacity 0.5**; initial build used the solid colour.
  · **agent-drift** — I read `color` but missed `fills[].opacity`.
  **generalizes: Y** — extraction checklist: honour both colour AND
  fill opacity.
- "i cannot see the border of the card clearly" → capture shadow is
  black 12% / offsetY 6 / blur 16; initial build used 8%.
  · **agent-drift** — effects weren't checked against the capture.
  **generalizes: Y** — extraction checklist: verify `effects`, not just
  fills/strokes; and remember adjacent shadows overlap when card gaps
  are smaller than the blur radius.
- "the left and right border of each card is still overlapping" →
  added a 1px #EBEBEB ring to the session cards (capture has no stroke)
  and widened gaps to 28px. · **product-intent** — a crisp border line
  beats shadow-only boundaries when the user repeatedly can't see the
  card edge. **generalizes: Y** — on white-on-white UIs, pair soft
  shadows with a hairline ring.
