"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { Building2, CheckCircle, Edit, ExternalLink, Plus, Search, Trash2, XCircle } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/classz-api-client"
import { centerCrmFlowPath } from "@/lib/center-crm-scope"
import {
  AdminCard,
  AdminDangerButton,
  AdminGhostButton,
  AdminInput,
  AdminLabel,
  AdminModal,
  AdminPageFrame,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminSelect,
  AdminStatusChip,
  AdminTable,
  AdminTableShell,
  AdminToolbar,
  statusTone,
} from "@/components/classz-admin-ui"

const DISTRICTS = [
  "Central and Western",
  "Eastern",
  "Southern",
  "Wan Chai",
  "Kowloon City",
  "Kwun Tong",
  "Sham Shui Po",
  "Wong Tai Sin",
  "Yau Tsim Mong",
  "Islands",
  "Kwai Tsing",
  "North",
  "Sai Kung",
  "Sha Tin",
  "Tai Po",
  "Tsuen Wan",
  "Tuen Mun",
  "Yuen Long",
]

const STATUSES = ["pending_approval", "active", "beta_trial", "suspended"] as const

type CenterRow = {
  id: number
  center_name: string
  district: string
  category: string
  status: string
  admin_email?: string | null
  admin_name?: string | null
  created_at?: string
}

type FormState = {
  center_name: string
  district: string
  category: string
  status: string
}

const emptyForm = (): FormState => ({
  center_name: "",
  district: DISTRICTS[0],
  category: "dance",
  status: "pending_approval",
})

