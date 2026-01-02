import Link from "next/link"
import { Instagram, Facebook } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export function Footer() {
  const { t } = useLanguage()
  return (
    <footer className="bg-[#D8F4F3]">
      <div className="max-w-[1280px] mx-auto w-full px-6 md:px-10 py-10">
        {/* Mobile Layout */}
        <div className="flex flex-col md:hidden">
          {/* Navigation Sections - 2 Columns */}
          <div className="grid grid-cols-2 gap-6 gap-y-8 pb-8">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[#111929]">{t("footer.company")}</h4>
              <div className="space-y-2 text-sm text-[#111929]">
                <Link href="/our-features" className="block hover:opacity-70 transition-opacity">
                  {t("footer.whatWeDo")}
                </Link>
                <Link href="/our-mission" className="block hover:opacity-70 transition-opacity">
                  {t("footer.ourMission")}
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[#111929]">{t("footer.resources")}</h4>
              <div className="space-y-2 text-sm text-[#111929]">
                <Link href="/partnership" className="block hover:opacity-70 transition-opacity">
                  {t("footer.partnership")}
                </Link>
                <Link href="/faqs" className="block hover:opacity-70 transition-opacity">
                  {t("footer.faqs")}
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[#111929]">{t("footer.legal")}</h4>
              <div className="space-y-2 text-sm text-[#111929]">
                <Link href="/privacy" className="block hover:opacity-70 transition-opacity">
                  {t("footer.privacy")}
                </Link>
                <Link href="/terms" className="block hover:opacity-70 transition-opacity">
                  {t("footer.terms")}
                </Link>
                <Link href="/refund" className="block hover:opacity-70 transition-opacity">
                  {t("footer.refund")}
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[#111929]">{t("footer.follow")}</h4>
              <div className="space-y-2 text-sm text-[#111929]">
                <Link href="#" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                  <Instagram className="w-4 h-4" />
                  classz.hk
                </Link>
                <Link href="#" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                  <Facebook className="w-4 h-4" />
                  Classz HK
                </Link>
              </div>
            </div>
          </div>

          {/* Separator Line */}
          <div className="border-t border-[#B8E4E2] w-full"></div>

          {/* Logo Section - Centered */}
          <div className="flex justify-center py-8">
            <Link href="/" className="inline-block">
              <img src="/logoWeb.png" alt="ClassZ" className="h-14 w-auto" />
            </Link>
          </div>

          {/* Separator Line */}
          <div className="border-t border-[#B8E4E2] w-full"></div>

          {/* Copyright - Centered */}
          <div className="flex justify-center pt-6 pb-2">
            <p className="text-xs text-[#6B7C5A]">{t("footer.copyright")}</p>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex flex-col">
          {/* Main Footer Content */}
          <div className="flex flex-row items-start justify-between gap-6 lg:gap-8 xl:gap-12 pb-6">
            {/* Logo Section */}
            <div className="flex-shrink-0">
              <Link href="/" className="inline-block">
                <img src="/logoWeb.png" alt="ClassZ" className="h-12 lg:h-14 w-auto" />
              </Link>
            </div>

            {/* Navigation Columns */}
            <div className="flex flex-wrap gap-6 md:gap-8 lg:gap-10 xl:gap-12 flex-1 justify-end">
              <div className="space-y-3 min-w-[120px]">
                <h4 className="text-sm font-semibold text-[#111929]">{t("footer.company")}</h4>
                <div className="space-y-2 text-sm text-[#111929]">
                  <Link href="/our-features" className="block hover:opacity-70 transition-opacity">
                    {t("footer.whatWeDo")}
                  </Link>
                  <Link href="/our-mission" className="block hover:opacity-70 transition-opacity">
                    {t("footer.ourMission")}
                  </Link>
                </div>
              </div>
              <div className="space-y-3 min-w-[120px]">
                <h4 className="text-sm font-semibold text-[#111929]">{t("footer.resources")}</h4>
                <div className="space-y-2 text-sm text-[#111929]">
                  <Link href="/partnership" className="block hover:opacity-70 transition-opacity">
                    {t("footer.partnership")}
                  </Link>
                  <Link href="/faqs" className="block hover:opacity-70 transition-opacity">
                    {t("footer.faqs")}
                  </Link>
                </div>
              </div>
              <div className="space-y-3 min-w-[120px]">
                <h4 className="text-sm font-semibold text-[#111929]">{t("footer.legal")}</h4>
                <div className="space-y-2 text-sm text-[#111929]">
                  <Link href="/privacy" className="block hover:opacity-70 transition-opacity">
                    {t("footer.privacy")}
                  </Link>
                  <Link href="/terms" className="block hover:opacity-70 transition-opacity">
                    {t("footer.terms")}
                  </Link>
                  <Link href="/refund" className="block hover:opacity-70 transition-opacity">
                    {t("footer.refund")}
                  </Link>
                </div>
              </div>
              <div className="space-y-3 min-w-[120px]">
                <h4 className="text-sm font-semibold text-[#111929]">{t("footer.follow")}</h4>
                <div className="space-y-2 text-sm text-[#111929]">
                  <Link href="#" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                    <Instagram className="w-4 h-4" />
                    classz.hk
                  </Link>
                  <Link href="#" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                    <Facebook className="w-4 h-4" />
                    Classz HK
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Separator Line */}
          <div className="border-t border-[#B8E4E2] my-6"></div>

          {/* Copyright */}
          <div className="flex justify-end">
            <p className="text-xs text-[#6B7C5A]">{t("footer.copyright")}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
