"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Camera, ChevronDown, ClipboardList } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { isDemoSession } from "@/components/admin/use-admin-api"
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/classz-api-client"
import { resolveUploadUrl } from "@/lib/resolve-upload-url"
import { FEEDBACK_FORM_FIELD, FEEDBACK_FORM_GRID, FEEDBACK_FORM_STACK, FEEDBACK_LIST_TITLE, FEEDBACK_STACK } from "@/lib/feedback-layout"
import {
  type ActivityLearningRecordForm,
  type ActivityLearningRecordRow,
  countWords,
  emptyActivityLearningRecordForm,
  formatRecordSummary,
  LEARNING_AREA_OPTIONS,
  LEARNING_TRAIT_OPTIONS,
  OBSERVED_OPTIONS,
  PROGRESS_LEVELS,
  progressLevelLabel,
  sanitizeActivityLearningRecordForm,
  toggleMultiSelect,
  validateActivityLearningRecordForm,
} from "@/lib/activity-learning-record"
import {
  AdminCard,
  AdminGhostButton,
  AdminInput,
  AdminLabel,
  AdminPrimaryButton,
  AdminSelect,
  AdminTextarea,
} from "@/components/classz-admin-ui"

type ClassOption = { id: string; name: string }
type EnrollmentOption = { id: string; profile_name: string; user_name: string }

