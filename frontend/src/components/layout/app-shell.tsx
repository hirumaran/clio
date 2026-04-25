import { Outlet } from "react-router-dom"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { useUIStore } from "@/stores/ui-store"
import { cn } from "@/lib/utils"

export default function AppShell() {
  const { sidebarOpen, sidebarCollapsed } = useUIStore()

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div
        className={cn(
          "flex flex-1 flex-col transition-[margin] duration-200",
          sidebarOpen && !sidebarCollapsed && "lg:ml-60",
          sidebarOpen && sidebarCollapsed && "lg:ml-14"
        )}
      >
        <Header />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
