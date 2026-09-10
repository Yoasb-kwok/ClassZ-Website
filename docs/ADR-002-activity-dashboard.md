# ADR-002: Activity / Academic Dashboard — Completion (view-only)

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-10 |
| **Decision Maker** | mrcoffeespoon |
| **Related** | `ADR-001-student-personal-information.md`, `ClassZ-api/controllers/studentController.js`, `ClassZ-api/helpers/learningCompanion/`, `ClassZ-Website/components/account/student-shell.tsx` |

---

## Context

The student portal's **Activity** and **Academic** dashboards are partially built but have three gaps: the UI only renders a subset of the available data, the "state" badges are ad-hoc, and the data exposed to the frontend is incomplete. The goal is to complete the dashboards as a **view-only** feature (no new database data) using a **3-layer separation**: **Presentation** (React, Figma-driven), **Domain** (aggregation + state logic), **Data** (existing tables).

Today the two dashboards share a single child-level Learning Companion report (`learning_companion_reports`), and the "Overall Learning Picture" portrait is identical on both. The record list is split into `academic` vs `activity` purely by the `lessonKind(program_code)` rule (`ZPASS-ACT*` → activity). The AI (DeepSeek) only writes prose narrative; the companion identity and repeated-pattern data are **deterministic** outputs of `buildProfile.js`, stored in `learning_companion_reports.algorithm_json` — which is **not** currently returned by `GET /api/student/passport`.

Four decisions below resolve: what "AI" means (D1), the two-layer state machine (D2), where per-program aggregation lives (D3), and the rating gap (D4).

---

## Architecture Pattern Assessment — 3-layer separation

The user's 3-layer rule maps onto this codebase as follows:

| Layer | Responsibility | Concrete components |
|---|---|---|
| **Presentation** | Render only; no domain logic | `components/account/student-shell.tsx` (`RecordsDashboard`, `RecordsMorePage`, `LessonPage`, `LessonRecordPage`), `app/account/activity/*`, `app/account/academic/*`, `lib/student-passport.ts` (types + fetch) |
| **Domain** | Aggregation, state machine, AI/deterministic logic | `controllers/studentController.js` (`getPassport`, `recordStatus`), `helpers/learningCompanion/` (`buildProfile.js`, `generateNarrative.js`) |
| **Data** | Persistence (unchanged) | `activity_learning_records`, `learning_companion_reports`, `classes`, `centers` |

**Refinement made during grilling:** the current frontend contains a *leaked domain rule* — `RecordsDashboard` computes the summary state inline (`records.length >= 5 ? …`). D2/D3 move that decision into the backend so Presentation stays truly view-only. The `recordStatus` state machine also lives in the controller (Domain-adjacent) rather than in a standalone service; this is accepted for now since it's a pure function, but it's the first candidate to extract if domain logic grows.

---

## Decision Summary

| # | Decision | Choice |
|---|----------|--------|
| D1 | What "AI" means | Hybrid: DeepSeek = prose only; deterministic `algorithm_json` + static `whatMayHelp` + per-program aggregation for the rest |
| D2 | State machine (two patterns) | Overall: `<5` early / `≥5` established (gen + display at 5). Per-program: `1` early / `2` emerging / `≥3` established |
| D3 | Where per-program aggregation lives | Backend (`getPassport`), deterministic, fresh per program |
| D4 | Centre & coach rating | Drop numeric rating for v1 (show names only) |

---

## Decision 1: What "AI" means — hybrid source mapping

**Decision:** "AI" is a precise label, not a catch-all. **DeepSeek** (`generateNarrative.js`) supplies only the prose narrative. The repeated-pattern / progress / focus content comes from **deterministic** `algorithm_json` (`buildProfile.js`), static `stemOptions.whatMayHelp`, and (for cross-program items) **deterministic per-program aggregation**. Item 3 ("differences across programs") and item 4 ("what seems to help across programs") are **computed**, not DeepSeek-written.

