"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Menu,
  Calendar,
  Globe,
  FileText,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";

const MAIN_LINKS: { key: string; href: string; match?: string[] }[] = [
  { key: "nav.home", href: "/" },
  { key: "nav.aboutUs", href: "/our-mission" },
  // Two separate discovery flows since 2026-08-27 (reverses the 08-25
  // merge): Centre /centres → /centres/[id], Programs /programs →
  // /programs/[id]. Centres placed between Workshops and Programmes per
  // user instruction — NOT the nav capture 2596:12227 4-item order;
  // spec-silent, user-directed placement.
  { key: "nav.workshops", href: "/workshops" },
  { key: "nav.centres", href: "/centres" },
  { key: "nav.programs", href: "/programs" },
  // ZPassport — not in the nav capture either (user-directed, spec-silent);
  // placeholder destination /login until the ZPassport product page exists.
  { key: "nav.zPassport", href: "/login" },
];

export function Navbar() {
  const pathname = usePathname();
  const { setLocale, t } = useLanguage();

  // lg+ → inline menu visible; main links are conditionally excluded from
  // the dropdown (display:none items would still register in Radix's
  // collection and degrade arrow-key nav). Dropdown content only renders
  // when open, so there is no SSR flash.
  const [showMenuLinksInDropdown, setShowMenuLinksInDropdown] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setShowMenuLinksInDropdown(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Scroll-appearing navbar: solid white + shadow fades in once the page is
  // scrolled (the hamburger/logo stays pinned top). User-directed 2026-08-26.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string, extra: string[] = []) =>
    [href, ...extra].some((path) =>
      path === "/" ? pathname === "/" : pathname.startsWith(path),
    );

  const quickLinks = [
    { key: "nav.schedule", href: "/schedule", icon: Calendar },
    { key: "nav.terms", href: "/terms", icon: FileText },
    { key: "nav.helpCentre", href: "/faqs", icon: HelpCircle },
  ];

  // Stagger offset: quick links + language start after the main links when
  // they are rendered in the dropdown (below lg).
  const mainCount = showMenuLinksInDropdown ? MAIN_LINKS.length : 0;

  return (
    <nav
      aria-label="Main"
      className={`sticky top-0 z-50 w-full transition-all duration-300 lg:mx-auto lg:max-w-[1440px] ${
        scrolled
          ? "bg-white shadow-[0_4px_25px_rgba(0,0,0,0.12)]"
          : "bg-[linear-gradient(180deg,#FFFFFF_0%,rgba(255,255,255,0)_91%)]"
      }`}
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
                {/* Hamburger menu 2596:12217 — 32×32 hit area, sized to match
                    the 27×32 logo mark (user "just as big as the logo",
                    2026-08-26); glyph 32×32, stroke 1.5 (lucide substitution) */}
                <Menu className="h-8 w-8" strokeWidth={1.5} />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                sideOffset={24}
                align="start"
                className="nav-dropdown z-[100] w-64 rounded-xl border-0 bg-white p-8 shadow-[0_6px_16px_2px_rgba(0,0,0,0.12)]"
              >
                <div className="flex flex-col gap-5">
                  {/* Main links below lg (the inline bar is lg+).
                      Conditional render, not CSS hiding — see the matchMedia
                      note above. Active page gets the site's 590 weight;
                      divider separates from the utility quick links. */}
                  {showMenuLinksInDropdown ? (
                    <div className="flex flex-col gap-5">
                      {MAIN_LINKS.map(({ key, href, match }, i) => (
                        <DropdownMenu.Item asChild key={key}>
                          <Link
                            href={href}
                            style={{ animationDelay: `${i * 35}ms` }}
                            className={`nav-menu-item flex h-11 cursor-pointer items-center rounded-lg px-2.5 text-base text-ink outline-none data-[highlighted]:bg-[#F5F5F5] ${
                              isActive(href, match) ? "font-[590]" : ""
                            }`}
                          >
                            {t(key)}
                          </Link>
                        </DropdownMenu.Item>
                      ))}
                      <div className="h-px bg-[#EBEBEB]" aria-hidden />
                    </div>
                  ) : null}
                  {quickLinks.map(({ key, href, icon: Icon }, i) => (
                    <DropdownMenu.Item asChild key={key}>
                      <Link
                        href={href}
                        style={{ animationDelay: `${(mainCount + i) * 35}ms` }}
                        className="nav-menu-item flex h-11 cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-base text-ink outline-none data-[highlighted]:bg-[#F5F5F5]"
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
                    <DropdownMenu.SubTrigger
                      style={{
                        animationDelay: `${(mainCount + quickLinks.length) * 35}ms`,
                      }}
                      className="nav-menu-item flex h-11 cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-base text-ink outline-none data-[highlighted]:bg-[#F5F5F5]"
                    >
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

        {/* Selection 2596:12226 — gap 48; menu 2596:12227 gap 39.9; items: 16px/400 + 1px underline (active only — landing capture 2596:12491 visible, rest hidden). Inline menu is lg+ only: 6 links (flow split 2026-08-27 added Centres back) ≈ 580px + logo + Log In don't fit below 1024 (user pick A, 2026-08-25 — main links join the hamburger menu below lg, see dropdown). */}
        <div className="flex items-center gap-12">
          <div className="hidden items-center lg:flex lg:gap-[39.9px]">
            {MAIN_LINKS.map(({ key, href, match }) => (
              <Link
                key={key}
                href={href}
                className="group flex flex-col items-center gap-2.5 whitespace-nowrap text-[16px] leading-[19px] text-ink"
              >
                <span>{t(key)}</span>
                <span
                  aria-hidden
                  className={`h-px w-full ${
                    isActive(href, match)
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
            className="flex h-[30px] items-start whitespace-nowrap text-[16px] leading-[19px] font-[590] text-ink transition-colors hover:text-classz-400"
          >
            {t("nav.login")}
          </Link>
        </div>
      </div>
    </nav>
  );
}
