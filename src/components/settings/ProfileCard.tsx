
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
    <Card>
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
        <CardDescription>
          Manage your personal information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.avatarUrl} />
            <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-medium">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user?.email?.split("@")[0] || "User"}
            </h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onEditProfile}>
          <User className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </CardFooter>
    </Card>
  )
}
