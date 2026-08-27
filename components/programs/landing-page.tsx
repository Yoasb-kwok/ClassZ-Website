"use client";

import Link from "next/link";
import { Outfit } from "next/font/google";
import { useLanguage } from "@/components/language-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import type { PublicCourse } from "@/lib/public-courses";
import { ProgramCard } from "@/components/programs/program-card";

const outfit = Outfit({ weight: "700", subsets: ["latin"] });

/**
 * Landing from Figma #2346:21370 (2408 capture, 2026-08-24).
 * - Root: column gap 32 between top-level sections (node 2346:21370).
 * - Moments collage + Intro (nodes 2346:21398/99/21412, frame gap 34).
 * - Trending Workshop / New Programs render REAL published courses
 *   in the 400×299 "similar" card variant (#2346:21455 / #2346:21512);
 *   the workshops section hides while no workshop-type course exists
 *   in the API (no fake cards). Carousel arrows are inert chrome
 *   (no prototype reactions in the design).
 * - ZPassport is now a white r30 card (node 3963:36089, 2408 redesign)
 *   with photo collage + teal Outfit tagline, sitting between the two
 *   listing sections. No shadow effect exists on any card node
 *   (checked — separation comes from the collage imagery itself).
 */
export function LandingPage({
  programs,
  workshops,
  prices,
}: {
  programs: PublicCourse[];
  workshops: PublicCourse[];
  /** Per-course real prices (detail-endpoint fetch in app/page.tsx —
   *  the /api/courses list omits `price`); keyed by course id. */
  prices?: Record<number, number>;
}) {
  const { t } = useLanguage();

  return (
    <main className="flex min-h-screen flex-col bg-white text-ink md:gap-[32px] lg:mx-auto lg:max-w-[1440px]">
      <Navbar />

      {/* node 2346:21398 — Moments + Intro wrapper, no pad, frame gap 34 */}
      <div className="flex flex-col md:gap-[34px]">
        {/* Moments collage (node 2346:21399) — full-bleed edge to edge
            (self-stretch on the 1440 canvas; side columns touch x=0/x=1440).
            12px radius + overflow-hidden clip the photos like the Figma
            frame. Verified vs 2408 capture: 300/grow/300 columns, gap 20,
            rows 217 + 20 + 217 = 454. Photos swapped to the 2408 design
            assets 2026-08-24 (nodes 2346:21401/05/07/09/11 → public/landing
            collage-*.jpg, compressed from capture PNGs; src ?v=2408b
            cache-busts the filename-stable swap — image hashes verified
            identical to the live Figma fills). */}
        <section className="py-8 lg:py-0" aria-hidden>
          {/* Mobile banner (user pick 2026-08-27): the FULL 5-slot collage
              scaled down to fit — no rotation. Mirrors the desktop grid
              proportionally (1440×454 → aspect box; sides 300/1440 = 20.8%;
              middle = tl/tr row + wide at ~half height); fluid % sizing so
              it scales to any phone width. Same slot aspect as desktop, so
              object-cover crops identically. */}
          <div className="flex aspect-[1440/454] w-full gap-[5px] overflow-hidden rounded-xl lg:hidden">
            <img
              src="/landing/collage-left.jpg?v=2408b"
              alt=""
              className="w-[20.8%] object-cover"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
              <div className="flex min-h-0 h-[calc(50%-2.5px)] gap-[5px]">
                <img
                  src="/landing/collage-tl.jpg?v=2408b"
                  alt=""
                  className="min-w-0 flex-1 object-cover"
                />
                <img
                  src="/landing/collage-tr.jpg?v=2408b"
                  alt=""
                  className="min-w-0 flex-1 object-cover"
                />
              </div>
              <img
                src="/landing/collage-wide.jpg?v=2408b"
                alt=""
                className="h-[calc(50%-2.5px)] w-full object-cover"
              />
            </div>
            <img
              src="/landing/collage-right.jpg?v=2408b"
              alt=""
              className="w-[20.8%] object-cover"
            />
          </div>
          <div className="hidden h-[454px] gap-5 overflow-hidden rounded-xl lg:flex">
            <img
              src="/landing/collage-left.jpg?v=2408b"
              alt=""
              className="hidden w-[300px] object-cover lg:block"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-5">
              <div className="flex min-h-0 flex-1 gap-5">
                <img
                  src="/landing/collage-tl.jpg?v=2408b"
                  alt=""
                  className="min-w-0 flex-1 object-cover"
                />
                <img
                  src="/landing/collage-tr.jpg?v=2408b"
                  alt=""
                  className="min-w-0 flex-1 object-cover"
                />
              </div>
              <img
                src="/landing/collage-wide.jpg?v=2408b"
                alt=""
                className="h-[217px] w-full object-cover"
              />
            </div>
            <img
              src="/landing/collage-right.jpg?v=2408b"
              alt=""
              className="hidden w-[300px] object-cover lg:block"
            />
          </div>
        </section>

        {/* node 2346:21412 — Intro, pad 32/120, gap 16.
            Title 40/590 leading 48 (h48 = 48/40), subtitle 20/30 w884. */}
        <section className="flex flex-col items-center gap-4 px-6 py-8 text-center md:px-[120px] md:py-[32px] md:gap-[16px]">
          <h1 className="w-full text-[40px] font-[weight:590] leading-[48px] text-ink">
            {t("landing.introTitle")}
          </h1>
          <p className="max-w-[884px] text-[20px] font-normal leading-[30px] text-ink">
            {t("landing.introSubtitle")}
          </p>
        </section>
      </div>

      {/* Trending Workshop (node 2346:21450): pad 32/80, gap 32. Cards
          #2346:21455: space-between row of 3× 400×299 "similar"-variant
          cards (0/440/880 in the 1280 content → 40px gaps). Arrows
          #2346:21503: bare 35×35 icon buttons (no chrome), right-aligned,
          gap 10, 32px below cards; left icon #B0B0B0, right icon #222222.
          Star + "4.91" on the strip is a D2 design-copy placeholder
          (no public rating API field — ProgramCard renders it). */}
      {workshops.length > 0 ? (
        <section className="flex flex-col gap-8 px-6 py-8 md:px-[80px] md:py-[32px] md:gap-[32px]">
          {/* node 2346:21451 — header: space-between, ca=max, gap 10.
              Title 28/590 #000; "See more" 14/400 #5E5E5E (node 21453). */}
          <div className="flex items-end justify-between gap-[10px]">
            <h2 className="text-[28px] font-[weight:590] text-ink">
              {t("landing.trendingWorkshop")}
            </h2>
            <Link
              href="/workshops"
              aria-label={t("landing.seeAllWorkshops")}
              className="text-[14px] font-normal text-[#5E5E5E] underline underline-offset-4"
            >
              {t("landing.seeMore")}
            </Link>
          </div>
          <div className="flex flex-col gap-8 md:gap-[32px]">
            <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3 xl:gap-10">
              {workshops.slice(0, 3).map((c) => (
                <li key={c.id} className="w-full">
                  <ProgramCard
                    course={c}
                    variant="similar"
                    price={prices?.[c.id]}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* node 3963:36089 — ZPassport card section (2408 redesign).
          Section pad-x 50 → card 1340 wide (1440−2×50). Card (node
          2346:21416): r30, #FFFFFF; capture had no shadow, but the LIVE
          frame (MCP re-diff 2026-08-25) adds 0 4px 25px rgba(0,0,0,0.25).
          Inner (node 3963:36088) pad-x 60 → content 1220. Row (node
          2346:21417): pad-y 50, gap 40, h 565 fixed, centered both axes. */}
      <section className="px-6 py-8 md:p-0 md:px-[50px]" aria-label="ZPassport">
        <div className="rounded-[30px] bg-white px-6 shadow-[0_4px_25px_rgba(0,0,0,0.25)] md:px-[60px]">
          <div className="flex flex-col gap-10 py-[50px] md:h-[565px] md:flex-row md:items-center md:gap-[40px]">
            {/* node 2346:21420 — text column: grow (555 @1440), gap 32 */}
            <div className="flex min-w-0 flex-1 flex-col gap-[32px]">
              {/* node 2346:21421 — 16/590 #222 */}
              <p className="text-[16px] font-[weight:590] text-ink">
                {t("landing.introducing")}
              </p>
              {/* node 2346:21422 — wordmark row: gap 5.78, icon 23.07×30.29
                  + wordmark 226.25×46.93 (existing SVGs, exact height,
                  proportional width — asset ratio differs ~3% from the
                  design's non-uniform stretch, declared delta). */}
              <div className="flex items-center gap-[5.78px]">
                <img
                  src="/landing/zpassport-icon.svg"
                  alt=""
                  aria-hidden
                  className="h-[24px] w-auto md:h-[30.29px]"
                />
                <img
                  src="/landing/zpassport-wordmark.svg"
                  alt="ZPassport"
                  className="h-[37px] w-auto md:h-[46.93px]"
                />
              </div>
              {/* node 2346:21429 — body 18/27, 9 lines (243 = 9×27). The
                  mini wordmark (node 3961:36080, icon 9.77×12.83 +
                  wordmark 95.79×19.87, gap 2.45) sits inline on line 3
                  where the design's leading spaces are. */}
              <p className="whitespace-pre-line text-[18px] leading-[27px] text-ink">
                {t("landing.zpassportCardLead") + "\n\n"}
                <span className="inline-flex translate-y-[3px] items-center gap-[2.45px]">
                  <img
                    src="/landing/zpassport-icon.svg"
                    alt=""
                    aria-hidden
                    className="h-[12.83px] w-auto"
                  />
                  <img
                    src="/landing/zpassport-wordmark.svg"
                    alt="ZPassport"
                    className="h-[19.87px] w-auto"
                  />
                </span>
                {" " + t("landing.zpassportCardBody") + "\n\n"}
                {t("landing.zpassportCardTail")}
              </p>
            </div>

            {/* node 3963:36134 — visual column: 625 fixed, gap 10 */}
            <div className="flex w-full flex-col gap-[10px] md:w-[625px] md:shrink-0">
              {/* nodes 3963:36123/37 — photo collage 625×288.33, absolute
                    rects. Nodes 3963:36126 ("21 2") & 3963:36130 ("4 69") carry
                    flip=H in the capture (relativeTransform [[-1,0,tx],…] ⇒
                    rendered left = tx − w), but per user 2026-08-26 those two
                    photos must NOT be mirrored — the scaleX(-1) is deliberately
                    omitted, keeping each at its tx − w position. Rects are % of
                    the 625×288.33 frame with
                    the container aspect locked: the collage scales fluidly
                    at any width — at md (625px) % resolves to the exact
                    capture px, and below md every photo stays fully inside
                    the frame (was: px coords clipped the right side at 375;
                    user pick A, 2026-08-25). */}
              <div className="relative aspect-[625/288.33] w-full overflow-hidden md:w-[625px]">
                <img
                  src="/landing/zpassport-card-1.png"
                  alt=""
                  aria-hidden
                  className="absolute left-[81.838%] top-[52.141%] h-[41.15%] w-[18.162%] object-cover"
                />
                <img
                  src="/landing/zpassport-card-2.png"
                  alt=""
                  aria-hidden
                  className="absolute left-[17.646%] top-[34.817%] h-[58.417%] w-[24.667%] object-cover"
                />
                <img
                  src="/landing/zpassport-card-3.png"
                  alt=""
                  aria-hidden
                  className="absolute left-[59.55%] top-[59.459%] h-[31.379%] w-[21.877%] object-cover"
                />
                <img
                  src="/landing/zpassport-card-4.png"
                  alt=""
                  aria-hidden
                  className="absolute left-0 top-[43.839%] h-[48.279%] w-[19.365%] object-cover"
                />
                <img
                  src="/landing/zpassport-card-5.png"
                  alt=""
                  aria-hidden
                  className="absolute left-[26.437%] top-0 h-[29.08%] w-[13.946%] object-cover"
                />
                <img
                  src="/landing/zpassport-card-6.png"
                  alt=""
                  aria-hidden
                  className="absolute left-[38.07%] top-[42.269%] h-[57.731%] w-[26.702%] object-cover"
                />
                <img
                  src="/landing/zpassport-card-7.png"
                  alt=""
                  aria-hidden
                  className="absolute left-[62.578%] top-[11.317%] h-[52.436%] w-[21.678%] object-cover"
                />
              </div>
              {/* node 3963:36135 — tagline: Outfit 700, 25/38, #0ABAB5,
                  w625 (2 lines, 76 = 2×38). */}
              <p
                className={`${outfit.className} text-[25px] font-bold leading-[38px] text-[#0ABAB5]`}
              >
                {t("landing.zpassportCardTagline")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* New Programs (node 2346:21507): same structure as Trending
          (pad 32/80, gap 32; cards #2346:21512 3× 400×299 similar variant
          at 0/440/880; arrows #2346:21560 right-aligned bare 35×35). */}
      {programs.length > 0 ? (
        <section className="flex flex-col gap-8 px-6 py-8 md:px-[80px] md:py-[32px] md:gap-[32px]">
          <div className="flex items-end justify-between gap-[10px]">
            <h2 className="text-[28px] font-[weight:590] text-ink">
              {t("landing.newPrograms")}
            </h2>
            <Link
              href="/programs"
              aria-label={t("landing.seeAllPrograms")}
              className="text-[14px] font-normal text-[#5E5E5E] underline underline-offset-4"
            >
              {t("landing.seeMore")}
            </Link>
          </div>
          <div className="flex flex-col gap-8 md:gap-[32px]">
            <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3 xl:gap-10">
              {programs.slice(0, 3).map((c) => (
                <li key={c.id} className="w-full">
                  <ProgramCard
                    course={c}
                    variant="similar"
                    price={prices?.[c.id]}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <div className="h-20" />
      <Footer />
    </main>
  );
}
