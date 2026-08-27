"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Camera, ClipboardList } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { isDemoSession } from "@/components/admin/use-admin-api"
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/classz-api-client"
import { resolveUploadUrl } from "@/lib/resolve-upload-url"
import { FEEDBACK_FORM_FIELD, FEEDBACK_LIST_TITLE, FEEDBACK_STACK } from "@/lib/feedback-layout"
import {
  type ActivityLearningRecordRow,
  countWords,
  formatRecordSummary,
  progressLevelLabel,
} from "@/lib/activity-learning-record"
import {
  applyPreviousNextFocus,
  assignNextFocus,
  buildVersion2ApiBody,
  clearLearningRecordDraft,
  emptyVersion2Form,
  formFromRecordRow,
  isMeaningfulLearningRecordDraft,
  latestNextFocus,
  learningRecordDraftKey,
  loadLearningRecordDraft,
  QUESTIONS,
  saveLearningRecordDraft,
  validateVersion2Form,
  type Version2LearningRecordForm,
} from "@/lib/version2-learning-record"
import { Version2LearningRecordFields } from "@/components/admin/version2-learning-record-form"
import { AdminCard, AdminGhostButton, AdminLabel, AdminPrimaryButton, AdminSelect } from "@/components/classz-admin-ui"

type ClassOption = { id: string; name: string }
type EnrollmentOption = { id: string; profile_name: string; user_name: string }

