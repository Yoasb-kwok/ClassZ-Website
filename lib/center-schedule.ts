/**
 * Centre scheduling contract (ClassZ-api#1, docs/center-scheduling-api.md).
 *
 * POST /schedule/conflicts — single-slot preview only. Does not write.
 *   Edit and substitute previews send `exclude_class_id` (not `class_id`) so
 *   the session being changed is not reported as a self-overlap.
 * POST /classes/bulk-reschedule — default skip-blocked (`skip_conflicts: true`).
 *   Abort-all is `abort_all: true` or `skip_conflicts: false`. Preview with
 *   `dry_run: true`. Blocks still return HTTP 409 and nothing is applied.
 *   `new_start_times` is a JSON object whose keys are class id strings.
 *   A per-id entry wins over `delta_minutes`.
 * POST /classes/:id/substitute — instructor id preferred, name accepted.
 *   `notify` defaults false; send `notify: true` only when the user opts in.
 * Holiday overlaps warn unless `strict_holidays` is set (then they block).
 * Instructor, room, and availability overlaps block.
 * After a write, refetch GET /classes?from=&to= (no server cache).
 */

export type ConflictKind = "holiday" | "instructor" | "room" | "availability" | "other"

export type ScheduleConflict = {
  severity: "block" | "warn"
  kind: ConflictKind
  classId: string
  className: string
  message: string
  messageZh: string
}

export type ScheduleChange = {
  classId: string
  className: string
  startTime: string
  endTime: string
  reason: string
}

export type SchedulePreview = {
  blocks: ScheduleConflict[]
  warnings: ScheduleConflict[]
  applied: ScheduleChange[]
  skipped: ScheduleChange[]
  /** Abort-all (or HTTP 409): no session is written. */
  nothingApplied: boolean
  status: number
  message: string
}

export type BulkPolicy = "skip_blocked" | "abort_all"

