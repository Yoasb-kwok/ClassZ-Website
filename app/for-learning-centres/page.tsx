import { generateMetadata } from "@/lib/metadata"
import { ForCentresPage } from "@/components/info/for-centres-page"

export const metadata = generateMetadata({
  title: "For Learning Centres",
  description: "Turn everyday class operations into stronger parent relationships.",
  url: "/for-learning-centres",
})

export default function Page() {
  return <ForCentresPage />
}
