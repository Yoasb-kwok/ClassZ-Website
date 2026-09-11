# Pixel-perfect Figma rebuild: Navigation

## Guidelines
- Reproduce this component with **pixel-perfect visual fidelity** using the JSON spec below
- Use semantic HTML elements
- The JSON contains the full node tree with layout, style, and children
- Preserve JSON child order as paint order unless the parent has `layout.itemReverseZIndex: true`; normally later siblings render above earlier siblings
- Preserve `style.fills` and `style.strokes` paint-stack order when present; convenience fields like `backgroundColor` and `imageFillHash` only summarize the first renderable paints
- Preserve `textStyleRanges` when present; node-level text style is only the common/default style
- Preserve `reactions` as the interaction contract; implement every trigger/action in order instead of inferring behavior from pixels or node names
- Preserve `prototype` scrolling, fixed-layer, and overlay settings; these behaviors cannot be recovered from the reference PNG
- Use `componentPropertyDefinitions` as the component's typed public API and `componentPropertyDetails` as the active instance values; do not coerce booleans to strings
- Preserve `annotations`, `componentPropertyReferences`, `variableBindings`, `explicitVariableModes`, and `referencedVariables` as developer-authored contracts; use the catalog's per-mode values and code syntax for prototype state
- `layout.mode`: horizontal → flex row, vertical → flex column
- `layout.wrap: wrap` → `flex-wrap: wrap`; preserve wrapped-track spacing/alignment
- `layout.mode: grid` → CSS Grid with exact tracks, gaps, anchors, and spans
- `layout.mode: none` → position children by `layout.x/y` relative to the parent
- `layout.layoutPositioning: absolute` → remove from parent flex flow and position by `layout.x/y`
- `layout.sizing`: hug → auto, fill → 100%/flex:1, fixed → explicit px
- Normalize the selected root frame to left: 0, top: 0; root `layout.x/y` is Figma canvas position
- Use `box-sizing: border-box` so width/height include padding and borders
- `style.variables` → use as CSS custom properties
- INSTANCE nodes → reusable sub-components, import or stub them

## Design Tokens
### Colors
- `#222222` (border)
- `#222222` (border)
- `#0ABAB5` (background)
- `#0ABAB5` (background)
- `#222222` (text)
- `#222222` (text)
### Typography
- SF Pro 400 16px
- SF Pro 590 16px
### Gradients
- `linear-gradient(#FFFFFF 0%, #FFFFFF 100%)`
### Spacing & Radii
- Spacing scale: 5.33px, 8px, 9.97px, 10px, 19.95px, 24px, 32px, 39.9px, 48px, 221.42px
- Border radii: 750px

## Interaction Contract
Implement these Figma prototype settings and reactions explicitly. Preserve scrolling, fixed layers, overlay behavior, trigger/action order, and transitions; do not infer a different behavior from appearance or node names.
- `Navigation` (`2605:22115`) prototype settings: `{"overflowDirection":"none","overlayPositionType":"center","overlayBackground":{"type":"NONE"},"overlayBackgroundInteraction":"none"}`
- `Navigation > Logo bar` (`2605:22116`) prototype settings: `{"overflowDirection":"none","overlayPositionType":"center","overlayBackground":{"type":"NONE"},"overlayBackgroundInteraction":"none"}`
- `Navigation > Logo bar > Hamburger menu` (`2605:22117`) prototype settings: `{"overflowDirection":"none","overlayPositionType":"center","overlayBackground":{"type":"NONE"},"overlayBackgroundInteraction":"none"}`
- `Navigation > Logo bar > Hamburger menu > Menu / Hamburger_MD` (`2605:22118`) prototype settings: `{"overflowDirection":"none","overlayPositionType":"center","overlayBackground":{"type":"NONE"},"overlayBackgroundInteraction":"none"}`
- `Navigation > Logo bar > Frame 2147224368` (`2605:22119`) prototype settings: `{"overflowDirection":"none","overlayPositionType":"center","overlayBackground":{"type":"NONE"},"overlayBackgroundInteraction":"none"}`
- `Navigation > Selection` (`2605:22126`) prototype settings: `{"overflowDirection":"none","overlayPositionType":"center","overlayBackground":{"type":"NONE"},"overlayBackgroundInteraction":"none"}`
- `Navigation > Selection > menu` (`2605:22127`) prototype settings: `{"overflowDirection":"none","overlayPositionType":"center","overlayBackground":{"type":"NONE"},"overlayBackgroundInteraction":"none"}`
- `Navigation > Selection > menu > Frame 2147237002` (`2605:22128`) prototype settings: `{"overflowDirection":"none","overlayPositionType":"center","overlayBackground":{"type":"NONE"},"overlayBackgroundInteraction":"none"}`
- `Navigation > Selection > menu > Frame 2147237004` (`2605:22131`) prototype settings: `{"overflowDirection":"none","overlayPositionType":"center","overlayBackground":{"type":"NONE"},"overlayBackgroundInteraction":"none"}`
- `Navigation > Selection > menu > Frame 2147237001` (`2605:22134`) prototype settings: `{"overflowDirection":"none","overlayPositionType":"center","overlayBackground":{"type":"NONE"},"overlayBackgroundInteraction":"none"}`
- `Navigation > Selection > menu > Frame 2147237001 > Programs` (`2605:22135`): trigger `{"type":"ON_CLICK"}`; actions `[{"type":"NODE","destinationId":"1582:16181","navigation":"NAVIGATE","transition":null,"resetVideoPosition":false}]`
- `Navigation > Selection > menu > Frame 2147237003` (`2605:22137`) prototype settings: `{"overflowDirection":"none","overlayPositionType":"center","overlayBackground":{"type":"NONE"},"overlayBackgroundInteraction":"none"}`
- `Navigation > Selection > menu > Frame 2147237003` (`2605:22137`): trigger `{"type":"ON_CLICK"}`; actions `[{"type":"NODE","destinationId":"1988:7449","navigation":"NAVIGATE","transition":null,"resetVideoPosition":false}]`
- `Navigation > Selection > menu > Frame 2147237005` (`2816:18333`) prototype settings: `{"overflowDirection":"none","overlayPositionType":"center","overlayBackground":{"type":"NONE"},"overlayBackgroundInteraction":"none"}`
- `Navigation > Selection > menu > Frame 2147237005` (`2816:18333`): trigger `{"type":"ON_CLICK"}`; actions `[{"type":"NODE","destinationId":"1988:7449","navigation":"NAVIGATE","transition":null,"resetVideoPosition":false}]`
- `Navigation > Selection > Contact Us` (`2605:22140`) prototype settings: `{"overflowDirection":"none","overlayPositionType":"center","overlayBackground":{"type":"NONE"},"overlayBackgroundInteraction":"none"}`
- `Navigation > Selection > Contact Us > Log In` (`2605:22141`): trigger `{"type":"ON_CLICK"}`; actions `[{"type":"NODE","destinationId":"1743:7317","navigation":"NAVIGATE","transition":null,"resetVideoPosition":false}]`
- `Navigation > Frame 2147223938` (`2605:22142`) prototype settings: `{"overflowDirection":"none","overlayPositionType":"center","overlayBackground":{"type":"NONE"},"overlayBackgroundInteraction":"none"}`
- `Navigation > Frame 2147223938` (`2605:22142`): trigger `{"type":"ON_CLICK"}`; actions `[{"type":"NODE","destinationId":"2046:30693","navigation":"NAVIGATE","transition":null,"resetVideoPosition":false}]`

