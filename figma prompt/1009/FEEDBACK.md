# Figma Fidelity — User Feedback Log

Append-only. Verbatim quotes. Classified per taxonomy: agent-drift · data-gap · stale-capture · asset-gap · product-intent · standing-decision.
Only `generalizes: Y` items graduate to lessons at end of a check session.

---

## 2026-09-10 — /account/activity/more (calibration frame check)

> "the sapcing, font size, is off, also there should picture on right side as well"

- **agent-drift**: The implemented page used a self-invented simpler design (820px cards, 18px radius, 15px titles, light shadows) instead of the repo's existing capture-derived `.more-info-*` CSS (905px cards, 24px radius, 22px/510 titles, 14/590 badge, 0 6px 16px shadow). Spacing + font-size mismatch follows directly.
  - generalizes: Y — before appending new CSS for a route, grep `zpassport.css` for an existing class family for that page; the repo ships Figma-derived CSS that may have no committed TSX consumer.
- **asset-gap / agent-drift**: Illustrations on the right side of cards (apple 170×170 on overview, tablet on strengths, chart, button) exist in CSS but were not rendered because no TSX consumed the classes. Asset `public/images/academic-summary-apple.png` exists; tablet/chart/button images need verification against capture assets.
  - generalizes: Y — "picture on right side" is part of the card layout spec (content left 504px, illustration right), not decoration.

### Follow-up findings while fixing (2026-09-10, same session)

- **stale-capture (CSS predating current capture)**: The orphan `.more-info-*` CSS had `subsection-title 16/590` but the current capture says `18/510` (node 3939:34951); breadcrumb margin 32 vs actual 48 (breadcrumb bottom y46 → card top y94); badge is UNDER the title (column, gap 8), not a right-aligned pill. Capture re-extracted; CSS rewritten to node-exact values.
  - generalizes: Y — never trust repo CSS as capture-accurate without re-walking the current capture; verify typography and position per node.
- **agent-drift (badge state rename)**: D2 renamed statuses to Early/Emerging/Established, but `zpassport.css` still had `--consistent` badge classes while the API now sends `statusType: 'established'` → dashboard badges rendered unstyled. Renamed the three `--consistent` rules to `--established`.
  - generalizes: Y — when a state machine is renamed in ADR decisions, grep BOTH the status strings and the CSS class suffixes derived from them.

## 2026-09-10 (round 2) — /more icons + AI-gated help card

> "the icon of What Seems to Help Across Programmes and Differences Across Programmes is off, i have made a icon folder, use the icon there instaed, the spacing is correct, but inted of Short verbal prompt, just tell teh user they need to wiat for ai to generate. internally please make a log if 5 record is eastablid but ai ouput is not recived."

- **agent-drift / asset-gap (resolved by user asset)**: I had cropped the two vector illustrations from the reference PNG; user judged them "off" and supplied proper Figma SVG exports in `figma prompt/1009/icon/` (`Group.svg` = node 3939:35076 help; `Group(1).svg` = node 3939:34977 differences — identified by the filter IDs embedded in each SVG). Now served from `public/images/more-{help,differences}-box.svg`; cropped PNGs deleted.
  - generalizes: Y — **never substitute a raster crop for a vector illustration**; ask the user to export the vector node as SVG (Figma filter IDs identify the source node).
- **product-intent (D1 refinement)**: The *What Seems to Help Across Programmes* card must not display the deterministic `help_across_programs` labels (e.g. "Short verbal prompt"); it is AI-gated and shows a wait-for-AI message until `narrative_json.sections.what_helps_across_programmes` exists (≥5 records) or the records wait state (<5). Recorded as an ADR-002 D1 amendment.
  - generalizes: N — product decision specific to this card.
- **product-intent (new diagnostic)**: `getPassport` now logs `[zpassport] profile=… records=… (>= 5) but AI output not received — report=…` when the record threshold is met but `narrative_json.sections` is empty. Verified live: fired with sections cleared, silent once restored.
  - generalizes: N — feature request.

## 2026-09-10 (round 3) — program + lesson-record pages

> "now do the remaining page"

Built both remaining frames. Findings worth generalizing:

- **data-gap (capture cannot carry vectors)**: the program page's progress-chart area and the coins illustration are Figma vectors whose path data is absent from the `.figmacapture` export; the details fallback SVG is flat (36MB, no node IDs). Charts must therefore be data-driven; illustrations must be re-exported by the user.
  - generalizes: Y — before promising a vector illustration, check `assets/`; if it is a VECTOR node it will **not** be there.
- **stale-capture / mock-copy inconsistency**: the same `details expand` frame says "Guitar Program" in the title but "S3 Chinese Class" in the breadcrumb and record rows, and shows an "Early observations" badge for a program the other capture labels "3 Records · Consistent pattern". Mock copy in these frames is not self-consistent; the ADR state machines win.
  - generalizes: Y — do not reconcile mock copy across frames; reconcile against the data model.
- **agent-drift (self-caught)**: I first built Hosted-by and the chart as separate 48px-gap siblings; node `3939:34595` has them in one section with gap 0. Caught by re-checking node hierarchy, not by the CSS class names (which suggested the wrong nesting before).
  - generalizes: Y — verify section grouping from the capture's frame nesting, never from existing CSS class structure.
