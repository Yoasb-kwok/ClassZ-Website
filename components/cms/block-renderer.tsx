"use client"

import { useState } from "react"
import { ChevronDown, MapPin } from "lucide-react"
import { pickText, type BranchBlock, type FaqItemBlock, type SiteBlock } from "@/lib/site-pages"
import { useLanguage } from "@/components/language-provider"

/**
 * Renders ADR-004 CMS blocks. Shared by the public pages and the admin
 * editor's preview pane, so the preview is always faithful.
 *
 * i18n: every translatable field resolves through pickText (exact locale ->
 * English fallback, no zh-TW/zh-CN folding).
 */

type RendererProps = {
  blocks: SiteBlock[]
  /** Overrides the language provider (used by the admin preview). */
  locale?: string
  className?: string
}

export function BlockRenderer({ blocks, locale, className }: RendererProps) {
  const { locale: activeLocale } = useLanguage()
  const lang = locale ?? activeLocale

  if (!blocks?.length) return null

  return (
    <div className={className ?? "space-y-10"}>
      {blocks.map((block) => (
        <Block key={block.id} block={block} lang={lang} />
      ))}
    </div>
  )
}

function Block({ block, lang }: { block: SiteBlock; lang: string }) {
  switch (block.type) {
    case "rich_text":
      return <RichTextBlockView block={block} lang={lang} />
    case "image_split":
      return <ImageSplitBlockView block={block} lang={lang} />
    case "faq_item":
      return <FaqItemBlockView block={block} lang={lang} />
    case "branch":
      return <BranchBlockView block={block} lang={lang} />
    case "cta":
      return <CtaBlockView block={block} lang={lang} />
    default:
      // Forward compatibility: unknown block types are skipped, never crash.
      return null
  }
}

function RichTextBlockView({ block, lang }: { block: Extract<SiteBlock, { type: "rich_text" }>; lang: string }) {
  const title = pickText(block, "title", lang)
  const body = pickText(block, "body_html", lang)
  return (
    <section>
      {title ? <h3 className="mb-3 text-xl font-semibold text-[#111929] md:text-2xl">{title}</h3> : null}
      {body ? (
        <div
          className="space-y-3 text-[15px] leading-relaxed text-[#4B5563]"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      ) : null}
    </section>
  )
}

function ImageSplitBlockView({ block, lang }: { block: Extract<SiteBlock, { type: "image_split" }>; lang: string }) {
  const body = pickText(block, "body_html", lang)
  const alt = pickText(block, "image_alt", lang)
  const imageFirst = String(block.layout) === "split-image-left"
  return (
    <section className="grid items-center gap-8 md:grid-cols-2">
      <div className={imageFirst ? "md:order-1" : "md:order-2"}>
        {block.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={block.image_url} alt={alt} className="h-64 w-full rounded-3xl object-cover" />
        ) : (
          <div className="h-64 w-full rounded-3xl bg-[#E7F8F7]" />
        )}
      </div>
      <div className={imageFirst ? "md:order-2" : "md:order-1"}>
        {body ? (
          <div
            className="space-y-3 text-[15px] leading-relaxed text-[#4B5563]"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        ) : null}
      </div>
    </section>
  )
}

function FaqItemBlockView({ block, lang }: { block: FaqItemBlock; lang: string }) {
  const [open, setOpen] = useState(false)
  const question = pickText(block, "question", lang)
  const answer = pickText(block, "answer_html", lang)
  const images = Array.isArray(block.images) ? block.images : []

  return (
    <div className="border-b border-[#E5E7EB] pb-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-4 text-left"
      >
        <div className="flex items-start gap-3">
          <span className="text-base font-semibold text-[#5AE0D6]">Q</span>
          <span className="text-base leading-snug text-[#111929] md:text-lg">{question}</span>
        </div>
        <ChevronDown
          className={`mt-0.5 h-5 w-5 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="mt-4 space-y-4 pl-7 text-sm leading-relaxed text-[#4B5563]">
          {answer ? <div className="space-y-2" dangerouslySetInnerHTML={{ __html: answer }} /> : null}
          {images.length > 0 && (
            <div className={`grid gap-4 pt-1 ${images.length > 1 ? "sm:grid-cols-2" : ""}`}>
              {images.map((img) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={img.src}
                  src={img.src}
                  alt={img.alt || ""}
                  className="w-full rounded-2xl border border-[#E5E7EB]"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BranchBlockView({ block, lang }: { block: BranchBlock; lang: string }) {
  const name = pickText(block, "name", lang)
  const address = pickText(block, "address", lang)
  const hours = pickText(block, "hours", lang)
  const mapQuery = block.map_query || address
  return (
    <section className="rounded-2xl border border-[#E5E7EB] p-6">
      {block.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={block.image_url} alt={name} className="mb-4 h-44 w-full rounded-xl object-cover" />
      ) : null}
      <h3 className="text-lg font-semibold text-[#111929]">{name}</h3>
      {address ? (
        <p className="mt-2 flex items-start gap-2 text-sm text-[#4B5563]">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#00A3A0]" />
          <span>{address}</span>
        </p>
      ) : null}
      {hours ? <p className="mt-1 text-sm text-[#4B5563]">{hours}</p> : null}
      {mapQuery ? (
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(mapQuery)}`}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-sm font-semibold text-[#00A3A0] underline decoration-dotted"
        >
          {lang === "zh-TW" || lang === "zh-CN" ? "在地圖上查看" : "View on map"}
        </a>
      ) : null}
    </section>
  )
}

function CtaBlockView({ block, lang }: { block: Extract<SiteBlock, { type: "cta" }>; lang: string }) {
  const label = pickText(block, "label", lang)
  return (
    <section className="text-center">
      <a
        href={block.href}
        className="inline-block rounded-full bg-[#00A3A0] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#008f8a]"
      >
        {label}
      </a>
    </section>
  )
}
