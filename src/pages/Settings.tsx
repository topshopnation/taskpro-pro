
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import AppLayout from "@/components/layout/AppLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Mic, Loader2, CreditCard, BadgeCheck, Star, Image, User } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { useTheme } from "@/components/theme-provider"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const { user, updateProfile } = useAuth()
  const [smartSuggestions, setSmartSuggestions] = useState(true)
  const [autoCategorizeTasks, setAutoCategorizeTasks] = useState(true)
  const [voiceInput, setVoiceInput] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [isVoiceSupported, setIsVoiceSupported] = useState(
    'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  )
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    avatarUrl: user?.avatarUrl || "",
  })
  
  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        avatarUrl: user.avatarUrl || "",
      })
    }
  }, [user])

  // Test voice recognition
  const testVoiceRecognition = () => {
    if (!isVoiceSupported) {
      toast.error("Voice recognition is not supported in your browser")
      return
    }

    setIsRecording(true)
    
    // Get SpeechRecognition constructor
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI()
      recognition.lang = 'en-US'
      recognition.continuous = false
      recognition.interimResults = false
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        toast.success(`Recognized: "${transcript}"`)
        setIsRecording(false)
      }
      
      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error)
        toast.error(`Error: ${event.error}`)
        setIsRecording(false)
      }
      
      recognition.onend = () => {
        setIsRecording(false)
      }
      
      recognition.start()
      
      // Safety timeout
      setTimeout(() => {
        if (isRecording) {
          recognition.stop()
          setIsRecording(false)
        }
      }, 10000)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingProfile(true)
    
    try {
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        avatarUrl: formData.avatarUrl,
      })
      
      setIsProfileDialogOpen(false)
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleSubscribe = () => {
    // In a real implementation, this would redirect to Stripe or other payment system
    toast.success("Redirecting to payment processor...")
    // Simulate a successful upgrade
    setTimeout(() => {
      setIsUpgradeDialogOpen(false)
      toast.success("Subscription activated! Thank you for your support.")
    }, 1500)
  }

  const clearAllData = () => {
    // This would clear all data from Supabase in a real app
    toast.success("All data has been cleared")
  }

  // Generate user initials
  const userInitials = user?.firstName 
    ? `${user.firstName.charAt(0)}${user.lastName ? user.lastName.charAt(0) : ''}`
    : user?.email 
      ? user.email.substring(0, 2).toUpperCase() 
      : "U"

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        </div>

        <div className="grid gap-6">
          {/* User Profile Card */}
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
              <Button onClick={() => setIsProfileDialogOpen(true)}>
                <User className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </CardFooter>
          </Card>

          {/* Subscription Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Subscription</CardTitle>
                  <CardDescription>
                    Manage your TaskPro subscription
                  </CardDescription>
                </div>
                <Badge variant="outline" className="ml-auto">
                  <Star className="h-3 w-3 mr-1 text-amber-500" /> Free Plan
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between border rounded-md p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-md">
                    <BadgeCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">TaskPro Pro</h4>
                    <p className="text-sm text-muted-foreground">
                      Unlock all premium features
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">$4.99</p>
                  <p className="text-xs text-muted-foreground">per month</p>
                </div>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <BadgeCheck className="h-4 w-4 text-green-500" />
                  <span>Unlimited projects and tasks</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <BadgeCheck className="h-4 w-4 text-green-500" />
                  <span>Advanced filtering and sorting</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <BadgeCheck className="h-4 w-4 text-green-500" />
                  <span>Priority customer support</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <BadgeCheck className="h-4 w-4 text-green-500" />
                  <span>Theme customization</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setIsUpgradeDialogOpen(true)}>
                <CreditCard className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how TaskPro looks on your device
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="theme">Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Select a theme for the application
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant={theme === "light" ? "default" : "outline"} 
                    onClick={() => setTheme("light")}
                  >
                    Light
                  </Button>
                  <Button 
                    variant={theme === "dark" ? "default" : "outline"} 
                    onClick={() => setTheme("dark")}
                  >
                    Dark
                  </Button>
                  <Button 
                    variant={theme === "system" ? "default" : "outline"} 
                    onClick={() => setTheme("system")}
                  >
                    System
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Smart Features</CardTitle>
              <CardDescription>
                Control the intelligent features of TaskPro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="smart-suggestions">Smart Suggestions</Label>
                  <p className="text-sm text-muted-foreground">
                    Suggest due dates and priorities based on task title
                  </p>
                </div>
                <Switch
                  id="smart-suggestions"
                  checked={smartSuggestions}
                  onCheckedChange={setSmartSuggestions}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-categorize">Auto-Categorize Tasks</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically assign tasks to projects based on keywords
                  </p>
                </div>
                <Switch
                  id="auto-categorize"
                  checked={autoCategorizeTasks}
                  onCheckedChange={setAutoCategorizeTasks}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Voice Input</CardTitle>
              <CardDescription>
                Configure voice input settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="voice-input">Enable Voice Input</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow adding tasks using voice commands
                  </p>
                </div>
                <Switch
                  id="voice-input"
                  checked={voiceInput}
                  onCheckedChange={setVoiceInput}
                  disabled={!isVoiceSupported}
                />
              </div>
              {!isVoiceSupported && (
                <p className="text-sm text-destructive">
                  Voice input is not supported in your browser.
                </p>
              )}
              {isVoiceSupported && (
                <div className="mt-4">
                  <Button onClick={testVoiceRecognition} disabled={isRecording}>
                    {isRecording ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Recording...
                      </>
                    ) : (
                      <>
                        <Mic className="mr-2 h-4 w-4" />
                        Test Voice Recognition
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Manage your TaskPro data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Clear All Data</Label>
                  <p className="text-sm text-muted-foreground">
                    Delete all tasks, projects, and settings
                  </p>
                </div>
                <Button variant="destructive" onClick={clearAllData}>
                  Clear Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Profile Edit Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your personal information and profile picture
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleProfileUpdate}>
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={formData.avatarUrl} />
                  <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Label htmlFor="avatarUrl" className="text-sm font-medium">
                    Profile Image URL
                  </Label>
                  <Input
                    id="avatarUrl"
                    value={formData.avatarUrl || ""}
                    onChange={(e) => setFormData({...formData, avatarUrl: e.target.value})}
                    placeholder="https://example.com/avatar.jpg"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName || ""}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName || ""}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email address cannot be changed
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsProfileDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdatingProfile}>
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Upgrade Dialog */}
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upgrade to TaskPro Pro</DialogTitle>
            <DialogDescription>
              Get unlimited access to all premium features for only $4.99/month
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg border p-4 mb-4">
              <div className="flex justify-between items-center mb-4">
                <div className="font-medium">TaskPro Pro</div>
                <div className="font-medium">$4.99/month</div>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <BadgeCheck className="h-4 w-4 text-green-500" />
                  <span>Unlimited projects and tasks</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <BadgeCheck className="h-4 w-4 text-green-500" />
                  <span>Advanced filtering and sorting</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <BadgeCheck className="h-4 w-4 text-green-500" />
                  <span>Priority customer support</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <BadgeCheck className="h-4 w-4 text-green-500" />
                  <span>Theme customization</span>
                </li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Cancel anytime. No long-term commitment required.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsUpgradeDialogOpen(false)}>
              Maybe Later
            </Button>
            <Button type="button" onClick={handleSubscribe}>
              <CreditCard className="mr-2 h-4 w-4" />
              Subscribe Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
