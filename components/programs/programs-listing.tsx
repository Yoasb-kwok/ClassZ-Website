"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, MapPin, Star } from "lucide-react";
import { SaveCourseButton } from "@/components/programs/save-course-button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useLanguage } from "@/components/language-provider";
import {
  findDistrict,
  officialDistrictFrom,
  type District,
} from "@/lib/locations";
import {
  isRegularCourseType,
  isTrialCourseType,
  isWorkshopCourseType,
} from "@/lib/course-types";
import { programImage } from "@/lib/program-images";
import {
  classesForCourse,
  sessionsForWorkshop,
  type PublicClass,
  type PublicCourse,
} from "@/lib/public-courses";
import { CheckRow, ListingToolbar, type ToolbarPop } from "./listing-toolbar";
import { formatTemplate } from "./format";

/**
 * /programs listing — user-directed redesign approved from the standalone
 * demo (`demo/programs-list-redesign.html`, 2026-08-27). NOT capture-exact:
 * the top filter bar + boxed list are new design (no 2408 frame); the wide
 * card chrome reuses workshop-capture values (#3863:17550 family) with demo
 * deltas: r9.14 + shadow (demo-approved) instead of the capture's flat card.
 *
 * Layout:
 * - segmented box [Category | Location | Date Range (weekday on /programs)]
 *   connected to the search bar (#1988:7481 base), aligned to the card grid
 *   (974 @1440, pad 48/80) — shared ListingToolbar chrome
 * - row below: Filter | Budget | Class Size (Filter leftmost per demo it.3)
 * - card list bounded in a gray #F7F7F7 r12 panel (demo it.4)
 *
 * Data honesty (Block B):
 * - Location: REAL (district pills, lib/locations)
 * - Date Range: REAL (PublicClass.start_time → per-course min/max day) —
 *   workshops/trials only; /programs swaps the same slot for a Weekday
 *   filter (user decision 2026-09-29: recurring programs have no fixed
 *   dates; union semantics — any selected weekday matches)
 * - Budget/Class Size sorts: REAL (detail-endpoint prices passed in;
 *   class capacity from classes)
 * - Category: REAL (course.category)
 * - Filter: REAL star-rating exclusion (user decision 2026-10-01, same as
 *   the centre listing) — reads the per-course mock-fallback rating
 *   (courseRating below; no public rating API field yet, same policy as
 *   the centre mock ratings). Service tags stay out until that API exists.
 * - Card star+rating row shows the same mock-fallback value so the filter
 *   matches what the card displays.
 * - Card links carry ?dates=1 → detail opens with lesson dates expanded.
 */

const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

/** Mock-fallback rating per course (D2) — deterministic per id, same
 *  policy as the centre mock ratings; swapped for real aggregates when
 *  the reviews feature lands. Range 3.60–4.98, 2 decimals ("4.91"). */
function courseRating(course: PublicCourse): string {
  const v = (((course.id * 2654435761) % 1000) + 1000) % 1000;
  return (3.6 + (v / 1000) * 1.38).toFixed(2);
}

