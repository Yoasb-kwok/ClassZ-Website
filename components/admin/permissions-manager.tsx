"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Shield, Trash2 } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { getClasszSession } from "@/lib/classz-auth"
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/classz-api-client"
import {
  AdminCard,
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
  AdminTextarea,
  AdminToolbar,
} from "@/components/classz-admin-ui"

type ModuleRow = {
  key: string
  group: string
  category: string
  labelEn: string
  labelZh: string
  audiences: string[]
  path?: string | null
}

type CategoryMeta = { key: string; labelEn: string; labelZh: string }
type PortalId = "center_admin" | "coach" | "student"
type Tab = "roles" | "plans" | "accounts"

type RoleDef = {
  slug: string
  labelEn: string
  labelZh: string
  portal: PortalId
  is_system: boolean
}

type Tier = {
  slug: string
  labelEn: string
  labelZh: string
  max_teachers: number | null
  max_students: number | null
  price_hkd?: number
  billing_period_days?: number
  yearly_discount_pct?: number
  introEn?: string
  introZh?: string
  priceCaptionEn?: string
  priceCaptionZh?: string
  featuresEn?: string[]
  featuresZh?: string[]
  is_system: boolean
}

type AccessUser = {
  id: number
  email: string
  name?: string | null
  role: string
  is_admin?: boolean
  center_id?: number | null
  center_name?: string | null
  plan_tier?: string
}

type CenterOption = { id: number; center_name: string }

type ConfirmState = {
  title: string
  body: string
  confirmLabel: string
  run: () => Promise<void>
}

const PORTAL_META: Record<PortalId, { zh: string; en: string }> = {
  center_admin: { zh: "中心", en: "Centre" },
  coach: { zh: "老師", en: "Teacher" },
  student: { zh: "學生／家長", en: "Student / parent" },
}

function Switch({
  on,
  onClick,
  disabled,
}: {
  on: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onClick}
      className={`relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors disabled:opacity-40 ${
        on ? "bg-brand-teal" : "bg-[#D4D4D4]"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-[18px]" : "translate-x-0.5"
        }`}
      />
    </button>
  )
}

function categoryLabel(cat: string, categories: CategoryMeta[], zh: boolean) {
  const found = categories.find((c) => c.key === cat)
  if (!found) return cat
  return zh ? found.labelZh : found.labelEn
}

function groupModules(list: ModuleRow[], categories: CategoryMeta[]) {
  const order = categories.length ? categories.map((c) => c.key) : [...new Set(list.map((m) => m.category))]
  const map = new Map<string, ModuleRow[]>()
  for (const m of list) {
    if (m.group === "platform") continue
    const items = map.get(m.category) || []
    items.push(m)
    map.set(m.category, items)
  }
  return order.filter((k) => map.has(k)).map((k) => ({ category: k, items: map.get(k)! }))
}

