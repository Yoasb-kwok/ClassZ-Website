import { apiGet } from "@/lib/classz-api-client"

export type StudentProfile = {
  id: number
  name: string
  sex: number | null
  age: number | null
  level: string
  photo_url?: string | null
}

export type PassportRecord = {
  id: number
  class_id: number
  class_name: string
  kind?: "academic" | "activity"
  location: string
  instructor: string
  center_name: string
  photo_url?: string | null
  class_focus: string
  progress_level?: string | null
  observed: string[]
  student_work_on: string
  additional_comment: string
  observation_payload?: Record<string, unknown> | null
  created_at: string
  evidence?: string
  support_need?: string
}

export type PassportLesson = {
  id: string
  title: string
  kind?: "academic" | "activity"
  location: string
  instructor: string
  center_name: string
  photo_url?: string | null
  latest_at?: string
  record_count: number
  status: string
  statusType: string
  authors: string
  records: PassportRecord[]
}

export type PassportCompanion = {
  id: number
  student_name?: string | null
  status?: string
  records_used?: number
  records_required?: number
  primary_companion?: string | null
  supporting_companions?: string[]
  narrative_json?: Record<string, unknown> | null
}

export type PassportMedia = {
  id: number | string
  title: string
  lessonLabel: string
  centre: string
  date?: string | null
  image?: string | null
  class_id?: number
}

export type StudentPassport = {
  profiles: StudentProfile[]
  profile: StudentProfile | null
  companion: PassportCompanion | null
  records: PassportRecord[]
  lessons: PassportLesson[]
  work_samples: PassportMedia[]
  moments: PassportMedia[]
}

const EMPTY_PASSPORT: StudentPassport = {
  profiles: [],
  profile: null,
  companion: null,
  records: [],
  lessons: [],
  work_samples: [],
  moments: [],
}

export async function fetchStudentPassport(profileId?: number | null): Promise<StudentPassport> {
  const qs = profileId ? `?profile_id=${profileId}` : ""
  const data = await apiGet<StudentPassport>(`/passport${qs}`, "student")
  return data || EMPTY_PASSPORT
}

export async function fetchStudentTokens() {
  return apiGet<Array<{ id: string; remaining_tokens: number; total_tokens: number; expiry_date: string | null }>>(
    "/tokens",
    "student",
  )
}

export async function fetchStudentUpcomingClasses(profileId?: number | null) {
  const qs = profileId ? `?profileId=${profileId}` : ""
  return apiGet<unknown[]>(`/upcoming-classes${qs}`, "student")
}

export async function fetchStudentNotifications() {
  return apiGet<unknown[]>("/notifications", "student")
}

export async function fetchStudentClassNotices() {
  return apiGet<unknown[]>("/class-notices", "student")
}

export function formatPassportDate(value?: string | null) {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}
