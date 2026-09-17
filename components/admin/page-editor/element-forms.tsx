"use client"

import { ChevronDown, Plus } from "lucide-react"
import type { SiteBlock } from "@/lib/site-pages"
import { useLanguage } from "@/components/language-provider"
import { AdminGhostButton, AdminInput, AdminLabel, AdminSelect, AdminStatusChip, type BrandTone } from "@/components/classz-admin-ui"
import { LanguageField } from "./language-field"
import { ImageListField, ImageUrlField } from "./image-list-field"
import {
  BLOCK_TYPES,
  hasStringField,
  hasText,
  newBlockId,
  readImages,
  readText,
  fieldName,
  type BlockPatch,
  type BlockType,
  type EditorLanguage,
} from "./model"

/**
 * Per-type element forms (ADR-004 Decision 2/6) plus the block factories and
 * the client-side mirror of the API's block validation, so an obviously
 * invalid element is pointed out before the round-trip.
 */

export type BlockTypeMeta = {
  label: string
  labelZh: string
  hint: string
  hintZh: string
  tone: BrandTone
  /** Field used for the card summary line and the translation dots. */
  summaryField: string
  /** Must be non-empty (API: REQUIRED_FIELDS). */
  requiredText: string[]
  /** Must exist as a string, may be empty (API: REQUIRED_STRING_FIELDS). */
  requiredStrings: string[]
}

export const BLOCK_TYPE_META: Record<BlockType, BlockTypeMeta> = {
  rich_text: {
    label: "Rich text",
    labelZh: "文字段落",
    hint: "Heading plus an HTML body",
    hintZh: "標題加上 HTML 內容",
    tone: "teal",
    summaryField: "title",
    requiredText: [],
    requiredStrings: ["body_html"],
  },
  image_split: {
    label: "Image + text",
    labelZh: "圖文左右",
    hint: "An image beside an HTML body",
    hintZh: "圖片與內容左右並排",
    tone: "magenta",
    summaryField: "image_alt",
    requiredText: [],
    requiredStrings: ["body_html"],
  },
  faq_item: {
    label: "FAQ item",
    labelZh: "問答項目",
    hint: "Question, rich answer and an optional screenshot gallery",
    hintZh: "問題、詳細答案與截圖集",
    tone: "orange",
    summaryField: "question",
    requiredText: ["question"],
    requiredStrings: ["answer_html"],
  },
  branch: {
    label: "Branch",
    labelZh: "分店",
    hint: "Name, address, opening hours and a map link",
    hintZh: "名稱、地址、營業時間與地圖",
    tone: "slate",
    summaryField: "name",
    requiredText: ["name"],
    requiredStrings: [],
  },
  cta: {
    label: "Call to action",
    labelZh: "行動按鈕",
    hint: "A labelled link button",
    hintZh: "帶文字的連結按鈕",
    tone: "coral",
    summaryField: "label",
    requiredText: ["label", "href"],
    requiredStrings: [],
  },
}

export function createBlock(type: BlockType): SiteBlock {
  const id = newBlockId(type)
  switch (type) {
    case "image_split":
      return {
        id,
        type,
        schemaVersion: 1,
        layout: "split-image-left",
        image_url: null,
        image_alt: null,
        body_html: "<p></p>",
      }
    case "faq_item":
      return {
        id,
        type,
        schemaVersion: 1,
        question: "",
        question_zh_tw: null,
        question_zh_cn: null,
        answer_html: "<p></p>",
        answer_html_zh_tw: null,
        answer_html_zh_cn: null,
        images: [],
      }
    case "branch":
      return {
        id,
        type,
        schemaVersion: 1,
        name: "",
        name_zh_tw: null,
        name_zh_cn: null,
        address: "",
        address_zh_tw: null,
        address_zh_cn: null,
        hours: "",
        hours_zh_tw: null,
        hours_zh_cn: null,
        map_query: null,
        image_url: null,
        is_active: true,
      }
    case "cta":
      return {
        id,
        type,
        schemaVersion: 1,
        label: "",
        label_zh_tw: null,
        label_zh_cn: null,
        href: "/",
        style: null,
      }
    case "rich_text":
    default:
      return { id, type: "rich_text", schemaVersion: 1, title: "", title_zh_tw: null, title_zh_cn: null, body_html: "<p></p>" }
  }
}

/** One-line card summary: the element's own words, HTML stripped. */
export function summarizeBlock(block: SiteBlock, language: EditorLanguage): string {
  const meta = BLOCK_TYPE_META[block.type]
  const raw =
    readText(block, fieldName(meta.summaryField, language)) ||
    readText(block, fieldName(meta.summaryField, "en")) ||
    readText(block, fieldName("body_html", language)) ||
    readText(block, fieldName("body_html", "en"))

  const text = raw
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  if (!text) return "Empty element — open it to add content."
  return text.length > 120 ? `${text.slice(0, 120)}…` : text
}

