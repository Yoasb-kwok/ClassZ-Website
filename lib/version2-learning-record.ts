/**
 * version2.ipynb Learning Record input — option banks, types, and validation.
 */
import adaptiveBankFile from "./version2-adaptive-bank.json"

export type BilingualOption = { id: string; en: string; zh: string }

export type AdaptiveOption = BilingualOption & {
  behavioural_evidence: boolean
  requires_support_block: boolean
  evidence_interpretation: string
}

export type AdaptiveDomainMeta = {
  code: string
  question: string
  question_zh: string
  options: AdaptiveOption[]
}

export const ADAPTIVE_BANK = adaptiveBankFile.adaptive_bank as Record<string, AdaptiveDomainMeta>

export const ADAPTIVE_CODE_TO_DOMAIN: Record<string, string> = Object.fromEntries(
  Object.entries(ADAPTIVE_BANK).map(([domain, meta]) => [meta.code, domain]),
)

/** First adaptive bank item — used so the opening /learn-test record is already adaptive. */
export const FIRST_ADAPTIVE_CODE = Object.values(ADAPTIVE_BANK)[0]?.code || "A1"

export const QUESTIONS = {
  lesson_focus: { en: "What was the main lesson focus today?", zh: "今堂主要學習或活動內容係咩？" },
  lesson_focus_helper: {
    en: "Short answer with 10 words.",
    zh: "短答，約 10 個字。",
  },
  availability: {
    en: "Were you able to make a valid observation of this child today?",
    zh: "今堂有冇足夠機會觀察到呢位小朋友嘅實際表現？",
  },
  insufficient_reason: { en: "Why was there not enough opportunity to observe?", zh: "點解今堂未能作出有效觀察？" },
  insufficient_explanation: { en: "Please provide any necessary explanation.", zh: "如有需要，可以補充當時情況。" },
  progress_level: { en: "At what level did the child complete today's main task?", zh: "孩子今堂主要以咩程度完成活動？" },
  observation_type: { en: "What best describes today's main observation?", zh: "今堂最值得記錄嘅主要係邊一種情況？" },
  observation_domain: { en: "Which area was the observation mainly about?", zh: "呢項觀察主要關於邊一方面？" },
  observation_context: { en: "When did this happen?", zh: "呢個情況發生喺咩時候？" },
  factual_evidence: { en: "What did the child actually do or say?", zh: "孩子當時實際做咗或講咗啲咩？" },
  outcome: { en: "What happened afterwards?", zh: "呢個情況之後，結果最接近邊一項？" },
  support_provided: { en: "What support did you provide in this situation?", zh: "針對以上情況，導師提供過邊種支援？" },
  response_to_support: {
    en: "How did the child respond after the support was provided?",
    zh: "提供支援後，孩子點樣反應？",
  },
  learning_approach: {
    en: "What was the child's most noticeable learning approach today?",
    zh: "今堂最明顯嘅學習方式係咩？",
  },
  next_step: { en: "What is the most useful next step for the next lesson?", zh: "下一堂最值得繼續練習或支援嘅係咩？" },
  next_step_helper: {
    en: "Write one action that can actually be used in the next lesson.",
    zh: "寫低一項下一堂真正用得著嘅行動。",
  },
  additional_note: { en: "Is there anything else that should be noted?", zh: "仲有冇其他需要補充嘅情況？" },
  add_second_observation: { en: "Add another important observation", zh: "加入另一項重要觀察" },
  confirmation: {
    en: "I confirm that this record is based on my direct observation of this child during today's lesson.",
    zh: "我確認以上紀錄係根據本人今堂對呢位小朋友嘅實際觀察。",
  },
} as const

export const AVAILABILITY_OPTIONS: BilingualOption[] = [
  { id: "valid_observation", en: "Yes, I made a valid observation.", zh: "有，我有一項實際觀察。" },
  {
    id: "insufficient_opportunity",
    en: "No, there was not enough opportunity to observe.",
    zh: "冇，今堂冇足夠機會作出有效觀察。",
  },
]

export const INSUFFICIENT_REASONS: BilingualOption[] = [
  { id: "Arrived late", en: "Arrived late", zh: "遲到" },
  { id: "Left early", en: "Left early", zh: "早退" },
  { id: "Did not participate", en: "Did not participate", zh: "冇參與" },
  { id: "Observation time was too short", en: "Observation time was too short", zh: "觀察時間太短" },
  { id: "Lesson was interrupted", en: "Lesson was interrupted", zh: "課堂被打斷" },
  { id: "Child was unwell", en: "Child was unwell", zh: "小朋友身體唔適" },
  { id: "Operational issue prevented observation", en: "Operational issue prevented observation", zh: "運作問題令觀察無法進行" },
  { id: "Other", en: "Other", zh: "其他" },
]

