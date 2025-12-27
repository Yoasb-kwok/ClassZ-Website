"use client"

import Link from "next/link"
import React from "react"
import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PolicyNavigation } from "@/components/policy-navigation"
import { useLanguage } from "@/components/language-provider"
import { PolicySection } from "@/components/policy-section"

export default function PrivacyPage() {
  const { t } = useLanguage()
  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 selection:bg-teal-100">
      <Navbar />

      {/* Hero */}
      <section className="relative w-full overflow-hidden border-b border-[#E9E9E9] min-h-[280px] md:min-h-0">
        <div className="relative w-full h-[280px] md:h-auto" style={{ paddingBottom: '0' }}>
          <div className="absolute inset-0 md:relative md:pb-[33.33%]">
            <div
              className="absolute inset-0 md:absolute bg-cover"
              style={{ backgroundImage: "url('/PolicyHeader.png')" }}
            />
          </div>
        </div>
        <div className="absolute inset-0 bg-black/40 md:bg-black/35 pointer-events-none h-[280px] md:h-full" />
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none h-[280px] md:h-full">
          <div className="max-w-[1180px] mx-auto w-full px-4 sm:px-6 md:px-10 text-center pointer-events-auto">
            <h1 className="text-white text-2xl sm:text-3xl md:text-5xl font-semibold mb-2 drop-shadow-lg">
              {t("privacyPage.hero.title")}
            </h1>

          </div>
        </div>
      </section>

      {/* Navigation */}
      <PolicyNavigation align="left" />

      {/* Content */}
      <section className="py-14 bg-white">
        <div className="max-w-[960px] mx-auto px-6 md:px-10">
          <div className="prose prose-slate max-w-none space-y-8">
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-[#111929] mb-4">
                {t("privacyPage.hero.title")}
              </h1>
              <p className="text-[#111929] text-sm md:text-base mb-4">
                {t("privacyPage.hero.lastUpdated")}
              </p>
              <div className="border-b border-[#E5E7EB]"></div>
            </div>
            <PrivacyContent t={t} />
          </div>
        </div>
      </section>

      {/* Navigation */}
      <PolicyNavigation align="center" title="These might help you" titleSize="xl" />

      <Footer />
    </main>
  )
}

