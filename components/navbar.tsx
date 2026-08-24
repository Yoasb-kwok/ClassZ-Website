"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
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
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";

const MAIN_LINKS = [
  { key: "nav.home", href: "/" },
  { key: "nav.aboutUs", href: "/our-mission" },
  { key: "nav.programs", href: "/programs" },
  { key: "nav.workshops", href: "/workshops" },
  // W10 flow wiring — "Centres" is not in the 2596:12227 capture (4 items);
  // appended after Workshops so the captured order stays intact.
  { key: "nav.centres", href: "/centres" },
  // ZPassport — not in the nav capture either (user-directed, spec-silent);
  // placeholder destination /login until the ZPassport product page exists.
  { key: "nav.zPassport", href: "/login" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const { setLocale, t } = useLanguage();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const quickLinks = [
    { key: "nav.schedule", href: "/schedule", icon: Calendar },
    { key: "nav.notifications", href: "/notifications", icon: Bell },
    { key: "nav.inbox", href: "/inbox", icon: MessageSquare },
    { key: "nav.changePassword", href: "/change-password", icon: Fingerprint },
    { key: "nav.terms", href: "/terms", icon: FileText },
    { key: "nav.helpCentre", href: "/faqs", icon: HelpCircle },
  ];

  return (
    <nav
      aria-label="Main"
      className="relative z-50 overflow-hidden bg-[linear-gradient(180deg,#FFFFFF_0%,rgba(255,255,255,0)_91%)]"
    >
      {/* node 2596:12215 — 1440×64, pad 32/24/0/24, gradient #FFF→transparent 91%, overflow hidden */}
      <div className="flex items-center justify-between px-6 pt-8">
        {/* Logo bar 2596:12216 — gap 19.94795036315918 */}
        <div className="flex items-center gap-[19.94795036315918px]">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                aria-label={t("nav.openMenu")}
                className="flex h-8 w-8 items-center justify-center text-ink transition-colors hover:text-classz-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-classz-400"
              >
                {/* Hamburger menu 2596:12217 — 32×32 hit area; Hamburger_MD glyph 18.67×13.33, stroke 1.07 (lucide substitution) */}
                <Menu className="h-[13.33px] w-[18.67px]" strokeWidth={1.07} />
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
                          <Icon
                            className="h-[18px] w-[18px]"
                            strokeWidth={1.5}
                          />
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

          {/* Frame 2147224368 — gap 8, pad 8; mark 26.67×32, wordmark 70×18.19 (#0ABAB5) */}
          <Link
            href="/"
            className="flex items-center gap-2 px-2"
            aria-label="ClassZ"
          >
            <img src="/brand/logo-icon.svg" alt="" className="h-8 w-auto" />
            <img
              src="/brand/logo-wordmark.svg"
              alt="ClassZ"
              className="h-[18.19px] w-auto"
            />
          </Link>
        </div>

        {/* Selection 2596:12226 — gap 48; menu 2596:12227 gap 39.9; items: 16px/400 + 1px underline (active only — landing capture 2596:12491 visible, rest hidden) */}
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-6 overflow-x-auto md:gap-[39.9px]">
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
                    isActive(href)
                      ? "bg-ink"
                      : "bg-transparent group-hover:bg-ink/40"
                  }`}
                />
              </Link>
            ))}
          </div>
          {/* Log In 2596:12241 — 16px, weight 590 */}
          <Link
            href="/login"
            className="whitespace-nowrap text-base font-[590] text-ink transition-colors hover:text-classz-400"
          >
            {t("nav.login")}
          </Link>
        </div>
      </div>
    </nav>
  );
}
