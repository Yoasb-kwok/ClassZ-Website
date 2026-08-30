"use client";

import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { districtLabel } from "@/lib/locations";
import { programImage } from "@/lib/program-images";
import type { PublicCourse } from "@/lib/public-courses";

const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

/**
 * Program card in two variants:
 *
 * - "listing" (default) from Figma #1628:16399 with exact scaled values:
 *   card 304.73×227.79 r12, shadow 0 5.19px 13.83px 12%, image 159.99,
 *   strip 67.43 h / 14px pad / 8.65 gap, title 14px semibold (gap 11 to
 *   meta), meta 14px with 1.62px dot separator, heart 18.28 @ 14px inset.
 *
 * - "similar" from the detail-page strip #3810:20016 (also used by
 *   landing #2346:21512 / #2346:21455): 400×299 — re-diffed against the
 *   LIVE frame via MCP 2026-08-25 (user: shadow + star/price/age missing;
 *   the 08-24 capture predates these — verify on re-export): card NOW has
 *   r12 (image 12/12/0/0 + strip 0/0/12/12) and shadow
 *   0 6.81px 18.16px rgba(0,0,0,0.12); the Expand (hover) instance uses
 *   0 6px 16px. Image #3810:20018 h210 pad 18.16, heart 27.23 #222 30%
 *   fill + #FFFFFF 2.27 stroke; hover = pad 20.41 + heart 30.62.
 *   Strip #3810:20027 h88.51 pad 18.16, row gap 11.35: left col
 *   (title 16/590 gap 10; price 16 bold-700 #222 (strike-through $399
 *   omitted — single price in API) · 2px dot #5E5E5E · Age 16/400
 *   #5E5E5E), right col center/end: star 16 #222 + 4.91 14/400 #222
 *   (rating is a D2 placeholder — no public API field). Price: the list
 *   API omits course.price; landing passes real per-course prices via
 *   the `price` prop (detail-endpoint fetch, app/page.tsx) — elsewhere
 *   the prop falls back to course.price. SEN badge stays omitted (no
 *   API field).
 */
export function ProgramCard({
  course,
  variant = "listing",
  price: priceProp,
}: {
  course: PublicCourse;
  variant?: "listing" | "similar";
  /** Real price override (landing fetches it per displayed course from
   *  the detail endpoint — the list API omits course.price). */
  price?: number | null;
}) {
  const { t, locale } = useLanguage();

  const district = districtLabel(course.location, locale);
  const weekdayKey =
    course.weekday != null ? WEEKDAY_KEYS[course.weekday] : null;
  const price =
    priceProp ?? (course.price != null ? Number(course.price) : null);
  const similar = variant === "similar";

  return (
    <Link
      href={`/programs/${course.id}`}
      data-testid="program-card"
      className={
        similar
          ? "group block w-[400px] max-w-full overflow-hidden rounded-[12px] bg-white shadow-[0_6.81px_18.16px_rgba(0,0,0,0.12)] transition-shadow duration-200 hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]"
          : "group block w-full max-w-[304.73px] overflow-hidden rounded-[12px] bg-white shadow-[0_5.19px_13.83px_rgba(0,0,0,0.12)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-classz-400"
      }
    >
      {/* Image area — listing 159.99px / similar 210px (nodes 1628:16400 /
          3810:20018, pad 18.16). Placeholder photo from the design capture
          until the API serves images (scaleMode fill → object-cover). Heart:
          similar = 27.23 box, #222 30% fill + white 2.27 stroke (grows to
          30.62 @20.41 inset on hover — the "Expand" instance #3810:20040);
          listing = 18.28 white stroke. */}
      <div
        className={`relative overflow-hidden bg-classz-50 ${
          similar ? "h-[210px]" : "h-[159.99px]"
        }`}
      >
        <img
          src={programImage(course.id, course.image_url)}
          alt={course.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {course.boosted ? (
          <span
            className={`absolute rounded-full bg-classz-500 px-2 py-0.5 font-semibold text-white ${
              similar ? "left-[18.16px] top-[18.16px] text-[12px]" : "left-[14px] top-[14px] text-[11px]"
            }`}
          >
            {locale === "zh-TW" ? "置頂" : "Pinned"}
          </span>
        ) : null}
        <Heart
          aria-hidden
          strokeWidth={similar ? 2.27 : 1.5}
          fill={similar ? "#222222" : "none"}
          fillOpacity={similar ? 0.3 : undefined}
          stroke={similar ? "#FFFFFF" : undefined}
          className={`absolute text-white transition-all duration-200 ${
            similar
              ? "right-[18.16px] top-[18.16px] h-[27.23px] w-[27.23px] group-hover:right-[20.41px] group-hover:top-[20.41px] group-hover:h-[30.62px] group-hover:w-[30.62px]"
              : "right-[14px] top-[14px] h-[18.28px] w-[18.28px]"
          }`}
        />
      </div>

      {/* Info strip — listing 67.43px/14/8.65 (node 1628:16399) or similar
          88.51px pad 18.16, row gap 11.35 (live frame): left column title→
          price gap 10 (node 3810:20027), right column star+4.91
          center/end-aligned (node 3810:20028). */}
      <div
        className={
          similar
            ? "flex h-[88.51px] items-stretch justify-between gap-[11.35px] p-[18.16px]"
            : "flex h-[67.43px] items-center justify-between gap-[8.65px] p-[14px]"
        }
      >
        {similar ? (
          <>
            <div className="flex min-w-0 flex-col gap-[10px]">
              <h3 className="truncate text-[16px] font-[weight:590] leading-[19px] text-ink">
                {course.name}
              </h3>
              <div className="flex items-center gap-[4px] text-[16px] leading-[19px]">
                {price != null ? (
                  <span className="truncate font-bold text-ink">
                    ${Number(price.toFixed(0))}
                  </span>
                ) : null}
                {price != null && course.age_tag ? (
                  <span
                    aria-hidden
                    className="h-[2px] w-[2px] shrink-0 rounded-full bg-[#5E5E5E]"
                  />
                ) : null}
                {course.age_tag ? (
                  <span className="truncate font-normal text-[#5E5E5E]">
                    {t("programs.ageLabel").replace("{age}", course.age_tag)}
                  </span>
                ) : null}
              </div>
            </div>
            {/* star / rating (node 3810:20028) — 4.91 is a D2 placeholder
                (design copy verbatim) until a rating API field exists. */}
            <div className="flex shrink-0 flex-col items-end justify-start">
              <div className="flex items-center gap-[4px]">
                <Star
                  aria-hidden
                  className="h-4 w-4 text-[#222222]"
                  strokeWidth={0}
                  fill="#222222"
                />
                <span className="text-[14px] font-normal leading-[17px] text-[#222222]">
                  4.91
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex min-w-0 flex-1 flex-col gap-[11px]">
            <h3 className="truncate text-[14px] font-semibold leading-none text-ink">
              {course.name}
            </h3>
            <div className="flex items-center gap-[3.23px] text-[14px] leading-none">
              {course.age_tag ? (
                <span className="truncate text-ink">
                  {t("programs.ageLabel").replace("{age}", course.age_tag)}
                </span>
              ) : null}
              {course.age_tag && district ? (
                <span
                  aria-hidden
                  className="h-[1.62px] w-[1.62px] shrink-0 rounded-full bg-[#5E5E5E]"
                />
              ) : null}
              {district ? (
                <span className="truncate text-[#5E5E5E]">{district}</span>
              ) : null}
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
  );
}
