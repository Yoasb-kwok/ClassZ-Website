"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { findDistrict } from "@/lib/locations";
import { isRegularCourseType, isTrialCourseType, isWorkshopCourseType } from "@/lib/course-types";
import type { PublicCourse } from "@/lib/public-courses";
import { SearchInput } from "./search-input";
import { FilterSidebar } from "./filter-sidebar";
import { ProgramCard } from "./program-card";
import { WorkshopCard } from "./workshop-card";

/**
 * Shared listing for /programs, /workshops and the W7 centre
 * programs state (Figma #1582:16181, #1988:7449, #2568:10769 — identical
 * layouts, only intro copy / search / sidebar-Place differ).
 * Search + Place filter run client-side over server-fetched courses.
 * Workshops = every course_type other than "regular" (short_term / summer).
 * Centre = all courses as placeholder content (D2 — no centre↔course API),
 * no search (2408 hides #2635:23899) and no Place (already centre-scoped).
 */
export function DiscoveryListing({
  courses,
  variant,
  scheduleCounts,
}: {
  courses: PublicCourse[];
  variant: "programs" | "workshops" | "trials" | "centre";
  /** courseId → active class count (2408 card "N schedules" row) */
  scheduleCounts?: Record<number, number>;
}) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [districts, setDistricts] = useState<Set<string>>(new Set());

  const variantCourses = useMemo(
    () =>
      courses.filter((c) =>
        variant === "programs"
          ? isRegularCourseType(c.course_type)
          : variant === "workshops"
            ? isWorkshopCourseType(c.course_type)
            : variant === "trials"
              ? isTrialCourseType(c.course_type)
              : true,
      ),
    [courses, variant],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return variantCourses.filter((course) => {
      if (districts.size > 0) {
        const district = findDistrict(course.location);
        if (!district || !districts.has(district.slug)) return false;
      }
      if (q) {
        const haystack = [
          course.name,
          course.intro,
          course.instructor,
          course.program_code,
          course.venue,
          course.location,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [variantCourses, query, districts]);

  const toggleDistrict = (slug: string) =>
    setDistricts((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });

  const clearFilters = () => {
    setQuery("");
    setDistricts(new Set());
  };

  const isWorkshops = variant === "workshops";
  const isTrials = variant === "trials";
  const isWideCards = isWorkshops || isTrials;
  const isCentre = variant === "centre";
  const hasNoWorkshops = isWorkshops && variantCourses.length === 0;
  const hasNoTrials = isTrials && variantCourses.length === 0;
  const titleKey = isCentre
    ? "centres.recommendedProgram"
    : isTrials
      ? "programs.trialsTitle"
      : "programs.title";
  const subtitleKey =
    variant === "programs"
      ? "programs.subtitle"
      : isTrials
        ? "programs.trialsSubtitle"
        : "programs.workshopsSubtitle";

  return (
    // Listing content capped at the 1440 design width & centered on wider
    // viewports (Option A). The cap sits on this block-level root, NOT on the
    // sidebar↔cards flex row — auto cross-margin on a flex-col child sizes it
    // to fit-content and breaks the layout.
    <div className="flex flex-col lg:mx-auto lg:max-w-[1440px]">
      {/* Intro — node #1626:16265: pad 32/0, gap 20; h1 40/590 lh48; sub 18 lh27, w884 */}
      <section className="flex flex-col items-center gap-5 px-6 py-8 text-center md:px-20">
        <h1 className="w-full text-[40px] font-[weight:590] leading-[48px] text-ink">
          {t(titleKey)}
        </h1>
        <p className="max-w-[884px] text-[18px] leading-[27px] text-ink">
          {t(subtitleKey)}
        </p>
      </section>

      {/* Search — node #1608:15903 inside #1608:15902 (pad 0/80, gap 32).
          The centre listing hides it (2408 #2635:23899 visible:false — the
          32px content gap to the body remains via the spacer). */}
      {isCentre ? (
        <div aria-hidden className="mt-8" />
      ) : (
        <div className="mt-8 px-6 pb-8 md:px-20">
          <SearchInput value={query} onChange={setQuery} />
        </div>
      )}

      {hasNoWorkshops || hasNoTrials ? (
        <div className="flex flex-col items-center gap-4 px-6 py-24 text-center">
          <p className="text-lg text-shade-500">
            {t(hasNoTrials ? "programs.trialsEmpty" : "programs.workshopsEmpty")}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8 px-6 pb-16 lg:flex-row lg:gap-0 lg:px-0 lg:pb-0">
          {/* Row #1722:17536 — at ≥1440 the design holds exactly: sidebar
              337.8 + cards 1102.2 = 1440, row capped & centered so nothing
              stretches on wider screens. Between lg and 1440 the cards area
              (basis 1102.2, shrinkable) surrenders width while the sidebar
              stays pinned — cards keep their exact 304.73 and columns
              collapse by arithmetic: 3 cols need 1102.19+337.8≈1440,
              2 cols need 767.46+337.8≈1106. */}
          <FilterSidebar
            selectedDistricts={districts}
            onToggleDistrict={toggleDistrict}
            showPlace={!isCentre}
          />

          {/* node #1628:16399 grid — rows of 3 cards, row-gap 32 (container),
              col-gap 30 (row), rows pad 0/80/0/48; row w 1102.2 so cards land
              at 304.73 @1440 */}
          <div className="min-w-0 lg:basis-[1102.2px] lg:grow-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-24 text-center">
                <p className="text-base font-semibold text-ink">
                  {t("programs.emptyTitle")}
                </p>
                <p className="text-sm text-shade-500">
                  {t("programs.emptyBody")}
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-full bg-classz-50 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-classz-100"
                >
                  {t("programs.clearFilters")}
                </button>
              </div>
            ) : isWideCards ? (
              <ul className="flex flex-col gap-8 lg:py-8 lg:pl-12 lg:pr-20">
                {filtered.map((course) => (
                  <li key={course.id} className="w-full">
                    <WorkshopCard
                      course={course}
                      scheduleCount={scheduleCounts?.[course.id] ?? 0}
                      href={isTrials ? `/trials/${course.id}` : `/workshops/${course.id}`}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="grid grid-cols-[repeat(auto-fill,minmax(304.7px,304.73px))] justify-center gap-x-[30px] gap-y-[32px] py-0 lg:justify-start lg:py-8 lg:pl-12 lg:pr-20">
                {/* Columns by arithmetic (not breakpoints): auto-fill tracks
                    (min 304.7 — 0.03px tolerance for subpixel rendering,
                    max exact 304.73) — 3 fit at ≥1440 (974.19 content), 2
                    from ~1106, 1 below; tracks center when stacked, hug the
                    48px sidebar gap in row mode (lg:justify-start). */}
                {filtered.map((course) => (
                  <li key={course.id} className="w-full">
                    <ProgramCard course={course} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* node #1582:16404 — 80px spacer before footer (sibling gap 32 ≈ grid pb) */}
      <div aria-hidden className="mt-8 h-20" />
    </div>
  );
}
