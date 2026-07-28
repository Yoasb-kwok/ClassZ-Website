"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ListTodo, Plus, Trash2 } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { isDemoSession } from "@/components/admin/use-admin-api"
import { getClasszSession } from "@/lib/classz-auth"
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/classz-api-client"
import {
  AdminCard,
  AdminGhostButton,
  AdminInput,
  AdminLabel,
  AdminModal,
  AdminPageFrame,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminSelect,
  AdminStatusChip,
  AdminTable,
  AdminTableShell,
  AdminTextarea,
  AdminToolbar,
  brandToneBar,
  brandTonePanel,
  priorityTone,
  statusTone,
} from "@/components/classz-admin-ui"

type TaskStatus = "todo" | "in_progress" | "done" | "cancelled"
type TaskPriority = "low" | "medium" | "high"

type CenterTask = {
  id: number
  title: string
  description?: string | null
  status: TaskStatus
  priority: TaskPriority
  assignee_user_id?: number | null
  assignee_name?: string | null
  assignee_email?: string | null
  created_by_name?: string | null
  due_at?: string | null
  completed_at?: string | null
  created_at?: string | null
}

type CoachOption = {
  id: number
  email: string
  full_name?: string | null
  name?: string | null
  is_active?: boolean
}

const STATUS_ORDER: TaskStatus[] = ["todo", "in_progress", "done", "cancelled"]

function statusLabel(s: TaskStatus, zh: boolean) {
  if (s === "todo") return zh ? "待辦" : "To do"
  if (s === "in_progress") return zh ? "進行中" : "In progress"
  if (s === "done") return zh ? "完成" : "Done"
  return zh ? "取消" : "Cancelled"
}

function priorityLabel(p: TaskPriority, zh: boolean) {
  if (p === "high") return zh ? "高" : "High"
  if (p === "low") return zh ? "低" : "Low"
  return zh ? "中" : "Medium"
}

function formatDue(iso: string | null | undefined, zh: boolean) {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleString(zh ? "zh-HK" : "en-HK", { dateStyle: "medium", timeStyle: "short" })
}

