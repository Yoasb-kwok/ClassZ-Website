"use client"

import Link from "next/link"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"
import { MapPin, Phone, Clock, ChevronDown } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export function Footer() {
  const { locale, setLocale, t } = useLanguage()

  return (
    <footer data-testid="site-footer" className="bg-ink">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-12 px-6 py-12 md:flex-row md:gap-16 md:px-10 md:pt-[120px] md:pb-16 lg:gap-[120px] lg:px-20">
        {/* Contact Us */}
        <div className="flex flex-col gap-5">
          <h4 className="text-lg font-semibold text-white">{t("footer.contactTitle")}</h4>
          <div className="flex flex-col gap-5 px-1">
            <a href="mailto:theclasszclassz@gmail.com" className="flex items-center gap-2 hover:opacity-70">
              <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border border-white p-2">
                <MapPin className="h-4 w-4 text-white" strokeWidth={1.5} />
              </span>
              <span className="text-sm text-white">{t("footer.email")}</span>
            </a>
            <a href="tel:+85212345678" className="flex items-center gap-2 hover:opacity-70">
              <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border border-white p-2">
                <Phone className="h-4 w-4 text-white" strokeWidth={1.5} />
              </span>
              <span className="text-sm text-white">{t("footer.phone")}</span>
            </a>
            <div className="flex items-center gap-2">
              <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border border-white p-2">
                <Clock className="h-4 w-4 text-white" strokeWidth={1.5} />
              </span>
              <span className="text-sm text-white">{t("footer.hours")}</span>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="flex flex-col gap-5">
          <h4 className="text-lg font-semibold text-white">{t("footer.supportTitle")}</h4>
          <div className="flex flex-col gap-5">
            <Link href="/contact-us" className="text-sm text-white hover:opacity-70">
              {t("footer.helpCenter")}
            </Link>
            <Link href="/faqs" className="text-sm text-white hover:opacity-70">
              {t("footer.faqs")}
            </Link>
            <Link href="/privacy" className="text-sm text-white hover:opacity-70">
              {t("footer.privacy")}
            </Link>
            <Link href="/terms" className="text-sm text-white hover:opacity-70">
              {t("nav.terms")}
            </Link>
          </div>
        </div>

        {/* Apps + Language */}
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-5">
            <h4 className="text-lg font-semibold text-white">{t("footer.appsTitle")}</h4>
            <div className="flex flex-col gap-5">
              <a href="#" className="text-sm text-white hover:opacity-70">
                {t("footer.downloadAndroid")}
              </a>
              <a href="#" className="text-sm text-white hover:opacity-70">
                {t("footer.downloadIos")}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <span className="text-sm text-white">{t("footer.languageTitle")}</span>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  aria-label={t("footer.languageTitle")}
                  className="flex w-[89px] items-center justify-between rounded border border-[#F5F5F5] px-4 py-3 text-sm text-[#F5F5F5] transition-colors hover:border-white"
                >
                  {locale === "en" ? "EN" : "中文"}
                  <ChevronDown className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  side="top"
                  align="start"
                  className="z-[100] w-32 rounded border border-shade-100 bg-white p-1 shadow-[0_6px_16px_2px_rgba(0,0,0,0.12)]"
                >
                  <DropdownMenu.Item
                    onSelect={() => setLocale("en")}
                    className="flex h-10 cursor-pointer items-center rounded px-3 text-sm text-ink outline-none data-[highlighted]:bg-[#F5F5F5]"
                  >
                    {t("english")}
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onSelect={() => setLocale("zh-TW")}
                    className="flex h-10 cursor-pointer items-center rounded px-3 text-sm text-ink outline-none data-[highlighted]:bg-[#F5F5F5]"
                  >
                    {t("chinese")}
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>
      </div>
    </footer>
  )
}
