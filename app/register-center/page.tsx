"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Building2 } from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { classzRegisterCenterAndSignIn } from "@/lib/classz-auth"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const DISTRICTS = [
  "Central and Western",
  "Eastern",
  "Southern",
  "Wan Chai",
  "Kowloon City",
  "Kwun Tong",
  "Sham Shui Po",
  "Wong Tai Sin",
  "Yau Tsim Mong",
  "Islands",
  "Kwai Tsing",
  "North",
  "Sai Kung",
  "Sha Tin",
  "Tai Po",
  "Tsuen Wan",
  "Tuen Mun",
  "Yuen Long",
]

export default function RegisterCenterPage() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const router = useRouter()
  const [form, setForm] = useState({
    center_name: "",
    district: DISTRICTS[0],
    category: "dance",
    full_name: "",
    email: "",
    mobile: "",
    password: "",
    confirm: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (form.password !== form.confirm) {
      setError(zh ? "密碼不一致" : "Passwords do not match")
      return
    }
    setLoading(true)
    try {
      await classzRegisterCenterAndSignIn({
        center_name: form.center_name.trim(),
        district: form.district,
        category: form.category.trim(),
        email: form.email.trim(),
        password: form.password,
        full_name: form.full_name.trim(),
        mobile: form.mobile.trim() || undefined,
      })
      router.push("/admin")
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : zh ? "註冊失敗" : "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-12rem)] flex items-center justify-center py-12 px-4">
        <div className="max-w-lg w-full space-y-6">
          <div className="text-center space-y-2">
            <Building2 className="h-10 w-10 mx-auto text-classz-500" />
            <h1 className="text-3xl font-bold text-slate-900">{zh ? "中心註冊" : "Register your centre"}</h1>
            <p className="text-sm text-slate-600">
              {zh ? "建立 ClassZ 中心帳戶，待平台審核後即可管理 CRM 與上架課程。" : "Create a ClassZ centre account. Manage your CRM and publish courses after approval."}
            </p>
          </div>
          <form className="space-y-4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm" onSubmit={handleSubmit}>
            {error ? <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div> : null}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{zh ? "中心名稱" : "Centre name"}</label>
              <input className="w-full border border-slate-300 rounded-md px-3 py-2" required value={form.center_name} onChange={(e) => setForm((f) => ({ ...f, center_name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{zh ? "地區" : "District"}</label>
                <select className="w-full border border-slate-300 rounded-md px-3 py-2" value={form.district} onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{zh ? "類別" : "Category"}</label>
                <input className="w-full border border-slate-300 rounded-md px-3 py-2" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{zh ? "管理員姓名" : "Admin name"}</label>
              <input className="w-full border border-slate-300 rounded-md px-3 py-2" required value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" className="w-full border border-slate-300 rounded-md px-3 py-2" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{zh ? "電話" : "Mobile"}</label>
              <input className="w-full border border-slate-300 rounded-md px-3 py-2" value={form.mobile} onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{zh ? "密碼" : "Password"}</label>
                <input type="password" className="w-full border border-slate-300 rounded-md px-3 py-2" required minLength={6} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{zh ? "確認密碼" : "Confirm"}</label>
                <input type="password" className="w-full border border-slate-300 rounded-md px-3 py-2" required value={form.confirm} onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-2.5 rounded-md bg-classz-500 text-white font-medium hover:bg-classz-600 disabled:opacity-60">
              {loading ? (zh ? "提交中…" : "Submitting…") : zh ? "註冊中心" : "Register centre"}
            </button>
            <p className="text-center text-sm text-slate-600">
              {zh ? "已有帳戶？" : "Already have an account?"}{" "}
              <Link href="/login" className="text-classz-600 font-medium hover:underline">{zh ? "登入" : "Sign in"}</Link>
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}
