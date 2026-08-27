"use client"

import { useCallback, useEffect, useState } from "react"
import { Lock, PawPrint, RefreshCw } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { isDemoSession } from "@/components/admin/use-admin-api"
import { apiGet } from "@/lib/classz-api-client"
import { FEEDBACK_LIST_TITLE, FEEDBACK_STACK } from "@/lib/feedback-layout"
import { AdminCard, AdminGhostButton } from "@/components/classz-admin-ui"

type CompanionInfo = {
  emoji: string
  meaning1: string
  meaning2: string
  often_observed_as: string[]
  what_may_help: string[]
}

type RepeatedItem = { item: string; count: number; text: string }

export type LearningCompanionProfile = {
  student_key: string
  student_name: string
  report_status: "locked" | "complete"
  records_available: number
  records_required: number
  unlock_message?: string | null
  valid_records_analysed?: number
  pattern_confidence?: string | null
  learning_companion?: string | null
  companion_info?: CompanionInfo | null
  repeated_learning_traits?: RepeatedItem[]
  repeated_observed?: RepeatedItem[]
  repeated_strengths?: RepeatedItem[]
  repeated_attention?: RepeatedItem[]
  progress_context?: string[]
  coach_notes?: Array<{ date: string; subject: string; comment: string }>
  parent_reminder?: string
}

type CompanionsPayload = {
  summary: { students: number; unlocked: number; locked: number; min_records_for_result: number }
  companions: LearningCompanionProfile[]
}

function ChipList({ items, empty }: { items?: RepeatedItem[]; empty: string }) {
  if (!items?.length) return <p className="text-sm text-classz-400">{empty}</p>
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((x) => (
        <li
          key={x.item}
          className="rounded-md bg-[#CEF1F0] text-[#044A48] text-xs px-2 py-1 border border-[#A8E4E1]"
        >
          {x.text}
        </li>
      ))}
    </ul>
  )
}

