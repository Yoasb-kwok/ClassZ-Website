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
 *
 * ADR-005 reservation flow: the expanded grid lists the program's REAL
 * upcoming sessions (class rows) as multi-select checkboxes —
 * lesson_class_ids = selected class ids; the sticky summary bar in
 * ProgramDetail carries "N sessions · HKD X → Enroll". When `sessions`
 * is not provided the card falls back to its W3 virtual weekly dates
 * (non-selectable, legacy display).
 */
export function ClassOptionCard({
  cls,
  courseId,
  price,
  defaultExpanded = false,
  sessions,
  selectedIds,
  onToggleSession,
}: {
  cls: PublicClass;
  /** Owning course id — the Enroll deep link targets /payment?course=<id>. */
  courseId: number;
  price: number | null;
  /** Programs-listing flow: the wide listing card links with ?dates=1 so
   *  the W3 expanded state (capture 3879:19020) opens on arrival. */
  defaultExpanded?: boolean;
  /** Real upcoming sessions for this program (ADR-005 multi-select). */
  sessions?: PublicClass[];
  /** Currently selected real session ids (controlled by ProgramDetail). */
  selectedIds?: number[];
  /** Toggle callback — absent = display-only (legacy behaviour). */
  onToggleSession?: (classId: number) => void;
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

  const selectable = Boolean(onToggleSession && sessions && sessions.length);
  const selected = selectedIds ?? [];
  const isSessionSelected = (id: number) => selected.includes(id);

  // ADR-005 — real sessions when provided; otherwise the W3 virtual dates.
  const sessionRows: {
    id: number;
    start: Date;
    end: Date;
    full: boolean;
  }[] = sessions?.length
    ? sessions.map((s) => {
        const sStart = new Date(s.start_time);
        const sEndRaw = new Date(s.end_time);
        const cap = Number(s.capacity) || 0;
        return {
          id: s.id,
          start: sStart,
          end: Number.isNaN(sEndRaw.getTime()) ? sStart : sEndRaw,
          full: cap > 0 && s.enrolled_count >= cap,
        };
      })
    : Array.from(
        { length: lessons },
        (_, i) => new Date(start.getTime() + i * 7 * 24 * 60 * 60 * 1000),
      ).map((d, i) => ({ id: -(i + 1), start: d, end: endTime, full: false }));

  // node 3985:5579 — 3 columns (8 lessons → 3/3/2; earlier columns
  // take the remainder)
  const numbered = sessionRows.map((row, i) => ({ ...row, n: i + 1 }));
  const total = numbered.length;
  const per = Math.floor(total / 3);
  const rem = total % 3;
  const sizes = [per + (rem > 0 ? 1 : 0), per + (rem > 1 ? 1 : 0), per];
  const dateColumns: (typeof numbered)[] = [[], [], []];
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
            rows below lg. ADR-005: the CTA books the program's sessions —
            href carries the current selection to /payment (login gate
            handled by the login page's ?next= return). */}
        {isFull ? (
          <span
            aria-disabled
            className="mt-[10px] flex h-[37px] w-[148px] items-center justify-center self-end rounded-[8px] bg-shade-100 text-[14px] font-[weight:590] text-shade-400 lg:absolute lg:right-[6px] lg:top-[139.92px] lg:mt-0 lg:self-auto"
          >
            {t("programs.enroll")}
          </span>
        ) : (
          <Link
            href={enrollHref(courseId, selected, sessions, price, selectable)}
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
          [date 14/590 #222, time range 14/400 #222], gap 10).
          ADR-005: rows are the program's real sessions; when selectable,
          each row is a checkbox button (checked rows highlight teal). */}
      {showDates ? (
        <div className="flex flex-col gap-[10px]">
          <p className="text-[14px] font-[weight:510] leading-[17px] text-ink">
            {t("programs.lessonDates")}
          </p>
          <div className="flex items-start justify-between">
            {dateColumns
              .filter((col) => col.length > 0)
              .map((col, c) => (
                <div key={c} className="flex flex-col gap-[10px]">
                  {col.map(({ id, n, start: d, end: dEnd, full }) => {
                    const isSelected = selectable && isSessionSelected(id);
                    const row = (
                      <>
                        <span className="text-[12px] font-[weight:590] leading-[14px] text-black">
                          {n}
                        </span>
                        <span
                          aria-hidden
                          className="h-[2px] w-[2px] shrink-0 rounded-full bg-black"
                        />
                        <div className="flex flex-col gap-[5px]">
                          <span
                            className={`text-[14px] font-[weight:590] leading-[17px] ${
                              full ? "text-[#C1C1C1]" : "text-ink"
                            }`}
                          >
                            {fmtDateLine(d)}
                            {full ? ` · ${t("programs.classFull")}` : ""}
                          </span>
                          <span
                            className={`text-[14px] font-normal leading-[17px] ${
                              full ? "text-[#C1C1C1]" : "text-ink"
                            }`}
                          >
                            {fmtTime(d)} - {fmtTime(dEnd)}
                          </span>
                        </div>
                      </>
                    );
                    if (!selectable || full) {
                      return (
                        <div
                          key={id}
                          className="flex items-center gap-[10px]"
                          aria-disabled={full || undefined}
                        >
                          {row}
                        </div>
                      );
                    }
                    return (
                      <button
                        key={id}
                        type="button"
                        role="checkbox"
                        aria-checked={isSelected}
                        data-testid={`session-option-${id}`}
                        onClick={() => onToggleSession?.(id)}
                        className={`flex items-center gap-[10px] rounded-[8px] text-left transition-colors ${
                          isSelected
                            ? "bg-[#0ABAB5]/[0.08] outline outline-1 outline-[#0ABAB5]"
                            : "hover:bg-[#F5F5F5]"
                        }`}
                      >
                        {row}
                      </button>
                    );
                  })}
                </div>
              ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

/** /payment deep link: ?course=<id>&classes=<selected ids> (selection
 *  survives the login ?next= round-trip per ADR-005 D6). */
function enrollHref(
  courseId: number,
  selected: number[],
  sessions: PublicClass[] | undefined,
  price: number | null,
  selectable: boolean,
): string {
  // With real sessions available, Enroll books the whole list by default —
  // the parent trims it on /payment (or via the checkboxes before Enroll).
  const ids =
    selectable && selected.length > 0
      ? selected
      : (sessions ?? []).map((s) => s.id);
  const qs = new URLSearchParams({ course: String(courseId) });
  if (ids.length) qs.set("classes", ids.join(","));
  if (price != null) qs.set("price", String(price));
  return `/payment?${qs.toString()}`;
}