/** Which language variants of this element's headline field are filled. */
export function translationState(block: SiteBlock): { language: EditorLanguage; filled: boolean }[] {
  const meta = BLOCK_TYPE_META[block.type]
  return [
    { language: "en" as EditorLanguage, filled: hasText(block, meta.summaryField) },
    { language: "zh-TW" as EditorLanguage, filled: hasText(block, fieldName(meta.summaryField, "zh-TW")) },
    { language: "zh-CN" as EditorLanguage, filled: hasText(block, fieldName(meta.summaryField, "zh-CN")) },
  ]
}

/** Mirrors the API's validateSitePageDoc for the rules a human can fix. */
export function validateBlocks(blocks: SiteBlock[]): { id: string; message: string } | null {
  const seen = new Set<string>()

  for (const [index, block] of blocks.entries()) {
    const position = index + 1
    const meta = BLOCK_TYPE_META[block.type]

    if (!block.id.trim()) return { id: block.id, message: `Element ${position} has no id.` }
    if (seen.has(block.id)) return { id: block.id, message: `Element ${position} reuses the id "${block.id}".` }
    seen.add(block.id)

    for (const field of meta.requiredText) {
      if (!hasText(block, field)) {
        return { id: block.id, message: `Element ${position} (${meta.label}) needs a value for ${field}.` }
      }
    }
    for (const field of meta.requiredStrings) {
      if (!hasStringField(block, field)) {
        return { id: block.id, message: `Element ${position} (${meta.label}) is missing ${field}.` }
      }
    }
    if (block.type === "image_split" && !["split-image-left", "split-image-right"].includes(String(block.layout))) {
      return { id: block.id, message: `Element ${position} layout must be split-image-left or split-image-right.` }
    }
  }

  return null
}

// --- Per-type forms ---

type FormProps<T extends SiteBlock> = {
  block: T
  language: EditorLanguage
  onLanguageChange: (language: EditorLanguage) => void
  onPatch: (patch: BlockPatch) => void
  /** Items mode: display_order / is_active are row-level and shown on the card. */
  hideRowFields?: boolean
}

function RichTextForm({ block, language, onLanguageChange, onPatch }: FormProps<Extract<SiteBlock, { type: "rich_text" }>>) {
  return (
    <div className="space-y-4">
      <LanguageField
        label="Title"
        record={block}
        field="title"
        language={language}
        onLanguageChange={onLanguageChange}
        onPatch={onPatch}
        placeholder="Optional heading"
      />
      <LanguageField
        label="Body (HTML)"
        record={block}
        field="body_html"
        language={language}
        onLanguageChange={onLanguageChange}
        onPatch={onPatch}
        multiline
      />
    </div>
  )
}

function ImageSplitForm({
  block,
  language,
  onLanguageChange,
  onPatch,
}: FormProps<Extract<SiteBlock, { type: "image_split" }>>) {
  return (
    <div className="space-y-4">
      <div>
        <AdminLabel>Layout</AdminLabel>
        <AdminSelect value={String(block.layout)} onChange={(event) => onPatch({ layout: event.target.value })}>
          <option value="split-image-left">Image on the left</option>
          <option value="split-image-right">Image on the right</option>
        </AdminSelect>
      </div>
      <ImageUrlField
        label="Image"
        value={readText(block, "image_url")}
        onChange={(value) => onPatch({ image_url: value })}
      />
      <LanguageField
        label="Image alt text"
        record={block}
        field="image_alt"
        language={language}
        onLanguageChange={onLanguageChange}
        onPatch={onPatch}
        placeholder="Describes the image for screen readers and SEO"
      />
      <LanguageField
        label="Body (HTML)"
        record={block}
        field="body_html"
        language={language}
        onLanguageChange={onLanguageChange}
        onPatch={onPatch}
        multiline
      />
    </div>
  )
}

function FaqItemForm({ block, language, onLanguageChange, onPatch }: FormProps<Extract<SiteBlock, { type: "faq_item" }>>) {
  return (
    <div className="space-y-4">
      <LanguageField
        label="Question"
        record={block}
        field="question"
        language={language}
        onLanguageChange={onLanguageChange}
        onPatch={onPatch}
      />
      <LanguageField
        label="Answer (HTML)"
        record={block}
        field="answer_html"
        language={language}
        onLanguageChange={onLanguageChange}
        onPatch={onPatch}
        multiline
      />
      <ImageListField
        images={readImages(block)}
        onChange={(images) => onPatch({ images })}
        hint="Shown under the answer — useful for step-by-step walkthrough screenshots."
      />
    </div>
  )
}

