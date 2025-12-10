 "use client"

import { useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ChevronDown } from "lucide-react"

const tabs = [
  { id: "parents", label: "Parents FAQs" },
  { id: "centres", label: "Centres FAQs" },
]

const parentsFaqs = [
  {
    q: "How do I register and enrol my child in a class?",
    a: [
      "Download ClassZ app and create an account.",
      "Browse classes by age, category, or location, then pick your preferred schedule.",
      "Complete booking and payment in-app—no extra forms needed.",
    ],
    steps: [
      { title: "Create a parent account", desc: "Sign up on ClassZ.", image: "/app-interface-class-details.jpg" },
      { title: "Add child profile", desc: "Go to main menu and add child(ren).", image: "/photo-feed-app-ui.jpg" },
      { title: "Choose class & schedule", desc: "Browse centres, pick program and time.", image: "/calendar-app-ui.jpg" },
      { title: "Confirm & pay", desc: "Proceed to payment to complete enrolment.", image: "/family-looking-at-tablet.jpg" },
    ],
  },
  {
    q: "How can I view my child’s performance or progress?",
    a: [
      "Tap the “Insight” icon on the menu bar to open insights.",
      "Switch between your children’s profiles to view their individual insights.",
      "Insights are divided into three parts: Overall Analysis, Class Performance, and Character Analysis (after 10+ classes).",
    ],
    steps: [
      { title: "Open Insights", desc: "Tap the Insights icon on the menu bar.", image: "/photo-feed-app-ui.jpg" },
      { title: "Switch profiles", desc: "Toggle between children to view their insights.", image: "/kid-reading.jpg" },
    ],
    extraTitle: "Insights are divided into three parts:",
    extraBullets: [
      "Overall Analysis: see how your child performs across enrolled programs.",
      "Class Performance: view feedback from each centre for completed lessons.",
      "Character Analysis: after 10+ classes, get a personalized character profile.",
    ],
  },
  {
    q: "How do I track my child’s learning journey?",
    a: [
      "View progress updates and performance feedback in the app.",
      "See attendance history and class notes from the centre.",
    ],
    steps: [
      { title: "Check updates", desc: "See class feedback and notes.", image: "/kid-reading.jpg" },
      { title: "Attendance", desc: "Review attendance and reminders.", image: "/photo-feed-app-ui.jpg" },
    ],
  },
  {
    q: "Are lesson photos and feedback mandatory after every class?",
    a: ["Yes. Centres submit after-class reports with a class photo and performance feedback so you stay informed."],
    steps: [{ title: "After-class report", desc: "Photo + performance summary", image: "/kid-painting.jpg" }],
  },
  {
    q: "How do refunds or class changes work?",
    a: [
      "ClassZ protects your payments for centre-initiated cancellations with full credit refunds.",
      "For other changes, check the centre’s policy shown at checkout.",
    ],
    steps: [{ title: "Refund protected", desc: "Full credit on centre cancellations", image: "/family-looking-at-tablet.jpg" }],
  },
  {
    q: "Do I need a subscription to use ClassZ?",
    a: [
      "A subscription is optional but offers extra benefits:",
      "Enroll without platform fees",
      "Better pricing on selected classes and events",
      "Access to exclusive programs or events",
      "Priority customer support",
    ],
    bullets: [],
    note: "You can still book classes and pay with credit cards without subscribing.",
    intro: "",
  },
]

const centresFaqs = [
  {
    q: "How is pricing done?",
    a: [
      "ClassZ charges centres per booking; parents see class prices set by centres.",
      "Details are shown in your onboarding pack.",
    ],
  },
  {
    q: "Is after-class reporting mandatory?",
    a: ["Yes. Each session needs a class photo plus performance feedback via ClassZ to maintain quality standards."],
  },
  {
    q: "Can I edit or update classes after posting?",
    a: [
      "Yes, update schedules, capacity, and details from your centre dashboard.",
      "Changes are reflected to parents immediately.",
    ],
  },
  {
    q: "What’s the difference between Owner, Manager, and Coach accounts?",
    a: [
      "Owner: creates the centre profile and manages branches.",
      "Manager: manages schedules, bookings, and admin.",
      "Coach: delivers lessons and submits feedback.",
    ],
  },
  {
    q: "How do I get listed on ClassZ?",
    a: ["Option 1: Create a centre profile in the ClassZ app.", "Option 2: Submit the centre request form and our team will assist."],
  },
]

