import { generateMetadata } from "@/lib/metadata";
import { AboutPage } from "@/components/info/about-page";

/**
 * About Us editing is retired (user decision 2026-09-24): the page is static
 * marketing content and is no longer CMS-backed. /admin/cms/about and its nav
 * entry were removed; the cms_pages('about') row (seeded demo placeholder) is
 * simply left unread. The public site-pages facade still exposes the key.
 */
export const metadata = generateMetadata({
  title: "About Us",
  description:
    "One platform. A more connected learning ecosystem for families, children, and learning centres.",
  url: "/about",
});

export default function Page() {
  return <AboutPage />;
}
