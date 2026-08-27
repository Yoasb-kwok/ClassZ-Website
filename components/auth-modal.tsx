"use client"

import {
  Suspense,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import * as Dialog from "@radix-ui/react-dialog"
import { Check, X } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { classzRegisterCenterAndSignIn, classzSignIn, getClasszSession } from "@/lib/classz-auth"
import { checkRegistrationOtp, sendRegistrationOtp } from "@/lib/registration-otp"
import {
  requestPasswordReset,
  resetPasswordWithOtp,
  verifyPasswordResetOtp,
} from "@/lib/password-reset"
import {
  CENTRE_CATEGORIES,
  HK_CENTRE_DISTRICTS,
  PHONE_REGIONS,
  formatInternationalPhone,
  getPasswordChecks,
  getPasswordStrength,
  isCentreCategoryValue,
  isPhoneRegionId,
  isStrongPassword,
  isValidEmail,
  isValidRegionalPhone,
  type PhoneRegionId,
} from "@/lib/register-center-validation"

export type AuthView = "login" | "register" | "forgot"

type AuthModalContextValue = {
  open: boolean
  view: AuthView
  openAuth: (view?: AuthView) => void
  closeAuth: () => void
  setView: (view: AuthView) => void
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null)

export function useAuthModal() {
  const ctx = useContext(AuthModalContext)
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider")
  return ctx
}

const inputClass =
  "w-full min-w-0 rounded-2xl border bg-white px-4 py-3 text-sm text-[#222] placeholder:text-[#B0B0B0] outline-none transition-colors"
const inputOk = "border-[#E5E5E5] focus:border-[#B0B0B0]"
const inputBad = "border-[#E16E65] focus:border-[#E16E65]"

function fieldClass(invalid: boolean) {
  return `${inputClass} ${invalid ? inputBad : inputOk}`
}

function GreenTick({ label }: { label: string }) {
  return (
    <span
      className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-2xl bg-[#22C55E]"
      aria-label={label}
    >
      <Check className="h-5 w-5 text-white" strokeWidth={3} />
    </span>
  )
}

function VerifyButton({
  zh,
  disabled,
  sending,
  onClick,
}: {
  zh: boolean
  disabled?: boolean
  sending?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled || sending}
      onClick={onClick}
      className="h-[46px] shrink-0 rounded-2xl border border-[#E5E5E5] bg-white px-3 text-sm font-medium text-[#222] hover:bg-[#F7F7F7] disabled:opacity-50"
    >
      {sending ? (zh ? "發送中…" : "Sending…") : zh ? "驗證" : "Verify"}
    </button>
  )
}

type OtpBox = {
  sentTo: string
  code: string
  verified: boolean
  error: string
  sending: boolean
  checking: boolean
}

function idleOtp(): OtpBox {
  return { sentTo: "", code: "", verified: false, error: "", sending: false, checking: false }
}

function OtpInput({
  zh,
  value,
  disabled,
  error,
  onChange,
}: {
  zh: boolean
  value: string
  disabled?: boolean
  error?: string
  onChange: (next: string) => void
}) {
  return (
    <div>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        disabled={disabled}
        className={fieldClass(Boolean(error))}
        placeholder={zh ? "輸入 6 位驗證碼" : "Enter 6-digit code"}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 6))}
      />
      {error ? <p className="mt-1 text-xs text-[#E16E65]">{error}</p> : null}
    </div>
  )
}

