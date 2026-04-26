import { MessageSquareText } from "lucide-react"

export function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-muted)]/50">
        <MessageSquareText className="h-6 w-6 text-muted-foreground/50" aria-hidden="true" />
      </div>
      <div className="space-y-1.5">
        <p className="text-[15px] font-medium text-foreground">Select a conversation</p>
        <p className="text-[13px] text-muted-foreground/60">
          Choose someone from your list to start messaging
        </p>
      </div>
    </div>
  )
}