```js
// learning_companion_reports.algorithm_json (deterministic) already holds:
repeated_strengths, repeated_focus_areas, repeated_learning_approaches,
repeated_observed_behaviours, progress_context, coach_notes, pattern_confidence
```

### Alternatives Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| A. DeepSeek-only label | Precise | Most of the "AI" list becomes non-AI; doesn't resolve 3/4 | ❌ |
| B. Extend DeepSeek | Rich prose incl. "across programs" | New prompt + per-program report/endpoint → not view-only | ❌ |
| **C. Hybrid (chosen)** | Honours "no new data / view-only"; uses already-computed data | "Across programs" is a deterministic diff, not prose | ✅ |

### Consequences

- **Positive:** no new data; only exposure of existing `algorithm_json` + one aggregation.
- **Negative:** "differences across programs" reads as a structured comparison, not fluent prose.
- **Review trigger:** if the product later wants DeepSeek to *write* the cross-program comparison, revisit (return to Option B).

### Amendment (2026-09-10) — item 4 is AI-gated in the UI

**Decision maker feedback:** the computed `help_across_programs` labels (e.g. "Short verbal prompt") must **not** be displayed on the *What Seems to Help Across Programmes* card. That card is now gated on AI prose and shows a wait state until it exists.

| | |
|---|---|
| Field read | `companion.narrative_json.sections.what_helps_across_programmes` (contract for the future agentic feedback system) |
| AI output present | render the prose |
| ≥ `MIN_RECORDS_FOR_RESULT` (5) records, no AI output | `WAITING_FOR_AI` copy |
| < 5 records | existing `WAITING_FOR_RECORDS` copy |

`help_across_programs` remains in the passport payload (unused by this card) — no backend removal. `Differences Across Programmes` (item 3) is unchanged and still shows the deterministic comparison.

- **Positive:** the card never misrepresents computed labels as AI insight; the wait state is honest about pipeline state.
- **Negative:** the card is empty of content until the agentic feedback system is wired.
- **Review trigger:** when the agentic feedback system lands, confirm it writes `what_helps_across_programmes` into `narrative_json.sections`; otherwise adjust the key.

Internal diagnostic: `getPassport` logs `[zpassport] ... AI output not received` when records ≥ 5 but `narrative_json.sections` is empty.

---

## Decision 2: Two-layer state machine

**Decision:** Two independent patterns, each keyed on **1 lesson = 1 learning record**:

| Pattern | Scope | Rule | "Full picture" |
|---|---|---|---|
| **Overall** | child + Learning Companion + "Overall Picture" | `<5` → "Early observations" (locked); `≥5` → "Established pattern" | at **5** |
| **Per-program** | each class/program | `1` → "Early observations"; `2` → "Emerging pattern"; `≥3` → "Established pattern" | at **3** (chart, progress) |

The wording is standardized on **"Established pattern"** everywhere (the old "Consistent pattern" is renamed). The overall threshold applies at **both** generation and display — so `MIN_RECORDS_FOR_RESULT` in `buildProfile.js` changes from **3 → 5**.

```js
// controllers/studentController.js — per-program state (replaces current recordStatus)
function recordStatus(count) {
  if (count >= 3) return { status: "Established pattern", statusType: "established" }
  if (count === 2) return { status: "Emerging pattern",  statusType: "emerging" }
  return { status: "Early observations", statusType: "early" }
}
```

### Alternatives Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **A. 1/2/≥3 + "established" (chosen)** | Granular per-program cadence; matches "full picture after 3" | Changes existing thresholds | ✅ |
| B. 1/2/≥3 but keep "consistent" | — | Mixed vocabulary | ❌ |
| C. Keep 0–2/3–4/≥5 | No code change | Ignores "full picture after 3" | ❌ |

### Consequences

- **Positive:** single unambiguous rule for each scope; generation and display agree.
- **Negative:** raising the overall threshold to 5 means a child needs **5 valid records before any companion report exists** (previously 3) — slightly more friction.
- **Review trigger:** if coaches report students "stuck" below 5 records for too long, lower the overall threshold or split gen/display thresholds.

