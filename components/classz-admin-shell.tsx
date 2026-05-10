"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut, Menu, X, PanelLeft } from "lucide-react"
import { useState } from "react"
import { clearClasszSession, getClasszSession } from "@/lib/classz-auth"
import { useLanguage } from "@/components/language-provider"
import { getAdminNavGroups, isAdminNavPathActive } from "@/lib/classz-admin-nav"
import { adminSurface } from "@/components/classz-admin-ui"

export function ClasszAdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || ""
  const router = useRouter()
  const { locale, t } = useLanguage()
  const zh = locale === "zh-TW"
  const session = getClasszSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const groups = getAdminNavGroups()

  return (
    <div className={`h-[100dvh] flex flex-col font-sans antialiased ${adminSurface} text-classz-700 overflow-hidden`}>
      <header
        className={`h-16 shrink-0 flex items-center justify-between px-4 sm:px-6 border-b border-classz-200 bg-classz-50/90 backdrop-blur-sm shadow-sm text-base`}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="lg:hidden p-2 rounded-md text-classz-700 hover:bg-classz-100 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-classz-400 focus-visible:ring-offset-2"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Menu"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link href="/" className="font-bold text-classz-600 tracking-tight text-xl">
            ClassZ
          </Link>
          <span className="hidden sm:inline text-sm text-classz-600 px-2.5 py-1 rounded-full bg-white border border-classz-200">
            {session?.user.role === "center_admin" ? t("classzAdmin.roleCenter") : t("classzAdmin.roleCoach")}
          </span>
        </div>
        <div className="flex items-center gap-3 text-base">
          <span className="text-classz-700 truncate max-w-[10rem] sm:max-w-[16rem]">{session?.user.name}</span>
          <button
            type="button"
            onClick={() => {
              clearClasszSession()
              router.push("/login")
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-base font-medium text-white bg-classz-500 hover:bg-classz-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-classz-400 focus-visible:ring-offset-2"
          >
            <LogOut className="h-5 w-5" />
            <span className="hidden sm:inline">{t("classzAdmin.logout")}</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside
          className={`
            hidden lg:flex lg:flex-col lg:w-64 lg:flex-shrink-0 lg:overflow-y-auto lg:overscroll-contain
            bg-white/90 backdrop-blur-sm shadow-sm border-r border-classz-200 pt-2 pb-6
          `}
        >
          <nav className="mt-3 px-2 space-y-1">
            {groups.map((g) => (
              <div key={g.titleEn} className="mb-3 last:mb-0">
                <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-classz-600">
                  {zh ? g.titleZh : g.titleEn}
                </p>
                <div className="space-y-1">
                  {g.items.map((item) => {
                    const label = zh ? item.labelZh : item.labelEn
                    const active = isAdminNavPathActive(pathname, item.path)
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        className={`group flex items-center px-3 py-2.5 text-base font-medium rounded-md transition-colors ${
                          active
                            ? "bg-classz-100 text-classz-700"
                            : "text-classz-700 hover:bg-classz-50 hover:text-classz-700"
                        }`}
                      >
                        <Icon
                          className={`mr-3 h-5 w-5 md:h-6 md:w-6 flex-shrink-0 ${
                            active ? "text-classz-500" : "text-classz-400 group-hover:text-classz-500"
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
        </aside>

        <aside
          className={`
            fixed lg:hidden inset-y-0 left-0 z-40 w-64 max-w-[85vw] bg-white shadow-lg flex flex-col border-r border-classz-200
            transform transition-transform duration-200 ease-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b border-classz-200 flex-shrink-0 bg-classz-50/80">
            <span className="text-base font-semibold text-classz-700">{t("classzAdmin.sidebarMenu")}</span>
            <button
              type="button"
              className="p-2 text-classz-600 hover:text-classz-700 rounded-md hover:bg-classz-100"
              onClick={() => setSidebarOpen(false)}
            >
              <PanelLeft className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto overscroll-contain px-2 py-4 space-y-1">
            {groups.map((g) => (
              <div key={g.titleEn} className="mb-3 last:mb-0">
                <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-classz-600">
                  {zh ? g.titleZh : g.titleEn}
                </p>
                <div className="space-y-1">
                  {g.items.map((item) => {
                    const label = zh ? item.labelZh : item.labelEn
                    const active = isAdminNavPathActive(pathname, item.path)
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`group flex items-center px-3 py-2.5 text-base font-medium rounded-md transition-colors ${
                          active
                            ? "bg-classz-100 text-classz-700"
                            : "text-classz-700 hover:bg-classz-50 hover:text-classz-700"
                        }`}
                      >
                        <Icon
                          className={`mr-3 h-5 w-5 md:h-6 md:w-6 flex-shrink-0 ${
                            active ? "text-classz-500" : "text-classz-400 group-hover:text-classz-500"
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
        </aside>

        {sidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-classz-700/40 lg:hidden"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main
          id="main-content"
          className="flex-1 min-w-0 overflow-y-auto overscroll-contain outline-none"
          tabIndex={-1}
        >
          <div className="p-4 sm:p-6 xl:p-8">
            <div className="max-w-7xl mx-auto text-base md:text-[17px] leading-relaxed">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}
