import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchInputProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}

export function SearchInput({ value, onChange, placeholder = "Search", className }: SearchInputProps) {
  return (
    <div
      className={cn(
        "group flex h-9 items-center gap-2 rounded-lg bg-[var(--bg-muted)]/50 px-3 transition-colors focus-within:bg-[var(--bg-muted)]",
        className,
      )}
    >
      <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" aria-hidden="true" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-full w-full bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
        aria-label={placeholder}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="rounded-full p-0.5 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-3 w-3" />
        </button>
      ) : null}
    </div>
  )
}
