"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Mail, Lock } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { classzSignIn, getClasszSession } from "@/lib/classz-auth"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

type PortalType = "staff" | "family"

function LoginForm() {
  const { t, locale } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const portalParam = searchParams.get("portal")
  const initialPortal: PortalType | null = portalParam === "family" ? "family" : portalParam === "staff" ? "staff" : null
  const [portal, setPortal] = useState<PortalType | null>(initialPortal)
  const nextPath = searchParams.get("next") || (portal === "family" ? "/" : "/admin")

  const [loginIdentifier, setLoginIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (getClasszSession()) {
      router.replace(nextPath.startsWith("/") ? nextPath : "/admin")
    }
  }, [router, nextPath])

  useEffect(() => {
    setPortal(initialPortal)
  }, [initialPortal])

  function selectPortal(nextPortal: PortalType) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("portal", nextPortal)
    router.replace(`/login?${params.toString()}`)
    setPortal(nextPortal)
    setError("")
  }

  function clearPortal() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("portal")
    const qs = params.toString()
    router.replace(qs ? `/login?${qs}` : "/login")
    setPortal(null)
    setError("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await classzSignIn(loginIdentifier.trim(), password)
      router.push(nextPath.startsWith("/") ? nextPath : "/admin")
      router.refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ""
      setError(
        msg === "Invalid email or password"
          ? t("classzLogin.invalidCredentials")
          : msg || t("classzLogin.invalidCredentials")
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-brand-slate">{t("classzLogin.title")}</h1>
          <p className="text-sm text-brand-slate/80">{t("classzLogin.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => selectPortal("staff")}
            className={`min-h-[168px] rounded-3xl border-2 px-5 py-6 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
              portal === "staff"
                ? "border-classz-400 bg-classz-50 shadow-sm hover:border-classz-500 hover:bg-classz-100/70"
                : "border-classz-100 bg-white hover:border-classz-300 hover:bg-classz-50/70"
            }`}
          >
            <p className="text-base sm:text-lg font-semibold text-brand-slate">
              {locale === "zh-TW" ? "中心 / 導師 Portal" : "Centre / Teacher portal"}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-brand-slate/70">
              {locale === "zh-TW"
                ? "管理課堂、Learning Record、學員資料與中心後台。"
                : "Manage classes, Learning Records, students, and the centre dashboard."}
            </p>
          </button>
          <button
            type="button"
            onClick={() => selectPortal("family")}
            className={`min-h-[168px] rounded-3xl border-2 px-5 py-6 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
              portal === "family"
                ? "border-classz-400 bg-classz-50 shadow-sm hover:border-classz-500 hover:bg-classz-100/70"
                : "border-classz-100 bg-white hover:border-classz-300 hover:bg-classz-50/70"
            }`}
          >
            <p className="text-base sm:text-lg font-semibold text-brand-slate">
              {locale === "zh-TW" ? "家長 / 學生 Portal" : "Parent / Student portal"}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-brand-slate/70">
              {locale === "zh-TW"
                ? "查看報名、課堂資訊、學習進度與家庭帳戶內容。"
                : "View bookings, class details, learning progress, and family account information."}
            </p>
          </button>
        </div>

        {portal ? (
        <div className="rounded-2xl border border-classz-100 bg-white p-4 sm:p-5">
          <div className="mb-4 space-y-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-brand-slate">
              {portal === "staff"
                ? locale === "zh-TW"
                  ? "中心 / 導師登入"
                  : "Centre / Teacher sign in"
                : locale === "zh-TW"
                  ? "家長 / 學生登入"
                  : "Parent / Student sign in"}
                </h2>
                <p className="text-sm text-brand-slate/70">
              {portal === "staff"
                ? locale === "zh-TW"
                  ? "使用中心或導師帳號登入後台。"
                  : "Sign in with a centre or teacher account."
                : locale === "zh-TW"
                  ? "使用家長或學生帳號查看課堂與學習資訊。"
                : "Sign in with a parent or student account to view classes and learning updates."}
                </p>
              </div>
              <button
                type="button"
                onClick={clearPortal}
                className="text-xs font-medium text-classz-500 hover:text-classz-700"
              >
                {locale === "zh-TW" ? "返回 Portal 選擇" : "Back to portals"}
              </button>
            </div>
          </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-[color-mix(in_srgb,var(--brand-coral)_10%,white)] border border-[color-mix(in_srgb,var(--brand-coral)_35%,white)] text-brand-coral px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="rounded-md space-y-4">
            <div>
              <label htmlFor="loginIdentifier" className="block text-sm font-medium text-brand-slate mb-1">
                {t("classzLogin.emailOrUsername")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Mail className="h-5 w-5 text-brand-slate/50" />
                </div>
                <input
                  id="loginIdentifier"
                  name="loginIdentifier"
                  type="text"
                  autoComplete="username"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-classz-200 rounded-md text-brand-slate placeholder:text-brand-slate/50 focus:outline-none focus:ring-2 focus:ring-classz-400 focus:border-classz-400 sm:text-sm"
                  placeholder={portal === "staff" ? "center@demo.com" : "parent@example.com"}
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brand-slate mb-1">
                {t("classzLogin.password")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Lock className="h-5 w-5 text-brand-slate/50" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-classz-200 rounded-md text-brand-slate placeholder:text-brand-slate/50 focus:outline-none focus:ring-2 focus:ring-classz-400 focus:border-classz-400 sm:text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 rounded-md text-sm font-semibold text-white bg-classz-400 hover:bg-classz-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-classz-400 disabled:opacity-50 transition-colors"
          >
            {loading ? t("classzLogin.signingIn") : t("classzLogin.signIn")}
          </button>

          <div className="text-center space-y-3">
            <button
              type="button"
              className="text-sm font-medium text-classz-400 hover:text-classz-600"
              onClick={() => {}}
            >
              {t("classzLogin.forgotPassword")}
            </button>
            {portal === "staff" ? (
              <>
                <p className="text-sm text-brand-slate/70">{t("classzLogin.registerHint")}</p>
                <Link href="/register-center" className="text-sm font-medium text-classz-500 hover:text-classz-600">
                  {locale === "zh-TW" ? "註冊中心帳戶" : "Register your centre"}
                </Link>
              </>
            ) : (
              <p className="text-sm text-brand-slate/70">
                {locale === "zh-TW"
                  ? "家長 / 學生帳戶會跟隨報名與學員資料建立。"
                  : "Parent and student access is tied to enrolment and family account records."}
              </p>
            )}
          </div>

          {portal === "staff" ? (
          <div className="rounded-lg border border-classz-100 bg-classz-50/80 p-4 space-y-3">
            <p className="text-xs font-semibold text-brand-slate/80">{t("classzLogin.demoTitle")}</p>
            <p className="text-xs text-brand-slate/70">
              {t("classzLogin.demoPassword")} <code className="text-brand-slate bg-white px-1.5 py-0.5 rounded border">111111</code>
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => {
                  setLoginIdentifier("admin@admin.com")
                  setPassword("111111")
                }}
                className="flex items-center justify-between rounded-md border border-classz-100 bg-white px-3 py-2 text-left text-sm hover:border-classz-400 hover:bg-classz-50 transition-colors"
              >
                <span className="font-medium text-brand-slate">{t("classzLogin.platformAccount")}</span>
                <code className="text-xs text-brand-slate/70">admin@admin.com</code>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginIdentifier("center@demo.com")
                  setPassword("111111")
                }}
                className="flex items-center justify-between rounded-md border border-classz-100 bg-white px-3 py-2 text-left text-sm hover:border-classz-400 hover:bg-classz-50 transition-colors"
              >
                <span className="font-medium text-brand-slate">{t("classzLogin.centerAccount")}</span>
                <code className="text-xs text-brand-slate/70">center@demo.com</code>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginIdentifier("centre@classzcentre.demo")
                  setPassword("111111")
                }}
                className="flex items-center justify-between rounded-md border border-classz-100 bg-white px-3 py-2 text-left text-sm hover:border-classz-400 hover:bg-classz-50 transition-colors"
              >
                <span className="font-medium text-brand-slate">
                  {locale === "zh-TW" ? "ClassZ Centre" : "ClassZ Centre"}
                </span>
                <code className="text-xs text-brand-slate/70">centre@classzcentre.demo</code>
              </button>
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    setLoginIdentifier(`teacher${n}@classzcentre.demo`)
                    setPassword("111111")
                  }}
                  className="flex items-center justify-between rounded-md border border-classz-100 bg-white px-3 py-2 text-left text-sm hover:border-classz-400 hover:bg-classz-50 transition-colors"
                >
                  <span className="font-medium text-brand-slate">
                    {locale === "zh-TW" ? `ClassZ Centre Teacher ${n}` : `ClassZ Centre Teacher ${n}`}
                  </span>
                  <code className="text-xs text-brand-slate/70">teacher{n}@classzcentre.demo</code>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-brand-slate/50 leading-relaxed">{t("classzLogin.offlineHint")}</p>
          </div>
          ) : (
            <div className="rounded-lg border border-classz-100 bg-classz-50/80 p-4 space-y-2">
              <p className="text-xs font-semibold text-brand-slate/80">
                {locale === "zh-TW" ? "家庭 Portal 提示" : "Family portal note"}
              </p>
              <p className="text-xs leading-relaxed text-brand-slate/70">
                {locale === "zh-TW"
                  ? "如需測試家長 / 學生登入，可使用實際已建立的家長帳戶資料登入。"
                  : "For testing parent/student access, sign in with a real family account that already exists in the system."}
              </p>
            </div>
          )}
        </form>
        </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-classz-200 bg-classz-50/50 px-4 py-6 text-center text-sm text-brand-slate/70">
            {locale === "zh-TW"
              ? "請先選擇登入 portal，再輸入帳號密碼。"
              : "Choose a portal first, then sign in with your account details."}
          </div>
        )}

        <p className="text-center text-sm">
          <Link href="/" className="text-classz-400 hover:underline">
            ← ClassZ
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans antialiased text-brand-slate">
      <Navbar />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="min-h-[50vh] flex items-center justify-center text-brand-slate/70 text-sm">
              …
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
