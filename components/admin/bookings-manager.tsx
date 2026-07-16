"use client"

import { useCallback, useEffect, useState } from "react"
import { CalendarClock } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { isDemoSession } from "@/components/admin/use-admin-api"
import { apiGet, apiPatch, apiPost } from "@/lib/classz-api-client"
import {
  AdminCard,
  AdminGhostButton,
  AdminInput,
  AdminPageFrame,
  AdminPageHeader,
  AdminPrimaryButton,
  AdminSelect,
  AdminTable,
  AdminTableShell,
} from "@/components/classz-admin-ui"

type EnrollReq = {
  id: number
  student_name?: string
  class_name?: string
  status: string
  tokens_required?: number
  created_at?: string
}

type WaitlistRow = {
  id: number
  class_id: number
  student_name?: string
  contact_email?: string
  status: string
}

export function BookingsManager() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const demo = isDemoSession()
  const [tab, setTab] = useState<"requests" | "waitlist">("requests")
  const [requests, setRequests] = useState<EnrollReq[]>([])
  const [waitlist, setWaitlist] = useState<WaitlistRow[]>([])
  const [classes, setClasses] = useState<Array<{ id: number; name: string }>>([])
  const [wlForm, setWlForm] = useState({ class_id: "", student_name: "", contact_email: "" })

  const load = useCallback(async () => {
    if (demo) return
    try {
      const [req, wl, cls] = await Promise.all([
        apiGet<EnrollReq[]>("/enrollment-requests").catch(() => []),
        apiGet<WaitlistRow[]>("/waitlist").catch(() => []),
        apiGet<Array<{ id: number; name: string }>>("/classes").catch(() => []),
      ])
      setRequests(Array.isArray(req) ? req : [])
      setWaitlist(Array.isArray(wl) ? wl : [])
      setClasses(Array.isArray(cls) ? cls : [])
    } catch {
      /* ignore */
    }
  }, [demo])

  useEffect(() => {
    load()
  }, [load])

  async function patchRequest(id: number, status: string) {
    try {
      await apiPatch(`/enrollment-requests/${id}`, { status })
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed")
    }
  }

  async function addWaitlist() {
    if (!wlForm.class_id) return
    try {
      await apiPost("/waitlist", {
        class_id: Number(wlForm.class_id),
        student_name: wlForm.student_name,
        contact_email: wlForm.contact_email,
      })
      setWlForm({ class_id: "", student_name: "", contact_email: "" })
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed — run db:migrate:centre-crm?")
    }
  }

  return (
    <AdminPageFrame>
      <AdminPageHeader
        title={zh ? "預約" : "Bookings"}
        description={zh ? "報名請求、候補名單" : "Enrollment requests and waitlist"}
        Icon={CalendarClock}
      />

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["requests", zh ? "報名請求" : "Requests"],
            ["waitlist", zh ? "候補" : "Waitlist"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-md text-sm font-medium border ${
              tab === k ? "bg-classz-100 border-classz-400" : "bg-white border-classz-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "requests" ? (
        <AdminCard>
          <AdminTableShell>
            <AdminTable>
              <thead className="bg-classz-100">
                <tr>
                  <th className="px-3 py-2 text-left">ID</th>
                  <th className="px-3 py-2 text-left">{zh ? "學員" : "Student"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "課堂" : "Class"}</th>
                  <th className="px-3 py-2 text-left">{zh ? "狀態" : "Status"}</th>
                  <th className="px-3 py-2 text-right">{zh ? "操作" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-classz-100">
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td className="px-3 py-2">{r.id}</td>
                    <td className="px-3 py-2">{r.student_name}</td>
                    <td className="px-3 py-2">{r.class_name}</td>
                    <td className="px-3 py-2">{r.status}</td>
                    <td className="px-3 py-2 text-right space-x-1">
                      {r.status === "pending" ? (
                        <>
                          <AdminGhostButton type="button" className="text-sm py-1 px-2" onClick={() => patchRequest(r.id, "fulfilled")}>
                            {zh ? "核准" : "Approve"}
                          </AdminGhostButton>
                          <AdminGhostButton type="button" className="text-sm py-1 px-2 text-red-600" onClick={() => patchRequest(r.id, "rejected")}>
                            {zh ? "拒絕" : "Reject"}
                          </AdminGhostButton>
                        </>
                      ) : null}
                    </td>
                  </tr>
                ))}
                {!requests.length ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-classz-500">
                      {demo ? (zh ? "請用中心帳號登入" : "Sign in") : zh ? "無請求" : "No requests"}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </AdminTable>
          </AdminTableShell>
        </AdminCard>
      ) : null}

      {tab === "waitlist" ? (
        <AdminCard>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-4">
            <AdminSelect value={wlForm.class_id} onChange={(e) => setWlForm({ ...wlForm, class_id: e.target.value })}>
              <option value="">{zh ? "課堂" : "Class"}</option>
              {classes.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </AdminSelect>
            <AdminInput placeholder={zh ? "姓名" : "Name"} value={wlForm.student_name} onChange={(e) => setWlForm({ ...wlForm, student_name: e.target.value })} />
            <AdminInput placeholder="Email" value={wlForm.contact_email} onChange={(e) => setWlForm({ ...wlForm, contact_email: e.target.value })} />
            <AdminPrimaryButton type="button" onClick={addWaitlist}>
              {zh ? "加入候補" : "Add"}
            </AdminPrimaryButton>
          </div>
          <ul className="divide-y divide-classz-100 text-sm">
            {waitlist.map((w) => (
              <li key={w.id} className="py-2 flex justify-between">
                <span>
                  #{w.id} · {w.student_name || w.contact_email} · class {w.class_id}
                </span>
                <span className="text-classz-500">{w.status}</span>
              </li>
            ))}
            {!waitlist.length ? <li className="py-6 text-center text-classz-500">{zh ? "候補名單為空" : "Waitlist empty"}</li> : null}
          </ul>
        </AdminCard>
      ) : null}
    </AdminPageFrame>
  )
}
