import { forwardRef, useId } from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
}

/**
 * Rebrand input (Figma input set #1593:16490): 8px radius, shade-100 border,
 * label + helper/error text. Error state uses destructive coral.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, helperText, error, className, id, ...props },
  ref
) {
  const autoId = useId()
  const inputId = id ?? autoId
  const descId = error ?? helperText ? `${inputId}-desc` : undefined
  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-ink">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={descId}
        className={cn(
          "h-11 w-full rounded-input border bg-white px-4 text-base text-ink placeholder:text-shade-300",
          "focus:border-classz-400 focus:outline-none focus:ring-2 focus:ring-classz-400/30",
          error ? "border-destructive" : "border-shade-100",
          "disabled:cursor-not-allowed disabled:bg-[#F5F5F5]",
          className
        )}
        {...props}
      />
      {(error ?? helperText) && (
        <p id={descId} className={cn("text-xs", error ? "text-destructive" : "text-shade-400")}>
          {error ?? helperText}
        </p>
      )}
    </div>
  )
})
