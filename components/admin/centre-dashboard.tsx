"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  DollarSign,
  Users,
  UserPlus,
  ClipboardCheck,
  AlertCircle,
  GraduationCap,
} from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { useLanguage } from "@/components/language-provider"
import { isDemoSession } from "@/components/admin/use-admin-api"
import { apiGet } from "@/lib/classz-api-client"
import { AdminCard, AdminPageFrame } from "@/components/classz-admin-ui"

type Kpis = {
  year: number
  month: number
  monthRevenue: number
  monthAttendancePresent: number
  monthAttendanceScheduled: number
  activeStudents: number
  newLeads: number
  outstandingPayments: number
  teacherUtilization: number
  monthClasses: Array<{
    id: number
    name: string
    instructor?: string
    start_time: string
    enrolled_count?: number
    capacity?: number
    location?: string
  }>
}

const ACCENT = "#0ABAB5"
const ACCENT_SOFT = "#3BC8C4"
const MUTED = "#06706D"

const MONTH_COUNT = 12
const YEAR_LOOKBACK = 4

function monthLabel(month: number, zh: boolean): string {
  if (zh) return `${month}月`
  return new Date(2000, month - 1, 1).toLocaleString("en", { month: "short" })
}

function periodLabel(year: number, month: number, zh: boolean): string {
  if (zh) return `${year}年${month}月`
  return new Date(year, month - 1, 1).toLocaleString("en", { month: "long", year: "numeric" })
}