export const PROGRESS_LEVEL_OPTIONS: BilingualOption[] = [
  { id: "supported", en: "Needed substantial support", zh: "需要成人持續協助先能完成主要部分" },
  { id: "guided", en: "Completed with demonstration or prompts", zh: "經示範、例子或提示後能繼續" },
  { id: "developing", en: "Completed with light support", zh: "熟悉部分能自行完成，個別步驟需要協助" },
  { id: "independent", en: "Completed mostly independently", zh: "大部分過程能自行完成" },
]

export const OBSERVATION_TYPE_OPTIONS: BilingualOption[] = [
  { id: "strength_progress", en: "A positive performance or improvement", zh: "一項正面表現或進步" },
  { id: "support_need", en: "A situation requiring support or further attention", zh: "一項需要支援或繼續留意嘅情況" },
  { id: "routine_representative", en: "A routine but representative performance", zh: "一項普通但有代表性嘅表現" },
]

export const OBSERVATION_DOMAIN_OPTIONS: BilingualOption[] = [
  { id: "starting_initiative", en: "Starting and initiative", zh: "開始活動及主動性" },
  { id: "attention_engagement", en: "Attention and sustained engagement", zh: "專注及持續參與" },
  { id: "understanding_task", en: "Understanding instructions or task requirements", zh: "理解要求、指示或任務" },
  { id: "independence_task_approach", en: "Independence and task approach", zh: "獨立完成及處理任務方式" },
  { id: "challenge_persistence", en: "Response to challenge and persistence", zh: "面對困難及持續嘗試" },
  { id: "feedback_adaptation", en: "Response to feedback and adjustment", zh: "接受提示及作出調整" },
  { id: "problem_solving_flexibility", en: "Problem-solving and flexibility", zh: "解難及轉換方法" },
  { id: "accuracy_self_checking", en: "Accuracy, checking and correction", zh: "準確度、檢查及修正" },
  { id: "communication_help_seeking", en: "Communication, questions and help-seeking", zh: "表達、提問及尋求協助" },
  { id: "peer_interaction", en: "Peer interaction and cooperation", zh: "與其他小朋友互動及配合" },
  { id: "skill_application", en: "Skill, knowledge or application", zh: "技巧、知識或實際應用" },
  { id: "emotion_reengagement", en: "Emotional response and re-engagement", zh: "情緒反應及重新投入" },
  { id: "other", en: "Other", zh: "其他" },
]

export const OBSERVATION_CONTEXT_OPTIONS: BilingualOption[] = [
  { id: "starting_task", en: "Starting a task", zh: "開始任務時" },
  { id: "listening_instruction", en: "Listening to instruction", zh: "聽指示時" },
  { id: "independent_work", en: "Working independently", zh: "獨立工作時" },
  { id: "after_difficulty", en: "After difficulty", zh: "遇到困難之後" },
  { id: "after_feedback", en: "After feedback", zh: "收到回饋之後" },
  { id: "peer_activity", en: "During peer activity", zh: "同儕活動時" },
  { id: "waiting_turn", en: "Waiting for a turn", zh: "等候輪到自己時" },
  { id: "checking_work", en: "Checking work", zh: "檢查作品時" },
  { id: "throughout_task", en: "Throughout the task", zh: "成個任務過程" },
  { id: "other", en: "Other", zh: "其他" },
]

export const OUTCOME_OPTIONS: BilingualOption[] = [
  { id: "continued_independently", en: "Continued independently", zh: "自行繼續" },
  { id: "changed_approach_continued", en: "Changed approach and continued", zh: "改方法後繼續" },
  { id: "continued_after_one_prompt", en: "Continued after one prompt", zh: "一次提示後繼續" },
  { id: "continued_with_repeated_support", en: "Continued with repeated support", zh: "需要多次支援先繼續" },
  { id: "completed_partially", en: "Completed partially", zh: "只完成部分" },
  { id: "did_not_continue", en: "Did not continue", zh: "冇再繼續" },
  { id: "no_clear_impact", en: "No clear impact", zh: "未見明顯影響" },
  { id: "insufficient_time", en: "Insufficient time", zh: "時間不足" },
  { id: "other", en: "Other", zh: "其他" },
]

