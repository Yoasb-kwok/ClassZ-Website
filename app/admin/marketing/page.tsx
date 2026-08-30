import { Suspense } from "react"
import { MarketingHub } from "@/components/admin/marketing-hub"

export default function MarketingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-classz-400 border-t-transparent" />
        </div>
      }
    >
      <MarketingHub />
    </Suspense>
  )
}
