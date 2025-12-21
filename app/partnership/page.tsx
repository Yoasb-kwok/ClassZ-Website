"use client"

import { useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CheckCircle2 } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

const tabs = [
  { id: "overview", labelKey: "partnershipPage.tabs.overview" },
  { id: "obligation", labelKey: "partnershipPage.tabs.obligation" },
  { id: "join", labelKey: "partnershipPage.tabs.join" },
]

export default function PartnershipPage() {
  const { t } = useLanguage()
  const [active, setActive] = useState<string>("overview")

  const overviewImages = ["/card1.png", "/card2.png", "/card3.png", "/card4.png", "/card5.png", "/card6.png"]
  const overviewCards = overviewImages.map((image, idx) => ({
    image,
    title: t(`partnershipPage.overview.card${idx + 1}.title`),
    text: t(`partnershipPage.overview.card${idx + 1}.text`),
  }))

  const obligationImages = ["/kid-music.jpg", "/kid-science.jpg", "/kid-dancing.jpg"]
  const obligationItems = obligationImages.map((image, idx) => ({
    image,
    badge: t(`partnershipPage.obligation.item${idx + 1}.badge`),
    title: t(`partnershipPage.obligation.item${idx + 1}.title`),
    description: t(`partnershipPage.obligation.item${idx + 1}.description`),
    bullets: [
      t(`partnershipPage.obligation.item${idx + 1}.b1`),
      t(`partnershipPage.obligation.item${idx + 1}.b2`),
      t(`partnershipPage.obligation.item${idx + 1}.b3`),
    ].filter(Boolean),
  }))

  const priorities = [
    { title: t("partnershipPage.priorities.p1.title"), text: t("partnershipPage.priorities.p1.text") },
    { title: t("partnershipPage.priorities.p2.title"), text: t("partnershipPage.priorities.p2.text") },
    { title: t("partnershipPage.priorities.p3.title"), text: t("partnershipPage.priorities.p3.text") },
  ]

  const option1Steps = [
    t("partnershipPage.join.option1.s1"),
    t("partnershipPage.join.option1.s2"),
    t("partnershipPage.join.option1.s3"),
    t("partnershipPage.join.option1.s4"),
  ]

  const option2Fields = [
    t("partnershipPage.join.option2.f1"),
    t("partnershipPage.join.option2.f2"),
    t("partnershipPage.join.option2.f3"),
    t("partnershipPage.join.option2.f4"),
  ]

  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 selection:bg-teal-100">
      <Navbar />

      {/* Hero */}
      <section className="relative w-full overflow-hidden border-b border-[#E9E9E9]">
        <div className="relative w-full h-[400px] sm:h-[450px] md:h-auto" style={{ paddingBottom: '0' }}>
          <div className="absolute inset-0 md:relative md:pb-[33.33%]">
            <div
              className="absolute inset-0 md:absolute bg-cover"
              style={{ backgroundImage: "url('/headerPartnership.png')" }}
            />
          </div>
        </div>
        <div className="absolute inset-0 bg-black/35 md:bg-black/30 pointer-events-none h-[400px] sm:h-[450px] md:h-full" />
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none h-[400px] sm:h-[450px] md:h-full">
          <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 md:px-10 text-center pointer-events-auto">
            <h1 className="text-white text-2xl sm:text-3xl md:text-5xl font-semibold mb-2 md:mb-3 drop-shadow-lg">{t("partnershipPage.hero.title")}</h1>
            <p className="text-white/90 text-sm sm:text-base md:text-xl max-w-2xl mx-auto drop-shadow-md px-2">
              {t("partnershipPage.hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Intro & Tabs */}
      <section className="py-12 border-b border-[#E9E9E9]">
        <div className="max-w-[1080px] mx-auto px-6 md:px-10 space-y-6">
          <div>
            <h2 className="text-2xl md:text-[26px] font-semibold text-[#111929]">{t("partnershipPage.intro.title")}</h2>
            <p className="text-[#485A69] text-sm md:text-base mt-3 leading-relaxed">
              {t("partnershipPage.intro.description")}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`px-5 py-2 rounded-full border ${active === tab.id ? "bg-[#0ABAB5] text-white border-[#0ABAB5]" : "bg-white text-[#00A3A0] border-[#0ABAB5]"
                  } transition-colors`}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {active === "overview" && <CentreOverview t={t} cards={overviewCards} />}
      {active === "obligation" && <CentreObligation t={t} items={obligationItems} />}
      {active === "join" && (
        <HowToJoin
          t={t}
          priorities={priorities}
          option1Steps={option1Steps}
          option2Fields={option2Fields}
        />
      )}

      <Footer />
    </main>
  )
}

