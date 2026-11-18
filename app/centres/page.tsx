import { generateMetadata } from "@/lib/metadata"
import { getPublicCentres } from "@/lib/public-centres"
import { getPublicCourse, getPublicCourses } from "@/lib/public-courses"
import { isRegularCourseType } from "@/lib/course-types"
import { CentreListing, type CentreMarketStats } from "@/components/centres/centre-listing"

export const metadata = generateMetadata({
  title: "Centres",
  description: "Browse trusted ClassZ learning centres across Hong Kong.",
  url: "/centres",
})

export default async function CentresPage() {
  const [centres, courses] = await Promise.all([getPublicCentres(), getPublicCourses()])
  const regular = courses.filter((course) => isRegularCourseType(course.course_type))
  const details = await Promise.all(
    regular.filter((course) => course.price == null).map((course) => getPublicCourse(course.id)),
  )
  const prices: Record<number, number> = {}
  for (const course of regular) {
    if (course.price != null && !Number.isNaN(Number(course.price))) {
      prices[course.id] = Number(course.price)
    }
  }
  for (const detail of details) {
    if (detail?.price != null && !Number.isNaN(Number(detail.price))) {
      prices[detail.id] = Number(detail.price)
    }
  }
  const stats: Record<number, CentreMarketStats> = {}
  for (const course of regular) {
    const current = stats[course.center_id] ?? {
      programCount: 0,
      fromPrice: null,
      sponsored: false,
    }
    current.programCount += 1
    const price = prices[course.id]
    if (price != null && (current.fromPrice == null || price < current.fromPrice)) {
      current.fromPrice = price
    }
    if (course.boosted) current.sponsored = true
    stats[course.center_id] = current
  }
  return (
    <CentreListing
      centres={centres}
      stats={stats}
      showProgramCounts={courses.length > 0}
    />
  )
}
