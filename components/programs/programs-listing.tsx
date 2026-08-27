"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Heart, MapPin, Search } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useLanguage } from "@/components/language-provider";
import {
  HK_ISLAND_DISTRICTS,
  KOWLOON_DISTRICTS,
  NEW_TERRITORIES_DISTRICTS,
  districtLabel,
  findDistrict,
  type District,
} from "@/lib/locations";
import { programImage } from "@/lib/program-images";
import {
  classesForCourse,
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
 * - Date window (2026-08-27): REAL — date-to-date span overlap, weekday
 *   chips, time window, duration; all from session start/end times
 * - Filter window (2026-08-27): INERT — exclude-star tiers + service tags
 *   (no public API rating / class tag_values fields yet)
 * - Age (2026-08-27): REAL age_tag facet, own segment next to Date Range
 * - Budget/Class Size sorts: REAL (detail-endpoint prices passed in;
 *   class capacity from classes)
 * - Category: inert "coming soon" chrome (no API category field)
 * - Card star+rating row and service tag pills: OMITTED (no public API
 *   fields; WorkshopCard precedent) — see INDEX.md.
 * - Card links carry ?dates=1 → detail opens with lesson dates expanded.
 */

const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

/** inert star-exclusion tiers + service tags — the public API has no rating
 *  or class tag_values fields yet, so these render as "coming soon" chrome. */
const STAR_TIERS = [1, 2, 3, 4] as const;
const SERVICE_TAG_KEYS = [
  "sen",
  "smallClass",
  "examPathway",
  "performance",
] as const;

/** demo CSS pbox.date — sidebar price box #1973:20101 chrome (105×57 r8).
 *  Generalized 2026-08-27: also carries the date-window's time (type=time)
 *  and duration (type=number, hours) inputs on the same chrome.
 *  2026-08-27 tweak: compact white bar (h-10), time rendered as 24h HH:MM
 *  text (no AM/PM), number input rejects illegal (negative/NaN) values. */
function DateBox({
  labelKey,
  value,
  onChange,
  type = "date",
  step,
  placeholder,
}: {
  labelKey: string;
  value: string;
  onChange: (v: string) => void;
  type?: "date" | "time" | "number";
  step?: string;
  placeholder?: string;
}) {
  const { t } = useLanguage();
  const isTime = type === "time";
  return (
    <label className="flex h-10 w-[150px] flex-col justify-center gap-[2px] rounded-[8px] border border-[#B0B0B0] bg-white px-3">
      <span className="text-[10px] font-normal leading-[12px] text-[#717171]">
        {t(labelKey)}
      </span>
      <input
        type={isTime ? "text" : type}
        inputMode={type === "number" ? "decimal" : undefined}
        min={type === "number" ? "0" : undefined}
        step={step}
        maxLength={isTime ? 5 : undefined}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          if (isTime) {
            onChange(v.replace(/[^\d:]/g, "").slice(0, 5));
            return;
          }
          if (type === "number") {
            if (v === "") return onChange("");
            const n = Number(v);
            if (!Number.isFinite(n) || n < 0) return; // exclude illegal input
            onChange(v);
            return;
          }
          onChange(v);
        }}
        className="w-full bg-transparent text-[14px] leading-[17px] text-ink placeholder:text-[#B0B0B0] focus:outline-none"
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

/** disabled checkbox row — sidebar CheckRow chrome (#1979:739x) */
function CheckRow({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-5">
      <span
        aria-hidden
        className="flex h-4 w-4 items-center justify-center rounded-[4px] border border-[#B0B0B0] bg-white"
      />
      <span className="text-sm leading-[21px] text-ink">{label}</span>
    </div>
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
  /** per-session facts for the date window (weekday / time / duration):
   *  day = getDay(), start/end = minutes since midnight, dur = minutes. */
  slots: {
    day: number | null;
    start: number | null;
    end: number | null;
    dur: number | null;
  }[];
  /** union of service-tag codes across the course's sessions */
  tags: Set<string>;
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
/** "HH:MM" → minutes since midnight */
const parseHM = (v: string): number | null => {
  const m = v.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
};
/** age_tag like "3-6", "5-8", "6-12", "10+" → { min, max }; "+" ⇒ max
 *  Infinity. Returns null when the string carries no numeric age. */
const parseAgeRange = (v: string): { min: number; max: number } | null => {
  if (!v) return null;
  const nums = v.match(/\d+/g);
  if (!nums || nums.length === 0) return null;
  const min = Math.min(...nums.map(Number));
  const max = /\+/.test(v) ? Infinity : Math.max(...nums.map(Number));
  return { min, max };
};
/** star tier = round(rating) clamped 1–5; null when no usable rating. */
const starTier = (rating: number | null | undefined): number | null => {
  const r = Number(rating);
  if (rating == null || Number.isNaN(r) || r <= 0) return null;
  return Math.min(5, Math.max(1, Math.round(r)));
};
/** collect tag codes from a class tag_values object (string values, and
 *  string items of array values — covers {type: code} and {type: [codes]}). */
const tagCodesFrom = (
  tv: Record<string, unknown> | null | undefined,
): string[] => {
  if (!tv) return [];
  const codes: string[] = [];
  for (const v of Object.values(tv)) {
    if (typeof v === "string") codes.push(v);
    else if (Array.isArray(v)) {
      for (const x of v) if (typeof x === "string") codes.push(x);
    }
  }
  return codes;
};

export function ProgramsListing({
  courses,
  classes,
  prices,
}: {
  courses: PublicCourse[];
  classes: PublicClass[];
  /** per-course real prices (detail-endpoint fetch in the route) */
  prices: Record<number, number>;
}) {
  const { t } = useLanguage();

  const [query, setQuery] = useState("");
  const [districts, setDistricts] = useState<Set<string>>(new Set());
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  /* date window 2026-08-27 — weekday chips (0=Sun), time window, duration
   * (hours). All REAL: derived from session start_time/end_time. */
  const [weekdays, setWeekdays] = useState<Set<number>>(new Set());
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");
  const [durFrom, setDurFrom] = useState("");
  const [durTo, setDurTo] = useState("");
  /* Filter window — star-exclusion (course.rating) + service tags
   * (class tag_values). Age is its own segment next to Date Range. */
  const [ageFrom, setAgeFrom] = useState("");
  const [ageTo, setAgeTo] = useState("");
  const [excludedStars, setExcludedStars] = useState<Set<number>>(new Set());
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  /** which popover is open — only one at a time (demo behavior) */
  const [openPop, setOpenPop] = useState<
    "category" | "location" | "date" | "age" | "filter" | null
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
      .filter(
        (c) => c.course_type !== "short_term" && c.course_type !== "summer",
      )
      .map((course) => {
        const sessions = classesForCourse(classes, course);
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
        /* per-session weekday/time/duration facts (date window) */
        const slots = sessions.map((s) => {
          const st = new Date(s.start_time);
          const en = new Date(s.end_time);
          const badSt = Number.isNaN(st.getTime());
          const badEn = Number.isNaN(en.getTime());
          const start = badSt ? null : st.getHours() * 60 + st.getMinutes();
          const end = badEn ? null : en.getHours() * 60 + en.getMinutes();
          const day = badSt ? null : st.getDay();
          const dur =
            start != null && end != null && end > start ? end - start : null;
          return { day, start, end, dur };
        });
        const tags = new Set<string>();
        for (const s of sessions) {
          for (const code of tagCodesFrom(s.tag_values)) tags.add(code);
        }
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
          slots,
          tags,
        };
      });
  }, [courses, classes, prices]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const fromDay = parseDatePicker(dateFrom);
    const toDay = parseDatePicker(dateTo);
    /* date-window session-level constraints */
    const wdActive = weekdays.size > 0;
    const tFrom = parseHM(timeFrom);
    const tTo = parseHM(timeTo);
    const timeActive = timeFrom !== "" || timeTo !== "";
    const dFromH =
      durFrom !== "" && !Number.isNaN(Number(durFrom)) ? Number(durFrom) : null;
    const dToH =
      durTo !== "" && !Number.isNaN(Number(durTo)) ? Number(durTo) : null;
    const durActive = dFromH != null || dToH != null;
    const aFrom =
      ageFrom !== "" && !Number.isNaN(Number(ageFrom)) ? Number(ageFrom) : null;
    const aTo =
      ageTo !== "" && !Number.isNaN(Number(ageTo)) ? Number(ageTo) : null;
    const out = rows.filter((row) => {
      if (districts.size > 0) {
        const district = findDistrict(row.course.location);
        if (!district || !districts.has(district.slug)) return false;
      }
      if (aFrom != null || aTo != null) {
        const r = parseAgeRange(row.course.age_tag ?? "");
        if (r == null) return false;
        if (aFrom != null && r.max < aFrom) return false;
        if (aTo != null && r.min > aTo) return false;
      }
      if (excludedStars.size > 0) {
        const tier = starTier(row.course.rating);
        if (tier == null || excludedStars.has(tier)) return false;
      }
      if (selectedTags.size > 0) {
        for (const tag of selectedTags) {
          if (!row.tags.has(tag)) return false;
        }
      }
      if (fromDay != null || toDay != null) {
        /* overlap semantics (demo): course runs during the selected period */
        if (row.minDay == null || row.maxDay == null) return false;
        if (fromDay != null && row.maxDay < fromDay) return false;
        if (toDay != null && row.minDay > toDay) return false;
      }
      if (wdActive || timeActive || durActive) {
        /* ANY session satisfying all active constraints (weekday falls back
         * to course.weekday when the course has no sessions — but only if
         * time/duration are unset, which need session data). */
        const dayOk = (d: number | null) => d != null && weekdays.has(d);
        const slotOk = (slot: (typeof row.slots)[number]) => {
          if (wdActive && !dayOk(slot.day)) return false;
          if (tFrom != null && (slot.start == null || slot.start < tFrom))
            return false;
          if (tTo != null && (slot.end == null || slot.end > tTo)) return false;
          if (dFromH != null && (slot.dur == null || slot.dur < dFromH * 60))
            return false;
          if (dToH != null && (slot.dur == null || slot.dur > dToH * 60))
            return false;
          return true;
        };
        if (row.slots.some(slotOk)) {
          /* session-level constraints satisfied */
        } else if (
          !timeActive &&
          !durActive &&
          wdActive &&
          row.slots.length === 0 &&
          dayOk(row.course.weekday)
        ) {
          /* weekday-only, no sessions: course.weekday fallback */
        } else {
          return false;
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

    /* one sort active at a time (demo it.1 fix); null-keyed rows sink */
    if (activeSort === "budget") {
      out.sort((a, b) => {
        if (a.price == null && b.price == null) return 0;
        if (a.price == null) return 1;
        if (b.price == null) return -1;
        return (budgetDir === "asc" ? 1 : -1) * (a.price - b.price);
      });
    } else if (activeSort === "size") {
      out.sort((a, b) => {
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
    dateFrom,
    dateTo,
    weekdays,
    timeFrom,
    timeTo,
    durFrom,
    durTo,
    ageFrom,
    ageTo,
    excludedStars,
    selectedTags,
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

  const toggleStar = (n: number) =>
    setExcludedStars((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  const toggleTag = (k: string) =>
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  const clearFilters = () => {
    setQuery("");
    setDistricts(new Set());
    setDateFrom("");
    setDateTo("");
    setWeekdays(new Set());
    setTimeFrom("");
    setTimeTo("");
    setDurFrom("");
    setDurTo("");
    setAgeFrom("");
    setAgeTo("");
    setExcludedStars(new Set());
    setSelectedTags(new Set());
    setActiveSort(null);
    setBudgetDir("asc");
    setSizeDir("desc");
  };

  const toggleWeekday = (d: number) =>
    setWeekdays((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });

  /* badge = number of active constraint groups in the date window */
  const dateCount =
    (dateFrom || dateTo ? 1 : 0) +
    (weekdays.size > 0 ? 1 : 0) +
    (timeFrom || timeTo ? 1 : 0) +
    (durFrom || durTo ? 1 : 0);
  const filterCount = excludedStars.size + selectedTags.size;
  const segWrap = "relative flex min-w-0 flex-1";
  const segBtn =
    "flex w-full items-center justify-start gap-[6px] px-5 text-left text-[15px] leading-none text-ink transition-colors hover:bg-black/[0.03] aria-expanded:bg-[rgba(10,186,181,0.06)] max-md:py-3.5";

  return (
    <main className="min-h-screen bg-white text-ink">
      <Navbar />
      <div className="flex flex-col lg:mx-auto lg:max-w-[1440px]" ref={rootRef}>
        {/* Intro — node #1626:16265 (unchanged from the previous listing) */}
        <section className="flex flex-col items-center gap-5 px-6 py-8 text-center md:px-20">
          <h1 className="w-full text-[40px] font-[weight:590] leading-[48px] text-ink">
            {t("programs.title")}
          </h1>
          <p className="max-w-[884px] text-[20px] leading-[30px] text-ink">
            {t("programs.subtitle")}
          </p>
        </section>

        {/* Filter + search — demo design 2026-08-27 (no capture): segmented
            box aligned to the card grid (974 @1440: container 1102, pad
            48/80), connected to the search bar (shared border, bottom-only
            radius). Mobile stacks the sections (spec-silent, demo media). */}
        <div className="mx-auto w-full max-w-[1102px] px-6 md:pl-12 md:pr-20">
          <div className="flex flex-col divide-y divide-[#B0B0B0] rounded-t-[8px] border border-b-0 border-[#B0B0B0] bg-white md:h-[56px] md:flex-row md:divide-x md:divide-y-0">
            {/* Category — inert until the API exposes a category field
                (filter-sidebar.tsx same policy: chrome visible, coming soon) */}
            <div className={segWrap}>
              <button
                type="button"
                aria-expanded={openPop === "category"}
                onClick={() =>
                  setOpenPop(openPop === "category" ? null : "category")
                }
                title={t("programs.comingSoon")}
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
                <div className="popover-in absolute left-0 top-full z-30 w-full rounded-b-[12px] rounded-tr-[12px] bg-white p-5 text-left shadow-[0_6px_16px_2px_rgba(0,0,0,0.12)] md:w-[200px]">
                  <h4 className="mb-4 text-[16px] font-[weight:590] leading-[19px]">
                    {t("programs.category")}
                  </h4>
                  <fieldset
                    disabled
                    className="flex flex-col gap-4"
                    title={t("programs.comingSoon")}
                  >
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
                      />
                    ))}
                  </fieldset>
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
                <div className="popover-in absolute left-0 top-full z-30 max-h-[380px] w-full overflow-auto rounded-b-[12px] rounded-tr-[12px] bg-white p-5 text-left shadow-[0_6px_16px_2px_rgba(0,0,0,0.12)] md:w-[420px]">
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
                <div className="popover-in absolute left-0 top-full z-30 max-h-[480px] w-full overflow-auto rounded-b-[12px] rounded-tr-[12px] bg-white p-5 text-left shadow-[0_6px_16px_2px_rgba(0,0,0,0.12)] md:w-[360px]">
                  {/* date-to-date — course span overlap */}
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
                  {/* weekday chips — any session on the chosen days */}
                  <h4 className="mb-3 mt-5 text-[16px] font-[weight:590] leading-[19px]">
                    {t("programs.daysOfWeek")}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {WEEKDAY_KEYS.map((key, d) => (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={weekdays.has(d)}
                        onClick={() => toggleWeekday(d)}
                        className={`flex h-[25px] items-center rounded-[4px] px-2 py-1 text-[12px] leading-[14px] text-ink transition-colors ${
                          weekdays.has(d)
                            ? "bg-[rgba(10,186,181,0.3)] font-[weight:590]"
                            : "bg-[rgba(34,34,34,0.1)] font-normal hover:bg-[rgba(34,34,34,0.16)]"
                        }`}
                      >
                        {t(`programs.weekday.${key}`)}
                      </button>
                    ))}
                  </div>
                  {/* time window — session fits inside */}
                  <h4 className="mb-3 mt-5 text-[16px] font-[weight:590] leading-[19px]">
                    {t("programs.time")}
                  </h4>
                  <div className="flex gap-4">
                    <DateBox
                      labelKey="programs.from"
                      type="time"
                      placeholder="00:00"
                      value={timeFrom}
                      onChange={setTimeFrom}
                    />
                    <DateBox
                      labelKey="programs.to"
                      type="time"
                      placeholder="00:00"
                      value={timeTo}
                      onChange={setTimeTo}
                    />
                  </div>
                  {/* duration (hours) — session length within range */}
                  <h4 className="mb-3 mt-5 text-[16px] font-[weight:590] leading-[19px]">
                    {t("programs.durationHours")}
                  </h4>
                  <div className="flex gap-4">
                    <DateBox
                      labelKey="programs.from"
                      type="number"
                      step="0.5"
                      placeholder="0"
                      value={durFrom}
                      onChange={setDurFrom}
                    />
                    <DateBox
                      labelKey="programs.to"
                      type="number"
                      step="0.5"
                      placeholder="0"
                      value={durTo}
                      onChange={setDurTo}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            {/* Age — REAL youngest→oldest range from age_tag (next to Date) */}
            <div className={segWrap}>
              <button
                type="button"
                aria-expanded={openPop === "age"}
                onClick={() => setOpenPop(openPop === "age" ? null : "age")}
                className={`${segBtn} ${
                  ageFrom !== "" || ageTo !== "" ? "text-classz-500" : ""
                }`}
              >
                {t("programs.age")}
                {ageFrom !== "" || ageTo !== "" ? (
                  <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[rgba(10,186,181,0.3)] px-[5px] text-[11px] font-[weight:590] leading-none">
                    1
                  </span>
                ) : null}
                <ChevronDown
                  aria-hidden
                  className={`h-4 w-4 shrink-0 text-[#5E5E5E] transition-transform ${
                    openPop === "age" ? "rotate-180" : ""
                  }`}
                  strokeWidth={1.16}
                />
              </button>
              {openPop === "age" ? (
                <div className="popover-in absolute left-0 top-full z-30 max-h-[320px] w-full overflow-auto rounded-b-[12px] rounded-tr-[12px] bg-white p-5 text-left shadow-[0_6px_16px_2px_rgba(0,0,0,0.12)] md:w-[360px]">
                  <h4 className="mb-4 text-[16px] font-[weight:590] leading-[19px]">
                    {t("programs.age")}
                  </h4>
                  <div className="flex gap-4">
                    <DateBox
                      labelKey="programs.from"
                      type="number"
                      step="1"
                      placeholder="3"
                      value={ageFrom}
                      onChange={setAgeFrom}
                    />
                    <DateBox
                      labelKey="programs.to"
                      type="number"
                      step="1"
                      placeholder="12"
                      value={ageTo}
                      onChange={setAgeTo}
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
                className={`flex h-10 items-center gap-[6px] rounded-[8px] border bg-white px-3 text-[14px] leading-[17px] transition-colors hover:border-ink ${
                  filterCount > 0
                    ? "border-ink text-classz-500"
                    : "border-[#B0B0B0] text-ink"
                }`}
              >
                {t("programs.filter")}
                {filterCount > 0 ? (
                  <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[rgba(10,186,181,0.3)] px-[5px] text-[11px] font-[weight:590] leading-none">
                    {filterCount}
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
                <div className="popover-in absolute left-0 top-[calc(100%-5px)] z-30 max-h-[420px] w-full overflow-auto rounded-b-[12px] rounded-tr-[12px] bg-white p-5 text-left shadow-[0_6px_16px_2px_rgba(0,0,0,0.12)] md:w-[280px]">
                  <h4 className="text-[16px] font-[weight:590] leading-[19px]">
                    {t("programs.excludeStarTiers")}
                  </h4>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {STAR_TIERS.map((n) => (
                      <button
                        key={n}
                        type="button"
                        aria-pressed={excludedStars.has(n)}
                        onClick={() => toggleStar(n)}
                        className={`flex h-[25px] items-center rounded-[4px] px-2 py-1 text-[12px] leading-[14px] text-ink transition-colors ${
                          excludedStars.has(n)
                            ? "bg-[rgba(10,186,181,0.3)] font-[weight:590]"
                            : "bg-[rgba(34,34,34,0.1)] font-normal hover:bg-[rgba(34,34,34,0.16)]"
                        }`}
                      >
                        {`${n}★`}
                      </button>
                    ))}
                  </div>
                  <h4 className="mt-5 text-[16px] font-[weight:590] leading-[19px]">
                    {t("programs.serviceTagsTitle")}
                  </h4>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {SERVICE_TAG_KEYS.map((k) => (
                      <button
                        key={k}
                        type="button"
                        aria-pressed={selectedTags.has(k)}
                        onClick={() => toggleTag(k)}
                        className={`flex h-[25px] items-center rounded-[4px] px-2 py-1 text-[12px] leading-[14px] text-ink transition-colors ${
                          selectedTags.has(k)
                            ? "bg-[rgba(10,186,181,0.3)] font-[weight:590]"
                            : "bg-[rgba(34,34,34,0.1)] font-normal hover:bg-[rgba(34,34,34,0.16)]"
                        }`}
                      >
                        {t(`programs.serviceTags.${k}`)}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Budget — REAL price sort (default → asc → desc → default) */}
            <button
              type="button"
              onClick={() => {
                if (activeSort !== "budget") {
                  setActiveSort("budget");
                  setBudgetDir("asc");
                } else if (budgetDir === "asc") {
                  setBudgetDir("desc");
                } else {
                  setActiveSort(null);
                }
              }}
              aria-pressed={activeSort === "budget"}
              className="flex h-10 items-center gap-[6px] rounded-[8px] border border-[#B0B0B0] bg-white px-3 text-[14px] leading-[17px] text-ink transition-colors hover:border-ink"
            >
              {t("programs.budget")}
              {activeSort === "budget" ? (
                <span className="text-[12px] font-normal text-[#5E5E5E]">
                  {t(
                    budgetDir === "asc"
                      ? "programs.lowToHigh"
                      : "programs.highToLow",
                  )}
                </span>
              ) : (
                <span className="text-[12px] font-normal text-[#5E5E5E]">
                  {t("programs.default")}
                </span>
              )}
            </button>

            {/* Class Size — REAL capacity sort (default → desc → asc → default) */}
            <button
              type="button"
              onClick={() => {
                if (activeSort !== "size") {
                  setActiveSort("size");
                  setSizeDir("desc");
                } else if (sizeDir === "desc") {
                  setSizeDir("asc");
                } else {
                  setActiveSort(null);
                }
              }}
              aria-pressed={activeSort === "size"}
              className="flex h-10 items-center gap-[6px] rounded-[8px] border border-[#B0B0B0] bg-white px-3 text-[14px] leading-[17px] text-ink transition-colors hover:border-ink"
            >
              {t("programs.classSize")}
              {activeSort === "size" ? (
                <span className="text-[12px] font-normal text-[#5E5E5E]">
                  {t(
                    sizeDir === "desc"
                      ? "programs.largeToSmall"
                      : "programs.smallToLarge",
                  )}
                </span>
              ) : (
                <span className="text-[12px] font-normal text-[#5E5E5E]">
                  {t("programs.default")}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Card list — gray panel bounding the list (demo it.4). Empty
            state replaces the panel (demo no-cards behavior). */}
        <div className="mx-auto w-full max-w-[1102px] px-6 pb-16 md:pl-12 md:pr-20">
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
              className="grid grid-cols-1 gap-8 rounded-[12px] bg-[#F7F7F7] p-6 max-md:gap-6 max-md:p-4 sm:grid-cols-2 lg:grid-cols-3"
              data-testid="programs-list-panel"
            >
              {filtered.map((row) => (
                <li key={row.course.id} className="w-full">
                  <ListingCard row={row} />
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

/** Listing card — workshop-capture chrome (#3863:17550 family) with demo
 *  deltas (r9.14 + shadow). Vertical (image top, panel below) for the
 *  3-across grid (2026-08-27). Rows: title+heart / price / date span ·
 *  Every X / Age · Max N per class / location. Star+rating and tag pills
 *  OMITTED (no API). */
function ListingCard({ row }: { row: Row }) {
  const { t, locale } = useLanguage();
  const { course } = row;
  const weekdayKey =
    course.weekday != null && course.weekday >= 0 && course.weekday <= 6
      ? WEEKDAY_KEYS[course.weekday]
      : null;
  const dateSpan =
    row.fromLabel && row.toLabel ? `${row.fromLabel} – ${row.toLabel}` : null;
  const everyLine = weekdayKey
    ? formatTemplate(t, "programs.everyWeekday", {
        day: t(`programs.weekdayFull.${weekdayKey}`),
      })
    : null;
  const location = districtLabel(course.location, locale) || course.location;

  return (
    <Link
      href={`/programs/${course.id}?dates=1`}
      data-testid="program-listing-card"
      className="group flex w-full flex-col overflow-hidden rounded-[9.14px] bg-white shadow-[0_4.571px_12.189px_0_rgba(0,0,0,0.12)] transition-shadow duration-200 hover:shadow-[0_6px_16px_rgba(0,0,0,0.16)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-classz-400"
    >
      {/* image panel — flexes (643 wide at the 974 card) */}
      <div className="relative aspect-[643/253] w-full overflow-hidden bg-classz-50">
        <img
          src={programImage(course.id)}
          alt={course.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      {/* white panel #3863:17554 — 331 fixed, pad 14 */}
      <div className="w-full shrink-0 bg-white p-[14px]">
        <div className="flex h-full flex-col justify-between gap-2.5">
          {/* top: title + heart (demo heart 27.23 box, 22.69×20.23 #BDBDBD/2.26) */}
          <div className="flex items-start justify-between gap-[40.63px]">
            <div className="flex min-w-0 flex-col gap-[7.62px]">
              <h3 className="line-clamp-2 w-full text-[22px] font-[weight:590] leading-[26px] text-ink">
                {course.name}
              </h3>
              {row.price != null ? (
                <p className="text-[18px] leading-[21px] text-ink">
                  ${Number(row.price.toFixed(0))} {t("programs.perCourse")}
                </p>
              ) : null}
            </div>
            <span
              aria-hidden
              className="flex h-[27.23px] w-[27.23px] shrink-0 items-center justify-center"
            >
              <Heart
                className="h-[20.23px] w-[22.69px] text-[#BDBDBD]"
                strokeWidth={2.26}
                fill="none"
              />
            </span>
          </div>

          {/* details: date span / age + capacity / location */}
          <div className="flex flex-col gap-2.5">
            {dateSpan ? (
              <p className="text-[14px] leading-[17px] text-ink">
                {dateSpan}
                {everyLine ? ` · ${everyLine}` : ""}
              </p>
            ) : null}
            {course.age_tag || row.capacity != null ? (
              <p className="text-[14px] leading-[17px] text-[#5E5E5E]">
                {[
                  course.age_tag
                    ? t("programs.ageLabel").replace("{age}", course.age_tag)
                    : null,
                  row.capacity != null
                    ? formatTemplate(t, "programs.maxPerClass", {
                        count: row.capacity,
                      })
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            ) : null}
            {location ? (
              <div className="flex items-center gap-1">
                <MapPin
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-[#5E5E5E]"
                  strokeWidth={1.5}
                />
                <p className="truncate text-[14px] leading-[17px] text-[#5E5E5E]">
                  {location}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
