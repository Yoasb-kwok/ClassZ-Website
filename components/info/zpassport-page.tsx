"use client"

import type { ReactNode } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/components/language-provider"
import { useAuthModal } from "@/components/auth-modal"

const FONT =
  '"SF Pro", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

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

function Feature({
  eyebrow,
  title,
  children,
  image,
  flip,
}: {
  eyebrow: string
  title: string
  children: ReactNode
  image: string
  flip?: boolean
}) {
  return (
    <section className="mx-auto grid max-w-[1440px] items-center lg:grid-cols-2">
      <div className={`px-6 py-12 md:p-16 ${flip ? "lg:order-2" : ""}`}>
        <div className="mx-auto max-w-[462px]">
          <p className="text-[16px] leading-6 font-medium tracking-[0.4px] text-[#0abab5] uppercase">
            {eyebrow}
          </p>
          <h2 className="mt-4 text-[40px] leading-none font-medium tracking-[-1.5px] text-[#18191b] md:text-[60px] md:leading-[60px]">
            {title}
          </h2>
          <div className="mt-6 space-y-4 text-[18px] leading-7 text-[#404040]">{children}</div>
        </div>
      </div>
      <div className={flip ? "lg:order-1" : ""}>
        <img src={image} alt="" className="h-auto w-full" />
      </div>
    </section>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1 ps-[27px]">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

export function ZPassportPage() {
  const { t } = useLanguage()
  const { openAuth } = useAuthModal()

  return (
    <main className="min-h-screen bg-white text-[#18191b]" style={{ fontFamily: FONT }}>
      <Navbar />

      <section className="mx-auto max-w-[1440px] px-4 pt-16 pb-6 md:pt-28">
        <div className="mx-auto max-w-[973px] text-center">
          <h1 className="text-[40px] leading-[48px] font-medium tracking-[-1.2px] md:text-[72px] md:leading-[72px] md:tracking-[-1.8px]">
            {t("infoPages.zpassport.heroTitle")}
          </h1>
          <p className="mx-auto mt-8 max-w-[535px] text-[20px] leading-7">
            {t("infoPages.zpassport.heroSubtitle")}
          </p>
        </div>
        <img
          src="/zpassport/hero-visual.png"
          alt=""
          className="mx-auto mt-10 w-full max-w-[1360px]"
        />
      </section>

      <section className="mx-auto max-w-[770px] px-6 py-16 text-center md:py-24">
        <div className="mb-8 flex items-center justify-center gap-2" aria-hidden>
          <img src="/zpassport/z-mark.svg" alt="" width={36} height={44} />
          <img src="/zpassport/passport-word.svg" alt="" width={356} height={74} className="h-[52px] w-auto md:h-[74px]" />
        </div>
        <h2 className="text-[28px] leading-9 font-medium md:text-[36px] md:leading-10">
          {t("infoPages.zpassport.brandTitle")}
        </h2>
        <p className="mt-5 text-[18px] leading-7 text-[#404040]">{t("infoPages.zpassport.brandBody")}</p>
      </section>

      <Feature
        eyebrow={t("infoPages.zpassport.f1Eyebrow")}
        title={t("infoPages.zpassport.f1Title")}
        image="/zpassport/observations.png"
      >
        <p>{t("infoPages.zpassport.f1Lead")}</p>
        <BulletList
          items={[
            t("infoPages.zpassport.f1b1"),
            t("infoPages.zpassport.f1b2"),
            t("infoPages.zpassport.f1b3"),
            t("infoPages.zpassport.f1b4"),
          ]}
        />
      </Feature>

      <Feature
        flip
        eyebrow={t("infoPages.zpassport.f2Eyebrow")}
        title={t("infoPages.zpassport.f2Title")}
        image="/zpassport/progress.png"
      >
        <p>{t("infoPages.zpassport.f2Lead")}</p>
        <BulletList
          items={[
            t("infoPages.zpassport.f2b1"),
            t("infoPages.zpassport.f2b2"),
            t("infoPages.zpassport.f2b3"),
            t("infoPages.zpassport.f2b4"),
          ]}
        />
        <p>{t("infoPages.zpassport.f2Close")}</p>
      </Feature>

      <Feature
        eyebrow={t("infoPages.zpassport.f3Eyebrow")}
        title={t("infoPages.zpassport.f3Title")}
        image="/zpassport/companion.png"
      >
        <p>{t("infoPages.zpassport.f3Lead")}</p>
        <p>{t("infoPages.zpassport.f3See")}</p>
        <BulletList
          items={[
            t("infoPages.zpassport.f3b1"),
            t("infoPages.zpassport.f3b2"),
            t("infoPages.zpassport.f3b3"),
            t("infoPages.zpassport.f3b4"),
          ]}
        />
      </Feature>

      <Feature
        flip
        eyebrow={t("infoPages.zpassport.f4Eyebrow")}
        title={t("infoPages.zpassport.f4Title")}
        image="/zpassport/next-steps.png"
      >
        <p>{t("infoPages.zpassport.f4Body")}</p>
      </Feature>

      <section className="bg-[#18191b] text-white">
        <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-6 py-16 md:px-16 md:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <div className="max-w-[650px]">
            <h2 className="text-[40px] leading-none font-bold tracking-[-1.5px] md:text-[60px] md:leading-[60px]">
              {t("infoPages.zpassport.ctaTitle")}
            </h2>
            <p className="mt-5 text-[18px] leading-7">{t("infoPages.zpassport.ctaBody")}</p>
            <button
              type="button"
              onClick={() => openAuth("register")}
              className="mt-10 inline-flex items-center gap-6 rounded-full bg-white px-8 py-4 text-[18px] leading-7 font-medium text-[#18191b] transition hover:bg-[#F6F3F3]"
            >
              {t("landing.joinEarly")}
              <ArrowIcon />
            </button>
            <p className="mt-5 text-[14px] leading-5">{t("landing.noCard")}</p>
          </div>
          <img
            src="/landing/figma/cta-card.png"
            alt=""
            className="w-full [mask-image:linear-gradient(to_right,#000_68%,transparent_100%)]"
          />
        </div>
      </section>

      <Footer />
    </main>
  )
}
