"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, MapPin, Search, Star } from "lucide-react";
import { SaveCourseButton } from "@/components/programs/save-course-button";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useLanguage } from "@/components/language-provider";
import {
  HK_ISLAND_DISTRICTS,
  KOWLOON_DISTRICTS,
  NEW_TERRITORIES_DISTRICTS,
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
import { formatTemplate } from "./format";

/**
 * /programs listing — user-directed redesign approved from the standalone
 * demo (`demo/programs-list-redesign.html`, 2026-08-27). NOT capture-exact:
 * the top filter bar + boxed list are new design (no 2408 frame); the wide
 * card chrome reuses workshop-capture values (#3863:17550 family) with demo
 * deltas: r9.14 + shadow (demo-approved) instead of the capture's flat card.
 *
 * Layout:
 * - segmented box [Category | Location | Date Range] connected to the search
 *   bar (#1988:7481 base), aligned to the card grid (974 @1440, pad 48/80)
 * - row below: Filter | Budget | Class Size (Filter leftmost per demo it.3)
 * - card list bounded in a gray #F7F7F7 r12 panel (demo it.4)
 *
 * Data honesty (Block B):
 * - Location: REAL (district pills, lib/locations)
 * - Date Range: REAL (PublicClass.start_time → per-course min/max day)
 * - Budget/Class Size sorts: REAL (detail-endpoint prices passed in;
 *   class capacity from classes)
 * - Category / star-exclusion / service tags: inert "coming soon" chrome
 *   (same policy as filter-sidebar.tsx — no API fields)
 * - Card star+rating row + service tag pills: OMITTED (no public API
 *   fields; WorkshopCard precedent) — see INDEX.md.
 * - Card links carry ?dates=1 → detail opens with lesson dates expanded.
 */

const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

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

/** district pill — filter-sidebar Pill (#3816:21052 chrome) */
function Pill({
  district,
  selected,
  onToggle,
}: {
  district: District;
  selected: boolean;
  onToggle: () => void;
}) {
  const { locale } = useLanguage();
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={`flex h-[25px] items-center rounded-[4px] px-2 py-1 text-[12px] leading-[14px] text-ink opacity-80 transition-colors ${
        selected
          ? "bg-[rgba(10,186,181,0.3)] font-[weight:590]"
          : "bg-[rgba(34,34,34,0.1)] font-normal hover:bg-[rgba(34,34,34,0.16)]"
      }`}
    >
      {locale === "zh-TW" ? district.zh : district.en}
    </button>
  );
}

