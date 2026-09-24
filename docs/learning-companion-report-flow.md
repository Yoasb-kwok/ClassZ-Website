# Learning Companion Report Flow — Complete Rundown

Covers: what triggers a report, how records are validated and classified, what
DeepSeek is asked and produces, where each output lands in the UI, and the
operational behaviours (windows, retries, fallbacks, accumulation).

Related docs: `docs/ADR-003-learning-companion-page.md`,
`docs/ADR-002-activity-dashboard.md` (D1/D2 decisions).

---

## 1. Triggers

Two doors into the same pipeline (`generateLearningCompanionReport` in
`ClassZ-api/helpers/learningCompanion/index.js`):

| Trigger | Entry point | Gate |
|---|---|---|
| **Auto** (ADR-003 D2) | After any learning-record create/update/import, `triggerCompanionReportGeneration(profileId)` fires fire-and-forget | Runs only if **≥3 valid records** (`MIN_RECORDS_FOR_RESULT = 3`); below that it is a silent no-op. Never blocks or fails the record save |
| **Manual** | Staff "Generate report" buttons (single + bulk) in `learning-record-students-table.tsx` → `POST /learning-record-students/:profileId/generate-report` | Same threshold; returns 400 if insufficient. Requires `DEEPSEEK_API_KEY` (503 without) |

---

## 2. Record collection

`runCompanionReportGeneration` loads **all** learning records for the profile:

```sql
SELECT alr.*, c.name, c.location, c.instructor, c.program_code, cen.center_name
FROM activity_learning_records alr
LEFT JOIN classes c ON c.id = alr.class_id
LEFT JOIN centers cen ON cen.id = alr.center_id
WHERE alr.profile_id = ? AND alr.center_id = ?
ORDER BY alr.created_at ASC, alr.id ASC
```

Each row is mapped by `mapAlrToCompanionRecord` into one of two schemas (see §5).
Rows marked `insufficient_opportunity` map to `null` and are dropped — they never
count toward the threshold or the algorithm.

---

## 3. Record format (the two schemas)

### Schema v2 (current coach form, `schema_version = '2'`)

```json
{
  "record_id": 123,
  "student_id": "102",
  "student_name": "Charlie Wong",
  "date": "2026-05-12",
  "subject": "<class_focus, ≤80 chars>",
  "level": "Developing",                    // Supported | Guided | Developing | Independent
  "schema_version": 2,
  "learning_approaches": ["Participates actively", "Tries independently"],  // 1–2, closed list
  "observed_behaviours": ["..."],
  "strengths": [],                          // always empty on v2
  "focus_areas": [],                        // always empty on v2
  "coach_comment": "<comment — work — evidence>",
  "route_used": "adaptive",
  "observation_type": "valid_observation",
  "observation_domain": "number",
  "observation_context": "small group",
  "factual_evidence": "≥10 chars of factual evidence",
  "outcome": "...",
  "support_given": ["demonstrate_first_step", "verbal_prompt"],
  "response_to_support": "restarted after one prompt",
  "adaptive_q_code": "...", "adaptive_domain": "...", "adaptive_answer_id": "...",
  "next_step": "..."
}
```

The closed `learning_approaches` list (12 values, mapped from form ids):
Participates actively · Responds well to feedback · Works carefully · Tries
independently · Needs encouragement to start · Stays focused · Collaborates
well · Shows persistence · Hesitant with new tasks · Shows initiative · Asks
questions · Checks mistakes carefully.

### Schema v1 (legacy rows, no `schema_version`)

Same core keys, derived from different columns: `learning_approaches` ←
`learning_traits`, `strengths` ← `strongest_areas`, `focus_areas` ←
`attention_areas`, subject defaults to "STEM". No support/outcome/adaptive
fields.

### Field → consumer map

