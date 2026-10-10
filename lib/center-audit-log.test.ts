import assert from "node:assert/strict"
import test from "node:test"
import {
  centerAuditLogPath,
  filterAuditRowsByDate,
  parseCenterAuditLog,
} from "./center-audit-log.ts"

test("audit log path is the centre contract route with optional dates", () => {
  assert.equal(centerAuditLogPath(), "/audit-log")
  assert.equal(centerAuditLogPath("2026-10-01", "2026-10-10"), "/audit-log?from=2026-10-01&to=2026-10-10")
})

test("audit log rows accept a data array and common field names", () => {
  const rows = parseCenterAuditLog({
    success: true,
    data: [
      {
        id: 4,
        created_at: "2026-10-09T04:00:00.000Z",
        actor_email: "center@demo.com",
        action: "class.substitute",
        class_id: 12,
        class_name: "Piano basics",
        message: "Instructor changed",
      },
    ],
  })
  assert.equal(rows.length, 1)
  assert.equal(rows[0].id, "4")
  assert.equal(rows[0].actor, "center@demo.com")
  assert.equal(rows[0].action, "class.substitute")
  assert.equal(rows[0].target, "Piano basics #12")
  assert.equal(rows[0].details, "Instructor changed")
})

test("audit log rows unwrap nested entries and filter by local day", () => {
  const rows = parseCenterAuditLog({
    data: {
      entries: [
        { id: "a", timestamp: "2026-10-01T12:00:00.000Z", event: "class.update", entity_type: "class", entity_id: "9" },
        { id: "b", timestamp: "2026-10-08T12:00:00.000Z", event: "class.create", summary: "Art lab" },
      ],
    },
  })
  assert.equal(rows[0].action, "class.update")
  assert.equal(rows[0].target, "class #9")
  const filtered = filterAuditRowsByDate(rows, "2026-10-08", "2026-10-08")
  assert.equal(filtered.length, 1)
  assert.equal(filtered[0].id, "b")
})
