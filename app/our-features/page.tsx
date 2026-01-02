"use client"

import { Navbar } from "@/components/navbar"
import { OurMission } from "@/components/our-mission"
import { HowItWorks } from "@/components/how-it-works"
import { JoinUsCta } from "@/components/join-us-cta"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/components/language-provider"

export default function OurFeaturesPage() {
  const { t } = useLanguage()
  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 selection:bg-teal-100">
      <Navbar />
      {/* Hero */}
      <section className="relative w-full h-[600px] md:h-[720px] overflow-hidden bg-black">
        {/* Background Image - full width, accepts slight vertical crop */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/headerFeatures.png')" }}
        />

        {/* Dark Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-black/55 md:bg-black/45" />

        {/* Content overlay */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 md:px-10 text-center">
            <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold drop-shadow-lg">
              {t("featuresPage.hero.title1")}
              <br />
              {t("featuresPage.hero.title2")}
            </h1>
          </div>
        </div>
      </section>
      <OurMission hideHeader={true} />
      <HowItWorks />
      <JoinUsCta secondaryLink="/our-mission" primaryLink="https://apps.apple.com/app/classz" />
      <Footer />
    </main>
  )
}

