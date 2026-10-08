import { generateMetadata } from "@/lib/metadata"
import { ForCentresPage } from "@/components/info/for-centres-page"

export const metadata = generateMetadata({
  title: "Centre Obligation",
  description: "Partnership standards for ClassZ learning centres.",
  url: "/for-learning-centres/obligation",
})

export default function Page() {
  return <ForCentresPage tab="obligation" />
}
