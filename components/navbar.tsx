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
    <nav className="relative z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo - Always on the left */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <img src="/logoWeb.png" alt="ClassZ" className="h-10 sm:h-12 w-auto object-contain" />
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
          <div className="relative">
            <button
              className="flex items-center gap-1 hover:text-[#00C9B7] transition-colors"
              onClick={() => setLangOpen((v) => !v)}
            >
              {locale === "en" ? t("english") : t("chinese")}
              <ChevronDown className="w-4 h-4" />
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 w-32 rounded-md border border-slate-200 bg-white shadow-md">
                <button
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
                  onClick={() => {
                    setLocale("en")
                    setLangOpen(false)
                  }}
                >
                  {t("english")}
                </button>
                <button
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
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

        {/* Mobile Menu Button - Only visible on mobile, always on the right */}
        <button
          className="md:hidden p-2 text-slate-600 flex-shrink-0"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile panel */}
      {open && (
        <div className="md:hidden bg-white/95 backdrop-blur border-t border-slate-100 shadow-sm">
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
            <div className="pt-2 flex gap-2">
              <button
                className={`flex-1 px-3 py-2 rounded-md border ${locale === "en" ? "border-[#00C9B7] text-[#00C9B7]" : "border-slate-200 text-slate-700"}`}
                onClick={() => {
                  setLocale("en")
                  setOpen(false)
                }}
              >
                {t("english")}
              </button>
              <button
                className={`flex-1 px-3 py-2 rounded-md border ${locale === "zh-TW" ? "border-[#00C9B7] text-[#00C9B7]" : "border-slate-200 text-slate-700"}`}
                onClick={() => {
                  setLocale("zh-TW")
                  setOpen(false)
                }}
              >
                {t("chinese")}
              </button>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Link href="#" className="text-sm font-medium text-slate-900 hover:text-[#00C9B7]" onClick={() => setOpen(false)}>
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
