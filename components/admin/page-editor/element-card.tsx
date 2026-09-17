"use client"

import { ArrowDown, ArrowUp, ChevronRight, Copy, Trash2 } from "lucide-react"
import type { SiteBlock } from "@/lib/site-pages"
import { useLanguage } from "@/components/language-provider"
import { AdminStatusChip } from "@/components/classz-admin-ui"
import { BLOCK_TYPE_META, ElementForm, summarizeBlock, translationState } from "./element-forms"
import { LANGUAGES, type BlockPatch, type EditorLanguage } from "./model"

/**
 * One card per element (ADR-004 Decision 6): type badge + one-line summary,
 * expandable to the per-type form, with ↑↓ / duplicate / delete actions.
 * No drag-and-drop dependency — reordering is two buttons.
 */

function IconButton({
  title,
  onClick,
  disabled,
  tone = "slate",
  children,
}: {
  title: string
  onClick: () => void
  disabled?: boolean
  tone?: "slate" | "coral"
  children: React.ReactNode
}) {
  const tones = {
    slate: "text-classz-600 hover:bg-classz-100 hover:text-classz-700",
    coral: "text-brand-coral hover:bg-[color-mix(in_srgb,var(--brand-coral)_10%,white)]",
  }
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-md p-1.5 transition-colors disabled:opacity-25 disabled:hover:bg-transparent ${tones[tone]}`}
    >
      {children}
    </button>
  )
}

export type ElementCardProps = {
  block: SiteBlock
  index: number
  total: number
  expanded: boolean
  onToggle: () => void
  onMove: (delta: number) => void
  onDuplicate: () => void
  onDelete: () => void
  language: EditorLanguage
  onLanguageChange: (language: EditorLanguage) => void
  onPatch: (patch: BlockPatch) => void
  /** Items mode: row-level fields (display_order / is_active) live on the card. */
  hideRowFields?: boolean
  /** Extra chips next to the type badge (audience, published state, …). */
  badges?: React.ReactNode
  /** Extra controls in the header (e.g. the is_active toggle). */
  headerExtra?: React.ReactNode
  /** Extra controls under the form (e.g. a per-row Save button). */
  footer?: React.ReactNode
  /** Validation: the save was blocked by something inside this element. */
  highlight?: boolean
  /** Row-level work in flight (items mode). */
  busy?: boolean
}

export function ElementCard({
  block,
  index,
  total,
  expanded,
  onToggle,
  onMove,
  onDuplicate,
  onDelete,
  language,
  onLanguageChange,
  onPatch,
  hideRowFields,
  badges,
  headerExtra,
  footer,
  highlight,
  busy,
}: ElementCardProps) {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const meta = BLOCK_TYPE_META[block.type]

  return (
    <section
      className={`overflow-hidden rounded-xl border bg-white shadow-[0_1px_2px_rgba(10,186,181,0.06)] ${
        highlight ? "border-brand-coral" : "border-classz-100/80"
      }`}
    >
      <div className="flex items-start gap-2 p-2.5">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-start gap-2 rounded-lg p-1 text-left transition-colors hover:bg-classz-50"
        >
          <ChevronRight
            className={`mt-0.5 h-4 w-4 shrink-0 text-classz-500 transition-transform ${expanded ? "rotate-90" : ""}`}
            aria-hidden
          />
          <span className="flex min-w-0 flex-col gap-1">
            <span className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-semibold tabular-nums text-classz-600">
                {String(index + 1).padStart(2, "0")}
              </span>
              <AdminStatusChip tone={meta.tone}>{zh ? meta.labelZh : meta.label}</AdminStatusChip>
              <span className="flex items-center gap-0.5">
                {translationState(block).map(({ language: lang, filled }) => (
                  <span
                    key={lang}
                    title={`${LANGUAGES.find((option) => option.id === lang)?.label ?? lang}: ${filled ? "filled" : "empty"}`}
                    className={`rounded px-1 py-0.5 text-[10px] font-semibold ${
                      filled
                        ? "bg-[color-mix(in_srgb,var(--brand-teal)_12%,white)] text-brand-teal"
                        : "bg-classz-50 text-classz-600/50"
                    }`}
                  >
                    {LANGUAGES.find((option) => option.id === lang)?.short ?? lang}
                  </span>
                ))}
              </span>
              {badges}
            </span>
            <span className="truncate text-sm leading-snug text-classz-700">{summarizeBlock(block, language)}</span>
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-0.5">
          {busy ? (
            <span className="px-1 text-xs text-classz-600">{zh ? "儲存中…" : "Saving…"}</span>
          ) : null}
          {headerExtra}
          <IconButton title={zh ? "上移" : "Move up"} disabled={index === 0} onClick={() => onMove(-1)}>
            <ArrowUp className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton title={zh ? "下移" : "Move down"} disabled={index === total - 1} onClick={() => onMove(1)}>
            <ArrowDown className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton title={zh ? "複製" : "Duplicate"} onClick={onDuplicate}>
            <Copy className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton title={zh ? "刪除" : "Delete"} tone="coral" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </IconButton>
        </div>
      </div>

      {expanded ? (
        <div className="border-t border-classz-100/80 bg-classz-50/30 p-3.5">
          <ElementForm
            block={block}
            language={language}
            onLanguageChange={onLanguageChange}
            onPatch={onPatch}
            hideRowFields={hideRowFields}
          />
          {footer ? <div className="mt-4 flex flex-wrap items-center gap-2">{footer}</div> : null}
        </div>
      ) : null}
    </section>
  )
}
