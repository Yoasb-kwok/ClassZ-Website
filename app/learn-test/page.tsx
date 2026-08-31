import type { Metadata } from "next"
import { LearnTestStage } from "@/components/learn-test/learn-test-stage"

export const metadata: Metadata = {
  title: "Learning Record demo | ClassZ",
  description: "Presentation page for ClassZ Learning Record input and companion report.",
  robots: { index: false, follow: false },
}

export default function LearnTestPage() {
  return <LearnTestStage />
}
