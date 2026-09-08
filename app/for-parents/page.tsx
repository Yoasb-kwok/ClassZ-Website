import { generateMetadata } from "@/lib/metadata"
import { ForParentsPage } from "@/components/info/for-parents-page"

export const metadata = generateMetadata({
  title: "For Parents",
  description: "See more than the result. Understand the learning behind every class.",
  url: "/for-parents",
})

export default function Page() {
  return <ForParentsPage />
}
