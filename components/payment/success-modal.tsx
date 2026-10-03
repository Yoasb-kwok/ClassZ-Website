"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { CLASS_AVATARS, HOST_AVATAR } from "@/lib/program-images";

/**
 * Success modal — capture 2031:8286 (Payment-successful, node 2031:18168):
 * 600w r24 pad32 white on a #222/40 dim (node 2031:8705); close 35×35
 * r100 #EBEBEB; title 32/590 #222 lh48 centered; program card 536 r12
 * pad16 (image 101×97 r12 + name 18/400 #222 + language/location rows
 * 14/400 #5E5E5E); #EBEBEB dividers; "Booking for" 18/590 + child row
 * (avatar 50 r100 + name 18/590); "Hosted by" 16/590 + centre row
 * (name 18/590 ×2 + star 16 + 4.91 14/400) + coach row (name 18/590 +
 * "Program Coach" 18/400 #5E5E5E); "Payment amount" 16/590 + amount
 * 16/400; "Want to check your schedule?" 14/400 #5E5E5E centered;
 * "Go to Timetable" 536×47 r8 #222 16/590 white.
 *
 * The "Congrats" confetti group (node 2032:19015, 688×272, op 0.4) is
 * vectors-only in the capture (no asset export) — approximated here with
 * CSS confetti in the capture's exact palette.
 */
const CONFETTI_COLORS = [
  "#5D9275",
  "#FFC430",
  "#FFE19E",
  "#F5B8C1",
  "#FF7D57",
  "#C2E0ED",
];

