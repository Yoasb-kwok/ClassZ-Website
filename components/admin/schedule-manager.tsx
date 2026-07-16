"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { CalendarCheck, Plus, RefreshCw, Search } from "lucide-react"
import { format } from "date-fns"
import { useLanguage } from "@/components/language-provider"
import { isDemoSession } from "@/components/admin/use-admin-api"
import { apiDelete, apiPatch, apiPost } from "@/lib/classz-api-client"
import { useCenterApiList } from "@/components/admin/use-center-api-list"
import {
  ScheduleCalendar,
  getCalendarVisibleRange,
  parseSessionDate,
  type ScheduleCalendarEvent,
  type ScheduleCalendarView,
  type ScheduleHoliday,
} from "@/components/admin/schedule-calendar"
import { ScheduleClassEnrollments } from "@/components/admin/schedule-class-enrollments"
import {
  AdminInput,
  AdminLabel,
  AdminModal,
  AdminPageFrame,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminTable,
  AdminTableShell,
  AdminToolbar,
} from "@/components/classz-admin-ui"

type ClassRow = ScheduleCalendarEvent

type DisplayMode = ScheduleCalendarView | "list"

function mapClass(r: Record<string, unknown>): ClassRow {
  return {
    id: String(r.id),
    name: String(r.name || ""),
    class_code: String(r.class_code || r.program_code || ""),
    instructor: String(r.instructor || ""),
    start_time: String(r.start_time || ""),
    end_time: String(r.end_time || ""),
    capacity: Number(r.capacity) || 10,
    enrolled_count: Number(r.enrolled_count) || 0,
    location: String(r.location || ""),
  }
}

