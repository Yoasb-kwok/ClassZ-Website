import { Navbar } from "@/components/navbar"
import { OurMission } from "@/components/our-mission"
import { HowItWorks } from "@/components/how-it-works"
import { JoinUsCta } from "@/components/join-us-cta"
import { Footer } from "@/components/footer"

export default function OurMissionPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 selection:bg-teal-100">
      <Navbar />
      <OurMission />
      <HowItWorks />
      <JoinUsCta />
      <Footer />
    </main>
  )
}

