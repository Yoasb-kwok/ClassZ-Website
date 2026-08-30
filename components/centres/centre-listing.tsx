"use client";

import { useMemo, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useLanguage } from "@/components/language-provider";
import { findDistrict } from "@/lib/locations";
import type { Centre } from "@/lib/centre-data";
import { SearchInput } from "@/components/programs/search-input";
import { FilterSidebar } from "@/components/programs/filter-sidebar";
import { CentreCard } from "./centre-card";

/**
 * W8 /centres listing (D5: reuses the 2208 Programs frame #1582:16181 —
 * there is no centre-listing frame in 2408). Chrome (intro, search, body
 * row, empty state, footer spacer) is copied verbatim from
 * DiscoveryListing; only the data type differs (Centre vs PublicCourse),
 * which is why this is a sibling component instead of a variant there.
 * 2026-08-24 rework: the LIVE Programs frame now lists WIDE cards (rows
 * `3866:17741`, see centre-card.tsx) — the card section of the 08-21
 * capture is STALE; chrome sections are unchanged per MCP. Re-export
 * Programs `1582:16181` to verify.
 *
 * Intro copy reuses programs.title + programs.subtitle (same-frame
 * precedent — the 2208/Programs capture's own text nodes; the workshops
 * listing reuses them too). Place sidebar stays FULL/interactive
 * (showPlace default) — filters over centre.districtSlug. Search runs
 * client-side over name · address · district EN. Cards use CentreCard
 * variant "listing" (card #1628:16399 with mock-mix meta row, see
 * centre-card.tsx). Capture caveat: 2208/Programs capturedAt 2026-08-21,
 * three days older than the 2408 batch — accepted by the user (noted in
 * figma prompt/INDEX.md).
 */
export function CentreListing({ centres }: { centres: Centre[] }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [districts, setDistricts] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return centres.filter((centre) => {
      if (districts.size > 0 && !districts.has(centre.districtSlug)) {
        return false;
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
  }, [centres, query, districts]);

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

  return (
    <main className="min-h-screen bg-white text-ink">
      <Navbar />
      {/* Listing content capped at the 1440 design width & centered on wider
          viewports. The cap sits on this block-level root, NOT on the
          sidebar↔cards flex row — auto cross-margin on a flex-col child sizes
          it to fit-content and breaks the layout. */}
      <div className="flex flex-col lg:mx-auto lg:max-w-[1440px]">
        {/* Intro — node #1626:16265: pad 32/0, gap 20; h1 40/590 lh48; sub 18 lh27, w884 */}
        <section className="flex flex-col items-center gap-5 px-6 py-8 text-center md:px-20">
          <h1 className="w-full text-[40px] font-[weight:590] leading-[48px] text-ink">
            {t("programs.title")}
          </h1>
          <p className="max-w-[884px] text-[18px] leading-[27px] text-ink">
            {t("programs.workshopsSubtitle")}
          </p>
        </section>

        {/* Search — node #1608:15903 inside #1608:15902 (pad 0/80, gap 32).
            Kept on /centres: D5 reuses the full 2208 Programs frame (unlike
            the W7 centre tab, which hides #2635:23899). */}
        <div className="mt-8 px-6 pb-8 md:px-20">
          <SearchInput value={query} onChange={setQuery} />
        </div>

        <div className="flex flex-col gap-8 px-6 pb-16 lg:flex-row lg:gap-0 lg:px-0 lg:pb-0">
          {/* Row #1722:17536 — at ≥1440 the design holds exactly: sidebar
              337.8 + cards 1102.2 = 1440, row capped & centered so nothing
              stretches on wider screens. */}
          <FilterSidebar
            selectedDistricts={districts}
            onToggleDistrict={toggleDistrict}
          />

          {/* node #1628:16399 wrapper — row w 1102.2 so cards land at
              974.19 @1440 (wide-list rows replaced the old 3-col grid in
              the live 2408 design — rows `3866:17741`, gap 32) */}
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
            ) : (
              <ul className="flex flex-col gap-8 lg:py-8 lg:pl-12 lg:pr-20">
                {/* 2408 live frame (MCP 2026-08-24): rows `3866:17741` pad
                    32/0 gap 32 — one wide card per row, per-row pad
                    0/80/0/48 (same as the workshop listing `3810:20081`).
                    Card w = 1102.2 − 48 − 80 = 974.19 @1440; below lg the
                    card stacks (spec-silent, see centre-card.tsx). With 3
                    placeholder centres the list holds 3 rows; swap-in API
                    data will fill it out. */}
                {filtered.map((centre) => (
                  <li key={centre.id} className="w-full">
                    <CentreCard centre={centre} variant="listing" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* node #1582:16404 — 80px spacer before footer (sibling gap 32 ≈ grid pb) */}
        <div aria-hidden className="mt-8 h-20" />
      </div>
      <Footer />
    </main>
  );
}
