import { generateMetadata } from "@/lib/metadata";
import { isRegularCourseType, isWorkshopCourseType } from "@/lib/course-types";
import { getPublicCourses, getPublicCourse } from "@/lib/public-courses";
import { LandingPage } from "@/components/programs/landing-page";

export const metadata = generateMetadata({
  title: "ClassZ - Discover, Book & Track Extracurricular Classes for Kids",
  description:
    "ClassZ is your all-in-one platform for discovering enrichment classes, booking sessions seamlessly, and tracking your child's learning progress. From sports to arts, coding to music - find the perfect class for your child.",
  url: "/",
});

export default async function Page() {
  const courses = await getPublicCourses();
  const programs = courses.filter((c) => isRegularCourseType(c.course_type));
  const workshops = courses.filter((c) => isWorkshopCourseType(c.course_type));

  // /api/courses omits `price` (it only exists on the detail endpoint).
  // Fetch details for just the 6 featured cards so the strips can show
  // real prices; the card hides the price run when it is null.
  const featured = [...programs.slice(0, 3), ...workshops.slice(0, 3)].filter(
    (c) => c.price == null,
  );
  const details = await Promise.all(featured.map((c) => getPublicCourse(c.id)));
  const prices: Record<number, number> = {};
  for (const d of details) {
    if (d?.price != null && !Number.isNaN(Number(d.price))) {
      prices[d.id] = Number(d.price);
    }
  }

  return (
    <LandingPage programs={programs} workshops={workshops} prices={prices} />
  );
}
