"use client"

import type { LucideIcon } from "lucide-react"

/** Admin canvas — light tone (#CEF1F0 / white) + dark tone (#044A48). */
export const adminSurface = "bg-white text-classz-700"

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
      className={`bg-white rounded-xl border border-classz-100/80 p-3.5 md:p-4 text-classz-700 shadow-[0_1px_2px_rgba(10,186,181,0.05)] ${className}`.trim()}
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
  return <div className="mb-4 flex flex-wrap items-center gap-3">{children}</div>
}

export function AdminGhostButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 px-4 py-2.5 border border-classz-200 rounded-lg text-sm font-medium text-classz-700 hover:bg-classz-50 transition-colors ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
}

export function AdminPrimaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-classz-400 hover:bg-classz-300 disabled:opacity-50 transition-colors ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
}

export function AdminDangerButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-classz-50 bg-classz-600 hover:bg-classz-700 border border-classz-700 disabled:opacity-50 transition-colors ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
}

export function AdminTableShell({ children }: { children: React.ReactNode }) {
  return <div className="overflow-x-auto -mx-1">{children}</div>
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
}: {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-classz-700/35" onClick={onClose} aria-label="Close" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        className="relative bg-white rounded-xl shadow-xl border border-classz-100 max-w-lg w-full max-h-[90vh] overflow-y-auto text-base text-classz-700"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-classz-100 bg-classz-50">
          <h2 id="admin-modal-title" className="text-lg font-semibold text-classz-700">
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
        <div className="p-5 md:p-6">{children}</div>
        {footer ? (
          <div className="px-5 py-4 border-t border-classz-100 bg-classz-50 flex flex-wrap justify-end gap-2 text-base">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}
