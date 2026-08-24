import { generateMetadata } from "@/lib/metadata"
import {
  getPublicClasses,
  getPublicCourses,
  classesForCourse,
} from "@/lib/public-courses"
import { DiscoveryPage } from "@/components/programs/discovery-page"

export const metadata = generateMetadata({
  title: "Workshops",
  description:
    "Short-term and seasonal kids workshops on ClassZ — intensives, camps and one-off experiences across Hong Kong.",
  url: "/workshops",
})

export default async function WorkshopsPage() {
  const [courses, classes] = await Promise.all([
    getPublicCourses(),
    getPublicClasses(),
  ])
  // "N schedules" row on the 2408 wide card — active classes per course
  const scheduleCounts: Record<number, number> = {}
  for (const course of courses) {
    scheduleCounts[course.id] = classesForCourse(classes, course).length
  }
  return (
    <DiscoveryPage
      courses={courses}
      variant="workshops"
      scheduleCounts={scheduleCounts}
    />
  )
}