export default function FAQsPage() {
  const [activeTab, setActiveTab] = useState<"parents" | "centres">("parents")
  const [openParent, setOpenParent] = useState<number | null>(null)
  const [openCentre, setOpenCentre] = useState<number | null>(null)

  const list = activeTab === "parents" ? parentsFaqs : centresFaqs
  const openIdx = activeTab === "parents" ? openParent : openCentre
  const setOpen = activeTab === "parents" ? setOpenParent : setOpenCentre

  const collapseAll = () => {
    // Only collapse centres; parents stay open as per request
    setOpenCentre(null)
  }

  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 selection:bg-teal-100">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[320px] w-full overflow-hidden border-b border-[#E9E9E9]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/family-looking-at-tablet.jpg')" }}
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-[1180px] mx-auto w-full px-6 md:px-10">
            <h1 className="text-white text-4xl md:text-5xl font-semibold mb-2 drop-shadow-lg">Frequently Asked Questions</h1>
            <p className="text-white/90 text-lg md:text-xl drop-shadow">Browse guides and answers for parents and centres.</p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-10 border-b border-[#E9E9E9] bg-[#F9FBFD]">
        <div className="max-w-[1080px] mx-auto px-6 md:px-10 space-y-4 text-center">
          <p className="text-sm text-[#485A69]">
            Browse popular questions from parents and centres. Tap a question to see the details.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "parents" | "centres")}
                className={`px-5 py-2 rounded-full border text-sm font-medium ${
                  activeTab === tab.id
                    ? "bg-[#0ABAB5] text-white border-[#0ABAB5]"
                    : "bg-white text-[#00A3A0] border-[#0ABAB5]"
                } transition-colors shadow-sm`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ list */}
      <section className="py-14 bg-white">
        <div className="max-w-[1080px] mx-auto px-6 md:px-10 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-[#00A3A0]">
              {activeTab === "parents" ? "Parents FAQs" : "Centres FAQs"}
            </h2>
            <button
              onClick={collapseAll}
              className="text-xs font-medium text-[#00A3A0] hover:text-[#008f8a] underline decoration-dotted"
            >
              Collapse all
            </button>
          </div>

          {activeTab === "parents" ? (
            <div className="space-y-8 text-[#111929]">
              {parentsFaqs.map((item, idx) => {
                const open = true // always expanded for parents
                return (
                  <div key={item.q} className="space-y-4 border-b border-[#E5E7EB] pb-6 last:border-b-0">
                    <button
                      onClick={() => {}}
                      className="w-full flex items-start justify-between gap-4 text-left cursor-default"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-[#5AE0D6] text-sm font-semibold">Q{(idx + 1).toString().padStart(2, "0")}</span>
                        <span className="text-base md:text-lg font-semibold leading-snug">{item.q}</span>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
                      />
                    </button>
                    {open && (
                      <div className="space-y-5 text-sm leading-relaxed text-[#4B5563]">
                        {item.steps && item.steps.length > 0 && (
                          <>
                            <div className="text-[#00A3A0] text-sm font-semibold">To enrol in a class:</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                              {item.steps.map((step, i) => (
                                <div
                                  key={i}
                                  className="rounded-xl overflow-hidden border border-[#E5E7EB] bg-white shadow-[0_12px_28px_rgba(0,0,0,0.08)] flex flex-col"
                                >
                                  <div className="relative">
                                    {step.image && (
                                      <img src={step.image} alt={step.title} className="w-full h-44 object-cover" />
                                    )}
                                    <span className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white text-[#0B1B1C] font-bold flex items-center justify-center text-sm border border-[#E5E7EB]">
                                      {(i + 1).toString().padStart(2, "0")}
                                    </span>
                                  </div>
                                  <div className="p-3 space-y-1">
                                    <p className="text-[#111929] font-semibold text-sm leading-snug">{step.title}</p>
                                    <p className="text-[#4B5563] text-xs leading-relaxed">{step.desc}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}

                        {item.a && item.a.length > 0 && (
                          <div className="space-y-2 text-[#4B5563] text-sm">
                            {item.a.map((line, i) => (
                              <p key={i} className={i === 0 ? "font-semibold text-[#111929]" : ""}>
                                {line}
                              </p>
                            ))}
                          </div>
                        )}

                        {item.bullets && item.bullets.length > 0 && (
                          <ul className="space-y-2 list-disc list-inside text-[#4B5563] text-sm pl-1">
                            {item.bullets.map((b, i) => (
                              <li key={i}>{b}</li>
                            ))}
                          </ul>
                        )}

                        {item.extraTitle && (
                          <div className="space-y-2 pt-2">
                            <p className="text-xs font-semibold text-[#00A3A0]">{item.extraTitle}</p>
                            <ul className="space-y-1 list-disc list-inside text-[#4B5563] text-xs md:text-sm">
                              {item.extraBullets?.map((b, i) => (
                                <li key={i}>{b}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {item.note && (
                          <p className="text-xs text-[#00A3A0] font-semibold pt-1 leading-relaxed">{item.note}</p>
                        )}

                        {!item.note && (
                          <p className="text-xs text-[#00A3A0] font-semibold pt-1 leading-relaxed">
                            Each enrolment is linked to a specific child profile, so make sure you select the right one before checkout.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            list.map((item, idx) => {
              const open = openCentre === idx
              return (
                <div
                  key={item.q}
                  className={`rounded-[18px] border ${
                    open ? "border-[#0ABAB5]" : "border-[#E5E7EB]"
                  } bg-white shadow-[0_14px_36px_rgba(0,0,0,0.05)]`}
                >
                  <button
                    onClick={() => setOpenCentre(open ? null : idx)}
                    className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-[#00A3A0] text-sm font-semibold">Q{(idx + 1).toString().padStart(2, "0")}</span>
                      <span className="text-base md:text-lg font-semibold text-[#111929] leading-snug">{item.q}</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>
                  {open && (
                    <div className="px-5 pb-5 space-y-2 text-sm text-[#485A69] leading-relaxed border-t border-[#E9E9E9]">
                      <ol className="space-y-2 list-decimal list-inside">
                        {item.a.map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </section>

      {/* Need more help */}
      <section className="py-14 bg-gradient-to-b from-white via-[#F4FBFA] to-[#E7F9F8]">
        <div className="max-w-[1080px] mx-auto px-6 md:px-10 text-center space-y-4">
          <h3 className="text-2xl font-semibold text-[#111929]">Need More Help?</h3>
          <p className="text-sm md:text-base text-[#485A69] max-w-2xl mx-auto">
            Share your question with us and we’ll respond with personalized guidance.
          </p>
          <div className="flex justify-center">
            <Link
              href="/contact-us"
              className="px-6 py-3 rounded-full bg-[#0ABAB5] text-white text-sm font-medium hover:bg-[#00b3a3] transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

