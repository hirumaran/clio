interface DateSeparatorProps {
  label: string
}

export function DateSeparator({ label }: DateSeparatorProps) {
  return (
    <div className="flex items-center justify-center py-5" role="separator" aria-label={label}>
      <span className="rounded-full bg-[var(--bg-muted)]/50 px-3 py-1 text-[11px] font-medium text-muted-foreground/60">
        {label}
      </span>
    </div>
  )
}