export function SuccessModal({
  courseName,
  courseImage,
  languageLabel,
  locationLabel,
  childName,
  childPhoto,
  centreName,
  coachName,
  amountHkd,
  timetableHref = "/schedule",
  onClose,
}: {
  courseName: string;
  courseImage?: string | null;
  languageLabel?: string | null;
  locationLabel?: string | null;
  childName: string;
  childPhoto?: string | null;
  centreName: string;
  coachName?: string | null;
  amountHkd: number | null;
  timetableHref?: string;
  onClose: () => void;
}) {
  const { locale } = useLanguage();
  const zh = locale === "zh-TW";
  const confetti = Array.from({ length: 24 }, (_, i) => ({
    left: `${(i * 37) % 100}%`,
    top: `${((i * 53) % 80) + 4}%`,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    w: 5 + ((i * 7) % 9),
    h: 10 + ((i * 11) % 16),
    rot: (i * 47) % 180,
    radius: i % 3 === 0 ? "9999px" : "2px",
  }));

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-[#222222]/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={zh ? "預約成功" : "Reservation confirmed"}
    >
      <div className="relative mt-[142px] w-[600px] max-w-full rounded-[24px] bg-white p-[32px]">
        {/* node 2032:19015 — Congrats confetti (CSS approximation, op 0.4) */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[272px] opacity-40">
          {confetti.map((c, i) => (
            <span
              key={i}
              className="absolute block"
              style={{
                left: c.left,
                top: c.top,
                width: c.w,
                height: c.h,
                backgroundColor: c.color,
                borderRadius: c.radius,
                transform: `rotate(${c.rot}deg)`,
              }}
            />
          ))}
        </div>

        {/* node 2916:19812 — close 35×35 r100 #EBEBEB */}
        <div className="relative flex justify-end">
          <button
            type="button"
            aria-label={zh ? "關閉" : "Close"}
            onClick={onClose}
            className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-[#EBEBEB] text-[#7A7A7A] transition-colors hover:bg-[#E0E0E0]"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
              <path
                d="M1 1l8 8M9 1L1 9"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* node 2916:19821 — title 32/590 #222 lh48 */}
        <h2 className="mt-[10px] text-center text-[32px] font-[weight:590] leading-[48px] text-[#222222]">
          {zh
            ? "你的課程預約已成功確認！"
            : "Your reservation has been successfully confirmed!"}
        </h2>

        {/* node 2916:19700 — program card 536 r12 pad16 */}
        <div className="mt-[32px] rounded-[12px] bg-white p-[16px] shadow-[0_6px_16px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-[10px]">
            {/* node 2916:19702 — image 101×97 r12 */}
            <img
              src={courseImage || "/images/programs/class.jpg"}
              alt=""
              className="h-[97px] w-[101px] shrink-0 rounded-[12px] object-cover"
            />
            <div className="flex min-w-0 flex-col gap-[10px]">
              <p className="truncate text-[18px] font-normal leading-[21px] text-[#222222]">
                {courseName}
              </p>
              {languageLabel ? (
                <p className="flex items-center gap-[4px] text-[14px] font-normal text-[#5E5E5E]">
                  <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden className="shrink-0">
                    <circle cx="10" cy="10" r="8.4" stroke="#5E5E5E" strokeWidth="1.2" fill="none" />
                    <path d="M1.6 10h16.8M10 1.6c-2.4 2.3-3.6 5.1-3.6 8.4s1.2 6.1 3.6 8.4c2.4-2.3 3.6-5.1 3.6-8.4S12.4 3.9 10 1.6z" stroke="#5E5E5E" strokeWidth="1.2" fill="none" />
                  </svg>
                  {languageLabel}
                </p>
              ) : null}
              {locationLabel ? (
                <p className="flex items-center gap-[4px] truncate text-[14px] font-normal text-[#5E5E5E]">
                  <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden className="shrink-0">
                    <path
                      d="M10 18s6-5.2 6-9.6A6 6 0 004 8.4C4 12.8 10 18 10 18z"
                      stroke="#5E5E5E"
                      strokeWidth="1.2"
                      fill="none"
                    />
                    <circle cx="10" cy="8.4" r="2.2" stroke="#5E5E5E" strokeWidth="1.2" fill="none" />
                  </svg>
                  <span className="truncate">{locationLabel}</span>
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* node 2032:18360 — Booking for 18/590 + child row */}
        <p className="mt-[32px] text-[18px] font-[weight:590] leading-[21px] text-black">
          {zh ? "預約學員" : "Booking for"}
        </p>
        <div className="mt-[16px] flex items-center gap-[20px]">
          <img
            src={childPhoto || "/images/programs/avatars/a1.jpg"}
            alt=""
            className="h-[50px] w-[50px] rounded-full object-cover"
          />
          <p className="text-[18px] font-[weight:590] text-[#222222]">
            {childName}
          </p>
        </div>

        <div className="mt-[24px] h-px w-full bg-[#EBEBEB]" />

        {/* node 2916:19727 — Hosted by 16/590 + rows (18px per capture) */}
        <p className="mt-[24px] text-[16px] font-[weight:590] leading-[19px] text-black">
          {zh ? "主辦中心" : "Hosted by"}
        </p>
        <div className="mt-[16px] flex items-center justify-between gap-[20px]">
          <div className="flex items-center gap-[20px]">
            <img
              src={HOST_AVATAR}
              alt=""
              className="h-[50px] w-[50px] rounded-full object-cover"
            />
            <p className="max-w-[287px] text-[18px] font-[weight:590] leading-[21px] text-[#222222]">
              {centreName}
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-[4px]">
            <Star aria-hidden className="h-[16px] w-[16px] text-[#222222]" fill="#222222" strokeWidth={0} />
            <span className="text-[14px] font-normal text-[#222222]">4.91</span>
          </span>
        </div>
        {coachName ? (
          <div className="mt-[16px] flex items-center gap-[20px]">
            <img
              src={CLASS_AVATARS[1]}
              alt=""
              className="h-[50px] w-[50px] rounded-full object-cover"
            />
            <div className="flex flex-col gap-[4px]">
              <p className="text-[18px] font-[weight:590] text-[#222222]">
                {coachName}
              </p>
              <p className="text-[18px] font-normal text-[#5E5E5E]">
                {zh ? "課程導師" : "Program Coach"}
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-[24px] h-px w-full bg-[#EBEBEB]" />

        {/* node 2916:19744 — Payment amount 16/590 + 16/400 */}
        <div className="mt-[24px] flex items-center justify-between">
          <p className="text-[16px] font-[weight:590] text-[#222222]">
            {zh ? "付款金額" : "Payment amount"}
          </p>
          <p className="text-[16px] font-normal text-[#222222]">
            {amountHkd != null ? `$${Math.round(amountHkd).toLocaleString("en-HK")}` : "—"}
          </p>
        </div>

        <div className="mt-[24px] h-px w-full bg-[#EBEBEB]" />

        {/* node 2916:19755 — hint 14/400 #5E5E5E centered */}
        <p className="mt-[24px] text-center text-[14px] font-normal leading-[16px] text-[#5E5E5E]">
          {zh ? "想查看你的課程時間表？" : "Want to check your schedule?"}
        </p>
        {/* node 2916:19756/57 — button 536×47 r8 #222 */}
        <Link
          href={timetableHref}
          className="mt-[10px] flex h-[47px] w-full items-center justify-center rounded-[8px] bg-[#222222] text-[16px] font-[weight:590] text-white transition-opacity hover:opacity-90"
        >
          {zh ? "前往時間表" : "Go to Timetable"}
        </Link>
      </div>
    </div>
  );
}