function Sparkline({ points, color = ACCENT }: { points: number[]; color?: string }) {
  const max = Math.max(...points, 1)
  const min = Math.min(...points, 0)
  const range = Math.max(max - min, 1)
  const w = 72
  const h = 28
  const d = points
    .map((v, i) => {
      const x = (i / Math.max(points.length - 1, 1)) * w
      const y = h - ((v - min) / range) * (h - 4) - 2
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible" aria-hidden>
      <path d={d} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MetricCard({
  label,
  value,
  hint,
  Icon,
  href,
  spark,
  accent = ACCENT,
}: {
  label: string
  value: string | number
  hint?: string
  Icon: React.ComponentType<{ className?: string }>
  href?: string
  spark: number[]
  accent?: string
}) {
  const inner = (
    <AdminCard className="h-full min-h-[112px] hover:border-classz-200 transition-colors !p-4 flex flex-col justify-between">
      <div className="flex items-start justify-between gap-1.5">
        <p className="text-xs text-classz-600/80">{label}</p>
        <div className="rounded-md bg-classz-50 p-1.5">
          <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-classz-700 leading-none">{value}</p>
      <div className="mt-3 flex items-end justify-between gap-2">
        <p className="text-[11px] font-medium leading-tight" style={{ color: accent }}>
          {hint}
        </p>
        <Sparkline points={spark} color={accent} />
      </div>
    </AdminCard>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

function PeriodSelect({
  year,
  month,
  onChange,
  zh,
}: {
  year: number
  month: number
  onChange: (year: number, month: number) => void
  zh: boolean
}) {
  const years = useMemo(() => {
    const now = new Date().getFullYear()
    return Array.from({ length: YEAR_LOOKBACK + 1 }, (_, i) => now - i)
  }, [])

  const selectClass =
    "rounded-lg border border-classz-100 bg-white px-2 py-1.5 text-xs text-classz-700 focus:border-classz-300 focus:outline-none focus:ring-1 focus:ring-classz-300/30"

  return (
    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
      <select
        className={selectClass}
        value={month}
        onChange={(e) => onChange(year, Number(e.target.value))}
        aria-label={zh ? "選擇月份" : "Select month"}
      >
        {Array.from({ length: MONTH_COUNT }, (_, i) => i + 1).map((m) => (
          <option key={m} value={m}>
            {monthLabel(m, zh)}
          </option>
        ))}
      </select>
      <select
        className={selectClass}
        value={year}
        onChange={(e) => onChange(Number(e.target.value), month)}
        aria-label={zh ? "選擇年份" : "Select year"}
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {zh ? `${y}年` : y}
          </option>
        ))}
      </select>
    </div>
  )
}

function buildOverviewSeries(classes: Kpis["monthClasses"], year: number, month: number) {
  const daysInMonth = new Date(year, month, 0).getDate()
  const byDay = new Map<number, { enrolled: number; classes: number }>()
  for (let d = 1; d <= daysInMonth; d++) byDay.set(d, { enrolled: 0, classes: 0 })
  for (const c of classes || []) {
    if (!c.start_time) continue
    const dt = new Date(c.start_time)
    if (dt.getFullYear() !== year || dt.getMonth() + 1 !== month) continue
    const day = dt.getDate()
    const row = byDay.get(day) || { enrolled: 0, classes: 0 }
    row.classes += 1
    row.enrolled += Number(c.enrolled_count) || 0
    byDay.set(day, row)
  }
  return Array.from(byDay.entries()).map(([day, v]) => ({
    day: String(day),
    enrolled: v.enrolled,
    classes: v.classes,
  }))
}

export function CentreDashboard() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const demo = isDemoSession()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [kpis, setKpis] = useState<Kpis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [chartTab, setChartTab] = useState<"enrolled" | "classes">("enrolled")

  const load = useCallback(async () => {
    if (demo) {
      setKpis({
        year,
        month,
        monthRevenue: 0,
        monthAttendancePresent: 0,
        monthAttendanceScheduled: 0,
        activeStudents: 0,
        newLeads: 0,
        outstandingPayments: 0,
        teacherUtilization: 0,
        monthClasses: [],
      })
      setError(zh ? "請用中心帳號登入以載入真實數據" : "Sign in with a centre account for live data")
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await apiGet<Kpis>(`/dashboard/kpis?year=${year}&month=${month}`)
      setKpis(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed")
      setKpis(null)
    } finally {
      setLoading(false)
    }
  }, [demo, zh, year, month])

  useEffect(() => {
    load()
  }, [load])

  const k = kpis
  const period = periodLabel(year, month, zh)
  const overview = useMemo(
    () => buildOverviewSeries(k?.monthClasses || [], year, month),
    [k?.monthClasses, year, month],
  )

  const attRate =
    k && k.monthAttendanceScheduled > 0
      ? Math.round((k.monthAttendancePresent / k.monthAttendanceScheduled) * 100)
      : 0

  const sparkFrom = (n: number) => {
    const base = Math.max(n, 1)
    return [0.55, 0.62, 0.58, 0.7, 0.68, 0.82, 0.9, 1].map((r) => Math.round(base * r))
  }

  const mixData = [
    { name: zh ? "活躍學員" : "Active", value: Number(k?.activeStudents) || 0, color: ACCENT },
    { name: zh ? "新 Leads" : "Leads", value: Number(k?.newLeads) || 0, color: ACCENT_SOFT },
    {
      name: zh ? "未付" : "Outstanding",
      value: Number(k?.outstandingPayments) || 0,
      color: "#6CD6D3",
    },
    {
      name: zh ? "出席" : "Present",
      value: Number(k?.monthAttendancePresent) || 0,
      color: "#089591",
    },
  ]
  const mixTotal = mixData.reduce((s, d) => s + d.value, 0)

  const goals = [
    {
      label: zh ? "出席率" : "Attendance rate",
      value: attRate,
      target: 100,
    },
    {
      label: zh ? "導師使用率" : "Teacher utilization",
      value: Math.round(Number(k?.teacherUtilization) || 0),
      target: 100,
    },
    {
      label: zh ? "課堂填滿度" : "Class fill",
      value: (() => {
        const list = k?.monthClasses || []
        if (!list.length) return 0
        const rates = list.map((c) => {
          const cap = Number(c.capacity) || 0
          if (cap <= 0) return Number(c.enrolled_count) > 0 ? 100 : 0
          return Math.min(100, Math.round(((Number(c.enrolled_count) || 0) / cap) * 100))
        })
        return Math.round(rates.reduce((a, b) => a + b, 0) / rates.length)
      })(),
      target: 100,
    },
  ]

  return (
    <AdminPageFrame>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-classz-700 leading-tight">Dashboard</h1>
          <p className="text-xs text-classz-600/75">
            {zh ? `歡迎回來 — ${period} 營運概覽` : `Welcome back — overview for ${period}`}
          </p>
        </div>
        <PeriodSelect year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m) }} zh={zh} />
      </div>

      {error ? (
        <div role="alert" className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-7 w-7 rounded-full border-2 border-classz-100 border-t-classz-400 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5">
            <MetricCard
              label={zh ? "本月收入" : "Total Revenue"}
              value={`HK$${Number(k?.monthRevenue || 0).toLocaleString()}`}
              hint={period}
              Icon={DollarSign}
              href="/admin/payments"
              spark={sparkFrom(Number(k?.monthRevenue) || 8)}
              accent={ACCENT}
            />
            <MetricCard
              label={zh ? "活躍學員" : "Active Students"}
              value={k?.activeStudents ?? 0}
              hint={period}
              Icon={Users}
              href="/admin/students"
              spark={sparkFrom(Number(k?.activeStudents) || 6)}
              accent={ACCENT_SOFT}
            />
            <MetricCard
              label={zh ? "本月出席" : "Attendance"}
              value={
                k && k.monthAttendanceScheduled > 0
                  ? `${k.monthAttendancePresent}/${k.monthAttendanceScheduled}`
                  : "0"
              }
              hint={zh ? `出席率 ${attRate}%` : `${attRate}% rate`}
              Icon={ClipboardCheck}
              href="/admin/attendance"
              spark={sparkFrom(Number(k?.monthAttendancePresent) || 5)}
              accent={ACCENT}
            />
            <MetricCard
              label={zh ? "新 Leads" : "New Leads"}
              value={k?.newLeads ?? 0}
              hint={period}
              Icon={UserPlus}
              href="/admin/crm"
              spark={sparkFrom(Number(k?.newLeads) || 4)}
              accent={ACCENT_SOFT}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-2.5">
            <AdminCard className="xl:col-span-2 !p-3">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div>
                  <h2 className="text-sm font-semibold text-classz-700">{zh ? "營運概覽" : "Overview"}</h2>
                  <p className="text-[11px] text-classz-600/65">
                    {zh ? `${period} 每日課堂表現` : `Daily class performance for ${period}`}
                  </p>
                </div>
                <div className="flex rounded-lg bg-classz-50 p-0.5 border border-classz-100">
                  {(
                    [
                      { id: "enrolled" as const, labelZh: "報名人數", labelEn: "Enrolled" },
                      { id: "classes" as const, labelZh: "課堂數", labelEn: "Classes" },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setChartTab(tab.id)}
                      className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                        chartTab === tab.id
                          ? "bg-white text-classz-700 shadow-sm"
                          : "text-classz-600/70 hover:text-classz-700"
                      }`}
                    >
                      {zh ? tab.labelZh : tab.labelEn}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={overview} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                    <defs>
                      <linearGradient id="classzArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={ACCENT} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={ACCENT} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#CEF1F0" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid #9DE3E1",
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey={chartTab}
                      stroke={ACCENT}
                      strokeWidth={2}
                      fill="url(#classzArea)"
                      name={chartTab === "enrolled" ? (zh ? "報名" : "Enrolled") : zh ? "課堂" : "Classes"}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </AdminCard>

            <div className="space-y-2.5">
              <AdminCard className="!p-3">
                <div className="flex items-baseline justify-between mb-1">
                  <h2 className="text-sm font-semibold text-classz-700">{zh ? "營運組成" : "Ops mix"}</h2>
                  <p className="text-[11px] text-classz-600/65">{period}</p>
                </div>
                <div className="h-28 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mixData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={34}
                        outerRadius={48}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {mixData.map((d) => (
                          <Cell key={d.name} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-base font-bold text-classz-700 leading-none">{mixTotal}</p>
                    <p className="text-[9px] text-classz-600/60 uppercase tracking-wide mt-0.5">{zh ? "合計" : "Total"}</p>
                  </div>
                </div>
                <ul className="mt-1 space-y-1">
                  {mixData.map((d) => (
                    <li key={d.name} className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1.5 text-classz-600">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: d.color }} />
                        {d.name}
                      </span>
                      <span className="font-medium text-classz-700">{d.value}</span>
                    </li>
                  ))}
                </ul>
              </AdminCard>

              <AdminCard className="!p-3">
                <h2 className="text-sm font-semibold text-classz-700 mb-2">
                  {zh ? "本月目標" : "Monthly goals"}
                </h2>
                <div className="space-y-2.5">
                  {goals.map((g) => (
                    <div key={g.label}>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-classz-600">{g.label}</span>
                        <span className="font-semibold text-classz-700">{g.value}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-classz-50 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, g.value)}%`,
                            background: `linear-gradient(90deg, ${ACCENT_SOFT}, ${ACCENT})`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2.5 pt-2 border-t border-classz-50 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-classz-600">
                  <span className="inline-flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 text-classz-400" />
                    {zh ? `未付 ${k?.outstandingPayments ?? 0}` : `Outst. ${k?.outstandingPayments ?? 0}`}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <GraduationCap className="h-3 w-3 text-classz-400" />
                    {zh ? `使用率 ${k?.teacherUtilization ?? 0}%` : `Util ${k?.teacherUtilization ?? 0}%`}
                  </span>
                </div>
              </AdminCard>
            </div>
          </div>

          <AdminCard className="!p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-sm font-semibold text-classz-700">
                  {zh ? `${period} 課堂` : `Classes — ${period}`}
                </h2>
              </div>
              <Link href="/admin/schedule" className="text-xs font-medium text-classz-400 hover:text-classz-300">
                {zh ? "查看排程 →" : "View schedule →"}
              </Link>
            </div>
            <div className="overflow-x-auto rounded-lg border border-classz-100">
              <table className="w-full text-xs">
                <thead className="bg-classz-50 text-classz-600">
                  <tr>
                    <th className="text-left px-2.5 py-1.5 font-medium">{zh ? "課堂" : "Class"}</th>
                    <th className="text-left px-2.5 py-1.5 font-medium">{zh ? "時間" : "Time"}</th>
                    <th className="text-left px-2.5 py-1.5 font-medium">{zh ? "導師" : "Teacher"}</th>
                    <th className="text-left px-2.5 py-1.5 font-medium">{zh ? "人數" : "Enrolled"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-classz-50 bg-white">
                  {(k?.monthClasses || []).slice(0, 12).map((c) => (
                    <tr key={c.id} className="hover:bg-classz-50/50">
                      <td className="px-2.5 py-1.5 font-medium text-classz-700">{c.name}</td>
                      <td className="px-2.5 py-1.5 text-classz-600">
                        {c.start_time ? new Date(c.start_time).toLocaleString(zh ? "zh-HK" : "en-HK") : "—"}
                      </td>
                      <td className="px-2.5 py-1.5 text-classz-600">{c.instructor || "—"}</td>
                      <td className="px-2.5 py-1.5 text-classz-600">
                        {c.enrolled_count ?? 0}
                        {c.capacity != null ? ` / ${c.capacity}` : ""}
                      </td>
                    </tr>
                  ))}
                  {!k?.monthClasses?.length ? (
                    <tr>
                      <td colSpan={4} className="px-2.5 py-6 text-center text-classz-600/60">
                        {zh ? `${period} 暫無課堂` : `No classes in ${period}`}
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </AdminCard>
        </>
      )}
    </AdminPageFrame>
  )
}
