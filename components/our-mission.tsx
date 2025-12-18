"use client"

import { Heart, TrendingUp, Users, Building2, Calendar, CreditCard } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

interface OurMissionProps {
  hideHeader?: boolean
}

export function OurMission({ hideHeader = false }: OurMissionProps) {
  const { t } = useLanguage()

  return (
    <section id="our-mission" className="relative bg-black">
      {/* Hero Image Section */}
      {!hideHeader && (
        <div className="relative h-[592px] flex items-center justify-center overflow-hidden bg-black">
          <div className="absolute inset-0 bg-[rgba(10,186,181,0.2)]" />
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/family-snow-winter-happy.jpg')",
            }}
          />
          <div className="relative z-10 w-full px-4 md:px-[251px] text-center">
            <h2 className="text-4xl md:text-5xl lg:text-[50px] font-medium text-white leading-[1.1] tracking-[-0.05em] drop-shadow-[0_0_30px_rgba(0,0,0,0.4)]">
              {t("ourMissionComp.hero.title1")}
              <br />
              {t("ourMissionComp.hero.title2")}
            </h2>
          </div>
        </div>
      )}

      {/* Our Mission Text Section */}
      <div className="border-b border-[#E9E9E9] bg-white">
        <div className="container mx-auto px-4 md:px-8 lg:px-20 xl:px-[100px] py-[60px]">
          <div className="flex flex-col items-start gap-[50px]">
            <h3 className="text-3xl md:text-4xl font-medium text-[#292929] leading-[0.9] tracking-[-0.03em]">
              {t("ourMissionComp.text.title")}
            </h3>
            <p className="text-base font-medium text-[#292929] leading-[1.4] tracking-[-0.005em]">
              {t("ourMissionComp.text.p1")}
            </p>
            <p className="text-base font-normal text-[#6F6F6F] leading-[1.4] tracking-[-0.005em]">
              {t("ourMissionComp.text.p2")}
            </p>
          </div>
        </div>
      </div>

      {/* Why We Exist Section */}
      <div className="bg-white">
        <div className="container mx-auto px-4 md:px-10 lg:px-[100px] py-20 h-[735px] flex items-center">
          <div className="w-full flex flex-col md:flex-row gap-[50px] items-start">
            {/* Text Content */}
            <div className="flex flex-col justify-center gap-10 py-[60px] pb-[80px] flex-1">
              <div className="flex flex-col gap-10">
                <div className="flex flex-col gap-10 pr-20">
                  <h3 className="text-3xl md:text-4xl font-medium text-black leading-[0.9] tracking-[-0.03em]">
                    {t("ourMissionComp.exist.title")}
                  </h3>
                  <p className="text-base font-medium text-[#6F6F6F] leading-[1.4] tracking-[-0.005em]">
                    {t("ourMissionComp.exist.subtitle")}
                  </p>
                </div>

                {/* Numbered List */}
                <div className="flex flex-col">
                  <div className="flex gap-[30px] py-5 pr-20 border-t border-[#E9E9E9]">
                    <span className="text-[22px] font-bold text-[#6F6F6F] leading-[1.4] tracking-[-0.005em] flex-shrink-0">01</span>
                    <p className="text-base font-normal text-[#6F6F6F] leading-[1.4] tracking-[-0.005em]">
                      {t("ourMissionComp.exist.b1")}
                    </p>
                  </div>
                  <div className="flex gap-[30px] py-5 pr-20 border-t border-[#E9E9E9]">
                    <span className="text-[22px] font-bold text-[#6F6F6F] leading-[1.4] tracking-[-0.005em] flex-shrink-0">02</span>
                    <p className="text-base font-normal text-[#6F6F6F] leading-[1.4] tracking-[-0.005em]">
                      {t("ourMissionComp.exist.b2")}
                    </p>
                  </div>
                  <div className="flex gap-[30px] py-5 pr-20 border-t border-[#E9E9E9]">
                    <span className="text-[22px] font-bold text-[#6F6F6F] leading-[1.4] tracking-[-0.005em] flex-shrink-0">03</span>
                    <p className="text-base font-normal text-[#6F6F6F] leading-[1.4] tracking-[-0.005em]">
                      {t("ourMissionComp.exist.b3")}
                    </p>
                  </div>
                  <div className="flex gap-[30px] py-5 pr-20 border-t border-[#E9E9E9]">
                    <span className="text-[22px] font-bold text-[#6F6F6F] leading-[1.4] tracking-[-0.005em] flex-shrink-0">04</span>
                    <p className="text-base font-normal text-[#6F6F6F] leading-[1.4] tracking-[-0.005em]">
                      {t("ourMissionComp.exist.b4")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="hidden md:flex items-center justify-center">
              <div className="rounded-[30px] overflow-hidden w-[493px] h-[463px]">
                <img
                  src="/WWE.png"
                  alt="Family learning together"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Commitment Section */}
      <div className="relative bg-gradient-to-br from-white via-[#F9FAFB] to-[#E0F7F6] overflow-hidden">
        {/* Background blur circles */}
        <div className="absolute w-96 h-96 bg-[rgba(10,186,181,0.08)] rounded-full blur-[128px] top-[384px] left-[705px] hidden xl:block" />
        <div className="absolute w-96 h-96 bg-[rgba(10,186,181,0.05)] rounded-full blur-[128px] top-0 right-[845px] hidden xl:block" />

        <div className="relative container mx-auto px-4 md:px-8">
          {/* Header */}
          <div className="flex flex-col items-center gap-5 py-[120px] px-10 w-full max-w-[1280px] mx-auto h-[316px]">
            {/* Badge */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-[rgba(10,186,181,0.2)] bg-white">
              <Heart className="w-[18px] h-[18px] text-[#0ABAB5]" />
              <span className="text-sm font-normal text-[#0ABAB5] leading-[1.43] tracking-[0.014em] uppercase">
                {t("ourMissionComp.commit.badge")}
              </span>
            </div>

            <h3 className="text-3xl md:text-4xl font-medium text-[#292929] leading-[0.9] tracking-[-0.03em] text-center">
              {t("ourMissionComp.commit.title")}
            </h3>
            <p className="text-base font-normal text-[#6F6F6F] leading-[1.4] tracking-[-0.005em] text-center max-w-2xl">
              {t("ourMissionComp.commit.desc")}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-[120px] px-10 w-full max-w-[1280px] mx-auto mt-[61px]">
            {/* Feature Card 1 - Track real growth */}
            <div className="bg-[rgba(255,255,255,0.8)] border border-[rgba(255,255,255,0.5)] rounded-3xl p-[25px] pb-[1px] shadow-[0_0_15px_rgba(0,0,0,0.06)]">
              <div className="flex flex-col gap-4 h-[198.38px]">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-[#0ABAB5] to-[#089994] flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-2xl font-medium text-[#101828] leading-[1.4] tracking-[0.003em]">
                  {t("ourMissionComp.commit.card1.title")}
                </h4>
                <p className="text-base font-normal text-[#737373] leading-[1.6] tracking-[-0.02em] pr-12 flex-1">
                  {t("ourMissionComp.commit.card1.desc")}
                </p>
              </div>
            </div>

            {/* Feature Card 2 - SEN support */}
            <div className="bg-[rgba(255,255,255,0.8)] border border-[rgba(255,255,255,0.5)] rounded-3xl p-[25px] pb-[1px] shadow-[0_0_15px_rgba(0,0,0,0.06)]">
              <div className="flex flex-col gap-4 h-[198.38px]">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FB64B6] to-[#FF637E] flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-2xl font-medium text-[#101828] leading-[1.4] tracking-[0.003em]">
                  {t("ourMissionComp.commit.card2.title")}
                </h4>
                <p className="text-base font-normal text-[#737373] leading-[1.6] tracking-[-0.02em] pr-12 flex-1">
                  {t("ourMissionComp.commit.card2.desc")}
                </p>
              </div>
            </div>

            {/* Feature Card 3 - Workshops & family activities */}
            <div className="bg-[rgba(255,255,255,0.8)] border border-[rgba(255,255,255,0.5)] rounded-3xl p-[25px] pb-[1px] shadow-[0_0_15px_rgba(0,0,0,0.06)]">
              <div className="flex flex-col gap-4 h-[198.38px]">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#51A2FF] to-[#00D3F2] flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-2xl font-medium text-[#101828] leading-[1.4] tracking-[0.003em]">
                  {t("ourMissionComp.commit.card3.title")}
                </h4>
                <p className="text-base font-normal text-[#737373] leading-[1.6] tracking-[-0.02em] pr-12 flex-1">
                  {t("ourMissionComp.commit.card3.desc")}
                </p>
              </div>
            </div>

            {/* Feature Card 4 - Support for centres */}
            <div className="bg-[rgba(255,255,255,0.8)] border border-[rgba(255,255,255,0.5)] rounded-3xl p-[25px] pb-[1px] shadow-[0_0_15px_rgba(0,0,0,0.06)]">
              <div className="flex flex-col gap-4 h-[198.38px]">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00D492] to-[#00D5BE] flex items-center justify-center shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-2xl font-medium text-[#101828] leading-[1.4] tracking-[0.003em]">
                  {t("ourMissionComp.commit.card4.title")}
                </h4>
                <p className="text-base font-normal text-[#737373] leading-[1.6] tracking-[-0.02em] pr-12 flex-1">
                  {t("ourMissionComp.commit.card4.desc")}
                </p>
              </div>
            </div>

            {/* Feature Card 5 - Book in few clicks */}
            <div className="bg-[rgba(255,255,255,0.8)] border border-[rgba(255,255,255,0.5)] rounded-3xl p-[25px] pb-[1px] shadow-[0_0_15px_rgba(0,0,0,0.06)]">
              <div className="flex flex-col gap-4 h-[198.38px]">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFB900] to-[#FF8904] flex items-center justify-center shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-2xl font-medium text-[#101828] leading-[1.4] tracking-[0.003em]">
                  {t("ourMissionComp.commit.card5.title")}
                </h4>
                <p className="text-base font-normal text-[#737373] leading-[1.6] tracking-[-0.02em] pr-12 flex-1">
                  {t("ourMissionComp.commit.card5.desc")}
                </p>
              </div>
            </div>

            {/* Feature Card 6 - Flexible payment options */}
            <div className="bg-[rgba(255,255,255,0.8)] border border-[rgba(255,255,255,0.5)] rounded-3xl p-[25px] pb-[1px] shadow-[0_0_15px_rgba(0,0,0,0.06)]">
              <div className="flex flex-col gap-4 h-[198.38px]">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C27AFF] to-[#7C86FF] flex items-center justify-center shadow-lg">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-2xl font-medium text-[#101828] leading-[1.4] tracking-[0.003em]">
                  {t("ourMissionComp.commit.card6.title")}
                </h4>
                <p className="text-base font-normal text-[#737373] leading-[1.6] tracking-[-0.02em] pr-12 flex-1">
                  {t("ourMissionComp.commit.card6.desc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

