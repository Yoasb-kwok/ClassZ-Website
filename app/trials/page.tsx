import { generateMetadata } from "@/lib/metadata"
import {
  getPublicClasses,
  getPublicCourse,
  getPublicCourses,
} from "@/lib/public-courses"
import { getCentreLocationHints } from "@/lib/public-centres"
import { isTrialCourseType } from "@/lib/course-types"
import { ProgramsListing } from "@/components/programs/programs-listing"

export const metadata = generateMetadata({
  title: "Trial classes",
  description:
    "Try a class before you enroll — one-off trial sessions from ClassZ centres across Hong Kong.",
  url: "/trials",
})

export default async function TrialsPage() {
  const [courses, classes, centreHints] = await Promise.all([
    getPublicCourses(),
    getPublicClasses(),
    getCentreLocationHints(),
  ])
  const trials = courses.filter((c) => isTrialCourseType(c.course_type))
  const details = await Promise.all(
    trials.filter((c) => c.price == null).map((c) => getPublicCourse(c.id)),
  )
  const prices: Record<number, number> = {}
  for (const d of details) {
    if (d?.price != null && !Number.isNaN(Number(d.price))) {
      prices[d.id] = Number(d.price)
    }
  }

  return (
    <ProgramsListing
      courses={trials}
      classes={classes}
      prices={prices}
      variant="trials"
      centreHints={centreHints}
    />
  )
}
