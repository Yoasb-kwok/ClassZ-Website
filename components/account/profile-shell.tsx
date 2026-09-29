"use client"

import { useRouter } from "next/navigation"
import { Heart, HelpCircle, LogOut, Trash2, UserRound } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/components/language-provider"
import { clearClasszSession, getClasszSession } from "@/lib/classz-auth"

/**
 * ADR-006 D9 — the Profile section's own in-page sidebar (figma 2909
 * "Profile-about_me"): About me / Child profile / Transactions / Favorites +
 * Help centre / Delete account / Log Out. Those last three are LINKS to the
 * existing surfaces — this build does not modify them.
 */

const NAV_ITEMS = [
  { key: "about", href: "/account/profile", labelKey: "account.sidebar.aboutMe" },
  { key: "children", href: "/account/children", labelKey: "account.sidebar.childProfile" },
  { key: "transactions", href: "/account/transactions", labelKey: "account.sidebar.transactions" },
  { key: "favorites", href: "/account/favorites", labelKey: "account.sidebar.favorites", Icon: Heart },
] as const

export function ProfileShell({
  active,
  children,
}: {
  active: "about" | "children" | "transactions" | "favorites"
  children: React.ReactNode
}) {
  const router = useRouter()
  const { t } = useLanguage()
  const session = typeof window !== "undefined" ? getClasszSession() : null
  const initial = (session?.user.name || "P").slice(0, 1).toUpperCase()

  return (
    <main className="min-h-screen bg-white text-ink">
      <Navbar />
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-6 py-10 md:flex-row md:px-12 lg:px-16">
        {/* In-page profile sidebar — NOT the hamburger menu */}
        <aside className="w-full shrink-0 md:w-[240px]">
          <p className="mb-4 text-[22px] font-[weight:590] leading-[26px]">
            {t("account.sidebar.title")}
          </p>
          <nav aria-label={t("account.sidebar.title")} className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ key, href, labelKey, ...rest }) => {
              const Icon = "Icon" in rest ? rest.Icon : UserRound
              const isActive = active === key
              return (
                <a
                  key={key}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[15px] leading-[18px] transition-colors ${
                    isActive
                      ? "bg-[#D7F4F3] font-[weight:590] text-[#0ABAB5]"
                      : "text-ink hover:bg-[#F5F5F5]"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
                  {t(labelKey)}
                </a>
              )
            })}
          </nav>

          <div className="mt-6 flex flex-col gap-1 border-t border-[#EBEBEB] pt-4">
            <a
              href="/faqs"
              className="flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[15px] leading-[18px] text-ink transition-colors hover:bg-[#F5F5F5]"
            >
              <HelpCircle className="h-4 w-4 shrink-0" strokeWidth={1.8} />
              {t("account.sidebar.helpCentre")}
            </a>
            <a
              href="/delete-account"
              className="flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-[15px] leading-[18px] text-brand-coral transition-colors hover:bg-[#F5F5F5]"
            >
              <Trash2 className="h-4 w-4 shrink-0" strokeWidth={1.8} />
              {t("account.sidebar.deleteAccount")}
            </a>
            <button
              type="button"
              onClick={() => {
                clearClasszSession()
                router.push("/")
              }}
              className="flex items-center gap-3 rounded-[8px] px-3 py-2.5 text-left text-[15px] leading-[18px] text-ink transition-colors hover:bg-[#F5F5F5]"
            >
              <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.8} />
              {t("account.sidebar.logOut")}
            </button>
          </div>
        </aside>

        <section className="min-w-0 flex-1">{children}</section>
      </div>
      <Footer />
    </main>
  )
}
