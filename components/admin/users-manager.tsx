"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Download, Edit, Plus, Search, Send, Trash2, Users } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { appendAudit, newId, type AdminUser } from "@/lib/classz-admin-store"
import { useAdminStore } from "@/components/admin/use-admin-store"
import { isDemoSession } from "@/components/admin/use-admin-api"
import { apiDelete, apiGet, apiPatch } from "@/lib/classz-api-client"
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
  AdminTable,
  AdminTableShell,
  AdminToolbar,
} from "@/components/classz-admin-ui"
export function UsersManager() {
  const { t, locale } = useLanguage()
  const zh = locale === "zh-TW"
  const demo = isDemoSession()
  const { store, patch, ready: storeReady } = useAdminStore()
  const [apiUsers, setApiUsers] = useState<AdminUser[]>([])
  const [apiReady, setApiReady] = useState(!demo)
  const [apiError, setApiError] = useState<string | null>(null)
  const ready = demo ? storeReady : apiReady
  const storeUsers = demo ? store?.users : apiUsers
  const [search, setSearch] = useState("")
  const [modal, setModal] = useState<"create" | "edit" | null>(null)
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [form, setForm] = useState({
    account_number: "",
    full_name: "",
    username: "",
    email: "",
    mobile: "",
    remaining_tokens: "0",
    token_expiry: "",
  })
  const [bulkMsg, setBulkMsg] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const loadApiUsers = useCallback(async () => {
    if (demo) return
    setApiReady(false)
    try {
      const data = await apiGet<
        Array<{
          id: string
          full_name?: string
          email?: string
          mobile?: string
          username?: string
          account_number?: string
          student_id?: string
          created_at?: string
          user_tokens?: Array<{ remaining_tokens?: number; expiry_date?: string }>
        }>
      >("/users")
      setApiUsers(
        (data || []).map((u) => ({
          id: String(u.id),
          account_number: u.account_number || u.student_id || String(u.id),
          full_name: u.full_name || "",
          username: u.username || "",
          email: u.email || "",
          mobile: u.mobile || "",
          role: "student" as const,
          remaining_tokens: u.user_tokens?.[0]?.remaining_tokens ?? 0,
          token_expiry: u.user_tokens?.[0]?.expiry_date || new Date().toISOString().slice(0, 10),
          created_at: u.created_at || new Date().toISOString(),
        }))
      )
      setApiError(null)
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "Failed to load users")
    } finally {
      setApiReady(true)
    }
  }, [demo])

  useEffect(() => {
    loadApiUsers()
  }, [loadApiUsers])

  const filtered = useMemo(() => {
    if (!storeUsers) return []
    const q = search.trim().toLowerCase()
    if (!q) return storeUsers
    return storeUsers.filter(
      (u) =>
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.account_number.toLowerCase().includes(q) ||
        u.mobile.includes(q)
    )
  }, [storeUsers, search])

  function openCreate() {
    setEditing(null)
    setForm({
      account_number: "",
      full_name: "",
      username: "",
      email: "",
      mobile: "",
      remaining_tokens: "0",
      token_expiry: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    })
    setModal("create")
  }

  function openEdit(u: AdminUser) {
    setEditing(u)
    setForm({
      account_number: u.account_number,
      full_name: u.full_name,
      username: u.username,
      email: u.email,
      mobile: u.mobile,
      remaining_tokens: String(u.remaining_tokens),
      token_expiry: u.token_expiry.slice(0, 10),
    })
    setModal("edit")
  }

  async function saveUser() {
    if (demo) {
      if (!store) return
      const tokens = Math.max(0, parseInt(form.remaining_tokens, 10) || 0)
      if (modal === "create") {
        const u: AdminUser = {
          id: newId(),
          account_number: form.account_number.trim() || `CZ-${String(store.users.length + 1).padStart(5, "0")}`,
          full_name: form.full_name.trim(),
          username: form.username.trim(),
          email: form.email.trim(),
          mobile: form.mobile.trim(),
          role: "student",
          remaining_tokens: tokens,
          token_expiry: form.token_expiry,
          created_at: new Date().toISOString(),
        }
        patch((s) =>
          appendAudit(
            { ...s, users: [...s.users, u] },
            { action: "create_user", target_type: "user", target_id: u.id, details: u.full_name }
          )
        )
      } else if (modal === "edit" && editing) {
        patch((s) =>
          appendAudit(
            {
              ...s,
              users: s.users.map((x) =>
                x.id === editing.id
                  ? {
                      ...x,
                      account_number: form.account_number.trim(),
                      full_name: form.full_name.trim(),
                      username: form.username.trim(),
                      email: form.email.trim(),
                      mobile: form.mobile.trim(),
                      remaining_tokens: tokens,
                      token_expiry: form.token_expiry,
                    }
                  : x
              ),
            },
            { action: "update_user", target_type: "user", target_id: editing.id, details: form.full_name.trim() }
          )
        )
      }
      setModal(null)
      return
    }
    if (modal === "edit" && editing) {
      try {
        await apiPatch(`/users/${editing.id}`, {
          full_name: form.full_name.trim(),
          mobile: form.mobile.trim(),
          email: form.email.trim(),
          username: form.username.trim(),
        })
        await loadApiUsers()
        setModal(null)
      } catch (e) {
        alert(e instanceof Error ? e.message : "Save failed")
      }
    } else {
      alert(zh ? "請使用學生註冊流程新增用戶" : "Use student registration to add users")
    }
  }

  async function removeUser(id: string) {
    if (!confirm(zh ? "確定刪除此用戶？" : "Delete this user?")) return
    if (demo) {
      patch((s) =>
        appendAudit(
          { ...s, users: s.users.filter((u) => u.id !== id) },
          { action: "delete_user", target_type: "user", target_id: id, details: id }
        )
      )
      return
    }
    try {
      await apiDelete(`/users/${id}`)
      await loadApiUsers()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed")
    }
  }

  function exportCsv() {
    if (!storeUsers) return
    const headers = ["account", "name", "username", "email", "mobile", "tokens", "expiry", "created"]
    const rows = filtered.map((u) =>
      [u.account_number, u.full_name, u.username, u.email, u.mobile, u.remaining_tokens, u.token_expiry, u.created_at].join(",")
    )
    const csv = [headers.join(","), ...rows].join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `classz-users-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  function bulkReminder() {
    if (selected.size === 0) return
    setBulkMsg(zh ? `已發送提醒（示範）至 ${selected.size} 位` : `Reminder sent (demo) to ${selected.size}`)
    setTimeout(() => setBulkMsg(null), 3500)
  }

  if (!ready || !storeUsers) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 rounded-full border-2 border-classz-400 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <AdminPageFrame>
      <AdminPageHeader title={zh ? "用戶管理" : "User management"} Icon={Users} />
      {apiError ? <div className="text-brand-coral text-sm mb-2">{apiError}</div> : null}
      {bulkMsg ? (
        <div className="rounded-lg border border-classz-200 bg-classz-50 px-4 py-2 text-base text-classz-700">{bulkMsg}</div>
      ) : null}

      <AdminCard>
        <AdminToolbar>
          <div className="relative w-full xl:flex-1 xl:min-w-[200px] xl:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-classz-400 pointer-events-none" />
            <AdminInput className="pl-9" placeholder={zh ? "搜尋…" : "Search…"} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <AdminGhostButton type="button" onClick={exportCsv} className="w-full sm:w-auto justify-center">
            <Download className="h-4 w-4" />
            {zh ? "匯出 CSV" : "Export CSV"}
          </AdminGhostButton>
          {selected.size > 0 ? (
            <AdminPrimaryButton type="button" onClick={bulkReminder} className="w-full sm:w-auto justify-center">
              <Send className="h-4 w-4" />
              {zh ? `發送提醒 (${selected.size})` : `Send reminder (${selected.size})`}
            </AdminPrimaryButton>
          ) : null}
          <AdminPrimaryButton type="button" className="w-full sm:w-auto justify-center xl:ml-auto" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            {zh ? "新增用戶" : "Add user"}
          </AdminPrimaryButton>
        </AdminToolbar>

        <AdminTableShell>
          <AdminTable className="min-w-[58rem]">
            <thead className="bg-classz-100">
              <tr>
                <th className="px-2 py-3 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-classz-300"
                    checked={filtered.length > 0 && filtered.every((u) => selected.has(u.id))}
                    onChange={() => {
                      if (filtered.every((u) => selected.has(u.id))) {
                        setSelected(new Set())
                      } else {
                        setSelected(new Set(filtered.map((u) => u.id)))
                      }
                    }}
                  />
                </th>
                <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">{zh ? "帳號" : "Account"}</th>
                <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">{zh ? "姓名" : "Name"}</th>
                <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">Email</th>
                <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">{zh ? "代幣" : "Tokens"}</th>
                <th className="px-3 py-3 text-right text-base font-semibold text-classz-600 uppercase">{t("classzAdmin.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-classz-100">
              {filtered.map((u) => (
                <tr key={u.id} className="bg-white">
                  <td className="px-2 py-2">
                    <input
                      type="checkbox"
                      className="rounded border-classz-300"
                      checked={selected.has(u.id)}
                      onChange={() =>
                        setSelected((prev) => {
                          const n = new Set(prev)
                          if (n.has(u.id)) n.delete(u.id)
                          else n.add(u.id)
                          return n
                        })
                      }
                    />
                  </td>
                  <td className="px-3 py-2 text-classz-700 whitespace-nowrap">{u.account_number}</td>
                  <td className="px-3 py-2 text-classz-700">{u.full_name}</td>
                  <td className="px-3 py-2 text-classz-600 text-base min-w-[14rem]">{u.email}</td>
                  <td className="px-3 py-2 text-classz-700">{u.remaining_tokens}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <button type="button" className="p-1.5 text-classz-500 hover:bg-classz-50 rounded" onClick={() => openEdit(u)} title="Edit">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button type="button" className="p-1.5 text-brand-coral hover:bg-[color-mix(in_srgb,var(--brand-coral)_10%,white)] rounded ml-1" onClick={() => removeUser(u.id)} title="Delete">
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
        title={modal === "create" ? (zh ? "新增用戶" : "Add user") : zh ? "編輯用戶" : "Edit user"}
        onClose={() => setModal(null)}
        footer={
          <>
            <AdminGhostButton onClick={() => setModal(null)}>{zh ? "取消" : "Cancel"}</AdminGhostButton>
            <AdminPrimaryButton onClick={saveUser}>{zh ? "儲存" : "Save"}</AdminPrimaryButton>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <AdminLabel>{zh ? "帳戶編號" : "Account no."}</AdminLabel>
            <AdminInput value={form.account_number} onChange={(e) => setForm((f) => ({ ...f, account_number: e.target.value }))} />
          </div>
          <div>
            <AdminLabel>{zh ? "姓名" : "Full name"}</AdminLabel>
            <AdminInput value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} />
          </div>
          <div>
            <AdminLabel>Username</AdminLabel>
            <AdminInput value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
          </div>
          <div>
            <AdminLabel>Email</AdminLabel>
            <AdminInput value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <AdminLabel>{zh ? "電話" : "Mobile"}</AdminLabel>
            <AdminInput value={form.mobile} onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <AdminLabel>{zh ? "剩餘代幣" : "Tokens"}</AdminLabel>
              <AdminInput value={form.remaining_tokens} onChange={(e) => setForm((f) => ({ ...f, remaining_tokens: e.target.value }))} />
            </div>
            <div>
              <AdminLabel>{zh ? "代幣到期" : "Token expiry"}</AdminLabel>
              <AdminInput type="date" value={form.token_expiry} onChange={(e) => setForm((f) => ({ ...f, token_expiry: e.target.value }))} />
            </div>
          </div>
        </div>
      </AdminModal>
    </AdminPageFrame>
  )
}
