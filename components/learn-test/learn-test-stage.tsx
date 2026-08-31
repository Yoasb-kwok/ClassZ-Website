"use client"

import { useEffect, useMemo, useState } from "react"
import { ClipboardList, FileText, Sparkles } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { LearningCompanionReportView } from "@/components/admin/learning-companion-report-view"
import { Version2LearningRecordFields } from "@/components/admin/version2-learning-record-form"
import {
  AdminCard,
  AdminGhostButton,
  AdminPrimaryButton,
  AdminStatusChip,
} from "@/components/classz-admin-ui"
import { progressLevelLabel } from "@/lib/activity-learning-record"
import { COMPANION_ANIMALS } from "@/lib/learning-companion-animals"
import { buildSampleCompanionReport, exportLearningCompanionPdf } from "@/lib/learning-companion-pdf"
import {
  emptyVersion2Form,
  QUESTIONS,
  validateVersion2Form,
  type Version2LearningRecordForm,
} from "@/lib/version2-learning-record"

const STORAGE_KEY = "classz_learn_test_records_v1"
const MIN_RECORDS = 3
const CLASS_ID = "learn-test-stem"
const CLASS_NAME = "STEM Lab — Trial"
const STUDENT_NAME = "Chloe Tam"

type SavedRecord = {
  id: number
  created_at: string
  class_focus: string
  progress_level: string
  next_focus: string
  confirmed: boolean
}

type Tab = "input" | "report"

function emptyForm(): Version2LearningRecordForm {
  return {
    ...emptyVersion2Form(),
    class_id: CLASS_ID,
    enrollment_id: "1",
    student_name: STUDENT_NAME,
  }
}

function demoForm(): Version2LearningRecordForm {
  return {
    ...emptyForm(),
    class_focus: "TinkerCAD — design a simple spinning top and test balance.",
    availability: "valid_observation",
    progress_level: "developing",
    primary: {
      observation_type: "strength_progress",
      domain: "attention_engagement",
      domain_other: "",
      context: "independent_work",
      context_other: "",
      evidence: "Chloe opened TinkerCAD, built a cone and cylinder, then asked how to make it spin longer.",
      outcome: "continued_after_one_prompt",
      outcome_other: "",
      support_given: ["verbal_prompt"],
      support_given_other: "",
      response_to_support: "continued_after_one_support",
      response_to_support_other: "",
    },
    learning_approach_ids: ["tries_independently"],
    additional_comment: "Stayed on task after a short prompt.",
    student_work_on: "Practice aligning the axis so the top stays balanced.",
    next_focus: "Practice aligning the axis so the top stays balanced.",
  }
}

