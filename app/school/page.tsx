import { generateMetadata } from "@/lib/metadata"
import { isRegularCourseType, isWorkshopCourseType } from "@/lib/course-types"
import { getPublicCourses, getPublicCourse } from "@/lib/public-courses"
import { MarketplaceLanding } from "@/components/programs/marketplace-landing"

export const metadata = generateMetadata({
  title: "ClassZ School - Discover, Book & Track Classes",
  description:
    "Browse enrichment classes, book sessions, and follow your child's learning progress on ClassZ School.",
  url: "/school",
})

export default async function ClasszSchoolPage() {
  const courses = await getPublicCourses()
  const programs = courses.filter((c) => isRegularCourseType(c.course_type))
  const workshops = courses.filter((c) => isWorkshopCourseType(c.course_type))

  const featured = [...programs.slice(0, 3), ...workshops.slice(0, 3)].filter(
    (c) => c.price == null,
  )
  const details = await Promise.all(featured.map((c) => getPublicCourse(c.id)))
  const prices: Record<number, number> = {}
  for (const d of details) {
    if (d?.price != null && !Number.isNaN(Number(d.price))) {
      prices[d.id] = Number(d.price)
    }
  }

  return <MarketplaceLanding programs={programs} workshops={workshops} prices={prices} />
}
