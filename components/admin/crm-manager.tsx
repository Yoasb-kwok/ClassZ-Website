"use client"

import { useCallback, useEffect, useState } from "react"
import { Contact } from "lucide-react"
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
  AdminTextarea,
} from "@/components/classz-admin-ui"

const STAGES = ["new", "contacted", "qualified", "trial", "won", "lost"] as const

type Lead = {
  id: number
  full_name: string
  email?: string
  phone?: string
  stage: string
  source?: string
}

type FollowUp = { id: number; due_at?: string; note?: string; status: string }

export function CrmManager() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const demo = isDemoSession()
  const [leads, setLeads] = useState<Lead[]>([])
  const [selected, setSelected] = useState<Lead | null>(null)
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [funnel, setFunnel] = useState<unknown>(null)
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", source: "" })
  const [fuNote, setFuNote] = useState("")
  const [fuDue, setFuDue] = useState("")

  const load = useCallback(async () => {
    if (demo) return
    try {
      const [l, f] = await Promise.all([
        apiGet<Lead[]>("/leads").catch(() => []),
        apiGet("/conversion-funnel").catch(() => null),
      ])
      setLeads(Array.isArray(l) ? l : [])
      setFunnel(f)
    } catch {
      setLeads([])
    }
  }, [demo])

  useEffect(() => {
    load()
  }, [load])

  async function createLead() {
    if (!form.full_name.trim() || demo) return
    try {
      await apiPost("/leads", form)
      setForm({ full_name: "", email: "", phone: "", source: "" })
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed — run db:migrate:centre-crm?")
    }
  }

  async function openLead(lead: Lead) {
    setSelected(lead)
    if (demo) return
    try {
      const fus = await apiGet<FollowUp[]>(`/leads/${lead.id}/follow-ups`)
      setFollowUps(Array.isArray(fus) ? fus : [])
    } catch {
      setFollowUps([])
    }
  }

  async function moveStage(stage: string) {
    if (!selected || demo) return
    try {
      await apiPatch(`/leads/${selected.id}`, { stage })
      setSelected({ ...selected, stage })
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed")
    }
  }

  async function addFollowUp() {
    if (!selected || demo) return
    try {
      await apiPost(`/leads/${selected.id}/follow-ups`, { note: fuNote, due_at: fuDue || null })
      setFuNote("")
      setFuDue("")
      openLead(selected)
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed")
    }
  }

  const byStage = STAGES.map((stage) => ({
    stage,
    items: leads.filter((l) => l.stage === stage),
  }))

  return (
    <AdminPageFrame>
      <AdminPageHeader title="CRM" description={zh ? "Lead pipeline · Follow-up · Funnel" : "Lead pipeline · Follow-up · Funnel"} Icon={Contact} />

      <AdminCard>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          <AdminInput placeholder={zh ? "姓名" : "Name"} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          <AdminInput placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <AdminInput placeholder={zh ? "電話" : "Phone"} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <AdminInput placeholder={zh ? "來源" : "Source"} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
          <AdminPrimaryButton type="button" onClick={createLead}>
            {zh ? "新增 Lead" : "Add lead"}
          </AdminPrimaryButton>
        </div>
      </AdminCard>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 overflow-x-auto">
        {byStage.map(({ stage, items }) => (
          <div key={stage} className="bg-classz-50 border border-classz-200 rounded-lg p-2 min-h-[12rem]">
            <p className="text-xs font-semibold uppercase text-classz-500 mb-2">
              {stage} ({items.length})
            </p>
            <ul className="space-y-2">
              {items.map((l) => (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => openLead(l)}
                    className={`w-full text-left text-sm px-2 py-2 rounded-md border bg-white ${
                      selected?.id === l.id ? "border-classz-400" : "border-classz-100"
                    }`}
                  >
                    <p className="font-medium truncate">{l.full_name}</p>
                    <p className="text-xs text-classz-400 truncate">{l.email || l.phone}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {selected ? (
        <AdminCard>
          <h3 className="font-semibold text-classz-800 mb-3">{selected.full_name}</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            <AdminLabel>{zh ? "階段" : "Stage"}</AdminLabel>
            <AdminSelect value={selected.stage} onChange={(e) => moveStage(e.target.value)}>
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </AdminSelect>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
            <AdminInput type="datetime-local" value={fuDue} onChange={(e) => setFuDue(e.target.value)} />
            <AdminTextarea className="min-h-[2.5rem] sm:col-span-1" value={fuNote} onChange={(e) => setFuNote(e.target.value)} placeholder={zh ? "跟進備註" : "Follow-up note"} />
            <AdminGhostButton type="button" onClick={addFollowUp}>
              {zh ? "加入跟進" : "Add follow-up"}
            </AdminGhostButton>
          </div>
          <ul className="text-sm space-y-2">
            {followUps.map((f) => (
              <li key={f.id} className="border border-classz-100 rounded px-3 py-2">
                <p>{f.note}</p>
                <p className="text-xs text-classz-400">{f.due_at} · {f.status}</p>
              </li>
            ))}
          </ul>
        </AdminCard>
      ) : null}

      <AdminCard>
        <h3 className="font-semibold text-classz-700 mb-2">{zh ? "銷售漏斗" : "Sales funnel"}</h3>
        <pre className="text-xs bg-classz-50 p-3 rounded-md overflow-auto max-h-48">{JSON.stringify(funnel, null, 2)}</pre>
      </AdminCard>
    </AdminPageFrame>
  )
}
