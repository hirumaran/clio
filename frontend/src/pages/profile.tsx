import { Link } from "react-router-dom"
import { mockUsers, mockResources } from "@/data/mock-data"
import { useAuthStore } from "@/stores/auth-store"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResourceCard } from "@/components/resource-card"
import { Mail, GraduationCap, Star, MessageSquare, Calendar, Edit } from "lucide-react"
import { formatDate, getInitials } from "@/lib/utils"

export default function ProfilePage() {
  const { user: currentUser } = useAuthStore()

  const profileUser = currentUser
  const isOwnProfile = true

  if (!profileUser) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">User not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const userResources = mockResources.filter((r) => r.ownerId === profileUser.id)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 mx-auto md:mx-0">
              <AvatarImage src={profileUser.avatar} alt={profileUser.name} />
              <AvatarFallback className="text-2xl">
                {getInitials(profileUser.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                <div>
                  <h1 className="text-2xl md:text-3xl font-medium tracking-tight mb-1">
                    {profileUser.name}
                  </h1>
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-end">
                  {isOwnProfile ? (
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/messages?user=${profileUser.id}`}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start text-sm text-muted-foreground mb-4">
                {profileUser.school && (
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4" />
                    <span>{profileUser.school}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDate(profileUser.joinedAt)}</span>
                </div>
              </div>
              {profileUser.bio && (
                <p className="text-sm leading-relaxed mb-4">{profileUser.bio}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 md:p-6 text-center">
            <p className="text-2xl md:text-3xl font-semibold text-primary">
              {profileUser.resourcesShared}
            </p>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Resources Shared
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6 text-center">
            <p className="text-2xl md:text-3xl font-semibold text-primary">
              {profileUser.resourcesBorrowed}
            </p>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Resources Borrowed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6 text-center">
            <p className="text-2xl md:text-3xl font-semibold text-primary">
              {userResources.reduce((sum, r) => sum + r.borrowCount, 0)}
            </p>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Times Borrowed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="resources">
        <TabsList>
          <TabsTrigger value="resources">
            Resources ({userResources.length})
          </TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="mt-6">
          {userResources.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No resources shared yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} showOwner={false} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="about" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact & Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm">{profileUser.email}</p>
                </div>
              </div>
              {profileUser.school && (
                <div className="flex items-start gap-3">
                  <GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">School</p>
                    <p className="text-sm">{profileUser.school}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
