import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

/**
 * On-demand ISR revalidation (ADR-004 Decision 7).
 *
 * Called by the ClassZ-api save handlers (helpers/revalidateSite.js) after a
 * successful site-content write, so edited pages appear immediately instead of
 * waiting out the 60s revalidate window.
 *
 * POST body: { secret: string, pageKeys?: string[] }
 */

const PAGE_PATH: Record<string, string> = {
  about: "/about",
  terms: "/terms",
  privacy: "/privacy",
  faqs: "/faqs",
  contact: "/contact-us",
}

const ALL_PATHS = Object.values(PAGE_PATH)

export async function POST(request: NextRequest) {
  const expected = process.env.REVALIDATE_SECRET
  if (!expected) {
    return NextResponse.json(
      { success: false, message: "REVALIDATE_SECRET is not configured on the website" },
      { status: 503 }
    )
  }

  let body: { secret?: string; pageKeys?: unknown } = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON body" }, { status: 400 })
  }

  if (body.secret !== expected) {
    return NextResponse.json({ success: false, message: "Invalid secret" }, { status: 401 })
  }

  // All pages when no keys are given; known keys map to their routes.
  const keys = Array.isArray(body.pageKeys)
    ? body.pageKeys.map((k) => String(k)).filter((k) => k in PAGE_PATH)
    : []
  const paths = keys.length ? keys.map((k) => PAGE_PATH[k]) : ALL_PATHS

  for (const p of paths) {
    revalidatePath(p)
  }

  return NextResponse.json({ success: true, revalidated: paths })
}
