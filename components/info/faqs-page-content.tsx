"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/components/language-provider"
import { FaqSection } from "@/components/cms/faq-section"
import type { FaqItemBlock } from "@/lib/site-pages"

/**
 * /faqs shell (static hero + heading) with the CMS-driven content region.
 * The FAQ items, their answers, walkthrough images and the parents/centres
 * grouping all come from GET /api/site-pages/faqs (ADR-004 Decisions 3 + 8).
 */
export function FaqsPageContent({ items, intro }: { items: FaqItemBlock[]; intro?: string | null }) {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 selection:bg-teal-100">
      <Navbar />

      {/* Hero */}
      <section className="relative w-full h-[600px] md:h-[720px] overflow-hidden bg-black">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/headerFAQs.png')" }}
        />
        <div className="pointer-events-none absolute inset-0 bg-black/55 md:bg-black/45" />
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 md:px-10 text-center">
            <h1 className="text-white text-2xl sm:text-3xl md:text-5xl font-bold mb-2 drop-shadow-lg">
              {t("faqsPage.hero.title")}
            </h1>
            <p className="text-white/90 text-sm sm:text-base md:text-xl drop-shadow-md">
              {t("faqsPage.hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="py-10 border-b border-[#E9E9E9] bg-[#F9FBFD]">
        <div className="max-w-[1080px] mx-auto px-6 md:px-10 space-y-4 text-center">
          <p className="text-sm text-[#485A69]">{t("faqsPage.tabs.description")}</p>
        </div>
      </section>

      {/* FAQ content (CMS-driven) */}
      <section className="py-14 bg-white">
        <div className="max-w-[1080px] mx-auto px-6 md:px-10">
          <FaqSection items={items} intro={intro} />
        </div>
      </section>

      <Footer />
    </main>
  )
}
