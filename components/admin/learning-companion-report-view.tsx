"use client"

import {
  PARENT_REMINDER,
  Z_SIR_SRC,
  poseForSlot,
  resolveCompanionAnimal,
} from "@/lib/learning-companion-animals"
import { SECTIONS } from "@/lib/learning-companion-report"
import type { LearningCompanionReport } from "@/lib/learning-companion-report"
import { AdminStatusChip } from "@/components/classz-admin-ui"

const SECTION_LABELS: Record<string, { zh: string; en: string }> = {
  current_learning_portrait: { zh: "目前學習面貌", en: "Your child's current learning portrait" },
  how_they_approach_something_new: { zh: "面對新事物", en: "How they approach something new" },
  how_they_respond_to_challenge: { zh: "面對挑戰", en: "How they respond to challenge" },
  how_they_learn_with_other_people: { zh: "與人學習", en: "How they learn with other people" },
  how_they_respond_to_guidance_and_feedback: {
    zh: "接受指導與回饋",
    en: "How they respond to guidance and feedback",
  },
  conditions_that_bring_out_their_best: { zh: "發揮最佳狀態的條件", en: "Conditions that bring out their best" },
  what_parents_may_notice_at_home: { zh: "家長在家可能觀察到", en: "What parents may notice at home" },
  personalised_strategies: { zh: "個人化策略", en: "Personalised strategies" },
  what_classz_will_continue_observing: {
    zh: "ClassZ 將持續觀察",
    en: "What ClassZ will continue observing",
  },
  evidence_and_confidence: { zh: "證據與信心", en: "Evidence and confidence" },
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

type CompanionSection = {
  animal_title?: string
  emoji?: string
  hero_line?: string
  confidence_message?: string
  meaning_paragraph_1?: string
  meaning_paragraph_2?: string
  What_this_mean1?: string
  What_this_mean2?: string
  often_observed_as?: string[]
  Often_observed_as?: string[]
  what_may_help?: string[]
  What_may_help?: string[]
  theory?: string
  parent_reminder?: string
}

function PoseArt({ src, alt = "" }: { src: string; alt?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="h-44 w-full max-w-[240px] rounded-2xl bg-black object-contain p-2 mx-auto"
    />
  )
}

function SectionBlock({
  children,
  art,
  soft,
  reverse = false,
}: {
  children: React.ReactNode
  art: React.ReactNode
  soft?: string
  reverse?: boolean
}) {
  return (
    <section
      className="overflow-hidden rounded-2xl border border-classz-100"
      style={soft ? { background: soft } : undefined}
    >
      <div
        className={`grid items-center gap-4 p-4 md:p-5 ${
          reverse ? "md:grid-cols-[0.85fr_1.15fr]" : "md:grid-cols-[1.15fr_0.85fr]"
        }`}
      >
        <div className={reverse ? "md:order-2" : undefined}>{children}</div>
        <div className={reverse ? "md:order-1" : undefined}>{art}</div>
      </div>
    </section>
  )
}

export function LearningCompanionReportView({
  report,
  zh,
}: {
  report: LearningCompanionReport
  zh: boolean
}) {
  const narrative = (report.narrative_json || report.narrative || {}) as Record<string, unknown>
  const reportLanguage =
    (narrative.report_language as string | undefined) || report.report_language || "en"
  const sections = (narrative.sections ||
    narrative.ai_sections ||
    {}) as Record<string, unknown>
  const companion = narrative.learning_companion_section as CompanionSection | undefined
  const supporting = (narrative.supporting_descriptions ||
    narrative.supporting_companion_sections ||
    []) as unknown[]
  const validationErrors = (narrative.validation_errors || []) as string[]

  const animal =
    resolveCompanionAnimal(companion?.animal_title) || resolveCompanionAnimal(report.primary_companion)
  const meaning1 = companion?.meaning_paragraph_1 || companion?.What_this_mean1 || animal?.meaning1
  const meaning2 = companion?.meaning_paragraph_2 || companion?.What_this_mean2 || animal?.meaning2
  const observed = companion?.often_observed_as || companion?.Often_observed_as || animal?.oftenObservedAs || []
  const help = companion?.what_may_help || companion?.What_may_help || animal?.whatMayHelp || []
  const theory = companion?.theory || animal?.theory
  const reminder = companion?.parent_reminder || PARENT_REMINDER
  const accent = animal?.accent || "#0ABAB5"
  const soft = animal?.accentSoft || "#E7F8F7"

  const earlyKeys = SECTIONS.slice(0, 5)
  const laterKeys = SECTIONS.slice(5)

  return (
    <div className="space-y-5 text-sm text-brand-slate">
      <div className="flex flex-wrap items-center gap-2">
        <AdminStatusChip tone={report.status === "locked" ? "orange" : "teal"}>
          {report.status}
        </AdminStatusChip>
        <AdminStatusChip tone="magenta">
          {reportLanguage === "zh" ? (zh ? "中文版本" : "Chinese") : zh ? "英文版本" : "English"}
        </AdminStatusChip>
        <span className="text-xs text-brand-slate/50">
          {report.records_used}/{report.records_required || 3} records
          {report.created_at
            ? ` · ${new Date(report.created_at).toLocaleString(zh ? "zh-HK" : "en-HK")}`
            : ""}
        </span>
      </div>

      <SectionBlock
        soft={`linear-gradient(180deg, ${soft}, #ffffff 70%)`}
        art={animal ? <PoseArt src={poseForSlot(animal, "cover")} alt={animal.label} /> : null}
      >
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={Z_SIR_SRC} alt="ClassZ" className="h-10 w-10 object-contain" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-brand-teal">
                ClassZ · Learning Companion Report
              </p>
              <div className="mt-1 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-brand-slate">
                    {animal?.label || report.primary_companion || "Learning Companion"}
                  </h3>
                  <p className="text-xs text-brand-slate/60">
                    {zh ? "學員快照：" : "Snapshot for "}
                    <strong>{report.student_name || "Student"}</strong>
                  </p>
                </div>
                {animal ? (
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
                    style={{ background: accent }}
                    aria-hidden
                  >
                    {animal.initial}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {companion?.hero_line ? (
            <p className="font-medium leading-relaxed text-brand-slate">{companion.hero_line}</p>
          ) : null}
          {companion?.confidence_message ? (
            <p className="text-xs text-brand-slate/60">{companion.confidence_message}</p>
          ) : null}
          {meaning1 ? <p className="leading-relaxed text-brand-slate/85">{meaning1}</p> : null}
          {meaning2 ? <p className="leading-relaxed text-brand-slate/85">{meaning2}</p> : null}

          {observed.length ? (
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-brand-slate/55">
                {zh ? "常見觀察" : "Often observed as"}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {observed.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border bg-white px-2.5 py-1 text-[11px] font-semibold"
                    style={{ borderColor: `${accent}40`, color: accent }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </SectionBlock>

      {help.length && animal ? (
        <SectionBlock reverse art={<PoseArt src={poseForSlot(animal, "what_may_help")} />}>
          <div>
            <h4 className="mb-2 font-semibold text-brand-teal">{zh ? "可以怎樣幫助" : "What may help"}</h4>
            <ul className="list-disc space-y-1 pl-5 text-brand-slate/85">
              {help.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </SectionBlock>
      ) : null}

      {theory && animal ? (
        <SectionBlock soft={soft} art={<PoseArt src={poseForSlot(animal, "why_we_think_this")} />}>
          <div>
            <h4 className="mb-1 font-semibold text-brand-teal">{zh ? "為什麼這樣理解" : "Why we think this"}</h4>
            <p className="leading-relaxed text-brand-slate/85">{theory}</p>
            <p className="mt-2 text-xs text-brand-slate/55">{reminder}</p>
          </div>
        </SectionBlock>
      ) : null}

      {Array.isArray(supporting) && supporting.length && animal ? (
        <SectionBlock reverse art={<PoseArt src={poseForSlot(animal, "supporting")} />}>
          <div>
            <h4 className="mb-2 font-semibold">
              {zh ? "同時反映在學習中的 Companion" : "Also reflected in learning"}
            </h4>
            <ul className="space-y-2">
              {supporting.map((s, i) => {
                const item = s as {
                  companion_key?: string
                  text?: string
                  label?: string
                  animal_title?: string
                }
                if (typeof s === "string") {
                  return (
                    <li key={i} className="rounded-lg border border-classz-100 bg-white px-3 py-2">
                      {s}
                    </li>
                  )
                }
                const supportAnimal =
                  resolveCompanionAnimal(item.animal_title) || resolveCompanionAnimal(item.companion_key)
                return (
                  <li
                    key={i}
                    className="rounded-xl border bg-white px-3 py-2"
                    style={{ borderColor: `${supportAnimal?.accent || "#0ABAB5"}33` }}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      {supportAnimal ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={poseForSlot(supportAnimal, "cover")}
                          alt=""
                          className="h-10 w-10 rounded-lg bg-black object-contain p-0.5"
                        />
                      ) : null}
                      <div className="text-sm font-semibold" style={{ color: supportAnimal?.accent || "#0ABAB5" }}>
                        {item.animal_title || item.label || item.companion_key || `Supporting ${i + 1}`}
                      </div>
                    </div>
                    <p className="text-brand-slate/85">{item.text || sectionPlain(s)}</p>
                  </li>
                )
              })}
            </ul>
          </div>
        </SectionBlock>
      ) : null}

      {animal ? (
        <SectionBlock art={<PoseArt src={poseForSlot(animal, "personalised_interpretation")} />}>
          <div>
            <h4 className="mb-2 font-semibold text-brand-teal">
              {zh ? "個人化解讀" : "Personalised interpretation"}
            </h4>
            <div className="space-y-4">
              {earlyKeys.map((key) => {
                const text = sectionPlain(sections[key])
                if (!text) return null
                const label = SECTION_LABELS[key]
                return (
                  <div key={key}>
                    <h5 className="mb-1 font-semibold text-brand-slate">
                      {zh ? label?.zh || key : label?.en || key}
                    </h5>
                    {Array.isArray(sections[key]) ? (
                      <ul className="list-disc space-y-1 pl-5 text-brand-slate/85">
                        {(sections[key] as unknown[]).map((item, i) => (
                          <li key={i}>{String(item)}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed text-brand-slate/85">{text}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </SectionBlock>
      ) : null}

      {animal ? (
        <SectionBlock reverse art={<PoseArt src={poseForSlot(animal, "strategies_and_next")} />}>
          <div className="space-y-4">
            {laterKeys.map((key) => {
              const text = sectionPlain(sections[key])
              if (!text) return null
              const label = SECTION_LABELS[key]
              return (
                <div key={key}>
                  <h5 className="mb-1 font-semibold text-brand-slate">
                    {zh ? label?.zh || key : label?.en || key}
                  </h5>
                  {Array.isArray(sections[key]) ? (
                    <ul className="list-disc space-y-1 pl-5 text-brand-slate/85">
                      {(sections[key] as unknown[]).map((item, i) => (
                        <li key={i}>{String(item)}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed text-brand-slate/85">{text}</p>
                  )}
                </div>
              )
            })}
          </div>
        </SectionBlock>
      ) : null}

      {validationErrors.length ? (
        <details className="text-xs text-brand-slate/55">
          <summary>{zh ? "驗證備註（內部）" : "Validation notes (internal)"}</summary>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  )
}