export type ConflictSlot = {
  classId?: string | null
  instructorId?: string | number | null
  instructorName?: string | null
  startTime: string
  endTime: string
  location?: string | null
  strictHolidays?: boolean
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function text(value: unknown): string {
  if (value == null) return ""
  return String(value).trim()
}

function readKind(row: Record<string, unknown>): ConflictKind {
  const raw = text(
    row.kind || row.type || row.code || row.conflict_type || row.reason_code || row.reason
  ).toLowerCase()
  if (raw.includes("holiday")) return "holiday"
  if (raw.includes("instructor") || raw.includes("teacher")) return "instructor"
  if (raw.includes("room") || raw.includes("venue")) return "room"
  if (raw.includes("avail")) return "availability"
  return "other"
}

function readSeverity(
  row: Record<string, unknown>,
  kind: ConflictKind,
  bucket: "block" | "warn" | "auto"
): "block" | "warn" {
  const raw = text(row.severity || row.level).toLowerCase()
  if (raw === "warn" || raw === "warning" || raw === "info") return "warn"
  if (raw === "block" || raw === "blocked" || raw === "error") return "block"
  if (bucket === "warn") return "warn"
  if (bucket === "block") return "block"
  if (kind === "holiday") return "warn"
  if (kind === "instructor" || kind === "room" || kind === "availability") return "block"
  return "block"
}

function readConflict(row: Record<string, unknown>, bucket: "block" | "warn" | "auto"): ScheduleConflict {
  const kind = readKind(row)
  const message = text(row.message_en || row.message || row.msg || row.detail || row.reason)
  const messageZh = text(row.message_zh || row.message_zh_hk || row.message || row.msg || row.detail) || message
  return {
    severity: readSeverity(row, kind, bucket),
    kind,
    classId: text(row.class_id || row.classId),
    className: text(row.class_name || row.name || row.session_name),
    message: message || messageZh,
    messageZh: messageZh || message,
  }
}

function readChange(row: Record<string, unknown>): ScheduleChange {
  return {
    classId: text(row.class_id || row.classId || row.id),
    className: text(row.class_name || row.name),
    startTime: text(row.start_time || row.new_start_time || row.start),
    endTime: text(row.end_time || row.new_end_time || row.end),
    reason: text(row.reason || row.message || row.msg || row.detail),
  }
}

function pushConflicts(
  value: unknown,
  bucket: "block" | "warn" | "auto",
  blocks: ScheduleConflict[],
  warnings: ScheduleConflict[]
) {
  if (!Array.isArray(value)) return
  for (const item of value) {
    if (typeof item === "string") {
      const conflict: ScheduleConflict = {
        severity: bucket === "warn" ? "warn" : "block",
        kind: bucket === "warn" ? "holiday" : "other",
        classId: "",
        className: "",
        message: item,
        messageZh: item,
      }
      if (conflict.severity === "warn") warnings.push(conflict)
      else blocks.push(conflict)
      continue
    }
    const row = asRecord(item)
    if (!row) continue
    const conflict = readConflict(row, bucket)
    if (conflict.severity === "warn") warnings.push(conflict)
    else blocks.push(conflict)
    if (Array.isArray(row.blocks)) pushConflicts(row.blocks, "block", blocks, warnings)
    if (Array.isArray(row.warnings)) pushConflicts(row.warnings, "warn", blocks, warnings)
  }
}

function pushChanges(value: unknown, into: ScheduleChange[]) {
  if (!Array.isArray(value)) return
  for (const item of value) {
    const row = asRecord(item)
    if (!row) continue
    const change = readChange(row)
    if (!change.classId && !change.reason && !change.className) continue
    into.push(change)
  }
}

function sourcesOf(payload: unknown): Record<string, unknown>[] {
  const root = asRecord(payload) || {}
  const data = asRecord(root.data)
  return data ? [data, root] : [root]
}

export function parseSchedulePreview(
  payload: unknown,
  status: number,
  opts?: { abortAll?: boolean }
): SchedulePreview {
  const sources = sourcesOf(payload)
  const blocks: ScheduleConflict[] = []
  const warnings: ScheduleConflict[] = []
  const applied: ScheduleChange[] = []
  const skipped: ScheduleChange[] = []

  for (const source of sources) {
    pushConflicts(source.blocks, "block", blocks, warnings)
    pushConflicts(source.conflicts, "auto", blocks, warnings)
    pushConflicts(source.warnings, "warn", blocks, warnings)
    pushConflicts(source.holiday_warnings, "warn", blocks, warnings)
    pushChanges(source.applied, applied)
    pushChanges(source.updated, applied)
    pushChanges(source.would_apply, applied)
    pushChanges(source.skipped, skipped)
  }

  const root = asRecord(payload) || {}
  const data = asRecord(root.data)
  const explicitNothing = root.nothing_applied === true || data?.nothing_applied === true
  const nothingApplied = status === 409 || explicitNothing || Boolean(opts?.abortAll && blocks.length > 0)
  const message = text(root.msg || root.message || data?.msg || data?.message)

  return {
    blocks,
    warnings,
    applied,
    skipped,
    nothingApplied,
    status,
    message,
  }
}

export function mergeSchedulePreviews(parts: SchedulePreview[]): SchedulePreview {
  return {
    blocks: parts.flatMap((part) => part.blocks),
    warnings: parts.flatMap((part) => part.warnings),
    applied: parts.flatMap((part) => part.applied),
    skipped: parts.flatMap((part) => part.skipped),
    nothingApplied: parts.some((part) => part.nothingApplied),
    status: parts.reduce((max, part) => Math.max(max, part.status), 0),
    message: parts.map((part) => part.message).filter(Boolean).join("\n"),
  }
}

function instructorField(id: string | number | null | undefined): string | number | undefined {
  if (id == null || String(id).trim() === "") return undefined
  const numeric = Number(id)
  return Number.isFinite(numeric) && String(id).trim() !== "" ? numeric : String(id)
}

/** One proposed session. The conflicts endpoint is single-slot. */
export function buildConflictPreviewBody(slot: ConflictSlot): Record<string, unknown> {
  const body: Record<string, unknown> = {
    start_time: slot.startTime,
    end_time: slot.endTime,
  }
  // Contract field. `class_id` is ignored by the conflicts API, so an edit or
  // substitute preview overlaps the class it is changing and Save stays blocked.
  if (slot.classId) body.exclude_class_id = String(slot.classId)
  const instructorId = instructorField(slot.instructorId)
  if (instructorId != null) body.instructor_id = instructorId
  const name = text(slot.instructorName)
  if (name) body.instructor = name
  const location = text(slot.location)
  if (location) body.location = location
  if (slot.strictHolidays) body.strict_holidays = true
  return body
}

/**
 * `new_start_times` keys are class id strings. Entries override `delta_minutes`
 * for that id; other selected ids still follow the delta when one is sent.
 */
export function buildBulkRescheduleBody(input: {
  classIds: string[]
  deltaMinutes: number | null
  newStartTimes: Record<string, string>
  dryRun: boolean
  policy: BulkPolicy
  strictHolidays?: boolean
}): Record<string, unknown> {
  const newStartTimes: Record<string, string> = {}
  for (const [id, value] of Object.entries(input.newStartTimes)) {
    const key = String(id).trim()
    const when = text(value)
    if (!key || !when) continue
    newStartTimes[key] = when
  }

  const body: Record<string, unknown> = {
    class_ids: input.classIds.map((id) => String(id)),
    dry_run: input.dryRun,
  }
  if (input.deltaMinutes != null && Number.isFinite(input.deltaMinutes)) {
    body.delta_minutes = input.deltaMinutes
  }
  if (Object.keys(newStartTimes).length > 0) {
    body.new_start_times = newStartTimes
  }
  if (input.policy === "abort_all") {
    body.abort_all = true
    body.skip_conflicts = false
  } else {
    body.abort_all = false
    body.skip_conflicts = true
  }
  if (input.strictHolidays) body.strict_holidays = true
  return body
}

/** Omit `notify` unless the user opts in. The server default is false. */
export function buildSubstituteBody(input: {
  instructorId?: string | number | null
  instructorName?: string | null
  notify: boolean
}): Record<string, unknown> {
  const body: Record<string, unknown> = {}
  const instructorId = instructorField(input.instructorId)
  if (instructorId != null) body.instructor_id = instructorId
  const name = text(input.instructorName)
  if (name) body.instructor = name
  if (input.notify === true) body.notify = true
  return body
}

export function formatScheduleQueryDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Refetch window required after every schedule write. */
export function classesRangePath(from: Date, to: Date): string {
  const params = new URLSearchParams()
  params.set("from", formatScheduleQueryDate(from))
  params.set("to", formatScheduleQueryDate(to))
  return `/classes?${params.toString()}`
}

export function listModeClassRange(now = new Date()): { start: Date; end: Date } {
  return {
    start: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
    end: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()),
  }
}

export function canApplyBulk(
  preview: SchedulePreview,
  selectedCount: number,
  policy: BulkPolicy
): boolean {
  if (preview.nothingApplied) return false
  if (policy === "abort_all" && preview.blocks.length > 0) return false
  if (preview.applied.length > 0) return true
  if (selectedCount > 0 && preview.skipped.length >= selectedCount) return false
  if (policy === "skip_blocked" && preview.blocks.length > 0 && preview.applied.length === 0) {
    if (preview.blocks.length >= selectedCount && preview.skipped.length === 0) return false
    return selectedCount === 0 ? false : preview.blocks.length < selectedCount || preview.skipped.length < selectedCount
  }
  return preview.blocks.length === 0
}

export function conflictMessage(conflict: ScheduleConflict, zh: boolean): string {
  const message = zh ? conflict.messageZh || conflict.message : conflict.message || conflict.messageZh
  return message || (zh ? "時段衝突" : "Schedule conflict")
}
