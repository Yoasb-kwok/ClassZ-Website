"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { UserPlus, X } from "lucide-react"
import { apiDelete, apiGet, apiPost } from "@/lib/classz-api-client"
import { AdminLabel, AdminPrimaryButton, AdminSelect } from "@/components/classz-admin-ui"

type StudentOption = {
  key: string
  userId: number
  profileId: number
  label: string
}

type EnrollmentRow = {
  id: number
  profile_name: string
  user_name: string
  status: string
}

type StudentProfileOption = {
  profile_id: number
  user_id: number
  profile_name: string
  parent_name?: string
  email?: string
}

export function ScheduleClassEnrollments({
  classId,
  zh,
  onChanged,
}: {
  classId: string
  zh: boolean
  onChanged?: () => void
}) {
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([])
  const [studentKey, setStudentKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)
  const [students, setStudents] = useState<StudentOption[]>([])

  const loadEnrollments = useCallback(async () => {
    if (!classId) return
    setLoading(true)
    try {
      const data = await apiGet<EnrollmentRow[]>(`/classes/${classId}/enrollments`)
      setEnrollments(Array.isArray(data) ? data : [])
    } catch {
      setEnrollments([])
    } finally {
      setLoading(false)
    }
  }, [classId])

  const loadStudents = useCallback(async () => {
    try {
      const data = await apiGet<StudentProfileOption[]>("/student-profiles")
      const options: StudentOption[] = (data || [])
        .map((row) => {
          const userId = Number(row.user_id)
          const profileId = Number(row.profile_id)
          if (!userId || !profileId) return null
          const childName = row.profile_name || `#${profileId}`
          const parent = row.parent_name || row.email || ""
          return {
            key: `${userId}:${profileId}`,
            userId,
            profileId,
            label: parent ? `${childName} · ${parent}` : childName,
          }
        })
        .filter(Boolean) as StudentOption[]
      setStudents(options)
      if (options.length) {
        setStudentKey((prev) => prev || options[0].key)
      }
    } catch {
      setStudents([])
    }
  }, [])

  useEffect(() => {
    loadEnrollments()
    loadStudents()
  }, [loadEnrollments, loadStudents])

  const selected = useMemo(
    () => students.find((s) => s.key === studentKey) || null,
    [students, studentKey]
  )

  async function addStudent() {
    if (!classId || !selected || !selected.profileId) {
      alert(zh ? "請選擇有效學員" : "Select a valid student profile")
      return
    }
    setAdding(true)
    try {
      await apiPost(`/classes/${classId}/enrollments`, {
        user_id: selected.userId,
        profile_id: selected.profileId,
      })
      await loadEnrollments()
      onChanged?.()
    } catch (e) {
      alert(e instanceof Error ? e.message : zh ? "新增失敗" : "Add failed")
    } finally {
      setAdding(false)
    }
  }

  async function removeStudent(enrollmentId: number) {
    if (!confirm(zh ? "移除此學員？" : "Remove this student?")) return
    try {
      await apiDelete(`/class-enrollments/${enrollmentId}`)
      await loadEnrollments()
      onChanged?.()
    } catch (e) {
      alert(e instanceof Error ? e.message : zh ? "移除失敗" : "Remove failed")
    }
  }

  return (
    <div className="border-t border-classz-100 pt-4 mt-4 space-y-3">
      <h4 className="text-sm font-semibold text-classz-800">{zh ? "課堂學員" : "Session students"}</h4>

      {loading ? (
        <p className="text-sm text-classz-500">{zh ? "載入中…" : "Loading…"}</p>
      ) : enrollments.length === 0 ? (
        <p className="text-sm text-classz-500">{zh ? "尚未加入學員" : "No students yet"}</p>
      ) : (
        <ul className="space-y-1 max-h-36 overflow-y-auto">
          {enrollments.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-2 text-sm bg-classz-50 rounded px-2 py-1.5">
              <span className="text-classz-800 truncate">{e.profile_name || e.user_name}</span>
              <button
                type="button"
                className="shrink-0 p-1 text-red-600 hover:bg-red-50 rounded"
                onClick={() => removeStudent(e.id)}
                aria-label={zh ? "移除" : "Remove"}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[12rem]">
          <AdminLabel>{zh ? "加入學員" : "Add student"}</AdminLabel>
          <AdminSelect value={studentKey} onChange={(e) => setStudentKey(e.target.value)}>
            <option value="">{zh ? "選擇學員…" : "Select student…"}</option>
            {students
              .filter((s) => s.profileId > 0)
              .map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
          </AdminSelect>
        </div>
        <AdminPrimaryButton type="button" className="shrink-0" disabled={adding || !selected?.profileId} onClick={addStudent}>
          <UserPlus className="h-4 w-4" />
          {adding ? (zh ? "加入中…" : "Adding…") : zh ? "加入" : "Add"}
        </AdminPrimaryButton>
      </div>
    </div>
  )
}
