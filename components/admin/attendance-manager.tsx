"use client"

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ClipboardList, FileText, Upload } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { isDemoSession } from "@/components/admin/use-admin-api"
import { apiGet, apiPatch, apiPost } from "@/lib/classz-api-client"
import { resolveUploadUrl } from "@/lib/resolve-upload-url"
import { useCenterApiList } from "@/components/admin/use-center-api-list"
import {
  AdminGhostButton,
  AdminLabel,
  AdminModal,
  AdminPageFrame,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminSelect,
  AdminTable,
  AdminTableShell,
  AdminToolbar,
} from "@/components/classz-admin-ui"

type ClassOption = { id: string; name: string; start_time: string }

type EnrollmentRow = {
  id: string
  profile_name: string
  user_name: string
  user_mobile: string
  status: string
  leave_document_url?: string | null
  sick_leave_document_url?: string | null
}

type AttendanceStatus = "enrolled" | "attended" | "absent" | "personal_leave" | "sick_leave"

const STATUSES: AttendanceStatus[] = ["enrolled", "attended", "absent", "personal_leave", "sick_leave"]
const LEAVE_STATUSES = new Set<AttendanceStatus>(["personal_leave", "sick_leave"])
const MAX_DOC_BYTES = 5 * 1024 * 1024
const DOC_ACCEPT = ".pdf,.doc,.docx,image/png,image/jpeg,image/jpg,image/webp,application/pdf"

function mapClass(r: Record<string, unknown>): ClassOption {
  return {
    id: String(r.id),
    name: String(r.name || ""),
    start_time: String(r.start_time || ""),
  }
}

function mapEnrollment(r: Record<string, unknown>): EnrollmentRow {
  const doc = r.leave_document_url || r.sick_leave_document_url || null
  return {
    id: String(r.id),
    profile_name: String(r.profile_name || ""),
    user_name: String(r.user_name || r.name || ""),
    user_mobile: String(r.user_mobile || ""),
    status: String(r.status || "enrolled"),
    leave_document_url: doc != null ? String(doc) : null,
    sick_leave_document_url: doc != null ? String(doc) : null,
  }
}

function isLeaveStatus(s: string): s is "personal_leave" | "sick_leave" {
  return LEAVE_STATUSES.has(s as AttendanceStatus)
}

