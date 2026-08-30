/**
 * Academic Learning Record — STEM Experience Day wording (Train.ipynb).
 */

export const PROGRESS_LEVELS = [
  { value: "supported", tier: "Supported", description: "Needed substantial support" },
  { value: "guided", tier: "Guided", description: "Completed with demonstration or prompts" },
  { value: "developing", tier: "Developing", description: "Completed with light support" },
  { value: "independent", tier: "Independent", description: "Completed mostly independently" },
] as const

export const CLASS_FOCUS_OPTIONS = [
  "Lego陀螺",
  "Cospaces AR/VR",
  "TinkerCAD",
  "ERC",
] as const

export const OBSERVED_OPTIONS = [
  "Needed demonstration first",
  "Completed with reminders",
  "Corrected after feedback",
  "Repeated more consistently",
  "Tried independently",
  "Completed with focus",
  "Applied in a new situation",
  "Worked well with others",
  "Showed original ideas",
  "Stayed engaged during challenge",
] as const

export const LEARNING_AREA_OPTIONS = [
  "Technique / Control",
  "Consistency / Quality",
  "Focus / Persistence",
  "Confidence to Try",
  "Communication / Expression",
  "Teamwork / Collaboration",
  "Creativity",
  "Problem Solving",
  "Physical Coordination",
  "Independence",
] as const

export const LEARNING_TRAIT_OPTIONS = [
  "Participates actively",
  "Responds well to feedback",
  "Works carefully",
  "Tries independently",
  "Needs encouragement to start",
  "Stays focused",
  "Collaborates well",
  "Shows persistence",
  "Hesitant with new tasks",
  "Shows initiative",
  "Asks questions",
  "Checks mistakes carefully",
] as const

export type ActivityLearningRecordForm = {
  class_id: string
  enrollment_id: string
  student_name: string
  photo_url: string
  class_focus: string
  progress_level: string
  observed: string[]
  strongest_areas: string[]
  attention_areas: string[]
  student_work_on: string
  learning_traits: string[]
  additional_comment: string
}

export function validateActivityLearningRecordForm(form: ActivityLearningRecordForm): string | null {
  if (!form.class_focus.trim()) return "Class focus is required."
  if (!(CLASS_FOCUS_OPTIONS as readonly string[]).includes(form.class_focus.trim())) {
    return "Invalid class focus. Re-select from the dropdown."
  }
  if (!form.progress_level) return "Progress level is required."
  if (!form.student_work_on.trim()) return "Suggestions for student work are required."
  if (form.observed.length < 1 || form.observed.length > 2) return "What Was Observed: choose 1–2."
  if (form.strongest_areas.length < 1 || form.strongest_areas.length > 2) return "Strongest area: choose 1–2."
  if (form.attention_areas.length < 1 || form.attention_areas.length > 2) return "Attention area: choose 1–2."
  if (form.learning_traits.length < 1 || form.learning_traits.length > 2) return "Learning trait: choose 1–2."
  const observedSet = new Set<string>(OBSERVED_OPTIONS)
  const areaSet = new Set<string>(LEARNING_AREA_OPTIONS)
  const traitSet = new Set<string>(LEARNING_TRAIT_OPTIONS)
  for (const v of form.observed) {
    if (!observedSet.has(v)) return `Invalid observed option: "${v}". Re-select from the dropdown.`
  }
  for (const v of form.strongest_areas) {
    if (!areaSet.has(v)) return `Invalid strongest area: "${v}". Re-select from the dropdown.`
  }
  for (const v of form.attention_areas) {
    if (!areaSet.has(v)) return `Invalid attention area: "${v}". Re-select from the dropdown.`
  }
  for (const v of form.learning_traits) {
    if (!traitSet.has(v)) return `Invalid learning trait: "${v}". Re-select from the dropdown.`
  }
  return null
}

