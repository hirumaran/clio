import { Outlet, Link } from "react-router-dom"
import { Theater } from "lucide-react"

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      {/* Branding panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-primary p-10">
        <Link to="/" className="flex items-center gap-2">
          <Theater className="h-6 w-6 text-primary-foreground" />
          <span className="text-xl font-medium tracking-tight text-primary-foreground">Clio</span>
        </Link>

        <div className="max-w-sm space-y-4">
          <h1 className="text-3xl font-medium tracking-tight leading-tight text-primary-foreground text-balance">
            Share the spotlight with fellow drama educators
          </h1>
          <p className="text-primary-foreground/70">
            Scripts, costumes, props, and teaching resources — shared across
            your community.
          </p>
        </div>

        <p className="text-xs text-primary-foreground/50">
          Built for drama departments in Bellevue School District
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-background p-6 lg:p-10">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <Theater className="h-5 w-5 text-primary" />
            <span className="text-lg font-medium tracking-tight">Clio</span>
          </Link>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
