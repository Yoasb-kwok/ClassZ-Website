"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { LearningCompanionReportView } from "@/components/admin/learning-companion-report-view"
import { useLanguage } from "@/components/language-provider"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import {
  COMPANION_ANIMALS,
  COMPANION_ANIMAL_KEYS,
  type CompanionAnimalKey,
} from "@/lib/learning-companion-animals"
import {
  buildSampleCompanionReport,
  exportLearningCompanionPdf,
} from "@/lib/learning-companion-pdf"
import { AdminGhostButton, AdminPrimaryButton } from "@/components/classz-admin-ui"

const STUDENT_NAMES: Record<CompanionAnimalKey, string> = {
  Rabbit: "Alex Chen",
  Owl: "Emily Wong",
  Dolphin: "Marcus Lee",
  Turtle: "Sophie Ng",
  Fox: "Jayden Ho",
  Bee: "Chloe Tam",
}

export default function LearningCompanionSamplesPage() {
  const { locale } = useLanguage()
  const zh = locale === "zh-TW"
  const [active, setActive] = useState<CompanionAnimalKey>("Rabbit")

  const report = useMemo(
    () => buildSampleCompanionReport(COMPANION_ANIMALS[active], STUDENT_NAMES[active]),
    [active],
  )

  return (
    <div className="min-h-screen flex flex-col bg-white text-brand-slate">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="mb-6 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-brand-teal">
              Learning Companion
            </p>
            <h1 className="text-2xl font-semibold sm:text-3xl">
              {zh ? "六種動物人格 Report Sample" : "6 Animal Personality Report Samples"}
            </h1>
            <p className="max-w-3xl text-sm text-brand-slate/70">
              {zh
                ? "已按你提供的 sample PDF 版式更新，並按動物類型放入對應圖片。點擊下方動物切換預覽，亦可輸出 PDF。"
                : "Updated to match your sample PDF layout, with animal artwork embedded by companion type. Switch animals below to preview, or export PDF."}
            </p>
            <Link href="/login" className="inline-block text-sm text-brand-teal hover:underline">
              ← {zh ? "返回登入" : "Back to login"}
            </Link>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {COMPANION_ANIMAL_KEYS.map((key) => {
              const animal = COMPANION_ANIMALS[key]
              const selected = active === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActive(key)}
                  className={`rounded-2xl border-2 p-3 text-center transition-all ${
                    selected
                      ? "border-classz-400 bg-classz-50 shadow-sm"
                      : "border-classz-100 bg-white hover:-translate-y-0.5 hover:border-classz-300 hover:shadow-md"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={animal.poseSrcs[0]}
                    alt={animal.label}
                    className="mx-auto mb-2 h-16 w-16 rounded-xl bg-white object-contain p-1"
                  />
                  <div className="text-sm font-semibold">{animal.shortName}</div>
                  <div className="text-[11px] text-brand-slate/55">{animal.label.replace(`${animal.shortName} `, "")}</div>
                </button>
              )
            })}
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            <AdminPrimaryButton type="button" onClick={() => exportLearningCompanionPdf(report)}>
              {zh ? "輸出此 Sample PDF" : "Export this sample PDF"}
            </AdminPrimaryButton>
            <AdminGhostButton type="button" onClick={() => window.open(`/learning-companion-samples/${active.toLowerCase()}.html`, "_blank")}>
              {zh ? "開啟靜態 HTML Sample" : "Open static HTML sample"}
            </AdminGhostButton>
          </div>

          <div className="rounded-2xl border border-classz-100 bg-white p-4 sm:p-6">
            <LearningCompanionReportView report={report} zh={zh} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
