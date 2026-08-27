"use client"

import { useMemo } from "react"
import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns"
import { zhTW, enUS } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"

export type ScheduleCalendarEvent = {
  id: string
  name: string
  class_code: string
  calendar_color?: string | null
  instructor: string
  start_time: string
  end_time: string
  capacity: number
  enrolled_count: number
  location: string
}

export type ScheduleCalendarView = "month" | "week"

export type ScheduleHoliday = {
  id: string
  name: string
  date: string
}

const weekStartsOn = 0 as const

/** Palette from system 5 tones + readable variants — same course always maps to same color */
const COURSE_COLORS = [
  { bar: "#0ABAB5", bg: "#E7F8F7", border: "#8FDFDB", text: "#06706D" },
  { bar: "#BF07D0", bg: "#F9E8FB", border: "#E4A0ED", text: "#8A0596" },
  { bar: "#FF8400", bg: "#FFF3E6", border: "#FFC280", text: "#B85E00" },
  { bar: "#DB5461", bg: "#FCECEE", border: "#F0A8AF", text: "#A83A46" },
  { bar: "#525252", bg: "#F5F5F5", border: "#D4D4D4", text: "#292929" },
  { bar: "#089591", bg: "#E0F4F3", border: "#6CD6D3", text: "#044A48" },
  { bar: "#9B2DB0", bg: "#F5E6F8", border: "#D49BE0", text: "#6E1F7D" },
  { bar: "#E67A00", bg: "#FFF0DB", border: "#FFB84D", text: "#9A5200" },
  { bar: "#C93D4A", bg: "#FBE8EA", border: "#E88B94", text: "#8F2A35" },
  { bar: "#1A9BAA", bg: "#E4F5F7", border: "#7DCDD6", text: "#0F5C65" },
] as const

export const CALENDAR_COLOR_OPTIONS = COURSE_COLORS.map((c) => c.bar)

