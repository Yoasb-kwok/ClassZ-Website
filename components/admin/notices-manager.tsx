"use client"

import { useState } from "react"
import { Edit, MessageSquare, Save, Send, Trash2 } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { appendAudit, newId, type ClassNotice } from "@/lib/classz-admin-store"
import { useAdminStore } from "@/components/admin/use-admin-store"
import {
  AdminCard,
  AdminLabel,
  AdminPageFrame,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminSelect,
  AdminTextarea,
} from "@/components/classz-admin-ui"

export function NoticesManager() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const { store, patch, ready } = useAdminStore()
  const [courseId, setCourseId] = useState("")
  const [message, setMessage] = useState("")
  const [editing, setEditing] = useState<ClassNotice | null>(null)
  const [editMsg, setEditMsg] = useState("")

  function send() {
    if (!store || !courseId || !message.trim()) return
    const c = store.courses.find((x) => x.id === courseId)
    const n: ClassNotice = {
      id: newId(),
      course_id: courseId,
      course_name: c?.name ?? courseId,
      message: message.trim(),
      created_at: new Date().toISOString(),
    }
    patch((s) => appendAudit({ ...s, classNotices: [n, ...s.classNotices] }, { action: "create_class_notice", target_type: "notice", target_id: n.id, details: n.message.slice(0, 80) }))
    setMessage("")
  }

  function startEdit(n: ClassNotice) {
    setEditing(n)
    setEditMsg(n.message)
  }

  function saveEdit() {
    if (!editing || !editMsg.trim()) return
    patch((s) =>
      appendAudit(
        {
          ...s,
          classNotices: s.classNotices.map((x) => (x.id === editing.id ? { ...x, message: editMsg.trim() } : x)),
        },
        { action: "update_class_notice", target_type: "notice", target_id: editing.id, details: "" }
      )
    )
    setEditing(null)
  }

  function remove(id: string) {
    if (!confirm(zh ? "刪除此通知？" : "Delete this notice?")) return
    patch((s) => appendAudit({ ...s, classNotices: s.classNotices.filter((x) => x.id !== id) }, { action: "delete_class_notice", target_type: "notice", target_id: id, details: "" }))
  }

  if (!ready || !store) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 rounded-full border-2 border-classz-400 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <AdminPageFrame>
      <AdminPageHeader title={zh ? "全班通知" : "Class notices"} Icon={MessageSquare} />
      <AdminCard>
        <h2 className="text-lg font-semibold text-classz-700 mb-4 flex items-center gap-2">
          <Send className="h-5 w-5 text-classz-500" />
          {zh ? "發送新通知" : "Send notice"}
        </h2>
        <div className="space-y-3 max-w-xl">
          <div>
            <AdminLabel>{zh ? "班別 / 課程" : "Class / course"}</AdminLabel>
            <AdminSelect value={courseId} onChange={(e) => setCourseId(e.target.value)}>
              <option value="">{zh ? "選擇…" : "Select…"}</option>
              {store.courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </AdminSelect>
          </div>
          <div>
            <AdminLabel>{zh ? "訊息" : "Message"}</AdminLabel>
            <AdminTextarea className="min-h-[100px]" value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          <AdminPrimaryButton type="button" onClick={send} disabled={!courseId || !message.trim()}>
            {zh ? "加入列表" : "Add to list"}
          </AdminPrimaryButton>
        </div>
      </AdminCard>

      <AdminCard>
        <h2 className="text-lg font-semibold text-classz-700 mb-4">{zh ? "通知列表" : "Notices"}</h2>
        <ul className="divide-y divide-classz-100 border border-classz-200 rounded-lg overflow-hidden bg-white">
          {store.classNotices.map((n) => (
            <li key={n.id} className="px-4 py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 bg-classz-50/30">
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-classz-600 uppercase">{n.course_name}</p>
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
                    <button
                      type="button"
                      className="px-4 py-2.5 text-base rounded-md border border-classz-300 text-classz-700 hover:bg-classz-50"
                      onClick={() => setEditing(null)}
                    >
                      {zh ? "取消" : "Cancel"}
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" className="p-2 text-classz-500 hover:bg-classz-100 rounded" onClick={() => startEdit(n)} title="Edit">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button type="button" className="p-2 text-brand-coral hover:bg-[color-mix(in_srgb,var(--brand-coral)_10%,white)] rounded" onClick={() => remove(n.id)} title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </AdminCard>
    </AdminPageFrame>
  )
}
