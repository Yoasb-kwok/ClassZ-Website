"use client"

import { JSX, useState } from "react"
import React from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ChevronDown } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

type TranslateFunction = (key: string) => string

const getTabs = (t: TranslateFunction) => [
  { id: "parents", label: t("faqsPage.tabs.parents") },
  { id: "centres", label: t("faqsPage.tabs.centres") },
]

const getParentsFaqs = (t: TranslateFunction) => [
  {
    id: "registerEnroll",
    q: t("faqsPage.parents.registerEnroll.q"),
    a: [],
    steps: [
      { image: "/Q1_1.png" },
      { image: "/Q1_2.png" },
      { image: "/Q1_3.png" },
      { title: "", desc: "", image: "/Q1_4.png" },
    ],
    note: t("faqsPage.parents.registerEnroll.note"),
  },
  {
    id: "viewPerformance",
    q: t("faqsPage.parents.viewPerformance.q"),
    a: [t("faqsPage.parents.viewPerformance.a1")],
    steps: [
      { image: "/Q2_1.png" },
      { title: "", desc: "", image: "/Q2_2.png" },
    ],
    extraTitle: t("faqsPage.parents.viewPerformance.extraTitle"),
    extraBullets: [
      t("faqsPage.parents.viewPerformance.extraBullets.0"),
      t("faqsPage.parents.viewPerformance.extraBullets.1"),
      t("faqsPage.parents.viewPerformance.extraBullets.2"),
    ],
  },
  {
    id: "subscription",
    q: t("faqsPage.parents.subscription.q"),
    a: [t("faqsPage.parents.subscription.a1")],
    bullets: [
      t("faqsPage.parents.subscription.bullets.0"),
      t("faqsPage.parents.subscription.bullets.1"),
      t("faqsPage.parents.subscription.bullets.2"),
      t("faqsPage.parents.subscription.bullets.3"),
    ],
    note: t("faqsPage.parents.subscription.note"),
    intro: "",
  },
  {
    id: "zing",
    q: t("faqsPage.parents.zing.q"),
    a: [t("faqsPage.parents.zing.a1")],
    bullets: [
      t("faqsPage.parents.zing.bullets.0"),
      t("faqsPage.parents.zing.bullets.1"),
      t("faqsPage.parents.zing.bullets.2"),
    ],
    note: t("faqsPage.parents.zing.note"),
    intro: "",
  },
  {
    id: "refund",
    q: t("faqsPage.parents.refund.q"),
    a: [
      t("faqsPage.parents.refund.a1"),
      t("faqsPage.parents.refund.a2"),
    ],
    bullets: [
      t("faqsPage.parents.refund.bullets.0"),
      t("faqsPage.parents.refund.bullets.1"),
      t("faqsPage.parents.refund.bullets.2"),
      t("faqsPage.parents.refund.bullets.3"),
      t("faqsPage.parents.refund.bullets.4"),
    ],
    bulletsSecondary: [
      t("faqsPage.parents.refund.bulletsSecondary.0"),
      t("faqsPage.parents.refund.bulletsSecondary.1"),
      t("faqsPage.parents.refund.bulletsSecondary.2"),
      t("faqsPage.parents.refund.bulletsSecondary.3"),
    ],
    intro: "",
  },
  {
    id: "badWeather",
    q: t("faqsPage.parents.badWeather.q"),
    a: [],
    weatherRows: [
      {
        signal: t("faqsPage.parents.badWeather.weatherRows.0.signal"),
        arrangement: t("faqsPage.parents.badWeather.weatherRows.0.arrangement"),
      },
      {
        signal: t("faqsPage.parents.badWeather.weatherRows.1.signal"),
        arrangement: t("faqsPage.parents.badWeather.weatherRows.1.arrangement"),
      },
      {
        signal: t("faqsPage.parents.badWeather.weatherRows.2.signal"),
        arrangement: t("faqsPage.parents.badWeather.weatherRows.2.arrangement"),
      },
    ],
    weatherNotes: [
      t("faqsPage.parents.badWeather.weatherNotes.0"),
      t("faqsPage.parents.badWeather.weatherNotes.1"),
      t("faqsPage.parents.badWeather.weatherNotes.2"),
    ],
    intro: "",
  },
  {
    id: "sen",
    q: t("faqsPage.parents.sen.q"),
    a: [
      t("faqsPage.parents.sen.a1"),
      t("faqsPage.parents.sen.a2"),
      t("faqsPage.parents.sen.a3"),
    ],
    senImage: "/q7.png",
    bullets: [t("faqsPage.parents.sen.bullets.0")],
    intro: "",
  },
  {
    id: "multipleChildren",
    q: t("faqsPage.parents.multipleChildren.q"),
    a: [t("faqsPage.parents.multipleChildren.a1")],
    gallery: ["/Q81.png", "/Q82.png"],
    bullets: [
      t("faqsPage.parents.multipleChildren.bullets.0"),
      t("faqsPage.parents.multipleChildren.bullets.1"),
    ],
    intro: "",
  },
  {
    id: "classPhotos",
    q: t("faqsPage.parents.classPhotos.q"),
    a: [],
    gallery: ["/Q91.png", "/Q92.png"],
    bullets: [
      t("faqsPage.parents.classPhotos.bullets.0"),
      t("faqsPage.parents.classPhotos.bullets.1"),
    ],
    intro: "",
  },
  {
    id: "contactHelp",
    q: t("faqsPage.parents.contactHelp.q"),
    a: [
      t("faqsPage.parents.contactHelp.a1"),
      t("faqsPage.parents.contactHelp.a2"),
    ],
    gallery: ["/Q10.png"],
    bullets: [],
    intro: "",
    note: " ",
  },
]

