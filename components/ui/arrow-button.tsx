"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ArrowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  direction: "left" | "right"
  label?: string
}

/**
 * Rebrand carousel arrow (Figma "Left/Right arrw btn" #1595:16500/16534):
 * circular, white, soft shadow.
 */
export function ArrowButton({ direction, label, className, ...props }: ArrowButtonProps) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight
  return (
    <button
      aria-label={label ?? (direction === "left" ? "Previous" : "Next")}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border border-shade-200 bg-white text-ink shadow-[0_6px_16px_rgba(0,0,0,0.12)] transition-colors hover:bg-[#F5F5F5] disabled:opacity-40",
        className
      )}
      {...props}
    >
      <Icon className="h-4 w-4" strokeWidth={1.5} />
    </button>
  )
}