function ProgressLevelDropdown({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = PROGRESS_LEVELS.find((p) => p.value === value)

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [open])

  return (
    <div ref={rootRef} className="relative min-w-0 w-full">
      <AdminLabel>{label}</AdminLabel>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="mt-1 w-full min-w-0 flex items-center justify-between gap-2 rounded-lg border border-classz-200 bg-white px-3 py-2.5 text-left text-sm hover:border-classz-300 disabled:opacity-50"
      >
        <span className={`min-w-0 flex-1 truncate ${selected ? "text-classz-800" : "text-classz-400"}`}>
          {selected ? `${selected.tier} — ${selected.description}` : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-classz-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div className="absolute z-20 mt-1 left-0 right-0 w-full rounded-lg border border-classz-200 bg-white shadow-lg overflow-hidden">
          <ul className="py-1 max-h-56 overflow-y-auto">
            {PROGRESS_LEVELS.map((p) => {
              const active = p.value === value
              return (
                <li key={p.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(p.value)
                      setOpen(false)
                    }}
                    className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
                      active ? "bg-classz-100 text-classz-800" : "text-classz-700 hover:bg-classz-50"
                    }`}
                  >
                    <span className="font-medium">{p.tier}</span>
                    <span className="text-classz-500"> — {p.description}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

function MultiSelectDropdown({
  label,
  hint,
  options,
  value,
  max,
  onChange,
  disabled,
}: {
  label: string
  hint: string
  options: readonly string[]
  value: string[]
  max: number
  onChange: (next: string[]) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [open])

  const summary =
    value.length > 0 ? value.join(", ") : hint

  return (
    <div ref={rootRef} className="relative min-w-0 w-full">
      <AdminLabel>{label}</AdminLabel>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="mt-1 w-full min-w-0 flex items-center justify-between gap-2 rounded-lg border border-classz-200 bg-white px-3 py-2.5 text-left text-sm text-classz-700 hover:border-classz-300 disabled:opacity-50"
      >
        <span className={`min-w-0 flex-1 line-clamp-2 ${value.length ? "text-classz-800" : "text-classz-400"}`}>{summary}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-classz-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div className="absolute z-20 mt-1 left-0 right-0 w-full rounded-lg border border-classz-200 bg-white shadow-lg max-h-64 overflow-y-auto">
          <p className="sticky top-0 bg-classz-50 border-b border-classz-100 px-3 py-2 text-xs text-classz-500">{hint}</p>
          <ul className="py-1">
            {options.map((opt, idx) => {
              const selected = value.includes(opt)
              const atMax = !selected && value.length >= max
              return (
                <li key={opt}>
                  <button
                    type="button"
                    disabled={disabled || atMax}
                    onClick={() => onChange(toggleMultiSelect(value, opt, max))}
                    className={`w-full text-left px-3 py-2 text-sm flex gap-2 items-start transition-colors ${
                      selected
                        ? "bg-classz-100 text-classz-800"
                        : atMax
                          ? "text-classz-300 cursor-not-allowed"
                          : "text-classz-700 hover:bg-classz-50"
                    }`}
                  >
                    <span className="text-classz-400 w-5 shrink-0">{idx + 1}.</span>
                    <span>{opt}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
      {value.length > 0 ? (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {value.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-classz-100 border border-classz-200 text-classz-700"
            >
              {v}
              {!disabled ? (
                <button
                  type="button"
                  className="text-classz-400 hover:text-classz-700"
                  onClick={() => onChange(value.filter((x) => x !== v))}
                  aria-label="Remove"
                >
                  ×
                </button>
              ) : null}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}

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
  const [form, setForm] = useState<ActivityLearningRecordForm>(emptyActivityLearningRecordForm())
  const [enrollments, setEnrollments] = useState<EnrollmentOption[]>([])
  const [records, setRecords] = useState<ActivityLearningRecordRow[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

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
    setEditingId(null)
    setForm({ ...emptyActivityLearningRecordForm(), class_id: classFilter })
  }

  function startEdit(row: ActivityLearningRecordRow) {
    if (row.is_confirmed) {
      alert(zh ? "已確認的紀錄不可修改" : "Details are not amendable after confirming.")
      return
    }
    setEditingId(row.id)
    setForm(
      sanitizeActivityLearningRecordForm({
        class_id: String(row.class_id),
        enrollment_id: row.enrollment_id ? String(row.enrollment_id) : "",
        student_name: row.student_name || "",
        photo_url: row.photo_url || "",
        class_focus: row.class_focus || "",
        progress_level: row.progress_level || "",
        observed: row.observed || [],
        strongest_areas: row.strongest_areas || [],
        attention_areas: row.attention_areas || [],
        student_work_on: row.student_work_on || "",
        learning_traits: row.learning_traits || [],
        additional_comment: row.additional_comment || "",
      }),
    )
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
    if (countWords(form.additional_comment) > 100) {
      alert(zh ? "附加備註不可超過 100 字" : "Additional comment: no more than 100 words.")
      return
    }
    const validationError = validateActivityLearningRecordForm(form)
    if (validationError) {
      alert(validationError)
      return
    }
    setSaving(true)
    try {
      const body = {
        class_id: Number(form.class_id),
        enrollment_id: form.enrollment_id ? Number(form.enrollment_id) : null,
        student_name: form.student_name || null,
        photo_url: form.photo_url || null,
        class_focus: form.class_focus.trim(),
        progress_level: form.progress_level,
        observed: form.observed,
        strongest_areas: form.strongest_areas,
        attention_areas: form.attention_areas,
        student_work_on: form.student_work_on.trim(),
        learning_traits: form.learning_traits,
        additional_comment: form.additional_comment.trim() || null,
        confirm,
      }
      if (editingId) {
        await apiPatch(`/activity-learning-records/${editingId}`, body)
      } else {
        await apiPost("/activity-learning-records", body)
      }
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
    if (!confirm(zh ? "刪除此 Academic Learning Record？" : "Delete this record?")) return
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
            Academic Learning Record
          </h2>
          <p className="text-xs text-classz-500 sm:text-right">Details are not amendable after confirming</p>
        </div>

        <div className={FEEDBACK_FORM_STACK}>
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
                  setForm((f) => ({
                    ...f,
                    enrollment_id: e.target.value,
                    student_name: en?.profile_name || "",
                  }))
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

          <div className={FEEDBACK_FORM_GRID}>
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

            <div className={FEEDBACK_FORM_FIELD}>
              <MultiSelectDropdown
                label="What is the area required more attention in learning today?"
                hint="Limit: choose 1–2"
                options={LEARNING_AREA_OPTIONS}
                value={form.attention_areas}
                max={2}
                onChange={(attention_areas) => setForm((f) => ({ ...f, attention_areas }))}
              />
            </div>

            <div className={FEEDBACK_FORM_FIELD}>
              <AdminLabel>What was the focus of the class today?</AdminLabel>
              <AdminInput
                placeholder="e.g. Algebra, Chemical bonding"
                value={form.class_focus}
                onChange={(e) => setForm((f) => ({ ...f, class_focus: e.target.value }))}
              />
            </div>

            <div className={FEEDBACK_FORM_FIELD}>
              <AdminLabel>What would you suggest student to work on?</AdminLabel>
              <AdminTextarea
                className="min-h-[4.5rem]"
                placeholder="e.g. Practise slower movements before the next lesson."
                value={form.student_work_on}
                onChange={(e) => setForm((f) => ({ ...f, student_work_on: e.target.value }))}
              />
            </div>

            <div className={FEEDBACK_FORM_FIELD}>
              <ProgressLevelDropdown
                label="What is the current progress level?"
                placeholder={zh ? "選擇…" : "Choose…"}
                value={form.progress_level}
                onChange={(progress_level) => setForm((f) => ({ ...f, progress_level }))}
              />
            </div>

            <div className={FEEDBACK_FORM_FIELD}>
              <MultiSelectDropdown
                label="How would you describe student's learning trait?"
                hint="Limit: choose 1–2"
                options={LEARNING_TRAIT_OPTIONS}
                value={form.learning_traits}
                max={2}
                onChange={(learning_traits) => setForm((f) => ({ ...f, learning_traits }))}
              />
            </div>

            <div className={FEEDBACK_FORM_FIELD}>
              <MultiSelectDropdown
                label="What Was Observed?"
                hint="Limit: choose 1–2"
                options={OBSERVED_OPTIONS}
                value={form.observed}
                max={2}
                onChange={(observed) => setForm((f) => ({ ...f, observed }))}
              />
            </div>

            <div className={FEEDBACK_FORM_FIELD}>
              <AdminLabel>Additional comment (optional)</AdminLabel>
              <AdminTextarea
                className="min-h-[4.5rem]"
                value={form.additional_comment}
                onChange={(e) => setForm((f) => ({ ...f, additional_comment: e.target.value }))}
              />
              <p className={`text-xs mt-1 ${wordCount > 100 ? "text-brand-coral" : "text-classz-500"}`}>
                No more than 100 words · {wordCount}/100
              </p>
            </div>

            <div className={FEEDBACK_FORM_FIELD}>
              <MultiSelectDropdown
                label="What is the strongest area in learning today?"
                hint="Limit: choose 1–2"
                options={LEARNING_AREA_OPTIONS}
                value={form.strongest_areas}
                max={2}
                onChange={(strongest_areas) => setForm((f) => ({ ...f, strongest_areas }))}
              />
            </div>

            <div className={`${FEEDBACK_FORM_FIELD} hidden lg:block`} aria-hidden />
          </div>

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
        <h2 className={FEEDBACK_LIST_TITLE}>Academic Learning Records</h2>
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
