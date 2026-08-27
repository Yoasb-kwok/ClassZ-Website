import { generateMetadata } from "@/lib/metadata";
import {
  getPublicClasses,
  getPublicCourse,
  getPublicCourses,
} from "@/lib/public-courses";
import { ProgramsListing } from "@/components/programs/programs-listing";

export const metadata = generateMetadata({
  title: "Programs",
  description:
    "Browse enrichment programs for kids on ClassZ — classes, coaches and study centres across Hong Kong.",
  url: "/programs",
});

export default async function ProgramsPage() {
  const [courses, classes] = await Promise.all([
    getPublicCourses(),
    getPublicClasses(),
  ]);
  const programs = courses.filter(
    (c) => c.course_type !== "short_term" && c.course_type !== "summer",
  );

  // /api/courses omits `price` (detail-only) — same landing-page pattern:
  // fetch details for the listed programs so cards + Budget sort are real.
  const details = await Promise.all(
    programs.filter((c) => c.price == null).map((c) => getPublicCourse(c.id)),
  );
  const prices: Record<number, number> = {};
  for (const d of details) {
    if (d?.price != null && !Number.isNaN(Number(d.price))) {
      prices[d.id] = Number(d.price);
    }
  }

  return (
    <ProgramsListing courses={programs} classes={classes} prices={prices} />
  );
}
