/**
 * PageEditor data model (ADR-004 Decisions 2, 4, 5, 6, 8).
 *
 * Types + pure helpers shared by the editor shell, the element stack and the
 * preview pane: language suffixes, block/item drafts, and the row <-> payload
 * mapping used against /api/admin/*.
 *
 * Kept free of React and of network calls so it stays easy to read.
 */

import type { BlockImage, SiteBlock } from "@/lib/site-pages";

// --- Languages (Decision 4: inline suffixed fields) ---

export type EditorLanguage = "en" | "zh-TW" | "zh-CN";

export type LanguageOption = {
  id: EditorLanguage;
  /** Compact label for the language toggles. */
  short: string;
  label: string;
  /** Field-name suffix for the inline i18n columns. */
  suffix: string;
};

export const LANGUAGES: LanguageOption[] = [
  { id: "en", short: "EN", label: "English", suffix: "" },
  { id: "zh-TW", short: "繁", label: "繁體中文 (zh-TW)", suffix: "_zh_tw" },
  { id: "zh-CN", short: "简", label: "简体中文 (zh-CN)", suffix: "_zh_cn" },
];

export function languageMeta(language: EditorLanguage): LanguageOption {
  return LANGUAGES.find((option) => option.id === language) ?? LANGUAGES[0];
}

/** Physical field name for a translatable base field in one language. */
export function fieldName(base: string, language: EditorLanguage): string {
  return `${base}${languageMeta(language).suffix}`;
}

// --- Reading drafts (blocks, rows and raw API payloads) ---

export function readText(record: object, name: string): string {
  const value = (record as Record<string, unknown>)[name];
  return typeof value === "string" ? value : "";
}

export function hasText(record: object, name: string): boolean {
  return readText(record, name).trim().length > 0;
}

export function hasStringField(record: object, name: string): boolean {
  return typeof (record as Record<string, unknown>)[name] === "string";
}

export function readNullable(record: object, name: string): string | null {
  const value = readText(record, name);
  return value.trim() ? value : null;
}

export function readNumber(record: object, name: string): number {
  const value = Number((record as Record<string, unknown>)[name]);
  return Number.isFinite(value) ? value : 0;
}

export function readBoolean(record: object, name: string): boolean {
  return Boolean((record as Record<string, unknown>)[name]);
}

/** Exact locale -> English fallback (same rule as the renderer). */
export function translate(
  record: object,
  base: string,
  language: EditorLanguage,
): string {
  return readText(record, fieldName(base, language)) || readText(record, base);
}

function toImage(entry: unknown): BlockImage | null {
  if (!entry || typeof entry !== "object") return null;
  const src = (entry as { src?: unknown }).src;
  const alt = (entry as { alt?: unknown }).alt;
  return {
    src: typeof src === "string" ? src : "",
    alt: typeof alt === "string" ? alt : null,
  };
}

export function readImages(record: object): BlockImage[] {
  const raw = (record as Record<string, unknown>).images;
  if (!Array.isArray(raw)) return [];
  return raw
    .map(toImage)
    .filter((image): image is BlockImage => image !== null);
}

/**
 * Rows without a src are dropped: the API rejects an empty src and the renderer
 * would show a broken image.
 */
export function cleanImages(
  images: BlockImage[] | null | undefined,
): BlockImage[] {
  return (Array.isArray(images) ? images : [])
    .map((image) => ({
      src: String(image?.src ?? "").trim(),
      alt:
        typeof image?.alt === "string" && image.alt.trim() ? image.alt : null,
    }))
    .filter((image) => image.src.length > 0);
}

// --- Editable blocks ---

export type BlockType = SiteBlock["type"];

export const BLOCK_TYPES: BlockType[] = [
  "rich_text",
  "image_split",
  "faq_item",
  "branch",
  "cta",
];

/** A patch is always a flat, field-name-keyed write onto the current draft. */
export type DraftValue =
  string | number | boolean | null | undefined | BlockImage[];
export type BlockPatch = Record<string, DraftValue>;

let blockCounter = 0;

/** Client-side block id; the API only requires uniqueness within the page. */
export function newBlockId(type: BlockType): string {
  blockCounter += 1;
  return `${type}-${Date.now().toString(36)}-${blockCounter}`;
}

/** Legacy blocks carry no `type`/`schemaVersion` (mirrors helpers/cmsBlocks.js). */
function inferBlockType(block: Record<string, unknown>): BlockType {
  const declared = block.type;
  if (
    typeof declared === "string" &&
    (BLOCK_TYPES as string[]).includes(declared)
  ) {
    return declared as BlockType;
  }
  if (
    block.layout !== undefined ||
    ("image_url" in block && "body_html" in block)
  )
    return "image_split";
  if ("question" in block) return "faq_item";
  if ("name" in block && !("body_html" in block)) return "branch";
  if ("label" in block && "href" in block) return "cta";
  return "rich_text";
}

/** Required-but-may-be-empty strings (mirrors the API's REQUIRED_STRING_FIELDS). */
const REQUIRED_STRING_FIELDS: Partial<Record<BlockType, string[]>> = {
  rich_text: ["body_html"],
  image_split: ["body_html"],
  faq_item: ["answer_html"],
};

