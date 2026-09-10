import { apiGet, apiPatch, apiPost } from "@/lib/classz-api-client"

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
  strongest_areas?: string[]
  attention_areas?: string[]
  student_work_on: string
  additional_comment: string
  observation_payload?: Record<string, unknown> | null
  next_focus?: string | null
  created_at: string
  start_time?: string | null
  end_time?: string | null
  evidence?: string
  support_need?: string
  outcome?: string
}

export type ProgramInsights = {
  repeated_strength: string[]
  repeated_support: string[]
  current_focus: string | null
  current_progress: string | null
  what_helps: string[]
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
  insights?: ProgramInsights
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
  algorithm_json?: {
    repeated_strengths?: string[]
    repeated_focus_areas?: string[]
    progress_context?: string
    [k: string]: unknown
  } | null
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

export type ProgramDifference = {
  program: string
  kind?: "academic" | "activity"
  repeated_strength: string[]
  repeated_support: string[]
}

export type StudentPassport = {
  account: StudentAccount
  profiles: StudentProfile[]
  profile: StudentProfile | null
  companion: PassportCompanion | null
  records: PassportRecord[]
  lessons: PassportLesson[]
  work_samples: PassportMedia[]
  moments: PassportMedia[]
  differences_across_programs: ProgramDifference[]
  help_across_programs: string[]
}

export type StudentAccount = {
  name: string
  full_name: string
  email: string
  mobile: string
  country_code: string
}

const EMPTY_PASSPORT: StudentPassport = {
  account: { name: "", full_name: "", email: "", mobile: "", country_code: "" },
  profiles: [],
  profile: null,
  companion: null,
  records: [],
  lessons: [],
  work_samples: [],
  moments: [],
  differences_across_programs: [],
  help_across_programs: [],
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

/** "12 May (Fri)" — capture 2210:16986 meta row. */
export function formatLessonDate(value?: string | null) {
  if (!value) return ""
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  const day = String(d.getDate()).padStart(2, "0")
  const month = d.toLocaleDateString("en-GB", { month: "short" })
  const weekday = d.toLocaleDateString("en-GB", { weekday: "short" })
  return `${day} ${month} (${weekday})`
}

function formatClock(value: Date) {
  const hours24 = value.getHours()
  const suffix = hours24 >= 12 ? "PM" : "AM"
  const hours = hours24 % 12 === 0 ? 12 : hours24 % 12
  return `${hours}:${String(value.getMinutes()).padStart(2, "0")}${suffix}`
}

/** "4:00PM-5:00PM" from the class start/end times (capture 2210:16986). */
export function formatLessonTimeRange(
  start?: string | null,
  end?: string | null,
): string {
  if (!start) return ""
  const startDate = new Date(start)
  if (Number.isNaN(startDate.getTime())) return String(start)
  const from = formatClock(startDate)
  const endDate = end ? new Date(end) : null
  if (!endDate || Number.isNaN(endDate.getTime())) return from
  return `${from}-${formatClock(endDate)}`
}

/** Lesson ordinal within a program: newest record = highest number ("3rd lesson"). */
export function lessonOrdinal(index: number) {
  if (index === 1) return "1st lesson"
  if (index === 2) return "2nd lesson"
  if (index === 3) return "3rd lesson"
  return `${index}th lesson`
}

// ---- Personal Information write helpers (ADR-001) ----

export type StudentProfileDetail = StudentProfile & {
  nick_name?: string
  date_of_birth?: string | null
  parents_name?: string
  contact_number?: string
  residential_district?: string
  school?: string
  medical_notes?: string
  student_id?: string
  id_first_four_masked?: string | null
  id_last_four_masked?: string | null
}

export type StudentAccountPatch = {
  name?: string
  full_name?: string
  mobile?: string
  country_code?: string
}

export type StudentProfilePatch = {
  full_name?: string
  nick_name?: string
  parents_name?: string
  date_of_birth?: string
  sex?: number
  school?: string
  residential_district?: string
  contact_number?: string
  medical_notes?: string
}

export async function updateStudentAccount(body: StudentAccountPatch) {
  return apiPatch<{ msg?: string }>("/account", body, "student")
}

export async function updateStudentProfile(profileId: number, body: StudentProfilePatch) {
  return apiPatch<StudentProfileDetail>(`/profiles/${profileId}`, body, "student")
}

export async function uploadStudentPhoto(profileId: number, imageDataUrl: string) {
  return apiPost<{ url?: string }>("/me/photo", { profile_id: profileId, image: imageDataUrl }, "student")
}
