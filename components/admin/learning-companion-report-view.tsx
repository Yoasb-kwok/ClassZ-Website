"use client"

import {
  PARENT_REMINDER,
  PARENT_REMINDER_ZH,
  poseForSlot,
  resolveCompanionAnimal,
} from "@/lib/learning-companion-animals"
import { SECTIONS } from "@/lib/learning-companion-report"
import type { LearningCompanionReport } from "@/lib/learning-companion-report"
import { AdminStatusChip } from "@/components/classz-admin-ui"

const SECTION_LABELS: Record<string, { zh: string; en: string }> = {
  current_learning_portrait: { zh: "孩子目前的學習樣貌", en: "Your child's current learning portrait" },
  how_they_approach_something_new: { zh: "他們如何面對新事物", en: "How they approach something new" },
  how_they_respond_to_challenge: { zh: "他們如何面對挑戰", en: "How they respond to challenge" },
  how_they_learn_with_other_people: { zh: "他們如何與他人一起學習", en: "How they learn with other people" },
  how_they_respond_to_guidance_and_feedback: {
    zh: "他們如何回應指導與回饋",
    en: "How they respond to guidance and feedback",
  },
  conditions_that_bring_out_their_best: { zh: "能激發他們最佳表現的條件", en: "Conditions that bring out their best" },
  what_parents_may_notice_at_home: { zh: "家長在家中可能觀察到的情況", en: "What parents may notice at home" },
  personalised_strategies: { zh: "個人化策略", en: "Personalised strategies" },
  what_classz_will_continue_observing: {
    zh: "ClassZ 將持續觀察的項目",
    en: "What ClassZ will continue observing",
  },
  evidence_and_confidence: { zh: "證據與信心程度", en: "Evidence and confidence" },
}

const ANIMAL_LABEL_ZH: Record<string, string> = {
  "Rabbit Active Explorer": "兔子－積極探索型",
  "Owl Thoughtful Learner": "貓頭鷹－沉思學習型",
  "Dolphin Social Collaborator": "海豚－社群協作型",
  "Turtle Steady Builder": "烏龜－穩健建構型",
  "Fox Creative Problem Solver": "狐狸－靈活解題型",
  "Bee Focused Worker": "蜜蜂－專注勤敏型",
  Rabbit: "兔子－積極探索型",
  Owl: "貓頭鷹－沉思學習型",
  Dolphin: "海豚－社群協作型",
  Turtle: "烏龜－穩健建構型",
  Fox: "狐狸－靈活解題型",
  Bee: "蜜蜂－專注勤敏型",
}

const TRAIT_ZH: Record<string, string> = {
  "Participates actively": "積極參與",
  "Participating actively": "積極參與",
  "Tries independently": "獨立嘗試",
  "Trying independently": "獨立嘗試",
  "Shows initiative": "展現主動性",
  "Showing initiative": "展現主動性",
  "Asks questions": "主動提問",
  "Asking questions": "主動提問",
  "Works carefully": "細心工作",
  "Working carefully": "細心工作",
  "Responds well to feedback": "對回饋反應良好",
  "Responding well to feedback": "對回饋反應良好",
  "Checks mistakes carefully": "仔細檢查錯誤",
  "Checking mistakes carefully": "仔細檢查錯誤",
  "Collaborates well": "合作良好",
  "Collaborating well": "合作良好",
  "Engaging with others during learning": "與他人共同學習時投入",
  "Shows persistence": "展現毅力",
  "Showing persistence": "展現毅力",
  "Stays focused": "保持專注",
  "Staying focused": "保持專注",
  "Needs encouragement to start": "需要鼓勵才能開始",
  "Needing encouragement to start": "需要鼓勵才能開始",
  "Hesitant with new tasks": "面對新任務較猶豫",
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
  if (!zh) return label
  // Already Chinese (Train_CN title)
  if (/[\u4e00-\u9fff]/.test(label)) return label
  return ANIMAL_LABEL_ZH[label] || label
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
  section_titles?: Record<string, string>
}

function PoseArt({ src, alt = "" }: { src: string; alt?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="h-44 w-full max-w-[240px] rounded-2xl bg-white object-contain p-2 mx-auto"
    />
  )
}

