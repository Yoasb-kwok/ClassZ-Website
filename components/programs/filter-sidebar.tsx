"use client";

import { useState } from "react";
import { ChevronDown, Check, Star } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import {
  HK_ISLAND_DISTRICTS,
  KOWLOON_DISTRICTS,
  NEW_TERRITORIES_DISTRICTS,
  type District,
} from "@/lib/locations";

/** Category order per capture rows #1979:739x: Academic, Music, Art, Dance,
 *  Sports, STEM, Language, Parent Child, Others (Academic checked). */
const CATEGORY_KEYS = [
  "academic",
  "music",
  "art",
  "dance",
  "sports",
  "stem",
  "language",
  "parentChild",
  "others",
] as const;

const CHECKED_CATEGORY = "academic";

/**
 * Sidebar from `figma prompt/Programs.figmacapture` (2026-08-21), cross-checked
 * against 2408 `workshop.figmacapture` #3816:20993 (shared page chrome).
 * - node #1727:17673 — column gap 64, pad 32/0/32/80, sizing fill (grows; 337.8 @1440)
 * - node #3816:20994 Category (2408) — w147, gap 16 (2208 capture had 14;
 *   2408 wins — LINE sits @0,35); title 16/590 #222 lh19; rows gap 16;
 *   checkbox 16×16 r4 (checked #0ABAB5 + check icon, unchecked #B0B0B0 border);
 *   row gap 20; label 14/400 lh21. Academic checked per design.
 * - node #1973:20021 Filter by — w225, gap 16; title 18/590 #000 lh21
 * - node #1973:20025 Language — gap 10 pad 6/0; title 16/400 #000; rows gap 16
 *   (English checked, 繁體中文 unchecked — same checkbox row style as Category)
 * - node #3816:21052 Place (2408) — gap 16; title 16/400 #000 lh19; regions gap 16;
 *   region header→pills gap 16 (#3816:21054 — W2 shipped 8, both captures say 16);
 *   header text 12/400 #222 lh14 + chevron 16 #5E5E5E; pills h25 pad 4/8 r4, node
 *   opacity 0.8 + fill alpha (selected rgba(10,186,181,0.3) font 590, rest rgba(34,34,34,0.1))
 * - node #1973:20101 Price — two boxes 105×57 r8 stroke #B0B0B0 pad 12/6, col gap 4:
 *   label 10/400 #717171 + value 14px #222 ("HKD 100" / "HKD 900"). NO chevron.
 * - node #1973:20120 Rating — pills h25 r4 pad 4/7 gap 8: star 12 + n° 12px;
 *   1–3 rgba(34,34,34,0.1) 400, 4–5 rgba(10,186,181,0.3) 590 (selected), op 0.8
 * - node #1973:20143 Service — pills h25 r4 pad 4/8 op 0.8, rows gap 8:
 *   SEN-inclusive + Small Class Size / Exam / Certificate Pathway / Performance
 *   Opportunity; selected teal 590, rest gray 400
 * Category/Language/Price/Rating/Service are visual chrome — inert until the
 * API exposes the fields they filter on (Block B notes in
 * docs/UI_Implementation_Plan.md). Only Place is interactive.
 */

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
  const label = locale === "zh-TW" ? district.zh : district.en;
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={`flex h-[25px] items-center gap-0.5 rounded-[4px] px-2 py-1 text-[12px] leading-[14px] text-ink opacity-80 transition-colors ${
        selected
          ? "bg-[rgba(10,186,181,0.3)] font-[weight:590]"
          : "bg-[rgba(34,34,34,0.1)] font-normal hover:bg-[rgba(34,34,34,0.16)]"
      }`}
    >
      {label}
    </button>
  );
}

