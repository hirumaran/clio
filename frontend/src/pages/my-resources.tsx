import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  Archive,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Edit,
  Eye,
  FolderOpen,
  MoreVertical,
  PackageOpen,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { useCatalogueStore } from "@/stores/catalogue-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  available: "border-emerald-300/25 bg-emerald-300/12 text-emerald-100",
  borrowed: "border-amber-300/25 bg-amber-300/12 text-amber-100",
  reserved: "border-indigo-300/25 bg-indigo-300/12 text-indigo-100",
  unavailable: "border-white/10 bg-white/[0.05] text-stone-300",
}

const glassSurface =
  "border border-[#c6a66b]/18 bg-[#17130f]/78 shadow-[0_24px_90px_rgba(0,0,0,0.32)] backdrop-blur-2xl"
const quietGlass =
  "border border-[#c6a66b]/14 bg-[#1c1713]/72 backdrop-blur-xl"

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

function firstNameOf(name?: string) {
  return name?.trim().split(/\s+/)[0] || "Your"
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof PackageOpen
  label: string
  value: number
}) {
  return (
    <div className="rounded-[1.1rem] border border-[#c6a66b]/16 bg-[linear-gradient(135deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-serif text-4xl leading-none text-[#f7efe3]">{value}</p>
          <p className="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#b8aa96]">
            {label}
          </p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-full bg-[#8f98ff]/12 text-[#aeb5ff]">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
    </div>
  )
}

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
  const ownerFirstName = firstNameOf(user?.name)

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
    <article
      className={cn(
        "group overflow-hidden rounded-[1.15rem] transition-colors duration-200 hover:border-[#c6a66b]/28 motion-reduce:transition-none",
        quietGlass,
      )}
    >
      <div className="grid gap-0 md:grid-cols-[12rem_minmax(0,1fr)]">
        <Link
          to={`/resource/${resource.id}`}
          className="relative block min-h-44 overflow-hidden bg-[#11100e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#aeb5ff] md:min-h-full"
        >
          {resource.images[0] ? (
            <img
              src={resource.images[0]}
              alt={resource.title}
              className="h-full w-full object-cover brightness-[0.78] saturate-[0.86] transition-transform duration-300 ease-out group-hover:scale-[1.018] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          ) : (
            <div className="flex h-full min-h-44 w-full items-center justify-center bg-[radial-gradient(circle_at_center,rgba(143,152,255,0.12),transparent_62%)]">
              <FolderOpen className="h-12 w-12 text-white/25" aria-hidden="true" />
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(15,12,9,0.72),rgba(15,12,9,0.08)_58%,transparent)]" />
        </Link>

        <div className="flex min-w-0 flex-col justify-between gap-5 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-[#c6a66b]/18 bg-[#c6a66b]/10 text-[#ead9b8]">
                  {resource.category.replace("-", " ")}
                </Badge>
                <Badge className={cn("capitalize backdrop-blur-md", statusColors[resource.status])}>
                  {resource.status}
                </Badge>
              </div>
              <Link
                to={`/resource/${resource.id}`}
                className="mt-3 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#aeb5ff]"
              >
                <h3 className="text-lg font-semibold leading-tight text-[#f4eadb] transition-colors duration-200 group-hover:text-[#d9dcff]">
                  {truncate(resource.title, 72)}
                </h3>
              </Link>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#cfc4b4]">
                {truncate(resource.description || "No description added yet.", 130)}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 cursor-pointer text-[#d8cdbd] hover:bg-[#c6a66b]/10 hover:text-[#f7efe3]"
                  aria-label={`Open actions for ${resource.title}`}
                >
                  <MoreVertical className="h-4 w-4" aria-hidden="true" />
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

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#c6a66b]/12 pt-4 text-xs text-[#a89d8c]">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5 text-[#aeb5ff]" aria-hidden="true" />
              Added {formatDate(resource.createdAt)}
            </span>
            <Button
              size="sm"
              variant="outline"
              className="min-h-9 cursor-pointer border-[#c6a66b]/18 bg-white/[0.035] text-[#efe6d8] hover:bg-[#c6a66b]/10"
              asChild
            >
              <Link to={`/resource/${resource.id}`}>
                Open listing
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  )

  return (
    <div className="relative isolate mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
      <div
        className="pointer-events-none absolute inset-x-0 top-[-5rem] -z-10 mx-auto h-[34rem] max-w-5xl rounded-full bg-[radial-gradient(circle_at_center,rgba(198,166,107,0.13),rgba(143,152,255,0.08)_34%,transparent_70%)] blur-3xl"
        aria-hidden="true"
      />

      <section className={cn("relative overflow-hidden rounded-[1.75rem] p-5 md:p-7 lg:p-8", glassSurface)}>
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f4d58f]/45 to-transparent"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-28 -top-24 h-80 w-80 rounded-full bg-[#f4d58f]/8 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-28 left-10 h-72 w-72 rounded-full bg-[#8f98ff]/8 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-end">
          <div>
            <div className="inline-flex min-h-7 items-center gap-2 rounded-full border border-[#f4d58f]/22 bg-[#f4d58f]/8 px-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#ead9b8]">
              <Archive className="h-3.5 w-3.5" aria-hidden="true" />
              Resource archive
            </div>
            <h1 className="mt-4 font-serif text-4xl leading-none text-[#f7efe3] md:text-6xl">
              {ownerFirstName}&apos;s Resources
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#cfc4b4]">
              Manage the costumes, scripts, props, and production materials your program
              can share with the Clio network.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => setAddDialogOpen(true)}
              className="min-h-11 cursor-pointer rounded-full bg-[#8f98ff] px-5 text-[#11100f] shadow-[0_14px_40px_rgba(143,152,255,0.28)] hover:bg-[#aeb5ff]"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Resource
            </Button>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#aeb5ff]" />
              <Input
                placeholder="Search your resources..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 rounded-full border-[#c6a66b]/18 bg-black/20 pl-11 text-[#f4eadb] placeholder:text-[#a99f91] focus-visible:ring-[#aeb5ff]"
              />
            </div>
          </div>
        </div>

        <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
          <StatTile icon={CheckCircle2} label="Available" value={availableResources.length} />
          <StatTile icon={PackageOpen} label="Borrowed" value={borrowedResources.length} />
          <StatTile icon={Sparkles} label="Reserved" value={reservedResources.length} />
        </div>
      </section>

      <Tabs defaultValue="all" className="mt-7">
        <section className={cn("rounded-[1.5rem] p-5 md:p-6", glassSurface)}>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b8aa96]">
                Shelf inventory
              </p>
              <h2 className="mt-2 font-serif text-3xl text-[#f7efe3]">
                Current listings
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#cfc4b4]">
                {filteredResources.length} listing{filteredResources.length === 1 ? "" : "s"} in view.
              </p>
            </div>

            <TabsList className="h-auto w-fit rounded-full border border-[#c6a66b]/14 bg-black/20 p-1 text-[#a99f91]">
              <TabsTrigger
                value="all"
                className="rounded-full px-4 py-2 text-sm data-[state=active]:bg-[#f4eadb] data-[state=active]:text-[#15110d] data-[state=active]:shadow-none"
              >
                All ({filteredResources.length})
              </TabsTrigger>
              <TabsTrigger
                value="available"
                className="rounded-full px-4 py-2 text-sm data-[state=active]:bg-[#f4eadb] data-[state=active]:text-[#15110d] data-[state=active]:shadow-none"
              >
                Available ({availableResources.length})
              </TabsTrigger>
              <TabsTrigger
                value="borrowed"
                className="rounded-full px-4 py-2 text-sm data-[state=active]:bg-[#f4eadb] data-[state=active]:text-[#15110d] data-[state=active]:shadow-none"
              >
                Borrowed ({borrowedResources.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="mt-6 space-y-4">
            {filteredResources.length === 0 ? (
              <div className={cn("rounded-[1.15rem] p-12 text-center", quietGlass)}>
                <FolderOpen className="mx-auto h-12 w-12 text-[#aeb5ff]" aria-hidden="true" />
                <h3 className="mt-5 font-serif text-2xl text-[#f7efe3]">No resources yet</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#cfc4b4]">
                  Start building your Clio shelf with the scripts, costumes, and tools your
                  program can share.
                </p>
                <Button
                  onClick={() => setAddDialogOpen(true)}
                  className="mt-6 min-h-10 cursor-pointer rounded-full bg-[#8f98ff] px-5 text-[#11100f] hover:bg-[#aeb5ff]"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Add Your First Resource
                </Button>
              </div>
            ) : (
              filteredResources.map((resource) => (
                <ResourceItem key={resource.id} resource={resource} />
              ))
            )}
          </TabsContent>

          <TabsContent value="available" className="mt-6 space-y-4">
            {availableResources.length === 0 ? (
              <div className={cn("rounded-[1.15rem] p-10 text-center", quietGlass)}>
                <p className="text-sm text-[#cfc4b4]">No available resources match this view.</p>
              </div>
            ) : (
              availableResources.map((resource) => (
                <ResourceItem key={resource.id} resource={resource} />
              ))
            )}
          </TabsContent>

          <TabsContent value="borrowed" className="mt-6 space-y-4">
            {borrowedResources.length === 0 ? (
              <div className={cn("rounded-[1.15rem] p-10 text-center", quietGlass)}>
                <p className="text-sm text-[#cfc4b4]">No borrowed resources match this view.</p>
              </div>
            ) : (
              borrowedResources.map((resource) => (
                <ResourceItem key={resource.id} resource={resource} />
              ))
            )}
          </TabsContent>
        </section>
      </Tabs>

      {/* Add Resource Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="border-[#c6a66b]/18 bg-[#17130f]/95 text-[#f4eadb] shadow-[0_24px_90px_rgba(0,0,0,0.46)] backdrop-blur-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-[#f7efe3]">
              Add New Resource
            </DialogTitle>
            <DialogDescription className="text-[#cfc4b4]">
              Share a resource with the drama teaching community
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-[#d8cdbd]">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Romeo and Juliet Script Collection"
                value={formData.title}
                className="border-[#c6a66b]/18 bg-black/20 text-[#f4eadb] placeholder:text-[#a99f91]"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-[#d8cdbd]">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your resource..."
                value={formData.description}
                className="border-[#c6a66b]/18 bg-black/20 text-[#f4eadb] placeholder:text-[#a99f91]"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-[#d8cdbd]">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: value as ResourceCategory,
                    }))
                  }
                >
                  <SelectTrigger className="border-[#c6a66b]/18 bg-black/20 text-[#f4eadb]">
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
                <Label className="text-[#d8cdbd]">Condition *</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      condition: value as ResourceCondition,
                    }))
                  }
                >
                  <SelectTrigger className="border-[#c6a66b]/18 bg-black/20 text-[#f4eadb]">
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
              <Label htmlFor="tags" className="text-[#d8cdbd]">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="e.g., shakespeare, tragedy, high-school"
                value={formData.tags}
                className="border-[#c6a66b]/18 bg-black/20 text-[#f4eadb] placeholder:text-[#a99f91]"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, tags: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="cursor-pointer border-[#c6a66b]/20 bg-white/[0.035] text-[#f4eadb] hover:bg-[#c6a66b]/10"
              onClick={() => setAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddResource}
              className="cursor-pointer bg-[#8f98ff] text-[#11100f] hover:bg-[#aeb5ff]"
            >
              Add Resource
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
