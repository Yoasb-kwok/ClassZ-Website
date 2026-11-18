import { generateMetadata } from "@/lib/metadata"
import { EarlyAccessPage } from "@/components/info/early-access-page"

export const metadata = generateMetadata({
  title: "Early Access",
  description: "Be among the first to experience ClassZ.",
  url: "/early-access",
})

export default function Page() {
  return <EarlyAccessPage />
}
