# UI Changes — 2408 Redesign Batch (Work Order)

Status: **Ready to execute** · Date: 2026-08-24 · Batch: `2408` (figma prompt captures)

Self-contained work order for the 2408 Figma redesign batch. Written for an agent with **zero prior context**. Read this file fully before touching code.

Batch scope (user decision 2026-08-24): new UX flow **Centre → program/workshop → detail**, **visual-only build** (no new API integrations). 8 fresh captures exist; 1 of 8 screens (Navigation) is already built. This doc orders the remaining 7, plus the centre-flow addenda W8–W10 (§6).

---

## 0. Ground rules (non-negotiable)

1. **Captures beat MCP.** Source of truth for every value that becomes CSS is `*.figmacapture/design/nodes.json`. Figma MCP (`get_figma_data`, file key `GmdFYzfDwKyURdqdeUnGx2`) drops `overflow`, `layoutGrow`, text heights, absolute positions — use it for orientation only. On conflict, the capture wins.
2. **Never read `nodes.json` directly** (hundreds of KB). Use the walker (§1). `--brief --id` for subtrees, `--list --depth N` for overviews, `--name` for lookups. Bare `--id` without `--brief` dumps raw JSON — avoid.
3. **Never round, never invent.** `304.73` stays `304.73`. No radius/shadow/border/spacing the spec doesn't state — absence is a decision. Omissions due to missing API data are fine; omissions by assumption are not (state them).
4. **`Option 2` promo frames are `visible: false` (HIDDEN) in all 8 captures** — verified 2026-08-24. Never build them.
5. **Footer**: `Below thingy` instances in captures are **intentionally ignored** — keep the existing `components/footer.tsx` everywhere (user decision 2026-08-24). The `Frame 2147236994` spacer (h 80) before it matches existing footer spacing — verify only, don't rebuild.
6. **Navbar is done.** `components/navbar.tsx` was rebuilt 2026-08-24 from node `2596:12215` (fidelity-diffed: logo-bar gap `19.94795036315918`, menu gap 39.9, hamburger 32×32 hit + 18.67×13.33 glyph, wordmark h 18.19, Log In weight 590, white→transparent 91% gradient, overflow-hidden). Every route already renders `<Navbar />`. Reuse as-is; do not restyle. The nav instances inside each capture (`2471:14636`, `2596:12331`, …) are the same component.
7. **Visual-only build**: placeholder/static data where no API field exists. Known API-blocked omissions carried from the 08-21 pass: language rows, ratings/review counts, strike-through price, similar-card star rating. Program imagery via `lib/program-images.ts` (2 photos + avatars); locations via `lib/locations.ts`.
8. **Strings** go through `locales/` `t()` (en + zh-TW). No hardcoded copy in components.
9. **Font**: SF Pro cannot be self-hosted → existing `-apple-system` stack. Declare any substitution as an acceptable delta.
10. **Validation gate**: `npm run lint` + editor diagnostics (`next.config.mjs` ignores TS errors during build, so build success proves nothing).
11. **Leave a trace**: above each JSX block derived from a node, comment the source — `/* node 1895:7700 — hero, pad 32/120 */`. Existing code already does this; keep it up.
12. **After each screen**: update the status table in `figma prompt/INDEX.md` (§2408 batch) and run the verification protocol (§4).

Responsive rules for spec-silent cases (1440 frame is the only spec): pin derived widths (`lg:w-[Xpx] lg:shrink-0`, never grow), cap page roots `lg:max-w-[1440px] mx-auto`, equal card grids via `grid-cols-[repeat(auto-fill,minmax(304.7px,304.73px))]`-style tolerances, no mobile restyling without a mobile frame — stack/scale by arithmetic and note the assumption.

## 1. Environment map

| What | Where |
|---|---|
| Website repo (work here) | `ClassZ-Website-main/` (Next.js 16, React 19, Tailwind v4 CSS-first tokens in `app/globals.css`) |
| Capture library | `figma prompt/2408/<Screen>.figmacapture/` — **outside the repo**, sibling of `ClassZ-Website-main/`. Ignore the `.zip` twins. |
| Capture index | `figma prompt/INDEX.md` (statuses, node IDs, history) |
| Walker tool | `python3 /Users/HP/.agents/skills/figma-fidelity/capture-walker.py` |
| Reference renders | `<capture>/references/001-<nodeid>.png` (full-frame, 1440 wide) |
| Figma file | `GmdFYzfDwKyURdqdeUnGx2`, canvas *Website*, desktop 1440 |
| Terminal cwd for walker | `/Users/HP/Desktop/work relted/classz website` |

Walker examples (paths contain spaces — keep the quotes):

