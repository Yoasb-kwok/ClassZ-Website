"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PolicyNavigation } from "@/components/policy-navigation"
import { useLanguage } from "@/components/language-provider"
import { loginUser, deleteAccount, UserModel } from "@/lib/delete-account-provider"
import { jwtDecode } from "jwt-decode"
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react"

export default function DeleteAccountPage() {
    const { t } = useLanguage()
    const [step, setStep] = useState<"initial" | "login" | "verify" | "deleted">("initial")

    // Login form state
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [role, setRole] = useState("parent")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")

    // User & Delete state
    const [user, setUser] = useState<UserModel | null>(null)
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setErrorMsg("")

        try {
            const res = await loginUser(email, password, role)
            if (res.success && res.accessToken) {
                // Decode JWT to get user ID
                const decoded = jwtDecode<{ id: string }>(res.accessToken)
                setUser({
                    id: decoded.id,
                    fullname: res.fullname || "",
                    email: email, // use inputted email
                    role: role,
                    image: res.image,
                    accessToken: res.accessToken,
                })
                setStep("verify")
            } else {
                setErrorMsg(res.message || t("deleteAccountPage.interactive.loginFailed"))
            }
        } catch (err: any) {
            setErrorMsg(err.message || t("deleteAccountPage.interactive.loginFailed"))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!user) return
        setIsDeleting(true)
        setErrorMsg("")

        try {
            const res = await deleteAccount(user.id, user.role, user.accessToken)
            if (res.success) {
                setStep("deleted")
                setShowConfirmModal(false)
            } else {
                setErrorMsg(res.message || t("deleteAccountPage.interactive.deleteFailed"))
                setShowConfirmModal(false)
            }
        } catch (err: any) {
            setErrorMsg(err.message || t("deleteAccountPage.interactive.deleteFailed"))
            setShowConfirmModal(false)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <main className="min-h-screen bg-white font-sans text-slate-900 selection:bg-teal-100 flex flex-col relative">
            <Navbar />

            {/* Hero */}
            <section className="relative w-full overflow-hidden border-b border-[#E9E9E9] min-h-[280px] md:min-h-0 shrink-0">
                <div className="relative w-full h-[280px] md:h-auto" style={{ paddingBottom: '0' }}>
                    <div className="absolute inset-0 md:relative md:pb-[33.33%]">
                        <div
                            className="absolute inset-0 md:absolute bg-cover"
                            style={{ backgroundImage: "url('/PolicyHeader.png')" }}
                        />
                    </div>
                </div>
                <div className="absolute inset-0 bg-black/40 md:bg-black/35 pointer-events-none h-[280px] md:h-full" />
                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none h-[280px] md:h-full">
                    <div className="max-w-[1180px] mx-auto w-full px-4 sm:px-6 md:px-10 text-center pointer-events-auto">
                        <h1 className="text-white text-2xl sm:text-3xl md:text-5xl font-bold mb-2 drop-shadow-lg">
                            {t("deleteAccountPage.hero.title")}
                        </h1>
                    </div>
                </div>
            </section>

            <PolicyNavigation align="left" />

            {/* Content wrapper with flex-grow to push footer down */}
            <div className="flex-grow flex flex-col">
                {step === "deleted" ? (
                    <section className="py-20 bg-white flex-grow flex items-center justify-center">
                        <div className="max-w-md w-full mx-auto px-6 text-center space-y-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold text-[#111929]">{t("deleteAccountPage.interactive.successTitle")}</h2>
                            <p className="text-[#485A69] text-lg">{t("deleteAccountPage.interactive.successDesc")}</p>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="mt-8 px-6 py-3 w-full rounded-lg bg-[#0ABAB5] text-white font-medium hover:bg-[#0aa19d] transition-colors"
                            >
                                {t("deleteAccountPage.interactive.backHomeButton")}
                            </button>
                        </div>
                    </section>
                ) : (
                    <section className="py-14 bg-white flex-grow">
                        <div className="max-w-[960px] mx-auto px-6 md:px-10 flex flex-col lg:flex-row gap-12">

                            {/* Left Column: Instructions (Fixed) */}
                            <div className="flex-1 space-y-8">
                                <div className="mb-6">
                                    <h1 className="text-3xl md:text-4xl font-bold text-[#111929] mb-4">
                                        {t("deleteAccountPage.hero.title")}
                                    </h1>
                                    <div className="border-b border-[#E5E7EB]"></div>
                                </div>

                                <div className="space-y-4 pb-6 border-b border-[#E5E7EB]">
                                    <p className="text-[#485A69] text-sm md:text-base leading-relaxed">
                                        {t("deleteAccountPage.intro")}
                                    </p>
                                </div>

                                <div className="space-y-4 pb-6 border-b border-[#E5E7EB]">
                                    <h2 className="text-2xl md:text-3xl font-semibold text-[#111929]">
                                        {t("deleteAccountPage.steps.title")}
                                    </h2>
                                    <ol className="list-none space-y-4 pl-0">
                                        {[1, 2, 3, 4].map((s) => (
                                            <li key={s} className="flex items-start gap-4">
                                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#0ABAB5] text-white flex items-center justify-center text-sm font-semibold">
                                                    {s}
                                                </span>
                                                <span className="text-[#485A69] text-sm md:text-base leading-relaxed pt-1">
                                                    {t(`deleteAccountPage.steps.step${s}`)}
                                                </span>
                                            </li>
                                        ))}
                                    </ol>
                                </div>

                                <div className="space-y-4 pb-6 border-b border-[#E5E7EB]">
                                    <h2 className="text-2xl md:text-3xl font-semibold text-[#111929]">
                                        {t("deleteAccountPage.important.title")}
                                    </h2>
                                    <div className="bg-[#FFF7ED] border-l-4 border-[#F59E0B] rounded-r-lg p-4 md:p-6">
                                        <p className="text-[#485A69] text-sm md:text-base leading-relaxed">
                                            {t("deleteAccountPage.important.content")}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 pb-6">
                                    <h2 className="text-2xl md:text-3xl font-semibold text-[#111929]">
                                        {t("deleteAccountPage.support.title")}
                                    </h2>
                                    <p className="text-[#485A69] text-sm md:text-base leading-relaxed">
                                        {t("deleteAccountPage.support.content")}{" "}
                                        <a href="mailto:support@classz.co" className="text-[#0ABAB5] hover:underline font-semibold">
                                            support@classz.co
                                        </a>
                                    </p>
                                </div>
                            </div>

                            {/* Right Column: Interactive Flow */}
                            <div className="lg:w-[400px] shrink-0">
                                <div className="sticky top-24 rounded-2xl border border-[#E9E9E9] bg-white shadow-lg p-6 md:p-8 space-y-6">

                                    {errorMsg && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 text-sm">
                                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                            <p>{errorMsg}</p>
                                        </div>
                                    )}

                                    {step === "initial" && (
                                        <div className="space-y-6 text-center">
                                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </div>
                                            <button
                                                onClick={() => setStep("login")}
                                                className="w-full h-12 rounded-lg bg-[#0ABAB5] text-white font-medium hover:bg-[#0aa19d] transition-colors"
                                            >
                                                {t("deleteAccountPage.interactive.deleteButton")}
                                            </button>
                                        </div>
                                    )}

                                    {step === "login" && (
                                        <form onSubmit={handleLogin} className="space-y-5">
                                            <div className="space-y-2 text-center pb-2">
                                                <h3 className="text-xl font-bold text-[#111929]">{t("deleteAccountPage.interactive.loginTitle")}</h3>
                                                <p className="text-sm text-[#485A69]">{t("deleteAccountPage.interactive.loginDesc")}</p>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="block text-sm font-medium text-[#111929]">{t("deleteAccountPage.interactive.emailLabel")}</label>
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full h-11 px-4 rounded-lg border border-[#EFF1F3] bg-white text-sm text-[#292929] placeholder:text-[#B0B7C3] focus:outline-none focus:ring-2 focus:ring-[#0ABAB5] focus:border-transparent"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="block text-sm font-medium text-[#111929]">{t("deleteAccountPage.interactive.passwordLabel")}</label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? "text" : "password"}
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        className="w-full h-11 pl-4 pr-10 rounded-lg border border-[#EFF1F3] bg-white text-sm text-[#292929] placeholder:text-[#B0B7C3] focus:outline-none focus:ring-2 focus:ring-[#0ABAB5] focus:border-transparent"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none flex items-center justify-center p-1"
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="w-5 h-5 stroke-[1.5]" />
                                                        ) : (
                                                            <Eye className="w-5 h-5 stroke-[1.5]" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="block text-sm font-medium text-[#111929]">{t("deleteAccountPage.interactive.roleLabel")}</label>
                                                <select
                                                    value={role}
                                                    onChange={(e) => setRole(e.target.value)}
                                                    className="w-full h-11 px-4 rounded-lg border border-[#EFF1F3] bg-white text-sm text-[#292929] focus:outline-none focus:ring-2 focus:ring-[#0ABAB5] focus:border-transparent appearance-none"
                                                >
                                                    <option value="owner">{t("deleteAccountPage.interactive.roleOwner")}</option>
                                                    <option value="coach">{t("deleteAccountPage.interactive.roleCoach")}</option>
                                                    <option value="parent">{t("deleteAccountPage.interactive.roleParent")}</option>
                                                </select>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full h-11 mt-4 rounded-lg bg-[#0ABAB5] text-white font-medium hover:bg-[#0aa19d] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                                {isSubmitting ? t("deleteAccountPage.interactive.loginSubmitting") : t("deleteAccountPage.interactive.loginButton")}
                                            </button>
                                        </form>
                                    )}

                                    {step === "verify" && user && (
                                        <div className="space-y-6">
                                            <div className="text-center space-y-4">
                                                <h3 className="text-xl font-bold text-[#111929]">{t("deleteAccountPage.interactive.userInfoTitle")}</h3>

                                                <div className="flex justify-center">
                                                    {user.image?.path ? (
                                                        <img src={`https://image.classz.co/${user.image.path}`} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-sm" />
                                                    ) : user.image?.url ? (
                                                        <img src={user.image.url} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-sm" />
                                                    ) : (
                                                        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border-4 border-white shadow-sm">
                                                            <span className="text-2xl font-bold text-slate-400">{user.fullname.charAt(0).toUpperCase()}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <p className="font-semibold text-lg text-[#111929]">{user.fullname}</p>
                                                    <p className="text-sm text-[#485A69]">{user.email}</p>
                                                    <span className="inline-block mt-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium uppercase tracking-wider">
                                                        {t(`deleteAccountPage.interactive.role${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-sm text-red-800 text-center">
                                                {t("deleteAccountPage.interactive.modalDesc")}
                                            </div>

                                            <button
                                                onClick={() => setShowConfirmModal(true)}
                                                className="w-full h-11 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                                            >
                                                {t("deleteAccountPage.interactive.confirmDeleteButton")}
                                            </button>
                                        </div>
                                    )}

                                </div>
                            </div>
                        </div>
                    </section>
                )}

                <PolicyNavigation align="center" title={t("deleteAccountPage.relatedPolicies")} titleSize="xl" />
                <Footer />
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 md:p-8 space-y-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>

                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-bold text-[#111929]">{t("deleteAccountPage.interactive.modalTitle")}</h3>
                                <p className="text-[#485A69] text-sm leading-relaxed">
                                    {t("deleteAccountPage.interactive.modalDesc")}
                                </p>
                            </div>

                            <div className="space-y-3 pt-4">
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="w-full h-12 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {isDeleting ? t("deleteAccountPage.interactive.deleting") : t("deleteAccountPage.interactive.modalConfirmButton")}
                                </button>
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    disabled={isDeleting}
                                    className="w-full h-12 rounded-lg bg-white border border-[#E9E9E9] text-[#485A69] font-medium hover:bg-slate-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {t("deleteAccountPage.interactive.cancelButton")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </main>
    )
}
