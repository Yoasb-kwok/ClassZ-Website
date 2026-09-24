"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BlockRenderer } from "@/components/cms/block-renderer"
import type { SiteBlock } from "@/lib/site-pages"

type AboutCmsViewProps = {
  blocks: SiteBlock[]
  lastUpdated?: string | null
}

/** CMS-rendered About Us page (ADR-004): blocks authored in
 *  /admin/cms/about. Rendered only when real blocks exist — app/about
 *  falls back to the static marketing page otherwise. */
export function AboutCmsView({ blocks, lastUpdated }: AboutCmsViewProps) {
  const updated = lastUpdated ? new Date(lastUpdated) : null
  const updatedLabel =
    updated && !Number.isNaN(updated.getTime())
      ? updated.toLocaleDateString("en-HK", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : null

  return (
    <main className="min-h-screen bg-white text-ink">
      <Navbar />
      <article className="mx-auto w-full max-w-[820px] px-6 py-14 md:py-20">
        <h1 className="text-4xl font-semibold tracking-[-0.03em] md:text-[52px]">
          About Us
        </h1>
        {updatedLabel ? (
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-shade-400">
            Last updated {updatedLabel}
          </p>
        ) : null}
        <div className="mt-10">
          <BlockRenderer blocks={blocks} />
        </div>
      </article>
      <Footer />
    </main>
  )
}
