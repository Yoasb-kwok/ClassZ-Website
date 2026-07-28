"use client"

import { useCallback, useEffect, useState } from "react"
import { Star } from "lucide-react"
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
  Stars,
  periodLabel,
  useReportMonth,
} from "@/components/admin/report-shared"

type InstructorRow = {
  rank: number
  instructor: string
  ratingScore: number
  attendanceRate: number
  totalSessions: number
  avgClassSize: number
  feedbackCount: number
  totalHours: number
}

export function TeacherRatingsReport() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const demo = isDemoSession()
  const { month, setMonth } = useReportMonth()
  const [rows, setRows] = useState<InstructorRow[]>([])
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
      const data = await apiGet<{ byInstructor?: InstructorRow[] }>(
        `/instructor-performance?month=${encodeURIComponent(month)}`,
      )
      setRows(Array.isArray(data?.byInstructor) ? data.byInstructor : [])
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

  const top = rows[0]
  const avgRating = rows.length
    ? Math.round((rows.reduce((s, r) => s + Number(r.ratingScore || 0), 0) / rows.length) * 10) / 10
    : 0

  return (
    <ReportShell
      title={zh ? "導師評價排行" : "Teacher ratings"}
      description={
        zh
          ? `依出席率、班額、堂數與課堂回饋量綜合評分（1–5 星）· ${periodLabel(month, true)}`
          : `Composite score from attendance, class size, sessions and feedback (1–5) · ${periodLabel(month, false)}`
      }
      Icon={Star}
      month={month}
      onMonthChange={setMonth}
      loading={loading}
      error={error}
      zh={zh}
    >
      <KpiGrid
        items={[
          {
            label: zh ? "導師數" : "Teachers",
            value: String(rows.length),
          },
          {
            label: zh ? "平均評分" : "Avg rating",
            value: avgRating ? avgRating.toFixed(1) : "—",
          },
          {
            label: zh ? "第一名" : "Top teacher",
            value: top?.instructor || "—",
            hint: top ? `${Number(top.ratingScore).toFixed(1)} ★` : undefined,
          },
          {
            label: zh ? "最高出席率" : "Best attendance",
            value: rows.length
              ? `${Math.max(...rows.map((r) => Number(r.attendanceRate) || 0)).toFixed(1)}%`
              : "—",
          },
        ]}
      />

      <div className="grid lg:grid-cols-2 gap-3">
        <AdminCard>
          <h2 className="text-sm font-semibold text-classz-800 mb-3">{zh ? "評分排行" : "Rating ranking"}</h2>
          <BarList
            empty={zh ? "本月尚無導師數據" : "No teacher data this month"}
            rows={rows.slice(0, 10).map((r) => ({
              key: String(r.rank),
              label: `#${r.rank} ${r.instructor}`,
              value: Number(r.ratingScore) || 0,
              display: `${Number(r.ratingScore).toFixed(1)} ★`,
            }))}
          />
        </AdminCard>

        <AdminCard>
          <AdminTableShell>
            <AdminTable>
              <thead className="bg-classz-100">
                <tr>
                  <th className="px-3 py-2 text-left">{zh ? "名次" : "Rank"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "導師" : "Teacher"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "評分" : "Score"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "出席率" : "Attendance"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "堂數" : "Sessions"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "回饋" : "Feedback"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-classz-100">
                {rows.map((r) => (
                  <tr key={`${r.rank}-${r.instructor}`}>
                    <td className="px-3 py-2 tabular-nums">{r.rank}</td>
                    <td className="px-3 py-2 font-medium">{r.instructor}</td>
                    <td className="px-3 py-2">
                      <Stars score={Number(r.ratingScore) || 0} />
                    </td>
                    <td className="px-3 py-2 tabular-nums">{Number(r.attendanceRate).toFixed(1)}%</td>
                    <td className="px-3 py-2 tabular-nums">{r.totalSessions}</td>
                    <td className="px-3 py-2 tabular-nums">{r.feedbackCount}</td>
                  </tr>
                ))}
                {!rows.length ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-classz-500">
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
