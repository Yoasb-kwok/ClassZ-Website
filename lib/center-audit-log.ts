/**
 * Centre scheduling audit log.
 * GET /api/center/audit-log — the client prefix adds /center for a centre admin.
 * `from` / `to` are YYYY-MM-DD. The table also filters those dates locally so a
 * response that ignores the query still matches the picker.
 */

export type CenterAuditRow = {
  id: string
  at: string
  actor: string
  action: string
  target: string
  details: string
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function text(value: unknown): string {
  if (value == null) return ""
  if (typeof value === "string") return value.trim()
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  return ""
}

function pick(row: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = text(row[key])
    if (value) return value
  }
  return ""
}

function listFrom(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload
  const root = asRecord(payload)
  if (!root) return []
  const keys = ["entries", "rows", "items", "logs", "audit_log", "results", "data"]
  const queues: unknown[] = [root]
  const data = asRecord(root.data)
  if (data) queues.push(data)
  for (const source of queues) {
    const record = asRecord(source)
    if (!record) continue
    for (const key of keys) {
      if (Array.isArray(record[key])) return record[key] as unknown[]
    }
  }
  return []
}

function detailsFrom(row: Record<string, unknown>): string {
  const direct = pick(row, ["message", "details", "summary", "description", "note", "reason"])
  if (direct) return direct
  const extra = row.changes ?? row.payload ?? row.meta ?? row.diff
  if (extra && typeof extra === "object") {
    try {
      return JSON.stringify(extra)
    } catch {
      return ""
    }
  }
  return text(extra)
}

function targetFrom(row: Record<string, unknown>): string {
  const type = pick(row, ["target_type", "entity_type", "resource", "subject"])
  const id = pick(row, ["target_id", "entity_id", "class_id", "resource_id"])
  const name = pick(row, ["class_name", "target_name", "name"])
  const parts = [type, name, id ? `#${id}` : ""].filter(Boolean)
  return parts.join(" ")
}

export function centerAuditLogPath(from?: string, to?: string): string {
  const params = new URLSearchParams()
  if (from) params.set("from", from)
  if (to) params.set("to", to)
  const qs = params.toString()
  return qs ? `/audit-log?${qs}` : "/audit-log"
}

/** Local calendar day for a timestamp, used by the date filter. */
export function auditRowDay(at: string): string {
  const trimmed = at.trim()
  if (!trimmed) return ""
  const parsed = new Date(trimmed.includes("T") ? trimmed : trimmed.replace(" ", "T"))
  if (Number.isNaN(parsed.getTime())) return trimmed.slice(0, 10)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`
}

export function parseCenterAuditLog(payload: unknown): CenterAuditRow[] {
  return listFrom(payload).flatMap((item, index) => {
    const row = asRecord(item)
    if (!row) return []
    const at = pick(row, ["created_at", "createdAt", "timestamp", "logged_at", "occurred_at", "at"])
    const actor = pick(row, ["actor", "actor_name", "actor_email", "user_name", "user_email", "performed_by", "email"])
    const action = pick(row, ["action", "event", "operation", "type"])
    const target = targetFrom(row)
    const details = detailsFrom(row)
    if (!at && !actor && !action && !target && !details) return []
    const id = pick(row, ["id"]) || `${at}-${action}-${index}`
    return [{ id, at, actor, action, target, details }]
  })
}

export function filterAuditRowsByDate(rows: CenterAuditRow[], from?: string, to?: string): CenterAuditRow[] {
  return rows.filter((row) => {
    if (!from && !to) return true
    const day = auditRowDay(row.at)
    if (!day) return false
    if (from && day < from) return false
    if (to && day > to) return false
    return true
  })
}