export function CentersManager() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const [rows, setRows] = useState<CenterRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [modal, setModal] = useState<"create" | "edit" | null>(null)
  const [editing, setEditing] = useState<CenterRow | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const qs = new URLSearchParams()
      if (statusFilter) qs.set("status", statusFilter)
      if (search.trim()) qs.set("search", search.trim())
      const path = `/centers${qs.toString() ? `?${qs}` : ""}`
      const data = await apiGet<CenterRow[]>(path, "platform_admin")
      setRows(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed")
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    load()
  }, [load])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm())
    setModal("create")
  }

  function openEdit(c: CenterRow) {
    setEditing(c)
    setForm({
      center_name: c.center_name,
      district: c.district,
      category: c.category,
      status: c.status,
    })
    setModal("edit")
  }

  async function save() {
    if (!form.center_name.trim() || !form.category.trim()) {
      alert(zh ? "請填寫中心名稱及類別" : "Centre name and category are required")
      return
    }
    setSaving(true)
    try {
      const body = {
        center_name: form.center_name.trim(),
        district: form.district,
        category: form.category.trim(),
        status: form.status,
      }
      if (modal === "create") {
        await apiPost("/centers", body, "platform_admin")
      } else if (editing) {
        await apiPatch(`/centers/${editing.id}`, body, "platform_admin")
      }
      setModal(null)
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  async function removeCenter(c: CenterRow) {
    if (!confirm(zh ? `確定刪除「${c.center_name}」？（僅限無關聯資料）` : `Delete "${c.center_name}"? (only if no related data)`)) return
    try {
      await apiDelete(`/centers/${c.id}`, "platform_admin")
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed")
    }
  }

  async function approve(id: number) {
    try {
      await apiPost(`/centers/${id}/approve`, {}, "platform_admin")
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed")
    }
  }

  async function setStatus(id: number, status: string) {
    try {
      await apiPatch(`/centers/${id}/status`, { status }, "platform_admin")
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 rounded-full border-2 border-classz-400 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <AdminPageFrame>
      <AdminPageHeader
        title={zh ? "中心審核" : "Centre management"}
        description={zh ? "管理平台中心資料：新增、編輯、審批、停用或刪除。" : "Manage centres: create, edit, approve, suspend, or delete."}
        Icon={Building2}
      />

      <AdminToolbar>
        <div className="relative flex-1 min-w-[12rem]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-classz-400" />
          <AdminInput
            className="pl-9"
            placeholder={zh ? "搜尋中心、地區、Admin…" : "Search centre, district, admin…"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
          />
        </div>
        <AdminSelect className="w-full sm:w-44" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">{zh ? "全部狀態" : "All statuses"}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </AdminSelect>
        <AdminGhostButton type="button" onClick={() => load()}>
          {zh ? "搜尋" : "Search"}
        </AdminGhostButton>
        <AdminPrimaryButton type="button" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {zh ? "新增中心" : "Add centre"}
        </AdminPrimaryButton>
      </AdminToolbar>

      {error ? <div className="text-brand-coral text-sm mb-4">{error}</div> : null}

      <AdminCard>
        <AdminTableShell>
          <AdminTable>
            <thead className="bg-classz-100">
              <tr>
                <th className="px-3 py-3 text-left">ID</th>
                <th className="px-3 py-3 text-left">{zh ? "中心" : "Centre"}</th>
                <th className="px-3 py-3 text-left">{zh ? "地區" : "District"}</th>
                <th className="px-3 py-3 text-left">{zh ? "類別" : "Category"}</th>
                <th className="px-3 py-3 text-left">Admin</th>
                <th className="px-3 py-3 text-left">{zh ? "狀態" : "Status"}</th>
                <th className="px-3 py-3 text-right">{zh ? "操作" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-classz-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-classz-500">
                    {zh ? "暫無中心" : "No centres"}
                  </td>
                </tr>
              ) : (
                rows.map((c) => (
                  <tr key={c.id} className="bg-white">
                    <td className="px-3 py-2">{c.id}</td>
                    <td className="px-3 py-2 font-medium">{c.center_name}</td>
                    <td className="px-3 py-2 text-sm">{c.district}</td>
                    <td className="px-3 py-2 text-sm">{c.category}</td>
                    <td className="px-3 py-2 text-sm">{c.admin_email || c.admin_name || "—"}</td>
                    <td className="px-3 py-2">
                      <AdminStatusChip tone={statusTone(c.status)}>{c.status}</AdminStatusChip>
                    </td>
                    <td className="px-3 py-2 text-right space-x-1 whitespace-nowrap">
                      <Link href={centerCrmFlowPath(c.id, "programs")}>
                        <AdminGhostButton type="button" className="inline-flex text-sm py-1 px-2" title={zh ? "管理 CRM" : "Open CRM"}>
                          <ExternalLink className="h-4 w-4" />
                          CRM
                        </AdminGhostButton>
                      </Link>
                      <AdminGhostButton type="button" className="inline-flex text-sm py-1 px-2" onClick={() => openEdit(c)}>
                        <Edit className="h-4 w-4" />
                      </AdminGhostButton>
                      {c.status === "pending_approval" ? (
                        <AdminPrimaryButton type="button" className="inline-flex text-sm py-1 px-2" onClick={() => approve(c.id)}>
                          <CheckCircle className="h-4 w-4" />
                          {zh ? "批准" : "Approve"}
                        </AdminPrimaryButton>
                      ) : null}
                      {c.status !== "suspended" ? (
                        <AdminGhostButton type="button" className="inline-flex text-sm py-1 px-2" onClick={() => setStatus(c.id, "suspended")}>
                          <XCircle className="h-4 w-4" />
                          {zh ? "停用" : "Suspend"}
                        </AdminGhostButton>
                      ) : (
                        <AdminGhostButton type="button" className="inline-flex text-sm py-1 px-2" onClick={() => setStatus(c.id, "active")}>
                          {zh ? "啟用" : "Activate"}
                        </AdminGhostButton>
                      )}
                      <AdminDangerButton type="button" className="inline-flex text-sm py-1 px-2" onClick={() => removeCenter(c)}>
                        <Trash2 className="h-4 w-4" />
                      </AdminDangerButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </AdminTable>
        </AdminTableShell>
      </AdminCard>

      <AdminModal
        open={modal !== null}
        title={modal === "create" ? (zh ? "新增中心" : "Add centre") : zh ? "編輯中心" : "Edit centre"}
        onClose={() => setModal(null)}
        footer={
          <>
            <AdminGhostButton type="button" onClick={() => setModal(null)}>
              {zh ? "取消" : "Cancel"}
            </AdminGhostButton>
            <AdminPrimaryButton type="button" disabled={saving} onClick={() => save()}>
              {saving ? (zh ? "儲存中…" : "Saving…") : zh ? "儲存" : "Save"}
            </AdminPrimaryButton>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <AdminLabel>{zh ? "中心名稱" : "Centre name"}</AdminLabel>
            <AdminInput value={form.center_name} onChange={(e) => setForm((f) => ({ ...f, center_name: e.target.value }))} />
          </div>
          <div>
            <AdminLabel>{zh ? "地區" : "District"}</AdminLabel>
            <AdminSelect value={form.district} onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </AdminSelect>
          </div>
          <div>
            <AdminLabel>{zh ? "類別" : "Category"}</AdminLabel>
            <AdminInput value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="dance, music, …" />
          </div>
          <div>
            <AdminLabel>{zh ? "狀態" : "Status"}</AdminLabel>
            <AdminSelect value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </AdminSelect>
          </div>
          {modal === "create" ? (
            <p className="text-sm text-classz-600">
              {zh ? "新增中心後，請到「中心帳戶」建立主帳戶登入。" : "After creating a centre, add a primary login under Centre accounts."}
            </p>
          ) : null}
        </div>
      </AdminModal>
    </AdminPageFrame>
  )
}
