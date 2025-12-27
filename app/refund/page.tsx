"use client"

import Link from "next/link"
import React, { useEffect } from "react"
import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PolicyNavigation } from "@/components/policy-navigation"
import { useLanguage } from "@/components/language-provider"

export default function RefundPage() {
  const { t } = useLanguage()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable Ctrl+B (or Cmd+B on Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

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
              {t("refundPage.hero.title")}
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
                {t("refundPage.hero.title")}
              </h1>
              <p className="text-[#111929] text-sm md:text-base mb-4">
                {t("refundPage.hero.lastUpdated")}
              </p>
              <p className="text-[#485A69] text-sm md:text-base leading-relaxed mb-4">
                {t("refundPage.intro.content")}
              </p>
              <div className="border-b border-[#E5E7EB]"></div>
            </div>
            <RefundContent t={t} />
          </div>
        </div>
      </section>

      {/* Navigation */}
      <PolicyNavigation align="center" title="These might help you" titleSize="xl" />

      <Footer />
    </main>
  )
}

function RefundContent({ t }: { t: (key: string) => string }) {
  // Process content to highlight specific phrases and format bullets
  const processContent = (text: string, sectionNum: number): React.ReactNode => {
    if (!text) return text

    let processed = text

    // Highlight specific phrases in section 1
    if (sectionNum === 1) {
      processed = processed.replace(/timing, attendance, and the reason for the request/gi, "<HIGHLIGHT>timing, attendance, and the reason for the request</HIGHLIGHT>")
      processed = processed.replace(/All refunds are issued in Zing credits or vouchers only/gi, "<HIGHLIGHT>All refunds are issued in Zing credits or vouchers only</HIGHLIGHT>")
      processed = processed.replace(/non-refundable/gi, "<HIGHLIGHT>non-refundable</HIGHLIGHT>")
    }

    // Highlight "full refund" in section 3
    if (sectionNum === 3) {
      processed = processed.replace(/full refund/gi, "<HIGHLIGHT>full refund</HIGHLIGHT>")
    }

    // Highlight specific phrases in section 4
    if (sectionNum === 4) {
      processed = processed.replace(/twenty-four \(24\) hours/gi, "<HIGHLIGHT>twenty-four (24) hours</HIGHLIGHT>")
      processed = processed.replace(/proceed as scheduled/gi, "<HIGHLIGHT>proceed as scheduled</HIGHLIGHT>")
      processed = processed.replace(/full refund/gi, "<HIGHLIGHT>full refund</HIGHLIGHT>")
    }

    // Highlight specific phrases in section 5
    if (sectionNum === 5) {
      processed = processed.replace(/full refund/gi, "<HIGHLIGHT>full refund</HIGHLIGHT>")
      processed = processed.replace(/48 hours after/gi, "<HIGHLIGHT>48 hours after</HIGHLIGHT>")
    }

    // Highlight specific phrases in section 6
    if (sectionNum === 6) {
      processed = processed.replace(/full refund for that session\.?/gi, (match) => {
        const hasPeriod = match.endsWith('.')
        return `<HIGHLIGHT>full refund for that session</HIGHLIGHT>${hasPeriod ? '.' : ''}`
      })
      processed = processed.replace(/centre-side issue/gi, "<HIGHLIGHT>centre-side issue</HIGHLIGHT>")
      processed = processed.replace(/not refundable/gi, "<HIGHLIGHT>not refundable</HIGHLIGHT>")
    }

    // Highlight "not" in section 7 (only in specific phrases)
    if (sectionNum === 7) {
      processed = processed.replace(/are not considered/gi, "are <HIGHLIGHT>not</HIGHLIGHT> considered")
    }

    // Highlight specific phrases in section 8
    if (sectionNum === 8) {
      processed = processed.replace(/does not entitle/gi, "does <HIGHLIGHT>not</HIGHLIGHT> entitle")
      processed = processed.replace(/partial coupon or voucher/gi, "<HIGHLIGHT>partial coupon or voucher</HIGHLIGHT>")
    }

    // Split by email pattern
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g
    processed = processed.replace(emailRegex, "<EMAIL_LINK>$1</EMAIL_LINK>")

    // Process bullets and sub-bullets for proper indentation
    const lines = processed.split('\n')
    const processedLines = lines.map((line, lineIdx) => {
      const trimmed = line.trim()

      // Check for sub-bullets (→)
      if (trimmed.startsWith('→')) {
        return `<SUB_BULLET>${line}</SUB_BULLET>`
      }
      // Check for main bullets (•)
      else if (trimmed.startsWith('•')) {
        return `<BULLET>${line}</BULLET>`
      }
      return line
    })

    processed = processedLines.join('\n')

    // Convert to React elements
    const parts: React.ReactNode[] = []
    const segments = processed.split(/(<HIGHLIGHT>.*?<\/HIGHLIGHT>|<EMAIL_LINK>.*?<\/EMAIL_LINK>|<BULLET>.*?<\/BULLET>|<SUB_BULLET>.*?<\/SUB_BULLET>)/g)

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
      } else if (segment.startsWith("<BULLET>")) {
        const text = segment.replace(/<\/?BULLET>/g, "")
        // Parse nested HIGHLIGHT tags in bullet content
        const bulletParts: React.ReactNode[] = []
        const bulletSegments = text.split(/(<HIGHLIGHT>.*?<\/HIGHLIGHT>)/g)
        bulletSegments.forEach((bulletSegment, bulletIdx) => {
          if (bulletSegment.startsWith("<HIGHLIGHT>")) {
            const highlightText = bulletSegment.replace(/<\/?HIGHLIGHT>/g, "")
            bulletParts.push(
              <span
                key={`bullet-highlight-${idx}-${bulletIdx}`}
                className="text-[#0ABAB5] font-semibold"
              >
                {highlightText}
              </span>
            )
          } else if (bulletSegment) {
            bulletParts.push(bulletSegment)
          }
        })
        parts.push(
          <div key={`bullet-${idx}`} className="mb-2">
            {bulletParts}
          </div>
        )
      } else if (segment.startsWith("<SUB_BULLET>")) {
        const text = segment.replace(/<\/?SUB_BULLET>/g, "")
        // Parse nested HIGHLIGHT tags in sub-bullet content
        const subBulletParts: React.ReactNode[] = []
        const subBulletSegments = text.split(/(<HIGHLIGHT>.*?<\/HIGHLIGHT>)/g)
        subBulletSegments.forEach((subBulletSegment, subBulletIdx) => {
          if (subBulletSegment.startsWith("<HIGHLIGHT>")) {
            const highlightText = subBulletSegment.replace(/<\/?HIGHLIGHT>/g, "")
            subBulletParts.push(
              <span
                key={`subbullet-highlight-${idx}-${subBulletIdx}`}
                className="text-[#0ABAB5] font-semibold"
              >
                {highlightText}
              </span>
            )
          } else if (subBulletSegment) {
            subBulletParts.push(subBulletSegment)
          }
        })
        parts.push(
          <div key={`subbullet-${idx}`} className="pl-6 mb-2">
            {subBulletParts}
          </div>
        )
      } else if (segment) {
        // Handle regular text - preserve line breaks and paragraph spacing
        const paragraphs = segment.split(/\n\n+/)
        paragraphs.forEach((paragraph, paraIdx) => {
          if (paraIdx > 0) {
            // Add spacing between paragraphs
            parts.push(<div key={`para-spacer-${idx}-${paraIdx}`} className="mb-4" />)
          }
          const lines = paragraph.split('\n')
          lines.forEach((line, lineIdx) => {
            if (line.trim()) {
              if (lineIdx > 0) {
                parts.push(<br key={`br-${idx}-${paraIdx}-${lineIdx}`} />)
              }
              parts.push(
                <span key={`text-${idx}-${paraIdx}-${lineIdx}`}>
                  {line}
                </span>
              )
            }
          })
        })
      }
    })

    return parts.length > 0 ? <>{parts}</> : text
  }

  const renderSection = (sectionNum: number) => {
    const title = t(`refundPage.sections.section${sectionNum}.title`)
    const content = t(`refundPage.sections.section${sectionNum}.content`)

    // Skip if section doesn't exist
    if (title === `refundPage.sections.section${sectionNum}.title`) {
      return null
    }

    // Check for subsections
    const subsection1 = t(`refundPage.sections.section${sectionNum}.subsection1.title`)
    const subsection1Content = t(`refundPage.sections.section${sectionNum}.subsection1.content`)
    const subsection2 = t(`refundPage.sections.section${sectionNum}.subsection2.title`)
    const subsection2Content = t(`refundPage.sections.section${sectionNum}.subsection2.content`)
    const subsection3 = t(`refundPage.sections.section${sectionNum}.subsection3.title`)
    const subsection3Content = t(`refundPage.sections.section${sectionNum}.subsection3.content`)
    const subsection4 = t(`refundPage.sections.section${sectionNum}.subsection4.title`)
    const subsection4Content = t(`refundPage.sections.section${sectionNum}.subsection4.content`)

    const hasSubsections = subsection1 !== `refundPage.sections.section${sectionNum}.subsection1.title`

    return (
      <div key={sectionNum} className="space-y-4 pb-6 border-b border-[#E5E7EB] last:border-b-0">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#111929]">
          {title}
        </h2>
        {content && (
          <div className="text-[#485A69] text-sm md:text-base leading-relaxed whitespace-pre-line">
            {processContent(content, sectionNum)}
          </div>
        )}
        {hasSubsections && (
          <div className="space-y-6 mt-6">
            {subsection1 !== `refundPage.sections.section${sectionNum}.subsection1.title` && (
              <div className="space-y-3">
                <h3 className="text-lg md:text-xl font-semibold text-[#111929]">
                  {subsection1}
                </h3>
                <div className="text-[#485A69] text-sm md:text-base leading-relaxed">
                  {processContent(subsection1Content, sectionNum)}
                </div>
              </div>
            )}
            {subsection2 !== `refundPage.sections.section${sectionNum}.subsection2.title` && (
              <div className="space-y-3">
                <h3 className="text-lg md:text-xl font-semibold text-[#111929]">
                  {subsection2}
                </h3>
                <div className="text-[#485A69] text-sm md:text-base leading-relaxed">
                  {processContent(subsection2Content, sectionNum)}
                </div>
              </div>
            )}
            {subsection3 !== `refundPage.sections.section${sectionNum}.subsection3.title` && (
              <div className="space-y-3">
                <h3 className="text-lg md:text-xl font-semibold text-[#111929]">
                  {subsection3}
                </h3>
                <div className="text-[#485A69] text-sm md:text-base leading-relaxed">
                  {processContent(subsection3Content, sectionNum)}
                </div>
              </div>
            )}
            {subsection4 !== `refundPage.sections.section${sectionNum}.subsection4.title` && (
              <div className="space-y-3">
                <h3 className="text-lg md:text-xl font-semibold text-[#111929]">
                  {subsection4}
                </h3>
                <div className="text-[#485A69] text-sm md:text-base leading-relaxed">
                  {processContent(subsection4Content, sectionNum)}
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
    </>
  )
}
