"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { Building2, CheckCircle, Edit, ExternalLink, Plus, Search, Trash2, XCircle } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/classz-api-client"
import { centerCrmFlowPath } from "@/lib/center-crm-scope"
import { PLAN_OPTIONS, defaultsForPlan, normalizePlanId } from "@/lib/subscription-plans"
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
  plan_tier?: string | null
  plan_expires_at?: string | null
  max_teachers?: number | null
  max_students?: number | null
  admin_email?: string | null
  admin_name?: string | null
  created_at?: string
}

type FormState = {
  center_name: string
  district: string
  category: string
  status: string
  plan_tier: string
  plan_expires_at: string
  max_teachers: string
  max_students: string
}

const emptyForm = (): FormState => {
  const d = defaultsForPlan("free")
  return {
    center_name: "",
    district: DISTRICTS[0],
    category: "dance",
    status: "pending_approval",
    plan_tier: d.plan_tier,
    plan_expires_at: "",
    max_teachers: d.max_teachers != null ? String(d.max_teachers) : "",
    max_students: d.max_students != null ? String(d.max_students) : "",
  }
}

function formatCap(n: number | null | undefined) {
  if (n == null) return "∞"
  return String(n)
}

type PlanOption = {
  id: string
  labelEn: string
  labelZh: string
  max_teachers: number | null
  max_students: number | null
}

function planLabel(planTier: string | null | undefined, zh: boolean, options: PlanOption[]) {
  const id = normalizePlanId(planTier)
  const plan = options.find((p) => p.id === id)
  return plan ? (zh ? plan.labelZh : plan.labelEn) : id
}

