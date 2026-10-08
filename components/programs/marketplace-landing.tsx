"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import type { PublicCourse } from "@/lib/public-courses";
import type { LandingCmsOverrides } from "@/lib/site-pages";
import { ProgramCard } from "@/components/programs/program-card";

const FONT =
  '"SF Pro", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

/** Per-locale CMS overrides extracted from cms_pages('landing') on the
 *  server (lib/site-pages.ts landingOverridesFromBlocks). Missing fields
 *  fall back to the locale keys. */
export type LandingCms = { en: LandingCmsOverrides; zhTw: LandingCmsOverrides };

const STEPS = [
  {
    n: "01",
    title: "discoverTitle",
    body: "discoverBody",
    points: ["discover1", "discover2", "discover3"],
    image: "/school/search.png",
    flip: false,
  },
  {
    n: "02",
    title: "bookTitle",
    body: "bookBody",
    points: ["book1", "book2", "book3"],
    image: "/school/booking.png",
    flip: true,
  },
  {
    n: "03",
    title: "trackTitle",
    body: "trackBody",
    points: ["track1", "track2", "track3"],
    image: "/school/zpassport.png",
    flip: false,
  },
] as const;

const STORIES = [
  { title: "story1Title", body: "story1Body" },
  { title: "story2Title", body: "story2Body" },
  { title: "story3Title", body: "story3Body" },
] as const;

function Check() {
  return <img src="/school/check.svg" alt="" className="mt-1.5 shrink-0" />;
}

/**
 * ClassZ School landing from Figma 4012:10512.
 * Product panels (search, reservation, ZPassport) are the design's nested
 * UI screenshots. Workshop cards stay live published courses.
 */