/** demo CSS pbox.date — sidebar price box #1973:20101 chrome (105×57 r8) */
function DateBox({
  labelKey,
  value,
  onChange,
}: {
  labelKey: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const { t } = useLanguage();
  return (
    <label className="flex h-[57px] w-[150px] flex-col justify-center gap-[4px] rounded-[8px] border border-[#B0B0B0] bg-white px-[12px] py-[6px]">
      <span className="text-[10px] font-normal leading-[12px] text-[#717171]">
        {t(labelKey)}
      </span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-[14px] leading-[17px] text-ink focus:outline-none"
      />
    </label>
  );
}

interface Row {
  course: PublicCourse;
  price: number | null;
  /** earliest/latest session day (local midnight ms); null = no sessions */
  minDay: number | null;
  maxDay: number | null;
  fromLabel: string | null;
  toLabel: string | null;
  /** max class capacity across the course's sessions */
  capacity: number | null;
  durationMinutes: number | null;
  weekdays: number[];
  district: District | undefined;
  /** mock-fallback rating ("4.91") — filter + card star block */
  rating: string;
}

const DAY_MS = 86_400_000;
const fmtDM = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
const dayNum = (d: Date) =>
  Math.floor(
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / DAY_MS,
  );
const parseDatePicker = (v: string): number | null => {
  if (!v) return null;
  const [y, m, d] = v.split("-").map(Number);
  if (!y || !m || !d) return null;
  return dayNum(new Date(y, m - 1, d));
};

function minutesBetween(
  startAt: string | null | undefined,
  endAt: string | null | undefined,
): number | null {
  if (!startAt || !endAt) return null;
  const start = new Date(startAt);
  const end = new Date(endAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  const mins = Math.round((end.getTime() - start.getTime()) / 60_000);
  return mins > 0 ? mins : null;
}

function mostCommon(values: number[]): number | null {
  if (!values.length) return null;
  const counts = new Map<number, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

export type ListingVariant = "programs" | "workshops" | "trials";

function matchesListingVariant(
  courseType: string | null | undefined,
  variant: ListingVariant,
) {
  if (variant === "workshops") return isWorkshopCourseType(courseType);
  if (variant === "trials") return isTrialCourseType(courseType);
  return isRegularCourseType(courseType);
}

export function ProgramsListing({
  courses,
  classes,
  prices,
  variant = "programs",
  centreHints = {},
}: {
  courses: PublicCourse[];
  classes: PublicClass[];
  /** per-course real prices (detail-endpoint fetch in the route) */
  prices: Record<number, number>;
  variant?: ListingVariant;
  /** centre address / district used when the course location is a venue name */
  centreHints?: Record<number, string[]>;
}) {
  const { t } = useLanguage();

  const isPrograms = variant === "programs";

  const [query, setQuery] = useState("");
  const [districts, setDistricts] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<Set<string>>(new Set());
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  /** Weekday filter (programs variant only) — JS day numbers 0–6, union
   *  semantics: a program matches when it runs on ANY selected day. */
  const [weekdays, setWeekdays] = useState<Set<number>>(new Set());
  /** excluded star bounds — "Exclude {n}★ and below", n ∈ 1..4 (centre
   *  listing parity): rating must be strictly above every kept bound; */
  const [excludeStars, setExcludeStars] = useState<Set<number>>(new Set());
  /** which popover is open — only one at a time (demo behavior) */
  const [openPop, setOpenPop] = useState<ToolbarPop>(null);
  const [activeSort, setActiveSort] = useState<"budget" | "size" | null>(null);
  const [budgetDir, setBudgetDir] = useState<"asc" | "desc">("asc");
  const [sizeDir, setSizeDir] = useState<"desc" | "asc">("desc");

  const rows: Row[] = useMemo(() => {
    return courses
      .filter((c) => matchesListingVariant(c.course_type, variant))
      .map((course) => {
        const sessions =
          variant === "programs"
            ? classesForCourse(classes, course)
            : sessionsForWorkshop(classes, course);
        const dates = sessions
          .map((s) => new Date(s.start_time))
          .filter((d) => !Number.isNaN(d.getTime()));
        let minDay: number | null = null;
        let maxDay: number | null = null;
        let fromLabel: string | null = null;
        let toLabel: string | null = null;
        if (dates.length > 0) {
          const mins = dates.map(dayNum);
          minDay = Math.min(...mins);
          maxDay = Math.max(...mins);
          fromLabel = fmtDM(dates[mins.indexOf(minDay)]);
          toLabel = fmtDM(dates[mins.indexOf(maxDay)]);
        }
        const capacities = sessions.map((s) => s.capacity).filter((c) => c > 0);
        const durations = [
          ...sessions.map((s) => minutesBetween(s.start_time, s.end_time)),
          minutesBetween(course.starts_at, course.ends_at),
        ].filter((n): n is number => n != null);
        const weekdays = Array.from(
          new Set(
            [
              course.weekday,
              ...sessions.map((s) => s.weekday),
              ...dates.map((d) => d.getDay()),
            ].filter((d): d is number => d != null && d >= 0 && d <= 6),
          ),
        ).sort((a, b) => a - b);
        return {
          course,
          price:
            course.price != null
              ? Number(course.price)
              : (prices[course.id] ?? null),
          minDay,
          maxDay,
          fromLabel,
          toLabel,
          capacity: capacities.length > 0 ? Math.max(...capacities) : null,
          durationMinutes: mostCommon(durations),
          weekdays,
          district: officialDistrictFrom(
            course.location,
            course.venue,
            ...sessions.map((s) => s.location),
            ...(centreHints[course.center_id] ?? []),
          ),
          rating: courseRating(course),
        };
      });
  }, [courses, classes, prices, variant, centreHints]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const fromDay = parseDatePicker(dateFrom);
    const toDay = parseDatePicker(dateTo);
    const out = rows.filter((row) => {
      if (categories.size > 0) {
        const cat = row.course.category;
        if (!cat || !categories.has(cat)) return false;
      }
      if (districts.size > 0) {
        const district = findDistrict(row.course.location);
        if (!district || !districts.has(district.slug)) return false;
      }
      if (isPrograms) {
        /* Weekday filter (union): keep programs running on any selected day */
        if (weekdays.size > 0 && !row.weekdays.some((d) => weekdays.has(d))) {
          return false;
        }
      } else if (fromDay != null || toDay != null) {
        /* overlap semantics (demo): course runs during the selected period */
        if (row.minDay == null || row.maxDay == null) return false;
        if (fromDay != null && row.maxDay < fromDay) return false;
        if (toDay != null && row.minDay > toDay) return false;
      }
      if (excludeStars.size > 0) {
        const rating = Number.parseFloat(row.rating);
        /* unrated courses sink whenever a star filter is active */
        if (Number.isNaN(rating)) return false;
        for (const n of excludeStars) {
          if (rating <= n) return false;
        }
      }
      if (q) {
        const haystack = [
          row.course.name,
          row.course.intro,
          row.course.instructor,
          row.course.program_code,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    /* pins stay on top (earliest paid first); one sort at a time among the rest */
    const boostCmp = (a: Row, b: Row) => {
      const ap = a.course.boosted ? 0 : 1;
      const bp = b.course.boosted ? 0 : 1;
      if (ap !== bp) return ap - bp;
      if (a.course.boosted && b.course.boosted) {
        const ta = a.course.boost_paid_at
          ? new Date(a.course.boost_paid_at).getTime()
          : 0;
        const tb = b.course.boost_paid_at
          ? new Date(b.course.boost_paid_at).getTime()
          : 0;
        return ta - tb;
      }
      return 0;
    };
    if (activeSort === "budget") {
      out.sort((a, b) => {
        const boost = boostCmp(a, b);
        if (boost !== 0) return boost;
        if (a.price == null && b.price == null) return 0;
        if (a.price == null) return 1;
        if (b.price == null) return -1;
        return (budgetDir === "asc" ? 1 : -1) * (a.price - b.price);
      });
    } else if (activeSort === "size") {
      out.sort((a, b) => {
        const boost = boostCmp(a, b);
        if (boost !== 0) return boost;
        if (a.capacity == null && b.capacity == null) return 0;
        if (a.capacity == null) return 1;
        if (b.capacity == null) return -1;
        return (sizeDir === "desc" ? -1 : 1) * (a.capacity - b.capacity);
      });
    }
    return out;
  }, [
    rows,
    query,
    districts,
    categories,
    dateFrom,
    dateTo,
    weekdays,
    excludeStars,
    isPrograms,
    activeSort,
    budgetDir,
    sizeDir,
  ]);

  const toggleDistrict = (slug: string) =>
    setDistricts((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });

  const toggleCategory = (key: string) =>
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const toggleWeekday = (day: number) =>
    setWeekdays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });

  const toggleExcludeStars = (n: number) =>
    setExcludeStars((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });

  const clearFilters = () => {
    setQuery("");
    setDistricts(new Set());
    setCategories(new Set());
    setDateFrom("");
    setDateTo("");
    setWeekdays(new Set());
    setExcludeStars(new Set());
    setActiveSort(null);
    setBudgetDir("asc");
    setSizeDir("desc");
  };

  const dateCount = dateFrom || dateTo ? 1 : 0;

  return (
    <main className="min-h-screen bg-white text-ink">
      <Navbar />
      <div className="flex flex-col lg:mx-auto lg:max-w-[1440px]">
        {/* Intro — node #1626:16265 (unchanged from the previous listing) */}
        <section className="flex flex-col items-center gap-5 px-6 py-8 text-center md:px-20">
          <h1 className="w-full text-[40px] font-[weight:590] leading-[48px] text-ink">
            {t(
              variant === "trials"
                ? "programs.trialsTitle"
                : variant === "workshops"
                  ? "programs.workshopsTitle"
                  : "programs.title",
            )}
          </h1>
          <p className="max-w-[884px] text-[18px] leading-[27px] text-ink">
            {t(
              variant === "trials"
                ? "programs.trialsSubtitle"
                : variant === "workshops"
                  ? "programs.workshopsSubtitle"
                  : "programs.subtitle",
            )}
          </p>
        </section>

        {/* Filter + search — shared ListingToolbar; the third segment is
            Date Range on workshops/trials, Weekday on /programs. */}
        <ListingToolbar
          openPop={openPop}
          onTogglePop={(pop) => setOpenPop(openPop === pop ? null : pop)}
          categoryOptions={(
            [
              "academic",
              "music",
              "art",
              "dance",
              "sports",
              "stem",
              "language",
              "parentChild",
              "others",
            ] as const
          ).map((key) => ({
            key,
            label: t(`programs.categories.${key}`),
          }))}
          selectedCategories={categories}
          onToggleCategory={toggleCategory}
          selectedDistricts={districts}
          onToggleDistrict={toggleDistrict}
          middle={
            isPrograms
              ? {
                  id: "weekday" as const,
                  label: t("programs.weekdayFilter"),
                  count: weekdays.size,
                  popoverClassName: "md:w-[200px]",
                  children: (
                    <div className="flex flex-col gap-4">
                      {WEEKDAY_KEYS.map((key, day) => (
                        <CheckRow
                          key={key}
                          label={t(`programs.weekday.${key}`)}
                          selected={weekdays.has(day)}
                          onToggle={() => toggleWeekday(day)}
                        />
                      ))}
                    </div>
                  ),
                }
              : {
                  id: "date" as const,
                  label: t("programs.dateRange"),
                  count: dateCount,
                  children: (
                    <div className="flex gap-4">
                      <DateBox
                        labelKey="programs.from"
                        value={dateFrom}
                        onChange={setDateFrom}
                      />
                      <DateBox
                        labelKey="programs.to"
                        value={dateTo}
                        onChange={setDateTo}
                      />
                    </div>
                  ),
                }
          }
          searchValue={query}
          onSearchChange={setQuery}
          searchPlaceholder={t("programs.searchPlaceholder")}
          actions={
            <>
              {/* Filter — REAL star-rating exclusion (centre-listing parity,
                  user decision 2026-10-01); service tags stay out until that
                  API exists */}
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={openPop === "filter"}
                  onClick={() =>
                    setOpenPop(openPop === "filter" ? null : "filter")
                  }
                  className={`flex h-10 items-center gap-[6px] rounded-[8px] border bg-white px-3 text-[14px] leading-[17px] text-ink transition-colors hover:border-ink ${
                    excludeStars.size > 0
                      ? "border-classz-500 font-[weight:590]"
                      : "border-[#B0B0B0]"
                  }`}
                >
                  {t("programs.filter")}
                  {excludeStars.size > 0 ? (
                    <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[rgba(10,186,181,0.3)] px-[5px] text-[11px] font-[weight:590] leading-none">
                      {excludeStars.size}
                    </span>
                  ) : null}
                  <ChevronDown
                    aria-hidden
                    className={`h-4 w-4 text-[#5E5E5E] transition-transform ${
                      openPop === "filter" ? "rotate-180" : ""
                    }`}
                    strokeWidth={1.16}
                  />
                </button>
                {openPop === "filter" ? (
                  <div className="absolute left-0 top-[calc(100%+8px)] z-30 w-full rounded-[12px] bg-white p-5 text-left shadow-[0_6px_16px_2px_rgba(0,0,0,0.12)] md:w-[280px]">
                    <h4 className="text-[16px] font-[weight:590] leading-[19px]">
                      {t("programs.rating")}
                    </h4>
                    <div className="mt-4 flex flex-col gap-4">
                      {[1, 2, 3, 4].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => toggleExcludeStars(n)}
                          aria-pressed={excludeStars.has(n)}
                          className="flex items-center gap-5 text-left"
                        >
                          <span
                            aria-hidden
                            className={`flex h-4 w-4 items-center justify-center rounded-[4px] border ${
                              excludeStars.has(n)
                                ? "border-[#0ABAB5] bg-[rgba(10,186,181,0.35)]"
                                : "border-[#B0B0B0] bg-white"
                            }`}
                          />
                          <span className="flex items-center gap-1 text-sm leading-[21px] text-ink">
                            <Star
                              aria-hidden
                              className="h-3 w-3 text-ink"
                              strokeWidth={0}
                              fill="#222222"
                            />
                            {formatTemplate(t, "programs.excludeStars", { n })}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Budget — REAL price sort (asc ⇄ desc; null prices sink) */}
              <button
                type="button"
                onClick={() => {
                  if (activeSort !== "budget") {
                    setActiveSort("budget");
                    setBudgetDir("asc");
                  } else {
                    setBudgetDir((d) => (d === "asc" ? "desc" : "asc"));
                  }
                }}
                aria-pressed={activeSort === "budget"}
                className={`flex h-10 items-center gap-[6px] rounded-[8px] border bg-white px-3 text-[14px] leading-[17px] transition-colors hover:border-ink ${
                  activeSort === "budget"
                    ? "border-classz-500 font-[weight:590] text-ink"
                    : "border-[#B0B0B0] text-ink"
                }`}
              >
                {t("programs.budget")}
                <span className="text-[12px] font-normal text-[#5E5E5E]">
                  {t(
                    budgetDir === "asc"
                      ? "programs.lowToHigh"
                      : "programs.highToLow",
                  )}
                </span>
              </button>

              {/* Class Size — REAL capacity sort (desc ⇄ asc; null sinks) */}
              <button
                type="button"
                onClick={() => {
                  if (activeSort !== "size") {
                    setActiveSort("size");
                    setSizeDir("desc");
                  } else {
                    setSizeDir((d) => (d === "desc" ? "asc" : "desc"));
                  }
                }}
                aria-pressed={activeSort === "size"}
                className={`flex h-10 items-center gap-[6px] rounded-[8px] border bg-white px-3 text-[14px] leading-[17px] transition-colors hover:border-ink ${
                  activeSort === "size"
                    ? "border-classz-500 font-[weight:590] text-ink"
                    : "border-[#B0B0B0] text-ink"
                }`}
              >
                {t("programs.classSize")}
                <span className="text-[12px] font-normal text-[#5E5E5E]">
                  {t(
                    sizeDir === "desc"
                      ? "programs.largeToSmall"
                      : "programs.smallToLarge",
                  )}
                </span>
              </button>
            </>
          }
        />

        {/* Card list — gray panel bounding the list (demo it.4). Empty
            state replaces the panel (demo no-cards behavior). */}
        <div className="mx-auto w-full max-w-[1440px] px-6 pb-16 md:px-16 lg:px-20">
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
          ) : (
            <ul
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              data-testid="programs-list-panel"
            >
              {filtered.map((row) => (
                <li key={row.course.id} className="min-w-0">
                  <ListingCard
                    row={row}
                    href={
                      variant === "trials"
                        ? `/trials/${row.course.id}?dates=1`
                        : variant === "workshops"
                          ? `/workshops/${row.course.id}?dates=1`
                          : `/programs/${row.course.id}?dates=1`
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* node #1582:16404 — 80px spacer before footer */}
        <div aria-hidden className="h-20" />
      </div>
      <Footer />
    </main>
  );
}

/** Compact vertical card for the responsive 1–5 column grid. */
function ageRangeLabel(course: PublicCourse, locale: "en" | "zh-TW") {
  const min = course.age_min;
  const max = course.age_max;
  const raw =
    min != null && max != null
      ? `${min}–${max}`
      : min != null
        ? `${min}+`
        : max != null
          ? `≤${max}`
          : (course.age_tag ?? "").trim();
  if (!raw) return "";
  const range = raw
    .replace(/歲$/u, "")
    .replace(/\s*years?$/i, "")
    .trim();
  return locale === "zh-TW" ? `${range}歲` : range;
}

function durationLabel(minutes: number | null, t: (key: string) => string) {
  if (minutes == null || minutes <= 0) return "";
  if (minutes % 60 === 0) {
    return t("programs.durationHours").replace("{n}", String(minutes / 60));
  }
  return t("programs.durationMinutes").replace("{n}", String(minutes));
}

const WEEKDAY_ZH_SHORT = ["日", "一", "二", "三", "四", "五", "六"] as const;

function weekdayLine(
  days: number[],
  t: (key: string) => string,
  locale: "en" | "zh-TW",
) {
  const valid = days.filter((d) => d >= 0 && d <= 6);
  if (!valid.length) return "";
  if (locale === "zh-TW") {
    return formatTemplate(t, "programs.everyWeekday", {
      day: `星期${valid.map((d) => WEEKDAY_ZH_SHORT[d]).join("，")}`,
    });
  }
  const names = valid.map((d) => t(`programs.weekdayFull.${WEEKDAY_KEYS[d]}`));
  return formatTemplate(t, "programs.everyWeekday", {
    day: names.join(", "),
  });
}

function ListingCard({ row, href }: { row: Row; href: string }) {
  const { t, locale } = useLanguage();
  const { course } = row;
  const priceLine = [
    row.price != null ? `$${Number(row.price.toFixed(0))}` : null,
    durationLabel(row.durationMinutes, t),
  ]
    .filter(Boolean)
    .join(" · ");
  const weekday = weekdayLine(row.weekdays, t, locale);
  const age = ageRangeLabel(course, locale);
  const district = row.district
    ? locale === "zh-TW"
      ? row.district.zh
      : row.district.en
    : "";

  return (
    <Link
      href={href}
      data-testid="program-listing-card"
      className="group flex h-full flex-col overflow-hidden rounded-[12px] bg-white shadow-[0_5px_14px_rgba(0,0,0,0.12)] transition-shadow duration-200 hover:shadow-[0_6px_16px_rgba(0,0,0,0.16)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-classz-400"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-classz-50">
        <img
          src={programImage(course.id, course.image_url)}
          alt={course.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
        />
        <SaveCourseButton courseId={course.id} />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-[15px] font-[590] leading-5 text-ink">
          {course.name}
        </h3>
        <div className="flex items-center justify-between gap-2">
          {priceLine ? (
            <p className="text-sm font-[590] text-ink">{priceLine}</p>
          ) : null}
          {/* star + mock-fallback rating — same value the star Filter
              reads (courseRating), swapped for real aggregates when the
              reviews feature lands */}
          <span className="ml-auto flex shrink-0 items-center gap-[4px]">
            <Star
              aria-hidden
              className="h-3.5 w-3.5 text-[#222222]"
              strokeWidth={0}
              fill="#222222"
            />
            <span className="text-[12px] leading-[15px] text-[#222222]">
              {row.rating}
            </span>
          </span>
        </div>
        {weekday || district || age ? (
          <div className="mt-auto flex items-center gap-2 pt-1 text-xs leading-4 text-[#5E5E5E]">
            <div className="flex min-w-0 items-center gap-2">
              {weekday ? <p className="shrink-0">{weekday}</p> : null}
              {district ? (
                <div className="flex min-w-0 items-center gap-1">
                  <MapPin
                    aria-hidden
                    className="h-3.5 w-3.5 shrink-0"
                    strokeWidth={1.5}
                  />
                  <p className="truncate">{district}</p>
                </div>
              ) : null}
            </div>
            {age ? <p className="ml-auto shrink-0">{age}</p> : null}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
