"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/components/language-provider"
import { GREEN_FONT, GreenArrow } from "@/components/info/green-arrow"

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function EarlyAccessPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState("")
  const [explore, setExplore] = useState("")
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !role) {
      setError(t("greenPages.early.required"))
      return
    }
    if (!EMAIL.test(email.trim())) {
      setError(t("greenPages.early.invalidEmail"))
      return
    }
    setSending(true)
    setError("")
    const roleLabel =
      role === "centre" ? t("greenPages.early.roleCentre") : t("greenPages.early.roleParent")
    const message = [
      `Role: ${roleLabel}`,
      phone.trim() ? `WhatsApp: ${phone.trim()}` : "",
      explore.trim() ? `Explore: ${explore.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n")
    try {
      const response = await fetch("/api/parent/contact-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: "Early access request",
          category: "general_inquiry",
          message,
        }),
        signal: AbortSignal.timeout(8000),
      })
      if (!response.ok) throw new Error("submit failed")
      router.push("/early-access/thank-you")
    } catch {
      setError(t("greenPages.early.error"))
      setSending(false)
    }
  }

  const field =
    "h-14 w-full rounded-[8px] border border-[#b0b0b0] bg-white px-3 text-[16px] text-[#18191b] placeholder:text-[#b0b0b0] focus:border-[#0abab5] focus:outline-none"

  return (
    <main className="min-h-screen bg-[#f6f3f3] text-[#18191b]" style={{ fontFamily: GREEN_FONT }}>
      <Navbar />
      <section className="relative overflow-hidden px-4 pt-16 pb-10 md:px-8 md:pt-24">
        <div className="pointer-events-none absolute top-[18%] left-[-8%] h-[380px] w-[380px] rounded-full bg-[#fff4b0] opacity-70 blur-[90px]" />
        <div className="pointer-events-none absolute top-[8%] right-[-6%] h-[420px] w-[420px] rounded-full bg-[#b7f6f2] opacity-80 blur-[100px]" />
        <div className="relative mx-auto max-w-[980px] text-center">
          <h1 className="text-[40px] leading-[1.05] font-medium tracking-[-1.5px] md:text-[72px] md:leading-[60px]">
            {t("greenPages.early.hero")}
          </h1>
          <p className="mx-auto mt-6 max-w-[720px] text-[18px] leading-7 text-[#404040]">
            {t("greenPages.early.sub")}
          </p>
          <img
            src="/early-access/hero.jpg"
            alt={t("greenPages.early.imageAlt")}
            className="mx-auto mt-10 aspect-[16/9] w-full max-w-[980px] rounded-[24px] object-cover"
          />
        </div>
      </section>

      <section className="relative overflow-hidden px-4 py-8 md:px-8 md:py-12">
        <div className="pointer-events-none absolute bottom-0 left-[-10%] h-[280px] w-[280px] rounded-full bg-[#ffd0e4] opacity-60 blur-[80px]" />
        <div className="relative mx-auto max-w-[1120px] rounded-[24px] bg-white px-6 py-10 md:px-16 md:py-14">
          <h2 className="text-center text-[32px] leading-10 font-medium md:text-[36px]">
            {t("greenPages.early.formTitle")}
          </h2>
          <p className="mt-3 text-[16px] leading-6 text-[#5e5e5e]">{t("greenPages.early.helper")}</p>
          <form onSubmit={onSubmit} className="mx-auto mt-8 flex max-w-[720px] flex-col items-center gap-6">
            {error ? (
              <p className="w-full rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                {error}
              </p>
            ) : null}
            <input
              className={field}
              name="name"
              autoComplete="name"
              required
              placeholder={t("greenPages.early.name")}
              aria-label={t("greenPages.early.name")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className={field}
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder={t("greenPages.early.email")}
              aria-label={t("greenPages.early.email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className={field}
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder={t("greenPages.early.phone")}
              aria-label={t("greenPages.early.phone")}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <select
              className={field}
              name="role"
              required
              aria-label={t("greenPages.early.role")}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">{t("greenPages.early.role")}</option>
              <option value="parent">{t("greenPages.early.roleParent")}</option>
              <option value="centre">{t("greenPages.early.roleCentre")}</option>
            </select>
            <input
              className={field}
              name="explore"
              placeholder={t("greenPages.early.explore")}
              aria-label={t("greenPages.early.explore")}
              value={explore}
              onChange={(e) => setExplore(e.target.value)}
            />
            <button
              type="submit"
              disabled={sending}
              className="inline-flex items-center gap-[18px] rounded-full bg-[#0abab5] py-[18px] pr-8 pl-[34px] text-[18px] leading-7 font-medium text-white transition hover:bg-[#089591] disabled:opacity-60"
            >
              {sending ? t("greenPages.early.sending") : t("greenPages.early.cta")}
              <GreenArrow />
            </button>
          </form>
        </div>
      </section>

      <section className="px-4 py-8 md:px-8 md:py-16">
        <div className="mx-auto max-w-[1120px] rounded-[24px] bg-white px-6 py-12 md:px-16 md:py-16">
          <h2 className="text-center text-[32px] leading-10 font-medium md:text-[36px]">
            {t("greenPages.early.benefits")}
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <Benefit
              icon="/about/icon-house.svg"
              title={t("greenPages.early.onboardingTitle")}
              body={t("greenPages.early.onboardingBody")}
            />
            <Benefit
              icon="/about/icon-heart-a.svg"
              title={t("greenPages.early.accessTitle")}
              body={t("greenPages.early.accessBody")}
            />
            <Benefit
              icon="/about/icon-people.svg"
              title={t("greenPages.early.supportTitle")}
              body={t("greenPages.early.supportBody")}
            />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}

function Benefit({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <article className="flex min-h-[280px] flex-col gap-4 rounded-[24px] bg-white px-8 py-12 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
      <img src={icon} alt="" width={50} height={50} />
      <h3 className="text-[28px] leading-tight font-medium tracking-[-1.5px] text-[#18191b] md:text-[36px] md:leading-[60px]">
        {title}
      </h3>
      <p className="text-[16px] leading-6 text-[#404040]">{body}</p>
    </article>
  )
}
