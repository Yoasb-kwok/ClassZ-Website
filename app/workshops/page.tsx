import { generateMetadata } from "@/lib/metadata"
import { getPublicCourses } from "@/lib/public-courses"
import { DiscoveryPage } from "@/components/programs/discovery-page"

export const metadata = generateMetadata({
  title: "Workshops",
  description:
    "Short-term and seasonal kids workshops on ClassZ — intensives, camps and one-off experiences across Hong Kong.",
  url: "/workshops",
})

export default async function WorkshopsPage() {
  const courses = await getPublicCourses()
  return <DiscoveryPage courses={courses} variant="workshops" />
}
