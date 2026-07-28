"use client"

import { useCallback, useEffect, useState } from "react"
import { Megaphone } from "lucide-react"
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

type ChannelRow = {
  channel: string
  channelKey: string
  trialCount: number
  enrollmentCount: number
  conversionRate: number
  revenue?: number
  leadCount?: number
  convertedCount?: number
}

type ConversionData = {
  byChannel: ChannelRow[]
  trialToEnrollmentRate: number
  totalTrialCount: number
  newEnrollmentCount: number
  relatedRevenue: number
  adLeadCount?: number
  adConvertedCount?: number
  adConversionRate?: number
  funnelStages?: Array<{ nameKey: string; value: number }>
}

export function AdConversionReport() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const demo = isDemoSession()
  const { month, setMonth } = useReportMonth()
  const [data, setData] = useState<ConversionData | null>(null)
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
      const result = await apiGet<ConversionData>(
        `/conversion-funnel?month=${encodeURIComponent(month)}`,
      )
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

  const channels = data?.byChannel || []
  const adLeads = data?.adLeadCount ?? channels.reduce((s, c) => s + Number(c.leadCount ?? c.trialCount ?? 0), 0)
  const adConverted =
    data?.adConvertedCount ?? channels.reduce((s, c) => s + Number(c.convertedCount ?? c.enrollmentCount ?? 0), 0)
  const adRate = data?.adConversionRate ?? (adLeads > 0 ? Math.round((adConverted / adLeads) * 1000) / 10 : 0)

  const stageLabel = (key: string) => {
    const map: Record<string, [string, string]> = {
      lead: ["廣告／名單", "Ad leads"],
      converted: ["已轉換", "Converted"],
      trial: ["試堂申請", "Trials"],
      enrolled: ["正式報名", "Enrolled"],
    }
    const pair = map[key]
    return pair ? (zh ? pair[0] : pair[1]) : key
  }

  return (
    <ReportShell
      title={zh ? "廣告學生轉換率" : "Ad → student conversion"}
      description={
        zh
          ? "依 CRM 來源（廣告渠道）統計名單 → 轉換，並對照試堂／報名漏斗"
          : "CRM lead source conversion plus trial → enrollment funnel"
      }
      Icon={Megaphone}
      month={month}
      onMonthChange={setMonth}
      loading={loading}
      error={error}
      zh={zh}
    >
      <KpiGrid
        items={[
          { label: zh ? "廣告／名單數" : "Ad leads", value: String(adLeads) },
          { label: zh ? "已轉換" : "Converted", value: String(adConverted) },
          { label: zh ? "廣告轉換率" : "Ad conversion", value: `${adRate}%` },
          {
            label: zh ? "試堂→報名" : "Trial → enroll",
            value: `${data?.trialToEnrollmentRate ?? 0}%`,
            hint: `${data?.totalTrialCount ?? 0} → ${data?.newEnrollmentCount ?? 0}`,
          },
        ]}
      />

      <div className="grid lg:grid-cols-3 gap-3">
        <AdminCard>
          <h2 className="text-sm font-semibold text-classz-800 mb-3">{zh ? "漏斗" : "Funnel"}</h2>
          <ul className="space-y-3">
            {(data?.funnelStages || [
              { nameKey: "trial", value: data?.totalTrialCount || 0 },
              { nameKey: "enrolled", value: data?.newEnrollmentCount || 0 },
            ]).map((stage, i, arr) => {
              const max = Math.max(...arr.map((s) => Number(s.value) || 0), 1)
              return (
                <li key={`${stage.nameKey}-${i}`}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{stageLabel(stage.nameKey)}</span>
                    <span className="tabular-nums">{stage.value}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-classz-50 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-classz-400"
                      style={{ width: `${Math.max(6, (Number(stage.value) / max) * 100)}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
          <p className="text-xs text-classz-400 mt-4">
            {zh ? "相關收入" : "Related revenue"}: HK${Number(data?.relatedRevenue || 0).toLocaleString()}
          </p>
        </AdminCard>

        <AdminCard className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-classz-800 mb-3">
            {zh ? "渠道轉換率" : "Conversion by channel"}
          </h2>
          <BarList
            empty={zh ? "尚無 CRM 來源數據（可於 CRM 為名單設定 source）" : "No CRM source data yet"}
            rows={channels.map((c) => ({
              key: c.channelKey || c.channel,
              label: c.channel,
              value: Number(c.conversionRate) || 0,
              display: `${Number(c.conversionRate || 0).toFixed(1)}%`,
            }))}
          />
        </AdminCard>
      </div>

      <AdminCard>
        <AdminTableShell>
          <AdminTable>
            <thead className="bg-classz-100">
              <tr>
                <th className="px-3 py-2 text-left">{zh ? "渠道" : "Channel"}</th>
                <th className="px-3 py-2 text-left">{zh ? "名單" : "Leads"}</th>
                <th className="px-3 py-2 text-left">{zh ? "轉換" : "Converted"}</th>
                <th className="px-3 py-2 text-left">{zh ? "轉換率" : "Rate"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-classz-100">
              {channels.map((c) => (
                <tr key={c.channelKey || c.channel}>
                  <td className="px-3 py-2 font-medium">{c.channel}</td>
                  <td className="px-3 py-2 tabular-nums">{c.leadCount ?? c.trialCount}</td>
                  <td className="px-3 py-2 tabular-nums">{c.convertedCount ?? c.enrollmentCount}</td>
                  <td className="px-3 py-2 tabular-nums">{Number(c.conversionRate || 0).toFixed(1)}%</td>
                </tr>
              ))}
              {!channels.length ? (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-classz-500">
                    {zh ? "無數據" : "No data"}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </AdminTable>
        </AdminTableShell>
      </AdminCard>
    </ReportShell>
  )
}
