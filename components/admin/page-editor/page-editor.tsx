"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { LayoutTemplate, Plus, RefreshCw, Save } from "lucide-react"
import type { SiteBlock } from "@/lib/site-pages"
import { useLanguage } from "@/components/language-provider"
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/lib/classz-api-client"
import {
  AdminCard,
  AdminGhostButton,
  AdminInput,
  AdminLabel,
  AdminPageFrame,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminStatusChip,
  AdminTextarea,
} from "@/components/classz-admin-ui"
import { AddElementPicker, createBlock, validateBlocks } from "./element-forms"
import { ElementCard } from "./element-card"
import { LanguageTabs } from "./language-field"
import { PreviewPane } from "./preview-pane"
import { SaveBar } from "./save-bar"
import {
  PAGE_META,
  audienceFor,
  newBlockId,
  newRowDraft,
  normalizeBlocks,
  parseContentJson,
  readText,
  rowAsBlock,
  rowFromApi,
  rowPayload,
  sanitizeBlock,
  type BlockPatch,
  type BlockType,
  type EditorLanguage,
  type ItemMode,
  type ItemRow,
  type PageEditorKey,
} from "./model"

/**
 * Admin PageEditor (ADR-004 Decisions 5, 6).
 *
 * One shell, two binding modes:
 *   - "blocks" (about, terms, privacy): the stack is a local draft of
 *     cms_pages.content_json; the whole page saves with one PUT.
 *   - "items" (faq, contact): the stack is bound to faq_items /
 *     contact_branches rows; each element saves on its own PATCH/POST/DELETE
 *     and the page header saves with its own PUT.
 *
 * The preview pane always renders the current draft through the public
 * BlockRenderer in the language selected in the toolbar.
 */

type ApiRow = Record<string, unknown>

const ITEMS_PATH: Record<ItemMode, string> = { faq: "/faq-items", contact: "/contact-branches" }
const HEADER_PATH: Record<ItemMode, string> = { faq: "/faq-page", contact: "/contact-page" }

function snapshotOf(rows: ItemRow[]): Record<string, ItemRow> {
  return Object.fromEntries(rows.map((row) => [row.id, row]))
}

