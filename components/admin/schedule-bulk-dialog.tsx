"use client"

import { useMemo, useState } from "react"
import { useLanguage } from "@/components/language-provider"
import { applyBulkReschedule, previewBulkReschedule } from "@/lib/center-schedule-api"
import { canApplyBulk, type BulkPolicy, type SchedulePreview } from "@/lib/center-schedule"
import type { ScheduleCalendarEvent } from "@/components/admin/schedule-calendar"
import { ScheduleConflictPanel, fillScheduleText } from "@/components/admin/schedule-conflict-panel"
import {
  AdminInput,
  AdminLabel,
  AdminModal,
  AdminPrimaryButton,
} from "@/components/classz-admin-ui"

export function ScheduleBulkDialog({
  open,
  sessions,
  onClose,
  onApplied,
}: {
  open: boolean
  sessions: ScheduleCalendarEvent[]
  onClose: () => void
  onApplied: (focus?: Date) => void
}) {
  const { locale, t } = useLanguage()
  const zh = locale === "zh-TW"
  const [policy, setPolicy] = useState<BulkPolicy>("skip_blocked")
  const [delta, setDelta] = useState("60")
  const [starts, setStarts] = useState<Record<string, string>>({})
  const [strictHolidays, setStrictHolidays] = useState(false)
  const [preview, setPreview] = useState<SchedulePreview | null>(null)
  const [previewKey, setPreviewKey] = useState("")
  const [busy, setBusy] = useState<"preview" | "apply" | null>(null)
  const [error, setError] = useState("")

  const fingerprint = useMemo(
    () =>
      JSON.stringify({
        ids: sessions.map((session) => session.id),
        policy,
        delta,
        starts,
        strictHolidays,
      }),
    [sessions, policy, delta, starts, strictHolidays]
  )

  function requestBody() {
    const trimmed = delta.trim()
    const deltaMinutes = trimmed === "" ? null : Number(trimmed)
    return {
      classIds: sessions.map((session) => String(session.id)),
      deltaMinutes: deltaMinutes != null && Number.isFinite(deltaMinutes) ? deltaMinutes : null,
      newStartTimes: starts,
      policy,
      strictHolidays,
    }
  }

  function validate(): string | null {
    if (sessions.length === 0) return t("classzAdmin.schedule.chooseSessions")
    const body = requestBody()
    const explicit = Object.values(starts).filter((value) => value.trim()).length
    if (body.deltaMinutes == null && explicit < sessions.length) return t("classzAdmin.schedule.needShift")
    if (body.deltaMinutes != null && !Number.isFinite(body.deltaMinutes)) return t("classzAdmin.schedule.needShift")
    return null
  }

  async function runPreview() {
    const problem = validate()
    if (problem) {
      setError(problem)
      return
    }
    setBusy("preview")
    setError("")
    try {
      const next = await previewBulkReschedule(requestBody())
      setPreview(next)
      setPreviewKey(fingerprint)
    } catch (e) {
      setPreview(null)
      setError(e instanceof Error ? e.message : "Preview failed")
    } finally {
      setBusy(null)
    }
  }

  async function runApply() {
    if (!preview || previewKey !== fingerprint || !canApplyBulk(preview, sessions.length, policy)) return
    setBusy("apply")
    setError("")
    try {
      const next = await applyBulkReschedule(requestBody())
      if (next.nothingApplied || (policy === "abort_all" && next.blocks.length > 0)) {
        setPreview(next)
        setPreviewKey(fingerprint)
        return
      }
      const focusSource = next.applied.find((row) => row.startTime)?.startTime || Object.values(starts).find(Boolean)
      const focus = focusSource ? new Date(focusSource.includes("T") ? focusSource : focusSource.replace(" ", "T")) : undefined
      onApplied(focus && !Number.isNaN(focus.getTime()) ? focus : undefined)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed")
    } finally {
      setBusy(null)
    }
  }

  const fresh = preview && previewKey === fingerprint
  const allowApply = Boolean(fresh && preview && canApplyBulk(preview, sessions.length, policy))

  return (
    <AdminModal
      open={open}
      size="lg"
      title={t("classzAdmin.schedule.bulkTitle")}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="px-4 py-2.5 text-base rounded-md border border-classz-200 text-classz-700" onClick={onClose}>
            {zh ? "取消" : "Cancel"}
          </button>
          <button
            type="button"
            data-testid="schedule-bulk-preview"
            className="px-4 py-2.5 text-base rounded-md border border-classz-200 text-classz-700 disabled:opacity-50"
            disabled={busy !== null}
            onClick={runPreview}
          >
            {busy === "preview" ? t("classzAdmin.schedule.previewing") : t("classzAdmin.schedule.preview")}
          </button>
          <AdminPrimaryButton type="button" data-testid="schedule-bulk-confirm" disabled={!allowApply || busy !== null} onClick={runApply}>
            {busy === "apply" ? t("classzAdmin.schedule.applying") : t("classzAdmin.schedule.confirmApply")}
          </AdminPrimaryButton>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-classz-600">
          {fillScheduleText(t("classzAdmin.schedule.selectedCount"), { n: sessions.length })}
        </p>
        <fieldset className="space-y-2">
          <label className="flex items-start gap-2 text-sm text-classz-700">
            <input
              data-testid="schedule-policy-skip"
              type="radio"
              name="bulk-policy"
              className="mt-1"
              checked={policy === "skip_blocked"}
              onChange={() => setPolicy("skip_blocked")}
            />
            <span>
              <span className="font-medium">{t("classzAdmin.schedule.policySkip")}</span>
              <span className="block text-classz-500">{t("classzAdmin.schedule.skipHelp")}</span>
            </span>
          </label>
          <label className="flex items-start gap-2 text-sm text-classz-700">
            <input
              data-testid="schedule-policy-abort"
              type="radio"
              name="bulk-policy"
              className="mt-1"
              checked={policy === "abort_all"}
              onChange={() => setPolicy("abort_all")}
            />
            <span>
              <span className="font-medium">{t("classzAdmin.schedule.policyAbort")}</span>
              <span className="block text-classz-500">{t("classzAdmin.schedule.abortHelp")}</span>
            </span>
          </label>
        </fieldset>
        <div>
          <AdminLabel>{t("classzAdmin.schedule.deltaLabel")}</AdminLabel>
          <AdminInput data-testid="schedule-delta" inputMode="numeric" value={delta} onChange={(e) => setDelta(e.target.value)} />
          <p className="mt-1 text-xs text-classz-500">{t("classzAdmin.schedule.deltaHelp")}</p>
        </div>
        <div>
          <AdminLabel>{t("classzAdmin.schedule.newTimesLabel")}</AdminLabel>
          <div className="space-y-2">
            {sessions.map((session) => (
              <label key={session.id} className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-1 sm:items-center">
                <span className="text-sm text-classz-700">
                  <span className="font-medium">{session.name}</span>
                  <span className="block text-xs text-classz-500">
                    {t("classzAdmin.schedule.currentStart")}: {session.start_time.replace("T", " ").slice(0, 16)}
                  </span>
                </span>
                <AdminInput
                  type="datetime-local"
                  data-testid={`schedule-new-start-${session.id}`}
                  value={starts[session.id] || ""}
                  onChange={(e) => setStarts((prev) => ({ ...prev, [session.id]: e.target.value }))}
                />
              </label>
            ))}
          </div>
        </div>
        <label className="flex items-start gap-2 text-sm text-classz-700">
          <input
            data-testid="schedule-strict-holidays"
            type="checkbox"
            className="mt-1"
            checked={strictHolidays}
            onChange={(e) => setStrictHolidays(e.target.checked)}
          />
          <span>
            <span className="font-medium">{t("classzAdmin.schedule.strictHolidays")}</span>
            <span className="block text-classz-500">{t("classzAdmin.schedule.strictHolidaysHelp")}</span>
          </span>
        </label>
        {error ? <p className="text-sm text-brand-coral">{error}</p> : null}
        {fresh && preview ? (
          <ScheduleConflictPanel preview={preview} showOutcome appliedLabel={t("classzAdmin.schedule.wouldUpdate")} />
        ) : null}
      </div>
    </AdminModal>
  )
}
