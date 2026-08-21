"use client"

import Link from "next/link"
import { Heart } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { districtLabel } from "@/lib/locations"
import { programImage } from "@/lib/program-images"
import type { PublicCourse } from "@/lib/public-courses"

const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const

/**
 * Program card in two variants:
 *
 * - "listing" (default) from Figma #1628:16399 with exact scaled values:
 *   card 304.73×227.79 r12, shadow 0 5.19px 13.83px 12%, image 159.99,
 *   strip 67.43 h / 14px pad / 8.65 gap, title 14px semibold (gap 11 to
 *   meta), meta 14px with 1.62px dot separator, heart 18.28 @ 14px inset.
 *
 * - "similar" from Figma #2834:18828 (detail page strip) AND landing
 *   #2346:21512 / #2346:21455: 400×299 — NO radius, NO shadow, NO stroke
 *   (capture confirms all absent; not the listing card scaled).
 *   Image 210 pad 18.16 heart 27.23; strip 88.51 h / 18.16 pad /
 *   11.35 gap; title 16/590 lh19; meta 16px price #222 · 2px dot
 *   #5E5E5E · age 16/400 #5E5E5E. (Landing cards also carry a star
 *   rating on the strip's right — data-blocked, omitted.)
 *
 * Heart is decorative until a favourites API exists; SEN badge and star
 * rating stay omitted — no public API fields for them.
 */
export function ProgramCard({
  course,
  variant = "listing",
}: {
  course: PublicCourse
  variant?: "listing" | "similar"
}) {
  const { t, locale } = useLanguage()

  const district = districtLabel(course.location, locale)
  const weekdayKey = course.weekday != null ? WEEKDAY_KEYS[course.weekday] : null
  const price = course.price != null ? Number(course.price) : null
  const similar = variant === "similar"

  return (
    <Link
      href={`/programs/${course.id}`}
      data-testid="program-card"
      className={
        similar
          ? "group block w-[400px] max-w-full overflow-hidden bg-white"
          : "group block w-full max-w-[304.73px] overflow-hidden rounded-[12px] bg-white shadow-[0_5.19px_13.83px_rgba(0,0,0,0.12)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-classz-400"
      }
    >
      {/* Image area — listing 159.99px / similar 210px (node 2834:18829,
          pad 18.16). Placeholder photo from the design capture until the
          API serves images (scaleMode fill → object-cover); heart is
          decorative (18.28 / 27.23). */}
      <div
        className={`relative overflow-hidden bg-classz-50 ${
          similar ? "h-[210px]" : "h-[159.99px]"
        }`}
      >
        <img
          src={programImage(course.id)}
          alt={course.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <Heart
          aria-hidden
          strokeWidth={1.5}
          className={`absolute text-white ${
            similar ? "right-[18.16px] top-[18.16px] h-[27.23px] w-[27.23px]" : "right-[14px] top-[14px] h-[18.28px] w-[18.28px]"
          }`}
        />
      </div>

      {/* Info strip — listing 67.43px/14/8.65 (node 1628:16399) or
          similar 88.51px pad 18.16, title→meta gap 13.62 (node 2834:18841:
          19+13.62+19 = 51.62 ✓). */}
      <div
        className={
          similar
            ? "flex h-[88.51px] flex-col justify-center p-[18.16px]"
            : "flex h-[67.43px] items-center justify-between gap-[8.65px] p-[14px]"
        }
      >
        {similar ? (
          <>
            <h3 className="truncate text-[16px] font-[weight:590] leading-[19px] text-ink">
              {course.name}
            </h3>
            <div className="flex items-center gap-[4px] text-[16px] leading-[19px]">
              {price != null ? (
                <span className="truncate text-ink">
                  ${Number(price.toFixed(0))}
                </span>
              ) : null}
              {price != null && course.age_tag ? (
                <span aria-hidden className="h-[2px] w-[2px] shrink-0 rounded-full bg-[#5E5E5E]" />
              ) : null}
              {course.age_tag ? (
                <span className="truncate font-normal text-[#5E5E5E]">
                  {t("programs.ageLabel").replace("{age}", course.age_tag)}
                </span>
              ) : null}
            </div>
          </>
        ) : (
          <div className="flex min-w-0 flex-1 flex-col gap-[11px]">
            <h3 className="truncate text-[14px] font-semibold leading-none text-ink">{course.name}</h3>
            <div className="flex items-center gap-[3.23px] text-[14px] leading-none">
              {course.age_tag ? (
                <span className="truncate text-ink">
                  {t("programs.ageLabel").replace("{age}", course.age_tag)}
                </span>
              ) : null}
              {course.age_tag && district ? (
                <span aria-hidden className="h-[1.62px] w-[1.62px] shrink-0 rounded-full bg-[#5E5E5E]" />
              ) : null}
              {district ? <span className="truncate text-[#5E5E5E]">{district}</span> : null}
            </div>
          </div>
        )}
        {!similar && weekdayKey ? (
          <span className="shrink-0 rounded bg-shade-50 px-1.5 py-0.5 text-xs text-shade-500">
            {t(`programs.weekday.${weekdayKey}`)}
          </span>
        ) : null}
      </div>
    </Link>
  )
}
