/**
 * Build a print-ready HTML Learning Companion report (Train.ipynb-style PDF).
 * Prints via a hidden iframe so the app does not navigate to a blank page.
 */

import { SECTIONS, type LearningCompanionReport } from "@/lib/learning-companion-report"

const SECTION_LABELS_EN: Record<string, string> = {
  current_learning_portrait: "Current learning portrait",
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

function narrativeBag(report: LearningCompanionReport) {
  return (report.narrative_json || report.narrative || {}) as Record<string, unknown>
}

export function buildLearningCompanionPdfHtml(report: LearningCompanionReport): string {
  const narrative = narrativeBag(report)
  const sections = (narrative.sections || narrative.ai_sections || {}) as Record<string, unknown>
  const companion = narrative.learning_companion_section as
    | {
        animal_title?: string
        What_this_mean1?: string
        What_this_mean2?: string
        emoji?: string
        What_may_help?: string[]
      }
    | undefined
  const supporting = (narrative.supporting_descriptions ||
    narrative.supporting_companion_sections ||
    []) as Array<{ animal_title?: string; companion_key?: string; text?: string }>

  const name = escapeHtml(report.student_name || "Student")
  const primary = escapeHtml(report.primary_companion || "—")
  const supportingLabels = Array.isArray(report.supporting_companions)
    ? report.supporting_companions.map(escapeHtml).join(", ")
    : ""
  const created = report.created_at
    ? escapeHtml(new Date(report.created_at).toLocaleString("en-HK"))
    : ""

  let body = `
    <header>
      <p class="brand">ClassZ Learning Companion</p>
      <h1>${name}</h1>
      <p class="meta">Primary: <strong>${primary}</strong>
        ${supportingLabels ? ` · Supporting: ${supportingLabels}` : ""}
      </p>
      <p class="meta">${report.records_used || 0} records analysed${created ? ` · ${created}` : ""}</p>
    </header>
  `

  if (companion) {
    body += `
      <section>
        <h2>${escapeHtml((companion.emoji ? `${companion.emoji} ` : "") + (companion.animal_title || report.primary_companion || ""))}</h2>
        ${companion.What_this_mean1 ? `<p>${escapeHtml(companion.What_this_mean1)}</p>` : ""}
        ${companion.What_this_mean2 ? `<p>${escapeHtml(companion.What_this_mean2)}</p>` : ""}
        ${
          Array.isArray(companion.What_may_help) && companion.What_may_help.length
            ? `<h3>What may help</h3><ul>${companion.What_may_help.map((x) => `<li>${escapeHtml(String(x))}</li>`).join("")}</ul>`
            : ""
        }
      </section>
    `
  }

  for (const key of SECTIONS) {
    const raw = sections[key]
    const text = sectionPlain(raw)
    if (!text) continue
    const title = SECTION_LABELS_EN[key] || key
    if (Array.isArray(raw)) {
      body += `<section><h2>${escapeHtml(title)}</h2><ul>${raw
        .map((item) => `<li>${escapeHtml(String(item))}</li>`)
        .join("")}</ul></section>`
    } else {
      body += `<section><h2>${escapeHtml(title)}</h2><p>${escapeHtml(text)}</p></section>`
    }
  }

  if (supporting.length) {
    body += `<section><h2>Supporting companions</h2>`
    for (const s of supporting) {
      const label = s.animal_title || s.companion_key || "Supporting"
      const t = s.text || sectionPlain(s)
      if (!t) continue
      body += `<div class="supporting"><h3>${escapeHtml(label)}</h3><p>${escapeHtml(t)}</p></div>`
    }
    body += `</section>`
  }

  body += `
    <footer>
      <p>This is not a diagnosis or a fixed personality label — it is a recent snapshot based on ClassZ learning records and may change as your child joins more classes.</p>
    </footer>
  `

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>ClassZ Learning Companion — ${name}</title>
  <style>
    @page { margin: 18mm 16mm; }
    body {
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
      color: #2c3a3b;
      line-height: 1.55;
      font-size: 12.5px;
      max-width: 720px;
      margin: 0 auto;
      padding: 24px;
    }
    .brand { color: #0ABAB5; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; font-size: 11px; margin: 0 0 4px; }
    h1 { font-size: 22px; margin: 0 0 8px; color: #1f2d2e; }
    h2 { font-size: 15px; margin: 22px 0 8px; border-bottom: 1px solid #d7e3e3; padding-bottom: 4px; color: #0ABAB5; }
    h3 { font-size: 13px; margin: 10px 0 4px; color: #4C5B5C; }
    .meta { color: #667778; font-size: 11.5px; margin: 2px 0; }
    p { margin: 0 0 8px; }
    ul { margin: 0 0 8px; padding-left: 1.2rem; }
    li { margin-bottom: 4px; }
    .supporting { background: #f4fafa; padding: 10px 12px; border-radius: 6px; margin: 8px 0; }
    footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #d7e3e3; color: #7a8889; font-size: 10.5px; }
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
      // Remove frame after print dialog closes (or shortly if afterprint unsupported)
      const done = () => cleanup()
      win.addEventListener?.("afterprint", done, { once: true })
      setTimeout(done, 60_000)
    }
  }

  // Give the iframe a tick to layout fonts/styles
  setTimeout(runPrint, 300)
}
