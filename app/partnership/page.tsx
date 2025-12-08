import { Navbar } from "@/components/navbar"
import { Partners } from "@/components/partners"
import { Footer } from "@/components/footer"

export default function PartnershipPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 selection:bg-teal-100">
      <Navbar />
      <div className="pt-20">
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Partnership Opportunities
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Join us in building the future of learning. Partner with ClassZ to reach more families and grow your education centre.
              </p>
            </div>
          </div>
        </section>
        <Partners />
        <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl font-bold text-slate-900">Why Partner With Us?</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Free Learning Management System</h3>
                  <p className="text-slate-600">
                    Get access to our comprehensive LMS platform at no cost. Manage your classes, students, and communications all in one place.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Digital Exposure</h3>
                  <p className="text-slate-600">
                    Reach thousands of families actively looking for quality education programs. Get discovered by the right parents at the right time.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Growth Tools</h3>
                  <p className="text-slate-600">
                    Access analytics, insights, and tools designed to help your centre grow with purpose and measure real impact.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  )
}