function readRecords(): SavedRecord[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function LearnTestStage() {
  const { locale, setLocale } = useLanguage()
  const zh = locale === "zh-TW"
  const [tab, setTab] = useState<Tab>("input")
  const [form, setForm] = useState<Version2LearningRecordForm>(emptyForm)
  const [records, setRecords] = useState<SavedRecord[]>([])
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    setRecords(readRecords())
  }, [])

  function persist(next: SavedRecord[]) {
    setRecords(next)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const confirmedCount = records.filter((r) => r.confirmed).length
  const unlocked = confirmedCount >= MIN_RECORDS

  const report = useMemo(
    () => buildSampleCompanionReport(COMPANION_ANIMALS.Bee, STUDENT_NAME),
    [],
  )

  function save(confirmed: boolean) {
    const err = validateVersion2Form(form, { confirm: confirmed })
    if (err) {
      setMessage(err)
      return
    }
    const row: SavedRecord = {
      id: Date.now(),
      created_at: new Date().toISOString(),
      class_focus: form.class_focus.trim(),
      progress_level: form.progress_level,
      next_focus: (form.student_work_on || form.next_focus).trim(),
      confirmed,
    }
    persist([row, ...records].slice(0, 12))
    setForm(emptyForm())
    setMessage(
      confirmed
        ? zh
          ? "已確認並儲存（本機演示，無需登入）"
          : "Confirmed and saved locally — no login needed"
        : zh
          ? "已儲存草稿"
          : "Draft saved locally",
    )
    if (confirmed && confirmedCount + 1 >= MIN_RECORDS) setTab("report")
  }

  function seedThreeRecords() {
    const samples: SavedRecord[] = [
      {
        id: Date.now() - 2,
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        class_focus: "Lego spinning top",
        progress_level: "guided",
        next_focus: "Let her try the first step without a demo.",
        confirmed: true,
      },
      {
        id: Date.now() - 1,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        class_focus: "Cospaces AR scene",
        progress_level: "developing",
        next_focus: "Ask one question before giving the next hint.",
        confirmed: true,
      },
      {
        id: Date.now(),
        created_at: new Date().toISOString(),
        class_focus: "TinkerCAD spinning top",
        progress_level: "independent",
        next_focus: "Balance the axis independently.",
        confirmed: true,
      },
    ]
    persist(samples)
    setTab("report")
    setMessage(zh ? "已載入 3 堂示範紀錄，報告已解鎖" : "Loaded 3 sample records — report unlocked")
  }

  return (
    <div className="classz-admin-theme min-h-screen bg-[#F4FBFA] text-brand-slate">
      <header className="border-b border-classz-100 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-teal">ClassZ · learn-test</p>
            <h1 className="text-lg font-semibold sm:text-xl">
              {zh ? "Learning Record 演示（免登入）" : "Learning Record demo (no login)"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`rounded-lg px-2.5 py-1 text-xs ${zh ? "bg-classz-50 font-semibold text-classz-700" : "text-classz-500"}`}
              onClick={() => setLocale("zh-TW")}
            >
              中
            </button>
            <button
              type="button"
              className={`rounded-lg px-2.5 py-1 text-xs ${!zh ? "bg-classz-50 font-semibold text-classz-700" : "text-classz-500"}`}
              onClick={() => setLocale("en")}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-4 px-4 py-5 sm:px-6">
        <AdminCard>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{STUDENT_NAME}</p>
              <p className="text-xs text-classz-500">{CLASS_NAME}</p>
            </div>
            <AdminStatusChip tone={unlocked ? "teal" : "orange"}>
              {confirmedCount}/{MIN_RECORDS}+ {zh ? "已確認紀錄" : "confirmed records"}
            </AdminStatusChip>
          </div>
          <p className="mt-2 text-xs text-classz-500">
            {zh
              ? "此頁只供簡報演示。紀錄存在這個瀏覽器，不會寫入正式中心帳號。"
              : "Presentation only. Records stay in this browser and are not saved to a centre account."}
          </p>
        </AdminCard>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTab("input")}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium ${
              tab === "input" ? "bg-brand-teal text-white" : "border border-classz-200 bg-white text-classz-700"
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            {zh ? "填寫紀錄" : "Input"}
          </button>
          <button
            type="button"
            onClick={() => setTab("report")}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium ${
              tab === "report" ? "bg-brand-teal text-white" : "border border-classz-200 bg-white text-classz-700"
            }`}
          >
            <FileText className="h-4 w-4" />
            {zh ? "學習報告" : "Report"}
          </button>
          <AdminGhostButton type="button" onClick={seedThreeRecords}>
            <Sparkles className="h-3.5 w-3.5" />
            {zh ? "一鍵解鎖報告" : "Unlock sample report"}
          </AdminGhostButton>
        </div>

        {message ? (
          <p className="text-sm text-brand-teal" role="status">
            {message}
          </p>
        ) : null}

        {tab === "input" ? (
          <div className="space-y-3">
            <AdminCard>
              <div className="mb-4 flex flex-wrap gap-2">
                <AdminGhostButton type="button" onClick={() => setForm(demoForm())}>
                  {zh ? "填入示範答案" : "Fill demo answers"}
                </AdminGhostButton>
                <AdminGhostButton type="button" onClick={() => setForm(emptyForm())}>
                  {zh ? "清空表單" : "Clear form"}
                </AdminGhostButton>
              </div>
              <Version2LearningRecordFields form={form} onChange={setForm} />
              <p className="mt-4 text-xs text-classz-500">{zh ? QUESTIONS.confirmation.zh : QUESTIONS.confirmation.en}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <AdminGhostButton type="button" onClick={() => save(false)}>
                  {zh ? "儲存草稿" : "Save draft"}
                </AdminGhostButton>
                <AdminPrimaryButton type="button" onClick={() => save(true)}>
                  {zh ? "確認並儲存" : "Confirm & save"}
                </AdminPrimaryButton>
              </div>
            </AdminCard>

            {records.length ? (
              <AdminCard>
                <h2 className="mb-2 text-sm font-semibold">{zh ? "已儲存紀錄" : "Saved records"}</h2>
                <ul className="space-y-1.5 text-sm">
                  {records.map((row) => (
                    <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-classz-50 py-1.5">
                      <span>
                        {row.class_focus || "—"}
                        {row.progress_level ? ` · ${progressLevelLabel(row.progress_level)}` : ""}
                        {!row.confirmed ? (
                          <span className="ml-2 text-xs text-classz-400">{zh ? "草稿" : "draft"}</span>
                        ) : null}
                      </span>
                      <span className="text-xs text-classz-400">
                        {new Date(row.created_at).toLocaleString(zh ? "zh-HK" : "en-HK")}
                      </span>
                    </li>
                  ))}
                </ul>
              </AdminCard>
            ) : null}
          </div>
        ) : (
          <AdminCard className="p-4 sm:p-6">
            {unlocked ? (
              <>
                <div className="mb-4 flex flex-wrap gap-2">
                  <AdminPrimaryButton type="button" onClick={() => exportLearningCompanionPdf(report)}>
                    {zh ? "輸出 PDF" : "Export PDF"}
                  </AdminPrimaryButton>
                </div>
                <LearningCompanionReportView report={report} zh={zh} />
              </>
            ) : (
              <div className="py-10 text-center">
                <p className="text-sm font-medium text-classz-700">
                  {zh
                    ? `再確認 ${MIN_RECORDS - confirmedCount} 份紀錄即可顯示 Learning Companion 報告`
                    : `Confirm ${MIN_RECORDS - confirmedCount} more record(s) to unlock the Learning Companion report`}
                </p>
                <p className="mt-2 text-xs text-classz-500">
                  {zh ? "或按「一鍵解鎖報告」直接展示 sample。" : "Or tap “Unlock sample report” to show the sample now."}
                </p>
              </div>
            )}
          </AdminCard>
        )}
      </main>
    </div>
  )
}