export function LearningCompanionPanel() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const demo = isDemoSession()
  const [data, setData] = useState<CompanionsPayload | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (demo) {
      setData(null)
      setError(zh ? "請用中心帳號登入以載入 Learning Companion" : "Sign in with a centre account")
      return
    }
    setLoading(true)
    setError(null)
    try {
      const payload = await apiGet<CompanionsPayload>("/activity-learning-records/companions")
      setData(payload && typeof payload === "object" ? payload : { summary: { students: 0, unlocked: 0, locked: 0, min_records_for_result: 3 }, companions: [] })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed")
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [demo, zh])

  useEffect(() => {
    load()
  }, [load])

  const companions = data?.companions || []
  const selected = companions.find((c) => c.student_key === selectedKey) || companions[0] || null

  useEffect(() => {
    if (companions.length && !companions.some((c) => c.student_key === selectedKey)) {
      setSelectedKey(companions[0].student_key)
    }
  }, [companions, selectedKey])

  return (
    <div className={FEEDBACK_STACK}>
      <AdminCard>
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h2 className={`${FEEDBACK_LIST_TITLE} flex items-center gap-2`}>
              <PawPrint className="h-5 w-5 text-classz-500" />
              {zh ? "Learning Companion（學習風格）" : "Learning Companion"}
            </h2>
            <p className="text-sm text-classz-500 mt-1 max-w-2xl">
              {zh
                ? "根據已確認的 Academic Learning Record（至少 3 筆）彙總學習特質，顯示解鎖進度與 Companion 結果。此為近期觀察快照，並非診斷。"
                : "Aggregates confirmed Academic Learning Records (min 3) into a Learning Companion snapshot. Not a diagnosis — a recent observation-based view."}
            </p>
          </div>
          <AdminGhostButton type="button" onClick={load} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            {zh ? "重新整理" : "Refresh"}
          </AdminGhostButton>
        </div>

        {error ? (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
        ) : null}

        {loading && !data ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 rounded-full border-2 border-classz-400 border-t-transparent animate-spin" />
          </div>
        ) : null}

        {data ? (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="rounded-lg border border-classz-100 bg-classz-50 px-3 py-2">
              <p className="text-xs text-classz-500">{zh ? "學員" : "Students"}</p>
              <p className="text-xl font-semibold text-classz-800">{data.summary.students}</p>
            </div>
            <div className="rounded-lg border border-classz-100 bg-classz-50 px-3 py-2">
              <p className="text-xs text-classz-500">{zh ? "已解鎖" : "Unlocked"}</p>
              <p className="text-xl font-semibold text-[#044A48]">{data.summary.unlocked}</p>
            </div>
            <div className="rounded-lg border border-classz-100 bg-classz-50 px-3 py-2">
              <p className="text-xs text-classz-500">{zh ? "未達門檻" : "Locked"}</p>
              <p className="text-xl font-semibold text-classz-600">{data.summary.locked}</p>
            </div>
          </div>
        ) : null}

        {!loading && data && companions.length === 0 ? (
          <p className="text-sm text-classz-500 py-6 text-center">
            {zh
              ? "尚無已確認的 ALR。請先在「Academic Learning Record」確認至少 3 筆同一學員的紀錄。"
              : "No confirmed ALRs yet. Confirm at least 3 records for a student under Academic Learning Record."}
          </p>
        ) : null}

        {companions.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-[14rem_1fr] gap-4">
            <ul className="space-y-1 max-h-[28rem] overflow-y-auto border border-classz-100 rounded-lg p-2 bg-white">
              {companions.map((c) => {
                const active = selected?.student_key === c.student_key
                return (
                  <li key={c.student_key}>
                    <button
                      type="button"
                      onClick={() => setSelectedKey(c.student_key)}
                      className={`w-full text-left rounded-md px-2.5 py-2 text-sm transition-colors ${
                        active ? "bg-[#CEF1F0] text-[#044A48]" : "hover:bg-classz-50 text-classz-700"
                      }`}
                    >
                      <span className="font-medium block truncate">{c.student_name || "—"}</span>
                      <span className="text-xs text-classz-500 flex items-center gap-1 mt-0.5">
                        {c.report_status === "locked" ? (
                          <>
                            <Lock className="h-3 w-3" />
                            {c.records_available}/{c.records_required}
                          </>
                        ) : (
                          <>
                            {c.companion_info?.emoji || "·"} {c.pattern_confidence}
                          </>
                        )}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>

            {selected ? (
              <div className="rounded-xl border border-classz-100 bg-white p-4 space-y-4 min-h-[16rem]">
                {selected.report_status === "locked" ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-classz-700">
                      <Lock className="h-5 w-5" />
                      <h3 className="font-semibold text-lg">{selected.student_name}</h3>
                    </div>
                    <div className="h-2 rounded-full bg-classz-100 overflow-hidden">
                      <div
                        className="h-full bg-[#0ABAB5] transition-all"
                        style={{
                          width: `${Math.min(100, (selected.records_available / selected.records_required) * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-sm text-classz-600">
                      {selected.unlock_message ||
                        (zh
                          ? `尚需 ${selected.records_required - selected.records_available} 筆已確認紀錄才可解鎖。`
                          : `${selected.records_required - selected.records_available} more confirmed records needed to unlock.`)}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-start gap-3">
                      <span className="text-4xl leading-none" aria-hidden>
                        {selected.companion_info?.emoji || "✨"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-lg text-classz-800">{selected.student_name}</h3>
                        <p className="text-[#044A48] font-medium">{selected.learning_companion}</p>
                        <p className="text-xs text-classz-500 mt-1">
                          {zh ? "信心程度" : "Confidence"}: {selected.pattern_confidence} ·{" "}
                          {selected.valid_records_analysed} {zh ? "筆紀錄" : "records"}
                        </p>
                      </div>
                    </div>

                    {selected.companion_info ? (
                      <div className="space-y-2 text-sm text-classz-700">
                        <p>{selected.companion_info.meaning1}</p>
                        <p className="text-classz-600">{selected.companion_info.meaning2}</p>
                      </div>
                    ) : null}

                    <div>
                      <p className="text-xs font-medium text-classz-500 mb-1.5">
                        {zh ? "重複出現的學習特質" : "Repeated learning traits"}
                      </p>
                      <ChipList
                        items={selected.repeated_learning_traits}
                        empty={zh ? "尚未達重複門檻" : "No repeated traits yet"}
                      />
                    </div>

                    <div>
                      <p className="text-xs font-medium text-classz-500 mb-1.5">
                        {zh ? "重複觀察" : "Repeated observations"}
                      </p>
                      <ChipList
                        items={selected.repeated_observed}
                        empty={zh ? "尚未達重複門檻" : "No repeated observations yet"}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-medium text-classz-500 mb-1.5">{zh ? "重複強項" : "Repeated strengths"}</p>
                        <ChipList items={selected.repeated_strengths} empty="—" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-classz-500 mb-1.5">
                          {zh ? "重複關注點" : "Repeated attention"}
                        </p>
                        <ChipList items={selected.repeated_attention} empty="—" />
                      </div>
                    </div>

                    {selected.companion_info?.what_may_help?.length ? (
                      <div>
                        <p className="text-xs font-medium text-classz-500 mb-1.5">{zh ? "可能有幫助" : "What may help"}</p>
                        <ul className="list-disc pl-5 text-sm text-classz-700 space-y-1">
                          {selected.companion_info.what_may_help.map((tip) => (
                            <li key={tip}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {selected.progress_context?.length ? (
                      <div>
                        <p className="text-xs font-medium text-classz-500 mb-1.5">{zh ? "進度脈絡" : "Progress context"}</p>
                        <ul className="text-sm text-classz-700 space-y-1">
                          {selected.progress_context.map((line) => (
                            <li key={line}>· {line}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {selected.coach_notes?.length ? (
                      <div>
                        <p className="text-xs font-medium text-classz-500 mb-1.5">{zh ? "近期教練備註" : "Recent coach notes"}</p>
                        <ul className="space-y-2 text-sm max-h-32 overflow-y-auto">
                          {selected.coach_notes.slice(-5).map((n, i) => (
                            <li key={`${n.date}-${i}`} className="border-b border-classz-50 pb-1">
                              <span className="text-xs text-classz-400">
                                {n.date} · {n.subject}
                              </span>
                              <p className="text-classz-700">{n.comment}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    <p className="text-xs text-classz-500 border-t border-classz-100 pt-3">
                      {selected.parent_reminder ||
                        (zh
                          ? "此非診斷或固定性格標籤，而是根據 ClassZ 紀錄的近期快照。"
                          : "This is not a diagnosis or fixed personality label — a recent ClassZ snapshot.")}
                    </p>
                  </>
                )}
              </div>
            ) : null}
          </div>
        ) : null}
      </AdminCard>
    </div>
  )
}
