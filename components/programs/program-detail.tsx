"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight, Heart, MapPin, MessageCircle, Share2 } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { districtLabel } from "@/lib/locations"
import { HOST_AVATAR, programImage } from "@/lib/program-images"
import type { PublicCourse, PublicClass } from "@/lib/public-courses"
import { formatTemplate } from "./format"
import { ClassOptionCard } from "./class-option-card"
import { ProgramCard } from "./program-card"

/**
 * Program detail from Figma #1895:7672 "Programs - more details" (capture:
 * Programs_-_more_details.figmacapture, 2026-08-21).
 *
 * Hero #1895:7700 — pad 32/120, primaryAxisAlign space-between (NOT a 64px
 * gap: 120+530+15+655+120 = 1440 ✓). Gallery #2652:24302 530 wide: image
 * 530×705 r12 + overlay chrome inset 16. Right column #1895:7713 655 wide,
 * px-16, gap 32: info (gap 12.51) / hosted-by / options strip.
 *
 * Data-blocked omissions (see docs/Figma_Fidelity_Workflow.md): language
 * row, rating + review counts, strike-through price. Gallery photo, host
 * avatar and classmate avatars are static placeholders from the design
 * capture (lib/program-images.ts) until the API serves real ones. The
 * hidden "Option 2" frame #1895:7962 (visible:false) is not built.
 */
