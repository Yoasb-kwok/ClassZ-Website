"use client"

import Link from "next/link"
import { useLanguage } from "@/components/language-provider"

export function MarketplaceToggle({ active }: { active: "centres" | "programmes" }) {
  const { t } = useLanguage()
  const item = (id: "centres" | "programmes", href: string, label: string) => {
    const on = active === id
    return (
      <Link
        href={href}
        aria-current={on ? "page" : undefined}
        className={`inline-flex h-10 items-center rounded-full px-5 text-[15px] font-medium transition ${
          on ? "bg-[#18191b] text-white" : "text-[#18191b] hover:bg-white"
        }`}
      >
        {label}
      </Link>
    )
  }
  return (
    <div className="mt-6 inline-flex rounded-full border border-[#ece7e7] bg-[#f6f3f3] p-1" data-testid="marketplace-toggle">
      {item("centres", "/centres", t("greenPages.market.centres"))}
      {item("programmes", "/programs", t("greenPages.market.programmes"))}
    </div>
  )
}