## Fidelity Risk Summary
- Estimated risk: high (32 visible nodes, max depth 4)
- Layout risks: 1 absolute-positioned auto-layout children, 7 clipped containers, 30 nodes with constraints, 4 nodes with target aspect ratio
- Asset risks: 1 image fills, 1 image fills with crop/filter/opacity metadata, 3 vector-like nodes
- Paint risks: 1 gradients, 32 nodes with layer blend mode, 2 nodes with detailed stroke metadata

## Geometry Checklist
Use these absolute boxes after normalizing the selected root to left 0, top 0. They are derived from `layout.x/y` and help catch drift before styling polish.
### Bounding Boxes
- Navigation [FRAME]: left 0, top 0, width 1440, height 64, signals: root/clips
- Navigation > Logo bar [FRAME]: left 24, top 32, width 172.61, height 32, signals: top-level/clips
- Navigation > Logo bar > Hamburger menu [FRAME]: left 24, top 32, width 32, height 32, signals: clips
- Navigation > Logo bar > Hamburger menu > Menu / Hamburger_MD [INSTANCE]: left 24, top 32, width 32, height 32, signals: component
- Navigation > Logo bar > Hamburger menu > Menu / Hamburger_MD > Vector [VECTOR]: left 30.67, top 41.33, width 18.67, height 13.33, signals: vector
- Navigation > Logo bar > Frame 2147224368 [FRAME]: left 75.95, top 32, width 120.67, height 32
- Navigation > Logo bar > Frame 2147224368 > Group 797 [GROUP]: left 83.95, top 32, width 26.67, height 32
- Navigation > Logo bar > Frame 2147224368 > Group 797 > Ellipse 543 [ELLIPSE]: left 92.63, top 32.02, width 6.08, height 6.08
- Navigation > Logo bar > Frame 2147224368 > Group 797 > Ellipse 544 [ELLIPSE]: left 112.54, top 57.92, width 6.08, height 6.08
- Navigation > Logo bar > Frame 2147224368 > Group 797 > Subtract [VECTOR]: left 91.95, top 32, width 26.64, height 32, signals: vector
- Navigation > Logo bar > Frame 2147224368 > Group 798 [GROUP]: left 118.62, top 38.9, width 70, height 18.19
- Navigation > Logo bar > Frame 2147224368 > Group 798 > Vector [VECTOR]: left 161.29, top 45.8, width 70, height 18.19, signals: vector
- Navigation > Selection [FRAME]: left 809.42, top 33.5, width 606.58, height 29, signals: top-level/clips
- Navigation > Selection > menu [FRAME]: left 809.42, top 33.5, width 510.58, height 29, signals: clips
- Navigation > Selection > menu > Frame 2147237002 [FRAME]: left 809.42, top 33.5, width 45, height 29
- Navigation > Selection > menu > Frame 2147237002 > Home [TEXT]: left 809.42, top 33.5, width 45, height 19
- Navigation > Selection > menu > Frame 2147237002 > Line 4 [LINE]: left 809.42, top 62.5, width 45, height 0
- Navigation > Selection > menu > Frame 2147237004 [FRAME]: left 894.32, top 33.5, width 70, height 29
- Navigation > Selection > menu > Frame 2147237004 > About Us [TEXT]: left 894.32, top 33.5, width 70, height 19
- Navigation > Selection > menu > Frame 2147237004 > Line 4 [LINE]: left 894.32, top 62.5, width 70, height 0
- Navigation > Selection > menu > Frame 2147237001 [FRAME]: left 1004.21, top 33.5, width 73, height 29
- Navigation > Selection > menu > Frame 2147237001 > Programs [TEXT]: left 1004.21, top 33.5, width 73, height 19
- Navigation > Selection > menu > Frame 2147237001 > Line 4 [LINE]: left 1004.21, top 62.5, width 73, height 0
- Navigation > Selection > menu > Frame 2147237003 [FRAME]: left 1117.11, top 33.5, width 85, height 29
- Navigation > Selection > menu > Frame 2147237003 > Workshops [TEXT]: left 1117.11, top 33.5, width 85, height 19
- Navigation > Selection > menu > Frame 2147237003 > Line 4 [LINE]: left 1117.11, top 62.5, width 85, height 0
- Navigation > Selection > menu > Frame 2147237005 [FRAME]: left 1242, top 33.5, width 78, height 29
- Navigation > Selection > menu > Frame 2147237005 > ZPassport [TEXT]: left 1242, top 33.5, width 78, height 19
- Navigation > Selection > menu > Frame 2147237005 > Line 4 [LINE]: left 1242, top 62.5, width 78, height 0, signals: vector
- Navigation > Selection > Contact Us [FRAME]: left 1368, top 33.5, width 48, height 29, signals: clips
- Navigation > Selection > Contact Us > Log In [TEXT]: left 1368, top 33.5, width 48, height 19
- Navigation > Frame 2147223938 [FRAME]: left 1376, top 23, width 40, height 40, positioning absolute, signals: top-level/absolute/clips/image

