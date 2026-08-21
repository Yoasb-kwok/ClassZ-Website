# Figma Fidelity Workflow — Implementation Notes

Record of how we turn Figma frames into code with exact values, what went wrong
along the way, and the rules that prevent it from going wrong again. Companion
skill: `~/.agents/skills/figma-fidelity/` (guardrails + `capture-walker.py`).
Capture library: `figma prompt/` (outside the repo — never commit captures).

## The problem this solves

Early builds "looked similar but not exactly the same" as Figma. Diagnosis
found two distinct failure modes, which need different fixes:

1. **Agent drift** — rounding exact values (`304.73` → `305`), inventing
   properties the spec never had (a card shadow that Figma does not contain),
   or copying a sibling's layout values onto another child.
2. **MCP data loss** — the Figma MCP `get_figma_data` returns a simplified
   tree: it drops `overflow`, instance-level `layoutGrow` overrides
   (templatizes siblings onto each other), text node heights (line-heights
   unknowable), absolute child x/y, and **silently drops hidden nodes**.

Consequence: **MCP is for orientation. Captures are for values.** When they
conflict, the capture wins.

## Data hierarchy

| Source | Trust | Use for |
|---|---|---|
| `.figmacapture/design/nodes.json` | source of truth | every value that becomes CSS |
| `.figmacapture/references/*.png` | visual truth | final comparison |
| `.figmacapture/assets/*.png` | asset truth | image fills, icons — may be incomplete |
| `.figmacapture/manifest.json` | metadata | `capturedAt` → staleness check |
| MCP `get_figma_data` | lossy | frame names, node IDs, tree shape only |

## The loop (per frame)

1. **Orient** — MCP `get_figma_data` on the frame: names, IDs, neighbors.
2. **Verify captures** — capture exists for the frame AND `manifest.json`
   `capturedAt` postdates the last design change. Missing/stale → STOP, ask
   the user to export with the figma-to-prompt plugin. Never approximate from
   MCP. Also check `visible` on frames — `visible: false` frames are not built
   (real case: "Option 2" promo `1895:7962` exists in the REST tree but is
   hidden in Figma).
3. **Extract** — `capture-walker.py` (`--brief`, `--id`, `--name`, `--depth`)
   on target nodes. Never `read_file` whole `nodes.json` (outline mode, wasted
   context).
4. **Implement** — exact values with arbitrary Tailwind px classes
   (`w-[304.73px]`, `gap-[10.93px]`); leave a node-id comment above each
   block, e.g. `/* node 1981:7770 — 605×236.5, pad 16, r12, NO shadow */`.
5. **Arithmetic-check** — children + gaps + paddings must equal parent
   dimensions before touching styling. If the math fails, a mapping is wrong;
   go back to `nodes.json`. When stated gap contradicts child positions, run
   the math on both: the version that sums exactly is the design intent
   (real case: similar strip states `gap=18.82` but children sit at 0/440/880
   → 3×400+2×40=1280 exactly → effective gap is 40).
6. **Verify** — lint, tests, DOM measurement at viewport 1440 comparing
   `getBoundingClientRect()` against capture values. Screenshot pixel-diff vs
   `references/*.png` still needs the user's plugin Verify checker (manual).
7. **Record** — update `figma prompt/INDEX.md` (status, omissions, capturedAt).

## Mappings that keep biting

| Figma | CSS | Notes from this project |
|---|---|---|
| `sizing: fill` per child | `flex-1` per child | MCP templatizes siblings: sidebar was coded 225px, capture said `layoutGrow` → 337.8px. Read each child's own `layout`. |
| LINE, `vertical: fill`, rot −90 | `w-px self-stretch bg-[#B0B0B0]` | never hardcode the parent's height |
| fill alpha × node opacity | two-layer mapping | filter pills: fill `rgba(10,186,181,0.3)` PLUS `opacity-80` on the node |
| `overflow: hidden` + fixed parent height | `overflow-hidden` + max-h | options strip: two 236.5px cards inside 376.92px col with 8px thumb scrollbar `#C1C1C1` |
| hidden frame (`visible: false`) | do not build | MCP and REST inventories still list it |
| desktop 1440 frame | `lg:`+ classes | never silently restyle mobile without a mobile frame |
| `primaryAxisAlign: space-between` | `justify-between` + `lg:gap-0` | stated `itemSpacing` (e.g. 64) is only a MINIMUM in Figma space-between; computed gap was 15 (120+530+15+655+120=1440 ✓). CSS is the same: an explicit `gap-8` floors the spacing and a fixed-width child then SHRINKS (638 instead of 655). Zero the responsive gap and add `shrink-0`. |

