"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/language-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getClasszSession, type ClasszSession } from "@/lib/classz-auth";
import { programImage, CLASS_AVATARS, HOST_AVATAR } from "@/lib/program-images";
import type { PublicCourse, PublicClass } from "@/lib/public-courses";
import {
  createPaymentMethodSetup,
  createReservation,
  evaluateCouponClient,
  fetchMyChildren,
  type ChildProfile,
  type ParentCoupon,
} from "@/lib/reservations";
import { PromoModal } from "./promo-modal";
import { SuccessModal } from "./success-modal";

/**
 * /payment — capture 1990:8282 (Payment, 1440×1874; ADR-005 reservation
 * checkout).
 *
 * Layout: navbar / hero carousel 1280×454 r12 (node 2513:29271, pad 32
 * top gap, action chips 35×35 top-right, #EBEBEB/60% arrows, 5 dots
 * #FFF/#DDD at bottom-center) / two columns 605 + 531 gap 64 pad 0/120:
 *
 * LEFT (node 3999:5053, gap 32): info block gap 16 (title 24/590 +
 * star 18 + 4.91 16/400 space-between h29; price row h24 gap 5 — 20.02
 * #222 + dot 2.5 + "Age 3-6" 20/400 #5E5E5E; intro 14/400 #5E5E5E h34;
 * language + location rows 14/400 #5E5E5E w/ 20.02 icons), hosted-by
 * gap 16 ("Hosted by" 16/590; centre row 343×50: avatar 50 + name
 * 14/590 ×2 + star 16 + 4.91 14/400; coach row 343×50: avatar 50 + name
 * 14/590 + "Program Coach" 14/400 #5E5E5E), selected-sessions card
 * (pad 16 r12 white: "N lessons" 14/590 + dot + range 14/400; "Hide
 * full dates" 14/590 #5E5E5E + arrow 17.49 centered; #EBEBEB divider;
 * "Lesson dates" 14/510 + 3-col grid rows h39 gap 10: num 12/590 +
 * 2px dot + date 14/590 / time 14/400).
 *
 * RIGHT (node 3997:4731, gap 32): "Booking for" 16/590 + child row 50
 * (avatar + name 18/590 + "Switch" 14/590); "Pay with" 16/590 +
 * "Powered by stripe" (#6461FC); "Payment method" 14/400 + "Add"
 * 14/590; promo field 531×51 r8 #B0B0B0 ("Promotion code" 16/400
 * #B0B0B0); amounts card (pad-x16, gap 20 rows): "$299 lesson" 22
 * (400→590), "N lessons · range" 14, avatars 24 ×3 + "+3 Going" 14/510
 * #5E5E5E + "4 spots left" 14/510 #0ABAB5, "protected by zcare" 14/400
 * (asset 007-3997_4874), breakdown rows 16/400 space-between
 * (underline per reference): "price × N lessons" / total, "Limited
 * discount" / −$X #008A05 (coupon — capture 2511:25555), "Total (HKD)"
 * 16/590 / total 16/400, #DDDDDD divider; "Reserve" 403×51 r8 #222
 * 16/590 white inside pad-x64 frame (node 3997:4888).
 *
 * Deviations (capture-faithful where data allows — see summary):
 * strike-through price omitted (no original-price field); platform-fee
 * row omitted (no fee data — real money must follow the ADR formula);
 * card-brand icon strip + Stripe wordmark approximated in text (asset
 * gap); "4.91" is the shared D2 placeholder (no public rating field).
 */

type Props = {
  course: PublicCourse;
  sessions: PublicClass[];
  centreName: string;
  centreAvatar?: string | null;
  initialStatus?: string | null;
  initialSessionId?: string | null;
};

function fmtDateLine(d: Date, locale: string) {
  const loc = locale === "zh-TW" ? "zh-Hant-HK" : "en-US";
  return `${new Intl.DateTimeFormat(loc, { month: "short", day: "numeric" }).format(d)}, ${new Intl.DateTimeFormat(loc, { weekday: "short" }).format(d)}`;
}

