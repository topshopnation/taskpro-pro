
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Trash2 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/use-auth"

export default function DataManagementCard() {
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const { user } = useAuth()

  const clearAllData = async () => {
    if (!user) {
      toast.error("You must be logged in to clear your data")
      return
    }

    try {
      // Delete all user's tasks
      await supabase.from('tasks').delete().eq('user_id', user.id)
      
      // Delete all user's projects
      await supabase.from('projects').delete().eq('user_id', user.id)
      
      // Delete all user's filters
      await supabase.from('filters').delete().eq('user_id', user.id)
      
      // Delete all user's tags
      await supabase.from('tags').delete().eq('user_id', user.id)
      
      toast.success("All data has been cleared successfully")
      setIsAlertOpen(false)
    } catch (error) {
      console.error("Error clearing data:", error)
      toast.error("Failed to clear data. Please try again.")
    }
  }
  
  return (
    <>
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
            <Button 
              variant="destructive" 
              onClick={() => setIsAlertOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all your tasks,
              projects, filters, and tags from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={clearAllData}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, delete everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
