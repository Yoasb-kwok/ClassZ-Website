"use client"

import { useMemo, useState } from "react"
import { Download, Plus, Receipt, Search, Trash2 } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { appendAudit, newId, type AdminOrder } from "@/lib/classz-admin-store"
import { useAdminStore } from "@/components/admin/use-admin-store"
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
  AdminToolbar,
} from "@/components/classz-admin-ui"

export function OrdersManager() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const { store, patch, ready } = useAdminStore()
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    user_name: "",
    total: "",
    package_name: "",
    payment_status: "paid" as AdminOrder["payment_status"],
    payment_method: "fps",
  })

  const rows = useMemo(() => {
    if (!store) return []
    const q = search.trim().toLowerCase()
    return store.orders.filter(
      (o) =>
        !q ||
        o.user_name.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        o.package_name.toLowerCase().includes(q)
    )
  }, [store, search])

  function addOrder() {
    if (!store) return
    const total = Math.max(0, parseFloat(form.total) || 0)
    const o: AdminOrder = {
      id: newId(),
      user_id: store.users[0]?.id ?? "u_unknown",
      user_name: form.user_name.trim() || (zh ? "訪客" : "Guest"),
      total,
      discount: 0,
      payment_status: form.payment_status,
      payment_method: form.payment_method,
      package_name: form.package_name.trim() || (zh ? "套票" : "Package"),
      created_at: new Date().toISOString(),
    }
    patch((s) => appendAudit({ ...s, orders: [o, ...s.orders] }, { action: "create_order", target_type: "order", target_id: o.id, details: String(total) }))
    setOpen(false)
  }

  function remove(id: string) {
    if (!confirm(zh ? "刪除此記錄？" : "Delete this record?")) return
    patch((s) => appendAudit({ ...s, orders: s.orders.filter((o) => o.id !== id) }, { action: "delete_order", target_type: "order", target_id: id, details: "" }))
  }

  function exportCsv() {
    if (!store) return
    const h = ["id", "user", "total", "status", "package", "date"]
    const lines = rows.map((o) => [o.id, o.user_name, o.total, o.payment_status, o.package_name, o.created_at].join(","))
    const blob = new Blob(["\uFEFF" + [h.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `classz-orders-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
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
      <AdminPageHeader title={zh ? "購買記錄" : "Purchase records"} Icon={Receipt} />
      <AdminCard>
        <AdminToolbar>
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-classz-400 pointer-events-none" />
            <AdminInput className="pl-9" placeholder={zh ? "搜尋…" : "Search…"} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <AdminGhostButton type="button" onClick={exportCsv}>
            <Download className="h-4 w-4" />
            {zh ? "匯出 CSV" : "Export CSV"}
          </AdminGhostButton>
          <AdminPrimaryButton type="button" className="ml-auto" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            {zh ? "新增訂單" : "Add order"}
          </AdminPrimaryButton>
        </AdminToolbar>
        <AdminTableShell>
          <AdminTable>
            <thead className="bg-classz-100">
              <tr>
                <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">ID</th>
                <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">{zh ? "用戶" : "User"}</th>
                <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">{zh ? "金額" : "Total"}</th>
                <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">{zh ? "狀態" : "Status"}</th>
                <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">{zh ? "方案" : "Package"}</th>
                <th className="px-3 py-3 text-right text-base font-semibold text-classz-600 uppercase">{zh ? "操作" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-classz-100">
              {rows.map((o) => (
                <tr key={o.id} className="bg-white">
                  <td className="px-3 py-2 text-base text-classz-600 tabular-nums">{o.id.slice(0, 12)}…</td>
                  <td className="px-3 py-2 text-classz-700">{o.user_name}</td>
                  <td className="px-3 py-2 text-classz-700">HK${o.total}</td>
                  <td className="px-3 py-2 text-classz-600">{o.payment_status}</td>
                  <td className="px-3 py-2 text-base text-classz-600">{o.package_name}</td>
                  <td className="px-3 py-2 text-right">
                    <button type="button" className="p-1.5 text-red-600 hover:bg-red-50 rounded" onClick={() => remove(o.id)}>
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
        open={open}
        title={zh ? "新增訂單" : "Add order"}
        onClose={() => setOpen(false)}
        footer={
          <>
            <button type="button" className="px-4 py-2.5 text-base text-classz-700 hover:bg-classz-50 rounded-md border border-classz-200" onClick={() => setOpen(false)}>
              {zh ? "取消" : "Cancel"}
            </button>
            <AdminPrimaryButton onClick={addOrder}>{zh ? "建立" : "Create"}</AdminPrimaryButton>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <AdminLabel>{zh ? "用戶名稱" : "User name"}</AdminLabel>
            <AdminInput value={form.user_name} onChange={(e) => setForm((f) => ({ ...f, user_name: e.target.value }))} />
          </div>
          <div>
            <AdminLabel>{zh ? "金額 (HK$)" : "Amount (HK$)"}</AdminLabel>
            <AdminInput value={form.total} onChange={(e) => setForm((f) => ({ ...f, total: e.target.value }))} />
          </div>
          <div>
            <AdminLabel>{zh ? "方案名稱" : "Package name"}</AdminLabel>
            <AdminInput value={form.package_name} onChange={(e) => setForm((f) => ({ ...f, package_name: e.target.value }))} />
          </div>
          <div>
            <AdminLabel>{zh ? "付款狀態" : "Payment status"}</AdminLabel>
            <AdminSelect value={form.payment_status} onChange={(e) => setForm((f) => ({ ...f, payment_status: e.target.value as AdminOrder["payment_status"] }))}>
              <option value="paid">paid</option>
              <option value="pending">pending</option>
              <option value="failed">failed</option>
            </AdminSelect>
          </div>
          <div>
            <AdminLabel>{zh ? "方式" : "Method"}</AdminLabel>
            <AdminInput value={form.payment_method} onChange={(e) => setForm((f) => ({ ...f, payment_method: e.target.value }))} />
          </div>
        </div>
      </AdminModal>
    </AdminPageFrame>
  )
}
