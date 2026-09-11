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

- `ZPassport-activity details` (program, `2210:16658`) — **implemented 2026-09-10** (`LessonPage`). Assets: hero from `lesson.photo_url`; Current Progress art reuses `more-analytics-chart.png` (identical MD5 to this capture's asset `004-3939_34660.png`). Coins art (`3939:34704`) still needs an SVG export.
- `ZPassport-activity details expand` (record, `2210:16986`) — **implemented 2026-09-10** (`LessonRecordPage`). Assets: `lesson-record-observed.png` (`006-3939_34554.png`) and `lesson-record-coach-note.png` (`007-3939_34593.png`); hero/moments from `record.photo_url`.

## Notes
- Dashboard (`/account/activity`) is unchanged per ADR-002 (already complete).
- Academic dashboard (`/account/academic/*`) reuses the same components/designs; build Activity first, then confirm parity.
- MCP is not wired into the agent toolset; these `.figmacapture` exports are the source of truth.
- Known non-blocking warnings: "Figma file version unavailable in plugin sandbox" (all), and one `1.03×` low-res asset in `details expand`.
- Repo ships Figma-derived CSS with no TSX consumer (`.more-info-*` in `zpassport.css`) — grep for an existing class family before appending new CSS.

---

# Capture Index — Companion pages (ADR-003)

Batch: `1109` · Captured 2026-09-11 · Tool: runkids/figma-to-prompt 0.2.7

| Frame (capture folder) | Node ID | Viewport | Route | Status |
|---|---|---|---|---|
| `Navigation` | `2605:22115` | 1440×64 | site nav bar (component) | captured; not a page — do not build as a route |
| `ZPassport-learning companion` | `2418:25310` | 1440×1956 | `/account/analytical-insight` | **spacing fixed 2026-09-11** (capture-exact: breadcrumb→hero 16, hero gap 20, title↔body 20, approach/respond row gaps 0/10, dividers #EBEBEB, sidebar 343 + content pad-right 80) |
| `ZPassport-learning companion (home)` | `2374:23143` | 1440×? | `/account` (CompanionHome) | **round-2 fixes 2026-09-11**: secondary-heading 18/590 #292929; reminder title 20/590, subtitle 13/590 teal, body 14/21 #5E5E5E; added "Learn how it works →" (14/590 teal, right-aligned, below footnote — plain text, no route yet). Card/CTA/typography otherwise matched capture. |
| `ZPassport-learning companion supporting page` | `2418:25566` | 1440×? | `/account/supporting-learning` | **round-2 fixes 2026-09-11**: hero art 225×285 (was 246), support art 226×291 flip=H (was 343×285 class), section text top-aligned (was centered) — "How You Can Support Them" raised; nav links 20/590 (was 14). |
| `ZPassport-academic` | `2046:30107` | 1440×? | `/account/academic` | **fixed 2026-09-11 round 5**: summary card 905 (gap 64, min-h 297), heading gap 32, description #222, records section 905/gap 30, per-date white cards (pad 16/32, rows gap 12), rows gap 10, title 20/510 #222, badge 14, authors 14/21 |
| `ZPassport-academic (more info)` | `3920:30062` | 1440×? | `/account/academic/more` | captured; matches shared RecordsMorePage components — parity confirmed, no structural diffs found |
| `ZPassport-academic details` | `2110:24935` | 1440×? | `/account/academic/lessons/[id]` | captured; mock shows "S3 Chinese Class" (mock-copy inconsistency, per 1009 lesson) — component parity confirmed |
| `ZPassport-academic details expand` | `2124:25840` | 1440×? | `/account/academic/lessons/[id]/records/[rid]` | captured; parity confirmed |

## Notes (1109)
- Frame `ZPassport-learning companion` includes full site chrome: nav, sidebar (343px, pad 32/0/32/80), content column (1033, pad 0/80/0/48), an **"Option 2" marketing CTA section** ("One Child. Every Perspective. One Platform.") and the site footer. The CTA section is NOT rendered by the current student shell — product decision pending, not built.
- `/account/supporting-learning` and `/account` (CompanionHome) have NO captures — spacing there follows the shared `.insight-*` / shell values fixed here (flagged assumption in FEEDBACK.md).
- Shell fixes from this capture (sidebar 343, main-content pad-right 80, divider #EBEBEB) apply to all account pages, including the 1009 dashboards — their 905px cards now sit in a 904px column (design intent).
