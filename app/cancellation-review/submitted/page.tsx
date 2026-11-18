import { generateMetadata } from "@/lib/metadata"
import { CancellationSubmittedPage } from "@/components/info/cancellation-submitted-page"

export const metadata = generateMetadata({
  title: "Cancellation request submitted",
  description: "ClassZ will review this cancellation request with the learning centre.",
  url: "/cancellation-review/submitted",
  noIndex: true,
})

export default function Page() {
  return <CancellationSubmittedPage />
}
