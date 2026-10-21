"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Camera, Pencil } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { isDemoSession } from "@/components/admin/use-admin-api"
import { apiGet, apiPatch, apiPost } from "@/lib/classz-api-client"
import { resolveUploadUrl } from "@/lib/resolve-upload-url"
import { getClasszSession } from "@/lib/classz-auth"
import {
  countWords,
  learningRecordFillPath,
  progressLevelLabel,
  type ActivityLearningRecordRow,
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
  saveLearningRecordDraft,
  validateVersion2Form,
  type Version2LearningRecordForm,
} from "@/lib/version2-learning-record"
import { Version2LearningRecordFields } from "@/components/admin/version2-learning-record-form"
import type { LearningRecordStudent } from "@/components/admin/learning-record-students-table"
import {
  AdminCard,
  AdminGhostButton,
  AdminPageFrame,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminSelect,
  AdminStatusChip,
} from "@/components/classz-admin-ui"

const MIN_RECORDS_FOR_REPORT = 3

function ageFromDob(dob?: string | null): number | null {
  if (!dob) return null
  const born = new Date(dob)
  if (Number.isNaN(born.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - born.getFullYear()
  const monthDelta = now.getMonth() - born.getMonth()
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < born.getDate())) age -= 1
  return age >= 0 && age < 30 ? age : null
}

