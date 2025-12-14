"use client"

import { JSX, useState } from "react"
import React from "react"
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
    a: [],
    steps: [
      { image: "/Q1_1.png" },
      {

        image: "/Q1_2.png",
      },
      {

        image: "/Q1_3.png",
      },
      { title: "", desc: "", image: "/Q1_4.png" },
    ],
  },
  {
    q: "How can I view my child’s performance or progress?",
    a: [
      "These insights help you understand not just what your child learns, but how they learn best.",
    ],
    steps: [
      { image: "/Q2_1.png" },
      { title: "", desc: "", image: "/Q2_2.png" },
    ],
    extraTitle: "Insights are divided into three parts:",
    extraBullets: [
      "Overall Analysis: see how your child performs across enrolled programs.",
      "Class Performance: view feedback from each centre for completed lessons.",
      "Character Analysis: After attending 10 or more classes, your child will receive a personalized character profile reflecting their learning style and strengths.",
    ],
  },
  {
    q: "Do I need a subscription to use ClassZ?",
    a: [
      "A subscription is optional but offers extra benefits:",
    ],
    bullets: [
      "Enroll without platform fees",
      "Better pricing on selected classes and events",
      "Access to exclusive programs or events",
      "Priority customer support",
    ],
    note: "You can still book classes and pay with credit cards without subscribing.",
    intro: "",
  },
  {
    q: "What is Zing and how does it work?",
    a: [
      "Zing is the credit used in ClassZ to pay for programs and events.",
    ],


    bullets: ["It never expires",
      "Works for both subscribers and non-subscribers",
      "Can be used even after unsubscribing",],
    note: "It’s a flexible way to pay and save within the ClassZ ecosystem.",
    intro: "",
  },
  {
    q: "What happens if a class is cancelled or I need a refund? What if I couldn’t attend a rearranged class?",
    a: [
      "We offer “Protected Booking” for parents. You are eligible for Zing refunds if:",
      "However, to maintain fairness and quality:",
    ],
    bullets: [
      "The centre cancels the class",
      "Service provided is different from what was described",
      "Centre fails to provide performance feedback within 10 days (discount compensation applies)",
      "Fraud or misconduct occurs",
      "Rearranged classes that you were unable to attend",
    ],
    bulletsSecondary: [
      "No refund, replacement class, or feedback will be provided if your child is absent without valid reason",
      "All refunds are issued in Zing at the best-value exchange rate",
      "To request a refund, please [create a support ticket] anytime before the class starts and up to 48 hours after the rearranged class ends.",
      "Requests made beyond this period will be considered unattended and not eligible for refund.",
    ],
    intro: "",
  },
  {
    q: "What happens during bad weather (typhoons, heavy rain)?",
    a: [],
    weatherRows: [
      { signal: "Amber Rain / Typhoon Signal No.1", arrangement: "Class continues as normal" },
      { signal: "Red Rain / Typhoon Signal No.3", arrangement: "Centre may choose to continue, cancel, or reschedule" },
      {
        signal: "Black Rain / Signal No.8 or above / Extreme Weather Warning",
        arrangement: "Classes must be cancelled or rescheduled",
      },
    ],
    weatherNotes: [
      "Cancelled classes are refunded via Zing.",
      "If the rearranged time doesn’t work for you, please [create a support ticket] anytime before the class starts and up to 48 hours after the rearranged class ends to arrange a refund.",
      "Requests made after this period will be considered unattended and not eligible for refund.",
    ],
    intro: "",
  },
  {
    q: "Do centres support SEN (Special Educational Needs) students?",
    a: [
      "Centres with an SEN tag on their profile welcome students with special educational needs.",
      "You can also check individual program details for SEN-friendly options.",
      "During enrolment, you may provide your child’s background or SEN requirements for the centre’s reference.",
    ],
    senImage: "/q7.png",
    bullets: ["SEN support is not guaranteed and varies depending on each centre’s capability."],
    intro: "",
  },
  {
    q: "Can I enroll multiple children under one account?",
    a: [
      "Yes.",
    ],
    gallery: ["/Q81.png", "/Q82.png"],
    bullets: [
      "Zing credits are shared across all children.",
      "All enrolments are final and non-refundable once payment is made.",
    ],
    intro: "",
  },
  {
    q: "Where can I see my child’s class photos?",
    a: [
    ],
    gallery: ["/Q91.png", "/Q92.png"],
    bullets: [
      "Photo uploads depend on each centre.",
      "Centres are encouraged to upload photos or work outcomes when appropriate and when allowed by venue rules (e.g. no photography in swimming pools).",
    ],
    intro: "",
  },
  {
    q: "How can I contact a centre or get help?",
    a: [
      "If you experience any issues or wish to report a centre, please contact ClassZ support by [create a support ticket] or email.",
      "Our team will respond as soon as possible.",
    ],
    gallery: ["/Q10.png"],
    bullets: [],
    intro: "",
    note: " ", // prevent default enrolment note
  },

]