export const SUPPORT_GIVEN_OPTIONS: BilingualOption[] = [
  { id: "reexplain_instruction", en: "Re-explained the instruction", zh: "再解釋指示" },
  { id: "demonstrate_first_step", en: "Demonstrated the first step", zh: "示範第一步" },
  { id: "demonstrate_full_task", en: "Demonstrated the full task", zh: "示範成個任務" },
  { id: "break_into_steps", en: "Broke the task into steps", zh: "拆成步驟" },
  { id: "verbal_prompt", en: "Gave a verbal prompt", zh: "口頭提示" },
  { id: "visual_example", en: "Showed a visual example", zh: "提供視覺例子" },
  { id: "wait_time", en: "Gave wait time", zh: "俾等待時間" },
  { id: "encouragement", en: "Gave encouragement", zh: "鼓勵" },
  { id: "offer_choice", en: "Offered a choice", zh: "提供選擇" },
  { id: "short_break", en: "Gave a short break", zh: "短暫休息" },
  { id: "reduce_distraction", en: "Reduced distraction", zh: "減少干擾" },
  { id: "peer_modelling", en: "Used peer modelling", zh: "同儕示範" },
  { id: "physical_guidance", en: "Gave physical guidance", zh: "肢體引導" },
  { id: "other", en: "Other", zh: "其他" },
]

export const RESPONSE_TO_SUPPORT_OPTIONS: BilingualOption[] = [
  { id: "adjusted_immediately", en: "Adjusted immediately", zh: "即時作出調整" },
  { id: "continued_after_thinking", en: "Continued after thinking", zh: "思考後繼續" },
  { id: "continued_after_one_support", en: "Continued after one support", zh: "一次支援後繼續" },
  { id: "needed_repeated_support", en: "Needed repeated support", zh: "需要多次支援" },
  { id: "reengaged_after_break", en: "Re-engaged after a break", zh: "休息後重新投入" },
  { id: "partially_reengaged", en: "Partially re-engaged", zh: "部分重新投入" },
  { id: "no_clear_change", en: "No clear change", zh: "未見明顯轉變" },
  { id: "did_not_reengage", en: "Did not re-engage", zh: "冇重新投入" },
  { id: "insufficient_time", en: "Insufficient time", zh: "時間不足" },
  { id: "other", en: "Other", zh: "其他" },
]

export const LEARNING_APPROACH_OPTIONS: BilingualOption[] = [
  { id: "participates_actively", en: "Participates actively", zh: "積極參與" },
  { id: "responds_well_to_feedback", en: "Responds well to feedback", zh: "對回饋反應良好" },
  { id: "works_carefully", en: "Works carefully", zh: "細心工作" },
  { id: "tries_independently", en: "Tries independently", zh: "獨立嘗試" },
  { id: "needs_encouragement_to_start", en: "Needs encouragement to start", zh: "需要鼓勵先開始" },
  { id: "stays_focused", en: "Stays focused", zh: "保持專注" },
  { id: "collaborates_well", en: "Collaborates well", zh: "合作良好" },
  { id: "shows_persistence", en: "Shows persistence", zh: "展現毅力" },
  { id: "hesitant_with_new_tasks", en: "Hesitant with new tasks", zh: "面對新任務會猶豫" },
  { id: "shows_initiative", en: "Shows initiative", zh: "展現主動性" },
  { id: "asks_questions", en: "Asks questions", zh: "主動提問" },
  { id: "checks_mistakes_carefully", en: "Checks mistakes carefully", zh: "仔細檢查錯誤" },
]

export const APPROACH_ID_TO_LABEL = Object.fromEntries(
  LEARNING_APPROACH_OPTIONS.map((o) => [o.id, o.en]),
) as Record<string, string>

export const APPROACH_LABEL_TO_ID = Object.fromEntries(
  LEARNING_APPROACH_OPTIONS.map((o) => [o.en, o.id]),
) as Record<string, string>

export type Version2Observation = {
  observation_type: string
  domain: string
  domain_other: string
  context: string
  context_other: string
  evidence: string
  outcome: string
  outcome_other: string
  support_given: string[]
  support_given_other: string
  response_to_support: string
  response_to_support_other: string
}

