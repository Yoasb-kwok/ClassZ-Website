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

      <div className="grid grid-cols-7 border-b border-classz-100 bg-classz-100/50">
        {weekdayLabels.map((label) => (
          <div key={label} className="py-2 text-center text-xs font-semibold uppercase text-classz-600">
            {label}
          </div>
        ))}
      </div>

      {view === "month" ? (
        <div className="grid grid-cols-7 auto-rows-fr min-h-[32rem]">
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
                } ${dayHolidays.length ? "ring-1 ring-inset ring-amber-200/80" : ""}`}
              >
                <div
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium mb-1 ${
                    isToday ? "bg-classz-500 text-white" : inMonth ? "text-classz-800" : "text-classz-400"
                  }`}
                >
                  {format(day, "d")}
                </div>
                {dayHolidays.length > 0 && (
                  <p className="text-[10px] leading-tight text-amber-700 bg-amber-50 border border-amber-200 rounded px-1 mb-1 truncate" title={dayHolidays.map((h) => h.name).join(", ")}>
                    {zh ? "公眾假期" : "Public holiday"}
                  </p>
                )}
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((ev) => (
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
                      className="w-full text-left rounded px-1.5 py-0.5 text-xs bg-classz-100 border border-classz-200 text-classz-800 hover:bg-classz-200/70 truncate"
                      title={ev.name}
                    >
                      <span className="font-medium text-classz-600">{eventTimeLabel(ev.start_time, ev.end_time, zh)}</span>{" "}
                      {ev.name}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <p className="text-[10px] text-classz-500 px-1">+{dayEvents.length - 3} {zh ? "更多" : "more"}</p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-7 min-h-[28rem] divide-x divide-classz-100">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd")
            const dayEvents = eventsByDay.get(key) || []
            const dayHolidays = holidaysByDay.get(key) || []
            const isToday = isSameDay(day, new Date())
            return (
              <div key={key} className={`flex flex-col min-w-0 bg-white ${dayHolidays.length ? "bg-amber-50/30" : ""}`}>
                <button
                  type="button"
                  onClick={() => onDayClick(day)}
                  className={`shrink-0 py-2 text-center border-b border-classz-100 hover:bg-classz-50 ${isToday ? "bg-classz-50" : ""}`}
                >
                  <div className="text-xs uppercase text-classz-500">{format(day, "EEE", { locale })}</div>
                  <div className={`text-lg font-semibold ${isToday ? "text-classz-600" : "text-classz-800"}`}>{format(day, "d")}</div>
                  {dayHolidays.length > 0 && (
                    <p className="text-[10px] text-amber-700 px-1 truncate" title={dayHolidays.map((h) => h.name).join(", ")}>
                      {dayHolidays[0].name}
                    </p>
                  )}
                </button>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {dayEvents.length === 0 ? (
                    <p className="text-xs text-classz-400 text-center pt-4">{zh ? "無課堂" : "No sessions"}</p>
                  ) : (
                    dayEvents.map((ev) => (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => onEventClick(ev)}
                        className="w-full text-left rounded-lg border border-classz-200 bg-classz-50 hover:bg-classz-100 p-2 shadow-sm"
                      >
                        <p className="text-xs font-semibold text-classz-600">{eventTimeLabel(ev.start_time, ev.end_time, zh)}</p>
                        <p className="text-sm font-medium text-classz-800 truncate">{ev.name}</p>
                        {ev.instructor && <p className="text-xs text-classz-500 truncate">{ev.instructor}</p>}
                        <p className="text-xs text-classz-500 mt-1">
                          {ev.enrolled_count}/{ev.capacity}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export { parseSessionDate, eventTimeLabel }
