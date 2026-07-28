"use client"

import { useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import {
  AdminCard,
  AdminPageFrame,
  AdminPageHeader,
  AdminSelect,
  AdminTable,
  AdminTableShell,
  AdminToolbar,
} from "@/components/classz-admin-ui"

export function currentMonthValue(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function parseYearMonth(value: string): { year: number; month: number } {
  const parts = String(value || "").split("-")
  const year = Number(parts[0]) || new Date().getFullYear()
  const month = Number(parts[1]) || new Date().getMonth() + 1
  return {
    year: Math.min(2100, Math.max(2000, year)),
    month: Math.min(12, Math.max(1, month)),
  }
}

function toYearMonth(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`
}

function monthLabel(m: number, zh: boolean): string {
  if (zh) return `${m}月`
  return new Date(2000, m - 1, 1).toLocaleString("en", { month: "long" })
}

export function periodLabel(value: string, zh: boolean): string {
  const { year, month } = parseYearMonth(value)
  if (zh) return `${year}年${month}月`
  return new Date(year, month - 1, 1).toLocaleString("en", { month: "long", year: "numeric" })
}

/** Year + month selects with prev/next — clearer than native type="month". */
export function ReportMonthPicker({
  value,
  onChange,
  zh,
}: {
  value: string
  onChange: (v: string) => void
  zh: boolean
}) {
  const { year, month } = parseYearMonth(value)
  const nowY = new Date().getFullYear()
  const years = useMemo(() => Array.from({ length: 6 }, (_, i) => nowY - i), [nowY])

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-classz-100 bg-white px-3 py-2 shadow-[0_1px_2px_rgba(10,186,181,0.05)]">
      <span className="text-sm font-medium text-classz-700">{zh ? "查詢月份" : "Period"}</span>
      <AdminSelect
        className="!w-auto min-w-[5.5rem] !min-h-[2.25rem] !py-1.5"
        value={month}
        aria-label={zh ? "選擇月份" : "Select month"}
        onChange={(e) => onChange(toYearMonth(year, Number(e.target.value)))}
      >
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
          <option key={m} value={m}>
            {monthLabel(m, zh)}
          </option>
        ))}
      </AdminSelect>
      <AdminSelect
        className="!w-auto min-w-[5.5rem] !min-h-[2.25rem] !py-1.5"
        value={year}
        aria-label={zh ? "選擇年份" : "Select year"}
        onChange={(e) => onChange(toYearMonth(Number(e.target.value), month))}
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {zh ? `${y}年` : y}
          </option>
        ))}
      </AdminSelect>
      <button
        type="button"
        className="text-xs font-medium text-classz-500 hover:text-classz-700 underline-offset-2 hover:underline px-1"
        onClick={() => onChange(currentMonthValue())}
      >
        {zh ? "本月" : "This month"}
      </button>
      <span className="text-sm text-classz-500 tabular-nums hidden sm:inline">{periodLabel(value, zh)}</span>
    </div>
  )
}

export function ReportShell({
  title,
  description,
  Icon,
  month,
  onMonthChange,
  loading,
  error,
  zh,
  children,
  showMonth = true,
}: {
  title: string
  description: string
  Icon: LucideIcon
  month: string
  onMonthChange: (v: string) => void
  loading: boolean
  error: string | null
  zh: boolean
  children: ReactNode
  showMonth?: boolean
}) {
  return (
    <AdminPageFrame>
      <AdminPageHeader title={title} description={description} Icon={Icon} />
      {showMonth ? (
        <AdminToolbar>
          <ReportMonthPicker value={month} onChange={onMonthChange} zh={zh} />
          <Link href="/admin/reports" className="text-sm text-classz-500 hover:text-classz-700 underline-offset-2 hover:underline">
            {zh ? "← 全部報表" : "← All reports"}
          </Link>
        </AdminToolbar>
      ) : null}
      {error ? (
        <div role="alert" className="text-sm text-brand-coral bg-[color-mix(in_srgb,var(--brand-coral)_10%,white)] border border-[color-mix(in_srgb,var(--brand-coral)_35%,white)] rounded-lg px-3 py-2">
          {error}
        </div>
      ) : null}
      {loading ? (
        <AdminCard>
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 rounded-full border-2 border-classz-100 border-t-classz-400 animate-spin" />
          </div>
        </AdminCard>
      ) : (
        children
      )}
    </AdminPageFrame>
  )
}

export function KpiGrid({ items }: { items: Array<{ label: string; value: string; hint?: string }> }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item) => (
        <AdminCard key={item.label} className="!p-3">
          <p className="text-xs text-classz-500 mb-1">{item.label}</p>
          <p className="text-xl font-semibold text-classz-800 tabular-nums">{item.value}</p>
          {item.hint ? <p className="text-[11px] text-classz-400 mt-1">{item.hint}</p> : null}
        </AdminCard>
      ))}
    </div>
  )
}

export function BarList({
  rows,
  empty,
}: {
  rows: Array<{ key: string; label: string; value: number; display: string }>
  empty: string
}) {
  const max = Math.max(...rows.map((r) => r.value), 1)
  if (!rows.length) {
    return <p className="text-sm text-classz-500 py-8 text-center">{empty}</p>
  }
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.key}>
          <div className="flex justify-between text-sm mb-1 gap-3">
            <span className="font-medium text-classz-800 truncate">{r.label}</span>
            <span className="tabular-nums text-classz-600 shrink-0">{r.display}</span>
          </div>
          <div className="h-2 rounded-full bg-classz-50 overflow-hidden">
            <div
              className="h-full rounded-full bg-classz-400 transition-[width] duration-500"
              style={{ width: `${Math.max(4, (r.value / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function Stars({ score }: { score: number }) {
  const full = Math.floor(score)
  const half = score - full >= 0.5
  return (
    <span className="inline-flex items-center gap-0.5 text-brand-orange" aria-label={`${score} / 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < full || (i === full && half)
        return (
          <span key={i} className={filled ? "opacity-100" : "opacity-25"}>
            ★
          </span>
        )
      })}
      <span className="ml-1 text-xs text-classz-600 tabular-nums">{score.toFixed(1)}</span>
    </span>
  )
}

export function useReportMonth() {
  const [month, setMonth] = useState(currentMonthValue)
  return { month, setMonth }
}

export { AdminCard, AdminTable, AdminTableShell }
