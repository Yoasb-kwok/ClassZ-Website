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

/** Roles from stylerecord: magenta / orange / teal / slate / coral */
const STAGE_STYLE: Record<
  (typeof STAGES)[number],
  { bar: string; tint: string; chip: string; label: string }
> = {
  new: {
    bar: "bg-brand-magenta",
    tint: "bg-[color-mix(in_srgb,var(--brand-magenta)_8%,white)] border-[color-mix(in_srgb,var(--brand-magenta)_28%,white)]",
    chip: "text-brand-magenta",
    label: "text-brand-magenta",
  },
  contacted: {
    bar: "bg-brand-orange",
    tint: "bg-[color-mix(in_srgb,var(--brand-orange)_8%,white)] border-[color-mix(in_srgb,var(--brand-orange)_28%,white)]",
    chip: "text-brand-orange",
    label: "text-brand-orange",
  },
  qualified: {
    bar: "bg-brand-teal",
    tint: "bg-[color-mix(in_srgb,var(--brand-teal)_8%,white)] border-[color-mix(in_srgb,var(--brand-teal)_28%,white)]",
    chip: "text-brand-teal",
    label: "text-brand-teal",
  },
  trial: {
    bar: "bg-[#525252]",
    tint: "bg-[#F5F5F5] border-[#E5E5E5]",
    chip: "text-[#525252]",
    label: "text-[#525252]",
  },
  won: {
    bar: "bg-brand-teal",
    tint: "bg-[color-mix(in_srgb,var(--brand-teal)_12%,white)] border-[color-mix(in_srgb,var(--brand-teal)_35%,white)]",
    chip: "text-brand-teal",
    label: "text-brand-teal",
  },
  lost: {
    bar: "bg-brand-coral",
    tint: "bg-[color-mix(in_srgb,var(--brand-coral)_8%,white)] border-[color-mix(in_srgb,var(--brand-coral)_28%,white)]",
    chip: "text-brand-coral",
    label: "text-brand-coral",
  },
}

type Lead = {
  id: number
  full_name: string
  email?: string
  phone?: string
  stage: string
  source?: string
}

type FollowUp = { id: number; due_at?: string; note?: string; status: string }

function stageLabel(stage: string, zh: boolean) {
  const map: Record<string, [string, string]> = {
    new: ["新 Lead", "New"],
    contacted: ["已聯絡", "Contacted"],
    qualified: ["合格", "Qualified"],
    trial: ["試堂", "Trial"],
    won: ["成交", "Won"],
    lost: ["流失", "Lost"],
  }
  const pair = map[stage]
  if (!pair) return stage
  return zh ? pair[0] : pair[1]
}

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
      <div className="crm-theme space-y-3">
        <AdminPageHeader
          title="CRM"
          description={zh ? "Lead pipeline · Follow-up · Funnel" : "Lead pipeline · Follow-up · Funnel"}
          Icon={Contact}
        />

        <div className="flex flex-wrap gap-2 text-[11px] text-crm-slate">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-crm-magenta/25 bg-[color-mix(in_srgb,var(--crm-magenta)_8%,white)] px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-crm-magenta" />
            {zh ? "新" : "New"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-crm-orange/25 bg-[color-mix(in_srgb,var(--crm-orange)_8%,white)] px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-crm-orange" />
            {zh ? "跟進中" : "In motion"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-crm-teal/25 bg-[color-mix(in_srgb,var(--crm-teal)_8%,white)] px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-crm-teal" />
            {zh ? "推進 / 成交" : "Qualified / Won"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-crm-slate/25 bg-[color-mix(in_srgb,var(--crm-slate)_7%,white)] px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-crm-slate" />
            {zh ? "試堂" : "Trial"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-crm-coral/25 bg-[color-mix(in_srgb,var(--crm-coral)_8%,white)] px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-crm-coral" />
            {zh ? "流失" : "Lost"}
          </span>
        </div>

        <AdminCard>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            <AdminInput
              placeholder={zh ? "姓名" : "Name"}
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
            <AdminInput
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <AdminInput
              placeholder={zh ? "電話" : "Phone"}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <AdminInput
              placeholder={zh ? "來源" : "Source"}
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
            />
            <AdminPrimaryButton type="button" onClick={createLead}>
              {zh ? "新增 Lead" : "Add lead"}
            </AdminPrimaryButton>
          </div>
        </AdminCard>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 overflow-x-auto">
          {byStage.map(({ stage, items }) => {
            const style = STAGE_STYLE[stage]
            return (
              <div key={stage} className={`rounded-lg border p-2 min-h-[12rem] ${style.tint}`}>
                <div className={`mb-2 h-0.5 w-full rounded-full ${style.bar}`} />
                <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${style.label}`}>
                  {stageLabel(stage, zh)} ({items.length})
                </p>
                <ul className="space-y-2">
                  {items.map((l) => (
                    <li key={l.id}>
                      <button
                        type="button"
                        onClick={() => openLead(l)}
                        className={`w-full text-left text-sm px-2 py-2 rounded-md border bg-white transition-shadow ${
                          selected?.id === l.id
                            ? "border-crm-teal shadow-[0_0_0_1px_var(--crm-teal)]"
                            : "border-white/80 hover:border-crm-slate/20"
                        }`}
                      >
                        <p className="font-medium truncate text-crm-slate">{l.full_name}</p>
                        <p className="text-xs text-crm-slate/55 truncate">{l.email || l.phone}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {selected ? (
          <AdminCard>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="font-semibold text-crm-slate">{selected.full_name}</h3>
              <span
                className={`text-[11px] font-semibold uppercase tracking-wide ${
                  STAGE_STYLE[(selected.stage as (typeof STAGES)[number]) || "new"]?.chip || "text-crm-slate"
                }`}
              >
                {stageLabel(selected.stage, zh)}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <AdminLabel>{zh ? "階段" : "Stage"}</AdminLabel>
              <AdminSelect value={selected.stage} onChange={(e) => moveStage(e.target.value)}>
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {stageLabel(s, zh)}
                  </option>
                ))}
              </AdminSelect>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
              <AdminInput type="datetime-local" value={fuDue} onChange={(e) => setFuDue(e.target.value)} />
              <AdminTextarea
                className="min-h-[2.5rem] sm:col-span-1"
                value={fuNote}
                onChange={(e) => setFuNote(e.target.value)}
                placeholder={zh ? "跟進備註" : "Follow-up note"}
              />
              <AdminGhostButton type="button" onClick={addFollowUp}>
                {zh ? "加入跟進" : "Add follow-up"}
              </AdminGhostButton>
            </div>
            <ul className="text-sm space-y-2">
              {followUps.map((f) => (
                <li key={f.id} className="border border-crm-slate/15 rounded px-3 py-2">
                  <p className="text-crm-slate">{f.note}</p>
                  <p className="text-xs text-crm-orange/90">
                    {f.due_at} · {f.status}
                  </p>
                </li>
              ))}
            </ul>
          </AdminCard>
        ) : null}

        <AdminCard>
          <h3 className="font-semibold text-crm-slate mb-2">{zh ? "銷售漏斗" : "Sales funnel"}</h3>
          <pre className="text-xs bg-[color-mix(in_srgb,var(--crm-slate)_5%,white)] text-crm-slate p-3 rounded-md overflow-auto max-h-48 border border-crm-slate/10">
            {JSON.stringify(funnel, null, 2)}
          </pre>
        </AdminCard>
      </div>
    </AdminPageFrame>
  )
}
