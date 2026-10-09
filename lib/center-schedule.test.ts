import assert from "node:assert/strict"
import test from "node:test"
import {
  buildBulkRescheduleBody,
  buildConflictPreviewBody,
  buildSubstituteBody,
  canApplyBulk,
  classesRangePath,
  parseSchedulePreview,
} from "./center-schedule.ts"

test("conflict preview is a single slot", () => {
  const body = buildConflictPreviewBody({
    classId: "12",
    instructorId: "4",
    instructorName: "Ada Wong",
    startTime: "2026-10-16T10:00",
    endTime: "2026-10-16T11:00",
    location: "Room A",
    strictHolidays: true,
  })
  assert.equal(Array.isArray(body.slots), false)
  assert.equal(body.class_id, "12")
  assert.equal(body.instructor_id, 4)
  assert.equal(body.instructor, "Ada Wong")
  assert.equal(body.strict_holidays, true)
  assert.equal("items" in body, false)
})

test("new_start_times keys are class id strings and can be sent with delta", () => {
  const body = buildBulkRescheduleBody({
    classIds: ["12", "13"],
    deltaMinutes: 60,
    newStartTimes: { 12: "2026-10-20T09:00" } as unknown as Record<string, string>,
    dryRun: true,
    policy: "skip_blocked",
  })
  const times = body.new_start_times as Record<string, string>
  assert.deepEqual(Object.keys(times), ["12"])
  assert.equal(typeof Object.keys(times)[0], "string")
  assert.equal(times["12"], "2026-10-20T09:00")
  assert.equal(body.delta_minutes, 60)
  assert.equal(body.dry_run, true)
  assert.equal(body.skip_conflicts, true)
  assert.equal(body.abort_all, false)
  const serialized = JSON.parse(JSON.stringify(body.new_start_times)) as Record<string, string>
  assert.equal(Array.isArray(serialized), false)
  assert.equal(serialized["12"], "2026-10-20T09:00")
})

test("abort-all preview asks for dry_run and expects a 409 nothing-applied parse", () => {
  const body = buildBulkRescheduleBody({
    classIds: ["9"],
    deltaMinutes: 1440,
    newStartTimes: {},
    dryRun: true,
    policy: "abort_all",
  })
  assert.equal(body.abort_all, true)
  assert.equal(body.skip_conflicts, false)
  assert.equal(body.dry_run, true)

  const preview = parseSchedulePreview(
    {
      success: false,
      msg: "conflicts",
      data: {
        applied: [],
        blocks: [
          {
            class_id: "9",
            type: "instructor",
            severity: "block",
            message: "Instructor overlap",
            message_zh: "導師時間重疊",
          },
        ],
        warnings: [{ class_id: "9", type: "holiday", message: "Chung Yeung Festival", message_zh: "重陽節" }],
      },
    },
    409,
    { abortAll: true }
  )
  assert.equal(preview.nothingApplied, true)
  assert.equal(preview.blocks.length, 1)
  assert.equal(preview.blocks[0].kind, "instructor")
  assert.equal(preview.warnings[0].kind, "holiday")
  assert.equal(preview.warnings[0].severity, "warn")
  assert.equal(canApplyBulk(preview, 1, "abort_all"), false)
})

test("skip-blocked dry run keeps going for sessions that are not blocked", () => {
  const preview = parseSchedulePreview(
    {
      success: true,
      data: {
        applied: [{ class_id: "13", name: "Art", start_time: "2026-10-16T11:00" }],
        skipped: [{ class_id: "12", name: "Piano", reason: "instructor overlap" }],
        warnings: [{ class_id: "13", type: "holiday", severity: "warn", message: "Public holiday" }],
      },
    },
    200
  )
  assert.equal(preview.nothingApplied, false)
  assert.equal(preview.applied.length, 1)
  assert.equal(preview.skipped.length, 1)
  assert.equal(preview.warnings[0].severity, "warn")
  assert.equal(canApplyBulk(preview, 2, "skip_blocked"), true)
})

test("substitute notify is omitted unless the user opts in", () => {
  const off = buildSubstituteBody({ instructorId: "8", instructorName: "Bo", notify: false })
  assert.equal(off.instructor_id, 8)
  assert.equal(off.instructor, "Bo")
  assert.equal("notify" in off, false)

  const on = buildSubstituteBody({ instructorId: "8", instructorName: "Bo", notify: true })
  assert.equal(on.notify, true)
})

test("class refetch path always includes from and to", () => {
  const path = classesRangePath(new Date(2026, 9, 1), new Date(2026, 9, 31))
  assert.equal(path, "/classes?from=2026-10-01&to=2026-10-31")
})
