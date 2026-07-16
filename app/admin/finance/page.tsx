import { redirect } from "next/navigation"

/** Legacy finance hub → payments */
export default function FinancePage() {
  redirect("/admin/payments")
}
