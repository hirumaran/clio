import { Link } from "react-router-dom"
import { Star, BookOpen, ShoppingCart } from "lucide-react"
import type { Resource } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCartStore } from "@/stores/cart-store"
import { cn, getInitials, truncate } from "@/lib/utils"
import { toast } from "sonner"

interface ResourceCardProps {
  resource: Resource
  showOwner?: boolean
}

const STATUS_STYLE: Record<Resource["status"], string> = {
  available: "bg-success text-success-foreground",
  borrowed: "bg-warning text-warning-foreground",
  reserved: "bg-accent text-accent-foreground",
  unavailable: "bg-muted text-muted-foreground",
}

const CONDITION_LABEL: Record<Resource["condition"], string> = {
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  worn: "Worn",
}

export function ResourceCard({ resource, showOwner = true }: ResourceCardProps) {
  const { addItem, isInCart } = useCartStore()
  const inCart = isInCart(resource.id)

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (resource.status !== "available") {
      toast.error("This resource is not available for borrowing")
      return
    }
    if (inCart) {
      toast.info("Already in cart")
      return
    }

    const start = new Date()
    const end = new Date()
    end.setDate(end.getDate() + 14)
    addItem(resource, start.toISOString(), end.toISOString())
    toast.success("Added to cart")
  }

  return (
    <Card className="group overflow-hidden">
      <Link to={`/resource/${resource.id}`}>
        {/* Image */}
        <div className="aspect-[4/3] overflow-hidden bg-muted relative">
          {resource.images[0] ? (
            <img
              src={resource.images[0]}
              alt={resource.title}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <BookOpen className="h-10 w-10 text-muted-foreground/40" />
            </div>
          )}
          <Badge className={cn("absolute right-2 top-2 capitalize", STATUS_STYLE[resource.status])}>
            {resource.status}
          </Badge>
        </div>

        <CardContent className="p-4">
          {/* Meta */}
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="secondary" className="capitalize">
              {resource.category.replace("-", " ")}
            </Badge>
            <span className="text-muted-foreground">{CONDITION_LABEL[resource.condition]}</span>
          </div>

          {/* Title */}
          <h3 className="mt-2 text-sm font-semibold leading-snug group-hover:text-primary transition-colors">
            {truncate(resource.title, 50)}
          </h3>

          {/* Rating */}
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
            <span className="font-medium">{resource.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">({resource.reviewCount})</span>
          </div>

          {/* Owner */}
          {showOwner && (
            <div className="mt-3 flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={resource.owner.avatar} />
                <AvatarFallback className="text-[10px]">{getInitials(resource.owner.name)}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{resource.owner.name}</span>
            </div>
          )}

          {/* Cart action */}
          {resource.status === "available" && (
            <Button
              size="sm"
              variant={inCart ? "secondary" : "default"}
              className="mt-3 w-full"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
              {inCart ? "In cart" : "Add to cart"}
            </Button>
          )}
        </CardContent>
      </Link>
    </Card>
  )
}