export type Version2LearningRecordForm = {
  class_id: string
  enrollment_id: string
  student_name: string
  photo_url: string
  class_focus: string
  availability: string
  insufficient_reason: string
  insufficient_reason_other: string
  insufficient_explanation: string
  progress_level: string
  route_used: "baseline" | "adaptive" | ""
  adaptive_q_code: string
  adaptive_domain: string
  adaptive_answer_id: string
  adaptive_other_text: string
  primary: Version2Observation
  include_observation_2: boolean
  observation_2: Version2Observation
  learning_approach_ids: string[]
  student_work_on: string
  additional_comment: string
  next_focus: string
}

export function emptyObservation(): Version2Observation {
  return {
    observation_type: "",
    domain: "",
    domain_other: "",
    context: "",
    context_other: "",
    evidence: "",
    outcome: "",
    outcome_other: "",
    support_given: [],
    support_given_other: "",
    response_to_support: "",
    response_to_support_other: "",
  }
}

export function emptyVersion2Form(): Version2LearningRecordForm {
  return {
    class_id: "",
    enrollment_id: "",
    student_name: "",
    photo_url: "",
    class_focus: "",
    availability: "",
    insufficient_reason: "",
    insufficient_reason_other: "",
    insufficient_explanation: "",
    progress_level: "",
    route_used: "baseline",
    adaptive_q_code: "",
    adaptive_domain: "",
    adaptive_answer_id: "",
    adaptive_other_text: "",
    primary: emptyObservation(),
    include_observation_2: false,
    observation_2: emptyObservation(),
    learning_approach_ids: [],
    student_work_on: "",
    additional_comment: "",
    next_focus: "",
  }
}

export function applyPreviousNextFocus(form: Version2LearningRecordForm, nextFocus: string | null | undefined) {
  const code = String(nextFocus || "").trim()
  const domain = ADAPTIVE_CODE_TO_DOMAIN[code]
  if (!domain) {
    return { ...form, route_used: "baseline" as const, adaptive_q_code: "", adaptive_domain: "" }
  }
  return {
    ...form,
    route_used: "adaptive" as const,
    adaptive_q_code: code,
    adaptive_domain: domain,
  }
}

export function newAdaptiveFormFromHistory(
  extras: Partial<Version2LearningRecordForm>,
  historyRows: Array<{ next_focus?: string | null; observation_payload?: Record<string, unknown> | null }> = [],
): Version2LearningRecordForm {
  return applyPreviousNextFocus(
    { ...emptyVersion2Form(), ...extras },
    latestNextFocus(historyRows) || FIRST_ADAPTIVE_CODE,
  )
}

export function adaptiveOption(domain: string, answerId: string): AdaptiveOption | undefined {
  return ADAPTIVE_BANK[domain]?.options.find((o) => o.id === answerId)
}

export function observationRequiresSupport(form: Version2LearningRecordForm, obs: Version2Observation, isPrimary: boolean) {
  if (form.availability !== "valid_observation") return false
  if (isPrimary && form.route_used === "adaptive") {
    return Boolean(adaptiveOption(form.adaptive_domain, form.adaptive_answer_id)?.requires_support_block)
  }
  return obs.observation_type === "support_need"
}

export function nextStepRequired(form: Version2LearningRecordForm) {
  if (form.availability !== "valid_observation") return false
  const triggeringOutcomes = new Set([
    "completed_partially",
    "continued_with_repeated_support",
    "did_not_continue",
  ])
  const obsList = [form.primary, form.include_observation_2 ? form.observation_2 : null]
  for (const obs of obsList) {
    if (!obs) continue
    if (obs.observation_type === "support_need") return true
    if (triggeringOutcomes.has(obs.outcome)) return true
    if (obs.response_to_support === "needed_repeated_support") return true
  }
  if (form.route_used === "adaptive") {
    const opt = adaptiveOption(form.adaptive_domain, form.adaptive_answer_id)
    if (opt?.evidence_interpretation === "support_need") return true
  }
  return false
}

function needOther(value: string, otherText: string, label: string) {
  if (String(value || "").toLowerCase() === "other" && !otherText.trim()) {
    return `${label} other text is required.`
  }
  return null
}

