export type WidgetId =
  | "revenue"
  | "outstanding"
  | "students"
  | "teachers"
  | "attendance"
  | "utilization"
  | "leads"
  | "trials_pending"
  | "pending"
  | "tasks"
  | "waitlist"
  | "overview"
  | "mix"
  | "goals"
  | "classes"
  | "popular"
  | "conversion"
  | "courses"
  | "today"
  | "class_health"
  | "instructor_perf"
  | "renewal"

export type GoalMetric = "attendance" | "utilization" | "fill" | "revenue" | "leads" | "students"

export type WidgetConfig = {
  id: WidgetId
  x: number
  y: number
  w: number
  h: number
}

export type GoalConfig = {
  id: string
  metric: GoalMetric
  target: number
}

export type DashboardLayout = {
  widgets: WidgetConfig[]
  goals: GoalConfig[]
}

export type WidgetCategory = "metrics" | "charts" | "lists"

export type WidgetCatalogItem = {
  id: WidgetId
  category: WidgetCategory
  labelZh: string
  labelEn: string
  descZh: string
  descEn: string
  defaultW: number
  defaultH: number
}

export const GRID_COLS = 12
export const GRID_ROW = 76
export const GRID_GAP = 10
export const GRID_MIN_W = 2
export const GRID_MAX_H = 10
export const GRID_MIN_H = 2
export const GRID_MAX_Y = 40

export const WIDGET_CATALOG: WidgetCatalogItem[] = [
  { id: "revenue", category: "metrics", labelZh: "本月收入", labelEn: "Revenue", descZh: "已付款訂單總額", descEn: "Paid order total", defaultW: 3, defaultH: 2 },
  { id: "outstanding", category: "metrics", labelZh: "未付款項", labelEn: "Outstanding", descZh: "待付／失敗訂單數", descEn: "Unpaid or failed orders", defaultW: 3, defaultH: 2 },
  { id: "students", category: "metrics", labelZh: "活躍學員", labelEn: "Active students", descZh: "本月有課堂的學員", descEn: "Students with classes this month", defaultW: 3, defaultH: 2 },
  { id: "teachers", category: "metrics", labelZh: "導師人數", labelEn: "Teachers", descZh: "中心導師總數", descEn: "Teachers at this centre", defaultW: 3, defaultH: 2 },
  { id: "attendance", category: "metrics", labelZh: "本月出席", labelEn: "Attendance", descZh: "出席人次與出席率", descEn: "Present vs scheduled", defaultW: 3, defaultH: 2 },
  { id: "utilization", category: "metrics", labelZh: "導師使用率", labelEn: "Utilization", descZh: "有學員的課堂佔比", descEn: "Filled class slots", defaultW: 3, defaultH: 2 },
  { id: "leads", category: "metrics", labelZh: "新 Leads", labelEn: "New leads", descZh: "試堂申請 + CRM leads", descEn: "Trial apps + CRM leads", defaultW: 3, defaultH: 2 },
  { id: "trials_pending", category: "metrics", labelZh: "待處理試堂", labelEn: "Pending trials", descZh: "待跟進的試堂申請", descEn: "Trial applications waiting", defaultW: 3, defaultH: 2 },
  { id: "pending", category: "lists", labelZh: "待辦事項", labelEn: "Pending items", descZh: "試堂、報名、申請、訂單", descEn: "Trials, enrolments, apps, orders", defaultW: 4, defaultH: 3 },
  { id: "tasks", category: "lists", labelZh: "任務", labelEn: "Tasks", descZh: "未完成指派任務", descEn: "Open assigned tasks", defaultW: 4, defaultH: 4 },
  { id: "waitlist", category: "lists", labelZh: "候補名單", labelEn: "Waitlist", descZh: "課堂候補人數", descEn: "Class waitlist", defaultW: 4, defaultH: 3 },
  { id: "overview", category: "charts", labelZh: "營運概覽", labelEn: "Overview chart", descZh: "每日報名／課堂數", descEn: "Daily enrolled / classes", defaultW: 8, defaultH: 4 },
  { id: "mix", category: "charts", labelZh: "營運組成", labelEn: "Ops mix", descZh: "學員、leads、未付、出席", descEn: "Students, leads, outstanding, present", defaultW: 4, defaultH: 4 },
  { id: "goals", category: "charts", labelZh: "本月目標", labelEn: "Monthly goals", descZh: "自訂達標百分比或數字", descEn: "Custom % or count targets", defaultW: 4, defaultH: 4 },
  { id: "classes", category: "lists", labelZh: "本月課堂", labelEn: "Month classes", descZh: "課堂時間與人數", descEn: "Sessions, time and headcount", defaultW: 12, defaultH: 4 },
  { id: "popular", category: "lists", labelZh: "熱門課程", labelEn: "Popular courses", descZh: "報名人數最高的課程", descEn: "Courses by enrolment", defaultW: 6, defaultH: 4 },
  { id: "conversion", category: "charts", labelZh: "試堂轉換", labelEn: "Trial conversion", descZh: "試堂申請轉報名比率", descEn: "Trial to enrolment rate", defaultW: 4, defaultH: 3 },
  { id: "courses", category: "metrics", labelZh: "上架數量", labelEn: "Listings", descZh: "課程／工作坊／試堂則數", descEn: "Programs, workshops, trials", defaultW: 4, defaultH: 2 },
  { id: "today", category: "lists", labelZh: "今日課堂", labelEn: "Today's classes", descZh: "今天要上的課堂與人數", descEn: "Classes scheduled today", defaultW: 6, defaultH: 4 },
  { id: "class_health", category: "lists", labelZh: "課堂健康", labelEn: "Class health", descZh: "低出席／低填滿課堂", descEn: "Low attendance or fill", defaultW: 6, defaultH: 4 },
  { id: "instructor_perf", category: "lists", labelZh: "導師表現", labelEn: "Teacher performance", descZh: "課堂數、學員、出席率", descEn: "Sessions, students, attendance", defaultW: 6, defaultH: 4 },
  { id: "renewal", category: "metrics", labelZh: "續期／流失", labelEn: "Renewal / churn", descZh: "本月到期續期與流失率", descEn: "Expiring tokens renewed vs churned", defaultW: 4, defaultH: 3 },
]

