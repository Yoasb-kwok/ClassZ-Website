import { generateMetadata } from "@/lib/metadata"
import { LandingPage } from "@/components/programs/landing-page"

export const metadata = generateMetadata({
  title: "ClassZ - One connected learning journey",
  description:
    "Discover insights into every child’s growth and learning through a unified platform that connects parents, educators, and centres.",
  url: "/",
})

export default function Page() {
  return <LandingPage />
}
