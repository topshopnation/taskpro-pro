
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface ProfileCardProps {
  onEditProfile: () => void;
}

export default function ProfileCard({ onEditProfile }: ProfileCardProps) {
  const { user } = useAuth()
  
  const userInitials = user?.firstName 
    ? `${user.firstName.charAt(0)}${user.lastName ? user.lastName.charAt(0) : ''}`
    : user?.email 
      ? user.email.substring(0, 2).toUpperCase() 
      : "U"

  return (
    <Card className="overflow-hidden">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm">User Profile</CardTitle>
        <CardDescription className="text-xs">
          Manage your personal information
        </CardDescription>
      </CardHeader>
      <CardContent className="py-2 px-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user?.avatarUrl} />
            <AvatarFallback className="text-sm">{userInitials}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-medium">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user?.email?.split("@")[0] || "User"}
            </h3>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="py-2 px-4">
        <Button onClick={onEditProfile} size="sm" className="text-xs h-8">
          <User className="mr-1.5 h-3.5 w-3.5" />
          Edit Profile
        </Button>
      </CardFooter>
    </Card>
  );
}