export const WIDGET_IDS = WIDGET_CATALOG.map((w) => w.id)
export const WIDGET_BY_ID = Object.fromEntries(WIDGET_CATALOG.map((w) => [w.id, w])) as Record<WidgetId, WidgetCatalogItem>

export const GOAL_METRICS: GoalMetric[] = [
  "attendance",
  "utilization",
  "fill",
  "revenue",
  "leads",
  "students",
]

export const DEFAULT_GOALS: GoalConfig[] = [
  { id: "attendance", metric: "attendance", target: 80 },
  { id: "utilization", metric: "utilization", target: 80 },
  { id: "fill", metric: "fill", target: 80 },
]

export const DEFAULT_DASHBOARD_LAYOUT: DashboardLayout = {
  widgets: [],
  goals: DEFAULT_GOALS.map((g) => ({ ...g })),
}

export const CATALOG_GROUPS: Array<{ key: WidgetCategory; zh: string; en: string }> = [
  { key: "metrics", zh: "數據卡片", en: "Metrics" },
  { key: "charts", zh: "圖表", en: "Charts" },
  { key: "lists", zh: "清單", en: "Lists" },
]

export function clampGrid(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min
  return Math.min(max, Math.max(min, Math.round(n)))
}

export function goalIsPercent(metric: GoalMetric): boolean {
  return metric === "attendance" || metric === "utilization" || metric === "fill"
}

function hasGridSize(row: Record<string, unknown>) {
  return Number.isFinite(Number(row.w)) && Number.isFinite(Number(row.h))
}

export function widgetsOverlap(a: WidgetConfig, b: WidgetConfig) {
  return a.id !== b.id && boxesOverlap(a, b)
}