## Assets
Image files included with this spec — use as `<img>` or CSS `background-image`:
- `Navigation_Frame_2147223938.png` → Frame 2147223938 (40×40, fill, scaling 0.5, transform [[1,0,0],[0,1,0]])

## Pixel Perfect Template
You are rebuilding this Figma frame for an exact visual match. Treat the JSON as geometry/style data and the reference image/assets as visual evidence.

### Required Inputs
- JSON component structure below.
- If a whole-frame reference image is supplied separately, use it as the visual source of truth.
- Use every listed exported image file exactly; if any required asset is missing, stop and ask for it.

### Render Target
- Build one exact 1440×64 frame.
- Set `html, body { margin: 0; }` and global `box-sizing: border-box`.
- Normalize the selected root frame to `left: 0; top: 0`; root `layout.x/y` is only Figma canvas position.

### Verification Loop
1. Implement the frame at the exact target size.
2. Capture a lossless PNG screenshot at that same size; do not use JPEG/WebP compression.
3. Compare it against the reference image; give the screenshot to the user for Figma to Prompt's built-in **Verify AI screenshot** checker.
4. If the checker reports a non-zero diff, download its correction ZIP and use reference.png, candidate.png, visual-diff.png, and verification.json to fix position, size, color, typography, image crop, vector geometry, and z-order.
5. Repeat until the screenshot is visually indistinguishable.

Do not approximate missing images, icons, logos, or text. If a required path or asset cannot be loaded, stop and ask for the correct input.

