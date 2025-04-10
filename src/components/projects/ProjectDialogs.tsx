
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/use-auth"

interface ProjectDialogsProps {
  projectId?: string
  isCreateTaskOpen: boolean
  setIsCreateTaskOpen: (open: boolean) => void
  isEditProjectOpen: boolean
  setIsEditProjectOpen: (open: boolean) => void
  isDeleteProjectOpen: boolean
  setIsDeleteProjectOpen: (open: boolean) => void
  isCreateSectionOpen: boolean
  setIsCreateSectionOpen: (open: boolean) => void
  newSectionName: string
  setNewSectionName: (name: string) => void
  newProjectName: string
  setNewProjectName: (name: string) => void
  projectColor: string
  setProjectColor: (color: string) => void
  projectColors?: string[]
  handleProjectRename: () => void
  handleProjectDelete: () => void
}

export function ProjectDialogs({
  projectId,
  isCreateTaskOpen,
  setIsCreateTaskOpen,
  isEditProjectOpen,
  setIsEditProjectOpen,
  isDeleteProjectOpen,
  setIsDeleteProjectOpen,
  isCreateSectionOpen,
  setIsCreateSectionOpen,
  newSectionName,
  setNewSectionName,
  newProjectName,
  setNewProjectName,
  projectColor,
  setProjectColor,
  projectColors,
  handleProjectRename,
  handleProjectDelete
}: ProjectDialogsProps) {
  const { user } = useAuth()

  const handleCreateSection = async () => {
    if (!newSectionName.trim()) {
      toast.error("Section name is required")
      return
    }

    // Create a section ID from the name (lowercase, no spaces)
    const sectionId = newSectionName.toLowerCase().replace(/\s+/g, '')
    
    // In a real app, you would create a sections table in the database
    // For now, we'll just add a task with the new section to establish it
    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          title: `${newSectionName} section created`,
          user_id: user?.id,
          project_id: projectId,
          section: sectionId
        })
        
      if (error) throw error
      
      setIsCreateSectionOpen(false)
      setNewSectionName("")
      toast.success("Section created successfully")
    } catch (error: any) {
      toast.error("Failed to create section", {
        description: error.message
      })
    }
  }

  return (
    <>
      <CreateTaskDialog 
        open={isCreateTaskOpen} 
        onOpenChange={setIsCreateTaskOpen} 
        defaultProjectId={projectId}
      />

      <Dialog open={isEditProjectOpen} onOpenChange={setIsEditProjectOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Rename Project</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="project-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Enter project name"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditProjectOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleProjectRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateSectionOpen} onOpenChange={setIsCreateSectionOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Create New Section</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="section-name"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="Enter section name"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateSectionOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSection}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteProjectOpen} onOpenChange={setIsDeleteProjectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the project and all tasks within it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleProjectDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
