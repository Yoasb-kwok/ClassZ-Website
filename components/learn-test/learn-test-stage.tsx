"use client"

import { useCallback, useEffect, useState } from "react"
import { Pencil, Plus } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { Version2LearningRecordFields } from "@/components/admin/version2-learning-record-form"
import {
  AdminCard,
  AdminGhostButton,
  AdminPrimaryButton,
  AdminStatusChip,
} from "@/components/classz-admin-ui"
import { progressLevelLabel, type ActivityLearningRecordRow } from "@/lib/activity-learning-record"
import {
  ADAPTIVE_BANK,
  QUESTIONS,
  assignNextFocus,
  buildVersion2ApiBody,
  emptyObservation,
  formFromRecordRow,
  newAdaptiveFormFromHistory,
  validateVersion2Form,
  type Version2LearningRecordForm,
} from "@/lib/version2-learning-record"

type LearnTestContext = {
  student_name: string
  profile_id: number
  class_id: number
  class_name: string
  enrollment_id: number
  records: ActivityLearningRecordRow[]
}

async function publicJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  })
  const body = (await res.json().catch(() => ({}))) as { success?: boolean; data?: T; msg?: string; message?: string }
  if (!res.ok) throw new Error(body.msg || body.message || `HTTP ${res.status}`)
  return body.data as T
}

function adaptiveLabel(row: ActivityLearningRecordRow, zh: boolean) {
  const payload = row.observation_payload || {}
  const route = String(payload.route_used || "")
  const code = String(payload.adaptive_q_code || "")
  const domain = String(payload.adaptive_domain || "")
  if (route === "adaptive" && code) return domain ? `${code} · ${domain}` : code
  if (route === "baseline") return zh ? "baseline（首堂通用題）" : "baseline"
  return "—"
}

function easyAdaptiveAnswer(domain: string) {
  const options = ADAPTIVE_BANK[domain]?.options || []
  return (
    options.find((o) => !o.requires_support_block && o.id !== "other" && o.id !== "unable_to_determine")?.id ||
    options[0]?.id ||
    ""
  )
}

