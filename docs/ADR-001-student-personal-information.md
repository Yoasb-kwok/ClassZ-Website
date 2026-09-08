# ADR-001: Student Portal — Personal Information Module

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-09-08 |
| **Decision Maker** | mrcoffeespoon |
| **Related** | `docs/Centre_Admin_Tech_Spec.md`, `docs/UI_Implementation_Plan.md`, `ClassZ-api/routes/studentRoute.js`, `ClassZ-Website/lib/student-passport.ts`, `ClassZ-Website/components/account/student-shell.tsx` |

---

## Context

The supervisor's task list requires a **Student Home Page** with a **Personal Information** module that the parent can view and edit. The student portal UI now exists on the website (`app/account/*`, `components/account/student-shell.tsx`, `lib/student-passport.ts`), and it renders from a single data call — `GET /api/student/passport` (`fetchStudentPassport` in `lib/student-passport.ts`). That endpoint **does not exist yet** in `ClassZ-api/routes/studentRoute.js` (currently 404), while the older self-service endpoints (`/tokens`, `/upcoming-classes`, `/notifications`, `/class-notices`) do.

Personal information in this system is **two-layer**: the `users` row is the parent account (the login), and children are rows in `profiles` linked by `profiles.user_id`. The module therefore shows a parent block (account) and a child block (learner). Today there is **no student-scoped read or write path** for either layer: `updateAccount` in `ClassZ-api/controllers/userController.js` handles email/mobile but is **never mounted** in `routes/userRoute.js`, and all profile-edit endpoints are centre-scoped (`/api/center/*`), which deliberately 403 student tokens via `requireCenterPortalAccess`.

Decisions D1–D4 below cover: the child photo (schema + upload), the edit API shape, the field allowlist and email-change rule, and the presentation on the home page. The prerequisite `GET /api/student/passport` aggregation endpoint is a separate build item (same release, not a decision recorded here).

---

## Decision Summary

| # | Decision | Choice |
|---|----------|--------|
| D1 | Child photo storage & upload | `profiles.photo_url` column + `POST /api/student/me/photo`, local `uploads/` disk, local-first migration |
| D2 | Edit API shape | Two endpoints: `PATCH /api/student/account` + `PATCH /api/student/profiles/:profileId` |
| D3 | Field allowlist & email rule | Allowlist tables below; **email changes require OTP** to the new address |
| D4 | Presentation & multi-child | Personal Info card on home (`/account`) + one zpassport-style edit modal (parent + child sections); edits target the sidebar-selected child |

---

## Decision 1: Child photo — `profiles.photo_url` + student upload endpoint

**Decision:** Add `photo_url TEXT` to `profiles`, and expose `POST /api/student/me/photo` which accepts the same base64 data-URL payload the centre upload uses (`POST /api/center/uploads` → saves to `uploads/` → returns `{ url }`), restricted to `image/*` and ≤ 5 MB, writing **only** to the caller's own profile (`WHERE profiles.user_id = req.user.id`).

```sql
-- Dual-dialect migration (MySQL shown; PG twin in database/schema.pg.sql update)
ALTER TABLE profiles ADD COLUMN photo_url TEXT NULL;
```

### Alternatives Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **A. Column + student upload endpoint (chosen)** | Feature works end-to-end; reuses proven base64→`uploads/` storage; lights up existing `childPhoto()` avatar in sidebar + profile card | Students gain a disk write path (mitigated: type + size limits, self-scope only) | ✅ |
| B. Column now, upload later | Smallest diff | Nothing can ever set the column; avatar never renders; invisible feature | ❌ |
| C. Derive photo from latest `activity_learning_records.photo_url` | No migration | Class snapshot ≠ child portrait; uncontrollably changes; parent has no say | ❌ |

### Context

The parent has **no Railway infrastructure edit access** right now, so: the migration runs **local-first** (MySQL), and syncing it to the Railway Postgres later is one idempotent command (`set -a; . ./.env.railway; set +a; npm run <migration>`). Storage stays on the local `uploads/` dir — Railway's ephemeral disk is **accepted as dev-stage debt**, the same class of problem the existing ALR photos already have.

### Consequences

