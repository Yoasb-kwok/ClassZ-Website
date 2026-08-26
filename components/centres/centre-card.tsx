"use client";

import Link from "next/link";
import { CircleCheck, Heart, MapPin, Star } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { formatTemplate } from "@/components/programs/format";
import { districtLabel } from "@/lib/locations";
import type { Centre } from "@/lib/centre-data";

/**
 * Centre card in two variants:
 *
 * - "strip" (default) from Figma #3757:21501 (Centre_View capture, W6
 *   2026-08-24) — 400×299, r12 (image #3757:21502 cornerRadii 12/12/0/0 +
 *   body #3757:21511 0/0/12/12) + shadow 0 6.81/18.16 rgba(0,0,0,0.12)
 *   (same geometry family as the similar-program card #3810:20016).
 *
 *   Image #3757:21502 400×210, pad 18.16 chrome: SEN badge #3757:21503
 *   (r4.54, #FFFFFF 80% fill, pad 4.54/9.08, tick-circle 15.89 stroke
 *   #1B1A1F/1.32 + "SEN" 15.89/590 #222, gap 2.27) and heart #3757:21509
 *   27.23 (#222 30% fill + #FFFFFF 2.27 stroke; the strip's middle instance
 *   is the hover state → grows to 30.62 @20.41 inset, mirroring the similar
 *   card's "Expand" instance).
 *
 *   Body #3757:21511 400×88.51 pad 18.16, two blocks justify-between
 *   (stated gap 53.33): left #3757:21513 title 16/590 h19 (gap 13.62 to
 *   sub-row) + sub-row #3757:21516 gap 4 (2px #5E5E5E dot); right star
 *   block #3757:21521 star 16 #222 + "4.91" 14/400 gap 4, top-aligned.
 *
 *   Mock-mix substitution (§4.4, D2): the design mocks a program
 *   price/age pair inside the centre card — we render district (#222) ·
 *   "{count} reviews" (grey) in the same styles. Noted in
 *   figma prompt/INDEX.md.
 *
 * - "listing" (W8, reworked same day) for the /centres list. The LIVE
 *   Programs frame `1582:16181` was redesigned after the 08-21 capture:
 *   cards are now a vertical list of wide "Expand" cards (rows `3866:17741`
 *   pad 32/0 gap 32; row `EL-3c06757b` 1102×253 pad 0/80/0/48 — same as
 *   the 2408 workshop listing). The 2208 capture still shows the old 3-col
 *   grid → STALE for the card section; card values here come from the
 *   FRESH workshop capture (same component, `3863:17550`): 974×253, image
 *   panel full-bleed 643:253, white panel w331 pad 14, info space-between
 *   (top: title col + heart gap 40.63; title 22/590 lh26 w239 clamp-2,
 *   inner gap 7.62), address 14 #5E5E5E + MapPin 16 gap 4.
 *   Centre-specific rows per the live frame's MCP (orientation only,
 *   pending re-export): star 19.35 #222 + rating 18 #222 gap 4.84 (centre
 *   HAS rating data, unlike courses); card radius 9.14 (panel radii —
 *   workshop capture has none); age row + left-aligned "10+ schedules"
 *   (D2 placeholder). 2026-08-26 user pass: review-count row dropped,
 *   "10+ schedules" moved left + underline removed; heart enlarged to
 *   27.23/22.69×20.23 (user "even bigger"). Listing image = design
 *   asset `listing.jpg` (imageRef 34319d…, exported 2026-08-24).
 */
