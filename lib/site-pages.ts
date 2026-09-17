/**
 * Site pages: types + server-side fetch of the API facade (ADR-004 Decision 7).
 *
 * Public pages fetch GET /api/site-pages/:pageKey with a 60s revalidate window.
 * The backend pings POST /api/revalidate after saves so content appears
 * immediately; the window is the fallback.
 */

export type SitePageKey = "about" | "terms" | "privacy" | "faqs" | "contact";

export type SiteLocale = "en" | "zh-TW" | "zh-CN";

export type BlockImage = { src: string; alt?: string | null };

type I18nText = string | null;

export type RichTextBlock = {
  id: string;
  type: "rich_text";
  schemaVersion?: number;
  title?: I18nText;
  title_zh_tw?: I18nText;
  title_zh_cn?: I18nText;
  body_html: string;
  body_html_zh_tw?: I18nText;
  body_html_zh_cn?: I18nText;
};

export type ImageSplitBlock = {
  id: string;
  type: "image_split";
  schemaVersion?: number;
  layout: "split-image-left" | "split-image-right" | string;
  image_url?: string | null;
  image_alt?: I18nText;
  body_html: string;
  body_html_zh_tw?: I18nText;
  body_html_zh_cn?: I18nText;
};

export type FaqItemBlock = {
  id: string;
  type: "faq_item";
  element_id?: number;
  schemaVersion?: number;
  question: string;
  question_zh_tw?: I18nText;
  question_zh_cn?: I18nText;
  answer_html: string;
  answer_html_zh_tw?: I18nText;
  answer_html_zh_cn?: I18nText;
  images?: BlockImage[] | null;
  audience?: "parents" | "centres";
  display_order?: number;
  is_active?: boolean;
};

export type BranchBlock = {
  id: string;
  type: "branch";
  element_id?: number;
  schemaVersion?: number;
  name: string;
  name_zh_tw?: I18nText;
  name_zh_cn?: I18nText;
  address?: I18nText;
  address_zh_tw?: I18nText;
  address_zh_cn?: I18nText;
  hours?: I18nText;
  hours_zh_tw?: I18nText;
  hours_zh_cn?: I18nText;
  map_query?: I18nText;
  image_url?: I18nText;
  display_order?: number;
  is_active?: boolean;
};

export type CtaBlock = {
  id: string;
  type: "cta";
  schemaVersion?: number;
  label: string;
  label_zh_tw?: I18nText;
  label_zh_cn?: I18nText;
  href: string;
  style?: I18nText;
};

export type SiteBlock =
  | RichTextBlock
  | ImageSplitBlock
  | FaqItemBlock
  | BranchBlock
  | CtaBlock;

export type SitePage = {
  page_key: SitePageKey;
  schemaVersion: number;
  title_zh: string | null;
  title_en: string | null;
  intro: string | null;
  last_updated_en?: string | null;
  last_updated_zh_tw?: string | null;
  blocks: SiteBlock[];
  updated_at?: string | null;
};

import { getBackendOrigin } from "@/lib/backend-origin"

function backendOrigin(): string {
  // Single source of truth with the catch-all proxy (lib/backend-origin.ts).
  return getBackendOrigin()
}

/** Fallback content shown when the API is unreachable (the ISR cache usually covers this). */
const EMPTY_PAGE = (pageKey: SitePageKey): SitePage => ({
  page_key: pageKey,
  schemaVersion: 1,
  title_zh: null,
  title_en: null,
  intro: null,
  blocks: [],
});

/**
 * Server-side fetch of one site page. Never throws: on API failure the page
 * renders with no blocks rather than erroring (SEO/availability first).
 */
export async function fetchSitePage(pageKey: SitePageKey): Promise<SitePage> {
  try {
    const res = await fetch(`${backendOrigin()}/api/site-pages/${pageKey}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return EMPTY_PAGE(pageKey);
    const json = (await res.json()) as { success?: boolean; data?: SitePage };
    if (!json?.success || !json.data) return EMPTY_PAGE(pageKey);
    return { ...json.data, blocks: Array.isArray(json.data.blocks) ? json.data.blocks : [] };
  } catch {
    return EMPTY_PAGE(pageKey);
  }
}

const LOCALE_SUFFIX: Record<string, string> = {
  "zh-TW": "_zh_tw",
  "zh-CN": "_zh_cn",
};

/**
 * Resolve a translatable block field for a locale.
 * Exact locale -> English. No zh-TW/zh-CN folding (ADR-004 Decision 4).
 */
export function pickText<T extends Record<string, unknown>>(
  block: T,
  field: string,
  locale: string
): string {
  const base = block[field];
  const lang = String(locale || "en");
  if (lang !== "en") {
    const suffix = LOCALE_SUFFIX[lang];
    if (suffix) {
      const variant = block[`${field}${suffix}`];
      if (typeof variant === "string" && variant.trim()) return variant;
    }
  }
  return typeof base === "string" ? base : "";
}

export function isBlockType<T extends SiteBlock["type"]>(
  block: SiteBlock,
  type: T
): block is Extract<SiteBlock, { type: T }> {
  return block.type === type;
}