- **Positive:** photo renders everywhere `childPhoto()` / `profile.photo_url` is already read (sidebar, profile card, future pages) with zero extra frontend wiring.
- **Negative:** photos stored on ephemeral Railway disk will 404 after a redeploy until storage is externalised.
- **Review trigger:** the moment Railway volume mounts or object storage (S3/R2) becomes available, move `uploads/` storage behind a single helper and backfill existing files.

---

## Decision 2: Edit API shape — two endpoints split by table ownership

**Decision:** Mount and extend the orphaned `updateAccount` as `PATCH /api/student/account`, and add `PATCH /api/student/profiles/:profileId` for child fields, scoped by `WHERE profiles.user_id = req.user.id` (id from the JWT, never the body).

```
PATCH /api/student/account             → users table   (name, full_name, mobile, country_code; email via OTP — see D3)
PATCH /api/student/profiles/:profileId → profiles table (allowlist per D3; 404 if profileId not owned by req.user.id)
POST  /api/student/me/photo            → profiles.photo_url (D1)
```

### Alternatives Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **A. Two endpoints (chosen)** | Mirrors `users` vs `profiles` ownership; reuses `updateAccount` validation + OTP scaffolding; per-endpoint allowlists; cross-family edits structurally impossible (JWT scope) | Two handlers instead of one | ✅ |
| B. Single `PATCH /api/student/me` | One round-trip | Mixes two tables; muddy partial-update semantics when `profile_id` omitted; one oversized allowlist | ❌ |
| C. Loosen the centre guard (reuse `/center/*`) | No new backend | Breaks the deliberate `requireCenterPortalAccess` 403 wall; centre endpoints assume staff context (e.g. `getCentreStudentLimit`) | ❌ |

### Context

`updateAccount` already implements email uniqueness checking and mobile handling but was never mounted — this revives it rather than duplicating it. The centre portal wall stays intact: students never call `/api/center/*`.

### Consequences

- **Positive:** clear ownership per endpoint; centre endpoints untouched; no new auth model.
- **Negative:** the Edit modal issues up to two PATCHes per save (account + child), plus a third when the photo changed.
- **Review trigger:** if a parent dashboard grows to edit >2 owned resources, consider a composite `PATCH /student/me` façade that fans out server-side.

---

## Decision 3: Field allowlist — and email changes are OTP-verified

**Decision:** Only the fields below are accepted by each endpoint; unknown/read-only fields are rejected server-side. Email is **not** directly writable: changing it requires the existing `POST /user/send-verify-email` → `POST /user/verify-otp` flow against the **new** address. The mounted student `account` handler splits email out of `updateAccount`'s direct-write path.

**`PATCH /api/student/account`** (`users`)

| Field | Editable | Validation |
|---|---|---|
| `name`, `full_name` | ✅ | non-empty, ≤120 chars |
| `mobile`, `country_code` | ✅ | digits ≤15; country code from list |
| `email` | via OTP only | uniqueness check on the *new* address (reuses `updateAccount` logic post-verification) |
| password | not here | existing `POST /user/change-password` |

**`PATCH /api/student/profiles/:profileId`** (`profiles`)

| Field | Editable | Validation |
|---|---|---|
| `full_name`, `nick_name`, `parents_name` | ✅ | non-empty (`full_name`), ≤120 |
| `date_of_birth` | ✅ | valid past date, ≤25 years ago (also feeds computed `age` in the passport) |
| `sex` | ✅ | `0` or `1` |
| `school`, `residential_district` | ✅ | district must exist in `lib/locations.ts` |
| `contact_number` | ✅ | digits ≤15 |
| `medical_notes` | ✅ | free text ≤2000 chars — **parent-authored note shared with the centre** |
| `level` (grade), `student_id`, `has_joined_courses` | ❌ rejected | centre-set |
| `id_first_four`, `id_last_four` | ❌ rejected | display-only, masked (`X`-prefixed) in UI |
| `photo_url` | not on this endpoint | only via `POST /api/student/me/photo` (D1) |

### Alternatives Considered (email rule)

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **A. OTP-verified email change (chosen)** | Email is both login ID and recovery channel — OTP prevents lockout-by-typo and takeover on shared devices; endpoints already exist | Extra OTP input + resend UI in the modal (shown only when email changed) | ✅ |
| B. Direct update (current `updateAccount` behavior) | One save button | Typo → locked out; takeover vector | ❌ |