function PasswordStrengthBar({ password, zh }: { password: string; zh: boolean }) {
  const level = getPasswordStrength(password)
  const filled = level === "strong" ? 3 : level === "medium" ? 2 : level === "weak" ? 1 : 0
  const fillClass =
    level === "strong" ? "bg-[#22C55E]" : level === "medium" ? "bg-[#EAB308]" : "bg-[#E16E65]"
  const labelClass =
    level === "strong" ? "text-[#16A34A]" : level === "medium" ? "text-[#CA8A04]" : "text-[#E16E65]"
  const label =
    level === "strong"
      ? zh
        ? "強"
        : "Strong"
      : level === "medium"
        ? zh
          ? "中"
          : "Medium"
        : zh
          ? "弱"
          : "Weak"

  return (
    <div className="space-y-1">
      <div className="flex gap-1" aria-hidden>
        {[1, 2, 3].map((segment) => (
          <div
            key={segment}
            className={`h-1.5 flex-1 rounded-full ${segment <= filled ? fillClass : "bg-[#EBEBEB]"}`}
          />
        ))}
      </div>
      {level !== "empty" ? (
        <p className={`text-xs font-medium ${labelClass}`}>
          {zh ? `密碼強度：${label}` : `Password strength: ${label}`}
        </p>
      ) : null}
    </div>
  )
}

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(pathname === "/login" || pathname === "/register-center")
  const [view, setView] = useState<AuthView>(pathname === "/register-center" ? "register" : "login")

  const openAuth = useCallback((nextView: AuthView = "login") => {
    setView(nextView)
    setOpen(true)
  }, [])

  const closeAuth = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (pathname === "/login") {
      setView("login")
      setOpen(true)
    }
    if (pathname === "/register-center") {
      setView("register")
      setOpen(true)
    }
  }, [pathname])

  return (
    <AuthModalContext.Provider value={{ open, view, openAuth, closeAuth, setView }}>
      {children}
      <Suspense fallback={null}>
        <AuthModal />
      </Suspense>
    </AuthModalContext.Provider>
  )
}

