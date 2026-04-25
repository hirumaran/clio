import { Moon, Sun, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const cycle = () => {
    if (theme === "light") setTheme("dark")
    else if (theme === "dark") setTheme("system")
    else setTheme("light")
  }

  const icon =
    theme === "dark" ? (
      <Sun className="h-4 w-4" />
    ) : theme === "light" ? (
      <Moon className="h-4 w-4" />
    ) : (
      <Monitor className="h-4 w-4" />
    )

  const label =
    theme === "system" ? "System theme" : theme === "dark" ? "Dark theme" : "Light theme"

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={cycle}
      aria-label={label}
      title={label}
    >
      {icon}
    </Button>
  )
}
