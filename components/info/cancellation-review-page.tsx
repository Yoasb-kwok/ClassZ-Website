"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/components/language-provider"
import { GREEN_FONT } from "@/components/info/green-arrow"

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Public cancellation request. Child and lesson are typed, not loaded
 * from an account. A chosen file is not uploaded; only its name is sent
 * with the existing contact-form proxy.
 */
export function CancellationReviewPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [reference, setReference] = useState("")
  const [email, setEmail] = useState("")
  const [child, setChild] = useState("")
  const [lesson, setLesson] = useState("")
  const [reason, setReason] = useState("")
  const [outcome, setOutcome] = useState("")
  const [happened, setHappened] = useState("")
  const [fileName, setFileName] = useState("")
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reference.trim() || !email.trim() || !happened.trim() || !consent) {
      setError(t("greenPages.cancel.required"))
      return
    }
    if (!EMAIL.test(email.trim())) {
      setError(t("greenPages.cancel.invalidEmail"))
      return
    }
    setSending(true)
    setError("")
    const message = [
      `Booking reference: ${reference.trim()}`,
      child.trim() ? `Child: ${child.trim()}` : "",
      lesson.trim() ? `Affected lesson: ${lesson.trim()}` : "",
      reason.trim() ? `Reason: ${reason.trim()}` : "",
      outcome.trim() ? `Preferred outcome: ${outcome.trim()}` : "",
      `What happened: ${happened.trim()}`,
      fileName ? `Document name (file not uploaded): ${fileName}` : "",
      "Consent: parent confirmed ClassZ CS may discuss this case with the centre.",
    ]
      .filter(Boolean)
      .join("\n")
    try {
      const response = await fetch("/api/parent/contact-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: child.trim() || email.trim(),
          email: email.trim(),
          subject: `Cancellation review — ${reference.trim()}`,
          category: "general_inquiry",
          message,
        }),
        signal: AbortSignal.timeout(8000),
      })
      if (!response.ok) throw new Error("submit failed")
      router.push("/cancellation-review/submitted")
    } catch {
      setError(t("greenPages.cancel.error"))
      setSending(false)
    }
  }

  const field =
    "h-12 w-full rounded-[14px] border border-[#8fd8d4] bg-white px-4 text-[15px] text-[#141417] placeholder:text-[#8c9196] focus:border-[#0abab5] focus:outline-none"

  return (
    <main className="min-h-screen bg-white text-[#141417]" style={{ fontFamily: GREEN_FONT }}>
      <Navbar />
      <section className="relative overflow-hidden bg-[#f7f9f9] px-4 pt-16 pb-20 md:px-8 md:pt-20">
        <div className="pointer-events-none absolute bottom-0 left-[-12%] h-[320px] w-[320px] rounded-full bg-[#b7f6f2] opacity-70 blur-[90px]" />
        <div className="pointer-events-none absolute right-[-8%] bottom-[10%] h-[280px] w-[280px] rounded-full bg-[#fff4b0] opacity-70 blur-[90px]" />
        <div className="relative mx-auto flex max-w-[1120px] flex-col gap-6">
          <p className="text-[13px] font-semibold tracking-[0.04em] text-[#0abab5]">
            {t("greenPages.cancel.eyebrow")}
          </p>
          <h1 className="max-w-[920px] text-[40px] leading-[1.1] font-medium md:text-[64px] md:leading-[68px]">
            {t("greenPages.cancel.hero")}
          </h1>
          <p className="max-w-[820px] text-[18px] leading-7 text-[#61666b]">{t("greenPages.cancel.intro")}</p>
          <div className="rounded-[20px] bg-[#e8fcfa] p-6 text-[15px] leading-6 text-[#61666b]">
            <p className="text-[17px] font-semibold text-[#141417]">{t("greenPages.cancel.how")}</p>
            <p className="mt-2">{t("greenPages.cancel.step1")}</p>
            <p>{t("greenPages.cancel.step2")}</p>
            <p>{t("greenPages.cancel.step3")}</p>
            <p>{t("greenPages.cancel.step4")}</p>
          </div>

          <form
            onSubmit={onSubmit}
            className="flex flex-col gap-6 rounded-[32px] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.08)] md:p-12"
          >
            <div>
              <h2 className="text-[28px] leading-9 font-medium md:text-[32px]">{t("greenPages.cancel.formTitle")}</h2>
              <p className="mt-2 text-[15px] leading-6 text-[#61666b]">{t("greenPages.cancel.formSub")}</p>
            </div>
            {error ? (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                {error}
              </p>
            ) : null}
            <div className="grid gap-6 md:grid-cols-2">
              <Field label={t("greenPages.cancel.reference")}>
                <input className={field} required value={reference} placeholder={t("greenPages.cancel.referencePh")} onChange={(e) => setReference(e.target.value)} />
              </Field>
              <Field label={t("greenPages.cancel.email")}>
                <input className={field} type="email" required autoComplete="email" value={email} placeholder={t("greenPages.cancel.emailPh")} onChange={(e) => setEmail(e.target.value)} />
              </Field>
              <Field label={t("greenPages.cancel.child")}>
                <input className={field} value={child} placeholder={t("greenPages.cancel.childPh")} onChange={(e) => setChild(e.target.value)} />
              </Field>
              <Field label={t("greenPages.cancel.lesson")}>
                <input className={field} value={lesson} placeholder={t("greenPages.cancel.lessonPh")} onChange={(e) => setLesson(e.target.value)} />
              </Field>
              <Field label={t("greenPages.cancel.reason")}>
                <input className={field} value={reason} placeholder={t("greenPages.cancel.reasonPh")} onChange={(e) => setReason(e.target.value)} />
              </Field>
              <Field label={t("greenPages.cancel.outcome")}>
                <input className={field} value={outcome} placeholder={t("greenPages.cancel.outcomePh")} onChange={(e) => setOutcome(e.target.value)} />
              </Field>
            </div>
            <Field label={t("greenPages.cancel.happened")}>
              <textarea
                className="min-h-[132px] w-full rounded-[14px] border border-[#e3e8eb] bg-white p-4 text-[14px] text-[#141417] placeholder:text-[#8c9196] focus:border-[#0abab5] focus:outline-none"
                required
                value={happened}
                placeholder={t("greenPages.cancel.happenedPh")}
                onChange={(e) => setHappened(e.target.value)}
              />
            </Field>
            <div className="rounded-[20px] bg-[#f9fafa] p-6">
              <p className="text-[17px] font-semibold">{t("greenPages.cancel.evidenceTitle")}</p>
              <p className="mt-2 text-[15px] leading-6 text-[#61666b]">{t("greenPages.cancel.evidenceBody")}</p>
              <input
                type="file"
                className="mt-4 block w-full text-sm text-[#61666b]"
                onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
              />
            </div>
            <label className="flex items-start gap-3 text-[14px] leading-5">
              <input
                type="checkbox"
                className="mt-0.5 size-6 accent-[#0abab5]"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span>{t("greenPages.cancel.consent")}</span>
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={sending}
                className="inline-flex items-center justify-center rounded-[24px] bg-[#0abab5] px-7 py-4 text-[15px] font-medium text-white transition hover:bg-[#089591] disabled:opacity-60"
              >
                {sending ? t("greenPages.cancel.sending") : t("greenPages.cancel.submit")}
              </button>
              <Link
                href="/refund"
                className="inline-flex items-center justify-center rounded-[24px] border border-[#0abab5] bg-white px-7 py-4 text-[15px] font-medium text-[#0abab5]"
              >
                {t("greenPages.cancel.refund")}
              </Link>
            </div>
            <p className="text-[13px] leading-5 text-[#61666b]">{t("greenPages.cancel.note")}</p>
          </form>
        </div>
      </section>
      <Footer />
    </main>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[14px] font-medium leading-5">{label}</span>
      {children}
    </label>
  )
}
