"use client"

import Link from "next/link"
import React, { useEffect } from "react"
import { usePathname } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PolicyNavigation } from "@/components/policy-navigation"
import { useLanguage } from "@/components/language-provider"
import { PolicySection } from "@/components/policy-section"

export default function TermsPage() {
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
                            {t("termsPage.hero.title")}
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
                                {t("termsPage.hero.title")}
                            </h1>
                            <p className="text-[#111929] text-sm md:text-base mb-4">
                                {t("termsPage.hero.lastUpdated")}
                            </p>
                            <div className="border-b border-[#E5E7EB]"></div>
                        </div>
                        <TermsContent t={t} />
                    </div>
                </div>
            </section>

            {/* Navigation */}
            <PolicyNavigation align="center" title="These might help you" titleSize="xl" />

            <Footer />
        </main>
    )
}

function TermsContent({ t }: { t: (key: string) => string }) {
    // Process content to highlight links, ClassZ (only in section 1), and "not"
    const processContent = (text: string, sectionNum: number): React.ReactNode => {
            if (!text) return text

            let processed = text

            // Highlight only the first occurrence of ClassZ in teal, but only in section 1
            if (sectionNum === 1) {
                processed = processed.replace(/\bClassZ\b/, "<CLASSZ_HIGHLIGHT>ClassZ</CLASSZ_HIGHLIGHT>")
            }

            // Highlight "twenty-four (24) hours" in teal
            processed = processed.replace(/twenty-four \(24\) hours/gi, "<HOURS_HIGHLIGHT>twenty-four (24) hours</HOURS_HIGHLIGHT>")

            // Highlight specific phrases in section 7
            if (sectionNum === 7) {
                processed = processed.replace(/informational and reflective purposes only\./gi, "<PURPOSE_HIGHLIGHT>informational and reflective purposes only.</PURPOSE_HIGHLIGHT>")
                processed = processed.replace(/not based on standardized or evidence-based assessment frameworks\./gi, "<FRAMEWORK_HIGHLIGHT>not based on standardized or evidence-based assessment frameworks.</FRAMEWORK_HIGHLIGHT>")
            }

            // Highlight "not" in bullet points (lines starting with •), but only in section 2
            if (sectionNum === 2) {
                processed = processed.split('\n').map(line => {
                    if (line.trim().startsWith('•')) {
                        // Only highlight "not" in bullet points
                        return line.replace(/\bnot\b/gi, "<NOT_HIGHLIGHT>not</NOT_HIGHLIGHT>")
                    }
                    return line
                }).join('\n')
            }

            // Split by Privacy Policy patterns
            const privacyPatterns = [
                { pattern: "our Privacy Policy", replacement: "<PRIVACY_LINK>our Privacy Policy</PRIVACY_LINK>" },
                { pattern: "Privacy Policy", replacement: "<PRIVACY_LINK>Privacy Policy</PRIVACY_LINK>" }
            ]

            for (const { pattern, replacement } of privacyPatterns) {
                processed = processed.replace(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement)
            }

            // Split by email pattern
            const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g
            processed = processed.replace(emailRegex, "<EMAIL_LINK>$1</EMAIL_LINK>")

            // Convert to React elements
            const parts: React.ReactNode[] = []
            const segments = processed.split(/(<CLASSZ_HIGHLIGHT>.*?<\/CLASSZ_HIGHLIGHT>|<HOURS_HIGHLIGHT>.*?<\/HOURS_HIGHLIGHT>|<PURPOSE_HIGHLIGHT>.*?<\/PURPOSE_HIGHLIGHT>|<FRAMEWORK_HIGHLIGHT>.*?<\/FRAMEWORK_HIGHLIGHT>|<NOT_HIGHLIGHT>.*?<\/NOT_HIGHLIGHT>|<PRIVACY_LINK>.*?<\/PRIVACY_LINK>|<EMAIL_LINK>.*?<\/EMAIL_LINK>)/g)

            segments.forEach((segment, idx) => {
                if (segment.startsWith("<CLASSZ_HIGHLIGHT>")) {
                    const text = segment.replace(/<\/?CLASSZ_HIGHLIGHT>/g, "")
                    parts.push(
                        <span
                            key={`classz-${idx}`}
                            className="text-[#0ABAB5] font-semibold"
                        >
                            {text}
                        </span>
                    )
                } else if (segment.startsWith("<HOURS_HIGHLIGHT>")) {
                    const text = segment.replace(/<\/?HOURS_HIGHLIGHT>/g, "")
                    parts.push(
                        <span
                            key={`hours-${idx}`}
                            className="text-[#0ABAB5] font-semibold"
                        >
                            {text}
                        </span>
                    )
                } else if (segment.startsWith("<PURPOSE_HIGHLIGHT>")) {
                    const text = segment.replace(/<\/?PURPOSE_HIGHLIGHT>/g, "")
                    parts.push(
                        <span
                            key={`purpose-${idx}`}
                            className="text-[#0ABAB5] font-semibold"
                        >
                            {text}
                        </span>
                    )
                } else if (segment.startsWith("<FRAMEWORK_HIGHLIGHT>")) {
                    const text = segment.replace(/<\/?FRAMEWORK_HIGHLIGHT>/g, "")
                    parts.push(
                        <span
                            key={`framework-${idx}`}
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
                } else if (segment.startsWith("<PRIVACY_LINK>")) {
                    const text = segment.replace(/<\/?PRIVACY_LINK>/g, "")
                    parts.push(
                        <a
                            key={`privacy-${idx}`}
                            href="/privacy"
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
        const title = t(`termsPage.sections.section${sectionNum}.title`)
        const content = t(`termsPage.sections.section${sectionNum}.content`)

        // Skip if section doesn't exist
        if (title === `termsPage.sections.section${sectionNum}.title`) {
            return null
        }

        // Check for subsections
        const subsection1 = t(`termsPage.sections.section${sectionNum}.subsection1.title`)
        const subsection1Content = t(`termsPage.sections.section${sectionNum}.subsection1.content`)
        const subsection2 = t(`termsPage.sections.section${sectionNum}.subsection2.title`)
        const subsection2Content = t(`termsPage.sections.section${sectionNum}.subsection2.content`)
        const subsection3 = t(`termsPage.sections.section${sectionNum}.subsection3.title`)
        const subsection3Content = t(`termsPage.sections.section${sectionNum}.subsection3.content`)
        const subsection4 = t(`termsPage.sections.section${sectionNum}.subsection4.title`)
        const subsection4Content = t(`termsPage.sections.section${sectionNum}.subsection4.content`)

        const hasSubsections = subsection1 !== `termsPage.sections.section${sectionNum}.subsection1.title`

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
                        {subsection1 !== `termsPage.sections.section${sectionNum}.subsection1.title` && (
                            <div className="space-y-3">
                                <h3 className="text-lg md:text-xl font-semibold text-[#111929]">
                                    {subsection1}
                                </h3>
                                <div className="text-[#485A69] text-sm md:text-base leading-relaxed whitespace-pre-line">
                                    {processContent(subsection1Content, sectionNum)}
                                </div>
                            </div>
                        )}
                        {subsection2 !== `termsPage.sections.section${sectionNum}.subsection2.title` && (
                            <div className="space-y-3">
                                <h3 className="text-lg md:text-xl font-semibold text-[#111929]">
                                    {subsection2}
                                </h3>
                                <div className="text-[#485A69] text-sm md:text-base leading-relaxed whitespace-pre-line">
                                    {processContent(subsection2Content, sectionNum)}
                                </div>
                            </div>
                        )}
                        {subsection3 !== `termsPage.sections.section${sectionNum}.subsection3.title` && (
                            <div className="space-y-3">
                                <h3 className="text-lg md:text-xl font-semibold text-[#111929]">
                                    {subsection3}
                                </h3>
                                <div className="text-[#485A69] text-sm md:text-base leading-relaxed whitespace-pre-line">
                                    {processContent(subsection3Content, sectionNum)}
                                </div>
                            </div>
                        )}
                        {subsection4 !== `termsPage.sections.section${sectionNum}.subsection4.title` && (
                            <div className="space-y-3">
                                <h3 className="text-lg md:text-xl font-semibold text-[#111929]">
                                    {subsection4}
                                </h3>
                                <div className="text-[#485A69] text-sm md:text-base leading-relaxed whitespace-pre-line">
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
            {renderSection(12)}
            {renderSection(13)}
            {renderSection(14)}
            <PolicySection
                title={t("sharedSection.contactUs.title")}
                content={t("sharedSection.contactUs.content")}
                processContent={(text) => processContent(text, 15)}
                sectionNum={15}
            />
        </>
    )
}