function SectionBlock({
  children,
  art,
  soft,
  accent,
  reverse = false,
}: {
  children: React.ReactNode
  art: React.ReactNode
  soft?: string
  accent?: string
  reverse?: boolean
}) {
  return (
    <section
      className="overflow-hidden rounded-2xl"
      style={{
        background: soft || "#ffffff",
        border: `1px solid ${accent ? `${accent}33` : "var(--classz-100, #e2e8f0)"}`,
      }}
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
  const reportLanguage = String(
    (narrative.report_language as string | undefined) || report.report_language || "en",
  ).toLowerCase()
  // Headings/copy follow the report language, not the admin UI language toggle
  const isZh = reportLanguage.startsWith("zh")
  const sections = (narrative.sections ||
    narrative.ai_sections ||
    {}) as Record<string, unknown>
  const companion = narrative.learning_companion_section as CompanionSection | undefined
  const apiSectionTitles = (companion?.section_titles ||
    (narrative.section_titles as Record<string, string> | undefined)) as
    | Record<string, string>
    | undefined
  const supporting = (narrative.supporting_descriptions ||
    narrative.supporting_companion_sections ||
    []) as unknown[]
  const validationErrors = (narrative.validation_errors || []) as string[]

  const animal =
    resolveCompanionAnimal(companion?.animal_title) || resolveCompanionAnimal(report.primary_companion)
  const meaning1 = companion?.meaning_paragraph_1 || companion?.What_this_mean1 || animal?.meaning1
  const meaning2 = companion?.meaning_paragraph_2 || companion?.What_this_mean2 || animal?.meaning2
  const observedRaw = companion?.often_observed_as || companion?.Often_observed_as || animal?.oftenObservedAs || []
  const observed = isZh
    ? observedRaw.map((item) => TRAIT_ZH[item] || item)
    : observedRaw
  const helpRaw = companion?.what_may_help || companion?.What_may_help || animal?.whatMayHelp || []
  const help = isZh ? helpRaw.map((item) => HELP_ZH[item] || item) : helpRaw
  const theory = companion?.theory || animal?.theory
  const reminder = companion?.parent_reminder || (isZh ? PARENT_REMINDER_ZH : PARENT_REMINDER)
  const accent = animal?.accent || "#0ABAB5"
  const soft = animal?.accentSoft || "#E7F8F7"
  // Prefer API Train_CN Chinese copy when present; only fall back to local ZH overlays
  const displayMeaning1 = meaning1 || (isZh ? ANIMAL_COPY_ZH[animal?.label || ""]?.meaning1 : undefined)
  const displayMeaning2 = meaning2 || (isZh ? ANIMAL_COPY_ZH[animal?.label || ""]?.meaning2 : undefined)
  const displayTheory = theory || (isZh ? ANIMAL_COPY_ZH[animal?.label || ""]?.theory : undefined)
  const displayTitle =
    localizeAnimalLabel(companion?.animal_title || animal?.label || report.primary_companion, isZh) ||
    (isZh ? "學習夥伴" : "Learning Companion")

  const sectionHeading = (key: string) => {
    if (isZh && apiSectionTitles?.[key]) return apiSectionTitles[key]
    const label = SECTION_LABELS[key]
    return isZh ? label?.zh || key : label?.en || key
  }

  const earlyKeys = SECTIONS.slice(0, 5)
  const laterKeys = SECTIONS.slice(5)

  return (
    <div
      className="space-y-5 rounded-2xl p-3 text-sm text-brand-slate sm:p-4"
      style={{
        background: `linear-gradient(180deg, ${soft} 0%, #ffffff 42%, ${soft} 100%)`,
        ["--lc-accent" as string]: accent,
        ["--lc-accent-soft" as string]: soft,
      }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <AdminStatusChip tone={report.status === "locked" ? "orange" : "teal"}>
          {report.status}
        </AdminStatusChip>
        <AdminStatusChip tone="magenta">
          {isZh ? (zh ? "中文版本" : "Chinese") : zh ? "英文版本" : "English"}
        </AdminStatusChip>
        <span className="text-xs text-brand-slate/50">
          {report.records_used}/{report.records_required || 3} {isZh ? "份紀錄" : "records"}
          {report.created_at
            ? ` · ${new Date(report.created_at).toLocaleString(isZh ? "zh-HK" : "en-HK")}`
            : ""}
        </span>
      </div>

      <SectionBlock
        accent={accent}
        soft={`linear-gradient(165deg, ${soft} 0%, #ffffff 55%, ${soft} 140%)`}
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
              <p className="text-[11px] font-bold tracking-[0.08em]" style={{ color: accent }}>
                {isZh ? "ClassZ · 學習夥伴報告" : "ClassZ · Learning Companion Report"}
              </p>
              <div className="mt-1 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-brand-slate">
                    {displayTitle}
                  </h3>
                  <p className="text-xs text-brand-slate/60">
                    {isZh ? "學員快照：" : "Snapshot for "}
                    <strong>{report.student_name || (isZh ? "學員" : "Student")}</strong>
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
              <p className="mb-2 text-[11px] font-semibold tracking-wide" style={{ color: `${accent}cc` }}>
                {isZh ? "經常被觀察到的表現" : "Often observed as"}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {observed.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border bg-white/90 px-2.5 py-1 text-[11px] font-semibold"
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
        <SectionBlock
          reverse
          accent={accent}
          soft={`linear-gradient(180deg, #ffffff 0%, ${soft} 100%)`}
          art={<PoseArt src={poseForSlot(animal, "what_may_help")} />}
        >
          <div>
            <h4 className="mb-2 font-semibold" style={{ color: accent }}>
              {isZh ? "可能有幫助的做法" : "What may help"}
            </h4>
            <ul className="list-disc space-y-1 pl-5 text-brand-slate/85">
              {help.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {displayTheory ? (
              <div className="mt-4 border-t pt-3" style={{ borderColor: `${accent}33` }}>
                <h4 className="mb-1 font-semibold" style={{ color: accent }}>
                  {isZh ? "解讀依據" : "Why we think this"}
                </h4>
                <p className="leading-relaxed text-brand-slate/85">{displayTheory}</p>
                <p className="mt-2 text-xs text-brand-slate/55">{reminder}</p>
              </div>
            ) : null}
          </div>
        </SectionBlock>
      ) : null}

      {animal ? (
        <SectionBlock
          accent={accent}
          soft={soft}
          art={<PoseArt src={poseForSlot(animal, "why_we_think_this")} />}
        >
          <div>
            <h4 className="mb-2 font-semibold" style={{ color: accent }}>
              {isZh ? "同時可見的其他學習型態" : "Also reflected in learning"}
            </h4>
            <p className="mb-3 text-xs text-brand-slate/55">
              {isZh
                ? "根據近期紀錄演算法，除主要學習夥伴外，也可能同時出現以下次要型態（非替代結果）。"
                : "Based on recent records, supporting companion patterns may also appear alongside the primary result."}
            </p>
            {Array.isArray(supporting) && supporting.length ? (
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
                      <li key={i} className="rounded-lg border border-white/70 bg-white/90 px-3 py-2">
                        {s}
                      </li>
                    )
                  }
                  const supportAnimal =
                    resolveCompanionAnimal(item.animal_title) || resolveCompanionAnimal(item.companion_key)
                  return (
                    <li
                      key={i}
                      className="rounded-xl border bg-white/95 px-3 py-2"
                      style={{
                        borderColor: `${supportAnimal?.accent || accent}40`,
                        background: `linear-gradient(135deg, ${supportAnimal?.accentSoft || soft} 0%, #ffffff 70%)`,
                      }}
                    >
                      <div className="mb-1 flex items-center gap-2">
                        {supportAnimal ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={poseForSlot(supportAnimal, "cover")}
                            alt=""
                            className="h-10 w-10 rounded-lg bg-white object-contain p-0.5"
                          />
                        ) : null}
                        <div
                          className="text-sm font-semibold"
                          style={{ color: supportAnimal?.accent || accent }}
                        >
                          {localizeAnimalLabel(
                            item.animal_title || item.label || supportAnimal?.label || item.companion_key,
                            isZh,
                          ) || `Supporting ${i + 1}`}
                        </div>
                      </div>
                      <p className="text-brand-slate/85">{item.text || sectionPlain(s)}</p>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="leading-relaxed text-brand-slate/70">
                {isZh
                  ? "目前紀錄尚未達到次要學習型態的門檻；主要型態證據已足夠，其他型態會隨更多課堂紀錄再評估。"
                  : "No supporting companion met the evidence threshold yet. The primary pattern is clear; other patterns will be reassessed as more records accumulate."}
              </p>
            )}
          </div>
        </SectionBlock>
      ) : null}

      {animal ? (
        <SectionBlock
          accent={accent}
          soft={`linear-gradient(180deg, #ffffff 0%, ${soft} 100%)`}
          art={<PoseArt src={poseForSlot(animal, "personalised_interpretation")} />}
        >
          <div>
            <h4 className="mb-2 font-semibold" style={{ color: accent }}>
              {isZh ? "個人化解讀" : "Personalised interpretation"}
            </h4>
            <div className="space-y-4">
              {earlyKeys.map((key) => {
                const text = sectionPlain(sections[key])
                if (!text) return null
                return (
                  <div key={key}>
                    <h5 className="mb-1 font-semibold" style={{ color: accent }}>
                      {sectionHeading(key)}
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
        <SectionBlock
          reverse
          accent={accent}
          soft={soft}
          art={<PoseArt src={poseForSlot(animal, "strategies_and_next")} />}
        >
          <div className="space-y-4">
            {laterKeys.map((key) => {
              const text = sectionPlain(sections[key])
              if (!text) return null
              return (
                <div key={key}>
                  <h5 className="mb-1 font-semibold" style={{ color: accent }}>
                    {sectionHeading(key)}
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