## Implementation Checks
- Build against one exact 1440×64 viewport with `html, body { margin: 0; }` and global `box-sizing: border-box`.
- Screenshot comparison against the reference render is required; do not declare completion from code inspection alone.
- For text, set explicit `font-size`, `font-weight`, `line-height`, and CSS `letter-spacing`; convert percent letter spacing to px from the font size.
- For mixed text, use `textStyleRanges` to split spans and preserve range-level fills, styles, links, and paragraph/list metadata.
- For `layout.mode: none`, position children from their `layout.x/y` offsets relative to the parent.
- `layout.wrap: wrap` → `flex-wrap: wrap`; use `counterAxisSpacing` as the wrapped-track gap and preserve `counterAxisAlignContent`.
- `layout.mode: grid` → CSS Grid; map row/column counts, gaps, track sizes, anchors, spans, and `gridChildHorizontalAlign/gridChildVerticalAlign` exactly.
- Apply `layout.minWidth/maxWidth/minHeight/maxHeight` as CSS size bounds without replacing the extracted fixed target size.
- Preserve `layout.relativeTransform` for rotation/skew; use `layout.x/y` as the containing-parent offset and avoid applying translation twice.
- `layout.renderBounds` is the effect/stroke-inclusive box relative to the regular node box; use its offset and size when positioning a rendered fallback or checking visual overflow.
- For `layout.layoutPositioning: absolute`, remove that node from the parent flex flow and position it by `layout.x/y` even when the parent uses auto layout.
- `layout.itemReverseZIndex: true` reverses sibling paint order; otherwise later JSON siblings paint above earlier siblings.
- Preserve `style.textAlignVertical` inside fixed text boxes and map `style.textAutoResize` to wrapping/intrinsic sizing behavior.
- `style.textTruncation: ending` requires an ellipsis; combine it with `style.maxLines` using deterministic line clamping.
- Preserve `style.textDecorationStyle`, offset, thickness, color, and skip-ink behavior; a plain underline is not equivalent to a wavy or dotted decoration.
- Preserve the exact font face from `style.fontStyleName`, map `style.openTypeFeatures` to `font-feature-settings`, and honor paragraph/list/hanging/leading-trim metadata.
- Preserve `prototype.overflowDirection`, `fixedChildIds`, and overlay settings as runtime behavior; fixed layers stay above scrolling content.
- Treat `annotations`, `componentPropertyReferences`, `variableBindings`, `explicitVariableModes`, and `referencedVariables` as developer-authored implementation constraints.
- `style.cornerSmoothing` is a Figma squircle, not a plain CSS rounded rectangle; use the bundled fallback or exact superellipse geometry when required.
- Rebuild partial ellipses and donut shapes from `arcData` instead of rendering a full oval.
- Preserve paint metadata such as fill opacity, image crop transforms, image filters, and gradient transforms when present in `style`.
- `style.advancedEffects` records Figma noise, texture, and glass parameters. Treat the node-matched rendered fallback as authoritative because plain CSS cannot reproduce these effects exactly.
- Any critical `unsupported-fill-*` or `unsupported-effect-*` warning means the known node contains a visual feature the native implementation must not silently drop.
- Multiple visible fills/strokes and Figma linear-burn/linear-dodge compositing are critical fallback cases; browser background layers or blend modes are not accepted as pixel-equivalent evidence.
- Preserve stroke metadata such as stroke alignment, caps, joins, dash pattern, miter limit, and side-specific stroke weights when present in `style`.
- Render exact SVG paths from `vectorPaths`, `fillGeometry`, or `strokeGeometry` when present; do not replace them with approximate icons.
- For `TEXT_PATH`, place the exact text on `vectorPaths` beginning at `textPathStartData`; use the bundled rendered fallback if browser text-path metrics differ.
- For `TRANSFORM_GROUP`, reproduce every `transformModifiers` repeat in order, including repeat type, count, axis, offset, and whether the offset uses px or relative units.
- Give the final exact-size screenshot to the user so they can run Figma to Prompt's built-in **Verify AI screenshot** checker.

## Tree Outline
```
Navigation (FRAME, horizontal, fill×hug)
├── Logo bar (FRAME, horizontal, hug×hug)
│   ├── Hamburger menu (FRAME, horizontal, fixed×fixed)
│   │   └── Menu / Hamburger_MD (INSTANCE, fixed×fixed)
│   │       └── Vector (VECTOR, fixed×fixed)
│   └── Frame 2147224368 (FRAME, horizontal, hug×hug)
│       ├── Group 797 (GROUP, fixed×fixed)
│       │   ├── Ellipse 543 (ELLIPSE, fixed×fixed)
│       │   ├── Ellipse 544 (ELLIPSE, fixed×fixed)
│       │   └── Subtract (VECTOR, fixed×fixed)
│       └── Group 798 (GROUP, fixed×fixed)
│           └── Vector (VECTOR, fixed×fixed)
├── Selection (FRAME, horizontal, hug×hug)
│   ├── menu (FRAME, horizontal, hug×hug)
│   │   ├── Frame 2147237002 (FRAME, vertical, hug×hug)
│   │   │   ├── Home (TEXT, hug×hug) "Home"
│   │   │   └── Line 4 (LINE, fill×fixed)
│   │   ├── Frame 2147237004 (FRAME, vertical, hug×hug)
│   │   │   ├── About Us (TEXT, hug×hug) "About Us"
│   │   │   └── Line 4 (LINE, fill×fixed)
│   │   ├── Frame 2147237001 (FRAME, vertical, hug×hug)
│   │   │   ├── Programs (TEXT, hug×hug) "Programs"
│   │   │   └── Line 4 (LINE, fill×fixed)
│   │   ├── Frame 2147237003 (FRAME, vertical, hug×hug)
│   │   │   ├── Workshops (TEXT, hug×hug) "Workshops"
│   │   │   └── Line 4 (LINE, fill×fixed)
│   │   └── Frame 2147237005 (FRAME, vertical, hug×hug)
│   │       ├── ZPassport (TEXT, hug×hug) "ZPassport"
│   │       └── Line 4 (LINE, fill×fixed)
│   └── Contact Us (FRAME, horizontal, hug×fill)
│       └── Log In (TEXT, hug×hug) "Log In"
└── Frame 2147223938 (FRAME, fixed×fixed)
```

