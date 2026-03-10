"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PolicyNavigation } from "@/components/policy-navigation"
import { useLanguage } from "@/components/language-provider"

export default function DeleteAccountPage() {
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
                        <h1 className="text-white text-2xl sm:text-3xl md:text-5xl font-bold mb-2 drop-shadow-lg">
                            {t("deleteAccountPage.hero.title")}
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
                                {t("deleteAccountPage.hero.title")}
                            </h1>
                            <div className="border-b border-[#E5E7EB]"></div>
                        </div>

                        {/* Intro */}
                        <div className="space-y-4 pb-6 border-b border-[#E5E7EB]">
                            <p className="text-[#485A69] text-sm md:text-base leading-relaxed">
                                {t("deleteAccountPage.intro")}
                            </p>
                        </div>

                        {/* Steps */}
                        <div className="space-y-4 pb-6 border-b border-[#E5E7EB]">
                            <h2 className="text-2xl md:text-3xl font-semibold text-[#111929]">
                                {t("deleteAccountPage.steps.title")}
                            </h2>
                            <ol className="list-none space-y-4 pl-0">
                                {[1, 2, 3, 4].map((step) => (
                                    <li key={step} className="flex items-start gap-4">
                                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#0ABAB5] text-white flex items-center justify-center text-sm font-semibold">
                                            {step}
                                        </span>
                                        <span className="text-[#485A69] text-sm md:text-base leading-relaxed pt-1">
                                            {t(`deleteAccountPage.steps.step${step}`)}
                                        </span>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        {/* Important Note */}
                        <div className="space-y-4 pb-6 border-b border-[#E5E7EB]">
                            <h2 className="text-2xl md:text-3xl font-semibold text-[#111929]">
                                {t("deleteAccountPage.important.title")}
                            </h2>
                            <div className="bg-[#FFF7ED] border-l-4 border-[#F59E0B] rounded-r-lg p-4 md:p-6">
                                <p className="text-[#485A69] text-sm md:text-base leading-relaxed">
                                    {t("deleteAccountPage.important.content")}
                                </p>
                            </div>
                        </div>

                        {/* Contact Support */}
                        <div className="space-y-4 pb-6">
                            <h2 className="text-2xl md:text-3xl font-semibold text-[#111929]">
                                {t("deleteAccountPage.support.title")}
                            </h2>
                            <p className="text-[#485A69] text-sm md:text-base leading-relaxed">
                                {t("deleteAccountPage.support.content")}{" "}
                                <a
                                    href="mailto:support@classz.co"
                                    className="text-[#0ABAB5] hover:underline font-semibold"
                                >
                                    support@classz.co
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Navigation */}
            <PolicyNavigation align="center" title={t("deleteAccountPage.relatedPolicies")} titleSize="xl" />

            <Footer />
        </main>
    )
}
