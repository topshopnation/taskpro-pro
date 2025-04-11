
import { Moon, Sun, Monitor } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

// Simple toggle for dark/light mode only
export function ThemeToggleSimple() {
  const { theme, setTheme } = useTheme()
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <Toggle 
      pressed={theme === "dark"} 
      onPressedChange={toggleTheme}
      aria-label="Toggle dark mode"
      className="rounded-full w-10 h-10 p-0"
    >
      {theme === "dark" ? (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      )}
    </Toggle>
  )
}

// Toggle group for all theme options
export function ThemeToggleGroup() {
  const { theme, setTheme } = useTheme()

  return (
    <ToggleGroup 
      type="single" 
      value={theme} 
      onValueChange={(value) => {
        if (value) setTheme(value as "light" | "dark" | "system")
      }}
      className="border rounded-md p-1"
    >
      <ToggleGroupItem value="light" aria-label="Light mode" className="px-3">
        <Sun className="h-4 w-4 mr-2" />
        <span className="sr-only md:not-sr-only">Light</span>
      </ToggleGroupItem>
      <ToggleGroupItem value="dark" aria-label="Dark mode" className="px-3">
        <Moon className="h-4 w-4 mr-2" />
        <span className="sr-only md:not-sr-only">Dark</span>
      </ToggleGroupItem>
      <ToggleGroupItem value="system" aria-label="System mode" className="px-3">
        <Monitor className="h-4 w-4 mr-2" />
        <span className="sr-only md:not-sr-only">System</span>
      </ToggleGroupItem>
    </ToggleGroup>
  )
}

// The original dropdown implementation, but improved
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
