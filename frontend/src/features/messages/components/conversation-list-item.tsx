import { Pin } from "lucide-react"
import { cn, relativeTimeShort } from "@/lib/utils"
import type { Conversation } from "../types"
import { getAvatarPalette, getInitials } from "../lib/avatar"

interface ConversationListItemProps {
  conversation: Conversation
  active?: boolean
  onClick: () => void
}

export function ConversationListItem({ conversation, active, onClick }: ConversationListItemProps) {
  const counterpart =
    conversation.participants.find((p) => p.id === conversation.counterpartId) ??
    conversation.participants[0]
  const seed = counterpart?.id ?? conversation.id
  const palette = getAvatarPalette(seed)
  const initials = getInitials(counterpart?.name ?? conversation.title)

  const isUnread = conversation.unreadCount > 0

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={cn(
        "group relative flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
        active
          ? "bg-[var(--accent)]"
          : "hover:bg-[var(--bg-muted)]/[0.35]",
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full text-[13px] font-semibold transition-colors",
            active ? "bg-white/20 text-white" : palette.bg,
            active ? "" : palette.text,
          )}
        >
          {initials}
        </div>
        {isUnread && !active && (
          <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--bg-surface)] bg-[var(--accent)]" />
        )}
      </div>

      {/* Body */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p
            className={cn(
              "truncate text-[14px] font-semibold leading-tight",
              active ? "text-white" : isUnread ? "text-foreground" : "text-foreground/80",
            )}
          >
            {conversation.title}
          </p>
          <time
            className={cn(
              "shrink-0 text-[11px] tabular-nums",
              active
                ? "text-white/60"
                : isUnread
                  ? "text-[var(--accent)]"
                  : "text-muted-foreground/60",
            )}
          >
            {relativeTimeShort(conversation.lastMessageAt)}
          </time>
        </div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p
            className={cn(
              "truncate text-[13px] leading-snug",
              active
                ? "text-white/70"
                : isUnread
                  ? "font-medium text-foreground"
                  : "text-muted-foreground/70",
            )}
          >
            {conversation.lastMessagePreview}
          </p>
          <div className="flex items-center gap-1 shrink-0">
            {isUnread && (
              <span className="flex h-2 w-2 rounded-full bg-[var(--accent)]" />
            )}
            {conversation.pinned && (
              <Pin
                className={cn(
                  "h-3 w-3 -rotate-45",
                  active ? "text-white/40" : "text-muted-foreground/30",
                )}
                aria-label="Pinned"
              />
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
