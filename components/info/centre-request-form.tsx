"use client"

import { useState } from "react"
import { useLanguage } from "@/components/language-provider"

const STATUSES = [
  { id: "company", key: "infoPages.centres.statusCompany" },
  { id: "individual", key: "infoPages.centres.statusIndividual" },
] as const

const INTERESTS = [
  { id: "lms", key: "infoPages.centres.interestLms" },
  { id: "recruit", key: "infoPages.centres.interestRecruit" },
  { id: "workshop", key: "infoPages.centres.interestWorkshop" },
  { id: "admin", key: "infoPages.centres.interestAdmin" },
  { id: "feedback", key: "infoPages.centres.interestFeedback" },
  { id: "promo", key: "infoPages.centres.interestPromo" },
  { id: "engage", key: "infoPages.centres.interestEngage" },
] as const

const HEARD = [
  { id: "social", key: "infoPages.centres.hearSocial" },
  { id: "news", key: "infoPages.centres.hearNews" },
  { id: "search", key: "infoPages.centres.hearSearch" },
  { id: "event", key: "infoPages.centres.hearEvent" },
  { id: "ads", key: "infoPages.centres.hearAds" },
  { id: "friends", key: "infoPages.centres.hearFriends" },
  { id: "blogs", key: "infoPages.centres.hearBlogs" },
] as const

const empty = {
  name: "",
  centreName: "",
  status: "",
  email: "",
  phone: "",
  webpage: "",
  interests: [] as string[],
  heard: "",
}

export function CentreRequestForm() {
  const { t } = useLanguage()
  const [form, setForm] = useState(empty)
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const toggleInterest = (id: string, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      interests: checked ? [...prev.interests, id] : prev.interests.filter((item) => item !== id),
    }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone || !form.centreName) {
      setStatus({ type: "error", message: t("infoPages.centres.required") })
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setStatus({ type: "error", message: t("infoPages.centres.invalidEmail") })
      return
    }

    setSubmitting(true)
    setStatus(null)
    const interestLabels = form.interests.map((id) => t(INTERESTS.find((item) => item.id === id)?.key || id))
    const statusLabel = t(STATUSES.find((item) => item.id === form.status)?.key || form.status)
    const heardLabel = t(HEARD.find((item) => item.id === form.heard)?.key || form.heard)
    const message = [
      `Centre: ${form.centreName}`,
      statusLabel ? `Status: ${statusLabel}` : "",
      `Phone: ${form.phone}`,
      form.webpage ? `Webpage: ${form.webpage}` : "",
      interestLabels.length ? `Interest: ${interestLabels.join(", ")}` : "",
      heardLabel ? `Heard about us: ${heardLabel}` : "",
    ]
      .filter(Boolean)
      .join("\n")

    try {
      const response = await fetch("/api/parent/contact-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          name: form.name,
          message,
          subject: `Centre request — ${form.centreName}`,
          category: "partnership",
        }),
      })
      if (!response.ok) throw new Error("submit failed")
      setStatus({ type: "success", message: t("infoPages.centres.success") })
      setForm(empty)
    } catch {
      setStatus({ type: "error", message: t("infoPages.centres.error") })
    } finally {
      setSubmitting(false)
    }
  }

  const field =
    "h-12 w-full rounded-2xl border border-[#e6e6e6] bg-white px-4 text-[16px] text-[#18191b] placeholder:text-[#9a9a9a] focus:border-[#0abab5] focus:outline-none"

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5">
      {status ? (
        <p
          className={`rounded-2xl px-4 py-3 text-sm ${
            status.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
          }`}
        >
          {status.message}
        </p>
      ) : null}

      <label className="block">
        <span className="mb-2 block text-[16px] leading-6">{t("infoPages.centres.name")}</span>
        <input className={field} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </label>
      <label className="block">
        <span className="mb-2 block text-[16px] leading-6">{t("infoPages.centres.centreName")}</span>
        <input
          className={field}
          value={form.centreName}
          onChange={(e) => setForm({ ...form, centreName: e.target.value })}
        />
      </label>

      <fieldset>
        <legend className="mb-3 text-[14px] leading-5">{t("infoPages.centres.statusTitle")}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {STATUSES.map((item) => (
            <label key={item.id} className="flex items-start gap-3 text-[14px] leading-5">
              <input
                type="radio"
                name="centre-status"
                className="mt-1 accent-[#18191b]"
                checked={form.status === item.id}
                onChange={() => setForm({ ...form, status: item.id })}
              />
              {t(item.key)}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className="mb-2 block text-[16px] leading-6">{t("infoPages.centres.email")}</span>
        <input
          type="email"
          className={field}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-[16px] leading-6">{t("infoPages.centres.phone")}</span>
        <input className={field} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </label>
      <label className="block">
        <span className="mb-2 block text-[16px] leading-6">{t("infoPages.centres.webpage")}</span>
        <input
          className={field}
          value={form.webpage}
          onChange={(e) => setForm({ ...form, webpage: e.target.value })}
        />
      </label>

      <fieldset>
        <legend className="mb-3 text-[14px] leading-5">{t("infoPages.centres.interestTitle")}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {INTERESTS.map((item) => (
            <label key={item.id} className="flex items-start gap-3 text-[14px] leading-5">
              <input
                type="checkbox"
                className="mt-1 accent-[#18191b]"
                checked={form.interests.includes(item.id)}
                onChange={(e) => toggleInterest(item.id, e.target.checked)}
              />
              {t(item.key)}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-[14px] leading-5">{t("infoPages.centres.hearTitle")}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {HEARD.map((item) => (
            <label key={item.id} className="flex items-start gap-3 text-[14px] leading-5">
              <input
                type="radio"
                name="heard"
                className="mt-1 accent-[#18191b]"
                checked={form.heard === item.id}
                onChange={() => setForm({ ...form, heard: item.id })}
              />
              {t(item.key)}
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex rounded-full bg-[#18191b] px-8 py-3 text-[18px] leading-7 font-medium text-white transition hover:bg-[#2a2b2e] disabled:opacity-60"
      >
        {submitting ? t("infoPages.centres.submitting") : t("infoPages.centres.submit")}
      </button>
    </form>
  )
}