export function ProgramDetail({
  course,
  classes,
  similar,
}: {
  course: PublicCourse
  classes: PublicClass[]
  similar: PublicCourse[]
}) {
  const { t, locale } = useLanguage()

  const price = course.price != null ? Number(course.price) : null
  const district = districtLabel(course.location, locale)
  const instructor = classes[0]?.instructor ?? course.instructor

  return (
    <main className="min-h-screen bg-white text-ink">
      <Navbar />

      {/* node 1895:7700 — hero, pad 32/120, justify-between */}
      <div className="flex flex-col gap-8 px-6 py-8 md:px-[120px] lg:flex-row lg:justify-between lg:gap-0">
        {/* node 2652:24302 — gallery 530 wide */}
        <div className="w-full shrink-0 lg:w-[530px]">
          <div
            className="relative h-[705px] max-lg:h-[420px] w-full overflow-hidden rounded-[12px] bg-classz-50"
            data-testid="detail-gallery"
          >
            {/* node 2652:24303 — image fill (scaleMode fill → object-cover).
                Placeholder photo from the design capture until the API
                serves per-program images. */}
            <img
              src={programImage(course.id)}
              alt={course.name}
              className="absolute inset-0 h-full w-full object-cover"
            />

            {/* Overlay chrome (decorative until galleries exist) — inset 16 */}
            <div aria-hidden className="pointer-events-none absolute inset-[16px] flex flex-col justify-between">
              {/* node 2652:24305 — top-right: 3 × 35×35 r100, white,
                  #EBEBEB stroke 1px, gap 10 */}
              <div className="flex justify-end gap-[10px]">
                {[Share2, MessageCircle, Heart].map((Icon, i) => (
                  <span
                    key={i}
                    className="flex h-[35px] w-[35px] items-center justify-center rounded-full border border-[#EBEBEB] bg-white"
                  >
                    <Icon className="h-[16px] w-[16px] text-[#5E5E5E]" strokeWidth={1.6} />
                  </span>
                ))}
              </div>

              {/* node 2652:24324 — middle arrows: 35×35 r100 fill #EBEBEB,
                  justify-between */}
              <div className="flex items-center justify-between">
                <span className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-[#EBEBEB]">
                  <ChevronLeft className="h-[16px] w-[16px] text-[#5E5E5E]" strokeWidth={1.6} />
                </span>
                <span className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-[#EBEBEB]">
                  <ChevronRight className="h-[16px] w-[16px] text-[#5E5E5E]" strokeWidth={1.6} />
                </span>
              </div>

              {/* node 2652:24327 — bottom dots: 3 × 6px, gap 15.5 (49 wide) */}
              <div className="flex items-center justify-center gap-[15.5px]">
                <span className="h-[6px] w-[6px] rounded-full bg-white" />
                <span className="h-[6px] w-[6px] rounded-full bg-white opacity-60" />
                <span className="h-[6px] w-[6px] rounded-full bg-white opacity-60" />
              </div>
            </div>
          </div>
        </div>

        {/* node 1895:7713 — right column, w655, px-16, gap 32 */}
        <div className="flex w-full flex-col gap-[32px] lg:w-[655px] lg:max-w-[655px] lg:shrink-0 lg:px-[16px]">
          {/* node 1895:7714 — info block, gap 12.51 */}
          <div className="flex flex-col gap-[12.51px]">
            <h1 className="text-[24px] font-[weight:590] leading-[29px] text-ink">
              {course.name}
            </h1>

            {/* node 1895:7720 — price row h24, gap 5: 20px #222 · dot 2.5 ·
                age 20/400 #5E5E5E (strike-through price omitted — single
                price in API) */}
            <p className="flex h-[24px] items-center gap-[5px] text-[20px] leading-none">
              {price != null ? (
                <span className="font-normal text-ink">${Number(price.toFixed(0))}</span>
              ) : null}
              {price != null && course.age_tag ? (
                <span aria-hidden className="h-[2.5px] w-[2.5px] shrink-0 rounded-full bg-[#5E5E5E]" />
              ) : null}
              {course.age_tag ? (
                <span className="font-normal text-[#5E5E5E]">
                  {formatTemplate(t, "programs.ageLabel", { age: course.age_tag })}
                </span>
              ) : null}
            </p>

            {/* node 1895:7725 — intro 14/400 #5E5E5E, w483 */}
            {course.intro ? (
              <p className="max-w-[483px] text-[14px] font-normal leading-[17px] text-[#5E5E5E]">
                {course.intro}
              </p>
            ) : null}

            {/* node 1895:7726 — language row omitted (no API field) */}

            {/* node 1895:7737 — location row: icon 20.02 + 12/400 #5E5E5E,
                gap 5 */}
            {district ? (
              <p className="flex items-center gap-[5px] text-[12px] font-normal text-[#5E5E5E]">
                <MapPin aria-hidden className="h-[20.02px] w-[20.02px] text-[#5E5E5E]" strokeWidth={1.16} />
                {district}
              </p>
            ) : null}
          </div>

          {/* node 2652:24202 — hosted by, gap 16 */}
          {instructor ? (
            <section aria-label={t("programs.hostedBy")} className="flex flex-col gap-[16px]">
              <h2 className="text-[16px] font-[weight:590] leading-none text-black">
                {t("programs.hostedBy")}
              </h2>
              {/* node 2652:24204 — row gap 20, px-16: avatar 50 r100 (design
                  photo placeholder — no avatar API), name 14/590 #222
                  (2652:24208); rating block omitted */}
              <div className="flex items-center gap-[20px] px-[16px]">
                <img
                  src={HOST_AVATAR}
                  alt=""
                  aria-hidden
                  className="h-[50px] w-[50px] shrink-0 rounded-full object-cover"
                />
                <p className="text-[14px] font-[weight:590] leading-[17px] text-ink">
                  {instructor}
                </p>
              </div>
            </section>
          ) : null}

          {/* node 1895:7745 — options strip: cards col w605 gap 20 inside
              376.92px scroll area (thumb 8px #C1C1C1 r4 — node 1895:7904) */}
          {classes.length > 0 ? (
            <section aria-label="Sessions" className="relative">
              <div
                className="detail-options-scroll flex max-h-[376.92px] flex-col gap-[20px] overflow-y-auto"
                data-testid="detail-options"
              >
                {classes.map((cls) => (
                  <ClassOptionCard key={cls.id} cls={cls} price={price} />
                ))}
              </div>
            </section>
          ) : (
            <p className="text-sm text-[#5E5E5E]">{t("programs.noSessions")}</p>
          )}
        </div>
      </div>

      {/* node 2834:18822 — similar programs, pad 0/80, gap 32 */}
      {similar.length > 0 ? (
        <section
          className="flex flex-col gap-[32px] px-0 py-8 lg:px-[80px]"
          aria-labelledby="similar-heading"
          data-testid="similar-section"
        >
          {/* node 2834:18823 — header row: 28/590 #000 + 16/400 #5E5E5E */}
          <div className="flex items-end justify-between">
            <h2 id="similar-heading" className="text-[28px] font-[weight:590] leading-none text-black">
              {t("programs.similarPrograms")}
            </h2>
            <Link
              href="/programs"
              className="text-[16px] font-normal leading-none text-[#5E5E5E] underline-offset-4 hover:underline"
            >
              {t("programs.seeMore")}
            </Link>
          </div>

          {/* node 2834:18826 — cards block gap 32: strip (3×400 + 2×40 =
              1280 ✓) + pagination h35 justify-end */}
          <div className="flex flex-col gap-[32px]">
            <ul className="flex gap-[40px] overflow-x-auto pb-1" data-testid="similar-cards">
              {similar.map((c) => (
                <li key={c.id} className="shrink-0">
                  <ProgramCard course={c} variant="similar" />
                </li>
              ))}
            </ul>

            {/* node 2834:18875 — pagination: 2 × 35×35 r100, gap 10,
                right-aligned (visual chrome — no paging data yet) */}
            <div aria-hidden className="hidden justify-end gap-[10px] lg:flex">
              <span className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-[#EBEBEB]">
                <ChevronLeft className="h-[16px] w-[16px] text-[#5E5E5E]" strokeWidth={1.6} />
              </span>
              <span className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-[#EBEBEB]">
                <ChevronRight className="h-[16px] w-[16px] text-[#5E5E5E]" strokeWidth={1.6} />
              </span>
            </div>
          </div>
        </section>
      ) : null}

      <Footer />
    </main>
  )
}