export function validateVersion2Form(form: Version2LearningRecordForm, opts?: { confirm?: boolean }): string | null {
  const confirm = opts?.confirm !== false
  if (!form.class_id) return "Class session is required."
  if (!form.class_focus.trim() || form.class_focus.trim().length < 3) {
    return "Lesson focus is required (at least 3 characters)."
  }
  if (!confirm) return null
  if (!form.availability) return "Observation availability is required."

  if (form.availability === "insufficient_opportunity") {
    if (confirm && !form.insufficient_reason) return "Please choose why there was not enough opportunity to observe."
    const otherErr = needOther(form.insufficient_reason, form.insufficient_reason_other, "Insufficient reason")
    if (otherErr) return otherErr
    return null
  }

  if (form.availability !== "valid_observation") return "Invalid availability."
  if (!form.progress_level) return "Progress level is required."
  if (!PROGRESS_LEVEL_OPTIONS.some((o) => o.id === form.progress_level)) return "Invalid progress level."
  if (form.learning_approach_ids.length < 1 || form.learning_approach_ids.length > 2) {
    return "Learning approach: choose 1–2."
  }
  for (const id of form.learning_approach_ids) {
    if (!APPROACH_ID_TO_LABEL[id]) return `Invalid learning approach: ${id}`
  }

  const evidence = form.primary.evidence.trim()
  if (evidence.length < 10) return "Factual evidence must be at least 10 characters."

  if (!form.primary.context) return "Observation context is required."
  const contextOther = needOther(form.primary.context, form.primary.context_other, "Observation context")
  if (contextOther) return contextOther

  if (form.route_used === "adaptive") {
    if (!form.adaptive_q_code || !form.adaptive_domain || !form.adaptive_answer_id) {
      return "Today's adaptive observation answer is required."
    }
    const opt = adaptiveOption(form.adaptive_domain, form.adaptive_answer_id)
    if (!opt) return "Invalid adaptive answer."
    if (form.adaptive_answer_id === "other" && form.adaptive_other_text.trim().length < 3) {
      return "Please describe the other adaptive answer."
    }
  } else {
    if (!form.primary.observation_type) return "Observation type is required."
    if (!form.primary.domain) return "Observation domain is required."
    if (!form.primary.outcome) return "Outcome is required."
    const errs = [
      needOther(form.primary.domain, form.primary.domain_other, "Observation domain"),
      needOther(form.primary.outcome, form.primary.outcome_other, "Outcome"),
    ].filter(Boolean)
    if (errs[0]) return errs[0]
  }

  if (observationRequiresSupport(form, form.primary, true)) {
    if (!form.primary.support_given.length || form.primary.support_given.length > 2) {
      return "Support used: choose 1–2."
    }
    if (!form.primary.response_to_support) return "Response to support is required."
    if (form.primary.support_given.includes("other") && !form.primary.support_given_other.trim()) {
      return "Support other text is required."
    }
    const respOther = needOther(form.primary.response_to_support, form.primary.response_to_support_other, "Response to support")
    if (respOther) return respOther
  }

  if (form.include_observation_2) {
    const o2 = form.observation_2
    if (!o2.observation_type || !o2.domain || !o2.context || !o2.outcome || o2.evidence.trim().length < 10) {
      return "Observation 2 needs type, domain, context, evidence, and outcome."
    }
  }

  if (nextStepRequired(form) && form.student_work_on.trim().length < 5) {
    return "Next step is required for this observation (at least 5 characters)."
  }
  if (form.student_work_on.trim().length > 120) return "Next step must be 120 characters or fewer."
  return null
}

export function rotateNextFocus(currentCode: string | null | undefined, usedCodes: string[] = []) {
  const order = Object.values(ADAPTIVE_BANK).map((m) => m.code)
  if (!order.length) return ""
  const used = new Set(usedCodes.filter(Boolean))
  const idx = order.indexOf(String(currentCode || ""))
  const start = idx < 0 ? -1 : idx
  for (let i = 1; i <= order.length; i += 1) {
    const code = order[(start + i + order.length) % order.length]
    if (!used.has(code) || i === order.length) return code
  }
  return order[0]
}

export function latestNextFocus(rows: Array<{ next_focus?: string | null; observation_payload?: Record<string, unknown> | null }>) {
  for (const row of rows || []) {
    const payload = row.observation_payload
    const fromPayload = payload && typeof payload === "object" ? String(payload.next_focus || "") : ""
    const code = String(row.next_focus || fromPayload || "").trim()
    if (code) return code
  }
  return null
}

