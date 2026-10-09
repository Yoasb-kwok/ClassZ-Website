import { apiSend, ClasszApiError } from "@/lib/classz-api-client"
import {
  buildBulkRescheduleBody,
  buildConflictPreviewBody,
  buildSubstituteBody,
  parseSchedulePreview,
  type BulkPolicy,
  type ConflictSlot,
  type SchedulePreview,
} from "@/lib/center-schedule"

async function postSchedule(path: string, body: Record<string, unknown>, abortAll = false): Promise<SchedulePreview> {
  const result = await apiSend<unknown>("POST", path, body)
  if (!result.ok && result.status !== 409) {
    throw new ClasszApiError(result.message, result.status, result.payload)
  }
  return parseSchedulePreview(result.payload, result.status, { abortAll })
}

/** Single-slot preview. Does not create or move a class. */
export function previewScheduleConflict(slot: ConflictSlot): Promise<SchedulePreview> {
  return postSchedule("/schedule/conflicts", buildConflictPreviewBody(slot))
}

export function previewBulkReschedule(input: {
  classIds: string[]
  deltaMinutes: number | null
  newStartTimes: Record<string, string>
  policy: BulkPolicy
  strictHolidays?: boolean
}): Promise<SchedulePreview> {
  const abortAll = input.policy === "abort_all"
  return postSchedule(
    "/classes/bulk-reschedule",
    buildBulkRescheduleBody({ ...input, dryRun: true }),
    abortAll
  )
}

export function applyBulkReschedule(input: {
  classIds: string[]
  deltaMinutes: number | null
  newStartTimes: Record<string, string>
  policy: BulkPolicy
  strictHolidays?: boolean
}): Promise<SchedulePreview> {
  const abortAll = input.policy === "abort_all"
  return postSchedule(
    "/classes/bulk-reschedule",
    buildBulkRescheduleBody({ ...input, dryRun: false }),
    abortAll
  )
}

export function assignClassSubstitute(
  classId: string,
  input: { instructorId?: string | number | null; instructorName?: string | null; notify: boolean }
): Promise<SchedulePreview> {
  return postSchedule(`/classes/${encodeURIComponent(classId)}/substitute`, buildSubstituteBody(input))
}
