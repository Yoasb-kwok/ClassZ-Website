"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CENTRES } from "@/lib/centre-data";
import { districtLabel } from "@/lib/locations";
import { HOST_AVATAR, programImage } from "@/lib/program-images";
import type { PublicCourse, PublicClass } from "@/lib/public-courses";
import { formatTemplate } from "./format";
import { ClassOptionCard } from "./class-option-card";
import { ProgramCard } from "./program-card";

/**
 * Program detail from Figma #1895:7672 "Programs - more details" (capture:
 * Programs_-_more_details.figmacapture, re-diffed 2026-08-24).
 *
 * Hero #1895:7700 (h881) — pad 32/120, space-between (stated gap 64 is
 * overridden by space-between: effective gap 15, 120+530+15+655+120 = 1440 ✓).
 * Gallery #2652:24302/03 530×817 r12 image, pad 16, vertical space-between
 * with an EMPTY 35px top slot #2652:24304 (keeps arrows centered) — the
 * share/message/heart buttons moved to the right-column top (#3872:18230).
 * Arrows #2652:24325/26 #EBEBEB 60% alpha; dots #2652:24327: 4×6px + 1×4px,
 * gaps 5/5/5/6, first #FFFFFF, rest #DDDDDD.
 *
 * Right column #1895:7713 655 wide, px-16, gap 32: action row #3872:18230 /
 * info #1895:7714 (gap 16) / hosted-by #2652:24202 / options #1895:7745
 * (605px col, gap 32, 445.98px viewport + 8×57 r4 #C1C1C1 thumb #1895:7904,
 * 10px gutter: 605+10+8 = 623 ✓).
 *
 * Similar #2834:18822 — root gap 32 (mt-[32px]), pad 0/80, gap 32; strip
 * #3810:20016 3×400 space-between (effective gap 40); pagination #2834:18875.
 *
 * Data-blocked omissions: language rows (#1981:7570 in cards, #1895:7726 in
 * detail), star ratings (#2471:15553, #2652:24209, #3810:20036), strike-
 * through price, SEN badge (#3810:20019). Gallery photo, host avatar and
 * classmate avatars are static placeholders (lib/program-images.ts) until
 * the API serves real ones. Hidden "Option 2" #1895:7962 is not built.
 *
 * Workshop mirror #1988:7824 (capture workshop_-_more_details, W5 2026-08-24):
 * same skeleton via variant="workshop" — hero #3873:18835 (pad 32/120,
 * space-between), gallery #3873:18836/37, right col #3873:18849 (ovf hidden
 * — inert, content sums to 817), info #3873:18870, hosted #3873:18891/93,
 * options #3985:5293/94 (same 1981:7xxx card instances) + thumb #3985:5297,
 * similar #2834:19101 ("Recommended Programs" — same copy). Per-screen delta:
 * location text 12/400 lh14 (#3873:18890; the program frame says 14).
 * Second card's Enroll h32 (vs 37) is a designer quirk — one button spec
 * per W2 basis. No workshop-expand frame exists; the card keeps the shared
 * expand interaction (spec-silent, noted in INDEX).
 */
