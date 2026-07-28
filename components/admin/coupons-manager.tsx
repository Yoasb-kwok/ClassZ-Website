"use client"

import { useMemo, useState } from "react"
import { Edit, Plus, Power, PowerOff, Search, Tag, Trash2 } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { appendAudit, newId, type AdminCoupon } from "@/lib/classz-admin-store"
import { useAdminStore } from "@/components/admin/use-admin-store"
import { isDemoSession } from "@/components/admin/use-admin-api"
import { apiDelete, apiPatch, apiPost } from "@/lib/classz-api-client"
import { useCenterApiList } from "@/components/admin/use-center-api-list"
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
  AdminStatusChip,
  AdminTable,
  AdminTableShell,
  AdminToolbar,
} from "@/components/classz-admin-ui"

export function CouponsManager() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const demo = isDemoSession()
  const { store, patch, ready: storeReady } = useAdminStore()
  const mapCoupon = (c: Record<string, unknown>): AdminCoupon => ({
    id: String(c.id),
    code: String(c.code || ""),
    discount_type: (c.discount_type as AdminCoupon["discount_type"]) || "percentage",
    discount_value: Number(c.discount_value) || 0,
    min_order_amount: Number(c.min_order_amount) || 0,
    quantity: Number(c.quantity) || 0,
    used_count: Number(c.used_count) || 0,
    valid_from: String(c.valid_from || "").slice(0, 10),
    valid_until: String(c.valid_until || "").slice(0, 10),
    is_active: Boolean(c.is_active),
  })
  const { rows: apiRows, ready: apiReady, reload } = useCenterApiList("/coupons", mapCoupon)
  const ready = demo ? storeReady : apiReady
  const coupons = demo ? store?.coupons : apiRows
  const [search, setSearch] = useState("")
  const [modal, setModal] = useState<"create" | "edit" | null>(null)
  const [editing, setEditing] = useState<AdminCoupon | null>(null)
  const [form, setForm] = useState({
    code: "",
    discount_type: "percentage" as AdminCoupon["discount_type"],
    discount_value: "",
    min_order_amount: "",
    quantity: "",
    valid_from: "",
    valid_until: "",
    is_active: true,
  })

  const rows = useMemo(() => {
    if (!coupons) return []
    const q = search.trim().toLowerCase()
    return coupons.filter((c) => !q || c.code.toLowerCase().includes(q))
  }, [coupons, search])

  function openCreate() {
    const t = new Date()
    const t3 = new Date(t.getTime() + 90 * 86400000)
    setEditing(null)
    setForm({
      code: "",
      discount_type: "percentage",
      discount_value: "10",
      min_order_amount: "0",
      quantity: "100",
      valid_from: t.toISOString().slice(0, 10),
      valid_until: t3.toISOString().slice(0, 10),
      is_active: true,
    })
    setModal("create")
  }

  function openEdit(c: AdminCoupon) {
    setEditing(c)
    setForm({
      code: c.code,
      discount_type: c.discount_type,
      discount_value: String(c.discount_value),
      min_order_amount: String(c.min_order_amount),
      quantity: String(c.quantity),
      valid_from: c.valid_from.slice(0, 10),
      valid_until: c.valid_until.slice(0, 10),
      is_active: c.is_active,
    })
    setModal("edit")
  }

  async function save() {
    const body = {
      code: form.code.trim(),
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value) || 0,
      min_order_amount: parseInt(form.min_order_amount, 10) || 0,
      quantity: parseInt(form.quantity, 10) || 0,
      valid_from: form.valid_from,
      valid_until: form.valid_until,
      is_active: form.is_active,
    }
    if (!demo) {
      try {
        if (modal === "create") await apiPost("/coupons", body)
        else if (editing) await apiPatch(`/coupons/${editing.id}`, body)
        await reload()
        setModal(null)
      } catch (e) {
        alert(e instanceof Error ? e.message : "Save failed")
      }
      return
    }
    if (!store) return
    const row: AdminCoupon = {
      id: editing?.id ?? newId(),
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value) || 0,
      min_order_amount: parseFloat(form.min_order_amount) || 0,
      quantity: Math.max(1, parseInt(form.quantity, 10) || 1),
      used_count: editing?.used_count ?? 0,
      valid_from: form.valid_from,
      valid_until: form.valid_until,
      is_active: form.is_active,
      created_at: editing?.created_at ?? new Date().toISOString(),
    }
    if (modal === "create") {
      patch((s) => appendAudit({ ...s, coupons: [...s.coupons, row] }, { action: "create_coupon", target_type: "coupon", target_id: row.id, details: row.code }))
    } else if (editing) {
      patch((s) =>
        appendAudit(
          { ...s, coupons: s.coupons.map((x) => (x.id === editing.id ? row : x)) },
          { action: "update_coupon", target_type: "coupon", target_id: row.id, details: row.code }
        )
      )
    }
    setModal(null)
  }

  function toggle(id: string) {
    patch((s) =>
      appendAudit(
        {
          ...s,
          coupons: s.coupons.map((c) => (c.id === id ? { ...c, is_active: !c.is_active } : c)),
        },
        { action: "toggle_coupon", target_type: "coupon", target_id: id, details: "" }
      )
    )
  }

  function remove(id: string) {
    if (!confirm(zh ? "刪除此優惠券？" : "Delete this coupon?")) return
    patch((s) => appendAudit({ ...s, coupons: s.coupons.filter((c) => c.id !== id) }, { action: "delete_coupon", target_type: "coupon", target_id: id, details: "" }))
  }

  if (!ready || (!demo && !coupons) || (demo && !store)) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 rounded-full border-2 border-classz-400 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <AdminPageFrame>
      <AdminPageHeader title={zh ? "優惠券管理" : "Coupon management"} Icon={Tag} />
      <AdminCard>
        <AdminToolbar>
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-classz-400 pointer-events-none" />
            <AdminInput className="pl-9" placeholder={zh ? "搜尋代碼…" : "Search code…"} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <AdminPrimaryButton type="button" className="ml-auto" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            {zh ? "新增優惠券" : "Add coupon"}
          </AdminPrimaryButton>
        </AdminToolbar>
        <AdminTableShell>
          <AdminTable>
            <thead className="bg-classz-100">
              <tr>
                <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">Code</th>
                <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">{zh ? "折扣" : "Discount"}</th>
                <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">{zh ? "使用" : "Uses"}</th>
                <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">{zh ? "有效" : "Valid"}</th>
                <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">{zh ? "啟用" : "Active"}</th>
                <th className="px-3 py-3 text-right text-base font-semibold text-classz-600 uppercase">{zh ? "操作" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-classz-100">
              {rows.map((c) => (
                <tr key={c.id} className="bg-white">
                  <td className="px-3 py-2 font-semibold tracking-wide text-classz-700">{c.code}</td>
                  <td className="px-3 py-2 text-classz-600 text-base">
                    {c.discount_type === "percentage" ? `${c.discount_value}%` : `HK$${c.discount_value}`}
                  </td>
                  <td className="px-3 py-2 text-classz-600">
                    {c.used_count}/{c.quantity}
                  </td>
                  <td className="px-3 py-2 text-base text-classz-600">
                    {c.valid_from} → {c.valid_until}
                  </td>
                  <td className="px-3 py-2">
                    <AdminGhostButton type="button" className="py-2.5 px-3.5 text-base" onClick={() => toggle(c.id)}>
                      <AdminStatusChip tone={c.is_active ? "teal" : "coral"}>
                        {c.is_active ? <Power className="h-3 w-3 mr-1" /> : <PowerOff className="h-3 w-3 mr-1" />}
                        {c.is_active ? (zh ? "啟用" : "On") : zh ? "停用" : "Off"}
                      </AdminStatusChip>
                    </AdminGhostButton>
                  </td>
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
        title={modal === "create" ? (zh ? "新增優惠券" : "Add coupon") : zh ? "編輯優惠券" : "Edit coupon"}
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
            <AdminLabel>Code</AdminLabel>
            <AdminInput value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
          </div>
          <div>
            <AdminLabel>{zh ? "類型" : "Type"}</AdminLabel>
            <AdminSelect value={form.discount_type} onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value as AdminCoupon["discount_type"] }))}>
              <option value="percentage">%</option>
              <option value="fixed">HK$</option>
            </AdminSelect>
          </div>
          <div>
            <AdminLabel>{zh ? "折扣值" : "Discount value"}</AdminLabel>
            <AdminInput value={form.discount_value} onChange={(e) => setForm((f) => ({ ...f, discount_value: e.target.value }))} />
          </div>
          <div>
            <AdminLabel>{zh ? "最低消費" : "Min order (HK$)"}</AdminLabel>
            <AdminInput value={form.min_order_amount} onChange={(e) => setForm((f) => ({ ...f, min_order_amount: e.target.value }))} />
          </div>
          <div>
            <AdminLabel>{zh ? "數量" : "Quantity"}</AdminLabel>
            <AdminInput value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <AdminLabel>{zh ? "開始" : "From"}</AdminLabel>
              <AdminInput type="date" value={form.valid_from} onChange={(e) => setForm((f) => ({ ...f, valid_from: e.target.value }))} />
            </div>
            <div>
              <AdminLabel>{zh ? "結束" : "Until"}</AdminLabel>
              <AdminInput type="date" value={form.valid_until} onChange={(e) => setForm((f) => ({ ...f, valid_until: e.target.value }))} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-base text-classz-700">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
            {zh ? "啟用" : "Active"}
          </label>
        </div>
      </AdminModal>
    </AdminPageFrame>
  )
}
