# Figma Capture Index — Activity Dashboard (ADR-002)

Batch: `1009` · Captured 2026-09-10 · Tool: runkids/figma-to-prompt 0.2.7

| Frame (capture folder) | Node ID | Viewport | Route | ADR-002 items |
|---|---|---|---|---|
| `ZPassport-activity (more info)` | `3920:32148` | 1440×2459 | `/account/activity/more` | 1–4 |
| `ZPassport-activity details` | `2210:16658` | 1440×3740 | `/account/activity/lessons/[id]` | 5–14 |
| `ZPassport-activity details expand` | `2210:16986` | 1440×2931 | `/account/activity/lessons/[id]/records/[rid]` | 15–24 |

## Status
- `ZPassport-activity (more info)` — **implemented 2026-09-10** (`RecordsMorePage`, capture-exact rebuild). Illustrations: trophy/apple reused from `public/images/activity-summary-trophy.png` / `academic-summary-apple.png`; chart from capture asset (`more-analytics-chart.png`); the two open-box vectors are the user-supplied Figma SVG exports in `1009/icon/` → `public/images/more-differences-box.svg` (`Group(1).svg`, node 3939:34977) and `more-help-box.svg` (`Group.svg`, node 3939:35076).
- `ZPassport-activity details` / `details expand` — not yet built.

## Notes
- Dashboard (`/account/activity`) is unchanged per ADR-002 (already complete).
- Academic dashboard (`/account/academic/*`) reuses the same components/designs; build Activity first, then confirm parity.
- MCP is not wired into the agent toolset; these `.figmacapture` exports are the source of truth.
- Known non-blocking warnings: "Figma file version unavailable in plugin sandbox" (all), and one `1.03×` low-res asset in `details expand`.
- Repo ships Figma-derived CSS with no TSX consumer (`.more-info-*` in `zpassport.css`) — grep for an existing class family before appending new CSS.
