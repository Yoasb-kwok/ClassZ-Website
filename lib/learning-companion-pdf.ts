/**
 * Print-ready Learning Companion report HTML — matches ClassZ sample PDF layout
 * (animal hero, often observed, what may help, theory, supporting, personalised sections).
 */

import {
  COMPANION_ANIMALS,
  PARENT_REMINDER,
  PARENT_REMINDER_ZH,
  poseForSlot,
  resolveCompanionAnimal,
  type CompanionAnimalMeta,
} from "@/lib/learning-companion-animals"
import { SECTIONS, type LearningCompanionReport } from "@/lib/learning-companion-report"

const SECTION_LABELS_EN: Record<string, string> = {
  current_learning_portrait: "Your child's current learning portrait",
  how_they_approach_something_new: "How they approach something new",
  how_they_respond_to_challenge: "How they respond to challenge",
  how_they_learn_with_other_people: "How they learn with other people",
  how_they_respond_to_guidance_and_feedback: "How they respond to guidance and feedback",
  conditions_that_bring_out_their_best: "Conditions that bring out their best",
  what_parents_may_notice_at_home: "What parents may notice at home",
  personalised_strategies: "Personalised strategies",
  what_classz_will_continue_observing: "What ClassZ will continue observing",
  evidence_and_confidence: "Evidence and confidence",
}

