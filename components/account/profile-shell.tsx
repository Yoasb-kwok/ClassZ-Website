"use client";

import { useRouter } from "next/navigation";
import { LogOut, Trash2 } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useLanguage } from "@/components/language-provider";
import { clearClasszSession, getClasszSession } from "@/lib/classz-auth";

/**
 * ADR-006 D9 — the Profile section's own in-page sidebar (figma 2909
 * "Profile-about_me"): About me / Child profile / Transactions / Favorites +
 * Help centre / Delete account / Log Out. Those last three are LINKS to the
 * existing surfaces — this build does not modify them.
 *
 * The four section icons are the user-supplied capture SVGs (figma prompt/
 * 2909/icon, served from /icons/profile) — profile-circle, cup,
 * empty-wallet, heart — 19px, stroke #222222.
 */

const NAV_ITEMS = [
  {
    key: "about",
    href: "/account/profile",
    labelKey: "account.sidebar.aboutMe",
    icon: "/icons/profile/profile-circle.svg",
  },
  {
    key: "children",
    href: "/account/children",
    labelKey: "account.sidebar.childProfile",
    icon: "/icons/profile/cup.svg",
  },
  {
    key: "transactions",
    href: "/account/transactions",
    labelKey: "account.sidebar.transactions",
    icon: "/icons/profile/empty-wallet.svg",
  },
  {
    key: "favorites",
    href: "/account/favorites",
    labelKey: "account.sidebar.favorites",
    icon: "/icons/profile/heart.svg",
  },
] as const;

export function ProfileShell({
  active,
  children,
}: {
  active: "about" | "children" | "transactions" | "favorites";
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const session = typeof window !== "undefined" ? getClasszSession() : null;
  const initial = (session?.user.name || "P").slice(0, 1).toUpperCase();

  return (
    <main className="min-h-screen bg-white text-ink">
      <Navbar />
      <div className="mx-auto flex w-full max-w-[1440px] flex-row items-stretch px-6 py-10 md:px-12 lg:px-16">
        {/* In-page profile sidebar — NOT the hamburger menu */}
        <aside className="w-full shrink-0 md:w-[240px]">
          <p className="mb-4 text-[22px] font-[weight:590] leading-[26px]">
            {t("account.sidebar.title")}
          </p>
          <nav
            aria-label={t("account.sidebar.title")}
            className="flex flex-col gap-5"
          >
            {NAV_ITEMS.map(({ key, href, labelKey, icon }) => {
              const isActive = active === key;
              return (
                <a
                  key={key}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-[8px] px-3 py-3 text-[14px] leading-[17px] transition-colors ${
                    isActive
                      ? "bg-[#F5F5F5] text-[#222222]"
                      : "text-[#222222] hover:bg-[#F5F5F5]"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={icon}
                    alt=""
                    width={19}
                    height={19}
                    className="h-[19px] w-[19px] shrink-0"
                  />
                  {t(labelKey)}
                </a>
              );
            })}
          </nav>

          <div className="mt-8 flex flex-col gap-10 border-t border-[#EBEBEB] pt-6">
            <a
              href="/delete-account"
              className="flex items-center gap-3 rounded-[8px] px-3 py-3 text-[15px] leading-[18px] text-brand-coral transition-colors hover:bg-[#F5F5F5]"
            >
              <Trash2 className="h-4 w-4 shrink-0" strokeWidth={1.8} />
              {t("account.sidebar.deleteAccount")}
            </a>
            <button
              type="button"
              onClick={() => {
                clearClasszSession();
                router.push("/");
              }}
              className="flex items-center gap-3 rounded-[8px] px-3 py-3 text-left text-[15px] leading-[18px] text-ink transition-colors hover:bg-[#F5F5F5]"
            >
              <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.8} />
              {t("account.sidebar.logOut")}
            </button>
          </div>
        </aside>

        {/* div (not <section>) — globals.css gives every <section>
            overflow-x: clip, which would horizontally clip the card's
            box-shadow; the card sits flush with this container's left edge.
            Capture Line 18: 32px off the sidebar, card right after it */}
        <div
          aria-hidden
          className="mx-8 hidden self-stretch w-px bg-[#EBEBEB] md:block"
        />

        <div className="min-w-0 flex-1">{children}</div>
      </div>
      <Footer />
    </main>
  );
}
