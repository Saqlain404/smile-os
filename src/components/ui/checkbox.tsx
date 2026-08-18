"use client"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  checked,
  onCheckedChange,
}: {
  className?: string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}) {
  return (
    <button
      role="checkbox"
      type="button"
      aria-checked={checked}
      data-state={checked ? "checked" : "unchecked"}
      className={cn(
        "peer shrink-0 rounded-[4px] border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground size-4",
        className
      )}
      onClick={() => onCheckedChange?.(!checked)}
    >
      {checked && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  )
}

export { Checkbox }