function hashCourseKey(key: string): number {
  let h = 2166136261
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Stable color for a course — prefer class_code, then name */
export function getCourseColor(ev: Pick<ScheduleCalendarEvent, "class_code" | "name" | "id" | "calendar_color">) {
  const chosen = String(ev.calendar_color || "").trim().toUpperCase()
  if (chosen) {
    const match = COURSE_COLORS.find((c) => c.bar.toUpperCase() === chosen)
    if (match) return match
  }
  const key = (ev.class_code || ev.name || ev.id || "course").trim().toLowerCase()
  return COURSE_COLORS[hashCourseKey(key) % COURSE_COLORS.length]
}

export function courseIdentityKey(ev: Pick<ScheduleCalendarEvent, "class_code" | "name" | "id">) {
  return (ev.class_code || ev.name || ev.id || "").trim().toLowerCase()
}

export function getCalendarVisibleRange(anchorDate: Date, view: ScheduleCalendarView) {
  if (view === "month") {
    return {
      start: startOfWeek(startOfMonth(anchorDate), { weekStartsOn }),
      end: endOfWeek(endOfMonth(anchorDate), { weekStartsOn }),
    }
  }
  return {
    start: startOfWeek(anchorDate, { weekStartsOn }),
    end: endOfWeek(anchorDate, { weekStartsOn }),
  }
}

function parseSessionDate(value: string): Date {
  if (!value) return new Date(NaN)
  const normalized = value.includes("T") ? value : value.replace(" ", "T")
  const d = new Date(normalized)
  return d
}

function eventTimeLabel(start: string, end: string, zh: boolean) {
  const s = parseSessionDate(start)
  const e = parseSessionDate(end)
  if (Number.isNaN(s.getTime())) return ""
  const loc = zh ? zhTW : enUS
  const a = format(s, "HH:mm", { locale: loc })
  const b = Number.isNaN(e.getTime()) ? "" : format(e, "HH:mm", { locale: loc })
  return b ? `${a}–${b}` : a
}

export function ScheduleCalendar({
  events,
  holidays = [],
  zh,
  view,
  anchorDate,
  onAnchorChange,
  onEventClick,
  onDayClick,
}: {
  events: ScheduleCalendarEvent[]
  holidays?: ScheduleHoliday[]
  zh: boolean
  view: ScheduleCalendarView
  anchorDate: Date
  onAnchorChange: (date: Date) => void
  onEventClick: (event: ScheduleCalendarEvent) => void
  onDayClick: (day: Date) => void
}) {
  const locale = zh ? zhTW : enUS

  const days = useMemo(() => {
    if (view === "month") {
      const monthStart = startOfMonth(anchorDate)
      const monthEnd = endOfMonth(anchorDate)
      const gridStart = startOfWeek(monthStart, { weekStartsOn })
      const gridEnd = endOfWeek(monthEnd, { weekStartsOn })
      return eachDayOfInterval({ start: gridStart, end: gridEnd })
    }
    const weekStart = startOfWeek(anchorDate, { weekStartsOn })
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart)
      d.setDate(weekStart.getDate() + i)
      return d
    })
  }, [anchorDate, view])

  const eventsByDay = useMemo(() => {
    const map = new Map<string, ScheduleCalendarEvent[]>()
    for (const ev of events) {
      const d = parseSessionDate(ev.start_time)
      if (Number.isNaN(d.getTime())) continue
      const key = format(d, "yyyy-MM-dd")
      const list = map.get(key) || []
      list.push(ev)
      map.set(key, list)
    }
    for (const [, list] of map) {
      list.sort((a, b) => parseSessionDate(a.start_time).getTime() - parseSessionDate(b.start_time).getTime())
    }
    return map
  }, [events])

  const holidaysByDay = useMemo(() => {
    const map = new Map<string, ScheduleHoliday[]>()
    for (const h of holidays) {
      const key = h.date.slice(0, 10)
      const list = map.get(key) || []
      list.push(h)
      map.set(key, list)
    }
    return map
  }, [holidays])

  const courseLegend = useMemo(() => {
    const seen = new Map<string, { label: string; color: (typeof COURSE_COLORS)[number] }>()
    for (const ev of events) {
      const key = courseIdentityKey(ev)
      if (!key || seen.has(key)) continue
      const label = ev.class_code || ev.name || key
      seen.set(key, { label, color: getCourseColor(ev) })
    }
    return Array.from(seen.values()).sort((a, b) => a.label.localeCompare(b.label, zh ? "zh-HK" : "en"))
  }, [events, zh])

  function goPrev() {
    onAnchorChange(view === "month" ? subMonths(anchorDate, 1) : subWeeks(anchorDate, 1))
  }

  function goNext() {
    onAnchorChange(view === "month" ? addMonths(anchorDate, 1) : addWeeks(anchorDate, 1))
  }

  function goToday() {
    onAnchorChange(new Date())
  }

  const headerLabel =
    view === "month"
      ? format(anchorDate, zh ? "yyyy年 M月" : "MMMM yyyy", { locale })
      : `${format(days[0], zh ? "M月d日" : "MMM d", { locale })} – ${format(days[6], zh ? "M月d日" : "MMM d, yyyy", { locale })}`

  const weekdayLabels = zh
    ? ["日", "一", "二", "三", "四", "五", "六"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="bg-white rounded-lg border border-classz-200 shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-classz-100 bg-classz-50/60">
        <div className="flex items-center gap-2">
          <button type="button" onClick={goPrev} className="p-2 rounded-md hover:bg-classz-100 text-classz-700" aria-label="Previous">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={goNext} className="p-2 rounded-md hover:bg-classz-100 text-classz-700" aria-label="Next">
            <ChevronRight className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-classz-800 min-w-[10rem]">{headerLabel}</h2>
        </div>
        <button type="button" onClick={goToday} className="px-3 py-1.5 text-sm rounded-md border border-classz-200 text-classz-700 hover:bg-white">
          {zh ? "今天" : "Today"}
        </button>
      </div>

      <div className="overflow-x-auto overscroll-x-contain">
        <div className="min-w-[52rem]">
          <div className="grid grid-cols-7 border-b border-classz-100 bg-classz-100/50">
            {weekdayLabels.map((label) => (
              <div key={label} className="py-2 text-center text-xs font-semibold uppercase text-classz-600">
                {label}
              </div>
            ))}
          </div>

      {view === "month" ? (
        <div className="grid grid-cols-7 auto-rows-fr min-h-[28rem] md:min-h-[32rem]">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd")
            const dayEvents = eventsByDay.get(key) || []
            const dayHolidays = holidaysByDay.get(key) || []
            const inMonth = isSameMonth(day, anchorDate)
            const isToday = isSameDay(day, new Date())
            return (
              <button
                key={key}
                type="button"
                onClick={() => onDayClick(day)}
                className={`min-h-[6.5rem] border-r border-b border-classz-100 p-1.5 text-left align-top hover:bg-classz-50/80 transition-colors ${
                  inMonth ? "bg-white" : "bg-classz-50/40"
                } ${dayHolidays.length ? "ring-1 ring-inset ring-[color-mix(in_srgb,var(--brand-orange)_40%,white)]" : ""}`}
              >
                <div
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium mb-1 ${
                    isToday ? "bg-classz-500 text-white" : inMonth ? "text-classz-800" : "text-classz-400"
                  }`}
                >
                  {format(day, "d")}
                </div>
                {dayHolidays.length > 0 && (
                  <p className="text-[10px] leading-tight text-brand-orange bg-[color-mix(in_srgb,var(--brand-orange)_12%,white)] border border-[color-mix(in_srgb,var(--brand-orange)_35%,white)] rounded px-1 mb-1 truncate" title={dayHolidays.map((h) => h.name).join(", ")}>
                    {zh ? "公眾假期" : "Public holiday"}
                  </p>
                )}
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((ev) => {
                    const color = getCourseColor(ev)
                    return (
                      <div
                        key={ev.id}
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation()
                          onEventClick(ev)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            e.stopPropagation()
                            onEventClick(ev)
                          }
                        }}
                        className="w-full text-left rounded px-1.5 py-0.5 text-xs border truncate hover:brightness-95 transition-[filter]"
                        style={{
                          backgroundColor: color.bg,
                          borderColor: color.border,
                          color: color.text,
                          borderLeftWidth: 3,
                          borderLeftColor: color.bar,
                        }}
                        title={`${ev.class_code ? `${ev.class_code} · ` : ""}${ev.name}`}
                      >
                        <span className="font-semibold opacity-80">
                          {eventTimeLabel(ev.start_time, ev.end_time, zh)}
                        </span>{" "}
                        {ev.name}
                      </div>
                    )
                  })}
                  {dayEvents.length > 3 && (
                    <p className="text-[10px] text-classz-500 px-1">+{dayEvents.length - 3} {zh ? "更多" : "more"}</p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-7 min-h-[24rem] md:min-h-[28rem] divide-x divide-classz-100">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd")
            const dayEvents = eventsByDay.get(key) || []
            const dayHolidays = holidaysByDay.get(key) || []
            const isToday = isSameDay(day, new Date())
            return (
              <div key={key} className={`flex flex-col min-w-0 bg-white ${dayHolidays.length ? "bg-[color-mix(in_srgb,var(--brand-orange)_8%,white)]" : ""}`}>
                <button
                  type="button"
                  onClick={() => onDayClick(day)}
                  className={`shrink-0 py-2 text-center border-b border-classz-100 hover:bg-classz-50 ${isToday ? "bg-classz-50" : ""}`}
                >
                  <div className="text-xs uppercase text-classz-500">{format(day, "EEE", { locale })}</div>
                  <div className={`text-lg font-semibold ${isToday ? "text-classz-600" : "text-classz-800"}`}>{format(day, "d")}</div>
                  {dayHolidays.length > 0 && (
                    <p className="text-[10px] text-brand-orange px-1 truncate" title={dayHolidays.map((h) => h.name).join(", ")}>
                      {dayHolidays[0].name}
                    </p>
                  )}
                </button>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {dayEvents.length === 0 ? (
                    <p className="text-xs text-classz-400 text-center pt-4">{zh ? "無課堂" : "No sessions"}</p>
                  ) : (
                    dayEvents.map((ev) => {
                      const color = getCourseColor(ev)
                      return (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={() => onEventClick(ev)}
                          className="w-full text-left rounded-lg border p-2 shadow-sm hover:brightness-95 transition-[filter]"
                          style={{
                            backgroundColor: color.bg,
                            borderColor: color.border,
                            borderLeftWidth: 4,
                            borderLeftColor: color.bar,
                          }}
                        >
                          <p className="text-xs font-semibold" style={{ color: color.text }}>
                            {eventTimeLabel(ev.start_time, ev.end_time, zh)}
                          </p>
                          <p className="text-sm font-medium truncate" style={{ color: color.text }}>
                            {ev.name}
                          </p>
                          {ev.class_code ? (
                            <p className="text-[10px] font-mono opacity-70 truncate" style={{ color: color.text }}>
                              {ev.class_code}
                            </p>
                          ) : null}
                          {ev.instructor && (
                            <p className="text-xs truncate opacity-75" style={{ color: color.text }}>
                              {ev.instructor}
                            </p>
                          )}
                          <p className="text-xs mt-1 opacity-75" style={{ color: color.text }}>
                            {ev.enrolled_count}/{ev.capacity}
                          </p>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
        </div>
      </div>

      {courseLegend.length > 1 ? (
        <div className="border-t border-classz-100 bg-white px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-slate/60 mb-2">
            {zh ? "課程顏色" : "Course colors"}
          </p>
          <div className="flex flex-wrap gap-2">
            {courseLegend.map((item) => (
              <span
                key={item.label}
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium max-w-full"
                style={{
                  backgroundColor: item.color.bg,
                  borderColor: item.color.border,
                  color: item.color.text,
                }}
                title={item.label}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color.bar }}
                  aria-hidden
                />
                <span className="truncate">{item.label}</span>
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export { parseSessionDate, eventTimeLabel }
