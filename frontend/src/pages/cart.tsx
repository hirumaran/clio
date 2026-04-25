import { Link, useNavigate } from "react-router-dom"
import { ShoppingCart, Trash2, Calendar, ArrowRight } from "lucide-react"
import { useCartStore } from "@/stores/cart-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { formatDate, truncate, pluralize } from "@/lib/utils"
import { toast } from "sonner"

export default function CartPage() {
  const navigate = useNavigate()
  const { items, removeItem, updateItem, clearCart } = useCartStore()

  const handleSubmitRequests = () => {
    if (items.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    // In a real app, this would submit the borrow requests
    toast.success(`Submitted ${items.length} ${pluralize(items.length, "request")}!`)
    clearCart()
    navigate("/borrowing")
  }

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cart</h1>
          <p className="text-muted-foreground">
            Review and submit your borrow requests
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Browse the catalogue to find resources you&apos;d like to borrow for your
              drama classes and productions.
            </p>
            <Button asChild size="lg">
              <Link to="/catalogue">
                Browse Catalogue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cart</h1>
          <p className="text-muted-foreground">
            {items.length} {pluralize(items.length, "item")} ready to request
          </p>
        </div>
        <Button variant="outline" onClick={clearCart}>
          Clear Cart
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="h-24 w-24 rounded-md bg-muted overflow-hidden flex-shrink-0">
                    {item.resource.images[0] ? (
                      <img
                        src={item.resource.images[0]}
                        alt={item.resource.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          to={`/resource/${item.resource.id}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {truncate(item.resource.title, 50)}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          From {item.resource.owner.name}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeItem(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <Badge variant="secondary" className="mt-2 capitalize">
                      {item.resource.category.replace("-", " ")}
                    </Badge>

                    {/* Date selection */}
                    <div className="grid gap-3 sm:grid-cols-2 mt-4">
                      <div className="space-y-1">
                        <Label htmlFor={`start-${item.id}`} className="text-xs">
                          Start Date
                        </Label>
                        <Input
                          id={`start-${item.id}`}
                          type="date"
                          value={item.startDate.split("T")[0]}
                          onChange={(e) =>
                            updateItem(item.id, {
                              startDate: new Date(e.target.value).toISOString(),
                            })
                          }
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`end-${item.id}`} className="text-xs">
                          Return Date
                        </Label>
                        <Input
                          id={`end-${item.id}`}
                          type="date"
                          value={item.endDate.split("T")[0]}
                          onChange={(e) =>
                            updateItem(item.id, {
                              endDate: new Date(e.target.value).toISOString(),
                            })
                          }
                          className="h-9"
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div className="mt-3 space-y-1">
                      <Label htmlFor={`msg-${item.id}`} className="text-xs">
                        Message to owner (optional)
                      </Label>
                      <Textarea
                        id={`msg-${item.id}`}
                        placeholder="Tell the owner why you'd like to borrow this..."
                        value={item.message || ""}
                        onChange={(e) =>
                          updateItem(item.id, { message: e.target.value })
                        }
                        className="min-h-[60px] text-sm"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Request Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate pr-2">
                      {truncate(item.resource.title, 25)}
                    </span>
                    <span className="text-muted-foreground flex-shrink-0">
                      {formatDate(item.startDate).split(",")[0]}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex items-center justify-between font-medium">
                <span>Total Items</span>
                <span>{items.length}</span>
              </div>

              <div className="p-3 rounded-md bg-muted text-sm">
                <p className="font-medium mb-1">How it works</p>
                <ul className="text-muted-foreground space-y-1 text-xs">
                  <li>1. Submit your borrow requests</li>
                  <li>2. Owners review and approve/decline</li>
                  <li>3. Coordinate pickup with owner</li>
                  <li>4. Return items by the due date</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" size="lg" onClick={handleSubmitRequests}>
                <Calendar className="h-4 w-4 mr-2" />
                Submit {items.length} {pluralize(items.length, "Request")}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