/** Page document stored in cms_pages.content_json. */
export function parseContentJson(raw: unknown): {
  blocks: unknown[];
  doc: Record<string, unknown>;
} {
  let parsed: unknown = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }
  }
  if (Array.isArray(parsed)) return { blocks: parsed, doc: {} };
  if (parsed && typeof parsed === "object") {
    const doc = parsed as Record<string, unknown>;
    return { blocks: Array.isArray(doc.blocks) ? doc.blocks : [], doc };
  }
  return { blocks: [], doc: {} };
}

/**
 * Bring a stored block list into the editable shape: a known `type`, a unique
 * id and any missing "required string" field padded so a save is not rejected
 * for a legacy block the editor never touched.
 */
export function normalizeBlocks(raw: unknown[]): SiteBlock[] {
  const seen = new Set<string>();
  const blocks: SiteBlock[] = [];

  raw.forEach((entry, index) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return;
    const source = { ...(entry as Record<string, unknown>) };
    const type = inferBlockType(source);

    let id =
      typeof source.id === "string" && source.id.trim()
        ? source.id
        : `block-${index + 1}`;
    while (seen.has(id)) id = `${id}-copy`;
    seen.add(id);

    for (const field of REQUIRED_STRING_FIELDS[type] ?? []) {
      if (!hasStringField(source, field)) source[field] = "";
    }

    blocks.push({ ...source, id, type, schemaVersion: 1 } as SiteBlock);
  });

  return blocks;
}

// --- FAQ / branch rows (Decision 3: item pages are row-backed) ---

export type ItemMode = "faq" | "contact";

/** One row of faq_items / contact_branches, normalized for the editor. */
export type ItemRow = {
  id: string;
  display_order: number;
  is_active: boolean;
  [field: string]: unknown;
};

export function newRowDraft(mode: ItemMode, zh: boolean): ItemRow {
  const base = { id: "", display_order: 0, is_active: true };
  if (mode === "faq") {
    return {
      ...base,
      question: zh ? "新問題" : "New question",
      question_zh_tw: null,
      question_zh_cn: null,
      answer_html: "<p></p>",
      answer_html_zh_tw: null,
      answer_html_zh_cn: null,
      images: [] as BlockImage[],
    };
  }
  return {
    ...base,
    name: zh ? "新分店" : "New branch",
    name_zh_tw: null,
    name_zh_cn: null,
    address: "",
    address_zh_tw: null,
    address_zh_cn: null,
    hours: "",
    hours_zh_tw: null,
    hours_zh_cn: null,
    image_url: "",
    map_query: "",
  };
}

/** API row -> editor row. */
export function rowFromApi(raw: unknown, mode: ItemMode): ItemRow {
  const record = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const base = {
    id: record.id != null ? String(record.id) : "",
    display_order: readNumber(record, "display_order"),
    is_active: Boolean(record.is_active),
  };
  if (mode === "faq") {
    return {
      ...base,
      question: readText(record, "question"),
      question_zh_tw: readNullable(record, "question_zh_tw"),
      question_zh_cn: readNullable(record, "question_zh_cn"),
      answer_html: readText(record, "answer_html"),
      answer_html_zh_tw: readNullable(record, "answer_html_zh_tw"),
      answer_html_zh_cn: readNullable(record, "answer_html_zh_cn"),
      images: readImages(record),
    };
  }
  return {
    ...base,
    name: readText(record, "name"),
    name_zh_tw: readNullable(record, "name_zh_tw"),
    name_zh_cn: readNullable(record, "name_zh_cn"),
    address: readText(record, "address"),
    address_zh_tw: readNullable(record, "address_zh_tw"),
    address_zh_cn: readNullable(record, "address_zh_cn"),
    hours: readText(record, "hours"),
    hours_zh_tw: readNullable(record, "hours_zh_tw"),
    hours_zh_cn: readNullable(record, "hours_zh_cn"),
    image_url: readText(record, "image_url"),
    map_query: readText(record, "map_query"),
  };
}

/** Editor row -> the block shape the shared renderer and element forms expect. */
export function rowAsBlock(row: ItemRow, mode: ItemMode): SiteBlock {
  const elementId = Number(row.id);
  if (mode === "faq") {
    return {
      id: `faq-${row.id}`,
      element_id: Number.isFinite(elementId) ? elementId : undefined,
      type: "faq_item",
      schemaVersion: 1,
      question: readText(row, "question"),
      question_zh_tw: readNullable(row, "question_zh_tw"),
      question_zh_cn: readNullable(row, "question_zh_cn"),
      answer_html: readText(row, "answer_html"),
      answer_html_zh_tw: readNullable(row, "answer_html_zh_tw"),
      answer_html_zh_cn: readNullable(row, "answer_html_zh_cn"),
      images: readImages(row),
      display_order: row.display_order,
      is_active: row.is_active,
    };
  }
  return {
    id: `branch-${row.id}`,
    element_id: Number.isFinite(elementId) ? elementId : undefined,
    type: "branch",
    schemaVersion: 1,
    name: readText(row, "name"),
    name_zh_tw: readNullable(row, "name_zh_tw"),
    name_zh_cn: readNullable(row, "name_zh_cn"),
    address: readText(row, "address"),
    address_zh_tw: readNullable(row, "address_zh_tw"),
    address_zh_cn: readNullable(row, "address_zh_cn"),
    hours: readText(row, "hours"),
    hours_zh_tw: readNullable(row, "hours_zh_tw"),
    hours_zh_cn: readNullable(row, "hours_zh_cn"),
    image_url: readText(row, "image_url"),
    map_query: readText(row, "map_query"),
    display_order: row.display_order,
    is_active: row.is_active,
  };
}

