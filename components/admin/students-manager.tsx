"use client"

import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { ChevronDown, ChevronRight, Search, Users } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { isDemoSession } from "@/components/admin/use-admin-api"
import { apiGet, apiPatch, apiPost } from "@/lib/classz-api-client"
import {
  AdminCard,
  AdminGhostButton,
  AdminInput,
  AdminLabel,
  AdminPageFrame,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminSelect,
  AdminTable,
  AdminTableShell,
  AdminTextarea,
  AdminToolbar,
} from "@/components/classz-admin-ui"

type StudentProfile = {
  id: string | number
  full_name?: string
  date_of_birth?: string | null
  sex?: number | boolean | null
  gender?: string | null
  school?: string | null
  status?: string | null
  level?: string | null
  created_at?: string | null
}

type ParentAccount = {
  id: string | number
  account_number?: string
  account_type?: "master" | "sub" | string
  parents_name?: string | null
  full_name?: string | null
  name?: string | null
  email?: string | null
  mobile?: string | null
  residential_district?: string | null
  last_login_at?: string | null
  last_seen_at?: string | null
  students_count?: number
  profiles_count?: number
  student_profiles?: StudentProfile[]
  profiles?: StudentProfile[]
  sub_accounts?: ParentAccount[]
  sub_accounts_count?: number
}

type TimelineEvent = {
  type: string
  at: string
  title: string
  status?: string
  amount?: number
}

function formatDate(value?: string | null, withTime = false) {
  if (!value) return "—"
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value).slice(0, withTime ? 19 : 10)
  return withTime ? d.toLocaleString() : d.toLocaleDateString()
}

function genderLabel(p: StudentProfile, zh: boolean) {
  if (p.gender === "male" || p.sex === true || p.sex === 1) return zh ? "男" : "Male"
  if (p.gender === "female" || p.sex === false || p.sex === 0) return zh ? "女" : "Female"
  return "—"
}

function statusLabel(p: StudentProfile, zh: boolean) {
  const raw = String(p.status || p.level || "active").toLowerCase()
  if (raw === "active" || raw === "活躍") return zh ? "活躍" : "Active"
  if (raw === "inactive" || raw === "停用") return zh ? "停用" : "Inactive"
  return p.status || p.level || (zh ? "活躍" : "Active")
}

function parentDisplayName(u: ParentAccount) {
  return u.parents_name || u.full_name || u.name || "—"
}