function boxesOverlap(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

export function clampWidget(widget: WidgetConfig): WidgetConfig {
  const x = Math.max(0, Math.min(GRID_COLS - GRID_MIN_W, Math.round(Number(widget.x)) || 0))
  const y = Math.max(0, Math.min(GRID_MAX_Y, Math.round(Number(widget.y)) || 0))
  return {
    id: widget.id,
    x,
    y,
    w: clampGrid(widget.w, GRID_MIN_W, GRID_COLS - x),
    h: clampGrid(widget.h, GRID_MIN_H, GRID_MAX_H),
  }
}

export function firstOpenSlot(existing: WidgetConfig[], w: number, h: number): { x: number; y: number } {
  const width = clampGrid(w, GRID_MIN_W, GRID_COLS)
  const height = clampGrid(h, GRID_MIN_H, GRID_MAX_H)
  for (let y = 0; y <= GRID_MAX_Y; y++) {
    for (let x = 0; x <= GRID_COLS - width; x++) {
      const candidate = { x, y, w: width, h: height }
      if (!existing.some((item) => boxesOverlap(item, candidate))) return { x, y }
    }
  }
  const maxY = existing.reduce((m, item) => Math.max(m, item.y + item.h), 0)
  return { x: 0, y: maxY }
}

function sortWidgets(widgets: WidgetConfig[]) {
  return [...widgets].sort((a, b) => a.y - b.y || a.x - b.x || a.id.localeCompare(b.id))
}

export function compactWidgets(widgets: WidgetConfig[], freezeId?: WidgetId | null): WidgetConfig[] {
  const frozen = freezeId ? widgets.find((item) => item.id === freezeId) : undefined
  const rest = freezeId ? widgets.filter((item) => item.id !== freezeId) : widgets
  const placed: WidgetConfig[] = frozen ? [clampWidget(frozen)] : []
  for (const item of sortWidgets(rest)) {
    const clamped = clampWidget(item)
    let y = 0
    while (y <= GRID_MAX_Y && placed.some((row) => widgetsOverlap(row, { ...clamped, y }))) y += 1
    placed.push({ ...clamped, y })
  }
  return placed
}

export function moveWidget(widgets: WidgetConfig[], id: WidgetId, x: number, y: number): WidgetConfig[] {
  const moving = widgets.find((item) => item.id === id)
  if (!moving) return widgets
  return compactWidgets(
    widgets.map((item) => (item.id === id ? { ...item, x, y } : item)),
    id,
  )
}

export function resizeWidget(widgets: WidgetConfig[], id: WidgetId, w: number, h: number): WidgetConfig[] {
  const target = widgets.find((item) => item.id === id)
  if (!target) return widgets
  return compactWidgets(
    widgets.map((item) => (item.id === id ? { ...item, w, h } : item)),
    id,
  )
}

function hasOverlap(widgets: WidgetConfig[]) {
  for (let i = 0; i < widgets.length; i++) {
    for (let j = i + 1; j < widgets.length; j++) {
      if (widgetsOverlap(widgets[i], widgets[j])) return true
    }
  }
  return false
}

export function sanitizeDashboardLayout(raw: unknown): DashboardLayout {
  const src = raw && typeof raw === "object" ? (raw as Partial<DashboardLayout> & { widgets?: unknown[] }) : {}
  const incoming = Array.isArray(src.widgets) ? src.widgets : []
  const looksLegacy = incoming.length > 0 && !incoming.some((row) => row && typeof row === "object" && hasGridSize(row as Record<string, unknown>))
  const widgets: WidgetConfig[] = []
  const seen = new Set<WidgetId>()
  if (!looksLegacy) {
    for (const row of incoming) {
      if (!row || typeof row !== "object") continue
      const rec = row as Record<string, unknown>
      if (!WIDGET_IDS.includes(rec.id as WidgetId)) continue
      const id = rec.id as WidgetId
      if (seen.has(id)) continue
      seen.add(id)
      const catalog = WIDGET_BY_ID[id]
      const w = clampGrid(Number(rec.w ?? catalog.defaultW), GRID_MIN_W, GRID_COLS)
      const h = clampGrid(Number(rec.h ?? catalog.defaultH), GRID_MIN_H, GRID_MAX_H)
      const hasPos = Number.isFinite(Number(rec.x)) && Number.isFinite(Number(rec.y))
      if (hasPos) {
        widgets.push(clampWidget({ id, x: Number(rec.x), y: Number(rec.y), w, h }))
      } else {
        const slot = firstOpenSlot(widgets, w, h)
        widgets.push(clampWidget({ id, x: slot.x, y: slot.y, w, h }))
      }
    }
    if (hasOverlap(widgets)) {
      widgets.splice(0, widgets.length, ...compactWidgets(widgets))
    }
  }

  const goals: GoalConfig[] = []
  const goalRows = Array.isArray(src.goals) ? src.goals : DEFAULT_GOALS
  for (const row of goalRows) {
    if (!row || !GOAL_METRICS.includes(row.metric as GoalMetric)) continue
    const metric = row.metric as GoalMetric
    const target = Number(row.target)
    if (!Number.isFinite(target) || target <= 0) continue
    const capped = goalIsPercent(metric) ? Math.min(100, Math.round(target)) : Math.round(target)
    goals.push({
      id: String(row.id || metric).slice(0, 40),
      metric,
      target: Math.max(1, capped),
    })
    if (goals.length >= 8) break
  }
  return {
    widgets,
    goals: goals.length ? goals : DEFAULT_GOALS.map((g) => ({ ...g })),
  }
}

export function defaultWidget(id: WidgetId, existing: WidgetConfig[] = []): WidgetConfig {
  const item = WIDGET_BY_ID[id]
  const slot = firstOpenSlot(existing, item.defaultW, item.defaultH)
  return { id, x: slot.x, y: slot.y, w: item.defaultW, h: item.defaultH }
}
