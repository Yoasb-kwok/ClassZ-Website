"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  className?: string
}

/**
 * Rebrand modal: 24px radius, soft shadow (Figma e.g. promo-code #2611:23699).
 */
export function Modal({ open, onOpenChange, title, children, className }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/40" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-[101] max-h-[85vh] w-[min(92vw,32rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-modal bg-white p-8 shadow-[0_6px_16px_2px_rgba(0,0,0,0.12)]",
            className
          )}
        >
          <Dialog.Title className="text-lg font-semibold text-ink">{title}</Dialog.Title>
          <Dialog.Close asChild>
            <button
              aria-label="Close"
              className="absolute right-4 top-4 rounded-md p-1 text-shade-400 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-classz-400"
            >
              <X className="h-5 w-5" />
            </button>
          </Dialog.Close>
          <div className="mt-4">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
