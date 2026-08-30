import { notFound } from "next/navigation";
import { generateMetadata as genMeta } from "@/lib/metadata";
import { getPublicCourses, getPublicCourse } from "@/lib/public-courses";
import { getPublicCentre, getPublicCentres } from "@/lib/public-centres";
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
  const centre = await getPublicCentre(id);
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
  const centre = await getPublicCentre(id);
  if (!centre) notFound();

  const [courses, allCentres] = await Promise.all([getPublicCourses(), getPublicCentres()]);
  const mine = courses.filter((c) => Number(c.center_id) === centre.id);

  // W7 — programs state on the same route (D1: ?tab=programs, noted in INDEX)
  const { tab } = await searchParams;
  if (tab === "programs") {
    return <DiscoveryPage courses={mine.length ? mine : courses} variant="centre" />;
  }

  const offering = (mine.length ? mine : courses).slice(0, 9);
  const recommended = mine.length > 9 ? mine.slice(9, 12) : (mine.length ? mine : courses).slice(0, 3);
  const others = allCentres.filter((c) => c.id !== centre.id);
  const suggested = others.length ? others.slice(0, 3) : allCentres;

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
