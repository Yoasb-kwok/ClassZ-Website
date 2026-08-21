import { generateMetadata } from "@/lib/metadata"
import { getPublicCourses } from "@/lib/public-courses"
import { LandingPage } from "@/components/programs/landing-page"

export const metadata = generateMetadata({
  title: "ClassZ - Discover, Book & Track Extracurricular Classes for Kids",
  description:
    "ClassZ is your all-in-one platform for discovering enrichment classes, booking sessions seamlessly, and tracking your child's learning progress. From sports to arts, coding to music - find the perfect class for your child.",
  url: "/",
})

export default async function Page() {
  const courses = await getPublicCourses()
  const isWorkshop = (c: { course_type: string | null }) =>
    c.course_type === "short_term" || c.course_type === "summer"
  return (
    <LandingPage
      programs={courses.filter((c) => !isWorkshop(c))}
      workshops={courses.filter(isWorkshop)}
    />
  )
}
