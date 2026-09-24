"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/components/language-provider"
import {
  DarkCta,
  FeatureSplit,
  InfoGlow,
  InfoSection,
  MiniChart,
  ObservationCard,
  PhoneFrame,
} from "@/components/info/info-ui"

const COMPANIONS = [
  { src: "/assets/learning-companion/owl/hero.png", label: "Owl" },
  { src: "/assets/learning-companion/bee/hero.png", label: "Bee" },
  { src: "/assets/learning-companion/dolphin/hero.png", label: "Dolphin" },
  { src: "/assets/learning-companion/fox/hero.png", label: "Fox" },
  { src: "/assets/learning-companion/turtle/hero.png", label: "Turtle" },
]

export function ZPassportPage() {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen bg-white text-ink">
      <Navbar />

      <section className="relative overflow-hidden px-6 pb-8 pt-10 md:px-16 md:pt-16">
        <InfoGlow />
        <div className="relative mx-auto max-w-[820px] text-center">
          <h1 className="text-4xl font-semibold leading-[1.12] tracking-[-0.04em] md:text-[52px]">
            {t("infoPages.zpassport.heroTitle")}
          </h1>
          <p className="mt-4 text-base text-shade-500 md:text-lg">{t("infoPages.zpassport.heroSubtitle")}</p>
        </div>

        <div className="relative mx-auto mt-12 h-[340px] max-w-[760px] md:h-[420px]">
          <div className="absolute left-0 top-16 hidden w-[230px] -rotate-6 sm:block">
            <div className="rounded-2xl bg-white p-4 shadow-[0_18px_50px_rgba(0,0,0,0.12)]">
              <p className="text-xs font-semibold text-[#0abab5]">{t("infoPages.zpassport.weeklyPlanning")}</p>
              <MiniChart className="mt-3 h-24 w-full" />
            </div>
          </div>
          <div className="absolute left-1/2 top-6 z-10 w-[min(100%,260px)] -translate-x-1/2">
            <div className="overflow-hidden rounded-3xl bg-white shadow-[0_24px_60px_rgba(0,0,0,0.16)]">
              <img src="/images/profile-charlie.jpg" alt="" className="h-40 w-full object-cover" />
              <div className="p-4">
                <p className="text-sm font-semibold">Charlie Chan</p>
                <p className="mt-1 text-xs text-[#0abab5]">{t("infoPages.zpassport.learningStar")}</p>
              </div>
            </div>
          </div>
          <div className="absolute right-0 top-20 hidden w-[220px] rotate-6 sm:block">
            <div className="rounded-2xl bg-white p-4 shadow-[0_18px_50px_rgba(0,0,0,0.12)]">
              <p className="text-xs font-semibold text-ink">{t("infoPages.zpassport.sparking")}</p>
              <img src="/assets/learning-companion/rabbit/pose-02.png" alt="" className="mx-auto mt-2 h-32 object-contain" />
            </div>
          </div>
        </div>
      </section>

      <InfoSection className="pb-16 text-center">
        <img src="/landing/zpassport-wordmark.svg" alt="zpassport" className="mx-auto h-8 w-auto" />
        <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
          {t("infoPages.zpassport.brandTitle")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-shade-500">
          {t("infoPages.zpassport.brandBody")}
        </p>
      </InfoSection>

      <InfoSection className="space-y-24 pb-16 md:space-y-28">
        <FeatureSplit
          eyebrow={t("infoPages.zpassport.f1Eyebrow")}
          title={t("infoPages.zpassport.f1Title")}
          body={t("infoPages.zpassport.f1Body")}
          bullets={[
            t("infoPages.zpassport.f1b1"),
            t("infoPages.zpassport.f1b2"),
            t("infoPages.zpassport.f1b3"),
          ]}
          visual={
            <div className="relative">
              <img src="/family-looking-at-tablet.jpg" alt="" className="h-72 w-full rounded-3xl object-cover md:h-80" />
              <div className="absolute -bottom-6 left-6 w-[70%] max-w-xs">
                <ObservationCard
                  photo="/kid-science.jpg"
                  name="After-class note"
                  note="Tried three approaches before asking for help."
                />
              </div>
            </div>
          }
        />
        <FeatureSplit
          reverse
          eyebrow={t("infoPages.zpassport.f2Eyebrow")}
          title={t("infoPages.zpassport.f2Title")}
          body={t("infoPages.zpassport.f2Body")}
          visual={
            <div className="relative">
              <img src="/kid-dancing.jpg" alt="" className="h-64 w-full rounded-3xl object-cover" />
              <div className="absolute -bottom-8 right-4 w-[75%] rounded-2xl bg-white p-4 shadow-[0_16px_40px_rgba(0,0,0,0.12)]">
                <p className="text-xs font-semibold text-[#0abab5]">Post-class summary</p>
                <MiniChart className="mt-2 h-20 w-full" />
              </div>
            </div>
          }
        />
        <FeatureSplit
          eyebrow={t("infoPages.zpassport.f3Eyebrow")}
          title={t("infoPages.zpassport.f3Title")}
          body={t("infoPages.zpassport.f3Body")}
          bullets={[
            t("infoPages.zpassport.f3b1"),
            t("infoPages.zpassport.f3b2"),
            t("infoPages.zpassport.f3b3"),
          ]}
          visual={
            <div className="relative mx-auto flex h-[340px] max-w-md items-center justify-center">
              <div className="pointer-events-none absolute inset-8 rounded-full bg-[#fff4cc] blur-3xl" />
              <div className="relative rounded-3xl bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.1)]">
                <img src="/assets/learning-companion/rabbit/hero.png" alt="" className="h-44 w-44 object-contain" />
              </div>
              {COMPANIONS.map((c, i) => {
                const angle = (i / COMPANIONS.length) * Math.PI * 2 - Math.PI / 2
                const x = Math.cos(angle) * 150
                const y = Math.sin(angle) * 118
                return (
                  <span
                    key={c.label}
                    className="absolute left-1/2 top-1/2 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md"
                    style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
                  >
                    <img src={c.src} alt="" className="h-10 w-10 object-contain" />
                  </span>
                )
              })}
            </div>
          }
        />
        <FeatureSplit
          reverse
          eyebrow={t("infoPages.zpassport.f4Eyebrow")}
          title={t("infoPages.zpassport.f4Title")}
          body={t("infoPages.zpassport.f4Body")}
          visual={
            <div className="relative">
              <img src="/father-playing-with-child.jpg" alt="" className="h-64 w-full rounded-3xl object-cover" />
              <img
                src="/assets/learning-companion/rabbit/pose-04.png"
                alt=""
                className="absolute -bottom-6 -right-2 h-32 w-32 object-contain drop-shadow-lg"
              />
              <div className="absolute left-4 top-6 max-w-[200px] rounded-2xl bg-white px-3 py-2 text-xs text-ink shadow-md">
                Try one more turn before offering help.
              </div>
            </div>
          }
        />
      </InfoSection>

      <DarkCta
        title={t("infoPages.zpassport.ctaTitle")}
        body={t("infoPages.zpassport.ctaBody")}
        primary={t("infoPages.ctaStarted")}
        primaryHref="/"
        secondary={t("infoPages.ctaSchool")}
        secondaryHref="/"
        visual={
          <PhoneFrame className="mx-auto max-w-[240px]">
            <img src="/landing/zpassport-phone.jpg" alt="" className="w-full object-cover" />
          </PhoneFrame>
        }
      />

      <Footer />
    </main>
  )
}
