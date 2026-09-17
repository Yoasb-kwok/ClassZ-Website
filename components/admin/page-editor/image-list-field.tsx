"use client"

import { useState } from "react"
import { ArrowDown, ArrowUp, ImageIcon, Loader2, Plus, Trash2, Upload } from "lucide-react"
import type { BlockImage } from "@/lib/site-pages"
import { apiPost } from "@/lib/classz-api-client"
import { resolveUploadUrl } from "@/lib/resolve-upload-url"
import { AdminGhostButton, AdminInput, AdminLabel } from "@/components/classz-admin-ui"

/**
 * Image fields for the CMS editor.
 *
 * Uploads reuse the existing admin pattern (data URL -> POST /api/admin/uploads,
 * see centre-profile-manager.tsx) so no new endpoint or multipart client is needed.
 */

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

/** Read a file as a data URL and store it through the admin upload endpoint. */
export async function uploadImageFile(file: File): Promise<string> {
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Image must be under 5MB")
  if (file.type && !file.type.startsWith("image/")) throw new Error("Only image files are allowed")

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("Could not read that file"))
    reader.readAsDataURL(file)
  })

  const uploaded = await apiPost<{ url?: string; absolute_url?: string }>(
    "/uploads",
    { image: dataUrl },
    "platform_admin"
  )
  const url = uploaded?.url || uploaded?.absolute_url || ""
  if (!url) throw new Error("Upload failed")
  return url
}

function useUpload() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run(file: File, onDone: (url: string) => void) {
    setBusy(true)
    setError(null)
    try {
      onDone(await uploadImageFile(file))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed")
    } finally {
      setBusy(false)
    }
  }

  return { busy, error, run }
}

/** Single image URL with thumbnail, upload and clear. */
export function ImageUrlField({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  hint?: string
}) {
  const { busy, error, run } = useUpload()

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <AdminLabel>{label}</AdminLabel>
        <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-classz-700 hover:text-brand-teal">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {busy ? "Uploading…" : "Upload"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={busy}
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ""
              if (file) void run(file, onChange)
            }}
          />
        </label>
      </div>
      <div className="flex items-start gap-3">
        <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-classz-100 bg-classz-50">
          {value ? (
            <img src={resolveUploadUrl(value)} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-classz-300">
              <ImageIcon className="h-5 w-5" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <AdminInput
            value={value}
            placeholder={placeholder ?? "/uploads/… or https://…"}
            onChange={(event) => onChange(event.target.value)}
          />
          {value ? (
            <AdminGhostButton size="sm" onClick={() => onChange("")}>
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </AdminGhostButton>
          ) : null}
        </div>
      </div>
      {error ? <p className="mt-1 text-xs text-brand-coral">{error}</p> : null}
      {hint ? <p className="mt-1 text-xs leading-snug text-classz-600/70">{hint}</p> : null}
    </div>
  )
}

/**
 * faq_item `images: [{ src, alt }]` (Decision 8) — add/remove/reorder rows and
 * upload a file per row.
 */
export function ImageListField({
  images,
  onChange,
  label = "Images",
  hint,
}: {
  images: BlockImage[]
  onChange: (images: BlockImage[]) => void
  label?: string
  hint?: string
}) {
  const { busy, error, run } = useUpload()

  function patchAt(index: number, patch: Partial<BlockImage>) {
    onChange(images.map((image, i) => (i === index ? { ...image, ...patch } : image)))
  }

  function move(index: number, delta: number) {
    const next = [...images]
    const target = index + delta
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <AdminLabel>
          {label}
          <span className="ml-1 text-xs font-normal text-classz-600">· {images.length}</span>
        </AdminLabel>
        <div className="flex items-center gap-1.5">
          <AdminGhostButton
            size="sm"
            onClick={() => onChange([...images, { src: "", alt: null }])}
          >
            <Plus className="h-3.5 w-3.5" />
            Add row
          </AdminGhostButton>
          <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-classz-200 px-2 py-1 text-xs font-medium text-classz-700 hover:bg-classz-50">
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {busy ? "Uploading…" : "Upload"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={busy}
              onChange={(event) => {
                const file = event.target.files?.[0]
                event.target.value = ""
                if (file) void run(file, (url) => onChange([...images, { src: url, alt: null }]))
              }}
            />
          </label>
        </div>
      </div>

      {images.length === 0 ? (
        <p className="rounded-lg border border-dashed border-classz-200 px-3 py-2 text-xs text-classz-600/80">
          No images. Add a row and upload a walkthrough screenshot.
        </p>
      ) : (
        <ul className="space-y-2">
          {images.map((image, index) => (
            <li key={index} className="rounded-lg border border-classz-100 bg-classz-50/40 p-2">
              <div className="flex items-start gap-2">
                <div className="h-14 w-20 shrink-0 overflow-hidden rounded-md border border-classz-100 bg-white">
                  {image.src ? (
                    <img src={resolveUploadUrl(image.src)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-classz-300">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <AdminInput
                    value={image.src}
                    placeholder="/uploads/… or https://…"
                    onChange={(event) => patchAt(index, { src: event.target.value })}
                  />
                  <AdminInput
                    value={image.alt ?? ""}
                    placeholder="Alt text"
                    onChange={(event) => patchAt(index, { alt: event.target.value })}
                  />
                </div>
                <div className="flex shrink-0 flex-col gap-0.5">
                  <button
                    type="button"
                    title="Move up"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    className="rounded p-1.5 text-classz-600 hover:bg-classz-100 disabled:opacity-30"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Move down"
                    disabled={index === images.length - 1}
                    onClick={() => move(index, 1)}
                    className="rounded p-1.5 text-classz-600 hover:bg-classz-100 disabled:opacity-30"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Remove image"
                    onClick={() => onChange(images.filter((_, i) => i !== index))}
                    className="rounded p-1.5 text-brand-coral hover:bg-[color-mix(in_srgb,var(--brand-coral)_10%,white)]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {error ? <p className="mt-1 text-xs text-brand-coral">{error}</p> : null}
      {hint ? <p className="mt-1 text-xs leading-snug text-classz-600/70">{hint}</p> : null}
    </div>
  )
}