async function uploadProofFile(file: File, demo: boolean): Promise<string> {
  if (file.size > MAX_DOC_BYTES) throw new Error("File too large (max 5MB)")
  const name = file.name.toLowerCase()
  const okExt = /\.(pdf|doc|docx|png|jpe?g|webp)$/i.test(name)
  const okMime =
    file.type.startsWith("image/") ||
    file.type === "application/pdf" ||
    file.type === "application/msword" ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  if (!okExt && !okMime) throw new Error("Unsupported file type")

  if (demo) return URL.createObjectURL(file)

  const reader = new FileReader()
  const dataUrl = await new Promise<string>((resolve, reject) => {
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
  const res = await apiPost<{ url?: string; absolute_url?: string }>("/uploads", {
    document: dataUrl,
    filename: file.name,
  })
  const url = res?.url || res?.absolute_url || ""
  if (!url) throw new Error("Upload failed")
  return url
}

export function AttendanceManager() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const demo = isDemoSession()
  const searchParams = useSearchParams()
  const initialClassId = searchParams.get("classId") || ""
  const fileInputId = useId()
  const fileRef = useRef<HTMLInputElement>(null)

  const { rows: classes, ready: classesReady } = useCenterApiList("/classes", mapClass)
  const [classId, setClassId] = useState(initialClassId)
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const [leaveModal, setLeaveModal] = useState<{
    status: "personal_leave" | "sick_leave"
    ids: string[]
    names: string[]
  } | null>(null)
  const [proofUrl, setProofUrl] = useState("")
  const [proofName, setProofName] = useState("")
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (initialClassId) setClassId(initialClassId)
  }, [initialClassId])

  const classOptions = useMemo(() => {
    return [...classes].sort((a, b) => a.start_time.localeCompare(b.start_time))
  }, [classes])

  const loadEnrollments = useCallback(async () => {
    if (!classId || demo) {
      setEnrollments([])
      setSelected(new Set())
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await apiGet<Record<string, unknown>[]>(`/classes/${classId}/enrollments`)
      setEnrollments((data || []).map(mapEnrollment))
      setSelected(new Set())
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed")
      setEnrollments([])
      setSelected(new Set())
    } finally {
      setLoading(false)
    }
  }, [classId, demo])

  useEffect(() => {
    if (classesReady) loadEnrollments()
  }, [classesReady, loadEnrollments])

  const allIds = useMemo(() => enrollments.map((e) => e.id), [enrollments])
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id))
  const someSelected = selected.size > 0 && !allSelected
  const byId = useMemo(() => new Map(enrollments.map((e) => [e.id, e])), [enrollments])

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(allIds))
  }

  function statusLabel(s: string) {
    const map: Record<string, string> = zh
      ? {
          enrolled: "待點名",
          attended: "已出席",
          absent: "缺席",
          personal_leave: "事假",
          sick_leave: "病假",
          leave_pending: "請假審核中",
        }
      : {
          enrolled: "Enrolled",
          attended: "Attended",
          absent: "Absent",
          personal_leave: "Personal leave",
          sick_leave: "Sick leave",
          leave_pending: "Leave pending",
        }
    return map[s] || s
  }

  async function applyStatus(ids: string[], status: AttendanceStatus, documentUrl?: string | null) {
    if (demo || !ids.length) return
    if (isLeaveStatus(status) && !String(documentUrl || "").trim()) {
      alert(zh ? "事假／病假必須上傳證明文件" : "Leave proof document is required")
      return
    }
    const now = new Date().toISOString().slice(0, 19).replace("T", " ")
    setSaving(true)
    try {
      await Promise.all(
        ids.map((enrollmentId) =>
          apiPatch(`/class-enrollments/${enrollmentId}`, {
            status,
            check_in_time: status === "attended" ? now : undefined,
            check_out_time: status === "attended" ? now : undefined,
            sick_leave_document_url: isLeaveStatus(status) ? documentUrl : undefined,
            leave_document_url: isLeaveStatus(status) ? documentUrl : undefined,
          }),
        ),
      )
      await loadEnrollments()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Update failed")
    } finally {
      setSaving(false)
    }
  }

  function openLeaveModal(status: "personal_leave" | "sick_leave", ids: string[]) {
    if (!ids.length) {
      alert(zh ? "請先勾選學員" : "Select students first")
      return
    }
    const names = ids.map((id) => {
      const row = byId.get(id)
      return row?.profile_name || row?.user_name || id
    })
    setProofUrl("")
    setProofName("")
    setUploadError(null)
    setLeaveModal({ status, ids, names })
  }

  function requestStatus(ids: string[], status: AttendanceStatus) {
    if (isLeaveStatus(status)) {
      openLeaveModal(status, ids)
      return
    }
    void applyStatus(ids, status)
  }

  function setStatus(enrollmentId: string, status: AttendanceStatus) {
    requestStatus([enrollmentId], status)
  }

  function bulkApply(status: AttendanceStatus) {
    const ids = [...selected]
    requestStatus(ids, status)
  }

  async function onProofFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setUploadError(null)
    if (file.size > MAX_DOC_BYTES) {
      setUploadError(zh ? "檔案須少於 5MB" : "File must be under 5MB")
      return
    }
    setUploading(true)
    try {
      const url = await uploadProofFile(file, demo)
      setProofUrl(url)
      setProofName(file.name)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed"
      setUploadError(
        /5MB|too large/i.test(msg)
          ? zh
            ? "檔案須少於 5MB"
            : "File must be under 5MB"
          : /Unsupported/i.test(msg)
            ? zh
              ? "只接受 PDF / DOC / DOCX / 圖片"
              : "PDF / DOC / DOCX / images only"
            : msg,
      )
    } finally {
      setUploading(false)
    }
  }

  async function confirmLeave() {
    if (!leaveModal) return
    if (!proofUrl.trim()) {
      setUploadError(zh ? "請先上傳證明文件，否則不可選擇事假／病假" : "Upload proof before selecting leave")
      return
    }
    const { ids, status } = leaveModal
    setLeaveModal(null)
    await applyStatus(ids, status, proofUrl)
    setProofUrl("")
    setProofName("")
  }

  if (!classesReady) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 rounded-full border-2 border-classz-400 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <AdminPageFrame>
      <AdminPageHeader
        title={zh ? "點名" : "Attendance"}
        Icon={ClipboardList}
        description={zh ? "事假／病假須上載證明（PDF／DOC，少於 5MB）" : "Personal/sick leave requires proof (PDF/DOC, under 5MB)"}
      />

      <div className="mb-4 max-w-md">
        <AdminLabel>{zh ? "選擇課堂" : "Select session"}</AdminLabel>
        <AdminSelect value={classId} onChange={(e) => setClassId(e.target.value)}>
          <option value="">{zh ? "請選擇…" : "Choose…"}</option>
          {classOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} — {c.start_time.slice(0, 16).replace("T", " ")}
            </option>
          ))}
        </AdminSelect>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading && (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 rounded-full border-2 border-classz-400 border-t-transparent animate-spin" />
        </div>
      )}

      {!loading && classId && enrollments.length > 0 ? (
        <AdminToolbar>
          <AdminGhostButton type="button" onClick={toggleAll} disabled={saving}>
            {allSelected ? (zh ? "取消全選" : "Deselect all") : zh ? "全選" : "Select all"}
            {selected.size > 0 ? ` (${selected.size})` : ""}
          </AdminGhostButton>
          <span className="text-sm text-classz-500 self-center">{zh ? "一次過設為：" : "Set selected to:"}</span>
          {STATUSES.map((s) => (
            <AdminPrimaryButton
              key={s}
              type="button"
              className="text-sm py-1.5 px-3"
              disabled={saving || selected.size === 0}
              onClick={() => bulkApply(s)}
            >
              {statusLabel(s)}
            </AdminPrimaryButton>
          ))}
        </AdminToolbar>
      ) : null}

      {!loading && classId && (
        <AdminTableShell>
          <AdminTable>
            <thead className="bg-classz-100">
              <tr>
                <th className="px-3 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected
                    }}
                    onChange={toggleAll}
                    disabled={!enrollments.length || saving}
                    aria-label={zh ? "全選" : "Select all"}
                  />
                </th>
                <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">
                  {zh ? "學員" : "Student"}
                </th>
                <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">
                  {zh ? "電話" : "Phone"}
                </th>
                <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">
                  {zh ? "狀態" : "Status"}
                </th>
                <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">
                  {zh ? "證明" : "Proof"}
                </th>
                <th className="px-3 py-3 text-right text-base font-semibold text-classz-600 uppercase">
                  {zh ? "操作" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-classz-100">
              {enrollments.map((e) => {
                const doc = e.leave_document_url || e.sick_leave_document_url
                return (
                  <tr key={e.id} className={selected.has(e.id) ? "bg-[#CEF1F0]/40" : "bg-white"}>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selected.has(e.id)}
                        onChange={() => toggleOne(e.id)}
                        disabled={saving}
                        aria-label={e.profile_name || e.user_name}
                      />
                    </td>
                    <td className="px-3 py-2 text-classz-800 font-medium">{e.profile_name || e.user_name}</td>
                    <td className="px-3 py-2 text-classz-600">{e.user_mobile || "—"}</td>
                    <td className="px-3 py-2 text-classz-600">{statusLabel(e.status)}</td>
                    <td className="px-3 py-2 text-sm">
                      {doc ? (
                        <a
                          href={resolveUploadUrl(doc)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-classz-600 hover:underline"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          {zh ? "查看" : "View"}
                        </a>
                      ) : (
                        <span className="text-classz-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right space-x-1">
                      {STATUSES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          disabled={saving || e.status === s}
                          className={`px-2 py-1 text-xs rounded border ${
                            e.status === s
                              ? "bg-classz-100 border-classz-300 text-classz-700"
                              : "border-classz-200 text-classz-600 hover:bg-classz-50"
                          }`}
                          onClick={() => setStatus(e.id, s)}
                          title={
                            isLeaveStatus(s)
                              ? zh
                                ? "需上載證明文件"
                                : "Proof document required"
                              : undefined
                          }
                        >
                          {statusLabel(s)}
                        </button>
                      ))}
                    </td>
                  </tr>
                )
              })}
              {enrollments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-classz-500">
                    {zh ? "此課堂暫無學員報名" : "No enrollments for this session"}
                  </td>
                </tr>
              )}
            </tbody>
          </AdminTable>
        </AdminTableShell>
      )}

      {!classId && !loading && (
        <p className="text-classz-600">{zh ? "請先選擇要點名的課堂" : "Pick a class session to take attendance"}</p>
      )}

      <AdminModal
        open={leaveModal != null}
        title={
          leaveModal
            ? zh
              ? `上傳${statusLabel(leaveModal.status)}證明`
              : `Upload ${statusLabel(leaveModal.status)} proof`
            : ""
        }
        onClose={() => {
          if (saving || uploading) return
          setLeaveModal(null)
          setProofUrl("")
          setProofName("")
          setUploadError(null)
        }}
        footer={
          <>
            <AdminGhostButton
              type="button"
              disabled={saving || uploading}
              onClick={() => {
                setLeaveModal(null)
                setProofUrl("")
                setProofName("")
                setUploadError(null)
              }}
            >
              {zh ? "取消" : "Cancel"}
            </AdminGhostButton>
            <AdminPrimaryButton type="button" disabled={saving || uploading || !proofUrl} onClick={confirmLeave}>
              {saving ? (zh ? "儲存中…" : "Saving…") : zh ? "確認並套用" : "Confirm"}
            </AdminPrimaryButton>
          </>
        }
      >
        {leaveModal ? (
          <div className="space-y-4">
            <p className="text-sm text-classz-700">
              {zh
                ? `選擇「${statusLabel(leaveModal.status)}」必須上載證明文件（PDF／DOC／DOCX／圖片，少於 5MB），否則不能確認。`
                : `Selecting “${statusLabel(leaveModal.status)}” requires a proof document (PDF/DOC/DOCX/image, under 5MB).`}
            </p>
            <div className="rounded-md border border-classz-100 bg-classz-50 px-3 py-2 text-sm max-h-28 overflow-y-auto">
              <p className="text-xs text-classz-500 mb-1">
                {zh ? `學員（${leaveModal.ids.length}）` : `Students (${leaveModal.ids.length})`}
              </p>
              <ul className="list-disc pl-4 text-classz-700">
                {leaveModal.names.map((n, i) => (
                  <li key={`${leaveModal.ids[i]}-${n}`}>{n}</li>
                ))}
              </ul>
            </div>

            <div>
              <AdminLabel>{zh ? "證明文件" : "Proof document"}</AdminLabel>
              <input
                ref={fileRef}
                id={fileInputId}
                type="file"
                accept={DOC_ACCEPT}
                className="sr-only"
                onChange={onProofFileChange}
              />
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <AdminGhostButton type="button" disabled={uploading} onClick={() => fileRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5" />
                  {uploading ? (zh ? "上傳中…" : "Uploading…") : zh ? "上傳檔案" : "Upload file"}
                </AdminGhostButton>
                {proofUrl ? (
                  <a
                    href={resolveUploadUrl(proofUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-classz-600 hover:underline"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    {proofName || (zh ? "已上傳" : "Uploaded")}
                  </a>
                ) : (
                  <span className="text-sm text-classz-400">{zh ? "尚未上傳" : "No file yet"}</span>
                )}
              </div>
              {uploadError ? <p className="text-xs text-red-600 mt-2">{uploadError}</p> : null}
              {!proofUrl && !uploadError ? (
                <p className="text-xs text-classz-500 mt-2">
                  {zh ? "未上傳證明前無法確認事假／病假。" : "Cannot confirm leave without a proof document."}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </AdminModal>
    </AdminPageFrame>
  )
}
