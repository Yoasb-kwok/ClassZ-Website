"use client"

import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/components/language-provider"
import { GREEN_FONT } from "@/components/info/green-arrow"

/**
 * Public confirmation only. "Track this request" is omitted: there is no
 * public status-by-reference API, and the contact proxy does not return a
 * case id. Login-gated status frames stay out of this page.
 */
export function CancellationSubmittedPage() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen bg-white text-[#141417]" style={{ fontFamily: GREEN_FONT }}>
      <Navbar />
      <section className="relative overflow-hidden bg-[#f7f9f9] px-4 pt-16 pb-24 md:px-8 md:pt-20">
        <div className="pointer-events-none absolute bottom-10 left-[-10%] h-[300px] w-[300px] rounded-full bg-[#b7f6f2] opacity-70 blur-[90px]" />
        <div className="pointer-events-none absolute right-[6%] bottom-0 h-[260px] w-[260px] rounded-full bg-[#fff4b0] opacity-70 blur-[90px]" />
        <div className="relative mx-auto flex max-w-[1120px] flex-col gap-6">
          <p className="text-[13px] font-semibold tracking-[0.04em] text-[#0abab5]">
            {t("greenPages.cancel.receivedEyebrow")}
          </p>
          <h1 className="max-w-[920px] text-[40px] leading-[1.1] font-medium md:text-[64px] md:leading-[68px]">
            {t("greenPages.cancel.receivedHero")}
          </h1>
          <div className="flex flex-col gap-5 rounded-[32px] bg-white p-8 md:p-14">
            <h2 className="text-[28px] leading-9 font-medium md:text-[32px]">{t("greenPages.cancel.receivedTitle")}</h2>
            <p className="inline-flex w-fit rounded-full bg-[#e8fcfa] px-3 py-2 text-[13px] font-semibold">
              {t("greenPages.cancel.receivedStatus")}
            </p>
            <p className="max-w-[820px] text-[16px] leading-6 text-[#61666b]">{t("greenPages.cancel.receivedBody")}</p>
            <div className="rounded-[20px] bg-[#fff7d6] p-6">
              <p className="text-[17px] font-semibold">{t("greenPages.cancel.nextTitle")}</p>
              <p className="mt-2 text-[15px] leading-6 text-[#61666b]">{t("greenPages.cancel.nextBody")}</p>
            </div>
            <Link
              href="/contact-us"
              className="inline-flex w-fit items-center justify-center rounded-[24px] border border-[#0abab5] bg-white px-7 py-4 text-[15px] font-medium text-[#0abab5]"
            >
              {t("greenPages.cancel.back")}
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
