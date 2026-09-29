import "./zpassport.css";
import { AccountLayoutSwitch } from "@/components/account/account-layout-switch";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AccountLayoutSwitch>{children}</AccountLayoutSwitch>;
}
