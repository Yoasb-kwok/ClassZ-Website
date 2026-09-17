import { ContactUsView } from "@/components/info/contact-us-view"
import { BlockRenderer } from "@/components/cms/block-renderer"
import { fetchSitePage } from "@/lib/site-pages"
import { generateMetadata } from "@/lib/metadata"

export const revalidate = 60

export const metadata = generateMetadata({
  title: "Contact Us",
  description:
    "Questions, feedback or need assistance? Send us a message and our team will get back to you.",
  url: "/contact-us",
})

export default async function Page() {
  const page = await fetchSitePage("contact")
  const hasBranches = page.blocks.length > 0

  return (
    <ContactUsView>
      {/*
        ADR-004 Decision 3: the contact page header (contact_page) and branch
        rows (contact_branches) are CMS content; the form above stays static.
      */}
      {hasBranches ? (
        <section className="bg-[#F9FBFD] py-14">
          <div className="mx-auto max-w-[1080px] px-6 md:px-10">
            <h2 className="mb-8 text-center text-2xl font-bold text-[#111929] md:text-3xl">
              {page.title_en || "Our locations"}
            </h2>
            <BlockRenderer blocks={page.blocks} className="grid gap-6 md:grid-cols-2" />
          </div>
        </section>
      ) : null}
    </ContactUsView>
  )
}
