"use client"

import { useCallback, useEffect, useState } from "react"
import { BarChart3 } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { isDemoSession } from "@/components/admin/use-admin-api"
import { apiGet } from "@/lib/classz-api-client"
import { AdminCard, AdminPageFrame, AdminPageHeader } from "@/components/classz-admin-ui"

type ReportKey =
  | "attendance"
  | "revenue"
  | "teacher"
  | "retention"
  | "popular"
  | "conversion"

const ENDPOINTS: Record<ReportKey, string> = {
  attendance: "/attendance-anomaly",
  revenue: "/reports/revenue",
  teacher: "/instructor-performance",
  retention: "/renewal-churn",
  popular: "/reports/popular-courses",
  conversion: "/conversion-funnel",
}

export function ReportsHub() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const demo = isDemoSession()
  const [tab, setTab] = useState<ReportKey>("revenue")
  const [data, setData] = useState<unknown>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (demo) {
      setData(null)
      setError(zh ? "請用中心帳號登入" : "Sign in with centre account")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const month = new Date().toISOString().slice(0, 7)
      const path = ENDPOINTS[tab]
      const qs = path.includes("?") ? "" : path.includes("reports/") ? "" : `?month=${month}`
      const result = await apiGet(`${path}${qs}`)
      setData(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed")
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [demo, tab, zh])

  useEffect(() => {
    load()
  }, [load])

  const tabs: Array<[ReportKey, string]> = [
    ["attendance", zh ? "出席報表" : "Attendance"],
    ["revenue", zh ? "收入報表" : "Revenue"],
    ["teacher", zh ? "導師表現" : "Teacher performance"],
    ["retention", zh ? "學員留存" : "Retention"],
    ["popular", zh ? "熱門課程" : "Popular courses"],
    ["conversion", zh ? "轉換率" : "Conversion"],
  ]

  return (
    <AdminPageFrame>
      <AdminPageHeader title={zh ? "報表" : "Reports"} Icon={BarChart3} />

      <div className="flex flex-wrap gap-2">
        {tabs.map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-md text-sm font-medium border ${
              tab === k ? "bg-classz-100 border-classz-400" : "bg-white border-classz-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <AdminCard>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 rounded-full border-2 border-classz-400 border-t-transparent animate-spin" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
          <pre className="text-xs bg-classz-50 p-4 rounded-md overflow-auto max-h-[32rem]">{JSON.stringify(data, null, 2)}</pre>
        )}
      </AdminCard>
    </AdminPageFrame>
  )
}
