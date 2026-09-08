"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { CLASSZ_SESSION_EVENT } from "@/lib/classz-auth";
import { isCourseSaved, toggleCourseSaved } from "@/lib/saved-courses";

export function SaveCourseButton({ courseId }: { courseId: number }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(isCourseSaved(courseId));
    sync();
    window.addEventListener(CLASSZ_SESSION_EVENT, sync);
    return () => window.removeEventListener(CLASSZ_SESSION_EVENT, sync);
  }, [courseId]);

  return (
    <button
      type="button"
      data-testid="save-course-button"
      aria-label={saved ? "Remove from saved" : "Save course"}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setSaved(toggleCourseSaved(courseId));
      }}
      className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm"
    >
      <Heart
        className={`h-4 w-4 ${saved ? "fill-[#E5484D] text-[#E5484D]" : "text-[#BDBDBD]"}`}
        strokeWidth={2}
        fill={saved ? "currentColor" : "none"}
      />
    </button>
  );
}
