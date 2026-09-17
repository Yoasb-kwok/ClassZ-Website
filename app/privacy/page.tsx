import { fetchSitePage } from "@/lib/site-pages"
import { PrivacyPageView } from "@/components/policy/privacy-page-view"

export const revalidate = 60

export default async function PrivacyPage() {
  const page = await fetchSitePage("privacy")

  return (
    <PrivacyPageView
      blocks={page.blocks}
      lastUpdated={page.last_updated_en ?? null}
    />
  )
}