```sh
# section overview of a capture
python3 /Users/HP/.agents/skills/figma-fidelity/capture-walker.py "figma prompt/2408/Centre_View.figmacapture/design/nodes.json" --list --depth 2

# extraction checklist for one subtree (sizing/grow, aligns, 4 paddings, fills×opacity, overflow, text metrics, HIDDEN flag)
python3 /Users/HP/.agents/skills/figma-fidelity/capture-walker.py "figma prompt/2408/Centre_View.figmacapture/design/nodes.json" --brief --id 2471:15171 --depth 3

# find a node by layer name
python3 /Users/HP/.agents/skills/figma-fidelity/capture-walker.py "figma prompt/2408/workshop.figmacapture/design/nodes.json" --name "Drop Down"
```

Pre-styling checklist per node (run mechanically, extraction depth is not a judgment call): per-child `layout.sizing` + `layoutGrow`/`layoutAlign` (siblings are NOT interchangeable), all four paddings, `primaryAxisAlign`/`counterAxisAlign`, fills **× fill alpha × node opacity**, `relativeTransform` chains for flipped/rotated icons (nested flips cancel; layer names lie), `visible` on every ancestor, text fontSize/weight exact + line-height = node height ÷ fontSize + `textStyleRanges`, `overflow`/`clipsContent`, strokes/effects or their verified absence.

All 8 captures verified fresh 2026-08-24 (`manifest.json` → `capturedAt` 03:24–03:54 UTC). Arithmetic-check every layout before declaring done (child widths + gaps + paddings = parent width, etc.).

## 2. Shared page skeleton (all 7 screens)

Capture structure per screen: `Navigation` → content frame(s) → `Option 2` (HIDDEN, skip) → spacer `Frame 2147236994` (h 80, verify only) → `Below thingy` (skip, existing Footer). So each screen = `<Navbar />` + content + existing `<Footer />`.

## 3. Work orders (execute in this order)

### W1 — Landing Page update

- Capture: `figma prompt/2408/Landing_Page.figmacapture` · Frame `2346:21370` · captured 03:54 (**30 min after the others — the frame changed today; treat every section as suspect**)
- Route/files: `/` → `components/programs/landing-page.tsx` (built 2026-08-21 from the same frame — sections carry `/* node */` comments)
- Top sections: `2346:21398` (moments collage, see `2346:21399`), `2346:21450`, **`3963:36089` (NEW — not in the 08-21 build; INDEX describes it as a "shadowed-card section")**, `2346:21507`, hidden `2346:21564`, spacer `2346:21576`
- Tasks:
  1. `--brief` each section subtree; diff against the 08-21-derived code; fix drift (expect changes — fresh capture postdates the build).
  2. Build `3963:36089` from scratch: full checklist extraction, spec comments, exact values. It sits between `2346:21450` and `2346:21507`.
  3. Confirm nav renders `<Navbar />` (it does — verify unchanged), footer = existing.
- Done when: all sections re-diffed, new section built, arithmetic checks pass, screenshot diff vs `references/` at 1440 reviewed.

### W2 — Programs detail re-diff

- Capture: `figma prompt/2408/Programs_-_more_details.figmacapture` · Frame `1895:7672` (captured 03:25, frame updated since the 08-21 pass)
- Route/files: `/programs/[id]` → `components/programs/program-detail.tsx`, `components/programs/class-option-card.tsx`
- Already-specced nodes in code (from comments): hero `1895:7700`; gallery `2652:24302/03/05/24/27`; right col `1895:7713/714/720/725/726(omitted)/737`; hosted-by `2652:24202/04`; options strip `1895:7745` (+thumb `1895:7904`); similar `2834:18822/23/26/75`; option-card rows `1981:7553/61/81/94`
- Capture top structure: `1895:7700` (hero block) + `2834:18822` (similar block) — matches code; **diff every specced node subtree vs capture, fix drift.** Watch for NEW nodes inside subtrees (IDs prefixed `26xx–39xx` = newer additions; investigate any not present in code comments).

### W3 — Programs detail (expand) state

- Capture: `figma prompt/2408/Programs_-_more_details_(expand).figmacapture` · Frame `3879:19020`
- Same page, one element expanded. Mirror mapping: `3879:19048`↔`1895:7700`, `3879:19119`↔`2834:18822`
- Tasks: `--brief` both captures' subtrees and diff node-by-node to isolate the expanded element(s). Likely candidate (unverified): the options strip / "Show full dates" (`1981:7594` in `class-option-card.tsx`) expanding to a full date list — **verify from the captures, do not assume**. Implement as an interactive state on `/programs/[id]` (collapsed default = W2 layout; expanded = this capture).

### W4 — Workshop listing fidelity pass

