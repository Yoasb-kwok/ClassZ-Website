import "./zpassport.css"
import { StudentAccountGate } from "@/components/account/student-shell"

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <StudentAccountGate>{children}</StudentAccountGate>
}
