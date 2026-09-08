import { generateMetadata } from "@/lib/metadata"
import { ZPassportPage } from "@/components/info/zpassport-page"

export const metadata = generateMetadata({
  title: "ZPassport",
  description: "Everything meaningful from class, kept connected. One child. Many classes. One learning passport.",
  url: "/zpassport",
})

export default function Page() {
  return <ZPassportPage />
}