export function StudentsManager() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const demo = isDemoSession()
  const [rows, setRows] = useState<ParentAccount[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [selected, setSelected] = useState<ParentAccount | null>(null)
  const [tab, setTab] = useState<"edit" | "history" | "progress" | "invoices" | "notes" | "transfer">("edit")
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [progress, setProgress] = useState<unknown[]>([])
  const [invoices, setInvoices] = useState<Array<{ id: number; total: number; payment_status: string; created_at: string }>>([])
  const [notes, setNotes] = useState<Array<{ id: number; body: string; created_at: string }>>([])
  const [noteBody, setNoteBody] = useState("")
  const [medical, setMedical] = useState("")
  const [classes, setClasses] = useState<Array<{ id: number; name: string }>>([])
  const [fromClass, setFromClass] = useState("")
  const [toClass, setToClass] = useState("")
  const [editName, setEditName] = useState("")
  const [editMobile, setEditMobile] = useState("")

  const load = useCallback(async () => {
    if (demo) {
      setRows([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await apiGet<ParentAccount[]>("/users")
      const list = Array.isArray(data) ? data : []
      const q = search.trim().toLowerCase()
      setRows(
        q
          ? list.filter((u) => {
              const kids = u.student_profiles || u.profiles || []
              const hay = [
                u.account_number,
                u.parents_name,
                u.full_name,
                u.name,
                u.email,
                u.mobile,
                u.residential_district,
                ...kids.map((k) => k.full_name),
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
              return hay.includes(q)
            })
          : list,
      )
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [demo, search])

  useEffect(() => {
    load()
  }, [load])

  const totalStudents = useMemo(
    () => rows.reduce((sum, r) => sum + Number(r.students_count ?? r.profiles_count ?? (r.student_profiles || []).length ?? 0), 0),
    [rows],
  )

  function toggleExpand(id: string | number) {
    const key = String(id)
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  async function openDetail(u: ParentAccount) {
    setSelected(u)
    setTab("edit")
    setEditName(parentDisplayName(u) === "—" ? "" : parentDisplayName(u))
    setEditMobile(u.mobile || "")
    setMedical("")
    if (demo) return
    try {
      const [tl, pr, inv, nt, cls] = await Promise.all([
        apiGet<TimelineEvent[]>(`/students/${u.id}/timeline`).catch(() => []),
        apiGet<unknown[]>(`/students/${u.id}/progress`).catch(() => []),
        apiGet<typeof invoices>(`/students/${u.id}/invoices`).catch(() => []),
        apiGet<typeof notes>(`/users/${u.id}/notes`).catch(() => []),
        apiGet<Array<{ id: number; name: string }>>("/classes").catch(() => []),
      ])
      setTimeline(Array.isArray(tl) ? tl : [])
      setProgress(Array.isArray(pr) ? pr : [])
      setInvoices(Array.isArray(inv) ? inv : [])
      setNotes(Array.isArray(nt) ? nt : [])
      setClasses(Array.isArray(cls) ? cls : [])
    } catch {
      /* ignore */
    }
  }

  async function saveEdit() {
    if (!selected || demo) return
    try {
      await apiPatch(`/users/${selected.id}`, { full_name: editName, mobile: editMobile, parents_name: editName })
      await load()
      alert(zh ? "已儲存" : "Saved")
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed")
    }
  }

  async function addNote() {
    if (!selected || !noteBody.trim() || demo) return
    try {
      await apiPost(`/users/${selected.id}/notes`, { body: noteBody.trim() })
      setNoteBody("")
      const nt = await apiGet<typeof notes>(`/users/${selected.id}/notes`)
      setNotes(Array.isArray(nt) ? nt : [])
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed")
    }
  }

  async function doTransfer() {
    if (!selected || !fromClass || !toClass || demo) return
    try {
      await apiPost(`/students/${selected.id}/transfer`, {
        from_class_id: Number(fromClass),
        to_class_id: Number(toClass),
      })
      alert(zh ? "已轉班" : "Transferred")
      openDetail(selected)
    } catch (e) {
      alert(e instanceof Error ? e.message : "Transfer failed")
    }
  }

  function accountTypeBadge(type?: string) {
    const isMaster = !type || type === "master"
    return (
      <span
        className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${
          isMaster ? "bg-classz-50 text-brand-slate" : "bg-classz-100 text-classz-700"
        }`}
      >
        {isMaster ? (zh ? "主帳戶" : "Master") : zh ? "副帳戶" : "Sub"}
      </span>
    )
  }

  function childrenTable(kids: StudentProfile[]) {
    if (!kids.length) {
      return <p className="text-sm text-classz-500 px-2 py-3">{zh ? "尚未加入學員" : "No students yet"}</p>
    }
    return (
      <div className="overflow-x-auto rounded-md border border-classz-100 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-classz-50 text-classz-600">
            <tr>
              <th className="px-3 py-2 text-left font-medium">{zh ? "學生姓名" : "Student"}</th>
              <th className="px-3 py-2 text-left font-medium">{zh ? "出生日期" : "DOB"}</th>
              <th className="px-3 py-2 text-left font-medium">{zh ? "性別" : "Gender"}</th>
              <th className="px-3 py-2 text-left font-medium">{zh ? "就讀學校" : "School"}</th>
              <th className="px-3 py-2 text-left font-medium">{zh ? "狀態" : "Status"}</th>
              <th className="px-3 py-2 text-left font-medium">{zh ? "加入時間" : "Joined"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-classz-100">
            {kids.map((kid) => (
              <tr key={String(kid.id)}>
                <td className="px-3 py-2 font-medium text-classz-800">{kid.full_name || "—"}</td>
                <td className="px-3 py-2">{formatDate(kid.date_of_birth)}</td>
                <td className="px-3 py-2">{genderLabel(kid, zh)}</td>
                <td className="px-3 py-2">{kid.school || "—"}</td>
                <td className="px-3 py-2">{statusLabel(kid, zh)}</td>
                <td className="px-3 py-2">{formatDate(kid.created_at, true)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  function renderParentRow(u: ParentAccount, opts?: { nested?: boolean }) {
    const key = String(u.id)
    const open = expanded.has(key)
    const kids = u.student_profiles || u.profiles || []
    const subs = u.sub_accounts || []
    const canExpand = kids.length > 0 || subs.length > 0
    const count = Number(u.students_count ?? u.profiles_count ?? kids.length) || 0

    return (
      <Fragment key={key}>
        <tr className={opts?.nested ? "bg-classz-50/70" : selected && String(selected.id) === key ? "bg-classz-50/80" : "bg-white"}>
          <td className="px-2 py-2 w-10">
            {canExpand ? (
              <button
                type="button"
                className="p-1 rounded hover:bg-classz-100"
                onClick={() => toggleExpand(u.id)}
                aria-label={open ? "Collapse" : "Expand"}
              >
                {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ) : null}
          </td>
          <td className="px-3 py-2 font-mono text-xs">{u.account_number || u.id}</td>
          <td className="px-3 py-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-classz-800">{parentDisplayName(u)}</span>
              {accountTypeBadge(u.account_type)}
            </div>
          </td>
          <td className="px-3 py-2 tabular-nums">{count}</td>
          <td className="px-3 py-2">{u.mobile || "—"}</td>
          <td className="px-3 py-2">{u.residential_district || "—"}</td>
          <td className="px-3 py-2 text-sm">{u.email || "—"}</td>
          <td className="px-3 py-2 text-sm whitespace-nowrap">{formatDate(u.last_login_at || u.last_seen_at, true)}</td>
          <td className="px-3 py-2 text-right">
            <AdminGhostButton type="button" className="text-sm py-1 px-2" onClick={() => openDetail(u)}>
              {zh ? "詳情" : "Open"}
            </AdminGhostButton>
          </td>
        </tr>
        {open ? (
          <tr className="bg-[var(--admin-canvas)]">
            <td colSpan={9} className="px-4 py-3">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-classz-500 mb-2">{zh ? "學員" : "Students"}</p>
                  {childrenTable(kids)}
                </div>
                {subs.length > 0 ? (
                  <div>
                    <p className="text-xs font-medium text-classz-500 mb-2">
                      {zh ? `副帳戶（${subs.length}）` : `Sub accounts (${subs.length})`}
                    </p>
                    <div className="overflow-x-auto rounded-md border border-classz-100">
                      <AdminTable>
                        <tbody className="divide-y divide-classz-100">
                          {subs.map((sub) => (
                            <Fragment key={String(sub.id)}>
                              <tr className="bg-white">
                                <td className="px-3 py-2 font-mono text-xs w-28">{sub.account_number || sub.id}</td>
                                <td className="px-3 py-2">
                                  <div className="flex items-center gap-2">
                                    <span>{parentDisplayName(sub)}</span>
                                    {accountTypeBadge("sub")}
                                  </div>
                                </td>
                                <td className="px-3 py-2">{sub.mobile || "—"}</td>
                                <td className="px-3 py-2 text-sm">{sub.email || "—"}</td>
                                <td className="px-3 py-2 text-right">
                                  <AdminGhostButton
                                    type="button"
                                    className="text-sm py-1 px-2"
                                    onClick={() => openDetail(sub)}
                                  >
                                    {zh ? "詳情" : "Open"}
                                  </AdminGhostButton>
                                </td>
                              </tr>
                            </Fragment>
                          ))}
                        </tbody>
                      </AdminTable>
                    </div>
                  </div>
                ) : null}
              </div>
            </td>
          </tr>
        ) : null}
      </Fragment>
    )
  }

  return (
    <AdminPageFrame>
      <AdminPageHeader
        title={zh ? "學員" : "Students"}
        Icon={Users}
        description={
          zh
            ? `家長主／副帳戶一覽 · ${rows.length} 個帳戶 · ${totalStudents} 名學員（點擊列展開）`
            : `${rows.length} parent accounts · ${totalStudents} students (expand a row)`
        }
      />
      <AdminToolbar>
        <div className="relative flex-1 min-w-[12rem]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-classz-400" />
          <AdminInput
            className="pl-9"
            placeholder={zh ? "搜尋帳戶編號、家長、學員、電郵、電話…" : "Search account, parent, student, email, phone…"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
          />
        </div>
        <AdminGhostButton type="button" onClick={() => load()}>
          {zh ? "搜尋" : "Search"}
        </AdminGhostButton>
      </AdminToolbar>

      <AdminCard className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 rounded-full border-2 border-classz-400 border-t-transparent animate-spin" />
          </div>
        ) : (
          <AdminTableShell>
            <AdminTable>
              <thead className="bg-classz-100">
                <tr>
                  <th className="px-2 py-2 w-10" />
                  <th className="px-3 py-2 text-left">{zh ? "帳戶編號" : "Account #"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "家長姓名" : "Parent"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "學員數量" : "Students"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "手機號碼" : "Mobile"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "居住地區" : "District"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "電郵" : "Email"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "最後上綫" : "Last online"}</th>
                  <th className="px-3 py-2 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-classz-100">
                {rows.map((u) => renderParentRow(u))}
                {!rows.length ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-8 text-center text-classz-500">
                      {demo ? (zh ? "請用中心帳號登入" : "Sign in with centre account") : zh ? "無家長帳戶" : "No parent accounts"}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </AdminTable>
          </AdminTableShell>
        )}
      </AdminCard>

      {selected ? (
        <AdminCard className="mt-4">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h3 className="font-semibold text-classz-800">{parentDisplayName(selected)}</h3>
                <p className="text-sm text-classz-500">
                  {selected.email} · {accountTypeBadge(selected.account_type)}
                </p>
              </div>
              <AdminGhostButton type="button" onClick={() => setSelected(null)}>
                {zh ? "關閉" : "Close"}
              </AdminGhostButton>
            </div>
            <div className="flex flex-wrap gap-1">
              {(
                [
                  ["edit", zh ? "編輯" : "Edit"],
                  ["history", zh ? "紀錄" : "History"],
                  ["progress", zh ? "進度" : "Progress"],
                  ["invoices", zh ? "發票" : "Invoices"],
                  ["notes", zh ? "備註" : "Notes"],
                  ["transfer", zh ? "轉班" : "Transfer"],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setTab(k)}
                  className={`px-3 py-1.5 text-xs rounded-md border ${
                    tab === k ? "bg-classz-100 border-classz-400" : "border-classz-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === "edit" ? (
              <div className="space-y-3 max-w-md">
                <div>
                  <AdminLabel>{zh ? "家長姓名" : "Parent name"}</AdminLabel>
                  <AdminInput value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div>
                  <AdminLabel>{zh ? "電話" : "Mobile"}</AdminLabel>
                  <AdminInput value={editMobile} onChange={(e) => setEditMobile(e.target.value)} />
                </div>
                <div>
                  <AdminLabel>{zh ? "醫療備註" : "Medical notes"}</AdminLabel>
                  <AdminTextarea className="min-h-[80px]" value={medical} onChange={(e) => setMedical(e.target.value)} />
                </div>
                <AdminPrimaryButton type="button" onClick={saveEdit}>
                  {zh ? "儲存" : "Save"}
                </AdminPrimaryButton>
              </div>
            ) : null}

            {tab === "history" ? (
              <ul className="space-y-2 max-h-80 overflow-y-auto text-sm">
                {timeline.map((e, i) => (
                  <li key={i} className="border border-classz-100 rounded-md px-3 py-2">
                    <span className="text-xs text-classz-400 uppercase">{e.type}</span>
                    <p className="font-medium">{e.title}</p>
                    <p className="text-classz-500">
                      {e.at ? new Date(e.at).toLocaleString() : ""} · {e.status}
                    </p>
                  </li>
                ))}
                {!timeline.length ? <li className="text-classz-500">{zh ? "無紀錄" : "No history"}</li> : null}
              </ul>
            ) : null}

            {tab === "progress" ? (
              <pre className="text-xs bg-classz-50 p-3 rounded-md max-h-80 overflow-auto">
                {JSON.stringify(progress, null, 2)}
              </pre>
            ) : null}

            {tab === "invoices" ? (
              <ul className="space-y-2 text-sm">
                {invoices.map((inv) => (
                  <li key={inv.id} className="flex justify-between border-b border-classz-100 py-2">
                    <span>#{inv.id}</span>
                    <span>HK${Number(inv.total).toLocaleString()}</span>
                    <span className="text-classz-500">{inv.payment_status}</span>
                  </li>
                ))}
                {!invoices.length ? <li className="text-classz-500">{zh ? "無發票" : "No invoices"}</li> : null}
              </ul>
            ) : null}

            {tab === "notes" ? (
              <div className="space-y-3">
                <AdminTextarea
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  placeholder={zh ? "家長備註…" : "Parent note…"}
                />
                <AdminPrimaryButton type="button" onClick={addNote}>
                  {zh ? "新增備註" : "Add note"}
                </AdminPrimaryButton>
                <ul className="space-y-2 text-sm max-h-48 overflow-y-auto">
                  {notes.map((n) => (
                    <li key={n.id} className="border border-classz-100 rounded px-3 py-2">
                      <p>{n.body}</p>
                      <p className="text-xs text-classz-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {tab === "transfer" ? (
              <div className="space-y-3 max-w-md">
                <div>
                  <AdminLabel>{zh ? "原課堂" : "From class"}</AdminLabel>
                  <AdminSelect value={fromClass} onChange={(e) => setFromClass(e.target.value)}>
                    <option value="">—</option>
                    {classes.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                      </option>
                    ))}
                  </AdminSelect>
                </div>
                <div>
                  <AdminLabel>{zh ? "目標課堂" : "To class"}</AdminLabel>
                  <AdminSelect value={toClass} onChange={(e) => setToClass(e.target.value)}>
                    <option value="">—</option>
                    {classes.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                      </option>
                    ))}
                  </AdminSelect>
                </div>
                <AdminPrimaryButton type="button" onClick={doTransfer}>
                  {zh ? "確認轉班" : "Transfer"}
                </AdminPrimaryButton>
              </div>
            ) : null}
          </div>
        </AdminCard>
      ) : null}
    </AdminPageFrame>
  )
}
