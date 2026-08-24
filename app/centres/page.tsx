import { generateMetadata } from "@/lib/metadata"
import { CENTRES } from "@/lib/centre-data"
import { CentreListing } from "@/components/centres/centre-listing"

export const metadata = generateMetadata({
  title: "Centres",
  description: "Browse trusted ClassZ learning centres across Hong Kong.",
  url: "/centres",
})

export default function CentresPage() {
  return <CentreListing centres={CENTRES} />
}
