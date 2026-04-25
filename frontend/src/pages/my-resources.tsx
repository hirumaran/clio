import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Plus, Search, MoreVertical, Edit, Trash2, Eye, FolderOpen } from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { useCatalogueStore } from "@/stores/catalogue-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn, formatDate, truncate } from "@/lib/utils"
import { toast } from "sonner"
import type { Resource, ResourceCategory, ResourceCondition } from "@/types"

const statusColors = {
  available: "bg-success text-success-foreground",
  borrowed: "bg-warning text-warning-foreground",
  reserved: "bg-accent text-accent-foreground",
  unavailable: "bg-muted text-muted-foreground",
}

const categories: { value: ResourceCategory; label: string }[] = [
  { value: "scripts", label: "Scripts" },
  { value: "lesson-plans", label: "Lesson Plans" },
  { value: "costumes", label: "Costumes" },
  { value: "props", label: "Props" },
  { value: "lighting", label: "Lighting" },
  { value: "sound", label: "Sound" },
  { value: "set-design", label: "Set Design" },
  { value: "makeup", label: "Makeup" },
  { value: "music", label: "Music" },
  { value: "other", label: "Other" },
]

const conditions: { value: ResourceCondition; label: string }[] = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "worn", label: "Worn" },
]

export default function MyResourcesPage() {
  const { user } = useAuthStore()
  const { resources, fetchResources } = useCatalogueStore()
  const [search, setSearch] = useState("")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "" as ResourceCategory | "",
    condition: "" as ResourceCondition | "",
    tags: "",
  })

  useEffect(() => {
    fetchResources()
  }, [fetchResources])

  const myResources = resources.filter((r) => r.ownerId === user?.id)
  const filteredResources = myResources.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  )

  const availableResources = filteredResources.filter((r) => r.status === "available")
  const borrowedResources = filteredResources.filter((r) => r.status === "borrowed")
  const reservedResources = filteredResources.filter((r) => r.status === "reserved")

  const handleAddResource = () => {
    if (!formData.title || !formData.category || !formData.condition) {
      toast.error("Please fill in all required fields")
      return
    }

    // In a real app, this would make an API call
    toast.success("Resource added successfully!")
    setAddDialogOpen(false)
    setFormData({
      title: "",
      description: "",
      category: "",
      condition: "",
      tags: "",
    })
  }

  const ResourceItem = ({ resource }: { resource: Resource }) => (
    <div className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
      <div className="h-20 w-20 rounded-md bg-muted overflow-hidden flex-shrink-0">
        {resource.images[0] ? (
          <img
            src={resource.images[0]}
            alt={resource.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <FolderOpen className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-medium leading-tight">
              {truncate(resource.title, 50)}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              {truncate(resource.description, 80)}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/resource/${resource.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary" className="text-xs capitalize">
            {resource.category.replace("-", " ")}
          </Badge>
          <Badge className={cn("text-xs capitalize", statusColors[resource.status])}>
            {resource.status}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Added {formatDate(resource.createdAt)}
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-medium tracking-tight">My Resources</h1>
          <p className="text-muted-foreground">
            Manage the resources you&apos;ve shared with the community
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Resource
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search your resources..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{availableResources.length}</div>
            <p className="text-sm text-muted-foreground">Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{borrowedResources.length}</div>
            <p className="text-sm text-muted-foreground">Currently Borrowed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{reservedResources.length}</div>
            <p className="text-sm text-muted-foreground">Reserved</p>
          </CardContent>
        </Card>
      </div>

      {/* Resources list */}
      {myResources.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No resources yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start sharing resources with the drama teaching community
            </p>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Resource
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({filteredResources.length})</TabsTrigger>
            <TabsTrigger value="available">
              Available ({availableResources.length})
            </TabsTrigger>
            <TabsTrigger value="borrowed">
              Borrowed ({borrowedResources.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 space-y-3">
            {filteredResources.map((resource) => (
              <ResourceItem key={resource.id} resource={resource} />
            ))}
          </TabsContent>

          <TabsContent value="available" className="mt-4 space-y-3">
            {availableResources.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No available resources
              </p>
            ) : (
              availableResources.map((resource) => (
                <ResourceItem key={resource.id} resource={resource} />
              ))
            )}
          </TabsContent>

          <TabsContent value="borrowed" className="mt-4 space-y-3">
            {borrowedResources.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No borrowed resources
              </p>
            ) : (
              borrowedResources.map((resource) => (
                <ResourceItem key={resource.id} resource={resource} />
              ))
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Add Resource Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Resource</DialogTitle>
            <DialogDescription>
              Share a resource with the drama teaching community
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Romeo and Juliet Script Collection"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your resource..."
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: value as ResourceCategory,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Condition *</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      condition: value as ResourceCondition,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((cond) => (
                      <SelectItem key={cond.value} value={cond.value}>
                        {cond.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="e.g., shakespeare, tragedy, high-school"
                value={formData.tags}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, tags: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddResource}>Add Resource</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