export function LearnTestStage() {
  const { locale, setLocale } = useLanguage()
  const zh = locale === "zh-TW"
  const [ctx, setCtx] = useState<LearnTestContext | null>(null)
  const [form, setForm] = useState<Version2LearningRecordForm | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const startNew = useCallback((next: LearnTestContext) => {
    setEditingId(null)
    setForm(
      newAdaptiveFormFromHistory(
        {
          class_id: String(next.class_id),
          enrollment_id: String(next.enrollment_id),
          student_name: next.student_name,
        },
        next.records,
      ),
    )
  }, [])

  const load = useCallback(async (opts?: { keepEditingId?: number | null }) => {
    setLoading(true)
    setError(null)
    try {
      const data = await publicJson<LearnTestContext>("/learn-test")
      setCtx(data)
      const keepId = opts?.keepEditingId
      if (keepId) {
        const row = data.records.find((r) => r.id === keepId)
        if (row) {
          setEditingId(keepId)
          setForm(
            formFromRecordRow(row, {
              student_name: row.student_name || data.student_name,
              class_id: String(data.class_id),
              enrollment_id: String(data.enrollment_id),
            }),
          )
          return
        }
      }
      startNew(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed")
    } finally {
      setLoading(false)
    }
  }, [startNew])

  useEffect(() => {
    load()
  }, [load])

  function fillDemo() {
    if (!form) return
    const adaptiveAnswer = form.route_used === "adaptive" ? easyAdaptiveAnswer(form.adaptive_domain) : form.adaptive_answer_id
    setForm({
      ...form,
      class_focus: "TinkerCAD — design a simple spinning top and test balance.",
      availability: "valid_observation",
      progress_level: "developing",
      adaptive_answer_id: adaptiveAnswer,
      primary: {
        ...emptyObservation(),
        observation_type: form.route_used === "adaptive" ? form.primary.observation_type : "strength_progress",
        domain: form.route_used === "adaptive" ? form.adaptive_domain : "attention_engagement",
        context: "independent_work",
        evidence: "Chloe opened TinkerCAD, built a cone and cylinder, then asked how to make it spin longer.",
        outcome: form.route_used === "adaptive" ? form.primary.outcome : "continued_after_one_prompt",
      },
      learning_approach_ids: ["tries_independently"],
      additional_comment: "Stayed on task after a short prompt.",
      student_work_on: "Practice aligning the axis so the top stays balanced.",
    })
  }

  async function save(confirmed: boolean) {
    if (!form || !ctx) return
    const ready = assignNextFocus(
      form,
      ctx.records.filter((row) => row.id !== editingId),
    )
    const err = validateVersion2Form(ready, { confirm: confirmed })
    if (err) {
      setMessage(err)
      return
    }
    setSaving(true)
    setMessage(null)
    try {
      const payload = buildVersion2ApiBody(ready, { confirm: confirmed, force: true })
      if (editingId) {
        await publicJson(`/learn-test/records/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        })
        setMessage(zh ? "已更新到後端" : "Updated on the server")
      } else {
        await publicJson("/learn-test/records", {
          method: "POST",
          body: JSON.stringify(payload),
        })
        setMessage(
          zh
            ? "已儲存。下一份紀錄會換成下一題 adaptive QA。"
            : "Saved. The next record will use a different adaptive question.",
        )
      }
      await load()
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  function editRow(row: ActivityLearningRecordRow) {
    if (!ctx) return
    setEditingId(row.id)
    setForm(
      formFromRecordRow(row, {
        student_name: row.student_name || ctx.student_name,
        class_id: String(ctx.class_id),
        enrollment_id: String(ctx.enrollment_id),
      }),
    )
    setMessage(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const adaptiveMeta =
    form?.route_used === "adaptive" && form.adaptive_domain ? ADAPTIVE_BANK[form.adaptive_domain] : null

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
              <p className="text-sm font-semibold">{ctx?.student_name || "—"}</p>
              <p className="text-xs text-classz-500">{ctx?.class_name || "—"}</p>
            </div>
            <AdminStatusChip tone="teal">
              {ctx?.records.length || 0} {zh ? "份後端紀錄" : "server records"}
            </AdminStatusChip>
          </div>
          <p className="mt-2 text-xs text-classz-500">
            {zh
              ? "紀錄寫入後端。第一份已是 adaptive；儲存後下一份會轉下一題。"
              : "Records save to the backend. The first form is already adaptive; after save, the next form uses a different question."}
          </p>
        </AdminCard>

        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="text-sm text-brand-teal" role="status">
            {message}
          </p>
        ) : null}

        {loading || !form || !ctx ? (
          <AdminCard>
            <p className="text-sm text-classz-500">{zh ? "載入中…" : "Loading…"}</p>
          </AdminCard>
        ) : (
          <>
            <AdminCard>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">
                    {editingId
                      ? zh
                        ? `修改紀錄 #${editingId}`
                        : `Edit record #${editingId}`
                      : zh
                        ? "新增紀錄"
                        : "New record"}
                  </p>
                  {adaptiveMeta ? (
                    <p className="mt-1 text-xs text-brand-teal">
                      Adaptive {form.adaptive_q_code} · {form.adaptive_domain}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-classz-500">
                      {zh ? "今堂用 baseline 觀察題" : "This session uses the baseline observation questions"}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {editingId ? (
                    <AdminGhostButton type="button" onClick={() => startNew(ctx)}>
                      <Plus className="h-3.5 w-3.5" />
                      {zh ? "新增一份" : "New record"}
                    </AdminGhostButton>
                  ) : null}
                  <AdminGhostButton type="button" onClick={fillDemo}>
                    {zh ? "填入示範答案" : "Fill demo answers"}
                  </AdminGhostButton>
                </div>
              </div>
              <Version2LearningRecordFields form={form} onChange={setForm} />
              <p className="mt-4 text-xs text-classz-500">{zh ? QUESTIONS.confirmation.zh : QUESTIONS.confirmation.en}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <AdminGhostButton type="button" disabled={saving} onClick={() => save(false)}>
                  {zh ? "儲存草稿" : "Save draft"}
                </AdminGhostButton>
                <AdminPrimaryButton type="button" disabled={saving} onClick={() => save(true)}>
                  {saving ? (zh ? "儲存中…" : "Saving…") : editingId ? (zh ? "更新" : "Update") : zh ? "確認並儲存" : "Confirm & save"}
                </AdminPrimaryButton>
              </div>
            </AdminCard>

            <AdminCard>
              <h2 className="mb-2 text-sm font-semibold">{zh ? "現有紀錄" : "Existing records"}</h2>
              {ctx.records.length ? (
                <ul className="space-y-1.5 text-sm">
                  {ctx.records.map((row) => (
                    <li
                      key={row.id}
                      className={`flex flex-wrap items-center justify-between gap-2 border-b border-classz-50 py-2 ${
                        editingId === row.id ? "bg-brand-teal/5" : ""
                      }`}
                    >
                      <span>
                        <span className="font-medium">{row.class_focus || "—"}</span>
                        <span className="ml-2 text-xs text-brand-teal">{adaptiveLabel(row, zh)}</span>
                        {row.progress_level ? (
                          <span className="ml-2 text-xs text-classz-500">{progressLevelLabel(row.progress_level)}</span>
                        ) : null}
                        {!row.is_confirmed ? (
                          <span className="ml-2 text-xs text-classz-400">{zh ? "草稿" : "draft"}</span>
                        ) : null}
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="text-xs text-classz-400">
                          {row.created_at ? new Date(row.created_at).toLocaleString(zh ? "zh-HK" : "en-HK") : ""}
                        </span>
                        <AdminGhostButton type="button" onClick={() => editRow(row)}>
                          <Pencil className="h-3.5 w-3.5" />
                          {zh ? "修改" : "Edit"}
                        </AdminGhostButton>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-classz-500">{zh ? "還沒有紀錄。填完第一份後會出現在這裡。" : "No records yet. Save the first form to see it here."}</p>
              )}
            </AdminCard>
          </>
        )}
      </main>
    </div>
  )
}
