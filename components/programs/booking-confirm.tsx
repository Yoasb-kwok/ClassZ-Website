"use client"

import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/components/language-provider"

export function BookingConfirm({
  name,
  centreName,
  instructor,
  priceLabel,
  checkoutHref,
}: {
  name: string
  centreName: string
  instructor: string
  priceLabel: string
  checkoutHref: string
}) {
  const { t } = useLanguage()
  const host = [centreName, instructor].filter(Boolean).join(" · ")

  return (
    <main className="min-h-screen bg-white text-[#18191b]">
      <Navbar />
      <section className="mx-auto max-w-[1120px] px-6 py-12 md:px-10 md:py-16">
        <h1 className="text-[40px] leading-[1.1] font-medium md:text-[56px]">{t("greenPages.market.confirmTitle")}</h1>
        <p className="mt-3 text-[18px] leading-7 text-[#404040]">{t("greenPages.market.confirmSub")}</p>
        <article className="mt-10 max-w-[760px] rounded-[28px] border border-[#ececec] p-6 md:p-10">
          <h2 className="text-[24px] font-semibold">{name}</h2>
          {host ? <p className="mt-2 text-[16px] text-[#404040]">{host}</p> : null}
          <p className="mt-8 text-[14px] text-[#5e5e5e]">{t("greenPages.market.totalLabel")}</p>
          <p className="mt-1 text-[40px] leading-none font-semibold">{priceLabel}</p>
          <p className="mt-8 text-[14px] leading-6 text-[#5e5e5e]">
            {t("greenPages.market.disclaimerBefore")}
            <Link href="/refund" className="underline">
              {t("greenPages.market.refundPolicy")}
            </Link>
            {t("greenPages.market.disclaimerMid")}
            <Link href="/terms" className="underline">
              {t("greenPages.market.terms")}
            </Link>
            {t("greenPages.market.disclaimerAfter")}
          </p>
          <Link
            href={checkoutHref}
            className="mt-8 flex h-14 items-center justify-center rounded-[12px] bg-[#18191b] text-[16px] font-medium text-white transition hover:bg-[#2a2b2e]"
          >
            {t("greenPages.market.continue")}
          </Link>
        </article>
      </section>
      <Footer />
    </main>
  )
}