function RegionSection({
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
    /* #3816:21054 — region group: header→pills gap 16 (2208 #1973:20039
       and 2408 #3816:21054 agree; pills @0,32 after h16 header) */
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-2 text-ink"
      >
        <span className="text-xs leading-[14px]">{t(titleKey)}</span>
        {/* Arrow direction per capture transforms: collapsed = down (icon
            frame flip + inner vector flip = double flip, #1977:20181/
            1956:19556), expanded = up (frame flip only, #1973:20042) */}
        <ChevronDown
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

/** Checkbox row — Category/Language style (#1979:739x / #1973:2002x):
 *  gap 20, box 16×16 r4, label 14/400 lh21 #222. */
function CheckRow({ label, checked }: { label: string; checked?: boolean }) {
  return (
    <div className="flex items-center gap-5">
      <span
        aria-hidden
        className={`flex h-4 w-4 items-center justify-center rounded-[4px] ${
          checked ? "bg-[#0ABAB5]" : "border border-[#B0B0B0] bg-white"
        }`}
      >
        {checked ? (
          <Check className="h-3 w-3 text-white" strokeWidth={1.11} />
        ) : null}
      </span>
      <span className="text-sm leading-[21px] text-ink">{label}</span>
    </div>
  );
}

export function FilterSidebar({
  selectedDistricts,
  onToggleDistrict,
  showPlace = true,
}: {
  selectedDistricts: Set<string>;
  onToggleDistrict: (slug: string) => void;
  /** W7 centre listing (#2568:10812): Place is hidden — the list is already
   *  scoped to one centre. /programs + /workshops keep it (default). */
  showPlace?: boolean;
}) {
  const { t } = useLanguage();
  // Mobile-only collapse (<lg): the full sidebar stacks 1264px tall on a
  // 375px viewport, burying the card grid ~1.7 screens down. Below lg the
  // body hides behind a toggle; at lg the layout is unchanged (spec-silent
  // quick adaptation — no mobile frame exists yet).
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    /* node #1727:17673 (= 2408 #3816:20993) — w337.8 (derived: 1440 − 1102.2
       cards area; pinned, not grown, so the sidebar↔card gap holds at every
       viewport), pad 32/0/32/80, gap 64 */
    <aside
      className="flex w-full flex-col py-8 lg:w-[337.8px] lg:shrink-0 lg:pl-20"
      aria-label={t("programs.filterBy")}
    >
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        aria-expanded={mobileOpen}
        className="mb-4 flex w-full items-center justify-between rounded-[8px] border border-[#EBEBEB] bg-white px-4 py-3 text-[16px] font-[weight:590] leading-[19px] text-ink lg:hidden"
      >
        {t("programs.filterBy")}
        {selectedDistricts.size > 0 ? ` (${selectedDistricts.size})` : ""}
        <ChevronDown
          aria-hidden
          className={`h-4 w-4 text-[#5E5E5E] transition-transform ${
            mobileOpen ? "rotate-180" : ""
          }`}
          strokeWidth={1.16}
        />
      </button>

      <div
        className={`${mobileOpen ? "flex" : "hidden"} w-full flex-col gap-16 lg:flex`}
      >
        {/* node #3816:20994 Category — w147, gap 16 (2408; 2208 capture had 14) */}
        <section className="flex w-full flex-col gap-4 lg:w-[147px]">
          <h2 className="text-[16px] font-[weight:590] leading-[19px] text-ink">
            {t("programs.category")}
          </h2>
          <hr className="border-t border-[#EBEBEB]" />
          <fieldset
            disabled
            className="flex flex-col gap-4"
            title={t("programs.comingSoon")}
            aria-label={t("programs.category")}
          >
            {CATEGORY_KEYS.map((key) => (
              <CheckRow
                key={key}
                label={t(`programs.categories.${key}`)}
                checked={key === CHECKED_CATEGORY}
              />
            ))}
          </fieldset>
        </section>

        {/* node #1973:20021 Filter by — w225, gap 16; title 18/590 #000 lh21 */}
        <section className="flex w-full flex-col gap-4 lg:w-[225px]">
          <h2 className="text-[18px] font-[weight:590] leading-[21px] text-black">
            {t("programs.filterBy")}
          </h2>
          <hr className="border-t border-[#EBEBEB]" />

          {/* node #1973:20025 Language — gap 10, pad 6/0; English checked */}
          <fieldset
            disabled
            className="flex flex-col gap-2.5 py-1.5"
            title={t("programs.comingSoon")}
            aria-label={t("programs.language")}
          >
            <legend className="text-[16px] leading-[19px] text-black">
              {t("programs.language")}
            </legend>
            <div className="flex flex-col gap-4">
              <CheckRow label="English" checked />
              <CheckRow label="繁體中文" />
            </div>
          </fieldset>

          {/* node #1973:20037 Place — gap 10, pad 6/0 (interactive); hidden on
            the centre listing (2408 #2568:10855 has no Place group) */}
          {showPlace ? (
            <div className="flex flex-col gap-2.5 py-1.5">
              <h3 className="text-[16px] leading-[19px] text-black">
                {t("programs.place")}
              </h3>
              <div className="flex flex-col gap-4">
                <RegionSection
                  titleKey="programs.hkIsland"
                  districts={HK_ISLAND_DISTRICTS}
                  selected={selectedDistricts}
                  onToggle={onToggleDistrict}
                  defaultOpen
                />
                <RegionSection
                  titleKey="programs.kowloon"
                  districts={KOWLOON_DISTRICTS}
                  selected={selectedDistricts}
                  onToggle={onToggleDistrict}
                  defaultOpen={false}
                />
                <RegionSection
                  titleKey="programs.newTerritories"
                  districts={NEW_TERRITORIES_DISTRICTS}
                  selected={selectedDistricts}
                  onToggle={onToggleDistrict}
                  defaultOpen={false}
                />
              </div>
            </div>
          ) : null}

          {/* node #1973:20101 Price — two boxes 105×57 r8 stroke #B0B0B0,
            pad 12/6, col gap 4: label 10/400 #717171 + value 14px #222 */}
          <fieldset
            disabled
            className="flex flex-col gap-2.5 py-1.5"
            title={t("programs.comingSoon")}
            aria-label={t("programs.price")}
          >
            <legend className="text-[16px] leading-[19px] text-black">
              {t("programs.price")}
            </legend>
            <div className="flex gap-4">
              {[
                { label: t("programs.minPrice"), value: "HKD 100" },
                { label: t("programs.maxPrice"), value: "HKD 900" },
              ].map((box) => (
                <div
                  key={box.label}
                  className="flex h-[57px] w-[105px] flex-col justify-center gap-[4px] rounded-[8px] border border-[#B0B0B0] px-[6px] py-[12px]"
                >
                  <span className="text-[10px] font-normal leading-[12px] text-[#717171]">
                    {box.label}
                  </span>
                  <span className="text-[14px] font-normal leading-[17px] text-ink">
                    {box.value}
                  </span>
                </div>
              ))}
            </div>
          </fieldset>

          {/* node #1973:20120 Rating — pills h25 r4 pad 4/7 gap 8: star 12 +
            number 12px; 4–5 selected teal 590 (per design default state) */}
          <fieldset
            disabled
            className="flex flex-col gap-2.5 py-1.5"
            title={t("programs.comingSoon")}
            aria-label={t("programs.rating")}
          >
            <legend className="text-[16px] leading-[19px] text-black">
              {t("programs.rating")}
            </legend>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => {
                const selected = n >= 4;
                return (
                  <span
                    key={n}
                    className={`flex h-[25px] items-center gap-1 rounded-[4px] px-[7px] py-1 text-[12px] leading-[14px] text-ink opacity-80 ${
                      selected
                        ? "bg-[rgba(10,186,181,0.3)] font-[weight:590]"
                        : "bg-[rgba(34,34,34,0.1)] font-normal"
                    }`}
                  >
                    <Star
                      aria-hidden
                      className="h-3 w-3 text-ink"
                      strokeWidth={0}
                      fill="#222222"
                    />
                    {n}
                  </span>
                );
              })}
            </div>
          </fieldset>

          {/* node #1973:20143 Service — pills h25 r4 pad 4/8 op 0.8, rows
            gap 8; selected teal 590, rest gray 400 (design default state) */}
          <fieldset
            disabled
            className="flex flex-col gap-2.5 py-1.5"
            title={t("programs.comingSoon")}
            aria-label={t("programs.service")}
          >
            <legend className="text-[16px] leading-[19px] text-black">
              {t("programs.service")}
            </legend>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <span className="flex h-[25px] items-center rounded-[4px] bg-[rgba(10,186,181,0.3)] px-2 py-1 text-[12px] font-[weight:590] leading-[14px] text-ink opacity-80">
                  {t("programs.serviceTags.sen")}
                </span>
                <span className="flex h-[25px] items-center rounded-[4px] bg-[rgba(34,34,34,0.1)] px-2 py-1 text-[12px] font-normal leading-[14px] text-ink opacity-80">
                  {t("programs.serviceTags.smallClass")}
                </span>
              </div>
              <span className="flex h-[25px] w-fit items-center rounded-[4px] bg-[rgba(10,186,181,0.3)] px-2 py-1 text-[12px] font-[weight:590] leading-[14px] text-ink opacity-80">
                {t("programs.serviceTags.examPathway")}
              </span>
              <span className="flex h-[25px] w-fit items-center rounded-[4px] bg-[rgba(34,34,34,0.1)] px-2 py-1 text-[12px] font-normal leading-[14px] text-ink opacity-80">
                {t("programs.serviceTags.performance")}
              </span>
            </div>
          </fieldset>
        </section>
      </div>
    </aside>
  );
}
