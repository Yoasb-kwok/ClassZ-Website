"use client"

import { useState } from "react"
import { useLanguage } from "@/components/language-provider"

const CLASS_TYPES = [
  { id: "academic", key: "infoPages.centres.clsAcademic" },
  { id: "language", key: "infoPages.centres.clsLanguage" },
  { id: "art", key: "infoPages.centres.clsArt" },
  { id: "music", key: "infoPages.centres.clsMusic" },
  { id: "sports", key: "infoPages.centres.clsSports" },
  { id: "dance", key: "infoPages.centres.clsDance" },
  { id: "others", key: "infoPages.centres.clsOthers" },
] as const

const ROLES = [
  { id: "owner", key: "infoPages.centres.roleOwner" },
  { id: "manager", key: "infoPages.centres.roleManager" },
  { id: "coach", key: "infoPages.centres.roleCoach" },
] as const

const SIZES = [
  { id: "s", key: "infoPages.centres.size1" },
  { id: "m", key: "infoPages.centres.size2" },
  { id: "l", key: "infoPages.centres.size3" },
] as const

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  centreName: "",
  address: "",
  role: "",
  size: "",
  message: "",
  services: [] as string[],
}

export function CentreRequestForm() {
  const { t } = useLanguage()
  const [form, setForm] = useState(emptyForm)
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const toggleService = (id: string, checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      services: checked ? [...prev.services, id] : prev.services.filter((s) => s !== id),
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
    const classLabels = form.services.map((id) => t(CLASS_TYPES.find((s) => s.id === id)?.key || id))
    const sizeLabel = t(SIZES.find((s) => s.id === form.size)?.key || form.size)
    const roleLabel = t(ROLES.find((s) => s.id === form.role)?.key || form.role)
    const message = [
      `Centre: ${form.centreName}`,
      `Phone: ${form.phone}`,
      form.address ? `Address: ${form.address}` : "",
      roleLabel ? `Role: ${roleLabel}` : "",
      sizeLabel ? `Students: ${sizeLabel}` : "",
      classLabels.length ? `Classes: ${classLabels.join(", ")}` : "",
      form.message ? `Notes: ${form.message}` : "",
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
      setForm(emptyForm)
    } catch {
      setStatus({ type: "error", message: t("infoPages.centres.error") })
    } finally {
      setSubmitting(false)
    }
  }

  const field =
    "h-11 w-full rounded-xl border border-[#ebebeb] bg-white px-4 text-sm text-ink placeholder:text-shade-400 focus:border-[#0abab5] focus:outline-none focus:ring-2 focus:ring-[#0abab5]/20"

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-5 rounded-3xl border border-[#ebebeb] bg-white p-6 shadow-[0_16px_50px_rgba(0,0,0,0.06)] md:p-8">
      <div className="text-center">
        <h3 className="text-2xl font-semibold tracking-[-0.03em] text-ink md:text-3xl">
          {t("infoPages.centres.formTitle")}
        </h3>
        <p className="mt-2 text-sm text-shade-500">{t("infoPages.centres.formBody")}</p>
      </div>

      {status ? (
        <p
          className={`rounded-xl px-4 py-3 text-sm ${
            status.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {status.message}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-ink">
          {t("infoPages.centres.name")}
          <input className={`${field} mt-1.5`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label className="block text-sm font-medium text-ink">
          {t("infoPages.centres.email")}
          <input type="email" className={`${field} mt-1.5`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </label>
        <label className="block text-sm font-medium text-ink">
          {t("infoPages.centres.phone")}
          <input className={`${field} mt-1.5`} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        </label>
        <label className="block text-sm font-medium text-ink">
          {t("infoPages.centres.centreName")}
          <input className={`${field} mt-1.5`} value={form.centreName} onChange={(e) => setForm({ ...form, centreName: e.target.value })} required />
        </label>
        <label className="block text-sm font-medium text-ink sm:col-span-2">
          {t("infoPages.centres.address")}
          <input className={`${field} mt-1.5`} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </label>
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-ink">{t("infoPages.centres.classTypesTitle")}</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {CLASS_TYPES.map((svc) => (
            <label key={svc.id} className="flex items-center gap-2 rounded-xl border border-[#ebebeb] px-3 py-2.5 text-sm text-ink">
              <input
                type="checkbox"
                className="accent-[#0abab5]"
                checked={form.services.includes(svc.id)}
                onChange={(e) => toggleService(svc.id, e.target.checked)}
              />
              {t(svc.key)}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-ink">{t("infoPages.centres.roleTitle")}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {ROLES.map((role) => (
            <label
              key={role.id}
              className={`cursor-pointer rounded-full border px-4 py-2 text-sm ${
                form.role === role.id ? "border-[#0abab5] bg-[#d7f4f3] text-ink" : "border-[#ebebeb] text-shade-500"
              }`}
            >
              <input
                type="radio"
                name="centre-role"
                className="sr-only"
                checked={form.role === role.id}
                onChange={() => setForm({ ...form, role: role.id })}
              />
              {t(role.key)}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-ink">{t("infoPages.centres.sizeTitle")}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <label
              key={size.id}
              className={`cursor-pointer rounded-full border px-4 py-2 text-sm ${
                form.size === size.id ? "border-[#0abab5] bg-[#d7f4f3] text-ink" : "border-[#ebebeb] text-shade-500"
              }`}
            >
              <input
                type="radio"
                name="centre-size"
                className="sr-only"
                checked={form.size === size.id}
                onChange={() => setForm({ ...form, size: size.id })}
              />
              {t(size.key)}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block text-sm font-medium text-ink">
        {t("infoPages.centres.message")}
        <textarea
          className="mt-1.5 min-h-[120px] w-full rounded-xl border border-[#ebebeb] bg-white px-4 py-3 text-sm text-ink focus:border-[#0abab5] focus:outline-none focus:ring-2 focus:ring-[#0abab5]/20"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="h-12 w-full rounded-full bg-[#0abab5] text-sm font-semibold text-white transition hover:bg-[#089591] disabled:opacity-60"
      >
        {submitting ? t("infoPages.centres.submitting") : t("infoPages.centres.submit")}
      </button>
    </form>
  )
}
