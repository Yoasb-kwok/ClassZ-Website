"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, Loader2 } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { formatTemplate } from "@/components/programs/format";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { apiGet } from "@/lib/classz-api-client";
import { getClasszSession } from "@/lib/classz-auth";
import { resolveUploadUrl } from "@/lib/resolve-upload-url";
import { CLASS_AVATARS, programImage } from "@/lib/program-images";
import { holidayFor } from "@/lib/hk-holidays";

/**
 * /schedule — capture 2022:20563 (0310 "Schedule", 1440×1519.55; the
 * timetable the Payment-successful modal links to).
 *
 * Layout: navbar / content pad 32/80 gap 32 (calendar 887 + sidebar 361) /
 * footer.
 *
 * LEFT (node 2028:21069 → 2039:26698, 887 wide): month nav row h35
 * (35×35 r100 #F5F5F5 arrows + "September" 20/590, gap 10, centered);
 * weekday header h50 (14/400 #666666, hairline #D9D9D9); grid 813 wide
 * (37px inset), 7 cols, cells 116.14 tall, stroke #E6E6E6; day number
 * 14/510 (#080808; out-of-month cells empty per capture); today = white
 * number on a teal #0ABAB5 rounded badge; event chips (dot 10 + title
 * 12/510, gap 5) stacked, max 2 then "+N More" 12/400.
 *
 * RIGHT (node 2028:21067, 361 wide, gap 20): child switcher h40 (avatar
 * cluster 40×40 + "Select all" 18/590 + chevron); "Today"/"Upcoming"
 * 18/590; session cards (r12, pad 16, white, soft shadow): status dot +
 * time 12/400 ls0.75 + "·" + "Sept 02" 12/400; image 93×113 r12 + title
 * 14/590 + "Lesson 1 of 8" 12/590 + child row (avatar 24 + 12/590) +
 * centre 12/400 #5E5E5E.
 *
 * "Select all" view: every child's lessons get their own colour (capture
 * palette) with a dot+name legend under the calendar's bottom-left;
 * single-child view keeps status colours (teal confirmed / yellow
 * pending). Holidays render as gray entries in cells (mock "Memorial
 * Day" style) via lib/hk-holidays.
 *
 * Disclosed deviations (INDEX.md): mock-only cell notes ("Add your
 * holiday") not built; mock's 8px in-cell time+name variant unified to
 * the 12px chip; Upcoming capped at 8 cards; below-lg stacks single
 * column (no mobile frame in the capture).
 */

type Child = {
  id: number;
  full_name: string;
  photo_url: string | null;
};

type SchedSession = {
  class_id: number;
  profile_id: number;
  status: "confirmed" | "pending";
  start_time: string | null;
  end_time: string | null;
  title: string;
  image_url: string | null;
  centre_name: string | null;
  location: string | null;
  lesson_index: number | null;
  lesson_total: number | null;
};

type SchedData = {
  children: Child[];
  sessions: SchedSession[];
};

const DOT_COLORS: Record<SchedSession["status"], string> = {
  confirmed: "#0ABAB5",
  pending: "#FFC943",
};

/** Per-child colours for the "Select all" view (capture palette). */
const CHILD_COLORS = [
  "#0ABAB5", // teal
  "#FFC943", // yellow
  "#FC5555", // red
  "#5D9275", // green
  "#FF7D57", // orange
  "#C2E0ED", // light blue
];

const MONTH_ABBR = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];

