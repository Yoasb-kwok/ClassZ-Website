"use client"

import { useEffect, useState } from "react"
import { apiGet, apiPost } from "@/lib/classz-api-client"
import {
  CLASSZ_SESSION_EVENT,
  getClasszSession,
  type ClasszSession,
} from "@/lib/classz-auth"
import { isCourseSaved, toggleCourseSaved } from "@/lib/saved-courses"

/**
 * ADR-006 D8 — favourites as real data.
 * Logged in (parent): read/toggle via /api/student/favourites (family-scoped).
 * Guest: courses keep the existing localStorage behaviour (lib/saved-courses);
 * centre hearts use a guest localStorage key. On the first authenticated load
 * the guest course hearts are imported server-side and the old key is cleared.
 */

export type FavItemType = "course" | "centre"

const GUEST_CENTRE_KEY = "classz_favourite_centres:guest"
const IMPORT_FLAG = "classz_favourites_imported"
const FAV_EVENT = "classz-favourites-changed"

type Cache = { ids: Set<string>; loaded: boolean }
let cache: Cache = { ids: new Set(), loaded: false }
let loading: Promise<void> | null = null

function keyOf(type: FavItemType, id: number) {
  return `${type}:${id}`
}

function emitChange() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(FAV_EVENT))
}

function readGuestCentreIds(): number[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(GUEST_CENTRE_KEY)
    const parsed = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(parsed)
      ? parsed.map(Number).filter((n) => Number.isInteger(n) && n > 0)
      : []
  } catch {
    return []
  }
}

function readSavedCourseIds(): number[] {
  // The old saved-courses key (per email or guest) — used for the one-time merge.
  if (typeof window === "undefined") return []
  try {
    const session = getClasszSession()
    const email = session?.user?.email?.trim().toLowerCase()
    const key = email ? `classz_saved_courses:${email}` : "classz_saved_courses:guest"
    const raw = window.localStorage.getItem(key)
    const parsed = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(parsed)
      ? parsed.map(Number).filter((n) => Number.isInteger(n) && n > 0)
      : []
  } catch {
    return []
  }
}

function isParent(session: ClasszSession | null): boolean {
  return !!session && session.user.role === "student"
}

async function importGuestCoursesOnce(ownerEmail: string): Promise<void> {
  if (typeof window === "undefined") return
  if (window.localStorage.getItem(IMPORT_FLAG) === ownerEmail) return
  const ids = readSavedCourseIds()
  window.localStorage.setItem(IMPORT_FLAG, ownerEmail)
  if (!ids.length) return
  try {
    await apiPost(
      "/favourites/import",
      { items: ids.map((id) => ({ item_type: "course", item_id: id })) },
      "student",
    )
    const key = `classz_saved_courses:${ownerEmail}`
    window.localStorage.removeItem(key)
    for (const id of ids) cache.ids.add(keyOf("course", id))
  } catch {
    // Import is best-effort; hearts stay local if the API call fails.
  }
}

export async function ensureFavouritesLoaded(): Promise<void> {
  if (cache.loaded) return
  if (loading) return loading
  loading = (async () => {
    const session = getClasszSession()
    if (isParent(session)) {
      try {
        const rows = await apiGet<
          Array<{ item_type: FavItemType; item_id: number }>
        >("/favourites", "student")
        const next = new Set<string>()
        for (const row of rows || []) next.add(keyOf(row.item_type, row.item_id))
        cache = { ids: next, loaded: true }
        await importGuestCoursesOnce(
          (session?.user?.email || "").trim().toLowerCase(),
        )
      } catch {
        cache = { ids: new Set(), loaded: true }
      }
    } else {
      const next = new Set<string>()
      for (const id of readSavedCourseIds()) next.add(keyOf("course", id))
      for (const id of readGuestCentreIds()) next.add(keyOf("centre", id))
      cache = { ids: next, loaded: true }
    }
    emitChange()
  })()
  try {
    await loading
  } finally {
    loading = null
  }
}

function toggleGuestCentre(id: number): boolean {
  if (typeof window === "undefined") return false
  const ids = new Set(readGuestCentreIds())
  if (ids.has(id)) ids.delete(id)
  else ids.add(id)
  window.localStorage.setItem(GUEST_CENTRE_KEY, JSON.stringify([...ids]))
  return ids.has(id)
}

/** Toggle and return the new state. Guest toggles stay local (courses via the
 *  existing saved-courses key, centres via a guest key). */
export async function toggleFavourite(
  type: FavItemType,
  id: number,
): Promise<boolean> {
  const session = getClasszSession()
  if (isParent(session)) {
    const res = await apiPost<{ favourited: boolean }>(
      "/favourites/toggle",
      { item_type: type, item_id: id },
      "student",
    )
    if (res?.favourited) cache.ids.add(keyOf(type, id))
    else cache.ids.delete(keyOf(type, id))
    emitChange()
    return !!res?.favourited
  }
  if (type === "course") {
    const next = toggleCourseSaved(id)
    if (next) cache.ids.add(keyOf(type, id))
    else cache.ids.delete(keyOf(type, id))
    emitChange()
    return next
  }
  const next = toggleGuestCentre(id)
  if (next) cache.ids.add(keyOf(type, id))
  else cache.ids.delete(keyOf(type, id))
  emitChange()
  return next
}

/** Reactive hook — true when the item is hearted by the current visitor. */
export function useIsFavourited(type: FavItemType, id: number): boolean {
  const [favourited, setFavourited] = useState(false)

  useEffect(() => {
    let alive = true
    const sync = () => {
      if (alive) setFavourited(cache.ids.has(keyOf(type, id)))
    }
    sync()
    ensureFavouritesLoaded().then(sync)
    window.addEventListener(FAV_EVENT, sync)
    window.addEventListener(CLASSZ_SESSION_EVENT, sync)
    return () => {
      alive = false
      window.removeEventListener(FAV_EVENT, sync)
      window.removeEventListener(CLASSZ_SESSION_EVENT, sync)
    }
  }, [type, id])

  return favourited
}

/** Force a reload from the API (e.g. after login/logout or on list pages). */
export function refreshFavourites(): void {
  cache = { ids: new Set(), loaded: false }
  ensureFavouritesLoaded()
}
