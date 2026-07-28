"use client"

import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, ChevronRight, Edit, Plus, Search, Trash2, Users } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { getClasszSession } from "@/lib/classz-auth"
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/classz-api-client"
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
  AdminTable,
  AdminTableShell,
  AdminToolbar,
} from "@/components/classz-admin-ui"

type CenterOption = { id: number; center_name: string; status: string }

type CenterAccount = {
  id: number
  account_type: "primary" | "sub"
  parent_user_id: number | null
  center_id: number | null
  center_name: string | null
  center_status: string | null
  email: string
  username: string | null
  full_name: string | null
  mobile: string | null
  is_active: boolean
  sub_accounts?: CenterAccount[]
  sub_accounts_count?: number
}

type FormState = {
  account_kind: "primary" | "sub"
  center_id: string
  parent_user_id: string
  email: string
  full_name: string
  mobile: string
  username: string
  password: string
  is_active: boolean
}

const emptyForm = (): FormState => ({
  account_kind: "primary",
  center_id: "",
  parent_user_id: "",
  email: "",
  full_name: "",
  mobile: "",
  username: "",
  password: "",
  is_active: true,
})

export function CenterAccountsManager() {
  const router = useRouter()
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const session = getClasszSession()

  const [rows, setRows] = useState<CenterAccount[]>([])
  const [centers, setCenters] = useState<CenterOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [centerFilter, setCenterFilter] = useState("")
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const [modal, setModal] = useState<"create" | "edit" | null>(null)
  const [editing, setEditing] = useState<CenterAccount | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (session && session.user.role !== "platform_admin") {
      router.replace("/admin")
    }
  }, [router, session])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const qs = new URLSearchParams()
      if (centerFilter) qs.set("center_id", centerFilter)
      if (search.trim()) qs.set("search", search.trim())
      qs.set("include_inactive", "1")
      const path = `/center-accounts${qs.toString() ? `?${qs}` : ""}`
      const [accounts, centerRows] = await Promise.all([
        apiGet<CenterAccount[]>(path, "platform_admin"),
        apiGet<CenterOption[]>("/centers", "platform_admin"),
      ])
      setRows(Array.isArray(accounts) ? accounts : [])
      setCenters(Array.isArray(centerRows) ? centerRows : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed")
    } finally {
      setLoading(false)
    }
  }, [centerFilter, search])

  useEffect(() => {
    if (session?.user.role === "platform_admin") load()
  }, [load, session?.user.role])

  const primaryOptions = useMemo(
    () => rows.filter((r) => r.account_type === "primary" && r.is_active),
    [rows]
  )

  function toggleExpand(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function openCreate(kind: "primary" | "sub", parent?: CenterAccount) {
    setEditing(null)
    setForm({
      ...emptyForm(),
      account_kind: kind,
      center_id: parent?.center_id ? String(parent.center_id) : centerFilter || "",
      parent_user_id: parent ? String(parent.id) : "",
    })
    setModal("create")
  }

  function openEdit(account: CenterAccount) {
    setEditing(account)
    setForm({
      account_kind: account.account_type,
      center_id: account.center_id ? String(account.center_id) : "",
      parent_user_id: account.parent_user_id ? String(account.parent_user_id) : "",
      email: account.email,
      full_name: account.full_name || "",
      mobile: account.mobile || "",
      username: account.username || "",
      password: "",
      is_active: account.is_active,
    })
    setModal("edit")
  }

  async function save() {
    setSaving(true)
    try {
      const newPassword = form.password.trim()
      if (modal === "edit" && newPassword.length > 0 && newPassword.length < 6) {
        alert(zh ? "新密碼至少 6 個字元" : "New password must be at least 6 characters")
        return
      }
      if (modal === "create") {
        const body: Record<string, unknown> = {
          email: form.email.trim().toLowerCase(),
          full_name: form.full_name.trim(),
          mobile: form.mobile.trim() || null,
          username: form.username.trim() || undefined,
          password: form.password,
        }
        if (form.account_kind === "sub") {
          body.parent_user_id = Number(form.parent_user_id)
        } else {
          body.center_id = Number(form.center_id)
        }
        await apiPost("/center-accounts", body, "platform_admin")
      } else if (editing) {
        const body: Record<string, unknown> = {
          email: form.email.trim().toLowerCase(),
          full_name: form.full_name.trim(),
          mobile: form.mobile.trim() || null,
          username: form.username.trim() || null,
          is_active: form.is_active,
        }
        if (newPassword) body.password = newPassword
        await apiPatch(`/center-accounts/${editing.id}`, body, "platform_admin")
      }
      setModal(null)
      await load()
      if (modal === "edit" && newPassword) {
        alert(
          zh
            ? `密碼已更新。請用電郵「${form.email.trim().toLowerCase()}」及新密碼登入。`
            : `Password updated. Sign in with email "${form.email.trim().toLowerCase()}" and the new password.`
        )
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  async function removeAccount(account: CenterAccount) {
    const msg =
      account.account_type === "primary"
        ? zh
          ? "停用主帳戶會一併停用所有副帳戶，確定？"
          : "Deactivating the primary account will also deactivate all sub accounts. Continue?"
        : zh
          ? "確定停用此副帳戶？"
          : "Deactivate this sub account?"
    if (!confirm(msg)) return
    try {
      await apiDelete(`/center-accounts/${account.id}`, "platform_admin")
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed")
    }
  }

  function accountCells(account: CenterAccount, isSub = false) {
    return (
      <>
        <td className={`px-3 py-2 ${isSub ? "pl-8" : ""}`}>{account.id}</td>
        <td className="px-3 py-2">
          <span
            className={`text-xs px-2 py-0.5 rounded-full border ${
              account.account_type === "primary"
                ? "bg-classz-100 border-classz-300 text-classz-700"
                : "bg-white border-classz-200 text-classz-600"
            }`}
          >
            {account.account_type === "primary" ? (zh ? "主帳戶" : "Primary") : zh ? "副帳戶" : "Sub"}
          </span>
        </td>
        <td className="px-3 py-2 font-medium">{account.center_name || "—"}</td>
        <td className="px-3 py-2">{account.full_name || "—"}</td>
        <td className="px-3 py-2 text-sm">{account.email}</td>
        <td className="px-3 py-2 text-sm">{account.mobile || "—"}</td>
        <td className="px-3 py-2">
          <span
            className={`text-xs px-2 py-0.5 rounded-full border ${
              account.is_active ? "bg-[color-mix(in_srgb,var(--brand-teal)_12%,white)] border-[color-mix(in_srgb,var(--brand-teal)_35%,white)] text-brand-teal" : "bg-[color-mix(in_srgb,var(--brand-coral)_10%,white)] border-[color-mix(in_srgb,var(--brand-coral)_35%,white)] text-brand-coral"
            }`}
          >
            {account.is_active ? (zh ? "啟用" : "Active") : zh ? "停用" : "Inactive"}
          </span>
        </td>
        <td className="px-3 py-2 text-right space-x-1 whitespace-nowrap">
          {account.account_type === "primary" && account.is_active ? (
            <AdminGhostButton type="button" className="inline-flex text-sm py-1 px-2" onClick={() => openCreate("sub", account)}>
              <Plus className="h-4 w-4" />
              {zh ? "副帳戶" : "Sub"}
            </AdminGhostButton>
          ) : null}
          <AdminGhostButton type="button" className="inline-flex text-sm py-1 px-2" onClick={() => openEdit(account)}>
            <Edit className="h-4 w-4" />
          </AdminGhostButton>
          {account.is_active ? (
            <AdminDangerButton type="button" className="inline-flex text-sm py-1 px-2" onClick={() => removeAccount(account)}>
              <Trash2 className="h-4 w-4" />
            </AdminDangerButton>
          ) : null}
        </td>
      </>
    )
  }

  if (session?.user.role !== "platform_admin") {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 rounded-full border-2 border-classz-400 border-t-transparent animate-spin" />
      </div>
    )
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
        title={zh ? "中心帳戶管理" : "Centre account management"}
        description={
          zh
            ? "管理平台各中心的主帳戶與副帳戶（登入 CRM 用）。主帳戶每中心一個；副帳戶掛在主帳戶下。"
            : "Manage primary and sub login accounts for each centre CRM. One primary per centre; sub accounts belong to a primary."
        }
        Icon={Users}
      />

      <AdminToolbar>
        <div className="relative flex-1 min-w-[12rem] w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-classz-400" />
          <AdminInput
            className="pl-9"
            placeholder={zh ? "搜尋電郵、姓名、中心…" : "Search email, name, centre…"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
          />
        </div>
        <AdminSelect className="w-full sm:w-56" value={centerFilter} onChange={(e) => setCenterFilter(e.target.value)}>
          <option value="">{zh ? "全部中心" : "All centres"}</option>
          {centers.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.center_name} ({c.status})
            </option>
          ))}
        </AdminSelect>
        <AdminGhostButton type="button" onClick={() => load()}>
          {zh ? "搜尋" : "Search"}
        </AdminGhostButton>
        <AdminPrimaryButton type="button" onClick={() => openCreate("primary")}>
          <Plus className="h-4 w-4" />
          {zh ? "新增主帳戶" : "Add primary"}
        </AdminPrimaryButton>
      </AdminToolbar>

      {error ? <div className="text-brand-coral text-sm">{error}</div> : null}

      <AdminCard>
        <AdminTableShell>
          <AdminTable>
            <thead className="bg-classz-100">
              <tr>
                <th className="px-3 py-3 text-left w-10" />
                <th className="px-3 py-3 text-left">ID</th>
                <th className="px-3 py-3 text-left">{zh ? "類型" : "Type"}</th>
                <th className="px-3 py-3 text-left">{zh ? "中心" : "Centre"}</th>
                <th className="px-3 py-3 text-left">{zh ? "姓名" : "Name"}</th>
                <th className="px-3 py-3 text-left">{zh ? "電郵" : "Email"}</th>
                <th className="px-3 py-3 text-left">{zh ? "電話" : "Mobile"}</th>
                <th className="px-3 py-3 text-left">{zh ? "狀態" : "Status"}</th>
                <th className="px-3 py-3 text-right">{zh ? "操作" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-classz-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-classz-500">
                    {zh ? "暫無帳戶" : "No accounts"}
                  </td>
                </tr>
              ) : (
                rows.map((primary) => {
                  const subs = primary.sub_accounts || []
                  const open = expanded.has(primary.id)
                  return (
                    <Fragment key={primary.id}>
                      <tr className="bg-white">
                        <td className="px-3 py-2">
                          {subs.length > 0 ? (
                            <button
                              type="button"
                              className="p-1 rounded hover:bg-classz-100"
                              onClick={() => toggleExpand(primary.id)}
                              aria-label={open ? "Collapse" : "Expand"}
                            >
                              {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                          ) : null}
                        </td>
                        {accountCells(primary)}
                      </tr>
                      {open
                        ? subs.map((sub) => (
                            <tr key={sub.id} className="bg-classz-50/60">
                              <td className="px-3 py-2" />
                              {accountCells(sub, true)}
                            </tr>
                          ))
                        : null}
                    </Fragment>
                  )
                })
              )}
            </tbody>
          </AdminTable>
        </AdminTableShell>
      </AdminCard>

      <AdminModal
        open={modal !== null}
        title={
          modal === "create"
            ? form.account_kind === "primary"
              ? zh
                ? "新增主帳戶"
                : "Add primary account"
              : zh
                ? "新增副帳戶"
                : "Add sub account"
            : zh
              ? "編輯帳戶"
              : "Edit account"
        }
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
            {modal === "create" && form.account_kind === "primary" ? (
              <div>
                <AdminLabel>{zh ? "中心" : "Centre"}</AdminLabel>
                <AdminSelect value={form.center_id} onChange={(e) => setForm((f) => ({ ...f, center_id: e.target.value }))}>
                  <option value="">{zh ? "選擇中心" : "Select centre"}</option>
                  {centers.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.center_name}
                    </option>
                  ))}
                </AdminSelect>
              </div>
            ) : null}
            {modal === "create" && form.account_kind === "sub" ? (
              <div>
                <AdminLabel>{zh ? "主帳戶" : "Primary account"}</AdminLabel>
                <AdminSelect
                  value={form.parent_user_id}
                  onChange={(e) => setForm((f) => ({ ...f, parent_user_id: e.target.value }))}
                >
                  <option value="">{zh ? "選擇主帳戶" : "Select primary"}</option>
                  {primaryOptions.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.center_name} — {p.email}
                    </option>
                  ))}
                </AdminSelect>
              </div>
            ) : null}
            <div>
              <AdminLabel>{zh ? "姓名" : "Full name"}</AdminLabel>
              <AdminInput value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} />
            </div>
            <div>
              <AdminLabel>{zh ? "電郵（登入）" : "Email (login)"}</AdminLabel>
              <AdminInput type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <AdminLabel>{zh ? "電話" : "Mobile"}</AdminLabel>
              <AdminInput value={form.mobile} onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))} />
            </div>
            <div>
              <AdminLabel>{zh ? "用戶名（可選）" : "Username (optional)"}</AdminLabel>
              <AdminInput value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
            </div>
            <div>
              <AdminLabel>
                {modal === "create" ? (zh ? "密碼" : "Password") : zh ? "新密碼（留空不改）" : "New password (optional)"}
              </AdminLabel>
              <AdminInput
                type="password"
                autoComplete={modal === "create" ? "new-password" : "new-password"}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </div>
            {modal === "edit" ? (
              <label className="flex items-center gap-2 text-sm text-classz-700">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                />
                {zh ? "帳戶啟用" : "Account active"}
              </label>
            ) : null}
          </div>
      </AdminModal>
    </AdminPageFrame>
  )
}
