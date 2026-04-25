import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Star,
  ShoppingCart,
  MessageSquare,
  Calendar,
  User,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useCatalogueStore } from "@/stores/catalogue-store"
import { useCartStore } from "@/stores/cart-store"
import { useAuthStore } from "@/stores/auth-store"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn, formatDate, getInitials, pluralize } from "@/lib/utils"
import { toast } from "sonner"

const statusColors = {
  available: "bg-success text-success-foreground",
  borrowed: "bg-warning text-warning-foreground",
  reserved: "bg-accent text-accent-foreground",
  unavailable: "bg-muted text-muted-foreground",
}

const conditionLabels = {
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  worn: "Worn",
}

export default function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { resources, fetchResources } = useCatalogueStore()
  const { addItem, isInCart } = useCartStore()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (resources.length === 0) {
      fetchResources()
    }
  }, [resources.length, fetchResources])

  const resource = resources.find((r) => r.id === id)
  const inCart = resource ? isInCart(resource.id) : false
  const isOwner = resource?.ownerId === user?.id

  if (!resource) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-xl font-semibold mb-2">Resource not found</h2>
        <p className="text-muted-foreground mb-4">
          The resource you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button asChild>
          <Link to="/catalogue">Back to Catalogue</Link>
        </Button>
      </div>
    )
  }

  const handleAddToCart = () => {
    if (resource.status !== "available") {
      toast.error("This resource is not available for borrowing")
      return
    }

    if (inCart) {
      toast.info("Already in cart")
      return
    }

    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 14)

    addItem(resource, startDate.toISOString(), endDate.toISOString())
    toast.success("Added to cart")
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === resource.images.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? resource.images.length - 1 : prev - 1
    )
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Image gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
            {resource.images.length > 0 ? (
              <img
                src={resource.images[currentImageIndex]}
                alt={resource.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <span className="text-muted-foreground">No image available</span>
              </div>
            )}

            {/* Image navigation */}
            {resource.images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {resource.images.map((_, idx) => (
                    <button
                      key={idx}
                      className={cn(
                        "h-2 w-2 rounded-full transition-colors",
                        idx === currentImageIndex ? "bg-white" : "bg-white/50"
                      )}
                      onClick={() => setCurrentImageIndex(idx)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {resource.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {resource.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={cn(
                    "h-16 w-16 shrink-0 rounded-md overflow-hidden border-2 transition-colors",
                    idx === currentImageIndex
                      ? "border-primary"
                      : "border-transparent"
                  )}
                >
                  <img
                    src={img}
                    alt={`${resource.title} ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-start gap-2 mb-2">
              <Badge variant="secondary" className="capitalize">
                {resource.category.replace("-", " ")}
              </Badge>
              <Badge className={cn("capitalize", statusColors[resource.status])}>
                {resource.status}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold mb-2">{resource.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Star className="h-4 w-4 fill-accent text-accent mr-1" />
                <span className="font-medium text-foreground">
                  {resource.rating.toFixed(1)}
                </span>
                <span className="ml-1">
                  ({resource.reviewCount} {pluralize(resource.reviewCount, "review")})
                </span>
              </div>
              <span>{resource.borrowCount} times borrowed</span>
            </div>
          </div>

          {/* Condition */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Condition:</span>
            <Badge variant="outline">{conditionLabels[resource.condition]}</Badge>
          </div>

          {/* Owner card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={resource.owner.avatar} />
                  <AvatarFallback>
                    {getInitials(resource.owner.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{resource.owner.name}</p>
                  {resource.owner.school && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {resource.owner.school}
                    </p>
                  )}
                </div>
                {!isOwner && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/messages?user=${resource.ownerId}`}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action buttons */}
          {!isOwner && resource.status === "available" && (
            <div className="flex gap-3">
              <Button className="flex-1" onClick={handleAddToCart}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                {inCart ? "In Cart" : "Add to Cart"}
              </Button>
              <Button variant="outline" asChild>
                <Link to="/cart">
                  <Calendar className="h-4 w-4 mr-2" />
                  Request Now
                </Link>
              </Button>
            </div>
          )}

          {isOwner && (
            <div className="p-4 rounded-lg bg-muted text-sm">
              <p className="font-medium">This is your resource</p>
              <p className="text-muted-foreground">
                You can manage it from My Resources
              </p>
            </div>
          )}

          {resource.status !== "available" && !isOwner && (
            <div className="p-4 rounded-lg bg-muted text-sm">
              <p className="font-medium">Currently {resource.status}</p>
              <p className="text-muted-foreground">
                Contact the owner to inquire about availability
              </p>
            </div>
          )}

          {/* Tags */}
          {resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {resource.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs section */}
      <Tabs defaultValue="description" className="mt-8">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews ({resource.reviewCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground whitespace-pre-wrap">
                {resource.description}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Owner</p>
                    <p className="font-medium">{resource.owner.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Added</p>
                    <p className="font-medium">{formatDate(resource.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="font-medium">{formatDate(resource.updatedAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Condition</p>
                    <p className="font-medium capitalize">{resource.condition}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Star className="h-10 w-10 mx-auto mb-3" />
                <p>No reviews yet</p>
                <p className="text-sm">Be the first to review this resource</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