| Field | Feeds |
|---|---|
| `learning_approaches` | **TRAIT_SCORES → animal classification** (core input) |
| `level` | Progress chart (Supported=1 … Independent=4) |
| `observed_behaviours` / `strengths` / `focus_areas` | "Repeated …" aggregations + DeepSeek evidence |
| `support_given` / `response_to_support` / `outcome` | AI "what helped" claims + `support_method_ids` audit |
| `factual_evidence` / `coach_comment` | DeepSeek grounding text |

---

## 4. Deterministic classification (`buildProfile.js`)

Runs **before** any AI. Steps:

1. **Canonical name check** — records must name the same child (most frequent
   name wins; ties broken by earliest date). Others rejected (`wrong_child`).
2. **Per-record validation** — date parseable, subject present, level valid,
   ≥1 learning approach, ≥1 observed behaviour. Failures land in
   `validation_log` and the record is excluded.
3. **Windowing** — sort by date, keep only the last **10** valid records
   (`MAX_RECORDS_USED = 10`). This is the entire evidence base; older records
   have zero influence.
4. **Scoring** — `TRAIT_SCORES` maps each Learning Approach to animal points:

   | Approach | Points |
   |---|---|
   | Participates actively | Rabbit+1, Dolphin+1 |
   | Responds well to feedback | Owl+1, Dolphin+1 |
   | Works carefully | Owl+1, Turtle+1, Bee+1 |
   | Tries independently | Rabbit+1, Fox+1 |
   | Needs encouragement to start | Turtle+1 |
   | Stays focused | Turtle+1, Bee+1 |
   | Collaborates well | Dolphin+1 |
   | Shows persistence | Turtle+1, Fox+1, Bee+1 |
   | Hesitant with new tasks | Turtle+1 |
   | Shows initiative | Rabbit+1, Fox+1 |
   | Asks questions | Rabbit+1, Owl+1, Fox+1 |
   | Checks mistakes carefully | Owl+1, Bee+1 |

5. **Primary resolution** — highest score wins; ties break through a chain:
   context count → supporting record count → distinguishing record count →
   distinct distinguishing approaches → previous primary (not currently
   passed) → recent-3 score → latest distinguishing timestamp → technical
   priority order.
6. **Supporting companions** — non-primary animals with positive score,
   ≥2 supporting records and ≥2 support-specific records; ranked, max **2**.
7. **Status** — `locked` if fewer than 3 valid records; confidence is
   `Consistent` at ≥6 (`MIN_RECORDS_FOR_CONSISTENT`) else `Emerging`.

Output: `primary_learning_companion`, `supporting_learning_companions`,
evidence blocks per animal (which records/approaches fed each), repeated
aggregations, progress context, coach notes.

> If fewer than 3 valid records → report is `locked`; no AI call is made and
> (auto path) nothing is stored.

---

## 5. The DeepSeek narrative (`generateNarrative.js`)

### Trigger & retries

Up to `MAX_INSIGHT_VALIDATION_ATTEMPTS` calls to
`https://api.deepseek.com/v1/chat/completions` (`deepseek-chat`, 45s timeout).
Each response is parsed and validated; failures are fed back into the next
attempt's prompt. Without `DEEPSEEK_API_KEY`, calls throw instantly and the
flow degrades (see §7).

### The system prompt (rules the AI must obey)

- **Companions are fixed facts** — decided by the deterministic algorithm; the
  AI must not choose, change, rank, or second-guess them — only explain.
- **Grounding** — use only the evidence provided; never invent behaviours,
  dates, numbers; single-event claims framed cautiously ("in one session");
  thin evidence → write less.
- **Tone** — warm, plain, encouraging, parent-facing; no jargon ("score",
  "tie", "algorithm", "rank").
- **Evidence discipline** — every section carries `evidence_refs` (exact
  record ids); "often/regularly" needs **≥2 distinct record ids**; "this
  support helped" needs real `response_to_support`/`outcome` evidence and
  `support_method_ids` (internal ids, never shown to parents).
