"use client"

import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/components/language-provider"
import { GREEN_FONT, GreenArrow } from "@/components/info/green-arrow"

/**
 * Store buttons stay on the page as the Green frame draws them.
 * The repo has no official App Store or Play listing, so they do not
 * navigate to an invented store URL. The QR opens this page on classz.co.
 */
export function DownloadPage() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen bg-[#f6f3f3] text-[#18191b]" style={{ fontFamily: GREEN_FONT }}>
      <Navbar />
      <section className="relative overflow-hidden px-4 pt-16 pb-8 text-center md:px-8 md:pt-24">
        <div className="pointer-events-none absolute top-[10%] left-[8%] h-[280px] w-[280px] rounded-full bg-[#fff4b0] opacity-70 blur-[90px]" />
        <div className="relative mx-auto max-w-[980px]">
          <h1 className="text-[40px] leading-[1.1] font-medium tracking-[-1.5px] md:text-[64px] md:leading-[68px]">
            {t("greenPages.download.hero")}
          </h1>
          <p className="mx-auto mt-5 max-w-[680px] text-[18px] leading-7 text-[#404040]">
            {t("greenPages.download.sub")}
          </p>
          <img
            src="/school/booking.png"
            alt={t("greenPages.download.previewAlt")}
            className="mx-auto mt-10 w-full max-w-[980px] rounded-[24px] bg-white object-contain shadow-[0_16px_50px_rgba(15,23,42,0.08)]"
          />
        </div>
      </section>

      <section className="px-4 py-12 text-center md:py-16">
        <h2 className="text-[32px] leading-10 font-medium md:text-[40px]">{t("greenPages.download.sectionTitle")}</h2>
        <p className="mt-3 text-[16px] leading-6 text-[#5e5e5e]">{t("greenPages.download.sectionSub")}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-6 sm:flex-row">
          <div className="flex flex-col gap-3 sm:flex-row">
            <span
              className="inline-flex items-center gap-3 rounded-full bg-[#0abab5] px-6 py-3 text-[16px] font-medium text-white"
              aria-disabled="true"
            >
              {t("greenPages.download.android")}
              <GreenArrow className="scale-75" />
            </span>
            <span
              className="inline-flex items-center gap-3 rounded-full bg-[#18191b] px-6 py-3 text-[16px] font-medium text-white"
              aria-disabled="true"
            >
              {t("greenPages.download.ios")}
              <GreenArrow className="scale-75" />
            </span>
          </div>
          <img
            src="/download/site-qr.png"
            alt={t("greenPages.download.qrAlt")}
            width={148}
            height={148}
            className="rounded-[12px] bg-white p-2"
          />
        </div>
      </section>

      <section className="bg-white px-4 py-16 md:px-8 md:py-20">
        <h2 className="text-center text-[32px] leading-10 font-medium md:text-[40px]">
          {t("greenPages.download.journey")}
        </h2>
        <div className="mx-auto mt-12 grid max-w-[1100px] gap-8 md:grid-cols-3">
          <Benefit icon="/about/icon-house.svg" title={t("greenPages.download.discoverTitle")} body={t("greenPages.download.discoverBody")} />
          <Benefit icon="/about/icon-heart-a.svg" title={t("greenPages.download.stayTitle")} body={t("greenPages.download.stayBody")} />
          <Benefit icon="/about/icon-people.svg" title={t("greenPages.download.rememberTitle")} body={t("greenPages.download.rememberBody")} />
        </div>
      </section>

      <section className="bg-[#18191b] px-6 py-16 text-center text-white md:py-20">
        <h2 className="text-[32px] leading-10 font-medium md:text-[40px]">{t("greenPages.download.laterTitle")}</h2>
        <p className="mx-auto mt-4 max-w-[640px] text-[16px] leading-6 text-white/80">
          {t("greenPages.download.laterBody")}
        </p>
        <Link
          href="/early-access"
          className="mt-8 inline-flex items-center gap-4 rounded-full bg-white px-8 py-3 text-[16px] font-medium text-[#18191b] transition hover:bg-[#f6f3f3]"
        >
          {t("greenPages.download.laterCta")}
          <GreenArrow className="scale-75" />
        </Link>
      </section>
      <Footer />
    </main>
  )
}

function Benefit({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <article className="flex flex-col items-center gap-4 px-4 text-center">
      <img src={icon} alt="" width={50} height={50} />
      <h3 className="text-[28px] font-medium tracking-[-1px]">{title}</h3>
      <p className="max-w-[280px] text-[16px] leading-6 text-[#404040]">{body}</p>
    </article>
  )
}