const getCentresFaqs = (t: TranslateFunction) => [
  {
    id: "pricing",
    q: t("faqsPage.centres.pricing.q"),
    a: [t("faqsPage.centres.pricing.a1")],
    bullets: [
      t("faqsPage.centres.pricing.bullets.0"),
      t("faqsPage.centres.pricing.bullets.1"),
      t("faqsPage.centres.pricing.bullets.2"),
    ],
  },
  {
    id: "payment",
    q: t("faqsPage.centres.payment.q"),
    a: [
      t("faqsPage.centres.payment.a1"),
      t("faqsPage.centres.payment.a2"),
    ],
    bullets: [
      t("faqsPage.centres.payment.bullets.0"),
    ],
  },
  {
    id: "mandatoryFeedback",
    q: t("faqsPage.centres.mandatoryFeedback.q"),
    a: [
      t("faqsPage.centres.mandatoryFeedback.a1"),
      t("faqsPage.centres.mandatoryFeedback.a2"),
      t("faqsPage.centres.mandatoryFeedback.a3"),
    ],
    bullets: [
      t("faqsPage.centres.mandatoryFeedback.bullets.0"),
    ],
  },
  {
    id: "editSchedule",
    q: t("faqsPage.centres.editSchedule.q"),
    a: [t("faqsPage.centres.editSchedule.a1")],
    sections: [
      {
        title: t("faqsPage.centres.editSchedule.sections.howItWorks.title"),
        bullets: [
          t("faqsPage.centres.editSchedule.sections.howItWorks.bullets.0"),
          t("faqsPage.centres.editSchedule.sections.howItWorks.bullets.1"),
          t("faqsPage.centres.editSchedule.sections.howItWorks.bullets.2"),
        ],
        highlights: [
          { text: t("faqsPage.centres.editSchedule.sections.howItWorks.highlights.0"), inBullet: 1 },
        ],
      },
      {
        title: t("faqsPage.centres.editSchedule.sections.fairnessRules.title"),
        bullets: [
          {
            text: t("faqsPage.centres.editSchedule.sections.fairnessRules.bullets.0.text"),
            subBullet: t("faqsPage.centres.editSchedule.sections.fairnessRules.bullets.0.subBullet"),
            highlights: [
              t("faqsPage.centres.editSchedule.sections.fairnessRules.bullets.0.highlights.0"),
              t("faqsPage.centres.editSchedule.sections.fairnessRules.bullets.0.highlights.1"),
            ],
          },
          {
            text: t("faqsPage.centres.editSchedule.sections.fairnessRules.bullets.1.text"),
            subBullet: t("faqsPage.centres.editSchedule.sections.fairnessRules.bullets.1.subBullet"),
            highlights: [
              t("faqsPage.centres.editSchedule.sections.fairnessRules.bullets.1.highlights.0"),
              t("faqsPage.centres.editSchedule.sections.fairnessRules.bullets.1.highlights.1"),
            ],
          },
        ],
      },
      {
        title: t("faqsPage.centres.editSchedule.sections.noEnrollment.title"),
        bullets: [
          t("faqsPage.centres.editSchedule.sections.noEnrollment.bullets.0"),
          t("faqsPage.centres.editSchedule.sections.noEnrollment.bullets.1"),
        ],
        highlights: [
          t("faqsPage.centres.editSchedule.sections.noEnrollment.highlights.0"),
          t("faqsPage.centres.editSchedule.sections.noEnrollment.highlights.1"),
        ],
        tealBullets: true,
      },
    ],
    note: t("faqsPage.centres.editSchedule.note"),
  },
  {
    id: "registerCentre",
    q: t("faqsPage.centres.registerCentre.q"),
    a: [t("faqsPage.centres.registerCentre.a1")],
    bullets: [
      t("faqsPage.centres.registerCentre.bullets.0"),
      t("faqsPage.centres.registerCentre.bullets.1"),
    ],
  },
  {
    id: "accountTypes",
    q: t("faqsPage.centres.accountTypes.q"),
    a: [
      t("faqsPage.centres.accountTypes.a1"),
      t("faqsPage.centres.accountTypes.a2"),
      t("faqsPage.centres.accountTypes.a3"),
      t("faqsPage.centres.accountTypes.a4"),
      t("faqsPage.centres.accountTypes.a5"),
    ],
  },
  {
    id: "multipleBranches",
    q: t("faqsPage.centres.multipleBranches.q"),
    a: [
      t("faqsPage.centres.multipleBranches.a1"),
      t("faqsPage.centres.multipleBranches.a2"),
      t("faqsPage.centres.multipleBranches.a3"),
    ],
  },
  {
    id: "profileInfo",
    q: t("faqsPage.centres.profileInfo.q"),
    a: [
      t("faqsPage.centres.profileInfo.a1"),
      t("faqsPage.centres.profileInfo.a2"),
      t("faqsPage.centres.profileInfo.a3"),
    ],
  },
  {
    id: "badWeatherCentres",
    q: t("faqsPage.centres.badWeatherCentres.q"),
    a: [t("faqsPage.centres.badWeatherCentres.a1")],
    weatherRows: [
      {
        signal: t("faqsPage.centres.badWeatherCentres.weatherRows.0.signal"),
        arrangement: t("faqsPage.centres.badWeatherCentres.weatherRows.0.arrangement"),
      },
      {
        signal: t("faqsPage.centres.badWeatherCentres.weatherRows.1.signal"),
        arrangement: t("faqsPage.centres.badWeatherCentres.weatherRows.1.arrangement"),
      },
      {
        signal: t("faqsPage.centres.badWeatherCentres.weatherRows.2.signal"),
        arrangement: t("faqsPage.centres.badWeatherCentres.weatherRows.2.arrangement"),
      },
    ],
    classzBullets: [
      t("faqsPage.centres.badWeatherCentres.classzBullets.0"),
      t("faqsPage.centres.badWeatherCentres.classzBullets.1"),
      t("faqsPage.centres.badWeatherCentres.classzBullets.2"),
    ],
    highlights: [
      { text: t("faqsPage.centres.badWeatherCentres.highlights.0.text"), inBullet: 1 },
      { text: t("faqsPage.centres.badWeatherCentres.highlights.1.text"), inBullet: 2 },
      { text: t("faqsPage.centres.badWeatherCentres.highlights.2.text"), inBullet: 2 },
    ],
  },
  {
    id: "goodFit",
    q: t("faqsPage.centres.goodFit.q"),
    bullets: [
      t("faqsPage.centres.goodFit.bullets.0"),
      t("faqsPage.centres.goodFit.bullets.1"),
    ],
    a: [t("faqsPage.centres.goodFit.a1")],
  },
  {
    id: "payouts",
    q: t("faqsPage.centres.payouts.q"),
    checklistTitle: t("faqsPage.centres.payouts.checklistTitle"),
    checklistBullets: [
      {
        text: t("faqsPage.centres.payouts.checklistBullets.0.text"),
        highlight: t("faqsPage.centres.payouts.checklistBullets.0.highlight"),
        rest: t("faqsPage.centres.payouts.checklistBullets.0.rest"),
      },
      {
        text: t("faqsPage.centres.payouts.checklistBullets.1.text"),
        highlight: t("faqsPage.centres.payouts.checklistBullets.1.highlight"),
        rest: t("faqsPage.centres.payouts.checklistBullets.1.rest"),
      },
      {
        text: t("faqsPage.centres.payouts.checklistBullets.2.text"),
        highlight: t("faqsPage.centres.payouts.checklistBullets.2.highlight"),
        rest: t("faqsPage.centres.payouts.checklistBullets.2.rest"),
      },
      {
        text: t("faqsPage.centres.payouts.checklistBullets.3.text"),
        highlight: t("faqsPage.centres.payouts.checklistBullets.3.highlight"),
        rest: t("faqsPage.centres.payouts.checklistBullets.3.rest"),
      },
      {
        text: t("faqsPage.centres.payouts.checklistBullets.4.text"),
        highlight: t("faqsPage.centres.payouts.checklistBullets.4.highlight"),
        rest: t("faqsPage.centres.payouts.checklistBullets.4.rest"),
      },
    ],
    note: t("faqsPage.centres.payouts.note"),
  },
]

