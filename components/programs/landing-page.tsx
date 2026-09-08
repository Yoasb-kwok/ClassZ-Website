"use client"

import Link from "next/link"
import type { ReactNode } from "react"
import {
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  MessageCircle,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/components/language-provider"
import { useAuthModal } from "@/components/auth-modal"

const PARTNERS = [
  { src: "/HKSTP.png", alt: "HKSTP" },
  { src: "/Cyberport_Logo_Master-01-2.png", alt: "Cyberport" },
  { src: "/Polyu.png", alt: "PolyU" },
  { src: "/ZClassZ.png", alt: "ClassZ" },
]

function HeroClassCard() {
  return (
    <div className="w-[min(100%,280px)] rounded-2xl border border-white/80 bg-white p-3 shadow-[0_18px_50px_rgba(0,0,0,0.16)]">
      <p className="text-[11px] font-semibold text-[#0abab5]">Class detail</p>
      <p className="mt-1 text-sm font-semibold text-ink">STEM Lab · Saturday</p>
      <p className="text-[11px] text-shade-400">09:30 – 11:00 · 8 children</p>
      <div className="mt-3 space-y-2">
        {[
          { name: "Ava Chen", tone: "bg-[#0abab5]" },
          { name: "Leo Wong", tone: "bg-[#3bc8c4]" },
          { name: "Mia Lau", tone: "bg-[#8fdfdb]" },
        ].map((row) => (
          <div key={row.name} className="flex items-center gap-2">
            <span className={`h-7 w-7 rounded-full ${row.tone}`} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-ink">{row.name}</p>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#ebebeb]">
                <div className="h-full w-2/3 rounded-full bg-[#0abab5]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DashboardPreview() {
  return (
    <div className="overflow-hidden rounded-[24px] border border-[#e8ecec] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
      <div className="flex min-h-[420px]">
        <aside className="hidden w-[72px] flex-col items-center gap-5 bg-[#222] py-6 sm:flex">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0abab5] text-white">
            <LayoutDashboard className="h-4 w-4" />
          </span>
          {[Users, CalendarDays, ClipboardList, TrendingUp].map((Icon) => (
            <span key={Icon.displayName || Icon.name} className="text-white/40">
              <Icon className="h-4 w-4" />
            </span>
          ))}
        </aside>
        <div className="grid min-w-0 flex-1 gap-4 p-4 md:grid-cols-[1.15fr_0.85fr] md:p-6">
          <div className="rounded-2xl bg-[#f7fafa] p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">Calendar</p>
              <p className="text-xs text-shade-400">This week</p>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-shade-400">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <span key={`${d}-${i}`}>{d}</span>
              ))}
              {Array.from({ length: 14 }, (_, i) => (
                <span
                  key={i}
                  className={`rounded-md py-1.5 text-[11px] ${
                    i === 8 ? "bg-[#0abab5] font-semibold text-white" : "bg-white text-ink"
                  }`}
                >
                  {i + 3}
                </span>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              {[
                { time: "09:30", name: "STEM Lab", tone: "bg-[#d7f4f3] text-[#089591]" },
                { time: "14:00", name: "Violin", tone: "bg-[#fff4e5] text-[#c2410c]" },
                { time: "16:30", name: "Swimming", tone: "bg-[#eef2ff] text-[#4338ca]" },
              ].map((ev) => (
                <div key={ev.name} className={`flex items-center justify-between rounded-xl px-3 py-2 ${ev.tone}`}>
                  <span className="text-xs font-medium">{ev.name}</span>
                  <span className="text-[11px] opacity-80">{ev.time}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-[#f7fafa] p-4">
            <p className="text-sm font-semibold text-ink">Student progress</p>
            <p className="mt-1 text-xs text-shade-400">Last 6 lessons</p>
            <svg viewBox="0 0 220 120" className="mt-4 h-28 w-full" aria-hidden>
              <polyline
                fill="none"
                stroke="#0abab5"
                strokeWidth="3"
                points="8,88 48,72 88,78 128,42 168,50 212,22"
              />
              {[8, 48, 88, 128, 168, 212].map((x, i) => (
                <circle key={x} cx={x} cy={[88, 72, 78, 42, 50, 22][i]} r="4" fill="#0abab5" />
              ))}
            </svg>
            <div className="mt-2 flex items-center gap-2 rounded-xl bg-white px-3 py-2">
              <Sparkles className="h-4 w-4 text-[#0abab5]" />
              <p className="text-xs text-ink">Emerging insight after 3 records</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StepRow({
  index,
  title,
  body,
  reverse,
  visual,
}: {
  index: string
  title: string
  body: string
  reverse?: boolean
  visual: ReactNode
}) {
  return (
    <div
      className={`flex flex-col items-center gap-10 lg:flex-row lg:gap-16 ${
        reverse ? "lg:flex-row-reverse" : ""
      }`}
    >
      <div className="w-full max-w-md lg:flex-1">
        <p className="text-sm font-semibold tracking-[0.18em] text-[#0abab5]">{index}</p>
        <h3 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-ink">{title}</h3>
        <p className="mt-4 text-base leading-7 text-shade-500">{body}</p>
      </div>
      <div className="w-full lg:flex-1">{visual}</div>
    </div>
  )
}

export function LandingPage() {
  const { t } = useLanguage()
  const { openAuth } = useAuthModal()

  return (
    <main className="min-h-screen bg-white text-ink">
      <Navbar />

      <section className="relative overflow-hidden px-6 pb-16 pt-10 md:px-16 md:pb-24 md:pt-16">
        <div className="pointer-events-none absolute left-1/2 top-24 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#d7f4f3] blur-[90px]" />
        <div className="pointer-events-none absolute right-[12%] top-40 h-[280px] w-[280px] rounded-full bg-[#fff4cc] blur-[80px]" />
        <div className="relative mx-auto flex max-w-[1100px] flex-col items-center text-center">
          <h1 className="max-w-[820px] text-4xl font-semibold leading-[1.12] tracking-[-0.04em] text-ink md:text-[56px]">
            {t("landing.heroTitle")}
          </h1>
          <p className="mt-5 max-w-[640px] text-base leading-7 text-shade-500 md:text-lg">
            {t("landing.heroSubtitle")}
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => openAuth("register")}
              className="inline-flex h-12 items-center rounded-full bg-[#0abab5] px-7 text-sm font-semibold text-white transition hover:bg-[#089591]"
            >
              {t("landing.startJourney")}
            </button>
            <Link
              href="#how-classz-works"
              className="inline-flex h-12 items-center rounded-full border border-[#0abab5] px-7 text-sm font-semibold text-[#0abab5] transition hover:bg-[#d7f4f3]"
            >
              {t("landing.seeHow")}
            </Link>
          </div>

          <div className="relative mt-14 w-full max-w-[920px]">
            <div className="overflow-hidden rounded-[28px] shadow-[0_30px_80px_rgba(15,23,42,0.16)]">
              <img
                src="/landing/collage-wide.jpg"
                alt=""
                className="h-[280px] w-full object-cover md:h-[420px]"
              />
            </div>
            <div className="absolute -bottom-8 right-4 md:right-10">
              <HeroClassCard />
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-8 pt-16 md:px-16">
        <p className="text-center text-xs font-medium uppercase tracking-[0.22em] text-shade-400">
          {t("landing.partnersLabel")}
        </p>
        <div className="mx-auto mt-8 flex max-w-4xl flex-wrap items-center justify-center gap-x-12 gap-y-6 grayscale">
          {PARTNERS.map((p) => (
            <img key={p.src} src={p.src} alt={p.alt} className="h-8 w-auto object-contain opacity-70 md:h-10" />
          ))}
        </div>
      </section>

      <section className="px-6 py-20 md:px-16">
        <div className="mx-auto max-w-[1100px] text-center">
          <p className="text-sm font-semibold text-[#0abab5]">{t("landing.unlockEyebrow")}</p>
          <h2 className="mx-auto mt-3 max-w-[720px] text-3xl font-semibold tracking-[-0.03em] text-ink md:text-5xl">
            {t("landing.unlockTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-[620px] text-base leading-7 text-shade-500">
            {t("landing.unlockBody")}
          </p>
          <div className="mt-12">
            <DashboardPreview />
          </div>
        </div>
      </section>

      <section id="how-classz-works" className="px-6 py-10 md:px-16 md:py-20">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-24">
          <StepRow
            index="01"
            title={t("landing.step1Title")}
            body={t("landing.step1Body")}
            visual={
              <div className="grid grid-cols-2 gap-3">
                <img src="/landing/collage-tl.jpg" alt="" className="h-44 w-full rounded-2xl object-cover md:h-56" />
                <img src="/kid-science.jpg" alt="" className="h-44 w-full rounded-2xl object-cover md:h-56" />
                <img
                  src="/landing/collage-tr.jpg"
                  alt=""
                  className="col-span-2 h-40 w-full rounded-2xl object-cover md:h-48"
                />
              </div>
            }
          />
          <StepRow
            reverse
            index="02"
            title={t("landing.step2Title")}
            body={t("landing.step2Body")}
            visual={
              <div className="grid grid-cols-3 gap-3">
                {[
                  { src: "/kid-painting.jpg", label: "Art studio" },
                  { src: "/kid-music.jpg", label: "Violin" },
                  { src: "/kid-sports.jpg", label: "Sports day" },
                ].map((card) => (
                  <article key={card.label} className="overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
                    <img src={card.src} alt="" className="h-36 w-full object-cover md:h-44" />
                    <div className="px-3 py-3">
                      <p className="text-xs font-semibold text-ink">{card.label}</p>
                      <p className="mt-1 text-[11px] text-shade-400">12 Mar · observed</p>
                    </div>
                  </article>
                ))}
              </div>
            }
          />
          <StepRow
            index="03"
            title={t("landing.step3Title")}
            body={t("landing.step3Body")}
            visual={
              <div className="relative mx-auto w-full max-w-[280px]">
                <div className="overflow-hidden rounded-[36px] border-[10px] border-[#222] bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
                  <img src="/landing/zpassport-phone.jpg" alt="" className="w-full object-cover" />
                </div>
                <span className="absolute -left-6 top-16 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md">
                  <MessageCircle className="h-5 w-5 text-[#0abab5]" />
                </span>
              </div>
            }
          />
          <StepRow
            reverse
            index="04"
            title={t("landing.step4Title")}
            body={t("landing.step4Body")}
            visual={
              <div className="relative">
                <div className="grid grid-cols-2 gap-3">
                  <img src="/landing/zpassport-card-6.png" alt="" className="h-40 w-full rounded-2xl object-cover" />
                  <img src="/landing/zpassport-card-2.png" alt="" className="h-40 w-full rounded-2xl object-cover" />
                  <div className="col-span-2 rounded-2xl bg-[#d7f4f3] p-4">
                    <p className="text-sm font-semibold text-ink">Learning passport</p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                      <div className="h-full w-3/4 rounded-full bg-[#0abab5]" />
                    </div>
                    <p className="mt-2 text-xs text-shade-500">6 records · Rabbit Active Explorer</p>
                  </div>
                </div>
              </div>
            }
          />
        </div>
      </section>

      <section className="px-6 py-16 md:px-16">
        <div className="mx-auto flex max-w-[1100px] flex-col overflow-hidden rounded-[28px] bg-[#1a1a1a] md:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-6 px-8 py-12 md:px-14">
            <h2 className="max-w-md text-3xl font-semibold leading-tight text-white md:text-4xl">
              {t("landing.ctaTitle")}
            </h2>
            <button
              type="button"
              onClick={() => openAuth("register")}
              className="inline-flex h-12 w-fit items-center rounded-full bg-white px-7 text-sm font-semibold text-ink transition hover:bg-[#d7f4f3]"
            >
              {t("landing.startNow")}
            </button>
          </div>
          <div className="relative min-h-[240px] flex-1">
            <img
              src="/family-looking-at-tablet.jpg"
              alt=""
              className="h-full w-full object-cover opacity-90"
            />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
