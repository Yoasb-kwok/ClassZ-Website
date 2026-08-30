"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  DollarSign,
  Users,
  UserPlus,
  ClipboardCheck,
  AlertCircle,
  GraduationCap,
  Plus,
  X,
  ListTodo,
  GripHorizontal,
  Pencil,
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
import { apiGet, apiPut } from "@/lib/classz-api-client"
import { isTrialCourseType, isWorkshopCourseType } from "@/lib/course-types"
import {
  AdminCard,
  AdminGhostButton,
  AdminModal,
  AdminPageFrame,
  AdminPrimaryButton,
} from "@/components/classz-admin-ui"
import {
  CATALOG_GROUPS,
  DEFAULT_DASHBOARD_LAYOUT,
  GOAL_METRICS,
  GRID_COLS,
  GRID_GAP,
  GRID_MAX_H,
  GRID_MIN_H,
  GRID_MIN_W,
  GRID_ROW,
  WIDGET_CATALOG,
  type DashboardLayout,
  type GoalConfig,
  type GoalMetric,
  type WidgetConfig,
  type WidgetId,
  clampGrid,
  defaultWidget,
  goalIsPercent,
  moveWidget,
  resizeWidget,
  sanitizeDashboardLayout,
} from "@/lib/dashboard-layout"

type Kpis = {
  monthRevenue: number
  monthAttendancePresent: number
  monthAttendanceScheduled: number
  activeStudents: number
  newLeads: number
  outstandingPayments: number
  teacherUtilization: number
  monthRevenueChangePct?: number
  activeStudentsChangePct?: number
  attendanceChangePct?: number
  newLeadsChangePct?: number
  monthClasses: Array<{
    id: number
    name: string
    instructor?: string
    start_time: string
    enrolled_count?: number
    capacity?: number
  }>
}

type ExtraData = {
  teachers: number
  pendingTrials: number
  pendingApplications: number
  pendingEnrollmentRequests: number
  pendingOrders: number
  openTasks: Array<{ id: number; title: string; status: string }>
  waitlistCount: number
  popular: Array<{ name: string; enrollments: number; fillRate: number }>
  conversionRate: number
  trialCount: number
  enrollmentCount: number
  listingPrograms: number
  listingWorkshops: number
  listingTrials: number
  todayClasses: Array<{
    id: number
    name: string
    instructor?: string
    start_time: string
    enrolled_count?: number
    capacity?: number
  }>
  lowAttendance: Array<{ className: string; avgAttendance: number; fillRate: number }>
  instructorsPerf: Array<{ instructor: string; totalSessions: number; totalStudents: number; attendanceRate: number }>
  renewalRate: number
  churnRate: number
  totalExpiring: number
}

const ACCENT = "#0ABAB5"
const ACCENT_MAGENTA = "#BF07D0"
const ACCENT_ORANGE = "#FF8400"
const ACCENT_CORAL = "#DB5461"
const MUTED = "#717171"
const MONTH_COUNT = 12
const YEAR_LOOKBACK = 4
const LAYOUT_STORAGE_KEY = "classz_dashboard_layout_v2"

const EMPTY_EXTRA: ExtraData = {
  teachers: 0,
  pendingTrials: 0,
  pendingApplications: 0,
  pendingEnrollmentRequests: 0,
  pendingOrders: 0,
  openTasks: [],
  waitlistCount: 0,
  popular: [],
  conversionRate: 0,
  trialCount: 0,
  enrollmentCount: 0,
  listingPrograms: 0,
  listingWorkshops: 0,
  listingTrials: 0,
  todayClasses: [],
  lowAttendance: [],
  instructorsPerf: [],
  renewalRate: 0,
  churnRate: 0,
  totalExpiring: 0,
}

function monthLabel(month: number, zh: boolean): string {
  if (zh) return `${month}月`
  return new Date(2000, month - 1, 1).toLocaleString("en", { month: "short" })
}

function periodLabel(year: number, month: number, zh: boolean): string {
  if (zh) return `${year}年${month}月`
  return new Date(year, month - 1, 1).toLocaleString("en", { month: "long", year: "numeric" })
}

function formatMomChange(pct: number | undefined, zh: boolean): { text: string; up: boolean | null } {
  if (pct == null || Number.isNaN(Number(pct))) {
    return { text: zh ? "較上月 —" : "vs last month —", up: null }
  }
  const n = Math.round(Number(pct) * 10) / 10
  if (n === 0) return { text: zh ? "較上月持平" : "vs last month flat", up: null }
  const abs = Math.abs(n)
  const display = Number.isInteger(abs) ? String(abs) : abs.toFixed(1)
  if (n > 0) return { text: zh ? `較上月上升 ${display}%` : `${display}% up vs last month`, up: true }
  return { text: zh ? `較上月下降 ${display}%` : `${display}% down vs last month`, up: false }
}

function goalMetricLabel(metric: GoalMetric, zh: boolean) {
  const map: Record<GoalMetric, [string, string]> = {
    attendance: ["出席率", "Attendance rate"],
    utilization: ["導師使用率", "Teacher utilization"],
    fill: ["課堂填滿度", "Class fill"],
    revenue: ["本月收入", "Revenue"],
    leads: ["新 Leads", "New leads"],
    students: ["活躍學員", "Active students"],
  }
  return zh ? map[metric][0] : map[metric][1]
}