/** Editor row -> POST/PATCH body. Create omits display_order so the API appends. */
export function rowPayload(
  row: ItemRow,
  mode: ItemMode,
  options: { includeOrder?: boolean } = {},
): Record<string, unknown> {
  const images = cleanImages(readImages(row));
  const fields =
    mode === "faq"
      ? {
          question: readText(row, "question"),
          question_zh_tw: readNullable(row, "question_zh_tw"),
          question_zh_cn: readNullable(row, "question_zh_cn"),
          answer_html: readText(row, "answer_html"),
          answer_html_zh_tw: readNullable(row, "answer_html_zh_tw"),
          answer_html_zh_cn: readNullable(row, "answer_html_zh_cn"),
          images: images.length ? images : null,
        }
      : {
          name: readText(row, "name"),
          name_zh_tw: readNullable(row, "name_zh_tw"),
          name_zh_cn: readNullable(row, "name_zh_cn"),
          address: readText(row, "address"),
          address_zh_tw: readNullable(row, "address_zh_tw"),
          address_zh_cn: readNullable(row, "address_zh_cn"),
          hours: readText(row, "hours"),
          hours_zh_tw: readNullable(row, "hours_zh_tw"),
          hours_zh_cn: readNullable(row, "hours_zh_cn"),
          image_url: readText(row, "image_url"),
          map_query: readText(row, "map_query"),
        };

  return {
    ...fields,
    ...(options.includeOrder === false
      ? {}
      : { display_order: row.display_order }),
    is_active: row.is_active,
  };
}

/** Seeded convention (Decision 8): display_order < 100 -> parents tab. */
export function audienceFor(displayOrder: number): "parents" | "centres" {
  return Number(displayOrder) < 100 ? "parents" : "centres";
}

/**
 * The rendering/saving view of a block: a half-typed image row never reaches
 * the public renderer (broken <img>) or the API (rejects an empty src).
 */
export function sanitizeBlock(block: SiteBlock): SiteBlock {
  if (block.type !== "faq_item") return block;
  const images = cleanImages(block.images);
  return { ...block, images: images.length ? images : null };
}

// --- Page meta ---

export type PageEditorKey =
  "landing" | "about" | "terms" | "privacy" | "faq" | "contact";
export type PageEditorMode = "blocks" | "items";

export type PageMeta = {
  mode: PageEditorMode;
  /** Null for the three block pages. */
  itemMode: ItemMode | null;
  /** Public route, for the "view page" link. */
  publicPath: string;
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
};

export const PAGE_META: Record<PageEditorKey, PageMeta> = {
  landing: {
    mode: "blocks",
    itemMode: null,
    publicPath: "/",
    titleZh: "首頁",
    titleEn: "Landing page",
    descriptionZh:
      "編輯首頁各區塊文字，右側即時預覽。未填寫的區塊會使用預設文案。",
    descriptionEn:
      "Edit the landing sections with a live preview. Sections left empty fall back to the default copy.",
  },
  about: {
    mode: "blocks",
    itemMode: null,
    publicPath: "/about",
    titleZh: "關於我們",
    titleEn: "About us",
    descriptionZh: "逐個元素編輯內容，右側即時預覽。",
    descriptionEn: "Edit the page element by element with a live preview.",
  },
  terms: {
    mode: "blocks",
    itemMode: null,
    publicPath: "/terms",
    titleZh: "條款細則",
    titleEn: "Terms",
    descriptionZh: "逐個元素編輯內容，右側即時預覽。",
    descriptionEn: "Edit the page element by element with a live preview.",
  },
  privacy: {
    mode: "blocks",
    itemMode: null,
    publicPath: "/privacy",
    titleZh: "私隱政策",
    titleEn: "Privacy policy",
    descriptionZh: "逐個元素編輯內容，右側即時預覽。",
    descriptionEn: "Edit the page element by element with a live preview.",
  },
  faq: {
    mode: "items",
    itemMode: "faq",
    publicPath: "/faqs",
    titleZh: "常見問題",
    titleEn: "FAQ",
    descriptionZh: "每個問題是一行資料，儲存後即時生效。",
    descriptionEn: "Each question is its own row and saves on its own.",
  },
  contact: {
    mode: "items",
    itemMode: "contact",
    publicPath: "/contact-us",
    titleZh: "聯絡我們",
    titleEn: "Contact",
    descriptionZh: "每個分店是一行資料，儲存後即時生效。",
    descriptionEn: "Each branch is its own row and saves on its own.",
  },
};
