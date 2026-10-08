"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/components/language-provider"
import { useAuthModal } from "@/components/auth-modal"

const FONT =
  '"SF Pro", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

const POINTS = [
  { key: "v1", side: "left", top: "5.75%" },
  { key: "v2", side: "right", top: "22.6%" },
  { key: "v3", side: "left", top: "41.3%" },
  { key: "v4", side: "right", top: "58.1%" },
  { key: "v5", side: "left", top: "75%" },
] as const

function ArrowIcon() {
  return (
    <svg width="28" height="29" viewBox="0 0 28 29" fill="none" aria-hidden className="shrink-0">
      <path
        d="M4 14.5h18M15.5 7.5 23 14.5l-7.5 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ForParentsPage() {
  const { t } = useLanguage()
  const { openAuth } = useAuthModal()

  return (
    <main className="min-h-screen bg-white text-[#18191b]" style={{ fontFamily: FONT }}>
      <Navbar />

      <section className="mx-auto max-w-[1440px] px-6 pt-16 md:pt-28">
        <div className="mx-auto flex max-w-[1024px] flex-col items-center gap-8 text-center md:gap-10">
          <h1 className="text-[40px] leading-[48px] font-medium tracking-[-1.2px] md:text-[72px] md:leading-[72px] md:tracking-[-1.8px]">
            {t("infoPages.parents.heroLine1")}
            <br />
            {t("infoPages.parents.heroLine2")}
          </h1>
          <p className="max-w-[1024px] text-[18px] leading-7 md:text-[20px] md:leading-7">
            {t("infoPages.parents.heroBody")}
          </p>
          <button
            type="button"
            onClick={() => openAuth("register")}
            className="inline-flex items-center gap-4 rounded-full bg-[#0abab5] px-8 py-4 text-[18px] leading-7 font-medium text-white transition hover:bg-[#09a8a3]"
          >
            {t("infoPages.parents.ctaJourney")}
            <ArrowIcon />
          </button>
        </div>
        <img
          src="/parents/collage.png"
          alt=""
          className="mx-auto mt-8 w-full max-w-[1406px]"
        />
      </section>

      <section className="mx-auto max-w-[1440px] px-6 py-16 md:py-24">
        <h2 className="text-center text-[36px] leading-none font-medium md:text-[60px]">
          {t("infoPages.parents.meansTitle")}
        </h2>

        <ul className="mx-auto mt-12 max-w-[640px] space-y-10 xl:hidden">
          {POINTS.map((point) => (
            <li key={point.key} className="text-[28px] leading-9 font-medium">
              {t(`infoPages.parents.${point.key}`)}
            </li>
          ))}
          <li>
            <img src="/parents/record.png" alt="" className="mx-auto mt-6 w-full max-w-[420px]" />
          </li>
        </ul>

        <div className="relative mx-auto mt-16 hidden w-full max-w-[1408px] xl:block">
          <img src="/parents/record.png" alt="" className="mx-auto w-[36%]" />
          {POINTS.map((point) => (
            <p
              key={point.key}
              className={`absolute w-[26%] text-[32px] leading-10 font-medium 2xl:text-[36px] ${
                point.side === "left" ? "left-[6%]" : "right-[6%]"
              }`}
              style={{ top: point.top }}
            >
              {t(`infoPages.parents.${point.key}`)}
            </p>
          ))}
        </div>
      </section>

      <section className="px-6 py-16 text-center md:py-24">
        <h2 className="text-[32px] leading-10 font-medium md:text-[36px]">
          {t("infoPages.parents.startTitle")}
        </h2>
        <button
          type="button"
          onClick={() => openAuth("register")}
          className="mt-6 inline-flex items-center gap-6 rounded-full bg-[#18191b] px-8 py-4 text-[18px] leading-7 font-medium text-white transition hover:bg-[#2a2b2e]"
        >
          {t("landing.joinEarly")}
          <ArrowIcon />
        </button>
        <p className="mt-5 text-[14px] leading-5">{t("landing.noCard")}</p>
      </section>

      <Footer />
    </main>
  )
}
