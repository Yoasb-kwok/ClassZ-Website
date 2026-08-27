"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { formatTemplate } from "./format";
import { BY_AVATAR, CLASS_AVATARS } from "@/lib/program-images";
import type { PublicClass } from "@/lib/public-courses";

/**
 * "options" card from Figma #1981:7770 (instance, program detail page;
 * re-diffed 2026-08-24): 605×233.9, pad 16, r12, white — shadow
 * 0 6px 16px rgba(0,0,0,0.12), NO stroke. Inner column 573 is a FLAT
 * 7-row flow, gap 10 (header 26.24 / avatars 25 / language 18.59 /
 * location 18.59 / price1 17 / price2 19 / show-dates 17.49 — y =
 * 0/36.24/71.24/99.83/128.41/155.41/184.41 ✓), with the Enroll button
 * #1981:7601 (148×37 r8 #222) absolutely placed at 419,139.92 (6px off
 * the right edge, top aligned 11.51px below price1).
 * Images are static placeholders (lib/program-images) until the API
 * serves them. Omitted for data availability: "$399" strike-through
 * price (API has a single price), language row #1981:7570 (17.49 global
 * icon + 14/400 #5E5E5E).
 *
 * EXPANDED state (W3, capture 3879:19020, node 3985:5516): card grows
 * 233.9 → 413.9 — article ver gap 16 between the 7-row flow and the new
 * block 3985:5576 (h164, gap 10): "Lesson dates" 14/590 #222 + 3-col
 * grid 3985:5579 (space-between, col gap 10, rows h39 gap 10: [num
 * 12/590 #000][2px dot #000][gap-5 pair: date 14/590 #222, time range
 * 14/400 #222]). 8 lessons → 3/3/2 columns. Toggle copy flips
 * Show/Hide; the arrow stays DOWN in both states (no flip flag in
 * either capture). Time range = start_time/end_time hours (node
 * 3985:5586 "4:00PM - 5:00PM").
 */
