/**
 * Placeholder centre data — W6, Figma #2471:14635 "Centre View" (capture:
 * Centre_View.figmacapture, 2026-08-24). There is no centre API yet (D2 in
 * docs/UI_Changes_2408.md): every field below is design mock content. Centre 1
 * is capture-verbatim; centres 2–3 are invented siblings so the "Suggested
 * Centre" strip has three cards. Swap for API data when /centres endpoints
 * land — keep the field shape.
 *
 * Assets exported from the capture (public/images/centres/): banner (node
 * 2471:15496), map (2568:10465), avatar (2511:19374), staff photos (2507:19228
 * / 2507:19234), review avatar (2518:29862).
 */

/** Feature keys reuse the programs.serviceTags locale strings (14/700 titles). */
export type CentreFeatureKey =
  | "sen"
  | "smallClass"
  | "examPathway"
  | "performance"
  | "learningCompanion";

export const ALL_CENTRE_FEATURES: CentreFeatureKey[] = [
  "sen",
  "smallClass",
  "examPathway",
  "performance",
  "learningCompanion",
];

export function isCentreFeatureKey(value: string): value is CentreFeatureKey {
  return (ALL_CENTRE_FEATURES as string[]).includes(value);
}

export type CentreStaff = {
  name: string;
  role: string;
  photo: string;
};

/** One review card (#2518:29856) — the design repeats an identical card 3×. */
export type CentreReview = {
  name: string;
  avatar: string;
  date: string;
  stars: number;
  rating: string;
  text: string;
};

export type Centre = {
  id: number;
  name: string;
  /** lib/locations.ts district slug — filters the /centres Place sidebar
   *  and drives the locale-aware district display. */
  districtSlug: string;
  address: string;
  /** Teaching category slug (music, art, …) — shown on the public centre page. */
  category?: string | null;
  /** Listing-card "Age {age}" row — D2 placeholder (live-frame mock says
   *  "Age 3-6"; centres have no age data — swap for real fields or drop
   *  when the API lands). */
  ageTag: string;
  /** Listing-card image (wide 643:253 card) — design asset from the live
   *  Programs frame card 1 (imageRef 34319d…), shared by all placeholder
   *  centres. banner.jpg stays the detail-page hero. */
  listingImage: string;
  /** Header meta + card star block — strings by design ("4.91"). */
  rating: string;
  reviewCount: number;
  welcome: string;
  avatar: string;
  banner: string;
  map: string;
  staff: CentreStaff[];
  features: CentreFeatureKey[];
  reviews: CentreReview[];
};

const DESIGN_REVIEW_TEXT =
  "This is ClassZ Guitar Program! Our centre is designed to provide a stimulating and supportive environment where learners of all ages can engage.";

/** The capture's three review cards are identical clones (#2518/2556 nodes). */
const DESIGN_REVIEWS: CentreReview[] = [0, 1, 2].map(() => ({
  name: "Jacky Lam",
  avatar: "/images/centres/review-avatar.jpg",
  date: "Mar 04, 2026",
  stars: 5,
  rating: "5",
  text: DESIGN_REVIEW_TEXT,
}));

const ALL_FEATURES: CentreFeatureKey[] = ALL_CENTRE_FEATURES;

export const CENTRES: Centre[] = [
  {
    id: 1,
    // Verbatim text node #2471:15187 (mock brand + centre name in one run).
    name: "ClassZ Playground Bright Kids Drawing Centre",
    districtSlug: "central",
    address: "Shop 1B, Class Mall, Central, Hong Kong",
    ageTag: "3-6",
    listingImage: "/images/centres/listing.jpg",
    rating: "4.91",
    reviewCount: 50,
    welcome:
      "Welcome to the Enrichment Hub! Our centre is designed to provide a stimulating and supportive environment where learners of all ages can engage in a wide range of captivating classes and pursue their unique interests.",
    avatar: "/images/centres/avatar.jpg",
    banner: "/images/centres/banner.jpg",
    map: "/images/centres/map.jpg",
    staff: [
      {
        name: "Jessica Lam",
        role: "Centre Manager",
        photo: "/images/centres/staff-1.jpg",
      },
      {
        name: "Athena Yeung",
        role: "Program Coach",
        photo: "/images/centres/staff-2.jpg",
      },
    ],
    features: ALL_FEATURES,
    reviews: DESIGN_REVIEWS,
  },
  {
    id: 2,
    // Card-mock name from #3757:21515; the rest is invented (D2).
    name: "ClassZ Playgroup Centre",
    districtSlug: "tsim-sha-tsui",
    address: "Shop 2A, Class Mall, Tsim Sha Tsui, Kowloon, Hong Kong",
    ageTag: "2-4",
    listingImage: "/images/centres/listing.jpg",
    rating: "4.87",
    reviewCount: 36,
    welcome:
      "Welcome to our playgroup! Our centre is designed to provide a stimulating and supportive environment where learners of all ages can engage in a wide range of captivating classes and pursue their unique interests.",
    avatar: "/images/programs/avatars/a2.jpg",
    banner: "/images/programs/class.jpg",
    map: "/images/centres/map.jpg",
    staff: [
      {
        name: "Marcus Chan",
        role: "Program Coach",
        photo: "/images/centres/staff-2.jpg",
      },
      {
        name: "Wendy Lau",
        role: "Centre Manager",
        photo: "/images/centres/staff-1.jpg",
      },
    ],
    features: ALL_FEATURES,
    reviews: DESIGN_REVIEWS,
  },
  {
    id: 3,
    name: "ClassZ Music & Arts Centre",
    districtSlug: "causewaybay",
    address: "Shop 3C, Class Mall, Causeway Bay, Hong Kong Island, Hong Kong",
    ageTag: "4-12",
    listingImage: "/images/centres/listing.jpg",
    rating: "4.95",
    reviewCount: 64,
    welcome:
      "Welcome to our music and arts hub! Our centre is designed to provide a stimulating and supportive environment where learners of all ages can engage in a wide range of captivating classes and pursue their unique interests.",
    avatar: "/images/programs/avatars/a3.jpg",
    banner: "/images/programs/gallery.jpg",
    map: "/images/centres/map.jpg",
    staff: [
      {
        name: "Jessica Lam",
        role: "Centre Manager",
        photo: "/images/centres/staff-1.jpg",
      },
      {
        name: "Athena Yeung",
        role: "Program Coach",
        photo: "/images/centres/staff-2.jpg",
      },
    ],
    features: ALL_FEATURES,
    reviews: DESIGN_REVIEWS,
  },
];

export function getCentre(id: string): Centre | null {
  if (!/^\d+$/.test(id)) return null;
  return CENTRES.find((c) => c.id === Number(id)) ?? null;
}
