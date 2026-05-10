import { ClasszAdminGate } from "@/components/classz-admin-gate"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <ClasszAdminGate>{children}</ClasszAdminGate>
}
