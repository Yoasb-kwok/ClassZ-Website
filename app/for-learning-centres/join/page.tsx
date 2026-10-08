import { generateMetadata } from "@/lib/metadata"
import { ForCentresPage } from "@/components/info/for-centres-page"

export const metadata = generateMetadata({
  title: "How to Join Us",
  description: "Onboard a learning centre with ClassZ, or submit a partnership request.",
  url: "/for-learning-centres/join",
})

export default function Page() {
  return <ForCentresPage tab="join" />
}
