"use client"

import Link from "next/link"
import { Heart, MapPin } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { programImage } from "@/lib/program-images"
import { districtLabel } from "@/lib/locations"
import type { PublicCourse } from "@/lib/public-courses"

/**
 * Wide workshop listing card — 2408 capture `workshop.figmacapture`:
 * - row #3863:17549 — w1102 pad 0/80/0/48, rows gap 32 (#3810:20081)
 * - card #3863:17550 "Expand" — 974×253, NO radius, NO shadow, NO stroke
 *   (capture confirms all absent)
 * - image panel #3863:17551 — w643 h253, IMAGE fill (frame-level fill covers
 *   the whole panel; its pad 14/gap 9.72 have no children to apply to)
 * - white panel #3863:17554 — w331 pad 14, fill #FFFFFF
 * - info #3863:17555 — 303×225, ver gap 10 (min) space-between:
 *   top #3863:17556 (title col + heart, gap 40.63) / middle #3866:17620 (gap 10)
 * - title #3863:17559 — 22/590 #222, w239 h52 (2 lines, lh26)
 * - price #3863:17561 — single uniform run 18/400 #222 lh21 (design mock shows
 *   two prices "$399 $299 course"; API has one price field → one price + unit)
 * - heart #3866:17617 — 23.33 white frame + vector 19.44×17.33 stroke
 *   #BDBDBD/1.94 (lucide Heart stretched to the vector's box; circle is white-
 *   on-white so invisible by design)
 * - age #3865:17595 / address #3863:17586 — 14/400 #5E5E5E lh17; location icon
 *   16×16 (vuesax vector has no exported asset → lucide MapPin, color matched
 *   to adjacent text), row gap 4
 * - schedules #3863:17589 — 14/400 #222 lh17
 * - star+rating row #3866:17613 — OMITTED: no public API rating field
 * - Mobile (<lg) is spec-silent: card stacks (image keeps its 643:253 aspect
 *   by arithmetic, panel goes full-width) — noted in figma prompt/INDEX.md
 */
export function WorkshopCard({
  course,
  scheduleCount,
  href,
}: {
  course: PublicCourse
  scheduleCount: number
  href?: string
}) {
  const { t, locale } = useLanguage()
  const price = course.price != null ? Number(course.price) : null
  const place = course.venue || districtLabel(course.location, locale) || course.location

  return (
    <Link
      href={href || `/workshops/${course.id}`}
      data-testid="workshop-card"
      className="group flex w-full flex-col overflow-hidden bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-classz-400 lg:h-[253px] lg:flex-row"
    >
      {/* Image panel #3863:17551 — IMAGE fill, full-bleed */}
      <div className="relative aspect-[643/253] w-full overflow-hidden bg-classz-50 lg:aspect-auto lg:h-[253px] lg:w-auto lg:flex-1 lg:shrink">
        <img
          src={programImage(course.id, course.image_url)}
          alt={course.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {course.boosted ? (
          <span className="absolute left-3 top-3 rounded-full bg-classz-500 px-2 py-0.5 text-[11px] font-semibold text-white">
            {locale === "zh-TW" ? "置頂" : "Pinned"}
          </span>
        ) : null}
      </div>

      {/* White panel #3863:17554 — w331 pad 14 */}
      <div className="w-full shrink-0 bg-white p-[14px] lg:w-[331px]">
        {/* Info #3863:17555 — space-between, min gap 10 */}
        <div className="flex h-full flex-col justify-between gap-2.5">
          {/* Top #3863:17556 — title column + heart */}
          <div className="flex items-start justify-between gap-[40.63px]">
            <div className="flex min-w-0 flex-col gap-[7.62px]">
              <h3 className="line-clamp-2 w-full text-[22px] font-[weight:590] leading-[26px] text-ink lg:w-[239px]">
                {course.name}
              </h3>
              {price != null ? (
                <p className="text-[18px] leading-[21px] text-ink">
                  ${Number(price.toFixed(0))} {t("programs.perCourse")}
                </p>
              ) : null}
            </div>
            {/* Heart #3866:17617 — 23.33 frame, icon 19.44×17.33 #BDBDBD/1.94 */}
            <span
              aria-hidden
              className="flex h-[23.33px] w-[23.33px] shrink-0 items-center justify-center"
            >
              <Heart
                className="h-[17.33px] w-[19.44px] text-[#BDBDBD]"
                strokeWidth={1.94}
                fill="none"
              />
            </span>
          </div>

          {/* Middle #3866:17620 — age / location / schedules, gap 10 */}
          <div className="flex flex-col gap-2.5">
            {course.age_tag ? (
              <p className="text-[14px] leading-[17px] text-[#5E5E5E]">
                {t("programs.ageLabel").replace("{age}", course.age_tag)}
              </p>
            ) : null}
            {place ? (
              <div className="flex items-center gap-1">
                <MapPin
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-[#5E5E5E]"
                  strokeWidth={1.5}
                />
                <p className="truncate text-[14px] leading-[17px] text-[#5E5E5E]">
                  {place}
                </p>
              </div>
            ) : null}
            {scheduleCount > 0 ? (
              <p className="text-[14px] leading-[17px] text-ink">
                {scheduleCount >= 10
                  ? t("programs.schedulesMany")
                  : t("programs.schedules").replace("{count}", String(scheduleCount))}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  )
}
