"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/components/language-provider"
import { useAuthModal } from "@/components/auth-modal"
import { CentreRequestForm } from "@/components/info/centre-request-form"

const FONT =
  '"SF Pro", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

const TABS = [
  { id: "overview", href: "/for-learning-centres", key: "tabOverview" },
  { id: "obligation", href: "/for-learning-centres/obligation", key: "tabObligation" },
  { id: "join", href: "/for-learning-centres/join", key: "tabJoin" },
] as const

export type CentreTab = (typeof TABS)[number]["id"]

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

function CentresShell({ tab, children }: { tab: CentreTab; children: ReactNode }) {
  const { t } = useLanguage()
  const { openAuth } = useAuthModal()

  return (
    <main className="min-h-screen bg-[#F6F3F3] text-[#18191b]" style={{ fontFamily: FONT }}>
      <Navbar />

      <section className="mx-auto max-w-[1440px] px-6 pt-16 text-center md:pt-28">
        <h1 className="mx-auto max-w-[1024px] text-[40px] leading-[48px] font-medium tracking-[-1.2px] md:text-[72px] md:leading-[72px] md:tracking-[-1.8px]">
          {t("infoPages.centres.heroLine1")}
          <br />
          {t("infoPages.centres.heroLine2")}
        </h1>
        <p className="mx-auto mt-8 max-w-[800px] text-[18px] leading-7 md:text-[20px]">
          {t("infoPages.centres.heroBody")}
        </p>
        <img src="/centres/hero.png" alt="" className="mx-auto mt-12 w-full max-w-[1040px]" />
      </section>

      <nav aria-label={t("nav.forCentres")} className="mx-auto mt-16 max-w-[1248px] border-b border-[#ebebeb] px-6">
        <div className="flex gap-6 overflow-x-auto md:gap-12">
          {TABS.map((item) => {
            const active = item.id === tab
            return (
              <Link
                key={item.id}
                href={item.href}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={`-mb-px shrink-0 border-b-2 pb-3 text-[18px] leading-6 md:text-[20px] ${
                  active ? "border-[#222222] text-[#222222]" : "border-transparent text-[#222222]"
                }`}
              >
                {t(`infoPages.centres.${item.key}`)}
              </Link>
            )
          })}
        </div>
      </nav>

      {children}

      <section className="mt-8 bg-[#18191b] text-white">
        <div className="mx-auto flex max-w-[512px] flex-col items-center px-6 py-16 text-center md:py-20">
          <h2 className="text-[32px] leading-10 font-medium md:text-[36px]">
            {t("infoPages.centres.ctaTitle")}
          </h2>
          <button
            type="button"
            onClick={() => openAuth("register")}
            className="mt-6 inline-flex items-center gap-6 rounded-full bg-white px-8 py-4 text-[18px] leading-7 font-medium text-[#18191b] transition hover:bg-[#F6F3F3]"
          >
            {t("landing.joinEarly")}
            <ArrowIcon />
          </button>
        </div>
      </section>

      <Footer />
    </main>
  )
}

const CARDS = [
  { title: "g1Title", body: "g1Body", image: "/centres/publish.png" },
  { title: "g2Title", body: "g2Body", image: "/centres/discover.png" },
  { title: "g3Title", body: "g3Body", image: "/centres/manage.png" },
  { title: "g4Title", body: "g4Body", image: "/centres/progress.png" },
  { title: "g5Title", body: "g5Body", image: "/centres/parents.png" },
  { title: "g6Title", body: "g6Body", image: "/centres/visibility.png" },
] as const

function Feature({
  title,
  body,
  image,
  flip,
}: {
  title: string
  body: string
  image: string
  flip?: boolean
}) {
  return (
    <article className="mx-auto grid max-w-[1248px] items-center gap-8 px-6 py-8 lg:grid-cols-2 lg:gap-16 lg:py-12">
      <img src={image} alt="" className={`mx-auto w-full max-w-[640px] ${flip ? "lg:order-2" : ""}`} />
      <div className={flip ? "lg:order-1" : ""}>
        <h3 className="text-[32px] leading-10 font-medium md:text-[36px]">{title}</h3>
        <p className="mt-4 max-w-[470px] text-[18px] leading-7 text-[#404040]">{body}</p>
      </div>
    </article>
  )
}

