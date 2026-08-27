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
  your_child_at_a_glance: { zh: "小朋友一覽", en: "Your child at a glance" },
  how_they_approach_learning: { zh: "佢點樣投入學習", en: "How they approach learning" },
  how_they_respond_along_the_way: { zh: "過程入面點樣應對", en: "How they respond along the way" },
  how_you_can_support_them: { zh: "你可以點樣支援", en: "How you can support them" },
  why_this_companion_fits: { zh: "點解呢個學習夥伴合適", en: "Why this companion fits" },
  also_reflected_in_their_learning: { zh: "學習入面亦見到嘅其他面向", en: "Also reflected in their learning" },
  a_note_for_parents: { zh: "給家長嘅一則備註", en: "A note for parents" },
  current_learning_portrait: { zh: "小朋友而家嘅學習面貌", en: "Your child's current learning portrait" },
  how_they_approach_something_new: { zh: "佢點樣面對新事物", en: "How they approach something new" },
  how_they_respond_to_challenge: { zh: "佢點樣面對挑戰", en: "How they respond to challenge" },
  how_they_learn_with_other_people: { zh: "佢點樣同其他人一齊學習", en: "How they learn with other people" },
  how_they_respond_to_guidance_and_feedback: {
    zh: "佢點樣回應指導同回饋",
    en: "How they respond to guidance and feedback",
  },
  conditions_that_bring_out_their_best: { zh: "最能發揮嘅條件", en: "Conditions that bring out their best" },
  what_parents_may_notice_at_home: { zh: "家長喺屋企可能見到嘅情況", en: "What parents may notice at home" },
  personalised_strategies: { zh: "個人化策略", en: "Personalised strategies" },
  what_classz_will_continue_observing: {
    zh: "ClassZ 會繼續觀察嘅項目",
    en: "What ClassZ will continue observing",
  },
  evidence_and_confidence: { zh: "證據同信心程度", en: "Evidence and confidence" },
}

const ANIMAL_LABEL_ZH: Record<string, string> = {
  "Rabbit Active Explorer": "兔子・主動探索者",
  "Owl Thoughtful Learner": "貓頭鷹・深思學習者",
  "Dolphin Social Collaborator": "海豚・互動協作者",
  "Turtle Steady Builder": "烏龜・穩健建構者",
  "Fox Creative Problem Solver": "狐狸・創意解題者",
  "Bee Focused Worker": "蜜蜂・專注實踐者",
  Rabbit: "兔子・主動探索者",
  Owl: "貓頭鷹・深思學習者",
  Dolphin: "海豚・互動協作者",
  Turtle: "烏龜・穩健建構者",
  Fox: "狐狸・創意解題者",
  Bee: "蜜蜂・專注實踐者",
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
  "Engaging with others during learning": "喺學習中同其他人互動",
  "Shows persistence": "展現毅力",
  "Showing persistence": "展現毅力",
  "Stays focused": "保持專注",
  "Staying focused": "保持專注",
  "Needs encouragement to start": "需要鼓勵先開始",
  "Needing encouragement to start": "需要鼓勵先開始",
  "Hesitant with new tasks": "面對新任務會猶豫",
}

