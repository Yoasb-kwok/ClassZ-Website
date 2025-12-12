import { Navbar } from "@/components/navbar"
import { OurMission } from "@/components/our-mission"
import { HowItWorks } from "@/components/how-it-works"
import { JoinUsCta } from "@/components/join-us-cta"
import { Footer } from "@/components/footer"

export default function OurFeaturesPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 selection:bg-teal-100">
      <Navbar />
      {/* Hero */}
      <section className="relative w-full overflow-hidden border-b border-[#E9E9E9]">
        <div className="relative w-full h-[400px] sm:h-[450px] md:h-auto" style={{ paddingBottom: '0' }}>
          <div className="absolute inset-0 md:relative md:pb-[33.33%]">
            <div
              className="absolute inset-0 md:absolute bg-cover"
              style={{ backgroundImage: "url('/headerFeatures.png')" }}
            />
          </div>
        </div>
        <div className="absolute inset-0 bg-black/30 md:bg-black/25 pointer-events-none h-[400px] sm:h-[450px] md:h-full" />
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none h-[400px] sm:h-[450px] md:h-full">
          <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 md:px-10 text-center pointer-events-auto">
            <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-medium drop-shadow-lg">Shaping Futures, <br />
              One Child at a Time.</h1>
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

