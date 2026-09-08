import { generateMetadata } from "@/lib/metadata"
import {
  getPublicClasses,
  getPublicCourse,
  getPublicCourses,
} from "@/lib/public-courses"
import { getCentreLocationHints } from "@/lib/public-centres"
import { isWorkshopCourseType } from "@/lib/course-types"
import { ProgramsListing } from "@/components/programs/programs-listing"

export const metadata = generateMetadata({
  title: "Workshops",
  description:
    "Short-term and seasonal kids workshops on ClassZ — intensives, camps and one-off experiences across Hong Kong.",
  url: "/workshops",
})

export default async function WorkshopsPage() {
  const [courses, classes, centreHints] = await Promise.all([
    getPublicCourses(),
    getPublicClasses(),
    getCentreLocationHints(),
  ])
  const workshops = courses.filter((c) => isWorkshopCourseType(c.course_type))
  const details = await Promise.all(
    workshops.filter((c) => c.price == null).map((c) => getPublicCourse(c.id)),
  )
  const prices: Record<number, number> = {}
  for (const d of details) {
    if (d?.price != null && !Number.isNaN(Number(d.price))) {
      prices[d.id] = Number(d.price)
    }
  }

  return (
    <ProgramsListing
      courses={workshops}
      classes={classes}
      prices={prices}
      variant="workshops"
      centreHints={centreHints}
    />
  )
}
