"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Mail, Lock } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { classzSignIn, getClasszSession } from "@/lib/classz-auth"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

function LoginForm() {
  const { t, locale } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get("next") || "/admin"

  const [loginIdentifier, setLoginIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (getClasszSession()) {
      router.replace(nextPath.startsWith("/") ? nextPath : "/admin")
    }
  }, [router, nextPath])

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
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-brand-slate">{t("classzLogin.title")}</h1>
          <p className="text-sm text-brand-slate/80">{t("classzLogin.subtitle")}</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
                  placeholder="center@demo.com"
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
            <p className="text-sm text-brand-slate/70">{t("classzLogin.registerHint")}</p>
            <Link href="/register-center" className="text-sm font-medium text-classz-500 hover:text-classz-600">
              {locale === "zh-TW" ? "註冊中心帳戶" : "Register your centre"}
            </Link>
          </div>

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
        </form>

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
