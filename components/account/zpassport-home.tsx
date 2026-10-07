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
          {/* left: animals collage (group 3973:36511, 542.63×250.33) +
              teal note 21.71/700 lh33, gap 32-ish to fill 525 height */}
          <div className="flex w-full shrink-0 flex-col justify-between gap-[32px] lg:w-[542.63px] lg:self-stretch">
            {/* node 3973:36511 — 7 absolutely-positioned animal assets */}
            <div
              className="relative h-[250.33px] w-full"
              role="img"
              aria-label="ClassZ learning companion animals"
            >
              <img
                src={`${IMG}/011-3973_36516.png`}
                alt=""
                className="absolute"
                style={{
                  left: "26.46%",
                  top: 0,
                  width: "13.94%",
                  height: "29.08%",
                }}
              />
              <img
                src={`${IMG}/010-3973_36515.png`}
                alt=""
                className="absolute"
                style={{
                  left: 0,
                  top: "43.84%",
                  width: "19.36%",
                  height: "48.28%",
                }}
              />
              <img
                src={`${IMG}/008-3973_36513.png`}
                alt=""
                className="absolute"
                style={{
                  left: "17.65%",
                  top: "34.81%",
                  width: "24.67%",
                  height: "58.43%",
                }}
              />
              <img
                src={`${IMG}/012-3973_36517.png`}
                alt=""
                className="absolute"
                style={{
                  left: "38.07%",
                  top: "42.25%",
                  width: "26.71%",
                  height: "57.74%",
                }}
              />
              <img
                src={`${IMG}/007-3973_36512.png`}
                alt=""
                className="absolute"
                style={{
                  left: "81.83%",
                  top: "52.15%",
                  width: "18.16%",
                  height: "41.15%",
                }}
              />
              <img
                src={`${IMG}/013-3973_36518.png`}
                alt=""
                className="absolute"
                style={{
                  left: "84.32%",
                  top: "11.31%",
                  width: "21.67%",
                  height: "52.45%",
                }}
              />
              <img
                src={`${IMG}/009-3973_36514.png`}
                alt=""
                className="absolute"
                style={{
                  left: "81.4%",
                  top: "59.45%",
                  width: "21.87%",
                  height: "31.37%",
                }}
              />
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
