"use client"

import { useMemo, useState } from "react"
import { Download, FileText, Filter, Search } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { resetAdminStore } from "@/lib/classz-admin-store"
import { useAdminStore } from "@/components/admin/use-admin-store"
import {
  AdminCard,
  AdminDangerButton,
  AdminGhostButton,
  AdminInput,
  AdminPageFrame,
  AdminPageHeader,
  AdminSelect,
  AdminTable,
  AdminTableShell,
  AdminToolbar,
} from "@/components/classz-admin-ui"

export function AuditManager() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const { store, patch, ready } = useAdminStore()
  const [search, setSearch] = useState("")
  const [action, setAction] = useState("all")

  const rows = useMemo(() => {
    if (!store) return []
    return store.auditLog.filter((e) => {
      if (action !== "all" && e.action !== action) return false
      if (!search.trim()) return true
      const q = search.toLowerCase()
      return e.actor.toLowerCase().includes(q) || e.details.toLowerCase().includes(q) || e.action.toLowerCase().includes(q)
    })
  }, [store, search, action])

  const actions = useMemo(() => {
    if (!store) return []
    return [...new Set(store.auditLog.map((e) => e.action))]
  }, [store])

  function exportCsv() {
    if (!store) return
    const h = ["time", "actor", "action", "target_type", "target_id", "details"]
    const lines = rows.map((e) =>
      [e.created_at, e.actor, e.action, e.target_type, e.target_id ?? "", e.details.replace(/,/g, ";")].join(",")
    )
    const blob = new Blob(["\uFEFF" + [h.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `classz-audit-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  function resetDemo() {
    if (!confirm(zh ? "重設所有示範資料？此操作無法還原。" : "Reset all demo data? This cannot be undone.")) return
    patch(() => resetAdminStore())
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
      <AdminPageHeader
        title={zh ? "審計日誌" : "Audit log"}
        description={zh ? "本地示範：變更會寫入此列表。" : "Local demo: mutations append here."}
        Icon={FileText}
      />
      <AdminCard>
        <AdminToolbar>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-classz-400" />
            <AdminInput className="pl-9 w-56" placeholder={zh ? "搜尋…" : "Search…"} value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 text-classz-600">
            <Filter className="h-4 w-4" />
            <AdminSelect value={action} onChange={(e) => setAction(e.target.value)}>
              <option value="all">{zh ? "全部動作" : "All actions"}</option>
              {actions.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </AdminSelect>
          </div>
          <AdminGhostButton type="button" onClick={exportCsv}>
            <Download className="h-4 w-4" />
            {zh ? "匯出 CSV" : "Export CSV"}
          </AdminGhostButton>
          <AdminDangerButton type="button" className="ml-auto" onClick={resetDemo}>
            {zh ? "重設示範資料" : "Reset demo data"}
          </AdminDangerButton>
        </AdminToolbar>
        <AdminTableShell>
          <AdminTable>
            <thead className="bg-classz-100">
              <tr>
                <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">{zh ? "時間" : "Time"}</th>
                <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">{zh ? "操作者" : "Actor"}</th>
                <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">{zh ? "動作" : "Action"}</th>
                <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">{zh ? "對象" : "Target"}</th>
                <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">{zh ? "詳情" : "Details"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-classz-100">
              {rows.map((e) => (
                <tr key={e.id} className="bg-white">
                  <td className="px-3 py-2 text-base text-classz-600 whitespace-nowrap">{new Date(e.created_at).toLocaleString(zh ? "zh-HK" : "en-HK")}</td>
                  <td className="px-3 py-2 text-classz-700">{e.actor}</td>
                  <td className="px-3 py-2 text-base text-classz-600">{e.action}</td>
                  <td className="px-3 py-2 text-base text-classz-600">
                    {e.target_type} {e.target_id ? `#${e.target_id.slice(0, 8)}` : ""}
                  </td>
                  <td className="px-3 py-2 text-base text-classz-700 max-w-md truncate">{e.details}</td>
                </tr>
              ))}
            </tbody>
          </AdminTable>
        </AdminTableShell>
      </AdminCard>
    </AdminPageFrame>
  )
}
