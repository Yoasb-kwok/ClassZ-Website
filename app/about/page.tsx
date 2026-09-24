import { generateMetadata } from "@/lib/metadata";
import { AboutPage } from "@/components/info/about-page";
import { fetchSitePage } from "@/lib/site-pages";
import { AboutCmsView } from "@/components/info/about-cms-view";

/**
 * ADR-004 Decision 1 puts /about in the CMS. The page renders the blocks
 * authored in /admin/cms/about; the static marketing page stays as the
 * fallback while the CMS copy is still empty, so the seeded demo placeholder
 * ("Welcome to our studio") never reaches the public page.
 */
export const metadata = generateMetadata({
  title: "About Us",
  description:
    "One platform. A more connected learning ecosystem for families, children, and learning centres.",
  url: "/about",
});

export const revalidate = 60;

export default async function Page() {
  const page = await fetchSitePage("about");
  const blocks = page.blocks.filter((block) => {
    if (block.type !== "rich_text" && block.type !== "image_split")
      return false;
    return true;
  });
  // The seed placeholder is a single image_split block with null image_url and
  // the "Welcome to our studio" copy — treat it as "nothing authored yet".
  const isPlaceholder =
    blocks.length === 1 &&
    blocks[0].type === "image_split" &&
    !blocks[0].image_url &&
    /welcome to our studio/i.test(blocks[0].body_html ?? "");

  if (blocks.length > 0 && !isPlaceholder) {
    return (
      <AboutCmsView
        blocks={page.blocks}
        lastUpdated={page.updated_at ?? null}
      />
    );
  }
  return <AboutPage />;
}