export function sanitizeActivityLearningRecordForm(
  form: ActivityLearningRecordForm,
): ActivityLearningRecordForm {
  const observedSet = new Set<string>(OBSERVED_OPTIONS)
  const areaSet = new Set<string>(LEARNING_AREA_OPTIONS)
  const traitSet = new Set<string>(LEARNING_TRAIT_OPTIONS)
  return {
    ...form,
    class_focus: (CLASS_FOCUS_OPTIONS as readonly string[]).includes(form.class_focus)
      ? form.class_focus
      : "",
    observed: form.observed.filter((v) => observedSet.has(v)),
    strongest_areas: form.strongest_areas.filter((v) => areaSet.has(v)),
    attention_areas: form.attention_areas.filter((v) => areaSet.has(v)),
    learning_traits: form.learning_traits.filter((v) => traitSet.has(v)),
  }
}

export function emptyActivityLearningRecordForm(): ActivityLearningRecordForm {
  return {
    class_id: "",
    enrollment_id: "",
    student_name: "",
    photo_url: "",
    class_focus: "",
    progress_level: "",
    observed: [],
    strongest_areas: [],
    attention_areas: [],
    student_work_on: "",
    learning_traits: [],
    additional_comment: "",
  }
}

export function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

export function toggleMultiSelect(current: string[], value: string, max: number): string[] {
  if (current.includes(value)) return current.filter((v) => v !== value)
  if (current.length >= max) return current
  return [...current, value]
}

export function progressLevelLabel(value: string | null | undefined): string {
  if (!value) return ""
  const row = PROGRESS_LEVELS.find((p) => p.value === value)
  if (!row) return value
  return `${row.tier} — ${row.description}`
}

export type ActivityLearningRecordRow = {
  id: number
  class_id: number
  class_name?: string | null
  enrollment_id?: number | string | null
  student_name?: string | null
  photo_url?: string | null
  class_focus?: string | null
  progress_level?: string | null
  observed: string[]
  strongest_areas: string[]
  attention_areas: string[]
  student_work_on?: string | null
  learning_traits: string[]
  additional_comment?: string | null
  is_confirmed: boolean
  observation_payload?: Record<string, unknown> | null
  next_focus?: string | null
  schema_version?: string | null
  created_at: string
}

/** Coach fills from /admin/teacher-students; centre / platform from /admin/learning-records. */
export function learningRecordListPath(role?: string | null): string {
  return role === "coach" ? "/admin/teacher-students" : "/admin/learning-records"
}

export function learningRecordFillPath(
  profileId: string | number,
  opts?: { recordId?: number | string | null; role?: string | null; mode?: "teacher" | "admin" },
): string {
  const isTeacher = opts?.mode === "teacher" || opts?.role === "coach"
  const base = isTeacher
    ? `/admin/teacher-students/${profileId}`
    : `/admin/learning-records/${profileId}`
  const recordId = Number(opts?.recordId || 0)
  if (Number.isInteger(recordId) && recordId > 0) {
    return `${base}?recordId=${recordId}`
  }
  return base
}

export function formatRecordSummary(row: ActivityLearningRecordRow): string {
  const payload = row.observation_payload
  const availability = payload && typeof payload === "object" ? String(payload.availability || "") : ""
  const lines = [
    row.student_name ? `Student: ${row.student_name}` : null,
    availability === "insufficient_opportunity" ? "Availability: not enough opportunity to observe" : null,
    row.class_focus ? `Lesson focus: ${row.class_focus}` : null,
    row.progress_level ? `Progress: ${progressLevelLabel(row.progress_level)}` : null,
    row.observed?.length ? `Observed: ${row.observed.join("; ")}` : null,
    row.learning_traits?.length ? `Learning approach: ${row.learning_traits.join("; ")}` : null,
    row.student_work_on ? `Next step: ${row.student_work_on}` : null,
    row.next_focus ? `Next lesson focus: ${row.next_focus}` : null,
    row.additional_comment ? `Comment: ${row.additional_comment}` : null,
  ].filter(Boolean)
  return lines.join("\n")
}