function PrivacyContent({ t }: { t: (key: string) => string }) {
  // Process content to highlight links and specific phrases
  const processContent = (text: string, sectionNum?: number, subsectionNum?: number): React.ReactNode => {
    if (!text) return text

    let processed = text

    // Highlight specific phrases in subsection 3.2
    if (sectionNum === 3 && subsectionNum === 2) {
      processed = processed.replace(/solely by parents or legal guardians/gi, "<HIGHLIGHT>solely by parents or legal guardians</HIGHLIGHT>")
      processed = processed.replace(/does not independently verify/gi, "<HIGHLIGHT>does not independently verify</HIGHLIGHT>")
    } else if (!sectionNum) {
      // If sectionNum is not provided, don't apply section-specific highlights
      sectionNum = 0
    }

    // Highlight "not" in section 4 (in the last sentence)
    if (sectionNum === 4) {
      // Only highlight "not" in the sentence about unrelated purposes
      processed = processed.replace(/Personal data will not be used for purposes unrelated/gi, "Personal data will <NOT_HIGHLIGHT>not</NOT_HIGHLIGHT> be used for purposes unrelated")
    }

    // Highlight "not" in section 5 (appears twice in the last sentence)
    if (sectionNum === 5) {
      // Highlight both occurrences of "not" in the last sentence
      processed = processed.replace(/ClassZ does not provide/gi, "ClassZ does <NOT_HIGHLIGHT>not</NOT_HIGHLIGHT> provide")
      processed = processed.replace(/and does not determine/gi, "and does <NOT_HIGHLIGHT>not</NOT_HIGHLIGHT> determine")
    }

    // Highlight "third-party payment service providers" in section 8
    if (sectionNum === 8) {
      processed = processed.replace(/third-party payment service providers/gi, "<HIGHLIGHT>third-party payment service providers</HIGHLIGHT>")
    }

    // Highlight "not" in section 9 (in "We do not sell personal data")
    if (sectionNum === 9) {
      processed = processed.replace(/We do not sell personal data/gi, "We do <NOT_HIGHLIGHT>not</NOT_HIGHLIGHT> sell personal data")
    }

    // Split by Terms & Conditions patterns (link to /terms)
    const termsPatterns = [
      { pattern: "Terms & Conditions", replacement: "<TERMS_LINK>Terms & Conditions</TERMS_LINK>" },
      { pattern: "Terms and Conditions", replacement: "<TERMS_LINK>Terms and Conditions</TERMS_LINK>" }
    ]

    for (const { pattern, replacement } of termsPatterns) {
      processed = processed.replace(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement)
    }

    // Split by email pattern
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g
    processed = processed.replace(emailRegex, "<EMAIL_LINK>$1</EMAIL_LINK>")

    // Convert to React elements
    const parts: React.ReactNode[] = []
    const segments = processed.split(/(<HIGHLIGHT>.*?<\/HIGHLIGHT>|<NOT_HIGHLIGHT>.*?<\/NOT_HIGHLIGHT>|<TERMS_LINK>.*?<\/TERMS_LINK>|<EMAIL_LINK>.*?<\/EMAIL_LINK>)/g)

    segments.forEach((segment, idx) => {
      if (segment.startsWith("<HIGHLIGHT>")) {
        const text = segment.replace(/<\/?HIGHLIGHT>/g, "")
        parts.push(
          <span
            key={`highlight-${idx}`}
            className="text-[#0ABAB5] font-semibold"
          >
            {text}
          </span>
        )
      } else if (segment.startsWith("<NOT_HIGHLIGHT>")) {
        const text = segment.replace(/<\/?NOT_HIGHLIGHT>/g, "")
        parts.push(
          <span
            key={`not-${idx}`}
            className="text-[#0ABAB5] font-semibold"
          >
            {text}
          </span>
        )
      } else if (segment.startsWith("<TERMS_LINK>")) {
        const text = segment.replace(/<\/?TERMS_LINK>/g, "")
        parts.push(
          <a
            key={`terms-${idx}`}
            href="/terms"
            className="text-[#0ABAB5] hover:underline font-semibold"
          >
            {text}
          </a>
        )
      } else if (segment.startsWith("<EMAIL_LINK>")) {
        const email = segment.replace(/<\/?EMAIL_LINK>/g, "")
        parts.push(
          <a
            key={`email-${idx}`}
            href={`mailto:${email}`}
            className="text-[#0ABAB5] hover:underline font-semibold"
          >
            {email}
          </a>
        )
      } else if (segment) {
        parts.push(segment)
      }
    })

    return parts.length > 0 ? <>{parts}</> : text
  }

  const renderSection = (sectionNum: number) => {
    const title = t(`privacyPage.sections.section${sectionNum}.title`)
    const content = t(`privacyPage.sections.section${sectionNum}.content`)

    // Skip if section doesn't exist
    if (title === `privacyPage.sections.section${sectionNum}.title`) {
      return null
    }

    // Check for subsections
    const subsection1 = t(`privacyPage.sections.section${sectionNum}.subsection1.title`)
    const subsection1Content = t(`privacyPage.sections.section${sectionNum}.subsection1.content`)
    const subsection2 = t(`privacyPage.sections.section${sectionNum}.subsection2.title`)
    const subsection2Content = t(`privacyPage.sections.section${sectionNum}.subsection2.content`)
    const subsection3 = t(`privacyPage.sections.section${sectionNum}.subsection3.title`)
    const subsection3Content = t(`privacyPage.sections.section${sectionNum}.subsection3.content`)
    const subsection4 = t(`privacyPage.sections.section${sectionNum}.subsection4.title`)
    const subsection4Content = t(`privacyPage.sections.section${sectionNum}.subsection4.content`)

    const hasSubsections = subsection1 !== `privacyPage.sections.section${sectionNum}.subsection1.title`

    return (
      <div key={sectionNum} className="space-y-4 pb-6 border-b border-[#E5E7EB] last:border-b-0">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#111929]">
          {title}
        </h2>
        {content && (
          <div className="space-y-4 text-[#485A69] text-sm md:text-base leading-relaxed whitespace-pre-line">
            {processContent(content, sectionNum)}
          </div>
        )}
        {hasSubsections && (
          <div className="space-y-4 pl-4 md:pl-6">
            {subsection1 !== `privacyPage.sections.section${sectionNum}.subsection1.title` && (
              <div className="space-y-3">
                <h3 className="text-lg md:text-xl font-semibold text-[#111929]">
                  {subsection1}
                </h3>
                <div className="text-[#485A69] text-sm md:text-base leading-relaxed whitespace-pre-line">
                  {processContent(subsection1Content, sectionNum, 1)}
                </div>
              </div>
            )}
            {subsection2 !== `privacyPage.sections.section${sectionNum}.subsection2.title` && (
              <div className="space-y-3">
                <h3 className="text-lg md:text-xl font-semibold text-[#111929]">
                  {subsection2}
                </h3>
                <div className="text-[#485A69] text-sm md:text-base leading-relaxed whitespace-pre-line">
                  {processContent(subsection2Content, sectionNum, 2)}
                </div>
              </div>
            )}
            {subsection3 !== `privacyPage.sections.section${sectionNum}.subsection3.title` && (
              <div className="space-y-3">
                <h3 className="text-lg md:text-xl font-semibold text-[#111929]">
                  {subsection3}
                </h3>
                <div className="text-[#485A69] text-sm md:text-base leading-relaxed whitespace-pre-line">
                  {processContent(subsection3Content, sectionNum, 3)}
                </div>
              </div>
            )}
            {subsection4 !== `privacyPage.sections.section${sectionNum}.subsection4.title` && (
              <div className="space-y-3">
                <h3 className="text-lg md:text-xl font-semibold text-[#111929]">
                  {subsection4}
                </h3>
                <div className="text-[#485A69] text-sm md:text-base leading-relaxed whitespace-pre-line">
                  {processContent(subsection4Content, sectionNum, 4)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {renderSection(1)}
      {renderSection(2)}
      {renderSection(3)}
      {renderSection(4)}
      {renderSection(5)}
      {renderSection(6)}
      {renderSection(7)}
      {renderSection(8)}
      {renderSection(9)}
      {renderSection(10)}
      {renderSection(11)}
      {renderSection(12)}
      {renderSection(13)}
      {renderSection(14)}
      {renderSection(15)}
    </>
  )
}
