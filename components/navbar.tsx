"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import {
  Menu,
  Calendar,
  Bell,
  MessageSquare,
  Fingerprint,
  Globe,
  FileText,
  HelpCircle,
  ChevronRight,
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"

const MAIN_LINKS = [
  { key: "nav.home", href: "/" },
  { key: "nav.aboutUs", href: "/our-mission" },
  { key: "nav.programs", href: "/programs" },
  { key: "nav.workshops", href: "/workshops" },
] as const

export function Navbar() {
  const pathname = usePathname()
  const { setLocale, t } = useLanguage()

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href))

  const quickLinks = [
    { key: "nav.schedule", href: "/schedule", icon: Calendar },
    { key: "nav.notifications", href: "/notifications", icon: Bell },
    { key: "nav.inbox", href: "/inbox", icon: MessageSquare },
    { key: "nav.changePassword", href: "/change-password", icon: Fingerprint },
    { key: "nav.terms", href: "/terms", icon: FileText },
    { key: "nav.helpCentre", href: "/faqs", icon: HelpCircle },
  ]

  return (
    <nav
      aria-label="Main"
      className="relative z-50 bg-[linear-gradient(180deg,#FFFFFF_0%,rgba(255,255,255,0)_91%)]"
    >
      <div className="flex items-center justify-between gap-4 px-6 pt-8">
        {/* Hamburger + logo (Figma "Logo bar") */}
        <div className="flex items-center gap-5">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                aria-label={t("nav.openMenu")}
                className="rounded-md p-1 text-ink transition-colors hover:text-classz-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-classz-400"
              >
                <Menu className="h-8 w-8" strokeWidth={1.5} />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                sideOffset={24}
                align="start"
                className="z-[100] w-64 rounded-xl border-0 bg-white p-8 shadow-[0_6px_16px_2px_rgba(0,0,0,0.12)]"
              >
                <div className="flex flex-col gap-5">
                  {quickLinks.map(({ key, href, icon: Icon }) => (
                    <DropdownMenu.Item asChild key={key}>
                      <Link
                        href={href}
                        className="flex h-11 cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-base text-ink outline-none data-[highlighted]:bg-[#F5F5F5]"
                      >
                        <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center">
                          <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                        </span>
                        {t(key)}
                      </Link>
                    </DropdownMenu.Item>
                  ))}
                  <DropdownMenu.Sub>
                    <DropdownMenu.SubTrigger className="flex h-11 cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-base text-ink outline-none data-[highlighted]:bg-[#F5F5F5]">
                      <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center">
                        <Globe className="h-4 w-4" strokeWidth={1.5} />
                      </span>
                      {t("nav.language")}
                      <ChevronRight className="ml-auto h-4 w-4 text-shade-400" />
                    </DropdownMenu.SubTrigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.SubContent
                        sideOffset={4}
                        className="z-[101] rounded-lg bg-white p-2 shadow-[0_6px_16px_2px_rgba(0,0,0,0.12)]"
                      >
                        <DropdownMenu.Item
                          onSelect={() => setLocale("en")}
                          className="flex h-9 cursor-pointer items-center rounded px-3 text-sm text-ink outline-none data-[highlighted]:bg-[#F5F5F5]"
                        >
                          {t("english")}
                        </DropdownMenu.Item>
                        <DropdownMenu.Item
                          onSelect={() => setLocale("zh-TW")}
                          className="flex h-9 cursor-pointer items-center rounded px-3 text-sm text-ink outline-none data-[highlighted]:bg-[#F5F5F5]"
                        >
                          {t("chinese")}
                        </DropdownMenu.Item>
                      </DropdownMenu.SubContent>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Sub>
                </div>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <Link href="/" className="flex items-center gap-2 px-2" aria-label="ClassZ">
            <img src="/brand/logo-icon.svg" alt="" className="h-8 w-auto" />
            <img src="/brand/logo-wordmark.svg" alt="ClassZ" className="h-[18px] w-auto" />
          </Link>
        </div>

        {/* Links + Log In (Figma "Selection") */}
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-6 overflow-x-auto md:gap-10">
            {MAIN_LINKS.map(({ key, href }) => (
              <Link
                key={key}
                href={href}
                className="group flex flex-col items-center gap-2.5 whitespace-nowrap text-base text-ink"
              >
                <span>{t(key)}</span>
                <span
                  aria-hidden
                  className={`h-px w-full ${
                    isActive(href) ? "bg-ink" : "bg-transparent group-hover:bg-ink/40"
                  }`}
                />
              </Link>
            ))}
          </div>
          <Link
            href="/login"
            className="whitespace-nowrap text-base font-semibold text-ink transition-colors hover:text-classz-400"
          >
            {t("nav.login")}
          </Link>
        </div>
      </div>
    </nav>
  )
}
