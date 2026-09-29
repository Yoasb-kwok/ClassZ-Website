"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Star } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useLanguage } from "@/components/language-provider";
import { findDistrict } from "@/lib/locations";
import { CENTRE_CATEGORIES } from "@/lib/register-center-validation";
import type { Centre } from "@/lib/centre-data";
import { formatTemplate } from "@/components/programs/format";
import {
  ListingToolbar,
  type ToolbarPop,
} from "@/components/programs/listing-toolbar";
import { CentreCard } from "./centre-card";

/**
 * W8 /centres listing — migrated (user decision 2026-09-29) from the old
 * SearchInput + Place-sidebar layout onto the trials/workshops listing
 * structure: shared ListingToolbar with [Category | Location] segments +
 * connected search bar, and a REAL star-rating Filter button (the only
 * row-2 action — centres have no price or class capacity to sort on, and
 * no dates to range over, so Date/Budget/Class Size are omitted).
 *
 * - Category filters `centre.category` (same 9 keys as CENTRE_CATEGORIES;
 *   matched case-insensitively — live API values like "Dance"/"STEM")
 * - Location filters `centre.districtSlug` via the shared district popover
 * - Search runs client-side over name · address · category · district EN
 * - Rating: "Exclude {n}★ centres" checkboxes — a centre survives when its
 *   rating is strictly above every excluded bound; centres WITHOUT a
 *   rating ("—") sink while any star filter is active (nulls-sink, same
 *   rule as the Budget/Class Size sorts). The rating itself is still the
 *   mock-fallback value per centre; real aggregated ratings arrive with
 *   the future reviews feature — this filter reads whatever `Centre.rating`
 *   carries, so it needs no change when that lands.
 */
export function CentreListing({ centres }: { centres: Centre[] }) {
  const { t, locale } = useLanguage();

  const [query, setQuery] = useState("");
  const [districts, setDistricts] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<Set<string>>(new Set());
  /** excluded star bounds — "Exclude {n}★ and below", n ∈ 1..4 */
  const [excludeStars, setExcludeStars] = useState<Set<number>>(new Set());
  const [openPop, setOpenPop] = useState<ToolbarPop>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return centres.filter((centre) => {
      if (districts.size > 0 && !districts.has(centre.districtSlug)) {
        return false;
      }
      if (categories.size > 0) {
        const cat = centre.category?.trim().toLowerCase();
        if (!cat || !categories.has(cat)) return false;
      }
      if (excludeStars.size > 0) {
        const rating = Number.parseFloat(centre.rating);
        /* unrated centres sink whenever a star filter is active */
        if (Number.isNaN(rating)) return false;
        for (const n of excludeStars) {
          if (rating <= n) return false;
        }
      }
      if (q) {
        const haystack = [
          centre.name,
          centre.address,
          centre.category,
          findDistrict(centre.districtSlug)?.en,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [centres, query, districts, categories, excludeStars]);

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
    setExcludeStars(new Set());
  };

  return (
    <main className="min-h-screen bg-white text-ink">
      <Navbar />
      {/* Listing content capped at the 1440 design width & centered on wider
          viewports — same chrome as the trials/workshops listings. */}
      <div className="flex flex-col lg:mx-auto lg:max-w-[1440px]">
        {/* Intro copy reuses programs.title + programs.workshopsSubtitle
            (same-frame precedent — the workshops listing does the same). */}
        <section className="flex flex-col items-center gap-5 px-6 py-8 text-center md:px-20">
          <h1 className="w-full text-[40px] font-[weight:590] leading-[48px] text-ink">
            {t("programs.title")}
          </h1>
          <p className="max-w-[884px] text-[18px] leading-[27px] text-ink">
            {t("programs.workshopsSubtitle")}
          </p>
        </section>

        <ListingToolbar
          openPop={openPop}
          onTogglePop={(pop) => setOpenPop(openPop === pop ? null : pop)}
          categoryOptions={CENTRE_CATEGORIES.map((cat) => ({
            key: cat.value,
            label: locale === "zh-TW" ? cat.zh : cat.en,
          }))}
          selectedCategories={categories}
          onToggleCategory={toggleCategory}
          selectedDistricts={districts}
          onToggleDistrict={toggleDistrict}
          searchValue={query}
          onSearchChange={setQuery}
          searchPlaceholder={t("programs.searchPlaceholder")}
          actions={
            <>
              {/* Filter — REAL star-rating exclusion (user decision
                  2026-09-29); service tags stay out until that API exists */}
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
                            {formatTemplate(t, "centres.excludeStars", { n })}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          }
        />

        {/* Wide card rows — same 974 @1440 column as the other listings now
            that the Place sidebar is gone (folded into the Location
            popover). */}
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
            <ul className="flex flex-col gap-8 pt-8">
              {/* 2408 live frame (MCP 2026-08-24): rows `3866:17741` — one
                  wide card per row. Below lg the card stacks (spec-silent,
                  see centre-card.tsx). */}
              {filtered.map((centre) => (
                <li key={centre.id} className="w-full">
                  <CentreCard centre={centre} variant="listing" />
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