function AuthModal() {
  const { open, view, closeAuth, setView, openAuth } = useAuthModal()
  const pathname = usePathname()
  const router = useRouter()
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"

  function handleOpenChange(next: boolean) {
    if (next) {
      openAuth(view)
      return
    }
    closeAuth()
    if (pathname === "/login" || pathname === "/register-center") {
      router.push("/")
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/40" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[101] flex max-h-[90vh] w-[min(92vw,26.5rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[28px] bg-white px-6 pb-7 pt-8 text-[#222] shadow-[0_12px_40px_rgba(0,0,0,0.18)] focus:outline-none"
          aria-describedby={undefined}
        >
          <Dialog.Close asChild>
            <button
              type="button"
              aria-label={zh ? "關閉" : "Close"}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#F0F0F0] text-[#9A9A9A] transition-colors hover:bg-[#E5E5E5] hover:text-[#222]"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>
          <Dialog.Title
            className={
              view === "forgot"
                ? "sr-only"
                : "mb-6 text-center text-[28px] font-bold tracking-tight text-[#222]"
            }
          >
            {view === "register"
              ? zh
                ? "註冊"
                : "Register"
              : view === "forgot"
                ? zh
                  ? "忘記密碼"
                  : "Forgot Password"
                : zh
                  ? "登入"
                  : "Login"}
          </Dialog.Title>
          <div className="min-h-0 overflow-y-auto pr-0.5">
            {view === "register" ? (
              <RegisterPanel
                zh={zh}
                onSwitchToLogin={() => setView("login")}
                onSuccess={() => {
                  closeAuth()
                  router.push("/admin")
                  router.refresh()
                }}
              />
            ) : view === "forgot" ? (
              <ForgotPanel zh={zh} onBackToLogin={() => setView("login")} />
            ) : (
              <LoginPanel
                zh={zh}
                onSwitchToRegister={() => setView("register")}
                onForgot={() => setView("forgot")}
                onSuccess={(path) => {
                  closeAuth()
                  router.push(path)
                  router.refresh()
                }}
              />
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function LoginPanel({
  zh,
  onSwitchToRegister,
  onForgot,
  onSuccess,
}: {
  zh: boolean
  onSwitchToRegister: () => void
  onForgot: () => void
  onSuccess: (path: string) => void
}) {
  const searchParams = useSearchParams()
  const nextPath = searchParams.get("next") || "/admin"
  const [loginIdentifier, setLoginIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (getClasszSession()) onSuccess(nextPath.startsWith("/") ? nextPath : "/admin")
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when the login panel mounts
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!loginIdentifier.trim() || !password) {
      setError(zh ? "請輸入電郵同密碼" : "Please enter your email and password")
      return
    }
    setLoading(true)
    try {
      await classzSignIn(loginIdentifier.trim(), password)
      onSuccess(nextPath.startsWith("/") ? nextPath : "/admin")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ""
      setError(msg || (zh ? "電郵或密碼不正確" : "Invalid email or password"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      {error ? <p className="text-center text-sm text-[#E16E65]">{error}</p> : null}
      <input
        type="text"
        autoComplete="username"
        className={fieldClass(false)}
        placeholder={zh ? "電郵地址" : "Email address"}
        value={loginIdentifier}
        onChange={(e) => setLoginIdentifier(e.target.value)}
      />
      <input
        type="password"
        autoComplete="current-password"
        className={fieldClass(false)}
        placeholder={zh ? "密碼" : "Password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="flex justify-end">
        <button
          type="button"
          className="text-sm text-[#9A9A9A] hover:text-[#222] hover:underline"
          onClick={onForgot}
        >
          {zh ? "忘記密碼？" : "Forgot password?"}
        </button>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="mt-3 w-full rounded-2xl bg-[#222] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? (zh ? "登入中…" : "Signing in…") : zh ? "登入" : "Login"}
      </button>
      <p className="pt-2 text-center text-sm text-[#9A9A9A]">
        {zh ? "未有帳戶？" : "Don't have an account?"}{" "}
        <button type="button" className="font-semibold text-[#222] hover:underline" onClick={onSwitchToRegister}>
          {zh ? "註冊" : "Register"}
        </button>
      </p>
    </form>
  )
}

function RegisterPanel({
  zh,
  onSwitchToLogin,
  onSuccess,
}: {
  zh: boolean
  onSwitchToLogin: () => void
  onSuccess: () => void
}) {
  const [form, setForm] = useState({
    center_name: "",
    district: HK_CENTRE_DISTRICTS[0],
    category: "",
    full_name: "",
    email: "",
    phoneRegion: "HK" as PhoneRegionId,
    mobile: "",
    password: "",
    confirm: "",
  })
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [attempted, setAttempted] = useState(false)
  const [emailOtp, setEmailOtp] = useState<OtpBox>(idleOtp)
  const [phoneOtp, setPhoneOtp] = useState<OtpBox>(idleOtp)

  const checks = getPasswordChecks(form.password)
  const emailOk = isValidEmail(form.email)
  const phoneOk = isValidRegionalPhone(form.phoneRegion, form.mobile)
  const internationalMobile = formatInternationalPhone(form.phoneRegion, form.mobile)
  const emailVerified = emailOtp.verified && emailOtp.sentTo === form.email.trim().toLowerCase()
  const phoneVerified = phoneOtp.verified && phoneOtp.sentTo === internationalMobile
  const passwordsMatch = form.password.length > 0 && form.password === form.confirm
  const unmetRules = [
    !checks.hasNumber
      ? zh
        ? "密碼必須包含至少 1 個數字"
        : "Your password must contain at least 1 number"
      : null,
    !checks.hasUpper
      ? zh
        ? "密碼必須包含至少 1 個大寫英文字母"
        : "Your password must contain at least 1 uppercase letter."
      : null,
  ].filter((line): line is string => Boolean(line))

  async function sendEmailCode() {
    if (!emailOk) {
      setEmailOtp((s) => ({ ...s, error: zh ? "請輸入有效電郵地址" : "Please enter a valid email address" }))
      return
    }
    const target = form.email.trim().toLowerCase()
    setEmailOtp((s) => ({ ...s, sending: true, error: "", verified: false, code: "" }))
    try {
      await sendRegistrationOtp("email", target, zh ? "zh-TW" : "en")
      setEmailOtp({
        sentTo: target,
        code: "",
        verified: false,
        error: "",
        sending: false,
        checking: false,
      })
    } catch (err: unknown) {
      setEmailOtp((s) => ({
        ...s,
        sending: false,
        error: err instanceof Error ? err.message : zh ? "發送失敗" : "Failed to send code",
      }))
    }
  }

  async function sendPhoneCode() {
    if (!phoneOk) {
      setPhoneOtp((s) => ({
        ...s,
        error: zh ? "請輸入有效電話號碼" : "Please enter a valid phone number",
      }))
      return
    }
    const target = internationalMobile
    setPhoneOtp((s) => ({ ...s, sending: true, error: "", verified: false, code: "" }))
    try {
      await sendRegistrationOtp("mobile", target)
      setPhoneOtp({
        sentTo: target,
        code: "",
        verified: false,
        error: "",
        sending: false,
        checking: false,
      })
    } catch (err: unknown) {
      setPhoneOtp((s) => ({
        ...s,
        sending: false,
        error: err instanceof Error ? err.message : zh ? "發送失敗" : "Failed to send code",
      }))
    }
  }

  async function confirmOtp(
    channel: "email" | "mobile",
    target: string,
    code: string,
    setBox: (update: (current: OtpBox) => OtpBox) => void,
  ) {
    const otp = code.replace(/\D/g, "")
    if (otp.length !== 6) return
    setBox((s) => {
      if (s.checking || s.verified) return s
      return { ...s, checking: true, error: "" }
    })
    try {
      await checkRegistrationOtp(channel, target, otp)
      setBox((s) => ({ ...s, checking: false, verified: true, error: "", code: otp }))
    } catch (err: unknown) {
      setBox((s) => ({
        ...s,
        checking: false,
        verified: false,
        error: err instanceof Error ? err.message : zh ? "驗證碼不正確" : "Incorrect verification code",
      }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setAttempted(true)
    setError("")
    if (!emailOk) {
      setError(zh ? "請輸入有效電郵地址" : "Please enter a valid email address")
      return
    }
    if (!isStrongPassword(form.password)) {
      setError(zh ? "密碼未符合要求" : "Please meet the password requirements")
      return
    }
    if (!passwordsMatch) {
      setError(zh ? "密碼不一致" : "Passwords do not match")
      return
    }
    if (!form.center_name.trim() || !form.full_name.trim() || !isCentreCategoryValue(form.category) || !phoneOk) {
      setError(zh ? "請填妥中心資料、類別同電話" : "Please complete centre details, category, and phone number")
      return
    }
    if (!agreed) {
      setError(zh ? "請先同意條款及細則" : "Please agree to the Terms and Conditions")
      return
    }
    if (!emailVerified || !phoneVerified) {
      setError(zh ? "請先驗證電郵同電話" : "Please verify your email and phone number")
      return
    }
    setLoading(true)
    try {
      await classzRegisterCenterAndSignIn({
        center_name: form.center_name.trim(),
        district: form.district,
        category: form.category,
        email: form.email.trim(),
        password: form.password,
        full_name: form.full_name.trim(),
        mobile: formatInternationalPhone(form.phoneRegion, form.mobile),
      })
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : zh ? "註冊失敗" : "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit} noValidate>
      {error ? <p className="text-center text-sm text-[#E16E65]">{error}</p> : null}
      <div className="space-y-2">
        <div className="flex min-w-0 gap-2">
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            className={fieldClass(attempted && !emailOk)}
            placeholder={zh ? "電郵地址" : "Email address"}
            value={form.email}
            onChange={(e) => {
              const email = e.target.value
              setForm((f) => ({ ...f, email }))
              setEmailOtp((s) =>
                s.sentTo && s.sentTo !== email.trim().toLowerCase() ? idleOtp() : s,
              )
            }}
          />
          {emailVerified ? (
            <GreenTick label={zh ? "電郵已驗證" : "Email verified"} />
          ) : (
            <VerifyButton zh={zh} sending={emailOtp.sending} disabled={!emailOk} onClick={sendEmailCode} />
          )}
        </div>
        {!emailVerified && emailOtp.sentTo === form.email.trim().toLowerCase() ? (
          <OtpInput
            zh={zh}
            value={emailOtp.code}
            disabled={emailOtp.checking}
            error={emailOtp.error}
            onChange={(code) => {
              setEmailOtp((s) => ({ ...s, code, error: "" }))
              if (code.length === 6) {
                void confirmOtp("email", form.email.trim().toLowerCase(), code, setEmailOtp)
              }
            }}
          />
        ) : emailOtp.error && !emailOtp.sentTo ? (
          <p className="text-xs text-[#E16E65]">{emailOtp.error}</p>
        ) : null}
      </div>
      <input
        type="password"
        autoComplete="new-password"
        className={fieldClass(attempted && !isStrongPassword(form.password))}
        placeholder={zh ? "密碼" : "Password"}
        value={form.password}
        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
      />
      <PasswordStrengthBar password={form.password} zh={zh} />
      <input
        type="password"
        autoComplete="new-password"
        className={fieldClass(attempted && (!form.confirm || !passwordsMatch))}
        placeholder={zh ? "確認密碼" : "Confirm password"}
        value={form.confirm}
        onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
      />

      <div className="space-y-2 pt-1">
        <div className={`flex items-center gap-2 text-xs ${checks.hasLen ? "text-[#9A9A9A]" : "text-[#B0B0B0]"}`}>
          <span
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
              checks.hasLen ? "bg-[#EBEBEB] text-[#9A9A9A]" : "border border-[#D0D0D0]"
            }`}
          >
            {checks.hasLen ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : null}
          </span>
          {zh ? "密碼必須至少 8 個字元" : "Your password must be at least 8 characters long"}
        </div>
        {unmetRules.length > 0 ? (
          <div className="space-y-1.5">
            {unmetRules.map((line) => (
              <div key={line} className="flex items-center gap-2 text-xs text-[#E16E65]">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#E16E65] text-[#E16E65]">
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
                {line}
              </div>
            ))}
          </div>
        ) : null}
        {form.confirm.length > 0 && !passwordsMatch ? (
          <p className="text-xs text-[#E16E65]">{zh ? "密碼不一致" : "Passwords do not match."}</p>
        ) : null}
      </div>

      <input
        className={fieldClass(attempted && !form.center_name.trim())}
        placeholder={zh ? "中心名稱" : "Centre name"}
        value={form.center_name}
        onChange={(e) => setForm((f) => ({ ...f, center_name: e.target.value }))}
      />
      <input
        className={fieldClass(attempted && !form.full_name.trim())}
        placeholder={zh ? "管理員姓名" : "Admin name"}
        value={form.full_name}
        onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
      />
      <select
        className={`${fieldClass(false)} ${form.district ? "text-[#222]" : "text-[#B0B0B0]"}`}
        value={form.district}
        onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
      >
        {HK_CENTRE_DISTRICTS.map((d) => (
          <option key={d} value={d} className="bg-white text-[#222]">
            {d}
          </option>
        ))}
      </select>
      <select
        id="register-category"
        className={`${fieldClass(attempted && !isCentreCategoryValue(form.category))} ${
          form.category ? "text-[#222]" : "text-[#B0B0B0]"
        }`}
        value={form.category}
        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
      >
        <option value="" disabled className="bg-white text-[#B0B0B0]">
          {zh ? "請選擇類別" : "Select a category"}
        </option>
        {CENTRE_CATEGORIES.map((item) => (
          <option key={item.value} value={item.value} className="bg-white text-[#222]">
            {zh ? item.zh : item.en}
          </option>
        ))}
      </select>
      <div className="space-y-2">
        <div className="flex min-w-0 gap-2">
          <div
            className={`flex min-w-0 flex-1 overflow-hidden rounded-2xl border ${
              attempted && !phoneOk ? "border-[#E16E65]" : "border-[#E5E5E5]"
            }`}
          >
            <select
              className="w-[6.5rem] max-w-[6.5rem] shrink-0 border-0 bg-[#F7F7F7] px-2 py-3 text-sm text-[#222] outline-none"
              value={form.phoneRegion}
              aria-label={zh ? "電話地區" : "Phone region"}
              onChange={(e) => {
                const nextRegion = e.target.value
                if (!isPhoneRegionId(nextRegion)) return
                setForm((f) => ({ ...f, phoneRegion: nextRegion }))
                setPhoneOtp(idleOtp())
              }}
            >
              {PHONE_REGIONS.map((region) => (
                <option key={region.id} value={region.id} className="bg-white text-[#222]">
                  {zh ? region.zh : region.en}
                </option>
              ))}
            </select>
            <input
              id="register-mobile"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              className="min-w-0 flex-1 border-0 border-l border-[#E5E5E5] bg-white px-4 py-3 text-sm text-[#222] placeholder:text-[#B0B0B0] outline-none"
              placeholder={PHONE_REGIONS.find((region) => region.id === form.phoneRegion)?.placeholder}
              value={form.mobile}
              onChange={(e) => {
                const mobile = e.target.value
                setForm((f) => ({ ...f, mobile }))
                setPhoneOtp((s) => {
                  const next = formatInternationalPhone(form.phoneRegion, mobile)
                  return s.sentTo && s.sentTo !== next ? idleOtp() : s
                })
              }}
            />
          </div>
          {phoneVerified ? (
            <GreenTick label={zh ? "電話已驗證" : "Phone verified"} />
          ) : (
            <VerifyButton zh={zh} sending={phoneOtp.sending} disabled={!phoneOk} onClick={sendPhoneCode} />
          )}
        </div>
        {!phoneVerified && phoneOtp.sentTo === internationalMobile ? (
          <OtpInput
            zh={zh}
            value={phoneOtp.code}
            disabled={phoneOtp.checking}
            error={phoneOtp.error}
            onChange={(code) => {
              setPhoneOtp((s) => ({ ...s, code, error: "" }))
              if (code.length === 6) {
                void confirmOtp("mobile", internationalMobile, code, setPhoneOtp)
              }
            }}
          />
        ) : phoneOtp.error && !phoneOtp.sentTo ? (
          <p className="text-xs text-[#E16E65]">{phoneOtp.error}</p>
        ) : null}
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 pt-2 text-[11px] leading-snug text-[#9A9A9A]">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#D0D0D0] bg-white accent-[#0ABAB5]"
        />
        <span>
          {zh ? "我同意 ClassZ 嘅" : "I agree to the Terms and Conditions of ClassZ, as detailed on the "}
          <Link href="/terms" target="_blank" className="font-medium text-[#0ABAB5] hover:underline">
            {zh ? "條款及細則" : "Terms and Conditions"}
          </Link>
        </span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full rounded-2xl bg-[#222] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? (zh ? "提交中…" : "Submitting…") : zh ? "註冊" : "Register"}
      </button>
      <p className="pt-1 text-center text-sm text-[#9A9A9A]">
        {zh ? "已有帳戶？" : "Already have an account?"}{" "}
        <button type="button" className="font-semibold text-[#222] hover:underline" onClick={onSwitchToLogin}>
          {zh ? "登入" : "Login"}
        </button>
      </p>
    </form>
  )
}

const RESET_OTP_SECONDS = 5 * 60

function formatMmSs(total: number) {
  const m = Math.floor(Math.max(0, total) / 60)
  const s = Math.max(0, total) % 60
  return `${m}:${String(s).padStart(2, "0")}`
}

function OtpSixBoxes({
  value,
  disabled,
  error,
  onChange,
}: {
  value: string
  disabled?: boolean
  error?: boolean
  onChange: (next: string) => void
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([])
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || "")

  function focusAt(index: number) {
    refs.current[Math.max(0, Math.min(5, index))]?.focus()
  }

  return (
    <div>
      <div className="flex justify-center gap-1.5 sm:gap-2">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              refs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            maxLength={1}
            disabled={disabled}
            aria-label={`OTP digit ${index + 1}`}
            className={`h-11 w-11 rounded-xl border bg-white text-center text-lg font-semibold text-[#222] outline-none sm:h-12 sm:w-12 ${
              error ? "border-[#E16E65]" : "border-[#E5E5E5] focus:border-[#B0B0B0]"
            }`}
            value={digit}
            onChange={(e) => {
              const nextChar = e.target.value.replace(/\D/g, "").slice(-1)
              const next = digits.slice()
              next[index] = nextChar
              onChange(next.join("").slice(0, 6))
              if (nextChar) focusAt(index + 1)
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !digits[index] && index > 0) {
                e.preventDefault()
                const next = digits.slice()
                next[index - 1] = ""
                onChange(next.join(""))
                focusAt(index - 1)
              }
              if (e.key === "ArrowLeft") focusAt(index - 1)
              if (e.key === "ArrowRight") focusAt(index + 1)
            }}
            onPaste={(e) => {
              e.preventDefault()
              const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
              if (!pasted) return
              onChange(pasted)
              focusAt(Math.min(pasted.length, 5))
            }}
          />
        ))}
      </div>
    </div>
  )
}

function ForgotPanel({ zh, onBackToLogin }: { zh: boolean; onBackToLogin: () => void }) {
  const [step, setStep] = useState<"email" | "otp" | "reset" | "done">("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [expiresAt, setExpiresAt] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(RESET_OTP_SECONDS)

  useEffect(() => {
    if (step !== "otp" || !expiresAt) return
    function tick() {
      setSecondsLeft(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)))
    }
    tick()
    const id = window.setInterval(tick, 250)
    return () => window.clearInterval(id)
  }, [step, expiresAt])

  async function sendCode(nextStep: "otp" = "otp") {
    const target = email.trim().toLowerCase()
    if (!isValidEmail(target)) {
      setError(zh ? "請輸入有效電郵地址" : "Please enter a valid email address")
      return
    }
    setLoading(true)
    setError("")
    try {
      await requestPasswordReset(target, zh ? "zh-TW" : "en")
      setEmail(target)
      setOtp("")
      setExpiresAt(Date.now() + RESET_OTP_SECONDS * 1000)
      setSecondsLeft(RESET_OTP_SECONDS)
      setStep(nextStep)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : zh ? "發送失敗" : "Failed to send code")
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    const code = otp.replace(/\D/g, "")
    if (secondsLeft <= 0) {
      setError(zh ? "驗證碼已過期，請重新發送" : "Code expired. Please send it again.")
      return
    }
    if (code.length !== 6) {
      setError(zh ? "請輸入 6 位驗證碼" : "Please enter the 6-digit code")
      return
    }
    setLoading(true)
    setError("")
    try {
      await verifyPasswordResetOtp(email, code)
      setOtp(code)
      setStep("reset")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : zh ? "驗證碼不正確" : "Incorrect verification code")
    } finally {
      setLoading(false)
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (!isStrongPassword(newPassword)) {
      setError(
        zh
          ? "密碼須至少 8 個字，並包含 1 個數字同 1 個大寫英文字母"
          : "Password must be at least 8 characters and include 1 number and 1 uppercase letter.",
      )
      return
    }
    if (newPassword !== confirm) {
      setError(zh ? "密碼不一致" : "Passwords do not match")
      return
    }
    setLoading(true)
    setError("")
    try {
      await resetPasswordWithOtp(email, otp, newPassword, confirm)
      setStep("done")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : zh ? "重設失敗" : "Unable to reset password")
    } finally {
      setLoading(false)
    }
  }

  const heading =
    step === "otp"
      ? zh
        ? "驗證"
        : "Verification"
      : step === "reset"
        ? zh
          ? "重設密碼"
          : "Reset Password"
        : zh
          ? "忘記密碼"
          : "Forgot Password"

  if (step === "done") {
    return (
      <div className="space-y-5 text-center">
        <h2 className="text-[28px] font-bold tracking-tight text-[#222]">{heading}</h2>
        <p className="text-sm text-[#9A9A9A]">
          {zh ? "密碼已更新，而家可以用新密碼登入。" : "Your password has been updated. You can log in with the new password."}
        </p>
        <button
          type="button"
          className="w-full rounded-2xl bg-[#222] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          onClick={onBackToLogin}
        >
          {zh ? "返回登入" : "Back to Login"}
        </button>
      </div>
    )
  }

  if (step === "otp") {
    return (
      <form className="space-y-5" onSubmit={handleVerify}>
        <div className="space-y-2 text-center">
          <h2 className="text-[28px] font-bold tracking-tight text-[#222]">{heading}</h2>
          <p className="text-sm text-[#9A9A9A]">
            {zh ? "請輸入電郵入面嘅驗證碼" : "Enter the OTP from the mail"}
          </p>
        </div>
        {error ? <p className="text-center text-sm text-[#E16E65]">{error}</p> : null}
        <OtpSixBoxes value={otp} disabled={loading} error={Boolean(error)} onChange={(next) => {
          setOtp(next)
          setError("")
        }} />
        <div className="space-y-1 text-center text-sm">
          <p className="text-[#9A9A9A]">
            {zh ? "驗證碼將於 " : "Code expires in "}
            <span className="font-semibold text-[#0ABAB5]">{formatMmSs(secondsLeft)}</span>
            {zh ? " 後失效" : ""}
          </p>
          <button
            type="button"
            className="text-[#9A9A9A] hover:text-[#222] hover:underline disabled:opacity-50"
            disabled={loading}
            onClick={() => sendCode()}
          >
            {zh ? "重新發送" : "Send it again"}
          </button>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-[#222] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? (zh ? "驗證中…" : "Verifying…") : zh ? "驗證" : "Verify"}
        </button>
      </form>
    )
  }

  if (step === "reset") {
    return (
      <form className="space-y-3" onSubmit={handleReset}>
        <h2 className="mb-3 text-center text-[28px] font-bold tracking-tight text-[#222]">{heading}</h2>
        {error ? <p className="text-center text-sm text-[#E16E65]">{error}</p> : null}
        <input
          type="password"
          autoComplete="new-password"
          className={fieldClass(false)}
          placeholder={zh ? "新密碼" : "New password"}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <PasswordStrengthBar password={newPassword} zh={zh} />
        <input
          type="password"
          autoComplete="new-password"
          className={fieldClass(false)}
          placeholder={zh ? "確認密碼" : "Confirm password"}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-3 w-full rounded-2xl bg-[#222] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? (zh ? "更新中…" : "Updating…") : zh ? "確認" : "Confirm"}
        </button>
      </form>
    )
  }

  return (
    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); sendCode() }}>
      <h2 className="text-center text-[28px] font-bold tracking-tight text-[#222]">{heading}</h2>
      {error ? <p className="text-center text-sm text-[#E16E65]">{error}</p> : null}
      <input
        type="email"
        autoComplete="email"
        className={fieldClass(false)}
        placeholder={zh ? "電郵地址" : "Email address"}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <p className="text-center text-sm leading-relaxed text-[#9A9A9A]">
        {zh
          ? "請輸入已登記嘅電郵地址，我哋會寄重設密碼連結同驗證碼畀你。"
          : "Please enter your registered email address, we will get back to you with the reset password link and confirmation OTP thanks"}
      </p>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-[#222] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? (zh ? "發送中…" : "Sending…") : zh ? "確認" : "Confirm"}
      </button>
    </form>
  )
}