- Capture: `figma prompt/2408/workshop.figmacapture` · Frame `1988:7449`
- Route/files: `/workshops` → `components/programs/discovery-page.tsx` (variant=workshop), `discovery-listing.tsx`, `workshop-card.tsx` (built 08-21, fidelity pass never ran)
- Top structure: Navigation → **`1988:7477` "Drop Down"** → `3743:19747` (listing body) → hidden `1988:7810` → spacer → footer
- Tasks:
  1. Extract `1988:7477` fully — a "Drop Down" element not present in the programs listing; determine role (sort/filter?) and build exactly.
  2. Full fidelity diff of `3743:19747` vs `discovery-listing.tsx` workshop variant + `workshop-card.tsx` (grid, gaps, paddings, card internals).

### W5 — Workshop details (new route)

- Capture: `figma prompt/2408/workshop_-_more_details.figmacapture` · Frame `1988:7824` — **never built**
- Proposed route: `app/workshops/[id]/page.tsx` (mirror `app/programs/[id]/`)
- Top structure: `3873:18835` (detail hero; children `3873:18836`/`3873:18849` mirror the program hero sub-frames `…7027`/`…7023`) + `2834:19101` (similar block — **same node ID as in the Programs-expand capture, i.e. literally the same section; reuse, don't rebuild**)
- Tasks: extract both subtrees; reuse `program-detail.tsx` patterns/components; implement workshop-specific deltas exactly; placeholder data per §0.7.

### W6 — Centre View (new route)

- Capture: `figma prompt/2408/Centre_View.figmacapture` · Frame `2471:14635` — **never built**
- Route (locked D1): `app/centres/[id]/page.tsx` — single centre route; W7's programs state lives on this same route
- Known geometry (root, from capture + MCP orientation — re-verify in capture): root column, `alignItems: center`, gap 32, fill #FFFFFF; content wrapper `2471:15170` = pad-top 32, gap 64, h 4356.82, horizontal fill
- Sections: `2471:15171` (pad 0/80, primary-axis end, counter center, gap 10) · `2471:15183` (pad 0/120, gap 32) · `3757:21579` (gap 32)
- Tasks: full checklist extraction per section → build with spec comments → placeholder centre data → arithmetic checks.

### W7 — Centre profile-programs

- Capture: `figma prompt/2408/Centre_profile-programs.figmacapture` · Frame `2568:10769` — **never built**
- Route (locked D1): programs state of W6's `/centres/[id]` route — tab or `?tab=programs`, pick one and note it in `figma prompt/INDEX.md`
- Top structure: Navigation `2596:12215` → content `3757:21406` = **`3872:18635` "Drop Down"** + `2568:10811`
- Tasks: extract both; the Drop Down likely matches W4's pattern — diff the two (`1988:7477` vs `3872:18635`) and share a component if identical; build listing per capture.

## 4. Verification protocol (per screen)

1. `npm run lint` clean + Zed diagnostics clean for touched files.
2. Arithmetic layout checks (§0/§1) written into the PR/commit notes.
3. Screenshot at exactly 1440 × frame height; compare vs `<capture>/references/001-<nodeid>.png`. Never claim visual verification from code inspection — report what was verified (geometry, extracted values, DOM) and what needs eyes.
4. Acceptable deltas to declare, not fix: live/placeholder text vs mock copy, `-apple-system` vs SF Pro, API-blocked omissions (§0.7).
5. Update `figma prompt/INDEX.md` (status + date + one-line result).

## 5. Locked decisions (user, 2026-08-24)

- **D1** Centre routes: single route `/centres/[id]`; W7's programs state lives on the same route (tab or `?tab=programs`).
- **D2** Centre data: pure placeholder data (visual-only batch; no `ClassZ-api-main` wiring for centres).
- **D3** W3 expand: interactive toggle on `/programs/[id]` (collapsed default = W2 layout; expanded state = capture `3879:19020`).
- **D4** Payment version (user 2026-08-24: "newest"): **v3 `2511:26543`**. W9 stays blocked until v3 + Payment-successful `2031:8286` are exported (§6.3).
- **D5** Centre listing (user 2026-08-24: "the centre listing is actually the program frame"): `/centres` is built from the **Programs listing frame `1582:16181`** (`2208/Programs.figmacapture`, captured 2026-08-21 — staleness-check before W8). Cards = centre placeholders (D2) linking → `/centres/[id]`.

## 6. Centre flow plan (finalized 2026-08-24 — user-directed mapping, not a drawn flow)

User's intended UX: **centre page → centre detail → select program → program/class detail → expand state → enroll → payment**. This exact flow is not drawn as a connected flow in Figma; the mapping below is user-directed onto existing frames. Both open decisions were resolved the same day: centre listing = Programs frame (D5), payment = v3 (D4). **Only the payment captures are still missing.**

### 6.1 Flow map — materials check

| Step | Route | Frame / capture | Status |
|---|---|---|---|
| Centre listing | `/centres` | **D5: the centre listing IS the Programs listing frame** `1582:16181` (captured 2026-08-21, `2208/Programs.figmacapture` — staleness-check before build) | W8 planned — **unblocked** |
| Centre detail | `/centres/[id]` | Centre View `2471:14635` · `2408/Centre_View.figmacapture` | W6 planned — capture ready |
| Select program (centre's programs) | `/centres/[id]` programs state (D1) | Centre profile-programs `2568:10769` · `2408/Centre_profile-programs.figmacapture` | W7 planned — capture ready |
| Program/class detail | `/programs/[id]` | `1895:7672` · `2408/Programs_-_more_details.figmacapture` | **W2 built 2026-08-24** |
| Expand state | `/programs/[id]` | `3879:19020` · `2408/Programs_-_more_details_(expand).figmacapture` | W3 planned — capture ready |
| Enroll → Payment | `/payment` | Payment v3 `2511:26543` (**D4: confirmed current**) — **NOT captured anywhere** | ⚠️ blocked on capture (§6.3) |
| Payment success | success state of `/payment` | `2031:8286` — **NOT captured anywhere** | ⚠️ blocked on capture (§6.3) |

Bottom line: steps 1–5 all have capture bases and are ordered (W8, W6, W7, W2 built, W3). Steps 6–7 (payment) are the only gap — blocked on the §6.3 exports.

### 6.2 Payment frames — MCP orientation only (lossy; NOT for styling)

From `get_figma_data` on Payment v3 `2511:26543` (file `GmdFYzfDwKyURdqdeUnGx2`, canvas Website): Navigation `2597:12535` (40×40 avatar at x1376,y23 — logged-in variant of the navbar) → content `2511:26571` (pad-y 32, gap 64; header row `2662:24351` pad-x 80 gap 10; body `3999:5176` pad-x 120 gap 64) → spacer h80 → Below thingy (ignored per §0.5). Related frames found: Payment-successful `2031:8286` · Promote code `2511:25194` + modal `2611:23699` · Add payment modal `2804:18164` (w500, r24) · transaction option `2673:30577` · component set "Booking for-selection" `2032:18429` (571×354 — likely the booking summary panel on the payment page).

Per §0.1 these values are orientation only — nothing here becomes CSS until a capture exists.

### 6.3 Needed from user before payment work (STOP — do not approximate)

Export via the figma-to-prompt plugin into `figma prompt/2408/` (each frame = one `.figmacapture` folder):

1. **Payment v3 — node `2511:26543`** (**confirmed current**, D4)
2. **Payment successful — node `2031:8286`**
3. Optional, only if these interactions are in scope: Promote code `2511:25194` (and modal `2611:23699`), Add payment `2804:18164`, Booking for-selection component set `2032:18429`.

### 6.4 Decisions (resolved 2026-08-24)

- **Payment version → v3 `2511:26543`** (user: "newest") — locked as **D4**. Export still required (§6.3) before W9 starts.
- **Centre listing → the Programs frame `1582:16181`** (user: "the centre listing is actually the program frame") — locked as **D5**; W8 unblocked.
- **Standing caution** — canvas "Website redesign" `4012:7086` was active 2026-08-24 13:09 (landing `4012:10512`, About Us `4016:10613`, new Below-thingy `4039:23598`). If dedicated centre-flow or payment frames appear there, a designed frame beats this mapping — re-check when W9's exports are requested.

### 6.5 New work items (extend §3 order)

- **W8 — `/centres` centre listing** — **unblocked (D5)**. Clone the discovery-page chrome from `/programs`, swap card data for centre placeholders (D2), link cards → `/centres/[id]`. Capture basis = Programs listing `1582:16181` (`2208/Programs.figmacapture`) — check its `manifest.json` `capturedAt` against any designer changes first; re-export if stale. Cards are centre placeholders on a program-frame design — declare that basis in INDEX.
- **W9 — `/payment` + success state** — blocked on §6.3 captures (version already decided: v3, D4). Visual-only (D2-style placeholders for booking summary). Entry point = Enroll button on `/programs/[id]` → `/payment`. Follows W3 (enroll button lives in the expand/options area).
- **W10 — flow wiring** (after W6/W7): centre-detail program cards link → `/programs/[id]`; Enroll → `/payment`. Navbar (final, user decision 2026-08-24): **no separate "Centres" link** — the "Programs" link goes to `/centres` (the centre list, D5) and stays active on `/programs/*` too (match prefix), restoring the captured 4-item nav (2596:12227) + ZPassport.

Execution order: **W3 → W4 → W5 → W6 → W7 → W8** (W8 last so `/centres` cards don't dead-link; it has no other dependency). **W9** slots in whenever the §6.3 exports land; **W10** (flow wiring) last.
