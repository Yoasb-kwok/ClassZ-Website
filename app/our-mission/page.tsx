import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ArrowRight, Check } from "lucide-react"

export default function OurMissionPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 selection:bg-teal-100">
      <Navbar />

      {/* Hero Header */}
      <section className="relative w-full h-[600px] md:h-[720px] overflow-hidden bg-black">
        {/* Background Image - full width, accepts slight vertical crop */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/headerOurMission.png')" }}
        />

        {/* Dark Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-black/55 md:bg-black/45" />

        {/* Content overlay */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 md:px-10 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-4 md:mb-6 drop-shadow-lg">
              Unlock Your Child's
              <br />
              Full Potential.
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/95 mb-8 md:mb-10 max-w-3xl mx-auto drop-shadow-md">
              Browse, book, and track your child's learning — all in one trusted platform.
            </p>
            <Link
              href="/our-features"
              className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-[#0ABAB5] hover:bg-[#00b3a3] text-white font-semibold text-base md:text-lg rounded-full transition-colors shadow-lg"
            >
              Explore More
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Logo Cloud Section */}
      <section className="bg-white py-10 md:py-14">
        <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 md:px-10">
          <div className="relative w-full overflow-hidden">
            <div className="logo-marquee flex items-center gap-6 md:gap-10 lg:gap-12 pr-6">
              <span className="text-base md:text-lg font-semibold text-gray-300 whitespace-nowrap">Funded by:</span>
              <img src="/logo1.png" alt="Funded by Cyberport" className="h-14 md:h-16 lg:h-20 w-auto" />

              <span className="text-base md:text-lg font-semibold text-gray-300 whitespace-nowrap">Trusted by:</span>
              <img src="/logo2.png" alt="Trusted partner 1" className="h-12 md:h-14 lg:h-16 w-auto" />
              <img src="/logo3.png" alt="Trusted partner 2" className="h-12 md:h-14 lg:h-16 w-auto" />
              <img src="/logo4.png" alt="Trusted partner 3" className="h-12 md:h-14 lg:h-16 w-auto" />
              <img src="/logo5.png" alt="Trusted partner 4" className="h-12 md:h-14 lg:h-16 w-auto" />
              <img src="/logo6.png" alt="Trusted partner 5" className="h-12 md:h-14 lg:h-16 w-auto" />

              {/* duplicate sequence for seamless marquee */}
              <span className="text-base md:text-lg font-semibold text-gray-300 whitespace-nowrap" aria-hidden="true">Funded by:</span>
              <img src="/logo1.png" alt="Funded by Cyberport duplicate" className="h-14 md:h-16 lg:h-20 w-auto" aria-hidden="true" />

              <span className="text-base md:text-lg font-semibold text-gray-300 whitespace-nowrap" aria-hidden="true">Trusted by:</span>
              <img src="/logo2.png" alt="Trusted partner 1 duplicate" className="h-12 md:h-14 lg:h-16 w-auto" aria-hidden="true" />
              <img src="/logo3.png" alt="Trusted partner 2 duplicate" className="h-12 md:h-14 lg:h-16 w-auto" aria-hidden="true" />
              <img src="/logo4.png" alt="Trusted partner 3 duplicate" className="h-12 md:h-14 lg:h-16 w-auto" aria-hidden="true" />
              <img src="/logo5.png" alt="Trusted partner 4 duplicate" className="h-12 md:h-14 lg:h-16 w-auto" aria-hidden="true" />
              <img src="/logo6.png" alt="Trusted partner 5 duplicate" className="h-12 md:h-14 lg:h-16 w-auto" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      {/* Collage & Store CTA */}
      <section className="bg-white py-12 md:py-16">
        <div className="w-full px-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-10">
            {/* Left Image */}
            <div className="w-full md:w-1/2 lg:w-[48%] self-start md:mr-auto">
              <img
                src="/m1.png"
                alt="Discovery preview"
                className="w-full h-[620px] md:h-[680px] lg:h-[720px] rounded-3xl object-cover"
              />
            </div>

            {/* Center Content */}
            <div className="text-center space-y-6 flex-shrink-0 px-4 w-full md:w-auto md:max-w-sm lg:max-w-md">
              <div className="space-y-3">
                <p className="text-2xl md:text-3xl font-semibold text-[#485A69]">From</p>
                <h2 className="text-3xl md:text-4xl font-bold text-[#111929]">Overwhelmed to Assured</h2>
              </div>
              <div className="flex items-center justify-center gap-3 md:gap-4">
                <a
                  href="#"
                  className="inline-flex items-center bg-white text-black rounded-lg px-3 py-2 transition"
                  aria-label="Download on the App Store"
                >
                  <img
                    src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                    alt="Download on the App Store"
                    className="h-10 w-auto"
                  />
                </a>
                <a
                  href="#"
                  className="inline-flex items-center bg-white text-black rounded-lg px-3 py-2 transition"
                  aria-label="Get it on Google Play"
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                    alt="Get it on Google Play"
                    className="h-10 w-auto"
                  />
                </a>
              </div>
            </div>

            {/* Right Image */}
            <div className="w-full md:w-1/2 lg:w-[48%] self-end md:ml-auto">
              <img
                src="/m2.png"
                alt="Booking preview"
                className="w-full h-[620px] md:h-[680px] lg:h-[720px] rounded-3xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* App Preview / Discovery Section */}
      <section className="bg-white py-14 md:py-20">
        <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 md:px-10 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="flex justify-center">
            <img
              src="/m3.png"
              alt="App preview"
              className="w-full max-w-[520px] rounded-[30px] object-contain"
            />
          </div>
          <div className="space-y-6">
            <span className="inline-block bg-[#0ABAB5] text-white text-sm font-semibold px-4 py-2 rounded-full shadow-sm">
              Personalized Discovery
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#111929] leading-tight">
              Discover Your Child&apos;s Strengths with Confidence
            </h2>
            <p className="text-base md:text-lg text-[#485A69] leading-relaxed">
              Find classes tailored to your child&apos;s needs, track real progress, and connect with trusted educators —
              all in one place.
            </p>
            <ul className="space-y-3 text-[#111929]">
              <li className="flex items-start gap-3 text-base md:text-lg">
                <Check className="w-5 h-5 text-[#0ABAB5] mt-1" />
                <span>Browse curated classes by age, interest & location</span>
              </li>
              <li className="flex items-start gap-3 text-base md:text-lg">
                <Check className="w-5 h-5 text-[#0ABAB5] mt-1" />
                <span>Read verified reviews from other parents</span>
              </li>
              <li className="flex items-start gap-3 text-base md:text-lg">
                <Check className="w-5 h-5 text-[#0ABAB5] mt-1" />
                <span>Connect with trusted educators directly</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Seamless Booking Section */}
      <section className="bg-white py-14 md:py-20">
        <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 md:px-10 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="space-y-6">
            <span className="inline-block bg-[#0ABAB5] text-white text-sm font-semibold px-4 py-2 rounded-full shadow-sm">
              Seamless Booking
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#111929] leading-tight">
              What If Learning<br />Felt Effortless?
            </h2>
            <p className="text-base md:text-lg text-[#485A69] leading-relaxed">
              Book classes in seconds, receive meaningful updates, and see your child thrive — without the overwhelm.
            </p>
            <ul className="space-y-3 text-[#111929]">
              <li className="flex items-start gap-3 text-base md:text-lg">
                <Check className="w-5 h-5 text-[#0ABAB5] mt-1" />
                <span>Instant booking with real-time availability</span>
              </li>
              <li className="flex items-start gap-3 text-base md:text-lg">
                <Check className="w-5 h-5 text-[#0ABAB5] mt-1" />
                <span>Secure payment processing</span>
              </li>
              <li className="flex items-start gap-3 text-base md:text-lg">
                <Check className="w-5 h-5 text-[#0ABAB5] mt-1" />
                <span>Automatic confirmations & reminders</span>
              </li>
            </ul>
          </div>
          <div className="flex justify-center">
            <img
              src="/m4.png"
              alt="Booking preview"
              className="w-full max-w-[520px] rounded-[30px] object-contain"
            />
          </div>
        </div>
      </section>

      {/* Progress Tracking Section */}
      <section className="bg-white py-14 md:py-20">
        <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 md:px-10 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="flex justify-center">
            <img
              src="/m5.png"
              alt="Progress tracking preview"
              className="w-full max-w-[540px] rounded-[30px] object-contain"
            />
          </div>
          <div className="space-y-6">
            <span className="inline-block bg-[#0ABAB5] text-white text-sm font-semibold px-4 py-2 rounded-full shadow-sm">
              Record Progress
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#111929] leading-tight">
              Make Every Day Count
            </h2>
            <p className="text-base md:text-lg text-[#485A69] leading-relaxed">
              Stay connected with your child&apos;s learning journey through daily updates, photos, and meaningful milestones.
            </p>
            <ul className="space-y-3 text-[#111929]">
              <li className="flex items-start gap-3 text-base md:text-lg">
                <Check className="w-5 h-5 text-[#0ABAB5] mt-1" />
                <span>Daily updates and photos from class</span>
              </li>
              <li className="flex items-start gap-3 text-base md:text-lg">
                <Check className="w-5 h-5 text-[#0ABAB5] mt-1" />
                <span>Track milestones and achievements</span>
              </li>
              <li className="flex items-start gap-3 text-base md:text-lg">
                <Check className="w-5 h-5 text-[#0ABAB5] mt-1" />
                <span>Direct messaging with educators</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3-Step Process Section */}
      <section className="bg-[#F7FCFB] py-14 md:py-20">
        <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 md:px-10 space-y-10 md:space-y-12">
          <div className="text-center space-y-4">
            <span className="inline-block bg-white text-[#0ABAB5] text-sm font-semibold px-4 py-2 rounded-full shadow-sm border border-[#E6F5F4]">
              Simple 3-Step Process
            </span>
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold text-[#111929]">A New Standard in Learning</h2>
              <p className="text-base md:text-lg text-[#485A69]">
                See how ClassZ transforms the way families and educators connect.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-[#F7FCFB] rounded-[28px] overflow-hidden">
              <img src="/m6.png" alt="Browse classes preview" className="w-full h-full object-cover" />
            </div>

            <div className="bg-[#F7FCFB] rounded-[28px] overflow-hidden">
              <img src="/m7.png" alt="Book class preview" className="w-full h-full object-cover" />
            </div>

            <div className="bg-[#F7FCFB] rounded-[28px] overflow-hidden">
              <img src="/m8.png" alt="Track progress preview" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Why Families Choose Section */}
      <section className="bg-white py-14 md:py-20">
        <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 md:px-10 space-y-10 md:space-y-14">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-[#2F2F2F]">Every class is a step in their story.</h2>
            <p className="text-base md:text-lg text-[#4B4B4B]">Why families choose ClassZ?</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-10 text-center text-[#2F2F2F]">
            <div className="space-y-3">
              <h3 className="text-4xl md:text-5xl font-medium">01</h3>
              <div className="h-[1px] bg-[#E0E0E0] w-full" />
              <div className="space-y-2">
                <p className="text-2xl font-semibold">Targeted Learning</p>
                <p className="text-sm md:text-base text-[#4B4B4B]">
                  Identify what works best for your child and invest in the classes that nurture their strengths.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-4xl md:text-5xl font-medium">02</h3>
              <div className="h-[1px] bg-[#E0E0E0] w-full" />
              <div className="space-y-2">
                <p className="text-2xl font-semibold">Inclusive Community</p>
                <p className="text-sm md:text-base text-[#4B4B4B]">
                  Discover SEN-friendly, nurturing environments for every child.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-4xl md:text-5xl font-medium">03</h3>
              <div className="h-[1px] bg-[#E0E0E0] w-full" />
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <p className="text-2xl font-semibold">Holistic Support</p>
                  <span className="inline-block bg-[#0ABAB5] text-white text-xs font-semibold px-3 py-1 rounded-full">Beta</span>
                </div>
                <p className="text-sm md:text-base text-[#4B4B4B]">
                  Workshops, assessments, and activities that grow with your family.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full-width promo image */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 md:px-10">
          <img
            src="/m9.png"
            alt="ClassZ experience"
            className="w-full h-auto rounded-[24px] object-cover"
          />
        </div>
      </section>

      {/* Transform CTA Section */}
      <section className="bg-gradient-to-br from-white via-[#F4FBFA] to-[#E6F7F5] py-16 md:py-20">
        <div className="max-w-[1180px] mx-auto w-full px-4 sm:px-6 md:px-10 text-center space-y-8">
          <div className="inline-block bg-white border border-[#CFF1EE] text-[#0ABAB5] text-sm font-semibold px-5 py-2 rounded-full shadow-sm">
            Transform Learning Together
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E1E1E]">Ready to Transform Your Child&apos;s Learning?</h2>
            <p className="text-base md:text-lg text-[#3F4A53]">
              Join the elite families discovering better ways to learn and grow together.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-[#0ABAB5] text-white text-base md:text-lg font-semibold shadow-[0_10px_28px_rgba(0,186,181,0.3)] hover:bg-[#00b3a3] transition"
            >
              Get Started Today
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-[#3F4A53] text-base md:text-lg font-semibold hover:bg-white/60 transition"
            >
              Learn More
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
          <div className="pt-4 text-sm text-[#3F4A53] flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#0ABAB5]" />
              Quality-Verified Centres
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#0ABAB5]" />
              More Centres Added Monthly
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#0ABAB5]" />
              Trusted by Parents
            </span>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