---

## Decision 3: Per-program aggregation lives in the backend

**Decision:** `GET /api/student/passport` is extended to return, per program: `insights` (`repeated_strength`, `repeated_support`, `current_focus`, `current_progress`) and a child-level cross-program object (`differences_across_programs`, `help_across_programs`). The frontend renders these verbatim. This keeps the domain logic in the Domain layer and Presentation view-only.

### Alternatives Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **A. Backend (chosen)** | Domain logic in Domain layer; frontend dumb | Extends the passport response shape | ✅ |
| B. Frontend | Smaller backend change | Domain logic leaks into Presentation | ❌ |
| C. Hybrid | — | Splits logic across two layers | ❌ |

### Consequences

- **Positive:** consistent with 3-layer separation; deterministic and testable in one place.
- **Negative:** `getPassport` becomes a larger aggregation endpoint.
- **Review trigger:** if per-program insight rules become numerous, extract a dedicated `buildProgramInsights(records)` helper instead of inlining in the controller.

---

## Decision 4: Centre & coach rating — drop for v1

**Decision:** Items 7 ("rate of the centre") and 17 ("coach … rating") are **not rendered** in this pass. The UI shows centre **name** and coach **name** without a numeric rating.

Rationale: `rating` exists only on `courses` (public course listing), not on `centers` or `instructors`. The only "teacher rating" is `adminReportController`'s computed `ratingScore` (an admin attendance composite), never stored and never student-facing.

### Alternatives Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **A. Drop numeric rating (chosen)** | Honours "no new data" | No rating shown | ✅ |
| B. Derive (avg of `courses.rating`, expose `ratingScore`) | Gets a number without storage | Semantically weak; not a real rating | ❌ |
| C. Add real rating data | Proper rating | New tables/columns → breaks view-only | ❌ |

### Consequences

- **Positive:** feature stays view-only; no misleading number.
- **Negative:** pages lack a rating signal.
- **Review trigger:** if a centre/coach star-rating is a hard product requirement, add a `centers.rating` / `instructors.rating` column (migration, both dialects) and revisit.

---

## Consequence Summary

### Schema Changes Required

| Change | Target | Risk |
|---|---|---|
| None (view-only) | — | — |
| *(constant, not schema)* `MIN_RECORDS_FOR_RESULT` 3 → 5 | `helpers/learningCompanion/buildProfile.js` | Low — changes report-generation threshold |

### New API Exposures (`GET /api/student/passport`)

| Addition | Source |
|---|---|
| `companion.algorithm_json` | `learning_companion_reports.algorithm_json` (already stored, now returned) |
| `lessons[].insights` (repeated strength/support, current focus/progress) | derived per program from `activity_learning_records` |
| `differences_across_programs`, `help_across_programs` | derived cross-program aggregation |
| `recordStatus` rework (1/2/≥3) | `controllers/studentController.js` |

### UI Changes

| Page | Route | Fields |
|---|---|---|
| Dashboard | `/account/activity`, `/account/academic` | unchanged (already complete) |
| Overall picture | `/account/activity/more`, `/academic/more` | 1 stronger area, 2 need support, 3 differences across programs, 4 what helps across programs |
| Program | `/account/activity/lessons/[id]`, `/academic/lessons/[id]` | 5 record count, 6 centre, 8 progress, 9 chart, 10–13 insights, 14 record list |
| Lesson | `/account/activity/lessons/[id]/records/[rid]` | 15 lesson, 16 date/time, 17 centre+coach (no rating), 18 focus, 19 observed, 20 support, 21 helped, 22 next step, 23 coach note, 24 moments |

---

## Review Triggers

| Condition | Revisit |
|---|---|
| Product wants DeepSeek to *write* "across programs" comparison | D1 → Option B |
| Coaches report students stuck below 5 records | D2 → lower overall threshold or split gen/display |
| Per-program insight rules grow unwieldy | D3 → extract `buildProgramInsights()` helper |
| Centre/coach star-rating becomes required | D4 → add rating columns (migration) |