export default function FAQsPage() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<"parents" | "centres">("parents")
  const [openParent, setOpenParent] = useState<number | null>(null)
  const [openCentre, setOpenCentre] = useState<number | null>(null)

  const tabs = getTabs(t)
  const parentsFaqs = getParentsFaqs(t)
  const centresFaqs = getCentresFaqs(t)
  const list = activeTab === "parents" ? parentsFaqs : centresFaqs
  const openIdx = activeTab === "parents" ? openParent : openCentre
  const setOpen = activeTab === "parents" ? setOpenParent : setOpenCentre

  const collapseAll = () => {
    setOpenParent(null)
    setOpenCentre(null)
  }

  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 selection:bg-teal-100">
      <Navbar />

      {/* Hero */}
      <section className="relative w-full overflow-hidden border-b border-[#E9E9E9] min-h-[280px] md:min-h-0">
        <div className="relative w-full h-[280px] md:h-auto" style={{ paddingBottom: '0' }}>
          <div className="absolute inset-0 md:relative md:pb-[33.33%]">
            <div
              className="absolute inset-0 md:absolute bg-cover"
              style={{ backgroundImage: "url('/headerFAQs.png')" }}
            />
          </div>
        </div>
        <div className="absolute inset-0 bg-black/40 md:bg-black/35 pointer-events-none h-[280px] md:h-full" />
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none h-[280px] md:h-full">
          <div className="max-w-[1180px] mx-auto w-full px-4 sm:px-6 md:px-10 text-center pointer-events-auto">
            <h1 className="text-white text-2xl sm:text-3xl md:text-5xl font-semibold mb-2 drop-shadow-lg">{t("faqsPage.hero.title")}</h1>
            <p className="text-white/90 text-sm sm:text-base md:text-xl drop-shadow">{t("faqsPage.hero.subtitle")}</p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-10 border-b border-[#E9E9E9] bg-[#F9FBFD]">
        <div className="max-w-[1080px] mx-auto px-6 md:px-10 space-y-4 text-center">
          <p className="text-sm text-[#485A69]">
            {t("faqsPage.tabs.description")}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "parents" | "centres")}
                className={`px-5 py-2 rounded-full border text-sm font-medium ${activeTab === tab.id
                  ? "bg-[#0ABAB5] text-white border-[#0ABAB5]"
                  : "bg-white text-[#00A3A0] border-[#0ABAB5]"
                  } transition-colors shadow-sm`}
              >
                {tab.id === "parents" ? t("faqsPage.tabs.parents") : t("faqsPage.tabs.centres")}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ list */}
      <section className="py-14 bg-white">
        <div className="max-w-[1080px] mx-auto px-6 md:px-10 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[#111929]">
              {activeTab === "parents" ? t("faqsPage.tabs.parents") : t("faqsPage.tabs.centres")}
            </h2>
            <button
              onClick={collapseAll}
              className="text-xs font-medium text-[#00A3A0] hover:text-[#008f8a] underline decoration-dotted"
            >
              {t("faqsPage.collapseAll")}
            </button>
          </div>

          {activeTab === "parents" ? (
            <div className="space-y-8 text-[#111929]">
              {parentsFaqs.map((item, idx) => {
                const open = openParent === idx
                return (
                  <div key={item.id} className="space-y-4 pb-6">
                    <button
                      onClick={() => setOpenParent(open ? null : idx)}
                      className="w-full flex items-start justify-between gap-4 text-left"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-[#5AE0D6] text-base font-semibold">Q</span>
                        <span className="text-base md:text-lg leading-snug">{item.q}</span>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
                      />
                    </button>
                    {open && (
                      <div className="space-y-5 text-sm leading-relaxed text-[#4B5563]">
                        {item.weatherRows && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-[1.05fr_1fr] gap-x-8 text-sm font-semibold text-[#00A3A0]">
                              <span>{t("faqsPage.weatherSignal")}</span>
                              <span>{t("faqsPage.arrangement")}</span>
                            </div>
                            <div className="divide-y divide-[#E5E7EB] border-y border-[#E5E7EB]">
                              {item.weatherRows.map((row, i) => (
                                <div key={i} className="grid grid-cols-1 md:grid-cols-[1.05fr_1fr] gap-x-8 py-4">
                                  <div className="text-[#111929] leading-snug whitespace-pre-line">{row.signal}</div>
                                  <div className="text-[#4B5563] leading-relaxed">{row.arrangement}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {(() => {
                          const firstLine = item.a?.[0]
                          const secondLine = item.a?.[1]
                          const restLines = item.a ? item.a.slice(2) : []

                          const renderLine = (line: string) => {
                            const token = "[create a support ticket]"
                            const parts = line.split(token)
                            if (parts.length > 1) {
                              return (
                                <>
                                  {parts[0]}
                                  <Link href="/contact-us" className="text-[#00A3A0] font-semibold underline">
                                    create a support ticket
                                  </Link>
                                  {parts[1]}
                                </>
                              )
                            }
                            if (item.id === "subscription" && line.includes("optional")) {
                              const [before, after] = line.split("optional")
                              return (
                                <>
                                  {before}
                                  <span className="text-[#00A3A0]">optional</span>
                                  {after}
                                </>
                              )
                            }
                            if (item.id === "zing" && line.includes("Zing")) {
                              const [before, after] = line.split("Zing")
                              return (
                                <>
                                  {before}
                                  <span className="text-[#00A3A0]">Zing</span>
                                  {after}
                                </>
                              )
                            }
                            if (item.id === "multipleChildren" && line.includes("Yes")) {
                              const [before, after] = line.split("Yes")
                              return (
                                <>
                                  {before}
                                  <span className="text-[#00A3A0]">Yes</span>
                                  {after}
                                </>
                              )
                            }
                            return line
                          }

                          const isContactHelp = item.id === "contactHelp"

                          return (
                            <>
                              {!isContactHelp && firstLine && (
                                <div className="space-y-2 text-[#4B5563] text-sm">
                                  <p className="text-[#111929]">{renderLine(firstLine)}</p>
                                  {restLines.map((line, i) => (
                                    <p key={i} className="text-[#4B5563]">
                                      {renderLine(line)}
                                    </p>
                                  ))}
                                </div>
                              )}
                              {/* For "Can I enroll multiple children..." show gallery before bullets */}
                              {item.gallery && item.gallery.length > 0 && item.id === "multipleChildren" && (
                                <div
                                  className={
                                    item.gallery.length > 1
                                      ? "grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"
                                      : "pt-2 flex justify-center"
                                  }
                                >
                                  {item.gallery.map((src, i) => (
                                    <div key={i} className={item.gallery.length > 1 ? "flex justify-center" : "w-full max-w-4xl"}>
                                      <img
                                        src={src}
                                        alt={`Illustration ${i + 1}`}
                                        className={`w-full rounded-2xl ${item.gallery.length > 1 ? "max-w-xl" : "max-w-4xl"}`}
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}

                              {item.bullets && item.bullets.length > 0 && item.id !== "classPhotos" && item.id !== "contactHelp" && (
                                <ul className="space-y-2 list-disc list-inside text-[#4B5563] text-sm pl-1">
                                  {item.bullets.map((b, i) => {
                                    const highlightFinal = (text: string) => {
                                      if (item.id === "multipleChildren") {
                                        let out: (string | JSX.Element)[] = []
                                        const parts = text.split(/(final|non-refundable)/i)
                                        parts.forEach((p, idx) => {
                                          if (p.toLowerCase() === "final" || p.toLowerCase() === "non-refundable") {
                                            out.push(
                                              <span key={`${i}-hl-${idx}`} className="text-[#00A3A0]">
                                                {p}
                                              </span>
                                            )
                                          } else {
                                            out.push(p)
                                          }
                                        })
                                        return out
                                      }
                                      return text
                                    }
                                    return <li key={i}>{highlightFinal(b)}</li>
                                  })}
                                </ul>
                              )}
                              {secondLine && !isContactHelp && (
                                <div className="pt-4 text-sm text-[#4B5563]">
                                  <p className="text-[#111929]">{renderLine(secondLine)}</p>
                                </div>
                              )}
                            </>
                          )
                        })()}

                        {item.steps && item.steps.length > 0 && (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                              {item.steps.map((step, i) => (
                                <div key={i} className="space-y-3">
                                  <div className="relative rounded-2xl overflow-hidden">
                                    {step.image && (
                                      <img src={step.image} alt={step.title} className="w-full object-cover" />
                                    )}
                                  </div>
                                  <div className="text-sm text-[#4B5563] leading-relaxed">
                                    <p className="text-[#111929]">{step.title}</p>
                                    <p className="text-[#4B5563]">{step.desc}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}

                        {item.gallery && item.gallery.length > 0 && item.id !== "multipleChildren" && item.id !== "classPhotos" && item.id !== "contactHelp" && (
                          <div
                            className={
                              item.gallery.length > 1
                                ? "grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"
                                : "pt-2 flex justify-center"
                            }
                          >
                            {item.gallery.map((src, i) => (
                              <div key={i} className={item.gallery.length > 1 ? "flex justify-center" : "w-full max-w-4xl"}>
                                <img
                                  src={src}
                                  alt={`Illustration ${i + 1}`}
                                  className={`w-full rounded-2xl ${item.gallery.length > 1 ? "max-w-xl" : "max-w-4xl"}`}
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {item.gallery && item.gallery.length > 0 && item.id === "contactHelp" && (
                          <div className="pt-2 flex justify-center">
                            {item.gallery.map((src, i) => (
                              <div key={i} className="w-full max-w-4xl">
                                <img src={src} alt={`Illustration ${i + 1}`} className="w-full rounded-2xl" />
                              </div>
                            ))}
                          </div>
                        )}

                        {item.bullets && item.bullets.length > 0 && item.id === "contactHelp" && (
                          <ul className="space-y-2 list-disc list-inside text-[#4B5563] text-sm pl-1 pt-2">
                            {item.bullets.map((b, i) => (
                              <li key={i}>{b}</li>
                            ))}
                          </ul>
                        )}

                        {item.a && item.a.length > 0 && item.id === "contactHelp" && (
                          <div className="space-y-2 text-[#4B5563] text-sm pt-4">
                            {item.a.map((line, i) => (
                              <p key={i} className={i === 0 ? "text-[#111929]" : ""}>
                                {(() => {
                                  const token = "[create a support ticket]"
                                  const parts = line.split(token)
                                  if (parts.length > 1) {
                                    return (
                                      <>
                                        {parts[0]}
                                        <Link href="/contact-us" className="text-[#00A3A0] font-semibold underline">
                                          create a support ticket
                                        </Link>
                                        {parts[1]}
                                      </>
                                    )
                                  }
                                  return line
                                })()}
                              </p>
                            ))}
                          </div>
                        )}

                        {item.gallery && item.gallery.length > 0 && item.id === "classPhotos" && (
                          <div
                            className={
                              item.gallery.length > 1
                                ? "grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"
                                : "pt-2 flex justify-center"
                            }
                          >
                            {item.gallery.map((src, i) => (
                              <div key={i} className={item.gallery.length > 1 ? "flex justify-center" : "w-full max-w-4xl"}>
                                <img
                                  src={src}
                                  alt={`Illustration ${i + 1}`}
                                  className={`w-full rounded-2xl ${item.gallery.length > 1 ? "max-w-xl" : "max-w-4xl"}`}
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {item.bullets && item.bullets.length > 0 && item.id === "classPhotos" && (
                          <ul className="space-y-2 list-disc list-inside text-[#4B5563] text-sm pl-1 pt-2">
                            {item.bullets.map((b, i) => (
                              <li key={i}>{b}</li>
                            ))}
                          </ul>
                        )}

                        {item.bulletsSecondary && item.bulletsSecondary.length > 0 && (
                          <ul className="space-y-2 list-disc list-inside text-[#4B5563] text-sm pl-1 pt-1">
                            {item.bulletsSecondary.map((b, i) => (
                              <li key={i}>{b}</li>
                            ))}
                          </ul>
                        )}

                        {item.senImage && (
                          <div className="pt-2 flex justify-center">
                            <img
                              src={item.senImage}
                              alt="SEN support example"
                              className="max-w-xl w-full rounded-2xl"
                            />
                          </div>
                        )}

                        {item.weatherNotes && item.weatherNotes.length > 0 && (
                          <ul className="space-y-2 list-disc list-inside text-[#4B5563] text-sm pl-1">
                            {item.weatherNotes.map((note, i) => {
                              const token = "[create a support ticket]"
                              const parts = note.split(token)
                              return (
                                <li key={i}>
                                  {parts.length > 1 ? (
                                    <>
                                      {parts[0]}
                                      <Link href="/contact-us" className="text-[#00A3A0] font-semibold underline">
                                        create a support ticket
                                      </Link>
                                      {parts[1]}
                                    </>
                                  ) : (
                                    note
                                  )}
                                </li>
                              )
                            })}
                          </ul>
                        )}

                        {item.extraTitle && (
                          <div className="space-y-3 pt-2">
                            <p className="text-sm md:text-base font-semibold text-[#111929]">
                              {item.extraTitle.includes("three parts") ? (
                                <>
                                  {item.extraTitle.replace("Insights are divided into three parts:", "Insights are divided into ")}
                                  <span className="text-[#00A3A0]">three parts</span>:
                                </>
                              ) : (
                                item.extraTitle
                              )}
                            </p>
                            {item.extraBullets && item.id === "viewPerformance" ? (
                              <div className="space-y-4 text-sm md:text-base text-[#4B5563]">
                                {item.extraBullets.map((b, i) => {
                                  const [head, ...rest] = b.split(":")
                                  const body = rest.join(":").trim()
                                  return (
                                    <div key={i} className="space-y-1">
                                      <p className="font-semibold text-[#00A3A0]">{head.trim()}:</p>
                                      {body && <p>{body}</p>}
                                    </div>
                                  )
                                })}
                              </div>
                            ) : (
                              <ul className="space-y-1 list-disc list-inside text-[#4B5563] text-xs md:text-sm">
                                {item.extraBullets?.map((b, i) => (
                                  <li key={i}>{b}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}

                        {item.note && (
                          <p className="text-xs text-[#00A3A0] font-semibold pt-1 leading-relaxed">{item.note}</p>
                        )}

                        {!item.note && item.id === "registerEnroll" && (
                          <p className="text-xs text-[#00A3A0] font-semibold pt-1 leading-relaxed">
                            Each enrolment is linked to a specific child profile, so make sure you select the right one before checkout.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            list.map((item, idx) => {
              const open = openCentre === idx
              return (
                <div
                  key={item.id}
                  className="bg-white"
                >
                  <button
                    onClick={() => setOpenCentre(open ? null : idx)}
                    className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-[#00A3A0] text-base font-semibold">Q</span>
                      <span className="text-base md:text-lg text-[#111929] leading-snug">{item.q}</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>
                  {open && (
                    <div className="px-5 pb-5 space-y-2 text-sm text-[#485A69] leading-relaxed">
                      {item.a && item.a.length > 0 && item.id !== "pricing" && item.id !== "editSchedule" && item.id !== "accountTypes" && item.id !== "multipleBranches" && item.id !== "profileInfo" && item.id !== "badWeatherCentres" && item.id !== "goodFit" && item.id !== "payouts" && (
                        <div className="space-y-2">
                          {(item.id === "payment"
                            ? [item.a[0]]
                            : item.id === "mandatoryFeedback"
                              ? [item.a[0], item.a[1]]
                              : item.a
                          ).map((line, i) => {
                            const renderLine = (text: string) => {
                              if (item.id === "payment") {
                                if (text.includes("third-party payment methods")) {
                                  const parts = text.split("third-party payment methods")
                                  return (
                                    <>
                                      {parts[0]}
                                      <span className="text-[#00A3A0] font-semibold">third-party payment methods</span>
                                      {parts[1]}
                                    </>
                                  )
                                }
                              }
                              if (item.id === "mandatoryFeedback") {
                                // Highlight "Yes—mandatory for every attended lesson." (first line)
                                if (text.includes("Yes—mandatory for every attended lesson.")) {
                                  return <span className="text-[#00A3A0]">{text}</span>
                                }
                                // Highlight "one class photo" and "provide feedback"
                                if (text.includes("one class photo") || text.includes("provide feedback")) {
                                  let result: (string | JSX.Element)[] = []
                                  let remaining = text

                                  if (remaining.includes("one class photo")) {
                                    const idx = remaining.indexOf("one class photo")
                                    if (idx > 0) result.push(remaining.substring(0, idx))
                                    result.push(<span key="photo" className="text-[#00A3A0]">one class photo</span>)
                                    remaining = remaining.substring(idx + 15)
                                  }

                                  if (remaining.includes("provide feedback")) {
                                    const idx = remaining.indexOf("provide feedback")
                                    if (idx > 0) result.push(remaining.substring(0, idx))
                                    result.push(<span key="feedback" className="text-[#00A3A0]">provide feedback</span>)
                                    remaining = remaining.substring(idx + 17)
                                  }

                                  if (remaining) result.push(remaining)
                                  return <>{result}</>
                                }
                              }
                              if (item.id === "registerCentre") {
                                if (text.includes("[How to Join Us]")) {
                                  const parts = text.split("[How to Join Us]")
                                  return (
                                    <>
                                      {parts[0]}
                                      <Link href="/partnership" className="text-[#00A3A0]">
                                        How to Join Us
                                      </Link>
                                      {parts[1]}
                                    </>
                                  )
                                }
                              }
                              return text
                            }
                            return <p key={i}>{renderLine(line)}</p>
                          })}
                        </div>
                      )}
                      {item.bullets && item.bullets.length > 0 && item.id !== "goodFit" && item.id !== "payouts" && (
                        <ul className="space-y-2 list-disc list-inside">
                          {item.bullets.map((b, i) => {
                            const highlightText = (text: string) => {
                              if (item.id === "payment") {
                                if (text.includes("ClassZ covers the standard processor fees for eligible centres.")) {
                                  const parts = text.split("ClassZ covers the standard processor fees for eligible centres.")
                                  return (
                                    <>
                                      {parts[0]}
                                      <span className="text-[#00A3A0] font-semibold">
                                        ClassZ covers the standard processor fees for eligible centres.
                                      </span>
                                      {parts[1]}
                                    </>
                                  )
                                }
                                return text
                              }
                              if (item.id === "pricing") {
                                const parts: (string | JSX.Element)[] = []
                                // Highlight "Free" (bold)
                                let remaining = text
                                if (remaining.includes("Free")) {
                                  const idx = remaining.indexOf("Free")
                                  if (idx > 0) parts.push(remaining.substring(0, idx))
                                  parts.push(
                                    <span key={`free-${i}`} className="text-[#00A3A0] font-semibold">
                                      Free
                                    </span>
                                  )
                                  remaining = remaining.substring(idx + 4)
                                }
                                // Highlight "0% commission" (bold)
                                if (remaining.includes("0% commission")) {
                                  const idx = remaining.indexOf("0% commission")
                                  if (idx > 0) parts.push(remaining.substring(0, idx))
                                  parts.push(
                                    <span key={`commission-${i}`} className="text-[#00A3A0] font-semibold">
                                      0% commission
                                    </span>
                                  )
                                  remaining = remaining.substring(idx + 15)
                                }
                                // Highlight "centres don't pay these" (not bold)
                                if (remaining.includes("centres don't pay these")) {
                                  const idx = remaining.indexOf("centres don't pay these")
                                  if (idx > 0) parts.push(remaining.substring(0, idx))
                                  parts.push(
                                    <span key={`dontpay-${i}`} className="text-[#00A3A0]">
                                      centres don't pay these
                                    </span>
                                  )
                                  remaining = remaining.substring(idx + 25)
                                }
                                // Highlight "[How to Join Us]" (link)
                                if (remaining.includes("[How to Join Us]")) {
                                  const idx = remaining.indexOf("[How to Join Us]")
                                  if (idx > 0) parts.push(remaining.substring(0, idx))
                                  parts.push(
                                    <Link key={`joinus-${i}`} href="/partnership" className="text-[#00A3A0] underline">
                                      How to Join Us
                                    </Link>
                                  )
                                  remaining = remaining.substring(idx + 16)
                                }
                                if (remaining) parts.push(remaining)
                                return parts.length > 0 ? <>{parts}</> : text
                              }
                              return text
                            }
                            return <li key={i}>{highlightText(b)}</li>
                          })}
                        </ul>
                      )}
                      {item.a && item.a.length > 0 && item.id === "pricing" && (
                        <div className="space-y-2 pt-2">
                          {item.a.map((line, i) => {
                            const renderLine = (text: string) => {
                              if (text.includes("[How to Join Us]")) {
                                const parts = text.split("[How to Join Us]")
                                return (
                                  <>
                                    {parts[0]}
                                    <Link href="/partnership" className="text-[#00A3A0] underline">
                                      How to Join Us
                                    </Link>
                                    {parts[1]}
                                  </>
                                )
                              }
                              return text
                            }
                            return <p key={i}>{renderLine(line)}</p>
                          })}
                        </div>
                      )}
                      {item.a && item.a.length > 1 && item.id === "payment" && (
                        <div className="space-y-2 pt-2">
                          {item.a.slice(1).map((line, i) => (
                            <p key={i}>{line}</p>
                          ))}
                        </div>
                      )}
                      {item.a && item.a.length > 2 && item.id === "mandatoryFeedback" && (
                        <div className="space-y-2 pt-2">
                          <p>{item.a[2]}</p>
                        </div>
                      )}
                      {'sections' in item && item.sections && item.id === "editSchedule" && (
                        <div className="space-y-4 pt-2">
                          {/* Intro line with highlight */}
                          {item.a && item.a.length > 0 && (
                            <p>
                              <span className="text-[#00A3A0]">Yes—by request only.</span>{" "}
                              {item.a[0].replace("Yes—by request only. ", "")}
                            </p>
                          )}
                          {/* Sections */}
                          {('sections' in item && item.sections ? item.sections : []).map((section: any, sectionIdx: number) => (
                            <div key={sectionIdx} className="space-y-2">
                              {/* Section title */}
                              <h4 className={section.title.includes("Does not have enrollment yet?") ? "" : "text-[#00A3A0]"}>
                                {section.title.includes("Does not have enrollment yet?") ? (
                                  <>
                                    <span className="text-[#00A3A0]">Does not have enrollment yet?</span>{" "}
                                    <span className="text-[#111929]">{section.title.replace("Does not have enrollment yet? ", "")}</span>
                                  </>
                                ) : (
                                  section.title
                                )}
                              </h4>
                              {/* Bullets */}
                              <ul className={`space-y-2 ${section.tealBullets ? "list-none" : "list-disc"} list-inside`}>
                                {section.bullets.map((bullet: any, bulletIdx: number) => {
                                  const bulletText = typeof bullet === "string" ? bullet : bullet.text
                                  const subBullet = typeof bullet === "object" ? bullet.subBullet : null
                                  // Get highlights: from bullet object, or from section.highlights (either array of strings or array with inBullet)
                                  let highlights: string[] = []
                                  if (typeof bullet === "object" && bullet.highlights) {
                                    highlights = bullet.highlights
                                  } else if (section.highlights) {
                                    // Check if section.highlights is array of strings (for last section) or array of objects with inBullet
                                    if (Array.isArray(section.highlights) && section.highlights.length > 0) {
                                      if (typeof section.highlights[0] === "string") {
                                        // Array of strings - check if this bullet contains any of them
                                        highlights = section.highlights.filter((h: string) => bulletText.includes(h))
                                      } else {
                                        // Array of objects with inBullet
                                        const highlightObj = section.highlights.find((h: any) => h.inBullet === bulletIdx)
                                        if (highlightObj) {
                                          highlights = [highlightObj.text]
                                        }
                                      }
                                    }
                                  }

                                  const renderBulletText = (text: string) => {
                                    let result: (string | JSX.Element)[] = []
                                    let remaining = text

                                    // Handle highlights
                                    if (highlights.length > 0) {
                                      // Sort highlights by position in text (longest first to avoid partial matches)
                                      const sortedHighlights = highlights.sort((a, b) => b.length - a.length)
                                      const highlightPositions = sortedHighlights.map((h: string) => ({
                                        text: h,
                                        pos: remaining.indexOf(h),
                                      })).filter((hp: any) => hp.pos >= 0).sort((a: any, b: any) => a.pos - b.pos)

                                      // Remove overlapping highlights (keep the first one)
                                      const nonOverlapping: any[] = []
                                      highlightPositions.forEach((hp: any) => {
                                        const overlaps = nonOverlapping.some((existing: any) => {
                                          const existingEnd = existing.pos + existing.text.length
                                          const hpEnd = hp.pos + hp.text.length
                                          return (hp.pos >= existing.pos && hp.pos < existingEnd) ||
                                            (existing.pos >= hp.pos && existing.pos < hpEnd)
                                        })
                                        if (!overlaps) {
                                          nonOverlapping.push(hp)
                                        }
                                      })

                                      let lastPos = 0
                                      nonOverlapping.forEach((hp: any) => {
                                        if (hp.pos > lastPos) {
                                          result.push(remaining.substring(lastPos, hp.pos))
                                        }
                                        result.push(
                                          <span key={`highlight-${bulletIdx}-${hp.pos}`} className="text-[#00A3A0]">
                                            {hp.text}
                                          </span>
                                        )
                                        lastPos = hp.pos + hp.text.length
                                      })
                                      if (lastPos < remaining.length) {
                                        result.push(remaining.substring(lastPos))
                                      }
                                    } else {
                                      result.push(text)
                                    }

                                    return result.length > 0 ? <>{result}</> : text
                                  }

                                  return (
                                    <li key={bulletIdx} className={section.tealBullets ? "flex items-start gap-2" : ""}>
                                      {section.tealBullets && (
                                        <span className="text-[#00A3A0] mt-1.5 w-1.5 h-1.5 bg-[#00A3A0] rounded-sm flex-shrink-0"></span>
                                      )}
                                      <div className="flex-1">
                                        <span>{renderBulletText(bulletText)}</span>
                                        {subBullet && (
                                          <div className="mt-1 pl-4">
                                            <span className="text-[#485A69]">
                                              {(() => {
                                                // Highlight "full refund for that session" in sub-bullet
                                                if (subBullet.includes("full refund for that session")) {
                                                  const parts = subBullet.split("full refund for that session")
                                                  return (
                                                    <>
                                                      {parts[0]}
                                                      <span className="text-[#00A3A0]">full refund for that session</span>
                                                      {parts[1]}
                                                    </>
                                                  )
                                                }
                                                return subBullet
                                              })()}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </li>
                                  )
                                })}
                              </ul>
                            </div>
                          ))}
                          {/* Note */}
                          {item.note && (
                            <p className="pt-2">{item.note}</p>
                          )}
                        </div>
                      )}
                      {item.a && item.a.length > 0 && item.id === "editSchedule" && !('sections' in item && item.sections) && (
                        <div className="space-y-2">
                          {item.a.map((line, i) => {
                            const renderLine = (text: string) => {
                              if (text.includes("Yes—by request only.")) {
                                const parts = text.split("Yes—by request only.")
                                return (
                                  <>
                                    <span className="text-[#00A3A0]">Yes—by request only.</span>
                                    {parts[1]}
                                  </>
                                )
                              }
                              return text
                            }
                            return <p key={i}>{renderLine(line)}</p>
                          })}
                        </div>
                      )}
                      {item.a && item.a.length > 0 && item.id === "accountTypes" && (
                        <div className="space-y-2">
                          {item.a.map((line, i) => {
                            const renderLine = (text: string) => {
                              // Highlight "Owner:", "Manager:", "Coach:" in teal
                              if (text.startsWith("Owner:") || text.startsWith("Manager:") || text.startsWith("Coach:")) {
                                const colonIndex = text.indexOf(":")
                                const role = text.substring(0, colonIndex + 1)
                                const description = text.substring(colonIndex + 1)
                                return (
                                  <>
                                    <span className="text-[#00A3A0]">{role}</span>
                                    {description}
                                  </>
                                )
                              }
                              // Convert "[Centre Overview]" to link
                              if (text.includes("[Centre Overview]")) {
                                const parts = text.split("[Centre Overview]")
                                return (
                                  <>
                                    {parts[0]}
                                    <Link href="/partnership" className="text-[#00A3A0]">
                                      Centre Overview
                                    </Link>
                                    {parts[1]}
                                  </>
                                )
                              }
                              return text
                            }
                            return <p key={i}>{renderLine(line)}</p>
                          })}
                        </div>
                      )}
                      {item.a && item.a.length > 0 && item.id === "multipleBranches" && (
                        <div className="space-y-2">
                          {item.a.map((line, i) => {
                            const renderLine = (text: string) => {
                              // Highlight first line "Yes—an Owner can manage unlimited branches." in teal
                              if (text.includes("Yes—an Owner can manage unlimited branches.")) {
                                return <span className="text-[#00A3A0]">{text}</span>
                              }
                              // Highlight "a different venue per program schedule" in teal
                              if (text.includes("a different venue per program schedule")) {
                                const parts = text.split("a different venue per program schedule")
                                return (
                                  <>
                                    {parts[0]}
                                    <span className="text-[#00A3A0]">a different venue per program schedule</span>
                                    {parts[1]}
                                  </>
                                )
                              }
                              return text
                            }
                            return <p key={i}>{renderLine(line)}</p>
                          })}
                        </div>
                      )}
                      {item.a && item.a.length > 0 && item.id === "profileInfo" && (
                        <div className="space-y-2">
                          {item.a.map((line, i) => {
                            const renderLine = (text: string) => {
                              // Highlight "Basics:" and "Verification:" in teal and bold
                              if (text.startsWith("Basics:")) {
                                const colonIndex = text.indexOf(":")
                                const label = text.substring(0, colonIndex + 1)
                                const content = text.substring(colonIndex + 1)
                                return (
                                  <>
                                    <span className="text-[#00A3A0] font-semibold">{label}</span>
                                    {content}
                                  </>
                                )
                              }
                              if (text.startsWith("Verification:")) {
                                const colonIndex = text.indexOf(":")
                                const label = text.substring(0, colonIndex + 1)
                                const content = text.substring(colonIndex + 1)
                                return (
                                  <>
                                    <span className="text-[#00A3A0] font-semibold">{label}</span>
                                    {content}
                                  </>
                                )
                              }
                              // Convert "[How to Join Us]" to link
                              if (text.includes("[How to Join Us]")) {
                                const parts = text.split("[How to Join Us]")
                                return (
                                  <>
                                    {parts[0]}
                                    <Link href="/partnership" className="text-[#00A3A0]">
                                      How to Join Us
                                    </Link>
                                    {parts[1]}
                                  </>
                                )
                              }
                              return text
                            }
                            return <p key={i}>{renderLine(line)}</p>
                          })}
                        </div>
                      )}
                      {item.id === "badWeatherCentres" && (
                        <div className="space-y-4 pt-2">
                          {/* Intro paragraph */}
                          {item.a && item.a.length > 0 && (
                            <p>
                              {(() => {
                                const text = item.a[0]
                                if (text.includes("Continue / Cancel / Reschedule")) {
                                  const parts = text.split("Continue / Cancel / Reschedule")
                                  return (
                                    <>
                                      {parts[0]}
                                      <span className="text-[#00A3A0]">Continue / Cancel / Reschedule</span>
                                      {parts[1]}
                                    </>
                                  )
                                }
                                return text
                              })()}
                            </p>
                          )}
                          {/* Weather table */}
                          {'weatherRows' in item && item.weatherRows && item.weatherRows.length > 0 && (
                            <div className="space-y-0 border border-[#E9E9E9] rounded-lg overflow-hidden">
                              {/* Table headers */}
                              <div className="grid grid-cols-2 bg-[#F9FAFB] border-b border-[#E9E9E9]">
                                <div className="px-4 py-2">
                                  <span className="text-[#00A3A0] font-semibold">{t("faqsPage.weatherSignal")}</span>
                                </div>
                                <div className="px-4 py-2 border-l border-[#E9E9E9]">
                                  <span className="text-[#00A3A0] font-semibold">{t("faqsPage.arrangement")}</span>
                                </div>
                              </div>
                              {/* Table rows */}
                              {item.weatherRows.map((row: any, idx: number) => (
                                <div key={idx} className={`grid grid-cols-2 ${idx < item.weatherRows.length - 1 ? "border-b border-[#E9E9E9]" : ""}`}>
                                  <div className="px-4 py-2">
                                    <span>{row.signal}</span>
                                  </div>
                                  <div className="px-4 py-2 border-l border-[#E9E9E9]">
                                    <span>{row.arrangement}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          {/* In ClassZ section */}
                          {'classzBullets' in item && item.classzBullets && item.classzBullets.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-[#111929] font-semibold">In ClassZ:</h4>
                              <ul className="space-y-2 list-none">
                                {item.classzBullets.map((bullet: string, bulletIdx: number) => {
                                  const renderBulletText = (text: string) => {
                                    // Add additional highlights based on bullet content
                                    const additionalHighlights: string[] = []
                                    if (text.includes("Continue / Cancel / Reschedule")) {
                                      additionalHighlights.push("Continue / Cancel / Reschedule")
                                    }
                                    if (text.includes("Cancelled classes:")) {
                                      additionalHighlights.push("Cancelled classes:")
                                    }
                                    if (text.includes("Rescheduled classes:")) {
                                      additionalHighlights.push("Rescheduled classes:")
                                    }

                                    // Get highlights for this bullet
                                    const bulletHighlights = ('highlights' in item && item.highlights)
                                      ? item.highlights
                                        .filter((h: any) => h.inBullet === bulletIdx)
                                        .map((h: any) => h.text)
                                      : []

                                    // Combine all highlights
                                    const allHighlights = [...additionalHighlights, ...bulletHighlights]

                                    if (allHighlights.length > 0) {
                                      let result: (string | React.ReactElement)[] = []
                                      let remaining = text

                                      // Sort highlights by position (longest first to avoid partial matches)
                                      const sortedHighlights = allHighlights.sort((a: string, b: string) => b.length - a.length)
                                      const highlightPositions = sortedHighlights.map((h: string) => ({
                                        text: h,
                                        pos: remaining.indexOf(h),
                                      })).filter((hp: any) => hp.pos >= 0).sort((a: any, b: any) => a.pos - b.pos)

                                      // Remove overlapping highlights
                                      const nonOverlapping: any[] = []
                                      highlightPositions.forEach((hp: any) => {
                                        const overlaps = nonOverlapping.some((existing: any) => {
                                          const existingEnd = existing.pos + existing.text.length
                                          const hpEnd = hp.pos + hp.text.length
                                          return (hp.pos >= existing.pos && hp.pos < existingEnd) ||
                                            (existing.pos >= hp.pos && existing.pos < hpEnd)
                                        })
                                        if (!overlaps) {
                                          nonOverlapping.push(hp)
                                        }
                                      })

                                      let lastPos = 0
                                      nonOverlapping.forEach((hp: any) => {
                                        if (hp.pos > lastPos) {
                                          result.push(remaining.substring(lastPos, hp.pos))
                                        }
                                        result.push(
                                          <span key={`highlight-${bulletIdx}-${hp.pos}`} className="text-[#00A3A0]">
                                            {hp.text}
                                          </span>
                                        )
                                        lastPos = hp.pos + hp.text.length
                                      })
                                      if (lastPos < remaining.length) {
                                        result.push(remaining.substring(lastPos))
                                      }
                                      return result.length > 0 ? <>{result}</> : text
                                    }
                                    return text
                                  }

                                  return (
                                    <li key={bulletIdx} className="flex items-start gap-2">
                                      <span className="text-[#00A3A0] mt-1.5 w-1.5 h-1.5 bg-[#00A3A0] rounded-full flex-shrink-0"></span>
                                      <span>{renderBulletText(bullet)}</span>
                                    </li>
                                  )
                                })}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                      {item.id === "goodFit" && (
                        <div className="space-y-2 pt-2">
                          {/* Bullets */}
                          {item.bullets && item.bullets.length > 0 && (
                            <ul className="space-y-2 list-none">
                              {item.bullets.map((bullet: string, bulletIdx: number) => {
                                const renderBulletText = (text: string) => {
                                  // Highlight "Best fit:" and "Benefits:" in teal and bold
                                  if (text.startsWith("Best fit:")) {
                                    const colonIndex = text.indexOf(":")
                                    const label = text.substring(0, colonIndex + 1)
                                    const content = text.substring(colonIndex + 1)
                                    return (
                                      <>
                                        <span className="text-[#00A3A0] font-semibold">{label}</span>
                                        {content}
                                      </>
                                    )
                                  }
                                  if (text.startsWith("Benefits:")) {
                                    const colonIndex = text.indexOf(":")
                                    const label = text.substring(0, colonIndex + 1)
                                    const content = text.substring(colonIndex + 1)
                                    return (
                                      <>
                                        <span className="text-[#00A3A0] font-semibold">{label}</span>
                                        {content}
                                      </>
                                    )
                                  }
                                  return text
                                }
                                return (
                                  <li key={bulletIdx} className="flex items-start gap-2">
                                    <span className="text-[#00A3A0] mt-1.5 w-1.5 h-1.5 bg-[#00A3A0] rounded-full flex-shrink-0"></span>
                                    <span>{renderBulletText(bullet)}</span>
                                  </li>
                                )
                              })}
                            </ul>
                          )}
                          {/* Answer paragraph with links */}
                          {item.a && item.a.length > 0 && (
                            <div className="space-y-2 pt-2">
                              {item.a.map((line, i) => {
                                const renderLine = (text: string) => {
                                  // Convert "[ClassZ Partnership]" and "[How to Join Us]" to links
                                  let result: (string | React.ReactElement)[] = []
                                  let remaining = text

                                  // Handle "[ClassZ Partnership]"
                                  if (remaining.includes("[ClassZ Partnership]")) {
                                    const idx = remaining.indexOf("[ClassZ Partnership]")
                                    if (idx > 0) result.push(remaining.substring(0, idx))
                                    result.push(
                                      <Link key="partnership" href="/partnership" className="text-[#00A3A0]">
                                        ClassZ Partnership
                                      </Link>
                                    )
                                    remaining = remaining.substring(idx + 22)
                                  }

                                  // Handle "[How to Join Us]"
                                  if (remaining.includes("[How to Join Us]")) {
                                    const idx = remaining.indexOf("[How to Join Us]")
                                    if (idx > 0) result.push(remaining.substring(0, idx))
                                    result.push(
                                      <Link key="join" href="/partnership" className="text-[#00A3A0]">
                                        How to Join Us
                                      </Link>
                                    )
                                    remaining = remaining.substring(idx + 16)
                                  }

                                  if (remaining) result.push(remaining)
                                  return result.length > 0 ? <>{result}</> : text
                                }
                                return <p key={i}>{renderLine(line)}</p>
                              })}
                            </div>
                          )}
                        </div>
                      )}
                      {item.id === "payouts" && (
                        <div className="space-y-2 pt-2">
                          {/* Checklist title */}
                          {'checklistTitle' in item && item.checklistTitle && (
                            <p className="text-[#00A3A0] font-semibold">{item.checklistTitle}</p>
                          )}
                          {/* Checklist bullets */}
                          {'checklistBullets' in item && item.checklistBullets && item.checklistBullets.length > 0 && (
                            <ul className="space-y-2 list-none">
                              {item.checklistBullets.map((bullet: any, bulletIdx: number) => (
                                <li key={bulletIdx} className="flex items-start gap-2">
                                  <span className="text-[#00A3A0] mt-1.5 w-1.5 h-1.5 bg-[#00A3A0] rounded-full flex-shrink-0"></span>
                                  <span>
                                    <span className="text-[#00A3A0]">{bullet.highlight}</span>
                                    {bullet.rest}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                          {/* Note */}
                          {'note' in item && item.note && (
                            <p className="pt-2">{item.note}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </section>

      {/* Need more help */}
      <section className="py-16 bg-gradient-to-br from-[#F0FAF8] via-white to-[#E5F7F4]">
        <div className="max-w-[960px] mx-auto px-6 md:px-10 text-center space-y-6">
          <h3 className="text-3xl md:text-4xl font-semibold text-[#0B1B1C]">{t("faqsPage.needMoreHelp.title")}</h3>
          <p className="text-base md:text-lg text-[#4A5563]">{t("faqsPage.needMoreHelp.subtitle")}</p>
          <p className="text-sm md:text-base text-[#4A5563]">
            {t("faqsPage.needMoreHelp.description")}
          </p>
          <div className="flex justify-center pt-2">
            <Link
              href="/contact-us"
              className="px-7 md:px-8 py-3.5 rounded-full bg-[#0ABAB5] text-white text-sm md:text-base font-semibold shadow-[0_16px_28px_rgba(10,186,181,0.28)] hover:bg-[#00a6a1] transition-colors"
            >
              {t("faqsPage.needMoreHelp.button")}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