- **Hygiene** — never mention record ids/counts/the word "record" in visible
  text; never imply the child *is* the animal.
- **Output** — only valid JSON, exact key schema (below), no markdown fences.
- **Retry mode** — previous validation failures are appended for the next
  attempt.
- **zh mode** — Cantonese localisation instructions + progress-level glossary.

### The user payload (what is sent)

```json
{
  "student_name": "Charlie Wong",
  "full_schema_records": [ /* the ≤10 windowed records in companion shape */ ],
  "records_analysed": 10,
  "primary_companion": "Rabbit",
  "primary_companion_evidence": { /* which records/approaches fed it */ },
  "supporting_companions": ["Turtle", "Owl"],
  "supporting_companion_evidence": { /* per-animal evidence */ }
}
```

The model **never sees more than the 10-record window** — history size cannot
change the prompt.

### The required JSON output

Every key: `{ "text": "...", "evidence_refs": ["REC-..."],
"support_method_ids": ["..."] }` (support ids optional when no support claim).

| Key | UI landing | Length |
|---|---|---|
| `your_child_at_a_glance` | Insight page — "Your Child at a Glance" | 4–5 sentences |
| `how_they_approach_learning` | "How They Approach Learning" | 2–3 sentences |
| `how_they_respond_along_the_way` | "How They Respond Along the Way" | 2–3 sentences |
| `how_you_can_support_them` | Supporting page — strategies + action points | intro + 2–3 actions |
| `why_this_companion_fits` | Supporting page — "Why This Companion Fits" | 2–3 sentences |
| `also_reflected_in_their_learning` | "Also Reflected" (only if supporting companions exist) | 1–2 sentences each |

### Validation & retry outcomes

| Outcome | report_status | ai_status | Parent sees |
|---|---|---|---|
| Output passes validation | `complete` | `valid` | Full AI prose |
| JSON parsed but validation failed after all attempts | `complete` | `soft_fail` | AI prose (flagged) |
| No parseable output (e.g. no key, network down) | `ready` | `failed` | Picture + deterministic copy only, `ai_sections: null` |

`zh` reports additionally pass through `rewriteNarrativeToCantonese` if excess
English survives validation.

---

## 6. Storage & consumption

A **new** row is INSERTed into `learning_companion_reports` per generation
(never updated — history accumulates):

```
center_id, profile_id, student_name, status, records_used, records_required(3),
primary_companion, supporting_companions, algorithm_json, narrative_json, validation_log
```

`GET /api/student/passport` returns the **latest row only**
(`ORDER BY created_at DESC, id DESC LIMIT 1`) via `mapReport`. Consumers:

| Consumer | Uses |
|---|---|
| `/account` CompanionHome | `primary_companion` (picture via `resolveCompanionAnimal`), `learning_companion_section.meaning_paragraph_1`, supporting companions |
| `/account/analytical-insight` | `ai_sections` prose: at-a-glance / approach / respond |
| `/account/supporting-learning` | strategies, why-it-fits, also-reflected |
| `/account/{academic,activity}/more` | `current_learning_portrait` + `what_helps_across_programmes` (AI-gated cards) |
| Diagnostic | `getPassport` warns when records ≥ threshold but `ai_sections` empty |

---

## 7. Operational notes (long-time users, scale)

- **Output is history-proof**: classification + prompt only ever use the last
  10 valid records — a child with 1,000 records gets the same report shape as
  one with 10.
- Generation query loads **all** profile records before windowing (no LIMIT) —
  fine at thousands, worth bounding later.
- `GET /api/student/passport` caps records at `LIMIT 200` → dashboard record
  stat undercounts for >200-record users.
- Report rows accumulate (one per save). Only the latest is read; pruning old
  rows is a possible future ticket.
- The "last 90 days" wording on Learn-how-it-works is copy-only — the code
  window is count-based (last 10), with no date filter (known mismatch).
