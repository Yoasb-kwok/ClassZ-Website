"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ExternalLink, IdCard, Pencil, Search, UserCog } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { getClasszSession } from "@/lib/classz-auth"
import { apiGet } from "@/lib/classz-api-client"
import {
  AdminCard,
  AdminGhostButton,
  AdminInput,
  AdminPageFrame,
  AdminPageHeader,
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
}

export function CenterProfilesList() {
  const router = useRouter()
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const session = getClasszSession()
  const [rows, setRows] = useState<CenterRow[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session && session.user.role !== "platform_admin") {
      router.replace("/admin/centre-profile")
    }
  }, [router, session])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const qs = new URLSearchParams()
      if (search.trim()) qs.set("search", search.trim())
      const path = `/centers${qs.toString() ? `?${qs}` : ""}`
      const data = await apiGet<CenterRow[]>(path, "platform_admin")
      setRows(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed")
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <AdminPageFrame>
      <AdminPageHeader
        title={zh ? "中心資料" : "Centre profiles"}
        Icon={IdCard}
        description={
          zh
            ? "編輯各中心公開頁的名稱、地址、簡介、banner 與人員。"
            : "Edit each centre’s public name, address, description, banner and members."
        }
      />
      <AdminCard>
        {error ? (
          <div className="mb-3 text-sm text-brand-coral bg-[color-mix(in_srgb,var(--brand-coral)_10%,white)] border border-[color-mix(in_srgb,var(--brand-coral)_35%,white)] rounded-md px-3 py-2">
            {error}
          </div>
        ) : null}
        <AdminToolbar>
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-classz-400 pointer-events-none" />
            <AdminInput
              className="pl-9"
              placeholder={zh ? "搜尋中心" : "Search centres"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </AdminToolbar>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 rounded-full border-2 border-classz-400 border-t-transparent animate-spin" />
          </div>
        ) : (
          <AdminTableShell>
            <AdminTable>
              <thead>
                <tr className="border-b border-classz-100 text-left text-xs uppercase tracking-wide text-classz-500">
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">{zh ? "名稱" : "Name"}</th>
                  <th className="px-3 py-2">{zh ? "地區" : "District"}</th>
                  <th className="px-3 py-2">{zh ? "類別" : "Category"}</th>
                  <th className="px-3 py-2">{zh ? "狀態" : "Status"}</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-classz-50">
                    <td className="px-3 py-2 text-classz-500">{row.id}</td>
                    <td className="px-3 py-2 font-medium">{row.center_name}</td>
                    <td className="px-3 py-2">{row.district}</td>
                    <td className="px-3 py-2">{row.category}</td>
                    <td className="px-3 py-2">{row.status}</td>
                    <td className="px-3 py-2 text-right whitespace-nowrap">
                      <Link href={`/admin/center-profiles/${row.id}`}>
                        <AdminGhostButton size="sm">
                          <Pencil className="h-3.5 w-3.5" />
                          {zh ? "資料" : "Profile"}
                        </AdminGhostButton>
                      </Link>
                      <Link href={`/admin/center-profiles/${row.id}/members`}>
                        <AdminGhostButton size="sm" className="ml-1">
                          <UserCog className="h-3.5 w-3.5" />
                          {zh ? "人員" : "Members"}
                        </AdminGhostButton>
                      </Link>
                      {row.status === "active" || row.status === "beta_trial" ? (
                        <Link href={`/centres/${row.id}`} target="_blank">
                          <AdminGhostButton size="sm" className="ml-1">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </AdminGhostButton>
                        </Link>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </AdminTable>
          </AdminTableShell>
        )}
      </AdminCard>
    </AdminPageFrame>
  )
}
