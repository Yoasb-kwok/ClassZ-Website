/** Learning Companion report types — aligned with version2.ipynb More Insight. */

export const SECTIONS = [
  "your_child_at_a_glance",
  "how_they_approach_learning",
  "how_they_respond_along_the_way",
  "how_you_can_support_them",
  "why_this_companion_fits",
  "also_reflected_in_their_learning",
  "a_note_for_parents",
] as const

export type LearningCompanionReport = {
  id?: number
  profile_id?: number
  report_language?: "en" | "zh" | string
  student_name?: string | null
  status: string
  records_used?: number
  records_required?: number
  primary_companion?: string | null
  supporting_companions?: string[]
  algorithm_json?: unknown
  narrative_json?: {
    report_status?: string
    report_language?: "en" | "zh" | string
    sections?: Record<string, unknown>
    supporting_descriptions?: unknown[]
    learning_companion_section?: Record<string, unknown>
    supporting_companion_sections?: unknown[]
    ai_sections?: Record<string, unknown>
    validation_errors?: string[]
  } | null
  /** Present on freshly generated API payload */
  narrative?: {
    report_status?: string
    report_language?: "en" | "zh" | string
    sections?: Record<string, unknown>
    supporting_descriptions?: unknown[]
    learning_companion_section?: Record<string, unknown>
    supporting_companion_sections?: unknown[]
    ai_sections?: Record<string, unknown>
    validation_errors?: string[]
  } | null
  validation_log?: unknown
  created_at?: string
}
