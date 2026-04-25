import { useEffect } from "react"
import { Link } from "react-router-dom"
import {
  BookOpen,
  ArrowUpRight,
  FolderOpen,
  ArrowLeftRight,
  Star,
  TrendingUp,
} from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { useCatalogueStore } from "@/stores/catalogue-store"
import { useUIStore } from "@/stores/ui-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate, getInitials, truncate } from "@/lib/utils"

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { resources, fetchResources } = useCatalogueStore()
  const { notifications, borrowRequests, fetchNotifications, fetchBorrowRequests } = useUIStore()

  useEffect(() => {
    fetchResources()
    fetchNotifications()
    fetchBorrowRequests()
  }, [fetchResources, fetchNotifications, fetchBorrowRequests])

  const recentResources = resources.slice(0, 4)
  const pendingRequests = borrowRequests.filter((r) => r.status === "pending")
  const unreadNotifications = notifications.filter((n) => !n.read)

  const stats = [
    {
      label: "Resources Shared",
      value: user?.resourcesShared || 0,
      icon: FolderOpen,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Resources Borrowed",
      value: user?.resourcesBorrowed || 0,
      icon: ArrowLeftRight,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Pending Requests",
      value: pendingRequests.length,
      icon: BookOpen,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      label: "Unread Notifications",
      value: unreadNotifications.length,
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-medium tracking-tight">
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground">
            {"Here's what's happening with your resources today."}
          </p>
        </div>
        <Button asChild>
          <Link to="/catalogue">
            Browse Catalogue
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`rounded-lg p-3 ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Resources */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Resources</CardTitle>
              <CardDescription>Latest additions to the catalogue</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/catalogue">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentResources.map((resource) => (
              <Link
                key={resource.id}
                to={`/resource/${resource.id}`}
                className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-muted"
              >
                <div className="h-16 w-16 rounded-md bg-muted overflow-hidden flex-shrink-0">
                  {resource.images[0] ? (
                    <img
                      src={resource.images[0]}
                      alt={resource.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium leading-tight">
                    {truncate(resource.title, 40)}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {resource.owner.name}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs capitalize">
                      {resource.category.replace("-", " ")}
                    </Badge>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Star className="h-3 w-3 mr-1 fill-accent text-accent" />
                      {resource.rating.toFixed(1)}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Pending Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pending Requests</CardTitle>
              <CardDescription>Requests awaiting your response</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/borrowing">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ArrowLeftRight className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No pending requests</p>
                <p className="text-sm text-muted-foreground">
                  {"You're all caught up!"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.slice(0, 3).map((request) => (
                  <div
                    key={request.id}
                    className="flex items-start gap-4 rounded-lg border p-4"
                  >
                    <Avatar>
                      <AvatarImage src={request.borrower.avatar} />
                      <AvatarFallback>
                        {getInitials(request.borrower.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{request.borrower.name}</p>
                      <p className="text-sm text-muted-foreground">
                        wants to borrow{" "}
                        <span className="font-medium text-foreground">
                          {truncate(request.resource.title, 30)}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(request.requestedAt)}
                      </p>
                    </div>
                    <Button size="sm" asChild>
                      <Link to="/borrowing">Review</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto py-4 flex-col" asChild>
              <Link to="/my-resources">
                <FolderOpen className="h-6 w-6 mb-2" />
                <span>Add Resource</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col" asChild>
              <Link to="/catalogue">
                <BookOpen className="h-6 w-6 mb-2" />
                <span>Browse Catalogue</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col" asChild>
              <Link to="/borrowing">
                <ArrowLeftRight className="h-6 w-6 mb-2" />
                <span>View Borrowing</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col" asChild>
              <Link to="/messages">
                <Star className="h-6 w-6 mb-2" />
                <span>Messages</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