export function CentreCard({
  centre,
  variant = "strip",
}: {
  centre: Centre;
  variant?: "strip" | "listing";
}) {
  const { t, locale } = useLanguage();
  const showSen = centre.features.includes("sen");
  const district = districtLabel(centre.districtSlug, locale);

  if (variant === "listing") {
    return (
      <Link
        href={`/centres/${centre.id}`}
        data-testid="centre-card"
        className="group flex w-full flex-col overflow-hidden rounded-[9.14px] bg-white shadow-[0_4.571px_12.189px_0_rgba(0,0,0,0.12)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-classz-400 lg:h-[253px] lg:flex-row"
      >
        {/* Image panel (workshop `3863:17551` / live `3866:17744`) —
            IMAGE fill, full-bleed; keeps its 643:253 aspect below lg
            (spec-silent mobile, same as the workshop card). Card radius
            9.14 + shadow 0 4.571px 12.189px rgba(0,0,0,0.12) (live-frame
            "Expand" template EL-bd76cd2a effects — MCP-verbatim pending
            re-export; TR corner ambiguous, rounded all-round) */}
        <div className="relative aspect-[643/253] w-full overflow-hidden bg-classz-50 lg:aspect-auto lg:h-[253px] lg:w-auto lg:flex-1 lg:shrink">
          <img
            src={centre.listingImage}
            alt={centre.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        {/* White panel (workshop `3863:17554` / live `3866:17745`) — w331
            pad 14; info space-between, min gap 10 */}
        <div className="w-full shrink-0 bg-white p-[14px] lg:w-[331px]">
          <div className="flex h-full flex-col justify-between gap-2.5">
            {/* Top — title col + heart, gap 40.63; title 22/590 lh26 w239
                clamp-2; star 19.35 #222 + rating 18 gap 4.84; mock price row
                → "{count} reviews" (§4.4) */}
            <div className="flex items-start justify-between gap-[40.63px]">
              <div className="flex min-w-0 flex-col gap-[7.62px]">
                <h3 className="line-clamp-2 w-full text-[22px] font-[weight:590] leading-[26px] text-ink lg:w-[239px]">
                  {centre.name}
                </h3>
                <div className="flex items-center gap-[4.84px]">
                  <Star
                    aria-hidden
                    className="h-[19.35px] w-[19.35px] text-[#222222]"
                    fill="#222222"
                    strokeWidth={0}
                  />
                  <span className="text-[18px] leading-[21px] text-[#222222]">
                    {centre.rating}
                  </span>
                </div>
              </div>
              {/* Heart (workshop `3866:17617`) — scaled UP from the design's
                  23.33/19.44×17.33 to 27.23/22.69×20.23 #BDBDBD/2.26
                  (user 2026-08-26: "even bigger"). */}
              <span
                aria-hidden
                className="flex h-[27.23px] w-[27.23px] shrink-0 items-center justify-center"
              >
                <Heart
                  className="h-[20.23px] w-[22.69px] text-[#BDBDBD]"
                  strokeWidth={2.26}
                  fill="none"
                />
              </span>
            </div>

            {/* Middle (live `3866:17758` col gap 10) — age 14 #5E5E5E,
                address 14 #5E5E5E + MapPin 16 row gap 4, then the
                right-aligned block `3866:17768`: "10+ schedules" 14 #222
                UNDERLINED (live-frame MCP; workshop capture has no
                underline — verify on re-export). Age/schedules are D2
                placeholder content (no centre API fields). */}
            <div className="flex flex-col gap-2.5">
              <p className="text-[14px] leading-[17px] text-[#5E5E5E]">
                {t("programs.ageLabel").replace("{age}", centre.ageTag)}
              </p>
              <div className="flex items-center gap-1">
                <MapPin
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-[#5E5E5E]"
                  strokeWidth={1.5}
                />
                <p className="truncate text-[14px] leading-[17px] text-[#5E5E5E]">
                  {centre.address}
                </p>
              </div>
              <p className="text-[14px] leading-[17px] text-ink">
                {t("programs.schedulesMany")}
              </p>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/centres/${centre.id}`}
      data-testid="centre-card"
      className="group block w-[400px] max-w-full overflow-hidden rounded-[12px] bg-white shadow-[0_6.81px_18.16px_rgba(0,0,0,0.12)]"
    >
      {/* node 3757:21502 — image area h210; chrome inset 18.16 */}
      <div className="relative h-[210px] w-full overflow-hidden bg-classz-50">
        <img
          src={centre.banner}
          alt={centre.name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {showSen ? (
          <span className="absolute left-[18.16px] top-[18.16px] flex items-center gap-[2.27px] rounded-[4.54px] bg-white/80 px-[9.08px] py-[4.54px]">
            <CircleCheck
              aria-hidden
              className="h-[15.89px] w-[15.89px] text-[#1B1A1F]"
              strokeWidth={1.32}
            />
            <span className="text-[15.89px] font-[weight:590] leading-none text-[#222222]">
              SEN
            </span>
          </span>
        ) : null}
        <Heart
          aria-hidden
          strokeWidth={2.27}
          fill="#222222"
          fillOpacity={0.3}
          stroke="#FFFFFF"
          className="absolute right-[18.16px] top-[18.16px] h-[27.23px] w-[27.23px] text-white transition-all duration-200 group-hover:right-[20.41px] group-hover:top-[20.41px] group-hover:h-[30.62px] group-hover:w-[30.62px]"
        />
      </div>

      {/* node 3757:21511 — body h88.51 pad 18.16; inner #3757:21512
          justify-between: left col vs star block (top-aligned) */}
      <div className="flex h-[88.51px] items-start justify-between py-[18.16px] pl-[18.16px] pr-[18.16px]">
        <div className="flex min-w-0 flex-col">
          <h3 className="truncate text-[16px] font-[weight:590] leading-[19px] text-ink">
            {centre.name}
          </h3>
          <div className="mt-[13.62px] flex items-center gap-[4px] text-[16px] leading-[19px]">
            <span className="truncate text-ink">{district}</span>
            <span
              aria-hidden
              className="h-[2px] w-[2px] shrink-0 rounded-full bg-[#5E5E5E]"
            />
            <span className="truncate font-normal text-[#5E5E5E]">
              {formatTemplate(t, "centres.reviewCount", {
                count: centre.reviewCount,
              })}
            </span>
          </div>
        </div>
        {/* node 3757:21521 — star 16 #222 + rating 14/400, gap 4 */}
        <div className="flex shrink-0 items-center gap-[4px]">
          <Star
            aria-hidden
            className="h-[16px] w-[16px] text-[#222222]"
            fill="#222222"
            strokeWidth={0}
          />
          <span className="text-[14px] font-normal leading-[17px] text-[#222222]">
            {centre.rating}
          </span>
        </div>
      </div>
    </Link>
  );
}