## Component Structure
```
{"id":"2605:22115","name":"Navigation","type":"FRAME","layout":{"width":1440,"height":64,"layoutAlign":"stretch","constraints":{"horizontal":"min","vertical":"min"},"overflow":"hidden","mode":"horizontal","gap":221.42,"strokesIncludedInLayout":false,"padding":{"top":32,"right":24,"bottom":0,"left":24},"primaryAxisAlign":"space-between","counterAxisAlign":"center","sizing":{"horizontal":"fill","vertical":"hug"}},"style":{"blendMode":"pass_through","fills":[{"type":"gradient","sourceType":"GRADIENT_LINEAR","gradientType":"linear","css":"linear-gradient(#FFFFFF 0%, #FFFFFF 100%)","gradientStops":[{"color":"#FFFFFF","position":0},{"color":"#FFFFFF","position":1,"opacity":0}],"transform":[[0,1.1,0],[-233.33,0,109.55]]}],"backgroundGradient":"linear-gradient(#FFFFFF 0%, #FFFFFF 100%)","backgroundGradientType":"linear","backgroundGradientStops":[{"color":"#FFFFFF","position":0},{"color":"#FFFFFF","position":1,"opacity":0}],"backgroundGradientTransform":[[0,1.1,0],[-233.33,0,109.55]]},"children":[{"id":"2605:22116","name":"Logo bar","type":"FRAME","layout":{"width":172.61,"height":32,"x":24,"y":32,"layoutAlign":"inherit","constraints":{"horizontal":"min","vertical":"min"},"overflow":"hidden","mode":"horizontal","gap":19.95,"strokesIncludedInLayout":false,"primaryAxisAlign":"center","counterAxisAlign":"center","sizing":{"horizontal":"hug","vertical":"hug"}},"style":{"blendMode":"pass_through","strokes":[{"type":"solid","sourceType":"SOLID","visible":false,"color":"#000000"}]},"children":[{"id":"2605:22117","name":"Hamburger menu","type":"FRAME","layout":{"width":32,"height":32,"layoutAlign":"inherit","constraints":{"horizontal":"min","vertical":"min"},"targetAspectRatio":{"x":59.84,"y":59.84},"overflow":"hidden","mode":"horizontal","gap":5.33,"strokesIncludedInLayout":false,"primaryAxisAlign":"space-between","counterAxisAlign":"min","sizing":{"horizontal":"fixed","vertical":"fixed"}},"style":{"blendMode":"pass_through"},"children":[{"id":"2605:22118","name":"Menu / Hamburger_MD","type":"INSTANCE","layout":{"width":32,"height":32,"layoutAlign":"inherit","constraints":{"horizontal":"min","vertical":"min"},"mode":"none","sizing":{"horizontal":"fixed","vertical":"fixed"}},"style":{"blendMode":"pass_through"},"children":[{"id":"I2605:22118;1446:16070","name":"Vector","type":"VECTOR","layout":{"width":18.67,"height":13.33}}]}]},{"id":"2605:22119","name":"Frame 2147224368","type":"FRAME","layout":{"width":120.67,"height":32,"x":51.95,"layoutAlign":"inherit","constraints":{"horizontal":"min","vertical":"min"},"mode":"horizontal","gap":8,"strokesIncludedInLayout":false,"padding":{"top":0,"right":8,"bottom":0,"left":8},"primaryAxisAlign":"center","counterAxisAlign":"center","sizing":{"horizontal":"hug","vertical":"hug"}},"style":{"blendMode":"pass_through"},"children":[{"id":"2605:22120","name":"Group 797","type":"GROUP","layout":{"width":26.67,"height":32,"x":8,"layoutAlign":"inherit","mode":"none","sizing":{"horizontal":"fixed","vertical":"fixed"}},"style":{"blendMode":"pass_through"},"children":[{"id":"2605:22121","name":"Ellipse 543","type":"ELLIPSE","arcData":{"startingAngle":0,"endingAngle":6.2831854820251465,"innerRadius":0},"layout":{"width":6.08,"height":6.08,"x":8.68,"y":0.02,"layoutAlign":"inherit","constraints":{"horizontal":"min","vertical":"min"},"targetAspectRatio":{"x":285,"y":285},"mode":"none","sizing":{"horizontal":"fixed","vertical":"fixed"}},"style":{"blendMode":"pass_through","fills":[{"type":"solid","sourceType":"SOLID","color":"#0ABAB5"}],"backgroundColor":"#0ABAB5"}},{"id":"2605:22122","name":"Ellipse 544","type":"ELLIPSE","arcData":{"startingAngle":0,"endingAngle":6.2831854820251465,"innerRadius":0},"layout":{"width":6.08,"height":6.08,"x":28.59,"y":25.92,"layoutAlign":"inherit","constraints":{"horizontal":"min","vertical":"min"},"targetAspectRatio":{"x":285,"y":285},"mode":"none","sizing":{"horizontal":"fixed","vertical":"fixed"}},"style":{"blendMode":"pass_through","fills":[{"type":"solid","sourceType":"SOLID","color":"#0ABAB5"}],"backgroundColor":"#0ABAB5"}},{"id":"2605:22123","name":"Subtract","type":"VECTOR","layout":{"width":26.64,"height":32}}]},{"id":"2605:22124","name":"Group 798","type":"GROUP","layout":{"width":70,"height":18.19,"x":42.67,"y":6.9,"layoutAlign":"inherit","mode":"none","sizing":{"horizontal":"fixed","vertical":"fixed"}},"style":{"blendMode":"pass_through"},"children":[{"id":"2605:22125","name":"Vector","type":"VECTOR","layout":{"width":70,"height":18.19}}]}]}]},{"id":"2605:22126","name":"Selection","type":"FRAME","layout":{"width":606.58,"height":29,"x":809.42,"y":33.5,"layoutAlign":"inherit","constraints":{"horizontal":"min","vertical":"min"},"overflow":"hidden","mode":"horizontal","gap":48,"strokesIncludedInLayout":false,"primaryAxisAlign":"max","counterAxisAlign":"center","sizing":{"horizontal":"hug","vertical":"hug"}},"style":{"blendMode":"pass_through"},"children":[{"id":"2605:22127","name":"menu","type":"FRAME","layout":{"width":510.58,"height":29,"layoutAlign":"inherit","constraints":{"horizontal":"min","vertical":"min"},"overflow":"hidden","mode":"horizontal","gap":39.9,"strokesIncludedInLayout":false,"primaryAxisAlign":"center","counterAxisAlign":"center","sizing":{"horizontal":"hug","vertical":"hug"}},"style":{"blendMode":"pass_through","strokes":[{"type":"solid","sourceType":"SOLID","visible":false,"color":"#000000"}]},"children":[{"id":"2605:22128","name":"Frame 2147237002","type":"FRAME","layout":{"width":45,"height":29,"layoutAlign":"inherit","constraints":{"horizontal":"min","vertical":"min"},"mode":"vertical","gap":10,"strokesIncludedInLayout":false,"primaryAxisAlign":"center","counterAxisAlign":"center","sizing":{"horizontal":"hug","vertical":"hug"}},"style":{"blendMode":"pass_through"},"children":[{"id":"2605:22129","name":"Home","type":"TEXT","text":"Home","style":{"blendMode":"pass_through","fills":[{"type":"solid","sourceType":"SOLID","color":"#222222"}],"color":"#222222","fontFamily":"SF Pro","fontStyleName":"Regular","fontSize":16,"fontWeight":400,"textAlignVertical":"top","textAutoResize":"width-and-height","textTruncation":"disabled","leadingTrim":"none"},"layout":{"width":45,"height":19,"layoutAlign":"inherit","constraints":{"horizontal":"min","vertical":"min"},"mode":"none","sizing":{"horizontal":"hug","vertical":"hug"}}},{"id":"2605:22130","name":"Line 4","type":"LINE","layout":{"width":45,"height":0,"y":29,"layoutAlign":"stretch","constraints":{"horizontal":"min","vertical":"min"},"mode":"none","sizing":{"horizontal":"fill","vertical":"fixed"}},"style":{"blendMode":"pass_through","strokes":[{"type":"solid","sourceType":"SOLID","visible":false,"color":"#222222"}]}}]},{"id":"2605:22131","name":"Frame 2147237004","type":"FRAME","layout":{"width":70,"height":29,"x":84.9,"layoutAlign":"inherit","constraints":{"horizontal":"min","vertical":"min"},"mode":"vertical","gap":10,"strokesIncludedInLayout":false,"primaryAxisAlign":"center","counterAxisAlign":"center","sizing":{"horizontal":"hug","vertical":"hug"}},"style":{"blendMode":"pass_through"},"children":[{"id":"2605:22132","name":"About Us","type":"TEXT","text":"About Us","style":{"blendMode":"pass_through","fills":[{"type":"solid","sourceType":"SOLID","color":"#222222"}],"color":"#222222","fontFamily":"SF Pro","fontStyleName":"Regular","fontSize":16,"fontWeight":400,"textAlignVertical":"top","textAutoResize":"width-and-height","textTruncation":"disabled","leadingTrim":"none"},"layout":{"width":70,"height":19,"layoutAlign":"inherit","constraints":{"horizontal":"min","vertical":"min"},"mode":"none","sizing":{"horizontal":"hug","vertical":"hug"}}},{"id":"2605:22133","name":"Line 4","type":"LINE","layout":{"width":70,"height":0,"y":29,"layoutAlign":"stretch","constraints":{"horizontal":"min","vertical":"min"},"mode":"none","sizing":{"horizontal":"fill","vertical":"fixed"}},"style":{"blendMode":"pass_through","strokes":[{"type":"solid","sourceType":"SOLID","visible":false,"color":"#222222"}]}}]},{"id":"2605:22134","name":"Frame 2147237001","type":"FRAME","layout":{"width":73,"height":29,"x":194.79,"layoutAlign":"inherit","constraints":{"horizontal":"min","vertical":"min"},"mode":"vertical","gap":10,"strokesIncludedInLayout":false,"primaryAxisAlign":"center","counterAxisAlign":"center","sizing":{"horizontal":"hug","vertical":"hug"}},"style":{"blendMode":"pass_through"},"children":[{"id":"2605:22135","name":"Programs","type":"TEXT","text":"Programs","style":{"blendMode":"pass_through","fills":[{"type":"solid","sourceType":"SOLID","color":"#222222"}],"color":"#222222","fontFamily":"SF Pro","fontStyleName":"Regular","fontSize":16,"fontWeight":400,"textAlignVertical":"top","textAutoResize":"width-and-height","textTruncation":"disabled","leadingTrim":"none"},"layout":{"width":73,"height":19,"layoutAlign":"inherit","constraints":{"horizontal":"min","vertical":"min"},"mode":"none","sizing":{"horizontal":"hug","vertical":"hug"}},"reactions":[{"trigger":{"type":"ON_CLICK"},"actions":[{"type":"NODE","destinationId":"1582:16181","navigation":"NAVIGATE","transition":null,"resetVideoPosition":false}]}]},{"id":"2605:22136","name":"Line 4","type":"LINE","layout":{"width":73,"height":0,"y":29,"layoutAlign":"stretch","constraints":{"horizontal":"min","vertical":"min"},"mode":"none","sizing":{"horizontal":"fill","vertical":"fixed"}},"style":{"blendMode":"pass_through","strokes":[{"type":"solid","sourceType":"SOLID","visible":false,"color":"#222222"}]}}]},{"id":"2605:22137","name":"Frame 2147237003","type":"FRAME","layout":{"width":85,"height":29,"x":307.69,"layoutAlign":"inherit","constraints":{"horizontal":"min","vertical":"min"},"mode":"vertical","gap":10,"strokesIncludedInLayout":false,"primaryAxisAlign":"center","counterAxisAlign":"center","sizing":{"horizontal":"hug","vertical":"hug"}},"style":{"blendMode":"pass_through"},"children":[{"id":"2605:22138","name":"Workshops","type":"TEXT","text":"Workshops","style":{"blendMode":"pass_through","fills":[{"type":"solid","sourceType":"SOLID","color":"#222222"}],"color":"#222222","fontFamily":"SF Pro","fontStyleName":"Regular","fontSize":16,"fontWeight":400,"textAlignVertical":"top","textAutoResize":"width-and-height","textTruncation":"disabled","leadingTrim":"none"},"layout":{"width":85,"height":19,"layoutAlign":"inherit","constraints":{"horizontal":"min","vertical":"min"},"mode":"none","sizing":{"horizontal":"hug","vertical":"hug"}}},{"id":"2605:22139","name":"Line 4","type":"LINE","layout":{"width":85,"height":0,"y":29,"layoutAlign":"stretch","constraints":{"horizontal":"min","vertical":"min"},"mode":"none","sizing":{"horizontal":"fill","vertical":"fixed"}},"style":{"blendMode":"pass_through","strokes":[{"type":"solid","sourceType":"SOLID","visible":false,"color":"#222222"}]}}],"reactions":[{"trigger":{"type":"ON_CLICK"},"actions":[{"type":"NODE","destinationId":"1988:7449","navigation":"NAVIGATE","transition":null,"resetVideoPosition":false}]}]},{"id":"2816:18333","name":"Frame 2147237005","type":"FRAME","layout":{"width":78,"height":29,"x":432.58,"layoutAlign":"inherit","constraints":{"horizontal":"min","vertical":"min"},"mode":"vertical","gap":10,"strokesIncludedInLayout":false,"primaryAxisAlign":"center","counterAxisAlign":"center","sizing":{"horizontal":"hug","vertical":"hug"}},"style":{"blendMode":"pass_through"},"children":[{"id":"2816:18334","name":"ZPassport","type":"TEXT","text":"ZPassport","style":{"blendMode":"pass_through","fills":[{"type":"solid","sourceType":"SOLID","color":"#222222"}],"color":"#222222","fontFamily":"SF Pro","fontStyleName":"Regular","fontSize":16,"fontWeight":400,"textAlignVertical":"top","textAutoResize":"width-and-height","textTruncation":"disabled","leadingTrim":"none"},"layout":{"width":78,"height":19,"layoutAlign":"inherit","constraints":{"horizontal":"min","vertical":"min"},"mode":"none","sizing":{"horizontal":"hug","vertical":"hug"}}},{"id":"2816:18335","name":"Line 4","type":"LINE","strokeGeometry":[{"windingRule":"NONZERO","data":"M0.5 -1 C0.223858 -1 0 -0.776142 0 -0.5 C0 -0.223858 0.223858 0 0.5 0 L0.5 -0.5 L0.5 -1 Z M77.5 0 C77.7761 0 78 -0.223858 78 -0.5 C78 -0.776142 77.7761 -1 77.5 -1 L77.5 -0.5 L77.5 0 Z M0.5 -0.5 L0.5 0 L77.5 0 L77.5 -0.5 L77.5 -1 L0.5 -1 L0.5 -0.5 Z"}],"layout":{"width":78,"height":0,"y":29,"layoutAlign":"stretch","constraints":{"horizontal":"min","vertical":"min"},"mode":"none","sizing":{"horizontal":"fill","vertical":"fixed"}},"style":{"blendMode":"pass_through","strokes":[{"type":"solid","sourceType":"SOLID","color":"#222222"}],"borderColor":"#222222","borderWidth":1,"strokeAlign":"center","strokeCap":"round","strokeJoin":"miter","strokeMiterLimit":4,"strokeDashPattern":[]}}],"reactions":[{"trigger":{"type":"ON_CLICK"},"actions":[{"type":"NODE","destinationId":"1988:7449","navigation":"NAVIGATE","transition":null,"resetVideoPosition":false}]}]}]},{"id":"2605:22140","name":"Contact Us","type":"FRAME","layout":{"width":48,"height":29,"x":558.58,"layoutAlign":"stretch","constraints":{"horizontal":"min","vertical":"min"},"overflow":"hidden","mode":"horizontal","gap":9.97,"strokesIncludedInLayout":false,"primaryAxisAlign":"min","counterAxisAlign":"min","sizing":{"horizontal":"hug","vertical":"fill"}},"style":{"blendMode":"pass_through","opacity":0},"children":[{"id":"2605:22141","name":"Log In","type":"TEXT","text":"Log In","style":{"blendMode":"pass_through","fills":[{"type":"solid","sourceType":"SOLID","color":"#222222"}],"color":"#222222","fontFamily":"SF Pro","fontStyleName":"Semibold","fontSize":16,"fontWeight":590,"textAlignVertical":"top","textAutoResize":"width-and-height","textTruncation":"disabled","leadingTrim":"none"},"layout":{"width":48,"height":19,"layoutAlign":"inherit","constraints":{"horizontal":"min","vertical":"min"},"mode":"none","sizing":{"horizontal":"hug","vertical":"hug"}},"reactions":[{"trigger":{"type":"ON_CLICK"},"actions":[{"type":"NODE","destinationId":"1743:7317","navigation":"NAVIGATE","transition":null,"resetVideoPosition":false}]}]}]}]},{"id":"2605:22142","name":"Frame 2147223938","type":"FRAME","layout":{"width":40,"height":40,"x":1376,"y":23,"layoutPositioning":"absolute","layoutAlign":"inherit","constraints":{"horizontal":"min","vertical":"min"},"targetAspectRatio":{"x":48,"y":48},"overflow":"hidden","mode":"none","sizing":{"horizontal":"fixed","vertical":"fixed"}},"style":{"blendMode":"pass_through","fills":[{"type":"image","sourceType":"IMAGE","imageHash":"0fb4d6660e3629bcde8e4e23df1afe8ebc62a7e1","scaleMode":"fill","transform":[[1,0,0],[0,1,0]],"scalingFactor":0.5}],"borderRadius":750,"imageFillHash":"0fb4d6660e3629bcde8e4e23df1afe8ebc62a7e1","imageFillScaleMode":"fill","imageFillTransform":[[1,0,0],[0,1,0]],"imageFillScalingFactor":0.5},"reactions":[{"trigger":{"type":"ON_CLICK"},"actions":[{"type":"NODE","destinationId":"2046:30693","navigation":"NAVIGATE","transition":null,"resetVideoPosition":false}]}]}]}
```

