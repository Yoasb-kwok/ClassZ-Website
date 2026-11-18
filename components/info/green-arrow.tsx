export function GreenArrow({ className = "" }: { className?: string }) {
  return (
    <svg width="28" height="29" viewBox="0 0 28 29" fill="none" aria-hidden className={`shrink-0 ${className}`}>
      <path
        d="M4 14.5h18M15.5 7.5 23 14.5l-7.5 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export const GREEN_FONT =
  '"SF Pro", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