export function usedAdaptiveCodes(rows: Array<{ observation_payload?: Record<string, unknown> | null }>) {
  const codes: string[] = []
  for (const row of rows || []) {
    const payload = row.observation_payload
    const code = payload && typeof payload === "object" ? String(payload.adaptive_q_code || "").trim() : ""
    if (code) codes.push(code)
  }
  return codes
}

export function assignNextFocus(form: Version2LearningRecordForm, historyRows: Array<{ next_focus?: string | null; observation_payload?: Record<string, unknown> | null }> = []) {
  if (form.availability !== "valid_observation") {
    return { ...form, next_focus: "" }
  }
  const used = usedAdaptiveCodes(historyRows)
  if (form.adaptive_q_code) used.push(form.adaptive_q_code)
  return {
    ...form,
    next_focus: rotateNextFocus(form.adaptive_q_code || latestNextFocus(historyRows), used),
  }
}

export function bilingual(opt: BilingualOption | undefined, zh: boolean) {
  if (!opt) return ""
  return zh ? `${opt.en}  ${opt.zh}` : `${opt.en}  ${opt.zh}`
}

export function summarizeObservation(form: Version2LearningRecordForm): string[] {
  if (form.availability !== "valid_observation") return []
  const bits: string[] = []
  if (form.route_used === "adaptive") {
    const opt = adaptiveOption(form.adaptive_domain, form.adaptive_answer_id)
    if (opt) bits.push(opt.en)
    if (form.adaptive_domain) bits.push(form.adaptive_domain)
  } else {
    if (form.primary.observation_type) bits.push(form.primary.observation_type)
    if (form.primary.domain) bits.push(form.primary.domain)
    if (form.primary.outcome) bits.push(form.primary.outcome)
  }
  return bits.slice(0, 2)
}

export function toObservationPayload(form: Version2LearningRecordForm) {
  const primary =
    form.route_used === "adaptive" && !form.primary.domain
      ? { ...form.primary, domain: form.adaptive_domain }
      : form.primary
  return {
    schema_version: "2",
    availability: form.availability,
    insufficient_reason: form.insufficient_reason || null,
    insufficient_reason_other: form.insufficient_reason_other || null,
    insufficient_explanation: form.insufficient_explanation || null,
    route_used: form.route_used || null,
    adaptive_q_code: form.adaptive_q_code || null,
    adaptive_domain: form.adaptive_domain || null,
    adaptive_answer_id: form.adaptive_answer_id || null,
    adaptive_other_text: form.adaptive_other_text || null,
    primary,
    include_observation_2: form.include_observation_2,
    observation_2: form.include_observation_2 ? form.observation_2 : null,
    learning_approach_ids: form.learning_approach_ids,
    next_focus: form.next_focus || null,
  }
}

export function formFromRecordRow(
  rec: {
    class_id?: number | string | null
    enrollment_id?: number | string | null
    student_name?: string | null
    photo_url?: string | null
    class_focus?: string | null
    progress_level?: string | null
    student_work_on?: string | null
    additional_comment?: string | null
    learning_traits?: string[] | null
    next_focus?: string | null
    schema_version?: string | null
    observation_payload?: Record<string, unknown> | null
  },
  extras?: Partial<Version2LearningRecordForm>,
): Version2LearningRecordForm {
  const base: Partial<Version2LearningRecordForm> = {
    class_id: rec.class_id != null ? String(rec.class_id) : "",
    enrollment_id: rec.enrollment_id != null ? String(rec.enrollment_id) : "",
    student_name: rec.student_name || "",
    photo_url: rec.photo_url || "",
    class_focus: rec.class_focus || "",
    progress_level: rec.progress_level || "",
    student_work_on: rec.student_work_on || "",
    additional_comment: rec.additional_comment || "",
    next_focus: rec.next_focus || "",
    ...extras,
  }
  const payload = rec.observation_payload
  if (
    payload &&
    typeof payload === "object" &&
    (payload.schema_version === "2" || rec.schema_version === "2" || payload.availability)
  ) {
    return formFromPayload(base, payload)
  }
  return {
    ...emptyVersion2Form(),
    ...base,
    availability: rec.class_focus ? "valid_observation" : "",
    route_used: "baseline",
    learning_approach_ids: (rec.learning_traits || [])
      .map((label) => APPROACH_LABEL_TO_ID[label])
      .filter(Boolean),
  }
}

