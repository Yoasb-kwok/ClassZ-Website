"use client"

import type { LucideIcon } from "lucide-react"

/** Admin canvas — teal surfaces + slate ink (system 5-tone). */
export const adminSurface = "bg-white text-brand-slate"

export function AdminPageFrame({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3 text-sm text-classz-700">{children}</div>
}

export function AdminPageHeader({
  title,
  description,
  Icon,
}: {
  title: string
  description?: string
  Icon?: LucideIcon
}) {
  return (
    <div className="space-y-0.5">
      <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-classz-700 flex items-center gap-2">
        {Icon ? <Icon className="h-5 w-5 shrink-0 text-classz-500" aria-hidden /> : null}
        {title}
      </h1>
      {description ? (
        <p className="text-classz-600/80 text-sm leading-snug max-w-2xl">{description}</p>
      ) : null}
    </div>
  )
}

export function AdminCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white rounded-xl border border-classz-100/80 p-3.5 md:p-4 text-brand-slate shadow-[0_1px_2px_rgba(10,186,181,0.06)] ${className}`.trim()}
    >
      {children}
    </div>
  )
}

export function AdminInput({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full px-3.5 py-2.5 border border-classz-100 rounded-lg text-base text-classz-700 placeholder:text-classz-600/40 bg-white focus:outline-none focus:ring-2 focus:ring-classz-200 focus:border-classz-300 ${className}`.trim()}
      {...props}
    />
  )
}

export function AdminSelect({
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full max-w-full border border-classz-100 rounded-lg px-3.5 py-2.5 text-base text-classz-700 bg-white focus:outline-none focus:ring-2 focus:ring-classz-200 min-h-[2.75rem] ${className}`.trim()}
      {...props}
    >
      {children}
    </select>
  )
}

export function AdminTextarea({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full min-h-[200px] px-3.5 py-3 border border-classz-100 rounded-lg text-base text-classz-700 font-sans leading-relaxed bg-white placeholder:text-classz-600/40 focus:outline-none focus:ring-2 focus:ring-classz-200 ${className}`.trim()}
      {...props}
    />
  )
}

export function AdminLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-classz-700 mb-1.5">{children}</label>
}

export function AdminToolbar({ children }: { children: React.ReactNode }) {
  return <div className="mb-4 flex flex-wrap items-start gap-3">{children}</div>
}

type AdminButtonSize = "sm" | "md"

const ADMIN_BTN_SIZE: Record<AdminButtonSize, string> = {
  sm: "gap-1 px-2 py-1 text-xs whitespace-nowrap",
  md: "gap-2 px-4 py-2.5 text-sm",
}

