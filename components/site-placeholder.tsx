"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/components/language-provider"

export function SitePlaceholder({
  titleKey,
  bodyKey,
}: {
  titleKey: string
  bodyKey: string
}) {
  const { t } = useLanguage()
  return (
    <main className="min-h-screen bg-white text-ink">
      <Navbar />
      <section className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center">
        <h1 className="text-3xl font-semibold tracking-[-0.03em] md:text-4xl">{t(titleKey)}</h1>
        <p className="mt-4 text-base leading-7 text-shade-500">{t(bodyKey)}</p>
      </section>
      <Footer />
    </main>
  )
}
