"use client"

import { AdminInput, AdminLabel, AdminTextarea } from "@/components/classz-admin-ui"
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
  observationRequiresSupport,
  nextStepRequired,
  type BilingualOption,
  type Version2LearningRecordForm,
  type Version2Observation,
} from "@/lib/version2-learning-record"

function Q({ k, zh }: { k: keyof typeof QUESTIONS; zh: boolean }) {
  const q = QUESTIONS[k]
  return (
    <AdminLabel>
      <span className="block">{zh ? q.zh : q.en}</span>
      <span className="block font-normal text-xs text-brand-slate/55">{zh ? q.en : q.zh}</span>
    </AdminLabel>
  )
}

function ChoiceList({
  options,
  value,
  onChange,
  name,
}: {
  options: BilingualOption[]
  value: string
  onChange: (id: string) => void
  name: string
}) {
  return (
    <ul className="mt-1 space-y-1">
      {options.map((opt) => {
        const active = value === opt.id
        return (
          <li key={opt.id}>
            <label
              className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
                active ? "border-brand-teal bg-brand-teal/10" : "border-classz-100 bg-white hover:border-classz-300"
              }`}
            >
              <input
                type="radio"
                name={name}
                className="mt-1"
                checked={active}
                onChange={() => onChange(opt.id)}
              />
              <span>
                <span className="block text-brand-slate">{opt.en}</span>
                <span className="block text-xs text-brand-slate/55">{opt.zh}</span>
              </span>
            </label>
          </li>
        )
      })}
    </ul>
  )
}

function MultiChoice({
  options,
  value,
  onChange,
  max,
}: {
  options: BilingualOption[]
  value: string[]
  onChange: (next: string[]) => void
  max: number
}) {
  return (
    <div className="mt-1 flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const selected = value.includes(opt.id)
        const blocked = !selected && value.length >= max
        return (
          <button
            key={opt.id}
            type="button"
            disabled={blocked}
            onClick={() => {
              if (selected) onChange(value.filter((id) => id !== opt.id))
              else if (!blocked) onChange([...value, opt.id])
            }}
            className={`max-w-full rounded-lg border px-2.5 py-1.5 text-left text-xs ${
              selected
                ? "border-brand-teal bg-brand-teal/15 text-brand-teal"
                : blocked
                  ? "cursor-not-allowed border-classz-100 text-classz-300"
                  : "border-classz-200 bg-white text-brand-slate/80 hover:border-classz-300"
            }`}
          >
            <span className="block">{opt.en}</span>
            <span className="block text-[11px] opacity-70">{opt.zh}</span>
          </button>
        )
      })}
    </div>
  )
}

function ObservationFields({
  obs,
  onChange,
  prefix,
  showTypeDomainOutcome,
}: {
  obs: Version2Observation
  onChange: (next: Version2Observation) => void
  prefix: string
  showTypeDomainOutcome: boolean
}) {
  return (
    <div className="space-y-3">
      {showTypeDomainOutcome ? (
        <>
          <div>
            <Q k="observation_type" zh={false} />
            <ChoiceList
              name={`${prefix}-type`}
              options={OBSERVATION_TYPE_OPTIONS}
              value={obs.observation_type}
              onChange={(observation_type) => onChange({ ...obs, observation_type })}
            />
          </div>
          <div>
            <Q k="observation_domain" zh={false} />
            <ChoiceList
              name={`${prefix}-domain`}
              options={OBSERVATION_DOMAIN_OPTIONS}
              value={obs.domain}
              onChange={(domain) => onChange({ ...obs, domain })}
            />
            {obs.domain === "other" ? (
              <AdminInput
                className="mt-2"
                placeholder="Describe the other domain"
                value={obs.domain_other}
                onChange={(e) => onChange({ ...obs, domain_other: e.target.value })}
              />
            ) : null}
          </div>
          <div>
            <Q k="observation_context" zh={false} />
            <ChoiceList
              name={`${prefix}-context`}
              options={OBSERVATION_CONTEXT_OPTIONS}
              value={obs.context}
              onChange={(context) => onChange({ ...obs, context })}
            />
            {obs.context === "other" ? (
              <AdminInput
                className="mt-2"
                placeholder="Describe the other context"
                value={obs.context_other}
                onChange={(e) => onChange({ ...obs, context_other: e.target.value })}
              />
            ) : null}
          </div>
        </>
      ) : (
        <div>
          <Q k="observation_context" zh={false} />
          <ChoiceList
            name={`${prefix}-context`}
            options={OBSERVATION_CONTEXT_OPTIONS}
            value={obs.context}
            onChange={(context) => onChange({ ...obs, context })}
          />
        </div>
      )}
      <div>
        <Q k="factual_evidence" zh={false} />
        <AdminTextarea
          className="mt-1 min-h-[4.5rem]"
          value={obs.evidence}
          onChange={(e) => onChange({ ...obs, evidence: e.target.value })}
        />
        <p className="mt-1 text-xs text-brand-slate/50">{obs.evidence.trim().length} / 10+ characters</p>
      </div>
      {showTypeDomainOutcome ? (
        <div>
          <Q k="outcome" zh={false} />
          <ChoiceList
            name={`${prefix}-outcome`}
            options={OUTCOME_OPTIONS}
            value={obs.outcome}
            onChange={(outcome) => onChange({ ...obs, outcome })}
          />
          {obs.outcome === "other" ? (
            <AdminInput
              className="mt-2"
              placeholder="Describe the other outcome"
              value={obs.outcome_other}
              onChange={(e) => onChange({ ...obs, outcome_other: e.target.value })}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function SupportFields({
  obs,
  onChange,
}: {
  obs: Version2Observation
  onChange: (next: Version2Observation) => void
}) {
  return (
    <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/50 p-3">
      <p className="text-xs font-semibold text-amber-800">This observation requires a Support Block.</p>
      <div>
        <Q k="support_provided" zh={false} />
        <MultiChoice
          options={SUPPORT_GIVEN_OPTIONS}
          value={obs.support_given}
          max={2}
          onChange={(support_given) => onChange({ ...obs, support_given })}
        />
        {obs.support_given.includes("other") ? (
          <AdminInput
            className="mt-2"
            placeholder="Describe the other support"
            value={obs.support_given_other}
            onChange={(e) => onChange({ ...obs, support_given_other: e.target.value })}
          />
        ) : null}
      </div>
      <div>
        <Q k="response_to_support" zh={false} />
        <ChoiceList
          name={`support-response-${obs.observation_type || "p"}`}
          options={RESPONSE_TO_SUPPORT_OPTIONS}
          value={obs.response_to_support}
          onChange={(response_to_support) => onChange({ ...obs, response_to_support })}
        />
        {obs.response_to_support === "other" ? (
          <AdminInput
            className="mt-2"
            placeholder="Describe the other response"
            value={obs.response_to_support_other}
            onChange={(e) => onChange({ ...obs, response_to_support_other: e.target.value })}
          />
        ) : null}
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
  const adaptiveMeta = form.route_used === "adaptive" ? ADAPTIVE_BANK[form.adaptive_domain] : null
  const needSupport = observationRequiresSupport(form, form.primary, true)
  const needNext = nextStepRequired(form)
  const valid = form.availability === "valid_observation"

  return (
    <div className="space-y-4">
      <div>
        <Q k="lesson_focus" zh={false} />
        <p className="text-xs text-brand-slate/55">
          {QUESTIONS.lesson_focus_helper.en}
          <span className="ml-1">{QUESTIONS.lesson_focus_helper.zh}</span>
        </p>
        <AdminTextarea
          className="mt-1 min-h-[3.5rem]"
          value={form.class_focus}
          onChange={(e) => onChange({ ...form, class_focus: e.target.value })}
        />
      </div>

      <div>
        <Q k="availability" zh={false} />
        <ChoiceList
          name="availability"
          options={AVAILABILITY_OPTIONS}
          value={form.availability}
          onChange={(availability) => onChange({ ...form, availability })}
        />
      </div>

      {form.availability === "insufficient_opportunity" ? (
        <div className="space-y-3">
          <div>
            <Q k="insufficient_reason" zh={false} />
            <ChoiceList
              name="insufficient-reason"
              options={INSUFFICIENT_REASONS}
              value={form.insufficient_reason}
              onChange={(insufficient_reason) => onChange({ ...form, insufficient_reason })}
            />
            {form.insufficient_reason === "Other" ? (
              <AdminInput
                className="mt-2"
                placeholder="Please specify"
                value={form.insufficient_reason_other}
                onChange={(e) => onChange({ ...form, insufficient_reason_other: e.target.value })}
              />
            ) : null}
          </div>
          <div>
            <Q k="insufficient_explanation" zh={false} />
            <AdminTextarea
              className="mt-1 min-h-[3.5rem]"
              value={form.insufficient_explanation}
              onChange={(e) => onChange({ ...form, insufficient_explanation: e.target.value })}
            />
          </div>
        </div>
      ) : null}

      {valid ? (
        <>
          <div>
            <Q k="progress_level" zh={false} />
            <ChoiceList
              name="progress-level"
              options={PROGRESS_LEVEL_OPTIONS}
              value={form.progress_level}
              onChange={(progress_level) => onChange({ ...form, progress_level })}
            />
          </div>

          {adaptiveMeta ? (
            <div className="space-y-3 rounded-lg border border-brand-teal/30 bg-brand-teal/5 p-3">
              <p className="text-xs font-semibold text-brand-teal">
                Today&apos;s focus was set at the end of the previous lesson: {form.adaptive_domain} [{form.adaptive_q_code}]
              </p>
              <AdminLabel>
                <span className="block">{adaptiveMeta.question}</span>
                <span className="block font-normal text-xs text-brand-slate/55">{adaptiveMeta.question_zh}</span>
              </AdminLabel>
              <ChoiceList
                name="adaptive-answer"
                options={adaptiveMeta.options}
                value={form.adaptive_answer_id}
                onChange={(adaptive_answer_id) => onChange({ ...form, adaptive_answer_id })}
              />
              {form.adaptive_answer_id === "other" ? (
                <AdminInput
                  placeholder="Describe what happened"
                  value={form.adaptive_other_text}
                  onChange={(e) => onChange({ ...form, adaptive_other_text: e.target.value })}
                />
              ) : null}
            </div>
          ) : null}

          <ObservationFields
            prefix="primary"
            obs={form.primary}
            showTypeDomainOutcome={form.route_used !== "adaptive"}
            onChange={(primary) => onChange({ ...form, primary })}
          />

          {needSupport ? (
            <SupportFields obs={form.primary} onChange={(primary) => onChange({ ...form, primary })} />
          ) : null}

          <div>
            <Q k="learning_approach" zh={false} />
            <MultiChoice
              options={LEARNING_APPROACH_OPTIONS}
              value={form.learning_approach_ids}
              max={2}
              onChange={(learning_approach_ids) => onChange({ ...form, learning_approach_ids })}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.include_observation_2}
              onChange={(e) => onChange({ ...form, include_observation_2: e.target.checked })}
            />
            <span>
              {QUESTIONS.add_second_observation.en}
              <span className="ml-1 text-xs text-brand-slate/55">{QUESTIONS.add_second_observation.zh}</span>
            </span>
          </label>
          {form.include_observation_2 ? (
            <div className="rounded-lg border border-classz-100 p-3">
              <ObservationFields
                prefix="obs2"
                obs={form.observation_2}
                showTypeDomainOutcome
                onChange={(observation_2) => onChange({ ...form, observation_2 })}
              />
            </div>
          ) : null}

          <div>
            <Q k="next_step" zh={false} />
            <p className="text-xs text-brand-slate/55">{QUESTIONS.next_step_helper.en}</p>
            {needNext ? <p className="text-xs text-amber-700">Required for this observation.</p> : null}
            <AdminTextarea
              className="mt-1 min-h-[3.5rem]"
              value={form.student_work_on}
              onChange={(e) => onChange({ ...form, student_work_on: e.target.value })}
            />
          </div>
        </>
      ) : null}

      <div>
        <Q k="additional_note" zh={false} />
        <AdminTextarea
          className="mt-1 min-h-[3.5rem]"
          value={form.additional_comment}
          onChange={(e) => onChange({ ...form, additional_comment: e.target.value })}
        />
      </div>
    </div>
  )
}