export function AdminGhostButton({
  children,
  className = "",
  size = "md",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { size?: AdminButtonSize }) {
  return (
    <button
      type="button"
      className={`inline-flex shrink-0 items-center border border-classz-200 rounded-lg font-medium text-classz-700 hover:bg-classz-50 transition-colors ${ADMIN_BTN_SIZE[size]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
}

export function AdminPrimaryButton({
  children,
  className = "",
  size = "md",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { size?: AdminButtonSize }) {
  return (
    <button
      type="button"
      className={`inline-flex shrink-0 items-center rounded-xl font-medium text-white bg-brand-teal hover:brightness-110 disabled:opacity-50 transition-colors ${ADMIN_BTN_SIZE[size]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
}

export function AdminDangerButton({
  children,
  className = "",
  size = "md",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { size?: AdminButtonSize }) {
  return (
    <button
      type="button"
      className={`inline-flex shrink-0 items-center rounded-lg font-medium text-white bg-crm-coral hover:brightness-95 border border-crm-coral disabled:opacity-50 transition-colors ${ADMIN_BTN_SIZE[size]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
}

/** Semantic chip tones from the 5-color system */
export type BrandTone = "teal" | "slate" | "magenta" | "orange" | "coral"

const TONE_CHIP: Record<BrandTone, string> = {
  teal: "bg-[color-mix(in_srgb,var(--brand-teal)_12%,white)] text-brand-teal border-[color-mix(in_srgb,var(--brand-teal)_35%,white)]",
  slate: "bg-[color-mix(in_srgb,var(--brand-slate)_8%,white)] text-brand-slate border-[color-mix(in_srgb,var(--brand-slate)_22%,white)]",
  magenta:
    "bg-[color-mix(in_srgb,var(--brand-magenta)_10%,white)] text-brand-magenta border-[color-mix(in_srgb,var(--brand-magenta)_30%,white)]",
  orange:
    "bg-[color-mix(in_srgb,var(--brand-orange)_12%,white)] text-brand-orange border-[color-mix(in_srgb,var(--brand-orange)_35%,white)]",
  coral:
    "bg-[color-mix(in_srgb,var(--brand-coral)_10%,white)] text-brand-coral border-[color-mix(in_srgb,var(--brand-coral)_35%,white)]",
}

const TONE_BAR: Record<BrandTone, string> = {
  teal: "bg-brand-teal",
  slate: "bg-brand-slate",
  magenta: "bg-brand-magenta",
  orange: "bg-brand-orange",
  coral: "bg-brand-coral",
}

const TONE_SOFT_BG: Record<BrandTone, string> = {
  teal: "bg-[color-mix(in_srgb,var(--brand-teal)_8%,white)] border-[color-mix(in_srgb,var(--brand-teal)_28%,white)]",
  slate: "bg-[color-mix(in_srgb,var(--brand-slate)_7%,white)] border-[color-mix(in_srgb,var(--brand-slate)_22%,white)]",
  magenta: "bg-[color-mix(in_srgb,var(--brand-magenta)_8%,white)] border-[color-mix(in_srgb,var(--brand-magenta)_28%,white)]",
  orange: "bg-[color-mix(in_srgb,var(--brand-orange)_8%,white)] border-[color-mix(in_srgb,var(--brand-orange)_28%,white)]",
  coral: "bg-[color-mix(in_srgb,var(--brand-coral)_8%,white)] border-[color-mix(in_srgb,var(--brand-coral)_28%,white)]",
}

export function AdminStatusChip({
  tone = "slate",
  children,
  className = "",
}: {
  tone?: BrandTone
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${TONE_CHIP[tone]} ${className}`.trim()}
    >
      {children}
    </span>
  )
}

export function brandToneBar(tone: BrandTone) {
  return TONE_BAR[tone]
}

export function brandTonePanel(tone: BrandTone) {
  return TONE_SOFT_BG[tone]
}

/** Map common payment / request statuses onto the 5 tones */
export function statusTone(status?: string | null): BrandTone {
  const s = String(status || "").toLowerCase()
  if (["paid", "active", "fulfilled", "approved", "done", "won", "confirmed", "completed"].includes(s)) return "teal"
  if (["pending", "pending_approval", "todo", "new", "draft"].includes(s)) return "magenta"
  if (["in_progress", "contacted", "beta_trial", "processing", "outstanding"].includes(s)) return "orange"
  if (["trial", "waitlist", "medium", "qualified"].includes(s)) return "slate"
  if (
    ["rejected", "cancelled", "suspended", "lost", "refunded", "failed", "high", "overdue"].includes(s)
  ) {
    return "coral"
  }
  return "slate"
}

export function priorityTone(priority?: string | null): BrandTone {
  const p = String(priority || "").toLowerCase()
  if (p === "high") return "coral"
  if (p === "medium") return "orange"
  if (p === "low") return "teal"
  return "slate"
}

export function AdminTableShell({ children }: { children: React.ReactNode }) {
  return <div className="overflow-x-auto overscroll-x-contain -mx-1 pb-1">{children}</div>
}

export function AdminTable({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return <table className={`w-full border-collapse text-sm text-classz-700 ${className}`.trim()}>{children}</table>
}

export function AdminModal({
  open,
  title,
  onClose,
  children,
  footer,
  size = "md",
}: {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
  /** md = default form; lg = tablet-friendly wide form; xl = rich content */
  size?: "md" | "lg" | "xl"
}) {
  if (!open) return null
  const widthClass =
    size === "xl"
      ? "max-w-6xl"
      : size === "lg"
        ? "max-w-3xl"
        : "max-w-lg"
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-2 sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 bg-classz-700/35" onClick={onClose} aria-label="Close" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        className={`relative bg-white rounded-t-xl sm:rounded-xl shadow-xl border border-classz-100 ${widthClass} w-full max-h-[92vh] overflow-y-auto text-base text-classz-700`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4 border-b border-classz-100 bg-classz-50">
          <h2 id="admin-modal-title" className="min-w-0 text-base sm:text-lg font-semibold text-classz-700">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-classz-600 hover:bg-classz-100 hover:text-classz-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="p-4 sm:p-5 md:p-6">{children}</div>
        {footer ? (
          <div className="sticky bottom-0 px-4 py-3 sm:px-5 sm:py-4 border-t border-classz-100 bg-classz-50 flex flex-wrap justify-end gap-2 text-base">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}