export function ActivityLearningRecordSection({
  classes,
  classFilter,
  onClassFilterChange,
}: {
  classes: ClassOption[]
  classFilter: string
  onClassFilterChange: (id: string) => void
}) {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const demo = isDemoSession()
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<Version2LearningRecordForm>(emptyVersion2Form())
  const [enrollments, setEnrollments] = useState<EnrollmentOption[]>([])
  const [records, setRecords] = useState<ActivityLearningRecordRow[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const draftKey = learningRecordDraftKey(["admin", form.class_id || classFilter, form.enrollment_id || "none", editingId ?? "new"])

  const loadEnrollments = useCallback(async (classId: string) => {
    if (!classId || demo) {
      setEnrollments([])
      return
    }
    try {
      const data = await apiGet<Array<{ id: number; profile_name?: string; user_name?: string; name?: string }>>(
        `/classes/${classId}/enrollments`,
      )
      setEnrollments(
        (data || []).map((r) => ({
          id: String(r.id),
          profile_name: String(r.profile_name || r.user_name || r.name || "Student"),
          user_name: String(r.user_name || r.name || ""),
        })),
      )
    } catch {
      setEnrollments([])
    }
  }, [demo])

  const loadRecords = useCallback(async () => {
    if (demo) {
      setRecords([])
      return
    }
    setLoading(true)
    try {
      const q = classFilter ? `?class_id=${encodeURIComponent(classFilter)}` : ""
      const data = await apiGet<ActivityLearningRecordRow[]>(`/activity-learning-records${q}`)
      setRecords(Array.isArray(data) ? data : [])
    } catch {
      setRecords([])
    } finally {
      setLoading(false)
    }
  }, [classFilter, demo])

  useEffect(() => {
    if (classFilter) {
      setForm((f) => ({ ...f, class_id: classFilter }))
      loadEnrollments(classFilter)
    }
  }, [classFilter, loadEnrollments])

  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  useEffect(() => {
    const draft = loadLearningRecordDraft(draftKey)
    if (draft) setForm(draft)
  }, [draftKey])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (isMeaningfulLearningRecordDraft(form)) saveLearningRecordDraft(draftKey, form)
    }, 200)
    return () => window.clearTimeout(timer)
  }, [form, draftKey])

  async function uploadPhoto(file: File) {
    const reader = new FileReader()
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
    const res = await apiPost<{ url?: string; absolute_url?: string }>("/uploads", { image: dataUrl })
    return res?.url || res?.absolute_url || ""
  }

  const photoPreviewSrc = resolveUploadUrl(form.photo_url)

  async function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const url = demo ? URL.createObjectURL(file) : await uploadPhoto(file)
      setForm((f) => ({ ...f, photo_url: url }))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed")
    }
  }

  function resetForm() {
    clearLearningRecordDraft(draftKey)
    setEditingId(null)
    setForm(
      applyPreviousNextFocus(
        { ...emptyVersion2Form(), class_id: classFilter },
        latestNextFocus(records),
      ),
    )
  }

  function startEdit(row: ActivityLearningRecordRow) {
    if (row.is_confirmed) {
      alert(zh ? "已確認的紀錄不可修改" : "Details are not amendable after confirming.")
      return
    }
    setEditingId(row.id)
    setForm(formFromRecordRow(row))
    loadEnrollments(String(row.class_id))
  }

  async function submit(confirm: boolean) {
    if (demo) {
      alert(zh ? "請用中心帳號登入" : "Sign in with a centre account")
      return
    }
    if (!form.class_id) {
      alert(zh ? "請選擇課堂" : "Select a class session")
      return
    }
    if (!form.enrollment_id) {
      alert(zh ? "請選擇學員" : "Select a student")
      return
    }
    if (countWords(form.additional_comment) > 100) {
      alert(zh ? "附加備註不可超過 100 字" : "Additional comment: no more than 100 words.")
      return
    }
    const studentHistory = records.filter(
      (r) => String(r.enrollment_id || "") === String(form.enrollment_id || "") && r.id !== editingId,
    )
    const ready = assignNextFocus(form, studentHistory)
    const validationError = validateVersion2Form(ready, { confirm })
    if (validationError) {
      alert(validationError)
      return
    }
    setSaving(true)
    try {
      const body = buildVersion2ApiBody(ready, { confirm })
      if (editingId) {
        await apiPatch(`/activity-learning-records/${editingId}`, body)
      } else {
        await apiPost("/activity-learning-records", body)
      }
      clearLearningRecordDraft(draftKey)
      resetForm()
      await loadRecords()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: number, confirmed: boolean) {
    if (confirmed) {
      alert(zh ? "已確認的紀錄不可刪除" : "Confirmed records cannot be deleted")
      return
    }
    if (!confirm(zh ? "刪除此 Learning Record？" : "Delete this record?")) return
    try {
      await apiDelete(`/activity-learning-records/${id}`)
      await loadRecords()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed")
    }
  }

  const wordCount = countWords(form.additional_comment)
  const selectedStudent = enrollments.find((e) => e.id === form.enrollment_id)
  const photoStudentName = selectedStudent?.profile_name || form.student_name || "Charlotte"

  return (
    <div className={FEEDBACK_STACK}>
      <AdminCard className="overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 pb-4 border-b border-classz-100">
          <h2 className="text-lg font-bold text-classz-800 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-classz-500 shrink-0" />
            Learning Record
          </h2>
          <p className="text-xs text-classz-500 sm:text-right">
            {zh ? "確認後不可修改" : "Details are not amendable after confirming"}
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <AdminLabel>{zh ? "課堂" : "Class session"}</AdminLabel>
              <AdminSelect
                value={form.class_id || classFilter}
                onChange={(e) => {
                  onClassFilterChange(e.target.value)
                  setForm((f) => ({ ...f, class_id: e.target.value, enrollment_id: "" }))
                }}
              >
                <option value="">{zh ? "選擇…" : "Select…"}</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </AdminSelect>
            </div>

            <div>
              <AdminLabel>{zh ? "學員" : "Student"}</AdminLabel>
              <AdminSelect
                value={form.enrollment_id}
                onChange={(e) => {
                  const en = enrollments.find((x) => x.id === e.target.value)
                  const studentHistory = records.filter((r) => String(r.enrollment_id) === e.target.value)
                  setForm((f) =>
                    applyPreviousNextFocus(
                      {
                        ...f,
                        enrollment_id: e.target.value,
                        student_name: en?.profile_name || "",
                      },
                      latestNextFocus(studentHistory),
                    ),
                  )
                }}
                disabled={!form.class_id}
              >
                <option value="">{zh ? "選擇學員…" : "Select student…"}</option>
                {enrollments.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.profile_name}
                  </option>
                ))}
              </AdminSelect>
            </div>
          </div>

          <div className={FEEDBACK_FORM_FIELD}>
            <button
              type="button"
              aria-label={zh ? "上傳課堂照片" : "Upload class photo"}
              onClick={() => fileRef.current?.click()}
              className="w-full h-40 rounded-xl border-2 border-dashed border-classz-200 bg-classz-50/80 flex flex-col items-center justify-center gap-2 text-classz-500 hover:border-classz-400 overflow-hidden transition-colors"
            >
              {photoPreviewSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoPreviewSrc} alt="" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Camera className="h-8 w-8 text-classz-400" />
                  <span className="text-xs px-4 text-center text-classz-600">
                    Upload {photoStudentName}&apos;s best class photo
                  </span>
                </>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhotoChange} />
          </div>

          <Version2LearningRecordFields form={form} onChange={setForm} />

          <p className={`text-xs ${wordCount > 100 ? "text-brand-coral" : "text-classz-500"}`}>
            {zh ? `附加備註不多於 100 字 · ${wordCount}/100` : `Additional note no more than 100 words · ${wordCount}/100`}
          </p>
          <p className="text-xs text-brand-slate/60">
            {zh ? QUESTIONS.confirmation.zh : QUESTIONS.confirmation.en}
          </p>

          <div className="flex flex-wrap gap-2 pt-3 border-t border-classz-100">
            <AdminPrimaryButton type="button" disabled={saving} onClick={() => submit(true)} className="min-w-[10rem]">
              {saving ? (zh ? "提交中…" : "Submitting…") : zh ? "確認並提交" : "Confirm & submit"}
            </AdminPrimaryButton>
            {!editingId ? (
              <AdminGhostButton type="button" disabled={saving} onClick={() => submit(false)}>
                {zh ? "儲存草稿" : "Save draft"}
              </AdminGhostButton>
            ) : null}
            {editingId ? (
              <AdminGhostButton type="button" onClick={resetForm}>
                {zh ? "取消編輯" : "Cancel edit"}
              </AdminGhostButton>
            ) : null}
          </div>
        </div>
      </AdminCard>

      <AdminCard className="overflow-hidden">
        <h2 className={FEEDBACK_LIST_TITLE}>Learning Records</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 rounded-full border-2 border-classz-400 border-t-transparent animate-spin" />
          </div>
        ) : (
          <ul className="divide-y divide-classz-100 border border-classz-200 rounded-lg overflow-hidden bg-white">
            {records.map((r) => (
              <li key={r.id} className="px-4 py-4 bg-classz-50/30">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-classz-700">
                      {r.student_name || (zh ? "學員" : "Student")} · {r.class_name || `#${r.class_id}`}
                      {r.is_confirmed ? (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--brand-teal)_12%,white)] border border-[color-mix(in_srgb,var(--brand-teal)_35%,white)] text-brand-teal">
                          {zh ? "已確認" : "Confirmed"}
                        </span>
                      ) : (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--brand-orange)_12%,white)] border border-[color-mix(in_srgb,var(--brand-orange)_35%,white)] text-brand-orange">
                          {zh ? "草稿" : "Draft"}
                        </span>
                      )}
                    </p>
                    {r.progress_level ? (
                      <p className="text-xs text-classz-500 mt-1">{progressLevelLabel(r.progress_level)}</p>
                    ) : null}
                    {r.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={resolveUploadUrl(r.photo_url)} alt="" className="mt-2 h-24 w-auto rounded-lg border border-classz-200" />
                    ) : null}
                    <pre className="mt-2 text-sm text-classz-800 whitespace-pre-wrap font-sans">{formatRecordSummary(r)}</pre>
                    <p className="mt-1 text-xs text-classz-500">{new Date(r.created_at).toLocaleString(zh ? "zh-HK" : "en-HK")}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {!r.is_confirmed ? (
                      <>
                        <AdminGhostButton type="button" className="text-sm py-1.5 px-3" onClick={() => startEdit(r)}>
                          {zh ? "編輯" : "Edit"}
                        </AdminGhostButton>
                        <AdminGhostButton type="button" className="text-sm py-1.5 px-3 text-brand-coral" onClick={() => remove(r.id, r.is_confirmed)}>
                          {zh ? "刪除" : "Delete"}
                        </AdminGhostButton>
                      </>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
            {records.length === 0 && (
              <li className="px-4 py-8 text-center text-classz-500">{zh ? "尚無紀錄" : "No records yet"}</li>
            )}
          </ul>
        )}
      </AdminCard>
    </div>
  )
}
