/** Learning Companion report types — aligned with Train.ipynb / API. */

export const SECTIONS = [
  "current_learning_portrait",
  "how_they_approach_something_new",
  "how_they_respond_to_challenge",
  "how_they_learn_with_other_people",
  "how_they_respond_to_guidance_and_feedback",
  "conditions_that_bring_out_their_best",
  "what_parents_may_notice_at_home",
  "personalised_strategies",
  "what_classz_will_continue_observing",
  "evidence_and_confidence",
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
