import type { Metadata } from "next";
import { ScheduleClient } from "@/components/schedule/schedule-client";

export const metadata: Metadata = {
  title: "Schedule — ClassZ",
  robots: { index: false },
};

export default function Page() {
  return <ScheduleClient />;
}
