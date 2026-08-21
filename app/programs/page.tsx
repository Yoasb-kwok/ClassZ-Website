import { generateMetadata } from "@/lib/metadata"
import { getPublicCourses } from "@/lib/public-courses"
import { DiscoveryPage } from "@/components/programs/discovery-page"

export const metadata = generateMetadata({
  title: "Programs",
  description:
    "Browse enrichment programs for kids on ClassZ — classes, coaches and study centres across Hong Kong.",
  url: "/programs",
})

export default async function ProgramsPage() {
  const courses = await getPublicCourses()
  return <DiscoveryPage courses={courses} variant="programs" />
}
