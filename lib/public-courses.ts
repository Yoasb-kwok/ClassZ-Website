import { getBackendOrigin } from "@/lib/backend-origin"
import {
  demoPublicClasses,
  demoPublicCourse,
  demoPublicCourses,
} from "@/lib/public-program-demo"

/**
 * Server-side fetch helpers for PUBLIC ClassZ endpoints.
 * Live published courses win. Missing DEMO-* codes are filled from the
 * marketplace demo set so /programs still has cards when the API is thin.
 */

export interface PublicCourse {
  id: number
  center_id: number
  name: string
  program_code: string | null
  intro: string | null
  level: string | null
  age_tag: string | null
  age_min?: number | null
  age_max?: number | null
  instructor: string | null
  trial_class_name: string | null
  location: string | null
  weekday: number | null
  course_type: string | null
  category?: string | null
  image_url?: string | null
  sort_order: number | null
  price?: string | null
  view_count?: number
  boosted?: boolean
  boost_paid_at?: string | null
  boost_expires_at?: string | null
  starts_at?: string | null
  ends_at?: string | null
  capacity?: number | null
  venue?: string | null
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
  const rows = (await getJson<PublicCourse[]>("/api/courses")) ?? []
  const codes = new Set(rows.map((c) => c.program_code).filter(Boolean))
  const extras = demoPublicCourses().filter((c) => !codes.has(c.program_code))
  const merged = [...rows, ...extras]
  return merged.length ? merged : demoPublicCourses()
}

export async function getPublicCourse(id: number): Promise<PublicCourse | null> {
  const live = await getJson<PublicCourse>(`/api/courses/${id}`)
  if (live) return live
  return demoPublicCourse(id)
}

export async function getPublicClasses(): Promise<PublicClass[]> {
  const rows = (await getJson<PublicClass[]>("/api/classes")) ?? []
  const codes = new Set(rows.map((c) => c.program_code).filter(Boolean))
  const extras = demoPublicClasses().filter((c) => !codes.has(c.program_code ?? ""))
  const merged = [...rows, ...extras]
  return merged.length ? merged : demoPublicClasses()
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

/** Workshop listings carry datetime on the course; synthesize a session if none exist yet. */
export function workshopSessionFromCourse(course: PublicCourse): PublicClass | null {
  if (!course.starts_at) return null
  return {
    id: -Number(course.id),
    name: course.name,
    instructor: course.instructor,
    start_time: String(course.starts_at),
    end_time: String(course.ends_at || course.starts_at),
    location: course.venue || course.location,
    program_code: course.program_code,
    level: course.level,
    age_tag: course.age_tag,
    capacity: course.capacity != null ? Number(course.capacity) : 0,
    enrolled_count: 0,
    weekday: course.weekday,
    total_lessons: 1,
    is_cancelled: 0,
    center_id: course.center_id,
  }
}

export function sessionsForWorkshop(classes: PublicClass[], course: PublicCourse): PublicClass[] {
  const live = classesForCourse(classes, course)
  if (live.length) return live
  const synthetic = workshopSessionFromCourse(course)
  return synthetic ? [synthetic] : []
}