function toDatetimeLocal(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function splitDatetimeLocal(value: string) {
  const [date, time = "10:00"] = value.split("T")
  return { date, time: time.slice(0, 5) }
}

function formatWhen(iso: string, zh: boolean) {
  if (!iso) return "—"
  const d = new Date(iso.includes("T") ? iso : iso.replace(" ", "T"))
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString(zh ? "zh-HK" : "en-HK", { dateStyle: "medium", timeStyle: "short" })
}

function mapHoliday(r: Record<string, unknown>): ScheduleHoliday {
  return {
    id: String(r.id),
    name: String(r.name || ""),
    date: String(r.date || "").slice(0, 10),
  }
}

function SessionListTable({
  rows,
  zh,
  onEdit,
  onRemove,
  emptyLabel,
}: {
  rows: ClassRow[]
  zh: boolean
  onEdit: (c: ClassRow) => void
  onRemove: (id: string) => void
  emptyLabel: string
}) {
  return (
    <AdminTableShell>
      <AdminTable>
        <thead className="bg-classz-100">
          <tr>
            <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">{zh ? "課堂" : "Session"}</th>
            <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">{zh ? "時間" : "When"}</th>
            <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">{zh ? "導師" : "Instructor"}</th>
            <th className="px-3 py-3 text-left text-base font-semibold text-classz-600 uppercase">{zh ? "地點" : "Location"}</th>
            <th className="px-3 py-3 text-right text-base font-semibold text-classz-600 uppercase">{zh ? "操作" : "Actions"}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-classz-100">
          {rows.map((c) => (
            <tr key={c.id} className="bg-white">
              <td className="px-3 py-2 font-medium text-classz-800">{c.name}</td>
              <td className="px-3 py-2 text-classz-600 text-sm">{formatWhen(c.start_time, zh)}</td>
              <td className="px-3 py-2 text-classz-600">{c.instructor || "—"}</td>
              <td className="px-3 py-2 text-classz-600">{c.location || "—"}</td>
              <td className="px-3 py-2 text-right whitespace-nowrap">
                <Link href={`/admin/attendance?classId=${c.id}`} className="text-sm text-classz-600 hover:underline">
                  {zh ? "點名" : "Attendance"}
                </Link>
                <button type="button" className="ml-2 text-sm text-classz-600 hover:underline" onClick={() => onEdit(c)}>
                  {zh ? "編輯" : "Edit"}
                </button>
                <button type="button" className="ml-2 text-sm text-red-600 hover:underline" onClick={() => onRemove(c.id)}>
                  {zh ? "刪除" : "Delete"}
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="px-3 py-8 text-center text-classz-500">
                {emptyLabel}
              </td>
            </tr>
          )}
        </tbody>
      </AdminTable>
    </AdminTableShell>
  )
}

function HolidayListTable({ rows, zh }: { rows: ScheduleHoliday[]; zh: boolean }) {
  if (rows.length === 0) return null
  return (
    <div className="mt-4">
      <AdminTableShell>
      <AdminTable>
        <thead className="bg-amber-50">
          <tr>
            <th className="px-3 py-3 text-left text-base font-semibold text-amber-800 uppercase">{zh ? "日期" : "Date"}</th>
            <th className="px-3 py-3 text-left text-base font-semibold text-amber-800 uppercase">{zh ? "公眾假期" : "Public holiday"}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-amber-100">
          {rows.map((h) => (
            <tr key={h.id} className="bg-white">
              <td className="px-3 py-2 text-classz-600 text-sm">
                {format(parseSessionDate(h.date), zh ? "yyyy年M月d日" : "MMM d, yyyy")}
              </td>
              <td className="px-3 py-2 font-medium text-amber-900">{h.name}</td>
            </tr>
          ))}
        </tbody>
      </AdminTable>
      </AdminTableShell>
    </div>
  )
}

export function ScheduleManager() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const demo = isDemoSession()
  const { rows, ready, reload, error: listError } = useCenterApiList("/classes", mapClass)
  const { rows: holidays, reload: reloadHolidays } = useCenterApiList("/holidays", mapHoliday)
  const [search, setSearch] = useState("")
  const [displayMode, setDisplayMode] = useState<DisplayMode>("month")
  const [anchorDate, setAnchorDate] = useState(() => new Date())
  const [modal, setModal] = useState<"create" | "edit" | null>(null)
  const [editing, setEditing] = useState<ClassRow | null>(null)
  const [saving, setSaving] = useState(false)
  const [syncingHolidays, setSyncingHolidays] = useState(false)
  const [form, setForm] = useState({
    name: "",
    class_code: "",
    instructor: "",
    start_time: "",
    end_time: "",
    capacity: "10",
    location: "",
    lesson_count: "1",
  })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        c.class_code.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q)
    )
  }, [rows, search])

  const periodRange = useMemo(() => {
    if (displayMode === "list") return null
    return getCalendarVisibleRange(anchorDate, displayMode)
  }, [displayMode, anchorDate])

  const periodSessions = useMemo(() => {
    if (!periodRange) return filtered
    const { start, end } = periodRange
    return filtered
      .filter((c) => {
        const d = parseSessionDate(c.start_time)
        return d >= start && d <= end
      })
      .sort((a, b) => parseSessionDate(a.start_time).getTime() - parseSessionDate(b.start_time).getTime())
  }, [filtered, periodRange])

  const periodHolidays = useMemo(() => {
    if (!periodRange) return []
    const { start, end } = periodRange
    return holidays
      .filter((h) => {
        const d = parseSessionDate(h.date)
        return d >= start && d <= end
      })
      .sort((a, b) => parseSessionDate(a.date).getTime() - parseSessionDate(b.date).getTime())
  }, [holidays, periodRange])

  const periodListTitle = useMemo(() => {
    if (!periodRange || displayMode === "list") return ""
    if (displayMode === "month") {
      return zh
        ? `${format(anchorDate, "yyyy年M月")} 課堂列表`
        : `Sessions in ${format(anchorDate, "MMMM yyyy")}`
    }
    return zh
      ? `${format(periodRange.start, "M月d日")} – ${format(periodRange.end, "M月d日")} 課堂列表`
      : `Sessions ${format(periodRange.start, "MMM d")} – ${format(periodRange.end, "MMM d, yyyy")}`
  }, [periodRange, displayMode, anchorDate, zh])

  function openCreateAt(day?: Date) {
    const base = day ? new Date(day) : new Date()
    if (day) base.setHours(10, 0, 0, 0)
    const end = new Date(base.getTime() + 3600000)
    setEditing(null)
    setForm({
      name: "",
      class_code: "",
      instructor: "",
      start_time: toDatetimeLocal(base),
      end_time: toDatetimeLocal(end),
      capacity: "10",
      location: "",
      lesson_count: "1",
    })
    setModal("create")
  }

  function openEdit(c: ClassRow) {
    setEditing(c)
    setForm({
      name: c.name,
      class_code: c.class_code,
      instructor: c.instructor,
      start_time: c.start_time.slice(0, 16).replace(" ", "T"),
      end_time: c.end_time.slice(0, 16).replace(" ", "T"),
      capacity: String(c.capacity),
      location: c.location,
      lesson_count: "1",
    })
    setModal("edit")
  }

  async function save() {
    if (!form.name.trim() || !form.start_time || !form.end_time) return
    if (demo) {
      alert(zh ? "請用中心帳號登入以儲存排程" : "Sign in with a centre account to save schedules")
      return
    }
    setSaving(true)
    try {
      const lessonCount = Math.min(99, Math.max(1, parseInt(form.lesson_count, 10) || 1))
      const body = {
        name: form.name.trim(),
        class_code: form.class_code.trim() || undefined,
        program_code: form.class_code.trim() || undefined,
        instructor: form.instructor.trim(),
        start_time: form.start_time,
        end_time: form.end_time,
        capacity: Number(form.capacity) || 10,
        location: form.location.trim() || null,
      }
      const savedStart = parseSessionDate(form.start_time)
      if (!Number.isNaN(savedStart.getTime())) setAnchorDate(savedStart)

      if (modal === "create" && lessonCount > 1) {
        const { date, time: startHm } = splitDatetimeLocal(form.start_time)
        const { time: endHm } = splitDatetimeLocal(form.end_time)
        const created = await apiPost<ClassRow[]>("/classes/recurring", {
          ...body,
          first_date: date,
          start_time: startHm,
          end_time: endHm,
          number_of_lessons: lessonCount,
        })
        setModal(null)
        setEditing(null)
        await reload()
        alert(
          zh
            ? `已建立 ${Array.isArray(created) ? created.length : lessonCount} 堂每週課堂`
            : `Created ${Array.isArray(created) ? created.length : lessonCount} weekly sessions`
        )
      } else if (modal === "create") {
        const created = await apiPost<Record<string, unknown>>("/classes", body)
        const newId = String(created?.id ?? "")
        await reload()
        if (newId) {
          setEditing({
            id: newId,
            name: body.name || "",
            class_code: body.class_code || "",
            instructor: body.instructor || "",
            start_time: form.start_time,
            end_time: form.end_time,
            capacity: body.capacity,
            enrolled_count: 0,
            location: body.location || "",
          })
          setModal("edit")
        } else {
          setModal(null)
        }
      } else if (editing) {
        await apiPatch(`/classes/${editing.id}`, body)
        setModal(null)
        setEditing(null)
        await reload()
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  async function remove(id: string) {
    if (!confirm(zh ? "刪除此課堂？" : "Delete this class session?")) return
    if (demo) return
    try {
      await apiDelete(`/classes/${id}`)
      await reload()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed")
    }
  }

  async function syncHkHolidays() {
    if (demo) {
      alert(zh ? "請用中心帳號登入以同步假期" : "Sign in with a centre account to sync holidays")
      return
    }
    const y = new Date().getFullYear()
    setSyncingHolidays(true)
    try {
      const result = await apiPost<{ years: number[]; added: number; updated: number }>(
        `/holidays/sync?years=${y},${y + 1}`,
        {}
      )
      await reloadHolidays()
      alert(
        zh
          ? `已同步香港公眾假期（${result.years?.join("、") || `${y}、${y + 1}`}）：新增 ${result.added} 筆、更新 ${result.updated} 筆`
          : `HK holidays synced (${(result.years || [y, y + 1]).join(", ")}): ${result.added} added, ${result.updated} updated`
      )
    } catch (e) {
      alert(e instanceof Error ? e.message : zh ? "同步失敗" : "Sync failed")
    } finally {
      setSyncingHolidays(false)
    }
  }

  if (!ready) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 rounded-full border-2 border-classz-400 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <AdminPageFrame>
      <AdminPageHeader title={zh ? "排程" : "Scheduling"} Icon={CalendarCheck} />

      <AdminToolbar>
        {listError && !demo ? (
          <div className="w-full mb-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{listError}</div>
        ) : null}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-classz-400 pointer-events-none" />
          <AdminInput
            className="pl-9"
            placeholder={zh ? "搜尋課堂、導師、地點…" : "Search sessions, instructor, location…"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex rounded-lg border border-classz-200 overflow-hidden bg-white">
          {(
            [
              ["month", zh ? "月" : "Month"],
              ["week", zh ? "週" : "Week"],
              ["list", zh ? "列表" : "List"],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setDisplayMode(mode)}
              className={`px-3 py-2 text-sm font-medium min-h-[2.75rem] ${
                displayMode === mode ? "bg-classz-500 text-white" : "text-classz-700 hover:bg-classz-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={syncHkHolidays}
          disabled={syncingHolidays}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-classz-200 bg-white text-classz-700 hover:bg-classz-50 disabled:opacity-60 shrink-0 min-h-[2.75rem]"
        >
          <RefreshCw className={`h-4 w-4 ${syncingHolidays ? "animate-spin" : ""}`} />
          {syncingHolidays ? (zh ? "同步中…" : "Syncing…") : zh ? "同步香港假期" : "Sync HK holidays"}
        </button>

        <AdminPrimaryButton type="button" className="ml-auto shrink-0" onClick={() => openCreateAt()}>
          <Plus className="h-4 w-4" />
          {zh ? "新增課堂" : "Add session"}
        </AdminPrimaryButton>
      </AdminToolbar>

      {displayMode === "list" ? (
        <SessionListTable
          rows={filtered}
          zh={zh}
          onEdit={openEdit}
          onRemove={remove}
          emptyLabel={zh ? "尚無排程" : "No sessions yet"}
        />
      ) : (
        <div className="space-y-6">
          <ScheduleCalendar
            events={filtered}
            holidays={holidays}
            zh={zh}
            view={displayMode}
            anchorDate={anchorDate}
            onAnchorChange={setAnchorDate}
            onEventClick={openEdit}
            onDayClick={(day) => openCreateAt(day)}
          />

          <section>
            <h3 className="text-base font-semibold text-classz-800 mb-3">{periodListTitle}</h3>
            <SessionListTable
              rows={periodSessions}
              zh={zh}
              onEdit={openEdit}
              onRemove={remove}
              emptyLabel={zh ? "此期間尚無課堂" : "No sessions in this period"}
            />
            {periodHolidays.length > 0 && (
              <>
                <h4 className="text-sm font-semibold text-amber-800 mt-6 mb-2">{zh ? "期內公眾假期" : "Public holidays in this period"}</h4>
                <HolidayListTable rows={periodHolidays} zh={zh} />
              </>
            )}
          </section>
        </div>
      )}

      <AdminModal
        open={modal !== null}
        title={modal === "create" ? (zh ? "新增課堂" : "New session") : zh ? "編輯課堂" : "Edit session"}
        onClose={() => {
          setModal(null)
          setEditing(null)
        }}
        footer={
          <>
            <button type="button" className="px-4 py-2.5 text-base rounded-md border border-classz-200 text-classz-700" onClick={() => setModal(null)}>
              {zh ? "取消" : "Cancel"}
            </button>
            <AdminPrimaryButton type="button" disabled={saving} onClick={save}>
              {saving ? (zh ? "儲存中…" : "Saving…") : zh ? "儲存" : "Save"}
            </AdminPrimaryButton>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <AdminLabel>{zh ? "名稱" : "Name"}</AdminLabel>
            <AdminInput value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <AdminLabel>{zh ? "班別代碼" : "Class code"}</AdminLabel>
              <AdminInput value={form.class_code} onChange={(e) => setForm((f) => ({ ...f, class_code: e.target.value }))} />
            </div>
            <div>
              <AdminLabel>{zh ? "導師" : "Instructor"}</AdminLabel>
              <AdminInput value={form.instructor} onChange={(e) => setForm((f) => ({ ...f, instructor: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <AdminLabel>{zh ? "開始" : "Start"}</AdminLabel>
              <AdminInput type="datetime-local" value={form.start_time} onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))} />
            </div>
            <div>
              <AdminLabel>{zh ? "結束" : "End"}</AdminLabel>
              <AdminInput type="datetime-local" value={form.end_time} onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <AdminLabel>{zh ? "名額" : "Capacity"}</AdminLabel>
              <AdminInput type="number" min={1} value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} />
            </div>
            <div>
              <AdminLabel>{zh ? "地點" : "Location"}</AdminLabel>
              <AdminInput value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
            </div>
          </div>
          {modal === "create" ? (
            <div>
              <AdminLabel>{zh ? "每週重複堂數" : "Weekly sessions"}</AdminLabel>
              <AdminInput
                type="number"
                min={1}
                max={99}
                value={form.lesson_count}
                onChange={(e) => setForm((f) => ({ ...f, lesson_count: e.target.value }))}
              />
              <p className="text-xs text-classz-500 mt-1">
                {zh ? "設為 1 = 單堂；2 或以上 = 每週同一時間連續建立" : "1 = single session; 2+ = create weekly series"}
              </p>
            </div>
          ) : null}
          {modal === "edit" && editing?.id && !demo ? (
            <ScheduleClassEnrollments classId={editing.id} zh={zh} onChanged={reload} />
          ) : null}
        </div>
      </AdminModal>
    </AdminPageFrame>
  )
}