function fmtTime(d: Date, locale: string) {
  if (locale === "zh-TW") {
    return new Intl.DateTimeFormat("zh-Hant-HK", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  }
  const h = d.getHours();
  return `${h % 12 || 12}:${String(d.getMinutes()).padStart(2, "0")}${h < 12 ? "AM" : "PM"}`;
}

export function PaymentClient({
  course,
  sessions,
  centreName,
  centreAvatar,
  initialStatus,
  initialSessionId,
}: Props) {
  const { t, locale } = useLanguage();
  const zh = locale === "zh-TW";
  const router = useRouter();

  const [session, setSession] = useState<ClasszSession | null>(null);
  const [gateChecked, setGateChecked] = useState(false);
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [childrenError, setChildrenError] = useState<string | null>(null);
  const [childIndex, setChildIndex] = useState(0);
  const [promoOpen, setPromoOpen] = useState(false);
  const [coupon, setCoupon] = useState<ParentCoupon | null>(null);
  const [reserving, setReserving] = useState(false);
  const [reserveError, setReserveError] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [paidAmount, setPaidAmount] = useState<number | null>(null);
  const pollTries = useRef(0);

  const price = course.price != null ? Number(course.price) : null;
  const selectedIds = useMemo(() => sessions.map((s) => s.id), [sessions]);
  const subtotal =
    price != null ? Math.round(price * sessions.length * 100) / 100 : null;

  // Coupon verdict mirrors the API's snapshot math (lib/reservations.ts).
  const discount = useMemo(() => {
    if (!coupon || subtotal == null) return 0;
    const verdict = evaluateCouponClient(coupon, subtotal, course.center_id);
    return verdict.ok ? verdict.discount : 0;
  }, [coupon, subtotal, course.center_id]);
  const total =
    subtotal != null
      ? Math.max(0, Math.round((subtotal - discount) * 100) / 100)
      : null;

  // Login gate (ADR-005 D6): ?next= round-trip preserves the selection.
  // Mirror of the auth-modal session bootstrap (localStorage has no sync
  // external-store subscription; setState here is the established pattern).
  useEffect(() => {
    const s = getClasszSession();
    if (!s) {
      const next = window.location.pathname + window.location.search;
      router.replace(`/login?next=${encodeURIComponent(next)}`);
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage bootstrap, same as auth-modal/student-shell
    setSession(s);
    setGateChecked(true);
  }, [router]);

  // Child profiles (one child per request — ADR-005 D6).
  useEffect(() => {
    if (!session) return;
    fetchMyChildren()
      .then((rows) => {
        const list = Array.isArray(rows) ? rows : [];
        setChildren(list);
        if (!list.length) setChildrenError("NO_CHILDREN");
      })
      .catch((err) => {
        setChildrenError(
          err instanceof Error ? err.message : "children_failed",
        );
      });
  }, [session]);

  // Stripe return: poll the order until the webhook settles it, then show
  // the success modal (capture Payment-successful).
  useEffect(() => {
    if (initialStatus !== "success" || !initialSessionId || !session) return;
    let cancelled = false;
    const poll = async () => {
      pollTries.current += 1;
      try {
        const res = await fetch(
          `/api/payment/order-status?session_id=${encodeURIComponent(initialSessionId)}`,
          { headers: { Authorization: `Bearer ${session.token}` } },
        );
        const body = await res.json().catch(() => ({}));
        // getOrderStatus responds { success, order } — not { data }.
        const order = body?.order ?? body?.data;
        if (!cancelled && order && order.payment_status === "paid") {
          setPaidAmount(order.total != null ? Number(order.total) : null);
          setSuccessOpen(true);
          return;
        }
      } catch {
        /* keep polling */
      }
      if (!cancelled && pollTries.current < 15) {
        setTimeout(poll, 2000);
      }
    };
    poll();
    return () => {
      cancelled = true;
    };
  }, [initialStatus, initialSessionId, session]);

  const child = children[childIndex] ?? null;
  const first = sessions[0] ?? null;
  const last = sessions[sessions.length - 1] ?? null;
  const firstStart = first ? new Date(first.start_time) : null;
  const lastStart = last ? new Date(last.start_time) : null;
  const spotsLeft = first
    ? Math.max(
        0,
        (Number(first.capacity) || 0) - (Number(first.enrolled_count) || 0),
      )
    : 0;

  const dateColumns = useMemo(() => {
    const rows = sessions.map((s, i) => ({
      id: s.id,
      n: i + 1,
      start: new Date(s.start_time),
      end: new Date(s.end_time),
    }));
    const per = Math.floor(rows.length / 3);
    const rem = rows.length % 3;
    const sizes = [per + (rem > 0 ? 1 : 0), per + (rem > 1 ? 1 : 0), per];
    const cols: (typeof rows)[] = [[], [], []];
    let idx = 0;
    for (let c = 0; c < 3; c += 1) {
      for (let r = 0; r < sizes[c] && idx < rows.length; r += 1) {
        cols[c].push(rows[idx]);
        idx += 1;
      }
    }
    return cols.filter((col) => col.length > 0);
  }, [sessions]);

  async function reserve() {
    if (!session || !child || reserving) return;
    setReserving(true);
    setReserveError("");
    try {
      const data = await createReservation({
        class_ids: selectedIds,
        profile_id: child.id,
        coupon_id: coupon ? coupon.id : null,
        course_id: course.id,
      });
      if (data?.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }
      setReserveError(zh ? "無法建立付款連結" : "Could not start checkout");
    } catch (err) {
      setReserveError(
        err instanceof Error
          ? err.message
          : zh
            ? "預約失敗"
            : "Reservation failed",
      );
    } finally {
      setReserving(false);
    }
  }

  async function addPaymentMethod() {
    const url = await createPaymentMethodSetup();
    if (url) window.location.href = url;
  }

  if (!gateChecked) {
    return (
      <main className="min-h-screen bg-white text-ink">
        <Navbar />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-ink">
      <Navbar />

      <div className="lg:mx-auto lg:max-w-[1440px]">
        {/* node 1990:8310 — content root: ver gap 64, pad 32/0/32/0 */}
        <div className="flex flex-col gap-[64px] pt-[32px] pb-[32px]">
          {/* node 2662:24350 — hero: pad 0/80; node 2513:29271 — carousel
              1280×454 r12 IMAGE fill, pad 16 */}
          <section className="px-6 lg:px-[80px]">
            <div
              className="relative h-[420px] w-full overflow-hidden rounded-[12px] bg-classz-50 lg:h-[454px]"
              data-testid="payment-hero"
            >
              <img
                src={programImage(course.id, course.image_url)}
                alt={course.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
              {/* node 2518:29551 — action chips 35×35 white/80 #EBEBEB */}
              <div className="absolute right-[16px] top-[16px] flex gap-[10px]">
                {[
                  "/programs/export.svg",
                  "/programs/message-2.svg",
                  "/programs/heart.svg",
                ].map((src, i) => (
                  <span
                    key={i}
                    className="flex h-[35px] w-[35px] items-center justify-center rounded-full border border-[#EBEBEB] bg-white/80"
                  >
                    <img src={src} alt="" className="h-[16px] w-[16px]" />
                  </span>
                ))}
              </div>
              {/* node 2518:29572/73 — arrows #EBEBEB 60% */}
              <button
                type="button"
                aria-label={zh ? "上一張" : "Previous"}
                className="absolute left-[16px] top-1/2 flex h-[35px] w-[35px] -translate-y-1/2 items-center justify-center rounded-full bg-[#EBEBEB]/60"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                  <path
                    d="M10 3L5 8l5 5"
                    stroke="#222"
                    strokeWidth="1.4"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                aria-label={zh ? "下一張" : "Next"}
                className="absolute right-[16px] top-1/2 flex h-[35px] w-[35px] -translate-y-1/2 items-center justify-center rounded-full bg-[#EBEBEB]/60"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                  <path
                    d="M6 3l5 5-5 5"
                    stroke="#222"
                    strokeWidth="1.4"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              {/* node 2518:29574 — dots: 4×6px + 1×4px, active #FFFFFF */}
              <div className="absolute bottom-[16px] left-1/2 flex -translate-x-1/2 items-center gap-[5px]">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    aria-hidden
                    className={`rounded-full ${i === 0 ? "h-[6px] w-[6px] bg-white" : "h-[4px] w-[4px] self-center bg-[#DDDDDD]"}`}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* node 3816:21369 — columns: hor gap 64, pad 0/120 */}
          <div className="flex flex-col gap-[48px] px-6 lg:flex-row lg:gap-[64px] lg:px-[120px]">
            {/* node 3999:5053 — LEFT 605, gap 32 */}
            <div className="flex w-full flex-col gap-[32px] lg:w-[605px] lg:shrink-0">
              {/* node 3999:5054 — info block gap 16 */}
              <div className="flex flex-col gap-[16px]">
                {/* node 3999:5055 — title row h29 space-between */}
                <div className="flex items-center justify-between gap-[10px]">
                  <h1 className="text-[24px] font-[weight:590] leading-[29px] text-[#222222]">
                    {course.name}
                  </h1>
                  <span className="flex shrink-0 items-center gap-[5px]">
                    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden>
                      <path
                        d="M10 .8l2.47 5.9 6.37.51-4.86 4.16 1.49 6.22L10 14.2l-5.47 3.39 1.49-6.22L1.16 7.2l6.37-.5L10 .8z"
                        fill="#222222"
                      />
                    </svg>
                    <span className="text-[16px] font-normal leading-[19px] text-[#222222]">
                      4.91
                    </span>
                  </span>
                </div>

                {/* node 3999:5061 — price row h24 gap 5 (strike price omitted
                    — single price in API) */}
                <p className="flex h-[24px] items-center gap-[5px]">
                  {price != null ? (
                    <span className="text-[20px] leading-none text-[#222222]">
                      ${Number(price.toFixed(price % 1 ? 2 : 0))}
                    </span>
                  ) : null}
                  <span
                    aria-hidden
                    className="h-[2.5px] w-[2.5px] rounded-full bg-[#5E5E5E]"
                  />
                  {course.age_tag ? (
                    <span className="text-[20px] font-normal leading-none text-[#5E5E5E]">
                      {zh ? `${course.age_tag} 歲` : `Age ${course.age_tag}`}
                    </span>
                  ) : null}
                </p>

                {/* node 3999:5065 — intro 14/400 #5E5E5E */}
                {course.intro ? (
                  <p className="min-h-[34px] text-[14px] font-normal leading-[17px] text-[#5E5E5E]">
                    {course.intro}
                  </p>
                ) : null}

                {/* node 3999:5067 — language row omitted (no API field, same
                    decision as the program detail page) */}

                {/* node 3999:5078 — location row: icon 20.02 + 14/400 */}
                {course.venue || course.location ? (
                  <p className="flex items-center gap-[5px] text-[14px] font-normal leading-[17px] text-[#5E5E5E]">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      aria-hidden
                      className="shrink-0"
                    >
                      <path
                        d="M10 18s6-5.2 6-9.6A6 6 0 004 8.4C4 12.8 10 18 10 18z"
                        stroke="#5E5E5E"
                        strokeWidth="1.2"
                        fill="none"
                      />
                      <circle
                        cx="10"
                        cy="8.4"
                        r="2.2"
                        stroke="#5E5E5E"
                        strokeWidth="1.2"
                        fill="none"
                      />
                    </svg>
                    {course.venue || course.location}
                  </p>
                ) : null}
              </div>

              {/* node 3999:5086 — hosted by gap 16 */}
              {centreName ? (
                <section
                  className="flex flex-col gap-[16px]"
                  aria-label={zh ? "主辦中心" : "Hosted by"}
                >
                  <h2 className="text-[16px] font-[weight:590] leading-[19px] text-black">
                    {zh ? "主辦中心" : "Hosted by"}
                  </h2>
                  {/* node 3999:5088 — centre row 343×50 */}
                  <div className="flex w-[343px] max-w-full items-center gap-[20px] px-[16px]">
                    <img
                      src={centreAvatar || HOST_AVATAR}
                      alt=""
                      className="h-[50px] w-[50px] shrink-0 rounded-full object-cover"
                    />
                    <p className="min-w-0 flex-1 text-[14px] font-[weight:590] leading-[17px] text-[#222222]">
                      {centreName}
                    </p>
                    <span className="flex shrink-0 items-center gap-[4px]">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 20 20"
                        aria-hidden
                      >
                        <path
                          d="M10 .8l2.47 5.9 6.37.51-4.86 4.16 1.49 6.22L10 14.2l-5.47 3.39 1.49-6.22L1.16 7.2l6.37-.5L10 .8z"
                          fill="#222222"
                        />
                      </svg>
                      <span className="text-[14px] font-normal text-[#222222]">
                        4.91
                      </span>
                    </span>
                  </div>
                  {/* node 3999:5096 — coach row 343×50 */}
                  {course.instructor ? (
                    <div className="flex w-[343px] max-w-full items-center gap-[20px] px-[16px]">
                      <img
                        src={CLASS_AVATARS[0]}
                        alt=""
                        className="h-[50px] w-[50px] shrink-0 rounded-full object-cover"
                      />
                      <div className="flex min-w-0 flex-col gap-[4px]">
                        <p className="text-[14px] font-[weight:590] leading-[17px] text-[#222222]">
                          {course.instructor}
                        </p>
                        <p className="text-[14px] font-normal leading-[17px] text-[#5E5E5E]">
                          {zh ? "課程導師" : "Program Coach"}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </section>
              ) : null}

              {/* node 3999:5102/04 — selected sessions card (pad 16 r12) */}
              <section
                aria-label={zh ? "已選課堂" : "Selected sessions"}
                className="flex w-[605px] max-w-full flex-col gap-[16px] rounded-[12px] bg-white p-[16px] shadow-[0_6px_16px_rgba(0,0,0,0.12)]"
              >
                <div className="flex flex-col gap-[10px]">
                  {/* node 3999:5106 — "N lessons · range" */}
                  <p className="flex items-center gap-[4px] text-[14px] leading-[17px]">
                    <span className="font-[weight:590] text-[#222222]">
                      {zh
                        ? `${sessions.length} 堂`
                        : `${sessions.length} lessons`}
                    </span>
                    <span
                      aria-hidden
                      className="h-[2px] w-[2px] rounded-full bg-black"
                    />
                    <span className="font-normal text-[#222222]">
                      {firstStart && lastStart
                        ? `${fmtDateLine(firstStart, locale).split(",")[0]} - ${fmtDateLine(lastStart, locale).split(",")[0]}`
                        : ""}
                    </span>
                  </p>
                  {/* node 3999:5112 — "Hide full dates" 14/590 #5E5E5E centered */}
                  <div className="flex justify-center">
                    <span className="flex items-center gap-[4px] text-[14px] font-[weight:590] text-[#5E5E5E]">
                      {zh ? "收起完整日期" : "Hide full dates"}
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 18 18"
                        aria-hidden
                      >
                        <path
                          d="M4 7l5 5 5-5"
                          stroke="#5E5E5E"
                          strokeWidth="1.4"
                          fill="none"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  </div>
                  {/* node 3999:5119 — divider #EBEBEB */}
                  <div className="h-px w-full bg-[#EBEBEB]" />
                  {/* node 3999:5120 — "Lesson dates" + 3-col grid */}
                  <div className="flex flex-col gap-[16px]">
                    <p className="text-[14px] font-[weight:510] leading-[17px] text-[#222222]">
                      {t("programs.lessonDates")}
                    </p>
                    <div className="flex items-start justify-between">
                      {dateColumns.map((col, c) => (
                        <div key={c} className="flex flex-col gap-[10px]">
                          {col.map(({ id, n, start: d, end: dEnd }) => (
                            <div
                              key={id}
                              className="flex items-center gap-[10px]"
                            >
                              <span className="text-[12px] font-[weight:590] leading-[14px] text-black">
                                {n}
                              </span>
                              <span
                                aria-hidden
                                className="h-[2px] w-[2px] shrink-0 rounded-full bg-black"
                              />
                              <div className="flex flex-col gap-[5px]">
                                <span className="text-[14px] font-[weight:590] leading-[17px] text-[#222222]">
                                  {fmtDateLine(d, locale)}
                                </span>
                                <span className="text-[14px] font-normal leading-[17px] text-[#222222]">
                                  {fmtTime(d, locale)} - {fmtTime(dEnd, locale)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* node 3997:4731 — RIGHT 531, gap 32 */}
            <div className="flex min-w-0 flex-1 flex-col gap-[32px]">
              {/* node 3997:4732 — Booking for 16/590 + child row */}
              <section className="flex flex-col gap-[16px]">
                <h2 className="text-[16px] font-[weight:590] leading-[19px] text-black">
                  {zh ? "預約學員" : "Booking for"}
                </h2>
                {childrenError === "NO_CHILDREN" ? (
                  <div className="flex flex-col gap-[8px] rounded-[12px] bg-[#F5F5F5] p-[16px]">
                    <p className="text-[14px] text-[#222222]">
                      {zh
                        ? "請先新增子女資料，再進行預約。"
                        : "Add a child profile first to continue booking."}
                    </p>
                    <a
                      href="/account/children"
                      className="text-[14px] font-[weight:590] text-[#0ABAB5] underline"
                    >
                      {zh ? "前往新增子女" : "Add a child"}
                    </a>
                  </div>
                ) : (
                  <div className="flex h-[50px] items-center justify-between gap-[20px] px-[16px]">
                    <div className="flex min-w-0 items-center gap-[20px]">
                      <img
                        src={
                          child?.photo_url || "/images/programs/avatars/a2.jpg"
                        }
                        alt=""
                        className="h-[50px] w-[50px] shrink-0 rounded-full object-cover"
                      />
                      <p className="truncate text-[18px] font-[weight:590] text-[#222222]">
                        {child ? child.full_name : zh ? "載入中…" : "Loading…"}
                      </p>
                    </div>
                    {children.length > 1 ? (
                      <button
                        type="button"
                        data-testid="switch-child"
                        onClick={() =>
                          setChildIndex((i) => (i + 1) % children.length)
                        }
                        className="shrink-0 text-[14px] font-[weight:590] text-[#222222] underline underline-offset-2"
                      >
                        {zh ? "切換" : "Switch"}
                      </button>
                    ) : null}
                  </div>
                )}
              </section>

              {/* node 3997:4742 — Pay with / Payment method / promo */}
              <section className="flex flex-col gap-[16px]">
                {/* node 3997:4743/45 — "Pay with" 16/590 + "Powered by" */}
                <div className="flex items-center gap-[16px]">
                  <p className="text-[16px] font-[weight:590] text-black">
                    {zh ? "付款方式" : "Pay with"}
                  </p>
                  <p className="flex items-center gap-[4px]">
                    <span className="text-[14px] font-[weight:590] text-[#222222]">
                      {zh ? "技術支援" : "Powered by"}
                    </span>
                    <span className="text-[15px] font-bold italic text-[#6461FC]">
                      stripe
                    </span>
                  </p>
                </div>
                {/* node 3997:4761 — "Payment method" 14/400 + Add */}
                <div className="flex h-[43px] items-center justify-between gap-[20px] px-[16px]">
                  <p className="text-[14px] font-normal text-[#222222]">
                    {zh ? "付款方法" : "Payment method"}
                  </p>
                  <button
                    type="button"
                    onClick={addPaymentMethod}
                    className="shrink-0 text-[14px] font-[weight:590] text-[#222222] underline underline-offset-2"
                  >
                    {zh ? "新增" : "Add"}
                  </button>
                </div>
                {/* node 3997:4844 — promo field 51 r8 #B0B0B0 */}
                <button
                  type="button"
                  data-testid="promo-field"
                  onClick={() => setPromoOpen(true)}
                  className="flex h-[51px] w-full items-center justify-between rounded-[8px] border border-[#B0B0B0] px-[16px] py-[12px] text-left"
                >
                  <span
                    className={`truncate text-[16px] font-normal ${coupon ? "text-[#222222]" : "text-[#B0B0B0]"}`}
                  >
                    {coupon
                      ? `${zh ? "已選：" : "Applied: "}${coupon.code}`
                      : zh
                        ? "推廣代碼"
                        : "Promotion code"}
                  </span>
                  {coupon ? (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCoupon(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          setCoupon(null);
                        }
                      }}
                      className="shrink-0 pl-[8px] text-[14px] font-[weight:590] text-[#5E5E5E] underline"
                    >
                      {zh ? "移除" : "Remove"}
                    </span>
                  ) : null}
                </button>
              </section>

              {/* node 3997:4851 — amounts card (pad-x16, rows gap 20) */}
              <section className="rounded-[12px] bg-white px-[16px] py-[24px] shadow-[0_6px_16px_rgba(0,0,0,0.08)]">
                <div className="flex flex-col gap-[20px]">
                  {/* node 3997:4854 — "$299 lesson" 22 (400/590) */}
                  <div className="flex items-baseline gap-[4px]">
                    {price != null ? (
                      <>
                        <span className="text-[22px] font-[weight:590] leading-[26px] text-[#222222]">
                          ${Number(price.toFixed(price % 1 ? 2 : 0))}
                        </span>
                        <span className="text-[16px] font-normal text-[#222222]">
                          {zh ? "每堂" : "lesson"}
                        </span>
                      </>
                    ) : null}
                  </div>
                  {/* node 3997:4859 — "N lessons · range" 14 */}
                  <p className="flex items-center gap-[4px] text-[14px] leading-[17px]">
                    <span className="font-[weight:590] text-[#222222]">
                      {zh
                        ? `${sessions.length} 堂`
                        : `${sessions.length} lessons`}
                    </span>
                    <span
                      aria-hidden
                      className="h-[2px] w-[2px] rounded-full bg-black"
                    />
                    <span className="font-normal text-[#222222]">
                      {firstStart && lastStart
                        ? `${fmtDateLine(firstStart, locale).split(",")[0]} - ${fmtDateLine(lastStart, locale).split(",")[0]}`
                        : ""}
                    </span>
                  </p>
                  {/* node 3997:4863 — avatars + going + spots */}
                  <div className="flex items-center gap-[12px]">
                    <span aria-hidden className="flex items-center">
                      {CLASS_AVATARS.slice(0, 3).map((src, i) => (
                        <img
                          key={src}
                          src={src}
                          alt=""
                          className={`h-[24px] w-[24px] rounded-full border border-white object-cover ${i > 0 ? "-ml-[8px]" : ""}`}
                        />
                      ))}
                    </span>
                    <span className="text-[14px] font-[weight:510] text-[#5E5E5E]">
                      {zh ? "+3 人參加" : "+3 Going"}
                    </span>
                    <span className="text-[14px] font-[weight:510] text-[#0ABAB5]">
                      {spotsLeft > 0
                        ? zh
                          ? `剩餘 ${spotsLeft} 個名額`
                          : `${spotsLeft} spots left`
                        : zh
                          ? "已滿"
                          : "Class full"}
                    </span>
                  </div>
                  {/* node 3997:4872 — "protected by zcare" (asset 007-3997_4874) */}
                  <p className="flex items-center gap-[4px] text-[14px] font-normal text-[#5E5E5E]">
                    {zh ? "你的預約受" : "Your booking is protected by"}
                    <img
                      src="/images/payment/zcare.png"
                      alt="ZCare"
                      className="h-[13px] w-[59px] object-contain"
                    />
                  </p>
                  {/* node 3997:4875 — subtotal row 16/400 */}
                  {subtotal != null ? (
                    <div className="flex items-center justify-between">
                      <p className="text-[16px] font-normal text-[#222222] underline underline-offset-2">
                        {zh
                          ? `$${Number(price?.toFixed(price % 1 ? 2 : 0))} × ${sessions.length} 堂`
                          : `$${Number(price?.toFixed(price % 1 ? 2 : 0))} x ${sessions.length} lessons`}
                      </p>
                      <p className="text-[16px] font-normal text-[#222222]">
                        ${subtotal.toLocaleString("en-HK")}
                      </p>
                    </div>
                  ) : null}
                  {/* node 3997:4878 — discount row (coupon) */}
                  {coupon && discount > 0 ? (
                    <div className="flex items-center justify-between">
                      <p className="text-[16px] font-normal text-[#222222] underline underline-offset-2">
                        {zh ? "限定優惠" : "Limited discount"}
                      </p>
                      <p className="text-[16px] font-normal text-[#008A05]">
                        -$${discount.toLocaleString("en-HK")}
                      </p>
                    </div>
                  ) : null}
                  {/* node 3997:4884 — divider #DDDDDD */}
                  <div className="h-px w-full bg-[#DDDDDD]" />
                  {/* node 3997:4885 — total row */}
                  <div className="flex items-center justify-between">
                    <p className="text-[16px] font-[weight:590] text-[#222222]">
                      {zh ? "總計 (HKD)" : "Total (HKD)"}
                    </p>
                    <p className="text-[16px] font-normal text-[#222222]">
                      {total != null
                        ? `$${total.toLocaleString("en-HK")}`
                        : "—"}
                    </p>
                  </div>
                </div>
              </section>

              {reserveError ? (
                <p
                  className="px-[16px] text-[14px] text-[#E16E65]"
                  data-testid="reserve-error"
                >
                  {reserveError}
                </p>
              ) : null}

              {/* node 3997:4888/89 — Reserve 403×51 r8 #222 within pad-x64 */}
              <div className="flex justify-center px-[64px]">
                <button
                  type="button"
                  data-testid="reserve-button"
                  onClick={reserve}
                  disabled={reserving || !child || total == null}
                  className="flex h-[51px] w-full max-w-[403px] items-center justify-center rounded-[8px] bg-[#222222] text-[16px] font-[weight:590] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {reserving
                    ? zh
                      ? "處理中…"
                      : "Processing…"
                    : zh
                      ? "預約並付款"
                      : "Reserve"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <PromoModal
        open={promoOpen}
        onClose={() => setPromoOpen(false)}
        onUse={(c) => {
          setCoupon(c);
          setPromoOpen(false);
        }}
      />

      {successOpen ? (
        <SuccessModal
          onClose={() => setSuccessOpen(false)}
          courseName={course.name}
          courseImage={programImage(course.id, course.image_url)}
          languageLabel={null}
          locationLabel={course.venue || course.location}
          childName={child?.full_name || ""}
          childPhoto={child?.photo_url}
          centreName={centreName}
          coachName={course.instructor || null}
          amountHkd={paidAmount}
        />
      ) : null}
    </main>
  );
}
