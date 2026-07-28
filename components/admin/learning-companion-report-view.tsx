"use client"

import { SECTIONS } from "@/lib/learning-companion-report"
import type { LearningCompanionReport } from "@/lib/learning-companion-report"
import { AdminStatusChip } from "@/components/classz-admin-ui"

const SECTION_LABELS: Record<string, { zh: string; en: string }> = {
  current_learning_portrait: { zh: "目前學習面貌", en: "Current learning portrait" },
  how_they_approach_something_new: { zh: "面對新事物", en: "How they approach something new" },
  how_they_respond_to_challenge: { zh: "面對挑戰", en: "How they respond to challenge" },
  how_they_learn_with_other_people: { zh: "與人學習", en: "How they learn with others" },
  how_they_respond_to_guidance_and_feedback: {
    zh: "接受指導與回饋",
    en: "Guidance & feedback",
  },
  conditions_that_bring_out_their_best: { zh: "發揮最佳狀態的條件", en: "Conditions for their best" },
  what_parents_may_notice_at_home: { zh: "家長在家可能觀察到", en: "What parents may notice at home" },
  personalised_strategies: { zh: "個人化策略", en: "Personalised strategies" },
  what_classz_will_continue_observing: {
    zh: "ClassZ 將持續觀察",
    en: "What ClassZ will continue observing",
  },
  evidence_and_confidence: { zh: "證據與信心", en: "Evidence & confidence" },
}

function sectionPlain(value: unknown): string {
  if (value == null) return ""
  if (typeof value === "string") return value
  if (Array.isArray(value)) return value.map((v) => String(v)).join("\n")
  if (typeof value === "object" && value && "text" in value) {
    return String((value as { text?: string }).text || "")
  }
  return String(value)
}

export function LearningCompanionReportView({
  report,
  zh,
}: {
  report: LearningCompanionReport
  zh: boolean
}) {
  const narrative = (report.narrative_json || report.narrative || {}) as Record<string, unknown>
  const sections = (narrative.sections ||
    narrative.ai_sections ||
    {}) as Record<string, unknown>
  const companion = narrative.learning_companion_section as
    | { animal_title?: string; What_this_mean1?: string; What_this_mean2?: string; emoji?: string }
    | undefined
  const supporting = (narrative.supporting_descriptions ||
    narrative.supporting_companion_sections ||
    report.supporting_companions ||
    []) as unknown[]
  const validationErrors = (narrative.validation_errors || []) as string[]

  return (
    <div className="space-y-4 text-sm text-brand-slate">
      <div className="flex flex-wrap items-center gap-2">
        <AdminStatusChip tone={report.status === "locked" ? "orange" : "teal"}>
          {report.status}
        </AdminStatusChip>
        {report.primary_companion ? (
          <span className="font-semibold text-brand-teal">{report.primary_companion}</span>
        ) : null}
        <span className="text-xs text-brand-slate/50">
          {report.records_used}/{report.records_required || 4} records
          {report.created_at
            ? ` · ${new Date(report.created_at).toLocaleString(zh ? "zh-HK" : "en-HK")}`
            : ""}
        </span>
      </div>

      {Array.isArray(report.supporting_companions) && report.supporting_companions.length ? (
        <p className="text-xs text-brand-slate/70">
          {zh ? "輔助 Companion：" : "Supporting: "}
          {report.supporting_companions.join(" · ")}
        </p>
      ) : null}

      {companion ? (
        <div className="rounded-lg border border-classz-100 bg-classz-50/60 px-3 py-2 space-y-1">
          <h4 className="font-semibold">
            {companion.emoji ? `${companion.emoji} ` : ""}
            {companion.animal_title || report.primary_companion}
          </h4>
          {companion.What_this_mean1 ? <p className="text-brand-slate/85">{companion.What_this_mean1}</p> : null}
          {companion.What_this_mean2 ? <p className="text-brand-slate/85">{companion.What_this_mean2}</p> : null}
        </div>
      ) : null}

      {SECTIONS.map((key) => {
        const text = sectionPlain(sections[key])
        if (!text) return null
        const label = SECTION_LABELS[key]
        return (
          <div key={key}>
            <h4 className="font-semibold text-brand-slate mb-1">
              {zh ? label?.zh || key : label?.en || key}
            </h4>
            {Array.isArray(sections[key]) ? (
              <ul className="list-disc pl-5 space-y-1 text-brand-slate/85">
                {(sections[key] as unknown[]).map((item, i) => (
                  <li key={i}>{String(item)}</li>
                ))}
              </ul>
            ) : (
              <p className="text-brand-slate/85 whitespace-pre-wrap leading-relaxed">{text}</p>
            )}
          </div>
        )
      })}

      {Array.isArray(supporting) && supporting.length ? (
        <div>
          <h4 className="font-semibold mb-1">{zh ? "Supporting companions" : "Supporting companions"}</h4>
          <ul className="space-y-2">
            {supporting.map((s, i) => {
              const item = s as {
                companion_key?: string
                text?: string
                label?: string
                animal_title?: string
              }
              return (
                <li key={i} className="rounded-lg border border-classz-100 bg-classz-50/50 px-3 py-2">
                  <div className="text-xs font-semibold text-brand-teal mb-0.5">
                    {item.animal_title || item.label || item.companion_key || `Supporting ${i + 1}`}
                  </div>
                  <p className="text-brand-slate/85">{item.text || sectionPlain(s)}</p>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}

      {validationErrors.length ? (
        <details className="text-xs text-brand-slate/55">
          <summary>{zh ? "驗證備註（內部）" : "Validation notes (internal)"}</summary>
          <ul className="list-disc pl-4 mt-1 space-y-0.5">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  )
}
