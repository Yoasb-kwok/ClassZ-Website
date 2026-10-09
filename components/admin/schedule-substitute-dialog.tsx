"use client"

import { useState } from "react"
import { useLanguage } from "@/components/language-provider"
import { assignClassSubstitute, previewScheduleConflict } from "@/lib/center-schedule-api"
import { type SchedulePreview } from "@/lib/center-schedule"
import type { ScheduleCalendarEvent } from "@/components/admin/schedule-calendar"
import { ScheduleConflictPanel } from "@/components/admin/schedule-conflict-panel"
import {
  AdminLabel,
  AdminModal,
  AdminPrimaryButton,
  AdminSelect,
} from "@/components/classz-admin-ui"

export function ScheduleSubstituteDialog({
  session,
  instructors,
  onClose,
  onApplied,
}: {
  session: ScheduleCalendarEvent | null
  instructors: Array<{ id: string; name: string }>
  onClose: () => void
  onApplied: () => void
}) {
  const { locale, t } = useLanguage()
  const zh = locale === "zh-TW"
  const [instructorId, setInstructorId] = useState("")
  const [notify, setNotify] = useState(false)
  const [strictHolidays, setStrictHolidays] = useState(false)
  const [preview, setPreview] = useState<SchedulePreview | null>(null)
  const [previewKey, setPreviewKey] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const instructor = instructors.find((item) => item.id === instructorId)
  const fingerprint = JSON.stringify({
    id: session?.id || "",
    instructorId,
    strictHolidays,
    start: session?.start_time || "",
    end: session?.end_time || "",
  })

  async function review() {
    if (!session) return
    if (!instructorId) {
      setError(t("classzAdmin.schedule.substituteNeedInstructor"))
      return
    }
    setBusy(true)
    setError("")
    try {
      const next = await previewScheduleConflict({
        classId: session.id,
        instructorId,
        instructorName: instructor?.name || "",
        startTime: session.start_time.slice(0, 16).replace(" ", "T"),
        endTime: session.end_time.slice(0, 16).replace(" ", "T"),
        location: session.location,
        strictHolidays,
      })
      setPreview(next)
      setPreviewKey(fingerprint)
    } catch (e) {
      setPreview(null)
      setError(e instanceof Error ? e.message : "Preview failed")
    } finally {
      setBusy(false)
    }
  }

  async function confirm() {
    if (!session || !preview || previewKey !== fingerprint || preview.blocks.length > 0) return
    setBusy(true)
    setError("")
    try {
      await assignClassSubstitute(session.id, {
        instructorId,
        instructorName: instructor?.name || "",
        notify,
      })
      onApplied()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed")
    } finally {
      setBusy(false)
    }
  }

  const fresh = Boolean(preview && previewKey === fingerprint)
  const blocked = Boolean(fresh && preview && preview.blocks.length > 0)

  return (
    <AdminModal
      open={session !== null}
      title={t("classzAdmin.schedule.substituteTitle")}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="px-4 py-2.5 text-base rounded-md border border-classz-200 text-classz-700" onClick={onClose}>
            {zh ? "取消" : "Cancel"}
          </button>
          <button
            type="button"
            data-testid="schedule-substitute-preview"
            className="px-4 py-2.5 text-base rounded-md border border-classz-200 text-classz-700 disabled:opacity-50"
            disabled={busy}
            onClick={review}
          >
            {busy && !fresh ? t("classzAdmin.schedule.checking") : t("classzAdmin.schedule.checkConflicts")}
          </button>
          <AdminPrimaryButton
            type="button"
            data-testid="schedule-substitute-confirm"
            disabled={!fresh || blocked || busy}
            onClick={confirm}
          >
            {t("classzAdmin.schedule.confirmSubstitute")}
          </AdminPrimaryButton>
        </>
      }
    >
      {session ? (
        <div className="space-y-3">
          <p className="text-sm text-classz-700">
            <span className="font-medium">{session.name}</span>
            <span className="block text-classz-500">{session.start_time.replace("T", " ").slice(0, 16)}</span>
          </p>
          <div>
            <AdminLabel>{t("classzAdmin.schedule.instructor")}</AdminLabel>
            <AdminSelect
              data-testid="schedule-substitute-instructor"
              value={instructorId}
              onChange={(e) => setInstructorId(e.target.value)}
            >
              <option value="">{t("classzAdmin.schedule.chooseInstructor")}</option>
              {instructors.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </AdminSelect>
          </div>
          <label className="flex items-start gap-2 text-sm text-classz-700">
            <input
              data-testid="schedule-notify"
              type="checkbox"
              className="mt-1"
              checked={notify}
              onChange={(e) => setNotify(e.target.checked)}
            />
            <span>
              <span className="font-medium">{t("classzAdmin.schedule.notify")}</span>
              <span className="block text-classz-500">{t("classzAdmin.schedule.notifyHelp")}</span>
            </span>
          </label>
          <label className="flex items-start gap-2 text-sm text-classz-700">
            <input type="checkbox" className="mt-1" checked={strictHolidays} onChange={(e) => setStrictHolidays(e.target.checked)} />
            <span>
              <span className="font-medium">{t("classzAdmin.schedule.strictHolidays")}</span>
              <span className="block text-classz-500">{t("classzAdmin.schedule.strictHolidaysHelp")}</span>
            </span>
          </label>
          {error ? <p className="text-sm text-brand-coral">{error}</p> : null}
          {fresh && preview ? <ScheduleConflictPanel preview={preview} slotsChecked={1} /> : null}
        </div>
      ) : null}
    </AdminModal>
  )
}
