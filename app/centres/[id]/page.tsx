import { notFound } from "next/navigation";
import { generateMetadata as genMeta } from "@/lib/metadata";
import { getPublicCourses, getPublicCourse } from "@/lib/public-courses";
import { CENTRES, getCentre } from "@/lib/centre-data";
import { CentreView } from "@/components/centres/centre-view";
import { DiscoveryPage } from "@/components/programs/discovery-page";

/**
 * Centre detail — W6 + W7 (D1: single route). Default state = Centre View
 * (#2471:14635); `?tab=programs` = the centre profile-programs listing
 * (#2568:10769) via the shared DiscoveryPage shell, variant "centre"
 * (no search, no Place filter — capture hides both). Centre identity is
 * placeholder data (D2); the listing shows all public courses as
 * placeholder content per the §6 centre-flow plan in
 * docs/UI_Changes_2408.md.
 */
type Params = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Params) {
  const { id } = await params;
  const centre = getCentre(id);
  if (!centre) return genMeta({ title: "Centre not found", noIndex: true });
  return genMeta({
    title: centre.name,
    description: centre.welcome,
    url: `/centres/${centre.id}`,
  });
}

export default async function CentreDetailPage({
  params,
  searchParams,
}: Params) {
  const { id } = await params;
  const centre = getCentre(id);
  if (!centre) notFound();

  const courses = await getPublicCourses();

  // W7 — programs state on the same route (D1: ?tab=programs, noted in INDEX)
  const { tab } = await searchParams;
  if (tab === "programs") {
    return <DiscoveryPage courses={courses} variant="centre" />;
  }

  // Placeholder strip content (D2): first 9 courses fill "Programs
  // Offering"'s 3×3 grid; the next 3 fill "Recommended Programs".
  const offering = courses.slice(0, 9);
  const recommended =
    courses.length > 9 ? courses.slice(9, 12) : courses.slice(0, 3);
  const others = CENTRES.filter((c) => c.id !== centre.id);
  const suggested = others.length >= 3 ? others : CENTRES;

  // The list API omits `price` (detail-only). Fetch details for the
  // displayed program cards so the similar-variant strip can show a real
  // price; the card hides the price row when it is null.
  const featured = [...offering, ...recommended].filter((c) => c.price == null);
  const details = await Promise.all(featured.map((c) => getPublicCourse(c.id)));
  const prices: Record<number, number> = {};
  for (const d of details) {
    if (d?.price != null && !Number.isNaN(Number(d.price))) {
      prices[d.id] = Number(d.price);
    }
  }

  return (
    <CentreView
      centre={centre}
      offering={offering}
      recommended={recommended}
      suggested={suggested}
      prices={prices}
    />
  );
}