export function PermissionsManager() {
  const router = useRouter()
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const session = getClasszSession()

  const [tab, setTab] = useState<Tab>("roles")
  const [roleModules, setRoleModules] = useState<ModuleRow[]>([])
  const [planModules, setPlanModules] = useState<ModuleRow[]>([])
  const [roleCategories, setRoleCategories] = useState<CategoryMeta[]>([])
  const [planCategories, setPlanCategories] = useState<CategoryMeta[]>([])
  const [roleDefs, setRoleDefs] = useState<RoleDef[]>([])
  const [selectedRoleSlug, setSelectedRoleSlug] = useState("center_admin")
  const [tiers, setTiers] = useState<Tier[]>([])
  const [selectedSlug, setSelectedSlug] = useState("free")
  const [roleMatrix, setRoleMatrix] = useState<Record<string, Record<string, boolean>>>({})
  const [planMatrix, setPlanMatrix] = useState<Record<string, Record<string, boolean>>>({})
  const [users, setUsers] = useState<AccessUser[]>([])
  const [centers, setCenters] = useState<CenterOption[]>([])
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [editing, setEditing] = useState<AccessUser | null>(null)
  const [editRole, setEditRole] = useState("student")
  const [editCenter, setEditCenter] = useState("")
  const [savingUser, setSavingUser] = useState(false)
  const [tierPrice, setTierPrice] = useState("0")
  const [tierPeriod, setTierPeriod] = useState("365")
  const [tierDiscount, setTierDiscount] = useState("20")
  const [tierIntroZh, setTierIntroZh] = useState("")
  const [tierIntroEn, setTierIntroEn] = useState("")
  const [tierCaptionZh, setTierCaptionZh] = useState("")
  const [tierCaptionEn, setTierCaptionEn] = useState("")
  const [tierFeaturesZh, setTierFeaturesZh] = useState("")
  const [tierFeaturesEn, setTierFeaturesEn] = useState("")
  const [savingTierDisplay, setSavingTierDisplay] = useState(false)
  const [createTierOpen, setCreateTierOpen] = useState(false)
  const [createRoleOpen, setCreateRoleOpen] = useState(false)
  const [newLabelZh, setNewLabelZh] = useState("")
  const [newLabelEn, setNewLabelEn] = useState("")
  const [newCopyFrom, setNewCopyFrom] = useState("")
  const [newPortal, setNewPortal] = useState<PortalId>("center_admin")
  const [creating, setCreating] = useState(false)
  const [confirm, setConfirm] = useState<ConfirmState | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [savedNote, setSavedNote] = useState<string | null>(null)

  useEffect(() => {
    if (session && session.user.role !== "platform_admin") {
      router.replace("/admin")
    }
  }, [router, session])

  const applyRolePayload = useCallback(
    (roleData: {
      modules?: ModuleRow[]
      categories?: CategoryMeta[]
      role_defs?: RoleDef[]
      matrix?: Record<string, Record<string, boolean>>
      slug?: string
    }) => {
      if (roleData.modules) setRoleModules(roleData.modules)
      if (roleData.categories) setRoleCategories(roleData.categories)
      if (roleData.role_defs) {
        setRoleDefs(roleData.role_defs)
        setSelectedRoleSlug((cur) => {
          if (roleData.slug) return roleData.slug
          return roleData.role_defs!.some((r) => r.slug === cur) ? cur : roleData.role_defs![0]?.slug || "center_admin"
        })
      }
      if (roleData.matrix) setRoleMatrix(roleData.matrix)
    },
    [],
  )

  const applyPlanPayload = useCallback(
    (planData: {
      modules?: ModuleRow[]
      categories?: CategoryMeta[]
      tiers?: Tier[]
      matrix?: Record<string, Record<string, boolean>>
    }) => {
      if (planData.modules) setPlanModules(planData.modules)
      if (planData.categories) setPlanCategories(planData.categories)
      if (planData.tiers) {
        setTiers(planData.tiers)
        setSelectedSlug((cur) =>
          planData.tiers!.some((t) => t.slug === cur) ? cur : planData.tiers![0]?.slug || "free",
        )
      }
      if (planData.matrix) setPlanMatrix(planData.matrix)
    },
    [],
  )

  const loadMatrices = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [roleData, planData] = await Promise.all([
        apiGet<{
          modules: ModuleRow[]
          categories: CategoryMeta[]
          role_defs: RoleDef[]
          matrix: Record<string, Record<string, boolean>>
        }>("/permissions/roles", "platform_admin"),
        apiGet<{
          modules: ModuleRow[]
          categories: CategoryMeta[]
          tiers: Tier[]
          matrix: Record<string, Record<string, boolean>>
        }>("/permissions/plans", "platform_admin"),
      ])
      applyRolePayload(roleData)
      applyPlanPayload(planData)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed")
    } finally {
      setLoading(false)
    }
  }, [applyPlanPayload, applyRolePayload])

  const loadUsers = useCallback(async () => {
    try {
      const qs = new URLSearchParams()
      if (search.trim()) qs.set("search", search.trim())
      if (roleFilter) qs.set("role", roleFilter)
      const path = `/permissions/users${qs.toString() ? `?${qs}` : ""}`
      const [rows, centerRows] = await Promise.all([
        apiGet<AccessUser[]>(path, "platform_admin"),
        apiGet<CenterOption[]>("/centers", "platform_admin"),
      ])
      setUsers(Array.isArray(rows) ? rows : [])
      setCenters(Array.isArray(centerRows) ? centerRows : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed")
    }
  }, [search, roleFilter])

  useEffect(() => {
    if (session?.user.role === "platform_admin") loadMatrices()
  }, [loadMatrices, session?.user.role])

  useEffect(() => {
    if (session?.user.role === "platform_admin" && tab === "accounts") loadUsers()
  }, [loadUsers, session?.user.role, tab])

  const selectedRole = roleDefs.find((r) => r.slug === selectedRoleSlug) || roleDefs[0]
  const selectedRoleLabel = selectedRole ? (zh ? selectedRole.labelZh : selectedRole.labelEn) : selectedRoleSlug
  const selectedPortal = selectedRole?.portal || "center_admin"

  useEffect(() => {
    if (!editing) return
    setEditOverrides((prev) => {
      const def = roleDefs.find((r) => r.slug === editRole)
      const portal = def?.portal || (editRole as PortalId)
      const next: Record<string, boolean | "inherit"> = {}
      roleModules
        .filter((m) => m.audiences.includes(portal))
        .forEach((m) => {
          next[m.key] = prev[m.key] ?? "inherit"
        })
      return next
    })
  }, [editRole, editing, roleModules, roleDefs])

  const roleGrouped = useMemo(
    () => groupModules(roleModules.filter((m) => m.audiences.includes(selectedPortal)), roleCategories),
    [roleModules, roleCategories, selectedPortal],
  )
  const planGrouped = useMemo(
    () => groupModules(planModules.filter((m) => m.group === "center"), planCategories),
    [planModules, planCategories],
  )

  const selectedTier = tiers.find((t) => t.slug === selectedSlug) || tiers[0]
  const selectedLabel = selectedTier ? (zh ? selectedTier.labelZh : selectedTier.labelEn) : selectedSlug

  useEffect(() => {
    if (!selectedTier) return
    setTierPrice(String(selectedTier.price_hkd ?? 0))
    setTierPeriod(String(selectedTier.billing_period_days ?? 365))
    setTierDiscount(String(selectedTier.yearly_discount_pct ?? (selectedTier.slug === "free" ? 0 : 20)))
    setTierIntroZh(selectedTier.introZh || "")
    setTierIntroEn(selectedTier.introEn || "")
    setTierCaptionZh(selectedTier.priceCaptionZh || "")
    setTierCaptionEn(selectedTier.priceCaptionEn || "")
    setTierFeaturesZh((selectedTier.featuresZh || []).join("\n"))
    setTierFeaturesEn((selectedTier.featuresEn || []).join("\n"))
  }, [selectedTier])

  async function saveRoleToggle(key: string, next: boolean) {
    if (!selectedRole) return
    setBusyKey(`role:${selectedRole.slug}:${key}`)
    try {
      const data = await apiPatch<{ matrix: Record<string, Record<string, boolean>> }>(
        "/permissions/roles",
        { role: selectedRole.slug, module_key: key, enabled: next },
        "platform_admin",
      )
      if (data?.matrix) setRoleMatrix(data.matrix)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed")
    } finally {
      setBusyKey(null)
    }
  }

  function onRoleSwitch(key: string, currentlyOn: boolean, label: string) {
    if (currentlyOn) {
      void saveRoleToggle(key, false)
      return
    }
    setConfirm({
      title: zh ? "開啟此功能？" : "Enable this function?",
      body: zh
        ? `確認後，「${selectedRoleLabel}」可以使用「${label}」。`
        : `“${selectedRoleLabel}” will be able to use “${label}”.`,
      confirmLabel: zh ? "確認開啟" : "Confirm enable",
      run: () => saveRoleToggle(key, true),
    })
  }

  async function togglePlan(key: string, next: boolean) {
    if (!selectedTier) return
    setBusyKey(`plan:${selectedTier.slug}:${key}`)
    try {
      const data = await apiPatch<{ matrix: Record<string, Record<string, boolean>>; tiers?: Tier[] }>(
        "/permissions/plans",
        { plan_tier: selectedTier.slug, module_key: key, enabled: next },
        "platform_admin",
      )
      if (data?.matrix) setPlanMatrix(data.matrix)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed")
    } finally {
      setBusyKey(null)
    }
  }

  function askToggleCategoryForRole(category: string, items: ModuleRow[], enable: boolean) {
    if (!selectedRole) return
    const names = items.map((m) => (zh ? m.labelZh : m.labelEn)).join("、")
    const cat = categoryLabel(category, roleCategories, zh)
    setConfirm({
      title: enable
        ? zh
          ? "一次開啟整組功能？"
          : "Enable this whole category?"
        : zh
          ? "一次關閉整組功能？"
          : "Disable this whole category?",
      body: enable
        ? zh
          ? `確認後，「${selectedRoleLabel}」會開啟「${cat}」全部 ${items.length} 項：${names}。`
          : `This will turn on all ${items.length} modules in “${cat}” for “${selectedRoleLabel}”: ${names}.`
        : zh
          ? `確認後，「${selectedRoleLabel}」會關閉「${cat}」全部 ${items.length} 項：${names}。`
          : `This will turn off all ${items.length} modules in “${cat}” for “${selectedRoleLabel}”: ${names}.`,
      confirmLabel: enable ? (zh ? "確認全開" : "Confirm enable all") : zh ? "確認全關" : "Confirm disable all",
      run: async () => {
        const data = await apiPatch<{ matrix: Record<string, Record<string, boolean>> }>(
          "/permissions/roles",
          { role: selectedRole.slug, module_keys: items.map((m) => m.key), enabled: enable },
          "platform_admin",
        )
        if (data?.matrix) setRoleMatrix(data.matrix)
      },
    })
  }

  function askToggleCategoryForPlan(category: string, items: ModuleRow[], enable: boolean) {
    if (!selectedTier) return
    const names = items.map((m) => (zh ? m.labelZh : m.labelEn)).join("、")
    const cat = categoryLabel(category, planCategories, zh)
    setConfirm({
      title: enable
        ? zh
          ? "一次開啟整組功能？"
          : "Enable this whole category?"
        : zh
          ? "一次關閉整組功能？"
          : "Disable this whole category?",
      body: enable
        ? zh
          ? `確認後，「${selectedLabel}」會開啟「${cat}」全部 ${items.length} 項：${names}。`
          : `This will turn on all ${items.length} modules in “${cat}” for “${selectedLabel}”: ${names}.`
        : zh
          ? `確認後，「${selectedLabel}」會關閉「${cat}」全部 ${items.length} 項：${names}。`
          : `This will turn off all ${items.length} modules in “${cat}” for “${selectedLabel}”: ${names}.`,
      confirmLabel: enable ? (zh ? "確認全開" : "Confirm enable all") : zh ? "確認全關" : "Confirm disable all",
      run: async () => {
        const data = await apiPatch<{ matrix: Record<string, Record<string, boolean>> }>(
          "/permissions/plans",
          { plan_tier: selectedTier.slug, module_keys: items.map((m) => m.key), enabled: enable },
          "platform_admin",
        )
        if (data?.matrix) setPlanMatrix(data.matrix)
      },
    })
  }

  async function createRole() {
    setCreating(true)
    try {
      const data = await apiPost<{
        slug: string
        matrix: Record<string, Record<string, boolean>>
        role_defs: RoleDef[]
        modules?: ModuleRow[]
        categories?: CategoryMeta[]
      }>(
        "/permissions/role-defs",
        {
          label_zh: newLabelZh.trim() || newLabelEn.trim(),
          label_en: newLabelEn.trim() || newLabelZh.trim(),
          portal: newPortal,
          copy_from: newCopyFrom || null,
        },
        "platform_admin",
      )
      applyRolePayload(data || {})
      setCreateRoleOpen(false)
      setNewLabelZh("")
      setNewLabelEn("")
      setNewCopyFrom("")
      setNewPortal("center_admin")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed")
    } finally {
      setCreating(false)
    }
  }

  async function createTier() {
    setCreating(true)
    try {
      const data = await apiPost<{ slug: string; matrix: Record<string, Record<string, boolean>>; tiers: Tier[] }>(
        "/permissions/tiers",
        {
          label_zh: newLabelZh.trim() || newLabelEn.trim(),
          label_en: newLabelEn.trim() || newLabelZh.trim(),
          copy_from: newCopyFrom || null,
        },
        "platform_admin",
      )
      if (data?.tiers) setTiers(data.tiers)
      if (data?.matrix) setPlanMatrix(data.matrix)
      if (data?.slug) setSelectedSlug(data.slug)
      setCreateTierOpen(false)
      setNewLabelZh("")
      setNewLabelEn("")
      setNewCopyFrom("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed")
    } finally {
      setCreating(false)
    }
  }

  function askDeleteRole(role: RoleDef) {
    if (role.is_system) return
    setConfirm({
      title: zh ? "刪除此角色？" : "Delete this role?",
      body: zh
        ? `「${role.labelZh}」會被刪除。已指派給帳戶的角色不能刪。`
        : `“${role.labelEn}” will be removed. Roles already assigned to an account cannot be deleted.`,
      confirmLabel: zh ? "確認刪除" : "Confirm delete",
      run: async () => {
        const data = await apiDelete<{
          matrix: Record<string, Record<string, boolean>>
          role_defs: RoleDef[]
          modules?: ModuleRow[]
          categories?: CategoryMeta[]
        }>(`/permissions/role-defs/${role.slug}`, "platform_admin")
        applyRolePayload(data || {})
      },
    })
  }

  function askDeleteTier(tier: Tier) {
    if (tier.is_system) return
    setConfirm({
      title: zh ? "刪除此方案？" : "Delete this tier?",
      body: zh
        ? `「${tier.labelZh}」會被刪除。已指派給中心的方案不能刪。`
        : `“${tier.labelEn}” will be removed. Tiers already assigned to a centre cannot be deleted.`,
      confirmLabel: zh ? "確認刪除" : "Confirm delete",
      run: async () => {
        const data = await apiDelete<{ matrix: Record<string, Record<string, boolean>>; tiers: Tier[] }>(
          `/permissions/tiers/${tier.slug}`,
          "platform_admin",
        )
        applyPlanPayload(data || {})
      },
    })
  }

  async function openUser(row: AccessUser) {
    if (row.role === "platform_admin" || row.is_admin) return
    try {
      const detail = await apiGet<{
        role: string
        center_id: number | null
        home_center_id: number | null
      }>(`/permissions/users/${row.id}`, "platform_admin")
      setEditing(row)
      setEditRole(detail.role || "student")
      setEditCenter(String(detail.center_id || detail.home_center_id || row.center_id || ""))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed")
    }
  }

  async function saveUser() {
    if (!editing) return
    setSavingUser(true)
    try {
      await apiPatch(
        `/permissions/users/${editing.id}`,
        { role: editRole, center_id: editCenter ? Number(editCenter) : null },
        "platform_admin",
      )
      setEditing(null)
      setSavedNote(zh ? "已儲存。該帳戶需重新登入才會套用新角色。" : "Saved. That account must log in again for the new role to apply.")
      await loadUsers()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed")
    } finally {
      setSavingUser(false)
    }
  }

  const tabs: Array<{ id: Tab; zh: string; en: string }> = [
    { id: "roles", zh: "角色", en: "Roles" },
    { id: "plans", zh: "中心方案", en: "Centre tiers" },
    { id: "accounts", zh: "帳戶", en: "Accounts" },
  ]

  const copyFromRoles = roleDefs.filter((r) => r.portal === newPortal)

  return (
    <AdminPageFrame>
      <AdminPageHeader
        title={zh ? "權限管理" : "Permissions"}
        description={
          zh
            ? "自建角色並選擇可用功能（開啟需確認）。方案清單暫時只管理中心端功能。"
            : "Create roles and choose which functions they can use (enabling requires confirmation). Tiers currently cover centre-side functions only."
        }
        Icon={Shield}
      />

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? "border-brand-teal bg-[color-mix(in_srgb,var(--brand-teal)_14%,white)] text-brand-teal"
                : "border-classz-200 bg-white text-brand-slate"
            }`}
          >
            {zh ? t.zh : t.en}
          </button>
        ))}
      </div>

      {error ? <p className="text-sm text-brand-coral">{error}</p> : null}
      {savedNote ? <p className="text-sm text-brand-teal">{savedNote}</p> : null}
      {loading ? <p className="text-sm text-classz-600">{zh ? "載入中…" : "Loading…"}</p> : null}

      {tab === "roles" && !loading ? (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <AdminCard className="h-fit">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-classz-700">{zh ? "角色" : "Roles"}</p>
              <AdminGhostButton className="!px-2.5 !py-1.5 text-xs" onClick={() => setCreateRoleOpen(true)}>
                <Plus className="h-3.5 w-3.5" />
                {zh ? "新增" : "New"}
              </AdminGhostButton>
            </div>
            <div className="space-y-1">
              {roleDefs.map((r) => {
                const active = r.slug === selectedRoleSlug
                return (
                  <div key={r.slug} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedRoleSlug(r.slug)}
                      className={`min-w-0 flex-1 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                        active
                          ? "bg-[color-mix(in_srgb,var(--brand-teal)_14%,white)] font-semibold text-brand-teal"
                          : "text-classz-700 hover:bg-classz-50"
                      }`}
                    >
                      <span className="block truncate">{zh ? r.labelZh : r.labelEn}</span>
                      <span className="block text-[10px] font-normal text-classz-500">
                        {zh ? PORTAL_META[r.portal].zh : PORTAL_META[r.portal].en}
                      </span>
                    </button>
                    {!r.is_system ? (
                      <button
                        type="button"
                        className="rounded-lg p-1.5 text-classz-500 hover:bg-classz-50 hover:text-brand-coral"
                        onClick={() => askDeleteRole(r)}
                        aria-label={zh ? "刪除角色" : "Delete role"}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </AdminCard>

          <AdminCard>
            <p className="mb-1 text-sm font-semibold text-classz-700">{selectedRoleLabel}</p>
            <p className="mb-4 text-sm text-classz-600">
              {zh
                ? "每個功能都有開關。開啟時會跳出確認。分類標題旁的開關可一次全開或全關。"
                : "Every function has a toggle. Turning one on asks for confirmation. The category switch turns the whole group on or off."}
            </p>
            <div className="space-y-4">
              {roleGrouped.map((g) => {
                const allOn = g.items.every((m) => Boolean(roleMatrix[selectedRoleSlug]?.[m.key]))
                return (
                  <div key={g.category} className="rounded-xl border border-classz-100">
                    <div className="flex items-center justify-between gap-2 rounded-t-xl bg-classz-50 px-3 py-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-teal">
                        {categoryLabel(g.category, roleCategories, zh)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-classz-500">{zh ? "全部" : "All"}</span>
                        <Switch on={allOn} onClick={() => askToggleCategoryForRole(g.category, g.items, !allOn)} />
                      </div>
                    </div>
                    <div className="divide-y divide-classz-50">
                      {g.items.map((m) => {
                        const on = Boolean(roleMatrix[selectedRoleSlug]?.[m.key])
                        return (
                          <div key={m.key} className="flex items-center justify-between gap-3 px-3 py-2.5">
                            <span className="text-sm text-classz-700">{zh ? m.labelZh : m.labelEn}</span>
                            <Switch
                              on={on}
                              disabled={busyKey === `role:${selectedRoleSlug}:${m.key}`}
                              onClick={() => onRoleSwitch(m.key, on, zh ? m.labelZh : m.labelEn)}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </AdminCard>
        </div>
      ) : null}

      {tab === "plans" && !loading ? (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[16rem_minmax(0,1fr)]">
          <AdminCard className="h-fit">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-classz-700">{zh ? "中心方案" : "Centre tiers"}</p>
              <AdminGhostButton className="!px-2.5 !py-1.5 text-xs" onClick={() => setCreateTierOpen(true)}>
                <Plus className="h-3.5 w-3.5" />
                {zh ? "新增" : "New"}
              </AdminGhostButton>
            </div>
            <div className="space-y-1">
              {tiers.map((t) => {
                const active = t.slug === selectedSlug
                return (
                  <div key={t.slug} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedSlug(t.slug)}
                      className={`min-w-0 flex-1 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                        active
                          ? "bg-[color-mix(in_srgb,var(--brand-teal)_14%,white)] font-semibold text-brand-teal"
                          : "text-classz-700 hover:bg-classz-50"
                      }`}
                    >
                      <span className="block truncate">{zh ? t.labelZh : t.labelEn}</span>
                      <span className="block text-[10px] font-normal uppercase tracking-wide text-classz-500">
                        {t.slug}
                      </span>
                    </button>
                    {!t.is_system ? (
                      <button
                        type="button"
                        className="rounded-lg p-1.5 text-classz-500 hover:bg-classz-50 hover:text-brand-coral"
                        onClick={() => askDeleteTier(t)}
                        aria-label={zh ? "刪除方案" : "Delete tier"}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </AdminCard>

          <AdminCard>
            <p className="mb-1 text-sm font-semibold text-classz-700">{selectedLabel}</p>
            <p className="mb-4 text-sm text-classz-600">
              {zh
                ? "價錢卡文案（說明、折扣、服務內容）可在上方編輯。分類旁的開關可一次全開或全關（會再確認一次）。"
                : "Edit the pricing-card copy (caption, discount, features) above. The category switch turns the whole group on or off (you will be asked to confirm)."}
            </p>
            {selectedTier ? (
              <div className="mb-6 space-y-4 rounded-xl border border-classz-100 p-3">
                <p className="text-sm font-semibold text-classz-700">{zh ? "價錢卡顯示" : "Pricing card copy"}</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <AdminLabel>{zh ? "年費（HK$）" : "Yearly price (HK$)"}</AdminLabel>
                    <AdminInput value={tierPrice} onChange={(e) => setTierPrice(e.target.value)} inputMode="decimal" />
                  </div>
                  <div>
                    <AdminLabel>{zh ? "有效日數" : "Period (days)"}</AdminLabel>
                    <AdminInput value={tierPeriod} onChange={(e) => setTierPeriod(e.target.value)} inputMode="numeric" />
                  </div>
                  <div>
                    <AdminLabel>{zh ? "年繳折扣（%）" : "Yearly discount (%)"}</AdminLabel>
                    <AdminInput value={tierDiscount} onChange={(e) => setTierDiscount(e.target.value)} inputMode="decimal" />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <AdminLabel>{zh ? "價錢旁說明（中）" : "Price caption (ZH)"}</AdminLabel>
                    <AdminInput
                      value={tierCaptionZh}
                      onChange={(e) => setTierCaptionZh(e.target.value)}
                      placeholder={zh ? "例如：每中心／每月" : "e.g. per centre / per month"}
                    />
                  </div>
                  <div>
                    <AdminLabel>{zh ? "價錢旁說明（英）" : "Price caption (EN)"}</AdminLabel>
                    <AdminInput
                      value={tierCaptionEn}
                      onChange={(e) => setTierCaptionEn(e.target.value)}
                      placeholder="e.g. per centre / per month"
                    />
                  </div>
                  <div>
                    <AdminLabel>{zh ? "功能區標題（中）" : "Feature intro (ZH)"}</AdminLabel>
                    <AdminInput
                      value={tierIntroZh}
                      onChange={(e) => setTierIntroZh(e.target.value)}
                      placeholder={zh ? "例如：包含基礎方案，另外：" : ""}
                    />
                  </div>
                  <div>
                    <AdminLabel>{zh ? "功能區標題（英）" : "Feature intro (EN)"}</AdminLabel>
                    <AdminInput
                      value={tierIntroEn}
                      onChange={(e) => setTierIntroEn(e.target.value)}
                      placeholder="e.g. Everything in the Basic plan plus:"
                    />
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <AdminLabel>{zh ? "服務內容（中，一行一項）" : "Features (ZH, one per line)"}</AdminLabel>
                    <AdminTextarea
                      className="!min-h-[8rem]"
                      value={tierFeaturesZh}
                      onChange={(e) => setTierFeaturesZh(e.target.value)}
                    />
                  </div>
                  <div>
                    <AdminLabel>{zh ? "服務內容（英，一行一項）" : "Features (EN, one per line)"}</AdminLabel>
                    <AdminTextarea
                      className="!min-h-[8rem]"
                      value={tierFeaturesEn}
                      onChange={(e) => setTierFeaturesEn(e.target.value)}
                    />
                  </div>
                </div>
                <AdminPrimaryButton
                  disabled={savingTierDisplay}
                  onClick={async () => {
                    if (!selectedTier) return
                    setSavingTierDisplay(true)
                    try {
                      const data = await apiPatch<{ tiers?: Tier[] }>(
                        `/permissions/tiers/${selectedTier.slug}`,
                        {
                          price_hkd: Number(tierPrice) || 0,
                          billing_period_days: Number(tierPeriod) || 365,
                          yearly_discount_pct: Number(tierDiscount) || 0,
                          intro_zh: tierIntroZh,
                          intro_en: tierIntroEn,
                          price_caption_zh: tierCaptionZh,
                          price_caption_en: tierCaptionEn,
                          features_zh: tierFeaturesZh,
                          features_en: tierFeaturesEn,
                        },
                        "platform_admin",
                      )
                      if (data?.tiers) setTiers(data.tiers)
                      setSavedNote(zh ? "已儲存方案顯示。" : "Plan card copy saved.")
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "Save failed")
                    } finally {
                      setSavingTierDisplay(false)
                    }
                  }}
                >
                  {savingTierDisplay ? (zh ? "儲存中…" : "Saving…") : zh ? "儲存價錢卡" : "Save card copy"}
                </AdminPrimaryButton>
              </div>
            ) : null}
            <div className="space-y-4">
              {planGrouped.map((g) => {
                const allOn = g.items.every((m) => Boolean(planMatrix[selectedSlug]?.[m.key]))
                return (
                  <div key={g.category} className="rounded-xl border border-classz-100">
                    <div className="flex items-center justify-between gap-2 rounded-t-xl bg-classz-50 px-3 py-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-brand-teal">
                        {categoryLabel(g.category, planCategories, zh)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-classz-500">{zh ? "全部" : "All"}</span>
                        <Switch on={allOn} onClick={() => askToggleCategoryForPlan(g.category, g.items, !allOn)} />
                      </div>
                    </div>
                    <div className="divide-y divide-classz-50">
                      {g.items.map((m) => {
                        const on = Boolean(planMatrix[selectedSlug]?.[m.key])
                        return (
                          <div key={m.key} className="flex items-center justify-between gap-3 px-3 py-2.5">
                            <span className="text-sm text-classz-700">{zh ? m.labelZh : m.labelEn}</span>
                            <Switch
                              on={on}
                              disabled={busyKey === `plan:${selectedSlug}:${m.key}`}
                              onClick={() => togglePlan(m.key, !on)}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </AdminCard>
        </div>
      ) : null}

      {tab === "accounts" ? (
        <>
          <AdminToolbar>
            <AdminInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={zh ? "搜尋電郵／姓名" : "Search email / name"}
              className="max-w-xs"
            />
            <AdminSelect value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="max-w-[12rem]">
              <option value="">{zh ? "全部角色" : "All roles"}</option>
              {roleDefs.map((r) => (
                <option key={r.slug} value={r.slug}>
                  {zh ? r.labelZh : r.labelEn}
                </option>
              ))}
              <option value="platform_admin">{zh ? "平台管理員" : "Platform admin"}</option>
            </AdminSelect>
            <AdminGhostButton onClick={() => loadUsers()}>{zh ? "重新整理" : "Refresh"}</AdminGhostButton>
          </AdminToolbar>
          <AdminCard>
            <AdminTableShell>
              <AdminTable>
                <thead>
                  <tr className="border-b border-classz-100 text-left text-xs uppercase tracking-wide text-classz-600">
                    <th className="px-3 py-2">{zh ? "帳戶" : "Account"}</th>
                    <th className="px-3 py-2">{zh ? "角色" : "Role"}</th>
                    <th className="px-3 py-2">{zh ? "中心" : "Centre"}</th>
                    <th className="px-3 py-2">{zh ? "方案" : "Plan"}</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const tier = tiers.find((t) => t.slug === u.plan_tier)
                    const def = roleDefs.find((r) => r.slug === u.role)
                    return (
                      <tr key={u.id} className="border-b border-classz-50">
                        <td className="px-3 py-2">
                          <div className="text-sm font-medium text-classz-700">{u.name || "—"}</div>
                          <div className="text-xs text-classz-600">{u.email}</div>
                        </td>
                        <td className="px-3 py-2 text-sm">
                          {u.role === "platform_admin" || u.is_admin
                            ? zh
                              ? "平台管理員"
                              : "Platform admin"
                            : def
                              ? zh
                                ? def.labelZh
                                : def.labelEn
                              : u.role}
                        </td>
                        <td className="px-3 py-2 text-sm">{u.center_name || "—"}</td>
                        <td className="px-3 py-2 text-sm">
                          {tier ? (zh ? tier.labelZh : tier.labelEn) : u.plan_tier || "—"}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {u.role === "platform_admin" || u.is_admin ? (
                            <span className="text-xs text-classz-500">{zh ? "鎖定" : "Locked"}</span>
                          ) : (
                            <AdminGhostButton onClick={() => openUser(u)}>{zh ? "編輯" : "Edit"}</AdminGhostButton>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </AdminTable>
            </AdminTableShell>
          </AdminCard>
        </>
      ) : null}

      <AdminModal
        open={createRoleOpen}
        title={zh ? "新增角色" : "New role"}
        onClose={() => setCreateRoleOpen(false)}
        footer={
          <>
            <AdminGhostButton onClick={() => setCreateRoleOpen(false)}>{zh ? "取消" : "Cancel"}</AdminGhostButton>
            <AdminPrimaryButton disabled={creating || (!newLabelZh.trim() && !newLabelEn.trim())} onClick={() => createRole()}>
              {zh ? "建立" : "Create"}
            </AdminPrimaryButton>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-classz-600">
            {zh
              ? "新角色預設全部功能關閉。請選擇這個角色登入哪一個 portal（中心／老師／學生）。"
              : "New roles start with every function off. Choose which portal this role logs into (centre / teacher / student)."}
          </p>
          <div>
            <AdminLabel>{zh ? "名稱（中文）" : "Name (Chinese)"}</AdminLabel>
            <AdminInput value={newLabelZh} onChange={(e) => setNewLabelZh(e.target.value)} placeholder={zh ? "例如：前台" : "e.g. Front desk"} />
          </div>
          <div>
            <AdminLabel>{zh ? "名稱（英文）" : "Name (English)"}</AdminLabel>
            <AdminInput value={newLabelEn} onChange={(e) => setNewLabelEn(e.target.value)} placeholder="e.g. Front desk" />
          </div>
          <div>
            <AdminLabel>{zh ? "Portal" : "Portal"}</AdminLabel>
            <AdminSelect
              value={newPortal}
              onChange={(e) => {
                const p = e.target.value as PortalId
                setNewPortal(p)
                setNewCopyFrom("")
              }}
            >
              {(Object.keys(PORTAL_META) as PortalId[]).map((p) => (
                <option key={p} value={p}>
                  {zh ? PORTAL_META[p].zh : PORTAL_META[p].en}
                </option>
              ))}
            </AdminSelect>
          </div>
          <div>
            <AdminLabel>{zh ? "複製功能設定自" : "Copy functions from"}</AdminLabel>
            <AdminSelect value={newCopyFrom} onChange={(e) => setNewCopyFrom(e.target.value)}>
              <option value="">{zh ? "不複製（全部關閉）" : "None (all off)"}</option>
              {copyFromRoles.map((r) => (
                <option key={r.slug} value={r.slug}>
                  {zh ? r.labelZh : r.labelEn}
                </option>
              ))}
            </AdminSelect>
          </div>
        </div>
      </AdminModal>

      <AdminModal
        open={createTierOpen}
        title={zh ? "新增中心方案" : "New centre tier"}
        onClose={() => setCreateTierOpen(false)}
        footer={
          <>
            <AdminGhostButton onClick={() => setCreateTierOpen(false)}>{zh ? "取消" : "Cancel"}</AdminGhostButton>
            <AdminPrimaryButton disabled={creating || (!newLabelZh.trim() && !newLabelEn.trim())} onClick={() => createTier()}>
              {zh ? "建立" : "Create"}
            </AdminPrimaryButton>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-classz-600">
            {zh
              ? "新方案預設全部中心功能關閉。導入中心時再逐項打開。"
              : "New tiers start with every centre function off. Switch features on as you onboard the centre."}
          </p>
          <div>
            <AdminLabel>{zh ? "名稱（中文）" : "Name (Chinese)"}</AdminLabel>
            <AdminInput value={newLabelZh} onChange={(e) => setNewLabelZh(e.target.value)} placeholder={zh ? "例如：導入基礎" : "e.g. Onboarding"} />
          </div>
          <div>
            <AdminLabel>{zh ? "名稱（英文）" : "Name (English)"}</AdminLabel>
            <AdminInput value={newLabelEn} onChange={(e) => setNewLabelEn(e.target.value)} placeholder="e.g. Onboarding" />
          </div>
          <div>
            <AdminLabel>{zh ? "複製功能設定自" : "Copy modules from"}</AdminLabel>
            <AdminSelect value={newCopyFrom} onChange={(e) => setNewCopyFrom(e.target.value)}>
              <option value="">{zh ? "不複製（全部關閉）" : "None (all off)"}</option>
              {tiers.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {zh ? t.labelZh : t.labelEn}
                </option>
              ))}
            </AdminSelect>
          </div>
        </div>
      </AdminModal>

      <AdminModal
        open={Boolean(confirm)}
        title={confirm?.title || ""}
        onClose={() => setConfirm(null)}
        footer={
          <>
            <AdminGhostButton onClick={() => setConfirm(null)}>{zh ? "取消" : "Cancel"}</AdminGhostButton>
            <AdminPrimaryButton
              disabled={confirming}
              onClick={async () => {
                if (!confirm) return
                setConfirming(true)
                try {
                  await confirm.run()
                  setConfirm(null)
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Failed")
                } finally {
                  setConfirming(false)
                }
              }}
            >
              {confirm?.confirmLabel}
            </AdminPrimaryButton>
          </>
        }
      >
        <p className="whitespace-pre-line text-sm leading-relaxed text-classz-700">{confirm?.body}</p>
      </AdminModal>

      <AdminModal
        open={Boolean(editing)}
        title={zh ? "編輯帳戶權限" : "Edit account access"}
        onClose={() => setEditing(null)}
        footer={
          <>
            <AdminGhostButton onClick={() => setEditing(null)}>{zh ? "取消" : "Cancel"}</AdminGhostButton>
            <AdminPrimaryButton disabled={savingUser} onClick={() => saveUser()}>
              {zh ? "儲存" : "Save"}
            </AdminPrimaryButton>
          </>
        }
      >
        {editing ? (
          <div className="space-y-4">
            <p className="text-sm text-classz-600">{editing.email}</p>
            <div>
              <AdminLabel>{zh ? "角色" : "Role"}</AdminLabel>
              <AdminSelect value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                {roleDefs.map((r) => (
                  <option key={r.slug} value={r.slug}>
                    {zh ? r.labelZh : r.labelEn} ({zh ? PORTAL_META[r.portal].zh : PORTAL_META[r.portal].en})
                  </option>
                ))}
              </AdminSelect>
            </div>
            <div>
              <AdminLabel>{zh ? "所屬中心" : "Centre"}</AdminLabel>
              <AdminSelect value={editCenter} onChange={(e) => setEditCenter(e.target.value)}>
                <option value="">{zh ? "選擇中心" : "Select centre"}</option>
                {centers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.center_name}
                  </option>
                ))}
              </AdminSelect>
            </div>
            <p className="text-xs text-classz-500">
              {zh
                ? "模組權限跟角色與該中心的訂閱方案走，不再做個人覆寫。方案請到「中心審核」或「中心帳戶」設定。"
                : "Modules follow the role and that centre’s plan. Set the plan on Centres or Centre accounts."}
            </p>
          </div>
        ) : null}
      </AdminModal>
    </AdminPageFrame>
  )
}
