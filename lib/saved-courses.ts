import { getClasszSession } from "@/lib/classz-auth"

const GUEST_KEY = "classz_saved_courses:guest"

function storageKey() {
  if (typeof window === "undefined") return GUEST_KEY
  const email = getClasszSession()?.user?.email?.trim().toLowerCase()
  return email ? `classz_saved_courses:${email}` : GUEST_KEY
}

function readIds(key: string): number[] {
  try {
    const raw = window.localStorage.getItem(key)
    const parsed = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(parsed)
      ? parsed.map(Number).filter((n) => Number.isInteger(n) && n > 0)
      : []
  } catch {
    return []
  }
}

export function isCourseSaved(courseId: number): boolean {
  if (typeof window === "undefined") return false
  return readIds(storageKey()).includes(courseId)
}

export function toggleCourseSaved(courseId: number): boolean {
  if (typeof window === "undefined") return false
  const key = storageKey()
  const ids = new Set(readIds(key))
  if (ids.has(courseId)) ids.delete(courseId)
  else ids.add(courseId)
  window.localStorage.setItem(key, JSON.stringify([...ids]))
  return ids.has(courseId)
}
