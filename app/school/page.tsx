import { generateMetadata } from "@/lib/metadata";
import { isWorkshopCourseType } from "@/lib/course-types";
import { getPublicCourses, getPublicCourse } from "@/lib/public-courses";
import { fetchSitePage, landingOverridesFromBlocks } from "@/lib/site-pages";
import { MarketplaceLanding } from "@/components/programs/marketplace-landing";

export const metadata = generateMetadata({
  title: "ClassZ School - Discover, Book & Track Classes",
  description:
    "Browse enrichment classes, book sessions, and follow your child's learning progress on ClassZ School.",
  url: "/school",
});

export const revalidate = 60;

export default async function ClasszSchoolPage() {
  const [courses, landingPage] = await Promise.all([
    getPublicCourses(),
    fetchSitePage("landing"),
  ]);
  const workshops = courses.filter((c) => isWorkshopCourseType(c.course_type));

  const featured = workshops.slice(0, 3).filter((c) => c.price == null);
  const details = await Promise.all(featured.map((c) => getPublicCourse(c.id)));
  const prices: Record<number, number> = {};
  for (const d of details) {
    if (d?.price != null && !Number.isNaN(Number(d.price))) {
      prices[d.id] = Number(d.price);
    }
  }

  return (
    <MarketplaceLanding
      workshops={workshops}
      prices={prices}
      cms={{
        en: landingOverridesFromBlocks(landingPage.blocks, "en"),
        zhTw: landingOverridesFromBlocks(landingPage.blocks, "zh-TW"),
      }}
    />
  );
}
