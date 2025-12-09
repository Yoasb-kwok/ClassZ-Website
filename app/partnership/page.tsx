"use client"

import { useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CheckCircle2 } from "lucide-react"

const tabs = [
  { id: "overview", label: "Centre Overview" },
  { id: "obligation", label: "Centre Obligation" },
  { id: "join", label: "How to Join Us" },
]

const overviewCards = [
  {
    title: "List Programs & Schedules",
    text: "Parents can discover and enroll in students directly to your programs.",
    image: "/app-interface-class-details.jpg",
  },
  {
    title: "Manage Bookings & Attendance",
    text: "Handle your admin work through a centralized platform.",
    image: "/calendar-app-ui.jpg",
  },
  {
    title: "Free CRM Access",
    text: "Manage scheduling, attendance, and class operations in one place.",
    image: "/photo-feed-app-ui.jpg",
  },
  {
    title: "Share Progress Feedback",
    text: "Provide student performance feedback through built-in tools.",
    image: "/kid-reading.jpg",
  },
  {
    title: "Connect with Parents",
    text: "Reply to inquiries, arrange schedules, build rapport.",
    image: "/kid-coding.jpg",
  },
  {
    title: "Gain Exposure",
    text: "Reach families via ClassZ community and boost visibility.",
    image: "/kid-painting.jpg",
  },
]

const obligationItems = [
  {
    badge: "Essential requirement",
    title: "Mandatory After-Class Reporting",
    bullets: [
      "A class photo of the student during the session",
      "Performance feedback via ClassZ in-app feedback system",
    ],
    image: "/kid-music.jpg",
  },
  {
    badge: "Quality Standards",
    title: "Commitment to Quality & Inclusion",
    bullets: [
      "Provide accurate information on courses, coaches, and qualifications",
      "Ensure a safe, professional, and preferably SEN-inclusive environment",
      "Maintain timely communication with parents and ClassZ support",
    ],
    image: "/kid-science.jpg",
  },
  {
    badge: "System Guidelines",
    title: "Use ClassZ Systems Responsibly",
    bullets: [
      "Payments and enrolments must be completed through ClassZ",
      "Follow ClassZ Terms of Service and Data Privacy Policy",
    ],
    image: "/kid-dancing.jpg",
  },
]

const priorities = [
  { title: "Priority Consideration", text: "Priority onboarding for children-oriented programs under 14." },
  { title: "Priority Listing", text: "Child-oriented programs for ages under 14 listed prominently on our platform." },
  { title: "Quality Screening", text: "All centres are carefully screened to ensure they meet our quality standards." },
]

const option1Steps = [
  "Download the ClassZ mobile app",
  "Register an Owner Account",
  "Complete the account setup",
  "Tap “Create a Centre Profile” and complete centre information",
]

const option2Fields = [
  "Full name (Centre owner)",
  "Full name of the centre",
  "Email",
  "Contact phone number (WhatsApp available)",
]

export default function PartnershipPage() {
  const [active, setActive] = useState<string>("overview")

  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 selection:bg-teal-100">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[420px] w-full overflow-hidden border-b border-[#E9E9E9]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/family-looking-at-tablet.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-[1280px] mx-auto w-full px-6 md:px-10">
            <h1 className="text-white text-4xl md:text-5xl font-semibold mb-3 drop-shadow-lg">ClassZ Partnership</h1>
            <p className="text-white/90 text-lg md:text-xl max-w-2xl drop-shadow-md">
              Join a community of trusted educators transforming children’s learning journeys.
            </p>
          </div>
        </div>
      </section>

      {/* Intro & Tabs */}
      <section className="py-12 border-b border-[#E9E9E9]">
        <div className="max-w-[1080px] mx-auto px-6 md:px-10 space-y-6">
          <div>
            <h2 className="text-2xl md:text-[26px] font-semibold text-[#111929]">For Learning Centres & Educators</h2>
            <p className="text-[#485A69] text-sm md:text-base mt-3 leading-relaxed">
              Welcome to ClassZ — a unified platform where trusted centres, parents, and learners grow together through
              meaningful education. Here’s a simplified overview of how your centre can join and succeed on ClassZ.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`px-5 py-2 rounded-full border ${
                  active === tab.id ? "bg-[#0ABAB5] text-white border-[#0ABAB5]" : "bg-white text-[#00A3A0] border-[#0ABAB5]"
                } transition-colors`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {active === "overview" && <CentreOverview />}
      {active === "obligation" && <CentreObligation />}
      {active === "join" && <HowToJoin />}

      <Footer />
    </main>
  )
}

