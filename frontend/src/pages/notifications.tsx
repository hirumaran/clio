import { useEffect } from "react"
import { Link } from "react-router-dom"
import { useUIStore } from "@/stores/ui-store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Check, MessageSquare, Package, Star, UserPlus, AlertCircle, ArrowLeftRight, Clock } from "lucide-react"
import { cn, formatRelativeTime } from "@/lib/utils"
import type { NotificationType } from "@/types"

const notificationIcons: Record<NotificationType, React.ElementType> = {
  borrow_request: Package,
  request_approved: Check,
  request_rejected: AlertCircle,
  item_returned: ArrowLeftRight,
  new_message: MessageSquare,
  review_received: Star,
  reminder: Clock,
}

export default function NotificationsPage() {
  const { notifications, fetchNotifications, markNotificationRead, markAllNotificationsRead } = useUIStore()

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const unread = notifications.filter((n) => !n.read)

  const NotificationItem = ({ notification }: { notification: (typeof notifications)[number] }) => {
    const Icon = notificationIcons[notification.type] || Bell
    const content = (
      <div
        className={cn(
          "flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors",
          !notification.read && "bg-primary/5"
        )}
      >
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
            !notification.read ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className={cn("text-sm", !notification.read && "font-medium")}>
              {notification.title}
            </p>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {formatRelativeTime(notification.createdAt)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{notification.message}</p>
        </div>
        {!notification.read && (
          <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
        )}
      </div>
    )

    return notification.actionUrl ? (
      <Link to={notification.actionUrl} onClick={() => markNotificationRead(notification.id)}>
        {content}
      </Link>
    ) : (
      <button onClick={() => markNotificationRead(notification.id)} className="w-full text-left">
        {content}
      </button>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-medium tracking-tight">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Stay updated on borrows, messages, and community activity
          </p>
        </div>
        {unread.length > 0 && (
          <Button variant="outline" size="sm" onClick={markAllNotificationsRead}>
            Mark all read
          </Button>
        )}
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unread.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <Card>
            {notifications.length === 0 ? (
              <CardContent className="p-12 text-center">
                <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <h3 className="font-medium mb-1">No notifications yet</h3>
                <p className="text-sm text-muted-foreground">
                  {"You'll see activity here when people interact with your resources"}
                </p>
              </CardContent>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((n) => (
                  <NotificationItem key={n.id} notification={n} />
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="unread" className="mt-4">
          <Card>
            {unread.length === 0 ? (
              <CardContent className="p-12 text-center">
                <Check className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <h3 className="font-medium mb-1">All caught up!</h3>
                <p className="text-sm text-muted-foreground">You have no unread notifications</p>
              </CardContent>
            ) : (
              <div className="divide-y divide-border">
                {unread.map((n) => (
                  <NotificationItem key={n.id} notification={n} />
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
