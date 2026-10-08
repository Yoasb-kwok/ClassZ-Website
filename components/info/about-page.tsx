"use client"

import type { ReactNode } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/components/language-provider"
import { useAuthModal } from "@/components/auth-modal"

const FONT =
  '"SF Pro", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

function ArrowIcon() {
  return (
    <svg width="28" height="29" viewBox="0 0 28 29" fill="none" aria-hidden className="shrink-0">
      <path
        d="M4 14.5h18M15.5 7.5 23 14.5l-7.5 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function HeartIcon() {
  return (
    <span className="relative block size-[50px]" aria-hidden>
      <img
        src="/about/icon-heart-a.svg"
        alt=""
        width={39}
        height={35}
        className="absolute top-[6px] left-[4px]"
      />
      <img
        src="/about/icon-heart-b.svg"
        alt=""
        width={30}
        height={27}
        className="absolute top-[19px] left-[18px]"
      />
    </span>
  )
}

function AudienceCard({
  icon,
  title,
  body,
}: {
  icon: ReactNode
  title: string
  body: string
}) {
  return (
    <article className="flex min-h-[343px] flex-col gap-4 rounded-[24px] bg-white px-8 py-16 shadow-[0_16px_50px_rgba(15,23,42,0.06)]">
      {icon}
      <h2 className="text-[32px] leading-[60px] font-medium tracking-[-1.5px] text-[#18191b] md:text-[36px]">
        {title}
      </h2>
      <p className="text-[16px] leading-6 text-[#404040]">{body}</p>
    </article>
  )
}

function PrincipleCard({
  image,
  imageClassName,
  title,
  body,
}: {
  image: string
  imageClassName: string
  title: string
  body: string
}) {
  return (
    <article className="overflow-hidden rounded-[24px] bg-white">
      <div className="flex h-[240px] items-center justify-center overflow-hidden bg-white md:h-[328px]">
        <img src={image} alt="" className={imageClassName} />
      </div>
      <div className="flex flex-col gap-4 px-8 pt-8 pb-16">
        <h3 className="text-[28px] leading-tight font-medium tracking-[-1.5px] text-[#18191b] md:text-[36px] md:leading-[60px]">
          {title}
        </h3>
        <p className="text-[16px] leading-6 text-[#404040]">{body}</p>
      </div>
    </article>
  )
}

export function AboutPage() {
  const { t } = useLanguage()
  const { openAuth } = useAuthModal()

  return (
    <main className="min-h-screen bg-white text-[#18191b]" style={{ fontFamily: FONT }}>
      <Navbar />

      <section className="relative overflow-hidden px-4 pt-16 pb-16 md:px-8 md:pt-36 md:pb-24">
        <div className="pointer-events-none absolute top-[46%] left-[6%] h-[380px] w-[380px] rounded-full bg-[#fff4b0] blur-[90px]" />
        <div className="pointer-events-none absolute top-[38%] right-[4%] h-[440px] w-[440px] rounded-full bg-[#b7f6f2] blur-[100px]" />
        <div className="relative mx-auto max-w-[980px] text-center">
          <h1 className="text-[40px] leading-[1.05] font-medium tracking-[-1.5px] md:text-[72px] md:leading-[60px]">
            {t("infoPages.about.heroTitle")}
          </h1>
        </div>
        <div className="relative mx-auto mt-16 grid max-w-[1100px] gap-8 md:mt-20 lg:grid-cols-3">
          <AudienceCard
            icon={<img src="/about/icon-house.svg" alt="" width={50} height={50} />}
            title={t("infoPages.about.familiesTitle")}
            body={t("infoPages.about.familiesBody")}
          />
          <AudienceCard
            icon={<HeartIcon />}
            title={t("infoPages.about.childrenTitle")}
            body={t("infoPages.about.childrenBody")}
          />
          <AudienceCard
            icon={<img src="/about/icon-people.svg" alt="" width={50} height={50} />}
            title={t("infoPages.about.centresTitle")}
            body={t("infoPages.about.centresBody")}
          />
        </div>
      </section>

      <section className="px-4 py-8 md:px-8 md:py-16">
        <div className="mx-auto flex max-w-[1248px] flex-col items-center px-4 text-center md:px-20">
          <img src="/landing/figma/icon-search.png" alt="" className="size-[51px] object-contain" />
          <h2 className="mt-6 text-[32px] leading-10 font-medium md:text-[36px]">
            <span className="block">{t("infoPages.about.philosophyLine1")}</span>
            <span className="block">{t("infoPages.about.philosophyLine2")}</span>
          </h2>
          <p className="mt-6 max-w-[1248px] text-[18px] leading-7 text-[#404040]">
            {t("infoPages.about.philosophyBody")}
          </p>
        </div>

        <div className="mx-auto mt-16 flex max-w-[1248px] flex-col gap-16 md:mt-20">
          <div className="grid items-stretch gap-8 lg:grid-cols-[490fr_694fr] lg:gap-16">
            <PrincipleCard
              image="/about/observations.png"
              imageClassName="h-full w-full object-contain"
              title={t("infoPages.about.p1Title")}
              body={t("infoPages.about.p1Body")}
            />
            <PrincipleCard
              image="/about/differences.png"
              imageClassName="h-full w-full object-cover"
              title={t("infoPages.about.p2Title")}
              body={t("infoPages.about.p2Body")}
            />
          </div>
          <div className="grid items-stretch gap-8 lg:grid-cols-[649fr_490fr] lg:gap-16">
            <PrincipleCard
              image="/about/language.png"
              imageClassName="h-full w-full object-cover"
              title={t("infoPages.about.p3Title")}
              body={t("infoPages.about.p3Body")}
            />
            <PrincipleCard
              image="/about/evidence.png"
              imageClassName="max-h-full max-w-full object-contain"
              title={t("infoPages.about.p4Title")}
              body={t("infoPages.about.p4Body")}
            />
          </div>
        </div>

        <p className="mx-auto mt-10 max-w-[1248px] text-center text-[16px] leading-7 text-[#404040]">
          {t("infoPages.about.disclaimer")}
        </p>
      </section>

      <section className="bg-[#18191b] text-white">
        <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-6 py-16 md:px-16 md:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <div className="max-w-[650px]">
            <h2 className="text-[40px] leading-none font-bold tracking-[-1.5px] md:text-[60px] md:leading-[60px]">
              {t("infoPages.about.ctaTitle")}
            </h2>
            <p className="mt-5 text-[18px] leading-7">{t("infoPages.about.ctaBody")}</p>
            <button
              type="button"
              onClick={() => openAuth("register")}
              className="mt-10 inline-flex items-center gap-6 rounded-full bg-white px-8 py-4 text-[18px] leading-7 font-medium text-[#18191b] transition hover:bg-[#F6F3F3]"
            >
              {t("landing.joinEarly")}
              <ArrowIcon />
            </button>
            <p className="mt-5 text-[14px] leading-5">{t("landing.noCard")}</p>
          </div>
          <img
            src="/landing/figma/cta-card.png"
            alt=""
            className="w-full [mask-image:linear-gradient(to_right,#000_68%,transparent_100%)]"
          />
        </div>
      </section>

      <Footer />
    </main>
  )
}
