"use client"

import type { ReactNode } from "react"
import { Heart, Home, Search, TrendingUp } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/components/language-provider"
import { DarkCta, InfoGlow, InfoSection, MiniChart, ObservationCard } from "@/components/info/info-ui"

export function AboutPage() {
  const { t } = useLanguage()

  const audience = [
    { icon: Home, title: t("infoPages.about.familiesTitle"), body: t("infoPages.about.familiesBody"), glow: "bg-[#fff4cc]" },
    { icon: Heart, title: t("infoPages.about.childrenTitle"), body: t("infoPages.about.childrenBody"), glow: "bg-[#f3e8ff]" },
    { icon: TrendingUp, title: t("infoPages.about.centresTitle"), body: t("infoPages.about.centresBody"), glow: "bg-[#d7f4f3]" },
  ]

  return (
    <main className="min-h-screen bg-white text-ink">
      <Navbar />

      <section className="relative overflow-hidden px-6 pb-8 pt-10 md:px-16 md:pt-16">
        <InfoGlow />
        <div className="relative mx-auto max-w-[860px] text-center">
          <h1 className="text-4xl font-semibold leading-[1.12] tracking-[-0.04em] md:text-[52px]">
            {t("infoPages.about.heroTitle")}
          </h1>
        </div>
      </section>

      <InfoSection className="pb-20">
        <div className="grid gap-5 md:grid-cols-3">
          {audience.map((card) => (
            <article key={card.title} className="relative overflow-hidden rounded-3xl border border-[#f0f0f0] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.05)]">
              <div className={`pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full ${card.glow} blur-2xl`} />
              <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#d7f4f3] text-[#0abab5]">
                <card.icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <h2 className="relative mt-5 text-lg font-semibold">{card.title}</h2>
              <p className="relative mt-2 text-sm leading-6 text-shade-500">{card.body}</p>
            </article>
          ))}
        </div>
      </InfoSection>

      <InfoSection className="pb-10 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#d7f4f3] text-[#0abab5]">
          <Search className="h-5 w-5" />
        </span>
        <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
          {t("infoPages.about.philosophyTitle")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-shade-500">
          {t("infoPages.about.philosophyBody")}
        </p>
      </InfoSection>

      <InfoSection className="pb-20">
        <div className="grid gap-8 md:grid-cols-2">
          <Principle
            title={t("infoPages.about.p1Title")}
            body={t("infoPages.about.p1Body")}
            visual={
              <div className="relative h-56">
                <div className="absolute left-4 top-8 w-[70%] -rotate-6">
                  <ObservationCard photo="/kid-science.jpg" name="STEM Lab" note="Noticed careful trial-and-error with the circuit." />
                </div>
                <div className="absolute bottom-0 right-2 w-[68%] rotate-3">
                  <div className="rounded-2xl bg-white p-4 shadow-[0_12px_40px_rgba(0,0,0,0.1)]">
                    <p className="text-xs font-semibold text-[#0abab5]">Post-class summary</p>
                    <MiniChart className="mt-2 h-16 w-full" />
                  </div>
                </div>
              </div>
            }
          />
          <Principle
            title={t("infoPages.about.p2Title")}
            body={t("infoPages.about.p2Body")}
            visual={<img src="/kid-reading.jpg" alt="" className="h-56 w-full rounded-3xl object-cover" />}
          />
          <Principle
            title={t("infoPages.about.p3Title")}
            body={t("infoPages.about.p3Body")}
            visual={<img src="/images/hosted-by-centre.jpg" alt="" className="h-56 w-full rounded-3xl object-cover" />}
          />
          <Principle
            title={t("infoPages.about.p4Title")}
            body={t("infoPages.about.p4Body")}
            visual={
              <div className="relative h-56">
                <div className="absolute left-2 top-4 w-[62%] -rotate-3 rounded-2xl bg-white p-4 shadow-[0_12px_40px_rgba(0,0,0,0.1)]">
                  <div className="flex items-center gap-3">
                    <img src="/images/profile-charlie.jpg" alt="" className="h-10 w-10 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-semibold">Charlie Chan</p>
                      <p className="text-[11px] text-shade-400">3 records · emerging</p>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 w-[70%] rotate-2 rounded-2xl bg-white p-4 shadow-[0_12px_40px_rgba(0,0,0,0.1)]">
                  <p className="text-xs font-semibold text-ink">Evidence from last lesson</p>
                  <p className="mt-1 text-xs leading-5 text-shade-500">Asked a follow-up question before trying again.</p>
                </div>
              </div>
            }
          />
        </div>
        <p className="mt-10 text-center text-xs text-shade-400">{t("infoPages.about.disclaimer")}</p>
      </InfoSection>

      <DarkCta
        title={t("infoPages.about.ctaTitle")}
        body={t("infoPages.about.ctaBody")}
        primary={t("infoPages.ctaZpassport")}
        primaryHref="/zpassport"
        secondary={t("infoPages.about.ctaLearnSchool")}
        secondaryHref="/school"
        visual={
          <div className="mx-auto max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
            <img src="/landing/zpassport-phone.jpg" alt="" className="w-full object-cover" />
          </div>
        }
      />

      <Footer />
    </main>
  )
}

function Principle({
  title,
  body,
  visual,
}: {
  title: string
  body: string
  visual: ReactNode
}) {
  return (
    <article>
      <div className="overflow-hidden rounded-3xl bg-[#f7fafa] p-4">{visual}</div>
      <h3 className="mt-5 text-xl font-semibold tracking-[-0.02em]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-shade-500">{body}</p>
    </article>
  )
}