function parseCapInput(raw: string): number | null {
  const t = raw.trim()
  if (!t) return null
  const n = Number(t)
  return Number.isFinite(n) && n >= 0 ? n : null
}

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
  const [planOptions, setPlanOptions] = useState<PlanOption[]>(PLAN_OPTIONS)

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

  const loadPlans = useCallback(async () => {
    try {
      const data = await apiGet<{
        tiers?: Array<{
          slug: string
          labelEn: string
          labelZh: string
          max_teachers: number | null
          max_students: number | null
        }>
      }>("/permissions/plans", "platform_admin")
      if (data?.tiers?.length) {
        setPlanOptions(
          data.tiers.map((t) => ({
            id: t.slug,
            labelEn: t.labelEn,
            labelZh: t.labelZh,
            max_teachers: t.max_teachers,
            max_students: t.max_students,
          })),
        )
      }
    } catch {
      /* keep built-in plans */
    }
  }, [])

  useEffect(() => {
    load()
    loadPlans()
  }, [load, loadPlans])

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
      plan_tier: normalizePlanId(c.plan_tier),
      plan_expires_at: c.plan_expires_at ? String(c.plan_expires_at).slice(0, 10) : "",
      max_teachers: c.max_teachers != null ? String(c.max_teachers) : "",
      max_students: c.max_students != null ? String(c.max_students) : "",
    })
    setModal("edit")
  }

  function onPlanChange(planId: string) {
    const plan = normalizePlanId(planId)
    const option = planOptions.find((p) => p.id === plan)
    const d = option
      ? { max_teachers: option.max_teachers, max_students: option.max_students }
      : defaultsForPlan(plan)
    setForm((f) => ({
      ...f,
      plan_tier: plan,
      plan_expires_at: plan === "free" ? "" : f.plan_expires_at,
      max_teachers: d.max_teachers != null ? String(d.max_teachers) : "",
      max_students: d.max_students != null ? String(d.max_students) : "",
    }))
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
        plan_tier: form.plan_tier,
        plan_expires_at: form.plan_tier === "free" ? null : form.plan_expires_at.trim() || null,
        max_teachers: parseCapInput(form.max_teachers),
        max_students: parseCapInput(form.max_students),
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
        <div className="relative w-full xl:flex-1 xl:min-w-[12rem]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-classz-400" />
          <AdminInput
            className="pl-9"
            placeholder={zh ? "搜尋中心、地區、Admin…" : "Search centre, district, admin…"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
          />
        </div>
        <AdminSelect className="w-full md:w-52 xl:w-44" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">{zh ? "全部狀態" : "All statuses"}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </AdminSelect>
        <AdminGhostButton type="button" onClick={() => load()} className="w-full sm:w-auto justify-center">
          {zh ? "搜尋" : "Search"}
        </AdminGhostButton>
        <AdminPrimaryButton type="button" onClick={openCreate} className="w-full sm:w-auto justify-center">
          <Plus className="h-4 w-4" />
          {zh ? "新增中心" : "Add centre"}
        </AdminPrimaryButton>
      </AdminToolbar>

      {error ? <div className="text-brand-coral text-sm mb-4">{error}</div> : null}

      <AdminCard>
        <AdminTableShell>
          <AdminTable className="min-w-[74rem] [&_th]:whitespace-nowrap [&_td]:whitespace-nowrap">
            <thead className="bg-classz-100">
              <tr>
                <th className="px-3 py-3 text-left">ID</th>
                <th className="px-3 py-3 text-left">{zh ? "中心" : "Centre"}</th>
                <th className="px-3 py-3 text-left">{zh ? "地區" : "District"}</th>
                <th className="px-3 py-3 text-left">{zh ? "類別" : "Category"}</th>
                <th className="px-3 py-3 text-left">{zh ? "方案" : "Plan"}</th>
                <th className="px-3 py-3 text-left">{zh ? "到期日" : "Expires"}</th>
                <th className="px-3 py-3 text-left">{zh ? "導師上限" : "Teachers max"}</th>
                <th className="px-3 py-3 text-left">{zh ? "學員上限" : "Students max"}</th>
                <th className="px-3 py-3 text-left">Admin</th>
                <th className="px-3 py-3 text-left">{zh ? "狀態" : "Status"}</th>
                <th className="px-3 py-3 text-right">{zh ? "操作" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-classz-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-3 py-8 text-center text-classz-500">
                    {zh ? "暫無中心" : "No centres"}
                  </td>
                </tr>
              ) : (
                rows.map((c) => (
                  <tr key={c.id} className="bg-white">
                    <td className="px-3 py-2">{c.id}</td>
                    <td className="px-3 py-2 font-medium min-w-[12rem]">{c.center_name}</td>
                    <td className="px-3 py-2 text-sm min-w-[9rem]">{c.district}</td>
                    <td className="px-3 py-2 text-sm">{c.category}</td>
                    <td className="px-3 py-2 text-sm">{planLabel(c.plan_tier, zh, planOptions)}</td>
                    <td className="px-3 py-2 text-sm whitespace-nowrap">{c.plan_expires_at || "—"}</td>
                    <td className="px-3 py-2 text-sm">{formatCap(c.max_teachers)}</td>
                    <td className="px-3 py-2 text-sm">{formatCap(c.max_students)}</td>
                    <td className="px-3 py-2 text-sm min-w-[12rem]">{c.admin_email || c.admin_name || "—"}</td>
                    <td className="px-3 py-2">
                      <AdminStatusChip tone={statusTone(c.status)}>{c.status}</AdminStatusChip>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-nowrap items-center justify-end gap-1">
                      <Link href={centerCrmFlowPath(c.id, "programs")} className="shrink-0">
                        <AdminGhostButton type="button" size="sm" title={zh ? "管理 CRM" : "Open CRM"}>
                          <ExternalLink className="h-3.5 w-3.5" />
                          CRM
                        </AdminGhostButton>
                      </Link>
                      <AdminGhostButton type="button" size="sm" onClick={() => openEdit(c)}>
                        <Edit className="h-3.5 w-3.5" />
                      </AdminGhostButton>
                      {c.status === "pending_approval" ? (
                        <AdminPrimaryButton type="button" size="sm" onClick={() => approve(c.id)}>
                          <CheckCircle className="h-3.5 w-3.5" />
                          {zh ? "批准" : "Approve"}
                        </AdminPrimaryButton>
                      ) : null}
                      {c.status !== "suspended" ? (
                        <AdminGhostButton type="button" size="sm" onClick={() => setStatus(c.id, "suspended")}>
                          <XCircle className="h-3.5 w-3.5" />
                          {zh ? "停用" : "Suspend"}
                        </AdminGhostButton>
                      ) : (
                        <AdminGhostButton type="button" size="sm" onClick={() => setStatus(c.id, "active")}>
                          {zh ? "啟用" : "Activate"}
                        </AdminGhostButton>
                      )}
                      <AdminDangerButton type="button" size="sm" onClick={() => removeCenter(c)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </AdminDangerButton>
                      </div>
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
        size="lg"
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
          <div>
            <AdminLabel>{zh ? "訂閱方案" : "Subscription plan"}</AdminLabel>
            <AdminSelect value={form.plan_tier} onChange={(e) => onPlanChange(e.target.value)}>
              {planOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {zh ? p.labelZh : p.labelEn}
                </option>
              ))}
            </AdminSelect>
          </div>
          <div>
            <AdminLabel>{zh ? "方案到期日" : "Plan expiry"}</AdminLabel>
            <AdminInput
              type="date"
              disabled={form.plan_tier === "free"}
              value={form.plan_expires_at}
              onChange={(e) => setForm((f) => ({ ...f, plan_expires_at: e.target.value }))}
            />
            <p className="mt-1 text-xs text-classz-500">
              {zh ? "基礎方案無到期日。付費方案留空＝不限期。" : "Basic has no expiry. Leave blank on a paid plan for no end date."}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <AdminLabel>{zh ? "導師人數上限" : "Max teachers"}</AdminLabel>
              <AdminInput
                inputMode="numeric"
                placeholder={zh ? "留空 = 無上限" : "Empty = unlimited"}
                value={form.max_teachers}
                onChange={(e) => setForm((f) => ({ ...f, max_teachers: e.target.value }))}
              />
            </div>
            <div>
              <AdminLabel>{zh ? "學員人數上限" : "Max students"}</AdminLabel>
              <AdminInput
                inputMode="numeric"
                placeholder={zh ? "留空 = 無上限" : "Empty = unlimited"}
                value={form.max_students}
                onChange={(e) => setForm((f) => ({ ...f, max_students: e.target.value }))}
              />
            </div>
          </div>
          {form.plan_tier === "enterprise" ? (
            <p className="text-xs text-classz-600 leading-relaxed">
              {zh
                ? "企業／擴充方案：更大規模請聯絡 ClassZ。平台管理員仍可在此設定自訂上限。"
                : "Enterprise / Scale: contact ClassZ for larger scale. Platform admins can still set custom caps here."}
            </p>
          ) : null}
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
