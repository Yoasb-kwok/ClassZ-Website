import { fetchSitePage } from "@/lib/site-pages"
import { TermsPageView } from "@/components/policy/terms-page-view"

export const revalidate = 60

export default async function TermsPage() {
    const page = await fetchSitePage("terms")

    return (
        <TermsPageView
            blocks={page.blocks}
            lastUpdated={page.last_updated_en ?? null}
        />
    )
}
