"use client"

import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import type { PublicCourse } from "@/lib/public-courses"
import { ProgramCard } from "@/components/programs/program-card"

/**
 * Landing from Figma #2346:21370.
 * - Moments collage + intro (static design assets in /public/landing)
 * - ZPassport section (bg #F5F5F5, app screenshots + 3 advantages)
 * - Trending Workshop / New Programs render REAL published courses
 *   in the 400×299 "similar" card variant (#2346:21455 / #2346:21512);
 *   the workshops section hides while no workshop-type course exists
 *   in the API (no fake cards). Carousel arrows are inert chrome
 *   (no prototype reactions in the design).
 */
export function LandingPage({
  programs,
  workshops,
}: {
  programs: PublicCourse[]
  workshops: PublicCourse[]
}) {
  const { t } = useLanguage()

  return (
    <main className="min-h-screen bg-white text-ink">
      <Navbar />

      {/* Moments collage — full-bleed edge to edge (Figma #2346:21399 is
          alignSelf:stretch on the 1440 canvas; side columns touch x=0/x=1440).
          12px radius + overflow-hidden clip the photos like the Figma frame. */}
      <section className="py-8" aria-hidden>
        <div className="flex h-[454px] gap-5 overflow-hidden rounded-xl">
          <img
            src="/landing/collage-left.jpg"
            alt=""
            className="hidden w-[300px] object-cover md:block"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            <div className="flex min-h-0 flex-1 gap-5">
              <img src="/landing/collage-tl.jpg" alt="" className="min-w-0 flex-1 object-cover" />
              <img src="/landing/collage-tr.jpg" alt="" className="min-w-0 flex-1 object-cover" />
            </div>
            <img
              src="/landing/collage-wide.jpg"
              alt=""
              className="h-[217px] w-full object-cover"
            />
          </div>
          <img
            src="/landing/collage-right.jpg"
            alt=""
            className="hidden w-[300px] object-cover md:block"
          />
        </div>
      </section>

      {/* Intro */}
      <section className="flex flex-col items-center gap-5 px-6 py-8 text-center md:px-[120px]">
        <h1 className="w-full text-[40px] font-semibold leading-tight text-ink">
          {t("landing.introTitle")}
        </h1>
        <p className="max-w-[884px] text-base leading-[1.5] text-ink">
          {t("landing.introSubtitle")}
        </p>
      </section>

      {/* ZPassport */}
      <section className="mt-8 bg-[#F5F5F5]">
        <div className="flex flex-col gap-12 px-6 pb-0 pt-20 md:px-[120px] lg:flex-row lg:gap-16">
          {/* Phones frame (Figma #2346:21418): 679×465, clips content.
              Both screenshots are the same image (imageHash 25588b14…),
              320×601 exact, object-cover (scaleMode fill), no corner radius. */}
          <div className="relative hidden h-[465px] w-[679px] shrink-0 overflow-hidden lg:block">
            <img
              src="/landing/zpassport-phone.jpg"
              alt="ZPassport app"
              className="absolute left-[10px] top-0 h-[601px] w-[320px] object-cover"
            />
            <img
              src="/landing/zpassport-phone.jpg"
              alt=""
              aria-hidden
              className="absolute left-[359px] top-[-136px] h-[601px] w-[320px] object-cover"
            />
          </div>
          <div className="flex flex-col gap-8 pb-20 lg:pb-0">
            <div className="flex flex-col gap-4">
              <p className="text-base font-semibold text-ink">{t("landing.introducing")}</p>
              <div className="flex items-center gap-1.5">
                <img src="/landing/zpassport-icon.svg" alt="" aria-hidden className="h-8 w-auto" />
                <img
                  src="/landing/zpassport-wordmark.svg"
                  alt="ZPassport"
                  className="h-12 w-auto"
                />
              </div>
              <p className="max-w-[884px] text-lg leading-[1.5] text-ink">
                {t("landing.zpassportBody")}
              </p>
            </div>
          </div>
        </div>

        {/* Advantages (Figma #2346:21430): 1440×302 fixed row, gap 10,
            A1 375 fixed + A2/A3 flex-1 (392.5 @1440), cards py-32/px-24
            gap-16, title 20/24 semibold, body 16/19, dividers #B0B0B0
            1×142 = content height between the 80px paddings. */}
        <div className="flex flex-col items-stretch gap-8 px-6 py-20 md:h-[302px] md:flex-row md:items-center md:justify-center md:gap-[10px] md:px-[120px] md:py-0">
          <div className="flex flex-col gap-4 md:w-[375px] md:shrink-0 md:px-6 md:py-8">
            <h2 className="text-center text-xl font-semibold leading-[24px] text-ink">
              {t("landing.advantage1Title")}
            </h2>
            <p className="text-center text-base md:leading-[19px] text-ink">
              {t("landing.advantage1Body")}
            </p>
          </div>
          <div aria-hidden className="hidden w-px bg-[#B0B0B0] md:block md:h-[142px]" />
          <div className="flex flex-col gap-4 md:min-w-0 md:flex-1 md:px-6 md:py-8">
            <h2 className="text-center text-xl font-semibold leading-[24px] text-ink">
              {t("landing.advantage2Title")}
            </h2>
            <p className="text-center text-base md:leading-[19px] text-ink">
              {t("landing.advantage2Body")}
            </p>
          </div>
          <div aria-hidden className="hidden w-px bg-[#B0B0B0] md:block md:h-[142px]" />
          <div className="flex flex-col gap-4 md:min-w-0 md:flex-1 md:px-6 md:py-8">
            <h2 className="text-center text-xl font-semibold leading-[24px] text-ink">
              {t("landing.advantage3Title")}
            </h2>
            <p className="text-center text-base md:leading-[19px] text-ink">
              {t("landing.advantage3Body")}
            </p>
          </div>
        </div>
      </section>

      {/* Trending Workshop — hidden until workshop-type courses exist.
          Section #2346:21450: pad 32/80, gap 32. Cards #2346:21455:
          space-between row of 3× 400×299 "similar"-variant cards
          (positions 0/440/880 in the 1280 content → 40px gaps).
          Arrows #2346:21503: bare 35×35 icon buttons (no chrome),
          right-aligned, gap 10, 32px below cards; left icon #B0B0B0,
          right icon #222222. Star rating on the strip is data-blocked
          (no rating API field) — omitted. */}
      {workshops.length > 0 ? (
        <section className="flex flex-col gap-8 px-6 py-8 md:px-20">
          <div className="flex items-end justify-between">
            <h2 className="text-[28px] font-semibold text-ink">{t("landing.trendingWorkshop")}</h2>
            <Link
              href="/workshops"
              aria-label={t("landing.seeAllWorkshops")}
              className="text-sm text-shade-500 underline-offset-4 hover:underline"
            >
              {t("landing.seeMore")}
            </Link>
          </div>
          <div className="flex flex-col gap-8">
            <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3 xl:gap-10">
              {workshops.slice(0, 3).map((c) => (
                <li key={c.id} className="w-full">
                  <ProgramCard course={c} variant="similar" />
                </li>
              ))}
            </ul>
            <div className="flex justify-end gap-[10px]">
              <button
                type="button"
                aria-label={t("landing.previous")}
                className="flex h-[35px] w-[35px] items-center justify-center text-[#B0B0B0]"
              >
                <ArrowLeft aria-hidden className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                aria-label={t("landing.next")}
                className="flex h-[35px] w-[35px] items-center justify-center text-[#222222]"
              >
                <ArrowRight aria-hidden className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {/* New Programs — same structure as Trending (#2346:21507:
          pad 32/80, gap 32; cards #2346:21512 3× 400×299 similar variant
          at 0/440/880; arrows #2346:21560 right-aligned bare 35×35). */}
      {programs.length > 0 ? (
        <section className="flex flex-col gap-8 px-6 py-8 md:px-20">
          <div className="flex items-end justify-between">
            <h2 className="text-[28px] font-semibold text-ink">{t("landing.newPrograms")}</h2>
            <Link
              href="/programs"
              aria-label={t("landing.seeAllPrograms")}
              className="text-sm text-shade-500 underline-offset-4 hover:underline"
            >
              {t("landing.seeMore")}
            </Link>
          </div>
          <div className="flex flex-col gap-8">
            <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3 xl:gap-10">
              {programs.slice(0, 3).map((c) => (
                <li key={c.id} className="w-full">
                  <ProgramCard course={c} variant="similar" />
                </li>
              ))}
            </ul>
            <div className="flex justify-end gap-[10px]">
              <button
                type="button"
                aria-label={t("landing.previous")}
                className="flex h-[35px] w-[35px] items-center justify-center text-[#B0B0B0]"
              >
                <ArrowLeft aria-hidden className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                aria-label={t("landing.next")}
                className="flex h-[35px] w-[35px] items-center justify-center text-[#222222]"
              >
                <ArrowRight aria-hidden className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <div className="h-20" />
      <Footer />
    </main>
  )
}
