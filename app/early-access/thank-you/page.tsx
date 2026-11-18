import { generateMetadata } from "@/lib/metadata"
import { ThankYouPage } from "@/components/info/thank-you-page"

export const metadata = generateMetadata({
  title: "You’re all set",
  description: "The ClassZ team will review your details and contact you with the right next step.",
  url: "/early-access/thank-you",
})

export default function Page() {
  return <ThankYouPage />
}
