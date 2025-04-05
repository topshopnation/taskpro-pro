
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useIsMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/hooks/use-auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AppHeaderProps {
  title: string
  setIsMobileMenuOpen: (open: boolean) => void
  isMobileMenuOpen?: boolean
}

export default function AppHeader({ title, setIsMobileMenuOpen }: AppHeaderProps) {
  const isMobile = useIsMobile()
  const { user, signOut } = useAuth()
  
  const userInitials = user?.email 
    ? user.email.substring(0, 2).toUpperCase() 
    : "U"

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      )}
      
      <div className="flex-1">
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <ThemeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar>
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut()}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
