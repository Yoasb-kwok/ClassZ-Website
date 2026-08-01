"use client"

import {
  PARENT_REMINDER,
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

const ANIMAL_LABEL_ZH: Record<string, string> = {
  "Rabbit Active Explorer": "兔子・主動探索者",
  "Owl Thoughtful Learner": "貓頭鷹・深思學習者",
  "Dolphin Social Collaborator": "海豚・互動協作者",
  "Turtle Steady Builder": "烏龜・穩健建構者",
  "Fox Creative Problem Solver": "狐狸・創意解題者",
  "Bee Focused Worker": "蜜蜂・專注實踐者",
}

const TRAIT_ZH: Record<string, string> = {
  "Participating actively": "主動參與",
  "Trying independently": "願意獨立嘗試",
  "Showing initiative": "展現主動性",
  "Asking questions": "會提出問題",
  "Asks questions": "會提出問題",
  "Working carefully": "做事仔細",
  "Responding well to feedback": "能回應回饋",
  "Checking mistakes carefully": "會檢查錯誤",
  "Collaborating well": "合作互動良好",
  "Engaging with others during learning": "與他人學習時投入",
  "Showing persistence": "有持續力",
  "Staying focused": "能維持專注",
  "Needing encouragement to start": "開始前需要鼓勵",
}

const HELP_ZH: Record<string, string> = {
  "Give them chances to try before over-explaining.": "可先給孩子嘗試空間，再補充重點說明。",
  "Encourage questions and curiosity.": "鼓勵提問與好奇心，讓探索有方向。",
  "Offer small challenges that allow exploration.": "提供可逐步加深的小挑戰。",
  "Help them reflect after trying, not only focus on the outcome.": "嘗試後引導回顧過程，不只看結果。",
  "Guide them to slow down and review when needed.": "需要時提醒放慢節奏、再檢視一次。",
  "Give clear instructions and examples.": "提供清楚步驟與可參考範例。",
  "Allow time to process and review.": "保留思考與回看時間。",
  "Encourage them to ask questions.": "鼓勵把不確定的地方問出來。",
  "Praise effort, strategy, and improvement, not only results.": "肯定努力、方法與進步，不只看分數。",
  "Help them notice what improved from last time.": "協助孩子看見這次比上次進步的地方。",
  "Encourage group practice or partner activities.": "安排雙人或小組合作任務。",
  "Give opportunities to explain ideas to others.": "讓孩子練習向他人說明想法。",
  "Use positive social encouragement.": "多使用正向社交鼓勵。",
  "Help them balance teamwork with independent practice.": "在合作與獨立練習間取得平衡。",
  "Praise cooperation, listening, and contribution.": "肯定傾聽、協作與貢獻。",
  "Give warm encouragement before starting.": "開始前先給溫和鼓勵，幫助進入狀態。",
  "Break tasks into smaller steps.": "把任務拆解成可完成的小段落。",
  "Allow time to build confidence.": "預留暖身與建立信心的時間。",
  "Notice effort and persistence.": "看見並肯定努力與堅持。",
  "Avoid rushing them too quickly into performance or comparison.": "避免過快比較或過度催促。",
  "Give open-ended challenges.": "提供開放式問題與探索空間。",
  "Ask “What else could you try?”": "用「還可以怎麼試？」引導延伸。",
  "Encourage them to explain their thinking.": "鼓勵說出思考過程與判斷。",
  "Help them organise ideas after exploring.": "探索後協助整理思路與步驟。",
  "Balance creativity with clear next steps.": "在創意與結構化練習間取得平衡。",
  "Set clear goals for each practice.": "每次練習先設定明確小目標。",
  "Keep instructions simple and structured.": "指令保持簡潔且有結構。",
  "Encourage careful checking.": "鼓勵完成後主動檢查。",
  "Celebrate small improvements.": "即時肯定小幅進步。",
  "Add variety when learning becomes too repetitive.": "在重複練習中加入適度變化。",
}

const ANIMAL_COPY_ZH: Record<string, { meaning1: string; meaning2: string; theory: string }> = {
  "Rabbit Active Explorer": {
    meaning1:
      "孩子目前可能透過先嘗試、邊探索邊提問、主動參與的方式學得最好；比起只聽講，動手做通常更能帶動投入。",
    meaning2: "當有機會先試、再調整做法時，學習表現通常會更明顯地進步。",
    theory:
      "此解讀基於兒童在互動與探索中主動建構學習的觀點。當成人提供符合孩子當下能力的引導時，參與度與學習品質通常更穩定。",
  },
  "Owl Thoughtful Learner": {
    meaning1:
      "孩子目前可能在有時間思考、能回顧、收到清楚回饋的情境下學得更好；進步常呈現為循序漸進。",
    meaning2: "若能理解任務背後原因，並獲得具體回饋，通常更有助於修正與提升。",
    theory:
      "此解讀呼應引導需貼近學習者當下發展階段的觀點；適切支持能幫助孩子把外在回饋轉化為下一步行動。",
  },
  "Dolphin Social Collaborator": {
    meaning1:
      "孩子目前可能在互動式學習中更投入，例如討論、合作與彼此觀察；有連結感的學習情境通常能提升參與度。",
    meaning2: "在有同儕交流或鼓勵性回饋的安排下，常較容易展現學習進步。",
    theory:
      "此解讀參考社會學習觀點：孩子常透過觀察、互動與社會回饋來強化理解與表現。",
  },
  "Turtle Steady Builder": {
    meaning1:
      "孩子目前可能在節奏穩定、步驟清楚、情緒安全的環境中學得更好；不一定會先衝，但常能以持續練習慢慢累積成果。",
    meaning2: "任務若能拆成可完成的小步驟，通常更有助於建立信心與穩定表現。",
    theory:
      "此解讀呼應鷹架支持觀點：在適當支持下，孩子可逐步把外在協助轉化為內在能力。",
  },
  "Fox Creative Problem Solver": {
    meaning1:
      "孩子目前可能在可探索多種解法的任務中學得最好；開放式挑戰能讓其嘗試想法、調整策略並深化理解。",
    meaning2: "若能被鼓勵說明思路與檢視結果，通常更有助於把創意轉為可重複的解題能力。",
    theory:
      "此解讀參考建構式與問題解決學習觀點：孩子透過嘗試、反思與修正，逐步建立更穩定的理解。",
  },
  "Bee Focused Worker": {
    meaning1:
      "孩子目前可能在目標清楚、流程穩定的情境下更能發揮；規律練習與持續投入常是主要進步來源。",
    meaning2: "當任務結構明確、可看見小幅進展時，通常更能維持專注與學習動力。",
    theory:
      "此解讀呼應自我調節學習觀點：當孩子能設定目標、監控表現並接收回饋時，學習習慣會更穩固。",
  },
}

function localizeAnimalLabel(label?: string | null, zh = false) {
  if (!label) return label || ""
  return zh ? ANIMAL_LABEL_ZH[label] || label : label
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
  const observedRaw = companion?.often_observed_as || companion?.Often_observed_as || animal?.oftenObservedAs || []
  const observed = zh ? observedRaw.map((item) => TRAIT_ZH[item] || item) : observedRaw
  const helpRaw = companion?.what_may_help || companion?.What_may_help || animal?.whatMayHelp || []
  const help = zh ? helpRaw.map((item) => HELP_ZH[item] || item) : helpRaw
  const theory = companion?.theory || animal?.theory
  const reminder = companion?.parent_reminder || PARENT_REMINDER
  const accent = animal?.accent || "#0ABAB5"
  const soft = animal?.accentSoft || "#E7F8F7"
  const animalZhCopy = ANIMAL_COPY_ZH[animal?.label || ""]
  const displayMeaning1 = zh && animalZhCopy ? animalZhCopy.meaning1 : meaning1
  const displayMeaning2 = zh && animalZhCopy ? animalZhCopy.meaning2 : meaning2
  const displayTheory = zh && animalZhCopy ? animalZhCopy.theory : theory

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
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ background: accent }}
              aria-hidden
            >
              CZ
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-brand-teal">
                {zh ? "ClassZ · 學習夥伴報告" : "ClassZ · Learning Companion Report"}
              </p>
              <div className="mt-1 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-brand-slate">
                    {localizeAnimalLabel(animal?.label || report.primary_companion, zh) || "Learning Companion"}
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
          {displayMeaning1 ? <p className="leading-relaxed text-brand-slate/85">{displayMeaning1}</p> : null}
          {displayMeaning2 ? <p className="leading-relaxed text-brand-slate/85">{displayMeaning2}</p> : null}

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

      {displayTheory && animal ? (
        <SectionBlock soft={soft} art={<PoseArt src={poseForSlot(animal, "why_we_think_this")} />}>
          <div>
            <h4 className="mb-1 font-semibold text-brand-teal">{zh ? "為什麼這樣理解" : "Why we think this"}</h4>
            <p className="leading-relaxed text-brand-slate/85">{displayTheory}</p>
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
                        {localizeAnimalLabel(item.animal_title || item.label || item.companion_key, zh) ||
                          `Supporting ${i + 1}`}
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
