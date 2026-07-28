"use client"

import { useCallback, useEffect, useState } from "react"
import { Flame } from "lucide-react"
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

type PopularRow = {
  rank?: number
  program_code: string
  name: string
  enrollments: number
  sessions?: number
  fillRate?: number
}

export function PopularCoursesReport() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const demo = isDemoSession()
  const { month, setMonth } = useReportMonth()
  const [rows, setRows] = useState<PopularRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (demo) {
      setError(zh ? "請用中心帳號登入以載入真實數據" : "Sign in with a centre account for live data")
      setRows([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await apiGet<PopularRow[]>(
        `/reports/popular-courses?month=${encodeURIComponent(month)}`,
      )
      setRows(Array.isArray(result) ? result : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed")
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [demo, month, zh])

  useEffect(() => {
    load()
  }, [load])

  const totalEnroll = rows.reduce((s, r) => s + Number(r.enrollments || 0), 0)
  const top = rows[0]
  const avgFill = rows.length
    ? Math.round((rows.reduce((s, r) => s + Number(r.fillRate || 0), 0) / rows.length) * 10) / 10
    : 0

  return (
    <ReportShell
      title={zh ? "課程熱門度" : "Course popularity"}
      description={zh ? "依報名人次與滿額率排行" : "Ranked by enrollments and fill rate"}
      Icon={Flame}
      month={month}
      onMonthChange={setMonth}
      loading={loading}
      error={error}
      zh={zh}
    >
      <KpiGrid
        items={[
          { label: zh ? "課程數" : "Programs", value: String(rows.length) },
          { label: zh ? "總報名" : "Enrollments", value: String(totalEnroll) },
          {
            label: zh ? "最熱門" : "Top course",
            value: top?.name || "—",
            hint: top ? `${top.enrollments} ${zh ? "人次" : "enrolled"}` : undefined,
          },
          { label: zh ? "平均滿額率" : "Avg fill rate", value: rows.length ? `${avgFill}%` : "—" },
        ]}
      />

      <div className="grid lg:grid-cols-2 gap-3">
        <AdminCard>
          <h2 className="text-sm font-semibold text-classz-800 mb-3">{zh ? "熱門排行" : "Popular ranking"}</h2>
          <BarList
            empty={zh ? "本月尚無報名數據" : "No enrollment data this month"}
            rows={rows.slice(0, 10).map((r, i) => ({
              key: r.program_code || String(i),
              label: `#${r.rank || i + 1} ${r.name || r.program_code}`,
              value: Number(r.enrollments) || 0,
              display: String(r.enrollments ?? 0),
            }))}
          />
        </AdminCard>

        <AdminCard>
          <AdminTableShell>
            <AdminTable>
              <thead className="bg-classz-100">
                <tr>
                  <th className="px-3 py-2 text-left">{zh ? "名次" : "Rank"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "課程" : "Course"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "報名" : "Enroll"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "堂次" : "Sessions"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "滿額率" : "Fill"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-classz-100">
                {rows.map((r, i) => (
                  <tr key={r.program_code || i}>
                    <td className="px-3 py-2 tabular-nums">{r.rank || i + 1}</td>
                    <td className="px-3 py-2">
                      <div className="font-medium">{r.name || "—"}</div>
                      <div className="text-xs text-classz-400 font-mono">{r.program_code}</div>
                    </td>
                    <td className="px-3 py-2 tabular-nums">{r.enrollments}</td>
                    <td className="px-3 py-2 tabular-nums">{r.sessions ?? "—"}</td>
                    <td className="px-3 py-2 tabular-nums">
                      {r.fillRate != null ? `${Number(r.fillRate).toFixed(1)}%` : "—"}
                    </td>
                  </tr>
                ))}
                {!rows.length ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-classz-500">
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
