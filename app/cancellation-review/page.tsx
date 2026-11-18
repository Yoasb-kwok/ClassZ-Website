import { generateMetadata } from "@/lib/metadata"
import { CancellationReviewPage } from "@/components/info/cancellation-review-page"

export const metadata = generateMetadata({
  title: "Request a cancellation review",
  description:
    "Ask ClassZ Customer Support to review a class cancellation or refund for exceptional circumstances.",
  url: "/cancellation-review",
})

export default function Page() {
  return <CancellationReviewPage />
}
