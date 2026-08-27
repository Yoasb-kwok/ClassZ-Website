import { Suspense } from "react"
import { SubscriptionManager } from "@/components/admin/subscription-manager"

export default function AdminSubscriptionPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16"><div className="h-8 w-8 rounded-full border-2 border-classz-400 border-t-transparent animate-spin" /></div>}>
      <SubscriptionManager />
    </Suspense>
  )
}
