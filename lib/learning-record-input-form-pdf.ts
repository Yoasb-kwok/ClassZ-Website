/**
 * Printable blank Academic Learning Record form for coaches
 * (paper fill → later enter online). Same options as the digital form.
 */

import {
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
  type BilingualOption,
} from "@/lib/version2-learning-record"

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function bilingualItem(opt: BilingualOption) {
  return `<label class="opt"><span class="box"></span><span class="opt-text">${escapeHtml(opt.en)} <span class="muted">${escapeHtml(opt.zh)}</span></span></label>`
}

function bilingualGrid(options: readonly BilingualOption[], columns = 2) {
  return `<div class="grid cols-${columns}">${options.map((o) => bilingualItem(o)).join("")}</div>`
}

function sectionTitle(en: string, zh: string, hint?: string) {
  return `<div class="sec-head">
    <div class="sec-title">${escapeHtml(en)} <span class="zh">${escapeHtml(zh)}</span></div>
    ${hint ? `<div class="sec-hint">${escapeHtml(hint)}</div>` : ""}
  </div>`
}

/** Full HTML document ready for window.print() / Save as PDF. */
export function buildLearningRecordInputFormHtml(opts?: { copies?: number }) {
  const copies = Math.max(1, Math.min(opts?.copies ?? 1, 10))

  const progressBlock = PROGRESS_LEVEL_OPTIONS.map(
    (p) =>
      `<label class="progress-opt">
        <span class="box lg"></span>
        <span>
          <strong>${escapeHtml(p.en)}</strong>
          <span class="muted"> — ${escapeHtml(p.zh)}</span>
        </span>
      </label>`,
  ).join("")

  const oneForm = `
  <article class="sheet">
    <header class="top">
      <div class="brand">
        <div class="logo">ClassZ</div>
        <div class="subtitle">Learning Record · 學習紀錄</div>
      </div>
      <div class="badge">Coach paper form · 導師紙本填寫</div>
    </header>

    <p class="intro">
      Fill this to match the online Learning Record. Tick <strong>1–2</strong> where noted. Write what the child actually did or said.
      <span class="zh-inline">請按線上表單相同欄位填寫；標示 1–2 的項目只選一至兩項。請寫孩子實際做過或講過嘅內容。</span>
    </p>

    <section class="meta">
      <div class="meta-row">
        <label>Date / 日期<span class="line"></span></label>
        <label>Coach / 導師<span class="line"></span></label>
      </div>
      <div class="meta-row">
        <label>Student / 學員<span class="line wide"></span></label>
        <label>Class session / 課堂<span class="line"></span></label>
      </div>
    </section>

    <section>
      ${sectionTitle(QUESTIONS.lesson_focus.en, QUESTIONS.lesson_focus.zh, `${QUESTIONS.lesson_focus_helper.en} · ${QUESTIONS.lesson_focus_helper.zh}`)}
      <div class="write-lines short">
        <div class="write-line"></div>
        <div class="write-line"></div>
      </div>
    </section>

    <section>
      ${sectionTitle(QUESTIONS.availability.en, QUESTIONS.availability.zh, "Select one · 選一項")}
      ${bilingualGrid(AVAILABILITY_OPTIONS, 1)}
    </section>

    <section>
      ${sectionTitle(QUESTIONS.insufficient_reason.en, QUESTIONS.insufficient_reason.zh, "Only if there was not enough opportunity · 只喺未能有效觀察時填")}
      ${bilingualGrid(INSUFFICIENT_REASONS, 2)}
      <div class="write-lines short">
        <div class="write-line"></div>
      </div>
    </section>

    <section>
      ${sectionTitle(QUESTIONS.progress_level.en, QUESTIONS.progress_level.zh, "Select one · 選一項")}
      <div class="progress-list">${progressBlock}</div>
    </section>

    <div class="two-col">
      <section>
        ${sectionTitle(QUESTIONS.observation_type.en, QUESTIONS.observation_type.zh, "Select one · 選一項")}
        ${bilingualGrid(OBSERVATION_TYPE_OPTIONS, 1)}
      </section>
      <section>
        ${sectionTitle(QUESTIONS.observation_context.en, QUESTIONS.observation_context.zh, "Select one · 選一項")}
        ${bilingualGrid(OBSERVATION_CONTEXT_OPTIONS, 1)}
      </section>
    </div>

    <section>
      ${sectionTitle(QUESTIONS.observation_domain.en, QUESTIONS.observation_domain.zh, "Select one · 選一項")}
      ${bilingualGrid(OBSERVATION_DOMAIN_OPTIONS, 2)}
    </section>

    <section>
      ${sectionTitle(QUESTIONS.factual_evidence.en, QUESTIONS.factual_evidence.zh, "At least 10 characters · 最少 10 個字")}
      <div class="write-lines">
        <div class="write-line"></div>
        <div class="write-line"></div>
        <div class="write-line"></div>
      </div>
    </section>

    <section>
      ${sectionTitle(QUESTIONS.outcome.en, QUESTIONS.outcome.zh, "Select one · 選一項")}
      ${bilingualGrid(OUTCOME_OPTIONS, 2)}
    </section>

    <div class="two-col">
      <section>
        ${sectionTitle(QUESTIONS.support_provided.en, QUESTIONS.support_provided.zh, "Tick 1–2 if support was needed · 需要支援時勾選 1–2 項")}
        ${bilingualGrid(SUPPORT_GIVEN_OPTIONS, 1)}
      </section>
      <section>
        ${sectionTitle(QUESTIONS.response_to_support.en, QUESTIONS.response_to_support.zh, "Select one if support was given · 有提供支援時選一項")}
        ${bilingualGrid(RESPONSE_TO_SUPPORT_OPTIONS, 1)}
      </section>
    </div>

    <section>
      ${sectionTitle(QUESTIONS.learning_approach.en, QUESTIONS.learning_approach.zh, "Tick 1–2 · 勾選 1–2 項")}
      ${bilingualGrid(LEARNING_APPROACH_OPTIONS, 2)}
    </section>

    <section>
      ${sectionTitle(QUESTIONS.next_step.en, QUESTIONS.next_step.zh, QUESTIONS.next_step_helper.en)}
      <div class="write-lines short">
        <div class="write-line"></div>
        <div class="write-line"></div>
      </div>
    </section>

    <section>
      ${sectionTitle(QUESTIONS.additional_note.en, QUESTIONS.additional_note.zh, "Optional · ≤100 words · 選填")}
      <div class="write-lines short">
        <div class="write-line"></div>
        <div class="write-line"></div>
      </div>
    </section>

    <section>
      <label class="opt"><span class="box lg"></span><span class="opt-text">${escapeHtml(QUESTIONS.confirmation.en)} <span class="muted">${escapeHtml(QUESTIONS.confirmation.zh)}</span></span></label>
    </section>

    <footer class="foot">
      ClassZ Learning Companion input · enter the same fields online after class · 請於課後輸入線上系統
    </footer>
  </article>`

  const body = Array.from({ length: copies }, () => oneForm).join("\n")

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>ClassZ Academic Learning Record — Coach form</title>
  <style>
    @page { size: A4; margin: 10mm 12mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Segoe UI", "PingFang HK", "Noto Sans TC", "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      font-size: 9.5pt;
      line-height: 1.35;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .sheet {
      page-break-after: always;
      max-width: 190mm;
      margin: 0 auto;
    }
    .sheet:last-child { page-break-after: auto; }

    .top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      border-bottom: 2.5px solid #0d9488;
      padding-bottom: 8px;
      margin-bottom: 8px;
    }
    .logo {
      font-size: 18pt;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: #0f766e;
    }
    .subtitle {
      font-size: 9.5pt;
      font-weight: 600;
      color: #334155;
      margin-top: 1px;
    }
    .badge {
      flex-shrink: 0;
      font-size: 8pt;
      font-weight: 600;
      color: #0f766e;
      background: #ccfbf1;
      border: 1px solid #99f6e4;
      border-radius: 4px;
      padding: 4px 8px;
      text-align: right;
      max-width: 11rem;
    }
    .intro {
      font-size: 8pt;
      color: #64748b;
      margin: 0 0 10px;
    }
    .zh-inline { display: block; margin-top: 2px; }

    .meta {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 10px;
      margin-bottom: 10px;
    }
    .meta-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px 16px;
      margin-bottom: 8px;
    }
    .meta-row:last-child { margin-bottom: 0; }
    .meta label {
      display: flex;
      align-items: flex-end;
      gap: 6px;
      font-size: 8.5pt;
      font-weight: 600;
      color: #475569;
      white-space: nowrap;
    }
    .line {
      flex: 1;
      border-bottom: 1px solid #94a3b8;
      min-height: 16px;
      min-width: 4rem;
    }
    .line.wide { min-width: 6rem; }

    section { margin-bottom: 9px; }
    .sec-head { margin-bottom: 4px; }
    .sec-title {
      font-size: 9.5pt;
      font-weight: 700;
      color: #0f766e;
    }
    .sec-title .zh {
      font-weight: 600;
      color: #64748b;
      font-size: 8.5pt;
    }
    .sec-hint {
      font-size: 7.5pt;
      color: #94a3b8;
      margin-top: 1px;
    }

    .box {
      display: inline-block;
      width: 11px;
      height: 11px;
      border: 1.5px solid #475569;
      border-radius: 2px;
      flex-shrink: 0;
      margin-top: 1px;
      background: #fff;
    }
    .box.lg { width: 13px; height: 13px; }

    .opt, .progress-opt {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      break-inside: avoid;
    }
    .opt { margin: 1.5px 0; }
    .opt-text { font-size: 8.5pt; color: #1e293b; }
    .progress-list { display: grid; gap: 3px; }
    .progress-opt { margin: 2px 0; font-size: 8.5pt; }
    .progress-opt .muted { color: #64748b; font-weight: 400; }

    .grid {
      display: grid;
      gap: 1px 10px;
    }
    .cols-1 { grid-template-columns: 1fr; }
    .cols-2 { grid-template-columns: 1fr 1fr; }
    .cols-4 { grid-template-columns: repeat(4, 1fr); }

    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px 14px;
      margin-bottom: 4px;
    }

    .write-lines { margin-top: 4px; }
    .write-line {
      border-bottom: 1px solid #cbd5e1;
      height: 18px;
      margin-bottom: 2px;
    }
    .write-lines.short .write-line { height: 16px; }

    .foot {
      margin-top: 8px;
      padding-top: 6px;
      border-top: 1px dashed #cbd5e1;
      font-size: 7.5pt;
      color: #94a3b8;
      text-align: center;
    }

    @media screen {
      body { background: #e2e8f0; padding: 16px; }
      .sheet {
        background: #fff;
        padding: 14mm 12mm;
        box-shadow: 0 4px 24px rgba(15, 23, 42, 0.12);
        margin-bottom: 16px;
        border-radius: 4px;
      }
    }
  </style>
</head>
<body>
${body}
</body>
</html>`
}

/** Open print dialog (Save as PDF / print blank coach forms). */
export function exportLearningRecordInputFormPdf(opts?: { copies?: number }) {
  if (typeof document === "undefined") {
    throw new Error("PDF export only works in the browser")
  }

  const html = buildLearningRecordInputFormHtml(opts)
  const iframe = document.createElement("iframe")
  iframe.setAttribute("title", "ClassZ Learning Record form PDF")
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
