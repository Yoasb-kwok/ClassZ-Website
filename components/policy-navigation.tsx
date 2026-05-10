"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLanguage } from "@/components/language-provider"

interface PolicyNavigationProps {
  align?: "left" | "center"
  title?: string
  titleSize?: "base" | "lg" | "xl"
}

export function PolicyNavigation({ align = "left", title, titleSize = "base" }: PolicyNavigationProps) {
  const { t } = useLanguage()
  const pathname = usePathname()

  const policies = [
    { path: "/terms", label: t("footer.terms") },
    { path: "/privacy", label: t("footer.privacy") },
    { path: "/refund", label: t("footer.refund") },
    { path: "/delete-account", label: t("footer.deleteAccount") },
  ]

  const alignmentClass = align === "center" ? "items-center" : "items-start"
  const justifyClass = align === "center" ? "justify-center" : "justify-start"

  const titleClass = titleSize === "xl"
    ? "text-[#1F2937] text-xl md:text-2xl mb-6"
    : titleSize === "lg"
      ? "text-[#1F2937] text-lg md:text-xl mb-6"
      : "text-[#1F2937] text-base mb-6"

  const displayTitle = title || t("policyNavigation.title")

  return (
    <section className="py-12 bg-gradient-to-b from-white to-classz-50">
      <div className="max-w-[1180px] mx-auto px-6 md:px-10">
        <div className={`flex flex-col ${alignmentClass}`}>
          <p className={titleClass}>
            {displayTitle}
          </p>
          <div className={`flex flex-wrap ${justifyClass} gap-3`}>
            {policies.map((policy) => {
              const isActive = pathname === policy.path
              return (
                <Link
                  key={policy.path}
                  href={policy.path}
                  className={`px-5 py-2.5 rounded-full text-sm md:text-base font-medium transition-colors ${isActive
                    ? "bg-classz-400 text-white"
                    : "bg-white text-classz-400 border border-classz-400 hover:bg-classz-50"
                    }`}
                >
                  {policy.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