const HELP_ZH: Record<string, string> = {
  "Give them chances to try before over-explaining.": "講解太多之前，先俾小朋友親手試一試。",
  "Encourage questions and curiosity.": "鼓勵佢多提問、保持好奇。",
  "Offer small challenges that allow exploration.": "提供難度適中、可以自己探索嘅小挑戰。",
  "Help them reflect after trying, not only focus on the outcome.": "試完之後引導佢回顧過程，唔好淨係睇成敗。",
  "Guide them to slow down and review when needed.": "有需要時提醒佢放慢步調，再睇一次自己嘅諗法。",
  "Give clear instructions and examples.": "提供清晰嘅指示同例子。",
  "Allow time to process and review.": "俾足夠時間佢理解同消化。",
  "Encourage them to ask questions.": "鼓勵佢踴躍提問。",
  "Praise effort, strategy, and improvement, not only results.": "多肯定努力、策略同進步過程，唔好淨係睇最終成果。",
  "Help them notice what improved from last time.": "引導佢留意自己比上次進步嘅地方。",
  "Encourage group practice or partner activities.": "多鼓勵團體練習或者兩人一組嘅學習活動。",
  "Give opportunities to explain ideas to others.": "俾機會佢向其他人講解自己嘅諗法。",
  "Use positive social encouragement.": "用正向社交鼓勵。",
  "Help them balance teamwork with independent practice.": "幫佢喺團隊合作同獨立練習之間取得平衡。",
  "Praise cooperation, listening, and contribution.": "多肯定合作、傾聽同對團隊嘅貢獻。",
  "Give warm encouragement before starting.": "開始任務之前，先俾溫暖嘅正向支持。",
  "Break tasks into smaller steps.": "將大任務拆成容易做到嘅小步驟。",
  "Allow time to build confidence.": "俾足夠耐心，等小朋友跟自己節奏累積自信。",
  "Notice effort and persistence.": "多留意同肯定努力過程同唔輕言放棄。",
  "Avoid rushing them too quickly into performance or comparison.": "避免過早催促佢展現成果，或者同其他人比較。",
  "Give open-ended challenges.": "俾冇標準答案或者有多種解法嘅任務。",
  "Ask “What else could you try?”": "多問：「你覺得仲有咩方法可以試吓？」",
  "Encourage them to explain their thinking.": "引導佢一步步講出解題思路。",
  "Help them organise ideas after exploring.": "充分探索之後，幫佢梳理同歸納零散嘅創意。",
  "Balance creativity with clear next steps.": "喺發散創意同具體下一步之間，幫小朋友搵到平衡。",
  "Set clear goals for each practice.": "為每一次練習訂定清晰、做得到嘅短期目標。",
  "Keep instructions simple and structured.": "俾清晰、有結構又唔繁複嘅指示。",
  "Encourage careful checking.": "鼓勵完成任務之後細心核對。",
  "Celebrate small improvements.": "及時肯定日常累積嘅每一點成長。",
  "Add variety when learning becomes too repetitive.": "當學習過程太過單調重複時，適度變化形式去維持興趣。",
}

