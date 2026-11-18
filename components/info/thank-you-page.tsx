"use client"

import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/components/language-provider"
import { GREEN_FONT, GreenArrow } from "@/components/info/green-arrow"

export function ThankYouPage() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen bg-[#f5f2f2] text-[#18191b]" style={{ fontFamily: GREEN_FONT }}>
      <Navbar />
      <section className="px-4 py-4 md:px-4">
        <div className="relative overflow-hidden rounded-[24px] bg-white px-6 py-24 text-center md:px-20 md:py-28">
          <div className="pointer-events-none absolute top-[8%] left-[-12%] h-[360px] w-[360px] rounded-full bg-[#ffd0e4] opacity-50 blur-[80px]" />
          <div className="pointer-events-none absolute top-[20%] right-[8%] h-[320px] w-[320px] rounded-full bg-[#b7f6f2] opacity-60 blur-[90px]" />
          <div className="pointer-events-none absolute bottom-[10%] left-[18%] h-[240px] w-[240px] rounded-full bg-[#fff4b0] opacity-70 blur-[80px]" />
          <div className="relative mx-auto max-w-[820px]">
            <h1 className="text-[48px] leading-[1.05] font-medium tracking-[-1.5px] md:text-[72px] md:leading-[60px]">
              {t("greenPages.thanks.hero")}
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-7 text-[#404040]">
              {t("greenPages.thanks.body")}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/"
                className="inline-flex items-center gap-[18px] rounded-full bg-[#0abab5] py-[18px] pr-8 pl-[34px] text-[18px] leading-7 font-medium text-white transition hover:bg-[#089591]"
              >
                {t("greenPages.thanks.home")}
                <GreenArrow />
              </Link>
              <Link
                href="/centres"
                className="inline-flex items-center gap-6 rounded-full bg-[#18191b] px-8 py-4 text-[18px] leading-7 font-medium text-white transition hover:bg-[#2a2b2e]"
              >
                {t("greenPages.thanks.explore")}
                <GreenArrow />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
