"use client"

import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin } from "lucide-react"
import { useLanguage } from "@/components/language-provider"

export default function ContactUsPage() {
  const { t } = useLanguage()
  return (
    <main className="min-h-screen bg-white font-sans text-slate-900 selection:bg-teal-100">
      <Navbar />
      {/* Hero */}
      <section className="relative w-full overflow-hidden border-b border-[#E9E9E9] min-h-[280px] md:min-h-0">
        <div className="relative w-full h-[280px] md:h-auto" style={{ paddingBottom: '0' }}>
          <div className="absolute inset-0 md:relative md:pb-[33.33%]">
            <div
              className="absolute inset-0 md:absolute bg-cover"
              style={{ backgroundImage: "url('/headerContactUs.png')" }}
            />
          </div>
        </div>
        <div className="absolute inset-0 bg-black/30 md:bg-black/25 pointer-events-none h-[280px] md:h-full" />
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none h-[280px] md:h-full">
          <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 md:px-10 text-center pointer-events-auto">
            <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-semibold drop-shadow-lg">{t("contactPage.hero.title")}</h1>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16 border-b border-[#E9E9E9]">
        <div className="max-w-[860px] w-full mx-auto px-6 md:px-10 space-y-6">
          <div>
            <h2 className="text-3xl md:text-[32px] font-semibold text-[#111929]">{t("contactPage.intro.title")}</h2>
            <p className="text-[#111929] text-base font-semibold mt-3">
              {t("contactPage.intro.subtitle")}
            </p>
          </div>
          <p className="text-sm md:text-base text-[#485A69] leading-[1.6]">
            {t("contactPage.intro.description")}
          </p>
        </div>
      </section>

      {/* Form Card */}
      <section className="py-14">
        <div className="max-w-[1180px] w-full mx-auto px-4 md:px-6">
          <div className="bg-white border border-[rgba(229,231,235,0.7)] shadow-[0_24px_60px_rgba(0,0,0,0.06)] rounded-[28px] p-6 md:p-10">
            <div className="space-y-6">
              <FormField id="name" label={t("contactPage.form.name.label")} placeholder={t("contactPage.form.name.placeholder")} />
              <FormField id="email" label={t("contactPage.form.email.label")} type="email" placeholder={t("contactPage.form.email.placeholder")} />
              <FormSelect id="category" label={t("contactPage.form.category.label")} placeholder={t("contactPage.form.category.placeholder")} />
              <FormSelect id="priority" label={t("contactPage.form.priority.label")} placeholder={t("contactPage.form.priority.placeholder")} />
              <FormTextArea id="description" label={t("contactPage.form.description.label")} placeholder={t("contactPage.form.description.placeholder")} />
              <div className="flex justify-center pt-2">
                <Button className="min-w-[140px] bg-[#0ABAB5] hover:bg-[#00b3a3] text-white rounded-full h-11 text-base">
                  {t("contactPage.form.submit")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Help */}
      <section className="pb-20">
        <div className="max-w-[960px] w-full mx-auto px-6 md:px-10 space-y-4">
          <h3 className="text-2xl font-semibold text-[#111929]">{t("contactPage.quick.title")}</h3>
          <p className="text-sm md:text-base text-[#485A69]">{t("contactPage.quick.subtitle")}</p>
          <ul className="space-y-2 text-sm md:text-base text-[#00A3A0] font-semibold">
            <li>
              <Link href="/faqs" className="hover:underline">
                {t("contactPage.quick.linkFaqs")}
              </Link>{" "}
              <span className="text-[#485A69] font-normal">{t("contactPage.quick.linkFaqsDesc")}</span>
            </li>
            <li>
              <Link href="/partnership" className="hover:underline">
                {t("contactPage.quick.linkCentres")}
              </Link>{" "}
              <span className="text-[#485A69] font-normal">{t("contactPage.quick.linkCentresDesc")}</span>
            </li>
          </ul>
        </div>
      </section>
      <Footer />
    </main>
  )
}

function FormField({
  id,
  label,
  placeholder,
  type = "text",
}: {
  id: string
  label: string
  placeholder: string
  type?: string
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-[#111929]">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        className="w-full h-12 px-4 rounded-[12px] border border-[#EFF1F3] bg-[#F9FBFD] text-[#292929] placeholder:text-[#B0B7C3] focus:outline-none focus:ring-2 focus:ring-[#0ABAB5] focus:border-transparent"
        placeholder={placeholder}
      />
    </div>
  )
}

function FormSelect({
  id,
  label,
  placeholder,
}: {
  id: string
  label: string
  placeholder: string
}) {
  const { t } = useLanguage()
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-[#111929]">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          name={id}
          className="w-full h-12 px-4 pr-10 rounded-[12px] border border-[#EFF1F3] bg-[#F9FBFD] text-[#292929] placeholder:text-[#B0B7C3] focus:outline-none focus:ring-2 focus:ring-[#0ABAB5] focus:border-transparent appearance-none"
          defaultValue=""
        >
          <option value="" disabled>
            {placeholder}
          </option>
          <option>{t("contactPage.form.category.optionGeneral")}</option>
          <option>{t("contactPage.form.category.optionPartnership")}</option>
          <option>{t("contactPage.form.category.optionSupport")}</option>
          <option>{t("contactPage.form.category.optionFeedback")}</option>
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#B0B7C3]">▾</span>
      </div>
    </div>
  )
}

function FormTextArea({
  id,
  label,
  placeholder,
}: {
  id: string
  label: string
  placeholder: string
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-[#111929]">
        {label}
      </label>
      <textarea
        id={id}
        name={id}
        rows={6}
        className="w-full px-4 py-3 rounded-[12px] border border-[#EFF1F3] bg-[#F9FBFD] text-[#292929] placeholder:text-[#B0B7C3] focus:outline-none focus:ring-2 focus:ring-[#0ABAB5] focus:border-transparent"
        placeholder={placeholder}
      />
    </div>
  )
}

