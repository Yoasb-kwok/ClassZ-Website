"use client"

import { AdminInput, AdminSelect, AdminTextarea } from "@/components/classz-admin-ui"
import {
  ADAPTIVE_BANK,
  AVAILABILITY_OPTIONS,
  INSUFFICIENT_REASONS,
  LEARNING_APPROACH_OPTIONS,
  OBSERVATION_CONTEXT_OPTIONS,
  OBSERVATION_DOMAIN_OPTIONS,
  OBSERVATION_TYPE_OPTIONS,
  OUTCOME_OPTIONS,
  PROGRESS_LEVEL_OPTIONS,
  QUESTIONS,
  RESPONSE_TO_SUPPORT_OPTIONS,
  SUPPORT_GIVEN_OPTIONS,
  UNABLE_PROGRESS_OPTION,
  observationRequiresSupport,
  nextStepRequired,
  type BilingualOption,
  type Version2LearningRecordForm,
  type Version2Observation,
} from "@/lib/version2-learning-record"

const SELECTED = "border-2 border-[#222] bg-[#222] text-white"
const IDLE = "admin-frame-border bg-white text-[#222] hover:bg-[#f7f7f7]"

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-brand-teal">{children}</h3>
}

function Q({ k }: { k: keyof typeof QUESTIONS }) {
  const q = QUESTIONS[k]
  return (
    <p className="text-sm font-medium text-[#222]">
      {q.en}
      <span className="mt-0.5 block text-xs font-normal text-[#717171]">{q.zh}</span>
    </p>
  )
}

function DarkChoice({
  selected,
  onClick,
  children,
  className = "",
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`rounded-lg px-3 py-2.5 text-left text-sm leading-snug transition-colors ${selected ? SELECTED : IDLE} ${className}`}
    >
      {children}
    </button>
  )
}

function OptionLabel({ opt }: { opt: BilingualOption }) {
  return (
    <>
      <span className="block">{opt.en}</span>
      <span className="block text-[11px] opacity-70">{opt.zh}</span>
    </>
  )
}

function ChoiceGrid({
  options,
  value,
  onChange,
  columns = "grid-cols-1 sm:grid-cols-2",
}: {
  options: BilingualOption[]
  value: string
  onChange: (id: string) => void
  columns?: string
}) {
  return (
    <div className={`grid gap-2 ${columns}`}>
      {options.map((opt) => (
        <DarkChoice key={opt.id} selected={value === opt.id} onClick={() => onChange(opt.id)}>
          <OptionLabel opt={opt} />
        </DarkChoice>
      ))}
    </div>
  )
}

function ChoicePills({
  options,
  value,
  onChange,
}: {
  options: BilingualOption[]
  value: string
  onChange: (id: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <DarkChoice key={opt.id} selected={value === opt.id} onClick={() => onChange(opt.id)} className="rounded-full px-3 py-1.5">
          <span>{opt.en}</span>
        </DarkChoice>
      ))}
    </div>
  )
}

function MultiGrid({
  options,
  value,
  onChange,
  max,
  pills = false,
}: {
  options: BilingualOption[]
  value: string[]
  onChange: (next: string[]) => void
  max: number
  pills?: boolean
}) {
  return (
    <div className={pills ? "flex flex-wrap gap-2" : "grid gap-2 sm:grid-cols-2"}>
      {options.map((opt) => {
        const selected = value.includes(opt.id)
        const blocked = !selected && value.length >= max
        return (
          <button
            key={opt.id}
            type="button"
            aria-pressed={selected}
            disabled={blocked}
            onClick={() => {
              if (selected) onChange(value.filter((id) => id !== opt.id))
              else if (!blocked) onChange([...value, opt.id])
            }}
            className={`${pills ? "rounded-full px-3 py-1.5" : "rounded-lg px-3 py-2.5 text-left"} text-sm leading-snug transition-colors ${
              selected ? SELECTED : blocked ? "cursor-not-allowed border-2 border-[#e5e5e5] bg-white text-[#b0b0b0]" : IDLE
            }`}
          >
            {pills ? opt.en : <OptionLabel opt={opt} />}
          </button>
        )
      })}
    </div>
  )
}