### Context

`medical_notes` semantics were set by the product owner: it is a **parent-side note given to the centre**. The centre's own edit path (`PATCH /api/center/student-profiles/:id/medical-notes`) remains — edits from either side are last-write-wins.

### Consequences

- **Positive:** allowlist doubles as the API contract for frontend form fields; no way to write centre-owned fields; sensitive columns never leave the server unmasked.
- **Negative:** centre and parent can both edit `medical_notes` with no conflict detection (last-write-wins).
- **Review trigger:** if centres report overwritten medical notes, add per-field `updated_at` on `profiles` or a small change log.

---

## Decision 4: Presentation — home-page card + one edit modal

**Decision:** A **Personal Information** card is added to the `/account` home (above/below the companion card) rendering the parent block and the currently-selected child block. **Edit** opens a single zpassport-styled modal with two sections (Parent / Child); the photo picker lives in the child section; read-only fields (`level`, `student_id`, masked HKID) carry a "Set by centre" hint. On save: `PATCH`es fire, then the passport context is invalidated and refetched so the sidebar avatar/age update.

**Multi-child rule:** the module always shows the child selected via the existing sidebar `ProfileSelect` (the passport context's `profile` + `setProfileId`). Edits apply to that child. The parent block is account-level and identical across children.

### Alternatives Considered

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **A. Home card + modal (chosen)** | Satisfies "module on the home page" literally; one edit surface; context refetch keeps all views consistent | Home page gets longer; modal must be styled in `zpassport.css` language (admin `AdminModal` kit would clash) | ✅ |
| B. Card links to `/account/profile` edit page | Separation of concerns | Splits one feature across two pages; profile page would need the same form anyway | ❌ |
| C. Fully inline editing | Fewest clicks | Cluttered home; zpassport cards not built for form layout; read-only fields harder to distinguish | ❌ |

### Consequences

- **Positive:** single source of truth (passport context) drives card, modal, and sidebar; no new data-fetch path.
- **Negative:** a failed child PATCH after a successful account PATCH leaves a partial save — the modal reports per-section success/failure instead of transactional all-or-nothing.
- **Review trigger:** if parents with 3+ children report confusion, add per-child tabs inside the modal instead of relying on the sidebar selection.

---

## Consequence Summary

### Schema Changes Required

| Change | Target | Risk |
|---|---|---|
| `ALTER TABLE profiles ADD COLUMN photo_url TEXT NULL` | `database/schema.sql` + `database/schema.pg.sql` + idempotent migration script | Low — additive, nullable; local-first, Railway sync deferred until DB access returns |

### New API Endpoints

| Endpoint | Controller home | Notes |
|---|---|---|
| `GET /api/student/passport` *(prerequisite)* | `studentController` | Aggregate: profiles (+computed `age`), latest companion report, ALR records/lessons, work_samples, moments |
| `PATCH /api/student/account` | mount `updateAccount`, extend with `name`/`full_name`, split email to OTP | |
| `PATCH /api/student/profiles/:profileId` | `studentController` (new) | Allowlist per D3, `user_id` scope |
| `POST /api/student/me/photo` | new, reusing centre upload storage code | `image/*`, ≤5 MB |

### New UI Changes

| Item | File | Notes |
|---|---|---|
| Personal Information card | `components/account/student-shell.tsx` (new export, rendered in `CompanionHome`) | parent + child blocks, masked HKID, "Set by centre" hints |
| Edit modal (parent + child sections, OTP step, photo picker) | new component in `components/account/`, styled in `zpassport.css` | shown only on the card's Edit action |
| Passport refetch after save | `useStudentPassport` context | invalidate + refetch so sidebar/card stay consistent |

---

## Review Triggers

| Condition | Revisit |
|---|---|
| Railway volume/object storage becomes available | D1 — externalise `uploads/` storage, backfill files |
| Railway Postgres access restored | Run the pending `photo_url` migration online (idempotent one-liner) |
| Centres report medical-note overwrites | D3 — per-field timestamps or change log on `profiles` |
| Parents with 3+ children find selection confusing | D4 — per-child tabs in the modal |
| Email/mobile OTP flow needs localisation or rate limiting | D3 — extend existing `verification_codes` handling |
