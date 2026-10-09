"use client"

import { useLanguage } from "@/components/language-provider"
import {
  conflictMessage,
  type ScheduleChange,
  type ScheduleConflict,
  type SchedulePreview,
} from "@/lib/center-schedule"

function fill(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value)), template)
}

function ConflictList({
  title,
  items,
  zh,
  tone,
  testId,
}: {
  title: string
  items: ScheduleConflict[]
  zh: boolean
  tone: "block" | "warn"
  testId: string
}) {
  if (items.length === 0) return null
  const box =
    tone === "block"
      ? "border-[color-mix(in_srgb,var(--brand-coral)_35%,white)] bg-[color-mix(in_srgb,var(--brand-coral)_8%,white)]"
      : "border-[color-mix(in_srgb,var(--brand-orange)_35%,white)] bg-[color-mix(in_srgb,var(--brand-orange)_10%,white)]"
  const heading = tone === "block" ? "text-brand-coral" : "text-brand-orange"
  return (
    <div data-testid={testId} className={`rounded-lg border px-3 py-2 ${box}`}>
      <p className={`text-sm font-semibold ${heading}`}>{title}</p>
      <ul className="mt-1 space-y-1 text-sm text-classz-700">
        {items.map((item, index) => (
          <li key={`${item.classId}-${item.kind}-${index}`}>
            {item.className ? <span className="font-medium">{item.className} · </span> : null}
            {conflictMessage(item, zh)}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ChangeList({ title, items, testId }: { title: string; items: ScheduleChange[]; testId: string }) {
  if (items.length === 0) return null
  return (
    <div data-testid={testId} className="rounded-lg border border-classz-200 bg-white px-3 py-2">
      <p className="text-sm font-semibold text-classz-700">
        {title} ({items.length})
      </p>
      <ul className="mt-1 space-y-1 text-sm text-classz-600">
        {items.map((item, index) => (
          <li key={`${item.classId}-${index}`}>
            <span className="font-medium text-classz-800">{item.className || item.classId || "—"}</span>
            {item.startTime ? ` · ${item.startTime.replace("T", " ").slice(0, 16)}` : ""}
            {item.reason ? ` · ${item.reason}` : ""}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ScheduleConflictPanel({
  preview,
  slotsChecked,
  showOutcome = false,
  appliedLabel,
}: {
  preview: SchedulePreview | null
  slotsChecked?: number
  showOutcome?: boolean
  appliedLabel?: string
}) {
  const { locale, t } = useLanguage()
  const zh = locale === "zh-TW"
  if (!preview) return null

  const clear = preview.blocks.length === 0 && preview.warnings.length === 0 && !preview.nothingApplied

  return (
    <div className="space-y-2" data-testid="schedule-conflict-preview">
      {typeof slotsChecked === "number" ? (
        <p className="text-xs text-classz-500">{fill(t("classzAdmin.schedule.slotsChecked"), { n: slotsChecked })}</p>
      ) : null}
      {preview.nothingApplied ? (
        <div
          data-testid="schedule-nothing-applied"
          className="rounded-lg border border-[color-mix(in_srgb,var(--brand-coral)_40%,white)] bg-[color-mix(in_srgb,var(--brand-coral)_10%,white)] px-3 py-2"
        >
          <p className="text-sm font-semibold text-brand-coral">{t("classzAdmin.schedule.nothingApplied")}</p>
          <p className="text-sm text-classz-700">{t("classzAdmin.schedule.nothingAppliedDetail")}</p>
        </div>
      ) : null}
      <ConflictList
        title={t("classzAdmin.schedule.blocksTitle")}
        items={preview.blocks}
        zh={zh}
        tone="block"
        testId="schedule-conflict-blocks"
      />
      <ConflictList
        title={t("classzAdmin.schedule.warningsTitle")}
        items={preview.warnings}
        zh={zh}
        tone="warn"
        testId="schedule-conflict-warnings"
      />
      {showOutcome ? (
        <>
          <ChangeList
            title={appliedLabel || t("classzAdmin.schedule.wouldUpdate")}
            items={preview.applied}
            testId="schedule-would-update"
          />
          <ChangeList title={t("classzAdmin.schedule.skipped")} items={preview.skipped} testId="schedule-skipped" />
        </>
      ) : null}
      {clear && !showOutcome ? (
        <p data-testid="schedule-no-conflicts" className="text-sm text-classz-600">
          {t("classzAdmin.schedule.noConflicts")}
        </p>
      ) : null}
      {!preview.nothingApplied && preview.blocks.length === 0 && preview.warnings.length > 0 ? (
        <p className="text-sm text-brand-orange">{t("classzAdmin.schedule.warnContinue")}</p>
      ) : null}
    </div>
  )
}

export function fillScheduleText(template: string, values: Record<string, string | number>) {
  return fill(template, values)
}
