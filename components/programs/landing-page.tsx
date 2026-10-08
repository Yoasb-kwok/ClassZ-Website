"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/components/language-provider"
import { useAuthModal } from "@/components/auth-modal"

const FONT =
  '"SF Pro", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

const LOGOS = Array.from({ length: 13 }, (_, i) => `/landing/figma/logo-tight-${i + 1}.png`)

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

function StepCopy({
  icon,
  index,
  title,
  body,
}: {
  icon: string
  index: string
  title: ReactNode
  body: string
}) {
  return (
    <div className="flex max-w-[440px] flex-col gap-6">
      <div className="flex items-center gap-2.5">
        <img src={icon} alt="" className="size-[51px] object-contain" />
        <p className="text-[36px] leading-10 font-medium text-[#18191b]">{index}</p>
      </div>
      <h3 className="text-[32px] leading-10 font-medium tracking-[-0.4px] text-[#18191b] md:text-[36px]">
        {title}
      </h3>
      <p className="max-w-[392px] text-[18px] leading-7 text-[#404040]">{body}</p>
    </div>
  )
}

export function LandingPage() {
  const { t } = useLanguage()
  const { openAuth } = useAuthModal()

  return (
    <main className="min-h-screen bg-[#F6F3F3] text-[#18191b]" style={{ fontFamily: FONT }}>
      <Navbar />

      <section className="px-4 pb-6 pt-16 md:px-8 md:pt-20">
        <div className="mx-auto flex max-w-[1023px] flex-col items-center text-center">
          <h1 className="tracking-[-1.8px]">
            <span className="block text-[32px] leading-tight font-medium md:text-[50px] md:leading-[72px]">
              {t("landing.heroTitle")}
            </span>
            <span className="mt-1 block text-[40px] leading-tight font-medium md:text-[72px] md:leading-[72px]">
              {t("landing.heroHeadline")}
            </span>
          </h1>
          <p className="mt-6 max-w-[653px] text-[18px] leading-7 md:text-[20px]">
            {t("landing.heroSubtitle")}
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
            <button
              type="button"
              onClick={() => openAuth("register")}
              className="inline-flex items-center gap-[18px] rounded-full bg-[#0abab5] py-[18px] pr-8 pl-[34px] text-[18px] leading-7 font-medium text-white transition hover:bg-[#089591]"
            >
              {t("landing.joinEarly")}
              <ArrowIcon />
            </button>
            <Link
              href="#how-classz-works"
              className="inline-flex items-center gap-[18px] rounded-full border-2 border-[#18191b] px-[34px] py-[16px] text-[18px] leading-7 font-medium text-[#18191b] transition hover:bg-white"
            >
              {t("landing.seeHowWorks")}
              <ArrowIcon />
            </Link>
          </div>
          <p className="mt-7 text-[14px] leading-5 text-[#404040]">{t("landing.noCard")}</p>
        </div>
        <img
          src="/landing/figma/hero.png"
          alt=""
          className="mx-auto mt-12 w-full max-w-[980px]"
        />
      </section>

      <section className="overflow-hidden px-4 py-16 md:py-20">
        <h2 className="text-center text-[36px] leading-tight font-medium tracking-[-1.8px] md:text-[50px] md:leading-[72px]">
          {t("landing.partnersLabel")}
        </h2>
        <div className="mt-10 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="mx-auto flex w-max items-center gap-7 opacity-40 grayscale">
            {LOGOS.map((src) => (
              <div
                key={src}
                className="flex h-[58.8px] w-[108px] shrink-0 items-center justify-center"
              >
                <img src={src} alt="" className="max-h-[49px] max-w-[88px] object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-8 md:px-8 md:py-16">
        <div className="mx-auto flex max-w-[770px] flex-col items-center text-center">
          <img src="/landing/figma/icon-document.png" alt="" className="size-[41px] object-contain" />
          <h2 className="mt-6 text-[28px] leading-10 font-medium md:text-[36px]">
            <span className="block">{t("landing.bookingTitle")}</span>
            <span className="block">{t("landing.bookingTitle2")}</span>
          </h2>
          <p className="mt-6 text-[18px] leading-7 text-[#404040]">
            {t("landing.bookingBody")}
            <span className="font-medium text-[#0abab5]">{t("landing.bookingHighlight")}</span>.
          </p>
        </div>
        <img
          src="/landing/figma/booking.png"
          alt=""
          className="mx-auto mt-12 w-full max-w-[1200px]"
        />
      </section>

      <section id="how-classz-works" className="scroll-mt-24 px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-[1408px]">
          <div className="max-w-[640px] px-2 md:px-12">
            <p className="text-[15px] leading-6 font-medium tracking-[0.4px] text-[#0abab5] uppercase">
              {t("landing.howEyebrow")}
            </p>
            <h2 className="mt-2 text-[40px] leading-none font-medium tracking-[-1.5px] md:text-[60px] md:leading-[60px]">
              <span className="block">{t("landing.howLine1")}</span>
              <span className="block">{t("landing.howLine2")}</span>
            </h2>
          </div>

          <div className="mt-16 flex flex-col gap-20 md:mt-24 md:gap-28">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div className="lg:pl-16">
                <StepCopy
                  icon="/landing/figma/icon-search.png"
                  index="01"
                  title={t("landing.step1Title")}
                  body={t("landing.step1Body")}
                />
              </div>
              <img src="/landing/figma/find-collage.png" alt="" className="w-full" />
            </div>

            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div className="lg:order-2 lg:justify-self-end lg:pr-16">
                <StepCopy
                  icon="/landing/figma/icon-learn.png"
                  index="02"
                  title={t("landing.step2Title")}
                  body={t("landing.step2Body")}
                />
              </div>
              <img src="/landing/figma/learn-collage.png" alt="" className="w-full lg:order-1" />
            </div>

            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div className="lg:pl-16">
                <StepCopy
                  icon="/landing/figma/icon-eye.png"
                  index="03"
                  title={t("landing.step3Title")}
                  body={t("landing.step3Body")}
                />
              </div>
              <img src="/landing/figma/capture-collage.png" alt="" className="w-full" />
            </div>

            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div className="lg:order-2 lg:justify-self-end lg:pr-16">
                <StepCopy
                  icon="/landing/figma/icon-passport.png"
                  index="04"
                  title={
                    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span>{t("landing.step4Lead")}</span>
                      <span className="inline-flex items-center gap-1">
                        <img src="/landing/figma/z-mark.svg" alt="" className="h-[26px] w-auto" />
                        <img
                          src="/landing/figma/passport-word.svg"
                          alt="zpassport"
                          className="h-10 w-auto"
                        />
                      </span>
                    </span>
                  }
                  body={t("landing.step4Body")}
                />
              </div>
              <img src="/landing/figma/build-collage.png" alt="" className="w-full lg:order-1" />
            </div>
          </div>

          <div className="mx-auto mt-24 flex max-w-[820px] flex-col items-center px-4 text-center md:mt-32">
            <div className="flex items-center gap-2.5">
              <img src="/landing/figma/icon-stairs.png" alt="" className="size-[51px] object-contain" />
              <p className="text-[36px] leading-10 font-medium">05</p>
            </div>
            <h2 className="mt-6 text-[28px] leading-10 font-medium md:text-[36px]">
              {t("landing.patternsTitle")}
            </h2>
            <p className="mt-6 text-[18px] leading-7 text-[#404040]">
              {t("landing.patternsBody")}
              <span className="font-medium text-[#0abab5]">{t("landing.patternsHighlight")}</span>.
            </p>
          </div>
          <img
            src="/landing/figma/patterns-collage.png"
            alt=""
            className="mx-auto mt-10 w-full max-w-[1408px]"
          />
        </div>
      </section>

      <section className="bg-[#18191b] text-white">
        <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-6 py-16 md:px-16 md:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <div className="max-w-[650px]">
            <h2 className="text-[40px] leading-none font-bold tracking-[-1.5px] md:text-[60px] md:leading-[60px]">
              {t("landing.ctaTitle")}
            </h2>
            <p className="mt-5 text-[18px] leading-7">{t("landing.ctaSubtitle")}</p>
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
