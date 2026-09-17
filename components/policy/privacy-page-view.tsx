"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PolicyNavigation } from "@/components/policy-navigation"
import { useLanguage } from "@/components/language-provider"
import { BlockRenderer } from "@/components/cms/block-renderer"
import type { SiteBlock } from "@/lib/site-pages"

type PrivacyPageViewProps = {
  blocks: SiteBlock[]
  lastUpdated?: string | null
}

export function PrivacyPageView({ blocks, lastUpdated }: PrivacyPageViewProps) {
  const { t } = useLanguage()
  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 selection:bg-teal-100">
      <Navbar />

      {/* Hero */}
      <section className="relative w-full overflow-hidden border-b border-[#E9E9E9] min-h-[280px] md:min-h-0">
        <div className="relative w-full h-[280px] md:h-auto" style={{ paddingBottom: '0' }}>
          <div className="absolute inset-0 md:relative md:pb-[33.33%]">
            <div
              className="absolute inset-0 md:absolute bg-cover"
              style={{ backgroundImage: "url('/PolicyHeader.png')" }}
            />
          </div>
        </div>
        <div className="absolute inset-0 bg-black/40 md:bg-black/35 pointer-events-none h-[280px] md:h-full" />
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none h-[280px] md:h-full">
          <div className="max-w-[1180px] mx-auto w-full px-4 sm:px-6 md:px-10 text-center pointer-events-auto">
            <h1 className="text-white text-2xl sm:text-3xl md:text-5xl font-bold mb-2 drop-shadow-lg">
              {t("privacyPage.hero.title")}
            </h1>

          </div>
        </div>
      </section>

      {/* Navigation */}
      <PolicyNavigation align="left" />

      {/* Content */}
      <section className="py-14 bg-white">
        <div className="max-w-[960px] mx-auto px-6 md:px-10">
          <div className="prose prose-slate max-w-none space-y-8">
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-[#111929] mb-4">
                {t("privacyPage.hero.title")}
              </h1>
              <p className="text-[#111929] text-sm md:text-base mb-4">
                {lastUpdated || t("privacyPage.hero.lastUpdated")}
              </p>
              <div className="border-b border-[#E5E7EB]"></div>
            </div>
            <BlockRenderer blocks={blocks} className="space-y-8" />
          </div>
        </div>
      </section>

      {/* Navigation */}
      <PolicyNavigation align="center" title="These might help you" titleSize="xl" />

      <Footer />
    </main>
  )
}