function BranchForm({ block, language, onLanguageChange, onPatch, hideRowFields }: FormProps<Extract<SiteBlock, { type: "branch" }>>) {
  return (
    <div className="space-y-4">
      <LanguageField
        label="Name"
        record={block}
        field="name"
        language={language}
        onLanguageChange={onLanguageChange}
        onPatch={onPatch}
      />
      <LanguageField
        label="Address"
        record={block}
        field="address"
        language={language}
        onLanguageChange={onLanguageChange}
        onPatch={onPatch}
        multiline
        rows={3}
      />
      <LanguageField
        label="Opening hours"
        record={block}
        field="hours"
        language={language}
        onLanguageChange={onLanguageChange}
        onPatch={onPatch}
        placeholder="Mon–Fri 10:00–19:00"
      />
      <ImageUrlField
        label="Photo"
        value={readText(block, "image_url")}
        onChange={(value) => onPatch({ image_url: value })}
      />
      <div>
        <AdminLabel>Map search query</AdminLabel>
        <AdminInput
          value={readText(block, "map_query")}
          placeholder="Defaults to the address"
          onChange={(event) => onPatch({ map_query: event.target.value })}
        />
      </div>
      {hideRowFields ? null : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <AdminLabel>Display order</AdminLabel>
            <AdminInput
              type="number"
              value={String(block.display_order ?? "")}
              onChange={(event) =>
                onPatch({ display_order: event.target.value === "" ? undefined : Number(event.target.value) })
              }
            />
          </div>
          <label className="flex items-center gap-2 self-end pb-2.5 text-sm text-classz-700">
            <input
              type="checkbox"
              checked={block.is_active !== false}
              onChange={(event) => onPatch({ is_active: event.target.checked })}
            />
            Published
          </label>
        </div>
      )}
    </div>
  )
}

function CtaForm({ block, language, onLanguageChange, onPatch }: FormProps<Extract<SiteBlock, { type: "cta" }>>) {
  return (
    <div className="space-y-4">
      <LanguageField
        label="Label"
        record={block}
        field="label"
        language={language}
        onLanguageChange={onLanguageChange}
        onPatch={onPatch}
      />
      <div>
        <AdminLabel>Link</AdminLabel>
        <AdminInput
          value={block.href}
          placeholder="/register-center"
          onChange={(event) => onPatch({ href: event.target.value })}
        />
      </div>
      <div>
        <AdminLabel>Style</AdminLabel>
        <AdminInput
          value={readText(block, "style")}
          placeholder="primary"
          onChange={(event) => onPatch({ style: event.target.value })}
        />
      </div>
    </div>
  )
}

export function ElementForm({
  block,
  language,
  onLanguageChange,
  onPatch,
  hideRowFields,
}: {
  block: SiteBlock
  language: EditorLanguage
  onLanguageChange: (language: EditorLanguage) => void
  onPatch: (patch: BlockPatch) => void
  hideRowFields?: boolean
}) {
  const shared = { language, onLanguageChange, onPatch, hideRowFields }

  switch (block.type) {
    case "rich_text":
      return <RichTextForm block={block} {...shared} />
    case "image_split":
      return <ImageSplitForm block={block} {...shared} />
    case "faq_item":
      return <FaqItemForm block={block} {...shared} />
    case "branch":
      return <BranchForm block={block} {...shared} />
    case "cta":
      return <CtaForm block={block} {...shared} />
    default:
      return null
  }
}

// --- Add element picker ---

export function AddElementPicker({
  open,
  onToggle,
  onPick,
}: {
  open: boolean
  onToggle: () => void
  onPick: (type: BlockType) => void
}) {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"

  return (
    <div className="rounded-xl border border-dashed border-classz-200 bg-classz-50/40 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-classz-700">{zh ? "新增元素" : "Add element"}</p>
          <p className="text-xs text-classz-600/80">
            {zh ? "新元素會加入清單末端，儲存頁面後才生效。" : "New elements append to the end and save with the page."}
          </p>
        </div>
        <AdminGhostButton size="sm" onClick={onToggle} aria-expanded={open}>
          <Plus className="h-3.5 w-3.5" />
          {open ? (zh ? "收起" : "Close") : zh ? "選擇類型" : "Choose type"}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        </AdminGhostButton>
      </div>

      {open ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {BLOCK_TYPES.map((type) => {
            const meta = BLOCK_TYPE_META[type]
            return (
              <button
                key={type}
                type="button"
                onClick={() => onPick(type)}
                className="rounded-lg border border-classz-100 bg-white p-3 text-left transition-colors hover:border-brand-teal hover:bg-[color-mix(in_srgb,var(--brand-teal)_5%,white)]"
              >
                <AdminStatusChip tone={meta.tone}>{zh ? meta.labelZh : meta.label}</AdminStatusChip>
                <p className="mt-1.5 text-xs leading-snug text-classz-600">{zh ? meta.hintZh : meta.hint}</p>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
