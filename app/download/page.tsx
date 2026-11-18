import { generateMetadata } from "@/lib/metadata"
import { DownloadPage } from "@/components/info/download-page"

export const metadata = generateMetadata({
  title: "Download ClassZ",
  description: "ClassZ, wherever learning happens.",
  url: "/download",
})

export default function Page() {
  return <DownloadPage />
}
