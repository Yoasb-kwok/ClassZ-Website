"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { CLASSZ_SESSION_EVENT } from "@/lib/classz-auth";
import { toggleFavourite, useIsFavourited } from "@/lib/favourites";

/**
 * ADR-006 D8 — the course heart now reads/writes the favourites API when the
 * visitor is a logged-in parent; guests keep the localStorage behaviour
 * (handled inside lib/favourites). One-time guest → account merge happens on
 * the first authenticated load (lib/favourites).
 */
export function SaveCourseButton({ courseId }: { courseId: number }) {
  const saved = useIsFavourited("course", courseId);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const sync = () => setPending(false);
    window.addEventListener(CLASSZ_SESSION_EVENT, sync);
    return () => window.removeEventListener(CLASSZ_SESSION_EVENT, sync);
  }, []);

  return (
    <button
      type="button"
      data-testid="save-course-button"
      aria-label={saved ? "Remove from saved" : "Save course"}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (pending) return;
        setPending(true);
        void toggleFavourite("course", courseId).finally(() =>
          setPending(false),
        );
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