export function TeacherFillLearningRecord() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const profileId = String(params?.profileId || "")
  const recordIdParam = Number(searchParams?.get("recordId") || 0)
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const demo = isDemoSession()
  const fileRef = useRef<HTMLInputElement>(null)
  const pathname = usePathname()
  const fromTeacherPortal = Boolean(pathname?.startsWith("/admin/teacher-students"))
  const listPath = fromTeacherPortal ? "/admin/teacher-students" : "/admin/learning-records"
  const fillPath = (recordId?: number | null) =>
    learningRecordFillPath(profileId, { mode: fromTeacherPortal ? "teacher" : "admin", recordId })

  const [student, setStudent] = useState<LearningRecordStudent | null>(null)
  const [history, setHistory] = useState<ActivityLearningRecordRow[]>([])
  const [form, setForm] = useState<Version2LearningRecordForm>(emptyVersion2Form())
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [formReady, setFormReady] = useState(false)
  const draftKey = learningRecordDraftKey(["teacher", profileId, recordIdParam || "new"])

  const load = useCallback(async () => {
    if (demo || !profileId) return
    setFormReady(false)
    try {
      const list = await apiGet<LearningRecordStudent[]>("/learning-record-students")
      const row = (Array.isArray(list) ? list : []).find((s) => String(s.profile_id) === profileId)
      if (!row) {
        setLoadError("Student not found")
        return
      }
      setStudent(row)
      const recs = await apiGet<ActivityLearningRecordRow[]>(
        `/activity-learning-records?profile_id=${encodeURIComponent(profileId)}`,
      )
      const historyRows = Array.isArray(recs) ? recs : []
      setHistory(historyRows)

      const editTarget =
        Number.isInteger(recordIdParam) && recordIdParam > 0
          ? historyRows.find((h) => h.id === recordIdParam) || null
          : null

      const draft = loadLearningRecordDraft(
        learningRecordDraftKey(["teacher", profileId, recordIdParam || "new"]),
      )

      if (editTarget) {
        setEditingRecordId(editTarget.id)
        setForm(
          draft ||
            formFromRecordRow(editTarget, {
              student_name: editTarget.student_name || row.child_name,
            }),
        )
      } else {
        setEditingRecordId(null)
        const enrollment = row.enrollments[0]
        setForm(
          draft ||
            applyPreviousNextFocus(
              {
                ...emptyVersion2Form(),
                class_id: enrollment ? String(enrollment.class_id) : "",
                enrollment_id: enrollment ? String(enrollment.enrollment_id) : "",
                student_name: row.child_name,
              },
              latestNextFocus(historyRows),
            ),
        )
      }
      setFormReady(true)
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Load failed")
    }
  }, [demo, profileId, recordIdParam])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!profileId || !fromTeacherPortal) return
    const role = getClasszSession()?.user.role
    if (role === "coach") return
    const qs = searchParams?.toString()
    router.replace(`/admin/learning-records/${profileId}${qs ? `?${qs}` : ""}`)
  }, [profileId, fromTeacherPortal, router, searchParams])

  useEffect(() => {
    if (!formReady) return
    const timer = window.setTimeout(() => {
      if (isMeaningfulLearningRecordDraft(form)) saveLearningRecordDraft(draftKey, form)
    }, 200)
    return () => window.clearTimeout(timer)
  }, [form, formReady, draftKey])

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
      alert(zh ? "請用中心或導師帳號登入" : "Sign in with a centre or teacher account")
      return
    }
    if (countWords(form.additional_comment) > 100) {
      alert(zh ? "附加備註不可超過 100 字" : "Comment max 100 words")
      return
    }
    const ready = assignNextFocus(form, history.filter((h) => h.id !== editingRecordId))
    const err = validateVersion2Form(ready, { confirm })
    if (err) {
      alert(err)
      return
    }
    setSaving(true)
    try {
      const payload = buildVersion2ApiBody(ready, { confirm, force: true })
      if (editingRecordId) {
        await apiPatch(`/activity-learning-records/${editingRecordId}?force=1`, payload)
        alert(zh ? "已更新 Learning Record" : "Learning record updated")
      } else {
        await apiPost("/activity-learning-records", payload)
        alert(zh ? "已儲存 Learning Record" : "Learning record saved")
      }
      clearLearningRecordDraft(draftKey)
      router.push(listPath)
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
        <Link href={listPath} className="text-brand-teal text-sm mt-2 inline-block">
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
  const age = ageFromDob(student.date_of_birth)
  const selectedEnrollment =
    student.enrollments.find((row) => String(row.class_id) === form.class_id) || student.enrollments[0] || null
  const initials = student.child_name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("")

  return (
    <AdminPageFrame>
      <div className="flex items-center gap-2">
        <Link
          href={listPath}
          className="inline-flex items-center gap-1 text-sm text-[#222] hover:text-brand-teal"
        >
          <ArrowLeft className="h-4 w-4" />
          {zh ? "學員列表" : "Student list"}
        </Link>
      </div>
      <AdminPageHeader
        title={
          editingRecordId
            ? zh
              ? `編輯 Learning Record — ${student.child_name}`
              : `Edit Learning Record — ${student.child_name}`
            : zh
              ? `填寫 Learning Record — ${student.child_name}`
              : `Learning Record — ${student.child_name}`
        }
        description={
          zh
            ? "請記錄今堂實際觀察到嘅表現。確認提交即代表呢份紀錄係根據你對呢位小朋友嘅直接觀察。"
            : "Record what you actually observed today. Confirming this form means the record is based on your direct observation of this child."
        }
      />

      <div className="grid gap-3 md:grid-cols-2">
        <AdminCard>
          <p className="text-sm font-semibold text-[#222]">{zh ? "小朋友資料" : "Child information"}</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ebebeb] text-sm font-semibold text-[#222]">
              {initials || "?"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#222]">{student.child_name}</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {age != null ? (
                  <AdminStatusChip tone="teal">{zh ? `${age} 歲` : `Age ${age}`}</AdminStatusChip>
                ) : null}
                {student.grade ? <AdminStatusChip tone="slate">{student.grade}</AdminStatusChip> : null}
              </div>
            </div>
          </div>
        </AdminCard>
        <AdminCard>
          <p className="text-sm font-semibold text-[#222]">{zh ? "家長資料" : "Parents information"}</p>
          <div className="mt-3">
            <p className="text-sm font-semibold text-[#222]">{student.parent_name || "—"}</p>
            <p className="mt-1 text-sm text-[#525252]">{student.contact_number || "—"}</p>
            <p className="mt-2 text-xs text-[#717171]">
              {student.record_count}/{MIN_RECORDS_FOR_REPORT}+ {zh ? "紀錄" : "records"}
            </p>
          </div>
        </AdminCard>
      </div>

      <AdminCard>
        <p className="text-sm font-semibold text-[#222]">{zh ? "課堂資料" : "Class information"}</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          {photoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoSrc} alt="" className="h-24 w-full rounded-lg object-cover sm:w-40" />
          ) : (
            <div className="flex h-24 w-full items-center justify-center rounded-lg bg-[#f5f5f5] text-xs text-[#717171] sm:w-40">
              {zh ? "未有課堂圖片" : "No class photo yet"}
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-2">
            <AdminSelect
              value={form.class_id}
              disabled={Boolean(editingRecordId)}
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
              {editingRecordId &&
              form.class_id &&
              !student.enrollments.some((e) => String(e.class_id) === form.class_id) ? (
                <option value={form.class_id}>
                  {history.find((h) => h.id === editingRecordId)?.class_name || `class ${form.class_id}`}
                </option>
              ) : null}
            </AdminSelect>
            <p className="text-sm text-[#525252]">
              {selectedEnrollment?.class_start_time
                ? new Date(selectedEnrollment.class_start_time).toLocaleString(zh ? "zh-HK" : "en-HK", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : zh
                  ? "時間未提供"
                  : "Time not on file"}
            </p>
            <p className="text-xs text-[#717171]">{student.child_name}</p>
          </div>
        </div>
      </AdminCard>

      <div className="space-y-4">
        <h2 className="text-base font-semibold text-[#222]">{zh ? "回饋紀錄" : "Feedback Record"}</h2>
        <Version2LearningRecordFields form={form} onChange={setForm} />

        <div className="space-y-2">
          <p className="text-sm font-semibold text-brand-teal">{zh ? "加入照片" : "Add a Moment"}</p>
          <p className="text-xs text-[#717171]">
            {zh ? "可選。課堂或小朋友參與時的照片。" : "Optional photo from the lesson."}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="admin-frame-border inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm text-[#222] hover:bg-[#f7f7f7]"
            >
              <Camera className="h-4 w-4" />
              {zh ? "加入照片" : "Add photo"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhotoChange} />
            {photoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoSrc} alt="" className="admin-frame-border h-14 w-14 rounded-md object-cover" />
            ) : null}
          </div>
        </div>

        <p className="text-center text-xs text-[#717171]">
          {zh
            ? "提交即確認呢份紀錄係根據你今堂對呢位小朋友嘅直接觀察。"
            : "By submitting, you confirm that this record is based on your direct observation of this child during the lesson."}
        </p>

        <AdminGhostButton type="button" disabled={saving} onClick={() => submit(false)} className="w-full justify-center">
          {editingRecordId ? (zh ? "更新為草稿" : "Update as draft") : zh ? "儲存草稿" : "Save draft"}
        </AdminGhostButton>
        <AdminPrimaryButton type="button" disabled={saving} onClick={() => submit(true)} className="w-full justify-center rounded-lg">
          {saving
            ? zh
              ? "儲存中…"
              : "Saving…"
            : editingRecordId
              ? zh
                ? "確認並更新"
                : "Confirm and update record"
              : zh
                ? "確認並提交"
                : "Confirm and submit record"}
        </AdminPrimaryButton>
      </div>

      {history.length ? (
        <AdminCard className="mt-3">
          <h3 className="text-sm font-semibold text-brand-slate mb-2">
            {zh ? "此學生過往紀錄" : "Previous records"}
          </h3>
          <ul className="space-y-1 text-sm text-brand-slate/80">
            {history.map((h) => (
              <li
                key={h.id}
                className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-classz-50 py-1.5"
              >
                <span className="min-w-0">
                  #{h.id} · {h.class_focus || h.class_name || "—"} · {progressLevelLabel(h.progress_level || "")}
                  {h.next_focus ? ` · next ${h.next_focus}` : ""}
                  {editingRecordId === h.id ? (
                    <span className="ml-2 text-xs text-brand-teal">{zh ? "（編輯中）" : "(editing)"}</span>
                  ) : null}
                </span>
                <div className="inline-flex items-center gap-2 shrink-0">
                  <span className="text-xs text-brand-slate/50">
                    {h.created_at ? new Date(h.created_at).toLocaleDateString(zh ? "zh-HK" : "en-HK") : ""}
                  </span>
                  {editingRecordId === h.id ? null : (
                    <Link
                      href={fillPath(h.id)}
                      className="inline-flex items-center gap-1 text-xs text-brand-teal hover:underline"
                    >
                      <Pencil className="h-3 w-3" />
                      {zh ? "編輯" : "Edit"}
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </AdminCard>
      ) : null}
    </AdminPageFrame>
  )
}
