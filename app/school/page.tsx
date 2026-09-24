import { permanentRedirect } from "next/navigation";

/** /school is retired: `/` is the one and only home (user decision 2026-09-24). */
export default function SchoolPage() {
  permanentRedirect("/");
}
