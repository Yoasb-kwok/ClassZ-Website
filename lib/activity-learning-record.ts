/**
 * Academic Learning Record — Figma structure & parent app spec.
 */

export const PROGRESS_LEVELS = [
  { value: "supported", tier: "Supported", description: "Needs close support." },
  { value: "guided", tier: "Guided", description: "Can attempt with demonstration or reminders." },
  { value: "developing", tier: "Developing", description: "Can complete familiar parts with light support." },
  { value: "independent", tier: "Independent", description: "Can complete independently." },
] as const

export const OBSERVED_OPTIONS = [
  "Needed step-by-step guidance",
  "Understood after explanation",
  "Corrected after reminder",
  "Solved familiar questions with support",
  "Solved familiar questions independently",
  "Applied method to mixed questions",
  "Explained the method clearly",
  "Made repeated accuracy mistakes",
  "Struggled to identify question type",
  "Completed task with good accuracy",
] as const

export const LEARNING_AREA_OPTIONS = [
  "Concept Understanding",
  "Method / Process",
  "Application",
  "Accuracy",
  "Question Interpretation",
  "Explanation / Writing",
  "Memory / Recall",
  "Exam Technique",
  "Independent Practice",
  "Learning Consistency",
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
  enrollment_id?: number | null
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
  created_at: string
}

export function formatRecordSummary(row: ActivityLearningRecordRow): string {
  const lines = [
    row.student_name ? `Student: ${row.student_name}` : null,
    row.class_focus ? `Focus: ${row.class_focus}` : null,
    row.progress_level ? `Progress: ${progressLevelLabel(row.progress_level)}` : null,
    row.observed?.length ? `Observed: ${row.observed.join("; ")}` : null,
    row.strongest_areas?.length ? `Strengths: ${row.strongest_areas.join("; ")}` : null,
    row.attention_areas?.length ? `Attention: ${row.attention_areas.join("; ")}` : null,
    row.student_work_on ? `Work on: ${row.student_work_on}` : null,
    row.learning_traits?.length ? `Traits: ${row.learning_traits.join("; ")}` : null,
    row.additional_comment ? `Comment: ${row.additional_comment}` : null,
  ].filter(Boolean)
  return lines.join("\n")
}
