"use client"

import { useMemo, useState } from "react"
import { BookOpen, Edit, Plus, Search, Trash2 } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { appendAudit, newId, type AdminCourse } from "@/lib/classz-admin-store"
import { useAdminStore } from "@/components/admin/use-admin-store"
import { isDemoSession } from "@/components/admin/use-admin-api"
import { apiPatch, apiPost } from "@/lib/classz-api-client"
import { useCenterApiList } from "@/components/admin/use-center-api-list"
import {
  AdminCard,
  AdminInput,
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

export function CoursesManager({ variant = "courses" }: { variant?: "courses" | "programs" }) {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const isPrograms = variant === "programs"
  const demo = isDemoSession()
  const { store, patch, ready: storeReady } = useAdminStore()
  const mapCourse = (r: Record<string, unknown>): AdminCourse => ({
    id: String(r.id),
    name: String(r.name || ""),
    instructor: String(r.instructor || ""),
    start_time: String(r.created_at || new Date().toISOString()),
    end_time: String(r.updated_at || new Date().toISOString()),
    capacity: 10,
    enrolled_count: 0,
    status: String(r.publish_status || "draft") as AdminCourse["status"],
    location: String(r.location || ""),
  })
  const { rows: apiRows, ready: apiReady, reload, error: apiError } = useCenterApiList("/courses", mapCourse)
  const ready = demo ? storeReady : apiReady
  const courses = demo ? store?.courses : apiRows
  const [search, setSearch] = useState("")
  const [modal, setModal] = useState<"create" | "edit" | null>(null)
  const [editing, setEditing] = useState<AdminCourse | null>(null)
  const [form, setForm] = useState({
    name: "",
    instructor: "",
    start_time: "",
    end_time: "",
    capacity: "10",
    enrolled_count: "0",
    status: "published" as AdminCourse["status"],
    location: "",
    price: "",
    age_min: "",
    age_max: "",
    default_instructor_id: "",
  })

  const rows = useMemo(() => {
    if (!courses) return []
    const q = search.trim().toLowerCase()
    return courses.filter((c) => !q || c.name.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q))
  }, [courses, search])

  function openCreate() {
    const now = new Date()
    const end = new Date(now.getTime() + 3600000)
    setEditing(null)
    setForm({
      name: "",
      instructor: "",
      start_time: now.toISOString().slice(0, 16),
      end_time: end.toISOString().slice(0, 16),
      capacity: "10",
      enrolled_count: "0",
      status: "published",
      location: zh ? "旺角" : "MK",
      price: "",
      age_min: "",
      age_max: "",
      default_instructor_id: "",
    })
    setModal("create")
  }

  function openEdit(c: AdminCourse) {
    setEditing(c)
    setForm({
      name: c.name,
      instructor: c.instructor,
      start_time: c.start_time.slice(0, 16),
      end_time: c.end_time.slice(0, 16),
      capacity: String(c.capacity),
      enrolled_count: String(c.enrolled_count),
      status: c.status,
      location: c.location,
      price: String((c as { price?: number }).price ?? ""),
      age_min: String((c as { age_min?: number }).age_min ?? ""),
      age_max: String((c as { age_max?: number }).age_max ?? ""),
      default_instructor_id: String((c as { default_instructor_id?: number }).default_instructor_id ?? ""),
    })
    setModal("edit")
  }

  async function save() {
    if (!demo) {
      try {
        const body: Record<string, unknown> = {
          name: form.name.trim(),
          instructor: form.instructor.trim(),
          location: form.location.trim(),
        }
        if (form.price !== "") body.price = Number(form.price)
        if (form.age_min !== "") body.age_min = Number(form.age_min)
        if (form.age_max !== "") body.age_max = Number(form.age_max)
        if (form.default_instructor_id !== "") body.default_instructor_id = Number(form.default_instructor_id)
        if (modal === "create") {
          const created = await apiPost<{ id: number; publish_status?: string }>("/courses", body)
          if (form.status === "published" && created?.id) {
            await apiPost(`/courses/${created.id}/submit-for-approval`, {})
          }
        } else if (editing) {
          await apiPatch(`/courses/${editing.id}`, { ...body, publish_status: form.status })
          if (form.status === "published") {
            await apiPost(`/courses/${editing.id}/submit-for-approval`, {})
          }
        }
        await reload()
        setModal(null)
      } catch (e) {
        alert(e instanceof Error ? e.message : "Save failed")
      }
      return
    }
    if (!store) return
    const cap = Math.max(1, parseInt(form.capacity, 10) || 10)
    const enr = Math.max(0, parseInt(form.enrolled_count, 10) || 0)
    if (modal === "create") {
      const c: AdminCourse = {
        id: newId(),
        name: form.name.trim(),
        instructor: form.instructor.trim(),
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
        capacity: cap,
        enrolled_count: Math.min(enr, cap),
        status: form.status,
        location: form.location.trim(),
      }
      patch((s) => appendAudit({ ...s, courses: [...s.courses, c] }, { action: "create_course", target_type: "course", target_id: c.id, details: c.name }))
    } else if (editing) {
      patch((s) =>
        appendAudit(
          {
            ...s,
            courses: s.courses.map((x) =>
              x.id === editing.id
                ? {
                    ...x,
                    name: form.name.trim(),
                    instructor: form.instructor.trim(),
                    start_time: new Date(form.start_time).toISOString(),
                    end_time: new Date(form.end_time).toISOString(),
                    capacity: cap,
                    enrolled_count: Math.min(Math.max(0, parseInt(form.enrolled_count, 10) || 0), cap),
                    status: form.status,
                    location: form.location.trim(),
                  }
                : x
            ),
          },
          { action: "update_course", target_type: "course", target_id: editing.id, details: form.name.trim() }
        )
      )
    }
    setModal(null)
  }

  function remove(id: string) {
    if (!confirm(zh ? "刪除此課程？" : "Delete this course?")) return
    patch((s) => appendAudit({ ...s, courses: s.courses.filter((c) => c.id !== id) }, { action: "delete_course", target_type: "course", target_id: id, details: "" }))
  }

  if (!ready || (demo && !store) || (!demo && !courses)) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 rounded-full border-2 border-classz-400 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <AdminPageFrame>
      <AdminPageHeader
        title={isPrograms ? (zh ? "課程設定" : "Programs") : zh ? "課程管理" : "Course management"}
        Icon={BookOpen}
      />
      <AdminCard>
        {apiError && !demo ? (
          <div className="mb-3 text-sm text-brand-coral bg-[color-mix(in_srgb,var(--brand-coral)_10%,white)] border border-[color-mix(in_srgb,var(--brand-coral)_35%,white)] rounded-md px-3 py-2">{apiError}</div>
        ) : null}
        <AdminToolbar>
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-classz-400 pointer-events-none" />
            <AdminInput className="pl-9" placeholder={zh ? "搜尋…" : "Search…"} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <AdminPrimaryButton type="button" className="ml-auto" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            {isPrograms ? (zh ? "新增課程" : "Add program") : zh ? "新增課程" : "Add course"}
          </AdminPrimaryButton>
        </AdminToolbar>
        <AdminTableShell>
          <AdminTable>
            <thead className="bg-classz-100">
              <tr>
                <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">{zh ? "課程" : "Course"}</th>
                <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">{zh ? "導師" : "Instructor"}</th>
                <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">{zh ? "狀態" : "Status"}</th>
                <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">{zh ? "地點" : "Location"}</th>
                <th className="px-3 py-3 text-right text-base font-semibold text-classz-600 uppercase">{zh ? "操作" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-classz-100">
              {rows.map((c) => (
                <tr key={c.id} className="bg-white">
                  <td className="px-3 py-2 text-classz-700 font-medium">{c.name}</td>
                  <td className="px-3 py-2 text-classz-600">{c.instructor}</td>
                  <td className="px-3 py-2 text-classz-600">{c.status}</td>
                  <td className="px-3 py-2 text-classz-600">{c.location}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <button type="button" className="p-1.5 text-classz-500 hover:bg-classz-50 rounded" onClick={() => openEdit(c)}>
                      <Edit className="h-4 w-4" />
                    </button>
                    <button type="button" className="p-1.5 text-brand-coral hover:bg-[color-mix(in_srgb,var(--brand-coral)_10%,white)] rounded ml-1" onClick={() => remove(c.id)}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        </AdminTableShell>
      </AdminCard>

      <AdminModal
        open={modal !== null}
        title={modal === "create" ? (zh ? "新增課程" : "Add course") : zh ? "編輯課程" : "Edit course"}
        onClose={() => setModal(null)}
        footer={
          <>
            <button type="button" className="px-4 py-2.5 text-base text-classz-700 hover:bg-classz-50 rounded-md border border-classz-200" onClick={() => setModal(null)}>
              {zh ? "取消" : "Cancel"}
            </button>
            <AdminPrimaryButton onClick={save}>{zh ? "儲存" : "Save"}</AdminPrimaryButton>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <AdminLabel>{zh ? "名稱" : "Name"}</AdminLabel>
            <AdminInput value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <AdminLabel>{zh ? "導師" : "Instructor"}</AdminLabel>
            <AdminInput value={form.instructor} onChange={(e) => setForm((f) => ({ ...f, instructor: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <AdminLabel>{zh ? "開始" : "Start"}</AdminLabel>
              <AdminInput type="datetime-local" value={form.start_time} onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))} />
            </div>
            <div>
              <AdminLabel>{zh ? "結束" : "End"}</AdminLabel>
              <AdminInput type="datetime-local" value={form.end_time} onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <AdminLabel>{zh ? "名額" : "Capacity"}</AdminLabel>
              <AdminInput value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} />
            </div>
            <div>
              <AdminLabel>{zh ? "已報" : "Enrolled"}</AdminLabel>
              <AdminInput value={form.enrolled_count} onChange={(e) => setForm((f) => ({ ...f, enrolled_count: e.target.value }))} />
            </div>
          </div>
          <div>
            <AdminLabel>{zh ? "狀態" : "Status"}</AdminLabel>
            <AdminSelect value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as AdminCourse["status"] }))}>
              <option value="draft">draft</option>
              <option value="published">published</option>
            </AdminSelect>
          </div>
          <div>
            <AdminLabel>{zh ? "地點" : "Location"}</AdminLabel>
            <AdminInput value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <AdminLabel>{zh ? "價錢" : "Price"}</AdminLabel>
                <AdminInput value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
              </div>
              <div>
                <AdminLabel>{zh ? "年齡下限" : "Age min"}</AdminLabel>
                <AdminInput value={form.age_min} onChange={(e) => setForm((f) => ({ ...f, age_min: e.target.value }))} />
              </div>
              <div>
                <AdminLabel>{zh ? "年齡上限" : "Age max"}</AdminLabel>
                <AdminInput value={form.age_max} onChange={(e) => setForm((f) => ({ ...f, age_max: e.target.value }))} />
              </div>
              <div>
                <AdminLabel>{zh ? "預設導師 ID" : "Teacher ID"}</AdminLabel>
                <AdminInput
                  value={form.default_instructor_id}
                  onChange={(e) => setForm((f) => ({ ...f, default_instructor_id: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>
      </AdminModal>
    </AdminPageFrame>
  )
}
