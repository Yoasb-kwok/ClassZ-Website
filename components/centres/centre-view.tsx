"use client";

import Link from "next/link";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Maximize2,
  Medal,
  MessageCircle,
  NotebookPen,
  Share2,
  Star,
  Users,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { formatTemplate } from "@/components/programs/format";
import { ProgramCard } from "@/components/programs/program-card";
import { CentreCard } from "@/components/centres/centre-card";
import type { Centre, CentreFeatureKey } from "@/lib/centre-data";
import type { PublicCourse } from "@/lib/public-courses";

/** Feature icon/label order per #2507:19246 (note-2, profile-2user,
 *  medal-star, ranking — vuesax linear, stroke #1B1A1F/1.16, 40px box). */
const FEATURE_ICONS: Record<CentreFeatureKey, typeof NotebookPen> = {
  sen: NotebookPen,
  smallClass: Users,
  examPathway: Medal,
  performance: BarChart3,
};

/** Section divider — #2511:19377 &c.: 1px #EBEBEB; sections sit 32px apart
 *  (divider wrapper h32, line centered — matches capture arithmetic
 *  224+32+1+31 = 288 etc.). */
function Divider() {
  return (
    <div aria-hidden className="flex h-[32px] items-center">
      <div className="h-px w-full bg-[#EBEBEB]" />
    </div>
  );
}

/** Strip pagination — #2839:19259 &c.: 2×35 r100 #EBEBEB, gap 10,
 *  right-aligned chrome (no paging data; mirrors program-detail). */
