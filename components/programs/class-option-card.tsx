"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, MapPin } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { formatTemplate } from "./format"
import { BY_AVATAR, CLASS_AVATARS } from "@/lib/program-images"
import type { PublicClass } from "@/lib/public-courses"

/**
 * "options" card from Figma #1981:7770 (instance, program detail page):
 * 605×236.5, pad 16, r12, white fill — NO shadow, NO stroke (capture
 * confirms both absent). Inner column 573 gap 10.93.
 * Images are static placeholders from the design capture (lib/program-images)
 * until the API serves them. Still omitted for data availability:
 * "$399" strike-through price (API has a single price), language row.
 * Expanded-dates list has no Figma state captured (prototype behavior).
 */
export function ClassOptionCard({
  cls,
  price,
}: {
  cls: PublicClass
  price: number | null
}) {
  const { t, locale } = useLanguage()
  const [showDates, setShowDates] = useState(false)

  const intlLocale = locale === "zh-TW" ? "zh-Hant-HK" : "en-HK"
  const fmtDay = new Intl.DateTimeFormat(intlLocale, { day: "numeric", month: "short" })
  const fmtFull = new Intl.DateTimeFormat(intlLocale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  })

  const start = new Date(cls.start_time)
  const lessons = Math.max(1, cls.total_lessons)
  const end = new Date(start.getTime() + (lessons - 1) * 7 * 24 * 60 * 60 * 1000)
  const spotsLeft = Math.max(0, cls.capacity - cls.enrolled_count)
  const isFull = spotsLeft <= 0

  const lessonDates = Array.from(
    { length: lessons },
    (_, i) => new Date(start.getTime() + i * 7 * 24 * 60 * 60 * 1000)
  )

  return (
    <article
      data-testid="class-option-card"
      className="flex w-[605px] max-w-full shrink-0 snap-start flex-col rounded-[12px] bg-white p-[16px]"
    >
      <div className="flex flex-col gap-[10.93px]">
        {/* node 1981:7553 — row 1, w567.11 h26.24, justify-between:
            avatar 26.24 (design placeholder — no avatar API) + By 12/590 */}
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-[4.62px] text-[16px] text-ink">
            <span className="font-[weight:590]">
              {formatTemplate(t, "programs.lessons", { count: lessons })}
            </span>
            <span aria-hidden className="h-[2.31px] w-[2.31px] rounded-full bg-ink" />
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
          <span className="text-[10px] font-[weight:510] leading-[21.03px] text-[#5E5E5E]">
            {formatTemplate(t, "programs.going", { count: cls.enrolled_count })}
          </span>
          <span
            className={`text-[12px] font-[weight:510] leading-[21.03px] ${
              isFull ? "text-[#5E5E5E]" : "text-[#0ABAB5]"
            }`}
          >
            {isFull
              ? t("programs.classFull")
              : formatTemplate(t, "programs.spotsLeft", { count: spotsLeft })}
          </span>
        </p>

        {/* node 1981:7581 — location row, icon 17.49 + 12/400 #5E5E5E */}
        {cls.location ? (
          <p className="flex items-center gap-[5px] text-[12px] font-normal text-[#5E5E5E]">
            <MapPin aria-hidden className="h-[17.49px] w-[17.49px]" strokeWidth={1.16} />
            {cls.location}
          </p>
        ) : null}

        {/* nodes 1981:7590–7594 + 1981:7601 — bottom band, justify-between:
            price lines left (gap 10.93), Enroll 148×34 r8 bg#222 right */}
        <div className="flex items-center justify-between">
          {price != null ? (
            <div className="flex flex-col gap-[10.93px]">
              <p className="text-[12px] font-normal text-ink">
                {formatTemplate(t, "programs.perLesson", { price, count: lessons })}
              </p>
              <p className="text-[16px] font-[weight:590] text-ink">
                {formatTemplate(t, "programs.totalPrice", {
                  total: (price * lessons).toLocaleString("en-HK"),
                })}
              </p>
            </div>
          ) : (
            <span />
          )}

          {isFull ? (
            <span
              aria-disabled
              className="flex h-[34px] w-[148px] items-center justify-center rounded-[8px] bg-shade-100 text-[12px] font-[weight:590] text-shade-400"
            >
              {t("programs.enroll")}
            </span>
          ) : (
            <Link
              href="/login"
              data-testid="enroll-link"
              className="flex h-[34px] w-[148px] items-center justify-center rounded-[8px] bg-[#222222] text-[12px] font-[weight:590] text-white transition-colors hover:bg-shade-600"
            >
              {t("programs.enroll")}
            </Link>
          )}
        </div>

        {/* node 1981:7594 — "Show full dates", justify-center (verified
            (573−101)/2=236 ✓), gap 4.37, text 10/590 #5E5E5E + arrow 17.49 */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowDates((v) => !v)}
            aria-expanded={showDates}
            className="flex items-center gap-[4.37px] text-[10px] font-[weight:590] text-[#5E5E5E]"
          >
            {t(showDates ? "programs.hideFullDates" : "programs.showFullDates")}
            <ChevronDown
              aria-hidden
              className={`h-[17.49px] w-[17.49px] transition-transform ${showDates ? "rotate-180" : ""}`}
              strokeWidth={1.5}
            />
          </button>
        </div>

        {showDates ? (
          <ol className="flex flex-col gap-[4px]">
            {lessonDates.map((d, i) => (
              <li key={i} className="text-[12px] font-normal text-[#5E5E5E]">
                {fmtFull.format(d)}
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    </article>
  )
}
