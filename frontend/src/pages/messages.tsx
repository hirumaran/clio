import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useAuthStore } from "@/stores/auth-store"
import { useUIStore } from "@/stores/ui-store"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Send, Search, ArrowLeft } from "lucide-react"
import { cn, formatRelativeTime, getInitials } from "@/lib/utils"

export default function MessagesPage() {
  const { conversationId } = useParams()
  const { user } = useAuthStore()
  const {
    conversations,
    messages,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markConversationRead,
  } = useUIStore()

  const [selectedId, setSelectedId] = useState<string | null>(conversationId ?? null)
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  useEffect(() => {
    if (selectedId) {
      fetchMessages(selectedId)
      markConversationRead(selectedId)
    }
  }, [selectedId, fetchMessages, markConversationRead])

  useEffect(() => {
    if (conversationId) setSelectedId(conversationId)
  }, [conversationId])

  if (!user) return null

  const filteredConversations = conversations.filter((c) =>
    searchQuery
      ? c.participants.some(
          (p) =>
            p.id !== user.id &&
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : true
  )

  const activeConversation = conversations.find((c) => c.id === selectedId)
  const activePartner = activeConversation?.participants.find(
    (p) => p.id !== user.id
  )
  const activeMessages = selectedId ? messages[selectedId] ?? [] : []

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedId) return
    sendMessage(selectedId, newMessage.trim())
    setNewMessage("")
  }

  return (
    <div className="h-[calc(100vh-7rem)] flex bg-card rounded-lg border overflow-hidden">
      {/* Conversation List */}
      <div
        className={cn(
          "w-full md:w-80 lg:w-96 border-r border-border flex flex-col bg-background",
          selectedId && "hidden md:flex"
        )}
      >
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-medium tracking-tight mb-3">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No conversations yet
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredConversations.map((conv) => {
                const partner = conv.participants.find(
                  (p) => p.id !== user.id
                )
                if (!partner) return null
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={cn(
                      "w-full flex items-start gap-3 p-4 hover:bg-muted transition-colors text-left",
                      selectedId === conv.id && "bg-muted"
                    )}
                  >
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={partner.avatar} alt={partner.name} />
                      <AvatarFallback>
                        {getInitials(partner.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-medium truncate">{partner.name}</p>
                        {conv.lastMessage && (
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {formatRelativeTime(conv.lastMessage.sentAt)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.lastMessage?.content ?? "No messages yet"}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="flex-shrink-0 bg-primary text-primary-foreground text-xs font-medium rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Message Thread */}
      <div
        className={cn(
          "flex-1 flex flex-col",
          !selectedId && "hidden md:flex"
        )}
      >
        {activePartner && activeConversation ? (
          <>
            <div className="p-4 border-b border-border flex items-center gap-3 bg-background">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSelectedId(null)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarImage src={activePartner.avatar} alt={activePartner.name} />
                <AvatarFallback>{getInitials(activePartner.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{activePartner.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {activePartner.school ?? ""}
                </p>
              </div>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="flex flex-col gap-3 max-w-2xl mx-auto">
                {activeMessages.map((msg, idx, arr) => {
                  const isOwn = msg.senderId === user.id
                  const showAvatar =
                    !isOwn &&
                    (idx === 0 || arr[idx - 1].senderId !== msg.senderId)
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-2",
                        isOwn ? "justify-end" : "justify-start"
                      )}
                    >
                      {!isOwn && (
                        <div className="w-8 flex-shrink-0">
                          {showAvatar && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={activePartner.avatar} />
                              <AvatarFallback className="text-xs">
                                {getInitials(activePartner.name)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[75%] px-4 py-2 rounded-2xl",
                          isOwn
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-muted text-foreground rounded-bl-sm"
                        )}
                      >
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        <p
                          className={cn(
                            "text-xs mt-1",
                            isOwn
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          )}
                        >
                          {formatRelativeTime(msg.sentAt)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
            <Separator />
            <form
              onSubmit={handleSend}
              className="p-4 flex items-center gap-2 bg-background"
            >
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div>
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Send className="h-7 w-7 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-semibold mb-1">
                Select a conversation
              </h2>
              <p className="text-sm text-muted-foreground">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
