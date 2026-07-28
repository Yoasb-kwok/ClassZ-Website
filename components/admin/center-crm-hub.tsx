"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Building2, Search } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { apiGet } from "@/lib/classz-api-client"
import { centerCrmFlowPath, clearCenterCrmScope } from "@/lib/center-crm-scope"
import {
  AdminCard,
  AdminGhostButton,
  AdminInput,
  AdminPageFrame,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminSelect,
  AdminTable,
  AdminTableShell,
  AdminToolbar,
} from "@/components/classz-admin-ui"

type CenterRow = {
  id: number
  center_name: string
  district: string
  category: string
  status: string
  admin_email?: string | null
}

export function CenterCrmHub() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const [rows, setRows] = useState<CenterRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("active")

  useEffect(() => {
    clearCenterCrmScope()
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const qs = new URLSearchParams()
      if (statusFilter) qs.set("status", statusFilter)
      if (search.trim()) qs.set("search", search.trim())
      const data = await apiGet<CenterRow[]>(`/centers${qs.toString() ? `?${qs}` : ""}`, "platform_admin")
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
        title={zh ? "中心 CRM" : "Centre CRM"}
        description={
          zh
            ? "選擇中心進入其 CRM（課程、排程、點名、回饋），以平台管理員身份代管。"
            : "Pick a centre to open its CRM (programs, schedule, attendance, feedback) as platform admin."
        }
        Icon={Building2}
      />

      <AdminToolbar>
        <div className="relative flex-1 min-w-[12rem]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-classz-400" />
          <AdminInput
            className="pl-9"
            placeholder={zh ? "搜尋中心…" : "Search centres…"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
          />
        </div>
        <AdminSelect className="w-44" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">{zh ? "全部狀態" : "All statuses"}</option>
          <option value="active">active</option>
          <option value="beta_trial">beta_trial</option>
          <option value="pending_approval">pending_approval</option>
          <option value="suspended">suspended</option>
        </AdminSelect>
        <AdminGhostButton type="button" onClick={() => load()}>
          {zh ? "搜尋" : "Search"}
        </AdminGhostButton>
      </AdminToolbar>

      {error ? <div className="text-brand-coral text-sm">{error}</div> : null}

      <AdminCard>
        <AdminTableShell>
          <AdminTable>
            <thead className="bg-classz-100">
              <tr>
                <th className="px-3 py-3 text-left">ID</th>
                <th className="px-3 py-3 text-left">{zh ? "中心" : "Centre"}</th>
                <th className="px-3 py-3 text-left">{zh ? "地區" : "District"}</th>
                <th className="px-3 py-3 text-left">{zh ? "狀態" : "Status"}</th>
                <th className="px-3 py-3 text-left">Admin</th>
                <th className="px-3 py-3 text-right">{zh ? "操作" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-classz-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-classz-500">
                    {zh ? "暫無中心" : "No centres"}
                  </td>
                </tr>
              ) : (
                rows.map((c) => (
                  <tr key={c.id} className="bg-white">
                    <td className="px-3 py-2">{c.id}</td>
                    <td className="px-3 py-2 font-medium">{c.center_name}</td>
                    <td className="px-3 py-2 text-sm">{c.district}</td>
                    <td className="px-3 py-2 text-xs">{c.status}</td>
                    <td className="px-3 py-2 text-sm">{c.admin_email || "—"}</td>
                    <td className="px-3 py-2 text-right">
                      <Link href={centerCrmFlowPath(c.id, "programs")}>
                        <AdminPrimaryButton type="button" className="inline-flex text-sm py-1.5 px-3">
                          {zh ? "管理 CRM" : "Open CRM"}
                          <ArrowRight className="h-4 w-4" />
                        </AdminPrimaryButton>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </AdminTable>
        </AdminTableShell>
      </AdminCard>
    </AdminPageFrame>
  )
}
