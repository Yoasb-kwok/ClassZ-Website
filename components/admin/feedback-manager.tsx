"use client"

import { useCallback, useEffect, useState } from "react"
import { Edit, MessageSquareText, Save, Send, Trash2 } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { isDemoSession } from "@/components/admin/use-admin-api"
import { ActivityLearningRecordSection } from "@/components/admin/activity-learning-record-section"
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/classz-api-client"
import { FEEDBACK_CONTENT, FEEDBACK_FORM_STACK, FEEDBACK_LIST_TITLE, FEEDBACK_STACK } from "@/lib/feedback-layout"
import { useCenterApiList } from "@/components/admin/use-center-api-list"
import {
  AdminCard,
  AdminGhostButton,
  AdminLabel,
  AdminPageFrame,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminSelect,
  AdminTextarea,
} from "@/components/classz-admin-ui"

type ClassOption = { id: string; name: string }

type NoticeRow = {
  id: number
  class_id: number
  class_name: string | null
  message: string
  created_at: string
}

function mapClass(r: Record<string, unknown>): ClassOption {
  return { id: String(r.id), name: String(r.name || "") }
}

export function FeedbackManager() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const demo = isDemoSession()
  const { rows: classes, ready: classesReady } = useCenterApiList("/classes", mapClass)
  const [tab, setTab] = useState<"alr" | "message">("alr")
  const [classId, setClassId] = useState("")
  const [message, setMessage] = useState("")
  const [notices, setNotices] = useState<NoticeRow[]>([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState<NoticeRow | null>(null)
  const [editMsg, setEditMsg] = useState("")

  const loadNotices = useCallback(async () => {
    if (demo) {
      setNotices([])
      return
    }
    setLoading(true)
    try {
      const q = classId ? `?class_id=${encodeURIComponent(classId)}` : ""
      const data = await apiGet<NoticeRow[]>(`/class-notices${q}`)
      setNotices(Array.isArray(data) ? data : [])
    } catch {
      setNotices([])
    } finally {
      setLoading(false)
    }
  }, [classId, demo])

  useEffect(() => {
    if (classesReady && tab === "message") loadNotices()
  }, [classesReady, loadNotices, tab])

  async function send() {
    if (!classId || !message.trim()) return
    if (demo) {
      alert(zh ? "請用中心帳號登入" : "Sign in with a centre account")
      return
    }
    try {
      await apiPost("/class-notices", { classId: Number(classId), message: message.trim() })
      setMessage("")
      await loadNotices()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Send failed")
    }
  }

  async function saveEdit() {
    if (!editing || !editMsg.trim()) return
    try {
      await apiPatch(`/class-notices/${editing.id}`, { message: editMsg.trim() })
      setEditing(null)
      await loadNotices()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed")
    }
  }

  async function remove(id: number) {
    if (!confirm(zh ? "刪除此回饋？" : "Delete this feedback?")) return
    try {
      await apiDelete(`/class-notices/${id}`)
      await loadNotices()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed")
    }
  }

  if (!classesReady) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 rounded-full border-2 border-classz-400 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <AdminPageFrame>
      <AdminPageHeader title={zh ? "課堂回饋" : "Feedback"} Icon={MessageSquareText} />

      <div className={`${FEEDBACK_CONTENT} ${FEEDBACK_STACK}`}>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTab("alr")}
            className={`px-4 py-2 rounded-md text-sm font-medium border ${
              tab === "alr" ? "bg-classz-100 border-classz-400 text-classz-800" : "bg-white border-classz-200 text-classz-600"
            }`}
          >
            Academic Learning Record
          </button>
          <button
            type="button"
            onClick={() => setTab("message")}
            className={`px-4 py-2 rounded-md text-sm font-medium border ${
              tab === "message" ? "bg-classz-100 border-classz-400 text-classz-800" : "bg-white border-classz-200 text-classz-600"
            }`}
          >
            {zh ? "簡短訊息" : "Quick message"}
          </button>
        </div>

        {tab === "alr" ? (
          <ActivityLearningRecordSection classes={classes} classFilter={classId} onClassFilterChange={setClassId} />
        ) : (
          <>
            <AdminCard className="overflow-hidden">
              <h2 className={`${FEEDBACK_LIST_TITLE} flex items-center gap-2`}>
                <Send className="h-5 w-5 text-classz-500" />
                {zh ? "發送回饋給家長" : "Send feedback to parents"}
              </h2>
              <div className={FEEDBACK_FORM_STACK}>
                <div>
                  <AdminLabel>{zh ? "課堂" : "Class session"}</AdminLabel>
                  <AdminSelect value={classId} onChange={(e) => setClassId(e.target.value)}>
                    <option value="">{zh ? "選擇…" : "Select…"}</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </AdminSelect>
                </div>
                <div>
                  <AdminLabel>{zh ? "回饋內容" : "Feedback message"}</AdminLabel>
                  <AdminTextarea
                    className="min-h-[100px]"
                    placeholder={zh ? "例如：今日表現良好，建議回家練習…" : "e.g. Great progress today, please practice at home…"}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <AdminPrimaryButton type="button" onClick={send} disabled={!classId || !message.trim()}>
                  {zh ? "發送" : "Send"}
                </AdminPrimaryButton>
              </div>
            </AdminCard>

            <AdminCard className="overflow-hidden">
              <h2 className={FEEDBACK_LIST_TITLE}>{zh ? "已發送回饋" : "Sent feedback"}</h2>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 rounded-full border-2 border-classz-400 border-t-transparent animate-spin" />
              </div>
            ) : (
              <ul className="divide-y divide-classz-100 border border-classz-200 rounded-lg overflow-hidden bg-white">
                {notices.map((n) => (
                  <li key={n.id} className="px-4 py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 bg-classz-50/30">
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-classz-600">{n.class_name || `#${n.class_id}`}</p>
                      {editing?.id === n.id ? (
                        <AdminTextarea className="mt-2 min-h-[80px]" value={editMsg} onChange={(e) => setEditMsg(e.target.value)} />
                      ) : (
                        <p className="mt-1 text-classz-800 whitespace-pre-wrap">{n.message}</p>
                      )}
                      <p className="mt-1 text-base text-classz-500">{new Date(n.created_at).toLocaleString(zh ? "zh-HK" : "en-HK")}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {editing?.id === n.id ? (
                        <>
                          <AdminPrimaryButton type="button" className="py-2.5 px-4 text-base" onClick={saveEdit}>
                            <Save className="h-3.5 w-3.5" />
                            {zh ? "儲存" : "Save"}
                          </AdminPrimaryButton>
                          <button type="button" className="px-4 py-2.5 text-base rounded-md border border-classz-300 text-classz-700" onClick={() => setEditing(null)}>
                            {zh ? "取消" : "Cancel"}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="p-2 text-classz-500 hover:bg-classz-100 rounded"
                            onClick={() => {
                              setEditing(n)
                              setEditMsg(n.message)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button type="button" className="p-2 text-red-600 hover:bg-red-50 rounded" onClick={() => remove(n.id)}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ))}
                {notices.length === 0 && (
                  <li className="px-4 py-8 text-center text-classz-500">{zh ? "尚無回饋" : "No feedback yet"}</li>
                )}
              </ul>
            )}
            </AdminCard>
          </>
        )}
      </div>
    </AdminPageFrame>
  )
}