/** category checkbox row */
function CheckRow({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected?: boolean;
  onToggle?: () => void;
}) {
  return (
    <button type="button" onClick={onToggle} className="flex items-center gap-5 text-left">
      <span
        aria-hidden
        className={`flex h-4 w-4 items-center justify-center rounded-[4px] border ${
          selected ? "border-[#0ABAB5] bg-[rgba(10,186,181,0.35)]" : "border-[#B0B0B0] bg-white"
        }`}
      />
      <span className="text-sm leading-[21px] text-ink">{label}</span>
    </button>
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

function matchesListingVariant(courseType: string | null | undefined, variant: ListingVariant) {
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

  const [query, setQuery] = useState("");
  const [districts, setDistricts] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<Set<string>>(new Set());
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  /** which popover is open — only one at a time (demo behavior) */
  const [openPop, setOpenPop] = useState<
    "category" | "location" | "date" | "filter" | null
  >(null);
  const [activeSort, setActiveSort] = useState<"budget" | "size" | null>(null);
  const [budgetDir, setBudgetDir] = useState<"asc" | "desc">("asc");
  const [sizeDir, setSizeDir] = useState<"desc" | "asc">("desc");

  const rootRef = useRef<HTMLDivElement>(null);

  /* close popovers on outside click */
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpenPop(null);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

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
      if (fromDay != null || toDay != null) {
        /* overlap semantics (demo): course runs during the selected period */
        if (row.minDay == null || row.maxDay == null) return false;
        if (fromDay != null && row.maxDay < fromDay) return false;
        if (toDay != null && row.minDay > toDay) return false;
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
        const ta = a.course.boost_paid_at ? new Date(a.course.boost_paid_at).getTime() : 0;
        const tb = b.course.boost_paid_at ? new Date(b.course.boost_paid_at).getTime() : 0;
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

  const clearFilters = () => {
    setQuery("");
    setDistricts(new Set());
    setCategories(new Set());
    setDateFrom("");
    setDateTo("");
    setActiveSort(null);
    setBudgetDir("asc");
    setSizeDir("desc");
  };

  const dateCount = dateFrom || dateTo ? 1 : 0;

  const segWrap = "relative flex min-w-0 flex-1";
  const segBtn =
    "flex w-full items-center justify-start gap-[6px] px-5 text-left text-[15px] leading-none text-ink transition-colors hover:bg-black/[0.03] aria-expanded:bg-[rgba(10,186,181,0.06)]";

  return (
    <main className="min-h-screen bg-white text-ink">
      <Navbar />
      <div className="flex flex-col lg:mx-auto lg:max-w-[1440px]" ref={rootRef}>
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

        {/* Filter + search — demo design 2026-08-27 (no capture): segmented
            box aligned to the card grid (974 @1440: container 1102, pad
            48/80), connected to the search bar (shared border, bottom-only
            radius). Mobile stacks the sections (spec-silent, demo media). */}
        <div className="mx-auto w-full max-w-[1440px] px-6 md:px-16 lg:px-20">
          <div className="flex flex-col divide-y divide-[#B0B0B0] rounded-t-[8px] border border-b-0 border-[#B0B0B0] bg-white md:h-[56px] md:flex-row md:divide-x md:divide-y-0">
            {/* Category — filters on course.category from centre listings */}
            <div className={segWrap}>
              <button
                type="button"
                aria-expanded={openPop === "category"}
                onClick={() =>
                  setOpenPop(openPop === "category" ? null : "category")
                }
                className={segBtn}
              >
                {t("programs.category")}
                <ChevronDown
                  aria-hidden
                  className={`h-4 w-4 shrink-0 text-[#5E5E5E] transition-transform ${
                    openPop === "category" ? "rotate-180" : ""
                  }`}
                  strokeWidth={1.16}
                />
              </button>
              {openPop === "category" ? (
                <div className="absolute left-0 top-[calc(100%+8px)] z-30 w-full rounded-[12px] bg-white p-5 text-left shadow-[0_6px_16px_2px_rgba(0,0,0,0.12)] md:w-[200px]">
                  <h4 className="mb-4 text-[16px] font-[weight:590] leading-[19px]">
                    {t("programs.category")}
                  </h4>
                  <div className="flex flex-col gap-4">
                    {(
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
                    ).map((key) => (
                      <CheckRow
                        key={key}
                        label={t(`programs.categories.${key}`)}
                        selected={categories.has(key)}
                        onToggle={() =>
                          setCategories((prev) => {
                            const next = new Set(prev);
                            if (next.has(key)) next.delete(key);
                            else next.add(key);
                            return next;
                          })
                        }
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Location — REAL district filter (regions → pills) */}
            <div className={segWrap}>
              <button
                type="button"
                aria-expanded={openPop === "location"}
                onClick={() =>
                  setOpenPop(openPop === "location" ? null : "location")
                }
                className={`${segBtn} ${districts.size > 0 ? "text-classz-500" : ""}`}
              >
                {t("programs.locationFilter")}
                {districts.size > 0 ? (
                  <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[rgba(10,186,181,0.3)] px-[5px] text-[11px] font-[weight:590] leading-none">
                    {districts.size}
                  </span>
                ) : null}
                <ChevronDown
                  aria-hidden
                  className={`h-4 w-4 shrink-0 text-[#5E5E5E] transition-transform ${
                    openPop === "location" ? "rotate-180" : ""
                  }`}
                  strokeWidth={1.16}
                />
              </button>
              {openPop === "location" ? (
                <div className="absolute left-0 top-[calc(100%+8px)] z-30 max-h-[380px] w-full overflow-auto rounded-[12px] bg-white p-5 text-left shadow-[0_6px_16px_2px_rgba(0,0,0,0.12)] md:w-[420px]">
                  <h4 className="mb-4 text-[16px] font-[weight:590] leading-[19px]">
                    {t("programs.locationFilter")}
                  </h4>
                  <div className="flex flex-col gap-4">
                    {[
                      {
                        titleKey: "programs.hkIsland",
                        list: HK_ISLAND_DISTRICTS,
                        defaultOpen: true,
                      },
                      {
                        titleKey: "programs.kowloon",
                        list: KOWLOON_DISTRICTS,
                        defaultOpen: false,
                      },
                      {
                        titleKey: "programs.newTerritories",
                        list: NEW_TERRITORIES_DISTRICTS,
                        defaultOpen: false,
                      },
                    ].map((region) => (
                      <LocationRegion
                        key={region.titleKey}
                        titleKey={region.titleKey}
                        districts={region.list}
                        defaultOpen={region.defaultOpen}
                        selected={districts}
                        onToggle={toggleDistrict}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Date Range — REAL (session date span, overlap semantics) */}
            <div className={segWrap}>
              <button
                type="button"
                aria-expanded={openPop === "date"}
                onClick={() => setOpenPop(openPop === "date" ? null : "date")}
                className={`${segBtn} ${dateCount > 0 ? "text-classz-500" : ""}`}
              >
                {t("programs.dateRange")}
                {dateCount > 0 ? (
                  <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[rgba(10,186,181,0.3)] px-[5px] text-[11px] font-[weight:590] leading-none">
                    {dateCount}
                  </span>
                ) : null}
                <ChevronDown
                  aria-hidden
                  className={`h-4 w-4 shrink-0 text-[#5E5E5E] transition-transform ${
                    openPop === "date" ? "rotate-180" : ""
                  }`}
                  strokeWidth={1.16}
                />
              </button>
              {openPop === "date" ? (
                <div className="absolute left-0 top-[calc(100%+8px)] z-30 w-full rounded-[12px] bg-white p-5 text-left shadow-[0_6px_16px_2px_rgba(0,0,0,0.12)] md:w-[360px]">
                  <h4 className="mb-4 text-[16px] font-[weight:590] leading-[19px]">
                    {t("programs.dateRange")}
                  </h4>
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
                </div>
              ) : null}
            </div>
          </div>

          {/* Search — #1988:7481 chrome, connected (bottom-only radius).
              Demo deviation: widened/aligned to the card grid (974 @1440). */}
          <div className="flex items-center gap-[4px] rounded-b-[8px] border border-[#B0B0B0] bg-white px-4 py-[18px]">
            <Search
              aria-hidden
              className="h-4 w-4 shrink-0 text-shade-400"
              strokeWidth={1.5}
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("programs.searchPlaceholder")}
              aria-label={t("programs.searchPlaceholder")}
              className="w-full bg-transparent text-[16px] leading-[19px] text-ink placeholder:text-shade-400 focus:outline-none"
            />
          </div>

          {/* Row 2 — Filter | Budget | Class Size (Filter leftmost per demo) */}
          <div className="mt-4 flex flex-wrap gap-2 pb-12">
            {/* Filter — inert until rating/service API fields exist
                (filter-sidebar.tsx same policy) */}
            <div className="relative">
              <button
                type="button"
                aria-expanded={openPop === "filter"}
                onClick={() =>
                  setOpenPop(openPop === "filter" ? null : "filter")
                }
                title={t("programs.comingSoon")}
                className="flex h-10 items-center gap-[6px] rounded-[8px] border border-[#B0B0B0] bg-white px-3 text-[14px] leading-[17px] text-ink transition-colors hover:border-ink"
              >
                {t("programs.filter")}
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
                  <fieldset
                    disabled
                    className="mt-4 flex flex-col gap-4"
                    title={t("programs.comingSoon")}
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n} className="flex items-center gap-5">
                        <span
                          aria-hidden
                          className="flex h-4 w-4 items-center justify-center rounded-[4px] border border-[#B0B0B0] bg-white"
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
                      </div>
                    ))}
                  </fieldset>
                  <h4 className="mt-5 text-[16px] font-[weight:590] leading-[19px]">
                    {t("programs.service")}
                  </h4>
                  <fieldset
                    disabled
                    className="mt-3 flex max-w-[240px] flex-wrap gap-2"
                    title={t("programs.comingSoon")}
                  >
                    {(
                      [
                        "sen",
                        "smallClass",
                        "examPathway",
                        "performance",
                      ] as const
                    ).map((key) => (
                      <span
                        key={key}
                        className="flex h-[25px] items-center rounded-[4px] bg-[rgba(34,34,34,0.1)] px-2 py-1 text-[12px] font-normal leading-[14px] text-ink opacity-80"
                      >
                        {t(`programs.serviceTags.${key}`)}
                      </span>
                    ))}
                  </fieldset>
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
          </div>
        </div>

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

/** Location region group inside the Location popover (accordion like the
 *  sidebar Place group — #3816:21054, first region open by default). */
function LocationRegion({
  titleKey,
  districts,
  selected,
  onToggle,
  defaultOpen,
}: {
  titleKey: string;
  districts: District[];
  selected: Set<string>;
  onToggle: (slug: string) => void;
  defaultOpen: boolean;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-2 text-ink"
      >
        <span className="text-xs leading-[14px]">{t(titleKey)}</span>
        <ChevronDown
          aria-hidden
          className={`h-4 w-4 text-[#5E5E5E] transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={1.16}
        />
      </button>
      {open ? (
        <div className="flex flex-wrap gap-2">
          {districts.map((d) => (
            <Pill
              key={d.slug}
              district={d}
              selected={selected.has(d.slug)}
              onToggle={() => onToggle(d.slug)}
            />
          ))}
        </div>
      ) : null}
    </div>
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
  const range = raw.replace(/歲$/u, "").replace(/\s*years?$/i, "").trim();
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

function weekdayLine(days: number[], t: (key: string) => string, locale: "en" | "zh-TW") {
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
        {priceLine ? (
          <p className="text-sm font-[590] text-ink">{priceLine}</p>
        ) : null}
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
