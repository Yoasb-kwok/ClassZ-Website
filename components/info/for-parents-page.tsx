"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/components/language-provider"
import { InfoGlow, InfoSection, ObservationCard, PhoneFrame } from "@/components/info/info-ui"

const GALLERY = [
  "/kid-painting.jpg",
  "/kid-sports.jpg",
  "/kid-swimming.jpg",
  "/kid-science.jpg",
  "/kid-music.jpg",
  "/kid-dancing.jpg",
  "/kid-coding.jpg",
  "/kid-reading.jpg",
  "/images/activity-badminton.jpg",
  "/images/activity-guitar.jpg",
]

export function ForParentsPage() {
  const { t } = useLanguage()
  const values = [
    t("infoPages.parents.v1"),
    t("infoPages.parents.v2"),
    t("infoPages.parents.v3"),
    t("infoPages.parents.v4"),
    t("infoPages.parents.v5"),
  ]

  return (
    <main className="min-h-screen bg-white text-ink">
      <Navbar />

      <section className="relative overflow-hidden px-6 pb-10 pt-10 md:px-16 md:pt-16">
        <InfoGlow />
        <div className="relative mx-auto max-w-[820px] text-center">
          <h1 className="text-4xl font-semibold leading-[1.12] tracking-[-0.04em] md:text-[52px]">
            {t("infoPages.parents.heroTitle")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-shade-500">
            {t("infoPages.parents.heroBody")}
          </p>
          <Link
            href="/school"
            className="mt-8 inline-flex h-12 items-center rounded-full bg-[#0abab5] px-7 text-sm font-semibold text-white transition hover:bg-[#089591]"
          >
            {t("infoPages.parents.ctaJourney")}
          </Link>
        </div>

        <div className="relative mx-auto mt-14 grid max-w-[1100px] grid-cols-2 gap-3 sm:grid-cols-5">
          {GALLERY.map((src) => (
            <img key={src} src={src} alt="" className="h-28 w-full rounded-2xl object-cover md:h-36" />
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden px-6 py-16 md:px-16 md:py-24">
        <InfoGlow variant="soft" />
        <div className="relative mx-auto max-w-[1100px]">
          <h2 className="text-center text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
            {t("infoPages.parents.meansTitle")}
          </h2>
          <div className="mt-12 grid items-center gap-10 lg:grid-cols-[1fr_280px_1fr]">
            <ul className="space-y-8">
              {values.filter((_, i) => i % 2 === 0).map((item) => (
                <li key={item} className="max-w-xs text-sm leading-6 text-shade-500 md:text-base">
                  {item}
                </li>
              ))}
            </ul>
            <div className="relative mx-auto w-[220px]">
              <PhoneFrame>
                <img src="/landing/zpassport-phone.jpg" alt="" className="w-full object-cover" />
              </PhoneFrame>
              <div className="absolute -left-16 top-24 hidden w-44 lg:block">
                <ObservationCard photo="/images/profile-charlie.jpg" name="Charlie Chan" note="Violin · observed today" />
              </div>
              <div className="absolute -right-14 bottom-10 hidden w-40 lg:block">
                <ObservationCard photo="/kid-music.jpg" name="Class note" note="Asked to try the phrase again." />
              </div>
            </div>
            <ul className="space-y-8 lg:text-right">
              {values.filter((_, i) => i % 2 === 1).map((item) => (
                <li key={item} className="ml-auto max-w-xs text-sm leading-6 text-shade-500 md:text-base">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <InfoSection className="pb-20 pt-4 text-center">
        <h2 className="text-3xl font-semibold tracking-[-0.03em] md:text-4xl">{t("infoPages.parents.startTitle")}</h2>
        <p className="mt-2 text-sm font-medium text-[#0abab5]">{t("infoPages.parents.earlyAccess")}</p>
        <Link
          href="/school"
          className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-[#222] px-8 text-sm font-semibold text-white transition hover:opacity-90"
        >
          {t("infoPages.parents.joinEarly")}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mx-auto mt-4 max-w-md text-sm text-shade-500">{t("infoPages.parents.earlyBody")}</p>
      </InfoSection>

      <Footer />
    </main>
  )
}
