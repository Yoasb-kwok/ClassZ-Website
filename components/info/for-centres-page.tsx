"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { Check, ClipboardList, GraduationCap, Rocket } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/components/language-provider"
import { useAuthModal } from "@/components/auth-modal"
import { CentreRequestForm } from "@/components/info/centre-request-form"
import {
  DashboardPreview,
  FeatureSplit,
  InfoGlow,
  InfoSection,
  PhoneAnalytics,
  PhoneChat,
  PhoneListing,
  PhoneSchedule,
  PhoneStudents,
  StoreBadges,
} from "@/components/info/info-ui"

const TABS = [
  { id: "overview", key: "infoPages.centres.tabOverview" },
  { id: "obligation", key: "infoPages.centres.tabObligation" },
  { id: "join", key: "infoPages.centres.tabJoin" },
] as const

type TabId = (typeof TABS)[number]["id"]

function isTabId(value: string): value is TabId {
  return TABS.some((tab) => tab.id === value)
}

export function ForCentresPage() {
  const { t } = useLanguage()
  const { openAuth } = useAuthModal()
  const [active, setActive] = useState<TabId>("overview")

  const selectTab = (id: TabId, scroll = true) => {
    setActive(id)
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${id}`)
      if (scroll) {
        document.getElementById("centre-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }
  }

  useEffect(() => {
    const applyHash = (scroll: boolean) => {
      const id = window.location.hash.replace("#", "")
      if (isTabId(id)) {
        setActive(id)
        if (scroll) {
          document.getElementById("centre-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      }
    }
    applyHash(false)
    const onHash = () => applyHash(true)
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [])

  const grid = [
    {
      title: t("infoPages.centres.g1Title"),
      body: t("infoPages.centres.g1Body"),
      visual: <img src="/mother-hugging-child-happy.jpg" alt="" className="h-44 w-full object-cover" />,
    },
    {
      title: t("infoPages.centres.g2Title"),
      body: t("infoPages.centres.g2Body"),
      visual: <img src="/family-looking-at-tablet.jpg" alt="" className="h-44 w-full object-cover" />,
    },
    {
      title: t("infoPages.centres.g3Title"),
      body: t("infoPages.centres.g3Body"),
      visual: (
        <div className="flex h-44 items-end justify-center bg-[#f7fafa] pt-4">
          <div className="w-[140px]">
            <PhoneAnalytics />
          </div>
        </div>
      ),
    },
    {
      title: t("infoPages.centres.g4Title"),
      body: t("infoPages.centres.g4Body"),
      visual: (
        <div className="flex h-44 items-end justify-center bg-[#f7fafa] pt-4">
          <div className="w-[140px]">
            <PhoneSchedule />
          </div>
        </div>
      ),
    },
    {
      title: t("infoPages.centres.g5Title"),
      body: t("infoPages.centres.g5Body"),
      visual: (
        <div className="flex h-44 items-end justify-center bg-[#f7fafa] pt-4">
          <div className="w-[140px]">
            <PhoneChat />
          </div>
        </div>
      ),
    },
    {
      title: t("infoPages.centres.g6Title"),
      body: t("infoPages.centres.g6Body"),
      visual: (
        <div className="flex h-44 items-end justify-center bg-[#f7fafa] pt-4">
          <div className="w-[140px]">
            <PhoneListing />
          </div>
        </div>
      ),
    },
  ]

  const obligations = [
    {
      n: "01",
      title: t("infoPages.centres.o1Title"),
      body: t("infoPages.centres.o1Body"),
      bullets: [t("infoPages.centres.o1b1"), t("infoPages.centres.o1b2"), t("infoPages.centres.o1b3")],
      glow: "bg-[#fde8f0]",
      visual: (
        <div className="flex justify-center">
          <div className="w-[200px]">
            <PhoneStudents />
          </div>
        </div>
      ),
    },
    {
      n: "02",
      title: t("infoPages.centres.o2Title"),
      body: t("infoPages.centres.o2Body"),
      bullets: [t("infoPages.centres.o2b1"), t("infoPages.centres.o2b2"), t("infoPages.centres.o2b3")],
      glow: "bg-[#e8e4ff]",
      visual: (
        <img
          src="/mother-hugging-child-happy.jpg"
          alt=""
          className="h-72 w-full rounded-3xl object-cover md:h-[340px]"
        />
      ),
    },
    {
      n: "03",
      title: t("infoPages.centres.o3Title"),
      body: t("infoPages.centres.o3Body"),
      bullets: [t("infoPages.centres.o3b1"), t("infoPages.centres.o3b2"), t("infoPages.centres.o3b3")],
      glow: "bg-[#d7f4f3]",
      visual: (
        <img src="/family-looking-at-tablet.jpg" alt="" className="h-72 w-full rounded-3xl object-cover md:h-[340px]" />
      ),
    },
  ]

  return (
    <main className="min-h-screen bg-white text-ink">
      <Navbar />

      <section className="relative overflow-hidden px-6 pb-10 pt-10 md:px-16 md:pt-16">
        <InfoGlow variant="pink" />
        <div className="relative mx-auto max-w-[860px] text-center">
          <h1 className="text-4xl font-semibold leading-[1.12] tracking-[-0.04em] md:text-[48px]">
            {t("infoPages.centres.heroTitle")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-shade-500">
            {t("infoPages.centres.heroBody")}
          </p>
        </div>
        <div className="relative mx-auto mt-12 max-w-[920px]">
          <DashboardPreview />
        </div>
      </section>

      <div id="centre-tabs" className="sticky top-[72px] z-40 scroll-mt-4 border-b border-[#ebebeb] bg-white/90 backdrop-blur">
        <nav className="mx-auto flex max-w-[880px] justify-center gap-10 px-6 py-4 text-lg md:gap-14 md:text-xl" aria-label="Centre sections">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => selectTab(tab.id)}
              className={`pb-1 ${
                active === tab.id ? "font-semibold text-[#0abab5]" : "text-shade-500 hover:text-ink"
              }`}
            >
              {t(tab.key)}
            </button>
          ))}
        </nav>
      </div>

      {active === "overview" ? (
        <>
          <InfoSection className="py-20">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#0abab5]">
              {t("infoPages.centres.eyebrow")}
            </p>
            <h2 className="mx-auto mt-3 max-w-2xl text-center text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
              {t("infoPages.centres.planTitle")}
            </h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {grid.map((card) => (
                <article
                  key={card.title}
                  className="overflow-hidden rounded-3xl border border-[#f0f0f0] bg-white shadow-[0_12px_36px_rgba(0,0,0,0.06)]"
                >
                  {card.visual}
                  <div className="p-5">
                    <h3 className="text-lg font-semibold">{card.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-shade-500">{card.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </InfoSection>

          <section className="relative overflow-hidden px-6 py-16 md:px-16">
            <InfoGlow variant="soft" />
            <div className="relative mx-auto grid max-w-[1100px] items-center gap-12 lg:grid-cols-2">
              <div className="relative mx-auto flex h-[340px] w-full max-w-md items-end justify-center">
                <div className="absolute left-4 top-8 w-[150px] -rotate-6">
                  <PhoneSchedule />
                </div>
                <div className="relative z-10 w-[170px]">
                  <PhoneAnalytics />
                </div>
                <div className="absolute right-2 top-16 w-[150px] rotate-6">
                  <PhoneListing />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0abab5]">
                  {t("infoPages.centres.eyebrow")}
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
                  {t("infoPages.centres.whyTitle")}
                </h2>
                <p className="mt-4 text-base leading-7 text-shade-500">{t("infoPages.centres.whyBody")}</p>
              </div>
            </div>
          </section>

          <InfoSection className="space-y-24 py-10 md:py-20">
            <FeatureSplit
              eyebrow={t("infoPages.centres.d1Eyebrow")}
              title={t("infoPages.centres.d1Title")}
              body={t("infoPages.centres.d1Body")}
              visual={
                <div className="relative h-[280px] overflow-hidden rounded-3xl bg-[#f7fafa] p-4">
                  <div className="absolute left-0 top-6 w-[55%]">
                    <DashboardPreview />
                  </div>
                  <div className="absolute bottom-0 right-4 w-[150px] rotate-6">
                    <PhoneChat />
                  </div>
                </div>
              }
            />
            <FeatureSplit
              reverse
              eyebrow={t("infoPages.centres.d2Eyebrow")}
              title={t("infoPages.centres.d2Title")}
              body={t("infoPages.centres.d2Body")}
              visual={
                <div className="relative">
                  <img src="/kid-sports.jpg" alt="" className="h-72 w-full rounded-3xl object-cover md:h-80" />
                  <div className="absolute left-4 top-6 max-w-[180px] rounded-2xl bg-white px-3 py-2 text-xs shadow-md">
                    {t("infoPages.centres.d2Note")}
                  </div>
                </div>
              }
            />
            <FeatureSplit
              eyebrow={t("infoPages.centres.d3Eyebrow")}
              title={t("infoPages.centres.d3Title")}
              body={t("infoPages.centres.d3Body")}
              visual={
                <div className="relative mx-auto flex h-[280px] max-w-sm">
                  <div className="absolute left-0 top-8 w-[140px] -rotate-6">
                    <PhoneListing />
                  </div>
                  <div className="absolute right-0 top-0 w-[140px] rotate-6">
                    <PhoneChat />
                  </div>
                  <div className="absolute bottom-0 left-1/2 w-[150px] -translate-x-1/2">
                    <PhoneSchedule />
                  </div>
                </div>
              }
            />
          </InfoSection>

          <InfoSection className="pb-6 pt-4 text-center">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl">{t("infoPages.centres.getStartedTitle")}</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-shade-500">{t("infoPages.centres.getStartedBody")}</p>
          </InfoSection>

          <section className="px-6 pb-16 md:px-16">
            <div className="mx-auto flex max-w-[1100px] flex-col justify-center gap-5 overflow-hidden rounded-[28px] bg-[#1a1a1a] px-8 py-14 md:px-14">
              <h2 className="max-w-md text-3xl font-semibold leading-tight text-white md:text-4xl">
                {t("infoPages.centres.ctaTitle")}
              </h2>
              <button
                type="button"
                onClick={() => selectTab("join")}
                className="inline-flex h-12 w-fit items-center rounded-full bg-white px-7 text-sm font-semibold text-ink transition hover:bg-[#d7f4f3]"
              >
                {t("infoPages.ctaJoinNow")}
              </button>
            </div>
          </section>
        </>
      ) : null}

      {active === "obligation" ? (
        <>
          <InfoSection className="space-y-20 py-20">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0abab5]">
                {t("infoPages.centres.standardsEyebrow")}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] md:text-5xl">
                {t("infoPages.centres.standardsTitle")}
              </h2>
            </div>
            {obligations.map((item, i) => (
              <ObligationRow
                key={item.n}
                reverse={i % 2 === 1}
                number={item.n}
                title={item.title}
                body={item.body}
                bullets={item.bullets}
                glow={item.glow}
                visual={item.visual}
                privacyHref={item.n === "03" ? "/privacy" : undefined}
                privacyLabel={t("infoPages.centres.privacyLink")}
              />
            ))}
          </InfoSection>

          <section className="px-6 pb-16 md:px-16">
            <div className="mx-auto flex max-w-[1100px] flex-col items-center gap-5 rounded-[28px] bg-[#1a1a1a] px-8 py-14 text-center">
              <h2 className="text-3xl font-semibold text-white md:text-4xl">{t("infoPages.centres.ctaTitle")}</h2>
              <button
                type="button"
                onClick={() => selectTab("join")}
                className="inline-flex h-12 items-center rounded-full bg-white px-8 text-sm font-semibold text-ink transition hover:bg-[#d7f4f3]"
              >
                {t("infoPages.centres.becomePartner")}
              </button>
              <button
                type="button"
                onClick={() => openAuth("login")}
                className="text-sm text-white/70 underline-offset-4 hover:text-white hover:underline"
              >
                {t("infoPages.centres.alreadyPartner")}
              </button>
            </div>
          </section>
        </>
      ) : null}

      {active === "join" ? (
        <>
          <InfoSection className="py-20">
            <h2 className="text-center text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
              {t("infoPages.centres.onboardingTitle")}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-sm text-shade-500">
              {t("infoPages.centres.onboardingBody")}
            </p>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: ClipboardList,
                  title: t("infoPages.centres.s1Title"),
                  body: t("infoPages.centres.s1Body"),
                  bullets: [t("infoPages.centres.s1b1"), t("infoPages.centres.s1b2"), t("infoPages.centres.s1b3")],
                },
                {
                  icon: GraduationCap,
                  title: t("infoPages.centres.s2Title"),
                  body: t("infoPages.centres.s2Body"),
                  bullets: [t("infoPages.centres.s2b1"), t("infoPages.centres.s2b2")],
                },
                {
                  icon: Rocket,
                  title: t("infoPages.centres.s3Title"),
                  body: t("infoPages.centres.s3Body"),
                  bullets: [t("infoPages.centres.s3b1"), t("infoPages.centres.s3b2")],
                },
              ].map((step, i) => (
                <article
                  key={step.title}
                  className="rounded-3xl border border-[#f0f0f0] bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)]"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d7f4f3] text-[#0abab5]">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <p className="mt-4 text-xs font-semibold tracking-[0.16em] text-[#0abab5]">0{i + 1}</p>
                  <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-shade-500">{step.body}</p>
                  <ul className="mt-4 space-y-2">
                    {step.bullets.map((item) => (
                      <li key={item} className="flex gap-2 text-sm text-shade-500">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0abab5]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </InfoSection>

          <section className="relative overflow-hidden px-6 py-16 md:px-16">
            <InfoGlow variant="soft" />
            <div className="relative mx-auto grid max-w-[1100px] items-center gap-12 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
                  {t("infoPages.centres.appTitle")}
                </h2>
                <p className="mt-3 text-sm text-shade-500">{t("infoPages.centres.appBody")}</p>
                <ul className="mt-6 space-y-3">
                  {[t("infoPages.centres.appB1"), t("infoPages.centres.appB2"), t("infoPages.centres.appB3")].map(
                    (item) => (
                      <li key={item} className="flex gap-2 text-sm leading-6 text-shade-500">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0abab5]" />
                        {item}
                      </li>
                    ),
                  )}
                </ul>
                <div className="mt-8">
                  <StoreBadges />
                </div>
              </div>
              <div className="relative mx-auto flex h-[320px] w-full max-w-md items-end justify-center">
                <div className="absolute left-6 top-6 w-[160px] -rotate-6">
                  <PhoneListing />
                </div>
                <div className="relative z-10 w-[170px] rotate-6">
                  <PhoneSchedule />
                </div>
              </div>
            </div>
          </section>

          <InfoSection className="pb-10 pt-8">
            <CentreRequestForm />
          </InfoSection>

          <section className="px-6 pb-16 md:px-16">
            <div className="mx-auto flex max-w-[1100px] flex-col items-center gap-5 rounded-[28px] bg-[#1a1a1a] px-8 py-14 text-center">
              <h2 className="text-3xl font-semibold text-white md:text-4xl">
                {t("infoPages.centres.questionsTitle")}
              </h2>
              <Link
                href="/contact-us"
                className="inline-flex h-12 items-center rounded-full bg-white px-8 text-sm font-semibold text-ink transition hover:bg-[#d7f4f3]"
              >
                {t("infoPages.centres.connectUs")}
              </Link>
            </div>
          </section>
        </>
      ) : null}

      <Footer />
    </main>
  )
}

function ObligationRow({
  reverse,
  number,
  title,
  body,
  bullets,
  glow,
  visual,
  privacyHref,
  privacyLabel,
}: {
  reverse?: boolean
  number: string
  title: string
  body: string
  bullets: string[]
  glow: string
  visual: ReactNode
  privacyHref?: string
  privacyLabel?: string
}) {
  return (
    <div
      className={`flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:gap-16 ${
        reverse ? "lg:flex-row-reverse" : ""
      }`}
    >
      <div className="w-full max-w-lg lg:flex-1">
        <p className="text-5xl font-semibold tracking-[-0.04em] text-[#d8d8d8]">{number}</p>
        <h3 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-ink md:text-4xl">{title}</h3>
        <p className="mt-4 text-base leading-7 text-shade-500">{body}</p>
        <ul className="mt-5 space-y-2.5">
          {bullets.map((item) => (
            <li key={item} className="flex gap-2.5 text-sm leading-6 text-shade-500">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0abab5]" />
              <span>
                {privacyHref && privacyLabel && item.includes(privacyLabel) ? (
                  <>
                    {item.split(privacyLabel)[0]}
                    <Link href={privacyHref} className="text-[#0abab5] underline-offset-2 hover:underline">
                      {privacyLabel}
                    </Link>
                    {item.split(privacyLabel)[1]}
                  </>
                ) : (
                  item
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="relative w-full lg:flex-1">
        <div className={`pointer-events-none absolute -inset-8 rounded-full ${glow} blur-[70px]`} aria-hidden />
        <div className="relative">{visual}</div>
      </div>
    </div>
  )
}
