import { getBackendOrigin } from "@/lib/backend-origin"

/**
 * Server-side fetch helpers for PUBLIC ClassZ endpoints.
 * Deliberately has NO demo-data fallback — if the API is down we render
 * empty states rather than fake records (the admin demo fallback in
 * lib/classz-admin-demo.ts must not mask real API failures here).
 */

export interface PublicCourse {
  id: number
  center_id: number
  name: string
  program_code: string | null
  intro: string | null
  level: string | null
  age_tag: string | null
  instructor: string | null
  trial_class_name: string | null
  location: string | null
  weekday: number | null
  course_type: string | null
  sort_order: number | null
  price?: string | null
  view_count?: number
}

export interface PublicClass {
  id: number
  name: string
  instructor: string | null
  start_time: string
  end_time: string
  location: string | null
  program_code: string | null
  level: string | null
  age_tag: string | null
  age_group?: string | null
  capacity: number
  enrolled_count: number
  weekday: number | null
  total_lessons: number
  is_cancelled: number
  center_id: number
}

async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${getBackendOrigin()}${path}`, {
      next: { revalidate: 30 },
    })
    if (!res.ok) return null
    const body = await res.json()
    return body?.success === true ? ((body.data ?? null) as T | null) : null
  } catch {
    return null
  }
}

export async function getPublicCourses(): Promise<PublicCourse[]> {
  return (await getJson<PublicCourse[]>("/api/courses")) ?? []
}

export async function getPublicCourse(id: number): Promise<PublicCourse | null> {
  return getJson<PublicCourse>(`/api/courses/${id}`)
}

export async function getPublicClasses(): Promise<PublicClass[]> {
  return (await getJson<PublicClass[]>("/api/classes")) ?? []
}

/** Active, future classes for a course's program_code, soonest first. */
export function classesForCourse(classes: PublicClass[], course: PublicCourse): PublicClass[] {
  const code = course.program_code?.trim()
  if (!code) return []
  return classes
    .filter(
      (c) =>
        (c.program_code ?? "").trim() === code &&
        (c.is_cancelled === 0 || c.is_cancelled == null) &&
        c.center_id === course.center_id
    )
    .sort((a, b) => a.start_time.localeCompare(b.start_time))
}
