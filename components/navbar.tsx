"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import { useAuthModal } from "@/components/auth-modal";
import {
  CLASSZ_SESSION_EVENT,
  clearClasszSession,
  getClasszSession,
  homePathForRole,
  type ClasszSession,
} from "@/lib/classz-auth";
import {
  CLASSZ_SURFACE_EVENT,
  homePathForSurface,
  navLinksForSurface,
  rememberSurface,
  resolveSurface,
  surfaceFromPath,
  type ClasszSurface,
} from "@/lib/classz-site";

function initials(name?: string) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "U";
  return ((parts[0][0] || "") + (parts[1]?.[0] || "")).toUpperCase();
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, setLocale, t } = useLanguage();
  const { openAuth } = useAuthModal();
  const [session, setSession] = useState<ClasszSession | null>(null);
  const [surface, setSurface] = useState<ClasszSurface>(
    () => surfaceFromPath(pathname || "/") ?? "info",
  );
  const links = useMemo(() => navLinksForSurface(surface), [surface]);
  const homeHref = homePathForSurface(surface);

  useEffect(() => {
    const sync = () => setSession(getClasszSession());
    sync();
    window.addEventListener(CLASSZ_SESSION_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CLASSZ_SESSION_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    const path = pathname || "/";
    const exclusive = surfaceFromPath(path);
    if (exclusive) rememberSurface(exclusive);
    const sync = () => setSurface(resolveSurface(path));
    sync();
    window.addEventListener(CLASSZ_SURFACE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CLASSZ_SURFACE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [pathname]);

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

  const pathOf = (href: string) => href.split("#")[0] || "/";

  const isActive = (href: string, extra: string[] = []) =>
    [href, ...extra].some((path) => {
      const p = pathOf(path);
      if (p === "/") return pathname === p;
      return pathname === p || Boolean(pathname?.startsWith(`${p}/`));
    });

  const quickLinks = [
    { key: "nav.schedule", href: "/schedule", icon: Calendar },
    { key: "nav.notifications", href: "/notifications", icon: Bell },
    { key: "nav.inbox", href: "/inbox", icon: MessageSquare },
    { key: "nav.changePassword", href: "/change-password", icon: Fingerprint },
    { key: "nav.terms", href: "/terms", icon: FileText },
    { key: "nav.helpCentre", href: "/faqs", icon: HelpCircle },
  ];

  // Stagger offset: quick links + language start after the main links when
  // they are rendered in the dropdown (below lg).
  const mainCount = showMenuLinksInDropdown ? links.length : 0;

  return (
    <nav
      aria-label="Main"
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white shadow-[0_4px_25px_rgba(0,0,0,0.12)]"
          : "bg-[linear-gradient(180deg,#FFFFFF_0%,rgba(255,255,255,0)_91%)]"
      }`}
    >
      <div className="flex h-[72px] items-center justify-between px-6">
        <div className="flex h-full items-center gap-[19.94795036315918px]">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                aria-label={t("nav.openMenu")}
                className="flex h-8 w-8 items-center justify-center text-ink transition-colors hover:text-classz-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-classz-400"
              >
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
                  {showMenuLinksInDropdown ? (
                    <div className="flex flex-col gap-5">
                      {links.map((link, i) => (
                        <DropdownMenu.Item
                          asChild
                          key={`${surface}-${link.key}`}
                        >
                          <Link
                            href={link.href}
                            style={{ animationDelay: `${i * 35}ms` }}
                            className={`nav-menu-item flex h-11 cursor-pointer items-center rounded-lg px-2.5 text-base outline-none ${
                              link.cta
                                ? "justify-center bg-[#222] font-[590] text-white data-[highlighted]:bg-[#111]"
                                : `text-ink data-[highlighted]:bg-[#F5F5F5] ${isActive(link.href, link.match) ? "font-[590]" : ""}`
                            }`}
                          >
                            {t(link.key)}
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

          <Link
            href={homeHref}
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

        <div className="flex h-full items-center gap-6 lg:gap-[39.9px]">
          <div className="hidden h-full items-center lg:flex lg:gap-[39.9px]">
            {links
              .filter((link) => !link.cta)
              .map((link) => (
                <DesktopNavLink
                  key={`${surface}-${link.key}`}
                  href={link.href}
                  label={t(link.key)}
                  active={isActive(link.href, link.match)}
                />
              ))}
          </div>
          <LanguageMenu
            label={t("nav.language")}
            englishLabel={t("english")}
            chineseLabel={t("chinese")}
            locale={locale}
            onSelect={setLocale}
          />
          {links
            .filter((link) => link.cta)
            .map((link) => (
              <Link
                key={`${surface}-${link.key}`}
                href={link.href}
                className="flex h-9 shrink-0 items-center rounded-full bg-[#222] px-5 text-[16px] leading-[19px] font-[590] whitespace-nowrap text-white transition-opacity hover:opacity-90"
              >
                {t(link.key)}
              </Link>
            ))}
          {session ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  aria-label={t("nav.profile")}
                  className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#d7f4f3] text-sm font-[590] text-[#099a96] ring-1 ring-black/5 transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-classz-400"
                >
                  {session.user.role === "student" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src="/images/profile-parent.png"
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials(session.user.name)
                  )}
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={8}
                  className="z-[100] min-w-[160px] rounded-xl bg-white p-2 shadow-[0_6px_16px_2px_rgba(0,0,0,0.12)]"
                >
                  <DropdownMenu.Item asChild>
                    <Link
                      href={
                        session.user.role === "student"
                          ? "/account/profile"
                          : homePathForRole(session.user.role)
                      }
                      className="flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm text-ink outline-none data-[highlighted]:bg-[#F5F5F5]"
                    >
                      {t("nav.profile")}
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onSelect={() => {
                      clearClasszSession();
                      router.push(homeHref);
                    }}
                    className="flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm text-ink outline-none data-[highlighted]:bg-[#F5F5F5]"
                  >
                    {t("nav.logout")}
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : (
            <button
              type="button"
              onClick={() => openAuth("login")}
              className="flex h-9 shrink-0 items-center rounded-full bg-[#0abab5] px-5 text-[16px] leading-[19px] font-[590] whitespace-nowrap text-white transition-colors hover:bg-[#089591]"
            >
              {t("nav.login")}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

function DesktopNavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="group relative flex h-[19px] items-center whitespace-nowrap text-[16px] leading-[19px] text-ink"
    >
      <span>{label}</span>
      <span
        aria-hidden
        className={`absolute inset-x-0 bottom-0 h-px ${
          active ? "bg-ink" : "bg-transparent group-hover:bg-ink/40"
        }`}
      />
    </Link>
  );
}

function LanguageMenu({
  label,
  englishLabel,
  chineseLabel,
  locale,
  onSelect,
}: {
  label: string;
  englishLabel: string;
  chineseLabel: string;
  locale: "en" | "zh-TW";
  onSelect: (locale: "en" | "zh-TW") => void;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={label}
          className="flex h-8 w-8 shrink-0 items-center justify-center text-ink transition-colors hover:text-classz-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-classz-400"
        >
          <Globe className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-[100] min-w-[140px] rounded-xl bg-white p-2 shadow-[0_6px_16px_2px_rgba(0,0,0,0.12)]"
        >
          <DropdownMenu.Item
            onSelect={() => onSelect("en")}
            className={`flex h-9 cursor-pointer items-center rounded-lg px-3 text-sm text-ink outline-none data-[highlighted]:bg-[#F5F5F5] ${
              locale === "en" ? "font-[590]" : ""
            }`}
          >
            {englishLabel}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={() => onSelect("zh-TW")}
            className={`flex h-9 cursor-pointer items-center rounded-lg px-3 text-sm text-ink outline-none data-[highlighted]:bg-[#F5F5F5] ${
              locale === "zh-TW" ? "font-[590]" : ""
            }`}
          >
            {chineseLabel}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