## Deviations policy (data-blocked omissions)

"Keep omitting until the API catches up" — but every omission must be
explicit, not silent:

- Omit in code with a comment naming the missing field
  (e.g. `/* rating omitted — no public endpoint */`).
- Record it in `figma prompt/INDEX.md` under the frame's status.
- Current standing omissions on the detail page: language rows, ratings,
  review counts, gallery images, host avatar image, classmate avatar stack,
  "$399" strike-through price (API has single `price` only).

## Tooling notes

- Walker: `python3 ~/.agents/skills/figma-fidelity/capture-walker.py "figma prompt/<Frame>.figmacapture/design/nodes.json" --id <id> --depth N --brief`
- Measurement: temp `measure.mjs` using `@playwright/test` chromium at
  viewport 1440, `getBoundingClientRect`, assert vs capture, delete after.
  This is how the listing pass was verified (sidebar 337.8 / grid 1102.2 /
  card 304.73 exact).
- `download_figma_images` (MCP) returns uncropped originals (e.g. 4096×2731) —
  compress before use: `sips -Z 1200 in.png --out in.jpg -s format jpeg`.
- Tailwind: `font-[weight:590]` (unambiguous); keep explicit px arbitrary
  values even when the linter suggests shorthand — traceability to the capture
  beats brevity; `rounded-[4px]` not `rounded-lg`.

## Lessons log

- MCP sibling templatization caused the biggest layout misses (sidebar width,
  option card widths 375 vs 392.5).
- Hidden `visible:false` frames: caught only because the capture carries the
  flag and MCP doesn't — always cross-check frame lists.
- Figma names lie ("star / price" frames hold location rows); trust geometry,
  not names.
- Stated gap ≠ computed gap under space-between: trust child x-positions
  once the arithmetic sums to the parent width (hero 15px, similar strip 40px).
- Walker `--brief` prints the stated `itemSpacing`; when arithmetic fails, dump
  the raw node (`--id` without `--brief`) and read `primaryAxisAlign`.
- Same-named components differ across frames: the "similar" card is NOT the
  listing card scaled — capture says no radius, no shadow. Never reuse a
  component's styling between frames without checking that frame's capture.
- edit_file fuzzy matching broke JSX once — keep `old_text` complete and
  re-read after structural edits.
- **Never `git checkout -- <path>` on files with uncommitted work.** It ran on
  `locales/*.json` and destroyed all uncommitted Block A+B locale sections —
  git had never seen them, so no reflog/stash/blob could recover them. To
  discard a *bad edit* to a file that also contains *good uncommitted work*:
  `git stash push -- <paths>` first, or fix with targeted edits. To restore a
  file's uncommitted content after a mistaken checkout: stop immediately and
  reconstruct from durable evidence (e2e assertions, capture TEXT nodes,
  earlier terminal output) — verbatim where evidence exists, flagged
  best-effort where not. Re-run the test suite as recovery evidence.
- **Locale JSON edits: surgical python insert, never a full-dump rewrite.**
  `json.dump` with the wrong `indent` silently reformats 2,000+ line files
  (the mistake that triggered the checkout). Correct format here: 4-space
  indent, `ensure_ascii=False`, trailing newline. Verify with
  `git diff -- locales/` — a clean diff shows only the intended keys.