function PaginationArrows() {
  return (
    <div aria-hidden className="hidden justify-end gap-[10px] lg:flex">
      <span className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-[#EBEBEB]">
        <ChevronLeft
          className="h-[16px] w-[16px] text-[#5E5E5E]"
          strokeWidth={1.6}
        />
      </span>
      <span className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-[#EBEBEB]">
        <ChevronRight
          className="h-[16px] w-[16px] text-[#5E5E5E]"
          strokeWidth={1.6}
        />
      </span>
    </div>
  );
}

/**
 * Centre view from Figma #2471:14635 (capture: Centre_View.figmacapture,
 * W6 2026-08-24). Root w1440 h4958.37 ver gap 32: navbar 64 → content
 * #2471:15170 (pad 32 top, gap 64, h4356.82) → hidden "Option 2"
 * #2471:14663 (not built) → 80px spacer → footer. Content = gallery banner
 * (454) + info column #2471:15183 (1531.82, pad 0/120, gap 32) + strips
 * block #3757:21579 (2211, gap 32).
 *
 * All centre content is placeholder (D2 — no centre API): mock reviews,
 * rating "4.91", staff photos and map come from the capture assets.
 */
export function CentreView({
  centre,
  offering,
  recommended,
  suggested,
}: {
  centre: Centre;
  offering: PublicCourse[];
  recommended: PublicCourse[];
  suggested: Centre[];
}) {
  const { t } = useLanguage();

  const offeringRows: PublicCourse[][] = [];
  for (let i = 0; i < offering.length; i += 3) {
    offeringRows.push(offering.slice(i, i + 3));
  }

  return (
    <main className="min-h-screen bg-white text-ink">
      <Navbar />

      {/* Root is w1440 fixed — cap + center on wider viewports (same as
          program detail / listing). */}
      <div className="lg:mx-auto lg:max-w-[1440px]">
        {/* node 2471:15171 — gallery banner: pad 0/80 (px), content gap 64
            to the info column */}
        <div className="px-6 pt-[32px] md:px-[80px]">
          {/* node 2471:15496 — 1280×454 r12, IMAGE fill; chrome inset 16
              (content 1248×422, rows 35/35/6 space-between ⇒ gaps 173) */}
          <div
            className="relative h-[280px] w-full overflow-hidden rounded-[12px] bg-classz-50 lg:h-[454px]"
            data-testid="centre-banner"
          >
            <img
              src={centre.banner}
              alt={centre.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-[16px] flex flex-col justify-between"
            >
              {/* node 2471:15505 — action row INSIDE the gallery this time
                  (unlike the detail pages): 3×35 r100 white/80 #EBEBEB 1px
                  stroke, icons 16 #5E5E5E, gap 10, right-aligned (pa=max) */}
              <div className="flex justify-end gap-[10px]">
                {[Share2, MessageCircle, Heart].map((Icon, i) => (
                  <span
                    key={i}
                    className="flex h-[35px] w-[35px] items-center justify-center rounded-full border border-[#EBEBEB] bg-white/80"
                  >
                    <Icon
                      className="h-[16px] w-[16px] text-[#5E5E5E]"
                      strokeWidth={1.6}
                    />
                  </span>
                ))}
              </div>

              {/* node 2518:29403 — arrows: 35×35 r100 #EBEBEB 60%,
                  justify-between (right = flipped arrow-left) */}
              <div className="flex items-center justify-between">
                <span className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-[#EBEBEB]/60">
                  <ChevronLeft
                    className="h-[16px] w-[16px] text-[#5E5E5E]"
                    strokeWidth={1.6}
                  />
                </span>
                <span className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-[#EBEBEB]/60">
                  <ChevronRight
                    className="h-[16px] w-[16px] text-[#5E5E5E]"
                    strokeWidth={1.6}
                  />
                </span>
              </div>

              {/* node 2471:15524 — dots: 4×6 (gap 5) + 1×4, centered;
                  active #FFFFFF, rest #DDDDDD */}
              <div className="flex items-center justify-center gap-[5px]">
                <span className="h-[6px] w-[6px] rounded-full bg-white" />
                <span className="h-[6px] w-[6px] rounded-full bg-[#DDDDDD]" />
                <span className="h-[6px] w-[6px] rounded-full bg-[#DDDDDD]" />
                <span className="h-[6px] w-[6px] rounded-full bg-[#DDDDDD]" />
                <span className="ml-[1px] h-[4px] w-[4px] rounded-full bg-[#DDDDDD]" />
              </div>
            </div>
          </div>
        </div>

        {/* node 2471:15183 — info column: pad 0/120, ver gap 32, h1531.82 */}
        <div className="mt-[64px] flex flex-col px-6 md:px-[120px]">
          {/* node 2471:15185 — header, gap 16 (100+16+17+16+17+16+42 = 224 ✓) */}
          <div className="flex flex-col gap-[16px]">
            {/* node 2471:15186 — row h100 gap 20: avatar 100 r100 (r750 in
                the file — fully round) + name 24/590 #222 centered */}
            <div className="flex items-center gap-[20px]">
              <img
                src={centre.avatar}
                alt=""
                aria-hidden
                className="h-[100px] w-[100px] shrink-0 rounded-full object-cover"
              />
              <h1 className="text-[24px] font-[weight:590] leading-[29px] text-ink">
                {centre.name}
              </h1>
            </div>

            {/* node 2471:15567 — meta 1 (gap 8): star 16 #222 + "4.91"
                14/400 (gap 4) · "-" · "50 reviews" 14/400 #222 */}
            <p className="flex items-center gap-[8px]">
              <span className="flex items-center gap-[4px]">
                <Star
                  aria-hidden
                  className="h-[16px] w-[16px] text-[#222222]"
                  fill="#222222"
                  strokeWidth={0}
                />
                <span className="text-[14px] font-normal leading-[17px] text-[#222222]">
                  {centre.rating}
                </span>
              </span>
              <span className="text-[14px] font-normal leading-[17px] text-[#222222]">
                -
              </span>
              <span className="text-[14px] font-normal leading-[17px] text-[#222222]">
                {formatTemplate(t, "centres.reviewCount", {
                  count: centre.reviewCount,
                })}
              </span>
            </p>

            {/* node 2471:15574 — meta 2 (icon→text gap 4): location 16 #222
                + address 14/590 #222 */}
            <p className="flex items-center gap-[4px]">
              <MapPin
                aria-hidden
                className="h-[16px] w-[16px] shrink-0 text-[#222222]"
                strokeWidth={1.16}
              />
              <span className="text-[14px] font-[weight:590] leading-[17px] text-[#222222]">
                {centre.address}
              </span>
            </p>

            {/* node 2471:15195 — welcome 14/400 lh21 #5E5E5E (2 lines) */}
            <p className="text-[14px] font-normal leading-[21px] text-[#5E5E5E]">
              {centre.welcome}
            </p>
          </div>

          <Divider />

          {/* node 2507:19224 — members: gap 16; cards 168 wide gap 16:
              photo 168×159 r12, gap 15, name 14/590, gap 4, role 14/400
              (159+15+17+4+17 = 212 ✓) */}
          <section
            aria-label={t("centres.members")}
            className="flex flex-col gap-[16px]"
          >
            <h2 className="text-[16px] font-[weight:590] leading-[19px] text-black">
              {t("centres.members")}
            </h2>
            <div className="flex gap-[16px]">
              {centre.staff.map((member) => (
                <div key={member.name} className="w-[168px] shrink-0">
                  <div className="h-[159px] w-full overflow-hidden rounded-[12px] bg-classz-50">
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="mt-[15px] text-[14px] font-[weight:590] leading-[17px] text-ink">
                    {member.name}
                  </p>
                  <p className="mt-[4px] text-[14px] font-normal leading-[17px] text-[#5E5E5E]">
                    {member.role}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <Divider />

          {/* node 2507:19246 — features: pad 32/0, 2 cols gap 48 (576 each),
              rows gap 64 (40+64+40 = 144 ✓); row: icon 40 + gap 20 + text
              (title 14/700 h17, gap 5, desc 14/400 lh16 #5E5E5E) */}
          <div className="flex gap-[48px] py-[32px] max-md:flex-col max-md:gap-[32px]">
            {[0, 1].map((col) => (
              <div
                key={col}
                className="flex flex-1 flex-col gap-[64px] max-md:gap-[32px]"
              >
                {centre.features
                  .slice(col * 2, col * 2 + 2)
                  .map((key: CentreFeatureKey) => {
                    const Icon = FEATURE_ICONS[key];
                    return (
                      <div key={key} className="flex items-center gap-[20px]">
                        <Icon
                          aria-hidden
                          className="h-[40px] w-[40px] shrink-0 text-[#1B1A1F]"
                          strokeWidth={1.16}
                        />
                        <div className="flex min-w-0 flex-col gap-[5px]">
                          <h3 className="text-[14px] font-bold leading-[17px] text-black">
                            {t(`programs.serviceTags.${key}`)}
                          </h3>
                          <p className="text-[14px] font-normal leading-[16px] text-[#5E5E5E]">
                            {t(`centres.featureDesc.${key}`)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>

          <Divider />

          {/* node 2507:19502 — reviews (gap 16): header h19 (title 16/590 +
                "See more" 12/400 #5E5E5E, centered); body pad 0/16, 3 cards
                w357.33 gap 48 (3×357.33+2×48 = 1168 ✓) */}
          <section
            aria-label={t("centres.reviews")}
            className="flex flex-col gap-[16px]"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-[weight:590] leading-[19px] text-black">
                {t("centres.reviews")}
              </h2>
              <span className="text-[12px] font-normal leading-[14px] text-[#5E5E5E]">
                {t("programs.seeMore")}
              </span>
            </div>
            <div className="px-[16px]">
              <ul
                className="flex gap-[48px] overflow-x-auto"
                data-testid="centre-reviews"
              >
                {centre.reviews.map((review, i) => (
                  <li
                    key={i}
                    className="w-[357.33px] shrink-0 rounded-[12px] bg-white p-[16px]"
                  >
                    {/* node 2518:29857 — card content, ver gap 16
                        (54.82+16+84 = 154.82 ✓) */}
                    <div className="flex flex-col gap-[16px]">
                      {/* node 2518:29858 — header h54.82, space-between:
                          left col (avatar row h24 gap 4, gap 12, stars row
                          h18.82) vs date 10/400 #5E5E5E top-right */}
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-[12px]">
                          <div className="flex items-center gap-[4px]">
                            <img
                              src={review.avatar}
                              alt=""
                              aria-hidden
                              className="h-[24px] w-[24px] shrink-0 rounded-full object-cover"
                            />
                            <span className="text-[12px] font-[weight:510] leading-[19.24px] text-[#5E5E5E]">
                              {review.name}
                            </span>
                          </div>
                          {/* node 2518:29892 — 5 stars 18.82 #222 gap 4.71 +
                              rating 14/400 #222 (same gap) */}
                          <div className="flex items-center gap-[4.71px]">
                            {Array.from({ length: review.stars }).map(
                              (_, s) => (
                                <Star
                                  key={s}
                                  aria-hidden
                                  className="h-[18.82px] w-[18.82px] text-[#222222]"
                                  fill="#222222"
                                  strokeWidth={0}
                                />
                              ),
                            )}
                            <span className="text-[14px] font-normal leading-[17px] text-[#222222]">
                              {review.rating}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-normal leading-[12px] text-[#5E5E5E]">
                          {review.date}
                        </span>
                      </div>

                      {/* node 2518:29872 — body 14/400 lh21 #5E5E5E (4 lines) */}
                      <p className="text-[14px] font-normal leading-[21px] text-[#5E5E5E]">
                        {review.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <Divider />

          {/* node 2507:19342 — location (gap 16): title 16/590 + map
              1168×340 r12 (pad 0/16 sides); frame has NO fill — transparent.
              Pin group #2507:19446 (43.83×55 black, white 16.81 dot) at
              655,56.18 rel. to the map (56.08%/16.52%); expand btn
              #2507:19452 22.55 r4 #FAFAFA 80%, maximize 18.55, inset
              right 10.45 / bottom 48.27. */}
          <section
            aria-label={t("centres.location")}
            className="flex flex-col gap-[16px]"
          >
            <h2 className="text-[16px] font-[weight:590] leading-[19px] text-black">
              {t("centres.location")}
            </h2>
            <div className="relative h-[220px] w-full overflow-hidden rounded-[12px] bg-classz-50 lg:h-[340px]">
              <img
                src={centre.map}
                alt={centre.address}
                className="absolute inset-0 h-full w-full object-cover"
              />
              {/* Hand-drawn approximation of the capture pin (vector paths
                  not exported) — black teardrop + white 16.81 dot */}
              <svg
                aria-hidden
                viewBox="0 0 43.83 55"
                className="absolute left-[56.08%] top-[16.52%] h-[55px] w-[43.83px] max-lg:hidden"
              >
                <path
                  d="M21.92 0C9.83 0 0 9.83 0 21.92 0 37.5 21.92 55 21.92 55S43.83 37.5 43.83 21.92C43.83 9.83 34 0 21.92 0z"
                  fill="#000000"
                />
                <circle cx="21.92" cy="21.92" r="8.4" fill="#FFFFFF" />
              </svg>
              <span
                aria-hidden
                className="absolute bottom-[14.2%] right-[0.89%] flex h-[22.55px] w-[22.55px] items-center justify-center rounded-[4px] bg-[#FAFAFA]/80 p-[2px]"
              >
                <Maximize2
                  className="h-[18.55px] w-[18.55px] text-[#222222]"
                  strokeWidth={1.5}
                />
              </span>
            </div>
          </section>
        </div>

        {/* node 3757:21579 — strips block: gap 64 from the info column,
            gap 32 between strips (1157+32+495+32+495 = 2211 ✓). Each strip
            pads 32/80, gap 32: header h33 (28/590 + "See more" 14/400
            #5E5E5E, bottom-aligned) → cards → pagination h35 right. */}
        <div className="mt-[64px] flex flex-col gap-[32px]">
          {/* node 2839:19193 — "Programs Offering": 3 rows × 3 cards
              (space-between ⇒ gap 40 at 1280), rows gap 32 + pagination.
              Placeholder content: first 9 API courses (D2). */}
          {offering.length > 0 ? (
            <section
              aria-label={t("centres.programsOffering")}
              className="flex flex-col gap-[32px] px-6 py-[32px] lg:px-[80px]"
            >
              <div className="flex items-end justify-between">
                <h2 className="text-[28px] font-[weight:590] leading-none text-black">
                  {t("centres.programsOffering")}
                </h2>
                <Link
                  href={`/centres/${centre.id}?tab=programs`}
                  className="text-[14px] font-normal leading-none text-[#5E5E5E] underline-offset-4 hover:underline"
                >
                  {t("programs.seeMore")}
                </Link>
              </div>
              <div className="flex flex-col gap-[32px]">
                {offeringRows.map((row, i) => (
                  <ul key={i} className="flex gap-[40px] overflow-x-auto">
                    {row.map((c) => (
                      <li key={c.id} className="shrink-0">
                        <ProgramCard course={c} variant="similar" />
                      </li>
                    ))}
                  </ul>
                ))}
                <PaginationArrows />
              </div>
            </section>
          ) : null}

          {/* node 3872:18421 — "Recommended Programs": 1 row + pagination.
              Reuses the programs.similarPrograms copy (same string as the
              detail-page strip). */}
          {recommended.length > 0 ? (
            <section
              aria-label={t("programs.similarPrograms")}
              className="flex flex-col gap-[32px] px-6 py-[32px] lg:px-[80px]"
            >
              <div className="flex items-end justify-between">
                <h2 className="text-[28px] font-[weight:590] leading-none text-black">
                  {t("programs.similarPrograms")}
                </h2>
                <Link
                  href="/programs"
                  className="text-[14px] font-normal leading-none text-[#5E5E5E] underline-offset-4 hover:underline"
                >
                  {t("programs.seeMore")}
                </Link>
              </div>
              <div className="flex flex-col gap-[32px]">
                <ul
                  className="flex gap-[40px] overflow-x-auto"
                  data-testid="centre-recommended"
                >
                  {recommended.map((c) => (
                    <li key={c.id} className="shrink-0">
                      <ProgramCard course={c} variant="similar" />
                    </li>
                  ))}
                </ul>
                <PaginationArrows />
              </div>
            </section>
          ) : null}

          {/* node 3757:21495 — "Suggested Centre": CentreCard placeholders
              → /centres/[id] (centre data is D2 placeholder). */}
          {suggested.length > 0 ? (
            <section
              aria-label={t("centres.suggestedCentre")}
              className="flex flex-col gap-[32px] px-6 py-[32px] lg:px-[80px]"
            >
              <div className="flex items-end justify-between">
                <h2 className="text-[28px] font-[weight:590] leading-none text-black">
                  {t("centres.suggestedCentre")}
                </h2>
                <Link
                  href="/centres"
                  className="text-[14px] font-normal leading-none text-[#5E5E5E] underline-offset-4 hover:underline"
                >
                  {t("programs.seeMore")}
                </Link>
              </div>
              <div className="flex flex-col gap-[32px]">
                <ul
                  className="flex gap-[40px] overflow-x-auto"
                  data-testid="centre-suggested"
                >
                  {suggested.map((c) => (
                    <li key={c.id} className="shrink-0">
                      <CentreCard centre={c} />
                    </li>
                  ))}
                </ul>
                <PaginationArrows />
              </div>
            </section>
          ) : null}
        </div>

        {/* Root spacer: gap 32 + 80px spacer #2471:14675 + gap 32 = 144
            before the footer */}
        <div aria-hidden className="h-[144px]" />
      </div>

      <Footer />
    </main>
  );
}
