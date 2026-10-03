import type { Metadata } from "next";
import Link from "next/link";
import {
  getPublicCourse,
  getPublicClasses,
  classesForCourse,
  type PublicClass,
} from "@/lib/public-courses";
import { getHostCentre } from "@/lib/public-centres";
import { PaymentClient } from "@/components/payment/payment-client";

export const metadata: Metadata = {
  title: "Reserve your spot",
  robots: { index: false },
};

type Params = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function PaymentPage({ searchParams }: Params) {
  const sp = await searchParams;
  const courseId = Number(firstParam(sp.course));
  const classIds = firstParam(sp.classes)
    .split(",")
    .map((v) => Number(v.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);

  const course =
    Number.isFinite(courseId) && courseId > 0
      ? await getPublicCourse(courseId)
      : null;

  if (!course) {
    // No course context — send the parent back to the catalogue.
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center">
        <h1 className="text-[24px] font-[weight:590] text-ink">
          Nothing selected yet
        </h1>
        <p className="text-[14px] text-[#5E5E5E]">
          Pick a program&apos;s sessions first, then continue to checkout.
        </p>
        <Link
          href="/programs"
          className="flex h-[37px] items-center justify-center rounded-[8px] bg-[#222222] px-[24px] text-[14px] font-[weight:590] text-white"
        >
          Browse programs
        </Link>
      </main>
    );
  }

  // Only sessions that belong to the course's program are bookable.
  const allClasses = await getPublicClasses();
  const programSessions = classesForCourse(allClasses, course);
  const wanted = classIds.length ? classIds : programSessions.map((s) => s.id);
  const sessions: PublicClass[] = programSessions.filter((s) =>
    wanted.includes(s.id),
  );

  const hostCentre = await getHostCentre(course.center_id);

  return (
    <PaymentClient
      course={course}
      sessions={sessions}
      centreName={hostCentre?.name ?? ""}
      centreAvatar={hostCentre?.avatar ?? null}
      initialStatus={firstParam(sp.status) || null}
      initialSessionId={firstParam(sp.session_id) || null}
    />
  );
}
