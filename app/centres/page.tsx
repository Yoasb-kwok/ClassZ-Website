import { generateMetadata } from "@/lib/metadata"
import { getPublicCentres } from "@/lib/public-centres"
import { CentreListing } from "@/components/centres/centre-listing"

export const metadata = generateMetadata({
  title: "Centres",
  description: "Browse trusted ClassZ learning centres across Hong Kong.",
  url: "/centres",
})

export default async function CentresPage() {
  const centres = await getPublicCentres()
  return <CentreListing centres={centres} />
}
