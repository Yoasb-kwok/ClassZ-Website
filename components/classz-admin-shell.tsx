"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut, Menu, X, PanelLeft, Search, Bell, Plus } from "lucide-react"
import { useMemo, useState } from "react"
import { clearClasszSession, getClasszSession } from "@/lib/classz-auth"
import { useLanguage } from "@/components/language-provider"
import { isAdminNavPathActive } from "@/lib/classz-admin-nav"
import { getAdminNavGroupsForRole } from "@/components/admin/use-admin-api"
import { adminSurface } from "@/components/classz-admin-ui"

function initials(name?: string) {
  const parts = String(name || "CZ").trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return "CZ"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase()
}

export function ClasszAdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || ""
  const router = useRouter()
  const { locale, t } = useLanguage()
  const zh = locale === "zh-TW"
  const session = getClasszSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [query, setQuery] = useState("")

  const groups = getAdminNavGroupsForRole(session?.user.role || "center_admin")
  const avatar = useMemo(() => initials(session?.user.name), [session?.user.name])

  const navBlock = (mobile: boolean) => (
    <nav className={`${mobile ? "px-2 py-2" : "mt-1 px-2"} space-y-0.5`}>
      {groups.map((g) => (
        <div key={g.titleEn} className="mb-3 last:mb-0">
          <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-white/35">
            {zh ? g.titleZh : g.titleEn}
          </p>
          <div className="space-y-0.5">
            {g.items.map((item) => {
              const label = zh ? item.labelZh : item.labelEn
              const active = isAdminNavPathActive(pathname, item.path)
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={mobile ? () => setSidebarOpen(false) : undefined}
                  className={`group flex items-center px-2.5 py-1.5 text-[13px] font-medium rounded-lg transition-colors ${
                    active
                      ? "bg-classz-400/20 text-classz-300"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`mr-2 h-3.5 w-3.5 flex-shrink-0 ${
                      active ? "text-classz-400" : "text-white/40 group-hover:text-white/70"
                    }`}
                  />
                  <span className="flex-1 min-w-0 truncate">{label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )

  return (
    <div className={`classz-admin-theme h-[100dvh] flex font-sans antialiased ${adminSurface} overflow-hidden`}>
      <aside className="hidden lg:flex lg:flex-col lg:w-52 lg:flex-shrink-0 lg:overflow-y-auto bg-[#0B1F1E] border-r border-white/5">
        <div className="h-12 shrink-0 flex items-center gap-2 px-3 border-b border-white/5">
          <div className="h-7 w-7 rounded-md bg-classz-400 flex items-center justify-center text-white text-xs font-bold">
            C
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white leading-tight truncate">ClassZ</p>
            <p className="text-[9px] uppercase tracking-wider text-classz-300/80 font-medium">Dashboard</p>
          </div>
        </div>
        {navBlock(false)}
      </aside>

      <aside
        className={`
          fixed lg:hidden inset-y-0 left-0 z-40 w-52 max-w-[85vw] bg-[#0B1F1E] shadow-2xl flex flex-col
          transform transition-transform duration-200 ease-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between h-12 px-3 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-classz-400 flex items-center justify-center text-white text-xs font-bold">
              C
            </div>
            <span className="text-sm font-semibold text-white">{t("classzAdmin.sidebarMenu")}</span>
          </div>
          <button
            type="button"
            className="p-1.5 text-white/60 hover:text-white rounded-lg hover:bg-white/5"
            onClick={() => setSidebarOpen(false)}
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain">{navBlock(true)}</div>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 min-w-0 flex flex-col bg-[#F7FBFB]">
        <header className="h-12 shrink-0 flex items-center gap-2 px-4 sm:px-5 border-b border-classz-100/80 bg-white">
          <button
            type="button"
            className="lg:hidden p-1.5 rounded-lg text-classz-700 hover:bg-classz-50"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Menu"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-classz-600/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={zh ? "搜尋…" : "Search…"}
              className="w-full rounded-lg border border-classz-100 bg-classz-50/50 pl-8 pr-2.5 py-1.5 text-sm text-classz-700 placeholder:text-classz-600/40 focus:outline-none focus:ring-2 focus:ring-classz-300/40 focus:border-classz-300"
            />
          </div>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/admin/bookings"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white bg-classz-400 hover:bg-classz-300 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              {zh ? "新增報名" : "New booking"}
            </Link>
            <button
              type="button"
              className="relative p-1.5 rounded-lg text-classz-600 hover:bg-classz-50"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-classz-400" />
            </button>
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-medium text-classz-700 truncate max-w-[8rem] leading-tight">{session?.user.name}</span>
              <span className="text-[10px] text-classz-600/70 leading-tight">{session?.user.roleLabel}</span>
            </div>
            <div className="h-7 w-7 rounded-full bg-classz-400 text-white text-[10px] font-semibold flex items-center justify-center">
              {avatar}
            </div>
            <button
              type="button"
              onClick={() => {
                clearClasszSession()
                router.push("/login")
              }}
              className="p-1.5 rounded-lg text-classz-600 hover:bg-classz-50"
              aria-label={t("classzAdmin.logout")}
              title={t("classzAdmin.logout")}
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        <main id="main-content" className="flex-1 min-w-0 overflow-y-auto overscroll-contain outline-none" tabIndex={-1}>
          <div className="px-4 py-3 sm:px-5 sm:py-4 lg:px-6">
            <div className="w-full text-sm leading-snug text-classz-700">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}
