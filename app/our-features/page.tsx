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
      <section className="relative w-full overflow-hidden border-b border-[#E9E9E9]">
        <div className="relative w-full bg-black flex justify-center">
          <img
            src="/headerFeatures.png"
            alt="Our Features"
            className="w-full h-auto max-h-[720px] object-contain"
          />
          <div className="absolute inset-0 bg-black/30 md:bg-black/25 pointer-events-none" />
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 md:px-10 text-center pointer-events-auto">
              <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-medium drop-shadow-lg">
                {t("featuresPage.hero.title1")}
                <br />
                {t("featuresPage.hero.title2")}
              </h1>
            </div>
          </div>
        </div>
      </section>
      <OurMission hideHeader={true} />
      <HowItWorks />
      <JoinUsCta />
      <Footer />
    </main>
  )
}