function OtherField({
  show,
  value,
  onChange,
  placeholder,
}: {
  show: boolean
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  if (!show) return null
  return (
    <div className="space-y-1">
      <p className="text-sm text-[#222]">If other, please specify:</p>
      <AdminInput value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function ObservationFields({
  obs,
  onChange,
  showTypeDomainOutcome,
}: {
  obs: Version2Observation
  onChange: (next: Version2Observation) => void
  showTypeDomainOutcome: boolean
}) {
  return (
    <div className="space-y-4">
      {showTypeDomainOutcome ? (
        <>
          <div className="space-y-2">
            <Q k="observation_type" />
            <ChoiceGrid options={OBSERVATION_TYPE_OPTIONS} value={obs.observation_type} onChange={(observation_type) => onChange({ ...obs, observation_type })} />
          </div>
          <div className="space-y-2">
            <Q k="observation_domain" />
            <ChoicePills options={OBSERVATION_DOMAIN_OPTIONS} value={obs.domain} onChange={(domain) => onChange({ ...obs, domain })} />
            <OtherField show={obs.domain === "other"} value={obs.domain_other} placeholder="Describe the other area" onChange={(domain_other) => onChange({ ...obs, domain_other })} />
          </div>
        </>
      ) : null}
      <div className="space-y-2">
        <Q k="observation_context" />
        <ChoicePills options={OBSERVATION_CONTEXT_OPTIONS} value={obs.context} onChange={(context) => onChange({ ...obs, context })} />
        <OtherField show={obs.context === "other"} value={obs.context_other} placeholder="Describe when this happened" onChange={(context_other) => onChange({ ...obs, context_other })} />
      </div>
      <div className="space-y-2">
        <Q k="factual_evidence" />
        <AdminTextarea className="!min-h-[5.5rem]" value={obs.evidence} onChange={(e) => onChange({ ...obs, evidence: e.target.value })} />
        <p className="text-xs text-[#717171]">{obs.evidence.trim().length} / 10+ characters</p>
      </div>
      {showTypeDomainOutcome ? (
        <div className="space-y-2">
          <Q k="outcome" />
          <ChoiceGrid options={OUTCOME_OPTIONS} value={obs.outcome} onChange={(outcome) => onChange({ ...obs, outcome })} />
          <OtherField show={obs.outcome === "other"} value={obs.outcome_other} placeholder="Describe what happened" onChange={(outcome_other) => onChange({ ...obs, outcome_other })} />
        </div>
      ) : null}
    </div>
  )
}

function SupportBlock({
  obs,
  onChange,
  required,
}: {
  obs: Version2Observation
  onChange: (next: Version2Observation) => void
  required: boolean
}) {
  return (
    <div className="space-y-4">
      <SectionTitle>Support Used {required ? "(Conditional)" : "(Optional)"}</SectionTitle>
      <div className="space-y-2">
        <Q k="support_provided" />
        <p className="text-xs text-[#717171]">Select 1–3</p>
        <MultiGrid
          options={SUPPORT_GIVEN_OPTIONS}
          value={obs.support_given}
          max={3}
          onChange={(support_given) => onChange({ ...obs, support_given })}
        />
        <OtherField
          show={obs.support_given.includes("other")}
          value={obs.support_given_other}
          placeholder="Describe the other support"
          onChange={(support_given_other) => onChange({ ...obs, support_given_other })}
        />
      </div>
      <div className="space-y-2">
        <Q k="response_to_support" />
        <ChoiceGrid
          options={RESPONSE_TO_SUPPORT_OPTIONS}
          value={obs.response_to_support}
          onChange={(response_to_support) => onChange({ ...obs, response_to_support })}
        />
        <OtherField
          show={obs.response_to_support === "other"}
          value={obs.response_to_support_other}
          placeholder="Describe the other response"
          onChange={(response_to_support_other) => onChange({ ...obs, response_to_support_other })}
        />
      </div>
    </div>
  )
}

export function Version2LearningRecordFields({
  form,
  onChange,
}: {
  form: Version2LearningRecordForm
  onChange: (next: Version2LearningRecordForm) => void
}) {
  const adaptive = form.route_used === "adaptive"
  const adaptiveMeta = adaptive ? ADAPTIVE_BANK[form.adaptive_domain] : null
  const valid = form.availability === "valid_observation"
  const noObs = form.availability === "insufficient_opportunity"
  const needSupport = observationRequiresSupport(form, form.primary, true)
  const needNext = nextStepRequired(form)
  const progressOptions = adaptive ? [...PROGRESS_LEVEL_OPTIONS, UNABLE_PROGRESS_OPTION] : PROGRESS_LEVEL_OPTIONS
  const yes = AVAILABILITY_OPTIONS[0]
  const no = AVAILABILITY_OPTIONS[1]

  function setAdaptiveDomain(domain: string) {
    const meta = ADAPTIVE_BANK[domain]
    const stillValid = meta?.options.some((opt) => opt.id === form.adaptive_answer_id)
    onChange({
      ...form,
      route_used: "adaptive",
      adaptive_domain: domain,
      adaptive_q_code: meta?.code || "",
      adaptive_answer_id: stillValid ? form.adaptive_answer_id : "",
      adaptive_other_text: stillValid ? form.adaptive_other_text : "",
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <SectionTitle>Lesson Focus</SectionTitle>
        <Q k="lesson_focus" />
        <p className="text-xs text-[#717171]">{QUESTIONS.lesson_focus_helper.en}</p>
        <AdminInput
          value={form.class_focus}
          placeholder="e.g. Building the car and testing wheel alignment"
          onChange={(e) => onChange({ ...form, class_focus: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Q k="availability" />
        <div className="grid gap-2 sm:grid-cols-2">
          <DarkChoice selected={form.availability === yes.id} onClick={() => onChange({ ...form, availability: yes.id })}>
            <OptionLabel opt={yes} />
          </DarkChoice>
          <DarkChoice selected={form.availability === no.id} onClick={() => onChange({ ...form, availability: no.id })}>
            <OptionLabel opt={no} />
          </DarkChoice>
        </div>
      </div>

      {noObs ? (
        <div className="space-y-4">
          <SectionTitle>Insufficient Opportunity (Conditional)</SectionTitle>
          <div className="space-y-2">
            <Q k="insufficient_reason" />
            <ChoiceGrid options={INSUFFICIENT_REASONS} value={form.insufficient_reason} onChange={(insufficient_reason) => onChange({ ...form, insufficient_reason })} />
            <OtherField
              show={form.insufficient_reason === "Other"}
              value={form.insufficient_reason_other}
              placeholder="e.g. The child was called out for another activity"
              onChange={(insufficient_reason_other) => onChange({ ...form, insufficient_reason_other })}
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-[#222]">Please provide any necessary explanation (Optional)</p>
            <p className="text-xs text-[#717171]">{QUESTIONS.insufficient_explanation.zh}</p>
            <AdminTextarea
              className="!min-h-[5.5rem]"
              placeholder="e.g. The child joined only the final ten minutes, so the main task could not be observed"
              value={form.insufficient_explanation}
              onChange={(e) => onChange({ ...form, insufficient_explanation: e.target.value })}
            />
          </div>
        </div>
      ) : null}

      {valid ? (
        <>
          <div className="space-y-2">
            <SectionTitle>Progress Level</SectionTitle>
            <Q k="progress_level" />
            <ChoiceGrid options={progressOptions} value={form.progress_level} onChange={(progress_level) => onChange({ ...form, progress_level })} />
          </div>

          {adaptive && adaptiveMeta ? (
            <div className="space-y-3">
              <SectionTitle>Adaptive Observation</SectionTitle>
              <div className="space-y-1">
                <p className="text-sm font-medium text-[#222]">Adaptive Focus</p>
                <AdminSelect value={form.adaptive_domain} onChange={(e) => setAdaptiveDomain(e.target.value)}>
                  {Object.keys(ADAPTIVE_BANK).map((domain) => {
                    const label = OBSERVATION_DOMAIN_OPTIONS.find((opt) => opt.id === domain)
                    return (
                      <option key={domain} value={domain}>
                        {label?.en || domain}
                      </option>
                    )
                  })}
                </AdminSelect>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-[#222]">{adaptiveMeta.question}</p>
                <p className="text-xs text-[#717171]">{adaptiveMeta.question_zh}</p>
                <ChoiceGrid
                  options={adaptiveMeta.options}
                  value={form.adaptive_answer_id}
                  onChange={(adaptive_answer_id) => onChange({ ...form, adaptive_answer_id })}
                />
                <OtherField
                  show={form.adaptive_answer_id === "other"}
                  value={form.adaptive_other_text}
                  placeholder="Describe what happened"
                  onChange={(adaptive_other_text) => onChange({ ...form, adaptive_other_text })}
                />
              </div>
              <div className="space-y-2">
                <Q k="observation_context" />
                <ChoicePills
                  options={OBSERVATION_CONTEXT_OPTIONS}
                  value={form.primary.context}
                  onChange={(context) => onChange({ ...form, primary: { ...form.primary, context } })}
                />
                <OtherField
                  show={form.primary.context === "other"}
                  value={form.primary.context_other}
                  placeholder="Describe when this happened"
                  onChange={(context_other) => onChange({ ...form, primary: { ...form.primary, context_other } })}
                />
              </div>
              <div className="space-y-2">
                <Q k="factual_evidence" />
                <AdminTextarea
                  className="!min-h-[5.5rem]"
                  value={form.primary.evidence}
                  onChange={(e) => onChange({ ...form, primary: { ...form.primary, evidence: e.target.value } })}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <SectionTitle>Baseline Observation</SectionTitle>
              <ObservationFields
                obs={form.primary}
                showTypeDomainOutcome
                onChange={(primary) => onChange({ ...form, primary })}
              />
            </div>
          )}

          <SupportBlock
            obs={form.primary}
            required={needSupport}
            onChange={(primary) => onChange({ ...form, primary })}
          />

          <div className="space-y-2">
            <SectionTitle>Additional Observation</SectionTitle>
            <Q k="learning_approach" />
            <p className="text-xs text-[#717171]">Select 1–2</p>
            <MultiGrid
              pills
              options={LEARNING_APPROACH_OPTIONS}
              value={form.learning_approach_ids}
              max={2}
              onChange={(learning_approach_ids) => onChange({ ...form, learning_approach_ids })}
            />
          </div>

          <div className="space-y-3">
            <DarkChoice
              selected={form.include_observation_2}
              onClick={() => onChange({ ...form, include_observation_2: !form.include_observation_2 })}
            >
              {QUESTIONS.add_second_observation.en}
              <span className="mt-0.5 block text-xs opacity-70">{QUESTIONS.add_second_observation.zh}</span>
            </DarkChoice>
            {form.include_observation_2 ? (
              <div className="admin-frame-border rounded-xl bg-white p-3">
                <ObservationFields
                  obs={form.observation_2}
                  showTypeDomainOutcome
                  onChange={(observation_2) => onChange({ ...form, observation_2 })}
                />
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <SectionTitle>Next Step {needNext ? "(Conditional)" : "(Optional)"}</SectionTitle>
            <Q k="next_step" />
            <p className="text-xs text-[#717171]">{QUESTIONS.next_step_helper.en}</p>
            <AdminTextarea
              className="!min-h-[5.5rem]"
              value={form.student_work_on}
              onChange={(e) => onChange({ ...form, student_work_on: e.target.value })}
            />
          </div>
        </>
      ) : null}

      {form.availability ? (
        <div className="space-y-2">
          <SectionTitle>Additional Note (Optional)</SectionTitle>
          <Q k="additional_note" />
          <AdminTextarea
            className="!min-h-[5.5rem]"
            value={form.additional_comment}
            onChange={(e) => onChange({ ...form, additional_comment: e.target.value })}
          />
        </div>
      ) : null}
    </div>
  )
}