export function MarketplaceLanding({
  workshops,
  prices,
  cms,
}: {
  workshops: PublicCourse[];
  prices?: Record<number, number>;
  cms?: LandingCms;
}) {
  const { t, locale } = useLanguage();
  const o: LandingCmsOverrides =
    cms && locale === "zh-TW" ? cms.zhTw : (cms?.en ?? {});

  return (
    <main className="min-h-screen bg-white text-[#222]" style={{ fontFamily: FONT }}>
      <Navbar />

      <section className="mx-auto flex max-w-[1440px] flex-col items-center gap-8 pt-8">
        <div className="flex aspect-[1440/454] w-full gap-[5px] overflow-hidden rounded-xl lg:hidden">
          <img src="/school/hero-left.jpg" alt="" className="w-[20.8%] object-cover" />
          <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
            <div className="flex h-[calc(50%-2.5px)] min-h-0 gap-[5px]">
              <img src="/school/hero-tl.jpg" alt="" className="min-w-0 flex-1 object-cover" />
              <img src="/school/hero-tr.jpg" alt="" className="min-w-0 flex-1 object-cover" />
            </div>
            <img src="/school/hero-wide.jpg" alt="" className="h-[calc(50%-2.5px)] w-full object-cover" />
          </div>
          <img src="/school/hero-right.jpg" alt="" className="w-[20.8%] object-cover" />
        </div>
        <div className="hidden h-[454px] w-full gap-5 overflow-hidden rounded-xl lg:flex">
          <img src="/school/hero-left.jpg" alt="" className="w-[300px] object-cover" />
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            <div className="flex min-h-0 flex-1 gap-5">
              <img src="/school/hero-tl.jpg" alt="" className="min-w-0 flex-1 object-cover" />
              <img src="/school/hero-tr.jpg" alt="" className="min-w-0 flex-1 object-cover" />
            </div>
            <img src="/school/hero-wide.jpg" alt="" className="h-[217px] w-full object-cover" />
          </div>
          <img src="/school/hero-right.jpg" alt="" className="w-[300px] object-cover" />
        </div>

        <div className="flex w-full flex-col items-center gap-4 px-6 py-8 text-center md:px-[120px] md:py-8">
          <h1 className="w-full text-[32px] leading-[40px] font-[590] md:text-[40px] md:leading-[48px]">
            {o.introTitle ?? t("landing.introTitle")}
          </h1>
          <p className="max-w-[884px] text-[18px] leading-[1.5] md:text-[20px]">
            {o.introSubtitle ?? t("landing.introSubtitle")}
          </p>
        </div>
      </section>

      <div className="h-16 md:h-24" />

      <section className="mx-auto flex max-w-[1440px] flex-col gap-4 px-6 py-8 text-center md:px-20">
        <h2 className="text-[32px] leading-none font-[590] md:text-[40px]">
          {t("landing.standardTitle")}
        </h2>
        <p className="text-[18px] leading-[1.5] md:text-[20px]">{t("landing.standardBody")}</p>
      </section>

      {STEPS.map((step) => (
        <section
          key={step.n}
          className="mx-auto flex max-w-[1440px] flex-col items-center gap-10 px-6 py-8 lg:flex-row lg:gap-20 lg:px-20"
        >
          <img
            src={step.image}
            alt=""
            className={`w-full max-w-[500px] ${step.n === "03" ? "lg:max-w-[600px]" : ""} ${
              step.flip ? "lg:order-2" : ""
            }`}
          />
          <div className={`flex min-w-0 flex-1 flex-col gap-8 ${step.flip ? "lg:order-1" : ""}`}>
            <div className="flex flex-col gap-4">
              <p className="text-[32px] leading-none font-[590] md:text-[40px]">{step.n}</p>
              <h2 className="text-[32px] leading-none font-[590] md:text-[40px]">
                {t(`landing.${step.title}`)}
              </h2>
              <p className="text-[18px] leading-[1.5] md:text-[20px]">{t(`landing.${step.body}`)}</p>
            </div>
            <ul className="flex flex-col gap-4">
              {step.points.map((point) => (
                <li key={point} className="flex items-start gap-4 text-[18px] leading-[1.5] md:text-[20px]">
                  <Check />
                  <span>{t(`landing.${point}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      <div className="h-16 md:h-24" />

      <section className="bg-[#f5f5f5]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-6 py-16 text-center md:p-20">
          <h2 className="text-[32px] leading-none font-[590] md:text-[40px]">{t("landing.storyTitle")}</h2>
          <p className="text-[18px] leading-[1.5] md:text-[20px]">{t("landing.storySubtitle")}</p>
          <div className="grid gap-12 py-10 md:grid-cols-3 md:gap-8 md:py-[120px]">
            {STORIES.map((story) => (
              <article key={story.title} className="mx-auto flex w-full max-w-[373px] flex-col items-center gap-2.5">
                <h3 className="text-[20px] leading-[1.5] font-[590]">{t(`landing.${story.title}`)}</h3>
                <div className="h-px w-full bg-[#222]" />
                <p className="text-[18px] leading-[1.5] md:text-[20px]">{t(`landing.${story.body}`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="h-16 md:h-24" />

      <section className="mx-auto flex max-w-[1440px] flex-col gap-8 px-6 py-8 md:px-20">
        <p className="text-[20px] leading-[1.5]">{t("landing.partnerTitle")}</p>
        <div className="flex flex-wrap gap-6 md:gap-8">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="size-[72px] rounded-full border border-black md:size-[100px]" />
          ))}
        </div>
      </section>

      {workshops.length > 0 ? (
        <section className="mx-auto flex max-w-[1440px] flex-col gap-8 px-6 py-8 md:px-20">
          <div className="flex items-end justify-between gap-2.5">
            <h2 className="text-[28px] font-[590] text-black">
              {o.workshopsHeading ?? t("landing.trendingWorkshop")}
            </h2>
            <Link
              href="/workshops"
              aria-label={t("landing.seeAllWorkshops")}
              className="text-[16px] text-[#5E5E5E] underline underline-offset-4"
            >
              {t("landing.seeMore")}
            </Link>
          </div>
          <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3 xl:gap-10">
            {workshops.slice(0, 3).map((c) => (
              <li key={c.id} className="w-full">
                <ProgramCard course={c} variant="similar" price={prices?.[c.id]} />
              </li>
            ))}
          </ul>
          <div className="flex justify-end gap-2.5 text-[#222]" aria-hidden>
            <span className="flex size-[35px] items-center justify-center text-[#B0B0B0]">
              <ChevronLeft className="size-4" strokeWidth={1.5} />
            </span>
            <span className="flex size-[35px] items-center justify-center">
              <ChevronRight className="size-4" strokeWidth={1.5} />
            </span>
          </div>
        </section>
      ) : null}

      <div className="h-16 md:h-24" />

      <section className="mx-auto flex max-w-[1440px] flex-col items-center gap-4 px-6 py-16 text-center md:p-20">
        <p className="text-[18px] leading-[1.5] text-[#5E5E5E] md:text-[20px]">
          {t("landing.transformEyebrow")}
        </p>
        <h2 className="text-[32px] leading-none font-[590] md:text-[40px]">{t("landing.ctaTitle")}</h2>
        <p className="text-[18px] leading-[1.5] md:text-[20px]">{t("landing.ctaSubtitle")}</p>
        <Link href="/our-mission" className="inline-flex items-center gap-2.5 text-[20px] leading-[1.5] text-[#5E5E5E]">
          {t("landing.learnMore")}
          <img src="/school/arrow.svg" alt="" className="rotate-180" />
        </Link>
        <div className="flex items-center justify-center gap-8 py-8">
          <img src="/school/app-store.svg" alt="Download on the App Store" className="h-[45px] w-auto" />
          <img src="/school/google-play.svg" alt="Get it on Google Play" className="h-[45px] w-auto" />
        </div>
      </section>

      <Footer />
    </main>
  );
}
