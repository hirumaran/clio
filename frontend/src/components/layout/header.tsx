import { useNavigate } from "react-router-dom"
import { Menu } from "lucide-react"
import { useUIStore } from "@/stores/ui-store"
import { Button } from "@/components/ui/button"

export function Header() {
  const { setSidebarOpen } = useUIStore()

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center bg-background px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-[18px] w-[18px]" />
        <span className="sr-only">Open menu</span>
      </Button>
    </header>
  )
}
