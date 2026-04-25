import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-semibold text-primary/30 mb-4">404</p>
        <h1 className="text-2xl md:text-3xl font-medium tracking-tight mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          The page you&apos;re looking for seems to have stepped offstage. Let&apos;s get you back to the action.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button asChild>
            <Link to="/">Back to home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/catalogue">Browse catalogue</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
