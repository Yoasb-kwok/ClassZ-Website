"use client"

import { useState } from "react"
import { BlockRenderer } from "@/components/cms/block-renderer"
import { useLanguage } from "@/components/language-provider"
import type { FaqItemBlock } from "@/lib/site-pages"

/**
 * The /faqs content region: groups faq_item blocks into the parents / centres
 * tabs (ADR-004 Decision 8) and renders each item through BlockRenderer, so the
 * public page and the admin preview share one implementation.
 *
 * Tab membership comes from the seeded display_order convention:
 * parents < 100 <= centres.
 */
export function FaqSection({ items, intro }: { items: FaqItemBlock[]; intro?: string | null }) {
  const { locale } = useLanguage()
  const zh = String(locale).startsWith("zh")

  const audienceOf = (item: FaqItemBlock): "parents" | "centres" =>
    item.audience ?? (Number(item.display_order ?? 0) < 100 ? "parents" : "centres")

  const parents = items.filter((i) => audienceOf(i) === "parents")
  const centres = items.filter((i) => audienceOf(i) === "centres")
  const hasBoth = parents.length > 0 && centres.length > 0

  const [tab, setTab] = useState<"parents" | "centres">(parents.length ? "parents" : "centres")
  const list = tab === "parents" ? parents : centres

  const labels = {
    parents: zh ? "家長" : "Parents",
    centres: zh ? "中心" : "Centres",
    collapse: zh ? "全部收起" : "Collapse all",
  }

  // Remounting on collapseAll forces every accordion item closed.
  const [instance, setInstance] = useState(0)

  return (
    <div className="space-y-8">
      {intro ? <p className="text-[15px] leading-relaxed text-[#4B5563]">{intro}</p> : null}

      {hasBoth && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {(["parents", "centres"] as const).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  tab === id
                    ? "bg-[#00A3A0] text-white"
                    : "bg-[#E7F8F7] text-[#044A48] hover:bg-[#d6f2f0]"
                }`}
              >
                {labels[id]}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setInstance((n) => n + 1)}
            className="text-xs font-medium text-[#00A3A0] underline decoration-dotted hover:text-[#008f8a]"
          >
            {labels.collapse}
          </button>
        </div>
      )}

      {list.length === 0 ? (
        <p className="text-sm text-[#4B5563]">{zh ? "暫無內容。" : "No content yet."}</p>
      ) : (
        <BlockRenderer key={`${tab}-${instance}`} blocks={list} className="space-y-6" />
      )}
    </div>
  )
}