/** "YYYY-MM-DDTHH:MM:SS" → local Date (safe on Safari, unlike " …:MM:SS"). */
function parseDT(value: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function fmtTime(d: Date): string {
  let h = d.getHours();
  const suffix = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(h)}:${p(d.getMinutes())}${suffix}`;
}

function fmtCardDate(d: Date): string {
  return `${MONTH_ABBR[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}`;
}

function dateKey(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function sameDay(a: Date, b: Date): boolean {
  return dateKey(a) === dateKey(b);
}

function childAvatar(child: Child | null | undefined, index: number): string {
  if (child?.photo_url) return resolveUploadUrl(child.photo_url);
  return CLASS_AVATARS[index % CLASS_AVATARS.length];
}

export function ScheduleClient() {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const zh = locale === "zh-TW";

  const [gateChecked, setGateChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [sessions, setSessions] = useState<SchedSession[]>([]);
  const [selectedChild, setSelectedChild] = useState<"all" | number>("all");
  const [monthCursor, setMonthCursor] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // Login gate — mirror of the payment page (?next= round-trip).
  useEffect(() => {
    const s = getClasszSession();
    if (!s) {
      router.replace(`/login?next=${encodeURIComponent("/schedule")}`);
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage bootstrap, same as auth-modal/payment-client
    setGateChecked(true);
  }, [router]);

  useEffect(() => {
    if (!gateChecked) return;
    let cancelled = false;
    apiGet<SchedData>("/children/schedule", "student")
      .then((data) => {
        if (cancelled) return;
        setChildren(data?.children ?? []);
        setSessions(data?.sessions ?? []);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadFailed(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [gateChecked]);

  const byChild = useMemo(
    () =>
      sessions.filter(
        (s) => selectedChild === "all" || s.profile_id === selectedChild,
      ),
    [sessions, selectedChild],
  );

  const sessionsByDay = useMemo(() => {
    const map = new Map<string, SchedSession[]>();
    for (const s of byChild) {
      const d = parseDT(s.start_time);
      if (!d) continue;
      const key = dateKey(d);
      const list = map.get(key);
      if (list) list.push(s);
      else map.set(key, [s]);
    }
    return map;
  }, [byChild]);

  const now = new Date();
  const todayKey = dateKey(now);

  const todaySessions = useMemo(
    () =>
      byChild
        .filter((s) => {
          const d = parseDT(s.start_time);
          return d ? sameDay(d, now) : false;
        })
        .sort((a, b) =>
          String(a.start_time).localeCompare(String(b.start_time)),
        ),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- "now" is fixed per render pass
    [byChild],
  );

  const upcomingSessions = useMemo(
    () =>
      byChild
        .filter((s) => {
          const d = parseDT(s.start_time);
          if (!d) return false;
          return d.getTime() > now.getTime() && !sameDay(d, now);
        })
        .sort((a, b) =>
          String(a.start_time).localeCompare(String(b.start_time)),
        )
        .slice(0, 8),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- "now" is fixed per render pass
    [byChild],
  );

  // Month grid — Sunday-first, out-of-month cells empty (per capture).
  const weeks = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = monthCursor.getMonth();
    const first = new Date(year, month, 1);
    const start = new Date(year, month, 1 - first.getDay());
    const rows: { date: Date; inMonth: boolean }[][] = [];
    const cursor = new Date(start);
    do {
      const week: { date: Date; inMonth: boolean }[] = [];
      for (let i = 0; i < 7; i += 1) {
        week.push({
          date: new Date(cursor),
          inMonth: cursor.getMonth() === month,
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      rows.push(week);
    } while (cursor.getMonth() === month);
    return rows;
  }, [monthCursor]);

  const monthLabel = useMemo(() => {
    if (zh)
      return `${monthCursor.getFullYear()}年${monthCursor.getMonth() + 1}月`;
    return monthCursor.toLocaleDateString("en-GB", { month: "long" });
  }, [monthCursor, zh]);

  const weekdayLabels = useMemo(() => {
    // Sunday-first labels; zh uses the short form (日/一/…).
    const base = new Date(2023, 9, 1); // 2023-10-01 was a Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return zh
        ? d.toLocaleDateString("zh-TW", { weekday: "short" })
        : d.toLocaleDateString("en-GB", { weekday: "long" });
    });
  }, [zh]);

  const selectedLabel =
    selectedChild === "all"
      ? t("schedule.all")
      : (children.find((c) => c.id === selectedChild)?.full_name ?? "");

  /** In "Select all" every child gets its own colour; a single child's view
   * keeps the status colours (teal confirmed / yellow pending). */
  const isAll = selectedChild === "all";
  const colorFor = (s: SchedSession): string => {
    if (!isAll) return DOT_COLORS[s.status];
    const idx = children.findIndex((c) => c.id === s.profile_id);
    return CHILD_COLORS[(idx >= 0 ? idx : 0) % CHILD_COLORS.length];
  };

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
        <div className="flex flex-col gap-[32px] px-6 py-[32px] lg:flex-row lg:px-[80px]">
          {/* node 2039:26698 — Calendar column (fluid; grid centres) */}
          <section className="min-w-0 flex-1">
            {/* node 2055:31757 — month nav h35, gap 10, centered */}
            <div className="flex h-[35px] items-center justify-center gap-[10px]">
              <button
                type="button"
                aria-label={zh ? "上個月" : "Previous month"}
                onClick={() =>
                  setMonthCursor(
                    (m) => new Date(m.getFullYear(), m.getMonth() - 1, 1),
                  )
                }
                className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-[#F5F5F5] text-[#222222] transition-colors hover:bg-[#EBEBEB]"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                  <path
                    d="M10 3L5 8l5 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </button>
              <span className="min-w-[103px] text-center text-[20px] font-[weight:590] tracking-[-0.02em] text-[#222222]">
                {monthLabel}
              </span>
              <button
                type="button"
                aria-label={zh ? "下個月" : "Next month"}
                onClick={() =>
                  setMonthCursor(
                    (m) => new Date(m.getFullYear(), m.getMonth() + 1, 1),
                  )
                }
                className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-[#F5F5F5] text-[#222222] transition-colors hover:bg-[#EBEBEB]"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                  <path
                    d="M6 3l5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </button>
            </div>

            {loading ? (
              <div className="flex h-[400px] items-center justify-center text-[#717171]">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : loadFailed ? (
              <div className="flex h-[400px] items-center justify-center text-[14px] text-[#717171]">
                {t("schedule.loadFailed")}
              </div>
            ) : (
              <>
                {/* node 2039:26737 — weekday header, hairline #D9D9D9 */}
                <div className="mx-auto mt-[15px] w-full lg:w-[813px]">
                  <div className="grid grid-cols-7 border-b border-[#D9D9D9]">
                    {weekdayLabels.map((label) => (
                      <div
                        key={label}
                        className="flex h-[50px] items-center justify-center text-[14px] font-normal text-[#666666]"
                      >
                        {label}
                      </div>
                    ))}
                  </div>

                  {/* node 2039:26699 — grid 7×N, cells 116.14, #E6E6E6 */}
                  <div className="grid grid-cols-7 border-r border-[#E6E6E6]">
                    {weeks.flat().map(({ date, inMonth }, i) => {
                      const key = dateKey(date);
                      const dayEvents = inMonth
                        ? (sessionsByDay.get(key) ?? [])
                        : [];
                      const holiday = inMonth ? holidayFor(key) : null;
                      // The holiday entry occupies a slot like a lesson chip.
                      const entries = (holiday ? 1 : 0) + dayEvents.length;
                      const visible = entries > 2 ? 2 : entries;
                      const extra = entries - visible;
                      const showHoliday = holiday !== null && visible > 0;
                      const shownEvents = Math.min(
                        dayEvents.length,
                        visible - (showHoliday ? 1 : 0),
                      );
                      const isToday = key === todayKey;
                      // Capture: weekend (Sat/Sun) numbers are gray #666666,
                      // weekdays #080808.
                      const dow = date.getDay();
                      const isWeekend = dow === 0 || dow === 6;
                      return (
                        <div
                          key={`${key}-${i}`}
                          className="h-[116px] border-b border-l border-[#E6E6E6] px-[12px] py-[6px]"
                        >
                          {inMonth ? (
                            <div className="flex h-full flex-col gap-[6px] overflow-hidden">
                              {isToday ? (
                                <span className="flex h-[22px] w-[22px] items-center justify-center rounded-[6px] bg-[#0ABAB5] text-[14px] font-[weight:510] text-white">
                                  {date.getDate()}
                                </span>
                              ) : (
                                <span
                                  className={`text-[14px] font-[weight:510] leading-[17px] ${isWeekend ? "text-[#666666]/50" : "text-[#080808]"}`}
                                >
                                  {date.getDate()}
                                </span>
                              )}
                              {showHoliday ? (
                                // node mock — holiday text in gray ("Memorial Day")
                                <span
                                  className="truncate text-[12px] font-normal leading-[14px] text-[#666666]"
                                  title={holiday ?? ""}
                                >
                                  {holiday}
                                </span>
                              ) : null}
                              {dayEvents.slice(0, shownEvents).map((ev) => (
                                <div
                                  key={`${ev.profile_id}-${ev.class_id}-${ev.status}`}
                                  className="flex min-w-0 items-center gap-[5px]"
                                  title={ev.title}
                                >
                                  <span
                                    className="h-[10px] w-[10px] shrink-0 rounded-full"
                                    style={{ backgroundColor: colorFor(ev) }}
                                  />
                                  <span className="truncate text-[12px] font-[weight:510] leading-[14px] text-[#222222]">
                                    {ev.title}
                                  </span>
                                </div>
                              ))}
                              {extra > 0 ? (
                                <span className="text-[12px] font-normal leading-[14px] text-[#222222]">
                                  {formatTemplate(t, "schedule.moreEvents", {
                                    n: extra,
                                  })}
                                </span>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>

                  {/* Per-child colour legend — bottom-left of the schedule,
                      visible in "Select all" so kids are distinguishable */}
                  {isAll && children.length > 1 ? (
                    <div className="flex flex-wrap items-center gap-x-[16px] gap-y-[6px] pt-[12px]">
                      {children.map((child, i) => (
                        <span
                          key={child.id}
                          className="flex items-center gap-[6px] text-[12px] font-[weight:510] text-[#222222]"
                        >
                          <span
                            className="h-[10px] w-[10px] shrink-0 rounded-full"
                            style={{
                              backgroundColor:
                                CHILD_COLORS[i % CHILD_COLORS.length],
                            }}
                          />
                          {child.full_name}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </section>

          {/* Sidebar — user-directed 2026-10-03: cards enlarged ~1.2× from
              the capture (361×169 → 440×205), so the column widens to fit */}
          <aside className="flex w-full max-w-[440px] flex-col gap-[20px] lg:w-[440px]">
            {/* node 2046:29830 — child switcher h40 */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  aria-label={t("schedule.switchChild")}
                  className="flex h-[40px] items-center gap-[15px] text-left"
                >
                  <span className="relative block h-[40px] w-[40px] shrink-0">
                    {selectedChild === "all" ? (
                      children.slice(0, 3).map((child, i) => (
                        // node 2046:29833-35 — overlapping avatar cluster
                        <img
                          key={child.id}
                          src={childAvatar(child, i)}
                          alt=""
                          className="absolute h-[23px] w-[23px] rounded-full border border-white object-cover"
                          style={{
                            left: [17, 6, 0][i] ?? 0,
                            top: [11, 0, 17][i] ?? 0,
                          }}
                        />
                      ))
                    ) : (
                      <img
                        src={childAvatar(
                          children.find((c) => c.id === selectedChild),
                          0,
                        )}
                        alt=""
                        className="absolute left-0 top-0 h-[40px] w-[40px] rounded-full object-cover"
                      />
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[18px] font-[weight:590] text-[#222222]">
                    {selectedLabel}
                  </span>
                  <ChevronDown
                    className="h-4 w-4 shrink-0 text-[#222222]"
                    strokeWidth={1.5}
                  />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="start"
                  sideOffset={8}
                  className="z-[100] min-w-[200px] rounded-xl bg-white p-2 shadow-[0_6px_16px_2px_rgba(0,0,0,0.12)]"
                >
                  <DropdownMenu.Item
                    onSelect={() => setSelectedChild("all")}
                    className={`flex h-10 cursor-pointer items-center gap-2 rounded-lg px-3 text-[14px] text-ink outline-none data-[highlighted]:bg-[#F5F5F5] ${
                      selectedChild === "all" ? "font-[590]" : ""
                    }`}
                  >
                    {t("schedule.all")}
                  </DropdownMenu.Item>
                  {children.map((child) => (
                    <DropdownMenu.Item
                      key={child.id}
                      onSelect={() => setSelectedChild(child.id)}
                      className={`flex h-10 cursor-pointer items-center gap-2 rounded-lg px-3 text-[14px] text-ink outline-none data-[highlighted]:bg-[#F5F5F5] ${
                        selectedChild === child.id ? "font-[590]" : ""
                      }`}
                    >
                      <img
                        src={childAvatar(child, 0)}
                        alt=""
                        className="h-6 w-6 rounded-full object-cover"
                      />
                      {child.full_name}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>

            {/* node 2046:29846 — Today */}
            <section>
              <h2 className="text-[18px] font-[weight:590] leading-[21px] text-[#222222]">
                {t("schedule.today")}
              </h2>
              {todaySessions.length === 0 ? (
                <p className="mt-[10px] text-[13px] text-[#717171]">
                  {t("schedule.emptyToday")}
                </p>
              ) : (
                // Wider gaps so the cards' drop shadows don't overlap —
                // cards are user-enlarged, 440×205 each
                <div className="mt-[10px] flex flex-col gap-[28px]">
                  {todaySessions.map((s) => (
                    <SessionCard key={`${s.profile_id}-${s.class_id}`} s={s} />
                  ))}
                </div>
              )}
            </section>

            {/* node 2046:29847 — Upcoming */}
            <section>
              <h2 className="text-[18px] font-[weight:590] leading-[21px] text-[#222222]">
                {t("schedule.upcoming")}
              </h2>
              {upcomingSessions.length === 0 ? (
                <p className="mt-[10px] text-[13px] text-[#717171]">
                  {t("schedule.emptyUpcoming")}
                </p>
              ) : (
                <div className="mt-[10px] flex flex-col gap-[28px]">
                  {upcomingSessions.map((s) => (
                    <SessionCard key={`${s.profile_id}-${s.class_id}`} s={s} />
                  ))}
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>

      <Footer />
    </main>
  );

  function SessionCard({ s }: { s: SchedSession }) {
    const start = parseDT(s.start_time);
    const end = parseDT(s.end_time);
    const child = children.find((c) => c.id === s.profile_id);
    const childIdx = children.findIndex((c) => c.id === s.profile_id);
    return (
      // User-directed 2026-10-03: enlarged ~1.2× from the capture card
      // (361×169 → 440×205). Capture drop shadow kept: #000 12% / 6 / 16.
      <div className="rounded-[14px] bg-white p-[20px] shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
        {/* dot + time + · + date (scaled from node 2028:20983) */}
        <div className="flex h-[16px] items-center gap-[5px] text-[14px] font-normal leading-[16px] tracking-[0.75px] text-[#222222]">
          <span
            className="h-[12px] w-[12px] shrink-0 rounded-full"
            style={{ backgroundColor: colorFor(s) }}
          />
          <span className="shrink-0">
            {start && end ? `${fmtTime(start)}-${fmtTime(end)}` : "—"}
          </span>
          <span className="h-[3px] w-[3px] shrink-0 rounded-full bg-[#222222]" />
          <span className="shrink-0">{start ? fmtCardDate(start) : "—"}</span>
        </div>

        {/* image 113×137 r14 + info column gap 12 (scaled 20991/20993) */}
        <div className="mt-[12px] flex items-stretch gap-[12px]">
          <img
            src={programImage(s.class_id, s.image_url)}
            alt=""
            className="h-[137px] w-[113px] shrink-0 rounded-[14px] object-cover"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-[12px]">
            <p className="truncate text-[17px] font-[weight:590] leading-[20px] text-[#222222]">
              {s.title}
            </p>
            {s.lesson_index != null && s.lesson_total != null ? (
              <p className="text-[14px] font-[weight:590] leading-[17px] text-[#222222]">
                {formatTemplate(t, "schedule.lessonOf", {
                  i: s.lesson_index,
                  n: s.lesson_total,
                })}
              </p>
            ) : null}
            <div className="flex min-w-0 items-center gap-[5px]">
              <img
                src={childAvatar(child, childIdx)}
                alt=""
                className="h-[28px] w-[28px] shrink-0 rounded-full object-cover"
              />
              <span className="truncate text-[14px] font-[weight:590] text-[#222222]">
                {child?.full_name ?? ""}
              </span>
            </div>
            {s.centre_name ? (
              <p className="truncate text-[14px] font-normal leading-[17px] text-[#5E5E5E]">
                {s.centre_name}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}
