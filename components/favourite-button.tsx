"use client"

import { Heart } from "lucide-react"
import { toggleFavourite, useIsFavourited, type FavItemType } from "@/lib/favourites"

/**
 * ADR-006 D8 — the red heart. Courses already had one (SaveCourseButton);
 * centres get the same affordance via this shared button.
 */
export function FavouriteButton({
  type,
  id,
  className = "absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm",
}: {
  type: FavItemType
  id: number
  className?: string
}) {
  const favourited = useIsFavourited(type, id)

  return (
    <button
      type="button"
      data-testid={`favourite-button-${type}`}
      aria-label={favourited ? "Remove from favourites" : "Add to favourites"}
      aria-pressed={favourited}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void toggleFavourite(type, id)
      }}
      className={className}
    >
      <Heart
        className={`h-4 w-4 ${favourited ? "fill-[#E5484D] text-[#E5484D]" : "text-[#BDBDBD]"}`}
        strokeWidth={2}
        fill={favourited ? "currentColor" : "none"}
      />
    </button>
  )
}
