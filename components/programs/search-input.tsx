"use client"

import { Search } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

/** Search field — capture node #1608:15903: w1000, pad 16/12, r8, border #B0B0B0; icon 16 stroke 1.5 #717171; placeholder 16/400 #717171 lh19. */
export function SearchInput({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const { t } = useLanguage()
  return (
    <div className="mx-auto w-full max-w-[1000px]">
      <div className="flex items-center gap-2 rounded-[8px] border border-[#B0B0B0] bg-white px-3 py-4">
        <Search className="h-4 w-4 shrink-0 text-shade-400" strokeWidth={1.5} />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("programs.searchPlaceholder")}
          aria-label={t("programs.searchPlaceholder")}
          className="w-full bg-transparent text-[16px] leading-[19px] text-ink placeholder:text-shade-400 focus:outline-none"
        />
      </div>
    </div>
  )
}