function MetricCard({
  label,
  value,
  hint,
  Icon,
  href,
  changePct,
  zh,
  accent = ACCENT,
}: {
  label: string
  value: string | number
  hint?: string
  Icon: React.ComponentType<{ className?: string }>
  href?: string
  changePct?: number
  zh: boolean
  accent?: string
}) {
  const mom = formatMomChange(changePct, zh)
  const momColor = mom.up === true ? ACCENT : mom.up === false ? ACCENT_CORAL : MUTED
  const inner = (
    <AdminCard className="h-full hover:border-classz-200 transition-colors !p-3 flex flex-col justify-between">
      <div className="flex items-start justify-between gap-1.5">
        <p className="text-xs text-classz-600/80">{label}</p>
        <div className="rounded-md bg-classz-50 p-1.5">
          <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
        </div>
      </div>
      <p className="mt-2 text-xl font-bold tracking-tight text-classz-700 leading-none">{value}</p>
      <div className="mt-2 flex items-end justify-between gap-2">
        <p className="text-[11px] font-medium leading-tight" style={{ color: accent }}>{hint}</p>
        {changePct != null ? (
          <p className="text-[11px] font-semibold leading-tight text-right shrink-0" style={{ color: momColor }}>
            {mom.up === true ? "↑ " : mom.up === false ? "↓ " : ""}
            {mom.text}
          </p>
        ) : null}
      </div>
    </AdminCard>
  )
  return href ? <Link href={href} className="block h-full">{inner}</Link> : inner
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
      <select className={selectClass} value={month} onChange={(e) => onChange(year, Number(e.target.value))}>
        {Array.from({ length: MONTH_COUNT }, (_, i) => i + 1).map((m) => (
          <option key={m} value={m}>{monthLabel(m, zh)}</option>
        ))}
      </select>
      <select className={selectClass} value={year} onChange={(e) => onChange(Number(e.target.value), month)}>
        {years.map((y) => (
          <option key={y} value={y}>{zh ? `${y}年` : y}</option>
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
  return Array.from(byDay.entries()).map(([day, v]) => ({ day: String(day), enrolled: v.enrolled, classes: v.classes }))
}

function asList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[]
  if (data && typeof data === "object" && Array.isArray((data as { items?: unknown }).items)) {
    return (data as { items: T[] }).items
  }
  return []
}

export function CentreDashboard() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const demo = isDemoSession()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [kpis, setKpis] = useState<Kpis | null>(null)
  const [extra, setExtra] = useState<ExtraData>(EMPTY_EXTRA)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [chartTab, setChartTab] = useState<"enrolled" | "classes">("enrolled")
  const [layout, setLayout] = useState<DashboardLayout>(DEFAULT_DASHBOARD_LAYOUT)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [customizing, setCustomizing] = useState(false)
  const [narrow, setNarrow] = useState(false)
  const layoutRef = useRef(layout)
  const gridRef = useRef<HTMLDivElement | null>(null)
  const dragOrigin = useRef<WidgetConfig[] | null>(null)
  const pickerSnapshot = useRef<DashboardLayout | null>(null)
  const sessionSnapshot = useRef<DashboardLayout | null>(null)
  const customizingRef = useRef(false)
  const [draggingId, setDraggingId] = useState<WidgetId | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  layoutRef.current = layout
  customizingRef.current = customizing

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    const sync = () => setNarrow(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  const ids = useMemo(() => new Set(layout.widgets.map((w) => w.id)), [layout.widgets])
  const monthKey = `${year}-${String(month).padStart(2, "0")}`

  const loadKpis = useCallback(async () => {
    if (demo) {
      setKpis({
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
    loadKpis()
  }, [loadKpis])

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const cached = window.localStorage.getItem(LAYOUT_STORAGE_KEY)
      if (cached) setLayout(sanitizeDashboardLayout(JSON.parse(cached)))
    } catch { /* ignore */ }
    if (demo) return
    apiGet<DashboardLayout>("/dashboard/layout")
      .then((data) => {
        const next = sanitizeDashboardLayout(data)
        setLayout(next)
        window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(next))
      })
      .catch(() => { /* keep cache */ })
  }, [demo])

  useEffect(() => {
    if (demo || !layout.widgets.length) {
      setExtra(EMPTY_EXTRA)
      return
    }
    let cancelled = false
    const need = (id: WidgetId) => ids.has(id)
    ;(async () => {
      const next = { ...EMPTY_EXTRA }
      const jobs: Array<Promise<void>> = []
      if (need("teachers")) {
        jobs.push(
          apiGet<unknown[]>("/instructors")
            .then((rows) => { next.teachers = asList(rows).length })
            .catch(() => {}),
        )
      }
      if (need("pending") || need("trials_pending")) {
        jobs.push(
          apiGet<{
            pendingTrials?: number
            pendingApplications?: number
            pendingEnrollmentRequests?: number
            pendingOrders?: number
          }>("/pending-counts")
            .then((c) => {
              next.pendingTrials = Number(c?.pendingTrials) || 0
              next.pendingApplications = Number(c?.pendingApplications) || 0
              next.pendingEnrollmentRequests = Number(c?.pendingEnrollmentRequests) || 0
              next.pendingOrders = Number(c?.pendingOrders) || 0
            })
            .catch(() => {}),
        )
      }
      if (need("tasks")) {
        jobs.push(
          apiGet<Array<{ id: number; title: string; status: string }>>("/tasks")
            .then((rows) => {
              next.openTasks = asList<{ id: number; title: string; status: string }>(rows).filter(
                (t) => t.status === "todo" || t.status === "in_progress",
              )
            })
            .catch(() => {}),
        )
      }
      if (need("waitlist")) {
        jobs.push(
          apiGet<unknown[]>("/waitlist")
            .then((rows) => { next.waitlistCount = asList(rows).length })
            .catch(() => {}),
        )
      }
      if (need("popular")) {
        jobs.push(
          apiGet<Array<{ name: string; enrollments: number; fillRate: number }>>(`/reports/popular-courses?month=${monthKey}`)
            .then((rows) => { next.popular = asList(rows).slice(0, 6) })
            .catch(() => {}),
        )
      }
      if (need("conversion")) {
        jobs.push(
          apiGet<{ trialToEnrollmentRate?: number; totalTrialCount?: number; newEnrollmentCount?: number }>(
            `/conversion-funnel?month=${monthKey}`,
          )
            .then((c) => {
              next.conversionRate = Number(c?.trialToEnrollmentRate) || 0
              next.trialCount = Number(c?.totalTrialCount) || 0
              next.enrollmentCount = Number(c?.newEnrollmentCount) || 0
            })
            .catch(() => {}),
        )
      }
      if (need("courses")) {
        jobs.push(
          apiGet<Array<{ course_type?: string }>>("/courses")
            .then((rows) => {
              const list = asList<{ course_type?: string }>(rows)
              next.listingTrials = list.filter((c) => isTrialCourseType(c.course_type)).length
              next.listingWorkshops = list.filter((c) => isWorkshopCourseType(c.course_type)).length
              next.listingPrograms = list.length - next.listingTrials - next.listingWorkshops
            })
            .catch(() => {}),
        )
      }
      if (need("today")) {
        jobs.push(
          apiGet<ExtraData["todayClasses"]>("/dashboard/today-classes")
            .then((rows) => { next.todayClasses = asList(rows).slice(0, 12) })
            .catch(() => {}),
        )
      }
      if (need("class_health")) {
        jobs.push(
          apiGet<{ lowAttendanceClasses?: ExtraData["lowAttendance"] }>(`/class-health?month=${monthKey}`)
            .then((c) => { next.lowAttendance = asList(c?.lowAttendanceClasses).slice(0, 8) })
            .catch(() => {}),
        )
      }
      if (need("instructor_perf")) {
        jobs.push(
          apiGet<{ byInstructor?: ExtraData["instructorsPerf"] }>(`/instructor-performance?month=${monthKey}`)
            .then((c) => { next.instructorsPerf = asList(c?.byInstructor).slice(0, 8) })
            .catch(() => {}),
        )
      }
      if (need("renewal")) {
        jobs.push(
          apiGet<{ renewalRate?: number; churnRate?: number; totalExpiring?: number }>(`/renewal-churn?month=${monthKey}`)
            .then((c) => {
              next.renewalRate = Number(c?.renewalRate) || 0
              next.churnRate = Number(c?.churnRate) || 0
              next.totalExpiring = Number(c?.totalExpiring) || 0
            })
            .catch(() => {}),
        )
      }
      await Promise.all(jobs)
      if (!cancelled) setExtra(next)
    })()
    return () => {
      cancelled = true
    }
  }, [demo, ids, layout.widgets.length, monthKey])

  function persistLayout(next: DashboardLayout, immediate = false, toServer?: boolean) {
    const clean = sanitizeDashboardLayout(next)
    setLayout(clean)
    layoutRef.current = clean
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(clean))
    }
    const writeApi = toServer ?? !customizingRef.current
    if (demo || !writeApi) return
    const write = async () => {
      try {
        const saved = await apiPut<DashboardLayout>("/dashboard/layout", clean)
        const synced = sanitizeDashboardLayout(saved)
        setLayout(synced)
        layoutRef.current = synced
        window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(synced))
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed")
      }
    }
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    if (immediate) {
      void write()
      return
    }
    saveTimer.current = setTimeout(() => { void write() }, 350)
  }

  function beginCustomize() {
    if (customizingRef.current) return
    sessionSnapshot.current = layoutRef.current
    customizingRef.current = true
    setCustomizing(true)
  }

  function finishCustomize() {
    pickerSnapshot.current = null
    sessionSnapshot.current = null
    customizingRef.current = false
    setCustomizing(false)
    setPickerOpen(false)
    persistLayout(layoutRef.current, true, true)
  }

  function cancelCustomize() {
    const snap = sessionSnapshot.current
    pickerSnapshot.current = null
    sessionSnapshot.current = null
    customizingRef.current = false
    setCustomizing(false)
    setPickerOpen(false)
    if (snap) persistLayout(snap, true, true)
  }

  function openPicker() {
    beginCustomize()
    pickerSnapshot.current = layoutRef.current
    setPickerOpen(true)
  }

  function finishPicker() {
    pickerSnapshot.current = null
    setPickerOpen(false)
  }

  function cancelPicker() {
    const snapshot = pickerSnapshot.current
    pickerSnapshot.current = null
    setPickerOpen(false)
    if (snapshot) persistLayout(snapshot, true, false)
  }

  function addWidget(id: WidgetId) {
    if (layout.widgets.some((w) => w.id === id)) {
      removeWidget(id)
      return
    }
    persistLayout({ ...layout, widgets: [...layout.widgets, defaultWidget(id, layout.widgets)] }, true)
  }

  function removeWidget(id: WidgetId) {
    persistLayout({ ...layout, widgets: layout.widgets.filter((w) => w.id !== id) }, true)
  }

  function applyWidgets(widgets: WidgetConfig[]) {
    const next = { ...layoutRef.current, widgets }
    setLayout(next)
    layoutRef.current = next
  }

  function startResize(event: React.PointerEvent, widget: WidgetConfig) {
    event.preventDefault()
    event.stopPropagation()
    if (narrow || !customizingRef.current) return
    const grid = gridRef.current
    if (!grid) return
    const target = event.currentTarget
    target.setPointerCapture(event.pointerId)
    dragOrigin.current = layoutRef.current.widgets
    const cellW = (grid.clientWidth - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS
    const cellH = GRID_ROW + GRID_GAP
    const startX = event.clientX
    const startY = event.clientY
    const startW = widget.w
    const startH = widget.h
    const move = (ev: PointerEvent) => {
      const origin = dragOrigin.current
      if (!origin) return
      const w = clampGrid(startW + (ev.clientX - startX) / cellW, GRID_MIN_W, GRID_COLS)
      const h = clampGrid(startH + (ev.clientY - startY) / cellH, GRID_MIN_H, GRID_MAX_H)
      applyWidgets(resizeWidget(origin, widget.id, w, h))
    }
    const up = (ev: PointerEvent) => {
      target.releasePointerCapture(ev.pointerId)
      target.removeEventListener("pointermove", move)
      target.removeEventListener("pointerup", up)
      dragOrigin.current = null
      persistLayout(layoutRef.current, true)
    }
    target.addEventListener("pointermove", move)
    target.addEventListener("pointerup", up)
  }

  function startMove(event: React.PointerEvent, widget: WidgetConfig) {
    event.preventDefault()
    event.stopPropagation()
    if (narrow || !customizingRef.current) return
    const grid = gridRef.current
    if (!grid) return
    const target = event.currentTarget
    target.setPointerCapture(event.pointerId)
    dragOrigin.current = layoutRef.current.widgets
    setDraggingId(widget.id)
    const cellW = (grid.clientWidth - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS
    const cellH = GRID_ROW + GRID_GAP
    const startX = event.clientX
    const startY = event.clientY
    const originX = widget.x
    const originY = widget.y
    const move = (ev: PointerEvent) => {
      const origin = dragOrigin.current
      if (!origin) return
      const x = originX + (ev.clientX - startX) / cellW
      const y = originY + (ev.clientY - startY) / cellH
      applyWidgets(moveWidget(origin, widget.id, x, y))
    }
    const up = (ev: PointerEvent) => {
      target.releasePointerCapture(ev.pointerId)
      target.removeEventListener("pointermove", move)
      target.removeEventListener("pointerup", up)
      dragOrigin.current = null
      setDraggingId(null)
      persistLayout(layoutRef.current, true)
    }
    target.addEventListener("pointermove", move)
    target.addEventListener("pointerup", up)
  }

  const k = kpis
  const displayWidgets = useMemo(() => {
    if (!narrow) return layout.widgets
    return [...layout.widgets].sort((a, b) => a.y - b.y || a.x - b.x)
  }, [layout.widgets, narrow])
  const period = periodLabel(year, month, zh)
  const overview = useMemo(
    () => buildOverviewSeries(k?.monthClasses || [], year, month),
    [k?.monthClasses, year, month],
  )
  const attRate =
    k && k.monthAttendanceScheduled > 0
      ? Math.round((k.monthAttendancePresent / k.monthAttendanceScheduled) * 100)
      : 0
  const fillRate = (() => {
    const list = k?.monthClasses || []
    if (!list.length) return 0
    const rates = list.map((c) => {
      const cap = Number(c.capacity) || 0
      if (cap <= 0) return Number(c.enrolled_count) > 0 ? 100 : 0
      return Math.min(100, Math.round(((Number(c.enrolled_count) || 0) / cap) * 100))
    })
    return Math.round(rates.reduce((a, b) => a + b, 0) / rates.length)
  })()
  const utilRate = Math.round(Number(k?.teacherUtilization) || 0)

  function goalCurrent(metric: GoalMetric): number {
    if (metric === "attendance") return attRate
    if (metric === "utilization") return utilRate
    if (metric === "fill") return fillRate
    if (metric === "revenue") return Number(k?.monthRevenue) || 0
    if (metric === "leads") return Number(k?.newLeads) || 0
    return Number(k?.activeStudents) || 0
  }

  function formatGoalValue(metric: GoalMetric, n: number) {
    if (goalIsPercent(metric)) return `${n}%`
    if (metric === "revenue") return `HK$${n.toLocaleString()}`
    return String(n)
  }

  const mixData = [
    { name: zh ? "活躍學員" : "Active", value: Number(k?.activeStudents) || 0, color: ACCENT },
    { name: zh ? "新 Leads" : "Leads", value: Number(k?.newLeads) || 0, color: ACCENT_MAGENTA },
    { name: zh ? "未付" : "Outstanding", value: Number(k?.outstandingPayments) || 0, color: ACCENT_ORANGE },
    { name: zh ? "出席" : "Present", value: Number(k?.monthAttendancePresent) || 0, color: MUTED },
  ]
  const mixTotal = mixData.reduce((s, d) => s + d.value, 0)
  const usedGoalMetrics = new Set(layout.goals.map((g) => g.metric))
  const unusedGoalMetrics = GOAL_METRICS.filter((m) => !usedGoalMetrics.has(m))

  function renderBody(id: WidgetId) {
    if (id === "revenue") {
      return <MetricCard label={zh ? "本月收入" : "Total Revenue"} value={`HK$${Number(k?.monthRevenue || 0).toLocaleString()}`} hint={period} Icon={DollarSign} href="/admin/payments" changePct={k?.monthRevenueChangePct} zh={zh} />
    }
    if (id === "outstanding") {
      return <MetricCard label={zh ? "未付款項" : "Outstanding"} value={k?.outstandingPayments ?? 0} hint={zh ? "待付／失敗訂單" : "Unpaid / failed"} Icon={AlertCircle} href="/admin/payments" zh={zh} accent={ACCENT_ORANGE} />
    }
    if (id === "students") {
      return <MetricCard label={zh ? "活躍學員" : "Active Students"} value={k?.activeStudents ?? 0} hint={period} Icon={Users} href="/admin/students" changePct={k?.activeStudentsChangePct} zh={zh} />
    }
    if (id === "teachers") {
      return <MetricCard label={zh ? "導師人數" : "Teachers"} value={extra.teachers} hint={zh ? "中心導師" : "Centre teachers"} Icon={GraduationCap} href="/admin/teachers" zh={zh} />
    }
    if (id === "attendance") {
      return (
        <MetricCard
          label={zh ? "本月出席" : "Attendance"}
          value={k && k.monthAttendanceScheduled > 0 ? `${k.monthAttendancePresent}/${k.monthAttendanceScheduled}` : "0"}
          hint={zh ? `出席率 ${attRate}%` : `${attRate}% rate`}
          Icon={ClipboardCheck}
          href="/admin/attendance"
          changePct={k?.attendanceChangePct}
          zh={zh}
          accent={ACCENT_ORANGE}
        />
      )
    }
    if (id === "utilization") {
      return <MetricCard label={zh ? "導師使用率" : "Utilization"} value={`${utilRate}%`} hint={period} Icon={GraduationCap} href="/admin/schedule" zh={zh} />
    }
    if (id === "leads") {
      return <MetricCard label={zh ? "新 Leads" : "New Leads"} value={k?.newLeads ?? 0} hint={period} Icon={UserPlus} href="/admin/crm" changePct={k?.newLeadsChangePct} zh={zh} accent={ACCENT_MAGENTA} />
    }
    if (id === "trials_pending") {
      return <MetricCard label={zh ? "待處理試堂" : "Pending trials"} value={extra.pendingTrials} hint={zh ? "試堂申請" : "Trial applications"} Icon={UserPlus} href="/admin/trials" zh={zh} accent={ACCENT_MAGENTA} />
    }
    if (id === "courses") {
      return (
        <AdminCard className="h-full !p-3">
          <p className="text-xs text-classz-600/80 mb-2">{zh ? "上架數量" : "Listings"}</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Link href="/admin/programs" className="rounded-lg bg-classz-50 py-2">
              <p className="text-lg font-bold text-classz-700">{extra.listingPrograms}</p>
              <p className="text-[10px] text-classz-500">{zh ? "課程" : "Courses"}</p>
            </Link>
            <Link href="/admin/workshops" className="rounded-lg bg-classz-50 py-2">
              <p className="text-lg font-bold text-classz-700">{extra.listingWorkshops}</p>
              <p className="text-[10px] text-classz-500">{zh ? "工作坊" : "Workshops"}</p>
            </Link>
            <Link href="/admin/trials" className="rounded-lg bg-classz-50 py-2">
              <p className="text-lg font-bold text-classz-700">{extra.listingTrials}</p>
              <p className="text-[10px] text-classz-500">{zh ? "試堂" : "Trials"}</p>
            </Link>
          </div>
        </AdminCard>
      )
    }
    if (id === "pending") {
      const rows = [
        { href: "/admin/trials", zh: "試堂申請", en: "Trials", n: extra.pendingTrials },
        { href: "/admin/trials", zh: "報名請求", en: "Enrolments", n: extra.pendingEnrollmentRequests },
        { href: "/admin/crm", zh: "其他申請", en: "Applications", n: extra.pendingApplications },
        { href: "/admin/payments", zh: "未付訂單", en: "Orders", n: extra.pendingOrders },
      ]
      return (
        <AdminCard className="h-full !p-3 overflow-auto">
          <h2 className="text-sm font-semibold text-classz-700 mb-2">{zh ? "待辦事項" : "Pending items"}</h2>
          <ul className="space-y-1.5">
            {rows.map((r) => (
              <li key={r.en}>
                <Link href={r.href} className="flex items-center justify-between text-xs hover:text-classz-700">
                  <span className="text-classz-600">{zh ? r.zh : r.en}</span>
                  <span className="font-semibold text-classz-700">{r.n}</span>
                </Link>
              </li>
            ))}
          </ul>
        </AdminCard>
      )
    }
    if (id === "tasks") {
      return (
        <AdminCard className="h-full !p-3 overflow-auto">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-classz-700">{zh ? "任務" : "Tasks"}</h2>
            <Link href="/admin/tasks" className="text-[11px] text-classz-400">{zh ? "全部 →" : "All →"}</Link>
          </div>
          {extra.openTasks.length ? (
            <ul className="space-y-1.5">
              {extra.openTasks.slice(0, 8).map((t) => (
                <li key={t.id} className="text-xs text-classz-700 truncate">{t.title}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-classz-500">{zh ? "沒有未完成任務" : "No open tasks"}</p>
          )}
        </AdminCard>
      )
    }
    if (id === "waitlist") {
      return <MetricCard label={zh ? "候補名單" : "Waitlist"} value={extra.waitlistCount} hint={zh ? "目前候補人數" : "People waiting"} Icon={ListTodo} href="/admin/crm" zh={zh} />
    }
    if (id === "overview") {
      return (
        <AdminCard className="h-full !p-3 flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div>
              <h2 className="text-sm font-semibold text-classz-700">{zh ? "營運概覽" : "Overview"}</h2>
              <p className="text-[11px] text-classz-600/65">{zh ? `${period} 每日課堂表現` : `Daily class performance for ${period}`}</p>
            </div>
            <div className="flex rounded-lg bg-classz-50 p-0.5 border border-classz-100">
              {([{ id: "enrolled" as const, labelZh: "報名人數", labelEn: "Enrolled" }, { id: "classes" as const, labelZh: "課堂數", labelEn: "Classes" }] as const).map((tab) => (
                <button key={tab.id} type="button" onClick={() => setChartTab(tab.id)} className={`px-2.5 py-1 text-[11px] font-medium rounded-md ${chartTab === tab.id ? "bg-white text-classz-700 shadow-sm" : "text-classz-600/70"}`}>
                  {zh ? tab.labelZh : tab.labelEn}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 min-h-[8rem]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overview} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="classzArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ACCENT} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={ACCENT} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7F8F7" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #9DE3E1", fontSize: 12 }} />
                <Area type="monotone" dataKey={chartTab} stroke={ACCENT} strokeWidth={2} fill="url(#classzArea)" name={chartTab === "enrolled" ? (zh ? "報名" : "Enrolled") : zh ? "課堂" : "Classes"} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>
      )
    }
    if (id === "mix") {
      return (
        <AdminCard className="h-full !p-3 overflow-auto">
          <div className="flex items-baseline justify-between mb-1">
            <h2 className="text-sm font-semibold text-classz-700">{zh ? "營運組成" : "Ops mix"}</h2>
            <p className="text-[11px] text-classz-600/65">{period}</p>
          </div>
          <div className="h-28 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={mixData} dataKey="value" nameKey="name" innerRadius={34} outerRadius={48} paddingAngle={2} stroke="none">
                  {mixData.map((d) => <Cell key={d.name} fill={d.color} />)}
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
      )
    }
    if (id === "goals") {
      return (
        <AdminCard className="h-full !p-3 overflow-auto">
          <h2 className="text-sm font-semibold text-classz-700 mb-2">{zh ? "本月目標" : "Monthly goals"}</h2>
          <div className="space-y-2.5">
            {layout.goals.map((g) => {
              const current = goalCurrent(g.metric)
              const pct = g.target > 0 ? Math.min(100, Math.round((current / g.target) * 100)) : 0
              const met = current >= g.target
              return (
                <div key={g.id}>
                  <div className="flex items-center justify-between text-[11px] mb-1 gap-2">
                    <span className="text-classz-600">{goalMetricLabel(g.metric, zh)}</span>
                    <span className={`font-semibold shrink-0 ${met ? "text-brand-teal" : "text-classz-700"}`}>
                      {formatGoalValue(g.metric, current)}
                      <span className="font-medium text-classz-500"> / {formatGoalValue(g.metric, g.target)}</span>
                      {met ? (zh ? " 已達標" : " Met") : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <select
                      className="flex-1 rounded-md border border-classz-100 px-2 py-1 text-[11px]"
                      value={g.metric}
                      onChange={(e) => {
                        const metric = e.target.value as GoalMetric
                        persistLayout({
                          ...layout,
                          goals: layout.goals.map((row) => (row.id === g.id ? { ...row, metric, id: metric } : row)),
                        })
                      }}
                    >
                      {GOAL_METRICS.map((m) => (
                        <option key={m} value={m} disabled={m !== g.metric && usedGoalMetrics.has(m)}>
                          {goalMetricLabel(m, zh)}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min={1}
                      max={goalIsPercent(g.metric) ? 100 : undefined}
                      className="w-16 rounded-md border border-classz-100 px-2 py-1 text-[11px]"
                      value={g.target}
                      onChange={(e) => {
                        const target = Number(e.target.value)
                        persistLayout({
                          ...layout,
                          goals: layout.goals.map((row) =>
                            row.id === g.id ? { ...row, target: Number.isFinite(target) && target > 0 ? target : row.target } : row,
                          ),
                        })
                      }}
                    />
                    <button type="button" className="text-[11px] text-brand-coral" onClick={() => persistLayout({ ...layout, goals: layout.goals.filter((row) => row.id !== g.id) })}>
                      {zh ? "刪" : "Del"}
                    </button>
                  </div>
                  <div className="h-1.5 rounded-full bg-classz-50 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: met ? ACCENT : `linear-gradient(90deg, ${ACCENT_ORANGE}, ${ACCENT})` }} />
                  </div>
                </div>
              )
            })}
          </div>
          {unusedGoalMetrics.length ? (
            <button
              type="button"
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-classz-600"
              onClick={() => {
                const metric = unusedGoalMetrics[0]
                const row: GoalConfig = { id: `${metric}-${Date.now()}`, metric, target: goalIsPercent(metric) ? 80 : metric === "revenue" ? 10000 : 20 }
                persistLayout({ ...layout, goals: [...layout.goals, row] })
              }}
            >
              <Plus className="h-3 w-3" />
              {zh ? "新增目標" : "Add goal"}
            </button>
          ) : null}
        </AdminCard>
      )
    }
    if (id === "popular") {
      return (
        <AdminCard className="h-full !p-3 overflow-auto">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-classz-700">{zh ? "熱門課程" : "Popular courses"}</h2>
            <Link href="/admin/reports/popular-courses" className="text-[11px] text-classz-400">{zh ? "報表 →" : "Report →"}</Link>
          </div>
          {extra.popular.length ? (
            <ul className="space-y-1.5">
              {extra.popular.map((p, i) => (
                <li key={`${p.name}-${i}`} className="flex items-center justify-between text-xs gap-2">
                  <span className="truncate text-classz-700">{p.name || "—"}</span>
                  <span className="shrink-0 text-classz-500">{p.enrollments}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-classz-500">{zh ? "本月暫無資料" : "No data this month"}</p>
          )}
        </AdminCard>
      )
    }
    if (id === "conversion") {
      return (
        <AdminCard className="h-full !p-3">
          <h2 className="text-sm font-semibold text-classz-700 mb-2">{zh ? "試堂轉換" : "Trial conversion"}</h2>
          <p className="text-2xl font-bold text-classz-700">{extra.conversionRate}%</p>
          <p className="mt-1 text-[11px] text-classz-500">
            {zh ? `${extra.trialCount} 宗試堂 → ${extra.enrollmentCount} 報名` : `${extra.trialCount} trials → ${extra.enrollmentCount} enrolments`}
          </p>
        </AdminCard>
      )
    }
    if (id === "renewal") {
      return (
        <AdminCard className="h-full !p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-classz-700">{zh ? "續期／流失" : "Renewal / churn"}</h2>
            <Link href="/admin/reports/retention" className="text-[11px] text-classz-400">{zh ? "報表 →" : "Report →"}</Link>
          </div>
          <div className="flex items-end gap-4">
            <div>
              <p className="text-2xl font-bold text-classz-700">{Math.round(extra.renewalRate)}%</p>
              <p className="text-[11px] text-classz-500">{zh ? "續期率" : "Renewal"}</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-classz-700">{Math.round(extra.churnRate)}%</p>
              <p className="text-[11px] text-classz-500">{zh ? "流失率" : "Churn"}</p>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-classz-500">
            {zh ? `${extra.totalExpiring} 張即將到期` : `${extra.totalExpiring} expiring`}
          </p>
        </AdminCard>
      )
    }
    if (id === "today") {
      return (
        <AdminCard className="h-full !p-3 overflow-auto">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-classz-700">{zh ? "今日課堂" : "Today's classes"}</h2>
            <Link href="/admin/schedule" className="text-[11px] text-classz-400">{zh ? "排程 →" : "Schedule →"}</Link>
          </div>
          {extra.todayClasses.length ? (
            <ul className="space-y-1.5">
              {extra.todayClasses.map((c) => (
                <li key={c.id} className="flex items-center justify-between text-xs gap-2">
                  <span className="truncate text-classz-700">{c.name}</span>
                  <span className="shrink-0 text-classz-500">
                    {c.start_time ? new Date(c.start_time).toLocaleTimeString(zh ? "zh-HK" : "en-HK", { hour: "2-digit", minute: "2-digit" }) : ""}
                    {" · "}
                    {c.enrolled_count ?? 0}{c.capacity != null ? `/${c.capacity}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-classz-500">{zh ? "今天沒有課堂" : "No classes today"}</p>
          )}
        </AdminCard>
      )
    }
    if (id === "class_health") {
      return (
        <AdminCard className="h-full !p-3 overflow-auto">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-classz-700">{zh ? "課堂健康" : "Class health"}</h2>
            <Link href="/admin/reports" className="text-[11px] text-classz-400">{zh ? "報表 →" : "Report →"}</Link>
          </div>
          {extra.lowAttendance.length ? (
            <ul className="space-y-1.5">
              {extra.lowAttendance.map((c, i) => (
                <li key={`${c.className}-${i}`} className="flex items-center justify-between text-xs gap-2">
                  <span className="truncate text-classz-700">{c.className || "—"}</span>
                  <span className="shrink-0 text-classz-500">{zh ? `出席 ${c.avgAttendance}` : `att ${c.avgAttendance}`} · {c.fillRate}%</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-classz-500">{zh ? "本月沒有低出席課堂" : "No low-attendance classes"}</p>
          )}
        </AdminCard>
      )
    }
    if (id === "instructor_perf") {
      return (
        <AdminCard className="h-full !p-3 overflow-auto">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-classz-700">{zh ? "導師表現" : "Teacher performance"}</h2>
            <Link href="/admin/reports/teacher-ratings" className="text-[11px] text-classz-400">{zh ? "報表 →" : "Report →"}</Link>
          </div>
          {extra.instructorsPerf.length ? (
            <ul className="space-y-1.5">
              {extra.instructorsPerf.map((row, i) => (
                <li key={`${row.instructor}-${i}`} className="flex items-center justify-between text-xs gap-2">
                  <span className="truncate text-classz-700">{row.instructor || "—"}</span>
                  <span className="shrink-0 text-classz-500">
                    {row.totalSessions}{zh ? "堂" : " sess"} · {row.totalStudents}{zh ? "人" : ""}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-classz-500">{zh ? "本月暫無資料" : "No data this month"}</p>
          )}
        </AdminCard>
      )
    }
    return (
      <AdminCard className="h-full !p-3 overflow-auto">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-classz-700">{zh ? `${period} 課堂` : `Classes — ${period}`}</h2>
          <Link href="/admin/schedule" className="text-[11px] text-classz-400">{zh ? "排程 →" : "Schedule →"}</Link>
        </div>
        <table className="w-full text-xs">
          <tbody className="divide-y divide-classz-50">
            {(k?.monthClasses || []).slice(0, 10).map((c) => (
              <tr key={c.id}>
                <td className="py-1.5 font-medium text-classz-700">{c.name}</td>
                <td className="py-1.5 text-classz-500">{c.start_time ? new Date(c.start_time).toLocaleString(zh ? "zh-HK" : "en-HK", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                <td className="py-1.5 text-classz-500 text-right">{c.enrolled_count ?? 0}{c.capacity != null ? `/${c.capacity}` : ""}</td>
              </tr>
            ))}
            {!k?.monthClasses?.length ? (
              <tr><td className="py-4 text-classz-500">{zh ? "暫無課堂" : "No classes"}</td></tr>
            ) : null}
          </tbody>
        </table>
      </AdminCard>
    )
  }

  return (
    <AdminPageFrame>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-classz-700 leading-tight">Dashboard</h1>
          <p className="text-xs text-classz-600/75">
            {customizing
              ? (zh ? `排好模塊位置後按完成 · ${period}` : `Arrange modules, then tap Done · ${period}`)
              : (zh ? `自行加入模塊並排位置 · ${period}` : `Add modules and arrange the layout · ${period}`)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <PeriodSelect year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m) }} zh={zh} />
          {customizing ? (
            <>
              <AdminGhostButton size="sm" onClick={openPicker}>
                <Plus className="h-3.5 w-3.5" />
                {zh ? "新增" : "Add"}
              </AdminGhostButton>
              <AdminGhostButton size="sm" onClick={cancelCustomize}>{zh ? "取消" : "Cancel"}</AdminGhostButton>
              <AdminPrimaryButton size="sm" onClick={finishCustomize}>{zh ? "完成" : "Done"}</AdminPrimaryButton>
            </>
          ) : (
            <>
              {layout.widgets.length ? (
                <AdminGhostButton size="sm" onClick={beginCustomize}>
                  <Pencil className="h-3.5 w-3.5" />
                  {zh ? "編輯版面" : "Edit layout"}
                </AdminGhostButton>
              ) : null}
              <AdminPrimaryButton size="sm" onClick={openPicker}>
                <Plus className="h-3.5 w-3.5" />
                {zh ? "新增" : "Add"}
              </AdminPrimaryButton>
            </>
          )}
        </div>
      </div>

      {error ? (
        <div role="alert" className="text-xs text-brand-coral bg-[color-mix(in_srgb,var(--brand-coral)_10%,white)] border border-[color-mix(in_srgb,var(--brand-coral)_35%,white)] rounded-lg px-3 py-2">
          {error}
        </div>
      ) : null}

      {customizing && layout.widgets.length ? (
        <div className="sticky top-2 z-30 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand-teal/40 bg-white px-3 py-2 shadow-sm">
          <p className="text-xs sm:text-sm text-classz-700">
            {zh ? "拖曳頂部移動位置，拉右下角改大小，排好後按完成。" : "Drag the top to move, pull the corner to resize, then tap Done."}
          </p>
          <div className="flex items-center gap-1.5">
            <AdminGhostButton size="sm" onClick={cancelCustomize}>{zh ? "取消" : "Cancel"}</AdminGhostButton>
            <AdminPrimaryButton size="sm" onClick={finishCustomize}>{zh ? "完成" : "Done"}</AdminPrimaryButton>
          </div>
        </div>
      ) : null}

      {loading && layout.widgets.length ? (
        <p className="text-xs text-classz-400">{zh ? "載入數據中…" : "Loading data…"}</p>
      ) : null}

      {!layout.widgets.length ? (
        <button
          type="button"
          onClick={openPicker}
          className="flex min-h-[280px] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-classz-200 bg-white/70 text-classz-600 hover:border-classz-300 hover:text-classz-700"
        >
          <Plus className="h-8 w-8 text-classz-400" />
          <span className="text-sm font-medium">{zh ? "Dashboard 是空白的 — 點擊新增模塊" : "Dashboard is empty — add a module"}</span>
          <span className="text-xs text-classz-500">{zh ? "收入、今日課堂、試堂轉換、導師表現都可以自己放，再拖到想要的位置" : "Revenue, today's classes, trial conversion, teacher performance — then drag them into place"}</span>
        </button>
      ) : (
        <div
          ref={gridRef}
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
            gridAutoRows: `${GRID_ROW}px`,
            gap: GRID_GAP,
          }}
        >
          {displayWidgets.map((widget) => (
            <div
              key={widget.id}
              className={`group relative min-w-0 h-full ${draggingId === widget.id ? "z-20 opacity-90" : "z-0"}`}
              style={{
                gridColumn: narrow ? `1 / span ${GRID_COLS}` : `${widget.x + 1} / span ${widget.w}`,
                gridRow: narrow ? `span ${widget.h}` : `${widget.y + 1} / span ${widget.h}`,
              }}
            >
              <div className="h-full">{renderBody(widget.id)}</div>
              {customizing && !narrow ? (
                <div
                  className="absolute inset-x-8 top-0 z-10 flex h-7 cursor-grab items-center justify-center text-classz-400 active:cursor-grabbing"
                  onPointerDown={(e) => startMove(e, widget)}
                  title={zh ? "拖曳移動位置" : "Drag to move"}
                >
                  <span className="flex h-5 w-12 items-center justify-center rounded-full bg-white/90 shadow-sm border border-classz-100 opacity-70 group-hover:opacity-100">
                    <GripHorizontal className="h-3.5 w-3.5" />
                  </span>
                </div>
              ) : null}
              {customizing ? (
                <button
                  type="button"
                  className="absolute top-1.5 right-1.5 z-10 rounded-md bg-white/90 p-1 text-classz-500 shadow-sm border border-classz-100"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => removeWidget(widget.id)}
                  aria-label={zh ? "移除" : "Remove"}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
              {customizing && !narrow ? (
                <div
                  role="slider"
                  aria-valuemin={GRID_MIN_W}
                  aria-valuemax={GRID_COLS}
                  aria-label={zh ? "拉大拉小" : "Resize"}
                  className="absolute right-0 bottom-0 z-10 h-7 w-7 cursor-nwse-resize"
                  onPointerDown={(e) => startResize(e, widget)}
                >
                  <span className="absolute right-1.5 bottom-1.5 h-3 w-3 border-r-2 border-b-2 border-classz-400" />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <AdminModal
        open={pickerOpen}
        title={zh ? "新增模塊" : "Add module"}
        onClose={cancelPicker}
        size="lg"
        footer={
          <>
            <button
              type="button"
              className="px-4 py-2.5 text-base text-classz-700 hover:bg-classz-50 rounded-md border border-classz-200"
              onClick={cancelPicker}
            >
              {zh ? "取消" : "Cancel"}
            </button>
            <AdminPrimaryButton onClick={finishPicker}>
              {zh ? "確定" : "Confirm"}
            </AdminPrimaryButton>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-classz-500">
            {zh ? "點選要加入的模塊，可一次加多個，確定後再排位置。" : "Select modules to add. Confirm, then arrange them."}
          </p>
          {CATALOG_GROUPS.map((group) => (
            <div key={group.key}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-classz-500">{zh ? group.zh : group.en}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {WIDGET_CATALOG.filter((item) => item.category === group.key).map((item) => {
                  const added = ids.has(item.id)
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => addWidget(item.id)}
                      className={`text-left rounded-xl border px-3 py-2.5 ${added ? "border-brand-teal bg-[color-mix(in_srgb,var(--brand-teal)_8%,white)]" : "border-classz-100 bg-white hover:border-classz-300"}`}
                    >
                      <p className="text-sm font-semibold text-classz-700">{zh ? item.labelZh : item.labelEn}</p>
                      <p className="text-[11px] text-classz-500 mt-0.5">{zh ? item.descZh : item.descEn}</p>
                      {added ? <p className="text-[10px] text-brand-teal mt-1">{zh ? "已加入 · 再點移除" : "Added · tap to remove"}</p> : null}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </AdminModal>
    </AdminPageFrame>
  )
}
