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
