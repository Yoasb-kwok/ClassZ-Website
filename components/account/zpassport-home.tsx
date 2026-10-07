"use client";

import Link from "next/link";

/**
 * Rendered inside app/account/layout.tsx → AccountLayoutSwitch →
 * StudentAccountGate (sidebar + navbar + footer come from the layout —
 * do NOT wrap the gate here; double-wrapping duplicates the shell).
 *
 * ZPassport Home — capture 3969:36185 (0710 `ZPassport-_(home)`,
 * 1440×3460.55, capturedAt 2026-10-07). The capture's sidebar (child
 * switcher + Home/Learning companion/Academic/Activity/Work Samples/
 * Moments) is the existing StudentSidebar.
 *
 * Main column (node 3969:36282 — w1033, pad 32/80/32/48 → content 905,
 * 32px gaps between sections, #EBEBEB dividers):
 *   1. hero image 905×342 r12 (3972:36416, asset hero.png)
 *   2. intro block gap 20: title 30/590 + 14/400 #5E5E5E + 14/700 #5E5E5E
 *   3. journey row gap 30 (3973:36486): text col (fill) + image 453.5×567
 *      r12 (3973:36489, journey.png); links 20/590 #0ABAB5
 *   4. companion row gap 30 (3973:36491): animals collage 542.63×250.33
 *      (group 3973:36511, 7 absolutely-positioned assets) + teal note
 *      21.71/700 #0ABAB5 lh33; right col 332.37 gap 20
 *   5. know-what row gap 30 (3973:36538): text col + image 453.5×525 r12
 *      (3973:36554, knowwhat.png)
 *   6. understand-progress intro (3973:36588 — pad 32/0/32/0, gap 20,
 *      centred): 30/590 + 20/590 + 18/400 lh27 (w884)
 *   7. closing (3973:36604 — page-level, pad 0/80, gap 20, centred):
 *      40/590 #222 + 18/400 lh27
 *
 * Links (wiring per sidebar routes): Academic dashboard →
 * /account/academic · Activity dashboard → /account/activity ·
 * Learning companion → /account.
 */

const IMG = "/images/zpassport-home";

