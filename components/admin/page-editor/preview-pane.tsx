"use client"

import { ExternalLink, Eye, Info } from "lucide-react"
import { BlockRenderer } from "@/components/cms/block-renderer"
import type { SiteBlock } from "@/lib/site-pages"
import { LANGUAGES, type EditorLanguage } from "./model"

/**
 * Preview pane (ADR-004 Decision 6): renders the *current draft* through the
 * same `BlockRenderer` the public pages use, so what an admin sees here is the
 * publishing logic itself — no second rendering code path.
 */
export function PreviewPane({
  blocks,
  language,
  title,
  intro,
  publicPath,
  emptyHint,
}: {
  blocks: SiteBlock[]
  language: EditorLanguage
  title?: string
  intro?: string
  publicPath?: string
  emptyHint?: string
}) {
  const languageLabel = LANGUAGES.find((option) => option.id === language)?.label ?? language

  return (
    <aside className="space-y-2 lg:sticky lg:top-0 lg:self-start">
      <div className="overflow-hidden rounded-xl border border-classz-100 bg-white shadow-[0_1px_2px_rgba(10,186,181,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-classz-100 bg-classz-50/70 px-3 py-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-classz-600">
            <Eye className="h-3.5 w-3.5" aria-hidden />
            Preview
          </span>
          <span className="flex items-center gap-2">
            <span className="rounded-full border border-classz-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-classz-700">
              {languageLabel}
            </span>
            {publicPath ? (
              <a
                href={publicPath}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-teal hover:underline"
              >
                <ExternalLink className="h-3 w-3" aria-hidden />
                {publicPath}
              </a>
            ) : null}
          </span>
        </div>

        <div className="max-h-[62vh] overflow-y-auto px-4 py-5">
          {title ? <h2 className="mb-1 text-xl font-semibold text-[#111929]">{title}</h2> : null}
          {intro ? <p className="mb-5 text-sm leading-relaxed text-[#4B5563]">{intro}</p> : null}
          {blocks.length > 0 ? (
            <BlockRenderer blocks={blocks} locale={language} />
          ) : (
            <p className="text-sm text-classz-600/70">
              {emptyHint ?? "Nothing to preview yet — add an element on the left."}
            </p>
          )}
        </div>
      </div>

      <p className="flex items-start gap-1.5 text-[11px] leading-snug text-classz-600/70">
        <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
        Rendered with the public page renderer, content only — the page&apos;s hero, header and footer stay code-owned.
        Unsaved edits are not live on the site.
      </p>
    </aside>
  )
}
