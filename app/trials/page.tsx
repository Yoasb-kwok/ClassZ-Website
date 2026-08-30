import { generateMetadata } from "@/lib/metadata"
import {
  getPublicClasses,
  getPublicCourses,
  sessionsForWorkshop,
} from "@/lib/public-courses"
import { DiscoveryPage } from "@/components/programs/discovery-page"

export const metadata = generateMetadata({
  title: "Trial classes",
  description:
    "Try a class before you enroll — one-off trial sessions from ClassZ centres across Hong Kong.",
  url: "/trials",
})

export default async function TrialsPage() {
  const [courses, classes] = await Promise.all([
    getPublicCourses(),
    getPublicClasses(),
  ])
  const scheduleCounts: Record<number, number> = {}
  for (const course of courses) {
    scheduleCounts[course.id] = sessionsForWorkshop(classes, course).length
  }
  return (
    <DiscoveryPage
      courses={courses}
      variant="trials"
      scheduleCounts={scheduleCounts}
    />
  )
}