export function buildVersion2ApiBody(
  form: Version2LearningRecordForm,
  opts?: { confirm?: boolean; force?: boolean },
) {
  const approaches = form.learning_approach_ids.map((id) => APPROACH_ID_TO_LABEL[id]).filter(Boolean)
  return {
    schema_version: "2",
    class_id: Number(form.class_id),
    enrollment_id: form.enrollment_id ? Number(form.enrollment_id) : null,
    student_name: form.student_name || null,
    photo_url: form.photo_url || null,
    class_focus: form.class_focus.trim(),
    progress_level: form.progress_level || null,
    observed: summarizeObservation(form),
    strongest_areas: [] as string[],
    attention_areas: [] as string[],
    student_work_on: form.student_work_on.trim() || null,
    learning_traits: approaches,
    additional_comment: form.additional_comment.trim() || null,
    observation_payload: toObservationPayload(form),
    next_focus: form.next_focus || null,
    confirm: Boolean(opts?.confirm),
    force: opts?.force ? 1 : undefined,
  }
}

export function formFromPayload(
  base: Partial<Version2LearningRecordForm>,
  payload: Record<string, unknown> | null | undefined,
): Version2LearningRecordForm {
  const empty = { ...emptyVersion2Form(), ...base }
  if (!payload || typeof payload !== "object") return empty
  const primary = (payload.primary as Version2Observation) || empty.primary
  const observation2 = (payload.observation_2 as Version2Observation) || empty.observation_2
  return {
    ...empty,
    availability: String(payload.availability || empty.availability),
    insufficient_reason: String(payload.insufficient_reason || ""),
    insufficient_reason_other: String(payload.insufficient_reason_other || ""),
    insufficient_explanation: String(payload.insufficient_explanation || ""),
    route_used: (payload.route_used as Version2LearningRecordForm["route_used"]) || empty.route_used,
    adaptive_q_code: String(payload.adaptive_q_code || ""),
    adaptive_domain: String(payload.adaptive_domain || ""),
    adaptive_answer_id: String(payload.adaptive_answer_id || ""),
    adaptive_other_text: String(payload.adaptive_other_text || ""),
    primary: { ...emptyObservation(), ...primary, support_given: Array.isArray(primary.support_given) ? primary.support_given : [] },
    include_observation_2: Boolean(payload.include_observation_2),
    observation_2: {
      ...emptyObservation(),
      ...observation2,
      support_given: Array.isArray(observation2?.support_given) ? observation2.support_given : [],
    },
    learning_approach_ids: Array.isArray(payload.learning_approach_ids)
      ? (payload.learning_approach_ids as string[])
      : empty.learning_approach_ids,
    next_focus: String(payload.next_focus || ""),
  }
}

const DRAFT_PREFIX = "classz.learning-record.draft.v2:"

export function learningRecordDraftKey(parts: Array<string | number | null | undefined>) {
  return DRAFT_PREFIX + parts.map((part) => String(part ?? "")).join(":")
}

export function isMeaningfulLearningRecordDraft(form: Version2LearningRecordForm) {
  return Boolean(
    form.class_focus.trim() ||
      form.availability ||
      form.progress_level ||
      form.primary.evidence.trim() ||
      form.student_work_on.trim() ||
      form.additional_comment.trim() ||
      form.photo_url ||
      form.learning_approach_ids.length ||
      form.adaptive_answer_id,
  )
}

export function saveLearningRecordDraft(key: string, form: Version2LearningRecordForm) {
  if (typeof window === "undefined") return
  try {
    window.sessionStorage.setItem(key, JSON.stringify(form))
  } catch {
    /* private mode / quota */
  }
}

export function loadLearningRecordDraft(key: string): Version2LearningRecordForm | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.sessionStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Version2LearningRecordForm>
    if (!parsed || typeof parsed !== "object") return null
    return {
      ...emptyVersion2Form(),
      ...parsed,
      primary: {
        ...emptyObservation(),
        ...(parsed.primary || {}),
        support_given: Array.isArray(parsed.primary?.support_given) ? parsed.primary.support_given : [],
      },
      observation_2: {
        ...emptyObservation(),
        ...(parsed.observation_2 || {}),
        support_given: Array.isArray(parsed.observation_2?.support_given) ? parsed.observation_2.support_given : [],
      },
      learning_approach_ids: Array.isArray(parsed.learning_approach_ids) ? parsed.learning_approach_ids : [],
    }
  } catch {
    return null
  }
}

export function clearLearningRecordDraft(key: string) {
  if (typeof window === "undefined") return
  try {
    window.sessionStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}