function CentreOverview({ t, cards }: { t: (k: string) => string; cards: { title: string; text: string; image: string }[] }) {
  return (
    <>
      {/* Overview Hero */}
      <section className="relative h-[240px] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/kid-coding.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="max-w-[1280px] mx-auto w-full px-6 md:px-10 text-center">
            <h3 className="text-white text-3xl md:text-4xl font-semibold drop-shadow-lg">{t("partnershipPage.overview.title")}</h3>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-[1080px] mx-auto px-6 md:px-10">
          <h3 className="text-2xl md:text-[26px] font-semibold text-[#111929] mb-3">{t("partnershipPage.overview.subTitle")}</h3>
          <p className="text-sm md:text-base text-[#485A69] leading-relaxed">
            {t("partnershipPage.overview.subDesc")}
          </p>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-[1180px] mx-auto px-4 md:px-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl overflow-hidden"
            >
              <img src={card.image} alt={card.title} className="w-full h-auto object-contain" />
            </div>
          ))}
        </div>
      </section>

      <ReadyCTA t={t} />
    </>
  )
}

function CentreObligation({
  t,
  items,
}: {
  t: (k: string) => string
  items: { badge: string; title: string; description: string; bullets: string[]; image: string }[]
}) {
  const renderBulletText = (text: string, itemIdx: number) => {
    if (itemIdx === 0) {
      // First item: highlight "A class photo" and "Performance feedback"
      if (text.includes("A class photo")) {
        const parts = text.split("A class photo");
        return (
          <>
            <span className="text-[#0ABAB5] font-medium">A class photo</span>
            <span className="text-[#111929]">{parts[1]}</span>
          </>
        );
      }
      if (text.includes("Performance feedback")) {
        const parts = text.split("Performance feedback");
        return (
          <>
            <span className="text-[#0ABAB5] font-medium">Performance feedback</span>
            <span className="text-[#111929]">{parts[1]}</span>
          </>
        );
      }
    }
    return <span className="text-[#111929]">{text}</span>;
  };

  return (
    <>
      {/* Obligation Hero */}
      <section className="relative h-[240px] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/kid-music.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="max-w-[1280px] mx-auto w-full px-6 md:px-10 text-center">
            <h3 className="text-white text-3xl md:text-4xl font-semibold drop-shadow-lg">{t("partnershipPage.obligation.title")}</h3>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-[1080px] mx-auto px-6 md:px-10">
          <h3 className="text-2xl md:text-[26px] font-semibold text-[#111929] mb-3">{t("partnershipPage.obligation.subTitle")}</h3>
          <p className="text-sm md:text-base text-[#485A69] leading-relaxed">
            {t("partnershipPage.obligation.subDesc")}
          </p>
        </div>
      </section>

      <section className="pb-16 space-y-12">
        <div className="max-w-[1180px] mx-auto px-4 md:px-6 space-y-16">
          {items.map((item, idx) => (
            <div key={item.title} className="grid md:grid-cols-2 gap-8 items-center">
              {idx % 2 === 0 ? (
                <>
                  <div className="rounded-2xl overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-4">
                    <span className="inline-block text-xs font-semibold text-[#00A3A0] bg-[#E7F9F8] px-3 py-1 rounded-full">
                      {item.badge}
                    </span>
                    <h4 className="text-2xl md:text-3xl font-semibold text-[#111929]">{item.title}</h4>
                    {item.description && (
                      <p className="text-sm md:text-base text-[#485A69] leading-relaxed">{item.description}</p>
                    )}
                    <ol className="space-y-4 text-sm md:text-base leading-relaxed list-none">
                      {item.bullets.map((b, bulletIdx) => (
                        <li key={bulletIdx} className="flex items-start gap-4">
                          <span className="text-2xl font-bold text-[#111929] flex-shrink-0">{String(bulletIdx + 1).padStart(2, '0')}</span>
                          <span className="pt-1">{renderBulletText(b, idx)}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <span className="inline-block text-xs font-semibold text-[#00A3A0] bg-[#E7F9F8] px-3 py-1 rounded-full">
                      {item.badge}
                    </span>
                    <h4 className="text-2xl md:text-3xl font-semibold text-[#111929]">{item.title}</h4>
                    {item.description && (
                      <p className="text-sm md:text-base text-[#485A69] leading-relaxed">{item.description}</p>
                    )}
                    <ol className="space-y-4 text-sm md:text-base leading-relaxed list-none">
                      {item.bullets.map((b, bulletIdx) => (
                        <li key={bulletIdx} className="flex items-start gap-4">
                          <span className="text-2xl font-bold text-[#111929] flex-shrink-0">{String(bulletIdx + 1).padStart(2, '0')}</span>
                          <span className="pt-1">{renderBulletText(b, idx)}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="rounded-2xl overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                </>
              )}
            </div>
          ))}

        </div>
      </section>

      <ReadyCTA t={t} />
    </>
  )
}

function HowToJoin({
  t,
  priorities,
  option1Steps,
  option2Fields,
}: {
  t: (k: string) => string
  priorities: { title: string; text: string }[]
  option1Steps: string[]
  option2Fields: string[]
}) {
  return (
    <>
      {/* How to Join Hero */}
      <section className="relative h-[240px] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/kid-reading.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="max-w-[1280px] mx-auto w-full px-6 md:px-10 text-center">
            <h3 className="text-white text-3xl md:text-4xl font-semibold drop-shadow-lg">{t("partnershipPage.join.title")}</h3>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-[1080px] mx-auto px-6 md:px-10 space-y-6">
          <h3 className="text-2xl md:text-[26px] font-semibold text-[#111929]">{t("partnershipPage.join.subTitle")}</h3>
          <p className="text-sm md:text-base text-[#485A69] leading-relaxed">{t("partnershipPage.join.subDesc")}</p>

          <div className="grid md:grid-cols-3 gap-4">
            {priorities.map((p) => (
              <div key={p.title} className="rounded-2xl border border-[#E9E9E9] bg-white shadow-sm p-5 space-y-2">
                <h4 className="text-base font-semibold text-[#111929]">{p.title}</h4>
                <p className="text-sm text-[#485A69] leading-relaxed">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-[1180px] mx-auto px-4 md:px-6 space-y-10">
          <div className="rounded-2xl border border-[#E9E9E9] bg-white shadow-[0_18px_48px_rgba(0,0,0,0.05)] p-6 md:p-8 grid lg:grid-cols-[1.1fr,1fr] gap-8">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-[#111929]">{t("partnershipPage.join.option1.title")}</h4>
              <p className="text-sm text-[#485A69]">{t("partnershipPage.join.option1.desc")}</p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-[#485A69] leading-relaxed">
                {option1Steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
            <div className="rounded-xl overflow-hidden border border-[#E9E9E9] bg-[#F9FBFD] p-4">
              <img src="/app-interface-class-details.jpg" alt="App onboarding" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="rounded-2xl border border-[#E9E9E9] bg-white shadow-[0_18px_48px_rgba(0,0,0,0.05)] p-6 md:p-8 space-y-6">
              <h4 className="text-lg font-semibold text-[#111929]">{t("partnershipPage.join.option2.title")}</h4>
              <p className="text-sm text-[#485A69]">{t("partnershipPage.join.option2.desc")}</p>
            <div className="grid md:grid-cols-2 gap-4">
              {option2Fields.map((f) => (
                <input
                  key={f}
                  type="text"
                  placeholder={f}
                  className="h-11 px-4 rounded-lg border border-[#EFF1F3] bg-[#F9FBFD] text-sm text-[#292929] placeholder:text-[#B0B7C3] focus:outline-none focus:ring-2 focus:ring-[#0ABAB5]"
                />
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder={t("partnershipPage.join.option2.linkPlaceholder")}
                className="h-11 px-4 rounded-lg border border-[#EFF1F3] bg-[#F9FBFD] text-sm text-[#292929] placeholder:text-[#B0B7C3] focus:outline-none focus:ring-2 focus:ring-[#0ABAB5]"
              />
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#111929]">{t("partnershipPage.join.option2.statusLabel")}</label>
                <div className="flex items-center gap-3 text-sm text-[#485A69]">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="status" className="text-[#0ABAB5] focus:ring-[#0ABAB5]" /> {t("partnershipPage.join.option2.status1")}
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="status" className="text-[#0ABAB5] focus:ring-[#0ABAB5]" /> {t("partnershipPage.join.option2.status2")}
                  </label>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-[#111929]">{t("partnershipPage.join.option2.interestTitle")}</p>
                <div className="grid grid-cols-1 gap-2 text-sm text-[#485A69]">
                  {["i1", "i2", "i3", "i4", "i5", "i6", "i7"].map((key) => (
                    <label key={key} className="flex items-center gap-2">
                      <input type="checkbox" className="text-[#0ABAB5] focus:ring-[#0ABAB5]" /> {t(`partnershipPage.join.option2.interest.${key}`)}
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-[#111929]">{t("partnershipPage.join.option2.hearTitle")}</p>
                <div className="grid grid-cols-1 gap-2 text-sm text-[#485A69]">
                  {["h1", "h2", "h3", "h4", "h5", "h6", "h7"].map((key) => (
                    <label key={key} className="flex items-center gap-2">
                      <input type="checkbox" className="text-[#0ABAB5] focus:ring-[#0ABAB5]" /> {t(`partnershipPage.join.option2.hear.${key}`)}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-center pt-2">
              <button className="min-w-[160px] h-11 rounded-full bg-[#0ABAB5] text-white text-sm font-medium hover:bg-[#00b3a3] transition-colors">
                {t("partnershipPage.join.option2.submit")}
              </button>
            </div>
            <p className="text-xs text-[#485A69] text-center">
              {t("partnershipPage.join.option2.note")}
            </p>
          </div>
        </div>
      </section>

      <ReadyCTA t={t} />
    </>
  )
}

function ReadyCTA({ t }: { t: (k: string) => string }) {
  return (
    <section className="py-14 bg-gradient-to-b from-white via-[#F4FBFA] to-[#E7F9F8]">
      <div className="max-w-[1080px] mx-auto px-6 md:px-10 text-center space-y-4">
        <h3 className="text-2xl font-semibold text-[#111929]">{t("partnershipPage.cta.title")}</h3>
        <p className="text-sm md:text-base text-[#485A69] max-w-2xl mx-auto">
          {t("partnershipPage.cta.desc")}
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href="#"
            className="px-5 py-2 rounded-full border border-[#0ABAB5] text-[#00A3A0] hover:bg-[#0ABAB5] hover:text-white transition-colors"
          >
            {t("partnershipPage.cta.linkOverview")}
          </Link>
          <Link
            href="#"
            className="px-5 py-2 rounded-full bg-[#0ABAB5] text-white hover:bg-[#00b3a3] transition-colors"
          >
            {t("partnershipPage.cta.linkJoin")}
          </Link>
        </div>
      </div>
    </section>
  )
}

