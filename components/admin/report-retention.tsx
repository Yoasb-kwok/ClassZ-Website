"use client"

import { useCallback, useEffect, useState } from "react"
import { UsersRound } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { isDemoSession } from "@/components/admin/use-admin-api"
import { apiGet } from "@/lib/classz-api-client"
import {
  AdminCard,
  AdminTable,
  AdminTableShell,
  KpiGrid,
  ReportShell,
  useReportMonth,
} from "@/components/admin/report-shared"

type RetentionData = {
  totalExpiring: number
  renewedCount: number
  renewalRate: number
  churnCount: number
  churnRate: number
  churnList: Array<{
    id: string
    full_name: string
    mobile: string
    expiry_date: string
  }>
}

export function RetentionReport() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const demo = isDemoSession()
  const { month, setMonth } = useReportMonth()
  const [data, setData] = useState<RetentionData | null>(null)
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
      const result = await apiGet<RetentionData>(`/renewal-churn?month=${encodeURIComponent(month)}`)
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

  const list = data?.churnList || []

  return (
    <ReportShell
      title={zh ? "學員留存" : "Student retention"}
      description={
        zh
          ? "依代幣到期與續購判斷續約／流失"
          : "Renewal vs churn based on token expiry and repurchase"
      }
      Icon={UsersRound}
      month={month}
      onMonthChange={setMonth}
      loading={loading}
      error={error}
      zh={zh}
    >
      <KpiGrid
        items={[
          { label: zh ? "到期學員" : "Expiring", value: String(data?.totalExpiring ?? 0) },
          {
            label: zh ? "續約數" : "Renewed",
            value: String(data?.renewedCount ?? 0),
            hint: zh ? `續約率 ${data?.renewalRate ?? 0}%` : `Rate ${data?.renewalRate ?? 0}%`,
          },
          {
            label: zh ? "流失數" : "Churned",
            value: String(data?.churnCount ?? 0),
            hint: zh ? `流失率 ${data?.churnRate ?? 0}%` : `Rate ${data?.churnRate ?? 0}%`,
          },
          {
            label: zh ? "續約率" : "Renewal rate",
            value: `${data?.renewalRate ?? 0}%`,
          },
        ]}
      />

      <div className="grid lg:grid-cols-3 gap-3">
        <AdminCard>
          <h2 className="text-sm font-semibold text-classz-800 mb-3">{zh ? "續約 vs 流失" : "Renew vs churn"}</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>{zh ? "續約" : "Renewed"}</span>
                <span className="tabular-nums">{data?.renewalRate ?? 0}%</span>
              </div>
              <div className="h-3 rounded-full bg-classz-50 overflow-hidden">
                <div
                  className="h-full bg-brand-teal rounded-full"
                  style={{ width: `${Math.min(100, Number(data?.renewalRate) || 0)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>{zh ? "流失" : "Churn"}</span>
                <span className="tabular-nums">{data?.churnRate ?? 0}%</span>
              </div>
              <div className="h-3 rounded-full bg-classz-50 overflow-hidden">
                <div
                  className="h-full bg-brand-coral rounded-full"
                  style={{ width: `${Math.min(100, Number(data?.churnRate) || 0)}%` }}
                />
              </div>
            </div>
          </div>
        </AdminCard>

        <AdminCard className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-classz-800 mb-3">
            {zh ? "流失學員名單" : "Churn list"}
          </h2>
          <AdminTableShell>
            <AdminTable>
              <thead className="bg-classz-100">
                <tr>
                  <th className="px-3 py-2 text-left">{zh ? "姓名" : "Name"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "電話" : "Mobile"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "到期日" : "Expiry"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-classz-100">
                {list.map((r) => (
                  <tr key={r.id}>
                    <td className="px-3 py-2">{r.full_name || "—"}</td>
                    <td className="px-3 py-2">{r.mobile || "—"}</td>
                    <td className="px-3 py-2 tabular-nums">{r.expiry_date || "—"}</td>
                  </tr>
                ))}
                {!list.length ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-8 text-center text-classz-500">
                      {zh ? "本月無流失名單" : "No churned students this month"}
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