## Capture Bundle Inputs (Authoritative)
- Keep this bundle intact. Resolve every path relative to the bundle root.
- Review `mcp/figma-locator.json` before calling a Figma MCP tool. Prefer each node's exact `locator.sourceUrl`; otherwise pass its `locator.fileKey` and colon-form `locator.nodeId` through the MCP tool's documented inputs.
- Locator data is for discovery or refresh only. An MCP re-capture creates a new immutable capture; it never replaces the evidence in this bundle.
- This capture has no Figma file key, so MCP cannot reopen its source; rely on the bundled evidence.
- Review `fidelity/coverage.json` before implementation. Every listed node must use its exact pixel fallback or an equivalent implementation proven by the final RGBA comparison.
- Use the reference renders below as the visual source of truth and iterate with screenshot comparison.
- Authoritative target: `references/001-2605_22115.png` at exactly 1440×64 CSS pixels. Do not infer the viewport from Figma's fractional geometry or another asset.
- Reference determinism gate passed: two consecutive Figma renders were RGBA-identical. If a later reference becomes unstable, stop exact verification until the changing content is frozen.
- Provide the final exact-size screenshot so the user can load it into Figma to Prompt's built-in `Verify AI screenshot` checker.
- Reference render: `references/001-2605_22115.png`
- Match design assets by their manifest `nodeId`; bundled paths override any generated filename elsewhere in this prompt.
- Design asset for node `2605:22142`: `assets/001-2605_22142.png`
- Rendered fallbacks are Figma-authored precision assets. Use the PNG variant for the exact 1× target; use the outlined, unsimplified SVG variant when the node must scale. Preserve semantics or interactions with an accessible overlay when needed.
- Rendered fallback (pixel) for node `2605:22115` (paint-interpolation, context-dependent-effect): `fallbacks/001-2605_22115.png`
- Rendered fallback (vector) for node `2605:22115` (paint-interpolation, context-dependent-effect): `fallbacks/001-2605_22115.svg`
