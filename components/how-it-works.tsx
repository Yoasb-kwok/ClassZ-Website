"use client"

import { useLanguage } from "@/components/language-provider"

export function HowItWorks() {
  const { t } = useLanguage()
  return (
    <section className="border-t border-[#E9E9E9] bg-white">
      <div className="container mx-auto px-4 md:px-10 py-[120px]">
        <div className="flex flex-col gap-[80px]">
          {/* Header */}
          <div className="flex flex-col gap-[30px]">
            <div className="flex flex-col items-center gap-[50px] py-5">
              <div className="flex flex-col justify-center items-center gap-5 w-full">
                <h2 className="text-3xl md:text-4xl font-medium text-[#4C5B5C] leading-[0.9] tracking-[-0.03em] text-center">
                {t("howItWorks.title")}
                </h2>
                <p className="text-base font-normal text-[#5F6E6F] leading-[1.4] tracking-[-0.005em] text-center">
                {t("howItWorks.subtitle")}
                </p>
              </div>
            </div>
          </div>

          {/* Image Grid */}
          <div className="flex flex-col md:flex-row gap-5 md:gap-[50px] w-full px-4 md:px-0 md:px-[156px]">
            {/* Left Column - Two Images */}
            <div className="flex flex-col gap-[10px] flex-1">
              <div className="h-[250px] sm:h-[300px] rounded-[20px] md:rounded-[30px] overflow-hidden">
                <img
                  src="/pexels-anastasia-shuraeva-4079277.jpg"
                  alt="Mother and child moment"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="h-[250px] sm:h-[300px] rounded-[20px] md:rounded-[30px] overflow-hidden">
                <img
                  src="/pexels-tatianasyrikova-3933227.jpg"
                  alt="Father and child painting together"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right Column - One Large Image (centered vertically) */}
            <div className="flex flex-col justify-center items-center flex-1">
              <div className="rounded-[20px] md:rounded-[30px] overflow-hidden h-[250px] sm:h-[300px] md:h-[610px] w-full">
                <img
                  src="/pexels-emma-bauso-1183828-2833394.jpg"
                  alt="Family playing at beach"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

