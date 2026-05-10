"use client"

import { useMemo, useState } from "react"
import { Edit, GraduationCap, Plus, Search, Trash2 } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { appendAudit, newId, type AdminInstructor } from "@/lib/classz-admin-store"
import { useAdminStore } from "@/components/admin/use-admin-store"
import {
  AdminCard,
  AdminInput,
  AdminLabel,
  AdminModal,
  AdminPageFrame,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminTable,
  AdminTableShell,
  AdminTextarea,
  AdminToolbar,
} from "@/components/classz-admin-ui"

export function InstructorsManager() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const { store, patch, ready } = useAdminStore()
  const [search, setSearch] = useState("")
  const [modal, setModal] = useState<"create" | "edit" | null>(null)
  const [editing, setEditing] = useState<AdminInstructor | null>(null)
  const [form, setForm] = useState({ name: "", email: "", phone: "", bio: "" })

  const rows = useMemo(() => {
    if (!store) return []
    const q = search.trim().toLowerCase()
    return store.instructors.filter((i) => !q || i.name.toLowerCase().includes(q) || i.email.toLowerCase().includes(q))
  }, [store, search])

  function openCreate() {
    setEditing(null)
    setForm({ name: "", email: "", phone: "", bio: "" })
    setModal("create")
  }

  function openEdit(i: AdminInstructor) {
    setEditing(i)
    setForm({ name: i.name, email: i.email, phone: i.phone, bio: i.bio })
    setModal("edit")
  }

  function save() {
    if (!store) return
    if (modal === "create") {
      const ins: AdminInstructor = {
        id: newId(),
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        bio: form.bio.trim(),
        created_at: new Date().toISOString(),
      }
      patch((s) => appendAudit({ ...s, instructors: [...s.instructors, ins] }, { action: "create_instructor", target_type: "instructor", target_id: ins.id, details: ins.name }))
    } else if (editing) {
      patch((s) =>
        appendAudit(
          {
            ...s,
            instructors: s.instructors.map((x) =>
              x.id === editing.id
                ? { ...x, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), bio: form.bio.trim() }
                : x
            ),
          },
          { action: "update_instructor", target_type: "instructor", target_id: editing.id, details: form.name.trim() }
        )
      )
    }
    setModal(null)
  }

  function remove(id: string) {
    if (!confirm(zh ? "刪除此導師？" : "Delete this instructor?")) return
    patch((s) =>
      appendAudit(
        { ...s, instructors: s.instructors.filter((i) => i.id !== id) },
        { action: "delete_instructor", target_type: "instructor", target_id: id, details: "" }
      )
    )
  }

  if (!ready || !store) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 rounded-full border-2 border-classz-400 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <AdminPageFrame>
      <AdminPageHeader title={zh ? "導師管理" : "Instructor management"} Icon={GraduationCap} />
      <AdminCard>
        <AdminToolbar>
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-classz-400 pointer-events-none" />
            <AdminInput className="pl-9" placeholder={zh ? "搜尋…" : "Search…"} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <AdminPrimaryButton type="button" className="ml-auto" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            {zh ? "新增導師" : "Add instructor"}
          </AdminPrimaryButton>
        </AdminToolbar>
        <AdminTableShell>
          <AdminTable>
            <thead className="bg-classz-100">
              <tr>
                <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">{zh ? "姓名" : "Name"}</th>
                <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">Email</th>
                <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">{zh ? "電話" : "Phone"}</th>
                <th className="px-3 py-3 text-right text-base font-semibold text-classz-600 uppercase">{zh ? "操作" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-classz-100">
              {rows.map((i) => (
                <tr key={i.id} className="bg-white">
                  <td className="px-3 py-2 text-classz-700 font-medium">{i.name}</td>
                  <td className="px-3 py-2 text-classz-600 text-base">{i.email}</td>
                  <td className="px-3 py-2 text-classz-600">{i.phone}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <button type="button" className="p-1.5 text-classz-500 hover:bg-classz-50 rounded" onClick={() => openEdit(i)}>
                      <Edit className="h-4 w-4" />
                    </button>
                    <button type="button" className="p-1.5 text-red-600 hover:bg-red-50 rounded ml-1" onClick={() => remove(i.id)}>
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
        title={modal === "create" ? (zh ? "新增導師" : "Add instructor") : zh ? "編輯導師" : "Edit instructor"}
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
            <AdminLabel>{zh ? "姓名" : "Name"}</AdminLabel>
            <AdminInput value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <AdminLabel>Email</AdminLabel>
            <AdminInput value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <AdminLabel>{zh ? "電話" : "Phone"}</AdminLabel>
            <AdminInput value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </div>
          <div>
            <AdminLabel>{zh ? "簡介" : "Bio"}</AdminLabel>
            <AdminTextarea className="min-h-[100px]" value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
          </div>
        </div>
      </AdminModal>
    </AdminPageFrame>
  )
}