export function TasksManager() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const demo = isDemoSession()
  const session = getClasszSession()
  const isCoach = session?.user.role === "coach"

  const [tasks, setTasks] = useState<CenterTask[]>([])
  const [coaches, setCoaches] = useState<CoachOption[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [assigneeFilter, setAssigneeFilter] = useState<string>("")
  const [modal, setModal] = useState<"create" | "edit" | null>(null)
  const [editing, setEditing] = useState<CenterTask | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "todo" as TaskStatus,
    priority: "medium" as TaskPriority,
    assignee_user_id: "",
    due_at: "",
  })

  const load = useCallback(async () => {
    if (demo) {
      setTasks([])
      setCoaches([])
      return
    }
    try {
      const qs = new URLSearchParams()
      if (isCoach) qs.set("mine", "1")
      if (statusFilter) qs.set("status", statusFilter)
      if (!isCoach && assigneeFilter) qs.set("assignee_user_id", assigneeFilter)
      const path = qs.toString() ? `/tasks?${qs}` : "/tasks"
      const data = await apiGet<CenterTask[]>(path)
      setTasks(Array.isArray(data) ? data : [])
      if (!isCoach) {
        const coachData = await apiGet<CoachOption[]>("/coaches").catch(() => [] as CoachOption[])
        setCoaches(Array.isArray(coachData) ? coachData : [])
      }
    } catch {
      setTasks([])
    }
  }, [demo, isCoach, statusFilter, assigneeFilter])

  useEffect(() => {
    load()
  }, [load])

  const grouped = useMemo(() => {
    const map: Record<TaskStatus, CenterTask[]> = {
      todo: [],
      in_progress: [],
      done: [],
      cancelled: [],
    }
    for (const t of tasks) {
      const s = (STATUS_ORDER.includes(t.status) ? t.status : "todo") as TaskStatus
      map[s].push(t)
    }
    return map
  }, [tasks])

  function openCreate() {
    setEditing(null)
    setForm({
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      assignee_user_id: "",
      due_at: "",
    })
    setModal("create")
  }

  function openEdit(t: CenterTask) {
    setEditing(t)
    setForm({
      title: t.title || "",
      description: t.description || "",
      status: t.status,
      priority: t.priority,
      assignee_user_id: t.assignee_user_id != null ? String(t.assignee_user_id) : "",
      due_at: t.due_at ? t.due_at.slice(0, 16) : "",
    })
    setModal("edit")
  }

  function closeModal() {
    if (saving) return
    setModal(null)
    setEditing(null)
  }

  async function saveCreate() {
    if (demo || !form.title.trim()) return
    setSaving(true)
    try {
      await apiPost("/tasks", {
        title: form.title.trim(),
        description: form.description.trim() || null,
        status: form.status,
        priority: form.priority,
        assignee_user_id: form.assignee_user_id ? Number(form.assignee_user_id) : null,
        due_at: form.due_at ? new Date(form.due_at).toISOString() : null,
      })
      setModal(null)
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed")
    } finally {
      setSaving(false)
    }
  }

  async function saveEdit() {
    if (demo || !editing) return
    setSaving(true)
    try {
      if (isCoach) {
        await apiPatch(`/tasks/${editing.id}`, { status: form.status })
      } else {
        await apiPatch(`/tasks/${editing.id}`, {
          title: form.title.trim(),
          description: form.description.trim() || null,
          status: form.status,
          priority: form.priority,
          assignee_user_id: form.assignee_user_id ? Number(form.assignee_user_id) : null,
          due_at: form.due_at ? new Date(form.due_at).toISOString() : null,
        })
      }
      setModal(null)
      setEditing(null)
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed")
    } finally {
      setSaving(false)
    }
  }

  async function removeTask(t: CenterTask) {
    if (demo || isCoach) return
    if (!confirm(zh ? "刪除此任務？" : "Delete this task?")) return
    try {
      await apiDelete(`/tasks/${t.id}`)
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed")
    }
  }

  async function quickStatus(t: CenterTask, status: TaskStatus) {
    if (demo) return
    try {
      await apiPatch(`/tasks/${t.id}`, { status })
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed")
    }
  }

  return (
    <AdminPageFrame>
      <AdminPageHeader
        title={isCoach ? (zh ? "我的任務" : "My tasks") : zh ? "指派任務" : "Tasks"}
        Icon={ListTodo}
        description={
          isCoach
            ? zh
              ? "中心管理員指派給你的工作"
              : "Work assigned by your centre admin"
            : zh
              ? "指派給中心導師的待辦事項"
              : "Assign work items to centre teachers"
        }
      />

      <AdminCard>
        <AdminToolbar>
          <AdminSelect
            className="max-w-[10rem]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">{zh ? "全部狀態" : "All statuses"}</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s, zh)}
              </option>
            ))}
          </AdminSelect>
          {!isCoach ? (
            <AdminSelect
              className="max-w-[14rem]"
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
            >
              <option value="">{zh ? "全部導師" : "All coaches"}</option>
              {coaches.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name || c.name || c.email}
                </option>
              ))}
            </AdminSelect>
          ) : null}
          {!isCoach ? (
            <AdminPrimaryButton type="button" className="ml-auto" onClick={openCreate} disabled={demo}>
              <Plus className="h-4 w-4" />
              {zh ? "新增任務" : "New task"}
            </AdminPrimaryButton>
          ) : null}
        </AdminToolbar>

        <div className="grid gap-4 lg:grid-cols-3">
          {(["todo", "in_progress", "done"] as TaskStatus[]).map((col) => {
            const tone = statusTone(col)
            return (
            <div key={col} className={`rounded-lg border min-h-[12rem] ${brandTonePanel(tone)}`}>
              <div className={`mb-0 h-0.5 w-full rounded-t-lg ${brandToneBar(tone)}`} />
              <div className="px-3 py-2 border-b border-black/5 text-sm font-semibold text-brand-slate">
                {statusLabel(col, zh)} ({grouped[col].length})
              </div>
              <ul className="p-2 space-y-2">
                {grouped[col].map((t) => (
                  <li key={t.id} className="rounded-md border border-white/80 bg-white p-3 shadow-sm">
                    <button type="button" className="text-left w-full" onClick={() => openEdit(t)}>
                      <div className="font-medium text-brand-slate">{t.title}</div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <AdminStatusChip tone={priorityTone(t.priority)}>{priorityLabel(t.priority, zh)}</AdminStatusChip>
                        <span className="text-xs text-brand-slate/60">{formatDue(t.due_at, zh)}</span>
                      </div>
                      {!isCoach ? (
                        <div className="mt-1 text-xs text-brand-slate/70">
                          {t.assignee_name || t.assignee_email || (zh ? "未指派" : "Unassigned")}
                        </div>
                      ) : null}
                    </button>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {STATUS_ORDER.filter((s) => s !== t.status && s !== "cancelled").map((s) => (
                        <button
                          key={s}
                          type="button"
                          className="text-[11px] px-2 py-0.5 rounded border border-classz-200 text-brand-slate/80 hover:bg-classz-50"
                          onClick={() => quickStatus(t, s)}
                        >
                          → {statusLabel(s, zh)}
                        </button>
                      ))}
                      {!isCoach ? (
                        <button
                          type="button"
                          className="ml-auto p-1 text-brand-coral hover:bg-[color-mix(in_srgb,var(--brand-coral)_10%,white)] rounded"
                          onClick={() => removeTask(t)}
                          aria-label={zh ? "刪除" : "Delete"}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </div>
                  </li>
                ))}
                {!grouped[col].length ? (
                  <li className="text-center text-xs text-brand-slate/45 py-6">{zh ? "無" : "Empty"}</li>
                ) : null}
              </ul>
            </div>
            )
          })}
        </div>

        {grouped.cancelled.length ? (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-classz-600 mb-2">{statusLabel("cancelled", zh)}</h3>
            <AdminTableShell>
              <AdminTable>
                <thead className="bg-classz-100">
                  <tr>
                    <th className="px-3 py-2 text-left">{zh ? "標題" : "Title"}</th>
                    <th className="px-3 py-2 text-left">{zh ? "指派" : "Assignee"}</th>
                    <th className="px-3 py-2 text-left">{zh ? "到期" : "Due"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-classz-100">
                  {grouped.cancelled.map((t) => (
                    <tr key={t.id} className="bg-white">
                      <td className="px-3 py-2">
                        <button type="button" className="text-left text-classz-700" onClick={() => openEdit(t)}>
                          {t.title}
                        </button>
                      </td>
                      <td className="px-3 py-2 text-sm">{t.assignee_name || t.assignee_email || "—"}</td>
                      <td className="px-3 py-2 text-sm">{formatDue(t.due_at, zh)}</td>
                    </tr>
                  ))}
                </tbody>
              </AdminTable>
            </AdminTableShell>
          </div>
        ) : null}
      </AdminCard>

      <AdminModal
        open={modal === "create" || modal === "edit"}
        title={
          isCoach
            ? zh
              ? "更新任務"
              : "Update task"
            : modal === "create"
              ? zh
                ? "新增任務"
                : "New task"
              : zh
                ? "編輯任務"
                : "Edit task"
        }
        onClose={closeModal}
        footer={
          <>
            <AdminGhostButton type="button" onClick={closeModal} disabled={saving}>
              {zh ? "取消" : "Cancel"}
            </AdminGhostButton>
            <AdminPrimaryButton
              type="button"
              disabled={saving || (!isCoach && !form.title.trim())}
              onClick={modal === "create" ? saveCreate : saveEdit}
            >
              {saving ? (zh ? "儲存中…" : "Saving…") : zh ? "儲存" : "Save"}
            </AdminPrimaryButton>
          </>
        }
      >
        <div className="space-y-3">
          {!isCoach ? (
            <>
              <div>
                <AdminLabel>{zh ? "標題" : "Title"}</AdminLabel>
                <AdminInput value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <AdminLabel>{zh ? "說明" : "Description"}</AdminLabel>
                <AdminTextarea
                  className="min-h-[80px]"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <AdminLabel>{zh ? "優先度" : "Priority"}</AdminLabel>
                  <AdminSelect
                    value={form.priority}
                    onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as TaskPriority }))}
                  >
                    <option value="low">{priorityLabel("low", zh)}</option>
                    <option value="medium">{priorityLabel("medium", zh)}</option>
                    <option value="high">{priorityLabel("high", zh)}</option>
                  </AdminSelect>
                </div>
                <div>
                  <AdminLabel>{zh ? "指派給" : "Assignee"}</AdminLabel>
                  <AdminSelect
                    value={form.assignee_user_id}
                    onChange={(e) => setForm((f) => ({ ...f, assignee_user_id: e.target.value }))}
                  >
                    <option value="">{zh ? "未指派" : "Unassigned"}</option>
                    {coaches.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.full_name || c.name || c.email}
                      </option>
                    ))}
                  </AdminSelect>
                </div>
              </div>
              <div>
                <AdminLabel>{zh ? "到期時間" : "Due"}</AdminLabel>
                <AdminInput
                  type="datetime-local"
                  value={form.due_at}
                  onChange={(e) => setForm((f) => ({ ...f, due_at: e.target.value }))}
                />
              </div>
            </>
          ) : (
            <div>
              <p className="text-sm font-medium text-classz-800">{editing?.title}</p>
              {editing?.description ? (
                <p className="mt-1 text-sm text-classz-600 whitespace-pre-wrap">{editing.description}</p>
              ) : null}
            </div>
          )}
          <div>
            <AdminLabel>{zh ? "狀態" : "Status"}</AdminLabel>
            <AdminSelect
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as TaskStatus }))}
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s, zh)}
                </option>
              ))}
            </AdminSelect>
          </div>
        </div>
      </AdminModal>
    </AdminPageFrame>
  )
}
