import { redirect } from "next/navigation";

/** ADR-006 D9 — the old landing retires; the Profile section replaces it. */
export default function AccountHomePage() {
  redirect("/account/profile");
}
