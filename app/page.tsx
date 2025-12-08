import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Partners } from "@/components/partners"
import { AppShowcase } from "@/components/app-showcase"
import { ValueProps } from "@/components/value-props"
import { ThreePillars } from "@/components/three-pillars"
import { EmotionalHero } from "@/components/emotional-hero"
import { HowItWorks } from "@/components/how-it-works"
import { WhyChoose } from "@/components/why-choose"
import { FinalCta } from "@/components/final-cta"
import { Footer } from "@/components/footer"

export default function Page() {
  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 selection:bg-teal-100">
      <Navbar />
      <Hero />
      <Partners />
      <AppShowcase />
      <ValueProps />
      <ThreePillars />
      <EmotionalHero />
      <HowItWorks />
      <WhyChoose />
      <FinalCta />
      <Footer />
    </main>
  )
}
