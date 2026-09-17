"use client"

import { AdminInput, AdminLabel, AdminTextarea } from "@/components/classz-admin-ui"
import { LANGUAGES, fieldName, hasText, readText, type EditorLanguage } from "./model"

/**
 * Per-field language toggle (ADR-004 Decision 4/6).
 *
 * Every translatable field stores its variants inline (`body_html`,
 * `body_html_zh_tw`, `body_html_zh_cn`), so one toggle switches which variant
 * the input edits and the dot shows whether that variant has content.
 */

export function LanguageTabs({
  language,
  onLanguageChange,
  record,
  field,
  className = "",
}: {
  language: EditorLanguage
  onLanguageChange: (language: EditorLanguage) => void
  /** When given, each tab shows whether that language's variant is filled. */
  record?: object
  field?: string
  className?: string
}) {
  return (
    <div
      role="group"
      aria-label="Content language"
      className={`inline-flex shrink-0 items-center gap-0.5 rounded-lg border border-classz-100 bg-classz-50/60 p-0.5 ${className}`.trim()}
    >
      {LANGUAGES.map((option) => {
        const active = option.id === language
        const filled = record && field ? hasText(record, fieldName(field, option.id)) : null
        return (
          <button
            key={option.id}
            type="button"
            title={filled === null ? option.label : `${option.label} — ${filled ? "filled" : "empty"}`}
            aria-pressed={active}
            onClick={() => onLanguageChange(option.id)}
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition-colors ${
              active ? "bg-white text-classz-700 shadow-sm" : "text-classz-600 hover:text-classz-700"
            }`}
          >
            {option.short}
            {filled === null ? null : (
              <span
                className={`h-1.5 w-1.5 rounded-full ${filled ? "bg-brand-teal" : "bg-classz-200"}`}
                aria-hidden
              />
            )}
            <span className="sr-only">{filled === null ? "" : filled ? "filled" : "empty"}</span>
          </button>
        )
      })}
    </div>
  )
}

export type LanguageFieldProps = {
  label: string
  /** The element that owns the field (a block draft or an item row). */
  record: object
  /** Base field name, e.g. `body_html`. */
  field: string
  language: EditorLanguage
  onLanguageChange: (language: EditorLanguage) => void
  onPatch: (patch: Record<string, string | null>) => void
  multiline?: boolean
  rows?: number
  placeholder?: string
  /** Overrides the default "empty variants fall back to English" hint. */
  hint?: string
}

export function LanguageField({
  label,
  record,
  field,
  language,
  onLanguageChange,
  onPatch,
  multiline = false,
  rows,
  placeholder,
  hint,
}: LanguageFieldProps) {
  const name = fieldName(field, language)
  const value = readText(record, name)
  const meta = LANGUAGES.find((option) => option.id === language)
  const defaultHint =
    language === "en"
      ? undefined
      : hasText(record, name)
        ? undefined
        : `Empty — the site shows the English text for ${meta?.label ?? language}.`

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <AdminLabel>
          {label}
          {language === "en" ? null : <span className="ml-1 text-xs font-normal text-classz-600">· {meta?.label}</span>}
        </AdminLabel>
        <LanguageTabs
          language={language}
          onLanguageChange={onLanguageChange}
          record={record}
          field={field}
        />
      </div>
      {multiline ? (
        <AdminTextarea
          className={rows ? "min-h-[96px]" : ""}
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onPatch({ [name]: event.target.value })}
        />
      ) : (
        <AdminInput
          value={value}
          placeholder={placeholder}
          onChange={(event) => onPatch({ [name]: event.target.value })}
        />
      )}
      {hint ?? defaultHint ? (
        <p className="mt-1 text-xs leading-snug text-classz-600/70">{hint ?? defaultHint}</p>
      ) : null}
    </div>
  )
}
