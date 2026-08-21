"use client"

import * as PopoverPrimitive from "@radix-ui/react-popover"
import { cn } from "@/lib/utils"

export const Popover = PopoverPrimitive.Root
export const PopoverTrigger = PopoverPrimitive.Trigger

/**
 * Rebrand popover: 12px radius + soft shadow (Figma e.g. schedule-filter #2046:29743).
 */
export function PopoverContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        className={cn(
          "z-[100] rounded-card border border-shade-100 bg-white p-4 shadow-[0_6px_16px_2px_rgba(0,0,0,0.12)]",
          className
        )}
        {...props}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}