export function ClassOptionCard({
  cls,
  price,
  defaultExpanded = false,
}: {
  cls: PublicClass;
  price: number | null;
  /** Programs-listing flow: the wide listing card links with ?dates=1 so
   *  the W3 expanded state (capture 3879:19020) opens on arrival. */
  defaultExpanded?: boolean;
}) {
  const { t, locale } = useLanguage();
  const [showDates, setShowDates] = useState(defaultExpanded);

  const intlLocale = locale === "zh-TW" ? "zh-Hant-HK" : "en-HK";
  const fmtDay = new Intl.DateTimeFormat(intlLocale, {
    day: "numeric",
    month: "short",
  });
  // node 3985:5585 — "Oct 23, Fri" (month-first per the en design copy)
  const dateLineLocale = locale === "zh-TW" ? "zh-Hant-HK" : "en-US";
  const fmtDateLine = (d: Date) =>
    `${new Intl.DateTimeFormat(dateLineLocale, { month: "short", day: "numeric" }).format(d)}, ${new Intl.DateTimeFormat(dateLineLocale, { weekday: "short" }).format(d)}`;
  // node 3985:5586 — "4:00PM - 5:00PM" (en design style: caps, no space)
  const fmtTime = (d: Date) =>
    locale === "zh-TW"
      ? new Intl.DateTimeFormat("zh-Hant-HK", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }).format(d)
      : `${d.getHours() % 12 || 12}:${String(d.getMinutes()).padStart(2, "0")}${d.getHours() < 12 ? "AM" : "PM"}`;

  const start = new Date(cls.start_time);
  const lessons = Math.max(1, cls.total_lessons);
  const end = new Date(
    start.getTime() + (lessons - 1) * 7 * 24 * 60 * 60 * 1000,
  );
  const endTimeRaw = new Date(cls.end_time);
  const endTime = Number.isNaN(endTimeRaw.getTime()) ? start : endTimeRaw;
  const spotsLeft = Math.max(0, cls.capacity - cls.enrolled_count);
  const isFull = spotsLeft <= 0;

  const lessonDates = Array.from(
    { length: lessons },
    (_, i) => new Date(start.getTime() + i * 7 * 24 * 60 * 60 * 1000),
  );

  // node 3985:5579 — 3 columns (8 lessons → 3/3/2; earlier columns
  // take the remainder)
  const numbered = lessonDates.map((d, i) => ({ d, n: i + 1 }));
  const per = Math.floor(lessons / 3);
  const rem = lessons % 3;
  const sizes = [per + (rem > 0 ? 1 : 0), per + (rem > 1 ? 1 : 0), per];
  const dateColumns: { d: Date; n: number }[][] = [[], [], []];
  let idx = 0;
  for (let c = 0; c < 3; c += 1) {
    for (let r = 0; r < sizes[c] && idx < numbered.length; r += 1) {
      dateColumns[c].push(numbered[idx]);
      idx += 1;
    }
  }

  return (
    <article
      data-testid="class-option-card"
      className="flex w-[605px] max-w-full shrink-0 snap-start flex-col gap-[16px] rounded-[12px] bg-white p-[16px] shadow-[0_6px_16px_rgba(0,0,0,0.12)]"
    >
      {/* node 1981:7552 — inner column: flat 7-row flow, gap 10 */}
      <div className="relative flex flex-col gap-[10px]">
        {/* node 1981:7553 — row 1, w567.11 h26.24, justify-between:
            lessons+dates 16px (590 / 400, lh19, dot 2.31 #000, gap 4.62) +
            avatar 26.24 & By 12→14/590 (gap 4.37) */}
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-[4.62px] text-[16px] leading-[19px] text-ink">
            <span className="font-[weight:590]">
              {formatTemplate(t, "programs.lessons", { count: lessons })}
            </span>
            <span
              aria-hidden
              className="h-[2.31px] w-[2.31px] rounded-full bg-black"
            />
            <span className="font-normal">
              {fmtDay.format(start)} - {fmtDay.format(end)}
            </span>
          </p>
          {cls.instructor ? (
            <p className="flex items-center gap-[4.37px] text-[12px] font-[weight:590] text-ink">
              <img
                src={BY_AVATAR}
                alt=""
                aria-hidden
                className="h-[26.24px] w-[26.24px] rounded-full object-cover"
              />
              {formatTemplate(t, "programs.by", { name: cls.instructor })}
            </p>
          ) : null}
        </div>

        {/* node 1981:7561 — row 2, gap 13.12: avatar stack (4 × 25px ovals,
            −8.33 overlap, white 1.04 stroke — node 1981:7563) + going/spots */}
        <p className="flex items-center gap-[13.12px]">
          <span aria-hidden className="flex items-center">
            {CLASS_AVATARS.map((src, i) => (
              <img
                key={src}
                src={src}
                alt=""
                className={`h-[25px] w-[25px] rounded-full border-[1.04px] border-white object-cover ${
                  i > 0 ? "-ml-[8.33px]" : ""
                }`}
              />
            ))}
          </span>
          <span className="text-[14px] font-[weight:510] leading-[21.03px] text-[#5E5E5E]">
            {formatTemplate(t, "programs.going", { count: cls.enrolled_count })}
          </span>
          <span
            className={`text-[14px] font-[weight:510] leading-[21.03px] ${
              isFull ? "text-[#5E5E5E]" : "text-[#0ABAB5]"
            }`}
          >
            {isFull
              ? t("programs.classFull")
              : formatTemplate(t, "programs.spotsLeft", { count: spotsLeft })}
          </span>
        </p>

        {/* node 1981:7570 — language row omitted (no API field); spacer
            reserves its 18.59px height so the rows below (and the absolute
            Enroll button alignment) stay at the design y-positions */}
        <div aria-hidden className="h-[18.59px]" />

        {/* node 1981:7581 — location row, icon 17.49 + 14/400 #5E5E5E */}
        {cls.location ? (
          <p className="flex items-center gap-[5px] text-[14px] font-normal leading-[17px] text-[#5E5E5E]">
            <img
              src="/programs/location.svg"
              alt=""
              aria-hidden
              className="h-[17.49px] w-[17.49px] shrink-0"
            />
            {cls.location}
          </p>
        ) : null}

        {/* node 1981:7590 — price line 1: 14/400 #222, h17 (strike-through
            "$399" omitted — single price in API) */}
        {price != null ? (
          <p className="text-[14px] font-normal leading-[17px] text-ink">
            {formatTemplate(t, "programs.perLesson", {
              price,
              count: lessons,
            })}
          </p>
        ) : null}

        {/* node 1981:7592 — price line 2: 16/590 #222, h19 */}
        {price != null ? (
          <p className="text-[16px] font-[weight:590] leading-[19px] text-ink">
            {formatTemplate(t, "programs.totalPrice", {
              total: (price * lessons).toLocaleString("en-HK"),
            })}
          </p>
        ) : null}

        {/* node 1981:7594 — "Show full dates": 14/590 #5E5E5E + arrow
            17.49, gap 4.37, row centered (pair center = 573/2 ✓) */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowDates((v) => !v)}
            aria-expanded={showDates}
            className="flex items-center gap-[4.37px] text-[14px] font-[weight:590] text-[#5E5E5E]"
          >
            {t(showDates ? "programs.hideFullDates" : "programs.showFullDates")}
            <ChevronDown
              aria-hidden
              className="h-[17.49px] w-[17.49px]"
              strokeWidth={1.5}
            />
          </button>
        </div>

        {/* node 1981:7601 — Enroll: 148×37 r8 bg#222, text 14/590 white.
            Absolutely placed at lg (@419,139.92 in the 573 col → 6px off
            the right edge, 11.51px below price1's top); flows after the
            rows below lg. W10 flow wiring: href → /payment (404 until
            W9's payment captures land — was /login). */}
        {isFull ? (
          <span
            aria-disabled
            className="mt-[10px] flex h-[37px] w-[148px] items-center justify-center self-end rounded-[8px] bg-shade-100 text-[14px] font-[weight:590] text-shade-400 lg:absolute lg:right-[6px] lg:top-[139.92px] lg:mt-0 lg:self-auto"
          >
            {t("programs.enroll")}
          </span>
        ) : (
          <Link
            href="/payment"
            data-testid="enroll-link"
            className="mt-[10px] flex h-[37px] w-[148px] items-center justify-center self-end rounded-[8px] bg-[#222222] text-[14px] font-[weight:590] text-white transition-colors hover:bg-shade-600 lg:absolute lg:right-[6px] lg:top-[139.92px] lg:mt-0 lg:self-auto"
          >
            {t("programs.enroll")}
          </Link>
        )}
      </div>

      {/* node 3985:5576 — expanded block (W3 capture 3879:19020):
          "Lesson dates" 14/590 #222 + grid 3985:5579 (space-between,
          col gap 10, rows h39: num 12/590 #000 + 2px dot + gap-5 pair
          [date 14/590 #222, time range 14/400 #222], gap 10). */}
      {showDates ? (
        <div className="flex flex-col gap-[10px]">
          <p className="text-[14px] font-[weight:590] leading-[17px] text-ink">
            {t("programs.lessonDates")}
          </p>
          <div className="flex items-start justify-between">
            {dateColumns
              .filter((col) => col.length > 0)
              .map((col, c) => (
                <div key={c} className="flex flex-col gap-[10px]">
                  {col.map(({ d, n }) => (
                    <div key={n} className="flex items-center gap-[10px]">
                      <span className="text-[12px] font-[weight:590] leading-[14px] text-black">
                        {n}
                      </span>
                      <span
                        aria-hidden
                        className="h-[2px] w-[2px] shrink-0 rounded-full bg-black"
                      />
                      <div className="flex flex-col gap-[5px]">
                        <span className="text-[14px] font-[weight:590] leading-[17px] text-ink">
                          {fmtDateLine(d)}
                        </span>
                        <span className="text-[14px] font-normal leading-[17px] text-ink">
                          {fmtTime(d)} - {fmtTime(endTime)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