export function PageEditor({ pageKey }: { pageKey: PageEditorKey }) {
  const meta = PAGE_META[pageKey]
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"

  // Shared shell state.
  const [language, setLanguage] = useState<EditorLanguage>("en")
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [missingPage, setMissingPage] = useState(false)
  const [saving, setSaving] = useState(false)
  const [busyRowId, setBusyRowId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  // Blocks mode: the whole page is a local draft until Save.
  const [titleZh, setTitleZh] = useState("")
  const [titleEn, setTitleEn] = useState("")
  const [blocks, setBlocks] = useState<SiteBlock[]>([])
  const [docExtras, setDocExtras] = useState<Record<string, unknown>>({})
  const [savedBlocks, setSavedBlocks] = useState("")

  // Items mode: rows are the source of truth, saved one at a time.
  const [header, setHeader] = useState({ title: "", intro: "" })
  const [savedHeader, setSavedHeader] = useState("")
  const [rows, setRows] = useState<ItemRow[]>([])
  const [rowSnapshot, setRowSnapshot] = useState<Record<string, ItemRow>>({})

  const loadItems = useCallback(
    async (mode: ItemMode) => {
      const [headerRow, itemRows] = await Promise.all([
        apiGet<ApiRow>(HEADER_PATH[mode], "platform_admin"),
        apiGet<unknown[]>(ITEMS_PATH[mode], "platform_admin"),
      ])
      const nextHeader = { title: readText(headerRow ?? {}, "title"), intro: readText(headerRow ?? {}, "intro") }
      const nextRows = (Array.isArray(itemRows) ? itemRows : []).map((raw) => rowFromApi(raw, mode))
      setHeader(nextHeader)
      setSavedHeader(JSON.stringify(nextHeader))
      setRows(nextRows)
      setRowSnapshot(snapshotOf(nextRows))
      return nextRows
    },
    []
  )

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    setMissingPage(false)
    setError(null)
    setSuccess(null)
    setHighlightId(null)
    try {
      if (meta.mode === "blocks") {
        const row = await apiGet<ApiRow>(`/cms-pages/${pageKey}`, "platform_admin")
        const parsed = parseContentJson(row?.content_json)
        const nextBlocks = normalizeBlocks(parsed.blocks)
        const nextTitleZh = readText(row ?? {}, "title_zh")
        const nextTitleEn = readText(row ?? {}, "title_en")
        // Any other document keys (last_updated_*) are carried back on save.
        const extras = { ...parsed.doc }
        delete extras.blocks
        setTitleZh(nextTitleZh)
        setTitleEn(nextTitleEn)
        setBlocks(nextBlocks)
        setDocExtras(extras)
        setSavedBlocks(JSON.stringify({ titleZh: nextTitleZh, titleEn: nextTitleEn, blocks: nextBlocks }))
        setExpandedId(nextBlocks[0]?.id ?? null)
      } else {
        const nextRows = await loadItems(meta.itemMode as ItemMode)
        setExpandedId(nextRows[0]?.id ?? null)
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Load failed"
      if (meta.mode === "blocks" && /not found/i.test(message)) {
        // No cms_pages row yet: start empty, saving will create the page.
        setTitleZh("")
        setTitleEn("")
        setBlocks([])
        setSavedBlocks(JSON.stringify({ titleZh: "", titleEn: "", blocks: [] }))
        setMissingPage(true)
      } else {
        setLoadError(message)
      }
    } finally {
      setLoading(false)
    }
    // `zh` is deliberately not a dependency: switching the interface language
    // must not refetch (and so discard) an in-progress draft.
  }, [loadItems, meta.mode, meta.itemMode, pageKey])

  useEffect(() => {
    void load()
  }, [load])

  // --- Derived state ---

  const previewBlocks = useMemo<SiteBlock[]>(() => {
    if (meta.mode === "blocks") return blocks.map(sanitizeBlock)
    const mode = meta.itemMode as ItemMode
    // Only published rows render on the site (facade filters is_active = 1).
    return rows.filter((row) => row.is_active).map((row) => sanitizeBlock(rowAsBlock(row, mode)))
  }, [meta.itemMode, meta.mode, blocks, rows])

  const dirtyRows = useMemo(
    () => rows.filter((row) => JSON.stringify(row) !== JSON.stringify(rowSnapshot[row.id])),
    [rows, rowSnapshot]
  )

  const headerDirty = JSON.stringify(header) !== savedHeader
  const blocksDirty = JSON.stringify({ titleZh, titleEn, blocks }) !== savedBlocks
  const dirty = meta.mode === "blocks" ? blocksDirty : headerDirty || dirtyRows.length > 0
  const isRowDirty = useCallback(
    (row: ItemRow) => JSON.stringify(row) !== JSON.stringify(rowSnapshot[row.id]),
    [rowSnapshot]
  )

  // Cheap unsaved-navigation guard (Decision 6).
  useEffect(() => {
    if (!dirty) return
    function warn(event: BeforeUnloadEvent) {
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])

  // --- Blocks-mode actions ---

  function patchBlock(id: string, patch: BlockPatch) {
    setBlocks((prev) => prev.map((block) => (block.id === id ? ({ ...block, ...patch } as SiteBlock) : block)))
  }

  function moveBlock(id: string, delta: number) {
    setBlocks((prev) => {
      const from = prev.findIndex((block) => block.id === id)
      const to = from + delta
      if (from < 0 || to < 0 || to >= prev.length) return prev
      const next = [...prev]
      ;[next[from], next[to]] = [next[to], next[from]]
      return next
    })
  }

  function duplicateBlock(id: string) {
    const index = blocks.findIndex((block) => block.id === id)
    if (index < 0) return
    const copy = { ...blocks[index], id: newBlockId(blocks[index].type) } as SiteBlock
    setBlocks([...blocks.slice(0, index + 1), copy, ...blocks.slice(index + 1)])
    setExpandedId(copy.id)
  }

  function deleteBlock(id: string) {
    if (!confirm(zh ? "刪除此元素？" : "Delete this element?")) return
    setBlocks((prev) => prev.filter((block) => block.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  async function saveBlocks() {
    const invalid = validateBlocks(blocks)
    if (invalid) {
      setError(invalid.message)
      setHighlightId(invalid.id)
      setExpandedId(invalid.id)
      return
    }
    const nextTitleZh = titleZh.trim()
    if (!nextTitleZh) {
      setError(zh ? "頁面標題（中文）為必填。" : "The Chinese page title is required by the API.")
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      // Empty image rows are dropped; unknown document keys (last_updated_*) survive.
      const payloadBlocks = blocks.map(sanitizeBlock)
      await apiPut<ApiRow>(
        `/cms-pages/${pageKey}`,
        {
          title_zh: nextTitleZh,
          title_en: titleEn.trim() || null,
          content_json: { ...docExtras, schemaVersion: 1, blocks: payloadBlocks },
        },
        "platform_admin"
      )
      setTitleZh(nextTitleZh)
      setBlocks(payloadBlocks)
      setSavedBlocks(JSON.stringify({ titleZh: nextTitleZh, titleEn, blocks: payloadBlocks }))
      setHighlightId(null)
      setSuccess(zh ? "已儲存，網站會在數秒內更新。" : "Saved — the site updates within seconds.")
    } catch (e) {
      // Block-schema failures come back as the API's 400 `msg`.
      setError(e instanceof Error ? e.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  // --- Items-mode actions ---

  function patchRow(id: string, patch: BlockPatch) {
    setRows((prev) => prev.map((row) => (row.id === id ? ({ ...row, ...patch } as ItemRow) : row)))
  }

  function markRowSaved(row: ItemRow) {
    setRowSnapshot((prev) => ({ ...prev, [row.id]: row }))
  }

  async function addRow() {
    const mode = meta.itemMode as ItemMode
    const draft = newRowDraft(mode, zh)
    setBusyRowId("new")
    setError(null)
    setSuccess(null)
    try {
      const created = await apiPost<unknown>(ITEMS_PATH[mode], rowPayload(draft, mode, { includeOrder: false }), "platform_admin")
      const row = rowFromApi(created, mode)
      setRows((prev) => [...prev, row])
      markRowSaved(row)
      setExpandedId(row.id)
      setSuccess(zh ? "已新增，請填寫內容。" : "Added — fill in the content.")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add the element")
    } finally {
      setBusyRowId(null)
    }
  }

  async function saveRow(row: ItemRow) {
    const mode = meta.itemMode as ItemMode
    setBusyRowId(row.id)
    setError(null)
    setSuccess(null)
    try {
      const updated = await apiPatch<unknown>(`${ITEMS_PATH[mode]}/${row.id}`, rowPayload(row, mode), "platform_admin")
      const next = { ...rowFromApi(updated ?? row, mode), id: row.id }
      setRows((prev) => prev.map((current) => (current.id === row.id ? next : current)))
      markRowSaved(next)
      setSuccess(zh ? "此元素已儲存。" : "Element saved.")
      setHighlightId(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed")
    } finally {
      setBusyRowId(null)
    }
  }

  async function saveAllItems() {
    const mode = meta.itemMode as ItemMode
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const saved: string[] = []
      if (headerDirty) {
        await apiPut<ApiRow>(HEADER_PATH[mode], { title: header.title, intro: header.intro }, "platform_admin")
        setSavedHeader(JSON.stringify(header))
        saved.push(zh ? "頁首" : "the page header")
      }
      for (const row of dirtyRows) {
        await apiPatch(`${ITEMS_PATH[mode]}/${row.id}`, rowPayload(row, mode), "platform_admin")
      }
      if (dirtyRows.length) {
        saved.push(zh ? `${dirtyRows.length} 個元素` : `${dirtyRows.length} element(s)`)
      }
      if (saved.length) {
        await loadItems(mode)
        setSuccess(zh ? `已儲存 ${saved.join("及")}。` : `Saved ${saved.join(" and ")}.`)
      } else {
        setSuccess(zh ? "沒有需要儲存的變更。" : "Nothing to save.")
      }
      setHighlightId(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  async function moveRow(row: ItemRow, delta: number) {
    const mode = meta.itemMode as ItemMode
    const from = rows.findIndex((current) => current.id === row.id)
    const to = from + delta
    if (from < 0 || to < 0 || to >= rows.length) return

    const previousRows = rows
    const previousSnapshot = rowSnapshot
    const reordered = [...rows]
    ;[reordered[from], reordered[to]] = [reordered[to], reordered[from]]
    applyOrder(reordered)

    try {
      await apiPost(
        `${ITEMS_PATH[mode]}/reorder`,
        mode === "faq" ? { order: reordered.map((current) => Number(current.id)) } : { ids: reordered.map((current) => current.id) },
        "platform_admin"
      )
      setError(null)
    } catch (e) {
      setRows(previousRows)
      setRowSnapshot(previousSnapshot)
      setError(e instanceof Error ? e.message : "Reorder failed")
    }
  }

  /** Reorder locally, keeping each row's last-saved snapshot so unsaved edits stay marked. */
  function applyOrder(next: ItemRow[]) {
    const ordered = next.map((row, index) => ({ ...row, display_order: index }))
    setRows(ordered)
    setRowSnapshot((prev) => {
      const snapshot: Record<string, ItemRow> = {}
      for (const row of ordered) {
        const saved = prev[row.id]
        snapshot[row.id] = saved ? { ...saved, display_order: row.display_order } : row
      }
      return snapshot
    })
  }

  async function duplicateRow(row: ItemRow) {
    const mode = meta.itemMode as ItemMode
    const copy: ItemRow = { ...row, id: "" }
    if (mode === "faq") copy.question = `${readText(row, "question")} (copy)`
    else copy.name = `${readText(row, "name")} (copy)`

    setBusyRowId(row.id)
    setError(null)
    setSuccess(null)
    try {
      const created = await apiPost<unknown>(ITEMS_PATH[mode], rowPayload(copy, mode, { includeOrder: false }), "platform_admin")
      const createdRow = rowFromApi(created, mode)
      setRows((prev) => [...prev, createdRow])
      markRowSaved(createdRow)
      setExpandedId(createdRow.id)
      setSuccess(zh ? "已複製到清單末端。" : "Duplicated at the end of the list.")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Duplicate failed")
    } finally {
      setBusyRowId(null)
    }
  }

  async function deleteRow(row: ItemRow) {
    const mode = meta.itemMode as ItemMode
    if (!confirm(zh ? "刪除此元素？此操作無法復原。" : "Delete this element? This cannot be undone.")) return
    setBusyRowId(row.id)
    setError(null)
    setSuccess(null)
    try {
      await apiDelete(`${ITEMS_PATH[mode]}/${row.id}`, "platform_admin")
      setRows((prev) => prev.filter((current) => current.id !== row.id))
      setRowSnapshot((prev) => {
        const next = { ...prev }
        delete next[row.id]
        return next
      })
      if (expandedId === row.id) setExpandedId(null)
      setSuccess(zh ? "已刪除。" : "Deleted.")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed")
    } finally {
      setBusyRowId(null)
    }
  }

  async function toggleRowActive(row: ItemRow, isActive: boolean) {
    const mode = meta.itemMode as ItemMode
    const previous = rows
    const next = { ...row, is_active: isActive }
    setRows((prev) => prev.map((current) => (current.id === row.id ? next : current)))
    setBusyRowId(row.id)
    setError(null)
    try {
      await apiPatch(`${ITEMS_PATH[mode]}/${row.id}`, { is_active: isActive }, "platform_admin")
      setRowSnapshot((prev) => ({ ...prev, [row.id]: { ...(prev[row.id] ?? next), is_active: isActive } }))
    } catch (e) {
      setRows(previous)
      setError(e instanceof Error ? e.message : "Update failed")
    } finally {
      setBusyRowId(null)
    }
  }

  // --- Render ---

  const title = zh ? meta.titleZh : meta.titleEn
  const heading = language === "en" ? titleEn || titleZh : titleZh || titleEn
  const intro = meta.mode === "items" ? header.intro : undefined

  if (loading) {
    return (
      <AdminPageFrame>
        <AdminPageHeader title={title} Icon={LayoutTemplate} />
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 rounded-full border-2 border-classz-400 border-t-transparent animate-spin" />
        </div>
      </AdminPageFrame>
    )
  }

  if (loadError) {
    return (
      <AdminPageFrame>
        <AdminPageHeader title={title} Icon={LayoutTemplate} />
        <AdminCard>
          <p
            role="alert"
            className="rounded-md border border-[color-mix(in_srgb,var(--brand-coral)_35%,white)] bg-[color-mix(in_srgb,var(--brand-coral)_10%,white)] px-3 py-2 text-sm text-brand-coral"
          >
            {loadError}
          </p>
          <div className="mt-3">
            <AdminGhostButton onClick={() => void load()}>
              <RefreshCw className="h-3.5 w-3.5" />
              {zh ? "重試" : "Try again"}
            </AdminGhostButton>
          </div>
        </AdminCard>
      </AdminPageFrame>
    )
  }

  return (
    <AdminPageFrame>
      <AdminPageHeader title={title} description={zh ? meta.descriptionZh : meta.descriptionEn} Icon={LayoutTemplate} />

      <AdminCard className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-classz-700">{zh ? "編輯語言" : "Editing language"}</p>
          <p className="text-xs leading-snug text-classz-600/80">
            {zh
              ? "欄位與預覽會一起切換。語言留空時，網站會顯示英文內容。"
              : "Switches the fields and the preview together. Empty variants fall back to English on the site."}
          </p>
        </div>
        <LanguageTabs language={language} onLanguageChange={setLanguage} />
      </AdminCard>

      {missingPage ? (
        <div className="rounded-md border border-[color-mix(in_srgb,var(--brand-orange)_35%,white)] bg-[color-mix(in_srgb,var(--brand-orange)_8%,white)] px-3 py-2 text-xs leading-snug text-classz-700">
          {zh
            ? "此頁尚未有內容紀錄，儲存後會建立。"
            : "No stored content for this page yet — saving will create it."}
        </div>
      ) : null}

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <div className="min-w-0 space-y-3">
          {meta.mode === "blocks" ? (
            <AdminCard>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <AdminLabel>{zh ? "頁面標題（中文）" : "Page title (zh)"} *</AdminLabel>
                  <AdminInput value={titleZh} onChange={(event) => setTitleZh(event.target.value)} />
                </div>
                <div>
                  <AdminLabel>{zh ? "頁面標題（英文）" : "Page title (en)"}</AdminLabel>
                  <AdminInput value={titleEn} onChange={(event) => setTitleEn(event.target.value)} />
                </div>
              </div>
              <p className="mt-2 text-xs leading-snug text-classz-600/70">
                {zh
                  ? "中文標題為 API 必填；元素內容於下方逐項編輯。"
                  : "The Chinese title is required by the API. Element content is edited below."}
              </p>
            </AdminCard>
          ) : (
            <AdminCard>
              <div className="space-y-4">
                <div>
                  <AdminLabel>{zh ? "頁面標題" : "Page title"}</AdminLabel>
                  <AdminInput
                    value={header.title}
                    onChange={(event) => setHeader((prev) => ({ ...prev, title: event.target.value }))}
                  />
                </div>
                <div>
                  <AdminLabel>{zh ? "頁面簡介" : "Intro"}</AdminLabel>
                  <AdminTextarea
                    className="min-h-[96px]"
                    value={header.intro}
                    onChange={(event) => setHeader((prev) => ({ ...prev, intro: event.target.value }))}
                  />
                </div>
              </div>
              {headerDirty ? (
                <p className="mt-2 text-xs leading-snug text-brand-orange">
                  {zh ? "頁首有未儲存的變更，會由下方的儲存列寫入。" : "Header has unsaved changes — the save bar stores them."}
                </p>
              ) : null}
            </AdminCard>
          )}

          {meta.itemMode === "faq" ? (
            <div className="rounded-lg border border-[color-mix(in_srgb,var(--brand-orange)_35%,white)] bg-[color-mix(in_srgb,var(--brand-orange)_8%,white)] px-3 py-2 text-xs leading-snug text-classz-700">
              {zh
                ? "排序慣例：display_order 小於 100 會出現在「家長」分頁，100 或以上會出現在「中心」分頁。用 ↑↓ 調整次序。"
                : "Ordering convention: display_order below 100 appears in the “Parents” tab, 100 and above in the “Centres” tab. Use ↑↓ to change it."}
            </div>
          ) : null}

          {meta.mode === "blocks" && blocks.length === 0 ? (
            <p className="rounded-xl border border-dashed border-classz-200 px-4 py-6 text-center text-sm text-classz-600/80">
              {zh ? "此頁還沒有元素，請從下方新增。" : "This page has no elements yet — add one below."}
            </p>
          ) : null}

          {meta.mode === "items" && rows.length === 0 ? (
            <p className="rounded-xl border border-dashed border-classz-200 px-4 py-6 text-center text-sm text-classz-600/80">
              {zh ? "暫時沒有項目。" : "No elements yet."}
            </p>
          ) : null}

          {/* Element stack — one card per element (Decision 6). */}
          {meta.mode === "blocks"
            ? blocks.map((block, index) => (
                <ElementCard
                  key={block.id}
                  block={block}
                  index={index}
                  total={blocks.length}
                  expanded={expandedId === block.id}
                  onToggle={() => setExpandedId(expandedId === block.id ? null : block.id)}
                  onMove={(delta) => moveBlock(block.id, delta)}
                  onDuplicate={() => duplicateBlock(block.id)}
                  onDelete={() => deleteBlock(block.id)}
                  language={language}
                  onLanguageChange={setLanguage}
                  onPatch={(patch) => patchBlock(block.id, patch)}
                  highlight={highlightId === block.id}
                  hideRowFields
                />
              ))
            : rows.map((row, index) => {
                const mode = meta.itemMode as ItemMode
                const audience = audienceFor(row.display_order)
                return (
                  <ElementCard
                    key={row.id}
                    block={rowAsBlock(row, mode)}
                    index={index}
                    total={rows.length}
                    expanded={expandedId === row.id}
                    onToggle={() => setExpandedId(expandedId === row.id ? null : row.id)}
                    onMove={(delta) => void moveRow(row, delta)}
                    onDuplicate={() => void duplicateRow(row)}
                    onDelete={() => void deleteRow(row)}
                    language={language}
                    onLanguageChange={setLanguage}
                    onPatch={(patch) => patchRow(row.id, patch)}
                    hideRowFields
                    busy={busyRowId === row.id}
                    badges={
                      <>
                        {mode === "faq" ? (
                          <AdminStatusChip tone={audience === "parents" ? "teal" : "slate"}>
                            {audience === "parents" ? (zh ? "家長分頁" : "Parents tab") : zh ? "中心分頁" : "Centres tab"}
                          </AdminStatusChip>
                        ) : null}
                        {row.is_active ? null : <AdminStatusChip tone="coral">{zh ? "未發佈" : "Not published"}</AdminStatusChip>}
                      </>
                    }
                    headerExtra={
                      <label
                        className="flex items-center gap-1.5 pr-1 text-[11px] font-medium text-classz-600"
                        title={zh ? "在網站上顯示" : "Show on the site"}
                      >
                        <input
                          type="checkbox"
                          checked={row.is_active}
                          disabled={busyRowId === row.id}
                          onChange={(event) => void toggleRowActive(row, event.target.checked)}
                        />
                        {zh ? "發佈" : "Live"}
                      </label>
                    }
                    footer={
                      <>
                        <AdminPrimaryButton
                          size="sm"
                          disabled={!isRowDirty(row) || busyRowId === row.id}
                          onClick={() => void saveRow(row)}
                        >
                          <Save className="h-3.5 w-3.5" />
                          {zh ? "儲存此元素" : "Save element"}
                        </AdminPrimaryButton>
                        <span className="text-xs text-classz-600/80">
                          {isRowDirty(row)
                            ? zh
                              ? "此元素有未儲存的變更"
                              : "This element has unsaved changes"
                            : zh
                              ? "已儲存"
                              : "Saved"}
                        </span>
                      </>
                    }
                  />
                )
              })}

          {meta.mode === "blocks" ? (
            <AddElementPicker
              open={addOpen}
              onToggle={() => setAddOpen((open) => !open)}
              onPick={(type: BlockType) => {
                const block = createBlock(type)
                setBlocks((prev) => [...prev, block])
                setExpandedId(block.id)
                setAddOpen(false)
              }}
            />
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-classz-200 bg-classz-50/40 p-3">
              <p className="text-xs leading-snug text-classz-600/80">
                {zh ? "新增的項目會即時建立，儲存後才生效。" : "A new element is created immediately and saves on its own."}
              </p>
              <AdminPrimaryButton size="sm" disabled={busyRowId === "new"} onClick={() => void addRow()}>
                <Plus className="h-3.5 w-3.5" />
                {meta.itemMode === "faq" ? (zh ? "新增問答" : "Add FAQ item") : zh ? "新增分店" : "Add branch"}
              </AdminPrimaryButton>
            </div>
          )}

          <SaveBar
            dirty={dirty}
            saving={saving}
            error={error}
            success={success}
            onSave={() => (meta.mode === "blocks" ? void saveBlocks() : void saveAllItems())}
            onDiscard={() => {
              if (!dirty) return
              if (confirm(zh ? "捨棄未儲存的變更？" : "Discard unsaved changes?")) void load()
            }}
            dirtySummary={
              meta.mode === "blocks"
                ? zh
                  ? "此頁有未儲存的變更"
                  : "This page has unsaved changes"
                : zh
                  ? `未儲存：${dirtyRows.length} 個元素${headerDirty ? "及頁首" : ""}`
                  : `Unsaved: ${dirtyRows.length} element(s)${headerDirty ? " and the page header" : ""}`
            }
            note={
              meta.mode === "items"
                ? zh
                  ? "元素會逐項儲存；此列會寫入已改動的元素與頁首。"
                  : "Elements save per row; this bar stores every changed element plus the page header."
                : zh
                  ? "儲存會一次寫入整頁元素（沒有自動儲存）。"
                  : "Saving writes the whole page at once — there is no autosave."
            }
            extra={
              <AdminGhostButton onClick={() => void load()} disabled={saving}>
                <RefreshCw className="h-3.5 w-3.5" />
                {zh ? "重新載入" : "Reload"}
              </AdminGhostButton>
            }
          />
        </div>

        <PreviewPane
          blocks={previewBlocks}
          language={language}
          title={heading}
          intro={intro}
          publicPath={meta.publicPath}
          emptyHint={
            meta.mode === "items"
              ? zh
                ? "沒有已發佈的元素可預覽。"
                : "No published elements to preview."
              : undefined
          }
        />
      </div>
    </AdminPageFrame>
  )
}
