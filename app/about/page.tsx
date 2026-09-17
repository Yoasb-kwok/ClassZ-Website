import { generateMetadata } from "@/lib/metadata"
import { AboutPage } from "@/components/info/about-page"

/**
 * ADR-004 Decision 1 puts /about in the CMS, but the database currently holds
 * only the demo placeholder block for this page ("Welcome to our studio" —
 * seeded by init-db / split_site_content_to_dedicated_tables). Rendering that
 * would put placeholder copy on a public page, so the CMS region stays off
 * until real content is authored as blocks.
 *
 * To enable: author the about blocks via /admin/cms/about, then render the
 * fetched blocks (see commit history for the previous wiring, or ADR-004
 * Decision 9 review trigger).
 */
export const metadata = generateMetadata({
  title: "About Us",
  description:
    "One platform. A more connected learning ecosystem for families, children, and learning centres.",
  url: "/about",
})

export default function Page() {
  return <AboutPage />
}
