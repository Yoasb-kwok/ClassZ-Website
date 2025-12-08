import { Navbar } from "@/components/navbar"
import { FeatureDeepDive } from "@/components/feature-deep-dive"
import { Footer } from "@/components/footer"

export default function OurFeaturesPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 selection:bg-teal-100">
      <Navbar />
      <div className="pt-20">
        <FeatureDeepDive />
      </div>
      <Footer />
    </main>
  )
}