- **Reconstructed locale keys need test coverage.** `nav.terms` was
  reconstructed as "Terms"; e2e expected "Terms & Conditions" (footer renders
  `t("nav.terms")`). Green e2e on key-bearing strings is the recovery
  evidence — when a reconstruction is unverifiable, flag it to the user
  instead of assuming it matches.
- Navbar keys are array-driven (`key: "nav.home"` + `t(key)`) — a `t("...")`
  regex audit misses them; audit the key arrays too.
- **Instance `fills=[]` means "inherits from component default", not "no
  fill".** When the component set isn't in any capture (e.g. arrow buttons
  `1595:16500`), chrome presence is unknowable from JSON — verify against
  the reference render. Technique (no PIL/pixelmatch needed): `sips -c H W
  --cropOffset Y X reference.png` + `sips -s format bmp` + parse raw BMP
  pixels in python (`struct`); count non-white pixels in the element's box
  (an 11px-tall content band inside a 35px button ⇒ bare icon, no circle).
- **Never infer alignment from node order.** The landing arrows row read as
  "left-aligned sub-frame" but `primaryAxisAlign: max` puts it at the right
  edge (render confirmed x≈1291–1348). Also the third space-between case:
  cards row `align: space-between` with stated gap 18.82 → actual 40 by
  positions (0/440/880). Always read `primaryAxisAlign` + child positions,
  and prefer a DOM measurement after building.
- **Section paddings differ within one page.** Landing card sections are
  pad 80 (content 1280) while ZPassport/Advantages are pad 120 — don't copy
  a sibling section's padding. This shrank cards to ~373px even where the
  variant was right.
- **Derived widths must be pinned, not grown.** A Figma sidebar width like
  337.8 (= 1440 − 1102.2) is only exact AT the frame width; implementing it
  as `lg:grow` made the sidebar↔card gap drift 47↔152px at non-1440
  viewports. Pin it (`lg:w-[337.8px] lg:shrink-0`) and cap the page content
  (`lg:max-w-[1440px] mx-auto` on a block-level root).
- **Never put `mx-auto` on a child of `flex flex-col` to center/cap it.**
  Auto cross-axis margins on flex items override `stretch` and size the item
  to fit-content (observed: the whole sidebar+cards row collapsed to ~700px
  and centered). Put the cap on a block-level wrapper instead.
- **`min-[…]px:` arbitrary variants did not override named `lg:` utilities in
  Tailwind v4 here** (empirically 1-col at 1440; layer-aware CSS introspection
  was inconclusive in dev). Prefer breakpoint-free arithmetic: `grid-cols-
  [repeat(auto-fill,minmax(min,max))]` with a tiny min-tolerance
  (304.7/304.73) — subpixel layout (337.8 renders as 337.8125) makes exact
  equalities fail by ~0.003px: `floor((974.1875+30)/334.73) = 2`, not 3.
- **Read DOM dumps before declaring failure.** A verify script reported
  "cols: 2, lastCardRight 690" which looked wrong — actually 3 columns with
  the 4th card wrapped to row 2 (right edge of col 1). Verify scripts must
  count distinct column x positions, not row tops, and dump per-card boxes
  when the summary looks impossible.
- **Icon direction: decode `relativeTransform` chains, don't trust names.**
  The design's region chevrons are all named `vuesax/linear/arrow-down`, but
  the icon FRAME carries `[[1,0],[0,-1]]` (vertical flip) and the chevron
  VECTOR *inside* sometimes carries its own `[[1,0,2.72],[0,-1,10.7]]` flip.
  Nested flips cancel: frame-flip-only = up, frame+vector flip = down.
  On the Place filter this meant collapsed = down / expanded = up — the
  opposite of what the icon name suggested, and the code had it inverted.
  Rule: compute the net transform product down the ancestor chain before
  choosing a rotation class.

## Backlog

- Pixel-diff screenshots against `references/*.png` (blocked: no pixelmatch/
  Pillow; use the plugin's Verify AI checker manually).
- Walker `--brief`: show fill opacity to make alpha mapping mechanical.
- Reusable `e2e/geometry.spec.ts` instead of throwaway measure scripts.
- Define re-export triggers (design-change notification → new capture).