function Points({ lead, items }: { lead: string; items: string[] }) {
  return (
    <div className="max-w-[620px]">
      <p className="text-[18px] leading-7 md:text-[20px]">{lead}</p>
      <ul className="mt-4 list-disc space-y-2 ps-6 text-[18px] leading-7 md:text-[20px]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

export function ForCentresPage({ tab }: { tab: CentreTab }) {
  return (
    <CentresShell tab={tab}>
      {tab === "overview" ? <Overview /> : null}
      {tab === "obligation" ? <Obligation /> : null}
      {tab === "join" ? <Join /> : null}
    </CentresShell>
  )
}

function Overview() {
  const { t } = useLanguage()
  return (
    <>
      <section className="relative mx-auto max-w-[1440px] overflow-hidden px-6 pt-16 pb-8">
        <div className="pointer-events-none absolute top-24 -left-16 h-72 w-72 rounded-full bg-[#ffe08a]/80 blur-3xl" />
        <div className="pointer-events-none absolute top-40 -right-10 h-72 w-72 rounded-full bg-[#9ef0ec]/80 blur-3xl" />
        <h2 className="relative text-center text-[36px] leading-none font-medium md:text-[60px]">
          {t("infoPages.centres.runTitle")}
        </h2>
        <div className="relative mx-auto mt-12 grid max-w-[1248px] gap-10 md:grid-cols-2 xl:grid-cols-3 xl:gap-8">
          {CARDS.map((card) => (
            <article key={card.title}>
              <h3 className="text-[28px] leading-9 font-medium md:text-[36px] md:leading-10">
                {t(`infoPages.centres.${card.title}`)}
              </h3>
              <p className="mt-3 text-[18px] leading-7 text-[#404040]">
                {t(`infoPages.centres.${card.body}`)}
              </p>
              <img src={card.image} alt="" className="mt-6 w-full" />
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] py-16">
        <h2 className="px-6 text-center text-[36px] leading-none font-medium md:text-[60px]">
          {t("infoPages.centres.whyTitle")}
        </h2>
        <div className="mt-8">
          <Feature
            title={t("infoPages.centres.w1Title")}
            body={t("infoPages.centres.w1Body")}
            image="/centres/workflow.png"
          />
          <Feature
            flip
            title={t("infoPages.centres.w2Title")}
            body={t("infoPages.centres.w2Body")}
            image="/centres/communication.png"
          />
          <Feature
            flip
            title={t("infoPages.centres.w3Title")}
            body={t("infoPages.centres.w3Body")}
            image="/centres/exposure.png"
          />
          <Feature
            title={t("infoPages.centres.w4Title")}
            body={t("infoPages.centres.w4Body")}
            image="/centres/followup.png"
          />
        </div>
        <div className="mx-auto mt-8 max-w-[802px] px-6 text-center">
          <h3 className="text-[32px] leading-10 font-medium md:text-[36px]">{t("infoPages.centres.w5Title")}</h3>
          <p className="mt-4 text-[18px] leading-7 text-[#404040]">{t("infoPages.centres.w5Body")}</p>
        </div>
      </section>
    </>
  )
}

function Standard({
  index,
  title,
  children,
  image,
  flip,
}: {
  index: string
  title: string
  children: ReactNode
  image: string
  flip?: boolean
}) {
  return (
    <article className="mx-auto grid max-w-[1248px] items-center gap-8 px-6 py-10 lg:grid-cols-2 lg:gap-16">
      <div className={flip ? "lg:order-2" : ""}>
        <p className="text-[32px] leading-10 font-medium md:text-[40px]">{index}</p>
        <h3 className="mt-4 text-[32px] leading-10 font-medium md:text-[40px]">{title}</h3>
        <div className="mt-4">{children}</div>
      </div>
      <img src={image} alt="" className={`mx-auto w-full max-w-[500px] ${flip ? "lg:order-1" : ""}`} />
    </article>
  )
}

function Obligation() {
  const { t } = useLanguage()
  return (
    <section className="mx-auto max-w-[1440px] py-16">
      <h2 className="px-6 text-center text-[36px] leading-none font-medium md:text-[60px]">
        {t("infoPages.centres.standardsTitle")}
      </h2>
      <div className="mt-8">
        <Standard index="01" title={t("infoPages.centres.o1Title")} image="/centres/report.png">
          <Points
            lead={t("infoPages.centres.o1Lead")}
            items={[t("infoPages.centres.o1b1"), t("infoPages.centres.o1b2"), t("infoPages.centres.o1b3")]}
          />
        </Standard>
        <Standard flip index="02" title={t("infoPages.centres.o2Title")} image="/centres/quality.png">
          <Points
            lead={t("infoPages.centres.o2Lead")}
            items={[t("infoPages.centres.o2b1"), t("infoPages.centres.o2b2"), t("infoPages.centres.o2b3")]}
          />
        </Standard>
        <Standard index="03" title={t("infoPages.centres.o3Title")} image="/centres/systems.png">
          <Points
            lead={t("infoPages.centres.o3Lead")}
            items={[t("infoPages.centres.o3b1"), t("infoPages.centres.o3b2"), t("infoPages.centres.o3b3")]}
          />
        </Standard>
      </div>
    </section>
  )
}

function Join() {
  const { t } = useLanguage()
  const priorities = ["p1", "p2", "p3"] as const
  const steps = ["step1", "step2", "step3", "step4"] as const

  return (
    <section className="mx-auto max-w-[1440px] px-6 py-16">
      <h2 className="text-center text-[36px] leading-none font-medium md:text-[60px]">
        {t("infoPages.centres.onboardingTitle")}
      </h2>

      <div className="mx-auto mt-16 max-w-[1248px]">
        <p className="text-[20px] leading-7 text-[#0abab5]">{t("infoPages.centres.focus")}</p>
        <h3 className="mt-2 text-[32px] leading-10 font-medium md:text-[40px]">
          {t("infoPages.centres.prioritiesTitle")}
        </h3>
        <p className="mt-4 max-w-[720px] text-[18px] leading-7 md:text-[20px]">
          {t("infoPages.centres.prioritiesBody")}
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {priorities.map((id) => (
            <article key={id} className="rounded-3xl bg-white p-6">
              <h4 className="text-[20px] leading-7 font-medium">{t(`infoPages.centres.${id}Title`)}</h4>
              <p className="mt-3 text-[16px] leading-6 text-[#404040]">{t(`infoPages.centres.${id}Body`)}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-20 grid max-w-[1248px] items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <h3 className="text-[32px] leading-10 font-medium md:text-[40px]">{t("infoPages.centres.appTitle")}</h3>
          <ol className="mt-8 space-y-6">
            {steps.map((step, index) => (
              <li key={step}>
                <p className="text-[20px] leading-7 font-medium">{String(index + 1).padStart(2, "0")}</p>
                <p className="mt-1 text-[20px] leading-7">{t(`infoPages.centres.${step}`)}</p>
              </li>
            ))}
          </ol>
        </div>
        <img src="/centres/app.png" alt="" className="mx-auto w-full max-w-[640px]" />
      </div>

      <div className="mx-auto my-16 flex max-w-[1248px] items-center gap-6">
        <span className="h-px flex-1 bg-[#d9d9d9]" />
        <span className="text-[20px] leading-7">{t("infoPages.centres.or")}</span>
        <span className="h-px flex-1 bg-[#d9d9d9]" />
      </div>

      <div className="mx-auto max-w-[960px]">
        <h3 className="text-[32px] leading-10 font-medium md:text-[40px]">{t("infoPages.centres.formTitle")}</h3>
        <p className="mt-4 max-w-[720px] text-[18px] leading-7 md:text-[20px]">{t("infoPages.centres.formBody")}</p>
        <CentreRequestForm />
        <p className="mt-8 text-[18px] leading-7 md:text-[20px]">{t("infoPages.centres.review")}</p>
      </div>
    </section>
  )
}
