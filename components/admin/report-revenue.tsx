"use client"

import { useCallback, useEffect, useState } from "react"
import { DollarSign } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { isDemoSession } from "@/components/admin/use-admin-api"
import { apiGet } from "@/lib/classz-api-client"
import {
  AdminCard,
  AdminTable,
  AdminTableShell,
  BarList,
  KpiGrid,
  ReportShell,
  useReportMonth,
} from "@/components/admin/report-shared"

type RevenueData = {
  days: Array<{ day: string; revenue: number; order_count?: number }>
  total: number
  orderCount?: number
  avgDaily?: number
  period?: string
}

export function RevenueReport() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const demo = isDemoSession()
  const { month, setMonth } = useReportMonth()
  const [data, setData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (demo) {
      setError(zh ? "請用中心帳號登入以載入真實數據" : "Sign in with a centre account for live data")
      setData(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await apiGet<RevenueData>(`/reports/revenue?month=${encodeURIComponent(month)}`)
      setData(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed")
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [demo, month, zh])

  useEffect(() => {
    load()
  }, [load])

  const days = data?.days || []
  const total = Number(data?.total) || 0
  const orderCount = Number(data?.orderCount) || days.reduce((s, d) => s + Number(d.order_count || 0), 0)
  const avgDaily = Number(data?.avgDaily) || (days.length ? total / days.length : 0)
  const peak = days.reduce<{ day: string; revenue: number } | null>((best, d) => {
    if (!best || Number(d.revenue) > best.revenue) return { day: String(d.day).slice(0, 10), revenue: Number(d.revenue) || 0 }
    return best
  }, null)

  return (
    <ReportShell
      title={zh ? "收入報表" : "Revenue report"}
      description={zh ? "已付款訂單收入，依日彙總" : "Paid order revenue, daily breakdown"}
      Icon={DollarSign}
      month={month}
      onMonthChange={setMonth}
      loading={loading}
      error={error}
      zh={zh}
    >
      <KpiGrid
        items={[
          { label: zh ? "本月總收入" : "Month total", value: `HK$${total.toLocaleString()}` },
          { label: zh ? "訂單數" : "Orders", value: String(orderCount) },
          { label: zh ? "日均收入" : "Avg / day", value: `HK$${Math.round(avgDaily).toLocaleString()}` },
          {
            label: zh ? "最高單日" : "Peak day",
            value: peak ? `HK$${peak.revenue.toLocaleString()}` : "—",
            hint: peak?.day,
          },
        ]}
      />

      <div className="grid lg:grid-cols-2 gap-3">
        <AdminCard>
          <h2 className="text-sm font-semibold text-classz-800 mb-3">{zh ? "每日收入" : "Daily revenue"}</h2>
          <BarList
            empty={zh ? "本月尚無已付訂單" : "No paid orders this month"}
            rows={[...days]
              .sort((a, b) => Number(b.revenue) - Number(a.revenue))
              .slice(0, 12)
              .map((d) => ({
                key: String(d.day),
                label: String(d.day).slice(0, 10),
                value: Number(d.revenue) || 0,
                display: `HK$${Number(d.revenue || 0).toLocaleString()}`,
              }))}
          />
        </AdminCard>

        <AdminCard>
          <AdminTableShell>
            <AdminTable>
              <thead className="bg-classz-100">
                <tr>
                  <th className="px-3 py-2 text-left">{zh ? "日期" : "Date"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "收入" : "Revenue"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "訂單" : "Orders"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-classz-100">
                {[...days].reverse().map((d) => (
                  <tr key={String(d.day)}>
                    <td className="px-3 py-2">{String(d.day).slice(0, 10)}</td>
                    <td className="px-3 py-2 tabular-nums">HK${Number(d.revenue || 0).toLocaleString()}</td>
                    <td className="px-3 py-2 tabular-nums">{Number(d.order_count) || "—"}</td>
                  </tr>
                ))}
                {!days.length ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-8 text-center text-classz-500">
                      {zh ? "無數據" : "No data"}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </AdminTable>
          </AdminTableShell>
        </AdminCard>
      </div>
    </ReportShell>
  )
}
