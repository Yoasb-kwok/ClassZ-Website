import { cn } from "@/lib/utils"

/**
 * Rebrand card: 12px radius + soft elevation (Figma effect 0 6px 16px rgba(0,0,0,.12)).
 */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-card bg-white p-6 shadow-card", className)} {...props} />
}
