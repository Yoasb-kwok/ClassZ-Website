"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Search } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import {
  HK_ISLAND_DISTRICTS,
  KOWLOON_DISTRICTS,
  NEW_TERRITORIES_DISTRICTS,
  type District,
} from "@/lib/locations";

/**
 * Shared listing search toolbar — the segmented [Category | Location | …]
 * frame connected to the search bar (user-directed redesign approved from
 * `demo/programs-list-redesign.html`, 2026-08-27), now reused by /programs,
 * /workshops, /trials AND /centres so the four listings stop drifting.
 *
 * Presentational only: filter state, popover coordination (`openPop`) and
 * the row-2 action buttons stay with the caller (`actions` slot renders
 * inside the toolbar's max-width container, right under the search bar).
 * The middle segment slot carries the per-page third filter — Date Range on
 * workshops/trials, Weekday on programs, nothing on /centres.
 */

export type ToolbarPop =
  "category" | "location" | "date" | "weekday" | "filter" | null;

/** district pill — filter-sidebar Pill (#3816:21052 chrome) */
export function Pill({
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

/** category checkbox row (interactive) */
export function CheckRow({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected?: boolean;
  onToggle?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-5 text-left"
    >
      <span
        aria-hidden
        className={`flex h-4 w-4 items-center justify-center rounded-[4px] border ${
          selected
            ? "border-[#0ABAB5] bg-[rgba(10,186,181,0.35)]"
            : "border-[#B0B0B0] bg-white"
        }`}
      />
      <span className="text-sm leading-[21px] text-ink">{label}</span>
    </button>
  );
}

/** collapsible region block inside the Location popover */
export function LocationRegion({
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

/** active-filter count badge on a segment button */
function CountBadge({ count }: { count: number }) {
  return (
    <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[rgba(10,186,181,0.3)] px-[5px] text-[11px] font-[weight:590] leading-none">
      {count}
    </span>
  );
}

const SEG_BTN =
  "flex w-full items-center justify-start gap-[6px] px-5 text-left text-[15px] leading-none text-ink transition-colors hover:bg-black/[0.03] aria-expanded:bg-[rgba(10,186,181,0.06)]";
const SEG_WRAP = "relative flex min-w-0 flex-1";
const POPOVER =
  "absolute left-0 top-[calc(100%+8px)] z-30 w-full rounded-[12px] bg-white p-5 text-left shadow-[0_6px_16px_2px_rgba(0,0,0,0.12)]";

export type CategoryOption = { key: string; label: string };

export function ListingToolbar({
  openPop,
  onTogglePop,
  categoryOptions,
  selectedCategories,
  onToggleCategory,
  showCategory = true,
  selectedDistricts,
  onToggleDistrict,
  showLocation = true,
  middle,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  actions = null,
}: {
  openPop: ToolbarPop;
  onTogglePop: (pop: Exclude<ToolbarPop, null>) => void;
  categoryOptions: CategoryOption[];
  selectedCategories: Set<string>;
  onToggleCategory: (key: string) => void;
  showCategory?: boolean;
  selectedDistricts: Set<string>;
  onToggleDistrict: (slug: string) => void;
  showLocation?: boolean;
  middle?: {
    id: Exclude<ToolbarPop, null>;
    label: string;
    count: number;
    highlight?: boolean;
    popoverClassName?: string;
    children: ReactNode;
  };
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  actions?: ReactNode;
}) {
  const { t } = useLanguage();
  const rootRef = useRef<HTMLDivElement>(null);

  /* close the open popover on outside click — toggle the currently-open
     key (toggling it again closes); no-op when nothing is open */
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node) && openPop != null) {
        onTogglePop(openPop);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [openPop, onTogglePop]);

  const categoryCount = selectedCategories.size;
  const locationCount = selectedDistricts.size;

  return (
    <div ref={rootRef}>
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-16 lg:px-20">
        {/* Filter + search — demo design 2026-08-27 (no capture): segmented
            box aligned to the card grid (974 @1440: container 1102, pad
            48/80), connected to the search bar (shared border, bottom-only
            radius). Mobile stacks the sections (spec-silent, demo media). */}
        <div className="flex flex-col divide-y divide-[#B0B0B0] rounded-t-[8px] border border-b-0 border-[#B0B0B0] bg-white md:h-[56px] md:flex-row md:divide-x md:divide-y-0">
          {/* Category — filters on the listing's category field */}
          {showCategory ? (
            <div className={SEG_WRAP}>
              <button
                type="button"
                aria-expanded={openPop === "category"}
                onClick={() => onTogglePop("category")}
                className={SEG_BTN}
              >
                {t("programs.category")}
                {categoryCount > 0 ? (
                  <CountBadge count={categoryCount} />
                ) : null}
                <ChevronDown
                  aria-hidden
                  className={`h-4 w-4 shrink-0 text-[#5E5E5E] transition-transform ${
                    openPop === "category" ? "rotate-180" : ""
                  }`}
                  strokeWidth={1.16}
                />
              </button>
              {openPop === "category" ? (
                <div className={`${POPOVER} md:w-[200px]`}>
                  <h4 className="mb-4 text-[16px] font-[weight:590] leading-[19px]">
                    {t("programs.category")}
                  </h4>
                  <div className="flex flex-col gap-4">
                    {categoryOptions.map((option) => (
                      <CheckRow
                        key={option.key}
                        label={option.label}
                        selected={selectedCategories.has(option.key)}
                        onToggle={() => onToggleCategory(option.key)}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Location — REAL district filter (regions → pills) */}
          {showLocation ? (
            <div className={SEG_WRAP}>
              <button
                type="button"
                aria-expanded={openPop === "location"}
                onClick={() => onTogglePop("location")}
                className={`${SEG_BTN} ${locationCount > 0 ? "text-classz-500" : ""}`}
              >
                {t("programs.locationFilter")}
                {locationCount > 0 ? (
                  <CountBadge count={locationCount} />
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
                <div
                  className={`${POPOVER} max-h-[380px] overflow-auto md:w-[420px]`}
                >
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
                        selected={selectedDistricts}
                        onToggle={onToggleDistrict}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Middle segment — Date Range (workshops/trials) or Weekday
              (programs); omitted entirely on /centres */}
          {middle ? (
            <div className={SEG_WRAP}>
              <button
                type="button"
                aria-expanded={openPop === middle.id}
                onClick={() => onTogglePop(middle.id)}
                className={`${SEG_BTN} ${middle.count > 0 || middle.highlight ? "text-classz-500" : ""}`}
              >
                {middle.label}
                {middle.count > 0 ? <CountBadge count={middle.count} /> : null}
                <ChevronDown
                  aria-hidden
                  className={`h-4 w-4 shrink-0 text-[#5E5E5E] transition-transform ${
                    openPop === middle.id ? "rotate-180" : ""
                  }`}
                  strokeWidth={1.16}
                />
              </button>
              {openPop === middle.id ? (
                <div
                  className={`${POPOVER} ${middle.popoverClassName ?? "md:w-[360px]"}`}
                >
                  <h4 className="mb-4 text-[16px] font-[weight:590] leading-[19px]">
                    {middle.label}
                  </h4>
                  {middle.children}
                </div>
              ) : null}
            </div>
          ) : null}
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
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="w-full bg-transparent text-[16px] leading-[19px] text-ink placeholder:text-shade-400 focus:outline-none"
          />
        </div>

        {/* Row 2 — Filter | Budget | Class Size (caller-owned actions) */}
        {actions ? (
          <div className="mt-4 flex flex-wrap gap-2 pb-12">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}
