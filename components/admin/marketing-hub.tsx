"use client"

import { useCallback, useEffect, useState } from "react"
import { Megaphone } from "lucide-react"
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

type Campaign = {
  id: number
  name: string
  channel: string
  status: string
  subject?: string
  body?: string
}

type Coupon = { id: number; code?: string; discount_value?: number }

export function MarketingHub() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const demo = isDemoSession()
  const [tab, setTab] = useState<"campaigns" | "coupons" | "ai" | "broadcast">("campaigns")
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [form, setForm] = useState({ name: "", channel: "email", subject: "", body: "" })
  const [aiTopic, setAiTopic] = useState("summer trial class")
  const [aiOut, setAiOut] = useState<{ subject?: string; body?: string; disclaimer?: string } | null>(null)
  const [broadcast, setBroadcast] = useState({ channel: "email", subject: "", message: "", consent: false })

  const load = useCallback(async () => {
    if (demo) return
    try {
      const [c, cp] = await Promise.all([
        apiGet<Campaign[]>("/marketing/campaigns").catch(() => []),
        apiGet<Coupon[]>("/coupons").catch(() => []),
      ])
      setCampaigns(Array.isArray(c) ? c : [])
      setCoupons(Array.isArray(cp) ? cp : [])
    } catch {
      /* ignore */
    }
  }, [demo])

  useEffect(() => {
    load()
  }, [load])

  async function createCampaign() {
    if (!form.name.trim() || demo) return
    try {
      await apiPost("/marketing/campaigns", form)
      setForm({ name: "", channel: "email", subject: "", body: "" })
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed — run db:migrate:centre-crm?")
    }
  }

  async function generateAi() {
    if (demo) return
    try {
      const data = await apiPost<{ subject: string; body: string; disclaimer: string }>("/marketing/ai-generate", {
        topic: aiTopic,
        tone: "friendly",
      })
      setAiOut(data)
      setForm((f) => ({ ...f, subject: data.subject || f.subject, body: data.body || f.body }))
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed")
    }
  }

  async function sendBroadcast() {
    if (demo) return
    try {
      if (broadcast.channel === "whatsapp") {
        await apiPost("/marketing/whatsapp", {
          message: broadcast.message,
          consent: broadcast.consent,
          recipients: [],
        })
      } else {
        await apiPost("/marketing/email", {
          subject: broadcast.subject,
          body: broadcast.message,
          consent: broadcast.consent,
          recipients: [],
        })
      }
      alert(zh ? "已排程（需同意 PDPO）" : "Queued (consent required)")
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed")
    }
  }

  return (
    <AdminPageFrame>
      <AdminPageHeader
        title={zh ? "行銷" : "Marketing"}
        description={zh ? "Campaign · Coupon · AI · WhatsApp / Email（需同意）" : "Campaign · Coupon · AI · Broadcast (consent required)"}
        Icon={Megaphone}
      />

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["campaigns", zh ? "活動" : "Campaigns"],
            ["coupons", zh ? "優惠券" : "Coupons"],
            ["ai", zh ? "AI 文案" : "AI Content"],
            ["broadcast", zh ? "群發" : "Broadcast"],
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

      {tab === "campaigns" ? (
        <AdminCard>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <AdminLabel>{zh ? "名稱" : "Name"}</AdminLabel>
              <AdminInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <AdminLabel>{zh ? "渠道" : "Channel"}</AdminLabel>
              <AdminSelect value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="promo">Promotion</option>
                <option value="referral">Referral</option>
              </AdminSelect>
            </div>
            <div className="sm:col-span-2">
              <AdminLabel>Subject</AdminLabel>
              <AdminInput value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <AdminLabel>Body</AdminLabel>
              <AdminTextarea className="min-h-[100px]" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            </div>
            <AdminPrimaryButton type="button" onClick={createCampaign}>
              {zh ? "建立活動" : "Create campaign"}
            </AdminPrimaryButton>
          </div>
          <ul className="text-sm divide-y divide-classz-100">
            {campaigns.map((c) => (
              <li key={c.id} className="py-2 flex justify-between gap-2">
                <span>
                  <strong>{c.name}</strong> · {c.channel} · {c.status}
                </span>
                {c.status === "draft" ? (
                  <AdminGhostButton
                    type="button"
                    className="text-xs py-1 px-2"
                    onClick={() => apiPatch(`/marketing/campaigns/${c.id}`, { status: "scheduled" }).then(load)}
                  >
                    Schedule
                  </AdminGhostButton>
                ) : null}
              </li>
            ))}
            {!campaigns.length ? <li className="py-6 text-center text-classz-500">{zh ? "尚無活動" : "No campaigns"}</li> : null}
          </ul>
        </AdminCard>
      ) : null}

      {tab === "coupons" ? (
        <AdminCard>
          <ul className="text-sm divide-y divide-classz-100">
            {coupons.map((c) => (
              <li key={c.id} className="py-2 flex justify-between">
                <code>{c.code}</code>
                <span>{c.discount_value}</span>
              </li>
            ))}
            {!coupons.length ? <li className="py-6 text-center text-classz-500">{zh ? "無優惠券" : "No coupons"}</li> : null}
          </ul>
        </AdminCard>
      ) : null}

      {tab === "ai" ? (
        <AdminCard>
          <div className="flex gap-2 mb-4">
            <AdminInput value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} placeholder="Topic" />
            <AdminPrimaryButton type="button" onClick={generateAi}>
              {zh ? "產生文案" : "Generate"}
            </AdminPrimaryButton>
          </div>
          {aiOut ? (
            <div className="space-y-2 text-sm">
              <p className="font-semibold">{aiOut.subject}</p>
              <pre className="whitespace-pre-wrap bg-classz-50 p-3 rounded-md">{aiOut.body}</pre>
              <p className="text-xs text-classz-400">{aiOut.disclaimer}</p>
            </div>
          ) : null}
        </AdminCard>
      ) : null}

      {tab === "broadcast" ? (
        <AdminCard>
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-4">
            {zh
              ? "PDPO：發送前必須勾選同意（opt-in）。WhatsApp / Email 目前為排隊 stub，需配置 Twilio / SMTP。"
              : "PDPO: consent required. WhatsApp/Email are queued stubs until Twilio/SMTP is configured."}
          </p>
          <div className="space-y-3 max-w-xl">
            <AdminSelect value={broadcast.channel} onChange={(e) => setBroadcast({ ...broadcast, channel: e.target.value })}>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
            </AdminSelect>
            {broadcast.channel === "email" ? (
              <AdminInput
                placeholder="Subject"
                value={broadcast.subject}
                onChange={(e) => setBroadcast({ ...broadcast, subject: e.target.value })}
              />
            ) : null}
            <AdminTextarea
              className="min-h-[120px]"
              value={broadcast.message}
              onChange={(e) => setBroadcast({ ...broadcast, message: e.target.value })}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={broadcast.consent}
                onChange={(e) => setBroadcast({ ...broadcast, consent: e.target.checked })}
              />
              {zh ? "我確認收件人已 opt-in（PDPO）" : "I confirm recipients opted in (PDPO)"}
            </label>
            <AdminPrimaryButton type="button" onClick={sendBroadcast} disabled={!broadcast.consent}>
              {zh ? "排程發送" : "Queue broadcast"}
            </AdminPrimaryButton>
          </div>
        </AdminCard>
      ) : null}
    </AdminPageFrame>
  )
}
