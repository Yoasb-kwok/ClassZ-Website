"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut, Menu, X, PanelLeft, Search, Bell, Plus } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { clearClasszSession, getClasszSession, readCachedModules, writeCachedModules } from "@/lib/classz-auth"
import { useLanguage } from "@/components/language-provider"
import { isAdminNavPathActive } from "@/lib/classz-admin-nav"
import { filterNavByModules, getAdminNavGroupsForRole } from "@/components/admin/use-admin-api"
import { adminSurface } from "@/components/classz-admin-ui"
import { apiGet } from "@/lib/classz-api-client"

function initials(name?: string) {
  const parts = String(name || "CZ").trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return "CZ"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase()
}

export function ClasszAdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || ""
  const router = useRouter()
  const { locale, setLocale, t } = useLanguage()
  const zh = locale === "zh-TW"
  const session = getClasszSession()
  const demo = !session?.token || session.token === "demo-classz-token"
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [enabledModules, setEnabledModules] = useState<Set<string> | null>(() => {
    if (!session?.token || session.token === "demo-classz-token") return null
    const cached = readCachedModules(session.token)
    return cached ? new Set(cached) : null
  })

  useEffect(() => {
    if (!session?.token || session.token === "demo-classz-token") return
    let cancelled = false
    apiGet<{ modules: string[] }>("/me/modules")
      .then((d) => {
        if (cancelled) return
        const modules = d.modules || []
        writeCachedModules(session.token, modules)
        setEnabledModules(new Set(modules))
      })
      .catch(() => {
        if (cancelled) return
        setEnabledModules((prev) => {
          if (prev) return prev
          writeCachedModules(session.token, [])
          return new Set()
        })
      })
    return () => {
      cancelled = true
    }
  }, [session?.token])

  const groups = useMemo(() => {
    const raw = getAdminNavGroupsForRole(session?.user.role || "center_admin")
    if (demo) return raw
    if (!enabledModules) return []
    return filterNavByModules(raw, enabledModules)
  }, [session?.user.role, enabledModules, demo])
  const avatar = useMemo(() => initials(session?.user.name), [session?.user.name])

  const navBlock = (mobile: boolean) => (
    <nav className={`${mobile ? "px-2 py-2" : "mt-1 px-2"} space-y-0.5`}>
      {!demo && !enabledModules ? (
        <div className="space-y-2 px-2.5 py-2" aria-hidden>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-7 rounded-lg bg-white/10 animate-pulse" />
          ))}
        </div>
      ) : (
        groups.map((g) => (
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
                  className={`group flex items-center rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
                    active
                      ? "bg-white text-[#222]"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`mr-2 h-3.5 w-3.5 flex-shrink-0 ${
                      active ? "text-[#222]" : "text-white/40 group-hover:text-white/70"
                    }`}
                  />
                  <span className="flex-1 min-w-0 truncate">{label}</span>
                </Link>
              )
            })}
          </div>
        </div>
        ))
      )}
    </nav>
  )

  return (
    <div className={`classz-admin-theme h-[100dvh] flex font-sans antialiased ${adminSurface} overflow-hidden`}>
      <aside className="hidden lg:flex lg:flex-col lg:w-56 xl:w-60 lg:flex-shrink-0 lg:overflow-y-auto bg-[var(--admin-sidebar)] border-r border-white/5">
        <div className="h-12 shrink-0 flex items-center gap-2 px-3 border-b border-white/5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-xs font-bold text-[#222]">
            C
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight text-white">ClassZ</p>
            <p className="text-[9px] font-medium uppercase tracking-wider text-white/45">Dashboard</p>
          </div>
        </div>
        {navBlock(false)}
      </aside>

      <aside
        className={`
          fixed lg:hidden inset-y-0 left-0 z-40 w-52 max-w-[85vw] bg-[var(--admin-sidebar)] shadow-2xl flex flex-col
          transform transition-transform duration-200 ease-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between h-12 px-3 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-xs font-bold text-[#222]">
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

      <div className="flex-1 min-w-0 flex flex-col bg-[var(--admin-canvas)]">
        <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-classz-100/80 bg-white px-4 py-2 sm:px-5">
          <button
            type="button"
            className="rounded-lg p-1.5 text-brand-slate hover:bg-classz-50 lg:hidden"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Menu"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          <div className="relative order-3 w-full md:order-none md:flex-1 md:max-w-xl xl:max-w-2xl">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-slate/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={zh ? "搜尋…" : "Search…"}
              className="w-full rounded-lg border border-classz-100 bg-classz-50/50 py-1.5 pl-8 pr-2.5 text-sm text-brand-slate placeholder:text-brand-slate/40 focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
            />
          </div>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <div
              className="inline-flex items-center rounded-lg border border-classz-200 bg-white p-0.5"
              role="group"
              aria-label={zh ? "介面語言" : "Interface language"}
            >
              <button
                type="button"
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  locale === "en" ? "bg-brand-teal text-white" : "text-brand-slate hover:bg-classz-50"
                }`}
                onClick={() => setLocale("en")}
                aria-pressed={locale === "en"}
              >
                EN
              </button>
              <button
                type="button"
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  locale === "zh-TW" ? "bg-brand-teal text-white" : "text-brand-slate hover:bg-classz-50"
                }`}
                onClick={() => setLocale("zh-TW")}
                aria-pressed={locale === "zh-TW"}
              >
                中文
              </button>
            </div>
            <Link
              href="/admin/trials"
              className="hidden items-center gap-1 rounded-lg bg-brand-teal px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:brightness-110 md:inline-flex"
            >
              <Plus className="h-3.5 w-3.5" />
              {zh ? "新增報名" : "New booking"}
            </Link>
            <button
              type="button"
              className="relative rounded-lg p-1.5 text-brand-slate hover:bg-classz-50"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-brand-orange" />
            </button>
            <div className="hidden min-w-0 flex-col items-end lg:flex">
              <span className="max-w-[10rem] truncate text-xs font-medium leading-tight text-brand-slate">{session?.user.name}</span>
              <span className="text-[10px] leading-tight text-brand-slate/70">{session?.user.roleLabel}</span>
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-teal text-[10px] font-semibold text-white">
              {avatar}
            </div>
            <button
              type="button"
              onClick={() => {
                clearClasszSession()
                router.push("/login")
              }}
              className="rounded-lg p-1.5 text-brand-slate hover:bg-classz-50"
              aria-label={t("classzAdmin.logout")}
              title={t("classzAdmin.logout")}
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        <main id="main-content" className="flex-1 min-w-0 overflow-y-auto overscroll-contain outline-none" tabIndex={-1}>
          <div className="px-4 py-3 sm:px-5 sm:py-4 lg:px-6">
            <div className="w-full text-sm leading-snug text-brand-slate">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}
