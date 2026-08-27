"use client";

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ArrowRight, Check } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export default function OurMissionPage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 selection:bg-teal-100">
      <Navbar />

      {/* Hero — collage + intro, matching the landing top (no black bg or
          overlay). Collage is decorative; title/subtitle sit below. */}
      <div className="mx-auto flex w-full max-w-[1440px] flex-col md:gap-[34px]">
        <section className="py-8 lg:py-0" aria-hidden>
          {/* mobile collage */}
          <div className="flex aspect-[1440/454] w-full gap-[5px] overflow-hidden rounded-xl lg:hidden">
            <img
              src="/landing/collage-left.jpg?v=2408b"
              alt=""
              className="w-[20.8%] object-cover"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
              <div className="flex min-h-0 h-[calc(50%-2.5px)] gap-[5px]">
                <img
                  src="/landing/collage-tl.jpg?v=2408b"
                  alt=""
                  className="min-w-0 flex-1 object-cover"
                />
                <img
                  src="/landing/collage-tr.jpg?v=2408b"
                  alt=""
                  className="min-w-0 flex-1 object-cover"
                />
              </div>
              <img
                src="/landing/collage-wide.jpg?v=2408b"
                alt=""
                className="h-[calc(50%-2.5px)] w-full object-cover"
              />
            </div>
            <img
              src="/landing/collage-right.jpg?v=2408b"
              alt=""
              className="w-[20.8%] object-cover"
            />
          </div>
          {/* desktop collage */}
          <div className="hidden h-[454px] gap-5 overflow-hidden rounded-xl lg:flex">
            <img
              src="/landing/collage-left.jpg?v=2408b"
              alt=""
              className="hidden w-[300px] object-cover lg:block"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-5">
              <div className="flex min-h-0 flex-1 gap-5">
                <img
                  src="/landing/collage-tl.jpg?v=2408b"
                  alt=""
                  className="min-w-0 flex-1 object-cover"
                />
                <img
                  src="/landing/collage-tr.jpg?v=2408b"
                  alt=""
                  className="min-w-0 flex-1 object-cover"
                />
              </div>
              <img
                src="/landing/collage-wide.jpg?v=2408b"
                alt=""
                className="h-[217px] w-full object-cover"
              />
            </div>
            <img
              src="/landing/collage-right.jpg?v=2408b"
              alt=""
              className="hidden w-[300px] object-cover lg:block"
            />
          </div>
        </section>

        {/* intro — title 40/590 + subtitle 20/30 (same as landing intro) */}
        <section className="flex flex-col items-center gap-4 px-6 py-8 text-center md:px-[120px] md:py-[32px] md:gap-[16px]">
          <h1 className="w-full text-[40px] font-[weight:590] leading-[48px] text-ink">
            {t("mission.hero.title1")}
            <br />
            {t("mission.hero.title2")}
          </h1>
          <p className="max-w-[884px] text-[20px] font-normal leading-[30px] text-ink">
            {t("mission.hero.subtitle")}
          </p>
        </section>
      </div>

      {/* Logo Cloud Section */}
      <section className="bg-white py-10 md:py-14 overflow-x-hidden">
        <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 md:px-10">
          <div className="relative w-full overflow-hidden">
            <div className="flex items-center min-w-0">
              {/* Fixed left section: Funded by, Cyberport logo, Trusted by */}
              <div className="flex items-center gap-3 sm:gap-6 md:gap-10 lg:gap-12 flex-shrink-0 z-10 bg-white pr-3 sm:pr-6 md:pr-10 lg:pr-12">
                {/* <span className="text-xs sm:text-base md:text-lg font-semibold text-gray-300 whitespace-nowrap">{t("mission.marquee.fundedBy")}</span>
                <img src="/Cyberport_Logo_Master-01-2.png" alt="Funded by Cyberport" className="h-10 sm:h-14 md:h-16 lg:h-20 w-auto flex-shrink-0" /> */}
                <span className="text-xs sm:text-base md:text-lg font-semibold text-gray-300 whitespace-nowrap">
                  {t("mission.marquee.trustedBy")}
                </span>
              </div>

              {/* Moving center logos section - takes remaining space */}
              <div className="flex-1 overflow-hidden min-w-0">
                <div className="logo-marquee flex items-center gap-4 sm:gap-6 md:gap-10 lg:gap-12">
                  <img
                    src="/logo2.png"
                    alt="Trusted partner 1"
                    className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto flex-shrink-0"
                  />
                  <img
                    src="/logo3.png"
                    alt="Trusted partner 2"
                    className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto flex-shrink-0"
                  />
                  <img
                    src="/logo4.png"
                    alt="Trusted partner 3"
                    className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto flex-shrink-0"
                  />
                  <img
                    src="/logo5.png"
                    alt="Trusted partner 4"
                    className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto flex-shrink-0"
                  />
                  <img
                    src="/logo6.png"
                    alt="Trusted partner 5"
                    className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto flex-shrink-0"
                  />

                  {/* duplicate sequence for seamless marquee */}
                  <img
                    src="/logo2.png"
                    alt="Trusted partner 1 duplicate"
                    className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto flex-shrink-0"
                    aria-hidden="true"
                  />
                  <img
                    src="/logo3.png"
                    alt="Trusted partner 2 duplicate"
                    className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto flex-shrink-0"
                    aria-hidden="true"
                  />
                  <img
                    src="/logo4.png"
                    alt="Trusted partner 3 duplicate"
                    className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto flex-shrink-0"
                    aria-hidden="true"
                  />
                  <img
                    src="/logo5.png"
                    alt="Trusted partner 4 duplicate"
                    className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto flex-shrink-0"
                    aria-hidden="true"
                  />
                  <img
                    src="/logo6.png"
                    alt="Trusted partner 5 duplicate"
                    className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto flex-shrink-0"
                    aria-hidden="true"
                  />
                </div>
              </div>
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
                <p className="text-2xl md:text-3xl font-semibold text-[#485A69]">
                  {t("mission.collage.from")}
                </p>
                <h2 className="text-3xl md:text-4xl font-bold text-[#111929]">
                  {t("mission.collage.title")}
                </h2>
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
              {t("mission.discovery.badge")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#111929]">
              {t("mission.discovery.title")}
            </h2>
            <p className="text-base md:text-lg text-[#485A69] leading-relaxed">
              {t("mission.discovery.description")}
            </p>
            <ul className="space-y-3 text-[#111929]">
              <li className="flex items-start gap-3 text-base md:text-lg">
                <Check className="w-5 h-5 text-[#0ABAB5] mt-1" />
                <span>{t("mission.discovery.bullet1")}</span>
              </li>
              <li className="flex items-start gap-3 text-base md:text-lg">
                <Check className="w-5 h-5 text-[#0ABAB5] mt-1" />
                <span>{t("mission.discovery.bullet2")}</span>
              </li>
              <li className="flex items-start gap-3 text-base md:text-lg">
                <Check className="w-5 h-5 text-[#0ABAB5] mt-1" />
                <span>{t("mission.discovery.bullet3")}</span>
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
              {t("mission.booking.badge")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#111929]">
              {t("mission.booking.title")}
            </h2>
            <p className="text-base md:text-lg text-[#485A69] leading-relaxed">
              {t("mission.booking.description")}
            </p>
            <ul className="space-y-3 text-[#111929]">
              <li className="flex items-start gap-3 text-base md:text-lg">
                <Check className="w-5 h-5 text-[#0ABAB5] mt-1" />
                <span>{t("mission.booking.bullet1")}</span>
              </li>
              <li className="flex items-start gap-3 text-base md:text-lg">
                <Check className="w-5 h-5 text-[#0ABAB5] mt-1" />
                <span>{t("mission.booking.bullet2")}</span>
              </li>
              <li className="flex items-start gap-3 text-base md:text-lg">
                <Check className="w-5 h-5 text-[#0ABAB5] mt-1" />
                <span>{t("mission.booking.bullet3")}</span>
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
              {t("mission.progress.badge")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#111929]">
              {t("mission.progress.title")}
            </h2>
            <p className="text-base md:text-lg text-[#485A69] leading-relaxed">
              {t("mission.progress.description")}
            </p>
            <ul className="space-y-3 text-[#111929]">
              <li className="flex items-start gap-3 text-base md:text-lg">
                <Check className="w-5 h-5 text-[#0ABAB5] mt-1" />
                <span>{t("mission.progress.bullet1")}</span>
              </li>
              <li className="flex items-start gap-3 text-base md:text-lg">
                <Check className="w-5 h-5 text-[#0ABAB5] mt-1" />
                <span>{t("mission.progress.bullet2")}</span>
              </li>
              <li className="flex items-start gap-3 text-base md:text-lg">
                <Check className="w-5 h-5 text-[#0ABAB5] mt-1" />
                <span>{t("mission.progress.bullet3")}</span>
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
              {t("mission.steps.badge")}
            </span>
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-bold text-[#111929]">
                {t("mission.steps.title")}
              </h2>
              <p className="text-base md:text-lg text-[#485A69]">
                {t("mission.steps.description")}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-[#F7FCFB] rounded-[28px] overflow-hidden">
              <img
                src="/m6.png"
                alt="Browse classes preview"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="bg-[#F7FCFB] rounded-[28px] overflow-hidden">
              <img
                src="/m7.png"
                alt="Book class preview"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="bg-[#F7FCFB] rounded-[28px] overflow-hidden">
              <img
                src="/m8.png"
                alt="Track progress preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why Families Choose Section */}
      <section className="bg-white py-14 md:py-20">
        <div className="max-w-[1280px] mx-auto w-full px-4 sm:px-6 md:px-10 space-y-10 md:space-y-14">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold text-[#2F2F2F]">
              {t("mission.why.title")}
            </h2>
            <p className="text-base md:text-lg text-[#4B4B4B]">
              {t("mission.why.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-10 text-center text-[#2F2F2F]">
            <div className="space-y-3">
              <h3 className="text-4xl md:text-5xl font-medium">01</h3>
              <div className="h-[1px] bg-[#E0E0E0] w-full" />
              <div className="space-y-2">
                <p className="text-2xl font-semibold">
                  {t("mission.why.item1.title")}
                </p>
                <p className="text-sm md:text-base text-[#4B4B4B]">
                  {t("mission.why.item1.description")}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-4xl md:text-5xl font-medium">02</h3>
              <div className="h-[1px] bg-[#E0E0E0] w-full" />
              <div className="space-y-2">
                <p className="text-2xl font-semibold">
                  {t("mission.why.item2.title")}
                </p>
                <p className="text-sm md:text-base text-[#4B4B4B]">
                  {t("mission.why.item2.description")}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-4xl md:text-5xl font-medium">03</h3>
              <div className="h-[1px] bg-[#E0E0E0] w-full" />
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <p className="text-2xl font-semibold">
                    {t("mission.why.item3.title")}
                  </p>
                  <span className="inline-block bg-[#0ABAB5] text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Beta
                  </span>
                </div>
                <p className="text-sm md:text-base text-[#4B4B4B]">
                  {t("mission.why.item3.description")}
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
            {t("mission.cta.badge")}
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E1E1E]">
              {t("mission.cta.title")}
            </h2>
            <p className="text-base md:text-lg text-[#3F4A53]">
              {t("mission.cta.description")}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://apps.apple.com/app/classz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-[#0ABAB5] text-white text-base md:text-lg font-semibold shadow-[0_10px_28px_rgba(0,186,181,0.3)] hover:bg-[#00b3a3] transition"
            >
              {t("mission.cta.primary")}
              <ArrowRight className="w-5 h-5" />
            </a>
            <Link
              href="/our-features"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-[#3F4A53] text-base md:text-lg font-semibold hover:bg-white/60 transition"
            >
              {t("mission.cta.secondary")}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="pt-4 text-sm text-[#3F4A53] flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#0ABAB5]" />
              {t("mission.cta.point1")}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#0ABAB5]" />
              {t("mission.cta.point2")}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#0ABAB5]" />
              {t("mission.cta.point3")}
            </span>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