export function ZPassportHome() {
  return (
    <>
      <div className="flex flex-col gap-[32px] pt-[32px] pb-[32px] lg:pl-[48px] lg:pr-[80px]">
        {/* node 3972:36416 — hero 905×342 r12 IMAGE */}
        <div
          className="h-[342px] w-full rounded-[12px] bg-classz-50 bg-cover bg-center"
          style={{ backgroundImage: `url(${IMG}/hero.png)` }}
          role="img"
          aria-label="A parent hugging their child"
        />

        {/* node 3973:36458 — intro block, gap 20 */}
        <div className="flex flex-col gap-[20px]">
          <h1 className="text-[30px] font-[weight:590] leading-[36px] text-black">
            Understand how your child learns
          </h1>
          <p className="text-[14px] font-normal leading-[21px] text-[#5E5E5E]">
            ZPassport brings their learning records together, so you can see
            progress, patterns and what support may help.
          </p>
          <p className="text-[14px] font-[weight:700] leading-[21px] text-[#5E5E5E]">
            Unlock deeper insights after 3 records — automatically analyzed and
            updated with every new lesson.
          </p>
        </div>

        <div className="h-px w-full bg-[#EBEBEB]" />

        {/* node 3973:36486 — journey row, gap 30, items centred */}
        <div className="flex flex-col items-center gap-[30px] lg:flex-row">
          <div className="flex min-w-0 flex-1 flex-col gap-[20px]">
            <h2 className="text-[30px] font-[weight:590] leading-[36px] text-black">
              See the journey at 3 levels
            </h2>
            <p className="text-[20px] font-[weight:590] leading-[24px] text-black">
              Academic dashboard • Activity dashboard
            </p>

            <div className="flex flex-col gap-[20px]">
              <h3 className="text-[26px] font-[weight:590] leading-[31px] text-black">
                One lesson
              </h3>
              <p className="text-[14px] font-[weight:700] leading-[21px] text-[#5E5E5E]">
                What happened today?
              </p>
              <p className="text-[14px] font-normal leading-[21px] text-[#5E5E5E]">
                See their focus, progress and what was observed.
              </p>
            </div>

            <div className="flex flex-col gap-[20px]">
              <h3 className="text-[26px] font-[weight:590] leading-[31px] text-black">
                One programme
              </h3>
              <p className="text-[14px] font-[weight:700] leading-[21px] text-[#5E5E5E]">
                What keeps happening?
              </p>
              <p className="text-[14px] font-normal leading-[21px] text-[#5E5E5E]">
                See repeated strengths, support needs and what seems to help.
              </p>
            </div>

            <div className="flex flex-col gap-[20px]">
              <h3 className="text-[26px] font-[weight:590] leading-[31px] text-black">
                Across their learning
              </h3>
              <p className="text-[14px] font-[weight:700] leading-[21px] text-[#5E5E5E]">
                What&rsquo;s the bigger picture?
              </p>
              <p className="text-[14px] font-normal leading-[21px] text-[#5E5E5E]">
                Compare and see patterns across different classes and
                activities.
              </p>
            </div>

            {/* node 3973:36628 — links, pad-top 14, gap 10 */}
            <div className="flex flex-col gap-[10px] pt-[14px]">
              <Link
                href="/account/academic"
                className="text-[20px] font-[weight:590] leading-[24px] text-[#0ABAB5] hover:underline"
              >
                Academic dashboard →
              </Link>
              <Link
                href="/account/activity"
                className="text-[20px] font-[weight:590] leading-[24px] text-[#0ABAB5] hover:underline"
              >
                Activity dashboard →
              </Link>
            </div>
          </div>

          {/* node 3973:36489 — image 453.5×567 r12 */}
          <div
            className="h-[567px] w-full shrink-0 rounded-[12px] bg-cover bg-center lg:w-[453.5px]"
            style={{ backgroundImage: `url(${IMG}/journey.png)` }}
            role="img"
            aria-label="A child exploring with a VR headset"
          />
        </div>

        <div className="h-px w-full bg-[#EBEBEB]" />

        {/* node 3973:36491 — companion row, gap 30, items centred */}
        <div className="flex flex-col items-center gap-[30px] lg:flex-row">
          {/* left: animals collage — FIXED capture size 542.63×250.33 with
              exact px placement (group 3973:36511); percentages distorted
              the collage whenever the column width changed. shrink-0 so
              the collage never reflows; the teal note sits below. */}
          <div className="flex w-full shrink-0 flex-col justify-between gap-[32px] lg:w-[542.63px] lg:self-stretch">
            {/* node 3973:36511 — 7 animal assets at capture px coords
                (node id → asset file; positions/sizes exact from nodes.json).
                Fixed 542.63×250.33 — below lg the collage scrolls horizontally
                instead of distorting. */}
            <div className="w-full max-w-full overflow-x-auto pb-[8px] lg:overflow-visible lg:pb-0">
              <div
                className="relative h-[250.33px] w-[542.63px] shrink-0"
                role="img"
                aria-label="ClassZ learning companion animals"
              >
                {[
                  {
                    src: "011-3973_36516.png",
                    x: 143.46,
                    y: 0,
                    w: 75.68,
                    h: 72.8,
                    alt: "Bee",
                  },
                  {
                    src: "010-3973_36515.png",
                    x: 0,
                    y: 109.75,
                    w: 105.08,
                    h: 120.86,
                    alt: "Fox",
                  },
                  {
                    src: "008-3973_36513.png",
                    x: 95.76,
                    y: 87.15,
                    w: 133.86,
                    h: 146.24,
                    alt: "Dolphin",
                  },
                  {
                    src: "012-3973_36517.png",
                    x: 206.58,
                    y: 105.8,
                    w: 144.89,
                    h: 144.53,
                    alt: "Z-sir",
                  },
                  {
                    src: "013-3973_36518.png",
                    x: 457.63,
                    y: 28.33,
                    w: 117.63,
                    h: 131.27,
                    alt: "Rabbit",
                  },
                  {
                    src: "009-3973_36514.png",
                    // Swapped with the turtle (user request)
                    x: 345,
                    y: 124.38,
                    w: 118.71,
                    h: 78.54,
                    alt: "Owl",
                  },
                  {
                    src: "007-3973_36512.png",
                    x: 441.85,
                    y: 148.84,
                    w: 98.55,
                    h: 103.01,
                    alt: "Turtle",
                  },
                ].map((a) => (
                  <img
                    key={a.src}
                    src={`${IMG}/${a.src}`}
                    alt={a.alt}
                    className="absolute"
                    style={{ left: a.x, top: a.y, width: a.w, height: a.h }}
                  />
                ))}
              </div>
            </div>
            <p className="text-[21.71px] font-[weight:700] leading-[33px] text-[#0ABAB5]">
              Unlock deeper insights after 3 records, automatically analyzed and
              updated with every new lesson.
            </p>
          </div>

          {/* node 3973:36492 — right col 332.37, gap 20 */}
          <div className="flex min-w-0 flex-1 flex-col gap-[20px]">
            <h2 className="text-[30px] font-[weight:590] leading-[36px] text-black">
              Meet their Learning Companion
            </h2>
            <p className="text-[14px] font-normal leading-[21px] text-[#5E5E5E]">
              A simple way to understand how your child tends to approach
              learning.
            </p>
            <Link
              href="/account"
              className="pt-[14px] text-[20px] font-[weight:590] leading-[24px] text-[#0ABAB5] hover:underline"
            >
              Learning companion →
            </Link>
          </div>
        </div>

        <div className="h-px w-full bg-[#EBEBEB]" />

        {/* node 3973:36538 — know-what row, gap 30, items centred */}
        <div className="flex flex-col items-center gap-[30px] lg:flex-row">
          <div className="flex min-w-0 flex-1 flex-col gap-[20px]">
            <h2 className="text-[30px] font-[weight:590] leading-[36px] text-black">
              Know what to look for
            </h2>

            <div className="flex flex-col gap-[20px]">
              <h3 className="text-[26px] font-[weight:590] leading-[31px] text-black">
                Strengths
              </h3>
              <p className="text-[14px] font-normal leading-[21px] text-[#5E5E5E]">
                What your child repeatedly does well.
              </p>
            </div>

            <div className="flex flex-col gap-[20px]">
              <h3 className="text-[26px] font-[weight:590] leading-[31px] text-black">
                Support Needs
              </h3>
              <p className="text-[14px] font-normal leading-[21px] text-[#5E5E5E]">
                Where they may benefit from more guidance.
              </p>
            </div>

            <div className="flex flex-col gap-[20px]">
              <h3 className="text-[26px] font-[weight:590] leading-[31px] text-black">
                What Helps
              </h3>
              <p className="text-[14px] font-normal leading-[21px] text-[#5E5E5E]">
                Approaches that seem to help them move forward.
              </p>
            </div>
          </div>

          {/* node 3973:36554 — image 453.5×525 r12 */}
          <div
            className="h-[525px] w-full shrink-0 rounded-[12px] bg-cover bg-center lg:w-[453.5px]"
            style={{ backgroundImage: `url(${IMG}/knowwhat.png)` }}
            role="img"
            aria-label="Children playing on a bed"
          />
        </div>

        <div className="h-px w-full bg-[#EBEBEB]" />

        {/* node 3973:36588 — understand progress, pad 32/0/32/0, gap 20,
            items horizontally centred */}
        <div className="flex flex-col items-center gap-[20px] px-0 py-[32px] text-center">
          <h2 className="text-[30px] font-[weight:590] leading-[36px] text-[#222222]">
            Understand progress
          </h2>
          <p className="text-[20px] font-[weight:590] leading-[24px] text-black">
            Supported → Guided → Developing → Independent
          </p>
          <p className="max-w-[884px] text-[18px] font-normal leading-[27px] text-[#222222]">
            Support changes as they grow. It shows how much help they currently
            need.
          </p>
        </div>
      </div>

      {/* node 3973:36604 — closing, page-level, gap 20, centred */}
      <div className="flex flex-col items-center gap-[20px] px-6 pb-[96px] text-center lg:px-[80px]">
        <p className="text-[40px] font-[weight:590] leading-[48px] text-[#222222]">
          Every lesson adds another piece to the picture.
        </p>
        <p className="max-w-[884px] text-[18px] font-normal leading-[27px] text-[#222222]">
          Record the journey. Understand the learner. Support the next step.
        </p>
      </div>
    </>
  );
}
