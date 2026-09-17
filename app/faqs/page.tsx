import { fetchSitePage } from "@/lib/site-pages"
import type { FaqItemBlock } from "@/lib/site-pages"
import { FaqsPageContent } from "@/components/info/faqs-page-content"
import { generateMetadata } from "@/lib/metadata"

export const revalidate = 60

export const metadata = generateMetadata({
  title: "FAQs",
  description:
    "Answers for parents and learning centres — enrolment, payments, refunds, bad weather arrangements and more.",
  url: "/faqs",
})

export default async function Page() {
  const page = await fetchSitePage("faqs")
  const items = page.blocks.filter((b): b is FaqItemBlock => b.type === "faq_item")

  return <FaqsPageContent items={items} intro={page.intro} />
}
