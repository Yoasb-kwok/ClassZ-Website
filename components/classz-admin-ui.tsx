"use client"

import type { LucideIcon } from "lucide-react"

/** Admin app background — stylerecord light end (#CEF1F0). */
export const adminSurface = "bg-classz-50"

export function AdminPageFrame({ children }: { children: React.ReactNode }) {
  return <div className="space-y-6 text-base">{children}</div>
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
    <div className="space-y-3">
      <h1 className="text-3xl md:text-4xl font-bold text-classz-700 flex items-center gap-3">
        {Icon ? <Icon className="h-8 w-8 md:h-9 md:w-9 shrink-0 text-classz-500" aria-hidden /> : null}
        {title}
      </h1>
      {description ? <p className="text-classz-600 text-base md:text-lg leading-relaxed max-w-3xl">{description}</p> : null}
    </div>
  )
}

export function AdminCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-lg shadow-md border border-classz-200 p-6 md:p-7 ${className}`.trim()}>{children}</div>
  )
}

export function AdminInput({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full px-3.5 py-2.5 border border-classz-200 rounded-md text-base text-classz-700 placeholder:text-classz-500/60 bg-white focus:outline-none focus:ring-2 focus:ring-classz-400 focus:border-classz-400 ${className}`.trim()}
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
      className={`border border-classz-200 rounded-md px-3.5 py-2.5 text-base text-classz-700 bg-white focus:outline-none focus:ring-2 focus:ring-classz-400 min-h-[2.75rem] ${className}`.trim()}
      {...props}
    >
      {children}
    </select>
  )
}

export function AdminTextarea({ className = "", ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full min-h-[200px] px-3.5 py-3 border border-classz-200 rounded-md text-base text-classz-700 font-sans leading-relaxed bg-white focus:outline-none focus:ring-2 focus:ring-classz-400 ${className}`.trim()}
      {...props}
    />
  )
}

export function AdminLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-base font-medium text-classz-700 mb-1.5">{children}</label>
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
      className={`inline-flex items-center gap-2 px-5 py-2.5 border border-classz-300 rounded-md text-base font-medium text-classz-700 hover:bg-classz-100 ${className}`.trim()}
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
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-base font-medium text-white bg-classz-400 hover:bg-classz-500 disabled:opacity-50 ${className}`.trim()}
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
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-md text-base font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 ${className}`.trim()}
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
  return <table className={`w-full border-collapse text-base ${className}`.trim()}>{children}</table>
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
      <button type="button" className="absolute inset-0 bg-classz-700/50" onClick={onClose} aria-label="Close" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        className="relative bg-white rounded-lg shadow-xl border border-classz-200 max-w-lg w-full max-h-[90vh] overflow-y-auto text-base"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-classz-200 bg-classz-50/50">
          <h2 id="admin-modal-title" className="text-xl font-semibold text-classz-700">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-classz-600 hover:bg-classz-100 hover:text-classz-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="p-5 md:p-6">{children}</div>
        {footer ? (
          <div className="px-5 py-4 border-t border-classz-100 bg-classz-50/30 flex flex-wrap justify-end gap-2 text-base">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}