/** Train_CN.ipynb SECTION_TITLES */
const SECTION_LABELS_ZH: Record<string, string> = {
  current_learning_portrait: "孩子目前的學習樣貌",
  how_they_approach_something_new: "他們如何面對新事物",
  how_they_respond_to_challenge: "他們如何面對挑戰",
  how_they_learn_with_other_people: "他們如何與他人一起學習",
  how_they_respond_to_guidance_and_feedback: "他們如何回應指導與回饋",
  conditions_that_bring_out_their_best: "能激發他們最佳表現的條件",
  what_parents_may_notice_at_home: "家長在家中可能觀察到的情況",
  personalised_strategies: "個人化策略",
  what_classz_will_continue_observing: "ClassZ 將持續觀察的項目",
  evidence_and_confidence: "證據與信心程度",
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
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

function absoluteAssetUrl(path: string) {
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}${path}`
  }
  return path
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

function narrativeBag(report: LearningCompanionReport) {
  return (report.narrative_json || report.narrative || {}) as Record<string, unknown>
}

function getCompanionSection(narrative: Record<string, unknown>): CompanionSection | undefined {
  return (narrative.learning_companion_section || undefined) as CompanionSection | undefined
}

function chipsHtml(items: string[], accent: string) {
  return items
    .map(
      (item) =>
        `<span class="chip" style="border-color:${escapeHtml(accent)}33;color:${escapeHtml(accent)}">${escapeHtml(item)}</span>`,
    )
    .join("")
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

function localizeAnimalTitle(label: string | undefined | null, isZh: boolean) {
  if (!label) return isZh ? "學習夥伴" : "Learning Companion"
  if (!isZh) return label
  if (/[\u4e00-\u9fff]/.test(label)) return label
  return ANIMAL_LABEL_ZH[label] || label
}

export function buildLearningCompanionPdfHtml(
  report: LearningCompanionReport,
  options?: { assetBase?: string },
): string {
  const narrative = narrativeBag(report)
  const reportLanguage = String((narrative.report_language || report.report_language || "en")).toLowerCase()
  const isZh = reportLanguage.startsWith("zh")
  const sections = (narrative.sections || narrative.ai_sections || {}) as Record<string, unknown>
  const companion = getCompanionSection(narrative)
  const apiSectionTitles = (companion?.section_titles ||
    (narrative.section_titles as Record<string, string> | undefined)) as
    | Record<string, string>
    | undefined
  const supporting = (narrative.supporting_descriptions ||
    narrative.supporting_companion_sections ||
    []) as Array<{ animal_title?: string; companion_key?: string; text?: string; emoji?: string }>

  const animal =
    resolveCompanionAnimal(companion?.animal_title) ||
    resolveCompanionAnimal(report.primary_companion) ||
    COMPANION_ANIMALS.Rabbit

  const titleForDisplay = localizeAnimalTitle(
    companion?.animal_title || animal.label || report.primary_companion,
    isZh,
  )

  const name = escapeHtml(report.student_name || (isZh ? "學員" : "Student"))
  const recordsUsed = report.records_used || 0
  const heroLine =
    companion?.hero_line ||
    (isZh
      ? `在近期的 ClassZ 紀錄中，您的孩子經常展現出${(companion?.often_observed_as || companion?.Often_observed_as || []).slice(0, 4).join("、") || "多項正向學習表現"}。`
      : `Across recent ClassZ records, your child was often observed as ${(companion?.often_observed_as || companion?.Often_observed_as || animal.oftenObservedAs)
          .slice(0, 4)
          .join(", ")
          .toLowerCase()}.`)
  const confidence =
    companion?.confidence_message ||
    (isZh
      ? `根據近期 ${recordsUsed || "多"} 份學習紀錄整理。`
      : `Based on ${recordsUsed || "recent"} learning records. Similar learning patterns have appeared repeatedly across the recent records.`)
  const meaning1 = companion?.meaning_paragraph_1 || companion?.What_this_mean1 || animal.meaning1
  const meaning2 = companion?.meaning_paragraph_2 || companion?.What_this_mean2 || animal.meaning2
  const observed = companion?.often_observed_as || companion?.Often_observed_as || animal.oftenObservedAs
  const help = companion?.what_may_help || companion?.What_may_help || animal.whatMayHelp
  const theory = companion?.theory || animal.theory
  const reminder = companion?.parent_reminder || (isZh ? PARENT_REMINDER_ZH : PARENT_REMINDER)
  const sectionLabels = isZh ? SECTION_LABELS_ZH : SECTION_LABELS_EN
  const brandLine = isZh ? "ClassZ · 學習夥伴報告" : "ClassZ · Learning Companion Report"
  const interpHeading = isZh ? "個人化解讀" : "Personalised interpretation"

  const sectionTitle = (key: string) => {
    if (isZh && apiSectionTitles?.[key]) return apiSectionTitles[key]
    return sectionLabels[key] || key
  }

  const asset = (path: string) => {
    const abs = options?.assetBase ? `${options.assetBase}${path}` : absoluteAssetUrl(path)
    return escapeHtml(abs)
  }

  const poseCover = poseForSlot(animal, "cover")
  const poseHelp = poseForSlot(animal, "what_may_help")
  const poseTheory = poseForSlot(animal, "why_we_think_this")
  const poseInterp = poseForSlot(animal, "personalised_interpretation")
  const poseNext = poseForSlot(animal, "strategies_and_next")

  const earlySectionKeys = SECTIONS.slice(0, 5)
  const laterSectionKeys = SECTIONS.slice(5)

  let body = `
    <header class="cover" style="--accent:${escapeHtml(animal.accent)};--accent-soft:${escapeHtml(animal.accentSoft)}">
      <div class="cover-top">
        <div class="brand-row">
          <div class="z-sir">${escapeHtml(animal.initial || "CZ")}</div>
          <p class="brand">${escapeHtml(brandLine)}</p>
        </div>
        <div class="title-row">
          <div>
            <h1>${escapeHtml(titleForDisplay)}</h1>
            <p class="snapshot">${isZh ? "學員快照：" : "Snapshot for "} <strong>${name}</strong> ${isZh ? "· 依近期課堂紀錄整理" : "· based on recent class records"}</p>
          </div>
          <div class="initial" aria-hidden="true">${escapeHtml(animal.initial)}</div>
        </div>
      </div>

      <div class="section-split">
        <div class="section-copy">
          <p class="hero-line">${escapeHtml(heroLine)}</p>
          <p class="meta">${escapeHtml(confidence)}</p>
          <p>${escapeHtml(meaning1)}</p>
          <p>${escapeHtml(meaning2)}</p>
          <p class="disclaimer">${isZh ? `這不代表 ${name} 一定只會以這種方式學習；這是根據近期重複觀察整理出的階段性學習快照。` : `This does not mean ${name} always learns this way. It is a recent snapshot based on repeated coach and tutor observations.`}</p>
          <h3 class="plain">${isZh ? "經常被觀察到的表現" : "Often observed as"}</h3>
          <div class="chips">${chipsHtml(observed, animal.accent)}</div>
        </div>
        <div class="section-art">
          <img class="pose" src="${asset(poseCover)}" alt="${escapeHtml(titleForDisplay)}" />
        </div>
      </div>
    </header>

    <section class="pose-section" style="--accent:${escapeHtml(animal.accent)};--accent-soft:${escapeHtml(animal.accentSoft)}">
      <div class="section-split reverse">
        <div class="section-copy">
          <h2>${isZh ? "可能有幫助的做法" : "What may help"}</h2>
          <ul class="help-list">
            ${help.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
          </ul>
          <h2>${isZh ? "解讀依據" : "Why we think this"}</h2>
          <p>${escapeHtml(theory)}</p>
          <p class="reminder">${escapeHtml(reminder)}</p>
        </div>
        <div class="section-art">
          <img class="pose" src="${asset(poseHelp)}" alt="" />
        </div>
      </div>
    </section>

    <section class="pose-section theory-block" style="--accent:${escapeHtml(animal.accent)};--accent-soft:${escapeHtml(animal.accentSoft)}">
      <div class="section-split">
        <div class="section-copy">
          <h2>${isZh ? "同時可見的其他學習型態" : "Also reflected in learning"}</h2>
          <p class="meta">${
            isZh
              ? "根據近期紀錄演算法，除主要學習夥伴外，也可能同時出現以下次要型態（非替代結果）。"
              : "Based on recent records, supporting companion patterns may also appear alongside the primary result."
          }</p>
  `

  if (supporting.length) {
    for (const s of supporting) {
      const supportAnimal =
        resolveCompanionAnimal(s.animal_title) || resolveCompanionAnimal(s.companion_key)
      const label = localizeAnimalTitle(
        s.animal_title || supportAnimal?.label || s.companion_key,
        isZh,
      )
      const t = s.text || sectionPlain(s)
      if (!t) continue
      const accent = supportAnimal?.accent || "#0ABAB5"
      const soft = supportAnimal?.accentSoft || "#E7F8F7"
      const initial = supportAnimal?.initial || label.charAt(0).toUpperCase()
      const thumb = supportAnimal ? poseForSlot(supportAnimal, "cover") : ""
      body += `
        <div class="supporting" style="--accent:${escapeHtml(accent)};--accent-soft:${escapeHtml(soft)}">
          <div class="supporting-head">
            ${thumb ? `<img class="supporting-thumb" src="${asset(thumb)}" alt="" />` : ""}
            <div>
              <h3 class="plain">${escapeHtml(label)}</h3>
            </div>
            <div class="initial small">${escapeHtml(initial)}</div>
          </div>
          <p>${escapeHtml(t)}</p>
        </div>
      `
    }
  } else {
    body += `<p>${
      isZh
        ? "目前紀錄尚未達到次要學習型態的門檻；主要型態證據已足夠，其他型態會隨更多課堂紀錄再評估。"
        : "No supporting companion met the evidence threshold yet. The primary pattern is clear; other patterns will be reassessed as more records accumulate."
    }</p>`
  }

  body += `
        </div>
        <div class="section-art">
          <img class="pose" src="${asset(poseTheory)}" alt="" />
        </div>
      </div>
    </section>
  `

  body += `
    <section class="pose-section interpretation" style="--accent:${escapeHtml(animal.accent)};--accent-soft:${escapeHtml(animal.accentSoft)}">
      <div class="section-split">
        <div class="section-copy">
          <h2>${escapeHtml(interpHeading)}</h2>
  `
  for (const key of earlySectionKeys) {
    const raw = sections[key]
    const text = sectionPlain(raw)
    if (!text) continue
    const title = sectionTitle(key)
    if (Array.isArray(raw)) {
      body += `<div class="section-card"><h3 class="plain">${escapeHtml(title)}</h3><ul>${raw
        .map((item) => `<li>${escapeHtml(String(item))}</li>`)
        .join("")}</ul></div>`
    } else {
      body += `<div class="section-card"><h3 class="plain">${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></div>`
    }
  }
  body += `
        </div>
        <div class="section-art">
          <img class="pose" src="${asset(poseInterp)}" alt="" />
        </div>
      </div>
    </section>

    <section class="pose-section strategies" style="--accent:${escapeHtml(animal.accent)};--accent-soft:${escapeHtml(animal.accentSoft)}">
      <div class="section-split reverse">
        <div class="section-copy">
  `
  for (const key of laterSectionKeys) {
    const raw = sections[key]
    const text = sectionPlain(raw)
    if (!text) continue
    const title = sectionTitle(key)
    if (Array.isArray(raw)) {
      body += `<div class="section-card"><h3 class="plain">${escapeHtml(title)}</h3><ul>${raw
        .map((item) => `<li>${escapeHtml(String(item))}</li>`)
        .join("")}</ul></div>`
    } else {
      body += `<div class="section-card"><h3 class="plain">${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></div>`
    }
  }
  body += `
        </div>
        <div class="section-art">
          <img class="pose" src="${asset(poseNext)}" alt="" />
        </div>
      </div>
    </section>

    <footer>
      <p>${escapeHtml(reminder)}</p>
    </footer>
  `

  return `<!DOCTYPE html>
<html lang="${isZh ? "zh-Hant" : "en"}">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(brandLine)} — ${name} · ${escapeHtml(titleForDisplay)}</title>
  <style>
    @page { margin: 14mm 12mm; }
    :root {
      --ink:#2c3a3b;
      --muted:#667778;
      --line:${escapeHtml(animal.accent)}33;
      --brand:${escapeHtml(animal.accent)};
      --page-soft:${escapeHtml(animal.accentSoft)};
    }
    * { box-sizing: border-box; }
    body {
      font-family: "Helvetica Neue", "PingFang HK", "Noto Sans TC", Helvetica, Arial, sans-serif;
      color: var(--ink);
      line-height: 1.55;
      font-size: 12.5px;
      max-width: 820px;
      margin: 0 auto;
      padding: 18px;
      background: linear-gradient(180deg, var(--page-soft) 0%, #ffffff 40%, var(--page-soft) 100%);
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .brand-row { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
    .z-sir { width:42px; height:42px; border-radius:999px; display:flex; align-items:center; justify-content:center; background:var(--accent); color:#fff; font-weight:700; }
    .brand { color: var(--accent); font-weight: 700; letter-spacing: 0.05em; font-size: 11px; margin: 0; }
    .cover {
      border:1px solid var(--line); border-radius:18px; overflow:hidden;
      background:linear-gradient(165deg, var(--accent-soft) 0%, #fff 55%, var(--accent-soft) 140%);
    }
    .cover-top { padding:18px 18px 0; }
    .title-row { display:flex; justify-content:space-between; gap:16px; align-items:flex-start; }
    h1 { font-size: 26px; margin: 0 0 6px; color: #1f2d2e; }
    .snapshot { color: var(--muted); margin:0 0 12px; }
    .initial {
      width:48px; height:48px; border-radius:999px; display:flex; align-items:center; justify-content:center;
      background: var(--accent); color:#fff; font-weight:800; font-size:22px; flex-shrink:0;
    }
    .initial.small { width:36px; height:36px; font-size:16px; }
    .pose-section {
      margin-top: 18px; border:1px solid var(--line); border-radius:16px; overflow:hidden;
      background: linear-gradient(180deg, #ffffff 0%, var(--accent-soft) 100%);
    }
    .theory-block { background: var(--accent-soft); }
    .section-split {
      display:grid; grid-template-columns: 1.2fr 0.8fr; gap:16px; padding:16px 18px; align-items:center;
    }
    .section-split.reverse { grid-template-columns: 0.8fr 1.2fr; }
    .section-split.reverse .section-art { order: -1; }
    .section-art { text-align:center; }
    .pose {
      width:100%; max-width:260px; height:180px; object-fit:contain; object-position:center;
      background:#fff; border-radius:16px; padding:8px;
    }
    .hero-line { font-size:14px; font-weight:600; }
    .meta { color: var(--muted); font-size: 11.5px; }
    .disclaimer { color: var(--muted); font-size:11px; }
    h2 { font-size: 15px; margin: 0 0 8px; color: var(--accent); border-bottom: 1px solid var(--line); padding-bottom: 4px; }
    h3 { font-size: 12.5px; margin: 14px 0 6px; color: var(--accent); }
    h3.plain { text-transform: none; letter-spacing: 0; }
    p { margin: 0 0 8px; }
    ul { margin: 0 0 8px; padding-left: 1.15rem; }
    li { margin-bottom: 4px; }
    .chips { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px; }
    .chip {
      display:inline-flex; align-items:center; border:1px solid; border-radius:999px;
      padding:4px 10px; font-size:11px; background:rgba(255,255,255,0.92); font-weight:600;
    }
    .supporting {
      background:linear-gradient(135deg, var(--accent-soft) 0%, #fff 70%);
      border:1px solid color-mix(in srgb, var(--accent) 28%, white);
      border-radius:12px; padding:10px 12px; margin:10px 0;
    }
    .supporting-head { display:flex; align-items:center; gap:10px; margin-bottom:6px; }
    .supporting-head h3 { margin:0; text-transform:none; letter-spacing:0; font-size:14px; color:var(--accent); }
    .supporting-thumb {
      width:40px; height:40px; object-fit:contain; background:#fff; border-radius:8px; padding:2px;
    }
    .reminder { color: var(--muted); font-size:11px; }
    .section-card { margin-top: 10px; }
    .section-card h3 { color: var(--accent); }
    footer { margin-top: 18px; padding-top: 10px; border-top: 1px dashed var(--line); color: var(--muted); font-size: 11px; }
    @media print {
      body { background: var(--page-soft); }
      .cover, .pose-section, .supporting { break-inside: avoid; }
    }
  </style>
</head>
<body>
  ${body}
</body>
</html>`
}

/** Trigger print → Save as PDF without leaving the admin page. */
export function exportLearningCompanionPdf(report: LearningCompanionReport) {
  if (typeof document === "undefined") {
    throw new Error("PDF export only works in the browser")
  }

  const html = buildLearningCompanionPdfHtml(report)
  const iframe = document.createElement("iframe")
  iframe.setAttribute("title", "ClassZ report PDF")
  iframe.setAttribute("aria-hidden", "true")
  iframe.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none;"

  document.body.appendChild(iframe)

  const cleanup = () => {
    try {
      iframe.remove()
    } catch {
      /* ignore */
    }
  }

  const win = iframe.contentWindow
  const doc = iframe.contentDocument || win?.document
  if (!win || !doc) {
    cleanup()
    throw new Error("Could not prepare PDF print frame")
  }

  doc.open()
  doc.write(html)
  doc.close()

  const runPrint = () => {
    try {
      win.focus()
      win.print()
    } finally {
      const done = () => cleanup()
      win.addEventListener?.("afterprint", done, { once: true })
      setTimeout(done, 60_000)
    }
  }

  setTimeout(runPrint, 300)
}

export function buildSampleCompanionReport(
  animal: CompanionAnimalMeta,
  studentName: string,
): LearningCompanionReport {
  const supportKeys = (Object.keys(COMPANION_ANIMALS) as Array<keyof typeof COMPANION_ANIMALS>)
    .filter((k) => k !== animal.key)
    .slice(0, 2)

  return {
    status: "complete",
    student_name: studentName,
    records_used: 6,
    records_required: 3,
    primary_companion: animal.label,
    supporting_companions: supportKeys.map((k) => COMPANION_ANIMALS[k].label),
    created_at: new Date().toISOString(),
    narrative: {
      report_status: "complete",
      learning_companion_section: {
        animal_title: animal.label,
        emoji: animal.emoji,
        hero_line: `Across recent ClassZ records, your child was often observed as ${animal.oftenObservedAs
          .slice(0, 4)
          .join(", ")
          .toLowerCase()}.`,
        confidence_message:
          "Based on 6 recent learning records. Similar learning patterns have appeared repeatedly across the recent records.",
        meaning_paragraph_1: animal.meaning1,
        meaning_paragraph_2: animal.meaning2,
        often_observed_as: animal.oftenObservedAs,
        what_may_help: animal.whatMayHelp,
        theory: animal.theory,
        parent_reminder: PARENT_REMINDER,
      },
      supporting_companion_sections: supportKeys.map((k) => ({
        companion_key: k,
        animal_title: COMPANION_ANIMALS[k].label,
        emoji: COMPANION_ANIMALS[k].emoji,
        text: `In recent STEM sessions, a complementary ${COMPANION_ANIMALS[k].shortName.toLowerCase()} pattern appeared alongside the primary ${animal.shortName.toLowerCase()} style. This adds another useful dimension to how your child approaches learning.`,
      })),
      sections: {
        current_learning_portrait: `Across recent STEM sessions, your child has shown a clear ${animal.shortName.toLowerCase()} learning pattern. Similar learning patterns have appeared repeatedly across the recent records, giving a stable snapshot of how they currently approach class activities.`,
        how_they_approach_something_new: `When something new appears, your child tends to lean on the strengths associated with the ${animal.label}. This helps them settle into unfamiliar tasks with a recognisable style.`,
        how_they_respond_to_challenge: `When challenged, they often return to the habits coaches have seen repeatedly — especially ${animal.oftenObservedAs[0].toLowerCase()} and ${animal.oftenObservedAs[1].toLowerCase()}.`,
        how_they_learn_with_other_people:
          "There is growing evidence about how they work with others, though more collaborative sessions will make this clearer.",
        how_they_respond_to_guidance_and_feedback:
          "Your child generally makes good use of guidance, adjusting their approach after clear feedback from coaches.",
        conditions_that_bring_out_their_best: animal.whatMayHelp.slice(0, 2).join(" "),
        what_parents_may_notice_at_home: `At home, you may notice behaviours that match this ${animal.shortName.toLowerCase()} snapshot — especially when tasks feel new, structured, or interesting.`,
        personalised_strategies: animal.whatMayHelp.slice(0, 4),
        what_classz_will_continue_observing: [
          "Whether the same pattern appears across more subjects and class formats.",
          "How supporting companions grow or fade with more records.",
          "How guidance and collaboration develop over time.",
        ],
        evidence_and_confidence:
          "This portrait is based on 6 valid records. The pattern is useful for coaching and home support, and may evolve as more classes are completed.",
      },
    },
  } as LearningCompanionReport
}
