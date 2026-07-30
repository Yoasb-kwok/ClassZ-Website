"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Camera } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { isDemoSession } from "@/components/admin/use-admin-api"
import { apiGet, apiPost } from "@/lib/classz-api-client"
import { resolveUploadUrl } from "@/lib/resolve-upload-url"
import {
  countWords,
  emptyActivityLearningRecordForm,
  LEARNING_AREA_OPTIONS,
  LEARNING_TRAIT_OPTIONS,
  OBSERVED_OPTIONS,
  PROGRESS_LEVELS,
  sanitizeActivityLearningRecordForm,
  toggleMultiSelect,
  validateActivityLearningRecordForm,
  type ActivityLearningRecordForm,
  type ActivityLearningRecordRow,
} from "@/lib/activity-learning-record"
import type { LearningRecordStudent } from "@/components/admin/learning-record-students-table"
import {
  AdminCard,
  AdminGhostButton,
  AdminInput,
  AdminLabel,
  AdminPageFrame,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminSelect,
  AdminStatusChip,
  AdminTextarea,
} from "@/components/classz-admin-ui"

const MIN_RECORDS_FOR_REPORT = 3

export function TeacherFillLearningRecord() {
  const params = useParams()
  const router = useRouter()
  const profileId = String(params?.profileId || "")
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const demo = isDemoSession()
  const fileRef = useRef<HTMLInputElement>(null)

  const [student, setStudent] = useState<LearningRecordStudent | null>(null)
  const [history, setHistory] = useState<ActivityLearningRecordRow[]>([])
  const [form, setForm] = useState<ActivityLearningRecordForm>(emptyActivityLearningRecordForm())
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (demo || !profileId) return
    try {
      const list = await apiGet<LearningRecordStudent[]>("/learning-record-students")
      const row = (Array.isArray(list) ? list : []).find((s) => String(s.profile_id) === profileId)
      if (!row) {
        setLoadError(zh ? "找不到該學生" : "Student not found")
        return
      }
      setStudent(row)
      const enrollment = row.enrollments[0]
      setForm(
        sanitizeActivityLearningRecordForm({
          ...emptyActivityLearningRecordForm(),
          class_id: enrollment ? String(enrollment.class_id) : "",
          enrollment_id: enrollment ? String(enrollment.enrollment_id) : "",
          student_name: row.child_name,
        }),
      )
      const recs = await apiGet<ActivityLearningRecordRow[]>(
        `/activity-learning-records?profile_id=${encodeURIComponent(profileId)}`,
      )
      setHistory(Array.isArray(recs) ? recs : [])
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Load failed")
    }
  }, [demo, profileId, zh])

  useEffect(() => {
    load()
  }, [load])

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

  async function onPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const url = await uploadPhoto(file)
      setForm((f) => ({ ...f, photo_url: url }))
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed")
    }
  }

  async function submit(confirm: boolean) {
    if (demo) {
      alert(zh ? "請用導師帳號登入" : "Sign in as a teacher")
      return
    }
    if (countWords(form.additional_comment) > 100) {
      alert(zh ? "附加備註不可超過 100 字" : "Comment max 100 words")
      return
    }
    const err = validateActivityLearningRecordForm(form)
    if (err) {
      alert(err)
      return
    }
    setSaving(true)
    try {
      await apiPost("/activity-learning-records", {
        class_id: Number(form.class_id),
        enrollment_id: form.enrollment_id ? Number(form.enrollment_id) : null,
        student_name: form.student_name || student?.child_name || null,
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
      })
      alert(zh ? "已儲存 Learning Record" : "Learning record saved")
      router.push("/admin/teacher-students")
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  if (loadError) {
    return (
      <AdminPageFrame>
        <p className="text-brand-coral">{loadError}</p>
        <Link href="/admin/teacher-students" className="text-brand-teal text-sm mt-2 inline-block">
          ← {zh ? "返回學員列表" : "Back to students"}
        </Link>
      </AdminPageFrame>
    )
  }

  if (!student) {
    return (
      <div className="flex justify-center py-16">
        <div className="h-8 w-8 rounded-full border-2 border-classz-100 border-t-classz-400 animate-spin" />
      </div>
    )
  }

  const photoSrc = resolveUploadUrl(form.photo_url)

  return (
    <AdminPageFrame>
      <div className="flex items-center gap-2 mb-1">
        <Link
          href="/admin/teacher-students"
          className="inline-flex items-center gap-1 text-sm text-brand-slate/70 hover:text-brand-teal"
        >
          <ArrowLeft className="h-4 w-4" />
          {zh ? "學員列表" : "Students"}
        </Link>
      </div>
      <AdminPageHeader
        title={zh ? `填寫 Learning Record — ${student.child_name}` : `Fill Learning Record — ${student.child_name}`}
        description={zh ? "填寫此學生的 STEM / Academic Learning Record。" : "Fill this student's STEM / Academic Learning Record."}
      />

      <AdminCard className="mb-3">
        <div className="flex flex-wrap items-start gap-2 text-sm text-brand-slate">
          <AdminStatusChip tone={student.record_count >= MIN_RECORDS_FOR_REPORT ? "teal" : "orange"}>
            {student.record_count}/{MIN_RECORDS_FOR_REPORT}+ {zh ? "紀錄" : "records"}
          </AdminStatusChip>
          <span className="text-sm">{zh ? `家長：${student.parent_name}` : `Parent: ${student.parent_name}`}</span>
          <span className="text-sm">{student.contact_number}</span>
          {student.enrollments.map((e) => (
            <span key={e.enrollment_id} className="text-xs text-brand-slate/65">
              {e.class_name}
            </span>
          ))}
        </div>
      </AdminCard>

      <AdminCard>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <AdminLabel>{zh ? "課堂" : "Class session"}</AdminLabel>
              <AdminSelect
                value={form.class_id}
                onChange={(e) => {
                  const classId = e.target.value
                  const en = student.enrollments.find((x) => String(x.class_id) === classId)
                  setForm((f) => ({
                    ...f,
                    class_id: classId,
                    enrollment_id: en ? String(en.enrollment_id) : "",
                  }))
                }}
              >
                {student.enrollments.map((e) => (
                  <option key={e.enrollment_id} value={String(e.class_id)}>
                    {e.class_name}
                  </option>
                ))}
              </AdminSelect>
            </div>
            <div>
              <AdminLabel>{zh ? "進度等級" : "Progress level"}</AdminLabel>
              <AdminSelect
                value={form.progress_level}
                onChange={(e) => setForm((f) => ({ ...f, progress_level: e.target.value }))}
              >
                <option value="">{zh ? "請選擇" : "Select"}</option>
                {PROGRESS_LEVELS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.tier} — {p.description}
                  </option>
                ))}
              </AdminSelect>
            </div>
          </div>

          <div>
            <AdminLabel>{zh ? "課堂焦點" : "Class focus"}</AdminLabel>
            <AdminInput
              value={form.class_focus}
              onChange={(e) => setForm((f) => ({ ...f, class_focus: e.target.value }))}
              placeholder={zh ? "例：STEM 體驗站觀察" : "e.g. STEM station observation"}
            />
          </div>

          {(
            [
              ["observed", zh ? "觀察到的表現 (1–2)" : "Observed (1–2)", OBSERVED_OPTIONS],
              ["strongest_areas", zh ? "優勢 (1–2)" : "Strengths (1–2)", LEARNING_AREA_OPTIONS],
              ["attention_areas", zh ? "需關注 (1–2)" : "Focus areas (1–2)", LEARNING_AREA_OPTIONS],
              ["learning_traits", zh ? "學習特質 (1–2)" : "Learning traits (1–2)", LEARNING_TRAIT_OPTIONS],
            ] as const
          ).map(([key, label, options]) => (
            <div key={key}>
              <AdminLabel>{label}</AdminLabel>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {options.map((opt) => {
                  const selected = form[key].includes(opt)
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          [key]: toggleMultiSelect(f[key], opt, 2),
                        }))
                      }
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        selected
                          ? "bg-brand-teal/15 border-brand-teal text-brand-teal"
                          : "bg-white border-classz-200 text-brand-slate/80 hover:border-classz-300"
                      }`}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          <div>
            <AdminLabel>{zh ? "建議學生繼續練習" : "Student should work on"}</AdminLabel>
            <AdminTextarea
              className="min-h-[4rem]"
              value={form.student_work_on}
              onChange={(e) => setForm((f) => ({ ...f, student_work_on: e.target.value }))}
            />
          </div>

          <div>
            <AdminLabel>{zh ? "附加備註（≤100 字）" : "Additional comment (≤100 words)"}</AdminLabel>
            <AdminTextarea
              className="min-h-[4rem]"
              value={form.additional_comment}
              onChange={(e) => setForm((f) => ({ ...f, additional_comment: e.target.value }))}
            />
            <p className="text-xs text-brand-slate/50 mt-1">{countWords(form.additional_comment)} words</p>
          </div>

          <div>
            <AdminLabel>{zh ? "照片（選填）" : "Photo (optional)"}</AdminLabel>
            <div className="flex items-center gap-3 mt-1">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-classz-200 text-sm hover:bg-classz-50"
              >
                <Camera className="h-4 w-4" />
                {zh ? "上傳" : "Upload"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhotoChange} />
              {photoSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoSrc} alt="" className="h-14 w-14 rounded-md object-cover border border-classz-100" />
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <AdminGhostButton type="button" disabled={saving} onClick={() => submit(false)}>
              {zh ? "儲存草稿" : "Save draft"}
            </AdminGhostButton>
            <AdminPrimaryButton type="button" disabled={saving} onClick={() => submit(true)}>
              {saving ? (zh ? "儲存中…" : "Saving…") : zh ? "確認並儲存" : "Confirm & save"}
            </AdminPrimaryButton>
          </div>
        </div>
      </AdminCard>

      {history.length ? (
        <AdminCard className="mt-3">
          <h3 className="text-sm font-semibold text-brand-slate mb-2">
            {zh ? "此學生過往紀錄" : "Previous records"}
          </h3>
          <ul className="space-y-1 text-sm text-brand-slate/80">
            {history.map((h) => (
              <li key={h.id} className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between border-b border-classz-50 py-1.5">
                <span className="min-w-0">
                  #{h.id} · {h.class_focus || h.class_name || "—"} · {progressLevelLabel(h.progress_level || "")}
                </span>
                <span className="text-xs text-brand-slate/50 shrink-0">
                  {h.created_at ? new Date(h.created_at).toLocaleDateString(zh ? "zh-HK" : "en-HK") : ""}
                </span>
              </li>
            ))}
          </ul>
        </AdminCard>
      ) : null}
    </AdminPageFrame>
  )
}

function progressLevelLabel(value: string) {
  const row = PROGRESS_LEVELS.find((p) => p.value === value)
  return row ? row.tier : value
}
