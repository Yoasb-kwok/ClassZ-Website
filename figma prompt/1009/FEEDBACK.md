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

## 2026-09-10 (round 4) — icons, title centring, time placement, chart

> "1. there are missing icon, use the new icon i add in teh icon folder / 2. scpaing problem: the name of teh program(chess program), should be in the middle / 3. wrong icon for lessons, date and time of leeson card in recentrecord, ive added new icon in the folder as well. / 4. the time placement is wrong in the lesson card. it should be to the right of the date / 5. the chart looks off, is it due to the data or the code of makeing it?"

- **asset-gap (resolved by user)**: programme-card coin illustration and the 16px record-meta icon were vectors not exported by the capture; user supplied `Group 2924.svg` and `menu-board.svg`. Now `public/images/lesson-help-coins.svg` + an inline `IconMenuBoard` (used for lesson/date/time per nodes `3939:34745`, `3920:33273`).
  - generalizes: Y — when a frame needs a VECTOR asset, ask for that node id up front rather than shipping a slot with no art.
- **agent-drift (text alignment)**: the capture omits `textAlignHorizontal` (null) on the page titles, and I read null as "left"; the design is centred (the repo's own `.lesson-title` CSS said `text-align: center`). Do not treat an absent alignment field as LEFT — check the repo CSS and ask.
  - generalizes: Y — absence of `textAlignHorizontal` is not evidence of left alignment; it may be dropped by the capture.
- **agent-drift (meta grouping)**: the record-row date+time line is `pa=space-between` in the capture, but the date group is a **fixed 155px column** (`3939:34756`) with the time starting directly after it — space-between pushed the time to the far edge. Read the child widths, not just the parent's alignment.
  - generalizes: Y — a parent's `space-between` says nothing about a fixed-width child; check each child's width.
- **agent-drift (chart framing + scale)**: my chart used level/4 from the baseline (so levels 3-4 filled most of the plot), drew only left/top borders (capture `3939:34621` "Outline" is a full 4-sided box), and cropped the area to the first/last point centres. Now levels 1..4 span the plot, the box is closed, and the area spans the full width.
  - generalizes: Y — for a chart, verify against the capture: (a) the plot outline (all four sides?), (b) how the data domain maps onto the plot, (c) whether the area spans the full width.

## 2026-09-11 — companion pages (uncaptured) — pose art swap

> "now the picture is off compare to the hero.png one, why is that?"
> "2, and the deatil are off for some reason"
> "it still look off, i can provide the orginal image on figma, would that help?"

- **asset-gap (resolved by user)**: the repo pose PNGs (`public/assets/learning-companion/<animal>/pose-NN.png`, 833×952 etc.) were wrong-crop exports — same characters as Figma but wider canvases (extra transparent padding). Contain-fitted into the 220×285 / 44:57 primary slot they letterboxed and the character rendered small: "details are off". User supplied Figma-original exports (`learning compansion new/ClassZ Rebrand (Mobile)(6)/`, front number N → pose-NN, 36 files); all 36 swapped in. Figma #1 is 235×305 = aspect 0.770 ≈ the 44:57 slot — the slot ratio was correct all along; the assets were not.
  - generalizes: Y — when page art "looks off but the box seems right", compare the shipped PNG's canvas aspect against the Figma node before touching CSS; wrong-crop exports survive every layout fix.
- **standing-decision**: companion pages shipped from the supervisor's update without a `.figmacapture`; per ADR-003 D4 the smoke test gates any rebuild. Frame capture still pending — geometry beyond the primary slot (secondary 125×158, insight/supporting pages) remains unverified against Figma.
  - generalizes: N — page-specific status.
- **caveat (declared)**: the new exports are 1x (235×305 for #1). Rendered at 220×285 CSS px they are fine on 1x displays, slightly soft on retina. If the user reports softness, ask for 2x re-export of the same nodes.

## 2026-09-11 (round 2) — companion pages visual check

> "1. on the /account page, the spacing between the main box and parent remainder is off / 2. on the /insight page. the rabbit pic of how they approach is mirrored / 3. on the /supporting thier learning page, the spcaing of Supporting Their Learning titile and How You Can Support Them is off, also the rabit on How You Can Support Them is also mirrored"

- **agent-drift (mirrored art, resolved)**: the design mirrors the approach-slot art so the animal faces the text (capture node 3948:36048 records `flip=H`; capture asset 007 faces left while rebrand export #2 / shipped pose-02 faces right). Added `.insight-illustration--approach .insight-section-image { transform: scaleX(-1) }` — fixes both the insight approach rabbit and the supporting page's "How You Can Support Them" rabbit (same class, same mirror, per user report).
  - generalizes: Y — side-illustrations in alternating sections are often flipped per-instance in Figma; check the capture node's flip/transform, and compare the capture asset against the shipped asset when a user says "mirrored".
- **agent-drift (unstyled divider, resolved)**: `.content-divider` (the `<hr>` between the learning card and the parent reminder on /account) had NO CSS rule anywhere — the gap was browser-default hr rendering. Styled to the system divider (1px #EBEBEB, 32px margins). Exact /account values pending its frame capture.
  - generalizes: Y — when a spacing complaint points at a specific seam, first check the seam's class actually HAS a rule; an unstyled hr masquerades as a spacing bug.
- **data-gap (pending)**: `/account` (CompanionHome) and `/account/supporting-learning` frames not yet captured — exact spacing for the reminder seam and the supporting hero→section seam awaits those exports.

## 2026-09-11 (round 3) — captures arrived for /account + supporting

> "1. on /accpunt page .Also reflected in their learning... font size is off, line spacing is 2 intead of 1 between parent remainder and mainbox. there supposed to be a how it work link(make it plain test for now) / 2. on the /insgiht page . the font size of back and Supporting Their Learning link → is off / 3. on /supporting page. the spacing is stilff off, How You Can Support Them should be higher. the font size of back to home and back is also off."

- **agent-drift (typography in rem guesses, resolved)**: home card typography was rem-based approximations. Capture-exact now: `.secondary-heading` 18/590 #292929 (was 0.95rem/600); reminder title 20/590, subtitle 13/590 teal, body 14/21 #5E5E5E (was 1rem/0.9rem/0.85rem mixes). Nav links `.insight-nav-link` 20/590 (was 14) — matches all four bottom-nav texts across insight + supporting captures.
  - generalizes: Y — pre-capture pages ship rem-guess typography; when the capture lands, sweep ALL text styles in the flagged region, not only the ones the user names.
- **agent-drift (supporting section alignment, resolved)**: "How You Can Support Them should be higher" = the text block is TOP-aligned in the design (row 3948:36052 has no counter-axis align = MIN) while I shipped align-items:center from the insight approach row (3948:36045 ca=center). Fixed via `.insight-page--supporting .insight-section--image-right { align-items: flex-start }` + hero art 225×285 + support art 226×291 (was sharing insight's 343×285).
  - generalizes: Y — same section class on sister pages can carry DIFFERENT per-page alignment; the walker's omitted `ca` field means Figma default (MIN/top), not center.
- **product-intent (new element)**: "Learn how it works →" added to /account primary content below the footnote (14/590 teal, right-aligned per node 2418:25548) as plain text per user instruction — no route yet.
  - generalizes: N — page-specific element.
- **note (divider seam)**: design file shows THREE stacked divider vectors between card and reminder (2916:19760 @925, 2418:25303 @957, 2398:25184 @989 — 32px apart) — a Figma copy artifact; shipped ONE divider at 32/32, the clean reading. User's "line spacing 2 instead of 1" most likely described the pre-fix browser-default hr (inset double-line); re-check after refresh.

## 2026-09-11 (round 4) — home page corrections (user check)

> "1. learn how it work shoul be to the left / 2. there should be 2 line spcaing on the top of parent remainder box, vector 41 and 42"

- **agent-drift (how-it-works alignment, resolved)**: I read node 2418:25548's `pa=max` as right-aligning the text — but pa=max aligned the full-width wrapper; the text inside sits LEFT. Reference PNG confirms left + underlined. Fixed: removed `align-self: flex-end`, added `text-decoration: underline`.
  - generalizes: Y — `pa`/`ca` on a wrapper describe the wrapper's children packing, not the text alignment inside a full-width child; check the deepest node holding the text.
- **standing-decision (double divider is intentional, resolved)**: user confirms TWO divider lines above the parent reminder (vectors 41+42) are intentional design, not a copy artifact. Second `<hr className="content-divider">` added. I had "corrected" it to one line — wrong call; the artifact judgment was mine, the design's repetition was deliberate.
  - generalizes: Y — do not "clean up" repeated elements in a capture as artifacts without asking; repetition can be the spec.

## 2026-09-11 (later) — supporting-learning spacing

> "the /learning supportae page apcing looks off, i have added the capture of this page so you can fix it"
> "i mean the ui, spacing of the page looks off, so figma-fidelity on this page"

- **data-gap (blocked)**: the supplied capture (`figma prompt/1109/Navigation.figmacapture`, node 2605:22115) is the **top navigation bar** (1440×64: logo, hamburger, Home/About Us/Programs/Workshops/ZPassport links) — not the supporting-learning page. No page frame exists in the capture library. Spacing fixes on `/account/supporting-learning` are blocked until a full-page frame export is supplied; per protocol I will not approximate page geometry from the nav frame.
  - generalizes: Y — a capture's frame NAME is not always its route; verify the frame content (walk the nodes, check text) against the target page before treating it as source of truth.
- **RESOLVED (same day)**: user supplied `ZPassport-learning_companion.figmacapture` (node 2418:25310, 1440×1956) — it is the **analytical-insight page** ("Understanding Your Child's Learning"), not supporting-learning; fixed against that frame. Captured geometry vs shipped CSS: breadcrumb→hero 16 (was 32), hero gap 20 (was 32), title↔body 20 (was 8), approach row gap 0 / respond row gap 10 (was 32), dividers #EBEBEB (was #e5e7eb), sidebar 343 + pad-right 0 (was 363/20), content col pad-right 80 (was 40). Shell-level fixes (sidebar width, main-content padding, divider colour) propagate to all account pages — including the 1009-built dashboards, whose 905px cards now sit in a 904px content column (was 944 with slack). Assumption flagged: `.insight-section-content` gap 20 and shell fixes applied to supporting-learning page without its own capture (shared component classes).
  - generalizes: Y — when a user says "spacing looks off" on a page built before captures existed, suspect the shell (sidebar width / content padding) as well as the page's own gaps; the shell was never capture-derived.
