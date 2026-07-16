import { getBackendOrigin } from "@/lib/backend-origin"

/** Turn API upload paths (/uploads/…) into a URL the browser can load. */
export function resolveUploadUrl(url: string | null | undefined): string {
  if (!url) return ""
  const u = url.trim()
  if (!u) return ""
  if (/^(https?:|blob:|data:)/i.test(u)) return u

  const path = u.startsWith("/") ? u : `/${u}`

  // Same-origin rewrite: next.config rewrites /uploads/* → backend (see next.config.mjs)
  if (typeof window !== "undefined" && path.startsWith("/uploads/")) {
    return path
  }

  const publicBase =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_CLASSZ_API_URL?.replace(/\/api\/?$/, "")

  if (publicBase) {
    return `${publicBase.replace(/\/$/, "")}${path}`
  }

  return `${getBackendOrigin()}${path}`
}
