import { notFound } from "next/navigation";
import { generateMetadata as genMeta } from "@/lib/metadata";
import {
  getPublicCourse,
  getPublicClasses,
  classesForCourse,
  getPublicCourses,
  type PublicCourse,
} from "@/lib/public-courses";
import { ProgramDetail } from "@/components/programs/program-detail";

type Params = {
  params: Promise<{ id: string }>;
  /** ?dates=1 — the /programs listing links here with lesson dates expanded */
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function loadCourse(id: string): Promise<PublicCourse | null> {
  if (!/^\d+$/.test(id)) return null;
  return getPublicCourse(Number(id));
}

export async function generateMetadata({ params }: Params) {
  const { id } = await params;
  const course = await loadCourse(id);
  if (!course) return genMeta({ title: "Program not found", noIndex: true });
  return genMeta({
    title: course.name,
    description: course.intro ?? undefined,
    url: `/programs/${course.id}`,
  });
}

export default async function ProgramDetailPage({
  params,
  searchParams,
}: Params) {
  const { id } = await params;
  const sp = await searchParams;
  const expandLessonDates = sp.dates === "1";
  const course = await loadCourse(id);
  if (!course) notFound();

  const [classes, allCourses] = await Promise.all([
    getPublicClasses(),
    getPublicCourses(),
  ]);
  const sessions = classesForCourse(classes, course);
  const similar = allCourses
    .filter((c) => c.id !== course.id && c.center_id === course.center_id)
    .slice(0, 3);

  // The list API omits `price` (detail-only). Fetch details for the similar
  // cards so the similar-variant strip can show a real price.
  const similarDetails = await Promise.all(
    similar.filter((c) => c.price == null).map((c) => getPublicCourse(c.id)),
  );
  const prices: Record<number, number> = {};
  for (const d of similarDetails) {
    if (d?.price != null && !Number.isNaN(Number(d.price))) {
      prices[d.id] = Number(d.price);
    }
  }

  return (
    <ProgramDetail
      course={course}
      classes={sessions}
      similar={similar}
      prices={prices}
      expandLessonDates={expandLessonDates}
    />
  );
}
