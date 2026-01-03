"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, ChevronDown } from "lucide-react"
import { useState } from "react"
import { useLanguage } from "@/components/language-provider"

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const pathname = usePathname()
  const { locale, setLocale, t } = useLanguage()
  const isActive = (path: string) => (path === "/" ? pathname === "/" : pathname.startsWith(path))

  const linkClasses = (path: string) =>
    `${isActive(path) ? "text-[#00C9B7]" : "text-slate-600"} hover:text-[#00C9B7] transition-colors`

  return (
    <nav className="relative z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 overflow-visible">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between relative overflow-visible">
        {/* Logo - Always on the left */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 z-10 max-w-[40%] md:max-w-none">
          <img src="/logoWeb.png" alt="ClassZ" className="h-8 sm:h-10 md:h-12 w-auto object-contain" />
        </Link>

        {/* Desktop Links - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 flex-1 justify-center">
          <Link href="/our-mission" className={linkClasses("/our-mission")}>
            {t("ourMission")}
          </Link>
          <Link href="/our-features" className={linkClasses("/our-features")}>
            {t("ourFeatures")}
          </Link>
          <Link href="/partnership" className={linkClasses("/partnership")}>
            {t("partnership")}
          </Link>
          <Link href="/contact-us" className={linkClasses("/contact-us")}>
            {t("contactUs")}
          </Link>
          <Link href="/faqs" className={linkClasses("/faqs")}>
            {t("faqs")}
          </Link>
          <div className="relative z-50">
            <button
              className="flex items-center gap-1 hover:text-[#00C9B7] transition-colors"
              onClick={() => setLangOpen((v) => !v)}
              onBlur={(e) => {
                // Close dropdown when clicking outside
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setTimeout(() => setLangOpen(false), 200)
                }
              }}
            >
              {locale === "en" ? t("english") : t("chinese")}
              <ChevronDown className={`w-4 h-4 transition-transform ${langOpen ? "rotate-180" : ""}`} />
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 w-32 rounded-md border border-slate-200 bg-white shadow-lg z-[60] min-w-[120px]">
                <button
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors first:rounded-t-md last:rounded-b-md"
                  onClick={() => {
                    setLocale("en")
                    setLangOpen(false)
                  }}
                >
                  {t("english")}
                </button>
                <button
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors first:rounded-t-md last:rounded-b-md"
                  onClick={() => {
                    setLocale("zh-TW")
                    setLangOpen(false)
                  }}
                >
                  {t("chinese")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Actions - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-4 flex-shrink-0">
          <Link href="#" className="text-sm font-medium text-slate-900 hover:text-[#00C9B7] whitespace-nowrap">
            {t("login")}
          </Link>
          <Button className="bg-[#00C9B7] hover:bg-[#00b3a3] text-white rounded-full px-6 whitespace-nowrap">
            {t("getStarted")}
          </Button>
        </div>

        {/* Mobile: Language Dropdown + Menu Button - Always visible */}
        <div className="md:hidden flex items-center gap-1.5 sm:gap-2 flex-shrink-0 z-50 relative">
          {/* Language Dropdown - Always visible on mobile */}
          <div className="relative z-50">
            <button
              className="flex items-center gap-1 px-2 py-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-[#00C9B7] transition-colors rounded-md hover:bg-slate-50 whitespace-nowrap"
              onClick={(e) => {
                e.stopPropagation()
                setLangOpen((v) => !v)
              }}
              onBlur={(e) => {
                // Close dropdown when clicking outside
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setTimeout(() => setLangOpen(false), 200)
                }
              }}
            >
              <span className="text-xs sm:text-sm">{locale === "en" ? t("english") : t("chinese")}</span>
              <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${langOpen ? "rotate-180" : ""}`} />
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 w-28 sm:w-32 rounded-md border border-slate-200 bg-white shadow-xl z-[100] min-w-[100px]">
                <button
                  className="block w-full text-left px-3 py-2 text-xs sm:text-sm hover:bg-slate-50 transition-colors first:rounded-t-md last:rounded-b-md"
                  onClick={() => {
                    setLocale("en")
                    setLangOpen(false)
                  }}
                >
                  {t("english")}
                </button>
                <button
                  className="block w-full text-left px-3 py-2 text-xs sm:text-sm hover:bg-slate-50 transition-colors first:rounded-t-md last:rounded-b-md"
                  onClick={() => {
                    setLocale("zh-TW")
                    setLangOpen(false)
                  }}
                >
                  {t("chinese")}
                </button>
              </div>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button
            className="p-2 text-slate-600 flex-shrink-0 relative z-10"
            onClick={() => {
              setOpen((v) => !v)
              setLangOpen(false) // Close language dropdown when opening menu
            }}
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {open && (
        <div className="md:hidden bg-white/95 backdrop-blur border-t border-slate-100 shadow-sm relative z-40">
          <div className="px-4 py-4 space-y-3 text-sm font-medium text-slate-700">
            <NavLinkMobile href="/our-mission" active={isActive("/our-mission")} onClick={() => setOpen(false)}>
              {t("ourMission")}
            </NavLinkMobile>
            <NavLinkMobile href="/our-features" active={isActive("/our-features")} onClick={() => setOpen(false)}>
              {t("ourFeatures")}
            </NavLinkMobile>
            <NavLinkMobile href="/partnership" active={isActive("/partnership")} onClick={() => setOpen(false)}>
              {t("partnership")}
            </NavLinkMobile>
            <NavLinkMobile href="/contact-us" active={isActive("/contact-us")} onClick={() => setOpen(false)}>
              {t("contactUs")}
            </NavLinkMobile>
            <NavLinkMobile href="/faqs" active={isActive("/faqs")} onClick={() => setOpen(false)}>
              {t("faqs")}
            </NavLinkMobile>
            
            <div className="pt-2 flex flex-col gap-2">
              <Link href="#" className="text-sm font-medium text-slate-900 hover:text-[#00C9B7] transition-colors" onClick={() => setOpen(false)}>
                {t("login")}
              </Link>
              <Button className="bg-[#00C9B7] hover:bg-[#00b3a3] text-white rounded-full w-full" onClick={() => setOpen(false)}>
                {t("getStarted")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

function NavLinkMobile({
  href,
  children,
  active,
  onClick,
}: {
  href: string
  children: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block ${active ? "text-[#00C9B7]" : "text-slate-700"} hover:text-[#00C9B7] transition-colors`}
    >
      {children}
    </Link>
  )
}