const centresFaqs = [
  {
    q: "Pricing: does ClassZ charge centres?",
    a: ["Contact us via [How to Join Us] to confirm eligibility in your region."],
    bullets: [
      "Free to list and use our CRM for eligible centres.",
      "0% commission on bookings for eligible partners.",
      "ClassZ covers standard third-party payment processor fees—centres don't pay these.",
    ],
  },
  {
    q: "How do parents pay for classes? Are offline payments allowed?",
    a: [
      "All bookings and payments happen within ClassZ using integrated third-party payment methods (e.g., credit/debit cards).",
      "Offline payments are not allowed and are not protected by ClassZ. Bypassing the platform may lead to account actions up to permanent removal.",
    ],
    bullets: [
      "This gives parents more ways to pay without centres paying any additional or third-party processing charges—ClassZ covers the standard processor fees for eligible centres.",
    ],
  },
  {
    q: "Are lesson photos and performance feedback mandatory after every class? What if we don't submit?",
    a: [
      "Yes—mandatory for every attended lesson.",
      "Submit one class photo and provide feedback via our built-in Student Performance Feedback system.",
      "Repeated or serious misses may lead to fees, suspension, or permanent removal.",
    ],
    bullets: [
      "It's simplified and typically takes under a minute to complete while ensuring clear, consistent insights for parents with our system.",
    ],
  },
  {
    q: "Can I edit or update class schedules after posting?",
    a: [
      "Yes—by request only. Edits require approval and follow strict fairness rules.",
    ],
    sections: [
      {
        title: "How it works:",
        bullets: [
          "Open the corresponding class schedule in the app and submit an class schedule edit request (rearrangement).",
          "We'll review your request. Approval is rare and usually limited to emergencies or safety concerns.",
          "If approved, the system automatically moves all enrolled students to the updated timeslot and notifies families.",
        ],
        highlights: [
          { text: "Approval is rare", inBullet: 1 },
        ],
      },
      {
        title: "Fairness rules & impact:",
        bullets: [
          {
            text: "If a class is rearranged (approved edit), any student who can't attend the new time may no-show without penalty.",
            subBullet: "→ They receive a full refund for that session, and the centre will not receive payment for that student's session.",
            highlights: ["rearranged (approved edit)", "full refund for that session"],
          },
          {
            text: "If an edit isn't approved, you must run the class as originally scheduled.",
            subBullet: "→ If the class is not provided as scheduled, the session is treated as centre responsibility; all students receive a full refund for that session, and the incident is recorded and may lead to consequences.",
            highlights: ["isn't approved", "full refund for that session"],
          },
        ],
      },
      {
        title: "Does not have enrollment yet? Create a new slot with the correct details. If the original slot has no enrollments, you may cancel it and re-release.",
        bullets: [
          "Accuracy first: Please publish only final, confirmed details.",
          "No direct renegotiation: Messaging parents to change slot details is not allowed and may result in penalties if reported.",
        ],
        highlights: ["Accuracy first", "No direct renegotiation"],
        tealBullets: true,
      },
    ],
    note: "For severe weather situations, follow the Bad-Weather Arrangement policy—the system handles those cases separately.",
  },
  {
    q: "How do I register my centre and get listed on ClassZ?",
    a: ["Start on [How to Join Us] and submit the short form."],
    bullets: [
      "We verify your details and program quality.",
      "Once approved, create branches, publish programs, and accept enrollments on ClassZ.",
    ],
  },
  {
    q: "What's the difference between Owner, Manager, and Coach accounts?",
    a: [
      "Owner: full control—branches, programs, payouts, roles, compliance.",
      "Manager: promoted from Coach by the Owner, can publish programs, manage schedules, and message.",
      "Coach: runs classes—takes attendance, uploads lesson photos, submits feedback.",
      "In each branch, you can have unlimited Coaches and Managers; but only one Owner.",
      "See: [Centre Overview]",
    ],
  },
  {
    q: "Can one Owner manage multiple branches or locations?",
    a: [
      "Yes—an Owner can manage unlimited branches.",
      "Each branch is reviewed before it appears to parents.",
      "You can set a different venue per program schedule (e.g., pool, museum, sports ground) than your branch address—this keeps coaching locations flexible and accurate for parents.",
    ],
  },
  {
    q: "What information is required to set up my centre profile?",
    a: [
      "Basics: name, description, categories, SEN readiness, contact info, logo/photos.",
      "Verification: Owner HKID (e.g., HKID for >25% ownership or equivalent), business/company details, and where permitted, background checks for child-facing roles.",
      "Not sure what applies? Submit [How to Join Us]—we'll review and advise for free.",
    ],
  },
  {
    q: "What is the bad-weather arrangement for centres?",
    a: [
      "During official bad-weather signals, your dashboard unlocks the action buttons so you can choose Continue / Cancel / Reschedule for affected sessions.",
    ],
    weatherRows: [
      {
        signal: "Amber Rain / Typhoon Signal No.1",
        arrangement: "Proceed as normal",
      },
      {
        signal: "Red Rain / Typhoon Signal No.3",
        arrangement: "You may choose to continue, cancel, or reschedule",
      },
      {
        signal: "Black Rain / Signal No.8 or above / Extreme Weather Warning",
        arrangement: "Cancel or reschedule (classes must not proceed)",
      },
    ],
    classzBullets: [
      "Select Continue / Cancel / Reschedule in your dashboard; parents are notified automatically.",
      "Cancelled classes: parents receive a full refund.",
      "Rescheduled classes: If a parent cannot attend the new time, they can opt for a full refund for that session.",
    ],
    highlights: [
      { text: "full refund", inBullet: 1 },
      { text: "cannot attend the new time", inBullet: 2 },
      { text: "full refund", inBullet: 2 },
    ],
  },
  {
    q: "Is my centre a good fit for ClassZ?",
    bullets: [
      "Best fit: Small to medium-sized centres focused on quality, inclusivity (SEN-friendly), and transparent growth feedback, providing child-oriented program aged under 14.",
      "Benefits: free CRM, multi-branch management, direct enrolment, messaging, and parent trust through lesson photos + feedback.",
    ],
    a: [
      "See [ClassZ Partnership] for specific benefits and examples. If it resonates, apply via [How to Join Us] and we'll guide you through next steps.",
    ],
  },
  {
    q: "How do I make sure my payouts are released without penalties?",
    checklistTitle: "Follow this checklist:",
    checklistBullets: [
      {
        text: "Publish final, accurate details (date, time, venue, price, capacity, and assigned coach).",
        highlight: "Publish final, accurate details",
        rest: " (date, time, venue, price, capacity, and assigned coach).",
      },
      {
        text: "Don't edit schedules after publishing. If changes are needed, create a new slot.",
        highlight: "Don't edit schedules",
        rest: " after publishing. If changes are needed, create a new slot.",
      },
      {
        text: "No offline payments. All bookings and payments must go through ClassZ.",
        highlight: "No offline payments.",
        rest: " All bookings and payments must go through ClassZ.",
      },
      {
        text: "Submit attendance, one class photo, and performance feedback via the built-in system after each class (same day recommended).",
        highlight: "Submit attendance, one class photo, and performance feedback via the built-in system",
        rest: " after each class (same day recommended).",
      },
      {
        text: "Follow platform policies (e.g., don't message parents to renegotiate slot details).",
        highlight: "Follow platform policies",
        rest: " (e.g., don't message parents to renegotiate slot details).",
      },
    ],
    note: "Violations (missing feedback/photos, offline payments, schedule manipulation, or other T&C breaches) can lead to payout holds, fees, suspension, or removal.",
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
    setOpenParent(null)
    setOpenCentre(null)
  }

  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 selection:bg-teal-100">
      <Navbar />

      {/* Hero */}
      <section className="relative w-full overflow-hidden border-b border-[#E9E9E9] min-h-[280px] md:min-h-0">
        <div className="relative w-full h-[280px] md:h-auto" style={{ paddingBottom: '0' }}>
          <div className="absolute inset-0 md:relative md:pb-[33.33%]">
            <div
              className="absolute inset-0 md:absolute bg-cover"
              style={{ backgroundImage: "url('/headerFAQs.png')" }}
            />
          </div>
        </div>
        <div className="absolute inset-0 bg-black/40 md:bg-black/35 pointer-events-none h-[280px] md:h-full" />
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none h-[280px] md:h-full">
          <div className="max-w-[1180px] mx-auto w-full px-4 sm:px-6 md:px-10 text-center pointer-events-auto">
            <h1 className="text-white text-2xl sm:text-3xl md:text-5xl font-semibold mb-2 drop-shadow-lg">Frequently Asked Questions</h1>
            <p className="text-white/90 text-sm sm:text-base md:text-xl drop-shadow">Browse guides and answers for parents and centres.</p>
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
                className={`px-5 py-2 rounded-full border text-sm font-medium ${activeTab === tab.id
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
            <h2 className="text-lg font-semibold text-[#111929]">
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
                const open = openParent === idx
                return (
                  <div key={item.q} className="space-y-4 pb-6">
                    <button
                      onClick={() => setOpenParent(open ? null : idx)}
                      className="w-full flex items-start justify-between gap-4 text-left"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-[#5AE0D6] text-base font-semibold">Q</span>
                        <span className="text-base md:text-lg leading-snug">{item.q}</span>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
                      />
                    </button>
                    {open && (
                      <div className="space-y-5 text-sm leading-relaxed text-[#4B5563]">
                        {item.weatherRows && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-[1.05fr_1fr] gap-x-8 text-sm font-semibold text-[#00A3A0]">
                              <span>Weather Signal</span>
                              <span>Arrangement</span>
                            </div>
                            <div className="divide-y divide-[#E5E7EB] border-y border-[#E5E7EB]">
                              {item.weatherRows.map((row, i) => (
                                <div key={i} className="grid grid-cols-1 md:grid-cols-[1.05fr_1fr] gap-x-8 py-4">
                                  <div className="text-[#111929] leading-snug whitespace-pre-line">{row.signal}</div>
                                  <div className="text-[#4B5563] leading-relaxed">{row.arrangement}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {(() => {
                          const firstLine = item.a?.[0]
                          const secondLine = item.a?.[1]
                          const restLines = item.a ? item.a.slice(2) : []

                          const renderLine = (line: string) => {
                            const token = "[create a support ticket]"
                            const parts = line.split(token)
                            if (parts.length > 1) {
                              return (
                                <>
                                  {parts[0]}
                                  <Link href="/contact-us" className="text-[#00A3A0] font-semibold underline">
                                    create a support ticket
                                  </Link>
                                  {parts[1]}
                                </>
                              )
                            }
                            if (item.q === "Do I need a subscription to use ClassZ?" && line.includes("optional")) {
                              const [before, after] = line.split("optional")
                              return (
                                <>
                                  {before}
                                  <span className="text-[#00A3A0]">optional</span>
                                  {after}
                                </>
                              )
                            }
                            if (item.q === "What is Zing and how does it work?" && line.includes("Zing")) {
                              const [before, after] = line.split("Zing")
                              return (
                                <>
                                  {before}
                                  <span className="text-[#00A3A0]">Zing</span>
                                  {after}
                                </>
                              )
                            }
                            if (item.q === "Can I enroll multiple children under one account?" && line.includes("Yes")) {
                              const [before, after] = line.split("Yes")
                              return (
                                <>
                                  {before}
                                  <span className="text-[#00A3A0]">Yes</span>
                                  {after}
                                </>
                              )
                            }
                            return line
                          }

                          const isContactHelp = item.q === "How can I contact a centre or get help?"

                          return (
                            <>
                              {!isContactHelp && firstLine && (
                                <div className="space-y-2 text-[#4B5563] text-sm">
                                  <p className="text-[#111929]">{renderLine(firstLine)}</p>
                                  {restLines.map((line, i) => (
                                    <p key={i} className="text-[#4B5563]">
                                      {renderLine(line)}
                                    </p>
                                  ))}
                                </div>
                              )}
                              {/* For "Can I enroll multiple children..." show gallery before bullets */}
                              {item.gallery && item.gallery.length > 0 && item.q === "Can I enroll multiple children under one account?" && (
                                <div
                                  className={
                                    item.gallery.length > 1
                                      ? "grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"
                                      : "pt-2 flex justify-center"
                                  }
                                >
                                  {item.gallery.map((src, i) => (
                                    <div key={i} className={item.gallery.length > 1 ? "flex justify-center" : "w-full max-w-4xl"}>
                                      <img
                                        src={src}
                                        alt={`Illustration ${i + 1}`}
                                        className={`w-full rounded-2xl ${item.gallery.length > 1 ? "max-w-xl" : "max-w-4xl"}`}
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}

                              {item.bullets && item.bullets.length > 0 && item.q !== "Where can I see my child’s class photos?" && item.q !== "How can I contact a centre or get help?" && (
                                <ul className="space-y-2 list-disc list-inside text-[#4B5563] text-sm pl-1">
                                  {item.bullets.map((b, i) => {
                                    const highlightFinal = (text: string) => {
                                      if (item.q === "Can I enroll multiple children under one account?") {
                                        let out: (string | JSX.Element)[] = []
                                        const parts = text.split(/(final|non-refundable)/i)
                                        parts.forEach((p, idx) => {
                                          if (p.toLowerCase() === "final" || p.toLowerCase() === "non-refundable") {
                                            out.push(
                                              <span key={`${i}-hl-${idx}`} className="text-[#00A3A0]">
                                                {p}
                                              </span>
                                            )
                                          } else {
                                            out.push(p)
                                          }
                                        })
                                        return out
                                      }
                                      return text
                                    }
                                    return <li key={i}>{highlightFinal(b)}</li>
                                  })}
                                </ul>
                              )}
                              {secondLine && !isContactHelp && (
                                <div className="pt-4 text-sm text-[#4B5563]">
                                  <p className="text-[#111929]">{renderLine(secondLine)}</p>
                                </div>
                              )}
                            </>
                          )
                        })()}

                        {item.steps && item.steps.length > 0 && (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                              {item.steps.map((step, i) => (
                                <div key={i} className="space-y-3">
                                  <div className="relative rounded-2xl overflow-hidden">
                                    {step.image && (
                                      <img src={step.image} alt={step.title} className="w-full object-cover" />
                                    )}
                                  </div>
                                  <div className="text-sm text-[#4B5563] leading-relaxed">
                                    <p className="text-[#111929]">{step.title}</p>
                                    <p className="text-[#4B5563]">{step.desc}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}

                        {item.gallery && item.gallery.length > 0 && item.q !== "Can I enroll multiple children under one account?" && item.q !== "Where can I see my child’s class photos?" && item.q !== "How can I contact a centre or get help?" && (
                          <div
                            className={
                              item.gallery.length > 1
                                ? "grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"
                                : "pt-2 flex justify-center"
                            }
                          >
                            {item.gallery.map((src, i) => (
                              <div key={i} className={item.gallery.length > 1 ? "flex justify-center" : "w-full max-w-4xl"}>
                                <img
                                  src={src}
                                  alt={`Illustration ${i + 1}`}
                                  className={`w-full rounded-2xl ${item.gallery.length > 1 ? "max-w-xl" : "max-w-4xl"}`}
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {item.gallery && item.gallery.length > 0 && item.q === "How can I contact a centre or get help?" && (
                          <div className="pt-2 flex justify-center">
                            {item.gallery.map((src, i) => (
                              <div key={i} className="w-full max-w-4xl">
                                <img src={src} alt={`Illustration ${i + 1}`} className="w-full rounded-2xl" />
                              </div>
                            ))}
                          </div>
                        )}

                        {item.bullets && item.bullets.length > 0 && item.q === "How can I contact a centre or get help?" && (
                          <ul className="space-y-2 list-disc list-inside text-[#4B5563] text-sm pl-1 pt-2">
                            {item.bullets.map((b, i) => (
                              <li key={i}>{b}</li>
                            ))}
                          </ul>
                        )}

                        {item.a && item.a.length > 0 && item.q === "How can I contact a centre or get help?" && (
                          <div className="space-y-2 text-[#4B5563] text-sm pt-4">
                            {item.a.map((line, i) => (
                              <p key={i} className={i === 0 ? "text-[#111929]" : ""}>
                                {(() => {
                                  const token = "[create a support ticket]"
                                  const parts = line.split(token)
                                  if (parts.length > 1) {
                                    return (
                                      <>
                                        {parts[0]}
                                        <Link href="/contact-us" className="text-[#00A3A0] font-semibold underline">
                                          create a support ticket
                                        </Link>
                                        {parts[1]}
                                      </>
                                    )
                                  }
                                  return line
                                })()}
                              </p>
                            ))}
                          </div>
                        )}

                        {item.gallery && item.gallery.length > 0 && item.q === "Where can I see my child’s class photos?" && (
                          <div
                            className={
                              item.gallery.length > 1
                                ? "grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"
                                : "pt-2 flex justify-center"
                            }
                          >
                            {item.gallery.map((src, i) => (
                              <div key={i} className={item.gallery.length > 1 ? "flex justify-center" : "w-full max-w-4xl"}>
                                <img
                                  src={src}
                                  alt={`Illustration ${i + 1}`}
                                  className={`w-full rounded-2xl ${item.gallery.length > 1 ? "max-w-xl" : "max-w-4xl"}`}
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        {item.bullets && item.bullets.length > 0 && item.q === "Where can I see my child’s class photos?" && (
                          <ul className="space-y-2 list-disc list-inside text-[#4B5563] text-sm pl-1 pt-2">
                            {item.bullets.map((b, i) => (
                              <li key={i}>{b}</li>
                            ))}
                          </ul>
                        )}

                        {item.bulletsSecondary && item.bulletsSecondary.length > 0 && (
                          <ul className="space-y-2 list-disc list-inside text-[#4B5563] text-sm pl-1 pt-1">
                            {item.bulletsSecondary.map((b, i) => (
                              <li key={i}>{b}</li>
                            ))}
                          </ul>
                        )}

                        {item.senImage && (
                          <div className="pt-2 flex justify-center">
                            <img
                              src={item.senImage}
                              alt="SEN support example"
                              className="max-w-xl w-full rounded-2xl"
                            />
                          </div>
                        )}

                        {item.weatherNotes && item.weatherNotes.length > 0 && (
                          <ul className="space-y-2 list-disc list-inside text-[#4B5563] text-sm pl-1">
                            {item.weatherNotes.map((note, i) => {
                              const token = "[create a support ticket]"
                              const parts = note.split(token)
                              return (
                                <li key={i}>
                                  {parts.length > 1 ? (
                                    <>
                                      {parts[0]}
                                      <Link href="/contact-us" className="text-[#00A3A0] font-semibold underline">
                                        create a support ticket
                                      </Link>
                                      {parts[1]}
                                    </>
                                  ) : (
                                    note
                                  )}
                                </li>
                              )
                            })}
                          </ul>
                        )}

                        {item.extraTitle && (
                          <div className="space-y-3 pt-2">
                            <p className="text-sm md:text-base font-semibold text-[#111929]">
                              {item.extraTitle.includes("three parts") ? (
                                <>
                                  {item.extraTitle.replace("Insights are divided into three parts:", "Insights are divided into ")}
                                  <span className="text-[#00A3A0]">three parts</span>:
                                </>
                              ) : (
                                item.extraTitle
                              )}
                            </p>
                            {item.extraBullets && item.q === "How can I view my child’s performance or progress?" ? (
                              <div className="space-y-4 text-sm md:text-base text-[#4B5563]">
                                {item.extraBullets.map((b, i) => {
                                  const [head, ...rest] = b.split(":")
                                  const body = rest.join(":").trim()
                                  return (
                                    <div key={i} className="space-y-1">
                                      <p className="font-semibold text-[#00A3A0]">{head.trim()}:</p>
                                      {body && <p>{body}</p>}
                                    </div>
                                  )
                                })}
                              </div>
                            ) : (
                              <ul className="space-y-1 list-disc list-inside text-[#4B5563] text-xs md:text-sm">
                                {item.extraBullets?.map((b, i) => (
                                  <li key={i}>{b}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}

                        {item.note && (
                          <p className="text-xs text-[#00A3A0] font-semibold pt-1 leading-relaxed">{item.note}</p>
                        )}

                        {!item.note && item.q === "How do I register and enrol my child in a class?" && (
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
                  className="bg-white"
                >
                  <button
                    onClick={() => setOpenCentre(open ? null : idx)}
                    className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-[#00A3A0] text-base font-semibold">Q</span>
                      <span className="text-base md:text-lg text-[#111929] leading-snug">{item.q}</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>
                  {open && (
                    <div className="px-5 pb-5 space-y-2 text-sm text-[#485A69] leading-relaxed">
                      {item.a && item.a.length > 0 && item.q !== "Pricing: does ClassZ charge centres?" && item.q !== "Can I edit or update class schedules after posting?" && item.q !== "What's the difference between Owner, Manager, and Coach accounts?" && item.q !== "Can one Owner manage multiple branches or locations?" && item.q !== "What information is required to set up my centre profile?" && item.q !== "What is the bad-weather arrangement for centres?" && item.q !== "Is my centre a good fit for ClassZ?" && item.q !== "How do I make sure my payouts are released without penalties?" && (
                        <div className="space-y-2">
                          {(item.q === "How do parents pay for classes? Are offline payments allowed?"
                            ? [item.a[0]]
                            : item.q === "Are lesson photos and performance feedback mandatory after every class? What if we don't submit?"
                              ? [item.a[0], item.a[1]]
                              : item.a
                          ).map((line, i) => {
                            const renderLine = (text: string) => {
                              if (item.q === "How do parents pay for classes? Are offline payments allowed?") {
                                if (text.includes("third-party payment methods")) {
                                  const parts = text.split("third-party payment methods")
                                  return (
                                    <>
                                      {parts[0]}
                                      <span className="text-[#00A3A0] font-semibold">third-party payment methods</span>
                                      {parts[1]}
                                    </>
                                  )
                                }
                              }
                              if (item.q === "Are lesson photos and performance feedback mandatory after every class? What if we don't submit?") {
                                // Highlight "Yes—mandatory for every attended lesson." (first line)
                                if (text.includes("Yes—mandatory for every attended lesson.")) {
                                  return <span className="text-[#00A3A0]">{text}</span>
                                }
                                // Highlight "one class photo" and "provide feedback"
                                if (text.includes("one class photo") || text.includes("provide feedback")) {
                                  let result: (string | JSX.Element)[] = []
                                  let remaining = text

                                  if (remaining.includes("one class photo")) {
                                    const idx = remaining.indexOf("one class photo")
                                    if (idx > 0) result.push(remaining.substring(0, idx))
                                    result.push(<span key="photo" className="text-[#00A3A0]">one class photo</span>)
                                    remaining = remaining.substring(idx + 15)
                                  }

                                  if (remaining.includes("provide feedback")) {
                                    const idx = remaining.indexOf("provide feedback")
                                    if (idx > 0) result.push(remaining.substring(0, idx))
                                    result.push(<span key="feedback" className="text-[#00A3A0]">provide feedback</span>)
                                    remaining = remaining.substring(idx + 17)
                                  }

                                  if (remaining) result.push(remaining)
                                  return <>{result}</>
                                }
                              }
                              if (item.q === "How do I register my centre and get listed on ClassZ?") {
                                if (text.includes("[How to Join Us]")) {
                                  const parts = text.split("[How to Join Us]")
                                  return (
                                    <>
                                      {parts[0]}
                                      <Link href="/partnership" className="text-[#00A3A0]">
                                        How to Join Us
                                      </Link>
                                      {parts[1]}
                                    </>
                                  )
                                }
                              }
                              return text
                            }
                            return <p key={i}>{renderLine(line)}</p>
                          })}
                        </div>
                      )}
                      {item.bullets && item.bullets.length > 0 && item.q !== "Is my centre a good fit for ClassZ?" && item.q !== "How do I make sure my payouts are released without penalties?" && (
                        <ul className="space-y-2 list-disc list-inside">
                          {item.bullets.map((b, i) => {
                            const highlightText = (text: string) => {
                              if (item.q === "How do parents pay for classes? Are offline payments allowed?") {
                                if (text.includes("ClassZ covers the standard processor fees for eligible centres.")) {
                                  const parts = text.split("ClassZ covers the standard processor fees for eligible centres.")
                                  return (
                                    <>
                                      {parts[0]}
                                      <span className="text-[#00A3A0] font-semibold">
                                        ClassZ covers the standard processor fees for eligible centres.
                                      </span>
                                      {parts[1]}
                                    </>
                                  )
                                }
                                return text
                              }
                              if (item.q === "Pricing: does ClassZ charge centres?") {
                                const parts: (string | JSX.Element)[] = []
                                // Highlight "Free" (bold)
                                let remaining = text
                                if (remaining.includes("Free")) {
                                  const idx = remaining.indexOf("Free")
                                  if (idx > 0) parts.push(remaining.substring(0, idx))
                                  parts.push(
                                    <span key={`free-${i}`} className="text-[#00A3A0] font-semibold">
                                      Free
                                    </span>
                                  )
                                  remaining = remaining.substring(idx + 4)
                                }
                                // Highlight "0% commission" (bold)
                                if (remaining.includes("0% commission")) {
                                  const idx = remaining.indexOf("0% commission")
                                  if (idx > 0) parts.push(remaining.substring(0, idx))
                                  parts.push(
                                    <span key={`commission-${i}`} className="text-[#00A3A0] font-semibold">
                                      0% commission
                                    </span>
                                  )
                                  remaining = remaining.substring(idx + 15)
                                }
                                // Highlight "centres don't pay these" (not bold)
                                if (remaining.includes("centres don't pay these")) {
                                  const idx = remaining.indexOf("centres don't pay these")
                                  if (idx > 0) parts.push(remaining.substring(0, idx))
                                  parts.push(
                                    <span key={`dontpay-${i}`} className="text-[#00A3A0]">
                                      centres don't pay these
                                    </span>
                                  )
                                  remaining = remaining.substring(idx + 25)
                                }
                                // Highlight "[How to Join Us]" (link)
                                if (remaining.includes("[How to Join Us]")) {
                                  const idx = remaining.indexOf("[How to Join Us]")
                                  if (idx > 0) parts.push(remaining.substring(0, idx))
                                  parts.push(
                                    <Link key={`joinus-${i}`} href="/partnership" className="text-[#00A3A0] underline">
                                      How to Join Us
                                    </Link>
                                  )
                                  remaining = remaining.substring(idx + 16)
                                }
                                if (remaining) parts.push(remaining)
                                return parts.length > 0 ? <>{parts}</> : text
                              }
                              return text
                            }
                            return <li key={i}>{highlightText(b)}</li>
                          })}
                        </ul>
                      )}
                      {item.a && item.a.length > 0 && item.q === "Pricing: does ClassZ charge centres?" && (
                        <div className="space-y-2 pt-2">
                          {item.a.map((line, i) => {
                            const renderLine = (text: string) => {
                              if (text.includes("[How to Join Us]")) {
                                const parts = text.split("[How to Join Us]")
                                return (
                                  <>
                                    {parts[0]}
                                    <Link href="/partnership" className="text-[#00A3A0] underline">
                                      How to Join Us
                                    </Link>
                                    {parts[1]}
                                  </>
                                )
                              }
                              return text
                            }
                            return <p key={i}>{renderLine(line)}</p>
                          })}
                        </div>
                      )}
                      {item.a && item.a.length > 1 && item.q === "How do parents pay for classes? Are offline payments allowed?" && (
                        <div className="space-y-2 pt-2">
                          {item.a.slice(1).map((line, i) => (
                            <p key={i}>{line}</p>
                          ))}
                        </div>
                      )}
                      {item.a && item.a.length > 2 && item.q === "Are lesson photos and performance feedback mandatory after every class? What if we don't submit?" && (
                        <div className="space-y-2 pt-2">
                          <p>{item.a[2]}</p>
                        </div>
                      )}
                      {'sections' in item && item.sections && item.q === "Can I edit or update class schedules after posting?" && (
                        <div className="space-y-4 pt-2">
                          {/* Intro line with highlight */}
                          {item.a && item.a.length > 0 && (
                            <p>
                              <span className="text-[#00A3A0]">Yes—by request only.</span>{" "}
                              {item.a[0].replace("Yes—by request only. ", "")}
                            </p>
                          )}
                          {/* Sections */}
                          {('sections' in item && item.sections ? item.sections : []).map((section: any, sectionIdx: number) => (
                            <div key={sectionIdx} className="space-y-2">
                              {/* Section title */}
                              <h4 className={section.title.includes("Does not have enrollment yet?") ? "" : "text-[#00A3A0]"}>
                                {section.title.includes("Does not have enrollment yet?") ? (
                                  <>
                                    <span className="text-[#00A3A0]">Does not have enrollment yet?</span>{" "}
                                    <span className="text-[#111929]">{section.title.replace("Does not have enrollment yet? ", "")}</span>
                                  </>
                                ) : (
                                  section.title
                                )}
                              </h4>
                              {/* Bullets */}
                              <ul className={`space-y-2 ${section.tealBullets ? "list-none" : "list-disc"} list-inside`}>
                                {section.bullets.map((bullet: any, bulletIdx: number) => {
                                  const bulletText = typeof bullet === "string" ? bullet : bullet.text
                                  const subBullet = typeof bullet === "object" ? bullet.subBullet : null
                                  // Get highlights: from bullet object, or from section.highlights (either array of strings or array with inBullet)
                                  let highlights: string[] = []
                                  if (typeof bullet === "object" && bullet.highlights) {
                                    highlights = bullet.highlights
                                  } else if (section.highlights) {
                                    // Check if section.highlights is array of strings (for last section) or array of objects with inBullet
                                    if (Array.isArray(section.highlights) && section.highlights.length > 0) {
                                      if (typeof section.highlights[0] === "string") {
                                        // Array of strings - check if this bullet contains any of them
                                        highlights = section.highlights.filter((h: string) => bulletText.includes(h))
                                      } else {
                                        // Array of objects with inBullet
                                        const highlightObj = section.highlights.find((h: any) => h.inBullet === bulletIdx)
                                        if (highlightObj) {
                                          highlights = [highlightObj.text]
                                        }
                                      }
                                    }
                                  }

                                  const renderBulletText = (text: string) => {
                                    let result: (string | JSX.Element)[] = []
                                    let remaining = text

                                    // Handle highlights
                                    if (highlights.length > 0) {
                                      // Sort highlights by position in text (longest first to avoid partial matches)
                                      const sortedHighlights = highlights.sort((a, b) => b.length - a.length)
                                      const highlightPositions = sortedHighlights.map((h: string) => ({
                                        text: h,
                                        pos: remaining.indexOf(h),
                                      })).filter((hp: any) => hp.pos >= 0).sort((a: any, b: any) => a.pos - b.pos)

                                      // Remove overlapping highlights (keep the first one)
                                      const nonOverlapping: any[] = []
                                      highlightPositions.forEach((hp: any) => {
                                        const overlaps = nonOverlapping.some((existing: any) => {
                                          const existingEnd = existing.pos + existing.text.length
                                          const hpEnd = hp.pos + hp.text.length
                                          return (hp.pos >= existing.pos && hp.pos < existingEnd) ||
                                            (existing.pos >= hp.pos && existing.pos < hpEnd)
                                        })
                                        if (!overlaps) {
                                          nonOverlapping.push(hp)
                                        }
                                      })

                                      let lastPos = 0
                                      nonOverlapping.forEach((hp: any) => {
                                        if (hp.pos > lastPos) {
                                          result.push(remaining.substring(lastPos, hp.pos))
                                        }
                                        result.push(
                                          <span key={`highlight-${bulletIdx}-${hp.pos}`} className="text-[#00A3A0]">
                                            {hp.text}
                                          </span>
                                        )
                                        lastPos = hp.pos + hp.text.length
                                      })
                                      if (lastPos < remaining.length) {
                                        result.push(remaining.substring(lastPos))
                                      }
                                    } else {
                                      result.push(text)
                                    }

                                    return result.length > 0 ? <>{result}</> : text
                                  }

                                  return (
                                    <li key={bulletIdx} className={section.tealBullets ? "flex items-start gap-2" : ""}>
                                      {section.tealBullets && (
                                        <span className="text-[#00A3A0] mt-1.5 w-1.5 h-1.5 bg-[#00A3A0] rounded-sm flex-shrink-0"></span>
                                      )}
                                      <div className="flex-1">
                                        <span>{renderBulletText(bulletText)}</span>
                                        {subBullet && (
                                          <div className="mt-1 pl-4">
                                            <span className="text-[#485A69]">
                                              {(() => {
                                                // Highlight "full refund for that session" in sub-bullet
                                                if (subBullet.includes("full refund for that session")) {
                                                  const parts = subBullet.split("full refund for that session")
                                                  return (
                                                    <>
                                                      {parts[0]}
                                                      <span className="text-[#00A3A0]">full refund for that session</span>
                                                      {parts[1]}
                                                    </>
                                                  )
                                                }
                                                return subBullet
                                              })()}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </li>
                                  )
                                })}
                              </ul>
                            </div>
                          ))}
                          {/* Note */}
                          {item.note && (
                            <p className="pt-2">{item.note}</p>
                          )}
                        </div>
                      )}
                      {item.a && item.a.length > 0 && item.q === "Can I edit or update class schedules after posting?" && !('sections' in item && item.sections) && (
                        <div className="space-y-2">
                          {item.a.map((line, i) => {
                            const renderLine = (text: string) => {
                              if (text.includes("Yes—by request only.")) {
                                const parts = text.split("Yes—by request only.")
                                return (
                                  <>
                                    <span className="text-[#00A3A0]">Yes—by request only.</span>
                                    {parts[1]}
                                  </>
                                )
                              }
                              return text
                            }
                            return <p key={i}>{renderLine(line)}</p>
                          })}
                        </div>
                      )}
                      {item.a && item.a.length > 0 && item.q === "What's the difference between Owner, Manager, and Coach accounts?" && (
                        <div className="space-y-2">
                          {item.a.map((line, i) => {
                            const renderLine = (text: string) => {
                              // Highlight "Owner:", "Manager:", "Coach:" in teal
                              if (text.startsWith("Owner:") || text.startsWith("Manager:") || text.startsWith("Coach:")) {
                                const colonIndex = text.indexOf(":")
                                const role = text.substring(0, colonIndex + 1)
                                const description = text.substring(colonIndex + 1)
                                return (
                                  <>
                                    <span className="text-[#00A3A0]">{role}</span>
                                    {description}
                                  </>
                                )
                              }
                              // Convert "[Centre Overview]" to link
                              if (text.includes("[Centre Overview]")) {
                                const parts = text.split("[Centre Overview]")
                                return (
                                  <>
                                    {parts[0]}
                                    <Link href="/partnership" className="text-[#00A3A0]">
                                      Centre Overview
                                    </Link>
                                    {parts[1]}
                                  </>
                                )
                              }
                              return text
                            }
                            return <p key={i}>{renderLine(line)}</p>
                          })}
                        </div>
                      )}
                      {item.a && item.a.length > 0 && item.q === "Can one Owner manage multiple branches or locations?" && (
                        <div className="space-y-2">
                          {item.a.map((line, i) => {
                            const renderLine = (text: string) => {
                              // Highlight first line "Yes—an Owner can manage unlimited branches." in teal
                              if (text.includes("Yes—an Owner can manage unlimited branches.")) {
                                return <span className="text-[#00A3A0]">{text}</span>
                              }
                              // Highlight "a different venue per program schedule" in teal
                              if (text.includes("a different venue per program schedule")) {
                                const parts = text.split("a different venue per program schedule")
                                return (
                                  <>
                                    {parts[0]}
                                    <span className="text-[#00A3A0]">a different venue per program schedule</span>
                                    {parts[1]}
                                  </>
                                )
                              }
                              return text
                            }
                            return <p key={i}>{renderLine(line)}</p>
                          })}
                        </div>
                      )}
                      {item.a && item.a.length > 0 && item.q === "What information is required to set up my centre profile?" && (
                        <div className="space-y-2">
                          {item.a.map((line, i) => {
                            const renderLine = (text: string) => {
                              // Highlight "Basics:" and "Verification:" in teal and bold
                              if (text.startsWith("Basics:")) {
                                const colonIndex = text.indexOf(":")
                                const label = text.substring(0, colonIndex + 1)
                                const content = text.substring(colonIndex + 1)
                                return (
                                  <>
                                    <span className="text-[#00A3A0] font-semibold">{label}</span>
                                    {content}
                                  </>
                                )
                              }
                              if (text.startsWith("Verification:")) {
                                const colonIndex = text.indexOf(":")
                                const label = text.substring(0, colonIndex + 1)
                                const content = text.substring(colonIndex + 1)
                                return (
                                  <>
                                    <span className="text-[#00A3A0] font-semibold">{label}</span>
                                    {content}
                                  </>
                                )
                              }
                              // Convert "[How to Join Us]" to link
                              if (text.includes("[How to Join Us]")) {
                                const parts = text.split("[How to Join Us]")
                                return (
                                  <>
                                    {parts[0]}
                                    <Link href="/partnership" className="text-[#00A3A0]">
                                      How to Join Us
                                    </Link>
                                    {parts[1]}
                                  </>
                                )
                              }
                              return text
                            }
                            return <p key={i}>{renderLine(line)}</p>
                          })}
                        </div>
                      )}
                      {item.q === "What is the bad-weather arrangement for centres?" && (
                        <div className="space-y-4 pt-2">
                          {/* Intro paragraph */}
                          {item.a && item.a.length > 0 && (
                            <p>
                              {(() => {
                                const text = item.a[0]
                                if (text.includes("Continue / Cancel / Reschedule")) {
                                  const parts = text.split("Continue / Cancel / Reschedule")
                                  return (
                                    <>
                                      {parts[0]}
                                      <span className="text-[#00A3A0]">Continue / Cancel / Reschedule</span>
                                      {parts[1]}
                                    </>
                                  )
                                }
                                return text
                              })()}
                            </p>
                          )}
                          {/* Weather table */}
                          {'weatherRows' in item && item.weatherRows && item.weatherRows.length > 0 && (
                            <div className="space-y-0 border border-[#E9E9E9] rounded-lg overflow-hidden">
                              {/* Table headers */}
                              <div className="grid grid-cols-2 bg-[#F9FAFB] border-b border-[#E9E9E9]">
                                <div className="px-4 py-2">
                                  <span className="text-[#00A3A0] font-semibold">Weather Signal</span>
                                </div>
                                <div className="px-4 py-2 border-l border-[#E9E9E9]">
                                  <span className="text-[#00A3A0] font-semibold">Arrangement</span>
                                </div>
                              </div>
                              {/* Table rows */}
                              {item.weatherRows.map((row: any, idx: number) => (
                                <div key={idx} className={`grid grid-cols-2 ${idx < item.weatherRows.length - 1 ? "border-b border-[#E9E9E9]" : ""}`}>
                                  <div className="px-4 py-2">
                                    <span>{row.signal}</span>
                                  </div>
                                  <div className="px-4 py-2 border-l border-[#E9E9E9]">
                                    <span>{row.arrangement}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          {/* In ClassZ section */}
                          {'classzBullets' in item && item.classzBullets && item.classzBullets.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-[#111929] font-semibold">In ClassZ:</h4>
                              <ul className="space-y-2 list-none">
                                {item.classzBullets.map((bullet: string, bulletIdx: number) => {
                                  const renderBulletText = (text: string) => {
                                    // Add additional highlights based on bullet content
                                    const additionalHighlights: string[] = []
                                    if (text.includes("Continue / Cancel / Reschedule")) {
                                      additionalHighlights.push("Continue / Cancel / Reschedule")
                                    }
                                    if (text.includes("Cancelled classes:")) {
                                      additionalHighlights.push("Cancelled classes:")
                                    }
                                    if (text.includes("Rescheduled classes:")) {
                                      additionalHighlights.push("Rescheduled classes:")
                                    }

                                    // Get highlights for this bullet
                                    const bulletHighlights = ('highlights' in item && item.highlights)
                                      ? item.highlights
                                        .filter((h: any) => h.inBullet === bulletIdx)
                                        .map((h: any) => h.text)
                                      : []

                                    // Combine all highlights
                                    const allHighlights = [...additionalHighlights, ...bulletHighlights]

                                    if (allHighlights.length > 0) {
                                      let result: (string | React.ReactElement)[] = []
                                      let remaining = text

                                      // Sort highlights by position (longest first to avoid partial matches)
                                      const sortedHighlights = allHighlights.sort((a: string, b: string) => b.length - a.length)
                                      const highlightPositions = sortedHighlights.map((h: string) => ({
                                        text: h,
                                        pos: remaining.indexOf(h),
                                      })).filter((hp: any) => hp.pos >= 0).sort((a: any, b: any) => a.pos - b.pos)

                                      // Remove overlapping highlights
                                      const nonOverlapping: any[] = []
                                      highlightPositions.forEach((hp: any) => {
                                        const overlaps = nonOverlapping.some((existing: any) => {
                                          const existingEnd = existing.pos + existing.text.length
                                          const hpEnd = hp.pos + hp.text.length
                                          return (hp.pos >= existing.pos && hp.pos < existingEnd) ||
                                            (existing.pos >= hp.pos && existing.pos < hpEnd)
                                        })
                                        if (!overlaps) {
                                          nonOverlapping.push(hp)
                                        }
                                      })

                                      let lastPos = 0
                                      nonOverlapping.forEach((hp: any) => {
                                        if (hp.pos > lastPos) {
                                          result.push(remaining.substring(lastPos, hp.pos))
                                        }
                                        result.push(
                                          <span key={`highlight-${bulletIdx}-${hp.pos}`} className="text-[#00A3A0]">
                                            {hp.text}
                                          </span>
                                        )
                                        lastPos = hp.pos + hp.text.length
                                      })
                                      if (lastPos < remaining.length) {
                                        result.push(remaining.substring(lastPos))
                                      }
                                      return result.length > 0 ? <>{result}</> : text
                                    }
                                    return text
                                  }

                                  return (
                                    <li key={bulletIdx} className="flex items-start gap-2">
                                      <span className="text-[#00A3A0] mt-1.5 w-1.5 h-1.5 bg-[#00A3A0] rounded-full flex-shrink-0"></span>
                                      <span>{renderBulletText(bullet)}</span>
                                    </li>
                                  )
                                })}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                      {item.q === "Is my centre a good fit for ClassZ?" && (
                        <div className="space-y-2 pt-2">
                          {/* Bullets */}
                          {item.bullets && item.bullets.length > 0 && (
                            <ul className="space-y-2 list-none">
                              {item.bullets.map((bullet: string, bulletIdx: number) => {
                                const renderBulletText = (text: string) => {
                                  // Highlight "Best fit:" and "Benefits:" in teal and bold
                                  if (text.startsWith("Best fit:")) {
                                    const colonIndex = text.indexOf(":")
                                    const label = text.substring(0, colonIndex + 1)
                                    const content = text.substring(colonIndex + 1)
                                    return (
                                      <>
                                        <span className="text-[#00A3A0] font-semibold">{label}</span>
                                        {content}
                                      </>
                                    )
                                  }
                                  if (text.startsWith("Benefits:")) {
                                    const colonIndex = text.indexOf(":")
                                    const label = text.substring(0, colonIndex + 1)
                                    const content = text.substring(colonIndex + 1)
                                    return (
                                      <>
                                        <span className="text-[#00A3A0] font-semibold">{label}</span>
                                        {content}
                                      </>
                                    )
                                  }
                                  return text
                                }
                                return (
                                  <li key={bulletIdx} className="flex items-start gap-2">
                                    <span className="text-[#00A3A0] mt-1.5 w-1.5 h-1.5 bg-[#00A3A0] rounded-full flex-shrink-0"></span>
                                    <span>{renderBulletText(bullet)}</span>
                                  </li>
                                )
                              })}
                            </ul>
                          )}
                          {/* Answer paragraph with links */}
                          {item.a && item.a.length > 0 && (
                            <div className="space-y-2 pt-2">
                              {item.a.map((line, i) => {
                                const renderLine = (text: string) => {
                                  // Convert "[ClassZ Partnership]" and "[How to Join Us]" to links
                                  let result: (string | React.ReactElement)[] = []
                                  let remaining = text

                                  // Handle "[ClassZ Partnership]"
                                  if (remaining.includes("[ClassZ Partnership]")) {
                                    const idx = remaining.indexOf("[ClassZ Partnership]")
                                    if (idx > 0) result.push(remaining.substring(0, idx))
                                    result.push(
                                      <Link key="partnership" href="/partnership" className="text-[#00A3A0]">
                                        ClassZ Partnership
                                      </Link>
                                    )
                                    remaining = remaining.substring(idx + 22)
                                  }

                                  // Handle "[How to Join Us]"
                                  if (remaining.includes("[How to Join Us]")) {
                                    const idx = remaining.indexOf("[How to Join Us]")
                                    if (idx > 0) result.push(remaining.substring(0, idx))
                                    result.push(
                                      <Link key="join" href="/partnership" className="text-[#00A3A0]">
                                        How to Join Us
                                      </Link>
                                    )
                                    remaining = remaining.substring(idx + 16)
                                  }

                                  if (remaining) result.push(remaining)
                                  return result.length > 0 ? <>{result}</> : text
                                }
                                return <p key={i}>{renderLine(line)}</p>
                              })}
                            </div>
                          )}
                        </div>
                      )}
                      {item.q === "How do I make sure my payouts are released without penalties?" && (
                        <div className="space-y-2 pt-2">
                          {/* Checklist title */}
                          {'checklistTitle' in item && item.checklistTitle && (
                            <p className="text-[#00A3A0] font-semibold">{item.checklistTitle}</p>
                          )}
                          {/* Checklist bullets */}
                          {'checklistBullets' in item && item.checklistBullets && item.checklistBullets.length > 0 && (
                            <ul className="space-y-2 list-none">
                              {item.checklistBullets.map((bullet: any, bulletIdx: number) => (
                                <li key={bulletIdx} className="flex items-start gap-2">
                                  <span className="text-[#00A3A0] mt-1.5 w-1.5 h-1.5 bg-[#00A3A0] rounded-full flex-shrink-0"></span>
                                  <span>
                                    <span className="text-[#00A3A0]">{bullet.highlight}</span>
                                    {bullet.rest}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                          {/* Note */}
                          {'note' in item && item.note && (
                            <p className="pt-2">{item.note}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </section>

      {/* Need more help */}
      <section className="py-16 bg-gradient-to-br from-[#F0FAF8] via-white to-[#E5F7F4]">
        <div className="max-w-[960px] mx-auto px-6 md:px-10 text-center space-y-6">
          <h3 className="text-3xl md:text-4xl font-semibold text-[#0B1B1C]">Need More Help?</h3>
          <p className="text-base md:text-lg text-[#4A5563]">Can’t find what you’re looking for?</p>
          <p className="text-sm md:text-base text-[#4A5563]">
            Create a support ticket and we’ll get back to you via email soon.
          </p>
          <div className="flex justify-center pt-2">
            <Link
              href="/contact-us"
              className="px-7 md:px-8 py-3.5 rounded-full bg-[#0ABAB5] text-white text-sm md:text-base font-semibold shadow-[0_16px_28px_rgba(10,186,181,0.28)] hover:bg-[#00a6a1] transition-colors"
            >
              Create Support Ticket
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