export function ProgramDetail({
  course,
  classes,
  similar,
  prices,
  expandLessonDates = false,
  variant = "program",
}: {
  course: PublicCourse;
  classes: PublicClass[];
  similar: PublicCourse[];
  /** Real per-course prices (detail-endpoint fetch in the route) — the
   *  list API omits `price`; keyed by course id. */
  prices?: Record<number, number>;
  /** /programs listing cards link with ?dates=1 — class option cards start
   *  in the W3 expanded state. */
  expandLessonDates?: boolean;
  /** "workshop" = #1988:7824 mirror — only the location row differs (12px) */
  variant?: "program" | "workshop";
}) {
  const { t, locale } = useLanguage();

  const price = course.price != null ? Number(course.price) : null;
  const district = course.venue || districtLabel(course.location, locale);
  const instructor = classes[0]?.instructor ?? course.instructor;
  const centre = CENTRES.find((c) => c.id === course.center_id);
  const centreName = centre?.name ?? instructor;
  const centreRating = centre?.rating ?? "4.91";

  return (
    <main className="min-h-screen bg-white text-ink">
      <Navbar />

      {/* Root 1895:7672 is w1440 fixed — cap content at the design width
          and center on wider viewports (Option A, same as the listing);
          navbar/footer stay full-width. Without the cap the hero's
          justify-between stretches the 15px design gap on >1440 screens. */}
      <div className="lg:mx-auto lg:max-w-[1440px]">
        {/* node 1895:7700 — hero h881, pad 32/120/32/120 plus the root's
            32px navbar→hero gap = 64px total top spacing (justify-between) */}
        <div className="flex flex-col gap-8 px-6 pt-[64px] pb-8 md:px-[120px] lg:flex-row lg:justify-between lg:gap-0">
          {/* node 2652:24302 — gallery 530×817 */}
          <div className="w-full shrink-0 lg:w-[530px]">
            <div
              className="relative h-[705px] max-lg:h-[420px] w-full overflow-hidden rounded-[12px] bg-classz-50 lg:h-[817px]"
              data-testid="detail-gallery"
            >
              {/* node 2652:24303 — image fill (scaleMode fill → object-cover).
                Placeholder photo from the design capture until the API
                serves per-program images. */}
              <img
                src={programImage(course.id, course.image_url)}
                alt={course.name}
                className="absolute inset-0 h-full w-full object-cover"
              />

              {/* Overlay chrome (decorative until galleries exist) — inset 16 */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-[16px] flex flex-col justify-between"
              >
                {/* node 2652:24304 — vacated 35px slot: the share/message/
                  heart buttons moved to the right column (#3872:18230) in
                  the 2408 update; empty spacer keeps the arrows centered */}
                <div className="h-[35px]" />

                {/* node 2652:24324 — middle arrows: 35×35 r100 #EBEBEB 60%,
                  justify-between */}
                <div className="flex items-center justify-between">
                  <span className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-[#EBEBEB]/60">
                    <ChevronLeft
                      className="h-[16px] w-[16px] text-[#5E5E5E]"
                      strokeWidth={1.6}
                    />
                  </span>
                  <span className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-[#EBEBEB]/60">
                    <ChevronRight
                      className="h-[16px] w-[16px] text-[#5E5E5E]"
                      strokeWidth={1.6}
                    />
                  </span>
                </div>

                {/* node 2652:24327 — dots: 4×6px (gap 5) + 4px (gap 6),
                  49 wide, centered; active #FFFFFF, rest #DDDDDD */}
                <div className="flex items-center justify-center gap-[5px]">
                  <span className="h-[6px] w-[6px] rounded-full bg-white" />
                  <span className="h-[6px] w-[6px] rounded-full bg-[#DDDDDD]" />
                  <span className="h-[6px] w-[6px] rounded-full bg-[#DDDDDD]" />
                  <span className="h-[6px] w-[6px] rounded-full bg-[#DDDDDD]" />
                  <span className="ml-[1px] h-[4px] w-[4px] rounded-full bg-[#DDDDDD]" />
                </div>
              </div>
            </div>
          </div>

          {/* node 1895:7713 — right column, w655, px-16, gap 32 */}
          <div className="flex w-full flex-col gap-[32px] lg:w-[655px] lg:max-w-[655px] lg:shrink-0 lg:px-[16px]">
            {/* node 3872:18230 — action row (moved out of the gallery in the
              2408 update): 3×35×35 r100 white 80%, #EBEBEB 1px stroke,
              icons 16 #5E5E5E, right-aligned, gap 10 (vuesax assets) */}
            <div aria-hidden className="flex justify-end gap-[10px]">
              {[
                "/programs/export.svg",
                "/programs/message-2.svg",
                "/programs/heart.svg",
              ].map((src, i) => (
                <span
                  key={i}
                  className="flex h-[35px] w-[35px] items-center justify-center rounded-full border border-[#EBEBEB] bg-white/80"
                >
                  <img src={src} alt="" className="h-[16px] w-[16px]" />
                </span>
              ))}
            </div>

            {/* node 1895:7714 — info block, gap 16 */}
            <div className="flex flex-col gap-[16px]">
              {/* node 2471:15548 — title row h29 space-between: title 24/590
                lh29 + star rating at right (18px star + 4.91 16/400).
                "4.91" is a D2 placeholder (no public course rating). */}
              <div className="flex items-center justify-between gap-[10.01px]">
                <h1 className="text-[24px] font-[weight:590] leading-[29px] text-ink">
                  {course.name}
                </h1>
                <span className="flex shrink-0 items-center gap-[5px]">
                  <Star
                    aria-hidden
                    className="h-[18px] w-[18px] text-[#222222]"
                    fill="#222222"
                    strokeWidth={0}
                  />
                  <span className="text-[16px] font-normal leading-[19px] text-[#222222]">
                    4.91
                  </span>
                </span>
              </div>

              {/* node 1895:7720 — price row h24, gap 5: 20px #222 · dot 2.5 ·
                age 20/400 #5E5E5E (strike-through price omitted — single
                price in API) */}
              <p className="flex h-[24px] items-center gap-[5px] text-[20px] leading-none">
                {price != null ? (
                  <span className="font-normal text-ink">
                    ${Number(price.toFixed(0))}
                  </span>
                ) : null}
                {price != null && course.age_tag ? (
                  <span
                    aria-hidden
                    className="h-[2.5px] w-[2.5px] shrink-0 rounded-full bg-[#5E5E5E]"
                  />
                ) : null}
                {course.age_tag ? (
                  <span className="font-normal text-[#5E5E5E]">
                    {formatTemplate(t, "programs.ageLabel", {
                      age: course.age_tag,
                    })}
                  </span>
                ) : null}
              </p>

              {/* node 1895:7724/7725 — intro 14/400 #5E5E5E, w605 (2 lines,
                h34 = 2×17) */}
              {course.intro ? (
                <p className="min-h-[34px] text-[14px] font-normal leading-[17px] text-[#5E5E5E]">
                  {course.intro}
                </p>
              ) : null}

              {/* node 1895:7726 — language row omitted (no API field) */}

              {/* node 1895:7737 (program) / 3873:18883+18890 (workshop) —
                location row: icon 20.02, gap 5; program text 14/400 lh17,
                workshop text 12/400 lh14 (frames genuinely differ) */}
              {district ? (
                <p
                  className={`flex items-center gap-[5px] font-normal text-[#5E5E5E] ${
                    variant === "workshop"
                      ? "text-[12px] leading-[14px]"
                      : "text-[14px] leading-[17px]"
                  }`}
                >
                  <img
                    src="/programs/location.svg"
                    alt=""
                    aria-hidden
                    className="h-[20.02px] w-[20.02px] shrink-0"
                  />
                  {district}
                </p>
              ) : null}
            </div>

            {/* node 2652:24202 — hosted by, gap 16; centre name + star rating
                (node 2652:24209, 16px star + 4.91 14/400) */}
            {centreName ? (
              <section
                aria-label={t("programs.hostedBy")}
                className="flex flex-col gap-[16px]"
              >
                <h2 className="text-[16px] font-[weight:590] leading-[19px] text-black">
                  {t("programs.hostedBy")}
                </h2>
                {/* node 2652:24204 — row w343 gap 20, px-16: avatar 50 r100
                  (design photo placeholder — no avatar API) + centre name
                  14/590 #222 (2652:24208, wraps) + star rating */}
                <div className="flex items-center gap-[20px] px-[16px]">
                  <img
                    src={HOST_AVATAR}
                    alt=""
                    aria-hidden
                    className="h-[50px] w-[50px] shrink-0 rounded-full object-cover"
                  />
                  <p className="min-w-0 flex-1 text-[14px] font-[weight:590] leading-[17px] text-ink">
                    {centreName}
                  </p>
                  <span className="flex shrink-0 items-center gap-[4px]">
                    <Star
                      aria-hidden
                      className="h-[16px] w-[16px] text-[#222222]"
                      fill="#222222"
                      strokeWidth={0}
                    />
                    <span className="text-[14px] font-normal leading-[17px] text-[#222222]">
                      {centreRating}
                    </span>
                  </span>
                </div>
              </section>
            ) : null}

            {/* node 1895:7745 — options: 605px card column, gap 32, inside a
              445.98px scroll viewport with an 8×57 r4 #C1C1C1 thumb
              (#1895:7904) and a 10px gutter (623 = 605+10+8 ✓) */}
            {classes.length > 0 ? (
              <section aria-label="Sessions" className="relative">
                <div
                  className="detail-options-scroll flex flex-col gap-[32px] overflow-y-auto lg:h-[445.98px] lg:pr-[18px]"
                  data-testid="detail-options"
                >
                  {classes.map((cls) => (
                    <ClassOptionCard
                      key={cls.id}
                      cls={cls}
                      price={price}
                      defaultExpanded={expandLessonDates}
                    />
                  ))}
                </div>
              </section>
            ) : (
              <p className="text-sm text-[#5E5E5E]">
                {t("programs.noSessions")}
              </p>
            )}
          </div>
        </div>

        {/* node 2834:18822 — recommended programs: root gap 32 (mt-[32px]),
          pad 0/80 (no vertical padding), gap 32 */}
        {similar.length > 0 ? (
          <section
            className="mt-[32px] flex flex-col gap-[32px] px-0 lg:px-[80px]"
            aria-labelledby="similar-heading"
            data-testid="similar-section"
          >
            {/* node 2834:18823 — header row h33, space-between, bottom-aligned:
              28/590 #000 + 16/400 #5E5E5E */}
            <div className="flex items-end justify-between">
              <h2
                id="similar-heading"
                className="text-[28px] font-[weight:590] leading-none text-black"
              >
                {t("programs.similarPrograms")}
              </h2>
              <Link
                href="/programs"
                className="text-[16px] font-normal leading-none text-[#5E5E5E] underline"
              >
                {t("programs.seeMore")}
              </Link>
            </div>

            {/* node 2834:18826 — cards block gap 32: strip #3810:20016
              (3×400, space-between ⇒ gap 40: 3×400+2×40 = 1280 ✓) +
              pagination h35 justify-end */}
            <div className="flex flex-col gap-[32px]">
              <ul
                className="flex gap-[40px] overflow-x-auto"
                data-testid="similar-cards"
              >
                {similar.map((c) => (
                  <li key={c.id} className="shrink-0">
                    <ProgramCard
                      course={c}
                      variant="similar"
                      price={prices?.[c.id]}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}
      </div>

      <Footer />
    </main>
  );
}