function CentreOverview() {
  return (
    <>
      {/* Overview Hero */}
      <section className="relative h-[240px] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/kid-coding.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-[1280px] mx-auto w-full px-6 md:px-10">
            <h3 className="text-white text-3xl md:text-4xl font-semibold drop-shadow-lg">Centre Overview</h3>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-[1080px] mx-auto px-6 md:px-10">
          <h3 className="text-2xl md:text-[26px] font-semibold text-[#111929] mb-3">Centre Overview</h3>
          <p className="text-sm md:text-base text-[#485A69] leading-relaxed">
            Grow opportunities with digital exposure, gain trusted relationships from parents.
          </p>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-[1180px] mx-auto px-4 md:px-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {overviewCards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-[#E9E9E9] bg-white shadow-[0_18px_48px_rgba(0,0,0,0.05)] overflow-hidden"
            >
              <div className="h-[220px] w-full overflow-hidden">
                <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-6 space-y-2">
                <h4 className="text-lg font-semibold text-[#111929]">{card.title}</h4>
                <p className="text-sm text-[#485A69] leading-relaxed">{card.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ReadyCTA />
    </>
  )
}

function CentreObligation() {
  return (
    <>
      {/* Obligation Hero */}
      <section className="relative h-[240px] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/centre-obligation.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-[1280px] mx-auto w-full px-6 md:px-10">
            <h3 className="text-white text-3xl md:text-4xl font-semibold drop-shadow-lg">Centre Obligation</h3>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-[1080px] mx-auto px-6 md:px-10">
          <h3 className="text-2xl md:text-[26px] font-semibold text-[#111929] mb-3">Centre Obligation</h3>
          <p className="text-sm md:text-base text-[#485A69] leading-relaxed">
            Partnership standards to ensure trust and meaningful progress for every child.
          </p>
        </div>
      </section>

      <section className="pb-16 space-y-12">
        <div className="max-w-[1180px] mx-auto px-4 md:px-6 grid lg:grid-cols-2 gap-10 items-center">
          {obligationItems.map((item) => (
            <div key={item.title} className="grid md:grid-cols-2 gap-6 items-start">
              <div className="order-2 md:order-1 space-y-3">
                <span className="inline-block text-xs font-semibold text-[#00A3A0] bg-[#E7F9F8] px-3 py-1 rounded-full">
                  {item.badge}
                </span>
                <h4 className="text-xl font-semibold text-[#111929]">{item.title}</h4>
                <ul className="space-y-2 text-sm text-[#485A69] leading-relaxed list-none">
                  {item.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#0ABAB5] mt-[2px]" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="order-1 md:order-2 rounded-2xl overflow-hidden shadow-[0_18px_48px_rgba(0,0,0,0.06)]">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <ReadyCTA />
    </>
  )
}

function HowToJoin() {
  return (
    <>
      {/* How to Join Hero */}
      <section className="relative h-[240px] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/kid-reading.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-[1280px] mx-auto w-full px-6 md:px-10">
            <h3 className="text-white text-3xl md:text-4xl font-semibold drop-shadow-lg">How to Join Us</h3>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-[1080px] mx-auto px-6 md:px-10 space-y-6">
          <h3 className="text-2xl md:text-[26px] font-semibold text-[#111929]">ClassZ Centre Onboarding Guide</h3>
          <p className="text-sm md:text-base text-[#485A69] leading-relaxed">Choose one option to start onboarding.</p>

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
              <h4 className="text-lg font-semibold text-[#111929]">Option 1</h4>
              <p className="text-sm text-[#485A69]">Create a centre via ClassZ App</p>
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
            <h4 className="text-lg font-semibold text-[#111929]">Option 2</h4>
            <p className="text-sm text-[#485A69]">Submit a Centre Request below:</p>
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
                placeholder="Webpage link - e.g. Instagram/Facebook/Website (Optional)"
                className="h-11 px-4 rounded-lg border border-[#EFF1F3] bg-[#F9FBFD] text-sm text-[#292929] placeholder:text-[#B0B7C3] focus:outline-none focus:ring-2 focus:ring-[#0ABAB5]"
              />
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#111929]">Centre status</label>
                <div className="flex items-center gap-3 text-sm text-[#485A69]">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="status" className="text-[#0ABAB5] focus:ring-[#0ABAB5]" /> Registered Company (with BR/CR)
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="status" className="text-[#0ABAB5] focus:ring-[#0ABAB5]" /> Individual Educator (with BR/CR)
                  </label>
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-[#111929]">Interest in ClassZ</p>
                <div className="grid grid-cols-1 gap-2 text-sm text-[#485A69]">
                  {[
                    "Free Learning Management System (LMS)",
                    "Extra recruitment streamline",
                    "Workshop and event opportunity",
                    "Systematic administrative system (roles of Owner/Manager/Coach)",
                    "In-build Performance Feedback System",
                    "Promotion or exposure",
                    "Customer engagement",
                  ].map((item) => (
                    <label key={item} className="flex items-center gap-2">
                      <input type="checkbox" className="text-[#0ABAB5] focus:ring-[#0ABAB5]" /> {item}
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-[#111929]">How did you hear about us?</p>
                <div className="grid grid-cols-1 gap-2 text-sm text-[#485A69]">
                  {[
                    "Social media (e.g. Threads, Instagram)",
                    "Newspaper or magazine",
                    "Search engine (e.g. Google, Bing)",
                    "Event",
                    "Online ads",
                    "Word of mouth (e.g. friend or customer)",
                    "Blogs or articles",
                  ].map((item) => (
                    <label key={item} className="flex items-center gap-2">
                      <input type="checkbox" className="text-[#0ABAB5] focus:ring-[#0ABAB5]" /> {item}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-center pt-2">
              <button className="min-w-[160px] h-11 rounded-full bg-[#0ABAB5] text-white text-sm font-medium hover:bg-[#00b3a3] transition-colors">
                Submit
              </button>
            </div>
            <p className="text-xs text-[#485A69] text-center">
              Our team will review your submission and contact you for verification within 3-5 business days.
            </p>
          </div>
        </div>
      </section>

      <ReadyCTA />
    </>
  )
}

function ReadyCTA() {
  return (
    <section className="py-14 bg-gradient-to-b from-white via-[#F4FBFA] to-[#E7F9F8]">
      <div className="max-w-[1080px] mx-auto px-6 md:px-10 text-center space-y-4">
        <h3 className="text-2xl font-semibold text-[#111929]">Ready to Join ClassZ?</h3>
        <p className="text-sm md:text-base text-[#485A69] max-w-2xl mx-auto">
          Discover how your centre can get listed, reach more families, and start managing classes with ease.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href="#"
            className="px-5 py-2 rounded-full border border-[#0ABAB5] text-[#00A3A0] hover:bg-[#0ABAB5] hover:text-white transition-colors"
          >
            Centre Overview
          </Link>
          <Link
            href="#"
            className="px-5 py-2 rounded-full bg-[#0ABAB5] text-white hover:bg-[#00b3a3] transition-colors"
          >
            How To Join Us
          </Link>
        </div>
      </div>
    </section>
  )
}

