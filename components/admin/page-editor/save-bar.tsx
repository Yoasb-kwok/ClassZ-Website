"use client"

import { Check, Loader2, RotateCcw, Save } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { AdminGhostButton, AdminPrimaryButton } from "@/components/classz-admin-ui"

/**
 * Sticky save bar (ADR-004 Decision 5/6): explicit save only, with a dirty
 * indicator and the API's own message on failure. No autosave.
 */
export function SaveBar({
  dirty,
  saving,
  onSave,
  onDiscard,
  dirtySummary,
  error,
  success,
  extra,
  note,
}: {
  dirty: boolean
  saving: boolean
  onSave: () => void
  /** Blocks mode: throw away local edits and reload from the API. */
  onDiscard?: () => void
  dirtySummary?: string
  error?: string | null
  success?: string | null
  /** Extra controls (e.g. reload). */
  extra?: React.ReactNode
  /** Mode-specific reminder shown above the buttons. */
  note?: React.ReactNode
}) {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"

  return (
    <div className="sticky bottom-0 z-30 -mx-1 mt-1 rounded-xl border border-classz-100 bg-white/95 px-3 py-2.5 shadow-[0_-2px_10px_rgba(10,186,181,0.10)] backdrop-blur">
      {note ? <div className="mb-2 text-xs leading-snug text-classz-600/80">{note}</div> : null}

      {error ? (
        <div
          role="alert"
          className="mb-2 rounded-md border border-[color-mix(in_srgb,var(--brand-coral)_35%,white)] bg-[color-mix(in_srgb,var(--brand-coral)_10%,white)] px-3 py-2 text-sm text-brand-coral"
        >
          {error}
        </div>
      ) : null}

      {success && !error ? (
        <div className="mb-2 flex items-center gap-1.5 rounded-md border border-[color-mix(in_srgb,var(--brand-teal)_35%,white)] bg-[color-mix(in_srgb,var(--brand-teal)_10%,white)] px-3 py-2 text-sm text-brand-teal">
          <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {success}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-classz-600">
          <span
            className={`h-2 w-2 rounded-full ${dirty ? "bg-brand-orange" : "bg-brand-teal"}`}
            aria-hidden
          />
          {dirty
            ? dirtySummary ?? (zh ? "有未儲存的變更" : "Unsaved changes")
            : zh
              ? "已全部儲存"
              : "All changes saved"}
        </span>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {extra}
          {onDiscard ? (
            <AdminGhostButton onClick={onDiscard} disabled={!dirty || saving}>
              <RotateCcw className="h-3.5 w-3.5" />
              {zh ? "捨棄變更" : "Discard changes"}
            </AdminGhostButton>
          ) : null}
          <AdminPrimaryButton onClick={onSave} disabled={!dirty || saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? (zh ? "儲存中…" : "Saving…") : zh ? "儲存" : "Save"}
          </AdminPrimaryButton>
        </div>
      </div>
    </div>
  )
}
