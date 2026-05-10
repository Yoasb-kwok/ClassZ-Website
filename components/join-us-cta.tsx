import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

interface JoinUsCtaProps {
  secondaryLink?: string
  primaryLink?: string
}

export function JoinUsCta({ secondaryLink, primaryLink }: JoinUsCtaProps) {
  const { t } = useLanguage()
  return (
    <section className="relative bg-gradient-to-br from-white via-[#F9FAFB] to-[#E0F7F6] overflow-hidden">
      {/* Background blur circles */}
      <div className="absolute w-96 h-96 bg-[rgba(10,186,181,0.08)] rounded-full blur-[128px] top-[384px] left-[705px] hidden xl:block" />
      <div className="absolute w-96 h-96 bg-[rgba(10,186,181,0.05)] rounded-full blur-[128px] top-0 right-[845px] hidden xl:block" />
      
      <div className="relative container mx-auto px-4 md:px-8 py-[50px] pb-[90px]">
        <div className="flex flex-col items-center gap-[61px]">
          {/* Content Container */}
          <div className="flex flex-col items-center gap-10 px-8 w-full max-w-[896px]">
            {/* Heading */}
            <div className="w-full max-w-[832px] flex items-center justify-center">
              <h2 className="text-3xl md:text-4xl font-medium text-[#111929] leading-[1.3] tracking-[0.01em] text-center">
                {t("joinUsCta.title")}
              </h2>
            </div>

            {/* Paragraph */}
            <div className="w-full max-w-[832px] opacity-90 flex items-center justify-center">
              <p className="text-base font-medium text-[#485A69] leading-[1.6] tracking-[-0.02em] text-center">
                {t("joinUsCta.subtitle")}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
              {primaryLink ? (
                <Link href={primaryLink}>
                  <Button className="bg-classz-400 hover:bg-classz-500 text-white rounded-full px-10 h-14 shadow-lg flex items-center gap-3 min-w-[243.4px]">
                    {t("joinUsCta.primary")}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <Button className="bg-classz-400 hover:bg-classz-500 text-white rounded-full px-10 h-14 shadow-lg flex items-center gap-3 min-w-[243.4px]">
                  {t("joinUsCta.primary")}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              )}
              {secondaryLink ? (
                <Link href={secondaryLink}>
                  <Button variant="outline" className="border-[#4A5565] text-[#4A5565] hover:bg-slate-50 rounded-full px-6 h-14 flex items-center gap-2 min-w-[154.06px]">
                    {t("joinUsCta.secondary")}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" className="border-[#4A5565] text-[#4A5565] hover:bg-slate-50 rounded-full px-6 h-14 flex items-center gap-2 min-w-[154.06px]">
                  {t("joinUsCta.secondary")}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Stats Row */}
            <div className="w-full border-t border-[rgba(229,231,235,0.6)] pt-[33px] min-h-[53px]">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 md:gap-16">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#6A7282] flex-shrink-0" />
                  <span className="text-sm font-normal text-[#6A7282] leading-[1.43] tracking-[-0.011em]">
                    {t("joinUsCta.point1")}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#6A7282] flex-shrink-0" />
                  <span className="text-sm font-normal text-[#6A7282] leading-[1.43] tracking-[-0.011em]">
                    {t("joinUsCta.point2")}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#6A7282] flex-shrink-0" />
                  <span className="text-sm font-normal text-[#6A7282] leading-[1.43] tracking-[-0.011em]">
                    {t("joinUsCta.point3")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

