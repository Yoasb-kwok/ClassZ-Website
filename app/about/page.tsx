import { generateMetadata } from "@/lib/metadata"
import { AboutPage } from "@/components/info/about-page"

export const metadata = generateMetadata({
  title: "About Us",
  description:
    "One platform. A more connected learning ecosystem for families, children, and learning centres.",
  url: "/about",
})

export default function Page() {
  return <AboutPage />
}