const ANIMAL_COPY_ZH: Record<string, { meaning1: string; meaning2: string; theory: string }> = {
  "Rabbit Active Explorer": {
    meaning1:
      "你嘅小朋友可能透過嘗試、探索、提問同主動參與學得最好。比起淨係聽講，佢可能更鍾意親手做、迎新挑戰，同埋親自驗證自己嘅諗法。",
    meaning2: "當有機會參與、勇於嘗試，同埋從經驗入面學習時，佢往往會見到更明顯嘅進步。",
    theory:
      "呢項解讀建基於「小朋友透過互動、探索同適度引導主動學習」嘅發展理念。當大人可以按小朋友而家嘅能力俾適時引導時，參與度同學習質素通常更穩定。",
  },
  "Owl Thoughtful Learner": {
    meaning1:
      "你嘅小朋友可能喺有時間思考、檢視自己作品，同埋收到清晰回饋嘅時候學得最好。進步通常係循序漸進，而唔係一次到位。",
    meaning2: "當佢明白任務背後嘅原因，又收到具體、有建設性嘅回饋時，往往會有更明顯嘅進步。",
    theory:
      "當支援同回饋能夠貼近小朋友而家嘅發展程度，學習效果通常最好。適切支持可以幫小朋友把外在回饋轉成下一步行動。",
  },
  "Dolphin Social Collaborator": {
    meaning1:
      "你嘅小朋友喺人際互動、一齊練習、正面鼓勵同團體學習入面學得最好。當學習情境有社交互動同溫暖支持時，佢會更投入。",
    meaning2: "喺充滿鼓勵嘅環境入面，當佢可以參與討論、合作、觀察同儕或者接收回饋時，往往會見到更明顯嘅進步。",
    theory:
      "呢項解讀建基於社會學習理論：小朋友好多時透過觀察其他人、同儕互動，以及社交回饋去學新嘢。",
  },
  "Turtle Steady Builder": {
    meaning1:
      "你嘅小朋友喺溫和支持、清晰步驟同充裕熱身時間之下學得最好。佢未必會急住投入，但可以透過持續練習同適時鼓勵見到穩定成長。",
    meaning2: "喺可預測、有規律嘅學習環境入面，將複雜任務拆成容易處理嘅小步驟，最能幫到佢。",
    theory:
      "呢項解讀建基於適當鷹架支持：當環境有足夠安全感、結構同循序漸進嘅支持時，有啲小朋友會更投入。",
  },
  "Fox Creative Problem Solver": {
    meaning1:
      "你嘅小朋友喺可以探索唔同解題方法嘅時候學得最好。佢鍾意開放式任務、充滿創意嘅挑戰，同埋親自驗證自己諗法嘅機會。",
    meaning2: "當獲得鼓勵去講解思考過程、嘗試唔同策略，同埋喺實踐之後不斷修正諗法時，往往會見到更明顯嘅進步。",
    theory:
      "呢項解讀建基於解難同建構主義學習：小朋友透過嘗試策略、反思結果，再從實際經驗入面理解世界。",
  },
  "Bee Focused Worker": {
    meaning1:
      "你嘅小朋友喺目標清晰、作息規律、又可以高度專注嘅情境下學得最好。佢可以透過持之以恆同細緻練習見到穩健進步。",
    meaning2: "當小朋友清楚學習期望、有條理分明嘅任務結構，又可以見到自己一點一滴嘅成長時，最能從中得益。",
    theory:
      "呢項解讀建基於自我調節學習：當小朋友可以自己設定目標、監察過程同接收回饋時，最能夠建立穩固嘅學習習慣。",
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
  if (typeof value === "object") {
    const obj = value as { text?: string; intro?: string; action_points?: unknown[] }
    if ("intro" in obj || "action_points" in obj) {
      const parts = [obj.intro || ""]
      if (Array.isArray(obj.action_points)) parts.push(...obj.action_points.map((p) => String(p)))
      return parts.filter(Boolean).join("\n")
    }
    if ("text" in obj) return String(obj.text || "")
  }
  return String(value)
}

function isSupportSection(value: unknown): value is { intro?: string; action_points?: unknown[] } {
  return Boolean(value && typeof value === "object" && ("intro" in value || "action_points" in value))
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

  const hasNewSections = SECTIONS.some((key) => sectionPlain(sections[key]))
  const visibleKeys = hasNewSections
    ? [...SECTIONS]
    : [
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
      ].filter((key) => sectionPlain(sections[key]))
  const earlyKeys = visibleKeys.slice(0, Math.min(3, visibleKeys.length))
  const laterKeys = visibleKeys.slice(earlyKeys.length)

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
              {isZh ? "經常見到嘅表現" : "Often observed as"}
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
              {isZh ? "可能有幫助嘅做法" : "What may help"}
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
              {isZh ? "學習入面亦見到嘅其他面向" : "Also reflected in learning"}
            </h4>
            <p className="mb-3 text-xs text-brand-slate/55">
              {isZh
                ? "根據近期紀錄，除主要學習夥伴外，亦可能同時見到以下次要型態（唔係替代結果）。"
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
                  ? "而家嘅紀錄未達到次要學習型態嘅門檻；主要型態證據已經足夠，其他型態會隨住更多課堂紀錄再評估。"
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
              {isZh ? "更多解讀" : "More Insight"}
            </h4>
            <div className="space-y-4">
              {earlyKeys.map((key) => {
                const raw = sections[key]
                const text = sectionPlain(raw)
                if (!text) return null
                return (
                  <div key={key}>
                    <h5 className="mb-1 font-semibold" style={{ color: accent }}>
                      {sectionHeading(key)}
                    </h5>
                    {isSupportSection(raw) ? (
                      <div className="space-y-2 text-brand-slate/85">
                        {raw.intro ? <p className="leading-relaxed">{raw.intro}</p> : null}
                        {Array.isArray(raw.action_points) ? (
                          <ul className="list-disc space-y-1 pl-5">
                            {raw.action_points.map((item, i) => (
                              <li key={i}>{String(item)}</li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ) : Array.isArray(raw) ? (
                      <ul className="list-disc space-y-1 pl-5 text-brand-slate/85">
                        {(raw as unknown[]).map((item, i) => (
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
              const raw = sections[key]
              const text = sectionPlain(raw)
              if (!text) return null
              return (
                <div key={key}>
                  <h5 className="mb-1 font-semibold" style={{ color: accent }}>
                    {sectionHeading(key)}
                  </h5>
                  {isSupportSection(raw) ? (
                    <div className="space-y-2 text-brand-slate/85">
                      {raw.intro ? <p className="leading-relaxed">{raw.intro}</p> : null}
                      {Array.isArray(raw.action_points) ? (
                        <ul className="list-disc space-y-1 pl-5">
                          {raw.action_points.map((item, i) => (
                            <li key={i}>{String(item)}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ) : Array.isArray(raw) ? (
                    <ul className="list-disc space-y-1 pl-5 text-brand-slate/85">
                      {(raw as unknown[]).map((item, i) => (
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
